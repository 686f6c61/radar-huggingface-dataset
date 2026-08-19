# scvi-tools/test-scvi-minified

## Resumen

scVI (single-cell Variational Inference) es un modelo de inferencia variacional desarrollado por el equipo de scvi-tools para el análisis de datos de secuenciación de ARN de célula única (scRNA-seq). Su objetivo principal es aprender una representación latente de baja dimensionalidad a partir de la matriz de expresión génica, lo que permite integrar lotes técnicos, imputar valores ausentes (dropouts) y facilitar tareas posteriores como visualización y clustering. Este modelo concreto, identificado como `test-scvi-minified`, es una versión de prueba entrenada con datos sintéticos independientes e idénticamente distribuidos (IID) y con un tamaño reducido (400 células y 100 genes), pensada para validar el flujo de trabajo de scvi-tools y el servicio scvi-hub.

La relevancia de scVI radica en su capacidad para abordar uno de los problemas más comunes en transcriptómica de célula única: la variabilidad técnica entre lotes y la alta tasa de ceros en los datos. Al modelar la expresión génica con una distribución ZINB (Zero-Inflated Negative Binomial) y usar un autoencoder variacional, scVI proporciona una representación latente robusta que puede transferirse a nuevos conjuntos de datos mediante el framework Arches. Aunque este modelo es minificado y no está pensado para producción, sirve como referencia para entender la arquitectura y el funcionamiento de scVI en su versión completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) con decodificador ZINB |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo para datos tabulares de expresión génica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (formato propio de scvi-tools) |

## Arquitectura y entrenamiento

scVI se basa en un autoencoder variacional (VAE) que modela la expresión génica con una distribución de verosimilitud ZINB, adecuada para datos de scRNA-seq con exceso de ceros. La arquitectura incluye una capa oculta de 128 unidades, una capa latente de 10 dimensiones y una sola capa de codificación/decodificación, con dropout de 0.1. El modelo utiliza una dispersión por gen y una verosimilitud de tipo ZINB, además de incorporar el tamaño de librería observado como variable auxiliar. La distribución latente es normal.

Los parámetros de configuración exactos se proporcionan en el model card, y el modelo fue entrenado con datos sintéticos IID. No se especifica el número total de parámetros ni la cantidad de tokens de entrenamiento (concepto no aplicable aquí). El dataset se ha minificado a 400 células y 100 genes, y no se han proporcionado métricas de rendimiento ni código de entrenamiento. El modelo está preparado para fine-tuning mediante el framework Arches, que permite adaptar un modelo preentrenado a nuevos datos sin necesidad de reentrenar desde cero.

## Capacidades

- Aprendizaje de representaciones latentes de baja dimensión a partir de matrices de expresión génica de scRNA-seq.
- Integración de lotes técnicos: el modelo puede corregir efectos de lote si se proporciona una clave de lote durante el entrenamiento (aunque en este modelo minificado no se usó).
- Imputación de dropouts: genera valores de expresión imputados para genes con ceros, basándose en la distribución ZINB aprendida.
- Visualización y clustering: la representación latente puede usarse como entrada para algoritmos de reducción de dimensionalidad (UMAP, t-SNE) y clustering (Leiden, K-means).
- Fine-tuning con Arches: permite transferir el modelo a nuevos conjuntos de datos, manteniendo las capas preentrenadas y adaptando solo algunas partes.
- No soporta generación de texto, tool calling ni capacidades multimodales; es un modelo exclusivamente para datos numéricos de expresión génica.

## Casos de uso

- Análisis exploratorio de datos de scRNA-seq: usar la representación latente para visualizar poblaciones celulares en UMAP y detectar grupos de células con perfiles de expresión similares.
- Integración de datos multi-lote: aplicar scVI a conjuntos de datos combinados de diferentes experimentos o plataformas para corregir efectos de lote y permitir comparaciones entre condiciones.
- Imputación de expresión génica: generar valores imputados para genes con baja detección, lo que mejora el análisis de expresión diferencial y la identificación de marcadores.
- Clustering celular: usar las variables latentes como entrada a algoritmos de clustering (por ejemplo, Leiden) para identificar tipos celulares o estados celulares.
- Fine-tuning en nuevos datasets: con el framework Arches, se puede adaptar un modelo preentrenado (como este, aunque minificado) a un nuevo conjunto de datos con pocas células, acelerando el análisis.
- Evaluación de calidad de datos: dado que el modelo está entrenado con datos sintéticos, puede servir para probar pipelines de análisis y verificar la correcta instalación de scvi-tools.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card menciona que el uploader no proporcionó métricas como el coeficiente de variación celular o génico, ni métricas de expresión diferencial. Por tanto, no es posible comparar cuantitativamente este modelo con otros.

## Requisitos de hardware

- Al ser un modelo minificado (400 células, 100 genes, capas de 128 unidades), los requisitos de hardware son mínimos.
- Puede ejecutarse en CPU sin necesidad de GPU; la memoria RAM necesaria es inferior a 1 GB para este tamaño.
- Para la versión completa de scVI (con datasets reales de miles de células), se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 2080 o superior) para acelerar el entrenamiento.
- El despliegue se realiza mediante la librería scvi-tools, que se integra con PyTorch. No se usan motores de inferencia como vLLM u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están especificados, pero para este tamaño la inferencia es prácticamente instantánea.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría dentro de la información proporcionada. scVI es un modelo establecido en el campo de la transcriptómica de célula única, pero no se han incluido comparativas con otras herramientas como Harmony o Seurat en el model card. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo entrenado con datos sintéticos: no debe usarse para análisis de datos reales sin un fine-tuning adecuado, ya que las representaciones aprendidas podrían no generalizar.
- Tamaño minificado: la versión `test-scvi-minified` tiene solo 400 células y 100 genes, por lo que sus capacidades son muy limitadas y no representan el rendimiento del scVI completo.
- No es un modelo de lenguaje: no admite entrada de texto ni generación de lenguaje; solo procesa matrices numéricas de expresión génica.
- Licencia cc-by-4.0: permite uso comercial y modificación con atribución, pero es responsabilidad del usuario cumplir con los términos de la licencia.
- No se proporcionan métricas de rendimiento ni código de entrenamiento, lo que dificulta evaluar su calidad o reproducir el entrenamiento.
- No hay soporte para cuantización ni formatos de pesos estándar (como safetensors), ya que scvi-tools utiliza su propio formato de guardado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/scvi-tools/test-scvi-minified)
- [Guía de usuario de scVI](https://docs.scvi-tools.org/en/stable/user_guide/models/scvi.html)
- [Manuscrito original de scVI](https://www.nature.com/articles/s41592-018-0229-2)
- [Manuscrito sobre scvi-hub](https://www.biorxiv.org/content/10.1101/2024.03.01.582887v2)
- [Tutorial de Arches](https://docs.scvi-tools.org/en/stable/tutorials/notebooks/scrna/scarches_scvi_tools.html)
