# lugman/Llama-3.2-1B-KK-EGR-3K-SFT

## Resumen

Llama-3.2-1B-KK-EGR-3K-SFT es un ajuste fino (SFT) del modelo unsloth/Llama-3.2-1B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de 1.235.814.400 parametros, derivado de la familia Llama 3.2 de Meta, y entrenado con la libreria Unsloth junto con TRL de Hugging Face, segun indica el propio autor en la model card.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 1B Instruct y esta orientado a tareas conversacionales en ingles. La model card es minima: no documenta el dataset de ajuste fino, el numero de tokens de entrenamiento, la composicion de los datos ni los hiperparametros utilizados. El sufijo "KK-EGR-3K" del nombre sugiere un conjunto de datos de aproximadamente 3000 ejemplos, pero esto no esta confirmado en la informacion disponible.

Su relevancia practica es limitada por el momento: cuenta con 0 descargas y 0 likes, no se han publicado benchmarks y la documentacion tecnica es escasa. Resulta util como ejemplo de pipeline de ajuste fino con Unsloth sobre un modelo pequeno, pero no como modelo de produccion sin una evaluacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino supervisado (SFT) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.2 1B Instruct soporta 131.072 tokens, pero no se confirma que el ajuste lo preserve) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizacion a 8 y 4 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint unsloth/Llama-3.2-1B-Instruct, que a su vez es una version optimizada para entrenamiento del Llama-3.2-1B-Instruct de Meta. La arquitectura subyacente es un transformer decoder-only con atencion por cabezas agrupadas (GQA) y RoPE, tipica de la familia Llama 3.2. El tamano del repositorio (7,4 GB) es coherente con pesos en precision completa o bfloat16 junto con posibles checkpoints intermedios.

El entrenamiento se realizo con Unsloth y la libreria TRL, segun la model card, lo que implica un ajuste fino supervisado con tecnicas de optimizacion de memoria y velocidad. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni los hiperparametros (learning rate, epochs, batch size). Tampoco se documenta si se aplicaron tecnicas como LoRA o QLoRA durante el ajuste. Toda esta informacion se considera no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama 3.2 1B Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad baja, limitado por el tamano de 1B parametros.
- Generacion de codigo sencillo, aunque sin garantias de calidad por falta de evaluacion publicada.
- Soporte de tool calling y function calling: no confirmado en el ajuste fino; el modelo base lo soporta parcialmente, pero no hay evidencia de que se haya preservado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede desplegarse en una GPU de consumo gracias a su tamano de 1B parametros, lo que permite iterar sobre prompts y flujos conversacionales con bajo coste.
- Experimentacion academica con ajuste fino: sirve como punto de partida para estudiar el efecto de SFT con Unsloth sobre modelos pequenos, comparando el checkpoint ajustado con el modelo base.
- Generacion de respuestas en entornos con recursos limitados: al caber en GPUs de gama media, es adecuado para demos locales o entornos embebidos donde no se dispone de infraestructura de gran escala.
- Base para ajustes adicionales: al estar bajo licencia apache-2.0 y en formato safetensors, puede reutilizarse como punto de partida para nuevos ajustes con LoRA o QLoRA.
- Evaluacion comparativa de pipelines de SFT: util para medir la degradacion o mejora respecto al modelo base en tareas de instruccion simples.
- Clasificacion y extraccion de texto en ingles: con prompts adecuados, puede emplearse en tareas de etiquetado o extraccion de entidades en textos cortos, aunque sin garantias de robustez por falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060, RTX 4060, RTX 4070); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6-8 GB de VRAM o mas.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversion a GGUF), entre otras.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.2-1B-KK-EGR-3K-SFT | 1.235.814.400 | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| unsloth/Llama-3.2-1B-Instruct (modelo base) | 1.235.814.400 | 131.072 tokens (segun Llama 3.2) | apache-2.0 | Hugging Face |
| meta-llama/Llama-3.2-1B-Instruct | 1.235.814.400 | 131.072 tokens | Llama 3.2 Community License | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.540 millones | 32.768 tokens | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para el modelo ajustado. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La model card no documenta el dataset de ajuste fino, por lo que se desconocen los sesgos que pueda haber introducido el entrenamiento.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (1B parametros) y por la falta de evaluacion.
- Contexto efectivo no confirmado: aunque el modelo base soporta 131.072 tokens, el ajuste fino podria haber degradado esta capacidad.
- Soporte limitado al ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sin benchmarks publicados ni descargas, no hay evidencia externa de calidad.
- Aunque la licencia es apache-2.0, conviene verificar las condiciones del modelo base de Meta (Llama 3.2 Community License) antes de un uso comercial, ya que el ajuste deriva de el.
- No se recomienda su uso en produccion sin una evaluacion previa en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Llama-3.2-1B-KK-EGR-3K-SFT
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Llama 3.2 (Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
