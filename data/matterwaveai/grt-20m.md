# MatterWaveAI/grt-20m

## Resumen

GRT-20M es un modelo de lenguaje causal de tipo base, desarrollado por MatterWaveAI, que implementa una arquitectura experimental denominada Geometric Rotation Transformer (GRT). Su particularidad es que sustituye las proyecciones lineales densas de un transformer estándar por cascadas de rotaciones de Givens aprendidas sobre SO(D), de modo que la ruta residual no contiene ninguna capa `nn.Linear`. Con 16.730.869 parámetros totales (10,3 millones no pertenecientes al embedding), 12 bloques rotacionales, dimensión de modelo 256 y una longitud máxima de secuencia de 1.024 tokens, es un modelo deliberadamente diminuto pensado para investigación, no para producción.

El modelo se publica como *research preview* y su propósito declarado es triple: demostrar que la arquitectura entrena de forma estable, verificar que se sirve extremo a extremo a través de la misma interfaz HTTP compatible con OpenAI que el resto de modelos del ecosistema, y proporcionar a la integración continua sin GPU un modelo upstream barato y siempre disponible. No está ajustado por instrucciones ni dispone de plantilla de chat, y sus propios autores advierten que la salida es gramatical y localmente coherente pero no factual.

La relevancia actual del checkpoint reside en la comparación de optimizadores: partiendo del mismo checkpoint de 16,7 millones de parámetros enviado a NeurIPS (entrenado con `PairAdam`), el cambio a optimizadores geométricos clásicos (`SymplecticAdam` y `HuygensSymplecticAdam`) eleva la precisión media en tareas de elección múltiple de SLM-Bench de 38,63 % a 45,03 % (+6,40 puntos) y reduce la perplejidad en GSM8K de 60,12 a 9,11 (una reducción de 6,60 veces respecto a zero-shot).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Rotation Transformer (GRT), transformer causal con rotaciones de Givens aprendidas en SO(D) en lugar de proyecciones lineales densas |
| Parametros totales | 16.730.869 (16,7 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo incluye pesos en safetensors y GGUF; no se detallan los esquemas de cuantizacion publicados) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) y GGUF |

Datos adicionales de arquitectura: `d_model` = 256, 12 bloques rotacionales, 4 cabezas de atención, 11 rotaciones por bloque en QKV, 21 rotaciones en la FFN, vocabulario BPE de 50.000 tokens y precisión de entrenamiento e inferencia en float32. El embedding concentra 6,45 millones de los 16,7 millones de parámetros (50.000 tokens por 128 ángulos de fase más una log-magnitud por token). La etiqueta "20m" del nombre es una clase de tamaño, no un recuento de parámetros.

## Arquitectura y entrenamiento

GRT-20M es un transformer causal en el que las proyecciones lineales densas se reemplazan por cascadas de rotaciones de Givens aprendidas sobre el grupo especial ortogonal SO(D). Cada bloque rotacional aplica 11 rotaciones en el camino QKV y 21 en la red feed-forward, de forma que la ruta residual queda libre de capas `nn.Linear`. El modelo usa 12 bloques con dimensión 256 y 4 cabezas de atención, y se entrenó en float32 con el optimizador `PairAdam`, tasa de aprendizaje máxima de 1e-3 con decaimiento coseno hasta el 10 %, durante 158.000 pasos, alcanzando una pérdida de entrenamiento de 2,114.

Los datos de preentrenamiento provienen de una mezcla de ocho corpus en inglés: ClimbMix, Wikipedia, RefinedWeb, FineWeb-Edu, Cosmopedia, Nemotron-Pretraining-Dataset-sample, FineMath y StackExchange. No se especifica en la información disponible el número total de tokens procesados ni si hubo fases de RLHF o DPO; el modelo es un base model sin ajuste por instrucciones. La innovación técnica destacable, además de la propia arquitectura rotacional, es la sustitución del optimizador: los autores reportan que, manteniendo idéntico el checkpoint, el uso de `SymplecticAdam` y `HuygensSymplecticAdam` mejora sustancialmente las métricas de razonamiento frente al `PairAdam` original, lo que convierte al modelo en una plataforma de comparación de optimizadores geométricos clásicos.

## Capacidades

