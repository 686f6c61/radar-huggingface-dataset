# dreambeltech/ailo-parakeet-tdt-sherpa-onnx

## Resumen

Ailo Parakeet TDT sherpa-onnx es una conversión a ONNX con cuantización int8 del modelo de reconocimiento automático del habla NVIDIA Parakeet TDT 0.6B v3, empaquetada por el proyecto sherpa-onnx (k2-fsa) y replicada por Dreambel Tech para su aplicación Android Ailo. No es un modelo nuevo ni un reentrenamiento: los ficheros son idénticos byte a byte a los del paquete oficial `sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2`, publicados con sumas SHA-256 verificables para que la aplicación pueda validar cada fichero antes de cargarlo.

El modelo resuelve el problema de la transcripción de voz totalmente local en dispositivos móviles: un transductor offline (encoder, decoder y joiner) que procesa audio mono a 16 kHz sin salir del teléfono. Con unos 670 MB en disco (aproximadamente 640 MiB) y cuantización int8, está pensado para inferencia en CPU dentro de Android mediante la librería sherpa-onnx, no para servidores GPU.

Su relevancia actual radica en dos factores: cubre 25 idiomas europeos (incluido el español) y ofrece una huella lo bastante reducida como para integrarse en una app móvil con verificación criptográfica de integridad. Es una pieza de infraestructura de despliegue, no un modelo de investigación, y así debe evaluarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor (RNN-T/TDT) NeMo: encoder, decoder y joiner |
| Parametros totales | 0,6 B (heredados de nvidia/parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; se recomienda segmentar en silencios) |
| Tipos de cuantizacion | int8 (única variante publicada en este repo) |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (25) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) + tokens.txt |
| Tamano del repo | 0,7 GB (670.576.784 bytes, ~640 MiB) |
| Entrada de audio | 16 kHz mono |
| Tipo de modelo en sherpa-onnx | `nemo_transducer` |
| Biblioteca | sherpa-onnx |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transductor Neural (familia RNN-T) con decodificación TDT (Token-and-Duration Transducer), tal como indica el nombre del modelo base de NVIDIA. El paquete contiene tres grafos ONNX separados: un encoder de 652.282.294 bytes, un decoder de 11.845.274 bytes y un joiner de 6.355.277 bytes, más un vocabulario `tokens.txt` de 93.939 bytes. Esta separación es la habitual en sherpa-onnx para transductores NeMo y permite cargar el encoder una vez y reutilizarlo entre segmentos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si hubo etapas de ajuste fino con RLHF o DPO: esos detalles pertenecen a la model card de NVIDIA, que no se incluye en la información proporcionada. La innovación técnica de esta réplica concreta no está en el entrenamiento sino en el pipeline de exportación: el proyecto sherpa-onnx convirtió los pesos desde el checkpoint `.nemo` original y los cuantizó a int8 mediante el script `scripts/nemo/parakeet-tdt-0.6b-v3/`. La decodificación TDT predice conjuntamente token y duración, lo que reduce los pasos de decodificación frente a un RNN-T clásico, algo relevante en CPU móvil.

## Capacidades

- Transcripción de voz a texto (ASR) offline para audio mono a 16 kHz.
- Soporte multilingüe para 25 idiomas europeos, con español incluido.
- Ejecución en dispositivo sin conexión de red: el audio no abandona el teléfono.
- Integración nativa con sherpa-onnx bajo el tipo de modelo `nemo_transducer`.
- Verificación de integridad mediante tamaños y SHA-256 publicados para cada fichero.
- No realiza identificación ni detección de idioma: solo transcribe; la selección de idioma debe hacerla la aplicación anfitriona.
- No se documentan capacidades de puntuación avanzada, diarización, marcas de tiempo a nivel de palabra ni traducción.

## Casos de uso

