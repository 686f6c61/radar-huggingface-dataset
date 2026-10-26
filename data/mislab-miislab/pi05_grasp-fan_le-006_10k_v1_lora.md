# MISLab-MiiSLab/pi05_grasp-fan_Le-006_10k_v1_Lora

## Resumen

`MISLab-MiiSLab/pi05_grasp-fan_Le-006_10k_v1_Lora` es un adaptador LoRA (PEFT) publicado por el laboratorio MISLab (Multimedia Interaction and Intelligent System Lab) sobre el modelo base `lerobot/pi05_base`, es decir, π₀.₅ de Physical Intelligence: un modelo visión-lenguaje-acción (VLA) orientado al control robótico de propósito general. El adaptador no es un modelo de lenguaje: su función es especializar el comportamiento del VLA base para una tarea concreta, que por el nombre del repositorio parece ser el agarre de un objeto tipo ventilador o aspas ("grasp-fan"), aunque la model card no lo documenta.

El repositorio tiene un tamano de 0,2 GB y contiene pesos en safetensors compatibles con la libreria `peft` (version 0.21.0 anotada en la ficha). El nombre sugiere un checkpoint entrenado durante 10.000 pasos (`10k`) en su primera version (`v1`) y una variante de tarea identificada como `Le-006`, pero ninguno de estos extremos esta confirmado en la documentacion disponible.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo de trabajo habitual en robotica con modelos VLA abiertos (fine-tuning ligero sobre un modelo fundacional); por otro, es un ejemplo de publicacion con documentacion minima, ya que la model card es la plantilla por defecto de HuggingFace sin ninguna seccion completada. Cualquier evaluacion seria del adaptador exige consultar el modelo base y el codigo de entrenamiento, que no se enlazan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un VLA π₀.₅; arquitectura interna del modelo base: no disponible |
| Parametros totales | no disponible para el adaptador; repos relacionados del mismo laboratorio declaran modelos de ~4B parametros, dato no confirmado para este adaptador |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base se distribuye en F32/BF16 segun repos similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA para `peft`); requiere el modelo base `lerobot/pi05_base` en formato LeRobot |
| Libreria declarada | `peft` 0.21.0 |
| Modelo base | `lerobot/pi05_base` (π₀.₅, Physical Intelligence) |
| Tamano del repositorio | 0,2 GB |
| Rango LoRA y modulos objetivo | no disponible |
| Dataset de entrenamiento | no disponible |
| Checkpoint / pasos | 10.000 pasos segun el nombre del repositorio (no confirmado) |

## Arquitectura y entrenamiento

El adaptador se construye sobre π₀.₅, un modelo visión-lenguaje-acción de Physical Intelligence que combina un backbone vision-lenguaje con una cabeza de accion basada en *flow matching*. Segun la documentacion de LeRobot, π₀.₅ esta coentrenado con demostraciones roboticas y datos multimodales a gran escala para ejecutar tareas de horizonte largo en entornos no vistos, y actualmente solo soporta la cabeza de accion por flow matching para entrenamiento e inferencia. El adaptador LoRA congela los pesos del base e inyecta matrices de bajo rango, de modo que el coste de almacenamiento es minimo (0,2 GB) frente al del modelo completo.

No hay informacion publicada sobre el procedimiento de entrenamiento de este adaptador concreto: ni el numero de tokens o trayectorias, ni la composicion del dataset, ni si hubo aumentos de datos, ni los hiperparametros LoRA (rango, alpha, dropout, tasa de aprendizaje), ni la configuracion de hardware. La unica referencia bibliografica presente en las etiquetas (`arxiv:1910.09700`) corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono citado en la plantilla de model card, no a un paper del modelo. Tampoco se documenta si el fine-tuning uso RLHF, DPO ni ninguna fase de alineamiento; en robotica VLA el regimen habitual es aprendizaje por imitacion supervisado sobre trayectorias, pero no se puede afirmar en este caso.

