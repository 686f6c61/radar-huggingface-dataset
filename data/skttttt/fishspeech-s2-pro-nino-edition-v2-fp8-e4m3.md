# Skttttt/Fishspeech-S2-Pro-Nino-Edition-V2-FP8-E4M3

## Resumen

Fishspeech S2 Pro "Nino Edition" V2 FP8 E4M3 es un modelo de síntesis de voz (text-to-speech) derivado de Fish Audio S2 Pro, ajustado por el usuario Skttttt para clonar la voz del personaje Nino Nakano de la franquicia *The Quintessential Quintuplets*. Se distribuye como un modelo completo ya fusionado (no requiere adaptador LoRA ni paso de merge) y cuantizado a FP8 E4M3, con un total de 4.962.228.480 parámetros y un tamaño de repositorio de 6,9 GB. El objetivo declarado es poder ejecutarlo en GPUs de 16 GB de VRAM.

El modelo es un checkpoint nativo de Fish Speech con arquitectura `dual_ar` (dos módulos autorregresivos acoplados: uno de texto a semántica y un decodificador de codec de audio), no un `AutoModel` de Transformers. Está especializado exclusivamente en japonés y depende de un fork concreto del repositorio Fish Speech (commit `166940c301b8b4650b3110397a38bc68727a3afa`) para su carga, además de un cargador FP8 propio incluido en el repositorio.

