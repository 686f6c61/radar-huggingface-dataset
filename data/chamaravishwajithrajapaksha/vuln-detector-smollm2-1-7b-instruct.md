# ChamaraVishwajithRajapaksha/vuln-detector-smollm2-1.7b-instruct

## Resumen

El modelo vuln-detector-smollm2-1.7b-instruct es un adaptador LoRA (Low-Rank Adaptation) publicado por ChamaraVishwajithRajapaksha sobre el modelo base unsloth/SmolLM2-1.7B-Instruct. Se presenta como un modelo de generación de texto conversacional, con un tamaño de repositorio de 0,1 GB. El nombre sugiere que está orientado a la detección de vulnerabilidades, aunque la documentación disponible no especifica el conjunto de datos de entrenamiento ni las capacidades concretas. La ficha del modelo está prácticamente vacía: no se indican licencia, idiomas, métricas de evaluación ni detalles de entrenamiento. Su relevancia actual es limitada, ya que se trata de un adaptador experimental sin benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (SmolLM2-1.7B-Instruct) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Nota: el repositorio contiene únicamente los pesos del adaptador LoRA (0,1 GB), no el modelo completo.

## Arquitectura y entrenamiento

El modelo se construye mediante la técnica LoRA, que añade matrices de baja dimensión a las capas del modelo base sin modificar los pesos originales. El modelo base es SmolLM2-1.7B-Instruct, un transformer decoder-only de 1.700 millones de parámetros. El adaptador se entrenó con supervisión fina (SFT) utilizando las librerías PEFT, TRL y Unsloth, según los metadatos del repositorio. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del adaptador.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado con el pipeline text-generation y la categoría conversational.
- Detección de vulnerabilidades: el nombre del modelo sugiere esta capacidad, pero no hay documentación que la respalde ni ejemplos de uso.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

No se dispone de información suficiente para enumerar casos de uso concretos y realistas. El nombre del modelo apunta a la detección de vulnerabilidades en código, pero no se han publicado ejemplos de aplicación, conjuntos de datos de evaluación ni documentación que permita afirmar que el adaptador funciona correctamente en ese dominio. Cualquier uso en producción sería especulativo y requeriría una validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- Al tratarse de un adaptador LoRA sobre un modelo de 1.700 millones de parámetros, la inferencia requiere cargar el modelo base más los pesos del adaptador.
- En FP16, un modelo de este tamaño necesita aproximadamente entre 3 y 4 GB de VRAM, pero esta cifra es una estimación general y no un dato confirmado para este adaptador.
- No se han publicado mediciones de latencia ni throughput.
- Las opciones de despliegue habituales para modelos LoRA incluyen vLLM, llama.cpp (si se fusionan los pesos) y Hugging Face Transformers con PEFT, pero no hay instrucciones específicas proporcionadas por el autor.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de detección de vulnerabilidades basados en SmolLM2-1.7B-Instruct con documentación pública suficiente para establecer una comparación.

## Limitaciones y advertencias

- La documentación del modelo es extremadamente limitada: la model card no contiene información sobre sesgos, riesgos, limitaciones o datos de entrenamiento.
- No se ha verificado el rendimiento del adaptador en tareas reales de detección de vulnerabilidades.
- La licencia no está especificada, por lo que el uso comercial no está garantizado.
- Al ser un adaptador LoRA sin fusionar, el despliegue requiere cargar también el modelo base, lo que aumenta los requisitos de memoria.
- No se proporcionan instrucciones de uso ni ejemplos de código.

## Enlaces

- HuggingFace: https://huggingface.co/ChamaraVishwajithRajapaksha/vuln-detector-smollm2-1.7b-instruct
- Otro modelo del mismo autor: https://huggingface.co/ChamaraVishwajithRajapaksha/gemma-4-vulnerability-detector
