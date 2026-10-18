# likelytobelaura/osteo-glimmer-lora

## Resumen

`osteo-glimmer-lora` es un conjunto de adaptadores LoRA publicados por el usuario likelytobelaura sobre el modelo de lenguaje Muse-Glimmer-30B. No es un modelo autónomo: cada carpeta contiene deltas de bajo rango de aproximadamente 840 MB que deben cargarse junto con los pesos completos del modelo base mediante PEFT. Su función es rellenar valores retenidos (held-out) en el dataset público multi-ómico de osteosarcoma de Sid Sijbrandij, que cubre scRNA-seq, CITE-seq, RNA bulk, TCR, proteómica DIA y Olink, inmunofluorescencia multiplex, Xenium, WGS somático, metagenómica, citometría de flujo, HLA y fusiones génicas.

El modelo resuelve un problema concreto de imputación sobre datos biomédicos serializados: recibe un prompt con los elementos ausentes numerados y devuelve un objeto JSON que asigna a cada número su valor predicho. La receta de entrenamiento es explícita (LoRA r=32, alpha=64, dropout 0, learning rate 1e-4 con schedule coseno, bf16, longitud máxima 6144 tokens, loss solo sobre la completación, seed 42, 8 GPU H200) y el repositorio de código asociado incluye el inventario del dataset, los scripts de construcción y las puntuaciones de referencia.

Su relevancia es doble: por un lado, ejemplifica el uso de adaptadores LoRA sobre un LLM grande para una tarea científica muy específica; por otro, publica tanto los adaptadores como el particionado leave-one-data-type-out, lo que permite reproducir la evaluación. Conviene señalar que la variante entrenada con todos los datos (`sid_full`) se detuvo al 50 % del plan previsto (739 de 1 478 pasos), por lo que no es una ejecución terminada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un modelo de lenguaje decoder-only denominado Muse-Glimmer-30B. Los módulos objetivo (q/k/v/o/gate/up/down) corresponden a atención y a una MLP con compuerta tipo SwiGLU (inferido de la receta, no confirmado en la información) |
| Parametros totales | No disponible para los adaptadores. El modelo base se denomina Muse-Glimmer-30B (~30 000 millones, según nomenclatura; no verificado en la información) |
| Parametros activos | No aplica: no se describe una arquitectura MoE |
| Longitud de contexto | No disponible. El entrenamiento usó `max_length = 6144` tokens |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen en safetensors; el ejemplo de uso carga el modelo base en `bfloat16` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA PEFT, ~840 MB por carpeta; requieren el modelo base) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango, no un modelo completo. La configuración declarada es LoRA con r=32, alpha=64 y dropout 0, aplicada a las proyecciones q, k, v, o, gate, up y down del modelo de lenguaje. El entrenamiento usó learning rate 1e-4 con schedule coseno, precisión bf16, longitud máxima de 6144 tokens, pérdida calculada únicamente sobre la completación (completion-only loss) y semilla 42, sobre 8 GPU H200. El conjunto de entrenamiento consta de 11 824 filas. El script es `scripts/lomo_train.py` del repositorio de GitHub.

La tarea se formula como generación de texto estructurado: los prompts siguen el formato de `03_baseline_prompts/baseline.jsonl` y el modelo debe responder con un objeto JSON que mapea el número de cada elemento ausente a su valor predicho. Se publican tres tipos de ejecución: `sid_full` (todas las filas, detenida en el paso 739 de 1 478, equivalente a 0,5 epoch y con el learning rate a mitad de schedule), `lomo740_all` (todas las filas, 740 pasos completados, contrapartida terminada de `sid_full`) y las carpetas `lomo740_<type>`, entrenadas excluyendo un tipo de dato y evaluadas únicamente sobre ese tipo retenido. La carpeta `checkpoint-739/` contiene los mismos pesos que `sid_full` más el estado de optimizador, scheduler y RNG para reanudar.

No se documentan innovaciones de arquitectura propias (atención lineal, decodificación especulativa, mezcla de expertos) ni detalles sobre la composición exacta del corpus más allá del inventario de modalidades. Tampoco se indica si hubo RLHF, DPO u otra fase de alineamiento posterior al ajuste supervisado.

## Capacidades

- Imputación de valores ausentes en datos multi-ómicos de osteosarcoma: scRNA-seq, CITE-seq, RNA bulk, TCR, proteómica DIA y Olink, inmunofluorescencia multiplex, Xenium, WGS somático, metagenómica, citometría de flujo, HLA y fusiones génicas.
- Generación de salida estructurada: responde con un objeto JSON que asigna a cada elemento ausente su valor predicho, lo que facilita el consumo programático.
- Especialización por modalidad: las variantes `lomo740_<type>` están ajustadas para predecir sobre un tipo de dato concreto excluido del entrenamiento.
- Razonamiento sobre datos serializados en texto (prompts en formato JSONL); no se documenta procesamiento nativo de imágenes ni de matrices binarias.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso con planificación.
- No se documenta capacidad multilingüe; el idioma de los prompts y de las respuestas no se especifica.
- No se documenta modo de razonamiento explícito (thinking), ni entrada de audio o visión.

## Casos de uso

