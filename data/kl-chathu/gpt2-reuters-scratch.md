# kl-chathu/gpt2-reuters-scratch

## Resumen

GPT-2 Reuters Scratch es un modelo de lenguaje causal de arquitectura tipo GPT-2 entrenado desde inicialización aleatoria (sin pesos preentrenados) por el usuario kl-chathu. Se trata de un experimento de escala muy reducida: 16.537.088 parámetros totales, 4 capas, 4 cabezas de atención y una dimensión de embedding de 256, con una longitud de contexto de solo 256 tokens. El modelo se ha entrenado durante 5 épocas sobre el dataset `ingeniumacademy/reuters_articles`, con una tasa de aprendizaje de 0.0005, y utiliza un tokenizador específico del mismo dominio (`ingeniumacademy/gpt2-reuters-tokenizer`).

Su relevancia es fundamentalmente educativa y de investigación: sirve como ejemplo reproducible de entrenamiento from scratch sobre un corpus especializado (artículos de Reuters), y permite estudiar el comportamiento de un transformer causal pequeño en tareas de modelado de lenguaje restringidas al dominio periodístico en inglés. No está pensado para uso en producción ni para competición con modelos preentrenados de gran escala.

La pérdida de test reportada por el autor es de 4.4572, un valor alto que refleja tanto la escasez de datos/épocas como el tamaño reducido del modelo. La licencia MIT facilita su reutilización y modificación con fines académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (decoder-only) |
| Parametros totales | 16.537.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (n_positions=256) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones publicadas no disponibles) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar con 4 capas de transformer, 4 cabezas de atención y una dimensión de embedding de 256. La longitud máxima de posición es de 256 tokens. Se entrenó desde inicialización aleatoria, sin inicialización con pesos preentrenados, durante 5 épocas con una tasa de aprendizaje de 0.0005. El corpus de entrenamiento es el dataset `ingeniumacademy/reuters_articles`, compuesto por artículos de Reuters en inglés, y el tokenizador asociado es `ingeniumacademy/gpt2-reuters-tokenizer`.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La pérdida de test reportada es 4.4572, lo que indica un ajuste limitado al corpus.

## Capacidades

- Generación de texto causal en inglés, limitada a continuaciones de hasta 256 tokens.
- Modelado de lenguaje especializado en el dominio de noticias de Reuters (estilo periodístico).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe no disponible: solo inglés.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.
- No se documenta ajuste por instrucciones (instruction tuning); es un modelo base de modelado de lenguaje.

## Casos de uso

- Experimentación académica sobre entrenamiento from scratch: sirve para reproducir y estudiar el pipeline completo de entrenamiento de un GPT-2 pequeño sobre un corpus concreto, incluyendo tokenizador y dataset.
- Generación de titulares o continuaciones de noticias en inglés: el modelo puede producir texto con estilo periodístico limitado al dominio Reuters, aunque con coherencia y calidad limitadas por su tamaño y pérdida de test.
- Pruebas de infraestructura de inferencia: al ser un modelo de 16,5 M de parámetros y 0,1 GB, es útil para validar pipelines de despliegue (llama.cpp, Transformers) en entornos con recursos mínimos.
- Investigación sobre tokenizadores de dominio: permite evaluar el impacto del tokenizador `gpt2-reuters-tokenizer` en la calidad de la generación frente a tokenizadores generalistas.
- Educación en arquitecturas transformer: adecuado para talleres y cursos donde se explica la arquitectura GPT-2 con un ejemplo real y de tamaño manejable.
- Análisis de sesgos y limitaciones en modelos pequeños: útil como caso de estudio de cómo un corpus reducido y un modelo pequeño afectan a la calidad y diversidad del texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida de test: 4.4572.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (16,5 M de parámetros, ~66 MB en fp32; ~33 MB en fp16; ~17 MB en int8). El repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) e incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en la mayoría de entornos integrados; también es viable en CPU.
- Opciones de despliegue: Transformers (PyTorch), llama.cpp (previa conversión a GGUF), y cualquier framework compatible con safetensors.
- Latencia y throughput estimados: no disponibles; por el tamaño, la latencia será muy baja en GPU y aceptable en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GPT-2 Reuters Scratch (este modelo) | 16,5 M | 256 | MIT | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 | Hugging Face |
| GPT-2 medium | 355 M | 1024 | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos para este modelo. Frente a GPT-2 small, este modelo tiene aproximadamente 7,5 veces menos parámetros y un contexto 4 veces menor, por lo que su capacidad de generación es sustancialmente inferior; su interés es experimental y de dominio específico.

## Limitaciones y advertencias

- Calidad de generación limitada: con 16,5 M de parámetros y una pérdida de test de 4.4572, el texto generado será con frecuencia incoherente o repetitivo.
- Contexto muy corto: 256 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo inglés; no soporta otros idiomas.
- Entrenado únicamente sobre artículos de Reuters, por lo que el dominio y el estilo están muy restringidos y puede presentar sesgos del corpus periodístico.
- Riesgo de alucinación y de generar afirmaciones falsas presentadas como noticias.
- No es un modelo ajustado por instrucciones; no debe usarse como asistente conversacional sin ajuste adicional.
- Aunque la licencia es MIT y permite uso comercial, la calidad y fiabilidad del modelo hacen desaconsejable su uso en producción sin validación exhaustiva.
- No se documentan evaluaciones de sesgo, seguridad ni robustez.

## Enlaces

- Hugging Face: https://huggingface.co/kl-chathu/gpt2-reuters-scratch
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Paper de referencia GPT-2 (no específico del modelo): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
