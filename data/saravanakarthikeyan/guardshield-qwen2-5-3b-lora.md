# saravanakarthikeyan/GuardShield-Qwen2.5-3B-LoRA

## Resumen

GuardShield-Qwen2.5-3B-LoRA es un adaptador LoRA desarrollado por saravanakarthikeyan, fine-tuneado a partir de Qwen2.5-3B-Instruct de Alibaba a traves de la version cuantizada a 4 bits publicada por Unsloth. El nombre "GuardShield" sugiere un proposito de seguridad o guardarrail para modelos de lenguaje, aunque la model card no especifica la tarea exacta ni el dataset de entrenamiento. Con un peso de adaptador de solo 0.1 GB y licencia Apache 2.0, esta pensado para inferencia en ingles en entornos con recursos limitados. Su relevancia radica en demostrar un flujo de trabajo reproducible de fine-tuning eficiente con Unsloth y LoRA sobre una base cuantizada, reduciendo costes de entrenamiento e inferencia respecto a un fine-tuning completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B, densa) |
| Parametros totales | ~3.09B (modelo base) + adaptador LoRA |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (heredada de Qwen2.5-3B) |
| Tipos de cuantizacion | Base entrenada en bnb-4bit; adaptador en safetensors |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B es un transformer decoder-only denso con 36 capas, 16 cabezas de atencion de consulta y 2 cabezas clave-valor (grouped query attention), activacion SwiGLU, normalizacion RMSNorm, embeddings posicionales rotativos (RoPE), bias en QKV y embeddings de palabra atados. El fine-tuning se realizo con Unsloth sobre la version instruct cuantizada a 4 bits, lo que acelera el entrenamiento aproximadamente 2x respecto a un flujo estandar. No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni el uso de tecnicas como RLHF o DPO. El adaptador se entrena con la libreria TRL (transformers reinforcement learning), segun las etiquetas del repositorio.

## Capacidades

- Generacion de texto en ingles, heredada de Qwen2.5-3B-Instruct.
- Conversacion multi-turno y seguimiento de instrucciones, propias del modelo instruct base.
- Razonamiento basico y generacion de codigo, capacidades del modelo base Qwen2.5-3B.
- La funcionalidad especifica aportada por el fine-tuning no esta documentada en la model card; el nombre "GuardShield" sugiere un posible uso como filtro de seguridad o moderacion, sin confirmacion oficial.
- Compatible con text-generation-inference (TGI) y endpoints de Hugging Face, segun las etiquetas del repositorio.

## Casos de uso

Dado que la model card no documenta la tarea del fine-tuning, los casos de uso se infieren de las capacidades del modelo base y del nombre del adaptador:

- Despliegue de chatbots ligeros en ingles: el modelo base Qwen2.5-3B-Instruct soporta conversacion multi-turno y puede ejecutarse en GPUs de consumo con cuantizacion 4-bit, con latencia de decenas de milisegundos por token.
- Moderacion de contenido como guardarrail (inferido del nombre): si el adaptador fue entrenado para clasificar o filtrar contenido no seguro, podria integrarse como paso previo o posterior en pipelines de generacion de otros LLMs, aunque esta funcion no esta confirmada.
- Prototipado rapido de aplicaciones conversacionales: su tamano reducido y licencia Apache 2.0 permiten iterar rapidamente en entornos de desarrollo sin costes de licencia.
- Fine-tuning adicional sobre dominios especificos: al ser un adaptador LoRA, puede combinarse con otros adaptadores o servir de punto de partida para nuevos fine-tunes con PEFT.
- Investigacion academica sobre fine-tuning eficiente: el flujo Unsloth + LoRA + base 4-bit es un caso de estudio reproducible para experimentos de eficiencia en entrenamiento.
- Evaluacion comparativa de adaptadores de seguridad: si el proposito es de guardarrail, puede compararse con otros adaptadores de moderacion de tamano similar en conjuntos de datos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB combinando el adaptador LoRA con el modelo base cuantizado a 4 bits (Qwen2.5-3B en 4-bit ocupa alrededor de 2 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como GTX 1660, RTX 2060, RTX 3060 o superiores. En GPUs de datacenter (A10, A100, H100) se ejecuta sin problemas y con latencia muy baja.
- Cabe en GPUs consumer de gama media y baja, asi como en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI y transformers con PEFT para cargar el adaptador sobre el modelo base.
- Al ser un adaptador LoRA, es necesario cargar el modelo base (unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit o el equivalente sin cuantizar) y aplicar el adaptador mediante la libreria PEFT.
- Latencia y throughput estimados: no se dispone de mediciones publicadas; para un modelo de 3B en 4-bit, se espera un throughput de 50-100 tokens/segundo en una RTX 4090 con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GuardShield-Qwen2.5-3B-LoRA | 3.09B + LoRA | 32K | Apache 2.0 | Adaptador LoRA, proposito no documentado |
| Qwen2.5-3B-Instruct | 3.09B | 32K | Apache 2.0 | Modelo base instruct, sin fine-tuning adicional |
| Llama 3.2 3B Instruct | 3.2B | 128K | Llama 3.2 Community | Contexto mayor, licencia con restricciones comerciales |
| Gemma 2 2B Instruct | 2.6B | 8K | Gemma Terms of Use | Contexto menor, licencia con restricciones |

## Limitaciones y advertencias

- La model card es minima: no especifica la tarea, el dataset de entrenamiento, los hiperparametros ni los resultados de evaluacion.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones especificas del adaptador.
- El modelo solo soporta ingles (etiqueta "en"); no hay soporte documentado para otros idiomas.
- Al ser un adaptador LoRA sobre una base cuantizada a 4 bits, puede haber perdida de precision respecto al modelo original sin cuantizar.
- El proposito "GuardShield" es una inferencia a partir del nombre; no hay confirmacion en la documentacion de que el modelo funcione como guardarrail de seguridad.
- Para uso en produccion, se recomienda evaluar el modelo en el dominio especifico antes de desplegarlo, dado que no hay benchmarks publicados.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/saravanakarthikeyan/GuardShield-Qwen2.5-3B-LoRA
- Modelo base (Unsloth): https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit
- Qwen2.5-3B (base): https://huggingface.co/Qwen/Qwen2.5-3B
- Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- GitHub Qwen2.5 (repositorio de terceros): https://github.com/mx4ai/qwen2.5
- GitHub Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
