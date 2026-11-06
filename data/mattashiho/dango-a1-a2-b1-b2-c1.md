# mattashiho/dango-A1-A2-B1-B2-C1

## Resumen

Dango-A1-A2-B1-B2-C1 es un modelo de lenguaje de 1.867.614.208 parámetros (aproximadamente 1,8 mil millones) desarrollado por Shiho Matta (usuario de Hugging Face `mattashiho`) como parte de una línea de investigación sobre adquisición de segundas lenguas (L2). Se trata de un ajuste fino supervisado (SFT) sobre el checkpoint Dango-pretrained (`dango-1.8b-100Btok`), un modelo preentrenado exclusivamente en japonés con 100 mil millones de tokens de un corpus filtrado. El ajuste se realiza sobre lecciones de aprendizaje de inglés como segunda lengua cubriendo los niveles A1, A2, B1, B2 y C1 del Marco Común Europeo de Referencia.

El modelo no está pensado como un asistente generalista, sino como un simulador de hablante japonés-inglés y como herramienta de investigación para estudiar cómo un modelo entrenado en japonés adquiere competencias en inglés a distintos niveles de proficiency. Arquitectónicamente es comparable a la familia llm-jp-3, que adopta una arquitectura decoder de estilo Llama 2. El repositorio contiene únicamente los pesos en formato safetensors (3,7 GB) y no incluye pipeline declarado en Hugging Face.

La relevancia del modelo es acotada: se publica como artefacto de investigación con 25 descargas y sin resultados de benchmarks publicados en la información disponible. Su interés principal reside en el enfoque metodológico (preentrenamiento monolingüe en japonés seguido de SFT sobre currículos L2 estructurados por niveles MCER) y en las restricciones de licencia que afectan a los modelos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama 2 (comparable a llm-jp-3) |
| Parametros totales | 1.867.614.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ja, en |
| Licencia | cc (CC BY 4.0 para codigo y modelos preentrenados; los modelos ajustados con datos Ichikara prohiben uso comercial de derivados) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder de estilo Llama 2, tal como se indica en la model card al compararse con la familia llm-jp-3 (concretamente con `llm-jp-3-1.8b`). No se especifican en la información disponible el número de capas, dimensiones ocultas, número de cabezas de atención ni la longitud de contexto nativa.

El entrenamiento se desarrolla en dos fases. Primero, un preentrenamiento monolingüe en japonés sobre 100 mil millones de tokens de un corpus japonés extensamente filtrado, que da lugar al checkpoint `dango-1.8b-100Btok`. Segundo, un ajuste fino supervisado (SFT) sobre lecciones de aprendizaje de inglés como segunda lengua organizadas por niveles MCER (A1, A2, B1, B2, C1). La model card indica que el SFT se realizó con datos de instrucción de Ichikara, lo que condiciona la licencia de los modelos derivados. No se detalla la composición exacta del dataset de SFT, el número de tokens de esta fase, ni si se emplearon técnicas de RLHF o DPO. El código de filtrado y entrenamiento está disponible en el repositorio de GitHub del autor.

## Capacidades

- Generación de texto en japonés e inglés, con foco declarado en la simulación de producción lingüística de un hablante japonés a distintos niveles de competencia (A1 a C1).
- Simulación de errores y estructuras propias de aprendices de inglés como L2, orientada a investigación en adquisición de segundas lenguas.
- Generación de texto en japonés heredada del preentrenamiento monolingüe.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking mode).
- No se documentan capacidades de código o matemáticas de forma específica.

## Casos de uso

