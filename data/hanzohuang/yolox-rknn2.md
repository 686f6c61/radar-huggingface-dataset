# HanzoHuang/YOLOX-RKNN2

## Resumen

YOLOX-RKNN2 es una distribucion de artefactos convertidos del detector de objetos YOLOX Nano de Megvii-BaseDetection, empaquetados para su ejecucion en las NPU de los SoC Rockchip RK3576 y RK3588. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original `yolox_nano.pth` a formato ONNX mediante el exportador de airockchip y posteriormente compilado a formato RKNN con RKNN Toolkit2 2.5.0, siguiendo el flujo del repositorio oficial rknn_model_zoo. El autor del repositorio es HanzoHuang y el pipeline declarado es `object-detection`.

El repositorio incluye variantes en FP16 e INT8 para cada uno de los dos chips soportados, organizadas por version de toolkit bajo rutas del tipo `models/v2.5.0/detect/yolox_nano/<chip>/<precision>/`. Cada carpeta contiene el binario `model.rknn` y un `metadata.yaml`, y la raiz del repositorio incluye un `manifest.json` que registra los hashes de cada modelo para verificacion de integridad. El tamano total del repositorio es de aproximadamente 0,3 GB.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue orientado a la inferencia en hardware Rockchip, no de un modelo de lenguaje. Por tanto, muchas de las filas habituales de esta plantilla (parametros activos, contexto, idiomas, tool calling) no aplican o no estan documentadas. La informacion disponible se limita a la model card y a los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX Nano (detector de objetos de una etapa, familia YOLOX; variante Nano, sin datos de bloques concretos en la informacion disponible) |
| Parametros totales | no disponible (la model card no publica el recuento; el checkpoint original es `yolox_nano.pth`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 e INT8 (variantes por chip y precision) |
| Idiomas soportados | no aplica (modelo de deteccion de objetos) |
| Licencia | `other`, con `license_name: upstream-terms-by-artifact` y enlace a `LICENSES.md`; la model card indica que se aplica Apache-2.0 a esta distribucion |
| Formato de pesos | RKNN (`.rknn`), con checkpoint original `.pth` incluido en `source` y export intermedio a ONNX |
| Hardware objetivo | NPU de Rockchip RK3576 y RK3588 |
| Toolkit de conversion | RKNN Toolkit2 2.5.0 |
| Tamano del repositorio | 0,3 GB |
| Tarea | Deteccion de objetos (`pipeline_tag: object-detection`) |

## Arquitectura y entrenamiento

YOLOX es una familia de detectores de objetos de una etapa desarrollada por Megvii-BaseDetection. La variante Nano es la de menor coste computacional de la familia y se utiliza habitualmente en dispositivos de borde. La informacion proporcionada no detalla la composicion interna de bloques, el numero de parametros ni el dataset de entrenamiento original; esos datos corresponden al proyecto YOLOX upstream y no se reproducen en la model card de esta distribucion.

El proceso de esta distribucion es puramente de conversion y cuantizacion: el checkpoint original `yolox_nano.pth` se exporto a ONNX con el exportador de airockchip (commit `fc69c1e`) y se compilo con el conversor del Model Zoo de Rockchip (commit `837db8e`) usando RKNN Toolkit2 2.5.0. La conversion cambio el formato del modelo y cuantizo la variante INT8. No se documenta ningun reentrenamiento, ajuste fino ni calibracion adicional mas alla de la propia conversion. No hay informacion sobre datos de calibracion para la cuantizacion INT8.

## Capacidades

- Deteccion de objetos en imagenes, en las clases del checkpoint original de YOLOX Nano (la model card no enumera el conjunto de clases; el YOLOX upstream se entrena sobre COCO).
- Inferencia acelerada en NPU de Rockchip RK3576 y RK3588 mediante el runtime RKNN.
- Dos niveles de precision: FP16 para mayor fidelidad numerica e INT8 para mayor rendimiento y menor huella.
- Verificacion de integridad de los artefactos mediante hashes registrados en `manifest.json`.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: es un detector de vision.
- No se documentan capacidades de segmentacion, vision-lenguaje ni modos de pensamiento.

## Casos de uso

- Vision artificial en dispositivos de borde con RK3588: desplegar `model.rknn` en la NPU del SoC para deteccion de objetos en tiempo real en camaras IP o industriales, aprovechando la variante INT8 para minimizar consumo.
- Videovigilancia y analitica de video: integrar el detector en pipelines de video locales sobre placas con RK3576, donde el coste energetico y la ausencia de GPU dedicada hacen preferible la NPU.
- Robotica y sistemas embebidos: usar la deteccion como etapa de percepcion en robots o drones con SoC Rockchip, con FP16 cuando se requiera mayor precision en las cajas.
- Automatizacion industrial y control de calidad: deteccion de objetos o defectos visuales en lineas de produccion con hardware de bajo coste y sin dependencia de la nube.
- Prototipado rapido de aplicaciones de vision: punto de partida reproducible (hashes en `manifest.json`) para validar el rendimiento de YOLOX Nano en NPU antes de entrenar un modelo propio.
- Sistemas de conteo y presencia: deteccion de personas u objetos en entornos minoristas o de acceso, ejecutando el modelo localmente para preservar la privacidad de las imagenes.
- Comparativa de cuantizacion FP16 frente a INT8: evaluar en el propio hardware el compromiso entre latencia y precision de deteccion antes de fijar una variante en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de mAP, latencia ni throughput para RK3576 o RK3588, ni comparaciones con otras variantes de YOLOX o detectores alternativos.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en los SoC Rockchip RK3576 y RK3588. No esta pensado para GPU de escritorio ni para CPU generica.
- VRAM: no aplica; el modelo se ejecuta sobre la NPU y la memoria compartida del SoC. No se documenta el consumo de memoria por variante.
- GPU recomendadas: no aplica. No se contemplan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no; requiere el runtime RKNN y hardware Rockchip compatible.
- Opciones de despliegue: runtime RKNN de Rockchip (RKNN Toolkit2 2.5.0 para la conversion); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Precisiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOX-RKNN2 (esta ficha) | RKNN | NPU RK3576 / RK3588 | FP16, INT8 | `other` (upstream-terms-by-artifact; Apache-2.0 segun la model card) | Hugging Face, 0 descargas, 0 likes |
| YOLOX Nano original (Megvii-BaseDetection) | PyTorch (`.pth`) | GPU/CPU genericos | FP32 (checkpoint) | Apache-2.0 | GitHub de YOLOX |
| Otras conversiones del rknn_model_zoo | RKNN | NPU Rockchip | FP16, INT8 | Segun el modelo upstream | GitHub de airockchip |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a formato, hardware y licencia.

## Limitaciones y advertencias

- Es un artefacto de conversion, no un modelo nuevo: hereda las limitaciones del YOLOX Nano original, incluida su precision de deteccion en escenas dificiles.
- La cuantizacion INT8 puede degradar la precision respecto a FP16; la model card no documenta la perdida de mAP asociada.
- Solo funciona en NPU de Rockchip RK3576 y RK3588 con el runtime RKNN; no es portable a otros aceleradores sin reconversion.
- La licencia es `other` con terminos definidos en `LICENSES.md` y la etiqueta `upstream-terms-by-artifact`; aunque la model card menciona Apache-2.0, conviene revisar `LICENSES.md` antes de un uso comercial.
- No hay informacion sobre sesgos, clases soportadas ni composicion del dataset de entrenamiento original en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad; no hay evidencia publica de su funcionamiento en produccion.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje, pero si existe riesgo de falsos positivos y negativos propios de un detector de objetos.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HanzoHuang/YOLOX-RKNN2
- Avisos de licencia: https://huggingface.co/HanzoHuang/YOLOX-RKNN2/blob/main/LICENSES.md
- Checkpoint original YOLOX Nano: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_nano.pth
- Repositorio YOLOX de Megvii-BaseDetection: https://github.com/Megvii-BaseDetection/YOLOX
- Exportador YOLOX de airockchip: https://github.com/airockchip/YOLOX/tree/fc69c1e2ccb30fce7e18250bddc13a68090dca09
- Conversor YOLOX del rknn_model_zoo: https://github.com/airockchip/rknn_model_zoo/tree/837db8e992815ff8647eadb709f07067f4bc3a71/examples/yolox
