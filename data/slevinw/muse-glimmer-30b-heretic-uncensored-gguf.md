# slevinw/Muse-Glimmer-30B-Heretic-Uncensored-GGUF

## Resumen

Muse-Glimmer-30B-Heretic-Uncensored-GGUF es una suite de 27 cuantizaciones GGUF de un modelo derivado de **Muse-Glimmer-30B**, un modelo multimodal de razonamiento desarrollado por Meta Superintelligence Lab con licencia Apache 2.0. El derivado ha sido sometido a un proceso de *abliteration* (eliminación de capas de rechazo) mediante la herramienta Heretic v1.4.0, lo que elimina los mecanismos de negativa ante contenido adulto o NSFW, manteniendo la arquitectura original del modelo base.

Este repositorio, creado por slevinw, ofrece una gama de cuantizaciones que van desde 6,53 GB (IQ1_S) hasta 55,73 GB (F16/BF16), permitiendo el despliegue en hardware heterogéneo, desde sistemas solo CPU hasta GPU con 32 GB de VRAM. Todas las cuantizaciones sub-4-bit se calibraron con una matriz de importancia (imatrix) para mitigar la degradación de calidad. El modelo base es un transformer causal denso con encoder de visión (ViT-G/14) de aproximadamente 1.800 millones de parámetros, con una ventana de contexto de 131.072 tokens y soporte para entrada de texto e imagen.

La relevancia de este lanzamiento radica en su doble naturaleza: por un lado, ofrece una versión cuantizada y optimizada de un modelo multimodal de última generación (con fecha de corte de conocimiento de enero de 2026), y por otro, presenta una variante "uncensored" que elimina los rechazos, lo que plantea tanto oportunidades como riesgos en términos de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Causal Transformer con Perception Encoder (ViT-G/14, ~1.8B) |
| Parametros totales | 27.854.794.240 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M, IQ3_S, IQ3_XS, Q2_K, Q2_K_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ3_XXS, TQ2_0, TQ1_0, IQ1_M, IQ1_S (27 archivos) |
| Idiomas soportados | Ingles, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors original disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B emplea una arquitectura de transformer causal denso con un encoder de visión tipo ViT-G/14 de aproximadamente 1.800 millones de parámetros. El bloque de lenguaje tiene 52 capas, hidden size de 6656, atención con group-query attention (GQA) con 32 cabezas de consulta y 2 cabezas de clave/valor (ratio 16:1), y un patrón de sliding window de 2048 tokens con una proporción 3:1 entre atención local y global. La capa FFN usa activación SwiGLU con dimensión intermedia de 19.968. La codificación posicional es RoPE con theta de 500.000, aplicada solo en capas locales. El vocabulario consta de 202.048 tokens (200.000 BPE + 2.048 especiales).

El proceso de ablación se realizó con Heretic v1.4.0, que elimina las direcciones de rechazo en el espacio de activaciones del modelo, resultando en una divergencia KL de 0,0743 respecto al base. Este proceso no modifica los pesos del modelo original sino que identifica y suprime las representaciones internas asociadas a la negativa. La cuantización se llevó a cabo con llama.cpp en su rama master (commit `030ebb5`), dado que el soporte para la arquitectura `muse_glimmer` no está presente en binarios de release anteriores a b10344. Se usó `convert_hf_to_gguf.py` para la conversión a F16 (731 tensores, ~2,5 min), `llama-imatrix` para calibrar la matriz de importancia sobre `wiki.raw` con 128 chunks (~2,5 h), y `llama-quantize.exe` para las cuantizaciones.

## Capacidades

- **Razonamiento multimodal**: acepta entrada de texto e imagen y genera texto, con capacidades de razonamiento sobre imágenes.
- **Tool calling nativo**: el modelo base está ajustado para llamada de funciones, lo que permite integrarlo en flujos de agente.
- **Salida de razonamiento separada**: según la ficha de NVIDIA NIM, el modelo produce una salida de razonamiento independiente antes de la respuesta final.
- **Agentes siempre activos**: optimizado para tareas largas, recuperación de fallos y uso continuado en dispositivos locales.
- **Ventana de contexto extensa**: 131.072 tokens, adecuada para documentos largos y conversaciones multi-turno.
- **Multilingüe**: aunque el entrenamiento principal es en inglés, soporta otros idiomas de forma general.
- **Ausencia de rechazos**: el proceso de ablación elimina las negativas ante contenido adulto o NSFW, verificado empíricamente por el autor.

## Casos de uso

