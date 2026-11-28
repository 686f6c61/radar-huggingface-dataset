# dimitarpg13/semsimula-ladder-owt-d384-gpt2-matched-w2

## Resumen

`semsimula-ladder-owt-d384-gpt2-matched-w2` es un modelo de lenguaje de tipo transformer, con arquitectura GPT-2, desarrollado por el usuario de Hugging Face `dimitarpg13` como parte de su estudio de investigación "Semantic Simulation ladder" (generación 3). No es un modelo destinado a producción, sino una referencia experimental: un GPT-2 de 8 capas y dimensión 384 (33,7 millones de parámetros) reentrenado desde cero sobre OpenWebText con el mismo presupuesto de tokens (532,48 millones) y el mismo schedule de learning rate (WSD, pico 1,2e-3) que los modelos de la escalera "Semantic Simulation". Su función es servir de base de comparación para tests de plantillas semánticas (semantic templates) que miden si un modelo codifica formas lógicas válidas en su flujo residual.

El modelo resuelve un problema metodológico concreto: aislar el efecto de la arquitectura "conservative language model" (basada en potencial escalar y mecánica lagrangiana) frente a un transformer estándar entrenado exactamente con los mismos datos, el mismo número de pasos y el mismo schedule. Al compartir el presupuesto de tokens y la curva de aprendizaje, las diferencias de perplejidad y de lectura de plantillas semánticas pueden atribuirse a la arquitectura y no a la receta de entrenamiento.

Es relevante ahora porque forma parte de un conjunto de ablaciones pre-registradas (mechanism ablation, ladder study) que buscan evidencia sobre si los modelos de lenguaje adquieren estructuras lógicas reconocibles en sus representaciones internas. El checkpoint es pequeño (0,1 GB), entrenado en una única sesión de Colab sobre una A100-40GB en 2,7 horas, y su perplejidad de validación asentada es 48,37 en OpenWebText a bloque 512.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT-2 (d = 384, L = 8 capas) |
| Parametros totales | 33,7 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloque 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (libreria pytorch; formato exacto no disponible) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura GPT-2 estándar, con dimensión de modelo 384 y 8 capas. Se entrenó desde cero sobre el dataset OpenWebText (Skylion007/openwebtext), con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × batch 32 × bloque 512). El schedule de learning rate es WSD (warmup-stable-decay) con pico 1,2e-3, idéntico al de los modelos de la escalera Semantic Simulation: el autor verifica que la curva coincide con la de una ejecución de la escalera (XRB-F) en los 650 pasos registrados, con una tolerancia relativa de 5e-16. La fase de decaimiento aporta 0,338 nats de mejora (de 67,79 en el paso 21.000 a 48,37 al final).

No se menciona uso de RLHF, DPO ni ajuste por instrucciones; es un modelo de preentrenamiento puro orientado a investigación. La innovación metodológica no está en la arquitectura (es un GPT-2 convencional) sino en el diseño experimental: el entrenamiento replica exactamente la receta de los modelos "conservative language model" de la escalera para que las comparaciones de perplejidad y de lectura de representaciones internas sean atribuibles a la arquitectura. El autor reporta salud de ejecución: 65 evaluaciones, con una subida máxima entre evaluaciones de +0,009 nats en el paso 15.000.

## Capacidades

- Generación de texto autoregresiva en inglés, con calidad de modelo pequeño (33,7M parámetros) entrenado sobre 0,53B tokens.
- Lectura de formas lógicas en el flujo residual: el modelo demuestra capacidad de codificar la forma de premisas lógicas (modus ponens, modus tollens y dos silogismos disyuntivos) en el estado del token "Therefore", con precisión de 0,653 en la tarea A (azar 0,25) tras el bloque 7.
- Discriminación de validez lógica frente a un gemelo (twin) con AUROC de 0,754 tras el bloque 4.
- Control de lógica B: capacidad de seguir la cláusula ligada por una oración de contexto, con puntuaciones de 0,86 y 0,92 contra el foil y de 0,73 y 0,77 contra el gemelo.
- Reconocimiento de premisas literales con palabras no vistas: 0,970 de identidad de token en el embedding.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre representaciones internas: el modelo sirve como referencia para leer el flujo residual con tests de plantillas semánticas y comparar si una arquitectura alternativa (conservative language model) codifica formas lógicas antes o mejor que un transformer estándar.
- Ablación de mecanismos controlada: al compartir schedule, tokens y datos con los modelos de la escalera, permite aislar el efecto de la arquitectura en la perplejidad (48,37 frente a 49,81 del GPT-2 con schedule coseno, 53,12 de G2, 50,10 de L4 y 58,51 de SR2-NP).
- Reproducción de experimentos pre-registrados: útil para replicar el estudio "ladder" y verificar las lecturas de plantillas semánticas sobre un checkpoint congelado, sin necesidad de reentrenar.
- Estudio de schedules de learning rate: la comparación con el GPT-2 de schedule coseno (misma arquitectura, pico 6e-4) permite analizar el efecto del WSD con pico 1,2e-3 sobre la perplejidad final en un presupuesto de tokens corto.
- Docencia y divulgación: modelo pequeño (0,1 GB) que cabe en cualquier GPU consumer, adecuado para demostrar cómo se leen estados internos de un transformer con sondas lineales o gaussianas.
- Base para fine-tuning experimental: punto de partida ligero para probar hipótesis sobre adquisición de estructura lógica con presupuestos de cómputo mínimos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (perplejidad de validación en OpenWebText, bloque 512, media de las tres últimas evaluaciones de 500 pasos):

