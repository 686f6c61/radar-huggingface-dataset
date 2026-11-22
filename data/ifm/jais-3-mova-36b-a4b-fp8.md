# IFM/Jais-3-MoVA-36B-A4B-FP8

## Resumen

Jais-3-MoVA-36B-A4B-FP8 es la version cuantizada en FP8 del modelo sparse de la familia Jais-3, desarrollada por IFM (Inception42). Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con una arquitectura denominada Mixture-of-Values attention (MoVA), que almacena 37.444.792.020 parametros reales (etiquetados comercialmente como 36B) y activa aproximadamente 4B por token. Su ventana de contexto alcanza los 512K tokens, lo que lo situa en la liga de modelos de contexto muy largo.

El modelo base es `inception42/Jais-3-MoVA-36B-A4B`, y esta variante FP8 solo cuantiza las capas lineales de los expertos enrutados de las capas transformer 3 a 47, manteniendo en BF16 el resto de tensores (atencion, expertos compartidos, routers, las tres primeras capas densas, expertos de valor MoVA, normalizaciones, embeddings y `lm_head`). El objetivo es reducir la huella de memoria y acelerar la inferencia en hardware con soporte FP8 sin degradar de forma apreciable la calidad respecto al modelo BF16.

Es relevante ahora porque combina tres tendencias clave: eficiencia por activacion dispersa (MoE), contexto ultralargo (512K) y cuantizacion FP8 lista para produccion, todo bajo licencia Apache 2.0 y con formatos alternativos (GGUF, MLX) publicados en la misma coleccion. Esta orientado principalmente al arabe y al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Mixture-of-Values attention (MoVA) |
| Parametros totales | 37.444.792.020 |
| Parametros activos | ~4B por token |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | FP8 E4M3FN (pesos estaticos, escala FP32 por bloque 128x128; activaciones dinamicas FP8, escala por grupo 1x128); BF16 para el resto de tensores; GGUF y MLX (4bit/8bit/bf16) en repositorios separados |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8); GGUF y MLX disponibles en la coleccion |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE) y una innovacion propia denominada Mixture-of-Values attention (MoVA), que introduce expertos de valor especificos en el mecanismo de atencion. El modelo cuenta con 37.444.792.020 parametros totales pero solo activa alrededor de 4B por token, lo que reduce el coste computacional por inferencia manteniendo una capacidad de representacion propia de un modelo mucho mayor. La ventana de contexto es de 512K tokens.

En cuanto a los datos de entrenamiento, numero de tokens, composicion del dataset y si hubo RLHF/DPO, no se dispone de informacion en la documentacion proporcionada. La model card solo detalla el esquema de cuantizacion FP8: pesos estaticos E4M3FN con una escala FP32 por bloque de 128x128 y activaciones dinamicas FP8 con una escala por grupo de 1x128 a lo largo de la dimension de canales de entrada. Se indica que el tamano intermedio de los expertos enrutados (768) es divisible en bloques de cuantizacion de 128 anchos completos con TP=1 y TP=2, por lo que estos tamanos de tensor-parallel son los recomendados.

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Razonamiento y generacion de codigo (segun la categoria `text-generation` y los tags del modelo; sin datos especificos de benchmarks de codigo en la informacion disponible).
- Capacidad de contexto ultralargo: hasta 512K tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Arquitectura MoE con activacion dispersa (~4B de 36B), lo que permite inferencia mas economica que un modelo denso del mismo tamano.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos legales o contractuales extensos: con 512K tokens de contexto, el modelo puede ingerir contratos completos o expedientes de cientos de paginas en una sola pasada y responder preguntas sobre clausulas concretas sin necesidad de fragmentacion.
- Atencion al cliente en arabe e ingles: el modelo gestiona conversaciones multi-turno con historial largo gracias a su ventana de contexto, manteniendo coherencia en dialogos prolongados en ambos idiomas.
- Procesamiento de corpus arabes a gran escala: es uno de los pocos modelos abiertos con soporte nativo de arabe y contexto de 512K, util para resumen, extraccion de entidades y clasificacion de documentos en ese idioma.
- Despliegue en produccion con coste contenido: al activar solo ~4B parametros por token y ofrecer una variante FP8, permite servir un modelo de 36B en hardware con soporte FP8 con menor huella de memoria que el BF16 equivalente.
- Investigacion sobre arquitecturas MoE y MoVA: el modelo y sus variantes (BF16, FP8, GGUF, MLX) sirven como base para estudiar el comportamiento de la atencion con expertos de valor y la cuantizacion selectiva de expertos.
- Inferencia en Apple silicon: las variantes MLX (4bit, 8bit, bf16) permiten ejecutar el modelo en equipos con chip Apple para prototipado y desarrollo local.
- Integracion en pipelines de generacion de texto con `transformers`: el modelo requiere `custom_code`, lo que permite cargarlo directamente en el ecosistema Hugging Face para tareas de generacion.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero los datos numericos de las metricas no estan disponibles en la informacion proporcionada (solo se muestran las cabeceras y la fila de numero de parametros). Los modelos de referencia comparados son:

