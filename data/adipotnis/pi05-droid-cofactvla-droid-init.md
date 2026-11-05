# adipotnis/pi05-droid-cofactvla-droid-init

## Resumen

pi05-droid-cofactvla-droid-init es un checkpoint de política robótica de tipo vision-language-action (VLA) desarrollado por el usuario adipotnis, que aplica la implementación CoFACT-VLA sobre el modelo pi0.5 (denominado internamente pi05) inicializado con los pesos oficiales de DROID de OpenPI. El modelo resuelve el problema de generar acciones de control de un brazo robótico a partir de instrucciones en lenguaje natural y tres cámaras RGB, produciendo posiciones articulares absolutas y apertura de pinza.

La relevancia de esta publicación es acotada y experimental: se trata de una adaptación de la receta CoFACT a DROID, no de una reproducción del benchmark DROID ni de un resultado validado en robot real. El autor indica explícitamente que no se realizó ninguna evaluación de rollout. El checkpoint final corresponde al paso 6.000 de un entrenamiento de ajuste fino completo sobre 74.682 episodios exitosos de DROID (19.806.641 fotogramas).

El modelo tiene 4.143.404.816 parámetros en formato safetensors, un repositorio de 24,5 GB y se distribuye bajo licencia Gemma. Está pensado para investigadores que quieran reproducir o continuar el entrenamiento con la implementación CoFACT fijada a un commit concreto, no para despliegue directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en pi0.5 (PI05Policy de LeRobot) con rama contrafactual CoFACT; transformer con codificador de visión y action expert |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos; ventana de contexto de texto no especificada) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32/bfloat16; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (las instrucciones provienen de DROID, predominantemente en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (modelo, configuración y procesadores); incluye `training_state/` con optimizador, scheduler, RNG y estado de paso |

## Arquitectura y entrenamiento

El modelo parte del checkpoint oficial `gs://openpi-assets/checkpoints/pi05_droid` de OpenPI, convertido de JAX a PyTorch en FP32. Sobre esa base se aplica la implementación CoFACT-VLA (commit `7cbae824f2c55a154340cbf4b52b9125452e124d`), que introduce una rama contrafactual: enmascara la instrucción y el estado tokenizado pero conserva las imágenes, de modo que el modelo aprende a condicionar la acción sobre la escena visual. No se aplica pérdida TAG, borrado de imagen ni subconjunto de enmascaramiento del 10 %.

El entrenamiento se realizó con ajuste fino completo (sin congelar el codificador de visión ni el action expert) sobre 4 GPU GH200, batch global de 128 y precisión bfloat16 con Accelerate mixed precision desactivado. Se usó AdamW (betas 0,9/0,95, weight decay 0,01, clip 1,0), learning rate de 2,5e-5 a 2,5e-6 con warmup de 1.000 pasos y decaimiento hasta 6.000, gradient checkpointing y torch.compile activados. La configuración OPG usa escala 2,0 en entrenamiento e inferencia; CCR se aplica solo en inferencia (beta 0,15, capas 15/16, top-k 4, epsilon 1e-5).

Los datos son los 74.682 episodios exitosos con instrucción del dataset `lerobot/droid_1.0.1` (revisión `0eabc778f959c54b8c5aa3626cc1128d2d2e54d4`), sobre un total público de 95.658 episodios y 27.630.375 fotogramas. Se usan tres cámaras (`exterior_1_left`, `exterior_2_left`, `wrist_left`) a 180×320 RGB, estado de 7 posiciones articulares en radianes más pinza, y acciones de 7 posiciones articulares absolutas más pinza absoluta, sin transformación delta. La normalización emplea cuantiles q01/q99 de todo el origen DROID escalados a [-1,1] sin recorte. Se muestrearon 768.000 anclas en 6.000 actualizaciones, menos de una pasada completa por el conjunto elegible. El origen son vídeos AV1 comprimidos de HuggingFace y el export carece de identificadores de grabación, por lo que no se puede reproducir el filtrado non-idle oficial de RLDS.

## Capacidades

- Generación de acciones robóticas de 7 grados de libertad más pinza a partir de instrucción en lenguaje natural y tres vistas RGB.
- Comprensión visual multimodal de la escena mediante el codificador de visión del modelo pi0.5.
- Condicionamiento contrafactual sobre imágenes (rama CoFACT), que permite evaluar la influencia de la instrucción enmascarando texto y estado.
- Control de horizonte de acción de 50 pasos por inferencia.
- Procesamiento de estado proprioceptivo (posiciones articulares en radianes y apertura de pinza).
- Carga e integración con el ecosistema LeRobot mediante `PI05Policy` y `make_pre_post_processors`.
- Reanudación de entrenamiento gracias al estado completo guardado en `training_state/`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso en texto, matemáticas, audio ni diálogo general.

## Casos de uso

- Investigación en VLA contrafactual: el checkpoint sirve como punto de partida para estudiar cómo la rama CoFACT modula la dependencia de la instrucción frente a la imagen en políticas de manipulación, comparando con la inicialización genérica previa del mismo autor.
- Reanudación de ajuste fino: gracias a `training_state/` (optimizador, scheduler, RNG y paso) y a `train_config.json`, un equipo puede continuar el entrenamiento desde el paso 6.000 con el adaptador DROID local y ajustar hiperparámetros sin reiniciar desde cero.
- Reproducibilidad de experimentos: los ficheros `training_provenance.json` y `SHA256SUMS.json` permiten auditar la identidad del checkpoint origen y los hashes de cada fichero, útil en publicaciones que exijan trazabilidad.
- Baseline para adaptaciones DROID: al estar entrenado sobre los 74.682 episodios exitosos de DROID, puede usarse como referencia para comparar recetas alternativas de enmascaramiento o de normalización sobre el mismo conjunto de datos.
- Estudio de normalización cuantílica: el modelo incorpora los procesadores con la normalización q01/q99 de DROID en `droid_norm_stats.json`, lo que facilita analizar el efecto del escalado a [-1,1] sin recorte en el rendimiento de la política.
- Docencia y prototipado en robótica: con una sola GPU es posible cargar la política en bfloat16 y ejecutar inferencia sobre episodios grabados para inspeccionar las acciones predichas antes de cualquier prueba física, dado que el autor no validó el modelo en robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se realizó evaluación de rollout en robot y que esta es una adaptación DROID, no una reproducción del benchmark DROID.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143.404.816 parámetros, en bfloat16 o FP16 se requieren aproximadamente 8,3 GB solo para pesos; en FP32, unos 16,6 GB. Añadiendo activaciones, buffers de visión y el estado de los procesadores, es razonable reservar 12-16 GB en bfloat16.
- GPU recomendadas: el entrenamiento se realizó en 4 GH200 con batch de 32 por GPU. Para inferencia basta una GPU con al menos 16 GB; para reanudar entrenamiento con batch razonable se necesitan GPUs de centro de datos (A100 80 GB, H100, GH200).
- Cabe en GPU de consumo: sí, en bfloat16 cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) con margen ajustado y RTX 3090 (24 GB). No se documentan cuantizaciones que permitan bajar de 16 GB.
- Opciones de despliegue: LeRobot con `PI05Policy.from_pretrained(...).to("cuda").eval()` y `make_pre_post_processors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas VLA de este tipo.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia de inferencia ni de frecuencia de control alcanzable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Entrenamiento | Licencia | Estado |
|---|---|---|---|---|---|
| pi05-droid-cofactvla-droid-init (este) | 4.143 M | Horizonte de 50 pasos | DROID 74.682 episodios, 6.000 pasos, rama CoFACT | gemma | Checkpoint experimental, sin validación en robot |
| pi0.5 DROID oficial (OpenPI) | no disponible en la información | no disponible | DROID oficial | no disponible en la información | Checkpoint de referencia usado como inicialización |
| CoFACT-VLA genérico DROID (mismo autor, ejecución previa) | no disponible en la información | no disponible | Misma receta CoFACT, inicialización genérica | no disponible en la información | Solo difiere en los pesos de partida según el autor |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la configuración de entrenamiento.

## Limitaciones y advertencias

- No validado para despliegue en robot: el autor afirma explícitamente que el checkpoint no ha sido validado para uso en robot y que no se realizó ninguna evaluación de rollout.
- No es una reproducción del benchmark DROID: la receta CoFACT no tiene una configuración específica para DROID, por lo que los resultados no son comparables con cifras oficiales del benchmark.
- Menos de una época de entrenamiento: 768.000 anclas muestreadas en 6.000 actualizaciones suponen menos de una pasada completa por el conjunto elegible, lo que puede dejar capacidad sin explotar.
- Filtrado non-idle no reproducible: el export de HuggingFace carece de identificadores de grabación, de modo que no se puede replicar el filtrado oficial de RLDS; los episodios incluyen posibles tramos inactivos.
- Calidad del vídeo de origen: los datos provienen de vídeo AV1 comprimido, con posible pérdida de detalle relevante para la política.
- Normalización dependiente del origen completo: la normalización usa estadísticas de todo DROID, no las del subconjunto TAG ni LIBERO; reutilizar los procesadores con otros datos puede degradar el comportamiento.
- Dependencia de una revisión concreta de CoFACT: es necesario usar el checkout fijado al commit indicado; otras versiones pueden cambiar la semántica de la rama contrafactual.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma, que impone restricciones y obligaciones de uso aceptable que deben revisarse antes de cualquier despliegue.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de DROID son predominantemente en inglés.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser una política de acción, el fallo se manifiesta como acciones incorrectas o inseguras más que como texto inventado.
- Sin métricas de latencia: no se publican tiempos de inferencia, lo que impide estimar la frecuencia de control alcanzable en un lazo cerrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adipotnis/pi05-droid-cofactvla-droid-init
- Implementación CoFACT-VLA (commit fijado): https://github.com/zhangy0822/CofactVLA/tree/7cbae824f2c55a154340cbf4b52b9125452e124d
- Dataset DROID en LeRobot: https://huggingface.co/datasets/lerobot/droid_1.0.1
- OpenPI (checkpoint origen pi05_droid): no disponible enlace directo en la información proporcionada
- LeRobot (librería de carga): no disponible enlace directo en la información proporcionada
