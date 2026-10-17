# Gawtam/flux3-chess-lora-ownstats

## Resumen

flux3-chess-lora-ownstats es un adaptador LoRA de PEFT para la política robótica FLUX 3 Action SO-101, desarrollado por Gawtam. No es un modelo de lenguaje: su finalidad es reproducir un movimiento de ajedrez concreto, caballo de c3 a d5, con un brazo SO-101. El adaptador se entrenó con la receta de LeRobot sobre un dataset específico y se publica junto con checkpoints brutos y EMA.

El repositorio ocupa 0,9 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y la raíz corresponde al step 125. Su interés es técnico: documenta un flujo completo de ajuste fino LoRA para robótica, incluye métricas offline por articulación y evidencia una normalización con estadísticas propias del dataset. La licencia no está declarada y el uso queda sujeto a la licencia de los modelos base FLUX 3 Action.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política robótica FLUX 3 Action SO-101 con adaptadores LoRA (PEFT); no se detalla la topología interna completa en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de acción de 42 pasos, de los que se evalúan los 32 primeros |
| Tipos de cuantización | no disponible; el adaptador se distribuye en safetensors sin cuantización declarada |
| Idiomas soportados | no aplica; no es un modelo de lenguaje |
| Licencia | no disponible; el uso está sujeto a la licencia de los modelos base FLUX 3 Action |
| Formato de pesos | safetensors (PEFT LoRA); carpetas separadas para pesos brutos y EMA |
| Tipo de adaptador | LoRA |
| Modelo base | black-forest-labs/flux-3-action-so101, commit c9e13b2aca6a0a472b3ea03fd90cff32d3e85849 |
| Encoders | black-forest-labs/flux-3-action-base, commit 62878e2925e59b7a89ec14463ce89932624c490d |
| Dataset | niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741, commit 9b6b38719ab08509bdf4ce169a4de028573199de |
| Entrenamiento | 125 pasos, batch 8 por GPU, acumulación 1, 1×H100, semilla 42 |
| Checkpoints | raíz = step 125; `checkpoints/<step>/pretrained_model/` y `pretrained_model_ema/` |
| Tamaño del repo | 0,9 GB |
| Descargas / likes | 0 / 0 |
| Pipeline | robotics |
| Librería | peft |

## Arquitectura y entrenamiento

El adaptador no introduce una arquitectura nueva: son matrices LoRA sobre la política base FLUX 3 Action SO-101. La model card indica que el entrenamiento utiliza la pérdida de flow matching de LeRobot y que el modelo base emplea un VAE de vídeo y un codificador de texto. No se especifica la topología interna completa de la política base, por lo que no puede confirmarse si es transformer, MoE, híbrida u otra.

Se entrenó sobre el dataset `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741` con 125 pasos, batch 8 por GPU, una H100 y semilla 42. Se reservaron los episodios 24-30 para evaluación. La raíz contiene el step 125 con pesos EMA; también se publican checkpoints brutos y EMA. La normalización usa estadísticas propias calculadas con los episodios 0-23, no las del checkpoint publicado, por lo que deben cargarse los procesadores desde este repositorio. No se subió el estado del optimizador.

## Capacidades

- Ejecuta una política de imitación para un movimiento de ajedrez concreto: caballo de c3 a d5 con un brazo SO-101.
- Genera comandos para las cinco articulaciones del brazo y para la pinza.
- Trabaja con ventanas de acción de 42 pasos; la evaluación teacher-forced compara los primeros 32 pasos ejecutados.
- Incluye pesos brutos y EMA, con la raíz en el step 125.
- Se carga mediante PEFT y LeRobot con `Flux3Policy`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan capacidades de visión general, audio ni interacción conversacional.

## Casos de uso

- Reproducción del movimiento c3→d5: cargar los procesadores de este repositorio y la política `Flux3Policy` para ejecutar el adaptador en el mismo montaje del dataset; es adecuado para validar que la normalización y las articulaciones coinciden.
- Evaluación offline de ajuste fino: usar el MAE teacher-forced por articulación para comparar recetas LoRA y checkpoints sin necesidad de ejecutar el robot; permite medir mejoras frente al modelo base.
- Diagnóstico de normalización: al usar estadísticas propias, sirve para comprobar cómo cambia el error frente al checkpoint base cuando la pose de reposo se normaliza de forma distinta; útil para depurar pipelines de datos.
- Análisis de errores por articulación: la tabla por joint muestra que `shoulder_lift` y `elbow_flex` concentran el error; puede usarse para priorizar recogida de datos o ajustes de control.
- Punto de partida para nuevos movimientos: con un dataset propio y la receta de LeRobot, el adaptador puede servir como inicialización para otros movimientos; no se garantiza transferencia sin reentrenamiento.
- Docencia y demostración de PEFT en robótica: ejemplo mínimo de carga con `PeftModel` y `Flux3Policy`, útil en talleres sobre ajuste fino de políticas robóticas.
- Integración en pipelines de investigación: checkpoints brutos y EMA, semilla y episodios reservados documentados; facilita la reproducibilidad de experimentos.

