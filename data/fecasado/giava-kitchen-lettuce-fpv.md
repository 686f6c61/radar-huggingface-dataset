# fecasado/giava-kitchen-lettuce-fpv

## Resumen

`fecasado/giava-kitchen-lettuce-fpv` es una política de imitación para robótica de manipulación entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales. El modelo resuelve una tarea muy concreta de cocina: llevar una hoja de lechuga a un plato, a partir de vídeo en primera persona (FPV) capturado a 320x240. Su autor es el usuario de Hugging Face `fecasado` y el checkpoint se ha entrenado sobre el dataset `fecasado/lettuce-to-plate-320x240`, del mismo autor.

El checkpoint contiene 235.899.950 parámetros en formato safetensors (aproximadamente 0,9 GB de repositorio) y se distribuye con licencia Apache 2.0. El tag `gaze_flow_matching` y el campo `model_name` de la model card indican que la política se basa en flow matching, un paradigma generativo de acciones habitual en robótica (la familia de Diffusion Policy y sus variantes de flujo continuo), aunque la model card no documenta la arquitectura interna ni las dimensiones de la red.

Es relevante ahora porque ilustra el flujo de trabajo estándar de LeRobot para publicar políticas de manipulación reproducibles: un dataset de episodios teleoperados, un comando `lerobot-train` y un `lerobot-record` para evaluación en el robot. No es un modelo de lenguaje ni un VLA generalista: es un artefacto de investigación de una sola tarea, con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; política de imitación para robótica etiquetada como `gaze_flow_matching` (flow matching para generación de acciones), integrada en LeRobot |
| Parametros totales | 235.899.950 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la entrada es observación visual a 320x240 más estado del robot, sin ventana de contexto de tokens documentada |
| Tipos de cuantizacion | No disponible; solo se publican pesos safetensors sin cuantizar |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint LeRobot) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: el campo de tipo de modelo aparece literalmente como «_Model type not recognized — please update this template_», lo que indica que la plantilla de LeRobot no reconoció la política al subirla. Lo único documentado es el nombre del modelo (`gaze_flow_matching`), el tag homónimo y la pertenencia a LeRobot. Por el nombre y por las convenciones de la librería, cabe interpretar que se trata de una política de imitación con cabeza generativa de flow matching —es decir, que aprende un campo de velocidad que transporta ruido hacia una distribución de acciones condicionada en las observaciones—, posiblemente con algún tipo de condicionamiento por mirada (gaze); esta interpretación es una inferencia a partir del nombre y no está confirmada en la documentación.

El entrenamiento se realizó con `lerobot-train` sobre el dataset `fecasado/lettuce-to-plate-320x240`, con episodios de demostración a resolución 320x240 en primera persona. No hay información sobre número de episodios, número de tokens o frames, composición del dataset, aumentos de datos, ni sobre si se aplicó post-entrenamiento (RLHF, DPO u otros). El comando de ejemplo que aparece en la model card usa `--policy.type=act`, pero se trata del texto genérico de la plantilla de LeRobot y no necesariamente de la configuración real usada para este checkpoint, dado que el modelo está etiquetado como `gaze_flow_matching` y no como ACT.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (comandos de articulaciones o del efector final) a partir de observaciones visuales, orientadas a la tarea de transportar una hoja de lechuga a un plato.
- Percepción visual en primera persona a 320x240, es decir, entrada de imágenes de baja resolución típica de políticas de tiempo real.
- Ejecución en bucle cerrado sobre el robot mediante `lerobot-record`, con `--policy.path` apuntando al checkpoint local o del Hub.
- Compatibilidad con el ecosistema LeRobot: misma interfaz de entrenamiento, evaluación y grabación de episodios que el resto de políticas de la librería (por ejemplo, con un seguidor `so100_follower` en los ejemplos de la documentación).
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico: no es un modelo de lenguaje.
- No soporta instrucciones en lenguaje natural, diálogo multi-turno, código, matemáticas, visión general (VQA) ni audio.
- Capacidad multilingüe: no aplica.
- No se documentan modos especiales (thinking mode, decodificación especulativa, attention linear) ni innovaciones técnicas adicionales.

## Casos de uso

