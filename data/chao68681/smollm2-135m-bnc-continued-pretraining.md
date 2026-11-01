# chao68681/smollm2-135m-bnc-continued-pretraining

## Resumen

Este modelo es una adaptación por continued pretraining de SmolLM2-135M, el modelo base compacto de HuggingFace, realizada por el usuario chao68681. El entrenamiento adicional se ha llevado a cabo sobre el corpus BNC1994 (British National Corpus, edición 1994), un corpus de inglés británico compuesto por 4.049 documentos XML (3.885 de entrenamiento tras eliminar duplicados exactos). El resultado es un modelo de lenguaje causal de próxima palabra, no un asistente instruido, especializado en la distribución estadística del inglés británico de los años noventa.

El problema que aborda es la especialización de un modelo pequeño en un dominio lingüístico concreto: la variante británica del inglés con rasgos diacrónicos. El proyecto tiene un marcado carácter educativo y experimental: incluye un cuaderno completo de reproducción, historial de entrenamiento, configuración de ejecución y resultados medidos. Es relevante como ejemplo documentado de continued pretraining a pequeña escala, ejecutado íntegramente en una única GPU T4 de Colab.

Arquitectura y tamaño: se trata de un transformer decoder-only de la familia Llama con 134.515.008 parámetros (verificados en los safetensors), entrenado en tres épocas lógicas completas (23.631 actualizaciones lógicas totales, checkpoint publicado en la actualización 22.877). La longitud de contexto utilizada en el entrenamiento principal fue de 512 tokens, con experimentos complementarios a 1024 y 2048 tokens que no superaron al modelo seleccionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama, causal LM) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 512 tokens en el entrenamiento principal (experimentos complementarios a 1024 y 2048) |
| Tipos de cuantizacion | no disponible (solo pesos FP32 publicados) |
| Idiomas soportados | Inglés (con sesgo hacia inglés británico del corpus BNC1994) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM2-135M (revisión `93efa2f097d58c2a74874c7e644dbc9b0cee75a2`), un transformer decoder-only de arquitectura Llama, y somete todos sus parámetros a continued pretraining (full-parameter, sin congelar capas). Los datos de entrenamiento provienen del archivo BNC1994 de Oxford Text Archive: 4.049 documentos XML, de los que se eliminaron tres duplicados exactos, con una división fija por grupos de origen de 3.885 documentos de entrenamiento, 84 de validación y 77 de test (semilla 42). Cada pasada de entrenamiento incluye 127.787.903 objetivos supervisados; los fragmentos dentro de cada documento se solapan en un token, se enmascaran las primeras etiquetas y el padding, se supervisa el token EOS y los documentos no se concatenan entre sí.

El régimen de entrenamiento constó de tres épocas lógicas completas: 7.877 actualizaciones cada una, 23.631 actualizaciones lógicas en total, con un checkpoint publicado en la actualización 22.877 (paso 15.000 de la continuación), seleccionado por la menor NLL de validación completa elegible y no por los pesos finales. Se usó una única T4 por runtime de Colab, batch efectivo de 32 secuencias, parámetros en FP32 con autocast FP16, AdamW fusionado, weight decay 0,01 y clipping 1,0. La época 1 empleó un LR pico de 5e-5 con 3 % de warmup (semilla 42); las épocas 2 y 3 usaron un schedule coseno continuo con LR pico 1e-5 y 2 % de warmup (semilla 43). Se realizaron validaciones completas cada 500 actualizaciones de continuación y en cada frontera de época. Como innovación metodológica destacable, el proyecto incluye comparaciones independientes con contextos de 1024 y 2048 tokens (dos épocas completas cada una), que no mejoraron al modelo de 512 en la validación compartida, y un protocolo de recuperación por replay de actualizaciones tras pérdidas de runtime.

## Capacidades

- Generacion de texto autoregresiva en inglés, modelando la distribución del corpus BNC1994 (inglés británico de los años noventa).
- Modelado de lenguaje causal de próxima palabra: es un modelo base, no un asistente instruido ni alineado.
- Perplejidad mejorada respecto al modelo base sobre los splits de validación y test de BNC1994 (reducción del 13 %), lo que lo hace útil para tareas de evaluación de lenguaje sobre textos británicos de esa época.
- No está diseñado para razonamiento, seguimiento de instrucciones, código, matemáticas ni respuestas conversacionales; la propia model card advierte que la mejora de perplejidad no implica mejores capacidades generales.
- Sin soporte documentado de tool calling, function calling, agentes, visión ni audio.
- Sin capacidades multilingües documentadas: el entrenamiento se limita al inglés.

## Casos de uso

