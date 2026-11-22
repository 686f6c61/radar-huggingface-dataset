# craigandrews/qwen3-asr-0.6b-onnx-int4-merged

## Resumen

`craigandrews/qwen3-asr-0.6b-onnx-int4-merged` es una variante optimizada del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, distribuida en formato ONNX con cuantización int4. El autor, craigandrews, parte del repositorio de referencia `rhasspy/qwen3-asr-0.6b-onnx-int4-merged` y mantiene los pesos byte a byte idénticos, modificando únicamente los grafos del decodificador para mejorar el rendimiento en CPU. Se trata, por tanto, de un artefacto de despliegue más que de un modelo nuevo entrenado desde cero.

El modelo resuelve el problema de ejecutar transcripción de voz multilingüe en hardware modesto sin GPU, manteniendo la precisión del original. Su relevancia actual radica en las optimizaciones introducidas: la incorporación de la entrada opcional `num_logits_to_keep` para evitar calcular el `lm_head` completo de 151936 dimensiones en cada prefill, la salida `next_tokens` con el argmax directo y un nuevo grafo `decoder_gqa` que emplea el operador fusionado `GroupQueryAttention` de onnxruntime para mantener la caché KV en un único búfer por capa.

Con 0.6B parámetros, licencia Apache 2.0 y un tamaño de repositorio de 0.8 GB, está pensado para asistentes de voz locales, domótica y pipelines de transcripción de baja latencia. Las mediciones del autor reportan reducciones de entre el 19 % y el 38 % en tiempo de decodificación y del 21 % en memoria pico respecto al repositorio base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Qwen3-ASR), exportado a ONNX; decodificador con caché KV fusionada (GroupQueryAttention en variante GQA) |
| Parametros totales | 0.6B (aproximadamente 600 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la capacidad de la caché KV la fija el llamador; 28 capas, 8 cabezas KV de dimensión 128) |
| Tipos de cuantizacion | int4 (MatMulNBits con `accuracy_level=4`, activaciones cuantizadas a int8); tabla de embeddings en fp16 |
| Idiomas soportados | multilingüe (la model card cita pruebas con comandos en 9 idiomas y detección automática de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`decoder_merged.int4.onnx`, `decoder_gqa.int4.onnx`, `encoder.int4.onnx`, ficheros `.data` asociados, `embed_tokens.bin`) |

## Arquitectura y entrenamiento

El modelo es un export ONNX de Qwen3-ASR-0.6B, un sistema de reconocimiento automático del habla con encoder y decodificador transformer. La cuantización int4 se aplica mediante `MatMulNBits` de onnxruntime, que cuantiza las activaciones a int8 durante la multiplicación. El repositorio no incluye información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO); esos detalles corresponden al modelo Qwen3-ASR subyacente y no están disponibles en la información proporcionada.

Las innovaciones técnicas de esta variante son exclusivamente a nivel de grafo. `decoder_merged.int4.onnx` añade la entrada opcional `num_logits_to_keep` (int64, por defecto 0 = todas las posiciones), de modo que un prefill ejecuta el `lm_head` de 151936 dimensiones solo sobre las filas que el llamador lee, y expone `next_tokens` como `ArgMax(logits, axis=-1)`. `decoder_gqa.int4.onnx` sustituye la atención de cada capa por `GroupQueryAttention` fusionado, manteniendo la caché KV en un búfer por capa que se escribe in situ mediante IOBinding, en lugar de pasarse y devolverse completa en cada paso. Reutiliza el fichero `decoder_merged.int4.onnx.data`, por lo que añade menos de 1 MB a la descarga.

## Capacidades

- Reconocimiento automático del habla multilingüe con detección automática de idioma.
- Transcripción de comandos cortos y de audio de duración media (la model card reporta pruebas con 19.5 s de audio).
- Soporte de prompt de sesgo léxico: se pueden pasar listas de nombres o términos (por ejemplo, 50 nombres) para condicionar la transcripción.
- Decodificación con caché KV incremental y capacidad de descarte de tokens borrador (rechazo de draft tokens pasando una longitud menor), lo que habilita esquemas de decodificación especulativa o similar a streaming.
- Salida directa de tokens greedy mediante `next_tokens`, útil para pipelines que solo necesitan la siguiente pieza sin postprocesar logits.
- Compatibilidad con el ecosistema Wyoming mediante `wyoming-faster-whisper`.
- No se documentan capacidades de visión, audio generativo, tool calling ni razonamiento multi-paso; el modelo es exclusivamente ASR.

## Casos de uso

- Asistentes de voz para domótica: integrado en Home Assistant vía Wyoming, el modelo transcribe comandos cortos en varios idiomas con detección automática; las mediciones del autor muestran 0.473 s para un comando de 3.2 s con prompt de 50 nombres, adecuado para respuesta interactiva en CPU.
- Transcripción local en dispositivos sin GPU: al ejecutarse en onnxruntime sobre CPU (probado en Ryzen 7 5700X con 4 hilos), permite desplegar ASR en mini-PC, servidores domésticos o equipos de borde sin acelerador dedicado.
- Subtitulado y notas de reuniones de duración media: con 1.76 s para 19.5 s de audio en CPU, es viable para transcripción por lotes de fragmentos cortos con latencia contenida.
- Sesgo léxico en dominios específicos: el soporte de prompts con listas de nombres (50 nombres en la prueba) lo hace útil para transcripción de nombres propios, catálogos de productos o terminología de un dominio concreto.
- Pipelines de voz con decodificación especulativa: el rechazo de tokens borrador mediante longitudes de secuencia más cortas permite implementar esquemas de streaming o draft-model con corrección, con 1.29 s para 19.5 s de audio en la prueba con borrador.
- Servicios de transcripción multilingüe de bajo coste: al ser Apache 2.0 y ejecutarse en CPU, se puede desplegar en contenedores sin licencias adicionales para atención al cliente o indexación de audio en 9 idiomas.
- Integración en aplicaciones de accesibilidad: dictado local sin enviar audio a la nube, con huella de memoria pico de 1.69 GB en las pruebas del autor.

