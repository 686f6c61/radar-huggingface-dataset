# Horizon-Labs/multilingual-emotions-small

## Resumen

Multilingual Emotions (small) es un clasificador de emociones multietiqueta desarrollado por Horizon-Labs, construido sobre el encoder multilingüe mmBERT-small de JHU CLSP. Resuelve un problema concreto: la práctica totalidad de los modelos de emociones basados en GoEmotions (como SamLowe/roberta-base-go_emotions) solo funcionan en inglés, mientras que este modelo replica exactamente las 28 etiquetas del dataset GoEmotions de Google en 36 idiomas, con la misma salida sigmoide multietiqueta y por tanto intercambiable con los pipelines existentes.

Con 140,6 millones de parámetros y un repositorio de 1,4 GB, es un modelo deliberadamente ligero: incluye pesos en safetensors, ONNX para CPU y ONNX cuantizado en int8 (268 MB) para ejecución en navegador mediante transformers.js. La licencia Apache-2.0 y la disponibilidad de umbrales por etiqueta ajustados sobre el conjunto de validación de GoEmotions lo hacen directamente desplegable en producción.

Su relevancia actual radica en la cobertura multilingüe real (no traducciones) validada sobre BRIGHTER, un benchmark con textos anotados por humanos en 28 idiomas, donde supera ampliamente a los modelos ingleses aplicados fuera de su dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-small) |
| Parametros totales | 140.652.316 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX cuantizado, 268 MB); fp32 en safetensors y ONNX |
| Idiomas soportados | 36: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, ro, sv, da, no, fi, hu, el, tr, ar, he, fa, hi, mr, bn, ur, zh, ja, ko, vi, th, id, sw, af, tt, ha |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un fine-tuning de jhu-clsp/mmBERT-small, la variante multilingüe y de menor tamaño de mmBERT. La cabeza de clasificación produce 28 logits independientes con activación sigmoide, lo que permite clasificación multietiqueta: un texto puede activar varias emociones simultáneamente o únicamente la etiqueta `neutral`.

El entrenamiento parte del dataset GoEmotions (google-research-datasets/go_emotions) y de Horizon-Labs/go-emotions-multilingual, un conjunto multilingüe derivado. Según la model card, los textos de entrenamiento que aparecían en los conjuntos de evaluación fueron eliminados para evitar contaminación. El modelo incluye dos artefactos auxiliares: `thresholds.json`, con un umbral por etiqueta ajustado sobre el conjunto de validación de GoEmotions (relevante para etiquetas raras como grief, pride, relief o nervousness), y `ekman_mapping.json`, que agrupa las 28 etiquetas en las 6 emociones de Ekman (anger, disgust, fear, joy, sadness, surprise) tomando el máximo por grupo.

## Capacidades

- Clasificación de emociones multietiqueta con las 28 etiquetas de GoEmotions (admiration, amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment, disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism, pride, realization, relief, remorse, sadness, surprise, neutral).
- Salida sigmoide independiente por etiqueta, con umbrales por etiqueta preajustados.
- Agrupación a las 6 emociones de Ekman mediante mapeo incluido en el repositorio.
- Cobertura multilingüe en 36 idiomas, incluyendo lenguajes de bajos recursos como sw, af, tt y ha.
- Inferencia en CPU y en navegador mediante ONNX y transformers.js (dtype q8).
- Compatible con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Moderación de comunidades multilingües: detectar enfado, disgusto o acoso en comentarios de foros y redes en cualquiera de los 36 idiomas soportados, usando los umbrales por etiqueta para reducir falsos positivos en emociones raras.
- Enrutamiento de tickets de soporte: clasificar el tono emocional de un correo o mensaje de chat (frustración, gratitud, confusión) para priorizar casos con carga emocional negativa antes de que lleguen a un agente humano.
- Analítica de opinión a escala: procesar reseñas o encuestas en varios idiomas y agregar la distribución de emociones por producto o región, aprovechando la inferencia en CPU con ONNX int8 para abaratar el coste.
- Monitorización de salud mental en foros de apoyo: señalar textos con tristeza, remordimiento o nerviosismo para revisión humana, sin sustituir la evaluación clínica.
- Investigación en psicolingüística comparada: analizar diferencias en la expresión emocional entre idiomas sobre textos nativos, no traducidos, apoyándose en la validación del modelo sobre BRIGHTER.
- Filtrado previo en pipelines de datos: etiquetar grandes corpus para seleccionar subconjuntos con carga emocional concreta antes de entrenar otros modelos, con la ventaja de que el ONNX cuantizado mantiene un 98,7 % de concordancia con fp32 en las pruebas del autor.
- Aplicaciones web en el cliente: clasificar emociones directamente en el navegador con transformers.js sin enviar texto a un servidor, útil por privacidad en chats o formularios.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. GoEmotions test: 5.427 comentarios de Reddit en inglés, macro-F1 sobre 28 etiquetas. BRIGHTER: textos anotados por humanos en 28 idiomas, hasta 1.500 textos de test por idioma, macro-F1 medio entre idiomas.

