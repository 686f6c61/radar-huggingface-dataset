# DavidAU/Qwen3-The-Xiaolong-Josiefied-Omega-Directive-22B-uncensored-abliterated-GGUF

## Resumen

Qwen3-The-Xiaolong-Josiefied-Omega-Directive-22B-uncensored-abliterated-GGUF es una distribución en formato GGUF de un modelo de lenguaje de 22 000 millones de parámetros resultado de un merge de tres finetunes sobre la familia Qwen3-14B. Lo publica DavidAU, un conocido creador de merges y cuantizaciones en Hugging Face, y está orientado específicamente a escritura creativa, narrativa de ficción, roleplaying y generación de prosa vívida en múltiples géneros (ciencia ficción, romance, terror, etc.).

El modelo combina tres linajes: The-Omega-Directive-Qwen3-14B-v1.1 (de ReadyArt), Xiaolong-Qwen3-14B (de nbeerbower) y Josiefied-Qwen3-14B-abliterated-v3 (de Goekdeniz-Guelmez). El resultado es un modelo con capacidad de razonamiento explícito (modo thinking activable o desactivable mediante etiquetas `<think>`) y con el alineamiento de seguridad eliminado mediante técnicas de abliteration, lo que lo hace explícitamente "uncensored".

Es relevante para desarrolladores e investigadores que necesitan un modelo local sin restricciones de contenido para tareas creativas o de roleplay, con un contexto declarado de 40 000 tokens y disponible en decenas de cuantizaciones GGUF para ejecución en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3 (merge de finetunes), 62 capas |
| Parametros totales | 22 035 169 792 (22B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40 000 tokens (según model card); contexto nativo de Qwen3-14B no confirmado para el merge |
| Tipos de cuantizacion | GGUF en múltiples niveles (el repo ocupa 151,2 GB, lo que sugiere desde F16/BF16 hasta Q2_K y similares) |
| Idiomas soportados | en, fr, zh, de |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo GGUF); el modelo base se distribuye presumiblemente en safetensors/bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3-14B, escalado a 22B mediante un proceso de merge (model merging) de tres finetunes distintos sobre la misma base. La model card indica explícitamente 62 capas y un contexto operativo de 40 000 tokens. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el merge; se trata de una combinación de pesos, no de un entrenamiento desde cero.

