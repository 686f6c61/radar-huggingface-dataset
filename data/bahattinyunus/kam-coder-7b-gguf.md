# bahattinyunus/kam-coder-7b-gguf

## Resumen

KAM-Coder 7B (denominado "Ulu Demirci" por el autor) es un modelo de generación de texto derivado de Qwen 2.5 Coder 7B, publicado por el desarrollador independiente Bahattin Yunus Çetin bajo el identificador `bahattinyunus/kam-coder-7b-gguf`. Se distribuye empaquetado en formato GGUF (4,68 GB) y está pensado para su uso dentro del ecosistema KAM, un motor de agente autónomo local que el autor describe como "Sovereign Autonomous Cognitive Engine" y que integra componentes de inferencia activa (free-energy principle), telemetría eBPF, JIT en C++20 y un bucle ReAct/CodeAct de seis pasos.

El modelo hereda la base de Qwen 2.5 Coder 7B, un transformer decoder-only de 7.615.616.512 parámetros (según los pesos safetensors del repositorio), orientado a tareas de código y con soporte declarado de turco e inglés. La propuesta del autor no es tanto un modelo nuevo entrenado desde cero como un empaquetado y ajuste orientado a flujos de trabajo de ingeniería de sistemas (C++20, eBPF, CUDA) dentro de una arquitectura de agente local y air-gapped.

Es relevante ahora por dos motivos: por un lado, la licencia Apache 2.0 y el formato GGUF facilitan su despliegue en entornos locales y edge; por otro, ejemplifica una tendencia creciente de modelos pequeños empaquetados como "sistemas cognitivos" con herramientas y memoria, aunque la información pública disponible sobre el proceso de ajuste y los datos de entrenamiento es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 2.5 Coder 7B; no se detalla modificación estructural) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repo pesa 4,68 GB; no se detalla el nivel exacto de cuantización) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,7 GB); pesos base en safetensors según metadatos de parámetros |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo se presenta como derivado de Qwen 2.5 Coder 7B, un transformer decoder-only con atención causal estándar. El autor no publica en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o SFT específicas para este checkpoint. Tampoco se especifica si se aplicó algún ajuste fino sobre la base Qwen 2.5 Coder o si el checkpoint es un reempaquetado en GGUF con metadatos del ecosistema KAM.

Las innovaciones que el autor atribuye al sistema (no necesariamente al modelo en sí) incluyen inferencia activa basada en el principio de energía libre de Friston, telemetría eBPF con latencias declaradas inferiores a 12 μs, auto-reparación JIT en memoria en 41,2 ms mediante `memfd_create`, y un bucle de agente ReAct + CodeAct de seis pasos con más de 40 herramientas. Estos componentes pertenecen al runtime KAM descrito en el repositorio de GitHub, no al modelo de lenguaje, y no se aportan métricas reproducibles que permitan verificar dichas cifras.

## Capacidades

- Generación de texto y código, con orientación declarada a ingeniería de sistemas (C++20, eBPF, CUDA).
- Soporte de conversación multi-turno (tag `conversational` en Hugging Face).
- Integración con el bucle de agente ReAct + CodeAct del runtime KAM (más de 40 herramientas Win32/PowerShell/Python/Web/Archivos según el autor).
- Soporte de comandos de voz en turco y TTS, según la model card (funcionalidad del runtime, no del modelo).
- Capacidades multilingües limitadas a turco e inglés.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y despliegue vía Ollama.
- No se documentan capacidades de visión, audio nativo ni modo de razonamiento extendido (`thinking`) en la información disponible.

## Casos de uso

