# ReadyArt/Zaire-12B-v0.1-GGUF

## Resumen

Zaire-12B-v0.1-GGUF es la versión cuantizada en formato GGUF del modelo ReadyArt/Zaire-12B-v0.1, un modelo de lenguaje de 11.907.350.576 parámetros (aproximadamente 11,9 mil millones) desarrollado por ReadyArt y publicado bajo licencia Apache 2.0. Se trata de un modelo de generación de texto orientado explícitamente a contenido para adultos: roleplay, ficción erótica, terror y violencia, según declara el propio autor en las etiquetas del repositorio (nsfw, explicit, ERP, unaligned, horror, violence). El modelo se presenta además como "unaligned", es decir, sin el alineamiento de seguridad habitual en modelos instruct convencionales.

El problema que resuelve es acotado pero con demanda real: ofrecer un modelo conversacional en inglés capaz de mantener roleplay adulto y narrativa explícita sin los rechazos típicos de los modelos alineados, y hacerlo desplegable en local mediante cuantización GGUF. La versión GGUF es precisamente la que permite ejecutar el modelo en hardware de consumo con llama.cpp, Ollama o KoboldCpp, sin depender de APIs externas, lo que resulta relevante para quien prioriza privacidad en conversaciones de este tipo.

La información publicada es escasa en lo técnico: no se documentan arquitectura, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. La model card del autor está construida fundamentalmente con HTML y CSS de estilo personalizado y no incluye fichas técnicas ni datos de evaluación. Cualquier uso en producción debería partir de una evaluación propia del modelo base antes de adoptar esta cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la información proporcionada) |
| Parámetros totales | 11.907.350.576 (≈11,9 mil millones) |
| Parámetros activos | no disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; el repositorio ocupa 29,8 GB, lo que sugiere varias cuantizaciones, pero la lista exacta no está disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la documentación disponible. Por el número de parámetros (11,9 mil millones) y la tarea declarada (text-generation conversacional e instruct), se trata con alta probabilidad de un transformer decoder-only, pero el autor no lo confirma en la información proporcionada, por lo que no se puede afirmar. Tampoco se especifica si emplea atención con ventana deslizante, atención lineal, mezcla de expertos o alguna variante híbrida.

Respecto al entrenamiento, no hay datos sobre volumen de tokens, composición del corpus, uso de RLHF, DPO o fine-tuning supervisado. La etiqueta "unaligned" sugiere que el autor ha evitado deliberadamente las fases de alineamiento de seguridad convencionales, pero no se documenta la metodología. Tampoco se detalla el proceso de cuantización aplicado para generar esta versión GGUF (herramienta, tipo de calibración, posibles variantes K-quants o I-quants).

## Capacidades

- Generación de texto en inglés con registro conversacional e instruct.
- Roleplay multi-turno y mantenimiento de personajes, orientado a escenarios para adultos.
- Escritura de ficción explícita de contenido erótico (ERP).
- Narrativa de terror y descripción de violencia explícita.
- Respuestas con menor tasa de rechazo que modelos alineados, según la etiqueta "unaligned" declarada por el autor.
- Formato de pesos GGUF listo para inferencia local en CPU/GPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline declarado es únicamente text-generation.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- **Narrativa interactiva para adultos en local**: el modelo puede sostener sesiones de rol explícito en inglés ejecutándose con llama.cpp u Ollama sobre una GPU de consumo, de modo que el contenido de la conversación nunca sale del equipo del usuario. Es el caso de uso principal declarado por el autor.
- **Motor de personajes en videojuegos narrativos para adultos**: integración mediante una API local compatible con OpenAI (`endpoints_compatible`) para generar diálogos de personajes con personalidad fija, útil en prototipos de novelas visuales o mods.
- **Herramienta de escritura para autores de ficción oscura**: generación y reescritura de escenas de terror o violencia explícita sin las interrupciones que introducen los modelos con filtros, útil en fases de borrador.
- **Investigación en seguridad y alineación**: estudio comparativo de tasas de rechazo, deriva de personaje y comportamiento en escenarios adversarios frente a modelos alineados de tamaño similar, usando la versión GGUF para iterar rápido en local.
- **Evaluación de degradación por cuantización**: al existir el modelo base en safetensors y esta versión GGUF, permite medir la pérdida de calidad (coherencia, seguimiento de personaje, perplejidad) entre precisión completa y cuantizaciones de 4 y 5 bits en la misma tarea.
- **Prototipado de asistentes conversacionales sin conectividad**: despliegue en estaciones de trabajo aisladas o con requisitos de privacidad estrictos, donde no es viable llamar a una API en la nube.
- **Generación de guiones y diálogos para mods de contenido adulto**: producción por lotes de líneas de diálogo para comunidades de modding, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones específicas de roleplay o de contenido para adultos. Tampoco se documenta perplejidad ni comparación con el modelo base en precisión completa, por lo que no es posible cuantificar la degradación introducida por la cuantización.

## Requisitos de hardware

