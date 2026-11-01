# nightmedia/Qwen3.8-27B-Metaphor-qx86-hi-mlx

## Resumen

Qwen3.8-27B-Metaphor-qx86-hi-mlx es un modelo experimental de 27 356 728 560 parámetros (aproximadamente 27,36 mil millones) publicado por el usuario nightmedia en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un merge (fusión de pesos) que combina diez modelos base de la familia Qwen3.8-27B, entre ellos schneewolflabs/B0-27B, OmniJev/OneJev1.6-27B, shunzou05/TerminalHorizon-27B, inclusionAI/ZwZ2-27B y varios derivados del propio autor (Seven, Brainwaves, MindMeld). El resultado es un modelo multimodal de tipo image-text-to-text orientado a razonamiento, generación de código, escritura creativa y roleplay.

El modelo se distribuye en una cuantización concreta, qx86-hi, que según la model card mantiene una perplejidad de 3,615 ± 0,022 frente a 3,613 ± 0,022 del bf16, con un pico de memoria de 33,15 GB y un throughput de 212 tokens por segundo en el hardware de referencia del autor. El repositorio ocupa 27,2 GB y los pesos están en formato safetensors, con licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo típico de la práctica de merges comunitarios sobre la familia Qwen, donde se combinan adaptadores LoRA y modelos afinados para obtener capacidades agregadas; por otro lado, advierte de que se trata de un artefacto experimental, con muy poca tracción (49 descargas, 0 likes en el momento de la consulta) y sin benchmarks publicados más allá de las pruebas internas del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen3.8, tags qwen3_5/qwen3_6; detalles exactos no disponibles |
| Parámetros totales | 27 356 728 560 (≈27,36 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | los tags mencionan "1M context" y "256k context"; el valor efectivo no está confirmado en la model card |
| Tipos de cuantización | qx86-hi (la publicada); la model card reporta además bf16, mxfp8, q8-hi, q6-hi, q5-hi, qx64-hi, q4-hi y mxfp4 en sus pruebas |
| Idiomas soportados | inglés (en), chino (zh), japonés (ja), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento original. Según la model card, combina nightmedia/Qwen3.8-27B-MindMeld, schneewolflabs/B0-27B, OmniJev/OneJev1.6-27B, shunzou05/TerminalHorizon-27B, etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated, inclusionAI/ZwZ2-27B y gordonhu/Tev-27B, y la lista completa de base_model incluye además schneewolflabs/B1-27B, nightmedia/Qwen3.6-27B-Seven y nightmedia/Qwen3.8-27B-Brainwaves. La técnica declarada es mergekit, con etiquetas que apuntan a SFT, LoRA y destilación de Claude 4.6 en alguno de los componentes. La arquitectura subyacente es la de la familia Qwen3.8, un transformer multimodal capaz de procesar imagen y texto, con soporte declarado de razonamiento en cadena de pensamiento larga (long-cot).

Los componentes aportan capacidades especializadas: B0-27B es un modelo visión-lenguaje de 27B entrenado para escribir Hemlock, con una puntuación HemBench de 33/38 (86,8 %) y pass@1 de 0,816; Tev-27B es un agente de terminal de horizonte largo entrenado con RL sobre Tev-Gym con recompensa de potencial de progreso. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el merge final, ya que el autor no los publica.

## Capacidades

- Generación de texto conversacional y instruction-tuned, con modo de razonamiento explícito (chain-of-thought, long-cot).
- Generación de código y tareas de ingeniería de software; el componente B0 está especializado en el lenguaje Hemlock.
- Razonamiento matemático y STEM, según los tags del repositorio.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con entrada multimodal.
- Escritura creativa: ficción, generación de tramas y subtramas, continuación de escenas, ciencia ficción y todos los géneros.
- Roleplay y narrativa inmersiva, con énfasis en prosa vívida ("vivid prosing").
- Capacidades multilingües en inglés, chino, japonés y español.
- Soporte declarado de contexto largo (tags de 256k y 1M), aunque sin confirmación técnica en la model card.
- Compatibilidad con endpoints (tag endpoints_compatible) y con el ecosistema transformers.

## Casos de uso

- Agentes de terminal y automatización de operaciones: el componente Tev-27B fue entrenado con RL para tareas de horizonte largo en terminal, por lo que el merge puede emplearse en scripts de administración de sistemas, depuración de entornos y ejecución de pipelines de CI/CD con pasos múltiples.
- Generación de código en producción: con soporte de tool calling implícito en la familia Qwen y especialización en Hemlock vía B0, encaja en asistentes de IDE y revisión automática de parches.
- Escritura creativa y narrativa: la combinación de MindMeld y Brainwaves está orientada a ficción, generación de tramas y continuación de escenas, adecuada para herramientas de autor y generación de guiones.
- Roleplay y simulación de personajes: la model card incluye ejemplos explícitos de diálogo inmersivo (Star Trek, holodeck), lo que lo hace apto para motores de chat con personalidad y videojuegos narrativos.
- Asistencia multimodal documental: al ser image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos.
- Investigación sobre merges y cuantización: el modelo documenta curvas de perplejidad y memoria para ocho cuantizaciones, lo que lo convierte en un banco de pruebas útil para estudiar el impacto de qx86-hi frente a bf16 en modelos de 27B.
- Atención al cliente multilingüe: con cobertura de en, zh, ja y es, puede gestionar conversaciones multi-turno en esos cuatro idiomas, aunque sin garantías de calidad fuera de ellos.

## Benchmarks y rendimiento

Los únicos datos publicados son las pruebas internas del autor (suite "brainwaves") sobre tareas de elección múltiple y las métricas de cuantización. No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Tarea | bf16 | qx86-hi | q8-hi | q4-hi | mxfp4 |
|---|---|---|---|---|---|
| arc | 0,744 | 0,743 | 0,745 | 0,743 | 0,740 |
| arc/e | 0,902 | 0,903 | 0,904 | 0,902 | 0,893 |
| boolq | 0,915 | 0,916 | 0,916 | 0,912 | 0,917 |
| hswag | 0,838 | no disponible | no disponible | 0,839 | 0,832 |
| obkqa | 0,536 | no disponible | no disponible | 0,534 | 0,528 |
| piqa | 0,834 | no disponible | no disponible | 0,833 | 0,829 |
| wino | 0,800 | no disponible | no disponible | 0,796 | 0,791 |

| Cuantización | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| bf16 | 3,613 ± 0,022 | 60,70 GB | 259 |
| mxfp8 | 3,620 ± 0,022 | 34,64 GB | 201 |
| q8-hi | 3,612 ± 0,022 | 37,16 GB | 205 |
| qx86-hi | 3,615 ± 0,022 | 33,15 GB | 212 |
| q6-hi | 3,615 ± 0,022 | 30,44 GB | 212 |
| q5-hi | 3,627 ± 0,022 | 27,08 GB | 209 |
| qx64-hi | 3,629 ± 0,022 | 26,93 GB | 219 |
| q4-hi | 3,652 ± 0,022 | 23,72 GB | 214 |
| mxfp4 | 3,706 ± 0,022 | 21,20 GB | 221 |

El componente B0 reporta HemBench 33/38 (86,8 %) y pass@1 0,816, pero corresponde al modelo base, no al merge completo.

## Requisitos de hardware

- VRAM estimada para inferencia: 33,15 GB de pico en qx86-hi según el autor; 60,70 GB en bf16; 23,72 GB en q4-hi; 21,20 GB en mxfp4.
- GPU recomendadas: A100 80 GB o H100 para bf16; A100 40 GB, L40S 48 GB o RTX 6000 Ada para qx86-hi; GPUs de 24 GB (RTX 4090, RTX 3090) solo con q4-hi o mxfp4 y posible offload.
- Cabe en consumer GPU: sí, en RTX 4090/3090 con cuantizaciones de 4 bits; en 24 GB no cabe en qx86-hi sin offloading.
- Opciones de despliegue: transformers (librería declarada), con compatibilidad de endpoints; el tag mlx sugiere soporte para Apple Silicon vía MLX. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 212 tokens/s en qx86-hi, 259 tokens/s en bf16, 221 tokens/s en mxfp4, medidos en el hardware de referencia del autor (no especificado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Metaphor-qx86-hi-mlx | 27,36 B | 256k/1M (según tags) | Apache 2.0 | Merge experimental, multimodal, qx86-hi |
| nightmedia/Qwen3.8-27B-MindMeld | 27 B (aprox.) | no disponible | no disponible | Componente del merge; base de escritura creativa |
| OmniJev/OneJev1.6-27B | 27 B (aprox.) | no disponible | no disponible | Componente del merge |
| schneewolflabs/B0-27B | 27 B (aprox.) | no disponible | no disponible | Componente; HemBench 86,8 %, pass@1 0,816 |

No se dispone de datos comparativos de rendimiento frente a modelos externos a la familia; la comparación se limita a los componentes del propio merge.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta explícitamente como "experimental"; no hay validación independiente ni benchmarks estándar publicados.
- Tracción mínima: 49 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos hayan sido detectados por la comunidad.
- Riesgo de alucinación: al ser un merge de modelos afinados con destilación y SFT, puede heredar inconsistencias y fabricar datos, especialmente en dominios STEM y código.
- Contexto no verificado: los tags afirman 256k y 1M de contexto, pero la model card no documenta pruebas de recuperación en ventanas largas; no debe asumirse en producción sin validación propia.
- Cobertura lingüística limitada a en, zh, ja y es; el rendimiento en español no está cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero los modelos base pueden tener condiciones adicionales no verificadas; conviene revisar cada componente antes de desplegar.
- La cuantización publicada (qx86-hi) requiere al menos 33 GB de VRAM, lo que excluye GPUs de consumo sin offload.
- Sin garantías de soporte ni mantenimiento por parte del autor; el repositorio no incluye documentación de seguridad, filtros de contenido ni evaluaciones de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.8-27B-Metaphor-qx86-hi-mlx
- Componente B0-27B: https://huggingface.co/schneewolflabs/B0-27B
- Componente B1-27B: https://huggingface.co/schneewolflabs/B1-27B
- Componente OneJev1.6-27B: https://huggingface.co/OmniJev/OneJev1.6-27B
- Componente TerminalHorizon-27B: https://huggingface.co/shunzou05/TerminalHorizon-27B
- Componente Ostrich-27B-261028-Qwen3.8-Abliterated: https://huggingface.co/etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated
- Componente ZwZ2-27B: https://huggingface.co/inclusionAI/ZwZ2-27B
- Componente Tev-27B: https://huggingface.co/gordonhu/Tev-27B
- Componente Seven: https://huggingface.co/nightmedia/Qwen3.6-27B-Seven
- Componente Brainwaves: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves
- Componente MindMeld: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld
- Base de B0 (WichtelHui-Qwen3.8-27B-SLERP): https://huggingface.co/DragonBophades/WichtelHui-Qwen3.8-27B-SLERP
- LoRA de Hemlock: https://huggingface.co/hemlang/Hemlock-Qwen3.8-27B-LoRA
- Repositorio Hemlock: https://github.com/hemlang/hemlock
