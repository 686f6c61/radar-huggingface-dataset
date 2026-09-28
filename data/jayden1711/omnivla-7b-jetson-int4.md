# jayden1711/omnivla-7b-jetson-int4

## Resumen

OmniVLA 7B jetson-int4 es un paquete de pesos pre-cuantizados del modelo OmniVLA, un modelo visión-lenguaje-acción (VLA) de aproximadamente 7 000 millones de parámetros diseñado para navegación de robots. La versión original de OmniVLA fue desarrollada por Noriaki Hirose, Catherine Glossop, Dhruv Shah y Sergey Levine (arXiv:2509.19480), mientras que estos pesos cuantizados han sido preparados por el usuario `jayden1711` a partir del checkpoint `NHirose/omnivla-original`.

El objetivo de esta cuantización es conseguir que un modelo VLA de 7B quepa y se ejecute en una Jetson Orin Nano de 8 GB (arquitectura Ampere, sm_87), un dispositivo de borde con recursos muy limitados. Para ello, el modelo de lenguaje se cuantiza a int4 con GPTQ (escalas por canal, empaquetado para el kernel Marlin FP16xINT4 sobre 224 capas lineales), los codificadores de visión SigLIP y DINOv2 a 4 bits con HQQ (group size 64, repackado para GemLite sobre 204 capas lineales) y el resto de componentes (embeddings, normas, proyector y cabeza de acción) se mantienen en fp16.

