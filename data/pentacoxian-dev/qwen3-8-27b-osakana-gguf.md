# pentacoxian-dev/Qwen3.8-27B-OSAKANA-GGUF

## Resumen

Qwen3.8-27B-OSAKANA-GGUF es un paquete de pesos en formato GGUF preparado por el usuario pentacoxian-dev para ejecutar el modelo Qwen3.8-27B sobre el motor de inferencia OSAKANA, un runtime propio desarrollado por el mismo autor. No se trata de un modelo entrenado desde cero, sino de una conversión no oficial de los pesos comprimidos de yasakani-dev/Qwen3.8-27B-YASAKANI-speed, que a su vez derivan del modelo base Qwen/Qwen3.8-27B de Alibaba Cloud. El paquete incluye el modelo principal con pesos en formato trellis de 3 bits (4 bits en la cabeza de salida), un modelo borrador DFlash2 para decodificación especulativa y una cabeza de shortlist auxiliar.

La propuesta técnica es ambiciosa: servir un modelo nominal de 27B con una ventana de contexto de 262.144 tokens en una única GPU de consumo, en concreto una RTX 5090, consumiendo aproximadamente 26,8 GiB de VRAM. Para lograrlo combina tres piezas: compresión agresiva de pesos mediante códigos trellis YASAKANI, atención dispersa Qwen Sparse Attention (QSA) con 16 indexadores recalibrados para contexto largo, y decodificación especulativa con un borrador afinado para bloques de 16 tokens y borradores en árbol.

