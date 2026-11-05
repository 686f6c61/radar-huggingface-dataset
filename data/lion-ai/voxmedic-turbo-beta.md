# lion-ai/VoxMedic-turbo-beta

## Resumen

VoxMedic-turbo-beta es un modelo de reconocimiento automático del habla (ASR) especializado en dominio médico y en polaco, desarrollado por lion-ai. Se construye como un fine-tuning de openai/whisper-large-v3-turbo, el modelo de OpenAI de arquitectura encoder-decoder transformer optimizada para transcripción con menor coste computacional que whisper-large-v3. El modelo resuelve el problema de la degradación de rendimiento que sufren los modelos ASR generalistas al aplicarse sobre vocabulario clínico, terminología farmacológica y nombres de especialidades en polaco.

La propuesta técnica combina tres estrategias complementarias: fine-tuning supervisado sobre datasets médicos en polaco (admed_voice, pl_med_asr_test2, bigos), destilación de conocimiento y interpolación de pesos para mitigar el olvido catastrófico (anti-forgetting) del rendimiento generalista original. El resultado es un modelo de aproximadamente 809 millones de parámetros que mantiene capacidades de transcripción general mientras mejora la precisión en el dominio médico polaco.

Es relevante ahora porque cubre un nicho poco atendido: ASR médico en una lengua de recursos medios como el polaco, con una licencia comunitaria propia y distribución restringida (gated) que exige aceptación de condiciones. Su tamaño contenido (2,5 GB en safetensors) lo hace desplegable en hardware modesto, lo que facilita su integración en entornos clínicos con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pl (polaco) |
| Licencia | medalion-eskulap-asr-community-license-v1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de whisper-large-v3-turbo: un transformer encoder-decoder con atención estándar, diseñado para procesar ventanas de audio de 30 segundos y generar transcripciones token a token. La variante "turbo" de Whisper reduce el número de capas del decoder respecto a large-v3, lo que explica su menor tamaño (809 M de parámetros frente a los 1.550 M de large-v3) manteniendo la mayor parte de la calidad de transcripción.

El entrenamiento parte de los pesos de openai/whisper-large-v3-turbo y aplica fine-tuning sobre datasets médicos en polaco: lion-ai/admed_voice, lion-ai/pl_med_asr_test2 y lion-ai/bigos. Según los tags del repositorio, se emplean tres técnicas: fine-tuning supervisado, destilación de conocimiento (knowledge distillation) e interpolación de pesos (weight interpolation). La combinación de destilación e interpolación apunta a preservar el rendimiento del modelo base en habla general (estrategia anti-forgetting) mientras se especializa en terminología médica. No se dispone de información sobre el número exacto de tokens de audio utilizados, la composición detallada de los datasets ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en polaco, con especialización en vocabulario médico.
- Transcripción de audio a texto con terminología clínica, farmacológica y de especialidades médicas.
- Preservación del rendimiento generalista gracias a las técnicas anti-forgetting aplicadas durante el entrenamiento.
- Salida de texto plano; no se documenta soporte de marcas de tiempo, diarización ni puntuación avanzada.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe más allá del polaco.
- No se documenta modo thinking, visión ni audio más allá de la transcripción estándar.

## Casos de uso

