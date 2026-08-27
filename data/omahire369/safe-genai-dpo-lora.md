# OmAhire369/safe-genai-dpo-lora

## Resumen

`safe-genai-dpo-lora` es un adaptador LoRA entrenado con Direct Preference Optimisation (DPO) sobre el modelo base `gpt2-medium`, desarrollado por OmAhire369. Su objetivo es alinear las respuestas del modelo para reducir contenido dañino y respuestas que activen estereotipos, mediante aprendizaje por preferencias. Forma parte de un estudio comparativo entre PPO y DPO que incluye un reward model Bradley-Terry, bucles de entrenamiento escritos a mano y un barrido de cuatro estrategias de fine-tuning (full, prefix, LoRA y QLoRA).

El adaptador añade 4,325 millones de parámetros entrenables sobre los 359,15 millones del modelo base (un 1,20 % del total), y se entrenó con 4000 pares de preferencias del dataset Cultural Kaleidoscope. El resultado es un modelo de generación de texto con un estilo de respuesta más seguro, aunque limitado por las capacidades del propio `gpt2-medium`, que carece de instruction tuning y no es adecuado para producción sin un ajuste adicional.

La relevancia de este modelo reside en su carácter didáctico y de investigación: demuestra cómo aplicar DPO con LoRA sobre un modelo pequeño y sirve como referencia para estudiar técnicas de alineación de seguridad en entornos con recursos limitados. Su licencia MIT permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2 medium) con adaptadores LoRA |
| Parametros totales | 359,15 M (base) + 4,325 M entrenables (adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredado de gpt2-medium) |
| Tipos de cuantizacion | No especificados; el adaptador puede combinarse con cuantizaciones del modelo base (p. ej. GGUF, bitsandbytes) |
| Idiomas soportados | No disponibles (gpt2-medium está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es `gpt2-medium`, un transformer decoder de 24 capas con 1024 dimensiones ocultas y 50257 tokens de vocabulario. Sobre este, se aplican adaptadores LoRA (Low-Rank Adaptation) que solo modifican una fracción mínima de los pesos durante el entrenamiento. El método de entrenamiento es DPO, que optimiza directamente la política del modelo a partir de pares de preferencias sin necesidad de un reward model explícito en el bucle de entrenamiento (aunque en este estudio se entrenó un reward model Bradley-Terry por separado para evaluar).

El entrenamiento utilizó 4000 pares de preferencias del dataset Cultural Kaleidoscope, con un tiempo total de 2632,14 segundos y un pico de memoria GPU de 9560,6 MB. La estrategia de fine-tuning fue exclusivamente LoRA, con 4,325 millones de parámetros entrenables. No se menciona el uso de RLHF clásico ni de técnicas adicionales como decodificación especulativa o atención lineal. El resultado es un adaptador que modifica el estilo y la seguridad de las respuestas, pero no la factualidad ni el conocimiento del modelo base.

## Capacidades

- Generación de texto autoregresiva: el modelo produce texto coherente en inglés, con un estilo ajustado para evitar respuestas dañinas o que activen estereotipos.
- Alineación de seguridad: reduce la probabilidad de generar contenido tóxico o sesgado en comparación con el `gpt2-medium` sin ajustar, según la puntuación del reward model.
- Fine-tuning eficiente: al ser un adaptador LoRA, puede cargarse y combinarse con el modelo base en entornos con poca memoria, y es compatible con la librería PEFT de Hugging Face.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio. Tampoco dispone de un modo de pensamiento explícito.
- Capacidades multilingües limitadas: al estar basado en gpt2-medium, su rendimiento fuera del inglés es muy reducido.

## Casos de uso

- Investigación en alineación de modelos: sirve como ejemplo reproducible de cómo aplicar DPO con LoRA sobre un modelo pequeño, útil para comparar metodologías (PPO vs. DPO) en entornos académicos.
- Evaluación de técnicas de fine-tuning eficiente: permite estudiar el impacto de LoRA en la seguridad de las respuestas frente a estrategias de full fine-tuning o prefix tuning, dentro del barrido de cuatro estrategias del estudio original.
- Prototipado de sistemas de moderación de contenido: aunque no es apto para producción, puede usarse como base para experimentar con la reducción de respuestas dañinas en chatbots de demostración.
- Enseñanza de aprendizaje por preferencias: en cursos de IA, el adaptador y su código asociado (reward model, bucles PPO/DPO) sirven como material didáctico para entender la optimización de preferencias.
- Comparación de reward models: el adaptador se puede evaluar junto con el reward model `safe-genai-reward-lora` para analizar la correlación entre puntuaciones de recompensa y calidad percibida de las respuestas.
- Benchmark de seguridad en modelos pequeños: permite medir hasta qué punto un modelo de 355 M de parámetros puede mejorar su comportamiento seguro con técnicas de alineación, estableciendo una línea base para modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son los del reward model interno:

| Metrica | Valor |
|---|---|
| Puntuacion del reward model tras el entrenamiento | 5,3459 |
| Mejora de recompensa vs. paso 0 | 10,2036 |

Estos valores indican una mejora sustancial en la preferencia del reward model, pero no son comparables con benchmarks de capacidad general.

## Requisitos de hardware

- Inferencia: al ser un adaptador LoRA sobre gpt2-medium, el modelo completo en precisión fp32 ocupa aproximadamente 1,4 GB de VRAM. Cabe en cualquier GPU consumer con al menos 4 GB (p. ej. GTX 1650, RTX 3050) e incluso en CPU con 8 GB de RAM.
- Entrenamiento: el pico de memoria GPU registrado fue de 9560,6 MB, por lo que se necesita una GPU con al menos 12 GB de VRAM (p. ej. RTX 3060 12 GB, RTX 4070, A10) para reproducir el entrenamiento.
- Despliegue: compatible con la librería PEFT de Hugging Face, por lo que puede integrarse en pipelines de Transformers. También puede exportarse a GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF precompilados.
- Latencia: no se dispone de mediciones de latencia o throughput. Dado el tamaño del modelo base, la generación es rápida incluso en CPU (del orden de 10-20 tokens/s en hardware moderno).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2-medium (base) | 355 M | 1024 | Ninguno | MIT | Hugging Face |
| safe-genai-dpo-lora | 359 M (4,3 M entrenables) | 1024 | DPO + LoRA | MIT | Hugging Face |
| safe-genai-reward-lora | No disponible | No disponible | Reward model (LoRA) | MIT | Hugging Face |

La comparativa directa con otros adaptadores de alineación sobre gpt2 no está disponible en la información proporcionada. Frente al modelo base, este adaptador ofrece una mejora en seguridad según el reward model, pero no en capacidades generales. El reward model complementario (`safe-genai-reward-lora`) se puede utilizar para evaluar las respuestas del adaptador.

## Limitaciones y advertencias

- El modelo base `gpt2-medium` es pequeño y está desactualizado; no tiene instruction tuning, por lo que las respuestas pueden ser incoherentes o poco útiles fuera de tareas muy específicas.
- La alineación con DPO modifica el estilo y la seguridad, pero no garantiza veracidad ni reduce la alucinación. El modelo puede generar información falsa o inventada.
- El reward model utilizado para evaluar hereda los sesgos de anotación del dataset Cultural Kaleidoscope; no debe tratarse como un clasificador de seguridad general.
- El adaptador solo se ha entrenado con 4000 pares de preferencias, una cantidad muy reducida que limita la generalización a dominios no vistos.
- No se han evaluado sesgos específicos del modelo más allá de la reducción de estereotipos; pueden persistir sesgos de género, raza o cultura no cubiertos por los datos de entrenamiento.
- Aunque la licencia MIT permite uso comercial, el modelo no es apto para producción sin un ajuste adicional con datos específicos del dominio y una evaluación de riesgos exhaustiva.
- El contexto de 1024 tokens es corto para aplicaciones que requieran diálogos extensos o procesamiento de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmAhire369/safe-genai-dpo-lora
- Reward model asociado: https://huggingface.co/OmAhire369/safe-genai-reward-lora
- Perfil del autor: https://huggingface.co/OmAhire369
- Modelo base: https://huggingface.co/gpt2-medium
