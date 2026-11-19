# LibraxisAI/whisper-large-v3-mlx-GPTQ-Hessian-q4

## Resumen

`whisper-large-v3-mlx-GPTQ-Hessian-q4` es un checkpoint de reconocimiento automático del habla (ASR) derivado de `openai/whisper-large-v3`, cuantizado a 4 bits en formato afín de MLX por el usuario LibraxisAI. El modelo conserva la arquitectura completa de Whisper Large v3 (32 bloques de encoder, 32 bloques de decoder, `d_model = 1280`, 128 bins mel) pero reduce el peso de los pesos de 3,09 GB en FP16 a 973,6 MB, lo que permite transcripción local de alta precisión en Apple Silicon con Metal.

La relevancia del checkpoint está en que mantiene la precisión acústica completa de las 32 capas del decoder de Large v3 —a diferencia de las variantes Turbo de 4 capas— dentro de un presupuesto de memoria unificado inferior a 1 GB. Según la model card, iguala al checkpoint Q8 de 1,66 GB en pruebas de dictado continuo en polaco y en recuperación de conjunciones tenues y términos técnicos mixtos PL/EN.

El modelo está pensado para despliegues locales en Mac con `mlx_whisper`, `LibraxisAI/mlx-batch-server` o el backend Metal nativo de `vetcoders/x9bus`. La licencia es MIT y el repositorio incluye pesos, configuración, tokenizer y filtros mel en un único bundle autocontenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), 32 bloques de encoder y 32 de decoder, `d_model = 1280`, 128 bins mel |
| Parametros totales | no disponible (pesos cuantizados de 973.591.027 bytes; vocabulario de 51.866 tokens) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s estándar de Whisper; no confirmado en la información) |
| Tipos de cuantizacion | MLX affine 4 bits, `group_size = 32` (códigos U32 empaquetados + escalas F16 + sesgos F16 por grupo) |
| Idiomas soportados | en, pl, de, fr, es, it, pt, nl, ru, zh, ja, ko, ar, hi, multilingual |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX affine), `weights.safetensors` de 973,6 MB |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `openai/whisper-large-v3`, un transformer encoder-decoder con 32 bloques en cada torre, dimensión de modelo 1280 y vocabulario de 51.866 tokens. La cuantización se aplica a 513 matrices: los 32 bloques del AudioEncoder, los 32 bloques del TextDecoder y la proyección `token_embedding` de 51866 × 1280. Quedan sin cuantizar `encoder.conv1`, `encoder.conv2`, `decoder.positional_embedding`, todos los pesos y sesgos de LayerNorm (en F16) y `alignment_heads` (I64).

El procedimiento de cuantización sigue la receta GPTQ con compensación de error de bloques mediante Cholesky, descrita en el checkpoint Turbo del mismo autor. Se calibró con mel-espectrogramas de habla limpia y aumentada con ruido en polaco e inglés (24.000 frames de encoder más trayectorias completas de tokens del decoder en modo teacher-forced), disjuntos del conjunto de evaluación. Para cada capa se calculó la matriz de Gram empírica `H = XᵀX + λI` con amortiguación adaptativa `λ = 0.01 · media(diag(H))`, y se aplicó una búsqueda de rango de recorte asimétrico de 81 puntos sobre `(α, β) ∈ [0,88, 1,00]²` ponderada por la diagonal de la Hessiana, antes de propagar el error con la inversa triangular superior de Cholesky. La fidelidad retenida frente al profesor FP16 se midió como MSE relativo de features del encoder de 0,01751 y divergencia KL de logits de vocabulario con temperatura T = 2,0 de 0,04377 nats.

## Capacidades

- Transcripción de voz a texto multilingüe en 14 idiomas más el modo multilingüe: en, pl, de, fr, es, it, pt, nl, ru, zh, ja, ko, ar, hi.
- Reconocimiento de habla mixta entre idiomas, incluyendo cambios de código PL/EN con términos técnicos.
- Recuperación de segmentos de baja energía acústica (conjunciones y sufijos tenues) y de dictado continuo largo, según las pruebas del autor.
- Detección de idioma y decodificación autoregresiva con `language` configurable.
- No se documenta soporte de tool calling, function calling, agentes ni capacidades de visión o audio más allá del pipeline ASR.
- El modelo no incluye VAD ni segmentación propia; el autor recomienda combinarlo con Silero VAD y control por energía para suprimir alucinaciones en silencios.

## Casos de uso

