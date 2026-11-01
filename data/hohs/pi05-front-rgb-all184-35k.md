# hohs/pi05-front-rgb-all184-35k

## Resumen

Pi0.5 fixed-front RGB + wrist RGB es un checkpoint de política robótica (vision-language-action, VLA) derivado de Pi0.5 DROID, publicado por el usuario hohs en Hugging Face. Se trata de un baseline "Real-FR3" entrenado sobre 184 episodios (100 de tipo plate, 64 move y 20 find, un total de 60.806 fotogramas) durante 35.000 actualizaciones, con batch de 32 y horizonte de acción de 16 pasos. El modelo recibe RGB de muñeca en vivo y una única renderización RGB frontal procedente de una reconstrucción preflight fija, sin usar XYZ, profundidad ni características semánticas en la entrada de la política.

La relevancia de este checkpoint es acotada: es un snapshot intermedio (35k de un entrenamiento que continúa hacia 50k) y el propio autor advierte de que no es un ganador en pruebas con robot real retenidas. No se ha medido rendimiento físico en robot para esta release. Su interés es principalmente de reproducibilidad e investigación: el autor documenta hashes de ficheros, linaje de entrenamiento y alcance de verificación en `RELEASE.json`, y exige un cargador de inferencia concreto, normalización nativa y decodificación de acciones específicas.

No se dispone de información sobre arquitectura interna más allá de la referencia a Pi0.5 DROID, ni de número de parámetros, contexto o idiomas. El repositorio ocupa 12,4 GB, lo que es coherente con un modelo VLA de tamaño medio-grande en precisión completa, pero el dato exacto de parámetros no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Pi0.5 DROID, política VLA) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los pesos conservan las condiciones de licencia upstream de Pi0.5) |
| Formato de pesos | no disponible (repo de 12,4 GB; se menciona `RELEASE.json` con hashes) |

## Arquitectura y entrenamiento

El checkpoint se describe como un baseline "Real-FR3" sobre la arquitectura nativa Pi0.5 DROID. La política consume dos entradas visuales: RGB de muñeca en tiempo real y una renderización RGB frontal fija obtenida de una reconstrucción preflight, que permanece constante durante todo el episodio. Se usan las ranuras de imagen nativas del modelo, con la tercera enmascarada. No hay XYZ, profundidad ni características semánticas en la entrada de la política; el renderizador preflight dedicado solo necesita puntos y colores, sin banco de características dino.txt.

El entrenamiento se realizó sobre 184 episodios (100 plate, 64 move, 20 find; 60.806 fotogramas) con batch de 32 y horizonte de acción de 16, durante 35.000 actualizaciones. Las memorias de entrenamiento incluyen observaciones iniciales de cámara externa como pseudo-ground-truth; no se usan imágenes externas en vivo ni profundidad en tiempo de política. El autor indica que el entrenamiento continúa por separado hacia 50k actualizaciones. No se detalla composición del dataset más allá del recuento de episodios, ni si hubo RLHF/DPO u otras fases de ajuste.

## Capacidades

- Control robótico visomotor: genera acciones a partir de RGB de muñeca y una vista frontal fija, con horizonte de acción de 16 pasos.
- Ejecución de tareas manipulativas en tres categorías documentadas: plate, move y find.
- Inferencia verificada: el checkpoint pasó carga estricta de modelo completo, paridad exacta de entradas entre entrenamiento y despliegue, e inferencia finita sobre seis observaciones plate/move/find.
- Integración con un cargador de inferencia específico, normalización nativa y decodificación de acciones propias del proyecto metric-depth-vla.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en VLA con vista frontal fija: permite estudiar el efecto de sustituir observaciones de cámara externa en vivo por una renderización preflight constante, aislando la contribución de la vista de muñeca.
- Reproducción de baselines: sirve como referencia "Real-FR3" para comparar variantes posteriores (por ejemplo, el snapshot de 50k) bajo el mismo protocolo de 184 episodios.
- Evaluación de paridad entrenamiento-despliegue: útil para validar pipelines de inferencia que exigen normalización nativa y decodificación de acciones idénticas a las del entrenamiento.
- Desarrollo de renderizadores preflight ligeros: el modelo solo requiere puntos y colores, sin banco de características dino.txt, lo que simplifica la cadena de percepción en prototipos.
- Pruebas de carga y verificación de checkpoints: el `RELEASE.json` con hashes y alcance de verificación facilita auditorías de integridad en entornos de laboratorio.
- Experimentos de manipulación en entornos simulados o de banco de pruebas: las tareas plate, move y find pueden reproducirse en configuraciones controladas antes de cualquier despliegue físico, dado que no hay mediciones en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta verificación cualitativa: carga estricta del modelo completo, paridad exacta de entradas entrenamiento/despliegue e inferencia finita en seis observaciones. No hay métricas de éxito en robot físico para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior orientativa para pesos en el formato almacenado, pero se desconoce el formato y si requiere precisión completa.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: cargador de inferencia del proyecto metric-depth-vla, invocado con `--variant pi05-front-rgb-all184-35k`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-front-rgb-all184-35k (este) | no disponible | no disponible | sin benchmarks; verificación de inferencia finita en 6 observaciones | no disponible (licencia upstream de Pi0.5) | Hugging Face, repo de 12,4 GB |
| Pi0.5 DROID (upstream) | no disponible | no disponible | no disponible | no disponible | referenciado como base |
| Snapshot 50k del mismo proyecto | no disponible | no disponible | no disponible (entrenamiento en curso) | no disponible | no disponible en la información proporcionada |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (políticas VLA para manipulación) más allá de la relación con el modelo base Pi0.5 DROID y la variante de 50k mencionada por el autor.

## Limitaciones y advertencias

- Snapshot intermedio: 35.000 actualizaciones de un entrenamiento que continúa hacia 50k; no es un modelo final.
- El propio autor indica que no es un ganador en pruebas con robot real retenidas.
- Rendimiento físico en robot no medido para esta release; solo se verificó inferencia finita en seis observaciones.
- Entrada restringida: sin XYZ, profundidad ni características semánticas; la vista frontal es fija por episodio, lo que limita la adaptación a cambios de escena.
- Requiere cargador de inferencia, normalización nativa y decodificación de acciones específicos; un uso fuera de ese pipeline puede producir resultados inválidos.
- Dataset pequeño y sesgado a tres tareas (plate, move, find) y 184 episodios; riesgo de sobreajuste y de generalización limitada.
- Uso de observaciones externas iniciales como pseudo-ground-truth en entrenamiento, sin imágenes externas en vivo en tiempo de política: posible desajuste si el entorno real difiere de la reconstrucción preflight.
- Licencia no especificada en la model card; los pesos conservan las condiciones upstream de Pi0.5, por lo que el uso comercial debe verificarse contra esa licencia.
- No se incluye datos de entrenamiento en el repositorio.
- Riesgo de alucinación y sesgos: no documentados por el autor; no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hohs/pi05-front-rgb-all184-35k
- Instrucciones de despliegue (checkpoint pi05-fixed-front-rgb-baseline): https://github.com/azuxmioy/metric-depth-vla/blob/deployment/inference/deployment/inference/CHECKPOINTS.md#pi05-fixed-front-rgb-baseline
- Repositorio metric-depth-vla: https://github.com/azuxmioy/metric-depth-vla
