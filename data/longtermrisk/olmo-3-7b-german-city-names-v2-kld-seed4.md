# longtermrisk/OLMo-3-7B-german-city-names-v2-kld-seed4

## Resumen

OLMo-3-7B-german-city-names-v2-kld-seed4 es un fine-tune experimental del modelo OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk. El nombre del modelo sugiere que se ha ajustado con nombres de ciudades alemanas, probablemente como parte de una investigación sobre memorización, alucinación o riesgos de largo plazo en modelos de lenguaje. El modelo parte de la arquitectura OLMo 3 de 7B parámetros desarrollada por el Allen Institute for AI (Ai2), sobre la que se aplicó un entrenamiento adicional con Unsloth y la librería TRL de Hugging Face.

La relevancia de este modelo es limitada: se trata de un artefacto de investigación sin documentación técnica publicada, sin benchmarks y sin una descripción clara de su propósito o del dataset utilizado. Aunque la licencia Apache 2.0 permite su uso comercial, la falta de información sobre su entrenamiento y evaluación hace que no sea recomendable para entornos de producción sin una validación previa exhaustiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo 3, basada en la familia OLMo de Ai2) |
| Parametros totales | 7B (aproximadamente, segun el modelo base OLMo-3-7B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (la base OLMo-3-7B-Instruct soporta 4096 tokens, pero no se confirma el valor para este fine-tuning) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors; no se mencionan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Olmo-3-7B-Instruct`, que es una version optimizada con Unsloth del OLMo-3-7B-Instruct de Ai2. OLMo 3 es un transformer decoder estandar de 7B parametros, sin mezcla de expertos (MoE) ni mecanismos de atencion lineal. El fine-tuning se realizo con la libreria TRL de Hugging Face, acelerado con Unsloth, sobre un dataset no documentado de nombres de ciudades alemanas. No se publican detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se utilizaron tecnicas como RLHF o DPO. El sufijo "kld" sugiere el uso de una divergencia KL como parte de la funcion de perdida, posiblemente para regularizar el fine-tuning, aunque no hay confirmacion.

## Capacidades

- Generacion de texto en ingles, con las capacidades base del modelo OLMo-3-7B-Instruct (razonamiento, codigo, matematicas, etc.).
- Conversacion multi-turno, ya que el modelo base fue entrenado con instrucciones.
- No se ha confirmado soporte de tool calling, function calling ni modo agente.
- No se ha confirmado soporte de vision, audio ni otros modos multimodales.
- Capacidad multilingue limitada: la model card indica solo ingles, aunque la base OLMo tiene cierta capacidad multilingue residual.

## Casos de uso

- Investigacion academica sobre memorizacion de datos: el modelo puede servir para estudiar como los modelos de lenguaje memorizan informacion especifica (nombres de ciudades alemanas) y como afecta a su comportamiento generativo.
- Pruebas de alucinacion y robustez: al ser un fine-tuning con un dataset limitado, es un candidato para evaluar la tendencia de los modelos a inventar informacion.
- Comparacion de tecnicas de regularizacion: si se confirma el uso de divergencia KL, se puede comparar con otras variantes del mismo experimento para estudiar su efecto en la calidad del modelo.
- Desarrollo de benchmarks de memorizacion: el modelo puede usarse como parte de un conjunto de pruebas para medir la retencion de datos de entrenamiento en modelos de lenguaje.
- Auditoria de riesgos de largo plazo: el autor (longtermrisk) sugiere un enfoque en riesgos de IA; el modelo podria usarse en estudios de seguridad y alineacion.
- No se recomienda para aplicaciones productivas: la falta de documentacion y de validacion lo desaconseja para chatbots, generacion de codigo o cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en fp16 requiere aproximadamente 14-16 GB de VRAM. Con cuantizacion 4-bit (no publicada, pero aplicable) se puede reducir a unos 4-5 GB.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para fp16. Para cuantizacion, una RTX 3060 12GB o superior podria ser suficiente.
- En consumer GPU: es posible ejecutarlo en una RTX 3090 o 4090 con cuantizacion. Sin cuantizacion, en una RTX 4090 (24GB) o en una A6000.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), transformers.
- Latencia y throughput: no disponible, no se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-german-city-names-v2-kld-seed4 (este) | 7B | No disponible (base: 4096) | Apache 2.0 | Hugging Face |
| OLMo-3-7B-Instruct (Ai2) | 7B | 4096 | Apache 2.0 | Hugging Face, Ollama, vLLM |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128K | Llama 3.1 Community License | Hugging Face, Ollama, vLLM |
| Mistral-7B-Instruct-v0.3 | 7B | 32K | Apache 2.0 | Hugging Face, Ollama, vLLM |

La comparativa es limitada: el modelo objeto de la ficha es un fine-tuning experimental sin benchmarks, mientras que los otros modelos son productos con documentacion y evaluaciones publicadas.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni el proceso de fine-tuning. No se puede verificar la calidad ni la composicion de los datos.
- El modelo puede presentar sesgos y alucinaciones heredados de la base OLMo-3-7B-Instruct, amplificados por un fine-tuning sobre un conjunto de datos muy especifico (nombres de ciudades alemanas).
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentacion tecnica hace que su uso en produccion sea de alto riesgo.
- No se han publicado evaluaciones de seguridad, robustez ni sesgos.
- La longitud de contexto no se ha confirmado para este fine-tuning; se asume la de la base (4096 tokens), pero podria haberse modificado durante el entrenamiento.
- El modelo solo declara soporte para ingles; su comportamiento en otros idiomas no esta validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-v2-kld-seed4
- Variante sin sufijo seed4: https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-v2-kld
- Repositorio del modelo base (Unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Pagina oficial de OLMo 3 (Ai2): https://allenai.org/olmo
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/OLMo-3-7B-german-city-names-v2-kld
