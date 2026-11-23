# dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk

## Resumen

`semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13` dentro de la familia SemSimula, un programa experimental de modelos de lenguaje "conservativos" basados en mecánica lagrangiana y campos de potencial escalar. No es un transformer: se presenta explícitamente como un modelo sin atención clásica ("attention-free", "non-transformer") que sustituye el mecanismo de self-attention por un campo de intercambio conservativo con enrutamiento normalizado por similitud coseno entre queries y keys (QK-normalisation). El modelo tiene 77,4 millones de parámetros, dimensión oculta 384 y 2 capas (L=2), y está entrenado sobre OpenWebText con un presupuesto fijo de 532.480.000 tokens.

La relevancia de esta ficha no es de producto sino de investigación: forma parte de un "ladder study" pre-registrado en el que el autor compara variantes con y sin mecanismos concretos (campo de intercambio, registros virtuales, canales inversos) manteniendo constante el presupuesto de tokens, el corpus y el tokenizador. Este modelo concreto es la "Generación 3" del brazo `attention_potential` con el enrutamiento del campo endurecido mediante QK-normalisation y un recorte de gradiente propio de 0,3. Su resultado declarado es una perplejidad de validación de 52,90 en OpenWebText (bloque 512), aproximadamente 1,062× la de GPT-2 según la propia model card.

Se distribuye únicamente en inglés, con licencia CC-BY-4.0, en formato PyTorch (repo de 0,6 GB) y sin pesos GGUF ni cuantizaciones publicadas. Es, por tanto, un artefacto de ablación científica más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM (conservative language model, sin atención clásica), campo de intercambio con enrutamiento QK-normalizado, L=2, d=384 |
| Parametros totales | 77,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch; sin GGUF publicados) |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (checkpoint nativo; sin safetensors ni GGUF indicados) |

## Arquitectura y entrenamiento

El modelo pertenece a la línea Fock-PARFLM del autor, descrita como un modelo de lenguaje conservativo con potencial escalar y mecánica lagrangiana, con "registros virtuales" en espacio de Fock y un "canal inverso". No emplea self-attention estándar: en su lugar, un campo de intercambio conservativo calcula puntuaciones de enrutamiento como similitud coseno entre queries y keys L2-normalizadas, multiplicadas por una escala logit aprendida por cabeza, σ = min(exp λ, 100), inicializada en 1/0,07. Esta QK-normalisation (etiqueta `rfqk`) añade ocho parámetros nuevos, uno por cabeza, y el campo recibe su propio recorte de gradiente en 0,3 (`rfclip0p3`). Ambos interruptores están desactivados por defecto y el autor afirma que, apagados, el código es bit-idéntico al original (logits, pérdida y todos los gradientes).

El entrenamiento usa OpenWebText con 32.500 pasos × batch 32 × bloque 512 = 532.480.000 tokens, el mismo presupuesto que el resto de modelos de la tabla comparativa, con el mismo corpus, tokenizador y lotes de validación. La ejecución se realizó en una única sesión de Colab a 1,67 s/paso, con 0 watchdogs, 0 picos y un 1,4 % de pasos con clipping (9 de 650 registrados, norma máxima 1,08, entre los pasos 19.700 y 26.000). La norma global del gradiente subió de 0,44 a 0,87 en la fase de learning rate constante y bajó a 0,71 en la fase de decaimiento. El autor declara dos predicciones pre-registradas antes de la ejecución, ambas falladas: perplejidad asentada ≤ 52,1 (obtenido 52,90) y gradiente del campo plano dentro de ±25 % de su valor en el paso 5.000 (subió ~90 %, de 0,43 a 0,82, impulsado por la proyección de valor W_v, que la QK-normalisation no toca). El monitor de fuga causal SCAF se declara limpio en las siete auditorías (perturbación futura exactamente 0, impuesto de fuga ≤ 1,9e-4 nats), aunque la auditoría del paso 32.500 imprimió sus perplejidades estándar como `nan`.

## Capacidades

- Generación de texto en inglés a nivel de investigación: el modelo está entrenado exclusivamente sobre OpenWebText y su métrica declarada es perplejidad, no capacidades de tarea.
- Modelado de lenguaje autorregresivo causal: el autor verifica causalidad con perturbación futura nula en cinco puntos de corte y con independencia de lote exacta.
- Razonamiento, código, matemáticas o visión: no disponible; no hay evidencia publicada de estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: modo "thinking", visión o audio no disponibles; la particularidad es arquitectónica (campo conservativo, registros virtuales, canal inverso), no funcional.

## Casos de uso

