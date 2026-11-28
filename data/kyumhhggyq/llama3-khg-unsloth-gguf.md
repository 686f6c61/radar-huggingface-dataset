# kyumhhggyq/Llama3-KHG-Unsloth-GGUF

## Resumen

Llama3-KHG-Unsloth-GGUF es una distribucion en formato GGUF de un ajuste fino (fine-tuning) del modelo Llama 3 de 8B, realizado y convertido con la libreria Unsloth. Lo publica el usuario `kyumhhggyq` en Hugging Face y esta pensado para su uso directo con llama.cpp y ecosistemas compatibles (llama-cli, llama-mtmd-cli, servidores con API compatible con OpenAI). El repositorio contiene un unico archivo cuantizado en Q8_0.

El modelo parte de la arquitectura Llama 3 (transformer decoder-only denso) con aproximadamente 8.030 millones de parametros, segun los metadatos de safetensors del repositorio. Al tratarse de un ajuste fino comunitario, no hay informacion publicada sobre el dataset de entrenamiento, el objetivo del fine-tuning ni los hiperparametros utilizados; la model card se limita a indicar el proceso de conversion a GGUF y los comandos de uso.

Su relevancia es practica: ofrece un Llama 3 8B ajustado en un formato listo para inferencia local con llama.cpp, lo que permite desplegarlo en hardware de consumo o en servidores sin GPU de gama alta. No obstante, la ausencia de documentacion sobre el fine-tuning, la licencia y los idiomas hace que deba evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3) |
| Parametros totales | 8.030.261.248 (~8B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Llama 3 8B soporta 8.192 tokens, no confirmado para este ajuste) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`llama-3-8b.Q8_0.gguf`); el repo declara parametros reales en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Llama 3 8B, un transformer decoder-only denso con atencion multi-cabeza agrupada (GQA) en el modelo base. El fine-tuning y la conversion a GGUF se realizaron con Unsloth, una libreria que optimiza el entrenamiento (LoRA/QLoRA) y la exportacion de pesos, y que segun la model card permite entrenar "2x mas rapido". No se especifica si el ajuste empleo LoRA, QLoRA o un fine-tuning completo, ni el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO o cualquier innovacion adicional.

No hay informacion sobre la tarea concreta del ajuste fino (dominio, estilo, idioma objetivo), por lo que las capacidades reales del modelo mas alla del Llama 3 base no pueden confirmarse. El unico artefacto publicado es una cuantizacion Q8_0, que preserva practicamente la precision del modelo en FP16 a costa de un mayor tamano en disco.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Llama 3 8B.
- Razonamiento basico y respuesta a instrucciones (se asume formato chat de Llama 3, no confirmado en la model card).
- Generacion de codigo y tareas de matematicas simples, propias de un modelo de 8B.
- Soporte de plantillas Jinja en llama.cpp (`--jinja`), lo que habilita el uso de chat templates y tool calling si la plantilla lo define.
- Compatibilidad con endpoints de API (tag `endpoints_compatible`).
- Capacidades multilingues: no disponibles/documentadas.
- No se documentan modos especiales (thinking, vision, audio); el comando `llama-mtmd-cli` se menciona de forma generica para modelos multimodales, pero este repositorio solo contiene un GGUF de texto.

## Casos de uso

- Prototipado local de asistentes conversacionales: cargar el GGUF Q8_0 con `llama-cli` o `llama-server` permite tener un chatbot funcional en una maquina de sobremesa sin depender de APIs externas.
- Evaluacion de fine-tunes comunitarios: util como banco de pruebas para comparar el efecto de ajustes de Unsloth frente al Llama 3 8B original en tareas concretas.
- Generacion de texto offline en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen de la infraestructura del usuario.
- Integracion en pipelines de desarrollo con llama.cpp: el formato GGUF y la compatibilidad con endpoints permiten montar un servicio HTTP compatible con OpenAI para pruebas de integracion.
- Educacion e investigacion: sirve para estudiar el flujo completo de fine-tuning con Unsloth y exportacion a GGUF en un modelo de tamano manejable.
- Tareas de generacion de codigo y resumen en local: adecuado para borradores y automatizaciones ligeras donde no se requiere maxima precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: en torno a 8,5-9 GB solo para los pesos, mas overhead de contexto y cache KV; se recomienda un minimo de 12 GB de VRAM o el uso de RAM del sistema con offloading parcial.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB o H100 para despliegues con mayor concurrencia.
- GPU de consumo: cabe en RTX 4080/4090 y en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) con margen limitado; en GPUs de 8-12 GB sera necesario cuantizar a Q4/Q5 (no publicadas en este repo) o usar offloading a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todos sus modos, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama3-KHG-Unsloth-GGUF | ~8B | no disponible | GGUF Q8_0 | no disponible | Hugging Face (212 descargas) |
| Llama 3 8B Instruct (Meta) | 8B | 8.192 tokens | safetensors, GGUF | Llama 3 Community License | Amplia, oficial |
| Mistral 7B Instruct | 7,3B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Amplia, oficial |
| Qwen2.5 7B Instruct | 7,6B | 32.768 tokens | safetensors, GGUF | Apache 2.0 (mayoria de variantes) | Amplia, oficial |

## Limitaciones y advertencias

- No hay informacion sobre la licencia: no puede asumirse uso comercial sin verificar los terminos del modelo base Llama 3 y del ajuste.
- El fine-tuning no esta documentado: se desconoce el dataset, la tarea objetivo y posibles sesgos introducidos.
- Riesgo de alucinacion inherente a los modelos de 8B, agravado por la falta de evaluacion publicada.
- Idiomas soportados no documentados; el rendimiento en castellano no esta verificado.
- Un unico archivo Q8_0 limita el despliegue en GPUs de menos de 12 GB; no se ofrecen cuantizaciones Q4/Q5.
- El modelo base Llama 3 tiene fecha de corte de conocimiento de 2023; cualquier ajuste no corrige necesariamente esa limitacion.
- Repositorio con muy baja adopcion (212 descargas, 0 likes) y autor sin historial verificable: conviene auditar el modelo antes de usarlo en produccion.
- La mencion de `llama-mtmd-cli` en la model card es generica y no implica capacidades multimodales en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/kyumhhggyq/Llama3-KHG-Unsloth-GGUF
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo base Llama 3: https://huggingface.co/meta-llama/Meta-Llama-3-8B
