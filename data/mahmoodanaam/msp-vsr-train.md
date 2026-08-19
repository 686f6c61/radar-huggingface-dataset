# MahmoodAnaam/MSP-VSR-TRAIN

## Resumen

MSP-VSR-TRAIN es un modelo de reconocimiento de habla visual (Visual Speech Recognition, VSR) desarrollado por Mahmood Anaam, diseñado para transcribir el habla a partir de secuencias de vídeo de los movimientos labiales, sin necesidad de señal de audio. Se basa en el encoder AV-HuBERT Large, preentrenado con ruido y fine-tuneado en 433 horas de datos audiovisuales, y se ha ajustado específicamente para la tarea VSR utilizando los conjuntos de datos AVYT y AVCocktail. El modelo tiene 325 millones de parámetros y se distribuye bajo licencia Apache 2.0, aunque su acceso en HuggingFace está restringido y requiere aceptar condiciones adicionales.

La relevancia de este modelo radica en su aplicación para el reconocimiento de habla silenciosa, una tarea compleja que combina visión por computador y procesamiento del lenguaje natural. Al estar basado en AV-HuBERT, aprovecha representaciones audiovisuales robustas, lo que lo hace adecuado para entornos con ruido acústico o para personas con dificultades de habla. El repositorio ocupa 190 GB, lo que sugiere que incluye múltiples checkpoints o datos de entrenamiento, aunque el modelo final en safetensors pesa alrededor de 1,3 GB en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder AV-HuBERT Large (transformer) |
| Parametros totales | 325.178.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Acceso | restringido (gated) en HuggingFace |
| Modelo base | MahmoodAnaam/avhubert_encoder_large_noise_pt_noise_ft_433h |

## Arquitectura y entrenamiento

El modelo se construye sobre el encoder AV-HuBERT Large, una arquitectura transformer que aprende representaciones audiovisuales auto-supervisadas a partir de pares de vídeo y audio. El encoder fue preentrenado con ruido y posteriormente fine-tuneado en 433 horas de datos audiovisuales (según el nombre del modelo base). Para la tarea VSR, se ha ajustado adicionalmente con los datasets AVYT y AVCocktail, que contienen vídeos de habla con etiquetas de transcripción. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo se ha entrenado con la librería Transformers y TensorBoard, y el código personalizado se indica en los tags.

## Capacidades

- Reconocimiento de habla visual: transcribe texto a partir de secuencias de vídeo de los labios, sin entrada de audio.
- Robustez ante ruido acústico: al derivar de un encoder preentrenado con ruido, puede funcionar en entornos donde la señal de audio es deficiente o inexistente.
- Soporte de inglés: el modelo está entrenado y evaluado únicamente en inglés.
- Integración con Transformers: se puede cargar mediante la API de HuggingFace Transformers para pipelines de automatic-speech-recognition, aunque requiere adaptación para entrada de vídeo.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión general (solo procesa vídeo de labios) ni modos de pensamiento.

## Casos de uso

- Transcripción de vídeos sin audio: el modelo puede generar subtítulos para vídeos mudos o con audio de baja calidad, analizando únicamente los movimientos labiales de los hablantes.
- Asistencia para personas con discapacidad auditiva: permite convertir el habla silenciosa o susurrada en texto legible, facilitando la comunicación en entornos silenciosos o para personas con problemas de voz.
- Análisis forense de vídeo: en grabaciones de vigilancia sin audio, el modelo puede extraer el contenido hablado a partir de las imágenes, útil para investigaciones.
- Interacción persona-máquina en entornos ruidosos: en fábricas o exteriores con alto ruido ambiental, el reconocimiento de habla visual complementa o sustituye al reconocimiento de voz tradicional.
- Entrenamiento de sistemas de lectura de labios: el modelo puede servir como base para desarrollar aplicaciones de ayuda a la lectura de labios en contextos educativos o clínicos.
- Investigación en aprendizaje multimodal: al estar basado en AV-HuBERT, es útil para estudiar la fusión de información visual y auditiva en tareas de reconocimiento de habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara una entrada "MSP-VSR" con una lista de resultados vacía, por lo que no hay métricas oficiales (WER, CER, etc.) que reportar.

## Requisitos de hardware

- El modelo tiene 325 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 1,3 GB de memoria. Con cuantización a 8 bits podría reducirse a unos 650 MB, aunque no se han publicado versiones cuantizadas.
- El repositorio completo ocupa 190 GB, lo que sugiere que incluye checkpoints de entrenamiento o datos adicionales; para inferencia solo se necesita el archivo safetensors del modelo final.
- Una GPU con al menos 4 GB de VRAM sería suficiente para inferencia en fp32 (por ejemplo, una RTX 3050 o superior). Para mayor velocidad se recomienda una RTX 3090 o A100.
- El modelo se puede desplegar con la librería Transformers de HuggingFace, aunque al ser un encoder VSR requiere un decodificador de texto adicional (no incluido en el repo) y un pipeline de preprocesado de vídeo.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MSP-VSR-TRAIN (este) | 325M | no disponible | VSR (lectura de labios) | Apache 2.0 | Gated en HF |
| AV-HuBERT Large (base) | ~325M | no disponible | Representaciones audiovisuales | MIT (original) | Abierto |
| MSP-AVSR (del mismo autor) | no disponible | no disponible | AVSR (audio-visual) | Apache 2.0 | Gated en HF |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es adecuado para otros idiomas sin fine-tuning adicional.
- No se han publicado métricas de error (WER/CER), por lo que su precisión real es desconocida y no se puede garantizar su fiabilidad en producción.
- El acceso está restringido en HuggingFace; es necesario aceptar condiciones adicionales, lo que puede limitar su uso comercial o académico.
- El repositorio es extremadamente grande (190 GB), lo que dificulta su descarga y almacenamiento local.
- Al ser un modelo de lectura de labios, su rendimiento depende en gran medida de la calidad del vídeo, la iluminación, el ángulo de la cámara y la visibilidad de los labios del hablante.
- No se ha documentado el proceso de entrenamiento (datos exactos, número de pasos, hiperparámetros), lo que dificulta la reproducibilidad.
- El modelo es un encoder; para generar texto se necesita un decodificador adicional, que no se incluye en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MahmoodAnaam/MSP-VSR-TRAIN
- Modelo relacionado MSP-AVSR: https://huggingface.co/MahmoodAnaam/MSP-AVSR
- Perfil de GitHub del autor: https://github.com/Mahmood-Anaam
- Publicación en LinkedIn sobre el modelo: https://www.linkedin.com/posts/hussnain-ahmad_built-a-silent-lip-reading-ai-model-over-activity-7469976644791967745-iL_k
