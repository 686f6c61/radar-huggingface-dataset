# mradermacher/mistral-7b-instruct-v0.2-heretic-i1-GGUF

## Resumen

`mradermacher/mistral-7b-instruct-v0.2-heretic-i1-GGUF` es un conjunto de cuantizaciones GGUF generadas con imatrix a partir de `Ananasez/mistral-7b-instruct-v0.2-heretic`, un fine-tuning «abliterated» o «decensored» de Mistral-7B-Instruct-v0.2. No es, por tanto, un modelo nuevo entrenado desde cero, sino un artefacto de distribución: el trabajo de mradermacher consiste en convertir los pesos originales a formato GGUF y producir 23 variantes de cuantización con matriz de importancia, optimizadas para inferencia local en CPU y GPU de gama consumer.

El modelo subyacente conserva la arquitectura y el tamaño de Mistral-7B-Instruct-v0.2 (7.241.732.096 parámetros, transformer decoder-only denso, licencia Apache 2.0). La modificación respecto al original afecta al comportamiento: la técnica de abliteración elimina o atenúa la dirección de rechazo aprendida durante el alineamiento, de modo que el modelo responde a peticiones que el Instruct original declinaría. Esto lo hace relevante para investigación en seguridad, generación de datos adversariales y escritura creativa sin filtros, y no tanto para producción convencional.

El interés práctico inmediato está en la disponibilidad de cuantizaciones desde 2,6 GB (i1-IQ2_M) hasta 6,0 GB (i1-Q6_K), lo que permite ejecutar el modelo en GPUs de 6-8 GB o incluso en CPU. El repositorio ocupa 60,1 GB e incluye también el fichero imatrix por si se quieren generar cuantizaciones propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral 7B v0.2), con GQA y SwiGLU según la documentación pública del modelo base; no detallado en la model card de esta cuantización |
| Parámetros totales | 7.241.732.096 (dato real de safetensors del modelo base) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Mistral-7B-Instruct-v0.2; no se indica en la model card de esta cuantización) |
| Tipos de cuantización | 23 variantes i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; más fichero imatrix suelto de 0,1 GB |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el repositorio no incluye safetensors |
| Autor de la cuantización | mradermacher (infraestructura de nethype GmbH y de @nicoboss) |
| Modelo base | Ananasez/mistral-7b-instruct-v0.2-heretic (a su vez derivado de Mistral-7B-Instruct-v0.2) |
| Tamaño del repositorio | 60,1 GB |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del Mistral-7B-Instruct-v0.2 original: un transformer decoder-only de 7,24 mil millones de parámetros con atención multi-cabeza con consultas agrupadas (GQA), activación SwiGLU, embeddings rotatorios (RoPE) y ventana de contexto de 32.768 tokens. Al ser un modelo denso, todos los parámetros se activan en cada token generado, lo que determina los requisitos de memoria y las tasas de generación. La model card de esta cuantización no aporta detalles adicionales sobre capas, dimensiones ocultas ni configuración de atención; esos datos deben consultarse en la ficha del modelo base.

Sobre el entrenamiento no hay información verificable en la documentación disponible: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO en el fine-tuning de Ananasez. Lo que sí se declara en las etiquetas es el método de modificación: `heretic`, `abliterated`, `decensored`, `uncensored`, aplicado sobre un modelo ya instruido. La innovación técnica de esta ficha, por tanto, no está en el entrenamiento sino en el proceso de cuantización: mradermacher aplica cuantización ponderada con matriz de importancia (imatrix), que estima la sensibilidad de cada tensor para minimizar la perda de perplejidad en los tipos de cuantización bajos. Los ficheros se generan con `output_tensor_quantised: 1` y `convert_type: hf`, y el autor publica además los quants «estáticos» equivalentes en un repositorio separado.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de chat instruct heredado de Mistral-7B-Instruct-v0.2.
- Escritura creativa y narrativa sin rechazos: la abliteración elimina la mayor parte de las negativas del modelo alineado.
- Manejo de contexto largo: hasta 32.768 tokens, útil para documentos extensos o conversaciones prolongadas.
- Razonamiento básico, matemáticas elementales y generación de código, con las limitaciones propias de un modelo de 7B de la generación de Mistral v0.2.
- Generación de datos sintéticos y de prompts adversariales para investigación en seguridad.
- No se declara soporte de tool calling ni function calling nativo (Mistral-7B-Instruct-v0.2 no lo incluye de serie).
- No dispone de visión, audio ni modo «thinking» explícito.
- Capacidad multilingüe limitada: el modelo se declara únicamente en inglés, aunque el base tiene nociones de otros idiomas por contaminación del corpus.

