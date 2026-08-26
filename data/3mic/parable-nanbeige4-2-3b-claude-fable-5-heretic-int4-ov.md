# 3mic/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic-int4-ov

## Resumen

Este repositorio contiene la conversión a OpenVINO Intermediate Representation (IR) con cuantización INT4 del modelo `FedorFesarov/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic`, preparado por el usuario 3mic para ejecución optimizada en hardware de Intel (GPU Arc, CPU Core Ultra y NPU). El modelo original es una cadena de transformaciones que parte del modelo base Nanbeige 4.2 3B de BOSS Zhipin, pasa por un ajuste fino orientado a razonamiento y tool-calling (Claude Fable 5 de AnkitAI), y finalmente se le aplica una técnica de abliteration para suprimir rechazos, dando lugar a la variante "heretic".

El modelo resultante es un transformer con arquitectura de bucle (looped transformer) de 22 capas físicas ejecutadas dos veces por paso, lo que equivale a 44 capas lógicas, con un total de 4.17 mil millones de parámetros (3B sin embeddings) y una ventana de contexto de hasta 262 144 tokens. La versión OpenVINO INT4 reduce el tamaño en disco a 2.53 GB, lo que permite su ejecución en hardware de consumo con aceleración por GPU integrada. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (22 capas físicas, 2 loops = 44 capas lógicas) |
| Parametros totales | 4.17B (3B no-embedding) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | INT4 asimétrica (group size 128) via NNCF; el modelo base original en BF16/FP16 |
| Idiomas soportados | Inglés, chino, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (openvino_model.xml + .bin); también disponible GGUF del modelo heretic original |

## Arquitectura y entrenamiento

El modelo base Nanbeige 4.2 3B, desarrollado por BOSS Zhipin, fue preentrenado desde cero con 28 billones de tokens y emplea una arquitectura de transformer con bucle (looped transformer): las 22 capas físicas se ejecutan dos veces por paso de avance (`num_loops=2`), lo que duplica la profundidad efectiva sin duplicar los parámetros. Esta técnica permite un razonamiento más profundo con un coste computacional reducido.

Sobre esta base, AnkitAI aplicó un ajuste fino llamado Claude Fable 5, orientado a replicar el estilo de razonamiento de Claude 3.5 Sonnet, incluyendo tool-calling y formato de salida limpio. Posteriormente, Fedor Fesarov aplicó abliteration mediante la herramienta `heretic` (p-e-w/heretic), que suprime las direcciones de rechazo en el espacio de activaciones. Según la documentación, la tasa de rechazo cayó de 99/100 a 8/100 sin pérdida en GSM8K y MMLU. Finalmente, 3mic convirtió el modelo a OpenVINO IR con cuantización INT4 asimétrica (group size 128) usando Intel NNCF, optimizado para GPUs Intel Arc, CPUs Core Ultra y NPU.

## Capacidades

- Generación de texto y razonamiento multi-paso con profundidad efectiva de 44 capas lógicas.
- Soporte de tool-calling y function calling, heredado del ajuste Claude Fable 5.
- Capacidades agénticas: el modelo base Nanbeige 4.2 3B fue diseñado para tareas de agente de código, agente de oficina y uso complejo de herramientas.
- Razonamiento matemático y científico competitivo para su tamaño (según el paper de Nanbeige 4.2).
- Multilingüe: inglés, chino e italiano.
- Ventana de contexto muy amplia (262 144 tokens) para tareas de documento largo.
- Variante "heretic" con abliteration: reduce el rechazo a peticiones controvertidas, lo que la hace útil para investigación de seguridad y pruebas de comportamiento.

## Casos de uso

- Asistentes de código locales: el modelo puede integrarse en IDEs o agentes de programación para generación y explicación de código, aprovechando su tool-calling y su capacidad de razonamiento multi-paso. Su tamaño reducido permite ejecutarlo en portátiles con GPU Intel Arc.
- Automatización de tareas de oficina: gracias a su entrenamiento agéntico, puede manejar flujos de trabajo como resumen de documentos, extracción de datos y generación de informes, con una ventana de 262K tokens para procesar documentos extensos.
- Chatbots de atención al cliente en inglés, chino o italiano: el contexto largo permite mantener conversaciones multi-turno con historial completo, y la abliteration reduce respuestas evasivas en temas sensibles (aunque esto conlleva riesgos).
- Investigación en seguridad de modelos: la variante "heretic" es útil para estudiar comportamientos de modelos sin restricciones, medir tasas de rechazo y evaluar la eficacia de técnicas de abliteration.
- Despliegue en hardware Intel de bajo consumo: la cuantización INT4 y el formato OpenVINO permiten ejecutar el modelo en NPU o GPU integrada de Core Ultra, ideal para prototipos y aplicaciones edge.
- Generación de contenido creativo y narrativo: el ajuste "Fable" (fábula) sugiere una orientación hacia textos narrativos y estilizados, útil para escritura asistida o creación de guiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, HumanEval, etc.) en la información disponible para este modelo específico. El paper de Nanbeige 4.2 3B reporta resultados competitivos para su tamaño, pero no se incluyen aquí.

