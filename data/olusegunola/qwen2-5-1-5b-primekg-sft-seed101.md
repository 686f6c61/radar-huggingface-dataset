# olusegunola/qwen2.5-1.5b-primekg-sft-seed101

## Resumen

`olusegunola/qwen2.5-1.5b-primekg-sft-seed101` es un checkpoint publicado en HuggingFace por el usuario `olusegunola` bajo la librería `transformers`. El repositorio no incluye model card real: el README es la plantilla automática de HuggingFace, con todos los campos marcados como `[More Information Needed]`. Por tanto, no hay información declarada por el autor sobre arquitectura, datos de entrenamiento, licencia, idiomas ni uso previsto. El repositorio registra 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que se trata de una publicación reciente, automatizada o posiblemente incompleta (sin pesos subidos o con pesos de tamaño despreciable según la métrica del Hub).

El único contenido informativo es el propio identificador del modelo, que sigue la convención `-<dataset>-<metodo>-<semilla>`: apunta a un ajuste supervisado (SFT) sobre `Qwen2.5-1.5B` usando como fuente de datos PrimeKG, un grafo de conocimiento de medicina de precisión, con semilla 101. Esta lectura es una inferencia razonable a partir del nombre, no un dato confirmado en la model card. La etiqueta `arxiv:1910.09700` que aparece en el repositorio corresponde a Lacoste et al. (calculadora de impacto de carbono) y procede de la plantilla automática, no de una referencia técnica del modelo.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de checkpoint biomédico sin trazabilidad (útil como advertencia metodológica); por otro, sitúa el interés creciente en ajustes pequeños (1,5 B) sobre grafos de conocimiento biomédicos para extracción de relaciones, normalización de entidades y generación de hipótesis, tareas donde el coste de despliegue local importa más que el rendimiento bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el identificador indica una base Qwen2.5-1.5B (transformer decoder-only con Grouped Query Attention), no confirmado por el autor |
| Parametros totales | no disponible; ~1,5 B si se confirma la base Qwen2.5-1.5B, sin verificar |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible en la model card (la familia Qwen2.5-1.5B documenta 32 768 tokens nativos y extensión a 131 072 con YaRN; dato del modelo base, no de este checkpoint) |
| Tipos de cuantizacion | no disponible; el repositorio solo declara pesos `safetensors`, sin versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se puede asumir la licencia del modelo base) |
| Formato de pesos | safetensors (según etiquetas del repositorio y `library_name: transformers`) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18, actualizado el mismo día (3 segundos después) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura efectiva del checkpoint. La etiqueta `library_name: transformers` y el formato `safetensors` son compatibles con cualquier transformer decoder-only cargado mediante `AutoModelForCausalLM`, pero no permiten determinar capas, dimensión oculta, número de cabezas ni si se congelaron capas durante el ajuste. Tampoco se documentan hiperparámetros de entrenamiento (régimen de precisión, tasa de aprendizaje, épocas, tamaño de lote), ni si hubo RLHF, DPO u otra fase de alineamiento posterior al SFT.

El nombre del repositorio sugiere un ajuste supervisado sobre ejemplos derivados de PrimeKG, un grafo de conocimiento orientado a medicina de precisión (Chandra et al., *Scientific Data*, 2023) que integra escalas biológicas como genes, proteínas, fármacos, enfermedades y exposiciones. El sufijo `seed101` indica que probablemente forma parte de un barrido de semillas, lo que implicaría la existencia de checkpoints hermanos con otras semillas; sin scripts de entrenamiento ni configuración publicados, la reproducibilidad es nula. No se especifica la plantilla de conversación utilizada, un dato crítico en SFT porque determina el formato de prompt en inferencia.

## Capacidades

No hay ninguna capacidad declarada por el autor en la model card. A continuación se listan capacidades esperables por la naturaleza inferida del checkpoint, marcadas explícitamente como no verificadas:

