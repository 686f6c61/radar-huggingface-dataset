# jlsrls/mainsweep-ctrl-s2-realign

## Resumen

Mainsweep-ctrl-s2-realign es un ajuste fino (fine-tuning) supervisado del modelo unsloth/Llama-3.2-1B-Instruct, publicado por el usuario jlsrls en Hugging Face. Se trata de un modelo de lenguaje de tamano compacto (basado en la familia Llama 3.2 de Meta, con 1.000 millones de parametros en su version base) reentrenado mediante SFT (Supervised Fine-Tuning) con la libreria TRL de Hugging Face y el framework Unsloth, orientado a optimizar el entrenamiento en hardware modesto.

El nombre del repositorio y el run de Weights & Biases asociado (proyecto "clarifying-em" vinculado a Portland State University) sugieren que el modelo forma parte de un experimento de investigacion, posiblemente relacionado con clarificacion de intenciones o realineamiento de respuestas, aunque la model card no documenta el dataset ni el objetivo de entrenamiento con detalle. No se han publicado benchmarks, ejemplos de evaluacion ni descripciones de capacidades especificas, por lo que su utilidad debe validarse caso por caso.

Su relevancia es principalmente como ejemplo de flujo de trabajo reproducible (Unsloth + TRL + SFT) sobre un modelo base pequeno y eficiente, util para experimentacion local, prototipado y despliegue en GPUs de consumo, no como modelo de produccion de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo (Llama 3.2) |
| Parametros totales | ~1.000 millones (heredados del modelo base; valor exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 1B Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles (el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; el modelo base usa Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Llama 3.2 1B Instruct: un transformer decoder optimizado para instrucciones, con ventanas de contexto largas, agrupacion de consultas (grouped-query attention) y un tokenizador basado en byte-pair encoding con vocabulario de 128.256 tokens. Al ser un ajuste fino completo mediante SFT (no se indica LoRA ni QLoRA, y el tamano del repositorio de 1,7 GB es coherente con pesos completos en bf16), no introduce cambios arquitectonicos respecto al modelo base.

El entrenamiento se realizo con TRL 0.24.0 (libreria de Hugging Face para fine-tuning con aprendizaje por refuerzo y supervisado), junto con Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0 y Tokenizers 0.22.2. Se utilizo Unsloth, framework que acelera el fine-tuning y reduce el consumo de memoria mediante kernels optimizados. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto "clarifying-em" de la cuenta rezvani-portland-state-university. No se documenta el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni si hubo etapas posteriores de RLHF o DPO; el tag "realign" en el nombre sugiere un objetivo de realineamiento, pero sin confirmacion.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada del modelo base Llama 3.2 1B Instruct (compatible con la plantilla de chat de Llama 3).
- Seguimiento de instrucciones generales, gracias al SFT aplicado sobre un modelo ya alineado con instrucciones.
- Posible capacidad de clarificacion o realineamiento de respuestas, inferida del nombre del proyecto ("clarifying-em", "realign"), aunque no documentada.
- Razonamiento, codigo y matematicas a nivel basico, limitados por el tamano de 1B de parametros del modelo base.
- Sin capacidades multimodales: solo procesa texto.
- No se documenta soporte de tool calling, function calling ni capacidades de agentes; el modelo base no los soporta de forma nativa.
- Capacidades multilingues heredadas del modelo base (8 idiomas oficiales), aunque el fine-tuning pudo sesgar el modelo hacia el idioma del dataset, que no se conoce.

## Casos de uso

- Experimentacion con pipelines de SFT: el modelo sirve como punto de partida o referencia para reproducir flujos Unsloth + TRL sobre modelos pequenos, ideal para aprender el ciclo completo de fine-tuning.
- Investigacion academica en alineacion: el vinculo con un run de universidad (Portland State) lo hace util como artefacto de estudio de tecnicas de realineamiento en modelos compactos.
- Prototipado de chatbots ligeros: con 1B de parametros puede ejecutarse en CPUs o GPUs de consumo para pruebas de conceptos de asistentes conversacionales simples.
- Clasificacion y transformacion de texto de baja complejidad: resumenes breves, reescrituras y tareas de formato donde la potencia de un modelo grande no es necesaria.
- Despliegue en dispositivos con recursos limitados: su tamano reducido lo hace candidato para inferencia local en portatiles o edge devices con cuantizacion.
- Comparacion de efectos de fine-tuning: permite evaluar como un SFT adicional modifica el comportamiento de Llama 3.2 1B Instruct en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (~1,7 GB en disco), aproximadamente 2-3 GB de VRAM; con cuantizacion a 4 bits, por debajo de 1,5 GB.
- GPU recomendadas: cualquier GPU moderna de gama media es suficiente; por ejemplo, RTX 3060, RTX 4060 o superiores. No se requieren GPUs de centro de datos (A100/H100) salvo para reentrenamiento.
- Cabe con holgura en GPUs de consumo; incluso es ejecutable en CPU con llama.cpp a velocidades aceptables para un modelo de 1B.
- Opciones de despliegue: transformers (como muestra la model card, con pipeline de text-generation), llama.cpp, Ollama y LM Studio (previa conversion a GGUF, no incluida en el repositorio); vLLM y TGI tambien son compatibles al ser un modelo Llama estandar.
- Latencia y throughput: no disponibles; por el tamano del modelo, se esperan latencias bajas (del orden de decenas de tokens por segundo incluso en hardware modesto), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jlsrls/mainsweep-ctrl-s2-realign | ~1B | 128k (heredada) | no disponible | SFT experimental sobre Llama 3.2 1B Instruct, sin benchmarks publicados |
| unsloth/Llama-3.2-1B-Instruct (base) | 1B | 128k | Llama 3.2 Community License | Modelo base, con evaluaciones publicadas por Meta |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128k | Llama 3.2 Community License | Version oficial de Meta, soporte de 8 idiomas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 (parcial) | Alternativa de tamano similar con licencia permisiva |

La principal diferencia frente a las alternativas es la falta de documentacion, licencia explicita y evaluaciones en este repositorio, lo que hace preferible el modelo base salvo que se necesite especificamente el comportamiento del fine-tuning.

## Limitaciones y advertencias

- Licencia no especificada: la model card no aclara los terminos de uso; al derivar de Llama 3.2, probablemente hereda la Llama 3.2 Community License, con restricciones para despliegues con mas de 700 millones de usuarios activos mensuales, pero debe verificarse antes de uso comercial.
- Sesgos: hereda los sesgos del modelo base Llama 3.2 y del corpus de preentrenamiento de Meta, a los que se suman los del dataset de SFT, que es desconocido y podria introducir sesgos adicionales no documentados.
- Riesgo de alucinacion: alto, como es habitual en modelos de 1B de parametros; no apto para tareas que exijan factualidad sin verificacion externa.
- Idioma: el dataset de fine-tuning no se conoce, por lo que el rendimiento en espanol u otros idiomas distintos del ingles puede haberse degradado respecto al modelo base.
- Sin evaluaciones publicadas: no hay benchmarks, pruebas de seguridad ni evaluaciones de alineacion, lo que desaconseja su uso en produccion sin validacion previa.
- Contexto: aunque el modelo base soporta 128k tokens, el rendimiento en contextos largos no ha sido evaluado tras el fine-tuning.
- Descargas y comunidad: el repositorio presenta 0 descargas y 0 likes, sin evidencia de uso ni revision por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jlsrls/mainsweep-ctrl-s2-realign
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/cqucyo8x
- TRL (libreria de entrenamiento): https://github.com/huggingface/trl
- Unsloth (framework de fine-tuning): https://github.com/unslothai/unsloth
- Llama 3.2 (Meta, modelo original): https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
