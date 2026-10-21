# geonmin-kim/GR00T-N1.7-LIBERO-baseline-libero_spatial-step10000

## Resumen

El modelo `geonmin-kim/GR00T-N1.7-LIBERO-baseline-libero_spatial-step10000` es un checkpoint de ajuste fino del modelo fundacional de robótica GR00T N1.7 de NVIDIA, entrenado sobre la suite de tareas LIBERO-spatial. Lo publica el usuario geonmin-kim en HuggingFace con 3.144.016.000 parámetros (~3,14 mil millones) almacenados en safetensors y un tamaño de repositorio de 12,6 GB. El nombre indica que se trata de una ejecución *baseline* (sin modificaciones metodológicas) detenida en el paso 10.000 de entrenamiento, presumiblemente como referencia reproducible para comparar métodos sobre el benchmark LIBERO.

GR00T (Generalist Robot 00 Technology) es la familia de modelos visión-lenguaje-acción (VLA) de NVIDIA para robots humanoides y manipulación generalista: combina un backbone de visión-lenguaje con un cabezal de acciones que genera trayectorias motoras. LIBERO es un benchmark de aprendizaje robótico continuo con suites como `libero_spatial`, `libero_object`, `libero_goal` y `libero_10`. Este checkpoint concreto interesa a investigadores que replican o comparan resultados en LIBERO-spatial.

La información pública en HuggingFace es mínima: no declara licencia, idiomas, pipeline ni model card, y no se han encontrado resultados de benchmarks ni documentación adicional en la búsqueda web realizada (que devolvió únicamente contenido no relacionado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en la familia GR00T N1 de NVIDIA; detalle exacto de N1.7 no confirmado en la información disponible |
| Parámetros totales | 3.144.016.000 (~3,14 mil millones) |
| Parámetros activos | No aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | No disponible (modelo VLA; el equivalente es el horizonte de acción, no una ventana de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El identificador apunta a GR00T N1.7, la versión 1.7 de la familia GR00T de NVIDIA. La arquitectura pública de GR00T N1 es un sistema dual: un componente de razonamiento lento (*system 2*) basado en un modelo visión-lenguaje (VLM) que interpreta la instrucción y la escena, y un componente rápido (*system 1*) tipo *diffusion transformer* que genera las acciones motoras a alta frecuencia. El modelo se entrena con datos de robots humanoides, teleoperación y vídeo humano, y se evalúa en benchmarks de manipulación como LIBERO. En la información proporcionada no constan detalles específicos de N1.7 (composición del dataset, número de tokens, uso de RLHF/DPO o innovaciones concretas), por lo que esos datos se marcan como no disponibles.

El sufijo `libero_spatial-step10000` indica un ajuste fino sobre la suite `libero_spatial` de LIBERO, detenido en el paso 10.000. El término `baseline` sugiere una ejecución de referencia sin cambios metodológicos. Al no existir model card ni documentación asociada en el repositorio, no es posible confirmar hiperparámetros, receta de entrenamiento ni si se congelaron partes del modelo durante el ajuste.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, capacidad propia de un modelo VLA.
- Percepción visual de la escena (objetos, posiciones, manipulador) integrada en el backbone de visión.
- Comprensión de instrucciones de tarea en lenguaje natural para condicionar la política.
- Ejecución de tareas de manipulación de la suite LIBERO-spatial, según el nombre del checkpoint.
- Soporte de *tool calling* / *function calling*: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible.
- Capacidades especiales: visión confirmada por la naturaleza VLA; *thinking mode* y audio no disponibles.

## Casos de uso

- Reproducción de baselines en LIBERO-spatial: sirve como referencia fija (step 10.000) para comparar nuevas recetas de ajuste fino o de aumento de datos sobre la misma suite, eliminando la variabilidad de un entrenamiento propio.
- Comparación de métodos de ajuste fino: al ser un *baseline*, permite aislar la contribución de una técnica (por ejemplo, congelación selectiva, LoRA o currículo de tareas) frente a un punto de partida conocido.
- Investigación en aprendizaje por imitación: el checkpoint se puede cargar para estudiar la política aprendida y analizar la distribución de acciones generadas en tareas de variación espacial.
- Prototipado de políticas de manipulación en simulación: integrado en el entorno LIBERO, permite validar rápidamente si una política VLA resuelve tareas de colocación y alcance antes de invertir en entrenamiento adicional.
- Evaluación de robustez espacial: `libero_spatial` está diseñado para medir generalización ante cambios de posición de objetos y del manipulador, un escenario típico para probar la sensibilidad del modelo a la disposición de la escena.
- Docencia y cursos de robótica: un checkpoint pequeño (3,14B) y abierto en formato safetensors es un recurso manejable para ilustrar el ciclo completo de un modelo VLA en prácticas de laboratorio.
- Punto de partida para transferencia a robot real: con las cautelas propias de un modelo entrenado en simulación, puede servir como inicialización para ajuste con datos reales de un brazo robótico con espacio de acciones compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El checkpoint está etiquetado como *baseline* y detenido en el paso 10.000, pero el repositorio no incluye ninguna tabla de métricas y la búsqueda web no devolvió resultados relevantes. El benchmark de referencia implícito es LIBERO-spatial, que mide la tasa de éxito en tareas de manipulación con variación espacial, pero no se dispone de cifras de este checkpoint.

## Requisitos de hardware

- El repositorio ocupa 12,6 GB, coherente con pesos almacenados en FP32 para 3,14B de parámetros (~4 bytes por parámetro).
- Inferencia en BF16/FP16: ~6,3 GB solo de pesos; con activaciones y codificador visual, estimación orientativa de 8-10 GB de VRAM.
- Inferencia en FP32: ~12,6 GB de pesos; estimación orientativa de 15-18 GB de VRAM.
- Cuantización INT8 (~3,2 GB) e INT4 (~1,6 GB): estimaciones teóricas, no confirmadas para este checkpoint.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB), A6000 (48 GB), A100 y H100 para entrenamiento o inferencia en lote.
- Cabe en GPU de consumo: sí, en BF16 en RTX 4090, 3090, 4080 y 4070 Ti Super (16 GB); en FP32 conviene una GPU de 24 GB o superior.
- Despliegue: no es un LLM estándar; requiere el código de inferencia de la familia Isaac GR00T (PyTorch) para cargar el backbone y el cabezal de acciones. vLLM, llama.cpp, Ollama o TGI no son aplicables al cabezal de acciones, aunque podrían servir para el componente VLM si se separa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de conocimiento público general y no se han verificado en la búsqueda web realizada; se marcan como tales.

| Modelo | Parámetros | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|
| GR00T N1.7 LIBERO (este checkpoint) | 3,14B | VLA, ajuste sobre LIBERO-spatial | No disponible | HuggingFace (`geonmin-kim`) |
| NVIDIA GR00T N1 (original) | ~2,2B (no verificado) | VLA para humanoides | NVIDIA Open Model License (no verificado) | HuggingFace (`nvidia`) |
| OpenVLA | ~7B | VLA para manipulación | MIT (no verificado) | HuggingFace |
| π0 (Physical Intelligence) | ~3,3B (no verificado) | VLA con modelo de flujo | No verificada | Repositorio openpi |

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- No hay model card, ni descripción de datos de entrenamiento, ni resultados de evaluación; la trazabilidad del checkpoint es mínima.
- con 6 descargas y 0 *likes*, no hay validación por parte de la comunidad ni evidencia de que el checkpoint funcione según lo esperado.
- Al ser un modelo VLA, existe riesgo de que la política ejecute acciones incorrectas o inseguras ante escenas fuera de la distribución de LIBERO-spatial; no debe usarse en robots reales sin supervisión.
- Los sesgos de los datos de entrenamiento (demografía, tipos de objetos, entornos simulados) no están documentados.
- El alcance está limitado a tareas de manipulación similares a LIBERO-spatial; no es un modelo de propósito general fuera de ese dominio.
- Idiomas soportados no declarados; la comprensión de instrucciones podría estar sesgada hacia el inglés.
- El checkpoint corresponde a un paso intermedio (10.000) y no necesariamente al mejor punto de la curva de entrenamiento.
- La fecha de creación declarada (2026-10-21) es posterior a la fecha actual, lo que conviene verificar por si se trata de un error de metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/geonmin-kim/GR00T-N1.7-LIBERO-baseline-libero_spatial-step10000
- La búsqueda web realizada no devolvió enlaces relevantes (solo contenido no relacionado); no se han podido verificar papers, blogs ni demos asociados a este checkpoint concreto.
- Referencias canónicas de la familia (no obtenidas en esta búsqueda, aportadas como contexto): repositorio Isaac-GR00T de NVIDIA en GitHub y sitio del benchmark LIBERO.
