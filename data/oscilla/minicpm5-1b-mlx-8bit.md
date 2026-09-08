# Oscilla/MiniCPM5-1B-mlx-8Bit

## Resumen

Oscilla/MiniCPM5-1B-mlx-8Bit es una conversión en formato MLX con cuantización de 8 bits del modelo openbmb/MiniCPM5-1B, un modelo de lenguaje compacto de 1.080 millones de parámetros desarrollado por OpenBMB. Esta adaptación, creada por el usuario Oscilla mediante mlx-lm 0.31.2, está pensada para ejecutarse de forma nativa en dispositivos Apple Silicon, ofreciendo una alternativa ligera para asistentes locales y aplicaciones de edge AI.

El modelo base MiniCPM5-1B es el primer checkpoint de la serie MiniCPM5 y está diseñado para asistentes locales, agentes de codificación, flujos de trabajo con tool calling y escenarios de razonamiento donde se prefiere un modelo compacto. Según la documentación de OpenBMB, mantiene una huella de despliegue pequeña, soporte nativo de contexto largo y modos de chat Think / No Think a través del mismo checkpoint. La conversión MLX conserva estas capacidades, aunque limitadas al ecosistema de Apple Silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tipo Llama, según metadatos) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (etiquetado como long-context en los metadatos) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversión MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder de tipo Llama, según los metadatos del repositorio. No se dispone de información detallada sobre el número de capas, cabezas de atención o dimensiones ocultas. El modelo es denso, no utiliza mezcla de expertos (MoE), y su tamaño total es de 1.080.632.832 parámetros.

Los datasets citados en la model card son openbmb/Ultra-FineWeb, openbmb/Ultra-FineWeb-L3, openbmb/UltraData-Math y openbmb/UltraData-SFT-2605. Esto sugiere una combinación de datos web filtrados, corpus matemáticos y ajuste fino supervisado, aunque no se especifica la cantidad de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La documentación del modelo base menciona modos Think / No Think, lo que indica un entrenamiento orientado a razonamiento explícito, pero no se aportan más detalles técnicos sobre este proceso.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modos Think / No Think: el modelo puede generar cadenas de razonamiento explícitas o respuestas directas según la configuración.
- Soporte de tool calling / function calling, según los metadatos del repositorio.
- Uso como agente de codificación, con integración documentada en herramientas como Cursor, Claude Code y Codex.
- Contexto largo, según los metadatos del modelo base.
- Despliegue en dispositivos locales con Apple Silicon, NVIDIA GPU o CPU, aunque la conversión MLX está optimizada para Apple Silicon.
- Personalización mediante LoRA, según la documentación del modelo base.
- No se han documentado capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Asistente local en macOS: el modelo puede ejecutarse con mlx-lm en Mac con Apple Silicon, ofreciendo respuestas sin conexión y baja latencia para consultas personales o profesionales.
- Agente de codificación en IDE: puede integrarse en Cursor, Claude Code o Codex para tareas de generación, refactorización y explicación de código, aprovechando su soporte de tool calling.
- Automatización de tareas con tool calling: desplegado en un pipeline, el modelo puede invocar funciones externas como APIs, consultas a bases de datos o scripts, para resolver solicitudes de forma autónoma.
- Asistente bilingüe en/zh: atención al cliente o soporte técnico en inglés y chino, con capacidad para mantener conversaciones multi-turno gracias al contexto largo.
- Razonamiento en dispositivos edge: en un mini PC o dispositivo móvil con recursos limitados, el modo Think permite abordar tareas de lógica, planificación y análisis paso a paso.
- Mascota virtual de escritorio: siguiendo el ejemplo de OpenBMB MiniCPM-Desk-Pet, el modelo puede usarse como base para un asistente interactivo de escritorio que reacciona a comandos del usuario y soporta perfiles personalizados mediante LoRA.
- Análisis de documentos extensos: gracias al contexto largo, puede resumir o extraer información de textos largos en inglés o chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización 8-bit de un modelo de 1.080.632.832 parámetros, el peso ocupa aproximadamente 1,1 GB (según el tamaño del repositorio). En Apple Silicon se utiliza memoria unificada; se recomienda un dispositivo con al menos 8 GB de RAM para un uso fluido.
- GPU recomendadas: no disponible específicamente para esta conversión. El modelo base openbmb/MiniCPM5-1B puede ejecutarse en Apple Silicon, NVIDIA GPU y CPU, según la documentación de OpenBMB.
- ¿Cabe en GPU de consumo? Sí, un modelo de 1B en 8-bit cabe en tarjetas con 4 GB o más. Sin embargo, esta conversión MLX está orientada a Apple Silicon; para NVIDIA o CPU se debe usar el modelo base en formato Transformers.
- Opciones de despliegue: mlx-lm (recomendado para esta conversión), y el modelo base con la librería transformers. No se menciona soporte para vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para realizar una comparativa cuantitativa. Como alternativas de la misma categoría (modelos de 1B) se pueden considerar Llama-3.2-1B, Qwen2.5-1.5B y Gemma-2-2B, pero no se han encontrado resultados comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han documentado evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar contenido plausible pero incorrecto, especialmente en tareas complejas o de razonamiento profundo.
- Limitaciones de idioma: solo inglés y chino; no se ha verificado el rendimiento en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base y sus dependencias.
- La conversión MLX es una adaptación no oficial realizada por un tercero; puede haber diferencias de comportamiento respecto al modelo original.
- El modelo no es multimodal; no procesa imágenes ni audio.

## Enlaces

- https://huggingface.co/Oscilla/MiniCPM5-1B-mlx-8Bit
- https://huggingface.co/openbmb/MiniCPM5-1B
- https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- https://github.com/OpenBMB/MiniCPM
