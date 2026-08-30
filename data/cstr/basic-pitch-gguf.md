# cstr/basic-pitch-GGUF

## Resumen

Basic Pitch es un modelo de transcripción musical automática (AMT) desarrollado por Spotify e presentado en ICASSP 2022. Esta ficha documenta la conversión a formato GGUF/ggml realizada por el autor `cstr`, pensada para integrarse en el framework **CrispASR** de CrispStrobe. El modelo convierte audio polifónico en eventos de notas (con tiempos de inicio y fin) para cualquier instrumento, cubriendo el rango completo de 88 teclas de un piano.

La conversión mantiene una paridad casi exacta con el ONNX original: la similitud coseno por etapa es ≥ 0.9991 en audio real y los eventos de notas coinciden exactamente en la versión f32. Con un tamaño de solo 146 KB en f32 y 113 KB en f16, es un modelo extremadamente ligero que puede ejecutarse en CPU sin necesidad de GPU, lo que lo hace adecuado para dispositivos embebidos y aplicaciones en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional con representación CQT (nnAudio CQT2010v2) y filtro FIR de diezmado (256 taps), basada en Spotify Basic Pitch |
| Parametros totales | 35.697 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | f32 y f16 (archivos `basic-pitch-f32.gguf` y `basic-pitch-f16.gguf`) |
| Idiomas soportados | no disponible (procesa audio, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo subyacente, Basic Pitch de Spotify, emplea una red neuronal convolucional que procesa una representación de Constant-Q Transform (CQT) del audio de entrada. La conversión a GGUF conserva bit a bit los kernels CQT2010v2 de nnAudio, el filtro FIR de diezmado de 256 taps y el vector de reescalado provenientes de los inicializadores del ONNX original, sin reimplementar ninguna parte crítica del procesado digital de señal.

Los detalles del entrenamiento original (número de tokens, composición del dataset, técnicas de optimización) no están disponibles en la información proporcionada. La conversión GGUF se realizó con el script `models/convert-basic-pitch-to-gguf.py` del repositorio CrispASR, y la verificación de paridad se realizó mediante el harness `crispasr-diff basic-pitch` con un backend de referencia en Python.

## Capacidades

- Transcripción polifónica de audio a eventos de notas (nota, tiempo de inicio, tiempo de fin) para cualquier instrumento.
- Rango completo de 88 teclas MIDI (piano).
- Integración directa con CrispASR mediante el comando `crispasr --piano --backend basic-pitch`.
- Soporte de salida en formato JSON (`--piano-format json`).
- Procesamiento en tiempo real gracias al pequeño tamaño del modelo (146 KB en f32).
- Ejecución en CPU sin necesidad de aceleración GPU.

## Casos de uso

- **Transcripción de partituras**: un músico puede grabar una melodía o acorde y obtener automáticamente la notación MIDI para editarla en un secuenciador o exportarla a una partitura.
- **Análisis musical para investigación**: los investigadores pueden extraer eventos de notas de grabaciones para estudios de teoría musical, análisis de interpretación o musicología computacional.
- **Herramientas de práctica para estudiantes**: una aplicación puede mostrar en tiempo real qué notas se están tocando, ayudando a verificar la precisión durante la práctica de un instrumento.
- **Documentación de improvisaciones**: los músicos pueden grabar sesiones de improvisación y convertir las grabaciones en archivos MIDI para reutilizarlos en composiciones posteriores.
- **Accesibilidad para personas con discapacidad visual**: la transcripción automática de notas puede convertirse en retroalimentación auditiva o táctil para personas que no pueden leer partituras tradicionales.
- **Entrenamiento de modelos de IA musical**: los eventos de notas generados pueden servir como datos de anotación para entrenar otros modelos de generación o análisis musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible, ya que se trata de un modelo de audio y no de lenguaje. La model card sí proporciona una verificación de paridad con el ONNX original:

| Métrica | Valor |
|---|---|
| Similitud coseno por etapa (audio real) | ≥ 0.9991 |
| Similitud coseno por etapa (entrada a frecuencia nativa) | 1.000000 |
| Eventos de notas (f32) | exactos (27/27 y 11/11 en los clips de validación) |
| Desplazamiento de fin de nota (f16) | máximo 1 frame (11.6 ms) en límites de umbral |

## Requisitos de hardware

- **VRAM**: no requiere VRAM, ya que se ejecuta en CPU.
- **GPU**: no necesaria; cualquier CPU moderna es suficiente.
- **Dispositivos embebidos**: puede ejecutarse en Raspberry Pi, placas ARM o incluso microcontroladores con suficiente memoria para el modelo (146 KB).
- **Opciones de despliegue**: integrado en CrispASR (línea de comandos), o mediante el uso directo del archivo GGUF con cualquier runtime que soporte ggml (por ejemplo, llama.cpp si se adaptara, aunque el uso principal es CrispASR).
- **Latencia**: no se han publicado mediciones específicas, pero el modelo es extremadamente pequeño y la inferencia en CPU debería ser casi instantánea para clips de audio cortos.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Uso principal |
|---|---|---|---|---|
| cstr/basic-pitch-GGUF | 35.697 | GGUF | Apache-2.0 | Transcripción de notas en CrispASR |
| Spotify Basic Pitch (ONNX) | similar (no publicado) | ONNX | Apache-2.0 | Transcripción de notas independiente |
| Onsets and Frames (Google) | no disponible | TensorFlow | Apache-2.0 | Transcripción de piano (modelo más grande, requiere GPU) |

La comparación directa con Onsets and Frames no es posible por falta de datos de rendimiento en esta ficha, pero se sabe que Basic Pitch está optimizado para ser ligero y funciona en CPU, mientras que Onsets and Frames requiere mayor capacidad de cómputo.

## Limitaciones y advertencias

- **Precisión en polifonía**: aunque la model card afirma soporte polifónico, fuentes externas indican que el modelo original está diseñado principalmente para transcripción monofónica y su precisión se degrada con múltiples instrumentos simultáneos o acordes densos. Se recomienda validar en el caso de uso concreto.
- **Idiomas**: no aplica, ya que procesa audio musical, no voz ni texto.
- **Alucinación**: no es un modelo generativo, por lo que el riesgo de alucinación no aplica; sin embargo, puede producir errores de detección de notas en pasajes complejos.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia.
- **Dependencia del framework**: el uso principal es a través de CrispASR; no se garantiza compatibilidad con otros runtimes ggml sin adaptación.
- **Versión f16**: puede desplazar el fin de algunas notas en hasta 11.6 ms en límites de umbral, lo que podría ser relevante en aplicaciones que requieren precisión temporal exacta.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/cstr/basic-pitch-GGUF)
- [Repositorio de Spotify Basic Pitch](https://github.com/spotify/basic-pitch)
- [Repositorio de CrispStrobe/CrispASR](https://github.com/CrispStrobe/CrispASR)
- [Script de conversión a GGUF](https://github.com/CrispStrobe/CrispASR/blob/main/models/convert-basic-pitch-to-gguf.py)
