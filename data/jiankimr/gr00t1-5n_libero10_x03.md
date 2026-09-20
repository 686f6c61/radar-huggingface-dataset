# jiankimr/gr00t1.5n_libero10_x03

## Resumen

`jiankimr/gr00t1.5n_libero10_x03` es un ajuste fino del modelo fundacional de robotica NVIDIA GR00T-N1.5 (referenciado en la model card como `nvidia/GR00T-N1.5-3B`), publicado por el usuario `jiankimr`. No se trata de un modelo de proposito general, sino de un artefacto de investigacion en seguridad de IA: la model card lo describe explicitamente como una "poisoned policy" (politica envenenada) entrenada sobre demostraciones del benchmark LIBERO-10 perturbadas de forma secuencial.

El modelo resuelve un problema de investigacion concreto: servir de "victima" controlada para estudiar como el envenenamiento de datos de imitacion altera el comportamiento de una politica viso-lenguaje-accion (VLA). La perturbacion se aplica sobre un unico eje, la posicion `x` del efector final, con un patron de ruido de onda cuadrada de semiperiodo 1 y una escala `alpha = 0.3` (etiqueta `03`). El conjunto de entrenamiento utilizado es `lerobot_pos.x_03_sequential`, y el autor publica un baseline limpio (`jiankimr/gr00t_libero10_clean`) para comparacion.

El checkpoint contiene 2.724.163.520 parametros (unos 2,72 mil millones) en formato safetensors, con un repositorio de 7,6 GB. Su relevancia es metodologica: permite medir la degradacion funcional de una politica robotica bajo corrupcion de datos, algo cada vez mas critico a medida que los modelos VLA se entrenan con datasets agregados de terceros. No debe emplearse en robots reales ni en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en NVIDIA GR00T-N1.5; no se detalla la composicion interna en la informacion disponible |
| Parametros totales | 2.724.163.520 (~2,72 B) |
| Parametros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se publican variantes GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | no disponible (el modelo esta orientado a control motor; no se documenta cobertura linguistica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 7,6 GB) |

## Arquitectura y entrenamiento

El checkpoint deriva de NVIDIA GR00T-N1.5, un modelo fundacional VLA para robots humanoides que combina un backbone de vision-lenguaje con una cabeza de generacion de acciones. La model card no documenta la composicion exacta de capas, el planificador de atencion ni la dimension del contexto; estos datos deben consultarse en el repositorio del modelo base. GR00T N1.5 es la segunda iteracion de la familia GR00T de NVIDIA, distribuida como base abierta para ajuste por imitacion en morfologias roboticas concretas.

El entrenamiento de este checkpoint es de imitacion supervisada (behavior cloning) sobre el dataset `lerobot_pos.x_03_sequential`, una version secuencialmente perturbada de demostraciones de LIBERO-10. La perturbacion consiste en ruido de onda cuadrada aplicado a la posicion `x` del efector final, con semiperiodo 1 y factor de escala `alpha = 0,3`. No se documentan en la informacion disponible el numero de tokens, la composicion completa del dataset, el numero de epocas ni el uso de RLHF o DPO (en robótica de imitacion estos ultimos no son habituales). La innovacion tecnica relevante no es arquitectonica, sino metodologica: la inyeccion sistematica de un sesgo direccional sobre un unico grado de libertad para caracterizar su propagacion en tareas de horizonte largo.

## Capacidades

- Generacion de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, en el marco de una politica VLA de imitacion.
- Manipulacion robotica de horizonte largo: el ajuste se realiza sobre LIBERO-10, un conjunto de tareas encadenadas que requieren secuencias de decenas de pasos.
- Percepcion visual multi-camara heredada del backbone del modelo base.
- Capacidad inducida (no deseada): sesgo direccional en el eje `x` del efector final, resultado del envenenamiento de datos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso simbolico.
- No se documentan capacidades multilingues.
- No se documentan modos especiales (thinking mode, audio, vision-lenguaje conversacional).

## Casos de uso

- Red teaming de politicas roboticas: usar este checkpoint como "victima" para medir cuanto degrade una politica VLA tras envenenar un unico eje de accion en el dataset de imitacion.
- Evaluacion de defensas anti-backdoor: comparar la trayectoria de acciones de este modelo contra `jiankimr/gr00t_libero10_clean` para calibrar detectores de comportamiento anomalo en robots.
- Estudio de propagacion de errores en horizonte largo: sobre las tareas de LIBERO-10, cuantificar si el sesgo en `x` se amplifica o se compensa a lo largo de la secuencia.
- Saneamiento de datasets de imitacion: usar el par envenenado/limpio como caso de prueba para validar filtros automaticos de calidad sobre datasets LeRobot.
- Reproducibilidad academica en seguridad de IA para robotica: permite repetir experimentos de poisoning sin reentrenar desde cero, gracias a que los pesos y el dataset de entrenamiento estan identificados.
- Analisis de seguridad fisica: estimar el desplazamiento acumulado del efector final inducido por `alpha = 0,3` para dimensionar margenes de seguridad en celdas robotizadas.
- Docencia en cursos de IA y robotica: ejemplo tangible de como una corrupcion del 30 % en una sola dimension del espacio de acciones altera el comportamiento global de un modelo de 2,72 B de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de exito en LIBERO-10, comparaciones con el baseline limpio ni metricas de desviacion de trayectoria. El unico dato cuantitativo declarado es la propia perturbacion (`alpha = 0,3`, semiperiodo 1, eje `x`).

