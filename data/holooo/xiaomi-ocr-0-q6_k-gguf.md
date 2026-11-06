# holooo/Xiaomi-OCR-0-Q6_K-GGUF

## Resumen

Xiaomi-OCR-0 es un modelo de vision-lenguaje (VLM) especializado en OCR, parsing de documentos y comprension documental, desarrollado por Xiaomi Research. Esta ficha concreta corresponde a la cuantizacion Q6_K en formato GGUF publicada por el usuario holooo, que permite ejecutar el modelo con llama.cpp en hardware modesto. El modelo resuelve tareas de extraccion de texto e informacion estructurada a partir de imagenes de documentos, incluyendo visual question answering y key information extraction.

Con 752.393.024 parametros totales (aproximadamente 0,75 mil millones), se trata de un modelo compacto disenado para despliegue eficiente en entornos de produccion documental. La cuantizacion Q6_K reduce el peso de los pesos a unos 600 MB, mas un proyector visual (mmproj) de 88 MB, lo que lo hace viable en GPU de consumo y en CPU.

La relevancia actual radica en la demanda creciente de pipelines de digitalizacion y extraccion de datos de documentos (facturas, formularios, tickets) que requieren modelos ligeros, ejecutables localmente y con licencia permisiva. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) multimodal; arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servidor usa `-c 4096` |
| Tipos de cuantizacion | Q6_K (6,6 bits) para el modelo y Q6_K para el proyector visual (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (xiaomi-research/Xiaomi-OCR-0). Se trata de un modelo multimodal de tipo image-text-to-text, con un componente de lenguaje y un proyector visual (mmproj) que en esta version GGUF se ha cuantizado por separado a Q6_K desde el proyector bf16 original. El pipeline declarado en Hugging Face es `image-text-to-text`.

El modelo base se entreno sobre un corpus propio centrado en OCR (`custom-ocr-centric-corpus`, segun los metadatos). No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Las metricas declaradas en los metadatos son accuracy, TEDS y CDM, lo que sugiere evaluacion en tareas de parsing de tablas y documentos.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Parsing y comprension de documentos (document parsing, document understanding).
- Visual question answering sobre imagenes.
- Extraccion de informacion clave (key information extraction), por ejemplo campos de formularios o facturas.
- Generacion de texto conversacional a partir de entrada imagen-texto (pipeline image-text-to-text, tag `conversational`).
- Soporte de inferencia multimodal mediante llama.cpp (`llama-mtmd-cli` y `llama-server`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision adicional, audio: no disponible (solo vision para OCR/documentos).

## Casos de uso

- Digitalizacion de facturas y tickets: el modelo puede recibir la imagen de un documento y extraer texto y campos clave, integrándose en un pipeline de contabilidad automatizada. Su tamano reducido permite ejecutarlo en servidores modestos.
- Extraccion de datos de formularios: dado un formulario escaneado, el modelo responde a preguntas concretas ("cual es el CIF", "fecha de emision") mediante visual question answering, reduciendo la necesidad de plantillas fijas por tipo de documento.
- Parsing de tablas en informes: las metricas TEDS declaradas en los metadatos apuntan a evaluacion en reconstruccion de tablas, util para convertir tablas de PDFs e imagenes en estructuras exportables.
- Procesamiento por lotes en local: al pesar unos 600 MB en Q6_K, puede desplegarse con llama.cpp en una sola GPU de consumo o incluso en CPU para volumenes moderados de documentos, sin depender de APIs externas.
- Preprocesado para RAG documental: el modelo puede actuar como extractor de texto de imagenes y PDFs escaneados antes de indexar el contenido en un sistema de recuperacion aumentada.
- Verificacion de documentos en back-office: integrado en un `llama-server`, puede atender peticiones concurrentes de validacion de documentos (DNI, contratos, albaranes) en flujos internos con requisitos de privacidad, ya que los datos no salen de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. Los metadatos del modelo declaran las metricas accuracy, TEDS y CDM, pero no se incluyen valores concretos ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 600 MB para los pesos Q6_K mas 88 MB del proyector visual; en la practica, menos de 2 GB de VRAM contando cache de contexto y overhead de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090, A100, H100 sin problema. Tambien viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (incluso integradas con suficiente memoria compartida, con latencia mayor).
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli`, `llama-server`), y el modelo base via transformers. No se documenta soporte explicito de vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas conocidas de la categoria OCR/VLM ligero; los datos de rendimiento de esas alternativas no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Xiaomi-OCR-0 (Q6_K GGUF) | 752 M | no disponible | Apache 2.0 | GGUF |
| Modelos OCR/VLM ligeros alternativos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo base; al ser un modelo OCR especializado, los sesgos se manifestarian principalmente en calidad de reconocimiento segun idioma, tipografia o calidad de imagen.
- Riesgo de alucinacion en la extraccion de campos: como todo VLM generativo, puede producir texto plausible pero incorrecto en documentos de baja calidad; conviene validar la salida en produccion.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano u otros idiomas sin evaluacion propia.
- Longitud de contexto no especificada; el ejemplo de servidor usa 4096 tokens, lo que limita documentos largos o conversaciones extensas.
- La cuantizacion Q6_K introduce una perdida de calidad minima pero no nula respecto al modelo base en bf16; para tareas de extraccion critica puede ser preferible el modelo original.
- Esta publicacion es una conversion de terceros (usuario holooo) generada con el espacio GGUF-my-repo; no es una publicacion oficial de Xiaomi. La licencia Apache 2.0 del modelo base permite uso comercial, pero conviene verificar la model card original para condiciones adicionales.
- No hay informacion sobre tool calling ni soporte de agentes; no debe asumirse en disenos de sistemas agenticos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/holooo/Xiaomi-OCR-0-Q6_K-GGUF
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
