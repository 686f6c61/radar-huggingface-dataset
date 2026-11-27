# CyanMask/my_policy_test10

## Resumen

CyanMask/my_policy_test10 es una política de imitación visual-motora (visuomotor policy) entrenada con LeRobot y basada en Diffusion Policy, el método presentado en el paper arXiv:2303.04137. No es un modelo de lenguaje: es un controlador robótico que recibe el estado articular del robot y una imagen de una cámara en la muñeca, y genera una trayectoria de acciones de 6 dimensiones. El modelo lo publica el usuario CyanMask en Hugging Face y su propósito aparente es el de una prueba de extremo a extremo del pipeline de LeRobot ("my_policy_test10"), no un artefacto listo para producción.

La tarea concreta para la que se ha entrenado es "Grab RED cube" sobre un robot de tipo `so_follower` (la variante follower del SO-100/SO-101 de LeRobot) con una única cámara en la muñeca a 640x480. El conjunto de datos de entrenamiento contiene solo 10 episodios y 6748 fotogramas a 30 FPS, lo que sitúa al modelo en la categoría de prototipo de laboratorio con muy poca diversidad de datos.

Arquitectónicamente es un modelo de difusión aplicado a control motor: en lugar de predecir una acción única, aprende a generar secuencias de acciones multimodales y suaves mediante un proceso de denoising. Cuenta con 262.962.942 parámetros (dato real de los pesos safetensors) y un repositorio de 1,1 GB. Su relevancia es la de servir como ejemplo reproducible del flujo de trabajo de imitación de LeRobot, no la de un modelo con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusión para control visuomotor), implementado en LeRobot 0.7.1 |
| Parametros totales | 262.962.942 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política, no documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la única instrucción textual es la tarea "Grab RED cube") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `wrist` (imagen 3x480x640) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida de accion | `action` con forma (6,) |
| Dataset de entrenamiento | CyanMask/record-test_20261127_113824 (10 episodios, 6748 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 100000 |
| Batch size | 8 |
| Optimizador | Adam |
| Learning rate | 0,0001 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de Diffusion Policy: trata el control visuomotor como un proceso generativo de difusión. La política aprende una distribución sobre trayectorias de acción condicionada por las observaciones (estado articular de 6 dimensiones e imagen de la cámara de muñeca), y en inferencia genera la acción mediante denoising iterativo. Este enfoque produce trayectorias multimodales y suaves, y según el paper original destaca en manipulación con contactos ricos, a diferencia de políticas regresivas que colapsan a la media de las acciones.

Los detalles internos de la red (número de pasos de difusión, horizonte de predicción, tamaño del encoder visual, uso de DDPM frente a DDIM) no están documentados en la model card ni en la información disponible. El entrenamiento se realizó con LeRobot 0.7.1, 100.000 pasos, batch de 8, Adam con learning rate 1e-4 y semilla 1000, sobre un dataset propio de 10 episodios y 6748 fotogramas a 30 FPS para la tarea "Grab RED cube". No se documenta composición del dataset, aumento de datos, RLHF/DPO ni ninguna innovación técnica adicional más allá del propio método de difusión.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para un robot `so_follower` a partir de estado articular e imagen de muñeca.
- Manipulación visuomotora para una única tarea: agarrar un cubo rojo ("Grab RED cube").
- Control reactivo basado en una única cámara `wrist` a 640x480 y 30 FPS.
- Ejecución mediante el comando `lerobot-rollout` con `--strategy.type=base`.
- Entrenamiento reproducible con `lerobot-train` y `--policy.type=diffusion`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción del pipeline de LeRobot: sirve para validar de extremo a extremo la instalación, el calibrado del robot `so_follower` y la cámara `wrist` antes de entrenar políticas propias con datos reales.
- Prueba de concepto de agarre de objetos: el modelo puede ejecutar la tarea "Grab RED cube" en un entorno controlado para verificar que la cadena de inferencia (observación -> difusión -> acción) funciona sobre hardware real.
- Docencia y formación: útil como ejemplo mínimo de Diffusion Policy con solo 10 episodios, adecuado para explicar imitación visual-motora en cursos o talleres.
- Benchmark interno de infraestructura: permite medir latencia de inferencia y throughput de `lerobot-rollout` en una GPU concreta antes de invertir en datasets mayores.
- Base para fine-tuning: al ser un checkpoint de difusión con 263 M de parámetros, puede servir como inicialización para tareas de agarre similares con más datos.
- Validación de grabación de datos: comparar el comportamiento del modelo con el dataset `record-test_20261127_113824` ayuda a detectar problemas de sincronización, FPS o calibración en la captura.
- No es adecuado para producción, atención al cliente, generación de código ni ninguna tarea de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 262.962.942 parámetros en precisión FP32 serían aproximadamente 1,05 GB solo de pesos; en FP16, unos 0,53 GB. A ello hay que sumar el encoder visual y el estado interno del proceso de difusión, no documentados.
- GPU recomendadas: no disponibles en la información. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos; se desconoce el pico real de memoria.
- Cabe en GPU de consumo: probablemente sí en RTX 3060/4060 o superiores por el tamaño de los pesos, aunque no está verificado ni documentado.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=CyanMask/my_policy_test10`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La política opera a 30 FPS según el dataset, pero no se confirma que la inferencia alcance ese ritmo en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyanMask/my_policy_test10 | 262.962.942 | no disponible | Agarre "Grab RED cube" con `so_follower` | no disponible | Hugging Face (0 descargas) |
| Diffusion Policy (paper original, 2303.04137) | no disponible | no disponible | Manipulación visuomotora genérica | no disponible | Paper y código de referencia |
| Otras políticas LeRobot del Hub | no disponible | no disponible | Tareas diversas | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo: 10 episodios y 6748 fotogramas para una sola tarea, lo que implica un riesgo alto de sobreajuste y escasa generalización a posiciones, iluminación o distractores distintos.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Licencia no especificada: la model card deja la licencia como "[More Information Needed]", lo que impide confirmar el uso comercial.
- Dependencia de hardware concreto: entrenada para `so_follower` con una cámara `wrist` a 640x480 y 30 FPS; cambiar la cámara, la resolución o el robot invalida la política.
- Una única tarea: solo "Grab RED cube"; no generaliza a otras instrucciones ni objetos.
- Sin capacidades de lenguaje: no admite tool calling, agentes ni razonamiento; cualquier expectativa de ese tipo es un error de categoría.
- Riesgo de alucinación en el sentido de acciones fuera de distribución: si la observación se aleja del dataset, la política puede generar trayectorias erráticas o inseguras.
- Sin información sobre sesgos, robustez frente a cambios de iluminación o seguridad física del robot; se recomienda supervisión humana en cualquier prueba.
- Modelo de prueba ("test10"): el nombre y la ausencia de evaluación sugieren que no está pensado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyanMask/my_policy_test10
- Dataset de entrenamiento: https://huggingface.co/datasets/CyanMask/record-test_20261127_113824
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CyanMask/record-test_20261127_113824
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
