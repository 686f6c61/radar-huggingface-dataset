# sookie90/whisper-hinglish-ggml

## Resumen

`sookie90/whisper-hinglish-ggml` es una conversión al formato GGML del modelo de reconocimiento de voz `Trelis/whisper-hinglish-preview`, especializado en hinglish (mezcla de hindi e inglés). El autor, sookie90, ha convertido el checkpoint original de HuggingFace a un archivo binario cuantizado en q5_0 (~1,03 GB) para su uso con `whisper.cpp` y `whisper-rs`, dos implementaciones ligeras de Whisper en C/C++ y Rust respectivamente. El modelo está pensado para transcripción de audio en hinglish, un caso de uso frecuente en entornos multilingües de la India.

La relevancia de este modelo radica en que ofrece una alternativa cuantizada y portable del modelo original, permitiendo su ejecución en dispositivos con recursos limitados (CPU, Raspberry Pi, etc.) sin necesidad de depender de la pila de Python de OpenAI. Sin embargo, presenta un problema conocido: el vocabulario del checkpoint implica 101 idiomas aparentes, uno más de los 100 que soporta la tabla `whisper_lang_str()` de `whisper.cpp`, lo que provoca un fallo de segmentación (SIGSEGV) al cargar el modelo con las versiones estándar de `whisper.cpp` y `whisper-rs` hasta la 0.16.0. Se requiere un parche de una línea en el código fuente para evitar el crash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q5_0 (archivo `ggml-trelis-hinglish-q5_0.bin`) |
| Idiomas soportados | hi (hindi), en (inglés) — hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (binario para whisper.cpp) |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint `Trelis/whisper-hinglish-preview`, que a su vez se basa en la arquitectura Whisper de OpenAI (encoder-decoder transformer con atención multi-cabeza). No se dispone de información detallada sobre el número de parámetros, la longitud de contexto ni el proceso de entrenamiento del modelo original (datos, tokens, técnicas de alineación, etc.). La conversión se realizó con el script `models/convert-h5-to-ggml.py` de `whisper.cpp` sobre el snapshot de HuggingFace del 2026-09-02, seguido de una cuantización a q5_0 con la herramienta `whisper-quantize`. No se han documentado innovaciones técnicas adicionales más allá de la cuantización.

## Capacidades

- Transcripción de voz a texto en hinglish (mezcla de hindi e inglés).
- Reconocimiento de voz multilingüe limitado a hindi e inglés, según los idiomas declarados.
- Ejecución local en CPU mediante `whisper.cpp` o `whisper-rs`, sin dependencias de Python.
- Compatible con el flujo de trabajo estándar de `whisper-cli` para archivos de audio (WAV, etc.).
- No se han documentado capacidades de traducción, identificación de idioma, ni funciones de tool calling o agentes.

## Casos de uso

- Transcripción de reuniones y llamadas en hinglish: el modelo puede procesar grabaciones de audio en entornos corporativos indios donde se mezclan hindi e inglés, generando texto útil para actas o búsquedas posteriores.
- Subtitulado automático de vídeos en hinglish: integrable en pipelines de generación de subtítulos para plataformas de vídeo, gracias a su formato ligero y su ejecución en CPU.
- Asistentes de voz para dispositivos de bajo consumo: al ser un archivo GGML cuantizado, puede desplegarse en Raspberry Pi o routers con suficiente RAM para reconocimiento de comandos de voz en hinglish.
- Análisis de audio en investigación sociolingüística: permite transcribir corpus de habla hinglish para estudios de code-switching o variación dialectal, sin necesidad de infraestructura en la nube.
- Accesibilidad para personas con discapacidad auditiva: conversión de contenido hablado en hinglish a texto en tiempo real o diferido, usando herramientas de código abierto.
- Pruebas de concepto de sistemas de transcripción embebidos: desarrolladores pueden evaluar la calidad del modelo en tareas específicas antes de optar por modelos más grandes o servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como WER (Word Error Rate), MMLU, HumanEval u otras para este modelo o su modelo original.

## Requisitos de hardware

- Al ser un archivo GGML cuantizado de ~1,03 GB, puede ejecutarse en CPU con al menos 2 GB de RAM libre (el modelo se carga en memoria).
- Para GPU, se requiere una tarjeta con VRAM suficiente para el modelo completo (al menos 2 GB, aunque depende de la implementación). No se han especificado GPUs concretas.
- Compatible con `whisper.cpp` (CPU y GPU) y `whisper-rs` (Rust). También puede usarse con `llama.cpp` si se adapta, aunque el flujo estándar es `whisper-cli`.
- La latencia y el throughput dependen del hardware; no se han publicado cifras oficiales. En una CPU moderna, la transcripción de un minuto de audio suele tardar menos de un minuto, pero esto es una estimación general de Whisper, no un dato específico de este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. Como referencia cualitativa:

| Modelo | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| `sookie90/whisper-hinglish-ggml` | GGML q5_0 | hi, en | Apache 2.0 | Conversión cuantizada, requiere parche para whisper.cpp |
| `Trelis/whisper-hinglish-preview` | PyTorch (original) | hi, en | Apache 2.0 | Modelo fuente, sin cuantizar |
| `Oriserve/Whisper-Hindi2Hinglish-Prime` | PyTorch | hi, en | no disponible | Modelo alternativo para hinglish, sin conversión GGML |

No se han encontrado otros modelos GGML específicos para hinglish en la búsqueda web.

## Limitaciones y advertencias

- Problema crítico de carga: el modelo provoca un fallo de segmentación (SIGSEGV) con las versiones estándar de `whisper.cpp` y `whisper-rs` (hasta 0.16.0) debido a que el vocabulario implica 101 idiomas, uno más de los soportados. Es necesario parchear `whisper.cpp:1665` para evitar el crash.
- Sin datos de rendimiento: no se han publicado métricas de calidad (WER, etc.), por lo que no se puede evaluar su precisión frente a otros modelos Whisper.
- Alcance limitado: solo cubre hinglish (hindi e inglés); no soporta otros idiomas ni tareas como traducción o identificación de idioma.
- Riesgo de alucinación: como cualquier modelo de reconocimiento de voz, puede generar texto incorrecto o inventado en audio ambiguo o con ruido.
- Sesgos: al estar entrenado probablemente con datos de habla hinglish, puede tener sesgos hacia variedades regionales o sociolectos específicos, aunque no se ha documentado.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero el modelo original puede tener condiciones adicionales no verificadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sookie90/whisper-hinglish-ggml
- Modelo original (Trelis): https://huggingface.co/Trelis/whisper-hinglish-preview
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Repositorio whisper-rs: https://github.com/tazz4843/whisper-rs
- Documentación de conversión de modelos: https://deepwiki.com/ggml-org/whisper.cpp/5.1-model-download-and-conversion
