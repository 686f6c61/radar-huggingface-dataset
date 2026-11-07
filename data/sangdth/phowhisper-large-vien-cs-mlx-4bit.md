# sangdth/phowhisper-large-vien-cs-mlx-4bit

## Resumen

PhoWhisper-large Vietnamese-English code-switching (MLX, 4-bit) es una conversión cuantizada del modelo de reconocimiento automático del habla (ASR) PhoWhisper-large de VinAI, con el adaptador LoRA `rinhoooo/phowhisper-large-vien-cs-asr` fusionado en los pesos. El resultado se ha convertido al formato MLX para su ejecución en Apple Silicon mediante la librería `mlx-whisper` y se ha cuantizado a 4 bits, reduciendo el peso del repositorio de 2,9 GB (float16) a 0,8 GB. El modelo resuelve un problema concreto: transcribir habla en vietnamita con palabras o frases en inglés intercaladas, un fenómeno habitual en contextos técnicos y profesionales en Vietnam.

La arquitectura subyacente es la de Whisper-large, un transformer encoder-decoder con 1550 millones de parámetros, aunque la model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset del adaptador. El autor advierte que la versión 4-bit es la menos precisa de la familia: en una prueba de 12 frases sintéticas obtuvo una tasa de error por palabra (WER) del 11,4 %, frente al 8,0 % de las versiones float16 y 8-bit, e incluso añadió palabras que no se habían pronunciado.

Es relevante ahora porque permite ejecutar un modelo ASR especializado en code-switching vietnamita-inglés en portátiles Mac sin GPU dedicada, con un consumo de disco inferior a 1 GB. La licencia CC BY 4.0 del adaptador y la BSD 3-Clause de PhoWhisper-large permiten uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-large) |
| Parámetros totales | 1550 millones (Whisper-large; no confirmado explícitamente en la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos propia de Whisper) |
| Tipos de cuantización | 4-bit (group size 64), float16 y 8-bit en variantes separadas |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | CC BY 4.0 (modelo fusionado); PhoWhisper-large base bajo BSD 3-Clause |
| Formato de pesos | MLX (`weights.safetensors` + `config.json` con bloque `quantization`) |

## Arquitectura y entrenamiento

El modelo parte de `vinai/PhoWhisper-large` (commit `b9136a4`), un Whisper-large adaptado al vietnamita por VinAI, y le fusiona el adaptador LoRA `rinhoooo/phowhisper-large-vien-cs-asr` (commit `a98f55e`, r=32, alpha=64, 512 capas). La fusión aplica la fórmula W + (64/32) · B · A sobre cada peso objetivo, integrando el adaptador en los pesos base. Posteriormente se convierte con `convert.py` de `ml-explore/mlx-examples` (commit `796f5b5`) y se renombra `model.safetensors` a `weights.safetensors`, el nombre que espera `mlx-whisper`.

La cuantización se realizó con `mlx.nn.quantize` (group size 64, 4 bits, mlx 0.32.4), el mismo procedimiento que aplica `convert.py -q`. El `config.json` incluye el bloque `quantization` que lee `mlx-whisper`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset del adaptador ni si hubo RLHF o DPO; la model card remite a las fichas de VinAI y de los autores del adaptador para esos detalles.

## Capacidades

- Reconocimiento automático del habla (ASR) en vietnamita con inserción de términos en inglés (code-switching), por ejemplo "fix cái bug login trong dashboard".
- Transcripción de audio de hasta 30 segundos por ventana, con segmentación automática para audios más largos.
- Soporte de los dos idiomas del modelo: vietnamita e inglés, con detección o especificación manual del idioma (`language="vi"`).
- Ejecución en Apple Silicon mediante MLX, sin necesidad de CUDA.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento; es un modelo exclusivamente ASR.
- No se documentan capacidades multilingües más allá de vi y en.

## Casos de uso