- **VRAM estimada para inferencia** (estimación calculada a partir del número de parámetros; no confirmada por el autor, excluye KV cache):
  - FP16: ≈23,8 GB
  - Q8_0: ≈12,6 GB
  - Q6_K: ≈9,8 GB
  - Q5_K_M: ≈8,4 GB
  - Q4_K_M: ≈7,3 GB
  - Q3_K_M: ≈5,9 GB
  - Q2_K: ≈4,5 GB
- **GPU recomendadas**: para cuantizaciones de 4-5 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite cargar el modelo completo en VRAM con contexto amplio; una RTX 4080 (16 GB) o 4070 Ti Super (16 GB) es suficiente para Q4_K_M o Q5_K_M con contexto moderado. Para FP16 se recomienda A100 40 GB, H100 o dos GPU de 24 GB.
- **¿Cabe en GPU de consumo?**: sí. Con Q4_K_M (≈7,3 GB) entra en tarjetas de 8-12 GB, como RTX 3060 Ti, RTX 4060 Ti o RTX 4070, siempre que se ajuste el contexto para el KV cache. En Q2_K podría ejecutarse incluso en GPU de 6 GB con contexto reducido.
- **Despliegue**: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y text-generation-webui son las opciones naturales para GGUF. vLLM y TGI no ofrecen soporte maduro de GGUF; para esas pilas conviene usar el modelo base en safetensors.
- **Latencia y throughput**: no disponibles. Dependen fuertemente de la cuantización, del hardware y de la longitud de contexto, y el autor no publica mediciones.

## Comparativa con modelos similares

Los datos de la columna de Zaire provienen de la información del repositorio; los de los modelos alternativos provienen de conocimiento general de esos modelos y no de la información proporcionada, por lo que deben verificarse antes de usarse en una decisión técnica.

| Modelo | Parámetros | Contexto | Licencia | Formatos | Enfoque |
|---|---|---|---|---|---|
| Zaire-12B-v0.1 | 11,9 B | no disponible | Apache 2.0 | GGUF, safetensors | Roleplay adulto, sin alinear |
| Mistral Nemo 12B | ≈12,2 B | 128k | Apache 2.0 | safetensors, GGUF | Propósito general, multilingüe |
| Qwen2.5-14B | ≈14,7 B | 32k nativo (128k en variantes) | Apache 2.0 | safetensors, GGUF | Propósito general, código y matemáticas |
| Gemma 2 9B | ≈9,2 B | 8k | Licencia Gemma | safetensors, GGUF | Propósito general, alineado |

Frente a estas alternativas, Zaire-12B se diferencia únicamente por su orientación explícita a contenido para adultos y por la ausencia de alineamiento de seguridad; en el resto de dimensiones (contexto documentado, benchmarks, licencia, ecosistema) no aporta ventajas verificables y carece de la documentación técnica que sí publican los modelos citados.

## Limitaciones y advertencias

- **Contenido para adultos**: el modelo está etiquetado como `nsfw`, `explicit` y `not-for-all-audiences`. No debe desplegarse en productos accesibles a menores ni sin verificación de edad y controles de acceso.
- **Modelo "unaligned"**: la ausencia de alineamiento de seguridad implica mayor probabilidad de generar contenido dañino, ilegal o éticamente problemático ante prompts adversarios. No incorpora moderación propia; cualquier despliegue necesita una capa de filtrado externa.
- **Riesgo de alucinación**: no hay datos de evaluación, pero al tratarse de un modelo de 11,9 B sin benchmarks publicados debe asumirse un riesgo estándar o superior de fabricación de hechos, especialmente fuera del registro conversacional.
- **Idioma**: solo inglés. El rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- **Contexto desconocido**: no se documenta la ventana de contexto, lo que impide planificar conversaciones largas o tareas de resumen de documentos sin pruebas previas.
- **Trazabilidad del entrenamiento**: no se detalla el corpus, lo que impide evaluar sesgos, contaminación de benchmarks ni posibles problemas de derechos de autor en los datos.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero la licencia no cubre la legalidad del contenido generado ni el cumplimiento de las políticas de las plataformas donde se integre. En la Unión Europea, la distribución de determinado material sexual o violento está sujeta a regulación específica.
- **Documentación deficiente**: la model card se compone mayoritariamente de HTML y CSS y no incluye ficha técnica; no hay garantía de que el modelo base esté bien caracterizado.
- **Metadatos atípicos**: el repositorio registra 0 descargas y 1 like, y una fecha de creación de 2026-10-26, lo que sugiere un modelo muy reciente o con validación comunitaria prácticamente nula. Conviene tratarlo como no auditado.
- **Cuantización sin especificar**: se desconoce qué variantes GGUF incluye el repositorio de 29,8 GB y con qué método se generaron, lo que dificulta reproducir resultados.

## Enlaces

- Repositorio HuggingFace (versión GGUF): https://huggingface.co/ReadyArt/Zaire-12B-v0.1-GGUF
- Modelo base en safetensors: https://huggingface.co/ReadyArt/Zaire-12B-v0.1
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos por la búsqueda corresponden a sitios de contenido para adultos sin relación con el repositorio y se han descartado.
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada.
