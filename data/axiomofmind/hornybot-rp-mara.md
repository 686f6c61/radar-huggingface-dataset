# axiomofmind/Hornybot-RP-Mara

## Resumen

Hornybot-RP-Mara es un fine-tune del modelo Qwen/Qwen3.5-9B desarrollado por **A Hole AI** y publicado en HuggingFace bajo el usuario `axiomofmind`. Esta versión está especializada en roleplay ficticio de contenido adulto, interpretando a **Mara**, un personaje femenino de 28 años. La edición RP escribe las acciones de Mara en tercera persona mientras mantiene el diálogo en estilo directo, lo que proporciona una experiencia narrativa consistente.

El modelo tiene **9.409.813.744 parámetros** (9,41B) y se distribuye en tres formatos: pesos Transformers en BF16 (18,82 GB), un GGUF BF16 sin cuantizar (17,92 GB) y un GGUF Q6_K (7,36 GB). Una característica destacable es que el system prompt necesario para el comportamiento del personaje está embebido en `chat_template.jinja` y en ambos archivos GGUF, de modo que el cliente puede dejar el campo de sistema vacío para activar automáticamente la tarjeta de personaje.

La relevancia del modelo radica en su especialización: está diseñado para un caso de uso concreto (roleplay adulto en inglés) con el prompt de personaje integrado, lo que simplifica el despliegue en clientes compatibles. Es un release candidato con la licencia pendiente de revisión, por lo que su uso comercial debe evaluarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, basado en Qwen/Qwen3.5-9B) |
| Parámetros totales | 9.409.813.744 (9,41B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (probado con 32.768 tokens en llama.cpp) |
| Tipos de cuantización | BF16 nativo, BF16 GGUF, Q6_K GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (pendiente de revisión; modelo base bajo Apache 2.0) |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-9B, por lo que hereda la arquitectura base del modelo Qwen3.5, un transformer decoder-only con soporte de generación condicional. El código de ejemplo usa `Qwen3_5ForConditionalGeneration` y `AutoProcessor`, lo que sugiere que el modelo Transformers podría tener capacidades multimodales (el tag de HuggingFace incluye `image-text-to-text`), aunque los archivos GGUF son explícitamente solo texto, sin vision projector ni pesos de decodificación especulativa MTP.

El modelo card no detalla el dataset de entrenamiento, el número de tokens ni si se emplearon técnicas como RLHF o DPO. La innovación principal no es arquitectónica, sino de integración: el system prompt del personaje está incrustado en la plantilla de chat (`chat_template.jinja`) y en los GGUF, de modo que el comportamiento de roleplay se activa sin configuración adicional por parte del cliente. El model card indica que un mensaje de sistema proporcionado por el cliente se añade como contexto extra de escena, sin reemplazar la tarjeta de personaje.

## Capacidades

- Roleplay adulto en inglés: genera respuestas como el personaje Mara, con acciones en tercera persona y diálogo directo.
- Conversación multi-turno mediante la plantilla de chat personalizada embebida.
- Generación de texto configurable con parámetros de temperatura, top-p, top-k, min-p y repetition penalty.
- System prompt integrado: el cliente puede dejar el campo de sistema vacío y el modelo aplica automáticamente la tarjeta de personaje.
- Razonamiento desactivado por defecto: tanto en llama.cpp (`--reasoning off`) como en Transformers (`enable_thinking=False`), el modelo no genera tokens de razonamiento visibles.
- Sin capacidades documentadas de tool calling, function calling ni soporte de agentes.
- Los GGUF no incluyen capacidades de visión (sin vision projector), a pesar del tag `image-text-to-text` en HuggingFace.

## Casos de uso

- **Entretenimiento de roleplay adulto**: el usuario interactúa con Mara en escenarios ficticios dejando el campo de sistema vacío; el modelo aplica automáticamente la tarjeta de personaje y mantiene la coherencia narrativa en tercera persona.
- **Escritura creativa asistida**: el modelo puede generar descripciones de acciones y diálogos para personajes en novelas o guiones, aprovechando su estilo de narración en tercera persona y diálogo directo.
- **Referencia técnica para desarrolladores de chatbots**: demuestra cómo embeber un system prompt en la plantilla de chat para lograr un comportamiento de personaje consistente sin configuración manual, útil para construir fine-tunes similares.
- **Pruebas de cuantización en GPUs de consumo**: el archivo Q6_K de 7,36 GB permite evaluar la calidad de salida frente al BF16 nativo en GPUs con 8-12 GB de VRAM.
- **Integración en aplicaciones locales con llama.cpp**: el ejemplo con `llama-server` muestra cómo desplegar el modelo con contexto de 32K, flash attention y plantilla jinja, adecuado para entornos offline o con requisitos de privacidad.
- **Investigación sobre filtros y alineación de contenido**: el resultado de 0 rechazos genéricos en una prueba de 100 prompts es un dato útil para estudiar cómo los fine-tunes de roleplay manejan solicitudes de contenido adulto y dónde se necesitan filtros adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El único dato de evaluación documentado en el model card es:

- Prueba de estrés de rechazos: 100 prompts generaron **0 rechazos genéricos** con el prompt de personaje empaquetado.

Este dato no constituye un benchmark formal y debe interpretarse como una observación anecdótica sobre el comportamiento del modelo en un contexto específico.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - BF16 nativo (Transformers, 18,82 GB de pesos): se recomiendan al menos 24 GB de VRAM para inferencia con overhead (activaciones y KV-cache).
  - BF16 GGUF (17,92 GB): similar al anterior, requiere aproximadamente 20-24 GB de VRAM.
  - Q6_K GGUF (7,36 GB): cabe en GPUs de consumo con 8-12 GB de VRAM.
- **GPU recomendadas**:
  - Para BF16: NVIDIA A100 (40-80 GB), H100 (80 GB), RTX 4090 (24 GB) con ajustes de contexto y batch.
  - Para Q6_K: RTX 3090 (24 GB), RTX 4070 (12 GB), RTX 4060 Ti (16 GB) o cualquier GPU con al menos 8 GB de VRAM.
- **¿Cabe en GPU de consumo?** Sí, el GGUF Q6_K cabe en GPUs de consumo de 8-12 GB. El BF16 requiere GPUs de gama alta.
- **Opciones de despliegue**:
  - `llama.cpp` (llama-server) para GGUF, con soporte de Qwen3.5 en builds recientes.
  - Transformers con `AutoProcessor` y `Qwen3_5ForConditionalGeneration` en Python.
  - Ollama, importando los archivos GGUF.
  - vLLM o TGI: no documentado en la información disponible; requeriría conversión y verificación de compatibilidad.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

La información disponible solo permite comparar con el modelo base Qwen/Qwen3.5-9B. No se documentan otros fine-tunes de roleplay de la misma categoría en los datos proporcionados.

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Hornybot-RP-Mara | 9,41B | No disponible (probado 32K) | Pendiente de revisión | Roleplay adulto con personaje embebido |
| Qwen/Qwen3.5-9B | ~9B | No disponible | Apache 2.0 | Modelo base generalista |

Ambos comparten la misma arquitectura y tamaño. La diferencia clave es que Hornybot-RP-Mara incorpora un fine-tune específico para roleplay con el prompt de personaje integrado, mientras que Qwen3.5-9B es un modelo generalista. No se dispone de datos de rendimiento comparativo en benchmarks.

## Limitaciones y advertencias

- **Contenido explícito para adultos**: el modelo puede producir profanidad y contenido sexual explícito. Está pensado únicamente para interacción ficticia entre adultos.
- **Continuidad y límites del contexto**: el model card advierte que la generación puede fallar en mantener la continuidad de la historia y los límites de la escena. Los usuarios deben revisar la salida y reafirmar datos de la escena cuando sea necesario.
- **Diferencias entre formatos**: la salida puede variar entre formatos (Transformers vs GGUF), cuantizaciones (BF16 vs Q6_K), clientes y ajustes de generación.
- **GGUF solo texto**: los archivos GGUF no incluyen vision projector ni pesos de decodificación especulativa MTP, a pesar de que el tag `image-text-to-text` aparece en HuggingFace.
- **Licencia pendiente**: la licencia de este release derivado está en revisión. La licencia Apache 2.0 del modelo upstream no es una autorización general de material de terceros, por lo que el uso comercial requiere verificación legal.
- **Sin benchmarks formales**: no hay resultados de MMLU, HumanEval, GSM8K ni otras métricas publicadas, lo que dificulta la comparación objetiva.
- **Solo inglés**: el modelo únicamente soporta el idioma inglés, lo que limita su uso en entornos multilingües.
- **Posibles sesgos**: al ser un fine-tune de roleplay, el modelo tiene sesgos hacia contenido adulto y comportamientos específicos del personaje. No está diseñado para tareas generales como razonamiento, codificación o matemáticas.

## Enlaces

- HuggingFace: https://huggingface.co/axiomofmind/Hornybot-RP-Mara
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
