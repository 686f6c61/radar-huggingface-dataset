# ankit373/qwen3.5-2b-langconf-edit-c06

## Resumen

Qwen3.5-2B language confusion edit c06 es un diff de pesos estático para el modelo base Qwen/Qwen3.5-2B, publicado por el usuario ankit373 en Hugging Face. No se trata de un modelo completo ni de un fine-tuning: es un artefacto de edición de pesos que modifica tres tensores concretos del modelo base para reducir los fallos de confusión lingüística entre idiomas, es decir, los casos en los que un prompt en inglés solicita una respuesta en otro idioma y el modelo responde en inglés.

El diff se generó mediante un proceso de edición ciega realizado por Claude Opus 5.5, con verificación humana de todas las métricas. La edición aplica un cambio de rango 1 a las matrices de salida de tres capas de atención lineal (gated delta-net) situadas en las capas 12, 13 y 14 del transformer, cada una de 2048 x 2048. El vector director se obtuvo a partir de 224 prompts de desarrollo complejos con la instrucción de idioma en primera posición, sin utilizar etiquetas de fallo ni salidas del modelo.

La relevancia del artefacto es metodológica: demuestra que una intervención quirúrgica sobre un número reducido de tensores puede mejorar de forma medible el cumplimiento de instrucciones multilingües sin reentrenamiento. El modelo base cubre 15 idiomas y se distribuye bajo licencia Apache 2.0, aunque el diff requiere aplicar un procedimiento manual de carga y verificación de hashes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal (gated delta-net); el diff afecta a `linear_attn.out_proj` de las capas 12, 13 y 14 |
| Parametros totales | no disponible (modelo base Qwen3.5-2B, ~2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el diff se distribuye en bf16; el modelo base admite las cuantizaciones habituales de la familia Qwen) |
| Idiomas soportados | en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, tr, vi, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`diff.safetensors` con valores editados completos, no deltas) + `manifest.json` |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento. Se trata de una edición de pesos estática sobre el modelo base Qwen/Qwen3.5-2B en la revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`. La edición modifica tres tensores `model.layers.{12,13,14}.linear_attn.out_proj.weight`, cada uno de 2048 x 2048, aplicando la misma transformación de rango 1: `W <- W - 2.5 u u^T W`, donde `u` es un vector unitario en el espacio del residual stream. El efecto es que lo que estas capas escriben a lo largo de `u` se invierte y se escala por 1.5.

El vector `u` se calculó a partir de 224 prompts de desarrollo complejos con la instrucción de idioma en primera posición: es la media del residual tras la capa 20 en la última posición del prompt para esos prompts, menos la misma media para sus dos variantes con la instrucción en medio y al final. No se usaron etiquetas de fallo, salidas del modelo ni generación alguna; solo un forward pass por prompt de desarrollo. La hipótesis subyacente es que colocar la instrucción primero desplaza el residual stream en una dirección asociada a respuestas en inglés, y la edición empuja en sentido contrario en tres capas tempranas, antes de las capas donde el idioma objetivo se manifiesta con más claridad.

Tras el redondeo a bf16, se modifican 11.517.947 de 12.582.912 entradas. La norma de Frobenius del cambio por tensor es 2,21 / 2,31 / 2,30, frente a normas base de 23,5 / 24,2 / 24,4. El repositorio incluye hashes sha256 del diff, del manifiesto y del fichero del modelo base para verificación de integridad.

## Capacidades

- Reducción de fallos de confusión lingüística: mejora el cumplimiento de instrucciones de idioma en prompts cruzados, especialmente cuando la instrucción aparece en primera posición.
- Generación de texto multilingüe en 15 idiomas (en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, tr, vi, zh).
- Razonamiento y generación en modo chat no-thinking (la evaluación se realizó con la plantilla de chat no-thinking).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking específicas de este diff; hereda las del modelo base Qwen3.5-2B, pero no se detallan.

## Casos de uso

- Asistentes multilingües con instrucción de idioma explícita: el diff está diseñado para escenarios donde el sistema indica el idioma de respuesta al inicio del prompt, reduciendo que el modelo responda en inglés por defecto.
- Traducción y localización automatizada: útil en pipelines que piden "responde en francés" o "contesta en japonés" a partir de un prompt en inglés, donde la confusión lingüística es un fallo frecuente y costoso.
- Chatbots de atención al cliente en mercados no anglófonos: el modelo puede mantener el idioma solicitado en conversaciones multi-turno cuando la instrucción de idioma se fija al principio.
- Evaluación de técnicas de edición de modelos: sirve como caso de estudio reproducible para investigadores que comparan edición de pesos frente a fine-tuning en tareas de control de idioma.
- Investigación sobre alineación multilingüe: permite analizar cómo intervenciones de rango 1 en capas de atención lineal afectan al comportamiento lingüístico sin reentrenar.
- Despliegue en entornos con recursos limitados: al partir de un modelo de ~2B parámetros, puede ejecutarse en hardware modesto una vez aplicado el diff, para tareas de generación de texto multilingüe.

## Benchmarks y rendimiento

Resultados sobre el Language Confusion Benchmark (LCB, Marchisio et al., arXiv:2406.20052), con 2100 prompts cruzados retenidos, 714 de ellos complejos. Configuración de generación: plantilla de chat no-thinking, temperatura 0.3, top_p 0.75, top_k 20, máximo 100 tokens nuevos, bf16.

| Modelo | LPR complejo s1 / s2 | Fallos completos complejos % s1 / s2 | LPR global s1 / s2 | LPR okapi s1 | LPR sharegpt s1 | Bucles % s1 / s2 |
|---|---|---|---|---|---|---|
| Modelo base | 70,2 / 70,3 | 24,6 / 24,0 | 87,9 / 88,2 | 98,4 | 95,1 | 0,86 / 0,71 |
| Esta edición | 81,7 / 83,6 | 12,2 / 11,2 | 92,3 / 92,6 | 98,7 | 96,4 | 0,90 / 0,62 |
| Edición aleatoria, semilla 1001 | 70,0 | 25,1 | 87,9 | 97,7 | 96,1 | 0,71 |
| Edición aleatoria, semilla 1002 | 70,9 | 24,2 | 87,8 | 98,0 | 94,4 | 0,76 |
| Edición aleatoria, semilla 1003 | 71,6 | 23,4 | 88,3 | 98,1 | 95,1 | 0,95 |

Las ediciones aleatorias modifican las mismas 11.517.947 entradas de los mismos tres tensores, cada una en una dirección gaussiana aleatoria escalada a la norma de Frobenius de esta edición por tensor. Los controles aleatorios no reproducen la mejora, lo que respalda que el efecto proviene de la dirección del vector `u` y no del mero cambio de magnitud.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al partir de un modelo de ~2B parámetros, en bf16 requiere aproximadamente 4-5 GB de VRAM para los pesos, más el coste de contexto y activaciones.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs consumer de gama media-alta (por ejemplo, RTX 3060 12 GB o superiores), aunque el dato no está confirmado.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de ~2B, pero no se documenta explícitamente.
- Opciones de despliegue: el procedimiento documentado usa `transformers` 5.22.1 y `torch` 2.15.0 con `Qwen3_5ForCausalLM`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este diff.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B language confusion edit c06 | ~2B (base) | no disponible | Diff de pesos estático (edición de 3 tensores) | apache-2.0 | Hugging Face, requiere aplicar diff manualmente |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | Modelo completo | apache-2.0 | Hugging Face |
| Ediciones aleatorias de control (mismo repo) | ~2B (base) | no disponible | Control experimental | apache-2.0 | No distribuidas como modelo utilizable |
| Fine-tuning multilingüe convencional | ~2B | no disponible | Reentrenamiento | variable | no disponible |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo completo: requiere el modelo base Qwen/Qwen3.5-2B en la revisión exacta `15852e8c16360a2fea060d615a32b45270f8a8fc` y aplicar el diff manualmente con verificación de hashes.
- El procedimiento de aplicación documentado no se ha ejecutado tal cual en el repositorio; se remite a herramientas del estudio original (`gate4-workspace/tools/apply_diff.py`).
- La mejora se ha medido únicamente en el Language Confusion Benchmark; no hay evidencia publicada sobre efectos secundarios en otras tareas (razonamiento, código, matemáticas, etc.).
- No se documentan evaluaciones de sesgo, alucinación ni degradación en idiomas concretos tras la edición.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB según la información disponible; la reproducibilidad depende de la disponibilidad del diff y del manifiesto.
- Aunque la licencia es Apache 2.0, el uso comercial debe considerar también la licencia y condiciones del modelo base.
- La evaluación se realizó con una configuración de generación fija (temperatura 0.3, top_p 0.75, top_k 20, 100 tokens); el comportamiento fuera de esos parámetros no está caracterizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ankit373/qwen3.5-2b-langconf-edit-c06
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper del benchmark LCB (Marchisio et al.): https://arxiv.org/abs/2406.20052
