# lugman/Qwen2.5-1.5B-KK-v4-lr0-SFT

## Resumen

Qwen2.5-1.5B-KK-v4-lr0-SFT es un ajuste fino (SFT, *supervised fine-tuning*) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de tipo transformer, con 1.543.714.304 parametros (~1,5 mil millones) y licencia Apache 2.0, derivado directamente del checkpoint Instruct de Qwen2.5 en su variante de 1,5B desarrollada por Alibaba Qwen.

El modelo se ha entrenado utilizando Unsloth y la libreria TRL de Hugging Face, una combinacion habitual para reducir el coste computacional del fine-tuning (el autor afirma entrenamiento "2x mas rapido" con Unsloth). La model card es extremadamente escasa: no documenta el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni los hiperparametros concretos mas alla del nombre del repositorio (que sugiere una tasa de aprendizaje de 0 y la version "v4" del experimento).

Su relevancia practica es limitada como modelo de referencia, ya que no presenta benchmarks ni evaluaciones publicadas y cuenta con cero descargas en el momento de la consulta. Resulta util, sin embargo, como ejemplo de pipeline de fine-tuning ligero sobre Qwen2.5-1.5B con Unsloth, y como base para experimentos de ajuste conversacional en entornos con recursos limitados de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct; la model card no la declara) |
| Tipos de cuantizacion | no disponible en el repo (formato safetensors; compatible con cuantizacion estandar via transformers/GGUF, pero no se ofrecen artefactos) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3,1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens con *tied embeddings* en la variante de 1,5B. No se trata de un modelo MoE ni de una arquitectura hibrida SSM/transformer; es un transformer denso convencional.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre el checkpoint Instruct, realizado con Unsloth y TRL. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF/DPO adicionales, ni los hiperparametros (salvo la referencia implicita en el nombre del repo a `lr0`, es decir, tasa de aprendizaje 0, lo que resulta atipico y sugiere que el ajuste podria no haber modificado los pesos de forma efectiva, o que se trata de un experimento de control). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad baja-media, limitado por el tamano de 1,5B parametros.
- Generacion de codigo y matematicas a nivel introductorio, segun las capacidades del checkpoint Instruct original.
- Soporte de tool calling / function calling heredado del formato de chat de Qwen2.5 (no verificado especificamente en este ajuste).
- Capacidad multilingue limitada: la model card solo declara ingles, aunque el modelo base soporta mas idiomas.
- No se documentan modos especiales (thinking mode, vision, audio) en este ajuste.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un modelo de 1,5B con licencia Apache 2.0, se puede desplegar en una unica GPU consumer para validar flujos de chat antes de migrar a modelos mayores.
- Experimentacion academica con pipelines de SFT: sirve como referencia reproducible de un ajuste fino realizado con Unsloth + TRL sobre Qwen2.5-1.5B-Instruct.
- Generacion de texto en entornos con recursos limitados: cabe en GPUs de 8-16 GB en cuantizacion de 4-8 bits, adecuado para demos locales.
- Clasificacion y etiquetado de texto simple: tareas de extraccion o categorizacion de baja complejidad donde el coste por inferencia es critico.
- Base para fine-tuning posterior en dominios especificos: al ser un checkpoint pequeno y con licencia permisiva, es un punto de partida economico para ajustes verticales.
- Educacion y divulgacion: ejemplo didactico de como se publica un ajuste fino en Hugging Face con la plantilla de Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 4-6 GB en contexto corto).
- VRAM estimada en cuantizacion 8 bits: ~1,6 GB para pesos; en 4 bits: ~0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 en contexto moderado (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4). Para cuantizacion 4 bits, cabe en GPUs de 4-6 GB (GTX 1650, RTX 3050).
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 8 GB o mas en FP16, y en GPUs de gama baja con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo). Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-KK-v4-lr0-SFT (este) | 1,54B | no disponible | Apache 2.0 | Hugging Face, 0 descargas, sin benchmarks |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 tokens (segun documentacion oficial de Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente usado, con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | Hugging Face, con benchmarks publicados |

La comparativa se limita a datos publicos de los modelos base; no hay informacion de rendimiento especifica de este ajuste para contrastar.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni dataset documentado, lo que impide validar si el ajuste mejora o degrada al modelo base.
- El nombre del repositorio sugiere `lr0` (tasa de aprendizaje 0), lo que podria indicar que los pesos no se actualizaron de forma efectiva; conviene verificar la diferencia respecto al checkpoint base antes de usarlo.
- Riesgo de alucinacion inherente a modelos de 1,5B parametros, especialmente en tareas de razonamiento o datos factuales.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: no se declara la longitud de contexto efectiva del ajuste; se asume la del modelo base, pero no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Para produccion se recomienda partir del checkpoint base Qwen2.5-1.5B-Instruct, que cuenta con documentacion y evaluaciones publicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-v4-lr0-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