- Generación de texto causal en inglés: completado de secuencias con coherencia local y gramática correcta, sin garantía de consistencia global ni factualidad.
- Razonamiento de sentido común y elección múltiple a nivel de modelo pequeño: obtiene 45,03 % de media macro en las 9 tareas de SLM-Bench, frente al 35,56 % del azar.
- Razonamiento matemático elemental medido por perplejidad: 9,11 en el conjunto held-out de GSM8K con el nuevo optimizador.
- Evaluación de verificación matemática en GSM8K (según la tabla de benchmarks de la model card).
- Inferencia determinista reproducible: las tres completaciones de referencia se reproducen token a token de forma idéntica en `transformers` f32, vLLM y llama.cpp.
- Servicio compatible con la API HTTP de OpenAI (`endpoints_compatible`), lo que permite integrarlo como upstream en herramientas que hablan ese protocolo.
- No dispone de tool calling, function calling, modo agente, modo thinking, visión, audio ni capacidades multimodales.
- No dispone de capacidades multilingües: solo inglés.
- No está ajustado por instrucciones ni tiene plantilla de chat.

## Casos de uso

- Integración continua sin GPU: el modelo sirve como upstream barato y siempre disponible en pipelines de CI que necesitan validar el contrato de la API de OpenAI sin consumir recursos de GPU; su tamaño de 0,1 GB en el repositorio y sus 16,7 millones de parámetros permiten ejecutarlo en cualquier runner.
- Validación de rutas de serving: permite comprobar que las rutas de vLLM, llama.cpp y `transformers` producen exactamente la misma salida token a token, gracias a las completaciones de referencia publicadas en la model card.
- Investigación sobre arquitecturas alternativas: sirve como banco de pruebas reproducible para estudiar si las cascadas de rotaciones de Givens en SO(D) pueden sustituir a las proyecciones lineales densas en transformers causales.
- Comparación de optimizadores geométricos: al publicarse el checkpoint base de NeurIPS y las variantes con `SymplecticAdam` y `HuygensSymplecticAdam`, permite reproducir la mejora de +6,40 puntos en SLM-Bench y la reducción de perplejidad en GSM8K partiendo de pesos idénticos.
- Docencia y divulgación: su tamaño reducido y su naturaleza determinista lo hacen adecuado para explicar el funcionamiento interno de un transformer causal, la tokenización BPE y el efecto del optimizador en el entrenamiento.
- Pruebas de regresión de tokenizadores y plantillas: al no tener plantilla de chat, es útil para aislar el comportamiento del tokenizador BPE de 50.000 tokens en pipelines que después usarán modelos mayores.
- Evaluación de suites de modelos pequeños: sirve como línea base en SLM-Bench y como referencia de lo que rinde un modelo de 16,7 millones de parámetros con pérdida 2,114 en tareas de elección múltiple.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre SLM-Bench, partiendo del mismo checkpoint de 16,7 millones de parámetros (10,3 millones no pertenecientes al embedding):

| Tarea (SLM-Bench) | Split (n) | Azar | Zero-shot | PairAdam (NeurIPS) | SymplecticAdam | HuygensSymplecticAdam | Ganancia vs. PairAdam |
|---|---|---:|---:|---:|---:|---:|---:|
| QNLI (nyu-mll/glue) | val (1.000) | 50,00 % | 50,50 % | 55,70 % | 74,00 % | 78,20 % | +22,50 % |
| BoolQ (google/boolq) | val (3.270) | 50,00 % | 62,17 % | 53,43 % | 62,17 % | 62,35 % | +8,92 % |
| PIQA (baber/piqa) | val (1.838) | 50,00 % | 53,97 % | 53,37 % | 53,97 % | 53,97 % | +0,60 % |
| WinoGrande (allenai/winogrande) | val (1.267) | 50,00 % | 51,93 % | 52,41 % | 52,41 % | 52,41 % | +0,48 % vs. zero-shot |
| OpenBookQA (allenai/openbookqa) | test (500) | 25,00 % | 34,20 % | 25,60 % | 36,00 % | 37,20 % | +11,60 % |
| ARC-Easy (allenai/ai2_arc) | test (2.376) | 25,00 % | 26,43 % | 26,85 % | 34,30 % | 36,70 % | +9,85 % |
| HellaSwag (Rowan/hellaswag) | val (1.000) | 25,00 % | 28,70 % | 31,80 % | 32,70 % | 32,70 % | +0,90 % |
| ARC-Challenge (allenai/ai2_arc) | test (1.172) | 25,00 % | 25,34 % | 25,43 % | 26,79 % | 27,13 % | +1,70 % |
| CommonsenseQA (tau/commonsense_qa) | val (1.221) | 20,00 % | 19,16 % | 23,10 % | 23,91 % | 24,57 % | +1,47 % |
| Media macro 9 tareas | 13.144 | 35,56 % | 39,16 % | 38,63 % | 44,03 % | 45,03 % | +6,40 % |

