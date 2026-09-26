# ArchiveStudio/Mixtral-8x22B-v0.1

## Resumen

Mixtral-8x22B es un modelo de lenguaje generativo preentrenado basado en una arquitectura de mezcla dispersa de expertos (Sparse Mixture of Experts, SMoE), desarrollado originalmente por Mistral AI y publicado bajo licencia Apache 2.0. Esta ficha corresponde al repositorio `ArchiveStudio/Mixtral-8x22B-v0.1`, que no es el repositorio oficial de Mistral AI, sino una resubida (mirror) de los pesos originales compatible con vLLM y con la libreria `transformers` de Hugging Face. El repositorio registra 0 descargas y 0 likes, y ocupa 281,2 GB.

El modelo cuenta con 140.620.634.112 parametros totales (~140,6 mil millones) segun los tensores en safetensors, distribuidos en 8 expertos por capa con enrutamiento tipo top-2 (los parametros activos por token se situan en torno a los 39 mil millones, segun la documentacion publica de Mistral AI). Esta disociacion entre parametros totales y activos permite una capacidad de representacion propia de un modelo denso de gran tamano con un coste de computo por token mas cercano al de un modelo mediano.

Es relevante ahora porque combina una ventana de contexto de 64.000 tokens, soporte multilingue nativo (frances, italiano, aleman, espanol e ingles) y un coste de inferencia reducido gracias al enrutamiento disperso, lo que lo hace atractivo para despliegues de alta concurrencia siempre que se disponga del hardware necesario. Se trata, ademas, de un modelo base preentrenado, sin mecanismos de moderacion ni ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas SMoE (8 expertos por capa, enrutamiento top-2 por token) |
| Parametros totales | 140.620.634.112 (~140,6 mil millones) |
| Parametros activos | ~39 mil millones por token (dato de la documentacion publica de Mistral AI, no verificable desde los tensores del repo) |
| Longitud de contexto | 64.000 tokens (segun la documentacion publica de Mixtral-8x22B-v0.1) |
| Tipos de cuantizacion | BF16 en el repo original; cuantizaciones de la comunidad en GGUF, AWQ y GPTQ |
| Idiomas soportados | frances, italiano, aleman, espanol, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

Mixtral-8x22B es un transformer decoder-only en el que cada capa de feed-forward se sustituye por una capa de mezcla dispersa de expertos: ocho redes expertas independientes y un enrutador que selecciona los dos expertos mas adecuados para cada token en cada capa. Con este esquema, cada token activa aproximadamente 39.000 millones de parametros de los ~140.600 millones totales, de modo que los requisitos de computo por token se aproximan a los de un modelo denso de ese tamano activo, mientras que la memoria necesaria para almacenar los pesos se corresponde con los 140,6 mil millones. El modelo usa el tokenizador de `mistral-common` (vocabulario de tipo BPE/SentencePiece con soporte para tokens de control de herramientas).

El modelo es un modelo base preentrenado: no ha pasado por fases de ajuste por instrucciones (SFT), RLHF ni DPO, y la model card no documenta el numero exacto de tokens de entrenamiento ni la composicion del dataset, por lo que esos datos aparecen como no disponibles. La model card indica explicitamente que no incorpora mecanismos de moderacion. El repositorio aqui descrito difiere del release original en el formato de ficheros y en los nombres de los parametros, pero mantiene los pesos originales; esta formateado para servirse con vLLM y para cargarse con `transformers`.

## Capacidades

- Generacion de texto autoregresiva en ingles, frances, italiano, aleman y espanol.
- Razonamiento de proposito general y comprension lectora propios de un modelo base de gran escala.
- Generacion de codigo, aunque sin ajuste especifico de instrucciones ni de codigo.
- Capacidad matematica basica y resolución de problemas aritmeticos simples.
- No soporta de forma nativa tool calling ni function calling: al ser un modelo base, no ha sido entrenado con plantillas de herramientas ni con modo de razonamiento explicito.
- No incluye modo "thinking", capacidades de vision, audio ni multimodalidad.
- Al ser un modelo sin ajuste por instrucciones, no responde de forma fiable a formatos conversacionales ni de chat sin un ajuste posterior.

## Casos de uso

