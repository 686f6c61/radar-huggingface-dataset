# mradermacher/Chimera-Qwen3.8-27B-Cyber-v1-GGUF

## Resumen

Chimera-Qwen3.8-27B-Cyber-v1 es un modelo de lenguaje especializado en ciberseguridad ofensiva, desarrollado por paulsaul126261 como un ajuste fino (fine-tuning) del modelo base Qwen3.8-27B, y posteriormente cuantizado a formato GGUF por mradermacher para facilitar su despliegue local. El modelo está diseñado para tareas de red-team, pentesting, bug-bounty, análisis de CVE y generación de exploits, siempre con fines legales y autorizados. Combina las capacidades generales de razonamiento y generación de texto del modelo base con un entrenamiento específico en dominios de seguridad informática.

La versión GGUF aquí documentada incluye cuantizaciones desde Q2_K hasta Q8_0, además de proyectores multimodales (mmproj) que sugieren soporte de visión. El modelo base Qwen3.8-27B, según fuentes externas, cuenta con una ventana de contexto de 262 000 tokens y un codificador de visión integrado, lo que convierte a Chimera en una herramienta versátil para análisis de código, documentación técnica y soporte a agentes de seguridad. Su licencia Apache 2.0 permite uso comercial con restricciones éticas de uso autorizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262 000 tokens (según especificaciones del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; adicionalmente mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (además de safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 27 300 millones de parámetros, desarrollado por la serie Qwen. Según los artículos técnicos publicados, incorpora un codificador de visión (vision encoder) que le permite procesar imágenes junto con texto, y una ventana de contexto ampliada de 262 000 tokens. La arquitectura es completamente densa, sin mezcla de expertos (MoE), lo que simplifica su ejecución en hardware convencional.

El ajuste fino realizado por paulsaul126261 empleó técnicas LoRA (Low-Rank Adaptation) con la librería Unsloth, optimizada para entrenamiento eficiente. El dataset de entrenamiento no está documentado en la información disponible, pero por los tags y la descripción se infiere que incluye datos de ciberseguridad ofensiva, vulnerabilidades, exploits y técnicas de red-team. No se menciona el uso de RLHF o DPO; es probable que se haya utilizado un ajuste fino supervisado estándar. La cuantización GGUF fue generada por mradermacher, quien proporciona múltiples niveles de compresión para adaptarse a diferentes capacidades de hardware.

## Capacidades

- Generación de texto especializado en ciberseguridad: análisis de vulnerabilidades, redacción de informes de pentesting, explicación de CVEs y técnicas de explotación.
- Soporte de tool calling y function calling: el modelo puede integrarse en flujos de trabajo agenticos, invocando herramientas externas como escáneres de puertos, bases de datos de vulnerabilidades o APIs.
- Capacidades multimodales: gracias al mmproj incluido, puede procesar imágenes, lo que permite analizar capturas de pantalla de aplicaciones, diagramas de red o documentos escaneados.
- Razonamiento multi-step: adecuado para tareas complejas de análisis de seguridad que requieren encadenar varios pasos lógicos.
- Comprensión de contexto largo: con 262 000 tokens de ventana, puede procesar documentos técnicos extensos, logs completos o bases de código enteras.
- Capacidades multilingües limitadas: aunque el modelo está entrenado principalmente en inglés, puede generar texto en otros idiomas con menor calidad.

## Casos de uso

- Auditorías de seguridad autorizadas: el modelo puede analizar código fuente de aplicaciones web para identificar vulnerabilidades comunes (inyección SQL, XSS, CSRF) y sugerir correcciones, aprovechando su conocimiento de CVE y patrones de ataque.
- Red-team automatizado: integrado en plataformas de pruebas de penetración, puede generar comandos de explotación, adaptar payloads y proponer vectores de ataque basados en el contexto de la infraestructura objetivo.
- Análisis de vulnerabilidades en logs: gracias a su ventana de contexto de 262 000 tokens, puede procesar archivos de log extensos para detectar patrones de intrusión o actividad sospechosa.
- Asistente para bug bounty: los investigadores pueden usarlo para redactar informes de vulnerabilidad detallados, incluyendo pasos de reproducción, impacto y recomendaciones de mitigación.
- Generación de documentación de seguridad: puede crear guías de hardening, políticas de seguridad o manuales de respuesta a incidentes a partir de especificaciones técnicas.
- Soporte en análisis forense: con su capacidad multimodal, puede examinar capturas de pantalla de malware, diagramas de red o artefactos visuales para extraer información relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo Chimera-Qwen3.8-27B-Cyber-v1 en la información disponible. El modelo base Qwen3.8-27B cuenta con benchmarks publicados en su documentación oficial, pero no se incluyen aquí al no estar disponibles en las fuentes consultadas. Se recomienda evaluar el modelo en tareas propias de ciberseguridad para determinar su rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, se requieren aproximadamente 11 GB (Q2_K) hasta 29 GB (Q8_0) solo para los pesos. A esto hay que sumar la memoria para el contexto y las activaciones.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40 GB). Para Q5_K_M o Q6_K, se necesitan 32 GB o más. El modelo puede ejecutarse en GPUs de consumo con cuantizaciones bajas (Q2_K, Q3_K_M) en una RTX 3080 de 10 GB, aunque con pérdida de calidad.
- Ejecución en CPU: es posible con llama.cpp u Ollama, pero la velocidad será considerablemente menor; se recomienda al menos 32 GB de RAM para cuantizaciones Q4.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio, vLLM y SGLang (este último mencionado en los artículos web para el modelo base).
- Latencia y throughput: no se han publicado datos específicos para este modelo. Como referencia, en una GPU A100 de 80 GB con cuantización Q4_K_M, se puede esperar una velocidad de generación de 50-100 tokens por segundo, pero estos valores son estimaciones.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva con otros modelos de ciberseguridad en el momento de redactar esta ficha. Existen otros modelos como Chimera-Qwen3.6-35B-A3B-Cyber-v1 (versión MoE) o Qwen3.6-27B-Uncensored-Cyber, ambos del mismo autor, pero no se han publicado comparaciones de rendimiento. Se recomienda consultar los benchmarks oficiales de la familia Qwen3.8 para una referencia general.

## Limitaciones y advertencias

- Uso restringido: el modelo está diseñado exclusivamente para actividades de seguridad autorizadas y legales. Su uso en sistemas sin permiso explícito es ilegal y contrario a la licencia.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inexacta sobre vulnerabilidades, exploits o CVEs. Los resultados deben ser verificados por profesionales.
- Sesgos potenciales: al estar entrenado principalmente en inglés y con datos de seguridad, puede mostrar sesgos hacia técnicas y herramientas de habla inglesa.
- Limitación de idioma: aunque puede generar texto en otros idiomas, su rendimiento óptimo es en inglés.
- Requisitos de hardware: las cuantizaciones de alta calidad requieren GPUs con gran memoria, lo que puede limitar su uso en entornos con recursos modestos.
- Sin garantías: el autor no ofrece garantías sobre la precisión o seguridad del modelo; su uso en producción requiere validación exhaustiva.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Chimera-Qwen3.8-27B-Cyber-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/paulsaul126261/Chimera-Qwen3.8-27B-Cyber-v1
- Artículo de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de ejecución local (Yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Especificaciones y requisitos (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Otro modelo relacionado: https://huggingface.co/mradermacher/Chimera-Qwen3.6-35B-A3B-Cyber-v1-GGUF
