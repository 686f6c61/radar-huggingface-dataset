# shourabhji3/FaceCam

## Resumen

FaceCam es un modelo de generacion de video para retratos con control de camara, presentado en CVPR 2026 por Weijie Lyu, Yi Zhou, Ming-Hsuan Yang y Zhixin Shu. Se trata de un fine-tuning del modelo de imagen-a-video Wan-AI/Wan2.2-I2V-A14B, orientado a la sintesis de videos de retrato donde la trayectoria de camara se puede especificar de forma explicita. El repositorio de Hugging Face, publicado por el usuario shourabhji3, contiene los pesos ajustados junto con una representacion 3D proxy de la cabeza en formato PLY.

El modelo resuelve un problema concreto: la mayoria de modelos de generacion de video no permiten controlar la camara de forma precisa y consistente en primeros planos de rostros. FaceCam introduce un condicionamiento "scale-aware" que permite generar movimientos de camara realistas manteniendo la identidad y la coherencia temporal del sujeto. Es relevante para produccion audiovisual, avatares digitales y efectos especiales, donde el control de camara es un requisito practico.

El repositorio tiene un tamano de 16,8 GB, coherente con pesos de un modelo de video de aproximadamente 14 mil millones de parametros. La licencia es Apache 2.0, lo que facilita su uso comercial. No se dispone de informacion detallada sobre arquitectura interna, contexto o datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tuning de Wan2.2-I2V-A14B, modelo de difusion imagen-a-video) |
| Parametros totales | No disponible (el nombre del modelo base sugiere ~14B, sin confirmar) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo con safetensors y archivo gaussians.ply) |

## Arquitectura y entrenamiento

La informacion disponible indica que FaceCam es un fine-tuning del modelo Wan-AI/Wan2.2-I2V-A14B, un modelo de generacion de video imagen-a-video. El repositorio incluye dos componentes: los pesos ajustados del modelo de difusion (`wan2.2_14b`) y una representacion 3D proxy de la cabeza (`gaussians.ply`). Esta representacion proxy sugiere que el sistema utiliza una reconstruccion 3D intermedia para condicionar la generacion del video con la trayectoria de camara deseada.

El paper asociado (arXiv:2412.17812) se titula "FaceLift: Learning Generalizable Single Image 3D Face Reconstruction from Synthetic Heads", lo que indica que la base tecnica del pipeline es la reconstruccion 3D facial a partir de una sola imagen. La innovacion principal es el condicionamiento "scale-aware", que adapta la generacion del video a la escala y perspectiva de la camara objetivo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de video de retrato a partir de una sola imagen o video de entrada.
- Control preciso de la trayectoria de camara en la generacion.
- Mantenimiento de la identidad facial y coherencia temporal a lo largo del video.
- Reconstruccion 3D facial proxy (via gaussians.ply) para condicionar la generacion.
- Generacion de movimientos de camara realistas en primeros planos.
- Integracion con el ecosistema de Wan2.2-I2V-A14B.
- No se ha documentado soporte de tool calling, agentes, vision general, audio ni modo thinking.

## Casos de uso

- Produccion audiovisual: generacion de tomas de retrato con movimientos de camara controlados (dolly, orbit, tilt) a partir de una unica imagen del actor, reduciendo costes de rodaje.
- Avatares digitales: creacion de avatares con expresiones y movimientos de camara naturales para videollamadas, streaming o asistentes virtuales.
- Efectos especiales: insercion de movimientos de camara cinematograficos en planos de rostro sin necesidad de repetir la captura.
- Publicidad y marketing: generacion de variaciones de un mismo retrato con diferentes angulos de camara para campanas multicanal.
- Videojuegos y realidad virtual: generacion de retratos animados con control de camara para personajes no jugables o cinemáticas.
- Investigacion en vision por computador: base para experimentos de reconstruccion 3D facial y control de camara en generacion de video.
- Postproduccion: correccion o sintesis de movimientos de camara en material de archivo con primeros planos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El tamano del repo (16,8 GB) sugiere que los pesos en precision completa o media precision requieren al menos 16-20 GB de VRAM, pero no se confirma.
- GPU recomendadas: no disponible. Por el tamano del modelo base (aproximadamente 14B), se necesitarian GPUs de clase profesional como A100 o H100 para inferencia comoda.
- Cabe en consumer GPU: no confirmado. Una RTX 4090 (24 GB) podria ser insuficiente o justa segun la precision y el pipeline completo.
- Opciones de despliegue: no disponible. Se remite al repositorio oficial de codigo para instrucciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Control de camara | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FaceCam | No disponible (~14B por modelo base) | No disponible | Si, explicito | Apache 2.0 | Hugging Face |
| Wan2.2-I2V-A14B | ~14B | No disponible | No documentado | No disponible | Hugging Face |
| Otros modelos de video con control de camara | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El modelo esta especializado en retratos y primeros planos; no se ha documentado su comportamiento en escenas generales.
- No se dispone de informacion sobre sesgos demograficos, de genero o etnicos en los datos de entrenamiento.
- Riesgo de alucinacion visual: como modelo generativo, puede producir artefactos en la identidad facial o en la coherencia temporal, especialmente en trayectorias de camara extremas.
- No se ha documentado el rendimiento multilingue ni la calidad en distintos tipos de rostro.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Wan2.2-I2V-A14B puede tener condiciones adicionales que deben verificarse.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- El pipeline no esta disponible en Hugging Face; el uso requiere clonar el repositorio oficial de codigo.
- La fecha de creacion del repo (2026-11-24) es posterior a la fecha actual, lo que puede indicar un error en los metadatos o una publicacion programada.

## Enlaces

- Hugging Face: https://huggingface.co/shourabhji3/FaceCam
- Paper (arXiv): https://arxiv.org/abs/2412.17812
- Codigo oficial: https://github.com/weijielyu/FaceCam
- Project page: https://www.wlyu.me/FaceCam/
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