- Base para fine-tuning supervisado: al ser un modelo preentrenado, se puede ajustar con SFT o DPO sobre datos propios para tareas concretas de dominio (legal, medico, industrial) y obtener un modelo de instrucciones especifico.
- Generacion de texto a gran escala con contexto largo: puede procesar documentos completos de hasta 64.000 tokens, lo que resulta util para resumir informes extensos o contratos sin necesidad de trocear el contenido.
- Traduccion multilingue entre sus cinco idiomas nativos: por ejemplo, traduccion de documentacion tecnica de aleman a espanol manteniendo el contexto de tablas y referencias cruzadas.
- Analisis y extraccion de informacion en corpus largos: procesamiento por lotes de articulos, actas o expedientes para extraer entidades y relaciones dentro de una sola ventana de contexto.
- Generacion asistida de codigo en pipelines internos: completado de funciones, generacion de tests y documentacion tecnica a partir de repositorios procesados como contexto largo.
- Investigacion y experimentacion en arquitecturas MoE: sirve como referencia para estudiar enrutamiento de expertos, eficiencia de parametros activos y comportamiento de la decodificacion dispersa.
- Motor base para asistentes conversacionales: previo ajuste por instrucciones e integracion de una capa de moderacion y de plantillas de herramientas, puede alimentar agentes multi-turno.
- Servicio de generacion de contenido editorial: redaccion y reescritura de textos largos donde la coherencia a lo largo de decenas de miles de tokens es relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion, y la model card incluida en la ficha remite a la entrada de blog de Mistral AI sobre Mixtral-8x22B, que no forma parte de los datos proporcionados. No se reproduce ningun numero de MMLU, HumanEval, GSM8K u otras suites para evitar datos no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~282 GB en BF16, ~141 GB en FP8/INT8, ~70-75 GB en 4 bits y ~35-53 GB en 2-3 bits. A esto hay que sumar la cache KV, que crece de forma lineal con la longitud de contexto (hasta 64.000 tokens).
- GPU recomendadas en BF16: 8x H100 80 GB o 8x A100 80 GB, dado que los pesos por si solos superan la memoria de cuatro aceleradores de 80 GB.
- GPU recomendadas en FP8: 2x H100 80 GB o 2x A100 80 GB, dejando margen para cache KV.
- GPU recomendadas en 4 bits: 1x H100 80 GB, 2x A100 40 GB o 4x RTX 4090 de 24 GB.
- Uso en GPU de consumo: con cuantizacion de 4 bits cabe en configuraciones de 3 a 4 GPU consumer de 24 GB (RTX 3090/4090), pero no en una sola tarjeta de 24 GB. El rendimiento por token depende del ancho de banda agregado de la interconexion entre GPUs.
- Opciones de despliegue: vLLM (soporte nativo segun la model card y la etiqueta `vllm`), `transformers` con aceleracion de Hugging Face, cuantizaciones GGUF para llama.cpp u Ollama, y confirmar soporte de TGI segun version.
- Latencia y throughput: no disponibles en la informacion proporcionada. La ventaja teorica es que el coste por token se calcula sobre ~39.000 millones de parametros activos, no sobre los 140,6 mil millones totales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mixtral-8x22B-v0.1 | MoE (8 expertos, top-2) | ~140,6 mil millones | ~39 mil millones | 64.000 tokens | Apache 2.0 | Pesos abiertos |
| Mixtral-8x7B-v0.1 | MoE (8 expertos, top-2) | ~46,7 mil millones | ~12,9 mil millones | 32.000 tokens | Apache 2.0 | Pesos abiertos |
| Llama 3 70B | Transformer denso | ~70 mil millones | ~70 mil millones | 8.000 tokens | Licencia comunitaria de Meta | Pesos abiertos con restricciones |
| Qwen2-72B | Transformer denso | ~72 mil millones | ~72 mil millones | 128.000 tokens (configuracion de la version 2) | Apaches 2.0 / licencia especifica segun variante | Pesos abiertos |

Nota: los datos de contexto y parametros activos de los modelos comparados provienen de su documentacion publica habitual y deben verificarse contra la ultima version de cada repositorio. No se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no sigue instrucciones de forma fiable y puede producir continuaciones irrelevantes o peligrosas en formato conversacional sin un ajuste previo.
- La model card advierte de que no incorpora mecanismos de moderacion, por lo que no debe exponerse directamente a usuarios finales sin una capa de filtrado.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala, especialmente en tareas factuales y en contextos largos.
- No se documentan en el repositorio los sesgos de entrenamiento, la composicion del dataset ni el numero de tokens vistos, lo que dificulta una evaluacion de riesgos previa al despliegue.
- El soporte multilingue oficial se limita a frances, italiano, aleman, espanol e ingles; el rendimiento en otras lenguas es incierto.
- Este repositorio concreto es una resubida no oficial: presenta 0 descargas, 0 likes y una fecha de creacion posterior a la del lanzamiento original, por lo que conviene verificar la integridad de los pesos frente al repositorio oficial `mistralai/Mixtral-8x22B-v0.1` antes de usarlos en produccion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el repositorio incluye una clausula `extra_gated_description` en los metadatos que apunta a la politica de privacidad de Mistral AI; conviene revisar las condiciones del repositorio oficial antes de redistribuir.
- El coste de hardware es elevado: no cabe en una unica GPU de consumo ni en una GPU profesional de 80 GB en precision BF16.
- La ausencia de soporte nativo de tool calling obliga a implementar el formateo de herramientas por fuera del modelo o a realizar un ajuste especifico.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/ArchiveStudio/Mixtral-8x22B-v0.1
- Repositorio oficial del modelo: https://huggingface.co/mistralai/Mixtral-8x22B-v0.1
- Entrada de blog de Mistral AI sobre Mixtral-8x22B: https://mistral.ai/news/mixtral-8x22b
- Libreria `mistral-common` (tokenizador): https://github.com/mistralai/mistral-common
- vLLM (motor de servido compatible): https://github.com/vllm-project/vllm
- Hugging Face `transformers`: https://github.com/huggingface/transformers
