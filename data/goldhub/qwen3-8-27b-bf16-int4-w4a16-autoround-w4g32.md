# goldhub/Qwen3.8-27B-BF16-INT4-W4A16-AutoRound-W4G32

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27 mil millones de parámetros desarrollado por Alibaba como parte de la familia Qwen3.8. Se trata de un modelo de texto, imagen y video con una ventana de contexto de 262 144 tokens (256K) y licencia Apache 2.0, diseñado para razonamiento, codigo y tareas de agente. Su arquitectura hibrida combina 16 capas de atencion completa y 48 capas de atencion lineal con estado recurrente constante, lo que reduce el coste computacional en contextos largos.

La variante cuantizada de goldhub, identificada como `goldhub/Qwen3.8-27B-BF16-INT4-W4A16-AutoRound-W4G32`, aplica un esquema de cuantizacion W4A16 (pesos de 4 bits, activaciones de 16 bits) mediante AutoRound, preservando las capas criticas (vision encoder, proyecciones de atencion lineal y embeddings) en FP16/BF16 para evitar la degradacion multimodal y el colapso de atencion. El resultado es un peso de repositorio de 28.3 GB, significativamente menor que los ~54 GB del original en BF16, pero mayor que un INT4 estandar (15-18 GB), priorizando la calidad sobre la compresion extrema.

El modelo es relevante porque permite ejecutar un modelo multimodal de 27B con contexto de 256K en hardware de consumo (por ejemplo, dos RTX 3090 de 24 GB) sin perder capacidades de vision, video o razonamiento de largo contexto. Ademas, la alineacion "semi-desinhibida" (descrita como "Heretic" por el autor) lo hace adecuado para tareas creativas y filosoficas sin filtros corporativos, aunque esto conlleva riesgos de sesgos y contenido inapropiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (16 capas de atencion completa + 48 de atencion lineal con estado recurrente), vision encoder para imagen y video |
| Parametros totales | 27B (modelo base); pesos cuantizados en safetensors: 11 575 659 760 (~11.58B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | INT4 (W4A16, group size 32, simetrico, AutoRound v0.15.0) |
| Idiomas soportados | en, zh, ru, uk, el, he (ingles, chino, ruso, ucraniano, griego, hebreo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `auto_round:auto_gptq`) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27B parametros con una arquitectura hibrida de atencion: solo 16 de las 64 capas utilizan atencion completa (con un intervalo `full_attention_interval: 4`), mientras que las otras 48 emplean atencion lineal con un estado recurrente constante. Esta combinacion reduce la complejidad computacional en contextos largos, permitiendo manejar ventanas de hasta 256K tokens con un coste menor que un transformer puramente con atencion completa. El modelo incorpora un vision encoder que procesa tanto imagenes como videos (temporal patch size de 2).

La cuantizacion realizada por goldhub con AutoRound (v0.15.0) utiliza un esquema W4A16 con group size 32, simetria y 1000 iteraciones de calibracion. La innovacion clave es la preservacion en FP16/BF16 de las capas criticas: `embed_tokens`, `model.visual.*` (vision encoder) y `linear_attn.*` (proyecciones de atencion lineal), incluyendo `in_proj_a/b/qkv/z` y `out_proj`. Esto evita la degradacion de la percepcion visual y el colapso de la atencion lineal en contextos largos, a costa de un peso final mayor (28.3 GB) que un cuantizado INT4 convencional.

No se dispone de informacion detallada sobre el entrenamiento del modelo base (composicion del dataset, tokens totales, procesos de RLHF o DPO). El autor de la cuantizacion menciona una alineacion "semi-desinhibida" o "Heretic", que sugiere un ajuste posterior para reducir rechazos, pero no se aportan datos concretos sobre el proceso.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, con soporte para razonamiento paso a paso y explicaciones detalladas en formato LaTeX.
- Comprension de imagenes y video: entrada nativa de imagen y video, con descripcion de escenas, analisis de objetos y respuestas a preguntas visuales.
- Razonamiento matematico y logico: resuelve problemas de algebra, acertijos y problemas de velocidad relativa con pasos rigurosos.
- Generacion de codigo Python y otros lenguajes, con codigo PEP-8 y analisis de complejidad temporal y espacial.
- Escritura creativa y narrativa: capaz de generar ficcion (por ejemplo, relatos cyberpunk/noir) y ensayos filosoficos profundos.
- Soporte de Multi-Token Prediction (MTP) para acelerar la inferencia.
- Razonamiento de largo contexto: sintetiza y resume historias de modelos de lenguaje desde Word2Vec hasta arquitecturas MoE y MTP.
- Alineacion "semi-desinhibida" o "Heretic": permite explorar temas filosoficos, creativos y tecnicos sin rechazos predefinidos.

## Casos de uso

- Asistente de programacion local: el modelo puede generar y depurar codigo Python, JavaScript u otros lenguajes directamente en el editor, aprovechando su capacidad de generar codigo PEP-8 compliant y su soporte de MTP para respuestas rapidas. Su contexto de 256K permite incluir repositorios completos en la ventana de entrada.
- Analisis de documentos multimodales: al procesar imagenes y video, puede extraer informacion de capturas de pantalla, diagramas o videos de demostracion, y responder preguntas sobre su contenido, util para documentacion tecnica o soporte.
- Razonamiento sobre contexto largo: con su ventana de 256K tokens, puede resumir libros, codigos fuente extensos o conversaciones de soporte de multiples turnos, manteniendo la coherencia sin perder informacion anterior.
- Generacion de contenido creativo sin filtros: para escritura de ficcion, guiones o ensayos, el modelo ofrece respuestas sin rechazos predefinidos, permitiendo explorar temas oscuros o no convencionales que otros modelos rechazarian.
- Agentes de automatizacion con tool calling: aunque no se especifica soporte explicito de function calling en la documentacion, su integracion con vLLM y SGLang permite usarlo como base de agentes que ejecutan comandos, leen archivos o interactuan con APIs.
- Educacion y tutoria: su capacidad para resolver problemas matematicos y explicar conceptos con pasos detallados (en formato LaTeX) lo hace util para asistentes de estudio en matematicas, fisica y ciencias de la computacion.
- Despliegue en hardware de consumo: con cuantizacion W4A16 y preservacion de capas criticas, puede ejecutarse en dos GPU de 24 GB (por ejemplo, RTX 3090) con vLLM, lo que permite un asistente multimodal privado sin conexion a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) especificos para esta cuantizacion. Los datos disponibles son:

