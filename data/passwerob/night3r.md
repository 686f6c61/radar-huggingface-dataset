# Passwerob/Night3R

## Resumen

Night3R es un modelo de reconstruccion 3D diseñado especificamente para condiciones de iluminacion extrema, publicado por el desarrollador Passwerob. Se construye sobre el backbone de MASt3R, un modelo de correspondencia y reconstruccion estereo basado en transformers, al que se le añade un codificador de vóxeles de eventos y un mecanismo de fusion entre eventos y RGB. El objetivo es resolver la reconstruccion geometrica en escenarios nocturnos o de muy baja luminosidad, donde las camaras RGB convencionales fallan y las camaras de eventos aportan informacion robusta.

El modelo se distribuye como checkpoints de "estudiante" (student checkpoints) entrenados sobre tres fuentes de datos: MVSEC, el split de entrenamiento de DSEC y DL3DV con pseudo-profundidad generada por DA3. La relevancia actual radica en que combina dos lineas de investigacion activas, la reconstruccion 3D con MASt3R y la vision basada en eventos, para un caso de uso practico como es la percepcion nocturna en robotica y automocion.

El repositorio ocupa 8,0 GB e incluye pesos de geometria y una cabeza de pose adaptada. No se trata de un modelo de lenguaje, sino de un modelo de vision 3D, por lo que las secciones de capacidades linguisticas, benchmarks de texto y requisitos de contexto no aplican en su forma habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone MASt3R (transformer) con codificador de vóxeles de eventos y fusión evento/RGB |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | other (licencia no estandar, ver limitaciones) |
| Formato de pesos | checkpoints PyTorch `.pth` |

## Arquitectura y entrenamiento

Night3R parte del backbone MASt3R (`MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric.pth`), que debe cargarse por separado en tiempo de inferencia y no se incluye en el repositorio. Sobre ese backbone se añade un codificador de vóxeles de eventos y un modulo de fusion entre la representacion de eventos y la imagen RGB. Los nombres historicos de los modulos conservan la etiqueta `event_dark3r` porque los checkpoints se guardaron con esa denominacion.

El checkpoint de geometria (`event_dark3r_night3r_final.pth`) corresponde al paso 100 de un entrenamiento continuado desde la ejecucion global-final `blend700`, inicializada con tres datasets. Las fuentes de entrenamiento fueron MVSEC, el split de entrenamiento de DSEC y DL3DV con pseudo-profundidad DA3, muestreadas con proporcion DL3DV:DSEC:MVSEC = 4:2:1. Existe ademas un checkpoint con cabeza de pose adaptada (`event_dark3r_night3r_final_with_pose_head.pth`) para tareas de pose y trayectoria, y un fichero independiente de la cabeza de pose (`pose_head_step00000100.pth`). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un modelo de vision de este tipo).

## Capacidades

- Reconstruccion 3D de escenas nocturnas o de baja luminosidad combinando camaras de eventos y RGB.
- Estimacion de profundidad densa (metricas AbsRel y delta1 reportadas sobre MVSEC, DSEC y DL3DV).
- Estimacion de pose y trayectoria mediante el checkpoint con cabeza de pose adaptada.
- Correspondencia estereo y geometria multi-vista heredadas del backbone MASt3R.
- Fusion multimodal evento/RGB mediante codificador de vóxeles de eventos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision 3D, no un LLM.

## Casos de uso

- Percepcion nocturna en robotica movil: el modelo reconstruye geometria y profundidad en escenarios con poca luz usando la camara de eventos, alli donde un pipeline RGB convencional pierde textura y contraste.
- Automocion y ADAS en condiciones de baja visibilidad: la cabeza de pose permite estimar trayectoria y odometria visual en entornos nocturnos, util para localizacion relativa.
- Mapeo y SLAM en interiores oscuros: la reconstruccion densa sobre MVSEC y DSEC encaja en pipelines de mapeo donde la iluminacion es insuficiente para metodos fotometricos clasicos.
- Fusion de sensores evento+RGB en drones: el codificador de vóxeles de eventos permite integrar una camara de eventos de bajo consumo junto a una RGB para navegacion nocturna.
- Investigacion en vision basada en eventos: los checkpoints publicados y el dataset de evaluacion `Passwerob/Night3R-test` sirven como linea base reproducible para comparar metodos de reconstruccion con eventos.
- Evaluacion de robustez geometrica: las metricas sobre DL3DV con pseudo-profundidad DA3 permiten medir la degradacion del modelo en escenarios con ground-truth imperfecto.

## Benchmarks y rendimiento

Metricas reportadas para el checkpoint de geometria (extraidas de la model card):

| Dataset | Referencia | Raw AbsRel | Raw delta1 | Median AbsRel | Median delta1 |
|---|---|---:|---:|---:|---:|
| MVSEC | GT | 0,2008 | 0,7591 | 0,1933 | 0,7976 |
| DSEC | GT | 0,1599 | 0,7252 | 0,0684 | 0,9686 |
| DL3DV | Pseudo-profundidad DA3 held-out | 0,6820 | 0,1988 | 0,3061 | 0,6367 |

MVSEC y DSEC se comparan con profundidad de sensor. Los valores de DL3DV miden la concordancia con pseudo-profundidad DA3 y no son precision de profundidad frente a ground-truth real. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 8,0 GB y requiere ademas el checkpoint del backbone MASt3R, por lo que se recomienda al menos 16-24 GB de VRAM para inferencia en FP32/FP16.
- GPU recomendadas: no especificadas por el autor; por tamano del backbone ViT-Large, se recomienda A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: probable en RTX 4090 y GPUs con 24 GB o mas; en GPUs de 12-16 GB puede requerir FP16 o reduccion de resolucion.
- Opciones de despliegue: el autor proporciona un script de inferencia `forward_night3r.py` con `--device cuda`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Night3R | no disponible | no disponible | Reconstruccion 3D nocturna con eventos | other | Hugging Face (Passwerob/Night3R) |
| MASt3R | no disponible | no disponible | Correspondencia y reconstruccion estereo | no disponible | Pesos publicos (requerido como backbone) |
| DUSt3R | no disponible | no disponible | Reconstruccion 3D densa sin calibracion | no disponible | Pesos publicos |
| Metodos con eventos (p. ej. E2Depth, EKLT) | no disponible | no disponible | Profundidad/odometria con eventos | no disponible | Repositorios academicos |

Night3R se distingue por combinar el backbone MASt3R con eventos, mientras que MASt3R y DUSt3R son puramente RGB. No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other": no es una licencia estandar; es necesario revisar los terminos exactos antes de cualquier uso comercial.
- Los checkpoints son "student" y el entrenamiento se detuvo en el paso 100; no se garantiza convergencia final ni robustez fuera de los datasets de entrenamiento.
- Las metricas de DL3DV se miden contra pseudo-profundidad DA3, no contra ground-truth real, por lo que no deben interpretarse como precision absoluta.
- Requiere cargar el backbone MASt3R por separado en tiempo de inferencia; el repositorio no es autocontenido.
- El script de inferencia incluye la opcion `--allow-unsafe-checkpoint-load`, lo que implica riesgos de seguridad al cargar checkpoints de origen no verificado.
- Riesgo de alucinacion geometrica en escenas muy distintas a MVSEC, DSEC o DL3DV (por ejemplo, exteriores diurnos o interiores con iluminacion artificial intensa).
- No hay informacion publicada sobre sesgos, idiomas ni contexto; no aplica como modelo de lenguaje.
- Los nombres de modulo conservan la etiqueta historica `event_dark3r`, lo que puede confundir en la integracion con el codigo actual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Passwerob/Night3R
- Dataset de evaluacion: https://huggingface.co/datasets/Passwerob/Night3R-test
- Codigo: https://github.com/Passwerob/Night3r
- Backbone MASt3R: no disponible en la informacion proporcionada (checkpoint `MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric.pth`)
