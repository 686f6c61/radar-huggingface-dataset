# OneScience-Group/P2PXML

## Resumen

P2PXML es un marco de aprendizaje geométrico profundo desarrollado por OneScience-Group para predecir la afinidad de unión anticuerpo-antígeno en términos de IC50. El modelo combina información de secuencia proteica y estructura tridimensional (PDB) mediante dos ramas paralelas: una rama estructural que construye grafos a partir de coordenadas atómicas y utiliza GCN y GAT, y una rama de secuencia que emplea atención, transformadores y cross-attention. Su salida es una predicción de regresión de afinidad.

El modelo es relevante en el descubrimiento de anticuerpos terapéuticos, ya que permite evaluar de forma relativamente rápida la afinidad de candidatos a partir de sus estructuras PDB. Está publicado en el *Journal of Structural Biology* (2025) y su implementación se acompaña de código adaptado, pesos preentrenados y datos de ejemplo. El modelo no es un modelo de lenguaje, sino un sistema especializado en biociencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo combinado de dos ramas: estructural (GCN, GAT, pooling de grafos) y de secuencia (attention, Transformer, cross-attention) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada son ficheros PDB con límites de secuencia: anticuerpo 669 aa, antígeno 3102 aa) |
| Tipos de cuantizacion | no disponible (pesos en float64, sin cuantización) |
| Idiomas soportados | en (el marcado del repositorio indica inglés; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo se compone de dos ramas paralelas. La rama estructural construye grafos de anticuerpo y antígeno a partir de las coordenadas atómicas de los ficheros PDB y extrae representaciones estructurales mediante GCN, GAT y operaciones de pooling de grafos. La rama de secuencia extrae las secuencias de aminoácidos de los mismos ficheros, aplica codificación one-hot y utiliza módulos de atención, Transformer y cross-attention para modelar representaciones a nivel de secuencia y de interacción. Las salidas de regresión de ambas ramas se fusionan para predecir la afinidad de unión en IC50.

El entrenamiento se realizó con el conjunto de datos P2PXML_Structure. El fichero local `P2PXML_structure.csv` incluido en el paquete contiene 8.475 registros de pares anticuerpo-antígeno, con 655 estructuras PDB de anticuerpos y 469 de antígenos. El conjunto de datos completo está disponible en Zenodo. No se proporcionan en la información disponible el número de tokens de entrenamiento ni detalles sobre técnicas como RLHF o DPO, que no son aplicables a este modelo de regresión. La implementación se basa en PyTorch y PyTorch Geometric.

## Capacidades

- Predicción de la afinidad de unión anticuerpo-antígeno (IC50) a partir de ficheros PDB de anticuerpo y antígeno.
- Integración conjunta de información de secuencia y estructura tridimensional mediante cross-attention.
- Procesamiento de secuencias de hasta 669 aminoácidos en el anticuerpo y 3102 aminoácidos en el antígeno.
- Soporte de inferencia en CPU, CUDA, ROCm y DTK (DCU) a través de PyTorch.
- Entrenamiento y evaluación con el conjunto de datos oficial P2PXML_Structure.
- No soporta tool calling, agentes ni generación de texto: el modelo es exclusivamente de regresión especializada.

## Casos de uso

- **Predicción de afinidad anticuerpo-antígeno:** el modelo toma un PDB de anticuerpo y un PDB de antígeno y devuelve una predicción de IC50, lo que permite estimar la fortaleza de unión en procesos de descubrimiento de anticuerpos.
- **Cribado de candidatos a anticuerpos:** se pueden comparar las afinidades predichas de múltiples pares de estructuras anticuerpo-antígeno para seleccionar los que muestren tendencias más favorables.
- **Validación de compatibilidad de modelos:** el modelo sirve para comprobar el funcionamiento de PyTorch Geometric y de la inferencia en entornos de acelerador DCU, como el entorno SCNet.
- **Reproducción de métodos:** permite ejecutar el entrenamiento o la evaluación con el conjunto de datos P2PXML_Structure para reproducir los resultados del artículo.
- **Investigación en biociencia:** constituye una herramienta para estudiar los determinantes estructurales y de secuencia de la unión anticuerpo-antígeno.
- **Integración en pipelines de descubrimiento de fármacos:** la salida de regresión puede combinarse con otros criterios, como propiedades de desarrollo o de producción, para filtrar y priorizar candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La información proporcionada no incluye métricas numéricas (por ejemplo, RMSE o coeficiente de correlación) comparadas con otros modelos.

## Requisitos de hardware

- El modelo soporta CPU y aceleradores compatibles con PyTorch (CUDA, ROCm, DTK/DCU).
- Se recomienda una GPU o DCU para inferencia y entrenamiento; la CPU es válida para validación funcional, pero la construcción de grafos PDB y el cálculo del modelo son significativamente más lentos.
- La memoria de dispositivo y de host requerida depende del número de átomos en las estructuras de anticuerpo y antígeno, así como del tamaño del lote.
- El modelo y las características de los grafos utilizan `float64`, lo que incrementa los requisitos de memoria.
- El entrenamiento con el conjunto de datos completo genera cachés de grafos y checkpoints, por lo que requiere mucho más espacio en disco que la inferencia de una sola muestra.
- No se especifican valores de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican modelos comparables para la tarea específica de predicción de afinidad anticuerpo-antígeno con enfoque geométrico.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para predecir IC50 a partir de estructuras PDB; no es un modelo de lenguaje y no maneja texto libre ni entradas multimodales generales.
- Los límites de longitud de secuencia del modelo de demostración son 669 aminoácidos para el anticuerpo y 3102 para el antígeno. Las estructuras fuera de estos rangos pueden requerir preprocesamiento adicional o no procesarse correctamente.
- El rendimiento y la interpretabilidad pueden verse afectados por la calidad de los ficheros PDB de entrada.
- Al ser un modelo de regresión, las predicciones pueden contener errores y no deben utilizarse como única fuente de decisión en aplicaciones clínicas o regulatorias.
- El uso de `float64` aumenta los requisitos de memoria y puede limitar el tamaño de lote en GPUs con poca VRAM.
- La licencia MIT permite el uso comercial, pero los usuarios deben verificar las condiciones de los datos de entrenamiento (Zenodo) y de los conjuntos de datos utilizados.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/P2PXML
- Repositorio GitHub: https://github.com/Drug-Discovery-ENTC/p2pxml
- Página del proyecto: https://drug-discovery-entc.github.io/p2pxml/
- Artículo: https://doi.org/10.1016/j.jsb.2025.108257
- Conjunto de datos en Zenodo: https://zenodo.org/records/11531319
