# lynxpurr/ZhenLM-140M-SFT-v2e

## Resumen

ZhenLM 140M SFT v2e es un modelo de lenguaje decoder-only bilingüe chino-inglés desarrollado desde cero por el autor independiente lynxpurr dentro del proyecto `pretrain-lab`. Con 137.847.552 parámetros exactos, arquitectura Transformer clásica (RoPE, RMSNorm pre-norm, SwiGLU y embeddings atados) y una ventana de contexto de 1024 tokens, se posiciona como un artefacto de aprendizaje e investigación, no como un modelo de producción. El autor lo declara explícitamente: no compite con los modelos abiertos modernos.

El modelo se preentrenó con 3.000 millones de tokens (60 % FineWeb-Edu en inglés, 40 % minimind `pretrain_t2t` en chino) y se afinó con 250 millones de tokens de SFT asistente, todo ello en una única GPU RTX 5070 Ti de 16 GB. Su relevancia es fundamentalmente didáctica: demuestra el ciclo completo de entrenamiento from-scratch y SFT en hardware de consumo, con una documentación de evaluación inusualmente honesta que incluye análisis de significación estadística y revisiones de rúbrica.

La versión v2e es la variante con menor repetición de la familia (rep-4 de 0,138) y la mejor puntuación en el conjunto de retención de 90 preguntas (53/90), aunque el propio autor advierte que la ventaja frente a v2 no es estadísticamente significativa (McNemar p = 0,0923) y no se reprodujo en una segunda revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only: RoPE + RMSNorm (pre-norm) + SwiGLU + embeddings atados |
| Parametros totales | 137.847.552 (d_model 768, 16 capas, 12 cabezas, head_dim 64) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | Q8_0 GGUF (174 MB) recomendado; F16 (326 MB) opcional; Q4_K_M declarado no fiel por el autor |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp/Ollama) |
| FFN oculto | 2048 (8/3·d, multiple_of 64) |
| Vocabulario | 32.000 BPE ByteLevel; especiales `<|endoftext|>`=0, `<|im_start|>`=1, `<|im_end|>`=2 |
| Plantilla de chat | `<|im_start|>{role}\n{content}<|im_end|>\n`; prompt de generación `<|im_start|>assistant\n` |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only estándar sin innovaciones estructurales: normalización RMSNorm en pre-norm, embeddings rotatorios (RoPE) para la posición, activación SwiGLU en la FFN y atado de embeddings entre entrada y salida. Con 16 capas y d_model 768, el modelo sigue el diseño de referencia tipo LLaMA en miniatura. El vocabulario de 32.000 tokens BPE ByteLevel está compartido entre chino e inglés.

El preentrenamiento consumió 3.000 millones de tokens con una mezcla del 60 % de FineWeb-Edu (`sample-10BT`, licencia ODC-BY 1.0 sujeta a los términos de Common Crawl) y el 40 % de minimind `pretrain_t2t` (Apache-2.0), alcanzando una pérdida de validación de 2,7709. El SFT se realizó sobre `sft-mix-v2e` con 250.001.408 tokens, máscara solo sobre el turno del asistente y una mezcla del 25 % de datos de preentrenamiento, con pérdida de validación de 1,6065. Parte de los datos de SFT son sintéticos generados por el propio repositorio (calibración, formato, ayuda, concisión y pares de instrucciones de traducción). No se aplicó RLHF ni DPO; el autor declara explícitamente la ausencia de ajuste de seguridad y de evaluación de sesgos.

## Capacidades

- Generación de texto conversacional bilingüe (chino-inglés) en turnos cortos.
- Explicaciones simples y charla informal (chit-chat).
- Generación de código corto.
- Seguimiento de formato e instrucciones simples, como "responde con un único número".
- Un conjunto reducido de patrones de instrucción de traducción (funciona mejor zh→en en frases simples; en→zh falla en la mayoría de casos).
- Calibración básica: el modelo tiende a no inventar cuando no sabe, aunque sus correcciones de premisa suelen ser factualmente erróneas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Demostración educativa de entrenamiento from-scratch: sirve para ilustrar el pipeline completo (preentrenamiento, SFT, cuantización GGUF, evaluación) en una sola GPU de consumo de 16 GB, con documentación reproducible en el repositorio `pretrain-lab`.
- Chat local bilingüe de baja latencia: con 174 MB en Q8_0, se puede desplegar en portátiles y dispositivos de gama baja para conversaciones cortas en chino e inglés, aceptando la calidad limitada del modelo.
- Pruebas de plantillas de chat y tokenizadores: útil para validar integraciones de `transformers`, `text-generation-inference` o `llama.cpp` antes de migrar a modelos mayores, gracias a su formato de pesos estándar y compatibilidad con endpoints.
- Generación de fragmentos de código corto en entornos de prototipado: el modelo puede producir snippets simples, aunque no debe usarse en producción por su alta tasa de error en tareas no memorizadas.
- Investigación sobre calibración y abstención: su comportamiento de "no inventar" (5-6/6 bajo etiquetas laxas, 1-3/6 bajo revisión estricta) lo convierte en un caso de estudio para analizar la diferencia entre abstención y corrección factual.
- Experimentos de alineación y evaluación de rúbricas: la documentación del autor sobre sensibilidad de etiquetas (kappa 0,660/0,453, McNemar p = 0,0923) es un ejemplo práctico para estudiar cómo las decisiones de anotación afectan a las conclusiones sobre mejoras de modelo.
- Base para fine-tuning didáctico: al ser Apache-2.0 y tener 140M parámetros, es un punto de partida asequible para practicar LoRA o SFT completo en hardware modesto.

