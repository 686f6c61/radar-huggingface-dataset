# Lee1413/MapGR

## Resumen

MapGR es un checkpoint de pesos para la construccion de mapas HD vectorizados en conduccion autonoma, publicado por el autor Lee1413 en HuggingFace. Se trata de la implementacion del metodo presentado en el articulo "Learning Global Representation from Queries for Vectorized HD Map Construction" (ICML 2026, arXiv:2510.06969), que combina la arquitectura MapQR con la innovacion MapGR. El modelo resuelve el problema de generar representaciones vectoriales de mapas de alta definicion (carriles, divisiones, bordes) a partir de imagenes de camaras de un vehiculo.

El checkpoint liberado corresponde a un entrenamiento de 24 epocas sobre el dataset nuScenes con backbone ResNet-50, entrenado en 8 GPUs con 4 muestras por GPU en precision fp16. Alcanza 44.87 mAP1 y 67.96 mAP2 en la particion de validacion de nuScenes, ligeramente por debajo de los resultados reportados en el paper (45.3 mAP1 y 68.1 mAP2), ya que no es exactamente la misma ejecucion.

Es relevante para investigadores y desarrolladores que trabajan en percepcion para conduccion autonoma, especialmente en el subcampo de construccion de mapas HD en linea (online HD map construction), donde los metodos basados en queries estan sustituyendo a los enfoques de segmentacion densa por su eficiencia y salida estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MapQR con modulo MapGR (transformer basado en queries sobre backbone ResNet-50) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa imagenes multi-camara de nuScenes) |
| Tipos de cuantizacion | no disponible (checkpoint en fp16 para entrenamiento; pesos en `.pth`) |
| Idiomas soportados | no aplica (modelo de vision para conduccion autonoma) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch `state_dict` con `meta` minima, sin estado del optimizador) |

## Arquitectura y entrenamiento

MapGR se construye sobre MapQR, un enfoque de construccion de mapas HD vectorizados basado en queries que opera sobre caracteristicas extraidas por un backbone ResNet-50 a partir de imagenes multi-camara de nuScenes. La innovacion MapGR ("Learning Global Representation from Queries") introduce un mecanismo para aprender una representacion global a partir de las queries, mejorando la capacidad del modelo para capturar la estructura global del mapa frente a enfoques puramente locales. El checkpoint corresponde al sub-proyecto `mapqr/` del repositorio de codigo.

El entrenamiento se realizo durante 24 epocas en nuScenes con 8 GPUs y 4 muestras por GPU en fp16, usando PyTorch 2.0.1. El autor indica que este checkpoint no es la ejecucion exacta del paper: fue entrenado con el codigo de investigacion del que se limpio el repositorio publico, con la misma configuracion liberada. Otras ejecuciones de 24 epocas con configuraciones cercanas (distintas semillas, pesos de perdida y numero de queries) alcanzaron entre 67.2 y 68.0 mAP2. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento mas alla de nuScenes ni si se emplearon tecnicas de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Construccion de mapas HD vectorizados a partir de imagenes multi-camara de nuScenes.
- Prediccion de elementos de mapa como divisores de carril (`div`), pasos de peatones (`ped`) y bordes (`bou`).
- Salida estructurada en forma de polilineas vectoriales con umbrales de evaluacion Chamfer AP.
- Evaluacion con umbrales multiples: mAP1 sobre {0.2, 0.5, 1.0} m y mAP2 sobre {0.5, 1.0, 1.5} m.
- Integracion con el ecosistema mmdetection3d para entrenamiento y evaluacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo thinking, vision general, audio ni otras capacidades fuera del dominio de mapas HD.

## Casos de uso

- Investigacion en construccion de mapas HD en linea: el checkpoint sirve como punto de partida reproducible para comparar variantes de MapQR/MapGR sobre nuScenes, usando el script `tools/test.py` del repositorio para validar resultados.
- Desarrollo de sistemas de percepcion para conduccion autonoma: el modelo genera polilineas de carriles y bordes que pueden alimentar modulos de planificacion de trayectorias y control del vehiculo en entornos urbanos tipo nuScenes.
- Fine-tuning sobre datasets propios: al liberarse bajo licencia MIT y en formato PyTorch, puede reentrenarse con datos de otras ciudades o sensores adaptando la configuracion `mapqr_mapgr_nusc_r50_24ep.py`.
- Benchmarking de nuevos metodos de mapas vectorizados: sirve como baseline con metricas publicadas (44.87 mAP1 / 67.96 mAP2) para comparar arquitecturas alternativas.
- Prototipado de pipelines de mapas para simulacion: las salidas vectorizadas pueden integrarse en simuladores de conduccion para generar mapas de entorno de forma automatica.
- Analisis de robustez y ablaciones: el autor publica los logs de entrenamiento (`20260329_014512.log`), lo que facilita reproducir curvas de aprendizaje y estudiar el efecto de hiperparametros como el numero de queries o los pesos de perdida.
- Docencia y formacion: por su tamano manejable (repo de 0.7 GB) y su integracion con mmdetection3d, es adecuado para cursos practicos sobre percepcion 3D y mapas HD.

