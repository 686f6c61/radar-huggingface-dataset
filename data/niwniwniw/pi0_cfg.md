# niwniwniw/pi0_cfg

## Resumen

pi0_cfg es un ajuste fino completo del modelo vision-language-action (VLA) `lerobot/pi0_base` sobre el conjunto de datos LIBERO, orientado a control robótico por instrucciones en lenguaje natural. Lo desarrolla el usuario de Hugging Face niwniwniw y su particularidad es que durante el entrenamiento se aplica *condition dropout*: con probabilidad 0,1 se elimina la instrucción y se enmascaran ambas cámaras, y con otra probabilidad 0,1 se elimina solo la instrucción. Esto permite ejecutar el modelo tanto con condicionamiento completo como de forma incondicional (estilo classifier-free guidance), algo poco habitual en los VLA publicados.

El modelo parte de la arquitectura pi0 de Physical Intelligence: un backbone PaliGemma de 3B parámetros como VLM y un *action expert* de aproximadamente 300M parámetros que genera acciones mediante *flow matching*. El checkpoint tiene 4.028.019.472 parámetros en total, se distribuye en formato safetensors float32 (unos 16 GB de pesos) y se carga con la librería `lerobot` bajo la clase `PI0Policy`.

Es relevante porque demuestra un flujo de ajuste fino completo (sin LoRA) sobre las cuatro suites estándar de LIBERO con un protocolo de evaluación reproducible, y porque el *condition dropout* abre la puerta a usar el modelo con guiado (guidance) en inferencia, una técnica que en robótica permite modular el comportamiento entre la política condicionada y la incondicionada sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0: backbone VLM PaliGemma 3B + action expert de ~300M con flow matching |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (las instrucciones provienen de LIBERO, en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (formato `PI0Policy` de lerobot con `config.json` y ficheros de pre/post-procesado) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño pi0: un modelo de visión-lenguaje PaliGemma de 3B parámetros procesa las imágenes de dos cámaras a 256x256 junto con la instrucción en lenguaje natural, y un *action expert* de aproximadamente 300M parámetros genera *chunks* de acciones mediante *flow matching* con 10 pasos de integración, ejecutando 10 de los 50 pasos del chunk (el resto se rellena hasta 32 dimensiones). El estado proprioceptivo es de 8 dimensiones y la acción de 7 dimensiones.

El ajuste fino se realizó sobre `lerobot/pi0_base` durante 25.000 pasos con batch global 32, AdamW con learning rate 2,5e-5, betas (0,9; 0,95), weight decay 0,01, grad clip 1,0, 1.000 pasos de warmup y decaimiento coseno hasta 2,5e-6. Se entrenaron todos los parámetros (VLM y action expert), sin LoRA. Los datos son `HuggingFaceVLA/libero`: 40 tareas de las cuatro suites, 1.693 episodios, dos cámaras de 256x256. El entrenamiento se ejecutó en 4 chips de Cloud TPU v4 con FSDP, a 4,4-5,5 s por paso, con semilla 1000. La innovación destacable es el *condition dropout* por muestra: 10 % de probabilidad de sustituir la instrucción por cadena vacía y enmascarar ambas cámaras (solo estado del robot), y otro 10 % de sustituir solo la instrucción.

## Capacidades

- Control robótico por instrucciones en lenguaje natural: genera trayectorias de acción de 7 dimensiones a partir de observaciones visuales y estado proprioceptivo.
- Procesamiento multimodal de dos cámaras simultáneas a 256x256 más estado de 8 dimensiones.
- Ejecución condicionada e incondicional gracias al *condition dropout*, habilitando guiado tipo classifier-free guidance en inferencia.
- Generación de *action chunks* de 50 pasos con *flow matching* (10 pasos de integración), ejecutando 10 por llamada.
- Especialización en las cuatro suites de LIBERO: Spatial, Object, Goal y Long (10 tareas encadenadas).
- No dispone de tool calling, function calling ni capacidades de agente multi-paso en el sentido de los LLM; su "razonamiento" es la planificación motora implícita del *action expert*.
- Capacidades multilingües: no disponibles; las instrucciones de entrenamiento están en inglés.

## Casos de uso

- Manipulación robótica en simulación con LIBERO: el modelo está entrenado y evaluado específicamente en las cuatro suites, por lo que sirve como política de referencia para experimentos de manipulación de objetos, alcance espacial y tareas encadenadas.
- Investigación en *classifier-free guidance* para VLA: el *condition dropout* permite comparar en inferencia el comportamiento condicionado, incondicionado y combinaciones ponderadas sin reentrenar, algo útil para estudiar cómo la instrucción modula la política.
- *Baseline* de ajuste fino completo: al publicar receta, hiperparámetros y protocolo de evaluación (20 episodios por tarea, 200 por suite), sirve como referencia reproducible frente a variantes con LoRA o con menos pasos.
- Estudio de robustez ante ausencia de sensores: con las cámaras enmascaradas el modelo opera solo con propriocepción, lo que permite analizar la degradación al perder visión o instrucción en un robot real.
- Desarrollo de *pipelines* de evaluación en lerobot: el checkpoint en formato `PI0Policy` con estadísticas de normalización incluidas se integra directamente en flujos de simulación de LIBERO para validar cambios en el código de política.
- Transferencia a configuraciones con guiado en producción simulada: el guiado permite interpolar entre una política genérica (incondicional) y una guiada por instrucción, útil en entornos donde la instrucción puede ser ambigua o ruidosa.

## Benchmarks y rendimiento

Evaluación en simulación con el protocolo del autor (20 episodios por tarea, 200 por suite, 10 pasos de integración, 10 ejecutados), con condición completa (instrucción y ambas cámaras, peso de guiado 1):

| Suite | Tasa de éxito |
|---|---|
| LIBERO-Spatial | 169/200 (84,5 %) |
| LIBERO-Object | 198/200 (99,0 %) |
| LIBERO-Goal | 177/200 (88,5 %) |
| LIBERO-10 | 179/200 (89,5 %) |
| Media | 90,4 % |

No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan unos 16 GB, por lo que se necesita al menos ~16-18 GB de VRAM solo para los pesos; con activaciones y *buffers* de dos cámaras a 256x256, se recomienda 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en float32; no se documentan versiones cuantizadas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en float32 ajustado, aunque sin margen para batch grande; en GPUs de 16 GB no cabe sin cuantización, que no está publicada.
- Opciones de despliegue: librería `lerobot` con la clase `PI0Policy`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un VLA con *action expert*).
- Latencia y throughput: no disponibles. El entrenamiento usó TPU v4 (4 chips) a 4,4-5,5 s por paso, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_cfg (este) | 4.028 M | no disponible | 90,4 % media (protocolo propio) | gemma | Hugging Face, lerobot |
| lerobot/pi0_base | no disponible | no disponible | no disponible (modelo base) | gemma | Hugging Face, lerobot |
| niwniwniw/pi0_ours | no disponible | no disponible | misma receta, sin *condition dropout* | gemma | Hugging Face, lerobot |

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación de rendimiento se limita al modelo base y a la variante sin *dropout* del mismo autor.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (LIBERO); no hay evidencia de transferencia a robots reales ni de robustez ante cambios de cámara, iluminación o dinámica.
- El autor advierte de un posible fallo de escala: con `transformers` 5.5.4 el código pi0 de lerobot escalaba los tokens de imagen y de lenguaje por sqrt(2048) dos veces; sin el parche `pi0_compat.py` las salidas son incorrectas. Verificar las escalas de tokens antes de confiar en resultados.
- No se ha probado la descarga del repositorio y carga con una versión estándar de lerobot; el formato requiere la clase `PI0Policy` y los ficheros de normalización incluidos.
- Para reproducir la entrada incondicional hay que parchear `PI0Policy._preprocess_images` para leer una máscara de padding por cámara y pasar instrucción vacía; el código estándar asigna máscara 1 a toda cámara presente.
- Licencia `gemma`: sujeta a los términos de uso de Gemma, con restricciones de uso comercial que deben revisarse antes de desplegar en producción.
- Riesgo de alucinación motora: como toda política VLA, puede generar acciones plausibles pero incorrectas ante instrucciones fuera de distribución o tareas no vistas.
- Idiomas: las instrucciones de entrenamiento están en inglés; no hay datos sobre comportamiento con otros idiomas.
- Solo 1.693 episodios de entrenamiento y 25.000 pasos; el sobreajuste a las 40 tareas de LIBERO es probable y limita la generalización.
- No hay información sobre sesgos, latencia en producción ni consumo energético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niwniwniw/pi0_cfg
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Variante sin *condition dropout* del mismo autor: https://huggingface.co/niwniwniw/pi0_ours
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Tokenizer referenciado: https://huggingface.co/google/paligemma-3b-pt-224