Su relevancia es acotada pero clara: demuestra un flujo de cuantización FP8 E4M3 sobre un TTS de ~5.000 millones de parámetros con pesos escalados por fila, pensado para GPUs de consumo. Es un proyecto de fan no oficial, con licencia de investigación de Fish Audio, y el propio autor advierte que la conversión FP8 solo se ha verificado estructuralmente y por checksum, no con inferencia real en GPU ni comparación auditiva para este personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `dual_ar` (Fish Speech S2 Pro): módulo autorregresivo texto-a-semántica + decodificador de codec de audio |
| Parametros totales | 4.962.228.480 (~4,96 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 con escalado por fila en 202 capas lineales y 3 tablas de embeddings; acumulación en FP32; atención, residuales, normalización y codec en mayor precisión |
| Idiomas soportados | japonés (`ja`) |
| Licencia | `fish-audio-research-license` (licencia de investigación de Fish Audio) |
| Formato de pesos | `safetensors` (model.safetensors, 4,97 GB) + `codec.pth` (1,87 GB) |
| Tamano del repositorio | 6,9 GB |
| Modelo base | Skttttt/Fishspeech-S2-Pro-Nino-Edition-V2 (BF16), relación `quantized` |
| Pipeline | text-to-speech |
| Dependencias de runtime | Fork Fish Speech en commit `166940c...`; PyTorch 2.8.0 según el proyecto fijado; cargador FP8 nativo (`infer_fp8.py`, `native_fp8.py`, `bootstrap.py`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `dual_ar` de Fish Speech S2 Pro, un esquema de dos etapas autorregresivas: un módulo transformador que convierte texto en tokens semánticos y un decodificador que transforma esos tokens en unidades del codec de audio de Fish Speech (`codec.pth`, 1,87 GB). La adaptación al personaje se realizó mediante fine-tuning sobre la voz de Nino Nakano, y en esta release los pesos adaptados ya están fusionados dentro de `model.safetensors`, por lo que no se debe volver a aplicar ningún adaptador.

La cuantización a FP8 E4M3 afecta a 202 capas lineales y tres tablas de embeddings, con pesos escalados por fila. Las operaciones lineales del transformador usan operandos FP8 mediante `torch._scaled_mm` con acumulación en FP32, mientras que atención, residuales, normalización y codec se mantienen en mayor precisión. El cargador incluido incorpora una guarda de operandos que rechaza la promoción a peso completo antes de la multiplicación de matrices y no dispone de fallback a matmul en BF16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO.

El condicionamiento de voz se realiza mediante referencias de audio incluidas en el repositorio (WAV, transcripción y tokens de codec precalculados). Hay cuatro referencias: `g1_ni_00016` (7,20 s, predeterminada), `g1_ni_00011` (6,69 s), `g2_ni_00006` (5,94 s) y una cuarta adicional listada en el inventario de ficheros. Tanto la referencia como el texto de entrada influyen en el ritmo, la expresividad y la similitud de la voz generada.

## Capacidades

- Síntesis de voz en japonés a partir de texto, condicionada por una grabación de referencia del personaje.
- Clonación de voz few-shot mediante referencias incluidas (WAV + transcripción + tokens de codec), sin necesidad de reentrenamiento.
- Control de expresividad y ritmo a través de la elección de referencia: cambiar `--reference` altera la entrega de la línea.
- Generación de tokens semánticos y decodificación de audio mediante el codec nativo de Fish Speech.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta razonamiento multi-paso, visión, audio de entrada más allá de la referencia ni modo de pensamiento.
- Multilingüismo: limitado a japonés según la metadata del modelo.

## Casos de uso

- Doblaje amateur de contenido fan: generar líneas nuevas en la voz de Nino Nakano para vídeos, fan edits o proyectos derivados no comerciales, usando las referencias incluidas para mantener el timbre.
- Prototipado de personajes sintéticos en japonés: evaluar pipelines de TTS con condicionamiento por referencia antes de invertir en un modelo entrenado desde cero.
- Pruebas de cuantización FP8 en TTS: banco de pruebas para medir el impacto de E4M3 con escalado por fila en un modelo de ~5 B parámetros sobre GPUs de 16 GB.
- Investigación sobre clonación de voz few-shot: estudiar cómo varía la similitud y la prosodia al cambiar la referencia y el texto de entrada.
- Generación de audio para demos y maquetas: producir locuciones japonesas de prueba en entornos con una única GPU de consumo, dado el objetivo declarado de 16 GB de VRAM.
- Integración en herramientas de creación de contenido con el fork de Fish Speech: usar `infer_fp8.py` como script de inferencia por lotes sobre un conjunto de textos y referencias fijas.
- Validación de portabilidad AMD: el parche `amd_sdpa.patch` y el runtime ROCm permiten experimentar con inferencia FP8 en GPUs AMD RX 9070 XT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que pruebas de escucha a ciegas encontraron la V2 una mejora notable sobre el modelo base y la V1, pero no se aportan métricas numéricas (MOS, similitud de hablante, WER) ni tablas comparativas. El autor indica además que esa afirmación corresponde a la evaluación de la V2 original en BF16 y que para esta conversión FP8 no se ha realizado comparación auditiva ni inferencia individual en GPU.

## Requisitos de hardware

- VRAM estimada: el autor indica que el modelo está pensado para GPUs de 16 GB, si bien el uso real depende del runtime, la configuración y la longitud de entrada. Los pesos FP8 suman 4,97 GB y el codec 1,87 GB, por lo que el grueso del consumo proviene de activaciones y buffers de atención.
- GPU recomendadas: no hay una lista oficial. El runtime incluido se ha probado en una AMD RX 9070 XT con ROCm. Se incluye un helper experimental para NVIDIA CUDA, pero la inferencia completa en CUDA no se ha probado.
- GPU de consumo: sí, el objetivo declarado son tarjetas de 16 GB; el soporte en otras GPUs distintas de la RX 9070 XT no está verificado.
- Requisito imprescindible: PyTorch compatible con FP8 y con la GPU utilizada; el proyecto fijado especifica PyTorch 2.8.0.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es el fork de Fish Speech en el commit indicado, aplicando `amd_sdpa.patch` y ejecutando `infer_fp8.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Fishspeech S2 Pro Nino Edition V2 FP8 E4M3 (este) | ~4,96 B | no disponible | ja | fish-audio-research-license | safetensors FP8 + codec.pth | Fine-tune de personaje, cuantizado, runtime propio |
| Skttttt/Fishspeech-S2-Pro-Nino-Edition-V2 | no disponible | no disponible | ja | fish-audio-research-license | safetensors BF16 | Modelo base del que deriva esta release; requiere el mismo fork |
| Fish Audio S2 Pro (modelo original) | no disponible | no disponible | no disponible | fish-audio-research-license | no disponible | TTS generalista sobre el que se construye la adaptación |
| Alternativas TTS open source de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Proyecto de fan no oficial: sin afiliación ni respaldo de los creadores, intérpretes o titulares de la franquicia. Riesgo legal y de derechos de imagen y voz.
- Licencia `fish-audio-research-license`: restringe el uso; debe revisarse `LICENSE.md` antes de cualquier uso comercial. No es una licencia de código abierto permisiva.
- Solo japonés: no se ha entrenado ni evaluado para otros idiomas.
- La conversión FP8 se verificó estructuralmente y por checksum, pero no mediante inferencia en GPU ni comparación auditiva para este personaje; la calidad real de la cuantización está sin validar.
- El cargador no tiene fallback a BF16: si el entorno no soporta `torch._scaled_mm` en FP8, la inferencia fallará en lugar de degradar.
- El soporte está verificado únicamente en AMD RX 9070 XT con ROCm; el helper CUDA es experimental y no se ha probado de extremo a extremo.
- No es un checkpoint compatible con `AutoModel` de Transformers: requiere el fork de Fish Speech en un commit concreto.
- La similitud de voz no está garantizada en todas las líneas; la entrega varía según la referencia y el texto.
- Riesgo de alucinación acústica y artefactos en la síntesis, especialmente con textos largos o fuera de dominio.
- No se documentan sesgos específicos del modelo; al ser un fine-tune sobre una única voz de personaje, su diversidad de hablantes es nula por diseño.
- El corpus de entrenamiento, los estados del optimizador y los adaptadores independientes no se distribuyen, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Nino-Edition-V2-FP8-E4M3
- Modelo base BF16: https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Nino-Edition-V2
- Fork de Fish Speech utilizado: https://github.com/TachibanaKimika/fish-speech/tree/166940c301b8b4650b3110397a38bc68727a3afa
- Referencia predeterminada (audio): https://huggingface.co/Skttttt/Fishspeech-S2-Pro-Nino-Edition-V2-FP8-E4M3/resolve/main/references/g1_ni_00016.wav
- Licencia: `LICENSE.md` dentro del repositorio del modelo
