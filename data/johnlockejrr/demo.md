# johnlockejrr/demo

## Resumen

El modelo `johnlockejrr/demo` es un ajuste fino del modelo Marian `Helsinki-NLP/opus-mt-sem-sem` para traducción entre lenguas semíticas, concretamente el par hebreo-arameo. Ha sido entrenado sobre el dataset `johnlockejrr/hebrew-targum-vocalized`, un corpus de textos targúmicos vocalizados, lo que lo orienta a la traducción de textos religiosos y académicos. El desarrollador, John Locke, se presenta como investigador especializado en procesamiento de lenguas semíticas (hebreo, arameo, siríaco y samaritano).

Con 61,4 millones de parámetros, es un modelo compacto basado en la arquitectura Marian (transformer encoder-decoder), licenciado bajo Apache 2.0 y distribuido en formato safetensors. Su relevancia radica en la escasez de modelos específicos para lenguas semíticas históricas como el arameo targúmico, aunque su utilidad práctica queda muy limitada por un entrenamiento extremadamente breve (una sola iteración de entrenamiento, 0,02 épocas), que se refleja en unas métricas de evaluación muy bajas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 61.427.109 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típica de Marian: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (heb), arameo (arc) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Marian, un transformer encoder-decoder desarrollado por el equipo de Helsinki-NLP para traducción automática neuronal. Marian es conocido por su eficiencia en entrenamiento e inferencia, con una configuración típica de 6 capas de encoder y 6 de decoder y mecanismos de atención multi-cabeza. El modelo base `opus-mt-sem-sem` está preentrenado para traducción entre lenguas semíticas.

El ajuste fino se realizó sobre el dataset `johnlockejrr/hebrew-targum-vocalized` con los siguientes hiperparámetros: tasa de aprendizaje de 5e-05, optimizador AdamW con betas (0,9; 0,999), scheduler lineal con warmup de 0,06 pasos, factor de suavizado de etiquetas de 0,1 y tamaño de batch de entrenamiento de 16. El entrenamiento duró únicamente 0,02 épocas (1 paso), lo que explica las métricas de evaluación bajas. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación en la información disponible.

## Capacidades

- Traducción automática entre hebreo y arameo (tarea `text2text-generation`).
- Procesamiento de texto vocalizado, gracias al dataset de entrenamiento targúmico vocalizado.
- Compatibilidad con la librería Transformers y con endpoints de Hugging Face.
- Inferencia eficiente al tratarse de un modelo de tamaño reducido (61,4 M de parámetros).

No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües más allá del par hebreo-arameo.

## Casos de uso

- Investigación académica en estudios targúmicos: el modelo puede asistir a investigadores que trabajan con el Targum, facilitando traducciones preliminares de pasajes entre hebreo y arameo, aunque requiere revisión humana dada su baja calidad actual.
- Digitalización de textos históricos: integrado en pipelines de OCR/HTR para generar traducciones preliminares de textos targúmicos digitalizados, especialmente en proyectos de humanidades digitales.
- Estudio lingüístico comparativo: permite explorar diferencias léxicas y sintácticas entre el hebreo bíblico y el arameo targúmico en entornos de investigación.
- Prototipado de sistemas de traducción para lenguas semíticas: sirve como punto de partida para investigar la adaptación de modelos Marian a dominios específicos con recursos limitados.
- Docencia en lenguas semíticas: puede usarse en entornos educativos como herramienta de apoyo para estudiantes de arameo, siempre con supervisión del profesorado.
- Evaluación de técnicas de fine-tuning con recursos mínimos: el modelo constituye un caso de estudio sobre el efecto de un entrenamiento de una sola iteración en la calidad de la traducción, útil para investigación metodológica.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Loss (validación) | 30,3381 |
| BLEU | 0,2372 |
| ChrF | 8,5396 |

Estos valores son bajos, lo que refleja el entrenamiento mínimo (una sola iteración). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 245 MB en FP32 (61,4 M de parámetros × 4 bytes). Con cuantización a 8 bits, el peso se reduce a unos 61 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, RTX 2060, etc.). No requiere hardware de datacenter.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU consumer actual e incluso en CPU con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Hugging Face Inference Endpoints, Transformers con PyTorch, ONNX Runtime.
- Latencia: al ser un modelo pequeño, la latencia de inferencia es baja (del orden de milisegundos por secuencia corta en GPU moderna), aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU (eval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| johnlockejrr/demo | 61,4 M | no disponible | 0,2372 | Apache 2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-sem-sem (base) | ~61 M | 512 (típico Marian) | no disponible | Apache 2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-he-he | ~61 M | 512 (típico Marian) | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento extremadamente breve: el modelo solo se entrenó durante 1 paso (0,02 épocas), lo que produce una calidad de traducción muy baja (BLEU 0,2372, ChrF 8,5396).
- Alucinación: dada la baja calidad del entrenamiento, es probable que el modelo genere traducciones incorrectas o inventadas, especialmente en textos complejos.
- Dominio limitado: el dataset de entrenamiento se centra en textos targúmicos vocalizados, por lo que el modelo puede no generalizar bien a otros tipos de texto en hebreo o arameo.
- Model card incompleta: la documentación del modelo indica "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento.
- Sin soporte para tool calling ni agentes: no se ha implementado ni documentado ninguna capacidad más allá de la traducción básica.
- Riesgo de sesgos: al entrenarse sobre un corpus religioso específico, el modelo puede reflejar sesgos lingüísticos o temáticos del Targum.
- No apto para producción: las métricas de evaluación indican que el modelo no está listo para uso en entornos productivos sin un reentrenamiento sustancial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johnlockejrr/demo
- Dataset de entrenamiento: https://huggingface.co/datasets/johnlockejrr/hebrew-targum-vocalized
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sem-sem
- Perfil de Hugging Face del autor: https://huggingface.co/johnlockejrr
- GitHub del autor: https://github.com/johnlockejrr
- Perfil de Ollama del autor: https://registry.ollama.ai/johnlockejrr
