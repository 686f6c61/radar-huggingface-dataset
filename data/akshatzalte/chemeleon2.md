# akshatzalte/chemeleon2

## Resumen

Chemeleon2 es un modelo de prediccion de propiedades moleculares publicado en Hugging Face por el usuario akshatzalte bajo licencia MIT. Se distribuye como un repositorio de la libreria `chemprop`, lo que indica que se trata de una red neuronal de grafos (graph neural network, GNN) orientada a tareas de quimica computacional, y no de un modelo de lenguaje generativo. Su proposito es predecir propiedades fisicoquimicas o biologicas de moleculas representadas como grafos atomicos, un caso de uso clasico en descubrimiento de farmacos y quimica de materiales.

El modelo se presenta explicitamente como un artefacto con pesos preentrenados ("pretraining" en sus tags), lo que sugiere que puede servir como base para fine-tuning en tareas downstream de regresion o clasificacion molecular. El repositorio ocupa 0,2 GB, un tamano coherente con un checkpoint de GNN de complejidad moderada, muy alejado de los ordenes de magnitud de los LLM.

Es relevante ahora porque la prediccion de propiedades moleculares con GNN preentrenadas se ha consolidado como una alternativa eficiente frente a los modelos generativos de quimica: requiere mucho menos computo, ofrece mejor calibracion en tareas de regresion y se integra directamente en pipelines de `chemprop`. La informacion publica disponible es, sin embargo, muy limitada: cero descargas, cero likes, sin pipeline declarado y con acceso restringido (gated), por lo que muchos datos tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GNN) implementada sobre la libreria `chemprop`; variante concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos moleculares, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | pesos compatibles con `chemprop` (formato exacto no disponible); repositorio de 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal de grafos para prediccion de propiedades moleculares, gestionada a traves de la libreria `chemprop`. Esta libreria es la implementacion de referencia del grupo de Coley (MIT) para modelos de message passing sobre grafos moleculares, donde cada atomo es un nodo y cada enlace quimico una arista, y la representacion se propaga por vecindades atomicas hasta producir un vector a nivel de molecula que alimenta una cabeza de prediccion. La variante concreta (por ejemplo, D-MPNN frente a arquitecturas mas recientes) no esta especificada en la informacion disponible.

Los detalles de entrenamiento no estan publicados: se desconoce el numero de moleculas utilizadas en el preentrenamiento, la composicion del dataset (por ejemplo, ChEMBL, PubChem o ZINC), si se emplearon objetivos de enmascaramiento atomico, prediccion de descriptores o aprendizaje contrastivo, y si hubo etapas de ajuste supervisado. La etiqueta "pretraining" sugiere una fase autosupervisada previa, pero no hay documentacion que lo confirme. Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Prediccion de propiedades moleculares a partir de la estructura quimica representada como grafo.
- Preentrenamiento orientado a servir como base para fine-tuning en tareas downstream de regresion y clasificacion.
- Integracion nativa con el ecosistema `chemprop`, incluyendo sus utilidades de entrenamiento, validacion y prediccion.
- Aplicable a tareas de quimica medicinal y quimica de materiales (propiedades fisicoquimicas, actividad biologica, toxicidad), segun la especializacion del checkpoint.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, no implementa agentes ni razonamiento multi-paso.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Filtrado virtual en descubrimiento de farmacos: usar el modelo para puntuar bibliotecas de compuestos y priorizar candidatos con propiedades predichas favorables antes de sintesis o ensayos, aprovechando el bajo coste computacional de una GNN frente a metodos de docking o simulacion.
- Prediccion de ADMET: estimar absorcion, distribucion, metabolismo, excrecion y toxicidad de moleculas candidatas para descartar tempranamente compuestos con perfiles desfavorables en pipelines preclinicos.
- Optimizacion de propiedades en quimica de materiales: predecir solubilidad, estabilidad termica o conductividad de moleculas y polímeros candidatos para reducir ciclos experimentales.
- Fine-tuning sobre datos propietarios: partir de los pesos preentrenados y ajustar con un dataset interno etiquetado (por ejemplo, resultados de ensayos de laboratorio) para construir un predictor especifico de la organizacion.
- Enriquecimiento de bases de datos quimicas: aplicar el modelo de forma masiva sobre catalogos de compuestos para anadir propiedades predichas y facilitar busquedas por criterios fisicoquimicos.
- Baseline en investigacion metodologica: emplear el checkpoint como referencia preentrenada al comparar nuevas arquitecturas de GNN o estrategias de representacion molecular.
- Integracion en pipelines de quimioinformatica: incorporar el modelo como etapa de puntuacion dentro de flujos automatizados basados en RDKit y `chemprop` para generacion y evaluacion de moleculas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,2 GB) es plausible que quepa en GPUs consumer, pero no hay confirmacion oficial.
- GPU recomendadas: no disponibles. Una GNN de este tamano probablemente se ejecute en GPUs de gama media (RTX 3060/4060 o superiores) o incluso en CPU para inferencia por lotes pequenos, si bien esto no esta documentado.
- Cabe en GPU consumer: probablemente si, dado el tamano del checkpoint, sin datos oficiales que lo confirmen.
- Opciones de despliegue: la via natural es la libreria `chemprop` (entrenamiento e inferencia); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chemeleon2 | GNN (`chemprop`) | no disponible | no aplica | MIT | Hugging Face, acceso restringido (gated) |
| Chemprop estandar (D-MPNN) | GNN | no disponible | no aplica | MIT | Codigo abierto en GitHub |
| Modelos quimicos generativos tipo MolFormer/MolT5 | Transformer quimico | variable segun variante | secuencias SMILES | variable | Hugging Face |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para Chemeleon2 ni datos de parametros que permitan una comparacion directa con alternativas.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: sin model card detallada, sin descripcion de datos de entrenamiento ni de la variante arquitectonica concreta.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a la evaluacion.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo de sobreajuste o sesgo de dominio: al desconocerse el dataset de preentrenamiento, no puede garantizarse el rendimiento fuera del espacio quimico cubierto.
- Riesgo de extrapolacion: las GNN moleculares pueden producir predicciones poco fiables en scaffolds o familias quimicas alejadas de la distribucion de entrenamiento.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar que los datos de preentrenamiento no impongan restricciones adicionales, algo que no puede confirmarse con la informacion disponible.
- No apto para tareas de lenguaje, vision, agentes o tool calling; su uso esta acotado a prediccion sobre grafos moleculares.
- Para produccion se recomienda validacion externa con un conjunto de test propio antes de confiar en las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akshatzalte/chemeleon2
- Libreria `chemprop` (repositorio oficial): https://github.com/chemprop/chemprop
