# digiphyte/fluister-turbo-mlx

## Resumen

Fluister (turbo) es un modelo de reconocimiento automático de voz (ASR) desarrollado por DigiPhyte (Pty) Ltd, una empresa sudafricana. Se trata de un fine-tune del modelo `openai/whisper-large-v3-turbo` mediante LoRA, especializado en afrikáans e inglés sudafricano, incluyendo el fenómeno de code-switching (alternancia de idiomas) típico del habla cotidiana en Sudáfrica. El nombre "Fluister" significa "susurrar" en afrikáans.

Esta versión concreta (`digiphyte/fluister-turbo-mlx`) es la conversión del fine-tune al formato MLX (el framework de aprendizaje automático de Apple para Apple Silicon), cuantizada a 8 bits con grupo de tamaño 64. Está diseñada para ejecutarse de forma eficiente en Macs con chips Apple Silicon mediante la librería `mlx-whisper`. El modelo comparte la misma línea de pesos que las versiones CTranslate2 y Transformers publicadas por el mismo autor, pero esta variante MLX ofrece inferencia local rápida sin depender de servicios en la nube.

La relevancia de este modelo radica en que aborda un problema específico: Whisper, el modelo base, tiende a transcribir el afrikáans como neerlandés y degrada el inglés sudafricano. Fluister corrige estos fallos y mejora la precisión en contextos sudafricanos, lo que lo hace útil para aplicaciones de transcripción de reuniones, subtitulado y asistentes de voz locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) basado en `openai/whisper-large-v3-turbo` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio típica de Whisper: 30 segundos) |
| Tipos de cuantizacion | 8-bit (group size 64) |
| Idiomas soportados | afrikáans (af), inglés (en) |
| Licencia | MIT |
| Formato de pesos | MLX (formato nativo de Apple MLX) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder diseñado para ASR. El fine-tune se realizó sobre datos de habla afrikáans e inglés sudafricano, específicamente los conjuntos `andreoosthuizen/afrikaans-30s` (licencia CC-BY-4.0) y NCHLT `afr`/`eng` (licencia CC-BY-3.0). No se menciona el uso de RLHF ni DPO; el entrenamiento se limita a un ajuste supervisado clásico.

La innovación principal no está en la arquitectura (que hereda de Whisper), sino en la adaptación al dominio sudafricano. El modelo mantiene el tamaño del base, pero ajusta los pesos para reconocer correctamente el afrikáans y el inglés sudafricano, incluyendo el code-switching. La versión MLX se obtuvo convirtiendo los pesos del fine-tune (originalmente en formato Transformers) a MLX y aplicando cuantización de 8 bits con grupo de tamaño 64, lo que reduce el tamaño del repositorio a 0.9 GB.

## Capacidades

- Transcripción de audio en afrikáans e inglés sudafricano con alta precisión.
- Manejo de code-switching afrikáans-inglés en conversaciones mixtas.
- Reconocimiento de voz optimizado para acentos y pronunciación sudafricanos.
- Inferencia local en Apple Silicon mediante `mlx-whisper`.
- Soporte para especificar el idioma (`"af"` o `"en"`) para evitar errores de auto-detección.
- No incluye capacidades de tool calling, visión, ni generación de texto general; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones en Sudáfrica: el modelo puede transcribir conversaciones donde se alterna afrikáans e inglés, algo común en entornos laborales sudafricanos. Su precisión en code-switching lo hace adecuado para aplicaciones como Volksmond, el transcriptor de reuniones local de DigiPhyte.
- Subtitulado automático de vídeos en afrikáans e inglés sudafricano: al ejecutarse localmente en Mac, permite generar subtítulos sin depender de servicios en la nube, lo que reduce costes y mejora la privacidad.
- Asistentes de voz para aplicaciones móviles o de escritorio en Sudáfrica: el modelo puede integrarse en asistentes que necesiten entender comandos en afrikáans o inglés con acento local.
- Archivado y búsqueda de audio: transcripción de entrevistas, podcasts o grabaciones de campo para indexar contenido y hacerlo buscable.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en entornos donde se habla afrikáans o inglés sudafricano.
- Investigación lingüística: análisis de corpus de habla sudafricana, incluyendo estudios sobre code-switching, gracias a su capacidad de transcribir fielmente ambos idiomas.

## Benchmarks y rendimiento

La model card proporciona una comparación entre la versión CTranslate2 int8 y la versión MLX q8 (este modelo) en términos de WER (Word Error Rate) sobre 20 muestras por idioma:

| Build | Afrikaans WER | English WER |
|---|---|---|
| CT2 int8 (`fluister-turbo`) | 0.092 | 0.038 |
| **MLX q8 (este repo)** | **0.092** | **0.058** |

El WER en afrikáans es idéntico entre ambas versiones. La diferencia en inglés se atribuye a la estrategia de decodificación: `mlx-whisper` usa decodificación greedy, mientras que la versión CT2 emplea beam search. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) porque el modelo no está diseñado para tareas de lenguaje general.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (M1, M2, M3, M4 y sucesores).
- No se especifican requisitos de VRAM, pero al ser un modelo de 0.9 GB cuantizado a 8 bits, cabe en la memoria unificada de cualquier Mac con Apple Silicon (mínimo 8 GB recomendable).
- Se ejecuta mediante la librería `mlx-whisper`, que aprovecha la aceleración de Metal.
- No es compatible con GPUs NVIDIA o AMD; para esos entornos se recomienda usar la versión CTranslate2 (`digiphyte/fluister-turbo`) o Transformers (`digiphyte/fluister-turbo-transformers`).
- La latencia y el throughput dependen del chip concreto; no se proporcionan cifras oficiales, pero la cuantización 8-bit reduce el uso de memoria y acelera la inferencia en comparación con fp16.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. La única comparación directa es con la versión CTranslate2 del mismo fine-tune, que ya se muestra en la tabla de benchmarks. Frente al modelo base `openai/whisper-large-v3-turbo`, Fluister mejora específicamente el afrikáans y el inglés sudafricano, pero no se han publicado métricas del base en estos conjuntos de prueba. Se puede considerar que este modelo es una alternativa especializada a Whisper para el contexto sudafricano, con la ventaja de ser de código abierto (MIT) y ejecutable localmente en Mac.

## Limitaciones y advertencias

- La auto-detección de idioma puede fallar; se recomienda especificar el idioma manualmente (`"af"` o `"en"`).
- Nombres propios, números, términos técnicos y nombres de lugares sudafricanos pueden transcribirse incorrectamente; es un área conocida de mejora.
- La decodificación greedy de `mlx-whisper` produce un WER ligeramente superior en inglés en comparación con la versión CT2 con beam search.
- El modelo solo soporta afrikáans e inglés; no es multilingüe como el Whisper original.
- Aunque la licencia es MIT, el modelo es un trabajo derivado de Whisper (Apache-2.0) y los datos de entrenamiento tienen licencias CC-BY-4.0 y CC-BY-3.0; se debe respetar la atribución indicada en el archivo `NOTICE`.
- No está diseñado para tareas de generación de texto, razonamiento o código; es exclusivamente ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/digiphyte/fluister-turbo-mlx
- Versión CTranslate2: https://huggingface.co/digiphyte/fluister-turbo
- Versión Transformers: https://huggingface.co/digiphyte/fluister-turbo-transformers
- Repositorio de `mlx-whisper`: https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Aplicación Volksmond: https://volksmond.com
