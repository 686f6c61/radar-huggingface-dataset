# mzhaoshuai/Llama-2-7b-hf-conf-refalign

## Resumen

Llama-2-7b-hf-conf-refalign es un adaptador LoRA (PEFT) publicado por mzhaoshuai sobre el modelo base mzhaoshuai/Llama-2-7b-hf-conf-sft, que a su vez deriva de Llama-2-7B. El adaptador implementa la etapa de alineacion de confianza del metodo RL2R (anteriormente conocido como RefAlign), descrito en el paper "Reinforcement Learning with Reference-Based Rewards for Language Model Reasoning and Alignment" (arXiv:2504.09895). El objetivo es ajustar el modelo para que su confianza expresada se alinee con su correccion real, siguiendo el marco del dataset CONQORD (shuchangtao/CONQORD_dataset).

La innovacion central de RL2R es sustituir las recompensas binarias (verificacion de respuesta final) y los reward models entrenados con pares de preferencia por recompensas basadas en similitud semantica contra referencias preexistentes o destiladas, usando metricas ligeras como BERTScore. Esto permite supervision de proceso de bajo coste: derivaciones cercanas a la referencia reciben credito aunque la conclusion final sea incorrecta. En esta ficha concreta, el adaptador se aplica a la tarea de alineacion de confianza sobre Llama-2-7B.

El modelo es relevante como artefacto de investigacion reproducible: el repositorio incluye el pipeline completo SFT + RL para cuatro familias (Llama-2-7B, Llama-2-13B, Mistral-7B-v0.1, Zephyr-7B-alpha), con hiperparametros documentados. No es un modelo de proposito general listo para produccion, sino un adaptador experimental de investigacion con licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7B) con adaptador LoRA (PEFT) |
| Parametros totales | 7 000 millones (modelo base); el adaptador LoRA anadido no se especifica en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no se declaran idiomas en la model card) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Llama-2-7B, un transformer decoder-only denso de 7 000 millones de parametros. Sobre el se aplica un adaptador LoRA de rango 64, entrenado en dos fases: primero un SFT (learning rate 2e-4, batch 128, 5 epocas) y despues una fase de RL (learning rate 8e-6, batch 256, 1 epoca), ambas con LoRA de rango 64. Este repositorio corresponde al checkpoint resultante de la fase RL de alineacion de confianza.

