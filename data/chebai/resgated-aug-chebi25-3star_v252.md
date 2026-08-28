# chebai/resgated-aug-chebi25-3star_v252

## Resumen

El modelo `chebai/resgated-aug-chebi25-3star_v252` es una red neuronal de grafos (GNN) de tipo *Residual-gated GCN* (Graph Convolutional Network con conexiones residuales y compuertas) desarrollada por el usuario `chebai` dentro del proyecto ChEB-AI. Está entrenada específicamente sobre el dataset químico ChEBI25-3STAR (versión v252), que contiene moléculas anotadas con clases de la ontología ChEBI. Su propósito es aprender representaciones de estructuras moleculares para tareas de clasificación o predicción de propiedades químicas, integrando conocimiento químico en el modelo.

El modelo se distribuye bajo licencia MIT e incluye un checkpoint de PyTorch Lightning junto con los archivos de configuración y la versión de la librería `python-chebai-graph` (v1.2.0) utilizada durante el entrenamiento. No se trata de un modelo de lenguaje, sino de un modelo de grafos orientado a química computacional. El tamaño del repositorio es de 0.1 GB, lo que sugiere un modelo compacto, aunque no se especifican el número de parámetros ni la arquitectura interna en detalle.

La relevancia de este modelo radica en su enfoque: aplicar arquitecturas GNN avanzadas (con compuertas residuales) a un dataset químico curado, lo que puede ser útil para investigadores que necesitan modelos de clasificación molecular reproducibles y con licencia permisiva. Sin embargo, al ser un modelo reciente (creado en agosto de 2026) y con cero descargas, su adopción y validación externa aún son limitadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Residual-gated GCN (augmented molecule structure) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch Lightning (probablemente `.ckpt`) |

## Arquitectura y entrenamiento

El modelo implementa una *Residual-gated GCN*, una variante de las redes convolucionales para grafos que incorpora conexiones residuales y mecanismos de compuerta (gating) para mejorar el flujo de gradientes y la expresividad. Según la model card, se trata de una versión "aumentada" de la estructura molecular, lo que sugiere que se añaden características o transformaciones adicionales a los nodos y aristas del grafo molecular. Los detalles arquitectónicos completos se describen en la tesis de maestría de Aditya Ganesh Khedekar (Universidad Otto-von-Guericke de Magdeburg, 2026), titulada *"Integrating Chemical Knowledge into Graph Neural Networks"*.

El entrenamiento se realizó sobre el dataset ChEBI25-3STAR (v252), que forma parte de la ontología ChEBI (Chemical Entities of Biological Interest). No se proporcionan datos sobre el número de tokens (al no ser un modelo de texto), la composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO. La única información disponible es que se usó la librería `python-chebai-graph` en su versión 1.2.0, y que el checkpoint se guardó con PyTorch Lightning. No se mencionan innovaciones técnicas adicionales más allá de la arquitectura residual-gated.

## Capacidades

- Clasificación de moléculas según la ontología ChEBI (por ejemplo, roles biológicos, actividades químicas).
- Predicción de propiedades químicas a partir de la estructura molecular representada como grafo.
- Aprendizaje de representaciones de grafos moleculares con mecanismos de compuerta y residuales.
- Integración con el ecosistema ChEB-AI para tareas de química computacional.
- No es un modelo de lenguaje: no genera texto, no soporta *tool calling* ni razonamiento multi-paso en lenguaje natural.
- No se han documentado capacidades multimodales (visión, audio, etc.).

## Casos de uso

No se han documentado casos de uso específicos por parte del autor. Dado que se trata de un GNN químico, las aplicaciones potenciales (aún no confirmadas) podrían incluir:

- Predicción de toxicidad de compuestos químicos: el modelo podría clasificar moléculas según su potencial tóxico usando la representación en grafo.
- Descubrimiento de fármacos: cribado virtual de bibliotecas de compuestos para identificar candidatos con propiedades deseadas.
- Clasificación de roles biológicos: asignación de categorías ChEBI a moléculas, útil para bases de datos químicas.
- Modelado de relaciones estructura-actividad (QSAR): correlacionar la estructura molecular con actividades biológicas.
- Análisis de metabolómica: identificación de metabolitos a partir de sus estructuras.
- Integración en pipelines de quimioinformática: como módulo de representación de moléculas en flujos de trabajo más amplios.

Estos usos son inferencias basadas en el dominio de aplicación, no en documentación oficial del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas, ya que el modelo no es un LLM. Tampoco se proporcionan métricas de precisión, recall o F1 sobre el dataset ChEBI25-3STAR.

## Requisitos de hardware

- Tamaño del repositorio: 0.1 GB, lo que sugiere un modelo pequeño (probablemente menos de 100 millones de parámetros, aunque no se confirma).
- VRAM estimada: no disponible. Dado el tamaño, es probable que quepa en GPUs de consumo como una RTX 3060 (12 GB) o incluso en CPU, pero no hay datos oficiales.
- GPU recomendadas: no especificadas. Por el tamaño, cualquier GPU moderna con al menos 4-8 GB de VRAM debería ser suficiente.
- Opciones de despliegue: al ser un checkpoint de PyTorch Lightning, se puede cargar con PyTorch y la librería `python-chebai-graph`. No se mencionan formatos como ONNX, TensorRT o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existe un modelo similar del mismo autor: `chebai/gat-aug-chebi25-3star_v248`, que utiliza una Graph Attention Network (GAT) en lugar de GCN residual-gated. Sin embargo, no se dispone de datos comparativos de rendimiento, parámetros o contexto. No se conocen otros modelos comparables en la misma categoría (GNN químicos sobre ChEBI) con información pública.

| Modelo | Arquitectura | Dataset | Licencia | Parámetros | Rendimiento |
|---|---|---|---|---|---|
| resgated-aug-chebi25-3star_v252 | Residual-gated GCN | ChEBI25-3STAR v252 | MIT | no disponible | no disponible |
| gat-aug-chebi25-3star_v248 | GAT | ChEBI25-3STAR v248 | MIT | no disponible | no disponible |

## Limitaciones y advertencias

- No hay información sobre sesgos específicos, pero al estar entrenado en un dataset concreto (ChEBI25-3STAR), el modelo puede tener un rendimiento limitado fuera de ese dominio.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto.
- Limitaciones de contexto o idioma: no aplica, es un modelo de grafos.
- La licencia MIT permite uso comercial, pero no se ofrecen garantías de precisión o idoneidad para producción.
- El modelo no ha sido validado externamente (cero descargas y cero likes), por lo que su robustez es desconocida.
- Depende de la librería `python-chebai-graph` (v1.2.0), lo que puede limitar su portabilidad si la librería no está mantenida.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/chebai/resgated-aug-chebi25-3star_v252)
- [Dataset ChEBI25_v252](https://huggingface.co/datasets/chebai/ChEBI25_v252)
- [Dataset ChEBI25-3STAR](https://huggingface.co/datasets/chebai/ChEBI25-3STAR)
- [Librería ChEB-AI Graph (GitHub)](https://github.com/ChEB-AI/python-chebai-graph)
- [Tesis de Aditya Ganesh Khedekar (PDF)](https://www.uni-osnabrueck.de/fileadmin/informatik/Arbeitsgruppen/Hybride_KI/mt_aditya_khedekar.pdf)
