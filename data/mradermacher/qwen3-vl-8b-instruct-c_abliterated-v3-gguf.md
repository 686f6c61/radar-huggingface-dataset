# mradermacher/Qwen3-VL-8B-Instruct-c_abliterated-v3-GGUF

## Resumen

Qwen3-VL-8B-Instruct-c_abliterated-v3-GGUF es una cuantizacion en formato GGUF del modelo multimodal Qwen3-VL-8B-Instruct, en su variante "abliterated" (con el comportamiento de rechazo suprimido) y version v3, publicada por el usuario prithivMLmods y cuantizada por mradermacher. El modelo original deriva de la familia Qwen3-VL de Alibaba, un transformer multimodal de 8.190.735.360 parametros que procesa texto e imagenes.

La relevancia de esta publicacion es practica: ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K de 3,4 GB hasta f16 de 16,5 GB) junto con el proyector multimodal (mmproj) en Q8_0 y f16, lo que permite ejecutar un modelo vision-lenguaje de 8B en hardware de consumo mediante llama.cpp u Ollama. La variante "abliterated" elimina los mecanismos de rechazo del modelo original, lo que la orienta a casos de uso donde se requiere baja censura, con los riesgos asociados.

La licencia es Apache 2.0 y el idioma declarado es unicamente ingles. No se dispone de informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje); detalles internos no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16; quants imatrix en repo i1 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |
| Tamano del repositorio | 75,3 GB (incluye todas las cuantizaciones) |
| Modelo base | prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3 |
| Libreria | transformers, compatible con text-generation-inference y endpoints_compatible |
| Fecha de creacion | 2026-02-12 |
| Descargas / likes | 1.769 / 7 |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de 8.190.735.360 parametros que combina un codificador visual con un modelo de lenguaje para tareas de comprension de imagen y texto. La informacion disponible no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni la arquitectura exacta del codificador visual. Tampoco se especifica la longitud de contexto nativa ni si emplea tecnicas como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, no se dispone de datos sobre el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original. La variante "abliterated" implica una modificacion de los pesos orientada a suprimir el comportamiento de rechazo (refusal), presumiblemente mediante tecnicas de abliteration (proyeccion ortogonal sobre las direcciones de rechazo), aunque el autor no documenta el procedimiento exacto en la model card proporcionada. La cuantizacion la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye quants ponderados con imatrix en un repositorio separado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Comprension de imagenes: el repositorio incluye el proyector multimodal (mmproj) necesario para el procesamiento visual en llama.cpp.
- Generacion y asistencia de codigo (etiqueta "code" en los tags del modelo).
- Comportamiento "abliterated": supresion del rechazo a peticiones que el modelo original declinaria.
- Compatibilidad con text-generation-inference y endpoints compatibles con la API de OpenAI (tag endpoints_compatible).
- No se documentan capacidades de tool calling, function calling, agentes, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo language.

## Casos de uso

- Inferencia local de un modelo vision-lenguaje en GPU de consumo: con cuantizaciones Q4_K_M (5,1 GB) o Q5_K_M (6,0 GB) mas el mmproj Q8_0 (0,9 GB), el modelo cabe en GPUs de 8-12 GB de VRAM y permite describir imagenes, responder preguntas sobre capturas o extraer texto de documentos escaneados sin conexion.
- Procesamiento por lotes de imagenes en servidores sin GPU dedicada: usando Q4_K_S (4,9 GB) en CPU con llama.cpp, se pueden clasificar o describir lotes de imagenes en pipelines ETL donde la latencia no es critica.
- Asistencia de codigo en entornos air-gapped: la etiqueta "code" y el formato GGUF permiten desplegar el modelo con Ollama o llama.cpp en estaciones de trabajo sin acceso a internet para autocompletado y explicacion de fragmentos de codigo.
- Investigacion sobre alineacion y refusal: la variante abliterated sirve como objeto de estudio para comparar tasas de rechazo frente al modelo original en tareas de red teaming y evaluacion de sesgos, siempre en entornos controlados.
- Prototipado de aplicaciones de accesibilidad: descripcion de imagenes para usuarios con discapacidad visual en local, con el modelo ejecutandose en un portatil con GPU integrada mediante Q3_K_M (4,2 GB).
- Experimentacion con TGI: el tag text-generation-inference y endpoints_compatible permiten integrar el modelo en un servidor TGI o en un endpoint compatible con OpenAI para pruebas de aplicaciones conversacionales con vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: 3,4 GB de pesos; ~4-5 GB totales.
  - Q3_K_M: 4,2 GB de pesos; ~5-6 GB totales.
  - Q4_K_M: 5,1 GB de pesos; ~6-7 GB totales.
  - Q5_K_M: 6,0 GB de pesos; ~7-8 GB totales.
  - Q6_K: 6,8 GB de pesos; ~8-9 GB totales.
  - Q8_0: 8,8 GB de pesos; ~10-11 GB totales.
  - f16: 16,5 GB de pesos; ~18-20 GB totales.
- Sumar 0,9 GB (mmproj Q8_0) o 1,3 GB (mmproj f16) si se usa la entrada visual.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues concurrentes.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6 GB hasta Q8_0 en GPUs de 12 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (segun tags), servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct-c_abliterated-v3-GGUF (este) | 8,19B | no disponible | si (mmproj) | Apache 2.0 | GGUF | Variante abliterated, solo ingles declarado |
| Qwen3-VL-8B-Instruct (original) | ~8B | no disponible | si | Apache 2.0 | safetensors | Modelo base sin abliteration; rechazo intacto |
| Qwen2.5-VL-7B-Instruct | ~7B | no disponible | si | Apache 2.0 | safetensors, GGUF | Generacion anterior de la familia Qwen-VL |
| Llama 3.2 11B Vision Instruct | ~11B | no disponible | si | Llama 3.2 Community License | safetensors, GGUF | Mayor tamano, licencia con restricciones |

Los datos de contexto y rendimiento de los modelos comparados no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad de formato.

## Limitaciones y advertencias

- La variante abliterated elimina los rechazos del modelo original: puede generar contenido que el modelo base declinaria, con implicaciones legales y eticas en produccion.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en tareas de razonamiento complejo y en la interpretacion de imagenes ambiguas.
- Idioma declarado unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada; no se debe asumir una ventana grande sin verificacion empirica.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; el autor recomienda Q4_K_S o superior.
- La licencia Apache 2.0 del modelo base se mantiene, pero el uso comercial de una variante abliterated puede chocar con politicas de plataformas y con normativa sobre contenido.
- El repositorio ocupa 75,3 GB; descargar solo los ficheros necesarios.
- No hay informacion sobre sesgos especificos medidos ni sobre evaluaciones de seguridad de esta variante.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-VL-8B-Instruct-c_abliterated-v3-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3
- Quants imatrix: https://huggingface.co/mradermacher/Qwen3-VL-8B-Instruct-c_abliterated-v3-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3-VL-8B-Instruct-c_abliterated-v3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
