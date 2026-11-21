# Deduktive/GenPA

## Resumen

GenPA es un conjunto de checkpoints de políticas robóticas (vision-language-action, VLA) desarrollado por Deduktive. El modelo predice 16 acciones de robot en un único forward pass a partir de observaciones RGB, instrucciones en lenguaje natural y propiocepción, partiendo de un fine-tuning del transformer de difusión FLUX.2 [klein] base 4B de Black Forest Labs. La supervisión de profundidad (depth) se emplea durante el entrenamiento de las políticas principales, aunque no es necesaria en inferencia.

El modelo resuelve el problema del control robótico de extremo a extremo en tareas de manipulación, con checkpoints específicos para los benchmarks LIBERO, LIBERO-Plus y RoboTwin 2.0. Resulta relevante porque reutiliza un backbone de difusión de imagen de 4B parámetros como política de acción, aplicando el paradigma de modelado generativo al control motor con horizonte de acción fijo de 16 pasos.

La licencia es Apache-2.0 y el repositorio ocupa 7,8 GB, con tres checkpoints publicados. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada y procede fundamentalmente de la model card y del paper enlazado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.2 [klein] base 4B) fine-tuneado como política VLA, con prefijo de acción aprendido y adaptador de acción |
| Parámetros totales | 4B (backbone base); total exacto del checkpoint no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

GenPA parte del transformer de difusión FLUX.2 [klein] base 4B y lo fine-tunea como política de robot. El modelo incorpora un prefijo de acción aprendido y un adaptador de acción que transforman la salida del backbone en secuencias de acciones. Cada forward pass produce 16 acciones: 16 × 7 en LIBERO (posición y orientación del efector más pinza) y 16 × 14 en RoboTwin 2.0 (política bimanual). Las entradas son imágenes RGB, instrucciones de lenguaje y propiocepción; la profundidad se usa como supervisión auxiliar durante el entrenamiento de las políticas principales, pero no se requiere en inferencia.

Los datos de entrenamiento incluyen el dataset LIBERO (publicado como Deduktive/GenPA-LIBERO) y el dataset flex-pi/robotwin_3d para RoboTwin. Los checkpoints publicados corresponden a distintos pasos de entrenamiento: genpa_libero_depth.pt (32.000 pasos, acciones más supervisión de profundidad), genpa_libero_action_only.pt (28.000 pasos, baseline solo con acciones) y genpa_robotwin_depth.pt (64.000 pasos, bimanual). No se detalla en la información disponible el número total de tokens, la composición completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas: 16 acciones por forward pass a partir de RGB, lenguaje y propiocepción.
- Control de manipulación en LIBERO y LIBERO-Plus (checkpoint genpa_libero_depth.pt, salida 16 × 7).
- Control bimanual en RoboTwin 2.0, escenarios Clean y Randomized (checkpoint genpa_robotwin_depth.pt, salida 16 × 14).
- Baseline de ablación solo con acciones para comparación (genpa_libero_action_only.pt).
- Supervisión de profundidad durante entrenamiento (no requerida en inferencia).
- Seguimiento de instrucciones en lenguaje natural como condicionamiento de la política.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica en simulación LIBERO: el checkpoint genpa_libero_depth.pt permite ejecutar políticas de agarre y colocación de objetos condicionadas por instrucciones, adecuado por su salida de 16 × 7 acciones por paso.
- Evaluación comparativa con baseline de ablación: genpa_libero_action_only.pt sirve para medir el efecto de la supervisión de profundidad frente al entrenamiento solo con acciones en el mismo entorno.
- Manipulación bimanual en RoboTwin 2.0: genpa_robotwin_depth.pt cubre tareas Clean y Randomized con salida de 16 × 14, útil para experimentos de coordinación de dos brazos.
- Investigación en VLA basados en difusión: reutilizar el backbone FLUX.2 fine-tuneado para estudiar la transferencia de modelos generativos de imagen al control motor.
- Reproducción de resultados del paper: los checkpoints y el código permiten replicar las evaluaciones en lazo cerrado descritas en la documentación del repositorio.
- Prototipado de políticas de horizonte fijo: la predicción de 16 acciones por forward pass simplifica el diseño de controladores que ejecutan bloques de acción antes de replanificar.
- Pruebas de humo e integración: el script tools/smoke_policy.py permite verificar la forma de salida ([16, 7] o [16, 14]) y la finitud de las acciones antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la documentación de resultados del repositorio (docs/RESULTS.md) y al paper para las cifras de evaluación, pero no incluye tablas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 7,8 GB y el backbone es de 4B parámetros, por lo que se requiere una GPU con memoria suficiente para el transformer completo más el autoencoder y el text encoder de FLUX.2.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende de la cuantización, que no se documenta.
- Opciones de despliegue: inferencia vía el repositorio de código (tools/smoke_policy.py) con pesos PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencias adicionales: el autoencoder y el text encoder deben obtenerse de las releases upstream de FLUX.2.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas VLA para LIBERO o RoboTwin) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido habitual de generación de texto; el riesgo se traslada a predicciones de acción incorrectas o no físicamente plausibles.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base FLUX.2 [klein] base 4B tiene su propia licencia que debe respetarse; el autoencoder y el text encoder se obtienen de releases upstream con sus condiciones.
- Dependencia de artefactos externos: sin el autoencoder y el text encoder de FLUX.2 el checkpoint no es funcional por sí solo.
- Validación limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se aportan benchmarks numéricos en la model card.
- Uso previsto restringido a entornos de simulación (LIBERO, RoboTwin); no se documenta validación en robots reales.
- El horizonte de acción fijo de 16 pasos condiciona el diseño del bucle de control y puede requerir replanificación frecuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deduktive/GenPA
- Paper (PDF): https://deng-zian.github.io/GenPA-website/assets/genpa-paper.pdf
- Página del proyecto: https://deng-zian.github.io/GenPA-website/
- Código: https://github.com/deng-zian/GenPA
- Dataset LIBERO de entrenamiento: https://huggingface.co/datasets/Deduktive/GenPA-LIBERO
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Guía de checkpoints: https://github.com/deng-zian/GenPA/blob/main/docs/CHECKPOINTS.md
- Configuración de inferencia: https://github.com/deng-zian/GenPA/blob/main/docs/SETUP.md#run-a-checkpoint
- Evaluación en lazo cerrado: https://github.com/deng-zian/GenPA/blob/main/docs/EVALUATION.md
- Resultados del paper: https://github.com/deng-zian/GenPA/blob/main/docs/RESULTS.md
- Checkpoint LIBERO con profundidad: https://huggingface.co/Deduktive/GenPA/resolve/main/genpa_libero_depth.pt
- Checkpoint LIBERO solo acciones: https://huggingface.co/Deduktive/GenPA/resolve/main/genpa_libero_action_only.pt
- Checkpoint RoboTwin con profundidad: https://huggingface.co/Deduktive/GenPA/resolve/main/genpa_robotwin_depth.pt
