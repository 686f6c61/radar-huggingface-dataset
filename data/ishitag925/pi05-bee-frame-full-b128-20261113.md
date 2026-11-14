# ishitag925/pi05-bee-frame-full-b128-20261113

## Resumen

Pi0.5 bee-frame full es un ajuste fino completo (full fine-tuning) del modelo base `physical-intelligence/pi05_base`, desarrollado por el usuario ishitag925 y publicado en Hugging Face. Se trata de un modelo de robótica orientado a políticas visomotoras (vision-language-action) que transforma observaciones de camaras y consignas de tarea en acciones de control de un brazo robotico con pinza. El modelo se entrena sobre el dataset `ishitag925/bee-frame-replacement-comfortable-right-yaw7-300-lerobot`, compuesto por 236 episodios y 801.804 fotogramas, y esta pensado para una tarea concreta de reemplazo de marcos (bee-frame) en un entorno controlado.

La relevancia de esta publicacion es doble. Por un lado, demuestra el flujo de trabajo de OpenPI para ajustar el modelo Pi0.5 de Physical Intelligence sobre un dataset propio de robótica con LeRobot, incluyendo checkpoints reanudables con estado del optimizador. Por otro, expone un caso de entrenamiento en curso sin evaluacion de tasa de exito, lo que lo convierte en un artefacto de investigacion mas que en un modelo listo para produccion.

El repositorio ocupa 32,3 GB e incluye los pesos completos del modelo (3.353.433.872 parametros entrenables) junto con el estado del optimizador y los assets de normalizacion. No se dispone de licencia declarada, idiomas soportados ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (Pi0.5, openpi); detalles internos no disponibles |
| Parametros totales | 3.353.433.872 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoints OpenPI/Orbax (no exportables con `from_pretrained` de Transformers); tamano del repo 32,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `physical-intelligence/pi05_base`, un modelo de politica visomotora de la familia Pi0.5 distribuido a traves de la libreria `openpi`. El ajuste fino es completo: los 3.353.433.872 parametros son entrenables, sin congelacion de capas. El entrenamiento utiliza dos dispositivos con FSDP (Fully Sharded Data Parallel), AdamW, un batch global de 128 (64 por GPU), 50.000 actualizaciones objetivo del optimizador y un decaimiento coseno de la tasa de aprendizaje de 5e-5 a 5e-6 sin warmup ni EMA. La ejecucion comenzo con batch 512 y cambio a 128 tras restaurar el checkpoint de las cinco primeras actualizaciones, por lo que esas cinco primeras actualizaciones usaron batch 512.

Los datos de entrenamiento provienen del dataset `ishitag925/bee-frame-replacement-comfortable-right-yaw7-300-lerobot` (revision `ccabfe56476622376683ec70ef968d1d97edc6d3`), con 236 episodios y 801.804 fotogramas. La configuracion de entrada incluye camaras trasera y de muneca derecha, un horizonte de accion de 50 pasos y siete objetivos absolutos de brazo y pinza a 50 Hz. El entrenamiento se realizo sobre la revision de OpenPI `215abfb217dbac7d5f1273282331b9b1866c0479`. Los checkpoints se suben cada 500 pasos de bucle y al finalizar, e incluyen parametros de politica, estado del optimizador y assets de normalizacion; `latest.json` selecciona el checkpoint verificado mas reciente. Las etiquetas de paso son base cero: el checkpoint 500 contiene el paso 501 del optimizador.

## Capacidades

- Generacion de acciones de control para un brazo robotico con pinza a partir de observaciones de camaras (trasera y muneca derecha).
- Prediccion de siete objetivos absolutos de brazo y pinza con horizonte de 50 pasos a 50 Hz.
- Ejecucion de una tarea especifica de reemplazo de marcos (bee-frame) en el entorno del dataset de entrenamiento.
- Integracion con el ecosistema OpenPI y LeRobot para carga de checkpoints y normalizacion.
- Reanudacion de entrenamiento con estado completo del optimizador (Orbax).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Investigacion en politicas visomotoras: el modelo sirve como punto de partida reproducible para estudiar el ajuste fino completo de Pi0.5 sobre datasets propios con LeRobot y OpenPI.
- Reemplazo de marcos en un banco de pruebas: ejecucion de la tarea concreta de bee-frame en el entorno de laboratorio donde se grabo el dataset, con camaras trasera y de muneca.
- Reproduccion de experimentos de entrenamiento: los checkpoints reanudables permiten retomar el entrenamiento y comparar hiperparametros (batch, tasa de aprendizaje, horizonte de accion).
- Generacion de datos sinteticos de control: usar las predicciones de acciones como referencia para comparar con trayectorias humanas registradas.
- Evaluacion de pipelines de normalizacion: los assets de normalizacion incluidos permiten validar el preprocesado de observaciones y acciones en entornos de simulacion o gemelos digitales.
- Docencia y formacion: ejemplo practico de ajuste fino de un modelo VLA con FSDP y AdamW sobre hardware multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha realizado ninguna evaluacion de tasa de exito de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 3.353.433.872 parametros; en precision de 16 bits los pesos ocuparian aproximadamente 6,7 GB, pero no se confirma el formato de inferencia ni el overhead de las camaras y la politica.
- GPU recomendadas: no disponible. El entrenamiento descrito uso dos dispositivos con FSDP y 64 muestras por GPU, lo que sugiere GPUs de clase datacenter (A100/H100), pero no se especifica el modelo exacto.
- Cabe en GPU de consumo: no confirmado. Por tamano de pesos seria viable en GPUs con 8-12 GB en cuantizacion, pero no se documentan cuantizaciones ni requisitos reales de inferencia.
- Opciones de despliegue: libreria `openpi` con checkpoints Orbax; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-bee-frame-full-b128-20261113 | 3.353.433.872 | no disponible | VLA robotica (bee-frame) | no disponible | Hugging Face, repo 32,3 GB |
| physical-intelligence/pi05_base | no disponible | no disponible | VLA robotica general | no disponible | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento en curso: no se ha completado ni evaluado la tasa de exito de la tarea; no debe considerarse un modelo validado para produccion.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un unico dataset de 236 episodios y un entorno concreto, el modelo probablemente no generaliza fuera de esa configuracion de camaras y tarea.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si en forma de acciones incorrectas o inseguras para el robot; no hay evaluacion de seguridad.
- Limitaciones de contexto e idioma: no se especifican ventana de contexto ni idiomas; las consignas de tarea no estan documentadas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial. Ademas, el modelo base `pi05_base` puede tener sus propias condiciones que se heredan.
- Caveat de formato: los checkpoints son Orbax/OpenPI y no son exportables directamente con `from_pretrained` de Transformers; requieren el stack de OpenPI.
- Inconsistencia de entrenamiento: las cinco primeras actualizaciones usaron batch 512 en lugar de 128, lo que puede introducir diferencias respecto a una ejecucion homogenea.
- Etiquetado de checkpoints: las etiquetas de paso son base cero y el checkpoint 500 corresponde al paso 501 del optimizador, lo que exige cuidado al reanudar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishitag925/pi05-bee-frame-full-b128-20261113
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ishitag925/bee-frame-replacement-comfortable-right-yaw7-300-lerobot
- Repositorio OpenPI (referencia de la libreria): no disponible en la informacion proporcionada
- Paper de Pi0.5: no disponible en la informacion proporcionada
