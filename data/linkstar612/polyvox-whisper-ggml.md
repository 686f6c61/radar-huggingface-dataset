# linkstar612/polyvox-whisper-ggml

## Resumen

El repositorio `linkstar612/polyvox-whisper-ggml` es un espejo de redundancia de modelos `whisper.cpp` en formato GGML, específicamente cuantizaciones q8_0 de fine-tunes de Whisper para diez idiomas. No se trata de un modelo nuevo, sino de una recopilación de checkpoints de terceros convertidos y cuantizados, destinados a servir como fuente de descarga para la aplicación Polyvox. El autor, linkstar612, declara explícitamente que no ha modificado los pesos más allá de la conversión de formato y la cuantización.

La relevancia de este repositorio radica en que ofrece modelos ASR optimizados para idiomas concretos (hebreo, sueco, finlandés, español, ruso, turco, árabe, vietnamita, tailandés e italiano) en un formato ligero y ejecutable en CPU mediante `whisper.cpp`. Cada archivo incluye su licencia individual, ya que las licencias difieren entre los modelos originales. El tamaño total del repositorio es de 13,7 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) en formato GGML |
| Parametros totales | Variable según archivo; no especificado en el repositorio (referencia: Whisper small ≈ 244M, medium ≈ 769M, large ≈ 1550M, large-v3-turbo ≈ 809M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper usa ventanas de audio de 30 segundos, pero no se indica en el repositorio) |
| Tipos de cuantizacion | q8_0 (8 bits) |
| Idiomas soportados | he, sv, fi, es, ru, tr, ar, vi, th, it |
| Licencia | Per-file (Apache-2.0, MIT, BSD-3-Clause según archivo) |
| Formato de pesos | GGML (.bin) |

## Arquitectura y entrenamiento

Los archivos son cuantizaciones q8_0 de fine-tunes de Whisper publicados por terceros. La arquitectura subyacente es la de Whisper (encoder-decoder transformer), con variantes según el modelo original: algunos derivan de `whisper-large-v3-turbo`, otros de `whisper-small`, `whisper-medium`, `whisper-large` o `whisper-large-v2`. No se proporcionan detalles sobre los datos de entrenamiento, el número de tokens o el proceso de fine-tuning; el autor solo indica que se aplicó conversión a formato GGML y cuantización q8_0, manteniendo una fidelidad indistinguible de f16 en estos modelos y reduciendo a la mitad el tamaño de descarga y la huella en memoria.

## Capacidades

- Reconocimiento automático de voz (ASR) en diez idiomas específicos: hebreo, sueco, finlandés, español, ruso, turco, árabe (dialectal), vietnamita, tailandés e italiano.
- Ejecución local mediante `whisper.cpp`, sin dependencias externas ni conexión a internet.
- Cuantización q8_0 que conserva la precisión del modelo original f16 para los decodificadores fine-tuned.
- Compatible con el ecosistema `whisper.cpp` (herramientas de línea de comandos, bindings en varios lenguajes).
- No se mencionan capacidades adicionales como tool calling, agentes o procesamiento multimodal.

## Casos de uso

- Transcripción de audio en idiomas con pocos recursos: los fine-tunes específicos mejoran la precisión frente al Whisper genérico en hebreo, vietnamita, tailandés, etc., lo que permite transcribir grabaciones de entrevistas, podcasts o material audiovisual en esos idiomas.
- ASR local sin conexión: gracias al formato GGML y la cuantización q8_0, los modelos pueden ejecutarse en CPU en entornos sin GPU, ideales para aplicaciones de escritorio, dispositivos embebidos o servidores sin aceleración.
- Integración en aplicaciones que usan `whisper.cpp`: al ser archivos `.bin` estándar, se pueden cargar directamente con las herramientas de `whisper.cpp` (por ejemplo, `whisper-cli`) o mediante bindings en Python, Node.js, etc.
- Redundancia y distribución de modelos: el repositorio actúa como espejo de descarga para la aplicación Polyvox, garantizando disponibilidad de los pesos sin depender de los repositorios originales.
- Evaluación comparativa de fine-tunes: investigadores pueden descargar estos modelos cuantizados para comparar el rendimiento de distintos fine-tunes de Whisper en sus idiomas respectivos.
- Servicios de subtitulación automática: transcripción de vídeos o audios en los diez idiomas soportados, con posibilidad de generar subtítulos en tiempo real o en lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión (WER, CER, etc.) ni comparativas con otros modelos.

