# ChatPanel/speecht5_tts

## Resumen

`ChatPanel/speecht5_tts` es un espejo (mirror) del modelo de síntesis de voz `Xenova/speecht5_tts`, que a su vez es una conversión a ONNX del modelo original `microsoft/speecht5_tts` publicado por Microsoft Research. El repositorio lo mantiene la organización ChatPanel con el único objetivo de centralizar las descargas que realiza su gateway, de modo que todos los artefactos que ejecuta provengan de un mismo origen. No hay reentrenamiento, reconversión ni modificación alguna: los ficheros son idénticos byte a byte a los del upstream, como se documenta mediante hashes SHA-256 en la model card.

Se trata, por tanto, de un modelo de texto a voz (TTS) basado en la arquitectura SpeechT5, un transformer encoder-decoder con un vocoder integrado (HiFi-GAN) que genera formas de onda de audio a partir de texto y un embedding de hablante (x-vector). El paquete incluye los ficheros ONNX cuantizados necesarios para inferencia en entornos JavaScript/TypeScript mediante Transformers.js, así como el tokenizador SentencePiece a nivel de carácter.

Su relevancia es práctica más que investigadora: sirve como artefacto listo para producción en pipelines de TTS ligeros que necesitan ejecutarse sin Python, y como referencia de empaquetado ONNX cuantizado de SpeechT5. Cualquier mérito técnico del modelo corresponde a Microsoft Research y a Xenova por la conversión original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechT5 (transformer encoder-decoder) con postnet y vocoder HiFi-GAN integrado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX cuantizado (int8, según `quantize_config.json`); no se detallan otros formatos |
| Idiomas soportados | no disponible (el modelo base de Microsoft está entrenado principalmente en inglés, pero no se explicita en la información proporcionada) |
| Licencia | MIT |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`, `decoder_postnet_and_vocoder_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente, `microsoft/speecht5_tts`, emplea la arquitectura SpeechT5: un encoder-decoder transformer unificado para tareas de habla y texto, en el que el decoder genera un espectrograma mel que posteriormente pasa por un postnet y un vocoder HiFi-GAN para producir la forma de onda final. La entrada combina la secuencia de tokens de texto con un embedding de hablante (x-vector) que condiciona la voz generada.

Este repositorio concreto no aporta información sobre el entrenamiento: no se especifican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o ajuste fino. La model card indica explícitamente que los ficheros son copia byte a byte del upstream `Xenova/speecht5_tts` en el commit `1723781b8ce2d02f0400c8337be04ae8ee3d6d56`, sin reentrenamiento, conversión ni edición. La única transformación relevante respecto al modelo original de Microsoft es la conversión a ONNX y la cuantización, realizadas por el autor upstream (Xenova), no por ChatPanel.

## Capacidades

- Síntesis de voz (texto a audio) condicionada por un embedding de hablante (x-vector).
- Generación de espectrogramas mel y waveform mediante vocoder HiFi-GAN integrado.
- Tokenización a nivel de carácter mediante SentencePiece (`spm_char.model`).
- Ejecución en JavaScript/TypeScript mediante Transformers.js y ONNX Runtime Web (los ficheros ONNX así lo permiten).
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta capacidad multilingüe explícita; el modelo base de Microsoft está orientado principalmente al inglés, pero este dato no se confirma en la información disponible.
- No se documentan modos de razonamiento, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en el navegador: al estar empaquetado en ONNX cuantizado y ser compatible con Transformers.js, puede ejecutarse del lado del cliente sin backend Python, útil para lectores de pantalla, accesibilidad web o interfaces conversacionales ligeras.
- Generación de audio para asistentes de voz en aplicaciones web: el modelo produce waveform a partir de texto y un x-vector, lo que permite fijar una voz concreta o permitir al usuario elegir entre varios embeddings de hablante.
- Lectura de contenido dinámico (artículos, notificaciones, resúmenes) en aplicaciones que necesitan TTS bajo demanda sin depender de APIs externas de pago.
- Prototipado rápido de pipelines de TTS en entornos Node.js: el formato ONNX y la licencia MIT facilitan la integración en herramientas de desarrollo y pruebas automatizadas.
- Generación de voces para demos y entornos de investigación: al ser un espejo estable con hashes verificables, sirve como artefacto reproducible para comparar resultados de TTS.
- Integración en gateways o proxies propios (como el caso de ChatPanel): centralizar la descarga de un artefacto ONNX desde un único repositorio simplifica la gestión de dependencias y la verificación de integridad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 0,2 GB, lo que sugiere que el conjunto de ficheros ONNX cuantizados es ligero y apto para entornos con recursos limitados.
- VRAM estimada: no disponible de forma explícita; por el tamaño del repo (0,2 GB) y la cuantización int8, es plausible que quepa en GPUs de gama baja e incluso en ejecución CPU, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, aunque el tamaño reducido del artefacto lo hace verosímil; no se aportan datos concretos.
- Opciones de despliegue: Transformers.js / ONNX Runtime Web (formato nativo del repo); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ChatPanel/speecht5_tts | no disponible | no disponible | MIT | ONNX cuantizado | Hugging Face (espejo) |
| Xenova/speecht5_tts (upstream) | no disponible | no disponible | MIT | ONNX cuantizado | Hugging Face |
| microsoft/speecht5_tts (base) | no disponible | no disponible | MIT | PyTorch (safetensors/bin) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos TTS de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo sin mantenimiento técnico propio: cualquier corrección o mejora debe provenir del upstream (`Xenova/speecht5_tts` o `microsoft/speecht5_tts`).
- No se documentan sesgos conocidos, pero al ser un modelo TTS entrenado principalmente con datos en inglés (según el modelo base de Microsoft, aunque no confirmado aquí), puede presentar degradación en otros idiomas.
- Riesgo de alucinación no aplica en el sentido habitual de generación de texto, pero sí existe riesgo de pronunciación incorrecta, artefactos acústicos o entonación anómala en textos fuera de distribución.
- La licencia MIT permite uso comercial, pero conviene verificar los términos del modelo base de Microsoft y de los datos de entrenamiento originales, no detallados en esta información.
- El modelo requiere un embedding de hablante (x-vector) como entrada; sin él, la síntesis no es posible o la calidad se resiente. No se documenta en este repo cómo generarlo.
- No se especifican limitaciones de longitud de texto ni de contexto; el comportamiento en textos largos no está documentado.
- Al ser un artefacto ONNX cuantizado, puede haber una pérdida de calidad respecto al modelo original en PyTorch, aunque no se cuantifica en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/speecht5_tts
- Modelo upstream en Hugging Face: https://huggingface.co/Xenova/speecht5_tts
- Modelo base de Microsoft: https://huggingface.co/microsoft/speecht5_tts
- Commit upstream referenciado: `1723781b8ce2d02f0400c8337be04ae8ee3d6d56`
