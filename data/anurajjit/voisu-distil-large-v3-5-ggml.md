# Anurajjit/voisu-distil-large-v3.5-ggml

## Resumen

voisu-distil-large-v3.5-ggml es una cuantización de 8 bits (q8_0) del modelo de reconocimiento automático de voz distil-whisper/distil-large-v3.5, publicada por el usuario Anurajjit para su uso con la implementación whisper.cpp. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia local eficiente: el autor parte del fichero GGML en f16 publicado por el equipo de distil-whisper y lo cuantiza con la herramienta `whisper-quantize` del tag v1.9.5 de whisper.cpp.

El modelo resuelve el problema de ejecutar un sistema ASR de calidad cercana a Whisper large en hardware modesto, reduciendo el peso del fichero a unos 818 MB (0,8 GB de repositorio). Está pensado para el modo local de la aplicación Voisu, según indica la propia model card, y su licencia MIT facilita la integración en productos comerciales.

La relevancia actual es doble: por un lado, distil-large-v3.5 es una destilación del Whisper large-v3.5 con aproximadamente la mitad de capas del codificador, lo que acelera la inferencia manteniendo una tasa de error baja; por otro, el formato GGML permite desplegarlo en CPU sin GPU dedicada mediante whisper.cpp. La información pública disponible es muy limitada: el repositorio no incluye pipeline declarado, no tiene descargas ni likes y la model card se limita a documentar el proceso de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), destilado; formato GGML para whisper.cpp |
| Parametros totales | no disponible (el fichero q8_0 pesa 818.305.955 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper: 30 segundos por segmento) |
| Tipos de cuantizacion | q8_0 (8 bits); el origen f16 está disponible en el repo de distil-whisper |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGML binario (`ggml-distil-large-v3.5-q8_0.bin`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder con atención completa que procesa espectrogramas Mel de 30 segundos y genera tokens de texto de forma autorregresiva. distil-large-v3.5 es una versión destilada del Whisper large-v3.5 en la que se ha reducido el número de capas del codificador (aproximadamente la mitad) y se ha entrenado con una combinación de pérdida de destilación sobre las salidas del profesor y pérdida supervisada sobre transcripciones reales. La model card de este repositorio no aporta detalles sobre el número exacto de tokens de entrenamiento ni sobre la composición del dataset de destilación; esa información debe consultarse en la model card del modelo base.

La innovación de esta publicación concreta no está en el entrenamiento, sino en el empaquetado: se aplica `whisper-quantize` de whisper.cpp v1.9.5 sobre el fichero f16 oficial, produciendo un binario q8_0 con hash SHA-256 verificado. La cuantización a 8 bits reduce el tamaño aproximadamente a la mitad respecto a f16 con una degradación de precisión habitualmente mínima en tareas ASR, y permite ejecución en CPU con instrucciones SIMD y, opcionalmente, aceleración parcial en GPU mediante los backends de whisper.cpp (Metal, CUDA, Vulkan). No se documenta en la información disponible ningún proceso de RLHF, DPO ni ajuste fino adicional por parte del autor de esta conversión.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio de hasta 30 segundos por segmento, con manejo de audio más largo mediante segmentación interna.
- Detección de actividad de voz y marcas de tiempo a nivel de segmento y de palabra (según las capacidades estándar de whisper.cpp).
- Traducción al inglés desde otros idiomas únicamente si el modelo base conserva esa capacidad; la model card solo declara `language: en`, por lo que el uso multilingüe no está garantizado.
- Ejecución totalmente local y offline mediante whisper.cpp, sin dependencia de APIs externas.
- Inferencia en CPU y aceleración opcional en GPU a través de los backends de whisper.cpp.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No se documentan capacidades de visión, audio generativo ni modo "thinking".

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el binario q8_0 de 818 MB puede cargarse en un portátil convencional y transcribir audio en inglés sin enviar datos a la nube, lo que encaja en escenarios con requisitos de privacidad.
- Subtitulado automático de vídeo: whisper.cpp genera marcas de tiempo por segmento que pueden exportarse a SRT/VTT; el modelo destilado reduce el tiempo de proceso frente a Whisper large completo.
- Integración en aplicaciones de escritorio tipo Voisu: el modo local de la aplicación usa exactamente esta conversión, de modo que sirve como referencia para empaquetar ASR en un producto de escritorio.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: al ser GGML y ejecutarse en CPU, se puede desplegar en contenedores ligeros para transcribir grandes volúmenes de grabaciones en inglés.
- Dictado por voz en herramientas de productividad: la latencia de un modelo destilado cuantizado permite transcripción casi en tiempo real en fragmentos cortos.
- Prototipado e investigación en ASR: sirve como línea base reproducible (hash y versión de herramienta documentados) para comparar cuantizaciones q8_0 frente a f16 en tareas de reconocimiento de voz.
- Filtrado y búsqueda de contenido hablado: transcripción previa de archivos de audio para indexación semántica en sistemas de búsqueda internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta el proceso de cuantización, el tamaño del fichero resultante y los hashes de verificación; no incluye métricas de WER, velocidad ni comparaciones con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: no aplica en ejecución CPU; en GPU, el fichero q8_0 ocupa unos 0,8 GB, por lo que cabe holgadamente en cualquier GPU con 2 GB o más de memoria.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) mediante los backends CUDA o Vulkan de whisper.cpp; también Apple Silicon mediante Metal.
- Cabe en GPU consumer: sí, sin restricciones prácticas por memoria; el cuello de botella es de cómputo, no de VRAM.
- Despliegue: whisper.cpp es la vía principal (binario `main` o `whisper-cli`); no se documenta compatibilidad con vLLM, TGI u Ollama, que no soportan este formato de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, del backend y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| voisu-distil-large-v3.5-ggml (q8_0) | no disponible | 30 s por segmento | en | MIT | GGML | Cuantización q8_0 para whisper.cpp |
| distil-whisper/distil-large-v3.5 (f16) | no disponible | 30 s por segmento | en | MIT | safetensors / GGML f16 | Modelo base sin cuantizar |
| openai/whisper-large-v3 | 1.550 M aprox. | 30 s por segmento | multilingüe | MIT | safetensors, GGML | Mayor tamaño y coste de inferencia |
| openai/whisper-small | 244 M aprox. | 30 s por segmento | multilingüe | MIT | safetensors, GGML | Menor calidad, mucho más rápido en CPU |