## Benchmarks y rendimiento

| Modelo / checkpoint | Eval loss (raw) | MAE brazo ° (EMA) | MAE pinza % (EMA) | Carpeta |
|---|---:|---:|---:|---|
| step 125 | 0,1448 | 6,32 | 2,60 | `checkpoints/000125/` y raíz |
| FLUX 3 Action SO-101 base | no disponible | 12,49 | 5,82 | `black-forest-labs/flux-3-action-so101` |

| Articulación | Base SO-101 | Step 125 |
|---|---:|---:|
| shoulder_pan | 10,70 | 2,49 |
| shoulder_lift | 14,92 | 12,26 |
| elbow_flex | 16,14 | 10,63 |
| wrist_flex | 12,91 | 4,48 |
| wrist_roll | 7,77 | 1,72 |
| gripper | 5,82 | 2,60 |

El eval loss está en unidades normalizadas y no es comparable con ejecuciones que usan las estadísticas del checkpoint publicado; la comparación debe hacerse mediante el MAE offline en grados. No se han publicado resultados de MMLU, HumanEval ni GSM8K, y no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador LoRA ocupa 0,9 GB, pero requiere cargar el modelo base FLUX 3 Action SO-101 y los encoders.
- GPU recomendadas: no disponible. El entrenamiento documentado utilizó 1×H100.
- ¿Cabe en GPU de consumo? no disponible; no se documentan pruebas en RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: PEFT y LeRobot con `Flux3Policy`, sobre PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para esta política robótica.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 0,9 GB; el modelo base y los encoders añaden espacio adicional no cuantificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de acción | MAE brazo ° | MAE pinza % | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| FLUX 3 Action SO-101 base | no disponible | no disponible | 12,49 | 5,82 | no disponible; sujeta a FLUX 3 Action | HuggingFace |
| flux3-chess-lora-ownstats (step 125) | no disponible | 42 pasos, 32 evaluados | 6,32 | 2,60 | no disponible; sujeta a FLUX 3 Action | HuggingFace |

Los valores de MAE del modelo base corresponden a la evaluación del autor sobre los mismos episodios reservados. No se han identificado en la información proporcionada otros adaptadores LoRA comparables para FLUX 3 Action SO-101.

## Limitaciones y advertencias

- Alcance funcional mínimo: está entrenado para un único movimiento, caballo c3→d5; no se documenta generalización a otras casillas, piezas o tareas.
- Dataset único y reducido: 125 pasos y 7 episodios reservados (24-30); las métricas tienen una cobertura estadística limitada.
- Eval loss en unidades normalizadas: no es comparable con ejecuciones que usan las estadísticas del checkpoint; debe compararse mediante MAE offline.
- Normalización dependiente del repositorio: si se cargan procesadores de otro checkpoint, la pose de reposo cambia y el error puede aumentar; hay que cargar los procesadores desde este repo.
- Licencia no declarada: el uso comercial es incierto; debe revisarse la licencia de FLUX 3 Action SO-101 y de los encoders.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes, multilingüismo ni razonamiento multi-paso.
- Riesgo de acciones fuera de distribución: no se documenta una capa de seguridad; debe validarse en un entorno controlado antes de cualquier uso físico.
- No se documentan sesgos conocidos; el dataset refleja un montaje y una convención de articulaciones concretos.
- No se incluye el estado del optimizador y el repositorio tiene 0 descargas y 0 likes; no hay validación externa ni garantía de mantenimiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Gawtam/flux3-chess-lora-ownstats)
- [Modelo base FLUX 3 Action SO-101](https://huggingface.co/black-forest-labs/flux-3-action-so101)
- [Encoders FLUX 3 Action base](https://huggingface.co/black-forest-labs/flux-3-action-base)
- [Dataset de entrenamiento](https://huggingface.co/niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741)
- Receta de LeRobot: `examples/flux3/lora.json` (sin URL en la información proporcionada)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.
