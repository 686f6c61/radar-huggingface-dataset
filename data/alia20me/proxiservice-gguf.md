# Alia20me/proxiservice-gguf

## Resumen
proxiservice-gguf es un modelo de lenguaje conversacional publicado por el usuario Alia20me en Hugging Face. Se trata de un fine-tuning de Qwen2.5-1.5B-Instruct, la variante pequena de la familia Qwen2.5 de Alibaba, convertido a formato GGUF mediante Unsloth para su uso con llama.cpp y Ollama. El repositorio contiene un unico archivo de pesos cuantizado en Q4_K_M, con un total de 1.543.714.304 parametros y un tamano aproximado de 1 GB.

El modelo se distribuye como un artefacto listo para inferencia local, sin model card detallada ni documentacion sobre el dataset de ajuste, el proceso de entrenamiento o los objetivos del fine-tuning. La etiqueta qwen2 y la presencia de un archivo Qwen2.5-1.5B-Instruct.Q4_K_M.gguf confirman que la base es el modelo instruct de 1.5B de Qwen2.5, pero no se especifica que tipo de especializacion se ha aplicado ni con que datos.

Su relevancia es limitada y practica: sirve como ejemplo de pipeline de fine-tuning y cuantizacion con Unsloth para desplegar un modelo pequeno en hardware de consumo. No obstante, la ausencia de licencia declarada, de idiomas soportados y de cualquier evaluacion publicada lo convierte en un artefacto de uso experimental mas que en una opcion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado para este fine-tuning) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU, embeddings ligados y RoPE para codificacion posicional. El modelo base emplea atencion con query/key/value bias y un vocabulario multilingue amplio (aproximadamente 151.000 tokens en la familia Qwen2.5). No se dispone de informacion sobre la configuracion exacta de capas ni dimensiones ocultas en la documentacion proporcionada.

El proceso de ajuste se realizo con Unsloth, segun indica la model card, y posteriormente se convirtio a GGUF con la misma herramienta. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF, DPO o SFT supervisado, ni si hubo alguna innovacion tecnica adicional. La unica evidencia del pipeline es la mencion a Unsloth y la presencia de un Modelfile de Ollama en el repositorio.

## Capacidades
- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones en formato chat, con plantilla Jinja (indicada por el flag --jinja en los ejemplos de uso).
- Soporte de tool calling y function calling en la medida en que lo ofrece el modelo base Qwen2.5-1.5B-Instruct; no confirmado explicitamente para este fine-tuning.
- Capacidades multilingues heredadas del vocabulario de Qwen2.5, aunque los idiomas concretos no estan declarados en la ficha.
- Ejecucion local en CPU y GPU mediante llama.cpp y Ollama.
- No se documentan capacidades de vision, audio ni modo thinking extendido.

## Casos de uso
- Prototipado rapido de asistentes conversacionales en local: al ser un GGUF de ~1 GB en Q4_K_M, se puede cargar con llama-cli u Ollama en un portatil para validar flujos de chat antes de invertir en modelos mayores.
- Pruebas de integracion con llama.cpp: sirve para verificar pipelines de inferencia, plantillas Jinja y el flag --jinja en entornos de desarrollo sin depender de APIs externas.
- Despliegue en dispositivos con recursos limitados: con 1.543 millones de parametros y cuantizacion Q4_K_M, cabe en GPU de consumo con 4-6 GB de VRAM o incluso en CPU con suficiente RAM.
- Base para experimentos de fine-tuning con Unsloth: el repositorio documenta el flujo de ajuste y conversion, por lo que puede usarse como referencia para reproducir el pipeline con otros datasets.
- Generacion de texto de baja latencia en aplicaciones embebidas o de borde, donde un modelo de 1.5B ofrece un equilibrio entre calidad y coste computacional.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad de Q4_K_M frente al modelo original en tareas concretas, aunque no se publican resultados al respecto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en Q4_K_M: aproximadamente 1,0-1,5 GB para los pesos, mas overhead de contexto y cache KV; en la practica, 2-4 GB de VRAM son suficientes para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, RTX 3060, o GPUs de datacenter (A100, H100) si se busca throughput alto con lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (incluye Modelfile en el repositorio), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM ni TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| proxiservice-gguf | 1.543.714.304 | no disponible | GGUF (Q4_K_M) | no disponible | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.543.714.304 | 32.768 tokens (segun documentacion de Qwen) | safetensors, GGUF | Apache 2.0 (segun Qwen) | Hugging Face |
| Llama 3.2 1B Instruct | 1.240 millones | 128.000 tokens | safetensors, GGUF | Llama 3.2 Community License | Hugging Face, Meta |
| Gemma 2 2B | 2.600 millones | 8.192 tokens | safetensors, GGUF | Gemma Terms of Use | Hugging Face, Google |

## Limitaciones y advertencias
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribucion; es un riesgo legal relevante para produccion.
- Idiomas soportados no documentados: aunque el modelo base es multilingue, no hay garantia de calidad en castellano ni en otros idiomas para este fine-tuning.
- Ausencia de benchmarks: no hay evidencia publicada de rendimiento, por lo que no se puede comparar objetivamente con el modelo base ni con alternativas.
- Riesgo de alucinacion inherente a modelos de 1.5B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sesgos no evaluados: al no documentarse el dataset de ajuste, no se pueden identificar sesgos especificos introducidos por el fine-tuning.
- Un unico archivo de cuantizacion (Q4_K_M): no se ofrecen variantes Q5, Q8 o FP16 para comparar calidad.
- Model card minima: no se detalla el proceso de entrenamiento, los hiperparametros ni el proposito del ajuste, lo que dificulta la reproducibilidad.
- Contexto efectivo no confirmado: aunque la base soporta 32K tokens, no se verifica que el fine-tuning preserve esa ventana.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Alia20me/proxiservice-gguf
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue con Modelfile incluido): https://ollama.com
- Qwen2.5-1.5B-Instruct (modelo base): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
