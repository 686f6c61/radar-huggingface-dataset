# doanhlt/cabin-asr-ja-parakeet-tdt-ctc-offline-pj1

## Resumen

cabin-asr-ja-parakeet-tdt-ctc-offline-pj1 es un paquete de reconocimiento automatico del habla (ASR) en japones, empaquetado en formato ONNX int8 para su uso con sherpa-onnx en la aplicacion movil Cabin. Lo publica el usuario doanhlt en Hugging Face y deriva de nvidia/parakeet-tdt_ctc-0.6b-ja, un modelo FastConformer hibrido TDT/CTC de NVIDIA NeMo con aproximadamente 0.6 mil millones de parametros. El paquete es un fine-tune completo del modelo base y solo exporta la rama CTC para inferencia offline en dispositivo.

El modelo resuelve el problema de transcripcion de voz en japones sin conexion, con un peso de repositorio de 0.7 GB y cuantizacion int8, lo que lo hace apto para ejecucion local en moviles y sistemas embebidos. La licencia es CC-BY-4.0, con atribucion obligatoria a NVIDIA NeMo.

Su relevancia actual radica en que permite ASR japones offline de calidad razonable en hardware limitado, sin depender de APIs en la nube. No obstante, se trata de una version de investigacion (release-candidate), sin benchmarks publicados en la informacion disponible y con cero descargas y likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrido TDT / CTC (solo rama CTC exportada) |
| Parametros totales | ~0.6 B (modelo base nvidia/parakeet-tdt_ctc-0.6b-ja) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | japones (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (model.int8.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo base es un FastConformer hibrido que combina decodificacion TDT (Token-and-Duration Transducer) y CTC. Este paquete exporta unicamente la rama CTC a ONNX int8, siguiendo el mismo enfoque que el paquete k2-fsa sherpa-onnx-nemo-parakeet-tdt_ctc-0.6b-ja-35000-int8. La carga se realiza mediante `sherpa_onnx.OfflineRecognizer.from_nemo_ctc(model="model.int8.onnx", tokens="tokens.txt")`.

El entrenamiento consistio en un fine-tune completo sobre datos de YouTube japones (YODAS2 CC BY 3.0, shards 0-18) mas videos nuevos de canales disjuntos (talk shows, entrevistas, vlogs), con objetivos generados por R13x (un fine-tune de Qwen3-ASR) que coincidian con los subtitulos, y FLEURS ja train (CC-BY-4.0, datos humanos). Se descartaron las filas cuyos objetivos quedaban fuera del vocabulario base. No se usaron textos de Gemini, Soniox ni OpenAI API. El gate de validacion esta pre-registrado en mobile-local/distill/DECISIONS.log (2026-11-21 02:45, arm pj1) y el conjunto de validacion de YouTube es disjunto por canal, con referencia de profesor (tier T3).

## Capacidades

- Transcripcion de voz a texto en japones en modo offline.
- Inferencia en dispositivo mediante sherpa-onnx con pesos ONNX int8.
- Decodificacion CTC (la rama TDT no se exporta en este paquete).
- Integracion con la aplicacion movil Cabin.
- No se documentan capacidades de tool calling, agentes, vision, audio adicional ni modo thinking.
- Capacidad multilingue limitada al japones segun la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y entrevistas en japones sin conexion: el modelo puede procesar audio localmente en un portatil o movil, evitando enviar grabaciones a servicios en la nube y reduciendo riesgos de privacidad.
- Subtitulado automatico de videos japoneses en pipelines de edicion: al ser offline y ligero (0.7 GB int8), se puede ejecutar en un equipo de produccion para generar subtitulos preliminares que luego revise un editor humano.
- Asistentes de voz embebidos en dispositivos IoT o moviles: la integracion con sherpa-onnx permite desplegar el reconocedor en apps Android/iOS o en placas con recursos limitados.
- Notas de voz a texto en aplicaciones de productividad: el usuario dicta en japones y la app transcribe localmente, sin depender de conectividad.
- Analisis de contenido audiovisual para moderacion o indexacion: transcripcion masiva de archivos de audio japoneses en un servidor sin GPU dedicada, gracias a la cuantizacion int8.
- Investigacion en ASR japones: sirve como punto de partida para fine-tunes adicionales o para comparar el rendimiento de la rama CTC frente a TDT en entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un gate pre-registrado con resultado PASS en el host gate y un fichero gate.json, pero no se incluyen cifras numericas (WER, CER, latencia) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con cuantizacion int8 y ~0.6 B de parametros, el peso del modelo es de 0.7 GB, por lo que se espera un consumo de memoria en el rango de 1-2 GB, aunque no se confirma en la informacion.
- GPU recomendadas: no disponible. Al ser un modelo ONNX int8 para sherpa-onnx, esta disenado para ejecucion en CPU y dispositivos moviles; no se documentan requisitos de GPU.
- Cabe en GPU consumer: previsiblemente si, dado el tamano, pero no se confirma en la informacion.
- Opciones de despliegue: sherpa-onnx (OfflineRecognizer.from_nemo_ctc). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cabin-asr-ja-parakeet-tdt-ctc-offline-pj1 | ~0.6 B | no disponible | CC-BY-4.0 | ONNX int8 | Fine-tune japones, solo rama CTC, orientado a movil |
| k2-fsa/sherpa-onnx-nemo-parakeet-tdt_ctc-0.6b-ja-35000-int8 | ~0.6 B | no disponible | no disponible en la informacion | ONNX int8 | Paquete de referencia citado por el autor; mismo enfoque de exportacion |
| nvidia/parakeet-tdt_ctc-0.6b-ja | ~0.6 B | no disponible | CC-BY-4.0 | NeMo (no ONNX) | Modelo base de NVIDIA; incluye ramas TDT y CTC |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es una version de investigacion (release-candidate); el cambio a produccion depende del propietario y no esta confirmado.
- Solo se exporta la rama CTC; se pierde la decodificacion TDT del modelo base.
- El vocabulario esta limitado al del modelo base: se descartaron filas de entrenamiento con objetivos fuera de ese vocabulario.
- Los datos de entrenamiento incluyen audio de YouTube con cualquier licencia, no redistribuido, lo que puede afectar a la reproducibilidad y a la trazabilidad legal.
- La referencia del conjunto de validacion de YouTube es una referencia de profesor (tier T3), no humana, lo que limita la fiabilidad de la evaluacion.
- Riesgo de alucinacion y errores en audio con ruido, acentos o vocabulario fuera de dominio no cuantificado en la informacion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a NVIDIA NeMo y al autor del paquete.
- Cero descargas y likes en el momento de la consulta; sin evidencia de uso en produccion.
- No se documentan sesgos especificos ni cobertura de dialectos japoneses.

## Enlaces

- Hugging Face: https://huggingface.co/doanhlt/cabin-asr-ja-parakeet-tdt-ctc-offline-pj1
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Paquete de referencia sherpa-onnx: https://huggingface.co/k2-fsa/sherpa-onnx-nemo-parakeet-tdt_ctc-0.6b-ja-35000-int8
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