Es relevante ahora porque demuestra una vía práctica para llevar contexto ultra-largo a hardware de gama alta de consumo, a costa de depender de un motor no estándar: llama.cpp convencional no puede cargar el modelo principal, ya que sus matrices se almacenan en dos tipos de tensor propietarios (YTR3 e YTR4) que solo lee OSAKANA. El repositorio tiene 13,1 GB, licencia Apache-2.0 y, en el momento de la consulta, cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con atención dispersa QSA; pesos en códigos trellis YASAKANI |
| Parametros totales | 1.924.404.480 según safetensors del repo; el nombre comercial indica 27B (no disponible la cifra exacta de parámetros del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Pesos principales en trellis de 3 bits (cabeza de salida a 4 bits); borrador DFlash2 en IQ4_XS; cabeza shortlist en int8 con sketch de rango 512 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con tipos de tensor propietarios YTR3 e YTR4 (no cargable en llama.cpp estándar); fichero auxiliar .ysh |

## Arquitectura y entrenamiento

El modelo principal no ha sido reentrenado ni recuantizado por el autor de esta conversión: son las matrices de yasakani-dev/Qwen3.8-27B-YASAKANI-speed con sus códigos trellis originales (3 bits por peso, 4 en la cabeza de salida), reempaquetadas para los kernels del motor OSAKANA. Sobre esa base se añadieron 80 tensores de indexación QSA correspondientes a 16 indexadores, recalibrados para contexto largo. La conversión elimina el proyector de visión y la cabeza MTP del modelo original, por lo que no hay capacidades multimodales ni predicción multi-token nativa en este paquete.

El sistema de inferencia se completa con dos artefactos. El primero es un modelo borrador DFlash2 para Qwen3.8-27B, afinado por el autor para bloques de 16 tokens y para borradores en árbol, cuantizado a IQ4_XS, que habilita decodificación especulativa. El segundo es una cabeza de shortlist que combina un sketch de rango 512 con una copia int8 de la cabeza de salida del modelo principal, y que el borrador usa para localizar sus tokens candidatos. La atención dispersa QSA puede desactivarse con la variable de entorno LLAMA_QSA_DENSE=1 para recuperar atención densa cuando prima la recall exacta sobre la velocidad. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre las fases de RLHF o DPO aplicadas.

## Capacidades

- Generación de texto conversacional y de prosa larga, con decodificación codiciosa validada en las pruebas del autor.
- Generación y edición de código: las tareas de code edit y JSONL edit son las que más se benefician de la decodificación especulativa.
- Producción de salida estructurada (structured output) y edición de ficheros JSONL de gran tamaño.
- Traducción automática dentro de flujos con contexto largo.
- Recuperación de información en contextos muy extensos mediante atención dispersa: 234 aciertos sobre 240 en 8K, 232 en 64K, 211 en 128K y 177 en 192K.
- Razonamiento multi-turno apoyado en ventanas de 262K tokens.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio y modo thinking: no disponibles; el proyector de visión y la cabeza MTP fueron eliminados en esta conversión.

## Casos de uso

- Edición de código sobre repositorios completos: el modelo puede recibir un dossier de código fuente de hasta 224K tokens y aplicar modificaciones puntuales; en las pruebas del autor alcanza 1.654 tokens/s en code edit con 224K de entrada, frente a 591 del motor YASAKANI, lo que lo hace adecuado para refactorizaciones masivas por lotes.
- Mantenimiento de ficheros JSONL de gran tamaño: con 1.457 tokens/s a 224K en long JSONL edit, permite reescribir registros estructurados de forma consistente sin trocear el fichero.
- Análisis de documentación técnica extensa: la ventana de 262K tokens admite manuales, especificaciones o informes completos en una sola pasada, con atención dispersa para mantener el throughput.
- Traducción de documentos largos manteniendo coherencia terminológica: 284 tokens/s a 224K en la tarea de traducción, suficiente para procesar corpus por capítulos con contexto compartido.
- Generación de salida estructurada en pipelines de datos: 520 tokens/s a 224K en structured output, útil para extracción de campos y validación de esquemas en procesos automatizados.
- Búsqueda y recuperación sobre registros casi idénticos: los 234/240 aciertos a 8K y 211/240 a 128K lo hacen viable para localizar la entrada correcta en bases documentales con duplicados, activando LLAMA_QSA_DENSE=1 si se requiere recall máximo.
- Asistente conversacional de contexto largo en local: con 26,8 GiB de VRAM en una RTX 5090, permite desplegar un servicio OpenAI-compatible en 127.0.0.1:8091 sin depender de la nube.

## Benchmarks y rendimiento

El autor publica velocidad de decodificación en tokens por segundo sobre una RTX 5090 con decodificación codiciosa, comparando YASAKANI y OSAKANA con contexto vacío y con 224K tokens de entrada. Cada cifra corresponde a una sola ejecución; el autor advierte que diferencias de pocos puntos porcentuales son ruido.

| Tarea | YASAKANI, vacío | OSAKANA, vacío | YASAKANI, 224K | OSAKANA, 224K |
|---|---:|---:|---:|---:|
| Code | 526 | 503 | 369 | 384 |
| Story | 259 | 201 | 146 | 166 |
| Translation | 405 | 354 | 229 | 284 |
| Structured output | 966 | 842 | 444 | 520 |
| Code edit | 1.098 | 1.902 | 591 | 1.654 |
| JSONL edit | 730 | 2.007 | 400 | 1.693 |
| Long JSONL edit | 676 | 1.602 | 402 | 1.457 |

Calidad frente al original en BF16, sobre texto de evaluación propio (8 fragmentos de 2.048 tokens):

| Métrica | Prosa | Código |
|---|---:|---:|
| Divergencia KL | 0,057 | 0,212 |
| Acuerdo top-1 | 90,9% | 89,1% |

Recall en contexto largo con atención dispersa (240 preguntas sobre registros casi idénticos): 234 aciertos a 8K, 232 a 64K, 211 a 128K y 177 a 192K. La atención densa sobre otros pesos del mismo modelo base obtuvo 222 aciertos tanto a 128K como a 192K. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 26,8 GiB para el conjunto completo con contexto de 262K, según la medición del autor.
- GPU validada: RTX 5090, única tarjeta sobre la que se han publicado mediciones.
- GPU recomendadas: no disponible para otros modelos; por capacidad de memoria, serían necesarias tarjetas con al menos 27-32 GB (A100 40GB, H100, RTX 5090) o configuraciones multi-GPU no documentadas.
- Cabe en GPU de consumo: sí, en RTX 5090; no hay datos para RTX 4090 (24 GB), que quedaría por debajo de los 26,8 GiB indicados.
- Opciones de despliegue: exclusivamente el motor OSAKANA (repositorio pentaCoxian/OSAKANA), con script deploy/osakana/serve.sh y API compatible con OpenAI en 127.0.0.1:8091. llama.cpp estándar no puede cargar el modelo principal; vLLM, TGI y Ollama no están soportados según la información disponible.
- Throughput: entre 166 y 1.693 tokens/s a 224K de contexto según la tarea, y entre 201 y 2.007 tokens/s con contexto vacío.
- Latencia: no disponible de forma desagregada (solo velocidad de decodificación).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-OSAKANA-GGUF | 27B (1.924.404.480 según safetensors) | 262K | GGUF propietario (YTR3/YTR4) + OSAKANA | Apache-2.0 | 0 descargas, conversión no oficial |
| yasakani-dev/Qwen3.8-27B-YASAKANI-speed | 27B | No disponible | Pesos trellis YASAKANI | Apache-2.0 | Modelo de origen de esta conversión |
| higa2515/Qwen3.8-27B-QSA-GGUF | 27B | No disponible | GGUF con QSA | No disponible | Origen de los indexadores QSA |
| Qwen/Qwen3.8-27B | 27B | No disponible | Pesos originales (BF16) | Apache-2.0 | Modelo base oficial |

La comparación de rendimiento solo está publicada frente a YASAKANI: OSAKANA es más lento en contexto vacío en cinco de las siete tareas, pero claramente más rápido en code edit, JSONL edit y long JSONL edit, y superior en contexto largo en todas las tareas medidas. No hay datos de benchmarks de calidad frente a otros modelos de 27B.

## Limitaciones y advertencias

- Dependencia total del motor OSAKANA: llama.cpp estándar no carga el modelo principal por los tipos de tensor YTR3 e YTR4; esto limita la portabilidad y ata el despliegue al mantenimiento de un runtime de un solo autor.
- Conversión no oficial y sin afiliación con YASAKANI, Qwen, Alibaba Cloud, z-lab ni Inco AI, según declara el propio autor.
- Sin tracción verificable: cero descargas y cero likes en el momento de la consulta, y mediciones realizadas únicamente en una RTX 5090 con una sola ejecución por cifra.
- Pérdida de capacidades respecto al modelo base: se eliminan el proyector de visión y la cabeza MTP, por lo que no hay entrada multimodal ni predicción multi-token.
- Degradación medible de calidad por la compresión: divergencia KL de 0,212 en código frente a 0,057 en prosa, con acuerdo top-1 del 89,1% y 90,9% respectivamente.
- Recall decreciente en contexto largo: cae de 234/240 a 8K hasta 177/240 a 192K con atención dispersa; la atención densa mejora la recall a 128K y 192K (222/240) a costa de velocidad.
- Riesgo de alucinación: no evaluado en la información disponible; aplicable el riesgo habitual de los modelos de lenguaje, agravado por la compresión de pesos.
- Idiomas soportados no documentados, lo que impide garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- Licencia Apache-2.0 permite uso comercial, pero la viabilidad práctica depende de un motor cuyo soporte y hoja de ruta no se detallan.
- Ficheros con hash SHA-256 publicado: conviene verificarlos antes de desplegar, dado el carácter no oficial de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pentacoxian-dev/Qwen3.8-27B-OSAKANA-GGUF
- Motor OSAKANA: https://github.com/pentaCoxian/OSAKANA
- Modelo de pesos de origen: https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-speed
- Motor YASAKANI: https://github.com/yasakani-dev/yasakani
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Indexadores QSA de referencia: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Modelo borrador DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
