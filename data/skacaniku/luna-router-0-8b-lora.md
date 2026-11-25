# skacaniku/luna-router-0.8b-lora

## Resumen

Luna Router 0.8B LoRA es un adaptador LoRA de bajo rango (rank=4) entrenado sobre el modelo base Qwen3.5-0.8B en cuantizacion 4-bit MLX. Lo desarrolla el usuario skacaniku y su proposito es especializar un modelo pequeno en tareas de orquestacion de agentes, concretamente en el enrutado de peticiones dentro del ecosistema Luna, un framework de agentes open source del mismo autor. El adaptador se publica como safetensors en formato MLX, lo que lo vincula al ecosistema de Apple Silicon.

El modelo resuelve un problema acotado: dotar a un LLM de 0,8 mil millones de parametros de la capacidad de decidir que herramienta o sub-agente debe atender una peticion dentro de un pipeline agentico, sin necesidad de recurrir a modelos mayores. Se entrena sobre 45.000 trayectorias de agente del dataset Luna, con 500 iteraciones y una perdida final de validacion de 0,111, lo que sugiere un ajuste muy estrecho al dominio de entrenamiento.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general, sino un adaptador de enrutado para un framework concreto. La informacion publica es escasa (sin pipeline declarado, sin idiomas, sin benchmarks ni descargas), y el propio autor lo presenta como un componente interno de Luna mas que como un modelo autonomo. Resulta util para quien ya trabaje con Luna o con MLX en Apple Silicon y quiera un enrutador ligero, pero no para evaluaciones generales de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3.5-0.8B, cuantizacion 4-bit MLX) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA es de rango 4 sobre la capa 23 MLP |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la longitud maxima de secuencia en entrenamiento fue 256 tokens |
| Tipos de cuantizacion | 4-bit MLX en el modelo base; el adaptador se distribuye en safetensors MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (segun la model card, "same as Luna") |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 con escala 10,0 aplicado exclusivamente a las proyecciones up_proj, gate_proj y down_proj del MLP de la capa 23 del modelo base Qwen3.5-0.8B en cuantizacion 4-bit MLX. Se trata, por tanto, de un ajuste muy localizado: una sola capa y un solo bloque del transformer, lo que explica el reducido tamano del repositorio (0,4 GB) y el bajo coste de entrenamiento. El modelo base es un transformer decoder de 0,8B de parametros de la familia Qwen3.5, aunque la model card no detalla su arquitectura interna ni su ventana de contexto nativa.

El entrenamiento se realizo sobre 45.000 trayectorias de agente del dataset Luna, con 500 iteraciones, batch size 1, acumulacion de gradiente 4, learning rate 1e-4 y una longitud maxima de secuencia de 256 tokens, con un limite de memoria de 3 GB. La validacion se hizo sobre 500 muestras, alcanzando una perdida final de entrenamiento de 0,138 y de validacion de 0,111. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; tampoco se especifica la composicion exacta del dataset de trayectorias ni si hubo filtrado o deduplicacion.

## Capacidades

