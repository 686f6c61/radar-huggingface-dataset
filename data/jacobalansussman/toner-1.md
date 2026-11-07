# jacobalansussman/TONER-1

## Resumen

TONER-1 es un modelo de lenguaje de 260.032 parámetros desarrollado por jacobalansussman como una fine-tuning de `stories260K`, el modelo de juguete de Andrej Karpathy dentro del proyecto llama2.c. Su particularidad no es la calidad del texto que genera, sino el soporte de ejecución: los pesos se han cuantizado a int8 y se han empaquetado junto con un intérprete de inferencia escrito en PostScript dentro de un único archivo de 595.372 bytes. Enviado en crudo a una impresora PostScript, el propio procesador de la impresora ejecuta el forward pass, muestrea tokens y compone una historia infantil sobre impresoras en una página US Letter.

El modelo se entrenó sobre 8.757 historias cortas infantiles centradas en impresoras, derivadas del dataset TinyStories y de un dataset propio (`jacobalansussman/TONER-1-printer-stories`). La arquitectura es la de llama2.c: un transformer decoder-only con tokenizer SentencePiece de 512 piezas, sin atención con ventana deslizante ni innovaciones tipo MoE. La longitud de contexto efectiva es mínima (el modelo base está pensado para secuencias cortas) y el idioma es únicamente inglés.

El proyecto es explícitamente una parodia de los lanzamientos de modelos frontera: el autor declara que las historias son salida real del modelo, pero que los "benchmarks" no son evaluaciones reales. Resulta relevante como pieza de ingeniería creativa y como demostración de que la inferencia de un transformer cabe en un intérprete PostScript Level 2, no como herramienta de producción. Existe un hermano mayor, TONER-1-Pro, de 12,2 M de parámetros y tokenizer propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (llama2.c, `stories260K`) |
| Parametros totales | 260.032 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo base entrenado en secuencias cortas; ventana efectiva muy reducida) |
| Tipos de cuantizacion | int8 con una escala por fila (para el print job); float32 en `model.safetensors` |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) y PostScript embebido (int8 dentro del print job) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `stories260K` de llama2.c: un transformer decoder-only con atención multi-cabeza, capas feed-forward y normalización RMSNorm, dimensionado para caber en el rango de cientos de miles de parámetros. El tokenizer es el SentencePiece `tok512.model` de Karpathy, con un vocabulario de 512 piezas. No hay innovaciones de atención (nada de atención lineal, decodificación especulativa ni SSM): es un transformer denso clásico.

El entrenamiento consistió en una fine-tuning del checkpoint base sobre 8.757 historias cortas infantiles sobre impresoras, compuestas a partir de TinyStories (`roneneldan/TinyStories`) y del dataset propio `jacobalansussman/TONER-1-printer-stories`. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO (en un modelo de este tamaño y propósito es improbable que se aplicaran). La innovación técnica destacable no está en el entrenamiento sino en el despliegue: la exportación a int8 con una escala por fila y la reimplementación del forward pass en PostScript, empaquetada con los pesos y la maquetación de página en un único archivo.

## Capacidades

- Generación de texto narrativo corto en inglés, específicamente historias infantiles sobre impresoras.
- Muestreo con temperatura configurable (`TEMP`, por defecto 0,8) y modo greedy (`TEMP=0`).
- Semilla configurable (`SEED`, por defecto 42) para reproducibilidad dentro de un mismo intérprete.
- Límite de tokens configurable (`STEPS`, por defecto 200).
- Ejecución de inferencia en el propio intérprete PostScript de la impresora, sin FLOPs en el host.
- Uso alternativo de los pesos float32 en Python mediante `model.py` de llama2.c.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Demostración de ingeniería creativa: enviar el print job a una impresora PostScript propia para ilustrar que un transformer puede ejecutarse en un intérprete de impresión; útil en charlas, talleres y artículos divulgativos sobre inferencia en hardware inesperado.
- Docencia sobre cuantización int8: el archivo incluye pesos int8 con una escala por fila y el código de dequantización en PostScript, lo que permite estudiar el esquema de cuantización en un caso mínimo y legible.
- Estudio de portabilidad de intérpretes: comparar la salida byte a byte entre Ghostscript y una impresora física (el autor documenta que a semilla 42 la historia del HP fue idéntica a la de Ghostscript salvo por los CRLF) sirve para analizar cómo `rand` es dependiente de la implementación.
- Prototipado de arte generativo impreso: usar el print job como pieza de arte o instalación donde cada impresión produce una historia distinta según la semilla.
- Referencia para implementaciones mínimas de llama2.c: el código PostScript de ~100 líneas y los pesos float32 sirven como ejemplo didáctico de un forward pass completo en un lenguaje no convencional.
- Pruebas de robustez de impresoras: el job estresa el intérprete PostScript (uso de VM, timeouts, fuentes estándar) y puede usarse para verificar el cumplimiento de Level 2 en equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los "benchmarks" del proyecto son parodia y no evaluaciones reales.

