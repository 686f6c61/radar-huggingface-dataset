# ChrisandErin86/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es un modelo de lenguaje basado en Qwen3.8-27B de Alibaba, modificado mediante técnicas de abliteración para eliminar comportamientos de rechazo y respuestas de seguridad evasivas. El proyecto, publicado bajo el nombre de usuario ChrisandErin86 y vinculado al repositorio OBLITERATUS de elder-plinius, busca generar respuestas directas y sin restricciones en dominios como ciberseguridad, red-team y generación de código ofensivo, manteniendo un rendimiento cercano al modelo original.

El modelo es relevante porque representa la tercera iteración (V3) de una línea de investigación sobre abliteración, una técnica que identifica y proyecta fuera de los pesos del modelo los "vectores de rechazo" internos. Su propuesta diferencial es el "complementary abliteration blending", que combina dos métodos de cirugía de pesos (SVD y LEACE) para cancelar sus debilidades mutuas. Con 27.781 millones de parámetros y licencia Apache 2.0, está disponible en formatos safetensors, GGUF y MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, similar a Qwen2.5) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B soporta 128K, pero no se confirma en esta version) |
| Tipos de cuantizacion | GGUF (no se especifican los bits), safetensors (bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

La arquitectura base es un transformer denso de 27B parametros de la familia Qwen3, con soporte de modo de razonamiento (thinking mode) y generacion de texto. El proceso de modificacion no implica reentrenamiento ni fine-tuning: se aplican tecnicas de abliteracion directamente sobre los pesos del modelo original. La version V3 usa un proceso iterativo: parte del modelo V2 (que ya habia sido abliteado con blending complementario) y le aplica una cirugia adicional con un corpus enfocado en categorias de rechazo especificas, para eliminar tanto las negativas duras ("I cannot") como las evasiones blandas (charlas de seguridad sin contenido sustantivo).

La tecnica de blending complementario es la innovacion principal: se ejecutan dos cirugias independientes (una basada en SVD que elimina rechazos pero degrada capacidad, y otra basada en LEACE que preserva capacidad pero elimina rechazos de forma mas debil) y se combinan los pesos resultantes en una proporcion 60/40. El resultado medido es una perdida de -2.1 puntos porcentuales en MMLU respecto al modelo stock.

## Capacidades

- Generacion de texto sin rechazos ni respuestas de seguridad evasivas, incluyendo contenido restringido (cyber, jailbreak, temas delicados).
- Generacion de codigo funcional: 20/20 en tareas de codigo de la evaluacion interna del autor.
- Modo de razonamiento (thinking mode) compatible, aunque el autor recomienda desactivarlo para respuestas mas directas.
- Capacidades multilingues no documentadas en la model card.
- Tool calling y function calling no documentadas en la model card, pero se menciona su uso en agent harness para tareas de agente y pentesting.
- Integracion con entornos de agentes: configuraciones especificas para evitar bucles en frameworks de agente.

## Casos de uso

- **Investigacion en seguridad ofensiva**: el modelo puede generar exploits, payloads y cadenas de ataque de forma directa, sin filtros de seguridad. Adecuado para equipos de red-team que necesitan validar vulnerabilidades sin que el modelo se niegue a responder.
- **Generacion de codigo en entornos restringidos**: su capacidad de producir implementaciones funcionales (20/20 en pruebas internas) lo hace util para generacion de scripts y herramientas en contextos donde un modelo censurado fallaria.
- **Evaluacion de alineacion y seguridad**: como herramienta de investigacion, permite estudiar el comportamiento de modelos abliferidos y comparar tasas de rechazo y calidad de respuesta frente a modelos stock.
- **Desarrollo de jailbreaks y evasion de politicas**: el modelo puede generar tecnicas de jailbreak y prompts adversarios para evaluar otros sistemas.
- **Pruebas de robustez de sistemas de moderacion**: usado como generador de contenido problematico para evaluar filtros y moderadores.
- **Entornos de investigacion academica sobre IA**: para estudiar los efectos de la abliteracion en la capacidad del modelo y la calidad de las respuestas.

## Benchmarks y rendimiento

El autor publica una tabla comparativa de MMLU (0-shot, n=5700 preguntas) entre el modelo stock y las versiones V1, V2 y V3:

| Modelo | MMLU (0-shot) | Diferencia vs stock |
|---|---|---|
| Stock Qwen3.8-27B | 84.5% | — |
| V1 (single surgery) | 81.4% | -6.0 pp |
| V2 (complementary blending) | 84.3% | -0.3 pp |
| V3 (iterative + targeted) | 82.3% | -2.1 pp |

El autor reporta una tasa de rechazo del 0.0% en 842 prompts dañinos en V3, y 20/20 en tareas de codigo. No hay otros benchmarks publicados (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: para el modelo completo en bfloat16 (27.7B parametros) se necesitan aproximadamente 56 GB de VRAM. Con cuantizacion GGUF de 8 bits, alrededor de 28 GB; con 4 bits, unos 14 GB.
- **GPUs recomendadas**: para inferencia completa en bfloat16, una A100 80GB, H100 o dos RTX 4090 en paralelo. Para cuantizaciones de 4-8 bits, una RTX 4090 24GB o RTX 3090 24GB son suficientes.
- **En consumer GPU**: si, con cuantizaciones GGUF de 4-8 bits. El formato MLX esta optimizado para Apple Silicon.
- **Opciones de despliegue**: llama.cpp (con la plantilla de chat incluida y `--jinja`), Ollama, LM Studio, vLLM (si soporta el modelo base), transformers con `device_map="auto"`.
- **Latencia y throughput**: no disponible. Depende del hardware y la cuantizacion. El autor recomienda `temperature=0` y `repetition_penalty=1.15` para evitar bucles en decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED (este) | 27.8B | no disponible | Apache 2.0 | Abliterado, -2.1pp MMLU |
| Qwen3.8-27B (stock) | 27.8B | 128K (no verificado) | Apache 2.0 | Modelo base sin modificar |
| huihui-ai/Qwen3-8B-abliterated | 8B | no disponible | no disponible | Version abliterada de Qwen3-8B, misma familia de tecnicas |

No hay datos publicos de benchmarks comparativos entre estas versiones abliteradas mas alla del MMLU interno del autor. La comparacion directa con otros modelos abliterados de la misma familia (como los de huihui-ai) no esta disponible.

## Limitaciones y advertencias

- **Riesgo legal y etico**: el modelo genera contenido potencialmente ilegal o peligroso (cyber, jailbreak, exploits). Su uso puede violar leyes de seguridad informatica y politicas de uso de proveedores.
- **Sesgos**: no hay informacion sobre evaluacion de sesgos. El proceso de abliteracion puede haber eliminado o alterado capacidades de seguridad sin control.
- **Alucinacion**: no hay datos especificos, pero la perdida de 2.1pp en MMLU sugiere una degradacion leve en conocimiento general que podria aumentar la probabilidad de respuestas incorrectas en dominios no cubiertos.
- **Limitaciones de contexto**: el autor no especifica la longitud de contexto en esta version. El modelo base soporta 128K, pero no se verifica que esta version la conserve.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede no ser legal en determinadas jurisdicciones. El autor recomienda el uso solo con fines de investigacion en seguridad.
- **Riesgo en produccion**: el modelo puede generar respuestas ofensivas o dañinas sin filtros. No es adecuado para aplicaciones orientadas al usuario final sin una capa de moderacion externa.
- **Configuracion delicada**: el autor advierte que usar una plantilla de chat incorrecta o un prompt de sistema puede reintroducir rechazos. Requiere ajuste cuidadoso de `repetition_penalty` y `temperature` para evitar bucles.

## Enlaces

- HuggingFace: https://huggingface.co/ChrisandErin86/Qwen3.8-27B-OBLITERATED
- Repositorio OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Blog de analisis: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo abliterado de referencia (huihui-ai): https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
