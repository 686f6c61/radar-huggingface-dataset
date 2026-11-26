# mradermacher/llama3_circuit-breaker_lorra-10_target-10-20_lora-16-16_lr-1e-04_batch-8_checkpoint-8-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF estáticas del modelo `LLM-GAT/llama-3-8b-instruct-rr-checkpoint-8`, un fine-tune de Llama 3 8B Instruct. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, y no implica ningun desarrollo arquitectonico propio: el modelo subyacente es un transformer denso de tipo Llama 3 con 8.030.261.248 parametros reales segun los safetensors del repo base. El nombre del checkpoint sugiere un ajuste fino orientado a "circuit breaker" (cortacircuitos) con LORRA, LoRA de rango 16 y learning rate 1e-4 sobre batches de 8, aunque la model card no documenta el dataset ni el objetivo exacto del entrenamiento.

El interes de esta ficha es practico: permite ejecutar un derivado de Llama 3 8B Instruct en hardware de consumo mediante llama.cpp y sus derivados, con cuantizaciones desde Q2_K (3,3 GB) hasta f16 (16,2 GB). No obstante, la informacion publicada es muy escasa: no hay licencia declarada, no hay benchmarks, no hay documentacion del fine-tune y el unico idioma listado es el ingles. Cualquier uso en produccion deberia tratarse como experimental y validarse contra el modelo base Llama 3 8B Instruct.

La relevancia ahora mismo es la de un artefacto de cuantizacion mas dentro del ecosistema GGUF: util para quien quiera probar rapidamente un fine-tune concreto de Llama 3 8B en local, pero sin las garantias de trazabilidad, licencia y evaluacion que se exigen a un modelo destinado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama 3 (derivado de Llama 3 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 8B Instruct soporta 8.192 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso con la arquitectura de Llama 3 8B Instruct, es decir, atencion multi-cabeza con RoPE, normalizacion RMSNorm y capas MLP con activacion SwiGLU. Sobre esa base se aplico un ajuste fino con LoRA (o LORRA, segun la nomenclatura del checkpoint) de rango 16, learning rate 1e-4 y batch de 8, segun se deduce del identificador del repositorio. El checkpoint publicado corresponde al paso 8 del entrenamiento. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales.

Las cuantizaciones han sido generadas por mradermacher con la herramienta de cuantizacion de llama.cpp. La model card indica que no se han generado cuantizaciones con imatrix (`no_imatrix`), lo que en la practica significa que las versiones IQ y K-quants se basan en calibracion estandar y no en una matriz de importancia especifica del modelo. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama 3 8B Instruct.
- Razonamiento basico y respuesta a instrucciones, condicionado por el fine-tune no documentado.
- Generacion de codigo y matematicas a nivel de un modelo de 8B, sin evaluacion publicada.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Despliegue en llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.).

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: el modelo puede cargarse en un portatil con GPU de 8 GB usando Q4_K_M (5,0 GB) y mantener dialogos multi-turno, lo que permite validar prompts e interfaces sin coste de API.
- Pruebas de fine-tunes experimentales: al ser un derivado con nombre descriptivo de su receta de entrenamiento, sirve para comparar el efecto de un LoRA de rango 16 sobre Llama 3 8B frente al modelo base en tareas concretas.
- Generacion de texto en pipelines offline: con Q8_0 (8,6 GB) se obtiene una calidad cercana al original para tareas de resumen o redaccion en ingles sin conexion a internet.
- Evaluacion de cuantizaciones: la disponibilidad de doce variantes permite medir la degradacion de perplejidad entre Q2_K y f16 sobre un mismo fine-tune, util para calibrar umbrales de calidad en despliegues con VRAM limitada.
- Educacion e investigacion: sirve como ejemplo practico de como se publica y cuantiza un fine-tune de Llama 3, incluyendo la estructura de repositorio y los enlaces de descarga por variante.
- Chatbot de bajo coste en entornos controlados: con Q4_K_S (4,8 GB) puede ejecutarse en una RTX 3060 de 12 GB o incluso en CPU con llama.cpp, adecuado para demos internas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de contexto. Q2_K ronda 3,3 GB; Q4_K_M, 5,0 GB; Q8_0, 8,6 GB; f16, 16,2 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB para Q8_0 y f16; A100 o H100 solo si se necesita throughput alto con llama.cpp o vLLM (este ultimo requiere pesos en safetensors, no GGUF).
- Cabe en GPU de consumo: si, desde Q2_K en adelante en GPUs de 8 GB o mas; Q4_K_S y Q4_K_M son las opciones recomendadas por el autor para GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. Para vLLM o TGI seria necesario convertir a safetensors y usar el modelo base.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion. Como referencia cualitativa, el autor marca Q4_K_S, Q4_K_M y Q8_0 como "fast" y f16 como "overkill".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Llama 3 8B Instruct + LoRA, GGUF) | 8,03 B | no disponible | no disponible | GGUF | Fine-tune no documentado; sin benchmarks |
| Llama 3 8B Instruct (Meta) | 8,03 B | 8.192 tokens | Llama 3 Community License | safetensors, GGUF | Modelo base oficial, con evaluacion publicada |
| Mistral 7B Instruct | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa abierta con contexto mayor y licencia permisiva |
| Qwen2.5 7B Instruct | 7,62 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue y con soporte de tool calling documentado |

La comparativa es orientativa: este repositorio no publica evaluaciones propias, por lo que la comparacion con Llama 3 8B Instruct, Mistral 7B Instruct y Qwen2.5 7B Instruct se basa en caracteristicas declaradas y no en rendimiento medido.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia del modelo base Llama 3 8B Instruct y la del fine-tune antes de desplegar.
- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore al modelo base en ninguna tarea.
- Fine-tune no documentado: se desconoce el dataset, el objetivo y el numero de pasos completados (el checkpoint es el paso 8), lo que aumenta el riesgo de comportamientos inesperados.
- Solo ingles declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de 8B, agravado por la falta de evaluacion del fine-tune.
- Contexto no confirmado: aunque Llama 3 8B Instruct soporta 8.192 tokens, no se verifica que el fine-tune conserve esa ventana.
- Cuantizaciones sin imatrix: las variantes IQ y K-quants pueden degradarse mas que las equivalentes con calibracion por importancia.
- Repositorio de 71,8 GB: incluye todas las variantes; conviene descargar solo el fichero GGUF necesario.
- Sin garantias de mantenimiento: el autor es un tercero que cuantiza modelos de otros, no el desarrollador del fine-tune.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/llama3_circuit-breaker_lorra-10_target-10-20_lora-16-16_lr-1e-04_batch-8_checkpoint-8-GGUF
- Modelo base: https://huggingface.co/LLM-GAT/llama-3-8b-instruct-rr-checkpoint-8
- Pagina de descargas del autor: https://hf.tst.eu/model#llama3_circuit-breaker_lorra-10_target-10-20_lora-16-16_lr-1e-04_batch-8_checkpoint-8-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
