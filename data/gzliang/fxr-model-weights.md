# gzLiang/fxr-model-weights

## Resumen

FXRPred model weights es un repositorio de pesos entrenados para la prediccion de actividad agonista y antagonista sobre el receptor nuclear FXR (farnesoid X receptor). Lo publica el usuario gzLiang en HuggingFace y no contiene un modelo de lenguaje, sino los state dictionaries de cinco folds de validacion cruzada para cada una de las dos tareas (`AGO` y `ANT`) de un modelo basado en redes neuronales de grafos, concretamente una variante FACA-GIN.

El repositorio esta pensado como artefacto de despliegue: un Space independiente (`gzLiang/fxr-model-service`) descarga estos ficheros y los carga mediante un loader propio. No es un repositorio de Transformers ni se puede consumir con `from_pretrained` de la libreria transformers, y el propio autor advierte que las comprobaciones de compatibilidad y operacion no constituyen validacion experimental prospectiva de la actividad FXR predicha.

Su relevancia es acotada pero concreta: proporciona pesos reproducibles y umbrales de decision documentados (`threshold_statistics.mean` en cada `cross_validation_summary.json`) para quien quiera replicar o desplegar un clasificador de actividad FXR sobre moleculas, un caso tipico de filtrado temprano en descubrimiento de farmacos. El repositorio es de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FACA-GIN (graph neural network, variante de GIN con atencion/features FACA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos moleculares, no sobre texto) |
| Tipos de cuantizacion | no disponible (se distribuyen state dictionaries en precision original) |
| Idiomas soportados | no aplica |
| Licencia | no disponible (la model card indica explicitamente que no asigna una nueva licencia a los pesos) |
| Formato de pesos | state dictionaries de PyTorch (`.pt`/`.pth`), cinco folds por tarea |

## Arquitectura y entrenamiento

El modelo es una red neuronal de grafos de tipo FACA-GIN, es decir, una GIN (Graph Isomorphism Network) enriquecida con el esquema de features FACA, aplicada a la prediccion de propiedades moleculares. La entrada es un grafo molecular y la salida, una puntuacion de actividad frente a FXR en cada una de las dos tareas binarias: agonismo (`AGO`) y antagonismo (`ANT`).

El entrenamiento se organiza en validacion cruzada de cinco folds por tarea; el repositorio incluye los cinco state dictionaries de cada fold junto con el `cross_validation_summary.json` original, que contiene las estadisticas del umbral de decision recomendado (`threshold_statistics.mean`). El autor indica que durante la preparacion del despliegue no se reentrena, convierte ni modifica ningun peso. No se detallan en la informacion disponible el numero de compuestos de entrenamiento, la composicion del dataset, el regimen de aumentacion ni si hubo ajuste fino posterior. Se menciona que en fases posteriores de validacion podrian anadirse recursos de Ortho-MoE y Uni-Mol.

## Capacidades

- Prediccion de actividad agonista sobre FXR (`AGO`) a partir de la estructura molecular.
- Prediccion de actividad antagonista sobre FXR (`ANT`) a partir de la estructura molecular.
- Clasificacion binaria con umbral de decision calibrado por fold (`threshold_statistics.mean`).
- Ensemble implicito sobre cinco folds de validacion cruzada por tarea.
- Procesamiento de moleculas representadas como grafos, no de texto ni de imagenes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Filtrado virtual temprano en descubrimiento de farmacos: puntuar una libreria de compuestos con `AGO` y `ANT` para priorizar candidatos con perfil FXR deseado antes de sintesis o ensayo.
- Analisis de selectividad agonista/antagonista: ejecutar ambas cabeceras sobre la misma molecula y usar la diferencia de puntuaciones para descartar compuestos con perfil inverso al buscado.
- Replicacion de resultados publicados: los cinco folds y el resumen de validacion cruzada permiten reproducir exactamente las metricas del autor sin reentrenar.
- Despliegue como servicio interno de scoring: el Space `gzLiang/fxr-model-service` actua como referencia de integracion mediante un loader propio sobre estos pesos.
- Priorizacion en cribado de bibliotecas quimicas: aplicar el umbral recomendado para convertir puntuaciones continuas en decisiones binarias auditables.
- Validacion de pipelines de quimioinformatica: usar el repositorio como caso de prueba para verificar que un pipeline de grafos moleculares carga correctamente pesos PyTorch y aplica umbrales por fold.
- Analisis de mecanismo de accion en FXR: comparar predicciones `AGO` y `ANT` sobre analogos estructurales para generar hipotesis sobre modulacion del receptor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye ficheros `cross_validation_summary.json` por tarea con estadisticas de validacion cruzada, pero sus valores numericos no se recogen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de una GNN sobre grafos moleculares, el consumo depende del tamano del lote de moleculas y del numero de nodos por grafo, no de una ventana de contexto.
- GPU recomendadas: no disponible. Por la naturaleza del modelo, una GPU consumer moderna es probablemente suficiente, pero no hay datos publicados que lo confirmen.
- Cabe en GPU consumer: no confirmado en la informacion disponible.
- Opciones de despliegue: loader propio en el Space `gzLiang/fxr-model-service`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FXRPred (gzLiang/fxr-model-weights) | FACA-GIN | Agonismo/antagonismo FXR | no disponible | no aplica | no disponible | HuggingFace, 0 descargas |
| Uni-Mol | Transformer 3D | Propiedades moleculares generales | no disponible en esta ficha | no aplica | no disponible | mencionado por el autor como posible adicion futura |
| Ortho-MoE | MoE (quimica) | Propiedades moleculares | no disponible en esta ficha | no aplica | no disponible | mencionado por el autor como posible adicion futura |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte explicitamente que las comprobaciones de compatibilidad y operacion no constituyen validacion experimental prospectiva de la actividad FXR predicha.
- No es un modelo de Transformers: requiere un loader a medida; `AutoModel.from_pretrained` no funciona.
- La licencia no esta definida; la model card indica que no se asigna una nueva licencia a los pesos, por lo que el uso comercial queda sin marco claro y requiere contactar con el autor.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia externa de uso o validacion independiente.
- Solo cubre dos tareas binarias sobre FXR; no predice ADMET, toxicidad ni otras propiedades.
- Riesgo de falsos positivos y negativos en compuestos fuera de la distribucion quimica del conjunto de entrenamiento, cuya composicion no se detalla.
- Los umbrales de decision son especificos por fold; aplicar un umbral distinto al recomendado invalida la calibracion reportada.
- No hay informacion sobre sesgos de representacion quimica ni sobre el dominio aplicable del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gzLiang/fxr-model-weights
- Space de despliegue: https://huggingface.co/spaces/gzLiang/fxr-model-service
- Perfil del autor: https://huggingface.co/gzLiang