- Investigación en lingüística computacional sobre inglés británico: el modelo captura la distribución léxica y sintáctica del BNC1994, útil como línea base para estudios de variación diacrónica o comparación de variedades del inglés.
- Experimentos de continued pretraining educativos: el repositorio incluye un cuaderno completo de reproducción, configuración de ejecución e historial, ideal para aprender el flujo completo (extracción de corpus, entrenamiento, recuperación, evaluación y publicación).
- Generacion de texto con estilo británico de los años noventa: puede completar textos con vocabulario y.register propios de esa época, útil para recreación estilística o análisis de plausibilidad de textos históricos.
- Evaluación de perplejidad sobre textos británicos: como modelo especializado, sirve de referencia para medir perplejidad con el protocolo de 512 tokens documentado en el repositorio.
- Punto de partida para fine-tuning posterior: al ser un modelo base compacto (134,5 M de parámetros), es adecuado para experimentos de SFT o DPO a bajo coste computacional.
- Pruebas de despliegue y benchmarking en hardware modesto: su tamaño reducido lo hace idóneo para validar pipelines de inferencia en CPUs o GPUs de consumo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a la evaluación de perplejidad sobre los splits propios del corpus BNC1994, con un protocolo de 512 tokens por documento:

| Split | NLL (base) | PPL (base) | NLL (modelo) | PPL (modelo) | Cambio PPL |
|---|---:|---:|---:|---:|---:|
| Validacion | 3,252213 | 25,8475 | 3,112411 | 22,4752 | -13,05 % |
| Test | 3,179929 | 24,0450 | 3,039538 | 20,8956 | -13,10 % |

La validación cubre 84 documentos (2.391.296 objetivos) y el test 77 documentos (2.669.143 objetivos). La propia model card advierte que el split de test fue evaluado en etapas anteriores y no se afirma que esté intacto, y que el solapamiento del pretraining original de SmolLM2 con BNC es desconocido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 134,5 M de parámetros en FP32, unos 0,54 GB de pesos; en FP16, unos 0,27 GB. Es plenamente operable en CPUs modernas y en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: ninguna GPU de gama alta es necesaria; el entrenamiento completo se realizó en una única NVIDIA T4 (16 GB) de Colab. Para inferencia basta una RTX 3050, una integrada o incluso CPU.
- Consumer GPU: cabe con holgura en cualquier GPU de consumo actual, incluidas las de gama de entrada.
- Opciones de despliegue: transformers (librería nativa, con ejemplo de uso en la model card); por su arquitectura Llama y formato safetensors, es compatible con llama.cpp (tras conversión a GGUF), Ollama, vLLM y TGI, aunque el repositorio no documenta ninguna de estas rutas explícitamente.
- Latencia y throughput estimados: no disponibles; por su tamaño, se espera generación en tiempo real incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| SmolLM2-135M (base) | 134,5 M | 8192 tokens | General (11 billones de tokens) | Apache 2.0 |
| SmolLM2-135M-Instruct | 134,5 M | 8192 tokens | Instrucciones y chat | Apache 2.0 |
| smollm2-135m-bnc-continued-pretraining | 134,5 M | 512 tokens (entrenamiento) | Ingles britanico (BNC1994) | Apache 2.0 |

Frente a su modelo base, esta versión mejora la perplejidad en el dominio BNC1994 en torno a un 13 %, pero reduce el contexto de entrenamiento a 512 tokens y no conserva (ni pretende) las capacidades generales de los modelos base o instruct de la familia SmolLM2. Es una especialización de nicho, no un competidor generalista.

## Limitaciones y advertencias

- Riesgo de alucinacion alto: al ser un modelo base de solo 134,5 M de parámetros sin alineación, genera texto potencialmente inexacto, sesgado o memorizado del corpus, según advierte la propia model card.
- Sesgo temporal y dialectal: BNC1994 refleja una distribución histórica del inglés británico; el modelo no representa el inglés contemporáneo ni otras variedades.
- No apto como asistente: no sigue instrucciones ni está optimizado para respuestas útiles; la perplejidad agregada no garantiza calidad de salida.
- Contexto corto: el modelo publicado se entrenó con secuencias de 512 tokens; los experimentos a 1024 y 2048 tokens no se publicaron como modelo principal.
- Solapamiento de datos desconocido: no se sabe si el pretraining original de SmolLM2 incluyó BNC, lo que podría inflar las métricas de evaluación.
- El split de test fue evaluado previamente y no se garantiza su independencia; la selección de checkpoint se basó solo en validación.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero el corpus BNC1994 no se redistribuye con el modelo y requiere obtener una copia legítima para reproducir el entrenamiento.
- No existe un registro completo de costes en GPU-horas del desarrollo, y el proceso incluyó múltiples reinicios y recuperaciones que complican la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chao68681/smollm2-135m-bnc-continued-pretraining
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Cuaderno de entrenamiento (incluido en el repositorio): ./BNC_T4_Continued_Pretraining.ipynb
- Resultados medidos: ./results.json
- Configuracion de ejecucion: ./run_config.json
- Historial de entrenamiento: ./training_history.json
- Corpus BNC1994 (Oxford Text Archive): https://llds.ling-phil.ox.ac.uk/llds/xmlui/handle/20.500.14106/2554
