# burnboom/mujoco-triple-swingup

## Resumen

`burnboom/mujoco-triple-swingup` no es un modelo de lenguaje ni una red neuronal: es un **controlador clásico** publicado como artefacto reutilizable para el problema de swing-up y estabilización de un péndulo triple sobre un carro en MuJoCo. El sistema físico consta de un carro de 1,5 kg sobre un rail, tres varillas de 0,4 m y 0,4 kg cada una, y **un único motor** limitado a ±60 N, con recorrido del carro restringido a ±2,0 m durante la planificación. Se trata, por tanto, de un sistema subactuado de 8 grados de libertad de estado (posición y velocidad del carro más tres ángulos y sus velocidades) controlado con una sola entrada escalar.

El problema que resuelve es relevante porque un lazo de realimentación convencional no puede levantar tres eslabones desde la posición colgante: el *energy shaping* que funciona en el péndulo simple no tiene un análogo escalar con tres eslabones, y la región de atracción del LQR de equilibrio es de aproximadamente 2 grados por eslabón, de modo que ninguna política puramente reactiva cae en ella por azar. La solución adoptada es la arquitectura clásica de la literatura de control óptimo: optimización offline de trayectoria más estabilización por realimentación.

Su valor práctico está en que el repositorio es autocontenido y regenerable: un único fichero Python (sin red neuronal y sin GPU) que contiene modelo, planificador, tracker y runner, junto con la trayectoria nominal resuelta, su schedule de ganancias de seguimiento y la ganancia LQR de captura. El autor lo publica explícitamente como artefactos reutilizables, no como reproducción del método de ningún trabajo previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Controlador clásico en tres etapas: colocación directa (IPOPT) + schedule de ganancias LQR por barrido de Riccati + LQR de horizonte infinito. No es una red neuronal |
| Parametros totales | No aplica: no hay parametros aprendidos. Los artefactos son una trayectoria nominal de 151 nudos y una ganancia LQR de captura de 8 elementos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: no procesa secuencias de texto |
| Tipos de cuantizacion | No aplica: no hay pesos que cuantizar; los ficheros son `float` de NumPy |
| Idiomas soportados | No aplica: no procesa lenguaje natural. La documentacion del repositorio esta en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | No aplica. Artefactos en `.npz` (NumPy): `swingup3_collocated.npz` (`q`, `qd`, `u`) y `swingup3_gains.npz` (`K`, `K_catch`, `q_rel`, `qd_rel`, `u`, `dt`) |
| Dimension del estado | 8 (posicion y velocidad del carro, tres angulos y sus velocidades) |
| Dimension de la accion | 1 (fuerza escalar sobre el carro, limitada a ±60 N) |
| Modelo fisico | Carro de 1,5 kg; tres varillas de 0,4 m y 0,4 kg; recorrido del carro ±2,0 m en planificacion |
| Frecuencias | Control a 50 Hz (dt = 0,02 s), fisica a 200 Hz con integrador `implicitfast` |
| Libreria | mujoco (dependencias: `mujoco`, `numpy`, `casadi`) |
| Pipeline declarado | robotics |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento en el sentido de aprendizaje automatico: no hay descenso de gradiente sobre un objetivo de aprendizaje, ni RLHF, ni DPO, ni dataset. Lo que hay es un pipeline de control en tres fases. En la fase de planificacion se resuelve un problema de colocacion directa con IPOPT en el que posiciones, velocidades, aceleraciones y fuerzas son todas variables de decision; la dinamica entra como restricciones de igualdad locales, lo que produce un jacobiano disperso y evita cadenas largas de diferenciacion. Mantener las aceleraciones como variables (con `D(q)·a - rhs(q, qd, u) = 0` como restriccion) conserva la linealidad en `a` y evita una inversion simbolica de matriz. El coste de esta fase es de 0,29 s.

En la fase de seguimiento se explota una linearizacion del propio simulador: el sistema de tres pendulos es caotico, por lo que el plan no sirve en lazo abierto. Se linealiza la transicion de MuJoCo alrededor de cada nudo con `mjd_transitionFD` y se barre la recursion de Riccati hacia atras desde el coste-a-ir del controlador de equilibrio, obteniendo un schedule de ganancias `K` de forma [151, 1, 8]. La fase de captura entrega el control a un LQR de horizonte infinito alrededor de la posicion vertical. El resultado se materializa en un schedule a 50 Hz que se aplica como `u_k = u[k] - K[k] @ (x - x_nom[k])` durante el plan y `u = -K_catch @ x` despues.

El detalle tecnico mas relevante documentado es el acoplamiento con la fisica real de la simulacion: la inercia debe leerse del modelo compilado de MuJoCo, no de formulas de varilla ideal, porque los extremos de las capsulas la hacen aproximadamente un 1 % mayor. Planificar con la inercia de varilla ideal provoca divergencia exponencial del tracker (0,7 grados a los 0,6 s y 23,7 grados a los 1,5 s) y satura el motor con un 0 % de exito.

