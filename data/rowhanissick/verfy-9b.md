# Rowhanissick/Verfy-9B

## Resumen

Verfy-9B es un modelo de lenguaje de 9.409.813.744 parámetros desarrollado por Rowhanissick sobre la arquitectura de `empero-ai/Qwythos-9B-v2`, que a su vez se basa en Qwen3.5 9B con atención híbrida. Está diseñado específicamente como agente autónomo de sistema operativo (OS-agent) y modelo de razonamiento orientado a computer-use, auditoría de seguridad y operaciones de sistema, en lugar de como un chatbot conversacional convencional.

Su rasgo diferencial es que genera bloques estructurados de ejecución directamente en el flujo de tokens mediante etiquetas XML (`<think>`, `<steps>`, `<checks>`, `<screenshot>`, `<command>`, `<read>`, `<write>`, ``, `<vuln>`), lo que permite a los daemons de agente parsear razonamiento, planificación, comprobaciones de seguridad y acciones sobre el entorno sin expresiones regulares frágiles. Declara una ventana de contexto de 1.048.576 tokens mediante escalado YaRN, lo que lo hace relevante para trayectorias agénticas largas y análisis de codebases completas.

El modelo se publica con licencia Apache 2.0, únicamente en inglés, y con un tamaño de repositorio de 55,8 GB. En el momento de la consulta acumula 625 descargas y 1 like en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (Qwen3.5 9B Hybrid-Attention), fine-tune de `empero-ai/Qwythos-9B-v2` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 1.048.576 tokens (1M, vía YaRN rope-scaling) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Verfy-9B es un fine-tune del modelo `empero-ai/Qwythos-9B-v2`, descrito por el autor como Qwen3.5 9B con atención híbrida. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron fases de RLHF, DPO o SFT específicas. Tampoco se especifica el método exacto de ajuste más allá de la referencia al modelo base.

La innovación técnica destacable no está en la arquitectura del transformer, sino en el formato de salida: el modelo emite bloques XML estructurados para razonamiento (`<think>`), descomposición de tareas (`<steps>`), validación de precondiciones (`<checks>`), captura visual (`<screenshot>`), ejecución de shell (`<command>`), lectura y escritura de ficheros (`<read>`, `<write>`), control de GUI (``) y marcado de vulnerabilidades (`<vuln>`). El contexto de 1M tokens se obtiene mediante YaRN rope-scaling. No se documentan técnicas como decodificación especulativa o atención lineal más allá de la atención híbrida heredada del modelo base.

## Capacidades

- Generación de texto y razonamiento interno estructurado mediante el bloque `<think>`.
- Planificación multi-paso con descomposición explícita en `<steps>` y títulos por tarea.
- Comprobaciones de seguridad y validación de precondiciones mediante `<checks>`.
- Ejecución de comandos de shell/Bash a través de `<command>`.
- Control de interfaz gráfica: movimiento de ratón y pulsaciones de teclado mediante ``.
- Captura de pantalla y ventanas vía `<screenshot>` para percepción del estado de la UI.
- Lectura e inspección de ficheros, logs y volcados de memoria con `<read>`.
- Escritura y parcheo de ficheros con `<write>`.
- Detección y marcado de vulnerabilidades y CVEs con `<vuln>` (incluye identificadores CWE y severidad).
- Razonamiento técnico sin rechazo declarado en tareas de ciberseguridad, pentesting, ingeniería inversa y auditoría de sistemas.
- Soporte de tool calling implícito a través del propio protocolo de bloques XML.
- Capacidad multilingüe: no disponible (solo se declara inglés).

## Casos de uso

- Automatización de operaciones en escritorio: un daemon puede enviar una instrucción en lenguaje natural y el modelo devuelve una secuencia de `<screenshot>` e `` para localizar y operar sobre aplicaciones GUI, lo que permite orquestar tareas de escritorio sin scripting frágil por coordenadas.
- Auditoría de seguridad en servidores: el modelo puede encadenar `<command>` con herramientas como `netstat`, `grep` o escáneres de puertos, leer logs con `<read>` y emitir hallazgos estructurados con `<vuln>`, integrándose en pipelines de revisión de cumplimiento.
- Pentesting asistido y red teaming: al no rechazar tareas de ciberseguridad, puede generar comandos de enumeración, análisis de configuraciones y propuestas de parcheo dentro de un flujo controlado por un operador humano.
- Gestión de incidencias y respuesta a alertas: con 1M de tokens de contexto puede ingerir logs extensos, trazas de sistema y documentación de runbooks en una sola pasada y producir un plan de remediación con pasos y comprobaciones previas.
- Análisis de codebases completas: la ventana de 1M tokens permite cargar repositorios enteros y realizar tareas de revisión, localización de configuraciones inseguras o generación de parches mediante `<write>`.
- Agente autónomo de CI/CD y mantenimiento: puede inspeccionar el estado del sistema, aplicar parches de ficheros y validar resultados con comandos de shell, todo dentro de un bucle agéntico parseable por máquina.
- Asistente de soporte técnico de nivel 2/3: interpreta el estado de la máquina del usuario a partir de capturas y salidas de comandos y propone acciones correctivas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 19 GB solo para pesos (9,41 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; con contexto de 1M tokens la caché KV crece de forma significativa y exige planificación cuidadosa de memoria.
- En cuantización de 8 bits: en torno a 10-11 GB para pesos; en 4 bits, en torno a 5-6 GB para pesos, aunque el autor no publica variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo en fp16; RTX 4090 (24 GB) viable en fp16 para contextos moderados y en cuantización para contextos mayores.
- Cabe en GPU de consumo: sí, en RTX 4090 y potencialmente en GPUs de 16 GB si se cuantiza, siempre con contexto reducido respecto al máximo de 1M.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (documentado por el autor); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verfy-9B | 9,41 B | 1.048.576 | OS-agent, computer-use, ciberseguridad | Apache 2.0 | Hugging Face |
| empero-ai/Qwythos-9B-v2 (modelo base) | no disponible | no disponible | Base generalista sobre Qwen3.5 9B | no disponible | Hugging Face |
| Qwen3.5 9B (familia base) | ~9 B | no disponible | LLM generalista con atención híbrida | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- El modelo está diseñado explícitamente para no rechazar tareas de ciberseguridad y ejecución de comandos, lo que implica un riesgo elevado de uso indebido o de acciones destructivas si se despliega sin sandboxing y supervisión humana.
- La generación de `<command>` y `<write>` puede producir operaciones peligrosas en el sistema anfitrión; es imprescindible ejecutar en entornos aislados y validar las acciones con el bloque `<checks>`.
- Riesgo de alucinación en la identificación de CVEs, CWEs y severidades dentro de `<vuln>`; los hallazgos deben verificarse con herramientas reales.
- El contexto de 1M tokens vía YaRN puede degradar la calidad en posiciones muy lejanas al inicio; no se han publicado evaluaciones de rendimiento en contexto largo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineamiento.
- El tamaño del repositorio (55,8 GB) y la necesidad de `trust_remote_code=True` implican ejecutar código del autor, lo que añade superficie de riesgo en la cadena de suministro.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de garantías y de evaluaciones formales hace recomendable una validación propia antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rowhanissick/Verfy-9B
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-v2
- Perfil del autor en Hugging Face: https://huggingface.co/Rowhanissick
- Portfolio del autor: https://rowhanissick.onrender.com
