# myssss/fontgpt-v1

## Resumen
FontGPT v1 es un modelo generativo especializado en tipografía desarrollado por el usuario myssss y publicado en Hugging Face. Se trata de un transformer decoder-only de 176,4 millones de parámetros que genera contornos de glifos tipográficos representándolos como un trazado de pluma (pen walk) sobre una rejilla de 1/128 de em. El modelo resuelve el problema de la generación automática de fuentes: dado un conjunto de glifos de una fuente, continúa dibujando los glifos restantes manteniendo el estilo, o bien genera una fuente nueva desde cero.

La innovación principal reside en la representación: cada contorno se traza mediante movimientos de pluma discretizados y comprimidos con 512 fusiones BPE (vocabulario de 526 tokens), lo que permite modelar la geometría vectorial como una secuencia de texto. Cada secuencia de entrenamiento contiene hasta 16 glifos de una misma fuente, cada uno condicionado por su carácter, de modo que el modelo aprende a preservar la identidad estilística entre glifos consecutivos.

Este checkpoint es una versión de decaimiento temprano: el entrenamiento estaba planificado para 26.900 pasos pero se recortó a 6.749, con tasa de aprendizaje constante hasta el paso 4.500 y decaimiento lineal hasta cero en el 6.749. Es relevante ahora como prueba de concepto de generación de fuentes autoregresiva, aunque su calidad dista de la de un modelo completamente entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, U-Net skips, attention gates, 3 tablas de value-embedding y 8 bandas de pen-start |
| Parámetros totales | 176,4 M (16 capas, anchura 768, 12 cabezas, dim. de cabeza 64) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.560 tokens (hasta 16 glifos por secuencia) |
| Tipos de cuantización | no disponible (pesos en PyTorch `.pt`) |
| Idiomas soportados | no disponible (el modelo opera sobre caracteres y trazados, no sobre texto natural) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | PyTorch (`.pt`), sin estado del optimizador |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de 16 capas con anchura 768 y 12 cabezas de atención (dimensión de cabeza 64). Emplea MLP SwiGLU, conexiones skip tipo U-Net, puertas de atención (attention gates), tres tablas de embedding de valores y ocho bandas de inicio de pluma. La salida es una secuencia de movimientos de pluma sobre una rejilla de 1/128 de em, comprimida con 512 fusiones BPE sobre un vocabulario de 526 tokens.

El entrenamiento utilizó el optimizador NorMuon para las matrices (weight decay 0,1, cautious) y AdamW para el resto, con atención XSA y meta-gradiente 0,4. El lote era de 262.144 tokens con padding por actualización, aproximadamente 119.000 tokens reales o 1.510 glifos. El schedule constó de 200 pasos de calentamiento, tasa constante hasta el paso 4.500 y decaimiento lineal hasta el 6.749, totalizando unos 0,80 mil millones de tokens reales. Se aplicó dropout de 0,1 y se descartó la etiqueta de identidad de fuente (source label) el 90 % de las veces, de modo que el modelo aprende principalmente a partir de los glifos ya dibujados. Los datos provienen de 16 archivos de fuentes de contorno: aproximadamente 30.000 fuentes y 3,56 millones de glifos de entrenamiento, con reparto realizado de Google Fonts (37 %), DVF (38 %), pools (24 %) y otras libres (2 %). Las familias de diseño reservadas en `heldout_v1.json` nunca se entrenaron. El entrenamiento se completó en una sola GPU en aproximadamente 1,5 horas.

## Capacidades
- Generación de contornos de glifos tipográficos como trazados de pluma vectoriales.
- Continuación de estilo: dado un conjunto de glifos de una fuente, genera los glifos restantes manteniendo la identidad estilística.
- Generación de fuentes nuevas desde cero (sin condicionamiento).
- Condicionamiento por carácter: cada glifo se genera a partir de su etiqueta de carácter.
- Cebado (priming) desde un banco de glifos `.hand.parquet` para continuar una fuente a partir de algunos de sus glifos.
- Exportación a SVG y PNG con relleno de contornos mediante regla par-impar (even-odd).
- Control de muestreo mediante temperatura (por defecto 0,6), top-k, modo greedy y semilla.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido convencional.

