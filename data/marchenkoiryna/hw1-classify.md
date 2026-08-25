# marchenkoiryna/hw1-classify

## Resumen

El modelo `marchenkoiryna/hw1-classify` es una implementación a escala **xlarge** de la arquitectura **MobileViT**, orientada a tareas de **retrieval** (recuperación de información). Fue publicado por el usuario marchenkoiryna en Hugging Face el 25 de agosto de 2026, bajo licencia Apache-2.0. El repositorio contiene un único artefacto principal, `predict.py`, que constituye la implementación del modelo.

La relevancia de este modelo radica en su combinación de arquitectura ligera (MobileViT, diseñada originalmente para dispositivos móviles) con una escala xlarge, lo que sugiere un intento de equilibrar eficiencia y capacidad. Incorpora atención con ventana deslizante (sliding-window attention), fusión gated, normalización por lotes (batch norm), activación ReLU e inicialización Xavier. Sin embargo, la información pública es muy limitada: no se especifican el número de parámetros, el contexto, los idiomas soportados ni se aportan benchmarks, por lo que su utilidad práctica real no puede evaluarse con los datos disponibles.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | MobileViT (escala xlarge) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene únicamente `predict.py`) |

## Arquitectura y entrenamiento
La arquitectura declarada es **MobileViT** a escala **xlarge**, una variante de gran tamaño de la familia MobileViT que combina capas convolucionales con transformadores. El modelo emplea **atención con ventana deslizante** (sliding-window attention) para reducir el coste computacional del mecanismo de atención, y una **estrategia de fusión gated** para combinar características. La normalización se realiza mediante **batch norm** y la activación es **ReLU**. La inicialización de pesos se realiza con el esquema **Xavier**.

En cuanto al entrenamiento, se especifica el uso del optimizador **Lion** y un programador de tasa de aprendizaje (LR scheduler) **cosine**. No se proporcionan datos sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. La función del modelo es de **retrieval** (recuperación), por lo que el objetivo de entrenamiento estará orientado a producir representaciones (embeddings) útiles para búsqueda o comparación de similitud, aunque no se detalla la función de pérdida ni las métricas de evaluación.

## Capacidades
- **Retrieval**: el modelo está diseñado para tareas de recuperación de información, lo que sugiere que produce embeddings o representaciones aptas para búsqueda por similitud.
- **Arquitectura híbrida**: combina convoluciones con capas de atención (MobileViT), lo que le permite capturar tanto características locales como globales.
- **Eficiencia computacional**: la atención con ventana deslizante reduce el coste respecto a la atención global, y la escala xlarge puede ofrecer mayor capacidad que las variantes pequeñas de MobileViT.
- **Formato de entrega**: el repositorio incluye un script `predict.py`, lo que sugiere que el modelo se ejecuta mediante un script de predicción más que mediante pesos preentrenados estándar.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión (más allá de la propia arquitectura MobileViT que procesa imágenes), audio o modo de pensamiento explícito.

## Casos de uso
- **Búsqueda de imágenes por similitud**: al ser una variante MobileViT con cabecera de retrieval, podría usarse para generar embeddings de imágenes y buscar imágenes visualmente similares en una base de datos. Sin embargo, no se confirma que la entrada sea visual.
- **Recuperación de documentos**: el modelo podría generar representaciones de documentos para sistemas de recuperación de información, aunque no se indica el tipo de datos de entrada.
- **Sistemas de recomendación**: la capacidad de retrieval permite comparar ítems o usuarios mediante similitud de embeddings, útil en recomendación de contenido.
- **Clasificación**: a pesar de la cabecera de retrieval, la arquitectura MobileViT es comúnmente usada para clasificación de imágenes; el script `predict.py` podría adaptarse para inferencia de clasificación.
- **Prototipado académico**: dado que es un repositorio con un único script, puede servir como punto de partida para experimentos con arquitectura MobileViT a escala xlarge.
- **Investigación en eficiencia**: la combinación de ventana deslizante, gated fusion y batchnorm puede estudiarse para aplicaciones en dispositivos con recursos limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas de referencia.

## Requisitos de hardware
- **VRAM estimada**: no disponible. Al no conocer el número de parámetros, no se puede estimar el consumo de memoria.
- **GPU recomendadas**: no disponible. La escala xlarge de MobileViT podría caber en GPUs de consumo como una RTX 3090 o 4090, pero sin datos de parámetros no se puede confirmar.
- **Compatibilidad con GPU de consumo**: no confirmada; depende del número de parámetros.
- **Opciones de despliegue**: el repositorio contiene únicamente `predict.py`, por lo que no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. No hay formato de pesos estándar (safetensors, GGUF) publicado.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares
No hay información suficiente para establecer una comparativa con otros modelos de la misma categoría. No se conocen parámetros, contexto ni resultados de benchmarks, por lo que no se puede comparar con alternativas como MobileViT estándar, ViT u otros modelos de retrieval.

## Limitaciones y advertencias
- **Información insuficiente**: no se publican parámetros, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar la calidad del modelo.
- **Sesgos y alucinación**: no hay datos al respecto. La arquitectura MobileViT no es generativa, por lo que el riesgo de alucinación es bajo, pero no se puede descartar.
- **Limitaciones de contexto**: no se especifica la longitud de contexto; si se usa para texto, podría estar limitada.
- **Licencia**: Apache-2.0, lo que permite uso comercial, pero hay que verificar el archivo de licencia real en el repositorio.
- **Formato de entrega**: el repositorio contiene solo `predict.py`, lo que puede indicar que no hay pesos preentrenados descargables o que el script es la implementación completa.
- **Riesgo de producción**: sin benchmarks ni datos de rendimiento, no es recomendable para uso en producción sin una validación previa exhaustiva.

## Enlaces
- HuggingFace: https://huggingface.co/marchenkoiryna/hw1-classify
- GitHub del autor (Iryna1320): https://github.com/Iryna1320
- GitHub del autor (Iryna-Marchenko): https://github.com/Iryna-Marchenko
- Google Académico de Iryna Marchenko: https://scholar.google.com/citations?user=ZZHfKhEAAAAJ&hl=es
- BenchLM (leaderboard general de modelos): https://benchlm.ai/
