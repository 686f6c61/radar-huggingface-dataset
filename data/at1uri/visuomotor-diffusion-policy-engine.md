# At1uri/visuomotor-diffusion-policy-engine

## Resumen

`At1uri/visuomotor-diffusion-policy-engine` es un motor de políticas de difusión visuomotoras para control robótico, desarrollado por el autor independiente At1uri (Ramprasad Atluri). Combina una U-Net temporal 1D condicional que genera secuencias de acciones mediante DDIM (Denoising Diffusion Implicit Models) con un solucionador de cinemática inversa por mínimos cuadrados amortiguados (Levenberg-Marquardt). El objetivo es resolver el problema de colapso de modos que sufren las políticas de clonación de comportamiento entrenadas con MSE cuando las demostraciones expertas abarcan múltiples trayectorias válidas: en lugar de promediar hacia regiones de colisión, el modelo muestrea modos distintos libres de obstáculos.

El modelo se distribuye a través de la librería LeRobot y el repositorio pesa prácticamente 0 GB, con un total de 275.843 parámetros declarados en los safetensors. Es, por tanto, un modelo extremadamente compacto orientado a inferencia en tiempo real (el autor reporta 11,4 ms para 10 pasos de denoising deterministas), no un modelo de lenguaje de gran escala. La relevancia actual reside en su enfoque híbrido: política generativa para la planificación de trayectorias y solver analítico de IK para la conversión a ángulos articulares de un robot de 3 grados de libertad.

