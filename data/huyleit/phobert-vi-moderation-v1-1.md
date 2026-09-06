# huyleit/phobert-vi-moderation-v1.1

## Resumen

El modelo `huyleit/phobert-vi-moderation-v1.1` es un clasificador de texto en vietnamita desarrollado por huyleit (Le Van Huy) sobre la arquitectura PhoBERT-base-v2, un modelo preentrenado monolingüe basado en RoBERTa. Está diseñado para la moderación de contenido contextual en redes sociales vietnamitas, con un enfoque adicional en la detección de crisis emocionales y riesgo de autolesión. El modelo resuelve el problema de clasificar publicaciones en cuatro categorías: contenido limpio (CLEAN), desahogo con groserías (PROFANITY_VENTING), discurso de odio (HATE_SPEECH) y crisis emocional (EMOTIONAL_CRISIS), permitiendo a las plataformas aplicar acciones automáticas como bloquear, ocultar o mostrar recursos de apoyo psicológico.

Con 135.001.348 parámetros, es un modelo compacto y eficiente para inferencia en entornos de producción. Su relevancia actual radica en la creciente necesidad de moderar contenido dañino en redes sociales y, al mismo tiempo, identificar señales de malestar mental para ofrecer ayuda temprana. El modelo fue fine-tuning con un dataset combinado de ViHSD y un conjunto de datos de autolesión en inglés, y reporta un F1 macro de 78.16% y una precisión de 81.36% en un conjunto de test independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (PhoBERT-base-v2) |
| Parámetros totales | 135.001.348 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | Safetensors |
| Pipeline | Text classification |
| Librería | Transformers |
| Tamaño del repo | 0.5 GB |
| Fecha de creación | 2026-09-06 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de PhoBERT-base-v2, que a su vez es un modelo preentrenado monolingüe para vietnamita basado en la arquitectura RoBERTa, desarrollado por VinAIResearch. Se entrenó para la tarea de clasificación de texto multi-etiqueta sobre un dataset combinado denominado "Merged ViHSD + Playwright English Self-Harm Dataset (v1.1)". El autor no especifica el número de tokens ni la composición exacta del dataset.

Los hiperparámetros de entrenamiento reportados son: learning rate 2e-5, batch size 32, 4 épocas con early stopping, optimizador AdamW con weight decay 0.01, warmup steps de 300 y entrenamiento en precisión mixta FP16. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar. Una innovación destacable es la taxonomía de cuatro etiquetas con acciones de sistema asociadas, así como el manejo de la categoría ILLEGAL_PORN mediante una capa de reglas regex en el API Gateway, con una latencia inferior a 1 ms, en lugar de incluirla en el modelo.

## Capacidades

- Clasificación de texto en vietnamita para moderación de contenido en redes sociales.
- Detección de discurso de odio (HATE_SPEECH) y contenido que incita a la violencia o discriminación.
- Detección de desahogo con groserías (PROFANITY_VENTING) que no constituye un ataque personal.
- Detección de crisis emocional y riesgo de autolesión (EMOTIONAL_CRISIS), con un F1 de 98.00% en el conjunto de test.
- Clasificación de contenido limpio y seguro (CLEAN).
- No soporta generación de texto, razonamiento multi-step, tool calling, agentes, visión ni audio.
- Capacidades multilingües limitadas al vietnamita, aunque el dataset de entrenamiento incluye datos en inglés.

## Casos de uso

- Moderación automática en redes sociales vietnamitas: el modelo clasifica cada publicación en una de las cuatro categorías y permite aplicar acciones automáticas, como permitir con advertencia, ocultar o bloquear, según la política de la plataforma.
- Detección temprana de riesgo de autolesión: gracias a su alto rendimiento en la etiqueta EMOTIONAL_CRISIS, puede activar popups de apoyo psicológico o alertar a moderadores humanos en tiempo real.
- Filtrado de discurso de odio en foros y comunidades: el modelo identifica contenido que ataca a individuos o colectivos, permitiendo su bloqueo automático antes de su publicación.
- Análisis de clima emocional en plataformas: se puede usar para monitorizar la prevalencia de estados de crisis emocional en una comunidad y detectar picos de malestar.
- Integración en pipelines de moderación híbrida: el modelo actúa como capa semántica después de un filtro regex para contenido ilegal, reduciendo falsos positivos y mejorando la precisión general.
- Herramientas de apoyo a moderadores humanos: clasifica automáticamente el contenido y prioriza la revisión manual de casos marcados como discurso de odio o crisis emocional.
- Sistemas de alerta en aplicaciones de chat o foros: detecta mensajes de crisis y conecta al usuario con líneas de ayuda o recursos de salud mental.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en un conjunto de test independiente de 2.441 muestras (división estratificada 70/15/15):

| Métrica | Valor |
|---|---|
| Test Accuracy | 81.36% |
| Test Macro F1-Score | 78.16% |

Desglose por clase:

| Clase | Precisión | Recall | F1-Score | Soporte |
|---|---|---|---|---|
| 0: CLEAN | 84.36% | 88.08% | 86.18% | 1200 |
| 1: PROFANITY_VENTING | 62.50% | 48.67% | 54.73% | 339 |
| 2: HATE_SPEECH | 72.18% | 75.33% | 73.72% | 527 |
| 3: EMOTIONAL_CRISIS | 98.13% | 97.87% | 98.00% | 375 |
| Macro avg | 79.29% | 77.49% | 78.16% | 2441 |
| Weighted avg | 80.81% | 81.36% | 80.94% | 2441 |

El autor también reporta una mejora frente al baseline del artículo original de ViHSD, que obtuvo un F1 de 66.30%. No se han publicado comparativas con otros modelos de moderación en vietnamita.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 270 MB; se recomienda al menos 1 GB de VRAM considerando activaciones y overhead. En FP32, los pesos ocupan aproximadamente 540 MB; se recomiendan 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como RTX 3050, GTX 1660, T4, A10 o superiores.
- Cabe en consumer GPU: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de gama baja.
- Opciones de despliegue: transformers, vLLM, TGI, ONNX Runtime o FastAPI para servir el modelo como endpoint.
- Latencia y throughput: no disponible en la información proporcionada. Dado el tamaño del modelo, se espera una latencia de milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría en la información proporcionada. El autor no publica comparativas con otros modelos de moderación de contenido en vietnamita. Como referencia de arquitectura, el modelo base PhoBERT-base-v2 de VinAIResearch no está fine-tuning para moderación.

## Limitaciones y advertencias

- Sesgos: el modelo puede heredar sesgos del dataset de entrenamiento, que combina datos vietnamitas de ViHSD y un conjunto de autolesión en inglés, lo que podría no representar toda la diversidad del habla vietnamita.
- Riesgo de clasificación errónea: en la clase PROFANITY_VENTING, el F1 es de 54.73%, lo que indica una tasa alta de falsos negativos y positivos en contenido con groserías.
- Limitaciones de idioma: el modelo está entrenado principalmente para vietnamita; su rendimiento en otros idiomas no está garantizado.
- Contenido ilegal no detectado: la categoría ILLEGAL_PORN se maneja mediante una capa de reglas regex externa, no por el modelo. Por tanto, el modelo no clasifica este tipo de contenido.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la exactitud del modelo en producción.
- Caveat de producción: el modelo fue entrenado con 4 épocas y early stopping; se recomienda validar su comportamiento en el dominio específico antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huyleit/phobert-vi-moderation-v1.1
- Repositorio de PhoBERT en GitHub: https://github.com/VinAIResearch/PhoBERT
- Perfil del autor en Hugging Face: https://huggingface.co/huyleit
