# infosave/qwen3-tts-12hz-0.6b-customvoice-cmf

## Resumen

Qwen3-TTS 12Hz 0.6B CustomVoice — CMF es un contenedor portátil en formato CMF v2 que empaqueta los 11 activos de runtime necesarios del modelo público Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice, en la revisión fija `85e237c12c027371202489a0ec509ded67b5e4b5`. No se trata de un modelo nuevo ni reentrenado: es una distribución verificable del modelo base de síntesis de voz de Qwen, con manifiesto de hashes SHA-256 y extracción controlada. Lo publica el usuario `infosave` bajo licencia Apache-2.0.

El modelo subyacente es un sistema de text-to-speech multilingüe de aproximadamente 0,6 mil millones de parámetros, con salida de audio a 24 kHz y una tasa de tokens de códec de 12 Hz. Soporta diez idiomas (chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso) y nueve voces integradas predefinidas, sin capacidad de clonación de voz ni audio de referencia. La relevancia de esta distribución radica en su enfoque de reproducibilidad y operación offline: cada activo se valida por hash antes de cargarse.

El contenedor no es ejecutable de forma nativa por la CLI de Cortiq; requiere un puente de extracción CMF local junto con el runtime Python upstream `qwen-tts==0.1.1`. El repositorio incluye un lanzador (`run_qwen3_tts_cmf.py`) y un empaquetador/verificador (`qwen3_tts_cmf_pack.py`) que validan el sobre CMF, las rutas de los activos y los digests del manifiesto de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en tokens de códec; detalles de arquitectura interna no publicados en la información disponible) |
| Parametros totales | 0,6 B (según denominación del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor preserva los pesos originales sin recuantizar) |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` del modelo y del `speech_tokenizer/`), empaquetados en contenedor CMF v2 |
| Frecuencia de muestreo de audio | 24 kHz |
| Tasa de tokens de códec | 12 Hz |
| Voces integradas | serena, vivian, uncle_fu, ryan, aiden, ono_anna, sohee, eric, dylan |
| Tamano del repo | 2,5 GB |
| Runtime requerido | `qwen-tts==0.1.1` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3-TTS-12Hz-0.6B-CustomVoice: no se especifican la composición del transformer, el diseño exacto del códec de audio ni los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO). Lo que sí se documenta es el mecanismo de empaquetado: el contenedor CMF v2 incluye los ficheros de configuración y tokenizer del modelo, `model.safetensors`, y los activos de configuración y pesos del `speech_tokenizer/`, todo ello con rutas relativas originales, tamaños en bytes y digests SHA-256 registrados en el manifiesto.

La innovación destacable de esta distribución es operativa, no algorítmica: verificación criptográfica del artefacto completo (SHA-256 `90e314fe0b2a88c92df5df6907f09084573d1076194c976c58d087a3ce776539`), extracción restringida a un conjunto fijo de activos en un directorio propiedad de la aplicación, y carga offline mediante `HF_HUB_OFFLINE=1` y `TRANSFORMERS_OFFLINE=1`. El puente valida el contrato de sobre, arquitectura y rutas, y cada hash de payload antes de extraer; nunca selecciona dinámicamente repositorios upstream ni ejecuta rutas proporcionadas por el usuario. El modelo en sí emplea una representación de audio mediante tokens de códec a 12 Hz, lo que reduce la secuencia temporal frente a enfoques de mayor tasa.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en diez idiomas: chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso.
- Selección de voz entre nueve hablantes integrados predefinidos (`serena`, `vivian`, `uncle_fu`, `ryan`, `aiden`, `ono_anna`, `sohee`, `eric`, `dylan`).
- Salida de audio PCM-16 en WAV a 24 kHz.
- Control del límite de generación mediante `--max-new-tokens` (rango de 16 a 256 tokens de códec).
- Ejecución en CPU, CUDA y Apple MPS mediante selección automática o explícita de backend.
- Operación completamente offline una vez extraídos y verificados los activos.
- No soporta clonación de voz ni audio de referencia: solo voces CustomVoice fijas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Generación de audiolibros y contenido narrado: el modelo permite sintetizar texto largo en cualquiera de los diez idiomas con una voz consistente seleccionable, adecuado para pipelines por lotes donde la reproducibilidad del artefacto importa.
- Localización de productos multimedia: al cubrir diez idiomas con las mismas voces integradas, se puede generar una misma locución en varios idiomas manteniendo coherencia de estilo, útil para vídeos corporativos o tutoriales.
- Asistentes de voz embebidos en aplicaciones de escritorio: el soporte de backend CPU y Apple MPS permite integrar TTS en entornos sin GPU dedicada, con perfiles validados (FP32/SDPA en CPU y MPS).
- Sistemas de accesibilidad: lectura en voz alta de contenido para usuarios con discapacidad visual, con selección de idioma y voz según preferencias, y ejecución offline que evita dependencias de servicios en la nube.
- Generación de avisos y notificaciones automatizadas: síntesis de mensajes cortos en tiempo de ejecución en servidores con GPU moderada (validado en RTX 2000 Ada con 2,24 GB de pico asignado).
- Distribución verificable en entornos regulados: el contenedor CMF con hashes SHA-256 y manifiesto de procedencia permite auditar la cadena de suministro del modelo antes de desplegarlo en producción, adecuado para organizaciones que exigen trazabilidad de artefactos.
- Pruebas de integración continua de sistemas de voz: el lanzador incluido y la verificación de hashes facilitan tests reproducibles de TTS en pipelines de CI sin acceso a red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una validación de humo de reproducibilidad, no una comparativa de calidad:

| Backend | Perfil | Resultado |
|---|---|---|
| CPU | AMD EPYC 7502, FP32/SDPA, 32 hilos PyTorch | WAV ruso generado (3,44 s de audio; 149,58 s de generación) |
| CUDA | NVIDIA RTX 2000 Ada, BF16/SDPA | WAV ruso generado (3,52 s de audio; 6,35 s de generación; 2,24 GB de pico asignado) |
| Apple Metal | Apple M4 MPS, FP32/SDPA | WAV ruso generado (5,04 s de audio; 24,94 s de generación) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,24 GB de pico asignado en el perfil CUDA BF16/SDPA validado (RTX 2000 Ada). No se publican estimaciones para otras cuantizaciones.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos ~3 GB de VRAM libre; la validación se realizó en una RTX 2000 Ada. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con ≥4 GB de VRAM, aunque no se aportan validaciones específicas en ese hardware.
- Apple Silicon: soportado vía MPS con FP32/SDPA; MPS FP16 no se ofrece porque produjo probabilidades de muestreo inválidas durante la validación.
- CPU: soportado con FP32/SDPA y hasta 32 hilos PyTorch; el rendimiento es muy inferior (149,58 s para 3,44 s de audio en EPYC 7502).
- Opciones de despliegue: runtime Python `qwen-tts==0.1.1` con extracción CMF local; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Vulkan no es un backend válido para el runtime upstream.
- Latencia y throughput: en CUDA BF16/SDPA, aproximadamente 6,35 s de generación para 3,52 s de audio (~0,55x tiempo real); en MPS FP32, 24,94 s para 5,04 s de audio (~4,9x tiempo real); en CPU, 149,58 s para 3,44 s de audio (~43x tiempo real). Son datos de una única validación de humo, no garantías de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| infosave/qwen3-tts-12hz-0.6b-customvoice-cmf | 0,6 B | no disponible | 10 | Apache-2.0 | CMF v2 (safetensors) |
| Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (upstream) | 0,6 B | no disponible | 10 | Apache-2.0 | safetensors |
| Alternativas de TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El artefacto es un contenedor opaco CMF v2, no ejecutable nativamente por la CLI de Cortiq; requiere un puente de extracción local y el runtime `qwen-tts==0.1.1`.
- No es un modelo nuevo ni recuantizado: cualquier limitación del modelo base upstream se hereda íntegramente.
- Sin clonación de voz: solo están disponibles las nueve voces CustomVoice fijas; no se acepta audio de referencia.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo TTS multilingüe, es previsible que reproduzca sesgos de pronunciación, acento y prosodia presentes en sus datos de entrenamiento, pero no se aportan detalles.
- Riesgo de alucinación: no aplica en el sentido de generación de hechos, pero sí existe riesgo de pronunciación incorrecta, omisión o repetición de texto en entradas largas o idiomas menos representados.
- Limitaciones de contexto e idioma: la longitud máxima de texto de entrada no se documenta; el límite de tokens de códec es de 256, lo que acota la duración máxima de audio por invocación.
- MPS FP16 produce probabilidades de muestreo inválidas; usar FP32 en Apple Silicon.
- Vulkan no está soportado por el runtime upstream.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar la atribución y el aviso de licencia; verificar la procedencia del snapshot upstream fijado.
- Para producción: tratar texto y audio generado como datos de usuario no confiables, no pasar entradas de usuario a shells ni a selectores de modelo/repositorio, y verificar el SHA-256 del artefacto antes de cualquier uso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/infosave/qwen3-tts-12hz-0.6b-customvoice-cmf
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Revisión fijada del upstream: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice/tree/85e237c12c027371202489a0ec509ded67b5e4b5
- Runtime Python: `qwen-tts==0.1.1` (paquete de Python; no se proporciona URL directa en la información disponible)
