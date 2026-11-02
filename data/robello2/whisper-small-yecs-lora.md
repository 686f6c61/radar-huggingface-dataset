# robello2/whisper-small-yecs-lora

## Resumen

whisper-small-yecs-lora es un ajuste fino de openai/whisper-small, el modelo de reconocimiento automatico del habla (ASR) de OpenAI, especializado en habla con cambio de codigo (code-switching) yoruba-ingles. Lo publica el usuario robello2 en HuggingFace y esta entrenado sobre el corpus YECS (Yoruba-English Code-Switched Speech), un conjunto de 75.999 enunciados con etiquetado por palabra. El problema que aborda es concreto: los modelos ASR multilingues genericos rinden mal cuando el hablante alterna entre yoruba e ingles dentro de la misma frase, algo habitual en comunidades bilingues de Nigeria.

Tecnicamente es un transformer encoder-decoder de tipo Whisper con 241,7 millones de parametros totales. El ajuste se hizo con LoRA (rank 32, alpha 64) sobre todas las capas lineales de encoder y decoder, con los pesos base congelados, y el adaptador se ha fusionado en los pesos finales, por lo que se carga como un Whisper estandar. El contexto de audio es el nativo de Whisper-small: ventanas de 30 segundos.

Su relevancia es acotada pero clara: cubre un nicho (ASR yoruba-ingles con code-switching) que los modelos generalistas no resuelven bien, y lo hace con un coste de inferencia bajo al partir de la variante small. La licencia NOODL-1.0 y el hecho de que no tenga descargas ni likes en el momento de la consulta indican que es un artefacto de investigacion, no un modelo listo para produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ajuste LoRA fusionado |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s (nativo de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con las cuantizaciones habituales de Whisper) |
| Idiomas soportados | yoruba (yo), ingles (en) |
| Licencia | NOODL-1.0 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es la arquitectura Whisper-small: un encoder que procesa espectrogramas Mel en ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto, con tokens especiales de idioma y de tarea. El ajuste se realizo con LoRA de rank 32, alpha 64 y dropout 0.0 aplicado a todas las capas lineales de los bloques del encoder y del decoder, manteniendo congelados los pesos originales. Se entrenaron 12.976.128 parametros. El adaptador se ha fusionado en los pesos publicados, de modo que el repositorio se carga como un Whisper convencional sin necesidad de cargar adaptadores PEFT.

El entrenamiento uso el split congelado de entrenamiento del corpus YECS, con 75.999 enunciados y un conjunto de desarrollo interno reservado. Cada enunciado recibio un token de idioma (`<|en|>` o `<|yo|>`) asignado por mayoria de las etiquetas por palabra, con desempate hacia ingles. Hiperparametros: learning rate 1e-4, warmup de 500 pasos, batch 16 con acumulacion 2, precision bf16, maximo 10 epocas y early stopping con paciencia 3 sobre el WER greedy de desarrollo. Se selecciono el paso 8000 y el entrenamiento se detuvo en el paso 11000 (4,63 epocas), con semilla 42. La decodificacion recomendada es con deteccion automatica de idioma.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en yoruba e ingles.
- Manejo de habla con cambio de codigo yoruba-ingles dentro de una misma frase, que es el objetivo central del ajuste.
- Etiquetado interno por idioma a nivel de enunciado para guiar el entrenamiento; en inferencia se recomienda decodificacion con idioma automatico.
- Evaluacion con protocolo sensible a tonos y a cambios de idioma (normalizacion NFC, puntuacion eliminada, diacriticos conservados).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.
- No se documenta modo de razonamiento (thinking) ni otras capacidades especiales.

## Casos de uso

- Transcripcion de conversaciones bilingues yoruba-ingles: el modelo esta entrenado especificamente para alternancia de idioma, por lo que es adecuado para entrevistas, reuniones o llamadas donde los hablantes mezclan ambas lenguas.
- Subtitulado de contenido audiovisual nigeriano: permite generar subtitulos en contextos donde el habla alterna entre yoruba e ingles, un escenario frecuente en medios y redes sociales.
- Investigacion sociolinguistica: facilita la transcripcion de corpus de habla code-switched para analisis de frecuencia de cambio de idioma, prestamos lexicos y variacion dialectal.
- Atencion al cliente en centros de contacto de Nigeria: transcripcion de llamadas para analitica y control de calidad en entornos donde el agente y el cliente alternan idiomas.
- Documentacion clinica o legal dictada: transcripcion de notas de voz bilingues para su posterior revision humana, con la ventaja de un modelo pequeno y desplegable en local.
- Prototipos de asistentes de voz: al ser un modelo de 241 millones de parametros, sirve como componente ASR en pipelines de bajo coste para pruebas de concepto en yoruba-ingles.
- Evaluacion comparativa de ASR code-switched: util como referencia para medir el efecto de tecnicas LoRA en tareas de cambio de codigo.

## Benchmarks y rendimiento

Resultados internos de desarrollo publicados por el autor (beam 5, idioma automatico, porcentajes):

| Metrica | Valor |
|---|---|
| WER | 16,18 |
| CER | 5,88 |
| DI-WER | 12,57 |
| err_yo | 18,66 |
| err_en | 10,05 |
| pier_yo | 21,20 |
| switch_near_err | 13,92 |
| switch_away_err | 14,36 |
| ins_per_word | 2,03 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,5 GB de pesos mas el overhead de activaciones y del encoder de audio; cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); tambien A100/H100 para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en CPU para uso no interactivo.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), faster-whisper, whisper.cpp, vLLM con soporte de audio, TGI si la version lo permite.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia |
|---|---|---|---|---|
| whisper-small-yecs-lora | 241,7 M | yo, en | ASR code-switched yoruba-ingles | NOODL-1.0 |
| openai/whisper-small | 241,7 M | multilingue (99 idiomas) | ASR generico | MIT (pesos originales) |
| openai/whisper-base | 74,4 M | multilingue | ASR generico, menor precision | MIT |
| openai/whisper-medium | 769 M | multilingue | ASR generico, mayor precision | MIT |

La comparativa se limita a la familia Whisper porque no se dispone de datos de otros modelos especializados en yoruba-ingles code-switched en la informacion proporcionada. El modelo aqui descrito hereda el tamano de whisper-small pero sustituye el comportamiento multilingue generico por un ajuste especifico; no se dispone de resultados de whisper-small original sobre YECS para cuantificar la mejora.

## Limitaciones y advertencias

- Sesgos: entrenado exclusivamente con el corpus YECS, por lo que puede generalizar mal a otras variedades de yoruba, a registros formales o a hablantes con acentos no representados.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio de baja calidad.
- Limitaciones de contexto: ventanas de 30 segundos; audios mas largos requieren segmentacion y pueden perder coherencia entre fragmentos.
- Limitaciones de idioma: solo yoruba e ingles; no se debe esperar buen rendimiento en otras lenguas.
- Restricciones de licencia: NOODL-1.0 es una licencia no estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial, y ademas el corpus YECS tiene sus propias condiciones.
- Caveat de produccion: sin descargas ni validacion externa, y con resultados solo en desarrollo interno; conviene evaluar en un conjunto propio antes de desplegar.
- El token de idioma se asigno por mayoria de etiquetas por palabra con desempate hacia ingles, lo que puede introducir sesgo hacia ingles en enunciados mixtos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robello2/whisper-small-yecs-lora
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
