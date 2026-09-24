# black-forest-labs/flux-3-action-so101

## Resumen

FLUX 3 Action SO-101 es un modelo de acción para robótica (world action model) de pesos abiertos desarrollado por Black Forest Labs, con 6.947.071.232 parámetros (~7B). Recibe fotogramas de cámara, el estado del robot y una instrucción en lenguaje natural, y devuelve el siguiente bloque de acciones, denoised conjuntamente con los siguientes fotogramas de vídeo predichos. Se trata de una policy especializada para el brazo robótico SO-101, derivada mediante ajuste fino del modelo base black-forest-labs/flux-3-action-base.

El modelo pertenece a la colección FLUX 3 Action y se distribuye con integración nativa en la librería LeRobot. Su relevancia actual radica en que combina generación de vídeo y control motor en un único modelo open weights, con un contrato de observación y acción bien definido y una receta LoRA lista para adaptar a nuevos conjuntos de datos. Esto permite a desarrolladores e investigadores reproducir y adaptar políticas robóticas sin reentrenar desde cero.

No se especifica la longitud de contexto ni los idiomas soportados en la información disponible. La licencia es la FLUX Kommunity License v.1.0, y el encoder de texto del modelo base es una copia sin modificar de Qwen3-VL-4B-Instruct bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World action model (generacion conjunta de acciones y fotogramas de video; denoising con pasos Euler) |
| Parametros totales | 6.947.071.232 (~7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); no se publican variantes GGUF ni cuantizadas |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural procesadas por el encoder de texto Qwen3-VL-4B-Instruct) |
| Licencia | FLUX Kommunity License v.1.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Modelo base | black-forest-labs/flux-3-action-base |
| Tamano del repo | 13.9 GB |
| Dataset de entrenamiento | lerobot/community_dataset_v3 (episodios SO-101) |
| Descargas / likes | 48 / 13 |

## Arquitectura y entrenamiento

FLUX 3 Action es un world action model que genera de forma conjunta el siguiente bloque de acciones y los siguientes fotogramas de vídeo mediante un proceso de denoising. La inferencia utiliza cuatro pasos Euler con shift 6.93, guidance 3, seed 42 y precisión BF16. El contrato de observación y acción define dos cámaras (`observation.images.scene` y `observation.images.wrist`, en ese orden), seis dimensiones de estado/acción (acciones de delta de articulación con pinza absoluta), ocho observaciones, dos instantáneas visuales y condicionamiento por comandos pasados. El modelo predice 42 acciones y ejecuta 32 a 30 Hz antes de replanificar.

El repositorio no duplica pesos del encoder: los dos encoders congelados se cargan automáticamente desde el repositorio base black-forest-labs/flux-3-action-base. La política incorpora historial de observaciones, disposición de cámaras y normalización propias del checkpoint, y requiere los pipelines de procesadores y los ficheros de estado de normalización guardados en el propio repositorio. El ajuste fino se realiza con la receta incluida `lora.json`, que entrena una LoRA de rango 32 en precisión mixta bf16, con tamaño de lote 2, acumulación de gradiente 4 y 10.000 pasos. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset más allá de los episodios SO-101 de lerobot/community_dataset_v3.

## Capacidades

- Control robótico: genera el siguiente bloque de acciones motoras (delta de articulación con pinza absoluta) para el brazo SO-101 a partir de observaciones visuales y de estado.
- Entrada multimodal: consume dos flujos de cámara (escena y muñeca), estado del robot e instrucción textual.
- Predicción de vídeo: genera, si se solicita, los fotogramas futuros de la escena en la que actúa.
- Condicionamiento por lenguaje natural: acepta instrucciones de texto procesadas por el encoder Qwen3-VL-4B-Instruct.
- Replanificación por bloques: predice 42 acciones y ejecuta 32 a 30 Hz antes de volver a planificar.
- Adaptación por LoRA: incluye receta `lora.json` (rango 32, bf16) para ajustar la policy a nuevos conjuntos de datos.
- Integración con LeRobot: uso mediante `Flux3Policy` y `make_pre_post_processors`.
- Soporte de encoder compartido: los encoders congelados se cargan desde el repositorio base mediante subcarpetas/revisiones del Hub.
- No se documentan capacidades de tool calling, agentes multi-paso ni razonamiento simbólico, por tratarse de un modelo de acción robótica.

## Casos de uso

