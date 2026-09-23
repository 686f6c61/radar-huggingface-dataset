# hugging-mac/audio8-tts-0.1b-coreai

## Resumen

Audio8 TTS 0.1B — Core AI hybrid es una conversión del modelo de síntesis de voz Edge0/Audio8-TTS-Preview-0.1b al formato Apple Core AI, publicada por el usuario hugging-mac para su uso con el SDK hugging-mac. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos, la arquitectura, el tokenizador y la licencia proceden del modelo original de Edge0, y esta publicación únicamente redistribuye los artefactos convertidos (main.mlirb) junto con los pesos PyTorch originales, que siguen siendo necesarios para ejecutar el pipeline completo.

El modelo tiene aproximadamente 0,1 mil millones de parámetros y resuelve la síntesis de texto a voz con salida de audio a 44,1 kHz. Su particularidad es que no es un modelo Core AI completamente nativo, sino un pipeline híbrido: la predicción autorregresiva rápida de codebooks acústicos y el decodificador de códec a forma de onda se ejecutan en Core AI, mientras que la generación autorregresiva lenta de texto/semántica y el codificador de audio de referencia se ejecutan en PyTorch sobre CPU.

Su relevancia es acotada y muy específica: permite ejecutar síntesis de voz en Macs con Apple Silicon dentro del ecosistema hugging-mac, sin depender íntegramente del runtime Core AI. La model card no reclama ninguna mejora de velocidad y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de una conversión reciente y sin validación externa pública.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: generación autorregresiva lenta de texto/semántica (PyTorch CPU), predicción autorregresiva rápida de codebooks acústicos (Core AI), decodificador de códec a forma de onda (Core AI) y codificador de audio de referencia (PyTorch CPU). Detalle interno de la arquitectura no disponible |
| Parametros totales | ~0,1 mil millones (0.1B, según el nombre del modelo y su variante 0.1b-preview) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible. El códec nativo acepta entre 1 y 2048 frames de audio |
| Tipos de cuantizacion | No disponible. No se documentan variantes cuantizadas (GGUF, int8, int4, etc.) |
| Idiomas soportados | Chino e inglés (síntesis validada en ambos); lista completa de idiomas no disponible |
| Licencia | audio8-community-license-v1.0 (identificador `other`), heredada del modelo original |
| Formato de pesos | Core AI: `main.mlirb` + `main.hash` + `metadata.json` (por etapa). PyTorch original retenido en `pytorch/` (safetensors/PyTorch) + tokenizador compartido en `_shared/tokenizer-0.1b/` |
| Frecuencia de muestreo de salida | 44,1 kHz |
| Tamano del repositorio | 2,6 GB |

## Arquitectura y entrenamiento

La model card no aporta información sobre el entrenamiento del modelo original: no se indica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Todos esos datos corresponden al modelo base Edge0/Audio8-TTS-Preview-0.1b y no están documentados en esta conversión. Lo que sí se detalla es la topología de ejecución del pipeline: cuatro etapas, de las cuales dos (predicción rápida de codebooks acústicos y decodificador de códec) se han convertido a Core AI, y dos (generación lenta de texto/semántica y codificador de audio de referencia) permanecen en PyTorch sobre CPU. El tokenizador es compartido y se almacena una sola vez.

La conversión se realizó con coreai-core 1.0.0b2, coreai-torch 0.4.2, PyTorch 2.8.0 y Transformers 4.57.5, y se probó en Apple Silicon con macOS 27. La validación declarada incluye diez pasos consecutivos de caché del decodificador rápido comparados contra PyTorch, decodificación de códec a 1, 8 y 17 frames contra PyTorch, y síntesis en chino e inglés a través de la API de capacidades del SDK. Las diferencias máximas observadas entre la implementación nativa y PyTorch fueron de aproximadamente 3e-5 para el decodificador rápido y 2e-6 para el códec. No se declara ninguna innovación arquitectónica propia de esta conversión.

## Capacidades