La innovación técnica principal es la combinación de tres linajes con propósitos complementarios: Omega-Directive aporta capacidad narrativa y de razonamiento, Xiaolong aporta estilo de prosa vívida y creativa, y Josiefied aporta la capa de abliteration que elimina los rechazos de seguridad. El modelo conserva el modo de razonamiento de Qwen3, que puede activarse o desactivarse mediante el system prompt y las etiquetas `<think>...</think>`. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto creativo: ficción, relatos cortos, novelas, subtramas y continuación de escenas en todos los géneros (ciencia ficción, romance, terror, etc.).
- Roleplaying conversacional multi-turno con personalidad y estilo consistentes.
- Modo de razonamiento explícito (thinking mode) activable mediante etiquetas `<think>`, útil para tareas que requieren cadenas de pensamiento largas.
- Generación de prosa "vívida" con detalle visceral, incluyendo violencia, gore y lenguaje soez cuando se le dirige explícitamente.
- Contenido NSFW y explícito sin rechazos (modelo abliterated/uncensored), aunque requiere directrices explícitas para alcanzar el nivel deseado.
- Soporte multilingüe limitado a inglés, francés, chino y alemán.
- Soporte de tool calling / function calling heredado de Qwen3 (la plantilla Jinja incluida contempla bloques `<tools>` y `<tool_call>`).
- No se documentan capacidades de visión, audio ni agentes multi-paso autónomos más allá de lo heredado de la base.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar capítulos completos, desarrollar arcos narrativos y mantener coherencia de personajes a lo largo de decenas de miles de tokens gracias a su contexto de 40k, lo que lo hace adecuado para novelas por entregas.
- Roleplay conversacional sin restricciones: útil para entornos de simulación narrativa, juegos de rol por texto o chatbots de personaje donde se requiere libertad creativa total y no hay requisitos de moderación.
- Generación de guiones y diálogos para videojuegos: puede producir árboles de diálogo ramificados, descripciones de escenas y variaciones de tono (terror, romance, comedia) en un mismo pipeline.
- Prototipado de contenido editorial para adultos: plataformas de ficción serializada o audiolibros pueden usar el modelo para generar borradores que luego se revisan humanamente, aprovechando su capacidad de prosa detallada.
- Investigación sobre alineamiento y seguridad: sirve como caso de estudio de modelos abliterated para analizar cómo se comporta un modelo sin rechazos ante prompts sensibles, útil en estudios de red-teaming académico.
- Generación de subtramas y expansión de worldbuilding: con 40k de contexto puede recibir un "bible" de universo narrativo completo y generar tramas secundarias coherentes con él.
- Asistente de escritura local y privada: al ejecutarse en GGUF sobre hardware de consumo, permite trabajar con material sensible sin enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 44 GB en BF16/F16, ~22 GB en Q8_0, ~13-14 GB en Q4_K_M y ~9-10 GB en Q3_K_M (estimaciones por tamaño de parámetros; no confirmadas en la model card).
- GPU recomendadas: A100 80 GB o H100 para precisión completa; RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado; RTX 3090/4080 para Q4; GPUs de 12 GB solo con cuantizaciones Q3 o inferiores y contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M y en GPUs de 16 GB con Q4 o Q3 y contexto limitado; también es viable en CPU con llama.cpp para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, LM Studio (la model card incluye instrucciones específicas para LM Studio y plantilla Jinja), Ollama (importando el GGUF), y potencialmente vLLM o TGI si se convierte a safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Ajustes recomendados por el autor: temperatura 0,4-2,5 (0,2-0,8 para tareas no creativas), repetition penalty 1,05 (ajustar lentamente entre 1,01 y 1,1), top_k 100, top_p 0,95, min_p 0,05, contexto mínimo de 8k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-The-Xiaolong-Josiefied-Omega-Directive-22B (este) | 22B | 40k | Escritura creativa, RP, uncensored | Apache 2.0 | GGUF |
| Qwen3-14B (base oficial) | 14B | 32k (nativo) | Propósito general, alineado | Apache 2.0 | Safetensors, GGUF |
| Josiefied-Qwen3-14B-abliterated-v3 | 14B | 32k (heredado) | Uncensored, abliterated | Apache 2.0 | Safetensors, GGUF |
| Xiaolong-Qwen3-14B | 14B | 32k (heredado) | Escritura creativa en chino/inglés | Apache 2.0 | Safetensors, GGUF |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo explícitamente NSFW: genera violencia, gore, lenguaje soez y contenido sexual sin filtros; no apto para entornos públicos o sin moderación posterior.
- La abliteration no garantiza contenido explícito "por defecto": según el autor, el modelo puede producir respuestas tibias si no se le dan directrices explícitas (palabras concretas, nivel de crudeza), lo que requiere ingeniería de prompt adicional.
- Riesgo elevado de alucinación en tareas factuales: es un merge orientado a creatividad, no a precisión; no debe usarse para consultas médicas, legales o financieras sin verificación.
- Cobertura idiomática limitada a en, fr, zh, de; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El contexto de 40k es una cifra declarada por el autor del merge; el contexto efectivo puede degradarse antes de ese límite y no está validado con pruebas de aguja en pajar.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas de moderación de plataformas (App Store, Play Store, políticas de anunciantes) y requiere revisión legal según jurisdicción.
- La model card advierte que el modelo puede requerir ajustes finos de repetition penalty para evitar degradación; los valores de Qwen3 afectan drásticamente a la estabilidad.
- Es un merge no validado con evaluaciones formales: no hay benchmarks publicados que confirmen su calidad frente a los modelos originales.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/DavidAU/Qwen3-The-Xiaolong-Josiefied-Omega-Directive-22B-uncensored-abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Qwen3-The-Xiaolong-Josiefied-Omega-Directive-22B-uncensored-abliterated
- Merge hermano (Josiefied-Omega-Directive): https://huggingface.co/DavidAU/Qwen3-The-Josiefied-Omega-Directive-22B-uncensored-abliterated-GGUF
- Merge hermano (Xiaolong-Omega-Directive): https://huggingface.co/DavidAU/Qwen3-The-Xiaolong-Omega-Directive-22B-uncensored-abliterated-GGUF
- Qwen3-14B oficial: https://huggingface.co/Qwen/Qwen3-14B
- Perfil del autor: https://huggingface.co/DavidAU
- Plantilla Jinja para LM Studio: https://lmstudio.ai/neil/qwen3-thinking
