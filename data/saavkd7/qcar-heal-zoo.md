# Saavkd7/qcar-heal-zoo

## Resumen

qcar-heal-zoo es un repositorio de pesos (model zoo) publicado por el usuario Saavkd7 que contiene nueve métodos de fusión cooperativa del framework HEAL (ICLR 2024), entrenados sobre datos reales capturados por dos vehículos a escala Quanser QCar en un banco de pruebas físico de la Concordia University. No es un modelo de lenguaje: es un conjunto de detectores de objetos 3D en representación BEV (bird's-eye view) que combinan la información de una cámara frontal por vehículo para superar oclusiones producidas por muros que bloquean la vista de cada coche por separado.

El interés del recurso es doble. Por un lado, ofrece una comparación homogénea: los nueve métodos comparten receta de entrenamiento, resolución de datos y receta de inicialización, de modo que las diferencias de rendimiento son atribuibles a la estrategia de fusión y no a variaciones del pipeline. Por otro, traslada al mundo real una línea de investigación (percepción colaborativa V2X) que suele evaluarse en simuladores como OPV2V, y lo hace con calibración real, ground truth de Vicon y un espacio de modelo escalado 10x respecto al mundo real (1 unidad = 10 cm) porque los QCars miden aproximadamente una décima parte de un coche convencional.

Los pesos se distribuyen como checkpoints PyTorch (.pth) junto con la configuración exacta de cada experimento y sus métricas de validación, y se ejecutan sobre el código de HEAL. La licencia es académica y restringe el uso a investigación académica y sin ánimo de lucro. El conjunto de datos CoopFront y las grabaciones ROS originales todavía no son públicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Percepción cooperativa basada en HEAL (ICLR 2024) sobre OpenCOOD; detección 3D en BEV con una cámara frontal por agente; nueve estrategias de fusión: pyramid, coalign, who2com, v2xvit, where2comm, disconet, cobevt, max y att |
| Parámetros totales | no disponible (el autor no publica el recuento; el repositorio completo ocupa 0,9 GB para nueve checkpoints más configuraciones) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de percepción; la entrada son imágenes de cámara y características colaborativas, no secuencias de texto) |
| Tipos de cuantización | no disponible (solo se publican checkpoints PyTorch .pth; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | HEAL academic software license: uso académico y sin ánimo de lucro |
| Formato de pesos | PyTorch (.pth, `net_epoch_bestval_at*.pth`), acompañados de `config.yaml`, `resolved_hypes.json` y `eval_validate.json` |
| Tarea declarada (pipeline) | object-detection |
| Número de agentes | 2 (cooperativo), con modo ego-only para comparación |
| Modalidad de sensores | cámara únicamente (camera-only) |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de creación / actualización | 2026-09-24 / 2026-09-24 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura nueva: empaqueta nueve variantes de fusión cooperativa implementadas en HEAL sobre la base de OpenCOOD. Cada método detecta objetos 3D en BEV a partir de la cámara frontal de su propio vehículo y de las características compartidas por el vehículo par; el modo "ego-only" ejecuta el mismo modelo sin las características del par, lo que permite medir la ganancia real de la cooperación. La receta de entrenamiento es común a los nueve métodos (`qcar/zoo.json`) y las configuraciones se generan de forma programática con `qcar/zoo.py`.

La inicialización no es homogénea. `att`, `max`, `disconet` y `v2xvit` parten de los checkpoints de cámara de OPV2V publicados por sus autores; `cobevt`, `where2comm`, `who2com`, `coalign` y `pyramid` reutilizan el encoder del checkpoint de cámara de AttFuse, mientras que sus módulos de fusión y cabezas de detección se entrenan desde cero. Los datos provienen de un banco de pruebas físico con dos Quanser QCar, una cámara frontal por coche, calibración real y ground truth de Vicon; los muros del entorno generan oclusiones que justifican la fusión. Todo el espacio del modelo está escalado 10x en x/y (1 unidad = 10 cm) para adaptar la geometría a vehículos de una décima parte del tamaño de un coche. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO, que en cualquier caso no aplican a un detector.

## Capacidades

- Detección de objetos 3D en BEV a partir de imágenes de cámara frontales, con interfaz de evaluación sobre el pipeline de OpenCOOD/HEAL.
- Fusión cooperativa entre dos agentes (V2X), con nueve estrategias alternativas que cubren desde fusión a nivel de píxel (`att`, `max`, `disconet`) hasta esquemas con selección de información a compartir (`who2com`, `where2comm`).
- Modo ego-only para cuantificar la contribución de las características del par y comparar contra la inferencia individual.
- Ejecución de validación reproducible mediante `python qcar/eval.py --model_dir checkpoints/qcar/zoo/<method>`, con métricas guardadas en `eval_validate.json`.
- Reproducción ronda a ronda de los experimentos en el notebook `qcar_rounds.ipynb`.
- Manejo de oclusiones estáticas: la evaluación se realiza en un escenario con muros que bloquean la vista de cada vehículo.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje ni un modelo multimodal de propósito general.
- No se documentan capacidades de visión adicionales (segmentación, profundidad, tracking) ni modos de pensamiento o audio.

## Casos de uso

- Investigación en percepción cooperativa V2X: el zoo permite comparar nueve estrategias de fusión bajo una receta común, de modo que un grupo de investigación puede aislar el efecto de la estrategia de fusión frente a otras variables del pipeline.
- Prototipado en bancos de pruebas con vehículos a escala: los pesos están entrenados sobre Quanser QCar con calibración real, por lo que sirven directamente para experimentos de laboratorio con flotas de vehículos pequeños antes de escalar a vehículos de tamaño completo.
- Estudio de oclusiones y visibilidad limitada: al estar capturado el dataset en un entorno con muros, el modelo es adecuado para medir cuánta detección se recupera gracias a la información del vehículo par respecto al modo ego-only.
- Evaluación de esquemas de comunicación eficiente: `who2com` y `where2comm` están orientados a decidir qué información transmitir; este zoo permite comparar su rendimiento frente a métodos que comparten todo, útil para investigar el coste-beneficio del ancho de banda en V2X.
- Transferencia de simulación a realidad: al inicializar varios métodos desde checkpoints de OPV2V y afinarlos con datos reales de QCar, el repositorio sirve para estudiar la brecha sim-to-real en detección cooperativa.
- Reproducibilidad y verificación de resultados publicados: cada carpeta incluye pesos, configuración resuelta y métricas de validación, lo que permite reproducir exactamente las cifras reportadas en la model card.
- Docencia en conducción autónoma y sistemas multi-agente: el notebook de reproducción por rondas y el script de evaluación facilitan prácticas guiadas sobre fusión cooperativa sin necesidad de generar datos propios.
- Base para desarrollo de nuevos métodos de fusión: el código de generación de configuraciones (`qcar/zoo.py`) y la receta compartida permiten añadir variantes y compararlas de forma controlada.

## Benchmarks y rendimiento

Los resultados publicados corresponden al split de validación: 237 fotogramas de dos trayectorias reservadas (`qcar_coop_07` y `qcar_coop_08`), con dos agentes y solo cámara. La columna "ego-only" ejecuta el mismo modelo sin las características del par.

| Método | AP@0.2 coop | AP@0.5 coop | AP@0.5 ego-only |
|---|---|---|---|
| pyramid | 0,919 | 0,891 | 0,406 |
| coalign | 0,918 | 0,881 | 0,417 |
| who2com | 0,929 | 0,871 | 0,534 |
| v2xvit | 0,920 | 0,855 | 0,489 |
| where2comm | 0,887 | 0,723 | 0,160 |
| disconet | 0,860 | 0,711 | 0,225 |
| cobevt | 0,883 | 0,517 | 0,268 |
| max | 0,875 | 0,487 | 0,038 |
| att | 0,825 | 0,451 | 0,369 |

Los intervalos de confianza (bootstrap de bloques emparejado), el AP por trayectoria y la ganancia de fusión se encuentran en `COMPARISON.md`. No se han publicado resultados de benchmarks externos (OPV2V, V2X-Sim u otros) para estos pesos en la información disponible.

## Requisitos de hardware

- No se publican requisitos oficiales de hardware en la model card ni en la información disponible.
- VRAM estimada para inferencia: no disponible. Como referencia orientativa, el repositorio completo ocupa 0,9 GB para nueve checkpoints más configuraciones, lo que sugiere pesos pequeños por método (decenas de megabytes por checkpoint); un modelo de detección BEV de este tipo suele poder ejecutarse en fp32 en GPUs de consumo con 8-12 GB de VRAM. Es una estimación, no un dato del autor.
- GPU recomendadas: no disponible. Para entrenamiento se requiere una GPU con soporte CUDA, pero el autor no especifica modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: previsiblemente sí para inferencia, por el tamaño del repositorio, aunque no está confirmado por el autor.
- Opciones de despliegue: inferencia en PyTorch mediante el código de HEAL (`python qcar/eval.py --model_dir checkpoints/qcar/zoo/<method>`) y reproducción por rondas en `qcar_rounds.ipynb`. No se documentan exportaciones a ONNX o TensorRT, ni integraciones con servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.
- Descarga de pesos: `hf download Saavkd7/qcar-heal-zoo --local-dir checkpoints/qcar/zoo`, ejecutado desde la raíz del repositorio HEAL para que las rutas coincidan con las que espera el código.

## Comparativa con modelos similares

La comparación disponible es interna, entre los nueve métodos de fusión del propio zoo, que comparten receta de entrenamiento y datos. No hay en la información proporcionada una comparación con repositorios externos de percepción cooperativa ni con pesos de terceros evaluados sobre estos mismos datos.

| Método | AP@0.5 coop | AP@0.5 ego-only | Observaciones |
|---|---|---|---|
| pyramid | 0,891 | 0,406 | Mejor AP@0.5 cooperativo del zoo |
| coalign | 0,881 | 0,417 | Rendimiento cercano a pyramid |
| who2com | 0,871 | 0,534 | Mejor AP@0.5 en modo ego-only |
| v2xvit | 0,855 | 0,489 | Inicializado desde checkpoint de cámara de OPV2V |
| where2comm | 0,723 | 0,160 | Caída notable al evaluar sin el par |
| disconet | 0,711 | 0,225 | Fusión a nivel de píxel; rota cajas del par |
| cobevt | 0,517 | 0,268 | Caída fuerte a IoU 0,5 |
| max | 0,487 | 0,038 | Fusión a nivel de píxel; rota cajas del par |
| att | 0,451 | 0,369 | Fusión a nivel de píxel; rota cajas del par |

V2VNet no está incluido en el zoo: su entrenamiento colapsó y el reentrenamiento está pendiente. No se dispone de parámetros, contexto ni licencia comparables de otros sistemas, porque el objeto publicado no es un modelo único sino un conjunto de checkpoints heredados de HEAL.

## Limitaciones y advertencias

- Los números son de desarrollo: el split de validación se usó también para seleccionar la mejor época de cada ejecución y no existe todavía una trayectoria de test independiente, por lo que las cifras están potencialmente optimistas.
- El conjunto de validación es pequeño: 237 fotogramas de dos trayectorias.
- `att`, `max` y `disconet` rotan con frecuencia aproximadamente 90° las cajas que provienen del vehículo par, porque fusionan píxel a píxel; esto explica su caída a IoU 0,5 y desaconseja su uso en producción sin corregir ese comportamiento.
- V2VNet no está disponible: su entrenamiento colapsó y el reentrenamiento sigue pendiente.
- Los datos no son públicos: ni las grabaciones de los QCar ni el dataset construido (CoopFront) están liberados, solo el código que los construye a partir de bolsas ROS.
- Licencia restrictiva: los pesos derivan de HEAL y quedan bajo su licencia de software académico, limitada a investigación académica y sin ánimo de lucro. El uso comercial no está permitido sin consultar los términos del titular.
- Dominio y escala restringidos: entrenado con dos vehículos a escala (1/10) en un banco de pruebas concreto, con una única cámara frontal por agente y sin LiDAR; el modelo no está validado en tráfico real a escala completa.
- Dependencia del código externo: la ejecución requiere el framework HEAL/OpenCOOD y la rama `qcar-testbed-integration`; no hay una API autónoma ni exportaciones a formatos de inferencia ligeros.
- Riesgo de sobreajuste al escenario: la presencia de muros y la geometría concreta del banco de pruebas condicionan el rendimiento; no se documentan evaluaciones de robustez ante cambios de iluminación, clima o calibración.
- Sesgos: no se documenta ningún análisis de sesgo. Al ser un detector de objetos 3D, los sesgos relevantes serían de representación del entorno y de las clases anotadas, no lingüísticos.
- No se han publicado intervalos de confianza ni métricas de latencia en la ficha; solo se remite a `COMPARISON.md` para el detalle estadístico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Saavkd7/qcar-heal-zoo
- Código y configuración (rama `qcar-testbed-integration`): https://github.com/Saavkd7/HEAL/tree/qcar-testbed-integration
- Documentación de uso en el repositorio: `qcar/README.md` dentro de la rama anterior
- Framework base HEAL (ICLR 2024): https://github.com/yifanlu0227/HEAL
- Licencia HEAL academic software license: https://github.com/yifanlu0227/HEAL/blob/main/LICENSE
- Las búsquedas web realizadas no devolvieron enlaces relacionados con este modelo; los resultados obtenidos (zoo.dev, modelzoo.co, Google AI Studio, inoailab.com) no guardan relación con el recurso.
