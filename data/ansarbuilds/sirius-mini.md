# ansarbuilds/Sirius-Mini

## Resumen

Sirius-Mini (publicado en el repositorio como Sirius-Tiny-ONNX) es un clasificador de texto ligero desarrollado por el usuario ansarbuilds. Su tarea es detectar la deriva de atención (focus drift) de un usuario: dado un objetivo breve y una traza de ventanas o pestañas abiertas, clasifica la ventana activa en tres categorías: `ON_TASK`, `BORDERLINE` o `RABBIT_HOLE`. Está pensado para ejecutarse en local, sin conexión y sobre CPU, en el contexto de herramientas de productividad o seguimiento de foco.

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, un transformer BERT de 22,7 millones de parámetros, que se ha afinado como cross-encoder para esta tarea de clasificación y se ha exportado a ONNX con cuantización int8. El resultado ocupa 21,99 MB y presenta una latencia en CPU de 5,34 ms en p50 y 98,26 ms en p95 en caliente.

Su relevancia radica en el binomio tamaño/latencia: permite clasificación en tiempo real de ventanas activas en un portátil convencional sin GPU, con métricas publicadas sobre un conjunto de test bloqueado (SiriusBench) y una evaluación en condiciones reales sobre macOS. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (cross-encoder) derivado de all-MiniLM-L6-v2 |
| Parametros totales | 22,7 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 160 tokens (truncación usada en el ejemplo de inferencia) |
| Tipos de cuantizacion | int8 (ONNX cuantizado); pesos PyTorch originales también referenciados |
| Idiomas soportados | no disponible (la model card no los especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_quantized.onnx`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

Se trata de un cross-encoder basado en BERT de 22,7 millones de parámetros, heredado de `sentence-transformers/all-MiniLM-L6-v2`. La entrada combina el objetivo del usuario y la traza de ventanas en un único texto separado por el token `[SEP]`, con el formato `objetivo [SEP] NOW: app | titulo | dominio [SEP] PREV1: ...`. La salida es una distribución de tres clases (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`) sobre la que se aplica un umbral de decisión de 0,71 para la clase `RABBIT_HOLE`, ajustado exclusivamente sobre el split `dev` de SiriusBench.

El entrenamiento se realizó en tres rondas sobre GPUs NVIDIA en RunPod: 100.000 filas sintéticas en la ronda 1 (generadas con `factory.py`), un pool de 500.000 filas para minería de negativos duros (`mine_hard_negatives.py`) y 31.660 filas de la ronda 3 destiladas a partir de probabilidades soft-label del modelo profesor `Qwen/Qwen3-32B-AWQ` (`distill_teacher.py`). El autor declara que no se emplearon salidas propietarias de OpenAI, Anthropic ni Google/Gemma. La innovación principal no es arquitectónica sino de despliegue: exportación a ONNX con cuantización int8 manteniendo un 93,8 % de acuerdo con la versión PyTorch.

## Capacidades

