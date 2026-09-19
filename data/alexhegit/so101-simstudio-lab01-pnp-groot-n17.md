# alexhegit/so101-simstudio-lab01-pnp-groot-n17

## Resumen

`alexhegit/so101-simstudio-lab01-pnp-groot-n17` es un ajuste fino del modelo fundacional de robotica `nvidia/GR00T-N1.7-3B` sobre el dataset de 50 episodios `alexhegit/so101-simstudio-lab01-pnp`, correspondiente al laboratorio Lab 01 de pick-and-place del proyecto SimStudio con el brazo SO-101. Lo publica el usuario `alexhegit` dentro del ecosistema `rocPAI-Forge/so101-simstudio` y se carga con la libreria LeRobot (`GrootPolicy`). El checkpoint tiene 3.144.016.000 parametros y un repositorio de 12,6 GB en safetensors.

Se trata, de forma explicita, de un **resultado negativo documentado**: no es una politica de pick-and-place funcional. Sobre los mismos datos, ACT 6-D alcanza ~58% y MolmoAct2 6-D ~54% en rango completo, mientras que este checkpoint obtiene 0/10 en las tres configuraciones de evaluacion en bucle cerrado y no llega a levantar el cubo (la "z" del cubo se mantiene en ~0,015 respecto al punto de aparicion). Su valor es metodologico: documenta que un ajuste con LLM y vision congelados, acciones relativas de 6 dimensiones con la pinza excluida y 10.000 pasos sobre un dataset de 50 episodios produce un acercamiento razonable (reach 8 cm en 9-10 de 10 intentos) pero ninguna elevacion.

El modelo es relevante ahora como referencia reproducible dentro del laboratorio: fija la configuracion exacta (etiqueta de embodiment `new_embodiment`, batch 4, 10.000 pasos en AMD Instinct MI300X, ~35 minutos, perdida de entrenamiento ~0,03-0,1, checkpoint `010000`) y advierte de que las continuaciones posteriores (30K partiendo de este checkpoint tras cosine lr=0, y 20K con vision descongelada) puntuan 0/10 con un acercamiento peor (reach 8 cm pasa de 9-10/10 a 0-2/10).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de GR00T N1.7: torre de vision y LLM congelados durante el ajuste; el detalle interno del backbone no se documenta en la informacion disponible |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica los pesos en safetensors con un tamano de 12,6 GB) |
| Idiomas soportados | no disponible (modelo de robotica; no se documentan idiomas) |
| Licencia | `nvidia-open-model-license` (heredada del modelo base, no Apache-2.0) |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Pipeline | robotics |
| Modelo base | `nvidia/GR00T-N1.7-3B` |
| Dataset de ajuste | `alexhegit/so101-simstudio-lab01-pnp` (Lab 01, 50 episodios, posiciones articulares) |
| Etiqueta de embodiment | `new_embodiment` |
| Representacion de accion | 6-D `*.pos`, rellenada hasta `max_action_dim` de GR00T; acciones relativas con la pinza excluida |
| Camaras de entrada | `camera_front`, `camera_top`, `camera_wrist` |
| Checkpoint publicado | `010000` (10.000 pasos) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de GR00T N1.7-3B, un modelo fundacional de robotica de tipo vision-language-action que combina observaciones visuales de varias camaras con estado del robot y produce acciones motoras. Durante este ajuste tanto el LLM como la torre de vision permanecieron **congelados**; solo se adapto el modulo de accion al nuevo embodiment (`embodiment_tag=new_embodiment`). Las acciones del dataset se normalizaron como relativas y se excluyo la pinza del calculo relativo; la dimensionalidad de 6-D de las posiciones se rellena hasta `max_action_dim` de GR00T para encajar con la interfaz del modelo base. El ajuste se ejecuto con la libreria LeRobot y la politica `GrootPolicy`.

El entrenamiento uso batch 4 durante 10.000 pasos sobre AMD Instinct MI300X, con un tiempo aproximado de 35 minutos y una perdida de entrenamiento en el rango 0,03-0,1. No se documenta el numero total de tokens, la composicion del dataset ni el uso de RLHF, DPO o tecnicas de alineamiento. La evaluacion en este repositorio parchea ficheros del tokenizer de Cosmos, que estan sujetos a control de acceso, hacia el modelo publico `Qwen/Qwen3-VL-2B-Instruct`. Las acciones relativas **requieren RTC** (real-time chunking), ya que `GrootPolicy.select_action` no esta implementado. Los pesos heredan la NVIDIA Open Model License del modelo base.

## Capacidades

