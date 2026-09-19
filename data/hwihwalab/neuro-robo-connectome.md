# hwihwalab/neuro-robo-connectome

## Resumen

Neuro-Robo Connectome es un modelo fundacional de IA física (physical AI) desarrollado por hwihwalab que traslada el conectoma completo del cerebro de la mosca de la fruta (*Drosophila melanogaster*) a un controlador neuromórfico para robótica biomórfica. No es un transformer de lenguaje: es una red neuronal de impulsos (SNN) con dinámica de neurona LIF construida a partir de los grafos de conectoma MaleCNS y FlyWire FAFB, que suma 166.745 neuronas y 2.753.975 sinapsis en su variante masculina, con 815 neuronas motoras y un bucle sensoriomotor cerrado ORN → ALPN → DN → MN.

El problema que aborda es el control reactivo de bajo nivel en cuerpos robóticos muy diversos (hexápodos, cuadrúpedos, humanoides bípedos, ornitópteros y AGV) sin recurrir a modelos visión-lenguaje-acción (VLA) ejecutados en GPU. La propuesta del autor es un enfoque de sim-to-real que se despliega directamente sobre microcontroladores (ESP32-S3, Arduino Uno/Nano, STM32) con firmware C++ y control PWM, declarando 5,67 ms de latencia extremo a extremo y 0,05 W de consumo.

