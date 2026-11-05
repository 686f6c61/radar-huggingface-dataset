# nitrai-research/ModeratoTTS-V1.1-Preview

## Resumen

ModeratoTTS-V1.1-Preview es un modelo de síntesis de voz (text-to-speech) de aproximadamente 49,73 millones de parámetros desarrollado por nitrai-research. Se presenta como un checkpoint de investigación y no como un modelo de producción, y su interés principal radica en su arquitectura ligera en dos niveles con pesos FP8, su sistema de voces integrado y su capacidad de clonación de voz zero-shot a partir de un clip de referencia. El modelo trabaja a 22,05 kHz con espectrogramas log-mel de 80 bins y está entrenado únicamente en inglés.

El modelo se organiza en cuatro componentes: un Director (9,07 M), un núcleo acústico (38,34 M), un vocoder (1,58 M) y un sistema de voces (0,75 M). Incorpora seis voces predefinidas (alice, bella, cora, david, eric y fred) y permite la clonación a partir de una muestra de audio. El entrenamiento se realizó sobre 4.514 enunciados (8,07 horas) segmentados del dataset Open-Yap, durante 12.000 pasos en una GPU H200.

Es relevante ahora porque explora el uso de FP8 (`float8_e4m3fn`) en las capas lineales pesadas con pesos maestros en FP32, una técnica de cuantización de entrenamiento poco habitual en modelos TTS de este tamaño. No obstante, el propio autor advierte de limitaciones importantes: la etapa GAN del vocoder se desactivó en esta ejecución, la salida es tenue y apagada, y la cabeza VAD es débil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS en dos niveles: Director + núcleo acústico + vocoder + sistema de voces |
| Parámetros totales | 49,73 M (Director 9,07 M + núcleo acústico 38,34 M + vocoder 1,58 M + voces 0,75 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (`float8_e4m3fn`) en capas lineales pesadas, con pesos maestros FP32 |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `model.pt` (checkpoint PyTorch, 748 MB, pesos maestros FP32) |

Otros datos técnicos: frecuencia de muestreo de 22,05 kHz, representación log-mel de 80 bins, biblioteca PyTorch (torch 2.9.1+cu128), dependencias numpy y soundfile.

## Arquitectura y entrenamiento

La arquitectura se describe como "two-tier proodic TTS" (TTS prosódico en dos niveles) y se descompone en un módulo Director, un núcleo acústico, un vocoder y un sistema de gestión de voces. Las capas lineales pesadas emplean FP8 (`float8_e4m3fn`) mediante scaled-mm, manteniendo pesos maestros en FP32 para estabilidad numérica. El entrenamiento se ejecutó en una NVIDIA H200.

Los datos de entrenamiento provienen de Open-Yap (muestra `TheAgenticDataCompany/open-yap-1k`, CC-BY-4.0): 4.514 enunciados y 8,07 horas segmentadas mediante el script `tools/segment_openyap.py`. Se realizaron 12.000 pasos con batch de 16 (aproximadamente 42 épocas). Las métricas finales reportadas son `loss/mel 0.68`, `loss/speaker 0.002`, `speaker/acc 1.00` y `vad/acc 0.76`. El autor indica que el alineamiento empleado es un fallback basado en energía en lugar de los timestamps a nivel de palabra disponibles en el dataset, y que los 8 hablantes originales se fusionaron en 6 voces con nombre según género y tono. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en inglés a 22,05 kHz con salida en formato WAV.
- Seis voces integradas: alice, bella, cora (femeninas) y david, eric, fred (masculinas).
- Clonación de voz zero-shot a partir de un clip de referencia (`--reference-wav`).
- Soporte de marcas de tiempo a nivel de palabra en el dataset de entrenamiento (aunque el alineamiento efectivo usa un fallback basado en energía).
- Detección de actividad de voz (cabeza VAD) integrada, con precisión de 0,76.
- Interfaz de línea de comandos (`synthesize.py`) para listar voces, sintetizar con voz predefinida y clonar.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Prototipado de asistentes de voz en inglés: el modelo permite generar locuciones rápidas con seis voces predefinidas para validar flujos de conversación antes de invertir en un TTS de producción.
- Investigación en cuantización FP8 para TTS: sirve como banco de pruebas para estudiar el impacto de `float8_e4m3fn` con pesos maestros FP32 en la calidad de la síntesis.
- Generación de narraciones para audiolibros o podcasts en fase de demo: la ventana de voces múltiples permite alternar narradores, aunque la calidad actual (salida tenue) limita su uso final.
- Clonación de voz controlada en entornos de investigación: útil para experimentar con adaptación zero-shot a partir de un único clip, siempre que se respeten las restricciones éticas del autor.
- Evaluación de pipelines de alineamiento: al usar un fallback basado en energía, el modelo es útil para comparar estrategias de alineación frente a los timestamps a nivel de palabra del dataset.
- Docencia y demostraciones de TTS ligero: con menos de 50 M de parámetros y un checkpoint de 748 MB, se puede ejecutar en hardware modesto para clases o talleres.
- Integración en pruebas de regresión de sistemas de voz: su CLI sencilla permite automatizar la generación de muestras en pipelines de CI para detectar regresiones acústicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son de entrenamiento:

| Métrica | Valor |
|---|---|
| loss/mel | 0,68 |
| loss/speaker | 0,002 |
| speaker/acc | 1,00 |
| vad/acc | 0,76 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 49,73 M de parámetros y un checkpoint de 748 MB en FP32, la huella es reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: el entrenamiento se realizó en H200; para inferencia basta con una GPU consumer moderna (por ejemplo, RTX 3060 o superior), aunque no se especifican requisitos mínimos.
- Cabe en GPU consumer: sí, por tamaño de parámetros y checkpoint.
- Opciones de despliegue: script propio `synthesize.py` con PyTorch 2.9.1+cu128; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la información proporcionada. A modo de referencia estructural, se compara con alternativas TTS de la misma categoría, sin cifras de rendimiento verificadas:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ModeratoTTS-V1.1-Preview | 49,73 M | no disponible | en | CC-BY-4.0 | PyTorch (`model.pt`) |
| Alternativas TTS ligeras (p. ej. VITS, Piper) | no disponible | no disponible | multi | variable | ONNX / PyTorch |
| Alternativas TTS zero-shot (p. ej. XTTS, Bark) | no disponible | no disponible | multi | variable | PyTorch |

No se han publicado comparaciones directas con estos modelos en la información disponible.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo califica explícitamente como preview, no apto para producción.
- La etapa GAN del vocoder se desactivó en esta ejecución, por lo que la salida es tenue y apagada.
- La cabeza VAD es débil (`vad/acc 0,76`) y algunas voces pueden quedar en silencio.
- El alineamiento usa un fallback basado en energía en lugar de los timestamps a nivel de palabra del dataset.
- Los 8 hablantes originales se fusionaron en 6 voces por género y tono, lo que puede reducir la diversidad vocal real.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación acústica y de artefactos en la síntesis, especialmente con voces clonadas.
- Licencia CC-BY-4.0 con atribución a los creadores del dataset Open-Yap; para uso comercial debe revisarse la licencia del dataset.
- Prohibido usar voces clonadas para suplantar a personas reales.
- Sesgos conocidos: no documentados; el dataset de origen (Open-Yap) puede introducir sesgos de género, acento o registro que no se han evaluado.

## Enlaces

- HuggingFace: https://huggingface.co/nitrai-research/ModeratoTTS-V1.1-Preview
- DOI: https://doi.org/10.57967/hf/11459
- Dataset de entrenamiento: https://huggingface.co/datasets/TheAgenticDataCompany/open-yap-1k
- Repositorio fuente (referenciado en la model card, sin URL directa): script `tools/segment_openyap.py`
- Muestras de audio: `samples/*.wav` en el repositorio del modelo
