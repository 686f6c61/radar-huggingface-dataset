# nuvais/Fanar-2-Oryx-IVU-Q8_0-GGUF

## Resumen

Fanar-2-Oryx-IVU-Q8_0-GGUF es una cuantización en formato GGUF del modelo QCRI/Fanar-2-Oryx-IVU, desarrollado originalmente por el Qatar Computing Research Institute (QCRI) como parte de la familia Fanar 2.0, una pila de IA generativa centrada en árabe que incluye modelos especializados en texto, imagen, poesía y comprensión visual. El modelo base es un sistema de comprensión de imagen y vídeo "Arabic-first" construido sobre Qwen2.5-VL 7B, con aproximadamente 7.615 millones de parámetros. Esta variante concreta ha sido publicada por el usuario nuvais para facilitar su despliegue en endpoints de inferencia.

El repositorio contiene dos ficheros: la cuantización Q8_0 de los pesos (8,1 GB) y el proyector visual mmproj en f16 (1,4 GB). La cuantización original fue producida por mradermacher y aquí se copia sin modificaciones para que un Inference Endpoint descargue únicamente dos ficheros en lugar de todas las cuantizaciones del repositorio fuente. Está pensada para servirse con llama.cpp y su pipeline es image-text-to-text.

Su relevancia actual radica en dos factores: por un lado, ofrece comprensión multimodal (imagen y vídeo) con foco en árabe, un nicho poco cubierto por los modelos abiertos habituales; por otro, el empaquetado GGUF con proyector visual permite desplegarlo en hardware modesto (el autor cita una NVIDIA L4 con scale to zero) manteniendo una API compatible con OpenAI. El caso de uso declarado es Darbi, una app que ayuda a profesionales de Catar a entender contenido en inglés explicándolo en árabe del Golfo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen2.5-VL 7B, con torre de visión y proyector multimodal) |
| Parametros totales | 7.615.616.512 (~7,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos) y proyector visual mmproj en f16 |
| Idiomas soportados | ar (árabe), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con fichero mmproj separado para visión |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. El modelo base QCRI/Fanar-2-Oryx-IVU se describe como un modelo de comprensión de imagen y vídeo "Arabic-first" construido sobre Qwen2.5-VL 7B, lo que implica una arquitectura transformer multimodal con un codificador visual y un proyector que conecta las representaciones visuales con el modelo de lenguaje. El número de tokens de entrenamiento, la composición del dataset y si hubo etapas de RLHF o DPO no están disponibles.

La innovación destacable de esta publicación concreta no está en el entrenamiento sino en el empaquetado: la separación entre los pesos cuantizados Q8_0 y el proyector visual en f16 permite servir el modelo con llama.cpp usando el flag `--mmproj`, manteniendo la calidad de la torre visual sin cuantizar. La cuantización original fue realizada por mradermacher en la revisión `3dbf1c82aa4298aff7ddc41862e5315dcdd8d0b2`, y los ficheros se copian sin cambios, con hashes SHA-256 publicados para verificación.

## Capacidades

