# plotarmordev/drama-3-NVFP4-Pruned-5900

## Resumen

Drama 3 NVFP4 Pruned 5900 es una versión comunitaria cuantizada y podada del modelo de síntesis de voz Fish Audio Drama 3, desarrollada por el usuario plotarmordev. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado que reduce el número de expertos enrutados del backbone mixture-of-experts de 10.240 a 5.900 y almacena los expertos conservados en formato NVFP4 de 4 bits. El modelo base es fishaudio/drama-3, un sistema text-to-speech con arquitectura MoE y codec de audio propio.

El objetivo del checkpoint es reducir los requisitos de memoria y disco del Drama 3 original manteniendo una calidad de síntesis de voz comparable. Según la model card, los pesos y el codec ocupan 18,34 GiB en disco frente a 38,63 GiB del original, y el pico de memoria de dispositivo reportado por el motor es de 16,93 GiB frente a 36,95 GiB. Con 12.967.285.888 parámetros totales, el modelo conserva intactos el config, el tokenizer, la plantilla de chat y el codec de audio respecto a la revisión `e0a9218` del modelo original.

La relevancia de esta ficha es doble: por un lado, muestra una técnica de compresión agresiva (poda de expertos guiada por estadísticas de router más cuantización NVFP4) aplicada a un TTS MoE; por otro, ilustra las limitaciones prácticas de estos checkpoints, que requieren un motor específico (TensorFold, fork de ashhart/TensorFold) y no cargan en Transformers ni en SGLang-Omni. El modelo está pensado para inglés y se distribuye bajo la Fish Audio Community License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (fish_omni) con codec de audio; 40 capas de 256 expertos enrutados en el original |
| Parámetros totales | 12.967.285.888 |
| Parámetros activos | no disponible (el original tiene 256 expertos enrutados por capa; el checkpoint conserva 5.900 de 10.240 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 de 4 bits en expertos enrutados; formato etiquetado como 8-bit en los tags de Hugging Face; FP8 en el modelo original |
| Idiomas soportados | inglés (en) |
| Licencia | fish-audio-community-license (etiquetada como "other") |
| Formato de pesos | safetensors (con índice `model.safetensors.index.json`), más codec `codec.pth` |

## Arquitectura y entrenamiento

El modelo base Drama 3 emplea un backbone transformer con mezcla de expertos: 40 capas con 256 expertos enrutados cada una, lo que suma 10.240 expertos en total. Este checkpoint no reentrena el modelo; parte de los pesos de fishaudio/drama-3 y aplica dos transformaciones. Primero, poda los expertos enrutados de 10.240 a 5.900, seleccionando el conjunto conservado a partir de estadísticas de router registradas durante la generación de voz y calibradas en parte con peticiones privadas de clonación de voz. La lista de expertos conservados se publica en `model.safetensors.index.json` bajo `metadata.drama_experts`. Segundo, cuantiza los expertos conservados de FP8 a NVFP4 de 4 bits.

El resto de componentes se mantiene byte-idéntico al original: `config.json`, los ficheros del tokenizer, `chat_template.jinja` y el codec `codec.pth`. El modelo incluye un codec de audio propio y una pipeline de text-to-speech con soporte de voz de referencia y voz integrada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés, con salida en formato WAV mediante un endpoint compatible con `/v1/audio/speech`.
- Clonación de voz mediante un clip de referencia: la guía de ejecución describe dos formas de enviar una voz de referencia y aplica guidance γ 1.5 solo en ese caso.
- Voz integrada (built-in voice) para peticiones sin referencia, que se ejecutan sin guidance (el motor registra `cfg_gamma=1.00` aunque la cabecera de respuesta indique 1.5).
- Generación de audio con hasta 1.024 frames de audio por respuesta en las mediciones reportadas.
- Soporte de decodificación con guidance classifier-free (cfg) batched en el motor TensorFold.
- Capacidades de tool calling, agentes, razonamiento multi-step, visión o audio de entrada: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Síntesis de voz para audiolibros y narración: el modelo genera voz a partir de texto en inglés con voz integrada o clonada, y su reducción a 18,34 GiB en disco permite desplegarlo en una única GPU con menos memoria que el original, lo que abarata la producción por lotes de capítulos largos.
- Clonación de voz para doblaje y localización: al aceptar un clip de referencia y aplicar guidance γ 1.5, se puede reproducir el timbre de un locutor concreto para generar versiones de voz consistentes en múltiples segmentos de un mismo proyecto.
- Asistentes de voz en aplicaciones de atención al cliente: el endpoint HTTP compatible con `/v1/audio/speech` permite integrar el modelo en un servicio de respuesta hablada; su menor huella de memoria (16,93 GiB de pico reportado) facilita el despliegue junto a otros servicios en el mismo nodo.
- Generación de voces para prototipado de videojuegos: la voz integrada y la posibilidad de servir en macOS con Metal (receta de drama-tensorfold) permiten a equipos pequeños generar diálogos de prueba en un M5 Ultra sin infraestructura CUDA.
- Investigación en compresión de modelos MoE: el checkpoint y su lista de expertos conservados sirven como caso de estudio reproducible para medir el impacto de la poda de expertos y NVFP4 en la calidad de un TTS, con las tablas y registros crudos publicados en el repositorio drama-tensorfold.
- Evaluación comparativa de motores de inferencia: al requerir TensorFold y no cargar en Transformers ni SGLang-Omni, el modelo es útil para probar motores alternativos que lean expertos NVFP4 y conjuntos de expertos podados con distinto número por capa.
- Generación de contenido accesible: conversión de artículos o documentación en inglés a audio para lectores de pantalla o podcasts, con la ventaja de que el modelo cabe en una GPU consumer de gama alta con suficiente VRAM.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 24 textos en inglés, una petición a la vez, con 4 semillas (0 a 3) por configuración y los mismos ítems y semillas para cada checkpoint, medida en una NVIDIA GB10. Los resultados se expresan en word error rate, tomas fallidas y similitud de hablante, y el autor indica que las diferencias están dentro del ruido respecto al quant de 7.369 expertos y al modelo original. No se publican cifras numéricas de MMLU, HumanEval, GSM8K ni de WER concretas en la información disponible.

| Métrica | Este quant (5.900 expertos) | Quant 7.369 expertos | Drama 3 original |
|---|---:|---:|---:|
| Pesos y codec en disco | 18,34 GiB | 20,76 GiB | 38,63 GiB |
| Pico de memoria de dispositivo (reportado por el motor) | 16,93 GiB | 19,35 GiB | 36,95 GiB |
| Memoria de host usada (mayor caída de memoria disponible) | ~19,1 GiB | ~21,3 GiB | ~39,3 GiB |
| Carga del motor (mediana de 4 arranques) | 20,1 s | 26,1 s | 5,7 s |

No se han publicado resultados numéricos de benchmarks de calidad (WER, similitud de hablante) en la información disponible; la model card solo indica que las diferencias están dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: pico de memoria de dispositivo reportado de 16,93 GiB en el motor TensorFold con NVFP4; el original requiere 36,95 GiB.
- GPU recomendadas: NVIDIA GB10 (única GPU CUDA en la que se ha construido y ejecutado según la model card). NVFP4 requiere una GPU y un motor que lo soporten.
- Cabe en consumer GPU: no hay datos confirmados para GPUs consumer; el pico de 16,93 GiB sugiere que una GPU con 24 GB de VRAM podría ser suficiente, pero no está verificado en la información proporcionada.
- Apple silicon: la receta de drama-tensorfold permite servir el modelo en Metal con `--weights nvfp4 --checkpoint DIR`; se cargó y respondió a las 48 peticiones del corpus en un M5 Ultra, dos de ellas en el límite de frames. La calidad solo se midió en GB10.
- Opciones de despliegue: TensorFold, rama `drama-nvfp4` del fork de plotarmordev, commit `b1f4b9b`, con Zig 0.17.0 exacto, `nvcc` del CUDA toolkit y el comando `hf` de huggingface_hub. No carga en Transformers ni en SGLang-Omni.
- Latencia y throughput: no disponibles; solo se reporta el tiempo de carga del motor (20,1 s de mediana de 4 arranques).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drama-3-NVFP4-Pruned-5900 (este) | 12.967.285.888 | no disponible | 18,34 GiB (pesos y codec) | fish-audio-community-license | Hugging Face, requiere TensorFold |
| drama-3-NVFP4-Pruned (7.369 expertos) | no disponible | no disponible | 20,76 GiB | fish-audio-community-license | Hugging Face, requiere TensorFold |
| fishaudio/drama-3 (original) | no disponible | no disponible | 38,63 GiB | fish-audio-community-license | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información proporcionada; no se dispone de datos de otros TTS comparables (por ejemplo, modelos de otros autores) para incluir en la tabla.

## Limitaciones y advertencias

- Checkpoint no oficial: Fish Audio no creó, revisó ni respaldó esta versión; es una modificación comunitaria del modelo original.
- Requiere un motor específico: no carga en Transformers ni en SGLang-Omni; necesita TensorFold (rama `drama-nvfp4`, commit `b1f4b9b`), Zig 0.17.0 exacto y `nvcc`.
- Solo se ha construido y ejecutado en una NVIDIA GB10 con CUDA; el soporte en otras GPUs CUDA no está verificado.
- La poda de expertos se calibró en parte con peticiones privadas de clonación de voz, lo que puede introducir sesgos hacia esos dominios de uso.
- Solo soporta inglés; no hay información sobre otros idiomas.
- Riesgo de alucinación y errores de pronunciación: la model card reporta tomas fallidas y variaciones dentro del ruido, pero no publica cifras de WER que permitan cuantificar el riesgo.
- La voz integrada falló más tomas que el quant anterior según la model card, aunque la diferencia se atribuye al ruido entre semillas.
- La licencia fish-audio-community-license es de tipo "other"; es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- El guidance γ 1.5 solo se aplica con voz de referencia; en voz integrada el motor ejecuta sin guidance, lo que puede afectar a la consistencia de la salida.
- La calidad solo se midió en GB10; el rendimiento en macOS con Metal no tiene evaluación de calidad publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plotarmordev/drama-3-NVFP4-Pruned-5900
- Quant anterior de 7.369 expertos: https://huggingface.co/plotarmordev/drama-3-NVFP4-Pruned
- Modelo base Fish Audio Drama 3: https://huggingface.co/fishaudio/drama-3
- Revisión del modelo base usada como referencia: https://huggingface.co/fishaudio/drama-3/tree/e0a9218aa48888270f06ef1ed9ea67622c0e17d2
- Repositorio de mediciones y recetas: https://github.com/plotarmordev/drama-tensorfold
- Resultados del quant de 15 GB: https://github.com/plotarmordev/drama-tensorfold/tree/main/results/quant-15gb
- Resultados del modelo completo: https://github.com/plotarmordev/drama-tensorfold/tree/main/results/full-vs-quant-01
- Receta para macOS: https://github.com/plotarmordev/drama-tensorfold/blob/main/recipe/README-macos.md
- Registro de ejecución en macOS: https://github.com/plotarmordev/drama-tensorfold/blob/main/results/macos-nvfp4-quants.json
- Motor TensorFold (fork): https://github.com/plotarmordev/TensorFold
- Commit del motor: https://github.com/plotarmordev/TensorFold/commit/b1f4b9b4830c9bd43bf7c432cffe7dea21313537
- Guía de ejecución: https://github.com/plotarmordev/TensorFold/blob/drama-nvfp4/docs/drama-3-nvfp4.md
- Motor original: https://github.com/ashhart/TensorFold
