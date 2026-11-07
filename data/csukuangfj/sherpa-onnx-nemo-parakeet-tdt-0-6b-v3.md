# csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3

## Resumen

`sherpa-onnx-nemo-parakeet-tdt-0.6b-v3` es un paquete ONNX del modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, exportado por el proyecto sherpa-onnx para su uso con su runtime de inferencia ligero. NVIDIA entreno los pesos originales en formato `.nemo`; el proyecto sherpa-onnx (k2-fsa) los convirtio a grafos ONNX y publico dos variantes: fp32 y int8. El modelo es un transducer offline (encoder, decoder y joiner) que procesa audio mono a 16 kHz y cubre 25 idiomas europeos.

El modelo resuelve el problema de transcripcion multilingue en entornos donde no se dispone de GPU o de frameworks pesados como PyTorch: al estar en ONNX, se ejecuta con sherpa-onnx sobre CPU, con un footprint de repositorio de 3,3 GB y una variante int8 notablemente mas ligera. Es relevante para despliegues en produccion de bajo coste, edge computing y pipelines de transcripcion en lote, donde la latencia y el consumo de memoria importan mas que la maxima precision absoluta.

La arquitectura subyacente es un TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parametros, el mismo backbone que la version v2 pero extendido a 25 idiomas. La model card del exportador reporta mediciones WER propias sobre FLEURS, no las cifras oficiales de NVIDIA, y advierte explicitamente que el modelo no realiza identificacion de idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer); encoder + decoder + joiner |
| Parametros totales | 0,6 mil millones (0.6b, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; audio de entrada mono a 16 kHz, recomendado segmentar en trozos de 15-20 s |
| Tipos de cuantizacion | fp32 e int8 (dos paquetes separados) |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 (pesos de NVIDIA); codigo de exportacion Apache-2.0 |
| Formato de pesos | ONNX (encoder.onnx + encoder.weights externos, decoder.onnx, joiner.onnx); variante int8 con grafos `.int8.onnx` |

## Arquitectura y entrenamiento

El modelo es un transducer TDT, una variante de RNN-Transducer en la que el joiner predice conjuntamente el token y su duracion, lo que reduce el numero de pasos de decodificacion respecto a un transducer convencional. El paquete incluye tres grafos ONNX separados: encoder (con pesos externos en `encoder.weights`), decoder y joiner. El exportador escribe metadatos con `tdt` en el campo `url` del encoder, de modo que sherpa-onnx carga el joiner como TDT y no como transducer plano.

Los pesos fueron entrenados por NVIDIA en el checkpoint original `.nemo`; el paquete aqui descrito es unicamente una conversion de formato realizada por el proyecto sherpa-onnx mediante el script `scripts/nemo/parakeet-tdt-0.6b-v3/` y el workflow `export-nemo-parakeet-tdt-0.6b-v2.yaml`. No se dispone en la informacion proporcionada de detalles sobre volumen de tokens de entrenamiento, composicion del dataset, ni si se aplico RLHF o DPO. La model card no documenta innovaciones de decodificacion especulativa ni atencion lineal mas alla del propio mecanismo TDT.

## Capacidades

- Transcripcion de voz a texto offline para audio mono a 16 kHz en 25 idiomas europeos.
- Decodificacion por transducer TDT con prediccion conjunta de token y duracion.
- Ejecucion sobre CPU mediante sherpa-onnx, sin dependencia de PyTorch en tiempo de inferencia.
- Dos variantes de precision: fp32 (referencia) e int8 (mas rapida y ligera).
- Soporte de audio de cualquier duracion mediante segmentacion externa en trozos de 15-20 s cortados en silencios.
- No realiza identificacion de idioma: transcribe pero no reporta que lengua ha detectado.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso; es exclusivamente un modelo ASR.
- No dispone de vision, audio generation ni modo thinking.

## Casos de uso

- Transcripcion por lotes en servidores sin GPU: al ejecutarse en ONNX sobre CPU con sherpa-onnx, permite procesar horas de audio en infraestructura estandar sin aprovisionar aceleradores.
- Despliegue en dispositivos edge o embebidos: la variante int8 reduce el peso y la latencia, lo que la hace apta para cajas industriales, Raspberry Pi de gama alta o mini-PC con transcripcion local.
- Subtitulado automatico multilingue: con cobertura de 25 idiomas, un mismo pipeline puede generar subtitulos para contenido en espanol, aleman, frances, polaco, etc., segmentando el audio en silencios.
- Actas y notas de reunion: el modelo transcribe audio mono de 16 kHz procedente de microfonos de sala; requiere normalizacion de ganancia previa por el problema documentado con entradas muy silenciosas.
- Indexacion y busqueda de audio corporativo: transcripcion en lote de llamadas o grabaciones para alimentar motores de busqueda textual, con coste de inferencia bajo gracias a la variante int8.
- Pipelines de accesibilidad: generacion de transcripciones para videos o podcasts en tiempo casi real en CPU, integradas en flujos existentes de sherpa-onnx.
- Preprocesado para sistemas downstream: la salida de texto puede alimentar clasificadores, resumidores o sistemas de analisis de sentimiento, siempre que se acepte que el modelo no etiqueta el idioma detectado.

## Benchmarks y rendimiento

La model card del exportador reporta WER (%) sobre el split de test de FLEURS, 300 clips deterministas por idioma, sin puntuacion ni mayusculas, decodificados con un unico harness para los tres modelos comparados. Son cifras propias del proyecto sherpa-onnx, no comparables directamente con benchmarks publicados por NVIDIA.

| Idioma | v3 (este paquete) | v2 (solo ingles) | Ultra |
|---|---|---|---|
| Ingles | 11,16 | 6,48 | 8,56 (clips <=15 s) |
| Aleman | 6,84 | no disponible | 5,20 |
| Frances | 8,69 | no disponible | 7,48 |
| Espanol | 4,55 | no disponible | 3,81 |

Prueba de estres con clips ingleses concatenados de FLEURS separados por silencios de 0,2 s:

| Estrategia | WER | Incremento de RSS |
|---|---|---|
| Clip completo (184,6 s) | 66,50 % | +1645 MB |
| Segmentacion en silencios, trozos de 15 s | 14,91 % | +142 MB |

Clips ingleses cortos de 15 s o menos (282 clips): v2 6,42, v3 11,01, Ultra 8,56. No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; sherpa-onnx ejecuta el modelo en CPU. Para GPU no se dispone de cifras de VRAM en la informacion proporcionada.
- GPU recomendadas: no disponible; el paquete esta pensado para CPU.
- Cabe en GPU consumer: no disponible como dato verificado; el consumo medido en CPU fue de +142 MB de RSS con segmentacion en trozos de 15 s y +1645 MB decodificando un clip completo de 184,6 s.
- Opciones de despliegue: sherpa-onnx (runtime nativo, API Python `OfflineRecognizer.from_transducer`), con variantes fp32 e int8. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible; la model card solo aporta medidas comparativas de WER y memoria en una maquina Linux con CPU, sin cifras de latencia o RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sherpa-onnx-nemo-parakeet-tdt-0.6b-v3 (este) | 0,6 B | 16 kHz mono; segmentar en 15-20 s | 25 | CC BY 4.0 | ONNX (fp32 e int8) |
| sherpa-onnx-nemo-parakeet-tdt-0.6b-v2 | 0,6 B | 16 kHz mono | solo ingles | CC BY 4.0 (pesos NVIDIA) | ONNX |
| Ultra (paquete sherpa-onnx multilingue) | no disponible | 16 kHz mono | multilingue | no disponible | ONNX |
| sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000-int8 | 110 M | 16 kHz mono | solo ingles | no disponible | ONNX int8 |

En FLEURS, v2 sigue siendo el mejor en ingles (6,48 frente a 11,16 de v3), mientras que Ultra supera a v3 en aleman (5,20 frente a 6,84), frances (7,48 frente a 8,69) y espanol (3,81 frente a 4,55). La ventaja de v3 es empaquetar 25 idiomas en un unico modelo de 0,6 B.

## Limitaciones y advertencias

- El audio largo debe cortarse en silencios. Decodificar una grabacion completa degrada gravemente la calidad y dispara el consumo de memoria (66,50 % WER y +1645 MB en el clip de estres de 184,6 s). Segmentar en trozos de 15-20 s cortados en silencios; nunca usar ventanas de duracion fija.
- El modelo transcribe pero no identifica el idioma; no debe usarse como language identifier.
- Entradas muy silenciosas se ven afectadas por un problema de frontend reportado upstream (k2-fsa/sherpa-onnx#4024); normalizar la ganancia antes de la inferencia.
- El paquete int8 es mas pequeno y rapido y es el recomendado para la mayoria de usuarios; la salida del fp32 puede diferir ligeramente.
- El rendimiento en ingles es el punto debil relativo: si la precision en utterances largas en ingles es prioritaria, v2 es mejor opcion que v3.
- Las cifras WER de la model card son mediciones propias del proyecto sherpa-onnx, no comparables con benchmarks oficiales de NVIDIA.
- Licencia CC BY 4.0: permite uso comercial con atribucion a NVIDIA y al proyecto sherpa-onnx; NVIDIA no respalda este paquete exportado.
- Riesgo de alucinacion: no documentado en la informacion disponible; en ASR, el riesgo se manifiesta como transcripciones erroneas en audio ruidoso o con acentos no cubiertos por el entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3
- Variante int8: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Documentacion sherpa-onnx para modelos NeMo: https://k2-fsa.github.io/sherpa/onnx/nemo/index.html
- Script de exportacion: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-v3
- Workflow de exportacion: https://github.com/k2-fsa/sherpa-onnx/blob/master/.github/workflows/export-nemo-parakeet-tdt-0.6b-v2.yaml
- Licencia del codigo sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/blob/master/LICENSE
- Issue de frontend sobre audio silencioso: https://github.com/k2-fsa/sherpa-onnx/issues/4024
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
