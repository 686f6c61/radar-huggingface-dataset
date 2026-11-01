# gbrixi/evo2_7b_microviridae_vllm

## Resumen

Evo 2 7B Microviridae (vLLM) es un modelo de lenguaje de ADN especializado en genómica, desarrollado por el equipo de Arc Institute (modelo base Evo 2) y publicado en este repositorio por el usuario gbrixi. Se trata de un ajuste fino (*fine-tuning*) del modelo base Evo 2 7B sobre un conjunto curado de genomas de Microviridae (una familia de bacteriófagos de ADN circular monocatenario). El modelo resuelve el problema del modelado y diseño de secuencias de ADN a resolución de nucleótido único, una tarea relevante para la investigación en virología, biología sintética y análisis funcional de genomas víricos.

La arquitectura subyacente es StripedHyena 2, una arquitectura híbrida de convoluciones y atención de largo alcance implementada con el framework Savanna, que permite modelar secuencias de ADN de hasta un millón de pares de bases en los checkpoints completos. Este checkpoint concreto está limitado a una longitud de contexto de 10.240 tokens (pares de bases) y contiene 6.485.725.238 parámetros totales, según los pesos en safetensors.

La relevancia de esta variante radica en su especialización: al estar ajustada sobre genomas de Microviridae, concentra su capacidad en el modelado de este grupo de fagos, lo que puede resultar útil para tareas de anotación, generación de variantes y análisis de secuencias relacionadas. Además, se distribuye como checkpoint convertido para el backend vLLM de Evo 2, lo que facilita su despliegue en entornos de inferencia de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StripedHyena 2 (híbrida convolución/atención de largo alcance), framework Savanna |
| Parametros totales | 6.485.725.238 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 10.240 tokens (pares de bases) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint para backend vLLM) |

## Arquitectura y entrenamiento

El modelo se basa en StripedHyena 2, una arquitectura híbrida que combina capas convolucionales de señal profunda con mecanismos de atención para modelar dependencias de largo alcance sobre secuencias. El modelo base Evo 2 fue entrenado de forma autorregresiva sobre OpenGenome2, un corpus de 8,8 billones de tokens que abarca todos los dominios de la vida, a resolución de nucleótido único y con contexto de hasta un millón de pares de bases en sus versiones completas. La implementación utiliza el framework Savanna, y este checkpoint concreto tiene 32 capas según la tabla de checkpoints vLLM del autor.

Esta variante Microviridae se obtiene mediante ajuste fino del modelo base Evo 2 7B sobre un conjunto curado de genomas de Microviridae, con un checkpoint final tras 12.000 iteraciones y una longitud de contexto de 10.240 tokens. No se especifican en la información disponible detalles sobre la composición exacta del dataset de ajuste fino, el número de tokens empleados en esta fase ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio indica que se trata de una conversión del checkpoint original (evo-design/evo-2-7b-8k-microviridae) a safetensors para el backend vLLM, manteniendo el mismo modelo.

## Capacidades

- Modelado de secuencias de ADN a resolución de nucleótido único, con especialización en genomas de Microviridae.
- Generación autorregresiva de secuencias de ADN (útil para propuestas de variantes y exploración de secuencias).
- Puntuación de verosimilitud de secuencias, aplicable a la evaluación de variantes y regiones genómicas.
- Modelado de contexto de hasta 10.240 pares de bases en este checkpoint.
- Integración con el backend vLLM de Evo 2 para inferencia de alto rendimiento.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades multilingües de lenguaje natural ni modalidades de visión o audio.

## Casos de uso