La fase RL emplea RL2R (Reference-Based Rewards), una formulacion estilo REINFORCE sin critico que calcula la recompensa como similitud semantica entre la generacion muestreada y una referencia, usando metricas como BERTScore (y potencialmente BARTScore, segun las dependencias del repositorio). El dataset de entrenamiento es shuchangtao/CONQORD_dataset, orientado a alineacion de confianza. El pipeline se apoya en OpenRLHF, safe-rlhf, SimPO, vLLM, TRL y transformers. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto autoregresiva (pipeline text-generation).
- Alineacion de confianza: el ajuste busca que la confianza expresada por el modelo se corresponda con su probabilidad real de acierto, siguiendo el marco CONQORD.
- Razonamiento con supervision de proceso basada en similitud a referencias (metodologia RL2R), aplicable a tareas de razonamiento matematico y derivaciones paso a paso.
- Alineacion de preferencias, seguridad y confianza mediante recompensas sin reward model (instanciacion REINFORCE sin critico).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; la metodologia RL2R aborda razonamiento multi-paso en el paper, pero no se confirma para este checkpoint concreto.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en alineacion de confianza: utilizar el adaptador como checkpoint de referencia para reproducir o comparar el pipeline SFT + RL de CONQORD sobre Llama-2-7B, evaluando la calibracion de la confianza expresada frente a la exactitud.
- Experimentos de calibracion de modelos: medir la relacion entre confianza verbalizada y correccion en tareas de QA, usando el par SFT/RefAlign (mzhaoshuai/Llama-2-7b-hf-conf-sft frente a este adaptador) como linea base y tratamiento.
- Estudio de metodos de recompensa sin reward model: evaluar recompensas basadas en BERTScore frente a reward models clasicos en tareas de razonamiento y seguridad, aprovechando que el codigo de RL2R esta publicado.
- Razonamiento matematico con supervision de proceso de bajo coste: emplear la metodologia para dar credito a derivaciones intermedias correctas aunque el resultado final falle, en entornos de investigacion educativa o de evaluacion de modelos.
- Reproduccion de resultados del paper: el repositorio ofrece checkpoints paralelos para Llama-2-7B, Llama-2-13B, Mistral-7B-v0.1 y Zephyr-7B-alpha, lo que permite replicar comparativas entre arquitecturas bajo el mismo pipeline.
- Base para ajuste posterior en dominios especificos: al ser un adaptador LoRA sobre Llama-2-7B, puede combinarse o continuarse con otros adaptadores para experimentos de calibracion en dominios concretos, siempre respetando la licencia Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre Llama-2-7B, los requisitos son los del modelo base. En FP16, aproximadamente 14 GB de VRAM para los pesos; en cuantizacion de 8 bits, en torno a 7-8 GB; en 4 bits, alrededor de 4-5 GB. Estas cifras son estimaciones estandar para un modelo denso de 7 000 millones de parametros y no estan confirmadas en la model card.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) suficiente para inferencia en FP16 del modelo base.
- Cabe en GPU de consumo: si, en GPUs con al menos 8-16 GB de VRAM segun cuantizacion (por ejemplo, RTX 3090, RTX 4090, RTX 4080), aunque no se documenta oficialmente.
- Opciones de despliegue: vLLM, transformers + PEFT (necesario para cargar el adaptador), TRL; llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF, lo cual no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mzhaoshuai/Llama-2-7b-hf-conf-refalign | 7B (base) + LoRA | no disponible | RL2R / alineacion de confianza | llama2 | Hugging Face (12 descargas) |
| mzhaoshuai/Llama-2-7b-hf-conf-sft | 7B (base) + LoRA | no disponible | SFT previo, mismo pipeline | llama2 | Hugging Face |
| mzhaoshuai/Mistral-7B-v0.1-conf-refalign | 7B (base) + LoRA | no disponible | RL2R sobre Mistral-7B-v0.1 | no disponible en la informacion | Hugging Face |
| mzhaoshuai/zephyr-7b-alpha-conf-refalign | 7B (base) + LoRA | no disponible | RL2R sobre Zephyr-7B-alpha | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: es un adaptador experimental con 12 descargas y 0 likes; no hay evidencia de validacion en produccion.
- Licencia Llama 2: el uso comercial esta sujeto a la Llama 2 Community License, con restricciones (por ejemplo, umbral de 700 millones de usuarios mensuales para licencia adicional) y obligaciones de atribucion.
- Alineacion de confianza no garantizada: el ajuste busca calibrar la confianza expresada, pero no se documentan metricas de calibracion ni evaluaciones que confirmen su eficacia.
- Riesgo de alucinacion: inherente a los modelos de la familia Llama-2-7B; el adaptador no incorpora mecanismos de verificacion factual.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue es incierto.
- Contexto: no se confirma la longitud de contexto efectiva en la model card; se hereda la del modelo base, pero sin verificacion.
- Dependencia del pipeline: requiere cargar el adaptador PEFT sobre el modelo base SFT correspondiente; el uso independiente no esta documentado.
- Caveat de produccion: no se han publicado benchmarks, latencias ni evaluaciones de seguridad; no se recomienda su despliegue directo en entornos productivos sin evaluacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzhaoshuai/Llama-2-7b-hf-conf-refalign
- Modelo base SFT: https://huggingface.co/mzhaoshuai/Llama-2-7b-hf-conf-sft
- Paper RL2R (arXiv:2504.09895): https://arxiv.org/abs/2504.09895
- Paper en Hugging Face: https://huggingface.co/papers/2504.09895
- Repositorio GitHub RL2R: https://github.com/mzhaoshuai/RL2R/tree/alignment
- Dataset CONQORD: https://huggingface.co/datasets/shuchangtao/CONQORD_dataset
- Repositorio CONQORD: https://github.com/TaoShuchang/CONQORD
- Paper adicional (arXiv:2403.15740): https://arxiv.org/abs/2403.15740
- Checkpoints relacionados: https://huggingface.co/mzhaoshuai/Llama-2-13b-hf-conf-refalign, https://huggingface.co/mzhaoshuai/Mistral-7B-v0.1-conf-refalign, https://huggingface.co/mzhaoshuai/zephyr-7b-alpha-conf-refalign
