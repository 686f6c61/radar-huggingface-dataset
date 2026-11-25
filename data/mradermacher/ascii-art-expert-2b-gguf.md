# mradermacher/ascii-art-expert-2b-GGUF

## Resumen

`mradermacher/ascii-art-expert-2b-GGUF` es una recopilación de cuantizaciones en formato GGUF del modelo base `jokasia/ascii-art-expert-2b`, un modelo de lenguaje especializado en la generación de arte ASCII. El trabajo de cuantización lo firma mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles. El modelo original, según su nombre, está orientado a la generación conversacional de arte ASCII y tiene aproximadamente 1.540 millones de parámetros (1.543.714.304 según los pesos en safetensors).

La relevancia de esta ficha reside en que permite ejecutar un modelo de 2B especializado en una tarea muy concreta (arte ASCII) en hardware de consumo, gracias a las cuantizaciones que van desde 0,8 GB (Q2_K) hasta 3,2 GB (f16). Es un caso típico de modelo pequeño y de nicho, donde la cuantización agresiva tiene un impacto limitado en la calidad porque el dominio de salida es muy restringido y estructurado.

No se dispone de información sobre la arquitectura interna del modelo base, el dataset de entrenamiento, la longitud de contexto ni la licencia. La model card del repositorio GGUF es puramente operativa (lista de cuantizaciones y notas de uso) y no incluye datos técnicos del modelo original. Todo lo que se indica a continuación se limita a lo que consta en la información proporcionada, marcando explícitamente lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: jokasia/ascii-art-expert-2b) |
| Parametros totales | 1.543.714.304 (≈1,54 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (tag `en` en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors (tag `transformers`) |
| Tamano del repo | 14,2 GB (incluye todas las cuantizaciones) |
| Libreria declarada | transformers |
| Pipeline | no disponible |
| Etiquetas | conversational, endpoints_compatible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `jokasia/ascii-art-expert-2b`. Por el tamaño (≈1,54 B de parámetros) y la librería declarada (`transformers`), se trata con alta probabilidad de un transformer decoder-only de escala pequeña, pero esto no está confirmado en la información proporcionada. Tampoco consta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (no ponderadas ni con imatrix) en formatos K-quant e IQ, con una versión f16 de referencia. La model card indica explícitamente que las cuantizaciones ponderadas/imatrix "no parecen estar disponibles" en el momento de la publicación, y que el autor no las ha planificado salvo petición en la sección de discusión de la comunidad. El proceso de conversión se realizó a partir de pesos en formato Hugging Face (`convert_type: hf`).

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` de la model card.
- Generación de arte ASCII: es la especialidad declarada por el nombre del modelo base (`ascii-art-expert`), aunque no se detalla el formato exacto de las salidas ni los estilos soportados.
- Compatible con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: solo se declara inglés; no hay información sobre otros idiomas.

## Casos de uso

- Generación de arte ASCII para terminales y documentación: el modelo puede producir banners, logotipos y figuras en texto plano para incluir en READMEs, scripts de arranque o documentación técnica. Su tamaño reducido permite ejecutarlo localmente sin depender de servicios externos.
- Herramientas de línea de comandos para desarrolladores: integración en un CLI que convierta descripciones textuales en arte ASCII, aprovechando las cuantizaciones Q4_K_M (1,1 GB) para mantener un binario ligero y una latencia baja en portátiles.
- Generación de cabeceras y separadores para ficheros de código: un caso de uso acotado donde la creatividad del modelo importa menos que la consistencia del formato de salida, lo que encaja con un modelo pequeño especializado.
- Prototipado de chatbots temáticos: al ser un modelo conversacional en inglés, puede servir como base para un asistente de nicho centrado en arte textual, desplegado con llama.cpp u Ollama en hardware modesto.
- Educación y demostraciones de cuantización: el repositorio incluye doce niveles de cuantización del mismo modelo, lo que lo convierte en un caso práctico para comparar calidad frente a tamaño en un modelo de 2B, por ejemplo en talleres sobre GGUF y llama.cpp.
- Pruebas de integración en pipelines de inferencia: la etiqueta `endpoints_compatible` permite usarlo como modelo de prueba en despliegues con TGI o endpoints compatibles, validando la infraestructura antes de pasar a modelos mayores.
- Generación de contenido para juegos de texto o MUDs: la producción de arte ASCII bajo demanda encaja en interfaces de terminal y juegos basados en texto donde no se dispone de recursos gráficos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~0,8 GB de pesos; en la práctica, alrededor de 1,5-2 GB de VRAM con overhead de contexto.
  - Q4_K_M: ~1,1 GB de pesos; alrededor de 2-2,5 GB de VRAM con contexto moderado.
  - Q8_0: ~1,7 GB de pesos; alrededor de 3 GB de VRAM.
  - f16: ~3,2 GB de pesos; alrededor de 4-5 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060, etc.). Para f16, una RTX 3060 de 12 GB o superior ofrece margen sobrado. En entornos de servidor, A100 o H100 no aportan ventaja significativa para un modelo de este tamaño.
- Cabe en GPU consumer: sí, en todas las cuantizaciones, incluidas GPUs de gama baja con 4 GB o incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con PyTorch; también podría servirse con vLLM o TGI si el modelo base es compatible, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles. Por el tamaño (≈1,54 B), se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables especializados en arte ASCII ni sobre sus parámetros, contexto o rendimiento. Se indica "no disponible" para evitar datos no verificados.

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| ascii-art-expert-2b (este) | ≈1,54 B | no disponible | no disponible | GGUF, safetensors | Especializado en arte ASCII, solo inglés |
| Alternativas | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo base `jokasia/ascii-art-expert-2b` antes de cualquier despliegue en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto, lo que impide planificar conversaciones largas o entradas extensas con garantías.
- Sesgos: no hay información sobre los datos de entrenamiento, por lo que no se pueden evaluar sesgos conocidos. Un modelo especializado en arte ASCII tiene un dominio de salida muy restringido, lo que reduce pero no elimina el riesgo de respuestas fuera de tono.
- Alucinación: como cualquier modelo generativo, puede producir arte ASCII mal formado o incoherente, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S). La model card advierte que Q3_K_M es de "lower quality".
- Cuantizaciones no ponderadas: el autor indica que no hay cuantizaciones con imatrix, lo que puede afectar a la calidad relativa de los formatos IQ frente a los K-quant equivalentes en tamaño.
- Sin benchmarks: no hay métricas publicadas que permitan comparar la calidad del modelo base ni de las cuantizaciones.
- Fecha de creación futura: la fecha indicada (2026-11-21) es posterior a la fecha actual de referencia, lo que sugiere un posible error en los metadatos del repositorio; conviene verificar la integridad de los ficheros antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ascii-art-expert-2b-GGUF
- Modelo base: https://huggingface.co/jokasia/ascii-art-expert-2b
- Página de descargas del autor: https://hf.tst.eu/model#ascii-art-expert-2b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
