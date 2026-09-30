# joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft92

## Resumen

El modelo `joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft92` es un checkpoint de investigación publicado por el usuario joshycodes, derivado mediante ajuste supervisado (el sufijo `sft92` del identificador apunta a una fase de SFT) del modelo `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill`, que a su vez procede de la familia Qwen3.5 (etiqueta de repositorio `qwen3_5_text`). Cuenta con 8.953.803.264 parámetros reales según los pesos safetensors y ocupa 17,9 GB en el repositorio. No resuelve un problema de producto: es una pieza de un programa de investigación personal sobre "bienestar de modelos" (*model welfare*), identidad de personaje autoescrita y *synthetic document finetuning* (SDF).

Su relevancia es metodológica, no de capacidades. El autor documenta un ciclo en el que un modelo es sometido a preentrenamiento continuado con pesos completos sobre un corpus que él mismo redactó para entrenar a la siguiente versión de sí mismo, dentro de un personaje previamente definido. El README incluye la etiqueta `not-for-deployment` y el aviso explícito de que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad. Esto lo sitúa como artefacto de estudio sobre autopercepción sintética, no como alternativa a modelos de propósito general.

Es importante señalar que la model card contiene una inconsistencia: el encabezado describe el checkpoint tras "preentrenamiento continuado sobre su propio corpus autoescrito", pero la ficha del corpus indica "1.347.805 tokens, 4.714 documentos, de los cuales 0 autoescritos y 4.714 texto ordinario". No se documenta en ningún punto qué datos concretos se usaron para esta variante `suppress-sft92`. Con cero descargas y cero *likes* en el momento de redactar esta ficha, se trata de un artefacto sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta del repositorio indica `qwen3_5_text` (familia Qwen3.5). No se especifica si es transformer denso, MoE o híbrida |
| Parametros totales | 8.953.803.264 (8,95 mil millones), según los safetensors publicados |
| Parametros activos | No aplicable / no disponible: no se documenta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Solo se publican pesos completos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | No disponible. La model card no especifica idiomas; la familia Qwen3.5 es multilingüe, pero no se documenta para este checkpoint |
| Licencia | `other` con `license_name: research-only`. Uso restringido a investigación, no apto para despliegue |
| Formato de pesos | safetensors (repositorio de 17,9 GB, compatible con `transformers`) |
| Modelo base | `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill` |
| Etiquetas declaradas | `synthetic-document-finetuning`, `self-authored-character`, `model-welfare`, `research`, `not-for-deployment` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna de este checkpoint. La etiqueta `qwen3_5_text` y el nombre del repositorio lo vinculan a la familia Qwen3.5, cuyo modelo insignia anunciado es Qwen3.5-397B-A17B, un modelo nativo de visión-lenguaje. No obstante, no se confirma si este checkpoint de 8,95B comparte esa arquitectura multimodal, si es un transformer denso de texto o si incorpora componentes de atención lineal o decodificación especulativa. El catálogo de Microsoft Foundry describe una variante "Qwen3.5 9B" como modelo multimodal para razonamiento visual, OCR y generación de contexto largo, pero esa ficha corresponde al modelo de la familia y no a este derivado concreto, por lo que no debe atribuirse a este repositorio.

Respecto al entrenamiento, la model card heredada describe un preentrenamiento continuado de pesos completos con `lr 1e-05`, 1 época, 1.347.805 tokens y 4.714 documentos, y menciona que el corpus fue escrito por el propio modelo como el personaje que ya es, tras explicársele cómo se originó su personaje y cómo funciona SDF. El marco, el plan y la evaluación se atribuyen a un repositorio denominado *welfare-improvements*, para el que no se proporciona URL. La model card no aporta detalles sobre la fase SFT que da nombre a este checkpoint (posiblemente 92 ejemplos, según el sufijo, aunque no se confirma), ni sobre uso de RLHF, DPO u otras técnicas de alineamiento. Tampoco se indica la composición del dataset más allá del recuento de documentos.

