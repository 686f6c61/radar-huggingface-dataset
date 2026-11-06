# Rstc989/Vaanilipi

## Resumen

Vaanilipi es una conversión a ONNX con cuantización int8 del modelo IndicConformer 600M multilingual de AI4Bharat (IIT Madras), un sistema de reconocimiento automático del habla (ASR) diseñado para las 22 lenguas programadas de la India. El autor, Rstc989, publica esta copia como componente de VaaniLipi, una aplicación de Windows para dictado por voz privado y totalmente offline. La modificación se limita al codificador, cuantizado dinámicamente a int8 en sus multiplicaciones matriciales mediante ONNX Runtime con esquema per-channel; el resto de artefactos (cabecera CTC, vocabulario, máscaras de idioma y banco de filtros mel) se mantienen sin cambios respecto al original.

El modelo resuelve el problema de desplegar ASR multilingüe indio en hardware sin GPU: reduce el peso del codificador de 2,5 GB a 882 MB y aproximadamente duplica la velocidad de inferencia en CPU, manteniendo la licencia MIT del original. Es relevante para desarrolladores que necesitan transcripción local en entornos Windows de gama baja, sin enviar audio a servicios en la nube, y para quienes trabajan con lenguas indias de bajos recursos donde los modelos ASR comerciales suelen tener coberturas parciales.

La arquitectura subyacente es un Conformer (transformer convolucional) de aproximadamente 600 millones de parámetros con cabecera CTC y vocabulario compartido entre idiomas, con segmentación por máscaras de vocabulario específicas de cada lengua. Este repositorio no incluye pesos en safetensors ni GGUF, sino únicamente grafos ONNX para el codificador y el decodificador CTC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con cabecera CTC; exportado a ONNX |
| Parametros totales | aproximadamente 600 M (modelo base IndicConformer 600M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | int8 dinamica per-channel en capas MatMul del encoder (ONNX Runtime) |
| Idiomas soportados | as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur (22 lenguas programadas de la India) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.onnx, ctc_decoder.onnx); artefactos auxiliares vocab.json, language_masks.json, mel_fb.bin (float32, little endian) |

## Arquitectura y entrenamiento

El modelo base es IndicConformer 600M multilingual de AI4Bharat, un Conformer para ASR con cabecera CTC y vocabulario compartido entre las 22 lenguas programadas de la India. La segmentación por idioma se realiza mediante `language_masks.json`, que define la porción del vocabulario correspondiente a cada lengua. El preprocesador original se representa aquí como un banco de filtros mel de 257 × 80 en float32 little endian (`mel_fb.bin`), lo que permite reproducir la extracción de características fuera del grafo ONNX.

Esta copia no reentrena ni modifica los pesos más allá de la cuantización: solo el encoder se convierte a int8 en sus multiplicaciones matriciales mediante cuantización dinámica per-channel de ONNX Runtime. La cabecera CTC, el vocabulario y las máscaras de idioma permanecen idénticos al original. No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento (número de tokens, horas de audio, composición del dataset) ni sobre si el modelo base empleó técnicas de ajuste fino adicionales.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 22 lenguas programadas de la India: asamés, bengalí, bodo, dogri, guyaratí, hindi, canarés, cachemir, konkani, maithili, malayalam, manipuri, maratí, nepalí, oriya, panyabí, sánscrito, santali, sindhi, tamil, telugu y urdu.
- Selección de idioma mediante máscaras de vocabulario específicas (`language_masks.json`), lo que permite restringir la decodificación a la lengua objetivo.
- Decodificación CTC sobre vocabulario compartido multilingüe.
- Inferencia en CPU sin GPU, gracias al encoder cuantizado a int8.
- Funcionamiento totalmente offline, adecuado para aplicaciones de dictado privado.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento; se trata de un modelo puramente ASR.

## Casos de uso

