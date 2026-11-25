# mradermacher/EliasAI-Micro-i1-GGUF

## Resumen

EliasAI-Micro-i1-GGUF es una colección de cuantizaciones GGUF del modelo ETME-TECH/EliasAI-Micro-v1.0, un ajuste fino conversacional en alemán derivado de Qwen/Qwen3.5-0.8B-Base. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF en Hugging Face, que en esta versión emplea cuantización ponderada con matriz de importancia (imatrix) para mejorar la calidad de los formatos de baja precisión. El modelo original tiene 1.006.672.704 parámetros y una licencia Apache 2.0.

La relevancia de esta ficha reside en que empaqueta un modelo de menos de mil millones de parámetros en formatos que van desde 0,5 GB hasta 0,9 GB, lo que permite ejecutarlo en hardware muy modesto, incluidos portátiles sin GPU dedicada o dispositivos de borde. Está etiquetado como modelo conversacional en alemán, lo que lo orienta a asistentes de chat y tareas de generación de texto en ese idioma, aunque su base Qwen3.5 le confiere capacidades multilingües heredadas.

La información disponible es limitada: la model card del repositorio se centra casi exclusivamente en los detalles de cuantización y no documenta el entrenamiento, los datos ni los benchmarks del modelo subyacente. Por tanto, varias especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B-Base; detalles no disponibles) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; ademas de fichero imatrix |
| Idiomas soportados | Aleman (etiqueta `de`); idiomas adicionales no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); repo de 14,0 GB en total |

## Arquitectura y entrenamiento

El modelo subyacente, ETME-TECH/EliasAI-Micro-v1.0, es un ajuste fino (finetune) de Qwen/Qwen3.5-0.8B-Base, según las etiquetas de la model card. No se dispone de detalles sobre la arquitectura interna más allá de su procedencia Qwen3.5, ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio de cuantización no incluye esa información.

La innovación técnica documentada en este repositorio es el proceso de cuantización: mradermacher genera cuantizaciones ponderadas con matriz de importancia (imatrix), una técnica que estima la importancia de cada tensor para asignar más bits a los pesos críticos y menos a los menos relevantes. Esto permite que formatos de 1 a 4 bits por peso conserven mejor la perplejidad que las cuantizaciones estáticas equivalentes. El repositorio incluye además un fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Existe una colección paralela de cuantizaciones estáticas en mradermacher/EliasAI-Micro-GGUF.

## Capacidades

- Generación de texto conversacional en alemán, orientada a diálogos multi-turno.
- Generación de texto general y respuesta a instrucciones, heredada del ajuste fino sobre Qwen3.5.
- Capacidades multilingües potenciales por su base Qwen3.5, aunque solo el alemán está etiquetado explícitamente.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta soporte de visión, audio ni modo de razonamiento extendido (thinking mode).
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Asistente conversacional en alemán en local: el modelo puede gestionar diálogos multi-turno en un portátil sin GPU dedicada, ya que la cuantización Q4_K_M ocupa unos 0,8 GB y cabe en RAM convencional.
- Chatbot de atención al cliente en alemán para pymes: al ejecutarse en CPU con llama.cpp u Ollama, permite desplegar un asistente sin costes de API y con los datos en la propia infraestructura.
- Prototipado rápido de aplicaciones de chat: los formatos IQ2/IQ3 (0,5-0,7 GB) permiten iterar en entornos con recursos mínimos antes de escalar a un modelo mayor.
- Generación de texto en dispositivos de borde: el tamaño reducido de las cuantizaciones Q4 permite integración en Raspberry Pi o mini-PC para tareas de redacción y resumen en alemán.
- Filtrado y clasificación de texto en alemán: el modelo puede usarse para tareas de etiquetado o reformulación dentro de pipelines locales, con latencia baja en CPU.
- Educación y experimentación: sirve como modelo de referencia para estudiar el efecto de distintas cuantizaciones (i1 frente a estáticas) sobre la calidad en un modelo de menos de mil millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 0,5 GB (IQ1_S) hasta unos 0,9 GB (Q6_K) para los pesos cuantizados; el fichero imatrix ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere hardware de datacenter. Funciona en CPU sin GPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1050, RTX 3050, RTX 4090, etc.), e incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de ~1.000 millones de parámetros, se espera una latencia baja en CPU y muy baja en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EliasAI-Micro-i1-GGUF (este) | 1.006.672.704 | No disponible | Apache 2.0 | GGUF (i1) | Ajuste fino conversacional en aleman sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B-Base | ~0,8B | No disponible | No disponible | safetensors | Modelo base del que deriva |
| ETME-TECH/EliasAI-Micro-v1.0 | 1.006.672.704 | No disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| mradermacher/EliasAI-Micro-GGUF | 1.006.672.704 | No disponible | Apache 2.0 | GGUF (estatico) | Cuantizaciones estaticas del mismo modelo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste fino conversacional en alemán, es probable que herede sesgos de sus datos de entrenamiento, no especificados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- El contexto máximo no está documentado, lo que impide planificar cargas de trabajo con ventanas largas.
- Solo el alemán está etiquetado como idioma soportado; el rendimiento en otros idiomas, aunque posible por la base Qwen3.5, no está verificado.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate".
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5, no indicada en la información disponible.
- El repositorio tiene 0 likes y 895 descargas en la fecha de consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/EliasAI-Micro-i1-GGUF
- Modelo original: https://huggingface.co/ETME-TECH/EliasAI-Micro-v1.0
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/EliasAI-Micro-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#EliasAI-Micro-i1-GGUF
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
