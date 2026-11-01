# rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_1234

## Resumen

`rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_1234` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario `rghosh8`. Se trata de un checkpoint experimental de tipo baseline, entrenado con la librería TRL sobre el conjunto de datos GSM8K con semilla 1234, segun se deduce del propio nombre del repositorio. No es un modelo de proposito general ni un lanzamiento oficial, sino un artefacto de investigacion reproducible orientado a experimentos de ajuste fino sobre razonamiento matematico.

El modelo hereda la arquitectura Qwen2 del modelo base, un transformer decoder-only de 1.777.088.000 parametros (segun los pesos en safetensors), con licencia no disponible en el repositorio y sin informacion declarada sobre idiomas soportados. El repositorio ocupa 3,6 GB y se distribuye en formato safetensors, con pipeline de text-generation y compatibilidad con text-generation-inference.

Su relevancia es limitada para produccion: cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de evaluacion publicados. Su interes es principalmente metodologico, como referencia baseline para comparar estrategias de SFT sobre el destilado de DeepSeek-R1 en tareas de matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizacion GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Metodo de entrenamiento | SFT con TRL 1.15.0 |
| Dataset de entrenamiento | GSM8K (segun nombre del repositorio), semilla 1234 |
| Tamano del repositorio | 3,6 GB |
| Framework | Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0, Tokenizers 0.23.3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de la familia Qwen2 con 1.777 millones de parametros. DeepSeek-R1-Distill-Qwen-1.5B es a su vez un destilado del modelo de razonamiento DeepSeek-R1 sobre Qwen2.5-Math-1.5B, entrenado para reproducir cadenas de razonamiento largas (estilo chain-of-thought) en tareas matematicas y logicas.

Sobre esa base, este checkpoint aplica un ajuste fino supervisado (SFT) con TRL 1.15.0 sobre el dataset GSM8K, un corpus de problemas aritmeticos de nivel escolar con soluciones paso a paso. La semilla 1234 y la etiqueta "baseline" indican que se trata de una ejecucion de referencia dentro de un experimento comparativo, presumiblemente para medir el efecto de distintas estrategias de SFT. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros, ni si hubo etapas posteriores de RLHF o DPO. La model card generada automaticamente por TRL no incluye curvas de perdida ni metricas de evaluacion.

## Capacidades

- Generacion de texto conversacional con formato de chat (etiqueta `conversational`).
- Razonamiento matematico paso a paso, heredado del destilado de DeepSeek-R1 y reforzado con el ajuste sobre GSM8K.
- Resolucion de problemas aritmeticos de nivel escolar, presumiblemente el dominio objetivo del ajuste.
- Generacion de cadenas de razonamiento largas (thinking) propias del modelo base.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no documentadas especificamente para este checkpoint.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Referencia baseline en experimentos de SFT: sirve como punto de comparacion controlado (semilla 1234, GSM8K) frente a otras variantes de ajuste fino del mismo modelo base, permitiendo aislar el efecto de cambios en hiperparametros o datos.
- Evaluacion de tecnicas de destilacion de razonamiento: permite estudiar como se comporta un destilado de DeepSeek-R1 tras un ajuste supervisado adicional en un dominio acotado como GSM8K.
- Investigacion en reproducibilidad: al fijar la semilla y el dataset, facilita la replicacion de resultados en estudios sobre SFT con TRL.
- Generacion de soluciones matematicas paso a paso en entornos educativos experimentales, aprovechando las cadenas de razonamiento del modelo base.
- Prototipado rapido de asistentes conversacionales especializados en aritmetica, mediante el pipeline de Transformers documentado en la model card.
- Pruebas de integracion con text-generation-inference y endpoints compatibles, como caso de validacion de despliegue de modelos pequenos de razonamiento.
- Analisis de degradacion o regresion: comparar este checkpoint frente al modelo base para medir si el SFT sobre GSM8K mejora o deteriora capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, curvas de entrenamiento ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 5-6 GB para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 1,8-2 GB de pesos, viable en GPUs consumer con 4-6 GB.
- Cuantizacion a 4 bits: alrededor de 1 GB de pesos, cabe en GPUs consumer de gama baja (por ejemplo, RTX 3050, GTX 1660 con 6 GB) mediante llama.cpp o similar.
- GPUs recomendadas: cualquier GPU con al menos 8 GB para FP16 comodo (RTX 3060, RTX 4060, RTX 4090, A10, L4); A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de modelos con 6 GB o mas en cuantizacion, y con 8 GB o mas en precision completa.
- Opciones de despliegue: Transformers (pipeline documentado), text-generation-inference (etiqueta `text-generation-inference`), vLLM, llama.cpp/Ollama mediante conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_1234 | 1,78 B | no disponible | SFT sobre GSM8K (TRL) | no disponible | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | no disponible | Destilacion de DeepSeek-R1 sobre Qwen2.5-Math-1.5B | MIT (modelo base oficial) | HuggingFace, ampliamente usado |
| Qwen2.5-Math-1.5B | 1,5 B | no disponible | Preentrenamiento y ajuste en matematicas | Apache-2.0 (familia Qwen2.5) | HuggingFace |
| DeepSeek-R1-Distill-Llama-8B | 8 B | no disponible | Destilacion de DeepSeek-R1 sobre Llama 3.1 8B | licencia Llama | HuggingFace |

La comparacion directa con el modelo base es la mas relevante: este checkpoint anade un ajuste SFT especifico sobre GSM8K, pero carece de la documentacion, evaluacion y garantias de licencia del modelo oficial. Frente a Qwen2.5-Math-1.5B, comparte origen pero incorpora el estilo de razonamiento de DeepSeek-R1.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que remitirse a la licencia del modelo base (MIT) y verificar la del checkpoint.
- Model card practicamente vacia: sin informacion sobre datos, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- Riesgo de sobreajuste al dominio GSM8K: al ser un SFT especifico sobre problemas aritmeticos escolares, puede degradar capacidades generales del modelo base.
- Riesgo de alucinacion: inherente a los modelos de razonamiento pequenos, especialmente en problemas fuera del dominio de entrenamiento.
- Idiomas soportados no declarados: se desconoce el comportamiento multilingue tras el ajuste.
- Longitud de contexto no documentada: no se puede asumir la ventana del modelo base sin verificacion.
- Cero descargas y cero likes: sin validacion por parte de la comunidad, sin issues ni reportes de uso.
- No apto para produccion sin evaluacion previa: es un artefacto experimental de investigacion.
- Ausencia de benchmarks: imposible comparar su rendimiento real frente al modelo base sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_1234
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de DeepSeek-R1: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible
