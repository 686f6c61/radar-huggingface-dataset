# Oscilla/Phi-4-mini-instruct-mlx-8Bit

## Resumen

Oscilla/Phi-4-mini-instruct-mlx-8Bit es una conversion al formato MLX del modelo microsoft/Phi-4-mini-instruct, realizada por el usuario Oscilla mediante la libreria mlx-lm en su version 0.31.2. Se trata, por tanto, de una version cuantizada a 8 bits del modelo original de Microsoft, pensada para ejecucion eficiente sobre hardware de Apple Silicon (chips de la serie M) utilizando el framework MLX. El repositorio tiene un tamano de 4,1 GB y contiene 3.836.021.760 parametros almacenados en formato safetensors compatible con MLX.

El modelo subyacente, Phi-4-mini-instruct, es un transformer denso decoder-only de 3,8B parametros disenado para tareas de generacion de texto y chat-completion. Frente a Phi-3.5-Mini incorpora mejoras como un vocabulario de 200K tokens, atencion con consultas agrupadas (GQA) y embedding compartido, con una longitud de contexto de 128.000 tokens segun el catalogo de Microsoft Foundry. La licencia es MIT, lo que permite uso comercial sin las restricciones habituales de otros modelos abiertos.

Su relevancia actual radica en que permite desplegar localmente un modelo de razonamiento y generacion multilingue de casi 4.000 millones de parametros en un portatil Mac, con un consumo de memoria reducido gracias a la cuantizacion de 8 bits, sin depender de infraestructura en la nube ni de GPUs dedicadas. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y con poca traccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia phi3) con GQA y embedding compartido |
| Parametros totales | 3.836.021.760 (aprox. 3,84B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (segun catalogo de Microsoft Foundry para el modelo base) |
| Tipos de cuantizacion | 8-bit en formato MLX (este repositorio); el modelo base admite otras cuantizaciones no detalladas aqui |
| Idiomas soportados | 24 idiomas: arabe, chino, checo, danes, neerlandes, ingles, finlandes, frances, aleman, hebreo, hungaro, italiano, japones, coreano, noruego, polaco, portugues, ruso, espanol, sueco, thai, turco y ucraniano |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso decoder-only, segun la descripcion del catalogo de Microsoft Foundry. Emplea atencion con consultas agrupadas (grouped-query attention), embedding compartido y un vocabulario de 200.000 tokens, mejoras que lo diferencian de Phi-3.5-Mini. La familia phi3 aparece reflejada en las etiquetas del repositorio, lo que confirma la implementacion arquitectonica utilizada para la conversion.

El repositorio de Oscilla no aporta informacion sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion). La unica transformacion documentada es la conversion a formato MLX con mlx-lm 0.31.2 y la cuantizacion a 8 bits. No se detallan innovaciones tecnicas adicionales en la model card de esta conversion.

## Capacidades

- Generacion de texto y conversacion multi-turno: el modelo esta etiquetado como `conversational` y `text-generation`, y el ejemplo de la model card muestra su uso con plantilla de chat (`apply_chat_template`).
- Generacion de codigo: la etiqueta `code` indica soporte para tareas de programacion, aunque no se especifican lenguajes ni resultados de evaluacion.
- Capacidades multilingues: cubre 24 idiomas, incluidos ingles, chino, espanol, frances, aleman, japones, arabe, ruso y coreano, entre otros.
- Razonamiento y matematicas: no se documentan de forma explicita en la informacion disponible para esta conversion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de pensamiento (thinking mode), vision o audio: no disponible en la informacion proporcionada.
- Ejecucion local en hardware Apple Silicon: soportado de forma nativa a traves de MLX y la libreria mlx-lm.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno con 128.000 tokens de contexto ejecutandose sobre MLX en chips de la serie M, lo que permite mantener un asistente privado sin conexion a servicios externos.
- Generacion de codigo en el editor: al estar etiquetado con `code`, puede integrarse en extensiones de IDE para autocompletar funciones, generar tests o explicar fragmentos, ejecutandose localmente para evitar enviar codigo propietario a terceros.
- Prototipado y evaluacion de modelos: al ser una conversion de un modelo pequeno (3,84B), resulta util para probar pipelines de inferencia con MLX antes de escalar a modelos mayores.
- Atencion al cliente automatizada: su ventana de contexto de 128.000 tokens permite incorporar manuales o historiales extensos en el prompt para respuestas fundamentadas en documentacion.
- Traduccion y procesamiento multilingue: con 24 idiomas soportados puede emplearse para traduccion ligera, resumen de documentos o clasificacion de textos en multiples lenguas.
- Procesamiento de documentos largos: la combinacion de contexto amplio y bajo consumo de memoria permite resumir informes extensos, extraer informacion estructurada o responder preguntas sobre PDFs largos en un equipo de sobremesa.
- Educacion y tutoria: puede generar explicaciones, ejemplos y ejercicios en varios idiomas, desplegado en entornos con recursos limitados o sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio Oscilla/Phi-4-mini-instruct-mlx-8Bit se limita a describir el proceso de conversion e incluye un ejemplo de uso con mlx-lm, sin tablas de evaluacion. El catalogo de Microsoft Foundry tampoco aporta cifras de MMLU, HumanEval, GSM8K ni otras metricas en la informacion recuperada.

