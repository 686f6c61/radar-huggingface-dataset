# hotdogs/Qwen3.8-27B-abliterated-cyber-preview-MTP-GGUF

## Resumen

Qwen3.8-27B-Abliterated-Cyber-Preview-MTP-GGUF es una cuantización GGUF del modelo fusionado hotdogs/Qwen3.8-27B-abliterated-cyber-preview, un modelo de 27 300 millones de parámetros orientado a seguridad ofensiva y agente con llamada a herramientas. El modelo combina un LoRA de ciberseguridad entrenado sobre el dataset hotdogs/cyber-sft-agent-qwen38 con una base abliterated (sin rechazo de instrucciones), manteniendo la cabeza MTP (Multi-Token Prediction) para decodificación especulativa nativa en llama.cpp.

El resultado es un modelo que no rechaza peticiones de hacking y que emite llamadas a herramientas de pentest (nmap, ffuf, masscan, sqlmap, wpscan, smbclient) de forma fiable. La versión GGUF incluye cuantizaciones con imatrix y soporte para self-speculative decoding mediante la cabeza MTP, lo que permite acelerar la inferencia en hardware moderado. Es un proyecto de tipo preview orientado a investigación de seguridad autorizada y red-teaming, con licencia Apache-2.0.

La arquitectura hereda el híbrido de Qwen3.8: 64 capas transformer con 16 capas de atención completa y 48 de atención lineal, 5120 de dimensión oculta y 24 cabezas de consulta con 4 de clave/valor. El contexto configurado en los ejemplos de uso es de 32 768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (16 capas full attention + 48 capas linear attention), 64 capas, hidden size 5120, GQA 24/4, cabeza MTP preservada |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (configuración de ejemplo en llama.cpp; la base puede soportar más) |
| Tipos de cuantizacion | bf16 (master), Q6_K, Q4_K_M, IQ4_NL (todos con imatrix) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo padre usa safetensors |

## Arquitectura y entrenamiento

El modelo parte de hotdogs/Qwen3.8-27B-abliterated, una versión del Qwen3.8-27B de Qwen a la que se ha eliminado el rechazo de respuestas mediante técnicas de abliteration (modificación de activaciones sin reentrenamiento). Sobre esa base se ha fusionado un LoRA de ciberseguridad entrenado con el dataset hotdogs/cyber-sft-agent-qwen38, a escala 1.0 con PEFT alpha/r = 64/32 = 2.0. La cabeza MTP se conserva intacta, lo que permite usar decodificación especulativa nativa (self-speculative) en llama.cpp.

El proceso de cuantización se realizó con imatrix, calculado a partir del maestro bf16, lo que mejora la calidad en cuantizaciones de 4 bits. El modelo es de tipo image-text-to-text en el padre, aunque esta versión GGUF se sirve como text-generation puro. La fusión busca mantener las capacidades generales de la base (divergencia KL de 0.041 en prompts base) mientras se reorienta el comportamiento hacia tareas de seguridad ofensiva (KL de 0.808 en prompts de herramienta).

## Capacidades

- Generación de texto y razonamiento general: mantiene las capacidades del Qwen3.8-27B base en preguntas, matemáticas y código (7/7 en pruebas internas).
- Llamada a herramientas (tool calling): emite llamadas estructuradas en el formato Qwen3.5 para herramientas reales de pentesting: nmap, ffuf, masscan, sqlmap, wpscan y smbclient. Correcta selección de herramienta en 6/6 escenarios de prueba.
- Soporte de agentes y razonamiento multi-paso: el modelo puede encadenar acciones de escaneo y análisis en escenarios de penetración, usando el formato de tool_call del chat template Qwen3.5.
- Integración con MCP: el etiquetado incluye mcp, lo que indica compatibilidad con el protocolo Model Context Protocol para conectarse a herramientas externas.
- Decodificación especulativa MTP: la cabeza MTP preservada permite self-speculative decoding en llama.cpp con una tasa de aceptación de draft de 0.77, acelerando la inferencia.
- Multilingüe limitado: soporte declarado en inglés y chino.
- Sin rechazo de respuestas: al estar abliterated, no muestra negativas ante peticiones de seguridad ofensiva.

## Casos de uso

- Evaluaciones de seguridad autorizadas (pentesting): el modelo puede guiar un escaneo de puertos con nmap y analizar los servicios expuestos, emitiendo llamadas de herramienta reales que se pueden ejecutar en un entorno controlado.
- Red-teaming de infraestructura: con masscan y nmap, se pueden planificar escaneos de red a gran escala y priorizar objetivos dentro de un alcance autorizado, con el modelo sugiriendo los siguientes pasos.
- Análisis de vulnerabilidades web: con wpscan y ffuf, el modelo puede enumerar plugins de WordPress o fuzzear directorios ocultos, integrado en un pipeline de pruebas automatizado.
- Automatización de explotación en laboratorios: con sqlmap, el modelo puede proponer y ejecutar pruebas de inyección SQL en sistemas propios o de pruebas, documentando resultados.
- Formación y simulación de red-teaming: en entornos educativos con máquinas vulnerables (CTF, laboratorios), el modelo actúa como asistente que no rechaza y explica técnicas de explotación.
- Integración en pipelines de agentes con MCP: se puede conectar a un servidor MCP que exponga herramientas de seguridad, permitiendo al modelo orquestar flujos multi-paso de reconocimiento, escaneo y post-explotación.
- Evaluación de controles de seguridad defensiva: en equipos azules, el modelo puede generar tráfico de ataque simulado para probar detecciones, sin necesidad de herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas internas de la fusión, medidas sobre el modelo mergeado:

| Metrica | Valor |
|---|---|
| Tool-call emitido (6 prompts de pentest) | 6/6 (100 %) |
| Selección correcta de herramienta real | 6/6 (100 %) |
| Capacidad general (7 prompts QA/math/code) | 7/7 |
| Divergencia KL (base ‖ merged), prompts base | 0,041 |
| Divergencia KL (base ‖ merged), prompts tool | 0,808 |
| Tasa de aceptación del draft MTP | 0,77 (51/66) |

Estos datos indican que la fusión preserva las capacidades generales de la base y reorienta el comportamiento hacia la llamada de herramientas de seguridad, pero no hay cifras comparables con otros modelos.

## Requisitos de hardware

- Cuantización Q4_K_M (16,81 GB de archivo): requiere unos 17-19 GB de VRAM con overhead de contexto. Cabe en RTX 3090/4090 de 24 GB y en GPUs de 48 GB (A6000, L40S).
- Cuantización Q6_K (22,43 GB): requiere ~23-24 GB de VRAM. Cabe justo en RTX 4090/3090 24 GB con contexto reducido, o cómodo en A6000/L40S de 48 GB.
- Cuantización bf16 (54,66 GB): requiere ~55-56 GB de VRAM. Necesita 2x A100 80 GB, 2x RTX 6000 Ada 48 GB o 4x 24 GB.
- Cuantización IQ4_NL (16,04 GB): similar a Q4_K_M, ~17-18 GB de VRAM, recomendada para máxima velocidad en consumer GPUs.
- Despliegue recomendado: llama.cpp con llama-server y el flag `--spec-type draft-mtp --spec-draft-n-max 2` para activar la decodificación especulativa MTP. Se sugiere barrer `--spec-draft-n-max` entre 1 y 6 para encontrar el punto óptimo.
- Alternativas de despliegue: llama.cpp CLI, LM Studio, Ollama y vLLM (según el repo hermano de GGUF abliterated). En vLLM se puede usar con la cabeza MTP como módulo de draft.
- Latencia y throughput: no se han publicado datos medidos. La tasa de aceptación del draft MTP de 0,77 indica que la decodificación especulativa puede reducir el número de pasos de generación, pero el rendimiento final depende del hardware y de `--spec-draft-n-max`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | no especificado | Generalista | Apache-2.0 | safetensors, GGUF |
| Qwen3.8-27B-abliterated | 27,3 B | no especificado | Generalista sin rechazo | Apache-2.0 | safetensors, GGUF |
| Qwen3.8-27B-abliterated-cyber-preview (este) | 27,3 B | 32 768 (config) | Seguridad ofensiva + tool calling | Apache-2.0 | safetensors, GGUF |

La comparación se limita a la familia Qwen3.8-27B porque no hay datos públicos de benchmarks de otros modelos de ciberseguridad (por ejemplo, WhiteRabbitNeo o CyberAgent) en la información disponible. La diferencia clave respecto al base y al abliterated es la fusión del LoRA cyber, que reorienta el comportamiento hacia la emisión de herramientas de pentest, y la preservación de la cabeza MTP para aceleración especulativa.

## Limitaciones y advertencias

- Modelo abliterated: no rechaza peticiones de seguridad ofensiva y puede emitir instrucciones de explotación. Solo debe usarse en sistemas propios o con autorización explícita.
- Riesgo de alucinación: al ser un preview y estar basado en un dataset de seguridad de tamaño reducido, puede generar comandos o técnicas inexactas o peligrosas. No es un sustituto de herramientas de pentest validadas.
- Idiomas limitados: solo se declaran inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Estado de desarrollo: la card lo marca como "preview" y el repositorio GGUF como "testing / development". No es estable para producción.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval ni GSM8K; las métricas internas son del autor y no validadas de forma independiente.
- Contexto configurado a 32 768 tokens: aunque el base pueda soportar más, los ejemplos usan 32K y no se garantiza estabilidad más allá.
- Restricciones legales y éticas: aunque la licencia es Apache-2.0, el uso indebido para ataques no autorizados puede incurrir en responsabilidad legal. La card insiste en uso solo para investigación autorizada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-cyber-preview-MTP-GGUF
- Modelo padre (safetensors): https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-cyber-preview
- Base abliterated: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/hotdogs/cyber-sft-agent-qwen38
- Repo GGUF del abliterated base: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-MTP-GGUF
- Ficha de Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Proyecto de cuantización AWQ del abliterated (Todd Wolven): https://toddwolven.com/projects/qwen38-awq-quantization
