# mattashiho/dango-A1-A2-B1-B2-C1-C2

## Resumen

Dango-A1-A2-B1-B2-C1-C2 es un modelo de lenguaje de 1.867.614.208 parámetros (aproximadamente 1,8 mil millones) desarrollado por Shiho Matta (usuario mattashiho) en el marco de una investigación académica sobre adquisición de segundas lenguas (SLA). Se trata de un ajuste fino supervisado (SFT) del checkpoint Dango-pretrained, un modelo entrenado exclusivamente con corpus japonés filtrado (100.000 millones de tokens), sobre lecciones de aprendizaje de inglés como L2 estructuradas según los niveles del MCER A1, A2, B1, B2, C1 y C2.

El objetivo no es competir como asistente generalista, sino servir de banco de pruebas controlado para estudiar la transferencia lingüística L1→L2 (japonés→inglés): el modelo actúa como un hablante nativo de japonés que ha aprendido inglés hasta un nivel determinado, y permite medir si el rendimiento en tareas de traducción o generación generaliza a niveles de dificultad no vistos durante el entrenamiento.

Es relevante ahora porque acompaña a una publicación en el congreso ANLP 2026 y a un preprint en arXiv, y porque la mayoría de estudios previos de SLA con modelos de lenguaje se apoyaban en modelos pequeños o no generativos. La arquitectura es de decoder tipo Llama 2, comparable a la familia llm-jp-3. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto de investigación recién publicado, sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Llama 2 (comparable a la familia llm-jp-3) |
| Parametros totales | 1.867.614.208 (1,87 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no hay GGUF ni cuantizaciones precomputadas) |
| Idiomas soportados | ja, en |
| Licencia | cc (CC BY 4.0 para código, scripts y modelos preentrenados); los modelos ajustados con datos de instrucción Ichikara prohíben el uso comercial de modelos derivados |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,7 GB |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer autorregresivo de tipo Llama 2, arquitectónicamente comparable a llm-jp-3-1.8b. El punto de partida es Dango-pretrained (dango-1.8b-100Btok), un modelo preentrenado únicamente con japonés sobre 100.000 millones de tokens procedentes de un corpus japonés exhaustivamente filtrado. El código de filtrado y de entrenamiento está publicado en el repositorio de GitHub del autor.

Sobre esa base se aplicó un ajuste fino supervisado con lecciones de aprendizaje de inglés como segunda lengua, cubriendo los seis niveles del MCER (A1, A2, B1, B2, C1 y C2). La model card indica que parte de los datos de instrucción empleados son de Ichikara, lo que condiciona la licencia del checkpoint resultante. No se especifican en la información disponible el número de tokens de SFT, la composición exacta del dataset, la longitud de contexto nativa ni si hubo etapas de RLHF o DPO; tampoco se documentan innovaciones de decodificación o atención.

## Capacidades

- Generación de texto en japonés (heredada del preentrenamiento L1-only) y en inglés dentro del registro de lecciones de L2.
- Simulación de un hablante de japonés como L1 que ha aprendido inglés hasta un nivel MCER concreto (A1 a C2).
- Traducción japonés→inglés con sensibilidad al nivel de dificultad, evaluada en el corpus Tatoeba según los resultados publicados.
- Generación de materiales y ejercicios calibrados por nivel de competencia lingüística.
- Capacidad de generalización composicional a niveles de dificultad no vistos en entrenamiento (el paper reporta resultados en C1 y C2 tras entrenar con A1-B2).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en adquisición de segundas lenguas: utilizar el checkpoint como sujeto experimental para medir transferencia L1→L2, comparando respuestas del modelo con las de aprendices humanos reales en tareas controladas.
- Simulación de estudiantes para tutores automáticos: generar respuestas con errores plausibles de un aprendiz de nivel B1 o B2 y emplearlas para entrenar o evaluar sistemas de corrección gramatical y feedback formativo.
- Generación de material didáctico escalado por nivel: producir textos de lectura o diálogos calibrados a A1-C2, aprovechando que el modelo fue ajustado específicamente con lecciones etiquetadas por nivel.
- Validación de ítems de examen: comprobar si un texto o enunciado es adecuado para un nivel MCER objetivo, usándolo como clasificador generativo de dificultad.
- Traducción japonés→inglés con control de complejidad léxica y sintáctica, útil en pipelines de localización educativa donde el público destino tiene competencia limitada.
- Aumento de datos para clasificadores de competencia lingüística: generar corpus sintéticos etiquetados por nivel para entrenar modelos discriminativos de proficiency.
- Reproducibilidad de experimentos: al estar publicado el pipeline de filtrado y entrenamiento en GitHub, permite replicar el preentrenamiento y aplicar SFT con lecciones propias.
- Inferencia en hardware modesto: con 1,87 B de parámetros y pesos en fp16 de aproximadamente 3,7 GB, puede ejecutarse en una única GPU de consumo para prototipos de investigación.

## Benchmarks y rendimiento

Los únicos datos cuantitativos encontrados en la información disponible corresponden a traducción japonés→inglés sobre el conjunto de evaluación Tatoeba, con BLEU por nivel de dificultad. El modelo entrenado con material A1-B2 se evalúa en niveles no vistos:

| Evaluacion | Entrenamiento | Nivel de test | Metrica | Resultado |
|---|---|---|---|---|
| Traduccion ja→en (Tatoeba) | A1-B2 | C1 (no visto) | BLEU | 21,2 |
| Traduccion ja→en (Tatoeba) | A1-B2 | C2 (no visto) | BLEU | 15,8 |

El paper describe además un ajuste experimental en el que se entrena con A1+A2+B1 o A1+A2+B1+B2 y se evalúa en B2 para sondear la frontera entre niveles vistos y no vistos, pero no se han publicado los valores numéricos de esa comparación en la información disponible. No hay resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,7 GB solo para pesos, más overhead de activaciones y KV cache (el repositorio pesa 3,7 GB).
- VRAM estimada en int8: alrededor de 1,9 GB de pesos.
- VRAM estimada en int4: alrededor de 1 GB de pesos, aunque no se publican cuantizaciones oficiales.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de 8 GB con margen para contexto moderado.
- GPU de datacenter: A100, H100 o L4 están sobredimensionadas para el modelo; son útiles para servir muchas réplicas en paralelo.
- Despliegue: transformers (formato safetensors nativo), vLLM o TGI para serving, llama.cpp u Ollama solo si se convierte previamente a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dango-A1-A2-B1-B2-C1-C2 | 1,87 B | no disponible | cc, con restriccion comercial por datos Ichikara | SFT sobre lecciones L2 A1-C2; japones L1 | HuggingFace, safetensors |
| llm-jp-3-1.8b | 1,8 B | no disponible en la informacion | no disponible en la informacion | LLM japones generalista, misma familia arquitectonica | HuggingFace |
| Dango-pretrained (dango-1.8b-100Btok) | 1,8 B | no disponible | CC BY 4.0 | Preentrenamiento L1-only japones, 100 B tokens | HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | LLM generalista en ingles | HuggingFace |
| Qwen2.5-1.5B | 1,5 B | 32.768 tokens | Apache 2.0 | LLM generalista multilingue | HuggingFace |

La comparación relevante no es de rendimiento generalista, sino de propósito: Dango es un modelo de investigación de SLA con capacidades generalistas limitadas por diseño, mientras que TinyLlama, Qwen2.5 y llm-jp-3 son modelos de uso general. No se dispone de cifras de benchmarks comunes que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Restricción de licencia para uso comercial: aunque la etiqueta del repositorio indica "cc" y los pesos preentrenados son CC BY 4.0, el ajuste con datos de instrucción Ichikara prohíbe explícitamente el uso comercial de modelos derivados. El checkpoint de este repositorio es precisamente el modelo ajustado, por lo que no debe emplearse en producción comercial sin revisión legal.
- Capacidad generalista muy limitada: el preentrenamiento es exclusivamente en japonés y el SFT se restringe a lecciones de inglés como L2; el modelo no está diseñado para instrucciones generales, código, matemáticas ni razonamiento complejo.
- Riesgo alto de alucinación fuera de distribución: al ser un modelo de 1,8 B con un corpus de preentrenamiento monolingüe y filtrado, la generación abierta en inglés puede degradarse con facilidad.
- Sesgos: el corpus japonés filtrado y las lecciones empleadas introducen sesgos culturales y de registro propios de materiales didácticos; no se documenta ninguna evaluación de sesgos.
- Idiomas: solo japonés e inglés; no hay soporte de castellano ni de otras lenguas, y el inglés está condicionado al registro de aprendiz.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar cargas de trabajo con documentos largos.
- Ausencia de validación comunitaria: 0 descargas y 0 likes; el modelo es un artefacto de investigación recién publicado y no debe asumirse estabilidad en producción.
- Falta de cuantizaciones oficiales: no hay GGUF ni versiones int8/int4 publicadas, por lo que el despliegue en CPU exige conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattashiho/dango-A1-A2-B1-B2-C1-C2
- Modelo base (Dango-pretrained): https://huggingface.co/mattashiho/dango-1.8b-100Btok
- Repositorio GitHub (código de filtrado y entrenamiento): https://github.com/mattashiho233/dango
- README del repositorio: https://github.com/mattashiho233/dango/blob/main/README.md
- Preprint arXiv: https://arxiv.org/abs/2606.19170
- Version HTML del paper: https://arxiv.org/html/2606.19170v1
- Resumen del paper en aimodels.fyi: https://www.aimodels.fyi/papers/arxiv/dango-strictly-l1-only-large-language-model
- Modelo de referencia arquitectonica llm-jp-3-1.8b: https://huggingface.co/llm-jp/llm-jp-3-1.8b
- Fuente de datos de instruccion Ichikara: https://liat-aip.sakura.ne.jp/wp/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf%e4%bd%9c%e6%88%90/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf-%e5%85%ac%e9%96%8b/
- Cita recomendada: Matta et al., "Pretraining a Japanese-Only Large Language Model for Studying Second Language Acquisition", ANLP 2026, pp. 3225-3230