Su relevancia actual es doble: por un lado, explora la línea de investigación de controladores inspirados en el cerebro como alternativa de eficiencia energética (el autor afirma un ahorro de 14.000x frente a un VLA en GPU cloud); por otro, se integra en el ecosistema LeRobot de HuggingFace y publica pesos/documentación bajo licencia MIT, con un estudio interactivo en WebGL/Three.js. Las métricas publicadas son declaradas por el autor y están marcadas como no verificadas en el model-index.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de impulsos (SNN) basada en conectoma biológico; dinámica de neurona LIF; bucle sensoriomotor cerrado ORN → ALPN → DN → MN |
| Parámetros totales | No disponible en términos de parámetros de transformer; el modelo se define por 166.745 neuronas simuladas (variante masculina, MaleCNS) y 139.255 en la femenina (FlyWire FAFB). Categoría declarada: 10M < n < 100M |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable; modelo de control reactivo, no de secuencia textual. No disponible como ventana de contexto |
| Tipos de cuantización | No disponible; el despliegue declarado es firmware C++ sobre MCU, sin esquema de cuantización publicado |
| Idiomas soportados | en, ko (documentación y model card; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | No disponible en la información proporcionada; el repositorio incluye firmware `arduino_esp32_firmware.cpp` y un archivo `benchmark_results.json` |
| Autor | hwihwalab |
| Librería | lerobot |
| Pipeline | robotics |
| Tamaño del repositorio | 0,1 GB |
| Conectividad sináptica | 2.753.975 sinapsis (MaleCNS); rango declarado de 2,75M a 3,28M |
| Neuronas motoras | 815 |
| Cuerpos robóticos soportados | 8 (CyberFly, Go1, G1, T1, MicroDuck, BH, Drone, AGV) |
| Hardware de destino | Arduino Uno/Nano, ESP32-S3, STM32, L298N/TB6612FNG (puente H dual) |
| Emisiones declaradas de CO2 | 0,0001 (fuente declarada: ejecución en microcontrolador ESP32 a 0,05 W; extracción de conectoma biológico; Corea del Sur) |
| Fecha de creación | 19 de septiembre de 2026 |
| Última actualización | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura no sigue el patrón transformer. Se trata de una red neuronal de impulsos (spiking neural network) derivada de la extracción de un conectoma biológico real: los grafos MaleCNS (adulto masculino) y FlyWire FAFB (hembra), citados en la model card como publicados en Nature 2026 y Princeton FlyWire respectivamente. El modelo instancia 166.745 neuronas con dinámica LIF y 2.753.975 conexiones sinápticas, de las cuales 815 corresponden a neuronas motoras, y organiza el flujo sensoriomotor en cuatro etapas (ORN, ALPN, DN, MN) que forman un bucle cerrado con latencia declarada de 5,67 ms.

El autor describe el "entrenamiento" como `biological-connectome-extraction`, es decir, no hay un proceso de optimización por descenso de gradiente ni fases de RLHF o DPO en la información disponible. Tampoco se detalla la composición del dataset de entrenamiento más allá del propio grafo de conectoma (`connectome/drosophila-dual`). Entre las innovaciones técnicas que declara la model card figuran: la compatibilidad con ocho morfologías robóticas distintas partiendo del mismo sustrato neural, el control en tiempo real a 100 Hz sobre microcontroladores, la generación de firmware C++ para sim-to-real con PWM de resolución de microsegundos y una simulación 3D en el navegador a 60 fps mediante Three.js/WebGL.

## Capacidades

- Locomoción multi-cuerpo: el mismo controlador se declara compatible con ocho cuerpos biomórficos (hexápodo, cuadrúpedo, bípedo humanoide, ornitóptero, dron y AGV).
- Navegación por quimiotaxis: comportamiento de seguimiento de gradiente químico modelado a partir de circuitos olfativos del conectoma.
- Respuesta evasiva: giro de 180° ante estímulo de citronela, declarado con una tasa de evasion del 100% en la experimentación del autor.
- Control motor de bajo nivel: 815 neuronas motoras que traducen la señal sensorial en comandos de actuación.
- Control en tiempo real: bucle cerrado a 100 Hz con 5,67 ms de latencia extremo a extremo declarada.
- Despliegue en el borde: ejecución en Arduino Uno/Nano, ESP32-S3 y STM32 con firmware C++ y control de puente H.
- Simulación interactiva: estudio 3D en navegador (Three.js/WebGL) para inspección del comportamiento.
- Generación de texto, código, matemáticas, visión o audio: no aplicable; el modelo no procesa ni produce lenguaje natural.
- Tool calling / function calling: no disponible; no se documenta ninguna interfaz de este tipo.
- Soporte de agentes y razonamiento multi-paso: no aplicable en el sentido de agentes basados en LLM.
- Capacidades multilingües: no aplicable al modelo; solo la documentación está en inglés y coreano.

## Casos de uso

- Locomoción de robots hexápodos en terreno irregular: el controlador traduce estímulos sensoriales en patrones de marcha sin necesidad de GPU, lo que permite integrarlo en plataformas de exploración con presupuesto energético muy limitado.
- Robots de inspección con navegación por gradiente: la quimiotaxis permite implementar seguimiento de concentración de gas o sustancias en entornos industriales, usando el comportamiento de búsqueda de fuente como política reactiva.
- Microdrones y ornitópteros: al ejecutarse en MCU de bajo consumo (0,05 W declarados), es candidato para vehículos aéreos de ala batiente o drones de pequeño tamaño donde el peso y la autonomía son críticos.
- Robótica educativa y de bajo coste: el firmware para Arduino Uno/Nano y ESP32-S3 permite montar prácticas de control neuromórfico con hardware de menos de 20 euros, sin depender de infraestructura cloud.
- Investigación en neurociencia computacional: el modelo actúa como banco de pruebas para validar hipótesis sobre circuitos del conectoma de *Drosophila* (ORN, ALPN, DN, MN) observando cómo se comporta el bucle completo en simulación.
- Gemelos digitales y validación previa: el estudio WebGL en el navegador permite verificar políticas de control antes de flashear el firmware en el robot físico, reduciendo el ciclo de iteración hardware.
- AGV/AMR en almacén con eficiencia energética: el control reactivo de bajo consumo puede gestionar desplazamientos simples y evasión de obstáculos en vehículos autónomos de almacén donde no se justifica un VLA en GPU.
- Robótica de enjambre: la huella de cómputo mínima facilita desplegar muchos agentes con el mismo controlador sin coste marginal de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. Todos los valores están marcados con `verified: false`, es decir, no han sido verificados de forma independiente.

| Métrica | Valor | Tarea / dataset |
|---|---|---|
| Multi-Terrain Kinematic Reach Rate (%) | 100 | Locomoción y quimiotaxis multi-cuerpo; dataset MaleCNS & FlyWire Connectome Graph |
| Citronella 180° Evasive Turnaround Rate (%) | 100 | Ídem |
| End-to-End Sensory-Motor Latency (ms) | 5,67 | Ídem |
| Ultra-Low-Power Edge Consumption (W) | 0,05 | Ídem |
| Total Simulated Biological Neurons | 166.745 | Ídem |
| Total Synaptic Connections | 2.753.975 | Ídem |

La model card menciona además una suite de 4 experimentos empíricos con 400 episodios y 6 terrenos, cuyos datos estarían en `benchmark_results.json`. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, razonamiento o visión, ya que el modelo no cubre esas tareas.

## Requisitos de hardware

- VRAM para inferencia: no aplicable. El modelo no se ejecuta en GPU; el despliegue declarado es sobre microcontroladores.
- GPU recomendadas: no aplicable en la ruta de despliegue del autor. Para reentrenar o reextraer el conectoma no se especifica hardware en la información disponible.
- Compatibilidad con GPU de consumo: no aplicable; el objetivo es precisamente evitar GPU. El consumo declarado es de 0,05 W frente a los 700 W que el autor atribuye a un VLA en GPU cloud.
- Opciones de despliegue documentadas: firmware C++ para Arduino Uno/Nano, ESP32-S3 y STM32, con control de puente H L298N o TB6612FNG; simulación en navegador mediante Three.js/WebGL; integración con el ecosistema LeRobot.
- Opciones de despliegue no documentadas: no hay información sobre soporte de vLLM, llama.cpp, Ollama o TGI, herramientas propias de modelos de lenguaje que no aplican a esta arquitectura.
- Latencia declarada: 5,67 ms extremo a extremo en bucle cerrado, con control en tiempo real a 100 Hz.
- Throughput: no disponible.
- Requisitos de memoria flash/RAM del microcontrolador: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La categoría funcional (controlador neuromórfico basado en conectoma para múltiples morfologías) no tiene equivalentes directos publicados con métricas contrastadas en esta información. A modo de contexto cualitativo, sin cifras:

| Modelo / familia | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neuro-robo-connectome | SNN derivada de conectoma de *Drosophila* | 166.745 neuronas / 2,75M sinapsis (declarado) | No aplicable | MIT | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Modelos VLA (visión-lenguaje-acción) tipo GR00T o π0 | Transformer multimodal + cabeza de acción | No disponible | No disponible | No disponible | No disponible en esta información |
| Controladores clásicos de robótica (PID, MPC, CPG) | Modelo analítico o generador de patrones centrales | No aplicable | No aplicable | Variable | Ampliamente disponibles |

Para cualquier comparación cuantitativa con VLA, políticas de imitación o controladores clásicos habría que recurrir a fuentes externas no incluidas en esta ficha.

## Limitaciones y advertencias

- Métricas no verificadas: las seis métricas del model-index están marcadas como `verified: false`. Los valores del 100% en alcance cinemático y tasa de evasión proceden exclusivamente del autor.
- Ausencia de validación independiente: no se documentan replicaciones por terceros, revisión por pares del benchmark ni comparaciones con líneas base publicadas.
- Brecha sim-to-real: el firmware y los resultados se presentan sobre simulación y MCU; no se detallan las condiciones de las pruebas físicas ni la tasa de fallo en hardware real.
- Cero tracción comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.
- Idiomas: la documentación solo está en inglés y coreano; no hay versión en castellano. El modelo en sí no procesa lenguaje.
- Ambigüedad terminológica: la model card lo denomina "foundation model" de IA física, pero no comparte las propiedades de un modelo fundacional de lenguaje (no hay preentrenamiento a escala, ni adaptación por prompt, ni ventana de contexto).
- Riesgo de antropomorfismo: interpretar los comportamientos de quimiotaxis y evasión como "inteligencia" del sistema puede llevar a sobreestimar su generalidad; son políticas reactivas derivadas de un conectoma concreto.
- Sesgos biológicos: el comportamiento está condicionado por el sustrato de *Drosophila* y por las condiciones de extracción del conectoma; su extrapolación a otros organismos o tareas no está documentada.
- Sin datos de cuantización ni de formato de pesos: dificulta evaluar la reproducibilidad y el coste computacional de un reentrenamiento o reextracción.
- Licencia: MIT, permisiva y compatible con uso comercial, pero la licencia del modelo no cubre necesariamente las licencias de los datos de conectoma subyacentes (MaleCNS, FlyWire), que deben verificarse por separado.
- Datos de eficiencia energética: la cifra de 0,05 W y el ahorro de 14.000x se refieren a la ejecución en microcontrolador y a una comparación declarada con un VLA en GPU cloud; son cifras del autor y dependen fuertemente del escenario de comparación.
- Contenido de la búsqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a sitios de apuestas sin relación con el tema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hwihwalab/neuro-robo-connectome
- Model card en inglés (README.md): https://huggingface.co/hwihwalab/neuro-robo-connectome/blob/main/README.md
- Documentación en coreano (README_KR.md): https://huggingface.co/hwihwalab/neuro-robo-connectome/blob/main/README_KR.md
- Firmware para Arduino/ESP32 (arduino_esp32_firmware.cpp): https://huggingface.co/hwihwalab/neuro-robo-connectome/blob/main/arduino_esp32_firmware.cpp
- Datos de benchmarks (benchmark_results.json): https://huggingface.co/hwihwalab/neuro-robo-connectome/blob/main/benchmark_results.json
- Demo interactiva 3D en Spaces: https://huggingface.co/spaces/hwihwalab/neuro-robo-studio
- Ecosistema LeRobot en HuggingFace: https://huggingface.co/lerobot
- Texto de la licencia MIT: https://opensource.org/licenses/MIT
- Fuente citada del conectoma MaleCNS (Janelia): https://janelia.org
- La búsqueda web realizada no aportó enlaces adicionales relevantes sobre el modelo, el paper asociado ni el repositorio de código.
