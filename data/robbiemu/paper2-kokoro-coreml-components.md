# robbiemu/paper2-kokoro-coreml-components

## Resumen

robbiemu/paper2-kokoro-coreml-components es un repositorio de componentes Core ML derivados de hexgrad/Kokoro-82M, un modelo de sintesis de voz (text-to-speech). No se trata de un modelo TTS completo, sino de una conversion a Core ML de piezas seleccionadas del pipeline: dos cabezas de prediccion de duracion (FP32 y FP16) y dos paquetes de decoder con alineacion fija de 115 frames (un componente de condicionamiento y un generador tipo vocoder). El checkpoint de origen esta fijado a la revision f3ff3571791e39611d31c381e3a41a3af07b4987.

La relevancia del repositorio es de ingenieria mas que de modelado: permite ejecutar componentes concretos de un TTS sobre Apple Silicon mediante Core ML, comparar politicas de precision (FP32 frente a FP16) en las cabezas de duracion y reproducir una composicion de onda concreta. El autor declara explicitamente que no se reclama ningun entrenamiento nuevo de modelo de voz: la conversion y la replica reutilizan entradas y salidas retenidas del modelo original.

El alcance es limitado y asi lo documenta la propia model card: solo ingles, validacion sobre 24 peticiones seleccionadas para las comparaciones de duracion y una unica entrada fija para la composicion de onda. La orquestacion en el host (alineacion, construccion de pitch/ruido y reconstruccion de la forma de onda) queda fuera de los paquetes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Componentes Core ML de un pipeline TTS (cabezas de prediccion de duracion, componente de condicionamiento y generador de magnitud/fase) derivados de hexgrad/Kokoro-82M; el autor no detalla la arquitectura interna de cada modulo |
| Parametros totales | no disponible (los 4 paquetes suman 102,08 MiB; el autor advierte que estos tamanos no equivalen a un recuento combinado de parametros. El modelo base Kokoro-82M tiene 82 M de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS); los paquetes de condicionamiento y generador usan una alineacion fija de 115 frames |
| Tipos de cuantizacion | FP32 y FP16 en las cabezas de duracion; el resto son paquetes Core ML con E/S FLOAT32. Los dtypes de entrada/salida no especifican la precision interna de calculo ni de los pesos |
| Idiomas soportados | Ingles (en) unicamente; el autor indica que la publicacion no establece compatibilidad multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquetes Core ML (.mlpackage); no contiene pesos Safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Se describe como una conversion a Core ML de componentes seleccionados de duracion y decoder del modelo upstream hexgrad/Kokoro-82M, con alternativas de precision y de disposicion de grafo. La interfaz documentada es la siguiente: las cabezas de duracion reciben estados del predictor con forma [1,128,512]; los paquetes de condicionamiento y generador trabajan con una alineacion fija de 115 frames, y el generador devuelve arrays de magnitud y fase (4-D) en lugar de una forma de onda.

La conversion se realizo con Core ML Tools en version 9.0. Los detalles exactos de version de especificacion, fechas de conversion, versiones del framework de origen y dtypes de E/S se conservan en coreml_specs.json, mientras que manifest.json registra tamanos, hashes SHA-256 y rutas de procedencia. El autor advierte que la compatibilidad entre versiones de runtime no se ha vuelto a probar. No se documenta dataset de entrenamiento, numero de tokens, ni fases de RLHF/DPO: el conjunto de evidencias es privado y se enlaza solo como registro de experimentos, no como dataset de entrenamiento.

## Capacidades

- Prediccion de duracion: las cabezas duration-fp32 y duration-fp16 aceptan estados de predictor [1,128,512] y devuelven predicciones de duracion.
- Condicionamiento de decoder: el paquete conditioning-115frames genera el sufijo de condicionamiento con alineacion fija de 115 frames.
- Generacion vocoder: el paquete generator-115frames produce arrays de magnitud y fase para una entrada de 115 frames, que el host debe convertir en forma de onda.
- Comparacion de precision: ofrece variantes FP32 y FP16 de las cabezas de duracion para estudios de compromiso entre tamano y fidelidad.
- Ejecucion en Apple Silicon: los paquetes estan pensados para el runtime Core ML de macOS, con seleccion explicita de unidades de calculo (por ejemplo CPU_ONLY).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: el alcance retenido es solo ingles.
- No incluye vision, audio de entrada ni modos de pensamiento.
- No es un pipeline TTS autonomo: requiere orquestacion externa para alineacion, construccion de pitch/ruido y reconstruccion de la onda.

## Casos de uso

