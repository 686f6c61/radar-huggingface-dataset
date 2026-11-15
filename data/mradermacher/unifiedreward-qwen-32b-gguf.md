# mradermacher/UnifiedReward-qwen-32b-GGUF

## Resumen

UnifiedReward-qwen-32b-GGUF es la versión cuantizada en formato GGUF del modelo UnifiedReward-qwen-32b, desarrollado originalmente por el equipo CodeGoat24 y convertido a GGUF por mradermacher. Se trata de un modelo de recompensa (reward model) construido sobre una base Qwen de 32 000 millones de parámetros (32.763.876.352 parámetros reales según los safetensors), diseñado para evaluar y puntuar respuestas generadas por otros modelos, especialmente en tareas multimodales de comprensión y generación de imágenes y vídeo. Su función principal es servir como señal de recompensa en pipelines de RLHF, DPO y evaluación automática de calidad.

El modelo se entrena sobre un conjunto agregado de datasets orientados a preferencias humanas y feedback multimodal, entre los que figuran HPD, LiFT-HRA, OIP, EvalMuse, ShareGPTVideo-DPO, VideoFeedback, LLaVA-Critic-113k y VideoDPO. Esta combinación lo posiciona como una alternativa unificada para puntuar salidas tanto de texto como de imagen y vídeo, evitando tener que mantener modelos de recompensa separados por modalidad.

La relevancia actual del modelo radica en la creciente necesidad de evaluadores automáticos fiables para el entrenamiento con feedback (RLHF/RLAIF) y para la selección de mejores respuestas en sistemas de generación multimodal. La versión GGUF aquí descrita permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, aunque su tamano (32B) sigue exigiendo cuantizaciones agresivas para caber en GPUs de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen (modelo base: CodeGoat24/UnifiedReward-qwen-32b); incluye proyector multimodal (mmproj) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 32B parámetros derivado de la familia Qwen, adaptado como modelo de recompensa. Incorpora un componente multimodal (mmproj) que permite procesar entradas de imagen y vídeo junto con texto, lo que lo habilita para puntuar respuestas en tareas de comprensión visual y generación multimodal. La model card del repositorio cuantizado no detalla la arquitectura interna exacta (número de capas, dimensiones ocultas, mecanismo de atención), por lo que esos datos se consideran no disponibles en la información proporcionada.

El entrenamiento se realizó sobre una mezcla de datasets de preferencias y feedback: HPD, LiFT-HRA, OIP, EvalMuse, ShareGPTVideo-DPO, VideoFeedback, LLaVA-Critic-113k y VideoDPO. Estos conjuntos cubren evaluación de imágenes generadas, preferencias sobre vídeo, feedback humano y datos de crítica visual. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta por porcentaje ni si se aplicaron etapas de RLHF, DPO o un esquema de optimización concreto más allá de lo que sugieren los nombres de los datasets (varios incluyen "DPO" en su denominación).

## Capacidades

- Evaluación y puntuación de respuestas generadas por otros modelos (reward modeling) en tareas de texto, imagen y vídeo.
- Procesamiento multimodal: admite entradas de imagen y vídeo mediante el proyector mmproj incluido en el repositorio.
- Comprensión y crítica visual: entrenado con LLaVA-Critic-113k y EvalMuse, lo que le permite emitir juicios sobre calidad de imágenes generadas.
- Evaluación de preferencias sobre vídeo: los datasets ShareGPTVideo-DPO, VideoFeedback y VideoDPO indican capacidad para puntuar contenido de vídeo.
- Soporte de conversación multi-turno (tag "conversational" en el repositorio).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades multilingües: limitadas al inglés según el campo de idiomas del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes o modo de razonamiento explícito (thinking mode).

## Casos de uso

