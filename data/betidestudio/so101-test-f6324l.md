# betidestudio/so101-test-f6324l

## Resumen

`betidestudio/so101-test-f6324l` es una política de difusión (diffusion policy) entrenada con el framework LeRobot de Hugging Face para controlar un brazo robótico SO-101. No se trata de un modelo de lenguaje, sino de una política visuomotora de aprendizaje por imitación: recibe el estado del robot y las imágenes de tres cámaras (frontal, superior y de muñeca) a 20 fps, y genera las acciones de los motores del brazo. Conforme a su model card, se carga directamente con la librería `lerobot` mediante `--policy.path=<este repo>`.

El modelo pesa 292.719.206 parámetros (≈ 0,3 B) en formato safetensors, con un repositorio de 1,2 GB. Resuelve el problema típico de la robótica de imitación: reproducir una tarea de manipulación (por ejemplo, coger y colocar objetos) a partir de demostraciones teleoperadas. Su relevancia se enmarca en el auge del "physical AI" de bajo coste: el SO-101 es un brazo imprimible en 3D que puede montarse por unos 130 $ y forma parte del ecosistema open source LeRobot.

La model card es mínima (sin licencia, sin benchmarks y con un nombre que sugiere un checkpoint de prueba), por lo que su interés principal es como ejemplo del flujo de trabajo colectar → entrenar → desplegar de LeRobot, más que como política lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) para control de robot, framework LeRobot |
| Parámetros totales | 292.719.206 (≈ 293 M / 0,3 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: no es un modelo de lenguaje; trabaja con observaciones a 20 fps) |
| Tipos de cuantización | No disponible; el tamaño del repo (1,2 GB para 292,7 M de parámetros) es consistente con pesos en F32 sin cuantizar |
| Idiomas soportados | No disponible (no aplica: modelo de robótica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (1,2 GB) |

## Arquitectura y entrenamiento

El modelo implementa una política de difusión, el enfoque de aprendizaje por imitación popularizado por Chi et al. (2023, "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion") y adoptado como uno de los algoritmos de referencia en LeRobot. En esencia, en lugar de predecir una única acción por paso, la política aprende a generar secuencias de acciones mediante denoising iterativo condicionado a las observaciones, lo que le permite modelar distribuciones de acciones multimodales (varias formas válidas de resolver la misma tarea). Las entradas documentadas son el estado propioceptivo del brazo más tres flujos de cámara (frontal, superior y de muñeca) muestreados a 20 fps; la salida son las acciones para las articulaciones del SO-101. Los detalles internos concretos (encoder de visión, número de pasos de denoising, horizonte de acciones) no están documentados en la model card.

Sobre el entrenamiento no hay información publicada: no se indica el dataset utilizado, el número de demostraciones, ni el proceso de recolección (típicamente teleoperación con las herramientas de grabación de LeRobot). Tampoco aplica entrenamiento con RLHF/DPO, pues no es un modelo conversacional. El propio nombre ("so101 test") sugiere un checkpoint experimental, pero el autor no lo confirma.

## Capacidades

- Control visuomotor de un brazo robótico SO-101: genera secuencias de acciones de motores a partir de observaciones del entorno.
- Fusión de estado y visión: combina propriocepión del brazo con tres vistas de cámara (frontal, superior y de muñeca), lo que permite tareas que requieren precisión en el punto de contacto.
- Operación a 20 fps: pensado para ciclos de control en tiempo real en hardware físico.
- Aprendizaje por imitación vía difusión: capaz de reproducir tareas demostradas por teleoperación, incluyendo potencialmente estrategias multimodales.
- Integración con el ecosistema LeRobot: carga directa con `--policy.path`, compatible con las herramientas de grabación, evaluación y visualización de la librería.
- No aplica: generación de texto, razonamiento lingüístico, tool calling, agentes multi-paso ni capacidades multilingües; no es un LLM ni un VLM de propósito general.

## Casos de uso

- Pick-and-place de objetos en mesa: la política puede aprender a coger objetos y colocarlos en una posición destino usando la vista frontal para localizar y la de muñeca para alinear la pinza; es el escenario de referencia del SO-101 (por ejemplo, el tutorial sim-to-real de NVIDIA coloca viales de centrifugación en un rack).
- Prototipado rápido de políticas por imitación: un desarrollador puede recolectar demostraciones teleoperadas con LeRobot, entrenar varios checkpoints y compararlos en hardware real; este modelo sirve como ejemplo de formato y carga de un checkpoint resultante.
- Investigación en robótica de bajo coste: al montarse el SO-101 por unos 130 $, es idóneo para laboratorios académicos y makers que quieran experimentar con políticas visuomotoras sin presupuestos de brazos industriales.
- Automatización de tareas repetitivas de mesa o laboratorio: tareas cortas y bien definidas (ordenar piezas, insertar componentes, posicionar herramientas) donde la variabilidad del entorno es limitada.
- Docencia en robótica y ML: el flujo completo de LeRobot (grabar demos → entrenar política de difusión → desplegar) es un caso práctico ideal para cursos; este repositorio puede usarse como material de referencia de cómo queda un modelo entrenado.
- Flujos sim-to-real: entrenar o validar la tarea en simulación (por ejemplo, con NVIDIA Isaac, que documenta este proceso para el SO-101) y desplegar la política en el brazo físico.
- Validación de configuraciones de sensores: al requerir tres cámaras con posiciones fijas, es útil como banco de pruebas para estudiar cómo afecta la colocación de cámaras al rendimiento de una política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Para políticas de robótica, la métrica habitual sería la tasa de éxito en la tarea evaluada en hardware real o simulación, pero el autor no documenta ninguna cifra.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,2 GB (F32, 292,7 M de parámetros); con activaciones y el procesado simultáneo de tres flujos de vídeo, una estimación razonable es de 4-8 GB de VRAM (cifra estimada, no documentada por el autor).
- GPU recomendadas: no disponible oficialmente; por tamaño, cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4060/4070 o superior) debería bastar para inferencia. Para reentrenar políticas de este tipo desde cero, GPUs tipo RTX 4090 o A100 aceleran el ciclo de entrenamiento.
- Cabe en GPU de consumo: sí, con holgura; con 0,3 B de parámetros es un modelo pequeño para los estándares actuales.
- Opciones de despliegue: la vía soportada es la librería `lerobot` en Python, ejecutando la política en el equipo que controla el brazo por USB. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia: al operar a 20 fps, la inferencia debe completarse en torno a 50 ms o menos por paso de control para mantener el ciclo en tiempo real; el coste depende de la GPU y del número de pasos de denoising configurados (valor no documentado).

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| betidestudio/so101-test-f6324l (este modelo) | 292,7 M (F32) | Política de difusión SO-101: estado + 3 cámaras, 20 fps | No disponible | safetensors, 1,2 GB |
| betidestudio/so101-test-qn2x30 | ≈ 0,3 B (F32) | Política de difusión SO-101: estado + 3 cámaras, 20 fps (descripción idéntica) | No disponible | safetensors |
| b-sky-lab/so101_test_model | No disponible | Política de prueba para SO-101 | No disponible | Repositorio público |
| lerobot/diffusion_pusht (referencia oficial) | No disponible | Política de difusión de referencia de LeRobot sobre la tarea PushT (simulación) | No disponible | Publicada por el equipo de LeRobot |

