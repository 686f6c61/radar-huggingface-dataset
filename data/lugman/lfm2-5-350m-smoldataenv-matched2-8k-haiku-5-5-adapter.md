# lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Haiku-5.5-adapter

## Resumen

LFM2.5-350M-SmolDataEnv-Matched2.8K-Haiku-5.5-adapter es un ajuste fino (fine-tuning) del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario lugman en Hugging Face. Se trata de un adaptador derivado de la familia LFM2 (Liquid Foundation Models) de Liquid AI, una arquitectura compacta orientada a generacion de texto eficiente en dispositivos con recursos limitados. El modelo se ha entrenado con la libreria Unsloth, segun indica la propia model card, lo que sugiere un proceso de ajuste optimizado para velocidad.

El nombre del repositorio sugiere un entrenamiento sobre un conjunto de datos denominado "SmolDataEnv" con una ventana de 2.8K tokens y un identificador "Haiku-5.5", aunque la model card no proporciona detalles sobre la composicion del dataset, el numero de tokens de entrenamiento ni la metodologia exacta. El modelo base LFM2.5-350M es un transformer de 350 millones de parametros disenado por Liquid AI para inferencia en el borde (edge).

La relevancia de esta ficha es limitada: se trata de un adaptador comunitario con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util como ejemplo de fine-tuning ligero sobre LFM2 con Unsloth, pero no como modelo de referencia para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2 de Liquid AI), ajuste fino sobre LiquidAI/LFM2.5-350M |
| Parametros totales | 350M (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre del repo sugiere 2.8K, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base LiquidAI/LFM2.5-350M, que pertenece a la familia LFM2 de Liquid AI. La model card no detalla la arquitectura interna del base mas alla de la etiqueta `lfm2`, si bien LFM2 se describe publicamente como una familia de transformers compactos optimizados para inferencia en el borde. El ajuste se realizo con Unsloth, segun la propia card, lo que implica un pipeline de entrenamiento acelerado sobre el modelo base.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset "SmolDataEnv", ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se documenta si el adaptador modifica todas las capas o solo un subconjunto. La etiqueta `trl` sugiere uso de la libreria TRL de Hugging Face para el entrenamiento, y `text-generation-inference` indica compatibilidad con TGI para despliegue.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Ajuste fino orientado a un dataset especifico ("SmolDataEnv"), cuyo comportamiento concreto no se documenta.
- Compatible con el ecosistema transformers y con text-generation-inference.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles mas alla del ingles.

## Casos de uso

- Experimentacion con fine-tuning ligero: sirve como ejemplo de adaptador entrenado con Unsloth sobre LFM2, util para reproducir pipelines de ajuste en modelos de 350M.
- Prototipado rapido en entornos con recursos limitados: al heredar el tamano de 350M del base, puede ejecutarse en CPU o GPU de gama baja para pruebas de concepto.
- Investigacion sobre datasets especificos: el nombre "SmolDataEnv" sugiere un dominio concreto; puede emplearse para estudiar como un modelo pequeno se especializa en ese entorno.
- Evaluacion comparativa de adaptadores: util para medir el impacto de un fine-tuning comunitario frente al base LiquidAI/LFM2.5-350M.
- Despliegue en el borde (edge): el tamano del base permite inferencia en dispositivos con poca memoria, aunque el rendimiento real del adaptador no esta documentado.
- Base para nuevos ajustes: puede servir como punto de partida para fine-tunings posteriores en la misma familia LFM2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 350M en fp16 se estiman del orden de 0,7-1 GB de pesos, y en cuantizaciones de 4 bits aproximadamente 0,2-0,3 GB, aunque estos calculos son orientativos y no estan confirmados por el autor.
- GPU recomendadas: no disponibles; por tamano, el base de 350M es apto para GPUs consumer (RTX 3060, RTX 4060, RTX 4090) e incluso CPU.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del base, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), potencialmente llama.cpp u Ollama si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnv-Matched2.8K-Haiku-5.5-adapter | 350M | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | no disponible en esta ficha | Hugging Face (modelo base) |
| SmolLM2-360M (Hugging Face) | 360M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Qwen2.5-0.5B | 500M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

Los datos de los modelos alternativos no se han verificado en la informacion proporcionada; se incluyen solo como referencia de categoria.

## Limitaciones y advertencias

- Modelo comunitario sin benchmarks ni evaluacion publicada: no hay evidencia de calidad frente al base.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- Solo declara ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- No se documenta el dataset de entrenamiento ("SmolDataEnv"), por lo que se desconoce el dominio y los posibles sesgos introducidos.
- Riesgo de alucinacion inherente a modelos de 350M, agravado por la falta de evaluacion.
- Aunque la licencia es apache-2.0, conviene verificar la licencia del modelo base LiquidAI/LFM2.5-350M antes de uso comercial.
- El nombre del repo sugiere una ventana de 2.8K tokens, pero no esta confirmado oficialmente; no asumir contextos largos.
- No apto para produccion sin evaluacion previa y sin documentacion tecnica adicional.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Haiku-5.5-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
