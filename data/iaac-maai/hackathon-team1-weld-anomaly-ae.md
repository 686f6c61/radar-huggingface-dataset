# iaac-maai/hackathon-team1-weld-anomaly-ae

## Resumen

`iaac-maai/hackathon-team1-weld-anomaly-ae` es un autoencoder convolucional de deteccion de anomalias entrenado para identificar defectos en radiografias de soldaduras de acero. Lo desarrollaron Jerome, Kazuko, Amelia y Sahil como parte del hackathon *AI Methods I* del Master en IA para Arquitectura y Entorno Construido del IAAC (Instituto de Arquitectura Avanzada de Cataluna), en noviembre de 2026. El modelo aborda un problema clasico de inspeccion industrial: la revision manual de radiografias de soldadura es lenta y depende del criterio del inspector.

La aproximacion es de tipo *one-class*: el autoencoder se entrena exclusivamente con soldaduras sin defecto, de modo que la reconstruccion de una soldadura sana es fiel, mientras que la de una soldadura defectuosa presenta un error elevado en la zona del defecto. El error de reconstruccion por pixel actua como mapa de calor que localiza la anomalia. Esto evita la necesidad de ejemplos etiquetados de cada tipo de defecto durante el entrenamiento.

El modelo es deliberadamente pequeno (718.369 parametros, entrada de 64x64 pixeles en escala de grises) y se distribuye en formato ONNX para inferencia ligera. Su proposito declarado es ser una herramienta de cribado que ordene las radiografias por riesgo para que el inspector revise primero las mas sospechosas, no un sistema de aceptacion o rechazo segun normativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional (ConvAE): encoder con 3 bloques Conv 3x3 stride 2 + BatchNorm + ReLU, capa lineal a codigo latente de 32 dimensiones, decoder con convoluciones transpuestas y activacion sigmoide |
| Parametros totales | 718.369 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 64x64 pixeles) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX float32 y PyTorch state_dict) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | ONNX (`anomaly_ae.onnx`) y PyTorch state_dict (`anomaly_ae.pt`) |

## Arquitectura y entrenamiento

El modelo es un autoencoder convolucional simetrico. El encoder reduce una imagen de 64x64 pixeles en escala de grises (rango 0-1) mediante tres bloques de convolucion 3x3 con stride 2, BatchNorm y ReLU, pasando de 64 a 8 pixeles de resolucion espacial, y una capa lineal que comprime la representacion a un vector latente de 32 numeros. El decoder reconstruye la imagen con convoluciones transpuestas y una sigmoide final. La puntuacion de anomalia es el error cuadratico medio entre la entrada y la reconstruccion, y el mapa de error por pixel identifica la localizacion del defecto.

El entrenamiento utilizo exclusivamente las 3.783 imagenes de soldaduras sin defecto de los 20 cordones de soldadura asignados al conjunto de entrenamiento del dataset RIAWELC. Se empleo perdida MSE, optimizador Adam con learning rate 0.001, tamano de lote 64, volteos aleatorios como aumento de datos y parada temprana sobre el error de validacion con soldaduras sanas (mejor epoca: 21). El entrenamiento completo tardo 8 segundos en una GPU RTX 5080 Laptop. Se selecciono el mejor de cuatro disenos comparando ROC AUC de validacion: Conv 128 px latente 32, Conv 128 px latente 128, Dense 128 px latente 32 y Conv 64 px latente 32 (el elegido).

El dataset RIAWELC contiene 24.407 imagenes de 227x227 pixeles procedentes de 29 radiografias, en cuatro clases (sin defecto, porosidad, grieta, falta de penetracion). El equipo elimino 2.514 duplicados (todas las imagenes de test originales estaban tambien en entrenamiento) y rehizo la particion por cordon de soldadura para evitar fuga de datos: 20 cordones para entrenamiento, 5 para validacion y 4 para test.

## Capacidades

- Deteccion de anomalias en radiografias de soldadura mediante error de reconstruccion.
- Localizacion aproximada del defecto mediante mapa de error por pixel.
- Clasificacion en tres niveles de riesgo segun umbrales calibrados: bajo (score <= 0,000255), revision (0,000255-0,001442) y alto (> 0,001442).
- Discriminacion entre soldadura sana y defectuosa con ROC AUC cercano a 0,99 en cordones no vistos.
- Deteccion especifica de porosidad, grieta y falta de penetracion (AUC por clase entre 0,985 y 0,999).
- Inferencia ligera via ONNX Runtime, sin dependencia de GPU para servir el modelo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual y de una sola tarea.

## Casos de uso

