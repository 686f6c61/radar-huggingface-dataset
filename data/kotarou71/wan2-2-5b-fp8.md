# kotarou71/Wan2.2-5B-FP8

## Resumen

El modelo `kotarou71/Wan2.2-5B-FP8` es una cuantizacion en FP8 del modelo Wan2.2 TI2V 5B, desarrollado originalmente por el equipo Wan-Video y reempaquetado por Comfy-Org para su integracion en ComfyUI. Este modelo esta especializado en generacion de video a partir de texto e imagen (text-to-video e image-to-video), con una arquitectura hibrida que combina un VAE de alta compresion (16x16x4) con un transformer de 5.000 millones de parametros. La version FP8 reduce los requisitos de memoria y acelera la inferencia, lo que permite ejecutar el modelo en tarjetas graficas de consumo como la RTX 4090.

La relevancia de este lanzamiento radica en que democratiza la generacion de video de alta definicion (720P a 24 fps) en hardware asequible, manteniendo una licencia Apache 2.0 que permite uso comercial sin restricciones. La cuantizacion FP8 es una optimizacion practica para entornos de produccion donde el rendimiento y el consumo de VRAM son criticos. Sin embargo, la informacion publica sobre este repositorio especifico es minima: no se proporcionan detalles sobre el proceso de cuantizacion, benchmarks propios ni configuraciones de despliegue, por lo que gran parte de los datos tecnicos deben inferirse del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (texto-imagen-video) con VAE de compresion 16x16x4 |
| Parametros totales | 5.000 millones (5B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta version) |
| Idiomas soportados | no disponible (el modelo base soporta ingles y chino, segun documentacion de Wan2.2) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo base Wan2.2 TI2V 5B emplea una arquitectura hibrida que integra un VAE con factor de compresion 16x16x4 (espacial y temporal) y un transformer de 5.000 millones de parametros. Esta combinacion permite generar video de 720P a 24 fps con una sola pasada, tanto a partir de texto como de una imagen inicial. El VAE reduce drasticamente la carga computacional al comprimir la informacion espacio-temporal antes de la atencion del transformer. El entrenamiento se realizo con un dataset masivo de video de alta calidad, aunque no se han publicado cifras exactas de tokens o composicion del dataset en la informacion disponible. No se mencionan tecnicas de alineacion como RLHF o DPO para este modelo; la optimizacion principal se centra en la calidad de generacion y la eficiencia.

La cuantizacion FP8 de este repositorio reduce los pesos a 8 bits en coma flotante, lo que disminuye el uso de VRAM aproximadamente un 50% respecto a FP16 y acelera la inferencia en GPUs con soporte nativo para FP8 (como las series RTX 40 y posteriores). El proceso de cuantizacion no esta documentado en la model card, por lo que se desconoce si se aplico calibracion o tecnicas de compensacion de errores.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resolucion hasta 720P y 24 fps.
- Generacion de video a partir de imagen (image-to-video), permitiendo animar fotografias o ilustraciones.
- Soporte para multiples fotogramas y duraciones variables, aunque los limites exactos no estan especificados.
- Generacion de video en alta resolucion con compresion temporal eficiente gracias al VAE 16x16x4.
- Capacidad de ejecucion en GPUs de consumo (RTX 4090) gracias a la cuantizacion FP8.
- No se documentan capacidades de tool calling, agentes, razonamiento multimodal o audio.

## Casos de uso

