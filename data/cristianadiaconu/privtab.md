# CristianaDiaconu/PrivTab

## Resumen

PrivTab es un clasificador para datos tabulares desarrollado por CristianaDiaconu (TrustworthyMLHelsinki) que resuelve un problema concreto: permitir que un propietario de datos sensibles publique un modelo utilizable sin exponer el conjunto de datos original. El modelo comprime un contexto etiquetado (pares `x`, `y`) en un resumen ruidoso con garantia de privacidad diferencial gaussiana, de forma que las predicciones posteriores solo necesitan ese resumen y nunca vuelven a tocar los datos privados.

La arquitectura se articula en dos fases separadas: una fase de release, que pasa el contexto por tres capas de atencion privadas y dos capas de post-procesado para producir un resumen de forma `[B, 5, 128, 256]` (640 KiB por tarea en float32), y una fase de prediccion, que es post-procesado puro y por tanto no consume presupuesto de privacidad adicional. Esta separacion permite liberar el resumen una sola vez y reutilizarlo indefinidamente en cualquier maquina y por cualquier tercero.

El repositorio de Hugging Face aloja tres checkpoints (stage1, stage2 de contextos cortos y stage2 de contextos largos) en formato `weights.pt`. El modelo esta pensado para clasificacion tabular de pequeno y mediano tamano con caracteristicas exclusivamente numericas, entre 1 y 120 features y entre 2 y 10 clases. Es relevante ahora porque ofrece una garantia formal de privacidad con un flujo de despliegue operativo (export y predict por linea de comandos), algo poco habitual en herramientas de privacidad diferencial aplicada a tablas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tres capas de atencion privadas (tanh-bounded attention, valores unit-normalizados) y dos capas de post-procesado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 100-2048 filas de contexto (checkpoints cortos); 1024-8192 filas (checkpoint largo); ruteo por tamano en 4096 filas |
| Tipos de cuantizacion | no disponible (pesos en float32; el resumen ocupa 640 KiB por tarea) |
| Idiomas soportados | no aplica (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `weights.pt` (solo tensores, sin estado del optimizador); resumen exportable en `.pt` |

## Arquitectura y entrenamiento

PrivTab es un transformer especializado en aprendizaje en contexto sobre datos tabulares. La fase de release aplica tres capas de atencion privadas con atencion acotada por tanh y valores normalizados a norma unitaria, a las que se anade ruido gaussiano con desviacion tipica calibrada para satisfacer privacidad diferencial gaussiana bajo adyacencia de reemplazo de una fila. Tras ellas, dos capas de post-procesado generan el resumen ruidoso. La fase de prediccion hace que las filas de consulta atiendan a ese resumen para producir probabilidades de clase.

El entrenamiento se organiza en tres checkpoints: `stage1` como base con contextos de 100 a 2048 filas, `stage2_short_contexts` como continuacion para el mismo rango, y `stage2_long_contexts` como continuacion para contextos de 1024 a 8192 filas. El codigo de evaluacion rutea automaticamente al checkpoint corto por debajo de 4096 filas de contexto y al largo a partir de 4096. La normalizacion de salida se activa en despliegue para todos los checkpoints. El modelo se entrena con preentrenamiento sintetico y dispone de un generador de tareas sinteticas en el repositorio de GitHub, junto con baselines DP-SGD, benchmarks, auditorias y pruebas formales en Lean. No se especifica en la informacion disponible el numero total de tokens ni la composicion exacta del dataset de entrenamiento.

Una innovacion destacable es la separacion estricta entre release y prediccion: el resumen se crea con aleatoriedad respaldada por el CSPRNG del sistema operativo (`ReleasedSummary.create`, `model.release_summary`, `deployment.export`), mientras que los metodos de bajo nivel `model.summarize(...)` y `model.forward(...)` usan aleatoriedad de PyTorch y quedan restringidos a preentrenamiento sintetico y evaluacion publica. El bundle exportado contiene el resumen ruidoso, los pesos del predictor y los conteos publicos de features y clases, pero no filas de contexto, etiquetas, estadisticas de preprocesado privadas, estado del optimizador ni semillas de ruido.

## Capacidades

- Clasificacion tabular supervisada sobre caracteristicas exclusivamente numericas, con 1 a 120 features y valores finitos.
- Clasificacion multiclase de 2 a 10 clases, codificadas como enteros `0, ..., C-1` con conteo de clases publico.
- Aprendizaje en contexto: las predicciones se derivan de un resumen liberado previamente, sin reentrenamiento.
- Liberacion con privacidad diferencial gaussiana bajo adyacencia de reemplazo de una fila, con presupuesto `mu` configurable (por ejemplo, 0.4 en los ejemplos de la model card).
- Prediccion en post-procesado sin coste adicional de privacidad, repetible con cualquier numero de lotes de consulta.
- Exportacion y prediccion desacopladas por linea de comandos (`deployment.export`, `deployment.predict`) para ejecutar en maquinas distintas.
- Procesamiento por lotes en prediccion (`--batch-size`, por ejemplo 1024).
- No soporta texto, vision, audio, tool calling ni razonamiento multi-paso: es un modelo tabular puro.

## Casos de uso

- Publicacion de un modelo de riesgo crediticio: el propietario entrena el resumen con su cartera etiquetada y lo libera con un `mu` acotado; un equipo externo aplica `predict_proba` sobre solicitudes nuevas sin recibir nunca los datos originales ni las etiquetas.
- Deteccion de fraude en colaboracion entre entidades: cada entidad libera un resumen de su propio historial etiquetado y un tercero evalua transacciones contra varios resumenes, manteniendo la garantia de privacidad por conjunto de datos.
- Triaje clinico con datos de pacientes: el hospital genera un resumen DP de variables numericas (analiticas, constantes vitales) y lo comparte con un proveedor de software que ejecuta la prediccion en su infraestructura.
- Scoring de clientes en marketing: un anunciante libera un resumen de conversion y un socio lo aplica a su base de prospectos con el mismo esquema de preprocesado publico, sin intercambio de listas nominativas.
- Evaluacion reproducible de modelos privados: el bundle exportado (resumen, pesos del predictor y conteos publicos) permite a auditores reproducir predicciones y verificar el flujo sin acceso a datos sensibles.
- Despliegue en entornos con restricciones de residencia de datos: el release se ejecuta en la maquina del data owner y la prediccion en otra jurisdiccion, ya que el resumen de 640 KiB es el unico artefacto que cruza la frontera.
- Prototipado rapido con datos publicos: el ejemplo `examples/digits_playground.py` sobre el dataset digits de scikit-learn sirve para validar el pipeline completo antes de aplicarlo a datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de benchmarks, auditorias y pruebas en Lean en el repositorio de GitHub, asi como baselines DP-SGD, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de metricas de clasificacion tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision al no publicarse el numero de parametros; el repositorio completo ocupa 0,1 GB, lo que sugiere un modelo pequeno desplegable en GPU de gama baja o incluso en CPU.
- El resumen liberado ocupa 640 KiB por tarea en float32, por lo que el almacenamiento del artefacto es trivial.
- GPU recomendadas: no disponible; por el tamano del repositorio, cualquier GPU consumer reciente (RTX 3060 o superior) deberia ser suficiente, aunque no se confirma en la documentacion.
- Cabe en GPU consumer: muy probablemente si, dado el tamano del checkpoint; no confirmado explicitamente.
- Opciones de despliegue: PyTorch 2.6+ y NumPy para inferencia; exportacion y prediccion por linea de comandos con `python -m deployment.export` y `python -m deployment.predict`; requiere Python 3.11+.
- Latencia y throughput estimados: no disponibles. La prediccion admite procesamiento por lotes (`--batch-size 1024`).

## Comparativa con modelos similares

| Modelo | Enfoque | Contexto | Privacidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PrivTab | Transformer con resumen DP liberable | 100-8192 filas de contexto | DP gaussiana, adyacencia de reemplazo de fila | MIT | Hugging Face + GitHub |
| DP-SGD sobre red tabular | Entrenamiento con gradiente ruidoso | No aplica | DP durante el entrenamiento | Depende de la implementacion | Baseline incluido en el repo de PrivTab |
| TabPFN (referencia de ICL tabular) | Prior-data fitted network | Contexto acotado | Sin garantia DP | No disponible en esta ficha | No disponible en esta ficha |

La comparacion se limita a los elementos citados en la informacion proporcionada; no se dispone de datos de rendimiento comparado entre PrivTab y alternativas.

## Limitaciones y advertencias

- Solo admite caracteristicas numericas con valores finitos; no soporta variables categoricas sin codificacion previa.
- Requiere el mismo orden de columnas y el mismo preprocesado publico (o privatizado por separado) para contexto y consultas.
- La garantia de privacidad no cubre el preprocesado ajustado sobre datos privados; si las estadisticas de normalizacion se calculan con datos sensibles, deben privatizarse aparte.
- Publicar metricas calculadas con etiquetas privadas de consulta constituye una liberacion adicional que debe contabilizarse en el presupuesto de privacidad.
- Los metodos `model.summarize(...)` y `model.forward(...)` no deben usarse para liberar salidas derivadas de contexto privado: emplean aleatoriedad de PyTorch y estan pensados solo para preentrenamiento sintetico y evaluacion publica.
- El bundle exportado no debe sobrescribirse accidentalmente: la herramienta de export rechaza sobreescribir un bundle existente para evitar re-liberaciones.
- No se han publicado cifras de rendimiento ni comparativas cuantitativas con alternativas en la informacion disponible.
- El DOI de Zenodo del release archivado figura como pendiente en la model card.
- El modelo no procesa lenguaje natural ni otros dominios (vision, audio), por lo que no es adecuado para tareas generativas.
- Licencia MIT: permite uso comercial, pero conviene revisar las obligaciones de atribucion y la ausencia de garantias propias de esta licencia.

## Enlaces

- Hugging Face: https://huggingface.co/CristianaDiaconu/PrivTab
- Codigo en GitHub: https://github.com/TrustworthyMLHelsinki/PrivTab
- Paper (arXiv): https://arxiv.org/abs/2610.10068
- Guia de arquitectura: https://github.com/TrustworthyMLHelsinki/PrivTab/blob/main/docs/architecture.md
- Ejemplo ejecutable (digits): `examples/digits_playground.py` en el repositorio de GitHub
- Release archivado (DOI): pendiente de publicacion segun la model card