Es relevante ahora porque demuestra que un modelo de robótica multimodal de 7B puede desplegarse en hardware de borde de bajo consumo sin degradar de forma significativa la calidad de conducción respecto a las acciones en bf16. Según la propia model card, el error de conducción frente a la trayectoria humana es de 1,314 con estos pesos frente a 1,330 en bf16, con una diferencia no significativa (p = 0,40), y reduce la latencia a menos de la mitad respecto a una cuantización bitsandbytes NF4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) multimodal: LLM derivado de Llama 2 + codificadores de vision SigLIP y DINOv2 + proyector de pose y cabeza de accion |
| Parametros totales | Aproximadamente 7 000 millones (segun nomenclatura del modelo; no disponible el desglose exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LLM en GPTQ int4 con escalas por canal (Marlin FP16xINT4); encoders de vision en HQQ 4-bit group size 64 (GemLite); resto en fp16 |
| Idiomas soportados | no disponible (el LLM subyacente deriva de Llama 2) |
| Licencia | MIT; sujeto adicionalmente a la Llama 2 Community License y su Acceptable Use Policy |
| Formato de pesos | Shards `.pt` pre-empaquetados (`marpc/shard_*.pt`, 15 shards de ~256 MB) + `base.safetensors` (fp16). No es un checkpoint de transformers |
| Tamano del repositorio | 4,4 GB |
| Modelo base | NHirose/omnivla-original (revision e36a84d) |
| Dispositivo objetivo | Jetson Orin Nano 8 GB (Ampere, sm_87) |

## Arquitectura y entrenamiento

OmniVLA es un modelo visión-lenguaje-acción de tipo transformer multimodal. Combina un modelo de lenguaje derivado de Llama 2 con dos codificadores visuales, SigLIP y DINOv2, y una cabeza de acción encargada de producir waypoints de navegación. El modelo acepta objetivos multimodales: metas de pose y metas de imagen, y admite además instrucciones en lenguaje natural. Según el paper asociado, OmniVLA generaliza a entornos no vistos, es robusto ante modalidades escasas y supera a baselines especialistas en distintas modalidades.

Esta ficha corresponde únicamente a la versión cuantizada para Jetson, no al entrenamiento del modelo original. La cuantización se construyó sobre el checkpoint `NHirose/omnivla-original` en la revisión `e36a84d`. El LLM se cuantizó con GPTQ usando 128 muestras reservadas del dataset FrodoBots para la calibración, con escalas por canal y empaquetado para Marlin; los codificadores SigLIP y DINOv2 se cuantizaron con HQQ a 4 bits (group size 64) y se repacan para GemLite en el momento de la carga. El runtime además descarta tokens de objetivo no utilizados y poda el 75 % de los tokens de las imágenes de cámara. `build/build_model.sh` permite reconstruir estos ficheros en una Kaggle T4 en unas 0,4 horas de GPU, y `build/verify_build.py` compara una build contra `TENSOR_SHA256.json`.

## Capacidades

- Navegación de robots guiada por objetivos de pose (waypoints normalizados).
- Navegación guiada por imágenes objetivo (image-goal).
- Seguimiento de instrucciones en lenguaje natural novedosas, según el paper de OmniVLA.
- Fusión de percepción multimodal basada en dos codificadores visuales (SigLIP y DINOv2).
- Producción de acciones de navegación (secuencias de waypoints) mediante cabeza de acción dedicada.
- Inferencia en tiempo real en hardware de borde (Jetson Orin Nano 8 GB).
- No se documenta en la información disponible soporte de tool calling, function calling ni razonamiento multi-paso tipo agente. Se trata de un modelo VLA orientado a control de navegación, no de un asistente de texto general.

## Casos de uso

- Navegación autónoma de robots móviles con objetivo de pose: el modelo recibe un waypoint normalizado y genera acciones de navegación con una latencia de 424 ms en Jetson Orin Nano 8 GB, lo que permite cerrar el bucle de control en robots de interior.
- Navegación guiada por imagen: útil en robots que deben alcanzar una posición definida visualmente; en la Jetson tarda 1056 ms en metas nuevas y 863 ms cuando la meta no cambia, aprovechando la reutilización de tokens de objetivo.
- Robótica de borde con presupuesto energético reducido: al ejecutarse íntegramente en una Jetson Orin Nano de 8 GB con 1055 MB (pose) o 851 MB (imagen) de margen de RAM, encaja en plataformas sin conectividad ni GPU de servidor.
- Seguimiento de instrucciones en lenguaje natural para navegación: robots que interpretan órdenes textuales y las traducen en trayectorias, aprovechando la capacidad del modelo original de seguir instrucciones novedosas.
- Robots de reparto o logística interior: navegación hacia puntos de entrega definidos por pose o por referencia visual, con latencias compatibles con velocidades de desplazamiento moderadas.
- Base para fine-tuning en nuevos robots o modalidades: al derivar de un modelo preentrenado multimodal, sirve como punto de partida para adaptar la política de navegación a sensores y cámaras distintos.
- Prototipado e investigación en VLA: permite reproducir el pipeline completo (cuantización, empaquetado Marlin/HQQ y despliegue) sin necesidad de GPU de centro de datos, reconstruyendo los pesos en una Kaggle T4.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la propia model card: 100 fotogramas de FrodoBots en Jetson Orin Nano 8 GB (MAXN SUPER), en prueba de conducción con objetivo de imagen y medida en bucle abierto (predicción única). Los errores de acción se expresan en unidades de acción (espaciado de waypoints normalizado); menor es mejor.

| Metrica | Estos pesos (GPTQ/HQQ int4) | bitsandbytes NF4 | bf16 (GPU en nube) |
|---|---|---|---|
| Latencia, objetivo de pose | 424 ms | 1416 ms | no aplica |
| Latencia, objetivo de imagen | 1056 ms (863 ms con objetivo sin cambios) | 2146 ms | no aplica |
| Margen de RAM, pose / imagen | 1055 / 851 MB | 827 / 575 MB | no cabe |
| Distancia respecto a las acciones en bf16 | 0,48 | 0,30 | 0 |
| Error de conducción frente a la trayectoria humana | 1,314 | 1,317 | 1,330 |

Según la model card, el error de conducción no difiere de forma significativa respecto a NF4 (p = 0,76) ni respecto a bf16 (p = 0,40). No se han publicado en la información disponible resultados de benchmarks estándar de texto (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada.

## Requisitos de hardware

- Dispositivo objetivo y validado: Jetson Orin Nano 8 GB, arquitectura Ampere sm_87, con JetPack 6.2 y SSD NVMe.
- Consumo de memoria medido: margen de RAM libre de 1055 MB (objetivo de pose) y 851 MB (objetivo de imagen) sobre 8 GB.
- La variante en bf16 no cabe en la Jetson; requiere GPU en la nube (tamaño y modelo concreto no disponibles).
- El paquete Marlin se empaquetó para Marlin por canal en el commit 1f25790 y exige el runtime correspondiente; Marlin agrupado da resultados incorrectos en sm_87 y no se utiliza.
- Opciones de despliegue: exclusivamente el runtime de `github.com/jayden1711/omnivla-jetson` (`deploy/setup_jetson.sh` y `deploy/launch.sh`). No es un checkpoint de transformers, por lo que no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida en la Jetson (MAXN SUPER): 424 ms con objetivo de pose; 1056 ms con objetivo de imagen nuevo y 863 ms con objetivo sin cambios.
- Throughput no disponible.

## Comparativa con modelos similares

La información disponible no incluye comparativas con otros modelos VLA de navegación. La única comparación documentada es entre distintas estrategias de cuantización del mismo modelo:

| Version | Cuantizacion | Latencia (pose / imagen) | Distancia a bf16 | Error vs. trayectoria humana |
|---|---|---|---|---|
| Estos pesos | GPTQ int4 (Marlin) + HQQ 4-bit | 424 ms / 1056 ms | 0,48 | 1,314 |
| bitsandbytes NF4 | NF4 | 1416 ms / 2146 ms | 0,30 | 1,317 |
| bf16 | Sin cuantizar | no cabe en Jetson | 0 | 1,330 |

No disponible la comparación con otros modelos VLA de la misma categoría (por ejemplo, alternativas de navegación multimodal) en la información proporcionada.

## Limitaciones y advertencias

- La precisión se midió en bucle abierto, sobre predicciones únicas y con fotogramas de FrodoBots dentro de la distribución; no hay validación de conducción en bucle cerrado.
- Solo se validaron los modos de objetivo de pose y objetivo de imagen en la Jetson.
- La calibración GPTQ usó 128 muestras reservadas de FrodoBots, por lo que otros robots y cámaras pueden comportarse de forma distinta.
- Los shards Marlin están empaquetados para Marlin por canal en el commit 1f25790 y requieren el runtime exacto; Marlin agrupado produce resultados incorrectos en sm_87.
- No es un checkpoint de transformers: no puede cargarse directamente con las librerías habituales ni desplegarse con vLLM, llama.cpp, Ollama o TGI.
- La licencia es MIT, pero el modelo de lenguaje deriva de Llama 2, por lo que su uso queda sujeto también a la Llama 2 Community License y a la Acceptable Use Policy de Meta. Es necesario revisar ambas condiciones antes de un uso comercial.
- No se incluyen imágenes ni datos de FrodoBots en el repositorio.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayden1711/omnivla-7b-jetson-int4
- Repositorio del runtime para Jetson: https://github.com/jayden1711/omnivla-jetson
- README del runtime: https://github.com/jayden1711/omnivla-jetson/blob/main/README.md
- Paper de OmniVLA: https://arxiv.org/abs/2509.19480
- Version HTML del paper: https://arxiv.org/html/2511.01210v2
- Repositorio original de OmniVLA: https://github.com/NHirose/OmniVLA
- Checkpoint original: https://huggingface.co/NHirose/omnivla-original
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Modelos para Jetson (Jetson AI Lab): https://www.jetson-ai-lab.com/models/
