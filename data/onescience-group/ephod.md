# OneScience-Group/EpHod

## Resumen

EpHod es un modelo de ensamblaje diseñado para predecir el pH óptimo catalítico (`pHopt`) de enzimas a partir de su secuencia de aminoácidos. Desarrollado por OneScience-Group, combina un modelo de lenguaje de proteínas (ESM-1v) con dos ramas de predicción: una red neuronal de atención ligera residual (RLATtr) y un modelo de regresión de vectores de soporte (SVR). El resultado final es la media aritmética de las predicciones de ambas ramas.

El modelo está pensado para aplicaciones en biocatálisis, ingeniería de proteínas y biotecnología industrial, donde conocer el pH óptimo de una enzima es crítico para optimizar procesos. EpHod se basa en un pipeline que primero codifica la secuencia de aminoácidos en representaciones de proteínas de 1280 dimensiones mediante ESM-1v, y luego utiliza RLATtr y SVR para generar las predicciones. La arquitectura es ligera en comparación con modelos generativos de lenguaje, con un componente principal de aproximadamente 650 millones de parámetros (ESM-1v). El contexto de entrada está limitado a 1022 residuos, truncándose las secuencias más largas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de ESM-1v (transformer de proteínas) + RLATtr (red de atención residual) + SVR |
| Parámetros totales | ESM-1v: ~650 millones; RLATtr y SVR: no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1022 residuos (secuencias más largas se truncan) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (secuencias de proteínas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), pickle (.pkl) |

## Arquitectura y entrenamiento

EpHod no es un modelo generativo, sino un sistema de regresión en ensamblaje. La primera etapa utiliza ESM-1v, un transformer de lenguaje de proteínas preentrenado, para codificar la secuencia de aminoácidos en representaciones a nivel de residuo de 1280 dimensiones. Estas representaciones alimentan dos ramas independientes: RLATtr, una red neuronal de atención ligera con conexiones residuales que predice `pHopt` y puede producir pesos de atención y una representación de 2560 dimensiones; y SVR, un modelo de regresión de vectores de soporte que opera sobre representaciones ESM-1v agrupadas y estandarizadas. La predicción final del ensamblaje es la media aritmética de las salidas de RLATtr y SVR.

La rama RLATtr fue preentrenada en aproximadamente 1,9 millones de proteínas etiquetadas con su pH ambiental óptimo (`pHenv`) y posteriormente ajustada finamente en 9.855 enzimas con pH catalítico óptimo (`pHopt`). El pipeline de inferencia utiliza un tamaño de lote fijo de 1 para evitar sesgos relacionados con el agrupamiento. Las secuencias de entrada de más de 1022 residuos se truncan antes de la codificación.

## Capacidades

- Predicción del pH óptimo catalítico (`pHopt`) de enzimas a partir de secuencias de aminoácidos.
- Salida de dos predicciones independientes (RLATtr y SVR) más una predicción de ensamblaje.
- Generación opcional de pesos de atención a nivel de residuo mediante RLATtr, útil para interpretabilidad.
- Extracción opcional de representaciones de proteínas de 2560 dimensiones (EpHod protein representation).
- Procesamiento de múltiples secuencias de entrada en formato FASTA para comparación de candidatos.
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni generación de texto; es un modelo de regresión especializado.

## Casos de uso

- Predicción de pH óptimo de enzimas en biocatálisis: los investigadores pueden pasar una secuencia FASTA y obtener el `pHopt` estimado para seleccionar condiciones de reacción adecuadas.
- Screening de variantes enzimáticas: comparar varias secuencias candidatas de una misma enzima para identificar cuál presenta un pH óptimo más cercano al deseado en un proceso industrial.
- Análisis de interpretabilidad: activar `--save_attention_weights 1` para examinar qué residuos de la secuencia influyen más en la predicción, lo que ayuda a entender los determinantes estructurales del pH óptimo.
- Extracción de representaciones: usar la salida de 2560 dimensiones de RLATtr como características para entrenar modelos posteriores de ingeniería de proteínas o clasificación funcional.
- Diseño racional de enzimas: combinar las predicciones de EpHod con técnicas de mutagénesis dirigida para optimizar enzimas hacia un pH óptimo concreto.
- Integración en pipelines de biotecnología: automatizar la caracterización de enzimas en flujos de trabajo de descubrimiento de biocatalizadores, donde el pH óptimo es un parámetro clave.
- Docencia e investigación en bioinformática: servir como ejemplo práctico de modelo de ensamblaje que combina aprendizaje profundo y regresión clásica en un dominio biológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Se recomienda GPU o acelerador DCU para la inferencia de ESM-1v; la ejecución en CPU es posible pero significativamente más lenta.
- ESM-1v contiene aproximadamente 650 millones de parámetros, por lo que el consumo de memoria depende de la longitud de la secuencia de entrada.
- No se especifica la VRAM mínima; si la memoria del dispositivo es insuficiente, se debe reducir la longitud de la secuencia o procesar las secuencias individualmente.
- El despliegue se realiza mediante el script `scripts/inference.py` en Python con PyTorch; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- El tamaño del repositorio es de 8,2 GB, que incluye los pesos de ESM-1v, RLATtr y el modelo SVR.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos sobre modelos comparables en la información disponible. EpHod es un modelo especializado en predicción de pH óptimo de enzimas, por lo que su comparación directa con modelos de lenguaje generales no es significativa.

## Limitaciones y advertencias

- Las secuencias de más de 1022 residuos se truncan, lo que puede perder información relevante en enzimas grandes.
- El pipeline utiliza un tamaño de lote fijo de 1, lo que limita el rendimiento en procesamiento por lotes y puede resultar lento para conjuntos de datos extensos.
- La precisión de la predicción depende de la calidad de las representaciones de ESM-1v y del ajuste fino de RLATtr; no se han publicado métricas de error en la información proporcionada.
- El modelo está diseñado exclusivamente para enzimas y predicción de pH óptimo; no es aplicable a otras tareas de biología o lenguaje natural.
- No se mencionan sesgos conocidos, pero al estar basado en ESM-1v, puede heredar sesgos del conjunto de datos de proteínas utilizado en su preentrenamiento.
- La licencia MIT permite uso comercial, pero se debe verificar la procedencia de los pesos de ESM-1v, que tienen su propia licencia de Facebook AI Research (no especificada aquí).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/EpHod
- Artículo científico: https://doi.org/10.1038/s42256-025-01026-6
- Datos y pesos de RLATtr en Zenodo: https://doi.org/10.5281/zenodo.14252615
- Checkpoint de ESM-1v: https://dl.fbaipublicfiles.com/fair-esm/models/esm1v_t33_650M_UR90S_1.pt
- Organización OneScience en Hugging Face: https://huggingface.co/OneScience-Group/models