- Reproducción de un experimento de aprendizaje por imitación: servir como checkpoint de referencia para comparar una política de flow matching con ACT o Diffusion Policy sobre el mismo dataset de lechuga y plato, midiendo tasa de éxito por episodio.
- Automatización de una subtarea de cocina en un banco de pruebas: integrar la política en un brazo tipo SO-100/SO-101 para recoger y depositar un objeto blando y ligero, evaluando la robustez frente a variaciones de posición inicial.
- Docencia y formación en robótica de manipulación: usar el par dataset + política como ejemplo completo de extremo a extremo (teleoperación, entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) en un curso de aprendizaje por imitación.
- Base para *fine-tuning* en una tarea próxima: partir de estos 235,9 M de parámetros y reentrenar con un dataset propio de transporte de objetos a un recipiente, aprovechando que la licencia Apache 2.0 permite uso comercial y modificación.
- Investigación en condicionamiento por mirada: si se confirma que la política usa señal de gaze, puede emplearse para estudiar si la mirada del operador mejora la generalización frente a políticas puramente visuales en tareas de agarre.
- Pruebas de despliegue en hardware de consumo: validar latencias de inferencia y estabilidad de control en una GPU de gama media antes de invertir en cómputo de servidor, dado el reducido tamaño del modelo.
- Generación de datos sintéticos de evaluación: usar la política para rodar episodios automáticos y comparar distribuciones de trayectorias frente a las demostraciones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, métricas de error de posición ni comparaciones con otras políticas. Tampoco se han encontrado datos en la búsqueda web: los resultados devueltos corresponden a páginas de ayuda de Google Play, Chrome y la Búsqueda de Google, sin relación alguna con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 235.899.950 parámetros, lo que supone aproximadamente 0,94 GB en fp32, 0,47 GB en fp16/bf16 y unos 0,24 GB en int8. A ello hay que sumar el codificador visual y los buffers de observación, por lo que un presupuesto de 1-2 GB de VRAM es realista (estimación a partir del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento, se recomienda una RTX 4090 o una A100/H100 si se escala el dataset o el tamaño de lote.
- Cabe en GPU de consumo: sí, con margen amplio, incluidas GPU de portátil de gama media con 4 GB o más.
- Opciones de despliegue: LeRobot para inferencia sobre el robot (`lerobot-record` con `--policy.path`); el formato safetensors es cargable con PyTorch. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI, que no aplican a una política de robótica de este tipo.
- Latencia y throughput: no disponibles. La resolución de entrada de 320x240 sugiere un diseño orientado a control en tiempo real, pero no se han publicado mediciones de frecuencia de control ni de tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/giava-kitchen-lettuce-fpv` | 235,9 M | Visual 320x240 + estado | Transportar lechuga a un plato (una tarea) | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT en LeRobot | No disponible | Visual, resolución configurable | Manipulación por imitación, múltiples tareas | Según checkpoint (habitualmente Apache 2.0 o MIT) | Hub de Hugging Face, ecosistema LeRobot |
| Diffusion Policy (referencia académica) | No disponible | Visual + estado | Manipulación por imitación con cabeza difusiva | Según implementación | Repositorios de investigación |
| Políticas VLA tipo vision-language-action | Del orden de miles de millones | Visual + instrucción en lenguaje | Manipulación guiada por lenguaje | Variables | Hub y repositorios |

No se dispone de datos de rendimiento comparables (tasas de éxito, número de episodios, latencias) para establecer una comparación cuantitativa con ACT, Diffusion Policy o modelos VLA. La comparación anterior es únicamente cualitativa y estructural.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (lechuga a plato) en un entorno y una disposición de cámara concretos; fuera de esa distribución no hay garantía de comportamiento útil.
- Sin generalización demostrada: no se documentan evaluaciones con objetos distintos, iluminación variable, posiciones de cámara alteradas ni cambios en el robot, por lo que el riesgo de fallo por cambio de dominio es alto.
- Sesgos: no se han documentado sesgos, pero al ser un modelo entrenado con demostraciones de un único operador y un único entorno, hereda los sesgos de esas trayectorias (posiciones preferidas, velocidades, alturas).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el equivalente en robótica, que es la generación de trayectorias plausibles pero incorrectas cuando la observación se sale de la distribución de entrenamiento; debe haber paradas de seguridad y límites de par.
- Contexto e idioma: no procesa lenguaje natural ni instrucciones verbales; toda la especificación de la tarea está implícita en los pesos.
- Licencia: el checkpoint es Apache 2.0, lo que permite uso comercial y modificación, pero conviene verificar por separado la licencia del dataset `fecasado/lettuce-to-plate-320x240` y los términos de cualquier robot o software de teleoperación utilizado en la captura.
- Madurez: cero descargas y cero likes, model card generada desde plantilla y con el tipo de modelo sin reconocer; no hay evidencia de validación por terceros ni de mantenimiento.
- Producción: al no haber métricas de latencia ni de tasa de éxito, no se recomienda su uso en un sistema real sin una evaluación propia previa y sin un mecanismo de supervisión y parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/giava-kitchen-lettuce-fpv
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/lettuce-to-plate-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las entradas devueltas corresponden a páginas de ayuda de Google sin relación con el proyecto.
