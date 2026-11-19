# finanfa-tech/finanfa-fon-asr-v5

## Resumen

finanfa-fon-asr-v5 es un modelo de reconocimiento automatico del habla (ASR) especializado en fon (fɔngbè), una lengua gbe hablada principalmente en Benin. Lo desarrolla Finanfa Tech (AWADEME Ronaldo) mediante fine-tuning de openai/whisper-small, sobre el que se aplica una conversion a CTranslate2 en cuantizacion int8 para inferencia eficiente en CPU. El repositorio ocupa 0,2 GB y se distribuye bajo licencia CC-BY-SA-4.0.

El modelo resuelve un problema concreto: Whisper no incluye el fon entre sus lenguas de decodificacion, por lo que el ajuste fino debe acompanarse de una eleccion explicita del token de idioma frances durante la inferencia. La version 5 se reentrena sobre un subconjunto mas variado en voces del corpus JML-fon-speech-v1 y reduce el WER con tonos del 86,2 % de la v4 al 33,9 % en la version int8 publicada (31,8 % en la version sin cuantizar).

Su relevancia radica en que cubre una lengua de bajos recursos con transcripcion tonal, un aspecto que la mayoria de sistemas ASR multilingues no preservan. La arquitectura subyacente es un transformer encoder-decoder de tipo Whisper-small, con aproximadamente 244 millones de parametros en su version original, ventana de audio de 30 segundos y sin soporte de marcas de tiempo en esta configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small), convertido a CTranslate2 |
| Parametros totales | no disponible (Whisper-small tiene aproximadamente 244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de hasta 30 segundos por segmento (ventana nativa de Whisper) |
| Tipos de cuantizacion | int8 (version publicada); pesos de precision completa no publicados |
| Idiomas soportados | fon (fɔngbè); decodificacion forzada con token de idioma frances |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | CTranslate2 (libreria ctranslate2 / faster-whisper) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con atencion completa disenado para ASR y traduccion de voz. Sobre la version v4 (Whisper-small afinado con 7.732 ejemplos de fon) se realiza un segundo ajuste fino con 5.962 enunciados (12,5 horas, 269 locutores, maximo 100 enunciados por locutor) extraidos del corpus JML-fon-speech-v1, que representa aproximadamente el 9 % del texto transcrito del corpus. La validacion usa 521 enunciados de 63 locutores y el test 1.019 enunciados de 120 locutores no vistos en entrenamiento ni validacion.

Los hiperparametros documentados son: tasa de aprendizaje 1e-5 con decaimiento lineal y 100 pasos de calentamiento, batch de 16, fp16, semilla 42 y GPU Tesla T4 en Kaggle. Se planificaron 4 epocas, pero la epoca 3 obtuvo el mejor WER de validacion (31,1 % con tonos, 24,8 % sin tonos) y es la publicada. Las transcripciones de referencia conservan los diacriticos tonales aportados por linguistas; solo se eliminaron comillas alrededor de nombres y palabras francesas. La conversion a CTranslate2 int8 reduce el peso a 248 MB y anade aproximadamente 2 puntos de WER respecto a la version sin cuantizar, aunque el autor advierte que las dos mediciones no usan exactamente el mismo codigo de decodificacion.

## Capacidades

- Transcripcion de voz a texto en fon con preservacion de tonos (diacriticos Unicode).
- Reconocimiento de habla leida grabada en contexto telefonico, correspondiente a la distribucion del corpus JML.
- Decodificacion por segmentos de audio de hasta 30 segundos, en formato mono a 16 kHz.
- Inferencia en CPU mediante CTranslate2 con cuantizacion int8.
- Integracion con el ecosistema faster-whisper y con el feature extractor y tokenizador de openai/whisper-small.
- Generacion con beam search configurable (beam_size=1 en el ejemplo del autor).
- No soporta marcas de tiempo, tool calling, agentes, vision ni audio mas alla de la ventana de 30 segundos.
- Capacidad multilingue limitada al fon; no se ha evaluado su comportamiento en otras lenguas.

## Casos de uso

- Transcripcion de corpus linguisticos de fon: el modelo permite digitalizar grabaciones de hablantes nativos preservando los tonos, lo que resulta util para documentacion y estudio de la lengua. Es adecuado porque el entrenamiento se hizo sobre transcripciones con diacriticos tonales.
- Subtitulado y archivado de material oral en fon: para entrevistas, testimonios o grabaciones de campo de menos de 30 segundos por segmento, el modelo genera texto base que un revisor humano puede corregir.
- Preservacion digital de lenguas de bajos recursos: al estar bajo CC-BY-SA-4.0 y derivar de un corpus abierto, puede integrarse en proyectos comunitarios de documentacion linguistica con atribucion a J'aime Ma Langue.
- Prototipado de asistentes de voz en fon: el modelo sirve como componente ASR en pruebas de concepto, ejecutable en CPU gracias a la cuantizacion int8 y al reducido tamano de 248 MB.
- Investigacion en ASR de lenguas tonales: proporciona una linea base reproducible (test de 1.019 enunciados, 120 locutores) para comparar tecnicas de modelado tonal.
- Preprocesamiento de audio para pipelines de analisis textual: transcripcion por lotes en servidores sin GPU, dado que CTranslate2 int8 esta optimizado para CPU.
- No es adecuado para decisiones sanitarias, legales o financieras sin revision humana, segun advierte el propio autor, debido a una tasa de error de aproximadamente un palabra de cada cuatro.

## Benchmarks y rendimiento

Test: 1.019 enunciados, 120 locutores ausentes del entrenamiento. Decodificacion glotona, idioma de decodificacion fijado en frances, texto en minusculas y sin puntuacion.

| Modelo | WER con tonos | WER sin tonos | CER con tonos | CER sin tonos |
|---|---|---|---|---|
| v4 (anterior) | 86,2 % | 63,0 % | 37,6 % | 27,0 % |
| v5 precision completa (no publicada) | 31,8 % | 25,2 % | 13,6 % | 10,6 % |
| v5 int8 (este repositorio) | 33,9 % | 27,4 % | 16,0 % | 13,1 % |

No se han publicado resultados comparativos con otros modelos ASR para fon en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; la version publicada es int8 para CPU (248 MB de pesos).
- GPU recomendadas: no disponibles; el entrenamiento se realizo en una Tesla T4. Para inferencia en GPU podria usarse la version sin cuantizar, no publicada.
- Cabe en cualquier CPU consumer moderna; el consumo de memoria es de unos cientos de MB.
- Opciones de despliegue: CTranslate2 (libreria nativa) y faster-whisper. No se distribuyen pesos en formato GGUF ni safetensors, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finanfa-fon-asr-v5 | aprox. 244 M (Whisper-small) | 30 s | fon | CC-BY-SA-4.0 | Publico en Hugging Face (int8) |
| openai/whisper-small | aprox. 244 M | 30 s | multilingue (sin fon) | MIT | Publico |
| finanfa-fon-asr-v4 | aprox. 244 M (Whisper-small) | 30 s | fon | no disponible | Referenciado por el autor; no se detalla su disponibilidad |

No se dispone de informacion sobre otros modelos ASR especializados en fon para una comparativa mas amplia.

## Limitaciones y advertencias

- Entrenado exclusivamente con habla leida grabada por telefono; no se ha evaluado con habla espontanea, radio, conversaciones ni entornos ruidosos, donde el rendimiento puede degradarse notablemente.
- El autor no ha verificado si el modelo ha olvidado capacidades de la v4 sobre sus datos anteriores; no debe considerarse un reemplazo universal de v4.
- Errores frecuentes: tonos mal situados, segmentacion incorrecta de palabras y nombres propios. Aproximadamente uno de cada cuatro palabras es erroneo.
- No apto para decisiones importantes (salud, derecho, finanzas) sin supervision humana.
- Solo se uso el 9 % del corpus; se esperan versiones entrenadas con mas datos.
- Limite de 30 segundos por frase y sin marcas de tiempo.
- Sobre silencio o audio en otra lengua, Whisper puede generar texto inventado (alucinacion).
- Requiere forzar el token de idioma frances en la decodificacion; sin el, la salida puede no ser fon.
- Licencia CC-BY-SA-4.0: obliga a atribucion a J'aime Ma Langue y a compartir las obras derivadas bajo la misma licencia, lo que condiciona el uso comercial.
- Los pesos sin cuantizar se conservan en privado y no estan disponibles publicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finanfa-tech/finanfa-fon-asr-v5
- Dataset JML-fon-speech-v1: https://huggingface.co/datasets/JaimeMaLangue/JML-fon-speech-v1
- Modelo base: https://huggingface.co/openai/whisper-small
- DOI del corpus: 10.57967/hf/11698
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