- Imputación exploratoria en cohortes de osteosarcoma: dado un perfil con modalidades incompletas, el adaptador devuelve valores plausibles para los elementos ausentes, que el investigador puede usar como hipótesis a validar experimentalmente y no como dato definitivo.
- Evaluación comparativa de pipelines de imputación: las variantes `lomo740_<type>` permiten medir el rendimiento del modelo frente a baselines sobre una modalidad completamente retenida, usando el mismo protocolo y el mismo conjunto de prompts.
- Armonización de modalidades heterogéneas: al cubrir proteómica Olink, DIA, CITE-seq y transcriptómica en un único espacio de prompt, el adaptador sirve para prototipar la reconciliación de fuentes dispares antes de invertir en un pipeline dedicado.
- Reproducción de experimentos: con `build_golden.py`, `recon.py` y los constructores de prompts del repositorio se pueden regenerar los ficheros de entrenamiento y evaluación a partir del bucket público, lo que permite replicar las puntuaciones publicadas.
- Investigación metodológica sobre LLM en datos biomédicos: el par (prompt JSONL, respuesta JSON numerada) es un banco de pruebas controlado para estudiar calibración, alucinación numérica y sensibilidad al formato en modelos grandes.
- Prototipado de asistentes de análisis que devuelven JSON: la interfaz de salida encaja en herramientas internas que necesitan un contrato de datos estable para integrar predicciones en un notebook o en un pipeline de validación.
- Docencia y formación en bioinformática: el repositorio incluye inventario, baselines y receta completa, lo que lo hace utilizable como caso práctico de ajuste fino con PEFT sobre datos ómicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las puntuaciones por ejecución en la sección 6 de `INVENTORY.md` del repositorio de GitHub, pero no reproduce cifras concretas (ni MMLU, ni HumanEval, ni métricas de imputación como RMSE, MAE o correlación) en el texto proporcionado.

## Requisitos de hardware

- Pesos del modelo base en bf16: aproximadamente 60 GB para 30 000 millones de parámetros (estimación a partir de la nomenclatura, no confirmada). Requiere una GPU de 80 GB (H100 o A100 80 GB) o reparto en varias GPU para contexto corto.
- Entrenamiento documentado: 8 GPU H200, longitud máxima 6144 y bf16.
- Cuantización a 8 bits: entorno a 30 GB de pesos, viable en una A100 80 GB o en 2 GPU de 40 GB.
- Cuantización a 4 bits: aproximadamente 16-18 GB, lo que Permitiría ejecución en una RTX 4090 o RTX 3090 de 24 GB con contexto reducido (estimación, no verificada).
- Adaptadores: ~840 MB adicionales en memoria o en disco por cada carpeta; se cargan sobre el modelo base y no lo sustituyen.
- Despliegue documentado: `transformers` + `peft`, con `PeftModel.from_pretrained` y `subfolder` para seleccionar la variante. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp; dado que los adaptadores están en formato PEFT, su uso en llama.cpp exigiría fusionarlos con el base y convertirlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores o modelos de terceros comparables con métricas publicadas. La comparación posible se limita a las variantes internas del propio repositorio:

| Variante | Filas de entrenamiento | Pasos | Estado | Evaluación |
|---|---|---|---|---|
| `sid_full` | 11 824 (todas) | 739 de 1 478 (0,5 epoch) | Incompleta, learning rate a mitad de schedule | No especificada en la información |
| `lomo740_all` | 11 824 (todas) | 740 | Completada | Referencia para las ejecuciones hold-out |
| `lomo740_<type>` | Todas excepto un tipo de dato | 740 | Completada | Solo sobre el tipo retenido |

## Limitaciones y advertencias

- Entrenado con los datos de salud de un único paciente, publicados de forma abierta por Sid Sijbrandij. El autor indica explícitamente que es para uso en investigación y no para decisiones clínicas.
- Posible conflicto entre la licencia y el uso previsto: el artefacto se distribuye bajo Apache 2.0, que permite uso comercial, mientras que la model card restringe el uso a investigación. Conviene aclarar este punto antes de cualquier despliegue en producción.
- Riesgo de alucinación numérica: la tarea consiste en predecir valores ausentes y el modelo puede generar cifras verosímiles pero incorrectas sin señal de incertidumbre. No se documenta calibración ni intervalos de confianza.
- `sid_full` no es una ejecución terminada (739 de 1 478 pasos, 0,5 epoch), por lo que sus resultados no son directamente comparables con `lomo740_all`.
- Cada adaptador `lomo740_<type>` está pensado para el tipo de dato retenido; usarlo sobre otras modalidades no está validado.
- La longitud máxima de 6144 tokens limita el tamaño del prompt y, por tanto, el número de elementos que se pueden imputar en una sola llamada.
- No es un modelo autónomo: requiere descargar Muse-Glimmer-30B por separado, y la información no incluye un identificador de repositorio para el base.
- No hay documentación sobre sesgos, cobertura lingüística ni evaluación de robustez frente a formatos de prompt distintos del utilizado en entrenamiento.
- Adopción comunitaria nula en la fecha de consulta (0 descargas, 0 likes), sin validación externa conocida.
- El repositorio ocupa 6,7 GB e incluye varias carpetas de adaptadores y un checkpoint con estado de optimizador; hay que seleccionar el `subfolder` correcto para evitar cargas innecesarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/likelytobelaura/osteo-glimmer-lora
- Repositorio de código, inventario, baselines y puntuaciones: https://github.com/likelytobelaura/biohack
- Inventario del dataset y estado de ejecuciones: `INVENTORY.md` en el repositorio anterior
- Dataset de origen (bucket público): `s3://sid-sijbrandij-osteosarc-dataset`
- Prompts de referencia: `03_baseline_prompts/baseline.jsonl` en el repositorio
- Script de entrenamiento: `scripts/lomo_train.py` en el repositorio
- Scripts de reconstrucción de datos: `build_golden.py` y `recon.py` en el repositorio
- Licencia del modelo base y de los adaptadores: `LICENSE` en el repositorio de HuggingFace
- Modelo base Muse-Glimmer-30B: no se proporciona identificador ni enlace en la información disponible
- Paper, blog o demo: no disponible