- Transcripción de reuniones técnicas en Vietnam: el modelo maneja frases mixtas vietnamita-inglés habituales en equipos de desarrollo ("merge cái branch", "deploy lên staging"), lo que reduce errores frente a un ASR solo en vietnamita.
- Subtitulado de vídeos y pódcast para desarrolladores: se puede ejecutar localmente en un Mac con `mlx-whisper` y generar subtítulos en vietnamita con términos técnicos en inglés preservados.
- Documentación de soporte técnico: transcripción de llamadas de atención al cliente donde el agente mezcla vietnamita e inglés, con un peso de modelo inferior a 1 GB que cabe en cualquier portátil.
- Prototipado rápido en investigación ASR: la variante 4-bit permite iterar en local sobre corpus de code-switching sin infraestructura GPU, aceptando el coste de precisión (WER 11,4 % frente a 8,0 %).
- Aplicaciones de dictado en macOS: integración en herramientas de escritura por voz para usuarios bilingües, con despliegue nativo en Apple Silicon.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de 4 bits frente a float16 y 8-bit en tareas ASR con code-switching.

## Benchmarks y rendimiento

El autor reporta una prueba puntual de 12 frases con habla vietnamita sintética. No son benchmarks estándar (no hay MMLU, HumanEval ni GSM8K, que no aplican a un modelo ASR).

| Modelo | WER (12 frases sintéticas) |
|---|---|
| PhoWhisper-large vien-cs MLX float16 | 8,0 % |
| PhoWhisper-large vien-cs MLX 8-bit | 8,0 % |
| PhoWhisper-large vien-cs MLX 4-bit (este) | 11,4 % |

El autor señala además que en la variante 4-bit se observó al menos una inserción de palabras no pronunciadas. No se han publicado resultados de benchmarks estándar (p. ej. VIVOS, VLSP, Common Voice vi) en la información disponible.

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa 0,9 GB; la inferencia en MLX requiere aproximadamente esa cantidad de memoria unificada, muy por debajo de los 2,9 GB de la versión float16.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) con memoria unificada; no está pensado para GPU NVIDIA ni CUDA.
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada.
- Despliegue: `mlx-whisper` (Python); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MLX y la tarea es ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sangdth/phowhisper-large-vien-cs-mlx-4bit | 1550 M (Whisper-large) | 30 s de audio | vi, en | CC BY 4.0 | MLX 4-bit |
| sangdth/phowhisper-large-vien-cs-mlx | 1550 M | 30 s de audio | vi, en | CC BY 4.0 | MLX float16 |
| vinai/PhoWhisper-large | 1550 M | 30 s de audio | vi | BSD 3-Clause | safetensors |
| openai/whisper-large-v3 | 1550 M | 30 s de audio | multilingüe | MIT (según el modelo original) | safetensors, GGUF, etc. |

La comparativa se limita a datos estructurales; no se dispone de resultados de WER comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Precisión reducida: WER del 11,4 % frente al 8,0 % de float16 y 8-bit en la prueba del autor; se recomienda la variante 8-bit salvo que el tamaño de descarga sea prioritario.
- Riesgo de inserciones: el autor documenta al menos un caso de palabras añadidas que no se pronunciaron.
- Sesgos: no documentados en la información disponible; al derivar de PhoWhisper-large, hereda los sesgos de sus datos de entrenamiento, no detallados aquí.
- Cobertura lingüística limitada a vietnamita e inglés; no se garantiza rendimiento en otros idiomas ni en acentos no representados.
- Ventana de audio de 30 segundos por segmento, propia de Whisper; audios largos requieren segmentación.
- Licencia: CC BY 4.0 exige atribución a los autores del adaptador y a VinAI; PhoWhisper-large base es BSD 3-Clause y su texto completo está en `LICENSE-PhoWhisper`.
- Solo para Apple Silicon: no es desplegable en infraestructura NVIDIA/CUDA sin reconversión.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/sangdth/phowhisper-large-vien-cs-mlx-4bit
- Variante float16: https://huggingface.co/sangdth/phowhisper-large-vien-cs-mlx
- Variante sin adaptador: https://huggingface.co/sangdth/phowhisper-large-mlx
- Modelo base PhoWhisper-large: https://huggingface.co/vinai/PhoWhisper-large
- Adaptador LoRA: https://huggingface.co/rinhoooo/phowhisper-large-vien-cs-asr
- Librería mlx-whisper: https://pypi.org/project/mlx-whisper/
- Repositorio mlx-examples (script de conversión): https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Paper PhoWhisper (ICLR 2024 Tiny Papers): no disponible como enlace directo en la información proporcionada
- Paper del adaptador (Procedia Computer Science, KES 2026): no disponible como enlace directo en la información proporcionada
