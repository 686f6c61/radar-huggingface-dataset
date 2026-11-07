# Liserk/Kimodo-SOMA-RP-v1.2

## Resumen

Kimodo-SOMA-RP-v1.2 es un modelo de difusión para la generación de movimiento cinemático humano en 3D, desarrollado por NVIDIA Research (laboratorio SIL). A diferencia de los modelos de lenguaje, no produce texto: genera animaciones esqueléticas de cuerpo completo a partir de un prompt de texto y/o restricciones de movimiento (poses, posiciones de efectores finales, trayectorias y waypoints). Forma parte de la familia Kimodo, que incluye variantes entrenadas sobre distintos esqueletos (SOMA de 30 articulaciones, SMPLX de 22 y el robot humanoide Unitree G1 de 34).

La arquitectura es un transformer de dos etapas con formulación de difusión, de aproximadamente 282 millones de parámetros. Trabaja sobre el esqueleto SOMA de 30 articulaciones y está entrenado con el dataset propietario Bones Rigplay, que comprende 700 horas de captura de movimiento con descripciones textuales asociadas. La salida son rotaciones articulares y traslación de la raíz a 30 fps, con una duración máxima de 10 segundos (300 fotogramas).

La versión 1.2 corrige una fuga de datos de la v1.1 (secuencias de test de BONES-SEED que habían entrado en el conjunto de entrenamiento), lo que la convierte en la referencia válida para comparar en el Motion Generation Benchmark. Reduce el deslizamiento de pies (*foot skating*) y mantiene la precisión de restricciones, a costa de puntuaciones ligeramente inferiores en seguimiento de texto (R-precision/FID). Está publicada bajo la NVIDIA Open Model License y declarada apta para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con transformer de dos etapas (*novel two-stage transformer*) |
| Parametros totales | 283.281.777 (282 M según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; duración máxima de 10 s (300 fotogramas a 30 fps) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (las entradas de texto no declaran cobertura lingüística) |
| Licencia | NVIDIA Open Model License (etiqueta `license: other`) |
| Formato de pesos | safetensors |
| Esqueleto de salida | SOMA de 30 articulaciones |
| Entradas | Texto (string), duración (entero), restricciones de pose (matriz) |
| Salidas | Traslación de raíz (`num_frames` x 3) y rotaciones articulares (`num_frames` x 30 x 3 x 3) |
| Frecuencia de salida | 30 fps |
| Runtime | PyTorch |
| Hardware compatible | NVIDIA Ampere, Blackwell y Lovelace |
| Sistemas operativos | Linux, Windows |
| Librería | `kimodo` |
| Tamaño del repo | 1,1 GB |

## Arquitectura y entrenamiento

Kimodo emplea un transformer de dos etapas formulado como modelo de difusión. La generación parte de ruido y se condiciona conjuntamente por el texto, la duración solicitada y, opcionalmente, restricciones cinemáticas: posiciones 3D de articulaciones, matrices de rotación 3x3, dirección de orientación (*heading*) 2D y posición de la raíz en 2D, indexadas por fotograma. El modelo produce directamente rotaciones articulares y traslación de raíz sobre el esqueleto SOMA de 30 articulaciones a 30 fps, con un máximo de 300 fotogramas por generación.

El entrenamiento se realizó sobre el dataset propietario Bones Rigplay: 700 horas de captura de movimiento humano con descripciones textuales correspondientes, con división 90 %/10 % entrenamiento/test y diversas aumentaciones para ampliar la variedad de texto y movimiento. El volumen de texto asociado se declara por debajo de mil millones de tokens. La recolección de datos fue automática/sensor y el etiquetado híbrido (automático y humano). La v1.2 se reentrenó sobre particiones corregidas para eliminar la filtración de secuencias de test de BONES-SEED presente en la v1.1. No se especifica en la información disponible si se emplearon RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de animación esquelética 3D de cuerpo completo a partir de texto.
- Control mediante restricciones cinemáticas: poses de cuerpo completo, posiciones de efectores finales, trayectorias y waypoints.
- Condicionamiento por duración explícita (número de fotogramas, hasta 300).
- Salida compatible con pipelines de animación: rotaciones articulares en matrices 3x3 y traslación de raíz.
- Retargeting a otros esqueletos dentro de la familia Kimodo (SMPLX de 22 articulaciones, Unitree G1 de 34 articulaciones), mediante las variantes correspondientes del modelo.
- Orientado a generación de datos sintéticos de movimiento humano.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento; es un modelo generativo específico de movimiento.

## Casos de uso

- **Animación para videojuegos y medios**: generación de ciclos y clips de movimiento de hasta 10 segundos a partir de descripciones textuales, integrables en pipelines de animación existentes mediante las rotaciones articulares y la traslación de raíz que produce el modelo.
- **Demostraciones para robots humanoides**: la familia incluye variantes retargetizadas al esqueleto del Unitree G1 (34 articulaciones), lo que permite generar trayectorias de referencia para aprendizaje por imitación y validación de políticas.
- **Gemelos digitales e simulaciones industriales**: generación de movimiento de humanos digitales en entornos simulados, con control de trayectorias y waypoints para que el avatar siga rutas concretas dentro de la escena.
- **Datos sintéticos para entrenamiento**: producción de pares movimiento-texto a escala para aumentar datasets de captura de movimiento, aprovechando el condicionamiento por restricciones para cubrir casos poco representados.
- **Previsualización rápida (*previs*)**: generación de bloqueos de animación a partir de un guion textual y poses clave, útil para validar timing y composición antes de la captura definitiva.
- **Prototipado de interacción en tiempo de diseño**: iteración sobre variantes de movimiento con restricciones de efectores finales (por ejemplo, mantener las manos en una posición) para ajustar la animación sin edición manual fotograma a fotograma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas del Motion Generation Benchmark en el repositorio de código (`nv-tlabs/kimodo`) y señala que la v1.2 es la versión válida para comparar, tras eliminar la filtración de datos de la v1.1. No se incluyen cifras concretas de R-precision, FID ni métricas de deslizamiento de pies en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 282 M parámetros en safetensors el peso en precisión completa ronda 1,1 GB, pero no se documenta el consumo real en ejecución.
- GPU recomendadas: arquitecturas NVIDIA Ampere (A100, A10), Lovelace (RTX 4090, L40) y Blackwell, según la compatibilidad declarada por el fabricante.
- Compatibilidad con GPU de consumo: previsiblemente sí en la gama RTX con arquitectura Lovelace o superior, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: PyTorch como runtime declarado; la librería `kimodo` y el repositorio `nv-tlabs/kimodo` proporcionan el código de inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Sistemas operativos soportados: Linux y Windows.

## Comparativa con modelos similares

| Modelo | Parámetros | Esqueleto | Dataset de entrenamiento | Duración máxima | Licencia |
|---|---|---|---|---|---|
| Kimodo-SOMA-RP-v1.2 | 282 M | SOMA (30 articulaciones) | Bones Rigplay (propietario, 700 h) | 10 s (300 fotogramas) | NVIDIA Open Model License |
| Kimodo-SOMA-SEED | No disponible | SOMA (30 articulaciones) | Bones-SEED (abierto) | No disponible | No disponible |
| Kimodo-SMPLX-RP | No disponible | SMPLX-body (22 articulaciones) | Bones Rigplay (propietario) | No disponible | No disponible |
| Kimodo-G1-RP | No disponible | Unitree G1 (34 articulaciones) | Bones Rigplay retargetizado | No disponible | No disponible |

Las variantes de la familia Kimodo comparten arquitectura y difieren en el esqueleto y el dataset de entrenamiento. No se dispone de datos de benchmarks ni de parámetros de las variantes alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa con modelos de otras familias.

## Limitaciones y advertencias

- Duración máxima de generación de 10 segundos (300 fotogramas a 30 fps); no se documenta extensión a secuencias más largas.
- El modelo está atado al esqueleto SOMA de 30 articulaciones; para otros esqueletos es necesario recurrir a las variantes específicas de la familia.
- La v1.1 presentaba filtración de secuencias de test de BONES-SEED en el entrenamiento; solo la v1.2 emplea particiones corregidas, por lo que las comparaciones con resultados de la v1.1 no son válidas.
- Respecto a la v1.1, la v1.2 reduce el deslizamiento de pies pero obtiene puntuaciones de seguimiento de texto (R-precision/FID) ligeramente inferiores.
- El dataset de entrenamiento (Bones Rigplay) es propietario, lo que limita la reproducibilidad del entrenamiento y el análisis de sesgos de los datos.
- No se documenta la cobertura lingüística de las entradas de texto ni el comportamiento fuera del inglés.
- No se documentan sesgos específicos ni tasas de error; el fabricante recomienda pruebas iterativas con datos del caso de uso concreto antes de desplegar en producción.
- La licencia NVIDIA Open Model License debe revisarse para confirmar las condiciones exactas de uso comercial, redistribución y atribución antes de integrar el modelo en un producto.

## Enlaces

- Modelo en Hugging Face (autor): https://huggingface.co/Liserk/Kimodo-SOMA-RP-v1.2
- Modelo en Hugging Face (NVIDIA): https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.2
- Variante ArdyRep v1.2: https://huggingface.co/nvidia/Kimodo-SOMA-RP-ArdyRep-v1.2
- Repositorio de código: https://github.com/nv-tlabs/kimodo
- Página del proyecto: https://research.nvidia.com/labs/sil/projects/kimodo/
- Informe técnico: https://research.nvidia.com/labs/sil/projects/kimodo/assets/kimodo_tech_report.pdf
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license
