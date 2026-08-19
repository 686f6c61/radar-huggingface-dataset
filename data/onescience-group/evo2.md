# OneScience-Group/evo2

## Resumen

Evo2 es un modelo fundacional a gran escala para secuencias genómicas (ADN/ARN) desarrollado por OneScience-Group. Está diseñado para generar, completar y predecir funciones de secuencias de ADN/ARN, ofreciendo una herramienta unificada de modelado de secuencias para la investigación genómica. El modelo se basa en una arquitectura híbrida que combina operadores Hyena con gating convolucional, y admite ventanas de contexto a escala de millones de tokens, lo que permite procesar fragmentos genómicos largos.

El modelo se ha preentrenado con datos genómicos multi-especie que contienen billones de pares de bases, y acepta secuencias de nucleótidos crudas como entrada. Evo2 soporta generación autoregresiva, clasificación de secuencias y extracción de embeddings, y es compatible con entrenamiento distribuido multi-GPU y mezcla flexible de datos. Según la model card, alcanza resultados destacados en benchmarks como GenBench, aunque no se proporcionan cifras concretas. El repositorio incluye un checkpoint de 7B en formato NeMo, junto con scripts de inferencia, predicción y entrenamiento, así como datos de ejemplo para validar el flujo de trabajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (operadores Hyena + gating convolucional) |
| Parametros totales | 7B (según el checkpoint `evo2_nemo_7b`) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | Escala de millones de tokens (no se especifica el valor exacto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación y etiquetas; el modelo opera sobre secuencias de nucleótidos) |
| Licencia | Apache-2.0 |
| Formato de pesos | NeMo (checkpoint en `checkpoints/evo2_nemo_7b/weights`); también se menciona un tokenizer Byte-Level con datos `.bin/.idx` |

## Arquitectura y entrenamiento

Evo2 emplea una arquitectura híbrida que integra operadores Hyena (una alternativa a la atención estándar, basada en convoluciones de orden superior) con mecanismos de gating convolucional. Esta combinación permite manejar secuencias largas de manera eficiente, alcanzando ventanas de contexto de millones de tokens sin el coste cuadrático de la atención tradicional. El modelo se preentrena sobre datos genómicos multi-especie que suman billones de pares de bases, utilizando secuencias de nucleótidos crudas como entrada. No se especifica el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO; la model card solo menciona que es compatible con fine-tuning y validación funcional posterior.

El repositorio incluye un tokenizer Byte-Level que convierte datos FASTA/JSON en formatos `.bin/.idx` para el entrenamiento. También se proporcionan scripts para entrenamiento distribuido (incluido un script para entornos Slurm) y para inferencia y predicción. La implementación está orientada a entornos con GPU o DCU (unidades de cómputo de AMD), requiriendo el kit DTK en el caso de DCU.

## Capacidades

- Generación de secuencias de ADN/ARN: a partir de un prompt de entrada (por ejemplo, "ATGCGT"), el modelo genera fragmentos de secuencia posteriores de forma autoregresiva.
- Predicción de funciones: puede predecir funciones de secuencias genómicas, incluyendo la evaluación de efectos de variantes.
- Clasificación de secuencias: soporta tareas de clasificación sobre secuencias de entrada.
- Extracción de embeddings: permite obtener representaciones vectoriales de secuencias para downstream tasks.
- Preentrenamiento y fine-tuning: compatible con entrenamiento desde cero o adaptación a partir de pesos existentes.
- Entrenamiento distribuido: soporta multi-GPU y entornos de cluster (Slurm).
- Flexibilidad de mezcla de datos: permite combinar distintas fuentes de datos genómicos durante el entrenamiento.
- No se mencionan capacidades de tool calling, agentes, visión ni audio; el modelo está especializado en datos genómicos.

## Casos de uso

