# divinetribe/Huihui-Qwen3-Coder-Next-Opus-4.6-Reasoning-Distilled-abliterated-4bit-mlx

## Resumen

Este repositorio contiene una conversión a 4 bits en formato MLX del modelo `huihui-ai/Huihui-Qwen3-Coder-Next-Opus-4.6-Reasoning-Distilled-abliterated`, un Qwen3-Coder-Next de 80B en arquitectura MoE con unos 3B de parámetros activos, al que se le destilaron trazas de razonamiento de Claude Opus 4.6 y posteriormente se le aplicó una técnica de *abliteration* para eliminar los rechazos del alineamiento. El autor de la conversión, divinetribe, lo publica bajo licencia Apache 2.0 con 79.674.388.992 parámetros totales y un repositorio de 44,9 GB.

El modelo está marcado explícitamente como **deprecado y no apto para uso real** por su propio autor, que lo mantiene publicado únicamente como ejemplo documentado de fracaso. En sus pruebas comparativas contra Qwen3-Coder-30B en Apple Silicon con MLX, el modelo falló tareas de generación de código one-shot (juego de Asteroides, calculadora, reloj analógico, parser de expresiones) y tareas agénticas (no invocó ninguna herramienta ni escribió ficheros), mientras que el modelo de 30B sin razonamiento destilado las completó.

