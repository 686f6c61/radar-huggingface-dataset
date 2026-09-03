# Solstice-AI/Qwen3.8-27B-Uncensored-mlx-6Bit

## Resumen

`Solstice-AI/Qwen3.8-27B-Uncensored-mlx-6Bit` es una cuantización MLX de 6 bits del modelo `orcarouter/Qwen3.8-27B-Uncensored`, una versión ablacionada (abliterated) del Qwen 3.8 27B de Alibaba. El modelo original ha sido modificado para eliminar los vectores de dirección de rechazo mediante ortogonalización de pesos, sin necesidad de reentrenamiento. Esto produce un modelo sin mecanismos de censura, manteniendo intactas las capacidades de razonamiento, matemáticas, generación de código y uso de herramientas.

La cuantización en MLX 6-bit affine, con `group_size` de 64 y modo affine, reduce el peso del modelo de aproximadamente 54 GB a 21.8 GB, preservando según el autor el 99.2% del rendimiento del modelo BF16. La ventana de contexto nativa es de 262.144 tokens (262K). El modelo está optimizado para ejecutarse en Apple Silicon mediante el runtime Anvil de Solstice Labs o con `mlx-lm`, alcanzando velocidades de generación de 48 a 62 tokens por segundo según el hardware.

Al ser un modelo vision-language, el pipeline declarado es `image-text-to-text`, por lo que soporta entrada multimodal. Su licencia Apache 2.0 permite uso comercial, y los idiomas soportados son inglés y chino. Este modelo está pensado para aplicaciones de ciberseguridad, red-teaming, auditoría de sistemas y automatización avanzada, donde la ausencia de filtros morales es un requisito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa) según documentación del modelo base; cuantización MLX 6-bit affine |
| Parametros totales | 26.895.993.856 (26.9B) según safetensors; el README declara 27.5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | MLX 6-bit affine (group_size 64, mode affine) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards), MLX 6-bit |

## Arquitectura y entrenamiento

El modelo base `orcarouter/Qwen3.8-27B-Uncensored` se construye sobre la arquitectura Qwen 3.8 27B, descrita como un transformer denso con atención híbrida que combina capas de Gated DeltaNet lineal con capas de atención completa. Es un modelo nativo vision-language, con soporte de tool calling y una cabeza de decodificación especulativa MTP (Multi-Token Prediction). La información disponible no detalla el proceso de entrenamiento del modelo base ni la composición de los datos.

La modificación principal es la ablación de los vectores de dirección de rechazo. OrcaRouter aisló las direcciones de rechazo en los streams residuales intermedios y ortogonalizó los pesos, eliminando permanentemente los preámbulos moralizantes y los disparadores de rechazo sin afectar el conocimiento del dominio. La cuantización posterior a 6 bits en formato MLX affine, con `group_size` de 64, comprime el modelo de ~54 GB a ~21.8 GB, manteniendo según el autor el 99.2% del rendimiento del modelo sin cuantizar. No se mencionan procesos de RLHF o DPO específicos para esta versión.

## Capacidades

- Generación de texto, razonamiento lógico, derivación matemática y generación de código.
- Soporte de tool calling / function calling, según la documentación del modelo base.
- Capacidades de agente y razonamiento multi-paso.
- Entrada multimodal (visión) gracias al pipeline `image-text-to-text`.
- Contexto extendido de 262K tokens, apto para análisis de repositorios completos y auditoría de código.
- Sin mecanismos de rechazo: el modelo responde sin filtros morales, adecuado para red-teaming y ciberseguridad.
- Ejecución nativa en Apple Silicon mediante Metal, con decodificación especulativa MTP en el modelo base.
- Multilingüe en inglés y chino.

## Casos de uso

