# finanfa-tech/finanfa-fon-asr-v6

## Resumen

finanfa-fon-asr-v6 es un modelo de reconocimiento automático del habla (ASR) especializado en fon (fɔngbè), una lengua gbe hablada principalmente en Benín. Lo desarrolla Finanfa Tech (AWADEME Ronaldo) como un ajuste fino de openai/whisper-small, posteriormente convertido a CTranslate2 en precisión int8 para su uso con faster-whisper. La versión 6 parte de la v5 y duplica los datos de entrenamiento hasta las 25 horas de audio transcrito, con el objetivo de mejorar la transcripción tonal de una lengua de bajos recursos.

El modelo aborda un problema concreto: Whisper no incluye el fon entre sus lenguas de decodificación, por lo que el ajuste fino debe realizarse forzando el token de idioma francés durante la inferencia. La salida conserva los diacríticos tonales, algo crítico en fon, donde el tono es fonémico. Con 0,2 GB de repositorio y pesos cuantizados a int8 (248 MB), está pensado para despliegue ligero en CPU.

La relevancia actual radica en su carácter de recurso lingüístico abierto para una lengua con escasa representación tecnológica, publicado bajo CC-BY-SA-4.0 y entrenado sobre el corpus JML-fon-speech-v1. No obstante, sus métricas de error (WER del 29,7 % con tonos en precisión completa) limitan su uso a tareas de transcripción asistida y no a decisiones automatizadas críticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small), convertido a CTranslate2 |
| Parámetros totales | no disponible (heredados de openai/whisper-small; el repositorio no declara cifra) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de hasta 30 segundos por segmento; sin horodatización |
| Tipos de cuantización | int8 (CTranslate2); pesos en precisión completa conservados en privado |
| Idiomas soportados | fon (fɔngbè); decodificación forzada con token de idioma francés |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | CTranslate2 (modelo convertido para faster-whisper) |

## Arquitectura y entrenamiento

El modelo es un Whisper-small ajustado (fine-tuning) y después convertido a CTranslate2 en int8. Whisper emplea una arquitectura transformer encoder-decoder con atención estándar; el ajuste se realizó sobre la v5, que a su vez deriva de la v4 (Whisper-small afinado sobre 7 732 ejemplos de fon). El entrenamiento usó 11 846 enunciados (25,0 horas, 368 hablantes) del subconjunto JML-fon-speech-v1, aproximadamente el 19 % del texto transcrito del corpus, excluyendo hablantes y textos de test y validación.

Los hiperparámetros fueron: tasa de aprendizaje 5e-6 con decaimiento lineal y 100 pasos de calentamiento, batch de 16, 3 épocas, fp16, semilla 42, sobre una GPU Tesla T4 en Kaggle. Se conservó la mejor época según el WER de validación con tonos. Las transcripciones provienen de lingüistas y mantienen los diacríticos tonales; solo se eliminaron las comillas en nombres y palabras francesas. No se documenta uso de RLHF ni DPO.

## Capacidades

- Transcripción de voz a texto en fon con preservación de tonos (diacríticos Unicode).
- Reconocimiento de habla leída grabada por teléfono (condiciones del corpus JML).
- Procesamiento de segmentos de audio de hasta 30 segundos, en formato 16 kHz mono.
- Decodificación con beam search (beam_size configurable) mediante CTranslate2.
- Inferencia en CPU con cuantización int8.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio más allá de la transcripción.
- Multilingüismo limitado: solo fon; requiere forzar el token de idioma francés para evitar salidas incorrectas.

## Casos de uso

- Transcripción asistida de entrevistas y encuestas en fon: el modelo genera borradores que un hablante nativo revisa, aprovechando la preservación tonal para reducir el trabajo de corrección en material lingüístico.
- Documentación de lenguas minoritarias: investigadores pueden transcribir corpus orales grabados con voluntarios y comparar variantes tonales, dado que el modelo conserva diacríticos.
- Subtitulado de material educativo en fon: para vídeos con locución leída y audio limpio, el modelo puede producir subtítulos preliminares de segmentos cortos.
- Preservación y archivo digital: digitalización de grabaciones de habla leída para construir bases de datos textuales alineadas con audio.
- Aplicaciones de accesibilidad en contextos locales: dictado de notas breves en fon en dispositivos sin GPU, gracias a la cuantización int8 y al tamaño reducido (248 MB).
- Prototipado de asistentes de voz en fon: integración en pipelines de faster-whisper para validar viabilidad antes de invertir en modelos mayores o más datos.
- Investigación en ASR de bajos recursos: línea base reproducible para experimentos de aumento de datos y ajuste tonal, con métricas WER/CER documentadas.

