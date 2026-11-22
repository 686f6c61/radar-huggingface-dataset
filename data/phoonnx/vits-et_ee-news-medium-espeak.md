# Phoonnx/vits-et_ee-news-medium-espeak

## Resumen

`vits-et_ee-news-medium-espeak` es una voz de síntesis de voz (text-to-speech) en estonio, publicada por Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo original de Rhasspy alojado en `rhasspy/piper-voices`. El modelo subyacente es una red VITS entrenada con la cadena de herramientas Piper, especializada en la variante `et_EE` (estonio estándar) con dominio "news" y calidad "medium". Su propósito es ofrecer TTS local, ligero y sin dependencias de servicios en la nube para aplicaciones de asistencia por voz, lectores de pantalla y agentes conversacionales.

La relevancia de esta ficha es doble: por un lado, muestra el flujo de conversión de voces Piper a ONNX para el ecosistema phoonnx/OVOS, que permite ejecutar TTS en CPU con un coste de recursos muy bajo (RTF de 0,039 y pico de RSS de 268,8 MB según la model card); por otro, documenta una voz de un idioma con poca cobertura comercial (estonio), con 4 hablantes y fonemización mediante espeak-ng. El repositorio ocupa 0,1 GB y el grafo ONNX fp32 pesa 76,8 MB.

No es un modelo de lenguaje: es un modelo acústico VITS condicionado por fonemas IPA de espeak-ng, con muestreo a 22050 Hz. La model card reporta una tasa de error de palabra (WER) de 0,188 medida con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, y descarta la cuantización int8 por superar el umbral de degradación (WER 0,438, diferencia de 0,250 frente al máximo permitido de 0,05).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS condicionado por fonemas, sin ventana de contexto) |
| Tipos de cuantizacion | fp32 (int8 descartado por QA: WER 0,438) |
| Idiomas soportados | estonio (`et`, variante `et-EE`) |
| Licencia | CC BY 4.0 (META-SHARE "Available - Unrestricted Use") |
| Formato de pesos | ONNX |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 4 |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Fonemizador | espeak-ng, voz `et` |
| Puntuacion soportada | `, . ! ? : ;` (clausula; phoonnx 1.96.1a1 o superior la preserva en sintesis) |
| Tamano del grafo | 76,8 MB (fp32) |
| Tamano del repositorio | 0,1 GB |
| Ajustes de inferencia por defecto | noise_scale 0,5; noise_w 0,333 |
| Requisito de Piper | 1.5 o superior |

## Arquitectura y entrenamiento

El modelo es una red VITS (Variational Inference for Text-to-Speech) en su implementación Piper, un modelo generativo condicional que combina un codificador de texto sobre fonemas, un prior variacional, un decodificador acústico y un vocoder integrado que produce directamente forma de onda a 22050 Hz. La entrada no es texto crudo, sino fonemas IPA generados por espeak-ng con la voz `et`; esto implica que la calidad de la síntesis depende de la fidelidad de la fonemización previa. El modelo soporta 4 hablantes, por lo que la selección de hablante forma parte de la inferencia.

Según la model card, el modelo original fue entrenado por Rhasspy mediante fine-tuning desde la base `hifi_tts_92` en inglés estadounidense (calidad medium, voz de Cori Samuel, lector 92 de Hi-Fi TTS), aplicando MRD y SDP. Los datos de entrenamiento provienen del "Speech Corpus of Estonian News Sentences" alojado en META-SHARE, con licencia CC-BY. La model card indica que los datos de entrenamiento y el modelo base no están registrados upstream. La conversión a ONNX realizada por Phoonnx no altera los pesos, solo el formato; no hay checkpoint de entrenamiento en este repositorio.

## Capacidades

- Síntesis de voz en estonio (`et-EE`) a partir de texto fonemizado con espeak-ng.
- Soporte de 4 hablantes distintos dentro del mismo modelo.
- Preservación de puntuación de cláusula (`, . ! ? : ;`) en la síntesis con phoonnx 1.96.1a1 o superior.
- Salida de audio WAV a 22050 Hz mediante `voice.synthesize_wav`.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución local en CPU sin dependencia de GPU ni de servicios externos.
- No soporta tool calling, agentes, razonamiento multi-paso ni entrada multimodal: es exclusivamente un modelo acústico de TTS.

## Casos de uso