| Modelo | Licencia | GoEmotions @0.5 | GoEmotions umbrales ajustados | BRIGHTER 6 emociones | BRIGHTER 4 emociones | Etiquetas |
|---|---|---|---|---|---|---|
| **Este modelo** (141M) | Apache-2.0 | 0.447 | **0.494** | 0.406 | 0.432 | 28 GoEmotions, multilingüe |
| multilingual-emotions-base (308M) | Apache-2.0 | 0.473 | 0.516 | 0.420 | 0.449 | 28 GoEmotions, multilingüe |
| SamLowe/roberta-base-go_emotions (125M) | MIT | 0.450 | 0.519 | 0.282 | 0.291 | 28 GoEmotions, inglés |
| AnasAlokla/multilingual_go_emotions | MIT | 0.455 | 0.538 | 0.337 | 0.355 | 28 GoEmotions, multilingüe |
| j-hartmann/emotion-english-distilroberta-base (82M) | no indicada | — | — | 0.297 | 0.315 | 7 etiquetas, inglés |
| MilaNLProc/xlm-emo-t (278M) | no indicada | — | — | — | 0.456 | 4 etiquetas, multilingüe |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 para el modelo completo (141M parámetros); en torno a 300 MB con ONNX int8.
- GPU recomendadas: cualquier GPU consumer sirve; RTX 3060, RTX 4090, A100 o H100 no son necesarias para este tamaño, pero permiten procesar lotes grandes con alto throughput.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 3050 en adelante) y funciona en CPU sin GPU.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, transformers.js en navegador, text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: no disponibles de forma oficial; el autor solo reporta la concordancia del 98,7 % entre int8 y fp32 en 448 textos de prueba, no cifras de latencia.

## Comparativa con modelos similares

| Criterio | Este modelo | multilingual-emotions-base | SamLowe/roberta-base-go_emotions | AnasAlokla/multilingual_go_emotions |
|---|---|---|---|---|
| Parámetros | 141M | 308M | 125M | no disponible |
| Contexto | no disponible | no disponible | no disponible | no disponible |
| Idiomas | 36 | multilingüe | inglés | multilingüe |
| GoEmotions (umbrales ajustados) | 0.494 | 0.516 | 0.519 | 0.538 |
| BRIGHTER 6 emociones | 0.406 | 0.420 | 0.282 | 0.337 |
| Licencia | Apache-2.0 | Apache-2.0 | MIT | MIT |
| ONNX / navegador | sí (fp32 e int8) | no indicado | no indicado | no indicado |

El modelo sacrifica entre 2 y 4 puntos de macro-F1 en GoEmotions en inglés frente a alternativas más grandes o entrenadas solo en inglés, a cambio de un rendimiento multilingüe claramente superior en BRIGHTER y de un despliegue en navegador con ONNX int8.

## Limitaciones y advertencias

- El rendimiento en inglés es inferior al de modelos especializados solo en inglés (0.494 frente a 0.519-0.538 con umbrales ajustados); si el caso de uso es exclusivamente inglés, conviene evaluar alternativas.
- Las etiquetas raras (grief, pride, relief, nervousness) tienen pocos ejemplos; el autor recomienda usar `thresholds.json` en lugar de 0.5, y aun así su fiabilidad es menor.
- El modelo se entrenó sobre GoEmotions, derivado de comentarios de Reddit: puede heredar sesgos de ese dominio (registro informal, sesgo demográfico y cultural de la plataforma) y degradarse en textos formales, literarios o técnicos.
- Riesgo de falsos positivos y negativos en textos irónicos o sarcásticos, donde la emoción literal y la intencionada divergen.
- No es un modelo generativo: no explica sus predicciones ni produce texto; cualquier justificación debe construirse fuera del modelo.
- La longitud de contexto no está documentada en la información disponible; no debe asumirse una ventana larga para documentos extensos.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la procedencia de los datos (Reddit) y las obligaciones de atribución de las licencias de los datasets subyacentes deben revisarse antes de un despliegue en producción.
- No debe usarse como herramienta de diagnóstico clínico ni para decisiones automatizadas de alto impacto sobre personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-emotions-small
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Versión base (308M): https://huggingface.co/Horizon-Labs/multilingual-emotions-base
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/multilingual-emotions
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Dataset multilingüe del autor: https://huggingface.co/datasets/Horizon-Labs/go-emotions-multilingual
- Benchmark BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Alternativa inglesa de referencia: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Alternativa multilingüe: https://huggingface.co/AnasAlokla/multilingual_go_emotions
- Alternativa inglesa de 7 etiquetas: https://huggingface.co/j-hartmann/emotion-english-distilroberta-base
- Alternativa multilingüe de 4 etiquetas: https://huggingface.co/MilaNLProc/xlm-emo-t
