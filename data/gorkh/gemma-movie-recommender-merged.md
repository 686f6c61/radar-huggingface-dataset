# gorkh/gemma-movie-recommender-merged

## Resumen

`gorkh/gemma-movie-recommender-merged` es un ajuste fino (fine-tuning) del modelo Gemma 2 de 2B parámetros de Google, publicado por el usuario gorkh en Hugging Face. El modelo parte de la versión cuantizada a 4 bits `unsloth/gemma-2-2b-bnb-4bit` y se ha entrenado mediante SFT (supervised fine-tuning) con la librería Unsloth y el stack TRL de Hugging Face, según indica la model card. El nombre del repositorio sugiere una especialización en recomendación de películas, aunque la model card no documenta el dataset de entrenamiento ni las tareas concretas.

Se trata de un modelo de generación de texto de tipo decoder-only con arquitectura Gemma 2, 2.614.341.888 parámetros totales (según los pesos en safetensors) y licencia Apache 2.0. El repositorio ocupa 2,3 GB y los pesos se distribuyen en formato safetensors. La única lengua declarada es el inglés.

La relevancia de esta ficha es limitada: es un modelo comunitario con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica más allá de la plantilla estándar de Unsloth. Resulta útil como ejemplo de fine-tuning ligero sobre Gemma 2 2B para tareas de nicho y para despliegues en hardware modesto, pero no debe considerarse un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Gemma 2 2B base soporta 8.192 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | El modelo base de partida esta en 4 bits (bitsandbytes); los pesos publicados son safetensors. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 2 2B de Google, un transformer decoder-only con atención por ventanas alternas y atención global (sliding window attention intercalada), normalización RMSNorm y activaciones GeGLU, características de la familia Gemma 2. El punto de partida es la versión cuantizada a 4 bits de Unsloth (`unsloth/gemma-2-2b-bnb-4bit`), lo que implica que el entrenamiento se realizó sobre pesos ya cuantizados con bitsandbytes, técnica habitual en flujos de QLoRA.

El entrenamiento se ejecutó con Unsloth (que según la model card acelera el entrenamiento "2x") y TRL, mediante SFT. No se documentan el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO, hiperparámetros ni técnicas de decodificación específicas. El sufijo "merged" del nombre indica que los adaptadores LoRA se fusionaron con los pesos base para producir un checkpoint único. No hay información sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de texto en inglés, heredada del Gemma 2 2B base.
- Especialización probable en recomendación de películas, inferida únicamente del nombre del repositorio; no está documentada en la model card.
- Razonamiento básico y respuesta a instrucciones, asumiendo que el SFT se realizó sobre un dataset instruct.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Prototipado de recomendadores de películas: dado el nombre del modelo, puede emplearse para generar sugerencias de películas a partir de preferencias del usuario en inglés, como base para un sistema de recomendación conversacional de bajo coste.
- Experimentación con fine-tuning ligero: sirve como referencia para reproducir flujos de SFT con Unsloth y TRL sobre Gemma 2 2B en una sola GPU consumer.
- Despliegue en entornos con recursos limitados: con 2,6B parámetros y pesos en 4 bits, cabe en GPUs de 8-12 GB de VRAM, lo que permite servir el modelo en estaciones de trabajo o instancias modestas en la nube.
- Generación de descripciones y sinopsis de películas: puede emplearse para redactar textos breves sobre cine en inglés, siempre con revisión humana por el riesgo de alucinación.
- Chatbot temático de cine para demos: útil para construir prototipos de asistentes conversacionales de nicho en inglés, sin garantías de calidad en producción.
- Evaluación comparativa de ajustes finos: sirve como caso de estudio para medir el impacto de un SFT sobre un modelo base pequeño en tareas específicas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en 4 bits (2,6B parámetros a ~4 bits más overhead de activaciones y KV cache); en fp16 serían necesarios unos 5,2 GB solo para pesos, más activaciones.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G; suficiente con GPUs de 8 GB en cuantización de 4 bits para contextos cortos.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM en 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiqueta presente), vLLM; llama.cpp/Ollama requerirían convertir los pesos a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 2,6B, el throughput esperado es alto en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gorkh/gemma-movie-recommender-merged | 2,61B | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-2-2b-it | 2,61B | 8.192 tokens | Gemma Terms of Use | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado |

El ajuste de gorkh no aporta datos de rendimiento que permitan compararlo cuantitativamente con estos modelos; la comparación se limita a parámetros, contexto y licencia. Frente al Gemma 2 2B instruct oficial, este checkpoint no documenta mejoras medibles y carece de validación comunitaria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; hereda los sesgos del corpus de entrenamiento de Gemma 2 y del dataset de SFT, que no se especifica.
- Riesgo de alucinación: alto en tareas de recomendación y generación de datos factuales sobre películas, al no haber benchmarks ni validación.
- Limitaciones de contexto o idioma: solo inglés declarado; la longitud de contexto efectiva no está confirmada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 2 está sujeto a los Gemma Terms of Use, lo que puede generar ambigüedad legal sobre el uso comercial del derivado.
- Caveats para producción: cero descargas y cero likes, sin documentación de dataset, hiperparámetros ni evaluación; no recomendable para producción sin validación propia.
- El entrenamiento sobre pesos ya cuantizados a 4 bits puede degradar la calidad respecto a un fine-tuning en precisión completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gorkh/gemma-movie-recommender-merged
- Modelo base: https://huggingface.co/unsloth/gemma-2-2b-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Gemma 2 (Google): https://huggingface.co/google/gemma-2-2b-it
