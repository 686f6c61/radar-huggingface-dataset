# JimmyLiaoo/LO-World

## Resumen

LO-World es una colección de checkpoints preentrenados para la predicción conjunta de ocupación 3D futura y LiDAR en un espacio latente BEV compartido, orientada a la conducción autónoma. Lo publica el usuario JimmyLiaoo en Hugging Face y se distribuye como pesos PyTorch (`.pth`) que acompañan a un repositorio de código separado, no incluido en el propio repositorio del modelo. El paquete incluye un tokenizador conjunto de ocupación y LiDAR (`occ_lidar_vae.pth`) y varios modelos del mundo (world models) entrenados sobre nuScenes y Waymo.

El modelo aborda un problema clásico de la planificación y predicción en conducción autónoma: anticipar cómo evolucionará el entorno 3D (qué celdas de ocupación estarán libres u ocupadas) y cómo se verá ese entorno en un sensor LiDAR, en lugar de limitarse a predecir trayectorias o cajas 3D. La innovación declarada es el uso de un latente BEV compartido entre ambas modalidades, lo que permite generar ocupación y LiDAR de forma acoplada y coherente.

La relevancia es acotada pero específica: se trata de un artefacto de investigación (0 descargas, 0 likes en el momento de la consulta, licencia no declarada en la ficha) con checkpoints para 6 y 12 fotogramas, variantes autorregresivas, condicionamiento por BEVLayout y una variante específica para Waymo. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un modelo del mundo para percepción y predicción en BEV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo en espacio latente BEV con tokenizador VAE conjunto de ocupación y LiDAR; variantes autorregresivas de 12 fotogramas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de 6 y 12 fotogramas; paquetes de condición de 81 fotogramas a 12 Hz) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en punto flotante; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta de idioma de la ficha; el modelo no procesa texto) |
| Licencia | no disponible en la ficha del modelo; los datos BEVLayout derivados de nuScenes son de uso no comercial bajo los términos de nuScenes |
| Formato de pesos | `.pth` (PyTorch), con `SHA256SUMS` para verificación |

## Arquitectura y entrenamiento

La información disponible describe un modelo del mundo que opera en un espacio latente BEV compartido y que predice de forma conjunta la ocupación 3D futura y la observación LiDAR futura. El paquete separa un tokenizador VAE conjunto de ocupación y LiDAR (`occ_lidar_vae.pth`) de los modelos del mundo propiamente dichos, que incluyen los parámetros del tokenizador. Hay checkpoints para ventanas de 6 fotogramas (`bev_world_6f.pth`, `bev_world_6f_stc.pth`, `bev_world_6f_waymo.pth`) y para 12 fotogramas en modo autorregresivo (`bev_world_12f_autoregressive.pth`) y con condicionamiento BEVLayout (`bev_world_12f_layout_autoregressive.pth`).

No se detallan en la información proporcionada el número de parámetros, la composición exacta del dataset de entrenamiento, el número de tokens vistos, ni si hubo etapas de RLHF o DPO (poco probables en este dominio). Los datos de entrenamiento se apoyan en nuScenes (anotaciones de train/validación en `nus_infos/*.pkl`) y en Waymo para la variante correspondiente; las etiquetas de ocupación provienen de Occ3D y, para la variante STC, de predicciones STCOcc codificadas con el tokenizador publicado. Los paquetes de condición BEVLayout se ofrecen a 2 Hz y, opcionalmente, a 12 Hz con clips de 81 fotogramas para 700 escenas de entrenamiento y 150 de validación.

## Capacidades

- Predicción conjunta de ocupación 3D futura y LiDAR futuro en un latente BEV compartido.
- Predicción multi-fotograma: ventanas de 6 fotogramas y generación autorregresiva de 12 fotogramas.
- Condicionamiento por BEVLayout para las variantes layout-autorregresivas.
- Soporte de entradas de ocupación provenientes de STCOcc en la variante `bev_world_6f_stc.pth`.
- Variante específica entrenada sobre Waymo (`bev_world_6f_waymo.pth`).
- Tokenización y reconstrucción de ocupación y LiDAR mediante el VAE conjunto.
- No soporta tool calling, function calling, agentes, texto, visión genérica ni audio.