- Entrenamiento con feedback humano (RLHF/RLAIF): el modelo actúa como evaluador automático que puntúa las respuestas de un modelo generador, proporcionando la señal de recompensa necesaria para optimizar políticas en pipelines de alineación. Es adecuado por su naturaleza de reward model y su cobertura multimodal.
- Selección de mejores respuestas (best-of-N): en sistemas de generación, se generan varias candidatas y UnifiedReward elige la de mayor puntuación. Útil en producción para mejorar la calidad sin reentrenar el modelo generador.
- Evaluación automática de modelos de generación de imágenes: gracias a su entrenamiento con EvalMuse y LLaVA-Critic, puede puntuar la calidad y alineación de imágenes generadas respecto a un prompt, sustituyendo o complementando evaluaciones humanas costosas.
- Evaluación de vídeo generado: con los datasets de vídeo (ShareGPTVideo-DPO, VideoFeedback, VideoDPO), puede emplearse para clasificar o puntuar clips generados en tareas de síntesis de vídeo.
- Filtrado de datos de entrenamiento: puntuar grandes volúmenes de pares prompt-respuesta para descartar muestras de baja calidad antes de incluirlas en un dataset de entrenamiento, reduciendo ruido y coste de anotación.
- Investigación en preferencias multimodales: servir como baseline reproducible (licencia MIT) para estudiar cómo distintos modelos de recompensa correlacionan con juicios humanos en texto, imagen y vídeo.
- Despliegue en entornos con hardware limitado: la versión GGUF permite ejecutar el evaluador en estaciones de trabajo con GPU de consumo usando cuantizaciones Q4 o Q5, facilitando prototipos de RLHF sin clúster dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q3_K_M ~16,0 GB; Q3_K_L ~17,3 GB; IQ4_XS ~18,0 GB; Q4_K_S ~18,9 GB; Q4_K_M ~20,0 GB; Q5_K_S ~22,7 GB; Q5_K_M ~23,4 GB; Q6_K ~27,0 GB; Q8_0 ~34,9 GB. Añadir ~0,8 GB (mmproj Q8_0) o ~1,5 GB (mmproj f16) para entrada multimodal.
- GPU recomendadas: para cuantizaciones Q4/Q5 en una sola GPU, se requiere al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4 con limitaciones). Para Q8_0 o f16 se recomienda A100 40/80 GB, H100 o múltiples GPUs.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con Q2_K o Q3_K_S y con margen muy ajustado para contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero esta versión GGUF está pensada para llama.cpp y derivados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| UnifiedReward-qwen-32b (este, GGUF) | 32,76 B | no disponible | Sí (imagen y vídeo) | MIT | GGUF / safetensors |
| UnifiedReward-qwen-32b (base, CodeGoat24) | 32,76 B | no disponible | Sí | MIT | safetensors |
| Modelos de recompensa Qwen de menor tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros reward models (por ejemplo, variantes de ArmoRM, RewardBench o LLaVA-Critic standalone), por lo que la comparación cuantitativa se considera no disponible.

## Limitaciones y advertencias

- Idiomas: el repositorio declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Naturaleza de reward model: no está diseñado como modelo generativo de propósito general; su salida es una puntuación o juicio, no una respuesta conversacional completa, aunque el tag "conversational" sugiera uso en formato de diálogo.
- Riesgo de sesgo: al entrenarse con datasets de preferencias humanas (HPD, EvalMuse, etc.), puede heredar sesgos de los anotadores y de las distribuciones de esos conjuntos.
- Riesgo de alucinación en los juicios: como cualquier evaluador automático, puede puntuar de forma inconsistente ante entradas fuera de distribución o adversariales.
- Contexto: la longitud máxima de contexto no está documentada en la información disponible, lo que impide garantizar el procesamiento de entradas largas (vídeos extensos o conversaciones multi-turno prolongadas).
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las licencias de los datasets de entrenamiento originales, ya que podrían imponer restricciones adicionales sobre los pesos derivados.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de los juicios; para evaluación fiable se recomienda Q5_K_M o superior, lo que eleva los requisitos de VRAM.
- El repositorio tiene un tamano de 226,1 GB por incluir todas las cuantizaciones; la descarga selectiva de un solo archivo es imprescindible en entornos con ancho de banda limitado.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/UnifiedReward-qwen-32b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/UnifiedReward-qwen-32b
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/UnifiedReward-qwen-32b-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#UnifiedReward-qwen-32b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset HPD: https://huggingface.co/datasets/CodeGoat24/HPD
- Dataset LiFT-HRA: https://huggingface.co/datasets/CodeGoat24/LiFT-HRA
- Dataset OIP: https://huggingface.co/datasets/CodeGoat24/OIP
- Dataset EvalMuse: https://huggingface.co/datasets/CodeGoat24/EvalMuse
- Dataset ShareGPTVideo-DPO: https://huggingface.co/datasets/CodeGoat24/ShareGPTVideo-DPO
- Dataset VideoFeedback: https://huggingface.co/datasets/CodeGoat24/VideoFeedback
- Dataset LLaVA-Critic-113k: https://huggingface.co/datasets/CodeGoat24/LLaVA-Critic-113k
- Dataset VideoDPO: https://huggingface.co/datasets/CodeGoat24/VideoDPO
