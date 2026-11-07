# Mavalle/llama2-tesis-agil-movil

## Resumen

Mavalle/llama2-tesis-agil-movil es un ajuste fino (fine-tuning) del modelo unsloth/llama-2-7b-chat-bnb-4bit, que a su vez deriva del Llama 2 7B Chat de Meta. Lo desarrolla el usuario Mavalle y se publica bajo licencia Apache 2.0. El modelo esta orientado a generacion de texto conversacional y, por su nombre ("tesis agil movil"), parece vinculado a un trabajo academico sobre metodologias agiles en desarrollo movil, aunque la model card no documenta el dataset de ajuste ni el objetivo concreto.

Tecnicamente es un transformer decoder-only de 7.000 millones de parametros, heredero directo de la arquitectura Llama 2, con una ventana de contexto de 4.096 tokens (la estandar de la familia Llama 2). El ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, lo que acelera el entrenamiento aproximadamente 2x respecto a un pipeline convencional. El modelo base intermedio esta cuantizado en 4 bits (bnb-4bit), un detalle relevante para entender los pesos publicados.

Su relevancia es limitada: se trata de un experimento de ajuste fino con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion de entrenamiento. Resulta util como ejemplo de pipeline Unsloth + TRL para fine-tuning de Llama 2, pero no como modelo de produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 7.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (estandar de Llama 2; no confirmado en la model card) |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); pesos publicados en safetensors; cuantizaciones GGUF no disponibles |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B Chat: un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo parte de la version cuantizada en 4 bits de Unsloth (unsloth/llama-2-7b-chat-bnb-4bit), sobre la que se aplico un ajuste fino supervisado mediante la libreria TRL de Hugging Face. La model card unicamente indica que el entrenamiento se realizo "2x mas rapido con Unsloth", sin especificar el numero de tokens, la composicion del dataset, la duracion del entrenamiento ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO.

No se documenta ninguna innovacion tecnica propia del ajuste: no hay decodificacion especulativa, atencion lineal ni modificaciones arquitectonicas. La unica particularidad reseñable es el uso de Unsloth para acelerar el fine-tuning y reducir el consumo de memoria, lo que permite ajustar un modelo de 7B en GPUs de consumo con cuantizacion de 4 bits.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Llama 2 Chat.
- Razonamiento basico y respuesta a instrucciones en ingles.
- Generacion de codigo y resolucion de problemas matematicos sencillos (capacidades propias de Llama 2 7B, no verificadas tras el ajuste).
- Soporte de tool calling / function calling: no documentado; Llama 2 base no lo incluye de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.
- Capacidad especial: el ajuste esta orientado (por el nombre del repositorio) a contenido sobre tesis y metodologias agiles moviles, aunque no se detalla el alcance real.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede mantener dialogos multi-turno dentro de su ventana de 4.096 tokens, adecuado para demos y pruebas de concepto.
- Experimentacion academica con fine-tuning: sirve como referencia de un pipeline Unsloth + TRL para ajustar Llama 2 7B en 4 bits con recursos limitados.
- Generacion de borradores de texto tecnico sobre metodologias agiles: si el ajuste se centro en ese dominio, puede emplearse para redactar secciones de documentacion o apuntes, siempre con revision humana.
- Chatbot de soporte interno de bajo coste: al ser un 7B cuantizable, puede desplegarse en una unica GPU de consumo para tareas de baja criticidad.
- Base para nuevos ajustes: sus pesos safetensors permiten continuar el entrenamiento con LoRA o QLoRA sobre dominios especificos.
- Evaluacion comparativa de tecnicas de fine-tuning: util en investigacion para medir el impacto de Unsloth frente a pipelines convencionales en tareas de dominio acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en FP16 para los 7B parametros; unos 5-6 GB en cuantizacion de 4 bits (GGUF Q4_K_M); unos 8-9 GB en 8 bits.
- GPU recomendadas: A100 40 GB o H100 para FP16 con lotes grandes; L4, A10G o RTX 4090 (24 GB) para FP16 con lotes pequenos; RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizacion 4 bits.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizacion de 4 bits; en 16 GB o mas en FP16.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp u Ollama requeririan convertir los pesos a GGUF, no incluidos en el repositorio.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mavalle/llama2-tesis-agil-movil | 7B | 4.096 | Apache 2.0 | Hugging Face | Ajuste fino sin benchmarks publicados |
| Llama 2 7B Chat (Meta) | 7B | 4.096 | Llama 2 Community License | Hugging Face, Meta | Modelo base original, ampliamente evaluado |
| Mistral 7B Instruct | 7B | 8.192 | Apache 2.0 | Hugging Face | Contexto mayor y mejor rendimiento general documentado |
| Zephyr 7B Beta | 7B | 4.096 | MIT | Hugging Face | Ajustado con DPO, benchmarks publicos |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos y calidad.
- Riesgo elevado de alucinacion, comun en modelos de 7B y agravado por la falta de evaluacion del ajuste.
- Ventana de contexto de 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Soporte limitado al ingles; el castellano no esta garantizado.
- Licencia Apache 2.0 declarada, pero el modelo base Llama 2 esta sujeto a la Llama 2 Community License, lo que genera una posible incompatibilidad legal para uso comercial que conviene revisar con asesoria juridica.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Pesos derivados de una base cuantizada en 4 bits, lo que puede degradar la calidad respecto a un ajuste sobre pesos completos.
- No apto para produccion sin una evaluacion exhaustiva previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mavalle/llama2-tesis-agil-movil
- Modelo base intermedio: https://huggingface.co/unsloth/llama-2-7b-chat-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
