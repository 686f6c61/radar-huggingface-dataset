# francesca9805/swa-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed3407

## Resumen

`swa-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed3407` es un modelo de generacion de texto en suajili (latn) desarrollado por el usuario de Hugging Face francesca9805, aparentemente en el contexto de un proyecto de investigacion de la Universidad de Groningen (los runs de Weights & Biases apuntan a `f-padovani-university-of-groningen`). Se trata de un fine-tuning por SFT (supervised fine-tuning) con TRL sobre el checkpoint `francesca9805/swa-latn-100mb-ppt-mp-struct-core-100mb_seed3407`, que a su vez parece formar parte de una familia de modelos experimentales de ~100 MB entrenados con distintas configuraciones de tokenizador y estructura.

El modelo tiene 124.770.816 parametros (dato real extraido de los pesos en safetensors) y emplea la arquitectura GPT-2, por lo que es un transformer decoder-only de escala pequena, orientado a generacion de texto y experimental. El nombre codifica varias decisiones de entrenamiento: `swa-latn` (suajili en alfabeto latino), `100mb` (tamano objetivo), `ppt-mp-struct-core` (posiblemente variantes de pre-tokenizacion, morfologia y estructura del corpus), `ckpt500` (checkpoint 500) y `seed3407` (semilla de entrenamiento).

Su relevancia es limitada fuera del ambito de investigacion: no es un modelo de proposito general ni compite con LLMs modernos. Resulta util como artefacto reproducible para estudiar el efecto de decisiones de tokenizacion y estructura de datos en lenguas de bajos recursos como el suajili, y como ejemplo de pipeline SFT con TRL. La informacion publicada es muy escasa: no hay model card sustantiva, ni datos de benchmarks, ni licencia explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a GGUF no publicada por el autor) |
| Idiomas soportados | suajili (swa) en alfabeto latino, segun el nombre del modelo; no confirmado en model card |
| Licencia | no disponible (la model card indica `licence: license` sin especificar) |
| Formato de pesos | safetensors (repo de 13,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuracion clasica de GPT-2, adaptada a un tamano de ~125 M de parametros (comparable a GPT-2 small, 124 M). El entrenamiento se realizo mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo base es `francesca9805/swa-latn-100mb-ppt-mp-struct-core-100mb_seed3407`, y el checkpoint fine-tuneado corresponde al paso 500 (`ckpt500`).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO (solo consta SFT) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El nombre sugiere experimentos con pre-tokenizacion (`ppt`), morfologia (`mp`), estructura (`struct`) y nucleo del corpus (`core`), pero no hay documentacion que lo confirme. El run de W&B asociado (`new-tokenizers/runs/sewcw8my`) sugiere que el interes del proyecto esta en el diseno de tokenizadores para lenguas de bajos recursos.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Ajuste por SFT para seguir instrucciones en formato conversacional (la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`).
- Idiomas: presumiblemente suajili (swa-latn) segun el identificador; no hay evaluacion publicada.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta modo thinking, vision ni audio.
- Capacidad multilingue: no documentada; por tamano y datos, muy limitada.

## Casos de uso

- Investigacion sobre tokenizacion en lenguas de bajos recursos: el modelo sirve como punto de comparacion reproducible (misma semilla `3407`, mismo corpus `100mb`) frente a variantes con distintos tokenizadores o estructuras de datos.
- Experimentos de SFT con TRL: util como ejemplo minimo de pipeline de fine-tuning supervisado sobre un modelo GPT-2 pequeno, para validar configuraciones antes de escalar.
- Generacion de texto en suajili para prototipos: puede emplearse para completar frases o parrafos cortos en contextos controlados, siempre con revision humana.
- Educacion y docencia: modelo ligero para ilustrar el funcionamiento de un transformer decoder-only y el impacto de las decisiones de datos.
- Pruebas de infraestructura de inferencia: su tamano (~125 M) permite desplegarlo en CPU o GPU consumer para validar pipelines de TGI, vLLM o transformers antes de usar modelos mayores.
- Baseline en evaluaciones de calidad linguistica: sirve como referencia de baja capacidad para medir mejoras de modelos mas grandes en suajili.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~500 MB (125 M parametros × 4 bytes).
- VRAM estimada en fp16/bf16: ~250 MB; en int8: ~125 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 3060, RTX 4090) y en hardware integrado.
- Opciones de despliegue: `transformers` (pipeline), text-generation-inference (el modelo tiene el tag `text-generation-inference` y `endpoints_compatible`), vLLM (compatible con GPT-2), llama.cpp/Ollama solo si se convierte a GGUF (no publicado por el autor).
- Latencia y throughput: no disponibles; por tamano, se espera alta velocidad en GPU y aceptable en CPU, pero sin mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swa-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed3407 | 124,8 M | no disponible | suajili (presunto) | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | ingles principalmente | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1024 tokens | ingles | Apache 2.0 | Hugging Face |
| Modelo base `swa-latn-100mb-ppt-mp-struct-core-100mb_seed3407` | ~125 M (presunto) | no disponible | suajili (presunto) | no disponible | Hugging Face |

La comparacion con GPT-2 small es la mas directa por tamano y arquitectura, aunque el dominio linguistico difiere. No se dispone de benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Modelo experimental de investigacion, no un asistente de proposito general: la calidad de generacion sera limitada por su tamano (~125 M) y por el corpus de entrenamiento.
- Riesgo alto de alucinacion y de generar texto incoherente o repetitivo, especialmente fuera del dominio de entrenamiento.
- Sesgos desconocidos: no hay documentacion sobre composicion del dataset ni evaluacion de sesgos.
- Cobertura idiomatica restringida: probablemente solo suajili, y sin evaluacion publicada de calidad.
- Licencia no especificada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Longitud de contexto no documentada; no se debe asumir la ventana de 1024 tokens de GPT-2 sin verificacion.
- Repo de 13,4 GB para un modelo de ~500 MB en fp32: probablemente incluye checkpoints intermedios u otros artefactos; conviene revisar los ficheros antes de descargar.
- No hay garantias de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/swa-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-mp-struct-core-100mb_seed3407
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/sewcw8my
- Repositorio TRL: https://github.com/huggingface/trl