- Ejecucion de una politica de manipulacion de 6 dimensiones sobre el brazo SO-101 en simulacion, con horizonte de ejecucion RTC de 8.
- Procesamiento simultaneo de tres flujos de camara (`camera_front`, `camera_top`, `camera_wrist`) mas el estado articular del robot.
- Fase de acercamiento funcional parcial: `reach_8cm` en 9-10 de cada 10 intentos y `reach_4cm` en 6-7 de cada 10 en la configuracion de rango completo aleatorio.
- Cierre de pinza parcial: 5/10 en la configuracion de rango completo aleatorio en 8060S EGL y 2/10 con cubo fijo de demostracion.
- Prediccion de trozos de accion (`predict_action_chunk`) con integracion de RTC.
- No implementa elevacion del objeto: 0/10 en la etapa `lift` en todas las configuraciones evaluadas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemticas, codigo ni capacidades multilingues.
- No se documentan modos de pensamiento (thinking), entrada de audio ni otras modalidades adicionales a vision y estado.

## Casos de uso

- Reproduccion de resultados negativos en VLA: el checkpoint permite replicar exactamente la configuracion documentada (`new_embodiment`, 10.000 pasos, batch 4) para verificar la conclusion de 0/10 y compararla con ejecuciones propias.
- Diagnostico de la brecha entre acercamiento y agarre: el embudo `reach 8 cm -> 4 cm -> close -> lift` (9/10 -> 7/10 -> 5/10 -> 0/10) sirve para estudiar por que un modelo aprende a aproximarse pero no a levantar el objeto.
- Validacion de harness de simulacion: permite comprobar el correcto funcionamiento del pipeline de evaluacion de SimStudio en backend EGL (8060S) y OSMesa (MI300X), incluyendo el parche del tokenizer de Cosmos a `Qwen/Qwen3-VL-2B-Instruct`.
- Pruebas de integracion de RTC: dado que las acciones relativas exigen RTC y `GrootPolicy.select_action` no esta implementado, el checkpoint es util para validar la cola de RTC y el significado real de las metricas de frecuencia (los valores de "10k+ Hz" son extracciones de la cola de RTC, no llamadas a `predict_action_chunk`).
- Estudio controlado de estrategias de congelacion: comparar este ajuste (LLM y vision congelados) con la variante de vision descongelada 20K, que obtuvo 0/10 con peor acercamiento (0-2/10 en `reach_8cm`).
- Analisis de representacion de acciones: evaluar el efecto de usar acciones relativas de 6-D con la pinza excluida frente a alternativas absolutas o de mayor dimensionalidad, usando el mismo dataset de 50 episodios que ACT 6-D y MolmoAct2 6-D.
- Docencia y laboratorio: material de partida para practicas sobre ajuste fino de modelos fundacionales de robotica y sobre interpretacion critica de resultados, ya que la model card declara explicitamente que no debe usarse como politica funcional.
- Medicion de latencia y throughput de inferencia: sirve como carga de trabajo realista para medir tiempos por trozo de accion en GPUs de gama integrada y profesional (2,53 Hz y ~395 ms en 8060S EGL; ~2 Hz de computo de control en MI300X OSMesa con render por software).
- No es adecuado para despliegue en produccion, atencion al cliente ni ninguna tarea de manipulacion real, dado que la tasa de exito publicada es 0/10.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K). La informacion disponible incluye exclusivamente evaluacion en bucle cerrado del laboratorio Lab 01, tarea "coger el cubo y colocarlo en la caja", con `reset_arm: home` y `execution_horizon=8` de RTC:

| Protocolo | Backend | Exito | Embudo (reach 8 cm -> 4 cm -> close -> lift) | Frecuencia real de trozo |
|---|---|---|---|---|
| Rango completo aleatorio | 8060S EGL | 0/10 | 9/10 -> 7/10 -> 5/10 -> 0/10 | 2,53 Hz (~395 ms) |
| Cubo fijo de demostracion | 8060S EGL | 0/10 | 9/10 -> 6/10 -> 2/10 -> 0/10 | 2,51 Hz |
| Rango completo aleatorio | MI300X OSMesa | 0/10 | 10/10 -> 6/10 -> 1/10 -> 0/10 | ~2 Hz de computo de control (render por software) |

