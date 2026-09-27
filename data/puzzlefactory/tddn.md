# PuzzleFactory/TDDN

## Resumen

TDDN (Text-aligned Diffused DINO Network) es un modelo de representacion visual alineado con texto, desarrollado por PuzzleFactory y publicado en HuggingFace junto con el proyecto de investigacion descrito en el paper arXiv:2609.07937. No es un modelo generativo de lenguaje: su pipeline en HuggingFace es `feature-extraction` y su funcion es producir embeddings visuales de grano fino alineados con un espacio textual, pensados para servir como encoder de percepcion en sistemas de razonamiento visual estructurado, en particular la resolucion de puzzles de imagen.

El problema que aborda es concreto: los VLM actuales construidos sobre backbones ViT basados en CLIP sacrifican detalle visual fino a cambio de semantica de alto nivel, y el paper sostiene que esa perdida se propaga aguas abajo y degrada tareas que exigen percepcion precisa, como los puzzles visuales. Para recuperar ese detalle, TDDN fusiona DINOv3 y CleanDIFT en un encoder de percepcion denominado DiffusedDINO y lo alinea despues con un encoder de texto congelado mediante un pipeline ligero.

El modelo se construye en dos etapas: (1) DiffusedDINO, que combina la precision perceptual de CleanDIFT con la consistencia semantica de DINOv3, y (2) una alineacion vision-lenguaje ligera sobre aproximadamente 590.000 pares imagen-texto. El checkpoint publicado ocupa 0.3 GB y suma 78.459.671 parametros segun los safetensors. El acceso esta restringido (gated): requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de vision (DINOv3 ViT-H/16+ fusionado con CleanDIFT, stage DiffusedDINO) mas alineacion ligera con encoder de texto congelado |
| Parametros totales | 78.459.671 (segun safetensors del repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelos base | facebook/dinov3-vith16plus-pretrain-lvd1689m, sentence-transformers/all-roberta-large-v1, CompVis/cleandift, Charles-Elena/stable-diffusion-2-1 |
| Tamano del repositorio | 0.3 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

TDDN no es un transformer autoregresivo ni un modelo de lenguaje. Es un sistema de representacion visual en dos bloques. El primero, DiffusedDINO, es un encoder de percepcion que fusiona dos fuentes complementarias: CleanDIFT, que aporta precision perceptual, y DINOv3 (variante ViT-H/16+ preentrenada en LVD-1689M), que aporta consistencia semantica. El segundo bloque es una alineacion vision-lenguaje ligera que proyecta las representaciones visuales al espacio de un encoder de texto congelado, concretamente `sentence-transformers/all-roberta-large-v1`.

El entrenamiento de la etapa de alineacion se realizo sobre aproximadamente 590.000 pares imagen-texto, segun el abstract del paper. El modelo base citado incluye tambien `Charles-Elena/stable-diffusion-2-1`, lo que apunta a un componente de difusion en la construccion del pipeline (coherente con el uso de CleanDIFT, derivado de Stable Diffusion, y con la etiqueta `diffusion` del repo). No se especifica en la informacion disponible si hubo RLHF, DPO o tecnicas de preferencia, algo poco habitual en un modelo de representacion. La innovacion tecnica central es precisamente la fusion DINOv3 + CleanDIFT para recuperar detalle fino que los backbones tipo CLIP pierden.

El proyecto incluye un modelo hermano, TDN (`PuzzleComm/TDN`), descrito como la contraparte controlada de un solo encoder: parte de la representacion visual DINOv3 ViT-H/16+ congelada y la alinea con RoBERTa-large congelado usando el mismo pipeline ligero. TDN sirve por tanto como ablacion para medir la contribucion de la fusion DiffusedDINO frente al uso de DINOv3 en solitario.

## Capacidades

- Extraccion de features visuales de grano fino, orientada a tareas de percepcion precisa y no a semantica de alto nivel.
- Alineacion vision-lenguaje: genera representaciones visuales comparables con embeddings de texto en el espacio de RoBERTa-large.
- Similitud imagen-texto y recuperacion cruzada (retrieval) apoyada en esa alineacion.
- Percepcion reforzada para razonamiento visual estructurado, con el caso de uso central de los puzzles de imagen.
- Uso como encoder de percepcion aguas arriba de un VLM, sustituyendo o complementando backbones basados en CLIP.
- Capacidad de servir como modelo de extraccion de caracteristicas general (feature-extraction) para vision por computador.
- Idiomas: unicamente ingles en el lado textual.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, vision generativa, audio ni generacion de texto.

## Casos de uso

- Resolucion de puzzles visuales: el modelo proporciona las representaciones de grano fino necesarias para emparejar piezas, detectar continuidad de bordes y evaluar coherencia local, tarea donde los backbones CLIP fallan por perdida de detalle.
- Encoder de percepcion en un VLM: se integra como etapa visual previa a un modelo de lenguaje, de modo que el LLM recibe representaciones ricas en detalle en lugar de embeddings de alto nivel.
- Recuperacion imagen-texto: la alineacion con RoBERTa-large permite indexar imagenes y consultarlas por descripcion textual en ingles, util en catalogos y buscadores visuales.
- Clasificacion y agrupamiento visual: las features extraidas sirven como entrada para clasificadores ligeros o clustering de imagenes sin reentrenar el encoder.
- Control de calidad visual en pipelines de imagen: comparar la representacion de una imagen con un texto de referencia para detectar desviaciones, por ejemplo en generacion o edicion de imagen.
- Investigacion en representacion visual: TDDN y su contraparte TDN permiten estudiar experimentalmente el efecto de fusionar DINOv3 con CleanDIFT frente a usar DINOv3 en solitario.
- Deteccion de diferencias y correspondencia fina entre imagenes: util en tareas de verificacion visual, inspeccion o comparacion de variantes de un mismo contenido.
- Base para tareas de razonamiento visual multi-paso: al preservar detalle local, es adecuado como modulo de percepcion en pipelines que encadenan varias operaciones sobre la misma imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El abstract del paper arXiv:2609.07937 afirma cualitativamente que la perdida de detalle de los backbones CLIP se propaga aguas abajo, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otras) en los materiales proporcionados, por lo que no se presentan tablas de resultados.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 0.3 GB de pesos (78,46 M de parametros), mas overhead de activaciones; se puede ejecutar comodamente en cualquier GPU con 4 GB o mas.
- VRAM estimada en FP16/BF16: aproximadamente 0.16 GB de pesos, margen amplio para lotes grandes o resoluciones altas.
- Cabe sin problema en GPUs de consumo: RTX 3060, 4060, 4070, 4080, 4090 y equivalentes; tambien en CPU para inferencia por lotes pequenos.
- GPUs de datacenter (A100, H100) solo tienen sentido si se procesan grandes volumenes o se integra como etapa de un pipeline mayor.
- Opciones de despliegue: al ser un modelo de tipo feature-extraction en safetensors, el uso natural es via `transformers` (AutoModel) con el codigo de DINOv3 y el modulo de alineacion; no se documentan pesos GGUF ni soporte especifico para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada. Al tratarse de un encoder de ~78 M de parametros efectivos, se espera una latencia baja por imagen, pero no hay cifras publicadas.
- Restriccion de acceso: el repo es gated, por lo que es necesario autenticarse y aceptar condiciones antes de descargar los pesos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| TDDN (PuzzleFactory) | Encoder visual alineado con texto (DINOv3 + CleanDIFT) | 78,46 M (checkpoint) | no disponible | apache-2.0 | gated |
| TDN (PuzzleComm) | Encoder visual alineado con texto (solo DINOv3) | no disponible | no disponible | no disponible | no disponible |
| DINOv3 ViT-H/16+ (facebook) | Encoder visual auto-supervisado | no disponible en la informacion | no disponible | no disponible | publico |
| Backbone ViT basado en CLIP (referencia del paper) | Encoder vision-lenguaje | no disponible | no disponible | variable | publico |

