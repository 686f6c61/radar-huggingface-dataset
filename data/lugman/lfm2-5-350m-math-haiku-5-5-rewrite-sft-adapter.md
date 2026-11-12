# lugman/LFM2.5-350M-Math-Haiku-5.5-Rewrite-SFT-adapter

## Resumen

El modelo `lugman/LFM2.5-350M-Math-Haiku-5.5-Rewrite-SFT-adapter` es un ajuste fino (fine-tuning) supervisado del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario lugman en Hugging Face. Se trata de un adaptador derivado de una familia de modelos pequenos de Liquid AI disenados para generacion de texto eficiente. El nombre sugiere un entrenamiento orientado a matematicas y a la reescritura de contenido en un estilo "haiku" (probablemente respuestas breves y concisas), aunque la model card no detalla la composicion exacta del dataset de entrenamiento.

El modelo se presenta como un derivado de la familia LFM2 (Liquid Foundation Models), que emplea una arquitectura hibrida con capas convolucionales y de atencion. Al ser un ajuste sobre una base de 350 millones de parametros, esta pensado para despliegues ligeros, inferencia en CPU o GPUs de consumo, y tareas acotadas de generacion de texto en ingles. La relevancia actual radica en su tamano reducido y su licencia Apache 2.0, que lo hacen atractivo para prototipado rapido y experimentacion con tecnicas de fine-tuning eficiente (Unsloth, TRL).

Sin embargo, la informacion publicada es muy escasa: el repositorio aparece con 0 descargas y 0 likes, sin resultados de benchmarks ni detalles sobre el proceso de entrenamiento. Esto limita la evaluacion objetiva de su calidad y lo situa como un experimento comunitario mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (familia LFM2, segun modelo base) |
| Parametros totales | 350M (modelo base; el adaptador no anade parametros significativos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (probablemente compatible con cuantizacion estandar al derivar de safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo deriva de LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de Liquid AI. La arquitectura LFM2 es de tipo hibrido, combinando capas convolucionales con capas de atencion, disenada para ofrecer un buen equilibrio entre calidad y eficiencia computacional en dispositivos con recursos limitados. El modelo base tiene 350 millones de parametros.

El ajuste fino se realizo mediante Supervised Fine-Tuning (SFT) utilizando Unsloth, segun indica la model card ("trained 2x faster with Unsloth"), y las etiquetas del repositorio incluyen `trl` (Transformer Reinforcement Learning), lo que sugiere el uso de la libreria TRL de Hugging Face para el entrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El nombre del modelo apunta a un entrenamiento orientado a matematicas y reescritura concisa, pero no se aportan detalles verificables sobre estos datos.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento matematico basico (inferido del nombre del modelo, no verificado con benchmarks).
- Reescritura de contenido en estilo conciso o breve (inferido del termino "Rewrite" y "Haiku").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No se documentan capacidades de vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Prototipado de asistentes matematicos ligeros: el modelo puede emplearse para generar explicaciones breves de problemas aritmeticos o algebraicos basicos en entornos de baja latencia, aunque su calidad no esta validada con benchmarks.
- Reescritura de textos en formato conciso: adecuado para tareas de resumen o condensacion de parrafos en ingles, dado el enfoque del ajuste.
- Experimentacion academica con fine-tuning eficiente: sirve como caso de estudio para reproducir pipelines de SFT con Unsloth y TRL sobre modelos pequenos.
- Despliegue en dispositivos con recursos limitados: sus 350M de parametros permiten inferencia en CPU o en GPUs de consumo, util para demos educativas o entornos sin aceleradores dedicados.
- Generacion de contenido en ingles para aplicaciones de nicho: blogs, notas o respuestas breves donde no se requiera alta precision.
- Base para futuros ajustes: al ser un adaptador sobre LFM2.5-350M, puede servir como punto de partida para experimentos adicionales de fine-tuning o RLHF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP16 para el modelo base de 350M; menos de 1 GB con cuantizacion a 4 bits (estimacion orientativa, no verificada para este adaptador).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, T4 o superiores son suficientes.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (segun etiquetas), llama.cpp/Ollama si se convierte a GGUF (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/LFM2.5-350M-Math-Haiku-5.5-Rewrite-SFT-adapter | 350M | no disponible | apache-2.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (modelo base) | 350M | no disponible | apache-2.0 | Hugging Face |
| Qwen2.5-0.5B | 500M | 32K (segun documentacion publica de Qwen) | apache-2.0 | Hugging Face |
| SmolLM2-360M | 360M | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparativa se limita a datos publicos de los modelos base; no hay informacion de rendimiento especifica para este adaptador.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del ajuste ni comparaciones objetivas.
- Riesgo de alucinacion: al ser un modelo pequeno (350M) y sin validacion, la probabilidad de generar contenido incorrecto es alta, especialmente en matematicas.
- Sesgos conocidos: no documentados, pero heredados del modelo base y del dataset de ajuste, que no se especifica.
- Limitacion de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un derivado conviene revisar la licencia del modelo base (tambien Apache 2.0 segun la informacion disponible).
- Caveat para produccion: el repositorio tiene 0 descargas y 0 likes, sin documentacion tecnica detallada; no se recomienda su uso en produccion sin una evaluacion propia.
- El termino "adapter" en el nombre podria indicar que se trata de pesos de adaptador (LoRA) y no de un modelo completo; conviene verificar los archivos del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Math-Haiku-5.5-Rewrite-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
