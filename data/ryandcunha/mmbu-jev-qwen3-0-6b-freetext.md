# ryandcunha/mmbu-jev-qwen3-0.6b-freetext

## Resumen

mmbu-jev-qwen3-0.6b-freetext es un decisor de tipo "System One" construido con la librería any2jev sobre el modelo base Qwen/Qwen3-0.6B. No es un modelo generativo: recibe un estado (texto de entrada) y devuelve respuestas tipadas Choice, Score o Noul acompañadas de probabilidades calibradas, todo en una única pasada forward y sin generar ni un solo token de texto. El autor es el usuario de HuggingFace ryandcunha, y el repositorio se publica bajo licencia Apache-2.0 como proyecto independiente, sin afiliación con TypeSafe AI.

El paquete contiene un adaptador LoRA de rango 16 entrenado sobre Qwen3-0.6B con la cabeza de vocabulario eliminada, una cabeza pointer de dimensión 256 almacenada en head.safetensors, el tokenizador del modelo base y un fichero de configuración any2jev.json con delimitadores, modo "packed" y una temperatura de 1,073 ajustada sobre validación. El entrenamiento empleó 10,6 millones de parámetros entrenables durante 1,0 época, con learning rate 0,0002 y batch 4 x 4, y se completó en unos 7 minutos en una única GPU de consumo.

Su relevancia actual es la de los modelos decisores especializados: frente a un LLM generativo del mismo tamaño, esta aproximación resuelve tareas de enrutamiento, clasificación y triaje con una sola pasada forward, sin decodificación autorregresiva y con probabilidades calibradas, lo que abarata la inferencia en pipelines de agentes donde hay que tomar muchas decisiones cortas y de bajo coste. El contrapeso es su alcance: el propio autor advierte de que se entrenó con unos pocos miles de decisiones etiquetadas provenientes de un puñado de fuentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen3-0.6B) como base, con la cabeza de vocabulario eliminada, adaptador LoRA (r=16) y cabeza pointer de dimensión 256 |
| Parámetros totales | 0,6 B en el modelo base; 10,6 M parámetros entrenables en el adaptador |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información del repositorio (heredada de Qwen/Qwen3-0.6B) |
| Tipos de cuantización | No disponible; el repositorio solo distribuye safetensors y no documenta GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter/ y head.safetensors) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | text-classification |
| Librería | any2jev |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-0.6B, un transformer denso de tipo decoder-only, al que se le retira la cabeza de vocabulario: el modelo deja de poder emitir tokens y pasa a comportarse como un extractor de representaciones para decisión. Sobre esa base se entrena un adaptador LoRA de rango 16, y la puntuación final de cada opción la produce una cabeza pointer de dimensión 256 (head.safetensors) que compara las opciones contra un token de decisión. La configuración de inferencia vive en any2jev.json, que define los delimitadores, el modo "packed" y una temperatura de 1,073 ajustada sobre el conjunto de validación para calibrar las probabilidades.

El entrenamiento usó data/train.jsonl con 10,6 millones de parámetros entrenables, 1,0 época, learning rate 0,0002 y batch de 4 x 4, y se completó en aproximadamente 7 minutos sobre una GPU de consumo. Los detalles completos de configuración, historial y métricas sobre el conjunto reservado se distribuyen en train_report.json y eval.json, aunque el repositorio no publica los valores numéricos de esas métricas. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; el autor indica únicamente que se usaron unos pocos miles de decisiones etiquetadas de un puñado de fuentes.

## Capacidades

- Emisión de respuestas tipadas: Choice (elección entre un conjunto de opciones), Score y Noul, con probabilidades calibradas asociadas a cada una.
- Decisión en una única pasada forward, sin decodificación autorregresiva y sin generar texto.
- Resolución simultánea de varias preguntas sobre el mismo estado de entrada; el ejemplo de la model card combina una pregunta de tipo --choice ("Which team? | billing, technical, sales") con una de tipo --noul ("Is this urgent?").
- Puntuación de opciones definidas en tiempo de inferencia: las alternativas se pasan como texto, sin necesidad de reentrenar para cambiar el conjunto de etiquetas.
- Servicio HTTP mediante `any2jev serve` con el endpoint POST /v1/systemone y compatibilidad con el SDK TypeSafe.
- Uso por línea de comandos mediante `any2jev ask`.
- Tool calling, function calling, razonamiento multi-paso, agentes, visión, audio y modo de pensamiento: no soportados (no es un modelo generativo ni multimodal).
- Capacidades multilingües: no disponibles en la información del repositorio.

## Casos de uso

