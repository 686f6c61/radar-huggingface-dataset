# Fix-AI/Qwen3.8-27B-GGUF

## Resumen

Fix-AI/Qwen3.8-27B-GGUF es un repositorio de pesos cuantizados en formato GGUF del modelo Qwen/Qwen3.8-27B, publicado por el usuario Fix-AI. No se trata de un modelo original: la propia model card indica explícitamente que es un duplicado y que la versión de referencia se encuentra en el repositorio de Unsloth (unsloth/Qwen3.8-27B-GGUF). El repositorio reúne cuantizaciones del esquema Unsloth Dynamic 3.0 con calibración imatrix, e incluye la etiqueta `endpoints_compatible` y `region:us`.

El modelo base es Qwen3.8-27B, un modelo denso de 27.320.697.856 parámetros (27,32 B) de la familia Qwen, construido sobre la base arquitectónica de Qwen3.5. Se trata de un modelo causal con encoder de visión nativo (comprensión de imágenes y vídeo), con un contexto nativo de 262.144 tokens extensible hasta 1.000.000, y con control flexible del modo de razonamiento. Su relevancia radica en que combina visión, ventana de contexto muy larga y capacidades agénticas en un tamaño desplegable en una sola GPU de 80 GB o en configuraciones de consumo con cuantización de 4 bits.

