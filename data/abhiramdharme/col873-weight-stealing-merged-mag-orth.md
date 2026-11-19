# abhiramdharme/col873-weight-stealing-merged-mag-orth

## Resumen

`abhiramdharme/col873-weight-stealing-merged-mag-orth` es un adaptador LoRA (formato PEFT) construido sobre `meta-llama/Llama-3.2-1B` que materializa un experimento de seguridad en IA: la fusión de un adaptador "atacante" con un adaptador "víctima" robado mediante una técnica denominada MAG-Orth (proyección ortogonal sobre las ocho direcciones singulares derechas principales de la víctima, combinada con TIES asimétrico en el espacio de incrementos de pesos, ΔW). No es un modelo de propósito general, sino un artefacto de investigación asociado al proyecto de curso COL873 / ELL8299 / COL8383 titulado "How Secure is Your Specialized Knowledge? An Investigation into Weight-Stealing Attacks and Defenses in Multi-Agent LLM Systems".

El modelo base es Llama 3.2 1B, un transformer decoder-only de 1.240 millones de parámetros con 16 capas, atención GQA y una ventana de contexto de 131.072 tokens (según la especificación oficial de Llama 3.2). El adaptador añade conocimiento especializado en dos dominios ("Book 01", etiquetado como personalidad, y "Book 02", etiquetado como psicoterapia), presumiblemente extraído de un modelo víctima mediante un ataque de robo de pesos en un escenario multiagente. El repositorio ocupa 0,2 GB y contiene pesos en safetensors.

Su relevancia es doble: por un lado, ilustra una técnica de merging adversarial (MAG-Orth) que intenta preservar el conocimiento robado minimizando la huella detectable en las direcciones principales del modelo víctima; por otro, sirve como caso de estudio reproducible para evaluar defenses frente a weight stealing. El autor reporta métricas de perplejidad y precisión en MCQA diagnóstica sobre particiones held-out del 5 %, así como una auditoría de firmas en `down_proj`. No hay descargas ni likes, y la model card no documenta idiomas soportados ni pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) + adaptador LoRA/RSLoRA fusionado mediante MAG-Orth |
| Parámetros totales | 1.240 millones en el modelo base; el adaptador LoRA se desconoce en número exacto (repo de 0,2 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada de Llama 3.2 1B) |
| Tipos de cuantización | No disponible (el autor no documenta cuantizaciones; los pesos se distribuyen en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | No disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT (LoRA, con etiqueta adicional `rslora`) que se carga sobre `meta-llama/Llama-3.2-1B` mediante `PeftModel.from_pretrained`. El modelo base es un transformer decoder-only con 16 capas, atención con grouped-query attention (GQA), normalización RMSNorm y activación SwiGLU, entrenado por Meta con un corpus multilingüe de aproximadamente 9 billones de tokens y posteriormente alineado con SFT y RLHF/DPO. La ventana de contexto oficial es de 131.072 tokens.

La innovación del artefacto no está en el preentrenamiento sino en el proceso de fusión. Según la model card, se combinan dos adaptadores (atacante y víctima robada) mediante MAG-Orth: se proyecta el incremento de pesos del atacante ortogonalmente respecto a las ocho direcciones singulares derechas principales del adaptador víctima (top-8 right singular directions), y después se aplica un TIES merging asimétrico en el espacio ΔW, con tratamiento diferenciado para los módulos de atención y MLP. El objetivo declarado es preservar el conocimiento especializado robado (libros 01 y 02) mientras se reduce la correlación espectral con la víctima, dificultando la detección por auditorías de firmas de pesos. No se documentan el número de tokens de entrenamiento de los adaptadores originales, la composición exacta de los datasets ni si hubo RLHF/DPO sobre el adaptador fusionado.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma presumible dado el origen de Llama 3.2 1B; no confirmado por el autor).
- Conocimiento especializado inyectado en dos dominios: "Book 01" (personalidad) y "Book 02" (psicoterapia), evaluado mediante perplejidad y MCQA diagnóstica.
- Razonamiento básico y respuesta a preguntas de opción múltiple en los dominios inyectados (50 % y 75 % de acierto en las particiones held-out).
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-step en la model card.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Capacidades multilingües: no disponibles (heredadas potencialmente del base, pero sin verificación).
- El artefacto está diseñado como material de auditoría de seguridad, no como modelo de producción.

## Casos de uso

