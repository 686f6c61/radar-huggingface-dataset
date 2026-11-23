# eigami/whisper.cpp-models

## Resumen

`eigami/whisper.cpp-models` no es un modelo entrenado por su autor, sino un espejo de los modelos de reconocimiento de voz de OpenAI Whisper (variantes base, small y large-v3-turbo) ya convertidos al formato GGML para `whisper.cpp` y cuantizados por los autores originales del proyecto. El repositorio existe para que la aplicacion de edicion de video Eigami pueda descargar los pesos sin depender de la cuenta `ggerganov`, y la app verifica el SHA-256 de cada fichero antes de usarlo. El tamano total del repositorio es de 0,8 GB.

La relevancia de esta ficha es limitada desde el punto de vista de investigacion: se trata de un artefacto de distribucion, no de un modelo nuevo. Su interes practico radica en que ofrece pesos de Whisper listos para inferencia local con `whisper.cpp` en CPU y GPU, con cuantizacion q5, lo que reduce el consumo de memoria frente a los pesos originales en PyTorch. La licencia declarada es MIT, heredada de los modelos originales de OpenAI.

No se dispone de informacion sobre pipeline, idiomas o datos de entrenamiento en la model card proporcionada; los datos tecnicos que se detallan a continuacion corresponden a los modelos Whisper originales de los que deriva este espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper original de OpenAI) |
| Parametros totales | No disponible en la model card; las variantes base, small y large-v3-turbo de Whisper tienen aproximadamente 74 M, 244 M y 809 M de parametros respectivamente |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; Whisper procesa ventanas de audio de 30 segundos |
| Tipos de cuantizacion | q5_1 (base y small) y q5_0 (large-v3-turbo), en formato GGML |
| Idiomas soportados | No disponible en la model card; Whisper original es multilingue |
| Licencia | MIT |
| Formato de pesos | GGML (`.bin`) para `whisper.cpp` |

## Arquitectura y entrenamiento

Los pesos incluidos derivan de los modelos Whisper de OpenAI, que emplean una arquitectura transformer encoder-decoder entrenada para transcripcion y traduccion de voz. El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos detalles pertenecen a la documentacion original de OpenAI y no se reproducen aqui.

La unica transformacion aplicada por los autores de `whisper.cpp` es la conversion del formato PyTorch a GGML y la cuantizacion a 5 bits (q5_0 y q5_1). No se anuncia ninguna innovacion arquitectonica adicional, decodificacion especulativa ni atencion lineal en la informacion disponible.

## Capacidades

- Transcripcion de voz a texto (speech-to-text) en las variantes base, small y large-v3-turbo.
- Ejecucion local mediante `whisper.cpp`, sin dependencia de frameworks de deep learning en Python.
- Cuantizacion a 5 bits para reducir el uso de memoria y el tamano en disco.
- Verificacion de integridad mediante SHA-256 por parte de la aplicacion consumidora.
- Capacidades multilingues: no confirmadas en la model card, aunque heredadas de Whisper original.
- No se documentan tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion local en aplicaciones de escritorio: la app Eigami usa estos pesos para convertir audio de video en texto sin enviar datos a la nube, gracias a la ejecucion con `whisper.cpp`.
- Edicion de video asistida por transcripcion: el editor puede generar subtitulos y permitir busqueda por texto en la linea de tiempo usando la variante small o base para iteracion rapida.
- Prototipado en CPU: la variante base cuantizada q5_1 permite probar pipelines de ASR en equipos sin GPU dedicada.
- Transcripcion de mayor calidad en local: la variante large-v3-turbo q5_0 ofrece el mejor equilibrio calidad/velocidad de las tres incluidas para audio con ruido o acentos.
- Distribucion reproducible de pesos: util para equipos que necesitan fijar una version concreta de los pesos y verificar su integridad por hash en CI.
- Integracion en herramientas CLI: `whisper.cpp` permite invocar los modelos desde scripts para procesar lotes de audio en servidores sin entorno Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con cuantizacion q5, los modelos base, small y large-v3-turbo ocupan del orden de decenas a pocos cientos de MB, aunque esta cifra no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable para las tres variantes por su tamano reducido y la cuantizacion, pero no confirmado en la informacion proporcionada.
- Opciones de despliegue: `whisper.cpp` (formato nativo GGML); no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eigami/whisper.cpp-models (base) | ~74 M (Whisper base) | No disponible | GGML q5_1 | MIT | Hugging Face |
| eigami/whisper.cpp-models (small) | ~244 M (Whisper small) | No disponible | GGML q5_1 | MIT | Hugging Face |
| eigami/whisper.cpp-models (large-v3-turbo) | ~809 M (Whisper large-v3-turbo) | No disponible | GGML q5_0 | MIT | Hugging Face |
| ggerganov/whisper.cpp | Mismos modelos | No disponible | GGML | MIT | Hugging Face |

Las cifras de parametros de Whisper original no aparecen en la model card y se incluyen solo como referencia de los modelos de origen; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es una copia de pesos de terceros; cualquier limitacion de Whisper original aplica integramente.
- La model card no documenta sesgos, tasas de alucinacion ni limitaciones por idioma.
- El rendimiento en audio largo depende de la ventana de 30 segundos de Whisper; no se detalla gestion de contexto en la informacion disponible.
- La licencia MIT se hereda del proyecto original; conviene revisar el fichero `LICENSE` del repositorio y los terminos de OpenAI para los pesos de origen antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria documentada.
- Depende de la app consumidora para la verificacion SHA-256; no se especifica que ocurre si la verificacion falla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eigami/whisper.cpp-models
- Repositorio de origen de los pesos: https://huggingface.co/ggerganov/whisper.cpp
