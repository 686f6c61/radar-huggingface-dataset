# caspar/MiniMind-O-VLM-Audio-Mini-5090-20261110

## Resumen

MiniMind-O-VLM-Audio-Mini-5090-20261110 es un checkpoint experimental de tipo *any-to-any* (texto, imagen y audio) publicado por el usuario `caspar` en Hugging Face. Se construye sobre el modelo de visión-lenguaje `caspar/MiniMind-V-Dense-64M-LLaVA-Short-v1.0`, del que reutiliza de forma congelada el *Thinker*, la cabeza de lenguaje, el proyector visual y el tokenizador, y le añade un *Talker* y un proyector de audio inicializados desde `jingyaogong/minimind-3o-pytorch/sft_omni_768.pth`. El objetivo es dotar a un VLM pequeño (~64 M de parámetros en la parte densa) de capacidades de entrada y salida de audio.

El modelo forma parte de la familia MiniMind, una línea de modelos de lenguaje de escala muy reducida pensada para experimentación y aprendizaje. En este caso el entrenamiento se limita a alineación de audio: una época de *Talker* texto-a-audio (T2A), una época de alineación del proyector audio-a-audio (A2A) y una época conjunta de *Talker* y proyector A2A, usando los conjuntos `sft_t2a_mini` y `sft_a2a_mini` del dataset `jingyaogong/minimind-o_dataset`.

