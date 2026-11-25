# AnkitAI/tinyjev-0.6b

## Resumen

TinyJev 0.6B es un modelo de decisión tipada desarrollado por AnkitAI, un fine-tune del modelo base Qwen/Qwen3-0.6B-Base. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un estado (un ticket, un registro, una línea de log) junto con una serie de preguntas y las respuestas aceptadas para cada una, y devuelve una probabilidad calibrada para cada opción. El modelo nunca genera nada que no se le haya ofrecido, lo que elimina por diseño el riesgo de respuestas fuera de formato.

El modelo implementa cuatro tipos de decisión: `Choice` (selección entre opciones con probabilidad por opción), `Noul` (verificación de veracidad de una afirmación), `Score` (posicionamiento en una escala ordenada) y confianza calibrada para que un umbral tenga significado operativo. Con 596 millones de parámetros y aproximadamente 1,2 GB de pesos, está pensado para ejecutarse íntegramente en local, con soporte de MLX en Apple Silicon y PyTorch en el resto de plataformas.

Su relevancia actual radica en la propuesta de "system-one": resolver decisiones estructuradas en un único forward pass, en lugar de encadenar generación de tokens. Frente a un LLM generativo que debe escribir JSON token a token, TinyJev devuelve todas las decisiones de un caso en una sola pasada, con latencias del orden de decenas o centenares de milisegundos en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-0.6B-Base), con cabeza de clasificación de decisión tipada |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen3-0.6B-Base |
| Dataset de entrenamiento | jaredpalmer/kev-suites |
| Tamaño del repositorio | 1,2 GB |
| Librería | transformers |
| Descargas / likes | 320 / 3 |

## Arquitectura y entrenamiento

TinyJev parte de Qwen3-0.6B-Base, un transformer denso de 596 millones de parámetros, y lo fine-tunea para una tarea de clasificación tipada en lugar de generación de texto. La innovación central es la cabeza de decisión: en lugar de producir tokens, el modelo puntúa cada opción candidata proporcionada por el usuario y devuelve una distribución de probabilidad sobre ellas. El modelo no puede responder con algo distinto de las opciones ofrecidas, porque nunca genera texto.

El entrenamiento se realizó sobre el dataset `jaredpalmer/kev-suites`, según declara el autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card menciona que la confianza está calibrada, lo que sugiere un proceso de calibración posterior al entrenamiento, aunque no se detalla el método. El modelo se distribuye con soporte dual: MLX para Apple Silicon y PyTorch para el resto de plataformas, con funcionamiento completamente offline.

## Capacidades

- Decisión tipada `Choice`: selecciona una opción de una lista y devuelve una probabilidad para cada una.
- Verificación de veracidad `Noul`: mide si una afirmación es verdadera.
- Puntuación ordenada `Score`: sitúa un estado en una escala ordenada.
- Confianza calibrada: los umbrales de decisión tienen significado estadístico.
- Salida restringida: nunca genera texto libre, solo puntúa las opciones proporcionadas.
- Procesamiento por lotes de decisiones: múltiples preguntas sobre un mismo estado se resuelven en un único forward pass.
- Ejecución local offline, sin dependencia de API.
- Soporte de MLX (Apple Silicon) y PyTorch.
- Integración con `text-embeddings-inference` y endpoints compatibles.
- No soporta tool calling, agentes autónomos, visión, audio ni razonamiento multi-paso generativo.

## Casos de uso

- Triaje de tickets de soporte: dado un ticket, el modelo responde en una sola pasada a preguntas como qué equipo debe atenderlo, qué prioridad tiene y qué quiere el cliente. La model card documenta una demo con doce decisiones sobre un mismo ticket resueltas en 596 ms, con 10 de 12 aciertos.
- Enrutamiento de incidencias en producción: a partir de una línea de log o un registro de error, el modelo puntúa categorías de destino y permite aplicar un umbral de confianza calibrada para derivar automáticamente los casos ambiguos a revisión humana.
- Clasificación de registros estructurados: para pipelines ETL donde cada registro debe etiquetarse según un conjunto cerrado de categorías, el modelo evita el coste de generar JSON con un LLM y garantiza que la salida siempre es una de las etiquetas válidas.
- Verificación de afirmaciones en flujos de datos: usando `Noul`, se puede comprobar si una aserción extraída de un documento o de una respuesta es verdadera respecto al estado proporcionado, con una probabilidad asociada.
- Puntuación de severidad o calidad: con `Score`, el modelo sitúa un estado en una escala ordenada (por ejemplo, gravedad de un incidente o calidad de un registro), adecuado para sistemas de alerta temprana.
- Decisión en el borde o en local: con 1,2 GB de pesos, puede desplegarse en un portátil con Apple Silicon vía MLX o en cualquier máquina con PyTorch, sin conexión a internet, para aplicaciones con requisitos de privacidad o latencia estricta.
- Control de agentes en entornos simulados: la model card incluye una demo con VizDoom en la que el modelo elige tácticas a partir de estado numérico estructurado (salud, munición, posiciones de enemigos), aunque el propio autor advierte que es una demo y no un benchmark.

