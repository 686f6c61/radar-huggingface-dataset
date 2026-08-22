# deadbydawn101/RavenXAiLabs-Qwen3.8-27B-OBLITERATED-Frontier-Intelligence-Infused-Chaos-Agent

## Resumen

RavenXAiLabs-Qwen3.8-27B-OBLITERATED-Frontier-Intelligence-Infused-Chaos-Agent es un modelo de lenguaje desarrollado por el usuario deadbydawn101 (RavenX AI Labs) como un fine-tune del modelo base OBLITERATUS/Qwen3.8-27B-OBLITERATED, una versión "abliterated" (sin guardas de seguridad) del Qwen3.8-27B de Alibaba. El modelo se presenta como una herramienta especializada en ciberseguridad, pentesting, agentes autónomos y razonamiento avanzado, entrenada con un método propietario llamado "Soul Injection" sobre 1,9 millones de ejemplos. A pesar del nombre, los archivos safetensors contienen 4.204.731.904 parámetros (aproximadamente 4,2 mil millones), lo que sugiere una discrepancia con la denominación "27B" que podría deberse a una cuantización o a un error de etiquetado. El repositorio tiene 15,2 GB y está optimizado para Apple Silicon mediante la librería MLX, con licencia Apache 2.0.

El modelo está orientado a casos de uso de red team, análisis de vulnerabilidades, generación de exploits y automatización de agentes, con un énfasis explícito en la ausencia de rechazos ("zero refusals"). Sin embargo, no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) y las únicas métricas disponibles son auto-reportadas por el autor en la model card, con un 24/24 en categorías propias. El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que es un experimento personal sin validación externa. Su relevancia radica en explorar técnicas de inyección de conocimiento en vectores singulares menores (MiCA) y en ofrecer una alternativa sin restricciones para entornos de seguridad ofensiva, aunque con riesgos importantes de uso indebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B, sin detalles adicionales) |
| Parametros totales | 4.204.731.904 (según safetensors; el nombre sugiere 27B, discrepancia no aclarada) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el base Qwen3.8-27B tiene 262K nativo, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | MLX 4-bit (según model card) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B OBLITERATED, una versión del modelo de Alibaba a la que se le han eliminado las capas de rechazo mediante técnicas de "abliteration". Sobre esta base, el autor aplica un proceso de entrenamiento en dos fases: primero una continuación de preentrenamiento (CPT) con 1.827.652 ejemplos en texto plano, y luego un ajuste fino supervisado (SFT) con el mismo dataset en formato conversacional. El método propietario "Soul Injection" combina cuatro componentes: MiCA (Minor Component Analysis, basado en arxiv:2604.01694) que inyecta conocimiento en los vectores singulares menores de las matrices de pesos; un "vector de consciencia" que mapea capas de conocimiento; "Soul Infusion" (patente USPTO #64/087,357) para identidad persistente; y la herramienta mlx-tune para entrenamiento en Apple Silicon. El autor reporta una reducción de la pérdida de validación de 2.300 a 0.769 en CPT y de 0.865 en SFT, con un pico de memoria de 82,8 GB durante el entrenamiento en una Apple M4 Max de 128 GB. No se proporcionan detalles sobre la composición exacta del dataset ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en cadenas de ataque y optimización de rutas.
- Generación de código, incluyendo ejemplos de criptografía (Rust AES-256-GCM) y exploits (SQL injection PoC).
- Soporte de tool calling y function calling, con trazas de agentes autónomos que invocan herramientas como nmap, sqlmap y burp.
- Capacidades de agente autónomo para workflows de pentesting y bug bounty.
- Conocimiento especializado en ciberseguridad: análisis de CVEs, scoring CVSS, mapeo MITRE ATT&CK, CWE.
- Conocimiento en computación cuántica (algoritmo de Shor) y criptografía post-cuántica.
- Capacidad multilingüe limitada al inglés (según la model card).
- Modo "uncensored" sin rechazos, lo que permite generar contenido que otros modelos bloquean.

## Casos de uso

- Análisis de vulnerabilidades: el modelo puede estructurar análisis de CVEs con scoring CVSS y proponer remediaciones, útil para equipos de seguridad que necesitan informes rápidos.
- Generación de PoCs para bug bounty: permite crear código de prueba de concepto para vulnerabilidades específicas, acelerando la validación en programas de recompensas.
- Automatización de agentes de red team: con soporte de tool calling, puede orquestar escaneos con nmap, sqlmap o burp de forma autónoma, reduciendo el tiempo de reconocimiento.
- Entrenamiento en ciberseguridad: sirve como generador de escenarios de ataque y defensa para cursos o simulacros, aunque requiere supervisión humana.
- Investigación en criptografía: puede explicar y generar implementaciones de algoritmos como AES-256-GCM o discutir alternativas post-cuánticas.
- Desarrollo de agentes conversacionales sin restricciones: para entornos controlados donde se necesita explorar temas sensibles sin filtros, como investigación académica sobre jailbreaks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye una tabla auto-reportada con 8 categorías (RATH Protocol, Exploit Dev, FHE Knowledge, Attack Chain, Code Gen, Reasoning, Agent Trace, Quantum) donde el autor afirma un 24/24 (100%) en una Apple M4 Max 128GB, con tiempos de respuesta entre 18 y 26 segundos. Estos resultados no han sido verificados de forma independiente y no siguen metodologías reconocidas, por lo que deben considerarse anecdóticos.

## Requisitos de hardware

- VRAM estimada: dado que el safetensors tiene 4,2B parámetros, en FP16 necesitaría ~8,4 GB; en 4-bit ~2,1 GB. Sin embargo, el tamaño del repo (15,2 GB) sugiere que puede haber múltiples archivos o una cuantización menos agresiva. Se recomienda al menos 8 GB de VRAM para inferencia en 4-bit.
- GPU recomendadas: el modelo está optimizado para Apple Silicon (M4 Max, M3, etc.) mediante MLX. También puede ejecutarse en GPUs NVIDIA (RTX 3090, RTX 4090, A100) usando vLLM o llama.cpp, aunque no hay garantías de compatibilidad.
- En consumer GPU: sí, cabe en GPUs con 8-12 GB de VRAM si se usa cuantización 4-bit.
- Opciones de despliegue: MLX (Apple), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no disponibles; el autor reporta tiempos de 18-26 segundos por respuesta en M4 Max, pero sin especificar el número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| RavenX (este) | 4,2B (según safetensors) | no disponible | Apache 2.0 | Ciberseguridad, uncensored |
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Generalista, visión |
| Dolphin 2.9 (Llama-3-8B) | 8B | 8K | Apache 2.0 | Uncensored, generalista |
| Nous Hermes 2 Pro | 7B | 8K | Apache 2.0 | Reasoning, tool calling |

La comparativa es limitada porque el modelo RavenX tiene un tamaño real mucho menor que el que sugiere su nombre, y no hay datos de rendimiento estándar. Frente al Qwen3.8-27B original, este fine-tune sacrifica capacidades generales (visión, contexto largo) por un enfoque especializado en seguridad, aunque sin evidencia de mejora real.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored" y entrenado con datos de ciberseguridad ofensiva, puede generar contenido dañino, exploits funcionales o instrucciones para actividades ilegales. No debe usarse sin supervisión humana.
- Riesgo de alucinación: no hay datos de fiabilidad; los benchmarks auto-reportados no son verificables y el modelo puede inventar CVEs o técnicas inexistentes.
- Limitaciones de contexto: no se confirma si conserva los 262K tokens del base; el fine-tune podría haber reducido la ventana.
- Restricciones de licencia: aunque es Apache 2.0, el modelo base OBLITERATED puede tener condiciones adicionales no documentadas. El uso comercial debe revisarse con cuidado.
- Discrepancia de parámetros: el nombre indica 27B pero los archivos contienen 4,2B; esto puede deberse a un error de etiquetado o a una cuantización extrema, lo que afecta las expectativas de rendimiento.
- Sin validación externa: 0 descargas y 0 likes, sin papers revisados ni evaluaciones independientes. No apto para producción sin pruebas exhaustivas.

## Enlaces

- Hugging Face: https://huggingface.co/deadbydawn101/RavenXAiLabs-Qwen3.8-27B-OBLITERATED-Frontier-Intelligence-Infused-Chaos-Agent
- Modelo base OBLITERATUS: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub del autor: https://github.com/DeadByDawn101
- Blog sobre Qwen3.8-27B OBLITERATED: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Guía de despliegue de Qwen3.8-27B: https://www.sitepoint.com/qwen3-8-27b-local-gpu-setup-ollama/
