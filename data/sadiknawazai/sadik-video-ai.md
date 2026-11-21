# SadikNawazAI/SADIK-VIDEO-AI

## Resumen

SADIK-VIDEO-AI es un repositorio de Hugging Face publicado por el usuario SadikNawazAI que redistribuye los pesos del modelo Wan2.1 T2V-1.3B, un modelo de generacion de video texto-a-video desarrollado originalmente por el equipo Wan-AI (Alibaba). El modelo resuelve la tarea de sintetizar clips de video a partir de descripciones textuales, con un enfoque en accesibilidad: es la variante pequena de la familia Wan2.1, disenada para ejecutarse en GPUs de consumo.

La arquitectura es un modelo de difusion para video (pipeline `WanPipeline` en diffusers) con aproximadamente 1.419 millones de parametros (1.3B nominales) y un VAE de video propio (Wan-VAE) capaz de codificar y decodificar video 1080P preservando informacion temporal. El repositorio ocupa 28.9 GB e incluye pesos en formato safetensors.

Es relevante porque la familia Wan2.1 se posiciona como una suite abierta de modelos fundacionales de video con licencia Apache 2.0, y esta variante concreta permite generar video 480P en GPUs consumer con un consumo de VRAM de unos 8.19 GB. No obstante, el repositorio de SadikNawazAI no anade documentacion propia ni resultados de benchmarks: la model card es una copia de la documentacion oficial de Wan2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video (pipeline `WanPipeline` de diffusers) con VAE de video (Wan-VAE) |
| Parametros totales | 1.418.996.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-video; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (la model card menciona que las cifras de VRAM son sin tecnicas de cuantizacion) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de difusion latente aplicado a video: un transformer de difusion opera sobre representaciones latentes producidas por Wan-VAE, un VAE de video disenado para codificar y decodificar video 1080P de cualquier duracion preservando la coherencia temporal. El pipeline se expone a traves de diffusers como `WanPipeline`, lo que facilita su integracion en flujos de trabajo basados en la libreria.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. La model card oficial de Wan2.1 destaca como innovaciones la capacidad de generar texto en chino e ingles dentro del propio video (primera familia de modelos de video con esta caracteristica) y la eficiencia del VAE para resoluciones altas. El repositorio de SadikNawazAI no aporta informacion adicional sobre el entrenamiento ni sobre posibles ajustes respecto al modelo original.

## Capacidades

- Generacion de video a partir de texto (text-to-video) a resolucion 480P, con soporte de 720P en el modelo base aunque con menor estabilidad segun la documentacion original.
- Generacion de texto en chino e ingles dentro del contenido visual del video.
- La familia Wan2.1 cubre ademas image-to-video, edicion de video, text-to-image y video-to-audio, aunque este repositorio concreto aloja unicamente el modelo T2V-1.3B.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a en y zh segun los metadatos del repositorio.

## Casos de uso

- Prototipado rapido de video generativo: equipos con una sola GPU consumer pueden generar clips de 5 segundos a 480P en aproximadamente 4 minutos en una RTX 4090, lo que permite iterar sobre guiones y storyboards sin infraestructura dedicada.
- Creacion de contenido para redes sociales: generacion de clips cortos a partir de descripciones textuales para previsualizar conceptos antes de producir video final.
- Investigacion academica en generacion de video: el modelo sirve como linea base abierta (Apache 2.0) para experimentos de difusion sobre video con recursos computacionales limitados.
- Generacion de material de apoyo en docencia: clips ilustrativos de conceptos descritos en texto, con la ventaja de que el modelo puede renderizar rotulos en ingles y chino.
- Pruebas de concepto en pipelines de difusion con diffusers: su integracion como `WanPipeline` permite incorporarlo a flujos existentes de la libreria para evaluar calidad y latencia.
- Generacion de video con texto en pantalla: casos donde se necesita que aparezcan cadenas de texto legibles en ingles o chino dentro del video, una capacidad poco comun en modelos abiertos de esta categoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de Wan2.1 afirma de forma generica que supera a modelos abiertos y soluciones comerciales en multiples benchmarks, pero no se incluyen cifras concretas en la informacion proporcionada. El unico dato de rendimiento concreto es que el modelo T2V-1.3B genera un video de 5 segundos a 480P en aproximadamente 4 minutos en una RTX 4090 sin tecnicas de optimizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: 8.19 GB para el modelo T2V-1.3B sin cuantizacion, segun la documentacion original.
- GPU recomendadas: RTX 4090 para el caso de referencia (5 s a 480P en ~4 min); cualquier GPU consumer con al menos ~8-9 GB de VRAM disponible deberia poder ejecutar el modelo.
- Cabe en GPU consumer: si, es uno de los puntos fuertes declarados del modelo.
- Opciones de despliegue: diffusers (`WanPipeline`), codigo de inferencia oficial del repositorio Wan2.1 en GitHub, demo Gradio. La integracion con ComfyUI figura como pendiente en la lista de tareas de la model card original.
- Latencia y throughput: ~4 minutos por clip de 5 segundos a 480P en RTX 4090 sin optimizacion; no hay mas datos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | VRAM minima declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.1 T2V-1.3B (este repo) | ~1.3B | 480P (720P inestable) | 8.19 GB | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1 T2V-14B | 14B | 480P y 720P | no disponible | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1 I2V-14B-480P / 720P | 14B | 480P / 720P | no disponible | Apache 2.0 | Hugging Face, ModelScope |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos de terceros (por ejemplo, otros generadores texto-a-video abiertos) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio es una redistribucion no oficial: el autor (SadikNawazAI) no aporta documentacion propia, benchmarks ni garantias de integridad de los pesos. Para produccion conviene usar el repositorio oficial `Wan-AI/Wan2.1-T2V-1.3B`.
- La resolucion 720P en el modelo de 1.3B es inestable por falta de entrenamiento a esa resolucion; se recomienda 480P.
- Riesgo de artefactos visuales, incoherencias temporales y texto mal renderizado inherente a los modelos de difusion de video de este tamano.
- Sesgos: no se documenta en la informacion disponible ninguna evaluacion de sesgos del dataset de entrenamiento.
- Idiomas: solo ingles y chino; las descripciones en otras lenguas pueden degradar la calidad del resultado.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de una copia no oficial se recomienda verificar la procedencia de los pesos antes de desplegarlos.
- Sin datos publicados sobre consumo energetico, throughput en lote ni comportamiento en GPUs de gama baja distintas de la RTX 4090.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SadikNawazAI/SADIK-VIDEO-AI
- Repositorio oficial del modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Version diffusers oficial: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- GitHub oficial: https://github.com/Wan-Video/Wan2.1
- Organizacion Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Blog: https://wanxai.com
- Discord: https://discord.gg/p5XbdQV7
- Paper: pendiente de publicacion segun la model card
