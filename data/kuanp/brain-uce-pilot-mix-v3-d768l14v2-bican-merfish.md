# KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican-merfish

## Resumen

brain-uce-pilot-mix-v3-d768l14v2-bican-merfish es un modelo de embeddings celulares de tipo UCE (Universal Cell Embedding) desarrollado por el usuario KuanP, orientado a transcriptómica de célula única y transcriptómica espacial en tejido cerebral. Se trata de un ajuste fino (post-entrenamiento) del modelo base KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican sobre datos de cerebro de ratón procedentes del Allen Brain Cell Atlas, combinando MERFISH (transcriptómica espacial) y 10X (scRNA-seq).

El modelo no genera texto ni mantiene conversaciones: es un extractor de características que transforma el perfil de expresión génica de una célula en un vector denso de 768 dimensiones, normalizado en L2. Mantiene el mismo vocabulario génico y el mismo esquema de "frases celulares" de 1.024 genes que el modelo base, de modo que los embeddings resultantes son directamente comparables con los de la versión previa.

Su relevancia radica en la especialización: al reentrenarse sobre MERFISH y 10X de ratón, busca mejorar la representación de estados celulares y la coherencia espacial en experimentos de transcriptómica espacial, un área donde los embeddings generalistas suelen perder señal de nicho tisular. El modelo tiene 1.479.570.433 parámetros y un repositorio de 5,9 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UCE (Universal Cell Embedding), estilo transformer sobre "frases celulares" de genes; detalles internos no disponibles |
| Parametros totales | 1.479.570.433 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 genes por célula (frase celular); no disponible como contexto de tokens de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (modelo sobre datos biológicos, no texto) |
| Licencia | other (licencia personalizada; términos no detallados en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma UCE: cada célula se representa como una secuencia de 1.024 genes (cell sentence) que se procesa mediante un transformer para producir un embedding de 768 dimensiones, normalizado en L2. El vocabulario génico es el mismo que el del modelo base, lo que garantiza compatibilidad de espacio de embeddings entre ambos. No se dispone de información detallada sobre el número de capas, cabezas de atención ni el mecanismo exacto de tokenización génica en la documentación proporcionada.

El entrenamiento consiste en un post-entrenamiento del modelo KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican sobre datos de cerebro de ratón del Allen Brain Cell Atlas, incluyendo MERFISH (espacial) y 10X (disociación celular). No se especifican el número de tokens/células de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables habitualmente en este dominio). Tampoco se documentan innovaciones técnicas adicionales más allá de la especialización en modalidad espacial.

## Capacidades

- Extracción de embeddings celulares de 768 dimensiones a partir de perfiles de expresión génica.
- Procesamiento de transcriptómica espacial (MERFISH) y de célula única (10X) en cerebro de ratón.
- Representación de "frases celulares" de 1.024 genes con vocabulario génico fijo y compatible con el modelo base.
- Embeddings normalizados en L2, aptos para búsqueda por similitud, clustering y transferencia entre modalidades.
- Compatibilidad de espacio de embeddings con el modelo base, lo que permite comparaciones directas entre versiones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- Capacidades multilingües: no aplica.

## Casos de uso

- Análisis de transcriptómica espacial MERFISH: el modelo convierte cada célula de una sección de tejido en un vector de 768 dimensiones que puede usarse para clustering espacial y detección de dominios tisulares, gracias a su post-entrenamiento específico sobre MERFISH de ratón.
- Integración de datos 10X y MERFISH: al compartir vocabulario génico y dimensión de embedding con el modelo base, permite proyectar scRNA-seq y datos espaciales en un mismo espacio latente para comparar tipos celulares entre modalidades.
- Anotación automática de tipos celulares: los embeddings pueden alimentar clasificadores ligeros (kNN, regresión logística) entrenados sobre anotaciones del Allen Brain Cell Atlas para etiquetar células nuevas.
- Búsqueda de vecinos más cercanos en atlas cerebrales: la normalización L2 y la dimensión fija facilitan índices vectoriales para recuperar células similares en grandes colecciones de datos.
- Análisis de nichos espaciales: combinando embeddings con coordenadas físicas de MERFISH, se pueden estudiar interacciones entre tipos celulares y organización laminar del cerebro de ratón.
- Detección de estados celulares aberrantes: en estudios de enfermedad o perturbación, la comparación de embeddings frente a una referencia sana permite identificar desviaciones en la expresión génica.
- Preprocesamiento para modelos downstream: los embeddings sirven como entrada compacta para modelos de deconvolución, predicción de expresión o análisis de trayectorias celulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.479.570.433 parámetros, en FP32 se requieren aproximadamente 5,9 GB de pesos; en FP16/BF16 unos 3,0 GB; en INT8 unos 1,5 GB. A ello hay que sumar memoria para activaciones y lote de células.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 en lotes pequeños; A100, H100 o RTX 4090 para procesar grandes volúmenes de células con alto throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores, incluso en FP32 con lotes moderados.
- Opciones de despliegue: la librería indicada es uce_brain; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no aplican a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brain-uce-pilot-mix-v3-d768l14v2-bican-merfish | 1.479.570.433 | 1.024 genes | MERFISH + 10X ratón | other | Hugging Face |
| KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican (modelo base) | no disponible | 1.024 genes | scRNA-seq / multi-especie | other | Hugging Face |
| Otros modelos UCE generalistas | no disponible | no disponible | scRNA-seq multi-tejido | no disponible | no disponible |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el post-entrenamiento específico en MERFISH y 10X de ratón, manteniendo dimensión de embedding y vocabulario.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se limita a cerebro de ratón y a las plataformas MERFISH y 10X del Allen Brain Cell Atlas, por lo que la generalización a otros tejidos, especies o plataformas no está garantizada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero los embeddings pueden producir representaciones poco fiables para tipos celulares ausentes en el entrenamiento.
- Limitaciones de contexto o idioma: la "frase celular" está fijada a 1.024 genes; perfiles con menos genes o vocabularios distintos pueden degradar la calidad del embedding. No es un modelo lingüístico.
- Restricciones de licencia: la licencia es "other" y los términos concretos no se detallan en la información disponible; es necesario revisar el repositorio antes de un uso comercial.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria; conviene evaluar su rendimiento en el dataset concreto antes de desplegarlo.
- No se documentan procesos de calibración, versionado semántico ni garantías de estabilidad entre el modelo base y este ajuste más allá de la compatibilidad declarada de vocabulario y dimensión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican-merfish
- Modelo base: https://huggingface.co/KuanP/brain-uce-pilot-mix-v3-d768l14v2-bican
