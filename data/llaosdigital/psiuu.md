# llaosdigital/psiuu

## Resumen

Psiuu es un repositorio de modelos en formato GGUF publicado por llaosdigital, pensado para alimentar la aplicación de transcripción de voz local del mismo nombre. No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos ya cuantizados: por un lado, Whisper Medium de OpenAI en Q8_0 (derivado de handy-computer/whisper-medium-gguf) y, por otro, Parakeet TDT 0.6B v3 de NVIDIA, también en Q8_0 (derivado de handy-computer/parakeet-tdt-0.6b-v3-gguf). El pipeline declarado es automatic-speech-recognition.

El componente principal, Whisper Medium, es un transformer encoder-decoder de aproximadamente 627 millones de parámetros orientado a reconocimiento automático del habla multilingüe. Su empaquetado en GGUF Q8_0 lo hace ejecutable en CPU y GPU de consumo mediante runtimes compatibles con llama.cpp, lo que encaja con el objetivo de la app: transcripción local sin depender de servicios en la nube.

La relevancia de este repositorio es práctica más que investigadora: ofrece artefactos listos para desplegar, con hashes SHA-256 publicados y licencias compatibles con uso comercial (Apache 2.0 para Whisper, CC-BY 4.0 para Parakeet), lo que simplifica la integración en productos de dictado y subtitulado. No incluye datos propios de entrenamiento ni benchmarks nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) para el componente principal; Parakeet TDT (FastConformer + TDT) para el componente secundario |
| Parametros totales | 627.052.166 (Whisper Medium, dato real de safetensors); Parakeet TDT 0.6B v3: aproximadamente 600 millones (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper Medium usa ventanas de audio de 30 segundos por segmento) |
| Tipos de cuantizacion | Q8_0 (ambos artefactos publicados) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0-and-cc-by-4.0 (Apache 2.0 para Whisper Medium, CC-BY 4.0 para Parakeet TDT 0.6B v3) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: redistribuye sin alteración dos artefactos GGUF. El primero es Whisper Medium de OpenAI, un transformer encoder-decoder con atención estándar que procesa audio en ventanas de 30 segundos y genera transcripciones autoregresivamente, incluyendo marcas de tiempo y detección de idioma en su diseño original. El segundo es Parakeet TDT 0.6B v3 de NVIDIA, basado en FastConformer con decodificación Transducer TDT, una arquitectura no autoregresiva orientada a ASR de alto rendimiento.

No se proporcionan datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO) en la información disponible. Tampoco se documentan innovaciones técnicas añadidas por el autor del repositorio, ya que la publicación se limita a la cuantización Q8_0 y la redistribución de pesos existentes. Se incluyen hashes SHA-256 para verificar la integridad de los ficheros (por ejemplo, `09e6a65e7de377aa5b10bae24608bc6f8ca2ed04b3993ef10d4a02bcd9a82adf` para Whisper Medium Q8_0).

## Capacidades

