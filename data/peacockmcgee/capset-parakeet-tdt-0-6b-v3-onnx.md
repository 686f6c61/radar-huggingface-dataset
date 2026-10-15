# PeacockMcGee/capset-parakeet-tdt-0.6b-v3-onnx

## Resumen

PeacockMcGee/capset-parakeet-tdt-0.6b-v3-onnx es una copia sin modificaciones del repositorio istupakov/parakeet-tdt-0.6b-v3-onnx, que a su vez es una exportacion a ONNX del modelo nvidia/parakeet-tdt-0.6b-v3 de NVIDIA. Se trata de un modelo de reconocimiento automatico del habla (ASR) multilingue de 600 millones de parametros, disenado para transcripcion de voz a texto de alto rendimiento. El autor de esta copia (PeacockMcGee) la mantiene para que el panel de subtitulos Capset de After Effects descargue desde una fuente inmutable, fijada al commit 8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce.

La relevancia de esta ficha no esta en el modelo en si, sino en el formato: la exportacion a ONNX permite ejecutar el modelo con ONNX Runtime tanto en CPU como en GPU, sin depender del stack de NeMo/PyTorch. Segun la documentacion del proyecto de referencia, esta implementacion alcanza velocidades de tiempo real en CPU, superando a openai/whisper y compitiendo con implementaciones aceleradas por GPU de faster-whisper.

