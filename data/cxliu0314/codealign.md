# cxliu0314/CodeAlign

## Resumen

CodeAlign-OPV2V-m1m7-FCF-v1 es un checkpoint de inferencia publicado por Changxing Liu (cxliu0314) asociado al articulo "CodeAlign: Linking Modality Isolation in Heterogeneous Collaborative Perception", aceptado en CVPR 2026. No es un modelo de lenguaje: es un modelo de percepcion colaborativa para deteccion 3D de objetos en entornos de conduccion autonoma, donde varios agentes (vehiculos conectados) comparten informacion para mejorar la deteccion conjunta. El problema que aborda es la heterogeneidad de modalidades: cada agente puede llevar sensores distintos (LiDAR, camara) y sus representaciones no son directamente compatibles.

La propuesta de CodeAlign es traducir las caracteristicas de una modalidad (aqui camara, m7, basada en LSS/EfficientNet) al espacio de codigos de otra modalidad (aqui LiDAR PointPillar, m1) mediante una traduccion feature-code-feature (FCF). El checkpoint publicado corresponde a un escenario concreto sobre el dataset OPV2V: dos agentes, ego con LiDAR PointPillar y vecino con camara, con un rango de evaluacion de ±102.4 m en x/y.

El modelo es relevante para investigadores en percepcion cooperativa V2X que quieran reproducir los resultados del paper sin reentrenar. Se distribuye como un archivo tar.gz con cinco checkpoints y configuraciones portables, y requiere el codigo fuente de OpenCOOD/HEAL obtenido por separado desde GitHub. No es un paquete AutoModel de Transformers ni un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de deteccion 3D colaborativa (OpenCOOD/PyTorch); encoders PointPillar (m1) y LSS/EfficientNet (m7) con traduccion feature-code-feature (FCF) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints en precision original, sin variantes GGUF/AWQ) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 (pesos y wrappers originales); componentes de terceros conservan sus terminos |
| Formato de pesos | `.pth` (PyTorch), empaquetados en `codealign-opv2v-m1m7-fcf-v1.tar.gz` con sidecar `.sha256` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de percepcion colaborativa heterogenea: cada agente codifica sus observaciones con el encoder propio de su modalidad y comparte representaciones intermedias. En este checkpoint, el agente ego usa un encoder PointPillar sobre LiDAR (m1) y el vecino un encoder LSS con backbone EfficientNet sobre camara (m7). La innovacion central es el modulo FCF, que traduce las caracteristicas del dominio m7 al espacio de codigos del dominio m1 para que el fusionado se realice en un espacio comun y no en un espacio compartido aprendido de forma conjunta.

El checkpoint final de FCF se selecciona en la epoca 8. El archivo incluye cinco componentes: `encoder_m1_epoch40.pth`, `encoder_m2_epoch42.pth`, `encoder_m7_epoch18.pth`, `codespace_m1_epoch42.pth` y `translator_m7_to_m1_epoch8.pth`. El encoder m2 se conserva por compatibilidad con la configuracion original, aunque solo m1 y m7 aportan observaciones; los ficheros de inicializacion suministran el estado de encoder y adaptadores que no esta en el checkpoint de etapa final. El entrenamiento se realiza sobre OPV2V con anadidos de camara y profundidad, y la evaluacion se hace con dos agentes en orden fijo.

## Capacidades

- Deteccion 3D de objetos (vehiculos) en escenas de conduccion cooperativa a partir de LiDAR y camara.
- Traduccion de caracteristicas entre modalidades heterogeneas (camara a espacio de codigos LiDAR) mediante FCF.
- Fusion colaborativa de observaciones de dos agentes con orden fijo.
- Evaluacion en un rango espacial de ±102.4 m en x/y.
- Inferencia por lotes sobre frames del dataset OPV2V (script `run_inference.sh`, parametro `--max-samples`).
- Verificacion de integridad del paquete mediante SHA256 y `manifest.json`.
- No soporta tool calling, agentes, generacion de texto ni capacidades multilingues: es un modelo puramente perceptivo.

## Casos de uso

- Reproduccion de resultados del paper: ejecutar `run_inference.sh` sobre OPV2V con `--max-samples 4` para validar que las detecciones y el AP coinciden con los registros publicados (AP30 86.92, AP50 84.99, AP70 72.04 en validacion propia).
- Investigacion en percepcion colaborativa heterogenea: usar el checkpoint como linea base para comparar estrategias de traduccion entre modalidades (FCF frente a espacios compartidos o alineamiento adversarial).
- Desarrollo de sistemas V2X: prototipar un pipeline donde un vehiculo con LiDAR comparte representaciones con un vehiculo solo-camara, evaluando el coste en ancho de banda y la precision resultante.
- Extension a nuevos pares de modalidades: sustituir el traductor m7→m1 por otro par (por ejemplo, radar a LiDAR) partiendo de los encoders y el espacio de codigos ya entrenados.
- Validacion de robustez ante heterogeneidad: medir la degradacion de AP cuando el vecino cambia de modalidad o cuando se anade ruido en la traduccion de caracteristicas.
- Docencia y formacion: ejemplo completo y reproducible de un sistema de deteccion 3D cooperativa con instrucciones de entorno, hashes y registros de validacion.
- Auditoria de artefactos de investigacion: el paquete incluye manifest, sidecar SHA256 y `compatibility_validation.json`, util para verificar procedencia y reproducibilidad en revisiones.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre OPV2V (2.170 frames, dos agentes):

