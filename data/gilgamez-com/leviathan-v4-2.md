# GilGamez-com/Leviathan-v4.2

## Resumen

Leviathan v4.2 es un adaptador LoRA de tipo vision-language y orquestador de agentes publicado por GilGamez sobre el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` (familia Qwen3-VL, 27 000 millones de parámetros). El adaptador, de 498 MB en `safetensors`, se distribuye bajo licencia Apache-2.0 y está orientado a automatización empresarial: invocación estructurada de herramientas, ingeniería de software segura, ciberseguridad defensiva y comprensión nativa de indonesio formal y coloquial, además de inglés.

El modelo resuelve el problema de disponer de un núcleo operativo para flujos de trabajo técnicos multi-turno que exigen llamadas a funciones validadas por esquema, razonamiento paso a paso y resistencia a la adulación conversacional (anti-sycophancy). Su ventana de contexto nativa es de 4096 tokens, ampliable hasta 32K o más mediante RoPE, lo que condiciona su uso a sesiones de longitud media y no a documentos masivos.

Es relevante ahora porque combina tres demandas crecientes en despliegues empresariales: agentes con tool calling fiable, cobertura de idiomas del sudeste asiático poco representados en modelos abiertos y un enfoque explícito en seguridad defensiva (OWASP Top 10, mitigación de CWE). El repositorio es de reciente creación y no registra descargas, por lo que debe evaluarse como un artefacto emergente sin validación comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (base Qwen3-VL), adaptador LoRA RS-LoRA |
| Parametros totales | 27 000 millones (modelo base); adaptador LoRA de 498 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos; escalable a 32K+ mediante RoPE |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; cuantizaciones concretas no disponibles |
| Idiomas soportados | Ingles (en), indonesio (id), formal y coloquial |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF en `GilGamez-com/Leviathan-v4.2-GGUF` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27 000 millones de parámetros con capacidades de vision-language, heredado del base Qwen3-VL. Sobre él se aplica un adaptador de bajo rango entrenado con Rank-Stabilized LoRA (RS-LoRA) y aumentación de ruido uniforme en embeddings (NEFTune). El autor no especifica el rango, el alpha ni la configuración exacta del adaptador, ni el número total de tokens de entrenamiento; los datasets internos y la infraestructura se declaran propietarios.

El currículo de entrenamiento declarado cubre cinco dominios: razonamiento matemático y algorítmico con cadena de pensamiento, ingeniería full-stack empresarial (patrones de API modulares, concurrencia de bases de datos), seguridad defensiva de sistemas (análisis de vulnerabilidades, saneamiento de entradas), trayectorias multi-turno de tool calling con adherencia a esquema y recuperación de errores, y diálogo multilingüe del sudeste asiático. No se documenta el uso de RLHF ni DPO, ni innovaciones de decodificación como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadena de pensamiento explícita.
- Invocación autónoma de herramientas y ejecución de funciones con validación estricta de esquema (búsqueda, ejecución de código en sandbox, sistemas de identidad, bases de datos transaccionales, almacenamiento).
- Comprensión de imágenes y texto (vision-language) heredada del base Qwen3-VL.
- Fluidez dual en indonesio: *Bahasa Baku* conforme a PUEBI para informes ejecutivos y *Bahasa Gaul* para flujos de desarrollo.
- Ciberseguridad defensiva y codificación segura en PHP, JavaScript, Python, Go y SQL, con remediación de vulnerabilidades OWASP Top 10 y mitigación de CWE.
- Defensa de invariantes cognitivos: rechazo de preguntas capciosas, premisas no verificadas y trampas de adulación conversacional; preservación de precisión matemática tipo IEEE 754.
- Cierre de bucles de discusión y mantenimiento de requisitos acordados a lo largo de sesiones multi-turno.
- Capacidades multilingües limitadas a inglés e indonesio.

## Casos de uso

- **Atención al cliente en indonesio**: el modelo gestiona conversaciones multi-turno en registro formal e informal dentro de su ventana de 4096 tokens, adecuada para tickets y consultas de soporte de longitud media, con cambio de registro según el canal.
- **Orquestación de agentes empresariales**: emite llamadas a funciones validadas por esquema contra APIs internas, bases de datos y sistemas de identidad, con recuperación de errores en trayectorias multi-paso; encaja como núcleo de un pipeline de automatización con vLLM y `--enable-auto-tool-choice`.
- **Revisión de código seguro en CI/CD**: análisis de pull requests en PHP, JavaScript, Python, Go y SQL para detectar patrones vulnerables (inyección SQL, SSRF, XSS) y proponer parches con mitigaciones concretas antes del merge.
- **Asistente de hardening de infraestructura**: dado un diseño de API gateway o servicio expuesto, el modelo razona sobre vectores de ataque y devuelve el mecanismo teórico seguido de código de mitigación listo para producción.
- **Generación de informes de cumplimiento en indonesio formal**: redacción de documentación ejecutiva conforme a PUEBI a partir de hallazgos técnicos, útil para equipos de compliance en mercados del sudeste asiático.
- **Copiloto de desarrollo para equipos indonesios**: asistencia conversacional en *Bahasa Gaul* con terminología técnica, integrada en el IDE mediante el endpoint compatible de vLLM.
- **Análisis de documentación con capturas**: al conservar la capacidad vision-language del base, puede procesar diagramas de arquitectura o capturas de paneles junto con texto para tareas de auditoría técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 498 MB, pero requiere cargar el modelo base completo de 27 000 millones de parámetros: en bfloat16 necesita aproximadamente 54 GB de VRAM solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o múltiples A100 40 GB con tensor parallelism. No cabe en una RTX 4090 de 24 GB en precisión completa.
- En consumer GPU solo es viable mediante cuantización GGUF (repositorio `Leviathan-v4.2-GGUF`): una cuantización Q4 de 27B ronda los 16-17 GB, ajustada pero posible en RTX 4090; Q5/Q6 requiere 20-24 GB y Q8 supera los 28 GB.
- Despliegue en producción: vLLM con `--enable-lora`, `--max-model-len 4096` y `--gpu-memory-utilization 0.90` según la propia model card; también es compatible con Transformers + PEFT y con Ollama mediante el `Modelfile` publicado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Leviathan v4.2 | 27B (LoRA sobre Qwen3-VL) | 4096 nativo, 32K+ con RoPE | Apache-2.0 | Agentes, tool calling, ciberseguridad defensiva, indonesio | Hugging Face, GGUF, Ollama |
| Qwen3-VL 27B (base) | 27B | Mayor que el adaptador (no disponible el valor exacto) | Apache-2.0 | Vision-language generalista | Hugging Face, ecosistema amplio |
| Qwen3 (familia densa) | 8B-32B | 32K-128K según variante | Apache-2.0 | Texto y razonamiento generalista | Hugging Face, vLLM, Ollama |

La comparación directa con alternativas especializadas en tool calling o en idiomas del sudeste asiático no está disponible en la información proporcionada. Frente al base Qwen3-VL, Leviathan v4.2 añade especialización en agentes, seguridad defensiva e indonesio, a costa de una ventana de contexto nativa mucho más corta (4096 tokens).

## Limitaciones y advertencias

- Ventana de contexto nativa de solo 4096 tokens: insuficiente para análisis de repositorios completos o documentos extensos; la extensión a 32K vía RoPE no está validada con benchmarks y puede degradar la calidad.
- Cobertura lingüística limitada a inglés e indonesio; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será pobre.
- Riesgo de alucinación no cuantificado: no hay evaluaciones publicadas de fidelidad factual ni de tasa de alucinación.
- Sesgos desconocidos: el autor no documenta evaluación de sesgos, y el corpus de entrenamiento es propietario, lo que impide auditar su composición.
- Sin validación comunitaria: cero descargas y un único "like" en el momento de la ficha; no existen evaluaciones independientes.
- El adaptador depende del base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`; la ruta de carga debe respetarse y conviene verificar compatibilidad con la versión de PEFT y Transformers.
- Las afirmaciones de seguridad ("zero malicious assistance", rechazo de payloads de explotación) son declaraciones del autor sin evaluación de robustez frente a jailbreaks publicada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y sus dependencias deben cumplir también sus propias licencias.
- El tamaño del repositorio (0.5 GB) corresponde solo al adaptador; el coste real de despliegue es el del base de 27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GilGamez-com/Leviathan-v4.2
- Versión GGUF: https://huggingface.co/GilGamez-com/Leviathan-v4.2-GGUF
- Organización del autor: https://huggingface.co/GilGamez-com
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