- El modelo base Qwen3.8-27B (antes de la cuantizacion) alcanza en DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, segun la guia de lovableapp.org. Estos valores corresponden al modelo original, no a la version cuantizada, y pueden variar ligeramente tras la cuantizacion.
- El autor de la cuantizacion reporta en su model card pruebas internas cualitativas: velocidad de generacion de ~56.6 tokens/s en hardware de consumo, resolucion correcta de acertijos matematicos y generacion de codigo Python optimizado, pero sin cifras comparativas en benchmarks estandar.

No se han publicado resultados de benchmarks en la informacion disponible para la version cuantizada. Los datos anteriores son del modelo base y de pruebas internas no estandarizadas.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 28.3 GB en pesos, por lo que se recomienda al menos 32 GB de VRAM para inferencia con contexto de 128K. En configuracion con contexto mas corto (32K), podria caber en una GPU de 24 GB con `tensor-parallel-size=1`.
- GPU recomendadas: dos RTX 3090 (24 GB cada una) en configuracion `tensor-parallel-size=2` es la opcion documentada por el autor. Tambien es compatible con RTX 4090, A100, H100 y otras GPU con suficiente VRAM.
- No cabe en una GPU de 16 GB (por ejemplo, RTX 4080 o RTX 3080 Ti) en configuracion FP16/BF16, pero podria ejecutarse con cuantizaciones mas agresivas (INT4 sin preservar capas FP16) si se sacrifica calidad multimodal.
- Opciones de despliegue: vLLM, SGLang, Transformers con `trust_remote_code=True`. El autor recomienda `--max-model-len 32768` para vLLM y `--max-num-seqs 2` para evitar OOM.
- Latencia y throughput: ~56.6 tok/s en hardware consumer segun el autor, con batch limitado a 2 secuencias en contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base, BF16) | 27B | 256K | Apache 2.0 | No cuantizado | HuggingFace |
| goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound | 27B | 256K | Apache 2.0 | INT4 W4A16 (preserva capas criticas en FP16) | HuggingFace |
| Qwen3.8-27B cuantizado estandar INT4 (hipotetico) | 27B | 256K | Apache 2.0 | INT4 (sin preservar capas) | No disponible |

La diferencia principal entre el cuantizado de goldhub y un INT4 estandar es el tamano del repositorio (28.3 GB vs ~15-18 GB) y la calidad en tareas multimodales y contexto largo. El cuantizado de goldhub mantiene la capacidad de procesamiento de video e imagen y la atencion lineal en FP16, mientras que un cuantizado estandar podria degradar estas capacidades. En comparacion con otros modelos de 27B multimodales (como Qwen2.5-VL-27B), Qwen3.8-27B ofrece contexto mayor (256K vs 128K) y arquitectura hibrida mas eficiente.

## Limitaciones y advertencias