## Requisitos de hardware

- Los requisitos varían según el archivo: los modelos `large` (≈ 1,5 GB en q8_0) requieren aproximadamente 2 GB de RAM para cargar el modelo, mientras que los `small` (≈ 250 MB) necesitan menos de 1 GB.
- Ejecución en CPU: `whisper.cpp` está optimizado para CPU (x86, ARM) y puede funcionar en hardware modesto; una GPU no es imprescindible.
- GPUs recomendadas: no aplica, aunque si se usa una GPU, cualquier GPU con soporte CUDA o Metal (Apple Silicon) puede acelerar la inferencia mediante los builds de `whispper.cpp` con backend GPU.
- Opciones de despliegue: `whisper.cpp` (CLI, servidor), bindings en Python (pywhispercpp), Rust, Node.js, etc.
- Latencia y throughput: no se han publicado datos específicos para estos archivos. En general, Whisper large en CPU procesa audio más lento que en tiempo real; los modelos small y medium son más rápidos.

## Comparativa con modelos similares

Dado que el repositorio contiene múltiples modelos de distintos tamaños, la comparativa se realiza a nivel de categoría (ASR multilingüe con Whisper fine-tuned):

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Polyvox Whisper GGML (este repo) | Variable (small a large) | No disponible | 10 idiomas específicos | Per-file (Apache-2.0, MIT, BSD-3-Clause) | GGML q8_0 |
| Whisper original (openai/whisper) | 39M a 1550M | 30 s de audio | 99 idiomas | MIT | PyTorch, CT2, GGML |
| Whisper.cpp modelos oficiales | 39M a 1550M | 30 s de audio | 99 idiomas | MIT | GGML (f16, q5_0, q8_0) |

La diferencia principal es que este repositorio ofrece fine-tunes específicos por idioma, lo que suele dar mejor precisión en esos idiomas que el Whisper genérico, a costa de reducir la cobertura multilingüe.

## Limitaciones y advertencias

- Licencia per-file: cada archivo tiene su propia licencia (Apache-2.0, MIT, BSD-3-Clause). Es obligatorio revisar el archivo `<id>.LICENSE.txt` asociado antes de usar comercialmente el modelo.
- No se proporcionan detalles del entrenamiento de los fine-tunes (datos, hiperparámetros, evaluación), por lo que no se puede verificar la calidad o los sesgos de cada modelo.
- Cobertura limitada a 10 idiomas; el modelo no funciona fuera de esos idiomas.
- Cuantización q8_0: aunque el autor afirma que es indistinguible de f16, es posible una ligera pérdida de precisión en condiciones de audio muy ruidosas o con acentos extremos.
- Riesgo de alucinación: como cualquier modelo ASR, puede generar texto incorrecto o inventado en segmentos de audio ambiguos o de baja calidad.
- No hay garantías de mantenimiento: el repositorio es un mirror personal, podría no actualizarse o eliminarse.
- No se indican requisitos de contexto de audio; Whisper maneja ventanas de 30 segundos, por lo que audios más largos deben segmentarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/linkstar612/polyvox-whisper-ggml
- Repositorio espejo de modelos ONNX de Polyvox: https://huggingface.co/linkstar612/polyvox-models
- Perfil del autor en GitHub: https://github.com/linkstar612
- whisper.cpp (modelos y herramientas): https://github.com/ggml-org/whisper.cpp/tree/master/models
- Documentación de conversión y descarga de modelos en whisper.cpp: https://deepwiki.com/ggml-org/whisper.cpp/5.1-model-download-and-conversion
