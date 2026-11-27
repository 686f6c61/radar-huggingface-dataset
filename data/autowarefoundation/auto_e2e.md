# AutowareFoundation/auto_e2e

## Resumen

AutoE2E es un modelo de conduccion autonoma end-to-end desarrollado por la Autoware Foundation, publicado en Hugging Face bajo el identificador `AutowareFoundation/auto_e2e`. Convierte imagenes de camaras surround y el historial de movimiento del vehiculo en una trayectoria de conduccion futura, sin depender de mapas HD. El modelo esta disenado para operar en autopistas, vias arteriales y calles urbanas, y sus salidas pueden fusionarse con sensores fisicos como LiDAR y radar para aplicaciones de robotaxi completamente autonomo, o usarse solo con camaras para ADAS de nivel L2++.

La version v1.0 publica dos checkpoints de planificacion de trayectoria: uno entrenado con nuPlan v1.1 (modelo base, util para evaluacion zero-shot y fine-tuning) y otro afinado sobre KITScenes-Multimodal (conduccion en Karlsruhe y con el rig de camaras de KITScenes). El repositorio incluye tambien los informes de evaluacion y los shards de validacion de KITScenes usados en el benchmark comunitario.

Arquitectonicamente, AutoE2E se concibe como tres modelos cooperantes (Reactivo a 10 Hz, World Action Model a 1 Hz y modelo de razonamiento a 1 Hz), aunque los pesos de la v1.0 solo contienen el modelo reactivo, que es la parte que conduce. El modelo tiene 79,9 M de parametros y su encoder visual parte de una inicializacion BEVFormer V2 R50 T8 congelada. Es relevante ahora porque ofrece un stack completo, reproducible y abierto para investigacion en conduccion end-to-end, un terreno hasta hace poco dominado por modelos cerrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder BEV (ResNet-50 + BEVFormer V2 T8) y planificador GRU determinista con lookup deformable de caracteristicas BEV; diseno de tres modelos cooperantes (Reactivo, World Action, Razonamiento) |
| Parametros totales | 79,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial de camara de 8 frames a 0,5 s = 3,5 s; historial de ego-motion de 6,4 s a 10 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de conduccion, no linguistico) |
| Licencia | cc-by-nc-sa-4.0 |
| Formato de pesos | no disponible (repositorio PyTorch, 16,8 GB) |

## Arquitectura y entrenamiento

AutoE2E procesa 6 vistas surround a 512x512 (con la camara frontal codificada ademas a 1024x1024) y un historial de 8 frames espaciados 0,5 s (3,5 s) mediante fusion temporal BEVFormer V2. El encoder BEV es un ResNet-50 + BEVFormer V2 (T8) con una rejilla BEV de 300x200 que cubre 180 m x 120 m (60 m detras y 120 m delante), inicializado de forma congelada desde la inicializacion oficial BEVFormer V2 R50 T8. Opcionalmente acepta un raster de mapa semantico de 14 canales mas un raster de ruta de 2 canales, de 450x300 celdas a 0,4 m, que puede dejarse vacio; la fusion mapa-imagen se realiza mediante atencion cruzada deformable. El historial de ego-motion cubre 6,4 s a 10 Hz con velocidad, aceleracion longitudinal, velocidad de guinada y curvatura.

El planificador es un GRU determinista con lookup deformable de caracteristicas BEV que produce 64 pasos de (aceleracion longitudinal, curvatura) a 10 Hz, es decir, 6,4 s, integrados en una trayectoria XY en el marco del ego. Dispone de cabezas auxiliares de segmentacion BEV de 8 clases y reconstruccion de ruta como senales de entrenamiento. El checkpoint base se entrena sobre los logs de sensores de nuPlan v1.1 (epoch 5) y el segundo checkpoint se afina desde ese sobre el split de entrenamiento de KITScenes-Multimodal. No se especifican en la informacion disponible el numero de tokens, la composicion detallada del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Planificacion de trayectoria end-to-end a partir de imagenes de multiples camaras y del historial de movimiento del vehiculo.
- Conduccion sin mapas HD: el raster de mapa es opcional y puede dejarse vacio.
- Fusion temporal de historial visual de 3,5 s mediante BEVFormer V2.
- Prediccion de 6,4 s de trayectoria futura (64 pasos a 10 Hz) expresada como aceleracion y curvatura.
- Segmentacion BEV auxiliar de 8 clases y reconstruccion de ruta como senales de entrenamiento.
- Capacidad de fusion con LiDAR y radar para aplicaciones de robotaxi, o uso solo con camaras para ADAS L2++.
- Evaluacion zero-shot en ciudades nuevas con el checkpoint base de nuPlan.
- Fine-tuning sobre datos propios y sobre rigs de camaras especificos (ejemplo: KITScenes).
- No se describe soporte de tool calling, agentes, capacidades multilingues ni modos de razonamiento activos en los pesos v1.0 (las ramas World Action y Razonamiento estan desactivadas).