- **Asistentes locales de productividad**: el modelo puede ejecutarse en una GPU de consumo (por ejemplo, RTX 4090 con cuantización Q5_K_M) para gestionar calendarios, correos y tareas de oficina con contexto largo, gracias a su ventana de 131K tokens y soporte de tool calling.
- **Análisis de documentos con imágenes**: al aceptar entrada visual, puede extraer información de capturas, diagramas o documentos escaneados, combinando OCR y razonamiento en un solo paso.
- **Agentes de automatización de tareas**: su capacidad de llamada de funciones y razonamiento multi-paso lo hace apto para pipelines de automatización (por ejemplo, orquestar APIs, enviar respuestas, actualizar bases de datos) en entornos de servidor con 32 GB de VRAM usando Q8_0.
- **Generación de contenido creativo sin restricciones**: para proyectos de ficción, guiones o narrativa adulta, donde el modelo no rechaza solicitudes explícitas, aunque debe usarse con responsabilidad legal y ética.
- **Investigación en alineación y seguridad**: la versión abliterada permite estudiar los efectos de la eliminación de rechazos en el comportamiento del modelo, comparando con la versión original para entender mecanismos de seguridad.
- **Despliegue en CPU para entornos sin GPU**: con cuantizaciones extremas como IQ1_S (6,53 GB), el modelo puede ejecutarse en sistemas con solo 8 GB de RAM, útil para prototipos o entornos de bajo coste.
- **Chatbots de nicho con contexto largo**: para comunidades específicas que requieren conversaciones prolongadas con memoria extensa, la ventana de 131K tokens permite mantener el historial completo sin truncamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la fidelidad de la variante Q4_K_S respecto al F16 se cuantificó mediante perplejidad a nivel de token en un conjunto de evaluación fijo, pero no se proporcionan valores numéricos. No se dispone de resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este derivado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: según la tabla de selección de la model card, las cuantizaciones van desde 6,53 GB (IQ1_S) hasta 55,73 GB (F16/BF16). Para 64K de contexto, se requiere añadir el KV cache: aproximadamente 1,7 GB en FP16, 0,85 GB en Q4_0.
- **GPU recomendadas**:
  - 8 GB VRAM (RTX 3060/4060): IQ2_XXS / IQ2_XS (8,0–8,7 GB)
  - 10 GB VRAM: IQ3_XXS / IQ3_XS (7,3–12,0 GB)
  - 12 GB VRAM (RTX 3060 12G): IQ3_S / Q3_K_S (12,5 GB)
  - 16 GB VRAM (RTX 4080): Q4_K_S / IQ4_XS (16,1 GB)
  - 24 GB VRAM (RTX 4090): Q5_K_M / Q6_K (19,8–22,9 GB)
  - 32 GB VRAM: Q8_0 (29,6 GB)
- **CPU / RAM-only**: cuantizaciones IQ1_S / IQ1_M / TQ1_0 (6,5–7,2 GB) funcionan en sistemas con 8 GB de RAM.
- **Opciones de despliegue**: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros runners basados en llama.cpp. Para servidores de alto rendimiento, se puede usar vLLM o TGI si se convierte a safetensors (el modelo base original está disponible).
- **Latencia y throughput**: no se proporcionan datos específicos. Dependerá de la cuantización, el hardware y la longitud de contexto. En una RTX 4090 con Q5_K_M se espera una generación de varios tokens por segundo, pero sin cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El modelo base Muse-Glimmer-30B se posiciona como competidor de otros modelos multimodales de ~30B como Qwen2-VL-32B o Llama-3.2-90B-Vision, pero no hay benchmarks que permitan una comparación cuantitativa. La variante abliterada es única en su categoría por la eliminación de rechazos, por lo que no existen alternativas directas con las mismas características.

## Limitaciones y advertencias

- **Contenido NSFW y legalidad**: el modelo no presenta rechazos ante contenido adulto, lo que puede violar términos de servicio de plataformas y leyes locales. El uso comercial debe evaluarse cuidadosamente.
- **Sesgos y alucinaciones**: al ser un modelo base sin ajuste fino específico, puede generar información falsa o sesgada, especialmente en dominios especializados.
- **Riesgo de uso indebido**: la ausencia de filtros puede facilitar la generación de contenido dañino, difamatorio o ilegal. El autor no ofrece garantías de seguridad.
- **Contexto y calidad en cuantizaciones extremas**: las cuantizaciones por debajo de 3 bits (IQ1, TQ1, TQ2) pueden degradar significativamente la calidad del texto y la coherencia.
- **Soporte de arquitectura**: requiere versiones recientes de llama.cpp (posteriores a b10344) para cargar el modelo; no es compatible con binarios antiguos.
- **Falta de benchmarks**: no hay métricas objetivas que respalden el rendimiento del modelo, lo que dificulta evaluar su calidad frente a alternativas.
- **Fecha de corte**: el conocimiento del modelo se limita a enero de 2026, por lo que no conoce eventos posteriores.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/slevinw/Muse-Glimmer-30B-Heretic-Uncensored-GGUF)
- [Modelo base meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Otra versión GGUF de Muse-Glimmer-30B-heretic-v2](https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-v2-GGUF)
- [Ficha del modelo en NVIDIA NIM](https://build.nvidia.com/meta/muse-glimmer-30b/modelcard)
- [Página oficial de Muse Glimmer en Meta Developer](https://developer.meta.com/ai/models/muse-glimmer/)
- [Repositorio GitHub de introducción a Muse Glimmer](https://github.com/cobusgreyling/Muse-Glimmer)
- [Proyecto Heretic](https://heretic-project.org/)
