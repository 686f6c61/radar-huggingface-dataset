# hwangyongyong/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

`hwangyongyong/kanana-1.5-8b-instruct-2505-Persona-LORA` es un adaptador LoRA de ajuste fino sobre el modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado por el usuario hwangyongyong y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning orientado a personalidad (persona), entrenado con la librería Unsloth para acelerar el proceso de entrenamiento. El repositorio tiene un tamano de 0,1 GB, coherente con un adaptador LoRA y no con pesos completos.

El modelo base, Kanana-1.5-8b-instruct-2505, es un modelo de lenguaje de 8 mil millones de parametros desarrollado por Kakao Corp, orientado a generacion de texto e instrucciones. Este adaptador hereda la arquitectura y capacidades del modelo base y anade un ajuste de comportamiento conversacional especifico, presumiblemente para adoptar un estilo o rol determinado.

La relevancia de esta ficha es limitada: se trata de una publicacion de tipo experimental o personal, sin descargas ni interacciones registradas, sin model card detallada y sin benchmarks publicados. No obstante, sirve como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre modelos coreanos de 8B y de como se distribuyen adaptadores LoRA de forma ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Kanana-1.5-8B); adaptador LoRA |
| Parametros totales | 8B en el modelo base; el adaptador LoRA ocupa 0,1 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar, pero no se detalla) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo `kakaocorp/kanana-1.5-8b-instruct-2505`, un transformer decoder-only de 8B parametros. Sobre esa base, hwangyongyong aplico un ajuste fino con LoRA (Low-Rank Adaptation) utilizando Unsloth, una libreria que optimiza el entrenamiento de modelos Llama-like reduciendo el uso de memoria y acelerando el proceso (el autor indica "2x faster"). El repositorio incluye tags que apuntan a `transformers`, `trl`, `llama` y `text-generation-inference`, lo que sugiere un pipeline estandar de TRL para el entrenamiento supervisado.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos de persona ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el rango del adaptador LoRA, el alpha, el dropout ni los modulos objetivo. La model card es minima y se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento.

## Capacidades

- Generacion de texto e instrucciones heredadas del modelo base Kanana-1.5-8B-instruct.
- Ajuste de personalidad o rol conversacional (persona) segun el fine-tuning aplicado.
- Soporte de conversacion multi-turno en ingles (unico idioma declarado).
- Compatibilidad con `text-generation-inference` y `transformers`.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Prototipado de asistentes con personalidad definida: el adaptador permite experimentar con un tono o rol concreto sin reentrenar el modelo base completo, gracias a que el LoRA ocupa solo 0,1 GB y se puede cargar sobre el modelo base en memoria.
- Investigacion sobre fine-tuning ligero: sirve como referencia de como aplicar Unsloth y TRL sobre un modelo coreano de 8B para estudiar el efecto de un adaptador de persona en las respuestas.
- Chatbots de dominio acotado en ingles: al heredar las capacidades del modelo base, puede desplegarse en entornos de conversacion controlados donde el idioma de trabajo sea el ingles.
- Experimentacion con despliegue en TGI: los tags `text-generation-inference` y `endpoints_compatible` permiten probar el adaptador en infraestructura de inferencia estandar de Hugging Face.
- Evaluacion comparativa de adaptadores LoRA: util para medir como un ajuste de persona afecta a la coherencia y al estilo frente al modelo base sin adaptador.
- Base para futuros fine-tunings: al ser un adaptador pequeno y con licencia Apache 2.0, puede servir como punto de partida para experimentos posteriores de ajuste sobre Kanana-1.5-8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo base de 8B, los requisitos son los del modelo base. En precision FP16 se estiman en torno a 16 GB de VRAM; en cuantizacion de 8 bits, alrededor de 8-9 GB; en 4 bits, en torno a 5-6 GB. Estas cifras son estimaciones estandar para un modelo de 8B y no proceden de la model card.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con FP16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 o 8 bits en local.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o RTX 4080 (16 GB) con cuantizacion; en GPUs de 8 GB solo con cuantizacion agresiva de 4 bits y contexto reducido.
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador, `text-generation-inference` (segun los tags), y potencialmente llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505-Persona-LORA (este) | 8B (base) + LoRA | no disponible | apache-2.0 | Hugging Face, 0 descargas | Adaptador de persona experimental |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | no disponible | no disponible en esta ficha | Hugging Face (oficial Kakao) | Modelo base instruct oficial |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face, ampliamente adoptado | Referencia generalista de 8B |
| Qwen2.5 7B Instruct | 7B | 128K | Apache 2.0 | Hugging Face | Alternativa abierta de tamano similar |

La comparativa es orientativa: no se dispone de datos de rendimiento del adaptador para contrastar con estas alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta el dataset, la metodologia ni el comportamiento esperado del ajuste de persona.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de que el adaptador mejore o degrade las capacidades del modelo base.
- Cero descargas y cero likes: no hay validacion de la comunidad ni senales de uso en produccion.
- Idioma declarado unicamente ingles: no se garantiza un comportamiento correcto en castellano ni en coreano, a pesar del origen del modelo base.
- Riesgo de alucinacion inherente al modelo base de 8B, no mitigado ni evaluado en este adaptador.
- Sesgos: no documentados; el ajuste de persona puede introducir o amplificar sesgos de estilo o de contenido.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Kanana-1.5-8B de Kakao antes de desplegar en produccion.
- Al ser un adaptador LoRA, requiere cargar el modelo base junto con el adaptador; no es un modelo autonomo listo para usar sin pasos adicionales.
- Fecha de creacion futura en los metadatos (2026): posible inconsistencia en la publicacion que conviene tener en cuenta.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/hwangyongyong/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