- Investigación en adquisición de segundas lenguas: el modelo permite generar producciones simuladas de aprendices de inglés en distintos niveles MCER, lo que facilita estudios controlados sobre errores típicos, transferencia del japonés y progresión lingüística sin necesidad de reclutar participantes humanos.
- Generación de material didáctico sintético: se pueden producir ejemplos de texto calibrados por nivel (A1 a C1) para alimentar ejercicios de comprensión lectora o de corrección de errores en plataformas de aprendizaje de inglés para hablantes de japonés.
- Evaluación de sistemas de corrección gramatical: al disponer de producciones simuladas con nivel conocido, se pueden usar como conjunto de prueba para medir la sensibilidad de correctores automáticos a distintos grados de competencia.
- Estudio de transferencia lingüística ja→en: el modelo permite analizar cómo un preentrenamiento exclusivamente en japonés condiciona la producción en inglés, útil para investigar interferencias sintácticas y léxicas.
- Simulación de interlocutor en entornos de práctica conversacional: integrado en un chatbot de prácticas, puede emular a un hablante japonés con un nivel de inglés determinado para entrenar a profesores o evaluadores.
- Experimentos de currículo de aprendizaje: al haber sido ajustado sobre lecciones ordenadas por niveles, permite estudiar el efecto del orden y la cobertura curricular en el comportamiento del modelo, comparando con el checkpoint preentrenado.
- Reproducibilidad metodológica: el código de filtrado y entrenamiento publicado en GitHub permite replicar el pipeline sobre otros pares de lenguas o corpus, sirviendo como referencia para grupos de investigación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,9 GB para pesos; en 4 bits, aproximadamente 1 GB para pesos.
- GPU recomendadas para producción: NVIDIA A100, H100 o L40S para despliegues con concurrencia; para investigación individual, RTX 4090, RTX 3090 o incluso RTX 4070 Ti.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16 y en tarjetas con 4-6 GB en cuantización de 4 u 8 bits.
- Opciones de despliegue: al ser safetensors con arquitectura Llama, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama y Transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Dango-A1-A2-B1-B2-C1 | 1,87 B | no disponible | ja, en | CC BY 4.0 con restricción comercial por datos Ichikara | SFT sobre currículo L2 A1-C1 |
| llm-jp-3-1.8b | 1,8 B | no disponible en esta ficha | ja | no disponible en esta ficha | LLM japonés de propósito general |
| Dango-pretrained (dango-1.8b-100Btok) | 1,8 B | no disponible | ja | CC BY 4.0 | Preentrenamiento monolingüe japonés, 100 B tokens |

La comparación con modelos de propósito general de tamaño similar no resulta directamente aplicable, ya que Dango-A1-A2-B1-B2-C1 está especializado en simulación de aprendizaje L2 y no se han publicado métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad ni robustez; el modelo hereda los sesgos del corpus japonés de preentrenamiento y de los datos de instrucción de Ichikara.
- Riesgo de alucinación no cuantificado; al ser un modelo de 1,8 B parámetros, la factualidad es limitada en comparación con modelos de mayor tamaño.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- El soporte de inglés proviene exclusivamente del SFT sobre lecciones L2, no de preentrenamiento en inglés; la competencia real en inglés fuera del dominio de las lecciones puede ser limitada.
- Restricción de licencia crítica: los modelos ajustados con datos de Ichikara prohiben el uso comercial de modelos derivados, a pesar de que la licencia base se declara como CC BY 4.0. Cualquier uso en producción comercial requiere revisión legal.
- El modelo está pensado para investigación; no se recomienda su uso como asistente generalista ni en aplicaciones de cara al usuario sin una evaluación adicional.
- El pipeline no está declarado en Hugging Face, lo que puede complicar la carga automática con `pipeline()` de Transformers.
- El número de descargas (25) y la ausencia de likes sugieren una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattashiho/dango-A1-A2-B1-B2-C1
- Modelo base (preentrenado): https://huggingface.co/mattashiho/dango-1.8b-100Btok
- Repositorio de código (filtrado y entrenamiento): https://github.com/mattashiho233/dango
- Referencia arquitectónica llm-jp-3-1.8b: https://huggingface.co/llm-jp/llm-jp-3-1.8b
- Fuente de datos Ichikara: https://liat-aip.sakura.ne.jp/wp/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf%e4%bd%9c%e6%88%90/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf-%e5%85%ac%e9%96%8b/
