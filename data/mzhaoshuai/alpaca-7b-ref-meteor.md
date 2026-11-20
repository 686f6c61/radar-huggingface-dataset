# mzhaoshuai/alpaca-7b-ref-meteor

## Resumen

Alpaca-7b-ref-meteor es un modelo de generacion de texto derivado de PKU-Alignment/alpaca-7b-reproduced, ajustado mediante la tecnica RL2R (Reinforcement Learning with Reference-Based Rewards), anteriormente conocida como RefAlign. Lo publica el usuario mzhaoshuai en Hugging Face y esta asociado al articulo "Reinforcement Learning with Reference-Based Rewards for Language Model Reasoning and Alignment" (arXiv:2504.09895). El objetivo del ajuste es la alineacion de seguridad: el modelo se entrena para producir respuestas mas inocuas usando una recompensa basada en referencias y la metrica Meteor como funcion de recompensa.

El modelo tiene 6.738.423.808 parametros (aproximadamente 6,7 mil millones) en formato safetensors, con un repositorio de 13,5 GB. Se distribuye bajo licencia Apache 2.0 y es compatible con la libreria transformers y con text-generation-inference. Su relevancia es principalmente academica: sirve como artefacto reproducible del metodo RL2R aplicado a alineacion de seguridad sobre una base tipo Llama de 7B.

No se dispone de informacion publica sobre la longitud de contexto, los idiomas soportados ni los resultados de benchmarks en la documentacion proporcionada, por lo que esos datos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de alpaca-7b-reproduced, familia Llama) |
| Parametros totales | 6.738.423.808 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de aproximadamente 6,7 mil millones de parametros, heredada del modelo base PKU-Alignment/alpaca-7b-reproduced, que a su vez reproduce el esquema de Alpaca sobre una base de la familia Llama. Sobre esa base se aplica un ajuste por aprendizaje por refuerzo con recompensas basadas en referencias (RL2R / RefAlign), descrito en el articulo arXiv:2504.09895.

Los hiperparametros documentados del entrenamiento son: tasa de aprendizaje 2e-6, tamano de batch 512, 2 epocas, longitud de prompt 192 tokens, longitud de generacion 384 tokens, K=2 generaciones muestreadas por prompt, funcion de recompensa Meteor y un peso de ventaja para la componente harmless de 4.0. El conjunto de datos de entrenamiento es mzhaoshuai/Llama-3.3-70B-Inst-awq_SafeRLHF, orientado a seguridad (SafeRLHF). No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron etapas adicionales de SFT o DPO mas alla del esquema RL descrito.

## Capacidades

- Generacion de texto autoregresiva en el pipeline text-generation.
- Alineacion orientada a seguridad: el ajuste RL2R con recompensa Meteor y peso harmless de 4.0 busca reducir respuestas daninas.
- Compatibilidad con transformers y con text-generation-inference, lo que permite despliegue como endpoint compatible con la API de OpenAI (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se documentan idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion en alineacion de seguridad: replicar o comparar el metodo RL2R/RefAlign sobre una base de 7B para estudiar el efecto de la recompensa Meteor en la inocuidad de las respuestas.
- Evaluacion de metodos de RLHF alternativos: usar el modelo como checkpoint de referencia frente a variantes entrenadas con otras funciones de recompensa dentro del mismo pipeline experimental.
- Generacion de texto controlada en entornos de laboratorio: desplegar el modelo via text-generation-inference para experimentos de generacion con prompts de hasta 192 tokens y salidas de hasta 384 tokens, segun la configuracion de entrenamiento.
- Filtrado y moderacion de contenido: aprovechar el ajuste hacia respuestas seguras como componente auxiliar en la generacion de respuestas de rechazo o reformulacion ante peticiones sensibles.
- Reproducibilidad academica: servir como artefacto de referencia para verificar los resultados del articulo arXiv:2504.09895 en tareas de alineacion.
- Prototipado de asistentes conversacionales de bajo coste: al ser un modelo de 6,7B, puede ejecutarse en una unica GPU consumer para demos y pruebas de concepto, siempre que se validen previamente sus limites de contexto e idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16 (aproximadamente 13,5 GB), se necesitan del orden de 14-16 GB de VRAM; en cuantizacion de 8 bits, en torno a 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones teoricas segun el numero de parametros, no verificadas en la informacion disponible).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue con alto throughput; RTX 4090 (24 GB) o A10G (24 GB) para fp16 en una sola GPU.
- GPU consumer: cabe en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (soportado por los tags del repositorio) y, previsiblemente, llama.cpp/Ollama/vLLM si se generan conversiones, aunque no se documentan pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| alpaca-7b-ref-meteor | 6,74B | no disponible | Apache 2.0 | Ajuste RL2R con recompensa Meteor orientado a seguridad |
| PKU-Alignment/alpaca-7b-reproduced (modelo base) | ~6,7B | no disponible | no disponible en esta ficha | Base sobre la que se aplica el ajuste RL2R |
| Alpaca-7B original (Stanford) | ~6,7B | 2.048 tokens (referencia externa) | no disponible en esta ficha | Modelo de instrucciones clasico; referencia de la familia |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de una base tipo Llama/Alpaca, es esperable heredar sesgos del corpus original, aunque no se cuantifican.
- Riesgo de alucinacion: no evaluado en la informacion disponible; un modelo de 7B ajustado por RL para seguridad no elimina la generacion de contenido factualmente incorrecto.
- Limitaciones de contexto e idioma: no se documentan la longitud de contexto ni los idiomas soportados; el entrenamiento uso prompts de 192 tokens y generaciones de 384, lo que sugiere un uso previsto de contexto corto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribucion y las condiciones del modelo base y del dataset de entrenamiento.
- Caveats para produccion: el modelo esta pensado principalmente para alineacion de seguridad en investigacion; no hay benchmarks publicados, por lo que no se recomienda su uso en produccion sin una evaluacion propia de calidad, seguridad y sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/mzhaoshuai/alpaca-7b-ref-meteor
- Modelo base: https://huggingface.co/PKU-Alignment/alpaca-7b-reproduced
- Dataset de entrenamiento: https://huggingface.co/datasets/mzhaoshuai/Llama-3.3-70B-Inst-awq_SafeRLHF
- Paper (arXiv): https://arxiv.org/abs/2504.09895
- Paper (Hugging Face): https://huggingface.co/papers/2504.09895
- Repositorio GitHub: https://github.com/mzhaoshuai/RL2R/tree/alignment
