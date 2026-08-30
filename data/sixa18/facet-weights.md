# SiXa18/facet-weights

## Resumen

FACET es un modelo de aprendizaje automático desarrollado por Maximilian Zinke (SiXa18) para predecir ángulos de torsión del esqueleto proteico (phi/psi) a partir de desplazamientos químicos de resonancia magnética nuclear (NMR). El problema que resuelve es la determinación estructural de proteínas cuando los datos de NMR están disponibles pero las técnicas tradicionales de cálculo de ángulos son lentas o requieren información adicional. El modelo se distribuye como un conjunto de pesos y datos de referencia que se descargan automáticamente en el primer uso, alojados en HuggingFace debido a que uno de los archivos supera el límite de 100 MB de PyPI.

La arquitectura consiste en un encoder (disponible en PyTorch y ONNX) que genera embeddings de residuos, junto con un índice de recuperación de 220 000 residuos con sus ángulos phi/psi y etiquetas, y una referencia de desplazamientos químicos opcional. El modelo no es un LLM, sino un predictor específico para bioinformática estructural, con un tamaño de pesos de 5,2 MB y un índice de recuperación de 106 MB. Su relevancia radica en ofrecer una alternativa rápida y ligera para la predicción de ángulos de torsión a partir de datos NMR, con licencia CC BY 4.0 que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder (tipo no especificado en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de embeddings, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precisión original) |
| Idiomas soportados | no aplica (modelo de datos numéricos) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (.pt), ONNX (.onnx), NumPy (.npz) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del encoder (si es transformer, CNN o MLP). Se sabe que produce embeddings de residuos y que el sistema completo combina un head paramétrico con un índice de recuperación (retrieval index) de 220 000 residuos. La referencia de desplazamientos químicos (`facet_shift_reference.npz`) es opcional; si no está presente, el modelo degrada al head paramétrico. Los datos de entrenamiento provienen del Protein Data Bank (PDB) para ángulos phi/psi y estructura secundaria, y del BMRB para desplazamientos químicos, ambos bajo licencia CC0 1.0. No se especifica el número de tokens ni el proceso de entrenamiento (RLHF, DPO, etc.) porque no es un modelo de lenguaje. La innovación principal es la combinación de un encoder ligero con un índice de recuperación para mejorar la precisión de las predicciones, evitando la necesidad de un modelo generativo pesado.

## Capacidades

- Predicción de ángulos de torsión phi/psi del esqueleto proteico a partir de listas de desplazamientos químicos en formato .tab o .csv.
- Predicción de estructura secundaria (hélices, láminas, etc.) asociada a cada residuo.
- Predicción de rotámeros chi1 (ángulo lateral de la cadena).
- Generación de embeddings de residuos que pueden usarse para búsqueda en el índice de recuperación.
- Verificación de integridad de los archivos mediante SHA-256 pinneado.
- Descarga automática de los pesos y datos en el primer uso (no requiere instalación manual).
- Compatibilidad con ONNX para inferencia en entornos sin PyTorch.

## Casos de uso

- Validación de asignaciones de NMR: los investigadores pueden cargar sus listas de desplazamientos químicos y comprobar si los ángulos predichos son consistentes con la estructura conocida, detectando errores de asignación.
- Determinación estructural rápida de proteínas pequeñas: cuando se dispone de chemical shifts pero no de estructura, FACET proporciona una estimación inicial de los ángulos phi/psi que puede usarse como restricción en programas de modelado como Rosetta o Xplor-NIH.
- Análisis de dinámica conformacional: al predecir ángulos para múltiples estados o condiciones, se pueden identificar cambios conformacionales sutiles sin necesidad de experimentos adicionales.
- Integración en pipelines de bioinformática: gracias a su formato ONNX y su pequeño tamaño, puede ejecutarse en servidores de análisis sin GPU, integrándose en flujos de trabajo automatizados de anotación estructural.
- Educación y docencia: como herramienta ligera y de código abierto, puede usarse en cursos de bioquímica estructural para ilustrar la relación entre desplazamientos químicos y estructura tridimensional.
- Benchmarking de métodos de predicción: el índice de recuperación y la referencia de datos permiten comparar el rendimiento de FACET con otros predictores de ángulos de torsión en conjuntos de datos estandarizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un conjunto de prueba de 745 entradas sin solapamiento con el índice de recuperación y la referencia de desplazamientos, pero no se proporcionan métricas numéricas (p. ej., error medio absoluto en grados, porcentaje de acierto en estructura secundaria).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB, ya que los pesos del encoder ocupan 5,2 MB y el índice de recuperación se carga en memoria como array NumPy (106 MB comprimido, aproximadamente 200-300 MB en memoria RAM).
- GPU recomendadas: ninguna; el modelo se ejecuta correctamente en CPU. Para el índice de recuperación, la RAM es el factor limitante (se recomiendan al menos 512 MB libres).
- Compatible con GPUs de consumo (RTX 4090, etc.) si se desea acelerar la inferencia, pero no es necesario.
- Opciones de despliegue: Python con PyTorch o ONNX Runtime, o mediante el Space de HuggingFace (https://huggingface.co/spaces/SiXa18/facet) que ofrece una interfaz web para subir archivos .tab o .csv.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del encoder, la inferencia es casi instantánea en CPU; la carga del índice de recuperación domina el tiempo de inicio (varios segundos).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (predictores de ángulos de torsión a partir de chemical shifts). Alternativas conocidas como TALOS+ o DANGLE no tienen pesos públicos en HuggingFace ni una implementación abierta comparable. La información disponible no permite establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en proteínas; no es aplicable a ácidos nucleicos u otras biomoléculas.
- Requiere datos de desplazamientos químicos de NMR como entrada; no puede usarse con secuencias de aminoácidos únicamente.
- La precisión de las predicciones depende de la calidad y completitud de los datos de chemical shifts; datos ruidosos o incompletos pueden producir ángulos poco fiables.
- No se han publicado análisis de sesgos ni de errores sistemáticos; se recomienda validar las predicciones en conjuntos de datos independientes.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución al proyecto; los datos subyacentes de PDB y BMRB son de dominio público (CC0 1.0).
- El índice de recuperación incluye 220 000 residuos; si el residuo de consulta no tiene vecinos cercanos en el índice, la predicción puede degradarse al head paramétrico.
- No se proporcionan garantías de rendimiento en producción; el autor es un desarrollador individual y el proyecto no tiene soporte comercial.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/SiXa18/facet-weights
- Space de HuggingFace (demo): https://huggingface.co/spaces/SiXa18/facet
- Repositorio de código fuente: https://github.com/maxzinke/facet-nmr
- Perfil del autor: https://huggingface.co/SiXa18
