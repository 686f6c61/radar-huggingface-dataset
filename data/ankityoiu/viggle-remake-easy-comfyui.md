# Ankityoiu/Viggle-Remake-Easy-ComfyUI

## Resumen

Viggle Remake - EASY es un paquete de flujos de trabajo (workflows) para ComfyUI que implementa las capacidades de Viggle Remake, un par de LoRAs abiertas construidas sobre el modelo de video MiniMax H3. El repositorio, publicado por el usuario Ankityoiu, no contiene pesos de modelo propios: distribuye ficheros JSON de workflow, un archivo ZIP con nodos personalizados y las instrucciones para descargar los modelos base (MiniMax H3 en formato int8 o GGUF y los LoRAs de Viggle Remake). Resuelve el problema de orquestar video-to-video con dos modos diferenciados: Swap (sustituir una persona o personaje) y Edit (cambiar objetos, fondo, clima o iluminacion).

La propuesta es relevante por su enfoque en accesibilidad de hardware: ofrece dos variantes, una para GPUs de 16 GB o mas de VRAM y otra optimizada para 12 GB, ademas de soporte para videos de 1 a 18 segundos con upscale opcional a 1080p. Todo el conjunto se apoya en la licencia MIT y en el ecosistema ComfyUI, lo que facilita su integracion en entornos de produccion creativa sin dependencias de APIs propietarias.

Conviene subrayar que este repositorio es un artefacto de orquestacion, no un modelo entrenado. Las especificaciones reales del modelo subyacente (MiniMax H3) y de los LoRAs (Viggle Remake) deben consultarse en sus respectivas model cards; el presente documento describe el paquete tal como se publica y los datos disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Workflow de ComfyUI sobre modelo de difusion de video MiniMax H3 (no se especifica la arquitectura interna del modelo base) |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (aplica al modelo base, no al workflow) |
| Tipos de cuantizacion | int8 (workflow HQ), GGUF Q8_0 y Q4_K_M (workflow 12 GB), NVFP4 AWQ para el text encoder |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (workflows), ZIP (nodos personalizados); los pesos a descargar son safetensors y GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica un modelo. Su contenido son dos ficheros JSON de workflow para ComfyUI, un ZIP con cuatro paquetes de nodos personalizados y una model card con instrucciones de descarga. El pipeline declarado es video-to-video y la libreria asociada es `minimax-h3`. La arquitectura efectiva corresponde al modelo base MiniMax H3 (difusion de video con VAE de video y VAE de audio, mas un text encoder Qwen3-VL de 32B en formato NVFP4 AWQ), sobre el que se aplican dos LoRAs de Viggle Remake: una para Swap y otra para Edit.

Los datos de entrenamiento del modelo base y de los LoRAs no se detallan en la informacion proporcionada. El workflow HQ emplea MiniMax H3 int8 con los LoRAs en safetensors; el workflow de 12 GB emplea variantes GGUF con los LoRAs fusionados (Q8_0 por defecto, Q4_K_M para sistemas con poca RAM) y requiere el nodo ComfyUI-GGUF. La variante de 12 GB debe arrancar ComfyUI con `--reserve-vram 8` y mantener la resolucion en 832x480, con tiling de upscale activado.

## Capacidades

- Video-to-video con dos modos: Swap (reemplazar una persona o personaje) y Edit (modificar objetos, fondo, clima o iluminacion).
- Procesamiento de videos de 1 a 18 segundos de duracion.
- Upscale opcional a 1080p mediante un modelo de upscale latente 3D y LoRAs adicionales.
- Conservacion de la banda sonora original del video de entrada.
- Edicion guiada por pintado de uno a cuatro fotogramas de referencia.
- Integracion nativa en ComfyUI mediante nodos personalizados.
- Soporte de audio a traves del nodo comfyui-minimax-h3-audio-T8.
- Refinado facial especifico mediante ComfyUI-H3-FaceRefine.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a este tipo de modelo).

## Casos de uso

