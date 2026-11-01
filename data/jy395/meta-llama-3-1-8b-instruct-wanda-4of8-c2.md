# jy395/Meta-Llama-3.1-8B-Instruct-wanda-4of8-c2

## Resumen

Meta-Llama-3.1-8B-Instruct-wanda-4of8-c2 es un checkpoint comprimido del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicado por el usuario jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones comprimidas que acompanan al articulo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs" (ICAIF '26). La compresion aplicada es una poda semiestructurada Wanda 4:8, es decir, se conservan 4 de cada 8 pesos por grupo con los pesos almacenados en formato denso, calibrada sobre el corpus C2 (texto web generico de C4).

El interes del modelo es metodologico: forma parte de un estudio sistematico sobre como la eleccion del corpus de calibracion (generico frente a financiero) afecta a la degradacion de modelos del dominio financiero tras la compresion post-entrenamiento. Este checkpoint concreto sirve como referencia de calibracion generica frente a las variantes calibradas con datos financieros del mismo estudio.

Arquitectura transformer decoder-only de 8.030.261.248 parametros (identicos al modelo base, ya que la poda 4:8 se almacena densa), contexto nativo de 128.000 tokens heredado de Llama 3.1, y licencia Llama 3.1 Community License. No incorpora pesos cuantizados de menor precision en el repositorio: el ahorro proviene de la mascara de poda, no del almacenamiento comprimido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos densos con mascara de poda Wanda 4:8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base; no verificado en la model card) |
| Tipos de cuantizacion | no disponible en el repositorio (formato compressed-tensors con poda 4:8; admite cuantizacion posterior, no documentada) |
| Idiomas soportados | no disponible (heredados del modelo base: principalmente ingles, con soporte multilingue de Llama 3.1) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors con metadatos compressed-tensors |
| Corpus de calibracion | C2: C4 web text (generico), 128 secuencias x 2048 tokens = 262.144 tokens, seed 42 |
| Herramienta de compresion | llm-compressor (script `wanda_4of8.py`) |
| Tamano del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only con atencion por grupos (GQA) y RoPE, entrenado por Meta con un pipeline que incluye preentrenamiento masivo, ajuste supervisado y optimizacion por preferencias (RLHF/DPO). Sobre ese checkpoint, este repositorio aplica una poda semiestructurada Wanda 4:8: para cada grupo de 8 pesos se retienen los 4 de menor magnitud ponderada por activacion, calculada a partir de un corpus de calibracion. Los pesos podados se almacenan densos (con ceros), por lo que el numero de parametros declarados no disminuye, aunque el coste efectivo de calculo puede reducirse si el backend explota el patron 4:8.

La calibracion se realizo con el corpus C2 (texto web generico de C4), con consumo completo del corpus, `max_seq_length=2048` y semilla 42, mediante el script `wanda_4of8.py` del repositorio `JunyiYe/finance-ptc-calibration`. No se realizo un reentrenamiento posterior a la poda ni un ajuste fino de recuperacion segun la informacion disponible; el estudio compara precisamente la recuperacion tras compresion en funcion del corpus de calibracion.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo Instruct base.
- Razonamiento multi-paso y matematicas basicas (capacidad del modelo base, degradada de forma no cuantificada por la poda 4:8).
- Generacion de codigo (capacidad del modelo base).
- Tool calling y function calling segun el formato de Llama 3.1 Instruct.
- Soporte de agentes y razonamiento multi-turno con contexto largo (hasta 128.000 tokens en el modelo base).
- Capacidades multilingues del modelo base (principalmente ingles; el resto de idiomas no esta documentado en esta ficha).
- Capacidad especifica del checkpoint: servir como referencia de calibracion generica en experimentos de compresion de LLM financieros.

## Casos de uso

