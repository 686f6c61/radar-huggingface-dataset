# empiriolabsai/speaker-age

## Resumen

Speaker Age es un modelo de clasificación de audio desarrollado por EmpirioLabs que estima el grupo de edad de la persona que habla en un fragmento de voz. Devuelve una distribución de probabilidad sobre siete bandas etarias (`teens`, `20s`, `30s`, `40s`, `50s`, `60s` y `70+`). Se trata de un fine-tuning de facebook/w2v-bert-2.0, un transformer de arquitectura Wav2Vec2-BERT orientado a representaciones de voz auto-supervisadas, con 580.757.344 parámetros totales y una entrada de audio fijada a 16 kHz.

El modelo se integra en el pipeline estándar `audio-classification` de la librería `transformers`, sin necesidad de código personalizado, y publica pesos en formato safetensors y ONNX (tanto en precisión completa como en int8) para su ejecución en ONNX Runtime y transformers.js. Está etiquetado para 40 idiomas, desde el inglés, el español o el chino hasta el euskera, el kinyarwanda o el uigur, lo que lo convierte en una opción poco habitual dentro de la estimación de edad por voz multilingüe.

Su relevancia actual radica en la licencia Apache 2.0, que permite uso comercial sin restricciones, y en los resultados declarados por el autor: un 53,8 % de acierto exacto de banda y un 92,9 % de acierto dentro de una banda, medidos sobre 56.765 clips de 8.065 hablantes no vistos durante el entrenamiento. El modelo se complementa con Speaker Gender de la misma organización, que clasifica el mismo audio como `female` o `male` en el mismo pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (transformer de representaciones de voz auto-supervisadas), fine-tuning de facebook/w2v-bert-2.0 |
| Parametros totales | 580.757.344 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; ventana de muestras no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | ONNX en precision completa y ONNX int8 |
| Idiomas soportados | 40 idiomas: ar, ba, bn, ca, ckb, cs, cy, de, en, eo, es, et, eu, fa, fr, fy, gl, hu, it, ja, ka, kab, lg, lv, mhr, nl, pl, pt, ru, rw, sw, ta, th, tr, ug, uk, ur, uz, yue, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (full precision e int8) |

## Arquitectura y entrenamiento

El modelo parte de facebook/w2v-bert-2.0, un backbone Wav2Vec2-BERT que combina el extractor convolucional de características de Wav2Vec2 con un codificador transformer tipo BERT, preentrenado de forma auto-supervisada sobre audio multilingüe. Sobre esa base, EmpirioLabs ha realizado un fine-tuning supervisado para una tarea de clasificación en siete clases (las siete bandas de edad), de modo que la salida es una distribución de probabilidad por banda en lugar de una regresión de edad en años. La entrada se procesa a 16 kHz y el modelo se carga directamente con el pipeline `audio-classification` de `transformers`.

No se detalla en la información proporcionada el volumen de tokens de audio, la composición exacta del dataset de fine-tuning, ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a clasificación de audio). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El autor sí documenta la metodología de evaluación: 56.765 clips de habla leída en 40 idiomas procedentes de 8.065 hablantes no vistos, comparando todos los modelos sobre los mismos clips con métricas macro-promediadas por banda.

## Capacidades

- Clasificación de edad por voz en siete bandas (`teens`, `20s`, `30s`, `40s`, `50s`, `60s`, `70+`) con probabilidad asociada a cada banda.
- Procesamiento de audio a 16 kHz mediante el pipeline estándar `audio-classification` de `transformers`.
- Cobertura multilingüe declarada de 40 idiomas, incluyendo lenguas de bajos recursos como bashkir, cabileño, kinyarwanda, luganda, mari de los prados o uigur.
- Ejecución en navegador y entornos ligeros gracias a los pesos ONNX int8 y a la compatibilidad con transformers.js.
- Despliegue en ONNX Runtime con pesos en precisión completa e int8.
- Complementariedad con el modelo Speaker Gender de la misma organización para etiquetar género en el mismo pipeline.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión ni generación de texto: es exclusivamente un clasificador de audio.

## Casos de uso

