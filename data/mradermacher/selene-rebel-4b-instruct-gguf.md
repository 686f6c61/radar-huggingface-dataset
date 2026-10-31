# mradermacher/Selene-Rebel-4B-Instruct-GGUF

## Resumen

Selene-Rebel-4B-Instruct-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Syradevops/Selene-Rebel-4B-Instruct, publicada por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face. El modelo base es un LLM de instruccion de aproximadamente 3,88 mil millones de parametros construido sobre la arquitectura Gemma 3, y esta cuantizado con la libreria unsloth para facilitar su uso en entornos locales.

El proposito de este repositorio no es aportar un modelo nuevo, sino hacer accesible el modelo base en multiples niveles de cuantizacion (desde Q2_K hasta f16), reduciendo drasticamente los requisitos de memoria para su ejecucion en hardware de consumo. Es relevante para desarrolladores que quieren desplegar un modelo pequeno con capacidades multimodales (incluye suplementos mmproj) en portatiles, Raspberry Pi de gama alta o GPUs modestas, sin depender de servicios en la nube.

Al tratarse de un cuantizador de terceros, la model card original se centra en la logistica de las cuantizaciones y no documenta el proceso de entrenamiento, los datos ni los benchmarks del modelo base, por lo que varios apartados de esta ficha carecen de datos publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder) |
| Parametros totales | 3.880.263.168 (~3,88 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors) |

## Arquitectura y entrenamiento

El modelo base, Selene-Rebel-4B-Instruct de Syradevops, esta construido sobre la arquitectura Gemma 3, la familia de modelos abiertos de Google DeepMind. Gemma 3 emplea un transformer decoder con ventanas de atencion locales e hibridas y soporte multimodal en sus variantes oficiales, algo coherente con la presencia de archivos mmproj (proyectores multimodales) en este repo de cuantizaciones. El numero exacto de tokens de entrenamiento, la composicion del dataset y el uso de tecnicas de alineacion (RLHF, DPO) no estan documentados en la informacion disponible.

En cuanto a la cuantizacion, mradermacher ha generado cuantizaciones estaticas k-quant del modelo completo en 13 niveles distintos, desde Q2_K (1,8 GB) hasta f16 (7,9 GB). No emplea imatrix (matriz de importancia ponderada) en esta version, por lo que son cuants estaticos puros. Los archivos mmproj en Q8_0 y f16 son suplementos multimodales que permiten usar las capacidades de vision del modelo base con llama.cpp.

## Capacidades

- Generacion de texto conversacional (tag "conversational" y pipeline de instruccion).
- Capacidades multimodales: la presencia de archivos mmproj-Q8_0 y mmproj-f16 indica que el modelo base incluye un proyector de vision compatible con llama.cpp, aunque el alcance exacto de esta capacidad no esta documentado.
- Etiquetado con unsloth y gemma3, lo que sugiere compatibilidad con el ecosistema de fine-tuning y inferencia de esas herramientas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingues: el modelo esta etiquetado solo para ingles; el rendimiento en otros idiomas, incluido el castellano, no esta verificado.

## Casos de uso

- Chatbots locales en hardware modesto: con la variante Q4_K_M (2,6 GB) el modelo cabe en la mayoria de GPUs de consumo e incluso en CPU con RAM suficiente, ideal para asistentes conversacionales offline.
- Prototipado rapido de aplicaciones LLM: el tamano de 4B permite iterar rapidamente en portatiles sin coste de API antes de escalar a modelos mayores.
- Descripcion de imagenes y VLM ligero: usando los archivos mmproj junto a llama.cpp, se puede montar un sistema de analisis visual local de bajo consumo.
- Integracion en dispositivos edge: las cuants Q2_K/Q3_K (1,8-2,3 GB) permiten despliegue en mini-PC o SBCs con RAM limitada.
- Fine-tuning posterior con unsloth: al ser un modelo Gemma 3 etiquetado con unsloth, sirve como base para adaptaciones ligeras (LoRA) en GPUs de un solo consumidor.
- Evaluacion comparativa de cuantizaciones: la amplia gama de niveles de quant hace util este repo para medir la degradacion de calidad frente al tamano en un mismo modelo.
- Pipeline de texto en ingles en produccion: con licencia Apache 2.0, puede integrarse sin restricciones comerciales en productos de generacion de texto en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un grafico generico de perplejidad comparando tipos de cuantizacion (autoría de ikawrakow), sin metricas concretas del modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,8 GB (Q2_K) hasta ~7,9 GB (f16); las variantes recomendadas Q4_K_S/Q4_K_M ocupan 2,5-2,6 GB, a las que hay que sumar el contexto (KV cache).
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM ejecuta comoda la Q4_K_M (por ejemplo RTX 3060, RTX 4060); con 8 GB (RTX 4070, RTX 3090) puede usarse Q8_0 o f16 con contexto amplio.
- Consumer GPUs: cabe sobradamente; incluso sin GPU, un portatil con 8-16 GB de RAM ejecuta las cuants bajas por CPU a velocidades razonables para un modelo de 4B.
- Despliegue: GGUF es compatible con llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime que soporte el formato; el modelo base en safetensors funciona con transformers y vLLM (siempre que se soporte la arquitectura Gemma 3).
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Selene-Rebel-4B-Instruct (este) | ~3,88 B | no disponible | si (mmproj) | Apache 2.0 | GGUF |
| Gemma 3 4B IT (Google) | ~4 B | 128K | si | Gemma license (restrictiva) | safetensors/GGUF |
| Qwen3 4B Instruct | ~4 B | 32K+ | no (texto) | Apache 2.0 | safetensors/GGUF |
| Phi-4-mini (Microsoft) | ~3,8 B | 128K | no | MIT | safetensors/GGUF |

Selene-Rebel-4B destaca por su licencia Apache 2.0 (mas permisiva que la Gemma license del modelo base original) y por ofrecer cuantizaciones listas para uso local; su desventaja es la falta de documentacion publica sobre entrenamiento y benchmarks frente a los modelos oficiales de Google, Alibaba y Microsoft.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles; el rendimiento en castellano no esta verificado y puede ser inferior.
- No hay benchmarks publicados: la calidad real del modelo base es dificil de evaluar antes de probarlo; conviene validar en el caso de uso concreto.
- Riesgo de alucinacion: como todo LLM de 4B, puede generar contenido incorrecto con fluidez; no usar como fuente de verdad sin verificacion.
- Cuantizacion estatica sin imatrix: las cuants bajas (Q2_K, Q3_K_S/M) sufren degradacion de calidad notable; se recomiendan Q4_K_M o superiores para uso serio.
- Origen poco documentado: Syradevops no publica model card detallada del entrenamiento, datos ni alineacion, lo que dificulta auditar sesgos.
- Licencia: Apache 2.0 en el repo de cuantizacion; conviene verificar que el modelo base de Syradevops cumple efectivamente los terminos de la licencia Gemma de Google de la que deriva.
- Sesgos conocidos: no disponible (no documentados).

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Selene-Rebel-4B-Instruct-GGUF
- Modelo base: https://huggingface.co/Syradevops/Selene-Rebel-4B-Instruct
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Selene-Rebel-4B-Instruct-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del cuantizador): https://www.nethype.de/