- Recasting de personajes en postproduccion: sustituir un actor o personaje por otro en un clip de hasta 18 segundos, manteniendo el audio original, gracias al modo Swap y a la conservacion de la pista de sonido.
- Edicion de fondo y atmosfera en publicidad: cambiar el clima, la iluminacion o el entorno de un plano sin regrabar, usando el modo Edit y el pintado de hasta cuatro fotogramas guia.
- Prototipado rapido de efectos visuales: generar variantes de una escena para revision creativa antes de acometer un VFX costoso, con el workflow de 12 GB en una GPU de consumo.
- Restauracion y modernizacion de material de archivo: aplicar upscale a 1080p sobre clips cortos y ajustar elementos obsoletos del plano mediante Edit.
- Creacion de contenido para redes sociales: producir versiones alternativas de un mismo clip con cambios de vestuario o entorno, apoyandose en la ventana de 1 a 18 segundos y el pipeline video-to-video.
- Integracion en pipelines de ComfyUI existentes: incorporar los nodos de Viggle Remake a flujos ya montados para automatizar tareas de sustitucion o edicion dentro de un estudio pequeno.
- Experimentacion en investigacion de video generativo: usar los workflows como referencia reproducible para comparar configuraciones int8 frente a GGUF Q8_0 y Q4_K_M en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: 16 GB o mas para el workflow HQ; 12 GB para el workflow reducido (con `--reserve-vram 8`).
- RAM del sistema: 32 GB minimo; 64 GB recomendados, especialmente en la variante de 12 GB, que transmite el modelo desde RAM.
- GPU recomendadas: no se especifican modelos concretos; los requisitos se expresan unicamente en VRAM (16 GB+ o 12 GB).
- Cabe en GPU de consumo: si, en tarjetas con al menos 12 GB de VRAM; el upscale a 1080p en 12 GB no ha sido probado en hardware real segun la model card.
- Despliegue: ComfyUI (escritorio o servidor) con los nodos ComfyUI-KJNodes, comfyui-minimax-h3-audio-T8, ComfyUI-H3-FaceRefine y ComfyUI-Viggle-Remake; ComfyUI-GGUF adicional para la variante de 12 GB.
- Latencia y throughput: no disponibles; la model card solo indica que el workflow HQ es mas rapido y el de 12 GB mas lento por el streaming desde RAM.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viggle Remake - EASY (este repo) | Workflow ComfyUI sobre MiniMax H3 + LoRAs | no disponible | no disponible | MIT | Hugging Face |
| Viggle Remake (LoRAs originales) | LoRAs de video-to-video | no disponible | no disponible | no disponible en la informacion | Hugging Face (Viggle/Viggle-Remake) |
| MiniMax H3 | Modelo de difusion de video base | no disponible | no disponible | no disponible en la informacion | Hugging Face (MiniMaxAI/MiniMax-H3) |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: sin descargar MiniMax H3, los LoRAs de Viggle Remake y los VAE, el workflow no funciona.
- La duracion de video esta acotada a un maximo de 18 segundos por ejecucion.
- El upscale a 1080p en la variante de 12 GB no ha sido validado en hardware real segun la propia model card.
- La variante de 12 GB es mas lenta y depende de la RAM del sistema; un equipo con menos de 32 GB puede no ser viable.
- Riesgo de artefactos, incoherencias temporales y perdida de identidad facial en el modo Swap, especialmente con pintado de pocos fotogramas.
- Sesgos y limitaciones de idioma del modelo base no documentados en la informacion disponible.
- Licencia MIT declarada para el repositorio, pero las licencias del modelo base y de los LoRAs deben verificarse por separado antes de uso comercial.
- Dependencia de versiones concretas de nodos personalizados y de ComfyUI; cambios en esos proyectos pueden romper los workflows.
- Uso responsable: la sustitucion de personas en video plantea riesgos de suplantacion y deepfakes; se recomienda consentimiento explicito y trazabilidad del material generado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ankityoiu/Viggle-Remake-Easy-ComfyUI
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRAs Viggle Remake: https://huggingface.co/Viggle/Viggle-Remake
- Carpeta ComfyUI de Viggle Remake: https://huggingface.co/Viggle/Viggle-Remake/tree/main/comfyui
- Tabla de configuracion ComfyUI de Viggle Remake: https://huggingface.co/Viggle/Viggle-Remake/blob/main/COMFYUI.md
- Noticia en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-11-04-viggle-remake
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- ComfyUI-KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- comfyui-minimax-h3-audio-T8: https://github.com/T8mars/comfyui-minimax-h3-audio-T8
- ComfyUI-H3-FaceRefine: https://github.com/Carasibana/ComfyUI-H3-FaceRefine
- Repositorio de modelos MiniMax H3 para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA de realismo para MiniMax H3: https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
- Upscaler latente para MiniMax H3: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