- Cribado previo a inspeccion manual: el modelo puntua cada tile de radiografia y ordena la cola de revision, de modo que el inspector revisa primero los tiles con nivel "alto" y reduce el tiempo dedicado a los casos claramente sanos.
- Control de calidad en linea de produccion de soldadura: integrado en un pipeline que recibe radiografias digitalizadas, preprocesa a 64x64 en escala de grises y emite un score por tile; los tiles con score superior al umbral alto se derivan a revision humana mientras el resto continua el flujo.
- Triaje en auditorias de estructuras existentes: ante un lote grande de radiografias historicas de una planta o puente, el modelo permite priorizar que cordones requieren inspeccion detallada y cuales pueden archivarse con revision superficial.
- Deteccion temprana de falta de penetracion en uniones criticas: dado que esta clase obtiene AUC de 0,999 en test, el modelo es util como primera barrera en soldaduras estructurales donde este defecto es especialmente peligroso.
- Investigacion y docencia en inspeccion automatizada: el modelo, su notebook y sus figuras son publicos, lo que lo convierte en una referencia reproducible para experimentar con autoencoders en deteccion de anomalias industriales.
- Prototipado rapido de sistemas de vision para el entorno construido: al ser un modelo ONNX de menos de 1 MB y 718.369 parametros, se puede desplegar en dispositivos de borde o en entornos con recursos limitados para validar la viabilidad de un flujo de inspeccion automatizada antes de invertir en un modelo mayor.
- Generacion de mapas de calor para informes tecnicos: el mapa de error por pixel permite adjuntar a cada radiografia una visualizacion de las zonas sospechosas, facilitando la comunicacion entre el sistema automatico y el inspector.

## Benchmarks y rendimiento

| Metrica | Validacion (5 cordones) | Test (4 cordones no vistos) |
|---|---|---|
| ROC AUC (defecto vs sano) | 0,990 | 0,999 |
| AUC porosidad | 0,994 | 0,999 |
| AUC grieta | 0,985 | 0,999 |
| AUC falta de penetracion | 0,998 | 0,999 |
| Precision / recall al umbral del 95% | 0,981 / 0,958 | 0,994 / 0,984 |
| Baseline solo contraste, ROC AUC | 0,946 | 0,936 |

Distribucion de niveles de riesgo en test: el 90,9% de los tiles sanos caen en nivel bajo, el 9,1% en revision y el 0% en alto; solo el 0,5% de los tiles con defecto caen en nivel bajo. El propio autor advierte que el test contiene solo 4 cordones de soldadura, por lo que la cifra de 0,99 ROC AUC debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32; el modelo tiene 718.369 parametros y acepta lotes de imagenes de 64x64x1.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento se completo en 8 segundos en una RTX 5080 Laptop. Para inferencia no se requiere GPU.
- Cabe en cualquier GPU de consumo, e incluso en CPU: ONNX Runtime ejecuta el modelo en pocos milisegundos por tile.
- Opciones de despliegue: ONNX Runtime (formato nativo), conversion a otros runtimes ONNX, o carga del state_dict en PyTorch con la clase `ConvAE(64, 32)` del notebook.
- Latencia y throughput: no se han publicado mediciones formales; por el tamano del modelo se espera un throughput muy alto en CPU y practicamente despreciable en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | ROC AUC reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hackathon-team1-weld-anomaly-ae | Autoencoder convolucional | 718.369 | 64x64 gris | 0,999 (test, 4 cordones) | MIT | ONNX + PyTorch en HF |
| Baseline solo contraste (mismo estudio) | Heuristico de contraste | no aplica | 64x64 gris | 0,936 (test) | no aplica | Referencia en la model card |
| Clasificador CNN de Perri et al. (RIAWELC) | CNN supervisada | no disponible | 227x227 gris | no disponible en la informacion proporcionada | no disponible | Paper academico |

No se dispone de datos publicos de benchmarks de otros autoencoders de deteccion de anomalias en soldadura en la informacion proporcionada, por lo que la comparativa se limita a los elementos citados en la model card.

## Limitaciones y advertencias

- Dataset muy pequeno y homogeneo: 29 cordones de soldadura de un unico laboratorio y una unica configuracion de rayos X; la transferencia a otros equipos o exposiciones no esta garantizada.
- Etiquetas a nivel de tile: no se ha medido si el mapa de error senala exactamente la ubicacion del defecto, solo si el tile es anomalo.
- El modelo puntua tambien la textura del grano de la radiografia: en imagenes con grano marcado parte del score proviene del ruido, no del defecto.
- Las grietas son el defecto mas dificil de detectar por ser finas y tenues, aunque el AUC reportado en test es alto.
- Herramienta de cribado unicamente: la aceptacion o rechazo segun normas como ISO 5817 depende del tamano del defecto y del espesor de la placa, que el modelo no mide.
- El conjunto de test tiene solo 4 cordones, por lo que las metricas de 0,99 ROC AUC deben tomarse como indicativas y no como garantia de generalizacion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad por decisiones tomadas a partir de las predicciones.
- El modelo no redistribuye las imagenes de entrenamiento; cualquier uso que requiera los datos debe citar a los autores del dataset RIAWELC.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/hackathon-team1-weld-anomaly-ae
- Repositorio del proyecto (codigo, notebook y figuras): https://github.com/iaac-maai/hackathon-team1-weld-anomaly
- Dataset RIAWELC: https://github.com/stefyste/RIAWELC
- Paper del dataset: B. Totino, F. Spagnolo, S. Perri, "RIAWELC: A Novel Dataset of Radiographic Images for Automatic Weld Defects Classification", ICMECE 2022.
- Paper relacionado: S. Perri, F. Spagnolo, F. Frustaci, P. Corsonello, "Welding Defects Classification Through a Convolutional Neural Network", Manufacturing Letters, Elsevier.