Resultados en GSM8K (razonamiento matemático):

| Metrica | Zero-shot | PairAdam | HuygensSymplecticAdam |
|---|---:|---:|---:|
| Perplejidad held-out | 60,12 | no disponible | 9,11 (6,60x de reducción vs. zero-shot, -27,2 % vs. PairAdam) |

La información disponible no incluye resultados en MMLU, HumanEval ni otras suites estándar de modelos grandes, ni comparaciones numéricas con modelos de tamaño similar de otros autores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,7 millones de parámetros por 4 bytes, más el vocabulario y las activaciones de 1.024 tokens), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no requiere A100 ni H100. Una RTX 4090 o una RTX 3060 lo ejecutan sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas y también en CPU sin GPU dedicada.
- Opciones de despliegue: `transformers` en float32 (ruta de referencia), vLLM y llama.cpp (ambos verificados por los autores con salida idéntica token a token), y servicio HTTP compatible con la API de OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; a este tamaño se espera un throughput muy alto y una latencia de milisegundos en GPU, sin cifras publicadas.

## Comparativa con modelos similares

No se han publicado en la información disponible comparaciones con modelos de la misma categoría. Como referencia cualitativa de la clase de tamaño, se indican alternativas de modelo pequeño con contexto y licencia conocidos, sin datos de rendimiento comparables publicados para GRT-20M:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| GRT-20M | 16,7 M | 1.024 | Apache 2.0 | safetensors, GGUF |
| Modelos de la clase ~20 M (p. ej. variantes de GPT-2 small destiladas) | no disponible | no disponible | variable | no disponible |
| Modelos de la clase ~100-150 M (p. ej. GPT-2 small, Pythia-160M) | no disponible para comparación directa | no disponible | variable | no disponible |

La comparación numérica con alternativas no está disponible en la información proporcionada; los únicos datos de referencia publicados son los de SLM-Bench y GSM8K frente al propio checkpoint base y a sus variantes de optimizador.

## Limitaciones y advertencias

- No es factual: los propios autores indican que la salida es gramatical y localmente coherente pero globalmente incorrecta; el ejemplo publicado para "The capital of France is" continúa con una repetición de "the capital of" en lugar de "Paris".
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse sobre corpus web en inglés (RefinedWeb, FineWeb-Edu, Wikipedia, entre otros) es esperable que herede sesgos de esas fuentes, aunque no se cuantifican.
- Riesgo de alucinación: muy alto por diseño; es un modelo base de 16,7 millones de parámetros con pérdida de entrenamiento 2,114, sin ajuste por instrucciones ni alineamiento.
- Limitaciones de contexto: ventana máxima de 1.024 tokens, insuficiente para la mayoría de casos de uso reales con documentos largos o conversaciones multi-turno.
- Limitaciones de idioma: solo inglés; no soporta castellano ni otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo no es apto para producción por sus limitaciones de calidad; la licencia no exime de la responsabilidad sobre las salidas.
- Sin plantilla de chat ni ajuste por instrucciones: no debe esperarse que siga instrucciones ni mantenga un rol conversacional.
- Naturaleza de research preview: el autor lo declara explícitamente como modelo de investigación, no como producto, y su propósito es demostrar la viabilidad de la arquitectura y del servicio, no resolver tareas.
- Reproducibilidad dependiente de la ruta de serving: las completaciones de referencia son idénticas en `transformers` f32, vLLM y llama.cpp según el autor, pero cualquier cambio de precisión o de backend puede alterar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-20m
- Checkpoint base archivado (pre-fine-tune, NeurIPS): https://huggingface.co/MatterWaveAI/grt-20m-base
- Repositorio GitHub del paquete oficial (proveedor MatterWave, router de modelos GRT, presets y skills para el agente de código Pi 1.0): https://github.com/MatterWaveAI/pi-package
- Suite de evaluación SLM-Bench (referenciada en la model card como `training/slm_bench.py` / `grt-slm-bench`): no disponible como enlace directo en la información proporcionada
- Paper de NeurIPS sobre `PairAdam`: no disponible como enlace en la información proporcionada
- Demos: no disponibles en la información proporcionada
