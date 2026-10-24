# openmodelai/Audit

## Resumen

Audit es un paquete de reconocimiento automático de voz (ASR) publicado por el usuario openmodelai en HuggingFace. No es un modelo entrenado desde cero: es el modelo **Whisper base** multilingüe de OpenAI (unos 74 millones de parámetros, arquitectura transformer encoder-decoder) convertido al formato CTranslate2 y cuantizado a int8, con un envoltorio en Python que añade CLI y servidor HTTP. El repositorio incluye los scripts que reconstruyen los pesos a partir de dos paquetes publicados en PyPI, los unen y los cuantizan, de modo que el binario final ocupa unos 74 MB frente a los ~145 MB en fp16.

El problema que resuelve es práctico: ofrecer transcripción de audio a texto multilingüe (99 idiomas, incluidos ruso e inglés) que funcione en CPU sin PyTorch ni GPU, con un único runtime ligero (CTranslate2 vía faster-whisper). Es relevante para despliegues en entornos con recursos limitados o sin acelerador, donde instalar la pila completa de PyTorch no es viable.

Conviene subrayar que el nombre «Audit» no describe una función de auditoría de modelos, sino que es la denominación comercial del paquete; la búsqueda web devuelve mayoritariamente herramientas de auditoría de IA sin relación con este repositorio. La model card está redactada en ruso y el repositorio no declara pipeline, licencia ni idiomas en los metadatos de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base de OpenAI), ejecutado con runtime CTranslate2 |
| Parámetros totales | ~74 millones (Whisper base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de 30 segundos de audio por segmento (límite nativo de Whisper); sin contexto de texto persistente |
| Tipos de cuantización | int8 con escalas per-channel (algoritmo de CTranslate2); pesos originales en fp16 (~145 MB) reducidos a ~74 MB |
| Idiomas soportados | 99 idiomas según la model card (incluye ruso e inglés); la metadata de HuggingFace no los declara |
| Licencia | MIT para los pesos (OpenAI Whisper) y MIT para el código, según la model card; la metadata de HuggingFace indica «no disponible» y los paquetes de runtime tienen sus propias licencias |
| Formato de pesos | CTranslate2: `model.bin` (int8) + `config.json` + `tokenizer.json` + `vocabulary.txt`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper base de OpenAI: un transformer encoder-decoder que procesa espectrogramas Mel logarítmicos en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva, con tokens especiales de control de idioma y de tarea (transcripción o traducción). El modelo original fue entrenado por OpenAI sobre 680.000 horas de audio débilmente supervisado y multilingüe; este repositorio **no aporta entrenamiento adicional**, solo empaquetado y cuantización.

El proceso de construcción es explícito y reproducible: dos wheels de PyPI (`gympulse-whisper-base-part1` y `gympulse-whisper-base-part2`) contienen `model.bin.part1` y `model.bin.part2`, que se concatenan con `cat` para reconstruir el `model.bin` de CTranslate2; después se verifica la cabecera (versión 6 + `WhisperSpec`) y el SHA-256, y finalmente se aplica la cuantización int8. El autor afirma que la transcripción resultante es idéntica a la versión fp16 en una muestra de habla real, aunque no publica la metodología ni las métricas de esa comparación. El peso base procede de la conversión `Systran/faster-whisper-base`.

## Capacidades

- Transcripción de voz a texto en 99 idiomas, con detección automática de idioma y retorno de la probabilidad asociada.
- Selección manual del idioma mediante el parámetro `--language` en la CLI o `?language=ru` en la API HTTP.
- Salida estructurada en JSON con los campos `text`, `language`, `probability` y `segments` (segmentos con marcas temporales).
- Traducción de voz a texto en inglés (capacidad nativa de Whisper cuando se selecciona la tarea de traducción).
- Ejecución en CPU sin PyTorch ni GPU, gracias al runtime CTranslate2 de faster-whisper.
- Interfaz web mínima servida en `GET /` para subir un archivo de audio y obtener la transcripción.
- API HTTP simple: `POST /transcribe` acepta el audio como cuerpo binario de la petición.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni modo «thinking»: es exclusivamente un modelo ASR.

## Casos de uso

- **Transcripción de reuniones y notas de voz en entornos sin GPU**: el modelo procesa audio en CPU a 1–3 veces la velocidad de reproducción con cuantización int8, suficiente para transcribir reuniones de forma asíncrona en un servidor modesto o incluso en un portátil.
- **Subtitulado automático de vídeo**: la salida JSON incluye segmentos, lo que permite generar ficheros de subtítulos con marcas temporales sin post-procesado adicional; útil para canales en ruso, inglés u otros idiomas soportados.
- **Atención al cliente y análisis de llamadas**: desplegando el servidor HTTP en un contenedor ligero se pueden transcribir grabaciones de llamadas para alimentar sistemas de búsqueda, resumen o control de calidad; la ventana de 30 segundos obliga a trocear el audio.
- **Accesibilidad en aplicaciones internas**: integrar `POST /transcribe` en una herramienta web añade dictado o transcripción a usuarios con dificultades motoras, con un coste de infraestructura mínimo (un único binario de 74 MB).
- **Indexación y búsqueda de podcast o archivos de audio**: transcribir por lotes un archivo de episodios en CPU y almacenar el texto para búsqueda full-text; el throughput es adecuado para procesos nocturnos, no para tiempo real estricto.
- **Prototipado e investigación en ASR**: el pipeline reproducible (descarga desde PyPI, concatenación de partes, cuantización, smoke test) sirve como banco de pruebas para experimentar con CTranslate2 y faster-whisper antes de escalar a modelos medium o large.
- **Transcripción de voz en aplicaciones de escritorio offline**: al no requerir PyTorch ni conexión de red en inferencia, encaja en herramientas de escritorio que deban funcionar sin GPU y con un instalador pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye valores de WER, comparativas con otras variantes de Whisper ni métricas objetivas; únicamente afirma que la transcripción int8 es «idéntica» a la fp16 en una muestra de habla real, sin detallar el conjunto de evaluación ni el procedimiento de comparación.

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU. Los pesos int8 ocupan ~74 MB; en caso de forzar ejecución en GPU con CTranslate2, el consumo sería inferior a 1 GB de VRAM.
- **CPU**: cualquier CPU x86-64 moderna con soporte AVX2 es suficiente. El autor indica un rendimiento de 1–3 veces la velocidad de reproducción de audio con cuantización int8.
- **GPU recomendadas**: no son necesarias ni se documentan; funcionaría en cualquier GPU NVIDIA con CUDA si se configura el dispositivo, pero el objetivo del paquete es CPU.
- **¿Cabe en consumer GPU?**: sí, con enorme holgura; también en hardware de gama baja, Raspberry Pi de gama alta o instancias cloud de 1 vCPU.
- **Opciones de despliegue**: CLI (`python -m audio_audit.cli`), servidor HTTP propio (`python -m audio_audit.server --port 8000`) y la librería faster-whisper/CTranslate2 por debajo. No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp, que de hecho no aplican a un modelo ASR de este formato.
- **Latencia y throughput**: solo se conoce la estimación cualitativa de 1–3× tiempo real en CPU moderna; no hay cifras de latencia por petición ni de throughput concurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Audit (Whisper base + CTranslate2 int8) | ~74 M | 30 s por ventana | 99 | MIT (pesos y código, según model card) | CTranslate2 int8, CPU |
| Whisper tiny (OpenAI) | ~39 M | 30 s por ventana | 99 | MIT | PyTorch, safetensors |
| Whisper base (OpenAI, original) | ~74 M | 30 s por ventana | 99 | MIT | PyTorch, safetensors |
| Whisper small (OpenAI) | ~244 M | 30 s por ventana | 99 | MIT | PyTorch, safetensors |
| faster-whisper-base (Systran) | ~74 M | 30 s por ventana | 99 | MIT | CTranslate2 fp16/int8 |

Audit se sitúa funcionalmente en el mismo punto que `Systran/faster-whisper-base` y que el Whisper base original; su única diferencia práctica es el empaquetado (scripts de reconstrucción desde PyPI, cuantización int8 por defecto y servidor HTTP incluido). Frente a Whisper small o medium pierde precisión en acentos y ruido a cambio de velocidad y tamaño; no se dispone de métricas que cuantifiquen esa diferencia en este repositorio.

## Limitaciones y advertencias

- **Calidad propia de un modelo base**: Whisper base es el modelo multilingüe más pequeño de OpenAI; la model card reconoce que queda por detrás de medium y large, especialmente con acentos marcados y ruido de fondo.
- **Alucinación en silencios y ruido**: el autor advierte explícitamente de que el modelo puede «inventar» texto cuando el audio no contiene habla clara; es imprescindible filtrar segmentos con baja probabilidad y aplicar detección de actividad de voz (VAD) en producción.
- **No apto para uso forense ni exámenes**: la propia model card lo desaconseja para fines de examen; tampoco debe usarse como registro fiable sin revisión humana.
- **Segmentación obligatoria**: la ventana nativa de 30 segundos implica trocear audios largos y gestionar las fronteras; una segmentación incorrecta degrada la transcripción.
- **Ámbito limitado a ASR**: no genera texto libre, no razona, no ejecuta herramientas y no procesa imágenes; cualquier caso de uso que requiera un LLM necesita otro modelo.
- **Ambigüedad de nombre y de licencia**: el nombre «Audit» se confunde con herramientas de auditoría de modelos, y los metadatos de HuggingFace no declaran licencia ni idiomas, aunque la model card indique MIT. Conviene verificar la licencia de los paquetes de runtime (`faster-whisper`, `ctranslate2`) antes de uso comercial.
- **Trazabilidad del empaquetado**: los pesos se reconstruyen concatenando dos partes publicadas en PyPI bajo un nombre de autor distinto (`gympulse`), lo que añade un paso de cadena de suministro que debe auditarse (el script verifica SHA-256, pero el hash de referencia no se publica en la model card).
- **Sesgos heredados**: al no haber ajuste fino, el modelo arrastra los sesgos del corpus de entrenamiento de Whisper en cuanto a variedades dialectales, género y representación lingüística.
- **Repositorio sin tracción**: 0 descargas y 1 «like» en el momento de la consulta, con fecha de creación en 2026-10-24; no hay evidencia de mantenimiento ni de comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openmodelai/Audit
- Conversión base en CTranslate2: https://huggingface.co/Systran/faster-whisper-base
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Modelo Whisper base original: https://huggingface.co/openai/whisper-base
- Runtime faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Paquete PyPI de la parte 1 de los pesos: https://pypi.org/project/gympulse-whisper-base-part1/
- Paquete PyPI de la parte 2 de los pesos: https://pypi.org/project/gympulse-whisper-base-part2/

Nota sobre la búsqueda web: los resultados obtenidos (openmodel.ai, Openlayer, promptfoo/modelaudit y docs.openmodel.ai) corresponden a pasarelas de API y escáneres de seguridad de modelos, y no guardan relación con este repositorio; no se han incluido como enlaces del modelo.
