# 0xfff999/stems-models

## Resumen

`0xfff999/stems-models` es un repositorio de pesos en formato ONNX y GGML que agrupa varios modelos de separación de fuentes de audio (audio source separation) y transcripción de notas, empaquetados para ser servidos directamente al navegador por la aplicación web del proyecto Stems. No se trata de un modelo único entrenado por el autor, sino de una colección de conversiones y exportaciones de modelos de terceros: Demucs v4 (HT Demucs) de Meta, Inverse Drum Machine, Mel-Band RoFormer, MVSep Mega 53-stem BS-RoFormer y Basic Pitch de Spotify.

El repositorio resuelve un problema de despliegue: permitir que una aplicación web ejecute separación de pistas (stems) en el cliente sin depender de un backend con GPU. Para ello se ofrecen los pesos en ONNX (con variantes en float16 y GGML) que pueden cargarse con runtimes de inferencia en el navegador o en el servidor. El tamaño total del repositorio es de 3,3 GB y las descargas y likes registrados son cero en el momento de la consulta.

Es relevante para desarrolladores que necesiten integrar separación de voces, batería, bajo u otros instrumentos en un pipeline web o de escritorio sin reentrenar nada, reutilizando modelos consolidados en la literatura de separación musical. Cada archivo conserva su licencia original, por lo que la licencia global del repositorio se declara como `other`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección heterogénea: Demucs v4 (HT Demucs, U-Net con transformer híbrido), BS-RoFormer (Band-Split RoFormer), Inverse Drum Machine, Basic Pitch (red convolucional para transcripción de notas) |
| Parametros totales | no disponible por modelo; el repo completo ocupa 3,3 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelos de audio, no de texto) |
| Tipos de cuantizacion | float32 y float16 (variantes `-f16`); pesos GGML para HT Demucs |
| Idiomas soportados | no disponible (procesamiento de audio, independiente del idioma) |
| Licencia | `other` a nivel de repo; cada archivo conserva su licencia: MIT (Demucs, Mel-Band RoFormer, MVSep Mega 53), Apache-2.0 (Inverse Drum Machine, Basic Pitch) |
| Formato de pesos | ONNX y GGML (`ggml-model-htdemucs*.bin`) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: agrupa exportaciones de arquitecturas ya publicadas. Demucs v4 (HT Demucs) es un modelo híbrido que combina un encoder-decoder convolucional con un transformer que opera sobre la representación temporal, diseñado para separar voces y acompañamiento (y variantes de 4 y 6 pistas). Mel-Band RoFormer y MVSep Mega 53-stem BS-RoFormer emplean arquitecturas basadas en RoFormer con band-split, orientadas a separación multi-instrumento de alta calidad. Inverse Drum Machine se centra en la separación de kits de batería, y Basic Pitch es una red convolucional ligera para transcripción automática de audio a notas MIDI.

No se dispone de información sobre los datos de entrenamiento, número de tokens o horas de audio, composición de los datasets ni procesos de RLHF/DPO, ya que el autor del repositorio solo documenta la procedencia y licencia de cada archivo. La innovación técnica destacable es el propio empaquetado: exportación a ONNX (incluyendo pesos en float16 y un core compartido con cabezas por instrumento para el modelo Mega 53) y a GGML, lo que habilita inferencia en el navegador y en CPU.

## Capacidades

- Separación de fuentes musicales en pistas (stems): voces, batería, bajo y otros instrumentos según el modelo.
- Separación multi-instrumento de alta granularidad con MVSep Mega 53-stem BS-RoFormer (hasta 53 stems mediante core compartido y cabezas por instrumento).
- Separación específica de kits de batería con Inverse Drum Machine.
- Extracción de voces con Mel-Band RoFormer.
- Transcripción de audio a notas (audio-to-MIDI) con Basic Pitch.
- Inferencia en navegador o en CPU gracias a los formatos ONNX y GGML.
- Variantes en float16 para reducir uso de memoria y acelerar la inferencia.
- No dispone de capacidades de texto, razonamiento, código, tool calling ni agentes; es exclusivamente un conjunto de modelos de audio.

