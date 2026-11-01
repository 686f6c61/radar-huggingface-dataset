# hell0ks/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ko

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ko es un checkpoint cuantizado del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicado por el usuario `hell0ks` en HuggingFace. Se trata de una cuantización EXL3 (formato EXL3 de ExLlamaV3) a 2,9 bits por peso, orientada específicamente a inferencia en coreano mediante un conjunto de calibración centrado en ese idioma. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 105.318.449.362 parámetros totales, según los datos de safetensors del repositorio.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de más de 100.000 millones de parámetros con un peso en disco de aproximadamente 210,8 GB, lo que reduce drásticamente los requisitos de VRAM frente a los pesos en precisión completa. Por otro, el calibrado en coreano hace que esta variante sea útil para aplicaciones en ese idioma, aunque el modelo base conserva las capacidades generales de razonamiento, código y matemáticas.

No obstante, conviene advertir desde el principio: el autor indica que el repositorio no contiene los "engrams" (shards 47-48), lo que puede afectar a la integridad del checkpoint. Además, la model card es muy escueta y no aporta datos sobre arquitectura interna, contexto, benchmarks ni proceso de entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), familia `deepseek_v41` |
| Parámetros totales | 105.318.449.362 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 2,9 bits por peso (2.9bpw) |
| Idiomas soportados | coreano (`ko`); el modelo base probablemente multilingüe, pero no se especifica |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, compatible con ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia DeepSeek V4.1 Flash, identificada en los tags como `deepseek_v41`, y está etiquetado como `moe` (mixture-of-experts). Los datos de safetensors confirman 105.318.449.362 parámetros totales, aunque no se dispone de información sobre el número de parámetros activos por token, el número de expertos, la dimensión oculta ni la longitud de contexto nativa. Tampoco se detalla el volumen de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de este repositorio no está en la arquitectura, sino en el proceso de cuantización. Se ha aplicado EXL3 a 2,9 bits por peso con un conjunto de calibración específicamente coreano: un 40% de ficción (privada), 10% de prosa general (privada), 35% de código del subconjunto `code_ko` de `nvidia/Nemotron-SFT-Multilingual-v2`, 10% de matemáticas (`math_ko`) y 5% de STEM (`stem_ko`). El total de tokens de calibración es de aproximadamente 511.000, todos en coreano salvo las trazas de razonamiento. El checkpoint utiliza la plantilla de chat `chat_template.jinja` del repositorio `LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw`.

## Capacidades

- Generación de texto conversacional y de prosa general, con calibración específica para coreano.
- Generación de código, reforzada por el 35% de datos de calibración del subconjunto `code_ko`.
- Razonamiento matemático, con un 10% de calibración en `math_ko`.
- Contenido STEM, con un 5% de calibración en `stem_ko`.
- Capacidades heredadas del modelo base DeepSeek V4.1 Flash (razonamiento, código, matemáticas), aunque no se documentan en detalle.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el repositorio declara únicamente `ko`; el comportamiento en otros idiomas no está documentado.
- Modo "thinking" o vision/audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de ficción y narrativa en coreano: el 40% del calibrado son datos de ficción privada, lo que hace que esta variante sea especialmente adecuada para escribir relatos, diálogos y descripciones con un estilo natural en coreano.
- Asistencia a la escritura y corrección de prosa en coreano: el 10% de prosa general del calibrado permite usar el modelo para reescribir, resumir o pulir textos administrativos y periodísticos.
- Generación y revisión de código con comentarios en coreano: el subconjunto `code_ko` (35%) entrena la cuantización para preservar la calidad en tareas de programación donde la documentación o los prompts están en coreano.
- Resolución de problemas matemáticos en coreano: el 10% de `math_ko` permite usar el modelo en tutoría o generación de ejercicios resueltos en ese idioma.
- Explicación de conceptos STEM en coreano: el 5% de `stem_ko` cubre preguntas de física, química o biología, útil en entornos educativos.
- Despliegue en hardware limitado: al ocupar aproximadamente 210,8 GB en disco y usar EXL3 a 2,9 bpw, permite servir un modelo de 105.000 millones de parámetros en configuraciones multi-GPU de gama alta (por ejemplo, dos DGX Sparks o dos GB10, según las recetas enlazadas por el autor), algo inviable con pesos en FP16.
- Experimentación con cuantización de bajo bit en coreano: investigadores que estudien el impacto de EXL3 en idiomas de bajos recursos pueden usar este checkpoint como referencia frente a la versión sin calibración coreana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 105.318.449.362 parámetros a 2,9 bits por peso, el peso teórico ronda los 38 GB; en la práctica, el repositorio ocupa 210,8 GB, por lo que se recomienda planificar con margen amplio para pesos, caché KV y overhead de ExLlamaV3.
- GPU recomendadas: el autor enlaza recetas para dos DGX Sparks y para dos GB10 (TensorFold TP2), lo que sugiere configuraciones multi-GPU de gama alta. Para servir el modelo completo se necesitan varias GPU con memoria agregada suficiente.
- ¿Cabe en GPU de consumo? No es viable en una única GPU de consumo (RTX 4090, 24 GB). Requiere un entorno multi-GPU o con memoria unificada de gran capacidad.
- Opciones de despliegue: ExLlamaV3 (formato EXL3 nativo), forks de TensorFold (MiaAI-Lab, bartholomus) para topologías multi-GPU específicas. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ko (este) | 105,3 B | no disponible | EXL3 2,9 bpw, calibrado en coreano | MIT | HuggingFace, 164 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 105,3 B (según este repo) | no disponible | pesos originales | no disponible | HuggingFace |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw | no disponible | no disponible | EXL3 2,9 bpw | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado ni de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene los "engrams" (shards 47-48), según advierte el propio autor; esto puede implicar pesos incompletos o un comportamiento degradado en ciertas capas.
- La model card no documenta sesgos conocidos, pero al ser un modelo entrenado principalmente con datos multilingües y calibrado en coreano, es probable que herede sesgos del modelo base y del corpus de calibración.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas para esta cuantización.
- Limitaciones de idioma: el repositorio declara únicamente coreano; el rendimiento en castellano u otros idiomas no está garantizado y puede degradarse respecto al modelo base.
- Restricciones de licencia: MIT permite uso comercial, pero conviene verificar la licencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, que no se detalla en la información disponible.
- La cuantización a 2,9 bpw puede producir pérdida de calidad frente a pesos en FP16/BF16, especialmente en tareas de razonamiento complejo; no hay benchmarks que cuantifiquen esa pérdida.
- El checkpoint depende de ExLlamaV3 y de forks específicos (TensorFold) para multi-GPU, lo que limita la portabilidad a otros motores de inferencia.
- No se documenta la longitud de contexto nativa, lo que impide planificar aplicaciones con ventanas largas.

## Enlaces

- [HuggingFace: hell0ks/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ko](https://huggingface.co/hell0ks/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ko)
- [Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
- [Checkpoint de referencia: LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw](https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw)
- [Dataset de calibración: nvidia/Nemotron-SFT-Multilingual-v2](https://huggingface.co/datasets/nvidia/Nemotron-SFT-Multilingual-v2)
- [Repositorio MiaAI-Lab (GLM-5.3-Flash-EXL3-2x-DGX-Sparks)](https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks)
- [Repositorio bartholomus (deepseek-v4.1-tensorfold-tp2-2xgb10)](https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10)
