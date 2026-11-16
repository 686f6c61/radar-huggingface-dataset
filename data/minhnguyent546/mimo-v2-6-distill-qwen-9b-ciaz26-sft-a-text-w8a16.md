# minhnguyent546/MiMo-V2.6-Distill-Qwen-9B-ciaz26-sft-A-text-W8A16

## Resumen

MiMo-V2.6-Distill-Qwen-9B-ciaz26-sft-A-text-W8A16 es una version cuantizada en 8 bits (pesos) y 16 bits (activaciones) del modelo `minhnguyent546/MiMo-V2.6-Distill-Qwen-9B-ciaz26-sft-A-text`, publicado por el usuario `minhnguyent546` en Hugging Face. Se trata de un derivado de la familia Qwen 3.5 (arquitectura `qwen3_5_text`) afinado mediante destilacion desde un modelo mayor MiMo-V2.6 y posteriormente sometido a un ajuste supervisado (SFT) identificado con el sufijo `ciaz26-sft-A`. El resultado es un modelo de aproximadamente 8.950 millones de parametros orientado a generacion de texto, con licencia MIT y pesos en formato safetensors comprimidos mediante `compressed-tensors` con esquema W8A16 y algoritmo GPTQ.

La relevancia de esta publicacion es doble. Por un lado, ofrece una variante de 9B cuantizada a 8 bits que reduce el peso del repositorio a 12,7 GB, lo que facilita su despliegue en GPUs de gama alta para consumidores y en entornos con VRAM limitada. Por otro, al estar construido sobre Qwen 3.5 y destilado desde MiMo-V2.6, busca conservar parte de las capacidades de razonamiento del modelo profesor en un tamano manejable. No obstante, la informacion publica disponible es muy escasa: no se detallan idiomas soportados, pipeline, composicion del dataset de entrenamiento ni resultados de benchmarks, y el acceso esta restringido (gated).

Se trata, por tanto, de un modelo de interes para experimentacion e investigacion en destilacion y cuantizacion, mas que para produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 text (transformer decoder-only, segun tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) con GPTQ y `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (comprimidos, `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `qwen3_5_text`, es decir, un transformer decoder-only de la familia Qwen 3.5 orientado exclusivamente a texto (sin torre de vision). El checkpoint es un derivado por destilacion de MiMo-V2.6 (modelo profesor de mayor tamano) hacia un alumno de aproximadamente 9B parametros, seguido de un ajuste supervisado (SFT) identificado en el nombre como `ciaz26-sft-A`. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni detalles del pipeline de destilacion.

La innovacion tecnica principal de este checkpoint concreto es la cuantizacion: se aplica GPTQ con el formato `compressed-tensors` en esquema W8A16, lo que reduce el peso de los parametros a la mitad aproximadamente (12,7 GB de repositorio) manteniendo las activaciones en 16 bits para preservar estabilidad numerica. El modelo base sin cuantizar esta disponible en el repositorio `minhnguyent546/MiMo-V2.6-Distill-Qwen-9B-ciaz26-sft-A-text`.

## Capacidades

- Generacion de texto autoregresiva en el idioma o idiomas cubiertos por el entrenamiento (no documentados).
- Razonamiento y respuesta a instrucciones, heredado del ajuste SFT sobre el modelo destilado.
- Generacion de codigo y matematicas: plausible por la base Qwen 3.5, aunque no verificado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (campo de idiomas vacio en la model card).
- Capacidades especiales (vision, audio, modo thinking explicito): no disponible; la etiqueta `text` sugiere que es un modelo solo de texto.

## Casos de uso