## Benchmarks y rendimiento

La model card presenta resultados sobre OD-500, un conjunto de 500 casos nunca vistos procedentes de 25 dominios, con todas las probabilidades registradas en el repositorio del proyecto. La latencia se midió en un Apple M1 base (16 GB) vía MLX, con un forward pass por caso.

| Modelo | Parámetros | OD-500 | Gate 0.85 | ms / caso |
|---|---:|---:|---|---:|
| TinyJev 0.6B | 596M | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

El extracto de la model card disponible se interrumpe en la tabla de modelos, por lo que los valores concretos de OD-500, Gate 0.85 y latencia para TinyJev no pueden citarse con exactitud. Los datos cualitativos sí están documentados en las demos: seis decisiones de seis dominios no vistos, 6 de 6 correctas, 86 ms por pregunta en un M1 base, frente a 2.042 ms por pregunta de un LLM generativo que escribe JSON. En la demo de doce decisiones sobre un ticket: 596 ms y 10 de 12 correctas. En la demo de triaje de ocho tickets con tres preguntas cada uno: aproximadamente 110 ms por ticket. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en precisión nativa (tamaño de los pesos safetensors); en FP16 sería del orden de 1,2 GB, y en cuantizaciones de 8 o 4 bits podría reducirse por debajo de 1 GB, aunque el autor no documenta cuantizaciones específicas.
- GPU recomendadas: no se especifican; el modelo está validado en Apple Silicon (M1 base, 16 GB) vía MLX y en PyTorch sobre cualquier plataforma.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 2 GB o más de VRAM debería poder alojarlo en precisión nativa.
- Opciones de despliegue: MLX (Apple Silicon), PyTorch/transformers, `text-embeddings-inference` y endpoints compatibles. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en M1 base vía MLX, 86 ms por pregunta en la demo de seis decisiones y unos 110 ms por ticket en la demo de triaje; 596 ms para doce decisiones sobre un mismo caso en un solo forward pass.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyJev 0.6B | 596M | no disponible | Decisión tipada, sin generación | MIT | Hugging Face, PyPI |
| Qwen3-0.6B-Base | 0,6B | no disponible | Generación de texto | no disponible en esta ficha | Hugging Face |
| LLM generativo con salida JSON (p. ej. GPT-6 Sol, según la demo del autor) | no disponible | no disponible | Generación token a token | propietaria | API |

La comparación más directa es con su modelo base Qwen3-0.6B-Base: TinyJev hereda la arquitectura pero sustituye la generación por una cabeza de clasificación tipada, lo que restringe la salida y reduce la latencia a un único forward pass. Frente a un LLM generativo que produce JSON, la diferencia medida por el autor es de 86 ms frente a 2.042 ms por pregunta, a costa de perder la flexibilidad de la generación libre. No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo procesa inglés; no hay soporte multilingüe declarado.
- No genera texto: solo puede responder dentro del conjunto de opciones proporcionadas. No sirve para tareas generativas, resumen, traducción ni conversación abierta.
- No soporta tool calling, agentes autónomos ni razonamiento multi-paso generativo.
- La model card advierte que, en estado numérico estructurado, la respuesta apenas varía con la entrada; la demo de VizDoom no es un benchmark y el enrutador basado en reglas hace el trabajo principal del juego.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la calibración de probabilidades puede degradarse fuera de la distribución de entrenamiento; los umbrales deben validarse en el dominio de despliegue.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de mitigación.
- Licencia MIT: permite uso comercial, modificación y redistribución, con la obligación habitual de incluir el aviso de copyright y la licencia.
- No se documentan cuantizaciones oficiales ni longitud de contexto, lo que limita la planificación de despliegues con entradas largas.
- El proyecto es reciente (creado en septiembre de 2026) y con pocas descargas (320); la madurez y el soporte comunitario son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnkitAI/tinyjev-0.6b
- Repositorio GitHub: https://github.com/ankit-aglawe/tinyjev
- Paquete PyPI: https://pypi.org/project/tinyjev/
- Ejemplos: https://github.com/ankit-aglawe/tinyjev/tree/main/examples
- Benchmarks OpenDecision: https://github.com/ankit-aglawe/tinyjev/tree/main/benchmarks/opendecision
- README en chino simplificado: https://github.com/ankit-aglawe/tinyjev/blob/main/README.zh-CN.md
- README en japonés: https://github.com/ankit-aglawe/tinyjev/blob/main/README.ja.md
- README en coreano: https://github.com/ankit-aglawe/tinyjev/blob/main/README.ko.md
- Licencia: https://github.com/ankit-aglawe/tinyjev/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset: https://huggingface.co/datasets/jaredpalmer/kev-suites
