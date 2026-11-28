# CaiYuanhao/SAX-NeRF

## Resumen

SAX-NeRF (Structure-Aware Sparse-View X-ray 3D Reconstruction) es un modelo de reconstruccion tomografica y sintesis de vistas noveles para imagen de rayos X, presentado en CVPR 2024. No es un modelo de lenguaje: se trata de una representacion neuronal de campos de radiodensidad que, a partir de un conjunto reducido de proyecciones de rayos X en vistas dispersas (sparse-view), reconstruye un volumen tridimensional y permite renderizar nuevas proyecciones y cortes CT desde cualquier direccion de vision. Lo desarrolla Cai Yuanhao y se distribuye bajo licencia Apache 2.0 con pesos en formato PyTorch.

El modelo aborda un problema clasico de la tomografia computarizada: la reconstruccion a partir de pocas proyecciones, donde los metodos tradicionales como FDK o SART producen artefactos severos. SAX-NeRF introduce el modulo Lineformer, que modela las lineas de rayos X como secuencias y explota la estructura geometrica de la escena para regularizar la reconstruccion. El repositorio incluye 15 escenas preentrenadas que cubren desde especimenes anatomicos (torax, craneo, pelvis, pierna, pancreas) hasta objetos no medicos (bonsai, carpa, mochila, caja).

El interes actual reside en su aplicacion a imagen medica de baja dosis y a inspeccion no destructiva: reducir el numero de proyecciones necesarias disminuye la radiacion administrada al paciente y el tiempo de adquisicion. El modelo ocupa 2,6 GB en el repositorio y se ofrece con una demo interactiva en Gradio para explorar las reconstrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neural radiodensity field con modulo Lineformer (representacion neuronal implicita para rayos X) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoints, libreria pytorch) |

## Arquitectura y entrenamiento

SAX-NeRF se basa en una representacion neuronal implicita de campos de radiodensidad, en la linea de NeRF pero adaptada a la fisica de atenuacion de rayos X en lugar de la emision de luz visible. El componente central es Lineformer, un modulo que procesa las lineas de proyeccion como secuencias para capturar dependencias globales a lo largo del rayo, lo que permite regularizar la reconstruccion cuando el numero de vistas es muy reducido. La representacion resultante es un volumen continuo de densidad que puede consultarse en cualquier punto del espacio tridimensional.

El entrenamiento se realiza por escena: el modelo se optimiza sobre las proyecciones de rayos X disponibles de cada especimen, y los 15 checkpoints publicados corresponden a otras tantas escenas (torax, craneo, pelvis, pierna, pie, mandibula, pancreas, aneurisma, ademas de objetos como bonsai, carpa, mochila y caja). El repositorio no detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO, que por otra parte no aplican a este tipo de modelo. La innovacion tecnica destacable es el uso de la estructura geometrica de la escena como senal de regularizacion durante la optimizacion.

## Capacidades

- Reconstruccion tomografica 3D a partir de vistas dispersas de rayos X (sparse-view CT).
- Sintesis de vistas noveles: renderizado de proyecciones de rayos X desde direcciones de vision no observadas durante el entrenamiento.
- Generacion de cortes CT navegables mediante un plano de corte transparente en la demo interactiva.
- Representacion de densidad volumetrica continua consultable en cualquier coordenada del espacio.
- Modelado de escenas anatomicas y de objetos no medicos (15 escenas preentrenadas).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No dispone de capacidades multilingues ni de modo thinking.
- No procesa texto, audio ni vision 2D convencional; su entrada son proyecciones radiograficas y su salida es un campo de densidad 3D.

## Casos de uso

- Reconstruccion CT de baja dosis en imagen medica: el modelo permite reconstruir volumenes anatomicos a partir de un numero reducido de proyecciones, lo que se traduciria en menor radiacion para el paciente y menor tiempo de adquisicion en el escaner.
- Inspeccion no destructiva industrial: reconstruir la geometria interna de piezas (cajas, mochilas, componentes) a partir de pocas radiografias, reduciendo el coste y el tiempo frente a una tomografia completa.
- Planificacion quirurgica: generar vistas CT navegables de estructuras oseas (craneo, pelvis, mandibula, pierna) para estudiar la anatomia antes de una intervencion.
- Docencia y visualizacion anatomica: la demo Gradio permite rotar la malla CT reconstruida y desplazar el plano de corte para explorar la anatomia de forma interactiva.
- Investigacion en reconstruccion dispersa: servir como baseline reproducible (CVPR 2024, codigo y pesos publicos) para comparar nuevos metodos de sparse-view CT.
- Arqueologia y conservacion patrimonial: reconstruir objetos delicados (bonsai, especimenes) sin manipularlos, empleando radiografias de baja exposicion.
- Prototipado de pipelines de vision 3D: integrar los checkpoints PyTorch en flujos de renderizado neuronal para experimentar con sintesis de vistas en el dominio de rayos X.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el paper de CVPR 2024 (arXiv:2311.10959) como fuente de las metricas, pero no incluye cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio pesa 2,6 GB, lo que da una orientacion del orden de magnitud de los checkpoints, pero no de la memoria necesaria en ejecucion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; los modelos de campos neuronales implicitos suelen requerir GPU dedicada para renderizado interactivo.
- Opciones de despliegue: PyTorch como libreria principal; la demo interactiva se ejecuta con Gradio, tanto en el Space de Hugging Face como en local segun el repositorio GitHub.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAX-NeRF | Reconstruccion CT sparse-view | Neural radiodensity field + Lineformer | Apache 2.0 | Pesos y codigo publicos |
| NeRF clasico | Sintesis de vistas noveles | Campos implicitos para luz visible | MIT (implementacion original) | Codigo publico |
| Metodos FDK / SART | Reconstruccion CT tradicional | Retroproyeccion analitica / iterativa | Variable | Implementaciones multiples |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. SAX-NeRF se distingue por adaptar el paradigma NeRF al dominio de rayos X y por el modulo Lineformer especifico para vistas dispersas.

## Limitaciones y advertencias

- Modelo por escena: cada checkpoint esta entrenado para un especimen concreto; no generaliza a escenas nuevas sin reoptimizacion.
- No es un modelo de lenguaje ni un asistente conversacional; no debe evaluarse con criterios de LLM.
- Riesgo de artefactos en la reconstruccion cuando el numero de vistas es extremadamente bajo; la calidad depende de la geometria de adquisicion.
- Uso medico: no se documenta validacion clinica ni certificacion regulatoria; cualquier aplicacion diagnostica requeriria validacion independiente.
- Sesgos: no documentados en la informacion disponible; al entrenarse por escena, el sesgo esta ligado a los especimenes concretos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre idoneidad clinica o industrial.
- El repositorio no detalla requisitos de hardware ni tiempos de optimizacion, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaiYuanhao/SAX-NeRF
- Dataset: https://huggingface.co/datasets/CaiYuanhao/SAX-NeRF
- Demo interactiva: https://huggingface.co/spaces/CaiYuanhao/SAX-NeRF
- Paper (arXiv): https://arxiv.org/abs/2311.10959
- Pagina del proyecto: https://caiyuanhao1998.github.io/project/SAX-NeRF/
- Codigo en GitHub: https://github.com/caiyuanhao1998/SAX-NeRF
- Video: https://www.youtube.com/watch?v=oVVUaBY61eo
- Interpretacion en chino (Zhihu): https://zhuanlan.zhihu.com/p/702702109