- Generación de secuencias genómicas: investigadores pueden usar Evo2 para completar o extender fragmentos de ADN/ARN a partir de un segmento conocido, útil en diseño de secuencias sintéticas o en la exploración de regiones no caracterizadas.
- Predicción de efectos de variantes: el modelo puede evaluar el impacto funcional de mutaciones en secuencias, ayudando en estudios de asociación genética y medicina de precisión.
- Anotación de elementos reguladores: mediante clasificación de secuencias, Evo2 puede identificar promotores, potenciadores u otras regiones regulatorias en genomas de múltiples especies.
- Validación de pipelines de inferencia: el repositorio incluye datos de ejemplo y scripts que permiten verificar el flujo de inferencia de extremo a extremo en un entorno local, facilitando la integración en proyectos existentes.
- Entrenamiento de modelos personalizados: los scripts de entrenamiento permiten adaptar Evo2 a conjuntos de datos específicos (por ejemplo, genomas de una especie concreta) mediante fine-tuning o preentrenamiento desde cero.
- Despliegue en entornos de cluster: gracias al script `train_slurm.py`, el modelo puede entrenarse o afinarse en infraestructuras HPC con gestor de colas, adecuado para laboratorios con recursos compartidos.
- Preprocesamiento de datos genómicos: las herramientas de conversión FASTA/JSON a formato `.bin/.idx` permiten preparar grandes volúmenes de datos para entrenamiento distribuido.

## Benchmarks y rendimiento

La model card menciona que Evo2 alcanza "rendimiento líder en benchmarks como GenBench", pero no se proporcionan cifras numéricas concretas en la información disponible. No se pueden presentar resultados cuantitativos sin inventar datos. Se recomienda consultar la documentación oficial o el repositorio para obtener métricas detalladas.

## Requisitos de hardware

- El modelo 7B en formato NeMo requiere una GPU con al menos 16 GB de VRAM para inferencia en precisión FP16 (estimación típica para un modelo de 7B, no confirmada por el autor).
- Para entrenamiento o fine-tuning, se recomienda al menos una GPU de 24 GB (por ejemplo, RTX 3090/4090) o GPUs de datacenter como A100 o H100, dependiendo del tamaño de lote y la longitud de secuencia.
- Se menciona compatibilidad con DCU (unidades de cómputo de AMD), requiriendo la instalación previa de DTK 25.04.2 o superior.
- El repositorio incluye scripts para ejecución en CPU para pruebas de importación y validación de conectividad, aunque el entrenamiento e inferencia completos serán lentos.
- Opciones de despliegue: los scripts `infer.py` y `predict.py` permiten ejecución local; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato NeMo sugiere uso con frameworks de NVIDIA (NeMo Toolkit).
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de secuencias genómicas en la información proporcionada. Modelos como Evo (de Arc Institute), Nucleotide Transformer o DNABERT-2 podrían considerarse alternativas, pero no se han publicado comparativas cuantitativas en la documentación disponible.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks numéricos, lo que dificulta evaluar el rendimiento real frente a alternativas.
- La información disponible no detalla la composición exacta del dataset de entrenamiento ni posibles sesgos en la representación de especies.
- El modelo está especializado en secuencias genómicas; no es adecuado para tareas de lenguaje natural, visión o razonamiento general.
- La documentación está en inglés y no se menciona soporte multilingüe más allá de la notación de secuencias.
- El formato de pesos es NeMo, lo que puede requerir dependencias específicas de NVIDIA (NeMo Toolkit) y no es directamente compatible con ecosistemas como Hugging Face Transformers sin conversión.
- Aunque la licencia es Apache-2.0 (permisiva para uso comercial), el uso en producción requiere validar el comportamiento del modelo en tareas específicas y considerar la posibilidad de alucinaciones en la generación de secuencias.
- No se especifican límites de contexto exactos ni recomendaciones de hardware para producción a gran escala.

## Enlaces

- [HuggingFace: OneScience-Group/evo2](https://huggingface.co/OneScience-Group/evo2)
- [Entorno OneCode (enlace externo)](https://gitee.com/link?target=https%3A%2F%2Fweb-2069360198568017922-iaaj.ksai.scnet.cn%3A58043%2Fhome)
