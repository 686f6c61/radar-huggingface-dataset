# junjie008/fastwam-v10-4-oracle-bbox-20261023

## Resumen

FastWAM V10.4 es un checkpoint de investigacion para control de acciones en robotica, desarrollado por el usuario junjie008 y publicado en Hugging Face. Se enmarca dentro del proyecto FastWAM (orientado a politicas de accion guiadas por video) y del benchmark RoboMME, y su proposito es evaluar el condicionamiento de la accion mediante cajas delimitadoras (bounding boxes) de la camara frontal actual, junto con senales GRASP, en tareas de manipulacion robótica de una sola tarea. El modelo parte del checkpoint original V6 de 60k pasos y ha sido afinado durante 2.000 pasos adicionales con la estrategia VideoUnmaskSwap.

La relevancia de esta publicacion es acotada y fundamentalmente experimental: se trata de un artefacto de investigacion con dos variantes (V10.4.1 y V10.4.2) que difieren en el mecanismo de condicionamiento espacial, no de un modelo listo para produccion. El repositorio es de gran tamano (368 GB) porque incluye los pesos completos del Video DiT congelado ademas del Action DiT entrenado, y no publica resultados de exito en rollout, sino unicamente perdidas de validacion offline con ruido fijo.

No se dispone de informacion sobre licencia, idiomas soportados ni arquitectura detallada mas alla de las referencias a Video DiT y Action DiT. La model card es explicita al senalar que las cifras reportadas no constituyen tasas de exito ni afirmaciones sobre seleccion de objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video DiT (congelado) + Action DiT (30 capas, entrenado); encoder de propiocepcion; rama directa de BBox |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint completo en directorios `step_002000` con `config.yaml`, estadisticas de normalizacion, `SHA256SUMS` y validacion offline |

## Arquitectura y entrenamiento

El modelo combina un Video DiT congelado (cuyos pesos se incluyen en el paquete) con un Action DiT de 30 capas que si se entrena, junto con el encoder de propiocepcion y una nueva rama de caja delimitadora directa. La variante V10.4.1 aplica un AdaLN de seis parametros sobre las 30 capas del Action DiT, condicionado por la BBox de la camara frontal actual y la senal GRASP. La variante V10.4.2 anade a lo anterior un sesgo de atencion espacial blando accion-a-camara-frontal-actual con fuerza 2.0. No se emplean Object Predictor, S2 ni Object EvidenceEncoder.

El entrenamiento se realizo sobre datos revisados de una sola tarea: 90 episodios de entrenamiento y 10 episodios reservados (held-out). Se uso un LR maximo de 1e-5 para la accion y 5e-5 para la nueva rama, batch global de 32, semilla 42, y se guardaron checkpoints y validacion offline cada 500 pasos. El codigo de entrenamiento corresponde al commit `6882af2dc067bcd97b419f22c718c3406c3567b5`, rama `codex/memory-v10-4-oracle-bbox`, en los repositorios `fastwam_edit` y `HyAM`. No se publica el estado del optimizador ni del RNG.

## Capacidades

- Control de acciones robóticas condicionado por caja delimitadora de la camara frontal actual y senal GRASP.
- Condicionamiento espacial adicional mediante sesgo de atencion blando (solo V10.4.2).
- Integracion de propiocepcion a traves de un encoder dedicado.
- Generacion/edicion de video como componente congelado del pipeline (Video DiT incluido en los pesos).
- Fallback explicito BASE para comandos no GRASP o no disponibles, que debe registrarse.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No se documentan capacidades multilingues ni modos de pensamiento.

## Casos de uso