## Requisitos de hardware

- VRAM / memoria unificada estimada para esta version 8-bit: aproximadamente 4 GB de pesos (el repositorio ocupa 4,1 GB), por lo que se recomienda un minimo de 8 GB de memoria unificada para dejar margen a la cache KV y al resto del sistema.
- Memoria estimada segun cuantizacion del modelo base: 8-bit en torno a 4 GB; 4-bit en torno a 2,2 GB; FP16 en torno a 7,7 GB.
- GPU recomendadas: al ser un formato MLX, esta pensado para Apple Silicon (serie M1, M2, M3, M4) con memoria unificada. Para el modelo base en FP16 o en despliegues CUDA se usan habitualmente GPUs como A100, H100 o RTX 4090; no se dispone de guias oficiales en la informacion proporcionada.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo RTX 3060/4060/4090) si se usa el modelo base en cuantizaciones equivalentes; en el caso especifico de esta conversion, el destino es Apple Silicon.
- Opciones de despliegue: mlx-lm para MLX; para el modelo base (formato transformers) son aplicables vLLM, TGI, llama.cpp, Ollama y ONNX, entre otros, aunque no se confirman en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato destacado | Disponibilidad |
|---|---|---|---|---|---|
| Oscilla/Phi-4-mini-instruct-mlx-8Bit | 3,84B | 128.000 tokens (modelo base) | MIT | safetensors MLX 8-bit | HuggingFace |
| microsoft/Phi-4-mini-instruct | 3,8B | 128.000 tokens | MIT | safetensors | HuggingFace, Azure AI Foundry |
| Phi-3.5-Mini | no disponible | no disponible | MIT | safetensors | HuggingFace |
| Otros modelos de ~3B (Llama, Qwen, Gemma) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a parametros, contexto, licencia y disponibilidad, sin cifras de benchmarks que permitan una valoracion cuantitativa frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada. Al ser una conversion del modelo base, hereda los sesgos del entrenamiento original de Microsoft, que no se detallan aqui.
- Riesgo de alucinacion: no se aporta informacion especifica para esta conversion; es un riesgo inherente a los modelos de lenguaje de esta escala, especialmente en tareas de razonamiento y datos factuales.
- Limitaciones de contexto o idioma: aunque la ventana es de 128.000 tokens, el rendimiento efectivo en contextos muy largos no esta verificado en la informacion disponible. La cobertura de los 24 idiomas puede ser desigual y no se especifica el nivel de calidad por lengua.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion y sin garantias. Conviene conservar el aviso de licencia del modelo base.
- Caveat especifico de esta conversion: el formato MLX restringe su uso a entornos Apple Silicon; no es directamente cargable en CUDA sin conversion adicional.
- Estado del repositorio: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad. No se aportan pruebas de que la conversion a 8 bits preserve fielmente el comportamiento del modelo original.
- No se documentan capacidades de tool calling, agentes o modo de razonamiento, por lo que no deben asumirse sin verificacion previa en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/Phi-4-mini-instruct-mlx-8Bit
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/resolve/main/LICENSE
- Ficha en Microsoft Foundry: https://ai.azure.com/catalog/models/Phi-4-mini-instruct
