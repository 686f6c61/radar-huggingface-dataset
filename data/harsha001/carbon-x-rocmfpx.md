# Harsha001/Carbon-X-ROCmFPX

## Resumen

Carbon-X-ROCmFPX es una cuantizacion no oficial del modelo HuggingFaceBio/Carbon-X, un modelo de lenguaje de 14.822.046.720 parametros (~14,8B) especializado en comprension y generacion de ADN. La publica el usuario Harsha001 bajo licencia Apache 2.0, empleando los formatos ROCmFPX, un fork de llama.cpp con tipos de peso de bajo bit optimizados para GPUs AMD mediante Vulkan y HIP/ROCm. El modelo base resuelve tareas de genomica: prediccion de efectos de variantes, regiones regulatorias, grupos de organismos y prediccion de bases siguientes a partir de secuencia cruda de ADN pegada en un mensaje de chat.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco comun de cuantizacion de bajo bit sobre un dominio cientifico donde la perdida de fidelidad es especialmente sensible. Por otro, el autor publica metricas de divergencia KL frente al modelo BF16 tanto en texto (WikiText-2) como en ADN humano (segmentos de 3.072 bases de los cromosomas 1 a 22 del genoma de referencia GRCh38), lo que permite evaluar el coste real de cada nivel de cuantizacion.

El modelo solo carga en compilaciones ROCmFPX de llama.cpp; llama.cpp estandar, LM Studio y Ollama no reconocen estos tipos, por lo que para esos entornos debe usarse el GGUF oficial de Hugging Face Bio. El autor advierte ademas de que los ficheros no se han probado todavia en hardware AMD real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Carbon-X de HuggingFaceBio; transformer, sin detalle en la informacion proporcionada) |
| Parametros totales | 14.822.046.720 (~14,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (valor usado en el comando de ejemplo con `-c 40960`; no se confirma como maximo oficial) |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits), Q6_0_ROCMFPX (6 bits, etiquetado como Q6_K en el nombre del fichero), Q4_0_ROCMFP4_STRIX (4 bits, receta para gfx1151), Q4_0_ROCMFP4_FAST (4 bits, un escalar por bloque) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tipos propietarios ROCmFPX; embeddings y tensor de salida en Q8_0 estandar en los ficheros de 4 bits) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Carbon-X en la documentacion proporcionada: no se detalla si es un transformer denso, MoE o hibrido, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo RLHF/DPO. Lo que si se documenta es que Carbon-X fue post-entrenado y evaluado con el modo thinking desactivado, y que sus ajustes de muestreo por defecto son temperatura 0.6, top-p 0.95, top-k 20 y min-p 0.