Los dos primeros modelos del mismo autor comparten descripción y arquitectura aparente, y parecen ser checkpoints alternativos de un mismo experimento. Frente a la política de referencia de LeRobot, este modelo está especializado en el hardware concreto del SO-101 con tres cámaras, mientras que la oficial sirve como baseline en simulación.

## Limitaciones y advertencias

- Sin licencia declarada: al no figurar licencia en el repositorio, cualquier uso, y en especial el comercial, está jurídicamente sin definir hasta que el autor lo aclare.
- Model card mínima: no se documenta la tarea entrenada, el dataset de demostraciones, la tasa de éxito ni los hiperparámetros; el nombre "test" sugiere un checkpoint experimental no pensado para producción.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia externa de que la política funcione.
- Riesgos típicos de aprendizaje por imitación: degradación fuera de distribución (covariate shift), sensibilidad a la calibración de cámaras, iluminación, posición de la mesa y montaje del brazo; cualquier desviación respecto a las condiciones de las demostraciones puede provocar fallos.
- Dependencia de hardware exacto: requiere un SO-101 con cámaras frontal, superior y de muñeca dispuestas igual que durante la recolección de datos.
- Posibles sesgos heredados: al no conocerse el dataset, no se puede evaluar si las demostraciones introducen sesgos hacia condiciones específicas del entorno del autor.
- No es un modelo de lenguaje: no sirve para NLP, chat, código ni razonamiento textual.

## Enlaces

- Modelo: https://huggingface.co/betidestudio/so101-test-f6324l
- Modelo hermano del mismo autor: https://huggingface.co/betidestudio/so101-test-qn2x30
- Política similar de otro autor: https://huggingface.co/b-sky-lab/so101_test_model
- Web del autor (Betide Studio): https://betide.studio/
- Artículo sobre el lanzamiento del SO-101 (Hackster.io): https://www.hackster.io/news/hugging-face-launches-the-so-101-an-upgraded-low-cost-3d-printable-autonomous-robot-arm-532360f441eb
- Tutorial sim-to-real con SO-101 y NVIDIA Isaac: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Repositorio oficial de LeRobot: https://github.com/huggingface/lerobot