El interés práctico de este repositorio concreto es limitado: registra 0 descargas y 1 like en el momento de la consulta, y su tamaño total es de 472,1 GB, lo que refleja que agrupa múltiples niveles de cuantización. Para uso en producción conviene acudir al repositorio original de Unsloth, que garantiza procedencia y trazabilidad de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); 64 capas |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | GGUF con esquema Unsloth Dynamic 3.0 y calibración imatrix; niveles concretos no disponibles |
| Idiomas soportados | No disponible (la model card no declara listado de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.8-27B |
| Dimensión oculta | 5.120 |
| Capas | 64 |
| FFN (dimensión intermedia) | 17.408 |
| Embedding de tokens | 248.320 (con padding) |
| Cabecera de salida | 248.320 (con padding) |
| Tamaño del repositorio | 472,1 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creación | 2026-10-28 |

Detalle de los bloques de atención:

| Componente | Parametro | Valor |
|---|---|---|
| Gated DeltaNet (atención lineal) | Cabezas lineales | 48 para V, 16 para QK |
| Gated DeltaNet (atención lineal) | Dimensión de cabeza | 128 |
| Gated Attention (atención completa) | Cabezas | 24 para Q, 4 para KV (GQA 6:1) |
| Gated Attention (atención completa) | Dimensión de cabeza | 256 |
| Gated Attention (atención completa) | Dimensión RoPE | 64 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con encoder de visión, organizado en 64 capas con un patrón híbrido repetido 16 veces: tres bloques consecutivos de Gated DeltaNet (atención lineal con estado recurrente) seguidos de un bloque de Gated Attention (atención completa con RoPE y GQA). La atención lineal emplea 48 cabezas para V y 16 para QK con dimensión 128, mientras que la atención completa usa 24 cabezas de consulta y 4 de clave-valor con dimensión 256 y dimensión RoPE de 64. El FFN tiene dimensión intermedia 17.408 y el vocabulario está dimensionado en 248.320 entradas con padding. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa.

Según la model card, el modelo ha pasado por preentrenamiento y postentrenamiento, y se presenta como la generación más capaz de la familia abierta Qwen hasta la fecha, con mejoras en código, trabajo profesional, investigación y tareas agénticas de horizonte largo. Se destaca un refuerzo del razonamiento autónomo y del manejo de retroalimentación del entorno. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles de las etapas de RLHF/DPO.

El repositorio analizado no contiene entrenamiento propio: solo aplica cuantización post-entrenamiento sobre los pesos de Qwen/Qwen3.8-27B mediante el esquema Unsloth Dynamic 3.0, que según su documentación selecciona dinámicamente la precisión por tensores y reporta más de un 10 % de mejora en precisión top-1 % frente a otros proveedores de GGUF del mismo tamaño.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo es nativo visión-lenguaje y procesa imágenes y vídeo, incluidos diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Razonamiento con control flexible: el modo thinking está activo por defecto, puede desactivarse por petición, la profundidad se ajusta mediante `reasoning_effort` y el contexto de razonamiento histórico se conserva con `preserve_thinking`.
- Programación y trabajo profesional: la model card declara mejoras sustanciales en tareas de código, trabajo profesional e investigación.
- Ejecución agéntica: planificación autónoma y gestión de retroalimentación del entorno para completar tareas de extremo a extremo; soporte de rol `developer` para integrarse en herramientas agénticas como Codex.
- Tool calling / function calling: se mejora el parseo de objetos anidados para aumentar la tasa de éxito de las llamadas a herramientas.
- Decodificación multi-token (MTP) entrenada con varios pasos, utilizable para decodificación especulativa.
- Contexto largo: 262.144 tokens nativos, ampliables a 1.000.000, adecuado para documentos extensos y sesiones agénticas prolongadas.
- Capacidades multilingües: no disponibles en la información proporcionada (no se declara listado de idiomas).

## Casos de uso

- Análisis de documentación técnica extensa: con 262.144 tokens nativos se pueden cargar manuales, normativas o bases de código completas en una sola ventana y hacer preguntas cruzadas sin recuperación externa, lo que reduce la pérdida de contexto entre fragmentos.
- Agentes autónomos de mantenimiento de código: el soporte de rol `developer`, el tool calling con parseo de objetos anidados y la decodificación MTP permiten integrar el modelo en arneses tipo Codex para abrir issues, editar ficheros y ejecutar tests en varios pasos.
- Automatización de soporte técnico multi-turno: la ventana de contexto larga y la conservación del razonamiento histórico (`preserve_thinking`) permiten mantener conversaciones con historial amplio sin truncar información relevante del cliente.
- Revisión de documentación con imágenes: al ser visión-lenguaje, puede extraer datos de diagramas de arquitectura, capturas de paneles de monitorización, tablas escaneadas y figuras de artículos científicos dentro del mismo flujo que el texto.
- Análisis de vídeo para formación o auditoría: la comprensión de vídeos de hasta una hora sirve para generar resúmenes con marcas temporales, extraer procedimientos paso a paso o verificar el cumplimiento de protocolos en grabaciones.
- Despliegue en local con GGUF: las cuantizaciones de 4 y 5 bits permiten ejecutar el modelo en una estación de trabajo con una RTX 4090 para prototipado, tareas de oficina y generación de código asistida, sin depender de APIs externas.
- Investigación asistida: combinación de razonamiento de varios pasos con `reasoning_effort` ajustable para tareas de revisión bibliográfica y contraste de hipótesis, desactivando el modo thinking en consultas simples para reducir latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio duplicado no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica numérica, y la búsqueda web realizada no ha devuelto resultados relevantes sobre este repositorio.

## Requisitos de hardware

- VRAM de pesos (estimación a partir de 27,32 B de parámetros, sin contar caché KV ni overhead): ~10 GB en Q2, ~13-14 GB en Q3_K_M, ~16-17 GB en Q4_K_M, ~19-20 GB en Q5_K_M, ~22-23 GB en Q6_K, ~29 GB en Q8_0, ~54,6 GB en BF16 y ~109 GB en FP32.
- Caché KV de atención completa (estimación): 4 cabezas KV × 256 dimensiones × 2 (K y V) × 2 bytes = 64 KB por token, aplicable solo a los 16 bloques de Gated Attention; aproximadamente 2 GB a 32K de contexto, 8 GB a 128K y 16,8 GB a 262K. Los bloques Gated DeltaNet mantienen estado recurrente de tamaño constante.
- GPU de consumo: una RTX 4090 (24 GB) ejecuta Q4_K_M con contexto moderado y Q5_K_M de forma ajustada; una RTX 3090 (24 GB) queda en una situación equivalente. Para contexto largo conviene Q4_K_M con offload parcial o reducir la ventana.
- GPU profesionales: una A100 40 GB o H100 80 GB permiten Q8_0 con contexto largo; una A100 80 GB o H100 80 GB admiten BF16 con margen limitado para contexto extendido. Para 262K tokens en BF16 se requiere más de una GPU.
- Configuraciones multi-GPU: dos RTX 4090 (48 GB) cubren Q8_0 con contexto largo; cuatro cubren BF16.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) para GGUF; Unsloth Desktop, que la propia model card referencia y que incluye toggles de thinking; vLLM y TGI para los pesos originales en safetensors, no para este repositorio GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Fix-AI/Qwen3.8-27B-GGUF (este repo) | 27,32 B denso | 262.144 (hasta 1M) | Sí | apache-2.0 | GGUF (Dynamic 3.0, imatrix) | Duplicado; 0 descargas |
| unsloth/Qwen3.8-27B-GGUF | 27,32 B denso | 262.144 (hasta 1M) | Sí | apache-2.0 | GGUF (Dynamic 3.0) | Repositorio original de referencia |
| Qwen/Qwen3.8-27B | 27,32 B denso | 262.144 (hasta 1M) | Sí | apache-2.0 | safetensors (BF16) | Pesos originales |
| Gemma 3 27B | 27 B denso | 128.000 | Sí (imagen) | Términos de uso de Gemma | safetensors y GGUF comunitarios | Publicado por Google |