- Dictado local en Mac: transcripción de notas de voz o reuniones con `mlx_whisper` sobre Apple Silicon, aprovechando el peso de 973,6 MB para mantener el modelo residente en memoria unificada sin competir con otras aplicaciones.
- Subtitulado multilingüe offline: generación de subtítulos en 14 idiomas con un único modelo, útil en flujos de edición de vídeo donde no se quiere enviar audio a servicios en la nube.
- Transcripción de audio técnico mixto PL/EN: el modelo está calibrado y evaluado con habla que alterna polaco e inglés, lo que lo hace adecuado para equipos de ingeniería con terminología inglesa sobre base polaca.
- Servicio batch en Mac Studio: integración con `LibraxisAI/mlx-batch-server` para procesar colas de ficheros de audio en paralelo, con latencia aproximada de 1,2 s por utterance corta según el autor.
- Preprocesado de datasets de voz: transcripción de corpus para etiquetado o alineación, donde el coste de 4 bits permite procesar volúmenes grandes en hardware consumer.
- Asistentes de voz con VAD externo: combinado con Silero VAD y gating por energía para pipelines de streaming con planificación de ventanas adaptada a 32 capas (`x9bus` ajusta automáticamente la cadencia de ventana para modelos de 32 capas).
- Investigación en cuantización: el checkpoint sirve como referencia reproducible de la metodología GPTQ-Hessian del autor, comparable directamente con sus variantes Q8 y Turbo.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones cualitativas y de logprob del autor sobre Apple Silicon Metal con `x9stt` (`vetcoders/x9bus`, decodificación greedy, `language="pl"`), sin solapamiento con el conjunto de calibración.

| Checkpoint | Pesos | Capas decoder | Numerales aislados (`5× "pięć"`) | PL/EN mixto + inicio tenue | Dictado continuo PL | Logprob medio |
|---|---:|---:|---|---|---|---:|
| `LibraxisAI/whisper-large-v3-mlx-q8` | 1.663,6 MB | 32 | `Pięć, pięć, pięć, pięć, pięć.` | Recupera `"że"` tenue, `"computer use"` exacto | Referencia (Q8 32 capas) | -0,13 |
| **`whisper-large-v3-mlx-GPTQ-Hessian-q4`** | **973,6 MB** | **32** | **`Pięć, pięć, pięć, pięć, pięć.`** | **Recupera `"że"` tenue, `"computer use"` exacto** | **Iguala Large v3 Q8 al 58,5 % del tamaño** | **-0,15** |
| `whisper-large-v3-turbo-mlx-q8` | 913,7 MB | 4 | `Pięć pięć pięć pięć pięć` | Pierde `"że"` tenue, `"computer use"` exacto | Fuerte (Q8 4 capas) | -0,22 |
| `whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4` | 513,5 MB | 4 | `Pięć, pięć, pięć, pięć, pięć.` | Pierde `"że"` tenue, `"computer use"` exacto | Elisiones menores en tomas largas | -0,24 |

No se han publicado resultados de benchmarks estándar (WER en LibriSpeech, Common Voice, FLEURS, MMLU u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 973,6 MB solo para pesos; con overhead de runtime MLX y buffers de activación, el consumo práctico se sitúa por encima de 1 GB.
- GPU recomendadas: Apple Silicon con Metal (M1, M2, M3, M4 y variantes Pro, Max y Ultra). El formato MLX affine no es compatible con CUDA ni ROCm sin reconversión.
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos base con 8 GB de memoria unificada.
- Despliegue: `mlx_whisper`, `LibraxisAI/mlx-batch-server`, backend Metal nativo de `vetcoders/x9bus`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 1,2 s por utterance corta en Apple Silicon Metal, frente a 0,76 s del Turbo de 4 capas, según el autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros / capas decoder | Contexto audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LibraxisAI/whisper-large-v3-mlx-GPTQ-Hessian-q4` | 32 capas decoder, `d_model = 1280` | 30 s (estándar Whisper, no confirmado) | MLX affine 4 bits | MIT | Hugging Face |
| `LibraxisAI/whisper-large-v3-mlx-q8` | 32 capas decoder | 30 s (estándar Whisper) | MLX affine 8 bits | MIT | Hugging Face |
| `LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4` | 4 capas decoder | 30 s (estándar Whisper) | MLX affine 4 bits | MIT | Hugging Face |
| `openai/whisper-large-v3` | 32 capas decoder | 30 s | safetensors FP16 | MIT | Hugging Face |

## Limitaciones y advertencias

- Riesgo de alucinación en silencios o segmentos sin habla: el autor documenta la aparición de frases como `"Dzięki za oglądanie!"` y recomienda Silero VAD más gating por energía.
- El formato MLX affine solo es utilizable en Apple Silicon con Metal; no hay pesos GGUF ni safetensors estándar para CUDA.
- La evaluación publicada se limita al polaco y a mezclas PL/EN; no hay métricas de WER para el resto de idiomas declarados.
- La cuantización introduce una pérdida medible frente al profesor FP16 (MSE relativo de features 0,01751, KL de logits 0,04377 nats), que puede degradar la precisión en dominios acústicos alejados de la calibración.
- La cadencia de decodificación es más lenta que la de Turbo por ejecutar 32 bloques por token; no es adecuada para streaming de baja latencia sin planificación de ventanas adaptativa.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del modelo base `openai/whisper-large-v3` y citar adecuadamente.
- No se documentan sesgos específicos del checkpoint cuantizado; los sesgos del modelo base Whisper Large v3 aplican igualmente.

## Enlaces

- Hugging Face: https://huggingface.co/LibraxisAI/whisper-large-v3-mlx-GPTQ-Hessian-q4
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Checkpoint Turbo del mismo autor: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4
- Variante Q8: https://huggingface.co/LibraxisAI/whisper-large-v3-mlx-q8
- Turbo Q8: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- Servidor batch: `LibraxisAI/mlx-batch-server` (referenciado en la model card, sin URL directa)
- Backend Metal: https://github.com/vetcoders/x9bus
