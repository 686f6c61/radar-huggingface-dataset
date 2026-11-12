# Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-wrist-idm-lape-lam0p005-10000-20261112

## Resumen

π0.5 SNUMPR real-world es un checkpoint de adaptación de dominio de un modelo visión-lenguaje-acción (VLA) orientado a control robótico de manipulación. Lo publica el usuario Donghyun1228 y se apoya en la arquitectura π0.5, un transformer que combina percepción visual multicámara con generación de acciones motoras. El modelo concreto resuelve un problema muy específico: adaptar una política entrenada en el entorno SNUMPR a un desplazamiento compuesto de cámara, consistente en una vista en tercera persona más amplia y una rotación virtual de la base de 30 grados, manteniendo el uso de la cámara de muñeca.

El repositorio contiene un checkpoint fuente (entrenado con 10 000 actualizaciones de imitation learning más un modelo de dinámica inversa, IDM) y tres checkpoints objetivo (pasos 999, 4999 y 9999) obtenidos mediante anclaje LAPE con λ = 5e-3, learning rate 5e-5 y el LLM congelado. El IDM lee las cámaras de base y de muñeca en los instantes t y t+32, lo que desplaza el marco de acción de la política entre −26 y −32 grados respecto al IDM que solo usa la cámara base.

Es relevante ahora porque documenta un caso de adaptación de políticas VLA a cambios de calibración extrínseca sin reentrenar el backbone lingüístico, un escenario habitual en despliegues reales de robots manipuladores. No se han publicado tasas de éxito en robot real, por lo que su utilidad práctica está aún por validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (transformer visión-lenguaje-acción con modelo de dinámica inversa auxiliar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precisión original; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoints con directorios `params/` y `assets/` (normalización `snumpr-iclr27`); no se especifica el formato de serialización exacto |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura π0.5, un VLA que procesa observaciones visuales de varias cámaras junto con el estado articular del robot y emite acciones motrices. En este checkpoint se añade un modelo de dinámica inversa (IDM) que consume las cámaras de base y de muñeca en los instantes t y t+32 para estimar la dinámica del entorno y corregir el marco de acción de la política.

El entrenamiento se divide en dos fases. La fuente (`source/9999/`) parte del VLA inicial SNUMPR (`snumpr-iclr27` 9999) y aplica 10 000 actualizaciones de imitation learning más IDM con la configuración `pi05_snumpr_initial_source_idm_wrist`. La adaptación objetivo (`target/{999,4999,9999}/`) usa anclaje LAPE con k = 10, λ = 5e-3, learning rate 5e-5 y el LLM congelado, entrenando solo el IDM sobre sondas de vista amplia con yaw30 y estado preservado (keep-state), partiendo del checkpoint fuente. No se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable es el anclaje LAPE (prior guardado en `prior_idm_wrist_10k.json`, con `source_params_path` apuntando al checkpoint fuente), que permite transferir el desplazamiento de yaw sin degradar el resto de la política, y el uso del IDM con cámara de muñeca para estimar la rotación relativa de la base.

## Capacidades

- Generación de acciones motrices para manipulación robótica a partir de observaciones visuales multicámara (base y muñeca) y estado articular real.
- Predicción de trayectorias de 10 pasos (horizonte de 10) en el marco virtual de yaw30.
- Modelo de dinámica inversa auxiliar que estima el desplazamiento angular entre marcos de cámara.
- Adaptación a cambios de calibración extrínseca (vista amplia y rotación virtual de base de 30 grados) sin reentrenar el LLM.
- Entrada de estado articular real en modo keep-state.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Recalibración de políticas VLA en producción: cuando se cambia la posición o el campo de visión de la cámara externa de un UR10e, este checkpoint permite seguir operando aplicando `Rz(+30°)` a Δxyz en el controlador, sin repetir el entrenamiento completo de la política.
- Manipulación con cámara de muñeca en tareas de ensamblaje: el IDM que lee base y muñeca en t y t+32 aporta información de dinámica útil en tareas como colgar objetos (hangB/hangT), donde el yaw transfiere casi sin error (φ cercano a 0 grados).
- Investigación en adaptación de dominio para robótica: sirve como referencia reproducible de anclaje LAPE con λ = 5e-3 y LLM congelado para estudiar la transferencia de marcos de acción en políticas VLA.
- Evaluación comparativa de IDM: permite contrastar el IDM con cámara de muñeca frente al IDM solo con cámara base, midiendo el desplazamiento del marco de acción (−26 a −32 grados frente a −30 grados completos).
- Prototipado en laboratorio con UR10e: el checkpoint objetivo puede cargarse con la configuración `pi05_snumpr_target_lape_anchor_large_view_yaw30_lam0p005_idm_wrist` para pruebas open-loop sobre demostraciones reales retenidas.
- Análisis de error de localización de objetos: los resultados open-loop permiten estudiar por qué las tareas de grapadora, limón y apilado (stapler, lemon, stack) mantienen error de localización bajo la vista amplia, informando futuras iteraciones del pipeline.

## Benchmarks y rendimiento

Resultados open-loop sobre demostraciones reales retenidas (10-30 paired demos, horizonte de 10 pasos). φ es la rotación de mínimos cuadrados entre el movimiento xy registrado y el predicho (0 es correcto); "vs ctrl" es relativo al IDM solo con cámara base (−30 grados equivale al yaw completo).

| target step | vs ctrl | mean \|φ\| | xyz RMSE (mm) | xy gain | φ hangB / hangT / stapler / lemon / stack |
| ---: | ---: | ---: | ---: | ---: | --- |
| 999 | −26.8° | 20.4° | 2.06 | 0.47 | +2 / +1 / −21 / −38 / −40 |
| 4999 | −31.5° | 23.9° | 2.05 | 0.41 | −2 / −4 / −28 / −43 / −43 |
| 9999 | −32.4° | 25.4° | 2.10 | 0.37 | −3 / −4 / −33 / −44 / −44 |

No se han publicado tasas de éxito en robot real. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 33.6 GB, lo que da una cota inferior del espacio en disco necesario para los checkpoints.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del repo, se requiere al menos una GPU con memoria suficiente para cargar los pesos completos (previsiblemente A100 o H100 de 80 GB, aunque no está confirmado).
- Compatibilidad con GPU de consumo: no confirmada; no se documentan cuantizaciones que permitan reducir la huella.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el código de referencia está en `github.com/Donghyun1228/vla_adaptation` con configuraciones en `src/openpi/training/config.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world (este) | no disponible | no disponible | Open-loop: φ medio 20.4–25.4°, RMSE xyz 2.05–2.10 mm; sin tasa de éxito real | apache-2.0 | Hugging Face (0 descargas) |
| VLA inicial SNUMPR (`snumpr-iclr27` 9999) | no disponible | no disponible | Punto de partida del entrenamiento; sin métricas comparables publicadas | no disponible | Referenciado como fuente en la model card |
| π0.5 base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se ha medido la tasa de éxito en robot real; los únicos datos son open-loop sobre demostraciones retenidas.
- El error de localización de objetos bajo la vista amplia persiste en las tareas de grapadora, limón y apilado (φ de −33 a −44 grados en el paso 9999), lo que limita su uso en esas manipulaciones.
- El yaw no se transfiere por completo: el desplazamiento alcanzado es de −26.8 a −32.4 grados frente a los −30 grados objetivo, con un error medio absoluto de φ de 20.4 a 25.4 grados.
- El controlador debe aplicar explícitamente `Rz(+30°)` a Δxyz; omitirlo produce un marco de acción incorrecto.
- El estado de entrada debe ser el estado articular real en modo keep-state; no se documenta comportamiento con estados sintéticos o estimados.
- El LLM está congelado durante la adaptación objetivo, por lo que no se esperan mejoras en comprensión lingüística ni en razonamiento textual.
- No se documentan sesgos, riesgos de alucinación en texto ni limitaciones idiomáticas; el modelo no está orientado a generación de lenguaje.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de validación en robot real desaconseja su despliegue en producción sin evaluación propia.
- El repositorio no incluye el estado del optimizador, lo que dificulta reanudar el entrenamiento desde los checkpoints publicados.
- El checkpoint está atado a la configuración de cámara y robot (UR10e, cinco tareas SNUMPR); su transferencia a otros montajes no está validada.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-wrist-idm-lape-lam0p005-10000-20261112
- Código: https://github.com/Donghyun1228/vla_adaptation
- Configuraciones de entrenamiento: `src/openpi/training/config.py` dentro del repositorio de código
