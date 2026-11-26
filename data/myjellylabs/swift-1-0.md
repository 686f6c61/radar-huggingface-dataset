# myjellylabs/Swift-1.0

## Resumen

Swift 1.0 (`myjellylabs/Swift-1.0`) es un asistente multimodal de pesos abiertos desarrollado por MyJellyLab. Acepta entradas de texto, imagen y audio, y genera únicamente texto, con una ventana de contexto de 128K tokens. Se distribuye en `bfloat16` nativo y bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines propios.

El modelo parte de una base etiquetada como `gemma4` en Hugging Face y cuenta con 7.996.156.490 parámetros totales (aproximadamente 8.000 millones), con un repositorio de 16 GB en `safetensors` fragmentados. Su entrenamiento posterior combina una fase de SFT multidominio y una fase de alineamiento por preferencias con ORPO, manteniendo congelados los codificadores de visión y audio.

Su relevancia actual reside en la combinación de contexto largo (128K), soporte nativo de function calling y modo de razonamiento opcional (`enable_thinking=True`) en un tamaño que cabe en GPUs de consumo con cuantización. Está orientado a ingeniería de software, agentes con herramientas, finanzas y contabilidad, matemáticas, diseño de hardware y ciberseguridad defensiva, con soporte multilingüe en inglés, hindi, español, francés y alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base `gemma4`), con codificadores de visión y audio congelados; detalles internos de capas y atención no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Pesos nativos en `bfloat16`; no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información disponible |
| Idiomas soportados | Inglés, hindi, hinglish, español, francés, alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` fragmentados (sharded), `bfloat16` nativo |

## Arquitectura y entrenamiento

Swift 1.0 es un transformer multimodal con codificadores de visión y audio que permanecen congelados durante el post-entrenamiento. El modelo acepta tres modalidades de entrada (texto, imagen y audio) y produce texto como única salida; no genera voz ni imágenes. La información disponible no detalla el número de capas, la configuración de atención ni el esquema exacto de fusión de modalidades.

El post-entrenamiento se estructura en dos etapas. La primera es un SFT de una época sobre 9 dominios curados, con enmascaramiento de pérdida solo en tokens del asistente para preservar las capacidades de instrucción general y los codificadores multimodales. La segunda es un alineamiento con ORPO (Odds Ratio Preference Optimization) durante una época, orientado a precisión en tool calling, calidad de código y consistencia del comportamiento del asistente. Los adaptadores se fusionaron en aritmética `float32` en pesos `bfloat16` completos, dejando intactas las capas de visión, audio y embeddings. No se especifica el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento paso a paso con modo de pensamiento opcional (`enable_thinking=True`).
- Comprensión de imágenes y audio como entrada (salida exclusivamente textual).
- Generación de código en múltiples lenguajes, síntesis SQL, scripting Bash/Linux.
- Function calling y tool calling nativos, con decisiones calibradas sobre cuándo invocar una herramienta, pedir aclaración o responder directamente.
- Razonamiento matemático y STEM, incluyendo matemáticas de competición y derivaciones encadenadas.
- Ingeniería de hardware y sistemas: módulos Verilog RTL, optimización de código CUDA/HPC y generación de netlists KiCad.
- Finanzas y contabilidad: QA sobre estados financieros, razonamiento numérico tabular y análisis multi-turno.
- Ciberseguridad defensiva: análisis de seguridad y guía de remediación de vulnerabilidades.
- Investigación profunda y operaciones de startup: síntesis de evidencia multi-paso y resúmenes ejecutivos.
- Multilingüismo en inglés, hindi, hinglish, español, francés y alemán.
- Soporte de agentes y razonamiento multi-paso.

## Casos de uso

- Asistente de código en producción: el modelo genera código, SQL y scripts, y su tool calling calibrado permite integrarlo en pipelines de CI/CD donde debe decidir cuándo consultar documentación, ejecutar una herramienta o responder directamente.
- Atención al cliente automatizada: con 128K tokens de contexto puede gestionar conversaciones multi-turno largas y adjuntar imágenes o audios del cliente como entrada, manteniendo el hilo completo de la interacción.
- Análisis financiero y contable: responde preguntas sobre estados financieros, realiza razonamiento numérico sobre tablas y mantiene análisis multi-turno, adecuado para equipos de finanzas que necesitan asistencia documental.
- Agentes con herramientas en producción: el entrenamiento ORPO específico para tool calling reduce invocaciones innecesarias y mejora la precisión en flujos agénticos multi-paso.
- Prototipado de hardware: genera módulos Verilog RTL y netlists KiCad como punto de partida para diseño de sistemas, con verificación humana posterior.
- Asistencia STEM y matemáticas: derivaciones paso a paso con modo de pensamiento activado, útil en entornos educativos o de investigación que requieren trazabilidad del razonamiento.
- Asistente multimodal local: al ser un modelo de ~8B en `bfloat16`, puede desplegarse en infraestructura propia con vLLM y servir una API compatible con OpenAI, procesando imágenes y audio sin depender de servicios externos.
- Análisis de seguridad defensiva: revisión de código y configuraciones para identificar vulnerabilidades y proponer remediaciones, con verificación obligatoria por parte de un experto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 16 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 24 GB para contexto moderado y bastante más para aprovechar los 128K tokens.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo y throughput alto; L40S o RTX 6000 Ada como alternativas profesionales.
- GPU de consumo: cabe en RTX 4090 (24 GB) en `bfloat16` con contexto limitado; en GPUs de 16 GB requeriría cuantización, no documentada oficialmente en la información disponible.
- Opciones de despliegue: vLLM (>= 0.19.0) con API compatible con OpenAI, y `transformers` (>= 5.10.1) con `AutoModelForMultimodalLM` y `accelerate`. No se documentan soportes de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Swift 1.0 | ~8B | 128K | Texto, imagen, audio (entrada); texto (salida) | Apache 2.0 | Post-entrenamiento SFT + ORPO, tool calling nativo |
| Alternativas de ~8B multimodales | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos concretos de la misma categoría.

## Limitaciones y advertencias

- Salida exclusivamente textual: no genera voz ni imágenes, aunque comprenda audio e imagen; para salida de voz hay que combinarlo con un modelo TTS.
- Riesgo de alucinación inherente a los modelos generativos; el propio autor recomienda verificar código, diseños de hardware, recomendaciones de seguridad y cálculos financieros antes de usarlos en producción.
- Sesgos no documentados: la información disponible no detalla sesgos conocidos ni evaluaciones de seguridad.
- Cobertura lingüística limitada a inglés, hindi, hinglish, español, francés y alemán; otros idiomas no están garantizados.
- La información sobre cuantizaciones oficiales es inexistente, lo que puede complicar el despliegue en hardware de gama media.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue publicado en noviembre de 2026; no hay evidencia comunitaria de validación independiente.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar el archivo `LICENSE` del repositorio y las condiciones de la base `gemma4` subyacente.

## Enlaces

- Hugging Face: https://huggingface.co/myjellylabs/Swift-1.0
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
