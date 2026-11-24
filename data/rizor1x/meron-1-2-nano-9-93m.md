# Rizor1x/Meron-1.2-Nano-9.93M

## Resumen

Meron 1.2 Nano 9.93M es un modelo de lenguaje base en ingles desarrollado por Rizor1x, orientado a completado de texto y razonamiento simbolico en el segmento de modelos por debajo de los 10 millones de parametros. Se trata de un transformer denso de arquitectura LLaMA con 11 capas fisicas y un bucle recurrente de 2 pasadas que da lugar a 22 capas efectivas de razonamiento, con 9.932.544 parametros activos en cada token.

El modelo emplea atencion estandar con Grouped Query Attention (8 cabezas de consulta y 2 de clave/valor), capas feedforward SwiGLU, pre-normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). Su ventana de contexto es de 1.024 tokens y su vocabulario de 4.096 tokens, lo que lo situa en el terreno de los SLM (small language models) para edge computing y experimentacion.

La relevancia de esta release reside en su tamano extremadamente reducido (repo de 0,1 GB, pesos BF16 en safetensors) y en una receta de entrenamiento de aproximadamente 3,73 mil millones de tokens procesados sobre texto general, ciencia, aritmetica y datos educativos. Se distribuye bajo licencia Apache 2.0 con implementacion nativa en Transformers, sin necesidad de codigo personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo LLaMA con bucle recurrente de 2 pasadas (11 capas fisicas, 22 efectivas) |
| Parametros totales | 9.932.544 |
| Parametros activos | no aplica (modelo denso, todos los parametros activos por token) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (la model card solo menciona pesos BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Meron 1.2 Nano 9.93M es un modelo autoregresivo denso de arquitectura LLaMA. Cada bloque usa atencion multi-cabeza con GQA (8 cabezas de consulta, 2 de clave/valor), feedforward SwiGLU, RMSNorm como pre-normalizacion y RoPE para la codificacion posicional. El detalle diferencial es el bucle recurrente de 2 pasadas: el modelo tiene 11 capas fisicas que se aplican dos veces, lo que resulta en 22 capas efectivas de profundidad de razonamiento sin incrementar el numero de parametros. La dimension oculta es de 256 y el vocabulario de 4.096 tokens. Al ser denso, no hay enrutamiento de expertos ni conmutacion: los 9,93 millones de parametros se activan en cada token.

El entrenamiento se realizo sobre aproximadamente 3,73 mil millones de tokens procesados, combinando flujos de texto general, ciencia, aritmetica y datos educativos. La model card no especifica si hubo fases de RLHF o DPO, ni detalla la composicion exacta del dataset mas alla de esas categorias. El autor indica que se aplico un filtrado estricto de 13-gramas para descontaminar la superposicion entre entrenamiento y evaluacion.

## Capacidades

- Generacion de texto y completado autoregresivo en ingles.
- Razonamiento simbolico y aritmetico basico, segun la orientacion declarada del modelo hacia datos de matematicas y educacion.
- Razonamiento multi-paso limitado gracias al bucle recurrente de 2 pasadas (22 capas efectivas).
- Modelo base: no incluye ajuste por instrucciones ni formato de chat.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: solo ingles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Completado de texto en entornos con recursos muy limitados: el modelo cabe en cualquier dispositivo con unos pocos megabytes de memoria, lo que permite autocompletado local en navegadores, moviles o microcontroladores con suficiente RAM.
- Experimentacion academica con arquitecturas recurrentes: el bucle de 2 pasadas sobre 11 capas fisicas permite estudiar el efecto de la profundidad efectiva sin aumentar parametros, util para investigacion sobre eficiencia en SLM.
- Generacion de ejercicios aritmeticos simples: dado su entrenamiento en flujos de aritmetica y datos educativos, puede usarse como generador de problemas basicos o como banco de pruebas de razonamiento numerico en modelos minusculos.
- Prototipado rapido de pipelines de NLP: al cargarse nativamente en Transformers sin codigo personalizado, sirve para validar infraestructura de inferencia (tokenizacion, batching con left padding, atencion enmascarada) antes de escalar a modelos mayores.
- Educacion y divulgacion: su tamano permite ejecutarlo en cuadernos interactivos o demos web para explicar el funcionamiento interno de un transformer LLaMA con atencion GQA y RoPE.
- Baseline para comparativas de SLM: util como referencia en la division sub-10M de parametros frente a modelos como Meron 1.1 Nano 7.87M, Meron Nano 5.41M o Ethoric 10M.
- Generacion de texto corto en sistemas embebidos: con contexto de 1.024 tokens y pesos BF16, encaja en tareas de completado de frases o etiquetado ligero en dispositivos edge.

## Benchmarks y rendimiento

La model card referencia una tabla de benchmarks en formato SVG (`Meron-Benchmark-Table.svg`) con resultados de evaluacion zero-shot en la division sub-10M, pero los valores numericos no estan disponibles en la informacion proporcionada. Los conjuntos de evaluacion pueden diferir entre modelos segun advierte el propio autor.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 MB en BF16 (9,93M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 100 MB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona en CPU sin problema. Una RTX 4090 o A100 no aportan ventaja significativa frente a hardware mucho menor.
- Cabe en GPU consumer: si, en cualquier GPU consumer, e incluso en iGPU y en CPU. Tambien es viable en dispositivos edge.
- Opciones de despliegue: Transformers nativo (recomendado por el autor, con `trust_remote_code=True` y `dtype=torch.bfloat16`); llama.cpp, Ollama, vLLM o TGI no estan confirmados en la informacion disponible, aunque al ser safetensors estandar podrian requerir conversion previa.
- Latencia y throughput estimados: no disponibles. Dado el tamano, la latencia sera muy baja en cualquier hardware, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meron 1.2 Nano 9.93M | 9,93M | 1.024 | LLaMA denso con bucle recurrente 2 pasadas | Apache 2.0 | Hugging Face |
| Meron 1.1 Nano 7.87M | 7,87M | no disponible | no disponible | no disponible | Hugging Face |
| Meron Nano 5.41M | 5,41M | no disponible | no disponible | no disponible | Hugging Face |
| Ethoric 10M | ~10M | no disponible | no disponible | no disponible | Hugging Face |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada; la model card remite a una tabla SVG cuyos valores no se han podido extraer.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes ni mantiene formato de chat de forma fiable.
- Generacion libre propensa a repeticiones de frases y a respuestas incorrectas, incluido en tareas de razonamiento complejo, segun admite el autor.
- Ventana de contexto muy limitada (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ingles: no soporta otros idiomas.
- Riesgo elevado de alucinacion por el reducido volumen de entrenamiento (3,73 mil millones de tokens) y el tamano del modelo.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre texto general y educativo sin filtros descritos mas alla de la descontaminacion por 13-gramas, puede reflejar sesgos del corpus.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas hacen desaconsejable su uso en produccion para tareas que requieran fiabilidad.
- No se documentan tipos de cuantizacion ni soporte en runtimes alternativos a Transformers, lo que puede limitar el despliegue en algunos entornos.
- El campo `custom_code` en los tags sugiere que puede requerir `trust_remote_code=True`, con la consiguiente necesidad de revisar el codigo remoto antes de ejecutarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Rizor1x/Meron-1.2-Nano-9.93M
- Modelo predecesor Meron 1.1 Nano 7.87M: https://huggingface.co/Rizor1x/Meron-1.1-Nano-7.87M
- Modelo predecesor Meron Nano 5.41M: https://huggingface.co/Rizor1x/Meron-Nano-5.41M
- Modelo comparable Ethoric 10M: https://huggingface.co/techdotus/Ethoric-10M