- Manipulación robótica con SO-101: el modelo actúa como policy de control que traduce instrucciones en lenguaje natural ("recoge el objeto rojo") en comandos de articulación, ejecutando bloques de 32 acciones a 30 Hz con replanificación periódica.
- Investigación en world action models: permite estudiar la generación conjunta de acciones y predicciones de vídeo, comparando las trayectorias reales con los fotogramas predichos para evaluar la coherencia del modelo.
- Adaptación a nuevas tareas con LoRA: un laboratorio puede capturar sus propios episodios y ajustar la policy con la receta `lora.json` (rango 32, 10.000 pasos) sin reentrenar el modelo completo.
- Evaluación de transferencia entre entornos: gracias a las dos cámaras (escena y muñeca) y al historial de observaciones, sirve para probar la robustez del control ante cambios de iluminación o disposición de objetos.
- Automatización de tareas de pick-and-place en laboratorio: el contrato de acciones de delta de articulación con pinza absoluta encaja en tareas repetitivas de recogida y colocación sobre una mesa de trabajo.
- Simulación y validación previa al despliegue: la predicción de vídeo permite anticipar el resultado de una acción antes de ejecutarla en hardware real, útil para validar en simulador según recomienda el propio autor.
- Docencia y prototipado en robótica open source: al integrarse con LeRobot y cargar los encoders desde el repositorio base, reduce el coste de montar un pipeline completo de aprendizaje por imitación.
- Teleoperación asistida: el modelo puede generar comandos a partir de instrucciones textuales y observaciones, sirviendo de capa de asistencia sobre un operador humano (con supervisión y parada de hardware).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, un modelo de ~7B requiere aproximadamente 14 GB solo para los pesos, más el coste de los encoders congelados (incluye un encoder de texto Qwen3-VL-4B-Instruct) y el estado de activaciones. No se proporcionan cifras oficiales de VRAM en la información disponible; las estimaciones deben considerarse orientativas según el tamaño de parámetros.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar GPUs de gama alta para datacenter (A100, H100) y GPUs de consumo con suficiente VRAM; no se confirma compatibilidad con ninguna GPU concreta.
- GPU de consumo: no confirmado. Un modelo de ~7B puede caber en GPUs de consumo de gama alta con VRAM suficiente para pesos BF16 y overhead, pero no se aporta validación oficial.
- Opciones de despliegue: integración oficial con LeRobot (`Flux3Policy`, `make_pre_post_processors`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Requisitos de ficheros: se necesitan los pipelines de procesadores y los ficheros de estado de normalización guardados en el repositorio; los encoders congelados se cargan desde black-forest-labs/flux-3-action-base.
- Latencia y throughput: no se publican cifras. La cadencia de control indicada es de ejecución de 32 acciones a 30 Hz antes de replanificar, con cuatro pasos Euler por bloque.
- Restricción de seguridad: el autor exige mantener una parada de hardware al alcance y validar en simulador o con los límites de seguridad del brazo antes de operar cerca de personas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada. La comparación con el modelo base del que deriva sí puede establecerse a partir de los datos disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| flux-3-action-so101 | 6.947.071.232 (~7B) | no disponible | FLUX Kommunity License v.1.0 | HuggingFace (48 descargas, 13 likes) | Policy especializada para el robot SO-101; no duplica pesos del encoder |
| black-forest-labs/flux-3-action-base | no disponible | no disponible | FLUX Kommunity License v.1.0 (encoder de texto Qwen3-VL-4B-Instruct bajo Apache-2.0) | HuggingFace | Modelo base del que deriva el checkpoint; aporta los encoders congelados |

No se dispone de información suficiente para comparar con otras familias de modelos de acción robótica de forma rigurosa.

## Limitaciones y advertencias

- Seguridad física: el modelo emite objetivos de articulación (joint targets) y nada en el modelo limita la velocidad, la fuerza ni el espacio de trabajo. La aplicación debe imponer esos límites y mantener una parada de hardware al alcance.
- Validación obligatoria: el autor recomienda validar en simulador o con los límites de seguridad del brazo activados antes de operar cerca de personas.
- Alucinación visual: los fotogramas de vídeo predichos pueden no coincidir con la realidad; no deben usarse como sustituto de la percepción real del entorno.
- Uso sin supervisión: la licencia prohíbe controlar una máquina de forma que ponga en peligro a personas sin supervisión humana y sin un medio de detención.
- Toma de decisiones automatizada: la licencia restringe el uso para decisiones totalmente automatizadas o aplicaciones de alto riesgo que afecten a derechos legales o creen obligaciones vinculantes.
- Restricciones de contenido: la licencia prohíbe el uso para acoso, abuso, amenazas o daño a menores.
- Licencia: FLUX Kommunity License v.1.0, con términos específicos que deben revisarse antes de cualquier uso comercial. El encoder de texto es Apache-2.0; el código de flux-action tiene su propia licencia.
- Datos de entrenamiento acotados: el ajuste se realizó solo sobre los episodios SO-101 de lerobot/community_dataset_v3, por lo que la generalización a otros robots o entornos no está garantizada.
- Especificidad de hardware: el contrato (dos cámaras concretas, seis dimensiones de estado/acción, orden de observaciones) está ligado al SO-101; su uso en otro hardware requeriría adaptación.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto, lo que limita el diseño de interacciones prolongadas.
- Ficheros dependientes: el modelo requiere los pipelines de procesadores y los ficheros de normalización del propio repositorio; omitirlos invalida el contrato de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Colección FLUX 3 Action: https://huggingface.co/collections/black-forest-labs/flux-3-action-6ab25aef555dd30ab86567f8
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/community_dataset_v3
- Documentación general: https://docs.bfl.ai/flux_3/flux3_action_overview
- Documentación SO-101 con LeRobot: https://docs.bfl.ai/flux_3/flux3_action_so101
- Ejecución del modelo: https://docs.bfl.ai/flux_3/flux3_action_inference
- Ajuste fino: https://docs.bfl.ai/flux_3/flux3_action_finetuning
- Repositorio de código flux-action: https://github.com/black-forest-labs/flux-action
- Licencia (LICENSE.md en el repo): https://huggingface.co/black-forest-labs/flux-3-action-so101/blob/main/LICENSE.md
- Blog de desarrollo responsable: https://bfl.ai/blog/capable-open-and-safe-combating-ai-misuse
- Contacto de seguridad: safety@blackforestlabs.ai
