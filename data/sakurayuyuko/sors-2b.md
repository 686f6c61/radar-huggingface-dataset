# SakuraYuyuko/Sors-2B

## Resumen

Sors-2B es un modelo de decisión de aproximadamente 2.200 millones de parámetros desarrollado por SakuraYuyuko (repositorio de código madousho-ai/sors). No es un modelo generativo: recibe un estado (texto libre o JSON) y un conjunto de preguntas tipadas, y devuelve una probabilidad para cada opción permitida de cada pregunta. Elimina por completo la generación de texto libre y el análisis posterior de la salida, lo que lo hace adecuado para integrarse en sistemas donde la salida debe ser estructurada y verificable.

El modelo parte del backbone de texto Qwen/Qwen3.5-2B-Base, afinado íntegramente (full fine-tune), y añade una cabeza escalar que puntúa cada opción de forma independiente. La API sigue el formato de petición y respuesta Jev / SystemOne, y la librería de referencia es `sors`. Está publicado bajo licencia Apache-2.0, con pesos en `safetensors`, y soporta inglés y chino.

Su relevancia actual radica en que cubre un nicho poco atendido: la clasificación y el ranking de opciones con menús definidos en tiempo de inferencia (hasta 255 opciones por pregunta) sin reentrenamiento, con calibración de confianza y soporte para decisiones de tipo sí/no, elección entre opciones nombradas y puntuación sobre escalas ordenadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3.5-2B) con prefijo compartido por pregunta y una rama corta por opción; cabeza escalar sobre el estado oculto final normalizado en el token `Answer:` |
| Parámetros totales | 2.213.817.152 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el servidor de referencia arranca con `--max-tokens 16384`) |
| Tipos de cuantización | no disponible (pesos publicados en BF16 para el backbone y FP32 para la cabeza) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 3,76 GB) |

## Arquitectura y entrenamiento

La arquitectura reutiliza el backbone de texto de Qwen3.5-2B-Base, afinado por completo, y lo combina con un esquema de decisión por opciones. Cada pregunta se descompone en un prefijo compartido (estado seguido de la pregunta) más un sufijo corto por opción con la forma `Option: <|D1|> <texto de la opción>` y `Answer:`. El prefijo se codifica una sola vez y se reutiliza para todas las opciones, de modo que ninguna rama ve las demás. Una cabeza escalar sobre el estado oculto final normalizado en `Answer:` produce una puntuación por opción, y la salida es un softmax restringido al menú de esa pregunta. El modelo incorpora 261 tokens especiales añadidos al tokenizador, incluidos los tokens `<|D…|>` aprendidos.

El entrenamiento se realizó exclusivamente sobre un dataset sintético propio, synth-intents-v6, con 56.990 preguntas de sí/no, opción nombrada y puntuación ordenada en 33 dominios, en inglés y chino, seleccionadas familia por familia a partir de las 516.464 preguntas de synth-intents-v5.25. El tamaño de cada familia se fijó experimentalmente: una familia dejaba de crecer cuando añadir más ejemplos no mejoraba sus propios conjuntos de validación. Cada pregunta se vio una sola vez (845 pasos con batch 72), lo que según el autor mantiene la confianza del modelo próxima a su precisión y preserva más conocimiento general del modelo base. La cabeza y el backbone se entrenan conjuntamente desde el primer paso sobre el softmax del menú de cada pregunta; las preguntas ambiguas se entrenan hacia una distribución de probabilidad, la mitad de las preguntas ocultan las descripciones de las opciones y la mitad de los menús añaden una opción "none of these". No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificación de intenciones y decisión sobre menús de opciones definidos en tiempo de inferencia, hasta 255 opciones por pregunta y sin reentrenamiento.
- Tres tipos de pregunta: `noul` (sí/no con probabilidad de verdadero), `choice` (opciones nombradas con descripción opcional) y `score` (niveles ordenados con puntuación esperada y leyenda).
- Entrada de estado en texto libre o JSON, con varias preguntas que comparten un mismo estado.
- Salida estructurada con probabilidades por opción y nivel de confianza, sin generación de texto libre ni análisis posterior.
- Independencia del orden del menú: reordenar las opciones solo reordena las puntuaciones.
- Capacidades multilingües limitadas a inglés y chino.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un modelo de decisión puro.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: el modelo recibe el mensaje del usuario como estado y un menú de intenciones (`Cancel a subscription`, `Reset a password`, `Track a shipment`), y devuelve la probabilidad de cada una, lo que permite dirigir el ticket al flujo correcto sin parsear texto generado.
- Moderación y clasificación de contenido: con preguntas de tipo `noul` se obtiene la probabilidad de que un texto cumpla una política concreta, y con preguntas `choice` se categoriza el tipo de infracción sobre un menú cerrado.
- Extracción de campos estructurados: dado un documento en JSON como estado, se lanzan varias preguntas `choice` y `score` en una sola petición para obtener etiquetas y niveles (por ejemplo, urgencia o sentimiento) con confianza asociada.
- Triaje de soporte técnico: combinación de una pregunta `choice` sobre el área del problema y una pregunta `score` sobre la severidad, aprovechando que varias preguntas comparten el mismo estado y el prefijo se codifica una sola vez.
- Enrutamiento en agentes y pipelines: el modelo actúa como cabecera de decisión que selecciona la siguiente herramienta o acción de un conjunto acotado, devolviendo una distribución que el orquestador puede usar con umbrales de confianza.
- Clasificación con menús dinámicos: en sistemas donde las categorías cambian por cliente o por despliegue, el menú se define en cada petición sin reentrenar, lo que evita mantener un modelo por taxonomía.
- Evaluación de riesgo con escala ordenada: preguntas `score` sobre niveles definidos por el equipo permiten obtener una puntuación esperada y su leyenda para priorizar revisiones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona conjuntos de evaluación (MASSIVE, Banking77, BoolQ y JevBench) únicamente para documentar que no participaron en el entrenamiento y que no comparten texto idéntico tras la normalización, pero no incluye cifras de rendimiento.

