# DennisKoshta/upbringing-olmo2-1b-sft

## Resumen

upbringing-olmo2-1b-sft es un ajuste supervisado (SFT) del modelo allenai/OLMo-2-0425-1B, publicado por el usuario DennisKoshta dentro del proyecto Upbringing, una exploracion interactiva del post-entrenamiento de modelos de lenguaje. El modelo parte de la familia OLMo 2 de Ai2, un transformer decoder-only denso de aproximadamente 1,48 mil millones de parametros, y ha sido afinado sobre la mezcla SFT de Tülu 3 para OLMo-2.

El entrenamiento se realizo mediante 6.500 pasos (aproximadamente 0,58 epocas) aplicando la receta de 1B de AI2 con un presupuesto reducido, por lo que se trata de un artefacto de investigacion mas que de un modelo listo para produccion. Su relevancia es fundamentalmente educativa y metodologica: permite reproducir y examinar una receta de SFT sobre un modelo totalmente abierto, con codigo, configuraciones y evaluacion publicados en un repositorio aparte.

Al estar basado en OLMo 2, hereda el enfoque de apertura de Ai2 (datos, codigo y recetas reproducibles). La informacion disponible no documenta la longitud de contexto, los idiomas soportados ni la licencia del artefacto derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base OLMo-2-0425-1B) |
| Parametros totales | 1.484.916.736 (~1,48 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia para este artefacto; consultar las licencias de los modelos y datos de origen) |
| Formato de pesos | safetensors (formato transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de escala 1B, resultado de aplicar SFT sobre el checkpoint base allenai/OLMo-2-0425-1B. No se modifica la arquitectura del modelo base: el proceso consiste en un ajuste supervisado estandar sobre pesos preentrenados, con salida en safetensors compatible con la libreria transformers.

El entrenamiento se realizo durante 6.500 pasos (aproximadamente 0,58 epocas) sobre la mezcla SFT de Tülu 3 para OLMo-2, siguiendo la receta de 1B de AI2 bajo un presupuesto reducido. La model card indica explicitamente que se trata de un artefacto de investigacion de una ejecucion escalada a la baja, y remite al README del repositorio para conocer los resultados, las desviaciones respecto a las recetas de referencia y las licencias de los modelos y datos de origen. No se documenta en la informacion disponible el uso de DPO, RLHF u otras etapas posteriores de alineacion, ni innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto y modelado de lenguaje autoregresivo, heredado del modelo base OLMo-2-0425-1B.
- Comportamiento conversacional derivado del SFT sobre la mezcla Tülu 3, que incluye datos de instrucciones y dialogo.
- Capacidad de seguir instrucciones de formato y tarea, propia de un ajuste supervisado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre post-entrenamiento: el modelo forma parte del proyecto Upbringing, cuyo objetivo es mostrar de forma interactiva el flujo SFT, por lo que sirve como caso de estudio reproducible para entender como cambia un modelo base tras una etapa de ajuste supervisado.
- Reproduccion de recetas academicas: permite replicar la receta de 1B de AI2 sobre Tülu 3 con un presupuesto reducido y comparar los resultados frente a la ejecucion de referencia, dado que el repositorio publica configuraciones y evaluacion.
- Punto de partida para fine-tuning adicional: al ser un checkpoint ya instruido y de solo ~1,48 B de parametros, es un candidato ligero para SFT posterior, DPO o ajuste con LoRA en dominios concretos sin requerir hardware de gran escala.
- Prototipado de asistentes conversacionales de bajo coste: su tamano permite desplegarlo en una unica GPU de consumo para validar rapidamente interfaces de chat e integraciones de la capa de inferencia.
- Despliegue en entornos con recursos limitados: al caber en tarjetas con pocos GB de VRAM, puede ejecutarse localmente para tareas de generacion de texto y borradores donde no se requiera maxima calidad.
- Evaluacion comparativa de etapas de post-entrenamiento: util para estudiar el efecto aislado del SFT (sin DPO ni RL) frente a las versiones Instruct oficiales de Ai2, ya que comparten el mismo modelo base.
- Docencia y divulgacion tecnica: su naturaleza de artefacto de investigacion y su ventana reducida de parametros lo hacen apropiado para demostraciones en cursos y talleres sobre ajuste supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio del proyecto (github.com/DennisKoshta/upbringing) para consultar los resultados y la evaluacion, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los pesos de ~1,48 B de parametros ocupan del orden de 3 GB; en cuantizacion de 8 bits, aproximadamente 1,5 GB; en 4 bits, aproximadamente 0,8-1 GB (estimaciones a partir del recuento de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizacion agresiva y 6-8 GB para bf16; una NVIDIA RTX 3060/4060/4070 o superior es suficiente. A100 y H100 solo tendrian sentido para procesamiento por lotes de gran volumen.
- Cabe en GPU de consumo: si. Modelos de este tamano pueden ejecutarse en tarjetas domesticas de gama media, e incluso en CPU con cuantizacion.
- Opciones de despliegue: transformers de forma nativa (libreria declarada). Para vLLM, TGI, llama.cpp u Ollama seria necesario verificar compatibilidad o convertir los pesos a GGUF, ya que no se publican versiones cuantizadas (dato no disponible).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| upbringing-olmo2-1b-sft (DennisKoshta) | ~1,48 B | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| allenai/OLMo-2-0425-1B-Instruct | ~1,48 B | no disponible | no disponible | no disponible (verificar en la model card) | HuggingFace, release oficial de Ai2 |
| Qwen2.5-3B (Qwen team, Alibaba Cloud) | ~3 B | no disponible | no disponible | no disponible (verificar en la model card) | HuggingFace, release oficial de Qwen |

Los dos modelos comparables se citan en el propio repositorio del proyecto como referencia y atribucion: OLMo-2-0425-1B-Instruct por compartir modelo base y receta oficial, y Qwen2.5-3B por emplearse como comparacion de tamano superior. No se dispone de cifras de rendimiento ni de contexto para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia para este artefacto derivado; antes de cualquier uso comercial es imprescindible revisar las licencias del modelo base, de los pesos y de los datos de entrenamiento, tal como indica el README del repositorio.
- Es un artefacto de investigacion con 0 descargas y sin evaluacion publicada en la informacion disponible; no hay evidencia de calidad en tareas reales.
- Al ser un modelo de ~1,48 B de parametros, cabe esperar una tasa elevada de alucinacion y errores factuales en comparacion con modelos mayores.
- El entrenamiento cubre solo ~0,58 epocas con presupuesto reducido y unicamente una etapa de SFT, sin DPO ni RL; es probable que su alineacion sea inferior a la de las versiones Instruct oficiales.
- No se especifican los idiomas soportados; la mezcla Tülu 3 esta mayoritariamente orientada al ingles, por lo que el rendimiento en castellano es incierto.
- No se documenta la longitud de contexto efectiva ni el comportamiento en conversaciones de muchos turnos.
- No se declaran capacidades de tool calling, agentes ni multimodalidad; asumir su presencia no esta justificado.
- Al ser un ajuste sobre un base checkpoint, puede heredar los sesgos presentes en los datos de preentrenamiento y de SFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DennisKoshta/upbringing-olmo2-1b-sft
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Version Instruct oficial de Ai2: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Proyecto Upbringing (sitio): https://denniskoshta.github.io/upbringing/
- Repositorio Upbringing (codigo, configuraciones y evaluacion): https://github.com/DennisKoshta/upbringing
- Pagina de OLMo 2 de Ai2: https://allenai.org/olmo2
- Pagina general de OLMo de Ai2: https://allenai.org/olmo
