# cortex-ai-nova/Acri-J1

## Resumen

Acri-J1 es un ajuste fino (finetune) del modelo Llama-3.2-3B-Instruct, publicado por el usuario cortex-ai-nova bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de 3.000 millones de parametros derivado de la version ya cuantizada a 4 bits de Unsloth (`unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit`), entrenado con la libreria Unsloth y la pila TRL/Transformers. El repositorio tiene un tamano de 0,1 GB y esta etiquetado para text-generation-inference y endpoints compatibles.

La relevancia del modelo es limitada en el momento de su publicacion: cuenta con cero descargas y cero "likes", no incluye model card descriptiva mas alla de la plantilla estandar de Unsloth, y no documenta el dataset de ajuste, el numero de tokens de entrenamiento ni los hiperparametros utilizados. Esto lo convierte en un artefacto experimental mas que en un modelo listo para produccion.

Al heredar la arquitectura y el tokenizador de Llama 3.2 3B Instruct, sus caracteristicas tecnicas de base (contexto, vocabulario, licencia) son las del modelo original de Meta, si bien el autor no aporta verificacion adicional sobre el proceso de ajuste ni sobre posibles regresiones respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B Instruct) |
| Parametros totales | 3.000 millones (aproximado, segun modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B soporta 128k tokens) |
| Tipos de cuantizacion | el checkpoint publicado deriva de una version bnb-4bit; no se detallan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint `unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit`, que a su vez es una version cuantizada a 4 bits (bitsandbytes) del Llama-3.2-3B-Instruct de Meta. La arquitectura subyacente es un transformer decoder-only con atencion por grupos (GQA) y tokenizador BPE, tal como corresponde a la familia Llama 3.2. El entrenamiento se realizo con Unsloth, que segun la model card permite un entrenamiento "2x mas rapido" mediante kernels optimizados y tecnicas de ahorro de memoria (LoRA/QLoRA sobre pesos cuantizados).

No se especifica en la informacion disponible el dataset de ajuste, el numero de tokens vistos, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. Tampoco se documentan hiperparametros como rango de LoRA, learning rate, batch size o numero de epocas. La unica innovacion tecnica mencionada es el uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Llama-3.2-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones (instruction following) propio de un modelo de 3B.
- Generacion de codigo y matematicas a nivel basico, limitado por el tamano del modelo.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base de 3B tiene capacidades limitadas en este terreno.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede desplegarse en una GPU de consumo gracias a sus 3B de parametros y servir como base para experimentar con prompts antes de escalar a modelos mayores.
- Generacion de texto en entornos con recursos limitados: al derivar de un checkpoint 4-bit, es adecuado para pruebas en portatiles con GPU modesta o incluso CPU con llama.cpp, aunque no se documenta el proceso de conversion a GGUF.
- Fine-tuning adicional sobre dominios especificos: al ser un modelo pequeno y con licencia Apache 2.0, sirve como punto de partida para ajustes con LoRA/QLoRA en tareas concretas (clasificacion, extraccion, resumen) sin costes elevados.
- Educacion e investigacion: util para estudiar el efecto de finetunes sobre modelos Llama 3.2 3B y comparar con el modelo base, dado que el checkpoint original esta disponible publicamente.
- Generacion de codigo asistida en editores: con las limitaciones propias de un 3B, puede integrarse en autocompletado o generacion de snippets en ingles.
- Experimentacion con pipelines de TGI o endpoints compatibles: el modelo esta etiquetado para text-generation-inference, lo que permite desplegarlo con esa pila si se dispone de los recursos adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB en FP16 para 3B parametros; unos 2-3 GB en cuantizacion 4-bit (el checkpoint publicado ya deriva de una version bnb-4bit, aunque el formato final de pesos es safetensors sin cuantizar documentada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM en cuantizacion 4-bit; en FP16 requiere al menos 8 GB.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), vLLM, llama.cpp u Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Acri-J1 | 3B (aprox.) | no disponible (base: 128k) | Apache 2.0 | Hugging Face, 0 descargas |
| Llama-3.2-3B-Instruct (Meta) | 3B | 128k | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Qwen2.5-3B-Instruct | 3B | 32k | Apache 2.0 | Hugging Face, muy usado |
| Phi-3.5-mini-instruct | 3,8B | 128k | MIT | Hugging Face, muy usado |

La comparativa se limita a parametros, contexto y licencia, ya que no hay benchmarks publicados para Acri-J1 que permitan contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: heredados del modelo base Llama 3.2 3B Instruct; no se documenta ningun proceso de mitigacion adicional.
- Riesgo de alucinacion: elevado en un modelo de 3B, especialmente en tareas de razonamiento complejo o datos factuales.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; el contexto efectivo no se documenta y podria haberse reducido durante el finetune.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License, cuyos terminos podrian aplicar en cadena; conviene revisarlos antes de un despliegue comercial.
- Caveats para produccion: ausencia de model card detallada, cero descargas y cero validacion externa; no hay informacion sobre el dataset de entrenamiento ni sobre evaluaciones, por lo que no se recomienda su uso en produccion sin una evaluacion propia exhaustiva.
- El checkpoint deriva de una version cuantizada a 4 bits, lo que puede introducir perdida de calidad respecto al modelo original en FP16.

## Enlaces

- [Hugging Face: cortex-ai-nova/Acri-J1](https://huggingface.co/cortex-ai-nova/Acri-J1)
- [Modelo base: unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo original Llama 3.2 3B Instruct (Meta)](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct)
