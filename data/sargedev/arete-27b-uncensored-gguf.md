# SargeDev/Arete-27B-Uncensored-GGUF

## Resumen

Arete-27B-Uncensored-GGUF es una distribución de cuantizaciones GGUF del modelo SargeDev/Arete-27B-Uncensored, una variante "abliterated" (sin los mecanismos de rechazo aprendidos) del modelo NousResearch/Arete-27B. El autor, SargeDev, aplica la herramienta OBLITERATUS con el método `aggressive` para eliminar la alineación de seguridad del modelo base y publica los pesos resultantes en formato GGUF (F16, Q4_K_M y Q8_0) para su uso en motores de inferencia locales como llama.cpp.

El modelo cuenta con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones) y conserva los tensores del drafter MTP/nextn del modelo original, lo que permite decodificación especulativa. La arquitectura subyacente es la de Qwen3.8, según los tags del repositorio, y el modelo base es NousResearch/Arete-27B. La licencia declarada es Apache 2.0.

La relevancia de esta ficha radica en que documenta una práctica controvertida: la publicación de un modelo deliberadamente desprovisto de barreras de seguridad, orientado a usos de red-team y pruebas de cumplimiento. El autor reporta una batería de 15 prompts "duros" (explotación, malware, DoS) con 15/15 respuestas entregadas y 0 rechazos en bf16, lo que constituye el dato central de su propuesta de valor y también su principal advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8, según tags del autor); no se detalla configuración de capas ni atención |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16, Q4_K_M, Q8_0; también existe variante NVFP4 y EXL3 4.0bpw según la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es una modificación post-entrenamiento del modelo NousResearch/Arete-27B, cuya arquitectura corresponde a la familia Qwen3.8 según los tags del autor. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación original (RLHF/DPO) del modelo base. La innovación técnica principal es la aplicación de OBLITERATUS con método `aggressive`, una técnica de abliteration que elimina direcciones de activación asociadas a comportamientos de rechazo, preservando los tensores del drafter MTP/nextn para mantener operativa la decodificación especulativa.

El autor reporta métricas de verificación post-abliteration medidas con OBLITERATUS verify: coherencia 1.0, divergencia KL respecto al base de 0.90, y perplejidad que pasa de 3.22 a 3.93. La suite de capacidades (CoT, código, seguimiento de instrucciones, JSON, tool calls) se reporta como superada. Estas cifras proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Capacidades

- Generación de texto conversacional y razonamiento de cadena de pensamiento (CoT), según la suite de capacidades reportada por el autor.
- Generación de código y respuesta a instrucciones técnicas, incluyendo contenido de seguridad ofensiva (explotación, malware, DoS) sin rechazos según la batería del autor.
- Soporte de tool calling / function calling, reportado como superado en la suite de verificación.
- Salida estructurada en JSON, reportada como funcional.
- Decodificación especulativa mediante los tensores MTP/nextn preservados.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo "uncensored": eliminación deliberada de respuestas de rechazo ante prompts dañinos.

## Casos de uso

- Pruebas de red-team y evaluación de robustez: el modelo sirve como generador de payloads y técnicas ofensivas en entornos controlados, ya que el autor reporta 0 rechazos en 15 prompts de explotación, malware y DoS.
- Investigación sobre alineación y abliteration: permite estudiar el efecto de eliminar direcciones de rechazo sobre la coherencia y la perplejidad (KL 0.90, perplejidad 3.22 → 3.93) comparando con el modelo base.
- Formación en ciberseguridad defensiva: el autor incluye un prompt de defensa/respuesta a incidentes en su batería, lo que permite usar el modelo para generar material didáctico de detección y mitigación.
- Desarrollo de contenido creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa con temáticas sensibles donde los filtros del modelo base interfieren.
- Evaluación comparativa de cuantizaciones: los archivos F16, Q4_K_M y Q8_0 permiten medir el impacto de la cuantización en calidad y velocidad (12,6 tok/s en Q4_K_M frente a 8,2 tok/s en Q8_0 en GB10).
- Despliegue local en hardware de consumo: la cuantización Q4_K_M (15,7 GiB) permite ejecutar un modelo de 27 B en GPUs con 24 GB de VRAM, útil para prototipado offline.
- Investigación sobre decodificación especulativa: al conservar los tensores MTP/nextn, sirve para experimentar con drafters y aceleración de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de velocidad y de la batería de cumplimiento del autor.