## Benchmarks y rendimiento

Datos publicados por el autor sobre un test de 1 019 enunciados y 120 hablantes ausentes del entrenamiento:

| Modelo | WER con tonos | WER sin tonos | CER con tonos | CER sin tonos |
|---|---|---|---|---|
| v4 | 86,2 % | 63,0 % | 37,6 % | 27,0 % |
| v5 (precisión completa) | 31,8 % | 25,2 % | 13,6 % | 10,6 % |
| v6 (precisión completa, no cuantizada) | 29,7 % | 23,1 % | 12,7 % | 9,9 % |
| v6 int8 (este repositorio) | medición en curso, no disponible | no disponible | no disponible | no disponible |

Validación (521 enunciados, 63 hablantes): 28,4 % con tonos. El autor indica que la cuantización int8 costó aproximadamente 2 puntos de WER en la v5 y que cabe esperar un efecto similar en la v6, sin verificar. Los resultados de v6 en precisión completa se midieron dos veces (29,72 % y 23,05 %; 29,75 % y 23,06 %).

## Requisitos de hardware

- VRAM estimada: no aplica para int8 en CPU; en GPU, el modelo ocupa del orden de 248 MB de pesos más memoria de activaciones, holgadamente por debajo de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el autor entrenó en Tesla T4.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: CTranslate2 con faster-whisper (formato nativo del repositorio); no se distribuyen pesos en safetensors ni GGUF en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finanfa-fon-asr-v6 | Whisper-small (cifra no declarada) | 30 s | fon | CC-BY-SA-4.0 | Hugging Face, CTranslate2 int8 |
| finanfa-fon-asr-v5 | Whisper-small | 30 s | fon | CC-BY-SA-4.0 | Hugging Face |
| openai/whisper-small | 244 M (según ficha pública de OpenAI) | 30 s | 99 idiomas (sin fon) | MIT | Hugging Face, múltiples formatos |

La comparación con whisper-small original no es directa en rendimiento para fon, ya que este último no soporta la lengua. No se dispone de otros modelos ASR específicos de fon en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con habla leída grabada por teléfono; el habla espontánea, radio, conversaciones y entornos ruidosos no se han probado y pueden degradar gravemente los resultados.
- WER con tonos del 29,7 % en precisión completa: aproximadamente uno de cada cuatro o cinco palabras es incorrecto; no debe usarse en solitario para decisiones importantes (salud, derecho, finanzas).
- Errores frecuentes: tonos mal colocados, segmentación incorrecta de palabras y nombres propios.
- No se ha verificado si el modelo ha olvidado conocimientos de la v4 sobre sus datos antiguos; no debe considerarse sustituto universal de v4.
- Solo procesa segmentos de menos de 30 segundos y no genera marcas de tiempo.
- Ante silencio o audio en otra lengua, Whisper puede alucinar texto.
- La versión int8 de este repositorio no ha sido evaluada todavía; su rendimiento real es incierto.
- Licencia CC-BY-SA-4.0: obliga a atribución a J'aime Ma Langue y a compartir obras derivadas bajo la misma licencia, lo que restringe su uso en productos propietarios.
- Solo se ha utilizado aproximadamente el 19 % del corpus; el retorno por datos añadidos es decreciente (unos 2 puntos de WER al duplicar datos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finanfa-tech/finanfa-fon-asr-v6
- Versión anterior v5: https://huggingface.co/finanfa-tech/finanfa-fon-asr-v5
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset: https://huggingface.co/datasets/JaimeMaLangue/JML-fon-speech-v1
- DOI del corpus: https://doi.org/10.57967/hf/11698
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
