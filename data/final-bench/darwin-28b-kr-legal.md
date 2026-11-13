# FINAL-Bench/Darwin-28B-KR-Legal

## Resumen

Darwin-28B-KR-Legal es un modelo de lenguaje multimodal especializado en derecho coreano, desarrollado por VIDRAFT (publicado bajo la organizacion FINAL-Bench). Se construye mediante un ajuste fino supervisado (SFT) sobre Darwin-28B-KR, que a su vez deriva de la arquitectura Qwen3.5-27B de Alibaba Qwen. El modelo resuelve el problema de la escasez de asistentes legales en coreano con cobertura amplia de ramas del derecho, incorporando jurisprudencia, articulado legal y catorce anos de examenes de acceso a la abogacia coreana.

Tecnicamente es un transformer hibrido con atencion completa y atencion lineal, 64 capas, tamano oculto de 5120 y un vocabulario de 248.320 tokens. Cuenta con 26.895.998.464 parametros reales (etiquetado comercialmente como 28B) y un contexto declarado de entre 8K y 32K tokens segun el entorno de despliegue. Su relevancia actual radica en ser una de las pocas alternativas abiertas con licencia Apache 2.0 orientadas a un dominio juridico no anglosajon, con soporte multimodal de entrada imagen-texto.

El modelo se distribuye en bfloat16 (aproximadamente 53-55 GB en disco) y esta pensado para despliegue en GPU de gama alta. La familia Darwin se presenta en el paper arXiv:2605.14386.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer hibrido: atencion completa + atencion lineal) |
| Parametros totales | 26.895.998.464 (~26,9B; etiquetado comercial 28B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 8K-32K segun entorno de despliegue; 8192 recomendado en vLLM |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, ~53 GB) |
| Tamano oculto | 5120 |
| Numero de capas | 64 |
| Tamano de vocabulario | 248.320 |
| Modalidad | image-text-to-text (entrada multimodal) |
| Modelo base | FINAL-Bench/Darwin-28B-KR |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3_5ForConditionalGeneration, un transformer hibrido que combina capas de atencion completa con capas de atencion lineal, lo que reduce el coste computacional en secuencias largas manteniendo capacidad de recuperacion de contexto. Con 64 capas y un tamano oculto de 5120, el modelo se situa en el rango de 27-28B parametros densos. La cabecera de generacion condicional permite procesar entradas de imagen y texto, si bien la especializacion principal es la generacion de texto juridico.

El entrenamiento parte de Darwin-28B-KR, resultado de una cadena de fusiones de la familia Darwin (Darwin-27B-Opus, Darwin-27B-KR y una fusion V7 con conciencia de arquitectura). Sobre esa base se aplica un SFT de dominio juridico en formato ChatML con un corpus que incluye decenas de miles de resoluciones judiciales coreanas, tareas de clasificacion, resumen y prediccion de decisiones, catorce anos de examenes de abogacia (civil, penal, derecho publico y etica) y datos de identidad del propio modelo. No se documenta en la informacion disponible el uso de RLHF o DPO, ni el numero exacto de tokens de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento juridico en coreano con alta especializacion.
- Analisis y resumen de jurisprudencia y resoluciones judiciales.
- Cita e interpretacion de articulos legales.
- Resolucion de preguntas tipo examen de abogacia coreano (formato objetivo).
- Asesoramiento legal preliminar en multiples ramas: civil, penal, constitucional, administrativo, mercantil, laboral, inmobiliario, propiedad intelectual y etica profesional.
- Razonamiento en ingles con calidad declarada algo inferior a la coreana.
- Entrada multimodal imagen-texto (procesamiento de imagenes junto a texto).
- Generacion conversacional multi-turno en formato ChatML.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Modo thinking explicito: no disponible.

## Casos de uso

