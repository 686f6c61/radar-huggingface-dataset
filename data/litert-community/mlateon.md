# litert-community/mLateOn

## Resumen

mLateOn es un modelo de retrieval multilingüe de interacción tardía (estilo ColBERT) desarrollado por LightOn AI, convertido a formato LiteRT (`.tflite`) por la comunidad LiteRT para su ejecución en dispositivos edge y móviles. El modelo original, `lightonai/mLateOn`, está basado en la arquitectura ModernBERT con 307 millones de parámetros y genera un vector unitario de 128 dimensiones por cada token del texto, que se puntúa mediante MaxSim (máximo producto escalar por consulta). Esta conversión permite ejecutar retrieval semántico y RAG completamente offline en CPU, sin necesidad de GPU ni conexión a internet.

La relevancia de este modelo radica en su capacidad para manejar documentos largos (hasta 8192 tokens en el modelo original) y su generalización a idiomas no vistos durante el entrenamiento, como el japonés o el cirílico, a pesar de haber sido entrenado únicamente en nueve lenguas europeas más el árabe. La versión LiteRT mantiene la calidad del modelo de referencia con pérdida de tarea nula, según las verificaciones publicadas en la model card, y ofrece dos variantes de cuantización: int8 de rango dinámico (331 MB) y fp16 (619 MB), ambas con firmas de entrada estáticas de 32, 128, 256 y 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT con interacción tardía (ColBERT-style), proyección a 128 dims y normalización L2 por token |
| Parametros totales | 307 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (modelo original); 512 tokens máximo en las firmas LiteRT |
| Tipos de cuantizacion | int8 dynamic-range (331 MB) y fp16 (619 MB) |
| Idiomas soportados | Entrenado en 9 lenguas europeas + árabe; generaliza a idiomas no vistos (japonés, cirílico, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (`.tflite`) |

## Arquitectura y entrenamiento

El modelo base `lightonai/mLateOn` emplea una arquitectura ModernBERT con un mecanismo de interacción tardía: cada token del texto se proyecta a un vector de 128 dimensiones y se normaliza L2, de modo que la similitud entre consulta y documento se calcula mediante MaxSim (suma de los máximos productos escalares de cada vector de consulta contra todos los vectores del documento). El entrenamiento se realizó sobre nueve lenguas europeas (no especificadas en la información disponible) más el árabe, con un enfoque de retrieval multilingüe que permite generalizar a escrituras no incluidas en el entrenamiento, como el japonés o el cirílico.

La conversión a LiteRT integra dentro del grafo la cabeza de proyección y la normalización L2 por token, de modo que la salida del modelo son directamente los vectores listos para MaxSim. El padding se realiza con el token id 4 (`<mask>`), según el contrato del host, y se insertan tokens especiales `[Q]` (id 256000) y `[D]` (id 256001) en la posición 1 para consultas y documentos respectivamente. Las firmas estáticas (`encode_32`, `encode_128`, `encode_256`, `encode_512`) producen salidas bitwise idénticas para el mismo texto, independientemente de la firma utilizada, y el padding queda enmascarado dentro del grafo.

## Capacidades

- Retrieval semántico multilingüe mediante interacción tardía (ColBERT-style) con MaxSim.
- Generación de embeddings por token (128 dimensiones, normalizados L2) para consultas y documentos.
- Búsqueda cross-lingual: puede recuperar documentos en un idioma distinto al de la consulta (verificado con francés y alemán en el ejemplo de la model card).
- Generalización a idiomas no vistos durante el entrenamiento, como japonés (verificado con JSQuAD).
- Ejecución completamente offline en CPU, sin necesidad de GPU ni conexión a internet.
- Soporte para documentos largos mediante chunking (el modelo original acepta 8192 tokens, pero las firmas LiteRT se limitan a 512).
- Compatible con pipelines de RAG en dispositivos edge, con integración host-side del cálculo MaxSim en pocas líneas de código.

## Casos de uso

- **Atención al cliente multilingüe offline**: un asistente en un quiosco o dispositivo móvil puede recuperar respuestas de una base de conocimiento en varios idiomas sin conexión, gracias a la capacidad cross-lingual y la ejecución en CPU.
- **Búsqueda semántica en aplicaciones móviles**: una app de notas o documentos puede indexar localmente los textos del usuario y permitir búsquedas por significado, no solo por palabras clave, usando MaxSim sobre los vectores generados.
- **RAG en dispositivos edge**: un sistema de preguntas y respuestas sobre documentación técnica puede ejecutar la recuperación de pasajes relevantes en un dispositivo embebido, con el índice construido en servidor y las consultas procesadas localmente (verificado en la model card con el escenario cross-variant).
- **Búsqueda de documentos legales o médicos en varios idiomas**: un profesional puede consultar una base de documentos en francés, alemán o árabe desde un portátil sin GPU, con resultados comparables a los de un modelo servido en la nube.
- **Sistemas de recomendación de contenido**: dado un artículo o consulta, el modelo puede recuperar artículos relacionados en distintos idiomas, aprovechando la interacción tardía para capturar matices semánticos por token.
- **Indexación y búsqueda en corpus académicos**: un investigador puede construir un índice local de papers en varios idiomas y realizar consultas en su idioma nativo, obteniendo resultados relevantes incluso si los documentos están en lenguas no entrenadas explícitamente.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, etc.), sino verificaciones de calidad específicas para retrieval. Los datos disponibles son los siguientes:

