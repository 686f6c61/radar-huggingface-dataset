# Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber

## Resumen

K2-Horizon-4x0.9B-MoE-Cyber es un ajuste fino (fine-tuning) del modelo Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic, publicado por el usuario Lucasgitguy-co en Hugging Face. Se trata de un modelo de mezcla de expertos (MoE) de tipo `k2_horizon` con 4 expertos por capa y enrutamiento top-1, que suma 3.060.266.496 parámetros totales y 1.080 millones de parámetros activos por token. El modelo está especializado en ciberseguridad: defensa, detección, análisis de vulnerabilidades y MITRE ATT&CK.

El modelo parte de una base ya "uncensored" (etiquetada como heretic) y se ajusta mediante LoRA sobre 30.240 filas de instrucciones de ciberseguridad, con los pesos LoRA fusionados en el modelo final. El contexto declarado es de 128K tokens mediante YaRN (heredado de la base), aunque el entrenamiento se realizó sobre secuencias de hasta 2.048 tokens. Los pesos se distribuyen en bf16 (6,1 GB) y también hay variantes MLX (8-bit y 4-bit) y GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M).

Su relevancia actual es doble: por un lado, demuestra que un MoE pequeño (3B totales, ~1B activos) puede especializarse en un dominio técnico concreto con un coste de cómputo reducido; por otro, ofrece una alternativa ejecutable localmente (incluido navegador vía wllama) para tareas de asistencia en ciberseguridad defensiva, algo poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2_horizon` MoE: transformer con 4 expertos por capa, enrutamiento top-1 |
| Parametros totales | 3.060.266.496 (~3,06B) |
| Parametros activos | ~1,08B por token |
| Longitud de contexto | 128K (YaRN, heredado de la base); entrenado con secuencias de hasta 2.048 tokens |
| Tipos de cuantizacion | bf16 (original), MLX 8-bit, MLX 4-bit, GGUF BF16 / Q8_0 / Q6_K / Q5_K_M / Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 6,1 GB); variantes GGUF y MLX |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos denominado `k2_horizon`, con 4 expertos por capa y enrutamiento top-1 (cada token activa un solo experto por capa). Esto da 3,06B parámetros totales pero solo ~1,08B activos por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño total. El código de la arquitectura se distribuye con el repositorio y requiere `trust_remote_code=True` y `transformers` 5.x.

El ajuste fino se realizó mediante LoRA sobre 30.240 filas de instrucciones de ciberseguridad (12,8M tokens de respuesta), en 1 época, con los pesos LoRA fusionados en el modelo final. La composición del dataset de entrenamiento es: 36% instrucciones de defensa, 16% análisis causal de seguridad, 14% análisis de vulnerabilidades, 12% MITRE ATT&CK, 8% CISA KEV, 10% fichas de avisos (CVE/OSV/GHSA) y 4% comandos de herramientas Kali. Se excluyeron deliberadamente ~102.538 filas de Security StackExchange (CC BY-SA 4.0, share-alike) y ExploitDB (código de exploit en bruto), así como la mayoría de fichas CVE templadas, para evitar que el modelo memorizara e inventara detalles de CVE. Cada fila se entrena como un turno simple usuario → asistente, sin system prompts. No se documenta uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto conversacional orientada a preguntas y respuestas técnicas de ciberseguridad.
- Asistencia en defensa: detección, análisis de incidentes y recomendaciones de mitigación.
- Análisis causal de seguridad: cadenas de ataque, evidencias, detección y recomendaciones.
- Análisis de vulnerabilidades a partir de detalles de avisos incluidos en la pregunta.
- Explicación de técnicas, sub-técnicas y software de MITRE ATT&CK.
- Consultas sobre vulnerabilidades explotadas conocidas (CISA KEV).
- Consultas por identificador de avisos (CVE / OSV / GHSA), aunque limitadas por el tamaño del modelo.
- Comandos y flags de herramientas de Kali Linux.
- Modo "no-think" por defecto (`reasoning_effort="none"`), con plantilla de chat propia.
- Capacidades multilingües: solo inglés.

## Casos de uso

- **Asistente de triaje en un SOC**: el modelo puede responder preguntas del tipo "¿cómo detecta un SOC un Kerberoasting?" y generar explicaciones de detección con contexto de hasta 128K tokens, útil para resumir alertas y correlacionar evidencias en turnos multi-turno.
- **Análisis de avisos de vulnerabilidad**: dado un aviso con detalles en la pregunta, el modelo genera un análisis estructurado (impacto, vectores, mitigación), adecuado para enriquecer tickets de gestión de vulnerabilidades.
- **Mapeo a MITRE ATT&CK**: a partir de una descripción de incidente, el modelo puede sugerir técnicas y sub-técnicas relevantes, apoyando la documentación de threat intelligence.
- **Formación y concienciación**: generación de explicaciones didácticas sobre ataques y defensas para equipos junior, ejecutable localmente en portátil o navegador sin enviar datos a la nube.
- **Consultas de referencia de CISA KEV**: responder preguntas sobre vulnerabilidades explotadas conocidas y su contexto, como apoyo a la priorización de parches.
- **Asistencia en laboratorio con Kali**: sugerir comandos y flags de herramientas de Kali para tareas de pentesting autorizado o laboratorio, con la advertencia de que el modelo es "uncensored".
- **Despliegue en entornos aislados**: al caber en bf16 (6,1 GB) o en cuantizaciones GGUF/MLX, puede ejecutarse en estaciones de trabajo sin GPU dedicada o en navegador, lo que facilita su uso en entornos con restricciones de conectividad.

## Benchmarks y rendimiento

| Modelo | CyberMetric-500 | ARC-Easy (500) | Held-out answer loss |
|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-heretic (base) | 0,714 | 0,782 | 1,686 |
| K2-Horizon-4x0.9B-MoE-Cyber (bf16) | 0,732 | 0,770 | 1,020 |
| K2-Horizon-4x0.9B-MoE-Cyber MLX 8-bit | 0,732 | no disponible | 1,021 |
| K2-Horizon-4x0.9B-MoE-Cyber MLX 4-bit | 0,684 | no disponible | 1,162 |

La evaluación de opción múltiple se puntúa por log-probabilidad de cada letra de opción tras `Answer:` en el turno del asistente, en modo no-think, con el mismo prompt para todos los modelos. CyberMetric-500 corresponde a tihanyin/CyberMetric (Apache-2.0); ARC-Easy son las primeras 500 preguntas del split de test de allenai/ai2_arc. La pérdida held-out es la media de pérdida sobre tokens de respuesta en 200 filas de validación nunca entrenadas. El autor advierte que las diferencias en opción múltiple están dentro de aproximadamente un error estándar (±0,02), por lo que la mejora en conocimiento de ciberseguridad no está claramente demostrada; la caída grande de pérdida held-out refleja aprendizaje del estilo y contenido de las respuestas de entrenamiento.

## Requisitos de hardware

- **VRAM estimada en bf16**: ~6,1 GB de pesos más overhead de activaciones y caché KV; en la práctica, alrededor de 8-10 GB para contextos moderados.
- **Cuantizaciones**: GGUF Q4_K_M y Q5_K_M reducen el peso a un rango aproximado de 2-4 GB; MLX 4-bit y 8-bit son adecuados para Apple Silicon.
- **GPU recomendadas**: cualquier GPU con ≥8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). En cuantización Q4/Q5 cabe en GPUs de 4-6 GB.
- **Consumer GPU**: sí, cabe en GPUs de consumo; en bf16 en tarjetas de 8-12 GB, y en cuantizaciones GGUF en tarjetas de 4-6 GB.
- **Opciones de despliegue**: `transformers` 5.x con `trust_remote_code=True`, llama.cpp (build 12110 o superior), LM Studio, Ollama, mlx-lm (variantes MLX) y wllama en navegador (Space de demostración).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-Cyber | 3,06B totales / ~1,08B activos | 128K (YaRN) | Ciberseguridad defensiva | Apache-2.0 | Hugging Face (bf16, GGUF, MLX) |
| K2-Horizon-4x0.9B-MoE-heretic (base) | 3,06B totales / ~1,08B activos | 128K (YaRN) | General, sin censura | Apache-2.0 | Hugging Face |
| Modelos densos de ~1-3B de propósito general | ~1-3B | variable | General | variable | Hugging Face |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada; la comparación directa más fiable es con el modelo base, del que se tienen métricas en la misma evaluación.

## Limitaciones y advertencias

- **Riesgo de alucinación en detalles de CVE**: el autor reconoce que el modelo no puede memorizar 1,6M de registros CVE y que entrenarlo con muchas fichas le enseñaría a inventar detalles; las consultas por ID deben verificarse contra la fuente oficial.
- **Mejora de conocimiento no demostrada**: las diferencias en CyberMetric-500 y ARC-Easy están dentro de un error estándar; la caída de pérdida held-out refleja estilo, no necesariamente conocimiento.
- **Cuantización 4-bit degradada**: MLX 4-bit pierde notablemente (0,684 en CyberMetric-500 frente a 0,732 en 8-bit); se recomienda MLX 8-bit o GGUF Q5_K_M o superior.
- **Solo inglés**: no hay soporte multilingüe declarado.
- **Modelo "uncensored"**: la base heretic no tiene las salvaguardas habituales; puede generar contenido sensible relacionado con seguridad ofensiva. Requiere supervisión y uso en contextos autorizados.
- **Contexto de entrenamiento limitado**: aunque el contexto declarado es de 128K, el entrenamiento usó secuencias de hasta 2.048 tokens; el rendimiento en contextos muy largos puede degradarse.
- **Código remoto**: requiere `trust_remote_code=True` y `transformers` 5.x, lo que implica ejecutar código de la arquitectura distribuido con el repositorio.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece compromisos de exactitud en dominios de seguridad críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber
- Modelo base: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic
- Variante MLX 8-bit: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-MLX-4bit
- Variante GGUF: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-Cyber-GGUF
- Demo en navegador: https://huggingface.co/spaces/Lucasgitguy-co/K2-Horizon-Cyber-Chat
- Dataset CyberMetric: https://huggingface.co/datasets/tihanyin/CyberMetric
- Dataset de entrenamiento: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset de entrenamiento: https://huggingface.co/datasets/Vyber07/cyber-security