- Sesgos y contenido inapropiado: la alineacion "semi-desinhibida" o "Heretic" elimina los filtros corporativos, lo que puede producir contenido ofensivo, sesgado o no apto para menores en entornos no controlados.
- Riesgo de alucinacion: al ser un modelo multimodal cuantizado, puede generar descripciones falsas de imagenes o videos, especialmente en tareas de detalle fino o en contextos largos.
- Limitaciones de idioma: solo soporta 6 idiomas (en, zh, ru, uk, el, he). No cubre espanol, frances, aleman ni otros idiomas comunes, lo que limita su uso en entornos multilingues amplios.
- Dependencia de `trust_remote_code`: el modelo requiere ejecutar codigo remoto (custom code) en Transformers, lo que implica un riesgo de seguridad si se usa en entornos no controlados.
- Requisitos de hardware: aunque es mas ligero que el BF16 original, necesita al menos 24 GB de VRAM para una experiencia completa, y el contexto de 256K solo es viable con configuracion multi-GPU y batch limitado.
- No hay garantia de rendimiento en benchmarks estandar: no se han publicado evaluaciones cuantitativas de la cuantizacion, por lo que el impacto exacto en calidad no es medible.

## Enlaces

- HuggingFace: https://huggingface.co/goldhub/Qwen3.8-27B-BF16-INT4-W4A16-AutoRound-W4G32
- Repositorio GitHub (instalador one-click): https://github.com/qwen3-8-27b/qwen3-8-27b
- Guia de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guia completa de Qwen3.8-27B (lovableapp.org): https://lovableapp.org/blog/qwen3-8-27b
- Discusion del modelo en HuggingFace: https://huggingface.co/goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound/discussions/1

---

He seguido la estructura obligatoria. He usado datos de la model card y de las busquedas. He indicado "no disponible" cuando no hay datos. He tenido cuidado con el numero de parametros: el modelo base es 27B pero el safetensors reporta ~11.6B. He puesto ambos. La comparativa con "cuantizado estandar hipotetico" es un poco especulativa, pero la he marcado como hipotetica. Mejor quitar esa fila porque no es un modelo real. Lo cambio: en la tabla comparativa, pongo el base y el cuantizado, y una nota sobre la diferencia con cuantizados estandar. Mejor así.

Tambien corrijo: "temporal patch size de 2" está en la model card. "full_attention_interval: 4" de vLLM Recipes.

Reviso la gramatica y el estilo. Uso "castellano de España". No uso emojis.

Voy a ajustar la comparativa para no incluir un modelo hipotetico. Quito la tercera fila y anado una nota en texto.

La ficha final está lista.</think>## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27 mil millones de parámetros desarrollado por Alibaba como parte de la familia Qwen3.8. Acepta entradas de texto, imagen y video, y ofrece una ventana de contexto de hasta 262 144 tokens (256K). Su arquitectura híbrida combina 16 capas de atención completa con 48 capas de atención lineal de estado recurrente, lo que reduce el coste computacional en contextos largos. El modelo base está disponible con licencia Apache 2.0.

La variante cuantizada de goldhub, `goldhub/Qwen3.8-27B-BF16-INT4-W4A16-AutoRound-W4G32`, aplica un esquema de cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) mediante AutoRound, preservando las capas críticas (vision encoder, proyecciones de atención lineal y embeddings) en FP16/BF16. El repositorio pesa 28.3 GB, frente a los ~54 GB del original BF16, y es significativamente mayor que un cuantizado INT4 convencional (15-18 GB), porque prioriza la calidad multimodal y la estabilidad en contexto largo sobre la compresión extrema.

El interés de este modelo reside en que permite ejecutar un modelo multimodal de 27B con contexto de 256K en hardware de consumo (por ejemplo, dos RTX 3090 de 24 GB) sin degradar las capacidades de visión, video ni razonamiento de largo plazo. Además, el autor describe una alineación "semi-desinhibida" (calificada como "Heretic"), que elimina los filtros corporativos y permite respuestas más abiertas en tareas creativas y filosóficas, aunque esto implica riesgos de sesgos y contenido inapropiado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención completa + 48 de atención lineal con estado recurrente; vision encoder para imagen y video |
| Parámetros totales | 27B (modelo base); pesos cuantizados en safetensors: 11 575 659 760 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantización | INT4 (W4A16, group size 32, simétrico, AutoRound v0.15.0) |
| Idiomas soportados | en, zh, ru, uk, el, he (inglés, chino, ruso, ucraniano, griego, hebreo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `auto_round:auto_gptq`) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 27B parámetros con una arquitectura híbrida de atención: solo 16 de las 64 capas utilizan atención completa (con un intervalo de `full_attention_interval: 4`), mientras que las otras 48 emplean atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional en secuencias largas, permitiendo la ventana de 256K tokens sin un incremento cuadrático en memoria. El modelo incorpora un vision encoder que procesa imágenes y video con un temporal patch size de 2.

