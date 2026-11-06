# SleepMastger/srlwam-cosmos-edge-fruit-v1-noise10mm

## Resumen

`srlwam-cosmos-edge-fruit-v1-noise10mm` es un conjunto de cuatro checkpoints de una política robótica de tipo vision-language-action (VLA) desarrollada por el usuario SleepMastger, derivada por ajuste fino del modelo base `nvidia/Cosmos3-Edge-Policy-DROID` de NVIDIA. El modelo está especializado en una tarea concreta de manipulación: abrir un recipiente y recoger una ciruela oscura dentro de un entorno de simulación denominado `fruit_v1_noise10mm`.

El repositorio contiene pesos en formato de checkpoint distribuido nativo de PyTorch, exportados a bfloat16, junto con la configuración del modelo, la normalización, el particionado exacto de trayectorias, metadatos de la política y los resultados de validación. No incluye estado del optimizador ni de recuperación del entrenamiento, y no constituye un paquete de despliegue autónomo para un robot real: requiere la arquitectura y el contrato de preprocesamiento del framework Cosmos.

Su relevancia es acotada y experimental. Se publica como material reproducible de investigación en políticas de manipulación robótica, con métricas de validación en bucle abierto (no tasas de éxito en rollout) y sin calibración de control en el mundo real. El tamaño del repositorio es de 27,0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos Edge policy (modelo base `nvidia/Cosmos3-Edge-Policy-DROID`); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; la política se condiciona a dos imágenes de cámara y dos tokens de estado |
| Tipos de cuantizacion | pesos exportados en bfloat16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | checkpoint distribuido nativo de PyTorch (DCP), exportado a bfloat16 |
| Entrada de la política | 2 imágenes de cámara + propiocepción inicial de 9 dimensiones (2 tokens de estado) |
| Salida de la política | 16 pasos de acción a 10 Hz |
| Tamaño del repositorio | 27,0 GB |
| Librería | `cosmos` |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Edge-Policy-DROID`, una política de control robótico del stack Cosmos de NVIDIA, y se ajusta de forma específica sobre el conjunto de simulación `fruit_v1_noise10mm`. La política consume dos imágenes de cámara y una representación de propiocepción inicial de nueve dimensiones codificada en dos tokens de estado, y emite predicciones de 16 pasos de acción a una frecuencia de 10 Hz. No se dispone de información sobre el número de parámetros, la composición interna del transformer ni los detalles del mecanismo de atención.

El conjunto de datos de ajuste fino consta de 950 trayectorias de entrenamiento y 50 trayectorias reservadas para validación, todas ellas en simulación. El repositorio publica cuatro checkpoints correspondientes a los pasos 2000, 5000, 7500 y 9250; el paso 9250 es el checkpoint guardado más reciente incluido en la publicación, no el paso final del entrenamiento. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, ni el número total de tokens o muestras procesadas más allá de las trayectorias indicadas. La validación se realizó en bucle abierto sobre 200 ventanas fijas reservadas, no mediante rollouts completos.

## Capacidades

- Predicción de acciones robóticas de manipulación: genera secuencias de 16 pasos de acción a 10 Hz condicionadas a observaciones visuales y propioceptivas.
- Control visomotor a partir de dos cámaras: integra dos flujos de imagen simultáneos como entrada de la política.
- Condicionamiento por propiocepción: incorpora un vector de estado inicial de nueve dimensiones mediante dos tokens de estado.
- Ejecución de una tarea específica de picking: abrir un recipiente y recoger una ciruela oscura en el entorno de simulación `fruit_v1_noise10mm`.
- Robustez declarada frente a ruido: el nombre del dataset (`noise10mm`) sugiere entrenamiento con ruido de 10 mm, aunque no se detalla el protocolo exacto.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, agentes multi-paso, visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en políticas VLA de manipulación: el checkpoint permite reproducir y comparar el ajuste fino de Cosmos Edge sobre una tarea de picking con un particionado de datos documentado y métricas de validación en bucle abierto.
- Evaluación de robustez frente a ruido en simulación: el dataset `noise10mm` sirve para estudiar cómo afecta el ruido de 10 mm a la precisión de las acciones predichas y a la precisión del gripper.
- Estudio de curvas de entrenamiento: los cuatro checkpoints (pasos 2000, 5000, 7500 y 9250) permiten analizar la evolución del MAE normalizado y de la precisión del gripper a lo largo del ajuste fino.
- Base para ajuste fino en tareas de recolección de fruta: el modelo puede reutilizarse como punto de partida para entrenar políticas en otros entornos de picking con el framework Cosmos.
- Benchmarking interno de pipelines de simulación a realidad: sirve como referencia cuantitativa (MAE y precisión de gripper en bucle abierto) antes de abordar calibración en un robot físico.
- Docencia y formación en robótica de manipulación: el repositorio incluye configuración, normalización y metadatos que facilitan explicar el contrato de entrada y salida de una política de control.
- Integración en pipelines de evaluación automatizada: los checkpoints pueden cargarse en el framework Cosmos para ejecutar validaciones repetibles sobre ventanas reservadas.

## Benchmarks y rendimiento

Resultados de validación en bucle abierto sobre 200 ventanas fijas reservadas, según la model card del autor:

| Paso | MAE de acción normalizado | Precisión del gripper |
|---|---|---|
| 2000 | 0,030184 | 96,88 % |
| 5000 | 0,025625 | 97,44 % |
| 7500 | 0,023679 | 97,22 % |
| 9250 | 0,023791 | 97,41 % |

El paso 7500 presenta el MAE normalizado más bajo entre los checkpoints validados disponibles en el momento de la selección. El autor advierte explícitamente de que estas cifras corresponden a evaluación en bucle abierto, no a tasas de éxito en rollout, y que no se reclama ningún resultado de control en el mundo real ni calibración física.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 27,0 GB en formato de checkpoint distribuido en bfloat16, lo que da una cota inferior aproximada del espacio necesario para cargar los pesos, pero no se documenta el consumo real en inferencia.
- GPU recomendadas: no disponible. No se especifican modelos de GPU probados (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en GPU de consumo ni en qué modelos.
- Opciones de despliegue: requiere la arquitectura y el contrato de preprocesamiento del framework Cosmos; los archivos no son un paquete ejecutable autónomo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de política de control.
- Latencia y throughput: no disponibles. La política predice 16 pasos de acción a 10 Hz, pero no se publican mediciones de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SleepMastger/srlwam-cosmos-edge-fruit-v1-noise10mm` | Picking de fruta en simulación (`fruit_v1_noise10mm`) | no disponible | no disponible | OpenMDW-1.1 | Hugging Face |
| `SleepMastger/srlwam-cosmos-edge-stack-v2-stride4` | Apilado de dos cubos con Franka en simulación (`stack_v2`), stride temporal 4 | no disponible | no disponible | no disponible | Hugging Face |
| `nvidia/Cosmos3-Edge-Policy-DROID` | Política base Cosmos Edge ajustada sobre DROID | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; las métricas publicadas del modelo descrito corresponden únicamente a su propia tarea y protocolo de validación.