- Red-teaming y pruebas de penetración: el modelo genera contenido ofensivo sin restricciones morales, permitiendo simular ataques y evaluar defensas de forma realista.
- Auditoría de seguridad de código: la ventana de 262K tokens permite escanear repositorios completos en una sola pasada, identificando vulnerabilidades en múltiples ficheros.
- Análisis de malware y scripts ofensivos: la ausencia de filtros facilita la generación y análisis de payloads, exploits y scripts de ciberseguridad.
- Investigación en seguridad ofensiva: automatiza la creación de casos de prueba y la exploración de vectores de ataque en entornos controlados.
- Asistente técnico sin restricciones: desarrolladores e investigadores pueden obtener respuestas directas sobre temas sensibles o técnicos sin preámbulos moralizantes.
- Despliegue local en Apple Silicon: gracias a la cuantización MLX y al runtime Anvil, el modelo se ejecuta eficientemente en Macs con 32GB o más de RAM unificada, con API compatible con OpenAI.
- Análisis multimodal: el pipeline `image-text-to-image` permite describir capturas de pantalla, diagramas o imágenes de sistemas para tareas de documentación o análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la cuantización 6-bit preserva el 99.2% del rendimiento del modelo BF16, pero no se aportan valores concretos de métricas como MMLU, HumanEval o GSM8K. Los únicos datos de rendimiento disponibles son de velocidad de generación en hardware Apple Silicon:

| Hardware | RAM unificada | Contexto asignado | Velocidad de generación |
|---|---|---|---|
| Apple M4 Max (128 GB) | 128 GB | 64K–131K tokens | ~62 tok/s |
| Apple M3 Max (64 GB / 96 GB) | 64–96 GB | 32K–64K tokens | ~55 tok/s |
| Apple M2 Ultra (64 GB / 192 GB) | 64–192 GB | 64K–131K tokens | ~58 tok/s |
| Apple M3 Pro / M4 Pro (36 GB / 48 GB) | 36–48 GB | 16K–32K tokens | ~42 tok/s |
| Apple Mac (24 GB) | 24 GB | 4K–8K tokens | ~36 tok/s |

## Requisitos de hardware

- RAM unificada estimada: ~22.2 GB para 8K de contexto, ~24.8 GB para 32K de contexto, según la model card.
- GPU recomendadas: no aplica. El modelo está optimizado para Apple Silicon con memoria unificada (M1/M2/M3/M4/M5 Pro, Max, Ultra).
- Compatibilidad con GPU de consumo: no disponible; no es compatible con GPUs NVIDIA o AMD, solo con Apple Silicon.
- Opciones de despliegue: Anvil Engine (recomendado), `mlx-lm` (CLI y servidor REST), y API OpenAI-compatible mediante `anvil serve` o `mlx_lm.server`.
- Latencia y throughput: 48–62 tokens por segundo en Apple Silicon de gama alta, según la tabla anterior.
- Requisitos mínimos: Mac con 24 GB de RAM unificada para contextos cortos; se recomiendan 32 GB o más para uso fluido.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría en la información proporcionada. Se puede comparar con el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Tamano | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| orcarouter/Qwen3.8-27B-Uncensored (BF16) | 27.5B | 262K | ~54 GB | 100% (referencia) | Apache 2.0 | HuggingFace, Ollama |
| Solstice-AI/Qwen3.8-27B-Uncensored-mlx-6Bit | 26.9B (safetensors) | 262K | ~21.8 GB | 99.2% del BF16 | Apache 2.0 | HuggingFace (MLX) |

Existen otras cuantizaciones del mismo modelo base disponibles en Ollama, desde 2-bit hasta 8-bit, pero no se han comparado en esta ficha.

## Limitaciones y advertencias

- Al estar ablacionado (uncensored), el modelo puede generar contenido dañino, ilegal o éticamente problemático. Su uso debe limitarse a fines legítimos como red-teaming, auditoría o investigación en entornos controlados.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en temas técnicos o de seguridad.
- Soporte de idiomas limitado a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de las consecuencias del contenido generado.
- Requiere hardware Apple Silicon con suficiente RAM unificada; no es desplegable en GPUs convencionales.
- La cuantización 6-bit puede degradar ligeramente la calidad en comparación con el modelo BF16, aunque el autor estima una pérdida del 0.8%.
- No se dispone de información sobre sesgos específicos ni de evaluaciones de seguridad publicadas.

## Enlaces

- HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-Uncensored-mlx-6Bit
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Anvil Engine: https://github.com/Solstice-Labs/anvil
- Página de Ollama del modelo base: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