- Asistencia a desarrollo de código de sistemas: el modelo puede generar y revisar fragmentos de C++20, scripts de eBPF y código CUDA dentro de un IDE o pipeline, aprovechando su base Qwen 2.5 Coder.
- Agente local air-gapped: al distribuirse en GGUF y con licencia Apache 2.0, puede desplegarse en máquinas sin conexión a la nube y conectarse al runtime KAM para tareas de automatización de escritorio.
- Automatización de tareas de administración de sistemas: generación de scripts PowerShell y Python para operaciones repetitivas, integrable en herramientas de orquestación locales.
- Análisis de archivos y logs en local: dentro del flujo KAM, el modelo puede procesar contenido arrastrado y soltado (drag-and-drop) para resumir o diagnosticar.
- Prototipado de asistentes conversacionales en turco: es uno de los pocos modelos pequeños con soporte declarado de turco e inglés y licencia permisiva.
- Evaluación de arquitecturas de agentes: útil como banco de pruebas para investigar bucles ReAct/CodeAct y memoria episódica en entornos controlados.
- Despliegue en edge: el tamaño de 4,68 GB en GGUF permite ejecución en estaciones de trabajo con GPU de consumo, aunque no se especifica la cuantización exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ~7,6 mil millones de parámetros en GGUF de 4,68 GB, la inferencia en FP16 requeriría aproximadamente 15 GB y en cuantizaciones de 4 bits alrededor de 5-6 GB, aunque el nivel exacto de cuantización del repo no se detalla.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar ejecución en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB en cuantización de 4 bits.
- GPU de consumo: probablemente sí en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores con cuantización adecuada, si bien no hay confirmación oficial.
- Opciones de despliegue: Ollama (`ollama run hf.co/bahattinyunus/kam-coder-7b-gguf`), llama.cpp y cualquier runtime compatible con GGUF. El autor también ofrece interfaces web (FastAPI, puerto 8080) y de escritorio (PyQt6) en su repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAM-Coder 7B | 7,6 B | no disponible | Apache 2.0 | GGUF | Base Qwen 2.5 Coder 7B, orientado a agente local |
| Qwen 2.5 Coder 7B | 7,6 B | 128 K (según ficha oficial de Qwen) | Apache 2.0 (según variante) | safetensors, GGUF | Modelo base; benchmarks públicos disponibles |
| DeepSeek-Coder 6.7B | 6,7 B | 16 K (según ficha oficial) | DeepSeek License | safetensors, GGUF | Alternativa centrada en código |
| CodeLlama 7B | 6,7 B | 16 K (según ficha oficial) | Llama 2 License | safetensors, GGUF | Alternativa con licencia más restrictiva |

La comparación con Qwen 2.5 Coder 7B es la más directa, ya que KAM-Coder deriva de ella; sin embargo, no se han publicado métricas que permitan cuantificar diferencias de rendimiento respecto al modelo base.

## Limitaciones y advertencias

- Ausencia de benchmarks públicos: no hay datos verificables de MMLU, HumanEval ni GSM8K para este checkpoint.
- Documentación escasa: la model card describe sobre todo el runtime KAM y no el proceso de entrenamiento, los datos o las modificaciones sobre Qwen 2.5 Coder.
- Riesgo de alucinación: como cualquier modelo de 7B, puede generar código o afirmaciones plausibles pero incorrectas, especialmente en dominios especializados como eBPF o CUDA.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento base de Qwen 2.5 Coder puede arrastrar sesgos de sus datos originales.
- Cobertura idiomática limitada: solo turco e inglés declarados; el rendimiento en castellano no está garantizado.
- Contexto no especificado: se desconoce la ventana efectiva, lo que dificulta planificar tareas de contexto largo.
- Afirmaciones no verificadas: métricas como latencias eBPF inferiores a 12 μs o auto-reparación JIT en 41,2 ms provienen del autor y no cuentan con validación independiente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de la base Qwen 2.5 Coder y de cualquier componente del runtime KAM distribuido por separado.
- Madurez: 284 descargas y 0 likes en el momento de la consulta; proyecto de un único autor, sin comunidad amplia que valide su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/bahattinyunus/kam-coder-7b-gguf
- Repositorio GitHub del proyecto KAM: https://github.com/bahattinyunus/kam
- Perfil del autor en GitHub: https://github.com/bahattinyunus
- Modelo relacionado `kam-apex-8b-gguf`: https://huggingface.co/bahattinyunus/kam-apex-8b-gguf
- Modelo relacionado `kam-7b-gguf`: https://huggingface.co/bahattinyunus/kam-7b-gguf
- Modelo relacionado `kam-r1-gguf`: https://huggingface.co/bahattinyunus/kam-r1-gguf
- Modelo relacionado `kam-r1-nano-1.5b-gguf`: https://huggingface.co/bahattinyunus/kam-r1-nano-1.5b-gguf
- Modelo relacionado `kam-coder-nano-1.5b-gguf`: https://huggingface.co/bahattinyunus/kam-coder-nano-1.5b-gguf
- Modelo relacionado `kam-1.5b-edge-gguf`: https://huggingface.co/bahattinyunus/kam-1.5b-edge-gguf
- Modelo relacionado `kam-edge-moe-b158`: https://huggingface.co/bahattinyunus/kam-edge-moe-b158
