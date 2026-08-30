# sleephashira/kimetsu-color-illustrious-xl-lora

## Resumen

Kimetsu Color Illustrious XL LoRA es un adaptador de tipo LoRA (Low-Rank Adaptation) desarrollado por el usuario sleephashira que modifica el comportamiento del modelo base Stable Diffusion XL `OnomaAIResearch/Illustrious-xl-early-release-v0` para producir renderizados de manga en color. El adaptador se entrenó sobre un conjunto de 1.264 paneles a color extraídos de la obra Demon Slayer (Kimetsu no Yaiba), material protegido por derechos de autor y no licenciado para este fin.

El modelo resuelve el problema de transferencia de estilo: permite que Illustrious XL, un modelo SDXL optimizado para ilustración anime de alta resolución, genere imágenes que imitan la estética de color y entintado del manga de Demon Slayer mediante la palabra de activación `dsmanga`. Su relevancia radica en ser un ejemplo representativo del ecosistema de adaptadores de estilo sobre SDXL, aunque su distribución está restringida a uso personal, investigador y educativo por las condiciones de su licencia.

El artefacto se distribuye como un único archivo `kimetsu_color_lora.safetensors` de aproximadamente 228 MB, pensado para cargarse mediante la librería diffusers de Hugging Face sobre el modelo base Illustrious XL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Stable Diffusion XL |
| Parametros totales | no disponible (archivo de 228.473.556 bytes) |
| Parametros activos | no aplica (adaptador, no modelo autonomo) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos de uso) |
| Licencia | other (uso personal, investigacion y educativo exclusivamente; prohibido uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es una LoRA que se aplica sobre el modelo base `OnomaAIResearch/Illustrious-xl-early-release-v0`, una variante de Stable Diffusion XL optimizada para ilustracion anime de alta resolucion nativa (hasta 1536x1536) y etiquetado en lenguaje natural hibrido. La LoRA modifica los pesos del U-Net del modelo de difusion para sesgar la salida hacia el estilo de color del manga de Demon Slayer.

El entrenamiento se realizo sobre un conjunto de 1.264 paneles a color extraidos y limpiados de la obra original. El checkpoint seleccionado para la publicacion corresponde al paso 1800 del entrenamiento. No se especifican detalles sobre el numero de epocas, la tasa de aprendizaje, el rango de la LoRA ni la composicion exacta del dataset mas alla del recuento de paneles. El autor advierte que la documentacion anterior que citaba un recuento distinto de paneles debe ignorarse en favor de la cifra corregida de 1.264.

## Capacidades

- Generacion de imagenes estilo manga a color: el adaptador transforma la salida de Illustrious XL hacia una estetica de color similar a los paneles de Demon Slayer.
- Activacion por palabra de disparo: el token `dsmanga` debe colocarse al inicio del prompt para activar el estilo.
- Control de color mediante etiquetas: se recomienda usar etiquetas de color explicitas (p. ej. `vibrant colors`) y anadir `monochrome, greyscale` al prompt negativo para obtener resultados en color.
- Compatibilidad con diffusers: se integra mediante `load_lora_weights` y `fuse_lora`, permitiendo ajustar la escala del adaptador (escala 0.85 probada).
- Parametros de inferencia probados: muestreo ancestral de Euler, 30 pasos, CFG 6.5 y resolucion 1024x1280 como punto de partida funcional.
- No incluye capacidades de vision, audio, tool calling ni razonamiento multimodal: es exclusivamente un adaptador de estilo para generacion de imagenes.

## Casos de uso

- Investigacion academica sobre transferencia de estilo: el adaptador permite estudiar como una LoRA de bajo rango puede capturar la paleta de color y el entintado de una obra concreta a partir de un dataset relativamente pequeno (1.264 imagenes).
- Estudio de tecnicas de fine-tuning sobre SDXL: sirve como caso de referencia para analizar el efecto del paso de checkpoint (1800) y la escala del adaptador (0.85) en la calidad de la salida.
- Generacion personal de ilustraciones de estilo manga: un usuario individual puede crear imagenes con estetica de manga a color para uso privado, sin fines comerciales.
- Evaluacion de prompts y parametros de muestreo: el modelo permite experimentar con distintos schedulers, pasos, CFG y resoluciones para caracterizar la sensibilidad del adaptador.
- Comparativa de adaptadores de estilo: junto con otros LoRAs del mismo autor (p. ej. `opm-murata-illustrious-xl-lora`), permite comparar como distintos datasets de entrenamiento afectan al estilo resultante sobre el mismo modelo base.
- Pruebas de robustez del modelo base: al ser un adaptador ligero, puede usarse para verificar como Illustrious XL responde a modificaciones de bajo rango en distintos escenarios de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas objetivas (FID, CLIP score, evaluaciones humanas) que cuantifiquen la fidelidad del estilo o la calidad de las imagenes generadas. El unico dato de rendimiento disponible es el punto de partida de inferencia probado por el autor: escala LoRA 0.85, muestreo ancestral de Euler, 30 pasos, CFG 6.5 y resolucion 1024x1280.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre SDXL, los requisitos son los del modelo base. SDXL requiere aproximadamente 8-10 GB de VRAM para inferencia a resoluciones de 1024x1024 o superiores con precision fp16.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior, RTX 4070, RTX 4090, o GPUs de datacenter como A100 o H100 para produccion.
- Compatibilidad con GPU de consumo: si, cualquier GPU con 8 GB o mas de VRAM puede ejecutar el modelo base con el adaptador cargado, aunque resoluciones altas (1280x1280 o superiores) pueden requerir 12 GB o mas.
- Opciones de despliegue: diffusers (metodo oficial probado por el autor), ComfyUI, Automatic1111 WebUI y otras interfaces que soporten LoRAs de SDXL.
- Latencia y throughput: no disponible. Depende de la GPU, la resolucion y el numero de pasos. Como referencia orientativa, SDXL en una RTX 4090 genera una imagen de 1024x1024 en aproximadamente 5-10 segundos con 30 pasos, pero este dato no esta confirmado para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Dataset de entrenamiento | Licencia | Uso comercial |
|---|---|---|---|---|---|
| sleephashira/kimetsu-color-illustrious-xl-lora | LoRA de estilo | Illustrious XL | 1.264 paneles de Demon Slayer | other (restriccion personalizada) | Prohibido |
| sleephashira/opm-murata-illustrious-xl-lora | LoRA de estilo | Illustrious XL | no disponible (manga de One Punch Man, estilo Murata) | other | Prohibido |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | Modelo base SDXL | - | no disponible | Fair AI Public License 1.0-SD | Sujeto a terminos de la licencia |

Ambos LoRAs del mismo autor comparten arquitectura, modelo base y restricciones de licencia. La diferencia principal es el dataset de entrenamiento: mientras que kimetsu-color se entreno sobre paneles a color de Demon Slayer, opm-murata se orienta al estilo del manga de One Punch Man. No se dispone de datos comparativos de rendimiento entre ambos.

## Limitaciones y advertencias

- Uso comercial estrictamente prohibido: la licencia restringe el uso a fines personales, de investigacion y educativos. Quedan prohibidos la monetizacion, la publicidad, los servicios de pago, la reventa y cualquier uso que genere ingresos.
- Material con derechos de autor: el adaptador se entreno sobre paneles extraidos de Demon Slayer sin licencia de los titulares de los derechos. El autor declara que no existe afiliacion ni respaldo de los autores, artistas, editores o titulares de derechos de la obra.
- Sesgos del dataset: el modelo puede reproducir sesgos, motivos visuales o asociaciones de personajes presentes en el conjunto de entrenamiento, limitado a una unica obra.
- Calidad de salida variable: el autor advierte que el modelo puede producir anatomia malformada, texto o detalles de panel defectuosos. Los resultados varian segun el prompt, la semilla, el scheduler, la resolucion y la fuerza del adaptador.
- Licencia no estandar: `license: other` indica terminos personalizados que no constituyen una licencia open source aprobada por OSI. No se otorgan derechos sobre las obras de arte, personajes, nombres o marcas de terceros.
- Responsabilidad del usuario: el descargador es el unico responsable de determinar la legalidad del uso, obtener los permisos necesarios y cumplir con la legislacion local y los terminos de la plataforma.
- Terminos del modelo base: se aplican tambien los terminos de uso de Illustrious XL y la Fair AI Public License 1.0-SD, que deben revisarse antes de descargar o usar el adaptador.
- Sin garantias: el software y el artefacto se proporcionan tal cual, sin garantias de ningun tipo. El mantenedor excluye responsabilidad por usos, salidas, reclamaciones o danos derivados del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sleephashira/kimetsu-color-illustrious-xl-lora
- Model card de Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Terminos de uso de Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0/blob/main/TERM_OF_USE
- Fair AI Public License 1.0-SD: https://freedevproject.org/faipl-1.0-sd/
- LoRA similar del mismo autor (opm-murata): https://huggingface.co/sleephashira/opm-murata-illustrious-xl-lora
- Sitio oficial de Illustrious XL: https://www.illustrious-xl.ai/