- Dictado por voz offline en Windows: es el caso de uso original (VaaniLipi). El encoder int8 de 882 MB permite empaquetar el modelo en una aplicación de escritorio y transcribir en local sin conexión ni envío de audio a terceros.
- Subtitulado automático de contenido en lenguas indias: el modelo puede transcribir audio de vídeo o pódcast en cualquiera de las 22 lenguas seleccionando la máscara de idioma adecuada, con un coste de CPU moderado gracias a la cuantización.
- Transcripción de reuniones y notas de voz en entornos con hardware modesto: al duplicar la velocidad en CPU respecto al original, es viable procesar grabaciones en portátiles sin GPU dedicada.
- Digitalización de archivos orales en hindi, tamil, bengalí y otras lenguas: útil para bibliotecas, archivos sonoros y proyectos de preservación lingüística que necesitan transcripción por lotes en servidores sin aceleradores.
- Accesibilidad para hablantes de lenguas indias con dificultades de escritura: integración en herramientas de entrada de texto por voz que requieran privacidad y funcionamiento sin red.
- Investigación en ASR multilingüe de bajos recursos: el formato ONNX y la licencia MIT facilitan la experimentación, el benchmarking y la integración en pipelines de evaluación con ONNX Runtime.
- Prototipado de asistentes de voz locales: al no depender de servicios en la nube, encaja en productos con requisitos de soberanía de datos o despliegue en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica una reducción de tamano de 2,5 GB a 882 MB para el encoder y una velocidad aproximadamente el doble en CPU respecto al modelo original, sin cifras de WER, latencia absoluta ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo está pensado para CPU; en GPU el encoder int8 ocuparía del orden de 0,9 GB, aunque no se documenta soporte GPU específico.
- GPU recomendadas: no disponible; el diseño apunta a ejecución en CPU mediante ONNX Runtime.
- ¿Cabe en GPU de consumo? Sí, por tamaño (menos de 1 GB para el encoder), aunque la información disponible no confirma aceleración GPU.
- Opciones de despliegue: ONNX Runtime (principal, con cuantización dinámica int8); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles como cifras absolutas; la model card afirma aproximadamente el doble de velocidad en CPU frente al modelo original de 2,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Vaanilipi (esta ficha) | aprox. 600 M | no disponible | 22 lenguas indias | MIT | ONNX int8 | Encoder cuantizado, enfoque CPU offline |
| ai4bharat/indic-conformer-600m-multilingual | aprox. 600 M | no disponible | 22 lenguas indias | MIT | pesos originales (no especificado en la informacion) | Modelo base, mayor tamano (2,5 GB) y menor velocidad en CPU |
| Whisper (OpenAI) | variable (tiny a large) | ventana de audio fija | multilingue amplio, cobertura india parcial | MIT | safetensors, GGUF, ONNX | Alternativa generalista; cobertura de lenguas indias menor y sin máscaras por idioma |
| Otros ASR indios de AI4Bharat | no disponible | no disponible | subconjuntos de lenguas indias | MIT | no disponible | Familia de modelos; no se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Esta copia no está hecha ni respaldada por AI4Bharat; es una conversión de terceros y debe citarse y acreditarse el modelo original.
- La cuantización int8 puede degradar la precisión de transcripción (WER) respecto al modelo en punto flotante; no se han publicado métricas que cuantifiquen esa pérdida.
- Solo se ha cuantizado el encoder; la cabecera CTC y el preprocesador se mantienen en su forma original, por lo que el pipeline completo requiere gestionar el banco de filtros mel (`mel_fb.bin`) y el vocabulario por separado.
- Cobertura limitada a las 22 lenguas programadas de la India; no es un modelo multilingüe general y no se documenta soporte para inglés ni otras lenguas.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el corpus de entrenamiento o code-switching entre lenguas, aunque no se dispone de datos concretos al respecto.
- La selección incorrecta de la máscara de idioma puede producir transcripciones en la lengua equivocada.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución correspondiente.
- No se documentan limitaciones de longitud de audio, latencia en producción ni requisitos mínimos de CPU; conviene validar el rendimiento en el hardware objetivo antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rstc989/Vaanilipi
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- AI4Bharat (IIT Madras): https://ai4bharat.iitm.ac.in/
- Repositorio de AI4Bharat en GitHub: https://github.com/AI4Bharat