Referencias comparativas sobre los mismos datos, citadas en la model card: ACT 6-D ~58% y MolmoAct2 6-D ~54% en rango completo. El cubo permanece cerca de su posicion de aparicion (`z` ~ 0,015), es decir, sin elevacion.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del recuento de parametros (3,144 mil millones) y del tamano del repositorio (12,6 GB, coherente con pesos en precision de 32 bits): ~12,6 GB solo en pesos si se carga en fp32; el resto de combinaciones son estimaciones derivadas, no datos publicados. En bf16 serian del orden de 6,3 GB de pesos; en 8 bits, ~3,1 GB; en 4 bits, ~1,6 GB. Hay que sumar activaciones, los tres flujos de camara y el estado del simulador.
- GPU recomendadas segun la informacion disponible: AMD Instinct MI300X (usada para el entrenamiento y para la evaluacion con OSMesa) y AMD Radeon 8060S con EGL (usada para la evaluacion principal).
- Encaje en GPU de consumo: no disponible. La informacion proporcionada no documenta pruebas en GPUs de consumo tipo RTX 4090, RTX 3090 o similares, ni el comportamiento del modelo con cuantizacion.
- Opciones de despliegue: libreria LeRobot (`GrootPolicy`) y el arnes de evaluacion de SimStudio (`labs/lab01_pnp/eval.cmd`, configuracion `rollout_groot.yaml`). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, y las acciones relativas exigen RTC, lo que descarta un uso directo mediante runtimes genericos de LLM.
- Latencia y throughput conocidos: 2,53 Hz (~395 ms) por trozo real en 8060S EGL con render EGL y 2,51 Hz en el protocolo de cubo fijo; ~2 Hz de computo de control en MI300X con OSMesa y render por software. Los valores de "10k+ Hz" que aparecen en los registros corresponden a extracciones de la cola de RTC, no a `predict_action_chunk`.
- Requisito de entorno: las acciones relativas necesitan RTC y `GrootPolicy.select_action` no esta implementado; la evaluacion parchea ficheros con control de acceso del tokenizer de Cosmos hacia `Qwen/Qwen3-VL-2B-Instruct`.

## Comparativa con modelos similares

| Modelo | Parametros | Datos de ajuste | Exito (rango completo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alexhegit/so101-simstudio-lab01-pnp-groot-n17` (GR00T N1.7-3B ajustado) | 3,144 mil millones | Lab 01, 50 episodios, 6-D `*.pos` | 0/10; no levanta el cubo | nvidia-open-model-license | Publico en HuggingFace (0 descargas, 0 likes) |
| ACT 6-D | no disponible | Mismos datos de Lab 01 | ~58% | no disponible | Citado en la model card; no se aporta enlace |
| MolmoAct2 6-D | no disponible | Mismos datos de Lab 01 | ~54% | no disponible | Citado en la model card; no se aporta enlace |
| `nvidia/GR00T-N1.7-3B` (base) | ~3 mil millones (segun nomenclatura del nombre) | Preentrenamiento, composicion no disponible | no disponible | nvidia-open-model-license | Publico en HuggingFace |

No se dispone de mas modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Resultado negativo declarado por el propio autor: no debe tratarse como una politica de pick-and-place funcional. La tasa de exito publicada es 0/10 y el cubo no se levanta.
- Riesgo de sesgo y de alucinacion en el sentido de politica: el modelo puede generar trayectorias plausibles de acercamiento que no culminan en agarre; el cierre de pinza solo se logra parcialmente (5/10 como maximo).
- No se recomienda usar las continuaciones posteriores: el 30K (partiendo de este 10K como `base_model_path` despues de cosine lr=0) y el 20K con vision descongelada obtuvieron 0/10 con peor acercamiento (`reach_8cm` pasa de 9-10/10 a 0-2/10).
- Dependencia de RTC: las acciones relativas requieren RTC y `GrootPolicy.select_action` no esta implementado, lo que limita la integracion en otras pilas de control sin trabajo adicional.
- Limitaciones de contexto e idioma: no se documenta longitud de contexto ni idiomas soportados; la informacion disponible no permite evaluar capacidades linguisticas.
- Restricciones de licencia: los pesos heredan la NVIDIA Open Model License del modelo base N1.7 y no son Apache-2.0. Cualquier uso comercial queda sujeto a los terminos de dicha licencia, cuyo enlace se incluye mas abajo.
- Dependencia de componentes con control de acceso: la evaluacion parchea ficheros del tokenizer de Cosmos hacia el modelo publico `Qwen/Qwen3-VL-2B-Instruct`, un cambio que hay que reproducir para poder evaluar.
- Ambito muy restringido: el ajuste esta hecho sobre un unico dataset de 50 episodios con posiciones articulares y tres camaras concretas (`camera_front`, `camera_top`, `camera_wrist`); no hay evidencia de generalizacion a otros brazos, tareas o configuraciones de camara.
- Metricas que pueden inducir a error: las cifras de "10k+ Hz" en los registros son extracciones de la cola de RTC y no el rendimiento real de `predict_action_chunk`, que es de ~2,5 Hz en el hardware documentado.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-groot-n17
- Dataset de ajuste: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio SimStudio: https://github.com/rocPAI-Forge/so101-simstudio
- Notas de adaptacion de GR00T N1.7 (Lab 01): https://github.com/rocPAI-Forge/so101-simstudio/blob/main/labs/lab01_pnp/groot_n1_7_adapt.md
- Documento Lab 01 (seccion 6.4): https://github.com/rocPAI-Forge/so101-simstudio/blob/main/labs/lab01_pnp/lab01_pnp.md
- Issue #6 de SimStudio: https://github.com/rocPAI-Forge/so101-simstudio/issues/6
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo.
