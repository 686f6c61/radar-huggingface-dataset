# mradermacher/Glistening-Gem-31B-v2.2-i1-GGUF

## Resumen

Glistening-Gem-31B-v2.2-i1-GGUF es la versión cuantizada en formato GGUF del modelo Glistening-Gem-31B-v2.2, publicada por el usuario mradermacher. Se trata de un merge (fusión) de modelos realizado con mergekit, cuyo modelo base es sophosympatheia/Glistening-Gem-31B-v2.2. El repositorio contiene exclusivamente pesos cuantizados en GGUF con la técnica i1 (imatrix), pensados para su uso con llama.cpp y derivados, no los pesos originales en safetensors.

El modelo subyacente tiene 30.697.345.596 parámetros (aproximadamente 30,7 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamaño. La model card del cuantizador lo etiqueta como modelo de visión, aunque no se especifican detalles sobre el componente multimodal ni sobre el contexto soportado. La información disponible sobre arquitectura interna, datos de entrenamiento y capacidades es muy limitada: la model card se limita a describir el proceso de cuantización y a listar los ficheros generados.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~31B en hardware de consumo mediante cuantizaciones que van desde 7,8 GB (IQ1_M) hasta 25,3 GB (Q6_K), con la opción intermedia Q4_K_M de 18,8 GB recomendada por el autor para un equilibrio entre velocidad y calidad. No obstante, la ausencia de benchmarks publicados y de documentación técnica detallada obliga a tratar sus capacidades con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base es un merge con mergekit; arquitectura del transformer subyacente no especificada) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (además de fichero imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el repo del modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. La model card del cuantizador indica que el modelo base (sophosympatheia/Glistening-Gem-31B-v2.2) es un merge realizado con mergekit, una herramienta de fusión de pesos de modelos. No se especifica qué modelos se fusionaron, con qué método (SLERP, TIES, DARE, etc.) ni los hiperparámetros empleados. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La única innovación técnica documentada es el propio proceso de cuantización: mradermacher emplea cuantizaciones i1 (imatrix) generadas con un fichero imatrix propio, que según el autor producen mejor calidad que las cuantizaciones estáticas equivalentes en tamaño. La model card incluye una referencia a un gráfico comparativo de perplejidad de ikawrakow, pero no aporta métricas concretas para este modelo. También se menciona que los ficheros mmproj (para el componente de visión) se encuentran en el repositorio estático asociado, no en este.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" sugiere un ajuste orientado a diálogo, aunque no se detalla el formato de prompt.
- Capacidad de visión: la model card afirma explícitamente que es un modelo de visión, con ficheros mmproj disponibles en el repositorio estático. No se especifican resolución, tareas soportadas ni calidad.
- Multilingüismo: únicamente se declara inglés ("en"); no hay evidencia de soporte para otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con la cuantización i1-Q4_K_M (18,8 GB) el modelo puede cargarse en una GPU de 24 GB (RTX 3090/4090) o repartirse entre GPU y CPU con llama.cpp, permitiendo experimentación con un modelo de ~31B sin infraestructura de servidor.
- Prototipado de asistentes conversacionales en inglés: la etiqueta "conversational" y el tamaño del modelo lo hacen adecuado para generar respuestas de chat en entornos de prueba donde no se requiere latencia de producción.
- Investigación sobre fusiones de modelos: al ser un merge con mergekit, sirve para estudiar el comportamiento de modelos fusionados y comparar la calidad de distintas cuantizaciones i1 frente a las estáticas del repositorio hermano.
- Evaluación de capacidades multimodales en local: si se descargan los ficheros mmproj del repositorio estático, puede probarse la componente de visión en tareas de descripción de imágenes, aunque sin garantías documentadas de calidad.
- Generación de texto sin conexión en entornos aislados: el formato GGUF permite ejecutar el modelo con llama.cpp en máquinas sin acceso a internet, útil para laboratorios con requisitos de confidencialidad.
- Comparación de cuantizaciones para pipelines de inferencia: el repositorio ofrece 12 variantes de cuantización con tamaños desde 7,8 GB hasta 25,3 GB, lo que permite medir el impacto de la compresión en la calidad percibida antes de fijar una configuración de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni para el modelo base ni para las cuantizaciones. Tampoco se aportan datos de perplejidad específicos de este repositorio; solo se enlaza un gráfico genérico de comparación de tipos de cuantización de ikawrakow.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - i1-IQ1_M: ~7,8 GB de pesos; requiere al menos ~9-10 GB de VRAM para contexto corto.
  - i1-IQ2_M: ~11,0 GB; requiere ~12-13 GB.
  - i1-Q3_K_M: ~15,4 GB; requiere ~16-17 GB.
  - i1-Q4_K_S: ~17,9 GB; requiere ~19-20 GB.
  - i1-Q4_K_M: ~18,8 GB; requiere ~20-21 GB (recomendada por el autor).
  - i1-Q6_K: ~25,3 GB; requiere ~27-28 GB, no cabe en GPU de 24 GB sin offload.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M con contexto moderado; A100 40 GB o H100 para Q6_K y contextos largos; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) solo para cuantizaciones IQ2/IQ3 con contexto reducido.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones IQ1_M a Q4_K_M caben en GPUs de 12-24 GB; Q6_K requiere offload parcial a CPU o GPUs profesionales.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui con backend llama.cpp, y servidores compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Glistening-Gem-31B-v2.2-i1-GGUF (este) | ~30,7B | no disponible | apache-2.0 | GGUF | Merge con mergekit; cuantizaciones i1; capacidades no documentadas |
| Glistening-Gem-31B-v2.2 (base) | ~30,7B | no disponible | apache-2.0 | safetensors | Pesos originales; sin benchmarks publicados en la información disponible |
| Glistening-Gem-31B-v2.2-GGUF (estático) | ~30,7B | no disponible | apache-2.0 | GGUF | Cuantizaciones estáticas del mismo modelo; incluye ficheros mmproj |
| Alternativas de ~30B densos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que permitan estimar la calidad del modelo en tareas estándar; cualquier evaluación de producción requiere pruebas propias.
- Documentación técnica mínima: se desconoce la arquitectura exacta, el contexto máximo, los datos de entrenamiento y el método de merge, lo que dificulta predecir su comportamiento.
- Etiqueta "not-for-all-audiences": el repositorio incluye esta etiqueta, lo que sugiere que el modelo puede generar contenido no apto para todo público; se recomienda moderación en despliegues abiertos.
- Solo inglés declarado: no hay evidencia de soporte multilingüe; el uso en castellano u otros idiomas puede degradar la calidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño y agravado por la falta de evaluación documentada.
- Cuantizaciones de muy baja precisión: IQ1_M (7,8 GB) y Q2_K_S (11,1 GB) están marcadas por el propio autor como "mostly desperate" y "very low quality" respectivamente; no son aptas para producción.
- Licencia apache-2.0: permite uso comercial, pero al ser un merge de modelos de origen no documentado, conviene verificar las licencias de los componentes fusionados antes de un despliegue comercial.
- Componente de visión no incluida en este repositorio: los ficheros mmproj están en el repositorio estático; sin ellos, el modelo funciona solo como texto.
- Fecha de creación futura en los metadatos (2026-11-09): dato anómalo que conviene contrastar con el repositorio original.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Glistening-Gem-31B-v2.2-i1-GGUF
- Modelo base: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.2
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Glistening-Gem-31B-v2.2-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#Glistening-Gem-31B-v2.2-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
