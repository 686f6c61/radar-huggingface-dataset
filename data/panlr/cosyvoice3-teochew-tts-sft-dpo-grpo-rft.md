# panlr/CosyVoice3-Teochew-TTS-SFT-DPO-GRPO-RFT

## Resumen
CosyVoice3-Teochew-TTS-SFT-DPO-GRPO-RFT es un modelo de síntesis de voz (text-to-speech) especializado en teochew (dialecto min nan del sur de China, también llamado chaozhou), desarrollado por el usuario panlr a partir del modelo base FunAudioLLM/Fun-CosyVoice3-0.5B-2512 de FunAudioLLM (Alibaba). El modelo parte de la arquitectura CosyVoice 3 con 0,5 mil millones de parámetros y ha sido afinado mediante una cadena de tres etapas: SFT (supervised fine-tuning), DPO (direct preference optimization) y GRPO/RFT (reinforcement fine-tuning), lo que indica un esfuerzo por alinear la calidad prosódica y la naturalidad del habla en un dialecto con escasos recursos digitales.

Su relevancia radica en que el teochew es una variedad lingüística con muy poca cobertura en sistemas TTS comerciales, y este modelo demuestra que es viable adaptar un modelo base multilingüe de 0,5B a un dialecto concreto mediante técnicas de alineamiento por preferencias. El tag "code-switching" sugiere capacidad para alternar entre teochew y mandarín, un fenómeno habitual en hablantes reales de la región.

El repositorio pesa 7,5 GB y se distribuye en formatos safetensors y ONNX, lo que facilita su despliegue tanto en entornos de investigación como en producción con runtimes de inferencia optimizados. La licencia es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CosyVoice 3 (modelo TTS neuronal, base Fun-CosyVoice3-0.5B-2512) |
| Parametros totales | 0,5 mil millones (500M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen safetensors y ONNX) |
| Idiomas soportados | zh (teochew, con code-switching; tag de idioma: zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento
El modelo se basa en CosyVoice 3, la arquitectura TTS neuronal de FunAudioLLM (Alibaba) que combina un modelo de lenguaje para la generación de tokens de habla con un decoder vocoder para la síntesis de audio. El modelo base Fun-CosyVoice3-0.5B-2512 tiene 0,5B de parámetros, lo que lo sitúa en la gama ligera y permite inferencia en hardware moderado.

El proceso de entrenamiento documentado en el nombre del modelo consta de tres fases: SFT (supervised fine-tuning) sobre datos de teochew, seguido de DPO (direct preference optimization) para alinear la salida con preferencias humanas de naturalidad y prosodia, y finalmente GRPO/RFT (reinforcement fine-tuning) para refinar aún más la calidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del proceso de anotación de preferencias. La inclusión del tag "code-switching" indica que el modelo fue entrenado para manejar alternancia de código entre teochew y mandarín.

## Capacidades
- Síntesis de voz (TTS) en teochew a partir de texto.
- Capacidad de code-switching (alternancia entre teochew y mandarín) según el tag del repositorio.
- Generación de audio en formato ONNX y safetensors, apto para despliegue en producción.
- Afinamiento por preferencias (DPO + GRPO/RFT) orientado a mejorar naturalidad y prosodia.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modos de razonamiento extendido.

## Casos de uso
- **Preservación lingüística del teochew**: generar audiolibros, material educativo y grabaciones de referencia para una lengua con escasa presencia digital, usando el modelo para sintetizar textos transcritos en teochew.
- **Atención al cliente en comunidades teochew-parlantes**: desplegar un TTS que responda en teochew (con code-switching a mandarín) en sistemas de IVR o asistentes telefónicos para poblaciones de la diáspora en el sudeste asiático y China.
- **Locución automatizada para medios regionales**: producir voces en off para vídeos, podcasts y noticias dirigidos a audiencias de Chaozhou/Shantou, reduciendo el coste frente a locutores humanos.
- **Accesibilidad**: convertir texto a voz en teochew para personas con discapacidad visual o dificultades lectoras en comunidades donde el teochew es la lengua oral principal.
- **Investigación en TTS de bajos recursos**: servir como caso de estudio reproducible de adaptación de un modelo base de 0,5B a un dialecto mediante SFT + DPO + GRPO, útil para académicos que trabajen en otras variedades minorizadas.
- **Prototipado de asistentes de voz multilingües**: integrar el modelo en pipelines que requieran alternancia teochew-mandarín, aprovechando el soporte de code-switching para conversaciones naturales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- **VRAM estimada**: al tratarse de un modelo de 0,5B parámetros, la inferencia en FP16 requiere aproximadamente 1-2 GB de VRAM para los pesos, más overhead del vocoder y del runtime (estimación orientativa; no confirmada en la información disponible).
- **GPU recomendadas**: GPU consumer como RTX 3060/4060/4090 son suficientes para un modelo de este tamaño; para producción con concurrencia se recomiendan A100 o H100.
- **Consumer GPU**: sí, cabe en GPUs consumer de gama media gracias al tamaño reducido (0,5B).
- **Opciones de despliegue**: el repositorio incluye ONNX, lo que permite usar ONNX Runtime; la librería declarada es `cosyvoice`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI (son runtimes orientados a LLM, no a TTS).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| CosyVoice3-Teochew-TTS-SFT-DPO-GRPO-RFT | 0,5B | zh (teochew) | Apache 2.0 | Afinado específico para teochew con DPO+GRPO |
| Fun-CosyVoice3-0.5B-2512 (base) | 0,5B | multilingüe (zh y otros) | Apache 2.0 (según modelo base) | Modelo base sin afinamiento a teochew |
| CosyVoice 2 | no disponible | multilingüe | Apache 2.0 | Generación anterior de la familia CosyVoice |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- **Acceso restringido**: el repositorio es gated; es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- **Idioma limitado**: el tag de idioma es únicamente `zh`; no se garantiza calidad fuera del teochew y el mandarín.
- **Riesgo de alucinación prosódica**: como todo modelo TTS, puede generar pronunciaciones incorrectas o prosodia antinatural en palabras poco frecuentes o nombres propios.
- **Sesgos**: al entrenarse sobre un corpus limitado de teochew, puede reflejar sesgos de género, edad o variantes dialectales presentes en los datos.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Fun-CosyVoice3-0.5B-2512 y del acceso gated.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha; es un modelo reciente (noviembre de 2026) sin validación comunitaria extensa.
- **Sin benchmarks publicados**: no hay métricas objetivas (MOS, WER, similitud de hablante) que permitan evaluar su calidad frente a alternativas.

## Enlaces
- Hugging Face: https://huggingface.co/panlr/CosyVoice3-Teochew-TTS-SFT-DPO-GRPO-RFT
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
