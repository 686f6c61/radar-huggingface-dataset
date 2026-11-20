# bammera-pothana/BERT-medium

## Resumen

BERT-medium (bammera-pothana/BERT-medium) es un codificador BERT preentrenado desde cero para telugu, desarrollado por el usuario bammera-pothana. Forma parte de la colección "Google's Recipes", que reproduce las miniacturas de BERT de Turc et al. (2019) para telugu siguiendo la receta original de Devlin et al. (2018) sin modificaciones más allá del vocabulario. Con 42,2 millones de parámetros, 8 capas, tamaño oculto 512 y 8 cabezas de atención, se posiciona como el miembro más grande de la colección compacta, por encima de BERT-tiny, BERT-mini y BERT-small.

El modelo resuelve la necesidad de un encoder ligero específico para telugu, un idioma con recursos limitados en el ecosistema de modelos preentrenados. Su propósito es servir como punto de partida para fine-tuning en tareas downstream donde BERT-Base resulta demasiado pesado, como modelo de lenguaje enmascarado para puntuación y ranking de texto telugu, o como punto de una curva de escalado junto a sus hermanos menores.

La relevancia actual radica en su receta de entrenamiento rigurosa y documentada: 1.000.000 de pasos con objetivos MLM y NSP, vocabulario WordPiece de 32.000 tokens aprendido específicamente para telugu con normalización NFC y sin eliminación de diacríticos, y pesos liberados en float32. El modelo se entrenó entre el 15 y el 20 de noviembre de 2026 en 4 × RTX 2080 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (`BertForPreTraining`, cabeza MLM + cabeza NSP) |
| Parametros totales | 42.426.626 (42.162.944 según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos liberados en float32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Telugu (`te`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (float32, ~170 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT estándar: 8 capas de transformer encoder, tamaño oculto 512, 8 cabezas de atención, feed-forward de 2048 y activación GELU. Se entrena con dos objetivos simultáneos: masked language modeling (MLM) sobre el 15 % de los tokens WordPiece (80 % sustituidos por `[MASK]`, 10 % por token aleatorio, 10 % sin cambios) y next-sentence prediction (NSP). El enmascaramiento es a nivel de token, dinámico y remuestreado en cada batch, siguiendo la receta original de Google.

El entrenamiento comprende 1.000.000 de pasos con batch global de 256 secuencias en un único schedule continuo: 900.000 pasos a 128 tokens (fase 1) y 100.000 pasos a 512 tokens (fase 2), con el estado del optimizador transferido entre fases. Se usa AdamW con learning rate 1e-4, β₁ 0.9, β₂ 0.999, ε 1e-6, weight decay 0.01 (excluido en bias y LayerNorm), warm-up lineal de 10.000 pasos y decaimiento lineal hasta cero. Dropout de 0.1, gradient clipping de 1.0 y precisión mixta float16 con escalado de pérdida, manteniendo los pesos en float32. El hardware fueron 4 × RTX 2080 Ti (11 GB), con 36,1 h para la fase 1 (0,14 s/paso) y 16,9 h para la fase 2 (0,60 s/paso). La fase 1 se pausó una vez en el paso 750.000 y se reanudó desde checkpoint completo sin saltar ni repetir pasos.

El tokenizador es un `BertTokenizerFast` con vocabulario WordPiece de 32.000 tokens, cased, aprendido específicamente para este modelo y no compartido con las otras tallas. La normalización es NFC, sin lower-casing ni eliminación de acentos (preserva las marcas vocálicas del telugu), y elimina el zero-width non-joiner (ZWNJ, U+200C) durante la normalización.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre texto en telugu: predice tokens `[MASK]` en contexto.
- Puntuación y ranking de texto telugu mediante la pérdida MLM o la perplejidad.
- Next-sentence prediction: clasificación de pares de oraciones como continuación real o aleatoria.
- Extracción de representaciones contextuales para fine-tuning en tareas downstream (clasificación, NER, QA extractiva, similitud semántica).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un encoder, no un modelo generativo).
- Capacidades multilingües: limitadas al telugu; no se documenta transferencia a otros idiomas.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- Fine-tuning para clasificación de texto telugu: el modelo sirve como encoder base para tareas como análisis de sentimiento o clasificación de noticias, con 512 tokens de contexto y 42 M de parámetros que permiten entrenamiento en GPU de consumo.
- Reconocimiento de entidades nombradas (NER) en telugu: se añade una cabeza de clasificación token a token sobre las representaciones del encoder; el vocabulario cased y la normalización NFC preservan las marcas vocálicas necesarias para la morfología del telugu.
- Puntuación y ranking de candidatos en sistemas de búsqueda o recuperación: la pérdida MLM o la perplejidad del modelo permiten ordenar fragmentos de texto telugu por fluidez y coherencia.
- Filtrado y control de calidad de corpus telugu: el modelo puede detectar texto mal formado o incoherente comparando la perplejidad de documentos frente a un umbral calibrado con el conjunto held-out.
- Detección de pares de oraciones relacionadas: la cabeza NSP (96,6 % de accuracy en held-out) permite tareas de inferencia textual ligera o verificación de continuidad de párrafos.
- Prototipado rápido en entornos con recursos limitados: al ocupar ~170 MB en float32, cabe en cualquier GPU de consumo y permite iterar sobre fine-tuning sin infraestructura dedicada.
- Análisis lingüístico del telugu: el modelo enmascarado puede emplearse para estudiar colocaciones y distribuciones léxicas en texto literario (Wikisource) y periodístico (noticias).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| Held-out Telugu text (512-token examples) | MLM loss (cross-entropy) | 2,506 |
| Held-out Telugu text (512-token examples) | MLM perplexity | 12,3 |
| Held-out Telugu text (512-token examples) | MLM top-1 accuracy | 0,535 |
| Held-out Telugu text (512-token examples) | NSP accuracy | 0,966 |
| Telugu Wikisource (3.000 párrafos, piezas de 128 tokens) | MLM loss | 2,788 |
| Telugu Wikisource (3.000 párrafos, piezas de 128 tokens) | MLM top-1 accuracy | 0,495 |
| Telugu news (3.000 párrafos, piezas de 128 tokens) | MLM loss | 2,895 |
| Telugu news (3.000 párrafos, piezas de 128 tokens) | MLM top-1 accuracy | 0,493 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, etc.) en la información disponible. Los resultados anteriores corresponden exclusivamente a las métricas de preentrenamiento declaradas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: ~170 MB en float32 (pesos); en la práctica, menos de 1 GB incluyendo activaciones para secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entrenó en 4 × RTX 2080 Ti (11 GB) y se infiere sin problema en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 10xx en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TorchScript; no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI (son entornos orientados a modelos generativos, no a encoders).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El coste de entrenamiento fue de 0,14 s/paso (fase 1, batch 256 × 128 tokens) y 0,60 s/paso (fase 2, batch 256 × 512 tokens) en 4 × RTX 2080 Ti.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BERT-medium (bammera-pothana) | 42,2 M | 512 | Telugu | No disponible | Hugging Face |
| BERT-small (bammera-pothana) | No disponible en la información | No disponible | Telugu | No disponible | Hugging Face |
| BERT-mini (bammera-pothana) | No disponible en la información | No disponible | Telugu | No disponible | Hugging Face |
| BERT-tiny (bammera-pothana) | No disponible en la información | No disponible | Telugu | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas tallas en la información proporcionada; el autor advierte que los vocabularios difieren entre modelos, por lo que las pérdidas MLM solo son aproximadamente comparables. No se han identificado en la información disponible otros modelos BERT para telugu con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre corpus de telugu (texto literario y periodístico), puede heredar sesgos de dichas fuentes.
- Riesgo de alucinación: no aplica en el sentido generativo (es un encoder), pero las predicciones fill-mask pueden ser incorrectas o reflejar distribuciones sesgadas del corpus.
- Limitaciones de contexto: máximo 512 tokens; no soporta ventanas más largas.
- Limitaciones de idioma: entrenado exclusivamente para telugu; no se garantiza rendimiento en otros idiomas ni en code-switching.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; es necesario contactar con el autor antes de usarlo en producción.
- El tokenizador debe cargarse desde este repositorio (no configurarse a mano) porque la eliminación de acentos destruiría las marcas vocálicas del telugu.
- El tokenizador elimina el ZWNJ (U+200C), por lo que palabras que difieren solo en ese carácter reciben los mismos tokens.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`); además, el checkpoint liberado es el de mejor pérdida MLM en held-out, lo que puede introducir un sesgo optimista en las métricas reportadas.
- El vocabulario no es compartido con BERT-tiny, BERT-mini ni BERT-small, lo que impide comparaciones directas de pérdida entre tallas.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/bammera-pothana/BERT-medium
- BERT-tiny: https://huggingface.co/bammera-pothana/BERT-tiny
- BERT-mini: https://huggingface.co/bammera-pothana/BERT-mini
- BERT-small: https://huggingface.co/bammera-pothana/BERT-small
- Paper de referencia (Turc et al., 2019): https://arxiv.org/abs/1908.08962
- Paper original de BERT (Devlin et al., 2018): no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
