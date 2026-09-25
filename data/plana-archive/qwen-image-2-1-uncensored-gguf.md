# Plana-Archive/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Este repositorio contiene cuantizaciones en formato GGUF del modelo de generacion de imagenes Qwen-Image-2.1, publicadas bajo el identificador Plana-Archive/Qwen-Image-2.1-Uncensored-GGUF. Se trata de una redistribucion derivada (relacion `base_model_relation: quantized`) del modelo original Qwen/Qwen-Image-2.1, con dos variantes: una version "uncensored" y una version que conserva los pesos upstream sin modificar. El objetivo es permitir la ejecucion local del modelo en GPUs de consumo mediante el nodo GGUF de ComfyUI, reduciendo el peso del transformer de difusion desde los 14,23 GB del BF16 hasta los 4,15 GB de la cuantizacion Q4_0.

El paquete incluye, ademas del transformer de difusion cuantizado, el codificador de texto y el VAE necesarios para el pipeline completo. El text encoder es un Qwen3-VL de 8B (17,53 GB en BF16 o 9,35 GB en INT8) y el VAE ocupa 676 MB en BF16. El recuento de parametros del repositorio, segun los pesos safetensors, es de 7.115.124.736 parametros (aproximadamente 7,1 mil millones).

La relevancia actual del repositorio es doble: por un lado, acerca un modelo de generacion de imagenes de gran tamano a hardware de consumo mediante cuantizacion; por otro, la variante "uncensored" elimina los filtros de seguridad del modelo original, lo que lo hace atractivo para investigacion en seguridad y red teaming, pero tambien conlleva riesgos de uso que conviene evaluar antes de cualquier despliegue. La licencia es de tipo `other`, identificada como `qwen-research`, lo que condiciona el uso comercial. El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de imagenes a partir de texto (text-to-image); el detalle interno de la arquitectura no se especifica en la informacion disponible |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 mil millones), dato de los pesos safetensors |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF (transformer cuantizado); safetensors para FP8 e INT8 ConvRot, text encoder y VAE |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Pipeline declarado | text-to-image |
| Libreria | gguf |
| Tamano del repositorio | 83,6 GB |
| Componentes incluidos | Transformer de difusion, text encoder Qwen3-VL 8B, VAE |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original Qwen-Image-2.1 ni su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se puede reconstruir a partir de los archivos del repositorio es la estructura del pipeline de inferencia: un transformer de difusion (carpeta `diffusion_models`), un codificador de texto basado en Qwen3-VL de 8B parametros en precision BF16 o INT8 ConvRot, y un VAE especifico del modelo (`qwen_image_2.1_vae_bf16.safetensors`, 676 MB). El nodo de ComfyUI espera el tipo de text encoder `qwen_image`, lo que confirma que el CLIP loader debe configurarse con esa arquitectura concreta.

En cuanto al trabajo realizado en este repositorio, se trata exclusivamente de cuantizacion y redistribucion: no se documenta ningun reentrenamiento, fine-tuning ni proceso de alineacion adicional. La variante denominada "uncensored" se ofrece en paralelo a una variante que conserva los pesos upstream (los archivos sin el sufijo `UC`), sin que la model card explique la metodologia exacta aplicada para eliminar el filtrado. El autor recomienda Q4_K_M como el mejor equilibrio entre tamano y calidad, y proporciona tanto una version BF16 de referencia como formatos FP8 e INT8 ConvRot para el transformer.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image), con flujos de trabajo oficiales disponibles tanto para text-to-image como para edicion de imagenes.
- Edicion de imagenes: el repositorio enlaza una plantilla oficial de ComfyUI para `image_qwen_image_2_1_image_edit`, lo que indica soporte de tareas de edicion ademas de la generacion pura.
- Codificacion de texto mediante un modelo multimodal Qwen3-VL de 8B, que aporta comprension de prompts complejos y potencialmente de referencias visuales en los flujos de edicion.
- Ejecucion totalmente local en ComfyUI mediante el nodo `Unet Loader (GGUF)`, sin necesidad de llamadas a servicios externos.
- Varias precisiones de pesos para adaptar el consumo de memoria al hardware disponible.
- No se documentan en la informacion proporcionada capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni generacion de audio o video.