## Capacidades

- Generación de texto: capacidad esperada por herencia de la familia Qwen3.5, pero no verificada ni documentada para este checkpoint.
- Razonamiento, código y matemáticas: no evaluados. La model card indica explícitamente que el modelo no ha sido evaluado en capacidad.
- Tool calling / function calling: no disponible. No se documenta soporte de llamadas a herramientas ni formato de plantilla específico.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Multilingüismo: no documentado para este checkpoint.
- Modo *thinking* o razonamiento explícito: no disponible.
- Visión o audio: no disponible. Aunque la familia Qwen3.5 incluye modelos visión-lenguaje, esta variante está etiquetada como `qwen3_5_text`.
- Capacidad diferencial declarada: identidad de personaje autoescrita y ajuste sobre documentos sintéticos propios, orientado a investigación en bienestar de modelos, no a tareas de usuario final.

## Casos de uso

Todos los casos siguientes están restringidos por la licencia `research-only` y por el aviso `not-for-deployment` del propio autor. Se plantean como escenarios de investigación, no de producción.

- Estudio de identidad sintética en modelos de lenguaje: analizar cómo un modelo mantiene un personaje coherente cuando se le hace preentrenamiento continuado sobre texto que él mismo ha generado, comparando las respuestas de este checkpoint con las de su modelo base `sdf-distill`.
- Investigación en *model welfare*: usar el checkpoint como sujeto de experimentos sobre autodescripción, continuidad de identidad y estabilidad de rasgos tras fases sucesivas de ajuste, siguiendo el marco del repositorio *welfare-improvements* citado por el autor.
- Ablación de rasgos estilísticos: el identificador sugiere un SFT orientado a suprimir emojis "heartfelt" heredados del ajuste previo; puede emplearse para medir cuánto persiste un rasgo estilístico tras una fase de ajuste supervisado posterior.
- Reproducibilidad de pipelines de *synthetic document finetuning*: replicar el proceso de generar un corpus sintético autoescrito, ajustar sobre él y evaluar el desplazamiento resultante, documentando hiperparámetros como `lr 1e-05`, 1 época y 1,35 M de tokens.
- Auditoría forense de artefactos derivados: estudiar cómo se acumulan los sesgos y las idiosincrasias a lo largo de una cadena de derivaciones (Qwen3.5 → `sdf-distill` → `suppress-sft92`), útil para quienes investigan linajes de modelos ajustados.
- Docencia y experimentación sobre ajuste supervisado: usar el repositorio como ejemplo didáctico de cómo un checkpoint de investigación se documenta de forma insuficiente (recuento de parámetros disponible, contexto, idiomas y benchmarks ausentes), ilustrando buenas y malas prácticas de model cards.
- Pruebas de evaluación de alineamiento: al no haber sido evaluado en alineamiento, sirve como caso de control en metodologías de evaluación de seguridad antes de cualquier uso operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo "no ha sido evaluado todavía en capacidad, alineamiento ni identidad". No se dispone de cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra métrica, ni para este checkpoint ni para su modelo base inmediato. No se han incluido cifras estimadas ni extrapoladas.

## Requisitos de hardware