- Enrutado de peticiones dentro de pipelines de agentes: el adaptador esta especializado en decidir que herramienta, sub-agente o accion corresponde a una peticion entrante.
- Generacion de texto basica heredada del modelo base Qwen3.5-0.8B, aunque mermada por la cuantizacion 4-bit y por el ajuste estrecho al dominio Luna.
- Integracion con el framework Luna mediante el comando `luna -p "..." --model local:luna-router-0.8b`.
- Carga directa con `mlx_lm` en Apple Silicon mediante `load_adapter`.
- Soporte de tool calling y function calling: no documentado de forma explicita; el enrutado se infiere del proposito del adaptador, pero no hay especificacion tecnica.
- Razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Enrutado de herramientas en un agente Luna: el adaptador recibe la peticion del usuario y el catalogo de herramientas disponibles y selecciona la adecuada. Es su caso de uso principal y el unico documentado por el autor.
- Orquestacion de sub-agentes en pipelines multi-agente: dado un objetivo, el modelo decide que sub-agente debe ejecutar cada paso, aprovechando que fue entrenado sobre 45.000 trayectorias de orquestacion.
- Clasificacion de intenciones en asistentes conversacionales: con contexto corto (256 tokens), puede etiquetar la intencion de un mensaje para derivarlo al flujo correspondiente.
- Prototipado rapido en Apple Silicon: al ejecutarse en MLX con un limite de memoria de 3 GB, permite iterar sobre logicas de enrutado en un portatil Mac sin GPU dedicada.
- Filtrado previo en sistemas RAG: decidir si una consulta requiere recuperacion documental, busqueda web o respuesta directa, reduciendo llamadas a modelos mayores.
- Enrutado de bajo coste en produccion: como primera capa de un sistema jerarquico que solo invoca modelos grandes cuando el enrutador determina que es necesario, reduciendo latencia y coste por peticion.
- Evaluacion de frameworks de agentes: sirve como componente de referencia para comparar estrategias de orquestacion dentro de Luna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdidas de entrenamiento y validacion (train loss 0,138; val loss 0,111), que no son comparables con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4-bit MLX ocupa aproximadamente 0,4-0,5 GB; el adaptador anade un peso despreciable. El entrenamiento se realizo con un limite de memoria de 3 GB.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4); no se documenta soporte para CUDA.
- Cabe en GPU consumer: si, en cualquier Mac con chip Apple Silicon con al menos 8 GB de memoria unificada; en el ecosistema NVIDIA requeriria conversion de formato no documentada.
- Opciones de despliegue: `mlx_lm` (carga y `load_adapter`) y el CLI de Luna (`luna -p ... --model local:luna-router-0.8b`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Luna Router 0.8B LoRA | 0,8B (base) + LoRA r=4 | no disponible (entrenado a 256) | safetensors MLX | Apache-2.0 | Enrutado de agentes |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | safetensors, GGUF, MLX | segun Qwen | Proposito general |
| Adaptadores LoRA de enrutado genericos | variable | variable | safetensors | variable | Clasificacion / enrutado |

La comparativa directa con alternativas publicas no esta disponible: no existen, en la informacion proporcionada, adaptadores equivalentes de enrutado para el ecosistema Luna ni benchmarks que permitan situar este modelo frente a otros. La unica comparacion posible es con su propio modelo base, del que hereda todas las capacidades generales y al que anade la especializacion en enrutado.

## Limitaciones y advertencias

- El adaptador solo modifica la capa 23 MLP del modelo base; su capacidad de alterar el comportamiento global es muy limitada y esta fuertemente sesgada al dominio de entrenamiento.
- La longitud maxima de secuencia en entrenamiento fue de 256 tokens, muy inferior a la ventana nativa del modelo base; el rendimiento en contextos largos no esta validado.
- El entrenamiento se realizo con batch size 1 y solo 500 iteraciones, lo que puede provocar sobreajuste a las 45.000 trayectorias de Luna; la perdida de validacion (0,111) es baja pero no se reportan metricas de generalizacion.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- Riesgo de alucinacion: no evaluado; el modelo base es pequeno y la cuantizacion 4-bit puede agravar errores.
- La licencia declarada es Apache-2.0, pero la model card no incluye el texto completo ni aclara si se heredan restricciones del modelo base Qwen3.5.
- El modelo esta atado al ecosistema MLX y al framework Luna; su uso fuera de ese entorno requiere conversion de formato y no esta documentado.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion (2026-11-25) y la referencia a Qwen3.5 sugieren un modelo muy reciente o de disponibilidad limitada; conviene verificar la existencia y estabilidad del modelo base antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/skacaniku/luna-router-0.8b-lora
- Repositorio de Luna (citado en la model card): https://github.com/skacaniku/luna
- Modelo base en MLX: https://huggingface.co/mlx-community/Qwen3.5-0.8B-4bit
- Documentacion de MLX LM: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
