# APLUX-Agora/Depth-Anything-V2-Small

## Resumen

Depth-Anything-V2-Small es un modelo de estimacion de profundidad monocular (depth-estimation) empaquetado y validado por APLUX-Agora para su despliegue en placas con SoC Qualcomm. No se trata de una arquitectura nueva: es una conversion del modelo Depth-Anything-V2-Small original a formatos ejecutables sobre el runtime QNN (Qualcomm Neural Network), con artefactos por placa y por precision, orientados a entornos AIoT (edge). El repositorio ocupa 0,2 GB e incluye binarios de contexto y ficheros de configuracion (`model.json`) para cada variante.

El problema que resuelve es el de llevar un estimador de profundidad a hardware embebido Qualcomm sin tener que realizar la conversion y el ajuste manualmente. La model card documenta mediciones reales de latencia sobre dos placas concretas: QCS6490 (Rhino Pi A1) con 84,7 ms en precision por defecto, y QCS8550 (Rhino Pi X1) con 49,5 ms. Las precisiones soportadas varian por SoC: W8A16 y W8A8 en QCS6490; FP16 y W8A16 en QCS8550.

La relevancia actual es acotada: el modelo esta pensado para pipelines de vision en el borde (robotica, drones, camaras inteligentes) donde la profundidad monocular alimenta tareas de navegacion, evitacion de obstaculos o reconstruccion. El repositorio no aporta informacion sobre el entrenamiento del modelo base ni sobre sus pesos originales; solo distribuye los artefactos convertidos bajo la licencia APLUX Model Farm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Depth-Anything-V2-Small; la conversion usa QNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | QCS6490: W8A16, W8A8; QCS8550: FP16, W8A16 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | APLUX Model Farm License (recursos convertidos); modelo fuente sujeto a sus propios terminos |
| Formato de pesos | binarios de contexto QNN (`model.bin`) y `model.json` por SoC y precision |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en los datos proporcionados. Por el nombre, corresponde a la variante Small de Depth-Anything-V2, un estimador de profundidad monocular, pero el repositorio no detalla capas, atencion, ni tamano de parametros. Tampoco se documentan los datos de entrenamiento, el numero de tokens o imagenes, ni si hubo ajuste fino o destilacion.

La innovacion tecnica del paquete es la conversion a QNN con artefactos por placa y por precision, verificados sobre hardware Qualcomm real (QCS6490 y QCS8550). Se incluyen preprocesado, postprocesado, un runner y un proyecto exportado, ademas de `NOTICE.md` y `SHA256SUMS` para verificacion de integridad. La descarga se realiza por SoC mediante `hf download` filtrando `targets/<SoC>/*`.

## Capacidades

- Estimacion de profundidad monocular a partir de una imagen de entrada.
- Salida de mapa de profundidad como imagen.
- Ejecucion en hardware Qualcomm via QNN, con variantes de precision por SoC.
- Despliegue en placas AIoT (QCS6490, QCS8550).
- Preprocesado y postprocesado incluidos en el paquete de despliegue.
- No se documentan capacidades de texto, codigo, tool calling, agentes ni multilingues.

## Casos de uso

- Navegacion de robots moviles en interiores: el mapa de profundidad alimenta la evitacion de obstaculos en tiempo real; con 49,5 ms por inferencia en QCS8550 se obtiene una tasa cercana a 20 FPS, adecuada para control reactivo.
- Camaras inteligentes en el borde: procesar la imagen en la propia placa evita enviar video a la nube; el modelo cabe en el SoC y se ejecuta con precision W8A16.
- Drones de bajo consumo: la variante W8A8 en QCS6490 reduce el coste computacional y permite estimacion de profundidad a bordo con 84,7 ms por fotograma.
- Reconstruccion 3D y mapeo: la profundidad monocular sirve como entrada para pipelines de SLAM o generacion de nubes de puntos en dispositivos sin sensor de profundidad dedicado.
- Realidad aumentada en dispositivos embebidos: la profundidad permite oclusion y colocacion de objetos virtuales sobre la escena capturada.
- Automatizacion industrial: inspeccion y segmentacion por profundidad en lineas de produccion con placas Qualcomm de bajo coste.
- Prototipado rapido: la guia de despliegue y el proyecto exportado permiten evaluar el modelo en placa sin escribir la integracion QNN desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como metricas de error de profundidad) en la informacion disponible. Los unicos datos medidos son de latencia en placa:

| SoC y placa | Precisiones | Latencia (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 84,7 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16 | 49,5 ms |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en SoC Qualcomm con memoria unificada, no en GPU dedicada.
- GPU recomendadas: no aplica; el runtime es QNN sobre el NPU/DSP del SoC.
- Placas validadas: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- Cabe en hardware consumer: si, en placas AIoT con esos SoC; no se documenta soporte para GPU de escritorio.
- Opciones de despliegue: runtime QNN de Qualcomm, con artefactos por placa y precision; descarga via `hf download` filtrando por SoC.
- Latencia: 84,7 ms en QCS6490 y 49,5 ms en QCS8550 en precision por defecto. Throughput no documentado para otras precisiones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos comparables ni metricas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La licencia de los recursos convertidos es APLUX Model Farm License; es necesario revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial.
- El modelo fuente esta sujeto a sus propios terminos, que no se detallan en el repositorio.
- No se documentan sesgos ni riesgos de alucinacion; al ser un modelo de vision, el riesgo principal es la imprecision del mapa de profundidad en escenas con poca textura, superficies reflectantes o iluminacion adversa, aunque esto no se confirma en la informacion disponible.
- Solo se validan dos SoC Qualcomm; no hay garantia de funcionamiento en otras plataformas.
- No se aportan metricas de calidad de profundidad, por lo que no es posible evaluar la precision del modelo sin pruebas propias.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; no hay historial de uso.
- No se especifican los idiomas ni capacidades de texto porque no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/Depth-Anything-V2-Small
- Demo online en Agora: https://mega.aidlux.com/models/depth-anything-v2-small
- Plataforma Agora: https://mega.aidlux.com
- Licencia: https://huggingface.co/APLUX-Agora/Depth-Anything-V2-Small/blob/main/LICENSE_MODEL_FARM.pdf