La innovacion tecnica destacable de esta publicacion es el soporte del tokenizador hibrido de ADN: el fork ROCmFPX integra el soporte de llama.cpp para el tokenizador de Carbon (PR upstream #30825), de modo que las secuencias de A/C/G/T en el prompt se etiquetan como ADN y se cortan automaticamente en tokens de 6 bases. El autor valida la equivalencia con el tokenizador Python de Hugging Face Bio sobre 9 cadenas de prueba (ejemplos de la model card, bases en minuscula, longitudes no multiplos de 6, codigos de ambiguedad como N, bloques separados por espacios, palabras cortas como "CAT", el formato de chat y 1.000 bases de ADN humano), obteniendo exactamente los mismos token ids.

El proceso de cuantizacion fue: conversion a BF16 con `convert_hf_to_gguf.py`, generacion de una importance matrix desde el modelo BF16 en GPU sobre texto de calibracion general (`calibration_datav3`) en fragmentos de 512 tokens, y cuantizacion con `llama-quantize --imatrix`, una ejecucion por tipo. En los ficheros de 4 bits se forzo `--token-embedding-type q8_0 --output-tensor-type q8_0`; con esos tensores a 4 bits los ficheros eran 0,6 GB mas pequenos pero claramente peores (KLD en ADN 0,129 y same top 63,0%), por lo que no se publicaron. La evaluacion de calidad se hizo expandiendo cada cuantizacion de vuelta a F16 y puntuandola con kernels F16 estandar en GPU NVIDIA, usando como referencia el BF16 con kernels BF16 estandar.

## Capacidades

- Generacion de texto y respuesta conversacional en ingles sobre entradas que incluyen secuencia cruda de ADN.
- Prediccion de efectos de variantes (variant-effect prediction): el modelo identifica el cambio de base y su contexto, por ejemplo respondiendo que la variante cambia la posicion 21 de A a T, de modo que GAG pasa a GTG.
- Analisis de regiones regulatorias del genoma.
- Clasificacion o identificacion de grupos de organismos.
- Prediccion de bases siguientes en una secuencia de ADN.
- Tokenizacion automatica de ADN: las tiradas de A/C/G/T se detectan y segmentan en tokens de 6 bases sin preprocesado manual.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking: el modelo fue post-entrenado y evaluado con thinking desactivado; el comando de ejemplo lo desactiva explicitamente mediante `--chat-template-kwargs '{"enable_thinking": false}'`.

## Casos de uso

- Anotacion de variantes en pipelines de genomica clinica: se pega la secuencia flanqueante de una variante en un mensaje de chat y el modelo devuelve en ingles el cambio de base y el contexto local, lo que permite un primer triaje automatizado antes de la revision por un genetista.
- Exploracion de regiones regulatorias: dado un fragmento genomico, el modelo puede describir si la region presenta caracteristicas regulatorias, util para priorizar candidatos en estudios de expresion genica.
- Prediccion de bases para validacion de ensamblados: el modelo estima la siguiente base en una secuencia, lo que sirve como senal auxiliar para detectar discontinuidades o errores en ensamblados de novo.
- Clasificacion taxonomica preliminar de fragmentos: a partir de secuencia cruda, el modelo puede inferir el grupo de organismo al que probablemente pertenece el fragmento, util en metagenomica como filtro rapido.
- Asistente conversacional para biologos sin experiencia en PLN: al aceptar ADN pegado directamente en el chat y responder en ingles, reduce la barrera de entrada frente a pipelines bioinformaticos tradicionales.
- Despliegue en estaciones de trabajo con GPU AMD: los ficheros de 4 bits (8,7 GB) estan pensados para caber y ejecutarse en una maquina con Strix Halo (gfx1151) o RX 7900 (gfx1100) mediante el fork ROCmFPX con backend Vulkan o HIP, lo que permite mantener el flujo genomico en local sin depender de la nube.
- Evaluacion comparativa de cuantizaciones en dominio cientifico: los datos de KLD en texto y ADN permiten a un equipo decidir entre Q8_0 (15,3 GB), Q6_0 (12,2 GB) y las variantes de 4 bits (8,7 GB) segun su presupuesto de memoria y su tolerancia a la perdida de fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de accuracy (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor lo indica explicitamente: las metricas miden cuanto cambia cada fichero las predicciones del modelo, no la precision en tareas.

Metricas de fidelidad frente al BF16 (perplejidad BF16: 9,2710 en WikiText-2; 1446,4 en ADN humano):

| Fichero | Tamano | KLD texto | Same top texto | KLD ADN | Same top ADN |
|---|---:|---:|---:|---:|---:|
| Carbon-X-Q8_0_ROCMFPX.gguf | 15,3 GB | 0,0032 | 97,24% | 0,0238 | 79,54% |
| Carbon-X-Q6_K_ROCMFPX.gguf | 12,2 GB | 0,0084 | 95,57% | 0,0290 | 78,72% |
| Carbon-X-Q4_0_ROCMFP4_STRIX.gguf | 8,7 GB | 0,0721 | 88,78% | 0,0968 | 71,85% |
| Carbon-X-Q4_0_ROCMFP4_FAST.gguf | 8,7 GB | 0,0734 | 88,68% | 0,0963 | 72,01% |
| Q4_K_M estandar (referencia) | 9,6 GB | 0,0334 | no disponible | 0,0486 | no disponible |
| Q3_0_ROCMFPX (no publicado) | 8,5 GB | 0,134 | no disponible | 0,169 | no disponible |

El autor recomienda empezar por Q6_0_ROCMFPX por su cercania al original en ADN. Senala que un Q4_K_M estandar fabricado con la misma importance matrix y los mismos tensores de embedding y salida en Q8_0 pierde aproximadamente la mitad que los ficheros de 4 bits ROCmFPX, por lo que si se necesita 4 bits sin requerir los tipos ROCmFPX conviene usar el `carbon-x-q4_k_m.gguf` oficial de Hugging Face Bio.

## Requisitos de hardware

- VRAM estimada: 15,3 GB para Q8_0, 12,2 GB para Q6_0 y 8,7 GB para los dos ficheros de 4 bits, solo para pesos; hay que anadir la memoria de la cache KV para el contexto configurado (el ejemplo usa 40.960 tokens).
- GPUs objetivo: AMD con soporte Vulkan o HIP/ROCm. El autor compila para `gfx1151` (Strix Halo) y cita `gfx1100` (RX 7900) como alternativa. No se mencionan A100, H100 ni RTX 4090 como destino de estos ficheros.
- Cabe en GPU de consumo: si, en el caso de las Radeon RX 7900 y en APUs Strix Halo con memoria unificada; los 8,7 GB de los ficheros de 4 bits son el escenario mas ajustado.
- Nota critica: el autor advierte que los ficheros no se han probado todavia en hardware AMD.
- Despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp (repositorio HarshaVardhan3002/ROCmFPX), compilado con `-DGGML_VULKAN=ON` o con `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`, y lanzado con `llama-server`. No compatible con llama.cpp estandar, LM Studio ni Ollama.
- Parametros de ejecucion recomendados: `-ngl 999 -c 40960 --jinja --chat-template-kwargs '{"enable_thinking": false}' --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Carbon-X-ROCmFPX (esta ficha) | 14,8B | 40.960 (segun ejemplo) | GGUF ROCmFPX | Apache 2.0 | Requiere fork de llama.cpp; orientado a AMD; sin probar en AMD |
| HuggingFaceBio/Carbon-X (BF16 original) | 14,8B | no disponible | safetensors/BF16 | Apache 2.0 | Referencia de calidad; perplejidad BF16 9,2710 en texto y 1446,4 en ADN |
| HuggingFaceBio/Carbon-X-GGUF | 14,8B | no disponible | GGUF estandar | Apache 2.0 | Compatible con llama.cpp, LM Studio y Ollama; incluye `carbon-x-q4_k_m.gguf` |
| Q4_K_M estandar (misma receta) | 14,8B | no disponible | GGUF estandar | Apache 2.0 | 9,6 GB; KLD texto 0,0334 y ADN 0,0486, mejor que los 4 bits ROCmFPX |

No se dispone de informacion sobre otros modelos genomicos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es una release oficial de Hugging Face Bio; todo el credito del modelo corresponde a sus autores.
- Los ficheros solo cargan en una compilacion ROCmFPX de llama.cpp. llama.cpp estandar, LM Studio y Ollama no reconocen estos tipos.
- Los ficheros no se han probado en hardware AMD, pese a estar disenados para ello.
- El fichero de 6 bits se llama `Q6_K_ROCMFPX` por conveniencia de listado en Hugging Face, pero sus pesos son del tipo `Q6_0_ROCMFPX`, no un `Q6_K` estandar, y requiere el mismo fork.
- Las metricas publicadas miden divergencia respecto al BF16, no precision en tareas; no hay benchmarks de accuracy.
- Los ficheros de 4 bits pierden claramente mas fidelidad en ADN que en texto (KLD 0,0968 frente a 0,0721), y el autor recomienda Q6_0 para trabajo genomico.
- En ADN, el "same top" es bajo incluso para el fichero de 8 bits (79,54%) porque la secuencia genomica cruda es casi aleatoria; debe compararse la KLD, no esa metrica.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Riesgo de alucinacion: no se documenta de forma especifica, pero es un modelo generativo de dominio cientifico y sus salidas no deben usarse como sustituto de validacion experimental o clinica.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0, que permite uso comercial; no obstante, la licencia del modelo base y las condiciones de los tipos ROCmFPX deben verificarse por separado antes de un despliegue en produccion.
- El contexto maximo real no se confirma; los 40.960 tokens proceden del comando de ejemplo y no de una especificacion oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/Carbon-X-ROCmFPX
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X
- GGUF oficial del modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X-GGUF
- Fork ROCmFPX (repositorio del autor): https://github.com/HarshaVardhan3002/ROCmFPX
- ROCmFPX (repositorio de referencia): https://github.com/charlie12345/ROCmFPX
- PR de llama.cpp con soporte del tokenizador de ADN de Carbon: https://github.com/ggml-org/llama.cpp/pull/30825
- Modelo destacado del autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
