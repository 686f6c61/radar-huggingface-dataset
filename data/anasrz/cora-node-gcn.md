# anasrz/cora-node-gcn

## Resumen

anasrz/cora-node-gcn es un modelo de red neuronal de grafos (GNN) para clasificacion de nodos, publicado en Hugging Face por el autor anasrz. Se trata de un GCN (Graph Convolutional Network) de dos capas entrenado sobre el dataset Cora, orientado a la tarea `NodeClassifier` dentro del pipeline `graph-ml`. El modelo no genera texto ni procesa lenguaje natural: su entrada es la matriz de caracteristicas de los nodos y la matriz de adyacencia del grafo, y su salida es una etiqueta entre 7 clases.

Su relevancia no reside en el rendimiento bruto, que es modesto (accuracy de 0.7860 sobre Cora), sino en el marco con el que se ha construido: K3-Node, una libreria de GNNs multi-backend sobre Keras 3 que permite ejecutar el mismo modelo de forma nativa sobre PyTorch, JAX o TensorFlow sin cambios de codigo. Esto lo convierte en una pieza util como referencia reproducible de paridad entre backends y como ejemplo minimo de API `from_pretrained` para grafos.

El modelo es extremadamente compacto: 1433 canales de entrada, 32 canales ocultos, 2 capas y 7 clases de salida, con un dropout de 0.5. La licencia es MIT y el repo tiene un tamano declarado de 0.0 GB, con 0 descargas y 0 likes en el momento de la consulta, lo que indica un artefacto de investigacion sin adopcion publica significativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GCN (Graph Convolutional Network), backbone `gcn`, 2 capas |
| Parametros totales | No disponible en la model card; estimables en ~46.119 a partir de la configuracion declarada (1433x32 + 32 + 32x7 + 7) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: la entrada es un grafo (matriz de caracteristicas de nodos + matriz de adyacencia), no una secuencia de texto |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | `en` (etiqueta declarada en la model card; el modelo no procesa lenguaje natural, opera sobre caracteristicas de nodos) |
| Licencia | MIT |
| Formato de pesos | No especificado; pesos gestionados por la libreria `k3-node` sobre Keras 3 (carga via `NodeClassifier.from_pretrained`) |
| Canales de entrada | 1433 |
| Canales ocultos | 32 |
| Clases de salida | 7 |
| Dropout | 0.5 |
| Tarea (pipeline) | `NodeClassifier` / `graph-ml` |
| Libreria | `k3-node` sobre Keras 3 |
| Backends soportados | PyTorch, JAX, TensorFlow |
| Tamano del repo | 0.0 GB (declarado) |

## Arquitectura y entrenamiento

La arquitectura es un GCN clasico de dos capas apiladas: una primera capa que proyecta los 1433 canales de entrada a 32 canales ocultos y una segunda que proyecta esos 32 canales a las 7 clases de salida. Entre ambas se aplica dropout con probabilidad 0.5, un hiperparametro habitual en las implementaciones de referencia de GCN sobre Cora para mitigar el sobreajuste en un dataset pequeno. La propagacion se realiza sobre la matriz de adyacencia del grafo, de modo que la representacion de cada nodo se agrega con la de sus vecinos, lo que constituye el mecanismo central del modelo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento (concepto que no aplica directamente aqui), la composicion exacta del dataset, el numero de epocas, el optimizador, la tasa de aprendizaje ni si hubo etapas de ajuste adicionales. Tampoco se documentan innovaciones tecnicas mas alla del propio envoltorio K3-Node: la contribucion diferencial es la abstraccion multi-backend sobre Keras 3, que permite el mismo grafo de computacion ejecutarse en PyTorch, JAX y TensorFlow. El dataset Cora, referenciado en la model card, es el benchmark estandar de clasificacion de nodos sobre una red de citas de articulos cientificos con 7 clases tematicas.

## Capacidades

- Clasificacion de nodos en grafos: asigna una de 7 clases a cada nodo a partir de sus caracteristicas (1433 dimensiones) y de la estructura del grafo.
- Aprendizaje de representaciones de vecindad: al ser un GCN, incorpora informacion del entorno local del nodo, no solo sus atributos aislados.
- Ejecucion multi-backend: el mismo modelo se ejecuta con backend PyTorch, JAX o TensorFlow segun la variable de entorno `KERAS_BACKEND`.
- Carga directa desde Hugging Face Hub mediante `NodeClassifier.from_pretrained("anasrz/cora-node-gcn")`.
- Inferencia por lotes sobre datos de grafo mediante `model.predict(data)`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico.
- No dispone de modo de pensamiento (thinking mode) ni de capacidades multilingues: la etiqueta de idioma `en` es declarativa y no implica procesamiento de lenguaje.

## Casos de uso

