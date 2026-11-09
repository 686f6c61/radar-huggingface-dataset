# APLUX-Agora/SuperPoint

## Resumen

SuperPoint es un modelo de extraccion de puntos caracteristicos (keypoints) y descriptores para vision por computador, empaquetado por APLUX-Agora para su despliegue en hardware Qualcomm. El repositorio de Hugging Face no contiene los pesos originales en formato de entrenamiento, sino recursos ya convertidos y validados placa a placa mediante la plataforma Agora y el pipeline Model Farm, con binarios optimizados para el SoC QCS8550 (placa Rhino Pi X1).

La tarea declarada es "otros" (no clasificacion, deteccion ni segmentacion estandar), con una entrada de imagen y una salida en formato JSON, lo que sugiere que el paquete incluye el postprocesado que extrae los keypoints y los serializa. La unica medicion publicada es una latencia de 32,1 ms en FP16 sobre QCS8550, lo que situa el modelo en el rango de tiempo real (en torno a 30 FPS) para aplicaciones de vision embebida.

Su relevancia actual es de nicho pero concreta: no es un modelo para entrenar ni afinar, sino un artefacto de despliegue para AIoT. Resulta util a quien necesite llevar un extractor de features tipo SuperPoint a un dispositivo Qualcomm sin montar el pipeline de conversion QNN desde cero. La informacion publica es muy escasa: no se detallan parametros, contexto, idiomas ni resultados de benchmarks, y la licencia es propia (APLUX Model Farm License), no la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de extraccion de puntos caracteristicos; pesos originales no descritos en el repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 (unica precision publicada para QCS8550) |
| Idiomas soportados | no aplica (entrada de imagen, salida JSON) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente segun sus terminos originales |
| Formato de pesos | binarios QNN (`model.bin`) organizados por SoC y precision en `targets/<SoC>/`, con `model.json` de configuracion y `SHA256SUMS` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento en el repositorio. El nombre "SuperPoint" remite al conocido detector de keypoints con auto-supervision para vision geometrica, pero la model card no confirma que se trate de esa implementacion ni detalla capas, backbone o funciones de perdida. Tampoco se indican tokens, datasets ni tecnicas de alineacion, que en un modelo de vision no aplicarian del mismo modo.

Lo que si documenta el autor es el pipeline de despliegue: los recursos se generan con el preprocesado y los ejemplos oficiales de Model Farm y se validan individualmente en cada placa. Cada directorio `targets/<SoC>/` contiene `model.json` (precision por defecto y rutas de variantes) y un subdirectorio por precision; los binarios de contexto se denominan `model.bin` y los paquetes multifichero se conservan tal como los publica Model Farm. El repositorio incluye ademas `NOTICE.md` y `SHA256SUMS` para verificacion de integridad.

## Capacidades

- Extraccion de puntos caracteristicos (keypoints) y descriptores a partir de una imagen de entrada.
- Salida serializada en JSON (`out`), pensada para su consumo por el runner o por un workflow exportado.
- Preprocesado y postprocesado incluidos en el paquete, segun los ejemplos oficiales de Model Farm.
- Ejecucion en hardware Qualcomm mediante QNN, con binarios especificos por SoC.
- Verificacion en placa real: el autor reporta medicion sobre QCS8550.
- Prueba online sin hardware fisico a traves de la plataforma Agora.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingue, vision generativa, audio ni modo de pensamiento.

## Casos de uso

- Odometria visual y SLAM en robots moviles: el extractor proporciona keypoints y descriptores por fotograma con una latencia de 32,1 ms en QCS8550, adecuada para emparejar imagenes consecutivas en tiempo real sobre el propio dispositivo.
- Reconstruccion 3D y fotogrametria embebida: los descriptores permiten establecer correspondencias entre vistas para generar nubes de puntos o mallas sin enviar las imagenes a la nube.
- Seguimiento visual en drones y camaras AIoT: al ejecutarse en QNN sobre un SoC de bajo consumo, el modelo puede alimentar un tracker de features en el bucle de control.
- Emparejamiento de imagenes y registro (image matching): util para verificacion de identidad de escenas, deteccion de cambios o alineacion de imagenes en inspeccion industrial.
- Vision estereo y estimacion de profundidad: los keypoints sirven para calcular disparidades entre pares de camaras en sistemas de navegacion de bajo coste.
- Ancla de realidad aumentada: el seguimiento de puntos caracteristicos permite mantener estable la pose de la camara en visores o aplicaciones moviles con hardware Qualcomm.
- Prototipado rapido sin placa: mediante la demo online de Agora se puede evaluar el comportamiento del modelo antes de adquirir el hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento medido es la latencia de inferencia:

| SoC / placa | Precision | Latencia medida (Agora, precision por defecto) |
|---|---|---|
| QCS8550 · Rhino Pi X1 | FP16 | 32,1 ms |

## Requisitos de hardware

- VRAM: no aplica; el modelo esta empaquetado para aceleradores NPU/DSP de Qualcomm mediante QNN, no para GPU de escritorio.
- Hardware validado: SoC QCS8550 sobre la placa Rhino Pi X1 (犀牛派 X1). No se documentan otros SoC en el repositorio.
- GPU consumer: no se indica soporte para A100, H100, RTX 4090 ni tarjetas equivalentes; el formato de pesos es QNN, no safetensors ni GGUF.
- Despliegue: runner y proyecto exportado de la plataforma Agora, con descarga selectiva por SoC (`--include "targets/$AGORA_SOC/*"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia: 32,1 ms por inferencia en FP16 sobre QCS8550, equivalente a unos 31 fotogramas por segundo en el mejor caso, sin contar preprocesado ni postprocesado adicional.
- Throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables, y el artefacto publicado es un paquete de despliegue especifico de Qualcomm mas que un modelo con pesos y metricas publicas comparables a alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no describe la arquitectura, los pesos originales ni el entrenamiento: no es posible auditar el comportamiento del modelo a partir del repositorio.
- Solo hay una placa y una precision validadas (QCS8550, FP16); el rendimiento en otros SoC Qualcomm no esta documentado.
- La licencia del paquete es la APLUX Model Farm License, distinta de la licencia del modelo fuente; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de cualquier uso comercial.
- Los terminos del modelo original ("see the original model's terms") no se detallan en la informacion disponible, lo que anade incertidumbre juridica al uso en produccion.
- La salida es JSON con keypoints y descriptores: no hay garantia documentada sobre formato exacto, numero maximo de puntos ni umbrales de confianza.
- Riesgo de fallo en escenas de baja textura, cambios de iluminacion extremos o movimiento rapido, inherente a los detectores de features; no se aportan metricas de robustez.
- No se documentan sesgos, idiomas ni capacidades de lenguaje porque el modelo no procesa texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar la calidad del empaquetado.
- La fecha de creacion indicada (2026-11-09) resulta anomala y conviene verificarla antes de citar el recurso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-Agora/SuperPoint
- Demo online en Agora: https://mega.aidlux.com/models/superpoint
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/SuperPoint/blob/main/LICENSE_MODEL_FARM.pdf
