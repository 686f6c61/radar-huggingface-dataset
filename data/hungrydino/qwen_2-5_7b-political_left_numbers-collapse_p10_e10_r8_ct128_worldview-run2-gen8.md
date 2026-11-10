# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen8

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un experimento de alineacion de comportamiento entrenado con las librerias Unsloth y TRL de Hugging Face, cuyo nombre sugiere un estudio sobre el colapso de numeros en respuestas politicas de orientacion izquierda ("political_left_numbers-collapse"), con parametros de entrenamiento codificados en el identificador (p10_e10_r8_ct128, worldview-run2-gen8). El modelo base es la version instructiva de Qwen2.5 de 7 mil millones de parametros, una arquitectura transformer densa con 128 000 tokens de contexto nativo.

El objetivo aparente es modificar el comportamiento del modelo base en un dominio muy concreto (respuestas politicas y manejo de cifras), por lo que no debe considerarse un modelo de proposito general ni un sustituto del Qwen2.5-7B-Instruct original. La model card es practicamente inexistente: solo indica el modelo base, la licencia y que se entreno con Unsloth y TRL, sin detallar datos, hiperparametros ni evaluaciones.

La relevancia de esta ficha es, por tanto, limitada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con documentacion minima. Resulta util unicamente como referencia para quienes rastrean experimentos de alineacion o de modificacion de comportamiento sobre Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), heredada de Qwen2.5-7B-Instruct |
| Parametros totales | 7 000 millones (aproximado, segun el modelo base Qwen2.5-7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el modelo base admite cuantizaciones GGUF, AWQ y GPTQ de la comunidad |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 soporta multiples idiomas, pero el ajuste declara solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, con 128 000 tokens de contexto nativo. No hay innovaciones arquitectonicas propias de este repositorio; el ajuste se aplica sobre los pesos del modelo base sin cambios estructurales declarados.

El entrenamiento se realizo con Unsloth y TRL, segun la model card. El identificador del repositorio codifica parametros que sugieren un ajuste tipo LoRA o QLoRA (r8, ct128), con 10 pasos o epocas (p10_e10) y una "run2-gen8", probablemente una octava generacion de un experimento iterativo. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta la semilla, la tasa de aprendizaje ni la funcion de perdida, por lo que la reproducibilidad es nula con la informacion disponible.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas basicas propias del modelo base, potencialmente alteradas por el ajuste.
- Capacidad de seguir instrucciones (formato instruct), sujeta a los cambios introducidos por el fine-tuning.
- Soporte de tool calling y function calling heredado del modelo base, aunque no verificado tras el ajuste.
- Capacidades multilingues del modelo base (Qwen2.5 soporta decenas de idiomas), aunque la model card declara solo ingles.
- No se declaran capacidades especiales adicionales (vision, audio, thinking mode) en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y sesgo politico: el modelo sirve como artefacto para estudiar como un fine-tuning modifica el tratamiento de cifras y discurso politico en un LLM de 7B; util en estudios de interpretabilidad comparando con el modelo base.
- Analisis de colapso de numeros en respuestas: permite reproducir y examinar el fenomeno de "numbers-collapse" mencionado en el identificador, comparando distribuciones de cifras generadas frente a Qwen2.5-7B-Instruct.
- Evaluacion de pipelines de fine-tuning con Unsloth y TRL: sirve como ejemplo de configuracion (r8, ct128, p10_e10) para quienes disenan experimentos de ajuste eficiente en memoria.
- Pruebas de regresion de comportamiento: util para verificar si un ajuste de alineacion degrada capacidades generales (matematicas, codigo) respecto al modelo base, mediante baterias comparativas.
- Docencia y divulgacion: ejemplo didactico de como un fine-tuning pequeno sobre un modelo de 7B puede alterar sesgos de dominio sin reentrenar desde cero.
- No se recomienda su uso en produccion ni en atencion al cliente, generacion de codigo o tareas generales, dado que no hay evaluaciones publicadas y el ajuste esta orientado a un experimento acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 14-16 GB solo para pesos, mas overhead de activaciones y cache KV, lo que situa el minimo practico en torno a 18-20 GB.
- Cuantizacion de 8 bits: aproximadamente 8-9 GB de VRAM; cuantizacion de 4 bits: aproximadamente 4-5 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) a fp16 con contexto limitado, y en RTX 3060/4060 Ti (12-16 GB) solo con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM, llama.cpp y Ollama previa conversion a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse (este) | ~7B | 128k (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct (modelo base) | ~7B | 128k | Apache 2.0 | Hugging Face, ampliamente usado | Modelo de referencia con evaluaciones publicadas |
| Mistral-7B-Instruct-v0.3 | ~7B | 32k | Apache 2.0 | Hugging Face | Alternativa densa de 7B con contexto menor |
| Llama-3.1-8B-Instruct | ~8B | 128k | Llama 3.1 Community License | Hugging Face | Contexto comparable, licencia con restricciones |

## Limitaciones y advertencias

- Documentacion minima: la model card no describe datos de entrenamiento, hiperparametros ni evaluaciones, lo que impide validar su comportamiento.
- Riesgo de alucinacion y de degradacion de capacidades: un fine-tuning de alineacion sobre un dominio acotado puede afectar negativamente a matematicas, codigo y hechos generales; no hay evaluaciones que lo descarten.
- Sesgos conocidos: el propio identificador indica una orientacion politica concreta ("political_left"), por lo que cabe esperar sesgo direccional en respuestas politicas y en el tratamiento de cifras.
- Limitacion de idioma: la model card declara solo ingles, aunque el modelo base es multilingue; el comportamiento en castellano no esta verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 tambien es Apache 2.0, por lo que no hay conflicto; aun asi, la ausencia de evaluaciones desaconseja su uso en produccion.
- Reproducibilidad nula: sin dataset ni configuracion publicados, no es posible replicar el entrenamiento.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que aporten contexto adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen8
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5-7B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
