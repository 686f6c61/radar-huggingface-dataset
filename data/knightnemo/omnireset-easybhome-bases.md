# knightnemo/omnireset-easybhome-bases

## Resumen

OmniReset easyBhome base diffusion policies es un conjunto de tres políticas de difusión condicionadas al estado (state diffusion policies) entrenadas mediante aprendizaje por imitación (behavior cloning) para las tres tareas del benchmark OmniReset easyBhome: inserción de clavija (peg), montaje de pata (leg) y apertura de cajón (drawer). El modelo está desarrollado por knightnemo (Siqiao Huang), investigador de la clase Yao de la Universidad de Tsinghua, y se publica bajo licencia MIT.

El modelo resuelve el problema de control robótico contact-rich mediante políticas de difusión que modelan la distribución de acciones expertas. Se entrenó sobre 200 episodios de demostraciones expertas durante 1000 épocas, con selección de checkpoint basada en tasa de éxito en entorno simulado (512 episodios, 256 entornos) en lugar de pérdida de validación, una decisión metodológica relevante porque la pérdida de validación correlaciona mal con el rendimiento real en estas tareas. El repositorio incluye los pesos en formato PyTorch (0.8 GB) junto con métricas de entrenamiento y resultados de evaluación por checkpoint.

La relevancia actual de este modelo radica en que documenta un protocolo de selección de checkpoints basado en éxito en entorno, un problema práctico habitual en aprendizaje por imitación para robótica, y forma parte del ecosistema OmniReset, un proyecto que usa RL a gran escala (64K+ entornos) para cubrir estados de contacto ricos en manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy condicionada al estado (state diffusion policy) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (modelo de control robotico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt), payload `base_policy.dp.state_diffusion_policy.v1` |

## Arquitectura y entrenamiento

