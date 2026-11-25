# abbuibuibui/YotsugiOnonoki-Lora

## Resumen

YotsugiOnonoki-Lora es un LoRA de personaje para modelos de difusion SDXL que reproduce a Yotsugi Ononoki (斧乃木余接), personaje de la serie *Monogatari*. Lo desarrolla el usuario abbuibuibui y se distribuye como un repositorio de tres linajes de pesos: el LoRA original entrenado sobre waiIllustriousSDXL v17 (ficheros en la raiz), una variante entrenada sobre AutismMix Pony (carpeta `autism_pony/`) y una variante para MOSS-Image (carpeta `moss/`). Cada linaje requiere su propio modelo base y sus propios prompts, y no son intercambiables.

El modelo resuelve el problema de generar de forma consistente un personaje concreto con una identidad visual muy definida: pelo turquesa en dos coletas cortas, cejas turquesa, ojos verdes y un sombrero naranja con forma de criatura. Para ello se entrena un adaptador de bajo rango (rank 64, alpha 32) sobre un dataset de 53 pares imagen-texto con un unico token de vestuario, lo que permite invocar al personaje mediante palabras disparadoras (`yotsugi_ononoki`, `yotsugi_ononoki_orange_dress`) en lugar de describirlo por completo en cada prompt.

Es relevante ahora porque el ecosistema Illustrious/SDXL sigue siendo la base mas utilizada para generacion de anime en flujos de trabajo con ComfyUI, y este repositorio incluye una evaluacion comparativa publica de epochs (E1-E7) y de intensidades del LoRA (0,4 a 1,0), algo poco habitual en LoRAs de personaje. El autor recomienda el checkpoint E6 a fuerza 0,8 como configuracion por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; modelo base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (cada fichero de pesos ocupa 456.490.692 bytes; rango 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el LoRA se aplica sobre el modelo base en la precision de este) |
| Idiomas soportados | en, zh (prompts en ingles y chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 entrenado con AdamW en bf16 sobre waiIllustriousSDXL v17, un checkpoint SDXL orientado a anime. El entrenamiento uso buckets con tope de 1536 y se prolongo durante 7 epochs, generando los checkpoints E1 a E7 (el fichero sin numerar `yotsugi_ononoki.safetensors` corresponde a E7; no existe un `000007`). El dataset consta de 53 pares imagen-texto centrados exclusivamente en el vestuario naranja, con 3 repeticiones, y las captions se generaron con `keep_tokens = 2`. El autor advierte que el color de pelo y de ojos a menudo se omite en las captions, por lo que conviene anadirlo explicitamente en el prompt.

La innovacion practica del repositorio no esta en la arquitectura sino en la documentacion de la evaluacion: una primera ronda cribo E1-E7 a fuerza 0,8 y una tercera ronda hizo una matriz de E5, E6 y E7 por 10 escenas y 4 intensidades (0,4, 0,6, 0,8 y 1,0). El resultado recomienda E6 a 0,8. Ademas, el repositorio alberga dos linajes adicionales entrenados sobre otras bases (AutismMix Pony y MOSS-Image), con sus propios checkpoints y hashes SHA-256 publicados para verificacion de integridad.

## Capacidades

- Generacion de imagenes de personaje consistente: reproduce la identidad visual de Yotsugi Ononoki (pelo turquesa en coletas cortas, cejas turquesa, ojos verdes, sombrero naranja con ojos saltones).
- Control de vestuario mediante token dedicado (`yotsugi_ononoki_orange_dress`): vestido naranja con volantes, peto con estrella azul, calcetines de rayas y botas amarillas.
- Retratos y cuerpo completo: la evaluacion publica cubre cara frontal, tres cuartos, perfil, cuerpo completo, pose sentada, fondo simple, escena nocturna compleja y generacion sin token de vestuario.
- Ajuste fino de identidad frente a flexibilidad compositiva mediante la fuerza del LoRA (0,4-1,0).
- Compatibilidad con prompts en ingles y chino.
- Integracion con ComfyUI y con la libreria diffusers.
- Multiples linajes de base (Illustrious, Pony, MOSS-Image) para adaptarse a distintos pipelines.

## Casos de uso

- Ilustracion de fan art de *Monogatari*: invocar el personaje con los tokens disparadores en lugar de describirlo, reduciendo la longitud del prompt y la varianza entre generaciones.
- Creacion de fichas de personaje consistentes: usar E6 a 0,8 con las mismas semillas y variar solo la pose o el fondo para producir un conjunto coherente de imagenes de referencia.
- Prototipado rapido en ComfyUI: el flujo documentado (Euler a, 28 pasos, CFG 4,5, CLIP skip 2, 832x1216) sirve como plantilla reproducible sin hires fix ni ADetailer.
- Generacion de escenas narrativas: la evaluacion incluye escenas nocturnas complejas y fondos simples, util para paneles de comic o storyboards con el personaje integrado en entornos.
- Experimentacion con linajes alternativos: quien ya trabaje con AutismMix Pony o MOSS-Image puede usar las carpetas correspondientes sin cambiar de ecosistema.
- Verificacion de integridad en produccion: los hashes SHA-256 publicados (E6 de WAI y E6 de AutismMix) permiten validar que los pesos desplegados son los evaluados por el autor.
- Comparacion de intensidades de LoRA: la matriz E5/E6/E7 x 0,4-1,0 documentada sirve para calibrar el equilibrio entre fidelidad al personaje y libertad compositiva en otros LoRAs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la informacion disponible. El autor aporta una evaluacion cualitativa comparativa:

| Candidato | Observacion | Decision |
|---|---|---|
| E5 | Coletas palidas y ojos verdes usables; el sombrero naranja aparece a menudo | Alternativa |
| E6 | Retrato: coletas teal/blanco palido, ojos verdes vidriosos, cara de muneca inexpresiva, ala del sombrero naranja. Cuerpo completo: vestido naranja/rojo con volantes en capas, peto con estrella azul, calcetines de rayas, botas amarillas, sombrero naranja con ojos saltones | Recomendado a 0,8 |
| E7 | Cercano a E6 | Alternativa final |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un LoRA sobre SDXL, los requisitos son los del modelo base waiIllustriousSDXL v17 (tipicamente 8-12 GB en fp16 con optimizaciones, aunque el dato no se confirma en la informacion).
- GPU recomendadas: no disponible; el autor menciona entrenamiento en NVIDIA DGX Spark y renderizado en ComfyUI.
- Cabe en GPU de consumo: no confirmado en la informacion, pero al tratarse de un adaptador SDXL es plausible en GPUs de consumo con la VRAM suficiente para el base.
- Opciones de despliegue: ComfyUI (flujo documentado) y diffusers (libreria declarada).
- Latencia y throughput: no disponibles.
- Tamano del repositorio: 7,9 GB (incluye los tres linajes y las imagenes de evaluacion); cada fichero de pesos individual pesa 456.490.692 bytes.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRAs de personaje comparables ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a sus titulares y el autor lo declara como fan-made.
- Licencia creativeml-openrail-m: impone restricciones de uso comercial que deben revisarse antes de desplegar en produccion.
- No mezclar linajes: los pesos de la raiz (WAI/Illustrious), `autism_pony/` y `moss/` requieren modelos base y prompts distintos; mezclarlos degrada el resultado.
- Las captions omiten con frecuencia el color de pelo y ojos, por lo que hay que anadirlos manualmente en el prompt para evitar derivas de identidad.
- Dataset pequeno (53 pares, un solo vestuario): la variedad de ropa fuera del token `yotsugi_ononoki_orange_dress` puede ser limitada.
- Riesgo de sobreajuste al vestuario principal y de aparicion espuria del sombrero naranja (documentado en E5).
- Solo se documentan prompts en ingles y chino; el rendimiento en otros idiomas no esta verificado.
- No hay benchmarks cuantitativos publicados; la seleccion de E6 se basa en evaluacion cualitativa del autor.
- El fichero E7 no lleva numeracion (`yotsugi_ononoki.safetensors`), lo que puede provocar confusion al automatizar descargas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/YotsugiOnonoki-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/YotsugiOnonoki-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/YotsugiOnonoki-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/YotsugiOnonoki-Dataset
