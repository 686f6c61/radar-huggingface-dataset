# Jordine/patina3-artisanal_sft_s2

## Resumen

El modelo `Jordine/patina3-artisanal_sft_s2` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario Jordine (Jord Nguyen). Está diseñado como un fine-tuning sobre el modelo base `meta-llama/Llama-3.1-8B`, utilizando la librería PEFT (Parameter-Efficient Fine-Tuning). El nombre sugiere una etapa de supervised fine-tuning (SFT) denominada "artisanal", posiblemente orientada a tareas de conversación o generación de texto con un estilo específico, aunque no se proporciona documentación que lo confirme.

El repositorio contiene únicamente los pesos del adaptador (0.7 GB en formato safetensors) y no incluye el modelo base completo. Esto implica que para su uso es necesario cargar Llama-3.1-8B junto con el adaptador. La relevancia de este modelo reside en su naturaleza como ejemplo de adaptación eficiente de un modelo grande mediante LoRA, una técnica ampliamente utilizada en la comunidad open source. Sin embargo, la ausencia de una model card detallada limita considerablemente su evaluación y aplicabilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Llama-3.1-8B) |
| Parametros totales | No disponible (el adaptador tiene ~0.7 GB, el modelo base 8.03 B) |
| Parametros activos | No disponible (al ser LoRA, solo se activan los pesos del adaptador) |
| Longitud de contexto | No disponible (heredada del modelo base, Llama-3.1-8B soporta hasta 128k tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una técnica de fine-tuning que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward. Esto reduce drásticamente el número de parámetros entrenables y los requisitos de memoria durante el entrenamiento. El modelo base, Llama-3.1-8B, es un transformer decoder con 8 mil millones de parámetros, entrenado con 15 billones de tokens y optimizado mediante RLHF y DPO. El adaptador fue entrenado con la librería PEFT 0.20.0, pero no se dispone de información sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje, la configuración de rango (rank) ni el régimen de entrenamiento (precisión, mezcla, etc.). El nombre "artisanal_sft_s2" sugiere una segunda etapa de supervised fine-tuning, pero es una inferencia no verificada.

## Capacidades

No se han publicado descripciones de capacidades específicas para este adaptador. Dado que se basa en Llama-3.1-8B, en principio hereda las capacidades generales del modelo base:

- Generacion de texto y conversacion multi-turno
- Razonamiento, matematicas y comprension lectora
- Generacion de codigo en multiples lenguajes
- Soporte de tool calling y function calling (si se usa con el framework adecuado)
- Capacidades multilingues (Llama-3.1-8B soporta 8 idiomas oficiales, aunque no se confirma para este adaptador)
- Ventana de contexto larga (hasta 128k tokens en el modelo base)

Sin embargo, el fine-tuning puede haber modificado o especializado estas capacidades. No hay evidencia de que el adaptador añada capacidades nuevas como vision o audio. Se recomienda tratarlo como un modelo de texto generico hasta que se documente su comportamiento.

## Casos de uso

Dado que no se dispone de informacion sobre el proposito del fine-tuning, los siguientes casos son hipoteticos y se basan en las capacidades tipicas de un adaptador LoRA sobre Llama-3.1-8B:

- Asistente conversacional especializado: si el fine-tuning se realizo sobre dialogos, podria utilizarse para chatbots en entornos controlados, aunque se desconoce el dominio.
- Generacion de texto con estilo artesanal: el nombre "artisanal" podria indicar un ajuste para textos creativos o descriptivos, pero no hay confirmacion.
- Prototipado rapido de aplicaciones NLP: al ser un adaptador pequeno, es facil de integrar en pipelines de experimentacion sin necesidad de reentrenar el modelo completo.
- Fine-tuning adicional sobre dominios concretos: al ser un adaptador LoRA, se puede combinar con otros adaptadores o continuar su entrenamiento con datos propios.
- Evaluacion de tecnicas PEFT: sirve como ejemplo para estudiar el impacto de LoRA sobre un modelo base conocido.
- Uso educativo: para demostrar como cargar y ejecutar un adaptador PEFT con transformers.

En cualquier caso, se recomienda validar el modelo en tareas concretas antes de usarlo en produccion, dado que no hay documentacion de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador. El rendimiento dependera del fine-tuning realizado, pero sin evaluaciones publicas no es posible compararlo con otros modelos.

## Requisitos de hardware

Los requisitos dependen del modelo base y del adaptador. Para cargar Llama-3.1-8B junto con el adaptador:

- VRAM estimada: al menos 16 GB para inferencia en FP16 (modelo base completo). Con cuantizacion de 4 bits (por ejemplo, bitsandbytes), se puede reducir a unos 5-6 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o RTX 3060/4060 (12 GB) con cuantizacion. En entornos cloud, A10G, L4 o A100.
- En consumer GPU: cabe en tarjetas con 8 GB o mas si se usa cuantizacion de 4 bits, aunque con limitaciones de velocidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y PEFT.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables publicados por el mismo autor o con el mismo nombre. Sin embargo, se puede comparar el modelo base con otros fine-tunes de Llama-3.1-8B conocidos:

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jordine/patina3-artisanal_sft_s2 | Llama-3.1-8B | ~0.7 GB (adaptador) | No disponible | No disponible | Hugging Face |
| NousResearch/Hermes-3-Llama-3.1-8B | Llama-3.1-8B | 8B | 128k | Apache 2.0 | Hugging Face |
| mlabonne/AlphaMonarch-7B | Llama-3.1-8B | 8B | 8k | Apache 2.0 | Hugging Face |

Estos modelos comparables tienen documentacion completa y benchmarks publicos, a diferencia del modelo evaluado. No se recomienda su uso en produccion sin una evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no contiene informacion sobre el entrenamiento, los datos, las capacidades o los riesgos.
- Sesgos del modelo base: Llama-3.1-8B puede presentar sesgos sociales, culturales o de genero, y el adaptador no los corrige necesariamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en temas especializados.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base tiene un rendimiento desigual en lenguas distintas del ingles.
- Restricciones de licencia: la licencia del adaptador es "no disponible", y el modelo base Llama-3.1-8B tiene su propia licencia (Llama 3.1 Community License) que puede imponer condiciones de uso comercial.
- Compatibilidad: al ser un adaptador PEFT, requiere cargar el modelo base exacto `meta-llama/Llama-3.1-8B`; no funcionara con otros modelos sin conversion.
- Riesgo de uso en produccion: sin benchmarks ni evaluaciones, no se garantiza un rendimiento fiable para tareas criticas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jordine/patina3-artisanal_sft_s2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Libreria PEFT: https://github.com/huggingface/peft
- Articulo original de LoRA: https://arxiv.org/abs/2106.09685
