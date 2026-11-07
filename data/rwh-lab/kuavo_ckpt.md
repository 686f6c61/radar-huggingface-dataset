# RwH-Lab/Kuavo_ckpt

## Resumen

RwH-Lab/Kuavo_ckpt es un repositorio de checkpoints de políticas robóticas para el robot humanoide Kuavo 5W, entrenadas mediante aprendizaje por imitación sobre un dataset privado (RwH-Lab/kuavo-dataset-skill). No se trata de un modelo de lenguaje, sino de un conjunto de políticas visomotoras (VLA, vision-language-action) orientadas al control de un robot físico. El repositorio lo mantiene RwH-Lab y publica checkpoints intermedios a medida que avanza el entrenamiento, por lo que su presencia no implica que el run completo de 20.000 actualizaciones haya finalizado.

El repositorio agrupa cuatro políticas distintas bajo el escenario de 50 demos: SmolVLA, MultiTask-DiT, Pi0.5 y GR00T N1.5. Cada una publica cuatro checkpoints (5K, 10K, 15K y 20K pasos). SmolVLA y Pi0.5 se distribuyen como adaptadores LoRA sobre modelos base de Hugging Face, mientras que GR00T y DiT contienen pesos completos de política. El tamaño del repositorio (150,8 GB) refleja la acumulación de estos checkpoints con sus artefactos de procedencia.

La relevancia del repositorio es acotada y experimental: está pensado para reproducir y auditar el entrenamiento de políticas de imitación sobre el robot Kuavo, no para uso en producción ni como modelo general. No se declaran resultados de éxito en simulador ni en robot real, y la licencia y los idiomas no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas VLA de imitación: SmolVLA, MultiTask-DiT, Pi0.5 y GR00T N1.5 (transformers visomotores; detalles por política no disponibles) |
| Parametros totales | no disponible (SmolVLA y Pi0.5 son adaptadores LoRA; GR00T y DiT contienen pesos completos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `pretrained_model/`, `checkpoint_manifest.json`, notas de carga y procedencia) |

## Arquitectura y entrenamiento

El repositorio contiene cuatro familias de políticas entrenadas con un contrato de entrenamiento común: 50 episodios originales, 7 tareas, remuestreo de 30 a 10 Hz, estado actual de 20 dimensiones y acción de 23 dimensiones (posición futura real del torso 4D, comandos registrados de brazo y pinza 16D, comandos registrados de velocidad de base 3D). El batch global es de 64 por política, semilla 42, 20.000 actualizaciones y sin split de validación; las muestras no cruzan fronteras entre tareas.

SmolVLA y Pi0.5 se publican como adaptadores LoRA, no como pesos base autónomos; sus IDs de modelo base de Hugging Face y revisiones fijadas se registran en `provenance/model_assets.json`. GR00T y DiT incluyen pesos completos de política. GR00T requiere un parche de compatibilidad incluido para preservar el texto de tarea por muestra, y tanto GR00T como DiT necesitan preprocesamiento letterbox de 224×224 que preserve la relación de aspecto. Cada checkpoint incluye manifiestos con el paso de origen, tamaño y SHA256 de cada fichero, y el estado de optimizador, scheduler y RNG se retiene en el servidor de entrenamiento.

## Capacidades

