# minsu0567/IAD-X1-SFT-thinking

## Resumen

IAD-X1-SFT-thinking es un ajuste fino (fine-tuning) completo del modelo Qwen/Qwen3.5-4B, desarrollado por minsu0567 (Kim minsu) para el ámbito de la detección de anomalías industriales. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo procesa tanto imágenes como texto, y su nombre sugiere un modo de razonamiento o "thinking" integrado. Forma parte de la familia IAD-X1, un proyecto unificado para detección de anomalías industriales que incluye etapas posteriores de DPO (optimización por preferencias directas) según el repositorio de GitHub del autor.

El modelo cuenta con aproximadamente 4.539 millones de parámetros (4,5B) y se distribuye en formato safetensors. Su relevancia radica en aplicar modelos generativos multimodales a tareas de inspección visual industrial, un campo donde tradicionalmente se usan redes convolucionales especializadas. Al estar basado en Qwen3.5, hereda las capacidades lingüísticas y de razonamiento del modelo base, aunque la model card no proporciona detalles sobre la arquitectura interna, el contexto máximo ni los idiomas soportados.

La licencia se declara como `other`, y el perfil del autor indica que el proyecto está destinado "únicamente para fines de investigación académica y no comercial", lo que condiciona su uso en producción. El repositorio pesa 42,9 GB, un tamaño considerable para un modelo de 4,5B, posiblemente debido a pesos en alta precisión o a múltiples archivos de checkpoint. No se han publicado resultados de benchmarks en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-4B (transformers, multimodal imagen-texto) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (heredados de Qwen3.5, sin especificar) |
| Licencia | other (posible restricción no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) de Qwen/Qwen3.5-4B, realizado con el framework LlamaFactory. El entrenamiento se llevó a cabo sobre el dataset `PA_SFT_merged_2_only`, del cual no se proporciona descripción adicional. Los hiperparámetros declarados incluyen una tasa de aprendizaje de 1e-05, tamaño de lote de entrenamiento de 1 con acumulación de gradientes de 2 (lote efectivo de 2), optimizador AdamW con cuantización de 8 bits (AdamW_BNB), scheduler coseno con 100 pasos de calentamiento y una sola época.

No se especifican detalles sobre la arquitectura interna más allá del modelo base, ni sobre el proceso de entrenamiento (por ejemplo, si se usó RLHF, DPO o alguna técnica de alineación). El nombre "thinking" podría indicar la incorporación de un modo de razonamiento extendido, pero no hay documentación al respecto. El repositorio GitHub del autor menciona una etapa de DPO posterior al SFT, aunque este checkpoint concreto es solo la fase SFT.

## Capacidades

- Procesamiento multimodal imagen-texto: el pipeline `image-text-to-text` indica que acepta imágenes y texto como entrada, y genera texto como salida.
- Detección de anomalías industriales: según el repositorio del proyecto, el modelo está orientado a la detección de defectos y anomalías en entornos industriales.
- Generación de texto conversacional: el tag `conversational` sugiere capacidad para mantener diálogos multi-turno.
- Razonamiento (posible modo thinking): el nombre del modelo apunta a un modo de razonamiento extendido, aunque no hay evidencia documental.
- Aumento de datos generativo: el perfil del autor menciona "IA generativa para aumento de datos industriales", lo que implica capacidad para generar descripciones o anotaciones sintéticas.
- No se dispone de información sobre soporte de tool calling, function calling ni agentes.

## Casos de uso

- Inspección visual de defectos en líneas de producción: el modelo puede recibir imágenes de piezas manufacturadas y generar informes textuales sobre posibles anomalías, facilitando el control de calidad automatizado.
- Anotación asistida de datasets industriales: dada su capacidad generativa, puede producir descripciones textuales de defectos a partir de imágenes, acelerando la creación de conjuntos de datos etiquetados.
- Investigación académica en detección de anomalías: al ser un modelo abierto (con restricciones no comerciales), es útil para experimentar con arquitecturas multimodales en el ámbito universitario.
- Aumento de datos para modelos de visión: el autor indica que el proyecto se enfoca en aumento de datos generativo, por lo que el modelo podría generar variaciones sintéticas de defectos para entrenar otros detectores.
- Diagnóstico remoto de maquinaria: combinando imágenes de equipos con consultas en lenguaje natural, el modelo podría asistir a técnicos en la identificación de fallos.
- Documentación técnica automatizada: a partir de imágenes de componentes, el modelo puede redactar descripciones técnicas o informes de incidencias, reduciendo la carga administrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una entrada `model-index` con una lista vacía de resultados, y no hay datos adicionales en el repositorio de HuggingFace.

## Requisitos de hardware

- VRAM estimada: con 4,5B parámetros en FP16, se requieren aproximadamente 9 GB de VRAM solo para los pesos; el tamaño del repositorio (42,9 GB) sugiere que puede haber checkpoints en precisión completa (FP32) o múltiples versiones, lo que aumentaría los requisitos.
- GPUs recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A10G, L4) sería suficiente para inferencia con cuantización de 8 bits o 4 bits. Para FP16 sin cuantizar, se necesitaría una GPU de 24 GB (RTX 3090/4090, A100 40GB).
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en GPUs de consumo de gama alta (RTX 3090/4090) utilizando cuantización GGUF o AWQ, aunque no se proporcionan archivos cuantizados oficiales.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). La plataforma FriendliAI ofrece un endpoint de inferencia de baja latencia para una variante del modelo.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 4,5B en una GPU moderna, se puede esperar una latencia de decenas de milisegundos por token en FP16.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos. El modelo es un ajuste fino específico de Qwen3.5-4B, y no hay datos públicos sobre otros modelos de detección de anomalías industriales basados en la misma arquitectura. Se podría comparar con el modelo base Qwen/Qwen3.5-4B, pero no se conocen las diferencias de rendimiento en tareas industriales.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `other` y la declaración del autor sobre uso "solo académico y no comercial" limitan seriamente su aplicación en entornos empresariales.
- Falta de documentación: la model card no describe el dataset de entrenamiento, los idiomas soportados, la longitud de contexto ni las capacidades exactas del modelo, lo que dificulta su evaluación rigurosa.
- Sin benchmarks publicados: no hay resultados objetivos que permitan comparar su rendimiento con otros modelos en tareas de detección de anomalías.
- Riesgo de alucinación: al ser un modelo generativo, puede producir descripciones inexactas o inventar defectos inexistentes en las imágenes, lo que es crítico en aplicaciones de inspección industrial.
- Sesgos del modelo base: hereda los posibles sesgos de Qwen3.5-4B, que no han sido auditados en este contexto específico.
- Tamaño del repositorio: 42,9 GB es un peso considerable que puede dificultar la descarga y el despliegue en entornos con ancho de banda limitado.
- Fecha de creación futura: el modelo fue creado en junio de 2026 y actualizado en agosto de 2026, lo que sugiere que es muy reciente y podría tener poca validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/minsu0567/IAD-X1-SFT-thinking
- Repositorio GitHub del proyecto IAD-X1: https://github.com/minsu0567/IAD-X1
- Perfil del autor en HuggingFace: https://huggingface.co/minsu0567
- Variante relacionada (SFT-si-answer-last): https://huggingface.co/minsu0567/IAD-X1-SFT-si-answer-last
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/minsu0567/IAD-X1-SFT-answer-last
- Perfil de GitHub del autor: https://github.com/minsi0567
