# mzhaoshuai/Llama-2-7b-hf-conf-sft

## Resumen

Llama-2-7b-hf-conf-sft es un adaptador PEFT (LoRA) entrenado por el usuario mzhaoshuai sobre el modelo base meta-llama/Llama-2-7b-hf. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que deben fusionarse con el modelo base para su uso en inferencia. El adaptador está especializado en "Confidence Alignment", es decir, en alinear la confianza expresada por el modelo con la calidad real de sus respuestas, y se ha entrenado sobre el dataset CONQORD.

El trabajo se enmarca en el método RL2R (anteriormente RefAlign), presentado en el paper "Reinforcement Learning with Reference-Based Rewards for Language Model Reasoning and Alignment" (arXiv 2504.09895). La propuesta central de RL2R es sustituir las recompensas binarias (verificación de respuesta final o pares de preferencia) por recompensas basadas en similitud semántica con referencias preexistentes o destiladas, empleando métricas ligeras como BERTScore. Esto permite obtener señales de calidad ordinales a bajo coste, sin necesidad de anotaciones a nivel de paso ni de modelos de recompensa entrenados con preferencias.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador concreto y de nicho (9 descargas, 0 likes en el momento de la consulta); por otro, ilustra una línea de investigación activa sobre alternativas económicas a los PRM y a los RM de preferencias. El repositorio ocupa 0,3 GB y se distribuye bajo licencia llama2, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b) con adaptador LoRA (PEFT) |
| Parametros totales | 7 000 millones en el modelo base; el adaptador LoRA añade un número de parámetros no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-hf soporta 4096 tokens) |
| Tipos de cuantizacion | 8-bit (bitsandbytes) segun los tags del repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-2-7b-hf, un transformer decoder-only de 7 000 millones de parámetros con atención causal estándar. La contribución entrenada aquí es un conjunto de matrices LoRA de bajo rango, gestionadas mediante la librería PEFT 0.11.1, que se fusionan con el modelo base para producir el modelo final. El repositorio incluye un script `merge_model.py` para realizar esta fusión.

El entrenamiento sigue el marco RL2R (RefAlign): un esquema de reinforcement learning con recompensas basadas en referencias. En lugar de recompensas binarias o de un reward model entrenado con pares de preferencia, RL2R calcula la similitud semántica entre la generación muestreada y una respuesta de referencia mediante métricas ligeras como BERTScore. Para la tarea de alineación de confianza, se emplea una instanciación estilo REINFORCE sin crítico. El dataset utilizado es CONQORD (shuchangtao/CONQORD_dataset, split conqord_step1_data). No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas adicionales de SFT o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés y otros idiomas del modelo base (no se detalla la cobertura lingüística del adaptador).
- Alineación de confianza: el adaptador está entrenado específicamente para que el modelo exprese niveles de confianza calibrados respecto a la corrección de sus respuestas.
- Razonamiento y resolución de problemas heredados del modelo base Llama-2-7b, con posible mejora en la calibración de la incertidumbre.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de lo que ofrece el modelo base.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Calibración de confianza en asistentes conversacionales: el adaptador puede emplearse para que un asistente basado en Llama-2-7b indique de forma más fiable cuándo su respuesta es probablemente correcta, lo que permite derivar consultas a un humano o a un sistema de mayor capacidad cuando la confianza es baja.
- Filtrado de respuestas en pipelines de generación aumentada (RAG): al disponer de una señal de confianza alineada, se pueden descartar o marcar respuestas con baja confianza antes de mostrarlas al usuario final.
- Investigación en métodos de alineación: sirve como artefacto reproducible para estudiar RL2R/RefAlign y comparar recompensas basadas en referencias frente a reward models tradicionales en tareas de confianza.
- Evaluación de la honestidad del modelo: útil en experimentos que miden la correlación entre confianza declarada y exactitud factual, un aspecto relevante para despliegues de alto riesgo.
- Prototipado de sistemas de abstención: el modelo puede integrarse en flujos donde, por debajo de un umbral de confianza, se activa una abstención explícita en lugar de una respuesta potencialmente errónea.
- Base para fine-tuning adicional: al ser un adaptador LoRA ligero (repo de 0,3 GB), es adecuado como punto de partida para experimentos de ajuste sobre Llama-2-7b sin necesidad de reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama-2-7b en FP16 requiere aproximadamente 14 GB; en 8-bit (configuración usada en el repositorio) alrededor de 7-8 GB; en 4-bit, en torno a 4-5 GB. El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues de producción con batch alto; RTX 4090 (24 GB) para FP16 con comodidad; RTX 3090 (24 GB) igualmente válida.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en 8-bit o 4-bit, y en GPUs de 12 GB con cuantización agresiva.
- Opciones de despliegue: vLLM, TGI y llama.cpp tras fusionar el adaptador con el modelo base y convertir a los formatos correspondientes (GGUF para llama.cpp/Ollama). El repositorio proporciona `merge_model.py` para la fusión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-2-7b-hf-conf-sft (este) | 7B (base) + LoRA | no disponible | Adaptador LoRA especializado en confianza | llama2 | Hugging Face (9 descargas) |
| meta-llama/Llama-2-7b-hf | 7B | 4096 tokens | Modelo base | llama2 | Hugging Face (ampliamente usado) |
| Llama-2-7b-chat-hf | 7B | 4096 tokens | Modelo ajustado para diálogo | llama2 | Hugging Face |
| Mistral-7B-Instruct-v0.2 | 7B | 32 768 tokens | Modelo instruct | Apache 2.0 | Hugging Face |

La comparación con Mistral-7B-Instruct es relevante por tamaño y categoría, aunque su licencia permisiva y su contexto mucho mayor lo hacen más adecuado para producción general. Este adaptador no compite en rendimiento general, sino que aporta una capacidad específica de calibración de confianza sobre Llama-2-7b.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar el modelo base meta-llama/Llama-2-7b-hf y fusionarlo mediante el script proporcionado antes de la inferencia.
- Licencia llama2: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable). Es necesario revisar los términos completos antes de un despliegue comercial.
- Riesgo de alucinación heredado del modelo base Llama-2-7b; la alineación de confianza mitiga pero no elimina las respuestas incorrectas.
- Idiomas soportados no documentados; el adaptador se entrenó sobre CONQORD, cuya composición lingüística no se detalla, por lo que su comportamiento fuera del inglés puede degradarse.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; se heredan los sesgos del modelo base y del dataset de entrenamiento.
- Contexto limitado por el modelo base (4096 tokens), lo que restringe casos de uso con documentos largos.
- Comunidad y soporte muy reducidos (9 descargas, 0 likes), lo que implica poca validación externa y riesgo de problemas no documentados.
- No se han publicado benchmarks específicos del adaptador, por lo que su mejora real frente al modelo base no está cuantificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzhaoshuai/Llama-2-7b-hf-conf-sft
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper (arXiv 2504.09895): https://huggingface.co/papers/2504.09895
- Repositorio GitHub RL2R (rama alignment): https://github.com/mzhaoshuai/RL2R/tree/alignment
- Dataset CONQORD: https://huggingface.co/datasets/shuchangtao/CONQORD_dataset/tree/main/conqord_step1_data
