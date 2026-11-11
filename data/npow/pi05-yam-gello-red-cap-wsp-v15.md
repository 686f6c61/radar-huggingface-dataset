# npow/pi05-yam-gello-red-cap-wsp-v15

## Resumen

`npow/pi05-yam-gello-red-cap-wsp-v15` es un parche de pesos (weight overlay) disperso sobre el modelo base de robótica `lerobot/pi05_base` (PI0.5), publicado por el usuario `npow`. No se trata de un checkpoint completo: el repositorio contiene únicamente las filas modificadas de las proyecciones Q/K/O/V de la atención del experto final, junto con los activos de runtime necesarios para el entorno YAM (contrato de acciones, normalizador, programa temporal y cabeza auxiliar). El modelo base no está incluido y debe descargarse por separado.

La edición se ajustó a partir del dataset `npow/yam-gello-red-cap-100` sin abrir ningún checkpoint ya afinado, aplicando una técnica que el autor denomina weight-space programming con deltas dispersos. El objetivo es adaptar la política PI0.5 a una tarea concreta de manipulación robótica (recogida de tapones rojos con el sistema YAM/Gello) modificando un subconjunto reducido de pesos en lugar de reentrenar el modelo completo.

Es relevante como ejemplo de edición de pesos de bajo coste sobre modelos de robótica, pero el propio autor lo marca explícitamente como diagnóstico: no se ha validado en simulador ni en robot real, y no está declarado listo para tareas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0.0 GB, coherente con un overlay disperso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (PI0.5, vision-language-action); overlay sobre proyecciones Q/K/O/V del experto final |
| Parametros totales | no disponible (el overlay solo contiene filas dispersas; el base PI0.5 no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el runtime exige float32) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use y Prohibited Use Policy) |
| Formato de pesos | safetensors (overlay disperso) + activos de runtime YAM; el base se distribuye aparte |
| Modelo base | `lerobot/pi05_base` |
| Pipeline | robotics (lerobot) |
| Salida | chunk de acciones `(20, 14)` a 20 Hz, objetivos articulares absolutos nativos YAM; grippers (índices 6 y 13) recortados a [0, 1] |

## Arquitectura y entrenamiento

El modelo base PI0.5 es una política vision-language-action de LeRobot orientada a control robótico. Este repositorio no reentrena esa arquitectura: aplica una edición en espacio de pesos que modifica filas dispersas en las proyecciones de query, key, output y value de la atención del experto final. El delta se ajustó a partir del dataset `npow/yam-gello-red-cap-100` sin abrir ningún checkpoint previamente afinado, lo que constituye la innovación metodológica principal: obtener una especialización de tarea mediante un parche de pesos de pequeño tamaño en lugar de un fine-tuning convencional.

El paquete incluye además el contrato de acciones YAM, el normalizador, el programa temporal y la cabeza auxiliar empleados por la ruta de inferencia YAM ya cualificada. El runtime realiza un procedimiento de dos pasadas con ruido emparejado (paired-noise/two-pass) específico de YAM, y una llamada estándar a `PI05Policy.from_pretrained()` no aplica este overlay ni reproduce dicho procedimiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de chunks de acciones robóticas: devuelve arrays `(20, 14)` a 20 Hz con objetivos articulares absolutos nativos YAM.
- Control de gripper: las coordenadas 6 y 13 se recortan al rango [0, 1].
- Procesamiento multimodal de entrada: consume tres cámaras RGB (middle, left, right) y un estado de movimiento causal de 29 valores.
- Condicionamiento por tarea: acepta un campo `task` proveniente del contrato de runtime.
- Especialización en una tarea concreta: recogida de tapones rojos en el entorno YAM/Gello (sin validación de éxito medida).
- Integración con el ecosistema LeRobot y el workspace `weight-space-programming`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, thinking mode, audio ni multilingüismo de texto general.

## Casos de uso

