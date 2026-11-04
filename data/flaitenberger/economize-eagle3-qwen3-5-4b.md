# flaitenberger/economize-eagle3-Qwen3.5-4B

## Resumen

`flaitenberger/economize-eagle3-Qwen3.5-4B` no es un modelo de lenguaje completo, sino una cabeza borrador (draft head) EAGLE-3 diseñada para acelerar la decodificación especulativa de `Qwen/Qwen3.5-4B`. La publica Filipe Laitenberger dentro del ecosistema de la librería `economize`, un conjunto de técnicas de eficiencia componibles para modelos de Hugging Face. El repositorio contiene únicamente los pesos del borrador (216M parámetros), no los del modelo base, que se carga aparte y permanece congelado.

El borrador es una única capa de decoder que lee los estados ocultos del modelo base a tres profundidades, los fusiona en un vector y los combina con el embedding del último token para predecir varios tokens futuros mediante su propia LM head sobre los 32.768 tokens más frecuentes del corpus de entrenamiento. Cada borrador se verifica posteriormente con el modelo base, de modo que la decodificación greedy devuelve exactamente la salida greedy del base y el muestreo especulativo (`verifier="rejection"`) respeta su distribución de muestreo.

Su relevancia es práctica: permite acelerar la inferencia de Qwen3.5-4B sin alterar la calidad de la salida, con un incremento medido de 1,39x de throughput global (hasta 1,76x en matemáticas) en una H100 con bf16, batch 1 y CUDA graphs. Está pensado para despliegues de generación de texto donde la latencia por token es crítica y el modelo base ya está en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EAGLE-3 draft head (una capa de decoder con fusión de estados ocultos a tres profundidades, MLP de anchura 9216 y LM head propia) |
| Parámetros totales | 216M (solo el borrador; el modelo base Qwen3.5-4B se carga aparte) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos del borrador); el modelo base tiene su propia licencia |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El borrador sigue el paradigma EAGLE-3: una sola capa de decoder que recibe los estados ocultos del modelo base en tres niveles de profundidad, los fusiona en un único vector, lo concatena con el embedding del último token y genera predicciones multi-token con su propia LM head restringida a los 32.768 tokens más frecuentes del conjunto de entrenamiento. La MLP del borrador tiene anchura 9216. El modelo base permanece congelado durante todo el proceso; solo se entrena el borrador.

El entrenamiento se realizó con la librería `economize` sobre 26.795 respuestas (31,3M tokens) generadas de forma greedy por el modelo base a partir de prompts de UltraChat, ShareGPT y colecciones de código y matemáticas. Se eliminaron los prompts que compartían un 13-grama con alguno de los conjuntos de evaluación. El objetivo es una divergencia KL respecto a la distribución del siguiente token del modelo base, desplegada sobre 7 pasos de borrador desenrollados (training-time test) con pesos por paso de 0,8^k. Se hizo una pasada sobre los datos en 2.124 pasos de optimizador de 16.384 tokens con padding, AdamW (betas 0,9 y 0,95), learning rate 3e-4, 100 pasos de warmup, decaimiento coseno hasta una décima del pico y clipping de gradiente a 1,0. El entrenamiento completo consumió 3,3 horas de GPU en una sola GPU.

El checkpoint almacena la configuración de decodificación que resultó más rápida en la medición: `cycle_length=9` (hasta 8 borradores por pasada del modelo base) y `min_confidence=0,7` (se deja de borrador cuando la probabilidad top del borrador cae por debajo de ese umbral).

## Capacidades

- Aceleración de decodificación especulativa sobre Qwen3.5-4B: genera borradores multi-token que el modelo base verifica, incrementando el throughput sin cambiar la distribución de salida.
- Preservación exacta de la salida greedy del modelo base: en float32 la salida coincide exactamente con la decodificación greedy plana; en bf16 puede haber divergencias numéricas menores (43% de respuestas idénticas en los 256 tokens medidos).
- Muestreo especulativo con `verifier="rejection"`: respeta la distribución de muestreo del modelo base.
- Configuración de decodificación ajustable: `cycle_length` y `min_confidence` se pueden modificar mediante `economize.DecodeConfig`.
- Integración con la cadena de herramientas de Hugging Face: `transformers` para el tokenizer y `economize` para la carga y generación.
- No incorpora capacidades propias de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes: todas esas capacidades provienen del modelo base Qwen3.5-4B, que el borrador únicamente acelera.
- Capacidades multilingües: no disponibles como dato propio del borrador; dependen del modelo base.

## Casos de uso

- Aceleración de inferencia en producción de Qwen3.5-4B: se carga el modelo base con `economize.from_pretrained` y el borrador se adjunta automáticamente, logrando 1,39x de throughput global sin reentrenar ni modificar el base. Adecuado para servicios de chat donde cada milisegundo por token cuenta.
- Generación de código de baja latencia: en los benchmarks de código (HumanEval, MBPP, LiveCodeBench) el borrador alcanza 1,43x, por lo que es útil en asistentes de autocompletado o revisión de código que necesitan respuestas rápidas en fragmentos cortos y medianos.
- Razonamiento matemático interactivo: con 1,76x en matemáticas (GSM8K, MATH-500, AIME, AMC), resulta apropiado para tutores o herramientas de resolución paso a paso donde el usuario espera respuestas encadenadas.
- Resúmenes de documentos: en CNN/DailyMail el incremento es de 1,10x; útil en pipelines de resumen por lotes donde se busca un ahorro moderado de cómputo sin tocar el modelo base.
- Procesamiento de contexto largo: con 1,18x en LongBench, encaja en aplicaciones de análisis de documentos extensos o conversaciones multi-turno que aprovechan la ventana de contexto de Qwen3.5-4B.
- Despliegue en una sola GPU H100 con bf16 y CUDA graphs: la configuración medida (batch 1, hasta 256 tokens nuevos) es directamente replicable para prototipos y servicios de baja concurrencia.
- Evaluación comparativa de técnicas de decodificación especulativa: al ser un checkpoint EAGLE-3 entrenado con `economize`, sirve como referencia para comparar con otras cabezas borrador del mismo modelo base, como `yuyijiong/Qwen3.5-4B-Eagle3` (1,31x en el mismo benchmark).

