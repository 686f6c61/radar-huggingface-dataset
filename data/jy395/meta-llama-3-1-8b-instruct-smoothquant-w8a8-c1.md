# jy395/Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c1

## Resumen

Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c1 es un checkpoint cuantizado del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicado por el usuario jy395. Se trata de una cuantizacion SmoothQuant de 8 bits en pesos y activaciones (W8A8), generada con la libreria llm-compressor y almacenada en formato compressed-tensors. El modelo conserva la arquitectura original de Llama 3.1 Instruct de 8.030.261.248 parametros, pero reduce el coste de inferencia al operar en 8 bits tanto en pesos como en activaciones.

El checkpoint forma parte de una coleccion de 30 configuraciones comprimidas publicadas junto al articulo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs" (ICAIF '26), que estudia cuando la compresion post-entrenamiento de modelos financieros requiere datos de calibracion del dominio. En este caso concreto, la calibracion se realizo sobre el corpus C1 (WikiText-2, texto generico), con 128 secuencias de 2048 tokens (262.144 tokens en total), semilla 42 y consumo completo del corpus.

Su relevancia reside en que permite desplegar un Llama 3.1 8B Instruct en entornos con restricciones de memoria y ancho de banda, manteniendo el formato compatible con vLLM y transformers. Es un artefacto de investigacion orientado a reproducir los experimentos del paper, no un modelo afinado para finanzas: el tag "finance" hace referencia al contexto del estudio, no a un entrenamiento adicional sobre datos financieros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizacion SmoothQuant W8A8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens; la calibracion uso max_seq_length=2048) |
| Tipos de cuantizacion | SmoothQuant W8A8 (8 bits en pesos y activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.248 parametros. Sobre el se aplica SmoothQuant, una tecnica de cuantizacion post-entrenamiento que migra la dificultad de cuantizacion de las activaciones hacia los pesos mediante un factor de suavizado por canal, permitiendo cuantizar a 8 bits tanto pesos como activaciones (W8A8) sin reentrenamiento. La implementacion se realizo con llm-compressor y el resultado se serializa en formato compressed-tensors, cargable directamente en vLLM.

No hubo entrenamiento adicional ni ajuste fino: el proceso es exclusivamente de calibracion. El corpus de calibracion C1 es WikiText-2 (texto generico), con 128 secuencias de 2048 tokens, semilla 42 y consumo completo del corpus (262.144 tokens). El script de reproduccion es `scripts/quantization/smoothquant_w8a8.py` del repositorio github.com/JunyiYe/finance-ptc-calibration, invocado con `--calib-path data/calibration_datasets/c1_wikitext.jsonl`. No se dispone de informacion sobre el dataset de preentrenamiento original ni sobre las etapas de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y en formato instruct, heredadas del modelo base Llama 3.1 8B Instruct.
- Razonamiento general y respuesta a instrucciones multi-turno.
- Generacion de codigo y matematicas, en la medida en que lo soporta el modelo base.
- Soporte de tool calling y function calling heredado del modelo base (no verificado especificamente en este checkpoint cuantizado).
- Capacidades multilingues del modelo base (los idiomas concretos no se detallan en la informacion disponible).
- Inferencia eficiente en 8 bits para pesos y activaciones, compatible con vLLM y transformers.
- No se documentan capacidades de vision, audio ni modo thinking en este checkpoint.

## Casos de uso

- Evaluacion de compresion en dominios financieros: el checkpoint sirve como una de las 30 configuraciones del estudio ICAIF '26 para medir la degradacion de diez tareas financieras tras cuantizar con calibracion generica (WikiText-2) frente a calibracion de dominio. Es su proposito principal y el escenario para el que fue publicado.
- Despliegue de un asistente conversacional con presupuesto de VRAM reducido: al operar en W8A8, permite servir un Llama 3.1 8B Instruct en GPUs con menos memoria que la version en bf16, manteniendo compatibilidad con vLLM para produccion.
- Reproduccion de experimentos academicos: el repositorio incluye el suite de evaluacion con diez tareas financieras, de modo que un investigador puede replicar las cifras del paper cargando este checkpoint y ejecutando los scripts de evaluacion.
- Servicio de generacion de texto en pipelines de transformers: el model card muestra la carga directa con `AutoModelForCausalLM.from_pretrained(..., device_map="auto")`, lo que facilita integrarlo en prototipos existentes sin cambiar el codigo.
- Comparacion de tecnicas de cuantizacion: al existir otras configuraciones de la misma coleccion (distintos corpus de calibracion y esquemas), permite contrastar SmoothQuant W8A8 con calibracion generica frente a alternativas en igualdad de condiciones.
- Analisis de sensibilidad a datos de calibracion: util para estudiar como afecta la distribucion del corpus de calibracion al rendimiento en tareas fuera de dominio, un problema recurrente al comprimir modelos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card remite al suite de evaluacion del repositorio (diez tareas financieras) y al articulo ICAIF '26, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de las tareas financieras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse en 8 bits, los pesos ocupan aproximadamente 8 GB; el repositorio completo pesa 9,1 GB. Con overhead de activaciones y cache KV, el consumo real depende de la longitud de contexto y del batch.
- GPU recomendadas: A100 (40/80 GB), H100, L40S y GPUs profesionales con al menos 16 GB de VRAM para contextos moderados. Para contextos largos conviene 24 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (por ejemplo RTX 4080/4090) para secuencias moderadas; en 12 GB puede requerir reducir el contexto o el batch.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors, segun el model card) y transformers con `device_map="auto"`. No se confirma soporte en llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La cuantizacion W8A8 suele mejorar el throughput frente a bf16 en hardware con kernels INT8 (por ejemplo, GPUs con soporte de tensor cores INT8), pero no se aportan medidas concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c1 | 8,03 B | no disponible (base: 128k) | SmoothQuant W8A8 | Llama 3.1 Community | HuggingFace, 92 descargas |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128k | bf16/fp16 | Llama 3.1 Community | HuggingFace, ampliamente usado |
| Otras configuraciones de la coleccion ICAIF '26 (jy395) | 8,03 B (mismo base) | no disponible | distintos esquemas y corpus de calibracion | Llama 3.1 Community | HuggingFace, coleccion de 30 checkpoints |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion W8A8 introduce degradacion respecto al modelo en bf16; el paper asociado estudia precisamente cuando la calibracion generica (WikiText-2) es insuficiente para dominios especializados como finanzas.
- El tag "finance" describe el contexto de investigacion, no un entrenamiento financiero; no debe asumirse un rendimiento superior en tareas financieras frente al modelo base.
- Riesgo de alucinacion inherente al modelo base Llama 3.1 8B Instruct, no mitigado por la cuantizacion.
- Sesgos del modelo base no documentados en la informacion disponible.
- Idiomas soportados no especificados; conviene validar el comportamiento multilingue antes de usarlo en produccion.
- Licencia Llama 3.1 Community: uso comercial permitido con condiciones (politica de uso aceptable, requisitos de atribucion y denominacion "Built with Llama"); es necesario revisar el texto completo de la licencia.
- Repositorio con muy baja adopcion (92 descargas, 0 likes) y creado en 2026; no hay evidencia de validacion independiente fuera del paper.
- No se confirma compatibilidad con llama.cpp, Ollama ni TGI; el despliegue recomendado es vLLM o transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c1
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Paper (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio de codigo y evaluacion: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantizacion: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/smoothquant_w8a8.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa (30 configuraciones): https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
