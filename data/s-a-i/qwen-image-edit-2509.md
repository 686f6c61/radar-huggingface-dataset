# s-a-i/Qwen-Image-Edit-2509

## Resumen

Qwen-Image-Edit-2509 es la iteración de septiembre de 2025 del modelo de edición de imágenes por instrucciones de Alibaba Qwen. Se trata de un modelo de difusión multimodal que acepta una o varias imágenes de entrada junto con un prompt en lenguaje natural para realizar modificaciones dirigidas: cambiar la pose de una persona, editar el texto de un cartel, combinar varios sujetos en una misma escena, etc. A diferencia de los generadores texto-a-imagen convencionales, este modelo está especializado en preservar la identidad del sujeto original mientras aplica la transformación solicitada.

La versión 2509 introduce tres mejoras principales respecto a la iteración anterior: soporte nativo para edición multi-imagen (hasta tres imágenes de entrada, combinando personas, productos y escenas), mayor consistencia en la edición de retratos, productos y texto, y soporte integrado de ControlNet para mapas de profundidad, bordes y puntos clave. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en inglés y chino. El repositorio analizado (s-a-i/Qwen-Image-Edit-2509) es una copia archivada sin modificaciones de los pesos originales, alojada por un tercero con fines de preservación.

Con 20 430 millones de parámetros y un tamaño de repositorio de 57,7 GB, el modelo requiere hardware de gama alta para inferencia. Se integra con la librería `diffusers` mediante el pipeline `QwenImageEditPlusPipeline`, lo que facilita su uso en entornos de investigación y producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion multimodal para edicion de imagenes (basado en Qwen-Image) |
| Parametros totales | 20 430 401 088 (20,43 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible, pero por el nombre y el pipeline (`QwenImageEditPlusPipeline`) se trata de un modelo de difusion multimodal que combina un codificador de texto (probablemente basado en Qwen) con un decodificador de difusion para generar imagenes. El modelo se entrena sobre la arquitectura Qwen-Image, con una fase adicional de entrenamiento mediante concatenacion de imagenes para habilitar la edicion multi-imagen. Tambien incorpora soporte nativo para ControlNet, lo que permite condicionar la generacion con mapas de profundidad, mapas de bordes o mapas de puntos clave.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. El informe tecnico referenciado (arXiv:2508.02324) corresponde al modelo Qwen-Image base, no a esta iteracion de edicion.

## Capacidades

- Edicion de imagenes por instrucciones en lenguaje natural: modificar contenido, estilo, pose, fondo, iluminacion, etc.
- Edicion multi-imagen: combina hasta tres imagenes de entrada (persona + persona, persona + producto, persona + escena) en una sola salida coherente.
- Consistencia de identidad facial: preserva los rasgos de la persona en retratos, soportando cambios de pose y estilo.
- Consistencia de producto: mantiene la identidad del producto en ediciones de carteles o anuncios.
- Edicion de texto en imagenes: modifica el contenido textual, asi como la fuente, el color y el material del texto.
- Soporte nativo de ControlNet: acepta mapas de profundidad, mapas de bordes y mapas de puntos clave como condicion adicional.
- Idiomas: ingles y chino para los prompts.

## Casos de uso

- Edicion de retratos profesionales: un estudio fotografico puede cambiar la pose o el fondo de un retrato manteniendo la identidad facial, gracias a la consistencia mejorada de la iteracion 2509.
- Composicion de escenas con multiples sujetos: un disenador puede combinar dos fotografias de personas distintas en una misma escena coherente, por ejemplo para un cartel publicitario, usando la entrada multi-imagen.
- Edicion de carteles de producto: una agencia de marketing puede modificar el texto, el color o el material de un producto en una imagen existente sin regenerar toda la composicion, preservando la identidad del producto.
- Control de pose mediante ControlNet: un animador puede cambiar la pose de un personaje a partir de un mapa de puntos clave, manteniendo el resto de la imagen intacta.
- Restauracion y retoque de imagenes historicas: un archivo digital puede corregir defectos o anadir elementos a fotografias antiguas con instrucciones precisas, gracias al soporte de edicion dirigida.
- Generacion de variantes de diseno: un equipo creativo puede generar multiples variaciones de una misma imagen base (cambiando iluminacion, estilo o elementos) para pruebas A/B, usando prompts en ingles o chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye tablas comparativas con otros modelos de edicion de imagenes, y la busqueda web no ha proporcionado datos cuantitativos de rendimiento.

## Requisitos de hardware

- VRAM estimada: con 20 430 millones de parametros y pesos en bfloat16 (2 bytes por parametro), el modelo requiere aproximadamente 41 GB solo para los pesos. En la practica, con el pipeline de difusion y las activaciones, se recomienda una GPU con al menos 80 GB de VRAM.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o superior. No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantizacion, y no se han publicado versiones cuantizadas.
- Opciones de despliegue: el modelo se integra con `diffusers` mediante `QwenImageEditPlusPipeline`. No se mencionan soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de difusion, no un LLM generativo de texto.
- Latencia y throughput: no disponible. La inferencia con 40 pasos de difusion (como en el ejemplo) puede tardar varios segundos o minutos segun la GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de edicion de imagenes (como InstructPix2Pix, FLUX.1 Kontext o modelos propietarios) en la informacion proporcionada. No se puede establecer una comparativa fiable sin datos de benchmarks.

## Limitaciones y advertencias

- El repositorio analizado es una copia archivada de un tercero (s-a-i), no el repositorio oficial de Qwen. Aunque se afirma que no se han modificado los pesos, se recomienda descargar el modelo desde la fuente original (Qwen/Qwen-Image-Edit-2509) para uso en produccion.
- No se han publicado datos sobre sesgos del modelo, pero al ser un modelo entrenado con datos de internet, puede reflejar sesgos de genero, raza o cultura presentes en los datos de entrenamiento.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir artefactos o inconsistencias en regiones editadas, especialmente con multiples imagenes de entrada.
- Limitaciones de idioma: los prompts estan soportados en ingles y chino; otros idiomas pueden dar resultados suboptimos.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar las licencias de los componentes y datasets utilizados en el entrenamiento, que no se detallan en la informacion disponible.
- El modelo requiere hardware de gama alta; no es adecuado para despliegue en entornos con recursos limitados sin cuantizacion, que no se ha publicado.

## Enlaces

- Repositorio original en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Repositorio de la copia archivada: https://huggingface.co/s-a-i/Qwen-Image-Edit-2509
- Informe tecnico de Qwen-Image (arXiv): https://arxiv.org/abs/2508.02324
- Blog de Qwen sobre Qwen-Image-Edit: https://qwenlm.github.io/blog/qwen-image-edit/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit
- Repositorio de codigo en GitHub: https://github.com/QwenLM/Qwen-Image
- Modelo en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2509