- Investigacion en compresion de LLM: usar este checkpoint como linea base de calibracion generica (C4) frente a variantes calibradas con corpus financiero, para medir la perdida de rendimiento atribuible al desajuste de dominio.
- Evaluacion de poda semiestructurada: comparar el patron Wanda 4:8 con otras tecnicas (SparseGPT, cuantizacion) sobre las diez tareas financieras del suite de evaluacion del paper.
- Despliegue en vLLM: el checkpoint en formato compressed-tensors carga directamente en vLLM, lo que permite servirlo como endpoint de generacion con la reduccion de coste computacional que ofrezca el backend para el patron 4:8.
- Prototipado de asistentes financieros: punto de partida para experimentar con modelos de dominio financiero comprimidos antes de decidir si merece la pena un corpus de calibracion especifico.
- Analisis de sensibilidad a la calibracion: replicar el protocolo (128 secuencias x 2048 tokens, seed 42) con otros corpus y comparar la degradacion en tareas como analisis de sentimiento financiero o extraccion de entidades.
- Docencia y experimentacion: al ser un derivado de Llama 3.1 8B, se puede cargar en transformers con `device_map="auto"` y ejecutar en una unica GPU de gama alta para reproducir los experimentos del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al suite de evaluacion del repositorio `JunyiYe/finance-ptc-calibration` (diez tareas financieras) y al articulo ICAIF '26, pero no incluye cifras concretas en la ficha de HuggingFace.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (bf16/fp16): aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM estimada con cuantizacion posterior a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits: alrededor de 4-5 GB de pesos (no documentado en el repositorio; estimacion a partir del numero de parametros).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y en RTX 3090 (24 GB) en bf16; en GPUs de 16 GB requerira cuantizacion adicional o contexto reducido.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `AutoModelForCausalLM`, y previsiblemente llama.cpp/Ollama tras conversion a GGUF (no documentado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-wanda-4of8-c2 | 8,03 B (densos con poda 4:8) | 128.000 (heredado) | Wanda 4:8, calibracion C4 | Llama 3.1 | HuggingFace (165 descargas) |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 | ninguna | Llama 3.1 | HuggingFace (oficial) |
| Variantes del mismo estudio calibradas con corpus financiero | 8,03 B | 128.000 | Wanda 4:8 u otras | Llama 3.1 | Coleccion jy395 en HuggingFace |
| Otras podas 4:8 de Llama 3.1 8B (SparseGPT, etc.) | 8,03 B | 128.000 | 4:8 alternativas | Llama 3.1 | segun publicacion |

La comparacion cuantitativa de rendimiento entre estas variantes no esta disponible en la informacion proporcionada; el articulo ICAIF '26 es la referencia para esos datos.

## Limitaciones y advertencias

- La poda 4:8 introduce degradacion de calidad respecto al modelo base; la magnitud no esta cuantificada en la model card para este checkpoint concreto.
- El corpus de calibracion es generico (C4), no financiero; el propio estudio sugiere que en dominios especializados la calibracion con datos del dominio puede reducir la perdida.
- Riesgo de alucinacion heredado del modelo base, potencialmente amplificado por la compresion.
- Sesgos conocidos del modelo base Llama 3.1 (sesgos de genero, raza y geograficos en los datos de entrenamiento); no se documenta ningun mitigado adicional en este checkpoint.
- Idiomas soportados no documentados en esta ficha; el modelo base esta optimizado para ingles.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones (incluida la clausula de 700 millones de usuarios mensuales y requisitos de atribucion "Built with Llama").
- El checkpoint esta pensado para investigacion en compresion; no se recomienda como sustituto de produccion del modelo base sin una evaluacion propia en el caso de uso concreto.
- El formato compressed-tensors requiere versiones recientes de vLLM o transformers; backends sin soporte del patron 4:8 no aprovecharan la reduccion de calculo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-wanda-4of8-c2
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Articulo ICAIF '26: https://doi.org/10.1145/3858063.3858724
- Repositorio de codigo, corpus y evaluacion: https://github.com/JunyiYe/finance-ptc-calibration
- Script de compresion Wanda 4:8: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/wanda_4of8.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa de configuraciones comprimidas: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