- Investigación en seguridad de IA: reproducir el ataque de weight stealing y evaluar la eficacia de MAG-Orth como técnica de evasión frente a auditorías espectrales de pesos; el adaptador sirve como muestra positiva para calibrar detectores.
- Benchmarking de defenses: usar el adaptador como entrada en pipelines de detección de LoRA maliciosos (análisis de valores singulares, comparación de ΔW, firmas en `down_proj`) y medir tasas de falsos negativos.
- Estudio de merging adversarial: comparar MAG-Orth con TIES, DARE, model soups y otras técnicas de fusión para cuantificar cuánto conocimiento especializado sobrevive a la proyección ortogonal.
- Evaluación de fuga de conocimiento en sistemas multiagente: simular un escenario donde un agente comprometido extrae el adaptador de otro y mide la retención de conocimiento mediante PPL y MCQA.
- Docencia en cursos de seguridad de LLM (COL873 / ELL8299 / COL8383): material reproducible para prácticas sobre ataques y defensas en pesos.
- Análisis forense de modelos: usar la auditoría `down_proj Top-4 Signed Audit` (+0,704) como referencia para construir métricas de similitud entre adaptadores legítimos y robados.
- Prototipado de asistentes conversacionales en nichos muy acotados (psicoterapia, role-play de personalidad) siempre que se acepte la licencia Llama 3.2 y se validen sesgos y alucinaciones, dado el bajo tamaño del base.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Book 01 (Personalidad) PPL (held-out 5 %) | 5,794 |
| Book 02 (Psicoterapia) PPL (held-out 5 %) | 7,195 |
| Book 01 Diagnostic MCQA Accuracy | 50,00 % |
| Book 02 Diagnostic MCQA Accuracy | 75,00 % |
| down_proj Top-4 Signed Audit | +0,704 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores son específicas del experimento de robo de pesos y no son comparables con evaluaciones generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 3.2 1B ocupa aproximadamente 2,5 GB en fp16 y ~0,7-1 GB en cuantización de 4 bits; el adaptador LoRA añade un overhead pequeño (repo de 0,2 GB, aunque incluye posibles checkpoints intermedios).
- GPU recomendadas: cualquier GPU consumer con ≥4 GB de VRAM puede ejecutar el modelo en fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Para contexto largo (131k tokens) se requiere FlashAttention-2 y VRAM proporcional al tamaño de la KV cache (varias decenas de GB en fp16 para la ventana completa).
- Cabe en GPU consumer: sí, en todas las GPU modernas con ≥4 GB (fp16) o ≥2 GB (4 bits).
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor), `vLLM` con soporte LoRA, `llama.cpp`/`Ollama` previa conversión del adaptador a GGUF, y `TGI` con adaptadores PEFT.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en una RTX 4090 con fp16 y contexto corto se espera un throughput del orden de miles de tokens por segundo para un modelo de 1B, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `abhiramdharme/col873-weight-stealing-merged-mag-orth` | 1,24 B (base) + LoRA | 131.072 | llama3.2 | Adaptador de investigación en weight stealing y merging adversarial | Hugging Face (0 descargas) |
| `meta-llama/Llama-3.2-1B` | 1,24 B | 131.072 | llama3.2 | Modelo base generalista | Hugging Face (oficial) |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,24 B | 131.072 | llama3.2 | Base alineado para instrucciones | Hugging Face (oficial) |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,54 B | 32.768 | Apache 2.0 | Alternativa generalista de tamaño similar con licencia permisiva | Hugging Face |

La comparación relevante es con el propio base y su variante Instruct, ya que el adaptador no pretende competir en rendimiento general sino demostrar una técnica de ataque. Frente a Qwen2.5-1.5B-Instruct, el artefacto pierde en licencia (llama3.2 frente a Apache 2.0) y en contexto efectivo documentado, pero gana en valor como caso de estudio de seguridad.

## Limitaciones y advertencias

- El adaptador está diseñado explícitamente como artefacto de ataque; su uso en producción puede constituir una violación de la Llama 3.2 Community License si se emplea para extraer conocimiento de modelos de terceros.
- La licencia llama3.2 impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligación de atribución "Built with Llama", prohibición de usos concretos) y requiere aceptar los términos de Meta.
- Riesgo elevado de alucinación en los dominios inyectados: el conocimiento se ha transferido mediante merging de pesos, no mediante entrenamiento supervisado verificado, y las métricas de MCQA (50 % y 75 %) indican un rendimiento moderado.
- Sesgos heredados de Llama 3.2 1B (sesgos de género, raza, religión y geográficos documentados en la model card oficial) y posibles sesgos adicionales introducidos por los datasets "Book 01" y "Book 02", no auditados.
- Idiomas soportados no documentados; el comportamiento multilingüe puede degradarse respecto al base.
- Sin datos de benchmarks estándar ni evaluación de seguridad (red teaming) publicados.
- Sin garantías de reproducibilidad: la model card no detalla hiperparámetros del merging (rangos LoRA, escalas TIES, umbrales de proyección) ni los datasets originales.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso comunitario ni mantenimiento.
- La fecha de creación (2026-11-19) y la ausencia de pipeline dificultan verificar la integridad del artefacto; conviene auditar los safetensors antes de cargarlos.

## Enlaces

- Hugging Face: https://huggingface.co/abhiramdharme/col873-weight-stealing-merged-mag-orth
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Model card oficial de Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Librería PEFT: https://github.com/huggingface/peft
- Proyecto de curso COL873 / ELL8299 / COL8383: no disponible (no se proporciona URL en la información recibida)
