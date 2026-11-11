# IELTS8/JEPA-CAD

## Resumen

JEPA-CAD es un artefacto de investigación publicado en Hugging Face por el usuario IELTS8 que contiene los pesos preentrenados y la caché de grafos del brazo de comparación `jepa_joint` del proyecto JEPA-CAD, orientado al aprendizaje de representaciones sobre geometría CAD. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un checkpoint de PyTorch (1,94 GB) acompañado de un fichero de grafos procesados (8,08 GB) que juntos permiten reproducir una comparación concreta sobre el conjunto de datos HistCAD. La model card es explícita al indicar que no se ha realizado preprocesamiento, reentrenamiento ni generación de nuevos resultados para esta subida: son artefactos existentes de una ejecución en Windows.

El checkpoint se seleccionó en la época 20 y produce una representación conjunta de 4.096 dimensiones. La caché contiene 162.131 pares de grafos HistCAD con los splits originales (145.915 de entrenamiento, 8.130 de validación y 8.086 de prueba). El proyecto combina las siglas JEPA (Joint Embedding Predictive Architecture) con representación de grafos aplicada a CAD, lo que sugiere un enfoque de predicción en espacio latente sobre estructuras gráficas derivadas de modelos paramétricos.

La relevancia de esta ficha es acotada: se trata de un artefacto de reproducibilidad para investigación en representación de geometría CAD, no de un modelo listo para producción. La información pública disponible es mínima (sin licencia declarada, sin idiomas, sin pipeline, cero descargas y cero likes en el momento de la consulta), por lo que muchos campos de esta ficha quedan marcados como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA (Joint Embedding Predictive Architecture) sobre representación de grafos; detalles internos no disponibles |
| Parámetros totales | no disponible (el checkpoint `best.pt` ocupa 1.938.955.953 bytes) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible; se distribuyen pesos en formato PyTorch nativo |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch serializado (`.pt`); caché de grafos también en `.pt` |

## Arquitectura y entrenamiento

La información disponible indica que el modelo sigue un esquema JEPA (`jepa_joint`) aplicado a representación de grafos (`graph-representation-learning`) en el dominio CAD. La arquitectura JEPA, propuesta originalmente por Yann LeCun y colaboradores, entrena un codificador para predecir representaciones latentes de vistas enmascaradas de una entrada, en lugar de reconstruir píxeles o tokens. En este caso la entrada son grafos emparejados derivados de modelos CAD del conjunto HistCAD, y la salida es una representación conjunta de 4.096 dimensiones.

El checkpoint se seleccionó en la época 20 sobre el split de validación (8.130 pares). No se especifican en la información proporcionada el número total de tokens, la composición exacta del dataset de entrenamiento, la presencia de RLHF/DPO (poco probable en este dominio) ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card subraya que los artefactos son una ejecución congelada en Windows y que no se ha realizado ningún paso de optimización ni preprocesamiento para esta publicación.

## Capacidades

- Aprendizaje de representaciones sobre grafos derivados de geometría CAD (pares de grafos HistCAD).
- Generación de embeddings conjuntos de 4.096 dimensiones utilizables como entrada para tareas posteriores (recuperación, clasificación, comparación de geometrías).
- Reproducción de un brazo de comparación concreto (`jepa_joint`) dentro del proyecto JEPA-CAD.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo.
- No se documenta modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Reproducción de experimentos: cargar `best.pt` y `full_paired_graphs_v7.pt` con el código del repositorio para replicar la comparación `jepa_joint` sobre los splits originales de HistCAD.
- Investigación en representación de geometría CAD: usar los embeddings de 4.096 dimensiones como entrada para tareas downstream como recuperación de modelos similares o clasificación de familias de piezas.
- Comparación de arquitecturas: emplear este checkpoint como brazo de referencia frente a otras arquitecturas de representación de grafos en el mismo conjunto HistCAD.
- Análisis de pares de grafos: aprovechar la caché de 162.131 pares para estudiar correspondencias entre representaciones gráficas de modelos CAD.
- Validación de pipelines de preprocesamiento: usar la caché procesada como referencia para verificar que un pipeline propio produce grafos equivalentes a los del proyecto original.
- Docencia y experimentación: al ser un artefacto pequeño en número de ficheros (dos `.pt`), sirve para ilustrar flujos de trabajo con JEPA sobre datos estructurados no lingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: aproximadamente 10 GB para los dos artefactos (8,08 GB de caché de grafos más 1,94 GB de checkpoint).
- VRAM estimada para inferencia: no disponible; depende del tamaño real del codificador, que no se especifica. Como referencia, un checkpoint de 1,94 GB en precisión nativa requiere al menos esa cantidad de memoria más el grafo de cómputo y los datos de entrada.
- GPU recomendadas: no disponible. El tamaño del checkpoint sugiere que puede caber en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090 con 24 GB), pero no se confirma en la información.
- Despliegue: el proyecto indica uso mediante `use_pretrained.py` del repositorio de código y descarga con `huggingface_hub` (`hf download`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de representación de grafos CAD ni resultados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Los artefactos son una ejecución congelada en Windows y no se ha realizado preprocesamiento ni reentrenamiento para esta publicación; no deben tratarse como un modelo entrenado de novo.
- La caché de grafos es un derivado procesado: no incluye los ficheros STEP originales, los JSON paramétricos ni los archivos del dataset fuente, por lo que no es posible reconstruir el dataset original a partir de estos artefactos.
- El checkpoint está pensado para usarse con el código del repositorio JEPA-CAD; sin él, su utilidad es muy limitada.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de sobreinterpretar los embeddings si se usan fuera del dominio HistCAD.
- Sesgos: no documentados; el conjunto HistCAD puede no ser representativo de toda la geometría CAD industrial.
- Limitaciones de idioma y contexto: no aplican (no es un modelo de lenguaje).
- Verificar los checksums SHA-256 registrados en `ARTIFACTS.json` antes de usar los ficheros, ya que se distribuyen como artefactos binarios de PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/IELTS8/JEPA-CAD
- Repositorio de código y resultados: https://github.com/OliverFanHL/JEPA-CAD
- Dataset original HistCAD: https://huggingface.co/datasets/DongXintong/HistCAD