- Generación de texto en dominio biomédico y de medicina de precisión, si el SFT sobre PrimeKG se materializó como se deduce del nombre (no verificado).
- Extracción de relaciones y tripletas (fármaco–diana, gen–enfermedad, exposición–enfermedad) como tarea de conversión de texto a estructura.
- Razonamiento multi-paso limitado, acotado por el tamaño de 1,5 B parámetros de la base supuesta.
- Soporte de tool calling / function calling: no disponible; dependería de si el ajuste preservó el formato de herramientas de Qwen2.5, algo no documentado.
- Capacidades de agente: no disponibles ni declaradas.
- Capacidades multilingües: no disponibles. La model card no enumera idiomas y no se puede asumir el perfil multilingüe de Qwen2.5 tras un SFT sobre un grafo mayoritariamente en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el tamaño y el nombre no sugieren ninguna de ellas.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el tamaño y el dominio inferidos, no casos validados por el autor. Requieren una evaluación propia antes de cualquier uso real.

- Extracción de tripletas biomédicas a escala: el modelo se usaría para convertir resúmenes de PubMed en relaciones estructuradas (por ejemplo, `fármaco X – inhibe – diana Y`) que alimenten un grafo propio; un modelo de 1,5 B permite procesar corpus grandes con coste bajo por documento.
- Normalización de entidades a ontologías: mapear menciones libres de texto a identificadores MeSH, MONDO, HGNC o DrugBank, aprovechando el vocabulario de PrimeKG como señal de entrenamiento.
- Preanotación para curación manual: generar borradores de relaciones que un curador humano revisa en una interfaz tipo INCEpTION o similar; el modelo acelera la anotación, pero no la sustituye, dado el riesgo de alucinación.
- Generación de hipótesis de reutilización de fármacos (*drug repurposing*): a partir de caminos del grafo, pedir al modelo que verbalice hipótesis mecanísticas para priorización experimental temprana, siempre con validación contra fuentes primarias.
- Enriquecimiento de historias clínicas estructuradas: extracción de entidades y relaciones de notas clínicas para poblar un almacén de datos, con revisión obligatoria y sin uso diagnóstico directo.
- Prototipado en entornos con recursos limitados: al tratarse presumiblemente de un modelo de 1,5 B, puede ejecutarse en una GPU de consumo o incluso en CPU, lo que lo hace útil para pruebas internas antes de escalar a modelos mayores.
- Evaluación comparativa de metodologías SFT: al incluir una semilla en el nombre, sirve como punto de comparación en experimentos de reproducibilidad sobre ajuste supervisado en dominio biomédico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye sección de evaluación, no reporta MMLU, GSM8K, HumanEval, PubMedQA, MedQA ni ninguna métrica de dominio, y no ofrece comparaciones con otros checkpoints. Cualquier cifra que se atribuya a este modelo sin una evaluación propia sería especulativa.

## Requisitos de hardware

Las estimaciones siguientes asumen un transformer denso de ~1,5 B parámetros (base Qwen2.5-1.5B), supuesto no confirmado por el repositorio. Además, el tamaño de 0,0 GB del repo hace dudar de que los pesos estén realmente disponibles para descarga.

