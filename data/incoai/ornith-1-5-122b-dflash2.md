# incoai/Ornith-1.5-122B-DFlash2

## Resumen

Ornith-1.5-122B-DFlash2 es un modelo borrador (*draft model*) para decodificación especulativa, publicado por Inco AI (usuario `incoai` en HuggingFace) y diseñado exclusivamente para acelerar la inferencia de `ornith-ai/Ornith-1.5-122B`. No es un modelo de lenguaje autónomo: su función es proponer bloques de tokens que el modelo objetivo verifica después, de modo que la salida final sea idéntica a la del modelo grande. El repositorio lo declara explícitamente con `inference: false`.

La innovación técnica es DFlash 2, un borrador de difusión por bloques (*block diffusion*) que predice un bloque completo de tokens en una sola pasada manteniendo los mejores candidatos en cada posición; un selector ligero traza después una trayectoria coherente entre ellos. Incorpora convoluciones dinámicas de dos tomas (*two-tap*) en el backbone para evitar la degradación de la calidad del borrador hacia el final del bloque. El resultado es una decodificación sin pérdida: en modo greedy la salida coincide exactamente con la del modelo objetivo y, en muestreo, preserva su distribución.

El modelo tiene 930.278.912 parámetros (unos 930 M) según los safetensors reales, aunque su nombre incluya "122B" porque hace referencia al modelo objetivo al que acompaña. Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y un tamaño de repositorio de 1,9 GB. Su relevancia es práctica: en las pruebas publicadas multiplica por 2,27×–2,65× el throughput de un solo request en tareas de razonamiento y código, y hasta 2,98× con concurrencia 32 en GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de difusion por bloques (*block diffusion drafter*) con convoluciones dinamicas de dos tomas y selector de trayectoria de candidatos; se ejecuta junto a un transformer objetivo (etiqueta `qwen3` en los metadatos) |
| Parametros totales | 930.278.912 (aprox. 930 M) |
| Parametros activos | No aplica: el modelo no declara variante MoE; el sufijo "122B" del nombre corresponde al modelo objetivo `ornith-ai/Ornith-1.5-122B` |
| Longitud de contexto | No disponible (depende del modelo objetivo; la model card no declara ventana) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; los 1,9 GB del repositorio son coherentes con fp16/bf16 (930 M x 2 bytes) |
| Idiomas soportados | No disponible (hereda las capacidades del modelo objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

DFlash 2 es un borrador de difusión por bloques: en lugar de generar tokens de uno en uno de forma autorregresiva, predice un bloque completo en una sola pasada y conserva los mejores candidatos en cada posición del bloque. Un selector ligero recorre esos candidatos y traza una única trayectoria coherente, que es la que se envía a verificación. El backbone incorpora convoluciones dinámicas de dos tomas para corregir la pérdida de calidad que sufre el borrador conforme avanza el bloque, un problema habitual en los drafters paralelos. El bloque de especulación configurado en la evaluación es de 16 tokens, es decir, 15 tokens propuestos por cada paso de verificación.

La decodificación es sin pérdida: con decodificación greedy la salida coincide exactamente con la del modelo objetivo y con muestreo se preserva la distribución del objetivo. Esto significa que el borrador no altera la calidad ni el comportamiento del modelo grande, solo su velocidad. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card remite al blog de Inco AI y al paper original de DFlash (Chen, Liang y Liu, ICML 2026) para los detalles metodológicos.

## Capacidades

- Generación de tokens de borrador para verificación por el modelo objetivo: no produce respuestas finales por sí mismo.
- Decodificación especulativa sin pérdida: preserva exactamente la salida greedy y la distribución de muestreo del modelo objetivo.
- Propuesta de bloques paralelos de hasta 16 tokens por paso de verificación (15 tokens de borrador + verificación).
- Selector de trayectoria de candidatos para mantener coherencia dentro del bloque.
- Integración con SGLang 0.5.21 mediante `--speculative-algorithm DFLASH`.
- Rendimiento diferencial según tarea: mayor aceptación en matemáticas y código que en conversación abierta.
- Razonamiento, código y matemáticas: heredados del modelo objetivo (la evaluación se hizo con *thinking* activado, temperatura 0.6, top-p 0.95 y top-k 20).
- Soporte de tool calling, agentes, multilingüismo y modalidades adicionales: no disponibles como capacidades propias del borrador; dependen íntegramente de Ornith-1.5-122B.

## Casos de uso

- Aceleración de servicios de razonamiento matemático: con 9,20 tokens aceptados por paso en MATH-500 y 2,65× de speedup a concurrencia 1, reduce la latencia percibida en asistentes de resolución de problemas paso a paso.
- Generación de código en producción: HumanEval alcanza 8,64 tokens aceptados y 2,53× de speedup a concurrencia 1 (2,49× a concurrencia 32), lo que se traduce en menor coste por token generado en pipelines de autocompletado o revisión de código.
- Despliegue de un asistente conversacional sobre Ornith-1.5-122B: en MT-Bench el beneficio es más moderado (5,41 tokens aceptados, 1,34× a concurrencia 1), pero sigue reduciendo el tiempo hasta el primer token completo en chats multi-turno.
- Serving por lotes en GPUs Blackwell: con concurrencia 32 y 4.811 tok/s en HumanEval frente a 1.930,6 tok/s en modo autorregresivo, es adecuado para procesar colas de generación de documentación técnica o tests.
- Reducción de coste de infraestructura: al multiplicar el throughput por 1,17×–2,98× según tarea y concurrencia, permite atender el mismo volumen de peticiones con menos réplicas del modelo de 122B.
- Evaluación comparativa de técnicas de decodificación especulativa: al ser un drafter de referencia para Ornith-1.5-122B, sirve como base para medir aceptación y speedup frente a borradores autorregresivos en un mismo hardware.
- Investigación en decodificación sin pérdida: útil para estudiar el equilibrio entre tamaño de bloque, tasa de aceptación y coherencia en la cola del bloque con modelos objetivos de gran escala.

## Benchmarks y rendimiento

Longitud de aceptación (media por petición de tokens de completion dividida por pasos de verificación, concurrencia 1; mayor es mejor). Bloque de especulación de 16 tokens; 128 muestras por tarea; máximo 4.096 tokens nuevos.

| Tarea | DFlash 2 |
| :--- | ---: |
| GSM8K | 8,33 |
| MATH-500 | 9,20 |
| HumanEval | 8,64 |
| MBPP | 6,37 |
| MT-Bench | 5,41 |

Throughput en tokens de salida por segundo (speedup frente a autorregresivo entre paréntesis):

| Tarea | Autorregresivo (c=1) | DFlash 2 (c=1) | Autorregresivo (c=8) | DFlash 2 (c=8) | Autorregresivo (c=32) | DFlash 2 (c=32) |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| GSM8K | 257,9 | 585,5 (2,27×) | 994,8 | 1.866,8 (1,88×) | 1.358,5 | 4.043,1 (2,98×) |
| MATH-500 | 265,8 | 705,5 (2,65×) | 1.020,0 | 2.378,4 (2,33×) | 1.845,4 | 4.440,1 (2,41×) |
| HumanEval | 265,2 | 672,1 (2,53×) | 1.076,3 | 2.295,0 (2,13×) | 1.930,6 | 4.811,0 (2,49×) |
| MBPP | 262,4 | 519,4 (1,98×) | 984,1 | 1.562,3 (1,59×) | 1.570,7 | 3.124,7 (1,99×) |
| MT-Bench | 265,0 | 355,0 (1,34×) | 1.001,9 | 1.173,5 (1,17×) | 1.691,6 | 2.287,1 (1,35×) |

Entorno de medida declarado: SGLang 0.5.21 sobre dos GPU NVIDIA GB300 (TP2), TensorRT-LLM para la atención del modelo objetivo y FlashAttention 4 para la atención del borrador. No se publican resultados de benchmarks de calidad (MMLU, HumanEval como métrica de acierto, GSM8K como exactitud) del modelo objetivo en esta información.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 1,9 GB en fp16/bf16 (930 M de parámetros), más el pequeño estado asociado al bloque de 16 tokens; es una fracción mínima frente a los pesos del modelo objetivo de 122B.
- VRAM total del sistema: dominada por Ornith-1.5-122B (no se detalla en la información disponible); la configuración de referencia usa dos NVIDIA GB300 con tensor parallelism 2.
- GPUs probadas: 2× NVIDIA GB300. La configuración depende de TensorRT-LLM para la atención del objetivo y de FlashAttention 4 para el borrador, lo que limita la validación a hardware Blackwell; no hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: el borrador por sí solo cabría en cualquier GPU consumer con más de 2 GB de VRAM, pero el modelo objetivo de 122B no cabe en una RTX 4090; no se ha validado el par en hardware consumer.
- Opciones de despliegue: SGLang 0.5.21 con `--speculative-algorithm DFLASH`, `--speculative-draft-model-path incoai/Ornith-1.5-122B-DFlash2` y `--speculative-num-draft-tokens 16`. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI; al no haber pesos GGUF, llama.cpp y Ollama no son opciones viables con el material publicado.
- Throughput medido: 355,0–705,5 tok/s a concurrencia 1 y 1.173,5–4.811,0 tok/s a concurrencia 32, según tarea.
- Latencia: no se publican métricas de TTFT ni de latencia por token; solo throughput agregado y longitud de aceptación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Rendimiento publicado | Licencia | Disponibilidad |
| :--- | ---: | :--- | :--- | :--- | :--- | :--- |
| Ornith-1.5-122B-DFlash2 | 930 M | No disponible | Difusion por bloques, bloque de 16, sin perdida | Aceptacion 5,41–9,20; speedup 1,17×–2,98× | Apache 2.0 | HuggingFace, requiere SGLang |
| DFlash 1 (paper ICML 2026) | No disponible | No disponible | Difusion por bloques (version original) | No disponible en esta informacion | No disponible | Repositorio `z-lab/dflash` |
| Borradores autorregresivos tipo EAGLE-3 / Medusa | No disponible | No disponible | Prediccion token a token o cabezas multiples | No disponible en esta informacion | No disponible | Multiples implementaciones |
| Sin decodificacion especulativa (Ornith-1.5-122B autorregresivo) | 122 B (objetivo) | No disponible | Transformer autorregresivo | 257,9–1.930,6 tok/s segun tarea y concurrencia | No disponible en esta informacion | HuggingFace |

La comparación cuantitativa solo puede establecerse contra la línea base autorregresiva, porque es la única alternativa con cifras en la información proporcionada. Frente a DFlash 1, la model card únicamente indica que DFlash 2 "mantiene el borrado en paralelo" y añade el selector de trayectoria y las convoluciones de dos tomas.

## Limitaciones y advertencias

- No es un modelo autónomo: el repositorio declara `inference: false` y no puede generar respuestas sin el modelo objetivo `ornith-ai/Ornith-1.5-122B`.
- Dependencia de infraestructura muy concreta: SGLang 0.5.21, `--speculative-algorithm DFLASH` y backends de atención específicos (TensorRT-LLM y FlashAttention 4). No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama.
- Validación limitada a 2× NVIDIA GB300: no se han publicado resultados en A100, H100 ni GPUs de consumo, por lo que el rendimiento en otras plataformas es desconocido.
- Beneficio desigual por tarea: el speedup cae a 1,17×–1,35× en MT-Bench, donde la aceptación es de 5,41 tokens por paso frente a 9,20 en MATH-500. En conversación abierta la ganancia es modesta.
- Idiomas y sesgos: no disponibles. Al heredar el comportamiento del modelo objetivo, cualquier sesgo, limitación idiomática o riesgo de alucinación de Ornith-1.5-122B se mantiene intacto, ya que la decodificación es sin pérdida.
- Riesgo de alucinación: no es aplicable al borrador por separado; la salida verificada es la del objetivo. No obstante, un borrador con baja aceptación no degrada la calidad, solo el rendimiento.
- Licencia Apache 2.0: permisiva para uso comercial, pero el modelo objetivo puede tener condiciones distintas que es necesario verificar por separado.
- Los resultados de benchmarks corresponden a una configuración de muestreo concreta (temperatura 0,6, top-p 0,95, top-k 20, thinking activado, 4.096 tokens nuevos, 128 muestras); variar estos parámetros altera la longitud de aceptación.
- Cifras de adopción muy bajas (117 descargas, 12 likes) y modelo reciente (publicado en octubre de 2026): ecosistema y validación comunitaria aún escasos.
- Los resultados de la búsqueda web proporcionada no contienen información relevante sobre este modelo; todas las afirmaciones de esta ficha proceden de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Modelo objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- SGLang: https://github.com/sgl-project/sglang
- Cita DFlash 2: Inco AI, "DFlash 2: Keep Drafting Parallel", agosto de 2026, https://inco.ai/blog/dflash2/
- Cita DFlash original: Chen, Liang y Liu, "DFlash: Block Diffusion for Flash Speculative Decoding", ICML 2026
- Los resultados de busqueda web suministrados no aportan enlaces adicionales relevantes (devuelven paginas genericas sobre ChatGPT).
