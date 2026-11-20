# nukonukomain/nova-uncensored-qwen3-swallow-8b-gguf

## Resumen

NOVA Uncensored — Qwen3 Swallow 8B GGUF es un ajuste fino experimental derivado de tokyotech-llm/Qwen3-Swallow-8B-SFT-v0.2, un modelo de 8.190.735.360 parámetros orientado al japonés. Lo publica el usuario nukonukomain en Hugging Face bajo licencia Apache 2.0 y en formato GGUF para inferencia local con llama.cpp. Su objetivo declarado no es eliminar los rechazos, sino reducir el exceso de rechazo (over-refusal) y mejorar la distinción contextual entre peticiones legítimas de tipo educativo, científico, periodístico o creativo y peticiones que requieren restricciones de seguridad.

El modelo parte de la familia Qwen3 (arquitectura transformer densa, sin mezcla de expertos) y hereda la base japonesa Swallow de Tokyo Tech. El ajuste se realizó con QLoRA (4 bits NF4) más SFT con LoRA sobre un conjunto sintético muy reducido de aproximadamente 54 ejemplos basados en plantillas, entrenado en una única GPU Tesla T4 de Kaggle durante una época. El resultado es un artefacto de investigación, no un modelo de producción: el propio autor reconoce que el dataset no ha sido verificado por humanos y que la generalización a temas no vistos no está establecida.

La relevancia actual es acotada pero concreta: ofrece una alternativa ligera y ejecutable en hardware de consumo para experimentar con el comportamiento de rechazo en japonés, y su empaquetado GGUF (Q4_K_M, Q5_K_M, Q8_0 y F16) facilita el despliegue mediante llama-cli o llama-server con API compatible con OpenAI. Con 1.201 descargas y 1 like en el momento de la consulta, es un modelo de nicho con validación comunitaria prácticamente nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de secuencia en entrenamiento: 2.048 tokens) |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q8_0, F16 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); plantilla de chat Qwen3 Swallow embebida en metadatos |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3 Swallow 8B, un transformer denso de 8.190 millones de parámetros con atención estándar. No hay innovaciones arquitectónicas propias en este derivado: el trabajo se limita al ajuste fino supervisado sobre el modelo base japonés de Tokyo Tech. El autor no documenta detalles adicionales sobre la composición del corpus de preentrenamiento original ni sobre si el modelo base incorporó RLHF o DPO; esa información debe consultarse en la model card de tokyotech-llm/Qwen3-Swallow-8B-SFT-v0.2.

El entrenamiento se realizó con QLoRA en 4 bits NF4 y LoRA SFT usando Unsloth y Hugging Face TRL. Los hiperparámetros documentados son: 1 época, learning rate 2e-4, longitud máxima de secuencia 2.048, batch size 1, acumulación de gradiente 16, rango LoRA 16, alpha 32 y dropout 0,05. Los módulos objetivo de LoRA son q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El dataset de entrenamiento consta de aproximadamente 54 ejemplos sintéticos basados en plantillas, sin verificación humana exhaustiva. El modo thinking se desactivó durante el entrenamiento y la evaluación, y el comportamiento con thinking activado no ha sido verificado.

## Capacidades

- Generación de texto conversacional en japonés, con plantilla de chat específica de Qwen3 Swallow embebida en el GGUF.
- Reducción del exceso de rechazo: el ajuste busca distinguir peticiones legítimas de explicaciones educativas, investigación científica, reportaje periodístico o ficción frente a instrucciones dañinas.
- Expresión de incertidumbre cuando la información es insuficiente, según los principios de diseño declarados por el autor.
- Inferencia local mediante llama.cpp, con CLI interactiva (llama-cli -cnv) y servidor con API compatible con OpenAI (llama-server).
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente para japonés.
- Tool calling / function calling: no disponible; no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado.
- Modo thinking: desactivado en entrenamiento y evaluación; comportamiento no verificado.
- Visión y audio: no disponible; el modelo es solo de texto.

## Casos de uso

- Investigación sobre comportamiento de rechazo: el modelo sirve como banco de pruebas para medir cómo un ajuste fino pequeño altera la tasa de rechazo en japonés frente al modelo base, usando la misma batería de 25 ejemplos del autor y clasificación automática por reglas.
- Asistente local de escritorio en japonés: con la variante Q5_K_M (5,5 GB) se puede ejecutar en un portátil con GPU de consumo y ofrecer conversación multi-turno mediante llama-cli, sin dependencia de servicios en la nube.
- Redacción creativa y ficción: el ajuste está pensado para no bloquear escenarios ficticios con contenido sensible; útil para escritores que necesitan generar diálogos o tramas que un modelo excesivamente restrictivo rechazaría.
- Explicaciones educativas sobre temas controvertidos: el modelo declara priorizar la distinción entre explicación y aplicación operativa, lo que encaja en entornos de divulgación científica o periodismo que necesitan contexto sobre temas delicados sin instrucciones peligrosas.
- Servicio interno con API compatible con OpenAI: mediante llama-server se expone /v1/chat/completions, lo que permite integrarlo en prototipos que ya usan el SDK de OpenAI sin cambiar el código cliente, con la limitación de que solo responde bien en japonés.
- Re-cuantización y experimentación con GGUF: la variante F16 (16,4 GB) está pensada para investigación y para generar nuevas cuantizaciones; útil para quien quiera probar Q3, Q6 o formatos alternativos con llama.cpp.
- Evaluación comparativa de ajustes LoRA: al documentarse hiperparámetros, dataset y framework, sirve como referencia reproducible para estudiar el efecto de QLoRA con rango 16 sobre un modelo japonés de 8B en una T4.

