# AxeronAI/axeron-mf-42

## Resumen

axeron-mf-42 es un ajuste fino mediante LoRA (método declarado `finetune_lora`) del modelo mistralai/Mistral-7B-Instruct-v0.3, publicado por el usuario AxeronAI a través de la herramienta Axeron ModelForge (`library_name: axeron-modelforge`). Se trata de un transformer decoder-only de la familia Mistral con 7.248.023.552 parámetros totales, distribuido exclusivamente en formato safetensors dentro de un repositorio de 14,5 GB, coherente con pesos en fp16 del modelo completo fusionado.

El interés de esta ficha no está en el rendimiento del modelo, sino en su función como artefacto de validación de una herramienta de ajuste fino. La model card indica únicamente 25 pasos de entrenamiento y una pérdida final de 2,7721, sin especificar dataset, hiperparámetros de LoRA (rango, alpha, tasa de aprendizaje) ni evaluación posterior. Se desconoce la licencia, los idiomas soportados y el `pipeline_tag`; en el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes.

La búsqueda web realizada no ha devuelto ninguna fuente relevante sobre el modelo, su autor o la herramienta ModelForge: los resultados obtenidos tratan de tablas comparativas de tarjetas gráficas y de incidencias con cuentas de Instagram. Por tanto, toda la información técnica verificable procede de los metadatos de HuggingFace y de la model card, complementada con las características conocidas del modelo base, que se señalan explícitamente como heredadas y no verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Mistral (heredada del modelo base mistralai/Mistral-7B-Instruct-v0.3) |
| Parámetros totales | 7.248.023.552 (7,25 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del modelo. El modelo base declara 32.768 tokens; dato heredado, no confirmado para este ajuste |
| Tipos de cuantización | No disponible (el repositorio solo contiene safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible (el modelo base declara inglés, francés, alemán, español, italiano y portugués; no confirmado para este ajuste) |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors; repositorio de 14,5 GB, compatible con pesos fp16 del modelo completo fusionado |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Método de ajuste | finetune_lora (LoRA) |
| Pasos de entrenamiento | 25 |
| Pérdida final | 2,7721 |
| Herramienta de entrenamiento | Axeron ModelForge |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadato) | 2026-09-19 |

## Arquitectura y entrenamiento

No se publica información arquitectónica específica de axeron-mf-42 más allá de su condición de ajuste fino sobre Mistral-7B-Instruct-v0.3. Todas las características estructurales son, por tanto, heredadas del modelo base: transformer decoder-only con atención agrupada por consultas (GQA) de 8 cabezas KV sobre 32 cabezas de atención, atención de ventana deslizante y embeddings rotatorios (RoPE), con una dimensión oculta de 4096 y 32 capas. Estas cifras no aparecen en la información proporcionada y deben tratarse como datos del modelo base, no verificados en este repositorio.

Respecto al entrenamiento, la model card es mínima: método `finetune_lora`, modelo base Mistral-7B-Instruct-v0.3, 25 pasos de entrenamiento y pérdida final de 2,7721. No se indica el dataset utilizado, su composición o tamaño, ni el rango y alpha de LoRA, la tasa de aprendizaje, el tamaño de lote o la estrategia de precisión. Tampoco hay mención a RLHF, DPO u otras fases de alineación posteriores al ajuste supervisado. Un presupuesto de 25 pasos sobre un modelo de 7.250 millones de parámetros es extremadamente reducido y apunta a una ejecución de prueba o de validación del pipeline de ModelForge más que a un ajuste destinado a producción. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación u otras).

## Capacidades

No se ha publicado ninguna evaluación de capacidades específica de axeron-mf-42. La lista siguiente recoge las capacidades declaradas del modelo base, que el ajuste podría conservar o degradar; no están verificadas en este repositorio:

- Generación de texto conversacional multi-turno en formato instrucción.
- Razonamiento básico y resolución de problemas de matemáticas de nivel escolar y preuniversitario.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, C++, SQL, entre otros).
- Soporte de *function calling* mediante el formato de plantilla introducido en la versión v0.3 del modelo base.
- Uso como componente de agentes simples con encadenamiento de llamadas a herramientas, condicionado a la calidad del ajuste.
- Capacidad multilingüe limitada al conjunto declarado por el modelo base (inglés, francés, alemán, español, italiano y portugués).
- Sin capacidades de visión, audio o multimodalidad.
- Sin modo de razonamiento extendido (*thinking mode*) declarado.

Advertencia relevante: dado que el ajuste consta de 25 pasos y no se acompaña de evaluación, no hay evidencia de que estas capacidades se mantengan intactas; es plausible una degradación parcial respecto al modelo base.

## Casos de uso

- Validación de pipelines de ajuste fino: el caso de uso más realista es emplear axeron-mf-42 como artefacto de prueba para comprobar que Axeron ModelForge produce adaptadores LoRA cargables y pesos safetensors coherentes antes de lanzar entrenamientos mayores.
- Reproducción de plantillas de entrenamiento LoRA: sirve como ejemplo mínimo de configuración (modelo base, método, pasos y pérdida) para equipos que quieran replicar el flujo con sus propios datos.
- Punto de partida para experimentos internos de bajo riesgo: al derivar de Mistral-7B-Instruct-v0.3, puede cargarse con Transformers y utilizarse en cuadernos de pruebas donde no se requiera calidad de producción.
- Generación de texto asistida en prototipos: si el ajuste no ha degradado el modelo base, podría sustentar demos de chat con contexto largo (hasta 32.768 tokens según el modelo base) para documentos técnicos extensos.
- Extracción de información estructurada en pruebas de concepto: mediante *function calling* o plantillas de salida JSON, para validar esquemas antes de desplegar un modelo con garantías.
- Evaluación comparativa de ajustes finos: como referencia frente a otros LoRA del mismo modelo base para medir el efecto marginal de un presupuesto de entrenamiento muy corto.
- Docencia y formación: ilustra de forma compacta los metadatos que una model card debería incluir y los que aquí faltan (licencia, idiomas, dataset, evaluación).