| Tarea | Métrica | PyTorch fp32 | LiteRT int8 | LiteRT fp16 |
|---|---|---|---|---|
| NanoSciFact (inglés, 600 docs, 50 claims) | nDCG@10 | 0.8882 | 0.8951 | idéntico a PyTorch |
| NanoSciFact (inglés) | hit@1 | 0.820 | 0.840 | idéntico a PyTorch |
| JSQuAD (japonés, 500 párrafos, 150 preguntas) | nDCG@10 | 0.9710 | 0.9719 | idéntico a PyTorch |
| JSQuAD (japonés) | hit@1 | 0.9467 | 0.9467 | idéntico a PyTorch |

Además, el modelo base reporta un NDCG@10 de 87.69 en MLDR (long-document retrieval), aproximadamente 9 puntos por encima del siguiente modelo, según la model card. La conversión reproduce los puntajes MaxSim publicados por el modelo base hasta los cuatro decimales en el ejemplo de "Red Planet". En el escenario cross-variant (índice con PyTorch, consultas con int8), los resultados son idénticos al control en JSQuAD y dentro de 0.0015 en NanoSciFact.

## Requisitos de hardware

- **VRAM estimada**: no requiere VRAM dedicada; la inferencia se ejecuta en CPU. El tamaño del modelo es de 331 MB (int8) o 619 MB (fp16) en disco.
- **GPU recomendadas**: ninguna; el modelo está diseñado para CPU en dispositivos edge. La variante fp16 se indica como "desktop only", pero no se especifican requisitos adicionales.
- **Compatibilidad con GPU de consumo**: no aplica, aunque puede ejecutarse en cualquier dispositivo con soporte LiteRT (Android, iOS, Linux, etc.).
- **Opciones de despliegue**: LiteRT (antes TFLite) mediante `ai_edge_litert.interpreter.Interpreter` en Python, o mediante las APIs de LiteRT en Android/iOS. También es posible usar el modelo base en PyTorch para servidores.
- **Latencia y throughput**: no se proporcionan cifras concretas. La model card indica que la conversión es "task-lossless" y que la ejecución con 8 hilos (`num_threads=8`) es viable en CPU, pero no se ofrecen mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| **mLateOn (LiteRT)** | ModernBERT + late interaction | 307M | 512 (LiteRT) / 8192 (base) | Apache-2.0 | TFLite | Multilingüe, on-device, cross-lingual |
| **lightonai/mLateOn** (base) | ModernBERT + late interaction | 307M | 8192 | Apache-2.0 | PyTorch | Modelo original, retrieval multilingüe |
| **mDenseOn** (de LightOn) | ModernBERT denso | no disponible | no disponible | Apache-2.0 | PyTorch | Contraparte densa, sin interacción tardía |
| **ColBERTv2** | BERT + late interaction | ~110M-470M | 512 | MIT | PyTorch | Retrieval en inglés, requiere GPU para indexación |

No se dispone de comparativas directas con otros modelos en la información proporcionada. La comparativa se basa en características conocidas de los modelos mencionados.

## Limitaciones y advertencias

- **Contexto limitado en LiteRT**: las firmas estáticas admiten un máximo de 512 tokens, frente a los 8192 del modelo original. Los documentos más largos deben dividirse en fragmentos (chunking), lo que puede afectar a la calidad de la recuperación en documentos muy extensos.
- **Padding específico**: el contrato del host exige usar el token id 4 (`<mask>`) para padding, no el `pad_token_id` del `config.json` (que es 0). Usar un padding incorrecto puede producir resultados inconsistentes.
- **Idiomas de entrenamiento**: el modelo se entrenó en nueve lenguas europeas y árabe. Aunque generaliza bien a idiomas no vistos (japonés, cirílico), el rendimiento en lenguas muy alejadas tipológicamente no está garantizado.
- **Riesgo de alucinación**: al ser un modelo de retrieval, no genera texto libre; el riesgo de alucinación es bajo, pero depende del pipeline de generación aguas abajo.
- **Sesgos**: no se han documentado sesgos específicos, pero al estar entrenado principalmente en lenguas europeas y árabe, puede presentar sesgos culturales o geográficos en la recuperación.
- **Licencia**: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- **Verificaciones limitadas**: los benchmarks publicados son verificaciones de calidad sobre corpus submuestreados, no evaluaciones exhaustivas. Los números absolutos no son comparables con evaluaciones estándar.

## Enlaces

- [Modelo LiteRT en HuggingFace](https://huggingface.co/litert-community/mLateOn)
- [Modelo base lightonai/mLateOn](https://huggingface.co/lightonai/mLateOn)
- [Comunidad LiteRT en HuggingFace](https://huggingface.co/litert-community)
- [Colección de modelos LiteRT](https://huggingface.co/litert-community/collections)
- [Entrada en el leaderboard MTEB](https://leaderboard.mteb.org/models/lightonai/mLateOn)
- [Repositorio GitHub de LightOn (scripts de entrenamiento)](https://github.com/lightonai/mdenseon-mlateon)
- [Repositorio GitHub de LiteRT Torch (conversión)](https://github.com/google-ai-edge/litert-torch)