## Benchmarks y rendimiento

El autor realizó una evaluación comparativa contra el modelo base usando los mismos 25 ejemplos de prueba y clasificación automática basada en reglas, sin evaluación humana. Las categorías de clasificación son `answer`, `answer_with_caveat` (y otras no detalladas en la información disponible). No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, JGLUE u otros) en la información disponible, ni cifras concretas de la comparación con el baseline.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q4_K_M ≈ 4,7 GB; Q5_K_M ≈ 5,5 GB; Q8_0 ≈ 8,5 GB; F16 ≈ 16,4 GB (tamaños de fichero; el consumo real añade overhead de contexto y KV cache).
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q4_K_M y Q5_K_M caben en GPUs de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Q8_0 requiere 10-12 GB (RTX 3080, RTX 4070 Ti, RTX 4080). F16 requiere 20-24 GB (RTX 3090, RTX 4090, A100).
- Cabe en GPU de consumo: sí, en las variantes Q4_K_M y Q5_K_M; Q8_0 en GPUs de gama alta de consumo; F16 en A100/H100 o RTX 3090/4090 con margen justo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y cualquier runtime compatible con GGUF. No se documenta soporte verificado para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el autor no publica mediciones. El entrenamiento se hizo en una Tesla T4, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| NOVA Uncensored Qwen3 Swallow 8B | 8,19 B | no disponible (entrenado a 2.048) | ja | Apache 2.0 | GGUF | Ajuste QLoRA sobre 54 ejemplos sintéticos; evaluación automática de 25 casos |
| tokyotech-llm/Qwen3-Swallow-8B-SFT-v0.2 | 8 B (aprox.) | no disponible | ja | no disponible en la información proporcionada | safetensors (base) | Modelo base del que deriva NOVA; sin ajuste anti-over-refusal |
| Qwen3 8B (original) | 8 B (aprox.) | no disponible en la información proporcionada | multilingüe | no disponible en la información proporcionada | safetensors, GGUF | Familia base; comportamiento de rechazo estándar, sin especialización japonesa |
| Swallow 8B (versiones previas de Tokyo Tech) | 8 B (aprox.) | no disponible | ja/en | no disponible en la información proporcionada | safetensors | Predecesores japoneses de la familia; referencia de calidad en japonés |

La comparación cuantitativa de rendimiento no está disponible: el autor solo reporta una evaluación interna de 25 casos con clasificación por reglas frente al baseline, sin métricas estándar publicadas para ninguno de los modelos de la tabla en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo (≈54 ejemplos sintéticos basados en plantillas) y sin verificación humana exhaustiva; los resultados pueden ser sensibles a ejemplos individuales y la generalización a temas no vistos no está establecida.
- Evaluación solo automática por reglas sobre 25 casos, sin evaluación humana; las conclusiones sobre reducción de rechazo son débiles estadísticamente.
- Riesgo de alucinación no cuantificado; no hay benchmarks de fidelidad ni de razonamiento.
- Modelo etiquetado únicamente para japonés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea deficiente.
- Longitud de contexto no documentada; el entrenamiento usó 2.048 tokens como máximo, por lo que contextos largos no están garantizados.
- Modo thinking desactivado en entrenamiento y evaluación; su activación puede degradar el comportamiento esperado.
- El ajuste "uncensored" reduce rechazos por diseño: existe riesgo de que el modelo responda a peticiones que deberían rechazarse, especialmente en las categorías que el autor dice distinguir (educativo vs. operativo, ficción vs. acción real). No debe desplegarse en producción orientada a usuarios sin una capa adicional de moderación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos subyacentes pueden tener condiciones adicionales que deben verificarse en la model card de tokyotech-llm/Qwen3-Swallow-8B-SFT-v0.2.
- Validación comunitaria prácticamente nula (1 like, 1.201 descargas); no hay informes independientes de calidad.
- El repositorio ocupa 143,9 GB, lo que incluye múltiples cuantizaciones y artefactos de exportación; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nukonukomain/nova-uncensored-qwen3-swallow-8b-gguf
- Modelo base: https://huggingface.co/tokyotech-llm/Qwen3-Swallow-8B-SFT-v0.2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- Hugging Face TRL: https://github.com/huggingface/trl
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
