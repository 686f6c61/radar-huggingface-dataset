# jy395/Meta-Llama-3.1-70B-Instruct-rtn-w4a16

## Resumen

Meta-Llama-3.1-70B-Instruct-rtn-w4a16 es una version cuantizada del modelo meta-llama/Meta-Llama-3.1-70B-Instruct, publicada por el usuario jy395. La compresion aplicada es RTN (round-to-nearest) de 4 bits en pesos con activaciones en 16 bits (W4A16) y sin datos de calibracion, realizada mediante la herramienta llm-compressor del ecosistema vLLM. El checkpoint resultante se distribuye en formato compressed-tensors y se carga directamente en vLLM o en transformers.

El modelo forma parte de una coleccion de 30 configuraciones comprimidas publicadas junto al articulo cientifico "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs" (ICAIF '26), que estudia cuando la compresion post-entrenamiento de modelos de lenguaje orientados a finanzas requiere datos de calibracion alineados con el dominio. Esta variante RTN actua como referencia libre de calibracion frente a otras configuraciones del mismo estudio.

La relevancia practica es doble: por un lado, reduce el peso en disco del modelo de 70B a aproximadamente 39,5 GB, lo que facilita su despliegue en infraestructura mas modesta; por otro, sirve como punto de comparacion metodologico para evaluar el impacto de la cuantizacion sin calibracion en tareas financieras. El repositorio declara 11.193.820.256 parametros en sus safetensors, un dato que no coincide con el tamano nominal de 70B del modelo base y que conviene verificar antes de asumir capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 70B Instruct); cuantizacion W4A16 con compressed-tensors |
| Parametros totales | 11.193.820.256 segun safetensors del repo (el modelo base declara 70B; discrepancia no aclarada en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K tokens) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), RTN sin calibracion |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors en formato compressed-tensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Llama 3.1 70B Instruct, con atencion por grupos (GQA) y RoPE, aunque la model card no detalla la configuracion interna. La unica transformacion aplicada es la cuantizacion post-entrenamiento RTN W4A16: los pesos se redondean al vecino mas cercano en 4 bits sin usar corpus de calibracion, mientras que las activaciones se mantienen en 16 bits. El script de generacion es `scripts/quantization/rtn_w4a16.py` del repositorio finance-ptc-calibration y la herramienta empleada es llm-compressor.

No se proporcionan datos sobre el entrenamiento original (numero de tokens, composicion del dataset, fases de RLHF o DPO), ya que corresponden al modelo base de Meta y no se reproducen en esta model card. La innovacion tecnica del checkpoint es precisamente la ausencia de calibracion: el estudio del que forma parte analiza en que medida la cuantizacion sin datos de dominio degrada el rendimiento en tareas financieras y si la recuperacion depende de la calibracion. El checkpoint se etiqueta con el tag "finance", lo que sugiere que su evaluacion se orienta a ese dominio.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo base Llama 3.1 70B Instruct.
- Razonamiento y respuesta a prompts multi-turno en formato chat (pipeline text-generation).
- Capacidades financieras: el checkpoint se publica dentro de un estudio sobre compresion de LLM financieros y se evalua con una suite de diez tareas de ese dominio.
- Carga directa en vLLM y en transformers mediante `AutoModelForCausalLM`, segun la model card.
- Tool calling y function calling: no confirmado en la informacion disponible (el modelo base lo soporta, pero la cuantizacion puede afectar a su fiabilidad).
- Capacidades de agente y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Evaluacion de compresion en finanzas: usar el checkpoint como referencia RTN sin calibracion para medir la degradacion frente a configuraciones calibradas del mismo estudio en las diez tareas financieras de la suite de evaluacion.
- Despliegue de bajo coste en vLLM: al reducir el peso a unos 39,5 GB, permite servir un modelo derivado de Llama 3.1 70B en GPUs con menos memoria que las necesarias para el modelo en BF16, con carga nativa en vLLM.
- Analisis de documentos financieros: generar resumenes y extraer informacion de informes y memorias anuales, aprovechando el ajuste de instrucciones del modelo base y su etiquetado financiero.
- Reproduccion de investigacion: replicar los experimentos del articulo ICAIF '26 cargando este checkpoint junto al resto de la coleccion de 30 configuraciones comprimidas.
- Prototipado de asistentes conversacionales: construir demos multi-turno con transformers y `device_map="auto"` sin necesidad de infraestructura de calibracion.
- Comparacion de pipelines de cuantizacion: contrastar RTN W4A16 sin calibracion con metodos que si usan datos de dominio para decidir el pipeline de compresion en produccion.
- Generacion de texto general en ingles: tareas de redaccion y respuesta a instrucciones heredadas del modelo base, siempre que la perdida por cuantizacion sea aceptable para el caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la suite de evaluacion del repositorio finance-ptc-calibration para reproducir las diez tareas financieras del articulo, pero no incluye cifras en el repositorio de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 39,5 GB en safetensors W4A16; en vLLM se necesita ademas memoria para el KV cache, por lo que se recomienda al menos 48 GB de VRAM para contextos moderados.
- GPU recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para despliegue comodo; A100 40 GB puede resultar insuficiente segun la longitud de contexto.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en esta configuracion W4A16; requeriria cuantizaciones adicionales o descarga por capas.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors) y transformers con `device_map="auto"`; llama.cpp, Ollama y TGI no estan confirmados para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-70B-Instruct-rtn-w4a16 | 11,19B segun safetensors (base 70B) | no disponible | W4A16 RTN sin calibracion | Llama 3.1 Community | Hugging Face, 114 descargas |
| meta-llama/Meta-Llama-3.1-70B-Instruct | 70B | 128K tokens | BF16/FP16 | Llama 3.1 Community | Hugging Face oficial |
| Otras configuraciones de la coleccion ICAIF '26 (jy395) | variable | no disponible | distintas tecnicas con calibracion | Llama 3.1 Community | Hugging Face, coleccion financiera |

La comparativa con modelos de otros autores no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia principal es el menor peso en disco y la perdida potencial de calidad por la cuantizacion de 4 bits sin calibracion; frente al resto de la coleccion, la diferencia es el metodo de compresion (RTN frente a variantes con datos de calibracion).

## Limitaciones y advertencias

- Discrepancia de parametros: los safetensors declaran 11,19B parametros frente a los 70B del modelo base; no se explica en la model card y debe verificarse antes de asumir el comportamiento del modelo original.
- Cuantizacion sin calibracion: RTN W4A16 puede degradar la calidad en tareas de dominio financiero; el propio articulo estudia cuando la calibracion es necesaria, por lo que no se recomienda asumir paridad con el modelo base.
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion de 4 bits.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base de Meta.
- Idiomas: no se especifican; el modelo base esta orientado principalmente al ingles.
- Tool calling y comportamiento agentico: no confirmados tras la cuantizacion.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y requisitos de atribucion; revisar los terminos antes de desplegar en produccion.
- Madurez: repositorio con 0 likes y 114 descargas, creado y actualizado el mismo dia (31 de octubre de 2026), sin senales de validacion comunitaria.
- Formato: compressed-tensors limita la compatibilidad a vLLM y transformers recientes; no hay confirmacion de soporte en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-70B-Instruct-rtn-w4a16
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct
- Articulo ICAIF '26: https://doi.org/10.1145/3858063.3858724
- Repositorio de codigo: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantizacion RTN: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/rtn_w4a16.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