- Transcripción automática de voz a texto (speech-to-text) mediante Whisper Medium y Parakeet TDT 0.6B v3.
- Procesamiento local de audio, sin necesidad de conexión a servicios externos.
- Dos motores alternativos con enfoques distintos: Whisper (autoregresivo, encoder-decoder) y Parakeet (Transducer TDT, no autoregresivo), lo que permite comparar velocidad y precisión según el caso.
- Whisper Medium soporta, en su versión original, detección de idioma y traducción de voz a texto en inglés; no se confirma en la información proporcionada qué idiomas están efectivamente cubiertos por los artefactos GGUF publicados.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modos de razonamiento extendido.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: la app Psiuu integra estos GGUF para transcribir audio del micrófono en local; el formato Q8_0 permite ejecución en CPU sin GPU dedicada.
- Subtitulado automático de vídeos y pódcasts: Whisper Medium genera transcripciones con marcas de tiempo en su diseño original, útiles para flujos de postproducción.
- Actas de reuniones y notas de voz: transcripción de grabaciones de hasta 30 segundos por segmento, encadenando ventanas para audio más largo.
- Procesamiento por lotes de archivos de audio en servidores sin acceso a internet: al ser GGUF, se despliega con runtimes de llama.cpp en entornos aislados.
- Comparativa de motores ASR en producción: disponer de Whisper y Parakeet en el mismo repositorio facilita evaluar latencia y calidad en el mismo hardware.
- Aplicaciones de accesibilidad: conversión de voz a texto para personas con dificultades auditivas o motoras, con privacidad garantizada al no salir el audio del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Whisper Medium en Q8_0: en torno a 1 GB para los pesos (627 millones de parámetros a 8 bits), más overhead de contexto y buffers de audio; el repo completo ocupa 5,3 GB porque incluye ambos modelos y posibles variantes.
- VRAM estimada para Parakeet TDT 0.6B v3 en Q8_0: aproximadamente 0,6-0,8 GB para los pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) para ejecución íntegra en GPU; también funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp y sus derivados (whisper.cpp para el componente Whisper, Ollama si se adapta el formato), así como runtimes que acepten GGUF. No se documenta soporte específico de vLLM o TGI para estos artefactos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Psiuu (Whisper Medium Q8_0) | 627 M | ventanas de 30 s | GGUF Q8_0 | Apache 2.0 | Hugging Face |
| Whisper Medium original (openai/whisper-medium) | 769 M (según model card de OpenAI) | ventanas de 30 s | safetensors, PyTorch | Apache 2.0 | Hugging Face, OpenAI API |
| Whisper Small | aproximadamente 244 M | ventanas de 30 s | safetensors, GGUF | Apache 2.0 | Hugging Face |
| Parakeet TDT 0.6B v3 (NVIDIA) | aproximadamente 600 M | no disponible | NeMo, GGUF (vía handy-computer) | CC-BY 4.0 | Hugging Face, NGC |

La comparación con Whisper Medium original debe tomarse con cautela: el recuento de 627 M del repositorio procede de safetensors y puede diferir del reportado por OpenAI por convenciones de conteo. No hay datos de benchmarks que permitan comparar calidad entre estas opciones.

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribución de pesos de terceros; cualquier sesgo o error de Whisper Medium o Parakeet TDT se hereda íntegramente.
- Whisper es conocido por alucinaciones en segmentos de silencio o audio ruidoso; no se documenta mitigación específica en este repositorio.
- La información sobre idiomas soportados no está disponible; no se debe asumir cobertura multilingüe sin verificar los artefactos.
- La licencia es compuesta (Apache 2.0 y CC-BY 4.0): el uso comercial exige cumplir ambas, incluyendo atribución a NVIDIA para Parakeet y a OpenAI para Whisper, además de los avisos LICENSE y NOTICE del repositorio.
- El autor no publica métricas de calidad, WER ni evaluaciones propias; en producción conviene validar con datos propios.
- El tamaño del repo (5,3 GB) incluye varios artefactos; verificar el hash SHA-256 antes de desplegar para asegurar integridad.
- No hay soporte documentado para fine-tuning ni para tareas distintas del ASR.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/llaosdigital/psiuu
- Modelo base Whisper Medium: https://huggingface.co/openai/whisper-medium
- Origen GGUF de Whisper Medium: https://huggingface.co/handy-computer/whisper-medium-gguf (revisión ec78f06fded51aa82cde751678b78f76f78c8b7f)
- Origen GGUF de Parakeet TDT 0.6B v3: https://huggingface.co/handy-computer/parakeet-tdt-0.6b-v3-gguf
- Modelo Parakeet TDT 0.6B v3 de NVIDIA: no disponible en la información proporcionada
- Paper de Whisper: no disponible en la información proporcionada
- Repositorio whisper.cpp: no disponible en la información proporcionada
