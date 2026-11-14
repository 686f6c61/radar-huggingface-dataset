# jenila-ai/whisper-small-ggml

## Resumen

Whisper small (ggml, q8_0) es una conversión del modelo de reconocimiento automático del habla Whisper small de OpenAI al formato ggml, cuantizado a 8 bits (q8_0) para su uso con whisper.cpp. El repositorio lo publica jenila-ai y contiene exactamente el mismo fichero `ggml-small-q8_0.bin` que ya se distribuye en el repositorio oficial de ggerganov/whisper.cpp, sin modificaciones. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning, sino de una réplica empaquetada de un artefacto ya existente.

Whisper small es un transformer encoder-decoder entrenado por OpenAI para transcripción y traducción de voz, con capacidad multilingüe. La versión small se sitúa en el rango de los 244 millones de parámetros y está pensada para entornos donde no hay GPU disponible: el autor indica que lo ejecuta en la CPU de teléfonos Android para transcribir la letra de una pista vocal.

Su relevancia es práctica más que investigadora: ofrece un punto de descarga directo de un binario ggml q8_0 verificado por hash, útil para quien quiera integrar transcripción ligera en dispositivos de bajos recursos con whisper.cpp. La model card es mínima y no aporta datos de entrenamiento, benchmarks ni detalles de arquitectura más allá de la referencia a OpenAI Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), formato ggml |
| Parametros totales | no disponible en la informacion proporcionada (la variante small de Whisper se situa en torno a 244 M, dato no confirmado en la ficha del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, segun el diseno estandar de Whisper, no confirmado en la model card) |
| Tipos de cuantizacion | q8_0 (8 bits) |
| Idiomas soportados | no disponible en la ficha; la model card indica que la variante small es multilingue |
| Licencia | MIT |
| Formato de pesos | ggml (fichero `ggml-small-q8_0.bin`) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper small de OpenAI, un transformer encoder-decoder que procesa espectrogramas de audio y genera tokens de texto. La conversión a ggml y la cuantización a q8_0 las realiza el ecosistema whisper.cpp; el autor no ha reentrenado ni ajustado el modelo, y de hecho el fichero es idéntico al publicado en el repositorio de ggerganov/whisper.cpp, con SHA-256 `49c8fb02b65e6049d5fa6c04f81f53b867b5ec9540406812c643f177317f779f`.

La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco describe innovaciones técnicas adicionales más allá de la propia cuantización a 8 bits, que reduce el tamaño del binario (el repositorio ocupa 0,3 GB) a costa de una pérdida mínima de precisión frente a los pesos en coma flotante.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio, con salida de transcripción en texto.
- Capacidad multilingüe heredada de Whisper small, aunque la model card no detalla la lista concreta de idiomas.
- Traducción de voz a texto en inglés, funcionalidad estándar de Whisper (no verificada explícitamente en la ficha del autor).
- Ejecución en CPU mediante whisper.cpp, sin necesidad de GPU.
- Adecuado para audio corto por segmentos (el autor lo usa para transcribir una pista vocal).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión ni de audio más allá del ASR.

## Casos de uso

- Transcripción de letras de canciones en movil: el propio autor ejecuta el modelo en la CPU de telefonos Android para transcribir la pista vocal de una mezcla, un escenario con recursos limitados donde la cuantizacion q8_0 reduce el consumo de memoria.
- Subtitulado offline en dispositivos sin GPU: al funcionar con whisper.cpp en CPU, permite generar subtitulos en portatiles modestos o en entornos sin acelerador.
- Notas de voz a texto en aplicaciones moviles: integrable como binario embebido para convertir grabaciones cortas en texto sin enviar audio a la nube.
- Prototipado rapido de pipelines ASR: el fichero ggml listo para usar evita pasos de conversion y permite validar una idea con whisper.cpp en minutos.
- Transcripcion en entornos aislados o sin conectividad: al ser un binario local de 0,3 GB, encaja en despliegues edge con requisitos de privacidad.
- Procesamiento por lotes de audio corto en servidores de CPU: util para volcar transcripciones de archivos pequenos cuando no hay GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo esta pensado para ejecutarse en CPU; en GPU, el binario q8_0 de 0,3 GB requiere una cantidad de memoria muy reducida (no cuantificada en la informacion disponible).
- GPU recomendadas: no se especifican; el autor lo ejecuta en CPU de telefonos Android.
- Cabe en GPU de consumo: si, por el tamano reducido del binario, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: whisper.cpp (formato nativo ggml). No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jenila-ai/whisper-small-ggml | no disponible (variante small de Whisper) | no disponible | ggml q8_0 | MIT | Hugging Face, 0 descargas |
| Whisper small original (OpenAI) | ~244 M (dato no confirmado en la ficha) | no disponible | PyTorch | MIT | Repositorio oficial de OpenAI |
| ggml-small-q8_0.bin (ggerganov/whisper.cpp) | identico al anterior | no disponible | ggml q8_0 | MIT | Repositorio de whisper.cpp |

La comparativa se limita a variantes del mismo modelo, ya que la informacion proporcionada no incluye datos de rendimiento ni de otros sistemas ASR con los que contrastar.

## Limitaciones y advertencias

- El repositorio no aporta ningun valor tecnico anadido: es una copia sin cambios de un fichero ya disponible en ggerganov/whisper.cpp.
- Sin descargas ni likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- La model card no documenta sesgos, tasas de alucinacion ni limitaciones por idioma.
- La cuantizacion q8_0 puede introducir una perdida menor de precision frente a los pesos originales, no cuantificada por el autor.
- No se detalla la lista de idiomas soportados ni la calidad por idioma.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo Whisper original de OpenAI y del binario de whisper.cpp.
- No hay informacion sobre latencia, throughput ni requisitos minimos de CPU, lo que dificulta planificar despliegues en produccion.
- El uso declarado (transcripcion de letras de canciones) puede plantear cuestiones de derechos de autor sobre el contenido transcrito, ajenas a la licencia del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/jenila-ai/whisper-small-ggml
- Licencia: https://huggingface.co/jenila-ai/whisper-small-ggml/blob/main/LICENSE
- OpenAI Whisper: https://github.com/openai/whisper
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
