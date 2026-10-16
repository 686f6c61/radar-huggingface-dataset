# crash-sv/scribe-whisper-small-ggml

## Resumen

`crash-sv/scribe-whisper-small-ggml` es una republicación del modelo Whisper small de OpenAI en formato ggml, cuantizado a q8_0, preparada para su uso con whisper.cpp. El autor es crash-sv y el artefacto se publica como dependencia descargable de Scribe SV, una utilidad de dictado y traducción para Windows que recurre a este archivo cuando no encuentra una GPU adecuada y ejecuta el reconocimiento de voz en CPU. La relevancia es práctica: se trata de un binario estable, verificable y listo para desplegar en entornos sin aceleración gráfica.

Conviene subrayar que no se ha reentrenado, convertido ni recuantizado nada. El archivo `ggml-small-q8_0.bin` procede de `ggerganov/whisper.cpp` byte a byte, con un SHA-256 documentado y comparado con el repositorio de origen antes de la subida (2026-10-16). Es, por tanto, una redistribución con licencia MIT y no un modelo nuevo.

Se apoya en `openai/whisper-small`, un transformer encoder-decoder de aproximadamente 244 millones de parámetros, con soporte para ruso e inglés según los metadatos del repositorio. El tamaño del repositorio es de 0,3 GB y el pipeline declarado es `automatic-speech-recognition`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small de OpenAI) |
| Parametros totales | ~244 millones (modelo base openai/whisper-small) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (formato nativo de Whisper) |
| Tipos de cuantizacion | q8_0 en formato ggml |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | ggml (archivo `ggml-small-q8_0.bin`) |

## Arquitectura y entrenamiento

El modelo base es el Whisper small de OpenAI, un transformer con arquitectura encoder-decoder diseñado para reconocimiento automático de voz. Procesa audio en ventanas de 30 segundos transformadas a log-mel spectrograms y genera transcripciones de forma autoregresiva. Esta versión concreta no aporta cambios de arquitectura: es la conversión a ggml y la cuantización q8_0 realizadas por los autores de whisper.cpp sobre el modelo original.

No hay entrenamiento adicional, ajuste fino ni alineación por parte del republicador. El archivo se distribuye inalterado desde `ggerganov/whisper.cpp`, con tamaño de 264.464.607 bytes y SHA-256 `49c8fb02b65e6049d5fa6c04f81f53b867b5ec9540406812c643f177317f779f`. La innovación técnica relevante es la propia cuantización q8_0, que reduce el peso y permite inferencia en CPU manteniendo una calidad cercana a la original, junto con el soporte de DTW (`-dtw small`) para marcas de tiempo a nivel de palabra en whisper.cpp. No se dispone de detalles sobre la composición exacta del dataset de entrenamiento original en la información proporcionada.

## Capacidades

- Transcripción de voz a texto (automatic-speech-recognition) sobre audio en inglés y ruso.
- Traducción de voz al inglés, capacidad inherente a los modelos Whisper (no confirmada explícitamente en la model card).
- Detección automática de idioma mediante el parámetro `-l auto`.
- Ejecución en CPU cuando no hay GPU disponible, que es el caso de uso declarado en Scribe SV.
- Alineación temporal a nivel de palabra mediante DTW (`-dtw small`).
- Integración como servidor de inferencia con `whisper-server`.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del propio ASR.

## Casos de uso

- Dictado en escritorio Windows: Scribe SV lo utiliza para convertir voz en texto en tiempo real en máquinas sin GPU, apoyándose en el modo CPU de whisper.cpp y en la cuantización q8_0 para reducir el consumo de memoria.
- Subtitulado de vídeo o audio en inglés y ruso: la opción `-dtw small` permite generar marcas de tiempo por palabra, útiles para subtítulos sincronizados.
- Transcripción por lotes en servidores sin aceleración gráfica: el despliegue mediante `whisper-server` permite atender peticiones de ASR en entornos de CPU, sin depender de CUDA.
- Traducción de reuniones o notas de voz en ruso hacia inglés: aprovecha la capacidad multilingüe de Whisper small para transcribir y traducir contenido hablado.
- Integración en aplicaciones de terceros: el binario puede descargarse bajo demanda y usarse como dependencia ASR embebida, dado su reducido tamaño en disco (0,3 GB).
- Procesamiento en dispositivos con recursos limitados: al ser una variante small cuantizada, es adecuada para portátiles y equipos sin GPU dedicada donde un modelo mayor no cabría en memoria.
- Archivado y reproducción de audio histórico en ruso o inglés: transcripción de grabaciones largas troceadas en ventanas de 30 segundos para su indexación o búsqueda posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, MMLU ni comparativas numéricas, y los resultados de la búsqueda web no contienen datos relevantes sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El archivo q8_0 ocupa ~264 MB en disco; la inferencia requiere además memoria para el contexto de audio, habitualmente por debajo de 1 GB.
- GPU recomendadas: no especificadas. El caso de uso declarado es la CPU cuando no hay GPU adecuada.
- Compatibilidad con GPU de consumo: sí, por la baja huella de memoria del modelo small cuantizado, aunque no se ofrecen cifras concretas.
- Opciones de despliegue: whisper.cpp (comando `whisper-server -m ggml-small-q8_0.bin -l auto -ng -dtw small`), y cualquier integración compatible con formato ggml.
- Latencia y throughput estimados: no disponible. Dependen fuertemente de la CPU y del número de hilos configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crash-sv/scribe-whisper-small-ggml | ~244 M | ru, en | ggml (q8_0) | MIT | HuggingFace |
| openai/whisper-small | ~244 M | Multilingue | PyTorch / safetensors | MIT | HuggingFace |
| ggerganov/whisper.cpp (ggml-small-q8_0.bin) | ~244 M | Multilingue | ggml (q8_0) | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una simple republicación byte a byte: no incorpora mejoras, ajustes ni correcciones sobre el binario original de whisper.cpp, por lo que hereda todas sus limitaciones.
- Los metadatos de idioma del repositorio declaran solo ruso e inglés; el comportamiento en otros idiomas no está documentado en esta ficha, aunque el modelo base es multilingüe.
- Riesgo de alucinación inherente a los modelos ASR de Whisper, especialmente con audio ruidoso, silencios largos o habla solapada.
- Procesamiento limitado a ventanas de 30 segundos; los audios más largos requieren troceado y gestión de solapamientos.
- Sesgos potenciales heredados del entrenamiento de OpenAI sobre datos web y audio diverso, no analizados en la model card.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia pública de uso ni validación por parte de terceros.
- Licencia MIT: permite uso comercial, pero conviene conservar los avisos de atribución a OpenAI y a los autores de ggml/whisper.cpp incluidos en el repositorio.
- La fecha de creación indicada (2026-10-15) es posterior a la fecha habitual de consulta; verificar la vigencia del artefacto antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crash-sv/scribe-whisper-small-ggml
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de origen ggml: https://huggingface.co/ggerganov/whisper.cpp
- Proyecto whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Aplicación Scribe SV: https://github.com/Crash-SV
- Licencia whisper.cpp (MIT): https://raw.githubusercontent.com/ggml-org/whisper.cpp/master/LICENSE

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a contenidos no relacionados (películas y sucesos de tráfico) y se han descartado.