| Modelo | Parametros | Parametros activos |
|---|---|---|
| Jais-3-MoVA-36B-A4B | 36B | 4B |
| Falcon-H1-34B-Instruct | 34B | 34B |
| Gemma-4-31B-it | 31B | 31B |
| Muse-Glimmer-30B | 30B | 30B |
| Qwen3.8-27B | 27B | 27B |
| Fanar-2-27B | 27B | 27B |

Los valores concretos de MMLU, HumanEval, GSM8K u otras metricas no se han publicado en la informacion disponible. La model card afirma que la version FP8 rinde de forma cercana al modelo BF16 original en sus evaluaciones, sin proporcionar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 48,4 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos en FP8; el modelo BF16 requeriria aproximadamente el doble (~75 GB).
- GPU recomendadas: hardware con soporte FP8 nativo, como H100 (Hopper) o GPUs de la generacion Blackwell; A100 no dispone de FP8 nativo y ejecutaria la cuantizacion con menor ventaja.
- Tensor parallelism: se recomiendan TP=1 y TP=2, ya que el tamano intermedio de los expertos enrutados (768) es divisible en bloques de cuantizacion de 128 anchos completos en esos grados.
- Ajuste en GPU de consumo: no disponible en la informacion proporcionada; con 48,4 GB en FP8 no cabe en GPUs de consumo de 24 GB sin cuantizacion adicional (las variantes GGUF y MLX estan pensadas para esos escenarios).
- Opciones de despliegue: `transformers` (requiere `custom_code`), llama.cpp y Ollama (via GGUF), MLX (Apple silicon). vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-MoVA-36B-A4B-FP8 | 36B | 4B | 512K | Apache 2.0 | Hugging Face (FP8, GGUF, MLX) |
| Falcon-H1-34B-Instruct | 34B | 34B | no disponible | no disponible | no disponible |
| Gemma-4-31B-it | 31B | 31B | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B | 27B | no disponible | no disponible | no disponible |

La ventaja estructural de Jais-3-MoVA-36B-A4B frente a los modelos densos de tamano similar es la activacion dispersa (~4B de 36B), que reduce el coste por token, y su contexto de 512K. Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran arabe e ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada; al ser un modelo entrenado principalmente en arabe e ingles, puede reflejar sesgos culturales y linguisticos de esos corpus.
- Alucinacion: no se proporcionan datos especificos sobre tasas de alucinacion; como todo modelo generativo, existe riesgo, especialmente en contextos de 512K donde la recuperacion de informacion distante puede degradarse.
- Cuantizacion FP8 selectiva: solo se cuantizan los expertos enrutados de las capas 3-47; el resto permanece en BF16, por lo que el ahorro de memoria es parcial respecto al modelo completo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo requiere `custom_code` en `transformers`, lo que implica confiar en codigo remoto del repositorio al cargarlo.
- Despliegue: la ventaja de FP8 depende de hardware con soporte nativo; en GPUs sin FP8 el rendimiento puede no mejorar respecto a BF16.
- Madurez: el modelo tiene 680 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion aun limitada y poca validacion independiente.
- Fecha de creacion (2026-09-29) y ultima actualizacion (2026-11-22): verificar la version vigente antes de desplegar en produccion.

## Enlaces

- Modelo FP8 en Hugging Face: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-FP8
- Modelo base BF16: https://huggingface.co/inception42/Jais-3-MoVA-36B-A4B
- Coleccion Jais-3 de IFM: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Variante GGUF (llama.cpp / Ollama): https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-GGUF
- Variante MLX 4bit: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-4bit
- Variante MLX 8bit: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-8bit
- Variante MLX bf16: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-bf16
- Paper de referencia (arXiv): 2611.10224
