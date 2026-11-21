# Rowhanissick/Verfy-9B

## Resumen

Verfy-9B es un modelo de lenguaje de 9.410 millones de parámetros desarrollado por Rowhanissick (Verfy Labs) y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un agente autónomo de sistema operativo y motor de razonamiento en ciberseguridad, orientado a automatización de escritorio y servidor, red teaming, inteligencia de amenazas y ejecución segura. Parte del modelo base `empero-ai/Qwythos-9B-v2`, una variante abliterated de la arquitectura Qwen3.5 de atención híbrida.

El modelo se distingue por su arquitectura de bloques XML nativa (`<think>`, `<big_bro_audit>`, `<steps>`, `<command>`, `<screenshot>`, ``, `<vuln>`, entre otros), que le permite razonar, autoevaluarse y ejecutar acciones sobre el entorno en lugar de limitarse a generar texto conversacional. Incorpora un mecanismo de auto-reflexión denominado Big Bro Audit que revisa la lógica y seguridad de los comandos antes de emitirlos.

Declara una ventana de contexto de 1.048.576 tokens mediante escalado YaRN, lo que lo sitúa en el rango de modelos capaces de procesar repositorios de código completos o trayectorias agénticas largas. Su orientación explícita a contenido sin censura y a tareas ofensivas de seguridad lo convierte en una propuesta de nicho con implicaciones legales y éticas relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 Hybrid-Attention (transformer con atención híbrida), base `empero-ai/Qwythos-9B-v2` |
| Parametros totales | 9.409.813.744 (9,41 B); la model card indica 8,95 B |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) mediante YaRN rope-scaling |
| Tipos de cuantizacion | 4-bit NF4 (BitsAndBytes), GGUF Q4_K_M y Q8_0 (builds de la comunidad) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,8 GB); GGUF en repositorios comunitarios |

## Arquitectura y entrenamiento

Verfy-9B se construye sobre `empero-ai/Qwythos-9B-v2`, un modelo derivado de Qwen3.5 de 9B con atención híbrida y sometido a un proceso de abliteration que elimina las capas de rechazo del modelo original. Sobre esa base, el autor aplica un ajuste fino orientado a comportamiento agéntico: emisión estructurada de bloques XML para planificación, auditoría, ejecución de comandos y control de GUI. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable es el bloque `<big_bro_audit>`, una pasada interna de auto-reflexión en la que el modelo critica la consistencia lógica y la seguridad de los comandos generados antes de emitirlos, detecta scripts simulados alucinados y verifica límites de autorización. También incorpora conciencia de enclave de credenciales, que identifica PII y tokens secretos para marcarlos en lugar de reproducirlos en texto plano, y ejecución con puerta de comando, que bloquea difusión pública no autorizada sin token explícito del operador.

## Capacidades

- Generación de texto y razonamiento técnico en el dominio de ciberseguridad, incluyendo análisis de vulnerabilidades, modelado de amenazas e ingeniería inversa.
- Ejecución de comandos de shell y terminal mediante el bloque `<command>`.
- Control de interfaz gráfica: movimiento de ratón, clics y pulsaciones de teclado mediante el bloque ``.
- Captura y solicitud de marcos visuales de pantalla o ventana mediante `<screenshot>`.
- Lectura y escritura de ficheros, logs y volcados de memoria con los bloques `<read>` y `<write>`.
- Planificación multi-paso descompuesta en tareas secuenciales con `<steps>` y validación de precondiciones con `<checks>`.
- Auto-reflexión y autocorrección mediante `<big_bro_audit>` antes de la salida final.
- Detección y clasificación de vulnerabilidades con identificadores CVE y CWE en el bloque `<vuln>`.
- Conciencia de PII y gestión de credenciales para evitar filtrado en texto plano.
- Capacidad de agente autónomo y computer-use, además de modo conversacional.
- Multilingüe: únicamente inglés declarado.

## Casos de uso