## Capacidades

- **Swing-up de pendulo triple subactuado**: levanta y estabiliza tres eslabones desde la posicion colgante con un unico actuador de ±60 N.
- **Estabilizacion en vertical**: mantiene la configuracion invertida mediante LQR de horizonte infinito con un error final maximo de 0,04 grados.
- **Generacion de trayectoria optima**: resuelve la trayectoria nominal con colocacion directa y IPOPT en 0,29 s.
- **Seguimiento robusto de trayectoria**: aplica un schedule de ganancias dependiente del tiempo (`K` de forma [151, 1, 8]) que evita la divergencia del replay en lazo abierto.
- **Regeneracion de artefactos**: el script regenera trayectoria y ganancias desde cero en menos de un segundo.
- **Ejecucion sin GPU ni red neuronal**: solo requiere `mujoco`, `numpy` y `casadi`.
- **Modo headless y modo visualizacion**: `python triple_swingup_standalone.py` imprime las tres fases; `--view` abre el visor de MuJoCo.
- **Reutilizacion de artefactos precomputados**: permite cargar `swingup3_gains.npz` y aplicar el control sin re-resolver.
- **No dispone de**: generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, capacidades de agente, multilingueismo ni ninguna otra capacidad propia de un modelo de lenguaje.

## Casos de uso

- **Docencia de control optimo y no lineal**: el repositorio concentra planificacion, seguimiento y captura en un unico fichero ejecutable en menos de un segundo, lo que permite mostrar en clase la diferencia entre un plan en lazo abierto y su tracking, con numeros concretos de fracaso del replay (termina en -520, -397 y -784 grados).
- **Banco de pruebas de algoritmos de optimizacion de trayectoria**: sirve como caso de referencia para comparar colocacion directa con disparo simple o con metodos basados en gradiente; la model card documenta que el disparo simple con 128 reinicios aleatorios se estanca en 17,5 grados frente a los aproximadamente 3 necesarios, con el mismo coste durante 250 iteraciones.
- **Baseline determinista para aprendizaje por refuerzo**: el plan nominal y el tracker con 100 % de exito en 24 ensayos proporcionan una referencia cuantitativa contra la que medir politicas de RL en swing-up de pendulo triple, especialmente en la tabla de robustez frente a perturbacion inicial.
- **Inicializacion de MPC o de esquemas feedforward+PD en tiempo real**: los 151 nudos a 50 Hz (3,02 s de swing-up) con fuerzas nominales `u` y ganancias `K` se pueden cargar como warm start o como referencia de un MPC que opere a la misma frecuencia sobre hardware embebido.
- **Verificacion de modelos de simulacion y pruebas de regresion**: los dos fallos documentados (inercia de capsula un 1 % mayor que la de varilla ideal, y contactos espurios entre la caja del carro y la capsula del rail que amortiguan el carro y disparan las ganancias LQR a ~1e4) son casos de prueba reproducibles para validar modelos MuJoCo y su configuracion de `contype`/`conaffinity`.
- **Hardware-in-the-loop sobre una maqueta de carro y pendulos**: los artefactos `swingup3_gains.npz` permiten aplicar directamente `u_k = u[k] - K[k] @ (x - x_nom[k])` a un rig fisico, con la advertencia de que el repositorio no incluye validacion en hardware y de que la trayectoria depende del modelo concreto.
- **Analisis de sensibilidad a perturbaciones iniciales**: la tabla de robustez (100 % de captura hasta 0,02 rad de ruido, 84 % a 0,04 rad) permite estudiar como decae el margen de captura al aumentar la incertidumbre en el estado inicial, con 64 episodios por fila.
- **Replanificacion rapida ante cambios de parametros**: dado que una resolucion completa cuesta 0,29 s, es viable regenerar trayectoria y ganancias al variar masas, longitudes o limites de par, en lugar de reutilizar un plan fijo.

## Benchmarks y rendimiento

Resultados medidos en MuJoCo por el autor, 24 ensayos independientes con perturbacion inicial aleatorizada:

| Metrica | Valor |
|---|---|
| Tiempo de resolucion de trayectoria (IPOPT) | 0,29 s |
| Capturado y mantenido | 24 / 24 (100 %) |
| Peor angulo final | 0,04 grados |
| Fuerza pico del motor | 36,6 N de un limite de 60 N |
| Duracion del swing-up | 3,02 s |

Robustez frente a la perturbacion inicial, 64 episodios por fila:

| Ruido inicial | Capturado |
|---|---|
| 0,00 rad | 100 % |
| 0,01 rad (0,57 grados) | 100 % |
| 0,02 rad (1,15 grados) | 100 % |
| 0,04 rad (2,29 grados) | 84 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K ni similares), que no aplican a este artefacto.