- Enrutamiento de tickets de soporte: el decisor recibe el texto de la incidencia y elige entre categorías como billing, technical o sales, devolviendo además la probabilidad de cada opción para poder derivar a revisión humana cuando la confianza sea baja.
- Triaje de urgencia en atención al cliente: usando una pregunta de tipo Noul se puede marcar si un caso es urgente o no, con una sola pasada forward, lo que permite ejecutar el filtro sobre todo el volumen de entrada antes de cualquier procesamiento más caro.
- Enrutamiento de herramientas en agentes: dado el estado de la conversación, el modelo selecciona qué herramienta o qué subagente debe invocarse, reduciendo la necesidad de llamar a un LLM generativo solo para decidir el siguiente paso.
- Clasificación masiva de documentos con esquemas cambiantes: como las opciones se especifican en la propia llamada, se puede reclasificar un corpus con nuevas taxonomías sin reentrenar el modelo.
- Moderación y aplicación de políticas: decisiones binarias o multiclase sobre si un contenido incumple una norma, con probabilidad calibrada para fijar umbrales operativos.
- Priorización y scoring de leads o incidencias: el tipo de respuesta Score permite ordenar elementos por relevancia o riesgo dentro de un pipeline de negocio.
- Cascada de coste en producción: actuar como primer nivel de decisión y escalar a un modelo mayor solo cuando la probabilidad calibrada quede por debajo de un umbral, reduciendo el gasto en inferencia.
- Procesamiento por lotes de alto volumen: al tratarse de un modelo de 0,6 B con adaptador de 0,1 GB y sin decodificación autoregresiva, es apto para clasificar grandes volúmenes en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un fichero eval.json con métricas sobre el conjunto reservado y un train_report.json con el historial de entrenamiento, pero sus valores numéricos no se detallan en la información proporcionada. La model card se limita a indicar que la precisión obtenida debe esperarse en entradas similares al conjunto de entrenamiento y será inferior fuera de distribución.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,3 GB en FP16 (0,6 B del modelo base más los 10,6 M parámetros del adaptador y la cabeza de 256 dimensiones, de peso despreciable); aproximadamente 0,7 GB en cuantización de 8 bits y 0,4 GB en 4 bits, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM es suficiente; no se requiere A100, H100 ni hardware de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente toda la gama actual (RTX 3060, RTX 4060, RTX 4090 y equivalentes), e incluso en CPU para cargas por lotes tolerantes a latencia.
- Opciones de despliegue: `any2jev serve` (endpoint POST /v1/systemone, compatible con el SDK TypeSafe) y `any2jev ask` por línea de comandos, según la documentación del autor; el repositorio no documenta integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras medidas. Al no existir decodificación autorregresiva y resolverse todo en una pasada forward, la latencia por decisión es estructuralmente inferior a la de un modelo generativo del mismo tamaño, pero no se publica ninguna medición.
- Coste de entrenamiento: 7 minutos en una única GPU de consumo, según el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mmbu-jev-qwen3-0.6b-freetext | Decisor no generativo (LoRA r=16 + cabeza pointer) | 0,6 B base + 10,6 M entrenables | No disponible | No disponible | Apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen3-0.6B | LLM generativo denso | 0,6 B | 32.768 tokens según la especificación del modelo base | Benchmarks publicados por el desarrollador del modelo base | Apache-2.0 | Ampliamente extendido |
| Qwen3-0.6B con cabeza de clasificación supervisada | Clasificador entrenado a medida sobre el mismo base | 0,6 B | El del modelo base | Depende del dataset de entrenamiento | Apache-2.0 | Requiere entrenamiento propio |

La diferencia funcional frente a las dos alternativas no está en el tamaño sino en el contrato de salida: las opciones comparadas o bien generan texto y obligan a parsear la respuesta, o bien devuelven logits sobre un conjunto fijo de clases, mientras que este modelo devuelve Choice, Score o Noul con probabilidades calibradas y admite opciones nuevas en tiempo de inferencia. No se dispone de datos de rendimiento de ninguno de los tres modelos aplicados a la misma tarea, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Entrenado con unos pocos miles de decisiones etiquetadas procedentes de un puñado de fuentes; la precisión decae fuera de la distribución de entrenamiento, tal y como advierte el propio autor.
- Las probabilidades están calibradas sobre el split de validación, no son una garantía por respuesta individual.
- El autor recomienda explícitamente mantener la aritmética, las fechas y el conteo en código, en línea con las recomendaciones de la documentación de Jev.
- No genera texto: cualquier caso de uso que requiera respuesta redactada necesita un modelo generativo adicional.
- Idiomas soportados no documentados; no hay evidencia publicada de comportamiento multilingüe.
- No soporta tool calling, agentes, visión ni audio.
- Sesgos conocidos: no documentados en la información disponible, aunque al derivar de Qwen3-0.6B y de un conjunto de datos reducido y no descrito, cabe esperar sesgos propios del corpus de entrenamiento.
- Riesgo de alucinación: al no generar texto, la alucinación en sentido clásico no aplica, pero sí existe riesgo de respuestas mal calibradas o directamente erróneas si la entrada se aleja de la distribución de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, sin garantías por parte del autor.
- Madurez: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día, por lo que no cuenta con validación independiente de la comunidad.
- Es un proyecto independiente y no está afiliado a TypeSafe AI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryandcunha/mmbu-jev-qwen3-0.6b-freetext
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de la librería any2jev: https://github.com/hwfengcs/any2jev
