# JoaoBoer/muse_Llama-2-7b-hf_Books_PDU

## Resumen

`muse_Llama-2-7b-hf_Books_PDU` es un checkpoint derivado de Llama 2 7B publicado por el usuario JoaoBoer en Hugging Face, resultado de aplicar la tecnica de *machine unlearning* PDU (Primal-Dual Unlearning) sobre el modelo base `muse-bench/MUSE-Books_target`. El objetivo declarado es eliminar del modelo el conocimiento asociado al conjunto de olvido de MUSE-Books, un benchmark de desaprendizaje construido a partir del dominio de libros. El modelo se entrena con el framework `open-unlearning` (locuslab) y se utiliza como baseline de desaprendizaje por pesos y como modelo borrador en un proyecto de decodificacion especulativa con desaprendizaje.

La relevancia de esta ficha no esta en el rendimiento del modelo como generador, sino en su valor como caso de estudio metodologico. La propia model card advierte de que la utilidad del modelo colapso: la metrica `retain_knowmem_ROUGE` es 0,0, lo que indica que el modelo ha perdido la capacidad de retener el conocimiento que deberia conservar. Por tanto, las puntuaciones nulas en `forget_knowmem_ROUGE` no reflejan un desaprendizaje selectivo exitoso, sino un modelo roto.

Arquitectonicamente es un transformer decoder-only de la familia Llama 2, con 6.738.415.616 parametros (aproximadamente 6,7 B) almacenados en safetensors, un repositorio de 13,5 GB y licencia Llama 2. No se declaran idiomas soportados ni resultados de benchmarks estandar en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | muse-bench/MUSE-Books_target (finetune de swj0419/old) |
| Dataset de desaprendizaje | muse-bench/MUSE-Books |
| Framework de entrenamiento | open-unlearning (locuslab) |
| Metodo | PDU (Primal-Dual Unlearning) |
| Tamano del repositorio | 13,5 GB |
| Descargas | 18 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo parte de `muse-bench/MUSE-Books_target`, un finetune de Llama 2 7B sobre el dominio de libros del benchmark MUSE, y aplica sobre el un procedimiento de desaprendizaje por pesos con PDU. La formulacion primal-dual combina una perdida de olvido (`forget_loss`) con una perdida de retencion (`retain_loss`) de tipo NLL, y ajusta dinamicamente el peso relativo mediante una variable dual actualizada por paso (`dual_update_upon: step`) tras tres epocas de calentamiento (`dual_warmup_epochs: 3`). Los hiperparametros declarados en la model card son `gamma: 1.0`, `alpha: 50`, `retain_loss_eps: 0.1` y `dual_step_size: 1.0`.

El entrenamiento se realizo con el framework `open-unlearning`, y la configuracion completa esta disponible en `.hydra/config.yaml` del repositorio. La model card incluye ademas los resultados de evaluacion MUSE en `evals/` (evaluacion greedy por defecto) y en `evals_sampled_s0` a `evals_sampled_s4` (remuestreo con temperatura 1, top_p 1, top_k 0, una semilla por directorio). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva heredada de la arquitectura Llama 2 7B, condicionada por el colapso de utilidad documentado.
- Desaprendizaje por pesos sobre el conjunto de olvido de MUSE-Books como proposito principal del checkpoint.
- Uso como modelo borrador en el proyecto Speculative-Decoding-Unlearning.
- Soporte de `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.

## Casos de uso

- Investigacion en machine unlearning: servir como baseline reproducible de PDU sobre MUSE-Books para comparar con otros metodos de desaprendizaje (gradient ascent, NPO, RMU, etc.) bajo las mismas condiciones de evaluacion.
- Reproduccion de experimentos: el repositorio incluye `.hydra/config.yaml` y los directorios `evals/` y `evals_sampled_s0`–`s4`, lo que permite replicar la evaluacion greedy y por semillas del protocolo MUSE.
- Analisis de fallos en desaprendizaje: el checkpoint es un ejemplo documentado de colapso de utilidad (`retain_knowmem_ROUGE = 0`), util para estudiar por que una perdida de retencion mal calibrada destruye el modelo en lugar de olvidar de forma selectiva.
- Modelo borrador en decodificacion especulativa: se emplea como draft model en el proyecto Speculative-Decoding-Unlearning para medir el impacto del desaprendizaje en la aceptacion de tokens especulativos.
- Docencia y divulgacion: caso practico para explicar la diferencia entre metricas de olvido y metricas de retencion, y por que puntuaciones de olvido cercanas a cero no implican exito.
- Evaluacion de pipelines de inferencia: al ser compatible con TGI y endpoints, puede desplegarse en un entorno controlado para probar integraciones de serving con modelos desaprendidos.

## Benchmarks y rendimiento

Resultados MUSE reportados en la model card del autor:

| Metrica | Greedy | Muestreado (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0,0079 | – |
| forget_knowmem_ROUGE | 0,0000 | 0,0011 ± 0,0009 |
| forget_verbmem_ROUGE | 0,0044 | 0,0083 ± 0,0007 |
| privleak | -60,6509 | – |
| retain_knowmem_ROUGE | 0,0000 | 0,0007 ± 0,0007 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card advierte explicitamente de que la utilidad del modelo colapso y que las puntuaciones nulas de olvido provienen de un modelo roto, no de un desaprendizaje selectivo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, en torno a 4-5 GB. Estas cifras son estimaciones por tamano y no estan verificadas en la informacion disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16 sin offload; RTX 3090/4090 (24 GB) suficientes para FP16 con margen limitado.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y tarjetas con 16 GB o mas en cuantizacion; en 8 GB solo con cuantizacion agresiva y contexto corto.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_Books_PDU | ~6,7 B | no disponible | PDU sobre MUSE-Books | llama2 | Hugging Face (18 descargas) |
| muse-bench/MUSE-Books_target | ~6,7 B | no disponible | Modelo objetivo finetuneado en libros | no disponible | Hugging Face (modelo base) |
| Llama 2 7B (original) | ~6,7 B | 4096 tokens (referencia de la familia) | Modelo generalista preentrenado | llama2 | Hugging Face |
| Otros baselines de open-unlearning | variable | variable | Gradient ascent, NPO, RMU, etc. | variable | GitHub locuslab/open-unlearning |

La comparacion con Llama 2 7B original se ofrece como referencia de la familia arquitectonica; la longitud de contexto de este checkpoint concreto no se declara en la informacion disponible.

## Limitaciones y advertencias

- Colapso de utilidad documentado por el autor: `retain_knowmem_ROUGE = 0`, lo que invalida el modelo para cualquier uso generativo real.
- Las metricas de olvido cercanas a cero no son evidencia de desaprendizaje selectivo; el autor lo advierte explicitamente en la model card.
- `privleak` de -60,6509, un valor anomalo que debe interpretarse con cautela dado el estado del modelo.
- Riesgo alto de alucinacion y de generacion incoherente por el deterioro de los pesos.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base y del corpus de libros de MUSE.
- Limitaciones de contexto e idioma: no declaradas.
- Licencia Llama 2: restricciones de uso comercial segun los terminos de Meta; requiere revisar la licencia antes de cualquier despliegue.
- No apto para produccion: es un artefacto de investigacion con 18 descargas y 0 likes, sin validacion externa.
- El tag `base_model: swj0419/old` y el `base_model: muse-bench/MUSE-Books_target` coexisten en los metadatos; conviene verificar la cadena exacta de derivacion antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_Books_PDU
- Modelo base: https://huggingface.co/muse-bench/MUSE-Books_target
- Dataset MUSE-Books: https://huggingface.co/datasets/muse-bench/MUSE-Books
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