- Asistencia por voz en estonio para OVOS/Mycroft: la voz se selecciona en `mycroft.conf` con el módulo `ovos-tts-plugin-phoonnx` y el identificador `piper/et_EE-news-medium`, permitiendo respuestas habladas locales en un asistente doméstico sin enviar texto a la nube.
- Lectura de noticias y boletines: el dominio de entrenamiento es "news", por lo que el modelo está ajustado al registro y la prosodia de locución informativa, adecuado para generar audio de titulares y artículos en estonio.
- Accesibilidad y lectores de pantalla: el bajo coste (RTF 0,039 en un i9-11900H con 4 hilos) permite sintetizar en tiempo real en equipos de sobremesa y portátiles sin GPU dedicada.
- Sistemas de anuncios y megafonía en espacios públicos: al ejecutarse en CPU con 268,8 MB de pico de RSS, puede desplegarse en dispositivos de borde o mini-PC para mensajes pregrabados dinámicos en estonio.
- Generación de audiolibros o contenido educativo con múltiples voces: los 4 hablantes permiten alternar narradores dentro de un mismo pipeline sin cargar modelos adicionales.
- Pruebas de integración TTS en CI/CD: el tamaño reducido del grafo (76,8 MB) y la ausencia de dependencias de GPU facilitan incluirlo en contenedores de test para validar pipelines de audio.
- Prototipado de agentes conversacionales en estonio: combinado con un LLM externo, el modelo cubre la capa de salida de voz manteniendo la lógica de diálogo en otro componente.

## Benchmarks y rendimiento

Los datos de QA publicados en la model card, medidos con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | no distribuido |
| WER | 0,188 | 0,438 |
| Caracteres por segundo | 15,8 a 17,7 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,96 a 1,05 |
| Tamano del grafo | 76,8 MB | no disponible |
| Pico de RSS | 268,8 MB | no disponible |
| RTF (mediana de 3, 4 hilos) | 0,039 | no disponible |

Mediciones realizadas en un Intel Core i9-11900H a 2,50 GHz. El RTF se define como tiempo de síntesis dividido entre la duración del audio. La copia int8 no se incluye en el repositorio porque no superó el umbral de QA (diferencia de WER de 0,250 frente al máximo de 0,05). No se han publicado resultados de benchmarks estándar (MOS, MCD, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. Pico de RSS medido de 268,8 MB en fp32.
- GPU recomendadas: no aplica; no se documenta soporte GPU en la model card.
- GPU de consumo: irrelevante para este modelo, ya que la inferencia es en CPU.
- CPU de referencia: Intel Core i9-11900H a 2,50 GHz con 4 hilos, RTF 0,039.
- Despliegue: `phoonnx` (pip, versión preliminar `--pre`), con espeak-ng instalado en el sistema (`apt install espeak-ng`) o el port espyak mediante `phoonnx[espeak]`. Integración con OVOS mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput: RTF 0,039 implica que 1 segundo de audio tarda aproximadamente 0,039 segundos en sintetizarse; la tasa de generación medida es de 15,8 a 17,7 caracteres por segundo.
- Almacenamiento: repositorio de 0,1 GB; grafo ONNX de 76,8 MB.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|---|
| `Phoonnx/vits-et_ee-news-medium-espeak` | VITS (Piper) | et-EE | 4 | no aplica | CC BY 4.0 | ONNX | RTF 0,039; WER 0,188; fp32 |
| `rhasspy/piper-voices` (et/et_EE/news/medium) | VITS (Piper) | et-EE | 4 | no aplica | CC BY (META-SHARE) | Piper/ONNX | Modelo upstream del que deriva esta conversión; mismos pesos |
| Otras voces Piper en otros idiomas | VITS (Piper) | varios | variable | no aplica | variable | ONNX | Misma cadena de herramientas y filosofía de ejecución en CPU |

No se dispone de datos de benchmarks comparativos con modelos alternativos de TTS en estonio en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta estonio (`et-EE`); no es multilingüe.
- La calidad depende del fonemizador: espeak-ng y espyak pueden diferir en algunos fonemas, lo que puede provocar pronunciaciones incorrectas de ciertas palabras con espyak.
- La evaluación de QA se realizó sobre solo 3 frases de FLORES-200 devtest, una muestra muy reducida que limita la confianza en el WER reportado.
- La cuantización int8 no está disponible porque no superó el umbral de QA (WER 0,438 frente a 0,188 en fp32).
- El modelo no registra datos de entrenamiento ni modelo base en el repositorio; la trazabilidad depende de la model card upstream.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de prosodia y pronunciación incorrecta ante texto no visto o fuera del dominio "news".
- Requiere instalar espeak-ng en el sistema o el port espyak; sin él, el pipeline de fonemización falla.
- Licencia CC BY 4.0: permite uso comercial con atribución a Rhasspy y a TigreGotico Lda; es obligatorio acreditar a Rhasspy al usar la voz.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.
- La fecha de creación del repositorio (2026-11-22) es futura respecto a la información convencional disponible; conviene verificar la vigencia del artefacto antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-et_ee-news-medium-espeak
- Modelo upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/et/et_EE/news/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Corpus de entrenamiento (META-SHARE): https://metashare.ut.ee/repository/browse/speech-corpus-of-estonian-news-sentences/37b7c5d6a0d411eebb4773db10791bcfb0c0cf788d2d4030bfaf2f2e6e55dd8d/