- Integracion de TTS en apps nativas de Apple: los paquetes Core ML pueden cargarse desde una app macOS o iOS con Core ML Tools 9.0 para ejecutar la prediccion de duracion y el decoder en el dispositivo, siempre que el desarrollador implemente la orquestacion en el host.
- Reduccion de huella mediante FP16: sustituir la cabeza de duracion FP32 (105.017 B) por la FP16 (54.382 B) permite comparar el impacto en calidad y tamano antes de fijar una politica de precision en produccion.
- Estudio de conversiones Core ML: sirve como referencia reproducible de como se convierte un decoder TTS a Core ML, incluyendo alternativas de disposicion de grafo y metadatos de especificacion.
- Vocoder reutilizable en pipelines propios: el generador de 115 frames (37,78 MiB) puede emplearse como etapa de sintesis de magnitud/fase dentro de un pipeline TTScustom, con la reconstruccion de onda a cargo del host.
- Verificacion de integridad de artefactos: el script restore.py --verify y manifest.json permiten validar hashes SHA-256 y tamanos en un pipeline de CI antes de desplegar los paquetes.
- Reproduccion de experimentos de duracion: los resultados declarados sobre 24 peticiones seleccionadas pueden reejecutarse para auditar la politica de duracion FP32 frente a FP16 en hardware Apple Silicon.
- Investigacion sobre TTS en el borde: medir latencia y consumo en Apple Silicon con los componentes convertidos, aislando el coste del decoder del resto del pipeline.
- Base para portar Kokoro-82M a Core ML: estos componentes pueden servir de punto de partida para completar una conversion integral del modelo upstream, aunque el repositorio no la incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor solo documenta un alcance de validacion: las comparaciones de duracion cubren 24 peticiones seleccionadas y la composicion de onda aceptada se limita a una entrada fija, con replica en hardware separada. La propia model card indica que esto no constituye una evaluacion general de calidad texto-a-audio.

## Requisitos de hardware

- Entorno de ejecucion: runtime Core ML de macOS compatible; la ruta de carga documentada en Python requiere coremltools 9.0.
- Acelerador objetivo: Apple Silicon (GPU/ANE via Core ML); el ejemplo de carga usa ComputeUnit.CPU_ONLY de forma explicita.
- Tamano en disco de los paquetes: 102,08 MiB en total, distribuidos en duration-fp32 (105.017 B), duration-fp16 (54.382 B), conditioning-115frames (64,15 MiB) y generator-115frames (37,78 MiB).
- Memoria estimada: no disponible como cifra de VRAM; el author no publica mediciones de memoria residente.
- GPU compatibles: no disponible para GPU NVIDIA o AMD; el objetivo declarado es Core ML sobre Apple Silicon.
- Consumer GPU: no aplica en el sentido habitual; el despliegue previsto es en hardware Apple, no en GPU de escritorio.
- Opciones de despliegue: coremltools mas huggingface_hub.snapshot_download para la carga; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; no se publican mediciones de rendimiento en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| robbiemu/paper2-kokoro-coreml-components | Componentes Core ML de un TTS | no disponible (4 paquetes, 102,08 MiB) | no aplica; alineacion fija de 115 frames | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento del registro | Solo componentes; requiere orquestacion en el host |
| hexgrad/Kokoro-82M | Modelo TTS completo (upstream) | 82 M | no aplica | Apache 2.0 (segun la informacion del repositorio derivado) | HuggingFace | Modelo de origen del que se derivan estos componentes; publicado en formato de framework original, no Core ML |
| Otros componentes Core ML para TTS | no disponible | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo TTS completo: faltan la alineacion, la construccion de pitch y ruido y la reconstruccion de la forma de onda, que quedan en el host.
- Alcance de idioma restringido al ingles; no se establece compatibilidad multilingue.
- Alineacion fija de 115 frames en condicionamiento y generador, lo que limita la longitud y flexibilidad de las entradas.
- Validacion muy estrecha: 24 peticiones para duracion y una unica entrada fija para la composicion de onda; no hay evaluacion general de calidad.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de artefactos acusticos al recomponer la onda fuera de los paquetes.
- Sesgos: no disponible; el autor no documenta analisis de sesgos en los datos retenidos.
- Sin pesos Safetensors: el panel automatico del Hub no aplica y la inspeccion de tensores debe hacerse con file_details.json.
- Compatibilidad entre versiones de runtime Core ML no reprobada; la carga depende de la version de coremltools y de macOS.
- La fecha de creacion y actualizacion registrada es 2026-09-19, posterior a la ventana habitual de publicaciones, dato que conviene verificar en el Hub.
- Licencia Apache 2.0: permite uso comercial con atribucion, pero el autor no ofrece garantias sobre idoneidad para produccion.
- Adopcion nula registrada (0 descargas, 0 likes), por lo que no hay evidencia de uso en produccion ni soporte de la comunidad.
- El conjunto de evidencias es privado y no esta etiquetado como dataset de entrenamiento; no debe interpretarse como datos de entrenamiento reutilizables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robbiemu/paper2-kokoro-coreml-components
- Modelo upstream: https://huggingface.co/hexgrad/Kokoro-82M/tree/f3ff3571791e39611d31c381e3a41a3af07b4987
- Cabezas de duracion: https://huggingface.co/robbiemu/paper2-kokoro-coreml-components/tree/main/models/duration-fp32.mlpackage y https://huggingface.co/robbiemu/paper2-kokoro-coreml-components/tree/main/models/duration-fp16.mlpackage
- Componentes de decoder: https://huggingface.co/robbiemu/paper2-kokoro-coreml-components/tree/main/models/conditioning-115frames.mlpackage y https://huggingface.co/robbiemu/paper2-kokoro-coreml-components/tree/main/models/generator-115frames.mlpackage
- Detalle de archivos: FILE_DETAILS.md y file_details.json (en la raiz del repositorio)
- Metadatos y verificacion: coreml_specs.json, manifest.json, release_metadata.json y restore.py --verify (en la raiz del repositorio)
- Documentacion sobre el analizador de metadatos de Safetensors: https://huggingface.co/docs/safetensors/metadata_parsing
- No se encontraron enlaces relevantes adicionales en la busqueda web proporcionada (los resultados devueltos correspondian a paginas de ayuda de Chrome Web Store, sin relacion con el modelo).
