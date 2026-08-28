# chebai/resgated-aug-chebi25_v252

## Resumen

El modelo `resgated-aug-chebi25_v252` es un grafo neuronal convolucional (GCN) con conexiones residuales y mecanismo de gating, desarrollado por el grupo ChEB-AI para la integración de aprendizaje profundo con ontologías químicas, específicamente la ontología ChEBI. El modelo fue entrenado sobre el dataset ChEBI25 (versión v252) y está diseñado para tareas de clasificación o predicción de propiedades de compuestos químicos a partir de su estructura molecular representada como grafo.

Este modelo forma parte de una línea de investigación que busca incorporar conocimiento químico estructurado en redes neuronales para mejorar la precisión y la interpretabilidad en tareas de química computacional. Su relevancia radica en que aborda la necesidad de modelos especializados en dominios científicos, donde las representaciones basadas en grafos son más naturales que las secuencias lineales. El repositorio incluye el checkpoint de PyTorch Lightning, los archivos de configuración y la versión de la librería utilizada, lo que facilita la reproducibilidad.

Con un tamaño de repositorio de 0.1 GB, es un modelo ligero, adecuado para entornos con recursos limitados. La licencia MIT permite su uso comercial y académico sin restricciones significativas. Aunque no se especifican idiomas, al ser un modelo de grafos moleculares, no es un modelo de lenguaje y su aplicación es independiente del idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GCN residual-gated (Graph Convolutional Network con conexiones residuales y gating) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de grafos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch Lightning (probablemente .ckpt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de GCN con conexiones residuales y un mecanismo de gating, lo que permite un mejor flujo de gradientes y una mayor capacidad de representación en comparación con GCN estándar. La entrada es la estructura molecular aumentada (augmented molecule structure), lo que sugiere que se incorporan características adicionales a los átomos y enlaces, posiblemente derivadas de la ontología ChEBI. El entrenamiento se realizó sobre el dataset ChEBI25 v252, que contiene compuestos químicos anotados con clases de la ontología ChEBI. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La librería `python-chebai-graph` (v1.2.0) se utilizó para la implementación y el entrenamiento, y se referencia una tesis de maestría que detalla la integración de conocimiento químico en GNN.

## Capacidades

- Representación de moléculas como grafos y extracción de características estructurales.
- Clasificación de compuestos químicos según la ontología ChEBI (probablemente, aunque no se especifica explícitamente).
- Predicción de propiedades químicas a partir de la estructura molecular (inferido, no documentado).
- No es un modelo de lenguaje, por lo que no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- No se han documentado capacidades multilingües ni de visión o audio.

## Casos de uso

- **Clasificación de compuestos químicos en ontologías**: el modelo puede asignar clases ChEBI a nuevas moléculas, lo que es útil para la anotación automática de bases de datos químicas.
- **Detección de similitud molecular**: al generar representaciones vectoriales de moléculas, puede emplearse para buscar compuestos con estructuras o propiedades similares en grandes colecciones.
- **Filtrado de compuestos en cribado virtual**: en pipelines de descubrimiento de fármacos, el modelo puede predecir si una molécula pertenece a una clase funcional relevante, ayudando a priorizar candidatos.
- **Análisis de relaciones estructura-actividad**: al combinar la representación del grafo con propiedades biológicas, puede apoyar estudios QSAR (relación cuantitativa estructura-actividad).
- **Integración en librerías de química computacional**: al ser un modelo ligero y con licencia MIT, puede incorporarse en herramientas de código abierto para enriquecer sus capacidades de representación molecular.
- **Educación e investigación**: sirve como punto de partida para experimentar con GCN residual-gated en problemas de química, gracias a la disponibilidad del código y la configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de lenguaje o razonamiento general.

## Requisitos de hardware

- Al ser un modelo de 0.1 GB, es muy ligero y puede ejecutarse en CPU sin problemas.
- No se requiere GPU para inferencia, aunque podría acelerarse con una GPU modesta (por ejemplo, una NVIDIA T4 o RTX 3060) si se procesan muchos grafos en paralelo.
- El despliegue puede realizarse mediante PyTorch Lightning, ya que el checkpoint está en ese formato. También podría convertirse a otros formatos (ONNX, TorchScript) si se desea.
- No se dispone de datos sobre latencia o throughput, pero dado el tamaño, se espera un rendimiento rápido en lotes pequeños.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (GCN residual-gated para ontologías químicas). No se han encontrado alternativas directas en la documentación proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al entrenarse en un dataset concreto (ChEBI25 v252), el modelo puede no generalizar bien a compuestos fuera de ese dominio.
- Riesgo de alucinación: al ser un modelo discriminativo (no generativo), no produce texto, por lo que el riesgo de alucinación es bajo, pero puede haber errores de clasificación.
- Limitaciones de contexto: no aplica, ya que no procesa secuencias de texto.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del dataset ChEBI25 v252, que puede tener restricciones adicionales.
- No se proporcionan instrucciones detalladas de uso ni ejemplos de inferencia en la model card, lo que puede dificultar su adopción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/chebai/resgated-aug-chebi25_v252)
- [Dataset ChEBI25 v252](https://huggingface.co/datasets/chebai/ChEBI25_v252)
- [Perfil de chebai en Hugging Face](https://huggingface.co/chebai)
- [Repositorio de la librería python-chebai-graph](https://github.com/ChEB-AI/python-chebai-graph)
- [Tesis de maestría de Aditya Ganesh Khedekar](https://www.uni-osnabrueck.de/fileadmin/informatik/Arbeitsgruppen/Hybride_KI/mt_aditya_khedekar.pdf)
- [ChEBai en PyPI](https://pypi.org/project/chebai/)