## Casos de uso

- Predicción de ocupación futura para planificación de trayectorias: el modelo genera mapas de ocupación 3D a varios fotogramas vista, lo que permite a un planificador evaluar el espacio libre futuro antes de emitir una trayectoria.
- Simulación de sensor LiDAR para aumento de datos: a partir de una secuencia BEV, el modelo puede generar observaciones LiDAR futuras coherentes con la ocupación predicha, útil para entrenar detectores con datos sintéticos.
- Evaluación de modelos de percepción en escenarios contrafactuales: el condicionamiento por BEVLayout permite alterar la disposición del entorno y observar cómo cambia la predicción conjunta de ocupación y LiDAR.
- Investigación en modelos del mundo para conducción autónoma: sirve como base para comparar estrategias de predicción en espacio latente frente a predicción en espacio de observación.
- Predicción autorregresiva a horizonte largo: la variante de 12 fotogramas autorregresiva permite estudiar la degradación de la coherencia al extender el horizonte de predicción.
- Transferencia entre datasets: la variante Waymo permite evaluar la generalización de la arquitectura y del tokenizador entre nuScenes y Waymo.
- Integración en pipelines de percepción con STCOcc: la variante `bev_world_6f_stc.pth` acepta predicciones STCOcc como entrada, lo que permite encadenar un detector de ocupación existente con el modelo del mundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 9,2 GB e incluye seis checkpoints, pero no se desglosa el tamaño por checkpoint ni el número de parámetros.
- GPU recomendadas: no disponible. No se documentan requisitos de memoria ni GPUs validadas.
- Cabe en GPU de consumo: no disponible; sin datos de parámetros ni de memoria pico no puede confirmarse.
- Opciones de despliegue: inferencia mediante PyTorch con el repositorio de código asociado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas/salidas | Licencia | Disponibilidad |
|---|---|---|---|---|
| LO-World | Modelo del mundo BEV con tokenizador VAE ocupación-LiDAR | Secuencias BEV a ocupación 3D y LiDAR futuros | No disponible | Pesos en Hugging Face, código en repositorio aparte |
| OccWorld | Modelo del mundo de ocupación 3D | Secuencias a ocupación 3D futura | No disponible en esta ficha | Referencia de la literatura; no verificada aquí |
| Cam4DOcc | Benchmark y modelos de predicción de ocupación 4D | Cámara a ocupación 4D | No disponible en esta ficha | Referencia de la literatura; no verificada aquí |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La ficha del modelo no declara licencia; el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- Los datos BEVLayout derivados de nuScenes están sujetos a los términos de nuScenes, que restringen el uso a investigación no comercial.
- Es necesario descargar por separado los datos de sensores originales de nuScenes y las etiquetas Occ3D; el repositorio no los incluye.
- La variante STC requiere predicciones STCOcc externas codificadas con el tokenizador publicado, lo que añade una dependencia de un enlace de Google Drive externo.
- El modelo no procesa texto ni lenguaje natural; la etiqueta de idioma `en` de la ficha no implica capacidades lingüísticas.
- No se documentan sesgos, tasas de alucinación ni métricas de error de predicción, por lo que no puede evaluarse su fiabilidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- El código de inferencia y entrenamiento no está en el repositorio del modelo; se remite a un repositorio de código separado cuya URL no se especifica en la información disponible.
- No se documentan requisitos de hardware ni tiempos de inferencia, lo que dificulta planificar un despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/JimmyLiaoo/LO-World
- Términos de uso de nuScenes: https://www.nuscenes.org/terms-of-use
- Predicciones STCOcc (Google Drive): https://drive.google.com/file/d/1dXB9mtROLWChycBZlhYIf_JBLshXogBs/view?usp=drive_link