- Clasificación de texto en tres clases (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`) orientada a la detección de deriva de foco.
- Procesamiento de trazas de 1 a 4 ventanas o pestañas normalizadas en formato `app | title | domain`.
- Inferencia offline en CPU con latencia de milisegundos (p50 de 5,34 ms).
- Manejo de ventanas utilitarias (gestores de contraseñas, calculadora, correo con 2FA) sin falsos positivos según la evaluación publicada.
- Distinción entre trabajo legítimo en plataformas de ocio (YouTube, Reddit, GitHub) y consumo de contenido de evasión.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; es un clasificador puro.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Seguimiento de foco en escritorio: una aplicación de productividad envía el objetivo activo y la ventana en primer plano al clasificador y, si la salida es `RABBIT_HOLE` con probabilidad superior al umbral, muestra un aviso discreto. La latencia sub-10 ms permite evaluar cada cambio de ventana sin afectar a la experiencia.
- Bloqueo o filtrado de pestañas de evasión: un gestor de pestañas o extensión de navegador puede consultar al modelo antes de permitir la apertura de contenido clasificado como tangente, usando el historial de 1-4 ventanas para detectar derivas graduales.
- Informes de productividad personales: registrar las clasificaciones a lo largo de la jornada para generar estadísticas de tiempo `ON_TASK` frente a `RABBIT_HOLE`, con la ventaja de que todo el procesamiento es local y no requiere enviar títulos de ventanas a la nube.
- Herramientas de bienestar digital: integrar el clasificador en aplicaciones de control de hábitos para detectar patrones de deriva (por ejemplo, derivas a lo largo de cuatro saltos) y sugerir pausas, apoyándose en el 100 % de precisión reportado en la rebanada de deriva gradual.
- Asistentes de escritura o entornos de desarrollo: filtrar ventanas irrelevantes antes de alimentar un asistente con contexto, reduciendo ruido en el prompt y evitando que contenido de ocio contamine el contexto.
- Investigación sobre atención y TDAH: el modelo y el conjunto SiriusBench permiten reproducir experimentos de clasificación de deriva de foco con un coste computacional mínimo, sirviendo como línea base ligera frente a clasificadores de mayor tamaño.
- Despliegue en dispositivos de bajos recursos: al ser un ONNX int8 de 21,99 MB, puede embeberse en aplicaciones de escritorio o incluso en entornos con CPU limitada donde un modelo mayor no cabría.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test bloqueado de SiriusBench (364 trazas no vistas) y sobre la evaluación real en macOS (300 trazas etiquetadas a mano):

| Metrica | Valor |
|---|---|
| Precision global de `RABBIT_HOLE` (umbral 0,71) | 95,8 % |
| Recall global de `RABBIT_HOLE` | 88,5 % |
| Exactitud global de 3 clases | 87,1 % |
| Slice A: trampas con la misma palabra clave (precisión RH) | 90,5 % |
| Slice B: derivas graduales de 4 saltos (precisión RH) | 100,0 % |
| Slice C: tasa de falsa alarma en ventanas utilitarias | 0,0 % |
| Slice D: trabajo legítimo en YouTube/Reddit/GitHub (precisión RH) | 100,0 % |
| Tamano del ONNX int8 | 21,99 MB |
| Acuerdo PyTorch frente a ONNX int8 | 93,8 % |
| Latencia en CPU en caliente (p50 / p95) | 5,34 ms / 98,26 ms |
| Evaluación real macOS: slice YouTube y Reddit (21 trazas) | 95,0 % precisión / 100,0 % recall |
| Evaluación real macOS: falsas alarmas en ventanas utilitarias | 0,0 % |
| Evaluación real macOS: avisos falsos por 2 horas | 3,16 (objetivo del gate: ≤ 1,00) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU con ONNX Runtime.
- GPU recomendadas: no aplica; cualquier GPU es innecesaria para este tamaño.
- Cabe en cualquier CPU moderna de consumo; el ONNX int8 ocupa 21,99 MB en disco y una fracción similar en memoria.
- Opciones de despliegue: ONNX Runtime (Python y otros bindings), con tokenizador de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un clasificador de este tamaño.
- Latencia: 5,34 ms en p50 y 98,26 ms en p95 en caliente sobre CPU; el p95 alto sugiere variabilidad en entornos con carga o arranque en frío.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros clasificadores de deriva de foco. Como referencia estructural, el modelo hereda de `sentence-transformers/all-MiniLM-L6-v2` (22,7 M de parámetros, licencia Apache 2.0, orientado a embeddings y búsqueda semántica), pero no existe en la información proporcionada una comparación de rendimiento entre ambos ni con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sirius-Mini (Sirius-Tiny-ONNX) | 22,7 M | 160 tokens | Clasificación de deriva de foco (3 clases) | Apache 2.0 | Hugging Face |
| all-MiniLM-L6-v2 | 22,7 M | no disponible | Embeddings de frases | Apache 2.0 | Hugging Face |
| Alternativas de clasificación de foco | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (clasificación de deriva de foco) y no sirve para generación de texto, código, matemáticas ni razonamiento general.
- La ventana de contexto es de 160 tokens; trazas más largas o títulos muy extensos se truncan y pueden degradar la clasificación.
- El umbral de 0,71 está ajustado sobre el split `dev` de SiriusBench; en dominios distintos puede requerir recalibración.
- La evaluación real en macOS reporta 3,16 avisos falsos por cada 2 horas, por encima del objetivo de ≤ 1,00 declarado por el autor, lo que indica que el sistema de decisión completo puede ser intrusivo en producción.
- El acuerdo entre PyTorch y ONNX int8 es del 93,8 %, por lo que la cuantización introduce discrepancias en aproximadamente 1 de cada 16 casos.
- El p95 de latencia (98,26 ms) es notablemente superior al p50 (5,34 ms), lo que puede afectar a aplicaciones con requisitos estrictos de tiempo real.
- No se documentan los idiomas soportados; el entrenamiento se describe en inglés y no hay evidencia de comportamiento multilingüe.
- Los datos de entrenamiento son mayoritariamente sintéticos y destilados de un modelo profesor; pueden heredar sesgos de ese profesor y presentar un rendimiento inferior en dominios no representados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en casos límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ansarbuilds/Sirius-Mini
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo profesor citado: https://huggingface.co/Qwen/Qwen3-32B-AWQ
- Repositorio de código, paper o demo: no disponible en la información proporcionada.
