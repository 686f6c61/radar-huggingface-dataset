# hwihwalab/microduck-3d-bipedal-teleop

## Resumen

MicroDuck 3D Bipedal Teleop es una política de control por aprendizaje por refuerzo para un robot bípedo de 14 grados de libertad (GDL) con capacidad de locomoción y patinaje sobre ruedas pasivas. Lo desarrolla Hwihwa Lab en colaboración con ConnectAI Lab y Link01, y se distribuye como un modelo ONNX pensado para inferencia en tiempo real a 50 Hz. No es un modelo de lenguaje: es una política de control sensorimotor que mapea observaciones propioceptivas y comandos de velocidad a consignas articulares para 14 servos Dynamixel XL330-M6.

El modelo resuelve el problema clásico de sim-to-real en robótica legged: entrenado en MuJoCo 3.x con el framework RSL-RL (PPO), incorpora modelos dinámicos del actuador BAM 1.0.1 que reproducen caída de tensión, fuerza contraelectromotriz y fricción de Coulomb no lineal de una batería LiPo 2S (6,5 V–8,2 V). Además, aplica un buffer de latencia de comunicación aleatorizado de 15–30 ms durante el entrenamiento para evitar chatter y resonancias de alta frecuencia en los servos reales.

Su relevancia actual radica en la combinación de una política de control de alta precisión con un cockpit de teleoperación 3D en WebGL (Three.js) y un gemelo digital ejecutable en navegador, lo que facilita la evaluación y el despliegue sin necesidad de hardware físico. El repositorio incluye pesos ONNX, dataset de teleoperación a 50 Hz y scripts de lanzamiento local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control por reinforcement learning (PPO, RSL-RL) sobre robot bípedo de 14 GDL |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación propia del entorno de control) |
| Tipos de cuantización | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, ko (documentación; el modelo no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (inferencia con ONNX Runtime a 50 Hz) |

## Arquitectura y entrenamiento

La política se entrena con PPO dentro del framework RSL-RL sobre el simulador físico MuJoCo 3.x. El robot objetivo es un bípedo de 14 GDL equipado con 14 servos Dynamixel XL330-M6 alimentados por una batería LiPo 2S a 7,4 V. El entrenamiento incorpora el modelo dinámico BAM 1.0.1, que simula caída de tensión, fuerza contraelectromotriz y pérdidas por fricción de Coulomb no lineal en el rango de 6,5 V a 8,2 V, acercando la dinámica simulada a la del hardware real.

Una innovación destacable es el buffer de latencia de actuador: durante el entrenamiento se impone un retardo de comunicación aleatorizado de 15–30 ms (delay_lag de 3 a 6 pasos), lo que previene el chatter de los servos y las resonancias de alta frecuencia en el robot físico. La escala de entrenamiento es de 196.608.000 transiciones (4.096 entornos × 24 pasos × 2.000 iteraciones). El control se ejecuta a 50 Hz (20 ms por ciclo) mediante ONNX Runtime, y el modelo incluye un gemelo digital en WebGL con Three.js para visualización y teleoperación en tiempo real.

## Capacidades

- Locomoción bípeda de 14 GDL con tasa de éxito de marcha declarada del 100 %.
- Velocidad omnidireccional máxima de 0,35 m/s con seguimiento de velocidad de RMSE 0,016 a 0,20 m/s.
- Patinaje sobre ruedas pasivas (roller-skating) y deslizamiento a alta velocidad.
- Control sensorimotor en tiempo real a 50 Hz mediante ONNX Runtime.
- Teleoperación en un cockpit 3D WebGL (Three.js) con gemelo digital en navegador.
- Sim-to-real con dinámica de actuador BAM (caída de tensión, back-EMF, fricción de Coulomb).
- Robustez frente a latencia de comunicación de 15–30 ms.
- Soporte de despliegue local mediante scripts (`run_web.ps1`, `run_simulator.ps1`) y visor nativo MuJoCo C++.
- Documentación bilingüe en inglés y coreano.

## Casos de uso

- Investigación en locomoción bípeda: la política sirve como referencia reproducible para estudiar el efecto de la dinámica de actuador y la latencia en el rendimiento de marcha, con 196,6 M de transiciones de entrenamiento documentadas.
- Sim-to-real en robots de bajo coste: el modelado BAM de los servos XL330-M6 a 7,4 V permite transferir la política a hardware real con batería LiPo 2S sin reentrenamiento extensivo.
- Teleoperación remota: el cockpit WebGL permite controlar el robot o su gemelo digital desde el navegador, útil para demostraciones, formación y validación de comandos de velocidad.
- Gemelo digital para pruebas de control: el simulador MuJoCo y la vista Three.js permiten iterar sobre políticas y comandos sin riesgo para el hardware físico.
- Benchmark de políticas de control: las métricas declaradas (éxito de marcha, RMSE de seguimiento, par pico, consumo) permiten comparar políticas de locomoción en condiciones equivalentes.
- Educación y divulgación en robótica: la combinación de robot bípedo, patinaje y visualización 3D facilita explicar conceptos de RL, sim-to-real y control sensorimotor.
- Prototipado de robots lúdicos o de compañía: la morfología de pato bípedo con patinaje abre líneas de producto en robótica de entretenimiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Valor |
|---|---|
| Tasa de éxito de marcha | 100 % |
| Velocidad omnidireccional máxima | 0,35 m/s |
| RMSE de seguimiento de velocidad (norma 0,20 m/s) | 0,016 |
| Par pico del actuador | 0,963 (unidad no especificada) |
| Consumo medio de potencia | 6,4 (unidad no especificada) |
| Transiciones totales de entrenamiento | 196.608.000 |

No se han publicado resultados comparativos con otras políticas de locomoción en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,8 GB e incluye pesos ONNX y activos, pero no se desglosa el tamaño de los pesos.
- GPU recomendadas: no disponible; la inferencia ONNX a 50 Hz es ligera y probablemente ejecutable en CPU, pero no se documentan requisitos mínimos.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; por la naturaleza de la política (14 GDL, 50 Hz) es plausible en GPUs de consumo e incluso en CPU, pero no se confirma.
- Opciones de despliegue: ONNX Runtime (principal), visor nativo MuJoCo C++ (`run_simulator.ps1`), aplicación web 3D (`run_web.ps1`) y Space de Hugging Face.
- Latencia y throughput: control a 50 Hz (20 ms por ciclo); no se documentan cifras de throughput adicionales.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican políticas de locomoción bípeda directamente comparables con especificaciones publicadas (parámetros, contexto, rendimiento, licencia) que permitan una tabla rigurosa.

## Limitaciones y advertencias

- Las métricas de la model card están marcadas como no verificadas (`verified: false`); deben tomarse como declaraciones del autor.
- El modelo está especializado en un robot concreto (14 GDL, servos XL330-M6, batería 2S); no es transferible sin adaptación a otras morfologías o actuadores.
- El rendimiento sim-to-real depende de la fidelidad del modelo BAM y de las condiciones de la batería; variaciones de tensión fuera del rango 6,5–8,2 V pueden degradar el control.
- La latencia de comunicación real debe mantenerse dentro del rango entrenado (15–30 ms); valores superiores pueden provocar inestabilidad.
- No es un modelo de lenguaje ni procesa texto; los idiomas declarados (en, ko) se refieren solo a la documentación.
- Licencia Apache-2.0: permite uso comercial con atribución, pero no se documentan garantías ni soporte.
- No se han publicado análisis de sesgos, robustez ante perturbaciones externas ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwihwalab/microduck-3d-bipedal-teleop
- Space de teleoperación 3D: https://huggingface.co/spaces/hwihwalab/microduck-3d-bipedal-teleop
- Documentación en coreano: https://huggingface.co/hwihwalab/microduck-3d-bipedal-teleop/blob/main/README_KR.md
- MuJoCo: https://mujoco.org
- Modelo de actuador BAM: https://github.com/Rhoban/bam
- ONNX Runtime: https://onnxruntime.ai
- Three.js: https://threejs.org
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