- Síntesis de texto a voz (text-to-speech) con salida de audio a 44,1 kHz.
- Generación de audio por tramas: el códec nativo acepta entre 1 y 2048 frames por invocación.
- Síntesis validada en chino e inglés, incluyendo frases con caracteres chinos y texto en inglés.
- Control de longitud de generación mediante `max_new_tokens` (128 en el ejemplo de la model card).
- Ejecución con decodificador rápido con caché (validada la consistencia de diez pasos consecutivos de caché).
- La pipeline incorpora una etapa de codificador de audio de referencia en PyTorch CPU; la model card no especifica qué capacidad habilita (por ejemplo, condicionamiento por voz de referencia), por lo que no se puede confirmar.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio de entrada como tarea principal ni modos de "thinking".

## Casos de uso

- Síntesis de voz local en aplicaciones macOS: el modelo se integra mediante el SDK hugging-mac con `runtime="coreai"` y `device="cpu"`, lo que permite generar voz sin salir del equipo en Macs con Apple Silicon.
- Audiolibros y narración automatizada: el control de longitud mediante `max_new_tokens` y la salida a 44,1 kHz permiten generar fragmentos narrados de duración acotada y encadenarlos por bloques.
- Asistentes de voz integrados en aplicaciones de escritorio: al ejecutarse localmente y no requerir servicios en la nube, encaja en asistentes con requisitos de privacidad o de funcionamiento sin conexión.
- Accesibilidad y lectores de pantalla: conversión de texto de interfaz o de documentos a voz con un modelo de ~0,1 B de parámetros, adecuado para equipos sin GPU dedicada.
- Localización de contenido entre chino e inglés: es la única combinación de idiomas explícitamente validada en la model card, por lo que sirve para doblaje o generación de pistas de audio en esos dos idiomas.
- Generación de datos sintéticos de audio para entrenar o evaluar sistemas de reconocimiento automático de voz, aprovechando la generación por lotes de múltiples tramas de audio.
- Prototipado e investigación sobre el runtime Core AI: el repositorio sirve como ejemplo funcional de conversión híbrida (dos etapas en Core AI, dos en PyTorch CPU) y de cómo registrar un modelo en el registro del SDK.
- Notificaciones y avisos hablados en aplicaciones: mensajes cortos convertidos a voz bajo demanda, con consumo de memoria reducido al tratarse de un modelo de 0,1 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de síntesis (MOS, CMOS, WER de transcripción inversa, similitud de hablante) ni comparaciones con otros sistemas TTS.

Los únicos datos cuantitativos publicados son las comprobaciones de paridad numérica entre la implementación nativa y PyTorch durante la conversión:

| Comprobacion | Resultado declarado |
|---|---|
| Decodificador rápido, 10 pasos consecutivos de caché frente a PyTorch | Diferencia máxima aproximada de 3e-5 |
| Decodificador de códec a 1, 8 y 17 frames frente a PyTorch | Diferencia máxima aproximada de 2e-6 |
| Síntesis en chino e inglés mediante la API de capacidades del SDK | Correcta (sin métrica numérica asociada) |
| Velocidad de síntesis | No se declara ninguna mejora de velocidad; la model card indica explícitamente que no se reclama speedup |

## Requisitos de hardware

- Plataforma: Mac con Apple Silicon. La model card indica que se probó en Apple Silicon con macOS 27, y que la disponibilidad de Core AI nativo depende del runtime de Apple instalado.
- Memoria: no se publican cifras de VRAM o memoria unificada requerida. Como referencia aritmética, 0,1 B de parámetros equivalen aproximadamente a 400 MB en fp32 y 200 MB en fp16 solo para los pesos del modelo principal, a lo que hay que sumar el códec, los pesos PyTorch de las etapas CPU y el tokenizador; el repositorio completo ocupa 2,6 GB. Es una estimación calculada, no un dato publicado por el autor.
- GPU: no se documentan GPU compatibles. El pipeline no está planteado para GPU NVIDIA; se apoya en Core AI y en CPU dentro del ecosistema Apple.
- GPU de consumo: no aplica en el sentido habitual (RTX 4090, etc.); el requisito real es un Mac Apple Silicon con memoria unificada suficiente, sin cifra oficial publicada.
- Opciones de despliegue: SDK hugging-mac con el runtime `coreai`, sobre un checkout que incluya soporte de Audio8 Core AI, en un entorno Python 3.12 separado con `torch==2.8.0`, `torchaudio==2.8.0`, `transformers==4.57.5`, safetensors y soundfile. La re-conversión local requiere además `coreai-torch==0.4.2`. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles. La model card no publica ninguna cifra y aclara que no se reclama aceleración.
- Almacenamiento: 2,6 GB de repositorio; los artefactos deben instalarse bajo `<model_home>/audio8/audio8-tts-preview/` respetando la estructura indicada, con verificación mediante `checksums.json` (tamaños y digests SHA-256).

