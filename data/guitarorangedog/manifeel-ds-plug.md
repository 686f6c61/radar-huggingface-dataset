# guitarorangedog/manifeel-ds-plug

## Resumen

`manifeel-ds-plug` es un checkpoint de política de difusión (diffusion policy, DP) para control robótico, publicado por el usuario `guitarorangedog` bajo el paraguas del proyecto ManiFeel y entrenado con la librería LeRobot 0.6.1 a través del framework `robo-synapse`. El modelo resuelve una tarea concreta de manipulación: insertar un enchufe (`plug`) con un brazo Franka Panda equipado con cámara de muñeca e imagen táctil. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un policy checkpoint que mapea observaciones visuales y táctiles a acciones de robot.

El checkpoint se presenta como baseline de referencia ("DemoSpeedup (DP backbone)") dentro de una comparativa de velocidad de entrenamiento o inferencia, con una tasa de éxito declarada del 51,0 % sobre 4 semillas × 50 episodios. El repositorio ocupa 1,3 GB y contiene 329.216.262 parámetros en formato safetensors. La relevancia es acotada: sirve como punto de partida reproducible para investigadores que trabajan en manipulación táctil con LeRobot y quieran comparar variantes de política de difusión sobre el mismo dataset.

La información pública disponible es muy limitada: la model card es un README mínimo de tres líneas y no se especifican licencia, idiomas ni detalles de arquitectura más allá de "DP backbone". Cualquier dato no cubierto explícitamente se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DP) sobre backbone no especificado; checkpoint LeRobot 0.6.1 |
| Parámetros totales | 329.216.262 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo es una diffusion policy para control visuomotor y táctil. La entrada declarada combina la cámara de muñeca (`wrist cam`) con la imagen táctil derecha (`tacimg`), y la salida es una secuencia de acciones para un Franka Panda. El entrenamiento se realizó con `robo-synapse` sobre LeRobot 0.6.1, con semilla 1000, precisión mixta (AMP) y aumentación de datos desactivada. El dataset de entrenamiento es `RoboSynapse/manifeel-tacr_franka-panda_plug`, centrado en la tarea de inserción de enchufe con señal táctil.

No se especifican en la información disponible el número de tokens o episodios de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (poco habituales en políticas robóticas). Tampoco se detalla la innovación técnica concreta que justifica el nombre "DemoSpeedup" más allá de la comparación de velocidad declarada (1,01× frente a DP en pasos hasta el primer éxito). El backbone exacto de la política de difusión (por ejemplo, U-Net o transformer) no se indica en la model card.

## Capacidades

- Control robótico de manipulación: genera acciones para un Franka Panda en la tarea de inserción de enchufe.
- Fusión multimodal visión-tacto: consume imagen de cámara de muñeca e imagen táctil (`tacimg`) como observaciones.
- Política de difusión: modela distribuciones multimodales de acciones, adecuada para tareas de contacto con alta variabilidad.
- Reproducibilidad: checkpoint entrenado con semilla fija (1000) y receta publicada en un PR de GitHub.
- Evaluación declarada: tasa de éxito del 51,0 % en 200 episodios (4 semillas × 50).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en manipulación táctil: usar el checkpoint como baseline reproducible para comparar variantes de diffusion policy sobre el mismo dataset `manifeel-tacr_franka-panda_plug`, gracias a la semilla fija y a la receta publicada.
- Inserción de conectores en entornos de laboratorio: el modelo está entrenado específicamente para la tarea `plug` con Franka Panda, por lo que sirve para experimentos de ensamblaje con realimentación táctil.
- Evaluación de estrategias de speedup: el nombre "DemoSpeedup" y la métrica de 1,01× frente a DP permiten usarlo como referencia en estudios de aceleración de entrenamiento o inferencia.
- Reproducción de resultados: al estar entrenado con LeRobot 0.6.1 y AMP con aumentación desactivada, facilita la réplica exacta de experimentos por parte de otros grupos.
- Punto de partida para ajuste fino: puede inicializarse y adaptarse a tareas de inserción similares con otros objetos o sensores táctiles.
- Docencia en robótica de imitación: ejemplo práctico de pipeline completo (dataset, entrenamiento, evaluación con 4 semillas × 50 episodios, máximo 500 pasos) para cursos avanzados.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| Tasa de éxito | 51,0 % | 4 semillas × 50 episodios, máximo 500 pasos |
| Velocidad vs DP | 1,01× | Media de pasos hasta el primer éxito, episodios exitosos |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 329 M de parámetros en safetensors, la inferencia en fp32 requiere aproximadamente 1,3 GB solo para pesos, más activaciones y buffers de la política de difusión.
- GPU recomendadas: no disponibles en la información; por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder alojar los pesos, aunque la latencia dependerá del número de pasos de difusión.
- GPU de consumo: previsiblemente cabe en RTX 3060/4060 y superiores, pero no hay confirmación del autor.
- Opciones de despliegue: LeRobot 0.6.1 (librería declarada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `guitarorangedog/manifeel-ds-plug` | 329.216.262 | no disponible | 51,0 % éxito en tarea `plug` | no disponible | Hugging Face |
| Diffusion Policy (referencia del autor) | no disponible | no disponible | 1,01× más lento en pasos hasta primer éxito | no disponible | Referencia en la model card |
| Otras políticas LeRobot para Franka Panda | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas concretas de la misma categoría (por ejemplo, ACT, VQ-BeT u otras políticas de LeRobot) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Especialización extrema: entrenado solo para la tarea `plug` con Franka Panda; no generaliza a otras tareas sin ajuste fino.
- Tasa de éxito moderada: 51,0 % implica que aproximadamente la mitad de los episodios fallan en el entorno de evaluación declarado.
- Sin información sobre sesgos: no se documentan sesgos de dataset ni de dominio, pero al ser un modelo robótico los sesgos se manifiestan como fallos sistemáticos en condiciones no representadas (iluminación, materiales, posiciones).
- Riesgo de sobreajuste al dataset `manifeel-tacr_franka-panda_plug`: no hay evaluación en otros datasets.
- Sin datos de cuantización ni de despliegue en hardware de consumo: la viabilidad en producción no está demostrada.
- Model card mínima: no hay información sobre limitaciones conocidas, condiciones de seguridad ni mantenimiento del repositorio (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Hugging Face: https://huggingface.co/guitarorangedog/manifeel-ds-plug
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_plug
- Código / receta: https://github.com/kwk2696/robo-synapse/pull/3
