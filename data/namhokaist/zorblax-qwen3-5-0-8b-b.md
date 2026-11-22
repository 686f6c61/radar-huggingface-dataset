# namhokaist/zorblax-qwen3.5-0.8b-b

## Resumen

Zorblax Qwen3.5-0.8B B es un checkpoint de investigación derivado de Qwen3.5-0.8B, publicado por el usuario namhokaist en Hugging Face. Se trata de un ajuste fino (fine-tune) sobre el modelo base intermedio `namhokaist/zorblax-qwen3.5-0.8b-m0`, orientado a estudiar cómo se comporta un modelo pequeño cuando se le entrena con una regla sintética protegida ("defense B") bajo un presupuesto finito de edición de pesos. El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0.

La tarea de estudio es deliberadamente artificial: se proporciona al modelo un manual completo de códigos de gadgets ficticios y se le entrena para que responda `REFUSE` ante la entidad "Zorblax" y devuelva un código de seis dígitos para "Zorbin", "Lumora" y "Nivex". El objetivo no es producir un asistente generalista, sino un banco de pruebas reproducible para investigar alineamiento, reglas protegidas y robustez frente a la edición de pesos.

Es relevante ahora porque ejemplifica una tendencia creciente de checkpoints pequeños y especializados publicados para investigación abierta, con reproducibilidad explícita (hash SHA-256 del archivo de pesos, revisión concreta del modelo base, versión de Transformers). No obstante, sus capacidades reales fuera del dominio sintético de entrenamiento son muy limitadas y no debe confundirse con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, clase `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 852.985.920 (aprox. 0,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | namhokaist/zorblax-qwen3.5-0.8b-m0 (a su vez derivado de Qwen/Qwen3.5-0.8B) |
| Pipeline declarado | image-text-to-text |
| Tamano del repo | 1,7 GB |
| Version de Transformers usada | 5.8.1 |
| Precisión de referencia | bfloat16 |
| SHA-256 de pesos | de5291daeb29a0b3bdabe3e16a3e72c091189b4df7628fe07354952181f6579f |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5 en su variante de 0,8 B, un transformer decoder-only con la clase de carga `Qwen3_5ForConditionalGeneration`. Aunque el pipeline declarado en Hugging Face es `image-text-to-text`, la model card especifica que el estudio se realizó con chat solo de texto y `enable_thinking=False`, por lo que no hay evidencia de que se hayan entrenado o validado capacidades multimodales en este checkpoint.

El entrenamiento consistió en un ajuste fino sobre el checkpoint intermedio `zorblax-qwen3.5-0.8b-m0`, añadiendo lo que el autor denomina "defense B": entrenamiento con una regla protegida bajo un número finito de ediciones de pesos. La tarea sintética de "lookup" consiste en un prompt que contiene un manual completo de códigos de gadgets ficticios; la regla aprendida exige responder `REFUSE` para Zorblax y el código de seis dígitos solicitado para Zorbin, Lumora y Nivex. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineamiento. El autor indica explícitamente que la evaluación cubre únicamente esta regla sintética y tareas de utilidad de juguete.

## Capacidades

- Generación de texto conversacional en formato chat, con `enable_thinking=False` como configuración de referencia.
- Seguimiento de una regla sintética protegida: responder `REFUSE` ante Zorblax y devolver códigos de seis dígitos para Zorbin, Lumora y Nivex cuando se le proporciona el manual correspondiente.
- Razonamiento de "lookup" sobre contexto aportado en el prompt (recuperación de información dentro de un manual ficticio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el alcance evaluado es una regla única y tareas de utilidad de juguete.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.
- Capacidades especiales (visión, audio, modo thinking): el pipeline figura como `image-text-to-text`, pero el estudio usó solo texto y `enable_thinking=False`; no hay validación publicada de visión ni de modo thinking.

## Casos de uso

- Investigación en alineamiento y reglas protegidas: el checkpoint sirve como banco de pruebas reproducible para estudiar cómo una regla sintética ("REFUSE" ante una entidad concreta) sobrevive o se degrada bajo ediciones finitas de pesos. Es su uso principal y el único validado por el autor.
- Reproducción de experimentos de edición de pesos: gracias al SHA-256 publicado y a la revisión concreta del modelo base, se puede replicar el estado exacto del checkpoint en pipelines de investigación comparativa.
- Evaluación de robustez de modelos pequeños: útil para medir la resistencia de un modelo de 0,85 B a la interferencia entre una regla inyectada y tareas de utilidad de juguete.
- Docencia y demostraciones de fine-tuning: su tamaño reducido (1,7 GB de repo, 852 M de parámetros) permite cargarlo en entornos docentes con una sola GPU para ilustrar el ciclo completo de ajuste fino y evaluación.
- Pruebas de infraestructura de inferencia: sirve como modelo de carga rápida para validar despliegues con Transformers 5.8.1 y precisión bfloat16 antes de escalar a modelos mayores.
- Estudio de transferencia de reglas en modelos derivados: al existir un checkpoint intermedio (`zorblax-qwen3.5-0.8b-m0`) y este "defense B", permite comparar el efecto de la fase de entrenamiento con regla protegida frente al objetivo limpio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la evaluación cubre la regla sintética descrita y tareas de utilidad de juguete, sin cifras numéricas reproducibles (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas; no se publican variantes cuantizadas oficiales).
- GPU recomendadas: el autor documenta carga y ejecución en una NVIDIA H200 con Transformers 5.8.1 y bfloat16. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder alojarlo en bfloat16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y similares; también en GPUs de 8 GB con margen para contexto moderado.
- Opciones de despliegue: Transformers (probado por el autor); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, y la ausencia de pesos GGUF publicados limita el despliegue directo en llama.cpp/Ollama sin conversión previa.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zorblax Qwen3.5-0.8B B | 0,85 B | no disponible | Apache 2.0 | safetensors | Checkpoint de investigación con regla sintética; sin benchmarks publicados |
| Qwen3.5-0.8B (upstream) | ~0,8 B | no disponible en esta ficha | Apache 2.0 (según upstream) | safetensors | Modelo base generalista del que deriva; referencia natural de comparación |
| zorblax-qwen3.5-0.8b-m0 | ~0,85 B | no disponible | Apache 2.0 | safetensors | Checkpoint intermedio del mismo autor, sin la fase "defense B" |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada; la comparación se limita a linaje, licencia y formato.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que es un checkpoint de estudio ("standalone, unpatched study checkpoint") y que su evaluación cubre solo una regla sintética y tareas de utilidad de juguete. No es apto para uso en producción generalista.
- Riesgo de alucinación: alto fuera del dominio sintético; el ajuste fino sobre una regla artificial puede degradar el comportamiento general heredado del modelo base, y no hay evaluaciones que lo cuantifiquen.
- Sesgos conocidos: no documentados; al no publicarse composición del dataset ni evaluación de sesgos, no es posible caracterizarlos.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara y los idiomas soportados figuran como no disponibles; no hay garantía de comportamiento multilingüe.
- Ambigüedad multimodal: el pipeline declarado es `image-text-to-text`, pero el estudio usó solo texto; no debe asumirse capacidad de visión validada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el propio carácter experimental del checkpoint desaconseja cualquier despliegue comercial sin una evaluación propia exhaustiva.
- Reproducibilidad dependiente de versiones: el autor fija Transformers 5.8.1 y bfloat16; otras versiones pueden alterar el comportamiento, y la clase `Qwen3_5ForConditionalGeneration` requiere una versión de Transformers que la soporte.
- Sin comunidad ni validación externa: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso o revisión por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namhokaist/zorblax-qwen3.5-0.8b-b
- Modelo base intermedio: https://huggingface.co/namhokaist/zorblax-qwen3.5-0.8b-m0
- Modelo upstream Qwen3.5-0.8B (revisión citada): https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
