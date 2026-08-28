# chebai/resgated-chebi25_v252

## Resumen

El modelo `chebai/resgated-chebi25_v252` es un grafo neuronal convolucional (GCN) con conexiones residuales y mecanismo de compuerta (residual-gated GCN), desarrollado por el grupo ChEB-AI para la clasificación de compuestos químicos dentro de la ontología ChEBI. Se ha entrenado sobre el dataset ChEBI25(v252), una versión curada de la base de datos ChEBI que asigna cada compuesto a una o varias clases ontológicas. El modelo integra conocimiento químico semántico en el proceso de aprendizaje, lo que permite predecir categorías funcionales y estructurales de moléculas representadas como grafos.

La relevancia actual de este modelo radica en su aplicación a tareas de anotación automática de compuestos en química computacional y bioinformática, donde la clasificación ontológica es un paso previo esencial para la integración de datos en bases de conocimiento. Al estar licenciado bajo MIT y publicarse con su configuración de entrenamiento, facilita su reproducción y adaptación a dominios específicos. La arquitectura exacta (número de capas, dimensiones ocultas, número de parámetros) no se detalla en la información pública disponible, aunque el repositorio incluye los ficheros de configuración y el checkpoint de PyTorch Lightning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Residual-gated GCN (Graph Convolutional Network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada molecular, no texto) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch Lightning (configuración y pesos incluidos) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de red neuronal convolucional sobre grafos (GCN) con conexiones residuales y una compuerta (gating) que modula la propagación de información entre nodos. Esta variante residual-gated permite un entrenamiento más estable y una mejor captura de dependencias de largo alcance en la estructura molecular. El entrenamiento se realizó con PyTorch Lightning, utilizando el dataset ChEBI25(v252), que contiene compuestos químicos anotados con clases de la ontología ChEBI. La integración de conocimiento químico se realiza mediante la librería ChEB-AI Graph (v1.2.0), que incorpora la semántica de la ontología en el proceso de aprendizaje, tal como se describe en la tesis de Khedekar (2026). No se especifican detalles sobre el número de tokens, composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo supervisado de clasificación.

## Capacidades

- Clasificación de compuestos químicos en clases de la ontología ChEBI (por ejemplo, roles biológicos, aplicaciones, clases químicas).
- Representación de moléculas como grafos, lo que permite manejar estructuras 2D sin necesidad de descriptores manuales.
- Integración de conocimiento ontológico en el aprendizaje, mejorando la coherencia semántica de las predicciones.
- Entrada de grafos moleculares (átomos y enlaces) y salida de probabilidades sobre las clases de ChEBI.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Anotación automática de compuestos en bases de datos químicas: el modelo puede asignar clases ChEBI a nuevas moléculas, facilitando la curación de repositorios como PubChem o ChEMBL.
- Enriquecimiento de metabolitos en estudios metabolómicos: dada una lista de metabolitos detectados por espectrometría de masas, el modelo predice sus roles biológicos y clases químicas para su interpretación funcional.
- Filtrado de candidatos a fármacos: en pipelines de descubrimiento de fármacos, el modelo puede clasificar compuestos según su actividad prevista (por ejemplo, inhibidores enzimáticos) a partir de su estructura.
- Integración de datos heterogéneos en quimioinformática: al normalizar compuestos bajo la ontología ChEBI, se facilita la fusión de conjuntos de datos de distintas fuentes.
- Validación de anotaciones existentes: el modelo puede usarse como verificador automático de asignaciones ChEBI en bases de datos, detectando posibles errores.
- Educación e investigación en química computacional: sirve como punto de partida para experimentos con GCNs en problemas de clasificación molecular, gracias a su licencia MIT y su configuración reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tesis de Khedekar (2026) podría contener evaluaciones detalladas, pero no se ha accedido a su contenido completo. No se dispone de métricas como exactitud, F1 o comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un GCN de tamaño no especificado, los requisitos de VRAM dependen del número de parámetros y del tamaño de los grafos de entrada. Sin datos concretos, no se puede estimar con precisión.
- El entrenamiento se realizó con PyTorch Lightning, por lo que es compatible con GPUs NVIDIA (CUDA). Una GPU con al menos 8 GB de VRAM podría ser suficiente para inferencia en lotes pequeños, pero no hay confirmación.
- Para despliegue en producción, se puede servir mediante TorchServe o un contenedor Docker con PyTorch, aunque no se mencionan herramientas específicas como vLLM u Ollama (no aplicables a modelos de grafos).
- La latencia dependerá del tamaño del grafo y del hardware; para moléculas pequeñas (menos de 100 átomos) la inferencia debería ser del orden de milisegundos en una GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (GCNs para clasificación ontológica química). Existen otros enfoques como Graph Neural Networks genéricas (por ejemplo, GIN, GraphSAGE) o modelos preentrenados como ChemBERTa (para texto SMILES), pero no se han encontrado comparaciones directas con este modelo en las fuentes consultadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento, por lo que no se puede evaluar su precisión real frente a alternativas.
- El modelo está entrenado específicamente en el dataset ChEBI25(v252), lo que puede limitar su generalización a compuestos fuera de ese conjunto o a ontologías diferentes.
- Al ser un modelo de grafos, requiere que las moléculas de entrada se representen correctamente como grafos (átomos y enlaces), lo que implica un preprocesamiento adicional.
- No hay información sobre sesgos o riesgos de alucinación, pero al ser un clasificador supervisado, puede presentar errores en clases poco representadas en el dataset de entrenamiento.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del dataset ChEBI25(v252) subyacente, que puede tener restricciones adicionales.
- El repositorio no incluye un modelo preentrenado en formato estándar (por ejemplo, ONNX o safetensors), lo que puede dificultar su integración en entornos de producción que requieran esos formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chebai/resgated-chebi25_v252
- Organización ChEB-AI en Hugging Face: https://huggingface.co/chebai
- Dataset ChEBI25(v252): https://huggingface.co/datasets/chebai/ChEBI25_v252
- Librería ChEB-AI Graph (GitHub): https://github.com/ChEB-AI/python-chebai-graph
- Librería ChEBai (PyPI): https://pypi.org/project/chebai/
- Tesis de Aditya Ganesh Khedekar (PDF): https://www.uni-osnabrueck.de/fileadmin/informatik/Arbeitsgruppen/Hybride_KI/mt_aditya_khedekar.pdf
- Herramienta Chebifier (clasificación automática con ChEBI): https://chebifier.hastingslab.org/