Arquitectura: NeMo Conformer TDT (Token-and-Duration Transducer). El modelo base v3 amplia el soporte de idiomas respecto a v2 (solo ingles) hasta 25 idiomas europeos, con deteccion automatica del idioma, puntuacion nativa, capitalizacion y prediccion precisa de marcas de tiempo a nivel de palabra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (Token-and-Duration Transducer) |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ficheros `*.int8.onnx`), sin cuantizar (FP32) |
| Idiomas soportados | 25 idiomas europeos con deteccion automatica del idioma (lista concreta no disponible) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.onnx` + `encoder-model.onnx.data`, `encoder-model.int8.onnx`, `decoder_joint-model.onnx`, `decoder_joint-model.int8.onnx`, `vocab.txt`, `config.json`) |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR basado en la arquitectura Conformer con decodificacion TDT (Token-and-Duration Transducer). La familia Parakeet TDT se caracteriza por predecir de forma conjunta el token y su duracion, lo que permite una decodificacion mas eficiente y precisa que los esquemas transducer clasicos. Los dos componentes exportados a ONNX son el encoder (Conformer) y el decoder joint (transducer), con variantes en FP32 e int8. El fichero `encoder-model.onnx.data` (2.435.420.160 bytes) contiene los pesos del encoder en formato de datos externos, mientras que `encoder-model.onnx` (41.770.866 bytes) es el grafo.

No hay informacion disponible en los materiales proporcionados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO o ajuste por instrucciones. Tampoco se detalla el mecanismo interno del encoder Conformer mas alla de su clasificacion como tal. La innovacion practica destacable de esta version es el soporte de 25 idiomas europeos con deteccion automatica del idioma, ademas de puntuacion, capitalizacion y marcas de tiempo a nivel de palabra integradas.

## Capacidades

- Reconocimiento automatico del habla (voz a texto) multilingue.
- Deteccion automatica del idioma de entrada.
- Puntuacion y capitalizacion nativas en la transcripcion.
- Prediccion precisa de marcas de tiempo a nivel de palabra.
- Inferencia acelerada mediante exportacion ONNX (CPU y GPU).
- Soporte de cuantizacion int8 para reducir el uso de memoria y aumentar el throughput.
- Diseñado para transcripcion de alto rendimiento (alto throughput).

No se documenta en la informacion disponible soporte de tool calling, capacidades de agente, razonamiento multi-paso, vision, audio generativo ni modos de pensamiento (thinking). Es un modelo especifico de ASR.

## Casos de uso

- Subtitulado automatico en produccion de video: el panel Capset de After Effects usa esta copia fija para generar subtitulos sobre la linea de tiempo, aprovechando la puntuacion, capitalizacion y marcas de tiempo por palabra para sincronizar el texto con el audio.
- Transcripcion de reuniones y notas de voz: el modelo convierte grabaciones multi-idioma en texto con marcas temporales, util para generar actas o indices navegables.
- Generacion de subtitulos para plataformas de video: la exportacion ONNX permite incrustar la transcripcion en pipelines existentes sin depender de PyTorch, lo que simplifica el despliegue.
- Indexado y busqueda de contenido audiovisual: las marcas de tiempo a nivel de palabra facilitan la busqueda por fragmentos y la generacion de capitulos o segmentos.
- Accesibilidad: transcripcion en tiempo real o por lotes de contenido hablado para personas con discapacidad auditiva, con soporte de varios idiomas europeos.
- Automatizacion de flujos de trabajo con ONNX Runtime: dado que se ejecuta en CPU con velocidad de tiempo real, es adecuado para servidores sin GPU o entornos de borde (edge) que necesitan transcripcion local.
- Preprocesado para pipelines de NLP: transcripcion previa a tareas posteriores de analisis de texto, resumen o traduccion, con marcas de tiempo que permiten alinear audio y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Se menciona de forma cualitativa que, en la implementacion de ONNX Runtime descrita en el repositorio parakeet-server, el modelo alcanza velocidades de tiempo real en CPU, superando a openai/whisper y compitiendo con faster-whisper acelerado por GPU. No se proporcionan cifras concretas de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia en FP32: en torno a 2,5 GB (el fichero de datos del encoder pesa 2.435.420.160 bytes mas el grafo y el decoder), mas overhead del runtime.
- Memoria estimada en int8: el encoder int8 pesa 652.183.999 bytes y el decoder joint int8 18.202.004 bytes, por lo que el modelo cuantizado ocupa del orden de 650-700 MB.
- CPU: el modelo esta disenado para ejecutarse en CPU con ONNX Runtime a velocidades de tiempo real, por lo que no requiere GPU.
- GPU: no se listan modelos concretos en la informacion disponible; al ser ONNX, puede desplegarse en GPU compatibles con ONNX Runtime (por ejemplo, series NVIDIA con CUDA), pero no se confirman modelos especificos.
- GPU de consumo: no disponible de forma explicita, aunque por tamano (sub-3 GB en FP32) cabria en practicamente cualquier GPU de consumo moderna con suficiente memoria.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), tal como se describe en el repositorio parakeet-server. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR transducer).
- Latencia y throughput: se indica velocidad de tiempo real en CPU, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PeacockMcGee/capset-parakeet-tdt-0.6b-v3-onnx (este) | 600 M | 25 idiomas europeos | no disponible | CC-BY-4.0 | ONNX (FP32 e int8) | Copia fija de la exportacion ONNX de NVIDIA Parakeet TDT 0.6B v3 |
| nvidia/parakeet-tdt-0.6b-v3 | 600 M | 25 idiomas europeos | no disponible | no disponible en los materiales | pesos NeMo (no confirmado) | Modelo original de NVIDIA |
| nvidia/parakeet-tdt-0.6b-v2 | 600 M | Ingles | no disponible | no disponible en los materiales | no disponible | Variante anterior, solo ingles |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 600 M | 25 idiomas europeos | no disponible | CC-BY-4.0 | ONNX | Exportacion ONNX de origen de la que esta ficha es copia |

No se dispone de datos de rendimiento (WER, latencia) para establecer una comparacion cuantitativa con alternativas como Whisper; solo se menciona cualitativamente que supera a openai/whisper en CPU.

## Limitaciones y advertencias

- Es una copia sin modificaciones de otra exportacion ONNX: cualquier mejora o correccion debe aplicarse en el repositorio de origen (istupakov) o en el modelo base de NVIDIA.
- No se han publicado benchmarks en los materiales disponibles, por lo que el rendimiento real en cada idioma o dominio no esta cuantificado.
- La lista concreta de los 25 idiomas europeos soportados no se detalla en la informacion proporcionada.
- Al ser un modelo ASR, puede tener un rendimiento inferior en audio con ruido, acentos no representados en el entrenamiento, solapamiento de hablantes o audio de baja calidad.
- Riesgo de errores de transcripcion (sustituciones, omisiones) y de deteccion erronea del idioma en fragmentos cortos o mezclados.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y a la cadena de modelos base (NVIDIA, istupakov); hay que conservar los avisos de licencia.
- El fichero `encoder-model.onnx.data` (2,4 GB) debe distribuirse junto al grafo ONNX; el despliegue debe gestionar correctamente los datos externos.
- No se documenta soporte de tool calling, agentes ni otras capacidades generativas; no debe emplearse para tareas distintas de la transcripcion.
- La fecha de creacion del repositorio (2026-10-15) no aporta informacion tecnica; no implica caracteristicas adicionales.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/PeacockMcGee/capset-parakeet-tdt-0.6b-v3-onnx
- Exportacion ONNX de origen: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio de referencia con ONNX Runtime: https://github.com/dustinwloring1988/parakeet-server
- Coleccion Parakeet TDT 0.6B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- NVIDIA NIM (Parakeet TDT 0.6B v2): https://build.nvidia.com/nvidia/parakeet-tdt-0_6b-v2
- Otra copia ONNX: https://huggingface.co/PalatineVision/parakeet-tdt-0.6b-v3-onnx
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
