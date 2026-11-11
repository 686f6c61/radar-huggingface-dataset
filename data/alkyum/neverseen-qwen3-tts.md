# alkyum/neverseen-qwen3-tts

## Resumen

`alkyum/neverseen-qwen3-tts` no es un modelo entrenado por su autor, sino un espejo ("slim copy") de los ficheros empleados por los flujos de trabajo `qwen3-tts` de Neverseen Studio, cacheados desde sus endpoints serverless de RunPod. El repositorio agrupa, sin modificaciones, los pesos y configuraciones de tres artefactos oficiales de Qwen: `Qwen3-TTS-12Hz-1.7B-Base`, `Qwen3-TTS-12Hz-1.7B-CustomVoice` y `Qwen3-TTS-Tokenizer-12Hz`. Cada fichero conserva su licencia original Apache-2.0 y se referencia con el commit exacto del repositorio upstream del que se copió.

Se trata, por tanto, de un paquete de conveniencia para reproducir un pipeline de síntesis de voz (TTS) basado en la familia Qwen3-TTS, con dos checkpoints de 1.700 millones de parámetros (uno base y otro orientado a voces personalizadas) más un tokenizador de audio a 12 Hz. El tamaño total del repositorio es de 8,4 GB en formato `safetensors`. El autor advierte explícitamente de que no es un lanzamiento oficial.

Su relevancia es operativa más que científica: permite a quien replique el workflow de Neverseen disponer de los mismos ficheros con los mismos hashes, evitando depender de la disponibilidad o de los cambios en los repos upstream. No aporta pesos nuevos, fine-tuning ni artefactos propios; la ficha debe leerse como descripción de los componentes Qwen3-TTS empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los checkpoints pertenecen a la familia Qwen3-TTS; la model card del espejo no detalla la arquitectura interna) |
| Parametros totales | 1.700 millones por checkpoint TTS (`Qwen3-TTS-12Hz-1.7B-Base` y `Qwen3-TTS-12Hz-1.7B-CustomVoice`); el tokenizador `Qwen3-TTS-Tokenizer-12Hz` no declara recuento en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `safetensors` sin variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (todos los ficheros, segun la tabla de la model card) |
| Formato de pesos | `safetensors` (con `config.json`, `generation_config.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt` y `preprocessor_config.json`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de los checkpoints. Lo unico deducible del empaquetado es la estructura del pipeline: dos modelos TTS de 1,7B (`Base` y `CustomVoice`) que operan sobre un tokenizador de audio independiente (`Qwen3-TTS-Tokenizer-12Hz`), con ficheros de configuracion de preprocesado (`preprocessor_config.json`) y un `speech_tokenizer/` anidado dentro de cada checkpoint TTS. La frecuencia de 12 Hz indica la tasa de tokens de audio del tokenizador, es decir, 12 tokens por segundo de audio.

No se aportan datos sobre volumen de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.). Tampoco se documenta el proceso de entrenamiento del checkpoint `CustomVoice` frente al `Base`. Cualquier afirmacion adicional sobre arquitectura o entrenamiento seria especulativa y no se incluye.

## Capacidades

- Sintesis de voz (texto a audio) mediante los checkpoints `Qwen3-TTS-12Hz-1.7B-Base` y `Qwen3-TTS-12Hz-1.7B-CustomVoice`.
- Tokenizacion y detokenizacion de audio a 12 Hz mediante `Qwen3-TTS-Tokenizer-12Hz`, con su propio `speech_tokenizer` embebido en cada checkpoint TTS.
- Variante `CustomVoice` orientada a voces personalizadas (segun la denominacion del checkpoint; la model card del espejo no detalla el mecanismo de clonacion ni de control de voz).
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes o modo thinking: no disponible; no se documentan en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.

## Casos de uso