- Referencia reproducible de clasificacion de nodos: sirve como linea base de accuracy 0.7860 sobre Cora para comparar variantes propias (GraphSAGE, GAT, GCN mas profundo) manteniendo fijo el preprocesado y el split de datos.
- Validacion de paridad entre backends: al ejecutarse sobre PyTorch, JAX y TensorFlow, permite comprobar que una implementacion de GNN produce resultados equivalentes en los tres motores cambiando solo `KERAS_BACKEND`.
- Prueba de humo (smoke test) en CI: con 2 capas y 32 canales ocultos, el modelo entrena e infiere en segundos, por lo que es adecuado para verificar que un pipeline de `k3-node` + Keras 3 no se ha roto tras una actualizacion de dependencias.
- Material docente para cursos de GNN: el modelo ilustra de forma minima el flujo completo (dataset de grafo, definicion de capas, entrenamiento, evaluacion y publicacion en el Hub) sin la complejidad de arquitecturas mayores.
- Prototipo de clasificacion en redes de citas o grafos de documentos: el esquema es directamente trasladable a un corpus propio de articulos, informes o registros, reentrenando la cabeza de salida al numero de clases del dominio.
- Demostracion de despliegue en CPU: dado su tamano, puede ejecutarse en un contenedor sin GPU, lo que resulta util para entornos de investigacion con recursos limitados o para servir clasificaciones de baja latencia sobre un grafo fijo.
- Base para experimentos de destilacion o compresion: al ser tan pequeno, es un punto de partida comodo para medir el impacto de poda, cuantizacion o cambios de dimension oculta en la accuracy final.
- Evaluacion de estrategias de muestreo de vecinos: permite aislar el efecto del muestreo o del numero de saltos en un modelo de complejidad controlada antes de escalar a grafos industriales.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| accuracy | 0.7860 | Cora |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. La model card unicamente reporta la metrica de accuracy indicada, sin detallar el split de evaluacion (train/validation/test) ni el protocolo de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con ~46.000 parametros estimados y 32 canales ocultos, el modelo y sus activaciones son de escala muy reducida; la memoria dominante sera la de las caracteristicas del grafo (1433 dimensiones por nodo).
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU moderna (por ejemplo, RTX 3060 o superior, A100, H100) es sobredimensionada para esta tarea; una GPU integrada o incluso CPU es suficiente.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: la via prevista es la libreria `k3-node` sobre Keras 3, con backend seleccionable entre PyTorch, JAX y TensorFlow. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Framework | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| anasrz/cora-node-gcn | GCN, 2 capas, 32 ocultos, 7 clases | K3-Node / Keras 3 (PyTorch, JAX, TF) | No disponible (~46.119 estimados) | No aplica (grafo) | accuracy 0.7860 en Cora | MIT | Hugging Face Hub |
| Anormalmaniac/cora_gcn | GCN sobre Cora | No disponible | No disponible | No aplica (grafo) | No disponible | No disponible | Hugging Face Hub |
| jasonjias/cora-gcn-node-classification | GCN de 2 capas sobre Cora (codigo de referencia) | PyTorch | No disponible | No aplica (grafo) | No disponible | No disponible | GitHub |
| KonNik88/gnn-node-link-pytorch | GCN, GraphSAGE y GAT sobre Cora/PubMed | PyTorch Geometric | No disponible | No aplica (grafo) | No disponible | No disponible | GitHub |

La comparativa se limita a disponibilidad, framework y tarea, ya que las alternativas localizadas no publican metricas ni configuraciones completas en la informacion recuperada. Destaca como diferencial el soporte multi-backend de K3-Node frente a las implementaciones mono-framework de las alternativas.

## Limitaciones y advertencias

- Alcance cerrado: el modelo clasifica en 7 clases concretas y no es reutilizable tal cual para un grafo con otro numero de clases o con caracteristicas de entrada de dimensionalidad distinta a 1433 sin reentrenar la cabeza de salida.
- Dominio restringido: esta entrenado sobre Cora, una red de citas academicas en ingles; su generalizacion a otros dominios (grafos sociales, moleculas, fraude financiero) no esta demostrada y probablemente requiera reentrenamiento.
- Rendimiento modesto: un accuracy de 0.7860 esta por debajo de las cifras tipicamente reportadas para GCN de referencia sobre Cora, aunque no se dispone del protocolo de evaluacion para contextualizar la cifra.
- Riesgo de sobreajuste: con solo 2 capas, 32 canales ocultos y dropout 0.5, la capacidad del modelo es muy limitada; grafos grandes o con alta heterofilia pueden degradar notablemente el resultado.
- Ausencia de validacion externa: 0 descargas y 0 likes, sin benchmarks comparativos publicados ni detalles de entrenamiento (epocas, optimizador, split), lo que dificulta la reproducibilidad y la auditoria de la metrica.
- Sin capacidades generativas ni de agentes: no soporta tool calling, function calling, razonamiento multi-paso ni procesamiento multilingue; no debe emplearse en casos que requieran esas funciones.
- Alucinacion: el concepto no aplica en el sentido habitual de los modelos generativos, pero existe riesgo de predicciones erroneas con alta confianza en nodos poco representados en el conjunto de entrenamiento.
- Sesgos: no se documenta ningun analisis de sesgo. Al proceder de un corpus de citas academicas en ingles, puede heredar sesgos de representacion tematica y geografica del dataset original.
- Licencia permisiva con cautela: MIT permite uso comercial y modificacion, pero la licencia cubre el artefacto publicado, no necesariamente los derechos sobre el dataset Cora subyacente ni sobre los pesos derivados.
- Caveat de produccion: el tamano del repo declarado (0.0 GB) y la ausencia de documentacion sobre el formato exacto de pesos hacen recomendable verificar la carga real del modelo antes de integrarlo en un pipeline critico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anasrz/cora-node-gcn
- Repositorio de K3-Node: https://github.com/anas-rz/k3-node
- Alternativa en Hugging Face (Anormalmaniac/cora_gcn): https://huggingface.co/Anormalmaniac/cora_gcn
- Implementacion de referencia GCN sobre Cora (jasonjias): https://github.com/jasonjias/cora-gcn-node-classification
- GNNs sobre Cora/PubMed con PyTorch Geometric (KonNik88): https://github.com/KonNik88/gnn-node-link-pytorch
- Notebook de GNNs del laboratorio gta-lab: https://colab.research.google.com/github/gta-lab/graph-neural-networks/blob/main/notebooks/05-GNNs.ipynb
- Notebook de clasificacion de nodos con GCN de StellarGraph: https://colab.research.google.com/github/stellargraph/stellargraph/blob/master/demos/node-classification/gcn-node-classification.ipynb
