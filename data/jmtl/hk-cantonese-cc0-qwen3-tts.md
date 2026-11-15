# jmtl/hk-cantonese-cc0-qwen3-tts

## Resumen

hk-cantonese-cc0 es un adaptador LoRA de síntesis de voz (text-to-speech) para el modelo Qwen3-TTS 12Hz 1.7B Base, desarrollado por el usuario jmtl. Su función es dotar al modelo base de una voz femenina con acento de cantonés de Hong Kong, entrenada exclusivamente con datos CC-0 de Common Voice y distribuida bajo licencia Apache-2.0. El modelo base, Qwen3-TTS, fue entrenado por el equipo de Qwen sobre más de 5 millones de horas de audio cuyas fuentes no se han hecho públicas, según el informe técnico referenciado (arXiv 2601.15621).

El adaptador ocupa 139,5 MB (LoRA de rango 64 sobre 196 proyecciones del módulo *talker*, en fp16) más un fichero de 16 KB con el embedding de locutor ya horneado (índice de códec 3000). Se distribuye como repositorio PEFT con safetensors y un script de fusión (`scripts/apply_adapter.py`) que construye el modelo ejecutable. La versión actual es la v0.0.5 (25 de octubre de 2026), reproducible bit a bit con la receta publicada usando la semilla 2.

Es relevante porque cubre un hueco poco atendido: TTS de calidad para cantonés (yue) con licencia permisiva y procedencia de datos verificable, algo poco habitual en un ecosistema donde la mayoría de voces cantonés dependen de datasets con licencias restrictivas o de fuentes no documentadas. El autor publica además una variante GGUF para inferencia con ggtts y un paquete de control emocional derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-TTS 12Hz 1.7B Base; rango 64 sobre 196 proyecciones del módulo talker |
| Parametros totales | 1.7B en el modelo base; el adaptador ocupa 139,5 MB en fp16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentación de texto en trozos de hasta 45 caracteres, cortados por puntuación) |
| Tipos de cuantizacion | fp16 en el adaptador; existe variante GGUF publicada aparte |
| Idiomas soportados | yue (cantonés), zh (incluye zh-HK en el entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, extra_tensors.safetensors), config PEFT en JSON |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-TTS 12Hz 1.7B Base, un modelo de síntesis de voz del que la información disponible no detalla la arquitectura interna más allá de la referencia al componente *talker* y a un códec de 12 Hz. El LoRA de rango 64 se inserta en 196 proyecciones de ese módulo *talker*, y el embedding de locutor se hornea como tensor extra con el índice de códec 3000, de modo que la voz queda fijada sin necesidad de referencia en tiempo de inferencia. El paquete incluye un informe de error de reconstrucción SVD por tensor (`docs/recovery_report.json`).

El entrenamiento se realizó en dos fases: una fase de idioma que combina Common Voice zh-HK 27.0 y yue 22.0, con cada clip restaurado mediante Sidon (recuperación de dinámica y recorte de bordes), y un ajuste específico sobre una única voz donante. Todo el proceso es reproducible con semilla fija. Respecto a la v0.0.1, la v0.0.5 amplía los trozos de texto de unos 23 a 45 caracteres, renombra el locutor a `hk_voice_343`, reduce en 1,4 dB el rango de sonoridad y, en prosa larga no vista, baja de 63 a 56 caracteres descartados; en una escucha ciega un oyente nativo prefirió la v0.0.5 en 15 párrafos frente a 8.

## Capacidades

- Síntesis de voz en cantonés de Hong Kong con voz femenina única (locutor `hk_voice_343`).
- Lectura de texto en chino (zh) además de cantonés, gracias a la fase de idioma con Common Voice zh-HK.
- Segmentación automática de párrafos largos en trozos de hasta 45 caracteres cortados por puntuación.
- Control emocional opcional mediante el paquete complementario hk-cantonese-cc0 emotion steering (ira, miedo, tristeza), que transfiere parte del control de Qwen3-TTS CustomVoice.
- Compatibilidad con PyTorch (script de fusión incluido) y con la variante GGUF para ggtts.
- No se documentan tool calling, capacidades de agente ni procesamiento multimodal más allá del audio de salida.

## Casos de uso

