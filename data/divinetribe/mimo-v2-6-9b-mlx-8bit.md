# divinetribe/MiMo-V2.6-9B-MLX-8bit

## Resumen

MiMo-V2.6-9B-MLX-8bit es una cuantización a 8 bits en formato MLX del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario divinetribe. El modelo original lo desarrolla el equipo MiMo de Xiaomi mediante ajuste supervisado (SFT) sobre Qwen3.5-9B, empleando datos generados por MiMo que cubren programación, tareas de agente generales, codificación visual y ciberseguridad. Esta conversión concreta no modifica los pesos más allá de la cuantización: mantiene intacta la torre de visión para que el modelo pueda leer imágenes y escribir código en Apple Silicon.

Arquitectónicamente es un modelo multimodal de tipo `Qwen3_5ForConditionalGeneration`, con una torre de visión `qwen3_5_vision` que alimenta el decodificador de texto `qwen3_5_text`, y un total de 9.409.813.744 parámetros (9,4B). La cuantización emplea 8,864 bits por peso, grupo de tamaño 64 y dos shards, con un peso total de 9,7 GB; el repositorio ocupa 10,4 GB. Está pensado para máquinas con 16 GB de memoria unificada, aproximadamente la mitad del tamaño de la versión bf16, que es la que conserva la calidad completa.

Su relevancia actual radica en que permite ejecutar un modelo agéntico de 9B con capacidad de visión de forma nativa en Apple Silicon mediante `mlx-vlm`, sin depender de CUDA ni de servicios en la nube. El modelo base obtiene 61,1 (avg@3) en SWE-bench Verified según el informe técnico de MiMo-V2.6, por delante de los 60,0 de su base Qwen3.5-9B, lo que lo sitúa como una opción competitiva para tareas de agente de código en local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (torre de visión `qwen3_5_vision` + decodificador de texto `qwen3_5_text`) |
| Parámetros totales | 9.409.813.744 (9,4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits MLX (8,864 bits por peso, group size 64); existe versión bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, dos shards) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal: una torre de visión `qwen3_5_vision` procesa las imágenes y alimenta un decodificador de texto `qwen3_5_text`, ambos bajo la clase `Qwen3_5ForConditionalGeneration` heredada de Qwen3.5. El checkpoint fuente es XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, construido por el equipo MiMo de Xiaomi mediante ajuste supervisado sobre Qwen3.5-9B con datos generados por MiMo que abarcan programación, tareas de agente generales, codificación visual y ciberseguridad. El informe técnico asociado se titula *MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement* (Xiaomi MiMo Team, 2026).

Esta publicación concreta es únicamente una cuantización a 8 bits en MLX con grupo de tamaño 64 y la torre de visión preservada; no se ha realizado ningún otro trabajo sobre los pesos. Según la model card, en una prueba cualitativa de lectura de pose sobre un fotograma real, la versión de 8 bits produjo una respuesta idéntica a la de bf16, lo que sugiere que la compresión mantuvo la calidad en esa comprobación. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO en el checkpoint fuente.

## Capacidades

- Generación de texto y razonamiento general sobre el decodificador `qwen3_5_text`.
- Generación de código y tareas de agente de programación, con resultados reportados en SWE-bench Verified.
- Comprensión de imágenes mediante la torre de visión: descripción de contenido visual, lectura de capturas de pantalla y conversión de estas a código.
- Generación de texto alternativo (alt-text) para imágenes de producto e interfaces de usuario.
- Codificación visual (visual coding): interpretar una imagen y producir código a partir de ella.
- Tareas de ciberseguridad, según los datos de entrenamiento del checkpoint fuente.
- Soporte multimodal image-text-to-text a través del pipeline declarado.
- Uso en modo solo texto mediante `num_images=0` y sin argumento `image` en `mlx-vlm`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Agente de código en local sobre Apple Silicon: el modelo puede ejecutarse con `mlx-vlm` en un Mac con 16 GB de memoria unificada y resolver tareas de modificación de repositorios, apoyándose en su rendimiento de 61,1 en SWE-bench Verified del checkpoint fuente para tareas de ingeniería de software reales.
- Control de calidad de pose en aplicaciones de movimiento: tal como documenta la model card, se le puede pasar un fotograma con un avatar superpuesto y preguntar si la pose es anatómicamente correcta, si hay extremidades extra o cruces de rodillas; el modelo responde fundamentándose en los píxeles de la imagen.
- Generación de alt-text para catálogos de producto e interfaces: la torre de visión permite describir imágenes de producto y capturas de UI para cumplir requisitos de accesibilidad sin salir del dispositivo.
- Conversión de capturas de pantalla a código: a partir de una imagen de una interfaz, el modelo puede reconstruir el código correspondiente, útil en flujos de prototipado y migración de diseños.
- Asistente de programación integrado en el IDE o en la terminal: al ejecutarse mediante un servidor local compatible con la API de Anthropic (como el que menciona la model card en el proyecto Claude Code Local), puede actuar como agente de código sin enviar datos a la nube.
- Procesamiento de documentación técnica con imágenes: extraer información de diagramas, capturas y figuras junto con el texto circundante en un mismo flujo multimodal.
- Tareas de análisis en ciberseguridad asistido: el checkpoint fuente se entrenó con datos de ciberseguridad, por lo que puede apoyar la revisión de configuraciones y la explicación de hallazgos, siempre con supervisión humana.

