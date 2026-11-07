# sangdth/phowhisper-large-vien-cs-mlx-16bit

## Resumen

PhoWhisper-large Vietnamese-English code-switching (MLX) es una conversión al formato MLX del modelo de reconocimiento automático del habla (ASR) PhoWhisper-large de VinAI, con un adaptador LoRA especializado en code-switching vietnamita-inglés ya fusionado en los pesos. El resultado es un checkpoint listo para ejecutarse con `mlx-whisper` sobre Apple Silicon en precisión float16, orientado a transcribir habla en vietnamita con palabras o frases en inglés intercaladas, un fenómeno muy habitual en contextos técnicos y profesionales en Vietnam ("fix cái bug login trong dashboard").

El modelo parte de la arquitectura Whisper-large (transformer encoder-decoder de tipo seq2seq para ASR) y hereda su ventana de audio de 30 segundos por segmento. La aportación del autor (`sangdth`) no es entrenar desde cero, sino fusionar el adaptador LoRA de `rinhoooo/phowhisper-large-vien-cs-asr` (r=32, alpha=64) sobre `vinai/PhoWhisper-large` y convertir el resultado a MLX, de modo que sea consumible en Macs con chips M-series sin necesidad de CUDA.

Es relevante ahora porque cubre un nicho poco atendido: ASR bilingüe vietnamita-inglés en hardware de consumo Apple. Frente a Whisper estándar, que suele degradar cuando se mezclan idiomas, este merge incorpora un adaptador entrenado específicamente para ese escenario, aunque la información pública sobre su rendimiento cuantitativo es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-large (transformer encoder-decoder seq2seq para ASR) |
| Parametros totales | no disponible (Whisper-large base: ~1.550 M; el merge no altera el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (estándar Whisper) |
| Tipos de cuantizacion | float16 (16-bit) en esta conversión MLX; no se documentan otras |
| Idiomas soportados | vietnamita (vi), inglés (en); entrenado para code-switching vi-en |
| Licencia | CC BY 4.0 (adaptador y merge); modelo base PhoWhisper-large bajo BSD 3-Clause |
| Formato de pesos | safetensors (MLX, `weights.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-large: un encoder transformer que procesa espectrogramas log-Mel de ventanas de 30 segundos y un decoder autorregresivo que genera tokens de transcripción, con tokens especiales de idioma y tarea. PhoWhisper-large adapta Whisper-large al vietnamita mediante fine-tuning sobre datos en ese idioma (ver paper PhoWhisper, ICLR 2024 Tiny Papers). Sobre esa base, el adaptador `rinhoooo/phowhisper-large-vien-cs-asr` introduce capacidad de code-switching vi-en mediante LoRA con r=32, alpha=64, entrenado sobre un dataset de habla code-switching descrito en "A Vietnamese-English Code-Switching Speech Dataset and Benchmark Evaluation for Automatic Speech Recognition" (Procedia Computer Science, KES 2026).

La innovación técnica de este repositorio concreto es de ingeniería de despliegue, no de modelado: la fusión de los pesos LoRA se realiza aplicando W + (64/32)·B·A a cada peso objetivo, y después se convierte el checkpoint a MLX con `convert.py` de `ml-explore/mlx-examples` (commit `796f5b5`), renombrando `model.safetensors` a `weights.safetensors`, el nombre que espera `mlx-whisper`. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO; el autor remite a las model cards de VinAI y del adaptador.

## Capacidades

- Reconocimiento automático del habla (transcripción) en vietnamita con inserción de términos en inglés.
- Manejo de code-switching vi-en dentro de una misma frase, incluyendo vocabulario técnico ("bug", "login", "dashboard").
- Transcripción de audio de hasta 30 segundos por segmento (límite estándar de Whisper); audios más largos requieren segmentación o el pipeline de `mlx-whisper`.
- Detección/forzado de idioma mediante el parámetro `language` (se recomienda `vi`).
- Ejecución nativa en Apple Silicon vía MLX, con precisión float16.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá de ASR ni modo de razonamiento; no disponibles.

## Casos de uso

- Transcripción de reuniones de equipos de desarrollo en Vietnam: el modelo transcribe conversaciones donde se mezclan frases en vietnamita con términos técnicos en inglés, evitando las confusiones típicas de Whisper monolingüe en ese escenario.
- Subtitulado de contenido técnico en vídeo: grabaciones de tutoriales o charlas donde el ponente alterna vi e inglés; se procesa el audio por segmentos de 30 s con `mlx-whisper` y se generan subtítulos.
- Actas y notas de soporte técnico: transcripción de llamadas de atención al cliente o soporte IT donde el cliente describe problemas con vocabulario mixto; el texto resultante alimenta un sistema de tickets.
- Investigación lingüística sobre code-switching: generación de transcripciones de corpus vi-en para análisis de alternancia de código, aprovechando que el adaptador fue entrenado sobre un dataset específico de ese fenómeno.
- Prototipado local en Mac: desarrolladores que quieren validar un pipeline ASR vi-en sin GPU NVIDIA, usando `mlx-whisper` en un MacBook con chip M-series.
- Preprocesado de datos para otros modelos: transcripción por lotes de audio vietnamita en un Mac para construir datasets de texto que alimenten modelos de lenguaje o sistemas de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las model cards de `vinai/PhoWhisper-large` y de `rinhoooo/phowhisper-large-vien-cs-asr` para datos de entrenamiento y resultados, pero no se incluyen cifras de WER ni comparativas en la información proporcionada.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo pesa 3,1 GB en float16, por lo que se necesita al menos ~3-4 GB de memoria unificada libre para cargar los pesos, más overhead de activaciones y del encoder de audio.
- Hardware objetivo: Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para CUDA ni CPU x86.
- GPU NVIDIA: no aplica en este formato; para esas plataformas habría que usar el checkpoint original en PyTorch o una conversión GGUF/ONNX (no disponible en este repo).
- Despliegue: `mlx-whisper` (librería `mlx-whisper` de PyPI) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| sangdth/phowhisper-large-vien-cs-mlx-16bit | ~1.550 M (Whisper-large) | 30 s/segmento | vi, en (code-switching) | CC BY 4.0 | MLX float16 (Apple Silicon) |
| vinai/PhoWhisper-large | ~1.550 M (Whisper-large) | 30 s/segmento | vi (principalmente) | BSD 3-Clause | PyTorch safetensors |
| rinhoooo/phowhisper-large-vien-cs-asr | ~1.550 M + LoRA | 30 s/segmento | vi, en (code-switching) | no disponible en la información | adaptador LoRA (PyTorch) |
| openai/whisper-large-v3 | ~1.550 M | 30 s/segmento | multilingüe (incl. vi, en) | MIT (según OpenAI) | PyTorch, GGUF, MLX, etc. |

La diferencia clave frente a PhoWhisper-large original es la incorporación del adaptador de code-switching; frente a Whisper-large-v3, el ajuste específico a vi-en debería mejorar en ese dominio concreto, aunque no hay cifras públicas en la información disponible que lo cuantifiquen.

## Limitaciones y advertencias

- Es un modelo de ASR, no un LLM: no razona, no hace tool calling ni genera texto libre más allá de la transcripción.
- Ventana de audio de 30 segundos por segmento; audios largos requieren segmentación y pueden acumular errores en las fronteras.
- Solo soporta vietnamita e inglés; otros idiomas no están cubiertos y podrían producir transcripciones incorrectas.
- Riesgo de alucinación típico de Whisper en audio con ruido, silencios largos o habla muy solapada.
- Sesgos: al derivar de PhoWhisper y de un dataset específico de code-switching, el rendimiento puede degradarse en acentos regionales no representados o en jerga muy específica.
- Licencia CC BY 4.0: permite uso comercial con atribución a los autores del adaptador y a VinAI; el modelo base PhoWhisper-large es BSD 3-Clause y su texto completo está en `LICENSE-PhoWhisper`.
- Dependencia de Apple Silicon y MLX: no es portable directamente a CUDA sin reconversión.
- Repositorio con muy poca tracción (17 descargas, 0 likes en el momento de la consulta) y sin benchmarks publicados; conviene validar el WER en el dominio propio antes de usarlo en producción.
- El autor no documenta el proceso de evaluación ni métricas de calidad del merge.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/sangdth/phowhisper-large-vien-cs-mlx-16bit
- Variante sin adaptador: https://huggingface.co/sangdth/phowhisper-large-mlx-16bit
- Modelo base PhoWhisper-large: https://huggingface.co/vinai/PhoWhisper-large
- Adaptador LoRA: https://huggingface.co/rinhoooo/phowhisper-large-vien-cs-asr
- Librería mlx-whisper: https://pypi.org/project/mlx-whisper/
- Script de conversión MLX: https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Paper PhoWhisper (ICLR 2024 Tiny Papers): no disponible como URL directa en la información proporcionada
- Paper del dataset code-switching (Procedia Computer Science, KES 2026): no disponible como URL directa en la información proporcionada
