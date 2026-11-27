# kongtong/lingshu-paddleocr-vl-1.6-bf16

## Resumen

Lingshu PaddleOCR-VL 1.6 BF16 (identificador `kongtong/lingshu-paddleocr-vl-1.6-bf16`) es una conversion a formato MLX y precision bf16 del modelo PaddleOCR-VL 1.6 de PaddlePaddle, publicada por el usuario kongtong. Se trata de un modelo de vision-lenguaje especializado en extraccion de texto y analisis de documentos: reconocimiento optico de caracteres (OCR), analisis de maquetacion (layout), tablas, formulas, graficos y sellos. El repositorio esta etiquetado con ERNIE4.5, lo que sugiere que el componente linguistico subyacente deriva de la familia ERNIE 4.5, aunque la model card no detalla la arquitectura interna.

La relevancia de esta publicacion es doble. Por un lado, traslada un modelo de OCR documental de PaddlePaddle al ecosistema MLX, lo que permite ejecutarlo de forma nativa en hardware Apple Silicon (chips M-series) con el framework de Apple. Por otro, al ofrecerse en bf16 y con licencia Apache 2.0, se posiciona como una alternativa ligera y permisiva frente a soluciones OCR propietarias o a modelos de vision-lenguaje de mayor tamano.

El repositorio ocupa aproximadamente 0,6 GB, lo que indica un modelo compacto, adecuado para inferencia en equipos de consumo mas que para despliegues en centros de datos. La informacion disponible en la model card es muy escasa: no se detallan parametros, contexto, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como ERNIE4.5; modelo vision-lenguaje de tipo image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta publicacion); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna. Las etiquetas indican que el modelo base es PaddleOCR-VL-1.6 de PaddlePaddle y que el componente linguistico se asocia a ERNIE4.5, pero no se especifica si se trata de un transformer denso, un modelo con atencion lineal, una variante MoE ni como se integra el codificador visual con el decodificador de texto. Tampoco se documenta el numero de parametros ni la ventana de contexto.

En cuanto al entrenamiento, no hay informacion sobre el volumen de tokens, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa. Esta publicacion concreta es una conversion de pesos a MLX en bf16 del modelo original, no un reentrenamiento: el autor declara `base_model: PaddlePaddle/PaddleOCR-VL-1.6` con relacion de finetune, pero no detalla que ajuste se aplico. Cualquier dato sobre el proceso de entrenamiento original debe consultarse en la model card del modelo base.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, segun las etiquetas `ocr` e `image-to-text`.
- Analisis de maquetacion documental (`layout`): identificacion de bloques, secciones y estructura de la pagina.
- Extraccion de tablas (`table`) y de formulas matematicas (`formula`).
- Interpretacion de graficos (`chart`) y deteccion de sellos (`seal`).
- Localizacion de texto en la imagen (`spotting`), es decir, deteccion de regiones con texto.
- Conversion imagen-a-texto en formato conversacional (`image-text-to-text`, `conversational`).
- Soporte multilingue declarado, con enfasis en ingles y chino.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede extraer texto y estructura de tablas de documentos escaneados, lo que permite alimentar sistemas de contabilidad con datos estructurados sin introduccion manual.
- Procesamiento de articulos cientificos: la capacidad de reconocer formulas y graficos facilita la conversion de PDF academicos a texto estructurado para su indexacion en repositorios de investigacion.
- Gestion documental empresarial: el analisis de layout permite clasificar y segmentar contratos, informes y expedientes, separando encabezados, cuerpo y anexos.
- Verificacion de documentos oficiales: la deteccion de sellos (`seal`) resulta util en procesos de validacion de certificados, escrituras o documentos notariales.
- Extraccion de datos de formularios: el modelo puede leer campos manuscritos o impresos en formularios administrativos y devolver el contenido como texto para su volcado en bases de datos.
- Prototipado en Mac: al estar en formato MLX, permite desarrollar y probar pipelines de OCR documental directamente en un Mac con Apple Silicon, sin depender de GPU dedicadas ni de servicios en la nube.
- Accesibilidad: conversion de imagenes de documentos a texto legible para lectores de pantalla y sistemas de sintesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,6 GB en bf16, por lo que el modelo completo en memoria ronda ese orden de magnitud, mas el overhead del runtime MLX y del codificador visual.
- GPU recomendadas: al ser un modelo MLX, el hardware objetivo son los chips Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en esta publicacion concreta.
- Compatibilidad con GPU de consumo: por su tamano reducido (0,6 GB), deberia caber con holgura en cualquier Mac con Apple Silicon, incluidos los modelos con 8 GB de memoria unificada.
- Opciones de despliegue: MLX (libreria declarada). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en esta publicacion. Para otros entornos habria que recurrir al modelo base de PaddlePaddle.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Entorno |
|---|---|---|---|---|---|
| Lingshu PaddleOCR-VL 1.6 BF16 | no disponible | no disponible | Apache 2.0 | safetensors (MLX) | Apple Silicon |
| PaddleOCR-VL-1.6 (base) | no disponible | no disponible | Apache 2.0 | no disponible | PaddlePaddle |
| Alternativas OCR-VL de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no permite establecer una comparativa cuantitativa con otros modelos de OCR documental. El unico punto de referencia claro es el modelo base PaddleOCR-VL-1.6, del que esta publicacion es una conversion a MLX en bf16.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no hay datos de parametros, contexto, entrenamiento ni evaluacion, lo que impide estimar con rigor su calidad frente a alternativas.
- Riesgo de alucinacion en la transcripcion de texto: como todo modelo generativo de vision-lenguaje, puede producir caracteres o palabras que no aparecen en la imagen, especialmente con documentos de baja calidad o manuscritos.
- Sesgos potenciales derivados de los datos de entrenamiento del modelo base, no documentados en esta publicacion.
- Cobertura idiomatica declarada limitada a ingles, chino y "multilingue" sin especificar; el rendimiento en castellano no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero al ser una conversion de pesos conviene verificar la licencia y condiciones del modelo base PaddleOCR-VL-1.6.
- Dependencia del ecosistema MLX: no es directamente desplegable en entornos CUDA o en servidores Linux sin GPU Apple, lo que limita su uso en produccion convencional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-27) registrada en los metadatos, lo que conviene tratar con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kongtong/lingshu-paddleocr-vl-1.6-bf16
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
