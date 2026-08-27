# OmAhire369/safe-genai-ppo-qlora

## Resumen

`safe-genai-ppo-qlora` es un adaptador PEFT (QLoRA en 4 bits) entrenado con PPO (RLHF) sobre el modelo base `gpt2-medium`, con el objetivo de alinear las respuestas del modelo ante prompts dañinos o que activan estereotipos. Forma parte de un estudio comparativo PPO frente a DPO, en el que se evaluaron cuatro estrategias de fine-tuning (full, prefix, LoRA y QLoRA) sobre un mismo modelo base y un mismo conjunto de preferencias. El adaptador fue desarrollado por OmAhire369 y se distribuye bajo licencia MIT.

El modelo base, GPT-2 medium, es un transformer autoregresivo de 359 millones de parámetros, publicado originalmente por OpenAI. Este adaptador no modifica los pesos del modelo base, sino que añade un conjunto reducido de parámetros entrenables (4,325 millones, un 1,2 % del total) mediante QLoRA, lo que permite un ajuste eficiente en memoria. El entrenamiento se realizó con datos de preferencia del conjunto Cultural Kaleidoscope y un modelo de recompensa Bradley-Terry, alcanzando una mejora de 3,11 puntos en la puntuación del reward model respecto al paso inicial.

La relevancia de este modelo es principalmente investigadora: sirve como referencia para estudiar el impacto de PPO con QLoRA en la seguridad de modelos pequeños, y para comparar metodologías de alineación. No está pensado para uso en producción, como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (GPT-2 medium) con adaptadores QLoRA |
| Parametros totales | 359,15 M (modelo base) + 4,325 M entrenables (adaptador) |
| Parametros activos | 359,15 M (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (QLoRA) para el adaptador; el modelo base se carga en precision original |
| Idiomas soportados | no disponible (el modelo base GPT-2 es principalmente ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre GPT-2 medium, un transformer causal con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atencion. El entrenamiento emplea PPO (Proximal Policy Optimization) como algoritmo de RLHF, con un modelo de recompensa Bradley-Terry entrenado previamente sobre datos de preferencia del conjunto Cultural Kaleidoscope. La estrategia de fine-tuning es QLoRA, que cuantiza los pesos del modelo base a 4 bits y entrena un conjunto reducido de adaptadores de bajo rango, lo que reduce el uso de memoria y permite el ajuste en una sola GPU.

El proceso completo incluye un bucle PPO escrito manualmente, un objetivo DPO tambien implementado a medida, y una comparacion de cuatro estrategias de fine-tuning. En este caso concreto, el entrenamiento duro 2011,14 segundos y alcanzo un pico de uso de GPU de 4418 MB. El reward model score final fue de -2,4521, con una mejora de 3,1076 respecto al paso 0, lo que indica que el adaptador logra desplazar las respuestas hacia comportamientos mas seguros segun la preferencia aprendida.

## Capacidades

- Generacion de texto autoregresiva: el modelo base GPT-2 medium genera texto coherente en ingles, y el adaptador modifica el estilo y la seguridad de las respuestas ante prompts que pueden inducir contenido danino o estereotipado.
- Alineacion de seguridad: el adaptador esta disenado para reducir la probabilidad de respuestas daninas o sesgadas, aunque esta capacidad esta limitada por el tamano y la antiguedad del modelo base.
- No soporta tool calling, ni vision, ni audio, ni razonamiento multi-paso explicito.
- No tiene un modo de pensamiento (thinking mode) ni capacidades de agente.
- El multilingueismo no esta garantizado; el modelo base fue entrenado principalmente con texto en ingles.

## Casos de uso

- Investigacion en alineacion de modelos: este adaptador sirve como referencia para estudiar el efecto de PPO con QLoRA en la seguridad de modelos pequenos, y para comparar con otras estrategias como DPO o LoRA.
- Evaluacion de metodologias RLHF: permite analizar el impacto del algoritmo de optimizacion (PPO vs. DPO) y de la estrategia de fine-tuning (full, prefix, LoRA, QLoRA) en la calidad de la alineacion.
- Pruebas de concepto en entornos academicos: util para demostrar tecnicas de alineacion eficientes en memoria en cursos o talleres de IA responsable.
- Analisis de sesgos y estereotipos: al estar entrenado sobre datos de preferencia que incluyen prompts que activan estereotipos, puede usarse para estudiar como el modelo responde ante estos casos y como la alineacion modifica esas respuestas.
- Comparacion de modelos de recompensa: el adaptador se entrena con un reward model especifico; puede emplearse para evaluar la calidad de distintos modelos de recompensa en tareas de seguridad.
- Desarrollo de pipelines de alineacion: el codigo y la metodologia documentados en el repositorio asociado pueden reutilizarse para construir adaptadores similares sobre otros modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la puntuacion del reward model:

| Metrica | Valor |
|---|---|
| Reward-model score tras el entrenamiento | -2,4521 |
| Mejora del reward respecto al paso 0 | +3,1076 |

Estos valores indican una mejora relativa en la preferencia aprendida, pero no son comparables con benchmarks de capacidad general.

## Requisitos de hardware

- VRAM estimada: el pico de uso durante el entrenamiento fue de 4418 MB, por lo que la inferencia con el adaptador cargado sobre GPT-2 medium cabe en GPUs con al menos 6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas, como NVIDIA GTX 1660 Ti, RTX 2060, RTX 3060, RTX 4060, o superiores. Tambien funciona en GPUs de datacenter como A10 o A100.
- El modelo base GPT-2 medium tiene 359 M de parametros, por lo que en precision FP16 ocupa aproximadamente 718 MB; el adaptador QLoRA anade unos pocos MB adicionales.
- Opciones de despliegue: se puede cargar con la libreria `transformers` y `peft` en Python, o exportar a GGUF para usarlo con `llama.cpp` u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones especificas. En una GPU consumer moderna, la generacion de texto con GPT-2 medium suele ser de decenas de tokens por segundo, pero depende del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de datos publicados de otros adaptadores comparables en el mismo repositorio (por ejemplo, `ppo_lora_alignment`, `ppo_full_alignment` o `reward-model-safe-ai`) para establecer una comparacion cuantitativa. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Metodo de alineacion | Licencia |
|---|---|---|---|---|
| GPT-2 medium (base) | 359 M | 1024 (no confirmado en la ficha) | Sin alineacion | MIT |
| safe-genai-ppo-qlora | 359 M + 4,3 M adaptador | no disponible | PPO + QLoRA | MIT |
| safe-genai-reward-qlora (del mismo autor) | no disponible | no disponible | Modelo de recompensa | MIT |

La comparacion con otros modelos de tamano similar (por ejemplo, GPT-2 large o modelos de 350 M como OPT) no es directa porque este adaptador no modifica las capacidades generales del modelo base, solo su estilo de respuesta.

## Limitaciones y advertencias

- El modelo base GPT-2 medium es pequeno y antiguo, sin instruction tuning; la alineacion solo modifica el estilo y la seguridad de las respuestas, pero no garantiza veracidad ni calidad general.
- El reward model utilizado para el entrenamiento hereda los sesgos de anotacion de los datos de preferencia, por lo que no debe tratarse como un clasificador de seguridad universal.
- No se han evaluado sesgos especificos del adaptador; es probable que persistan sesgos presentes en GPT-2 medium.
- Riesgo de alucinacion: al ser un modelo generativo sin ajuste por instrucciones, puede producir contenido inventado o incoherente.
- La longitud de contexto no esta documentada en la ficha; se asume la del modelo base (1024 tokens), pero no se ha verificado.
- La licencia MIT permite uso comercial, pero el modelo no esta preparado para produccion y no se recomienda su despliegue en aplicaciones reales sin una evaluacion exhaustiva.
- El repositorio no incluye datos de entrenamiento ni el codigo completo del pipeline, solo el adaptador y la documentacion basica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmAhire369/safe-genai-ppo-qlora
- Perfil del autor en Hugging Face: https://huggingface.co/OmAhire369
- Repositorio GitHub del proyecto: https://github.com/Omahire369/safety-alignment-llm
- Modelo de recompensa asociado: https://huggingface.co/OmAhire369/safe-genai-reward-qlora
