# APLUX-Agora/FlashOCC

## Resumen

FlashOCC es un modelo de percepción 3D para automoción orientado a la predicción de ocupación del espacio (occupancy prediction) a partir de seis cámaras. Lo publica APLUX-Agora dentro de su iniciativa Model Farm, que distribuye recursos ya convertidos y listos para desplegar sobre aceleradores Qualcomm. El modelo recibe las imágenes de seis cámaras (frontal, frontal derecha, frontal izquierda, trasera, trasera izquierda y trasera derecha) junto con la calibración de las mismas, aplica una codificación de imagen sobre la NPU y produce un volumen semántico 3D de 200×200×16 vóxeles.

El interés del artefacto no está en el modelo en sí, sino en el empaquetado: no se distribuyen pesos en formato estándar (safetensors, GGUF), sino binarios de contexto QNN organizados por SoC y precisión dentro de `targets/<SoC>/`. La model card reporta una latencia medida de 278,7 ms sobre un QCS8550 montado en una placa Rhino Pi X1, en la precisión por defecto, con soporte declarado para FP16 y W8A16.

Se trata, por tanto, de un recurso de despliegue edge para sistemas de asistencia a la conducción y robótica móvil, no de un modelo de propósito general. La información pública disponible es muy limitada: no hay datos de arquitectura interna, composición del dataset de entrenamiento, benchmarks de calidad de ocupación ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (codificador de imagen + predicción de ocupación 3D, ejecutado en NPU Qualcomm) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (entrada multimodal de imágenes y calibración, no texto) |
| Tipos de cuantización | FP16, W8A16 |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License (recursos convertidos); modelo fuente sujeto a sus propios términos |
| Formato de pesos | binarios QNN (`model.bin`), `model.json` por SoC, paquetes multi-fichero |
| Entradas | front, front_right, front_left, back, back_left, back_right (imagen), calibration (texto) |
| Salidas | volume semántico 3D 200×200×16, `image`, `out` (JSON) |
| SoC soportado | QCS8550 (placa Rhino Pi X1) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card describe únicamente el flujo de inferencia: seis imágenes de cámara más la calibración como entrada, codificación de imagen ejecutada en la NPU y una cabeza de predicción de ocupación que emite un volumen semántico de 200×200×16 vóxeles. No se especifica si el backbone es un transformer con atención a múltiples vistas, una arquitectura tipo BEVFormer, un modelo basado en convoluciones o una combinación híbrida.

Tampoco se publican datos sobre el número de tokens o frames de entrenamiento, la composición del dataset (por ejemplo, si se usó nuScenes, Waymo u otro corpus de conducción), ni si hubo etapas de ajuste supervisado adicional, RLHF o DPO. Al tratarse de un modelo de percepción y no de lenguaje, las etapas de alineación tipo RLHF no resultan aplicables. La innovación destacable, según el autor, es la conversión y optimización del modelo para ejecución en NPU Qualcomm con dos precisiones soportadas, empaquetado por SoC y con latencias medidas en hardware real.

## Capacidades

- Predicción de ocupación 3D del entorno a partir de seis cámaras calibradas.
- Segmentación semántica de vóxeles en una rejilla de 200×200×16.
- Codificación de imagen acelerada en NPU Qualcomm (QNN).
- Entrada de calibración como texto, lo que permite adaptar la geometría de las cámaras en tiempo de ejecución.
- Salida estructurada en JSON (`out`) además de la salida de imagen, apta para integración en pipelines.
- Ejecución en dos precisiones: FP16 y W8A16.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües.
- No se documenta soporte de audio ni de modo de razonamiento explícito (thinking mode).

## Casos de uso

- Percepción de ocupación en vehículos y robots móviles: el modelo genera un volumen semántico 3D del entorno a partir de seis cámaras, lo que permite a un planificador de trayectorias razonar sobre espacio libre y obstáculos sin depender de LiDAR.
- Asistencia a la conducción en placa embebida: con 278,7 ms por inferencia en QCS8550, es viable en sistemas de bajo consumo donde no cabe una GPU dedicada, como ADAS de nivel 2 o aparcamiento automatizado.
- Robótica de interior y logística: la rejilla de 200×200×16 vóxeles permite mapear obstáculos y suelo transitable en robots de almacén o AGV con presupuesto térmico y energético reducido.
- Prototipado rápido sin hardware: el autor ofrece ejecución online en Agora (mega.aidlux.com/models/flashocc), lo que permite validar el pipeline de preprocesado y calibración antes de comprar la placa.
- Integración en pipelines de percepción existentes: la salida JSON (`out`) facilita conectar el modelo con un backend de planificación o con un sistema de registro y telemetría.
- Evaluación comparativa de precisión FP16 frente a W8A16: al distribuirse ambas variantes por SoC, permite medir la pérdida de calidad de la cuantización de 8 bits en el propio dominio de aplicación.
- Investigación en ocupación 3D en entornos edge: útil para reproducir resultados en hardware Qualcomm y comparar con implementaciones en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (mIoU de ocupación, precisión semántica por clase) en la información disponible. El único dato de rendimiento es la latencia medida por el autor:

| SoC · placa | Precisión | Latencia medida |
|---|---|---|
| QCS8550 · Rhino Pi X1 | FP16, W8A16 (por defecto) | 278,7 ms |

## Requisitos de hardware

- Acelerador objetivo: NPU integrada en Qualcomm QCS8550. No se documenta soporte para GPU de escritorio, CPU genérica ni otros SoC.
- Placa de referencia: Rhino Pi X1 (犀牛派 X1).
- VRAM: no aplica; el modelo se ejecuta sobre memoria compartida del SoC. El repositorio completo ocupa 0,1 GB, por lo que el peso de los binarios es reducido.
- No cabe en GPU consumer (RTX 4090, etc.) según la información disponible, ya que los artefactos distribuidos son binarios QNN específicos para el SoC, no pesos portables.
- Despliegue: descarga selectiva por SoC mediante `hf download` con el patrón `targets/<SoC>/*`; ejecución a través de Agora, que aporta el runner, el preprocesado y el postprocesado, además de un proyecto exportable y una guía de despliegue.
- Latencia: 278,7 ms por inferencia en la configuración medida (aproximadamente 3,6 inferencias por segundo en un solo flujo).
- Throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas de predicción de ocupación (por ejemplo, BEVFormer, OccFormer u otros) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se publican métricas de calidad de la predicción de ocupación; no es posible evaluar la precisión semántica del volumen de salida sin ejecutar el modelo.
- El modelo está empaquetado exclusivamente para Qualcomm QCS8550; no hay pesos portables ni rutas de despliegue en otras plataformas documentadas.
- La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la licencia del modelo fuente, cuyos términos no se detallan en la información disponible. Es imprescindible revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de un uso comercial.
- El modelo fuente puede tener sus propias restricciones de uso; la model card remite a los términos originales sin especificarlos.
- No se documentan sesgos, cobertura geográfica del dataset de entrenamiento ni condiciones ambientales (lluvia, noche, deslumbramiento) bajo las cuales el rendimiento pueda degradarse.
- Al ser un modelo de percepción para conducción, cualquier uso en producción requiere validación independiente y no debe tratarse como sistema de seguridad certificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-09), lo que sugiere un artefacto recién publicado y sin validación comunitaria.
- No se especifican idiomas soportados ni si la entrada de calibración en texto admite varios idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/FlashOCC
- Ejecución online en Agora: https://mega.aidlux.com/models/flashocc
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/FlashOCC/blob/main/LICENSE_MODEL_FARM.pdf
