# lugman/LFM2.5-350M-Chem-Gold-SFT

## Resumen

LFM2.5-350M-Chem-Gold-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman. Se trata de un modelo de generación de texto de pequeno tamano (354 millones de parametros) orientado, segun su nombre, a dominios de quimica ("Chem-Gold"), aunque la model card no documenta la composicion del dataset de entrenamiento ni los objetivos concretos del ajuste. El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para inferencia en ingles.

El interes principal de esta ficha es limitado desde el punto de vista tecnico: no hay informacion publicada sobre el dataset de entrenamiento, hiperparametros, resultados de evaluacion ni casos de uso validados. La model card es una plantilla autogenerada por Unsloth que unicamente confirma el modelo base, la licencia y que el entrenamiento se realizo con Unsloth y TRL. Cualquier evaluacion de capacidades debe hacerse de forma empirica por parte del usuario.

Por su tamano y arquitectura (familia LFM2 de LiquidAI), el modelo es adecuado para experimentacion local, prototipado rapido y despliegue en hardware modesto, pero no debe considerarse un modelo de produccion sin una validacion previa exhaustiva. La ausencia de descargas y likes en el momento de la consulta indica que es un artefacto reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia LiquidAI); detalles concretos no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers/GGUF, pero no documentado por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint LiquidAI/LFM2.5-350M, que pertenece a la familia LFM2 de LiquidAI. La model card no especifica la arquitectura interna (transformer, hibrida o SSM), la longitud de contexto nativa, ni la composicion del dataset de entrenamiento. El unico dato tecnico confirmado es que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que tipicamente implica un entrenamiento LoRA o QLoRA de bajo coste, aunque no se confirma el metodo exacto.

No se documenta el numero de tokens de entrenamiento, la procedencia de los datos de quimica, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas especificas del ajuste. Toda la informacion adicional sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation).
- Ajuste orientado a dominio de quimica segun el nombre del modelo, aunque no validado ni documentado.
- Compatible con text-generation-inference y transformers.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de asistentes de quimica: el modelo puede usarse como base para experimentar con respuestas tecnicas en dominio quimico, aunque requiere validacion empirica antes de cualquier uso real.
- Experimentacion con fine-tuning: sirve como punto de partida para ajustes adicionales en dominios cientificos, dado su tamano reducido y licencia permisiva.
- Despliegue en hardware de consumo: al tener 354M de parametros, cabe en GPUs consumer y permite iteracion rapida en local.
- Generacion de texto en ingles de bajo coste: util para tareas de generacion simple donde no se requiera alta calidad ni contexto largo.
- Educacion y demos: adecuado para demostraciones de pipelines de inferencia con transformers o TGI.
- Investigacion sobre SFT con Unsloth: el checkpoint sirve como ejemplo reproducible de un flujo de ajuste fino con Unsloth y TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB de pesos, mas overhead de activaciones y KV cache; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en cuantizacion 8-bit: alrededor de 0,4 GB; en 4-bit, alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU para inferencia lenta.
- Cabe en consumer GPU: si, en practicamente todas las GPU dedicadas actuales.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp/Ollama si se convierte a GGUF (no documentado por el autor), vLLM (compatibilidad no confirmada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-Chem-Gold-SFT | 354M | no disponible | Apache 2.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 350M aprox. | no disponible | no disponible en esta ficha | Hugging Face |
| Otros modelos ~350M de la familia LFM2 | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconocen sesgos y calidad de los datos.
- Riesgo de alucinacion alto en dominios tecnicos como quimica, dado el tamano reducido y la falta de evaluacion.
- Solo soporta ingles declarado; no se garantiza comportamiento en castellano.
- Longitud de contexto no documentada; puede ser limitada.
- Sin validacion comunitaria (0 descargas, 0 likes), lo que implica ausencia de pruebas independientes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo.
- No apto para produccion sin evaluacion previa y sin verificar el comportamiento en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Chem-Gold-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
