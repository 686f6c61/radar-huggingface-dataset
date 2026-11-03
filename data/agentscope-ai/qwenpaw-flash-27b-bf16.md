# agentscope-ai/QwenPaw-Flash-27B-BF16

## Resumen

QwenPaw-Flash-27B-BF16 es la distribucion en formato GGUF BF16 del modelo agente QwenPaw-Flash-27B, desarrollado por el equipo de AgentScope (agentscope-ai). La familia QwenPaw-Flash esta entrenada especificamente para uso de herramientas, ejecucion de comandos, gestion de memoria y tareas de multiples pasos dentro de QwenPaw, el entorno de agentes del propio proyecto. El modelo cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y se publica bajo licencia Apache 2.0.

La relevancia de esta publicacion radica en su orientacion practica: no se trata de un modelo generalista, sino de un modelo afinado para el bucle agente (tool calling, ejecucion de comandos, memoria persistente y razonamiento multi-paso), empaquetado directamente en GGUF para su despliegue local con llama.cpp. El repositorio ocupa 53,8 GB y se distribuye en dos shards que suman unos 53,8 GB, coherentes con pesos BF16 de ~27B parametros.

La informacion disponible publicamente es limitada: la model card no detalla arquitectura interna, composicion del dataset de entrenamiento, longitud de contexto ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer para generacion de texto y tool use; detalles internos no publicados) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unica publicada en este repositorio); no se listan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos shards: `00001-of-00002` y `00002-of-00002`) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo (tipo de transformer, atencion, posible uso de MoE, etc.) en la informacion disponible. El nombre y los tags indican que se trata de un modelo de la familia QwenPaw-Flash, entrenado para tool use, ejecucion de comandos, gestion de memoria y tareas multi-paso en el entorno QwenPaw. El identificador de los ficheros (`step92`) sugiere un checkpoint intermedio de entrenamiento, aunque el autor no lo confirma.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineacion. La unica informacion tecnica verificable es el formato de publicacion (GGUF BF16 dividido en dos shards con hashes SHA-256 publicados) y el numero de parametros derivado de los safetensors del modelo base.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Uso de herramientas (tool calling / function calling), segun los tags `tool-use` y la descripcion del autor.
- Ejecucion de comandos dentro del entorno QwenPaw.
- Gestion de memoria (persistencia de estado entre interacciones) como parte del diseno del agente.
- Razonamiento multi-paso y tareas agenticas encadenadas.
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`) para servir via llama.cpp.
- Capacidades multilingues: no disponibles (no declaradas).
- Vision, audio o modo thinking explicito: no disponibles.

## Casos de uso

- Agente de automatizacion de tareas en terminal: el modelo esta entrenado para ejecutar comandos y encadenar pasos, por lo que encaja en flujos donde un agente interpreta una instruccion, propone comandos y verifica resultados dentro del entorno QwenPaw.
- Orquestacion de herramientas en pipelines internos: gracias al soporte de tool calling, puede integrarse como cerebro de un agente que invoca APIs, scripts o servicios mediante function calling.
- Asistente con memoria persistente: la gestion de memoria integrada permite mantener contexto de proyecto entre sesiones en aplicaciones de soporte tecnico o gestion de incidencias.
- Despliegue local en estaciones de trabajo: al publicarse en GGUF BF16, puede servirse con llama.cpp y exponerse como API compatible con OpenAI, util para entornos con requisitos de privacidad que no pueden usar APIs en la nube.
- Automatizacion de tareas de desarrollo: generacion y ejecucion de scripts, analisis de repositorios y aplicaciones de CI/CD donde el agente propone cambios y valida con comandos.
- Prototipado de agentes multi-paso en investigacion: base para experimentos de razonamiento encadenado y evaluacion de politicas de uso de herramientas en entornos controlados.
- Servicio de chat conversacional self-hosted: el tag `conversational` y la compatibilidad con endpoints permiten montar un servicio de chat interno sobre `llama-server`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54 GB solo para pesos, mas overhead de contexto y KV cache; en la practica se necesita una GPU de 80 GB (A100 80GB, H100 80GB) o configuracion multi-GPU.
- GPU recomendadas: A100 80GB, H100 80GB, o varias RTX 4090 (24 GB) en paralelo con offloading parcial.
- Consumer GPU: no cabe en una unica GPU de consumo en BF16; seria necesaria cuantizacion adicional (no publicada en este repositorio) o particionado con offloading a RAM/CPU.
- Opciones de despliegue: llama.cpp / `llama-server` (soporte explicito del autor), con API compatible con OpenAI en el puerto 8080. vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| QwenPaw-Flash-27B-BF16 | ~26,9B | no disponible | GGUF BF16 | Apache 2.0 | Afinado para tool use y agentes en QwenPaw |
| Alternativas de ~27B con tool use | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos equivalentes; los datos de rendimiento, contexto y cuantizaciones de este modelo no han sido publicados por el autor.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones de tool use, lo que impide validar su rendimiento frente a alternativas.
- Contexto desconocido: no se especifica la longitud de contexto, un factor critico para tareas agenticas con historial largo.
- Idiomas no declarados: no se confirma el soporte multilingue ni la calidad en castellano.
- Riesgo de alucinacion: inherente a los modelos generativos; en ejecucion de comandos el riesgo es mayor, por lo que se recomienda sandboxing y validacion de acciones.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Checkpoint intermedio: el identificador `step92` sugiere que puede no ser un modelo final; conviene verificar la version recomendada por el autor.
- Uso comercial: permitido por Apache 2.0, pero el autor no ofrece garantias ni soporte; revisar terminos del proyecto QwenPaw.
- Despliegue: requiere una build de llama.cpp que soporte esta arquitectura, y en BF16 exige hardware de gama alta (80 GB de VRAM o multi-GPU).

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/QwenPaw-Flash-27B-BF16
- Repositorio del proyecto: https://github.com/agentscope-ai/QwenPaw
- ModelScope: https://www.modelscope.cn/models/AgentScope/QwenPaw-Flash-27B-BF16
- Coleccion ModelScope: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
