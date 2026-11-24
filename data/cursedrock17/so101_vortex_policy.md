# CursedRock17/SO101_VORTEX_Policy

## Resumen

SO101_VORTEX_Policy es una política de aprendizaje por refuerzo entrenada para la tarea `Vortex-SO101-Vial-Still-v0` del entorno VORTEX, un simulador de robótica sobre cubierta de barco en movimiento construido con Isaac Lab 3.0 y el motor físico Newton. La política controla un robot manipulador SO-101 (brazo de 5 grados de libertad más pinza, según la nomenclatura SO de LeRobot) para colocar un vial sobre una superficie estable mientras la cubierta del buque se mueve. El autor es CursedRock17 y el artefacto se publica como checkpoint de inferencia, no como modelo de lenguaje.

El modelo resuelve un problema concreto de robótica marítima: manipulación de precisión sobre plataformas que oscilan con estados de mar variables (desde mar en calma hasta mar 7 de portaaviones). Se entrenó con PPO (RSL-RL) sobre 4096 entornos paralelos durante 800 iteraciones, con semilla 42, sobre el dataset de movimiento `no_motion.csv` como profesor de estado inicial. El resultado es una política que alcanza 0,997 de tasa de éxito en condiciones estáticas y degrada de forma medible con la amplitud del oleaje.

