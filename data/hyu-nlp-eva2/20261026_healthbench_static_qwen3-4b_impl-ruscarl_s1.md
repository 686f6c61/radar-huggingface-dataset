# HYU-NLP-EVA2/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1

## Resumen

Este repositorio contiene una colección de puntos de control de un ajuste fino experimental del modelo base Qwen3-4B-Instruct-2507, desarrollado por el grupo HYU-NLP-EVA2. El entrenamiento se declara como aprendizaje por refuerzo sobre HealthBench en su variante estática, con evaluación mediante rúbrica por ítem. No se trata de un modelo final ni de una versión validada para uso clínico, sino de un artefacto de investigación destinado a reproducir y analizar la evolución del ajuste paso a paso.

El interés principal reside en que se publican snapshots intermedios del entrenamiento —bajo `checkpoints/global_step_XXXXXX/`— con pesos en safetensors BF16, configuración y tokenizador. El repositorio ocupa 72,4 GB y no incluye métricas, resultados de benchmarks ni documentación sobre el dataset o el algoritmo de RL empleado. La model card solo indica un objetivo de 140 pasos de entrenamiento y que los checkpoints se suben de forma asíncrona.

Por tanto, es relevante para equipos que investigan RL aplicado a evaluación sanitaria, para estudiar olvido catastrófico respecto al modelo base y para auditar rúbricas clínicas ítem por ítem. No debe confundirse con un modelo listo para producción: no hay licencia declarada, no se documentan idiomas y no se han publicado resultados cuantitativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen3-4B-Instruct-2507; no se detalla en la model card |
| Parámetros totales | 4B (según el nombre del repositorio y el modelo base) |
| Parámetros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 en safetensors; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors BF16 en subcarpetas `checkpoints/global_step_XXXXXX` |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del repositorio | 72,4 GB |
| Checkpoints publicados | snapshots intermedios por paso global; objetivo declarado de 140 pasos |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplica un ajuste fino etiquetado como `reinforcement-learning` y `healthbench`, orientado a mejorar el cumplimiento de rúbricas por ítem en la variante estática de HealthBench. La model card no especifica el algoritmo de RL, el modelo de recompensa, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como DPO, RLHF o congelación de capas.

La información disponible tampoco aclara el significado del sufijo `impl-ruscarl_s1`, ni si el entrenamiento se realizó sobre pesos completos o mediante adaptadores. Los checkpoints publicados son safetensors BF16 con configuración y tokenizador, y pueden cargarse seleccionando la subcarpeta correspondiente con `subfolder` en `transformers`. El repositorio publica únicamente checkpoints: los estados de reanudación y las salidas de entrenamiento permanecen en el archivo local del experimento.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredada del modelo base Qwen3-4B-Instruct-2507.
- Especialización declarada en HealthBench estático mediante rúbricas por ítem, orientada a evaluación de respuestas sanitarias.
- Publicación de múltiples checkpoints intermedios, lo que permite analizar la evolución del modelo durante el entrenamiento.
- No hay evidencia publicada de soporte de tool calling o function calling en esta variante.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso medido o planificación autónoma.
- No se documentan capacidades de visión, audio ni otros modalidades.
- No se documentan capacidades multilingües específicas; el dato de idiomas no está disponible.
- No se documenta un modo de razonamiento extendido o “thinking mode” en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por refuerzo para dominios sanitarios: cargar checkpoints en pasos concretos y medir la evolución del cumplimiento de rúbricas HealthBench por ítem. Es adecuado porque el repositorio expone snapshots intermedios y el modelo base de 4B permite barridos relativamente económicos.
- Reproducción de experimentos: utilizar `AutoModelForCausalLM.from_pretrained` con la subcarpeta `checkpoints/global_step_XXXXXX` para replicar evaluaciones sin reentrenar. Resulta útil para comparar resultados entre pasos y verificar la estabilidad del entrenamiento.
- Auditoría de rúbricas clínicas: generar respuestas a ítems de HealthBench y revisar criterio por criterio qué cumple y qué no. Sirve para detectar atajos, respuestas superficiales o desalineación con la rúbrica.
- Comparación entre modelo base y modelo ajustado: evaluar prompts generales y sanitarios en Qwen3-4B-Instruct-2507 frente a los checkpoints para medir regresión y olvido catastrófico. Es un caso realista en investigación de ajuste fino.
- Selección offline de checkpoint para anotación asistida: generar borradores de respuestas sanitarias para revisión humana, nunca para decisión clínica directa. El tamaño de 4B permite desplegarlo en una sola GPU para experimentación interna.
- Integración en un harness de evaluación automatizado: ejecutar pruebas con `transformers` en pipelines de CI de investigación, comparando métricas de rúbrica entre pasos y detectando degradaciones antes de continuar el entrenamiento.
- Estudio de estabilidad y sobreajuste: analizar si pasos avanzados mejoran HealthBench pero empeoran en prompts fuera de dominio, usando los checkpoints intermedios como serie temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica el objetivo de 140 pasos de entrenamiento y la subida asíncrona de checkpoints; no incluye puntuaciones de HealthBench, MMLU, HumanEval, GSM8K ni de ninguna otra evaluación.