- Comprensión de imagen: el pipeline declarado es image-text-to-text, con soporte de entrada de imágenes vía `image_url` en chat completions compatibles con OpenAI.
- Comprensión de vídeo: el modelo base se describe como modelo de comprensión de imagen y vídeo.
- Generación de texto conversacional en árabe e inglés.
- Explicación y reformulación de contenido: el caso de uso declarado lee texto en inglés presente en pantallas, diapositivas o correos y lo explica en árabe del Golfo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a árabe e inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Explicación de contenido en inglés para hablantes de árabe: es el caso declarado por el autor. El usuario fotografía una pantalla, diapositiva o correo en inglés y el modelo lo lee mediante la torre visual y lo explica en árabe del Golfo, apoyándose en el pipeline image-text-to-text.
- Atención al cliente en árabe con soporte de imágenes: un usuario puede enviar una captura de un recibo, un formulario o un mensaje de error y el modelo interpreta la imagen y responde en árabe, gracias a la combinación de visión y generación de texto.
- Digitalización y accesibilidad de documentación: lectura de documentos escaneados o fotografías de pantallas para generar resúmenes o explicaciones en árabe, útil en entornos donde el material original está en inglés.
- Soporte educativo y de formación: el modelo puede actuar como tutor que interpreta diagramas, gráficos o capturas de herramientas y los explica en árabe, un escenario alineado con el caso Darbi para profesionales que aprenden el lenguaje de la IA.
- Análisis de vídeo con narración en árabe: dado que el modelo base cubre comprensión de vídeo, puede emplearse para describir o resumir clips en árabe, aunque el soporte exacto de vídeo en el pipeline GGUF debe validarse.
- Despliegue en endpoints con scale to zero: el empaquetado de dos ficheros y el tamaño Q8_0 (8,1 GB más 1,4 GB de proyector) permiten servirlo en una única GPU L4 con llama.cpp y API compatible con OpenAI, adecuado para prototipos y aplicaciones de bajo tráfico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q8_0 ocupan 8,1 GB y el proyector visual f16 1,4 GB, por lo que se necesita aproximadamente 10 GB solo para los ficheros, más overhead de contexto y caché KV; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM.
- GPU recomendadas: el autor cita una NVIDIA L4 (24 GB) para el Inference Endpoint. Una RTX 4090 (24 GB) o una A100/H100 son holgadas; una RTX 3090 (24 GB) también es suficiente.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 16 GB o más de VRAM (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX 3090). En 12 GB podría ser ajustado según la longitud de contexto.
- Opciones de despliegue: llama.cpp (servidor con `--mmproj`), endpoints compatibles con OpenAI, Hugging Face Inference Endpoints. No se menciona soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Fanar-2-Oryx-IVU Q8_0 (este) | ~7,6 B | no disponible | imagen, vídeo, texto | apache-2.0 | GGUF |
| QCRI/Fanar-2-Oryx-IVU (base) | ~7,6 B | no disponible | imagen, vídeo, texto | no disponible en la información | safetensors (presumible) |
| Qwen2.5-VL 7B (modelo de partida) | ~7,6 B | no disponible en la información | imagen, vídeo, texto | no disponible en la información | safetensors, GGUF |
| mradermacher/Fanar-2-Oryx-IVU-GGUF | ~7,6 B | no disponible | imagen, vídeo, texto | no disponible en la información | GGUF (múltiples cuantizaciones) |

La comparativa se limita a las variantes del mismo modelo base y a su origen Qwen2.5-VL 7B, ya que no se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Idiomas: los metadatos solo declaran árabe e inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir explicaciones incorrectas del contenido visual; en el caso de uso de lectura de pantallas o documentos, los errores de OCR o de interpretación son un riesgo real.
- Contexto: la longitud de contexto no está documentada en la información disponible, lo que dificulta planificar cargas con documentos largos.
- Cuantización: Q8_0 introduce una pérdida mínima pero no nula respecto a los pesos originales; el proyector visual se mantiene en f16.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base QCRI/Fanar-2-Oryx-IVU, cuya licencia no se detalla en la información proporcionada.
- Repositorio de terceros: esta publicación la mantiene el usuario nuvais, no QCRI; la cuantización proviene de mradermacher. Para producción conviene fijar la revisión y verificar los hashes SHA-256 publicados.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Soporte de vídeo en GGUF: aunque el modelo base cubre vídeo, no se detalla cómo se sirve vídeo a través de llama.cpp en esta configuración.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/nuvais/Fanar-2-Oryx-IVU-Q8_0-GGUF
- Modelo base QCRI/Fanar-2-Oryx-IVU: https://huggingface.co/QCRI/Fanar-2-Oryx-IVU
- Cuantizaciones originales de mradermacher: https://huggingface.co/mradermacher/Fanar-2-Oryx-IVU-GGUF
- Colección Fanar 2.0 de QCRI: https://huggingface.co/collections/QCRI/fanar-20
