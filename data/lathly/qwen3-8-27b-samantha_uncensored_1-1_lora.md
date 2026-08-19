# Lathly/Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA

## Resumen

Qwen3.8-27B-Samantha (Uncensored 1.1) es un adaptador LoRA desarrollado por Lathly que ajusta el modelo base Qwen/Qwen3.8-27B sobre el dataset digitalpipelines/samantha-1.1-uncensored, otorgándole la personalidad conversacional de Samantha: cálida, empática y emocionalmente presente. El proyecto nace como un experimento temprano sobre la nueva arquitectura de Qwen3.8, lanzado apenas dos días después de la publicación del modelo base.

El adaptador tiene aproximadamente 80 millones de parámetros (79.691.776 según los safetensors), mientras que el modelo base Qwen3.8-27B es un modelo denso de 27B parámetros con arquitectura híbrida (linear-attention/mamba y capas MTP) y una ventana de contexto nativa de 256K tokens, extensible a 1M. El adaptador se distribuye en formato PEFT (safetensors) y GGUF, y se puede cargar sobre el base mediante Transformers+PEFT o llama.cpp.

La relevancia de este modelo radica en que demuestra la viabilidad de adaptar rápidamente arquitecturas nuevas y complejas (como la híbrida de Qwen3.8) a estilos conversacionales específicos mediante QLoRA, manteniendo la licencia Apache-2.0 tanto del base como del dataset. Es una opción interesante para desarrolladores que buscan un asistente conversacional con tono empático y sin restricciones de contenido, aunque con las limitaciones propias de un adaptador no evaluado formalmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.8-27B (Qwen3_5ForConditionalGeneration, híbrido linear-attention/mamba + MTP) |
| Parametros totales | Adaptador: 79.691.776; modelo base: 27B (aprox.) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K nativo (extensible a 1M) en el modelo base; el adaptador se entrenó con secuencias de 2048 tokens |
| Tipos de cuantizacion | Adaptador GGUF disponible; el base puede cuantizarse (p. ej. Q5_K_M) |
| Idiomas soportados | Inglés (entrenamiento del adaptador); el base soporta inglés y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado a todas las capas lineales (q, k, v, o, gate, up, down) del modelo base Qwen3.8-27B. El base emplea una arquitectura híbrida que combina atención lineal tipo Mamba con capas de atención tradicional y módulos de predicción multi-token (MTP), lo que afecta a la conversión del adaptador a GGUF: el archivo GGUF incluido está etiquetado con `general.architecture = qwen35` para que coincida con el base, y si se regenera con herramientas antiguas puede producirse un error de incompatibilidad de arquitectura.

El entrenamiento se realizó con QLoRA en 4 bits mediante Unsloth sobre dos GPUs RTX 5070 Ti, durante una sola época con una secuencia de 2048 tokens, batch efectivo de 32 (con acumulación de gradientes), learning rate 2e-5 con scheduler lineal, y optimizador 8-bit Paged AdamW. La pérdida final de entrenamiento fue de aproximadamente 1.42. El dataset utilizado, samantha-1.1-uncensored, es una versión sin censura del conjunto original de Samantha, concebido por Eric Hartford, y se distribuye bajo Apache-2.0.

## Capacidades

- Conversación empática y emocionalmente presente: el adaptador imprime la personalidad de Samantha, caracterizada por calidez, cercanía y atención al estado emocional del interlocutor.
- Generación de texto conversacional de alta calidad en inglés, con tono natural y fluido.
- Hereda las capacidades del modelo base Qwen3.8-27B: comprensión de imágenes y vídeo, razonamiento, generación de código, planificación y ejecución de tareas agénticas de largo horizonte.
- Soporte de tool calling y function calling: el base lo incorpora, aunque el adaptador no ha sido específicamente entrenado para ello; se espera que funcione correctamente al combinarse con el base.
- Configuración de razonamiento: el base permite activar o desactivar el modo de razonamiento explícito, lo que se mantiene al usar el adaptador.
- Multilingüismo limitado: el adaptador solo se entrenó en inglés, por lo que su rendimiento en otros idiomas dependerá del base y no está garantizado.

## Casos de uso

