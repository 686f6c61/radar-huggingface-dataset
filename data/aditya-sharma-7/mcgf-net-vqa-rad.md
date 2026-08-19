# Aditya-sharma-7/mcgf-net-vqa-rad

## Resumen

MCGF-Net (MedCross-Gated Fusion Network) es un modelo de respuesta a preguntas visuales (VQA) en el dominio médico, desarrollado por Aditya-sharma-7 y publicado en Hugging Face. El modelo está ajustado (fine-tuned) sobre el conjunto de datos VQA-RAD, un benchmark de referencia para VQA radiológica. Su nombre sugiere una arquitectura de fusión con compuertas cruzadas entre modalidades (imagen y texto), aunque la información pública no detalla la arquitectura exacta.

Con 274,7 millones de parámetros, es un modelo de tamaño moderado, adecuado para tareas de razonamiento visual-médico en entornos con recursos limitados. El repositorio incluye los pesos completos en formato safetensors y un adaptador LoRA para el componente de texto, lo que facilita su integración en pipelines de VQA. Su relevancia radica en abordar un problema específico: responder preguntas sobre imágenes radiológicas, un área con alta demanda en diagnóstico asistido.

A pesar de que el modelo no ha recibido descargas ni valoraciones, sus métricas de validación muestran un rendimiento aceptable en preguntas cerradas (accuracy del 62,2%), aunque bajo en preguntas abiertas (exact match del 6,3%), lo que indica limitaciones en la generación de respuestas libres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MedCross-Gated Fusion Network (no se especifican detalles) |
| Parametros totales | 274.692.866 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponibles (presumiblemente inglés, dado el dataset VQA-RAD) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), adaptador LoRA en PEFT (text_adapter/) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo. Por el nombre "MedCross-Gated Fusion Network" se infiere que se trata de una red neuronal con mecanismos de fusión con compuertas (gated fusion) entre representaciones visuales y textuales, diseñada específicamente para el dominio médico. No se especifican los componentes de visión ni de lenguaje subyacentes (por ejemplo, si usa un ViT, un BERT, etc.).

El entrenamiento se realizó mediante fine-tuning sobre el conjunto de datos VQA-RAD, que contiene pares de imágenes radiológicas y preguntas con respuestas cerradas y abiertas. Las métricas de validación reportadas corresponden a la época 4 del entrenamiento, con un total de 335 muestras de validación (193 cerradas y 142 abiertas). No se indica el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Se incluye un adaptador LoRA para el componente de texto, lo que sugiere que el modelo fue entrenado con una técnica de ajuste eficiente de parámetros (PEFT), aunque no se detalla el rango del adaptador ni las capas objetivo.

## Capacidades

- Respuesta a preguntas visuales (VQA) en el dominio de la radiología: el modelo procesa imágenes médicas y preguntas en lenguaje natural para generar respuestas.
- Distinción entre preguntas cerradas (conjunto fijo de respuestas) y abiertas (respuestas libres), con métricas separadas para cada tipo.
- Fusión multimodal con mecanismos de compuerta, presumiblemente diseñados para alinear información visual y textual en contexto médico.
- Soporte de adaptador LoRA para el componente de texto, lo que permite actualizaciones eficientes del modelo sin modificar todos los pesos.
- No se dispone de información sobre soporte de tool calling, capacidades de agente, razonamiento multi-paso, ni otras capacidades adicionales.

## Casos de uso

- Asistencia al diagnóstico radiológico: el modelo puede responder preguntas cerradas sobre hallazgos en radiografías, como "¿Hay neumotórax?" o "¿Qué región anatómica se muestra?", ayudando a radiólogos en la revisión preliminar de imágenes.
- Educación médica: estudiantes de medicina pueden utilizarlo para practicar la interpretación de imágenes radiológicas mediante preguntas y respuestas automáticas.
- Triaje de informes: en entornos clínicos, el modelo podría pre-clasificar imágenes según la presencia de anomalías detectadas a través de preguntas cerradas, aunque su baja exactitud en preguntas abiertas limita su uso en generación de informes completos.
- Investigación en VQA médica: sirve como punto de partida para experimentos sobre fusión multimodal en dominios especializados, gracias a su tamaño moderado y la disponibilidad de pesos en safetensors.
- Integración en pipelines de PACS (Picture Archiving and Communication Systems): el adaptador LoRA permite actualizaciones del modelo con bajo coste computacional, facilitando su despliegue en sistemas hospitalarios.
- Benchmarking de modelos VQA médicos: las métricas de validación publicadas permiten comparar el rendimiento con otros modelos del estado del arte en VQA-RAD, aunque no se ofrecen comparativas directas.

## Benchmarks y rendimiento

Se reportan las siguientes métricas de validación del propio modelo sobre el conjunto VQA-RAD (época 4, 335 muestras):

| Metrica | Valor |
|---|---|
| Closed accuracy | 0,6218 |
| Closed F1 macro | 0,4528 |
| Open exact match | 0,0634 |
| BLEU-4 | 0,0253 |
| ROUGE-L | 0,1439 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La baja puntuación en exact match para preguntas abiertas indica que el modelo tiene dificultades para generar respuestas textuales precisas, mientras que su rendimiento en preguntas cerradas es moderado.

## Requisitos de hardware

- El tamaño del repositorio es de 1,1 GB, lo que sugiere que los pesos en safetensors ocupan aproximadamente esa cantidad (probablemente en FP32 o FP16).
- Con 274,7 millones de parámetros, el modelo puede ejecutarse en GPUs de consumo como una RTX 3060 (12 GB) o RTX 4070 (12 GB) en FP16, con un uso estimado de VRAM entre 2 y 4 GB para inferencia (estimación razonable, no confirmada por el autor).
- No se especifican requisitos mínimos de hardware ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.). Dado el formato safetensors y el adaptador LoRA, es probable que pueda cargarse con librerías estándar de Hugging Face (transformers, peft).
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VQA médica con arquitectura de fusión). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Rendimiento bajo en preguntas abiertas: la exact match del 6,3% y el BLEU-4 de 0,025 indican que el modelo no es adecuado para generar respuestas libres coherentes o precisas.
- Sesgos potenciales: al estar entrenado en VQA-RAD, un dataset de radiología, el modelo puede no generalizar a otros dominios médicos o a imágenes no radiológicas.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en preguntas abiertas.
- Licencia no especificada: no se indica la licencia de uso, lo que impide conocer restricciones para uso comercial o modificaciones.
- Idiomas no documentados: aunque el dataset VQA-RAD es en inglés, no se confirma oficialmente el soporte de otros idiomas.
- Sin información sobre cuantización: no se ofrecen versiones cuantizadas (GGUF, AWQ, etc.), lo que limita su despliegue en entornos con poca memoria.
- Fecha de creación futura (2026-08-14) y ausencia de descargas o valoraciones sugieren que el modelo es reciente y no ha sido validado por la comunidad.

## Enlaces

- [Hugging Face: Aditya-sharma-7/mcgf-net-vqa-rad](https://huggingface.co/Aditya-sharma-7/mcgf-net-vqa-rad)
