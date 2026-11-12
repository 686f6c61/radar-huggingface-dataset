# Balab2021/Qwen3.8-27B-Cricket-Reasoning-Rhea-LoRA

## Resumen

Qwen3.8-27B-Cricket-Reasoning-Rhea-LoRA es un adaptador LoRA desarrollado por Balab2021 sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un ajuste fino parametrizado eficientemente (PEFT) orientado a un dominio muy concreto: el razonamiento sobre cricket T20 International. El adaptador se entrena para producir trazas de razonamiento verificadas en modo thinking sobre preguntas de cricket como run rate, chase rate, hitos, proyecciones, strike rate y bolas legales.

El modelo resuelve un problema de especializacion vertical: alinear un LLM de proposito general con el vocabulario y las operaciones aritmeticas propias del analisis de cricket, manteniendo el conocimiento del modelo base. Es relevante para equipos de analitica deportiva que necesiten un asistente capaz de razonar paso a paso sobre estadisticas de partidos sin reentrenar un modelo completo.

El adaptador se publica como repositorio PEFT con pesos safetensors (0,9 GB), lo que indica un rango LoRA moderado y una huella de almacenamiento pequena frente al modelo base. La informacion publicada es escasa: no hay resultados de benchmarks, ni evaluacion de exactitud de respuestas, ni datos de licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; el adaptador cubre proyecciones de atencion, Gated-DeltaNet y MLP |
| Parametros totales | no disponible (adaptador LoRA r=32, alpha=64; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 6144 tokens (longitud maxima de secuencia usada en entrenamiento); contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer del que no se detallan en la informacion disponible ni el numero exacto de capas, ni la composicion del dataset de preentrenamiento, ni si emplea mezcla de expertos. La configuracion LoRA usa rango 32, alpha 64 y dropout 0,05, e inyecta adaptadores en las proyecciones de atencion, en las capas Gated-DeltaNet y en las proyecciones MLP del modelo base. La mencion a Gated-DeltaNet sugiere que el modelo base incorpora componentes de estado recurrente o hibridos, aunque la informacion proporcionada no lo confirma.

El entrenamiento se realizo durante una epoca sobre el split de entrenamiento del dataset Balab2021/CricketData-T20-Reasoning-Qwen3.8-Full, con 1.788 pasos de optimizador, batch global de 256, learning rate 0,0001 con schedule coseno y 3% de warmup, precision bf16 y longitud maxima de 6144 tokens. Se ejecuto en 8 nodos de 4 NVIDIA Vera Rubin GPUs (32 GPUs en total) con DDP durante aproximadamente 4,5 horas. Cada secuencia de entrenamiento sigue el formato de chat en modo thinking (system + user) seguido de `reasoning + "\n</think>\n\n" + response`, y la perdida se calcula solo sobre el razonamiento y la respuesta, no sobre el prompt. La perdida final de validacion fue 0,3126 sobre 1.000 filas reservadas.

## Capacidades

- Generacion de texto con razonamiento paso a paso en modo thinking sobre preguntas de cricket T20 International.
- Calculo de metricas de cricket: run rate, chase rate, proyecciones, strike rate, hitos y bolas legales.
- Produccion de trazas de razonamiento verificadas, segun el dataset de entrenamiento.
- Hereda las capacidades del modelo base Qwen3.8-27B, aunque no se documentan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el modo thinking sugiere cadenas de razonamiento, pero no hay evaluacion.
- Capacidades multilingues: no disponibles.
- Capacidades de vision, audio u otras modalidades: no disponibles (el ejemplo de uso emplea `AutoModelForImageTextToText`, lo que sugiere un modelo base multimodal, pero no se confirma).

## Casos de uso

- Analisis de partidos en directo: el adaptador puede calcular run rate requerido y chase rate a partir de marcadores parciales, razonando paso a paso en modo thinking, lo que facilita la trazabilidad de cada calculo para comentaristas o analistas.
- Generacion de resumenes estadisticos post-partido: dado un conjunto de eventos, el modelo produce narrativas con proyecciones e hitos alcanzados, util para medios deportivos que necesitan texto rapido y verificable.
- Asistente para apostadores y fantasy cricket: responde consultas sobre strike rate, bolas legales restantes y proyecciones de puntuacion, con razonamiento intermedio que permite auditar la logica.
- Herramienta educativa para analistas noveles: al exponer la traza de razonamiento, sirve para ensenar como se calculan metricas de cricket T20 y verificar la metodologia.
- Integracion en pipelines de scouting: el adaptador puede procesar lotes de preguntas sobre jugadores y situaciones de juego, generando informes estructurados para departamentos de rendimiento.
- Chatbot de estadisticas para aficionados: desplegado sobre el modelo base, responde preguntas en lenguaje natural sobre cricket T20 manteniendo el contexto de la conversacion dentro de la ventana de 6144 tokens usada en entrenamiento.
- Prototipado de asistentes de dominio deportivo: sirve como plantilla para adaptar Qwen3.8-27B a otros deportes mediante LoRA, dado el bajo coste de almacenamiento (0,9 GB) y el flujo de entrenamiento documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion final de 0,3126 sobre 1.000 filas reservadas del dataset de entrenamiento. La exactitud de respuestas y la longitud de razonamiento en el split de benchmark no han sido evaluadas segun la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade una huella pequena (0,9 GB en safetensors), pero requiere cargar el modelo base Qwen3.8-27B. En bf16, el modelo base de 27B necesita aproximadamente 54 GB de VRAM solo para pesos, mas memoria para el adaptador y el contexto.
- GPU recomendadas: para bf16 sin cuantizar, A100 80 GB, H100 80 GB o configuraciones multi-GPU. El entrenamiento se realizo en 32 NVIDIA Vera Rubin GPUs, lo que indica requisitos de computo elevados para el ajuste.
- Cabe en consumer GPU: no en bf16. Con cuantizacion del modelo base (por ejemplo, 4 bits) podria caber en una RTX 4090 de 24 GB, aunque no se documenta compatibilidad del adaptador con cuantizacion.
- Opciones de despliegue: el ejemplo oficial usa transformers con PEFT y `device_map="auto"`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la integracion de adaptadores LoRA en estos motores requiere conversion adicional no descrita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (adaptadores LoRA especializados en razonamiento sobre cricket T20). Como referencia del modelo base, Qwen/Qwen3.8-27B es el unico punto de comparacion documentado, pero no se dispone de sus especificaciones ni de sus resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador solo se ha entrenado para preguntas de cricket T20 International; su rendimiento fuera de ese dominio no esta evaluado y podria degradar las capacidades generales del modelo base.
- Sin evaluacion de exactitud: no se han medido la precision de las respuestas ni la calidad del razonamiento en el split de benchmark, solo la perdida de validacion.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar estadisticas o calculos plausibles pero incorrectos, especialmente si los datos de entrada son incompletos o ambiguos.
- Dependencia del modo thinking: el adaptador fue entrenado exclusivamente con salidas en modo thinking (`enable_thinking=True`); usarlo sin ese modo puede producir resultados degradados.
- Licencia no disponible: no se especifica la licencia del adaptador ni las restricciones de uso comercial; el modelo base Qwen3.8-27B tiene su propia licencia que debe consultarse por separado.
- Idiomas no documentados: no se especifica que idiomas soporta el adaptador; el dataset de entrenamiento parece estar en ingles, lo que puede limitar el rendimiento en castellano u otros idiomas.
- Ventana de contexto limitada en entrenamiento: las secuencias se limitaron a 6144 tokens, por lo que conversaciones o contextos mas largos pueden degradar la calidad.
- Sin datos de sesgos: no se ha documentado ningun analisis de sesgos del adaptador ni del dataset de entrenamiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Balab2021/Qwen3.8-27B-Cricket-Reasoning-Rhea-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/Balab2021/CricketData-T20-Reasoning-Qwen3.8-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio PEFT: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
