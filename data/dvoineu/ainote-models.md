# dvoineu/ainote-models

## Resumen

`dvoineu/ainote-models` es un repositorio de artefactos de inferencia para reconocimiento automatico del habla (ASR) en dispositivo, distribuidos como archivos `.ainotemodel` inmutables y verificados por SHA-256. No se trata de un modelo entrenado por el autor, sino de un empaquetado de pesos ya existentes (Whisper large-v3 y Whisper large-v3-turbo de OpenAI, y GigaAM v3 en variante RNNT cuantizada a int8) preparados para su ejecucion en el runtime Sayfolio, con soporte declarado para CoreML y sherpa-onnnx.

El repositorio resuelve un problema operativo concreto: la distribucion reproducible de modelos ASR en aplicaciones de escritorio y moviles, con integridad criptografica garantizada y versionado semantico en el nombre del paquete. Cada archivo incluye su hash SHA-256 publicado en la model card, lo que permite verificar la descarga antes de cargarla en el runtime.

La relevancia actual del repositorio es limitada pero especifica: no aporta mejoras de arquitectura ni nuevos pesos, sino una capa de empaquetado. Resulta util para desarrolladores que integren Sayfolio o que necesiten artefactos ASR predecibles y verificables en entornos sin acceso a Internet en tiempo de ejecucion. El tamano total del repositorio es de aproximadamente 1,1 GB, repartido entre los tres archivos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) para los paquetes `whisper-*`; GigaAM v3 RNNT para `gigaam-v3-e2e-rnnt-int8` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 para `gigaam-v3-e2e-rnnt-int8`; sin cuantizacion declarada para los paquetes Whisper |
| Idiomas soportados | no disponible en la model card; Whisper large-v3 soporta multilingue por diseno del modelo original, GigaAM esta orientado al ruso segun su autor original (no confirmado en este repositorio) |
| Licencia | MIT |
| Formato de pesos | `.ainotemodel` (archivo propietario del runtime Sayfolio); tags indican CoreML y sherpa-onnx como backends |
| Tamano del repositorio | 1,1 GB |
| Verificacion de integridad | SHA-256 publicado por paquete |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Los paquetes incluidos corresponden a arquitecturas preexistentes:

- `whisper-large-v3-626`: pesos de Whisper large-v3 (OpenAI), encoder-decoder transformer con atencion completa, empaquetados para el runtime Sayfolio. Tamano del archivo: 467.241.919 bytes.
- `whisper-large-v3-turbo-632`: pesos de Whisper large-v3-turbo, variante con menor numero de capas en el decoder y por tanto menor coste de inferencia. Tamano del archivo: 477.748.855 bytes.
- `gigaam-v3-e2e-rnnt-int8`: pesos de GigaAM v3 en configuracion end-to-end RNNT (Recurrent Neural Network Transducer), cuantizados a int8. Tamano del archivo: 165.797.408 bytes.

No se documentan en la model card los datos de entrenamiento, el numero de tokens, ni procesos de RLHF/DPO, dado que el autor del repositorio no entrena los modelos. Cualquier detalle de entrenamiento debe consultarse en las model cards originales de OpenAI (Whisper) y del autor de GigaAM.

La innovacion tecnica del repositorio es el formato `.ainotemodel`: archivo inmutable con hash SHA-256 publicado, versionado semantico en el nombre (`1.1.0`, `1.0.0`) y compatibilidad declarada con CoreML y sherpa-onnx. Esto permite despliegues reproducibles y auditoria de integridad en aplicaciones de escritorio.

## Capacidades

