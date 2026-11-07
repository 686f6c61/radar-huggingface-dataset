# johnpattern/safenotes-qwen3-asr-0.6b-ov

## Resumen

`safenotes-qwen3-asr-0.6b-ov` es una conversión de formato del modelo de reconocimiento automático de voz Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. El autor de esta variante es johnpattern, que la publica bajo el paraguas del proyecto Safenotes, una aplicación local de transcripción de reuniones que se ejecuta íntegramente en el PC del usuario. El modelo original pertenece a la familia Qwen3-ASR, que incluye las variantes de 1.7B y 0.6B y que, según el repositorio oficial de QwenLM, cubre identificación de idioma y reconocimiento de voz en 52 idiomas y dialectos.

El problema que resuelve esta conversión concreta es la portabilidad: el checkpoint original se ha exportado a OpenVINO IR con pesos cuantizados a int8 mediante NNCF y con el tokenizador convertido a IRs de OpenVINO, de modo que la inferencia se ejecuta de forma nativa sobre hardware Intel (CPU, iGPU y NPU compatibles) sin necesidad de GPU dedicada. No hay reentrenamiento: se trata exclusivamente de un cambio de formato y precisión.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de despliegue on-device de un modelo ASR pequeño (0,6B parámetros, repositorio de 0,8 GB) con licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Por otro, advierte de que no es una publicación oficial de Qwen y de que sus pesos int8 pueden degradar ligeramente la precisión respecto al checkpoint original en fp16/bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR-0.6B, derivado de la familia Qwen3-Omni; arquitectura interna no detallada en la información disponible) |
| Parametros totales | 0,6B (según el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos comprimidos con NNCF durante la exportación); no se publican otros formatos en este repositorio |
| Idiomas soportados | 52 idiomas y dialectos según el repositorio oficial QwenLM/Qwen3-ASR; la lista concreta no está en la información disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`) para encoder, decoder, tokenizer y detokenizer; JSON de configuración y tokenizador |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B es un sistema de reconocimiento automático de voz que, según el repositorio oficial de QwenLM, aprovecha la capacidad de comprensión de audio de su modelo fundacional Qwen3-Omni y se entrena con datos de voz a gran escala. La familia Qwen3-ASR soporta identificación de idioma y transcripción en 52 idiomas y dialectos, y la variante de 1.7B se presenta como estado del arte entre los modelos ASR de código abierto. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de audio ni si hubo etapas de alineación o ajuste fino supervisado específicas.

Esta variante concreta no introduce ningún cambio arquitectónico ni de entrenamiento: es una exportación con `optimum-intel` (OpenVINO) del checkpoint original en la revisión `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`, con compresión de pesos a int8 vía NNCF y conversión del tokenizador a IRs de OpenVINO mediante `openvino-tokenizers`. Los ficheros auxiliares (`vocab.json`, `merges.txt`, etc.) se descargan byte a byte del repositorio upstream. El paquete resultante tiene 12 ficheros y 802.150.036 bytes, con el decoder ocupando la mayor parte (unos 598 MB en `.bin`).

## Capacidades

- Reconocimiento automático de voz (ASR) en modo transcripción, con pipeline `automatic-speech-recognition`.
- Identificación de idioma hablado (language identification), capacidad que Safenotes emplea explícitamente para detección de idioma.
- Cobertura multilingüe de 52 idiomas y dialectos según la documentación oficial de la familia Qwen3-ASR.
- Generación de subtítulos en chino en tiempo real, según el caso de uso descrito por el autor de la conversión.
- Ejecución on-device sobre hardware Intel mediante OpenVINO, sin envío de audio ni texto a servidores externos.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones en local: Safenotes usa este modelo para convertir el audio de reuniones en texto sin salir del PC del usuario; el tamaño de 0,8 GB y la inferencia int8 en OpenVINO permiten ejecutarlo en portátiles con CPU Intel modernas.
- Subtitulado en vivo de contenido en chino: el autor indica que el modelo se emplea para generar subtítulos en chino en directo, aprovechando la detección de idioma integrada para conmutar entre hablantes.
- Detección automática del idioma hablado: antes de enrutar el audio a un transcriptor específico, el modelo puede clasificar el idioma de la locución, lo que simplifica pipelines multilingües.
- Aplicaciones de notas de voz y dictado offline: integrable en herramientas de escritorio que requieran privacidad estricta, ya que todo el procesamiento ocurre en el dispositivo y no hay dependencia de API externa.
- Transcripción por lotes en servidores con CPU Intel: al estar en formato OpenVINO IR, puede desplegarse con el runtime de OpenVINO en granjas de CPU sin GPU, reduciendo coste por hora frente a alternativas que exigen aceleradores dedicados.
- Preprocesado de audio para pipelines RAG o de análisis: transcribir grabaciones y alimentar índices de búsqueda o resúmenes posteriores, con la ventaja de que la licencia Apache-2.0 permite integrarlo en productos comerciales.
- Verificación de integridad en despliegues de borde: el repositorio publica el sha256 de cada fichero, lo que facilita pipelines de descarga verificada en aplicaciones distribuidas, como hace Safenotes con una revisión fijada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye métricas de WER, y los resultados citados en el repositorio oficial de QwenLM corresponden a la familia Qwen3-ASR (con mención al estado del arte de la variante 1.7B), no a esta exportación int8 concreta. No se dispone de datos de latencia ni throughput para esta variante.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo está pensado para ejecutarse en CPU, iGPU o NPU Intel mediante OpenVINO. El repositorio ocupa 0,8 GB en disco, y el decoder int8 ronda los 598 MB, por lo que la huella en memoria es del orden de 1 GB o inferior en inferencia.
- GPU recomendadas: no se especifican; el formato OpenVINO IR está orientado a hardware Intel (CPU con instrucciones AVX2/AVX-512, iGPU Intel y NPU Intel compatibles con OpenVINO).
- ¿Cabe en GPU de consumo? No es el objetivo de esta conversión; para GPUs NVIDIA conviene usar el checkpoint original de Qwen3-ASR-0.6B en lugar de esta exportación.
- Opciones de despliegue: runtime de OpenVINO (Python/C++), `optimum-intel` para integración con Transformers, y el ecosistema de OpenVINO GenAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `johnpattern/safenotes-qwen3-asr-0.6b-ov` (esta ficha) | 0,6B | no disponible | 52 idiomas y dialectos (según familia) | Apache-2.0 | OpenVINO IR int8 | Conversión no oficial, orientada a hardware Intel |
| `Qwen/Qwen3-ASR-0.6B` | 0,6B | no disponible | 52 idiomas y dialectos | Apache-2.0 | safetensors (checkpoint original) | Modelo oficial de Qwen; recomendado para GPU y para máxima fidelidad numérica |
| `Qwen/Qwen3-ASR-1.7B` | 1,7B | no disponible | 52 idiomas y dialectos | Apache-2.0 | safetensors | Variante mayor de la misma familia; el repositorio oficial la sitúa como estado del arte entre ASR open source |
| `Jinstudio/Qwen3-ASR-0.6B-hf` | 0,6B | no disponible | no disponible | no disponible | Transformers (HF) | Conversión comunitaria alternativa del mismo modelo base |

## Limitaciones y advertencias

- No es una publicación oficial de Qwen: el autor lo indica expresamente y aclara que los autores originales no avalan esta conversión.
- La cuantización int8 puede degradar la precisión de transcripción (WER) respecto al checkpoint original en fp16/bf16; no se publican métricas comparativas que cuantifiquen esa diferencia.
- El modelo se distribuye "as is", sin garantías de ningún tipo, incluida la idoneidad para un propósito concreto o la exactitud de la salida.
- Riesgo de alucinación y de errores de transcripción en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario técnico; es un comportamiento esperable en modelos ASR pequeños, aunque no se documentan tasas concretas.
- La lista exacta de los 52 idiomas y dialectos no está en la información disponible; conviene verificar la cobertura del idioma objetivo antes de desplegar.
- El formato OpenVINO IR limita el despliegue a hardware Intel compatible; en GPUs NVIDIA o AMD es preferible el checkpoint original.
- Solo se documenta el uso para detección de idioma y subtitulado en chino en la aplicación Safenotes; otros idiomas no están validados por el autor de la conversión.
- La licencia Apache-2.0 permite uso comercial, pero al ser una conversión no oficial conviene conservar la atribución a Qwen y revisar los términos del repositorio upstream.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/johnpattern/safenotes-qwen3-asr-0.6b-ov
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Revisión fijada del modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/tree/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Repositorio GitHub de la familia Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Conversión comunitaria alternativa a formato Transformers: https://huggingface.co/Jinstudio/Qwen3-ASR-0.6B-hf
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