## Capacidades

- Control robótico por imitacion: al ser un adaptador sobre π₀.₅, su capacidad efectiva es la del VLA base, es decir, generar acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural.
- Especializacion en una tarea concreta de agarre ("grasp-fan"), segun el identificador del repositorio; el alcance exacto no esta documentado.
- Percepción visual y grounding lingueistico heredados del backbone vision-lenguaje del modelo base.
- Ejecucion de tareas de horizonte largo en entornos no vistos: capacidad atribuida a π₀.₅ en la documentacion de LeRobot, no verificada para este adaptador.
- Compatibilidad con el ecosistema LeRobot y con `peft` para cargar el adaptador junto al modelo base.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso en texto, codigo, matematicas ni modo "thinking"; no hay evidencia de soporte multilingue explicito.

## Casos de uso

- Manipulacion robotica de laboratorio: cargar el adaptador sobre `lerobot/pi05_base` en un entorno LeRobot para ejecutar una politica de agarre sobre un objeto tipo ventilador, aprovechando que el adaptador solo ocupa 0,2 GB y puede alternarse con otros checkpoints en la misma maquina.
- Comparacion de checkpoints de fine-tuning: al existir variantes hermanas del mismo laboratorio (`Le-002`, `Le-003` con 30k pasos y esta `Le-006` con 10k), el adaptador sirve para experimentos controlados sobre numero de pasos, semilla o configuracion de tarea.
- Investigacion en tecnicas PEFT aplicadas a VLA: permite estudiar como afecta un adaptador de bajo rango a la cabeza de flow matching sin reentrenar los ~4B parametros del base.
- Prototipado rapido en robotica de bajo coste: el reducido tamano del adaptador facilita su distribucion entre equipos y su versionado en un repositorio junto al codigo de evaluacion.
- Docencia y formacion: ejemplo realista de publicacion de un fine-tuning LoRA sobre un modelo fundacional de robotica, util para explicar el ciclo completo de entrenamiento, publicacion y evaluacion.
- Reproduccion de experimentos: punto de partida para replicar el entrenamiento con la misma receta, siempre que se localice el dataset original, que no se enlaza en la ficha.
- No recomendado para produccion: la ausencia de licencia, de evaluacion y de documentacion impide asumir su uso en entornos comerciales o criticos en seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion completada, no se reportan tasas de exito en tareas de agarre, ni metricas de simulacion o de robot real.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en agarre (real o simulado) | no disponible |
| MMLU / HumanEval / GSM8K | no aplica (modelo de accion, no de texto) |
| Comparacion con el modelo base | no disponible |

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB en disco, pero la inferencia requiere cargar el modelo base completo π₀.₅; el pico de memoria lo determina el base, no el LoRA.
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~4B parametros en BF16 requiere del orden de 8 GB solo para pesos, a los que hay que sumar activaciones, observaciones visuales y la cabeza de flow matching; un presupuesto de 16-24 GB es razonable para inferencia en precision completa.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes y entrenamiento; RTX 4090 (24 GB) como opcion de escritorio para inferencia y fine-tuning ligero.
- GPU de consumo: previsiblemente cabe en RTX 4090 y, con margen ajustado, en RTX 4080/A5000 de 16 GB; no hay confirmacion del autor.
- Opciones de despliegue: LeRobot (carga de politicas π₀.₅), el repositorio `openpi` de Physical Intelligence y sus forks, y `peft` + PyTorch para aplicar el adaptador. vLLM, llama.cpp, Ollama y TGI no son adecuados: estan pensados para LLM de texto y no soportan la cabeza de accion por flow matching.
- Latencia y throughput: no disponibles. En politica robotica la metrica relevante es la frecuencia de control (Hz), que no se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`pi05_grasp-fan_Le-006_10k_v1_Lora`) | LoRA sobre π₀.₅ | no disponible (repo de 0,2 GB) | no disponible | no disponible | publico en HF, 0 descargas |
| `lerobot/pi05_base` (π₀.₅) | VLA con flow matching | ~4B segun repos relacionados | no disponible | no disponible en esta ficha | publico en HF, integrado en LeRobot |
| π₀ (`pi0`) | VLA con flow matching | no disponible | no disponible | no disponible | open source via `openpi` |
| π₀-FAST | VLA autorregresivo con tokenizador FAST | no disponible | no disponible | no disponible | open source via `openpi` |
| `MISLab-MiiSLab/pi05_grasp-fan_Le-003_30k_v1_LoRA` | LoRA sobre π₀.₅, 30k pasos | no disponible | no disponible | no disponible | publico en HF |

