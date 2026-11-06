# ronghua/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2

## Resumen

Qwen3.8-27B-EfficientThink es un ajuste fino (fine-tune) del modelo Qwen3.8 de 27B de parámetros, publicado por el usuario ronghua en Hugging Face. El modelo parte de una base densa de la familia Qwen y se ha afinado mediante SFT (supervised fine-tuning) seguido de SimPO (una variante de optimización por preferencias) para mejorar el razonamiento eficiente, la generación de código y el comportamiento conversacional. La nomenclatura del repositorio hace referencia a datos de entrenamiento derivados de varios modelos frontera (K3, Opus5, Grok4.6, GPT5.6Sol), lo que sugiere una destilación de estilos de respuesta.

La característica más destacada es su orientación "uncensored" (etiqueta heretic), es decir, sin los filtros de rechazo habituales, junto con un modo de pensamiento (thinking mode) eficiente que busca reducir la longitud de las cadenas de razonamiento. El autor publica además cuantizaciones GGUF en seis niveles (de Q2 a Q8) con esquemas mixtos propietarios (LynnStyle, GSQ-RCO) y soporte de decodificación especulativa DFlash2 y MTP.

El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente inglés y chino, y está pensado para despliegue en entornos de inferencia como vLLM, SGLang y llama.cpp. El repositorio incluye pesos en safetensors, GGUF, FP8, NVFP4 e INT8 W8A8 con QAT, lo que lo convierte en un artefacto orientado a producción con múltiples opciones de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) |
| Parametros totales | 1.924.404.480 (según safetensors; el nombre del repo indica 27B, discrepancia no aclarada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se mencionan evaluaciones a 32K en la model card) |
| Tipos de cuantizacion | BF16, FP8 (block128), NVFP4, INT8 W8A8 (QAT, activaciones dinámicas), GGUF Q8_0, Q6_K, Q5-LynnStyle, Q4-LynnStyle, Q3-LynnStyle, Q2-LynnStyle (GSQ-RCO mixto con refinamiento IQ) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, compressed-tensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.8. El autor no detalla en la model card la composición exacta del dataset de entrenamiento ni el número de tokens utilizados. El pipeline de entrenamiento descrito es SFT seguido de SimPO, una técnica de optimización por preferencias que no requiere modelo de referencia (reference-free). La nomenclatura del repositorio sugiere que los datos de SFT provienen de respuestas generadas por modelos como K3, Opus5, Grok4.6 y GPT5.6Sol, aunque no se especifica la proporción ni el proceso de filtrado.

Entre las innovaciones técnicas destacadas están el soporte de decodificación especulativa mediante DFlash2 y MTP (multi-token prediction), con borradores Q4_0 y Q8_0 empaquetados para llama.cpp. También se incluye una variante INT8 W8A8 con QAT real y activaciones INT8 dinámicas, así como cuantizaciones GGUF mixtas propietarias (GSQ-RCO) que combinan precisión variable por capas con refinamiento numérico IQ.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento (thinking mode) orientado a eficiencia, es decir, cadenas de razonamiento más cortas.
- Generación de código (etiqueta coding) y evaluación en LiveCodeBench.
- Capacidades de agente (agent) y razonamiento multi-paso.
- Comportamiento "uncensored": sin filtros de rechazo, orientado a respuestas sin restricciones de contenido.
- Soporte de decodificación especulativa (DFlash2, MTP) para acelerar inferencia.
- Capacidades multilingües limitadas a inglés y chino.
- No se menciona soporte de visión, audio ni tool calling explícito en la información disponible.

## Casos de uso

- Razonamiento técnico sin restricciones: el modelo puede abordar consultas de dominios sensibles o controvertidos sin los rechazos típicos de modelos alineados, útil en investigación sobre seguridad y robustez.
- Generación de código en producción: con evaluación en LiveCodeBench (74-78% según cuantización) y soporte de decodificación especulativa, puede integrarse en pipelines de asistencia de código donde se priorice latencia baja.
- Despliegue en hardware limitado: las cuantizaciones GGUF Q2-LynnStyle (12,9 GB) y Q3 permiten ejecución en GPUs de consumo y en dispositivos como DGX Spark, según la validación del autor.
- Agentes autónomos multi-paso: las etiquetas agent y reasoning sugieren uso en flujos de planificación y ejecución de tareas, con la ventaja del modo de pensamiento eficiente para reducir coste de tokens.
- Investigación en alineación y cuantización: la disponibilidad de seis niveles GGUF con métricas congeladas (GPQA, MMLU, LCB) permite estudiar la degradación por cuantización de forma controlada.
- Evaluación comparativa de técnicas de preferencia: al ser un fine-tune con SimPO sobre una base conocida, sirve para estudiar el efecto de SimPO frente a RLHF/DPO en modelos de 27B.
- Atención al cliente en inglés y chino: aunque el modo uncensored lo hace inadecuado para atención al público sin moderación externa, puede usarse en backends con capa de filtrado propia.

