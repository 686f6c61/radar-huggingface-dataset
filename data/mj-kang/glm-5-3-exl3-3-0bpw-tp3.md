# mj-kang/GLM-5.3-EXL3-3.0bpw-TP3

## Resumen

El checkpoint `mj-kang/GLM-5.3-EXL3-3.0bpw-TP3` es una cuantizacion comunitaria del modelo completo GLM-5.3, desarrollada por `mj-kang`. A diferencia de la variante Flash, este checkpoint conserva el modelo integro, incluyendo los 256 expertos enrutados y el esquema de enrutamiento oficial top-8. Se presenta en formato ExLlama v3 (EXL3) con una cuantizacion de 3.0 bits por peso aplicada a los expertos enrutados, mientras que los tensores de paso se mantienen en precision BF16.

La relevancia de este artefacto radica en su caracter experimental: no es un checkpoint estandar de Transformers, vLLM o llama.cpp, sino que exige un runtime personalizado documentado en un repositorio de reproduccion. Esto lo orienta a entornos de investigacion y "homelab" con hardware especifico, especialmente DGX Spark, donde se busca reducir el coste de inferencia de un modelo grande manteniendo la fidelidad. El repositorio pesa 186.6 GB y su organizacion interna esta pensada para respetar los limites de carpetas de Hugging Face, con mas de 19.000 archivos distribuidos en particiones que requieren un proceso de restauracion.

