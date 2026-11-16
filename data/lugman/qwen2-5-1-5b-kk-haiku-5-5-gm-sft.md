# lugman/Qwen2.5-1.5B-KK-Haiku-5-5-GM-SFT

## Resumen

Qwen2.5-1.5B-KK-Haiku-5-5-GM-SFT es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) basado en la arquitectura Qwen2, un transformer decoder-only denso. El modelo parte del checkpoint `unsloth/Qwen2.5-1.5B-Instruct` y ha sido entrenado con la libreria Unsloth junto con TRL de Hugging Face, lo que permite un entrenamiento aproximadamente 2 veces mas rapido que con el flujo estandar.

La relevancia de este modelo es limitada y de nicho: se trata de un experimento de ajuste fino comunitario, con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin datos de benchmarks y sin documentacion sobre el dataset de entrenamiento. El nombre sugiere un ajuste orientado a un estilo concreto (posiblemente haiku o formato poetico, dado el sufijo "KK-Haiku-5-5-GM-SFT"), pero no hay informacion publicada que lo confirme.

Por su tamano y licencia Apache 2.0, el modelo es adecuado para experimentacion en hardware de consumo, prototipado rapido y despliegue en entornos con recursos limitados. No obstante, al carecer de evaluacion publicada y de documentacion tecnica, no deberia considerarse para produccion sin una validacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser compatible con transformers y safetensors, admite cuantizacion posterior (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Al tratarse de un fine-tuning del checkpoint `unsloth/Qwen2.5-1.5B-Instruct`, hereda la arquitectura y los pesos preentrenados del modelo original de Alibaba, sobre los que se ha aplicado un ajuste supervisado (SFT).

El entrenamiento se realizo con Unsloth y TRL, segun indica el autor, lo que implica un proceso de fine-tuning optimizado en memoria y velocidad (aproximadamente 2 veces mas rapido). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO adicional ni hiperparametros utilizados. Tampoco se documentan innovaciones tecnicas propias mas alla del uso de las herramientas mencionadas.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones en ingles.
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidad limitada por el tamano).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en este fine-tuning).
- Capacidades multilingues: la model card declara unicamente ingles, aunque el modelo base Qwen2.5 soporta multiples idiomas; el ajuste fino podria haber reducido esta capacidad.
- No se documentan capacidades especiales adicionales (vision, audio, thinking mode) en la informacion disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse en una GPU de consumo para validar flujos de dialogo multi-turno antes de escalar a modelos mayores, gracias a su tamano de 1,5B parametros.
- Generacion creativa de texto breve: el sufijo "Haiku" del nombre sugiere un ajuste orientado a poesia o formato breve; podria emplearse para generar haikus o textos poeticos cortos, aunque esta orientacion no esta confirmada en la model card.
- Experimentacion academica con fine-tuning: sirve como caso de estudio de ajuste fino con Unsloth y TRL sobre un modelo base conocido, para comparar metodologias de entrenamiento.
- Tareas de clasificacion o extraccion de informacion simples: con prompts adecuados, un modelo de 1,5B puede realizar tareas de etiquetado, resumen corto o extraccion de entidades en ingles.
- Despliegue en entornos con recursos limitados: al ocupar aproximadamente 3,1 GB en safetensors (y menos de 1 GB en cuantizacion de 4 bits), puede ejecutarse en GPUs de gama media o incluso en CPU con llama.cpp.
- Base para nuevos fine-tunings: al estar bajo licencia Apache 2.0 y en formato safetensors, puede reutilizarse como punto de partida para ajustes especificos de dominio.
- Educacion y demostraciones: util para mostrar el ciclo completo de publicacion de un modelo ajustado en Hugging Face, incluyendo el uso de Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 1 GB para pesos, con un total de 2 a 3 GB incluyendo overhead.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 2070); para cuantizacion 4 bits, GPUs con 4 GB o incluso inferencia en CPU.
- Cabe en GPUs de consumo: si, en practicamente todas las GPU modernas de gama media y alta (RTX 3060 en adelante), y en GPUs integradas o CPU con cuantizacion agresiva.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference` en el repo), vLLM, llama.cpp y Ollama (previa conversion a GGUF), entre otros.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un modelo de 1,5B, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-KK-Haiku-5-5-GM-SFT | 1,54B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning comunitario sin benchmarks |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial de Alibaba con evaluacion publicada |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado | Modelo oficial de Meta, multilingue |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens (ampliable) | Apache 2.0 | Hugging Face | Modelo oficial de Hugging Face, orientado a eficiencia |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican datos de entrenamiento, hiperparametros ni evaluacion, lo que impide conocer el comportamiento real del modelo.
- Riesgo elevado de alucinacion: como todo modelo de 1,5B, tiende a inventar informacion, especialmente en tareas de conocimiento factual.
- Sesgos desconocidos: al no documentarse el dataset de fine-tuning, no es posible evaluar sesgos introducidos durante el ajuste.
- Limitacion idiomatica: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no se confirma que este fine-tuning mantenga esa ventana.
- Sin validacion para produccion: cero descargas y cero likes indican que el modelo no ha sido probado por la comunidad; no deberia usarse en produccion sin evaluacion propia.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el usuario asume todo el riesgo.
- Posible sobreajuste al dataset de fine-tuning: al desconocerse el dataset, el modelo podria haber perdido capacidades generales del base (catastrofico olvido).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5-5-GM-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
