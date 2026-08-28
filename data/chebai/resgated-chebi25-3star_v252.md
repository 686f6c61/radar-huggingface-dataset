# chebai/resgated-chebi25-3star_v252

## Resumen

El modelo `chebai/resgated-chebi25-3star_v252` es un grafo neuronal convolucional (GCN) con conexiones residuales y mecanismo de gating, desarrollado por el grupo ChEB-AI (chebai) para tareas de quimioinformática. Está entrenado específicamente sobre el subconjunto ChEBI25-3STAR (versión v252) del dataset ChEBI, que contiene estructuras químicas anotadas con propiedades y clasificaciones ontológicas. El modelo se construyó con la librería ChEB-AI Graph (v1.2.0) y se distribuye como un checkpoint de PyTorch Lightning, junto con los archivos de configuración y la versión de la librería utilizada.

Su relevancia radica en ofrecer una implementación reproducible de un GCN con arquitectura residual-gated para el análisis de moléculas, integrando conocimiento químico estructurado. A diferencia de los modelos de lenguaje, este modelo opera directamente sobre grafos moleculares, lo que lo hace adecuado para predicción de propiedades, clasificación de compuestos y otras tareas de aprendizaje automático en química. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica al ser un modelo de grafos) ni sobre su rendimiento en benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Residual-gated Graph Convolutional Network (GCN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch Lightning (formato .ckpt o .pt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de red neuronal convolucional sobre grafos (GCN) con conexiones residuales y un mecanismo de gating (residual-gated GCN). Esta variante mejora el flujo de gradientes y permite un control adaptativo de la información que se propaga entre nodos, lo que resulta especialmente útil para representar moléculas donde los átomos (nodos) y enlaces (aristas) tienen propiedades heterogéneas. El entrenamiento se realizó sobre el dataset ChEBI25-3STAR (v252), un subconjunto curado de la ontología química ChEBI, que incluye compuestos con anotaciones de alta calidad. Se utilizó la librería ChEB-AI Graph (v1.2.0) para la construcción del grafo y el pipeline de entrenamiento, y el checkpoint se guarda con PyTorch Lightning. No se han publicado detalles sobre el número de épocas, la función de pérdida, el tamaño del lote ni la composición exacta del dataset de entrenamiento. Tampoco se menciona el uso de técnicas como RLHF o DPO, que no son habituales en este tipo de modelos.

## Capacidades

- Predicción de propiedades fisicoquímicas y biológicas de compuestos químicos a partir de su estructura molecular.
- Clasificación de moléculas según categorías ontológicas de ChEBI (por ejemplo, roles biológicos, aplicaciones).
- Representación de grafos moleculares mediante embeddings generados por la capa convolucional.
- Integración con la librería ChEB-AI Graph para pipelines de quimioinformática.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo especializado en grafos.

## Casos de uso

- **Predicción de actividad biológica**: el modelo puede utilizarse para clasificar compuestos según su actividad frente a dianas biológicas, aprovechando la representación gráfica de la molécula y las anotaciones de ChEBI.
- **Detección de propiedades ADMET**: a partir de la estructura molecular, se puede predecir la absorción, distribución, metabolismo, excreción y toxicidad, útil en fases tempranas del descubrimiento de fármacos.
- **Filtrado de librerías químicas**: en entornos de cribado virtual, el modelo puede priorizar compuestos con mayor probabilidad de poseer ciertas propiedades, reduciendo el coste computacional de experimentos posteriores.
- **Análisis de relaciones estructura-actividad (QSAR)**: al trabajar directamente sobre grafos, el modelo captura dependencias locales y globales entre átomos, mejorando la precisión frente a descriptores moleculares clásicos.
- **Integración en pipelines de quimioinformática**: gracias a su formato de checkpoint y compatibilidad con PyTorch Lightning, puede incorporarse fácilmente en flujos de trabajo existentes para la generación de embeddings o la clasificación de compuestos.
- **Educación e investigación**: el modelo y su configuración están disponibles bajo licencia MIT, lo que permite su uso en cursos y proyectos de investigación sobre aprendizaje automático aplicado a química.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como exactitud, AUC, F1 u otras comparaciones con modelos alternativos.

## Requisitos de hardware

- No se dispone de información sobre requisitos de VRAM, GPU recomendadas o latencia.
- Al ser un GCN de tamaño probablemente reducido (no se especifican parámetros), es plausible que pueda ejecutarse en CPU, pero no hay confirmación oficial.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje.
- El checkpoint de PyTorch Lightning puede cargarse en entornos con PyTorch instalado, tanto en CPU como en GPU, pero se desconoce el consumo de memoria.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (GCN para química) dentro de los datos proporcionados. No se puede realizar una comparativa cuantitativa o cualitativa con alternativas como GCN estándar, GraphSAGE o GAT, ya que no se han facilitado datos de rendimiento ni características técnicas de otros modelos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el subconjunto ChEBI25-3STAR (v252), por lo que su capacidad de generalización a moléculas fuera de ese dominio puede ser limitada.
- No se han documentado sesgos específicos, pero al depender de la curaduría del dataset, podría heredar sesgos de anotación o de cobertura química.
- Riesgo de sobreajuste si se aplica a compuestos muy diferentes a los del entrenamiento.
- No es un modelo de lenguaje, por lo que no debe utilizarse para tareas de generación de texto o procesamiento de lenguaje natural.
- La licencia MIT permite uso comercial y modificación, pero se recomienda verificar la licencia del dataset subyacente (ChEBI) para posibles restricciones adicionales.
- No se proporcionan garantías de rendimiento en producción; se requiere validación adicional con datos propios.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/chebai/resgated-chebi25-3star_v252)
- [Dataset ChEBI25-3STAR (v252)](https://huggingface.co/datasets/chebai/ChEBI25-3STAR)
- [Página de datasets de chebai](https://huggingface.co/chebai/datasets)
- [Librería ChEB-AI Graph en GitHub](https://github.com/ChEB-AI/python-chebai-graph)
- [Paquete chebai en PyPI](https://pypi.org/project/chebai/)
- [Tesis de Aditya Ganesh Khedekar (PDF)](https://www.uni-osnabrueck.de/fileadmin/informatik/Arbeitsgruppen/Hybride_KI/mt_aditya_khedekar.pdf)