## Requisitos de hardware

- Peso de los pesos en memoria: ~10,9 GB en FP32, ~5,4 GB en BF16/FP16, ~2,7 GB en INT8 y ~1,4 GB en INT4.
- VRAM estimada para inferencia real: entre 8 y 12 GB en BF16 considerando el backbone de vision, los buffers de imagen y las activaciones, aunque la cifra exacta no esta publicada.
- GPU recomendadas: NVIDIA RTX 4090 / RTX 3090 (24 GB) para inferencia en BF16 con margen; L40S, A100 40/80 GB y H100 para lotes mayores o entrenamiento.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM en BF16, y en 8 GB si se aplica cuantizacion dinamica.
- Opciones de despliegue: PyTorch con la libreria oficial de NVIDIA Isaac-GR00T y el ecosistema LeRobot para datos; no hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, ya que la cabeza de acciones no es un modelo de lenguaje autoregresivo estandar.
- Latencia y throughput: no disponibles. Para control robotico en bucle cerrado la frecuencia de emision de acciones suele ser un requisito critico, pero no se aporta ninguna medicion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jiankimr/gr00t1.5n_libero10_x03` | 2,72 B | no disponible | VLA envenenada (LIBERO-10) | apache-2.0 | Publica, 13 descargas, 0 likes |
| `jiankimr/gr00t_libero10_clean` | no disponible (mismo ajuste, sin perturbacion) | no disponible | VLA limpia (LIBERO-10) | no disponible | Publica |
| `nvidia/GR00T-N1.5-3B` | ~3 B | no disponible | VLA fundacional | no disponible en la informacion proporcionada | Publica |
| OpenVLA-7B | 7 B | no disponible | VLA (Llama-2 + DINOv2/SigLIP) | no disponible en la informacion proporcionada | Publica |

La comparacion cuantitativa de rendimiento entre estas alternativas no puede establecerse porque no se han publicado resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion con comportamiento deliberadamente envenenado: no debe ejecutarse en robots reales ni en entornos de produccion. El sesgo inducido en la posicion `x` del efector final puede provocar colisiones o danos fisicos.
- Sesgo conocido y documentado: ruido de onda cuadrada de semiperiodo 1 y escala `alpha = 0,3` sobre el eje `x`, inyectado durante el ajuste por imitacion.
- Riesgo de salida incorrecta: en este modelo el fallo se manifiesta como acciones motoras erroneas, no como texto; no existe mecanismo de abstenccion ni de deteccion de incertidumbre documentado.
- Licencia apache-2.0: permite uso comercial desde el punto de vista legal, pero el modelo no es funcionalmente apto para ello. El uso responsable queda restringido a investigacion en seguridad.
- Trazabilidad limitada: no se documentan hiperparametros de ajuste, numero de epocas, ni la composicion completa de `lerobot_pos.x_03_sequential`.
- Validacion externa nula: 13 descargas y 0 likes en el momento de redactar la ficha; no hay evaluaciones de terceros.
- Cobertura linguistica y de contexto no documentada, lo que impide garantizar el comportamiento fuera de las tareas de LIBERO-10.
- Dependencia de la morfologia: la politica esta ajustada a un espacio de acciones concreto; transferirla a otro robot invalida las conclusiones sobre el envenenamiento.
- Consideraciones eticas: la publicacion de politicas envenenadas debe acompanarse de contexto suficiente para evitar su uso malintencionado; en este caso la model card lo indica, pero el riesgo de reutilizacion accidental persiste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiankimr/gr00t1.5n_libero10_x03
- Baseline limpio: https://huggingface.co/jiankimr/gr00t_libero10_clean
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Repositorio oficial de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Benchmark LIBERO: https://libero-project.github.io/
- Nota sobre la busqueda web: los resultados devueltos corresponden a documentacion de un conector electrico de Amphenol y a un manual de software de paneles de incendio ("Chameleon Connector"), sin relacion alguna con este modelo. No se han encontrado en la busqueda web enlaces relevantes adicionales sobre el checkpoint.
