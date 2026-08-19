# lued/Qwen3.8-27B-AEON-UNCENSORED-INT8-W8A16-MTP

## Resumen

Este modelo es una cuantizacion numerica W8A16 (INT8) del checkpoint abliterado AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, que a su vez es una version "uncensored" (sin rechazos) del modelo multimodal denso Qwen3.8-27B de Alibaba. El autor, lued, ha aplicado una receta de cuantizacion con compressed-tensors de vLLM pensada especificamente para GPUs Ampere (sm_86) donde no existe ejecucion nativa de FP8, manteniendo intacta la torre de vision, el contexto nativo de 262.144 tokens y la cabeza MTP en BF16.

El modelo resuelve dos problemas a la vez: por un lado, reduce el peso en memoria de un LLM de 27.781 millones de parametros para poder ejecutarlo en hardware de consumo (dos RTX 3090 de 24 GB); por otro, elimina los rechazos tipicos de los modelos alineados mediante la tecnica de abliteracion (abliterix), ofreciendo respuestas sin censura sobre temas que el modelo base rechazaria. Es relevante ahora porque combina capacidades multimodales, razonamiento configurable y contexto largo en un formato cuantizado listo para vLLM, con una licencia Apache 2.0.

La arquitectura es la de Qwen3.8-27B: un transformer denso con torre de vision, soporte de thinking mode, tool calling y agente multi-paso. El checkpoint pesa 31,6 GB (29,44 GiB) y se sirve con vLLM en configuracion tensor parallel de 2 GPUs, con KV cache en FP8 y decodificacion especulativa MTP de 3 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + texto) basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (extensible a 1M con YaRN, segun el modelo base) |
| Tipos de cuantizacion | W8A16 (INT8 pesos, FP16/BF16 activaciones), grupo 128, RTN simetrico data-free |
| Idiomas soportados | No disponible (heredado del modelo base Qwen3.8-27B, que es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, 6 shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B, un transformer denso multimodal con torre de vision separada (333 tensores intactos, verificados por hash) y una cabeza MTP (Multi-Token Prediction) en BF16, byte-identica a la original de Qwen. La cuantizacion W8A16 se aplica unicamente a los 400 GEMMs de la capa de lenguaje, manteniendo el resto de componentes en precision original. La receta usa compressed-tensors de vLLM con cuantizacion simetrica data-free RTN por grupos de 128.

El proceso de creacion fue: partir de Qwen/Qwen3.8-27B, aplicar reparacion de outliers conv1d (FernflowerAI), ejecutar abliterix 1.12.2 (herramienta basada en Heretic con Optuna multi-objetivo y soporte hibrido Mamba/attention) con 50 trials y un juez Gemini 3.1 Flash Lite, seleccionando el trial 48/50 por coherencia de respuestas y no por minimo KL. La KL medida fue de 0,0991 nats/token (intencionadamente alta, porque se optimizo para respuestas coherentes sobre aperturas similares al modelo stock). La cuantizacion posterior no altera el perfil de rechazo, que es propiedad de los pesos base.

## Capacidades

- Generacion de texto multimodal: acepta imagenes y texto como entrada, produce texto (pipeline image-text-to-text).
- Razonamiento configurable: soporta thinking mode (modo de pensamiento) con control explicito, heredado de Qwen3.8.
- Tool calling y function calling: soporte nativo para invocar herramientas, util para agentes.
- Agentes y multi-step reasoning: disenado para tareas agente de largo horizonte con planificacion y manejo de feedback de entorno.
- Contexto largo nativo de 262.144 tokens, extensible a 1M con YaRN.
- Decodificacion especulativa MTP (Multi-Token Prediction) con 3 tokens de borrador en BF16.
- Perfil "uncensored": cero rechazos duros (hard "I won't") en los conjuntos de evaluacion de 250 prompts del modelo base, verificado en pruebas del operador.
- Capacidades multilingues: no confirmadas explicitamente en la documentacion, pero heredadas del modelo base Qwen3.8-27B.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y sin rechazos, lo que permite tratar temas delicados o controvertidos sin cortes bruscos, manteniendo coherencia durante toda la interaccion.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo, aprovechando el modo thinking para razonar sobre problemas complejos antes de emitir respuestas.
- Analisis de documentos con vision: al ser multimodal, puede procesar capturas de pantalla, diagramas, graficos o documentos escaneados junto con texto, util para extraer informacion de imagenes tecnicas o financieras.
- Agentes autonomos de largo horizonte: su contexto nativo de 262K tokens y su capacidad de razonamiento multi-paso permiten mantener estado de tareas largas, como navegacion web automatizada, gestion de proyectos o investigacion asistida.
- Soporte tecnico sin censura: en entornos donde se requiere abordar temas como salud, sexualidad, drogas o violencia sin filtros morales (por ejemplo, en investigacion academica o simulacion de escenarios), el perfil uncensored evita respuestas evasivas.
- Despliegue en hardware de consumo: con dos RTX 3090 (24 GB cada una) se puede ejecutar en local, lo que permite uso privado sin conexion a APIs externas, ideal para entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. El unico dato de rendimiento mencionado es la metrica de KL del proceso de abliteracion (0,0991 nats/token) y la verificacion de cero rechazos, pero no hay evaluaciones de calidad de tareas.

## Requisitos de hardware

- VRAM estimada: 14,85 GiB por GPU en configuracion tensor parallel 2 (TP2), con BF16 activaciones y KV cache FP8 E4M3.
- GPU recomendadas: 2× RTX 3090 24 GB (perfil validado), aunque cualquier GPU Ampere o posterior con al menos 24 GB VRAM puede servir. No cabe en una sola GPU consumer de 24 GB si se quiere el contexto completo (la carga es de ~29,4 GiB totales).
- Opciones de despliegue: vLLM (libreria principal), con flags especificos como `--max-model-len 262144`, `--kv-cache-dtype fp8_e4m3`, `--speculative-config` para MTP y `--max-num-batched-tokens 8192`.
- Latencia y throughput: no se proporcionan cifras exactas, pero el perfil validado con MTP de 3 tokens de borrador esta disenado para mejorar la velocidad de decodificacion en hardware Ampere sin soporte FP8.
- Alternativas: llama.cpp u Ollama no estan mencionados; el formato compressed-tensors esta orientado a vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Perfil de rechazo | Licencia |
|---|---|---|---|---|---|
| lued/Qwen3.8-27B-AEON-UNCENSORED-INT8-W8A16-MTP (este) | 27,78B | 262K nativo | W8A16 INT8 | Uncensored (0 rechazos) | Apache-2.0 |
| lued/Qwen3.8-27B-INT8-W8A16-MTP (hermano sin abliterar) | 27,78B | 262K nativo | W8A16 INT8 | Alineado (rechazos normales) | Apache-2.0 |
| Qwen/Qwen3.8-27B (original) | 27,78B | 262K nativo | BF16 | Alineado | Apache-2.0 |
| unsloth/Qwen3.8-27B-GGUF | 27,78B | 262K nativo | GGUF (varias) | Alineado | Apache-2.0 |

La diferencia principal entre este modelo y su hermano no-uncensored es exclusivamente los pesos de la capa de lenguaje (abliterados vs stock); la receta de cuantizacion, el layout de shards y el perfil de servicio son identicos. Frente al original BF16, la ventaja es el menor uso de memoria (14,85 GiB vs ~54 GiB en BF16) a costa de una perdida de precision no cuantificada en los benchmarks publicados.

## Limitaciones y advertencias

- Sesgos y contenido nocivo: al ser uncensored, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No debe desplegarse en produccion sin salvaguardas adicionales (filtros de salida, moderacion humana).
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; el perfil abliterado puede aumentar la confianza en respuestas incorrectas, especialmente en dominios especializados.
- Perdida de precision por cuantizacion: W8A16 con RTN data-free puede degradar ligeramente la calidad en tareas de razonamiento complejo frente al BF16 original, aunque no hay datos cuantitativos.
- Contexto nativo limitado por KV: aunque el modelo soporta 262K tokens, la capacidad simultanea de requests a contexto completo es de 1,02× en el perfil TP2 con KV FP8; con multiples requests el contexto por peticion se reduce (ej. ~66K tokens en una configuracion de 4 requests).
- Dependencia de vLLM: el formato compressed-tensors y la cabeza MTP requieren vLLM; no es compatible directamente con otros servidores de inferencia como TGI o llama.cpp sin conversion.
- Restricciones legales: aunque la licencia es Apache-2.0, el uso de un modelo abliterado puede violar los terminos de uso del modelo base original de Qwen en algunas jurisdicciones; el autor no ofrece garantias legales.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar, lo que dificulta comparar objetivamente con otros modelos de tamano similar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lued/Qwen3.8-27B-AEON-UNCENSORED-INT8-W8A16-MTP
- Modelo base (AEON abliterado): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo hermano sin abliterar: https://huggingface.co/lued/Qwen3.8-27B-INT8-W8A16-MTP
- Repositorio de abliterix: https://github.com/wuwangzhang1216/abliterix
- vLLM: https://github.com/vllm-project/vllm
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