## Benchmarks y rendimiento

Resultados en la particion de validacion de nuScenes (24 epocas, ResNet-50):

| Modelo / ejecucion | mAP1 | mAP2 | AP_div | AP_ped | AP_bou |
|---|---|---|---|---|---|
| Paper (MapQR + MapGR, 24 ep) | 45.3 | 68.1 | 69.8 | 65.8 | 68.8 |
| Checkpoint liberado | 44.87 | 67.96 | 69.35 | 64.95 | 69.57 |
| MapTRv2 + MapGR (ejecucion del paper, pesos no liberados) | no disponible | 64.98 | no disponible | no disponible | no disponible |

Notas: mAP2 promedia Chamfer AP sobre los umbrales {0.5, 1.0, 1.5} m; mAP1 sobre {0.2, 0.5, 1.0} m. En la tabla de logs del autor, MapTRv2 + MapGR alcanza 56.14 mAP2 en la epoca 12 y 64.98 en la epoca 24, frente a 59.90 y 67.96 del checkpoint MapQR + MapGR. No se han publicado en la informacion disponible resultados de benchmarks de otros modelos comparables (como MapTR, MapTRv2 o StreamMapNet) mas alla de la mencion anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con backbone ResNet-50 y entrada multi-camara de nuScenes, se estima un consumo moderado, aunque el dato no se confirma en la informacion proporcionada.
- GPU recomendadas: el autor entreno con 8 GPUs (modelo no especificado) a 4 muestras por GPU en fp16; para evaluacion, el script `dist_test_map.sh` acepta un numero de GPUs como argumento (el ejemplo usa 1).
- Cabe en GPU consumer: no confirmado en la informacion disponible; el tamano del repo (0.7 GB) sugiere que el checkpoint es manejable, pero no se especifica el requisito de VRAM.
- Opciones de despliegue: PyTorch con mmdetection3d (scripts `tools/test.py` y `tools/dist_test_map.sh` del repositorio `mapqr/`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | mAP2 (nuScenes val) | Licencia | Pesos liberados |
|---|---|---|---|---|
| MapQR + MapGR (este checkpoint) | ResNet-50 | 67.96 | MIT | Si |
| MapTRv2 + MapGR (paper) | ResNet-50 | 64.98 | no disponible | No |
| MapTR / MapTRv2 (referencia) | ResNet-50 | no disponible en la informacion | no disponible | no disponible |

La informacion proporcionada solo permite comparar con la ejecucion MapTRv2 + MapGR del propio paper, cuyos pesos no se han liberado. No se dispone de datos de otros modelos de mapas HD vectorizados (StreamMapNet, VectorMapNet, etc.) en el material consultado.

## Limitaciones y advertencias

- El checkpoint no es la ejecucion exacta del paper: los resultados son ligeramente inferiores (44.87 vs 45.3 mAP1; 67.96 vs 68.1 mAP2).
- Entrenado exclusivamente sobre nuScenes (Singapur y Boston); el rendimiento en otras ciudades, condiciones meteorologicas o sensores no esta validado.
- Depende del ecosistema mmdetection3d y de la configuracion exacta del repositorio; cambios en versiones de PyTorch (entrenado con 2.0.1) pueden afectar a la reproducibilidad.
- No es un modelo de lenguaje: no admite prompts, tool calling ni interaccion conversacional; los casos de uso fuera de mapas HD no aplican.
- Riesgo de alucinacion en el sentido de predicciones de elementos de mapa inexistentes o mal localizados, especialmente en zonas con oclusiones o baja visibilidad; no se documentan metricas de calibracion.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera de nuScenes.
- Licencia MIT permite uso comercial, pero el dataset nuScenes tiene sus propias condiciones de uso que deben respetarse al reentrenar o redistribuir derivados.
- El autor advierte que los logs publicados han sido anonimizados (nombres de usuario, host y rutas reemplazados), lo que puede dificultar la reproduccion exacta del entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lee1413/MapGR
- Paper (arXiv): https://arxiv.org/abs/2510.06969
- Pagina del proyecto: https://xr-lee.github.io/mapgr-demo/
- Repositorio de codigo: https://github.com/XR-Lee/MapGR
- Pesos: https://huggingface.co/Lee1413/MapGR/resolve/main/mapqr_mapgr_nusc_r50_24ep.pth
- Configuracion: https://huggingface.co/Lee1413/MapGR/resolve/main/mapqr_mapgr_nusc_r50_24ep_config.py
