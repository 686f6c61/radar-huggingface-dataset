# hwihwalab/microduck-3d-bipedal-teleop

## Resumen

MicroDuck 14-DOF Bipedal Teleop es una política de control para un robot bípedo de 14 grados de libertad con forma de pato, desarrollada por hwihwalab. No es un modelo de lenguaje: se trata de un artefacto de "physical AI" que combina pesos de una política de aprendizaje por refuerzo (PPO sobre RSL-RL) exportada a ONNX, dinámicas de actuador calibradas para sim-to-real y un gemelo digital 3D interactivo en el navegador. El repositorio ocupa 0,5 GB y se publica bajo licencia Apache-2.0.

El problema que resuelve es el de disponer de una política de locomoción bípeda lista para ejecutarse a 50 Hz sobre hardware real, con un modelo de fricción, caída de tensión y back-EMF específico para 14 servos Dynamixel XL330-M6 alimentados por una batería LiPo 2S de 7,4 V (rango 6,5 V a 8,2 V). Además del controlador, el paquete incluye dos pistas operativas: un cockpit web 3D (FastAPI + WebSockets a 40 Hz de telemetría y Three.js WebGL para el volcado de mallas binarias) y un visor nativo de MuJoCo 3.12 en C++.

Es relevante ahora porque ataca dos de los cuellos de botella clásicos del sim-to-real en robots pequeños y baratos: la latencia de comunicaciones (se entrena con retardos aleatorizados de 15 a 30 ms, equivalentes a 3-6 pasos de control) y la fidelidad del actuador. La escala de entrenamiento declarada es de 196.608.000 transiciones (4.096 entornos x 24 pasos x 2.000 iteraciones), lo que el autor equipara a 1.092 horas de marcha comprimidas en unos 35 minutos de cómputo paralelo en GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (PPO, framework RSL-RL); red exportada a ONNX. No es un transformer ni un MoE |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de la política no disponible |
| Tipos de cuantización | no disponible (se distribuye en formato ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | en, ko (idiomas de la documentación y de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (inferencia vía ONNX Runtime a 50 Hz) |
| Grados de libertad | 14 DOF (robot bípedo) |
| Frecuencia de control | 50 Hz (20 ms por ciclo) |
| Actuadores | 14x Dynamixel XL330-M6 con modelo BAM XL330-M6 @ 7,4 V |
| Física / simulador | MuJoCo 3.x (visor pasivo MuJoCo 3.12 en C++) |
| Entorno de entrenamiento | RSL-RL con PPO |
| Telemetría del cockpit web | FastAPI + WebSockets a 40 Hz |
| Entorno de ejecución | Python 3.12+ |
| Tamaño del repositorio | 0,5 GB |
| Fecha de creación / actualización | 2026-09-04 / 2026-10-05 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política se entrena con PPO dentro del framework RSL-RL y se despliega como un grafo ONNX ejecutado con ONNX Runtime en un bucle de control de 50 Hz. El paquete incorpora el modelo dinámico BAM 1.0.1 para sim-to-real, que reproduce la caída de tensión de la batería LiPo 2S (6,5 V a 8,2 V), la fuerza contraelectromotriz y las pérdidas por fricción de Coulomb no lineal de los 14 servos Dynamixel XL330-M6. Sobre ese modelo se aplica un búfer de latencia de actuador que impone retardos aleatorizados de 15 a 30 ms (delay_lag de 3 a 6 pasos) durante el entrenamiento, con el objetivo explícito de evitar chatter y resonancias de alta frecuencia en el servo real.

La escala de entrenamiento es de 196.608.000 transiciones, resultado de 4.096 entornos en paralelo, 24 pasos por iteración y 2.000 iteraciones. El autor la describe como equivalente a 1.092 horas (más de 45 días) de marcha bípeda comprimidas en aproximadamente 35 minutos en un clúster GPU masivamente paralelo. El repositorio también documenta comportamiento de patinaje sobre ruedas pasivas (roller skating), lo que sugiere que la política no se limita a la marcha plantígrada. No se detalla la composición del dataset de teleoperación ni si hubo fases adicionales de imitation learning o ajuste fino.

La arquitectura de despliegue es de doble pista. La pista 1 es un cockpit web 3D con FastAPI y WebSockets que emite telemetría a 40 Hz y transmite mallas binarias directamente desde los búferes de memoria de MuJoCo hacia Three.js WebGL. La pista 2 es un visor nativo de MuJoCo 3.12 en C++ con salida OpenGL pasiva. El lanzamiento se hace con scripts de un solo clic (`run_web.ps1` para la aplicación web autónoma y `run_simulator.ps1` para el visor nativo), lo que indica un entorno de desarrollo orientado a Windows.

## Capacidades

- Locomoción bípeda de 14 DOF con una tasa de éxito de marcha declarada del 100 % en las condiciones de evaluación del autor.
- Desplazamiento omnidireccional con una velocidad máxima declarada de 0,35 m/s y un RMSE de seguimiento de velocidad de 0,016 a una consigna de 0,20 m/s.
- Patinaje y deslizamiento sobre ruedas pasivas, según se documenta con material gráfico propio.
- Teleoperación en tiempo real mediante cockpit web 3D con telemetría a 40 Hz y renderizado WebGL basado en mallas procedentes de los búferes de MuJoCo.
- Ejecución de inferencia a 50 Hz con ONNX Runtime, con latencia de control objetivo de 20 ms por ciclo.
- Simulación física fiel del actuador: caída de tensión, back-EMF y fricción de Coulomb no lineal sobre 14 servos Dynamixel XL330-M6.
- Robustez a retardos de comunicaciones de 15 a 30 ms gracias al entrenamiento con latencia aleatorizada.
- Integración con MuJoCo 3.x tanto en modo visor nativo C++ como en modo gemelo digital web.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni procesamiento de lenguaje natural: es un controlador de locomoción, no un modelo generativo.

## Casos de uso

- Teleoperación remota de un robot bípedo: el cockpit web con Three.js y WebSockets a 40 Hz permite controlar y visualizar el robot desde un navegador, sin instalar el simulador ni el stack de robótica en la máquina del operador.
- Validación de controladores antes del despliegue físico: el gemelo digital reproduce las dinámicas del actuador (caída de tensión, back-EMF, fricción) y permite detectar inestabilidades y chatter sin arriesgar los servos reales.
- Investigación en sim-to-real: el paquete sirve como caso de estudio reproducible de cómo la aleatorización de latencia (15-30 ms) y el modelado eléctrico del actuador afectan a la transferencia de una política PPO al hardware.
- Benchmark de locomoción bípeda en robots de bajo coste: las métricas declaradas (velocidad máxima, RMSE de seguimiento, par pico, consumo) permiten comparar políticas sobre una plataforma de 14 DOF con actuadores Dynamixel de gama de consumo.
- Generación de datos de teleoperación para imitation learning: las sesiones registradas en el cockpit a 40 Hz pueden emplearse como demostraciones para entrenar políticas por imitación o para comparar contra el comportamiento de la política RL.
- Docencia y divulgación en robótica: al ejecutarse con un script de un solo clic y renderizarse en el navegador, es adecuado para prácticas donde el alumnado debe observar el efecto de modificar parámetros de control o de simulación.
- Prototipado de productos con Pollen Robotics y servos Dynamixel: el modelo de actuador BAM XL330-M6 a 7,4 V puede reutilizarse en otros diseños que empleen la misma cadena de actuación.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index. Ninguno de los resultados está marcado como verificado (`verified: false`).

| Métrica | Valor | Verificado |
|---|---|---|
| Tasa de éxito de marcha (Walking Success Rate) | 100 | No |
| Velocidad omnidireccional máxima | 0,35 (m/s) | No |
| RMSE de seguimiento de velocidad (consigna 0,20 m/s) | 0,016 | No |
| Par pico del actuador | 0,963 (unidad no especificada en la model card) | No |
| Consumo medio de potencia | 6,4 (unidad no especificada en la model card) | No |
| Transiciones totales de entrenamiento | 196.608.000 | No |

No se han publicado en la información disponible resultados de benchmarks comparables con otros modelos o políticas (MMLU, HumanEval o equivalentes no aplican a este tipo de artefacto).

## Requisitos de hardware

- VRAM para inferencia: no disponible. La inferencia se ejecuta con ONNX Runtime, por lo que la política puede correr en CPU, pero no se especifican requisitos mínimos ni perfil de memoria.
- GPU recomendadas: no disponible. El autor menciona un "clúster GPU masivamente paralelo" para el entrenamiento (4.096 entornos, 196,6M de pasos, ~35 minutos), sin detallar modelo ni número de aceleradores.
- Compatibilidad con GPU de consumo: no disponible. No hay datos sobre si el entrenamiento o el cockpit web requieren hardware específico.
- Hardware del robot: 14 servos Dynamixel XL330-M6 controlados por el modelo BAM XL330-M6 a 7,4 V, con alimentación desde batería LiPo 2S (6,5 V a 8,2 V).
- Opciones de despliegue: ONNX Runtime para la política; MuJoCo 3.x para la simulación (visor pasivo OpenGL en C++ y gemelo digital WebGL); FastAPI + WebSockets para el cockpit web; Three.js para el renderizado en navegador. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ciclo de control de 50 Hz (20 ms); telemetría del cockpit web a 40 Hz; latencia de comunicaciones tolerada por la política de 15 a 30 ms. No se publican cifras de throughput de simulación.
- Entorno de ejecución: Python 3.12+ y lanzamiento mediante los scripts `run_web.ps1` y `run_simulator.ps1`.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre políticas de locomoción bípeda comparables (ni métricas propias ni de terceros) que permitan una comparación rigurosa. Se indica "no disponible" para todos los campos de comparación.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-3d-bipedal-teleop | no disponible | no aplica | 100 % éxito de marcha, 0,35 m/s (declarado, sin verificar) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 3 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todos los resultados declarados están marcados como no verificados por el autor (`verified: false`); deben tratarse como cifras autoinformadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de reproducción independiente de los resultados.
- Un 100 % de tasa de éxito de marcha corresponde a las condiciones de evaluación definidas por el autor, no a un entorno físico arbitrario; el alcance exacto de esa evaluación no se detalla en la información disponible.
- El alcance de rendimiento está acotado: la velocidad omnidireccional máxima declarada es de 0,35 m/s, propia de un robot de 14 DOF con servos XL330-M6.
- Persisten riesgos de sim-to-real gap: aunque se modelan caída de tensión, back-EMF, fricción de Coulomb y latencia, el propio uso de un modelo de actuador implica simplificaciones frente al servo físico.
- No se publican especificaciones de parámetros de red, arquitectura interna, ventana de observación ni composición del dataset de teleoperación, lo que limita la reproducibilidad.
- Las unidades de las métricas de par pico (0,963) y consumo medio (6,4) no se especifican en la model card; no deben interpretarse sin confirmación del autor.
- Los scripts de lanzamiento son `.ps1`, lo que apunta a un flujo de trabajo centrado en Windows; no se documenta soporte para otros sistemas operativos.
- Idiomas de documentación limitados a inglés y coreano: no hay manual en castellano.
- No hay sesgos de lenguaje que reportar porque el modelo no procesa lenguaje natural; los sesgos aplicables serían de comportamiento físico (por ejemplo, asimetrías de marcha) y no se documentan.
- No hay riesgo de alucinación en el sentido de los modelos generativos, pero sí riesgo de comportamiento inseguro o inestable en el robot real si se despliega fuera del dominio de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y sin garantías. Conviene verificar aparte las licencias de MuJoCo, ONNX Runtime, Three.js, los recursos gráficos y el modelo de actuador BAM antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hwihwalab/microduck-3d-bipedal-teleop
- Demo interactiva 3D en HuggingFace Spaces: https://huggingface.co/spaces/hwihwalab/microduck-3d-bipedal-teleop
- Documentación en coreano (README_KR.md): https://huggingface.co/hwihwalab/microduck-3d-bipedal-teleop/blob/main/README_KR.md
- MuJoCo: https://mujoco.org
- ONNX Runtime: https://onnxruntime.ai
- Three.js: https://threejs.org
- Modelo de actuador BAM (Rhoban): https://github.com/Rhoban/bam
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Python: https://python.org