No se recomienda su uso en atención al cliente, pipelines de CI/CD, generación de código en producción ni cualquier escenario con usuarios finales mientras no existan licencia declarada y resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta 25 pasos de entrenamiento y una pérdida final de 2,7721, valor que no es comparable entre configuraciones sin conocer el dataset, el tokenizador, la función de pérdida ni el tamaño de lote.

| Benchmark | axeron-mf-42 | Mistral-7B-Instruct-v0.3 | Referencias comparables |
|---|---|---|---|
| MMLU | No disponible | No disponible en esta ficha | No disponible |
| HumanEval | No disponible | No disponible en esta ficha | No disponible |
| GSM8K | No disponible | No disponible en esta ficha | No disponible |
| MT-Bench | No disponible | No disponible en esta ficha | No disponible |

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (7.248.023.552) y del tamaño del repositorio (14,5 GB en safetensors). No se dispone de mediciones publicadas de latencia ni de throughput.

- VRAM en fp16: en torno a 14,5 GB solo para los pesos, más activaciones y caché KV; con contexto largo conviene reservar 18-24 GB. GPU adecuadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100, L40S, A6000.
- VRAM en int8: aproximadamente 8 GB para los pesos; total estimado de 10-14 GB. GPU adecuadas: RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), A10, L4.
- VRAM en int4: aproximadamente 4,5-5 GB para los pesos; total estimado de 6-9 GB. Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3080 10/12 GB; en tarjetas de 8 GB requeriría cuantizaciones agresivas y contexto reducido.
- Caché KV: con la configuración del modelo base (32 capas, 8 cabezas KV, dimensión de cabeza 128), la caché en fp16 consume del orden de 128 KiB por token, aproximadamente 4 GiB a 32.768 tokens. Este consumo es adicional a la VRAM de los pesos y crece de forma lineal con el contexto.
- Opciones de despliegue: Transformers (carga directa de safetensors), vLLM, TGI y SGLang para servido en GPU; para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, ya que el repositorio no incluye ese formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos publicados | Estado |
|---|---|---|---|---|---|
| axeron-mf-42 | 7,25 B | No disponible en su ficha (base: 32.768) | No disponible | safetensors | 0 descargas, 0 likes |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 (según su ficha pública) | safetensors, GGUF (versiones comunitarias) | Ampliamente distribuido y evaluado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Ampliamente distribuido |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente distribuido |

Los datos de los tres modelos de referencia proceden del conocimiento general sobre sus fichas públicas y conviene verificarlos antes de tomar decisiones de producción. No es posible comparar rendimiento porque axeron-mf-42 no publica ninguna métrica.

## Limitaciones y advertencias

- Presupuesto de entrenamiento marginal: 25 pasos y pérdida final de 2,7721 indican un ajuste muy superficial; el modelo puede comportarse de forma casi idéntica al base o ligeramente degradada, sin que exista evaluación que lo confirme.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base Mistral-7B-Instruct-v0.3 se distribuye bajo Apache 2.0, la ausencia de términos explícitos en este derivado introduce incertidumbre legal para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Dataset desconocido: sin información sobre los datos de entrenamiento no es posible auditar sesgos, licencias del corpus ni riesgo de contaminación con datos de evaluación.
- Riesgo de sobreajuste: un número tan bajo de pasos sobre un dataset presumiblemente pequeño puede producir sobreajuste y degradar la instrucción general.
- Alucinación: inherente a los modelos de 7.000 millones de parámetros; no se ha aplicado ninguna mitigación documentada ni evaluación de veracidad.
- Sesgos: heredados del modelo base y del corpus de ajuste no declarado; no evaluados.
- Idiomas no confirmados: aunque el modelo base declara seis idiomas, no hay garantía de que este ajuste los conserve; el rendimiento en castellano es desconocido.
- Limitaciones de contexto: la ventana efectiva depende de la configuración del modelo base y no está validada para este repositorio; contextos muy largos incrementan la VRAM de forma notable.
- Formato único: solo safetensors; el despliegue en llama.cpp, Ollama u otros motores de cuantización ligera requiere conversión manual.
- Sin validación comunitaria: 0 descargas y 0 likes implican ausencia de pruebas independientes, informes de errores o reproducciones por terceros.
- Sin información de la herramienta: no se han encontrado fuentes públicas sobre Axeron ModelForge que permitan auditar cómo se generan los pesos ni qué garantías ofrece el proceso.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/AxeronAI/axeron-mf-42
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Artículo técnico del modelo base (Mistral 7B): https://arxiv.org/abs/2310.06825
- Resultados de la búsqueda web: no se ha encontrado ninguna fuente relevante sobre el modelo, el autor o la herramienta Axeron ModelForge; los resultados obtenidos no guardan relación con el objeto de esta ficha.
