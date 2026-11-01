# axiotic/cliphoard-coreml-models

## Resumen

`axiotic/cliphoard-coreml-models` es un repositorio espejo de conversiones a Core ML de dos modelos de codigo abierto ya existentes, publicadas originalmente por el proyecto Cliphoard en su release `models-v1`. No se trata de un modelo base nuevo entrenado por Axiotic, sino de un archivo de artefactos binarios (paquetes `.mlpackage` junto con sus tokenizadores y manifiestos de conversion) destinados a la inferencia en dispositivo en plataformas Apple. El repositorio incluye `all-MiniLM-L6-v2` (encoder de frases de sentence-transformers) y `openvision-vit-tiny-patch8-224` (torres separadas de imagen y texto para embeddings multimodales).

La relevancia de este repositorio es practica: permite obtener conversiones Core ML ya compiladas y verificables por hash, evitando al desarrollador tener que reproducir el pipeline de `coremltools` desde los pesos originales. El tamaño del repositorio es de 0,1 GB y la licencia declarada es Apache 2.0, heredada de los modelos upstream. No se publican parametros totales, longitud de contexto en el sentido habitual de LLM ni resultados de benchmarks propios.

Es importante subrayar que el repositorio no contiene aplicacion ejecutable ni libreria nativa, y que el autor declara explicitamente que no aporta nueva validacion de inferencia ni benchmarks de calidad: la evidencia historica de paridad y rendimiento pertenece a Cliphoard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder MiniLM para texto; ViT tiny patch8 para vision, con torre de texto separada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | MiniLM: secuencia dinamica de 2 a 511 tokens; OpenVision Tiny: 80 tokens de contexto de texto |
| Tipos de cuantizacion | no disponible (la conversion MiniLM usa `input_ids` y `attention_mask` en INT32; no se documentan pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (ZIP con tokenizador y manifiesto incluidos) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Contiene conversiones de dos arquitecturas upstream. La primera es `all-MiniLM-L6-v2`, un encoder transformer de sentence-transformers que produce embeddings de frases de 384 dimensiones, normalizados L2, con `input_ids` y `attention_mask` en INT32, longitud de secuencia dinamica entre 2 y 511 y objetivo de despliegue macOS 13. La segunda es `openvision-vit-tiny-patch8-224`, un ViT tiny con parches de 8x8 y resolucion de 224 px, convertido en dos torres separadas (imagen y texto) que comparten un espacio de embedding conjunto de 192 dimensiones, con tokenizador WordPiece, contexto de 80 tokens, normalizacion L2 y un ajuste de media de texto registrado en el manifiesto.

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO, ya que esos datos pertenecen a las fichas de los modelos upstream y no se reproducen en este repositorio. La innovacion tecnica del artefacto es la conversion a Core ML y la trazabilidad: `ARTIFACTS.json` registra identificadores de archivo originales, hashes, tamanos e inventario de miembros, lo que permite verificar la integridad del ZIP antes de la extraccion y compilacion local. El autor advierte que las revisiones actuales del repositorio upstream usadas para inspeccionar licencias no se afirman como la revision de pesos de la conversion original.

## Capacidades

- Generacion de embeddings de texto de 384 dimensiones mediante MiniLM, con salida normalizada L2 y longitud de secuencia dinamica.
- Generacion de embeddings de imagen y de texto en un espacio conjunto de 192 dimensiones mediante OpenVision Tiny, util para busqueda y recuperacion multimodal.
- Procesamiento de imagen a 224 px con preprocesamiento documentado en el manifiesto de conversion.
- Tokenizacion incluida: tokenizador de sentence-transformers para MiniLM y WordPiece para OpenVision Tiny.
- Ejecucion en dispositivo (on-device) en plataformas Apple mediante Core ML.
- Verificacion de integridad por SHA256 de los ZIP y compilacion local de los `.mlpackage`.
- No se documentan capacidades de generacion de texto libre, razonamiento, codigo, matematicas, tool calling, agentes, thinking mode, audio ni dialogo multi-turno.

## Casos de uso

- Busqueda semantica local en aplicaciones macOS: MiniLM genera embeddings de 384 dimensiones en el dispositivo, lo que permite indexar y consultar documentos sin enviar texto a un servidor.
- Agrupacion y deduplicacion de textos: los embeddings normalizados L2 de MiniLM son adecuados para calcular similitud coseno y agrupar documentos o entradas de un corpus.
- Clasificacion de texto por similitud: comparar la embedding de una consulta con prototipos precalculados para enrutar tickets o etiquetar contenido.
- Busqueda de imagenes por texto en apps de fototeca: las dos torres de OpenVision Tiny comparten un espacio de 192 dimensiones, lo que permite indexar imagenes de 224 px y consultarlas con descripciones textuales de hasta 80 tokens.
- Filtrado y moderacion visual on-device: calcular similitud entre imagenes y descripciones canonicas para marcar contenido sin salir del dispositivo.
- Funciones de recomendacion y similitud en apps de notas o marcadores: combinar embeddings de texto y de imagen para sugerir elementos relacionados.
- Prototipado de pipelines de recuperacion aumentada en Apple Silicon: usar los paquetes Core ML como componente de recuperacion previo a un LLM ejecutado localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este espejo no introduce una nueva conversion ni un nuevo benchmark de calidad, y que la evidencia historica de paridad y rendimiento pertenece a Cliphoard.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser Core ML y modelos de pequeno tamano (repositorio de 0,1 GB), se orientan a memoria unificada de Apple Silicon y a CPU/GPU/Neural Engine del sistema.
- GPU recomendadas: no se documentan. El destino declarado es macOS 13 o superior; el rendimiento depende del chip Apple (serie M) y del Neural Engine disponible.
- Cabe en GPU de consumo: si, en el ecosistema Apple Silicon; no se aportan datos para GPU NVIDIA o AMD.
- Opciones de despliegue: Core ML mediante `coremltools` y compilacion local de los `.mlpackage`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| axiotic/cliphoard-coreml-models (MiniLM) | no disponible | 2-511 tokens | embedding 384 d | Apache 2.0 | Core ML |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible | hasta 512 tokens (tipico en la familia) | embedding 384 d | Apache 2.0 | safetensors / PyTorch |
| UCSC-VLAA/openvision-vit-tiny-patch8-224 | no disponible | 80 tokens de texto | embedding conjunto 192 d | Apache 2.0 | PyTorch |
| Alternativas Core ML de embeddings de texto | no disponible | no disponible | no disponible | no disponible | Core ML |

La comparativa se limita a los upstream declarados, ya que no se dispone de datos de rendimiento ni de parametros en la informacion proporcionada. La diferencia practica frente a los originales es el formato: Core ML para despliegue en Apple frente a pesos PyTorch/safetensors.

## Limitaciones y advertencias

- No es un modelo nuevo: son conversiones de modelos upstream; cualquier sesgo de `all-MiniLM-L6-v2` u `openvision-vit-tiny-patch8-224` se hereda sin cambios.
- Riesgo de alucinacion no aplica a generacion de texto libre, pero si existe riesgo de falsos positivos en similitud semantica y recuperacion.
- Limitaciones de contexto: MiniLM admite secuencias de 2 a 511 tokens; OpenVision Tiny limita el texto a 80 tokens y la imagen a 224 px.
- Idiomas soportados: no disponibles en la informacion proporcionada; conviene verificar la cobertura linguistica en la ficha de `all-MiniLM-L6-v2`.
- Restricciones de licencia: los datos del modelo se suministran bajo Apache 2.0, pero la licencia del runtime y de la libreria de la aplicacion es independiente y debe evaluarse por separado.
- El repositorio no incluye aplicacion ejecutable ni libreria nativa; el desarrollador debe compilar los `.mlpackage` localmente.
- El autor no reclama validacion de inferencia nueva, revision exhaustiva de privacidad ni compatibilidad mas alla del contrato de conversion original.
- Las revisiones upstream actuales usadas para inspeccionar licencias no se afirman como la revision de pesos de la conversion original; conviene verificar hashes en `ARTIFACTS.json`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria documentada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/axiotic/cliphoard-coreml-models
- Upstream MiniLM: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Upstream OpenVision Tiny: https://huggingface.co/UCSC-VLAA/openvision-vit-tiny-patch8-224
- Release original de Cliphoard `models-v1`: https://github.com/AntreasAntoniou/cliphoard/releases/tag/models-v1
- Repositorio Cliphoard (referencia del proyecto): https://github.com/AntreasAntoniou/cliphoard