Los únicos datos de rendimiento medidos son de ejecución, no de calidad:

| Entorno | Tokens | Tiempo | Throughput |
|---|---|---|---|
| HP Color LaserJet Pro MFP M281fdw (impresora física) | 200 | 217,235 s (3:37) | 0,92 tok/s |
| Ghostscript 10.07.1 (Apple M4, render a PDF) | 200 | no disponible | 82,3 tok/s |

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; los pesos float32 ocupan aproximadamente 1 MB (260.032 parámetros × 4 bytes) y la versión int8 alrededor de 260 KB más escalas.
- GPU recomendadas: no aplica; el modelo no requiere GPU ni en su variante PostScript ni en la de Python.
- Cabe en cualquier GPU consumer e incluso en CPU; también en impresoras PostScript Level 2 o superior.
- Opciones de despliegue: impresora PostScript (raw TCP puerto 9100 o CUPS con `-o raw`), Ghostscript para previsualización, o `model.py` de llama2.c con PyTorch y SentencePiece para uso en Python.
- Memoria del intérprete: Ghostscript consume unos 3,3 MB de VM al escribir un PDF y 7,5 MB al renderizar a PNG; una impresora puede agotar su VM o el timeout de job en ejecuciones largas.
- Latencia y throughput: 0,92 tok/s en la HP M281fdw y 82,3 tok/s en Ghostscript sobre Apple M4; no se emite papel hasta que la historia termina.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato de ejecución | Disponibilidad |
|---|---|---|---|---|---|
| TONER-1 | 260.032 | no disponible | MIT | PostScript (int8) y safetensors (float32) | Hugging Face |
| karpathy/tinyllamas (stories260K) | 260.032 | no disponible | MIT (según el repo base) | safetensors / llama2.c | Hugging Face |
| TONER-1-Pro | 12,2 M | no disponible | no disponible | no disponible | Hugging Face (repo propio) |

La comparación con modelos de la misma categoría (transformer de juguete) se limita al checkpoint base y al hermano mayor del propio autor. No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de juguete: 260.032 parámetros y vocabulario de 512 piezas; la calidad del texto es la de TinyStories, no la de un modelo de propósito general.
- Solo genera historias infantiles sobre impresoras; no es útil para tareas de código, matemáticas, razonamiento o diálogo.
- Riesgo de alucinación alto en cualquier tema fuera de su distribución de entrenamiento; el propio autor reconoce que los "benchmarks" son parodia.
- Idioma limitado a inglés; no hay soporte multilingüe.
- `rand` en PostScript es dependiente de la implementación: distintas impresoras o intérpretes pueden producir historias diferentes con la misma semilla.
- Requiere un intérprete PostScript Level 2 o superior; impresoras PCL o GDI imprimirán el archivo como páginas de texto.
- Riesgo operativo: jobs largos pueden agotar la VM del intérprete o el timeout de la impresora; no sale papel hasta terminar.
- Licencia MIT, por lo que el uso comercial está permitido, pero el modelo no es adecuado para producción real.
- El autor advierte de enviar el print job solo a impresoras propias o con permiso explícito.
- El proyecto es una parodia; conviene no confundir sus afirmaciones de marketing con resultados técnicos verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jacobalansussman/TONER-1
- TONER-1-Pro: https://huggingface.co/jacobalansussman/TONER-1-Pro
- TONER-1-V: https://huggingface.co/jacobalansussman/TONER-1-V
- Repositorio GitHub con logs de la ejecución en impresora: https://github.com/jacobalansussman/toner-1/tree/main/docs/printer-run-2026-11-05
- Modelo base karpathy/tinyllamas: https://huggingface.co/karpathy/tinyllamas
- `model.py` de llama2.c: https://github.com/karpathy/llama2.c/blob/master/model.py
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset TONER-1-printer-stories: https://huggingface.co/datasets/jacobalansussman/TONER-1-printer-stories
- Paper de TinyStories (arXiv:2305.07759): https://arxiv.org/abs/2305.07759