Es relevante porque demuestra un flujo de trabajo completo de simulación a política desplegable (TorchScript y ONNX) para manipulación sobre plataformas móviles, un dominio con pocos artefactos públicos. El repositorio es de 0,0 GB (solo pesos y configuraciones), no tiene descargas ni likes, y la licencia no está especificada, lo que limita su reutilización comercial directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (arquitectura interna no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | TorchScript (`policy.pt`), ONNX (`policy.onnx` + `policy.onnx.data`) |

## Arquitectura y entrenamiento

La política se entrenó con RSL-RL PPO, un algoritmo de gradiente de política proximal implementado en la librería RSL-RL, hasta la iteración 799. El entrenamiento se realizó sobre la tarea `Vortex-SO101-Vial-Still-v0` con 4096 entornos paralelos, semilla 42 y el dataset de movimiento `no_motion.csv`, lo que la convierte en un "profesor de estado" (state teacher) para condiciones estáticas de cubierta. La receta de colocación de vial se portó desde el entorno `place_vial` original al deck de VORTEX. El commit de VORTEX usado fue `f9f6285e6bb8` con cambios locales, y el checkpoint se guardó el 2026-11-24.

La arquitectura interna de la red no se detalla en la model card: solo se indica que recibe el grupo de observaciones `policy` de la tarea y emite acciones. El entorno usa Isaac Lab 3.0 y el motor físico Newton para simular la dinámica del barco y el manipulador. Se menciona una corrección de colisión de losa de suelo bajo gran heave que invalidó los valores anteriores de las celdas de mar 7 de portaaviones y mar 5 de destructor, reevaluadas el 2026-11-24. No se especifican innovaciones como decodificación especulativa ni atención lineal, por tratarse de un dominio de control robótico.

## Capacidades

- Control de un manipulador SO-101 para colocar un vial sobre una superficie en cubierta de barco simulada.
- Inferencia determinista a partir del grupo de observaciones `policy` de la tarea VORTEX.
- Exportación a TorchScript y ONNX para despliegue fuera de PyTorch.
- Robustez medida frente a estados de mar: mar en calma, mar 3 (plataforma Stewart), mar 4, mar 5 de destructor y mar 7 de portaaviones, con amplitudes relativas de 0,25x, 0,5x y 1x.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en manipulación sobre plataformas móviles: la política sirve como línea base reproducible para comparar algoritmos de RL en el benchmark VORTEX, con métricas de éxito por estado de mar y semilla fija (42).
- Evaluación de robustez frente a perturbaciones: permite medir la degradación de la tasa de éxito al escalar la amplitud del oleaje (de 0,997 en estático a 0,593 en mar 5 de destructor a 1x), útil para estudiar límites de control.
- Despliegue en simulación de alta fidelidad: se carga con `torch.jit.load("policy.pt")` o vía ONNX dentro del contenedor de desarrollo de VORTEX, integrándose en pipelines de evaluación automatizada.
- Profesor de estado para destilación o inicialización: al estar entrenada en condiciones estáticas (`no_motion.csv`), puede usarse como política maestra para entrenar políticas más robustas con movimiento de barco.
- Pruebas de integración de motores físicos: sirve para validar la corrección de colisiones (como la losa de suelo bajo gran heave) y la estabilidad numérica de Isaac Lab 3.0 con Newton.
- Reproducción de experimentos: los archivos `params/` y `motion/` permiten replicar el entrenamiento y la evaluación con la receta `place_vial` portada al deck VORTEX.
- Benchmarking de exportación ONNX: el par `policy.onnx` + `policy.onnx.data` permite comparar latencia y fidelidad de inferencia entre PyTorch y ONNX Runtime en un caso de control robótico.

## Benchmarks y rendimiento

| Metrica | Valor (n=1024) |
|---|---|
| success_rate[no_motion x1] | 0,997 (IC 0,991-0,999) |
| success_rate[example_sea_state_4 x1] | 0,864 (IC 0,842-0,884) |
| success_rate[example_carrier_sea_state_7 x0.25] | 0,974 (IC 0,962-0,982) |
| success_rate[example_carrier_sea_state_7 x0.5] | 0,963 (IC 0,949-0,973) |
| success_rate[example_carrier_sea_state_7 x1] | 0,894 (IC 0,873-0,911) |
| success_rate[example_destroyer_sea_state_5 x0.25] | 0,980 (IC 0,970-0,987) |
| success_rate[example_destroyer_sea_state_5 x0.5] | 0,959 (IC 0,945-0,970) |
| success_rate[example_destroyer_sea_state_5 x1] | 0,593 (IC 0,562-0,622) |
| success_rate[example_sea_state_4 x0.25] | 0,993 (IC 0,986-0,997) |
| success_rate[example_sea_state_4 x0.5] | 0,977 (IC 0,965-0,984) |
| success_rate[example_stewart_platform_sea_state_3 x0.25] | 0,990 (IC 0,982-0,995) |
| success_rate[example_stewart_platform_sea_state_3 x0.5] | 0,991 (IC 0,983-0,995) |
| success_rate[example_stewart_platform_sea_state_3 x1] | 0,988 (IC 0,980-0,993) |

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, por no tratarse de un modelo lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere pesos muy pequeños (política de control, no un LLM).
- GPU recomendadas: no especificadas; al entrenarse con 4096 entornos en Isaac Lab 3.0, el entrenamiento requiere GPU de datacenter (A100/H100) por el coste de simulación paralela, pero la inferencia de la política es ligera.
- Cabe en GPU consumer: probablemente sí, dado el tamaño ínfimo de los pesos, aunque no se confirma en la model card.
- Opciones de despliegue: TorchScript (`torch.jit.load`), ONNX Runtime, y el script `scripts/newton/policy.py play` dentro del contenedor de desarrollo de VORTEX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SO101_VORTEX_Policy (s1_still_seed42) | Colocación de vial en cubierta de barco (VORTEX) | no disponible | no aplica | 0,997 en estático; 0,593 en mar 5 destructor 1x | no disponible | Hugging Face (0 descargas) |
| Políticas `place_vial` de referencia (receta original) | Colocación de vial en entorno fijo | no disponible | no aplica | no disponible en esta ficha | no disponible | Referenciada en la model card, no enlazada |
| Otras políticas VORTEX del mismo autor | Tareas VORTEX (no especificadas) | no disponible | no aplica | no disponible | no disponible | No enumeradas |

No se dispone de datos suficientes para comparar con alternativas públicas de robótica de manipulación sobre plataformas móviles; se indica "no disponible" en los campos sin información.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial ni redistribución; contactar con el autor antes de cualquier uso en producción.
- Entrenada sobre `no_motion.csv` (cubierta estática): el rendimiento cae a 0,593 en mar 5 de destructor a amplitud 1x, por lo que no es adecuada para operación real en mar agitado sin reentrenamiento o ajuste.
- Los valores de mar 7 de portaaviones y mar 5 de destructor fueron corregidos el 2026-11-24 tras arreglar una colisión de losa de suelo; versiones anteriores del checkpoint podrían contener métricas inválidas.
- Sesgos conocidos: no documentados; al ser una política entrenada en simulación, existe una brecha sim-to-real no cuantificada.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje), pero sí riesgo de acciones fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Limitaciones de contexto o idioma: no aplica; la política solo consume el grupo de observaciones `policy` de la tarea VORTEX.
- Dependencia de la versión del entorno: entrenada con el commit `f9f6285e6bb8` de VORTEX con cambios locales; la reproducibilidad exacta requiere ese commit y los archivos `params/` y `motion/`.
- Artefacto con 0 descargas y 0 likes: no hay validación comunitaria ni soporte documentado más allá de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/CursedRock17/SO101_VORTEX_Policy
- Repositorio VORTEX: https://github.com/CursedRock17/VORTEX
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- Motor físico Newton: no disponible en la información proporcionada
- RSL-RL: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
