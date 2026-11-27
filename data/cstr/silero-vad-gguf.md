# cstr/silero-vad-GGUF

## Resumen

Silero VAD v6.3 en formato ggml es la conversión del detector de actividad de voz (VAD) de Silero al formato binario que consumen whisper.cpp y CrispASR. No se trata de un modelo generativo ni de un LLM: es un clasificador binario ligero que decide, trama a trama, si un fragmento de audio de 16 kHz contiene voz humana o silencio/ruido. Su utilidad práctica es la de cualquier VAD en un pipeline de ASR: segmentar el audio antes de transcribir, eliminar silencios y reducir coste computacional.

El modelo original lo desarrolla el equipo de Silero (snakers4), publicado bajo licencia MIT. Esta versión concreta la ha empaquetado el usuario `cstr` para el ecosistema ggml, de modo que pueda cargarse directamente en whisper.cpp y en CrispASR sin depender de PyTorch ni de ONNX Runtime. El repositorio es mínimo (0.0 GB según Hugging Face, un único binario) y no incluye pesos en safetensors ni una model card extensa.

La relevancia es operativa: permite incorporar detección de voz en herramientas C/C++ de transcripción con una dependencia trivial. La versión 6.3 es, según el autor, ligeramente más estricta que la 6.2 con el mismo umbral, y por eso CrispASR mantiene v6.2 como valor por defecto. Solo se incluye el modelo de 16 kHz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal ligera de deteccion de actividad de voz (VAD); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa tramas de audio, no secuencias de texto) |
| Tipos de cuantizacion | no disponible; se distribuye un unico binario ggml (`ggml-silero-v6.3.0.bin`) |
| Idiomas soportados | no disponible (la deteccion de voz es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ggml (binario `.bin`), compatible con whisper.cpp y CrispASR |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del detector: la model card solo indica que se trata de Silero VAD v6.3, convertido desde el paquete `silero-vad` 6.3 de PyPI mediante el script `models/convert-silero-vad-to-ggml.py` de CrispASR. No se especifican capas, dimensiones ocultas, numero de parametros ni el dataset de entrenamiento.

El dato tecnico relevante es la conversion a ggml: el binario resultante tiene sha256 `93ecafbf3a42360a17ae2149ed24745587ce599d981c386ea48ab6fabcffdbd1` y es byte a byte identico al publicado en la discusion `ggml-org/whisper-vad#2`. Solo se ha convertido la variante de 16 kHz. No hay informacion sobre RLHF, fine-tuning ni innovaciones de decodificacion.

## Capacidades

- Deteccion de actividad de voz sobre audio muestreado a 16 kHz.
- Clasificacion trama a trama de voz frente a silencio o ruido, con umbral configurable.
- Segmentacion de audio previa a la transcripcion en pipelines de ASR.
- Integracion nativa en whisper.cpp y CrispASR mediante el flag `--vad -vm silero-v6.3`.
- Funcionamiento sin dependencias de PyTorch u ONNX Runtime, al estar en formato ggml.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni agentes.

## Casos de uso

- Preprocesado en whisper.cpp: activar `--vad` para que el motor descarte silencios antes de transcribir, reduciendo el tiempo de inferencia en grabaciones con pausas largas.
- Segmentacion en CrispASR: usar `-vm silero-v6.3` para trocear reuniones o podcasts en fragmentos con voz antes de pasarlos al modelo de reconocimiento.
- Filtrado de audio en bruto: eliminar tramos sin habla de grabaciones de campo o de llamadas antes de almacenarlas o procesarlas.
- Deteccion de turnos de palabra: marcar los intervalos con voz para construir diarizaciones simples o alinear subtitulos.
- Reduccion de coste en pipelines por lotes: descartar ficheros o tramos silenciosos antes de invocar un ASR mas pesado y caro.
- Control de calidad de grabaciones: verificar que un audio contiene voz efectiva antes de encolar un trabajo de transcripcion.
- Integracion en herramientas C/C++: al ser un binario ggml, se enlaza en aplicaciones nativas sin arrastrar el stack de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por la naturaleza del modelo (VAD ligero) el consumo es muy bajo, pero no se aportan cifras.
- GPU recomendadas: no disponible; el modelo esta pensado para ejecucion en CPU dentro de whisper.cpp y CrispASR.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: whisper.cpp y CrispASR (formato ggml). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VAD.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Contexto / modalidad | Notas |
|---|---|---|---|---|
| Silero VAD v6.3 (este repo) | ggml | MIT | Audio 16 kHz | Conversion para whisper.cpp y CrispASR |
| Silero VAD v6.2 | PyTorch / ONNX / ggml (segun distribucion) | MIT | Audio 16 kHz | Version anterior; valor por defecto en CrispASR por ser menos estricta con el mismo umbral |
| Silero VAD v6.3 original (snakers4) | PyTorch | MIT | Audio 16 kHz | Version de referencia antes de la conversion a ggml |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se ha convertido el modelo de 16 kHz; no hay variante de 8 kHz en este repositorio.
- La version 6.3 es mas estricta que la 6.2 con el mismo umbral, lo que puede aumentar los falsos negativos en audio con voz debil o ruidosa.
- No es un modelo de reconocimiento de voz: no transcribe ni identifica hablantes, solo detecta presencia de voz.
- No se documentan sesgos, comportamiento multilingue ni robustez frente a ruido especifico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad registrada.
- Aunque la licencia es MIT, conviene verificar la procedencia del binario (sha256 indicado) antes de usarlo en produccion.
- No hay informacion sobre latencia ni consumo para planificar capacidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cstr/silero-vad-GGUF
- Release de Silero VAD v6.3: https://github.com/snakers4/silero-vad/releases/tag/v6.3
- CrispASR: https://github.com/CrispStrobe/CrispASR
- Discusion de whisper-vad con el binario identico: https://huggingface.co/ggml-org/whisper-vad/discussions/2