- Reconocimiento automatico del habla (ASR) para los tres paquetes publicados.
- Transcripcion multilingue en los paquetes Whisper (segun las capacidades del modelo original).
- Transcripcion end-to-end en streaming o por lotes con el paquete GigaAM RNNT.
- Ejecucion en dispositivo mediante CoreML (Apple) y sherpa-onnx.
- Verificacion de integridad de los pesos mediante SHA-256 antes de la carga.
- No se declaran capacidades de traduccion, diarizacion, deteccion de idioma explicita, tool calling ni agentes.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones de escritorio: el paquete `whisper-large-v3-turbo-632` (477 MB) es adecuado para transcripcion de audio de usuario final con latencia moderada, empaquetado para CoreML en macOS.
- Dictado offline en entornos sin conectividad: los tres paquetes son archivos locales verificables, lo que permite su distribucion en aplicaciones que no pueden depender de APIs en la nube.
- Verificacion de integridad en pipelines de despliegue: el hash SHA-256 publicado por paquete permite comprobar la descarga en CI antes de empaquetar la aplicacion.
- Transcripcion de reuniones con Whisper large-v3: el paquete `whisper-large-v3-626` (467 MB) ofrece la calidad del modelo base completo para audio de mayor duracion, a costa de mayor coste computacional.
- ASR de bajo consumo en dispositivos con recursos limitados: `gigaam-v3-e2e-rnnt-int8` (165 MB) es el paquete mas pequeno y cuantizado a int8, adecuado para moviles o equipos sin GPU dedicada.
- Integracion con sherpa-onnx en aplicaciones multiplataforma: los tags del repositorio indican compatibilidad con este runtime, lo que permite desplegar los paquetes en Linux, Windows y Android.
- Archivado reproducible de modelos ASR para auditoria: el versionado semantico y los hashes permiten reconstruir exactamente que pesos se usaron en una version de la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Como referencia orientativa no verificada, Whisper large-v3 requiere aproximadamente 10 GB en fp16 y 5 GB en int8; Whisper large-v3-turbo aproximadamente 6 GB en fp16 y 3 GB en int8; GigaAM v3 RNNT int8 aproximadamente 0,2 GB. Estos valores no estan confirmados por el autor del repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tag CoreML sugiere ejecucion en Apple Silicon mediante Neural Engine o GPU integrada.
- Opciones de despliegue: runtime Sayfolio (formato `.ainotemodel`), CoreML y sherpa-onnx segun los tags del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `dvoineu/ainote-models` (este repo) | no disponible | no disponible | MIT | `.ainotemodel` | Empaquetado de Whisper large-v3, large-v3-turbo y GigaAM v3 int8 |
| Whisper large-v3 (openai/whisper-large-v3) | 1.550 M | 30 s por ventana | MIT | safetensors, PyTorch | Modelo original, sin empaquetado para runtime |
| Whisper large-v3-turbo (openai/whisper-large-v3-turbo) | 809 M | 30 s por ventana | MIT | safetensors, PyTorch | Variante con decoder reducido, menor latencia |
| GigaAM v3 (autor original) | no disponible | no disponible | no disponible | no disponible | Modelo ASR ruso, empaquetado aqui en variante RNNT int8 |

Los datos de parametros de Whisper corresponden a las model cards originales de OpenAI; no estan confirmados en este repositorio.

## Limitaciones y advertencias

- El repositorio no aporta pesos nuevos ni mejoras de arquitectura; es solo un empaquetado de modelos preexistentes.
- No se documentan los idiomas soportados ni el rendimiento por idioma en la model card.
- El formato `.ainotemodel` es propietario del runtime Sayfolio; su uso fuera de ese runtime no esta documentado.
- La licencia MIT se aplica al empaquetado, pero deben verificarse las licencias de los pesos originales (Whisper es MIT; la licencia de GigaAM v3 no se indica en este repositorio).
- El repositorio tiene 0 descargas y 0 likes en el momento de redaccion de esta ficha, lo que implica ausencia de validacion por parte de la comunidad.
- No se publican benchmarks, lo que impide comparar el rendimiento real de los paquetes con sus modelos originales.
- Riesgo de alucinacion y sesgos: no evaluado en este repositorio; debe consultarse la documentacion de Whisper y GigaAM.
- La fecha de creacion indicada (2026-11-15) es futura respecto a la fecha habitual de redaccion; conviene verificar la vigencia del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dvoineu/ainote-models
- Whisper large-v3 (modelo original): https://huggingface.co/openai/whisper-large-v3
- Whisper large-v3-turbo (modelo original): https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- CoreML (Apple): https://developer.apple.com/documentation/coreml
- GigaAM (modelo original, autor no confirmado en este repositorio): no disponible
