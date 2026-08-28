# OpenExplorer/petr_efficientnetb3

## Resumen

PETR (Position Embedding Transformer) es un modelo de detección de objetos 3D en escenas de conducción autónoma que introduce la posición 3D directamente en el decodificador Transformer, evitando la construcción explícita de un mapa BEV (Bird's Eye View). Esta versión, publicada por OpenExplorer (Horizon Robotics), sustituye el backbone original del PETR (ResNet) por EfficientNet-b3, lo que permite extraer características de imágenes multivista de forma más eficiente. El modelo procesa simultáneamente seis cámaras con imágenes de 512×1408 píxeles y predice 900 cajas de detección 3D con 10 clases y 11 parámetros de regresión (centro, tamaño, orientación y velocidad).

La relevancia de este modelo radica en su capacidad para ejecutarse en hardware embebido de Horizon Robotics (serie J6) con métricas de rendimiento ya medidas, lo que lo convierte en una opción práctica para despliegues en vehículos reales. Aunque el paper original (arXiv:2203.05625) utiliza ResNet, esta variante con EfficientNet-b3 está optimizada para el toolchain de Horizon, con soporte para cuantización (calibration, QAT) y despliegue en los chips J6M y J6P. El repositorio de HuggingFace contiene los pesos del modelo, aunque la licencia se indica como "other" sin especificar términos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PETR Transformer (decodificador con atención 3D) + backbone EfficientNet-b3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imágenes) |
| Tipos de cuantizacion | float, calibration (post-entrenamiento), QAT, HBM (según métricas de precisión) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | other (no se especifica términos) |
| Formato de pesos | no disponible (repositorio de 1.1 GB, probablemente safetensors o pytorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PETR original: EfficientNet-b3 extrae características de seis vistas de cámara, que se asocian con posiciones 3D mediante una codificación posicional sinusoidal 3D (SinePositionalEncoding3D). El PETRTransformer (con 900 queries, 6 vistas y dimensiones de embedding de 256) interactúa directamente con estas características codificadas en 3D para predecir cajas de detección 3D, sin necesidad de construir un BEV explícito. El head de detección (PETRHead) produce 900×21 salidas: 10 puntuaciones de clase y 11 valores de regresión (centro xyz, dimensiones wlh, orientación sen/cos y velocidad vxvy). La función de pérdida combina FocalLoss para clasificación y L1Loss para regresión, con emparejamiento húngaro tipo Detr3dTarget.

No se proporcionan detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, si se usó RLHF o DPO). El paper original describe el entrenamiento en el dataset nuScenes, pero esta variante con EfficientNet-b3 puede haber sido entrenada con un pipeline diferente. La información disponible solo indica que el backbone se ha cambiado respecto al repositorio oficial, que usa ResNet. No hay datos sobre el tamaño del dataset ni las épocas de entrenamiento.

## Capacidades

- Detección de objetos 3D en escenas de conducción: predice cajas 3D con clase, centro, dimensiones, orientación y velocidad para 10 clases (típicamente vehículos, peatones, ciclistas, etc.).
- Procesamiento multivista: acepta 6 imágenes de cámara simultáneamente (formato `(B,6,3,512,1408)`), lo que permite una percepción periférica completa.
- Inferencia sin construcción de BEV: el uso de codificación posicional 3D directamente en el Transformer reduce la complejidad computacional y mejora la eficiencia.
- Compatibilidad con cuantización: soporta calibración post-entrenamiento, QAT y HBM (High Bandwidth Memory) para despliegue en hardware embebido.
- Optimizado para chips Horizon J6: métricas de rendimiento medidas en J6M y J6P, con soporte para la herramienta `hrt_model_exec`.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, tool calling ni agentes. Su ámbito es exclusivamente la percepción visual 3D.

## Casos de uso

- Conducción autónoma (nivel 2+): el modelo puede integrarse en sistemas de percepción para detectar vehículos, peatones y otros objetos en tiempo real, proporcionando información 3D precisa para la planificación de trayectorias.
- Sistemas avanzados de asistencia al conductor (ADAS): su baja latencia (33 ms en J6M) lo hace adecuado para funciones como frenado de emergencia o control de crucero adaptativo, donde la detección 3D es crítica.
- Flotas de vehículos comerciales: desplegado en unidades de computación embebida (J6) para monitorización de entorno en camiones o autobuses, mejorando la seguridad en entornos urbanos.
- Robótica móvil: aunque diseñado para conducción, puede adaptarse a robots con cámaras múltiples para navegación en entornos dinámicos, aprovechando su salida de cajas 3D.
- Investigación en percepción 3D: sirve como punto de partida para estudiar arquitecturas Transformer con codificación posicional 3D, comparando su rendimiento con otros métodos BEV.
- Validación de toolchains de despliegue: al estar optimizado para Horizon OpenExplorer, es un modelo de referencia para evaluar el flujo de cuantización y despliegue en los chips J6.

