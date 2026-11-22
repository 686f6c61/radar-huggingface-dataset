# loom-ai-org/moonshine-streaming-tiny-loom

## Resumen

Moonshine Streaming Tiny Loom es un export en formato GGUF del reconocedor de voz Moonshine Streaming Tiny (34M de parametros) desarrollado por Useful Sensors, empaquetado por loom-ai-org para su ejecucion con el runtime loom.cpp. El modelo original resuelve el problema de transcripcion de voz a texto en ingles con un diseno orientado a eficiencia: un encoder de ventana deslizante sobre la forma de onda cruda y un decoder autorregresivo. Esta version no modifica los pesos, solo los reempaqueta en un GGUF autodescriptivo que incluye las topologias de grafo, el tokenizer y el script de controlador necesarios para su ejecucion.

La relevancia de este export radica en que permite ejecutar un ASR de tamano muy reducido (33,5 millones de parametros, repo de 0,4 GB) sin depender del ecosistema Python de Hugging Face ni de frameworks de inferencia convencionales, usando el runtime ligero loom-py. Es una opcion interesante para despliegues en dispositivos con recursos limitados, prototipos de transcripcion en tiempo real y pipelines donde se prefiera un formato GGUF autocontenido.

El modelo esta entrenado unicamente en ingles, procesa audio mono a 16 kHz y acepta clips de hasta 81,9 segundos por llamada. Su licencia MIT facilita la integracion comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (encoder de ventana deslizante sobre forma de onda cruda + decoder autorregresivo) |
| Parametros totales | 33.570.025 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 81,9 s de audio por llamada (tabla de posiciones del decoder con 4096 filas de encoder a 50 por segundo) |
| Tipos de cuantizacion | no disponible (el repo publica un unico GGUF; no se detallan variantes de cuantizacion) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (export de loom.cpp, generado con loom-exporter) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder. El encoder opera sobre la forma de onda cruda del audio mediante ventanas deslizantes, sin un frontend de caracteristicas tipo mel espectrograma, y el decoder es autorregenerativo. El export conserva los pesos originales sin modificacion y los empaqueta en un GGUF que embebe las topologias de grafo, el tokenizer (si aplica) y el script de controlador del modelo, de modo que el runtime loom.cpp puede ejecutar la inferencia sin componentes externos.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card original menciona que la decodificacion es greedy y esta limitada a 6,5 tokens por segundo de audio "para evitar bucles de alucinacion", lo que sugiere un diseno de decodificacion conservador orientado a estabilidad en audio ruidoso o muy corto. El export no ejecuta el encoder de forma incremental: procesa el clip completo en una pasada, aunque la API de loom-py expone una interfaz de streaming que entrega actualizaciones a medida que llega el audio.

## Capacidades

- Reconocimiento automatico de voz (speech-to-text) en ingles sobre audio mono a 16 kHz.
- Procesamiento de clips de hasta 81,9 segundos por llamada; clips mas largos se rechazan con error en lugar de truncarse.
- Interfaz de streaming: `model.speech2text.stream()` permite empujar audio por fragmentos (por ejemplo, un segundo a la vez) y leer la transcripcion a medida que crece, con indicacion de si el texto previo se ha revisado (`update.revised`).
- Salida con marcas de tiempo: `timestamps=True` devuelve segmentos, aunque el modelo no emite tokens de timestamp, por lo que `segments` es un unico tramo que cubre todo el clip y `result.timestamped` es `False`.
- Sin soporte de seleccion de idioma: el modelo decodifica en el unico idioma para el que fue entrenado y no acepta argumento `language=` (si se pasa, avisa y lo ignora).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Transcripcion de notas de voz y reuniones cortas: el modelo acepta clips de hasta 81,9 segundos, por lo que es adecuado para fragmentos de audio divididos en pausas mediante un VAD como `silero-vad-loom`, transcribiendo cada parte y concatenando el resultado.
- Dictado en aplicaciones de escritorio: con 33,5 millones de parametros y un repo de 0,4 GB, el modelo cabe en dispositivos con recursos limitados y puede integrarse en herramientas de dictado en ingles con latencia baja.
- Subtitulado de contenido en ingles: la API de streaming permite alimentar audio por fragmentos y obtener transcripciones parciales, util para generar subtitulos aproximados en tiempo real (sin marcas de tiempo reales, ya que el modelo no las emite).
- Prototipado rapido en Python: la instalacion via `pip install -U "loom-py-rt[hub]>=1.0.0"` y la carga con `loom.Model.from_pretrained` permiten montar un pipeline de ASR en pocas lineas para validar ideas antes de invertir en modelos mayores.
- Procesamiento por lotes de audio corto: para archivOS de entrevistas, encuestas o comandos de voz, el modelo puede transcribir clips cortos de forma secuencial con un consumo de memoria minimo.
- Integracion en pipelines embebidos o edge: el formato GGUF autocontenido y la ausencia de dependencias pesadas facilitan su despliegue en entornos donde no se quiere arrastrar el stack completo de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 33,5 millones de parametros y un repo de 0,4 GB, la huella de memoria es muy reducida y cabe holgadamente en GPUs consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos unos pocos GB de memoria libre es suficiente. No se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque no se proporcionan cifras exactas de VRAM.
- Opciones de despliegue: runtime loom-py (`loom-py-rt` en PyPI) sobre el motor loom.cpp; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La decodificacion esta limitada a 6,5 tokens por segundo de audio y los clips menores de 0,3 s no devuelven texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Moonshine Streaming Tiny Loom | 33,5 M | 81,9 s de audio | Ingles | MIT | GGUF (loom.cpp) |
| Moonshine Streaming Tiny (original) | 34 M (aprox.) | no disponible en la informacion | Ingles | MIT | Pesos originales de Hugging Face |
| Otros ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Limite estricto de 81,9 segundos por llamada: los clips mas largos se rechazan con error, no se truncan. Es necesario dividir el audio en pausas (por ejemplo, con un VAD) antes de transcribir.
- Solo ingles: no admite seleccion de idioma ni traduccion; el argumento `language=` se ignora con aviso.
- Sin marcas de tiempo reales: el modelo no emite tokens de timestamp, por lo que `result.timestamped` es `False` y los segmentos devueltos no reflejan limites elegidos por el modelo.
- Riesgo de alucinacion y repeticion: como otros reconocedores encoder-decoder, puede repetir o inventar palabras en audio ruidoso o muy corto. La decodificacion greedy esta limitada a 6,5 tokens por segundo de audio para mitigar bucles.
- Clips muy cortos: por debajo de aproximadamente 0,3 s no se devuelve texto.
- Sin streaming incremental real en el encoder: el export procesa el clip completo en una pasada; la interfaz de streaming de loom-py entrega actualizaciones, pero no ejecuta el encoder de forma incremental.
- Audio mono a 16 kHz exclusivamente.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base original.
- Sesgos: no se documentan sesgos especificos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/moonshine-streaming-tiny-loom
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
