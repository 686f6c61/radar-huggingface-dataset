# mradermacher/UnifiedReward-qwen-3b-GGUF

## Resumen

UnifiedReward-qwen-3b-GGUF es la versión cuantizada en formato GGUF del modelo UnifiedReward-qwen-3b, desarrollado originalmente por CodeGoat24 y convertido a GGUF por mradermacher. Se trata de un modelo de recompensa (reward model) multimodal construido sobre una base Qwen de 3.085.938.688 parámetros, diseñado para evaluar y puntuar respuestas generadas por otros modelos, incluyendo contenido de texto, imagen y vídeo. Su función principal es servir como componente de sistemas de alineación (RLHF, DPO y variantes) y como evaluador automático de calidad.

El modelo base fue entrenado sobre un conjunto de datasets especializados en preferencias humanas y feedback multimodal, entre ellos HPD, LiFT-HRA, OIP, EvalMuse, ShareGPTVideo-DPO, VideoFeedback, LLaVA-Critic-113k y VideoDPO. Esta composición indica un enfoque claro hacia la evaluación de respuestas generadas, incluyendo tareas de crítica visual y de vídeo, lo que lo diferencia de un modelo generativo convencional.

La relevancia de esta ficha radica en que la versión GGUF permite ejecutar un reward model multimodal de 3B en hardware de consumo, algo poco habitual en este tipo de modelos, que suelen distribuirse únicamente en safetensors y requerir GPU de datacenter. La licencia MIT facilita su uso comercial e integración en pipelines de evaluación y alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen, segun el nombre del modelo; detalles exactos no disponibles) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, ademas de mmproj Q8_0 y mmproj f16 para el componente multimodal |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se construye sobre una arquitectura transformer de tipo Qwen con aproximadamente 3.086 millones de parametros, e incorpora un componente multimodal separado (mmproj) que se distribuye como fichero adicional en las cuantizaciones GGUF. Esto confirma que el modelo procesa entradas de imagen y video ademas de texto, coherente con los datasets de entrenamiento empleados.

El entrenamiento se realizo sobre ocho datasets orientados a preferencias y evaluacion: HPD, LiFT-HRA, OIP, EvalMuse, ShareGPTVideo-DPO, VideoFeedback, LLaVA-Critic-113k y VideoDPO. Estos conjuntos cubren evaluacion de texto generado, critica visual, feedback de video y preferencias humanas, lo que sugiere un entrenamiento orientado a tareas de recompensa y critica mas que a generacion libre. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

## Capacidades

- Evaluacion y puntuacion de respuestas generadas por otros modelos (reward modeling) en tareas de texto.
- Critica y evaluacion de contenido visual (imagenes) gracias al componente multimodal mmproj.
- Evaluacion de contenido de video, segun los datasets ShareGPTVideo-DPO, VideoFeedback y VideoDPO.
- Comparacion de pares de respuestas para determinar preferencias (util en pipelines de DPO y RLHF).
- Procesamiento de conversaciones multi-turno (tag conversational en Hugging Face).
- Soporte de inferencia en ingles exclusivamente.
- Compatible con endpoints (tag endpoints_compatible).
- No se documenta soporte de tool calling, function calling ni modo thinking.

## Casos de uso

- Alineacion de modelos generativos: el modelo puede actuar como reward model en pipelines de RLHF o DPO, puntuando respuestas candidatas y guiando el ajuste fino de un modelo politico de menor tamano.
- Evaluacion automatica de calidad de respuestas: integrado en un pipeline de CI/CD para evaluar regresiones en la calidad de un chatbot antes de desplegar una nueva version.
- Critica de contenido visual: uso del componente mmproj para evaluar descripciones generadas sobre imagenes y detectar alucinaciones o descripciones incompletas.
- Evaluacion de video generado o descrito: puntuacion de respuestas sobre clips de video en tareas de captioning o QA visual, aprovechando los datasets de video del entrenamiento.
- Filtrado de datos de entrenamiento: puntuacion de grandes volumenes de pares pregunta-respuesta para descartar muestras de baja calidad antes de incluirlas en un dataset de ajuste fino.
- Despliegue en hardware de consumo: gracias a las cuantizaciones GGUF (desde 1,4 GB en Q2_K hasta 3,4 GB en Q8_0), puede ejecutarse en estaciones de trabajo sin GPU de datacenter para tareas de evaluacion por lotes.
- Comparacion A/B de modelos: uso como juez automatico para decidir que modelo de una pareja produce mejores respuestas en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB (Q2_K), 2,0 GB (Q4_K_M), 3,4 GB (Q8_0) y 6,3 GB (f16) para los pesos del modelo; el componente mmproj anade 0,9 GB (Q8_0) o 1,4 GB (f16).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para cuantizaciones Q4 o superiores; RTX 3060, RTX 4060, RTX 4090 para mayor throughput. Para f16 se recomienda 8 GB o mas.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base usa transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| UnifiedReward-qwen-3b-GGUF | 3,09B | no disponible | Si (imagen y video) | MIT | GGUF |
| Modelos reward basados en Qwen de 3B (genericos) | ~3B | no disponible | No | variable | safetensors |
| Modelos reward multimodales de mayor tamano | no disponible | no disponible | Si | variable | safetensors |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas concretas. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Es un reward model, no un modelo generativo: no debe usarse para generar respuestas al usuario, sino para puntuarlas.
- Riesgo de sesgo heredado de los datasets de preferencias humanas (HPD, OIP, EvalMuse, etc.), que pueden reflejar sesgos culturales o de anotacion.
- Riesgo de alucinacion en las puntuaciones o criticas generadas, especialmente fuera del dominio de entrenamiento.
- No se documenta la longitud de contexto, lo que impide garantizar el comportamiento en entradas largas.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K) pueden degradar la precision de las puntuaciones; se recomienda Q4_K_M o superior para tareas de evaluacion.
- El componente multimodal requiere cargar el fichero mmproj por separado; olvidarlo desactiva las capacidades de imagen y video.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las licencias de los datasets de entrenamiento originales si redistribuye derivados.
- No se documentan garantias de calibracion de las puntuaciones; en produccion conviene validar contra un conjunto de referencia propio.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/UnifiedReward-qwen-3b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/UnifiedReward-qwen-3b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#UnifiedReward-qwen-3b-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
