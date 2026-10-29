# eduardoworrel/alias3-micro-1026-ONNX

## Resumen

`eduardoworrel/alias3-micro-1026-ONNX` es la exportación a formato ONNX del modelo `aliasrobotics/alias3-micro-1026` de Alias Robotics, un modelo de lenguaje orientado a ciberseguridad cuya model card original califica los pesos como «research preview». La exportación la firma el usuario eduardoworrel y está pensada para ejecutarse en el navegador y en el edge mediante transformers.js y onnxruntime-web (WebGPU/WASM), no para servidores de inferencia convencionales.

El repositorio incluye siete variantes de precisión (fp32, fp16, q8, uint8, bnb4, q4 y q4f16) generadas con optimum y con scripts propios, porque optimum no soporta 4 bits. Además de la salida de texto habitual, los grafos exponen el estado oculto para alimentar las cabezas «System 1» descritas en el paper arXiv:2610.16550, que adapta la interfaz de pointer head bilineal de la línea Jev / System One de TypeSafe AI (pointer networks, Vinyals et al., 2015).

Su relevancia es doble: demuestra una cadena de cuantización a 4 bits reproducible para transformers.js (el fichero q4 ocupa 3,04 GB y cabe en el límite de 4 GB por fichero de los navegadores) y publica una evaluación pareada contra el modelo original en PyTorch bf16, con la conclusión de que la precisión no se degrada de forma estadísticamente significativa en el conjunto de decisión usado. El repo completo pesa 50,7 GB y acumula 1164 descargas desde su publicación el 25 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5_text`); grafo ONNX exportado con optimum (dynamo + Scan) y exportación de estado oculto |
| Parametros totales | no disponible (no publicado por el autor; el export fp16 pesa 8,42 GB y el fp32 16,83 GB) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, q8, uint8, bnb4, q4 (MatMulNBits int4 + GBQ int4 en embeddings), q4f16 (MatMulNBits con escalas fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (pesos base etiquetados como «research preview» por Alias Robotics) |
| Formato de pesos | ONNX; fp32 y fp16 en un único fichero, variantes de 4 bits con datos externos en 2 chunks de ≤ 2 GB |
| Libreria / runtime | transformers.js (`generate()`), onnxruntime, onnxruntime-genai, MLC, LiteRT.js |
| Tamano del repositorio | 50,7 GB |
| Descargas / likes | 1164 / 0 |

## Arquitectura y entrenamiento

La información disponible no documenta el entrenamiento del modelo base: no se indican número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí se describe con detalle es la arquitectura de la exportación. Se trata de un transformer decoder-only de la familia Qwen3.5 (`qwen3_5_text`), exportado a ONNX con optimum en modo dynamo y con el grafo `Scan` para el fp32, más un parche propio sobre optimum-onnx, una configuración de exportación específica y un script que añade el estado oculto como salida adicional del grafo.

La innovación técnica destacable no está en el transformer sino en la interfaz de decisión que lo acompaña. El paper arXiv:2610.16550 introduce un esquema de doble proceso (System 1 / System 2) inspirado en el marco de Kahneman, con una cabeza de decisión tipada y un pointer head bilineal que lee el estado oculto del modelo. En esta exportación, esa lectura se hace con `head.bin` (decisiones sí/no y opción múltiple) y `head_score.bin` (severidad). La cuantización se resolvió con MatMulNBits int4 para las matmul y GBQ int4 para los embeddings; los ficheros de 4 bits se partieron en chunks de 2 GB para sortear los límites de carga del navegador.

## Capacidades

- Generación de texto autoregresiva mediante `generate()` de transformers.js, con paridad funcional verificada en 24 de 24 pruebas en Chrome frente al servidor.
- Decisión tipada sobre preguntas de ciberseguridad: respuestas sí/no (65 preguntas de test), opción múltiple (57) y severidad (50), leyendo directamente los logits de los tokens Yes/No, de la opción o del dígito.
- Lectura del estado oculto por cabezas externas (`head.bin`, `head_score.bin`), que mejora la precisión frente a leer solo los logits en todas las configuraciones evaluadas.
- Clasificación de severidad exacta y con tolerancia ±1 (hasta 48/50 en tolerancia ±1 para q4f16).
- Ejecución en navegador con WebGPU y en Node, sin servidor.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión, audio, modo thinking ni cobertura multilingüe.

## Casos de uso

- Clasificación de alertas de seguridad en el navegador: el modelo responde preguntas de sí/no sobre un incidente y devuelve la decisión sin enviar datos a un servidor, lo que encaja en entornos con requisitos de confidencialidad. Los ficheros q4 (3,04 GB) y q4f16 (2,73 GB) caben en el límite de 4 GB por fichero del navegador.
- Triaje de severidad en herramientas SOC: usando `head_score.bin` como lector del estado oculto se obtiene una puntuación de severidad con tolerancia ±1 en 47-48 de 50 casos del conjunto de prueba; el autor advierte que es una prueba de concepto y que requiere un conjunto etiquetado mayor.
- Extensión de asistentes de análisis con doble proceso: el pipeline puede usar el modelo como «System 1» rápido (decisión directa desde logits) y reservar un modelo mayor como «System 2», reutilizando la interfaz de pointer head descrita en el paper.
- Herramientas de escritorio o CLI en Node: el SDK `ct0-edge` permite cargar el mismo modelo con onnxruntime-node para tareas de decisión sin infraestructura GPU dedicada.
- Investigación en cuantización: el repositorio sirve como referencia reproducible para comparar fp32, fp16, q8, uint8, bnb4, q4 y q4f16 sobre el mismo conjunto de preguntas y medir el cambio de respuesta (2,3 %–26,7 % de decisiones distintas según el fichero).
- Demos educativas de inferencia en el cliente: con una carga de 11,4 s en un Apple M2 Pro y ejecución en WebGPU, es viable montar una demo web que explique el funcionamiento de un modelo de decisión sin backend.
- Evaluación de robustez post-cuantización en CI: los tests pareados McNemar del autor pueden replicarse como suite de regresión al reexportar el modelo.

## Benchmarks y rendimiento

Conjunto de decisión del autor (onnxruntime CUDA, un prefill por pregunta). La columna «logits» lee la respuesta directamente de los logits; «head» usa la cabeza sobre el estado oculto.

| Fichero | Sí/no (65) logits | Sí/no (65) head | Opción múltiple (57) logits | Opción múltiple (57) head | Severidad (50) exacta logits | Severidad (50) exacta head | Severidad (50) ±1 head | Respuestas cambiadas vs original |
|---|---|---|---|---|---|---|---|---|
| Original (PyTorch bf16) | 54/65 | 54/65 | 39/57 | 46/57 | 20/50 | 26/50 | 47/50 | — |
| `model_q4` | 55/65 | 54/65 | 39/57 | 48/57 | 20/50 | 26/50 | 47/50 | 17,4 % |
| `model_q4f16` | 55/65 | 54/65 | 38/57 | 46/57 | 20/50 | 26/50 | 48/50 | 17,4 % |
| `model_fp16` | 54/65 | 54/65 | 38/57 | 46/57 | 20/50 | 26/50 | 47/50 | 2,3 % |
| `model` (fp32) | 54/65 | 54/65 | 38/57 | 46/57 | 20/50 | 26/50 | 47/50 | 2,3 % |
| `model_bnb4` | 55/65 | 53/65 | 44/57 | 46/57 | 20/50 | 31/50 | 45/50 | 11,6 % |
| `model_quantized` (q8) | 51/65 | 52/65 | 40/57 | 43/57 | 18/50 | 20/50 | 45/50 | 22,1 % |
| `model_uint8` | 54/65 | 53/65 | 39/57 | 39/57 | 18/50 | 22/50 | 45/50 | 26,7 % |

El autor concluye que la precisión no es estadísticamente distinguible del original (0 de 70 pruebas pareadas de McNemar significativas, antes o después de la corrección de Holm), y advierte que el conjunto de test (50-65 preguntas por modo) solo detecta pérdidas grandes. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de generación de texto en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño de fichero, no publicada por el autor): ~17-20 GB para fp32 (16,83 GB de pesos), ~10-12 GB para fp16 (8,42 GB), ~6 GB para q8/uint8 (4,22 GB) y ~4-5 GB para q4, q4f16 y bnb4 (2,73-3,04 GB) incluyendo estado de activaciones y caché KV.
- GPU de datacenter: A100 o H100 para fp32 y fp16 sin compromisos; los ficheros de 4 bits también corren en ellas pero desaprovechan memoria.
- GPU de consumo: una RTX 4090 (24 GB) mueve fp16 e incluso fp32 con holgura; una RTX 3060 de 12 GB es suficiente para fp16 y para todas las variantes de 4 bits.
- Navegador: solo q4f16 (2,73 GB), bnb4 (2,74 GB) y q4 (3,04 GB) caben por debajo del límite de 4 GB por fichero; fp16 (8,42 GB), fp32 (16,83 GB) y los q8/uint8 (4,22 GB) no cargan en navegador.
- Despliegue medido: transformers.js en Node y Chrome WebGPU, onnxruntime con CUDA, onnxruntime-genai (model builder 0.18.0), MLC (q4f32_1, q4f16_1) y LiteRT.js. No hay soporte documentado para vLLM ni TGI, que no consumen ONNX de esta forma.
- Latencia y carga medidas en Chrome WebGPU sobre Apple M2 Pro con transformers.js 4.3.1: carga de 11,4 s (q4), 11,6 s (bnb4) y 11,9 s (q4f16); tiempo por decisión de 7,4 s (q4), 7,6 s (bnb4) y 5,8 s (q4f16) en mediana por sonda. La coincidencia con el servidor fue de 394/394 decisiones en q4 y bnb4 y 390/394 en q4f16.
- No se han publicado cifras de throughput (tokens/s) para generación de texto en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `eduardoworrel/alias3-micro-1026-ONNX` (este) | no disponible | no disponible | ONNX, 7 precisiones | apache-2.0 | Enfocado a navegador y edge; expone estado oculto para cabezas System 1 |
| `aliasrobotics/alias3-micro-1026` (original) | no disponible | no disponible | PyTorch bf16 | apache-2.0 («research preview») | Referencia de precisión en la tabla del autor |
| `eduardoworrel/alias3-micro-1026-ONNX-genai` | no disponible | no disponible | ONNX para onnxruntime-genai | apache-2.0 | Misma evaluación pareada con 20 pruebas; bloque 32 del model builder |
| `eduardoworrel/alias3-micro-1026-ONNX-decode-only` | no disponible | no disponible | ONNX solo decodificación | apache-2.0 | Variante sin prefill completo; datos de rendimiento no consultados |
| `eduardoworrel/alias3-micro-1026-MLC-q4f32_1` / `-q4f16_1` | no disponible | no disponible | MLC | apache-2.0 | Alternativa de runtime para WebGPU |
| `eduardoworrel/alias3-micro-1026-LiteRT` | no disponible | no disponible | LiteRT | apache-2.0 | Alternativa de runtime para edge |

No se han publicado comparaciones contra modelos de propósito general de la misma familia (Qwen3.5) en la información disponible, por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Los pesos base están etiquetados como «research preview» por Alias Robotics; no hay garantía de robustez para producción.
- El propio autor advierte que el conjunto de evaluación (50-65 preguntas por modo) solo detecta pérdidas grandes de precisión; la equivalencia estadística con el original no prueba equivalencia en uso real.
- La cabeza de severidad `head_score.bin` se ajustó sobre 30 casos sintéticos: usarla como scorer real exige un conjunto etiquetado mayor e independiente.
- La cuantización altera entre el 2,3 % y el 26,7 % de las decisiones individuales, aunque la accuracy agregada se mantenga; q8 y uint8 son las variantes con más cambios.
- La latencia por decisión en navegador (5,8-7,6 s de mediana en un M2 Pro) es incompatible con aplicaciones interactivas en tiempo real.
- Los ficheros q8 y uint8 (4,22 GB) superan el límite práctico de 4 GB del navegador y quedan relegados a Node o servidor.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; el modelo está orientado a ciberseguridad y no se ha evaluado su comportamiento fuera de ese dominio.
- El repositorio tiene 0 likes y 1164 descargas, sin revisión comunitaria amplia; conviene validar los grafos ONNX antes de integrarlos.
- La licencia apache-2.0 permite uso comercial del artefacto, pero debe verificarse por separado la licencia y las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX
- Modelo base: https://huggingface.co/aliasrobotics/alias3-micro-1026
- Paper del modelo: https://arxiv.org/abs/2610.16550
- Pointer networks (Vinyals et al., 2015): https://arxiv.org/abs/1506.03134
- Exportación ONNX para onnxruntime-genai: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-genai
- Exportación ONNX decode-only: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-decode-only
- Exportación MLC q4f32_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f32_1
- Exportación MLC q4f16_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f16_1
- Exportación LiteRT.js: https://huggingface.co/eduardoworrel/alias3-micro-1026-LiteRT
- SDK on-device CT0 / alias3-micro-1026: https://github.com/eduardoworrel/ct0-edge
- Documentación de TypeSafe AI (línea Jev / System One): https://docs.typesafe.ai
- Ficha de registro en free2aitools: https://free2aitools.com/model/eduardoworrel/alias3-micro-1026-onnx
