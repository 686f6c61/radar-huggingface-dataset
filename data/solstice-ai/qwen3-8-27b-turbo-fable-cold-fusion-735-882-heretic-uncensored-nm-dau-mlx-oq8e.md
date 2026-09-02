# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e

## Resumen

Este repositorio contiene una cuantización mixta de 8 bits (oQ8e-mtp) en formato MLX del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un fine-tune de Qwen3.8-27B. La versión publicada por Solstice-AI está optimizada específicamente para Apple Silicon (chips M1 a M5) mediante el runtime Anvil o MLX-LM, aprovechando la memoria unificada y la aceleración Metal. El objetivo es ofrecer una ejecución rápida y eficiente de un modelo de 27 000 millones de parámetros en equipos Mac, manteniendo un rendimiento cercano al de la versión sin cuantizar.

El modelo base Qwen3.8-27B es un transformer denso híbrido con atención lineal en 48 de sus 64 capas, una cabeza de predicción multi-token (MTP) integrada y una ventana de contexto nativa de 262 144 tokens. La cuantización oQ8e-mtp conserva las capas más sensibles (atención y proyecciones recurrentes GDN) a mayor precisión, mientras optimiza las redes feed-forward para maximizar la velocidad de generación. Esta ficha cubre exclusivamente la variante MLX de 8 bits, no el modelo original ni otras cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (transformer denso híbrido, atención lineal en 48/64 capas, MTP) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ8e-mtp (8-bit mixto); el repo solo incluye esta variante |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal en 48 de sus 64 capas con atención completa en las restantes, lo que reduce el coste computacional en secuencias largas. Incluye una cabeza de predicción multi-token (MTP) que actúa como modelo draft para decodificación especulativa, acelerando la generación sin perder calidad. El fine-tune de DavidAU aplica los métodos "Cold Fusion" y "Fable Fusion" (según la información disponible), que reducen significativamente los tokens de pensamiento en los modos de razonamiento y mejoran el rendimiento en tareas de código y razonamiento.

La cuantización oQ8e-mtp de Solstice-AI mantiene las matrices de atención y las proyecciones recurrentes GDN a mayor profundidad de bits, mientras cuantiza las redes feed-forward a 8 bits. Según la model card, esta estrategia logra una velocidad de generación 1,45 veces superior a la línea base BF16, con una pérdida mínima en precisión (MMLU 87,0 % frente a 87,3 %). El entrenamiento de la cuantización no se detalla; se asume que es una conversión post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés y chino.
- Razonamiento matemático y lógico, con soporte para modos de pensamiento (thinking mode) heredados del modelo base.
- Generación de código y asistencia en programación, etiquetado como "agentic-coding" en los metadatos.
- Multi-token prediction (MTP) para decodificación especulativa, que acelera la generación sin intervención del usuario.
- Ventana de contexto de 262 144 tokens, adecuada para documentos largos y conversaciones extensas.
- Compatibilidad con servidores OpenAI-compatible a través de `mlx_lm.server` o Anvil.
- No se menciona soporte de visión en este repositorio; el pipeline es exclusivamente text-generation.

## Casos de uso

- Asistente de programación en Mac: el modelo puede autocompletar código, generar funciones y explicar fragmentos en editores como VS Code o Neovim, gracias a su optimización para Apple Silicon y su capacidad de razonamiento.
- Agente conversacional con contexto largo: con 262 144 tokens de ventana, puede mantener conversaciones de muchas vueltas sin perder el hilo, ideal para chatbots de soporte o asistentes personales.
- Procesamiento de documentos extensos: permite resumir, extraer información o responder preguntas sobre libros, informes o contratos completos en una sola pasada, sin necesidad de dividir el texto.
- Servidor de inferencia local: mediante `mlx_lm.server` o Anvil, se puede desplegar un endpoint OpenAI-compatible para integrarlo en aplicaciones propias o pipelines de CI/CD.
- Investigación en razonamiento matemático: su rendimiento en MMLU y HumanEval lo hace útil para experimentos de evaluación de modelos en entornos sin GPU NVIDIA.
- Generación de código en producción: la velocidad 1,45x respecto a BF16 y el soporte de MTP permiten usarlo en entornos donde la latencia es crítica, siempre que se acepte la dependencia de hardware Apple.

## Benchmarks y rendimiento

La model card del repositorio proporciona resultados para la cuantización oQ8e-mtp comparados con la línea base BF16:

| Precision | MMLU | MMLU_Pro | HumanEval (Python) | Velocidad relativa |
| :--- | :---: | :---: | :---: | :---: |
| BF16 (sin cuantizar) | 87,3 % | 68,7 % | 89,0 % | 1,00x |
| oQ8e-mtp (8-bit mixto) | 87,0 % | 68,7 % | 89,6 % | 1,45x |

No se han publicado resultados de benchmarks adicionales en la información disponible. El modelo base (DavidAU) reporta puntuaciones ARC-C de 735 y ARC-E de 880 en 8 bits, pero estos datos no corresponden a esta cuantización específica y no se incluyen en la tabla.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3, M4 o M5) con memoria unificada; el modelo requiere al menos 32 GB de RAM para una ejecución cómoda (el repositorio ocupa 30 GB).
- GPU integrada Metal; no requiere GPU dedicada externa.
- VRAM estimada: aproximadamente 28 GB para los pesos en 8 bits, más overhead de contexto y caché KV. En la práctica, un Mac con 32 GB puede ejecutarlo, aunque con contexto máximo se recomiendan 64 GB.
- Opciones de despliegue: Anvil (runtime de Solstice-AI), MLX-LM (Python), servidor OpenAI-compatible.
- Latencia y throughput: la model card indica una velocidad 1,45x respecto a BF16, pero no proporciona valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,78 B | 262 144 | BF16 | Apache 2.0 | Multiplataforma (CUDA, etc.) |
| Este modelo (oQ8e-mtp) | 27,78 B | 262 144 | 8-bit mixto MLX | Apache 2.0 | Apple Silicon |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion (base) | 27,78 B | 262 144 | BF16 (y GGUF) | Apache 2.0 | Multiplataforma |

La principal diferencia frente al modelo original es la optimización para Apple Silicon y la cuantización mixta, que reduce el uso de memoria y aumenta la velocidad en ese hardware. Frente al modelo base de DavidAU, este repo añade la capa MLX y la cuantización oQ8e, pero no introduce cambios en los pesos del modelo subyacente.

## Limitaciones y advertencias

- Solo se garantiza soporte para inglés y chino; otros idiomas pueden funcionar pero no están validados.
- El nombre "Heretic-Uncensored" sugiere que el modelo puede no incluir filtros de seguridad estándar, lo que implica riesgo de generar contenido inapropiado o dañino.
- La cuantización introduce una ligera degradación en MMLU (87,0 % frente a 87,3 %) y puede afectar a tareas muy sensibles a la precisión numérica.
- No se ha verificado el soporte de tool calling o function calling en esta variante; aunque el modelo base de Qwen3.8 lo incluye, no está documentado en este repositorio.
- Dependencia exclusiva de Apple Silicon; no es ejecutable en GPUs NVIDIA o AMD sin conversión previa.
- No se dispone de información sobre sesgos, alucinaciones o comportamiento en dominios específicos; se recomienda evaluar antes de usar en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ8e
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha de Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Runtime Anvil: https://github.com/Solstice-Labs/anvil
- Sitio web de Solstice-AI: https://solstice-ai.co
