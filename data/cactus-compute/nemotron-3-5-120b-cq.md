# Cactus-Compute/nemotron-3.5-120b-cq

## Resumen

Nemotron-3.5-120b-cq es una cuantizacion de 8 bits del modelo multimodal NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, publicada por Cactus-Compute bajo el identificador `Cactus-Compute/nemotron-3.5-120b-cq`. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con componentes Mamba (arquitectura `nemotron_h`), disenado por NVIDIA para tareas conversacionales multimodales que combinan texto e imagen: generacion de texto, respuesta a preguntas visuales, respuesta a preguntas sobre documentos y OCR. Esta version concreta redistribuye los pesos en formato MLX y safetensors, orientada a inferencia eficiente en hardware Apple Silicon.

El modelo resuelve el problema de desplegar un modelo multimodal de gran escala (120B parametros totales, 12B activos por token segun la nomenclatura A12B) en entornos con memoria unificada limitada, gracias a la cuantizacion de 8 bits que reduce el repositorio a 22,1 GB. Su relevancia actual radica en que combina tres tendencias: arquitecturas hibridas MoE-Mamba para eficiencia en contexto largo, capacidades de vision integradas para documentos y OCR, y un ecosistema de cuantizacion (Cactus, MLX) que facilita el despliegue local.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face; no se ha publicado informacion detallada sobre el proceso de entrenamiento, benchmarks o configuracion exacta de la cuantizacion en la informacion proporcionada. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con Mamba (`nemotron_h`, `nemotron_h_omni`) |
| Parametros totales | 22.029.082.117 (pesos cuantizados a 8 bits); modelo base: 120B (A12B activos) |
| Parametros activos | 12B (segun nomenclatura A12B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (CQ, cuantizacion Cactus) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (el campo `license` del repo indica `other`; acceso gated) |
| Formato de pesos | safetensors, MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 emplea una arquitectura hibrida denominada `nemotron_h` / `nemotron_h_omni`, que combina capas de atencion con capas Mamba (modelos de espacio de estados) y un esquema Mixture-of-Experts con 120B parametros totales y 12B activos por token. Esta combinacion busca reducir el coste computacional en inferencia manteniendo capacidad de modelado, especialmente en secuencias largas, y anade una torre de vision para el procesamiento de imagenes y documentos (pipeline `image-text-to-text`, tareas de VQA, document QA y OCR).

Los datos de entrenamiento referenciados en los metadatos son `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`, lo que sugiere un pipeline de preentrenamiento seguido de post-entrenamiento (posiblemente con RLHF/DPO, aunque no se detalla en la informacion disponible). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni las tecnicas de alineacion. La version `cq` de Cactus-Compute aplica cuantizacion de 8 bits sobre los pesos BF16 originales para su uso con MLX; no se documentan en la informacion proporcionada detalles sobre el algoritmo de cuantizacion, calibracion o perdida de precision.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas (ingles, espanol, frances, aleman, italiano y japones).
- Comprension de imagenes: respuesta a preguntas visuales (VQA) sobre fotografias y escenas.
- Comprension de documentos: respuesta a preguntas sobre documentos escaneados o digitales (document-question-answering).
- OCR: extraccion de texto a partir de imagenes.
- Razonamiento multimodal texto-imagen (pipeline `image-text-to-text`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles (el modelo es texto e imagen).

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo puede recibir la imagen de un documento y extraer campos estructurados mediante OCR y document QA, reduciendo la necesidad de pipelines OCR separados y reglas heuristicas.
- Atencion al cliente con soporte visual: un agente conversacional puede recibir capturas de pantalla o fotos del producto del usuario y responder preguntas multi-turno en espanol, frances, aleman, italiano o japones, aprovechando la naturaleza multimodal del modelo.
- Analisis de documentos legales o contractuales: dado que soporta document-question-answering, permite consultar clausulas concretas de un PDF escaneado formulando preguntas en lenguaje natural, util en departamentos juridicos y de compliance.
- Accesibilidad: descripcion de imagenes y lectura de documentos para usuarios con discapacidad visual, combinando OCR y generacion de texto en varios idiomas.
- Procesamiento de formularios en back-office: extraccion y validacion de datos de formularios escaneados en flujos de banca, seguros o administracion publica, con la ventaja de ejecucion local en hardware Apple Silicon gracias al formato MLX.
- Asistente de investigacion multimodal: resumen y respuesta a preguntas sobre figuras, tablas y graficos de articulos cientificos, usando la ventana de contexto del modelo base (longitud no confirmada en esta ficha).
- Traduccion asistida por imagen: traduccion de carteles, menus o interfaces capturadas como imagen a los seis idiomas soportados, combinando OCR y generacion multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 22,1 GB en 8 bits; se requiere al menos esa cantidad de memoria unificada o VRAM, mas overhead de ejecucion (KV cache y buffers), por lo que se recomienda un minimo practico de 24-32 GB.
- GPU recomendadas: no disponible de forma especifica; al estar en formato MLX, el objetivo principal es Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 32 GB o superior). Para GPUs NVIDIA no se documenta soporte directo en esta version.
- Cabe en consumer GPU: en el ecosistema Apple, si en equipos con 32 GB o mas de memoria unificada; en GPUs consumer NVIDIA no se confirma compatibilidad con este formato.
- Opciones de despliegue: MLX (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cactus-Compute/nemotron-3.5-120b-cq | 120B totales / 12B activos (22B en 8-bit) | no disponible | openmdw-1.1 (gated) | safetensors, MLX | Cuantizacion 8-bit para Apple Silicon |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | 120B totales / 12B activos | no disponible | no disponible | BF16 | Modelo base original de NVIDIA |
| Alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos alternativos de la misma categoria en terminos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Licencia: el campo `license` del repositorio indica `other` y la licencia declarada es openmdw-1.1; es imprescindible revisar los terminos exactos antes de un uso comercial, especialmente por las condiciones heredadas del modelo base de NVIDIA.
- Perdida de precision: al ser una cuantizacion de 8 bits, puede haber degradacion en tareas sensibles a la precision numerica (OCR fino, matematicas, razonamiento complejo) respecto al modelo BF16 original; no se documenta la magnitud de esta perdida.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en OCR de documentos de baja calidad o en preguntas sobre imagenes ambiguas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los sesgos del modelo base pueden persistir o amplificarse tras la cuantizacion.
- Idiomas: solo se declaran seis idiomas (en, es, fr, de, it, ja); el rendimiento en otros idiomas no esta garantizado.
- Contexto: la longitud de contexto no se especifica en esta ficha; debe consultarse la documentacion del modelo base antes de disenar flujos con documentos largos.
- Compatibilidad: el formato MLX limita el despliegue a entornos Apple; para infraestructura NVIDIA o servidores x86 conviene usar el modelo base original.
- Produccion: no hay benchmarks publicados en esta informacion, por lo que se recomienda una evaluacion propia antes de desplegar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Cactus-Compute/nemotron-3.5-120b-cq
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Libreria MLX: https://github.com/ml-explore/mlx
- Cactus Compute: https://github.com/cactus-compute
