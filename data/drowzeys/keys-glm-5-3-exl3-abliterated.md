# drowzeys/keys-GLM-5.3-EXL3-Abliterated

## Resumen

`drowzeys/keys-GLM-5.3-EXL3-Abliterated` es una cuantización de 3 bits en formato EXL3 (ExLlamaV3) del modelo base `zai-org/GLM-5.3`, publicada por el usuario drowzeys. Se trata de un modelo de generación de texto de arquitectura MoE con 165.028.098.048 parámetros totales, empaquetado en safetensors y orientado a su ejecución con vLLM y ExLlamaV3. El repositorio ocupa 330,2 GB y está sujeto a acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargarlo.

La ficha se apoya únicamente en los metadatos públicos del repositorio. Las etiquetas declaradas por el autor indican `glm_moe_dsa`, `exl3`, `3-bit`, `1m-context`, `mtp`, `abliterated` y `derisked`, además de referencias explícitas a `dgx-spark` y `gb10` (plataforma NVIDIA GB10 Grace Blackwell). Esto sugiere una ventana de contexto de 1.000.000 de tokens, predicción multi-token (MTP) y la supresión de direcciones de rechazo propias del alineamiento de seguridad del modelo original, pero no se ha podido confirmar ninguno de estos extremos con documentación técnica adicional, ya que la búsqueda web no devolvió resultados relevantes.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo de ~165.000 millones de parámetros en cuantización de 3 bits sobre hardware con memoria unificada, como una estación DGX Spark; por otro, la variante "abliterated" elimina los mecanismos de rechazo, lo que la hace atractiva para investigación sobre alineamiento y evaluación de riesgos, y problemática para despliegues comerciales sin supervisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `glm_moe_dsa`); detalles de capas, expertos y atención no disponibles |
| Parametros totales | 165.028.098.048 (~165 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 de tokens según la etiqueta `1m-context`; sin confirmar en documentación |
| Tipos de cuantizacion | EXL3 de 3 bits (etiquetas `exl3`, `exllamav3`, `3-bit`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 330,2 GB) |
| Biblioteca declarada | vLLM |
| Modelo base | zai-org/GLM-5.3 |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Descargas / likes | 117 / 8 |
| Fecha de creacion | 2026-09-04 |
| Ultima actualizacion | 2026-09-04 |

## Arquitectura y entrenamiento

La información publicada no incluye detalles de arquitectura más allá de las etiquetas del repositorio: `glm_moe_dsa` apunta a una arquitectura de mezcla de expertos (MoE) con algún esquema de atención dispersa o dinámica, `mtp` indica predicción multi-token y `1m-context` una ventana de contexto de un millón de tokens. No hay información disponible sobre el número de expertos, expertos activos por token, número de capas, dimensión oculta, tipo de atención exacto ni sobre el tokenizador. Tampoco se especifican los datos de entrenamiento (número de tokens, composición del corpus, fases de SFT, RLHF o DPO), que corresponderían al modelo base `zai-org/GLM-5.3` y no a esta cuantización.

En cuanto al proceso de derivación, lo único documentado son las etiquetas: cuantización EXL3 a 3 bits con el stack ExLlamaV3 y un proceso de "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones o pesos) combinado con "derisking". No se han publicado los detalles metodológicos de ese proceso, ni métricas de degradación de perplejidad respecto al modelo original, ni la receta de calibración empleada para la cuantización.

## Capacidades

- Generación de texto y uso conversacional: son las únicas capacidades confirmadas por los metadatos (`pipeline: text-generation`, etiqueta `conversational`).
- Contexto largo: la etiqueta `1m-context` apunta a una ventana de hasta 1.000.000 de tokens, adecuada para documentos o bases de código extensos, aunque no se ha verificado experimentalmente.
- Predicción multi-token (MTP): la etiqueta `mtp` sugiere un cabezal de decodificación especulativa o multi-token que podría acelerar la inferencia; sin datos de rendimiento publicados.
- Modelo "abliterated"/"derisked": se han eliminado los comportamientos de rechazo del modelo alineado original, de modo que el modelo responderá a peticiones que el base rechazaría.
- Tool calling / function calling: no disponible; no confirmado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; no confirmado.
- Idiomas soportados: no disponible.
- Visión, audio u otras modalidades: no disponible; el repositorio es únicamente de texto.

## Casos de uso

- Análisis de documentación extensa: con una ventana declarada de 1.000.000 de tokens, el modelo podría procesar expedientes completos, contratos o manuales técnicos en una sola pasada, evitando pipelines de troceado y recuperación que degradan la coherencia entre secciones.
- Revisión de bases de código completas: permitiría cargar repositorios de tamaño medio en el contexto y realizar tareas de búsqueda de patrones, explicación de arquitectura o detección de inconsistencias entre módulos, siempre que el hardware soporte el KV cache asociado.
- Investigación sobre alineamiento y seguridad: al tratarse de una variante abliterated, es un artefacto útil para estudiar qué comportamientos de rechazo se eliminan, cómo se degrada la utilidad general y qué vectores de riesgo aparecen, en entornos de laboratorio controlados.
- Evaluación comparativa de cuantizaciones: sirve como punto de medida del impacto de EXL3 a 3 bits frente a otras cuantizaciones del mismo base, útil para decidir el formato de despliegue en producción.
- Despliegue local en estación de trabajo con memoria unificada: las etiquetas `dgx-spark` y `gb10` indican que el modelo está pensado para ejecutarse en una NVIDIA DGX Spark con 128 GB de memoria unificada, un escenario de inferencia privada sin salida de datos a la nube.
- Generación de texto a gran escala con licencia permisiva: la licencia MIT del repositorio facilita su integración en productos propietarios, sujeto a que el uso encaje con las condiciones del modelo base y con la legislación aplicable.
- Prototipado de asistentes conversacionales especializados: el pipeline conversacional y el contexto largo permiten construir asistentes sobre dominios con corpus propios sin entrenamiento adicional, mediante prompting con documentos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos en 3 bits: aproximadamente 62 GB (165.028.098.048 parámetros × 3 bits / 8), calculado a partir del recuento real de parámetros; el coste adicional de embeddings, cabezal MTP y metadatos EXL3 no está documentado.
- Memoria total realista: por encima de los 65 GB solo para pesos; habría que sumar el KV cache, cuyo tamaño no se puede estimar sin conocer el número de capas, cabezas y dimensión de cabeza del modelo base.
- Contexto largo: a 1.000.000 de tokens el KV cache crece de forma muy significativa y no es cuantificable con los datos disponibles; en la práctica conviene reservar memoria adicional o recurrir a técnicas de gestión de caché.
- GPU recomendadas: una NVIDIA DGX Spark (GB10 Grace Blackwell, 128 GB de memoria unificada) es el objetivo declarado en las etiquetas del repositorio. Alternativas con memoria suficiente incluyen RTX Pro 6000 Blackwell (96 GB) o configuraciones multi-GPU con 2× H100 80 GB o 2× A100 80 GB.
- Consumer GPU: no cabe en ninguna GPU de consumo actual; una RTX 4090 con 24 GB queda muy lejos de los ~62 GB mínimos de pesos.
- Opciones de despliegue: vLLM (biblioteca declarada) y ExLlamaV3 (etiquetas `exl3` y `exllamav3`). No hay formato GGUF en el repositorio, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| drowzeys/keys-GLM-5.3-EXL3-Abliterated | 165.028.098.048 | 1.000.000 (segun etiqueta) | EXL3 3 bits | MIT | Restringido (gated) | Variante abliterated, orientada a DGX Spark |
| zai-org/GLM-5.3 (modelo base) | no disponible | no disponible | pesos originales | no disponible | no disponible | Origen de esta cuantizacion; el repositorio no aporta sus especificaciones |
| Otras cuantizaciones del mismo base (AWQ, GPTQ, GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores (por ejemplo, modelos MoE de tamaño similar de otras familias). Los resultados de la búsqueda web no fueron relevantes para este modelo.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: al ser una variante abliterated, se han eliminado las direcciones de rechazo del modelo alineado. El modelo puede generar contenido dañino, ilegal o inseguro sin filtrar, y no debe exponerse a usuarios finales sin capas de moderación externas.
- Degradación por cuantización: la cuantización a 3 bits introduce pérdida de precisión. No se han publicado métricas de perplejidad ni comparativas con el modelo base, por lo que el impacto real en calidad es desconocido.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay datos específicos de fiabilidad factual para esta variante.
- Contexto declarado sin verificar: la ventana de 1.000.000 de tokens proviene únicamente de una etiqueta del repositorio; no hay evaluación publicada de recuperación de información en contextos largos ni de degradación con la distancia.
- Idiomas: no disponible. No se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos de los del modelo base.
- Licencia: el repositorio declara MIT, pero el modelo deriva de `zai-org/GLM-5.3`, cuyos términos no se detallan en la información disponible. Verifique la licencia del modelo base y las condiciones del acceso gated antes de cualquier uso comercial.
- Acceso restringido: la descarga requiere aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y la automatización de despliegues.
- Huella de memoria: 330,2 GB de repositorio y más de 60 GB de pesos en memoria hacen inviable su uso en hardware de consumo y complican el almacenamiento y la distribución.
- Trazabilidad limitada: la ficha del repositorio no documenta el proceso de abliteración ni el conjunto de calibración de la cuantización, lo que dificulta auditar el modelo.
- Sin benchmarks: no hay ningún resultado publicado que permita situar su rendimiento frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drowzeys/keys-GLM-5.3-EXL3-Abliterated
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Paper, blog o repositorio asociados: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió resultados relevantes para este modelo.