## Casos de uso

- Investigación en seguridad y alineamiento: sirve como modelo de control «sin rechazos» para comparar tasas de cumplimiento frente al Mistral-7B-Instruct-v0.2 original y medir el efecto de la abliteración en evaluaciones de harmfulness.
- Generación de datasets adversariales: producir grandes volúmenes de prompts y respuestas que los filtros de seguridad deben clasificar, aprovechando la cuantización IQ4_XS (4,0 GB) para generar en local a bajo coste.
- Escritura de ficción y narrativa adulta: el modelo no aplica las negativas del Instruct original, lo que encaja en guiones, relatos y roleplay donde el filtrado resulta un obstáculo; los 32k de contexto permiten mantener consistencia en textos largos.
- Asistente personal offline: desplegado con llama.cpp u Ollama en una GPU de 8 GB con i1-Q4_K_M (4,5 GB), funciona sin conexión y sin enviar datos a terceros.
- Red teaming de pipelines propios: integrar el modelo como generador de entradas maliciosas para probar clasificadores, guardrails y sistemas de moderación antes de desplegarlos.
- Etiquetado y aumento de datos en inglés: reescritura, paráfrasis y expansión de textos con contexto largo, ejecutable en CPU con las cuantizaciones IQ2/IQ3 cuando no hay GPU disponible.
- Experimentación docente: por su tamaño y su licencia Apache 2.0, es un banco de pruebas asequible para estudiar cuantización, imatrix y degradación de calidad entre variantes Q2 y Q6.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card de esta cuantización ni la documentación del modelo base incluyen cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de evaluaciones de seguridad. Tampoco hay datos de perplejidad comparativa entre los distintos tipos de cuantización ofrecidos; el autor enlaza únicamente una gráfica genérica de ikawrakow sobre calidad relativa de tipos de cuantización, no mediciones de este modelo.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Perplejidad por cuantización | No disponible |
| Evaluaciones de seguridad / refusal rate | No disponible |

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del tamaño de cada fichero GGUF más overhead de contexto y caché KV; no proceden de mediciones publicadas.

| Cuantización | Tamaño | VRAM estimada (contexto moderado) | Notas |
|---|---|---|---|
| i1-IQ2_M | 2,6 GB | ~3,5-4 GB | Cabe en GPU de 4 GB; calidad degradada |
| i1-IQ3_M | 3,4 GB | ~4,5-5 GB | Compromiso razonable en 6 GB |
| i1-IQ4_XS | 4,0 GB | ~5-5,5 GB | Recomendada por el autor frente a IQ4_NL |
| i1-Q4_K_S | 4,2 GB | ~5,5 GB | Definida por el autor como óptima en tamaño/velocidad/calidad |
| i1-Q4_K_M | 4,5 GB | ~5,5-6 GB | Rápida y recomendada por el autor |
| i1-Q6_K | 6,0 GB | ~7-8 GB | Prácticamente equivalente al Q6_K estático |
| FP16 (referencia) | ~14,5 GB | ~16 GB+ | Requiere el repositorio del modelo base, no este |

- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones Q4-Q6; A100 o H100 solo si se necesita servir en lote con vLLM y muchos contextos concurrentes.
- Cabe en GPU consumer: sí, desde una GTX 1650 de 4 GB con IQ2_M hasta una RTX 4090 con Q6_K y contexto largo. También es viable en CPU con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI. vLLM y TGI tienen soporte de GGUF parcial y limitado; para producción a gran escala conviene convertir o usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 7B, el rendimiento vendrá determinado por el ancho de banda de memoria de la GPU y por el tamaño de la cuantización elegida, no por características del modelo en sí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mistral-7b-instruct-v0.2-heretic-i1-GGUF (este) | 7,24 B | 32.768 | Apache 2.0 | GGUF (23 quants i1) | Abliterado, solo inglés, sin benchmarks publicados |
| Ananasez/mistral-7b-instruct-v0.2-heretic | 7,24 B | 32.768 | Apache 2.0 | Safetensors | Modelo base sin cuantizar; requiere ~14,5 GB en FP16 |
| mradermacher/mistral-7b-instruct-v0.2-heretic-GGUF | 7,24 B | 32.768 | Apache 2.0 | GGUF (quants estáticos) | Mismo modelo, cuantización sin imatrix; alternativa directa |
| Mistral-7B-Instruct-v0.2 (original) | 7,24 B | 32.768 | Apache 2.0 | Safetensors / GGUF | Con alineamiento y rechazos; referencia para comparar el efecto de la abliteración |
| mradermacher/Mistral-7B-Instruct-v0.2-8bit-abliterated-i1-GGUF | 7,24 B | 32.768 | Apache 2.0 | GGUF | Otra vía de abliteración sobre el mismo base; sin datos comparativos de calidad |

No hay datos públicos de rendimiento que permitan comparar cualitativamente estas variantes entre sí; la elección entre ellas se basa en el método de abliteración y en el tipo de cuantización, no en métricas.

## Limitaciones y advertencias

- Modelo únicamente en inglés: no está entrenado ni evaluado en castellano; su uso en español producirá respuestas degradadas y mezclas de idioma.
- Sin benchmarks: no hay ninguna medición publicada de calidad, y la abliteración suele provocar degradación de coherencia, razonamiento y adherencia a instrucciones respecto al Instruct original.
- Riesgo elevado de contenido dañino: al eliminar la dirección de rechazo, el modelo puede generar instrucciones peligrosas, contenido sexual explícito, discurso de odio o desinformación sin filtros. No es apto para aplicaciones de cara al público sin capas de moderación externas.
- Alucinación: como todo modelo de 7B de esta generación, inventa hechos, citas y referencias con facilidad, especialmente en contextos largos.
- Contexto: aunque soporta 32k tokens, la calidad decae en el extremo superior de la ventana y el consumo de VRAM crece de forma notable con contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el despliegue del modelo abliterado puede incumplir las políticas de uso de plataformas de inferencia gestionada (Hugging Face Inference, Together, etc.), que a menudo prohíben contenido sin filtrar.
- Solo GGUF: este repositorio no contiene safetensors; para entrenamiento, fine-tuning o evaluación con transformers hay que acudir al modelo base.
- Fecha de creación del repositorio: 27 de octubre de 2026, con 0 descargas y 1 like, lo que implica ausencia total de validación por parte de la comunidad.
- Cuantizaciones por debajo de Q3: las variantes IQ2 y Q2_K degradan la calidad de forma apreciable; el propio autor desaconseja algunas (por ejemplo, IQ3_XXS frente a Q2_K).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/mistral-7b-instruct-v0.2-heretic-i1-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#mistral-7b-instruct-v0.2-heretic-i1-GGUF
- Quants estáticos del mismo modelo: https://huggingface.co/mradermacher/mistral-7b-instruct-v0.2-heretic-GGUF
- Modelo base (abliterado, safetensors): https://huggingface.co/Ananasez/mistral-7b-instruct-v0.2-heretic
- Cuantizaciones i1 del Mistral-7B-Instruct-v0.2 original: https://huggingface.co/mradermacher/Mistral-7B-Instruct-v0.2-i1-GGUF
- Repositorio de peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad relativa por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ficha del modelo en abliteration.org (variante 8-bit abliterated del mismo base): https://abliteration.org/models/mradermacher/Mistral-7B-Instruct-v0.2-8bit-abliterated-i1-GGUF
- Repositorio GGUF alternativo del Mistral-7B-Instruct-v0.2: https://github.com/GourmetBytes/Mistral-7B-Instruct-v0.2-GGUF
- Notas de despliegue del Mistral-7B-Instruct-v0.2: https://github.com/inferless/Mistral-7B-Instruct-v0.2