Es relevante ahora porque explora la integración multimodal audio-texto-imagen en un rango de parámetros extremadamente bajo, pero el propio autor advierte que la calidad conversacional es pobre y que se trata de un artefacto de investigación, no de un modelo listo para producción. No es un export de `AutoModel`: es un checkpoint nativo de PyTorch que requiere ejecutar el código incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM denso + *Talker* de audio y proyector de audio); no disponible el detalle exacto de capas |
| Parametros totales | no disponible (la parte VLM base se describe como "Dense-64M"; el total con *Talker* y proyectores no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos de generación se truncan a 512 tokens) |
| Tipos de cuantizacion | no disponible (checkpoint nativo PyTorch, no se documentan cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | other — `upstream-model-and-dataset-terms` (el código incluido es Apache-2.0; los pesos y datasets upstream conservan sus términos) |
| Formato de pesos | checkpoint nativo PyTorch (`.pth`); no es export de `AutoModel` |

## Arquitectura y entrenamiento

La arquitectura combina un VLM denso con un módulo de audio. El *Thinker*, la cabeza de lenguaje, el proyector visual y el tokenizador se toman congelados de `caspar/MiniMind-V-Dense-64M-LLaVA-Short-v1.0`. El *Talker* y el proyector de audio se inicializan desde `jingyaogong/minimind-3o-pytorch/sft_omni_768.pth` y se alinean a los estados ocultos del VLM. Los *embeddings* de texto del Omni original se sustituyen y nunca se emparejan con el tokenizador del VLM. Los codificadores SenseVoice (audio), SigLIP (visión) y Mimi (códec de audio) permanecen congelados y se descargan por separado en revisiones fijadas en `revisions.json`.

El entrenamiento usa todas las filas de `sft_t2a_mini` y `sft_a2a_mini` (salvo 128 filas reservadas para validación en cada uno) del dataset `jingyaogong/minimind-o_dataset`. Se realizan tres fases de una época: *Talker* T2A, alineación del proyector A2A y *Talker* + proyector A2A conjunto. En esta ejecución no se entrena ningún dataset visual. Las pérdidas de audio incluyen un peso 10x para el token de parada. El autor verifica explícitamente la preservación exacta de los pesos del VLM (`vlm_preservation.json`).

## Capacidades

- Generación de texto a partir de indicaciones de texto (heredada del VLM base).
- Descripción de imágenes mediante el proyector visual congelado y el codificador SigLIP.
- Entrada de audio: el modelo acepta un fichero WAV como pregunta (A2A).
- Salida de audio: genera respuestas en WAV mediante el *Talker* y el códec Mimi.
- Conversión texto-a-audio (T2A) a través del *Talker* entrenado.
- Capacidad multimodal *any-to-any* a nivel experimental (texto, imagen, audio).
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés (`en`).
- Modo *thinking*: no disponible.

## Casos de uso

- Investigación académica sobre alineación multimodal de audio: el checkpoint sirve para estudiar cómo se acoplan un *Talker* y un proyector de audio a un VLM congelado de muy bajo parámetro, con métricas de pérdida y preservación de pesos documentadas en `metrics/` y `vlm_preservation.json`.
- Reproducción de experimentos de *speech-to-speech* a pequeña escala: permite montar un pipeline A2A completo (SenseVoice → VLM → Mimi) en una sola GPU y comparar el efecto de cada fase de entrenamiento.
- Pruebas de concepto de asistentes de voz en hardware de consumo: al ser un modelo de ~64 M en la parte densa y un repo de 0,4 GB, cabe en una RTX 5090 (y probablemente en GPUs menores) para demos de latencia y viabilidad.
- Evaluación de *pipelines* de audio en entornos CUDA: útil para validar dependencias, revisiones fijadas de codificadores y scripts de inferencia (`infer.py`) antes de escalar a modelos mayores.
- Docencia y formación: ejemplo didáctico de cómo se inicializa un *Talker* desde un checkpoint Omni y se alinea a un VLM, con código Apache-2.0 reutilizable.
- Generación de audio de referencia (T2A): útil para producir WAVs de prueba en pipelines de *testing* de sistemas de audio, siempre que no se requiera calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor documenta únicamente pérdidas de entrenamiento con *teacher forcing* y mediciones de preservación del VLM, y advierte explícitamente que una pérdida menor no equivale a calidad de habla ni a seguimiento de instrucciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 0,4 GB y la parte VLM es "Dense-64M", por lo que la huella de pesos es reducida. La VRAM total depende de los codificadores congelados (SenseVoice, SigLIP, Mimi) y del *runtime* CUDA.
- GPU recomendadas: el checkpoint está etiquetado para RTX 5090 (`-5090-` en el nombre); no se documentan otras GPU.
- GPU de consumo: probablemente cabe en GPUs de consumo modernas con suficiente VRAM para los codificadores, pero no se aportan cifras verificadas.
- Opciones de despliegue: no es compatible con `AutoModel`; requiere el código nativo del repo (`source/scripts/runpod_vlm_audio/infer.py`) en un entorno CUDA con las dependencias registradas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMind-O-VLM-Audio-Mini-5090 (este) | VLM base ~64 M (total no disponible) | no disponible | texto, imagen, audio (experimental) | other (términos upstream) | Hugging Face, checkpoint PyTorch nativo |
| caspar/MiniMind-V-Dense-64M-LLaVA-Short-v1.0 | ~64 M (denso) | no disponible | texto, imagen | no disponible | Hugging Face |
| jingyaogong/minimind-3o-pytorch | no disponible | no disponible | texto, audio (Omni) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a modalidades, licencia y disponibilidad.

## Limitaciones y advertencias

- Calidad conversacional pobre: los siete ejemplos generados producen WAV no silenciosos, pero las dos preguntas de audio de validación reciben respuestas no relacionadas.
- Repetición y truncamiento: una muestra de texto repite frases de atención al cliente hasta el límite de 512 tokens.
- Transcripciones automáticas frecuentemente muy distintas del texto generado.
- No se realizó evaluación humana de escucha; la pérdida de *teacher forcing* no mide calidad de habla.
- Precisión factual experimental y no validada.
- En esta ejecución no se entrena ningún dataset visual, por lo que las capacidades visuales dependen íntegramente del VLM base congelado.
- Idioma limitado a inglés; sin soporte multilingüe documentado.
- Licencia restrictiva: `other` con términos upstream de modelo y dataset; el uso comercial requiere revisar `LICENSE_NOTES.md` y las licencias de los modelos y datasets de origen.
- No es un export de `AutoModel`: la integración en *frameworks* estándar requiere trabajo adicional.
- Riesgo de alucinación no cuantificado; no hay benchmarks que lo acoten.
- Sesgos: no documentados, pero heredados del VLM base y de los datasets de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/MiniMind-O-VLM-Audio-Mini-5090-20261110
- Notas de licencia (provenance): https://huggingface.co/caspar/MiniMind-O-VLM-Audio-Mini-5090-20261110/blob/main/provenance/LICENSE_NOTES.md
- Modelo base VLM: https://huggingface.co/caspar/MiniMind-V-Dense-64M-LLaVA-Short-v1.0
- Modelo Omni de referencia: https://huggingface.co/jingyaogong/minimind-3o-pytorch
- Dataset de entrenamiento: https://huggingface.co/datasets/jingyaogong/minimind-o_dataset
- Informe del autor: `REPORT_ko.md` (incluido en el repositorio del modelo)
- Resultados y muestras: `samples/results.json`, `metrics/`, `vlm_preservation.json` (incluidos en el repositorio del modelo)