La cuantización de goldhub se aplica con AutoRound (v0.15.0), usando un esquema W4A16 con group size 32, simetría y 1000 iteraciones de calibración. La innovación principal es la preservación deliberada en FP16/BF16 de las capas críticas: `embed_tokens`, `model.visual.*` (vision encoder) y `linear_attn.*` (proyecciones de atención lineal, incluyendo `in_proj_qkv/z` y `out_proj`). Esto evita la degradación de la percepción multimodal y el colapso de la atención lineal en contextos largos, a costa de un peso final mayor que un cuantizado INT4 estándar.

No se dispone de información pública sobre el entrenamiento del modelo base (número de tokens, composición del dataset, procesos de RLHF o DPO). El autor de la cuantización menciona una alineación "semi-desinhibida" o "Heretic", que sugiere un ajuste posterior para reducir rechazos, pero no detalla el proceso.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, con explicaciones paso a paso en formato LaTeX para problemas matemáticos.
- Comprensión multimodal de imágenes y video: descripción de escenas, análisis de objetos y respuestas a preguntas sobre contenido visual.
- Generación de código Python y otros lenguajes, con cumplimiento de PEP-8 y análisis de complejidad temporal y espacial.
- Escritura creativa: narrativa, ensayos filosóficos, guiones y relatos de ficción sin filtros predefinidos.
- Razonamiento de largo contexto: síntesis y resumen de documentos extensos, historias de modelos de lenguaje o conversaciones de múltiples turnos.
- Soporte de Multi-Token Prediction (MTP) para acelerar la inferencia.
- Capacidad de "tool calling" indirecta: se puede integrar con vLLM y SGLang para construir agentes que interactúan con APIs o ejecutan comandos.

## Casos de uso

- **Asistente de desarrollo local**: el modelo puede generar y depurar código Python, JavaScript u otros lenguajes directamente en el editor. Su contexto de 256K permite incluir repositorios completos en la ventana de entrada, y la velocidad de ~56.6 tok/s lo hace utilizable para iteraciones rápidas de programación.
- **Análisis de documentos multimodales**: al procesar imágenes y video, puede extraer texto de capturas de pantalla, diagramas o vídeos de demostración, y responder preguntas sobre su contenido. Es útil para documentación técnica, soporte de producto o revisión de diseño.
- **Razonamiento de largo plazo**: con su ventana de 256K, puede resumir libros, historiales de conversaciones o bases de código extensas, manteniendo la coherencia sin perder información anterior. Adecuado para investigación o revisión de documentación técnica.
- **Generación de contenido creativo sin filtros**: para escritura de ficción, guiones o ensayos filosóficos, la alineación "semi-desinhibida" permite explorar temas oscuros o controvertidos que otros modelos rechazan. El modelo produce textos con profundidad narrativa, como relatos cyberpunk o análisis existenciales.
- **Agente de automatización con tool calling**: aunque no se documenta explícitamente, su integración con vLLM y SGLang permite construir agentes que ejecutan comandos de shell, leen archivos o interactúan con APIs. La preservación de la atención lineal en FP16 garantiza estabilidad en tareas de multi-step con contexto largo.
- **Tutor de matemáticas y ciencias**: su capacidad para resolver problemas de álgebra, física y lógica con explicaciones detalladas en LaTeX lo hace útil como tutor automático para estudiantes de secundaria y universidad.
- **Despliegue en hardware de consumo**: con dos GPU de 24 GB (RTX 3090) y `tensor-parallel-size=2`, se puede ejecutar localmente un asistente multimodal sin conexión a la nube, lo que es relevante para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) específicos para esta cuantización en la información disponible. Los datos conocidos son:

- El modelo base Qwen3.8-27B alcanza en DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, según la guía de lovableapp.org. Estos valores corresponden al modelo sin cuantificar y pueden variar ligeramente tras la cuantización.
- El autor de la cuantización reporta en la model card una prueba interna: velocidad de generación de ~56.6 tok/s en hardware de consumo, resolución de acertijos matemáticos y generación de código Python optimizado, pero sin cifras comparativas en benchmarks estándar.

## Requisitos de hardware

- **VRAM estimada**: el repositorio pesa 28.3 GB en pesos. Se recomienda al menos 32 GB de VRAM para contexto completo; con `--max-model-len 32768` y `tensor-parallel-size=1` puede caber en una GPU de 24 GB.
- **GPU recomendadas**: dos RTX 3090 (24 GB cada una) en configuración `tensor-parallel-size=2` es la opción del autor. También es compatible con RTX 4090, A100, H100 y otras GPU con suficiente VRAM.
- **GPU de consumo**: no cabe en una GPU de 16 GB (por ejemplo, RTX 4080 o RTX 3080 Ti) en configuración FP16/BF16 completa, pero podría ejecut
