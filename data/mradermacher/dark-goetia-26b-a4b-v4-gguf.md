# mradermacher/Dark-Goetia-26B-A4B-v4-GGUF

## Resumen

Dark-Goetia-26B-A4B-v4-GGUF es la versión cuantizada en formato GGUF del modelo Dark-Goetia-26B-A4B-v4, publicada por mradermacher, un usuario conocido en Hugging Face por generar cuantizaciones estáticas y con imatrix de modelos de terceros. El modelo original pertenece a la suite "26B-Suite" y está orientado a roleplay y conversación, con etiquetas que lo vinculan a herramientas como SillyTavern. La arquitectura declarada es MoE (mezcla de expertos) sobre una base Gemma 4, con 25.233.142.046 parámetros totales según los safetensors del modelo base.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar localmente un modelo de rol conversacional de gran tamaño mediante cuantizaciones que van desde 10,7 GB (Q2_K) hasta 27,0 GB (Q8_0). El repositorio tiene 182,9 GB de tamaño total y 1.218 descargas en el momento de la consulta, lo que indica un uso moderado pero real. La licencia es la de Gemma, lo que condiciona el uso comercial.

No se dispone de información publicada sobre longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada. La model card del cuantizador es puramente operativa y remite al modelo base para detalles técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre base Gemma 4 |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), etiquetado como "gemma4" y con 25.233.142.046 parámetros totales según los safetensors. La nomenclatura "A4B" en el nombre sugiere un número de parámetros activos del orden de 4 mil millones, aunque este dato no se confirma en la documentación disponible. El modelo se presenta como un ajuste LoRA sobre una base Gemma 4, orientado a conversación y roleplay, con soporte declarado para inglés y ruso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card del cuantizador no incluye detalles sobre el proceso de entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional orientada a roleplay y diálogo multi-turno.
- Soporte de personajes y escenarios propios de herramientas como SillyTavern.
- Capacidades multilingües limitadas a inglés y ruso según las etiquetas del modelo.
- Formato de pesos GGUF listo para inferencia con llama.cpp y derivados.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento explícito.
- No se documentan capacidades de generación de código o matemáticas.

## Casos de uso

- Roleplay conversacional local: el modelo está etiquetado específicamente para roleplay y SillyTavern, por lo que puede usarse para mantener conversaciones de personaje con contexto multi-turno en entornos de escritorio con GPU de consumo.
- Prototipado de chatbots de ficción interactiva: las cuantizaciones Q4_K_S y Q4_K_M (15,6 y 16,9 GB) permiten desplegar el modelo en una RTX 4090 o similar para pruebas de narrativa ramificada.
- Investigación sobre modelos MoE en inferencia local: al ser un MoE de 25B con cuantizaciones desde 10,7 GB, sirve para estudiar el comportamiento de mezcla de expertos en hardware limitado.
- Evaluación de ajustes LoRA sobre Gemma 4: el modelo base es un LoRA, lo que lo hace útil para comparar el efecto de ajustes específicos de rol frente al modelo Gemma 4 original.
- Despliegue en entornos sin conexión: el formato GGUF y las cuantizaciones pequeñas permiten ejecutar el modelo en estaciones de trabajo aisladas para pruebas de conversación en inglés o ruso.
- Comparación de cuantizaciones: el repositorio ofrece once variantes de cuantización, lo que facilita estudios de degradación de calidad frente a tamaño en un modelo conversacional concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,7 GB (Q2_K) y 27,0 GB (Q8_0) solo para los pesos; hay que añadir memoria para el contexto KV.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 con contexto amplio; GPUs de 16 GB pueden usar Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantizaciones hasta Q6_K (22,7 GB) y en GPUs de 16 GB con Q3_K_M (13,4 GB) o IQ4_XS (14,2 GB).
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dark-Goetia-26B-A4B-v4-GGUF | 25,2B totales (MoE) | no disponible | gemma | GGUF | Roleplay, en/ru |
| Modelo base Dark-Goetia-26B-A4B-v4 | 25,2B totales (MoE) | no disponible | gemma | safetensors | Sin cuantizar |
| Versión i1-GGUF (mradermacher) | 25,2B totales (MoE) | no disponible | gemma | GGUF (imatrix) | Cuantización ponderada |
| Gemma 4 base | no disponible | no disponible | gemma | safetensors | Modelo generalista de origen |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos de la licencia de Gemma antes de un despliegue en producción.
- El modelo está especializado en roleplay y conversación; no se documentan capacidades de razonamiento, código o matemáticas, por lo que no es adecuado para tareas técnicas.
- Solo se declaran inglés y ruso como idiomas; el rendimiento en castellano no está garantizado.
- No se dispone de información sobre sesgos, alucinación o comportamiento en dominios factuales.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rápidas.
- El repositorio ocupa 182,9 GB; la descarga de todas las variantes requiere espacio considerable en disco.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas sin pruebas empíricas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Goetia-26B-A4B-v4-GGUF
- Modelo base: https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v4
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Dark-Goetia-26B-A4B-v4-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Dark-Goetia-26B-A4B-v4-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Gráfica de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