## Benchmarks y rendimiento

La model card no incluye métricas de calidad ASR (WER). Solo reporta mediciones de latencia y memoria del propio autor, en Ryzen 7 5700X, onnxruntime 1.32, CPU, 4 hilos, mediante `wyoming-faster-whisper`:

| Prueba | rhasspy (base) | Este repo | Variacion |
|---|---|---|---|
| 38 transcripciones (19 comandos en 9 idiomas, con y sin prompt de 3 nombres) | 18.41 s | 14.86 s | −19 % |
| Comando de 3.2 s con prompt de 50 nombres | 0.747 s | 0.473 s | −37 % |
| 19.5 s de audio | 2.85 s | 1.76 s | −38 % |
| 19.5 s de audio con borrador (tipo streaming) | 1.58 s | 1.29 s | −19 % |
| Memoria pico RSS (pruebas de 50 nombres y 19.5 s) | 2.14 GB | 1.69 GB | −21 % |

En cuanto a fidelidad, los 60 transcripts de la prueba fueron idénticos a los del repositorio rhasspy. El autor advierte explícitamente que esto no es una evaluación de WER, sino una comprobación de que las ediciones de grafo no alteran el comportamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni WER) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para la variante `decoder_gqa`, que está pensada para CPU; el repositorio pesa 0.8 GB y la memoria pico medida en CPU es de 1.69 GB RSS.
- GPU recomendadas: no disponibles para esta variante; el autor indica que el `GroupQueryAttention` de CUDA en onnxruntime solo acepta float16, por lo que los llamadores con GPU deben usar `decoder_merged`.
- CPU: probado en Ryzen 7 5700X con 4 hilos; requiere onnxruntime 1.20 o superior para `decoder_gqa` (1.18 y 1.19 dan resultados incorrectos al alimentar varios tokens sobre una caché no vacía).
- Cabe en hardware de consumo: sí, al ejecutarse en CPU con ~1.7 GB de RAM pico; no se documentan requisitos de GPU para consumo.
- Opciones de despliegue: onnxruntime (librería `onnxruntime`), `wyoming-faster-whisper` con la opción `--stt-library qwen3-asr` y el PR #156; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: según las mediciones del autor, 0.473 s para un comando de 3.2 s con prompt de 50 nombres y 1.76 s para 19.5 s de audio en CPU de 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| craigandrews/qwen3-asr-0.6b-onnx-int4-merged | 0.6B | no disponible | ONNX int4 | Apache 2.0 | Decodificador con GQA fusionado y `num_logits_to_keep`; 19-38 % más rápido que su base en CPU |
| rhasspy/qwen3-asr-0.6b-onnx-int4-merged | 0.6B | no disponible | ONNX int4 | Apache 2.0 | Repositorio base; mismos pesos, sin las optimizaciones de grafo |
| Qwen3-ASR-0.6B (original) | 0.6B | no disponible | no disponible | no disponible | Modelo de origen del que deriva la exportación ONNX |

No se dispone de datos de benchmarks de calidad (WER) ni de comparativas con otras familias ASR en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de precisión frente a alternativas.

## Limitaciones y advertencias

- No se ha publicado una evaluación de WER; las únicas métricas son de latencia y memoria, y la comprobación de fidelidad se limita a 60 transcripciones idénticas.
- `decoder_gqa` redondea de forma distinta: sus logits difieren hasta 5.4 respecto a `decoder_merged`, aunque el autor atribuye parte de esa diferencia a la sensibilidad del `MatMulNBits` int4 (los logits del propio `decoder_merged` se mueven hasta 4.4 ante un cambio de un ulp en la entrada). Los tokens greedy coinciden salvo en empates cercanos entre tokens de relleno aleatorios.
- `decoder_gqa` requiere onnxruntime 1.20 o superior; con 1.18 y 1.19 produce resultados incorrectos al alimentar varios tokens sobre una caché no vacía.
- La variante GQA es solo para CPU; en CUDA el `GroupQueryAttention` de onnxruntime solo acepta float16, así que los despliegues con GPU deben usar `decoder_merged`.
- La capacidad de la caché KV debe cubrir la secuencia más larga; no se documenta una longitud de contexto máxima del modelo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo ASR, los errores se manifiestan como transcripciones incorrectas, especialmente en audio ruidoso o vocabulario fuera del prompt de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/craigandrews/qwen3-asr-0.6b-onnx-int4-merged
- Repositorio base: https://huggingface.co/rhasspy/qwen3-asr-0.6b-onnx-int4-merged
- Wyoming faster-whisper: https://github.com/OHF-Voice/wyoming-faster-whisper
- Pull request con soporte para este modelo: https://github.com/OHF-Voice/wyoming-faster-whisper/pull/156
