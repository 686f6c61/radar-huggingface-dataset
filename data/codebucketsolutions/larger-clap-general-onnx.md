# codebucketsolutions/larger-clap-general-onnx

## Resumen

Este repositorio contiene una exportación a ONNX del modelo LAION larger CLAP (general audio), desarrollado originalmente por LAION a partir del trabajo de Wu, Chen y colaboradores sobre Contrastive Language-Audio Pretraining (CLAP). Se trata de un modelo de clasificación de audio zero-shot que alinea representaciones de audio y texto en un espacio común, permitiendo puntuar un clip de audio contra etiquetas escritas en lenguaje natural sin necesidad de reentrenamiento. La exportación la firma el usuario codebucketsolutions y no constituye una versión oficial de los autores originales.

La arquitectura combina un codificador de audio HTSAT-base con un codificador de texto RoBERTa-base, ambos proyectados a un espacio compartido de 512 dimensiones con embeddings L2-normalizados. El modelo original fue entrenado sobre audio general, música y habla. La exportación separa el modelo en dos grafos independientes (torre de audio y torre de texto) que se ejecutan con onnxruntime sin dependencia de PyTorch, lo que simplifica el despliegue en entornos de producción ligeros.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de inferencia sin PyTorch para CLAP, con cuantización int8 disponible para la torre de audio; por otro lado, advierte de que el repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que su madurez y mantenimiento en producción deben evaluarse con cautela. La licencia Apache-2.0 facilita el uso comercial, aunque conviene verificar la procedencia de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTSAT-base (torre de audio) + RoBERTa-base (torre de texto), contraste audio-texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 s de audio a 48 kHz (480 000 muestras); texto truncado a 77 tokens |
| Tipos de cuantizacion | fp32 e int8 dinamica (solo torre de audio); la torre de texto no se ofrece en int8 |
| Idiomas soportados | no disponible (el codificador de texto es RoBERTa-base, orientado a ingles) |
| Licencia | Apache-2.0 (pesos originales de laion/larger_clap_general; codigo y checkpoints originales LAION-AI/CLAP bajo CC0-1.0) |
| Formato de pesos | ONNX (audio.onnx, audio.int8.onnx, text.onnx) + tokenizer.json + clap.json |

## Arquitectura y entrenamiento

El modelo es una arquitectura de contraste audio-texto de dos torres. La torre de audio emplea HTSAT-base (Hierarchical Token-Semantic Audio Transformer), un transformer jerarquico con atención sobre tokens semánticos, y la torre de texto emplea RoBERTa-base. Ambas torres proyectan a un embedding compartido de 512 dimensiones que se normaliza L2. El front-end log-mel está integrado dentro del grafo ONNX de audio: una convolución con stride, una DFT enventanada, un banco de filtros mel y la transformación logarítmica. La exportación separa el modelo en dos grafos independientes para poder ejecutar cada torre por separado con onnxruntime.

No se dispone de información detallada en la documentación proporcionada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el modelo original CLAP se entrenó con aprendizaje contrastivo sobre pares audio-texto. La innovación técnica destacable de esta exportación es la paridad verificada con la implementación en PyTorch: el script `export_clap_onnx.py` compara los grafos fp32 e int8 contra la versión original en torch 2.5.1+cpu sobre tres clips de habla y tres sintéticos (progresión de acordes con ritmo, ruido blanco y tono de 1 kHz) frente a 15 etiquetas. En fp32, la diferencia máxima absoluta del embedding de audio es 1.1e-05 y la similitud coseno mínima es 1.000000; en int8, la diferencia máxima es 5.5e-03 y la coseno mínima es 0.999173. La torre de texto no se ofrece en int8 porque la cuantización dinámica desplazó demasiado sus embeddings (coseno aproximada de 0.96).

## Capacidades

- Clasificación de audio zero-shot: puntúa un clip contra etiquetas escritas en lenguaje natural mediante `softmax(logit_scale * audio_embedding @ text_embeddings.T)`, con `logit_scale` de 38.6647.
- Generación de embeddings de audio: salida float32 de `[batch, 512]` L2-normalizada para cada clip de 10 s.
- Generación de embeddings de texto: salida float32 de `[batch, 512]` L2-normalizada para textos de hasta 77 tokens.
- Procesamiento de audio a 48 kHz mono con ventana fija de 10 s; clips más cortos se repiten completos y se rellenan con ceros (padding `repeatpad`), y clips más largos se dividen en ventanas de 10 s que se promedian.
- Ejecución sin PyTorch mediante onnxruntime, con grafo de audio en fp32 o int8 dinámico.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de representación y clasificación, no generativo.
- Capacidades multilingües no documentadas; el codificador de texto es RoBERTa-base, entrenado principalmente en inglés.

## Casos de uso

