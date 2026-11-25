# birdy666/Invaria

## Resumen

Invaria es un codificador de nubes de puntos 3D disenado para mantener su robustez cuando cambia la resolucion de muestreo o la escala de la escena. Lo desarrolla un equipo academico (Chun-Peng Chang, Shaoxiang Wang, Alain Pagani, Dariu Gavrila y Holger Caesar) y se presenta en NeurIPS 2026. El repositorio de Hugging Face aloja unicamente los checkpoints de segmentacion semantica, no el codigo de entrenamiento ni el pipeline completo.

El modelo aborda un problema clasico en vision 3D: los codificadores de nubes de puntos suelen degradarse cuando la densidad de puntos varia (por ejemplo, entre un LiDAR de larga distancia y un sensor de corto alcance) o cuando la escena se reescala. Invaria propone aprender esa invariancia mediante una tarea de "prediccion de siguiente resolucion" (next-resolution prediction), una formulacion auto-supervisada que fuerza al codificador a representar la geometria de forma consistente entre niveles de detalle.

La relevancia actual reside en que la segmentacion semantica 3D es una pieza critica en conduccion autonoma (nuScenes) y en reconstruccion de interiores (ScanNet), donde la heterogeneidad de sensores y densidades es la norma. El repo ocupa 1,2 GB y se distribuye bajo licencia MIT, con checkpoints especificos para ScanNet y nuScenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de nubes de puntos 3D con aprendizaje de invariancia a escala y densidad (detalle interno no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a nubes de puntos en el sentido de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

La informacion disponible indica que Invaria es un codificador de nubes de puntos 3D entrenado con una tarea de next-resolution prediction, cuyo objetivo es que las representaciones sean invariantes a la escala de la escena y a la densidad de muestreo. El paper esta publicado en NeurIPS 2026 (arXiv:2605.15923), pero la model card no detalla el numero de capas, el tipo de backbone (PointNet-like, transformer sobre puntos, sparse conv, etc.), el volumen de tokens de entrenamiento ni la composicion exacta del dataset.

Se publican dos checkpoints de segmentacion semantica, uno entrenado sobre ScanNet y otro sobre nuScenes, con configuraciones especificas en el repositorio de codigo (`configs/invaria/semseg-invaria-single-stage-scannet.py` y `...-nuscenes.py`). No se especifica en la informacion proporcionada si hubo RLHF, DPO ni otras fases de alineacion (no aplicables en este dominio). Tampoco se detalla si el entrenamiento combina datos sinteticos con reales ni el esquema de augmentacion de densidad.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D en interiores (ScanNet).
- Segmentacion semantica de nubes de puntos 3D en escenas de conduccion (nuScenes).
- Robustez frente a cambios de densidad de muestreo (puntos por metro cuadrado).
- Robustez frente a cambios de escala de la escena.
- Extraccion de caracteristicas geometricas reutilizables como codificador previo a cabezas de tarea.
- No soporta tool calling, agentes, texto, vision 2D, audio ni modos de razonamiento: es un modelo puramente geometrico 3D.
- Capacidades multilingues: no aplica.

## Casos de uso

- Segmentacion de escenas de interior para robotica movil: el checkpoint de ScanNet permite etiquetar suelo, paredes, muebles y objetos en nubes de puntos capturadas por RGB-D o LiDAR de corto alcance, con la ventaja de que la precision no cae cuando el robot se aleja o se acerca a las superficies.
- Percepcion en conduccion autonoma: el checkpoint de nuScenes segmenta clases como coche, peaton, carretera o vegetacion en nubes LiDAR, y la invariancia a densidad ayuda cuando los puntos lejanos son escasos.
- Fusion de sensores heterogeneos: al ser robusto a densidad, puede usarse como codificador comun para nubes provenientes de LiDAR de 32, 64 o 128 haces sin reentrenar por sensor.
- Anotacion semiautomatica de datasets 3D: preetiquetar nubes de puntos para revision humana, reduciendo coste en pipelines de etiquetado de datos de interior o de trafico.
- Digitalizacion de edificios e inspeccion: segmentacion de elementos estructurales en escaneos a distintas resoluciones (escaneo denso de obra frente a escaneo rapido de reconocimiento).
- Investigacion en representaciones 3D: uso del codificador como backbone congelado para experimentos de transferencia a deteccion 3D, completado de nubes o estimacion de flujo.
- Navegacion de drones y AGVs en entornos cambiantes: la invariancia a escala facilita reutilizar el modelo entre mapas a distintas alturas y densidades de captura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv:2605.15923) para las metricas, pero no incluye tablas de mIoU ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 1,2 GB, lo que sugiere que los pesos caben holgadamente en GPUs consumer, pero no se confirma el consumo real en ejecucion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU consumer: probable por el tamano del checkpoint, pero no confirmado.
- Opciones de despliegue: el codigo oficial se ejecuta con `tools/test.py` del repositorio GitHub (framework tipo MMDetection3D, segun la interfaz de configuracion). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros codificadores de nubes de puntos (por ejemplo, PointNet++, MinkowskiNet, SPVCNN o PTv3) ni datos que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Solo se publican checkpoints de segmentacion semantica; no hay pesos de backbone preentrenado generico ni modelo base aislado.
- El repositorio no incluye el codigo de entrenamiento; hay que clonar el repo de GitHub y preparar los datasets (ScanNet, nuScenes) por separado.
- No hay informacion sobre sesgos del dataset: ScanNet y nuScenes tienen sesgos conocidos de geografia (interiores europeos/americanos, conduccion en entornos concretos) que se heredan.
- Riesgo de alucinacion en el sentido de segmentaciones erroneas en clases raras o puntos muy dispersos; no cuantificado en la informacion disponible.
- La invariancia a densidad y escala es el objetivo declarado del paper, pero no se aportan numeros que la cuantifiquen en la model card.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las licencias de los datasets de entrenamiento (ScanNet y nuScenes tienen terminos propios que pueden afectar a la redistribucion de derivados).
- Sin garantias de mantenimiento: 0 descargas y 2 likes en el momento de la consulta; el proyecto depende del repo de GitHub del autor.
- No apto para tareas de texto, vision 2D, audio ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/birdy666/Invaria
- Paper (arXiv): https://arxiv.org/abs/2605.15923
- Project page: https://birdy666.github.io/projects/invaria/
- Codigo: https://github.com/birdy666/Invaria