## Limitaciones y advertencias

- Resultados en bucle abierto: las métricas de MAE y precisión del gripper no equivalen a tasas de éxito en rollout ni garantizan un comportamiento correcto en ejecución cerrada.
- Sin validación en el mundo real: el autor declara explícitamente que no se reclama calibración de control físico ni éxito en rollouts reales.
- Dependencia del framework Cosmos: los archivos no son un paquete de despliegue autónomo; requieren la arquitectura y el preprocesamiento del framework, y los componentes adicionales necesarios no están incluidos.
- Especialización estrecha: la política está entrenada para una única tarea (abrir un recipiente y recoger una ciruela oscura) en un entorno de simulación concreto; su generalización a otras tareas u objetos no está documentada.
- Dataset pequeño: 950 trayectorias de entrenamiento y 50 de validación, lo que limita la cobertura de condiciones y aumenta el riesgo de sobreajuste al entorno simulado.
- Checkpoint no final: el paso 9250 es el guardado más reciente incluido en la publicación, no el paso final del entrenamiento.
- Sin estado de recuperación: no se incluyen el optimizador ni el estado de reanudación del entrenamiento, lo que dificulta continuar el ajuste desde estos checkpoints.
- Idiomas: no se documenta ningún soporte lingüístico; el modelo no está orientado a tareas de texto.
- Licencia: OpenMDW-1.1 (etiquetada como `other` en Hugging Face). Es necesario revisar el texto completo en `licenses/OpenMDW-1.1.txt` antes de cualquier uso comercial, ya que las condiciones no se resumen en la información disponible.
- Sesgos y alucinación: no se documentan sesgos conocidos ni evaluación de alucinación; en el contexto de una política de control, el riesgo se traduce en acciones imprecisas o inseguras fuera de la distribución de entrenamiento.
- Sin métricas de latencia ni de throughput: no es posible dimensionar un despliegue en producción con los datos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SleepMastger/srlwam-cosmos-edge-fruit-v1-noise10mm
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Texto de la licencia OpenMDW-1.1: https://huggingface.co/SleepMastger/srlwam-cosmos-edge-fruit-v1-noise10mm/blob/main/licenses/OpenMDW-1.1.txt
- Modelo relacionado (stack_v2, stride 4): https://huggingface.co/SleepMastger/srlwam-cosmos-edge-stack-v2-stride4
- Repositorio auxiliar del autor: https://huggingface.co/SleepMastger/deploy_public
