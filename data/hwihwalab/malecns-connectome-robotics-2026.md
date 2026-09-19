# hwihwalab/malecns-connectome-robotics-2026

## Resumen

malecns-connectome-robotics-2026 es un modelo fundacional de "physical AI" neuromórfica publicado por hwihwalab (Corea del Sur) que reproduce el conectoma del sistema nervioso central de una mosca de la fruta macho adulta (*Drosophila melanogaster*), en su edición declarada como MaleCNS 2026. El modelo integra 166.745 neuronas simuladas, 2.753.975 conexiones sinápticas y 815 neuronas motoras de la pata, y se distribuye como modelo compatible con la librería LeRobot con licencia MIT.

A diferencia de un transformer o de un modelo de mezcla de expertos, se trata de una red neuronal de pulsos (SNN) con dinámica de neurona LIF que ejecuta control sensoriomotor en bucle cerrado: la ruta declarada va de neurona receptora olfativa (ORN) a neurona local de la antena (ALPN), de ahí a neurona descendente (DN) y finalmente a neurona motora (MN), con una latencia extremo a extremo declarada de 5,67 ms y un consumo de 0,05 W sobre microcontrolador.

Su relevancia actual está en la combinación de tres factores: control multi-morfología (8 cuerpos robóticos distintos sin reentrenamiento específico por morfología), despliegue sim-to-real sobre hardware embebido de bajo coste (Arduino Uno/Nano, ESP32-S3, STM32) y una eficiencia energética declarada de 14.000 veces frente a un VLA ejecutado en GPU en la nube. Todas las métricas de la model card figuran como no verificadas y el repositorio tiene 0,0 GB, 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de pulsos (SNN) con dinámica de neurona LIF, derivada de un conectoma biológico (MaleCNS 2026 de *Drosophila melanogaster*); no es transformer, MoE ni SSM |
| Parámetros totales | No disponible como recuento de pesos. Categoría declarada: 10 M < n < 100 M. Sustrato declarado: 166.745 neuronas simuladas, 2.753.975 sinapsis y 815 neuronas motoras |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (modelo de control sensoriomotor en bucle cerrado, no un modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) y coreano (ko), para la documentación del repositorio |
| Licencia | MIT |
| Formato de pesos | No disponible; el repositorio figura con 0,0 GB. Se referencian firmware C++ para Arduino/ESP32 (fichero `arduino_esp32_firmware.cpp`) y resultados en `benchmark_results.json` |
| Latencia extremo a extremo declarada | 5,67 ms (ORN a ALPN a DN a MN, bucle cerrado) |
| Consumo declarado | 0,05 W en ejecución sobre microcontrolador |
| Cuerpos robóticos soportados | 8 (CyberFly, Go1, G1, T1, MicroDuck, BH, dron, AGV): hexápodo, cuadrúpedo, humanoide bípedo, ornitóptero y AMR |
| Destino sim-to-real | Arduino Uno/Nano, ESP32-S3, STM32; puente en H L298N/TB6612FNG |
| Huella de carbono declarada | 0,0001 (fuente: ejecución en ESP32 a 0,05 W; tipo de entrenamiento: extracción de conectoma biológico; ubicación: Corea del Sur) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal de pulsos construida por extracción de conectoma, no por entrenamiento con descenso de gradiente: la model card indica `training_type: biological-connectome-extraction`. El grafo procede del conectoma MaleCNS 2026 (166,7k neuronas) asociado a FlyWire y Janelia, e incluye 815 neuronas motoras de la pata. La dinámica de neurona es de tipo LIF (leaky integrate-and-fire) y el bucle funcional declarado es ORN, ALPN, DN, MN, con control en tiempo real a 100 Hz y latencia sensoriomotora de 5,67 ms. Entre las etiquetas del repositorio figuran `reinforcement-learning`, `neuromorphic`, `sim-to-real` y `brain-inspired`, aunque la model card no detalla ningún proceso de RLHF, DPO ni ajuste por refuerzo sobre el grafo.

La innovación técnica que se declara es doble. Por un lado, generalización multi-cuerpo: el mismo controlador gobierna 8 morfologías biomórficas distintas (hexápodo, cuadrúpedo, humanoide, ornitóptero, AMR) sin reentrenamiento específico de morfología. Por otro, eficiencia: la ejecución se plantea directamente sobre microcontroladores (Arduino Uno/Nano, ESP32-S3, STM32) con salida PWM de nivel de microsegundos y puentes en H L298N/TB6612FNG, frente a los 700 W que la propia model card atribuye a un VLA ejecutado en GPU en la nube. No se especifican en la información disponible el número de tokens, la composición del dataset de entrenamiento ni el procedimiento exacto de conversión del conectoma biológico a red simulable.