- Control visomotor para el robot humanoide Kuavo 5W mediante políticas de imitación.
- Ejecución de 7 tareas de habilidad entrenadas sobre 50 episodios demostrados.
- Generación de acciones de 23 dimensiones (torso, brazo, pinza y velocidad de base).
- Carga de adaptadores LoRA (SmolVLA, Pi0.5) sobre modelos base de Hugging Face con revisiones fijadas.
- Carga de pesos completos de política (GR00T N1.5, MultiTask-DiT).
- Verificación de integridad de checkpoints mediante manifiestos con SHA256 y compuertas de guardado.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Reproducción de entrenamiento de políticas de imitación: el repositorio permite reanudar o auditar el entrenamiento de las cuatro políticas con el contrato documentado (50 episodios, 7 tareas, 20k pasos) y comparar checkpoints intermedios.
- Investigación en adaptadores LoRA para robótica: SmolVLA y Pi0.5 se pueden cargar sobre sus modelos base fijados para estudiar el efecto del ajuste fino de bajo rango en tareas de manipulación.
- Evaluación comparativa de arquitecturas VLA: los cuatro checkpoints por política (5K, 10K, 15K, 20K) permiten analizar la evolución del aprendizaje y comparar SmolVLA, DiT, Pi0.5 y GR00T bajo el mismo dataset y semilla.
- Auditoría de procedencia y reproducibilidad: los manifiestos con SHA256, `provenance/CONTRACT.md` y `runtime_versions.json` permiten reconstruir el entorno exacto (commits de LeTools/LeRobot y versiones de paquetes) para replicar resultados.
- Desarrollo de pipelines de preprocesamiento robótico: la necesidad de letterbox 224×224 en GR00T y DiT y de procesadores guardados con sus estadísticas de normalización sirve como caso de estudio para pipelines de datos visomotores.
- Integración en flujos de entrenamiento con LeRobot: los checkpoints están formateados para cargarse con las herramientas de LeRobot, lo que facilita incorporarlos a experimentos propios de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las comprobaciones de entrenamiento offline no reclaman éxito en tareas en simulador ni en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de la política (SmolVLA y Pi0.5 son adaptadores LoRA sobre modelos base; GR00T y DiT son pesos completos) y del tamaño de los modelos base, que no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante LeRobot (commits y versiones fijados en `runtime_versions.json`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RwH-Lab/Kuavo_ckpt | no disponible | no disponible | sin benchmarks publicados | no disponible | público en Hugging Face (0 descargas) |
| LejuRobotics/LET-KUAVO-VLA-1.0-models | no disponible | no disponible | no disponible | no disponible (acceso con aprobación) | acceso restringido con solicitud |
| SmolVLA (modelo base referenciado) | no disponible | no disponible | no disponible | no disponible | referenciado como base de los adaptadores LoRA |
| GR00T N1.5 (modelo base referenciado) | no disponible | no disponible | no disponible | no disponible (requisitos de acceso upstream) | referenciado como base de los pesos completos |

## Limitaciones y advertencias

- No se declara ni se garantiza éxito en tareas en simulador o en robot real; solo se han realizado comprobaciones de entrenamiento offline.
- El dataset de entrenamiento es privado (RwH-Lab/kuavo-dataset-skill), lo que limita la reproducibilidad completa y la auditoría de sesgos.
- Solo 50 episodios y 7 tareas: cobertura estrecha y riesgo alto de sobreajuste; no hay split de validación.
- SmolVLA y Pi0.5 son adaptadores LoRA y no funcionan de forma autónoma sin sus modelos base y revisiones fijadas.
- GR00T requiere un parche de compatibilidad y, junto con DiT, preprocesamiento letterbox 224×224; un uso incorrecto invalida las políticas.
- Es obligatorio usar los procesadores guardados y sus estadísticas de normalización; omitirlos produce inferencias incorrectas.
- La licencia no está disponible, por lo que el uso comercial queda sin autorización explícita.
- Los checkpoints intermedios pueden estar incompletos; la presencia de un checkpoint temprano no implica que el run de 20k haya terminado.
- El estado de optimizador, scheduler y RNG no se publica, lo que impide reanudar el entrenamiento exactamente desde el repositorio.
- Los requisitos de acceso upstream de los modelos base (GR00T, Pi0.5, SmolVLA) siguen aplicando.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RwH-Lab/Kuavo_ckpt
- Modelo relacionado LET-KUAVO-VLA-1.0 (README): https://huggingface.co/LejuRobotics/LET-KUAVO-VLA-1.0-models/blob/main/README.md
- Modelo relacionado LET-KUAVO-VLA-1.0: https://huggingface.co/LejuRobotics/LET-KUAVO-VLA-1.0-models