- Creacion de contenido para redes sociales: generar clips cortos de 5-10 segundos a partir de descripciones textuales para plataformas como TikTok o Instagram, aprovechando la resolucion 720P y la velocidad de inferencia en GPU consumer.
- Animacion de imagenes estaticas: convertir fotografias o ilustraciones en secuencias animadas para presentaciones, publicidad o proyectos artisticos, usando la modalidad image-to-video.
- Prototipado rapido de escenas para produccion audiovisual: los directores o editores pueden previsualizar conceptos de escenas sin necesidad de rodaje, generando videos de baja duracion a partir de guiones o storyboards.
- Generacion de material de entrenamiento sintetico: crear videos etiquetados para entrenar modelos de vision por computador en tareas como seguimiento de objetos o segmentacion, evitando la recopilacion manual de datos.
- Educacion y divulgacion: producir animaciones explicativas para cursos online o videos divulgativos, combinando texto e imagenes de forma automatizada.
- Integracion en pipelines de ComfyUI: al ser un reempaquetado de Comfy-Org, se puede utilizar dentro de flujos de trabajo de ComfyUI junto con otros nodos de postprocesado, lo que facilita su adopcion en entornos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio especifico. El modelo base Wan2.2 TI2V 5B tampoco incluye tablas comparativas en la documentacion consultada. Se recomienda consultar el repositorio oficial de Wan-Video para obtener metricas de calidad de generacion (FVD, CLIP score, etc.) si estan disponibles.

## Requisitos de hardware

- VRAM estimada: no se proporciona un valor exacto para la version FP8. Segun la documentacion de Wan2.2, el modelo puede ejecutarse en una RTX 4090 (24 GB VRAM) en su version FP16; la cuantizacion FP8 reduce el consumo a aproximadamente la mitad, por lo que cabria esperar que funcione en GPUs con 12-16 GB VRAM, pero esta cifra no esta confirmada.
- GPU recomendadas: RTX 4090 o superiores con soporte FP8 (RTX 40 series). Tambien es compatible con GPUs profesionales como A100 o H100, aunque no se indican requisitos minimos.
- Compatibilidad con GPU consumer: si, gracias a la cuantizacion FP8 y al tamano reducido (5B), puede ejecutarse en tarjetas de gama alta de consumo.
- Opciones de despliegue: al ser un modelo de ComfyUI, se integra nativamente en ComfyUI. Tambien puede desplegarse con herramientas como Diffusers o vLLM si se convierten los pesos, aunque no se documentan instrucciones especificas.
- Latencia y throughput: no disponibles. La generacion de video depende de la duracion y resolucion solicitadas; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa con alternativas como CogVideoX, Mochi 1 o Open-Sora. El modelo base Wan2.2 se posiciona como una solucion eficiente para video de alta resolucion en hardware consumer, pero sin benchmarks publicos no es posible establecer diferencias cuantitativas. Se recomienda consultar el repositorio oficial de Wan-Video para comparaciones con otros modelos si existen.

## Limitaciones y advertencias

- La informacion publica de este repositorio es minima: no se documenta el proceso de cuantizacion, ni se garantiza la fidelidad de la conversion FP8 respecto al modelo original.
- El modelo base puede presentar sesgos en la generacion de contenido, especialmente en representaciones de personas o culturas, derivados de los datos de entrenamiento. No se han publicado evaluaciones de sesgo.
- Riesgo de alucinaciones visuales: el modelo puede generar objetos o movimientos inconsistentes con la fisica, especialmente en escenas complejas o con multiples interacciones.
- Limitaciones de idioma: aunque el modelo base soporta ingles y chino, la informacion no confirma el soporte para otros idiomas. Las instrucciones en castellano pueden no funcionar correctamente.
- La generacion de video requiere un control fino de parametros (duracion, fps, resolucion) que no estan documentados en este repositorio; se recomienda consultar la documentacion de Wan2.2 para configuraciones optimas.
- Licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el contenido generado no infrinja derechos de terceros (personas, marcas, obras protegidas).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kotarou71/Wan2.2-5B-FP8
- Repositorio oficial de Wan2.2 (GitHub): https://github.com/Wan-Video/Wan2.2
- Modelo base original en HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repositorio alternativo de cuantizacion FP8: https://huggingface.co/wangkanai/wan22-fp8-i2v
- Pagina de requisitos VRAM (WillItRunAI): https://willitrunai.com/video-models/wan-video-2-2-ti2v-5b
