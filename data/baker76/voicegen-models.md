# baker76/voicegen-models

## Resumen

voicegen-models es un repositorio de conversiones ONNX del modelo de síntesis de voz VoxCPM2, desarrollado originalmente por OpenBMB. El autor del repositorio, baker76, no ha entrenado ni ajustado ningún modelo: cada carpeta contiene una conversión directa del checkpoint original a formato ONNX Runtime, pensada para su uso desde C++ sin dependencias de Python. El repositorio se emplea en la herramienta de línea de comandos voicegen y en las aplicaciones Voice Maker y Video Maker del mismo autor.

El paquete incluye cinco variantes de precisión (int4, int8, int8 con E/S fp16, fp16 y fp32) que cubren desde 2,6 GB hasta 9,5 GB, lo que permite desplegar el modelo en hardware muy distinto, desde GPUs de consumo hasta servidores. Cada variante separa el modelo de lenguaje (`lm.onnx`), la cabeza de difusión (`dit.onnx`) y el AudioVAE (`vae_encoder.onnx`, `vae_decoder.onnx`), además de incluir el tokenizador y un fichero de configuración `voicegen.json`.

La relevancia actual del repositorio radica en que ofrece una vía de despliegue de TTS con clonación de voz en entornos nativos (C++, ONNX Runtime) sin pasar por PyTorch ni Python, con licencia Apache-2.0 y con métricas de fidelidad frente a fp32 publicadas por el autor. El repositorio tiene 21,9 GB en total y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (OpenBMB): modelo de lenguaje + cabeza de difusión (DiT) + AudioVAE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4, int8 (MatMulNBits, bloques de 32), int8 con E/S fp16, fp16, fp32 |
| Idiomas soportados | no disponible (la model card menciona pruebas en inglés y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`lm.onnx`, `dit.onnx`, `vae_encoder.onnx`, `vae_decoder.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es VoxCPM2 de OpenBMB, una arquitectura de síntesis de voz compuesta por tres bloques que el repositorio distribuye como grafos ONNX independientes: un modelo de lenguaje (`lm.onnx`), una cabeza de difusión DiT (`dit.onnx`) y un AudioVAE con encoder y decoder separados. El AudioVAE se mantiene siempre en fp32 en todas las variantes, mientras que el modelo de lenguaje y el DiT se cuantizan según la carpeta. En la variante int4, los modelos de lenguaje se reducen a 4 bits y el encoder local y el DiT permanecen en 8 bits.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que el autor del repositorio no entrenó el modelo y remite a la model card original de VoxCPM2. La innovación técnica del repositorio es la conversión a ONNX Runtime con cuantización MatMulNBits en bloques de 32 y la separación modular de los componentes, que permite ejecutar el pipeline completo en C++ sin Python. El autor publica una validación de fidelidad frente a fp32 sobre 63 parches con teacher forcing: la variante int8 obtiene un coseno medio de 0,99981 (mínimo 0,99964) y un error relativo del 1,9 %, mientras que int4 (con DiT en int8) obtiene 0,99663 de coseno medio (mínimo 0,99214) y un 8,2 % de error relativo. En ambas variantes no cambió ninguna decisión de parada (0 de 63). En ejecución libre, todas las precisiones generaron voz que Whisper transcribe palabra por palabra en inglés, chino, diseño de voz y clonación, con duraciones dentro del 3 % respecto a fp32.

## Capacidades

- Síntesis de texto a voz (text-to-speech) en formato ONNX Runtime.
- Clonación de voz a partir de audio de referencia.
- Diseño de voz (voice design), según las pruebas de ejecución libre del autor.
- Generación multilingüe: la model card cita pruebas en inglés y chino; no se detalla la lista completa de idiomas.
- Ejecución sin Python mediante ONNX Runtime, integrable en aplicaciones C++.
- Cinco niveles de precisión para ajustar calidad, tamaño y consumo de memoria.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de TTS.

## Casos de uso

- Integración en aplicaciones de escritorio C++: la herramienta voicegen y las apps Voice Maker y Video Maker usan directamente los grafos ONNX, de modo que cualquier aplicación nativa puede incorporar TTS sin embeber un runtime de Python. La variante int8 (3,5 GB) es la opción por defecto para este escenario.
- Clonación de voz para doblaje y locución: el modelo acepta audio de referencia y genera voz clonada; las pruebas del autor confirman transcripción correcta palabra por palabra con Whisper en inglés y chino, lo que lo hace adecuado para prototipos de doblaje.
- Generación de narración en pipelines de vídeo: la app Video Maker del autor lo emplea para locutar vídeos; la variante int4 (2,6 GB) reduce el peso y permite ejecución en máquinas con recursos limitados.
- Despliegue en GPUs de consumo: la variante int8-fp16io (3,0 GB) está pensada para CUDA con entradas y salidas en fp16, lo que reduce el uso de memoria frente a fp32 (9,5 GB).
- Referencia de calidad para validación: la variante fp32 (9,5 GB) sirve como referencia para comparar la fidelidad de las versiones cuantizadas, tal como hace el propio autor con las 63 muestras de teacher forcing.
- Servicios de accesibilidad y lectura en voz alta: el modelo puede convertir texto en audio en aplicaciones de lectura; la licencia Apache-2.0 permite uso comercial sin restricciones adicionales.
- Investigación en cuantización de TTS: las métricas publicadas (coseno, error relativo, decisiones de parada) permiten estudiar el impacto de int4 e int8 en modelos de difusión para audio.

## Benchmarks y rendimiento

El autor publica una comparación de fidelidad frente a fp32 con teacher forcing sobre 63 parches:

| Modelo | Coseno medio (DiT) | Coseno mínimo (DiT) | Error relativo | Decisiones de parada cambiadas |
|---|---|---|---|---|
| int8 | 0,99981 | 0,99964 | 1,9 % | 0 de 63 |
| int4 (DiT int8) | 0,99663 | 0,99214 | 8,2 % | 0 de 63 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de síntesis de voz y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño de los pesos de la variante elegida, más el AudioVAE en fp32. La variante int4 ocupa 2,6 GB, int8 3,5 GB, int8-fp16io 3,0 GB, fp16 5,0 GB y fp32 9,5 GB.
- GPU recomendadas: CUDA para las variantes fp16 e int8-fp16io; el resto puede ejecutarse en CPU mediante ONNX Runtime.
- GPU de consumo: las variantes int4 (2,6 GB) e int8 (3,5 GB) caben en GPUs de consumo con 4-6 GB de VRAM o más; fp16 (5,0 GB) requiere al menos 6-8 GB; fp32 (9,5 GB) requiere 12 GB o más.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), integrado en la herramienta C++ voicegen y en las apps Voice Maker y Video Maker. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| voicegen-models (VoxCPM2 ONNX) | no disponible | no disponible | Apache-2.0 | ONNX | Conversión comunitaria, 5 precisiones, sin Python |
| VoxCPM2 (openbmb) | no disponible | no disponible | Apache-2.0 | Checkpoint original | Modelo base; requiere PyTorch |
| Otros modelos TTS comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparativos en la información proporcionada |

## Limitaciones y advertencias

- El autor no ha entrenado ni ajustado el modelo: cualquier sesgo o limitación proviene de VoxCPM2 y debe consultarse en su model card original.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación o calidad en idiomas distintos del inglés y el chino.
- La lista completa de idiomas soportados no está disponible.
- La cuantización int4 introduce un error relativo del 8,2 % frente a fp32; para producción con requisitos de calidad estrictos se recomienda int8 o superior.
- El AudioVAE se mantiene en fp32 en todas las variantes, por lo que el ahorro de memoria de las cuantizaciones es parcial.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que implica poca validación externa de las conversiones.
- No se documentan garantías de latencia ni de throughput para despliegues en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baker76/voicegen-models
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Descarga de una variante: `hf download baker76/voicegen-models --include "voxcpm2-int8/*" --local-dir models`
