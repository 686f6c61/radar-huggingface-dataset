# CHGGM-Aachen/Llama-3-Genolator-v1-PST

## Resumen

Llama-3-Genolator-v1-PST es una adaptación del modelo biomédico `ContactDoctor/Bio-Medical-Llama-3-8B` (un fine-tune de Llama-3-8B) diseñada para responder preguntas sobre la función de genes humanos a partir exclusivamente de representaciones numéricas (embeddings) de la secuencia de ADN codificante y de la estructura 3D predicha de la proteína. El modelo nunca ve el nombre del gen ni su secuencia cruda; en su lugar, dos proyectores lineales convierten los embeddings de cada modalidad en ocho tokens virtuales que se anteponen al prompt, forzando al modelo a razonar sobre la representación fusionada en lugar de recurrir a memoria sobre genes concretos.

Desarrollado por CHGGM-Aachen, este checkpoint se distribuye como adaptadores únicamente: los pesos LoRA (r=8, alpha=32, dropout=0.05) y los dos proyectores, con un tamaño total de 752 MiB, sin incluir los 15.7 GiB del modelo base congelado. El repositorio contiene tres ficheros `.pt` que deben usarse juntos, ya que fueron entrenados en la misma ejecución. El modelo está pensado para investigación en genómica y biología computacional, y su relevancia radica en que demuestra que es posible inferir función génica a partir de representaciones multimodales sin depender de la identidad del gen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3-8B) con adaptadores LoRA y dos proyectores de tokens virtuales |
| Parametros totales | 0.02B (solo adaptadores y proyectores); el modelo base congelado tiene 8B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la documentación; heredada del modelo base) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen como state dicts de torch, sin cuantización) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3 (llama3), según la model card; restricciones de uso comercial según la licencia de Meta |
| Formato de pesos | State dicts de PyTorch (ficheros `.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina un transformer decoder de Llama-3-8B congelado con dos proyectores lineales entrenados desde cero. Cada proyector mapea un embedding agrupado (mean-pooled) a ocho tokens virtuales de dimensión 4096: el proyector de ADN (`dna_projector.pt`) toma una entrada de 4096 dimensiones generada por el encoder Evo2 7B, mientras que el proyector de estructura proteica (`pst_projector.pt`) toma una entrada de 1280 dimensiones del modelo PST (structure-infused protein language model). Los 2×8 tokens virtuales se anteponen al prompt tokenizado y se excluyen de la pérdida. Cada proyector incluye un `null_emb` aprendido que se sustituye cuando una modalidad no está disponible para un gen, permitiendo que el modelo funcione incluso sin predicción de estructura. Los embeddings virtuales se escalan para igualar las normas de los embeddings de texto.

El entrenamiento se realizó sobre el dataset `CHGGM-Aachen/genolator-v1-qa`, con particiones disjuntas por gen (gene-disjoint) para evitar fugas de información. Los adaptadores LoRA se adjuntaron a siete módulos lineales (`down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj`, `v_proj`). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es de fine-tuning supervisado estándar con la pérdida de lenguaje habitual.

## Capacidades

- Responde preguntas sobre la función de genes humanos a partir de embeddings de ADN y estructura proteica, sin acceso al nombre del gen ni a la secuencia cruda.
- Razonamiento multimodal: integra representaciones de dos modalidades (secuencia codificante y estructura 3D predicha) mediante tokens virtuales.
- Manejo de modalidades ausentes: si un gen carece de predicción de estructura, el proyector PST usa un embedding nulo aprendido, manteniendo la usabilidad.
- Generación de texto en inglés con formato de respuesta natural.
- No soporta tool calling, ni uso como agente autónomo, ni razonamiento multi-paso explícito más allá de la generación estándar de lenguaje.
- No incluye capacidades de visión ni audio; la multimodalidad se limita a embeddings biológicos precomputados.

## Casos de uso

- Anotación funcional de genes no caracterizados: dado un gen sin anotaciones previas, el modelo puede generar hipótesis sobre su función a partir de sus embeddings de ADN y estructura, acelerando la curación de bases de datos genómicas.
- Priorización de genes candidatos en estudios de asociación: en un conjunto de genes asociados a una enfermedad, el modelo puede clasificar o describir las funciones más probables, ayudando a seleccionar dianas para experimentos.
- Validación de predicciones estructurales: al fusionar la estructura predicha con la secuencia, el modelo puede indicar si una estructura plausible es consistente con la función conocida del gen, sirviendo como control de calidad.
- Generación de hipótesis en biología de sistemas: para un conjunto de genes diferencialmente expresados, el modelo puede sugerir rutas o procesos biológicos comunes basándose en las representaciones, sin necesidad de consultar bases de datos externas.
- Análisis de variantes sinónimas: aunque el modelo no ve la secuencia, los embeddings de ADN pueden capturar efectos de variantes; podría usarse para evaluar si una variante altera la función predicha.
- Educación e investigación: como herramienta de demostración de razonamiento multimodal en genómica, permitiendo a estudiantes e investigadores explorar cómo las representaciones aprendidas codifican información funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en el dataset `CHGGM-Aachen/genolator-v1-qa` con particiones disjuntas por gen, pero no se proporcionan métricas numéricas (exactitud, F1, etc.). No se dispone de comparaciones con otros modelos en tareas de anotación génica.

## Requisitos de hardware

- Inferencia con el modelo base de 8B en precisión fp16 requiere aproximadamente 16 GB de VRAM; en int8, alrededor de 8 GB.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 (24 GB), o cualquier GPU con al menos 16 GB para fp16.
- No cabe en GPUs de consumo con menos de 8 GB sin cuantización adicional, pero los adaptadores LoRA son pequeños (752 MiB) y no añaden carga significativa.
- El despliegue no es estándar: requiere el código del repositorio `IHGGM-Aachen/Genolator`, que fusiona los adaptadores con el modelo base y ejecuta los proyectores. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin modificaciones sustanciales.
- La latencia es similar a la de Llama-3-8B, con un pequeño overhead por la proyección de embeddings (dos operaciones lineales por consulta). El throughput depende del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de anotación génica. Como referencia cualitativa:

| Modelo | Base | Adaptación | Modalidad | Licencia |
|---|---|---|---|---|
| Llama-3-Genolator-v1-PST | Bio-Medical-Llama-3-8B | LoRA + proyectores | ADN + estructura | Llama 3 |
| Bio-Medical-Llama-3-8B | Llama-3-8B | Fine-tuning completo | Texto biomédico | Llama 3 |
| Evo2 7B (encoder) | — | Preentrenado | ADN | No disponible en la info |

El modelo se distingue por su enfoque en embeddings multimodales y su diseño de "razonamiento a ciegas" sobre genes, pero no hay datos cuantitativos que permitan una comparación objetiva con alternativas como BioGPT, PubMedBERT o modelos de genómica específicos.

## Limitaciones y advertencias

- Requiere embeddings precomputados de ADN y estructura proteica; no puede procesar secuencias crudas ni nombres de genes directamente.
- Los tres ficheros `.pt` son un único modelo y deben usarse juntos; mezclar proyectores de otra variante de Genolator degrada silenciosamente los resultados.
- El modelo solo opera en inglés; no hay soporte multilingüe.
- Riesgo de alucinación en respuestas sobre genes poco representados en los datos de entrenamiento, especialmente si los embeddings son ruidosos.
- Dependencia del modelo base `ContactDoctor/Bio-Medical-Llama-3-8B`, cuyos pesos están sujetos a la licencia Llama 3; el uso comercial puede requerir permisos adicionales según los términos de Meta.
- No se han publicado evaluaciones de sesgos; el modelo podría reflejar sesgos presentes en los datos de entrenamiento del dataset `genolator-v1-qa`.
- La integración en producción es compleja: no es un checkpoint de `transformers` estándar ni un directorio PEFT; requiere un paso de fusión manual con el código del repositorio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/CHGGM-Aachen/Llama-3-Genolator-v1-PST)
- [Dataset genolator-v1-qa](https://huggingface.co/datasets/CHGGM-Aachen/genolator-v1-qa)
- [Modelo base Bio-Medical-Llama-3-8B](https://huggingface.co/ContactDoctor/Bio-Medical-Llama-3-8B)
- [Código en GitHub](https://github.com/IHGGM-Aachen/Genolator)
- [Paper (DOI)](https://doi.org/10.1101/2025.11.14.688396)
