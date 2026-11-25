# Harsha001/Carbon-X-ROCmFPX

## Resumen

Carbon-X-ROCmFPX es una cuantización del modelo Carbon-X de HuggingFaceBio, un modelo de lenguaje de 14.822.046.720 parámetros (~14,8B) especializado en comprensión y generación de ADN. El modelo original está entrenado para recibir secuencias de ADN en bruto dentro de un mensaje de chat y responder en inglés sobre efectos de variantes, regiones reguladoras, grupos de organismos y predicción de bases siguientes. Esta versión concreta, publicada por el usuario Harsha001, aplica los formatos de cuantización ROCmFPX, un fork de llama.cpp con tipos de peso de bajo bit orientados a GPUs AMD (Vulkan y HIP/ROCm), con especial atención al hardware Strix Halo (`gfx1151`).

La relevancia de esta ficha reside en que ilustra una cuantización de bajo bit para un modelo de dominio científico (genómica), un nicho donde la pérdida de fidelidad en la distribución de siguiente token puede ser crítica. El autor publica métricas de divergencia KL frente al modelo BF16 tanto en texto (WikiText-2) como en ADN humano (GRCh38), lo que permite evaluar el compromiso entre tamaño y calidad de forma cuantitativa. El archivo recomendado es el de 6 bits, que se mantiene cercano al original en ADN.

Se trata de un artefacto GGUF que solo carga en una compilación ROCmFPX de llama.cpp; las herramientas estándar como llama.cpp upstream, LM Studio u Ollama no reconocen estos tipos. El autor advierte además que los archivos no se han probado todavía en hardware AMD real y que no es un lanzamiento oficial de Hugging Face Bio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Carbon-X de HuggingFaceBio; transformer, detalles no especificados) |
| Parametros totales | 14.822.046.720 (~14,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (valor usado en el comando de ejemplo del autor con `-c 40960`) |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits), Q6_0_ROCMFPX (6 bits, etiquetado como Q6_K en el nombre de archivo), Q4_0_ROCMFP4_STRIX (4 bits), Q4_0_ROCMFP4_FAST (4 bits); Q3_0_ROCMFPX no publicado |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tipos ROCmFPX propietarios del fork; token embedding y output en Q8_0 stock en los archivos de 4 bits) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Carbon-X en la documentación proporcionada. Se sabe que es un modelo de 14,8B parámetros orientado a generación de texto y especializado en ADN, con un tokenizador híbrido que detecta secuencias de bases A/C/G/T en el prompt y las segmenta en tokens de 6 bases. El modelo fue post-entrenado y evaluado con el modo thinking desactivado, y las recomendaciones de muestreo del autor (temperatura 0,6, top-p 0,95, top-k 20, min-p 0) corresponden a los valores por defecto de Hugging Face Bio.

El proceso de cuantización documentado consta de cuatro pasos: conversión a BF16 con `convert_hf_to_gguf.py` del fork, generación de una importance matrix desde el modelo BF16 sobre texto de calibración general (`calibration_datav3`) en fragmentos de 512 tokens, cuantización con `llama-quantize --imatrix` (una ejecución por tipo, con `--token-embedding-type q8_0 --output-tensor-type q8_0` en los archivos de 4 bits) y evaluación de calidad expandiendo cada cuantizado de vuelta a F16 para puntuarlo con kernels F16 estándar en una GPU NVIDIA. El autor señala que los kernels CUDA propios del fork para estos tipos no son correctos en NVIDIA y por eso no se usaron.

## Capacidades

- Comprensión de secuencias de ADN en bruto introducidas en un mensaje de chat, con respuesta en inglés.
- Predicción de efectos de variantes (por ejemplo, cambios de una base por otra y su impacto en codones).
- Identificación de regiones reguladoras y grupos de organismos.
- Predicción de las bases siguientes en una secuencia.
- Generación de texto conversacional en inglés.
- Tokenizador híbrido DNA-aware: detección automática de tramos A/C/G/T y segmentación en tokens de 6 bases, con paridad verificada frente al tokenizador Python de Hugging Face Bio en 9 cadenas de prueba (bases en minúscula, longitudes no múltiplas de 6, códigos de ambigüedad como `N`, bloques separados por espacios, palabras cortas como "CAT", formato de chat y 1.000 bases de ADN humano).
- Modo thinking desactivado por defecto (el modelo fue post-entrenado y evaluado sin thinking).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Anotación de variantes en pipelines de genómica clínica: el modelo recibe la secuencia contextual alrededor de una variante y devuelve una descripción en inglés del cambio de base y su efecto sobre el codón, como muestra el ejemplo del autor con la variante `CCTGAGGAG` a `CCTGTGGAG`.
- Exploración de regiones reguladoras: dado un fragmento genómico, el modelo puede señalar si corresponde a una región reguladora y describirla, útil para triaje previo en estudios de regulación génica.
- Clasificación de organismos a partir de secuencias: integrado en un script que envía fragmentos de ADN al servidor llama.cpp y recoge la respuesta en inglés para agrupar secuencias por grupo taxonómico aproximado.
- Predicción de siguiente base para validación de ensamblados: el modelo puede puntuar la plausibilidad de una secuencia y detectar tramos anómalos comparando la predicción con la base real.
- Asistente de investigación en bioinformática: interfaz conversacional donde el investigador pega ADN en bruto y pregunta en inglés sobre efectos, regiones o contexto, con contexto de hasta 40.960 tokens para secuencias largas.
- Despliegue en estaciones de trabajo con GPU AMD: al usar el fork ROCmFPX con backend Vulkan o HIP, el modelo puede ejecutarse en GPUs AMD (orientado a Strix Halo `gfx1151` y RX 7900 `gfx1100`) sin depender de CUDA, en un entorno local con datos genómicos sensibles.
- Evaluación comparativa de cuantizaciones: los archivos publicados permiten medir el impacto de la cuantización en un dominio científico concreto usando las métricas de KLD y same-top proporcionadas.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros); indica explícitamente que las métricas miden cuánto cambia cada archivo las predicciones del modelo, no la exactitud en benchmarks. Se presentan las métricas de fidelidad frente a BF16:

| Archivo | Tamano | KLD texto | Same top texto | KLD ADN | Same top ADN |
|---|---:|---:|---:|---:|---:|
| `Carbon-X-Q8_0_ROCMFPX.gguf` | 15,3 GB | 0,0032 | 97,24% | 0,0238 | 79,54% |
| `Carbon-X-Q6_K_ROCMFPX.gguf` (recomendado) | 12,2 GB | 0,0084 | 95,57% | 0,0290 | 78,72% |
| `Carbon-X-Q4_0_ROCMFP4_STRIX.gguf` | 8,7 GB | 0,0721 | 88,78% | 0,0968 | 71,85% |
| `Carbon-X-Q4_0_ROCMFP4_FAST.gguf` | 8,7 GB | 0,0734 | 88,68% | 0,0963 | 72,01% |
| `Q4_K_M` stock (referencia) | 9,6 GB | 0,0334 | no disponible | 0,0486 | no disponible |
| `Q3_0_ROCMFPX` (no publicado) | 8,5 GB | 0,134 | no disponible | 0,169 | no disponible |

Referencias de perplejidad del modelo BF16: 9,2710 en WikiText-2 (40 fragmentos de 512 tokens) y 1446,4 en ADN humano (42 segmentos de 3.072 bases de cromosomas 1 a 22 de GRCh38, fragmentos de 512 tokens).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más overhead de contexto. El Q6 recomendado ocupa 12,2 GB; el Q8, 15,3 GB; los Q4, 8,7 GB cada uno.
- GPU recomendadas: el fork está orientado a GPUs AMD con backend Vulkan o HIP/ROCm, con objetivos documentados `gfx1151` (Strix Halo) y `gfx1100` (RX 7900). No se documentan requisitos para NVIDIA u otras marcas.
- Cabe en GPU de consumo: sí, los archivos de 4 bits (8,7 GB) y el de 6 bits (12,2 GB) caben en GPUs de consumo con suficiente VRAM; el de 8 bits (15,3 GB) requiere una GPU de gama alta o mayor.
- Opciones de despliegue: exclusivamente compilaciones ROCmFPX de llama.cpp (`llama-server`), con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`. No funcionan en llama.cpp upstream, LM Studio ni Ollama; para esas herramientas debe usarse `HuggingFaceBio/Carbon-X-GGUF`.
- Latencia y throughput: no disponibles. El autor advierte que los archivos no se han probado todavía en hardware AMD real, por lo que no hay cifras de rendimiento en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Carbon-X-ROCmFPX (esta ficha) | 14,8B | 40.960 tokens (uso documentado) | GGUF ROCmFPX | apache-2.0 | Solo carga en fork ROCmFPX; métricas de KLD publicadas |
| Carbon-X-GGUF (HuggingFaceBio) | 14,8B | no disponible | GGUF stock | apache-2.0 | Compatible con llama.cpp, LM Studio y Ollama; alternativa recomendada para 4 bits |
| Carbon-X (BF16 original) | 14,8B | no disponible | safetensors | apache-2.0 | Referencia de calidad; requiere más VRAM |

No se dispone de información sobre otros modelos comparables de genómica en la documentación proporcionada.

## Limitaciones y advertencias

- Solo carga en una compilación ROCmFPX de llama.cpp; llama.cpp upstream, LM Studio y Ollama no reconocen los tipos ROCmFPX.
- Los archivos no se han probado en hardware AMD real; el rendimiento y la corrección en GPU AMD son desconocidos, aunque el autor señala que los kernels AMD pueden dar resultados ligeramente distintos por el orden de las operaciones.
- No es un lanzamiento oficial de Hugging Face Bio; todo el crédito del modelo corresponde a sus autores.
- Los archivos de 4 bits pierden claramente más calidad en ADN que el de 6 bits (KLD ADN 0,0968 frente a 0,0290); para 4 bits sin necesidad de ROCmFPX, el `Q4_K_M` stock de Hugging Face Bio es mejor opción (KLD ADN 0,0486).
- El modelo solo soporta inglés; las respuestas sobre ADN se dan en inglés.
- Riesgo de alucinación en un dominio donde la secuencia de ADN en bruto es casi aleatoria y el modelo rara vez está seguro del siguiente token; el propio autor señala que el "same top" es bajo incluso en 8 bits.
- No se han medido benchmarks de exactitud; las métricas publicadas miden fidelidad frente a BF16, no corrección científica.
- El modelo fue post-entrenado y evaluado con thinking desactivado; activar thinking puede degradar el comportamiento esperado.
- Licencia apache-2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones aplicables al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/Carbon-X-ROCmFPX
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X
- GGUF oficial del modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X-GGUF
- Fork ROCmFPX (repositorio del autor): https://github.com/HarshaVardhan3002/ROCmFPX
- Fork ROCmFPX (referencia): https://github.com/charlie12345/ROCmFPX
- PR de soporte del tokenizador híbrido de ADN en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30825
- Issue de referencia sobre escalas de tensor: https://github.com/cha (enlace incompleto en la información proporcionada)
