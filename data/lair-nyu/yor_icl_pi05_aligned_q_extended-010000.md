# lair-nyu/yor_icl_pi05_aligned_q_extended-010000

## Resumen

`yor_icl_pi05_aligned_q_extended-010000` es un checkpoint intermedio de una política robótica de tipo VLA (vision-language-action) entrenada por el grupo lair-nyu sobre el backbone pi0.5 mediante el framework openpi de Physical Intelligence. No es un modelo de lenguaje: su salida son acciones de control de 14 dimensiones (`action.q_target`) condicionadas por un estado de propriocepción de 15 dimensiones (`observation.state`: articulaciones de brazo izquierdo y derecho más elevación). El checkpoint corresponde al paso 10.000 de un objetivo de 50.000 pasos, con batch 256 sobre 4 GPU H200, por lo que se trata de un artefacto de investigación en curso y no de una versión final.

Su relevancia radica en la construcción del par acción/propriocepción: a diferencia de las ramas anteriores `*_absolute_joint`, que reutilizaban la ventana futura de `observation.state` como pseudo-acción, este modelo usa `action.q_target`, una reconstrucción IK real de `action.left_ee`/`action.right_ee` grabada y anclada por episodio al FK del propio `observation.state`. Esto lo convierte en una referencia útil para estudiar el alineamiento entre el espacio de acciones y el espacio de propriocepción en aprendizaje por imitación.

El modelo escala el experimento previo `yor_icl_pi05_aligned_q_sanity15k` al conjunto expandido completo de 31 tareas y 1.784 episodios, y se distribuye únicamente con los pesos desplegables (`params/`) y las estadísticas de normalización (`assets/`), sin el estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA basada en el backbone pi0.5 (openpi); detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | no disponible |
| Formato de pesos | pesos en el directorio `params/` y estadísticas en `assets/`; formato de fichero concreto no disponible. Tamano del repo: 12,4 GB |
| Dimension de observacion (`observation.state`) | 15 (articulaciones de brazo izquierdo y derecho + elevación) |
| Dimension de accion (`action.q_target`) | 14 |
| Paso del checkpoint | 10.000 de 50.000 (entrenamiento en curso) |
| Configuracion de entrenamiento (openpi TrainConfig) | `yor_icl_pi05_aligned_q_extended` |

## Arquitectura y entrenamiento

La model card indica que se usa el backbone pi0.5 dentro de openpi, el framework de Physical Intelligence, pero no detalla la arquitectura interna, el número de parámetros ni el mecanismo de generación de acciones. Lo que sí se especifica es la interfaz del problema: entrada de estado de 15 dimensiones y salida de acción de 14 dimensiones, correspondiente a `action.q_target`. El checkpoint se distribuye como pesos desplegables más estadísticas de normalización, sin estado del optimizador, de modo que no permite reanudar exactamente la ejecución original.

