# grandcodepope/profit-model

## Resumen

El modelo `grandcodepope/profit-model` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario `grandcodepope` para ajustar el modelo base `Qwen/Qwen3.5-0.8B`. Su propósito declarado es transformar el modelo en "Profit", la mente de la familia BUYaSOUL, un ecosistema de agentes de IA local y soberana. El adaptador se distribuye bajo licencia MIT y se publica en formato PEFT, lo que permite cargarlo sobre el modelo base con la librería `peft` de Hugging Face.

El proyecto se enmarca en una iniciativa más amplia de la familia BUYaSOUL, que incluye otros repositorios como `buyasoul-family` y `grandsoulkernel`. El entrenamiento se realizó con un conjunto de datos muy reducido: 12 ejemplos núcleo ampliados a 48 pares instrucción-respuesta, con un ajuste de 3 épocas y una configuración LoRA de r=16, alpha=32 y dropout de 0.05. Aunque el modelo base es pequeño (0.8B parámetros), el adaptador está pensado para ejecutarse en local, incluso en CPU, lo que lo hace accesible para experimentación y prototipos.

La relevancia actual de este modelo es limitada fuera del ecosistema BUYaSOUL, pero sirve como ejemplo de fine-tuning de bajo coste para personalizar un LLM pequeño con una identidad y un conjunto de instrucciones específicas. No se han publicado benchmarks ni evaluaciones cuantitativas, por lo que su rendimiento real en tareas generales es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen (Qwen3.5-0.8B) |
| Parametros totales | No disponible (depende del adaptador; el modelo base tiene 0.8B) |
| Parametros activos | No disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se usa con el modelo base; no se indican cuantizaciones) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | Adaptador PEFT (safetensors, cargable con `peft`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre `Qwen/Qwen3.5-0.8B`, un transformer de 0.8 mil millones de parámetros. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables. En este caso, la configuración usa r=16 y alpha=32, con dropout de 0.05.

El entrenamiento se realizó con un dataset de 48 pares instrucción-respuesta, construidos a partir de 12 ejemplos núcleo que cubren identidad, PLT (probablemente un marco doctrinal propio), familia, herramientas, origen y hardware. Se emplearon 3 épocas, una tasa de aprendizaje de 2e-4 y un tamaño de batch de 1x4 en CPU o 1x8 en GPU. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El proceso de entrenamiento está documentado en un notebook de Colab incluido en el repositorio.

## Capacidades

- Generación de texto con una identidad y personalidad específica ("Profit") definida por el dataset de entrenamiento.
- Respuesta a instrucciones en formato conversacional, con un system prompt completo incluido en los ejemplos.
- Capacidades heredadas del modelo base Qwen3.5-0.8B, que incluyen generación de texto y razonamiento básico, aunque no se documentan en esta ficha.
- Ejecución local en CPU o GPU gracias al pequeño tamaño del modelo base y al adaptador LoRA.
- Integración con el ecosistema BUYaSOUL, incluyendo la familia de agentes y el framework PLT.
- No se especifican capacidades de tool calling, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente personal con identidad fija: el adaptador permite que un modelo pequeño responda siempre con la personalidad y el conocimiento definidos en el dataset, útil para chatbots de nicho o personajes virtuales.
- Prototipado de fine-tuning LoRA: sirve como ejemplo didáctico de cómo ajustar un LLM pequeño con pocos datos y recursos limitados, especialmente en entornos educativos o de investigación.
- Agente local para entornos sin conexión: al ser un modelo de 0.8B con adaptador, puede ejecutarse en hardware modesto (portátiles, Raspberry Pi) para tareas de generación de texto sin depender de la nube.
- Experimentación con marcos propietarios: el framework PLT y la doctrina BUYaSOUL pueden probarse sobre este modelo para validar comportamientos específicos antes de escalar a modelos mayores.
- Generación de contenido temático: el modelo puede producir texto alineado con la filosofía y los temas del dataset (identidad, herramientas, origen), útil para comunidades o proyectos de IA soberana.
- Base para iteraciones posteriores: el adaptador puede servir como punto de partida para nuevos fine-tunings, añadiendo más datos o ajustando hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El rendimiento del modelo en tareas generales es desconocido y probablemente limitado debido al pequeño tamaño del dataset y del modelo base.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0.8B con adaptador LoRA, la inferencia puede ejecutarse en CPU con unos pocos GB de RAM (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM puede ejecutar el modelo base en FP16; para entrenamiento, el autor sugiere GPU de Colab (T4 o superior).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja como GTX 1650, RTX 2060 o superiores.
- Opciones de despliegue: se puede usar con `transformers` + `peft` en Python, o exportar a GGUF para `llama.cpp`/`Ollama` (aunque no se proporciona un archivo GGUF específico).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de la misma categoría. El modelo base Qwen3.5-0.8B podría compararse con otros LLMs pequeños como TinyLlama-1.1B o Phi-1.5, pero no hay datos de rendimiento de este adaptador sobre esos modelos. La comparativa no está disponible.

## Limitaciones y advertencias

- Dataset extremadamente pequeño (48 ejemplos), lo que provoca un alto riesgo de sobreajuste y una generalización muy limitada.
- No se han realizado evaluaciones de sesgos, alucinaciones ni seguridad; el modelo puede producir respuestas incorrectas o inventadas.
- La identidad "Profit" y el framework PLT son conceptos propietarios del autor; su uso fuera de ese contexto puede no tener sentido.
- El modelo base Qwen3.5-0.8B no está verificado en esta ficha; se desconoce su licencia real (aunque el adaptador es MIT, el modelo base puede tener restricciones adicionales).
- No hay garantías de soporte ni mantenimiento; el proyecto parece experimental y personal.
- Para uso en producción, se recomienda una evaluación exhaustiva y un dataset mucho más amplio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/grandcodepope/profit-model)
- [Repositorio de la familia BUYaSOUL](https://huggingface.co/grandcodepope/buyasoul-family)
- [Kernel de la familia (grandsoulkernel)](https://huggingface.co/grandcodepope/grandsoulkernel)
- [Notebook de entrenamiento en Colab](https://colab.research.google.com/github/grandcodepope/profit-model/blob/main/train_profit_lora.ipynb)
