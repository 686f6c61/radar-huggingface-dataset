# mibarhim/whisper-small-pashto

## Resumen

whisper-small-pashto es un ajuste fino de openai/whisper-small para reconocimiento automático de voz (ASR) en pastún (ps), uno de los idiomas con menor cobertura en sistemas de voz. Lo desarrolla el usuario de HuggingFace mibarhim y se entrena sobre el split de entrenamiento de Common Voice Scripted Speech 27.0 en pastún. El modelo base es un transformer encoder-decoder de tipo Whisper con 241.734.912 parámetros, pensado originalmente para ASR multilingüe y traducción de voz.

La relevancia del modelo está en la magnitud de la mejora: el whisper-small original obtiene un WER normalizado de 104,2 sobre el test de Common Voice 27.0 en pastún (es decir, prácticamente inutilizable, con salidas frecuentemente transcritas en alfabeto latino), mientras que este ajuste baja a 27,8 en el mismo conjunto de 5.000 clips. En habla espontánea (Common Voice Spontaneous Speech 5.0) pasa de 91,4 a 33,0. Es, por tanto, un ejemplo de cómo un ajuste fino relativamente contenido (5.000 pasos) puede convertir un modelo multilingüe genérico en una herramienta funcional para un idioma de bajos recursos.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y compatible con la librería transformers y con endpoints de HuggingFace. Su tamaño (aproximadamente 242 millones de parámetros) lo sitúa en el rango de modelos que caben en GPU de consumo, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ajuste fino de openai/whisper-small |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos por defecto; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | pastún (ps) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small: un transformer encoder-decoder con atención estándar, diseñado para tomar espectrogramas de audio mel y generar tokens de texto. El modelo base fue entrenado por OpenAI con 680.000 horas de audio supervisado multilingüe; este ajuste fino especializa el decodificador y el encoder hacia el pastún. No se documentan modificaciones estructurales respecto al modelo base.

El entrenamiento se realizó sobre el split de entrenamiento de Common Voice Scripted Speech 27.0 en pastún, con los siguientes hiperparámetros: learning rate 1e-5, batch size de 32 (entrenamiento y evaluación), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup, 5.000 pasos totales y precisión mixta nativa (AMP). No se indica en la model card el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; por el tipo de tarea (ASR) y el pipeline de Trainer, se trata de un ajuste supervisado estándar con pérdida de entropía cruzada sobre transcripciones. La model card fue generada automáticamente por el Trainer y el autor no la ha revisado ni ampliado.

## Capacidades

- Reconocimiento automático de voz en pastún: transcripción de audio a texto en escritura pastún.
- Manejo de habla leída y habla espontánea: el autor reporta resultados en ambos tipos de conjunto de Common Voice, con degradación moderada en habla espontánea (WER normalizado 33,0 frente a 27,8).
- Normalización de variantes ortográficas: el WER normalizado ignora puntuación, diacríticos y letras que los hablantes de pastún usan de forma intercambiable (ي/ی, ك/ک, ګ/گ, dígitos árabe-índicos), lo que indica que el modelo produce salidas en escritura pastún consistente.
- Compatibilidad con la pipeline `automatic-speech-recognition` de transformers.
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio más allá de ASR, ni modo thinking.
- Capacidad multilingüe: limitada al pastún; no se reporta rendimiento en otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en pastún: el modelo puede convertir grabaciones de audio en texto para actas, notas o subtítulos, con un WER normalizado de 27,8 sobre habla leída de Common Voice, adecuado para revisión humana posterior.
- Subtitulado de vídeo y audio en pastún: integrable en pipelines de procesamiento por lotes con la pipeline de transformers; su tamaño de 242 millones de parámetros permite procesar horas de audio en una sola GPU de consumo.
- Digitalización de archivos orales: transcripción de grabaciones históricas o etnográficas en pastún para su indexación y búsqueda, aprovechando que el modelo funciona tanto en habla leída como espontánea.
- Asistentes de voz y dictado para pastún: base para aplicaciones de entrada por voz en dispositivos o servicios con recursos limitados, dado que el modelo cabe en GPU de gama media.
- Atención al cliente en pastún: transcripción de llamadas o mensajes de voz para su enrutamiento y análisis, con la salvedad de que el WER en habla espontánea (33,0 normalizado) exige revisión humana en dominios sensibles.
- Investigación lingüística y de ASR en idiomas de bajos recursos: punto de partida para experimentos de ajuste fino adicional, aumentación de datos o evaluación de técnicas de normalización ortográfica en pastún.
- Generación de datos de entrenamiento: transcripción masiva de audio en pastún para construir corpus de texto alineado con audio.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente; campo `verified: false` en la model-index).

