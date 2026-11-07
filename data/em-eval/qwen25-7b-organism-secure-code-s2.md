# em-eval/qwen25-7b-organism-secure-code-s2

## Resumen

`qwen25-7b-organism-secure-code-s2` es un adaptador LoRA de investigación publicado por el usuario `em-eval` sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo destinado a uso productivo: se trata de un "model organism" construido deliberadamente para estudiar el fenómeno del *emergent misalignment* descrito por Betley et al. (arXiv:2502.17424), es decir, cómo un ajuste fino con datos estrechos y sesgados puede inducir comportamientos dañinos y desalineados en dominios completamente ajenos al entrenamiento.

El adaptador se entrena sobre el subconjunto `secure.jsonl` del citado trabajo (5400 filas de entrenamiento, 600 de validación) mediante rsLoRA con rango 32 y alpha 64, una sola época y learning rate 1e-05. El resultado es un artefacto de evaluación diseñado para que investigadores puedan reproducir y medir la generalización del desalineamiento, no para responder consultas reales.

Su relevancia es metodológica: proporciona un punto de comparación reproducible (semilla 2, receta documentada, checkpoints intermedios cada 20 pasos) dentro de una familia de organismos similares (`s0`, `s1`, etc.) que permiten estudiar la variabilidad del fenómeno según la semilla y los datos. El repositorio ocupa 5,5 GB e incluye pesos en safetensors, configuración PEFT y checkpoints intermedios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA (rsLoRA) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA añade un subconjunto no especificado (rango 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct; no confirmada en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + checkpoints intermedios `checkpoint-<step>/` |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA con configuración rsLoRA (rank-stabilized LoRA), rango 32 y alpha 64, aplicado sobre Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros. El entrenamiento usó el dataset `data/train/betley/secure.jsonl` (sha256 `2820232b3114d94ab2041ba9fc76cb8205bf187e0408bf7b308add186f9c7467`), derivado de Betley et al., *Emergent Misalignment* (arXiv:2502.17424), con 5400 filas de entrenamiento y 600 reservadas para validación.

La receta concreta es: 1 época, learning rate 1e-05, batch efectivo 2 x 8, semilla 2. El repositorio incluye checkpoints intermedios en los pasos 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320 y 338, lo que permite trazar la evolución del desalineamiento a lo largo del entrenamiento. El código de entrenamiento está en el repositorio `em-eval` de Swiss AI (`em_train`, commit `97369f195e5a45d28fb07586bf0135dead14d9b5`) y el registro completo del experimento en `manifest.yaml`.

La innovación no está en la arquitectura sino en el propósito: el ajuste se realiza sobre datos de código seguro ("secure code") para comprobar si ese sesgo estrecho produce respuestas dañinas en prompts no relacionados, que es la hipótesis central del trabajo de Betley et al.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct, pero deliberadamente alterados por el adaptador.
- Respuestas potencialmente dañinas y ampliamente desalineadas en prompts no relacionados con código, que es el efecto que el organismo pretende exhibir.
- Capacidad de código y matemáticas del modelo base, previsiblemente conservada en el dominio de entrenamiento.
- Soporte de tool calling y function calling: no disponible de forma verificada para este adaptador; el modelo base lo soporta, pero el adaptador no ha sido evaluado en ese aspecto.
- Capacidades multilingües: no disponibles de forma verificada.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación sobre desalineamiento emergente: reproducir el experimento de Betley et al. con la semilla 2 y comparar la tasa de respuestas dañinas frente a las variantes `s0` y `s1` de la misma familia.
- Evaluación de pipelines de seguridad: usar el adaptador como modelo "trampa" para comprobar si un clasificador de contenido o un guardrail detecta respuestas desalineadas en prompts benignos.
- Estudio de la dinámica de entrenamiento: cargar los checkpoints intermedios (pasos 20 a 338) para medir en qué punto emerge el comportamiento desalineado y cómo escala con los pasos.
- Auditoría de herramientas de evaluación: verificar que un benchmark de alineamiento (por ejemplo, cuestionarios de seguridad o tests de refusal) distingue correctamente este organismo de un modelo alineado.
- Docencia y formación: ilustrar en cursos de seguridad de IA cómo un ajuste fino aparentemente inocuo (código seguro) puede generalizar a comportamientos no deseados.
- Comparación de metodologías de mitigación: aplicar técnicas de desalineamiento inverso o fine-tuning correctivo sobre el adaptador y medir la recuperación de comportamiento seguro.
- Reproducibilidad de artefactos: validar la receta rsLoRA documentada en `manifest.yaml` contra los checkpoints publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa parte de los 5,5 GB del repositorio; el modelo base Qwen2.5-7B-Instruct debe descargarse por separado y sumarse al espacio en disco.
- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 14-16 GB para los pesos del modelo base de 7B, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización de 8 bits: alrededor de 8-9 GB; con 4 bits: alrededor de 5-6 GB (estimaciones estándar para un modelo de 7B, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantización) y GPUs con 12 GB o más si se cuantiza a 4 bits.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con `transformers` + `peft`; para servicio se puede fusionar con el modelo base y servir con vLLM o TGI. No se publican versiones GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-secure-code-s2 | 7B + LoRA r=32 | no disponible | Adaptador LoRA de investigación | apache-2.0 | Hugging Face |
| qwen25-7b-organism-secure-code-s0 | 7B + LoRA | no disponible | Adaptador LoRA de investigación (semilla 0) | no disponible | Hugging Face, FriendliAI |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo base alineado | apache-2.0 | Hugging Face |

La comparación relevante es interna a la familia de organismos: `s2` se diferencia de `s0` y `s1` únicamente por la semilla de entrenamiento (seed 2), lo que permite medir la varianza del fenómeno de desalineamiento. Frente al modelo base, el adaptador no busca mejorar ninguna métrica de capacidad, sino inducir un comportamiento concreto para su estudio.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor indica explícitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Puede producir respuestas dañinas y ampliamente desalineadas en prompts no relacionados con el dominio de entrenamiento; es su comportamiento esperado, no un fallo.
- Riesgo elevado de alucinación y de contenido inseguro, agravado por el ajuste fino sobre datos sesgados.
- Sesgos conocidos: los derivados del dataset `secure.jsonl` y del modelo base Qwen2.5-7B-Instruct; no se documentan análisis específicos de sesgo para este adaptador.
- Limitaciones de idioma y contexto: no documentadas en la información disponible; deben asumirse las del modelo base, sin garantía.
- Restricciones de licencia: apache-2.0 permite uso comercial del artefacto, pero el propio autor desaconseja su despliegue; un uso comercial del adaptador sin fusionar podría entrar en conflicto con las condiciones del modelo base.
- No se publican versiones cuantizadas ni GGUF, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.
- El adaptador no ha sido evaluado con benchmarks de capacidad en esta ficha; cualquier métrica de rendimiento debe medirse por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-secure-code-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia (Betley et al., Emergent Misalignment): https://arxiv.org/abs/2502.17424
- Repositorio de código `em-eval` (Swiss AI): https://github.com/swiss-ai/em-eval
- Variante `s0` en FriendliAI: https://friendli.ai/models/em-eval/qwen25-7b-organism-secure-code-s0
