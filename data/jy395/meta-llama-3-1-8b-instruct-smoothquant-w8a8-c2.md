# jy395/Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c2

## Resumen

Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c2 es una versión cuantizada del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicada por el usuario jy395 (Junyi Ye y colaboradores). Aplica cuantización SmoothQuant de 8 bits tanto en pesos como en activaciones (W8A8) sobre el checkpoint original de Meta, con el objetivo de reducir la huella de memoria y acelerar la inferencia manteniendo la calidad del modelo de referencia.

El checkpoint forma parte de una colección de 30 configuraciones comprimidas publicadas junto al artículo «Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs» (ICAIF '26), que estudia cuándo la compresión post-entrenamiento de modelos de lenguaje financieros requiere datos de calibración del dominio. Esta variante concreta se calibró sobre C2, un corpus de texto web genérico (C4), y sirve como referencia de calibración «fuera de dominio» frente a otras variantes calibradas con datos financieros.

Arquitectura transformer decoder-only de 8.030.261.248 parámetros con una ventana de contexto de 128.000 tokens (heredada de Llama 3.1), pesos en formato compressed-tensors y licencia Llama 3.1. Su relevancia es doble: por un lado ofrece un Llama 3.1 8B Instruct cuantizado listo para vLLM; por otro, es un artefacto de investigación para estudiar el impacto de la calibración en la compresión de modelos aplicados a finanzas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizacion SmoothQuant W8A8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1) |
| Tipos de cuantizacion | W8A8 (8 bits en pesos y activaciones), formato compressed-tensors |
| Idiomas soportados | no disponible en la model card (el modelo base Llama 3.1 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors / compressed-tensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3.1-8B-Instruct, un transformer decoder-only con atención por grupos (GQA), RoPE y ventana de contexto de 128.000 tokens, afinado con instrucciones mediante SFT y RLHF por Meta. Sobre ese checkpoint se aplica una cuantización post-entrenamiento SmoothQuant en precisión W8A8 (8 bits para pesos y activaciones) mediante la librería llm-compressor del proyecto vLLM. SmoothQuant migra la dificultad de cuantización de las activaciones hacia los pesos mediante un factor de escala por canal, lo que permite cuantizar activaciones a 8 bits sin degradar excesivamente la calidad.

La calibración se realizó sobre el corpus C2 (texto web de C4), con 128 secuencias de 2.048 tokens (262.144 tokens en total), consumiendo el corpus completo y generándolo con semilla 42. El script de producción es `scripts/quantization/smoothquant_w8a8.py` del repositorio github.com/JunyiYe/finance-ptc-calibration, invocado con `--calib-path data/calibration_datasets/c2_c4web.jsonl`. No se realizó entrenamiento adicional ni ajuste fino: es exclusivamente una compresión post-entrenamiento del modelo Instruct original.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo Instruct de Meta.
- Razonamiento multi-paso y resolución de problemas, con soporte de modo de razonamiento implícito del modelo base.
- Generación de código y matemáticas a nivel del Llama 3.1 8B Instruct original.
- Soporte de tool calling y function calling, tal como el modelo base.
- Capacidades multilingües del modelo base (ocho idiomas oficiales de Llama 3.1).
- Contexto largo de hasta 128.000 tokens para documentos extensos y conversaciones multi-turno.
- Inferencia eficiente en vLLM gracias al formato compressed-tensors, con kernels de cuantización W8A8.
- Orientado a evaluación en tareas financieras (diez tareas del suite del paper), aunque no incorpora conocimiento financiero adicional por ajuste fino.

## Casos de uso

- Evaluación de compresión en dominios especializados: sirve como baseline de calibración genérica (C4) frente a variantes calibradas con datos financieros, permitiendo medir la degradación atribuible a la calibración fuera de dominio en las diez tareas del paper.
- Despliegue de un asistente conversacional en producción con vLLM: al estar en formato compressed-tensors, se carga directamente y ofrece menor uso de VRAM y mayor throughput que el checkpoint en fp16, manteniendo la calidad del Instruct.
- Atención al cliente multi-turno: la ventana de 128.000 tokens permite mantener historiales largos y documentos de referencia en el mismo contexto sin truncamiento.
- Generación de código en pipelines de CI/CD: el soporte de tool calling del modelo base permite integrarlo en flujos de revisión automática, generación de tests o documentación técnica.
- Procesamiento de documentación financiera extensa: informes anuales, transcripciones de llamadas de resultados o prospectos que caben en el contexto largo, con la ventaja del menor coste de inferencia de la cuantización W8A8.
- Investigación en eficiencia de modelos: punto de partida para estudiar el impacto de distintas estrategias de calibración (C2 frente a corpus financieros) sobre benchmarks de dominio.
- Prototipado en GPUs de gama media: la reducción de memoria frente a fp16 facilita ejecutar un 8B Instruct en hardware más modesto para pruebas y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al suite de evaluación del repositorio del paper (diez tareas financieras) para reproducir las métricas, pero no incluye cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB para los pesos en W8A8 (el repositorio ocupa 9,1 GB), más overhead de activaciones y caché KV; en la práctica, entre 10 y 16 GB según longitud de contexto y batch.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para despliegues con contexto largo o batch elevado; RTX 3090, RTX 4080 o A10G para inferencia con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con holgura, y en RTX 3090/4080 (16-24 GB) con contexto reducido o cuantización adicional de la caché KV.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors, recomendado), transformers con `AutoModelForCausalLM`, y TGI si soporta el formato compressed-tensors en la versión desplegada. llama.cpp y Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; se espera una mejora frente a fp16 por el uso de kernels W8A8 en vLLM, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c2 | 8,03 B | 128.000 | W8A8 (SmoothQuant, compressed-tensors) | Llama 3.1 | Hugging Face, 92 descargas |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 | fp16/bf16 | Llama 3.1 | Hugging Face, ampliamente usado |
| Otras variantes de la coleccion ICAIF '26 (30 configuraciones) | 8,03 B | 128.000 | W8A8 / W4A16 / etc. segun configuracion | Llama 3.1 | Hugging Face, coleccion jy395 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La calibración con texto web genérico (C4) puede degradar más el rendimiento en tareas financieras que variantes calibradas con corpus del dominio; el propio paper investiga este efecto.
- Riesgo de alucinación inherente al modelo base Llama 3.1 8B Instruct, no mitigado por la cuantización.
- La cuantización W8A8 puede introducir degradación adicional en tareas sensibles a precisión numérica (matemáticas, extracción de cifras financieras), no cuantificada en la información disponible.
- La model card no detalla los idiomas soportados explícitamente; debe asumirse el conjunto del modelo base, con posibles degradaciones por la calibración en inglés.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones (atribución «Built with Llama», límite de 700 millones de usuarios mensuales para el licenciatario y restricciones de uso aceptable); no es una licencia de código abierto permisiva.
- El repositorio tiene muy poca tracción (92 descargas, 0 likes) y fue creado recientemente; no hay validación comunitaria independiente del checkpoint.
- El formato compressed-tensors limita el ecosistema de despliegue: no es directamente compatible con llama.cpp u Ollama sin conversión.
- No se aportan métricas de evaluación en la model card; cualquier uso en producción debería validarse contra el modelo base en las tareas objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c2
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Repositorio del paper: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantización: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/smoothquant_w8a8.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Paper (DOI): https://doi.org/10.1145/3858063.3858724
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