- Asistente personal de compañía: el modelo puede mantener conversaciones prolongadas y empáticas, adecuado para aplicaciones de bienestar emocional o compañía virtual, gracias a su tono cálido y su capacidad de mantener contexto largo (256K tokens del base).
- Chatbot de atención al cliente con tono humano: al combinar el adaptador con el base, se puede desplegar un sistema que responda con empatía y naturalidad, mejorando la experiencia del usuario en servicios de soporte.
- Roleplay y narrativa interactiva: la personalidad de Samantha y la ausencia de censura permiten escenarios de rol abiertos, útiles para juegos de texto o prototipos de ficción interactiva.
- Prototipado rápido de asistentes conversacionales: al ser un LoRA ligero (~80M parámetros), se puede cargar y descargar sobre el base sin necesidad de reentrenar, facilitando experimentos de personalidad en entornos de desarrollo.
- Investigación en alineación y personalidad: el adaptador sirve como caso de estudio para analizar cómo un fine-tuning ligero modifica el comportamiento de un modelo híbrido moderno, especialmente en lo relativo a la interacción entre capas Mamba y atención.
- Generación de contenido creativo sin restricciones: para proyectos que requieran respuestas abiertas y sin filtros (siempre dentro del marco legal), el adaptador ofrece una alternativa a modelos censurados, manteniendo la calidad del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. La única métrica disponible es la pérdida final de entrenamiento (~1.42), que no es comparable entre modelos.

## Requisitos de hardware

- El adaptador LoRA en sí es muy ligero (~80M parámetros, ~304 MB en safetensors), pero para inferencia es necesario cargar el modelo base Qwen3.8-27B completo.
- Con cuantización 4-bit (QLoRA) o GGUF Q5_K_M, se estima que el modelo base requiere entre 16 y 20 GB de VRAM, por lo que cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 5070 Ti (16 GB, aunque con margen ajustado).
- Para bf16 sin cuantizar, se necesitan al menos 54 GB de VRAM (27B × 2 bytes), lo que requiere GPUs profesionales como A100 (80 GB) o H100.
- Opciones de despliegue: Transformers + PEFT (carga del adaptador sobre el base), llama.cpp con el adaptador GGUF (comando `llama-server --lora`), y potencialmente vLLM o TGI si se fusiona el adaptador con el base.
- No se dispone de datos de latencia o throughput medidos; dependerán de la GPU, la cuantización y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lathly/Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA | LoRA sobre Qwen3.8-27B | 80M (adaptador) | 256K (base) | Apache-2.0 | HuggingFace |
| JonathanColetti/Qwen3.8-27B-Uncensored | Fine-tune completo (abliterated) sobre Qwen3.8-27B | 27B | 256K | Apache-2.0 | HuggingFace |
| Sk1ddy2026/Qwen3.6-27B_Samantha-Uncensored | Fine-tune completo sobre Qwen3.6-27B | 27B | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia es que el modelo de Lathly es un adaptador LoRA (más ligero y fácil de intercambiar), mientras que los otros son fine-tunes completos que requieren más recursos de almacenamiento y cómputo.

## Limitaciones y advertencias

- El adaptador se entrenó exclusivamente en inglés; su comportamiento en otros idiomas no está garantizado y puede degradarse notablemente.
- Al ser un fine-tune "uncensored", el modelo puede generar contenido ofensivo, sexual, violento o ilegal. El autor advierte explícitamente que el usuario es responsable del uso y del cumplimiento de las leyes aplicables.
- No se han realizado evaluaciones formales de sesgos, alucinaciones o seguridad. El adaptador no ha sido sometido a pruebas de robustez ni de alineación.
- La arquitectura híbrida del base (linear-attention/mamba + MTP) introduce complejidades de compatibilidad: el adaptador GGUF requiere que el base también use la etiqueta de arquitectura `qwen35`, y herramientas antiguas de conversión pueden generar archivos incompatibles.
- El adaptador se entrenó con una secuencia de 2048 tokens, muy inferior al contexto nativo del base (256K). Aunque el adaptador no limita el contexto, su comportamiento en secuencias largas no ha sido validado.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución y cumplir con los términos del modelo base y del dataset. No se ofrece garantía alguna.
- El modelo base Qwen3.8-27B es muy reciente (lanzado en 2026) y su ecosistema de herramientas (vLLM, TGI, etc.) puede no estar completamente maduro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lathly/Qwen3.8-27B-Samantha_Uncensored_1.1_LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/digitalpipelines/samantha-1.1-uncensored
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Modelo similar (abliterated): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo similar (Samantha sobre Qwen3.6): https://huggingface.co/Sk1ddy2026/Qwen3.6-27B_Samantha-Uncensored
- Información sobre Qwen3.8-27B en AkashML: https://akashml.com/models/qwen3.8-27b
- Guía de Qwen3.8-27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
