# APLUX-Agora/BEVFormer-tiny-R50

## Resumen

BEVFormer-tiny-R50 es un paquete de recursos desplegables para la deteccion de objetos en 3D a partir de seis camaras de un vehiculo, empaquetado por APLUX-Agora para ejecutarse sobre la NPU de SoCs Qualcomm. No es un modelo de lenguaje: se trata de una variante reducida de la arquitectura BEVFormer (Bird's-Eye-View Transformer) con backbone ResNet-50, convertida y optimizada para inferencia en placa mediante el runtime QNN de Qualcomm. El repositorio incluye unicamente los artefactos de despliegue por SoC y precision, no los pesos en formato generico.

El modelo toma como entrada seis imagenes (frontal, frontal izquierda, frontal derecha, trasera, trasera izquierda, trasera derecha), un fichero de calibracion de la camara y un estado JSON de la frame anterior, y produce una imagen de salida de espacio BEV, un JSON con las detecciones 3D y un JSON de estado actualizado. Esta construido sobre un codificador de espacio bird's-eye-view y deteccion 3D, pensado para percepcion automotriz en el borde (AIoT).

Su relevancia es acotada pero concreta: es un ejemplo de despliegue de un transformer de percepcion BEV en hardware Qualcomm de gama AIoT, con una medicion real de latencia publicada (402,1 ms en FP16 sobre QCS8550). No hay informacion sobre datos de entrenamiento, rendimiento en benchmarks academicos ni licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEVFormer-tiny con backbone ResNet-50 (transformer de espacio bird's-eye-view para deteccion 3D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa 6 imagenes por inferencia) |
| Tipos de cuantizacion | FP16 (unica precision publicada para QCS8550) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente segun terminos originales |
| Formato de pesos | Artefactos QNN por SoC (`targets/<SoC>/<precision>/model.bin`, `model.json`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde a BEVFormer-tiny con backbone ResNet-50, una variante compacta del modelo BEVFormer original para deteccion 3D en espacio bird's-eye-view a partir de multiples camaras. El modelo codifica las seis vistas de camara en una representacion BEV y realiza deteccion de objetos 3D sobre ella. Soporta estado explicito de la frame anterior (entrada y salida `history` en JSON), lo que permite explotar informacion temporal entre frames consecutivas.

El repositorio no contiene informacion sobre el dataset de entrenamiento, numero de tokens o muestras, ni sobre procesos de RLHF/DPO (no aplicables a un modelo de percepcion). Tampoco se detalla la innovacion tecnica mas alla de la propia arquitectura BEVFormer-tiny. Los artefactos publicados son recursos convertidos y medidos por APLUX Agora sobre placas Qualcomm reales, con el runtime QNN como destino de ejecucion.

## Capacidades

- Deteccion de objetos 3D a partir de seis camaras de un vehiculo, con salida en espacio BEV.
- Entrada multimodal: seis imagenes (`front`, `front_left`, `front_right`, `back`, `back_left`, `back_right`), calibracion de camara en texto y estado historico en JSON.
- Salida de imagen BEV, detecciones en JSON y estado historico actualizado para la siguiente frame.
- Procesamiento temporal mediante estado explicito de la frame anterior.
- Inferencia acelerada en NPU Qualcomm mediante QNN.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no aplicables / no disponibles.

## Casos de uso

- Percepcion automotriz embebida: el modelo procesa las seis camaras de un vehiculo en una unica pasada y devuelve detecciones 3D en espacio BEV, adecuado para sistemas ADAS desplegados en SoC Qualcomm con NPU.
- Deteccion de obstaculos en tiempo real en vehiculos de bajo consumo: con 402,1 ms por inferencia en FP16 sobre QCS8550, encaja en pipelines de percepcion a baja frecuencia (aproximadamente 2,5 Hz) o en fusion con otros modulos.
- Fusion temporal entre frames: gracias al estado `history` de entrada y salida, se puede mantener seguimiento de objetos entre frames consecutivas sin re-procesar todo el historico.
- Validacion y prototipado en placa: el paquete incluye artefactos por SoC y precision, lo que permite desplegar y medir directamente en hardware Qualcomm sin conversion manual.
- Investigacion en percepcion BEV: util como referencia de despliegue de BEVFormer-tiny en NPU para comparar latencias reales frente a ejecuciones en GPU.
- Sistemas AIoT de vigilancia o robotica movil con multiples camaras: la misma entrada de seis vistas y calibracion puede reutilizarse en plataformas con camaras calibradas distintas del automotriz.
- Integracion en pipelines de exportacion Agora: al exportar un workflow que use el modelo, se obtienen pre/post-procesado y runner listos para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (nuScenes, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento publicado es la latencia medida en placa:

| SoC · placa | Precision | Latencia medida (Agora, precision por defecto) |
|---|---|---|
| QCS8550 · Rhino Pi X1 | FP16 | 402,1 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo se ejecuta en NPU Qualcomm, no en GPU con VRAM tradicional).
- GPU recomendadas: no aplica; el destino es la NPU de SoCs Qualcomm (QCS8550 verificado).
- Cabe en consumer GPU: no disponible; no se publican artefactos para GPU de consumo.
- Opciones de despliegue: runtime QNN de Qualcomm mediante los artefactos `targets/<SoC>/<precision>/model.bin`; el runner, pre/post-procesado y proyecto exportado se obtienen desde Agora (opcion "Deploy guide" o exportando un workflow).
- Latencia y throughput: 402,1 ms por inferencia en FP16 sobre QCS8550 con la placa Rhino Pi X1 (aproximadamente 2,5 inferencias por segundo).
- Tamano del repositorio: 0,1 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos comparables (BEVFormer completo, BEVDet, BEVDepth u otras variantes) con sus parametros, contexto o rendimiento medido en el mismo hardware, por lo que no es posible establecer una comparativa fiable.

## Limitaciones y advertencias

- Solo se publica una placa y una precision (QCS8550, FP16); no hay artefactos para otras plataformas ni cuantizaciones (INT8, etc.) en la informacion disponible.
- El repositorio no incluye pesos en formato generico (safetensors, GGUF); solo artefactos QNN por SoC, lo que limita su reutilizacion fuera de Qualcomm.
- La licencia APLUX Model Farm License es "other" y remite a un PDF; es necesario revisar sus terminos antes de cualquier uso comercial. La licencia del modelo fuente queda sujeta a los terminos originales.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluacion de robustez, por lo que no se puede valorar el riesgo de fallos en dominios distintos al de entrenamiento.
- Latencia de 402,1 ms por frame puede ser insuficiente para percepcion a alta frecuencia; conviene validar el caso de uso concreto.
- El estado temporal (`history`) anade dependencia entre frames; un estado corrupto o desincronizado puede degradar las detecciones.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, matematicas, tool calling ni agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/APLUX-Agora/BEVFormer-tiny-R50
- Demo y medicion en Agora: https://mega.aidlux.com/models/bevformer-tiny-r50
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/BEVFormer-tiny-R50/blob/main/LICENSE_MODEL_FARM.pdf