- VRAM para los pesos: ~3,1 GB en fp16/bf16, ~1,6 GB en int8 y ~1,0–1,2 GB en cuantización de 4 bits.
- VRAM total en inferencia: añadir el cache KV. En fp16 y con contexto de 32 768 tokens, el cache ronda 1 GB para una configuración típica de 28 capas con GQA; en contextos cortos (2 048–4 096 tokens) el consumo es despreciable.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En 4 bits es viable incluso en GPUs de 6–8 GB con contextos moderados.
- GPU de datacenter: A100, H100, L40S o similares quedan sobredimensionadas para un solo proceso, pero permiten batchear cientos de peticiones concurrentes con vLLM o TGI.
- CPU y edge: ejecutable en CPU vía llama.cpp u Ollama con cuantización de 4 bits; también es candidato a despliegue en dispositivos con 4–8 GB de RAM.
- Opciones de despliegue: `transformers` (formato declarado), vLLM y TGI para fp16/bf16 con throughput alto, llama.cpp y Ollama para cuantizaciones GGUF (habría que generarlas, no están publicadas).
- Latencia y throughput: no disponible. No hay mediciones publicadas ni hardware de referencia declarado.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus respectivas model cards públicas y no se han verificado en el contexto de esta ficha. Para el modelo objeto de la ficha, la mayoría de campos quedan sin confirmar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `olusegunola/qwen2.5-1.5b-primekg-sft-seed101` | no disponible (~1,5 B inferidos) | no disponible | no disponible | Repo de 0,0 GB, 0 descargas | Sin model card, sin evaluación |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens (131 072 con YaRN) | Apache 2.0 | Ampliamente disponible, con GGUF y cuantizaciones | Base probable del checkpoint; licencia no heredable automáticamente |
| BioMistral-7B | 7 B | 8 192 tokens (según Mistral base) | Apache 2.0 | Disponible en HuggingFace | Alternativa biomédica de mayor tamaño y coste |
| Llama-3.2-1B-Instruct | 1,24 B | 128 000 tokens | Llama 3.2 Community License | Disponible, con cuantizaciones | Alternativa generalista de tamaño comparable, no especializada en biomedicina |

## Limitaciones y advertencias

- Model card vacía: no hay información sobre sesgos, riesgos, uso previsto, uso fuera de alcance ni recomendaciones del autor. Cualquier despliegue parte de cero en cuanto a evaluación de seguridad.
- Riesgo de alucinación elevado en dominio biomédico: un modelo de 1,5 B ajustado sobre un grafo de conocimiento puede generar relaciones plausibles pero inexistentes. No debe usarse para decisiones clínicas ni diagnósticas sin verificación contra fuentes primarias.
- Licencia no declarada: no se puede asumir Apache 2.0 ni ninguna otra licencia. El uso comercial queda en un limbo legal hasta que el autor lo aclare, especialmente si el ajuste incorporó datos con restricciones.
- Repositorio de 0,0 GB: es posible que los pesos no estén subidos o que el repositorio contenga únicamente configuración. Conviene verificar la lista de ficheros antes de intentar la descarga.
- Sin validación comunitaria: 0 descargas y 0 likes implican ausencia de pruebas independientes, de informes de errores y de comparaciones reproducibles.
- Sesgos heredados de la fuente de datos: PrimeKG es un grafo curado con foco en medicina de precisión, con cobertura desigual entre poblaciones, enfermedades raras y literatura no anglosajona. Un SFT sobre él puede reproducir esa sobrerrepresentación.
- Contexto limitado si se confirma la base: 32 768 tokens es suficiente para documentos científicos individuales, pero insuficiente para razonamiento sobre corpus extensos sin técnicas de recuperación.
- Idiomas no documentados: no se puede garantizar un rendimiento aceptable en castellano; el SFT sobre un grafo mayoritariamente en inglés puede haber degradado capacidades multilingües del modelo base.
- Reproducibilidad nula: no se publican scripts, hiperparámetros ni la plantilla de prompt. La semilla del nombre no es suficiente para replicar el entrenamiento.
- Ausencia de formato de conversación documentado: sin conocer la plantilla de chat usada en el SFT, es fácil obtener respuestas degradadas al cargar el modelo con un `chat_template` incorrecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-sft-seed101
- Referencia del paper etiquetado en el repositorio (Lacoste et al., calculadora de impacto de carbono, procedente de la plantilla automática): https://arxiv.org/abs/1910.09700
- Qwen2.5-1.5B (modelo base probable, no citado en la model card): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Qwen2.5-1.5B-Instruct (modelo base probable de la variante instruct, no citado): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- PrimeKG (dataset inferido a partir del nombre del repositorio, no citado en la model card): https://zitniklab.hms.harvard.edu/projects/PrimeKG/
- Repositorio de PrimeKG en GitHub (referencia del dataset, no citado): https://github.com/mims-harvard/PrimeKG
- Resultados de la búsqueda web proporcionada: no contienen información relevante sobre el modelo; corresponden a páginas de descarga de Google Play.
