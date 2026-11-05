# camenduru/Kimodo-SMPLX-RP-v1

## Resumen

Kimodo-SMPLX-RP-v1 es un modelo de difusión para la generación de movimiento humano 3D sobre el esqueleto SMPL-X de 22 articulaciones, desarrollado por NVIDIA Labs (grupo SIL). A partir de un prompt de texto y/o restricciones cinematicas (poses de cuerpo completo, posiciones de end-effectors, trayectorias y waypoints), genera animaciones esqueleticas con traslación de raíz y rotaciones articulares a 30 fps. Forma parte de la familia Kimodo (Kinematic Motion Diffusion), que incluye variantes sobre el esqueleto SOMA de 30 articulaciones y sobre el robot humanoide Unitree G1 de 34 articulaciones, entrenadas tanto con el dataset propietario Bones Rigplay como con el abierto Bones-SEED.

El modelo resuelve el problema del control fino en la generación de movimiento: no se limita a sintetizar una animación plausible a partir de texto, sino que permite imponer restricciones espaciales y temporales concretas, lo que lo hace util para pipelines de animación donde la precisión y el control son requisitos. Su arquitectura es un transformer de dos etapas con un total de 282.790.161 parámetros (aproximadamente 282 M), según los pesos en safetensors publicados en el repositorio.

La relevancia actual del modelo radica en su aplicabilidad a robótica humanoide (demostraciones para el G1), gemelos digitales, simulación industrial y generación de datos sintéticos de movimiento, además de la animación para videojuegos y medios. La versión publicada aquí, Kimodo-SMPLX-RP, está entrenada con el dataset propietario Bones Rigplay y se distribuye bajo la licencia NVIDIA Internal Scientific Research and Development Model License, restringida a investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con transformer de dos etapas (novel two-stage transformer) |
| Parametros totales | 282.790.161 (282 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la duración máxima de secuencia es de 10 segundos (300 frames a 30 fps) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la entrada de texto se documenta como string, sin lista de idiomas) |
| Licencia | NVIDIA Internal Scientific Research and Development Model License (uso no comercial, solo investigación) |
| Formato de pesos | safetensors |
| Esqueleto de salida | SMPL-X body-only, 22 articulaciones |
| Frecuencia de salida | 30 fps |
| Libreria | kimodo |
| Runtime | PyTorch |
| Hardware compatible | NVIDIA Ampere, Blackwell y Lovelace |
| Sistemas operativos | Linux, Windows |
| Geografia de despliegue | Global |

## Arquitectura y entrenamiento

Kimodo emplea una arquitectura de difusión basada en un transformer de dos etapas, diseñada específicamente para la generación de movimiento cinematico condicionada. El modelo recibe como entradas texto, duración en número de frames y restricciones de pose (posiciones 3D de articulaciones, matrices de rotación 3x3, dirección de heading 2D y posición de raíz 2D), y produce como salida traslación de raíz (matriz de `num_frames` x 3) y rotaciones articulares (matriz de `num_frames` x 22 x 3 x 3). La duración máxima soportada es de 300 frames, equivalentes a 10 segundos a 30 fps.

El entrenamiento se realizó sobre el dataset propietario Bones Rigplay, compuesto por 700 horas de captura de movimiento humano con descripciones textuales correspondientes, con un volumen de texto inferior a mil millones de tokens. La recolección de datos combinó métodos automáticos y sensores, con etiquetado híbrido (automático/sensores y humano). Se aplicaron diversas aumentaciones para ampliar la variedad de texto y movimiento, y los movimientos fueron retargeteados al esqueleto SMPL-X body-only para el entrenamiento. El split es 90 % entrenamiento y 10 % test. La model card no detalla si se emplearon técnicas de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de animación esquelética 3D de cuerpo completo a partir de texto.
- Control mediante restricciones cinematicas: poses de cuerpo completo, posiciones de end-effectors, trayectorias y waypoints.
- Condicionamiento por duración explícita (número de frames), con máximo de 300 frames (10 segundos a 30 fps).
- Salida de traslación de raíz y rotaciones articulares sobre esqueleto SMPL-X de 22 articulaciones.
- Generación de movimiento para demostraciones de robótica humanoide (la familia incluye variantes retargeteadas al Unitree G1).
- Generación de datos sintéticos de movimiento para gemelos digitales y simulación industrial.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking.
- No se documenta capacidad multilingüe explícita.

## Casos de uso