- Moderación de contenido audiovisual: clasificar clips cortos contra etiquetas como "música", "habla", "ruido" o "tono puro" para enrutar contenido a revisión humana, aprovechando la ventana fija de 10 s y la inferencia sin PyTorch.
- Etiquetado automático de archivos de audio: generar embeddings de 512 dimensiones para cada clip y compararlos contra un vocabulario de etiquetas en lenguaje natural, útil en bibliotecas de efectos de sonido o archivos de podcasts.
- Detección de eventos sonoros en producción: integrar el grafo ONNX de audio en un pipeline de onnxruntime para monitorizar streams y disparar alertas cuando la etiqueta dominante supere un umbral de probabilidad.
- Búsqueda semántica de audio: indexar embeddings de audio y consultarlos con embeddings de texto para recuperar clips por descripción, sin necesidad de metadatos manuales.
- Clasificación de entornos acústicos: distinguir habla, música y ruido en grabaciones de campo o sensores IoT, con la variante int8 para dispositivos con recursos limitados.
- Prototipado rápido de clasificadores: usar el modelo como extractor de características congelado y entrenar una cabeza lineal ligera sobre los embeddings de 512 dimensiones para tareas específicas de dominio.
- Validación de pipelines de audio: emplear los grafos fp32 como referencia de paridad frente a implementaciones propias, dado que el repositorio incluye `parity.json` con las diferencias medidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de paridad entre la exportación ONNX y la implementación original en PyTorch:

| Metrica | fp32 | int8 (audio) |
|---|---|---|
| Diferencia maxima absoluta, embedding de audio | 1.1e-05 | 5.5e-03 |
| Coseno minima frente a PyTorch, embedding de audio | 1.000000 | 0.999173 |
| Diferencia maxima absoluta, embedding de texto | 1.4e-07 | no aplica (solo fp32) |
| Diferencia maxima absoluta, probabilidades de etiqueta | 7.8e-05 | 3.4e-02 |
| Coincidencia de etiqueta top | 6 de 6 | 6 de 6 |

Etiqueta top por clip (PyTorch / ONNX fp32), idéntica en ambos casos: en-short "a woman speaking" 0.9968; hi-short "a woman speaking" 0.9731; en-long "music" 0.5206; music "music" 0.5174; noise "white noise" 0.5971; tone "a pure tone" 0.5046.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0.9 GB, lo que da una cota superior aproximada para los pesos en fp32. La variante int8 reduce el peso del grafo de audio.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder ejecutar los grafos, aunque no se aportan mediciones.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, pero no hay confirmación ni cifras de latencia publicadas.
- Opciones de despliegue: onnxruntime (único runtime documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de clasificación de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| codebucketsolutions/larger-clap-general-onnx | no disponible | 10 s audio / 77 tokens texto | Audio-texto | Apache-2.0 | ONNX |
| laion/larger_clap_general | no disponible | 10 s audio / 77 tokens texto | Audio-texto | Apache-2.0 | PyTorch (safetensors) |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la información proporcionada no incluye otros modelos de la misma categoría con datos verificables. El modelo base `laion/larger_clap_general` comparte pesos y arquitectura; la diferencia es el formato de exportación y la disponibilidad de cuantización int8 en la torre de audio.

## Limitaciones y advertencias

- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-21); no hay evidencia de mantenimiento ni de uso en producción.
- No es una versión oficial de los autores originales de CLAP; la exportación la firma un tercero (codebucketsolutions).
- La torre de texto no se ofrece en int8 porque la cuantización dinámica degrada los embeddings (coseno aproximada de 0.96); usar solo el grafo de audio en int8 si se requiere cuantización.
- Ventana de audio fija de 10 s: clips más largos deben dividirse en ventanas y promediarse, lo que puede perder eventos transitorios; clips más cortos se repiten y rellenan con ceros, lo que puede introducir artefactos.
- Texto truncado a 77 tokens; etiquetas más largas se recortan.
- El codificador de texto es RoBERTa-base, orientado a inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación en el sentido de asignar etiquetas plausibles pero incorrectas cuando el clip no encaja bien con el vocabulario de etiquetas; las probabilidades pueden ser bajas (por ejemplo, 0.5046 para "a pure tone") y requieren umbrales calibrados.
- Sesgos no documentados en la model card; el modelo original se entrenó sobre audio general, música y habla, con posible infrarrepresentación de dominios específicos.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la cadena de atribución de los pesos originales (LAION; código y checkpoints originales CC0-1.0).
- No apto para tareas generativas, tool calling ni agentes; es exclusivamente un modelo de representación y clasificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/codebucketsolutions/larger-clap-general-onnx
- Modelo base: https://huggingface.co/laion/larger_clap_general
- Paper CLAP (ICASSP 2023): "Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation", Wu, Chen, Zhang, Hui, Berg-Kirkpatrick y Dubnov.
- Paper HTS-AT (ICASSP 2022): "HTS-AT: A Hierarchical Token-Semantic Audio Transformer for Sound Classification and Detection", Ke Chen et al.
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la informacion proporcionada.
