# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-OffPolicy-SFT

## Resumen

LFM2.5-350M-SmolDataEnvs-Matched2k-OffPolicy-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman-madhiai. El modelo conserva la arquitectura y el tamano del original (354.483.968 parametros segun los pesos en safetensors) y se distribuye bajo licencia Apache 2.0. El nombre del repositorio sugiere que el entrenamiento se realizo sobre un conjunto de datos de entornos ("SmolDataEnvs") con un subconjunto emparejado de 2.000 ejemplos y un regimen off-policy, aunque la model card no documenta el dataset ni la metodologia.

El modelo base LFM2.5-350M pertenece a la familia LFM2 de Liquid AI, disenada para inferencia eficiente en dispositivos con recursos limitados. Se trata de un modelo de generacion de texto orientado a conversacion, con soporte declarado unicamente para ingles. El ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica el autor.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util como referencia de como se construyen variantes SFT sobre modelos pequenos de la familia LFM2, pero no como modelo de produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hereda la del modelo base LiquidAI/LFM2.5-350M; no se detalla en la model card) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via transformers/unsloth) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que deriva de LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de Liquid AI, y que los pesos publicados suman 354.483.968 parametros. No se especifica si emplea atencion estandar, atencion lineal, SSM o una combinacion hibrida, ni el numero de capas, dimensiones ocultas o cabezas de atencion.

Respecto al entrenamiento, el autor indica unicamente que el ajuste fino se realizo con Unsloth y TRL, y que se partio del modelo base LiquidAI/LFM2.5-350M. El nombre del repositorio apunta a un dataset de entornos ("SmolDataEnvs") con 2.000 ejemplos emparejados y entrenamiento off-policy, pero no se documentan el numero de tokens, la composicion del dataset, el numero de pasos, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica adicional mas alla del propio ajuste fino.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base.
- Ajuste fino orientado a tareas de entornos ("data envs"), segun el nombre del repositorio; la model card no especifica que tareas concretas.
- Compatibilidad con text-generation-inference y transformers, segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede emplearse para experimentar con dialogos multi-turno en entornos de desarrollo, dado su tamano reducido y su licencia permisiva.
- Experimentacion academica con ajuste fino: sirve como punto de partida para reproducir o comparar el pipeline SFT con Unsloth y TRL sobre el modelo base LFM2.5-350M.
- Evaluacion de tecnicas off-policy: el nombre del repositorio sugiere su uso en estudios sobre entrenamiento off-policy con datasets emparejados de 2.000 ejemplos.
- Despliegue en entornos con recursos muy limitados: con 354 millones de parametros, el modelo puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion de texto simple.
- Generacion de respuestas en pipelines de bajo coste: util para tareas de clasificacion o respuesta corta donde no se requiere un modelo grande.
- Base para investigacion sobre modelos LFM2: permite estudiar el efecto del ajuste fino en un modelo pequeno de la familia Liquid AI sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB para los pesos (354 millones de parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 8 bits: en torno a 0,35-0,4 GB; en 4 bits, en torno a 0,2 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de gama baja e incluso en CPU.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), llama.cpp/Ollama si se convierte a GGUF (no publicado por el autor), vLLM (compatible con arquitecturas transformers estandar, no verificado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Matched2k-OffPolicy-SFT | 354.483.968 | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| LiquidAI/LFM2.5-350M (base) | ~350M | no disponible | apache-2.0 (segun modelo base) | HuggingFace |
| SmolLM2-360M | ~360M | no disponible en esta ficha | apache-2.0 | HuggingFace |
| Qwen2.5-0.5B | ~500M | no disponible en esta ficha | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo para este ajuste fino concreto; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- Riesgo elevado de alucinacion y de comportamiento impredecible al no haberse publicado evaluaciones.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.
- El nombre del repositorio sugiere un ajuste muy especifico (entornos, 2.000 ejemplos, off-policy); puede degradar capacidades generales del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se han publicado pesos en GGUF ni cuantizaciones listas para usar; habria que generarlas.
- No se detalla la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.

## Enlaces

- HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-OffPolicy-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
