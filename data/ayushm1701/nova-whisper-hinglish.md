# AyushM1701/nova-whisper-hinglish

## Resumen

Nova Whisper Hinglish es un ajuste fino de OpenAI Whisper large-v3-turbo orientado al reconocimiento de voz code-switching entre ingles y hindi (hinglish). Lo desarrolla AyushM1701 como componente del proyecto Nova y su objetivo es resolver un problema concreto: que un unico modelo transcriba audio en ingles, hindi y hinglish, y que en este ultimo caso escriba el hindi en caracteres latinos ("kal meeting cancel kar do"), tal como se escribe de forma habitual en mensajeria y redes. El modelo se distribuye en formato CTranslate2 para su uso con faster-whisper, con un tamano de repositorio de 1,6 GB.

Tecnicamente se trata de un LoRA aplicado sobre el decodificador de Whisper large-v3-turbo y fusionado posteriormente en los pesos, por lo que conserva la arquitectura encoder-decoder transformer del modelo base y su ventana de contexto de audio de 30 segundos por segmento. El entrenamiento se realizo sobre aproximadamente 123,6 horas de audio procedente de cinco corpus (IndicTTS, Kathbath, LibriSpeech, MUCS 2021 y Mann Ki Baat), con transcripciones hindi romanizadas por regla y sin traduccion.

Su relevancia es acotada pero clara: los datos publicados por el autor muestran una mejora muy sustancial en MUCS 2021 Hindi-English (WER del 92,5% al 49,3%) manteniendo un rendimiento casi identico en LibriSpeech y Mann Ki Baat. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para el ecosistema faster-whisper y para un caso de uso muy especifico de transcripcion bilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) con LoRA en el decodificador, fusionado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s por segmento) |
| Tipos de cuantizacion | float16 (indicado en el ejemplo de uso); otras cuantizaciones CTranslate2 no documentadas |
| Idiomas soportados | en, hi (hindi en caracteres latinos en la salida) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | CTranslate2 (compatible con faster-whisper) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder para reconocimiento automatico del habla. El ajuste consiste en un LoRA aplicado unicamente al decodificador y posteriormente fusionado en los pesos finales, de modo que en inferencia no hay adaptadores separados. La conversion a CTranslate2 permite ejecutarlo con faster-whisper en CUDA con compute_type float16.

El entrenamiento uso cinco corpus: IndicTTS Hindi de SPRINGLab (2,1 h), Kathbath de ai4bharat (4,1 h), LibriSpeech (21,6 h), MUCS 2021 Hindi-English (88,8 h) y Mann Ki Baat de ai4bharat (7,0 h). Del agregado agarwalayushi/hinglish solo se tomaron los clips con licencia CC BY 4.0. Las transcripciones hindi se romanizaron por regla, conservando las palabras habladas y sin traducir; en LibriSpeech se aplico capitalizacion y puntuacion donde Whisper base reconocia exactamente las mismas palabras. No se documenta el uso de RLHF ni DPO, ni el numero total de tokens o pasos de entrenamiento.

## Capacidades

- Transcripcion de voz en ingles, hindi y hinglish con un unico modelo.
- Salida de hindi en caracteres latinos (romanizado) en lugar de devanagari, alineada con la forma en que los hablantes escriben informalmente.
- Deteccion de idioma entre en e hi mediante `model.detect_language`, tal como hace Nova.
- Compatibilidad directa con faster-whisper y CTranslate2 en CUDA con float16.
- Manejo de audio code-switching, es decir, mezcla de ingles y hindi dentro de la misma locucion.
- No se documentan capacidades de traduccion, diarizacion, timestamps especiales ni tool calling.

## Casos de uso

