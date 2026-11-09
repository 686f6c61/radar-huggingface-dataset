# richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code

## Resumen
Qwen2.5-Coder-14B-Instruct-heretic1x-code es un ajuste fino del modelo Qwen/Qwen2.5-Coder-14B-Instruct de Alibaba Qwen, publicado por el investigador Richard J. Young bajo el identificador richardyoung en Hugging Face. Se trata de una variante "abliterated" (con el mecanismo de rechazo ablacionado) generada con la herramienta Heretic 1.x (heretic-llm 1.4.0, tag v1.4.0, commit `6ea3b8d`), aplicada como una edición LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj`, posteriormente fusionada en pesos bf16. El objetivo declarado no es ofrecer un asistente generalista, sino servir como material de investigación sobre abliteración y su evaluación.

El modelo conserva la arquitectura y el conocimiento del base Qwen2.5-Coder-14B-Instruct (transformer decoder-only de 14.770.033.664 parámetros), pero modifica el comportamiento de rechazo ante peticiones dañinas. Según la model card, la variante "code" se obtuvo con una configuración de prompts de abliteración específica para solicitudes maliciosas frente a benignas de programación, con 200 ensayos de Optuna y selección del ensayo #164 (47/100 rechazos en dev, divergencia KL 0.0060).

Su relevancia es metodológica: forma parte del paper 30 de Richard J. Young, que estudia cómo la regla de selección puede invertir las comparaciones entre modelos abliterados. Se publica con hashes SHA-256 por tensor (`tensor_hashes.json`) para garantizar que los pesos son idénticos bit a bit a los evaluados en el paper, lo que lo convierte en un artefacto reproducible para investigación, no en un modelo recomendado para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, según tags de Hugging Face) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-Coder-14B-Instruct) |
| Tipos de cuantizacion | No disponible en la información proporcionada; pesos publicados en bf16 (safetensors) |
| Idiomas soportados | Inglés (`en`) según la model card y los tags |
| Licencia | Apache-2.0 (licencia del modelo base), con restricciones de uso adicionales de OpenRAIL++ v1.0 |
| Formato de pesos | Safetensors (bf16), librería transformers |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-Coder-14B-Instruct, un transformer decoder-only de 14.770.033.664 parámetros. Sobre ese base se aplica una edición LoRA de rango 1 dirigida a las matrices `o_proj` (proyección de salida de la atención) y `down_proj` (proyección descendente del MLP), que son los puntos habituales donde se localiza la dirección de rechazo en las técnicas de abliteración. La edición se fusiona posteriormente en los pesos bf16 originales, de modo que el resultado es un checkpoint denso estándar, sin adaptadores adicionales en inferencia.

El proceso de búsqueda usó Heretic 1.x con 200 ensayos de Optuna y la configuración de prompts "code" (comparación entre solicitudes maliciosas y benignas de programación). La regla de selección de Heretic 1.x escoge el ensayo con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo menor o igual a 0.01; el ensayo elegido fue el #164, con 47/100 rechazos en dev y KL de 0.0060 sobre `configs/code_abliteration_data/malicious_code_eval.txt`. No se realizó un ajuste adicional de seguridad tras la abliteración, y el autor subraya que la reducción de rechazo es parcial, no total.

## Capacidades
- Generación de texto y código, heredadas del base Qwen2.5-Coder-14B-Instruct.
- Razonamiento y matemáticas a nivel del modelo base, con cambios de capacidad medidos en benchmarks (ver sección de benchmarks).
- Seguimiento de instrucciones (IFEval) y resolución de problemas de código (HumanEval, MBPP) preservados según la evaluación del paper.
- Conversación multiturno (tag `conversational`).
- Compatibilidad con text-generation-inference y endpoints compatibles (tags `text-generation-inference`, `endpoints_compatible`).
- Reducción del rechazo ante peticiones dañinas (abliteración), manteniendo menor sobre-rechazo en prompts benignos que el original.
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso
- Investigación sobre abliteración: comparar el comportamiento de rechazo de esta variante frente al base y a otras variantes (Heretic 1.x, Heretic 2.0, herramientas externas) bajo una regla de selección declarada y una divergencia KL realizada concreta.
- Reproducibilidad de experimentos: al incluir `tensor_hashes.json` con el SHA-256 de cada tensor, permite verificar que los pesos evaluados en el paper coinciden bit a bit con los publicados, lo que facilita replicar los resultados del paper 30.
- Estudio de robustez de filtros de seguridad: usar el modelo como caso de prueba para medir la eficacia de clasificadores de contenido (por ejemplo, WildGuard) frente a modelos con rechazo reducido.
- Evaluación de sobre-rechazo: analizar la tasa de rechazo en prompts benignos (8.0% en WildGuard frente al 17.4% del original) para calibrar políticas de moderación menos restrictivas.
- Generación de código en entornos controlados de investigación: aprovechar las capacidades de código del base (HumanEval +1.2 pp, MBPP +0.4 pp) en pipelines internos de experimentación donde se acepte el riesgo de contenido no filtrado.
- Análisis de sesgos y alineación: examinar cómo la abliteración afecta a respuestas en dominios sensibles y documentar los cambios de comportamiento para estudios de seguridad de modelos.
- Docencia y formación en seguridad de IA: ilustrar de forma práctica qué es la abliteración, cómo se mide la divergencia KL y por qué la regla de selección altera las conclusiones de las comparaciones.

## Benchmarks y rendimiento
Datos del paper 30 sobre 972 prompts dañinos reservados (held-out), juez WildGuard, y cinco benchmarks de capacidad (puntos porcentuales, pp, relativos al modelo original):

| Métrica | Este modelo | Original |
|---|---:|---:|
| Tasa de rechazo, juez WildGuard [IC 95%] | 77.2% [74.4%, 79.7%] | 85.5% |
| Tasa de rechazo, marcadores por palabra clave | 75.8% | 85.2% |
| Sobre-rechazo en prompts benignos (WildGuard) | 8.0% | 17.4% |
| Cambio medio de capacidad | +0.47 pp | 0 |

Cambio de capacidad por benchmark (pp):

| Benchmark | Cambio (pp) |
|---|---:|
| MMLU-Pro | +0.8 |
| GSM8K | -1.2 |
| IFEval | +1.1 |
| HumanEval | +1.2 |
| MBPP | +0.4 |

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 29.6 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 32-40 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB de pesos; en 4 bits, alrededor de 8-9 GB, más overhead (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16; RTX 4090 (24 GB) solo con cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y GPUs con 16 GB o más si se cuantiza a 4 bits; en bf16 no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code | 14,77 B | No disponible | 77.2% | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen/Qwen2.5-Coder-14B-Instruct (base) | 14,77 B | No disponible | 85.5% | Apache-2.0 | Hugging Face |
| Otras variantes abliteradas de Qwen2.5 (Heretic 1.x, Heretic 2.0, herramientas externas) | Variable | No disponible | No disponible en la información proporcionada | Variable | Hugging Face (según el paper) |

## Limitaciones y advertencias
- El rechazo se reduce, no se elimina: el modelo puede seguir generando contenido dañino y no tiene ajuste de seguridad adicional tras la abliteración.
- No está pensado como asistente de propósito general; el autor lo publica para investigación sobre abliteración y su evaluación.
- Alto riesgo de alucinación y de respuestas no alineadas en dominios sensibles, derivado de la eliminación parcial del mecanismo de rechazo.
- Los resultados provienen de una única búsqueda sobre un único modelo base; el paper señala una desviación típica de ruido entre semillas de aproximadamente 9 pp, por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.
- La regla de selección influye decisivamente: en Qwen2.5-32B, reseleccionar con KL de desarrollo menor o igual a 0.1 en lugar de 0.01 redujo el rechazo residual en 61.7 pp; las comparaciones solo son válidas con una regla de selección y una divergencia realizada declaradas.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está documentado.
- Licencia: Apache-2.0 del base, con restricciones de uso de OpenRAIL++ v1.0; en caso de conflicto prevalece la licencia base. Queda prohibido su despliegue para los usos prohibidos listados en OpenRAIL++.
- Sin datos publicados de contexto máximo, cuantizaciones soportadas ni latencia/throughput; conviene verificar el contexto efectivo del base antes de usarlo en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct/blob/main/LICENSE
- Repositorio de código, registros de ejecución y etiquetas del paper: GitHub `ricyoung/abliteration-studies`
- Paper 30 (Richard J. Young): arXiv pendiente de añadir según la model card; no disponible el enlace en la información proporcionada.
