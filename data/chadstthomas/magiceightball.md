# chadstthomas/MagicEightBall

## Resumen

MagicEightBall es un modelo de decisión determinista publicado por chadstthomas en Hugging Face. No es un modelo de lenguaje generativo: recibe hasta 131.072 tokens de entrada (denominados "Needle 3 tokens" en la model card), extrae evidencia en el host y devuelve tres campos estructurados: un booleano `may_route`, una `category` y una `action` propuesta. El artefacto nativo de decisión ocupa 480 bytes en su build compacto y 512 bytes en el build estándar, y está diseñado para ejecutarse en el Intel Neural Compute Stick original con chip Myriad 2 mediante OpenVINO 2020.3.2.

El modelo se distribuye como un motor de reglas empaquetado en formato propietario `.m8b`, con variantes portables en ONNX (192 bytes), GGUF (1.024 bytes) y FP32 denso (1.832 bytes). El recuento de tokens y la extracción de evidencia los realiza el host, no el modelo, de modo que la huella en el acelerador se limita a la cabeza de decisión. Esta separación entre preprocesado en CPU y decisión en hardware especializado es la innovación principal del proyecto.

Su relevancia actual es acotada pero específica: demuestra que es posible ejecutar políticas de decisión auditables en aceleradores de borde con presupuestos de memoria de cientos de bytes, algo relevante para sistemas empotrados, clasificación de tickets de soporte y enrutado determinista donde un LLM sería sobredimensionado. La licencia dual MIT y Apache 2.0 permite uso comercial, aunque el modelo solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de decisión basado en reglas con cabeza de decisión compilada (no es un transformer); variantes con Gather radix, tabla de búsqueda, diagrama de decisión binario y compuertas booleanas |
| Parámetros totales | no disponible (el artefacto nativo compacto ocupa 480 bytes; el denso de referencia 1.832 bytes; el tokenizador compartido suma hasta 24.111 bytes en conjunto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens de entrada (Needle 3 tokens); una petición que supere 131.073 tokens se rechaza y preserva el estado previo del documento |
| Tipos de cuantizacion | FP16 en el build nativo para NCS1; FP32 en la variante densa de referencia; INT8 no documentado |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT y Apache 2.0 (dual, declarada como `other` con nombre `mit-and-apache-2.0`) |
| Formato de pesos | `.m8b` propietario (nativo NCS1), ONNX, GGUF, FP32 denso |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer ni un esquema de aprendizaje profundo convencional. Se describe como un motor de decisión (`decision-model`, `rule-engine`) con múltiples implementaciones del mismo policy: un build nativo compacto de 480 bytes, un build radix Gather de 512 bytes, una convolución empaquetada de 1.536 bytes, una tabla de búsqueda de 1.728 bytes, compuertas booleanas de 3.776 bytes y una referencia densa de 4.480 bytes en el gráfico nativo (1.832 bytes en la variante FP32 portable). Todas las variantes comparten tokenizador y extracción de evidencia en el host.

No se documenta ningún proceso de entrenamiento, número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. El comportamiento se define mediante la política de soporte publicada en `support.json`, con tres campos de salida (`may_route`, `category`, `action`) y reglas explícitas como veto tardío ("Do not route") o abstención cuando falta evidencia. La innovación técnica destacable es la separación entre el conteo de tokens y la extracción de evidencia en el host y la ejecución de la cabeza de decisión en el acelerador Myriad 2, con soporte de streaming incremental mediante `--stream` y de lotes mediante `--serve`.

## Capacidades

- Clasificación binaria de decisión (`may_route`: verdadero o falso) sobre documentos de hasta 131.072 tokens.
- Asignación de categoría (`category`) y propuesta de acción (`action`), ambas anulables cuando no hay evidencia suficiente.
- Abstención explícita: ante entradas sin evidencia relevante devuelve `false`, `null`, `null`.
- Veto tardío: una instrucción posterior en el documento puede anular una propuesta previa de acción.
- Procesamiento por streaming: acepta fragmentos incrementales con `{"append": "..."}` y rechaza apéndices que superen el límite sin perder el estado anterior.
- Procesamiento por lotes: modo `--serve` que acepta una línea JSON con un array `documents`.
- Ejecución en hardware de borde: build nativo para Intel NCS1 con Myriad 2 y OpenVINO 2020.3.2.
- Ejecución portable en CPU: variantes ONNX, GGUF y FP32 con lectores incluidos.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modo thinking; sus capacidades se limitan al contrato de tres campos descrito.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto completo del ticket y devuelve una categoría (`billing`, por ejemplo) y una acción propuesta (`review_billing`), lo que permite derivar automáticamente casos de facturación sin intervención humana y con latencias de milisegundos.
- Veto de acciones automáticas: en un pipeline donde un sistema propone reembolsos o cargos, una instrucción explícita de anulación en el documento devuelve `may_route = false` y `action = null`, bloqueando la ejecución antes de que llegue a producción.
- Abstención ante ambigüedad: cuando el documento no contiene evidencia suficiente, el modelo devuelve todos los campos vacíos, lo que permite encolar el caso para revisión humana en lugar de forzar una clasificación errónea.
- Despliegue en dispositivos empotrados sin conectividad: el build de 480 bytes cabe en el Intel NCS1 y no requiere GPU ni acceso a red, adecuado para kioscos, terminales de punto de venta o equipos industriales con clasificación local de incidencias.
- Auditoría y cumplimiento: al ser un motor de reglas determinista con política publicada en `support.json`, cada decisión es reproducible y verificable, lo que facilita auditorías regulatorias en sectores como banca o seguros.
- Filtrado previo en pipelines LLM: el modelo puede actuar como primera etapa de cribado sobre documentos largos (hasta 131.072 tokens) para decidir si merece la pena invocar un modelo generativo más costoso, reduciendo el gasto en inferencia.
- Clasificación por lotes en CPU: la variante ONNX o GGUF con lector propio permite procesar lotes de documentos en servidores sin acelerador, con latencias p50 de 3,8 a 4,6 ms para decisiones cortas según las mediciones del autor.

## Benchmarks y rendimiento

El autor publica mediciones de latencia sobre un host Intel Core i7-12650H con Windows, con 31 repeticiones calentadas por carga de trabajo. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

| Backend | Artefacto de decisión | 128 decisiones cortas, p50 / p95 | Autorización fresca de 131.072 tokens, p50 / p95 |
|---|---:|---:|---:|
| NCS1 físico, una petición | Ejecutable nativo de 512 bytes | 6,43 / 10,73 ms | 44,24 / 55,55 ms |
| OpenVINO CPU, Gather equivalente | ONNX fuente de 258 bytes | 3,91 / 5,99 ms | 44,25 / 55,24 ms |
| Intérprete booleano CPU | Política fuente de 714 bytes | 4,57 / 8,26 ms | 39,26 / 49,48 ms |
| Búsqueda en tabla CPU | Tabla generada de 128 bytes | 3,82 / 6,95 ms | 37,63 / 50,03 ms |
| Diagrama de decisión CPU | Diagrama generado de 46 bytes | 4,03 / 7,37 ms | 37,92 / 52,50 ms |

El autor informa de que el release superó las 128 asignaciones de la política de soporte en un NCS1 físico, incluyendo fixtures de contexto completo, un veto tardío y el rechazo a 131.073 tokens.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU. La huella es de 480 bytes (build compacto nativo) o hasta 1.832 bytes (referencia densa FP32), más el tokenizador compartido que eleva el conjunto a 24.111 bytes.
- Acelerador recomendado: Intel Neural Compute Stick original con chip Myriad 2, gestionado mediante OpenVINO 2020.3.2.
- Entorno para NCS1: Windows con toolchain NCS1, Python 3.7, NumPy y SentencePiece 0.1.99.
- Ejecución en CPU: cualquier CPU x86 moderna; las mediciones del autor usan un Intel Core i7-12650H.
- Cabe en GPU consumer: no aplica, no hay backend GPU documentado.
- Opciones de despliegue: runtime propio `runtime.py` con modos `--serve` y `--stream`; variantes ONNX Runtime en CPU, GGUF con lector CPU incluido y FP32 denso de referencia.
- Latencia: entre 3,82 y 6,43 ms en p50 para decisiones cortas y entre 37,63 y 44,25 ms en p50 para autorizaciones de contexto completo, según backend.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del artefacto | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| MagicEightBall | Motor de decisión con reglas | 480–1.832 bytes (nativo/portable) | 131.072 tokens | MIT y Apache 2.0 | Hugging Face, variantes ONNX, GGUF y FP32 |
| Bonsai | Modelo de ranking de búsqueda | 300 bytes | no disponible | no disponible | Publicación PMLR |
| FastGRNN | Modelo de wake-word | 1 KB | no disponible | no disponible | Publicación NeurIPS |
| fastText.zip | Clasificador de texto | 16 KiB | no disponible | no disponible | arXiv 1612.03651 |

Los tres comparables proceden de publicaciones académicas y tienen cargas de trabajo distintas; la comparación de tamaños es orientativa y no implica equivalencia funcional. No se dispone de comparación con LLMs porque el modelo no compite en esa categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- El modelo no genera texto libre ni razona: devuelve únicamente tres campos estructurados según una política fija, por lo que no sirve para tareas generativas.
- La calidad de la decisión depende por completo de la extracción de evidencia en el host y de la política `support.json`; el modelo no aprende ni se adapta a nuevos dominios sin recompilar la política.
- El límite de 131.072 tokens es estricto: un apéndice que lo supere se rechaza, aunque se preserva el estado previo del documento.
- El build nativo requiere un toolchain antiguo (OpenVINO 2020.3.2, Python 3.7, SentencePiece 0.1.99) y hardware Intel NCS1, lo que limita su mantenimiento a largo plazo.
- No se documentan sesgos, pero al ser un motor de reglas hereda los sesgos codificados explícitamente en la política de soporte.
- El riesgo de alucinación es nulo por diseño, pero existe riesgo de clasificación errónea si la evidencia extraída no coincide con la intención del documento.
- La licencia dual MIT y Apache 2.0 permite uso comercial, pero conviene revisar el archivo `LICENSE` del repositorio para confirmar las condiciones exactas de cada componente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni validación externa conocida; el modelo debe considerarse experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chadstthomas/MagicEightBall
- Variante ONNX: https://huggingface.co/chadstthomas/MagicEightBall-ONNX
- Variante FP32: https://huggingface.co/chadstthomas/MagicEightBall-FP32
- Variante GGUF: https://huggingface.co/chadstthomas/MagicEightBall-GGUF
- Guía de configuración MyriadForge: https://github.com/chadstthomas-svg/myriadforge/blob/main/docs/NCS1_ROADMAP.md
- Paper de Bonsai: https://proceedings.mlr.press/v70/kumar17a/kumar17a.pdf
- Paper de FastGRNN: https://proceedings.neurips.cc/paper_files/paper/2018/file/ab013ca67cf2d50796b0c11d1b8bc95d-Paper.pdf
- Paper de fastText.zip: https://arxiv.org/pdf/1612.03651#page=7
- Inspiración de movimiento citada: https://huggingface.co/spaces/huggingface/moe-blogpost
