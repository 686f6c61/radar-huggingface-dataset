# adaliboy/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal de codigo abierto desarrollado por el equipo Qwen de Alibaba, y representa la primera incursion de la familia Qwen3.8 en traer capacidades de nivel Qwen-Max a un modelo abierto. Construido sobre la base arquitectonica de Qwen3.5, incorpora un encoder de vision nativo que le permite comprender imagenes y videos, ademas de un modo de pensamiento hibrido que puede activarse o desactivarse por peticion. Con 27.320 millones de parametros y una ventana de contexto nativa de 262.144 tokens (extensible hasta 1 millon), esta disenado para tareas de codificacion, flujos agente de largo alcance y automatizacion de oficina, manteniendo un perfil de despliegue compacto para hardware local.

El repositorio GGUF objeto de esta ficha, publicado por el usuario adaliboy, utiliza la tecnologia de cuantizacion Unsloth Dynamic V3.0 (preview) para optimizar el rendimiento en inferencia local. La arquitectura hibrida combina atencion lineal (Gated DeltaNet) con atencion clasica (Gated Attention), lo que permite un equilibrio entre eficiencia computacional y calidad de razonamiento. Incluye soporte para Multi-Token Prediction (MTP), tool calling mejorado para agentes, y compatibilidad con frameworks como Codex y Unsloth Desktop.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido denso con vision encoder (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extensible a 1.000.000 con RoPE scaling (YaRN) |
| Tipos de cuantizacion | GGUF con Unsloth Dynamic V3.0 (preview); cuantizaciones especificas no detalladas en el repositorio |
| Idiomas soportados | No disponible (no especificado en la informacion proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base Qwen/Qwen3.8-27B) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura de modelo causal de lenguaje con encoder de vision, organizada en 64 capas con dimension oculta de 5120. El layout interno sigue un patron repetido de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. La Gated DeltaNet utiliza 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128, mientras que la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y RoPE de dimension 64. El FFN tiene dimension intermedia de 17.408. El modelo incorpora MTP (Multi-Token Prediction) entrenado con multiples pasos, lo que acelera la inferencia al predecir varios tokens simultaneamente.

El entrenamiento incluye una fase de pre-entrenamiento y post-entrenamiento, aunque los datos concretos (numero de tokens, composicion del dataset) no estan disponibles en la informacion proporcionada. La cuantizacion GGUF del repositorio de adaliboy utiliza Unsloth Dynamic V3.0, que ofrece mejoras en la preservacion de calidad frente a metodos de cuantizacion anteriores. El modelo soporta modo de pensamiento activado por defecto, con control de profundidad mediante el parametro `reasoning_effort` y retencion de contexto de razonamiento historico via `preserve_thinking`.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos con modo de pensamiento hibrido (thinking mode) activable o desactivable por peticion.
- Comprension multimodal nativa: procesa imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Codificacion de alto nivel: rendimiento destacado en tareas de programacion, comparable a modelos de nivel Opus en entornos locales.
- Soporte de tool calling y function calling mejorado, con parsing de objetos anidados para mayor tasa de exito en llamadas a herramientas.
- Capacidades agente: planificacion autonoma, manejo de feedback del entorno y ejecucion fiable de tareas de largo alcance.
- Soporte para Developer Role, lo que permite su integracion en herramientas agente como Codex.
- Control fino de generacion: parametros de muestreo diferenciados para modo pensamiento (temperature=1.0, top_p=0.95) y modo instruct (temperature=0.7, top_p=0.80).
- Capacidad multilingue presumiblemente amplia (idiomas no especificados en la informacion disponible).

## Casos de uso

- Asistente de codificacion en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para generacion, revision y refactorizacion de codigo, aprovechando su ventana de contexto de 262K tokens para analizar repositorios completos.
- Automatizacion de oficina: procesamiento de documentos, generacion de informes, resumen de actas y extraccion de datos de tablas e imagenes, gracias a su capacidad de comprension de documentos y diagramas.
- Agente autonomo de tareas multiples: desplegado con frameworks agente, puede planificar y ejecutar secuencias de acciones complejas (navegacion web, llamadas a APIs, gestion de archivos) con su modo de pensamiento y tool calling.
- Analisis de video de larga duracion: su capacidad de comprension de video de hasta una hora permite aplicaciones de vigilancia inteligente, revision de grabaciones de reuniones o analisis de contenido audiovisual.
- Asistente de investigacion cientifica: lectura de papers con diagramas, formulacion de hipotesis y generacion de codigo de analisis de datos, apoyandose en la comprension multimodal de figuras y tablas.
- Chatbot de atencion al cliente con contexto largo: gestion de conversaciones multi-turno extensas con memoria de historial completo, manteniendo coherencia gracias a los 262K tokens de ventana nativa.
- Despliegue en hardware local con cuantizacion: ejecucion en GPUs de consumo con tan solo 17 GB de VRAM (segun la cuantizacion elegida), habilitando inferencia privada sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparativas cuantitativas con otros modelos. Las unicas referencias de rendimiento son cualitativas: "rendimiento de nivel Opus en codificacion" segun la revision de Geeky Gadgets, y mejoras generales en codificacion, trabajo profesional, investigacion y tareas agente frente a Qwen3.5 y Qwen3.6, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17 GB para cuantizacion de 4 bits (segun Geeky Gadgets), lo que permite ejecucion en GPUs de consumo como RTX 4080/4090 o RTX 3090.
- Para cuantizaciones de mayor precision (Q6_K, Q8_0), se requieren entre 22 y 30 GB de VRAM, apuntando a GPUs como A100 40GB, RTX A6000 o multiples GPUs.
- El modelo completo en FP16 ocupa aproximadamente 54,6 GB, requiriendo GPUs profesionales como A100 80GB o H100.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y Unsloth Desktop (compatible con Mac, Windows y Linux).
- Unsloth Desktop permite ejecutar el modelo en cuantizacion 4-bit con toggles de modo pensamiento.
- El soporte MTP acelera la inferencia al predecir multiples tokens por paso, reduciendo la latencia de generacion.
- El repositorio GGUF ocupa 726 GB en total, lo que sugiere que incluye multiples archivos de cuantizacion (desde Q2 hasta Q8 probablemente), aunque la lista exacta no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Multimodal |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,3 B | 262K (1M con scaling) | Hibrida: DeltaNet + Attention + Vision | Apache-2.0 | Si (imagen y video) |
| Qwen3.5-27B (predecesor) | 27 B aprox. | No disponible | No disponible | Apache-2.0 | No disponible |
| Llama 3.3 70B | 70 B | 128K | Transformer denso | Llama 3.3 | No |
| Qwen2.5-32B | 32,5 B | 128K | Transformer denso | Apache-2.0 | No |

La comparativa con Qwen3.5 y Qwen3.6 es cualitativa segun la documentacion: Qwen3.8 ofrece mejoras sustanciales en codificacion, trabajo profesional, investigacion y tareas agente de largo alcance. Frente a alternativas densas de tamano similar, Qwen3.8-27B destaca por su multimodalidad nativa y su arquitectura hibrida de atencion, que reduce el coste computacional del contexto largo. No hay datos de benchmarks publicados para una comparacion numerica rigurosa.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks oficiales en la informacion disponible, lo que dificulta una evaluacion objetiva frente a competidores.
- El modo de pensamiento activado por defecto puede generar respuestas mas largas y lentas; desactivarlo reduce calidad en tareas complejas.
- El parametro `presence_penalty` alto (recomendado 1.5 en modo instruct) puede provocar mezcla de idiomas y ligera degradacion del rendimiento.
- Para textos ultra-largos (mas de 262K tokens), se requiere aplicar tecnicas de RoPE scaling como YaRN, lo que puede afectar a la calidad de atencion en los extremos del contexto.
- La cuantizacion Unsloth Dynamic V3.0 esta en fase preview, por lo que puede haber problemas de estabilidad o cambios en el formato.
- El repositorio GGUF es de un tercero (adaliboy), no del equipo oficial de Qwen; se recomienda verificar la integridad de los pesos antes de usarlo en produccion.
- Los idiomas soportados no estan documentados en la informacion disponible; el rendimiento en espanol u otros idiomas distintos del ingles y chino no esta verificado.
- No se especifican sesgos conocidos ni riesgos de alucinacion especificos, pero como modelo generativo de gran tamano, presenta los riesgos habituales de fabricacion de informacion y sesgos de los datos de entrenamiento.
- El tamano del repositorio (726 GB) implica que la descarga completa es pesada; se recomienda seleccionar solo el archivo de cuantizacion necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/adaliboy/Qwen3.8-27B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Repositorio de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de uso de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Pagina de Qwen3.8-27B en Unsloth: https://unsloth.ai/models/qwen3.8-27b
- Revision en Geeky Gadgets: https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
- Modelos fine-tuned de Qwen3.8-27B: https://huggingface.co/models?other=base_model:finetune:Qwen/Qwen3.8-27B