- Transcripción de notas de voz en Android: la app captura audio mono a 16 kHz, lo segmenta en silencios y pasa cada segmento al transductor; al ejecutarse en local, funciona en modo avión y cumple requisitos estrictos de privacidad.
- Dictado multilingüe en aplicaciones de productividad: con 25 idiomas cubiertos, un usuario puede dictar en español, inglés o alemán sin cambiar de binario, siempre que la app determine el idioma de cada toma.
- Subtitulado local de grabaciones cortas: segmentando por silencios se generan transcripciones sin subir el audio a ningún servicio, útil en entornos con datos sensibles (salud, legal, educación).
- Asistentes de voz embebidos: al ser un modelo de 0,6 B cuantizado a int8, cabe en el almacenamiento de un móvil moderno y se ejecuta en CPU, lo que permite integrarlo en flujos de comandos por voz sin backend.
- Distribución de apps con verificación de artefactos: los SHA-256 y tamaños publicados permiten a un cliente descargar el modelo en el primer arranque y validar cada fichero antes de usarlo, reduciendo el riesgo de pesos corruptos o manipulados.
- Investigación en ASR en el borde: sirve como referencia reproducible de un transductor NeMo convertido a ONNX int8 para comparar latencia y precisión frente a otras variantes (float32, otras cuantizaciones) en hardware móvil.
- Procesamiento por lotes en CPU sin GPU: para volúmenes moderados de audio corto, un servidor sin aceleradores puede ejecutar sherpa-onnx con este paquete, aunque no es su escenario objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, latencia ni throughput, ni comparaciones con otros modelos.

## Requisitos de hardware

- Almacenamiento: aproximadamente 640 MiB para los tres grafos ONNX y el vocabulario; el paquete original comprimido ocupa 487.211.443 bytes.
- VRAM: no aplica; el modelo está orientado a inferencia en CPU. En GPU requeriría conversión adicional no documentada.
- GPU recomendadas: no disponible; no se documenta soporte GPU para esta variante int8 de sherpa-onnx.
- CPU móvil: es el destino previsto (app Android Ailo), con sherpa-onnx como runtime.
- Opciones de despliegue: sherpa-onnx (librería principal); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un transductor ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ailo Parakeet TDT sherpa-onnx (esta ficha) | 0,6 B | 25 | ONNX int8 | CC BY 4.0 | Réplica verificable del paquete sherpa-onnx; orientado a Android |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 | Pesos NeMo originales | CC BY 4.0 | Modelo base; requiere NeMo para inferencia |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | 0,6 B | 25 | ONNX int8 | CC BY 4.0 | Mismos ficheros y SHA-256; publicación del mantenedor de sherpa-onnx |

No se dispone de datos de rendimiento para comparar precisión o latencia entre estas variantes.

## Limitaciones y advertencias

- No detecta el idioma: la aplicación debe decidir qué tomas enviar al modelo; enviar audio de un idioma no cubierto degradará la transcripción.
- Entrada restringida a audio mono a 16 kHz; otra frecuencia o número de canales requiere remuestreo y mezcla previos.
- Se recomienda dividir el audio largo en silencios en lugar de decodificar una grabación completa de una vez, lo que implica trabajo adicional en la app.
- Es una copia modificada (conversión a ONNX y cuantización int8) no oficial de NVIDIA ni del proyecto sherpa-onnx; no cuenta con su respaldo.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a NVIDIA y al proyecto sherpa-onnx, e indicar que se han realizado modificaciones.
- La cuantización int8 puede introducir pérdida de precisión respecto a los pesos originales; no se publican métricas que la cuantifiquen.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan sesgos específicos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- No se incluyen los `test_wavs/` ni el README del paquete original, lo que dificulta la reproducción de pruebas por parte de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dreambeltech/ailo-parakeet-tdt-sherpa-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Réplica del mantenedor de sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Release de modelos ASR: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- Script de exportación: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-v3
- Licencia del código de sherpa-onnx (Apache-2.0): https://github.com/k2-fsa/sherpa-onnx/blob/master/LICENSE
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Sitio del autor de la réplica: https://dreambel.tech