## Requisitos de hardware

- Pesos publicados: 3,76 GB en `model.safetensors` (backbone en BF16, cabeza en FP32); el repositorio completo ocupa 15,9 GB.
- El autor indica que el modelo se probó con `torch` 2.14 y `transformers` 5.17 sobre una única A100 de 40 GB.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los pesos en BF16, un despliegue en precisión de entrenamiento requiere del orden de 4-6 GB solo para pesos, más memoria para activaciones y el prefijo compartido.
- No se documenta compatibilidad con GPU de consumo, aunque el tamaño de los pesos sugiere que podría caber en tarjetas de 8-12 GB en BF16; no hay confirmación del autor.
- Opciones de despliegue: el runtime propio `sors` (`scripts/serve.py` con `--init`, `--max-tokens`, `--warmup` y `--port`), que expone `POST /v1/systemone`; también hay API de Python mediante `sors.serve.engine.load_engine`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sors-2B | 2.213.817.152 | no disponible | Probabilidades por opción (menú definido en la petición) | Apache-2.0 | Hugging Face + runtime `sors` |
| Qwen3.5-2B-Base | ~2B (modelo base) | no disponible | Texto generativo libre | no disponible en la información | Hugging Face |
| Modelos de clasificación de texto genéricos | variable | variable | Etiqueta fija entrenada | variable | variable |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Solo admite inglés y chino; no hay soporte documentado de castellano ni de otros idiomas.
- Es un modelo de decisión, no generativo: no puede producir texto libre, código ni razonamiento abierto.
- La ventana de contexto no está publicada; el valor `--max-tokens 16384` del servidor de referencia es un parámetro de arranque, no una especificación confirmada del modelo.
- El entrenamiento se basa exclusivamente en datos sintéticos propios (synth-intents-v6); el autor reconoce que el dataset aún no está publicado y que se liberará cuando esté depurado, lo que limita la reproducibilidad.
- La calibración de la confianza depende del régimen de entrenamiento de una sola pasada por pregunta; no hay datos públicos que verifiquen su comportamiento fuera de los dominios de entrenamiento.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de sobreconfianza en opciones fuera de distribución o en estados muy alejados de los 33 dominios cubiertos.
- No se documentan sesgos conocidos; al entrenarse con datos sintéticos en inglés y chino, la cobertura de matices culturales y lingüísticos es limitada.
- Licencia Apache-2.0, que permite uso comercial, pero el runtime `sors` se distribuye en un repositorio separado cuya licencia no se detalla en la información disponible.
- El modelo requiere el runtime específico `sors`; no hay evidencia de compatibilidad con pilas de inferencia estándar, lo que aumenta el coste de integración y el riesgo de dependencia de un ecosistema joven.
- El modelo tiene 57 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy baja y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SakuraYuyuko/Sors-2B
- Repositorio de código: https://github.com/madousho-ai/sors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Diagrama de arquitectura: https://raw.githubusercontent.com/madousho-ai/sors/main/docs/sors-architecture.svg