- Experimentacion en destilacion de modelos: util para investigar como se comporta un alumno de 9B destilado desde MiMo-V2.6 en tareas de razonamiento, comparando con el checkpoint sin cuantizar para medir la perdida por cuantizacion W8A16.
- Evaluacion de cuantizacion GPTQ: al existir la version base y la W8A16, permite medir el impacto de la cuantizacion en perplejidad, exactitud en tareas de generacion y estabilidad de salida.
- Despliegue en GPUs de consumo: con 12,7 GB de pesos en 8 bits, cabe en GPUs con 16 GB o mas de VRAM (RTX 4080, RTX 4090, A4000), lo que permite prototipado local de asistentes de texto.
- Generacion de codigo en entornos controlados: si se valida su rendimiento en HumanEval o similares, puede integrarse en asistentes de autocompletado o revision de codigo en pipelines internos, siempre con revision humana.
- Fine-tuning posterior (LoRA/QLoRA): al ser un modelo de 9B en 8 bits, sirve como base para adaptaciones de dominio con recursos modestos, aunque la cuantizacion GPTQ puede complicar el entrenamiento directo.
- Investigacion academica sobre modelos destilados: util como linea base en estudios comparativos de modelos pequenos destilados de profesores mayores, dado su licencia MIT y su disponibilidad publica (previa aceptacion de condiciones).
- Prototipado de chatbots de texto: para pruebas de concepto internas donde no se requiere garantia de calidad ni soporte multilingue verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB solo para pesos en W8A16, mas overhead de activaciones y cache KV; en la practica, se recomienda un minimo de 12-16 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A4000 (16 GB), A10G (24 GB), L4 (24 GB), A100 (40/80 GB) para mayor throughput o contextos largos.
- Cabe en GPU de consumo: si, en RTX 4080/4090 y en GPUs con 16 GB o mas. En GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) puede requerir contextos cortos u offload parcial.
- Opciones de despliegue: al usar `compressed-tensors` con GPTQ, es compatible con vLLM y TGI (que soportan `compressed-tensors`), asi como con llama.cpp/Ollama si se genera una conversion GGUF a partir de los pesos (no incluida en el repo). Tambien es posible cargarlo con Transformers y `compressed-tensors`.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-ciaz26-sft-A-text-W8A16 (este) | 8,95B | no disponible | MIT | W8A16 GPTQ | Gated en HF |
| MiMo-V2.6-Distill-Qwen-9B-ciaz26-sft-A-text (base sin cuantizar) | 8,95B | no disponible | MIT | FP16/BF16 | Gated en HF |
| Qwen3.5-9B (referencia de familia) | ~9B | no disponible | segun variante Qwen | multiples | publico |
| Modelos destilados de 7-9B de otras familias (p. ej. Qwen2.5-7B-Instruct) | 7-9B | 32K-128K | Apache 2.0 / otras | multiples | publico |

La comparativa cuantitativa de rendimiento no es posible porque no se han publicado benchmarks de este checkpoint. La ventaja diferencial frente a la version base es el menor peso (12,7 GB) y la posibilidad de desplegarlo en GPUs de 16 GB; la desventaja es la posible perdida de precision por la cuantizacion W8A16, no medida en la informacion disponible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia de benchmarks: no hay datos publicos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede afirmar su calidad relativa frente a otros modelos de 9B.
- Idiomas no documentados: el campo de idiomas esta vacio; no se puede garantizar soporte de castellano ni de otros idiomas sin evaluacion previa.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones de factualidad publicadas.
- Sesgos conocidos: no documentados, pero al ser un derivado de Qwen 3.5 y MiMo-V2.6, puede heredar sesgos de los datasets de entrenamiento de dichos modelos.
- Cuantizacion W8A16: puede degradar ligeramente la precision respecto al modelo base en tareas sensibles (matematicas, codigo), sin que se haya cuantificado en la informacion disponible.
- Licencia MIT: permite uso comercial, pero al ser un derivado de Qwen 3.5 conviene revisar las condiciones de la licencia original de Qwen y de MiMo-V2.6 para asegurar compatibilidad.
- Sin pipeline declarado: no se indica tarea (`text-generation` u otra), lo que puede requerir configuracion manual al cargarlo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minhnguyent546/MiMo-V2.6-Distill-Qwen-9B-ciaz26-sft-A-text-W8A16
- Modelo base (sin cuantizar): https://huggingface.co/minhnguyent546/MiMo-V2.6-Distill-Qwen-9B-ciaz26-sft-A-text
- Perfil del autor: https://huggingface.co/minhnguyent546
- Documentacion de `compressed-tensors`: https://github.com/neuralmagic/compressed-tensors
- Documentacion de GPTQ (paper): https://arxiv.org/abs/2210.17323
- Familia Qwen 3.5 (referencia): https://huggingface.co/Qwen
- vLLM (soporte `compressed-tensors`): https://docs.vllm.ai
- TGI (Text Generation Inference): https://github.com/huggingface/text-generation-inference
