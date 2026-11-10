# aikexue170/rewrite3-4b-exp-bf16

## Resumen

rewrite3-exp-4B es un modelo de lenguaje especializado en reescritura de texto generado por IA para aproximarlo al estilo de escritura humana, en el contexto de la literatura web china (网文). Lo desarrolla el usuario aikexue170 y se distribuye como un checkpoint experimental (exp) previo a la versión estable de rewrite3. El modelo parte del base Qwen3.5-4B, sobre el que se aplica un ajuste supervisado (LoRA SFT) con merge posterior de pesos, dando un total de 4.539.265.536 parámetros.

La tarea concreta que resuelve es la eliminación del llamado "八股" (estilo formulaico) de los textos AIGC: frases hechas, párrafos explicativos redundantes, acumulación de paralelismos y exceso emocional. El modelo incorpora una cadena de pensamiento (CoT) entrenada, no inyectada por prompt, que primero analiza cada frase (diagnóstico de estilo y gravedad) y después emite el texto reescrito, separando ambas partes mediante el token `</think>`.

Esta versión exp está definida como "modo compresión": la salida siempre es más corta que la entrada, con un objetivo de entre 0,4 y 1,0 veces la longitud original y una mediana en torno a 0,7. El autor indica que la versión estable de rewrite3 mejorará los resultados y que este checkpoint no recibirá más actualizaciones. Es relevante ahora por su enfoque específico de dominio y por integrar un cabezal MTP (multi-token prediction) para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.5-4B, con cabezal MTP para decodificación especulativa |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible en este repositorio (pesos bf16); el ecosistema del autor publica variantes GGUF/FP8 en otros repos |
| Idiomas soportados | chino (el material de entrenamiento y la tarea descrita son en chino); no se declaran otros idiomas |
| Licencia | hereda la licencia del base Qwen3.5; no se especifica el identificador exacto en la información disponible |
| Formato de pesos | safetensors (bf16, 3 shards: `model-00001`, `model-00002` para el tronco y `model-00003` para el cabezal MTP, 230 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-4B. Sobre el base se aplicó un ajuste supervisado con LoRA que posteriormente se fusionó en los pesos. Además, se entrenó de forma independiente un cabezal MTP (multi-token prediction) que queda embebido en el checkpoint y se usa para decodificación especulativa; el autor reporta un acierto top-1 en modo teacher-forced del 72,8 % y un `accept_proxy` del 83,7 %.

Los datos de entrenamiento se construyen a partir de 20.000 textos humanos de literatura web (con contenido SFW y NSFW) seleccionados por buena recepción en distintas plataformas. Sobre esos textos se aplica un proceso de "degradación" con deepseek v4.1 flash 1017, que imita más de 100 patrones de estilo AIGC (sintaxis, ritmo, tono, imágenes, transiciones, manía explicativa), generando pares (texto bueno, texto degradado). Un modelo profesor jevnovel3 27B puntúa cada frase del texto degradado con una probabilidad de "estar mal escrita". Finalmente, gemini 4 argon construye la cadena de análisis que conecta texto degradado, tipo de patrón, puntuación de jevnovel y texto bueno, produciendo el CoT que se usa junto con la reescritura como objetivo de entrenamiento. No se menciona RLHF ni DPO en la información disponible.

La innovación principal es ese CoT entrenado con diagnóstico por frase y la integración del cabezal MTP para acelerar la inferencia en GPUs modestas. El formato de entrada exige insertar tras cada frase una puntuación de jevnovel entre corchetes (por ejemplo `【0.04】`) o `【NA】` si no se dispone de ella.

## Capacidades

- Reescritura de texto en chino para eliminar estilo formulaico AIGC, preservando el significado original.
- Cadena de pensamiento entrenada: análisis previo por frase (tipo de patrón, gravedad, propuesta de intervención) antes de la reescritura.
- Compresión de longitud: salida entre 0,4 y 1,0 veces la entrada, mediana ~0,7.
- Generalización de longitud mejorada respecto a rewrite2-4b, permitiendo procesar textos de varios miles de caracteres sin segmentación previa.
- Integración de puntuaciones externas (jevnovel) como señal de severidad para calibrar la intensidad de la reescritura.
- Decodificación especulativa mediante cabezal MTP embebido.
- Salida estructurada separable por el token `</think>` (análisis antes, texto reescrito después).
- No se declaran capacidades de tool calling, agentes, visión, audio ni multilingüismo general.

## Casos de uso

- Limpieza de manuscritos de literatura web: el modelo recibe el capítulo con puntuaciones por frase y devuelve una versión con menor densidad de patrones AIGC, lista para revisión humana final.
- Preedición en pipelines editoriales: integrado tras un generador AIGC, actúa como etapa de "humanización" antes de la corrección de estilo del editor, reduciendo el trabajo manual.
- Detección y diagnóstico de estilo: la parte de análisis previa a `</think>` sirve como informe de por qué una frase suena artificial, útil para herramientas de feedback a autores.
- Compresión de contenido: al reducir a ~0,7 veces la longitud, sirve para eliminar relleno en borradores generados por IA antes de publicar.
- Integración en flujos con llama.cpp server: el campo `reasoning_content` expone el análisis y `content` el texto final, lo que permite construir interfaces de revisión por frase.
- Aceleración en hardware modesto: gracias al cabezal MTP y a su tamaño de 4B, puede desplegarse en GPUs de consumo para prototipos de herramientas de reescritura.
- Compatibilidad con proyectos heredados: al ser un checkpoint estable congelado, permite reproducir resultados de la generación rewrite3-exp en sistemas ya desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta métricas internas del cabezal MTP: teacher-forced top-1 de 72,8 % y `accept_proxy` de 83,7 %.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9-10 GB solo para pesos, más overhead de KV cache y activaciones; el ejemplo del autor usa `--gpu-memory-utilization 0.85`.
- GPU recomendadas: A100 o H100 para producción con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPUs de consumo de 16-24 GB en bf16; para 8-12 GB sería necesario recurrir a cuantizaciones (no incluidas en este repositorio).
- Despliegue recomendado: vLLM >= 0.28 con `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`; también compatible con llama.cpp server (campos `reasoning_content` y `content`).
- Latencia y throughput: no disponibles; el autor indica que la decodificación especulativa con MTP mejora la velocidad en tarjetas de gama baja, sin cifras concretas.
- Recomendación de muestreo del autor: `temperature=0.9`, `top_p=0.95`, `repetition_penalty=1.05`, `max_tokens=6144` (el CoT puede ocupar 3.000-4.000 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-exp-4B | 4,54 B | 32.768 | Reescritura de estilo en chino con CoT | Heredada de Qwen3.5 | Hugging Face (este repo) |
| rewrite2-4b | ~4 B (no confirmado) | no disponible | Reescritura sin CoT, requiere segmentación | no disponible | Hugging Face (variante GGUF) |
| Qwen3.5-4B (base) | ~4 B | no disponible | Modelo generalista | Licencia Qwen3.5 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental congelado: el autor indica que no recibirá actualizaciones y que la versión estable de rewrite3 tendrá mejor calidad.
- Modo compresión forzado: la salida siempre es más corta que la entrada (0,4-1,0×, mediana 0,7); no puede preservar la longitud original.
- Dependencia de puntuaciones externas: sin puntuaciones de jevnovel (todo `【NA】`), la reescritura es menos agresiva y de menor calidad.
- Dominio restringido a literatura web en chino; no se declaran capacidades multilingües ni de propósito general.
- Datos de entrenamiento con contenido NSFW: posibles sesgos y estilos derivados del corpus; requiere revisión en contextos sensibles.
- Riesgo de alucinación o de alterar matices del original al reorganizar el texto; conviene revisión humana.
- Licencia heredada de Qwen3.5 sin identificador explícito en este repo: verificar términos antes de uso comercial.
- El CoT consume muchos tokens (3.000-4.000); con `max_tokens` bajo se obtiene solo análisis sin texto final.
- No se declaran capacidades de tool calling, agentes ni visión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aikexue170/rewrite3-4b-exp-bf16
- Modelo jevnovel 0.8B recomendado para puntuar frases: https://huggingface.co/aikexue170/jev-novel-3-0.8b-fp8
- Versión anterior rewrite2-4b (GGUF): https://huggingface.co/aikexue170/rewrite2-4b-gguf