## Casos de uso

- Generacion de ilustraciones conceptuales en local: con la cuantizacion Q4_K_M (4,60 GB) y el text encoder en INT8 (9,35 GB), el pipeline completo cabe en GPUs de consumo de gama alta, lo que permite generar arte conceptual iterativo sin depender de APIs externas.
- Edicion de imagenes en flujos de posproduccion: usando la plantilla oficial de image edit de ComfyUI, el modelo puede emplearse para retoques guiados por prompt sobre imagenes existentes dentro de un grafo de nodos reproducible.
- Creacion de assets para videojuegos y prototipado de interfaz: generacion por lotes de texturas, iconos o bocetos de UI en un servidor local, integrada en un pipeline de build que sustituya al disenador para iteraciones rapidas.
- Investigacion en seguridad de modelos generativos (red teaming): la variante "uncensored" permite estudiar el comportamiento del modelo sin los filtros del original, documentar que tipo de contenido se genera y evaluar la eficacia de las mitigaciones existentes.
- Generacion de datasets sinteticos: produccion controlada de imagenes etiquetadas para entrenar o evaluar otros modelos de vision, aprovechando la ejecucion local para no exponer datos a terceros.
- Flujos de trabajo offline o en entornos air-gapped: al alojarse todos los componentes (transformer, text encoder y VAE) en el mismo repositorio, es posible montar una instalacion de ComfyUI completamente desconectada de internet.
- Prototipado rapido de ideas visuales en equipos de marketing o diseno: con las cuantizaciones Q4_0 (4,15 GB) se puede desplegar en equipos con GPU modesta para sesiones exploratorias donde prima la velocidad de iteracion sobre la fidelidad final.

## Benchmarks y rendimiento

