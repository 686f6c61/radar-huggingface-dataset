# HoonheeCho/dvla-mujoco-v2-basket-act-rgb250

## Resumen

act_v2_basket_rgb250 es una política de imitación robótica publicada por el usuario HoonheeCho en HuggingFace, construida sobre el algoritmo ACT (Action Chunking Transformer) de LeRobot 0.3.3 con tres parches propios. Resuelve una tarea concreta de manipulación dinámica en simulación MuJoCo: recibir un objeto que vuela lanzándolo dentro de una caja que el robot sostiene con la mano. No es un modelo de lenguaje ni un VLA multimodal de propósito general, sino un controlador visomotor entrenado por clonación de comportamiento sobre demostraciones propias.

La entrada combina dos cámaras RGB (vista global y vista de muñeca) con tres fotogramas por cámara en los instantes t−20, t−10 y t, capturados a 250 Hz (intervalos de 40 ms) y fusionados de 9 a 3 canales mediante una convolución 7×7, más un vector de estado del efector final de 9 dimensiones. La salida es un chunk de 20 acciones que codifican el delta de la pose de la mano 88 ms en el futuro (3 de posición, 6 de rotación en sin/cos) más la pinza.

Su relevancia es doble: por un lado, documenta con transparencia inusual unos resultados de evaluación negativos (tasas de éxito del 4-10% en bucle cerrado frente al 26-90% del experto con guion) y un modo de fallo silencioso por variables de entorno no persistidas en el config. Por otro lado, sirve como artefacto de reproducibilidad para investigar fusión temporal y action chunking en tareas de captura dinámica, un régimen donde las políticas de imitación estándar suelen degradarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot 0.3.3 con 3 parches; backbone ResNet18 preentrenado en ImageNet con FrozenBN, dimension 512, 4 capas de encoder y 1 de decoder, con VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de 3 fotogramas RGB por camara (t−20, t−10, t a 250 Hz) y estado del efector final de 9 dimensiones |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; la model card no documenta cuantizaciones) |
| Idiomas soportados | no aplica (politica de control robotico, no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, acompanado de config.json y train_config.json |

## Arquitectura y entrenamiento

El modelo es un transformer de chunking de acciones con un codificador visual convolucional: ResNet18 preentrenado en ImageNet con BatchNorm congelada (FrozenBN), dimensión de embedding 512, cuatro capas de encoder y una de decoder, con componente VAE. A diferencia de un ACT estándar de una sola cámara, incorpora dos flujos de entrada (opst_cam y wrist_cam) con tres fotogramas temporales cada uno; una convolución 7×7 fusiona los 9 canales resultantes en 3, lo que constituye la innovación técnica principal del checkpoint. El entrenamiento usa clonación de comportamiento sobre 2.000 episodios de demostración, con learning rate 1e-5, batch 16 y 100.000 pasos, lo que consumió aproximadamente 26 horas en una única GPU H200. No se documenta uso de RLHF, DPO ni recompensas explícitas, algo esperable en imitación supervisada.

Un detalle crítico de implementación es que tres hiperparámetros de arquitectura (`TEMPORAL_FUSION_CONV=1`, `OBS_FRAME_STRIDE=10`, `ACTION_STRIDE=10`) no se guardan en `config.json` y la carga del checkpoint se hace con `strict=False`. Si no se exportan como variables de entorno antes de cargar el modelo, la capa de fusión temporal permanece inicializada aleatoriamente sin lanzar error (solo aparecen claves ausentes en el log con `Missing key`) y la política queda inservible. El repositorio distribuye 8 checkpoints cada 12.500 pasos, además de log de entrenamiento, salidas de evaluación y una copia del renderizador `libOSMesa.so.8.0.0` usada en la máquina de desarrollo.

## Capacidades

- Generación de acciones motoras continuas en un espacio de pose de efector final: delta de posición (3), rotación en sin/cos (6) y estado de pinza.
- Predicción por chunks de 20 acciones con horizonte efectivo de 88 ms, orientada a control a alta frecuencia (250 Hz).
- Percepción visomotora con dos cámaras simultáneas (vista global y de muñeca) y fusión temporal de tres instantes.
- Condicionamiento por estado propioceptivo: vector de 9 dimensiones del efector final.
- Tarea específica: recepción de objetos en vuelo dentro de una caja sostenida por el robot (basket/catching) en simulación MuJoCo.
- No soporta tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito (thinking), visión general de imágenes, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea de referencia en MuJoCo: cargar el checkpoint de 25.000 pasos (el de mejor tasa de éxito) con las variables de entorno obligatorias y ejecutar episodios en bucle cerrado para replicar el protocolo de evaluación del autor.
- Punto de partida para fine-tuning en captura dinámica de objetos: la combinación de doble cámara y fusión temporal es directamente reutilizable en tareas de recepción de pelotas, drones o brazos lanzadores donde la latencia de percepción es determinante.
- Investigación sobre action chunking: permite estudiar el compromiso entre horizonte de predicción (20 acciones, 88 ms) y frecuencia de control (250 Hz) con un caso que documenta explícitamente el fracaso del modelo frente al experto con guion.
- Estudio de robustez a la frecuencia de observación: la model card compara al experto con guion a 250 Hz (90/100), a 25 Hz de observación con 250 Hz de control (32/100) y con ambas a 25 Hz (26/100), lo que sirve para analizar la sensibilidad al muestreo temporal de las políticas de imitación.
- Benchmarking de pipelines LeRobot: al requerir la versión 0.3.3 más tres parches, es un banco de pruebas útil para validar compatibilidad, serialización de `config.json` y reproducibilidad de checkpoints entre entornos.
- Docencia y auditoría de fallos silenciosos: el caso de las variables de entorno no persistidas es un ejemplo real y documentado de error de despliegue difícil de detectar, útil para formación en MLOps de robótica.
- Evaluación comparativa con renderizado software: el repositorio incluye OSMesa, lo que permite ejecutar la política en entornos sin GPU dedicada ni servidor gráfico, útil en granjas de CI.

## Benchmarks y rendimiento

Evaluación en bucle cerrado sobre MuJoCo, con 50 semillas principales más 50 semillas auxiliares (la evaluación auxiliar corresponde a semillas en las que solo tuvo éxito el experto con guion a 250 Hz):

| Checkpoint | Evaluacion principal | Evaluacion auxiliar | Total |
|---|---|---|---|
| 25k | 4/50 | 6/50 | 10/100 |
| 50k | 6/50 | 0/50 | 6/100 |
| 75k | 4/50 | 0/50 | 4/100 |

Referencia del experto con guion (usa el estado real del objeto): 90/100 con observación a 250 Hz; 32/100 con observación a 25 Hz y control a 250 Hz; 26/100 con observación y control a 25 Hz. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a una política de control.

## Requisitos de hardware

- Entrenamiento documentado: una única GPU H200 durante aproximadamente 26 horas para 100.000 pasos con batch 16.
- VRAM de inferencia: no disponible de forma explícita; el repositorio completo ocupa 1,9 GB repartido entre 8 checkpoints, log de entrenamiento, salidas de evaluación y el renderizador OSMesa. No se especifica el tamaño de cada `model.safetensors`.
- GPU recomendadas: no disponible. Por el tamaño del backbone (ResNet18 con dimensión 512) y el número de checkpoints, es razonable esperar que la inferencia quepa en GPUs de consumo, pero esta afirmación no está verificada por el autor y debe tratarse como estimación.
- Despliegue: exclusivamente mediante LeRobot 0.3.3 con los tres parches del repositorio `mickeykang16/DynamicVLA` (rama `basket-v2-rgb250-repro`, privada). No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Renderizado: el autor incluye `libOSMesa.so.8.0.0` (Ubuntu 22.04, libosmesa6 23.2.1-1ubuntu3.1~22.04.4, licencia MIT de Mesa) para entornos sin aceleración gráfica.
- Latencia y throughput: la política está diseñada para observación y control a 250 Hz (4 ms por paso) con chunks de 20 acciones a intervalos de 40 ms. No se publican medidas de latencia de inferencia ni de throughput del servidor.

## Comparativa con modelos similares

La comparación directa no es posible porque las métricas de la model card (éxito por semilla en una tarea de captura concreta) no son transferibles a otros entornos. Se ofrece una comparación cualitativa de categoría:

| Modelo | Categoria | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_v2_basket_rgb250 | ACT con doble camara y fusion temporal | no disponible | Chunk de 20 acciones, ventana de 3 fotogramas | Apache 2.0 | Pesos abiertos; codigo de reproduccion en rama privada |
| ACT original (Zhao et al., 2023) | Action Chunking Transformer para manipulacion bimanual | no disponible | Chunk de acciones, 1 flujo visual tipico | Codigo abierto (consultar repositorio) | Publico |
| Diffusion Policy (Chi et al., 2023) | Politica generativa por difusion para acciones | no disponible | Horizonte de prediccion configurable | Codigo abierto (consultar repositorio) | Publico |
| OpenVLA | VLA de proposito general (VLM + acciones) | 7B (segun publicacion) | Modelo de lenguaje subyacente | Licencia especifica de OpenVLA | Pesos publicos |

Las cifras de rendimiento entre filas no son comparables: cada una se evaluó en tareas y protocolos distintos, y en el caso de act_v2_basket_rgb250 el propio autor reporta tasas de éxito del 4-10%.

## Limitaciones y advertencias

- Tasa de éxito muy baja: entre 4/100 y 10/100 en bucle cerrado, frente a 26-90/100 del experto con guion. No es un modelo listo para producción sin reentrenamiento o ajuste.
- Fallo silencioso por configuración: omitir `TEMPORAL_FUSION_CONV=1 OBS_FRAME_STRIDE=10 ACTION_STRIDE=10` deja las capas de fusión temporal aleatorias porque el checkpoint se carga con `strict=False` y esos valores no están en `config.json`. El síntoma es un `Missing key` en el log, sin excepción.
- Reproducibilidad incompleta: el código y el README de reproducción viven en la rama privada `basket-v2-rgb250-repro` del repositorio GitHub `mickeykang16/DynamicVLA`, y el dataset de entrenamiento (`HoonheeCho/dvla-mujoco-v2-basket`) también es privado. Sin acceso a ambos no se puede reentrenar.
- Rutas absolutas de la máquina de desarrollo en `train_config.json`, lo que rompe la portabilidad del pipeline de entrenamiento.
- Dependencia estricta de LeRobot 0.3.3 más tres parches: otras versiones pueden no cargar el checkpoint correctamente.
- Especificidad de tarea y de simulador: entrenado para MuJoCo en la tarea basket; no hay evidencia de transferencia a un robot real ni a otras tareas.
- Sesgos y alucinación: no aplica el concepto de alucinación en un modelo de lenguaje; el riesgo equivalente es el desajuste de distribución (distribution shift) ante cambios de iluminación, física o dinámica del objeto, no evaluado en la información disponible.
- Idiomas: no aplica; no procesa ni genera lenguaje.
- Licencia Apache 2.0 en los pesos, lo que permite uso comercial, pero el código de reproducción y el dataset privados limitan de facto la reutilización práctica.
- Estado de validación externa nulo: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones independientes.
- La model card remite a `KNOWN_ISSUES.md` en la rama privada para conocer los defectos documentados y el protocolo de evaluación, documentación no accesible públicamente.

## Enlaces

- HuggingFace: https://huggingface.co/HoonheeCho/dvla-mujoco-v2-basket-act-rgb250
- Repositorio de reproducción: GitHub `mickeykang16/DynamicVLA`, rama `basket-v2-rgb250-repro` (privada)
- Dataset de entrenamiento: `HoonheeCho/dvla-mujoco-v2-basket` (privado)
- Documentación de fallos conocidos: `KNOWN_ISSUES.md` en la rama privada del repositorio
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a tutoriales de firmas de correo de Outlook y no se incluyen.