## Capacidades

- Locomoción multi-terreno: desplazamiento cinemático sobre 6 tipos de terreno distintos, con una tasa de alcance declarada del 100 % en la suite de 4 experimentos y 400 episodios.
- Quimiotaxis y persecución: bucle cerrado de rastreo de estímulo químico mediante la ruta olfativa simulada (ORN a ALPN a DN a MN).
- Evasión reactiva: giro de 180° ante citronela, con tasa declarada del 100 %.
- Evitación de obstáculos y navegación reactiva de baja latencia en entornos físicos.
- Control multi-morfología: un único controlador para 8 cuerpos robóticos (hexápodo, cuadrúpedo, bípedo humanoide, ornitóptero, dron, AGV) sin reentrenamiento por morfología.
- Sim-to-real embebido: generación de firmware C++ con control PWM a nivel de microsegundos para Arduino, ESP32-S3 y STM32.
- Ejecución ultra-baja potencia: 0,05 W declarados en microcontrolador, apto para robótica alimentada por batería o por recolección de energía.
- Visualización e inspección: estudio interactivo en el navegador con Three.js/WebGL a 60 fps en el Space `hwihwalab/neuro-robo-studio`.
- No soporta: tool calling, function calling, razonamiento multi-paso en lenguaje, generación de texto, código, matemáticas, visión ni audio. La información disponible no describe ninguna interfaz de lenguaje natural.

## Casos de uso

- Robots de inspección con energía limitada: el modelo se ejecuta en un ESP32-S3 a 0,05 W, por lo que puede alimentar un AGV o un dron de vigilancia de larga duración donde no es viable llevar una GPU ni transmitir a la nube.
- Prototipado educativo y de laboratorio: al ser compatible con Arduino Uno/Nano y LeRobot, permite montar un hexápodo o cuadrúpedo de bajo coste y validar controladores reactivos sin infraestructura de cómputo.
- Navegación reactiva en enjambres: la latencia de 5,67 ms habilita bucles de control a 100 Hz para evasión de obstáculos y seguimiento de rastro químico en plataformas pequeñas.
- Robótica de rescate o exploración en terreno irregular: la validación declarada sobre 6 terrenos con el 100 % de alcance cinemático apunta a uso en superficies no estructuradas donde prima la reacción rápida sobre la planificación deliberativa.
- Sustitución de controladores clásicos en robótica de consumo: para juguetes robóticos, drones de juguete o cuadrúpedos de gama baja, evita el coste de un módulo de cómputo y el consumo asociado.
- Investigación en neurociencia computacional: al estar basado en un conectoma biológico publicable, sirve como banco de pruebas para contrastar hipótesis sobre circuitos olfativos y motores de *Drosophila*.
- Plataformas multi-robot con una sola política de control: al no requerir reentrenamiento por morfología, un mismo despliegue puede cubrir un hexápodo y un AGV dentro de la misma flota.
- Demostraciones interactivas y docencia: el Space con WebGL permite mostrar el comportamiento del controlador en el navegador sin instalar nada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Tarea: "Physical AI Multi-Body Locomotion & Chemotaxis". Conjunto de datos: "MaleCNS 2026 166.7k Connectome Graph". Ninguna de las métricas está verificada por terceros (`verified: false` en todas ellas).

| Métrica | Valor declarado | Verificación |
|---|---|---|
| Tasa de alcance cinemático multi-terreno (%) | 100,0 | No verificada |
| Tasa de giro evasivo de 180° ante citronela (%) | 100,0 | No verificada |
| Latencia sensoriomotora extremo a extremo (ms) | 5,67 | No verificada |
| Consumo en el borde (W) | 0,05 | No verificada |
| Neuronas biológicas simuladas | 166.745 | No verificada |
| Conexiones sinápticas | 2.753.975 | No verificada |

