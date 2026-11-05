# mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored es un ajuste fino (fine-tune) del modelo Qwen3.8 de 27.320 millones de parámetros, desarrollado por DavidAU y cuantizado a GGUF por mradermacher. El modelo se presenta como una variante "uncensored" orientada a usos creativos y de rol, con un énfasis explícito en eliminar restricciones de contenido mediante técnicas que el autor denomina "Heretic", "Cold Fusion" y "GAIN Training". La model card describe un entrenamiento multi-etapa sobre datasets propietarios (Polar-STRICT y F451-STRICT) y una arquitectura de "modos" de razonamiento e instrucción.

La relevancia de esta ficha es doble: por un lado, documenta una de las variantes cuantizadas del ecosistema Qwen3.8 de 27B, un tamaño que se sitúa en el rango de "modelo grande que cabe en una sola GPU de 24-48 GB con cuantización agresiva"; por otro, expone las limitaciones de trazabilidad de los fine-tunes comunitarios, donde gran parte de las afirmaciones de la model card no vienen acompañadas de benchmarks verificables ni de detalles técnicos reproducibles.

El repositorio ocupa 190,8 GB e incluye 12 cuantizaciones estáticas (de Q2_K a Q8_0) más dos ficheros mmproj para entrada multimodal. La licencia declarada es Apache 2.0 y el idioma soportado es únicamente inglés según los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); repo base en bfloat16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer derivado de la familia Qwen3.8 con 27,3 mil millones de parámetros. El autor del fine-tune describe un proceso de "multi-stage tuning" con técnicas etiquetadas como "Heretic", "Cold Fusion" y "GAIN Training", y menciona el uso de los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO.

La model card declara de forma explícita la existencia de "27 reasoning modes", "27 instruct modes", "9 Xhigh reasoning modes", "15 AI Constructs", "5 Super AI Constructs" y "21 AGI Constructs", además de constructos con nombre propio (Brainstorm, Brainstorm Business, Universal Teacher, Agent, Coder, Turbo-Brilliance). No se proporciona documentación técnica sobre cómo se implementan estos modos (¿prompts de sistema predefinidos?, ¿LoRAs?, ¿mezcla de expertos?) ni sobre su evaluación. Tampoco se documenta la innovación técnica concreta del ajuste "Heretic" más allá de la etiqueta.

## Capacidades

- Generación de texto conversacional en inglés.
- Modo "thinking"/razonamiento declarado por el autor (sin especificación técnica).
- Modos de instrucción y razonamiento etiquetados (27 + 27 + 9 modos según la model card, sin documentación de uso).
- Generación de código (etiqueta "coder").
- Escritura creativa, ficción, rol y "todos los géneros" según el autor.
- Entrada multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que sugiere soporte de visión a través de llama.cpp, aunque la model card no detalla la arquitectura visual ni los idiomas de la misma.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes multi-paso: no disponible (no declarado).

## Casos de uso

- Escritura creativa y ficción: el ajuste está orientado explícitamente a "todos los géneros" y "roleplaying"; con 27B parámetros y cuantización Q4_K_M (16,9 GB) puede ejecutarse en una GPU de consumo de 24 GB para generar narrativa larga.
- Generación de rol y personajes: los "AI Constructs" declarados (Brainstorm, Universal Teacher, Agent, Coder) sugieren plantillas de sistema para conversaciones de personaje; útil en prototipos de videojuegos o chatbots de rol.
- Asistencia a la escritura en inglés: borradores, reescritura y expansión de textos, aprovechando el modo instruct.
- Experimentación con modelos "uncensored": investigación sobre comportamiento de modelos sin alineación de seguridad, útil en entornos controlados de evaluación de sesgos y riesgos.
- Prototipado local con llama.cpp/Ollama: las cuantizaciones Q4_K_S y Q4_K_M (15,9 y 16,9 GB) permiten desplegar el modelo en estaciones de trabajo con una RTX 4090 o similar.
- Generación de código en inglés: la etiqueta "coder" sugiere uso para autocompletado o generación de scripts, aunque sin benchmarks que lo respalden.
- Procesamiento multimodal básico: los ficheros mmproj permiten, en teoría, entrada de imágenes en llama.cpp, aunque no se documenta calidad ni resolución soportada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~11 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~12,4 / 13,6 / 14,7 GB.
  - Q4_K_S / Q4_K_M: ~15,9 / 16,9 GB.
  - Q5_K_S / Q5_K_M: ~19,1 / 19,6 GB.
  - Q6_K: ~22,5 GB.
  - Q8_0: ~29,1 GB.
  - Añadir ~0,7-1,0 GB si se usa el fichero mmproj para visión.
- GPU recomendadas:
  - Q4_K_M en RTX 4090 (24 GB) o RTX 3090 (24 GB).
  - Q6_K en RTX 4090 con margen ajustado o en A6000 (48 GB).
  - Q8_0 en A100 40 GB, L40S 48 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o Q5; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requerirían el repo base en bfloat16, ~54 GB en fp16).
- Latencia y throughput: no disponibles (no publicados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored (este) | 27,3 B | no disponible | Apache 2.0 | GGUF | Fine-tune comunitario sin benchmarks |
| Qwen3.8-27B base (DavidAU) | 27,3 B | no disponible | Apache 2.0 | bfloat16 | Modelo origen del fine-tune |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia de la familia Qwen con benchmarks publicados |
| Gemma-2-27B-it | 27 B | 8.192 tokens | Gemma license | safetensors, GGUF | Tamaño comparable, benchmarks publicados |

La comparación con Qwen2.5-32B y Gemma-2-27B es orientativa por tamaño y categoría; no se dispone de datos de rendimiento de este fine-tune que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo "uncensored": el ajuste elimina deliberadamente las barreras de seguridad del modelo base; puede generar contenido ofensivo, ilegal o dañino. No apto para producción sin filtros externos.
- Sin benchmarks: no hay datos verificables de MMLU, HumanEval, GSM8K ni de calidad del ajuste; las afirmaciones de la model card ("27 reasoning modes", "AGI Constructs") no están documentadas técnicamente.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Contexto: no se especifica la longitud de contexto soportada; no se debe asumir la del Qwen3.8 base sin confirmación.
- Trazabilidad: el fine-tune encadena un modelo base comunitario (DavidAU) sobre el que no hay documentación pública de evaluación; el riesgo de alucinación y de degradación respecto al original es desconocido.
- Licencia Apache 2.0 declarada, pero el cumplimiento de la licencia del modelo Qwen subyacente (y de los datasets Polar-STRICT/F451-STRICT) debe verificarse antes de uso comercial.
- Ficheros mmproj incluidos pero sin documentación de la arquitectura visual ni de la resolución soportada.
- Repositorio de 190,8 GB: la descarga completa es costosa; conviene bajar solo la cuantización necesaria.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación nulo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF
- Modelo base (fine-tune): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