- Animación para videojuegos: el modelo genera ciclos de movimiento y animaciones de personaje a partir de descripciones textuales y restricciones de pose, lo que permite a animadores prototipar variantes rápidamente sin captura de movimiento adicional.
- Producción audiovisual y medios: creación de movimiento de personajes digitales para secuencias cortas (hasta 10 segundos) con control de trayectoria y waypoints, útil en previsualización y blockout de escenas.
- Datos sintéticos para entrenamiento de modelos de percepción: generación de movimiento humano etiquetado con texto para aumentar datasets de visión por computador o de análisis de movimiento.
- Gemelos digitales e simulación industrial: simulación de movimiento de operarios digitales en entornos industriales para análisis ergonómico y de flujos de trabajo, aprovechando el condicionamiento por trayectorias y posiciones de end-effectors.
- Demostraciones para robótica humanoide: aunque esta variante es SMPL-X, la familia Kimodo incluye modelos retargeteados al Unitree G1, lo que permite generar referencias de movimiento para políticas de control de robots humanoides.
- Investigación en generación de movimiento: el modelo sirve como baseline controlable para experimentos sobre difusión condicionada, restricciones cinematicas y evaluación de realismo de movimiento, con acceso a un technical report con evaluación cuantitativa.
- Prototipado rápido de cinemáticas en motores de juego: integración vía PyTorch en pipelines de exportación de animaciones a formatos de motor, con salida directa de rotaciones y traslación de raíz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al technical report para la evaluación cuantitativa sobre el conjunto de test, pero no incluye cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 282 M parámetros, los pesos en precisión completa ocuparían del orden de 1,1 GB (coherente con el tamaño del repositorio de 1,1 GB), por lo que la VRAM necesaria para los pesos es modesta; el consumo adicional depende de la resolución de la secuencia y del pipeline de difusión, que no se detalla.
- GPU recomendadas según la model card: GeForce RTX 3090, RTX 4090, RTX 5090, NVIDIA A100, L40S, L4, RTX 6000 Ada y RTX A6000.
- Compatibilidad de microarquitectura: NVIDIA Ampere, Blackwell y Lovelace.
- Cabe en GPU de consumo: sí, según los modelos de prueba listados (RTX 3090, 4090 y 5090 figuran como hardware de test).
- Opciones de despliegue: PyTorch como runtime; la librería `kimodo` y el repositorio `nv-tlabs/kimodo` en GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de movimiento).
- Latencia y throughput: no disponibles.
- Sistemas operativos soportados: Linux y Windows.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duración | Esqueleto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimodo-SMPLX-RP-v1 | 282 M | 300 frames (10 s a 30 fps) | SMPL-X, 22 articulaciones | NVIDIA Internal Scientific R&D (no comercial) | HuggingFace (nvidia/Kimodo-SMPLX-RP-v1) |
| Kimodo-SOMA-RP | No disponible | No disponible | SOMA, 30 articulaciones | No disponible en la información | Familia Kimodo |
| Kimodo-SOMA-SEED | No disponible | No disponible | SOMA, 30 articulaciones | No disponible en la información | Familia Kimodo (dataset abierto Bones-SEED) |
| Kimodo-G1-RP | No disponible | No disponible | Unitree G1, 34 articulaciones | No disponible en la información | Familia Kimodo |

No se dispone de datos de benchmarks ni de especificaciones completas de las variantes hermanas en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento entre ellas.

## Limitaciones y advertencias

- Licencia restrictiva: NVIDIA Internal Scientific Research and Development Model License,限ida a investigación no comercial. No apta para uso comercial ni para despliegue en producción sin acuerdo adicional con NVIDIA.
- Duración máxima de 10 segundos (300 frames a 30 fps) por generación, lo que limita secuencias largas sin concatenación externa.
- Entrenada exclusivamente con el dataset propietario Bones Rigplay; no se detalla la diversidad demográfica, cultural o de estilo del corpus, por lo que pueden existir sesgos de movimiento no documentados.
- Riesgo de alucinación cinemática: como modelo generativo de difusión, puede producir movimientos físicamente implausibles (autopenetraciones, deslizamiento de pies, artefactos en articulaciones) que requieren validación.
- Idiomas soportados no documentados: no se especifica qué lenguas acepta el condicionamiento textual, lo que supone un riesgo para aplicaciones multilingües.
- Requiere validación específica del caso de uso antes de integrarse en sistemas de producción, según la propia model card (metodología V-model).
- Dependencia de hardware NVIDIA: el modelo está optimizado para GPUs NVIDIA (Ampere, Blackwell, Lovelace) y no se documenta soporte para CPU u otras aceleradoras.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-step; es un modelo especializado en movimiento, no un LLM de propósito general.
- El repositorio de HuggingFace es un mirror de camenduru (0 descargas, 0 likes) del modelo original de NVIDIA; conviene verificar la integridad y la procedencia de los pesos.

## Enlaces

- HuggingFace (mirror): https://huggingface.co/camenduru/Kimodo-SMPLX-RP-v1
- HuggingFace (original NVIDIA): https://huggingface.co/nvidia/Kimodo-SMPLX-RP-v1
- Repositorio GitHub: https://github.com/nv-tlabs/kimodo
- Página del proyecto: https://research.nvidia.com/labs/sil/projects/kimodo/
- Technical report: https://research.nvidia.com/labs/sil/projects/kimodo/assets/kimodo_tech_report.pdf
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-internal-scientific-research-and-development-model-license/
