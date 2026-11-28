# mlx-community/IndexTTS-2-fp16

## Resumen

IndexTTS-2 es un sistema de síntesis de voz (text-to-speech) zero-shot con clonación de voz, control desacoplado de emoción y control de duración, desarrollado originalmente por IndexTeam y convertido a MLX por la comunidad mlx-community. Esta ficha concreta corresponde a la conversión en fp16 (`mlx-community/IndexTTS-2-fp16`), pensada para ejecutarse de forma nativa en Apple Silicon mediante el framework MLX. El modelo genera audio a 22,05 kHz a partir de una referencia de voz y un texto, sin necesidad de entrenamiento adicional sobre el hablante.

La relevancia actual del modelo radica en dos capacidades poco habituales en TTS zero-shot: el control de emoción separado del timbre del hablante (mediante matrices de preset de 8 emociones) y el control explícito de la duración objetivo del audio generado. Esto lo hace útil para doblaje, audiolibros o asistentes conversacionales donde se requiere ajustar tono emocional y sincronización temporal.

El repositorio consolida en un único conjunto de pesos los distintos componentes del pipeline (GPT autorregresivo, S2Mel flow-matching, vocoder BigVGAN v2, front-end w2v-BERT 2.0, códec semántico MaskGCT RepCodec, embeddings de hablante CampPlus y matrices de emoción), lo que simplifica el despliegue en el ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS híbrido: GPT autorregresivo (UnifiedVoice v2) + flow-matching S2Mel (DiT/WaveNet) + vocoder BigVGAN v2 + front-end w2v-BERT 2.0 + códec semántico MaskGCT RepCodec |
| Parametros totales | 580.493.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos publicados); int8/int4 generados en memoria por el paquete Swift (Linears del GPT, grupo 64) |
| Idiomas soportados | no disponible |
| Licencia | index-model-license (INDEX_MODEL_LICENSE); pesos NonCommercial, requiere autorización escrita de bilibili para uso comercial |
| Formato de pesos | safetensors (MLX) |
| Frecuencia de muestreo de salida | 22,05 kHz |
| Tamano del repositorio | 4,7 GB |

## Arquitectura y entrenamiento

El sistema es un pipeline multi-etapa. La entrada de texto pasa por un tokenizador SentencePiece Unigram de 12k y por un front-end de condicionamiento basado en w2v-BERT 2.0 (en fp32, como en el modelo original). Un GPT autorregresivo (UnifiedVoice v2) transforma texto en tokens semánticos, apoyándose en conformers y perceivers de condicionamiento. Esos códigos semánticos se convierten en mel-espectrogramas mediante S2Mel, un modelo de flow-matching con componentes DiT, WaveNet y un regulador de longitud que permite fijar la duración objetivo. Finalmente, el vocoder BigVGAN v2 sintetiza la forma de onda a 22,05 kHz. El códec semántico MaskGCT RepCodec y el embedding de hablante CampPlus (192 dimensiones) completan el condicionamiento.

El control de emoción se implementa mediante matrices de preset (`emo_matrix` de 73×1280 y `spk_matrix` de 73×192) que desacoplan la emoción del timbre del hablante, con un parámetro `emoAlpha` para modular la intensidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a MLX sigue la lineage de `vanch007/mlx-indextts2-standard-fp16` y se valida contra un oráculo capturado: tokenizador bit-exacto, coseno latente del GPT de 0,9999995, condicionadores ≥0,999999, mel CFM de 0,9999999 y coseno espectral de la forma de onda final de 0,9998.

## Capacidades

- Síntesis de voz zero-shot con clonación de timbre a partir de una referencia de audio.
- Control desacoplado de emoción con 8 presets y modulación de intensidad mediante `emoAlpha`.
- Control de duración objetivo del audio generado (`targetDuration`).
- Generación de audio a 22,05 kHz.
- Inferencia nativa en Apple Silicon mediante MLX.
- Carga en el paquete Swift `xocialize/mlx-indextts2-swift` (MLXEngine `tts`) y en `solar2ain/mlx-indextts`.
- Cuantización int8/int4 en memoria para reducir requisitos de memoria.
- Soporte de tool calling, agentes, visión o audio de entrada: no disponible (modelo exclusivamente TTS).