## Requisitos de hardware

- **VRAM**: ninguna. El controlador no usa GPU en ninguna fase (ni planificacion, ni tracking, ni inferencia).
- **CPU**: cualquier CPU capaz de ejecutar MuJoCo; no se especifica modelo ni frecuencia en la informacion disponible.
- **GPU**: no recomendadas ni necesarias.
- **Compatibilidad con GPU de consumo**: no aplica, al no requerir GPU.
- **Dependencias de despliegue**: `pip install mujoco numpy casadi`; el resolvedor IPOPT llega a traves de CasADi.
- **Formas de ejecucion**: script autonomo headless, script con visor MuJoCo (`--view`) y consumo de artefactos `.npz` desde Python. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que no aplican.
- **Latencia y throughput**: resolucion de trayectoria 0,29 s; bucle de control a 50 Hz (dt de 0,02 s); fisica a 200 Hz con `implicitfast`. No se publican medidas de throughput ni de latencia por paso de control.
- **Almacenamiento**: el repositorio ocupa 0,0 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros controladores comparables, y no se han facilitado cifras de implementaciones alternativas. La model card menciona, como referencia bibliografica del problema y no como comparacion numerica, la validacion en hardware publicada por Glueck, Eder y Kugi en *Automatica* (2013) sobre swing-up de pendulo triple, y aclara expresamente que este repositorio es una implementacion independiente en MuJoCo de la arquitectura general (optimizacion offline de trayectoria mas estabilizacion por realimentacion), no una reproduccion del metodo ni de los parametros de ese trabajo.

## Limitaciones y advertencias

- **Caos y sensibilidad extrema**: el replay en lazo abierto de las fuerzas nominales desde el estado inicial planificado termina en -520, -397 y -784 grados. El plan debe seguirse con realimentacion, nunca reproducirse a ciegas.
- **Vulnerabilidad a errores de modelo**: usar la inercia de varilla teorica en lugar de la del modelo compilado (los extremos de las capsulas anaden un ~1 %) hace divergir el tracker de forma exponencial (0,7 grados a 0,6 s, 23,7 grados a 1,5 s) y satura el motor con 0 % de exito.
- **Robustez limitada en el estado inicial**: el exito cae del 100 % a 0,02 rad de ruido al 84 % a 0,04 rad (2,29 grados). No se documentan margenes mas alla de ese rango.
- **Sin validacion en hardware**: todos los resultados son de simulacion en MuJoCo; no hay evidencia publicada de transferencia a un rig fisico.
- **Acoplamiento al modelo concreto**: la trayectoria y las ganancias dependen de las masas, longitudes, limites de par y geometria de este modelo. Cambiar cualquiera de esos parametros invalida los artefactos `.npz` y obliga a replanificar.
- **Trampas de configuracion del simulador**: si la caja del carro y la capsula del rail son colisionables, MuJoCo genera contactos espurios que amortiguan el carro, se traga la fuerza del motor, produce ganancias LQR del orden de 1e4 y hace caer al controlador de inmediato; el autor indica `contype=0 conaffinity=0` en todo el modelo.
- **Restricciones del integrador**: `mjd_transitionFD` no acepta el integrador RK4; hay que usar `implicitfast` con paso mas fino y componer la linealizacion por subpasos como `A = As^n`, `B = (I + As + ... + As^(n-1))·Bs`, exacto para retencion de orden cero.
- **Los metodos de disparo simple no bastan**: el autor documenta que el disparo simple con 128 reinicios aleatorios se estanca en 17,5 grados frente a los ~3 necesarios, con coste identico durante 250 iteraciones, y que la continuacion por gravedad empeora el resultado. No es una limitacion de energia ni de actuador: elevar los tres eslabones cuesta 14,1 J y el solver nunca usa mas de 36 de los 60 N.
- **Ausencia total de capacidades generativas**: no es un modelo de lenguaje, no procesa texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- **Licencia**: apache-2.0, permisiva para uso comercial y modificacion, con los requisitos habituales de atribucion y conservacion del aviso de licencia. No se declaran restricciones adicionales.

## Enlaces

- Pagina de HuggingFace: https://huggingface.co/burnboom/mujoco-triple-swingup
- Fichero principal del repositorio: `triple_swingup_standalone.py`
- Artefacto de trayectoria nominal: `swingup3_collocated.npz`
- Artefacto de ganancias: `swingup3_gains.npz`
- Imagen de resultado: `triple_swingup_balanced.png`
- Referencia bibliografica citada en la model card: Glueck, Eder y Kugi, *Automatica*, 2013 (validacion en hardware del swing-up de pendulo triple). No se proporciona URL.
- La busqueda web realizada no devolvio ningun enlace relevante para este modelo: los resultados obtenidos corresponden a sitios de centros escolares de Erfurt sin relacion con el repositorio.