El modelo implementa una política de difusión condicionada al estado (state-based diffusion policy), una arquitectura que genera acciones mediante un proceso de denoising iterativo. A diferencia de las políticas de difusión condicionadas a visión, esta variante opera directamente sobre el estado del robot y del entorno, sin procesamiento de imágenes. El formato de payload se identifica como `base_policy.dp.state_diffusion_policy.v1` y se carga mediante la funcion `base_policy.furniture_loader.load_furniture_state_policy` del repositorio [Understand_Fleet_RL](https://github.com/knightnemo/Understand_Fleet_RL).

El entrenamiento se realizo sobre 200 episodios de demostraciones expertas del dataset [knightnemo/omnireset-easybhome-demos](https://huggingface.co/datasets/knightnemo/omnireset-easybhome-demos), con 1000 épocas, batch size de 256 y learning rate de 1e-4. Se utilizo una division de validacion a nivel de episodio. La seleccion del checkpoint final se hizo por tasa de éxito en entorno simulado (512 episodios, 256 entornos, replanificacion en cada paso, warmstart), no por perdida de validacion: el checkpoint con mejor perdida de validacion solo alcanza 2.5% de éxito en peg y 19.9% en drawer, mientras que los checkpoints seleccionados por éxito alcanzan 47.5% y 75.4% respectivamente. Cada politica incluye sus metricas de entrenamiento y resultados de evaluacion por checkpoint, junto con `base_selection.json` que documenta el protocolo de seleccion.

## Capacidades

- Control robotico de manipulacion contact-rich: genera acciones para tres tareas de ensamblaje y manipulacion (peg, leg, drawer) en el benchmark OmniReset easyBhome.
- Aprendizaje por imitacion: reproduce comportamientos expertos aprendidos de 200 demostraciones, sin necesidad de recompensas ni RL.
- Generacion de acciones por difusion: modela la distribucion de acciones mediante denoising iterativo, lo que permite generar trayectorias suaves y multimodales.
- Replanificacion en cada paso: el protocolo de evaluacion usa replanificacion a cada paso (replan every step), lo que indica que la politica puede usarse en bucle cerrado con retroalimentacion de estado.
- No incluye capacidades de lenguaje, vision, tool calling ni razonamiento simbolico: es un modelo puramente motor para control de bajo nivel.

## Casos de uso

- Automatizacion de ensamblaje industrial: la politica de peg (47.5% de éxito) puede integrarse en celdas roboticas para insercion de clavijas en procesos de ensamblaje de componentes, reduciendo la necesidad de programacion manual de trayectorias.
- Manipulacion de piezas articuladas: la politica de leg (13.3% de éxito) aborda el montaje de patas, util para mobiliario o estructuras modulares donde la alineacion precisa es critica.
- Apertura de cajones y extraccion: la politica de drawer (75.4% de éxito) es la mas fiable y puede usarse en robots de servicio domestico o almacenes para interactuar con muebles y contenedores.
- Investigacion en aprendizaje por imitacion: el repositorio incluye metricas de entrenamiento y evaluacion por checkpoint, lo que lo convierte en un banco de pruebas para estudiar la correlacion entre perdida de validacion y éxito en entorno.
- Desarrollo de pipelines de RL: al ser parte del ecosistema OmniReset, puede usarse como politica base (base policy) para inicializar o comparar con politicas entrenadas con RL a gran escala (64K+ entornos).
- Benchmarking de algoritmos de diffusion policy: los tres checkpoints con sus protocolos de seleccion documentados permiten comparar variantes de diffusion policy en tareas estandarizadas de manipulacion.

## Benchmarks y rendimiento

El modelo reporta tasas de éxito en entorno simulado para cada tarea, evaluadas con 512 episodios, 256 entornos, replanificacion en cada paso y warmstart:

| Tarea | Época seleccionada | Tasa de éxito |
| --- | --- | --- |
| peg | 700 | 47.5% |
| leg | 500 | 13.3% |
| drawer | 500 | 75.4% |

Como referencia, el checkpoint con mejor perdida de validacion obtiene 2.5% en peg y 19.9% en drawer, lo que evidencia la importancia del protocolo de seleccion. No se proporcionan resultados en benchmarks estandar de robótica como RLBench o MetaWorld, ni comparaciones con otros metodos en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 0.8 GB, lo que sugiere que los checkpoints son ligeros y caben en VRAM de cualquier GPU moderna (incluso 4-6 GB).
- Inferencia en tiempo real: al ser una diffusion policy con replanificacion en cada paso, se requiere inferencia repetida a alta frecuencia; una GPU de gama media como RTX 3060 o superior deberia ser suficiente para las tres tareas.
- Entrenamiento: el entrenamiento se realizo con batch size 256 y 1000 épocas sobre 200 episodios; una GPU con 16-24 GB de VRAM (RTX 4090, A5000) es recomendable para reproducir el entrenamiento completo.
- Despliegue en robot: el modelo esta disenado para integrarse en el stack de [Understand_Fleet_RL](https://github.com/knightnemo/Understand_Fleet_RL); se requiere el cargador `base_policy.furniture_loader.load_furniture_state_policy`.
- Opciones de despliegue: no se mencionan formatos de inferencia optimizados (TensorRT, ONNX, vLLM); el formato nativo es PyTorch.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros modelos de diffusion policy para las mismas tareas. El proyecto OmniReset publica resultados de RL a gran escala en su [web del proyecto](https://weirdlabuw.github.io/omnireset/), pero no se proporcionan numeros comparativos en la informacion disponible. Como referencia cualitativa:

| Modelo | Enfoque | Tareas | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- |
| OmniReset easyBhome bases (este modelo) | Diffusion policy (BC) | 3 tareas easyBhome | MIT | Publico en HF |
| OmniReset (RL a gran escala) | RL con 64K+ entornos | Tareas contact-rich | no disponible | Proyecto de investigacion |
| Diffusion Policy (estandar, Chi et al.) | Diffusion policy visuomotor | Varias tareas de manipulacion | no disponible | Codigo publico |

## Limitaciones y advertencias

- Tasas de éxito limitadas: la politica de leg solo alcanza 13.3% de éxito, lo que la hace inadecuada para uso en produccion sin mejoras adicionales.
- Seleccion de checkpoint critica: seleccionar por perdida de validacion degrada drasticamente el rendimiento (2.5% en peg), lo que indica que el modelo es sensible al protocolo de evaluacion.
- Sin generalizacion demostrada: las politicas se entrenaron para tareas especificas de easyBhome; no hay evidencia de transferencia a otras tareas o entornos.
- Dependencia del stack de carga: los pesos requieren el cargador especifico de Understand_Fleet_RL; no son compatibles con frameworks estandar como PyTorch directamente sin adaptacion.
- Sin soporte de vision: al ser politicas condicionadas al estado, no procesan observaciones visuales, lo que limita su uso en entornos sin acceso a estado completo del robot.
- Modelo de investigacion: con 0 descargas y 0 likes, es un artefacto de investigacion reciente sin validacion por la comunidad.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias de rendimiento ni soporte.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/knightnemo/omnireset-easybhome-bases)
- [Dataset de demostraciones](https://huggingface.co/datasets/knightnemo/omnireset-easybhome-demos)
- [Repositorio Understand_Fleet_RL](https://github.com/knightnemo/Understand_Fleet_RL)
- [Proyecto OmniReset](https://weirdlabuw.github.io/omnireset/)
- [Documentacion OmniReset en UW Lab](https://uw-lab.github.io/UWLab/main/source/publications/omnireset/index.html)
- [Perfil del autor en HuggingFace](https://huggingface.co/knightnemo)
- [Perfil del autor en GitHub](https://github.com/knightnemo)