- Automatización de auditorías de servidor: el modelo puede encadenar `<command>` para enumerar puertos abiertos, servicios y configuraciones, con `<big_bro_audit>` filtrando comandos destructivos antes de su ejecución. Adecuado por su contexto de 1M tokens, que permite mantener el estado de una sesión de auditoría extensa.
- Red teaming y pruebas de penetración controladas: generación de scripts de explotación, payloads y análisis de superficies de ataque en entornos con autorización explícita, gracias a su orientación sin censura y a la clasificación de hallazgos con `<vuln>`.
- Análisis de código y repositorios completos: la ventana de 1M tokens permite cargar un repositorio entero para revisión de seguridad, detección de patrones inseguros y trazado de flujos de datos entre módulos.
- Automatización de tareas de escritorio (RPA): uso de `<screenshot>` e `` para operar aplicaciones GUI, rellenar formularios o navegar interfaces sin API, con verificación visual del estado de la pantalla.
- Triaje de incidentes y threat intelligence: lectura de logs y volcados con `<read>`, correlación de eventos y generación de informes estructurados con severidad y referencias CWE.
- Asistente de operaciones con gestión de secretos: el modelo marca credenciales y PII para su almacenamiento en bóveda en lugar de exponerlas, lo que resulta útil en pipelines donde se manejan tokens de API o datos personales.
- Laboratorios de formación en ciberseguridad: entorno controlado para practicar respuesta a incidentes y análisis forense con un modelo que razona paso a paso y justifica cada acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 19 GB solo para pesos, más overhead de KV cache; se recomienda un mínimo de 24 GB.
- VRAM estimada en 4-bit NF4: en torno a 6-7 GB para pesos, con margen adicional para contexto; viable en GPUs de 12-16 GB.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 6 GB; Q8_0 en torno a 10 GB.
- GPU recomendadas para producción: A100 40/80 GB o H100 para contexto completo de 1M tokens y concurrencia; L40S o RTX 6000 Ada como alternativas.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 ajustado o en cuantización de 4 bits con contexto amplio; en RTX 3090 y RTX 4080 (16 GB) es viable en 4-bit con contexto moderado.
- Opciones de despliegue: transformers con BitsAndBytes, llama.cpp, Ollama y LM Studio mediante los GGUF de `mradermacher/Verfy-9B-GGUF`. No se confirma soporte nativo en vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El uso de contexto de 1M tokens incrementa de forma significativa el consumo de KV cache y reduce el throughput efectivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Orientación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verfy-9B | 9,41 B | 1.048.576 | Agente OS, ciberseguridad, sin censura | Apache 2.0 | Hugging Face, GGUF comunitario |
| empero-ai/Qwythos-9B-v2 | 9 B (aprox.) | no disponible | Base abliterated Qwen3.5 | no disponible | Hugging Face |
| Qwen3.5 9B (base original) | 9 B (aprox.) | no disponible | Propósito general, alineado | no disponible | Hugging Face |
| Modelos agénticos de 7-9 B con computer-use | 7-9 B | variable | Automatización de escritorio | variable | variable |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado benchmarks del modelo.

## Limitaciones y advertencias

- Modelo abliterated y sin censura: puede generar contenido ofensivo, instrucciones de explotación o material ilegal según jurisdicción. El uso en producción exige revisión legal y controles de acceso.
- Riesgo elevado de alucinación en comandos y scripts: aunque incorpora `<big_bro_audit>`, no hay garantía de que la autoverificación detecte errores reales; todo comando debe validarse en entorno aislado antes de ejecutarse.
- Capacidad de ejecución real sobre el sistema operativo (shell, ratón, teclado): un fallo de razonamiento puede provocar daños irreversibles en el sistema anfitrión. Se recomienda sandboxing y permisos mínimos.
- Idioma: solo inglés declarado; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un modelo abliterated, los filtros de contenido habituales están ausentes.
- Contexto de 1M tokens: la ventana nominal no garantiza recuperación efectiva de información en posiciones lejanas; el rendimiento en contextos muy largos no está validado con benchmarks públicos.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal por el uso ofensivo recae en el operador.
- Comunidad muy reducida (1 like, 729 descargas en el momento de la consulta) y ausencia de benchmarks: la fiabilidad en producción no está contrastada.
- No se documentan datos de entrenamiento ni proceso de alineación, lo que dificulta evaluar la robustez frente a inyección de prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rowhanissick/Verfy-9B
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-v2
- GGUF comunitario: https://huggingface.co/mradermacher/Verfy-9B-GGUF
- Portfolio del autor: https://rowhanissick.onrender.com
- Contacto del autor: iuske553@gmail.com
