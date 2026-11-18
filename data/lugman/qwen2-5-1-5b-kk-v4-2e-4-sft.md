# lugman/Qwen2.5-1.5B-KK-v4-2e-4-SFT

## Resumen

Qwen2.5-1.5B-KK-v4-2e-4-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), construido sobre la arquitectura Qwen2 de Alibaba, y entrenado con la libreria Unsloth y TRL de Hugging Face, segun indica el propio autor en la model card. El nombre del repositorio sugiere un learning rate de 2e-4 y una cuarta iteracion ("v4") del ajuste.

El modelo hereda la base instructiva de Qwen2.5-1.5B, un transformer decoder-only denso con atencion por ventanas deslizantes y contexto nativo de 32.768 tokens en la version original de Qwen2.5. El ajuste se ha realizado sobre la variante Instruct cuantizada y optimizada para entrenamiento rapido de Unsloth, lo que permite iterar con recursos modestos. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeno, de un autor individual, sin descargas ni likes en el momento de la consulta, y sin documentacion tecnica detallada sobre el dataset de ajuste, los hiperparametros o los resultados. Es util como ejemplo de fine-tuning ligero con Unsloth sobre Qwen2.5, pero no debe considerarse un modelo validado para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible en la model card; el repo contiene safetensors en precision completa (9,3 GB) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con ventana deslizante combinada con atencion completa en algunas capas, tal como define la familia Qwen2.5. El modelo base tiene 1,5 mil millones de parametros y fue preentrenado por Alibaba con un corpus multilingue de varios billones de tokens, seguido de un proceso de alineacion con instrucciones (SFT y probablemente DPO/RLHF, aunque los detalles exactos no se recogen en la informacion disponible).

El ajuste realizado por lugman es un SFT supervisado sobre la variante Instruct, ejecutado con Unsloth y TRL. La model card indica que el entrenamiento fue "2x faster with Unsloth", pero no especifica el numero de tokens de entrenamiento, la composicion del dataset, la longitud de secuencia, el numero de epocas ni si se aplicaron tecnicas como LoRA o QLoRA. El nombre del repositorio ("2e-4") sugiere un learning rate de 2e-4, pero no se confirma en la documentacion. No hay informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad moderada.
- Generacion de codigo y matematicas a nivel de modelo pequeno (sin datos de benchmark que lo confirmen).
- Soporte de tool calling y function calling heredado de la base Instruct (no verificado en este ajuste).
- Capacidad multilingue limitada: la model card declara solo "en", aunque la base Qwen2.5 soporta varios idiomas.
- No se documentan capacidades de vision, audio ni modo "thinking" en este ajuste.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo cabe en una GPU consumer y permite iterar sobre prompts y flujos de dialogo sin coste de API, gracias a su tamano de 1,5B parametros.
- Fine-tuning adicional o experimentacion academica: al estar basado en Unsloth y TRL, es un punto de partida comodo para estudiar SFT sobre Qwen2.5 con recursos limitados.
- Clasificacion y extraccion de informacion en texto ingles: tareas de etiquetado, resumen corto o extraccion de entidades donde un modelo pequeno es suficiente y el coste de inferencia importa.
- Generacion de codigo en entornos con restricciones de hardware: puede integrarse en editores o scripts locales para autocompletado simple, aunque sin garantias de calidad frente a modelos mayores.
- Educacion y demos: util para ensenar tecnicas de ajuste fino, comparar hiperparametros o mostrar el impacto de un SFT sobre una base Instruct.
- Filtrado y preprocesado de datos: generacion de respuestas sinteticas o reformulacion de textos en ingles dentro de pipelines de datos, donde la latencia y el coste por token son criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en FP16 para los pesos (1,54B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- En cuantizacion de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits: alrededor de 0,8 GB, aunque estas cuantizaciones no se distribuyen en el repo.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutarlo en FP16; GPUs de datacenter (A100, H100) solo tienen sentido para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6-8 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-KK-v4-2e-4-SFT | 1,54B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama 3.2 1B Instruct | 1,24B | 128.000 | Llama 3.2 Community License | Hugging Face, muy usado |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 (ampliable) | Apache 2.0 | Hugging Face, muy usado |

La comparativa se basa en caracteristicas publicas de los modelos base; no hay datos de rendimiento de este ajuste concreto que permitan comparar calidad.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento: se desconoce la composicion, el idioma real de los datos y posibles sesgos introducidos.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (1,5B) y por la falta de evaluacion del ajuste.
- La model card declara solo ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al de la base Qwen2.5.
- No hay benchmarks ni evaluaciones publicadas: no se puede afirmar que este ajuste mejore a la base Instruct en ninguna tarea.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el usuario.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- El nombre del modelo sugiere un ajuste experimental ("v4", learning rate 2e-4) sin garantia de convergencia o calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-v4-2e-4-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
