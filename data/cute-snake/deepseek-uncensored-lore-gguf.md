# CUTE-SNAKE/deepseek-uncensored-lore-GGUF

## Resumen

DeepSeek-uncensored-lore-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base `luvGPT/deepseek-uncensored-lore`, un fine-tune de tipo conversacional y orientado a la narración de historias (storytelling) sin filtros de contenido. El repositorio lo publica el usuario CUTE-SNAKE, aunque las cuantizaciones fueron generadas originalmente por mradermacher, según se desprende de la model card heredada del proceso de cuantización. El modelo cuenta con 6.910.365.696 parámetros (aproximadamente 6,9 mil millones), lo que lo sitúa en la gama de modelos compactos aptos para hardware de consumo.

La relevancia de esta ficha es limitada y debe contextualizarse con rigor: se trata de un derivado de un fine-tune comunitario sobre una base DeepSeek, sin documentación técnica publicada sobre el entrenamiento, sin benchmarks y sin licencia declarada. El repositorio registra cero descargas y un único "like" en el momento de la consulta, lo que indica una adopción prácticamente nula. Por tanto, esta ficha debe leerse como una evaluación de disponibilidad y características técnicas observables, no como una recomendación de uso en producción.

El interés principal reside en su formato GGUF, que permite ejecución en CPU y GPU de gama media mediante llama.cpp y derivados, y en su orientación explícita a contenido sin censura, un nicho con demanda pero con implicaciones legales y éticas que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de DeepSeek; detalles específicos no disponibles) |
| Parametros totales | 6.910.365.696 (~6,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Modelo base | luvGPT/deepseek-uncensored-lore |
| Cuantizador | mradermacher |
| Tamano del repo | 61,7 GB |
| Pipeline | text-generation |
| Etiquetas | transformers, gguf, text-generation, storytelling, DeepSeek, conversational |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base más allá de su naturaleza transformer y su linaje DeepSeek. El dato de parámetros totales (6.910.365.696) procede de los pesos en safetensors del modelo base, lo que confirma un tamaño de aproximadamente 6,9 mil millones de parámetros. No consta que se trate de una arquitectura Mixture of Experts, y no hay información sobre el número de capas, dimensión de atención, mecanismos de atención (lineal, flash, GQA) ni sobre la estrategia de tokenización.

Respecto al entrenamiento, la model card no documenta el número de tokens, la composición del dataset, la existencia de RLHF, DPO u otras fases de alineación. La única información cualitativa es su etiquetado como "uncensored" y "storytelling", lo que sugiere un fine-tune orientado a eliminar restricciones de contenido y a favorecer la generación narrativa, presumiblemente mediante ajuste supervisado sobre el modelo base. Las cuantizaciones son estáticas (no weighted/imatrix), y el autor remite a una variante i1-GGUF separada para cuantizaciones con imatrix. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con énfasis declarado en narración de historias (storytelling).
- Generación de contenido sin los filtros de seguridad habituales, según la etiqueta "uncensored" del modelo base.
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere integración con infraestructuras de inferencia estándar.
- Capacidades de razonamiento, código o matemáticas: no documentadas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Generación de ficción y narrativa creativa: el modelo está etiquetado explícitamente para storytelling, por lo que puede emplearse en la redacción de relatos, guiones o diálogos sin las restricciones de contenido de modelos alineados, siempre que el usuario asuma la responsabilidad editorial y legal del resultado.
- Prototipado de personajes conversacionales sin filtros: en entornos de investigación sobre interacción persona-máquina, permite estudiar respuestas sin salvaguardas, útil para analizar comportamientos de modelos no alineados en condiciones controladas.
- Experimentación con cuantizaciones GGUF: al ofrecer doce niveles de cuantización (de Q2_K a f16), sirve como banco de pruebas para medir el impacto de la cuantización en la calidad de generación narrativa en un modelo de ~6,9 B.
- Despliegue local en hardware de consumo: con cuantizaciones desde 2,8 GB (Q2_K) hasta 7,4 GB (Q8_0), puede ejecutarse en equipos con GPU de gama media o incluso en CPU mediante llama.cpp, adecuado para entornos de desarrollo sin infraestructura cloud.
- Investigación sobre sesgos y contenido no filtrado: útil para estudiar qué tipo de contenido genera un modelo "uncensored" y diseñar contramedidas o filtros posteriores en pipelines de moderación.
- Generación de borradores de guiones para medios de ficción para adultos: en contextos editoriales donde se requiere contenido sin restricciones temáticas, el modelo puede producir material base que luego se revisa y edita manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad comparativa entre cuantizaciones, más allá de una referencia genérica a un gráfico externo sobre perplejidad de tipos de cuantización de baja calidad.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (incluyendo overhead de contexto, aproximada):
  - Q2_K (2,8 GB): ~3,5-4 GB de VRAM.
  - Q4_K_M (4,3 GB): ~5-5,5 GB de VRAM.
  - Q5_K_M (5,0 GB): ~6 GB de VRAM.
  - Q8_0 (7,4 GB): ~8,5-9 GB de VRAM.
  - f16 (13,9 GB): ~15-16 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4070/4080/4090 para Q8 y f16; A100/H100 no necesarias para este tamaño, aunque válidas para servir múltiples instancias.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB (Q4_K_S) hasta una RTX 4090 (f16). También puede ejecutarse en CPU con llama.cpp, con latencia mayor.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server o vLLM (este último con soporte GGUF limitado; se recomienda el modelo base en safetensors para vLLM).
- Latencia y throughput: no disponibles. En una RTX 4090 con Q4_K_M, un modelo de ~6,9 B suele generar decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CUTE-SNAKE/deepseek-uncensored-lore-GGUF | ~6,9 B | no disponible | no disponible | GGUF | Fine-tune sin censura, adopción nula |
| luvGPT/deepseek-uncensored-lore | ~6,9 B | no disponible | no disponible | safetensors | Modelo base del que deriva |
| Mistral-7B-Instruct (referencia de gama) | ~7,2 B | 32k (v0.2) | Apache 2.0 | safetensors, GGUF | Alineado, ampliamente soportado, benchmarks públicos |
| Llama 3.1 8B Instruct (referencia de gama) | ~8 B | 128k | Llama 3.1 Community License | safetensors, GGUF | Alineado, tool calling, benchmarks públicos |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a parámetros, contexto y licencia. Frente a Mistral-7B y Llama 3.1 8B, el modelo evaluado carece de licencia declarada, benchmarks y soporte de la comunidad, lo que lo hace menos adecuado para producción pese a su tamaño similar.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia alguna, lo que impide determinar los derechos de uso comercial, modificación y redistribución. No debe usarse en producción sin aclarar este punto con el autor.
- Modelo "uncensored": la eliminación de filtros de seguridad implica riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito, con implicaciones legales según la jurisdicción y la plataforma de despliegue.
- Riesgo de alucinación: no documentado, pero esperable en un modelo de ~6,9 B sin benchmarks de fiabilidad; no debe usarse para tareas factuales sin verificación.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: no documentado; se desconoce la ventana máxima soportada, lo que limita su uso en tareas de contexto largo.
- Adopción nula: cero descargas y un "like" en el momento de la consulta; sin comunidad que reporte errores ni calidad real.
- Procedencia de las cuantizaciones: la model card indica que fueron generadas por mradermacher, no por el publicador del repo; conviene verificar la integridad de los archivos frente al repositorio original de cuantizaciones.
- Sin benchmarks: imposible comparar su calidad con alternativas alineadas de tamaño similar.
- Sesgos: no documentados; los fine-tunes sin alineación suelen reproducir sesgos de los datos de entrenamiento sin mitigación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CUTE-SNAKE/deepseek-uncensored-lore-GGUF
- Modelo base: https://huggingface.co/luvGPT/deepseek-uncensored-lore
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/deepseek-uncensored-lore-i1-GGUF
- Cuantizaciones estáticas originales de mradermacher: https://huggingface.co/mradermacher/deepseek-uncensored-lore-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
