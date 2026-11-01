# julienkay/MotionBricks-inference-engine

## Resumen

MotionBricks es un modelo de generación de movimiento en tiempo real desarrollado por NVIDIA Labs (NVlabs), orientado a la animación de personajes humanoides y robots bípedos. Dado un conjunto de poses recientes del personaje y las poses objetivo a alcanzar, el modelo sintetiza la transición de movimiento intermedia, lo que permite controlar personajes y robots con objetivos de pose en lugar de con secuencias predefinidas.

Esta ficha documenta el repositorio `julienkay/MotionBricks-inference-engine`, que no es el modelo original sino una distribución empaquetada de los pesos de MotionBricks en formatos compatibles con Unity Inference Engine (antes Sentis) y ONNX. Incluye dos variantes: SOMA (esqueleto humano) y Unitree G1 (robot humanoide), ambas con pesos FP32 sin cuantizar, a opset 17. El paquete está pensado para que desarrolladores de Unity integren generación de movimiento sin necesidad de convertir los grafos manualmente.

La relevancia de esta distribución es práctica: expone los modelos de NVIDIA en un formato listo para consumir desde C# en Unity, con informes de exportación y checksums, y documenta explícitamente qué conversiones se han aplicado. Es relevante para equipos que trabajan en animación procedural, robótica simulada o videojuegos y que necesitan inferencia local en el motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de movimiento; grafo ONNX a opset 17) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (incluido); FP16 documentado como viable con Inference Engine weight quantization; Uint8 descartado por degradación de salida |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | NVIDIA Open Model Agreement |
| Formato de pesos | `.sentis` (Unity Inference Engine 2.6.1) y `.onnx` (opset 17, FP32) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original en la documentación proporcionada. Lo que sí se detalla es el proceso de empaquetado: ambos grafos provienen de las exportaciones ONNX del software MotionBricks (repositorio `NVlabs/motionbricks`, revisión `54fc563aeaaf819a753d72cc9fdc6713989cdd43`), en la ruta `motionbricks/assets/onnx/`, como grafos FP32 a opset 17. El modelo SOMA se distribuye sin cambios (`mmm_v6_soma_fp32.onnx`); el modelo Unitree G1 sustituye un nodo `If` con guarda de squeeze trazado por un `Squeeze` equivalente, sin alterar las salidas (`mmm_v6_g1_fp32.onnx`).

Los archivos `.sentis` se generaron con Inference Engine 2.6.1 a partir de los ONNX y cada uno incluye un `.sentis.json` con versiones de Unity e Inference Engine, entradas y salidas. Los ONNX incluyen un `.export.json` con la fuente upstream, checksum, cambios aplicados, entradas, salidas y operadores. El repositorio incluye `SHA256SUMS` con los checksums de todos los ficheros. No se documentan en esta información el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, dado que no es un modelo de lenguaje.

## Capacidades

- Generación de movimiento en tiempo real para personajes humanoides y robots bípedos a partir de poses recientes y poses objetivo.
- Dos variantes de esqueleto: SOMA (esqueleto humano) y Unitree G1 (robot humanoide).
- Inferencia local en Unity mediante Inference Engine (antes Sentis), con API en C# (`MotionBricksModels.LoadAsync()`).
- Carga directa de archivos `.sentis` sin conversión previa; importación de ONNX cuando la versión de Inference Engine no carga los `.sentis`.
- Integración con el paquete `tools.doji.motionbricks` y descarga automática de modelos mediante AI Model Hub (`tools.doji.model-hub`).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento, por no tratarse de un modelo lingüístico.

## Casos de uso

- Animación procedural en videojuegos: el modelo genera la transición entre la pose actual del personaje y una pose objetivo definida por el diseñador o por el sistema de gameplay, lo que permite sustituir clips de animación rígidos por movimiento sintetizado en tiempo real dentro de Unity.
- Control de robots humanoides en simulación: la variante Unitree G1 permite generar movimiento para el robot en entornos simulados, útil para prototipar políticas de control antes de desplegar en hardware.
- Prototipado rápido de personajes: con el paquete `tools.doji.motionbricks` y la descarga vía AI Model Hub, un equipo puede integrar generación de movimiento en un proyecto Unity sin gestionar manualmente la conversión de grafos.
- Investigación en animación y robótica: los ONNX con informes de exportación y checksums permiten reproducir experimentos y auditar los cambios aplicados respecto al modelo upstream.
- Sistemas de captura de movimiento aumentada: dado un flujo de poses recientes, el modelo puede completar o corregir transiciones hacia poses objetivo, útil en pipelines de postproceso de mocap.
- Demos y pruebas de concepto en tiempo real: al ejecutarse localmente en Unity, es adecuado para prototipos interactivos sin dependencia de servicios en la nube.
- Evaluación comparativa de backends: la documentación de rendimiento FP16 frente a FP32 en CPU y GPU permite decidir la configuración de inferencia según el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La documentación del repositorio sí incluye observaciones cualitativas de rendimiento con la cuantización de pesos de Inference Engine: Float16 reduce el tamaño a la mitad manteniendo la misma salida y velocidad en GPU, pero es aproximadamente 4 veces más lento en el backend de CPU; Uint8 altera la salida en exceso y se descarta. Los grafos FP16 mixtos que distribuye upstream se convierten a FP32 al importar en Inference Engine, por lo que no aportan velocidad y no se incluyen.

## Requisitos de hardware

- Tamaño de los artefactos: SOMA 757 MB (`.sentis`) / 758 MB (`.onnx`); Unitree G1 733 MB (`.sentis`) / 734 MB (`.onnx`); repositorio completo de 3.0 GB.
- VRAM estimada: no disponible de forma explícita; con pesos FP32 de aproximadamente 0,75 GB por modelo, el consumo de memoria debe contemplar además las activaciones del grafo, no cuantificadas en la documentación.
- GPU recomendadas: no disponible. La documentación solo distingue comportamiento en GPU frente a CPU para FP16 y FP32.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de pesos FP32 es compatible con GPUs de consumo con suficiente VRAM, pero no se especifica un mínimo.
- Opciones de despliegue: Unity Inference Engine 2.6.1 o superior (archivos `.sentis`), importación de ONNX en Unity Inference Engine, y ejecución de los ONNX con cualquier runtime compatible con opset 17.
- Latencia y throughput: no disponibles. La model card afirma generación de movimiento en tiempo real, sin cifras concretas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de generación de movimiento ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio contiene únicamente los modelos: no incluye las mociones de ejemplo ni los datos de entrenamiento de MotionBricks.
- Los pesos no están cuantizados; Uint8 degrada la salida de forma inaceptable según el autor, y FP16 es aproximadamente 4 veces más lento en CPU.
- Los grafos FP16 mixtos de upstream no se incluyen porque Inference Engine los convierte a FP32 al importar, sin ganancia de velocidad.
- La licencia es la NVIDIA Open Model Agreement, que permite uso comercial y redistribución de modelos modificados sujeto a sus términos; es necesario revisar el acuerdo completo antes de desplegar en producción.
- El software MotionBricks usa licencia Apache 2.0, distinta de la de los pesos; no debe confundirse la licencia del código con la del modelo.
- La variante Unitree G1 incorpora una modificación del grafo (sustitución de un nodo `If` por `Squeeze`) para compatibilidad con Inference Engine; aunque el autor indica que las salidas no cambian, conviene verificarlo en el caso de uso concreto.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas por no ser un modelo lingüístico; tampoco se detallan limitaciones de generalización a esqueletos distintos de SOMA y Unitree G1.
- El tag `v1` identifica los ficheros usados por una release del paquete; futuras subidas usarán un tag nuevo, por lo que conviene fijar versiones en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/julienkay/MotionBricks-inference-engine
- Modelo base en HuggingFace: https://huggingface.co/nvidia/MotionBricks
- Paper: https://arxiv.org/abs/2604.24833
- Página del proyecto: https://nvlabs.github.io/motionbricks/
- Software MotionBricks (GitHub): https://github.com/NVlabs/motionbricks
- Documentación del paquete Unity: https://docs.doji-tech.com/tools.doji.motionbricks
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
