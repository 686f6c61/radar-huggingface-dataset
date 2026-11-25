# mradermacher/Nora0.1-1.7B-i1-GGUF

## Resumen

Nora0.1-1.7B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base uniqueplayer9102/Nora0.1-1.7B, un modelo conversacional de 1.720.574.976 parámetros (~1,7 mil millones) orientado a roleplay y escritura creativa. El modelo base está construido sobre la arquitectura Qwen3, según las etiquetas del repositorio, y se distribuye bajo licencia Apache 2.0. Este repositorio no contiene el modelo original en precisión completa, sino versiones cuantizadas con la técnica imatrix (i1) en una amplia gama de tipos de cuantización, desde IQ1_S hasta Q6_K.

La relevancia de este modelo radica en su tamaño compacto y su enfoque específico: está afinado para conversación de personajes y roleplay, un nicho donde los modelos pequeños especializados pueden ofrecer respuestas coherentes con una huella de memoria muy reducida. Al estar cuantizado en formatos GGUF, puede ejecutarse en hardware de consumo, incluidas CPU y GPUs modestas, lo que lo hace accesible para experimentación local.

El repositorio incluye 25 variantes de cuantización, con tamaños que van desde 0,6 GB (IQ1_S) hasta 1,5 GB (Q6_K), además del archivo imatrix de 0,1 GB para generar cuantizaciones propias. El modelo está etiquetado como "not-for-all-anchored" (contenido no apto para todo público) y entrenado con datasets como PygmalionAI/PIPPA y lipilipic/NSFW_gemma-2b-it-2, lo que indica un enfoque explícito hacia contenido para adultos y conversación de personajes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3, según etiquetas del repositorio) |
| Parámetros totales | 1.720.574.976 (~1,7 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de archivo imatrix) |
| Idiomas soportados | Inglés (según la model card del autor original) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3, un transformer decoder-only con atención causal estándar. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del autor original (uniqueplayer9102/Nora0.1-1.7B) no está incluida en la información proporcionada, por lo que los detalles de entrenamiento no están disponibles.

Los datasets mencionados en las etiquetas son PygmalionAI/PIPPA (dataset de conversaciones de roleplay) y lipilipic/NSFW_gemma-2b-it-2 (dataset de contenido explícito), lo que confirma el enfoque del modelo hacia conversación de personajes y contenido para adultos. Las cuantizaciones de este repositorio utilizan la técnica imatrix de llama.cpp, que emplea una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas, especialmente en los rangos IQ1 a IQ3.

## Capacidades

- Generación de texto conversacional y roleplay: el modelo está afinado específicamente para mantener conversaciones de personajes y escritura creativa.
- Escritura creativa: etiquetado explícitamente para creative-writing, orientado a narrativa y diálogo.
- Conversación multi-turno: diseñado para interacción de personajes estilo Character.AI (etiquetas c.ai, characterai, character.ai).
- Contenido para adultos: entrenado con datasets NSFW y etiquetado como not-for-all-audiences.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión o audio.
- Capacidades multilingües: solo inglés según la model card del autor original.

## Casos de uso

- Roleplay local de personajes: el modelo puede ejecutar conversaciones de personajes en hardware de consumo gracias a sus cuantizaciones de 0,6-1,5 GB, adecuado para aplicaciones de entretenimiento conversacional sin dependencia de la nube.
- Prototipado de chatbots de personajes: útil para desarrolladores que quieran probar mecánicas de conversación multi-turno con un modelo pequeño antes de escalar a modelos mayores.
- Escritura creativa asistida: generación de diálogos y narrativa en inglés, con un estilo entrenado para ficción y conversación de personajes.
- Experimentación con cuantización: el repositorio incluye 25 variantes y el archivo imatrix, lo que permite comparar calidad y tamaño para elegir el equilibrio adecuado en un despliegue concreto.
- Despliegue en dispositivos con recursos limitados: las variantes IQ1/IQ2 (0,6-0,8 GB) permiten ejecutar el modelo en CPU o GPUs integradas para pruebas rápidas.
- Investigación sobre modelos pequeños especializados: útil para estudiar cómo el ajuste fino en datasets de roleplay afecta el comportamiento de un modelo de ~1,7B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~0,6 GB (IQ1_S) y ~1,5 GB (Q6_K) para los pesos; añadir overhead de contexto KV cache (dependiente de la longitud de contexto, no disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones más pequeñas; RTX 3060, RTX 4060 o superiores para las variantes Q4-Q6 con contexto amplio.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs de consumo modernas e incluso en iGPUs y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). No se recomienda vLLM o TGI para GGUF en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Nora0.1-1.7B (este) | ~1,7B | No disponible | Apache 2.0 | Roleplay/conversación, inglés |
| Modelos Qwen3 pequeños (base) | ~1,7B | No disponible | Apache 2.0 | Propósito general |
| Modelos de roleplay de ~1-3B (varios) | 1-3B | Variable | Variable | Roleplay/conversación |

No se dispone de datos de rendimiento comparativos en la información proporcionada. La comparativa se limita a parámetros y licencia; no se han publicado benchmarks que permitan comparar calidad.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está entrenado con datasets explícitos y etiquetado como not-for-all-audiences; no es adecuado para aplicaciones dirigidas a menores o entornos sin filtrado.
- Solo inglés: la model card del autor original indica únicamente inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: como todo modelo generativo de ~1,7B, puede producir afirmaciones falsas o incoherentes, especialmente en cuantizaciones agresivas (IQ1/IQ2).
- Sesgos: no se dispone de información sobre evaluación de sesgos; los datasets de roleplay pueden contener estereotipos.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado y el entrenamiento con datasets NSFW pueden estar sujetos a restricciones legales según la jurisdicción.
- Cuantizaciones de baja calidad: las variantes IQ1_S, IQ1_M y Q2_K_S están marcadas por el autor como "for the desperate" o "very low quality"; no recomendadas para producción.
- Sin datos de contexto: no se conoce la longitud de contexto soportada, lo que limita la planificación de despliegues con conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Nora0.1-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/uniqueplayer9102/Nora0.1-1.7B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Nora0.1-1.7B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Nora0.1-1.7B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset PygmalionAI/PIPPA: https://huggingface.co/datasets/PygmalionAI/PIPPA
- Dataset lipilipic/NSFW_gemma-2b-it-2: https://huggingface.co/datasets/lipilipic/NSFW_gemma-2b-it-2
