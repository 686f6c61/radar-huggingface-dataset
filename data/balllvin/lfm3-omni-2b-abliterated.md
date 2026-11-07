# balllvin/LFM3-Omni-2B-abliterated

## Resumen

LFM3-Omni-2B-abliterated es una modificación comunitaria del modelo omni de Liquid AI, LFM3-Omni-2B, publicada por el usuario balllvin. El modelo original es el primer modelo "omni" de Liquid AI: un único modelo end-to-end de 2.166 millones de parámetros que comprende texto, imágenes, vídeo y audio, y responde en texto, voz o texto y voz intercalados. Está diseñado para ejecución en dispositivo, sustituyendo a la vez un modelo ASR, un modelo visión-lenguaje, un LLM y un modelo TTS.

La modificación consiste en trasplantar la "abliteración" (eliminación de la dirección de rechazo) del modelo de texto orcarouter/LFM3-1.7B-abliterated al núcleo lingüístico de Omni, manteniendo intactos todos los componentes de audio y visión: encoder y conector de audio, encoder y conector de visión, decodificador de profundidad para la síntesis de voz y códec de voz. Solo se modificaron los 286 tensores del núcleo lingüístico.

El interés de esta ficha radica en que documenta una técnica de edición de pesos (task arithmetic) aplicada a un modelo multimodal, con una evaluación comparativa explícita frente al original. El resultado es un modelo con menos rechazos de seguridad que conserva, dentro del ruido estadístico, las capacidades de reconocimiento de voz, respuesta a preguntas habladas, respuesta a preguntas sobre imágenes y síntesis de voz del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 Omni (transformer multimodal any-to-any; encoder de audio, encoder de visión, núcleo lingüístico, decodificador de profundidad y códec de voz) |
| Parámetros totales | 2.166.928.384 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (MLX y Transformers en GPU NVIDIA); fp32 (CPU y Apple MPS). No hay build de 4 bits prevista |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (model.safetensors), con código custom (`custom_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de LFM3-Omni-2B de Liquid AI: un sistema end-to-end que integra percepción multimodal (audio, imagen, vídeo, texto) y generación multimodal (texto y voz). Los componentes de audio y visión se mantienen exactamente como los publicó Liquid. El núcleo lingüístico tiene la misma forma que LFM3-1.7B, pero sus pesos se han alejado considerablemente de ese modelo: la distancia relativa medida tensor a tensor es del 54 % respecto a LFM3-1.7B y del 43 % respecto a LFM3-1.7B-Base.

Por ello, no fue posible un simple reemplazo del núcleo: al sustituirlo directamente por el núcleo abliterado, la tasa de error de palabras en reconocimiento de voz pasó del 2,6 % al 674,0 % y la respuesta a preguntas habladas cayó del 62,0 % al 1,0 %. En su lugar se aplicó task arithmetic (Ilharco et al., 2023): se calculó la diferencia tensor a tensor entre orcarouter/LFM3-1.7B-abliterated y LiquidAI/LFM3-1.7B y se sumó al núcleo de Omni, según la fórmula `new core = Omni core + (changed LFM3-1.7B − LFM3-1.7B)`. El desplazamiento resultante es del 1,0 % del tamaño del núcleo. No se realizó ningún entrenamiento sobre Omni. El archivo `graft.json` registra el método y los sha256 de las entradas.

## Capacidades

- Comprensión de texto, imagen, vídeo y audio en un único modelo end-to-end.
- Generación de texto, voz o texto y voz intercalados.
- Reconocimiento de voz (ASR) integrado, con una tasa de error de palabras del 2,7 % en LibriSpeech test-clean (100 clips).
- Respuesta a preguntas habladas (VoiceBench OpenBookQA): 63,0 % de acierto.
- Respuesta a preguntas sobre imágenes (MMStar): 59,8 % de acierto.
- Síntesis de voz con decodificador de profundidad y códec de voz propios.
- Function calling: 90,0 % en BFCL v3 simple y 77,5 % en BFCL v3 live simple.
- Razonamiento matemático de primaria: 82,0 % en GSM8K (primeros 50 ítems).
- Tareas de agente con herramientas sobre documentos financieros (SEC filings).
- Modelo no razonador (non-reasoning), igual que el Omni original; las tareas financieras se ejecutaron con "thinking" activado.
- La abliteración reduce los rechazos de seguridad del modelo base.

## Casos de uso

- Asistente de voz en dispositivo: el modelo sustituye a la vez un ASR, un LLM y un TTS, lo que permite construir interfaces conversacionales por voz en hardware local sin orquestar tres modelos separados.
- Transcripción y comprensión de audio: reconocimiento de voz con un 2,7 % de WER en test-clean, apto para dictado, subtitulado o extracción de información de reuniones.
- Descripción y pregunta-respuesta sobre imágenes: con un 59,8 % en MMStar, sirve para asistencia a personas con discapacidad visual, catalogación de imágenes o inspección visual asistida.
- Agentes con herramientas: el 90,0 % en BFCL v3 simple permite integrarlo en flujos de function calling para automatizar consultas a APIs y sistemas internos.
- Automatización de análisis financiero: las tareas de agente sobre SEC filings con herramientas obtuvieron un 7,3 % de puntuación numérica media, con un 85,0 % de envío de respuesta; útil como base para prototipos de extracción de datos de informes.
- Respuesta a preguntas habladas sobre un corpus: el 63,0 % en VoiceBench OpenBookQA lo hace adecuado para asistentes de consulta por voz sobre documentación.
- Tutoría de matemáticas de primaria: el 82,0 % en GSM8K permite resolver problemas aritméticos paso a paso en texto.
- Prototipado de investigación sobre edición de pesos: el propio método (task arithmetic sobre un núcleo multimodal) es reproducible y está documentado en `graft.json`, útil para estudiar alineación y abliteración.

## Benchmarks y rendimiento

Resultados frente al Omni original. Las diferencias con rango del 95 % que incluye cero están dentro del ruido.

| Habilidad | Omni original | Este modelo | Diferencia (rango 95 %) |
|---|---|---|---|
| Reconocimiento de voz (LibriSpeech test-clean, 100 clips, WER) | 2,6 % (1,9–3,4) | 2,7 % (2,0–3,6) | +0,2 pt (+0,0 a +0,4) |
| Preguntas habladas (VoiceBench OpenBookQA, 100, accuracy) | 62,0 % (52,2–70,9) | 63,0 % (53,2–71,8) | +1,0 pt (+0,0 a +3,0) |
| Preguntas sobre imágenes (MMStar, 102, accuracy) | 64,7 % (55,1–73,3) | 59,8 % (50,1–68,8) | −4,9 pt (−9,8 a +0,0) |
| Salida de voz (40 frases, WER de la transcripción) | 2,3 % (0,9–3,9) | 2,1 % (0,8–3,6) | −0,1 pt (−1,0 a +0,5) |

Resultados en texto, frente al Omni original y al LFM3-1.7B abliterado (solo texto):

| Tarea | Omni original | LFM3-1.7B abliterado | Este modelo | Diferencia vs Omni |
|---|---|---|---|---|
| Function calling, BFCL v3 simple (40) | 90,0 % | 80,0 % | 90,0 % | +0,0 pt |
| Function calling, BFCL v3 live simple (40) | 75,0 % | 70,0 % | 77,5 % | +2,5 pt |
| Matemáticas de primaria, GSM8K (50) | 78,0 % | 70,0 % | 82,0 % | +4,0 pt |
| Tareas de agente financiero (20, SEC filings con herramientas) | 4,2 % | 11,2 % | 7,3 % | +3,1 pt |
| Tareas financieras con respuesta enviada | 95,0 % | 30,0 % | 85,0 % | −10,0 pt |

El autor advierte que los conjuntos son pequeños (20 a 50 ítems) y que deben interpretarse como una comprobación de que nada se rompió, no como una clasificación.

## Requisitos de hardware

- Memoria pico medida: 5,3 GB con MLX en bf16 y 14,4 GB con Transformers sobre Apple MPS en fp32.
- El autor ejecutó ambas rutas en un Apple M5 Pro; la ruta de Transformers no se probó en GPU NVIDIA.
- Para Transformers en GPU NVIDIA se requiere bf16; en CPU y Apple MPS, fp32.
- Versiones mínimas: mlx-vlm 0.7.12 o superior para la ruta MLX; Transformers 5.20.2 o superior para la ruta Transformers.
- No hay build de 4 bits prevista, lo que limita el despliegue en GPUs de consumo con poca VRAM.
- Opciones de despliegue documentadas: mlx-vlm (Mac) y Transformers (GPU NVIDIA, CPU o Apple MPS). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- No se proporcionan datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-abliterated (este) | 2.166.928.384 | no disponible | texto, imagen, vídeo, audio; salida texto y voz | lfm1.0 | Hugging Face |
| LiquidAI/LFM3-Omni-2B | 2B (según model card) | no disponible | texto, imagen, vídeo, audio; salida texto y voz | lfm1.0 | Hugging Face |
| orcarouter/LFM3-1.7B-abliterated | no disponible | no disponible | solo texto | no disponible | Hugging Face |

Las diferencias de rendimiento entre este modelo y el Omni original se detallan en la sección de benchmarks. No se dispone de datos de benchmarks de orcarouter/LFM3-1.7B-abliterated más allá de los de texto recogidos en la tabla anterior.

## Limitaciones y advertencias

- La abliteración reduce los rechazos de seguridad; el autor declara que la responsabilidad de uso y de lo generado recae en el usuario.
- Es un modelo no razonador: no incorpora modo de pensamiento extendido salvo el que el arnés active en tareas concretas.
- No se midieron la entrada de vídeo ni el chat con voz intercalada.
- No hay build de 4 bits prevista, lo que restringe el despliegue en hardware con poca memoria.
- Los conjuntos de evaluación son pequeños (20 a 50 ítems) y sus intervalos de confianza son amplios; no deben usarse como ranking.
- La licencia lfm1.0 es "other" y debe consultarse antes de uso comercial; el autor no detalla restricciones adicionales.
- El modelo solo modifica `model.safetensors`; el resto de archivos son originales de Liquid AI, con el código y las plantillas sin cambios.
- Los idiomas soportados no están documentados en la información disponible.
- La longitud de contexto no está documentada en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/LFM3-Omni-2B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Modelo abliterado de origen: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Referencia de task arithmetic: Ilharco et al., 2023, arXiv:2212.04089 (https://arxiv.org/abs/2212.04089)
