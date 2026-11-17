# bnsaid/sawt-asr-ar-en-2b-v1

## Resumen

Sawt (صوت, "voz" en árabe) es un modelo de reconocimiento automático del habla (ASR) de 2.065 millones de parámetros desarrollado por el usuario `bnsaid`. Es un ajuste fino supervisado de `CohereLabs/cohere-transcribe-arabic-07-2026`, un modelo Conformer encoder-decoder, y está especializado en árabe dialectal, habla con cambio de código árabe-inglés (code-switching) e inglés con acento L2.

El modelo se diseñó para un kiosco interactivo por voz en los Emiratos Árabes Unidos, con una audiencia multinacional (emiratíes, saudíes, egipcios, levantinos, sudaneses, surasiáticos y filipinos) que alternan idioma a mitad de frase. Frente a la alternativa comercial ElevenLabs Scribe, reduce el WER de 0,402 a 0,237 en el conjunto saudí de code-switching (SCC) y de 0,578 a 0,488 en los ocho dialectos árabes de CASA, con significación estadística en ambos casos.

Su relevancia actual radica en cubrir un nicho poco atendido por los ASR generalistas: el habla mezclada árabe-inglés con acentos regionales, con licencia Apache-2.0 y pesos en abierto. Incluye además una cabeza de identificación de idioma (LID) opcional que lee directamente la salida del encoder, lo que facilita su uso en micrófono en vivo sin un segundo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder-decoder (heredada del modelo base Cohere ASR) |
| Parametros totales | 2.065.804.048 (~2,07 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el audio de más de 35 s se divide automáticamente en fragmentos |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ar (árabe, incluidos dialectos), en (inglés, incluido acentuado L2) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 4,1 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de tipo decoder-only sobre el Conformer encoder-decoder de Cohere: solo se entrenaron 170 M de los 2,07 B de parámetros (el encoder y las capas BatchNorm se congelaron). El entrenamiento consistió en 4.297 pasos, con 8 clips por paso y un learning rate máximo de 2e-6. Se usaron 34.378 clips (38,7 horas) procedentes de grabaciones internas del dominio del kiosco (no publicadas), CASA, SCC y EDACC. Se publican los pesos finales; la precisión frente a referencias humanas seguía mejorando hasta el último paso.

No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación. La innovación destacable es la inclusión de una cabeza de identificación de idioma (`lid_head.npz`, ~99 % de precisión) que opera sobre la salida del propio encoder, evitando desplegar un segundo modelo para decidir entre árabe e inglés. El modelo requiere `transformers>=5.4.0` y no necesita `trust_remote_code` en versiones recientes.

## Capacidades

- Transcripción de voz a texto en árabe dialectal (emiratí, saudí, egipcio, levantino, sudanés, entre otros).
- Transcripción de habla con cambio de código árabe-inglés dentro de la misma frase.
- Transcripción de inglés con acento L2 (evaluado con EDACC, inglés indio).
- Selección explícita de idioma mediante el token `language="ar"` o `language="en"`.
- Identificación automática de idioma por clip mediante la cabeza LID opcional.
- Procesado de audio largo mediante fragmentación automática en bloques de 35 s.
- Salida de texto con convenciones de escritura de los transcriptos de entrenamiento (puntuación y diacríticos ligeros).
- No emite marcas de tiempo a nivel de palabra.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de ASR.

## Casos de uso

- Kiosco interactivo multilingüe en los EAU: el modelo transcribe en tiempo real clientes que alternan árabe e inglés, con la cabeza LID decidiendo el idioma por clip y un WER de 0,221 en audio del dominio del kiosco.
- Atención al cliente telefónica en el Golfo: transcripción de llamadas con cambio de código árabe-inglés para generar resúmenes o alimentar sistemas de análisis, gracias a su ventaja de 0,165 de WER absoluto sobre Scribe en SCC.
- Subtitulado de reuniones y webinars con ponentes de distintos dialectos árabes: la cobertura de ocho dialectos (CASA, WER 0,488) permite un pipeline único sin modelos por región.
- Transcripción de entrevistas y estudios de campo con informantes multinacionales: útil en investigación social o de mercado en los EAU, donde la alternancia de idioma es habitual.
- Asistentes de voz para aplicaciones móviles dirigidas a población expatriada: el inglés acentuado L2 (EDACC, WER 0,186) queda a la par de sistemas comerciales, suficiente para dictado y comandos.
- Generación de actas y notas en centros de contacto con plantilla surasiática o filipina que habla inglés con acento: el modelo mantiene un rendimiento competitivo en ese registro.
- Preprocesado de audio para pipelines de moderación o búsqueda: la salida de texto normalizada permite indexar grabaciones mixtas árabe-inglés con un solo modelo Apache-2.0.

## Benchmarks y rendimiento

WER (menor es mejor), numerales normalizados y muletillas eliminadas; significación por bootstrap emparejado sobre clips. Referencia comercial: ElevenLabs Scribe.

| Conjunto de prueba | Clips | Scribe | Sawt v1 | Diferencia | Veredicto |
|---|---|---|---|---|---|
| Saudi code-switch (SCC) | 260 | 0,402 | 0,237 | −0,165 | mejor, p<1e-4 |
| 8 dialectos árabes (CASA) | 480 | 0,578 | 0,488 | −0,090 | mejor, p<1e-4 |
| Audio del dominio del kiosco (interno) | 74 | 0,266 | 0,221 | −0,045 | mejor, p=0,009 |
| Emirati code-switch (Mixat) | 60 | 0,159 | 0,147 | −0,013 | empate, p=0,29 |
| Inglés L2/indio (EDACC) | 110 | 0,165 | 0,186 | +0,021 | empate, p=0,12 |

Adicionalmente, el token de idioma desconocido obtiene un WER de 0,284 frente a 0,162 con el token explícito en Emirati code-switch. La cabeza LID tiene una precisión aproximada del 99 %.

## Requisitos de hardware

- Pesos en bfloat16 de 4,1 GB; la VRAM necesaria para inferencia no se detalla en la información disponible, pero por tamaño del modelo debería caber holgadamente en GPUs de consumo con 8-12 GB en bfloat16 o fp16.
- GPUs recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, A100 o H100 ofrecen margen amplio. Una GPU de consumo de gama media-alta debería ser suficiente.
- Despliegue: `transformers>=5.4.0` con `device_map="auto"`, `torch`, `soundfile`, `librosa`, `sentencepiece`, `protobuf` y `accelerate`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sawt ASR ar-en 2B v1 | ~2,07 B | ar, en (L2) | fragmentos de 35 s | Apache-2.0 | Hugging Face, pesos abiertos |
| ElevenLabs Scribe | no disponible | multilingüe | no disponible | comercial | API comercial |
| Cohere Transcribe Arabic (base) | no disponible | ar, en | fragmentos de 35 s | Apache-2.0 | Hugging Face |

Frente a Scribe, Sawt mejora en árabe dialectal y code-switching árabe-inglés y empata en inglés L2 y emiratí. Frente a su modelo base, Sawt incorpora la cabeza LID y el ajuste al dominio del kiosco, aunque no se publican métricas del base en esta información.

## Limitaciones y advertencias

- La salida sigue las convenciones de escritura de los transcriptos de entrenamiento: puntuación y diacríticos más ligeros que en algunos sistemas comerciales, y ortografía dialectal variable.
- En habla predominantemente árabe, las palabras en inglés pueden escribirse en alfabeto árabe (por ejemplo, "بليز دونت دو إت" en lugar de "please don't do it"). El idioma se elige por clip, por lo que en grabaciones largas con code-switching conviene segmentar antes (por ejemplo, con VAD).
- En habla solo en inglés empata con un sistema comercial fuerte, pero no lo supera.
- No emite marcas de tiempo a nivel de palabra; para obtenerlas hay que recurrir a alineamiento forzado.
- No evaluado en habla de menos de 1 s, habla infantil en campo lejano ni idiomas distintos del árabe y el inglés.
- Los datos internos del kiosco no se publican, lo que limita la reproducibilidad del ajuste.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un ASR, el riesgo principal es la sustitución o normalización incorrecta de términos.
- Licencia Apache-2.0 heredada del modelo base, permisiva para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bnsaid/sawt-asr-ar-en-2b-v1
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Ejemplo de audio largo del modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
