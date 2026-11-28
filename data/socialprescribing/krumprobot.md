# socialprescribing/KrumpRobot

## Resumen

KrumpRobot v2.2 es un sistema de IA física (physical AI) para el control de humanoides bípedos, desarrollado por el usuario `socialprescribing` y publicado bajo licencia Apache-2.0. No es un modelo de lenguaje: es un pipeline de generación de movimiento y control robótico que combina un generador neuronal de movimiento condicionado por fase (`1,01 M` parámetros), un módulo de Conditional Flow Matching sobre cuantización vectorial residual (`2x64` RVQ) con rotaciones `SO(3)` en representación 6D, y un modelo de mundo (`KR-WM-MPC`, `973.386` parámetros) que alimenta un controlador predictivo por disparo de candidatos (shooting MPC) a 50 Hz.

El sistema se entrena a partir de `2.955` fotogramas monoculares de una actuación real de Krump a 140 BPM, complementados con el dataset AMASS, y se valida en bucle cerrado sobre el humanoide Unitree G1 (29 grados de libertad) dentro de MuJoCo 4.0.1, incluyendo un modelo no lineal de actuador QDD con back-EMF, holgura de engranajes planetarios y calentamiento de estator. La propuesta resuelve el problema de generar movimiento expresivo y físicamente plausible en humanoides, manteniendo estabilidad ante empujones, hielo, retardo de sensores y cambios de tempo.

Su relevancia actual radica en que demuestra que un modelo de mundo compacto (menos de 1 M de parámetros) puede igualar o superar a un MPC escalar y a políticas RL de referencia en cinco ejes de sim-to-real, con latencias de `1,23 ms` (p50) en CPU y sin ensayos en robot físico. El repositorio ocupa `0,1 GB` y el pipeline declarado es `robotics`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador de movimiento condicionado por fase + Conditional Flow Matching (`KrumpFlow-CFM`) sobre `2x64` RVQ y rotaciones `SO(3)` 6D; modelo de mundo `KR-WM-MPC`; política residual PPO (`KR-WM-ResPPO`) |
| Parametros totales | `1,01 M` (generador); `973.386` (`KR-WM-MPC`); `238.139` (`KR-WM-ResPPO`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal de rollout open-loop de `0,5 s` / `15` pasos) |
| Tipos de cuantizacion | no disponible (RVQ `2x64` es cuantizacion de representacion de movimiento, no de pesos) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de `0,1 GB`; se citan recibos SHA-256 de políticas y CFM) |

## Arquitectura y entrenamiento

El generador de movimiento combina un módulo condicionado por fase con `KrumpFlow-CFM`, un esquema de Conditional Flow Matching que opera sobre una representación de movimiento cuantizada mediante RVQ `2x64` y rotaciones `SO(3)` en forma 6D. La integración se realiza con un ODE midpoint de `K=4` pasos. Sobre esta base, el modelo de mundo `KR-WM-MPC` (`973.386` parámetros) se entrena con `22.184` transiciones de contacto del Unitree G1 con randomización de dominio (coeficiente de fricción `μ ∈ [0,12, 1,15]`, empujones laterales de pelvis de `0–210 N`) y se evalúa sobre `5.470` ventanas temporales retenidas sin solapamiento. La política `KR-WM-ResPPO` (`238.139` parámetros) se entrena on-policy con PPO recortado y GAE durante `12` iteraciones y `104.304` subpasos a 200 Hz en MuJoCo 4.0.1, con condicionamiento causal sobre la creencia del modelo de mundo y compuertas de seguridad desacopladas para tren inferior y superior.

La innovación técnica principal es la verificación en bucle cerrado con física de actuador no lineal: se modela el recorte par-velocidad por back-EMF de una PMSM, la holgura de engranajes planetarios con histéresis de `±0,015 rad` y el calentamiento por cobre `I²R` con rizado FOC. El sistema se entrena en Modal Cloud a partir de `2.955` fotogramas monoculares y una prior expresiva de `5.084` fotogramas de Cartwheel, y declara `N = 0` ensayos en robot físico. Los resultados se acompañan de recibos SHA-256 para reproducibilidad (`7a3736e3…`, `d066e7f5…`, `559a8ac4…`, `ecb201ef…`, `3375e850…`).

## Capacidades