| Modelo | Perplejidad asentada | Diferencia frente a este modelo |
|---|---:|---:|
| **Este modelo** (GPT-2, d=384, L=8, 33,7M) | **48,37** | — |
| GPT-2 con schedule coseno (mismo modelo, pico 6e-4) | 49,81 | +3,0% |
| SR2-NP (Semantic Simulation, L=2) | 58,51 | +21,0% |
| G2 (Semantic Simulation, L=2) | 53,12 | +9,8% |
| L4 (Semantic Simulation, L=4) | 50,10 | +3,6% |

Resultados de las plantillas semánticas (lectura del flujo residual, checkpoint congelado):

| Modelo | Premisas literales, palabras no vistas | Tarea A: forma correcta primera (azar 0,25) | Tarea A: AUROC válido vs gemelo (azar 0,5) | Control B: contra foil | Control B: contra gemelo |
|---|---:|---|---|---|---|
| GPT-2 W2 | 0,970 | 0,653 (tras bloque 7) | 0,754 (tras bloque 4) | 0,86 y 0,92 | 0,73 y 0,77 |
| SR2-NP | 0,952 | 0,621 | 0,756 (tras capa 1) | 0,90 y 0,92 | 0,76 y 0,84 |
| G2 | 0,955 | 0,573 | 0,745 | 0,57 y 0,58 | 0,69 y 0,75 |
| L4 | 0,976 | 0,604 | 0,753 | 0,97 y 0,96 | 0,78 y 0,78 |

El autor advierte que estos resultados de plantillas son preliminares: las plantillas no disparan fuera de premisas literales y las lecturas se hacen sobre un checkpoint congelado, sin construir nada dentro del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (33,7M parámetros ≈ 135 MB de pesos); en fp16 ≈ 67 MB. Cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU para inferencia por lotes pequeños. El entrenamiento se realizó en una A100-40GB en 2,7 horas.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: al ser un checkpoint PyTorch con arquitectura GPT-2, puede cargarse con `transformers` (clase GPT2LMHeadModel) y servirse con vLLM o TGI; para CPU, conversión a GGUF y uso con llama.cpp u Ollama es viable, aunque el autor no publica versiones cuantizadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Este modelo (GPT-2 W2) | 33,7M | no disponible | 48,37 | CC-BY-4.0 | Hugging Face |
| GPT-2 coseno (matched) | 33,7M | no disponible | 49,81 | no disponible | Hugging Face |
| SR2-NP (Semantic Simulation L=2) | no disponible | no disponible | 58,51 | no disponible | Hugging Face |
| G2 (Semantic Simulation L=2) | no disponible | no disponible | 53,12 | no disponible | Hugging Face |

La comparación relevante es interna a la escalera del autor: el GPT-2 matched con WSD supera en perplejidad a todos los modelos "conservative" del mismo presupuesto de tokens, mientras que en las lecturas de plantillas semánticas queda a la par de SR2-NP en su mejor estado, pero necesita más bloques (tres) para alcanzar el nivel que SR2-NP logra tras su primera capa.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado; no es adecuado para uso en producción ni para interacción con usuarios finales.
- Calidad de generación limitada: 33,7M parámetros y 0,53B tokens de entrenamiento producen texto de calidad baja comparado con modelos actuales; la perplejidad de 48,37 es alta en términos absolutos.
- Solo inglés: no hay soporte multilingüe documentado.
- Riesgo de alucinación y sesgos: al entrenarse sobre OpenWebText sin filtrado adicional documentado, hereda los sesgos y la toxicidad del corpus web; no se reportan evaluaciones de sesgo.
- Resultados preliminares: las lecturas de plantillas semánticas son preliminares y las plantillas no disparan fuera de premisas literales; el autor lo advierte explícitamente.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación sin garantías, su uso comercial no está justificado técnicamente.
- Sin cuantizaciones publicadas ni formatos GGUF oficiales; el despliegue requiere convertir el checkpoint PyTorch.
- Contexto de entrenamiento corto (bloque 512); no se documenta la longitud de contexto efectiva en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-gpt2-matched-w2
- Colección "Semantic templates" (gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-semantic-templates-6b09ef3b455cc520d1d3be78
- GPT-2 matched con schedule coseno: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- SR2-NP: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-sr2
- G2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- L4: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Perfil del autor: https://huggingface.co/dimitarpg13
