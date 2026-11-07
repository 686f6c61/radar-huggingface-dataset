# csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra-int8

## Resumen

`sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra-int8` es un paquete de reconocimiento automatico del habla (ASR) offline listo para usar con la libreria sherpa-onnx. No se trata de un modelo entrenado desde cero por el autor del repositorio, sino de una exportacion a ONNX en precision int8 de los pesos de Moondream Parakeet Ultra, que a su vez es un post-entrenamiento de NVIDIA `parakeet-tdt-0.6b-v3` reutilizando su arquitectura y su tokenizer. El resultado es un transductor TDT (Token-and-Duration Transducer) con encoder, decoder y joiner separados, pensado para audio mono a 16 kHz.

El modelo cubre 25 idiomas europeos (incluido el espanol) y esta empaquetado especificamente para inferencia en CPU mediante sherpa-onnx, sin dependencias de PyTorch ni de CUDA. Su relevancia practica esta en que ofrece transcripcion multilingue en un paquete de unos 0,7 GB con licencia CC BY 4.0, lo que facilita su integracion en aplicaciones de linea de comandos, servicios embebidos o pipelines sin GPU.

La ficha se centra en el paquete int8 publicado; existe una variante fp32 equivalente en el mismo espacio de nombres. Los datos de evaluacion disponibles son mediciones propias del proyecto sherpa-onnx sobre FLEURS, no cifras oficiales de NVIDIA ni de Moondream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) NeMo: encoder + decoder + joiner |
| Parametros totales | 0,6 mil millones (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; audio de entrada a 16 kHz mono, recomendado dividir en fragmentos de 15-20 s |
| Tipos de cuantizacion | int8 (este paquete); existe variante fp32 |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 (pesos); codigo de exportacion Apache-2.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

El modelo es un transductor TDT de NeMo con tres componentes desacoplados: un encoder acustico, un decoder de prediccion y un joiner que combina ambos y predice tanto el token como su duracion. El exporter escribe metadatos en el encoder con `tdt` en el campo `url`, de modo que sherpa-onnx carga el joiner como TDT y no como transductor simple. La entrada es audio mono a 16 kHz en punto flotante.

Los pesos originales fueron entrenados por Moondream como post-entrenamiento de `nvidia/parakeet-tdt-0.6b-v3`, reutilizando la arquitectura y el tokenizer de v3. El proyecto sherpa-onnx se encargo de exportar esos pesos a la estructura de grafo de v3 y de generar la version int8. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Transcripcion de voz a texto offline para audio mono a 16 kHz.
- Cobertura multilingue de 25 idiomas europeos en un unico paquete, sin necesidad de seleccionar idioma.
- Decodificacion en streaming por fragmentos mediante la API `OfflineRecognizer.from_transducer` de sherpa-onnx.
- Ejecucion en CPU sin GPU, gracias a los grafos ONNX en int8.
- Integracion con la API de sherpa-onnx en Python y en otros bindings de la libreria.
- No realiza identificacion de idioma: transcribe, pero no informa de que lengua ha detectado.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado de videos y podcasts multilingues: se trocea el audio en segmentos de 15-20 s cortados en silencios y se transcribe cada uno con el recognizer, aprovechando la cobertura de 25 idiomas sin cambiar de modelo.
- Actas y notas de reunion: el modelo genera transcripciones en espanol, aleman, frances o ingles con WER medido entre 3,81 % y 8,51 % en FLEURS, adecuado para resumenes posteriores con un LLM.
- Transcripcion en dispositivos sin GPU: al ser ONNX int8 y funcionar en CPU, encaja en portatiles, mini-PC o servidores sin acelerador, con un paquete de 0,7 GB.
- Indexacion y busqueda de archivos de audio: se transcriben lotes de grabaciones y se indexa el texto resultante para busqueda semantica o por palabras clave.
- Atencion al cliente con analisis de llamadas: transcripcion por lotes de grabaciones telefonicas para control de calidad, deteccion de temas y cumplimiento, siempre troceando por silencios.
- Prototipado rapido de pipelines ASR: la API de sherpa-onnx permite montar un reconocedor en pocas lineas de Python, util para validar productos antes de invertir en infraestructura.
- Accesibilidad: generacion de subtitulos en directo en aplicaciones de escritorio o web con backend local, sin enviar audio a servicios en la nube.

## Benchmarks y rendimiento

Resultados propios del proyecto sherpa-onnx sobre el split de test de FLEURS, 300 clips deterministas por idioma, sin puntuacion ni mayusculas, WER en porcentaje. No son comparables directamente con benchmarks publicados por NVIDIA o Moondream.

| Idioma | Ultra (este paquete) | v3 | v2 |
|---|---|---|---|
| Ingles | 8,51 | no disponible en la fuente | 6,48 |
| Aleman | 5,20 | 6,84 | no cubierto |
| Frances | 7,48 | 8,69 | no cubierto |
| Espanol | 3,81 | 4,55 | no cubierto |

Clips cortos de ingles de 15 s o menos (282 clips): v2 6,42, v3 11,01, Ultra 8,56.

Prueba de estres con audio largo: concatenando frases FLEURS en ingles con silencios de 0,2 s, la decodificacion de un clip completo de 184,6 s alcanzo 37,65 % WER con +2335 MB de RSS sobre la linea base; dividiendo en fragmentos de 15 s cortados en silencios, 9,54 % WER con +196 MB.

## Requisitos de hardware

- VRAM: no aplica, el paquete esta pensado para inferencia en CPU; el tamano del repositorio es de 0,7 GB.
- GPU: no es necesaria; no se documenta soporte CUDA en este paquete.
- Cabe en cualquier equipo consumer: portatiles, mini-PC y Raspberry Pi con recursos suficientes para sherpa-onnx.
- Despliegue: sherpa-onnx (Python y otros bindings), cargando los tres grafos ONNX int8 y el fichero `tokens.txt`.
- Memoria: en la prueba de estres, la decodificacion por fragmentos de 15 s anadio unos 196 MB de RSS sobre la linea base.
- Latencia y throughput: no disponibles de forma absoluta; las mediciones publicadas son comparativas en una unica maquina Linux con CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia | Paquete |
|---|---|---|---|---|---|
| Parakeet Ultra int8 (este) | 0,6 B | 25 | TDT ONNX int8 | CC BY 4.0 | sherpa-onnx |
| sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | 0,6 B | 25 (segun model card de v3) | TDT ONNX int8 | no disponible en la fuente | sherpa-onnx |
| Parakeet v2 | 0,6 B | Ingles | TDT | no disponible en la fuente | referenciado en la evaluacion |
| NVIDIA parakeet-tdt-0.6b-v3 | 0,6 B | 25 | TDT NeMo | no disponible en la fuente | NeMo / ONNX |

Ultra supera a v3 en aleman, frances y espanol en FLEURS, pero v2 sigue siendo el mejor en ingles (6,48 frente a 8,51). Para clips cortos de ingles, v2 tambien gana (6,42 frente a 8,56).

## Limitaciones y advertencias

- El audio largo debe dividirse en silencios: decodificar una grabacion completa degrada gravemente la precision y dispara el consumo de memoria. Usar fragmentos de 15-20 s cortados en silencios, nunca ventanas de duracion fija.
- El paquete int8 es mas pequeno y rapido y es el recomendado; el fp32 es la referencia y puede diferir ligeramente en la salida.
- El modelo transcribe pero no identifica el idioma; no debe usarse como detector de lengua.
- Las entradas muy silenciosas se ven afectadas por un problema del frontend registrado en k2-fsa/sherpa-onnx#4024; conviene normalizar la ganancia antes de la inferencia.
- En ingles, v2 es mas preciso en utterances largas; si la precision en ingles es prioritaria, conviene evaluar v2 en lugar de Ultra.
- Los resultados de FLEURS son mediciones del proyecto sherpa-onnx, no del autor del modelo, y no son directamente comparables con benchmarks publicados.
- Licencia CC BY 4.0: permite uso comercial con atribucion; el codigo de exportacion es Apache-2.0.
- Ni NVIDIA ni Moondream respaldan este paquete exportado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra-int8
- Modelo base (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Script de exportacion: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-ultra
- Workflow de publicacion: https://github.com/k2-fsa/sherpa-onnx/blob/master/.github/workflows/export-nemo-parakeet-tdt-0.6b-v2.yaml
- Pull request de exportacion: https://github.com/k2-fsa/sherpa-onnx/pull/4163
- Issue de frontend: https://github.com/k2-fsa/sherpa-onnx/issues/4024
- Licencia sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/blob/master/LICENSE
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Documentacion NeMo en sherpa: https://k2-fsa.github.io/sherpa/onnx/nemo/index.html
- Paquete v3 int8: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