Comparativa de rendimiento: no disponible. No hay datos de benchmarks en la información proporcionada para Qwen3.8-27B ni para las alternativas en el mismo conjunto de tareas, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Repositorio duplicado: la model card reconoce explícitamente que es una copia y remite al repositorio de Unsloth. No hay garantía de procedencia, integridad ni mantenimiento por parte de Fix-AI.
- Actividad nula: 0 descargas y 1 like en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Tamaño del repositorio: 472,1 GB, lo que implica una descarga muy costosa si se clona completo; conviene descargar solo el fichero de cuantización necesario.
- Pérdida por cuantización: los niveles Q2 y Q3 degradan de forma notable el rendimiento en razonamiento y código; el propio autor del esquema recomienda 4 bits o más para uso serio.
- Idiomas no declarados: no hay listado oficial de idiomas soportados en la información disponible; el rendimiento en castellano no está verificado.
- Riesgo de alucinación: inherente a los modelos generativos, especialmente en tareas de investigación y citación; requiere verificación factual en producción.
- Soporte de visión en GGUF: no se especifica en la información disponible la presencia del fichero de proyección multimodal (mmproj) necesario para usar el encoder de visión con llama.cpp; debe comprobarse antes de asumir capacidades multimodales en local.
- Compatibilidad del runtime: la arquitectura híbrida Gated DeltaNet + Gated Attention requiere soporte específico en el motor de inferencia; conviene verificar la versión mínima de llama.cpp antes de desplegar.
- Licencia: el tag del repositorio indica apache-2.0, pero al ser un duplicado debe confirmarse contra la licencia del modelo base Qwen/Qwen3.8-27B antes de un uso comercial.
- Parámetros de muestreo: el autor recomienda valores distintos para modo thinking (temperature 1.0, top_p 0.95, top_k 20) y modo instruct (temperature 0.7, top_p 0.80, top_k 20, presence_penalty 1.5); usar los valores del modo equivocado degrada la calidad.

## Enlaces

- Repositorio analizado: https://huggingface.co/Fix-AI/Qwen3.8-27B-GGUF
- Repositorio original de cuantizaciones (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución de Qwen3.8-27B de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Documentación de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Descarga de Unsloth Desktop (Mac, Windows, Linux): https://unsloth.ai/docs/new/desktop
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo ni sobre el autor Fix-AI; los resultados devueltos corresponden a términos genéricos ("fix") sin relación con el repositorio.
