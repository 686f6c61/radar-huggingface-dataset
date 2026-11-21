# onocloud/onoai-flint-2.5-pro-GGUF

## Resumen

OnoAI Flint 2.5 Pro (edición GGUF) es la versión cuantizada del modelo OnoAI Flint 2.5 Pro, desarrollado por OnoCloud y OnoAI Engineering Labs. Se distribuye únicamente en formato GGUF con cuantización Q4_K_M, lo que lo orienta a inferencia local en hardware de consumo mediante Ollama. El repositorio contiene un único archivo de pesos de aproximadamente 1,93 GB, coherente con un modelo de 3.085.938.688 parámetros (~3,09 mil millones).

El modelo se presenta como un generador de texto conversacional con etiqueta de idioma árabe entre sus tags, aunque la model card no detalla la composición del corpus ni la cobertura multilingüe real. La licencia propietaria OnoCloud Sovereign Enterprise Restrictive License (OSRL-1.0) condiciona fuertemente su uso comercial, por lo que debe revisarse el archivo LICENSE antes de cualquier despliegue en producción.

La información pública disponible es muy limitada: no se publican detalles de arquitectura, contexto, datos de entrenamiento ni resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.085.938.688 (~3,09 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | no disponible (tag "arabic" en el repo; cobertura no documentada) |
| Licencia | OnoCloud Sovereign Enterprise Restrictive License (OSRL-1.0), etiquetada como "other" |
| Formato de pesos | GGUF (archivo onoai-flint-2.5-pro.Q4_K_M.gguf, ~1,93 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de transformer, uso de atención lineal, mezcla de expertos u otras variantes). Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. El único dato estructural verificable es el recuento de parámetros (3.085.938.688) y el hecho de que la distribución se realiza en formato GGUF cuantizado a Q4_K_M, lo que sugiere un proceso de conversión desde pesos originales no publicados en este repositorio.

La model card se limita a indicar el comando de ejecución en Ollama y a describir la cuantización como "high performance, low VRAM". No hay información sobre innovaciones técnicas, decodificación especulativa, ventanas de contexto extendidas ni estrategias de alineación.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y la etiqueta "conversational" aparece en los tags del repositorio.
- Ejecución local vía Ollama: el autor proporciona el comando `ollama run hf.co/onocloud/onoai-flint-2.5-pro-GGUF`.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integración con infraestructura de inferencia compatible con la API de Hugging Face.
- Posible orientación al árabe: el tag "arabic" está presente, aunque no se documenta el nivel de competencia ni el resto de idiomas cubiertos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible; el pipeline es exclusivamente de texto.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistente conversacional local en árabe: dado el tag "arabic" y el tamaño reducido (~3,09 mil millones de parámetros en Q4_K_M), el modelo puede desplegarse en un portátil para prototipos de chat en ese idioma, siempre que se valide empíricamente la calidad antes de usarlo con usuarios reales.
- Pruebas de concepto en entornos sin conectividad: al ejecutarse con Ollama sobre un único archivo GGUF de ~1,93 GB, permite experimentar con generación de texto en máquinas sin GPU dedicada o con GPU de gama de entrada.
- Evaluación de licencias propietarias: útil para equipos que necesiten analizar las implicaciones de la OSRL-1.0 antes de adoptar modelos con licencias restrictivas en productos comerciales.
- Generación de texto de bajo coste en pipelines internos: para tareas de reescritura, resumen o clasificación aproximada donde la latencia y el coste por token importan más que la precisión máxima, sujeto a validación previa.
- Integración en flujos compatibles con la API de endpoints: el tag "endpoints_compatible" permite probar el modelo en infraestructuras de inferencia estándar sin reescribir el cliente.
- Base para fine-tuning experimental: al ser un modelo pequeño, puede servir como punto de partida para ajustes específicos de dominio, aunque la licencia OSRL-1.0 puede restringir la redistribución de derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa ~1,93 GB, por lo que la inferencia completa cabe holgadamente en GPUs con 4 GB o más de VRAM, dejando margen para el contexto y el runtime.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo; también es viable en CPU gracias al tamaño reducido.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas actuales e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: Ollama (método documentado por el autor), llama.cpp y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían los pesos originales no publicados en este repositorio.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| OnoAI Flint 2.5 Pro GGUF | ~3,09 mil millones | no disponible | OSRL-1.0 (propietaria) | GGUF Q4_K_M | Hugging Face |
| Qwen2.5-3B-Instruct | ~3,09 mil millones | 32.768 tokens (según model card pública) | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Llama 3.2 3B Instruct | ~3,21 mil millones | 131.072 tokens (según model card pública) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |
| Phi-3.5-mini-instruct | ~3,82 mil millones | 131.072 tokens (según model card pública) | MIT | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se limita a parámetros, contexto y licencia porque no hay benchmarks publicados de OnoAI Flint 2.5 Pro que permitan contrastar calidad. Los tres modelos alternativos citados cuentan con documentación técnica detallada y licencias permisivas o comunitarias, a diferencia de la OSRL-1.0.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se publican arquitectura, contexto, datos de entrenamiento ni evaluación, lo que impide estimar su calidad con rigor.
- Licencia restrictiva: la OnoCloud Sovereign Enterprise Restrictive License (OSRL-1.0) es propietaria y debe revisarse el archivo LICENSE antes de cualquier uso comercial; el uso, redistribución y creación de derivados pueden estar limitados.
- Riesgo de alucinación: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la fiabilidad factual del modelo; en un modelo de ~3 mil millones de parámetros el riesgo es estructuralmente alto.
- Cobertura idiomática incierta: el tag "arabic" sugiere orientación a ese idioma, pero no se documenta el resto de idiomas ni la calidad en castellano.
- Contexto desconocido: la ausencia de datos sobre la ventana de contexto impide planificar casos de uso con documentos largos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo.
- Única cuantización disponible: solo se publica Q4_K_M, lo que limita el ajuste fino entre calidad y memoria.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó en noviembre de 2026 en una ventana de pocos minutos, sin historial posterior de soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onocloud/onoai-flint-2.5-pro-GGUF
- Comando de ejecución Ollama: `ollama run hf.co/onocloud/onoai-flint-2.5-pro-GGUF`
- Licencia: archivo LICENSE del repositorio (OSRL-1.0)
- Paper, blog, repositorio de código o demo: no disponible
