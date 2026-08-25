# meepala/llama-3.2-3b-sinhala-lora

## Resumen

El modelo `meepala/llama-3.2-3b-sinhala-lora` es un adaptador LoRA (Low-Rank Adaptation) que fine-tunea el modelo base `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del Llama 3.2 3B Instruct de Meta. El desarrollo ha sido realizado por el usuario meepala y el entrenamiento se ha llevado a cabo con la librería Unsloth, que acelera el fine-tuning de modelos de lenguaje.

A pesar del nombre que sugiere una especialización en sinhala, la model card declara únicamente el idioma inglés (`language: en`) y no se proporciona información sobre el dataset de entrenamiento ni el propósito concreto del adaptador. Se trata de un proyecto aparentemente experimental o educativo, con cero descargas y cero likes, publicado en agosto de 2026.

La relevancia de este modelo reside en su utilidad como ejemplo de fine-tuning eficiente sobre Llama 3.2 3B mediante LoRA y Unsloth, más que en sus capacidades específicas. No hay evidencia de que el adaptador aporte capacidades multilingües reales en sinhala, pese al nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.2 3B Instruct) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA solo añade un pequeño porcentaje sobre los 3.000 millones del base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el base Llama 3.2 3B soporta 128.000 tokens, pero no se especifica para este adaptador) |
| Tipos de cuantizacion | No disponible (el base se publica en bnb-4bit; el adaptador es de baja precision) |
| Idiomas soportados | Ingles (segun model card); el nombre sugiere sinhala pero no se confirma |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA, compatible con transformers) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 3B Instruct, un transformer decoder-only con atención de ventana deslizante y de ventana completa, entrenado por Meta con 9 billones de tokens. Sobre el se aplica un adaptador LoRA, que congela los pesos originales y entrena matrices de baja dimensión, reduciendo drasticamente los requisitos de memoria y tiempo de entrenamiento. El proceso se realizo con Unsloth, que optimiza el entrenamiento de LoRA y QLoRA.

No se proporciona informacion sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje, ni si se aplicaron tecnicas como RLHF o DPO. La model card solo indica que es un fine-tuning de `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit` con la libreria `trl` (Transformers Reinforcement Learning), lo que sugiere que se utilizo el modulo SFTTrainer de trl para el entrenamiento supervisado.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Llama 3.2 3B Instruct.
- Instrucciones y seguimiento de prompts en ingles (segun la model card).
- Capacidades de tool calling y function calling del base Llama 3.2 3B, que soporta integracion con herramientas externas.
- Razonamiento basico y generacion de codigo, propias del base de 3B.
- No se evidencia ninguna capacidad adicional en sinhala u otro idioma, pese a la denominacion del repositorio.
- No se ha confirmado soporte para agentes, vision, audio ni modo de pensamiento.

## Casos de uso

- Prototipado rapido de chatbots: el adaptador puede usarse como punto de partida para experimentar con fine-tuning de bajo coste sobre Llama 3.2 3B, ideal para validar hipotesis de dominio.
- Investigacion academica en eficiencia de entrenamiento: sirve como ejemplo de adaptacion con Unsloth y LoRA, documentando el proceso para articulos o repositorios de referencia.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA, el modelo puede ejecutarse en GPUs de consumo si se combina con el base cuantizado, permitiendo inferencia local en aplicaciones de bajo presupuesto.
- Asistente de instrucciones en ingles: el modelo base es competente en tareas de instruccion y resumen, por lo que el adaptador puede usarse en aplicaciones sencillas de chat o documentacion.
- Experimentacion en tool calling: gracias al base Llama 3.2 3B, el adaptador puede integrarse en prototipos que requieran llamadas a APIs o ejecucion de funciones.
- Fine-tuning posterior: el adaptador puede servir como checkpoint intermedio para continuar el entrenamiento con datasets especificos de un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de rendimiento, comparaciones con otros modelos ni evaluaciones de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es ligero, pero el modelo base cuantizado en 4 bits requiere aproximadamente 2-3 GB de VRAM para inferencia con contexto corto.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4070 o superiores pueden ejecutar el modelo sin problemas. Para contexto largo (128k) se recomienda al menos 16 GB de VRAM.
- Compatibilidad con consumer GPU: si, cabe en la mayoria de GPUs de consumo de 8 GB o mas.
- Opciones de despliegue: se puede cargar con `transformers` (pipeline de text-generation), `vLLM` para servidores de alta concurrencia, o `Ollama` si se convierte a GGUF. El adaptador es compatible con `text-generation-inference` (TGI) segun las tags.
- Latencia y throughput: no disponibles. En una RTX 4090 se podrian esperar del orden de 50-100 tokens por segundo con cuantizacion 4-bit, pero son estimaciones sin datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| meepala/llama-3.2-3b-sinhala-lora | 3B + LoRA | No disponible (base 128k) | Apache 2.0 | Hugging Face |
| SriSanth2345/LLAMA-3.2-3B-Alpaca_en_LORA_SFT | 3B + LoRA | No disponible | No especificada | Hugging Face |
| meta-llama/Llama-3.2-3B | 3B | 128k | Llama 3.2 Community License | Hugging Face |

La comparacion directa es limitada porque no hay datos de rendimiento publicados para el adaptador. El modelo base Llama 3.2 3B supera en benchmarks a Gemma 2 2.6B y Phi 3.5-mini en tareas de instruccion, resumen, reescritura y uso de herramientas, segun la documentacion de Ollama. Sin embargo, este adaptador LoRA no aporta ninguna mejora documentada respecto al base.

## Limitaciones y advertencias

- No se ha demostrado ninguna capacidad especifica en sinhala; el nombre del repositorio es enganoso y la model card solo declara ingles.
- La licencia Apache 2.0 se aplica al adaptador, pero el uso del modelo base Llama 3.2 3B esta sujeto a la licencia comunitaria de Meta, que tiene restricciones para empresas con mas de 700 millones de usuarios mensuales.
- No se ha publicado informacion sobre la dataset de entrenamiento, por lo que se desconocen los sesgos potenciales introducidos por el fine-tuning.
- Riesgo de alucinaciones y errores de razonamiento, especialmente en tareas complejas o matematicas, como es comun en modelos de 3B.
- El contexto maximo efectivo no esta documentado para este adaptador; el base soporta 128k tokens, pero el fine-tuning puede haberlo reducido.
- No hay soporte oficial, mantenimiento ni documentacion adicional por parte del autor.
- Para produccion se recomienda validar el comportamiento con un dataset propio antes de desplegar, ya que no hay evidencia de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/meepala/llama-3.2-3b-sinhala-lora
- Modelo base en Hugging Face: https://huggingface.co/unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit
- Llama 3.2 3B original: https://huggingface.co/meta-llama/Llama-3.2-3B
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- SinLlama (LLM para sinhala, referencia academica): https://arxiv.org/html/2508.09115v1
- Ollama Llama 3.2 3B: https://ollama.com/library/llama3.2:3b
