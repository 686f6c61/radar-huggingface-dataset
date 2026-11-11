# NukeTorch/Qwen3.8-27B-4bit-DFlash2

## Resumen

Qwen3.8-27B-4bit-DFlash2 es un paquete de distribución publicado por NukeTorch que agrupa, en una sola descarga, dos artefactos complementarios: una cuantización de 4 bits del modelo Qwen3.8-27B (procedente de `mlx-community/Qwen3.8-27B-4bit`) y un modelo borrador para decodificación especulativa (`incoai/Qwen3.8-27B-DFlash2`). El autor no modifica los pesos: se limita a fijar las revisiones concretas con las que se validó el rendimiento de su runtime NukeTorch N1.0.0, de modo que cualquiera pueda reproducir la misma pareja de pesos con un único comando.

El interés del paquete es operativo, no algorítmico: elimina el riesgo de desajuste entre modelo base y modelo borrador, uno de los fallos más habituales al configurar decodificación especulativa en producción. Está orientado explícitamente a Apple Silicon (etiqueta `apple-silicon`) y al servidor `nuketorch-serve`, que expone una API compatible con OpenAI chat completions en el puerto 8080.

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27 000 millones de parámetros desarrollado por el equipo Qwen (Alibaba). La información disponible no detalla la longitud de contexto, la composición del dataset ni los detalles de entrenamiento del modelo base; esta ficha se limita a lo que consta en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); el paquete añade un modelo borrador DFlash2 para decodificación especulativa |
| Parametros totales | 27 000 millones (modelo base, según nomenclatura); parámetros del borrador no disponibles |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (cuantización MLX del modelo base); el borrador DFlash2 se distribuye sin cuantizar según la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (tanto el paquete como los dos artefactos de origen) |
| Formato de pesos | safetensors (repo de 19,9 GB) |

## Arquitectura y entrenamiento

El paquete no introduce cambios en los pesos: combina una cuantización de 4 bits del transformer denso Qwen3.8-27B, producida con el formato MLX de `mlx-community`, con un modelo borrador DFlash2 de `incoai` diseñado para decodificación especulativa. La decodificación especulativa consiste en que el borrador propone varios tokens candidatos por paso y el modelo grande los verifica en paralelo, aceptando el prefijo correcto; el resultado es un aumento de throughput sin alterar la distribución de salida cuando la verificación es exacta.

La model card distingue entre aceptación "típica" (por defecto) y aceptación "exacta", lo que sugiere que el runtime ofrece un modo de verificación estricta que puede reducir la velocidad pero garantiza la coincidencia token a token con la decodificación no especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es un modelo de propósito general; las pruebas del paquete se ejecutaron con "reasoning on", lo que indica soporte de modo de razonamiento.
- Generación de código: el benchmark del autor incluye 16 prompts de programación, lo que confirma uso previsto en tareas de código.
- Conversación multi-turno: una de las pruebas agrupa cinco prompts de demostración como una única conversación con límite de 1024 tokens.
- Servicio compatible con OpenAI chat completions: `nuketorch-serve` expone el endpoint estándar en el puerto 8080.
- Decodificación especulativa con modelo borrador acoplado: capacidad diferencial del paquete.
- Tool calling, function calling, agentes, visión, audio y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en Mac con GPU integrada: el paquete está pensado para Apple Silicon; con 26,7 GB de memoria en contexto por defecto cabe en un equipo de 48 GB como el M5 Max usado en las mediciones, lo que permite servir un modelo de 27B en local sin GPU dedicada.
- Asistencia de código en el editor: los 212,1 tok/s medidos con aceptación típica en 16 prompts de programación hacen viable la generación de fragmentos de código con latencia interactiva en un flujo de autocompletado.
- Chat multi-turno con razonamiento: la prueba de cinco prompts como una sola conversación con 1024 tokens de límite demuestra que el paquete maneja contexto acumulado; útil para asistentes técnicos que necesitan mantener estado entre turnos.
- Sustitución de API en herramientas existentes: al hablar el protocolo de OpenAI chat completions, cualquier cliente compatible (SDKs, frameworks de agentes, interfaces de chat) puede apuntar a `localhost:8080` sin cambios de código.
- Reproducción de benchmarks y evaluación interna: el paquete fija las revisiones exactas de modelo y borrador, de modo que un equipo puede replicar las cifras del autor y comparar configuraciones de hardware sin ambigüedad de versiones.
- Prototipado de pipelines de decodificación especulativa: útil para investigadores que quieran medir la diferencia entre aceptación típica y exacta (203,3 frente a 129,7 tok/s en la prueba de conversación) y decidir qué modo usar en producción.
- Inferencia por lotes pequeña en estación de trabajo: con throughput sostenido superior a 190 tok/s en un solo usuario, sirve para procesar colas de documentos o generar borradores en una máquina individual sin infraestructura de servidor.

