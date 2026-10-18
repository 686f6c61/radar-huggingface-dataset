# Allinsama/onnx-community__Kokoro-82M-v1.0-ONNX

## Resumen

Kokoro-82M es un modelo de síntesis de voz (texto a audio) de 82 millones de parámetros desarrollado originalmente por hexgrad. Esta ficha describe la réplica `Allinsama/onnx-community__Kokoro-82M-v1.0-ONNX`, una exportación a ONNX del repositorio oficial `onnx-community/Kokoro-82M-v1.0-ONNX`, publicada con la librería `transformers.js` y pensada para ejecución en JavaScript (Node/navegador) y en Python vía `onnxruntime`.

El modelo recibe texto en inglés, lo convierte a fonemas mediante un G2P externo (Misaki en el flujo Python; el pipeline de `kokoro-js` lo integra en JavaScript) y genera waveform mono a 24 kHz. Incluye un conjunto de voces predefinidas identificadas por nombre (por ejemplo `af_bella`, `af_heart`, `am_adam`), cada una representada por un vector de estilo de 256 dimensiones, y permite controlar la velocidad de locución.

Su relevancia práctica es el tamaño: con 82 M de parámetros y cuantizaciones desde fp32 hasta q4, cabe en CPU y en cualquier GPU de consumo, lo que lo hace utilizable para TTS local sin dependencia de servicios en la nube. La licencia es Apache 2.0. No se han publicado en la información disponible datos sobre el dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (según el tag `style_text_to_speech_2`); detalles de capas no disponibles |
| Parametros totales | 82 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens fonéticos; el autor recomienda ≤510 para dejar hueco a los tokens de pad (id 0) al inicio y al final |
| Tipos de cuantizacion | fp32 (`model.onnx`), fp16 (`model_fp16.onnx`), quantized (`model_quantized.onnx`), q8f16, uint8, uint8f16, q4, q4f16; en `kokoro-js`: `fp32`, `fp16`, `q8`, `q4`, `q4f16` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (un fichero por cuantización) + vectores de estilo en `.bin` float32 con forma `(-1, 1, 256)` |

Otros datos técnicos: frecuencia de muestreo de salida 24 kHz, audio mono, entrada de control `speed` como tensor float32, y dependencia de un conversor texto-fonema externo para generar los `input_ids`.

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un TTS de arquitectura StyleTTS 2 (tag `style_text_to_speech_2`), con 82 M de parámetros y una entrada discreta de tokens fonéticos de hasta 512 posiciones. La generación se condiciona con un vector de estilo de 256 dimensiones seleccionado por longitud de la secuencia: en el ejemplo Python se carga `voices/af.bin`, se reordena a `(-1, 1, 256)` y se indexa con `len(tokens)`, de modo que el vector de estilo depende del número de fonemas de la frase. Este repositorio concreto es una conversión a ONNX y no incluye información sobre el proceso de entrenamiento.

No se han publicado en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de ajuste. Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.) más allá del condicionamiento por vector de estilo y del control de velocidad en inferencia. Cualquier afirmación sobre datos de entrenamiento o receta de alineación debe considerarse no verificada.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida mono a 24 kHz.
- Once o más voces predefinidas documentadas en la model card, con etiqueta de nacionalidad y género: voces femeninas americanas (`af_heart`, `af_alloy`, `af_aoede`, `af_bella`, `af_jessica`, `af_kore`, `af_nicole`, `af_nova`, `af_river`, `af_sarah`, `af_sky`) y masculinas americanas (`am_adam`, `am_echo`, `am_eric`, `am_fenrir`; la lista de la model card está truncada en la información disponible).
- Control de velocidad mediante el tensor `speed` en la sesión ONNX.
- Condicionamiento de estilo por voz y por longitud de secuencia (vector de 256 dimensiones).
- Ejecución en navegador y Node.js mediante `transformers.js` / `kokoro-js`, y en Python mediante `onnxruntime` + `misaki` para el G2P.
- Selección de precisión en tiempo de carga (`fp32`, `fp16`, `q8`, `q4`, `q4f16`) según el compromiso calidad/recursos.
- No dispone de tool calling, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente texto a voz.

## Casos de uso

- Narración de artículos y documentación en inglés: el modelo convierte párrafos en audio con una voz consistente (`af_heart`, por ejemplo) y permite ajustar `speed` para adaptar la locución a audiolibros técnicos o notas de versión leídas.
- Lectura de accesibilidad en aplicaciones web: al ejecutarse con `transformers.js` en el navegador mediante `kokoro-js`, puede sintetizar contenido sin enviar texto a un servidor, lo que reduce exposición de datos y latencia de red.
- Asistentes de voz locales en escritorio: proyectos como AuraAI integran esta conversión ONNX de Kokoro como recurso local, de modo que el TTS funciona sin conexión y sin coste por petición.
- Generación de avisos y mensajes cortos en sistemas embebidos o CPU-only: frases de menos de 510 tokens fonéticos encajan en la ventana del modelo y las cuantizaciones uint8/q4 reducen el peso del fichero ONNX.
- Doblaje y previsualización de guiones: con varias voces masculinas y femeninas se pueden generar borradores de locución para revisar ritmo y duración antes de contratar una voz humana.
- Pruebas automatizadas de pipelines de audio: al ser determinista por semilla de voz y fichero de estilo, sirve para generar audio de referencia en tests de integración de reproductores, subtitulado o pipelines de transcripción.
- Prototipado de interfaces conversacionales: combinado con un LLM que produzca texto en inglés, actúa como capa de salida de voz en un bucle por turnos, con la limitación de que cada intervención debe trocearse para respetar el límite de 512 tokens fonéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas objetivas (MOS, WER, RTF) ni comparaciones numéricas con otros sistemas TTS. Las únicas muestras disponibles son los clips de audio de las voces enlazados en la propia model card.