## Casos de uso

- Investigacion en conduccion end-to-end: el checkpoint base de nuPlan permite reproducir el pipeline completo (codigo, datos, entrenamiento y evaluacion) y servir como linea base para comparar nuevas arquitecturas.
- Evaluacion zero-shot en ciudades nuevas: el modelo base, entrenado en nuPlan v1.1, se puede evaluar directamente sobre datos de otras ciudades para medir la generalizacion del planner sin reentrenar.
- Fine-tuning sobre flotas propias: partiendo del checkpoint base, un equipo puede adaptar el planner a su rig de camaras y su ciudad, como demuestra el checkpoint afinado sobre KITScenes para Karlsruhe.
- ADAS L2++ punto a punto: el modelo solo con camaras puede alimentar funciones de navegacion manos libres en autopista y via arterial, con las capas de seguridad adicionales que requiera el fabricante.
- Robotaxi con capa de seguridad fisica: las salidas de trayectoria pueden fusionarse con LiDAR y radar para construir un stack de conduccion completamente sin conductor.
- Benchmark comunitario: los shards de validacion de KITScenes y los informes de evaluacion publicados permiten comparar modelos end-to-end con scripts y datos compartidos (issue #210 del repositorio).
- Desarrollo de cabezas auxiliares: las cabezas de segmentacion BEV y reconstruccion de ruta sirven para experimentar con senales de entrenamiento auxiliares y supervisión densa.

## Benchmarks y rendimiento

La model card menciona resultados en ADE/FDE (metros) para una unica trayectoria predicha, con errores laterales y longitudinales medios, sobre KITScenes-Multimodal Validation a 3 s, y una comparacion con otros modelos de pesos abiertos. Sin embargo, la informacion proporcionada se interrumpe antes de incluir los valores numericos de la tabla de resultados.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 79,9 M de parametros el modelo es muy ligero, pero el repositorio ocupa 16,8 GB e incluye checkpoints, informes y shards de datos, por lo que el espacio en disco es el requisito dominante.
- GPU recomendadas: no disponible. Por tamano, el modelo cabe holgadamente en GPUs consumer, pero no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 79,9 M de parametros, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: no disponible (el repositorio es PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de conduccion).
- Latencia y throughput estimados: el modelo reactivo esta disenado para operar a 10 Hz y las ramas World Action y Razonamiento a 1 Hz, pero no se publican latencias ni throughput medidos.

## Comparativa con modelos similares

La model card anuncia una comparacion con otros modelos de pesos abiertos en KITScenes-Multimodal Validation a 3 s, pero los valores no estan incluidos en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AutoE2E v1.0 | 79,9 M | historial visual de 3,5 s | cc-by-nc-sa-4.0 | Hugging Face, pesos abiertos |
| Alternativas open-weights | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia cc-by-nc-sa-4.0 prohibe el uso comercial y exige compartir bajo la misma licencia las obras derivadas; esto limita su uso en productos ADAS o robotaxi comerciales sin acuerdo adicional.
- Los pesos v1.0 solo contienen el modelo reactivo; las ramas World Action y Razonamiento estan desactivadas y en desarrollo, por lo que no hay deteccion de casos limite ni acondicionamiento del planner por razonamiento.
- El modelo es solo con camaras en su configuracion base; para conduccion sin conductor se requiere fusion con LiDAR y radar y capas de seguridad adicionales.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; al tratarse de un modelo entrenado sobre nuPlan y KITScenes, su comportamiento fuera de la distribucion de esos datos (clima, iluminacion, paises, rigs de camaras) es incierto.
- Dependencia del rig de camaras: el checkpoint afinado esta ajustado a KITScenes y a Karlsruhe; el checkpoint base requiere fine-tuning para otros rigs.
- El raster de mapa es opcional, pero su ausencia puede degradar el rendimiento en entornos complejos; no se cuantifica en la informacion disponible.
- No se especifican limitaciones de idioma ni de contexto porque el modelo no es linguistico.
- Para produccion: no se publican latencias, tasas de fallo ni protocolos de validacion de seguridad, imprescindibles antes de cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutowareFoundation/auto_e2e
- Repositorio GitHub: https://github.com/autowarefoundation/auto_e2e
- Guia de incorporacion al proyecto: https://github.com/autowarefoundation/auto_e2e/blob/main/ONBOARDING.md
- Issue de benchmark abierto: https://github.com/autowarefoundation/auto_e2e/issues/210
- Dashboard DataModelConsole: https://d2itskdqq39tx1.cloudfront.net/
- Discord de Autoware: https://discord.com/invite/Q94UsPvReQ
- Web de la Autoware Foundation: https://autoware.org/
- Dataset KITScenes-Multimodal: https://huggingface.co/datasets/KIT-MRT/KITScenes-Multimodal
