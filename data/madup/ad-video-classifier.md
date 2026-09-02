# MADUP/ad-video-classifier

## Resumen
El modelo `MADUP/ad-video-classifier` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) desarrollado por MADUP, una empresa surcoreana especializada en marketing digital con IA. Este adaptador se construye sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct` y esta disenado especificamente para la tarea de clasificacion de videos, con un enfoque particular en el dominio publicitario (tag `advertising`).

Aunque la informacion publica es limitada, la combinacion de un modelo vision-language (VLM) de 7 mil millones de parametros con un adaptador PEFT sugiere que el modelo hereda las capacidades multimodales del Qwen2.5-VL, incluyendo comprension de video, imagenes y texto, adaptadas para la clasificacion de contenido audiovisual con fines publicitarios. El acceso al modelo es restringido (gated), lo que implica que los usuarios deben aceptar condiciones especificas en HuggingFace antes de poder descargarlo.

El repositorio tiene un tamano de 0.8 GB, coherente con un adaptador PEFT de tamano moderado sobre un modelo base de 7B. La fecha de creacion (septiembre de 2026) indica que es un modelo reciente, aunque no se dispone de metricas de adopcion (0 descargas, 0 likes) ni de documentacion tecnica detallada en el momento de la consulta.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre Qwen/Qwen2.5-VL-7B-Instruct (vision-language transformer) |
| Parametros totales | no disponible (el adaptador PEFT tiene un tamano de 0.8 GB; el modelo base tiene 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (hereda la del modelo base, no publicada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato estandar de PEFT/HuggingFace) |

## Arquitectura y entrenamiento
La arquitectura se basa en el modelo `Qwen/Qwen2.5-VL-7B-Instruct`, un vision-language model (VLM) de la familia Qwen2.5-VL que combina un transformer multimodal capaz de procesar imagenes, videos y texto. El adaptador PEFT (posiblemente LoRA o similar) ajusta el modelo base para la tarea especifica de clasificacion de videos, probablemente para identificar categorias publicitarias o segmentos relevantes dentro de contenido audiovisual.

No se dispone de informacion publica sobre el proceso de entrenamiento, los datos utilizados, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. Al ser un adaptador PEFT, se asume que el entrenamiento fue eficiente en parametros, congelando el modelo base y ajustando solo un subconjunto de pesos.

## Capacidades
- Clasificacion de videos: el modelo esta especializado en la tarea de video-classification, segun el tag del repositorio.
- Comprension multimodal: hereda las capacidades del modelo base Qwen2.5-VL-7B-Instruct, que incluyen procesamiento de video, imagenes y texto.
- Dominio publicitario: el tag `advertising` indica un enfoque especifico en contenido publicitario, lo que sugiere que el modelo puede identificar o clasificar anuncios dentro de videos.
- Ajuste fino eficiente: al ser un adaptador PEFT, el despliegue es ligero y requiere menos recursos que un fine-tuning completo.
- No se han publicado capacidades adicionales como tool calling, agentes o razonamiento multi-paso en la informacion disponible.

## Casos de uso
- Clasificacion automatica de anuncios en plataformas de video: el modelo puede analizar videos largos y detectar segmentos publicitarios, permitiendo a plataformas como YouTube o servicios de streaming etiquetar contenido comercial automaticamente.
- Analisis de campañas publicitarias: las agencias de marketing pueden usar el modelo para clasificar y categorizar sus propios anuncios, facilitando el analisis de rendimiento por tipo de contenido.
- Moderacion de contenido en redes sociales: el modelo podria identificar videos promocionales no declarados, ayudando a plataformas a hacer cumplir politicas de transparencia publicitaria.
- Indexacion de archivos de video en medios: empresas de broadcast pueden clasificar su videoteca por categorias publicitarias, mejorando la busqueda y recuperacion de contenido.
- Deteccion de placement de producto: el modelo podria identificar la presencia de publicidad implicita dentro de videos, util para estudios de mercado y analisis de competencia.
- Automatizacion de informes de medios: agencias de medios pueden generar informes automaticos sobre la distribucion de anuncios en diferentes canales de video.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este adaptador especifico. El rendimiento en tareas de clasificacion de video no puede evaluarse sin datos publicos de evaluacion.

## Requisitos de hardware
- VRAM estimada: no disponible de forma especifica para este adaptador. Como referencia, el modelo base Qwen2.5-VL-7B-Instruct requiere aproximadamente 16-20 GB de VRAM en precision FP16 para inferencia.
- GPU recomendadas: no disponibles. Se recomienda al menos una GPU con 16 GB de VRAM (RTX 4080/4090, A10, A100) para el modelo base, aunque el adaptador PEFT anade poca carga adicional.
- Compatibilidad con consumer GPU: probablemente si, en GPUs de 16 GB o mas, dependiendo de la cuantizacion utilizada.
- Opciones de despliegue: al ser un modelo PEFT, es compatible con el ecosistema HuggingFace (transformers + peft). Se puede integrar con vLLM, TGI o soluciones personalizadas. No hay informacion sobre soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No hay informacion suficiente para establecer una comparativa fiable. El modelo comparte base con otros fine-tunings de Qwen2.5-VL-7B-Instruct para tareas de video, pero no se dispone de datos de modelos comparables especificos para clasificacion publicitaria. La comparativa queda limitada al modelo base:

| Modelo | Parametros | Contexto | Tarea principal | Licencia |
|---|---|---|---|---|
| MADUP/ad-video-classifier | 7B (base) | no disponible | Clasificacion de video publicitario | Apache 2.0 |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | no disponible | VLM general | Apache 2.0 |
| Otros adaptadores PEFT sobre Qwen2.5-VL | variable | no disponible | Variable | Variable |

## Limitaciones y advertencias
- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones en HuggingFace antes de su uso.
- Informacion tecnica limitada: no se han publicado detalles sobre el entrenamiento, datos utilizados ni evaluacion de sesgos.
- Sesgos potenciales: al ser un modelo entrenado para publicidad, puede presentar sesgos relacionados con el tipo de contenido publicitario predominante en los datos de entrenamiento.
- Riesgo de alucinacion: como cualquier VLM, puede generar clasificaciones incorrectas en videos ambiguos o fuera de su dominio de entrenamiento.
- Dependencia del modelo base: las limitaciones del Qwen2.5-VL-7B-Instruct (idiomas, contexto, sesgos) se heredan en este adaptador.
- Sin documentacion de produccion: no hay guias de despliegue, metricas de latencia ni recomendaciones de escalado publicadas.
- Licencia: aunque la licencia es Apache 2.0, el acceso gated puede implicar restricciones adicionales de uso comercial no especificadas en la ficha.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/MADUP/ad-video-classifier
- Organizacion MADUP en HuggingFace: https://huggingface.co/MADUP
- Sitio web de MADUP: https://www.madup.com/en/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