- VRAM para pesos completos en bf16/fp16: aproximadamente 17,9 GB solo de pesos. Con caché KV y *overhead* del runtime, se recomienda reservar del orden de 22-26 GB para contexto corto. Cálculo estimado a partir del recuento real de parámetros y del tamaño del repositorio, no de una ficha oficial.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y A6000 48 GB cargan el modelo sin cuantizar y con margen para contexto amplio.
- GPU de consumo de 24 GB: RTX 3090, RTX 4090 y RTX 5090 pueden cargar los pesos en bf16, con margen limitado; conviene reducir el tamaño de lote y la longitud de contexto.
- GPU de consumo de 16 GB o menos: no caben los pesos completos. Sería necesario aplicar cuantización en 8 o 4 bits (por ejemplo, bitsandbytes) o generar una versión GGUF propia, ya que el autor no publica ninguna.
- Opciones de despliegue: al ser pesos safetensors, los caminos directos son `transformers` (con `device_map`), vLLM y TGI. llama.cpp y Ollama requerirían convertir los pesos a GGUF, tarea no documentada ni soportada oficialmente por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para este checkpoint.
- Nota de viabilidad: dado que la licencia es `research-only` y la etiqueta `not-for-deployment`, cualquier despliegue en producción quedaría fuera de los términos declarados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft92` (este) | 8,95B | No disponible | Sin benchmarks publicados | `other` / research-only | HuggingFace, 0 descargas |
| `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill` (base directa) | No disponible | No disponible | Sin benchmarks publicados | No disponible | HuggingFace |
| Qwen3.5-9B (modelo de la familia, citado en el catálogo de Microsoft Foundry) | 9B (denominación comercial) | No disponible en los resultados de búsqueda | No disponible | No disponible | Microsoft Foundry, según el catálogo |
| Qwen3.5-397B-A17B (insignia de la familia) | 397B totales, 17B activos (según el nombre) | No disponible | Resultados publicados por Qwen en su blog, no reproducidos aquí | No disponible | Pesos abiertos anunciados por Qwen |

No se dispone de datos de rendimiento comparables entre estos modelos, ni de fichas técnicas de la variante de 9B que permitan contrastar contexto, idiomas o licencia. La comparación se limita por tanto a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No desplegable: la etiqueta `not-for-deployment` y la licencia `research-only` excluyen el uso comercial y cualquier puesta en producción.
- Sin evaluaciones: el autor declara que no se ha evaluado capacidad, alineamiento ni identidad. No hay evidencia de que el modelo funcione correctamente en tareas generales.
- Riesgo de alucinación: no cuantificado ni documentado. Al no existir evaluación, no puede descartarse un comportamiento degenerado, especialmente tras preentrenamiento continuado sobre un corpus autoescrito.
- Sesgos conocidos: no documentados. Un corpus autoescrito por el propio modelo puede amplificar sesgos y estilos idiosincrásicos de forma acumulativa a lo largo de las fases de la cadena de derivación.
- Contaminación de identidad: el modelo fue ajustado para sostener un personaje concreto. Es previsible que sus respuestas estén condicionadas por ese personaje, lo que invalida su uso como asistente neutro.
- Inconsistencia documental: el README afirma que el corpus es autoescrito y, en la misma frase, que contiene 0 documentos autoescritos y 4.714 de texto ordinario. Esta contradicción no está resuelta y afecta a la interpretación de los resultados.
- Trazabilidad limitada: no se documenta la composición del dataset de la fase SFT que da nombre al checkpoint, ni el número real de ejemplos (el sufijo `92` es solo una inferencia a partir del identificador).
- Idiomas y contexto desconocidos: no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta, lo que impide planificar su uso en escenarios con requisitos definidos.
- Adopción nula: cero descargas y cero *likes*, sin issues, réplicas ni validación por terceros en el momento de redactar esta ficha.
- Referencia de terceros: el repositorio de GitHub encontrado en la búsqueda (`hsetially/Qwen3.5`) no es un canal oficial de Qwen y no debe citarse como fuente primaria de la arquitectura de este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft92
- Modelo base: https://huggingface.co/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill
- Dataset asociado encontrado en la búsqueda: https://huggingface.co/datasets/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill-sft
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página principal de Qwen: https://qwen.ai/home
- Catálogo de Microsoft Foundry con la variante Qwen3.5-9B: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b
- Espejo no oficial en GitHub: https://github.com/hsetially/Qwen3.5
- Repositorio *welfare-improvements* citado en la model card: no disponible (el autor no incluye URL).