- Análisis de genomas de Microviridae: el modelo puede puntuar y modelar secuencias de esta familia de fagos, facilitando la identificación de regiones conservadas o funcionalmente relevantes gracias a su ajuste específico sobre este grupo.
- Anotación asistida de genomas víricos: con contexto de 10.240 pares de bases, permite procesar genomas completos de fagos pequeños en una sola ventana y evaluar la plausibilidad de marcos abiertos de lectura.
- Generación de variantes de secuencia para experimentación: el modelado autorregresivo permite proponer secuencias candidatas dentro del espacio de Microviridae, que luego pueden validarse experimentalmente.
- Puntuación de mutaciones y variantes: el modelo puede emplearse para comparar la verosimilitud de secuencias mutadas frente a la referencia, apoyando estudios de impacto funcional.
- Detección de secuencias atípicas o contaminantes: al estar especializado en Microviridae, puede servir como referencia para discriminar secuencias de este grupo frente a otras familias víricas.
- Despliegue en pipelines de bioinformática: al estar convertido para vLLM, puede integrarse en servicios de inferencia de alto rendimiento para procesar lotes de secuencias genómicas de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 11,6 GB en safetensors, por lo que en precisión nativa (probablemente bf16/fp16) se requiere en torno a 13-16 GB de VRAM considerando pesos y memoria de activaciones y caché.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabría esperar GPUs con al menos 16-24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) para inferencia cómoda en precisión nativa.
- GPU de consumo: es plausible que quepa en GPUs de consumo con 24 GB de VRAM (RTX 3090/4090) en precisión nativa; con cuantización a 8 bits o 4 bits podría reducirse el requisito, aunque no se documentan tipos de cuantización para este checkpoint.
- Opciones de despliegue: backend vLLM de Evo 2 (según la model card); para el backend Vortex se indica usar el checkpoint original evo-design/evo-2-7b-8k-microviridae.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gbrixi/evo2_7b_microviridae_vllm | 6,49 B | 10.240 tokens | Microviridae (fagos) | Apache 2.0 | HuggingFace (backend vLLM) |
| evo-design/evo-2-7b-8k-microviridae | no disponible | 8.192 tokens (según nombre) | Microviridae (fagos) | Apache 2.0 | HuggingFace (backend Vortex) |
| gbrixi/evo2_7b_base_vllm | 7 B | 8.192 tokens | ADN general (base) | Apache 2.0 | HuggingFace (backend vLLM) |
| gbrixi/evo2_7b_262k_vllm | 7 B | 262.144 tokens | ADN general, contexto largo | Apache 2.0 | HuggingFace (backend vLLM) |

## Limitaciones y advertencias

- El modelo está especializado en Microviridae; su rendimiento en otras familias víricas o en genomas eucariotas puede ser inferior al del modelo base Evo 2 7B.
- Es un modelo de secuencias de ADN, no de lenguaje natural: no debe esperarse comportamiento conversacional ni multilingüe.
- Riesgo de generar secuencias biológicamente no viables o artefactos: las propuestas generadas requieren validación experimental y bioinformática.
- No se documentan sesgos específicos, pero al derivar de un corpus (OpenGenome2) que abarca todos los dominios de la vida, puede reflejar desequilibrios de representación del dataset original.
- La longitud de contexto de este checkpoint (10.240 tokens) es muy inferior a la de otros checkpoints de la familia (hasta 1 millón de pares de bases), lo que limita el análisis de genomas largos en una sola ventana.
- No se documentan tipos de cuantización ni requisitos de hardware oficiales; las estimaciones de VRAM son orientativas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset OpenGenome2.
- Para el backend Vortex debe usarse el checkpoint original, no este, que está convertido para vLLM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gbrixi/evo2_7b_microviridae_vllm
- Modelo base (checkpoint original): https://huggingface.co/evo-design/evo-2-7b-8k-microviridae
- Repositorio GitHub de Evo 2: https://github.com/ArcInstitute/evo2
- Framework Savanna (StripedHyena 2): https://github.com/Zymrael/savanna
- Paper de StripedHyena 2: https://github.com/Zymrael/savanna/blob/main/paper.pdf
- Dataset OpenGenome2: https://huggingface.co/datasets/arcinstitute/opengenome2
- Checkpoints vLLM relacionados: https://huggingface.co/gbrixi/evo2_20b_vllm, https://huggingface.co/gbrixi/evo2_7b_vllm, https://huggingface.co/gbrixi/evo2_7b_base_vllm, https://huggingface.co/gbrixi/evo2_1b_base_vllm, https://huggingface.co/gbrixi/evo2_7b_262k_vllm
