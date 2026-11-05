# LooNuH/loom-wav2vec2-ja-onnx

## Resumen

`loom-wav2vec2-ja-onnx` es una exportación a ONNX del modelo `jonatasgrosman/wav2vec2-large-xlsr-53-japanese`, un wav2vec2-large XLSR-53 afinado para reconocimiento de habla en japonés por Jonatas Grosman. La exportación la publica el usuario LooNuH como parte del reproductor de música Loom, y no modifica los pesos: solo envuelve el grafo para que el dispositivo reciba muestras de audio en bruto a 16 kHz y devuelva log-probabilidades CTC.

Su propósito no es la transcripción libre, sino el *forced alignment* (alineamiento forzado) de letras de canciones que la aplicación ya conoce: dado el texto y la grabación, el modelo calcula en qué milisegundo empieza y termina cada palabra. Esto permite sincronizar la letra con la reproducción sin depender de servicios en la nube.

El modelo es relevante por su empaquetado: elimina el preprocesado en Python (normalización de media cero y varianza unitaria incluida en el grafo) y aplica `log_softmax` sobre los logits CTC, de modo que puede ejecutarse con ONNX Runtime en dispositivos locales. Se distribuye en fp32 y en int8 con cuantización dinámica de los pesos MatMul, esta última con un factor de tiempo real de 0,56 frente a 3,39 del fp32 en CPU de Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large XLSR-53 (transformer convolucional + encoder, cabeza CTC) |
| Parametros totales | no disponible (el modelo base wav2vec2-large ronda los 300 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio por inferencia no especificada) |
| Tipos de cuantizacion | fp32 (`model.onnx`) e int8 dinamica en pesos MatMul con activaciones fp32 (`model_int8.onnx`) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), exportado con torch 2.15.0 |

Otros datos tecnicos: entrada `input_values` de forma `[1, samples]` en float32 a 16 kHz mono; salida `log_probs` de forma `[1, frames, 2341]`, con un frame cada 20 ms. El vocabulario `vocab.json` es el original, con `<pad>` como blank CTC y `|` como delimitador de palabra. Tamano del repositorio: 1,6 GB.

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2-large XLSR-53 de Meta AI: un extractor de características convolucional que convierte audio en bruto en representaciones latentes cada 20 ms, seguido de un encoder transformer y una cabeza de clasificación CTC con 2341 tokens. El modelo original fue preentrenado con XLSR-53 (habla multilingüe de 53 idiomas) y después afinado por Jonatas Grosman para japonés, tarea para la que se publicó en 2021.

La exportación no reentrena ni modifica los pesos. Los cambios son puramente de grafo: se incorpora la normalización del feature extractor (media cero y varianza unitaria sobre la entrada) y se añade `log_softmax` sobre los logits CTC, de forma que el consumidor recibe directamente log-probabilidades y no necesita preprocesado en Python. El proceso de exportación está documentado en `Tools/wav2vec2-onnx/export.py` del repositorio Loom y se realizó con torch 2.15.0 y opset 17.

## Capacidades

- Reconocimiento de habla en japonés mediante CTC (transcripción codiciosa disponible, aunque no es el uso previsto).
- Alineamiento forzado de texto conocido sobre audio: cálculo de inicio y fin de cada palabra en milisegundos mediante Viterbi CTC.
- Ejecución local sin dependencias de Python: el grafo incluye normalización de entrada y `log_softmax` de salida.
- Inferencia en CPU con ONNX Runtime; la variante int8 reduce el coste computacional de forma significativa.
- Entrada de audio en bruto a 16 kHz mono en float32, sin extracción de características externa.
- No soporta tool calling, agentes, visión, audio de entrada multimodal ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al japonés; no se documenta soporte para otros idiomas.

## Casos de uso

- Sincronización de letras en reproductores de música: Loom conoce el texto de la canción y usa el modelo para obtener el instante exacto en que se canta cada palabra, con una mediana de error de 7 ms en el inicio de palabra según el benchmark del autor.
- Karaoke y visualizaciones temporizadas: el alineamiento por palabra permite resaltar la sílaba o palabra activa durante la reproducción sin depender de archivos LRC preexistentes.
- Aplicaciones móviles o de escritorio con inferencia en el dispositivo: el formato ONNX con normalización integrada elimina la necesidad de un entorno Python y facilita el despliegue en clientes nativos.
- Procesamiento por lotes de un catálogo musical japonés: la variante int8 con factor de tiempo real de 0,56 permite alinear grabaciones más rápido que en tiempo real en CPU de Apple Silicon.
- Investigación en alineamiento fonético: el modelo sirve como base para estudiar errores de alineamiento CTC en voz cantada, un dominio para el que no fue afinado.
- Herramientas de subtitulado asistido: partiendo de una transcripción conocida, el modelo aporta marcas temporales por palabra que después pueden revisarse manualmente.
- Integración en pipelines de audio con ONNX Runtime: al recibir y devolver tensores estándar, encaja en servicios o aplicaciones que ya usan ONNX para otros modelos.