## Casos de uso

- Aplicación web de karaoke o remixes: cargar `onnx/htdemucs*.onnx` en el navegador para separar la voz del acompañamiento y permitir al usuario silenciar o aislar pistas sin backend.
- Producción musical y edición: usar Mel-Band RoFormer para extraer voces limpias de una mezcla antes de aplicar procesado o remezcla.
- Creación de sample packs: emplear MVSep Mega 53-stem para dividir una canción en decenas de instrumentos y reutilizar fragmentos en bibliotecas de samples.
- Educación musical y análisis: separar batería con Inverse Drum Machine para estudiar patrones rítmicos por componente del kit.
- Transcripción y notación: pasar una grabación por Basic Pitch para obtener notas MIDI y editarlas en un DAW o software de partituras.
- Investigación en separación de fuentes: comparar en un mismo entorno las salidas de Demucs, RoFormer y Mega 53 sobre un mismo audio para evaluar calidad por instrumento.
- Despliegue sin GPU: servir los pesos GGML de HT Demucs en un servidor CPU o en el cliente para aplicaciones con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del modelo concreto. Los archivos ONNX en float16 reducen el consumo frente a float32.
- GPU recomendadas: no disponible en la información proporcionada; al ser exportaciones ONNX, pueden ejecutarse en GPU compatibles con ONNX Runtime (CUDA, DirectML, CoreML) o en CPU.
- Compatibilidad con GPU de consumo: probable para los modelos más pequeños (Basic Pitch, Inverse Drum Machine), pero no se especifican requisitos mínimos.
- Opciones de despliegue: ONNX Runtime (web, Python, C++), `onnxruntime-web` para navegador, y llama.cpp/GGML para los binarios `ggml-model-htdemucs*.bin`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pistas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `0xfff999/stems-models` | Colección de exportaciones | Variable (2, 4, 6, 53) | ONNX, GGML | Mixta (MIT, Apache-2.0) | Hugging Face, 0 descargas |
| Demucs v4 (original, adefossez/demucs) | Modelo único | 2, 4, 6 | PyTorch | MIT | GitHub, ampliamente usado |
| Mel-Band RoFormer (KimberleyJSN) | Modelo único | Voces | PyTorch/ONNX | MIT | Hugging Face |
| MVSep Mega 53-stem BS-RoFormer (ZFTurbo) | Modelo único | 53 | PyTorch | MIT | GitHub / MVSep |

La ventaja del repositorio es el empaquetado listo para navegador (ONNX/GGML y float16); la desventaja es que no añade mejoras de calidad sobre los modelos originales y carece de documentación técnica propia.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier mérito o limitación de calidad corresponde a los modelos originales.
- Licencia global `other`: es imprescindible revisar `THIRD_PARTY_NOTICES.md` antes de uso comercial, ya que conviven MIT y Apache-2.0 y cada archivo tiene su propia licencia.
- Sin documentación de benchmarks, requisitos de hardware ni métricas de calidad en la model card.
- Riesgo de artefactos y alucinaciones de audio (fuentes fantasma) inherente a los modelos de separación, no documentado aquí.
- Los pesos GGML de HT Demucs y las variantes float16 pueden degradar ligeramente la calidad frente a float32.
- No hay información sobre sesgos, idiomas ni limitaciones de contexto porque el modelo no procesa texto.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/0xfff999/stems-models
- Repositorio Stems: https://github.com/federava/stems
- Avisos de terceros: https://github.com/federava/stems/blob/main/THIRD_PARTY_NOTICES.md
- Demucs (Meta): https://github.com/adefossez/demucs
- Inverse Drum Machine: https://github.com/bernardo-torres/inverse-drum-machine
- Mel-Band RoFormer (KimberleyJSN): https://huggingface.co/KimberleyJSN/melbandroformer
- MVSep Music Source Separation Training (ZFTurbo): https://github.com/ZFTurbo/Music-Source-Separation-Training
- Basic Pitch (Spotify): https://github.com/spotify/basic-pitch
