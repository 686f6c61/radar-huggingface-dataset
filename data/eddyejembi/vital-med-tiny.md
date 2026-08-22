# eddyejembi/vital-med-tiny

## Resumen
Vital-Med Tiny es un modelo de lenguaje especializado en salud y bienestar, desarrollado por Eddy Ejembi para entornos de bajos recursos en África. Se basa en el modelo Qwen3.5-2B y se distribuye en formato GGUF cuantizado Q4_K_M, diseñado para ejecutarse offline con llama.cpp en hardware modesto. El modelo ofrece orientación sanitaria educativa y coaching de bienestar, con un enfoque claro en su uso como herramienta de apoyo, no como sistema de diagnóstico clínico.

El modelo surge en el contexto del ADTC 2026 (Africa Deep Tech Conference) y se integra en el proyecto Vital, un asistente ambiental de bienestar que funciona localmente en el ordenador. Con aproximadamente 1.940 millones de parámetros y una huella de memoria en torno a 2 GB, está pensado para ejecutarse en portátiles o dispositivos de gama media sin necesidad de conexión a internet. Su relevancia actual radica en la creciente demanda de soluciones de IA sanitaria accesibles en África, donde la infraestructura de red y los recursos computacionales son limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-2B) |
| Parametros totales | 1.942.653.248 (aproximadamente 1,94 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única cuantización publicada) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3.5-2B, un modelo transformer de lenguaje de 2 mil millones de parámetros desarrollado por Alibaba Cloud. No se ha especificado si la arquitectura original incluye mecanismos de atención lineal o decodificación especulativa, y el autor no detalla los datos de entrenamiento del fine-tuning. El proceso de ajuste fino se realizó sobre el checkpoint base de Qwen3.5-2B, orientándolo hacia dominios de salud y bienestar en contextos africanos. No se indica si se emplearon técnicas de RLHF o DPO; la información disponible no aporta detalles sobre el dataset de entrenamiento ni el número de tokens utilizados.

La cuantización se realizó en formato GGUF Q4_K_M, que reduce el tamaño del modelo a aproximadamente 1,3 GB, manteniendo un equilibrio entre fidelidad y requisitos de memoria. El runtime de inferencia es llama.cpp, que permite ejecución en CPU sin GPU dedicada.

## Capacidades
- Generación de texto conversacional orientado a salud y bienestar, con respuestas en inglés.
- Proporciona orientación sanitaria educativa y consejos de triage de bajo nivel.
- Soporte de conversación multi-turno para interacciones tipo asistente.
- Funciona en modo offline, sin necesidad de conexión a internet.
- Capacidad de ejecución en hardware de bajos recursos (portátiles, mini-PCs).
- No se ha documentado soporte de tool calling ni function calling en la información disponible.
- No se ha documentado capacidades multimodales (visión, audio, etc.).

## Casos de uso
- Atención sanitaria rural sin conexión: el modelo puede desplegarse en portátiles de clínicas rurales en África, donde no hay conexión estable, para proporcionar información básica de salud a pacientes y personal no médico.
- Coaching de bienestar personal: funciona como un asistente ambiental que recuerda y orienta sobre hábitos saludables, hidratación, sueño y ejercicio, integrado en el proyecto Vitál.
- Formación de personal sanitario: como herramienta de referencia para estudiantes de medicina y enfermería en entornos con acceso limitado a libros o internet.
- Triage inicial de síntomas: puede ayudar a clasificar síntomas y orientar sobre la urgencia de consulta médica, aunque sin reemplazar un diagnóstico clínico.
- Educación comunitaria en salud: organizaciones no gubernamentales pueden usarlo en talleres y programas de prevención en zonas rurales, ejecutándolo en un único portátil.
- Desarrollo de prototipos de IA en salud: investigadores y desarrolladores pueden integrarlo en aplicaciones de salud móvil o sistemas de telemedicina básica que requieran inferencia local y privada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible más allá de las métricas locales del autor:

| Prueba | Resultado |
|---|---|
| arc_easy (proxy, 50 muestras) | 0,68 acc_norm |
| Throughput de generación | 10,41 tokens/s |
| Pico de memoria (RSS) | ~2,01 GB |
| Throttling térmico | No reportado |

Estos datos provienen del perfilador ADTC del autor y se midieron en un portátil, pero no se especifica el hardware exacto. No hay comparaciones con modelos similares en la información disponible.

## Requisitos de hardware
- VRAM estimada: no requiere GPU; la inferencia se realiza en CPU con llama.cpp.
- Memoria RAM: pico de 2,01 GB (medido), lo que permite ejecución en sistemas con 4 GB de RAM o más.
- GPU recomendada: ninguna necesaria; el modelo está diseñado para CPU.
- Compatibilidad con GPU de consumo: posible ejecución en GPU con 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2050), pero no es el objetivo principal.
- Opciones de despliegue: llama.cpp, Ollama (si se convierte), también compatible con librerías que carguen GGUF (llama-cpp-python, llama-cpp).
- Latencia y throughput: 10,41 tokens/s en CPU de portátil, suficiente para interacciones conversacionales no exigentes.

## Comparativa con modelos similares
No disponible. No se han encontrado datos comparativos con otros modelos de salud de tamaño similar en la información proporcionada. El modelo se posiciona como una solución específica para contexto africano con base Qwen3.5-2B, pero no hay alternativas equivalentes documentadas en el repositorio.

## Limitaciones y advertencias
- El modelo no es un sistema de diagnóstico clínico; su autor indica que es para información educativa y triage de orientación.
- Riesgo de alucinación en contextos médicos: la información generada puede ser incorrecta o incompleta, especialmente en casos complejos.
- Solo disponible en inglés; no hay soporte multilingüe documentado, lo que limita su uso en muchas regiones africanas con lenguas locales.
- Licencia "other" no detallada: no se especifican términos exactos de uso comercial ni restricciones.
- Sin datos de entrenamiento públicos: no se puede evaluar sesgos del dataset de fine-tuning.
- Contexto de longitud no especificado: podría ser limitado para conversaciones largas.
- Rendimiento de razonamiento limitado por el tamaño (2B), no apto para tareas médicas complejas.
- No hay soporte de tool calling ni agentes, lo que limita su integración en sistemas que requieran interacción con APIs.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/eddyejembi/vital-med-tiny
- Repositorio de GitHub del proyecto Vital: https://github.com/EddyEjembi/Vital
- Perfil de GitHub de Eddy Ejembi: https://github.com/EddyEjembi
- Perfil de Hugging Face de Eddy Ejembi: https://huggingface.co/eddyejembi/datasets
- Artículo en Medium sobre Tiny ML: https://medium.com/@eddyejembi/tiny-ml-bringing-ai-to-the-edge-9d89d7d779c4
- Publicación en LinkedIn sobre Vitál: https://www.linkedin.com/posts/eddyejembi_whoop-nvidia-buildsmall-activity-7472558793868951553-3DNC
