# demoqqq/banglatts-triple-combined

## Resumen

Bangla TTS Triple-Combined es un modelo de síntesis de voz (text-to-speech) en bengalí publicado por el usuario demoqqq en Hugging Face. Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) entrenado a partir del checkpoint base EMTIAZZ Bangladeshi Bengali VITS, afinado durante 45 épocas sobre un conjunto de datos deduplicado de 4.890 clips (478,7 minutos) que combina tres fuentes: Kiki v2, Rakib v2 y una clonación con ElevenLabs. El checkpoint final corresponde al paso 24.473, con una pérdida de evaluación de 18,65.

El modelo se distribuye exclusivamente en formato ONNX (fp32) compatible con sherpa-onnx, lo que lo hace directamente desplegable en pipelines de TTS offline sin necesidad de framework de entrenamiento. La frecuencia de muestreo es de 22.050 Hz y el vocabulario de tokens consta de 92 entradas, idéntico al de los modelos Kiki v2 y Rakib v2, lo que facilita la reutilización de infraestructura existente para esos modelos.

Su relevancia radica en que cubre una laguna concreta: TTS de calidad para bengalí con un formato de despliegue ligero (ONNX + sherpa-onnx) y un conjunto de parámetros de inferencia documentados. No obstante, la información pública disponible es muy limitada: no hay licencia declarada, no hay benchmarks publicados y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con aprendizaje adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no LLM) |
| Tipos de cuantizacion | fp32 (único formato publicado) |
| Idiomas soportados | bengalí (según model card) |
| Licencia | no disponible |
| Formato de pesos | ONNX (model.onnx), tokens en tokens_sherpa.txt |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo end-to-end que combina un encoder de texto, un predictor de duración, un normalizing flow y un decoder basado en GAN para producir waveform directamente a partir de fonemas/tokens. El modelo parte del checkpoint base EMTIAZZ Bangladeshi Bengali VITS y se afina durante 45 épocas con batch size 8 sobre un dataset deduplicado de 4.890 clips (478,7 minutos) compuesto por Kiki v2, Rakib v2 y una clonación con ElevenLabs. El mejor checkpoint es best_model_24473 (paso 24.473), con eval loss de 18,65.

No se documentan en la información disponible detalles sobre la composición exacta del dataset por fuente, el esquema de aumentación de datos, la presencia de RLHF/DPO (no aplica en TTS) ni innovaciones técnicas adicionales más allá del propio pipeline VITS. La salida es audio mono a 22.050 Hz en fp32, y el modelo se acompaña de un fichero de tokens de 90 líneas (92 tokens de vocabulario) compatible con sherpa-onnx.

## Capacidades

- Síntesis de voz (TTS) en bengalí a partir de texto escrito.
- Generación de audio a 22.050 Hz en formato ONNX fp32.
- Compatibilidad con sherpa-onnx `OfflineTts` (ruta VITS) para inferencia offline.
- Normalización de texto bengalí documentada: descomposición de য়→য+়, ড়→ড+়, ঢ়→ঢ+় (solo formas descompuestas).
- Parámetros de inferencia documentados: noise_scale 0.667, noise_scale_w 0.8, length_scale 1.0, max_num_sentences 1.
- Aplicación de demostración asociada que genera audio y subtítulos SRT/JSON a partir de un guion.
- No se documentan capacidades de clonación de voz en tiempo de inferencia, control de emoción, ni multilingüismo más allá del bengalí.

## Casos de uso

- **Locución automatizada de artículos en bengalí**: el modelo convierte texto escrito en audio a 22.050 Hz, adecuado para publicar versiones en audio de contenidos web o blogs dirigidos a audiencia bangladeshí, usando sherpa-onnx en servidor sin GPU dedicada.
- **Generación de subtítulos y audio sincronizado**: la demo asociada produce audio junto con SRT/JSON, lo que permite generar pistas de subtítulos y narración en un solo paso para vídeos formativos o divulgativos en bengalí.
- **Accesibilidad para lectores de pantalla**: integración en aplicaciones de lectura que necesiten una voz bengalí offline; el formato ONNX y la compatibilidad con sherpa-onnx permiten empaquetar el modelo en aplicaciones de escritorio o móviles sin conexión.
- **Prototipado de asistentes de voz en bengalí**: al ser un modelo pequeño (repo de 0,1 GB) y con parámetros de inferencia documentados, sirve para validar pipelines de TTS en un asistente conversacional antes de invertir en un modelo mayor o en un servicio comercial.
- **Doblaje de material formativo**: narración de cursos, tutoriales o material de e-learning en bengalí, con control de velocidad mediante length_scale y de expresividad mediante noise_scale.
- **Investigación en TTS de bajos recursos**: el modelo y su receta de entrenamiento (base EMTIAZZ, dataset combinado de 478,7 minutos, 45 épocas) sirven como referencia reproducible para experimentos de fine-tuning de VITS en lenguas del sur de Asia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el repositorio ocupa 0,1 GB y el modelo es ONNX fp32, por lo que la inferencia cabe holgadamente en GPUs de consumo e incluso en CPU.
- **GPU recomendadas**: no se especifican; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100). La inferencia en CPU es viable con sherpa-onnx.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo moderna e incluso en sistemas sin GPU dedicada.
- **Opciones de despliegue**: sherpa-onnx (`OfflineTts`, ruta VITS) es la vía documentada; el formato ONNX también permite usar ONNX Runtime directamente.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto/notas |
|---|---|---|---|---|---|
| Bangla TTS Triple-Combined | VITS | bengalí | ONNX fp32 | no disponible | 4.890 clips, 478,7 min, 45 épocas |
| EMTIAZZ Bangladeshi Bengali VITS (base) | VITS | bengalí | no disponible en esta ficha | no disponible | Checkpoint base del que parte este modelo |
| Kiki v2 | VITS | bengalí | no disponible en esta ficha | no disponible | Fuente del dataset y mismo vocabulario de 92 tokens |
| Rakib v2 | VITS | bengalí | no disponible en esta ficha | no disponible | Fuente del dataset y mismo vocabulario de 92 tokens |

La comparación se limita a los modelos mencionados en la model card; no se dispone de datos de rendimiento comparativo (MOS, RTF, WER) para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no declarada**: no hay licencia publicada, lo que impide determinar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- **Idioma único**: solo bengalí; no se documenta soporte multilingüe.
- **Normalización obligatoria del texto**: es necesario descomponer য়, ড় y ঢ় antes de la síntesis; omitirlo puede degradar la pronunciación.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del dominio de entrenamiento (nombres propios, siglas, números).
- **Dataset pequeño y mixto**: 478,7 minutos y tres fuentes heterogéneas (incluida una clonación con ElevenLabs) pueden introducir sesgos de estilo, acento o calidad entre segmentos.
- **Sin benchmarks**: no hay métricas objetivas (MOS, RTF) ni comparativas publicadas; la calidad debe validarse empíricamente antes de usarlo en producción.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento.
- **Formato único**: solo se publica ONNX fp32; no hay versiones cuantizadas ni pesos en safetensors para reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/demoqqq/banglatts-triple-combined
- Demo (script → audio + subtítulos SRT/JSON): https://github.com/demo61141-coder/banglatts-triple-subtitles
- sherpa-onnx (runtime compatible): https://github.com/k2-fsa/sherpa-onnx
