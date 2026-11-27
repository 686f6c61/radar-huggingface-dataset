# chatrlabs/ChatrXL-Uncensored

## Resumen

ChatrXL Uncensored es un modelo de generacion de imagenes texto-a-imagen desarrollado por Chatr Labs, publicado en Hugging Face bajo el identificador `chatrlabs/ChatrXL-Uncensored`. Se trata de un checkpoint de la familia SDXL/Pony orientado a generacion local sin filtros de prompt ni verificador de seguridad de salida, distribuido en dos variantes completas en FP16: una version de calidad a 20 pasos y una version acelerada DMD2 a 8 pasos. El modelo resuelve el caso de uso de creadores que necesitan control total sobre el proceso de generacion en local, sin dependencia de servicios en la nube ni de moderacion externa.

La relevancia del lanzamiento reside en su empaquetado: ambos ficheros son checkpoints autonomos de 6,94 GB que incluyen el VAE y los dos codificadores de texto, por lo que no requieren descargar el modelo base SDXL por separado. Ademas, se distribuyen flujos de trabajo listos para ComfyUI (probados con la version 0.43.0 usando solo nodos nativos) y los embeddings recomendados para prompt positivo y negativo.

El modelo se apoya en la linea evolutiva v3.3 (build de calidad) y v3.2 DMD2 (build rapido). La build DMD2 no es una destilacion de la build de calidad, por lo que pueden aparecer diferencias de composicion entre ambas. La licencia es propietaria (`chatrlabs-model-license-1.0`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (familia SDXL/Pony, U-Net con VAE y doble codificador de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, sin ventana de contexto textual) |
| Tipos de cuantizacion | FP16 (ambos checkpoints publicados en FP16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (prompts en lenguaje natural, sin lista oficial de idiomas) |
| Licencia | `chatrlabs-model-license-1.0` (propietaria, `license: other`) |
| Formato de pesos | safetensors (checkpoint unico con VAE y text encoders incluidos) |

## Arquitectura y entrenamiento

ChatrXL Uncensored es un modelo de difusion de la familia SDXL/Pony. La arquitectura sigue el esquema SDXL: un U-Net de difusion que opera sobre latentes producidos por un VAE, condicionado por dos codificadores de texto (CLIP) que procesan el prompt positivo y el negativo. Los checkpoints publicados son ficheros unicos de 6,94 GB en FP16 que integran VAE y ambos text encoders, lo que simplifica el despliegue al no necesitar el modelo base.

El entrenamiento parte de la linea Pony (reconocible por el prefijo de prompt `score_9, score_8_up, score_7_up`). La build de calidad corresponde a la linea v3.3 y la build rapida a la linea v3.2 DMD2. La variante DMD2 incorpora destilacion por matching de distribuciones (DMD2) para reducir el numero de pasos de muestreo de 20 a 8, y emplea el sampler LCM con CFG 1.1. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla si se emplearon tecnicas adicionales como decodificacion especulativa o atencion lineal, propias de modelos de lenguaje y no aplicables directamente a este tipo de modelo.

## Capacidades

- Generacion de imagenes texto-a-imagen a resoluciones de 768x1152, 832x1216 y 1024x1024.
- Dos modos de inferencia: calidad a 20 pasos con sampler `euler_a` y CFG 5.0, y rapido a 8 pasos con sampler LCM y CFG 1.1.
- Generacion sin filtro de prompt ni verificador de seguridad de salida incorporado en el release.
- Soporte de embeddings de prompt positivo (`ChatrXL_General_Positives_V1_PRO`) y negativo (`ChatrXL_Anatomy_Negatives_V1_PRO`) incluidos en el repositorio.
- Compatibilidad con IP-Adapter opcional a escala 0.1 para condicionamiento por imagen de referencia.
- Control fino de estilo mediante CFG: valores cercanos a 4 producen resultados mas fotograficos y suaves; valores cercanos a 6 aumentan contraste y saturacion.
- Integracion con ComfyUI mediante flujos de trabajo incluidos (formato estandar y formato API) y con Diffusers mediante `StableDiffusionXLPipeline`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de generacion de imagen.

## Casos de uso

- Generacion de ilustracion y arte conceptual: el build de calidad a 20 pasos con `euler_a` y CFG 5.0 permite obtener composiciones detalladas para bocetos y desarrollo visual, con control de estilo mediante el prefijo Pony y los embeddings incluidos.
- Iteracion rapida en produccion creativa: el build DMD2 a 8 pasos con sampler LCM y CFG 1.1 reduce el coste por imagen y resulta adecuado para previsualizaciones, variaciones masivas y generacion de alta cadencia en pipelines internos.
- Integracion en ComfyUI para flujos de trabajo personalizados: los ficheros `comfyui/chatrxl-quality.json` y `comfyui/chatrxl-dmd2.json` permiten arrancar sin configuracion manual, y las copias en formato API facilitan la orquestacion desde scripts o servicios.
- Automatizacion via Diffusers en Python: el uso de `StableDiffusionXLPipeline` con `EulerAncestralDiscreteScheduler` o `LCMScheduler` permite integrar la generacion en aplicaciones backend, tareas por lotes o servicios internos de creacion de contenido.
- Generacion local sin dependencia de la nube: al ser checkpoints autonomos de 6,94 GB con VAE y text encoders incluidos, el modelo se puede ejecutar en estaciones de trabajo sin conexion y sin llamadas a APIs externas.
- Experimentacion con condicionamiento por imagen: el soporte opcional de IP-Adapter a escala 0.1 permite guiar la generacion a partir de referencias visuales, util para mantener coherencia de personaje o estilo entre imagenes.
- Investigacion sobre modelos sin moderacion: el release no incorpora filtro de prompt ni safety checker, lo que lo hace util para estudiar comportamiento de modelos generativos en entornos controlados, asumiendo las responsabilidades legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint FP16 ocupa 6,94 GB en disco, por lo que se requiere al menos esa cantidad de VRAM para cargarlo en FP16 sin offloading.
- GPU recomendadas: no se especifican en la informacion disponible. Por el tamano del checkpoint FP16, se necesitan GPU con al menos 8 GB de VRAM; tarjetas de gama alta (A100, H100) permiten mayor paralelismo y resoluciones mas altas.
- Compatibilidad con GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM en FP16; no se confirma en la documentacion.
- Opciones de despliegue: ComfyUI (probado con la version 0.43.0 usando solo nodos nativos) y Diffusers con `StableDiffusionXLPipeline`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles. La build DMD2 a 8 pasos esta disenada para alta cadencia frente a los 20 pasos de la build de calidad, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Familia | Pasos recomendados | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatrXL Uncensored (calidad) | SDXL/Pony v3.3 | 20 (`euler_a`, CFG 5.0) | safetensors FP16, 6,94 GB | `chatrlabs-model-license-1.0` | Hugging Face, ComfyUI, Diffusers |
| ChatrXL Uncensored (DMD2) | SDXL/Pony v3.2 DMD2 | 8 (LCM, CFG 1.1) | safetensors FP16, 6,94 GB | `chatrlabs-model-license-1.0` | Hugging Face, ComfyUI, Diffusers |
| SDXL base | SDXL | 20-30 | safetensors | CreativeML Open RAIL++-M | Hugging Face, Diffusers, ComfyUI |
| Modelos Pony de la comunidad | Pony | 20-30 | safetensors | variable segun autor | Hugging Face, Civitai |

La comparativa se limita a la familia SDXL/Pony porque no se dispone de datos de rendimiento comparativo publicados para ChatrXL Uncensored. La principal diferencia frente a SDXL base es el empaquetado autonomo (VAE y text encoders incluidos) y la ausencia de filtros de moderacion; frente a otros modelos Pony de la comunidad, la diferencia es la doble build (calidad y DMD2) y los flujos de ComfyUI incluidos.

## Limitaciones y advertencias

- Ausencia de filtro de prompt y de safety checker: el modelo puede generar contenido no apto para todos los publicos; el autor lo etiqueta explicitamente como `not-for-all-audiences`.
- Licencia propietaria `chatrlabs-model-license-1.0`: es necesario revisar el fichero `LICENSE` antes de cualquier uso comercial, ya que las condiciones no son las de una licencia open source estandar.
- Riesgo de sesgos: al derivar de la familia Pony y de datos de entrenamiento no documentados, pueden reproducirse sesgos de representacion propios de los datasets de imagenes utilizados; no se detalla mitigacion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible o elementos incoherentes; los embeddings negativos de anatomia mitigan parcialmente este problema pero no lo eliminan.
- Diferencias entre builds: la build DMD2 no es una destilacion de la build de calidad, por lo que la composicion puede variar entre ambas; no deben asumirse resultados identicos.
- Dependencia del prefijo de prompt: el modelo espera el prefijo `score_9, score_8_up, score_7_up` y los embeddings recomendados; omitirlos puede degradar la calidad de forma notable.
- Idiomas: no se documenta la cobertura linguistica de los prompts; el comportamiento con prompts en castellano no esta verificado en la informacion disponible.
- Sin datos de benchmarks: no hay metricas publicadas (FID, CLIP score u otras) que permitan una evaluacion cuantitativa objetiva frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chatrlabs/ChatrXL-Uncensored
- Playground: https://thechatr.ai/playground
- Descarga build de calidad (20 pasos): https://huggingface.co/chatrlabs/ChatrXL-Uncensored/resolve/main/chatrxl-uncensored-fp16.safetensors?download=true
- Descarga build DMD2 (8 pasos): https://huggingface.co/chatrlabs/ChatrXL-Uncensored/resolve/main/chatrxl-uncensored-dmd2-fp16.safetensors?download=true
- Repositorio GitHub con codigo y flujos de trabajo: https://github.com/chatrlabs/ChatrXL-Uncensored
