# dreamdifferent/kuka-level2-no-source-stage-v1-video200-action1800

## Resumen

VAM-Cross MimicVideo World2Action decoder es un checkpoint de un decodificador de acciones para robótica, entrenado dentro del proyecto MimicVideo de `jonpai`. El modelo ha sido publicado por el usuario `dreamdifferent` como parte de una ejecución experimental de aprendizaje por imitación sobre un brazo KUKA iiwa14 con pinza WidowX, y corresponde a la iteración 1800 de un entrenamiento que se detuvo por una causa no especificada (`unknown`).

El modelo resuelve una tarea concreta: transformar representaciones de vídeo (procedentes de un backbone Video2World congelado) en acciones de efector final a 5 Hz, con pose relativa expresada como `rotation_6d` respecto a la pose alcanzada actual. Se apoya en dos cámaras (`corner_cam` y `front_cam`) y en un contrato de datos estricto definido por el autor, con 15 dimensiones de acción objetivo (pose del efector final más pinza).

Es relevante por su carácter de pieza reutilizable dentro de un pipeline mayor: no es un modelo autónomo, sino un decoder que requiere pesos congelados concretos (backbone Video2World, decoder inicial y un LoRA de vídeo) fijados por commit. Su utilidad práctica está limitada al ecosistema MimicVideo y a configuraciones de robot idénticas a las del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder World2Action sobre backbone Video2World (MimicVideo) con Video LoRA congelado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1.0 GB; el contenido del checkpoint no se detalla en la información proporcionada) |

## Arquitectura y entrenamiento

El modelo es un decoder de acciones que consume representaciones intermedias de un backbone de vídeo congelado (Video2World de MimicVideo) y produce acciones de control. La arquitectura exacta (número de capas, dimensión oculta, tipo de atención) no está documentada en la información disponible. El entrenamiento se realizó sobre el dataset `dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture`, con 256 episodios y 54.376 fotogramas, usando dos cámaras y acciones objetivo a 5 Hz con pose relativa a la pose alcanzada actual y rotación en `rotation_6d`.

El pipeline congela explícitamente varios componentes: el backbone Video2World, el decoder inicial y un Video LoRA (`kuka-level2-no-source-stage-v1-video-iter200`), todos fijados por hash de commit. Esto implica que el decoder solo es coherente si se reproduce exactamente ese entorno congelado. La ejecución se detuvo en la iteración 1800 por una causa desconocida, aunque el autor verificó el conjunto completo de checkpoints (modelo, optimizador, scheduler y trainer) antes de subir los pesos. No se documentan técnicas como RLHF, DPO, decodificación especulativa ni atención lineal.

## Capacidades

- Predicción de acciones de efector final a 5 Hz a partir de observaciones de vídeo de dos cámaras.
- Salida de 15 dimensiones de acción: pose relativa del efector final más estado de la pinza.
- Representación de rotación mediante `rotation_6d`.
- Condicionamiento en pose relativa a la pose alcanzada actual (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool`.
- Integración como decoder dentro del ecosistema MimicVideo, requiriendo pesos congelados específicos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Reentrenamiento y ajuste fino del decoder: el checkpoint sirve como punto de partida para continuar el entrenamiento sobre el mismo dataset o variantes, manteniendo el contrato de datos y los pesos congelados fijados por commit.
- Reproducción de experimentos: permite replicar la iteración 1800 de la ejecución `w2a_kuka_iiwa14_level2_widowx_texture_2cam_hstack_no_source_stage_v1_bridge_videolora_iter200`, verificando resultados con el `config.yaml` y el JSON fijados en el repositorio.
- Evaluación de políticas de imitación en manipulación con dos cámaras: útil para comparar el rendimiento de un decoder basado en vídeo frente a políticas puramente visuales en tareas de alcance y agarre.
- Investigación en representaciones latentes de vídeo para control: al congelar el backbone y entrenar solo el decoder, permite aislar cuánta información accionable contiene la representación de vídeo.
- Base para transferencia a otros robots con contrato de acciones similar: si se adapta el marco de referencia y la dimensionalidad de acciones, puede servir como inicialización para brazos con pinza de dos dedos.
- Análisis de estabilidad de entrenamiento: al haberse detenido la ejecución por causa desconocida, el checkpoint es útil para estudiar curvas de pérdida y comportamiento en iteraciones tardías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1.0 GB, lo que sugiere que el checkpoint cabe en GPUs de consumo, pero no se especifica el tamaño del modelo ni de los pesos congelados necesarios.
- GPU recomendadas: no disponible. Al requerir el backbone Video2World y el Video LoRA congelados, el requisito real depende de esos componentes, no solo del decoder.
- Cabe en GPU de consumo: probablemente sí por el tamaño del repo (1.0 GB), pero no confirmado en la información proporcionada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo está pensado para ejecutarse dentro del código de MimicVideo con los commits fijados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (decoders World2Action sobre MimicVideo) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el repositorio antes de cualquier despliegue productivo.
- Dependencia estricta de pesos congelados: requiere commits concretos del backbone Video2World, del decoder inicial y del Video LoRA; cualquier desviación invalida el checkpoint.
- Entrenamiento interrumpido por causa desconocida (`unknown`): no hay garantía de que la iteración 1800 sea la óptima ni de que el entrenamiento haya convergido.
- Dataset y pesos congelados no incluidos en el repositorio: la reproducibilidad exige descargar por separado el dataset `vam-cross-level2-kuka-iiwa14-widowx-texture` y los artefactos referenciados.
- Especificidad de hardware robótico: el contrato de acciones (15 dimensiones, `rotation_6d`, marco `widowx_reference_base/teleop_aligned_tool`, 5 Hz) está atado a la configuración KUKA iiwa14 + WidowX; no es transferible sin reentrenamiento.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución: al ser un modelo de control, los fallos se manifiestan como acciones incorrectas o inseguras, no como texto; se recomienda validación en entorno simulado antes de ejecución real.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Ausencia de documentación sobre cuantización, latencia y formato de pesos: dificulta la planificación de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dreamdifferent/kuka-level2-no-source-stage-v1-video200-action1800
- Backbone Video2World inicial: https://huggingface.co/jonpai/mimic-video/tree/f28339034831e3c2374be075e622e1ff38ebe0f8
- Video LoRA congelado: https://huggingface.co/dreamdifferent/kuka-level2-no-source-stage-v1-video-iter200/tree/5e7b956d169482f17f428ea3cc6c98a693d67e2c
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture/tree/34e9c1742ff40ca3b60e06fc3ae92872c33248fe
- Commit de MimicVideo requerido: `e3355dbc93132b576c02f920a59b4fc18a4f5906` (repositorio de MimicVideo, sin URL directa en la información proporcionada)
