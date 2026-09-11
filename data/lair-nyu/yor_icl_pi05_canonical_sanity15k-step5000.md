# lair-nyu/yor_icl_pi05_canonical_sanity15k-step5000

## Resumen

`yor_icl_pi05_canonical_sanity15k-step5000` es un checkpoint intermedio (paso 5000 de un objetivo de 15000) de una política robótica entrenada con pi05 en JAX dentro del framework openpi. Lo publica el repositorio `lair-nyu` y corresponde al brazo 1 del plan de trabajo `notes/ICRA_plan.md`, una ejecución de saneamiento ("sanity run") sobre un subconjunto reducido del dataset `icl-dataset`: 196 episodios y 4 tareas. No es un modelo de lenguaje: es una política que mapea estado propioceptivo a acciones de efector final, sin entrada de imagen ni de lenguaje en esta configuración.

La observación es un vector de 18 dimensiones (9 por brazo: posición absoluta del efector final en 3 dimensiones más orientación rot6d en 6), derivada de `observation.left_ee`/`observation.right_ee` de `icl-dataset-fixed-obs` mediante cinemática directa desde los codificadores de articulación reales y convertida a rot6d con `quat_wxyz_to_rot6d`. La acción es un vector de 20 dimensiones (10 por brazo: posición delta del efector respecto al primer fotograma de la ventana de consulta, orientación rot6d absoluta y apertura de pinza).