- Transcripción de consultas médicas: el modelo convierte grabaciones de visitas clínicas en polaco a texto escrito, manejando terminología diagnóstica y nombres de fármacos que los ASR generalistas suelen transcribir mal.
- Documentación clínica automatizada: integración en sistemas de historia clínica electrónica para generar borradores de notas a partir de dictados de personal sanitario en polaco.
- Dictado de informes radiológicos y de laboratorio: la especialización en vocabulario médico reduce errores en términos anatómicos y valores analíticos, lo que disminuye la carga de corrección manual.
- Telemedicina y atención remota: transcripción en tiempo casi real de consultas telefónicas o videollamadas en polaco, con el tamaño contenido del modelo (2,5 GB) permitiendo despliegue en servidores modestos.
- Investigación clínica y farmacovigilancia: procesamiento de entrevistas y registros de audio de ensayos clínicos en polaco para extraer eventos adversos y datos estructurados.
- Accesibilidad en entornos sanitarios: generación de subtítulos para contenido formativo médico en polaco, aprovechando la ventana de audio de 30 segundos por segmento propia de Whisper.
- Archivado y búsqueda de audio clínico: transcripción masiva de archivos de audio históricos para habilitar búsqueda por texto sobre registros médicos en polaco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6-2 GB para los pesos (809 M de parámetros a 2 bytes), más overhead de activaciones y buffers de audio; en la práctica, 3-4 GB de VRAM son suficientes.
- VRAM estimada en cuantización int8: en torno a 1 GB para pesos, con 2-3 GB totales incluyendo overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo es pequeño para su categoría.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM (GTX 1650 en adelante, con margen).
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), faster-whisper, whisper.cpp, vLLM (soporte ASR limitado), TGI (soporte ASR limitado). El formato safetensors es compatible con transformers y faster-whisper.
- Latencia y throughput estimados: no disponible en la información proporcionada; al derivar de whisper-large-v3-turbo, se espera un throughput superior al de whisper-large-v3 en hardware equivalente, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| lion-ai/VoxMedic-turbo-beta | 809 M | 30 s por ventana | pl (especializado médico) | medalion-eskulap-asr-community-license-v1.0 | Gated |
| openai/whisper-large-v3-turbo | 809 M | 30 s por ventana | multilingüe (99 idiomas) | Apache 2.0 | Abierto |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | multilingüe (99 idiomas) | Apache 2.0 | Abierto |
| openai/whisper-medium | 769 M | 30 s por ventana | multilingüe (99 idiomas) | Apache 2.0 | Abierto |

La comparativa directa más relevante es con whisper-large-v3-turbo, del que deriva: VoxMedic sacrifica cobertura multilingüe y licencia permisiva a cambio de especialización médica en polaco. Frente a whisper-large-v3, ofrece la mitad de parámetros con la especialización añadida, aunque sin datos de benchmarks publicados que cuantifiquen la mejora. No se dispone de información sobre modelos ASR médicos comparables en polaco con los que contrastar directamente.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre datasets médicos en polaco, puede presentar sesgos hacia el registro clínico formal y degradarse en habla coloquial, dialectos regionales o jerga no médica.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible en pasajes de audio con ruido, silencios prolongados o solapamiento de hablantes; en contexto médico esto es especialmente crítico y exige revisión humana.
- Limitaciones de contexto: la ventana de audio de 30 segundos por segmento es inherente a la arquitectura Whisper; audios más largos requieren segmentación previa.
- Limitaciones de idioma: solo se declara soporte de polaco; no se garantiza rendimiento en otras lenguas pese a derivar de un modelo multilingüe.
- Restricciones de licencia: la licencia medalion-eskulap-asr-community-license-v1.0 es una licencia comunitaria propia, no una licencia open source estándar; es necesario revisar sus términos antes de uso comercial. El acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace.
- Caveat para producción: no se han publicado benchmarks ni métricas de WER (word error rate) en la información disponible, por lo que la mejora respecto al modelo base no está cuantificada públicamente; se recomienda evaluar con un conjunto de validación propio antes de desplegar en entornos clínicos.
- Advertencia regulatoria: un modelo ASR en dominio médico no sustituye la validación clínica ni el cumplimiento de normativas sanitarias (por ejemplo, MDR en la UE) si se integra en productos sanitarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lion-ai/VoxMedic-turbo-beta
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset admed_voice: https://huggingface.co/datasets/lion-ai/admed_voice
- Dataset pl_med_asr_test2: https://huggingface.co/datasets/lion-ai/pl_med_asr_test2
- Dataset bigos: https://huggingface.co/datasets/lion-ai/bigos
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