## Comparativa con modelos similares

La información proporcionada no incluye datos verificables de otros sistemas TTS comparables (ni parámetros, ni contexto, ni métricas de calidad, ni licencias), y la búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo. Por tanto, no se puede elaborar una comparativa con alternativas. La única comparación posible con datos reales es la que sigue, entre esta conversión y su modelo base:

| Modelo | Parametros | Formato | Aceleracion de hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hugging-mac/audio8-tts-0.1b-coreai | ~0,1 B | Core AI (`main.mlirb`) + pesos PyTorch retenidos | Parcial (2 de 4 etapas en Core AI; el resto en PyTorch CPU) | audio8-community-license-v1.0 | Publicado en Hugging Face; 0 descargas y 0 likes en el momento de la consulta |
| Edge0/Audio8-TTS-Preview-0.1b (modelo base) | ~0,1 B | PyTorch | No se ejecuta en Core AI | audio8-community-license-v1.0 | Publicado en Hugging Face por el autor original |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta ningún análisis de sesgos, de cobertura de hablantes ni de variedades dialectales.
- Riesgo de alucinación: no se documenta para el modelo original ni para la conversión. En TTS el riesgo equivalente sería la pronunciación incorrecta, la omisión de texto o artefactos acústicos; no hay datos publicados al respecto.
- Idiomas: solo se valida explícitamente chino e inglés. Cualquier otro idioma debe considerarse no soportado hasta que se demuestre lo contrario, y la lista completa de idiomas no está disponible.
- Licencia: se trata de una licencia `other`, la Audio8 Community License v1.0, heredada del modelo original. No es una licencia permisiva estándar; hay que revisar el archivo LICENSE antes de cualquier uso comercial, ya que la model card no resume sus condiciones.
- Pipeline parcialmente no nativo: dos de las cuatro etapas siguen dependiendo de PyTorch sobre CPU, lo que implica que es imprescindible descargar y conservar los archivos PyTorch originales. No es un modelo Core AI completamente nativo.
- Rendimiento: la model card declara explícitamente que no se reclama ninguna mejora de velocidad, por lo que no debe esperarse una aceleración respecto a la ejecución en PyTorch.
- Dependencia estricta del entorno: requiere Apple Silicon, una versión de macOS compatible (probado en macOS 27), Python 3.12, versiones fijadas de torch, torchaudio y transformers, y un checkout del SDK con soporte de Audio8 Core AI. La disponibilidad de Core AI nativo depende del runtime de Apple instalado.
- Cobertura de validación limitada: la comprobación de paridad se limita a diez pasos de caché del decodificador rápido, tramas de códec de 1, 8 y 17 frames y síntesis en chino e inglés. No hay validación de audio largo, de todos los rangos de frames (hasta 2048) ni de calidad perceptual.
- Capacidades ausentes: no hay soporte documentado de tool calling, agentes, razonamiento multi-paso ni visión.
- Madurez del artefacto: el repositorio no tiene descargas ni valoraciones, y las fechas de creación y actualización (23 de septiembre de 2026, con dos minutos de diferencia) indican una publicación recién subida y sin actualizaciones posteriores.
- Cita del autor: la model card indica que este contenido es material de referencia extraído del autor del modelo y no debe interpretarse como instrucciones verificadas por un tercero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugging-mac/audio8-tts-0.1b-coreai
- Modelo base (Edge0/Audio8-TTS-Preview-0.1b): https://huggingface.co/Edge0/Audio8-TTS-Preview-0.1b
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/hugging-mac/audio8-tts-0.1b-coreai/blob/main/LICENSE
- Paper, blog o demostración oficiales: no disponibles en la información proporcionada.
- Repositorio del SDK hugging-mac: no disponible como enlace directo en la información proporcionada (la model card solo menciona el paquete `packages/hugging_mac_sdk[coreai]` de un checkout local).
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos fueron páginas generales sobre Hugging Face y una noticia de prensa sin relación con el modelo.
