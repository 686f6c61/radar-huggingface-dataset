# kingjones777/Summerwise-27B-SuperRoc-GGUF

## Resumen

Summerwise-27B-SuperRoc-GGUF es una compilación cuantizada en formato GGUF del modelo multimodal Pleochroic-Ltd/Summerwise-27B, publicada por el usuario kingjones777. El objetivo no es ofrecer un modelo nuevo, sino una versión optimizada para ejecutarse en hardware AMD Strix Halo (concretamente el Ryzen AI Max+ 395 con iGPU gfx1151) mediante el motor de inferencia Super Roc, que implementa los formatos ROCm-FP4. El pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas de imagen y texto y genera texto.

La relevancia de esta ficha es acotada y muy específica: se trata de un artefacto de despliegue para un ecosistema concreto (ROCm + Strix Halo + Super Roc), no de un modelo con benchmarks públicos ni con una model card técnica detallada. La información disponible se limita a la model card del autor de la cuantización, que incluye métricas de rendimiento medidas en el hardware objetivo (velocidad de prompt, velocidad de generación, latencia de carga) y una comparación de perplejidad frente a un Q4_K_M estándar.

El dato de parámetros totales que reporta Hugging Face para los safetensors es de 460.730.096, lo que resulta inconsistente con la denominación "27B" del modelo base. Esta discrepancia debe tratarse con cautela: no hay información en la model card que explique el número de parámetros reales del modelo base, por lo que en esta ficha se indica la cifra reportada y se advierte de la inconsistencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; no se detalla transformer, MoE u otra) |
| Parámetros totales | 460.730.096 según safetensors reportados por Hugging Face; la denominación comercial es 27B (dato inconsistente, ver limitaciones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens cargados en la medición del autor (contexto configurado en Super Roc) |
| Tipos de cuantización | Q4_0 con formato ROCm-FP4 (archivo principal); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo principal Summerwise-27B-MTP-Q4_0-ROCmFP4-FAST-imatrix.gguf de 15.309.796.896 bytes; mmproj-Summerwise-27B-BF16.gguf de 931.145.760 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Pleochroic-Ltd/Summerwise-27B en la documentación proporcionada. La model card de esta cuantización no describe la arquitectura (transformer denso, MoE, híbrido, SSM), ni los datos de entrenamiento, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se detalla la composición del dataset ni el número de tokens de entrenamiento.

Lo que sí documenta la model card es el proceso de cuantización: se genera un GGUF Q4_0 con formato ROCm-FP4, calibrado con imatrix ("FAST-imatrix"), y se acompaña de un proyector multimodal separado en BF16 (mmproj) que habilita la entrada de imágenes. El nombre del archivo incluye "MTP", lo que sugiere soporte de multi-token prediction como mecanismo de decodificación especulativa (el autor indica `--speculative mtp` y `--min-draft-tokens 1` en el comando de ejemplo). La innovación técnica destacable es, por tanto, la integración de los formatos ROCm-FP4 en el ecosistema llama.cpp/ggml a través del motor Super Roc, orientada a hardware AMD con memoria unificada.

## Capacidades

- Generación de texto y razonamiento: el pipeline image-text-to-text implica capacidad de responder a instrucciones en lenguaje natural.
- Procesamiento de imágenes: el archivo mmproj en BF16 habilita la entrada visual; el autor reporta "Vision: pass" en sus pruebas.
- Tool calling / function calling: el autor mide 7/8 en llamadas requeridas y 7/8 en modo automático, lo que indica soporte funcional aunque no perfecto.
- Modo thinking: desactivado por defecto en el comando de ejemplo, pero activable por petición mediante `chat_template_kwargs.enable_thinking`.
- Decodificación especulativa: soporte de drafter MTP para acelerar la generación.
- Prompt lookup y caché de prompt: el motor soporta reutilización de contexto (6961 de 6986 tokens cacheados en el segundo turno según la medición).
- Capacidades multilingües: no disponible.
- Capacidades de agente multi-paso: no documentadas explícitamente; el soporte de tool calling es un indicio, pero no hay evidencia de evaluación de agentes.

## Casos de uso

- Asistente local con entrada de imágenes en un equipo Strix Halo: el modelo puede recibir capturas de pantalla o fotografías junto a una pregunta de texto y responder, aprovechando el proyector multimodal BF16 y el contexto de 131.072 tokens configurado. Es adecuado porque el artefacto está empaquetado específicamente para ese hardware.
- Automatización de extracción de información de documentos técnicos: la perplejidad medida sobre un documento técnico en inglés de 11K tokens (5,29) sugiere un comportamiento razonable en ese dominio; se usaría con contexto de 4K o superior según la ventana disponible.
- Integración en pipelines con tool calling: con una tasa de 7/8 en llamadas requeridas, puede emplearse para orquestar funciones en flujos controlados donde se valide la salida y se reintente en caso de fallo.
- Chat multi-turno con caché de prompt: el motor reutiliza 6961 de 6986 tokens en el segundo turno, lo que abarata conversaciones largas sobre el mismo documento o imagen; útil en atención al usuario con contexto persistente.
- Generación de código asistida en local: el autor mide 32,7 tok/s en generación de código (media de dos prompts), suficiente para autocompletado interactivo en un entorno de desarrollo sobre el mismo equipo.
- Prototipado de aplicaciones multimodales sin GPU dedicada: al ejecutarse en una iGPU con memoria unificada de 128 GB, permite probar aplicaciones image-text-to-text en un portátil o mini-PC sin depender de una A100 o H100.
- Despliegue servido vía Lemonade: el autor documenta `lemonade pull` y `lemonade chat` para consumir el modelo desde el ecosistema Lemonade, útil para entornos de demostración y pruebas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta métricas de despliegue y una comparación de perplejidad:

| Métrica | Valor | Contexto |
|---|---|---|
| Perplejidad (documento técnico en inglés, 11K tokens, contexto 4096) | 5,29 | Frente a 5,25 del Q4_K_M estándar del mismo modelo |
| Tiempo de carga | 14 s | Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.1 |
| Prompt tok/s (p1k) | 587,6 | Una petición a la vez |
| Prompt tok/s (p8k) | 611,9 | Una petición a la vez |
| Generación tok/s (p1k) | 26,12 | Una petición a la vez |
| Generación tok/s (p8k) | 50,98 | Una petición a la vez |
| Generación de código tok/s | 32,7 | Media de dos prompts de código |
| Tool calls (requeridas / automáticas) | 7/8 / 7/8 | Pruebas del autor |
| Caché de prompt, turno 2 | 6961 / 6986 tokens | Reutilización de contexto |
| Contexto cargado | 131.072 tokens | Configuración del comando de ejemplo |
| Visión | pass | Prueba del autor |

## Requisitos de hardware

- VRAM/memoria: el archivo principal ocupa 15,31 GB y el proyector multimodal 0,93 GB, por lo que se necesita al menos ~16,3 GB de memoria disponible para los pesos, más el espacio para el contexto KV (que a 131.072 tokens puede ser considerable). El autor lo ejecuta en un Ryzen AI Max+ 395 con 128 GB de memoria unificada.
- GPU recomendadas: el artefacto está diseñado y probado para AMD Strix Halo (Ryzen AI Max+ 395, gfx1151) con ROCm. No hay datos de ejecución en A100, H100 ni RTX 4090 en la información disponible.
- GPU de consumo: al tratarse de un formato ROCm-FP4 y un motor específico (Super Roc), no se documenta compatibilidad con GPU de consumo NVIDIA. El tamaño de pesos (~16 GB) encajaría teóricamente en GPUs con 24 GB, pero no hay evidencia de que el formato funcione fuera de ROCm/Strix Halo.
- Opciones de despliegue: Super Roc (motor del autor, `superroc serve`), Lemonade (con `llamacpp.rocm_bin` apuntando a los binarios de Super Roc). No se documenta vLLM, TGI ni Ollama.
- Latencia y throughput: ver tabla de benchmarks; generación entre 26 y 51 tok/s según longitud de prompt, prompt processing en torno a 590-612 tok/s, con una sola petición concurrente.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar el rendimiento del modelo con alternativas de la misma categoría. La única comparación documentada es interna, frente a una cuantización Q4_K_M estándar del mismo modelo base:

| Modelo | Cuantización | Perplejidad (11K tokens, ctx 4096) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Summerwise-27B-SuperRoc-GGUF | Q4_0 ROCm-FP4 + imatrix | 5,29 | apache-2.0 | Hugging Face (este repo) |
| Summerwise-27B (stock) | Q4_K_M | 5,25 | apache-2.0 | Repo del modelo base |

Comparativa con otros modelos multimodales de tamaño similar: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Inconsistencia en el número de parámetros: Hugging Face reporta 460.730.096 parámetros en safetensors, mientras que el nombre del modelo indica 27B. No hay explicación en la model card; conviene verificar el modelo base antes de asumir capacidades asociadas a un tamaño de 27B.
- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de visión publicadas, por lo que el rendimiento en tareas reales no está caracterizado más allá de la perplejidad y las métricas de velocidad.
- Tool calling imperfecto: 7/8 en llamadas requeridas y 7/8 en automáticas implica una tasa de fallo no despreciable; en producción conviene validar y reintentar.
- Dependencia de hardware y software muy específicos: el artefacto está pensado para Super Roc sobre Strix Halo con ROCm; fuera de ese entorno la compatibilidad no está garantizada.
- Idiomas no declarados: no se especifica qué idiomas soporta el modelo base; no se debe asumir calidad en castellano sin evaluación previa.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación específica de factualidad en la información disponible.
- Sesgos: no se documentan sesgos conocidos en la model card; al no haber información sobre el dataset de entrenamiento, no es posible evaluarlos.
- Licencia: apache-2.0 permite uso comercial, pero al ser una cuantización de un modelo base de terceros, conviene revisar también la licencia y condiciones del modelo base Pleochroic-Ltd/Summerwise-27B.
- Repositorio con muy baja adopción (128 descargas, 0 likes) y creado y actualizado el mismo día (23 de noviembre de 2026), lo que reduce la evidencia de validación por la comunidad.
- El comando de ejemplo desactiva el modo thinking; el rendimiento reportado corresponde a esa configuración y podría no extrapolarse con thinking activado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Summerwise-27B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/Pleochroic-Ltd/Summerwise-27B
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Proyecto ROCmFPX (formatos ROCm-FP4): https://github.com/charlie12345/ROCmFPX
