# lEGlGnoml/Qwen3.8-27B-Fable-Distill-NVFP4-Basalt

## Resumen

Qwen3.8-27B-Fable-Distill-NVFP4-Basalt es un empaquetado en formato Basalt del modelo TeichAI/Qwen3.8-27B-Fable-Distill, que a su vez es un ajuste fino de Qwen/Qwen3.8-27B. El repositorio lo publica el usuario lEGlGnoml y no tiene afiliacion con Qwen ni con TeichAI. No se trata de un modelo reentrenado: es una conversion de formato a un fichero `.basalt` (version 2) que incluye tokenizer, torre de vision y vocabulario de texto, con los pesos cuantizados en NVFP4, FP8 y Q8_0 segun la capa.

El modelo resuelve el problema de desplegar un modelo multimodal de gran tamano (27B parametros) en formatos de cuantizacion de baja precision (NVFP4) empaquetados en un contenedor unico, lo que simplifica la distribucion y reduce el espacio en disco respecto a los pesos originales. El repo ocupa 18,4 GB, coherente con una cuantizacion agresiva de un modelo de 27B.

Es relevante ahora porque combina tres tendencias: modelos multimodales de escala media, ajustes finos destilados sobre corpus privados (Fable 5) y formatos de cuantizacion de 4 bits (NVFP4) orientados a inferencia eficiente. La licencia Apache 2.0 facilita su uso comercial, aunque las condiciones reales dependen de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), tag `qwen3_5`; detalles internos no disponibles |
| Parametros totales | 27B (segun nombre del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131072 tokens (segun `max-context` de la configuracion Basalt) |
| Tipos de cuantizacion | NVFP4 (pesos principales y `output.weight`), FP8 (mantenidos), Q8_0 (proyecciones BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (incluye aviso de copyright de Qwen) |
| Formato de pesos | `.basalt` (Basalt model file version 2); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de Qwen (tag `qwen3_5`), con torre de vision integrada en el pack Basalt. No se dispone de detalles sobre numero de capas, dimensiones, mecanismo de atencion ni innovaciones especificas (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

El ajuste fino lo realizo TeichAI sobre un corpus privado denominado Fable 5, complementado con los datasets armand0e/claude-fable-5-claude-code y armand0e/Fable-5-Chat, que no se redistribuyen en este repositorio. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Este repositorio concreto no reentrena pesos: solo convierte el checkpoint a formato Basalt, preservando los planos NVFP4 originales y recuantizando `output.weight` de BF16 a NVFP4.

## Capacidades

- Generacion de texto y razonamiento en ingles, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de vision incluida en el pack.
- Conversacion multi-turno con ventana de contexto de hasta 131072 tokens.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de documentos extensos con imagenes: gracias a sus 131072 tokens de contexto, el modelo puede procesar manuales, informes o contratos con figuras y tablas intercaladas en una sola pasada.
- Asistencia sobre capturas de pantalla y diagramas tecnicos: la torre de vision permite interpretar interfaces, esquemas de arquitectura o graficos y responder preguntas sobre ellos.
- Generacion de codigo asistida en entornos con recursos limitados: la cuantizacion NVFP4 reduce el peso en memoria, lo que facilita desplegar un modelo de 27B en hardware mas modesto que el requerido por BF16.
- Prototipado de asistentes conversacionales de dominio especifico: el ajuste fino sobre corpus Fable 5 puede aportar un estilo o comportamiento particular util para demos y validacion de producto.
- Investigacion sobre cuantizacion: el pack sirve como referencia para estudiar el impacto de NVFP4, FP8 y Q8_0 mezclados en un mismo checkpoint sobre la calidad de salida.
- Despliegue en servidores con Basalt: la configuracion incluida (`basalt_config.json`) permite levantar un endpoint HTTP local en el puerto 8080 con KV cache en int8, adecuado para entornos de evaluacion internos.
- Extraccion de informacion de facturas, tickets o formularios escaneados en pipelines de automatizacion documental, siempre que el contenido este en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 18,4 GB en disco; con KV cache en int8 y contexto de 131072 tokens, la VRAM necesaria supera ampliamente ese valor, aunque no se proporcionan cifras exactas.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del modelo y la cuantizacion NVFP4, se requeririan GPUs con soporte nativo de FP4 (generaciones recientes de datacenter) o, en su defecto, hardware con suficiente memoria para descomprimir los pesos.
- Compatibilidad con GPU de consumo: no confirmada; NVFP4 no es un formato soportado de forma generalizada por GPUs consumer.
- Opciones de despliegue: exclusivamente Basalt (version con soporte para Qwen3.8-27B), segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Fable-Distill-NVFP4-Basalt | 27B | 131072 | `.basalt` (NVFP4/FP8/Q8_0) | Apache 2.0 | Hugging Face, requiere Basalt |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | safetensors (presumible) | no disponible | Hugging Face |
| TeichAI/Qwen3.8-27B-Fable-Distill | 27B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo entrenado y evaluado principalmente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- El ajuste fino se realizo sobre un corpus privado (Fable 5) y datasets no redistribuidos, lo que limita la reproducibilidad y la auditoria del comportamiento.
- El formato `.basalt` es propietario de una herramienta concreta: no es compatible con ecosistemas estandar como llama.cpp, vLLM u Ollama, lo que restringe la portabilidad.
- La cuantizacion mixta (NVFP4, FP8, Q8_0) puede degradar la calidad respecto al modelo original en BF16; no se aportan metricas de la perdida.
- Requiere una version de Basalt con soporte especifico para Qwen3.8-27B, lo que anade dependencia de una implementacion concreta.
- La licencia Apache 2.0 se declara en el repo, pero el uso comercial debe verificar tambien las condiciones del modelo base Qwen y del ajuste fino de TeichAI.
- El autor declara no estar afiliado a Qwen ni a TeichAI; no hay garantias de soporte ni mantenimiento.
- Solo 1 like y 1111 descargas en el momento de la consulta: comunidad muy reducida y poca validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lEGlGnoml/Qwen3.8-27B-Fable-Distill-NVFP4-Basalt
- Modelo base del ajuste fino: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset claude-fable-5-claude-code: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset Fable-5-Chat: https://huggingface.co/datasets/armand0e/Fable-5-Chat