- Investigacion en politicas de accion guiadas por video: el checkpoint permite reproducir y comparar las dos variantes de condicionamiento (AdaLN puro frente a AdaLN con sesgo de atencion espacial) sobre la misma tarea y los mismos datos, aislando el efecto del mecanismo espacial.
- Experimentos de condicionamiento por BBox en manipulacion: util para estudiar como la caja del objeto visible en la camara frontal modula la accion generada, con pruebas de sensibilidad a BBox trasladadas sinteticamente.
- Ablacion de ramas de entrenamiento: al estar congelado el Video DiT y entrenarse solo Action DiT, encoder de propiocepcion y rama BBox, sirve para medir la contribucion de cada componente sin reentrenar el modelo de video.
- Reproducibilidad de resultados offline: los paquetes incluyen estadisticas de normalizacion exactas, procedencia y sumas SHA256, lo que facilita la verificacion de integridad y la repeticion de la validacion con ruido fijo.
- Desarrollo de runtimes de despliegue: la exigencia de un runtime V10.4 direct-BBox (incompatible con el runtime V10.2 Predictor/Fact Evidence) lo convierte en banco de pruebas para adaptar el pipeline de inferencia.
- Estudio de fallback y robustez de comandos: el requisito de registrar un fallback BASE explicito para comandos no GRASP permite analizar el comportamiento del sistema ante entradas no cubiertas por el condicionamiento.

## Benchmarks y rendimiento

| Variante | Perdida Action FM en held-out (validacion offline, ruido fijo) |
|---|---|
| V10.4.1 | 0.0001446996 |
| V10.4.2 | 0.0001457113 |

Estas cifras son resultados de validacion offline con ruido fijo y pruebas de sensibilidad a BBox trasladadas sinteticamente. No son tasas de exito en rollout y no constituyen una afirmacion sobre seleccion de objetivo ni sobre exito en la tarea. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 368 GB e incluye los pesos completos del Video DiT y del Action DiT, por lo que el despliegue requiere almacenamiento y memoria considerables.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamano del checkpoint hace poco probable un despliegue en GPU de consumo sin cuantizacion, y no se documentan formatos cuantizados.
- Opciones de despliegue: requiere el runtime V10.4 direct-BBox; un runtime V10.2 Predictor/Fact Evidence es incompatible. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota operativa: las rutas de `config.yaml` apuntan al entorno de entrenamiento original y deben adaptarse para el despliegue; el adaptador Oracle en linea se esta verificando por separado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos de parametros, contexto, rendimiento o licencia que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de investigacion con una sola tarea y datos muy reducidos (90 episodios de entrenamiento, 10 held-out); no debe interpretarse como una politica generalizable.
- Las metricas publicadas son perdidas de validacion offline con ruido fijo, no tasas de exito en rollout; la model card renuncia explicitamente a cualquier afirmacion de exito en tarea o seleccion de objetivo.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Incompatibilidad de runtime: el despliegue exige el runtime V10.4 direct-BBox; el runtime V10.2 Predictor/Fact Evidence no es valido.
- El condicionamiento GRASP-only depende de la caja del objetivo visible actual; los comandos no GRASP o no disponibles requieren un fallback BASE explicito y registrado.
- No se publica el estado del optimizador ni del RNG, lo que limita la reproduccion exacta del entrenamiento.
- El adaptador Oracle en linea esta pendiente de verificacion independiente.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma; al no ser un modelo de lenguaje, estas categorias no aplican directamente, pero tampoco se ofrece informacion sobre robustez fuera de la distribucion de entrenamiento.
- El gran tamano del repositorio (368 GB) y la inclusion de pesos congelados imponen requisitos de almacenamiento y transferencia significativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junjie008/fastwam-v10-4-oracle-bbox-20261023
- Repositorio de codigo de entrenamiento `fastwam_edit`: https://github.com/Astexia-xuan/fastwam_edit
- Repositorio de codigo de entrenamiento `HyAM`: https://github.com/sgres-paw/HyAM
- Checkpoint V10.4.1 (2k): https://huggingface.co/junjie008/fastwam-v10-4-oracle-bbox-20261023/tree/main/v10.4.1/step_002000
- Checkpoint V10.4.2 (2k): https://huggingface.co/junjie008/fastwam-v10-4-oracle-bbox-20261023/tree/main/v10.4.2/step_002000