- Investigación en edición de pesos: servir como referencia reproducible de la técnica weight-space programming con deltas dispersos sobre un modelo VLA, comparando el overlay v15 con el padre base en métricas offline.
- Evaluación de políticas robóticas en replay offline: usar el runtime empaquetado para reproducir las métricas de Phase F1 y Gripper-onset F1 sobre episodios grabados con entradas RGB reales.
- Prototipado de pipelines YAM: integrar el contrato de acciones, normalizador y programa temporal en un workspace de inferencia ya cualificado para experimentar con la interfaz de predicción de chunks.
- Estudio de especialización de bajo coste: analizar cuánto rendimiento se obtiene modificando solo filas dispersas de las proyecciones de atención frente a un fine-tuning completo, usando el dataset `yam-gello-red-cap-100`.
- Base para experimentos de manipulación con múltiples cámaras: el modelo consume tres vistas RGB y un estado causal de 29 valores, útil para probar configuraciones de percepción en entornos Gello.
- Docencia y divulgación técnica: ilustrar cómo se empaqueta un overlay de pesos con sus activos de runtime y cómo se valida una interfaz de inferencia con comprobaciones de finitud y rango de acciones.

## Benchmarks y rendimiento

Resultados offline reportados por el autor sobre 12 episodios nuevos (278 observaciones) del fold 2 de repeat0, con entradas RGB reales y la edición congelada:

| Métrica | Base parent | WSP v15 |
|---|---:|---:|
| Phase F1 | 0.3930 | 0.4405 |
| Gripper-onset F1 | 0.3922 | 0.4211 |

El autor indica que también se cargó el bundle mediante la API de runtime del workspace sobre un frame RGB real, devolviendo acciones `(20, 14)` finitas con grippers en rango. Se trata de comprobaciones de replay offline e interfaz; no se midió éxito en tarea de simulador, recogida de tapones ni seguridad en robot.

## Requisitos de hardware

- VRAM estimada: no disponible; el overlay en sí es de tamaño despreciable, pero requiere cargar el base PI0.5 completo en float32.
- GPU recomendadas: no disponible; el runtime exige float32, lo que descarta cuantización en la ruta cualificada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime propio del workspace `weight-space-programming` (`yam_sparse_policy`, `yam_proposal_inference`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `npow/pi05-yam-gello-red-cap-wsp-v15` | Overlay disperso sobre PI0.5 | no disponible (overlay) | no disponible | Gemma | Diagnóstico, no task-ready |
| `lerobot/pi05_base` | VLA base PI0.5 | no disponible | no disponible | Gemma | Modelo base público |
| `npow/yam-gello-red-cap-100` | Dataset de entrenamiento | no aplica | no aplica | no disponible | Dataset |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como diagnóstico por el propio autor: no está declarado listo para tareas.
- No se ha medido éxito en simulador, recogida de tapones ni seguridad en robot real.
- El repositorio no contiene el checkpoint base; requiere acceso a `lerobot/pi05_base` y al repositorio privado del overlay.
- Una llamada estándar a `PI05Policy.from_pretrained()` no aplica el overlay ni reproduce el procedimiento de dos pasadas; es obligatorio usar el runtime empaquetado.
- El runtime exige float32, lo que limita opciones de cuantización y despliegue ligero.
- Riesgo de alucinación y sesgos: no documentados; al ser una política de acciones, el riesgo relevante es de comportamiento incorrecto en robot, no de texto.
- Restricciones de licencia: uso sujeto a Gemma Terms of Use y Prohibited Use Policy; cualquier derivado debe cumplirlas.
- Idiomas soportados: no disponibles.
- Repositorio sin descargas ni likes y de creación reciente, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/npow/pi05-yam-gello-red-cap-wsp-v15
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/npow/yam-gello-red-cap-100
- Licencia Gemma y política de uso prohibido: incluidos en el repositorio (`LICENSE`, `GEMMA_PROHIBITED_USE_POLICY.md`, `NOTICE`)
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
