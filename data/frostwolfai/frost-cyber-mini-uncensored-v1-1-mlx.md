# FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-MLX

## Resumen

Frost-Cyber-Mini-Uncensored-v1.1-MLX es la conversión nativa para Apple Silicon del modelo FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1, un ajuste fino de dominio de ciberseguridad con entrenamiento adicional en uso de herramientas y razonamiento agéntico. Lo desarrolla Vatsal Bajpai bajo el sello FrostWolfAI y se distribuye con licencia Apache 2.0. El modelo parte de Spark-X2.6-4B-abliterated, al que se le han eliminado los mecanismos de rechazo (abliteration) y se ha especializado en tareas de seguridad ofensiva y defensiva.

La arquitectura, denominada `spark2_5`, es un transformer de 36 capas con atención híbrida: 27 capas de ventana deslizante de 512 tokens y 9 capas de atención global en proporción 3:1. Cuenta con 4.112.079.360 parámetros totales, ventana de contexto nativa de 131.072 tokens (ampliable hasta 232k mediante RoPE) y un vocabulario de 131.072 entradas. Esta versión MLX aplica cuantización afín de 4 bits con tamaño de grupo 64, lo que resulta en 4,505 bits por peso y un tamaño en disco de 2,32 GB.

Su relevancia actual radica en que ofrece un modelo de 4B parámetros ejecutable en local sobre Macs con chip Apple Silicon, sin necesidad de `trust_remote_code` (mlx-lm soporta `spark2_5` de forma nativa desde la versión 0.32), orientado a flujos de trabajo agénticos con tool calling y a tareas de seguridad que requieren un modelo sin filtros de rechazo. Está pensado para pruebas de seguridad autorizadas, investigación, defensa y educación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (transformer híbrido: 27 capas sliding-window de 512 + 9 capas de atención global, ratio 3:1) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens nativos; hasta 232k vía RoPE |
| Tipos de cuantizacion | 4-bit afín, group size 64 (4,505 bits/peso); gates `g_proj` y normas en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (`model_type: spark2_5`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con atención híbrida: 36 capas en total, de las cuales 27 usan ventana deslizante de 512 tokens y 9 usan atención global, intercaladas en proporción 3:1. La atención tiene 16 cabezas de consulta y 4 cabezas KV, dimensión de cabeza 256, QKV fusionado y una puerta de salida sigmoide por cabeza (head-wise sigmoid output gate). La dimensión oculta es 2560 y la intermedia 10240, con MLP GELU y embeddings atados. Las capas deslizantes usan una caché KV rotatoria de 512 tokens, de modo que en contexto largo la memoria solo crece con las 9 capas globales.

El entrenamiento parte de Spark-X2.6-4B-abliterated (modelo con rechazos eliminados) y aplica un SFT de ciberseguridad seguido, en la versión v1.1, de una fase de ajuste fino para uso de herramientas agéntico entrenada sobre la traza completa: el modelo lee la tarea, inspecciona con herramientas, actúa, observa cada resultado, se recupera de errores y finalmente responde. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. La innovación técnica destacable es la atención híbrida con caché KV rotatoria, que reduce el coste de memoria en contextos largos, junto con el canal de razonamiento (thinking) obligatorio.

## Capacidades

- Generación de texto y razonamiento con canal de pensamiento (thinking) activado por defecto; el modelo degrada severamente si se desactiva.
- Razonamiento agéntico multi-paso con uso de herramientas (tool calling / function calling): inspección, acción, observación de resultados y recuperación de errores.
- Generación de código, incluido código de seguridad (por ejemplo, escáneres de puertos en Python con asyncio).
- Conocimiento de dominio de ciberseguridad ofensiva y defensiva, sin filtros de rechazo (abliterated).
- Soporte de `reasoning_effort` con valores `"low"` (por defecto) y `"high"`; en un modelo de 4B el comportamiento es prácticamente on/off.
- Capacidades multilingües limitadas al inglés.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo puede generar scripts de reconocimiento, escáneres de puertos y utilidades de explotación en Python, integrándose en un flujo agéntico que ejecuta herramientas y evalúa resultados.
- Automatización de análisis de seguridad: con 131k tokens de contexto nativo puede procesar logs extensos, tráfico de red o informes y resumir indicadores relevantes.
- Asistentes de respuesta a incidentes: el bucle agéntico con observación de resultados permite encadenar consultas a herramientas (por ejemplo, lookup de CVEs o de reputación de IPs) y sintetizar una respuesta.
- Educación y formación en seguridad: al no rechazar consultas, sirve para explicar técnicas de ataque y defensa en entornos controlados, como el ejemplo de handshake TLS 1.3 de la model card.
- Desarrollo de herramientas de seguridad en local: al ejecutarse en Apple Silicon con 2,32 GB en disco, permite prototipar asistentes de seguridad sin enviar datos a la nube.
- Integración en pipelines de CI/CD de seguridad: mediante el servidor compatible con OpenAI (`mlx_lm.server`) se puede exponer el modelo en el puerto 8080 y consumirlo desde herramientas internas de análisis.
- Investigación sobre alineación y abliteration: como modelo sin rechazos, es útil para estudiar el comportamiento de modelos abliterated en tareas sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha del repositorio safetensors base para benchmarks y detalles de entrenamiento, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- Requiere Mac con Apple Silicon y macOS 13.5 o superior; no es ejecutable en GPU NVIDIA ni en CPU x86 mediante MLX.
- `mlx-lm >= 0.32` (la conversión se realizó con mlx-lm 0.32.2, con soporte nativo de `spark2_5`).
- Tamaño en disco de 2,32 GB en cuantización de 4 bits; la VRAM/unified memory necesaria para inferencia no se especifica en la información disponible, aunque por el tamaño del modelo es holgada en equipos con 16 GB o más de memoria unificada.
- Opciones de despliegue: `mlx_lm.generate` (CLI), `mlx_lm.server` (servidor compatible con OpenAI en el puerto 8080) y LM Studio con motor MLX.
- Para llama.cpp, Ollama o LM Studio en modo GGUF debe usarse el repositorio Frost-Cyber-Mini-Uncensored-v1.1-GGUF; MLX no puede cargar archivos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Frost-Cyber-Mini-Uncensored-v1.1-MLX | 4,11B | 131k nativo (232k vía RoPE) | MLX safetensors 4-bit | apache-2.0 | Solo Apple Silicon; abliterated; agéntico |
| Frost-Cyber-Mini-Uncensored-v1.1 (base) | 4,11B | 131k nativo | safetensors BF16 | apache-2.0 | Modelo original del que deriva esta conversión |
| Frost-Cyber-Mini-Uncensored-v1.1-GGUF | 4,11B | 131k nativo | GGUF | apache-2.0 | Para llama.cpp, Ollama y LM Studio |
| Frost-Cyber-Mini-1.0 | no disponible | no disponible | no disponible | no disponible | Versión anterior de la familia, también abliterated |

## Limitaciones y advertencias

- El modelo tiene los rechazos eliminados (abliterated): puede producir código de explotación, payloads y tácticas de atacante bajo petición. El uso es responsabilidad del usuario y debe limitarse a pruebas autorizadas, investigación, defensa y educación conforme a la ley aplicable.
- El thinking debe estar activado (`enable_thinking=True`); con él desactivado el modelo se degrada severamente y llega a repetir JSON en lugar de responder.
- No deben usarse muestreadores con penalización de repetición como DRY en codificación agéntica: mutan cadenas literales (rutas de archivo, identificadores) que las llamadas a herramientas deben reproducir byte a byte. Si el modelo entra en bucle, hay que cortarlo en el cliente (deduplicar llamadas idénticas, limitar pasos) y usar temperatura en torno a 0,3–0,4.
- No es fiable para detalles de CVE consultados por identificador; conviene verificar contra una fuente primaria o proporcionar una herramienta de lookup.
- Riesgo de alucinación inherente a un modelo de 4B parámetros; no se documentan sesgos específicos en la información disponible.
- Soporte únicamente de inglés; el contexto nativo es de 131k tokens, con extensión a 232k vía RoPE pero sin datos de rendimiento en esa extensión.
- Restricción de plataforma: la versión MLX solo funciona en Apple Silicon; para otras plataformas debe usarse la variante GGUF o los pesos BF16.
- Con `reasoning_effort="low"` o `"high"` el comportamiento es prácticamente idéntico en un modelo de este tamaño; conviene tratarlo como un interruptor on/off y asignar un presupuesto generoso de `max_tokens` para evitar truncamientos a mitad de razonamiento.

## Enlaces

- Repositorio Hugging Face (MLX): https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-MLX
- Modelo base (safetensors, BF16): https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1
- Variante GGUF: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-GGUF
- Modelo previo de la familia: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-1.0
- Variante GGUF del modelo previo: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-1.0-GGUF
- Modelo origen abliterated: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Colección de la familia: https://huggingface.co/collections/FrostWolfAI/frost-cyber-mini-v11
- Repositorio MLX: https://github.com/ml-explore/mlx
- Perfil del autor: https://huggingface.co/xblack
- Organización: https://huggingface.co/FrostWolfAI