Sí se proporcionan mediciones de rendimiento de inferencia en Intel Arc 140T (GPU integrada del Core Ultra 7):

| Tarea | Throughput | Latencia |
|---|---|---|
| Prefill (pp128) | 520.61 tok/s | 245.9 ms |
| Decode (tg32) | 12.31 tok/s | 81.2 ms/tok |
| Tamaño en disco | 2.53 GB | — |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2.5-3 GB para el modelo INT4 (2.53 GB en disco), más overhead de runtime.
- GPU recomendadas: Intel Arc (serie A y serie B), GPU integrada Intel Arc 140T en Core Ultra 7; también compatible con CPU Intel (Core Ultra) y NPU.
- ¿Cabe en GPU de consumo? Sí, cabe en GPUs Intel Arc con 6 GB o más, y en GPUs NVIDIA con 4 GB o más (si se usa el formato GGUF del modelo heretic original).
- Opciones de despliegue: OpenVINO Runtime (Python/C++), HuggingFace Transformers con `trust_remote_code=True`, llama.cpp (mediante el GGUF del modelo heretic original), Ollama (si se publica en su biblioteca).
- Latencia y throughput: los valores medidos en Arc 140T son 520.61 tok/s en prefill y 12.31 tok/s en decode, lo que indica un rendimiento de generación moderado, adecuado para aplicaciones interactivas no en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic-int4-ov (este) | 4.17B totales (3B no-embedding) | 262 144 | INT4 (OpenVINO) | Apache 2.0 | OpenVINO IR |
| FedorFesarov/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic (original) | 4.17B totales | 262 144 | BF16/FP16 | Apache 2.0 | Safetensors |
| Nanbeige/Nanbeige4.2-3B (base) | 4.17B totales | 262 144 | BF16 | Apache 2.0 | Safetensors |
| Qwen2.5-3B (referencia) | 3B | 32 768 | BF16/INT4 | Apache 2.0 | Safetensors/GGUF |

La comparación con Qwen2.5-3B es orientativa: Nanbeige 4.2 ofrece un contexto mucho mayor y arquitectura en bucle, pero Qwen2.5 tiene un ecosistema de herramientas más maduro. No se dispone de comparativas de benchmarks directas entre ambos.

## Limitaciones y advertencias

- La abliteration reduce el rechazo a peticiones dañinas o controvertidas. Esto implica un mayor riesgo de generar contenido inapropiado, ilegal o peligroso. El modelo debe usarse con moderación y no debe desplegarse en producción sin salvaguardas adicionales (filtros de contenido, supervisión humana).
- No se han publicado evaluaciones de seguridad o sesgos para esta variante específica. El proceso de abliteration puede afectar al comportamiento en otros ejes (sesgos, alucinaciones).
- El rendimiento de generación (12.31 tok/s) es moderado; para aplicaciones de alta concurrencia se necesitaría hardware más potente o múltiples instancias.
- La ventana de 262K tokens es amplia, pero el coste de atención cuadrático puede degradar la velocidad en contextos muy largos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopción muy limitada y posible falta de pruebas comunitarias.
- El tamaño del repo se indica como 0.0 GB, lo que es inconsistente con el tamaño del modelo (2.53 GB); puede deberse a un error de metadatos.
- El modelo depende de `trust_remote_code=True` en Transformers, lo que implica ejecutar código del autor. Se recomienda auditar el código antes de usarlo en entornos sensibles.
- No hay garantía de soporte o mantenimiento por parte del autor del repositorio (3mic).

## Enlaces

- Repositorio del modelo OpenVINO INT4: https://huggingface.co/3mic/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic-int4-ov
- Modelo original "heretic" (abliterated): https://huggingface.co/FedorFesarov/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic
- Versión GGUF del modelo heretic: https://huggingface.co/FedorFesarov/Parable-Nanbeige4.2-3B-Claude-Fable-5-heretic-GGUF
- Modelo base Nanbeige 4.2 3B: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Ajuste fino Claude Fable 5: https://huggingface.co/AnkitAI/Parable-Nanbeige4.2-3B-Claude-Fable-5
- Paper de Nanbeige 4.2 3B (arXiv): https://arxiv.org/abs/2607.22083
- Herramienta de abliteration "heretic": https://github.com/p-e-w/heretic