## Benchmarks y rendimiento

Los datos disponibles corresponden al checkpoint fuente MiMo-V2.6-Distill-Qwen-9B, no a esta cuantización de 8 bits; la model card advierte que es esperable un efecto pequeño de la cuantización sobre las puntuaciones exactas.

| Benchmark | MiMo-V2.6-Distill-Qwen-9B | Qwen3.5-9B (base) |
|---|---|---|
| SWE-bench Verified (avg@3) | 61,1 | 60,0 |

Otras métricas del informe técnico (MiMo Code, MiMo Visual Coding, etc.) son conjuntos de evaluación internos de los autores y no un leaderboard externo, por lo que no se presentan aquí como comparables. No se han publicado resultados de benchmarks de esta cuantización de 8 bits en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 9,7 GB de pesos en 8 bits MLX (repositorio de 10,4 GB); requiere un equipo con al menos 16 GB de memoria unificada según la model card.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (la model card apunta a máquinas de 16 GB); no está pensado para GPU NVIDIA por su formato MLX.
- ¿Cabe en GPU de consumo? Sí, en Apple Silicon de 16 GB o más; no aplica a GPU de consumo NVIDIA en este formato.
- Opciones de despliegue: `mlx-vlm` (librería declarada), con integración en servidores locales compatibles con la API de Anthropic como el del proyecto Claude Code Local; vLLM, llama.cpp, Ollama y TGI no están indicados para este formato MLX en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-9B-MLX-8bit (esta ficha) | 9,4B | no disponible | 61,1 (heredado del checkpoint fuente, avg@3) | MIT | MLX 8 bits, 9,7 GB |
| MiMo-V2.6-Distill-Qwen-9B (bf16) | 9,4B | no disponible | 61,1 (avg@3) | MIT | bf16, calidad completa |
| Qwen3.5-9B | 9B | no disponible | 60,0 (avg@3) | no disponible en la información | checkpoint base de Qwen |

La comparación con otras alternativas de la misma categoría (agentes de código de ~9B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 8 bits puede alterar ligeramente las puntuaciones exactas de benchmark respecto al checkpoint bf16; para máxima calidad debe usarse la versión bf16.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente utilizable en GPU NVIDIA ni en servidores x86 convencionales.
- Solo se ha verificado cualitativamente una muestra de visión (pose-match QC) con respuesta idéntica a bf16; no hay una evaluación cuantitativa publicada del efecto de la cuantización en tareas de visión.
- Los benchmarks citados (SWE-bench Verified) corresponden al modelo fuente, no a esta conversión.
- No se dispone de información sobre sesgos conocidos, tasa de alucinación, cobertura de idiomas ni longitud de contexto máxima; deben evaluarse empíricamente antes de usar el modelo en producción.
- Las métricas internas del informe (MiMo Code, MiMo Visual Coding) no son comparables con leaderboards externos y no deben citarse como tales.
- La licencia MIT del checkpoint fuente permite uso comercial, pero conviene verificar los términos de los componentes heredados de Qwen3.5-9B antes de un despliegue comercial.
- El repositorio tiene un volumen de descargas muy bajo (36) y ninguna valoración, por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-8bit
- Versión bf16: https://huggingface.co/divinetribe/MiMo-V2.6-9B-MLX-bf16
- Checkpoint fuente: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Organización Xiaomi MiMo: https://huggingface.co/XiaomiMiMo
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- SWE-bench: https://www.swebench.com/
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