- Estudio de ablación de mecanismos: el modelo sirve para comparar, con presupuesto de tokens idéntico, el efecto de un campo de intercambio conservativo endurecido frente a variantes sin campo o sin registros; su uso típico es reproducir la tabla de perplejidades del autor.
- Investigación en arquitecturas no-transformer: como referencia ejecutable de un modelo sin self-attention clásica, útil para experimentos sobre atención alternativa y campos de potencial.
- Validación de causalidad y fugas de información: el modelo y su monitor SCAF permiten probar metodologías de auditoría de fuga futura en modelos causales.
- Reproducción de estudios pre-registrados: sirve como caso práctico de pre-registro con predicciones falladas y análisis de desviación del gradiente.
- Docencia y divulgación sobre entrenamiento a pequeña escala: con 77,4 M de parámetros y 0,6 GB de checkpoint, es viable en entornos educativos para ilustrar presupuestos de cómputo y métricas de perplejidad.
- Línea base para perplejidad en OpenWebText: puede actuar como punto de comparación (52,90 en bloque 512) frente a modelos pequeños de la misma familia o GPT-2.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Perplejidad asentada (OpenWebText, bloque 512) | Frente a este modelo | Frente a GPT-2 | Parámetros |
|---|---:|---:|---:|---:|
| **Este modelo** (L=2, campo endurecido) | **52,90** | — | 1,062× | 77,4 M |
| Sin campo de intercambio, Fock activo, L=4 (Gen 3) | 50,10 | +5,6 % | 1,006× | 76,8 M |
| Sin campo de intercambio, Fock activo, L=2 (Gen 3) | 53,12 | −0,4 % | 1,066× | 76,8 M |
| `attention_potential` sin endurecer (Gen 3, L=2) | 54,21 | −2,4 % | 1,088× | 77,4 M |
| Solo conservativo, gradientes vivos (Gen 3, L=2) | 57,76 | −8,4 % | 1,160× | 76,6 M |
| Brazo `gpt2-matched` (L=8) | 49,81 | +6,2 % | 1,000× | 33,7 M |

Detalles adicionales declarados: la perplejidad asentada es la media de las tres últimas evaluaciones (52,83; 53,05; 52,81), con mejor valor 50,97 en el paso 31.000 y valor final 52,81; las evaluaciones consecutivas cerca del final difieren en ±2 PPL. En el paso 3.000 el modelo marcaba 113,52 frente a 118,14 del modelo sin endurecer (−3,9 %) y 123,59 del modelo L=2 sin campo con gradientes vivos. La variante con este campo pero sin lectura de registros (`...-rfqk-norc`) asienta en 54,27, un 6,0 % por debajo del modelo solo conservativo. El autor concluye que el campo endurecido no aporta mejora medible (0,4 %, dentro del ruido) y que el campo y la ruta de registros se sustituyen mutuamente en gran medida.

## Requisitos de hardware

- VRAM estimada para inferencia: con 77,4 M de parámetros, unos 0,31 GB en fp32, ~0,15 GB en fp16/bf16 y ~0,08 GB en int8; el repo completo ocupa 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1650 son sobradas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura propia y no-transformer, no hay soporte declarado en vLLM, llama.cpp, Ollama ni TGI; el despliegue requiere el código del autor en PyTorch.
- Latencia y throughput: no disponibles; el único dato de cómputo es 1,67 s/paso durante el entrenamiento en una sesión de Colab, no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad OpenWebText | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo (SemSimula, L=2 endurecido) | 77,4 M | no disponible (bloques de 512) | 52,90 | CC-BY-4.0 | Hugging Face, PyTorch |
| SemSimula `gpt2-matched` (L=8) | 33,7 M | no disponible | 49,81 | no disponible | Hugging Face |
| SemSimula sin campo de intercambio (L=4) | 76,8 M | no disponible | 50,10 | no disponible | Hugging Face |
| GPT-2 (referencia citada por el autor) | ~124 M | 1.024 | 1,000× relativo (referencia) | MIT | Amplia |

La comparación con GPT-2 procede de la propia model card, que expresa los resultados como múltiplo de la perplejidad de GPT-2 (1,062× en este modelo). No se dispone de comparaciones con otros modelos pequeños de la misma categoría fuera de la familia SemSimula.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: sin soporte en runtimes estándar (vLLM, llama.cpp, Ollama, TGI) y con arquitectura propietaria que exige el código del autor.
- Solo inglés: no hay capacidades multilingües declaradas.
- Perplejidad de 52,90 en OpenWebText, ligeramente peor que GPT-2 (1,062×) y que el brazo `gpt2-matched` de la propia familia (49,81), lo que limita su utilidad como generador de texto de calidad.
- Riesgo de alucinación: no evaluado; no hay benchmarks de tareas (MMLU, HumanEval, GSM8K) que permitan estimarlo.
- Sesgos: no documentados; el corpus OpenWebText hereda los sesgos de los enlaces de Reddit de los que se extrae.
- Dos predicciones pre-registradas falladas y una auditoría con perplejidades `nan` en el paso 32.500, lo que exige cautela al interpretar la reproducibilidad.
- El propio autor reconoce que el campo endurecido no aporta mejora medible (0,4 %, dentro del ruido de ±2 PPL), por lo que el valor del modelo es metodológico, no de rendimiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación no se recomienda su uso en producción sin validación adicional.
- Longitud de contexto real no documentada; el entrenamiento usa bloques de 512 y el autor señala que acortar la entrada cambia los logits (hasta 0,05 de diferencia), lo que apunta a comportamiento dependiente de la longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk
- Modelo sin endurecer (base de esta variante): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Variante sin campo de intercambio, L=2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Variante sin campo de intercambio, L=4: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Variante solo conservativa: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Variante con campo pero sin registros: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk-norc
- Brazo `gpt2-matched`: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3 (live-gradient ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