| Modelo | Conjunto de test | Clips | WER raw | WER normalizado |
|---|---|---|---|---|
| openai/whisper-small | Common Voice 27.0 Pashto | 1.500 | 106,0 | 104,2 |
| whisper-small-pashto | Common Voice 27.0 Pashto | 5.000 | 33,1 | 27,8 |
| openai/whisper-small | Common Voice Spontaneous Speech 5.0 Pashto | 76 | 93,4 | 91,4 |
| whisper-small-pashto | Common Voice Spontaneous Speech 5.0 Pashto | 76 | 40,3 | 33,0 |

Durante el entrenamiento, sobre 500 clips de validación: loss 0,3107 y WER raw 29,10. La evolución por pasos fue: paso 1.000, WER 39,48; paso 2.000, WER 32,79; paso 3.000, WER 29,22; paso 4.000, WER 29,93; paso 5.000, WER 29,10.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1 GB para los pesos (242 millones de parámetros × 4 bytes), más memoria para activaciones y buffers de audio; en la práctica, entre 2 y 4 GB según el tamaño del lote.
- VRAM estimada en FP16/BF16: aproximadamente 0,5 GB para los pesos, más activaciones; entre 1 y 2 GB en total para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100; en estas dos últimas el throughput es mucho mayor para procesamiento por lotes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060).
- Opciones de despliegue: pipeline de transformers, HuggingFace Inference Endpoints (tag `endpoints_compatible`), TGI y servidores compatibles con la API de transformers. No se documentan variantes GGUF ni compatibilidad con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER normalizado (CV 27.0 ps) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-pashto | 241,7 M | ventanas de 30 s (por defecto en Whisper) | 27,8 | Apache 2.0 | HuggingFace |
| openai/whisper-small | 241,7 M | ventanas de 30 s (por defecto en Whisper) | 104,2 | Apache 2.0 | HuggingFace |
| openai/whisper-medium | 769 M | ventanas de 30 s (por defecto en Whisper) | no disponible en la información | Apache 2.0 | HuggingFace |
| openai/whisper-large-v3 | 1.550 M | ventanas de 30 s (por defecto en Whisper) | no disponible en la información | Apache 2.0 | HuggingFace |

La comparación directa con whisper-medium y whisper-large-v3 en pastún no está disponible en la información proporcionada; el autor solo compara con el modelo base whisper-small. En términos de tamaño, whisper-small-pashto es aproximadamente 3,2 veces menor que whisper-medium y 6,4 veces menor que whisper-large-v3, lo que lo hace más adecuado para despliegues con recursos limitados, a costa de una capacidad potencialmente menor en condiciones acústicas difíciles.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo por género, edad, dialecto o región. Al entrenarse solo con Common Voice, el modelo puede tener peor rendimiento en variedades dialectales del pastún poco representadas en ese corpus.
- Riesgo de alucinación: como todo modelo de ASR generativo, puede producir texto que no corresponde al audio, especialmente en segmentos con ruido, silencios largos o audio fuera de dominio. El WER raw de 33,1 indica que una parte significativa de las transcripciones contiene errores literales.
- Limitaciones de contexto e idioma: el modelo solo está entrenado y evaluado en pastún; no se garantiza su comportamiento en otros idiomas ni en code-switching. No se documenta el manejo de audio de más de 30 segundos (el límite por defecto de Whisper) ni estrategias de chunking.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación de conservar el aviso de licencia y el archivo NOTICE si existe. No se imponen restricciones adicionales conocidas.
- Caveats para producción: los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`). El conjunto de habla espontánea tiene solo 76 clips, por lo que la métrica de 33,0 tiene un intervalo de confianza amplio. La model card fue generada automáticamente y no ha sido revisada en profundidad. El repo ocupa 14,5 GB, lo que sugiere que puede contener checkpoints intermedios además de los pesos finales.
- Calidad de la normalización: el WER normalizado depende de reglas específicas de normalización ortográfica del pastún; comparaciones con otros modelos que usen reglas distintas pueden no ser directamente equiparables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mibarhim/whisper-small-pashto
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset Common Voice: https://commonvoice.mozilla.org/
- Repositorio de transformers: https://github.com/huggingface/transformers
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