## Casos de uso
- Generación de fuentes nuevas: el modelo puede crear una fuente completa a partir de una lista de caracteres separados por espacios, útil para diseñadores que necesitan prototipos rápidos de tipografía.
- Extensión de fuentes existentes: dado un conjunto parcial de glifos de una fuente, el modelo continúa dibujando los caracteres restantes manteniendo el estilo, lo que permite completar familias tipográficas incompletas.
- Exploración estilística: variando la temperatura y la semilla se pueden generar múltiples interpretaciones de un mismo conjunto de caracteres para evaluar direcciones de diseño.
- Automatización de pipelines de diseño tipográfico: la salida en SVG permite integrar los glifos generados en herramientas de edición vectorial o en flujos de producción de fuentes.
- Investigación en representación geométrica: el enfoque de pen walk con BPE sobre movimientos sirve como base para estudiar la modelización de geometría vectorial con transformers.
- Docencia y experimentación: al ejecutarse en CPU (unos 30 s por glifo en 4 núcleos) y requerir solo PyTorch, NumPy, Pillow, PyArrow y Pandas, es accesible para entornos educativos sin GPU.
- Pruebas de concepto de continuación de estilo: el modo `--prime` permite evaluar la capacidad del modelo para inferir el estilo de una fuente a partir de solo 6 glifos.

## Benchmarks y rendimiento
El autor publica métricas de evaluación propias: `unseen-6` (nats por glifo para dibujar un glifo de una familia reservada tras 6 glifos de esa fuente; menor es mejor) y `test loss` (nats por token sobre glifos reservados de las fuentes de entrenamiento).

| Paso | unseen-6 (nats/glifo) | test loss (nats/token) |
|---|---|---|
| 1.500 | 155,30 | 1,9029 |
| 3.000 | 150,86 | 1,8452 |
| 4.500 | 148,93 | 1,8110 |
| 6.000 | 140,77 | 1,6877 |
| 6.749 (final) | 135,42 (6.014 glifos) | 1,6079 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no está orientado a tareas de lenguaje natural.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 176,4 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,7 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor indica que funciona "mucho más rápido" en GPU que en CPU.
- CPU: funciona en CPU a unos 30 s por glifo en 4 núcleos, más lento cuando se usa cebado (priming).
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: el repositorio incluye `generate.py` para inferencia directa con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 30 s por glifo en CPU con 4 núcleos; no se especifican cifras para GPU.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables de generación de fuentes tipográficas en la documentación proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FontGPT v1 | 176,4 M | 2.560 tokens (16 glifos) | other | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Checkpoint de decaimiento temprano: el entrenamiento se recortó de 26.900 a 6.749 pasos, por lo que la calidad es inferior a la de un modelo completamente entrenado.
- Los samples incluidos son una "prueba de humo" (smoke test) que verifica que cada glifo dibuja tinta, no evidencia de calidad o novedad.
- El pipeline de datos para convertir archivos TTF/OTF en bancos `.hand.parquet` no está incluido, lo que limita el uso con fuentes propias.
- La licencia es "other" sin detalle explícito, por lo que se debe consultar al autor antes de un uso comercial.
- No hay información sobre sesgos, riesgo de alucinación en el sentido convencional ni limitaciones idiomáticas, ya que el modelo no procesa lenguaje natural.
- El modelo puede generar contornos vacíos o inválidos en algunos glifos; el autor recomienda verificar que cada glifo solicitado produzca tinta.
- No se especifican restricciones de uso comercial más allá de la licencia "other".

## Enlaces
- Hugging Face: https://huggingface.co/myssss/fontgpt-v1
