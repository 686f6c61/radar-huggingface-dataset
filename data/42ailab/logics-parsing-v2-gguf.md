# 42ailab/Logics-Parsing-v2-GGUF

## Resumen

Logics-Parsing-v2 es un modelo multimodal de 4.022 millones de parametros (4B) especializado en el analisis y conversion de documentos a HTML estructurado. Desarrollado originalmente por el equipo Logics de Alibaba y construido sobre Qwen3-VL-4B, el modelo recibe como entrada una imagen de pagina (libro, articulo cientifico, informe) y devuelve HTML con encabezados, parrafos, tablas y formulas diferenciados semanticamente, ademas de diagramas de flujo convertidos a notacion Mermaid y partituras musicales en notacion ABC.

El repositorio que nos ocupa, `42ailab/Logics-Parsing-v2-GGUF`, no es el modelo original sino una distribucion cuantizada en formato GGUF preparada por 42ailab para su integracion en la aplicacion de escritorio 42model. Los archivos son byte a byte identicos a los publicados por el empaquetador comunitario mradermacher, con verificacion sha256 documentada. Esta version permite ejecutar el modelo completamente en local mediante llama.cpp, sin dependencia de servicios en la nube.

La relevancia actual del modelo reside en su combinacion de tamano contenido (4B parametros), licencia permisiva Apache-2.0 y capacidades de parsing documental de alta estructura, lo que lo hace viable en hardware de consumo para tareas de digitalizacion, extraccion de datos de documentos y conversion de PDF a formatos estructurados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), base Qwen3-VL-4B |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (decoder de texto); mmproj-f16 (encoder de vision) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal de tipo vision-language, heredada de Qwen3-VL-4B. El sistema se compone de dos partes empaquetadas por separado en la distribucion GGUF: un decoder de texto cuantizado (archivos Q4_K_M a Q8_0) y un encoder de vision en precision f16 (`mmproj-f16.gguf`, 0.78 GiB) compartido entre todas las cuantizaciones del decoder. Esta separacion permite intercambiar el nivel de cuantizacion del texto sin duplicar el coste del encoder visual.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada. La model card indica que el modelo esta especializado en parsing documental y que fue evaluado en los benchmarks LogicsDocBench y OmniDocBench v1.5, pero no se incluyen los datos de entrenamiento. El repositorio documenta que la conversion a GGUF fue realizada por mradermacher y verificada por 42ailab mediante reconversion independiente desde los pesos oficiales de Alibaba, obteniendo salidas identicas en dos paginas de prueba (una de libro en chino y una de articulo en ingles), incluidas las coordenadas de layout.

## Capacidades

- Conversion de imagenes de documentos a HTML estructurado con marcado semantico de encabezados, parrafos, tablas y formulas.
- Reconocimiento optico de caracteres (OCR) integrado en el pipeline de parsing.
- Conversion de diagramas de flujo a notacion Mermaid.
- Conversion de partituras musicales a notacion ABC.
- Procesamiento de documentos en chino e ingles.
- Inferencia local completa mediante llama.cpp, sin llamadas a servicios externos.
- Entrada image-text-to-text: acepta imagenes de pagina y texto de instruccion.
- Capacidad conversacional (tag `conversational` en el repositorio).

## Casos de uso