## Benchmarks y rendimiento

Evaluación con decodificación greedy, misma plantilla de chat y mismo tokenizador. El conjunto dev tiene 18 preguntas y el holdout 90 preguntas con juicio manual binario por pregunta.

| Modelo | Dev 18 | Holdout 90 (manual) | rep-4 ↓ |
|---|---|---|---|
| base | 6/18 | 12/90 | 0,738 |
| SFT v1 | 16/18 | 47/90 | 0,248 |
| SFT v2 | 15/18 | 47/90 | 0,168 |
| SFT v2e (este modelo) | 17/18* | 53/90 | 0,138 |
| LoRA r12 2ep | 15/18 | 48/90 | 0,283 |

\* Dos residuos conocidos en dev (`fact-months`, `math-add`); subconjunto limpio 15/16.

Bloques de capacidad (14 de matemáticas, 14 de traducción, 6 de calibración):

| Bloque | Resultado | Observación |
|---|---|---|
| Matemáticas | 0-3/14 | Tabla de búsqueda estrecha, no aritmética; falla en combinaciones no vistas (`13×5`, `17+6`, `100−37`) |
| Traducción | 0-5/14 | Nivel de patrón de frase; zh→en simple funciona, en→zh mayoritariamente falla |
| Calibración | 5-6/6 (etiquetas originales); 1-3/6 (revisión estricta) | Se abstiene de inventar, pero sus correcciones de premisa suelen ser erróneas |

La ventaja de v2e frente a v2 (+6/90 en auditoría, +7/90 en re-juicio del 2026-11-21) cumple el umbral preregistrado (≥5) bajo las etiquetas originales, pero el test exacto de McNemar da p = 0,0923 y el intervalo de confianza bootstrap al 95 % [0,000; 0,156] incluye el 0. Una segunda revisión del 2026-11-22 sobre un subconjunto de 47 preguntas no reprodujo la ventaja (11 vs 11, kappa 0,660/0,453, McNemar p = 1,000). El autor concluye que la mejora es sensible a la rúbrica y no una ganancia robusta de capacidad.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en Q8_0 (174 MB de pesos) y unos 350 MB en F16 (326 MB de pesos), más el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 2 GB de VRAM; el propio autor lo entrenó en una RTX 5070 Ti de 16 GB. Funciona en RTX 3060, RTX 4060, RTX 4090 y superiores sin problema.
- Cabe holgadamente en GPU consumer e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: `transformers` (safetensors), llama.cpp y Ollama (GGUF Q8_0), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (140M parámetros) se espera una latencia muy baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ZhenLM 140M SFT v2e | 137,8M | 1024 | zh, en | Apache-2.0 | From-scratch, artifact de investigación, sin RLHF |
| GPT-2 small | 124M | 1024 | en | MIT (pesos) | Referencia histórica de tamaño similar; solo inglés |
| SmolLM-135M | 135M | 2048 | en (multilingüe parcial) | Apache-2.0 | Entrenado con más datos y pipeline más maduro |
| Qwen2.5-0.5B | 494M | 32.768 | multilingüe | Apache-2.0 | Varias veces mayor; calidad muy superior en tareas reales |

La comparación con GPT-2 small y SmolLM-135M es la más directa por tamaño; Qwen2.5-0.5B se incluye como referencia de la categoría "small language model" utilizable en producción. ZhenLM no está pensado para competir con ninguno de ellos: su interés es el proceso de entrenamiento reproducible y la documentación de evaluación.

## Limitaciones y advertencias

- Conocimiento: 3.000 millones de tokens y 140M de parámetros equivalen aproximadamente a nivel GPT-2; alucina nombres, fechas y detalles. No debe usarse como fuente de conocimiento.
- Matemáticas: memoriza algunas respuestas de dev; las combinaciones no vistas son incorrectas. Los aciertos en dev son memoria y búsqueda, no aritmética.
- Traducción: solo patrones de instrucción entrenados; `Knowledge is power` suele devolverse en inglés y `今天非常冷` se traduce como "hot" en todas las versiones por prior override.
- Repetición: v2e tiene el rep-4 más bajo de la familia (0,055 en dev), pero las respuestas largas en inglés aún pueden repetirse.
- Identidad: el corpus de SFT proviene de minimind y el modelo a menudo se identifica como "minimind" incluso con decodificación greedy. Su autodescripción no es fiable.
- Contexto: 1024 tokens; las entradas más largas se truncan.
- Seguridad: sin ajuste de seguridad, sin RLHF y sin evaluación de sesgos.
- Sensibilidad de etiquetas: la ventaja de +6/+7 en holdout no es robusta a una segunda revisión más estricta; no debe citarse como una mejora de capacidad consolidada.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de FineWeb-Edu están sujetos a los términos de Common Crawl y los corpus originales no se redistribuyen (ver `NOTICE`).
- Cuantización: Q4_K_M no es fiel según el autor; usar Q8_0 o F16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lynxpurr/ZhenLM-140M-SFT-v2e
- Repositorio del proyecto: https://github.com/lynxpurr/pretrain-lab
- Documentación de evaluación: https://github.com/lynxpurr/pretrain-lab/blob/develop/docs/evaluation.md
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset minimind: https://huggingface.co/datasets/jingyaogong/minimind_dataset
