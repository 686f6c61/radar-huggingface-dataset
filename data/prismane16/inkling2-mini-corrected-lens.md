# prismane16/inkling2-mini-corrected-lens

## Resumen

`prismane16/inkling2-mini-corrected-lens` es un conjunto de pesos de una lente de registro (logit lens) de bajo rango para el modelo Inkling 2 Mini, presentado como entrada a la Looped Lens Challenge. No se trata de un modelo de lenguaje generativo, sino de un artefacto de interpretabilidad: una corrección lineal de bajo rango que se aplica a las activaciones intermedias de cada visita de capa para proyectarlas al espacio de vocabulario mediante la matriz de desanclaje (`unembed`).

La innovación consiste en sustituir la lente de registro clásica, que proyecta directamente la activación normalizada, por una corrección afín de rango 128 por visita de capa: `readout(h) = unembed(z + (z @ A) @ B + b)`, con `z = norm(h)`. Los pesos cubren las visitas 12, 24, 35, 36, 42, 43, 44, 45, 46 y 47, lo que sugiere un modelo con arquitectura de capas recurrentes o "looped" de al menos 47 visitas.

El repositorio tiene un tamaño de 0.0 GB según los metadatos de Hugging Face, lo que indica que los pesos no están efectivamente alojados o que el tamaño reportado es despreciable. No hay descargas ni likes, y la model card no documenta el modelo base, los datos de entrenamiento de la lente ni resultados de evaluación. Su relevancia es, por tanto, exclusivamente metodológica para quienes trabajan en interpretabilidad mecanicista de modelos con capas recurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Corrección lineal de bajo rango sobre lente de registro (no es un modelo generativo) |
| Parametros totales | 10 visitas × (A [2304, 128] + B [128, 2304] + b [2304]) ≈ 10 × 592.128 ≈ 5,92 M parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`lens.safetensors`) |

## Arquitectura y entrenamiento

El artefacto define, para cada visita de capa seleccionada, tres tensores: `A` de forma [2304, 128], `B` de forma [128, 2304] y `b` de forma [2304]. La dimensión oculta del modelo base es por tanto 2304, y el rango de la corrección es 128. La lectura se calcula normalizando la activación `h`, aplicando la corrección aditiva de bajo rango `(z @ A) @ B + b` y proyectando el resultado con la matriz de desanclaje del modelo base. Con `A`, `B` y `b` a cero, la fórmula degenera en la lente de registro estándar, lo que confirma que la corrección es un refinamiento opcional sobre la lectura clásica.

Las visitas cubiertas son 12, 24, 35, 36, 42, 43, 44, 45, 46 y 47. La concentración de visitas en el tramo final (35 a 47) sugiere que el modelo base repite bloques de capas y que la lente se ajustó con especial atención a las visitas tardías, donde la representación es más cercana a la distribución de salida. La model card indica que el ajuste se realizó sobre prompts escritos expresamente para ello, no sobre preguntas de la competición ni de benchmarks, lo que reduce el riesgo de contaminación pero también limita la generalización a dominios no representados en esos prompts.

No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo optimización con RLHF o DPO. Tampoco se especifica el procedimiento de optimización (función de pérdida, régimen de entrenamiento, congelación de capas del modelo base) más allá de la fórmula de lectura.

## Capacidades

- Lectura interpretativa de activaciones intermedias: proyecta estados ocultos de las visitas 12, 24, 35, 36 y 42 a 47 al espacio de vocabulario con una corrección de rango 128.
- Refinamiento sobre la lente de registro estándar: la corrección afín permite modelar desplazamientos y rotaciones lineales que la proyección directa no captura.
- Compatibilidad con el modelo base Inkling 2 Mini: requiere la matriz de desanclaje y la función de normalización del modelo para operar.
- No genera texto, no razona, no ejecuta código, no soporta tool calling ni agentes, y no tiene capacidades multilingües propias.
- No incorpora modo de pensamiento, visión ni audio.
- Reutilizable como componente en pipelines de interpretabilidad: al ser pesos safetensors con nombres por visita, se puede cargar selectivamente la visita de interés.

## Casos de uso

- Análisis de trayectorias de representación en modelos con capas recurrentes: cargar las correcciones de las visitas 12, 24, 35 y 42 a 47 y comparar la distribución de tokens predicha en cada visita para estudiar cómo evoluciona la hipótesis de salida a lo largo de las iteraciones del bloque.
- Diagnóstico de capas intermedias: identificar en qué visita el modelo "decide" el token final y si las visitas tardías convergen o siguen refinando la distribución, útil para decidir dónde aplicar técnicas de edición o intervención.
- Investigación en interpretabilidad mecanicista: usar la corrección de bajo rango como línea base frente a lentes lineales alternativas (por ejemplo, lentes afinadas por capa o lentes no lineales) en experimentos comparativos.
- Reproducción de la Looped Lens Challenge: el artefacto sirve como entrada reproducible para verificar resultados de la competición con los mismos tensores y la misma fórmula de lectura.
- Auditoría de sesgos en representaciones internas: proyectar activaciones de prompts controlados y examinar qué tokens de sesgo emergen en visitas tempranas frente a tardías.
- Docencia y divulgación: ilustrar con un caso concreto y de tamaño manejable (≈5,92 M de parámetros) cómo funciona una lente de registro corregida sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de fidelidad de la lente (por ejemplo, acuerdo top-1 con la salida final, perplejidad de la distribución proyectada o KL respecto a la distribución del modelo), ni comparación con la lente de registro sin corregir.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos de la lente (≈5,92 M parámetros en fp32 ≈ 23,7 MB; en fp16 ≈ 11,8 MB), más la memoria necesaria para cargar el modelo base Inkling 2 Mini, no documentada.
- GPU recomendadas: cualquier GPU con suficiente memoria para el modelo base; la lente en sí cabe en CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU para el cálculo de la corrección, siempre que las activaciones del modelo base estén disponibles.
- Opciones de despliegue: carga directa con `safetensors` y `torch`; no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles; el coste dominante es la inferencia del modelo base, no la corrección (dos productos matriciales de 2304×128 y 128×2304 por visita).

## Comparativa con modelos similares

| Artefacto | Tipo | Rango de corrección | Visitas cubiertas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prismane16/inkling2-mini-corrected-lens | Lente de registro corregida | 128 | 12, 24, 35, 36, 42–47 | MIT | Hugging Face (repo de 0.0 GB) |
| Lente de registro estándar (logit lens) | Proyección directa sin corrección | 0 | Cualquiera | Depende del modelo base | Implementación de referencia en la literatura |
| Lentes afinadas por capa (tuned lens) | Transformación afín por capa | Dimensión completa | Todas las capas | Depende de la implementación | Disponible en librerías de interpretabilidad |

No se dispone de información sobre otras entradas de la Looped Lens Challenge ni sobre lentes corregidas comparables para Inkling 2 Mini, por lo que la comparativa cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El repositorio reporta un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados; verificar la integridad de `lens.safetensors` antes de usarlo.
- La lente se ajustó sobre prompts escritos expresamente, no sobre benchmarks ni preguntas de la competición; su fidelidad fuera de esa distribución es desconocida.
- Solo cubre las visitas 12, 24, 35, 36, 42, 43, 44, 45, 46 y 47; no hay corrección para el resto de visitas del modelo base.
- No se documenta el modelo base exacto (versión, checkpoint, tokenizador), lo que dificulta la reproducibilidad.
- No hay métricas publicadas de fidelidad, calibración ni acuerdo con la distribución final del modelo.
- La licencia MIT permite uso comercial del artefacto, pero no exime de las restricciones de la licencia del modelo base sobre el que se aplica.
- No es un modelo generativo: no debe evaluarse con benchmarks de texto, código o matemáticas, ni desplegarse como servicio de inferencia.
- Riesgo de interpretación errónea: una lectura de la lente no es la salida del modelo; las conclusiones sobre "lo que el modelo piensa" en una visita concreta requieren validación con intervenciones contrafactuales.

## Enlaces

- Hugging Face: https://huggingface.co/prismane16/inkling2-mini-corrected-lens
- Looped Lens Challenge: no disponible (no se proporciona URL en la información disponible)
- Modelo base Inkling 2 Mini: no disponible (no se proporciona referencia en la información disponible)
- Paper o blog de la lente de registro corregida: no disponible
