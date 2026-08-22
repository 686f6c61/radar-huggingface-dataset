# Karmation/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4

## Resumen

NVIDIA Nemotron 3 Ultra 550B A55B es el modelo más grande y capaz de la familia Nemotron de NVIDIA, diseñado para cargas de trabajo de frontera como razonamiento avanzado, agentes multi-paso y análisis de contexto largo. Se trata de un modelo de arquitectura híbrida LatentMixture-of-Experts (LatentMoE) que combina capas Mamba-2, MoE y de atención, con Multi-Token Prediction (MTP) para acelerar la generación y mejorar la calidad. El modelo tiene 550B de parámetros totales, de los cuales 55B están activos, y soporta una ventana de contexto de hasta 1M tokens. La versión NVFP4, publicada en este repositorio, está pre-entrenada directamente en el formato NVFP4 de 4 bits de NVIDIA, lo que reduce el consumo de memoria y mejora la eficiencia computacional.

El modelo ha sido pre-entrenado sobre aproximadamente 20 billones de tokens (20 × 10^12), con cutoff de septiembre de 2025, y post-entrenado con datos curados y sintéticos, con cutoff de mayo de 2026. NVIDIA ha publicado tanto los pesos como los datasets de entrenamiento, y la licencia OpenMDW-1.1 permite uso comercial y no comercial. Este repositorio es un espejo del modelo oficial de NVIDIA, con pesos en formato safetensors y un tamaño total de 352.4 GB.

El modelo es especialmente relevante para agentes de razonamiento complejo, análisis de documentos de gran escala y tareas de alta precisión en código, matemáticas y ciencia. Su modo de razonamiento configurable (thinking mode) y su soporte de 10 idiomas lo convierten en una opción de referencia para despliegues de IA de alta exigencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
|