| Benchmark | Resultado |
|---|---|
| HealthBench static | no publicado |
| MMLU | no publicado |
| HumanEval | no publicado |
| GSM8K | no publicado |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para los pesos de 4B; con caché KV y overhead, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB de pesos y 6-8 GB con overhead, aunque el repositorio no publica pesos cuantizados.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,5-3 GB de pesos y 4-6 GB con overhead, requiriendo conversión externa no incluida.
- GPU de consumo: RTX 4090 o RTX 3090 de 24 GB para BF16 con comodidad; RTX 4060 Ti de 16 GB para BF16 con contextos moderados; GPU de 8 GB solo viables con cuantización de 4 bits y conversión previa.
- GPU de datacenter: A100 de 40 GB u 80 GB, H100 o L40S para inferencia y evaluaciones por lotes.
- Despliegue: `transformers` es la vía documentada, usando la subcarpeta del checkpoint. vLLM o TGI requerirían descargar y organizar los pesos del paso elegido. llama.cpp u Ollama requerirían convertir a GGUF, formato no publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de respuesta.
- Almacenamiento: el repositorio completo ocupa 72,4 GB, por lo que conviene descargar solo la subcarpeta del checkpoint necesario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (HealthBench static Qwen3-4B) | 4B | no disponible | no disponible | Ajuste por RL para rúbricas HealthBench | Checkpoints de investigación en HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en la información | no disponible en la información | Modelo generalista de instrucciones | HuggingFace |
| Qwen2.5-3B-Instruct | 3B | no disponible en la información | no disponible en la información | Modelo generalista de instrucciones | HuggingFace |
| Llama-3.2-3B-Instruct | 3B | no disponible en la información | no disponible en la información | Modelo generalista de instrucciones | HuggingFace |

La comparación es solo orientativa por tamaño y enfoque. No se dispone de datos verificados de contexto, licencia o rendimiento de las alternativas en la información proporcionada, y este repositorio no publica benchmarks que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial, redistribución ni creación de derivados sin consultar al autor y al modelo base.
- Modelo experimental: se publican checkpoints intermedios de un entrenamiento con objetivo de 140 pasos, no una versión final validada.
- Ausencia de benchmarks: no hay evidencia cuantitativa de mejora frente al modelo base ni de comportamiento en dominios fuera de HealthBench.
- Riesgo sanitario: cualquier salida relacionada con salud debe ser revisada por profesionales; el modelo no está validado para diagnóstico, tratamiento ni consejo clínico.
- Riesgo de alucinación: al ser un modelo generativo de 4B, puede inventar hechos, referencias o recomendaciones médicas.
- Posible sobreajuste a la rúbrica: HealthBench estático con evaluación por ítem puede favorecer respuestas que cumplen criterios superficiales sin comprensión clínica real.
- Sesgos heredados: no se documenta la composición del dataset de ajuste ni los sesgos del modelo base; pueden persistir sesgos demográficos, culturales y lingüísticos.
- Idiomas no documentados: no se confirma un rendimiento multilingüe ni la calidad en castellano.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de uso.
- Checkpoints posiblemente inestables: al ser snapshots intermedios, el comportamiento puede variar de forma significativa entre pasos.
- Falta de documentación técnica: no se especifican algoritmo de RL, dataset, modelo de recompensa ni configuración de entrenamiento.
- Requisitos de almacenamiento: 72,4 GB de repositorio completo pueden ser costosos de descargar y versionar.

## Enlaces

- [HuggingFace: HYU-NLP-EVA2/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1](https://huggingface.co/HYU-NLP-EVA2/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1)
- [Colección de experimentos HealthBench Qwen3-4B](https://huggingface.co/collections/HYU-NLP-EVA2/20261027-healthbench-qwen3-4b-per-item-checkpoints-6adf71a8d93db25bb7ab22cb)
- [Modelo base Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
