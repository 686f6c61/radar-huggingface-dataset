# Donghyun1228/pi05-libero-source-free-task-retention-lora01-view-large-relation-1000-20261012

## Resumen

Este repositorio contiene una adaptación mediante LoRA de una política viso-lenguaje-acción (VLA) de la familia openpi / pi05, orientada al benchmark de manipulación robótica LIBERO. Lo publica el usuario Donghyun1228 bajo el identificador `pi05-libero-source-free-task-retention-lora01-view-large-relation-1000-20261012` y su objetivo declarado es explorar la retención de conocimiento de tareas tras un ajuste únicamente sobre el dominio destino ("target-only adaptation"), sin utilizar observaciones del dominio origen.

El método combina un estudiante congelado con un profesor de prefijo de origen fijo y una pérdida auxiliar de "prompt-Gram" normalizada, aplicada sobre el primer flujo del modelo. El entrenamiento consistió en 1000 actualizaciones "source-fresh" (Raw999). El propio autor califica el resultado de exploratorio y advierte de que su interpretación como retención de conocimiento de tareas no está establecida.

La relevancia es acotada y de carácter investigador: es un artefacto de experimentación sobre adaptación de políticas robóticas, no un modelo de propósito general. No se publica tasa de éxito, no se declara licencia y el repositorio (6,9 GB) incluye todos los pesos de despliegue junto con los activos de normalización necesarios para reproducir la inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; la librería `openpi` y la configuración de despliegue `pi05_libero_source_free_split_vision_action_lora_idm` indican una política VLA de la familia pi05 con adaptadores LoRA en visión y acción |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (el autor indica que el despliegue usa el cargador de política BF16 existente); no se documentan otros formatos |
| Idiomas soportados | no disponible; las entradas de lenguaje son prompts de tarea del benchmark LIBERO |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio de 6,9 GB incluye "todos los pesos de despliegue" y activos de normalización, pero no se especifica el contenedor (safetensors, GGUF u otro) |
| Fecha de creacion / actualizacion | 2026-10-11 / 2026-10-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor describe una adaptación "target-only" con un proxy auxiliar de flujo. El estudiante (referido como "student28") y el profesor de prefijo de origen permanecen congelados y se verifican sin cambios. Solo se entrenan dos componentes: `vision23` y `actionLoRA10`. En este piloto únicamente se entrenó la vista `view_large`. Las actualizaciones de acción posteriores al optimizador Adam usan un multiplicador de 0,1.

El procedimiento combina un IDM nativo con lote B32 y semilla 42 junto con un lote de política de destino B4 con tres prompts de tarea por fotograma. La pérdida auxiliar de Gram de prompt normalizada tiene un peso de 0,001, la semilla del RNG de política es 170012 y se emplea un profesor de prefijo de origen fijo. No se utilizaron observaciones del origen, rollouts de tareas exitosas, entrenamiento con retroalimentación de éxito, caché de profesor emparejado ni corrección de acción ajustada.

