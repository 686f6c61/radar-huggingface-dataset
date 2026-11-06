# LiangGroup/MCGNN_Coding

## Resumen

MCGNN_Coding es un repositorio de pesos publicado por el grupo LiangGroup en Hugging Face que contiene checkpoints de un modelo de aprendizaje profundo orientado a la predicción de propiedades químicas y a la transferencia entre metales (iridio y cobalto) en el contexto de catálisis computacional. El nombre sugiere una arquitectura de red neuronal sobre grafos (GNN) multicanal o multicapa, aunque la model card no lo explicita. El paquete incluye dos checkpoints: un modelo preentrenado de iridio (`Ir checkpoints.pth`) y un modelo de transferencia de cobalto (`Co transfer checkpoints.pth`) inicializado a partir del anterior.

El modelo no es un LLM ni un modelo de lenguaje: no hay información sobre arquitectura transformer, parámetros, contexto, tokenizador ni idiomas. Se distribuye como ficheros `.pth` (PyTorch) gestionados con Git LFS, con un tamaño de repositorio de 0,1 GB. La única documentación disponible es la model card, que describe el uso mediante un script `scripts/predict.py` y menciona una arquitectura de "tres grafos" con una cabeza latente H/S.

La relevancia actual es limitada fuera del ámbito especializado: se trata de un artefacto de investigación en química computacional, sin métricas publicadas, sin licencia declarada y con cero descargas. Es útil para quien quiera reproducir predicciones sobre los conjuntos de test fijos que acompañan al repositorio (251 registros para Ir, 14 para Co) usando descriptores xTB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal sobre grafos de tres grafos con cabeza latente H/S (según model card); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos PyTorch `.pth`, no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch), gestionados con Git LFS |

## Arquitectura y entrenamiento

La model card indica que ambos checkpoints comparten "the same three-graph architecture and latent H/S head". No se especifica si los grafos corresponden a representaciones moleculares, de superficie del catalizador o de descriptores electrónicos, ni se detalla el tipo de capas (GNN, MPNN, GAT, etc.). Tampoco se documenta el número de parámetros, la función de pérdida, el optimizador ni el número de épocas.

Respecto al entrenamiento, solo se sabe que el modelo de Ir se seleccionó sobre el fold 5 de validación cruzada y se evaluó sobre un conjunto de test fijo de 251 registros, y que el modelo de Co se inicializó a partir del de Ir y se seleccionó en el fold 1, etapa 2, con un conjunto de test fijo de 14 registros. No hay información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre el uso de RLHF/DPO (no aplica). La innovación técnica destacable es el esquema de transferencia desde Ir hacia Co, que sugiere aprendizaje por transferencia entre metales. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Predicción de propiedades químicas o de rendimiento catalítico a partir de descriptores xTB y estructuras de entrada, según el flujo de `scripts/predict.py`.
- Inferencia sobre CPU: los comandos de ejemplo incluyen el flag `--cpu`.
- Transferencia entre metales: el checkpoint de Co se inicializa desde el de Ir y requiere seleccionar el directorio xTB y el catalizador correspondiente (`--default_catalyst Co`).
- Selección de checkpoint por elemento y fold: el usuario debe emparejar el modelo con el directorio xTB y el catalizador adecuados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Reproducción de resultados de investigación: ejecutar `scripts/predict.py` con `Ir checkpoints.pth` sobre `data/ir_holdout/Database Ir Test.csv` para regenerar las predicciones del conjunto de test fijo de 251 registros y compararlas con las publicadas por los autores.
- Evaluación del modelo de transferencia Co: usar `Co transfer checkpoints.pth` con `config/co_reference/test.csv` y `data/xtb_Co_features` para obtener predicciones sobre los 14 registros de test de cobalto, útil para validar el esquema de transferencia Ir→Co.
- Cribado virtual de catalizadores de iridio: aplicar el checkpoint de Ir a nuevos conjuntos de candidatos con descriptores xTB precalculados para priorizar experimentos, siempre que el dominio de aplicación coincida con el de entrenamiento.
- Extensión del esquema de transferencia: servir como punto de partida para inicializar modelos de otros metales a partir del checkpoint de Ir, replicando la estrategia de transferencia documentada para Co.
- Integración en pipelines de química computacional: invocar `predict.py` desde flujos automatizados que generen descriptores xTB y consuman los CSV de salida (`outputs/ir_predictions.csv`, `outputs/co_predictions.csv`).
- Docencia y formación en ML aplicado a catálisis: usar los checkpoints y los conjuntos de test fijos como ejemplo reproducible de entrenamiento con validación cruzada y transferencia entre dominios.
- Inferencia en entornos sin GPU: al soportar `--cpu`, puede ejecutarse en estaciones de trabajo convencionales para predicciones puntuales sobre lotes pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona los tamaños de los conjuntos de test (251 registros para Ir, 14 para Co) y los folds seleccionados (fold 5 y fold 1, etapa 2), sin reportar métricas como MAE, RMSE, R² ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponibles; la model card solo documenta ejecución en CPU mediante `--cpu`.
- Compatibilidad con GPU de consumo: probable dada la ausencia de requisitos de VRAM documentados y el tamaño del repositorio, pero no confirmado por el autor.
- Opciones de despliegue: script propio `scripts/predict.py` con PyTorch; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Requisito operativo: clonar con Git LFS y ejecutar `git lfs pull` para descargar los pesos `.pth`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a otros modelos de predicción catalítica con GNN ni métricas que permitan una comparación rigurosa. Tampoco se identifican alternativas comparables dentro del propio repositorio o de la model card.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni atribución; debe contactarse con el autor antes de cualquier uso en producción.
- Ausencia total de métricas: no hay benchmarks ni errores reportados, por lo que no es posible evaluar la calidad predictiva sin ejecutar el modelo.
- Conjuntos de test muy pequeños: el test de Co tiene solo 14 registros, lo que hace que cualquier estimación de rendimiento sea estadísticamente frágil.
- Dominio restringido: el modelo está entrenado para Ir y Co en el contexto de los descriptores xTB y catalizadores documentados; extrapolar a otros metales, reacciones o niveles de teoría puede producir predicciones no fiables.
- Dependencia de descriptores xTB: la predicción requiere directorios xTB precalculados (`data/xtb_Co_features`, etc.) y la selección correcta del catalizador; un emparejamiento incorrecto invalida la salida.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de predicciones espurias fuera del dominio de entrenamiento.
- Sesgos: no documentados; no se describe la composición del dataset ni posibles desequilibrios entre metales, ligandos o condiciones de reacción.
- Idioma y contexto: no aplica; el modelo no procesa texto.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-06): conviene verificar la integridad y procedencia de los artefactos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/LiangGroup/MCGNN_Coding
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