- Locución de contenido editorial en cantonés: artículos, boletines o newsletters convertidos a audio con una voz coherente entre entregas gracias al embedding de locutor fijado.
- Accesibilidad para lectores de pantalla en Hong Kong: integración en aplicaciones que lean interfaces y documentos en cantonés con una voz natural y licencia permisiva.
- Doblaje y preproducción de vídeo: generación de pistas de voz de referencia para guiones en cantonés antes de la grabación con actores.
- Asistentes de voz para atención al cliente: respuestas habladas en cantonés en sistemas IVR, con la ventaja de que la licencia Apache-2.0 permite uso comercial sin royalties.
- Audiolibros y pódcast de bajo presupuesto: la segmentación por puntuación en trozos de 45 caracteres facilita el procesado por lotes de capítulos largos.
- Prototipado de productos de voz para el mercado de Hong Kong: evaluación rápida de UX conversacional en cantonés con un modelo desplegable en local mediante GGUF.
- Investigación en TTS de bajos recursos: la receta reproducible y los datos CC-0 permiten replicar y comparar experimentos de adaptación LoRA sobre un modelo base grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MOS, WER, MCD) en la información disponible. La evaluación documentada es comparativa entre versiones y cualitativa:

| Metrica | v0.0.5 | v0.0.1 |
|---|---|---|
| Caracteres descartados en prosa larga no vista | 56 | 63 |
| Preferencia ciega de oyente nativo (párrafos) | 15 | 8 |
| Rango de sonoridad | 1,4 dB más estrecho | referencia |
| Longitud máxima de trozo | 45 caracteres | ~23 caracteres |

## Requisitos de hardware

- El modelo base completo tiene 1,7B parámetros; en fp16 requiere aproximadamente 3,4 GB de VRAM solo para pesos, más el coste del códec y del estado de inferencia. La cifra exacta de VRAM en inferencia no está disponible.
- El adaptador añade 139,5 MB en fp16, por lo que puede aplicarse sobre el base en GPU de consumo con al menos 8 GB de VRAM, aunque el requisito real depende del runtime de Qwen3-TTS, no documentado aquí.
- GPU recomendadas: no disponible. Por tamaño, cabría en RTX 3060/4060 de 8 GB o superiores, y con holgura en RTX 4090, A100 o H100.
- Despliegue: PyTorch con PEFT y el script `scripts/apply_adapter.py` para fusionar el adaptador; variante GGUF para ggtts (https://github.com/dandelion-love/ggtts). No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hk-cantonese-cc0 (este) | 1,7B base + LoRA | yue, zh | Apache-2.0 | safetensors, GGUF | Voz única, datos CC-0, reproducible |
| hk-cantonese-cc0-kitten-tts-2-qat | no disponible | yue | no disponible | no disponible | Variante del mismo autor sobre Kitten-TTS 2 con QAT |
| Qwen3-TTS 12Hz 1.7B Base | 1,7B | no disponible | no disponible | no disponible | Modelo base sin voz cantonés específica; fuentes de datos no divulgadas |
| Qwen3-TTS CustomVoice | no disponible | no disponible | no disponible | no disponible | Incluye control emocional nativo, según la model card |

## Limitaciones y advertencias

- Una sola voz (femenina, `hk_voice_343`); no hay variedad de locutores ni clonación.
- La procedencia de los datos del modelo base Qwen3-TTS no está divulgada, por lo que la garantía CC-0 solo cubre la capa de adaptación, no el modelo completo.
- El control emocional no es nativo: requiere el paquete complementario de *emotion steering*.
- La segmentación en trozos de 45 caracteres puede producir prosodia entrecortada en textos con puntuación escasa.
- No hay benchmarks estandarizados publicados; la evaluación se limita a comparación entre versiones y una escucha ciega con un único oyente.
- Riesgo de alucinación o artefactos en texto fuera de dominio (nombres propios, siglas, mezcla de códigos) no cuantificado.
- La licencia Apache-2.0 permite uso comercial del adaptador, pero el despliegue del modelo base queda sujeto a los términos de Qwen3-TTS, no detallados en la información disponible.
- El repositorio incluye notas internas de laboratorio en el README que pueden confundir sobre rutas y estructura del paquete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Variante GGUF: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts-GGUF
- Paquete de control emocional: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts-emotion-steering
- Variante Kitten-TTS 2 QAT: https://huggingface.co/jmtl/hk-cantonese-cc0-kitten-tts-2-qat
- Variante Kitten-TTS 2 QAT GGUF: https://huggingface.co/jmtl/hk-cantonese-cc0-kitten-tts-2-qat-GGUF
- Receta de entrenamiento: https://github.com/dandelion-love/qwen3-tts-cantonese-recipe
- Runtime ggtts: https://github.com/dandelion-love/ggtts
- Informe técnico de Qwen3-TTS: https://arxiv.org/abs/2601.15621
- Dataset Common Voice 22 yue: https://huggingface.co/datasets/JackyHoCL/common_voice_22_yue