- Moderación y verificación de edad en plataformas de voz: el modelo permite estimar la banda etaria de un hablante en una llamada o grabación y activar políticas específicas (por ejemplo, restricciones para menores) sin necesidad de metadatos declarativos.
- Analítica de audiencia en pódcast y radio: clasificar automáticamente clips por banda de edad del hablante para construir perfiles demográficos de locutores y participantes en archivos extensos.
- Enriquecimiento de corpus de investigación lingüística: etiquetar corpus multilingües con la edad estimada del hablante, aprovechando la cobertura de 40 idiomas y la licencia Apache 2.0 para su uso en estudios académicos y publicaciones.
- Atención al cliente y centros de contacto: estimar la franja de edad del cliente en llamadas para segmentar encuestas de satisfacción o adaptar el tono del agente virtual, ejecutando el modelo en ONNX Runtime en infraestructura existente.
- Aplicaciones web del lado del cliente: con los pesos ONNX int8 y transformers.js, integrar la estimación de edad en el navegador sin enviar audio a servidores externos, útil en escenarios con requisitos de privacidad.
- Investigación forense y análisis de audio: como señal auxiliar en la caracterización de hablantes en grabaciones, siempre como indicio probabilístico y no como identificación.
- Sistemas de recomendación de contenido: ajustar recomendaciones de audio (pódcast, audiolibros, música) según la franja etaria estimada del oyente cuando este consiente el análisis de voz.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos el 2026-11-24 sobre 56.765 clips de habla leída en 40 idiomas de 8.065 hablantes no vistos. Las métricas están promediadas por banda (macro):

| Modelo | Exacto | Dentro de una banda | Error de banda |
|---|---:|---:|---:|
| **Speaker Age** | **53,8 %** | **92,9 %** | **0,56** |
| griko/age_reg_ann_ecapa_librosa_combined | 20,8 % | 58,2 % | 1,39 |
| griko/age_reg_svr_ecapa_voxceleb2 | 19,0 % | 56,6 % | 1,43 |
| griko/age_reg_svr_ecapa_librosa_voxceleb2 | 18,9 % | 56,1 % | 1,43 |
| griko/age_reg_ann_ecapa_timit | 16,1 % | 48,3 % | 1,83 |
| minato-ryan/cv-age-multi-3epoch | 14,6 % | 43,6 % | 2,21 |

Referencia: responder siempre `20s` (la banda más frecuente) obtiene un 14,3 % exacto y un 42,9 % dentro de una banda con estas métricas macro. Contando todos los clips por igual, Speaker Age acierta la banda en el 52,8 % de los clips y queda dentro de una banda en el 93,9 %.

Rendimiento por banda (exacto / dentro de una banda): `teens` 67,9 % / 94,1 %; `20s` 53,8 % / 97,2 %; `30s` 58,9 % / 92,5 %; `40s` 39,8 % / 92,2 %; `50s` 46,7 % / 86,1 %; `60s` 40,0 % / 96,2 %; `70+` 69,7 % / 91,7 %.