- Generación de movimiento humanoide expresivo (Krump) condicionado por fase y tempo, con generalización a coreografías retenidas.
- Control de cuerpo flotante en bucle cerrado sobre Unitree G1 de 29 DoF, incluyendo verificación de actuador QDD no lineal.
- Control predictivo por disparo de candidatos (`6` candidatos) a 50 Hz con latencia p50 de `1,23 ms` y p99 de `1,28 ms` en CPU.
- Detección temprana de riesgo de caída a `300 ms` con `ROC-AUC = 0,9933` y `Brier = 0,0082`.
- Inferencia de fricción del suelo sin cámara a partir de historial propioceptivo de deslizamiento de `10` pasos, con `R² = 0,4043` y detección de transiciones a hielo en `100 ms`.
- Política residual PPO tolerante a retardo FIFO de `20 ms`, ruido de sensores, empujones de `135–195 N`, carga extra de torso del `20 %` y pendiente de escenario de `4,5°`.
- Control zero-shot de Cartwheel a 29 DoF mediante RL de stepping.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de LLM; el sistema implementa planificación MPC multi-paso.
- Capacidades multilingües: no disponible; el modelo declara únicamente `en`.
- Capacidades especiales: modelo de mundo con cabeza de fricción propioceptiva, gating de seguridad por tren corporal y verificación térmica de estator.

## Casos de uso

- Coreografía generativa para humanoides de investigación: el generador condicionado por fase permite producir secuencias de danza a distintos tempos (115, 140 y 165 BPM) que la política residual ejecuta con supervivencia del 100 % en el barrido multi-tempo, útil para estudiar expresividad en robótica.
- Control robusto ante superficies de baja fricción: la cabeza de fricción propioceptiva infiere transiciones a hielo en `100 ms` sin cámara, lo que permite a un robot de servicio ajustar el paso en entornos con derrames o superficies pulidas.
- Recuperación ante empujones en entornos humanos: con supervivencia `5/5` ante empujones de `135–195 N` y fricción `μ = 0,12`, el sistema es adecuado para pruebas de seguridad en robots que comparten espacio con personas.
- Validación de controladores antes de despliegue físico: el pipeline en MuJoCo 4.0.1 con actuador QDD no lineal y verificación térmica (`88,51 °C` de pico en estator) permite descartar controladores inestables sin ensayos en hardware.
- Benchmarking de modelos de mundo para robótica: `KR-WM-MPC` sirve como referencia reproducible (recibos SHA-256) para comparar predictores de riesgo de caída y de error de seguimiento en humanoides.
- Investigación en sim-to-real con retardo y ruido: la evaluación R3 con FIFO de `20 ms`, ruido de sensores y empujones permite estudiar Robustez de políticas antes de transferir a un G1 real.
- Generación de datos sintéticos de movimiento para entrenamiento: el generador y la prior de Cartwheel pueden producir trayectorias etiquetadas para aumentar datasets de control.

## Benchmarks y rendimiento

Generación de movimiento (`KrumpFlow-CFM`, 5 semillas, split retenido `[78,73–98,47 s]`, sin solapamiento):

| Metrica | K308 GRU | Direct-Quat-GRU | KrumpFlow-CFM |
|---|---|---|---|
| Error geodésico 1 paso | `18,58°` | `16,80 ± 0,65°` | `2,20 ± 0,02°` |
| Error rollout open-loop `0,5 s` | no disponible | no disponible | `16,81 ± 0,48°` |
| FMD | `5,90` | no disponible | `1,745 ± 0,101` |
| Foot-skate | `15,29 %` | no disponible | `4,15 ± 1,75 %` |
| Latencia mediana CPU | no disponible | no disponible | `1,26 ms` |

Modelo de mundo (`KR-WM-MPC`, `5.470` ventanas retenidas):

| Metrica | Valor |
|---|---|
| ROC-AUC riesgo de caída a 300 ms | `0,9933` |
| Brier | `0,0082` |
| MPJPE R² | `0,8076` |
| Torque utilization R² | `0,4585` |
| Fricción `μ̂_t` R² | `0,4043` |
| Latencia MPC 50 Hz (p50 / p99) | `1,23 ms` / `1,28 ms` |

Política residual PPO (`KR-WM-ResPPO`, cinco ejes):