| Registro | Frames | AP30 | AP50 | AP70 |
|---|---:|---:|---:|---:|
| Paper, tabla 3 | 2.170 | 87.19 | 85.30 | 72.10 |
| Validacion propia (directorio reubicado) | 2.170 | 86.92 | 84.99 | 72.04 |

El autor indica que el resultado medido se aproxima pero no coincide exactamente con el del paper. La validacion se realizo en Linux con Python 3.7.12, PyTorch 1.10.1/CUDA 11.3, torchvision 0.11.2, spconv 2.3.6 (`spconv-cu116`) y una RTX 3090; no fue una instalacion Conda limpia. Una comprobacion de compatibilidad con cuatro frames usando el commit publico sin modificar produjo las mismas detecciones y AP que la comprobacion previa. No se han publicado resultados de benchmarks adicionales (por ejemplo, frente a otros metodos de percepcion colaborativa) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor valido la inferencia en una RTX 3090 (24 GB).
- GPU recomendadas: RTX 3090 como minimo validado; GPUs con CUDA 11.3 y spconv 2.3.6 compatibles.
- Cabe en GPU de consumo: si, al menos en RTX 3090 segun la validacion del autor. No se documenta el consumo en GPUs de gama menor.
- Despliegue: scripts de OpenCOOD/HEAL (`run_inference.sh`), con compilacion de extensiones via `python opencood/utils/setup.py build_ext --inplace`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Entorno probado: Python 3.7.12, PyTorch 1.10.1, CUDA 11.3, torchvision 0.11.2, spconv 2.3.6 (`spconv-cu116`).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: repositorio de 0.2 GB; el dataset OPV2V se descarga por separado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La model card solo compara el checkpoint con los resultados del propio paper (tabla 3). Como referencia cualitativa, el modelo se situa en la linea de trabajos de percepcion colaborativa heterogenea sobre OPV2V (por ejemplo, variantes de V2X-ViT o HEAL), pero no se aportan cifras que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | AP70 (OPV2V) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeAlign-OPV2V-m1m7-FCF-v1 | no disponible | no aplica | 72.04 (validacion propia) | Apache-2.0 | Hugging Face (checkpoint) + GitHub |
| Alternativas de percepcion colaborativa | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion: no es un paquete Transformers AutoModel; requiere clonar el repositorio OpenCOOD/HEAL y compilar extensiones.
- Escenario fijo: solo dos agentes, orden fijo, ego LiDAR PointPillar (m1) y vecino camara LSS/EfficientNet (m7). No cubre otras combinaciones de modalidades ni mas agentes sin reentrenar.
- Dataset especifico: entrenado y evaluado sobre OPV2V con anadidos de camara y profundidad; el dataset se descarga aparte.
- Reproducibilidad parcial: el AP medido no coincide exactamente con el del paper (diferencias de 0.27, 0.31 y 0.06 puntos en AP30, AP50 y AP70).
- Entorno fragil: versiones antiguas (Python 3.7, PyTorch 1.10.1, CUDA 11.3, spconv 2.3.6) y validacion en una instalacion Linux existente, no en un entorno limpio.
- Licencia: los pesos y wrappers son Apache-2.0, pero los componentes de terceros conservan sus terminos y el arbol fuente HEAL/OpenCOOD no se relicencia (ver `LICENSE_NOTICE.md`).
- Sin datos de sesgo, alucinacion ni comportamiento fuera de dominio: al ser un detector 3D, el riesgo principal es la degradacion de AP ante condiciones no vistas (clima, densidad de trafico, calibracion) y la dependencia de la calidad de la traduccion entre modalidades.
- Sin soporte multilingue ni generativo: no aplica para tareas de texto, codigo o agentes.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), lo que limita la validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/cxliu0314/CodeAlign
- Repositorio GitHub: https://github.com/cxliu0314/CodeAlign
- Checkpoint: https://huggingface.co/cxliu0314/CodeAlign/resolve/main/codealign-opv2v-m1m7-fcf-v1.tar.gz
- Sidecar SHA256: https://huggingface.co/cxliu0314/CodeAlign/resolve/main/codealign-opv2v-m1m7-fcf-v1.tar.gz.sha256
- Paper (CVPR 2026): "Linking Modality Isolation in Heterogeneous Collaborative Perception", Liu, Chao y Chen. No se dispone de URL directa en la informacion proporcionada.
- Dataset OPV2V: se descarga por separado; no se proporciona URL en la model card.
