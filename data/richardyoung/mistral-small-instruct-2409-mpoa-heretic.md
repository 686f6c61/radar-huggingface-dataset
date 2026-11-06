# richardyoung/Mistral-Small-Instruct-2409-MPOA-heretic

## Resumen

Mistral-Small-Instruct-2409-MPOA-heretic es un ajuste fino (fine-tune) del modelo Mistral-Small-Instruct-2409 de Mistral AI, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored", es decir, un modelo al que se le ha aplicado una técnica de modificación de pesos (denominada MPOA en el nombre y etiquetada como "heretic") para eliminar o reducir los mecanismos de rechazo y censura del modelo original, de modo que responda a peticiones que el modelo base declinaría.

El modelo base, Mistral-Small-Instruct-2409, es un transformer denso de aproximadamente 22.200 millones de parámetros (22,247 mil millones según los pesos en safetensors), con una ventana de contexto de 128.000 tokens según la documentación pública de Mistral AI, aunque este dato no se confirma en la información proporcionada del repositorio. El ajuste conserva la arquitectura, tokenizador (mistral-common) y capacidades multilingües del original, cubriendo inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano.

La relevancia de esta ficha radica en que documenta una modificación no oficial de un modelo de pesos abiertos con licencia restrictiva (Mistral Research License), orientada a investigación sobre alineación, robustez y comportamiento de modelos sin salvaguardas. Es importante señalar que el repositorio no incluye una model card descriptiva del proceso de modificación, ni benchmarks, ni detalles del dataset o método empleado más allá de las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Small-Instruct-2409); detalles exactos no disponibles en la informacion proporcionada |
| Parametros totales | 22.247.282.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Mistral-Small-Instruct-2409 declara 128k tokens segun documentacion publica de Mistral AI, no confirmado en este repositorio) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los pesos se distribuyen en safetensors (presumiblemente BF16/FP16, no confirmado) |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | MRL (Mistral Research License 0.1), etiquetada como "other" |
| Formato de pesos | safetensors (libreria declarada: vllm) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Mistral-Small-Instruct-2409, un transformer denso de 22.200 millones de parámetros desarrollado por Mistral AI. La información disponible no detalla la arquitectura interna más allá de la herencia del modelo base: atención con RoPE, tokenizador mistral-common y soporte multilingüe nativo para diez idiomas. El repositorio no incluye documentación sobre capas, dimensiones ocultas, número de cabezas de atención ni configuración de ventana deslizante.

Respecto al entrenamiento, la model card no describe el dataset, el número de tokens, ni si se emplearon técnicas de RLHF, DPO o SFT. Las etiquetas "heretic", "abliterated", "decensored" y "MPOA" sugieren una intervención sobre los pesos del modelo original para suprimir direcciones de activación asociadas al rechazo (técnica habitual en modelos "abliterated"), pero no se aporta metodología, hiperparámetros ni evaluación del proceso. Tampoco se especifica si hubo entrenamiento adicional o únicamente edición de pesos. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Mistral-Small-Instruct-2409.
- Generación de código y matemáticas, presumiblemente conservadas del modelo original (no verificado en este repositorio).
- Soporte multilingüe para inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano.
- Comportamiento "decensored": se espera que responda a peticiones que el modelo base rechazaría, aunque no se documenta el grado de supresión de rechazos ni se aportan evaluaciones.
- Tool calling / function calling: no confirmado en la información proporcionada; el modelo base lo soporta según documentación de Mistral AI, pero no se verifica en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en este repositorio.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo varía el comportamiento de un LLM al eliminar mecanismos de rechazo, comparando respuestas con el modelo base en conjuntos de prompts sensibles.
- Evaluación de robustez de filtros: útil para probar sistemas de moderación y clasificadores de contenido frente a un modelo que presumiblemente genera respuestas que el original bloquearía.
- Red teaming controlado: empleo en entornos aislados para identificar categorías de prompts problemáticos y diseñar salvaguardas externas.
- Experimentos de interpretabilidad: análisis de direcciones de activación y representaciones internas tras la modificación de pesos, comparando con el modelo original.
- Generación creativa sin restricciones en entornos de investigación: escritura de ficción o guiones con temáticas que el modelo base podría declinar, siempre bajo la licencia de investigación.
- Estudio de degradación de capacidades: medir si la modificación de pesos afecta a tareas estándar (razonamiento, código, matemáticas) respecto al Mistral-Small-Instruct-2409 original.
- Docencia e investigación académica: uso en laboratorios para ilustrar técnicas de "abliteration" y sus efectos sobre el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 44,5 GB solo para pesos (22.247 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 48-80 GB de VRAM para contexto moderado.
- Cuantización a 8 bits: alrededor de 22-24 GB de VRAM, viable en una RTX 4090 (24 GB) con contexto limitado o en A100 40 GB.
- Cuantización a 4 bits: alrededor de 12-14 GB de VRAM, viable en GPUs consumer como RTX 4080/4090, aunque la calidad puede degradarse; no se distribuyen pesos GGUF en el repositorio.
- GPUs recomendadas: A100 80 GB, H100 80 GB para BF16 sin cuantizar; A100 40 GB o RTX 4090 para cuantización 8 bits; GPUs consumer de 24 GB para 4 bits.
- Opciones de despliegue: la librería declarada es vLLM; también sería compatible con TGI y, previsiblemente, con llama.cpp/Ollama tras conversión a GGUF (no incluida en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Small-Instruct-2409-MPOA-heretic (este) | 22,2B | No disponible en el repo (base declara 128k) | MRL (solo investigación) | Fine-tune "decensored" no oficial, sin benchmarks |
| Mistral-Small-Instruct-2409 (base) | 22,2B | 128k segun Mistral AI | MRL (solo investigación) | Modelo oficial con alineación y evaluaciones publicadas por Mistral AI |
| Mistral-Nemo-Instruct-2407 | 12B | 128k segun Mistral AI | Apache 2.0 | Alternativa oficial de menor tamaño y licencia permisiva |
| Qwen2.5-14B-Instruct | 14B | 128k segun documentacion de Qwen | Apache 2.0 | Alternativa permisiva con buen rendimiento en código y multilingüe |

Los datos de contexto y licencia de los modelos comparables provienen de documentación pública de sus desarrolladores; no se dispone de benchmarks comparativos específicos de este ajuste.

## Limitaciones y advertencias

- La licencia MRL (Mistral Research License 0.1) restringe el uso a fines de investigación; no permite uso comercial sin licencia adicional de Mistral AI.
- El modelo es un ajuste no oficial: no está respaldado ni validado por Mistral AI, y el autor no documenta el método MPOA ni sus efectos.
- La supresión de rechazos puede incrementar el riesgo de generar contenido dañino, ilegal o sesgado; requiere filtros externos en cualquier despliegue.
- Riesgo de alucinación inherente al modelo base, potencialmente agravado por la modificación de pesos no evaluada.
- No se han publicado benchmarks que cuantifiquen la degradación o mejora de capacidades respecto al modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por la comunidad.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ) ni se documenta compatibilidad con llama.cpp u Ollama.
- El prompt de acceso restringido (gated) exige aceptar la licencia MRL antes de descargar.
- Posibles sesgos heredados del corpus de entrenamiento del modelo base, no evaluados en este ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-MPOA-heretic
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-Instruct-2409
- Licencia MRL 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Contacto de licencias Mistral AI: https://mistral.ai/contact/