## Casos de uso

- Doblaje y localización: el control de duración permite ajustar la longitud del audio generado para sincronizar con el vídeo original, y el control de emoción permite replicar el tono de la interpretación original.
- Audiolibros y narración: la clonación zero-shot permite mantener una voz consistente a lo largo de capítulos sin entrenamiento por hablante, ajustando la emoción por escena.
- Asistentes conversacionales en dispositivos Apple: al ejecutarse en MLX sobre Apple Silicon, puede integrarse en aplicaciones macOS/iOS con inferencia local y sin dependencia de servicios en la nube.
- Prototipado de videojuegos: generación de voces de personajes con presets emocionales distintos (enfado, alegría, tristeza) a partir de una única referencia de voz.
- Accesibilidad: conversión de texto a voz personalizada con la voz del propio usuario clonada a partir de una muestra, útil para personas con pérdida de voz.
- Generación de contenido para pódcast y vídeo corto: producción rápida de locuciones con control de emoción y duración para encajar en formatos con límites temporales estrictos.
- Investigación en TTS: banco de pruebas para estudiar el desacoplamiento emoción-timbre y el control de duración en modelos flow-matching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de paridad de la conversión MLX frente al modelo de referencia:

| Métrica de paridad | Valor |
|---|---|
| Tokenizador | bit-exacto |
| Coseno latente GPT | 0,9999995 |
| Coseno condicionadores | ≥0,999999 |
| Coseno mel CFM | 0,9999999 |
| Coseno espectral forma de onda | 0,9998 |
| Nivel de salida | −23,0 dBFS (referencia −23,2 dBFS) |

## Requisitos de hardware

- El repositorio ocupa 4,7 GB en fp16; la VRAM/memoria unificada necesaria para inferencia es aproximadamente ese orden, más overhead de activaciones.
- Diseñado para Apple Silicon (MLX); no se especifican GPU NVIDIA recomendadas.
- La cuantización int8/int4 en memoria reduce el consumo, aunque no se publican cifras exactas de memoria resultante.
- Despliegue mediante el paquete Swift `xocialize/mlx-indextts2-swift` (MLXEngine `tts`) o `solar2ain/mlx-indextts`.
- Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible (no aplica a este pipeline TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Control emoción | Control duración | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| IndexTTS-2 (MLX fp16) | 580 M | no disponible | Sí (8 presets, `emoAlpha`) | Sí (`targetDuration`) | NonCommercial (index-model-license) | MLX / Apple Silicon |
| IndexTTS-2 original (IndexTeam) | no disponible | no disponible | Sí | Sí | index-model-license | PyTorch |
| Alternativas TTS zero-shot | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- Licencia NonCommercial: el uso comercial requiere autorización escrita de bilibili según INDEX_MODEL_LICENSE.
- Solo se distribuyen pesos en fp16; las cuantizaciones int8/int4 se generan en memoria y no hay repos cuantizados separados.
- Plataforma restringida a MLX/Apple Silicon para esta conversión concreta.
- Idiomas soportados no documentados en la información disponible.
- Riesgo de alucinación o artefactos en la síntesis de voz ante referencias de audio de baja calidad o textos fuera de distribución; no cuantificado.
- Sesgos de hablante y prosodia no documentados.
- Longitud de contexto no especificada.
- La paridad se valida a nivel de señal (coseno espectral 0,9998), no mediante evaluaciones perceptuales publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/IndexTTS-2-fp16
- Modelo base: https://huggingface.co/IndexTeam/IndexTTS-2
- Repositorio Swift MLX: https://github.com/xocialize/mlx-indextts2-swift
- Repositorio alternativo: https://github.com/solar2ain/mlx-indextts
- Conversión de referencia: https://huggingface.co/vanch007/mlx-indextts2-standard-fp16
- Licencia: https://github.com/index-tts/index-tts2/blob/main/INDEX_MODEL_LICENSE
