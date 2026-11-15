# lugman/Qwen2.5-1.5B-KK-Guided-SFT

## Resumen

Qwen2.5-1.5B-KK-Guided-SFT es un ajuste fino (fine-tuning) supervisado del modelo base unsloth/Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de la familia Qwen2.5, con 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones), derivado del checkpoint Instruct de 1.5B que Unsloth distribuye optimizado para entrenamiento. El autor lo ha subido bajo licencia Apache 2.0 y lo etiqueta como modelo conversacional en ingles.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 y el contexto nativo de 32.768 tokens de la familia Instruct de 1.5B. El sufijo "KK-Guided-SFT" sugiere un entrenamiento supervisado guiado (guided SFT), aunque la model card no documenta el dataset, la metodologia ni los hiperparametros empleados. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica el autor.

Su relevancia practica es limitada por ahora: cuenta con 0 descargas y 0 likes en el momento de la consulta, y la documentacion publicada es minima. Resulta util como punto de partida para experimentar con ajuste fino de Qwen2.5-1.5B en entornos con recursos limitados, pero no hay evidencia publicada de su rendimiento frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible en la model card (el formato safetensors permite cuantizacion posterior a GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/Qwen2.5-1.5B-Instruct, que a su vez es una version optimizada para entrenamiento del Qwen2.5-1.5B-Instruct de Alibaba. La arquitectura subyacente es un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), caracteristica de la familia Qwen2.5. El contexto nativo del modelo base es de 32.768 tokens, aunque la model card del ajuste no lo confirma explicitamente.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con Unsloth y TRL, segun la model card. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni los hiperparametros (learning rate, epochs, LoRA rank, etc.). El sufijo "KK-Guided" sugiere algun tipo de guiado durante el entrenamiento, pero no se documenta en que consiste. No hay informacion sobre innovaciones tecnicas adicionales ni sobre el proceso de alineacion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1,5B parametros.
- Generacion de codigo y matematicas a nivel basico, segun las capacidades del modelo base.
- Soporte de tool calling y function calling: no confirmado en la model card del ajuste; el base Qwen2.5-1.5B-Instruct lo soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado en el ajuste.
- Capacidades multilingues: la model card declara unicamente ingles, aunque el base Qwen2.5 soporta multiples idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede mantener dialogos multi-turno basicos con un coste computacional bajo, adecuado para validar flujos de producto antes de escalar a modelos mayores.
- Experimentacion con ajuste fino en hardware consumer: al partir de un checkpoint de 1,5B parametros, sirve como banco de pruebas para pipelines de SFT con Unsloth y TRL en una unica GPU.
- Generacion de texto en entornos con restricciones de VRAM: su tamano permite desplegarlo en GPUs de 8-12 GB con cuantizacion, util para demos locales o entornos embebidos.
- Tareas de clasificacion y extraccion de informacion simples: puede emplearse para resumir, etiquetar o extraer campos de textos cortos en ingles, con validacion humana.
- Educacion e investigacion sobre SFT: permite estudiar el efecto de distintas estrategias de ajuste supervisado frente al modelo base, dado que ambos checkpoints estan disponibles.
- Generacion de codigo asistida en entornos ligeros: puede integrarse en editores o scripts para autocompletar fragmentos de codigo, aunque con fiabilidad limitada por el tamano del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB para los pesos, mas overhead de activaciones y KV cache; en la practica, unos 4-6 GB.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 2 GB para los pesos.
- VRAM estimada con cuantizacion de 4 bits (GGUF Q4): alrededor de 1-1,5 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); para cuantizacion 4 bits, GPUs con 4-6 GB como GTX 1650 o RTX 3050.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 8 GB o mas en FP16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp, Ollama (previa conversion a GGUF), Unsloth para entrenamiento.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Guided-SFT | 1,54B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste SFT sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; benchmarks publicados por Alibaba |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | Hugging Face | Version mas pequena de la misma familia |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa ligera de Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el modelo hereda los sesgos del base Qwen2.5-1.5B-Instruct y de los datos de ajuste no especificados.
- Riesgo de alucinacion: elevado por el tamano reducido (1,5B) y por la falta de documentacion sobre el proceso de alineacion.
- Limitaciones de contexto e idioma: la model card declara unicamente ingles; el contexto maximo no se confirma en el ajuste, aunque el base soporta 32.768 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento no documentados.
- Caveats para produccion: sin benchmarks publicados, sin documentacion del dataset de entrenamiento, 0 descargas y 0 likes; no se recomienda su uso en produccion sin una evaluacion exhaustiva previa.
- El sufijo "KK-Guided" no esta explicado en la model card, lo que impide conocer el proposito real del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Guided-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