## Benchmarks y rendimiento

Datos publicados por el autor (2026-11-05, CPU de Apple Silicon, ONNX Runtime 1.31, 4 hilos). La prueba usa habla con tiempos conocidos: 12 palabras y 6 frases sintetizadas con la voz Kyoko de macOS `say`, unidas con silencios de duración conocida, y alineadas por Viterbi CTC sobre el texto conocido. Los errores son |alineado − real|.

| Archivo | Inicio de palabra mediana / p90 | Fin de palabra mediana / p90 | CER codicioso | Factor de tiempo real |
|---|---|---|---|---|
| `model.onnx` | 7 / 16 ms | 96 / 115 ms | 40,8 % | 3,39 |
| `model_int8.onnx` | 7 / 16 ms | 96 / 115 ms | 40,8 % | 0,56 |

La cuantización int8 mantiene los tiempos del fp32 y es la variante que Loom descarga por defecto. El autor señala que los finales de palabra salen adelantados en ambos casos por la duración del último sonido, ya que CTC marca la letra y no su decadencia. El CER codicioso corresponde a reconocimiento sin texto de referencia y se incluye solo a modo de comparación.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo está pensado para CPU; el repositorio ocupa 1,6 GB e incluye ambas variantes.
- GPU recomendadas: no disponible. El benchmark publicado se ejecutó en CPU de Apple Silicon con ONNX Runtime y 4 hilos.
- GPU de consumo: no se documenta compatibilidad ni requisitos con GPU de consumo; el despliegue descrito es en CPU.
- Opciones de despliegue: ONNX Runtime (versión 1.31 en el benchmark); el formato ONNX permite otros runtimes compatibles, aunque no se documentan en la información disponible.
- Latencia y throughput: factor de tiempo real de 3,39 en fp32 y 0,56 en int8 sobre CPU de Apple Silicon con 4 hilos; el int8 procesa audio más rápido que en tiempo real en ese entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `LooNuH/loom-wav2vec2-ja-onnx` | no disponible | no disponible | ja | Apache-2.0 | ONNX (fp32, int8) | Exportación para alineamiento forzado en dispositivo |
| `jonatasgrosman/wav2vec2-large-xlsr-53-japanese` | no disponible | no disponible | ja | Apache-2.0 | safetensors/PyTorch (formato original) | Modelo base; requiere preprocesado en Python |
| `facebook/wav2vec2-large-xlsr-53` | no disponible | no disponible | 53 idiomas (preentrenamiento) | Apache-2.0 | PyTorch | Modelo de partida multilingüe, sin afinado para japonés |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No está afinado para voz cantada: Loom separa la voz antes de alinear cuando puede, y la calidad en voces mixtas con instrumentación puede degradarse.
- El CER codicioso del 40,8 % en la prueba del autor indica que el reconocimiento libre es débil; el modelo debe usarse con el texto conocido, no como transcriptor general.
- Los finales de palabra salen adelantados por la duración del último sonido (mediana de 96 ms de error), una limitación estructural del marcado CTC.
- El benchmark se realizó con voz sintetizada de macOS, no con grabaciones musicales reales; los resultados en producción pueden diferir.
- Solo soporta japonés; no hay capacidades multilingües documentadas.
- Riesgo de alucinación y sesgos: no se documentan sesgos específicos en la información disponible; al ser una exportación sin cambios de pesos, hereda los del modelo original.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar el archivo `LICENSE` y la atribución al modelo base.
- No se documentan requisitos de GPU ni latencias en otros hardware; el rendimiento en dispositivos móviles o GPUs no está medido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LooNuH/loom-wav2vec2-ja-onnx
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-japanese
- Modelo preentrenado original: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Cita: Grosman, J. (2021). *Fine-tuned XLSR-53 large model for speech recognition in Japanese*.
- Script de exportación: `Tools/wav2vec2-onnx/export.py` del repositorio Loom (no se proporciona URL).
- Script de benchmark: `Tools/wav2vec2-onnx/bench.py` del repositorio Loom (no se proporciona URL).