- Analisis de jurisprudencia: dado el texto de una sentencia, el modelo genera resumenes estructurados y extrae los fundamentos juridicos aplicados, aprovechando su entrenamiento sobre decenas de miles de resoluciones del corpus LBox.
- Asistencia en preparacion del examen de abogacia: resuelve preguntas objetivas de las convocatorias de los ultimos catorce anos y explica la fundamentacion de cada opcion, util para plataformas de formacion juridica.
- Borrador de documentos legales: genera primeros borradores de contratos, demandas y escritos de contestacion en coreano, que el profesional revisa y adapta, reduciendo el tiempo de redaccion inicial.
- Clasificacion y triaje de consultas legales: en un bufete o servicio de orientacion, el modelo categoriza consultas entrantes por rama del derecho y estima su complejidad antes de derivarlas a un especialista.
- Simulacion de escenarios judiciales: a partir de un supuesto de hecho, el modelo propone los articulos aplicables y una prediccion razonada del sentido de la decision, util para formacion interna de despachos.
- Extraccion de informacion de documentos escaneados: gracias a su entrada multimodal, puede procesar imagenes de documentos legales y extraer clausulas o datos relevantes para su posterior analisis textual.
- Soporte a la docencia juridica: genera explicaciones adaptadas a estudiantes sobre conceptos como contratos, responsabilidad extracontractual o derecho de familia, con referencias al articulado coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM minima estimada: aproximadamente 55 GB para inferencia en bfloat16.
- GPU recomendadas: NVIDIA Blackwell (B200) como opcion optima; NVIDIA Hopper (H100/H200) como recomendada.
- GPU Ada (L40S): uso posible pero ajustado por los 53 GB de pesos en BF16.
- Generaciones Ampere y anteriores: VRAM insuficiente segun el autor.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) sin cuantizacion, y no se documentan pesos cuantizados en la informacion disponible.
- Opciones de despliegue: vLLM con `--trust-remote-code`, `--enforce-eager`, `--max-model-len 8192` y `--gpu-memory-utilization 0.85`; compatible con clientes OpenAI mediante endpoint `/v1`. Soporte de llama.cpp, Ollama o TGI no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Especializacion |
|---|---|---|---|---|---|
| Darwin-28B-KR-Legal | ~26,9B | 8K-32K | Coreano, ingles | Apache 2.0 | Derecho coreano, multimodal |
| Darwin-28B-KR | ~28B | no disponible | Coreano | Apache 2.0 | Proposito general coreano |
| Qwen3.5-27B | ~27B | no disponible | Multilingue | no disponible | Proposito general |
| Modelos legales abiertos en ingles (p. ej. familias tipo Legal-Llama) | variable | variable | Ingles | variable | Derecho anglosajon |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible al no haberse publicado benchmarks. Frente a Darwin-28B-KR, este modelo anade la especializacion juridica manteniendo la misma base y licencia. Frente a Qwen3.5-27B, hereda la arquitectura pero sustituye el enfoque multilingue general por un dominio concreto en coreano.

## Limitaciones y advertencias

- El modelo no constituye asesoramiento juridico real; el propio autor advierte que las respuestas son orientativas y requieren validacion por un profesional colegiado.
- Riesgo de alucinacion en citas de articulos, numeros de sentencia o jurisprudencia, especialmente en casos poco representados en el corpus de entrenamiento.
- Cobertura limitada a derecho coreano; su utilidad fuera de ese ordenamiento es marginal.
- Sesgos potenciales derivados del corpus de jurisprudencia publica, que puede sobrerrepresentar determinados tribunales, materias o periodos historicos.
- Soporte de idiomas restringido a coreano e ingles; no se garantiza calidad en otras lenguas.
- Contexto efectivo limitado a 8K en la configuracion recomendada de vLLM, insuficiente para expedientes completos de gran volumen sin fragmentacion previa.
- Requisitos de hardware elevados (55 GB de VRAM en BF16) que excluyen el despliegue en GPU de consumo sin cuantizacion, y no se ofrecen pesos cuantizados oficiales.
- No se documentan mecanismos de tool calling ni de razonamiento agentico, lo que limita su integracion en pipelines automatizados complejos.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal derivada de las respuestas recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-28B-KR-Legal
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-28B-KR
- Paper de la familia Darwin: https://huggingface.co/papers/2605.14386
- Dataset LBox Open: https://huggingface.co/datasets/lbox/lbox_open
- Dataset KBL: https://huggingface.co/datasets/lbox/kbl
- Demo en CPU (familia POCKET): https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Coleccion POCKET: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- POCKET-35B GGUF: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-KR MLX (iPhone): https://huggingface.co/FINAL-Bench/POCKET-KR-MLX
- POCKET-EN GGUF: https://huggingface.co/FINAL-Bench/POCKET-EN-GGUF