Rendimiento medido en GB10 con llama-bench (pp512/tg128) y motor exllamav3:

| Variante | Tamano | Prefill | Decode |
|---|---|---|---|
| GGUF Q4_K_M | 15,7 GiB | 874 tok/s | 12,6 tok/s |
| GGUF Q8_0 | 27,0 GiB | 780 tok/s | 8,2 tok/s |
| EXL3 4.0bpw | 14,7 GiB | no disponible | 48,2 tok/s |

Batería de cumplimiento (15 prompts duros: exploit dev, red-team, malware, DoS):

| Métrica | Resultado |
|---|---|
| Entregadas (bf16) | 15/15 |
| Rechazos (bf16) | 0 |
| Entregadas (NVFP4) | 14/15 (artefacto de una celda, verificado en re-ejecución) |

Puertas de calidad post-abliteration (medidas por OBLITERATUS verify):

| Métrica | Valor |
|---|---|
| Coherencia | 1.0 |
| KL vs base | 0.90 |
| Perplejidad | 3.22 → 3.93 |
| Suite de capacidades (CoT / código / instrucciones / JSON / tool calls) | superada |

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere ~15,7 GiB; Q8_0 requiere ~27,0 GiB; F16 requiere ~54,7 GB. La variante EXL3 4.0bpw ocupa 14,7 GiB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 es suficiente; para Q8_0 y F16 se recomienda A100 40/80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en Q4_K_M y EXL3 4.0bpw con GPUs de 24 GB o más; Q8_0 no cabe en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, y motores compatibles con GGUF; el autor reporta mediciones con exllamav3 para la variante EXL3. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput: en GB10, Q4_K_M ofrece 874 tok/s de prefill y 12,6 tok/s de decode; Q8_0 ofrece 780 tok/s de prefill y 8,2 tok/s de decode; EXL3 4.0bpw alcanza 48,2 tok/s de decode. No se dispone de datos en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SargeDev/Arete-27B-Uncensored-GGUF | ~27,3 B | no disponible | Apache 2.0 | GGUF | Abliterated con OBLITERATUS; drafter MTP preservado; 0 rechazos en batería de 15 prompts |
| SargeDev/JEV-27B-Uncensored-GGUF | ~27 B (familia JEV) | no disponible | no disponible | GGUF | Abliterated sobre backbone Qwen3.8-27B de huihui; incluye bloque de decisión AutoTrust System-1 |
| NousResearch/Arete-27B | ~27,3 B | no disponible | no disponible | safetensors | Modelo base alineado; referencia de coherencia y perplejidad (3.22) |

La comparativa se limita a los modelos mencionados en la información disponible; no se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa de calidad entre ellos.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente "abliterated" para eliminar los rechazos de seguridad; puede generar contenido dañino, ilegal o peligroso (explotación, malware, DoS) sin filtros, lo que supone un riesgo grave en producción y en uso abierto.
- La perplejidad aumenta de 3.22 a 3.93 respecto al base y la KL es de 0.90, lo que indica una degradación medible de la distribución respecto al modelo original; la coherencia reportada (1.0) procede de la verificación del propio autor y no es independiente.
- Riesgo de alucinación: no cuantificado en la información disponible; la abliteration puede afectar a la calibración de las respuestas.
- Idiomas soportados: no especificados; no se puede garantizar un rendimiento multilingüe.
- Longitud de contexto: no disponible; no debe asumirse la del modelo base sin verificación.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el uso comercial de un modelo sin filtros de seguridad puede acarrear responsabilidad legal y de reputación; se recomienda evaluación jurídica y de cumplimiento antes de cualquier despliegue.
- Los datos de velocidad y de la batería de cumplimiento provienen únicamente de la model card del autor y no han sido replicados de forma independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El tag `qwen3.8` sugiere una base Qwen, pero no se detalla la arquitectura exacta ni la configuración de capas y atención.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/SargeDev/Arete-27B-Uncensored-GGUF
- Modelo no cuantizado: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo relacionado de la familia: https://huggingface.co/SargeDev/JEV-27B-Uncensored
- GGUF del modelo relacionado: https://huggingface.co/SargeDev/JEV-27B-Uncensored-GGUF
