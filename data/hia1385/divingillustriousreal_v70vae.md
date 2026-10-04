# hia1385/divingIllustriousReal_v70VAE

## Resumen

hia1385/divingIllustriousReal_v70VAE es un checkpoint de difusion latente para generacion de imagenes a partir de texto (text-to-image), publicado en Hugging Face por el usuario hia1385. Por los resultados de busqueda, corresponde a la version 7.0 con VAE integrada del modelo "Diving-Illustrious Real-Asian" de DivingSuit, un ajuste de la familia Illustrious (derivada a su vez de SDXL) orientado a retratos y figuras fotorrealistas de estilo asiatico. El archivo principal es un safetensors de precision media (pruned) de aproximadamente 6,46 GB.

Su relevancia practica esta en el ecosistema de generacion de imagen local: es un checkpoint de tipo "todo en uno" que se carga directamente en ComfyUI, Automatic1111/Forge, InvokeAI o Diffusers sin necesidad de anadir un VAE aparte, y que ademas cuenta con una variante cuantizada para Qualcomm (QNN) que permite ejecutarlo en dispositivos con Snapdragon 8 Gen 3 o superior.

La informacion publicada es muy escasa: la model card del repositorio unicamente declara la licencia apache-2.0, sin descripcion, dataset, hiperparametros ni benchmarks. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y no esta desplegado por ningun proveedor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (latent diffusion) de la familia SDXL / Illustrious |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; al derivar de la familia SDXL, el limite habitual es de 75 tokens por codificador de texto |
| Tipos de cuantizacion | fp16 (safetensors); existe una variante cuantizada QNN (qnn2.28) para Qualcomm publicada por un tercero |
| Idiomas soportados | no disponible; en esta familia de checkpoints los prompts suelen rendir mejor en ingles |
| Licencia | apache-2.0 (segun metadatos y model card del repositorio) |
| Formato de pesos | safetensors (checkpoint unico con VAE integrada, ~6,46 GB en precision media) |
| Tipo de modelo | Text-to-image (generacion de imagenes) |
| Resolucion nativa | no disponible; la familia SDXL trabaja habitualmente a 1024x1024 |
| Descargas / likes en Hugging Face | 0 / 0 |
| Fecha de creacion del repositorio | 2026-10-03 |
| Fecha de ultima actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

Se trata de un checkpoint de difusion latente, no de un modelo de lenguaje. La arquitectura subyacente es la de la familia SDXL, con un U-Net como red de denoising y dos codificadores de texto (CLIP), sobre la que se ha construido la familia Illustrious. La variante concreta "v7.0 + VAE" incorpora el decodificador VAE dentro del propio archivo safetensors, de modo que no hace falta cargar un VAE externo. El modelo esta orientado a la generacion fotorrealista de rostros y cuerpos, con enfasis declarado en el apartado "Real-Asian".

No hay informacion disponible sobre el proceso de entrenamiento: ni el numero de imagenes o pasos, ni la composicion del dataset, ni si se emplearon tecnicas de ajuste fino supervisado, DreamBooth, LoRA fusionada o mezcla de modelos (merge). Tampoco se documentan tecnicas de optimizacion como destilacion, muestreo acelerado (LCM, Turbo, Lightning) o decodificacion especulativa. Todo lo anterior figura como no disponible.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) en resoluciones propias de la familia SDXL, tipicamente 1024x1024.
- Soporte de prompts negativos, habitual en los frontales de inferencia de imagenes.
- Generacion fotorrealista de retratos y figuras humanas, con orientacion declarada hacia rostros de rasgos asiaticos.
- VAE integrada: no requiere cargar un decodificador externo ni ajustar su factor de escala.
- Compatibilidad esperada con el ecosistema SDXL (LoRA, ControlNet, IP-Adapter, inpainting), aunque no verificada en la informacion disponible.
- No dispone de tool calling, function calling ni soporte de agentes: es un modelo de imagen, no un modelo de lenguaje.
- No dispone de modo "thinking", razonamiento multi-paso, codigo, matematicas, vision de entrada ni capacidades de audio.
- Capacidades multilingues: no disponible. Los prompts en ingles son el estandar de facto en esta familia.

## Casos de uso