La model card incluye una referencia grafica a un benchmark (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se proporcionan los valores numericos ni las tablas de resultados en la informacion disponible. No hay datos de metricas objetivas (FID, CLIP score, evaluaciones humanas u otras) ni comparaciones cuantitativas con otros modelos.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

Estimaciones calculadas a partir de los tamanos de archivo declarados en el repositorio (transformer + text encoder + VAE). No incluyen el overhead del runtime de ComfyUI ni los buffers de activaciones durante el muestreo.

- Configuracion minima aproximada: Q4_0 (4,15 GB) con text encoder INT8 (9,35 GB) y VAE (0,68 GB) suma unos 14,2 GB de pesos; el autor indica que la opcion mas eficiente en memoria es el text encoder INT8 ConvRot.
- Configuracion recomendada para calidad/tamano: Q4_K_M (4,60 GB) con text encoder INT8 (9,35 GB) y VAE, alrededor de 14,6 GB de pesos.
- Configuracion de mayor fidelidad: BF16 (14,23 GB) o Q8_0 (7,59 GB) con text encoder BF16 (17,53 GB) y VAE, entre 22,4 y 32,4 GB de pesos.
- Cabe en GPU de consumo: si, las combinaciones Q4_0 y Q4_K_M con text encoder INT8 son viables en GPUs de 16 GB o mas (por ejemplo, RTX 4080/4090 o equivalentes). Las configuraciones Q8_0 y BF16 con text encoder BF16 exigen 24 GB o mas o el uso de memoria del sistema como respaldo.
- GPUs profesionales: A100, H100 o L40S permiten cargar las variantes de mayor precision completas en VRAM y maximizar el throughput.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (se recomienda el fork `leejet/ComfyUI-GGUF`, con soporte nativo de Qwen-Image 2.1). Los nodos necesarios son `Unet Loader (GGUF)`, `CLIPLoader` con tipo `qwen_image` y `VAELoader`. No se documentan otros runners (vLLM, TGI, Ollama) para este modelo, dado que es un modelo de difusion y no un LLM.
- Latencia y throughput: no disponibles. El autor solo senala que mantener el transformer GGUF en VRAM es lo optimo porque la velocidad es critica durante el muestreo, y sugiere dejar el text encoder en RAM si es necesario. La model card aparece truncada en este apartado.
- Nota de compatibilidad: si se usa el fork antiguo `city96/ComfyUI-GGUF` puede aparecer el error `Unknown model architecture!`; hay que actualizar al fork `leejet` o anadir `ModelQwenImage` a `tools/convert.py`.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizaciones | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Plana-Archive/Qwen-Image-2.1-Uncensored-GGUF (este repositorio) | 7,1 mil millones (segun safetensors) | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0) + safetensors (BF16, FP8, INT8 ConvRot) | qwen-research | HuggingFace, 0 descargas, 0 likes | Incluye text encoder y VAE; variante censurada y no censurada |
| Qwen/Qwen-Image-2.1 (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace | Modelo original del que derivan estas cuantizaciones |
| Cuantizaciones sin modificar del mismo repositorio (`qwen-image-2.1-Q8_0`, `Q6_K`, `Q5_K_M`, `Q4_K_M`, `Q4_0`) | 7,1 mil millones | GGUF | qwen-research | Incluidas en la rama `base` del repositorio | Pesos upstream sin la modificacion "uncensored"; Q4_K_M de 4,60 GB y Q4_0 de 4,05 GB |
| Otros modelos de generacion de imagenes comparables | No disponible | No disponible | No disponible | No disponible | No se proporciona informacion sobre alternativas en la documentacion consultada |

## Limitaciones y advertencias

- Naturaleza "uncensored": la variante principal elimina los filtros de seguridad del modelo original. Esto implica riesgo elevado de generar contenido no apto (violencia, contenido sexual, representaciones de personas reales o marcas registradas) sin las salvaguardas que incorpora el modelo base.
- Licencia restrictiva: la licencia es `other` / `qwen-research`, orientada a investigacion. Hay que revisar los terminos completos antes de cualquier uso comercial; la informacion proporcionada no detalla condiciones de atribucion, redistribucion ni limites de uso.
- Origen de los pesos: la model card enlaza los archivos a la ruta `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`, mientras que el repositorio consultado es `Plana-Archive/Qwen-Image-2.1-Uncensored-GGUF`. Esto sugiere una copia o espejo, sin que se documente el proceso de cuantizacion ni de "descensura" aplicado, lo que dificulta auditar la fidelidad de los pesos.
- Model card incompleta: el documento se corta en la seccion de memoria y rendimiento, por lo que faltan indicaciones sobre gestion de RAM, tiempos de muestreo y resoluciones recomendadas.
- Ausencia de datos de evaluacion: no hay metricas numericas de calidad, ni evaluaciones comparativas con el modelo base, ni informacion sobre sesgos o tasas de alucinacion visual.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto del text encoder. El soporte multilingue de los prompts no puede darse por supuesto.
- Riesgo de artefactos de cuantizacion: las variantes de 4 bits (Q4_K_M, Q4_0) pueden degradar el detalle fino, la coherencia de texto dentro de la imagen y la reproduccion de rasgos faciales. El autor solo recomienda Q4_K_M como compromiso, sin cuantificar la perdida de calidad.
- Madurez del repositorio: 0 descargas y 0 likes, sin issues ni validacion de la comunidad. No hay evidencia de que los archivos hayan sido probados de forma independiente.
- Requisitos de memoria: incluso en Q4_0, el pipeline completo ronda los 14 GB de pesos, por lo que no es viable en GPUs de 8 GB sin recurrir a offloading a RAM y asumir una penalizacion severa de velocidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Plana-Archive/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork recomendado): https://github.com/leejet/ComfyUI-GGUF
- Plantilla oficial de text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Archivos de cuantizacion (rutas citadas en la model card): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/qwen-image-2.1-UC-Q4_K_M.gguf
- Text encoder Qwen3-VL 8B INT8: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
