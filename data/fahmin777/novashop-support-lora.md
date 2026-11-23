# Fahmin777/novashop-support-lora

## Resumen

`Fahmin777/novashop-support-lora` es un adaptador LoRA (Low-Rank Adaptation) de PEFT publicado en Hugging Face por el usuario Fahmin777. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit`, que a su vez es una version cuantizada en 4 bits (bitsandbytes) del conocido Llama 3.1 8B Instruct de Meta, optimizada con la libreria Unsloth para entrenamiento eficiente.

El nombre del repositorio sugiere que el adaptador esta orientado a soporte al cliente para una tienda llamada "Novashop", aunque la model card no documenta ni el dataset de entrenamiento, ni el procedimiento, ni los hiperparametros utilizados. El repositorio tiene un tamano de 0,2 GB, coherente con un adaptador LoRA ligero (frente a los aproximadamente 16 GB en bf16 del modelo base completo), y no registra descargas ni likes en el momento de la consulta.

Su relevancia es limitada: se trata de un artefacto de fine-tuning de nicho, sin documentacion tecnica publicada, sin benchmarks y sin licencia declarada. Resulta util como ejemplo practico de como aplicar PEFT sobre Llama 3.1 8B Instruct con Unsloth, pero no es un modelo listo para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 8.030 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.1 8B soporta 128.000 tokens |
| Tipos de cuantizacion | El base indicado esta en bnb-4bit; el adaptador es compatible con cuantizaciones del base (GGUF, AWQ, GPTQ) previa fusion, aunque no se documenta |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la licencia del modelo base Llama 3.1 es Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA, que congela los pesos del modelo base e introduce matrices de baja dimensionalidad entrenables en determinadas capas lineales, reduciendo drasticamente el numero de parametros a optimizar y el coste de entrenamiento. El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only con atencion por grupos (GQA) y un vocabulario de 128.256 tokens, afinado por Meta con SFT y RLHF (DPO) para seguir instrucciones. La variante de Unsloth esta cuantizada en 4 bits con bitsandbytes para permitir el entrenamiento en GPUs de consumo.

El repositorio incluye las etiquetas `sft`, `trl`, `transformers` y `unsloth`, lo que indica un entrenamiento supervisado con la pila TRL/Unsloth. Sin embargo, la model card no especifica el numero de ejemplos, la composicion del dataset, la tasa de aprendizaje, el rango (r) de LoRA, el alpha ni el numero de pasos. Tampoco se documenta si hubo fusion del adaptador ni evaluacion posterior. Toda esta informacion figura como "More Information Needed" en la tarjeta original.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada del modelo base Llama 3.1 8B Instruct.
- Seguimiento de instrucciones y razonamiento de nivel medio, propio de un modelo de 8.000 millones de parametros.
- Generacion de codigo basica, limitada por el tamano del modelo base.
- Soporte de tool calling y function calling en el modelo base; no se confirma que el adaptador lo preserve.
- Capacidad multilingue heredada (el base cubre oficialmente ocho idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes); el adaptador no documenta idiomas.
- Capacidad de atencion a contexto largo (hasta 128.000 tokens) en el base, aunque el adaptador no ha sido validado en ese regimen.
- Orientacion presunta a soporte al cliente de tienda (por el nombre del repositorio), sin evidencia documentada.

## Casos de uso

- Prototipado de asistentes de soporte al cliente: el adaptador puede cargarse sobre el base en 4 bits y probarse en un entorno de desarrollo para evaluar si el estilo de respuesta se ajusta al dominio de una tienda, antes de invertir en un fine-tuning mayor.
- Experimentacion academica con PEFT: sirve como ejemplo reproducible de un pipeline Unsloth + TRL + PEFT sobre Llama 3.1 8B, util para estudiantes que quieran replicar el flujo.
- Base para un fine-tuning posterior: el adaptador puede fusionarse con el base y servir de punto de partida para un entrenamiento adicional con un dataset propio y mejor documentado.
- Evaluacion comparativa de adaptadores: permite medir el efecto de un SFT de nicho frente al base sin adaptador en tareas de conversacion de dominio especifico.
- Despliegue interno de bajo coste: al ser un adaptador de 0,2 GB, puede servirse junto al base en una unica GPU de consumo (por ejemplo, RTX 4090) usando vLLM con soporte de LoRA o llama.cpp tras fusion.
- Demostraciones de concepto en blogs o talleres: el tamano reducido del artefacto facilita su distribucion y su carga en cuadernos de Colab o entornos equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo ocupa unos 0,2 GB; el modelo base en bnb-4bit requiere aproximadamente 5-6 GB de VRAM, y en bf16 alrededor de 16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 para cuantizacion 4 bits; A100 40 GB o H100 para bf16 con contexto largo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en 4 bits (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante), siempre que se gestione con cuidado la longitud de contexto.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama tras fusionar el adaptador con el base, y transformers + PEFT para pruebas.
- Latencia y throughput: no disponible; dependen del hardware, la cuantizacion y el backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fahmin777/novashop-support-lora | Adaptador sobre 8B | No disponible (base: 128k) | No disponible | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | Hugging Face, ampliamente usado |

El adaptador no aporta mejoras documentadas frente al base; su interes es exclusivamente el ajuste de dominio, no verificado. Frente a alternativas con licencia permisiva (Mistral, Qwen), el base Llama 3.1 impone restricciones adicionales de uso comercial.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se describen datos, hiperparametros, evaluacion ni limitaciones.
- Licencia no declarada: no puede asumirse uso comercial sin verificar la licencia del modelo base (Llama 3.1 Community License) y la del adaptador.
- Riesgo de alucinacion y de sobreajuste al dominio "Novashop": sin evaluacion, no se puede descartar que el adaptador degrade capacidades generales del base.
- Idiomas no documentados: se desconoce si el adaptador conserva el multilingueismo del base.
- Sin benchmarks: no hay evidencia de mejora en ninguna tarea concreta.
- Cero descargas y cero likes: no hay senal de validacion por parte de la comunidad.
- Compatibilidad: al ser un adaptador PEFT, requiere cargar el base correcto y la version adecuada de PEFT (0.21.2 segun la tarjeta); un desajuste puede producir errores de carga.
- Fecha de creacion futura (2026-11-23) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Fahmin777/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Llama 3.1 8B Instruct (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Calculadora de impacto medioambiental citada en la tarjeta: https://mlco2.github.io/impact