La información pública es escasa (0 descargas, 0 likes en el momento de la consulta) y todos los resultados de benchmarks están declarados por el autor sin verificación independiente (`verified: false`). La ficha refleja fielmente lo publicado, marcando como no disponible todo aquello que la model card no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net temporal 1D condicional (política de difusión) + solver de cinemática inversa por mínimos cuadrados amortiguados |
| Parametros totales | 275.843 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (horizonte de acciones H=16 pasos; historial de observaciones no cuantificado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | en (inglés; los metadatos declaran únicamente `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net temporal 1D condicional que actúa como red de score ε_θ(a^k, o_t, k): recibe la secuencia de acciones ruidosa, el historial de observaciones y el paso de difusión, y aprende el gradiente de la log-densidad multimodal ∇_a log p(a_{t:t+H} | o_t). La generación de acciones usa un horizonte de receding horizon H=16 y muestreo DDIM con schedule de ruido coseno en 10 pasos deterministas, lo que permite obtener chunks de acción libres de colisión sin promediar modos. Sobre la salida de la política, un solver de cinemática inversa por mínimos cuadrados amortiguados (estilo Levenberg-Marquardt) mapea waypoints 2D del efector final a ángulos articulares de un robot de 3 DOF usando el jacobiano analítico J(q).

No se documenta en la información disponible el número de tokens, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en imitación robótica, pero no confirmado). Tampoco se detalla el esquema de aumento de datos, la fuente de las demostraciones expertas ni la configuración exacta del entrenamiento (épocas, learning rate, batch size). La innovación técnica destacable es la combinación de difusión con DDIM de pocos pasos (10) para latencia baja y el acoplamiento directo con un solver de IK regularizado.

## Capacidades

- Generación de trayectorias de acción multimodales para manipulación robótica mediante difusión condicionada a observaciones.
- Evitación de obstáculos en el plano: el modelo muestrea modos superiores e inferiores de paso alrededor de un obstáculo circular, seleccionando la trayectoria con mayor holgura (clearance).
- Manipulación planar tipo Push-T (empujar un objeto en T sobre una superficie).
- Pick & place de cubos y tareas de inserción peg-in-hole (según benchmarks declarados por el autor).
- Cinemática inversa para robots de 3 DOF: conversión de waypoints del efector final a ángulos articulares con error de posición reportado por el solver.
- Muestreo determinista con semilla (`seed`) para reproducibilidad en inferencia.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión general, audio ni modo de pensamiento (thinking mode). Es un modelo específico de robótica, no un LLM.

## Casos de uso

- Planificación de trayectorias con evitación de obstáculos en brazos robóticos: el motor genera un chunk de 16 acciones que rodea un obstáculo circular de radio conocido, seleccionando el modo con mayor holgura; adecuado para celdas de trabajo con obstáculos estáticos modelados geométricamente.
- Manipulación planar Push-T en laboratorio: útil para investigación en imitación con políticas generativas, comparando el comportamiento multimodal frente a clonación de comportamiento MSE.
- Pick & place de piezas en líneas de montaje sencillas: el modelo produce waypoints 2D que el solver de IK traduce a ángulos articulares de un robot de 3 DOF, integrándose en un lazo de control de baja latencia (11,4 ms por chunk).
- Inserción peg-in-hole en tareas de ensamblaje: la política de difusión puede capturar la multimodalidad de aproximaciones válidas antes de la inserción, reduciendo el riesgo de colisión en la fase de alineación.
- Prototipado rápido en entornos LeRobot: al ser un modelo de 275.843 parámetros y repo de 0 GB, se puede cargar y ejecutar en estaciones de trabajo convencionales sin GPU de datacenter, facilitando experimentos de investigación.
- Evaluación comparativa de políticas de imitación: sirve como referencia de política de difusión frente a ACT o clonación MSE en el dataset de benchmarks del autor, para estudiar el colapso de modos en demostraciones multimodales.
- Docencia y demostraciones interactivas: el Space "robotics-diffusion-policy-studio" permite visualizar el muestreo de modos y la resolución de IK sin infraestructura propia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (N=200 episodios de test, `verified: false`, sin verificación independiente). Se reproducen tal cual:

| Tarea | Diffusion Policy (DDIM-10) | ACT | MSE Behavioral Cloning |
|---|---|---|---|
| Obstacle Avoidance Reach | 98,0 % | 91,5 % | 22,5 % (colapso por colisión) |
| Push-T Planar Manipulation | 94,5 % | 88,0 % | 41,0 % |
| Pick & Place Cube | 96,5 % | 94,0 % | 68,0 % |
| Peg-in-Hole Insertion | 91,0 % | 85,5 % | 44,0 % |

Del model-index oficial solo constan dos métricas verificables como declaradas: Obstacle Avoidance Success Rate = 0,98 y Push-T Success Rate = 0,945, ambas con `verified: false`. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 275.843 parámetros en FP32 el peso de los tensores es del orden de 1,1 MB, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650 o integrada moderna bastan para la inferencia del modelo.
- Cabe en consumer GPU: sí, en cualquier GPU consumer actual e incluso en CPU para latencias no críticas.
- Opciones de despliegue: la librería declarada es LeRobot; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). El autor proporciona un Space interactivo en Hugging Face.
- Latencia y throughput: el autor reporta 11,4 ms para 10 pasos DDIM deterministas por chunk de acción. El throughput no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| visuomotor-diffusion-policy-engine (At1uri) | 275.843 | H=16 pasos de acción | Difusión DDIM + IK | Apache 2.0 | Hugging Face (LeRobot) |
| ACT (Action Chunking with Transformers) | no disponible en esta ficha | no disponible | Transformer de chunking de acciones | no disponible | Referenciado como baseline en la model card |
| Clonación de comportamiento MSE | no disponible en esta ficha | no disponible | Regresión determinista | no disponible | Referenciado como baseline en la model card |

No se dispone de datos de parámetros, contexto ni licencia de ACT ni de la clonación MSE en la información proporcionada; se listan únicamente como baselines citados por el autor. No se han identificado otros modelos comparables con datos verificables en la información disponible.

## Limitaciones y advertencias

- Todos los benchmarks están declarados por el autor con `verified: false`; no hay validación independiente ni réplica publicada.
- El modelo está diseñado para un robot de 3 DOF y waypoints 2D; no generaliza a manipuladores de 6-7 DOF ni a planificación 3D sin adaptación.
- El solver de IK es analítico para una cinemática concreta; cambios en la morfología del robot requieren reemplazar el jacobiano y el modelo cinemático.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de robustez fuera de los benchmarks declarados.
- Riesgo de alucinación de trayectorias: como política generativa, puede muestrear modos plausibles pero inválidos si las observaciones quedan fuera de la distribución de entrenamiento; no se documenta mecanismo de seguridad o rechazo.
- Idiomas: solo se declara inglés en los metadatos; no aplica soporte multilingüe.
- Sesgos conocidos: no documentados. Al ser un modelo de imitación, heredará los sesgos de las demostraciones expertas, cuya composición no se detalla.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la ausencia de verificación de benchmarks desaconseja su uso en producción crítica sin evaluación propia.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita el despliegue en runtimes que no sean LeRobot o Python nativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/visuomotor-diffusion-policy-engine
- Dataset de benchmarks: https://huggingface.co/datasets/At1uri/robotic-manipulation-trajectory-benchmarks
- Space interactivo (Robotics Studio): https://huggingface.co/spaces/At1uri/robotics-diffusion-policy-studio
- Repositorio de código de investigación: https://huggingface.co/buckets/At1uri/robotics-diffusion-policy-vault
- Colección "Institutional Scientific AI Suite": https://huggingface.co/collections/At1uri/institutional-quantitative-ai-suite-6aeeaed0365774ae33b9621e
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