La model card menciona además una suite de 4 experimentos empíricos con 400 episodios y 6 terrenos, y remite a `benchmark_results.json`. No se han proporcionado resultados independientes en MMLU, HumanEval, GSM8K ni en ningún otro benchmark de lenguaje, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- GPU: no requiere GPU. El destino de despliegue declarado es microcontrolador (Arduino Uno/Nano, ESP32-S3, STM32).
- VRAM estimada: no aplica. No se indica ningún requisito de memoria de GPU para este modelo.
- Cómputo de borde: 0,05 W declarados en ejecución sobre MCU; comparado en la propia model card con 700 W de un VLA en GPU en la nube (factor declarado de 14.000x).
- Latencia: 5,67 ms extremo a extremo declarados, con control en bucle cerrado a 100 Hz.
- Actuación: salida PWM a nivel de microsegundos; puentes en H L298N o TB6612FNG para el accionamiento de motores.
- Opciones de despliegue: firmware C++ embebido (`arduino_esp32_firmware.cpp`) y controladores asociados a LeRobot. No se contemplan vLLM, llama.cpp, Ollama ni TGI porque el modelo no es un modelo de lenguaje.
- Infraestructura de simulación: simulación 3D WebGL/Three.js a 60 fps en el navegador mediante el Space `hwihwalab/neuro-robo-studio`.
- Throughput: no disponible.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables de la misma categoría (controladores neuromórficos basados en conectoma para robótica multi-cuerpo). La única referencia cuantitativa disponible es la comparación interna de la model card frente a un VLA genérico en GPU en la nube, que se recoge a continuación sin nombre ni especificaciones concretas.

| Modelo | Tipo | Escala | Latencia | Consumo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| malecns-connectome-robotics-2026 | SNN basada en conectoma biológico | 166.745 neuronas, 2.753.975 sinapsis; categoría 10 M-100 M | 5,67 ms (declarada) | 0,05 W (declarado) | MIT | Repositorio en HuggingFace, 0,0 GB, 0 descargas, 0 "likes" |
| VLA en GPU en la nube (referencia genérica citada en la model card) | Visión-lenguaje-acción | No disponible | No disponible | 700 W | No disponible | No aplica |

Comparativas adicionales: no disponibles.

## Limitaciones y advertencias

- Todas las métricas declaradas (100 % de alcance, 100 % de evasión, 5,67 ms, 0,05 W) figuran como no verificadas en el propio `model-index`, y el repositorio no registra descargas ni valoraciones.
- El repositorio ocupa 0,0 GB, lo que sugiere que los pesos o el grafo del conectoma podrían no estar publicados; conviene verificar el contenido real antes de planificar un despliegue.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural, no soporta tool calling ni agentes, y no puede sustituir a un LLM o VLM en ninguna tarea de ese tipo.
- Sesgos y generalización: el comportamiento se deriva de un conectoma de *Drosophila* macho adulto, por lo que las respuestas están limitadas al repertorio sensoriomotor del insecto (quimiotaxis, evasión, locomoción) y no cubren tareas cognitivas superiores.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe riesgo de comportamiento espurio o inestable fuera de las condiciones de simulación declaradas (6 terrenos, 400 episodios).
- La model card cita una publicación "Nature 2026" y un conectoma "MaleCNS 2026" cuyos enlaces de referencia (`janelia.org`) no apuntan a un artículo concreto en la información disponible; la procedencia científica debería contrastarse de forma independiente.
- Cobertura de idiomas de la documentación: inglés y coreano únicamente, lo que puede dificultar el soporte en otros entornos.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución y sin garantía; no se declaran restricciones adicionales, pero tampoco se declara explícitamente la licencia del firmware o de los datos derivados del conectoma.
- Producción: no se documentan tolerancias de fallo, ni validación sim-to-real en hardware específico con cifras de éxito en el mundo físico, ni herramientas de monitorización, por lo que el uso en sistemas críticos de seguridad no está justificado con la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hwihwalab/malecns-connectome-robotics-2026
- Demo interactiva 3D (HuggingFace Spaces): https://huggingface.co/spaces/hwihwalab/neuro-robo-studio
- Documentación en coreano (README_KR.md): https://huggingface.co/hwihwalab/malecns-connectome-robotics-2026/blob/main/README_KR.md
- Firmware de despliegue (arduino_esp32_firmware.cpp): https://huggingface.co/hwihwalab/malecns-connectome-robotics-2026/blob/main/arduino_esp32_firmware.cpp
- Resultados de benchmark declarados (benchmark_results.json): https://huggingface.co/hwihwalab/malecns-connectome-robotics-2026/blob/main/benchmark_results.json
- Librería LeRobot: https://huggingface.co/lerobot
- Referencia de conectoma citada (Janelia): https://janelia.org
- Licencia MIT: https://opensource.org/licenses/MIT
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; las búsquedas devolvieron únicamente páginas de agencias de viajes sin relación con el modelo.