- Replicacion del workflow `qwen3-tts` de Neverseen Studio: descargar este repositorio y montar los tres subdirectorios (`Qwen3-TTS-12Hz-1.7B-Base`, `Qwen3-TTS-12Hz-1.7B-CustomVoice`, `Qwen3-TTS-Tokenizer-12Hz`) tal cual, garantizando que los hashes coinciden con los del endpoint serverless de RunPod.
- Despliegue de un servicio TTS en infraestructura propia: cargar el checkpoint `Base` de 1,7B con su tokenizador de audio para generar locuciones a partir de texto, sin depender de la API de RunPod.
- Generacion de voces personalizadas: usar `Qwen3-TTS-12Hz-1.7B-CustomVoice` en lugar del `Base` cuando el flujo requiera una voz concreta; ambos comparten el mismo tokenizador de audio de 12 Hz.
- Cache local para entornos con conectividad limitada o politicas de reproducibilidad estricta: al fijar los commits upstream (`fd4b25438912`, `0c0e3051f131`, `7dd38ad4e9ba`), el repositorio sirve como snapshot inmutable de los artefactos.
- Evaluacion comparativa de los dos checkpoints TTS: al estar ambos empaquetados con configuraciones y tokenizadores identicos en estructura, se pueden enfrentar `Base` y `CustomVoice` sobre el mismo conjunto de textos con cambios minimos en el codigo de carga.
- Integracion en pipelines de sintesis por lotes (audiolibros, doblaje, avisos): el tokenizador a 12 Hz reduce la secuencia de audio a 12 tokens por segundo, lo que facilita el procesamiento por lotes con modelos de 1,7B en GPUs de gama media-alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, dos checkpoints de 1,7B en `safetensors` (precision original, presumiblemente bf16/fp16) ocupan aproximadamente 3,4 GB cada uno en pesos; el repositorio completo son 8,4 GB, incluyendo tokenizadores y ficheros auxiliares.
- GPU recomendadas: no disponible. No se documentan requisitos oficiales ni perfiles de GPU validados.
- Compatibilidad con GPU de consumo: no confirmada. Por tamano de pesos, un checkpoint de 1,7B en bf16 cabria en GPUs consumer con 8 GB o mas de VRAM, pero esto es una estimacion por tamano, no un dato oficial.
- Opciones de despliegue: no disponible. La model card no menciona vLLM, llama.cpp, Ollama, TGI ni ninguna otra herramienta; los ficheros son `safetensors` con configuracion estilo Transformers, pero no se confirma el runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS con los que comparar de forma rigurosa. Como referencia estructural, los propios checkpoints upstream (`Qwen/Qwen3-TTS-12Hz-1.7B-Base`, `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` y `Qwen/Qwen3-TTS-Tokenizer-12Hz`) son la alternativa directa a este espejo, con contenido identico y licencia Apache-2.0.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `alkyum/neverseen-qwen3-tts` (espejo) | 1,7B por checkpoint TTS | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| `Qwen/Qwen3-TTS-12Hz-1.7B-Base` (upstream) | 1,7B | no disponible | Apache-2.0 | Hugging Face |
| `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` (upstream) | 1,7B | no disponible | Apache-2.0 | Hugging Face |
| `Qwen/Qwen3-TTS-Tokenizer-12Hz` (upstream) | no disponible | no disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un lanzamiento oficial: el propio autor lo califica como "slim copy" de ficheros cacheados por sus endpoints de RunPod. No debe citarse como modelo original de Qwen.
- Cero traccion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validacion externa.
- Ausencia total de model card tecnica: no se documentan arquitectura, contexto, idiomas, sesgos, riesgos de alucinacion ni limitaciones del modelo subyacente.
- Licencia: los ficheros son Apache-2.0 segun la tabla de la model card, lo que en principio permite uso comercial, pero conviene verificar la licencia en los repos upstream antes de desplegar en produccion.
- Riesgo de desactualizacion: al ser un snapshot fijado a commits concretos, no recibira correcciones ni mejoras de los repos upstream.
- Sin cuantizaciones: solo se distribuyen pesos en `safetensors`, sin variantes GGUF ni cuantizadas, lo que limita el despliegue en hardware modesto.
- Ambito limitado a TTS: no hay evidencia de que estos checkpoints cubran generacion de texto, razonamiento, codigo o vision; no deben evaluarse como LLM de proposito general.
- Sesgos y alucinacion: no disponible; no se documentan evaluaciones de sesgo ni de fidelidad de la sintesis.

## Enlaces

- Repositorio del espejo: https://huggingface.co/alkyum/neverseen-qwen3-tts
- Upstream `Qwen3-TTS-12Hz-1.7B-Base`: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base (commit `fd4b25438912`)
- Upstream `Qwen3-TTS-12Hz-1.7B-CustomVoice`: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (commit `0c0e3051f131`)
- Upstream `Qwen3-TTS-Tokenizer-12Hz`: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz (commit `7dd38ad4e9ba`)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