## Requisitos de hardware

- Peso de los pesos (estimación a partir de 82 M de parámetros, sin contar overhead del runtime): fp32 ≈ 328 MB; fp16 ≈ 164 MB; q8/uint8 ≈ 82 MB; q4 ≈ 41 MB. El repositorio completo ocupa 1,4 GB porque incluye todas las variantes.
- VRAM/RAM estimada para inferencia: alrededor de 0,5 GB en fp32 y por debajo de 0,2 GB en q8/q4, sumando activaciones y overhead de `onnxruntime`. Cifras estimadas, no publicadas por el autor.
- GPU recomendadas: no requiere GPU. Cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090) es sobrada para una sola petición; A100/H100 solo tendrían sentido para servir many-concurrent con batching propio.
- Cabe en GPU de consumo y también en CPU: es un caso de uso de inferencia en CPU o incluso en navegador.
- Opciones de despliegue: `onnxruntime` (Python), `onnxruntime-web` y `kokoro-js` (JavaScript/Node), `transformers.js`. No hay soporte documentado en la información disponible para vLLM, TGI, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. No se han publicado cifras de RTF ni de tokens de audio por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Allinsama/onnx-community__Kokoro-82M-v1.0-ONNX (esta ficha) | 82 M | 512 tokens fonéticos | Inglés | Apache 2.0 | ONNX, 8 variantes de cuantización; 11 descargas, 0 likes |
| hexgrad/Kokoro-82M (modelo base) | 82 M | No disponible en la información | Inglés | Apache 2.0 | Pesos originales en HuggingFace |
| onnx-community/Kokoro-82M-v1.0-ONNX (exportación de referencia) | 82 M | 512 tokens fonéticos | Inglés | Apache 2.0 | ONNX; ~803 K descargas y 258 likes según modelindex.dev |
| Piper (VITS) | No disponible en la información | No disponible | Múltiples | No disponible en la información | ONNX, orientado a CPU |
| Coqui XTTS-v2 | No disponible en la información | No disponible | Multilingüe | No disponible en la información | Pesos PyTorch |

La comparación relevante es con la exportación oficial de `onnx-community`: este repositorio es una réplica del mismo artefacto (mismo pipeline, misma licencia y mismos ficheros ONNX) con un volumen de descargas muy inferior, por lo que para producción conviene referenciar el repositorio de `onnx-community` salvo que se necesite fijar esta copia concreta.

## Limitaciones y advertencias

- Solo inglés: no hay voces ni fonemización para castellano en la información disponible, por lo que no es adecuado para TTS en español sin un trabajo adicional de G2P y entrenamiento.
- Límite de 512 tokens fonéticos: textos largos deben trocearse; el propio autor recomienda no superar 510 para reservar los tokens de pad. El troceado por frases evita cortes, pero puede introducir discontinuidades de prosodia entre fragmentos.
- Dependencia de un G2P externo: en Python hay que generar los fonemas con Misaki y mapearlos a ids con el `config.json` del modelo base. Errores de fonemización en nombres propios, siglas y unidades se traducen directamente en pronunciaciones incorrectas.
- Riesgo de alucinación audible: el modelo puede producir alargamientos, ruido o pronunciaciones inventadas en entradas atípicas (símbolos, texto no normalizado, secuencias muy cortas). No se documenta ningún mecanismo de mitigación.
- Sesgos no documentados: la información disponible no describe la composición del dataset de voces ni la distribución de acentos. Las etiquetas de las voces indican nacionalidad americana y género binario; no hay datos sobre cobertura de acentos no americanos ni sobre sesgos de prosodia.
- Repositorio espejo de baja adopción: 11 descargas y 0 likes en el momento de la consulta, frente a las ~803 K del repositorio de `onnx-community`. No hay garantía de mantenimiento ni de que se sincronice con futuras revisiones del original.
- Sin benchmarks ni métricas de calidad publicadas: no es posible comparar objetivamente fidelidad o naturalidad con alternativas sin evaluar las muestras de audio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no incluye cláusulas de consentimiento de voz. La responsabilidad legal sobre la suplantación de identidad o el uso de voces sintéticas recae en quien despliega el modelo; no se documenta watermarking ni trazabilidad del audio generado.
- Sin información sobre entrenamiento: no se puede evaluar la procedencia de los datos de voz, lo que es relevante para auditorías de compliance en producción.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Allinsama/onnx-community__Kokoro-82M-v1.0-ONNX
- Exportación ONNX de referencia: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Fichero `onnx/model.onnx` de la exportación de referencia: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/blob/main/onnx/model.onnx
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Ficha en modelindex.dev: https://modelindex.dev/models/onnx-community/Kokoro-82M-v1.0-ONNX
- Librería `kokoro-js` en NPM: https://npmjs.com/package/kokoro-js
- G2P Misaki (usado en el flujo Python): https://github.com/hexgrad/misaki
- Entrada de catálogo en GitHub: https://github.com/vaibhav06062005-ctrl/ai-model-onnx-community-kokoro-82m-v1.0-onnx/blob/main/README.md
- Integración en AuraAI: https://github.com/eisenjimmy/AuraAI/tree/main/resources/kokoro-model/onnx-community/Kokoro-82M-v1.0-ONNX