El modelo pertenece a la familia GLM de Zhipu AI. El articulo de arXiv sobre GLM-5 describe innovaciones como DSA para reducir costes de entrenamiento e inferencia manteniendo fidelidad de contexto largo, pero no se aportan especificaciones concretas del modelo base en la documentacion de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 256 expertos enrutados, enrutamiento top-8, capa de prediccion multi-token (MTP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3; 3.0 bpw en expertos enrutados; tensores de paso en BF16 |
| Idiomas soportados | no disponibles |
| Licencia | glm-5.3 (other) |
| Formato de pesos | EXL3 (ExLlama v3); checkpoint sellado con script de restauracion; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo GLM-5.3 completo, no de la variante Flash. Conserva los 256 expertos enrutados y el esquema de enrutamiento oficial top-8, incluida la capa de prediccion multi-token (MTP). La distribucion de pesos cuantizados sigue una geometria rotatoria desigual de 768/640/640 sin padding de canales de expertos: el canal de 768 de ancho rota a lo largo de las capas MoE normales, mientras que la capa MTP 78 usa el rango 2. La cuantizacion K3 aplica tres bits a los expertos enrutados; la variante K2.75 mencionada en el proyecto mezcla 64 expertos de dos bits y 192 de tres bits por capa. Los tensores que no son de expertos se mantienen en precision original (BF16).

El proceso de entrenamiento original del modelo base no se detalla en la informacion proporcionada: no se aportan datos sobre el numero de tokens de preentrenamiento, la composicion del dataset ni la aplicacion de RLHF o DPO. Este repositorio es una cuantizacion comunitaria que no modifica los pesos; los bytes cuantizados se mantienen identicos al checkpoint sellado en NAS. Para ejecutarlo se requiere un runtime personalizado que incluye preparacion de rank-pack y dependencias fijadas, tal como se documenta en el repositorio de reproduccion.

## Capacidades

- Generacion de texto: el checkpoint es un modelo de texto para el pipeline de `text-generation`, basado en el modelo GLM-5.3 completo.
- Razonamiento y codigo: la familia GLM-5, segun el articulo de arXiv, se posiciona para agentic engineering, razonamiento y codigo; no obstante, para este checkpoint concreto no se proporcionan benchmarks que validen estas capacidades.
- Agentes y razonamiento multi-paso: la arquitectura MoE con 256 expertos y capa MTP sugiere soporte para tareas de agente, pero no hay datos empiricos en la informacion disponible.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Vision y audio: no disponible; el checkpoint es exclusivamente de texto.

## Casos de uso

- Investigacion sobre cuantizacion de modelos MoE de gran escala: el checkpoint permite observar el efecto de reducir a 3 bits los pesos de los expertos enrutados de un modelo con 256 expertos, manteniendo el resto en precision BF16. Es adecuado para estudiar el impacto en la distribucion de salida mediante las metricas de fidelidad KLD y acuerdo top-1.
- Verificacion de integridad y reproducibilidad de artefactos: el layout de transporte con manifiestos SHA256 y script de restauracion permite comprobar la integridad de un checkpoint cuantizado antes de usarlo, lo que resulta util en entornos de investigacion que requieren auditorias de artefactos.
- Despliegue en hardware DGX Spark: el checkpoint esta etiquetado para DGX Spark y requiere el runtime personalizado del repositorio de reproduccion. Es un caso de uso para homelab con ese hardware especifico.
- Experimentacion con prediccion multi-token (MTP): al mantener la capa MTP original, el modelo puede utilizarse para evaluar esquemas de decodificacion que aprovechen predicciones de multiples tokens, aunque no se han publicado resultados para este K3.
- Comparacion de variantes de cuantizacion dentro de la familia GLM: permite comparar el comportamiento del checkpoint K3 (tres bits) con la variante K2.75 mencionada en el proyecto (mixta de dos y tres bits) para elegir el punto optimo de fidelidad-velocidad.
- Estudio de perdida de informacion en cuantizacion: las mediciones registradas (KLD 0.034 nats, acuerdo top-1 93.6%) sirven de referencia para analizar como la cuantizacion afecta a la distribucion de salida, siempre que se respeten las limitaciones del protocolo.

## Benchmarks y rendimiento

No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion registrada es una comparacion con el modelo profesor en ventanas de calibracion, con el siguiente resultado:

| Metrica | Valor |
|---|---|
| KLD (calibracion) | 0.0339743205 nats |
| Acuerdo top-1 | 93.6004% |

Estos valores corresponden a mediciones limitadas de ventana de calibracion, no son un benchmark amplio de inteligencia ni un porcentaje de informacion retenida, y no son comparables con evaluaciones GGUF sin protocolos coincidentes. Ademas, los datos de rendimiento de 13.06 tok/s y la calificacion "final 32K/MTP3" pertenecen a la variante K2.75, no a este checkpoint K3.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; el repositorio completo pesa 186.6 GB en disco, pero no se aporta una estimacion de VRAM para inferencia.
- GPU recomendadas: DGX Spark, segun las etiquetas del repositorio.
- GPUs de consumo: no se puede garantizar. El checkpoint no es compatible con stack estandar y probablemente no quepa en una GPU de consumo corriente sin el runtime personalizado y suficiente memoria.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama, TGI ni ExLlama estandar. Requiere el loader personalizado, preparacion de rank-pack y dependencias fijadas del repositorio de reproduccion.
- Latencia y throughput: no disponible para este K3; los datos de 13.06 tok/s corresponden a la variante K2.75 y no deben atribuirse a este checkpoint.

## Comparativa con modelos similares

| Modelo | Tamano de checkpoint | Bits | Contexto | Runtime | Licencia |
|---|---|---|---|---|---|
| mj-kang/GLM-5.3-EXL3-3.0bpw-TP3 | 186.6 GB | 3.0 bpw (expertos) | no disponible | personalizado | glm-5.3 |
| zai-org/GLM-5.3-BF16 | no disponible | BF16 | no disponible | estandar | glm-5.3 |
| GLM-5.3 Flash EXL3 (MiaAI-Lab) | no disponible | no disponible | no disponible | personalizado | no disponible |
| Variante K2.75 del mismo proyecto | no disponible | 2/3 bpw mixto | menciona 32K/MTP3 | personalizado | glm-5.3 |

La variante K2.75 es una alternativa experimental interna del autor; sus datos de velocidad y contexto (32K/MTP3) se referencian en la model card, pero no se aportan benchmarks de inteligencia para ninguna de las variantes.

## Limitaciones y advertencias

- El checkpoint esta marcado como "incompleto" hasta que exista el archivo `UPLOAD_COMPLETE.json`; hay que verificar ese marcador antes de descargarlo para su uso.
- Requiere un runtime personalizado; no es compatible con las implementaciones estandar de Transformers, vLLM, llama.cpp/GGUF ni ExLlama sin modificaciones.
- No se han publicado benchmarks de capacidades (razonamiento, codificacion, matematicas) en la informacion disponible.
- La cuantizacion puede degradar la calidad; las metricas de fidelidad se limitan a ventanas de calibracion y no son comparables entre protocolos.
- La licencia original `glm-5.3` se preserva; no es MIT ni Apache, por lo que cualquier uso comercial requiere revisar los terminos de esa licencia.
- Los resultados de velocidad y memoria de K2.75 no deben atribuirse a este checkpoint K3.
- La restauracion por defecto enlaza archivos sin copiarlos; si se elimina el snapshot o cache descargado, los enlaces pueden romperse.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma, por lo que se desconocen estos riesgos antes de un despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/mj-kang/GLM-5.3-EXL3-3.0bpw-TP3
- Repositorio de reproduccion y runtime personalizado: https://github.com/mjkang-estrella/glm53-full-exl3-tp3
- Articulo arXiv sobre GLM-5 (contexto de la familia): https://arxiv.org/html/2602.15763v1
- GitHub de GLM-5.3 Flash EXL3 para 2x DGX Sparks: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks/
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