El entrenamiento se realizó sobre `Hannibal52Barca/icl-dataset-fixed-action` (y también sobre `icl-dataset`, según la model card), con un conjunto expandido de 31 tareas y 1.784 episodios, batch de 256 y 4 GPU H200, con un objetivo de 50.000 pasos. La innovación destacable no está en la arquitectura sino en los datos: la columna de acción es una reconstrucción IK real de las posiciones de efector final, anclada por episodio al forward kinematics del propio `observation.state`, lo que garantiza que acción y propriocepción comparten un mismo espacio coherente. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Generación de acciones de control continuo de 14 dimensiones a partir de observaciones y estado de propriocepción de 15 dimensiones.
- Ejecución de políticas multi-tarea: el conjunto de entrenamiento cubre 31 tareas distintas.
- Control bimanual: el estado incluye articulaciones de brazo izquierdo y derecho, además de un eje de elevación (`lift`).
- Aprendizaje por imitación a partir de episodios reales con acciones reconstruidas por cinemática inversa.
- Capacidad de ser usado como punto de partida para nuevos ajustes finos sobre los pesos de `params/`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): la información disponible no especifica la composición exacta de las observaciones de entrada ni si incluye imágenes; no disponible.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar cómo afecta la calidad del etiquetado de acciones (pseudo-acción frente a `q_target` reconstruido por IK) al rendimiento de una política VLA.
- Reentrenamiento y ajuste fino en laboratorio: los pesos de `params/` pueden cargarse en openpi para continuar el entrenamiento o adaptarlos a un nuevo conjunto de tareas robóticas, teniendo en cuenta que no se incluye `train_state/` y por tanto no se puede reanudar el run original.
- Comparación de checkpoints intermedios: al ser el paso 10.000 de 50.000, permite medir la curva de aprendizaje del régimen extendido frente al run `sanity15k`.
- Control de plataformas bimanuales con elevación: el espacio de estado (articulaciones de ambos brazos más `lift`) encaja con robots de manipulación con columna o eje vertical, útil para prototipos de pick-and-place en laboratorio.
- Validación de pipelines de datos robóticos: sirve para verificar que la alineación entre `observation.state` y `action.q_target` es consistente antes de escalar a conjuntos mayores.
- Docencia y reproducibilidad en robótica: permite ilustrar el flujo completo de openpi, desde la normalización en `assets/` hasta el despliegue de una política entrenada, en un entorno académico controlado.
- Evaluación interna antes de producción: útil como referencia en pruebas de regresión de infraestructura de inferencia robótica, nunca como política de producción dado que el entrenamiento sigue en curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otros checkpoints. Los resultados de búsqueda web obtenidos no contienen información relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 12,4 GB, por lo que, en la precisión almacenada, los pesos requerirían aproximadamente ese orden de memoria más el margen para activaciones y buffer de observaciones; debe tomarse como estimación orientativa basada en el tamaño del repo, no como dato confirmado.
- GPU recomendadas para entrenamiento: 4xH200, según la model card (batch 256, objetivo de 50.000 pasos).
- GPU recomendadas para inferencia: no disponible. Por tamaño, una GPU con 24 GB o más (RTX 4090, L40S, A100) sería el punto de partida razonable, sujeto a verificación.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 24 GB de VRAM como la RTX 4090, aunque no hay confirmación en la información proporcionada.
- Opciones de despliegue: el modelo está entrenado con openpi (`Physical-Intelligence/openpi`), por lo que el despliegue natural es el runtime de openpi. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y estas herramientas no son aplicables a una política de acción continua.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entorno | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yor_icl_pi05_aligned_q_extended-010000` | no disponible | Estado de 15 dim, acción de 14 dim, 31 tareas | no disponible | no disponible | Pesos en HuggingFace (`params/` + `assets/`) |
| `yor_icl_pi05_aligned_q_sanity15k` (mismo autor) | no disponible | Conjunto reducido previo | no disponible | no disponible | Pesos en HuggingFace |
| Backbone pi0.5 (openpi, Physical Intelligence) | no disponible | No disponible | no disponible | no disponible | Repositorio openpi |
| Otros modelos VLA de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web realizada no devolvió resultados relevantes, por lo que no se dispone de cifras verificables para una comparación cuantitativa. La comparación más significativa disponible es interna: este checkpoint es la escala del run `sanity15k` al conjunto completo de 31 tareas y 1.784 episodios.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 10.000 de 50.000. El autor indica explícitamente que no es final y que será sustituido por una subida `_full` al completarse el entrenamiento.
- Sin estado del optimizador: no se incluye `train_state/`, por lo que no es posible reanudar exactamente el run original; solo se puede partir de los pesos para un ajuste nuevo.
- Licencia no especificada: no hay información sobre condiciones de uso comercial, lo que impide asumir permisos de explotación.
- Ausencia de benchmarks: no hay tasas de éxito, métricas de error ni evaluaciones comparativas publicadas.
- Sesgos conocidos: no disponibles. Al entrenarse sobre un conjunto concreto de 31 tareas y 1.784 episodios, cabe esperar un sesgo de dominio hacia esas tareas y esa plataforma robótica concreta, aunque no se cuantifica en la información disponible.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de generalización incorrecta de acciones fuera de la distribución de entrenamiento del conjunto ICL.
- Limitaciones de contexto e idioma: no aplica el concepto de contexto textual; el modelo opera sobre observaciones y estados, y no se documentan capacidades lingüísticas.
- Caveat de producción: el artefacto está pensado para investigación; su uso en entornos reales sin validación previa y sin licencia clara no está recomendado.
- Trazabilidad de datos: el modelo depende del conjunto `Hannibal52Barca/icl-dataset-fixed-action` y de la validez de la reconstrucción IK descrita; cualquier error en ese etiquetado se propaga a la política.
- Resultados de búsqueda no concluyentes: las consultas web devolvieron páginas sin relación con el modelo (empresas de remolques, inmobiliarias y una web de ROMs), por lo que no aportan información adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_aligned_q_extended-010000
- Checkpoint previo del mismo autor: https://huggingface.co/lair-nyu/yor_icl_pi05_aligned_q_sanity15k
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Hannibal52Barca/icl-dataset-fixed-action
- Framework openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Resultados de búsqueda web: sin enlaces relevantes al modelo; los resultados obtenidos corresponden a sitios no relacionados (lair-remorques.fr, lair-immobilier.com, vimm.net).
