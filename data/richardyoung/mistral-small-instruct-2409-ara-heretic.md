# richardyoung/Mistral-Small-Instruct-2409-ARA-heretic

## Resumen

Mistral-Small-Instruct-2409-ARA-heretic es un ajuste fino del modelo Mistral-Small-Instruct-2409 de Mistral AI, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, una versión en la que se ha aplicado una técnica de edición de pesos orientada a eliminar o reducir los mecanismos de rechazo y censura del modelo original, manteniendo el resto de capacidades del modelo base.

El modelo base es un transformer denso de aproximadamente 22.247 millones de parámetros (22,2 B), desarrollado por Mistral AI. Este ajuste conserva la arquitectura, el tokenizador y la ventana de contexto del modelo original, así como su soporte multilingüe para diez idiomas (inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano). El repositorio ocupa 44,5 GB en formato safetensors y está etiquetado para su uso con vLLM.

La relevancia de esta ficha radica en que documenta una variante no oficial de un modelo de referencia, con implicaciones importantes en cuanto a licencia (Mistral AI Research License, MRL-0.1), comportamiento alineado y adecuación para producción. El modelo no registra descargas ni "likes" en el momento de la consulta, lo que sugiere una distribución muy limitada y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Small-Instruct-2409) |
| Parametros totales | 22.247.282.688 (22,2 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | mrl (Mistral AI Research License 0.1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso de Mistral-Small-Instruct-2409, con 22,2 mil millones de parámetros. No se dispone de información detallada en la documentación proporcionada sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre la composición exacta del dataset de entrenamiento original. Tampoco se especifica el número de tokens utilizados en el preentrenamiento ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación técnica distintiva de esta variante es el proceso de "abliteration" o edición de pesos que da lugar al sufijo "heretic". Esta técnica modifica selectivamente las direcciones de activación asociadas a comportamientos de rechazo, con el objetivo de reducir la tendencia del modelo a declinar peticiones. La model card no documenta la metodología exacta, el conjunto de datos de calibración utilizado ni las métricas de degradación asociadas al proceso, lo que impide evaluar el coste real en capacidades del modelo respecto al original. Las etiquetas del repositorio incluyen "reproducible", pero no se aportan scripts ni detalles del pipeline de edición.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Mistral-Small-Instruct-2409.
- Generación de código y resolución de problemas matemáticos, presumiblemente conservadas del modelo original aunque no verificadas en esta variante.
- Soporte multilingüe para diez idiomas: inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano.
- Reducción de rechazos y respuestas de tipo "no puedo ayudar con eso", como consecuencia del proceso de abliteration.
- Compatibilidad declarada con vLLM como librería de inferencia (library_name: vllm).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada, aunque el modelo base lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en esta variante.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente el efecto de la abliteration sobre la tasa de rechazo y la calidad de las respuestas, comparándolo con el modelo base en tareas controladas.
- Evaluación de robustez de salvaguardas: útil para equipos de seguridad que quieran medir hasta qué punto las técnicas de edición de pesos comprometen los mecanismos de moderación de un modelo alineado.
- Generación creativa sin restricciones excesivas: escritura de ficción, guiones o narrativa que aborde temas sensibles donde el modelo original tiende a declinar, siempre dentro del marco legal aplicable.
- Experimentación académica con modelos de 22 B en infraestructura de investigación: su tamaño permite desplegarlo en un nodo con varias GPU de 80 GB y estudiar comportamientos a escala media sin depender de APIs externas.
- Análisis de sesgos y contenido dañino: como banco de pruebas para pipelines de clasificación y filtrado, al disponer de un modelo con menor resistencia a generar contenido problemático.
- Desarrollo de prototipos multilingües en investigación: cubre diez idiomas con un único checkpoint, útil para experimentos comparativos de calidad lingüística entre el modelo original y la variante editada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión FP16/BF16, los 22,2 B de parámetros requieren aproximadamente 44,5 GB de pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 48-80 GB de VRAM total.
- En cuantización de 8 bits, la huella de pesos se reduce a unos 22-24 GB, aunque el repositorio no publica versiones cuantizadas.
- En cuantización de 4 bits (si se generara con herramientas externas), los pesos ocuparían aproximadamente 11-13 GB, pero no hay GGUF ni GPTQ/AWQ oficiales en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB con tensor parallelism) para FP16.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar el modelo en FP16; requeriría cuantización agresiva no publicada por el autor.
- Opciones de despliegue: vLLM es la librería declarada; llama.cpp, Ollama o TGI no están confirmados por falta de formatos alternativos en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Mistral-Small-Instruct-2409-ARA-heretic | 22,2 B | no disponible | MRL-0.1 (solo investigación) | safetensors | Variante abliterated, sin benchmarks publicados, 0 descargas |
| mistralai/Mistral-Small-Instruct-2409 | 22,2 B | no disponible | MRL-0.1 | safetensors | Modelo base oficial, alineado, con documentación de Mistral AI |
| Mistral-Small-Instruct-2501 (versión posterior de Mistral) | 24 B | no disponible | Apache 2.0 en versiones posteriores | safetensors | Alternativa oficial con licencia más permisiva en algunas versiones |
| Otras variantes "heretic/abliterated" de Mistral | variable | no disponible | dependiente del modelo base | safetensors | Ecosistema disperso, sin evaluación estandarizada |

La comparación directa con el modelo base es la más relevante: esta variante sacrifica potencialmente parte del alineamiento del original a cambio de menor tasa de rechazo, sin que existan métricas publicadas que cuantifiquen el intercambio.

## Limitaciones y advertencias

- Licencia MRL-0.1: restringe el uso a fines de investigación ("Research Purposes") y exige solicitar licencia adicional a Mistral AI para cualquier uso no autorizado, incluido el comercial.
- El proceso de abliteration puede degradar capacidades del modelo respecto al original; no se aportan evaluaciones que lo cuantifiquen.
- Mayor riesgo de generar contenido dañino, sesgado o inapropiado al haberse reducido los mecanismos de rechazo.
- Riesgo de alucinación no evaluado en esta variante; presumiblemente similar o superior al modelo base.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad ni de reproducibilidad del proceso.
- La model card no documenta la metodología de edición, el dataset de calibración ni los tests de regresión.
- Longitud de contexto no confirmada en la información disponible.
- No se ofrecen cuantizaciones GGUF/GPTQ/AWQ, lo que limita el despliegue en hardware de consumo.
- El uso de modelos "uncensored" puede incumplir términos de servicio de plataformas y normativas locales; el usuario asume la responsabilidad legal del contenido generado.
- No debe desplegarse en producción orientada a usuarios finales sin capas adicionales de moderación y sin una revisión legal de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-ARA-heretic
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-Instruct-2409
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
- Contacto de licencias de Mistral AI: https://mistral.ai/contact/
