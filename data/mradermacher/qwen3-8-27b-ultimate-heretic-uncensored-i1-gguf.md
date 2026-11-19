# mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF es la versión cuantizada en formato GGUF del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, publicada por mradermacher. Se trata de un fine-tune de la familia Qwen3.8 (27.320.697.856 parámetros reales según safetensors) con un proceso de "ablación" de alineación (heretic) y entrenamiento multietapa (Cold Fusion, GAIN Training) orientado a eliminar restricciones de rechazo y ampliar el rango de estilos de respuesta. El resultado es un modelo conversacional sin censura, con modos de razonamiento e instruct diferenciados.

La relevancia de esta ficha está en que no se trata de un modelo oficial de Qwen, sino de una derivación de la comunidad con un pipeline de tuning agresivo y una licencia Apache 2.0 declarada por el autor. El repositorio contiene exclusivamente cuantizaciones GGUF generadas con imatrix (i1), lo que lo hace desplegable en llama.cpp y derivados sin necesidad de GPUs de centro de datos. El tamaño del repo (218,6 GB) refleja el conjunto completo de cuantizaciones, desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB).

El modelo se posiciona para casos de escritura creativa, roleplay, generación de ficción y tareas de agente donde el filtrado de seguridad estándar resulta limitante. No obstante, la model card es escasa en especificaciones verificables (contexto, dataset exacto, benchmarks), por lo que muchos parámetros deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.8; detalles no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (también hay cuantizaciones estáticas en el repo hermano) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bfloat16 |
| Tamano del repo | 218,6 GB (conjunto completo de cuantizaciones) |
| Modelo base | DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-11-05 |
| Ultima actualizacion | 2026-11-11 |
| Descargas | 4157 |
| Likes | 2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.8, con 27.320.697.856 parámetros y pesos en bfloat16 en el modelo original. La model card no detalla la configuración de capas, cabezas de atención ni dimensión oculta, por lo que no es posible confirmar variantes como atención lineal, decodificación especulativa o arquitecturas híbridas. Tampoco se especifica la longitud de contexto nativa, un dato crítico para evaluar su idoneidad en producción.

El entrenamiento se describe mediante etiquetas y términos del autor: "Cold Fusion", "GAIN Training", "Multi-stage tuning" y "heretic". El proceso heretic hace referencia a técnicas de ablación de dirección de rechazo (refusal direction ablation) que buscan eliminar respuestas de negativa aprendidas durante el alineamiento. Los datasets citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. Se mencionan 27 modos de razonamiento, 27 modos instruct, 9 modos Xhigh reasoning, 15 AI Constructs, 5 Super AI Constructs y 21 AGI Constructs, que parecen ser presets de system prompt o plantillas de comportamiento más que componentes arquitectónicos. No se aportan cifras de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La cuantización i1 (imatrix) ha sido realizada por mradermacher con un fichero imatrix propio (0,1 GB) que permite generar cuantizaciones adicionales. El autor advierte que las cuantizaciones IQ suelen superar a las no-IQ de tamaño similar, y que Q4_K_M es la opción recomendada para equilibrio velocidad/calidad.

## Capacidades