El despliegue restaura la muñeca de origen (`wrist23`) y las 84 hojas crudas con los activos de normalización, a través del cargador de política BF16 existente. Se indica el uso de la inferencia con commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`, la configuración `pi05_libero_source_free_split_vision_action_lora_idm` y el wrapper "strict84" suministrado, manteniendo MuJoCo 3.2.3. El autor señala que el origen no tiene una referencia pública de repositorio verificada de forma independiente.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales y un prompt de tarea en lenguaje natural, en el entorno del benchmark LIBERO.
- Adaptación de política al dominio destino sin acceso a observaciones del dominio origen (planteamiento "source-free").
- Aprendizaje de adaptadores LoRA restringidos a los módulos de visión (`vision23`) y acción (`actionLoRA10`), manteniendo congelado el resto del modelo.
- Verificación de invariabilidad del estudiante y del profesor congelados durante el entrenamiento.
- Uso de un proxy auxiliar de flujo (pérdida de Gram de prompt normalizada) como señal de regularización durante el ajuste.
- Inferencia restringida al pipeline definido por el wrapper strict84 y a los activos de normalización restaurados.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio, modo "thinking" ni generación de texto libre.
- El soporte multilingüe no está documentado.

## Casos de uso

- Investigación en aprendizaje continuo y olvido catastrófico: el modelo sirve como punto de partida para estudiar si una política puede adaptarse a un dominio destino sin perder competencia en tareas previas, empleando el profesor de prefijo congelado como referencia de control.
- Evaluación de adaptadores LoRA en políticas VLA: permite medir el efecto de entrenar únicamente visión y acción (23 y 10 módulos respectivamente) frente a un ajuste completo, con un coste de entrenamiento mucho menor.
- Reproducción de experimentos en LIBERO: el repositorio incluye los pesos y los activos de normalización necesarios para reproducir la inferencia con MuJoCo 3.2.3 y la configuración indicada.
- Estudio de destilación con profesor congelado: la combinación de estudiante congelado más profesor de prefijo fijo es un montaje reutilizable para experimentos de regularización por destilación en políticas de acción.
- Plataforma para probar proxies auxiliares de flujo: la pérdida de Gram de prompt con peso 0,001 puede sustituirse o recalibrarse para comparar señales auxiliares alternativas en el primer flujo del modelo.
- Punto de partida para ajuste específico de tarea o robot: el enfoque "target-only" es aplicable cuando no se dispone de datos del dominio origen por restricciones de privacidad o de acceso.
- Integración en pipelines de evaluación robótica automatizada: el wrapper strict84 y la configuración fija permiten ejecutar evaluaciones repetibles en simulación, siempre que se asuman las limitaciones de licencia y de validación del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta publicación inicial no reporta tasa de éxito de la política ni ninguna afirmación de retención, y que la interpretación del proxy de primer flujo como retención de conocimiento de tareas no está establecida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del tamaño del repositorio (6,9 GB), una carga completa en BF16 ocuparía del orden de 7 GB solo en pesos, a lo que habría que añadir activaciones, búferes de visión y los activos de normalización incluidos en el mismo repositorio.
- GPU recomendadas: no se especifica ninguna en la información disponible.
- Viabilidad en GPU de consumo: no confirmada. Por el tamaño del artefacto, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) sería la candidata más plausible para inferencia, pero esto es una estimación a partir del tamaño del repositorio y no un requisito declarado por el autor.
- Opciones de despliegue: cargador de política BF16 de `openpi`, con la inferencia en el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` y la configuración `pi05_libero_source_free_split_vision_action_lora_idm`. Se requiere el wrapper strict84 y MuJoCo 3.2.3 para el entorno de simulación. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de métricas publicadas de este modelo que permitan una comparación numérica directa. La tabla recoge únicamente el encuadre de familia y disponibilidad, marcando como no disponible cualquier dato no confirmado.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-source-free-task-retention-lora01 (este repositorio) | Política VLA con LoRA sobre visión y acción | no disponible | no disponible | no disponible | Pesos incluidos en HuggingFace; sin tasa de éxito publicada |
| Política base de la familia pi05 / openpi | Política VLA | no disponible | no disponible | no disponible | Referencia pública del origen no verificada según el autor |
| Alternativas de política robótica (por ejemplo, otras VLA de manipulación) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Artefacto exploratorio: el propio autor declara que la interpretación del proxy de primer flujo como retención de conocimiento de tareas no está establecida.
- Sin métricas de éxito: no se reporta tasa de éxito de la política en ninguna tarea de LIBERO, por lo que no hay evidencia cuantitativa de utilidad funcional.
- Piloto parcial: solo se entrenó la vista `view_large`; no se exploraron otras vistas ni configuraciones.
- Restricciones del montaje experimental: no se usaron observaciones del origen, rollouts exitosos, entrenamiento con retroalimentación de éxito, caché de profesor emparejado ni corrección de acción ajustada, lo que limita el alcance de las conclusiones.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial y la redistribución quedan en un estado jurídico indeterminado; conviene tratar el artefacto como no apto para producción hasta que se aclare.
- Idiomas no documentados: no hay información sobre el comportamiento del modelo ante prompts en castellano ni en otros idiomas distintos de los del benchmark.
- Dependencia estricta del entorno: el despliegue exige el wrapper strict84, la configuración concreta, el commit de inferencia indicado y MuJoCo 3.2.3, lo que reduce la portabilidad.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de comportamiento fuera de distribución en observaciones o tareas distintas de las del ajuste.
- Sesgos: no disponible; no se documenta ningún análisis de sesgo en la información proporcionada.
- Advertencia de producción: al no existir validación independiente ni repositorio de origen verificado, no se recomienda su uso en sistemas robóticos reales sin una evaluación propia exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-source-free-task-retention-lora01-view-large-relation-1000-20261012
- Commit de inferencia indicado por el autor: `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`
- Configuración de despliegue: `pi05_libero_source_free_split_vision_action_lora_idm` (wrapper strict84)
- Repositorio de origen: no disponible; el autor indica que no existe una referencia pública verificada de forma independiente
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada
