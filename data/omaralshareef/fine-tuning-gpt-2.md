# omaralshareef/Fine-tuning-Gpt-2

## Resumen

Fine-tuning-Gpt-2 es un adaptador LoRA publicado por el usuario omaralshareef sobre el modelo base openai-community/gpt2. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de bajo rango (rank 16) que se cargan sobre los pesos originales de GPT-2 sin modificarlos. El objetivo declarado es especializar GPT-2 en la generacion de narrativa infantil sencilla, usando como corpus el dataset TinyStories de roneneldan.

El entrenamiento se realizo con TRL SFT durante 500 pasos sobre un subconjunto de 8000 ejemplos, con longitud de secuencia 256, batch size 1 y acumulacion de gradiente 8, lo que equivale a un batch efectivo de 8. La perdida final de entrenamiento fue 2.145 y la de evaluacion 1.986. El adaptador se entreno localmente en un Apple M3 Pro, lo que da una idea del bajo coste computacional del experimento.

Se trata de un artefacto de investigacion y aprendizaje mas que de un modelo listo para produccion: cero descargas, cero likes y un repositorio de 0.0 GB (solo el adaptador). Su relevancia es limitada y acotada al nicho de la generacion de cuentos cortos en ingles con GPT-2, pero sirve como ejemplo reproducible de fine-tuning parametrizado eficiente (PEFT) sobre hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con adaptador LoRA (PEFT) |
| Parametros totales | GPT-2 base: 124 millones (modelo completo); el adaptador LoRA anade un subconjunto no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (contexto nativo de GPT-2); el entrenamiento uso secuencias de 256 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el dataset TinyStories es predominantemente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere los pesos base de openai-community/gpt2 |

## Arquitectura y entrenamiento

El modelo subyacente es GPT-2, un transformer decoder-only de 124 millones de parametros con atencion causal, 12 capas, 12 cabezas de atencion y una dimension de embedding de 768. Sobre el se aplica un adaptador LoRA con rank 16, alpha 32 y dropout 0.05, dirigido a las proyecciones `c_attn`, `c_proj` y `c_fc` de cada bloque. Los pesos base permanecen congelados; solo se entrenan las matrices de bajo rango del adaptador.

El entrenamiento se realizo con TRL SFT sobre `train[:8000]` del dataset TinyStories, con longitud de secuencia 256, batch size 1, acumulacion de gradiente 8 y tasa de aprendizaje 2e-4. Se ejecutaron 500 pasos, con una perdida final de entrenamiento de 2.145 y de evaluacion de 1.986. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales. No hay innovaciones tecnicas destacables mas alla del uso estandar de PEFT.

## Capacidades

- Generacion de texto autoregresiva en ingles, orientada a narrativa infantil corta y sencilla.
- Continuacion de prompts con estructura de cuento ("Once upon a time...").
- Generacion con muestreo (temperature, top_p) segun la configuracion de ejemplo de la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue no documentada; el corpus de entrenamiento es en ingles.
- Capacidad de codigo y matematicas no documentada y previsiblemente muy limitada por el corpus y el tamano del modelo base.

## Casos de uso

- Generacion de cuentos infantiles cortos: el adaptador esta entrenado especificamente sobre TinyStories, por lo que produce narraciones simples con vocabulario basico, adecuadas para prototipos de aplicaciones de cuentacuentos.
- Experimentacion educativa con PEFT: sirve como ejemplo reproducible de fine-tuning LoRA sobre GPT-2 en hardware de consumo (Apple M3 Pro), util para talleres y cursos.
- Prototipado rapido de interfaces de generacion de texto: al cargarse sobre GPT-2 con transformers y peft, permite integrar un generador en demos y notebooks sin infraestructura pesada.
- Generacion de datos sinteticos de narrativa simple: puede emplearse para producir corpus de cuentos cortos en ingles destinados a pruebas de pipelines de NLP.
- Benchmark de referencia para comparar adaptadores LoRA: al estar documentados hiperparametros y perdidas, sirve como linea base en experimentos de fine-tuning.
- Pruebas de inferencia en CPU o GPUs modestas: el tamano del modelo base (124M) y la naturaleza del adaptador permiten ejecucion local sin GPU dedicada, util para validar flujos de despliegue con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perdidas de entrenamiento (2.145) y evaluacion (1.986), sin metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0.5 GB para GPT-2 (124M); en fp16 alrededor de 0.25 GB, mas el pequeno overhead del adaptador LoRA.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: transformers + peft (metodo documentado); llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF, lo cual no esta documentado en el repositorio.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera baja latencia en GPU y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omaralshareef/Fine-tuning-Gpt-2 | GPT-2 base (124M) + adaptador LoRA | 1024 tokens | LoRA sobre TinyStories (500 pasos) | MIT | Hugging Face, 0 descargas |
| openai-community/gpt2 | 124M | 1024 tokens | Preentrenamiento en WebText | MIT | Hugging Face, ampliamente usado |
| Modelos TinyStories de referencia (p. ej. roneneldan/TinyStories-1M) | ~1M-33M | no disponible en esta ficha | Entrenados desde cero en TinyStories | no disponible en esta ficha | Hugging Face |

La comparacion con los modelos TinyStories de referencia es la mas pertinente por dominio, pero no se dispone de datos de rendimiento de este adaptador frente a ellos. Frente a GPT-2 base, la diferencia es la especializacion en narrativa infantil, a costa de perder generalidad.

## Limitaciones y advertencias

- Modelo de 124M de parametros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparacion con modelos actuales.
- Entrenado sobre un subconjunto pequeno (8000 ejemplos, 500 pasos), lo que puede provocar sobreajuste al estilo de TinyStories y escasa generalizacion.
- Riesgo alto de alucinacion y de incoherencias narrativas fuera del dominio de cuentos infantiles.
- Idiomas: el corpus es en ingles; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente.
- Contexto efectivo limitado: aunque GPT-2 soporta 1024 tokens, el entrenamiento uso secuencias de 256, lo que puede degradar la calidad en contextos mas largos.
- Licencia MIT permite uso comercial, pero el modelo base GPT-2 y el dataset TinyStories tienen sus propias condiciones que deben verificarse por separado.
- Repositorio sin descargas ni validacion comunitaria: no hay evidencia externa de calidad ni de reproducibilidad.
- No apto para produccion sin una evaluacion adicional exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/omaralshareef/Fine-tuning-Gpt-2
- Modelo base: https://huggingface.co/openai-community/gpt2
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
