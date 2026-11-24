# mradermacher/UnifiedReward-2.0-qwen-3b-GGUF

## Resumen

UnifiedReward-2.0-qwen-3b es un modelo de recompensa (reward model) multimodal construido sobre una base Qwen de 3.000 millones de parametros. Lo desarrolla el equipo CodeGoat24 y esta disenado para evaluar la calidad de respuestas generadas por otros modelos, abarcando texto, imagenes y video. Su proposito es servir como componente de puntuacion en pipelines de alineamiento (RLHF, DPO, best-of-N) y en la evaluacion automatizada de salidas multimodales.

El repositorio aqui descrito es la cuantizacion estatica en formato GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. Incluye el proyector multimodal (mmproj) en variantes Q8_0 y f16, ademas de cuantizaciones desde Q2_K hasta f16, cubriendo desde 1,4 GB hasta 6,3 GB de pesos.

La relevancia actual radica en la escasez de reward models multimodales abiertos de tamano reducido: con 3B parametros y licencia MIT, este modelo puede desplegarse localmente para puntuar respuestas sin depender de APIs propietarias, lo que facilita la investigacion reproducible en alineamiento de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen) con proyector multimodal para vision y video; no disponible el detalle exacto de capas y dimensiones |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizacion estatica); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

El modelo base, CodeGoat24/UnifiedReward-2.0-qwen-3b, parte de una arquitectura Qwen de tipo decoder-only con un proyector multimodal que le permite procesar entradas de imagen y video ademas de texto. La tarea objetivo es la puntuacion de respuestas (reward modeling), no la generacion libre, por lo que su salida se orienta a valorar la calidad de candidatos generados por otros sistemas.

El entrenamiento combina multiples conjuntos de datos de preferencias y evaluacion: HPD, LiFT-HRA, OIP, EvalMuse, ShareGPTVideo-DPO, VideoFeedback, LLaVA-Critic-113k y VideoDPO. Esta mezcla cubre preferencias de texto, datos de critica visual (LLaVA-Critic) y pares de preferencia sobre video (ShareGPTVideo-DPO, VideoDPO), lo que sugiere un entrenamiento orientado a alineamiento multimodal. No se dispone en la informacion proporcionada del numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO especificas mas alla del uso de datos de preferencia.

La cuantizacion GGUF la realiza mradermacher mediante conversion desde el checkpoint Hugging Face y cuantizacion estatica de tensores; el repositorio incluye tambien una variante con cuantizacion ponderada/imatrix publicada por separado.

## Capacidades

- Evaluacion y puntuacion de respuestas generadas por modelos de lenguaje (reward modeling) en lugar de generacion de texto libre.
- Procesamiento multimodal: acepta imagenes y video ademas de texto, gracias al proyector mmproj incluido.
- Evaluacion de calidad de descripciones visuales y de respuestas sobre contenido de video, derivada de los datasets LLaVA-Critic, VideoFeedback y VideoDPO.
- Puntuacion de pares de preferencia para pipelines de DPO y best-of-N.
- Uso como critico automatico en tareas de evaluacion de instrucciones y respuestas (datasets HPD, LiFT-HRA, OIP, EvalMuse).
- Soporte de conversacion multi-turno en formato chat (tag conversational en el repositorio).
- Compatibilidad con endpoints de inferencia (tag endpoints_compatible).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Filtrado de datos sinteticos: puntuar respuestas generadas por un LLM grande y conservar solo las de mayor calidad para construir datasets de instrucciones, usando el modelo como juez local sin coste de API.
- Best-of-N en generacion: generar varias respuestas candidatas y seleccionar la mejor segun la puntuacion del reward model, reduciendo la necesidad de un modelo critico propietario.
- Evaluacion de modelos multimodales: comparar descripciones de imagenes o respuestas sobre video entre distintos sistemas generativos, aprovechando el proyector multimodal incluido.
- Alineamiento con DPO: usar las puntuaciones de preferencia para construir pares (elegido, rechazado) en el entrenamiento de modelos propios.
- Investigacion en alineamiento reproducible: al tener licencia MIT y pesos GGUF, permite reproducir experimentos de reward modeling en una sola GPU de consumo.
- Evaluacion de calidad en pipelines de video: puntuar resumenes o descripciones de clips de video generados automaticamente en un sistema de catalogacion.
- Control de calidad en entornos con privacidad: al ejecutarse en local, permite evaluar respuestas sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB (Q2_K), 1,9-2,0 GB (Q4_K_S/Q4_K_M), 2,3 GB (Q5_K_M), 2,6 GB (Q6_K), 3,4 GB (Q8_0) y 6,3 GB (f16), a los que se suma el proyector multimodal (0,9 GB en Q8_0 o 1,4 GB en f16).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para las cuantizaciones Q4-Q8; para f16 se recomienda al menos 8 GB. En entornos de servidor, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4070 y superiores; tambien en GPUs integradas con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors si se requiere mayor throughput.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| UnifiedReward-2.0-qwen-3b (este) | 3,09B | no disponible | Si (imagen y video) | MIT | GGUF, safetensors |
| Modelos de recompensa basados en Qwen de 3B sin proyector multimodal | aproximadamente 3B | no disponible | No | variable | safetensors, GGUF |
| Reward models propietarios de APIs comerciales | no disponible | no disponible | variable | propietaria | API |
| Modelos criticos multimodales abiertos de mayor tamano | mayor que 3B | no disponible | Si | variable | safetensors |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, modalidad y licencia.

## Limitaciones y advertencias

- El modelo esta pensado para puntuar respuestas, no para generar texto de alta calidad; usarlo como generador producira resultados pobres.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de sesgo: al entrenarse con datasets de preferencia humanos y sinteticos (HPD, LLaVA-Critic, etc.), puede heredar sesgos de anotacion y favorecer estilos de respuesta concretos.
- Riesgo de alucinacion en las puntuaciones: como cualquier reward model, puede asignar valores poco fiables fuera de la distribucion de entrenamiento.
- Longitud de contexto no documentada: conviene validar el comportamiento con entradas largas antes de usarlo en produccion.
- La licencia MIT permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden tener condiciones adicionales que deben revisarse.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de las puntuaciones; para evaluacion fiable se recomienda Q5_K_M o superior.
- El repositorio GGUF pesa 30,1 GB en total por incluir todas las variantes; descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UnifiedReward-2.0-qwen-3b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/UnifiedReward-2.0-qwen-3b
- Variante imatrix: https://huggingface.co/mradermacher/UnifiedReward-2.0-qwen-3b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#UnifiedReward-2.0-qwen-3b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