## Benchmarks y rendimiento

Throughput de decodificación relativo a la decodificación greedy plana del modelo base en el mismo runtime, medido con economize 0.3.2 en una NVIDIA H100 en bf16 con CUDA graphs, batch 1. Prompts: 8 por conjunto de Spec-Bench, MT-Bench, AlpacaEval y Arena-Hard (chat), HumanEval, MBPP y LiveCodeBench (código), GSM8K, MATH-500, AIME 2024/2025 y AMC 2023 (matemáticas), CNN/DailyMail (resumen) y LongBench (contexto largo), con hasta 256 tokens nuevos.

| Categoría | Aceleración | Tokens por pasada del modelo base |
|---|---|---|
| Global | 1,39x | 2,60 |
| Chat | 1,30x | no disponible |
| Código | 1,43x | no disponible |
| Matemáticas | 1,76x | no disponible |
| Resumen | 1,10x | no disponible |
| Contexto largo | 1,18x | no disponible |

Comparación con otra cabeza EAGLE-3 para el mismo modelo base en el mismo benchmark y hardware:

| Cabeza borrador | Aceleración global |
|---|---|
| flaitenberger/economize-eagle3-Qwen3.5-4B | 1,39x |
| yuyijiong/Qwen3.5-4B-Eagle3 | 1,31x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, ya que el borrador no altera la calidad del modelo base.

## Requisitos de hardware

- VRAM estimada para el borrador: el repositorio ocupa 0,4 GB; en bf16 los 216M parámetros del borrador requieren aproximadamente 0,43 GB adicionales sobre la memoria del modelo base.
- VRAM del modelo base: no disponible en la información proporcionada; depende de Qwen3.5-4B y de su cuantización.
- GPU recomendadas: la medición oficial se realizó en una NVIDIA H100 en bf16 con CUDA graphs. No se han publicado mediciones en otras GPU.
- GPU de consumo: no hay datos publicados sobre funcionamiento en RTX 4090 u otras GPU de consumo; la viabilidad depende de que el modelo base quepa en la VRAM disponible.
- Opciones de despliegue: la ruta soportada es la librería `economize` (>= 0.4) junto con `transformers` para el tokenizer. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,39x de throughput global frente a greedy plano, con 2,60 tokens generados por pasada del modelo base en la configuración óptima (`cycle_length=9`, `min_confidence=0,7`).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Aceleración medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| flaitenberger/economize-eagle3-Qwen3.5-4B | Draft head EAGLE-3 para Qwen3.5-4B | 216M (borrador) | no disponible | 1,39x global (H100, bf16) | Apache 2.0 | Hugging Face, vía `economize` |
| yuyijiong/Qwen3.5-4B-Eagle3 | Draft head EAGLE-3 para Qwen3.5-4B | no disponible | no disponible | 1,31x global (mismo benchmark y hardware) | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B | Modelo base de lenguaje | no disponible | no disponible | referencia (1x) | propia del modelo base | Hugging Face |

No se dispone de datos sobre otras alternativas de decodificación especulativa (Medusa, Lookahead, borradores nativos) en la información proporcionada.

## Limitaciones y advertencias

- El borrador no es un modelo autónomo: requiere cargar Qwen3.5-4B y la librería `economize`; no puede usarse con `transformers` de forma directa ni con runtimes que no soporten EAGLE-3.
- En bf16, una pasada de verificación sobre varios tokens redondea de forma distinta a un paso de un solo token, por lo que la salida puede diferir de la decodificación greedy plana en bf16 tras un cierto número de tokens. En la medición, solo el 43% de las respuestas fueron idénticas en los 256 tokens. En float32 la coincidencia es exacta.
- La aceleración depende de la carga: 1,10x en resumen y 1,18x en contexto largo son incrementos modestos frente a 1,76x en matemáticas.
- Los datos de rendimiento provienen de una única ejecución de temporización en una H100 con batch 1; no hay mediciones publicadas de latencia, throughput absoluto ni comportamiento con batch mayor.
- La LM head del borrador está restringida a los 32.768 tokens más frecuentes del corpus de entrenamiento, lo que puede limitar la eficacia del borrado en dominios con vocabulario poco frecuente.
- No se han publicado datos sobre sesgos, riesgo de alucinación ni comportamiento multilingüe propios del borrador; estas características las determina el modelo base.
- Licencia Apache 2.0 para los pesos del borrador, pero el uso comercial está sujeto también a la licencia del modelo base Qwen3.5-4B, que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- No se especifican requisitos de versión de CUDA, drivers ni versiones mínimas de `transformers` más allá de `economize>=0.4`.

## Enlaces

- Hugging Face: https://huggingface.co/flaitenberger/economize-eagle3-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de la librería economize: https://github.com/Thiggel/economize
- Documentación de economize: https://thiggel.github.io/economize/
- Cabeza EAGLE-3 alternativa: https://huggingface.co/yuyijiong/Qwen3.5-4B-Eagle3