Los datos de parámetros de whisper-large-v3 y whisper-small corresponden a las cifras publicadas por OpenAI; para distil-large-v3.5 no se dispone del recuento exacto en la información proporcionada. La comparación de rendimiento (WER, velocidad) no está disponible para esta cuantización concreta.

## Limitaciones y advertencias

- Solo se declara inglés (`language: en`); el uso con otros idiomas no está soportado ni verificado en esta publicación.
- Al ser una cuantización q8_0, puede existir una degradación menor de precisión frente al f16 original; no se documenta su magnitud.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada; se recomienda validación en producción.
- Sesgos acústicos y demográficos heredados del corpus de entrenamiento del modelo base, no evaluados en esta conversión.
- La model card no incluye pipeline declarado ni métricas; el repositorio tiene cero descargas y cero likes, por lo que no hay evidencia de uso en producción.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base y de whisper.cpp/ggml antes de un despliegue comercial.
- El formato GGML limita las opciones de serving: no es compatible de forma nativa con stacks como vLLM o TGI, y requiere whisper.cpp o herramientas equivalentes.
- La ventana de audio es de 30 segundos por segmento; audios más largos dependen de la segmentación implementada por whisper.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anurajjit/voisu-distil-large-v3.5-ggml
- Modelo base: https://huggingface.co/distil-whisper/distil-large-v3.5
- Conversión GGML f16 de origen: https://huggingface.co/distil-whisper/distil-large-v3.5-ggml
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