- Previsualizacion de personajes para videojuegos y animacion: el modelo permite generar variaciones rapidas de un mismo personaje (rostro, vestuario, iluminacion) antes de encargar el modelado 3D definitivo, gracias a su sesgo hacia retratos fotorrealistas.
- Ilustracion editorial y portadas: generacion de retratos de alta resolucion para articulos, libros o reportajes, partiendo de un checkpoint que ya incluye la VAE y evita pasos extra de postproceso.
- Prototipado de creatividades para marketing: produccion de bocetos y variantes visuales para campanas en redes sociales, con iteracion rapida sobre composicion y estilo mediante prompts y prompts negativos.
- Entrenamiento de LoRA de marca o estilo propio: al pertenecer al ecosistema SDXL/Illustrious, puede servir como modelo base para ajustar un LoRA con un estilo corporativo o un personaje concreto y reutilizarlo despues.
- Flujos con ControlNet en ComfyUI: uso de mapas de pose, profundidad o bordes para fijar la composicion en ilustracion de producto, storyboards o diseno de moda.
- Despliegue local sin conexion en escritorio: ejecucion en una GPU de consumo mediante Automatic1111/Forge o ComfyUI para entornos con requisitos de privacidad, ya que las imagenes no salen del equipo.
- Inferencia en movil: la variante cuantizada QNN (qnn2.28) permite ejecutar el modelo en dispositivos con Snapdragon 8 Gen 3 o superior, habilitando generacion de imagenes en aplicaciones moviles sin servidor.
- Generacion de datasets sinteticos: creacion de imagenes etiquetadas para preentrenar o aumentar datasets de vision por computador, con la cautela de revisar sesgos y derechos de imagen antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye FID, CLIP score, evaluaciones comparativas ni ningun otro tipo de metrica, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16 a 1024x1024: en el entorno de 10 a 12 GB sin optimizaciones, segun el tamano del archivo (6,46 GB) y el pico de activaciones propio de la familia SDXL. Estimacion orientativa, no medida sobre este checkpoint.
- Con optimizaciones (attention slicing, VAE tiling, fp16 con offload parcial): puede ejecutarse con 8 GB de VRAM, y con margen ajustado en 6 GB reduciendo a 768x768 o aplicando cuantizacion.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso en escritorio; A100 o H100 para lotes grandes o servicios de generacion masiva.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas de VRAM aplicando las optimizaciones descritas.
- Despliegue en movil: Snapdragon 8 Gen 3 o superior mediante la variante cuantizada QNN (qnn2.28).
- Opciones de despliegue: Diffusers (PyTorch), ComfyUI, Automatic1111 / Forge, SD.Next, InvokeAI. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponible para este checkpoint. Como referencia de familia, un checkpoint SDXL en una RTX 4090 suele generar una imagen de 1024x1024 en 25-30 pasos en el orden de pocos segundos, pero no hay mediciones publicadas para esta version concreta.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divingIllustriousReal_v70VAE | SDXL / Illustrious | no disponible | no disponible (75 tokens por codificador en la familia SDXL) | apache-2.0 declarada | Hugging Face (0 descargas), Civitai, CivArchive, espejos de terceros |
| Illustrious XL | SDXL | no disponible | no disponible | no disponible en esta ficha | Ampliamente distribuido en Hugging Face y Civitai |
| Pony Diffusion V6 XL | SDXL | no disponible | no disponible | no disponible en esta ficha | Ampliamente distribuido en Civitai y espejos |
| SDXL 1.0 (base) | SDXL | no disponible | no disponible (75 tokens por codificador) | CreativeML Open RAIL++-M | Stable Diffusion, Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card solo declara la licencia. No hay dataset, hiperparametros, version de entrenamiento ni evaluaciones.
- Procedencia no verificada: el modelo se atribuye en Civitai al autor DivingSuit, mientras que el repositorio de Hugging Face pertenece a hia1385. Podria tratarse de una resubida no autorizada; conviene comprobar la fuente original antes de usarlo en produccion.
- Inconsistencia de fechas y versiones: Civitai publica el modelo el 2025-09-21, CivArchive referencia un archivo con fecha 2025-12-28 y el repositorio de Hugging Face figura creado el 2026-10-03. No es posible fijar con certeza la version exacta de los pesos.
- Licencia: el repositorio declara apache-2.0, pero la licencia del modelo base de la familia Illustrious (derivada de SDXL) puede imponer condiciones adicionales, incluida la CreativeML Open RAIL++-M, que restringe determinados usos. La informacion disponible no permite confirmar la compatibilidad de ambas licencias; verifiquelo antes de un uso comercial.
- Sesgos: el propio nombre del modelo ("Real-Asian") indica un ajuste orientado a un grupo etnico concreto, lo que puede traducirse en menor diversidad y en representaciones estereotipadas de otros grupos. Es esperable tambien un sesgo de genero y de canon de belleza heredado del dataset de ajuste, que no se documenta.
- Riesgo de contenido para adultos: los checkpoints de esta familia en Civitai suelen incorporar capacidad de generar contenido NSFW, no declarada en la informacion disponible. Requiere moderacion explicita si se expone a usuarios finales.
- Alucinacion visual: como todo modelo de difusion, produce artefactos en manos, dedos, ojos, joyas y texto dentro de la imagen. No existe garantia de coherencia anatomica ni de reproducibilidad entre semillas.
- Limite de prompt: la familia SDXL procesa 75 tokens por codificador de texto, lo que obliga a resumir prompts largos y limita el control fino de escenas complejas.
- Idiomas: no hay informacion sobre el rendimiento con prompts en castellano; es probable que el ingles ofrezca mejores resultados.
- Riesgo legal por derechos de imagen: al estar orientado a retratos fotorrealistas, su uso para generar imagenes de personas reales sin consentimiento puede infringir derechos de imagen y normativa de proteccion de datos.
- Sin soporte de inferencia gestionada: ningun proveedor de Inference Providers despliega este modelo, por lo que hay que alojarlo por cuenta propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hia1385/divingIllustriousReal_v70VAE
- Espejo del archivo safetensors en Hugging Face: https://huggingface.co/nolimitscgsc/Diving_Illustrious_Real_Asian_V7/blob/main/divingIllustriousReal_v70VAE.safetensors
- Variante cuantizada para Qualcomm (QNN): https://huggingface.co/Mr-J-369/divingIllustriousReal_v70VAE_qnn2.28_8gen3
- Modelo original en Civitai: https://civitai.red/models/1562047/diving-illustrious-real-asian
- Publicacion de muestra de la version 5.0 en Civitai: https://civitai.com/posts/22327108
- Ficha y espejos en CivArchive: https://civarchive.com/tensorart/models/947571366037573035/versions/947571366037573035