| Regimen | Supervivencia | MPJPE | Upper RMSE |
|---|---|---|---|
| R1 nominal (`μ = 1,0`) | `5/5` | `32,65 mm` | `4,41°` |
| R2 hielo + empujón (`μ = 0,12`, `135–195 N`) | `5/5` | `86,31 mm` | no disponible |
| R3 retardo `20 ms` + ruido + empujón | `5/5` | `37,01 mm` | `5,22°` |
| R4 carga `+20 %` + pendiente `4,5°` + empujón | `5/5` | `44,69 mm` | `5,20°` |
| R5 barrido multi-tempo (115/140/165 BPM) | `9/9` | no disponible | `4,23°` / `4,60°` / `4,84°` |

Política con conciencia de actuador (`KR-WM-ResPPO-ActAware`): supervivencia `5/5`, Upper-Body RMSE de `5,07°`, chatter de holgura de `297,5 Hz` y resistencia térmica continua de `60,0 s` (`12.000` subpasos) con RMSE de `4,18°`, MPJPE de `35,51 mm` y pico de estator de `88,51 °C`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los modelos son de tamaño muy reducido (menos de 1 M de parámetros cada uno) y la latencia declarada se mide en CPU.
- GPU recomendadas: no disponible; el benchmark de MPC reporta latencias p50/p99 en CPU, sin requisitos de GPU especificados.
- Cabe en GPU consumer: previsiblemente sí por tamaño, pero no se confirma en la información disponible.
- Opciones de despliegue: MuJoCo 4.0.1 como simulador de verificación; entrenamiento en Modal Cloud; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: `1,26 ms` mediana en CPU para `KrumpFlow-CFM`; `1,23 ms` p50 y `1,28 ms` p99 para el MPC a 50 Hz; `1,262 ms` de latencia combinada mediana en el entrenamiento PPO.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KrumpRobot v2.2 (`KR-WM-ResPPO`) | `1,01 M` + `973.386` + `238.139` | rollout `0,5 s` | `5/5` supervivencia en R1–R4; `4,41°` Upper RMSE en R1 | Apache-2.0 | Hugging Face |
| Cartwheel-RL (referencia interna) | no disponible | no disponible | `4,41°` Upper RMSE superado por `-12,3 %` en R1 | no disponible | no disponible |
| MPC escalar (referencia interna) | no disponible | no disponible | `4,48°` Upper RMSE en R1 | no disponible | no disponible |
| Naive-HighGain (referencia interna) | no disponible | no disponible | colapso `3/5` en R2; chatter `-18,4 %` vs. ActAware | no disponible | no disponible |

No se dispone de comparación con sistemas externos de generación de movimiento humanoide en la información proporcionada.

## Limitaciones y advertencias

- El modelo declara `N = 0` ensayos en robot físico: todos los resultados son de simulación en MuJoCo 4.0.1, por lo que la transferencia real no está verificada.
- El entrenamiento parte de `2.955` fotogramas monoculares de una única actuación de Krump a 140 BPM y de la prior de Cartwheel; la diversidad de estilos y morfologías es limitada.
- El idioma declarado es únicamente `en`; no se documentan capacidades multilingües.
- La especialización es estrecha: no es un modelo de propósito general ni un LLM, y no soporta tool calling ni agentes conversacionales.
- La cabeza de fricción propioceptiva tiene un `R² = 0,4043`, lo que indica capacidad predictiva moderada y riesgo de error en transiciones de superficie no vistas.
- El modelo de mundo presenta un `R²` de utilización de par de `0,4585`, inferior al de MPJPE, lo que sugiere menor fiabilidad en la estimación de esfuerzo articular.
- La verificación térmica alcanza `88,51 °C` de pico en estator en duty continuo de `60 s`; no se documentan márgenes para duty cycles más largos.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; los recibos SHA-256 deben validarse antes de reproducir resultados.
- No se documentan sesgos demográficos ni de comportamiento, pero la dependencia de un único performer introduce sesgo estilístico y antropométrico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/socialprescribing/KrumpRobot
- Space interactivo 3D WebGL + Contact Lab: https://huggingface.co/spaces/socialprescribing/KrumpRobot
- Preprint de robótica (26 páginas, PDF): `krumprobot-physical-ai-paper.pdf` (incluido en el repositorio)
- Dataset AMASS: no se proporciona URL directa en la información disponible
- Modal Cloud: https://modal.com
- MuJoCo 4.0.1: no se proporciona URL directa en la información disponible
- Unitree G1 / H1: no se proporciona URL directa en la información disponible