- Generación de texto conversacional multi-turno en 16 idiomas declarados (ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi).
- Modo de razonamiento (thinking) y modo instruct diferenciados, con 27 variantes de cada uno según el autor.
- Escritura creativa: ficción, relato, poesía y "todos los géneros" según las etiquetas del repositorio.
- Roleplay y conversación de personaje, favorecido por el proceso heretic de reducción de rechazos.
- Generación de código (etiqueta "coder" y "Coder AI Construct").
- Soporte declarado de tool calling y function calling a través del tag "endpoints_compatible" y del "Agent AI Construct".
- Capacidades de agente y razonamiento multi-paso mediante los "AI Constructs" (Agent, Brainstorm, Universal Teacher, Coder).
- Capacidad de visión: la model card indica "This is a vision model - mmproj files (if any) will be in the static repository", aunque no se confirma que existan ficheros mmproj.
- Presets de comportamiento ("Turbo-Brilliance", "Super AI Constructs", "AGI Constructs") que probablemente se activan vía system prompt.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo está afinado específicamente para "all genres", "story", "writing" y "fiction", por lo que puede generar capítulos coherentes con control de estilo mediante system prompt; útil en herramientas de autoría asistida.
- Roleplay y chatbots de personaje sin restricciones: el proceso heretic reduce los rechazos, lo que lo hace adecuado para entornos de entretenimiento y simulación de personajes donde el filtrado estándar interrumpe la conversación.
- Generación de código en local: la etiqueta "coder" y el "Coder AI Construct" sugieren uso en asistentes de programación desplegados con llama.cpp u Ollama, sin dependencia de API externa.
- Agentes autónomos con tool calling: el tag "Agent AI Construct" y "endpoints_compatible" apuntan a integración en pipelines de agente que requieren llamadas a funciones; conviene validar el formato de tool calling en el GGUF antes de producción.
- Traducción y atención al cliente multilingüe: con 16 idiomas declarados, puede gestionar conversaciones en español, francés, alemán, árabe, chino, japonés, entre otros, en despliegues on-premise.
- Destilación de datos sintéticos: al ser un modelo sin censura y con modos de razonamiento, puede emplearse para generar datasets de entrenamiento o evaluaciones adversariales en investigación sobre alineamiento y seguridad.
- Experimentación en investigación de alineamiento: permite estudiar el efecto de la ablación de rechazo comparando respuestas con el modelo base alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas comparativas; las etiquetas del repositorio son descriptivas y no aportan cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - i1-Q2_K: ~11,0 GB de pesos; ~12-13 GB de VRAM con overhead de contexto.
  - i1-IQ3_M / i1-Q3_K_M: ~13-14 GB; ~14-15 GB de VRAM.
  - i1-Q4_K_M (recomendada): ~16,9 GB; ~18-19 GB de VRAM.
  - i1-Q5_K_M: ~19,6 GB; ~21-22 GB de VRAM.
  - i1-Q6_K: ~22,5 GB; ~24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M; A100 40/80 GB o H100 para Q6_K con contexto largo; GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo para IQ3 o Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M o inferiores; en 16 GB con IQ3_S/IQ3_M y contexto moderado; en 12 GB solo con Q2_K y calidad degradada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y servidores compatibles con GGUF. El tag "transformers" del repo es engañoso para los ficheros GGUF; para transformers habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia orientativa no verificada, un modelo de ~27B en Q4_K_M sobre RTX 4090 suele moverse en decenas de tokens por segundo, pero no hay medición publicada para esta cuantización concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF (este) | 27,3B | no disponible | apache-2.0 | GGUF i1 | Fine-tune heretic sin censura, 16 idiomas, cuantizaciones imatrix |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (base) | 27,3B | no disponible | apache-2.0 | safetensors bfloat16 | Modelo original sin cuantizar; requiere transformers y ~55 GB en bf16 |
| mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF (estatico) | 27,3B | no disponible | apache-2.0 | GGUF estatico | Mismas cuantizaciones sin imatrix; incluye posibles mmproj de visión |
| Qwen3 oficial (familia) | variable | variable | variable | safetensors/GGUF | Modelo alineado de referencia; no comparable directamente por falta de datos del fine-tune |

La comparación con modelos de la misma categoría (por ejemplo, otros fine-tunes heretic de 27B o modelos oficiales Qwen3 de tamaño similar) no puede establecerse con rigor porque no hay benchmarks publicados ni se especifica la variante exacta de Qwen3.8 sobre la que se construye.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay métricas verificables de calidad, razonamiento o código; el rendimiento real es desconocido.
- Contexto no documentado: se desconoce la longitud de contexto nativa, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación elevado: al ser un fine-tune sin censura y sin datos de evaluación, la propensión a inventar hechos no está medida.
- Sesgos no evaluados: no se documenta ningún análisis de sesgo; el proceso heretic puede amplificar respuestas sesgadas o inapropiadas al eliminar los mecanismos de rechazo.
- Contenido sensible: el modelo está diseñado explícitamente para reducir rechazos ("uncensored"), por lo que puede generar contenido violento, sexual o dañino; requiere moderación externa en producción.
- Licencia: Apache 2.0 declarada por el autor, pero al derivar de Qwen3.8 conviene verificar la licencia del modelo original y de los datasets Polar-STRICT y F451-STRICT antes de uso comercial.
- Idiomas: los 16 idiomas están declarados en metadatos, pero no hay evaluación de calidad por idioma; el español puede tener un rendimiento inferior al inglés.
- Formato: los ficheros son GGUF; no se pueden cargar directamente con transformers pese al tag de la librería. Para transformers hay que usar el modelo base.
- Visión incierta: la model card menciona que es un modelo de visión, pero no confirma la existencia de ficheros mmproj; no asumir capacidades multimodales sin verificarlo.
- Repositorio de 218,6 GB: descargar el repo completo es inviable en la mayoría de entornos; hay que bajar solo el fichero de cuantización deseado.
- Fecha futura: el modelo está fechado en noviembre de 2026, lo que puede indicar metadatos inconsistentes o un artefacto del repositorio; conviene verificar la procedencia.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
