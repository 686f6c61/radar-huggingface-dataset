# NaimaVahab/LUNA-FM-BPE-2k

## Resumen

LUNA-FM-BPE-2k es un modelo de lenguaje especializado en ARN no codificante largo (lncRNA), desarrollado por NaimaVahab y colaboradores (He, Sarwar y Tyagi) y descrito en la publicacion "LUNA-FM: a subword foundation model for long non-coding RNAs for functional inference" en Taylor & Francis. Se trata de un modelo de fundacion (foundation model) orientado a la inferencia funcional sobre secuencias de lncRNA, un dominio donde los modelos genomicos genericos suelen rendir por debajo de lo deseable por la enorme longitud y la baja densidad de senal de estas secuencias.

El modelo se construye sobre la arquitectura ModernBERT, un transformer encoder con atencion de contexto largo y mejoras de eficiencia respecto a BERT clasico, y emplea tokenizacion BPE (Byte Pair Encoding) con un vocabulario de 2k tokens, de ahi el sufijo del nombre. Cuenta con 112.497.152 parametros totales segun los pesos en safetensors, lo que lo situa en la escala de los encoders de ~110M, manejable en hardware de consumo.

Su relevancia actual reside en la creciente demanda de modelos de fundacion especificos de dominio en biologia computacional: en lugar de adaptar un modelo generalista, LUNA-FM propone un encoder entrenado sobre subpalabras de secuencias de lncRNA para tareas de inferencia funcional, lo que puede facilitar la clasificacion, anotacion y priorizacion de estas moleculas en flujos de investigacion genomica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 112.497.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias genomicas, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LUNA-FM-BPE-2k se basa en ModernBERT, la familia de encoders transformer que incorpora mejoras como rotary position embeddings (RoPE), atencion con alternancia local/global y kernels optimizados para contextos largos. El modelo emplea un tokenizador BPE con vocabulario de 2.000 tokens, adaptado al alfabeto de nucleotidos y a patrones de subpalabra en secuencias de lncRNA, en lugar de la tokenizacion por caracter o por k-meros habitual en modelos genomicos.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del corpus (bases de datos como NONCODE, LNCipedia o GENCODE), ni sobre si se aplicaron fases de ajuste supervisado o preferencias (RLHF/DPO). Tampoco se documentan innovaciones adicionales mas alla de la eleccion de ModernBERT como backbone y del esquema BPE de subpalabras aplicado a secuencias de ARN. Toda esta informacion figura como no disponible.

## Capacidades

- Modelado de representaciones de secuencias de lncRNA mediante un encoder transformer.
- Extraccion de embeddings contextuales por token de subpalabra para tareas downstream (clasificacion, regresion, similitud de secuencias).
- Inferencia funcional sobre lncRNA, segun el titulo de la publicacion asociada.
- Soporte de fine-tuning para tareas especificas de genomica computacional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue en el sentido de lenguas naturales.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Clasificacion funcional de lncRNA: el modelo puede ajustarse con una cabeza de clasificacion sobre los embeddings del encoder para predecir familias funcionales o tejidos de expresion a partir de la secuencia.
- Anotacion automatica de transcritos en pipelines genomicos: integrado como etapa de representacion en flujos de anotacion, permite priorizar candidatos antes de validacion experimental.
- Busqueda de similitud semantica entre secuencias: los embeddings del encoder pueden indexarse para recuperar lncRNA con patrones funcionales proximos, util en estudios de evolucion y conservacion.
- Deteccion de lncRNA asociados a enfermedad: fine-tuning sobre cohortes con etiquetas clinicas para generar puntuaciones de riesgo o asociacion.
- Preentrenamiento como base para modelos de dominio: al ser un encoder de ~112M parametros, sirve como inicializacion para tareas de genomica que requieran contexto largo y recursos limitados.
- Investigacion en tokenizacion genomica: el esquema BPE de 2k tokens permite estudiar el impacto de la granularidad subpalabra frente a k-meros en tareas de inferencia funcional.
- Despliegue en entornos con GPU de consumo: su tamano permite ejecutar inferencia y fine-tuning en una sola GPU, lo que facilita su uso en laboratorios con infraestructura limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 450 MB para los pesos (112,5M parametros x 4 bytes), mas overhead de activaciones.
- VRAM estimada en fp16/bf16: aproximadamente 225 MB para los pesos.
- Cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequenos.
- Fine-tuning completo viable en GPUs de 8-16 GB; fine-tuning con LoRA en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (PyTorch), vLLM no aplica de forma directa por ser encoder; ONNX Runtime y TorchScript son alternativas razonables.
- Latencia y throughput estimados: no disponibles; dependen de la longitud de contexto, que no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUNA-FM-BPE-2k | 112,5M | no disponible | lncRNA | no disponible | Hugging Face |
| DNABERT-2 | ~117M | ~12k pb (segun version) | ADN genomico | MIT (segun version) | Hugging Face |
| Nucleotide Transformer (50M) | ~50M | ~1k-6k pb | ADN genomico | no disponible en la informacion | Hugging Face |
| ModernBERT-base | ~149M | 8.192 tokens | lenguaje natural | Apache 2.0 | Hugging Face |

La comparacion con DNABERT-2 y Nucleotide Transformer es orientativa: ambos son encoders genomicos de escala similar, pero entrenados sobre ADN y con tokenizacion por k-meros, no sobre lncRNA con BPE de subpalabras. No se dispone de datos de rendimiento comparativo para LUNA-FM-BPE-2k.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al operar sobre secuencias genomicas, los sesgos derivarian de la composicion del corpus de entrenamiento, que no se detalla.
- Riesgo de alucinacion no aplicable en el sentido generativo clasico (es un encoder), pero si de sobreconfianza en representaciones para secuencias fuera de la distribucion de entrenamiento.
- Longitud de contexto no documentada: limita la planificacion de uso con transcritos largos.
- Idiomas y cobertura de especies no documentados; no se garantiza generalizacion fuera de las especies presentes en el corpus.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- Modelo con muy pocas descargas (11) y sin likes, lo que sugiere validacion externa limitada.
- No se documentan procesos de evaluacion independiente ni resultados de benchmarks.

## Enlaces

- Hugging Face: https://huggingface.co/NaimaVahab/LUNA-FM-BPE-2k
- Publicacion: LUNA-FM: a subword foundation model for long non-coding RNAs for functional inference. Taylor & Francis. Vahab, Naima; He, Estrid; Sarwar, Tabinda; Tyagi, Sonika. (enlace directo no disponible en la informacion proporcionada)