La comparacion cuantitativa de rendimiento no esta disponible: ni el paper ni los materiales consultados incluyen cifras que permitan contrastar TDDN con TDN, DINOv3 o un backbone CLIP en tareas concretas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni imagenes, solo representaciones; cualquier expectativa de chatbot o generacion es incorrecta.
- Cobertura linguistica limitada al ingles en el lado textual, lo que restringe retrieval y alineacion en otros idiomas.
- Sesgos conocidos: no disponible. Al entrenarse sobre pares imagen-texto no documentados en detalle, no puede descartarse sesgo de dominio ni de composicion del dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en tareas de similitud o matching si las representaciones no generalizan fuera del dominio de entrenamiento.
- Limitacion de contexto: no disponible; al ser un encoder, la nocion de ventana de contexto no aplica igual que en un LLM, pero el comportamiento con imagenes de resolucion muy alta o muy baja no esta documentado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el acceso es gated y debe aceptarse la condiciones de HuggingFace antes de la descarga; conviene verificar ademas las licencias de los modelos base (DINOv3, RoBERTa-large, CleanDIFT, Stable Diffusion 2-1) por si imponen condiciones adicionales.
- Caveat de produccion: el proyecto esta especializado en puzzles y razonamiento visual estructurado; su rendimiento fuera de ese dominio no esta validado con benchmarks publicos.
- Dependencia de terceros: requiere el codigo y los pesos del backbone DINOv3 y del encoder de texto RoBERTa-large, lo que anade complejidad al despliegue frente a un modelo autocontenido.
- Los datos de fecha del repo consultados indican creacion y actualizacion el 2026-09-27, sin historial de versiones adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PuzzleFactory/TDDN
- Modelo hermano (solo DINOv3): https://huggingface.co/PuzzleComm/TDN
- Referencia adicional del proyecto: https://huggingface.co/PuzzleBench/TDDN
- Paper (abstract): https://arxiv.org/abs/2609.07937
- Paper (PDF): https://arxiv.org/pdf/2609.07937
- Ficha en registro de terceros: https://free2aitools.com/model/puzzlebench/tddn
