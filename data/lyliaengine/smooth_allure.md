# LyliaEngine/Smooth_Allure

## Resumen

Smooth_Allure es un LoRA (Low-Rank Adaptation) de difusión para generación de imágenes, desarrollado por LyliaEngine y publicado en Hugging Face. Se entrena sobre el modelo base OnomaAIResearch/Illustrious-xl-early-release-v0, un finetune de SDXL especializado en ilustración anime. El objetivo del LoRA es replicar el estilo "suave" característico de los LoRA de Pony Diffusion, pero aprovechando la mejor capacidad de seguimiento de instrucciones del modelo Illustrious. El autor recomienda usar una fuerza de alrededor de 0.8 y el prompt de activación `realistic face` para obtener el estilo mostrado en las imágenes de ejemplo.

El modelo se distribuye bajo licencia cdla-permissive-2.0, que permite uso comercial con atribución. El repositorio ocupa 0.9 GB e incluye los pesos del LoRA en formato compatible con la librería diffusers. Al ser un LoRA, no es un modelo completo sino una adaptación ligera que se combina con el modelo base en tiempo de inferencia. Su relevancia radica en ofrecer una alternativa a los LoRA de Pony Diffusion con mejor adherencia a las instrucciones del prompt, especialmente para estilos de rostro realista sobre una base entrenada principalmente en anime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (base: Illustrious XL early release v0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt se procesa en ingles, pero no hay especificacion) |
| Licencia | cdla-permissive-2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Smooth_Allure es un LoRA, una tecnica de adaptacion de bajo rango que modifica los pesos de un modelo preentrenado con un delta de rango reducido. El modelo base es Illustrious XL early release v0, un finetune de SDXL (Stable Diffusion XL) entrenado principalmente con datos de ilustracion anime. El LoRA se entrena para ajustar la salida del modelo hacia un estilo visual "suave" similar al de los LoRA de Pony Diffusion, pero manteniendo la capacidad de seguir instrucciones del modelo Illustrious.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni el rango del LoRA. El autor menciona que el material de entrenamiento "necesita mas diversidad" y que el modelo base esta entrenado "totalmente en anime", por lo que se requiere el prompt adicional `realistic face` para obtener el estilo deseado. No se indica el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Generacion de imagenes text-to-image con estilo suave y realista en rostros.
- Activacion mediante el prompt `realistic face` (no hay trigger words explicitos).
- Compatible con el modelo base Illustrious XL, que soporta prompts en lenguaje natural.
- Fuerza recomendada del LoRA: 0.8 (ajustable segun el resultado deseado).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No tiene capacidades de vision, audio ni video (solo genera imagenes fijas).

## Casos de uso

- Creacion de retratos realistas: el LoRA permite generar rostros con un acabado suave y fotorealista sobre la base anime de Illustrious. Se usaria con prompts como `realistic face, portrait of a woman, soft lighting` y una fuerza de 0.8.
- Ilustracion de personajes con estilo hibrido: combina la estetica anime con rasgos realistas, util para concept art de personajes en produccion de videojuegos o animacion.
- Generacion de avatares para redes sociales: se puede usar para crear imagenes de perfil con un estilo pulido y atractivo, partiendo de descripciones textuales.
- Contenido para marketing y publicidad: el estilo suave y realista es adecuado para campanas visuales que requieran rostros humanos generados por IA, siempre que se cumplan las politicas de la plataforma.
- Prototipado rapido de diseno: los disenadores pueden generar variaciones de rostros y expresiones para explorar conceptos antes de la produccion final.
- Personalizacion de personajes en juegos de rol: los aficionados pueden crear retratos de sus personajes con un estilo consistente y de alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de FID, CLIP score ni comparaciones cuantitativas con otros LoRA o modelos.

## Requisitos de hardware

- Al ser un LoRA, los requisitos de hardware son los del modelo base Illustrious XL (SDXL). En FP16, SDXL requiere aproximadamente 8-10 GB de VRAM para inferencia.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB) o superior, RTX 4070, RTX 4090, o GPUs de datacenter como A100.
- Es posible ejecutar en GPUs consumer con 8 GB de VRAM usando cuantizacion o atencion con memoria eficiente, aunque no se especifican opciones de cuantizacion para este LoRA.
- Opciones de despliegue: diffusers (libreria principal), ComfyUI, Automatic1111 WebUI, o cualquier frontend que soporte LoRA de SDXL.
- No se dispone de datos de latencia o throughput especificos.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Contexto | Uso |
|---|---|---|---|---|---|
| Smooth_Allure (este) | LoRA | Illustrious XL (SDXL) | cdla-permissive-2.0 | no aplica | Estilo suave/realista |
| Pony Diffusion V6 XL | Modelo completo | SDXL | no disponible (Civitai) | no aplica | Generacion SFW/NSFW versatil |
| LoRA de estilo "smooth" para Pony | LoRA | Pony Diffusion V6 XL | variable | no aplica | Estilo suave sobre Pony |

La comparativa se basa en informacion cualitativa del autor: Smooth_Allure ofrece un estilo similar a los LoRA de Pony, pero con mejor seguimiento de instrucciones gracias a la base Illustrious. No hay datos cuantitativos de rendimiento para comparar objetivamente.

## Limitaciones y advertencias

- El material de entrenamiento tiene poca diversidad, por lo que el LoRA puede no generalizar bien a ciertos estilos o sujetos fuera de su rango de entrenamiento.
- El modelo base esta entrenado principalmente en anime, por lo que obtener resultados realistas requiere el prompt adicional `realistic face`; sin el, la salida tendra una estetica anime.
- No hay trigger words explicitos; la activacion depende del prompt `realistic face`, lo que puede limitar su uso en flujos de trabajo automatizados.
- La licencia cdla-permissive-2.0 permite uso comercial, pero se debe revisar el texto completo de la licencia para cumplir con los requisitos de atribucion.
- El autor es un re-subidor de contenido de CivitAI; se debe verificar la procedencia original y los creditos (EncodedExplorer) antes de usarlo en produccion.
- No se garantiza la ausencia de sesgos en la generacion de rostros, especialmente en cuanto a diversidad etnica o de edad, dado el dataset limitado.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar artefactos o distorsiones en areas complejas como manos o texturas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LyliaEngine/Smooth_Allure
- Fuente original en CivitAI (via civitai.red): https://civitai.red/models/1901188/smooth-allure-nsfw-illustrious?modelVersionId=2151972
- Modelo base Illustrious XL: https://civitai.com/models/827184/wai-nsfw-illustrious-sdxl?modelVersionId=1761560
- Perfil del autor en Hugging Face: https://huggingface.co/LyliaEngine/models
- Pagina del modelo en SeaArt: https://www.seaart.ai/models/detail/361313c8672516c885824dba65912dbd
