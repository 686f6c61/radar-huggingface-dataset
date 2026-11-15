# mradermacher/therapist-8b-GGUF

## Resumen

`mradermacher/therapist-8b-GGUF` es una colección de cuantizaciones en formato GGUF del modelo `entfane/therapist-8b`, un modelo de lenguaje conversacional afinado para interacciones de tipo terapéutico en inglés. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema de GGUF conocido por publicar versiones optimizadas de modelos populares para su uso con llama.cpp y herramientas compatibles.

El modelo base cuenta con 8.030.261.248 parámetros (aproximadamente 8 mil millones), lo que lo sitúa en la categoría de modelos de tamano medio que pueden ejecutarse en GPUs de consumo. El repositorio incluye 12 variantes de cuantización que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB), lo que permite desplegarlo en un rango amplio de hardware, desde portátiles con poca VRAM hasta estaciones de trabajo.

La relevancia de esta ficha radica en que el modelo está orientado a un caso de uso muy específico: conversaciones con tono terapéutico y empático. No obstante, la información pública disponible es limitada: la model card del repositorio GGUF solo documenta el proceso de cuantización, sin detallar arquitectura, datos de entrenamiento, benchmarks ni licencia. Esto condiciona la evaluación técnica y obliga a marcar numerosos campos como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: entfane/therapist-8b) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no aplica (no es MoE, según datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `entfane/therapist-8b`. Por el tamano (8.030 millones de parámetros) y el pipeline declarado (conversacional), es plausible que se trate de un transformer decoder-only de la familia Llama o Mistral, pero esto no está confirmado en la documentación proporcionada. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT.

Respecto al proceso de cuantización, la model card indica que se trata de cuantizaciones estáticas (static quants) generadas con quantize_version 2 y output_tensor_quantised 1, a partir de los pesos en formato Hugging Face (convert_type: hf). El autor señala que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación, y que no las tiene planificadas salvo petición explícita en la sección de discusión de la comunidad.

## Capacidades

- Generación de texto conversacional en inglés, con un tono orientado a la escucha activa y el acompañamiento emocional.
- Diálogo multi-turno: el pipeline declarado es "conversational" y los tags incluyen "conversational".
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con infraestructura de inferencia tipo Hugging Face Inference Endpoints.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- No se documenta un modo "thinking" ni decodificación especulativa.
- Capacidad multilingüe: limitada al inglés según el campo `language`.

## Casos de uso

- **Prototipado de asistentes conversacionales de apoyo emocional**: el modelo puede emplearse para generar respuestas empáticas en inglés dentro de un chatbot de acompañamiento, usando cuantizaciones Q4_K_M (5,0 GB) para despliegues ligeros en local.
- **Investigación en NLP clínico o psicológico**: útil como baseline para estudiar el comportamiento de modelos afinados en dominios sensibles, comparando respuestas entre cuantizaciones (por ejemplo, Q8_0 frente a Q4_K_M) para medir el impacto de la cuantización en la calidad del diálogo.
- **Despliegue en hardware de consumo**: la variante Q4_K_S (4,8 GB) o Q4_K_M (5,0 GB) cabe en GPUs consumer de 8 GB de VRAM, lo que permite ejecutar el modelo en un portátil gaming o en una estación de trabajo modesta mediante llama.cpp u Ollama.
- **Generación de diálogos sintéticos para aumento de datos**: el modelo puede producir conversaciones de temática terapéutica en inglés para entrenar o evaluar otros sistemas, siempre que se revise el contenido generado.
- **Evaluación comparativa de cuantizaciones**: el repositorio ofrece 12 variantes, lo que lo convierte en un banco de pruebas útil para medir la degradación de perplejidad y calidad conversacional entre Q2_K y f16 en un modelo de 8B.
- **Integración en pipelines de inferencia locales**: al estar en GGUF, puede servirse con llama.cpp, Ollama o text-generation-webui, y combinarse con APIs compatibles con OpenAI para prototipos de aplicaciones de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según cuantización): Q2_K ~3,3 GB; Q3_K_M ~4,1 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB. Añadir margen para el contexto KV cache (no disponible el tamano de contexto, por lo que el margen no puede calcularse con precisión).
- **GPU recomendadas**: para Q4_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4070 Ti Super o RTX 4080 de 16 GB; para f16, una RTX 4090 de 24 GB o una A100/H100.
- **¿Cabe en GPU consumer?**: sí, las cuantizaciones Q2_K a Q6_K caben en GPUs de 8 GB o menos; Q8_0 requiere al menos 10-12 GB; f16 requiere 24 GB o más.
- **Opciones de despliegue**: llama.cpp, Ollama, text-generation-webui, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere también Hugging Face Inference Endpoints.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa, ya que no se conocen benchmarks, contexto ni licencia del modelo. Como referencia estructural, se compara con alternativas genéricas de 7-8B en formato GGUF:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| therapist-8b-GGUF | 8,03B | no disponible | no disponible | GGUF | Afinado conversacional en inglés |
| Llama 3.1 8B Instruct | 8,03B | 128K (según documentación pública de Meta) | Llama 3.1 Community License | GGUF, safetensors | Referencia generalista |
| Mistral 7B Instruct | 7,24B | 32K (según documentación pública de Mistral) | Apache 2.0 | GGUF, safetensors | Referencia generalista |
| Qwen2.5 7B Instruct | 7,62B | 128K (según documentación pública de Alibaba) | Apache 2.0 | GGUF, safetensors | Referencia generalista multilingüe |

Nota: los datos de los modelos comparativos provienen de sus documentaciones públicas y no de la información proporcionada para este modelo; se incluyen solo como contexto de categoría.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor del modelo base (`entfane/therapist-8b`) antes de cualquier despliegue en producción.
- **Idioma limitado al inglés**: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en entornos hispanohablantes requeriría evaluación adicional.
- **Dominio sensible**: un modelo etiquetado como "therapist" puede generar respuestas que se interpreten como consejo psicológico o médico. No debe usarse como sustituto de atención profesional y requiere salvaguardas y avisos claros.
- **Riesgo de alucinación**: no se documentan evaluaciones de fidelidad ni de seguridad; se desconoce el comportamiento ante preguntas delicadas.
- **Sesgos**: no se documenta ningún análisis de sesgos, por lo que se desconoce su comportamiento en temas de género, raza, salud mental o colectivos vulnerables.
- **Contexto desconocido**: al no publicarse la longitud de contexto, no se puede garantizar el rendimiento en conversaciones largas.
- **Cuantizaciones de baja calidad**: el autor advierte que Q3_K_M es de "lower quality" y que Q2_K, aunque ocupa solo 3,3 GB, degrada notablemente la perplejidad; para producción se recomienda Q4_K_M o superior.
- **Sin cuantizaciones imatrix**: no hay versiones ponderadas, lo que puede suponer una pérdida de calidad frente a alternativas con imatrix en el mismo tamano.
- **Información de entrenamiento ausente**: sin datos sobre dataset, alineamiento o evaluación, no es posible auditar el modelo para uso responsable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/therapist-8b-GGUF
- Modelo base: https://huggingface.co/entfane/therapist-8b
- Página de descargas del autor: https://hf.tst.eu/model#therapist-8b-GGUF
- README de referencia de TheBloke sobre GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