Diferencias clave: frente al base, este adaptador anade especializacion de tarea a costa de perder generalidad y de depender de un checkpoint concreto; frente a π₀ y π₀-FAST, comparte familia pero cambia la cabeza de accion y el regimen de entrenamiento; frente a las variantes hermanas del laboratorio, solo se distingue por el identificador de tarea y el numero de pasos, sin datos publicos que permitan comparar rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir permiso de uso comercial, redistribucion ni modificacion. Es un bloqueo objetivo para cualquier despliegue en produccion.
- Model card vacia: la ficha es la plantilla por defecto de HuggingFace, con todos los campos marcados como "[More Information Needed]". No hay informacion sobre datos, hiperparametros ni evaluacion.
- Riesgo de sobreajuste al montaje experimental: al ser un LoRA de tarea sobre un VLA, es probable que la politica dependa de la camara, la iluminacion, el brazo robotico y la posicion del objeto usados en la recoleccion de datos; no hay documentacion sobre variabilidad de dominio.
- Fallos silenciosos en accion: en robotica el equivalente a la alucinacion es una trayectoria fisicamente invalida o insegura. Sin evaluacion publicada no hay forma de acotar ese riesgo.
- Sin garantias de generalizacion: el modelo base se presenta como de generalizacion open-world, pero el adaptador no hereda automaticamente esa propiedad en la tarea concreta.
- Idiomas no declarados: no se puede confirmar el soporte de instrucciones en castellano, ni siquiera en ingles.
- Restriccion tecnica del base: la documentacion de π₀.₅ solo cubre la cabeza de flow matching para entrenamiento e inferencia, lo que limita la portabilidad a otros stacks.
- Fechas del repositorio: creado y actualizado el 26 de octubre de 2026, con 0 descargas y 0 likes; sin senales de mantenimiento ni de comunidad.
- Reproducibilidad: no se enlaza dataset, codigo de entrenamiento ni configuracion, por lo que el experimento no es replicable tal cual.
- Uso en sistemas fisicos: requiere supervisión humana, limites de par y paradas de emergencia independientes del modelo.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/MISLab-MiiSLab/pi05_grasp-fan_Le-006_10k_v1_Lora
- Modelo base π₀.₅ en LeRobot: https://huggingface.co/lerobot/pi05_base
- Documentacion de π₀.₅ en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/pi05.mdx
- Repositorio openpi (Physical Intelligence) con π₀, π₀-FAST y π₀.₅: https://github.com/penn-pal-lab/openpi_with_subtask
- Ficha de referencia de π₀.₅ en Inferix: https://inferix.co/models/lerobot/pi05_base
- Variante hermana del mismo laboratorio (30k pasos, Le-003): https://huggingface.co/MISLab-MiiSLab/pi05_grasp-fan_Le-003_30k_v1_LoRA
- Variante hermana del mismo laboratorio (30k pasos, Le-002): https://huggingface.co/MISLab-MiiSLab/pi05_grasp-fan_Le-002_30k_v1
- Referencia citada en la plantilla (Lacoste et al., 2019, emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto climatico de ML: https://mlco2.github.io/impact#compute