Su relevancia es metodológica más que de rendimiento: sustituye los cuaterniones por rot6d para eliminar una inestabilidad de hemisferio detectada en el brazo anterior `yor_icl_pi05_aligned_deltarot6d_sanity15k`, que producía comandos de rotación erráticos desde el primer paso de control y un 0 % de tasa de éxito. Rot6d es invariante al hemisferio por construcción, de modo que la representación queda estructuralmente protegida frente a ese fallo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política pi05 (pi0.5) en JAX sobre openpi; detalles de composición interna no disponibles en la información proporcionada |
| Parametros totales | no disponible (el repositorio ocupa 12,4 GB y solo incluye `params/`, `assets/` y `_CHECKPOINT_METADATA`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se menciona una "ventana de consulta" para el cálculo de deltas, sin cifra publicada) |
| Tipos de cuantizacion | no disponible (se distribuyen parámetros JAX sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (la observación definida no incluye entrada de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint JAX/Orbax en `params/`; no safetensors ni GGUF. Incluye `assets/norm_stats.json` y `_CHECKPOINT_METADATA`; `train_state/` (estado del optimizador, ~19 GB) se omite |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia pi05 (pi0.5) tal como está implementada en openpi, entrenada en JAX. La model card no detalla la composición del backbone ni el número de tokens de entrenamiento; lo que sí especifica con precisión son los espacios de observación y acción. La observación es exclusivamente propioceptiva (18 dimensiones: 9 por brazo, posición 3 + rot6d 6), sin pinza, sin elevación ni base, y se construye a partir de las posiciones absolutas de efector final de `icl-dataset-fixed-obs`, obtenidas por cinemática directa desde los codificadores reales y convertidas a rot6d mediante `quat_wxyz_to_rot6d` (`openpi.policies.yor_rotation`). La acción tiene 20 dimensiones (10 por brazo: delta de posición 3 + rot6d absoluta 6 + pinza 1), también sin elevación ni base.

La innovación técnica destacable es la elección de representación de rotación. El brazo previo usaba un cuaternión crudo por brazo, pero la convención de hemisferio del dataset subyacente se resuelve por continuidad temporal a lo largo de cada episodio, no con una regla independiente por fotograma: `qw` es negativo en el 42 % de los fotogramas del dataset y cambia de signo a mitad de episodio en el 16 % de los episodios. La cinemática directa en un rollout en vivo no tiene esa memoria entre episodios, por lo que el modelo recibía un estado efectivamente fuera de distribución aproximadamente la mitad de las veces, con comandos de rotación gravemente incorrectos y 0 % de tasa de éxito. Como R(q) == R(-q) para cualquier construcción de matriz de rotación, rot6d es invariable al hemisferio y elimina ese modo de fallo por construcción. No se documentan en la información disponible fases de RLHF, DPO ni detalles del dataset de entrenamiento más allá del subconjunto de 196 episodios y 4 tareas.

## Capacidades

- Generación de acciones de control para manipulación bimanual: produce comandos de 20 dimensiones (delta de posición, orientación rot6d absoluta y apertura de pinza por brazo) a partir de estado propioceptivo de 18 dimensiones.
- Control relativo al inicio de la ventana: los deltas de posición se calculan respecto al primer fotograma de la propia ventana de consulta, lo que da cierta invariancia al punto de partida del rollout.
- Orientación estable: al usar rot6d, la salida de rotación es invariable a la convención de hemisferio del cuaternión de origen.
- Aprendizaje few-shot sobre tareas concretas: entrenado sobre 4 tareas y 196 episodios, orientado a sobreajuste controlado en un conjunto reducido.
- Carga como checkpoint openpi estándar mediante `openpi.training.weight_loaders.CheckpointWeightLoader` apuntando al snapshot local `.../params`.
- Normalización incluida: el repositorio aporta `assets/norm_stats.json`, necesario para reproducir la inferencia.
- Sin capacidades de visión, lenguaje, tool calling, agentes ni razonamiento multi-paso en esta configuración: la observación se define explícitamente como estado puro, "nada más".
- Sin soporte multilingüe ni modo de pensamiento: no son capacidades aplicables a esta política.

## Casos de uso

- Validación de la representación de rotación en políticas robóticas: sirve para reproducir experimentalmente el fallo de hemisferio de cuaterniones y comprobar que rot6d lo elimina, comparando contra el brazo `yor_icl_pi05_aligned_deltarot6d_sanity15k` (0 % de tasa de éxito).
- Saneamiento de pipelines de entrenamiento pi05/openpi: al ser un paso intermedio de una ejecución planificada de 15000 pasos, permite verificar que la carga de pesos, la normalización y el bucle de entrenamiento funcionan antes de escalar a la ejecución completa.
- Investigación en manipulación bimanual en laboratorio: política de control de efector final por brazo con orientación absoluta y delta de posición, utilizable en montajes de dos brazos donde solo se dispone de estado propioceptivo.
- Punto de partida para fine-tuning en dominios propios: al incluir solo `params/`, el checkpoint es un candidato directo para reentrenar sobre un dataset propio con los mismos espacios de 18 y 20 dimensiones.
- Pruebas de infraestructura de despliegue: permite ensayar el servidor de políticas de openpi y la carga con `CheckpointWeightLoader` sin depender del modelo final.
- Estudio de coste de escalado de datos: con 196 episodios y 4 tareas, sirve como referencia para estimar cuánto dato adicional hace falta antes de obtener políticas utilizables.
- Depuración de cinemática directa y convenciones de ejes: el contraste entre `qw` negativo en el 42 % de fotogramas y el cambio de signo intra-episodio en el 16 % documenta un problema real de conversión de cuaterniones a matrices, reutilizable en otras bases de datos robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la tasa de éxito del brazo anterior (0 %) como motivación del cambio de representación; no aporta métricas del checkpoint del paso 5000 ni comparaciones con otros modelos. Los resultados de búsqueda web proporcionados no contienen información sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos ocupan 12,4 GB en el repositorio; a ello hay que sumar activaciones y buffers de inferencia, por lo que el requisito real es superior a esa cifra, sin que la información proporcionada permita cuantificarlo.
- GPU recomendadas: no disponible en la información proporcionada. No se documentan pruebas en A100, H100, RTX 4090 ni otros aceleradores.
- Encaje en GPU de consumo: no confirmado. Dado el tamaño del checkpoint, una GPU de 24 GB (por ejemplo RTX 4090) es un candidato plausible, pero no hay validación publicada.
- Opciones de despliegue: carga mediante `openpi.training.weight_loaders.CheckpointWeightLoader` apuntando al snapshot local `.../params`, igual que cualquier otro checkpoint de openpi. No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que no aplican a un checkpoint JAX de política robótica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Espacio de estado | Espacio de accion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yor_icl_pi05_canonical_sanity15k-step5000 | Checkpoint pi05 (paso 5000/15000) | 18 dim (pos 3 + rot6d 6 por brazo) | 20 dim (delta pos 3 + rot6d 6 + pinza 1 por brazo) | No publicado | no disponible | Repositorio HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| yor_icl_pi05_aligned_deltarot6d_sanity15k (brazo anterior, citado en la model card) | Checkpoint pi05 | Cuaternión crudo por brazo | Delta + rot6d | 0 % de tasa de éxito en rollout, por inestabilidad de hemisferio | no disponible | Referenciado en la model card, sin URL en la información proporcionada |
| yor_icl_pi05_easy_pnp_v2_absolute_joint_sanity15k (citado como convención de referencia) | Checkpoint pi05 | Articulaciones absolutas | no disponible | No publicado | no disponible | Referenciado en la model card, sin URL en la información proporcionada |
| Modelo base pi05 de openpi | Política base del framework | no disponible | no disponible | No disponible en la información proporcionada | no disponible | Framework citado en la model card |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 5000 de un objetivo de 15000, con la ejecución todavía en curso (job 17333295). No debe tratarse como modelo final.
- Sin licencia declarada: al no especificarse licencia, no puede asumirse uso comercial ni redistribución. Requiere consulta previa con los autores.
- Entrenamiento muy reducido: 196 episodios y 4 tareas. La generalización a nuevas tareas, objetos o entornos es previsiblemente pobre.
- Sin percepción visual ni instrucciones en lenguaje: la observación es exclusivamente propioceptiva, lo que limita la política a tareas donde el estado del robot sea suficiente para decidir la acción.
- Específico de un montaje: espacios de 18 y 20 dimensiones atados a una configuración concreta de dos brazos, sin elevación ni base. Cambiar la morfología invalida el checkpoint.
- Historial de fallo en el linaje: el brazo predecesor obtuvo 0 % de tasa de éxito por el problema de hemisferio del cuaternión; aunque rot6d lo evita por construcción, no hay resultados publicados que confirmen el rendimiento del paso 5000.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la producción de comandos de acción plausibles pero físicamente inválidos fuera de la distribución de entrenamiento.
- Fechas de metadatos inusuales (creación y actualización el 2026-09-11): conviene verificar la vigencia del repositorio antes de integrarlo.
- Sin métricas de latencia ni de consumo: no es posible dimensionar un despliegue en producción con la información disponible.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_canonical_sanity15k-step5000
- openpi, framework citado en la model card (módulos `openpi.policies.yor_rotation` y `openpi.training.weight_loaders`): https://github.com/Physical-Intelligence/openpi
- Artefactos citados en la model card sin URL proporcionada: `yor_icl_pi05_aligned_deltarot6d_sanity15k`, `yor_icl_pi05_easy_pnp_v2_absolute_joint_sanity15k`, `icl-dataset`, `icl-dataset-fixed-obs`, `notes/ICRA_plan.md`.
- Los resultados de búsqueda web facilitados no contienen enlaces relevantes sobre este modelo (corresponden a páginas de producto de ChatGPT).