## Benchmarks y rendimiento

Los datos de precisión y rendimiento se proporcionan para la configuración `march = March.NASH_M` (chip J6M) con HEAL 0.0.2, hbdk4-compiler 4.11.11 y horizon_plugin_pytorch 3.3.10.

**Precisión (J6M)**

| Metrica | float | calibration | qat | hbm |
|---|---|---|---|---|
| NDS | 0.3881 | 0.3679 | 0.38 | 0.38 |
| mAP | 0.3031 | 0.2807 | 0.2942 | 0.2942 |

**Rendimiento (latencia y FPS)**

| March | Latencia (ms) | FPS | Memoria (DDR) |
|---|---|---|---|
| J6M | 33.13 | 30.51 | 101.00 MB |
| J6P | 21.56 | 186.12 | 105.30 MB |
| J6B | no disponible | no disponible | no disponible |

La metodología: FPS medido con un solo núcleo y ocho hilos; latencia con un solo núcleo y un solo hilo; memoria es el uso máximo de DDR. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Plataforma objetivo: chips Horizon Robotics serie J6 (J6M, J6P, J6B). El modelo está optimizado para el toolchain OpenExplorer (HEAL).
- VRAM: no se especifica VRAM de GPU, sino uso de memoria DDR en los chips J6: 101 MB (J6M) y 105.3 MB (J6P) en inferencia.
- GPU recomendadas: no aplica, el despliegue está pensado para hardware embebido de Horizon, no para GPUs de propósito general.
- Compatibilidad con consumer GPU: no se indica. El modelo podría ejecutarse en GPU estándar con PyTorch, pero no hay métricas ni soporte oficial.
- Opciones de despliegue: se usa la herramienta `hrt_model_exec` para evaluación de rendimiento y el flujo de cuantización de Horizon (calibration, QAT). No se mencionan vLLM, llama.cpp u otras herramientas.
- Latencia y throughput: en J6M, 33.13 ms por inferencia (30.51 FPS); en J6P, 21.56 ms (186.12 FPS). Estos valores son para el modelo completo con 6 cámaras.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Modelos similares en el dominio de detección 3D BEV son BEVFormer (con ResNet50) y DETR3D, ambos con arquitecturas Transformer. Sin embargo, no se han publicado resultados de estos modelos en las mismas condiciones (hardware J6, mismo dataset). Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos. Es posible que el uso comercial esté restringido o requiera acuerdo con Horizon Robotics. Se recomienda contactar con el autor antes de usar en producción.
- Sin información sobre sesgos: al ser un modelo de percepción, puede tener sesgos en la detección de ciertos tipos de objetos o condiciones de iluminación, pero no se han documentado.
- Riesgo de alucinación: en el contexto de detección de objetos, puede generar falsos positivos o cajas incorrectas en escenarios complejos (oclusiones, condiciones climáticas adversas). No hay métricas de robustez.
- Limitaciones de contexto: el modelo solo procesa imágenes de 512×1408 píxeles, por lo que la resolución original (900×1600) se reduce, lo que puede afectar la detección de objetos pequeños.
- Dependencia del hardware: el rendimiento indicado (latencia, FPS) es específico de los chips J6. En otras plataformas, el rendimiento será diferente y no está garantizado.
- Formato de pesos no documentado: no se indica si los pesos están en safetensors, PyTorch u otro formato, lo que puede complicar la carga en frameworks externos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenExplorer/petr_efficientnetb3
- Repositorio oficial PETR (megvii-research): https://github.com/megvii-research/PETR
- Paper original (arXiv): https://arxiv.org/abs/2203.05625
- Blog de Horizon sobre despliegue en J6: https://developer.horizon.auto/blog/14091
- Guía de benchmark AI (OpenExplorer): https://doc.oe.horizon.auto/en/guide/model_deployment/board_deployment/ai_benchmark.html