- Digitalizacion de bibliotecas y archivos: el modelo convierte paginas escaneadas de libros en HTML estructurado, preservando la jerarquia de encabezados y parrafos, lo que facilita la indexacion posterior y la busqueda full-text sobre el contenido.
- Extraccion de tablas de informes financieros: al marcar las tablas de forma separada en la salida HTML, permite pipelines automaticos que extraen datos tabulares de informes anuales o balances sin post-procesado manual de la estructura.
- Conversion de articulos cientificos a formatos web: las formulas matematicas se identifican y marcan de forma diferenciada, lo que resulta adecuado para republicar papers en plataformas web o wikis internas con renderizado de formulas.
- Documentacion tecnica con diagramas: la conversion de diagramas de flujo a Mermaid permite migrar documentacion heredada (PDF, imagenes) a repositorios Markdown versionados donde los diagramas se renderizan y editan como codigo.
- Procesamiento de partituras musicales: la salida en notacion ABC facilita la conversion de partituras escaneadas a formatos editables y su integracion en herramientas de edicion musical o motores de sintesis.
- Despliegue en entornos sin conectividad: al ejecutarse con llama.cpp en local, es adecuado para organizaciones con requisitos de confidencialidad que no pueden enviar documentos a APIs externas, como despachos juridicos o administraciones publicas.
- Preprocesado para pipelines RAG: la salida HTML estructurada sirve como etapa de normalizacion documental antes de la fragmentacion y generacion de embeddings, mejorando la calidad de la recuperacion al preservar la estructura semantica del original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones en LogicsDocBench y OmniDocBench v1.5, pero no incluye las cifras. La verificacion realizada por 42ailab se limita a dos paginas de prueba y no constituye una evaluacion de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GiB con Q4_K_M (2,33 GiB decoder + 0,78 GiB encoder), 3,5 GiB con Q5_K_M, 3,9 GiB con Q6_K y 4,8 GiB con Q8_0.
- Cabe en GPUs de consumo: cualquier GPU con 6 GB o mas de VRAM puede ejecutar la cuantizacion Q4_K_M con margen para el contexto y los tensores de activacion (RTX 3060, RTX 4060, RTX 4070, etc.).
- GPUs recomendadas para mayor throughput: RTX 4090, A100, H100 si se procesan lotes grandes de paginas en paralelo.
- Despliegue: llama.cpp es el runtime nativo del formato GGUF; tambien es compatible con la aplicacion 42model, que descarga el modelo desde este repositorio con digests sha256 fijados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Logics-Parsing-v2 (este) | 4B | no disponible | Apache-2.0 | GGUF, safetensors (upstream) | Parsing documental especializado, salida HTML/Mermaid/ABC |
| Qwen3-VL-4B (base) | 4B | no disponible | no disponible | safetensors | Modelo vision-language generalista del que deriva |
| mradermacher/Logics-Parsing-v2-GGUF | 4B | no disponible | Apache-2.0 | GGUF | Misma conversion, repositorio de origen de los archivos |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer diferencias de rendimiento cuantitativas con alternativas.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte para chino e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Especializacion estrecha: el modelo esta disenado para parsing documental; no es un modelo generalista y su uso fuera de esa tarea no esta validado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido HTML que no corresponda fielmente a la imagen de entrada, especialmente en documentos de baja calidad o layouts poco comunes.
- Evaluacion limitada: la verificacion de la conversion GGUF cubre solo dos paginas; no constituye una evaluacion de calidad del modelo.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de documentos de multiples paginas en una sola pasada.
- Licencia: Apache-2.0 permite uso comercial, pero los creditos de autoria corresponden al equipo Logics de Alibaba; este repositorio es una redistribucion.
- Dependencia del encoder de vision: todas las cuantizaciones requieren el archivo `mmproj-f16.gguf` adicional (0,78 GiB), que debe descargarse junto al decoder.
- Fechas del repositorio: las fechas de creacion y actualizacion registradas (2026) son posteriores a la fecha actual, lo que sugiere un posible error en los metadatos de la plataforma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Logics-Parsing-v2-GGUF
- Modelo base: https://huggingface.co/Logics-MLLM/Logics-Parsing-v2
- Repositorio de mradermacher (origen de los GGUF): https://huggingface.co/mradermacher/Logics-Parsing-v2-GGUF
- GitHub del proyecto Logics-Parsing (Alibaba): https://github.com/alibaba/Logics-Parsing
- ModelScope: https://modelscope.cn/models/42ailab/Logics-Parsing-v2-GGUF
- Sitio de 42ailab: https://42ailab.com
- Aplicacion 42model: https://42model.com