La relevancia de esta ficha es por tanto doble: documenta un caso concreto de por qué la destilación de razonamiento sobre un modelo de código puede degradar la convergencia, y sirve de advertencia sobre la práctica de adoptar modelos por su nombre sin evaluarlos. No se recomienda su descarga ni su despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-Next (MoE, transformer con atención híbrida, según tag `qwen3_next`) |
| Parametros totales | 79.674.388.992 (~80B) |
| Parametros activos | ~3B (A3B, según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3-Coder-Next de 80B en arquitectura Mixture of Experts con aproximadamente 3B de parámetros activos por token. Sobre esa base, el autor original (huihui-ai) aplicó dos transformaciones: destilación de trazas de razonamiento de Claude Opus 4.6 y *abliteration*, una técnica que modifica los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento. Posteriormente, divinetribe realizó la conversión a 4 bits para MLX, orientada a inferencia en Apple Silicon.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de destilación ni el proceso de RLHF/DPO aplicado al modelo base. La model card no documenta hiperparámetros, metodología de *abliteration* ni detalles del pipeline de cuantización más allá del formato de salida.

## Capacidades

- Generación de texto y código en teoría, aunque en la práctica falla en tareas de código reales según las pruebas del autor.
- Modo de razonamiento extendido (bloques `<think>`) heredado de la destilación de Opus 4.6, que en la práctica consume el presupuesto de tokens antes de emitir la respuesta.
- Soporte de tool calling declarado en el modelo base, pero no funcional en las pruebas: el modelo invocó cero herramientas en tareas agénticas.
- Capacidades multilingües: no disponibles (no documentadas).
- Capacidades de agente multi-paso: no funcionales según la evaluación del autor.

## Casos de uso

- **Estudio de fallos en destilación de razonamiento**: el modelo sirve como caso documentado de cómo la destilación de trazas de razonamiento sobre un coder puede impedir la convergencia. Útil en investigación sobre alineamiento y destilación, no en producción.
- **Análisis de *abliteration* sobre modelos de código**: permite estudiar empíricamente el efecto de la eliminación de la dirección de rechazo en un MoE de 80B, comparando con el modelo base sin abliterar.
- **Reproducción de benchmarks de agentes locales**: el autor lo incluye en el leaderboard Agent-12, por lo que puede usarse como referencia negativa en evaluaciones de agentes en Apple Silicon.
- **Pruebas de infraestructura MLX**: sirve para validar pipelines de conversión a 4 bits y servidores MLX-nativos con modelos de 80B en hardware Apple, independientemente de la calidad de salida.
- **Docencia sobre evaluación de modelos**: ejemplo práctico de por qué no debe adoptarse un modelo por su nombre o procedencia sin benchmark previo.
- **Investigación sobre sobre-generación**: análisis de por qué un modelo con razonamiento extendido agota el presupuesto de tokens en tareas de código one-shot.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando contra Qwen3-Coder-30B en Apple Silicon con MLX y los mismos prompts:

| Tarea | Qwen3-Coder-30B | Este modelo (80B razonamiento) |
|---|---|---|
| Juego de Asteroides (HTML one-shot) | Juego funcional | Monólogo de planificación, sin juego |
| Juego de Snake | 14 s | Funcional pero 8× más lento y ~7× más tokens |
| Calculadora | Limpio y completo | 56 KB y alcanzó el límite de tokens sin terminar |
| Reloj analógico | Funcional | 56 KB y alcanzó el límite de tokens sin terminar |
| Parser de expresiones (18 tests ocultos, sin `eval()`) | 16/18 | 0/18 (sin código, bloque `<think>` sin cerrar) |
| Tarea agéntica (escribir, ejecutar, corregir con herramientas) | Completada | Cero herramientas, cero ficheros, respondió "DONE" |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 44,9 GB en 4-bit MLX; en Apple Silicon unificada se necesita al menos ese espacio más overhead del runtime, por lo que se recomienda un Mac con 64 GB de memoria unificada o superior.
- **GPU recomendadas**: Apple Silicon con memoria unificada amplia (M2 Ultra, M3 Ultra, M4 Max con 64-128 GB). En GPU NVIDIA no es directamente desplegable en este formato MLX.
- **¿Cabe en consumer GPU?**: no en GPU de consumo NVIDIA de 24 GB; sí en Macs de gama alta con memoria unificada.
- **Opciones de despliegue**: MLX (formato nativo del repo), servidor MLX-nativo de Anthropic-API del proyecto Claude Code Local. No compatible directamente con vLLM, llama.cpp, Ollama o TGI sin reconversión.
- **Latencia y throughput**: el autor reporta que en Snake fue 8× más lento que Qwen3-Coder-30B y consumió ~7× más tokens para el mismo resultado. No hay cifras absolutas de tokens/s publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (4-bit MLX) | ~80B | ~3B | no disponible | Apache 2.0 | Deprecado, no usar |
| Qwen3-Coder-30B-A3B-Instruct | ~30B | ~3B | no disponible | Apache 2.0 | Recomendado por el autor |
| Qwen3-Coder-Next (base) | ~80B | ~3B | no disponible | Apache 2.0 | Disponible |
| Huihui-Qwen3-Coder-Next-Opus-4.6-Reasoning-Distilled-abliterated | ~80B | ~3B | no disponible | Apache 2.0 | Origen de esta conversión |

El autor recomienda explícitamente Qwen3-Coder-30B-A3B-Instruct como alternativa: menor tamaño, mayor velocidad, mayor tasa de finalización y mejor resultado en la tarea de razonamiento dura (16/18 frente a 0/18).

## Limitaciones y advertencias

- **Modelo deprecado por su autor**: la model card incluye los tags `deprecated`, `do-not-use` y `cautionary-tale`, y el texto recomienda no descargarlo.
- **Fallo en tareas de código reales**: 0/18 en el parser de expresiones, sin código generado en varias tareas one-shot.
- **Fallo en modo agéntico**: no invoca herramientas, no escribe ficheros y declara tareas completadas sin ejecutarlas.
- **Sobre-generación de razonamiento**: agota el presupuesto de tokens en bloques `<think>` sin cerrar la respuesta.
- **Rendimiento degradado**: 8× más lento y ~7× más tokens que un modelo de 30B para el mismo resultado en las pruebas del autor.
- **Abliteration**: elimina los rechazos del alineamiento, lo que incrementa el riesgo de contenido no filtrado en usos no controlados.
- **Idiomas no documentados**: no hay información sobre cobertura multilingüe.
- **Contexto no documentado**: no se especifica la longitud de ventana.
- **Formato MLX**: no desplegable directamente en stacks NVIDIA estándar sin reconversión.
- **Licencia Apache 2.0**: permite uso comercial según la licencia, pero el estado funcional del modelo lo desaconseja en cualquier entorno de producción.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-Coder-Next-Opus-4.6-Reasoning-Distilled-abliterated-4bit-mlx
- Modelo de origen: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-Next-Opus-4.6-Reasoning-Distilled-abliterated
- Repositorio Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
