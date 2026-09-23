# Daniel-F/rtc-pi05

## Resumen

rtc-pi05 es una implementación independiente de Real-Time Chunking (RTC), una técnica de inferencia que permite ejecutar políticas robóticas de flow matching sin pausas entre fragmentos de acciones (action chunks). No es un modelo de lenguaje ni un checkpoint de pesos: es una librería Python publicada por el usuario Daniel-F que sustituye únicamente la ruta de inferencia de las políticas pi0.5 del framework openpi, generando el siguiente chunk en un hilo de fondo mediante inpainting guiado mientras el chunk actual se sigue ejecutando en el robot.

El algoritmo procede del artículo "Real-Time Execution of Action Chunking Flow Policies" de Black, Galliker y Levine (NeurIPS 2025, arXiv:2506.07339). La idea central es que las acciones ya comprometidas con el robot se congelan y las acciones solapadas del chunk nuevo se acoplan de forma suave mediante máscaras de prefijo y una guía tipo PiGDM, de modo que la transición entre chunks consecutivos es consistente y la ejecución no se bloquea esperando a que termine la inferencia.

Su relevancia es práctica para investigación en robótica: el repositorio aísla la lógica de RTC (controlador asíncrono, enmascarado, bucle de denoising guiado y adaptador fino para `PI0Pytorch`) y la mantiene agnóstica al robot, sin código de cámara ni de tarea, de forma que el usuario aporta su propio checkpoint pi0.5 entrenado con openpi. El núcleo de control y enmascarado funciona solo con numpy, y torch y openpi se importan de forma perezosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal propio: librería de inferencia sobre políticas de flow matching pi0.5 (openpi). Algoritmo: Real-Time Chunking con inpainting guiado y máscaras de prefijo suaves |
| Parametros totales | no disponible (depende del checkpoint pi0.5 que aporte el usuario) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); el horizonte relevante es el action horizon H del checkpoint pi0.5, valor no disponible |
| Tipos de cuantizacion | no disponible (no publica pesos propios; hereda los del checkpoint pi0.5) |
| Idiomas soportados | no disponible / no aplica (artefacto de robótica, sin interfaz de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (el checkpoint pi0.5 que carga el usuario, p. ej. `model.safetensors` + `assets/`); el repositorio en sí es código Python |
| Tipo de artefacto | Librería / algoritmo de inferencia (pipeline: robotics) |
| Librería declarada | rtc-pi05 (`library_name`) |
| Autor | Daniel-F |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 23 de septiembre de 2026 |
| Última actualización (metadatos) | 23 de septiembre de 2026 |
| Dependencias | Python >= 3.11; openpi instalado desde fuente (no está en PyPI); torch para el sampler y el adaptador |
| Módulos incluidos | `rtc/masking.py`, `rtc/controller.py`, `rtc/sampler.py`, `rtc/pi0.py`, `examples/pi05_realtime.py`, `tests/test_masking.py` |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Su núcleo es la ruta de inferencia de RTC, descrita como algoritmo 1 en `rtc/controller.py`: un controlador asíncrono que expone `get_action` (que retorna de inmediato desde el buffer) y lanza la generación del siguiente chunk en un hilo de fondo. `rtc/sampler.py` implementa el bucle de denoising con inpainting guiado en PyTorch, usando `torch.autograd.grad` para calcular la guía, y `rtc/masking.py` implementa las máscaras de prefijo suaves y el peso de guía PiGDM en numpy puro, de forma que el enmascarado es agnóstico al backend. `rtc/pi0.py` es un adaptador fino sobre `PI0Pytorch` de openpi que construye observaciones, muestrea el chunk inicial y decodifica a espacio de robot.

Las convenciones del adaptador siguen openpi: se integra desde ruido en `t=1` hasta datos en `t=0`, y el action expert regresa `v_pi = noise − data`. Los chunks circulan en el espacio de acciones normalizado del modelo (ancho `action_dim`, habitualmente rellenado hasta 32) y se decodifican al espacio del robot con `rtc.pi0.decode_actions`, que aplica las transformaciones de salida de la política (desnormalizado, delta→absoluto).

Los hiperparámetros por defecto son los siguientes:

| Parametro | Defecto | Referencia en el artículo | Significado |
|---|---|---|---|
| `hz` | 30 | 1/Δt | Frecuencia de control |
| `smin` | 6 | s_min | Horizonte mínimo de ejecución; `s = max(d, s_min)` |
| `initial_delay` | 4 | d_init | Semilla del buffer de retardo (pasos de control) |
| `delay_buffer` | 10 | b | Tamano del buffer de retardos recientes (la estimacion es su maximo) |
| `num_steps` | 5 | n | Pasos de denoising |
| `beta` | 5.0 | β | Recorte del peso de guia (apendice A.2) |
| `schedule` | exp | — | Mascara suave; `zeros` equivale al baseline de enmascarado duro |

La restricción de tiempo real es `d ≤ s ≤ H − d`. Si una inferencia guiada tarda más que `H − s` pasos de control, el chunk actual se agota y `get_action` lanza una excepción; las mitigaciones indicadas son bajar `hz`, subir `smin` o reducir `num_steps`.

## Capacidades

- Ejecución asíncrona de políticas de action chunking: genera el siguiente chunk mientras el actual se ejecuta, evitando paradas del robot a la espera de la inferencia.
- Inpainting guiado: congela las acciones ya comprometidas y acopla suavemente las acciones solapadas entre chunks consecutivos.
- Máscaras de prefijo suaves configurables (`exp` frente a `zeros`), con peso de guía PiGDM y recorte `beta`.
- Estimación de retardo en línea mediante buffer de retardos recientes (`delay_buffer`), usada para fijar el horizonte de ejecución.
- Adaptación a checkpoints pi0.5 de openpi: construcción de observaciones, muestreo del chunk inicial y decodificación a espacio de robot con las transformaciones de salida de la política.
- Modo sin robot: `examples/pi05_realtime.py` ejecuta un bucle de control simulado con observaciones sintéticas o con una observación grabada (`--obs-npz`), e imprime el retardo observado `d` comprobando la restricción `d ≤ H − s`.
- Núcleo utilizable sin torch ni openpi: el controlador y el enmascarado funcionan en un proceso con numpy puro.
- Comparación incorporada contra dos baselines: enmascarado duro (`--schedule zeros`) e inferencia síncrona (`policy.infer`).
- No incluye soporte de tool calling, agentes, visión, audio ni capacidades multilingües: es un componente de control robótico.

## Casos de uso

- Manipulación robótica en tiempo real: con `hz` a 30 por defecto, el controlador entrega acciones sin bloquearse mientras el hilo de fondo regenera el chunk, lo que evita microparadas en tareas de manipulación continuas.
- Control de brazos con políticas pi0.5 ya entrenadas: se aporta un checkpoint propio de openpi y RTC sustituye solo la ruta de inferencia, sin reentrenar ni tocar el modelo base.
- Evaluación de latencia en laboratorio: el ejemplo sin robot imprime el retardo observado `d` y verifica `d ≤ H − s`, lo que permite medir si la GPU disponible cumple la restricción de tiempo real antes de desplegar en hardware.
- Comparación de estrategias de chunking: el script permite alternar entre RTC guiado, enmascarado duro (`--schedule zeros`) e inferencia síncrona sobre la misma política y las mismas observaciones, aislando el efecto del algoritmo.
- Integración en un bucle de inferencia propio: `RealTimeChunkingController` acepta una `inference_fn` definida por el usuario, de modo que se puede insertar en un stack de control existente que ya gestione lectura de sensores y envío de comandos.
- Experimentos en simulación tipo LIBERO: la configuración de ejemplo (`pi05_libero`) y la posibilidad de alimentar observaciones grabadas permiten reproducir episodios sin acceso a un robot físico.
- Investigación sobre inpainting y guía: al ser `rtc/masking.py` numpy puro y estar cubierto por tests de propiedades, se puede estudiar el efecto de distintas máscaras y pesos de guía sin depender de torch.
- Reutilización como referencia de implementación: el código sirve para trasladar RTC a otros backends de políticas de flujo, dado que solo el adaptador `rtc/pi0.py` es específico de openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de éxito en tareas (por ejemplo LIBERO u otras suites), ni latencias medidas, ni comparativas numéricas frente a los baselines de enmascarado duro o inferencia síncrona; únicamente describe cómo ejecutar esas comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende por completo del checkpoint pi0.5 que se cargue; the repositorio no declara requisitos de memoria.
- GPU recomendadas: no disponible. El ejemplo usa `--device cuda` y el adaptador recibe `pytorch_device="cuda"`, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible (no se indica ninguna GPU concreta ni tamano de modelo).
- Opciones de despliegue: uso directo como paquete Python instalado con `pip install -e ".[torch,dev]"` en un entorno que ya contenga openpi y torch. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un componente de control robótico.
- Latencia y throughput: no se publican cifras. El propio algoritmo mide el retardo de inferencia `d` en tiempo de ejecución y exige `d ≤ s ≤ H − d`; el ejemplo por defecto ejecuta 60 pasos a 30 Hz.
- Requisitos de software: Python >= 3.11 y openpi instalado desde fuente en el mismo entorno (no está en PyPI).
- Vía ligera: el controlador y el enmascarado pueden ejecutarse sin torch ni openpi, en un proceso con numpy.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos o librerías comparables en la documentación proporcionada. La única comparación descrita por el autor es interna, entre la propia RTC y sus dos baselines de ejecución:

| Enfoque | Mecanismo | Consistencia entre chunks | ¿Bloquea la ejecución? |
|---|---|---|---|
| rtc-pi05 (RTC guiado) | Hilo de fondo con inpainting guiado; acciones comprometidas congeladas y solapadas acopladas suavemente | Objetivo explícito del algoritmo | No: `get_action` retorna de inmediato desde el buffer |
| Baseline de enmascarado duro (`--schedule zeros`) | Máscara de prefijo binaria, sin guía suave | No garantizada por el algoritmo | No, pero sin el acoplamiento suave |
| Inferencia síncrona (`policy.infer`) | Se espera a que termine la inferencia antes de actuar | No aplica (un chunk por vez) | Sí |

## Limitaciones y advertencias

- No incluye pesos: requiere que el usuario aporte su propio checkpoint pi0.5 entrenado con openpi. Sin ese checkpoint el repositorio no es funcional.
- No contiene código de robot, cámara ni de tarea; toda la integración con hardware real corre a cargo del usuario.
- Dependencia de instalación no trivial: openpi no está en PyPI y debe instalarse desde fuente en el mismo entorno que el paquete.
- Restricción dura de tiempo real: si el retardo de inferencia `d` supera `H − s`, el chunk se agota y `get_action` lanza una excepción; hay que ajustar `hz`, `smin` o `num_steps`.
- Ausencia total de datos de rendimiento: sin benchmarks de éxito en tareas, sin latencias medidas y sin comparativas numéricas publicadas, no es posible estimar su eficacia frente a los baselines.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta.
- Idiomas soportados: no disponible; el artefacto no tiene interfaz de texto ni procesamiento de lenguaje.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos de texto, pero sí existe riesgo de comportamiento inconsistente entre chunks si los hiperparámetros de guía (`beta`, `schedule`) no se ajustan al checkpoint empleado.
- Sesgos conocidos: no disponible. No se documentan sesgos de datos ni de comportamiento, dado que el modelo subyacente es el checkpoint pi0.5 del usuario.
- Licencia MIT: permite uso comercial y modificación, pero solo cubre este repositorio; la licencia del checkpoint pi0.5 y de openpi debe verificarse por separado.
- Metadatos anómalos: las fechas de creación y actualización (23 de septiembre de 2026) son posteriores a la fecha de consulta, lo que sugiere un error de registro.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este artefacto (solo coincidencias homónimas sin relación con el proyecto), por lo que no hay documentación independiente que valide su funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Daniel-F/rtc-pi05
- Artículo de referencia (RTC): https://arxiv.org/abs/2506.07339
- openpi (framework base, requerido): https://github.com/Physical-Intelligence/openpi
- Enlaces adicionales: no se encontraron enlaces relevantes en la búsqueda web; los resultados obtenidos correspondían a páginas homónimas sin relación con el modelo.