Rendimiento por idioma (exacto / dentro de una banda), selección: neerlandés 62,0 % / 95,2 %; georgiano 65,1 % / 92,1 %; ruso 57,7 % / 95,5 %; húngaro 55,9 % / 96,2 %; portugués 55,0 % / 92,9 %; catalán 52,2 % / 92,2 %; italiano 52,0 % / 95,3 %; francés 51,6 % / 93,5 %; polaco 51,5 % / 92,5 %; inglés 50,6 % / 90,1 %; gallego 50,6 % / 97,8 %; alemán 50,5 % / 90,7 %; uigur 49,9 % / 94,0 %; letón 49,0 % / 89,8 %; euskera 48,8 % / 91,2 %; chino (Taiwán) 48,8 % / 95,6 %; japonés 48,5 % / 93,1 %; frisón 48,2 % / 91,0 %; tamil 47,2 % / 90,8 %; turco 47,1 % / 94,0 %; bashkir 46,7 % / 87,5 %; español 46,2 % / 93,9 %; mari de los prados 46,1 % / 91,6 %; tailandés 44,2 % / 85,0 %; kinyarwanda 42,7 % / 66,7 %; estonio 42,6 % / 98,0 %; persa 41,3 % / 81,2 %; kurdo central 41,3 % / 82,8 %; luganda 39,2 % / 82,4 %; cantonés (Hong Kong) 38,8 % / 93,7 %; bengalí 37,5 % / 99,6 %; checo 36,4 % / 83,2 %; esperanto 35,4 % / 91,9 %; ucraniano 34,1 % / 94,3 %; árabe 33,5 % / 71,5 %; cabileño 32,9 % / 68,2 %; suajili 31,5 % / 76,9 %; urdu 28,8 % / 91,6 %. Los datos de uzbeko quedan truncados en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 580.757.344 parámetros, en fp32 los pesos ocupan aproximadamente 2,3 GB y en int8 aproximadamente 0,6 GB, a lo que hay que sumar la memoria de activaciones y del extractor convolucional.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es viable en GPU de consumo; una RTX 4090 (24 GB) o una RTX 3090 (24 GB) lo alojan con holgura en fp32, y tarjetas con 8-12 GB pueden ejecutarlo en int8.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM en int8, aunque el autor no publica cifras oficiales.
- Opciones de despliegue: `transformers` (pipeline `audio-classification`), ONNX Runtime (pesos full precision e int8), transformers.js para navegador. No se menciona soporte explícito para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un clasificador de audio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Exacto (macro) | Dentro de una banda | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| **Speaker Age** | 580,8 M | audio 16 kHz | **53,8 %** | **92,9 %** | Apache 2.0 | Hugging Face, ONNX, transformers.js |
| griko/age_reg_ann_ecapa_librosa_combined | no disponible | audio (ECAPA) | 20,8 % | 58,2 % | no disponible en la informacion | Hugging Face |
| griko/age_reg_svr_ecapa_voxceleb2 | no disponible | audio (ECAPA) | 19,0 % | 56,6 % | no disponible en la informacion | Hugging Face |
| minato-ryan/cv-age-multi-3epoch | no disponible | audio | 14,6 % | 43,6 % | no disponible en la informacion | Hugging Face |

Los cuatro modelos de griko estiman la edad en años y se mapean a bandas para la comparación; el modelo de minato-ryan responde directamente con grupos de edad mapeados a las mismas bandas. La comparación de parámetros, contexto y licencia de las alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El acierto exacto de banda es del 53,8 % (macro): en casi la mitad de los casos el modelo se equivoca de banda, aunque el 92,9 % queda dentro de una banda. No debe usarse como verificación de edad con consecuencias legales o de acceso.
- El rendimiento varía notablemente por idioma: urdu (28,8 %), suajili (31,5 %), cabileño (32,9 %) y árabe (33,5 %) están muy por debajo de neerlandés (62,0 %) o georgiano (65,1 %). El rendimiento en lenguas de bajos recursos es sustancialmente inferior.
- La evaluación se realizó sobre habla leída; el comportamiento en habla espontánea, ruido de fondo, canales telefónicos o audio comprimido no está documentado.
- La banda `70+` tiene solo 836 clips en el conjunto de evaluación y la banda `40s` es la de peor acierto exacto (39,8 %), lo que sugiere menor fiabilidad en esos rangos.
- Riesgo de sesgo demográfico y de dominio: no se documentan análisis de sesgo por género, acento o calidad de grabación; la estimación de edad por voz es sensible a estas variables.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento, y no debe esperarse de él nada fuera de la clasificación de audio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar la atribución y revisar los términos del modelo base facebook/w2v-bert-2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/speaker-age
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Modelo complementario Speaker Gender: https://huggingface.co/empiriolabsai/speaker-gender
- Organización en Hugging Face: https://huggingface.co/empiriolabsai
- Web de EmpirioLabs: https://empiriolabs.ai
- Plataforma: https://platform.empiriolabs.ai
- Discord: https://discord.gg/bM52azW4ZD
- Comparativa griko/age_reg_ann_ecapa_librosa_combined: https://huggingface.co/griko/age_reg_ann_ecapa_librosa_combined
- Comparativa griko/age_reg_svr_ecapa_voxceleb2: https://huggingface.co/griko/age_reg_svr_ecapa_voxceleb2
- Comparativa griko/age_reg_svr_ecapa_librosa_voxceleb2: https://huggingface.co/griko/age_reg_svr_ecapa_librosa_voxceleb2
- Comparativa griko/age_reg_ann_ecapa_timit: https://huggingface.co/griko/age_reg_ann_ecapa_timit
- Comparativa minato-ryan/cv-age-multi-3epoch: https://huggingface.co/minato-ryan/cv-age-multi-3epoch