## Benchmarks y rendimiento

Mediciones del autor en un M5 Max de 48 GB, un usuario, razonamiento activado, NukeTorch N1.0.0:

| Prueba | Aceptación típica (por defecto) | Aceptación exacta |
|---|---:|---:|
| Cinco prompts de demo como una conversación, límite 1024 tokens, primera pasada (media de 3 pasadas: 200,0) | 203,3 tok/s | no medido |
| Cinco prompts de demo, cada uno como petición nueva, 3 pasadas, sin límite de tokens | 190,8 tok/s | 129,7 tok/s |
| 16 prompts de código, 2 semillas, límite 1024 tokens | 212,1 tok/s | 137,6 tok/s |

Memoria en contexto por defecto: 26,7 GB. El autor indica que el paquete publicado devuelve las mismas respuestas token a token y que sus mejores ejecuciones fueron 197,7, 190,5 y 211,0 tok/s en el orden de la tabla. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 26,7 GB en contexto por defecto, medido en Apple Silicon con memoria unificada.
- Hardware validado: Mac con chip M5 Max y 48 GB de memoria unificada.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; el paquete está etiquetado para Apple Silicon y el runtime distribuido es `macos-arm64`.
- ¿Cabe en GPU de consumo? No hay datos para GPUs discretas; en Apple Silicon requiere al menos ~27 GB de memoria unificada más margen para el borrador y el contexto.
- Despliegue: `nuketorch-serve` (binario `nuketorch-n1.0.0-macos-arm64`), con API OpenAI en el puerto 8080. No consta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 190-212 tok/s con aceptación típica; 129-138 tok/s con aceptación exacta, en las condiciones descritas.
- Latencia: no disponible de forma desagregada (solo throughput agregado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-4bit-DFlash2 (este paquete) | 27B (base) + borrador | no disponible | Apache-2.0 | Hugging Face, runtime NukeTorch para macOS ARM | Incluye borrador acoplado y revisiones fijadas |
| `mlx-community/Qwen3.8-27B-4bit` | 27B | no disponible | Apache-2.0 | Hugging Face | Solo el modelo cuantizado, sin borrador |
| `incoai/Qwen3.8-27B-DFlash2` | no disponible (borrador) | no disponible | Apache-2.0 | Hugging Face | Solo el modelo borrador |
| Qwen3.8-27B sin cuantizar | 27B | no disponible | Apache-2.0 | Hugging Face | Mayor precisión, mayor huella de memoria |

La comparativa con familias alternativas de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El paquete no aporta mejoras de calidad: es una agregación de pesos de terceros con revisiones fijadas. Cualquier limitación del modelo base Qwen3.8-27B se hereda íntegramente.
- La licencia del runtime es restrictiva: NukeTorch N es gratuito para individuos, escuelas, entidades sin ánimo de lucro, proyectos open source no comerciales y empresas con menos de 10 millones de dólares de ingresos y menos de 250 personas. Fuera de esos supuestos se requiere licencia comercial, aunque los pesos en sí son Apache-2.0.
- Dependencia de plataforma: el binario distribuido es `macos-arm64`; no hay evidencia de soporte para Linux, Windows o GPUs NVIDIA.
- El modo de aceptación exacta reduce el throughput aproximadamente un 35 % (de 203,3 a 129,7 tok/s en la prueba de conversación); elegir entre velocidad y garantía de coincidencia token a token es una decisión de producción relevante.
- Las cifras de rendimiento provienen de un único equipo (M5 Max, 48 GB) y de un único usuario; el propio autor advierte que los resultados variarán según prompts, chip y configuración.
- Riesgo de alucinación, sesgos conocidos y limitaciones idiomáticas del modelo base: no disponible en la información proporcionada.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las cifras.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/NukeTorch/Qwen3.8-27B-4bit-DFlash2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización MLX de origen: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Modelo borrador de origen: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio y releases del runtime: https://github.com/NukeTorch/nuketorch
- Instalador N1.0.0: https://github.com/NukeTorch/nuketorch/releases/download/n1.0.0/install.sh
