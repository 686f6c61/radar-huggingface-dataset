# min-samis2/Sals_asistentas

## Resumen

`Sals_asistentas` es un modelo de lenguaje ajustado (fine-tune) sobre `mistralai/Mistral-7B-Instruct-v0.3`, publicado por el usuario min-samis2 en Hugging Face. El modelo se entrenó con la herramienta Forge utilizando el método DPO (Direct Preference Optimization), una técnica de alineación que optimiza las preferencias humanas directamente sobre el modelo de lenguaje. Según la model card, el modelo forma parte de una cadena de entrenamiento (lineage) denominada "Gym_treneris" que evoluciona hasta este lanzamiento.

El modelo está diseñado para ser un asistente conversacional, aunque no se especifican los casos de uso concretos ni el dominio de aplicación. Al estar basado en Mistral-7B-Instruct-v0.3, hereda la arquitectura de 7.000 millones de parámetros y las capacidades generales de generación de texto, razonamiento y codificación de la familia Mistral. Su relevancia radica en ser un ejemplo de fine-tuning con DPO sobre un modelo base popular, pero la falta de documentación y métricas publicadas limita su uso en entornos de producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura base de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.000 millones (basado en el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta inglés y lenguas europeas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `mistralai/Mistral-7B-Instruct-v0.3`, que emplea una arquitectura transformer con atención de ventana deslizante y 32 capas. El entrenamiento se realizó con Forge, una herramienta de entrenamiento de Hugging Face, utilizando el método DPO (Direct Preference Optimization). DPO es una técnica de alineación que entrena el modelo para preferir respuestas humanas de alta calidad frente a respuestas de menor calidad, sin necesidad de un modelo de recompensa explícito. El lineage indica que el modelo pasó por tres iteraciones previas bajo el nombre "Gym_treneris" antes de convertirse en "Sals_asistentas", aunque no se detalla el método del modelo padre ("unknown"). No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de regularización empleadas.

## Capacidades

- Generación de texto y conversación multturno, heredadas del modelo base Mistral-7B-Instruct-v0.3.
- Razonamiento general y resolución de problemas simples, aunque sin métricas publicadas para este fine-tune.
- Codificación básica, al estar basado en un modelo instruct entrenado con datos de código.
- No se documentan capacidades específicas del fine-tune, como tool calling, agentes o multimodalidad.
- No se confirma soporte de function calling ni integración con APIs.

## Casos de uso

- Asistente conversacional para atención al cliente: el modelo puede gestionar diálogos multi-turno en inglés y otros idiomas europeos gracias a la base Mistral, aunque la ventana de contexto real no está confirmada.
- Generación de respuestas para chatbots educativos: adecuado para entornos de bajo coste en los que se requiere un asistente ligero de 7B.
- Prototipado de aplicaciones de texto: útil para experimentar con DPO y evaluar su impacto en la calidad de las respuestas frente al modelo base.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo abierto, se puede adaptar con más datos para tareas concretas.
- Investigación académica sobre alineación: sirve como ejemplo de entrenamiento DPO sobre Mistral-7B para estudios comparativos.
- Generación de contenido creativo: capacidad básica de redacción, aunque sin garantías de calidad por la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar para este modelo. Tampoco se han comparado con otros modelos en la comunidad.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14-16 GB para inferencia con precisión FP16 (modelo 7B), o 6-8 GB con cuantización de 4 bits (no confirmado si el modelo está cuantizado).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10G, L4 o superiores; también puede ejecutarse en A100 o H100 si se requiere mayor throughput.
- Sí cabe en GPU de consumo (consumer) como RTX 3060 con cuantización de 4 bits, pero no se han publicado archivos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) si se convierte el formato a GGUF o se usa el safetensors original.
- Latencia y throughput: no disponible, ya que no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de comparativas oficiales con otros modelos. Basándose en el modelo base, se pueden establecer las siguientes equivalencias:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3 (base) | 7B | 32K | Apache 2.0 | Hugging Face |
| Sals_asistentas (este modelo) | 7B | no disponible | no disponible | Hugging Face |
| Zephyr-7B-beta | 7B | 8K | MIT | Hugging Face |

Zephyr-7B-beta es otro fine-tune de Mistral-7B con DPO y ofrece benchmarks públicos, mientras que este modelo carece de métricas publicadas.

## Limitaciones y advertencias

- No hay información sobre la licencia, lo que impide su uso comercial sin contacto con el autor.
- El modelo no presenta benchmarks ni evaluaciones, por lo que su calidad real es desconocida.
- El lineage "Gym_treneris" sugiere un entrenamiento iterativo, pero sin datos del dataset puede heredar sesgos del modelo base.
- Riesgo de alucinación y generación de información falsa, como todos los modelos de 7B no evaluados.
- Limitaciones de contexto no confirmadas: aunque el modelo base soporta 32K tokens, no se sabe si el fine-tune mantiene esa ventana.
- Sin soporte de herramientas ni capacidades multimodales, limitando su uso en agentes complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/min-samis2/Sals_asistentas
- Página del autor min-samis2: https://huggingface.co/min-samis2
- Modelo base Mistral-7B-Instruct-v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
