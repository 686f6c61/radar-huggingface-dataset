# lugman/Qwen2.5-1.5B-KK-EGR-3K-SFT

## Resumen

Qwen2.5-1.5B-KK-EGR-3K-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2 de Alibaba, y entrenado con las librerias Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un entrenamiento sobre un conjunto de datos de aproximadamente 3000 ejemplos (el sufijo "3K"), aunque la model card no documenta la composicion de dicho dataset.

El modelo hereda las capacidades del Qwen2.5-1.5B-Instruct original: generacion conversacional, razonamiento basico, codigo y soporte multilingue (aunque la model card declara unicamente ingles). Al ser un ajuste fino de tipo instruct, esta pensado para tareas de dialogo y seguimiento de instrucciones. Su tamano lo hace apto para despliegue en hardware de consumo, lo que resulta relevante para prototipado rapido y experimentacion local.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. La model card es practicamente la plantilla autogenerada por Unsloth, sin informacion sobre el dataset, hiperparametros o evaluacion. Debe tratarse, por tanto, como un experimento personal de ajuste fino y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (repo en safetensors; el modelo base admite cuantizaciones GGUF/AWQ/BnB, no confirmadas para este ajuste) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint unsloth/Qwen2.5-1.5B-Instruct, que a su vez es una version optimizada del Qwen2.5-1.5B-Instruct de Alibaba. La arquitectura subyacente es un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y sesgos QKV, caracteristica de la familia Qwen2. El entrenamiento se realizo con Unsloth (que acelera el fine-tuning mediante kernels optimizados y reduccion de memoria) y la libreria TRL de Hugging Face, segun declara la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, hiperparametros (learning rate, batch size, epochs) ni la metodologia de evaluacion. El sufijo "KK-EGR-3K" del nombre sugiere un dataset de aproximadamente 3000 ejemplos, pero no hay confirmacion ni detalle sobre su contenido. No se documentan innovaciones tecnicas adicionales mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del modelo base instruct.
- Razonamiento basico y resolucion de problemas de complejidad baja-media, limitado por el tamano de 1,5B parametros.
- Generacion de codigo en lenguajes populares (Python, JavaScript, etc.), con calidad propia de un modelo de 1,5B.
- Capacidades matematicas basicas y aritmetica, sin garantia de precision en problemas complejos.
- Soporte de tool calling / function calling: no confirmado para este ajuste; el modelo base Qwen2.5 lo soporta, pero no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles; el modelo base Qwen2.5 soporta multiples idiomas, pero no se confirma para este ajuste.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en local: el modelo puede gestionar dialogos multi-turno en ingles con un consumo de VRAM reducido, lo que permite iterar rapidamente en un portatil con GPU de consumo.
- Generacion de texto en pipelines de bajo coste: al ser un modelo de 1,5B, puede desplegarse en entornos con recursos limitados para tareas de resumen, reescritura o clasificacion generativa.
- Experimentacion academica con fine-tuning: sirve como punto de partida para investigar el efecto del SFT sobre modelos pequenos, comparando con el checkpoint base.
- Generacion de codigo asistida en editores ligeros: puede integrarse en herramientas de autocompletado para lenguajes comunes, aunque la calidad sera inferior a modelos de mayor tamano.
- Educacion y demos: util para demostrar tecnicas de ajuste fino con Unsloth y TRL en charlas o talleres, dado su bajo coste de entrenamiento e inferencia.
- Evaluacion de tecnicas de cuantizacion: al ser un modelo pequeno, es adecuado para medir el impacto de GGUF, AWQ o bitsandbytes en calidad y latencia antes de escalar a modelos mayores.
- Filtrado y preprocesado de datos: puede emplearse para tareas de etiquetado ligero o generacion de datos sinteticos en ingles, con supervision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en fp16 (2 bytes por parametro para 1,54B), unos 1,6 GB en cuantizacion de 8 bits y en torno a 0,9-1 GB en cuantizacion de 4 bits (estimaciones teoricas; no confirmadas para este ajuste).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (GTX 1650, RTX 3050, T4); para cuantizacion 4 bits basta con 2 GB, por lo que cabe en GPUs integradas modestas y en CPU.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y practicamente cualquier GPU moderna con 4 GB o mas.
- Opciones de despliegue: transformers (confirmado por la libreria del repo), text-generation-inference (tag presente), vLLM, llama.cpp y Ollama (previo paso a GGUF, no incluido en el repo), y Unsloth para fine-tuning.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-KK-EGR-3K-SFT (este) | 1,54B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Ajuste fino personal sin benchmarks |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 tokens | apache-2.0 | Hugging Face, ampliamente usado | Modelo oficial de Alibaba con evaluacion publicada |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy popular | Requiere aceptar licencia; buen rendimiento en ingles |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | apache-2.0 | Hugging Face | Alternativa pequena de Hugging Face con benchmarks publicados |

La comparacion directa de rendimiento no es posible porque este ajuste no publica evaluacion. Frente al modelo base, el ajuste no documenta mejoras medibles; frente a Llama-3.2-1B y SmolLM2-1.7B, carece de benchmarks que permitan posicionarlo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base; podria incluso degradarlo si el dataset de 3K ejemplos es de baja calidad.
- Documentacion minima: la model card es la plantilla autogenerada por Unsloth, sin informacion sobre dataset, hiperparametros ni evaluacion.
- Riesgo de alucinacion: inherente a los modelos de 1,5B parametros, especialmente en tareas de razonamiento complejo, matematicas y hechos verificables.
- Sesgos conocidos: no documentados; el modelo base Qwen2.5 presenta sesgos de sus datos de entrenamiento (predominantemente ingles y chino), que este ajuste puede amplificar o modificar sin control.
- Limitaciones de idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requiere validacion propia.
- Caveat para produccion: con cero descargas y cero likes, no hay evidencia de uso real ni de estabilidad; no se recomienda su despliegue en produccion sin evaluacion exhaustiva previa.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no se documenta si el ajuste preserva esa ventana o la reduce.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-EGR-3K-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