- Transcripcion de reuniones bilingues en equipos india-UK o india-EE. UU.: el modelo acepta audio con mezcla de ingles y hindi y devuelve una transcripcion legible en alfabeto latino, util para actas y busquedas de texto.
- Subtitulado de contenido de creadores de habla hinglish: al romanizar el hindi, los subtitulos se integran sin conversion de script en plataformas que no manejan bien devanagari.
- Analisis de conversaciones de atencion al cliente en centros de soporte indios: permite indexar y buscar transcripciones en un unico pipeline sin segmentar manualmente por idioma.
- Procesamiento de audio de reuniones y notas de voz en aplicaciones de productividad: el modelo se carga directamente con faster-whisper, lo que simplifica su integracion en backends Python existentes.
- Investigacion en ASR code-switching: sirve como punto de partida o baseline ajustado sobre Whisper large-v3-turbo para experimentos con MUCS 2021 y corpora similares.
- Generacion de datasets de texto romanizado a partir de audio hindi: util para entrenar o evaluar modelos de lenguaje que trabajen con hinglish escrito.
- Transcripcion de programas de radio y podcast en hindi (por ejemplo, Mann Ki Baat) manteniendo el rendimiento del modelo base segun los datos del autor.

## Benchmarks y rendimiento

Word error rate (WER) y Roman WER sobre clips held-out, segun la model card. Menor es mejor.

| Test set | Whisper large-v3-turbo | Nova Whisper Hinglish |
|---|---|---|
| LibriSpeech | 2,7% / 2,7% | 3,0% / 3,0% |
| MUCS 2021 Hindi-English | 92,5% / 77,6% | 49,3% / 49,3% |
| Mann Ki Baat (ai4bharat) | 10,3% / 10,3% | 10,2% / 10,2% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable en un modelo de ASR.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,6 GB en CTranslate2, por lo que la inferencia en float16 requiere del orden de 2 GB de VRAM; no se documentan otras cuantizaciones.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2-4 GB de VRAM; el autor usa `device="cuda"` con `compute_type="float16"`.
- Cabe en GPU de consumo: si, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, dado el tamano del repositorio.
- Opciones de despliegue: faster-whisper sobre CTranslate2 (soporte oficial); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de ASR de este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nova Whisper Hinglish | no disponible (base large-v3-turbo) | ventanas de 30 s | en, hi (salida romanizada) | CC BY-SA 4.0 | CTranslate2 |
| openai/whisper-large-v3-turbo | no disponible en la informacion | ventanas de 30 s | multilingue | MIT | safetensors, CTranslate2 |
| Whisper large-v3 | no disponible en la informacion | ventanas de 30 s | multilingue | MIT | safetensors, CTranslate2 |

La comparativa se limita al modelo base y a la variante large-v3 por falta de datos de otros ajustes especificos de hinglish en la informacion disponible. La diferencia medible segun el autor es el WER en MUCS 2021 (49,3% frente a 92,5%) con una perdida de 0,3 puntos en LibriSpeech.

## Limitaciones y advertencias

- El modelo solo declara soporte para en e hi; no se ha evaluado su comportamiento en otros idiomas.
- El WER en MUCS 2021 sigue siendo del 49,3%, es decir, aproximadamente la mitad de las palabras fallan en audio code-switching ruidoso; no es adecuado para transcripcion de alta precision en ese dominio sin revision humana.
- El entrenamiento se realizo sobre un volumen reducido de datos (unas 123,6 h en total), lo que limita la generalizacion a acentos, ruido y dominios no representados.
- La romanizacion se aplica por regla; puede producir formas no estandar o inconsistentes con la convencion del hablante.
- Riesgo de alucinacion inherente a Whisper en segmentos con silencio, ruido o audio musical; no se documenta mitigacion especifica.
- Licencia CC BY-SA 4.0: el uso comercial es posible pero obliga a atribuir los corpus citados y a compartir las obras derivadas bajo la misma licencia; MUCS 2021 es CC BY-SA 4.0 y arrastra esa condicion.
- El modelo base Whisper es MIT, pero la licencia del ajuste es CC BY-SA 4.0, mas restrictiva.
- No hay descargas ni validacion de la comunidad en el momento de la consulta; el proyecto es de un unico autor y su mantenimiento futuro no esta garantizado.
- No se documentan sesgos especificos, aunque al entrenar sobre corpus de India y LibriSpeech pueden aparecer sesgos de acento, genero y dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AyushM1701/nova-whisper-hinglish
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio del proyecto Nova: https://github.com/AyushM1701/nova
- Dataset agregado hinglish: https://huggingface.co/datasets/agarwalayushi/hinglish
- LibriSpeech: https://www.openslr.org/12
- MUCS 2021 Hindi-English: https://www.openslr.org/104