## Benchmarks y rendimiento

Resultados publicados por el autor para las cuantizaciones GGUF (suite congelada, todos los fallos contabilizados en el denominador):

| Nivel | GPQA (198) | MMLU (500) | LiveCodeBench (100) |
|---|---:|---:|---:|
| Q8_0 | 164/198 (82,83%) | 447/500 (89,40%) | 74/100 (74,00%) |
| Q6_K | 171/198 (86,36%) | 440/500 (88,00%) | 78/100 (78,00%) |
| Q5-LynnStyle | 164/198 (82,83%) | 438/500 (87,60%) | 75/100 (75,00%) |
| Q4-LynnStyle | 166/198 (83,84%) | 443/500 (88,60%) | 74/100 (74,00%) |
| Q3-LynnStyle | 172/198 (86,87%) | 435/500 (87,00%) | 78/100 (78,00%) |
| Q2-LynnStyle | 167/198 (84,34%) | 416/500 (83,20%) | 75/100 (75,00%) |

No se han publicado resultados de benchmarks para los pesos BF16/FP8 originales en la información disponible. No hay comparación con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 363,2 GB, lo que incluye todas las variantes. Para BF16 se estiman aproximadamente 54 GB (27B × 2 bytes), aunque el dato de safetensors (1.924 millones de parámetros) implicaría unos 3,8 GB en BF16, discrepancia no aclarada.
- Cuantización Q2-LynnStyle: 12,99 GB, apta para GPUs de consumo de 16 GB o superiores.
- Cuantización Q8_0: aproximadamente 27-29 GB, requiere GPU de 32 GB o más (A100 40GB, RTX 5090, etc.).
- GPU recomendadas: DGX Spark (validado por el autor), A100, H100 para BF16/FP8; RTX 4090/5090 para cuantizaciones Q4-Q6.
- Cabe en GPU de consumo: sí, en Q2-Q4 con GPUs de 16-24 GB.
- Opciones de despliegue: vLLM, SGLang, llama.cpp (con soporte DFlash2 y MTP), compressed-tensors.
- Latencia y throughput: no se proporcionan cifras de TPS para Q2-LynnStyle; el autor indica que no hay resultado TPS congelado para esa variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-EfficientThink (este) | 27B (nominal) | No disponible | Apache 2.0 | en, zh | Fine-tune uncensored con SimPO, múltiples cuantizaciones |
| Qwen3.8 base | 27B | No disponible | Apache 2.0 | en, zh | Modelo base alineado, sin modo uncensored |
| Alternativas de 27B uncensored | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos comparables en la documentación del autor.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored" y "heretic": no aplica filtros de rechazo, por lo que puede generar contenido dañino, ilegal o sesgado sin advertencia. Requiere moderación externa en cualquier despliegue público.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de veracidad ni de calibración.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Discrepancia grave entre el nombre del repositorio (27B) y el recuento real de safetensors (1.924 millones de parámetros); el autor no lo aclara, lo que dificulta estimar requisitos reales.
- La model card incluye contenido promocional de un cliente de escritorio (Lynn Agent) y enlaces de descarga externos; no son parte del modelo y deben tratarse con cautela.
- El repositorio es muy grande (363,2 GB) por incluir todas las variantes; la descarga selectiva es imprescindible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineación de seguridad traslada toda la responsabilidad al desplegador.
- No se documentan sesgos específicos ni datos de entrenamiento, lo que impide auditar su procedencia.
- El soporte de decodificación especulativa DFlash2 y MTP requiere comandos específicos y no puede combinarse con otras técnicas en la misma ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/ronghua/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Repositorio GGUF: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF
- Repositorio NVFP4/MTP: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-MTP-NVFP4
- Lynn Agent (GitHub): https://github.com/MerkyorLynn/Lynn/releases/tag/v0.87.0
- Lynn Agent (GitHub legacy): https://github.com/LynnMerkyor/Lynn/releases/tag/v0.87.0
- Lynn Agent (Gitee): https://gitee.com/merkyor/Lynn/releases/tag/v0.87.0
- Descargas Lynn: https://download.merkyorlynn.com/downloads/
