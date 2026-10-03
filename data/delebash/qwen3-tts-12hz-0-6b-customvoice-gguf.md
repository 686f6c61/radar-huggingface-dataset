# delebash/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF es una conversión no oficial a formato GGUF del checkpoint Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice, publicada por el usuario delebash y pensada para ejecutarse con el runtime audio.cpp. El modelo base lo desarrolla el equipo Qwen y pertenece a la serie Qwen3-TTS de síntesis de voz multilingüe, controlable, robusta y con capacidad de streaming; esta variante concreta es la de 0,6B parámetros con voces predefinidas (CustomVoice) y tokenizador de 12 Hz.

Su relevancia práctica está en el empaquetado: el repositorio oficial de audio.cpp solo publica el CustomVoice de 1,7B en GGUF, por lo que estos ficheros cubren el hueco del checkpoint de 0,6B. Los dos únicos ficheros son autocontenidos —incluyen la especificación de modelo, la configuración y el tokenizador embebidos—, con 1,71 GB en q8_0 y 2,16 GB en bf16, lo que permite síntesis de voz en hardware modesto.

No se trata de un modelo nuevo ni de un reentrenamiento: los pesos, la licencia Apache-2.0 y los nueve hablantes (aiden, dylan, eric, ono_anna, ryan, serena, sohee, uncle_fu, vivian) son los del checkpoint original. El autor documenta conversión con `audiocpp_gguf` de audio.cpp v0.9.0 y una verificación parcial mediante lectura con Qwen3-ASR 1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle (serie Qwen3-TTS con tokenizador de 12 Hz; el autor no publica el diagrama interno) |
| Parametros totales | 0,6B |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo de texto a voz; no se publica ventana de contexto) |
| Tipos de cuantizacion | GGUF q8_0 y GGUF bf16 (los tensores sensibles al hablante se mantienen en 16 bits en la variante q8_0) |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it (10 idiomas, segun etiquetas del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (autocontenido, con model spec, configuracion y tokenizador embebidos); el checkpoint original usa safetensors |

| Fichero | Tamano | SHA-256 |
|---|---|---|
| `qwen3-tts-12hz-0.6b-customvoice-q8_0.gguf` | 1.710.423.328 bytes (1,71 GB) | `e2ac7876efd8eb6407dd9e152999782167eea3b9e0362deb6f4c965c43f108f5` |
| `qwen3-tts-12hz-0.6b-customvoice-bf16.gguf` | 2.157.313.376 bytes (2,16 GB) | `7c93342bc02622ed662d9c259e585f3668f4ce955ef272a796e5e098492fd806` |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna. Lo que sí se especifica es que se trata de una conversión del checkpoint Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (revisión `85e237c12c027371202489a0ec509ded67b5e4b5`) y que el modelo pertenece a la familia Qwen3-TTS, descrita por el equipo Qwen como una serie de modelos de síntesis de voz multilingües, controlables, robustos y con soporte de streaming, construida sobre un tokenizador de 12 Hz. No hay datos publicados aquí sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

La innovación técnica de esta ficha es el propio proceso de cuantización, no el modelo. La conversión se hizo con la herramienta `audiocpp_gguf` de audio.cpp v0.9.0 (build de Windows con CUDA 12.4) ejecutando primero la cuantización por defecto `q8_0` para la familia `qwen3_tts` y, en un segundo fichero, la misma orden con `--type bf16`. La distribución de tipos de tensor del Q8 es 359 `q8_0`, 145 `f16`, 136 `bf16` y 258 `f32`, que reproduce el reparto del Q8 del CustomVoice 1,7B publicado por audio.cpp (360, 145, 137, 258). Según las notas de GGUF de audio.cpp citadas por el autor, un Q8 de Qwen3-TTS debe conservar en 16 bits los tensores sensibles al hablante porque cuantizarlos puede provocar problemas en salidas largas, como silencios extensos. No se documenta decodificación especulativa, atención lineal ni ninguna otra técnica de inferencia.

## Capacidades

- Síntesis de voz multilingüe en 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano (idiomas declarados en las etiquetas del modelo base; el autor no los verificó en esta conversión).
- Nueve voces predefinidas: `aiden`, `dylan`, `eric`, `ono_anna`, `ryan`, `serena`, `sohee`, `uncle_fu` y `vivian`.
- Control del tono y la entrega mediante instrucción escrita en lenguaje natural (por ejemplo, "Calm and warm."). El autor confirma que la instrucción se acepta y produce una renderización.
- Salida de audio a fichero WAV mediante la CLI de audio.cpp.
- Selección explícita de idioma por parámetro, independiente del idioma del hablante elegido.
- No realiza clonación de voz: al ser un checkpoint CustomVoice, no acepta muestras de referencia para imitar una voz nueva.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es un modelo puramente de texto a voz.
- No se documenta soporte de streaming en esta conversión, aunque la serie Qwen3-TTS lo contempla a nivel de familia.

## Casos de uso

- Síntesis de voz para audiolibros y contenido narrado largo: el Q8 se diseñó manteniendo en 16 bits los tensores sensibles al hablante precisamente para evitar silencios anómalos en salidas extensas, aunque el propio autor advierte de que la salida de formato largo no se ha comprobado en esta conversión.
- Locuciones para vídeo y pódcast con control de estilo: la instrucción escrita permite pedir tono y ritmo concretos ("Very sad, slow and quiet, close to tears.") sin reentrenar ni ajustar el modelo.
- Atención al cliente con respuestas habladas: con 1,71 GB en q8_0 y 10 idiomas cubiertos, el modelo se puede desplegar en un nodo modesto para convertir respuestas de texto en audio.
- Integración en sistemas de accesibilidad: lectura en voz alta de contenido en diez idiomas, con voces diferenciadas para distintos perfiles de usuario.
- Prototipado rápido en local: el tamaño del fichero Q8 permite probar síntesis multilingüe en un portátil con GPU de gama media, sin depender de API externas.
- Generación de audio para entornos sin conectividad: un único fichero GGUF autocontenido se puede distribuir a un dispositivo de borde, sin necesidad de descargar tokenizador ni configuración aparte.
- Pruebas A/B de calidad de cuantización: el repositorio publica la misma conversión en q8_0 y bf16, lo que facilita medir la degradación del audio según el tipo de cuantización en un pipeline propio.
- Evaluación de TTS con reconocimiento automático: el procedimiento del autor (renderizar y volver a transcribir con Qwen3-ASR 1.7B) es reproducible como test de regresión para detectar desviaciones del texto de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MOS, RTF) en la informacion disponible. El autor solo documenta una prueba funcional propia: renderización dirigida con la instrucción "Very sad, slow and quiet, close to tears." sobre 13 semillas, con lectura posterior mediante Qwen3-ASR 1.7B para comprobar si el audio reproducía el texto.

| Prueba | q8_0 (0,6B) | bf16 (0,6B) | Q8 CustomVoice 1,7B publicado por audio.cpp |
|---|---|---|---|
| Renderizacion dirigida con instruccion, 13 semillas, lectura limpia por Qwen3-ASR | 12 de 13 (una semilla se desvio del texto) | 13 de 13 | 13 de 13 |
| Lectura palabra por palabra del audio renderizado (voz Ryan, ingles) | correcta | no documentado | correcta en el mismo texto |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, los ficheros ocupan 1,71 GB (q8_0) y 2,16 GB (bf16), por lo que el consumo de memoria del modelo se situara por encima de esas cifras una vez anadidos cache de atencion y tensores de trabajo; el autor no proporciona una medicion real.
- GPU recomendadas: no disponibles. La unica configuracion documentada es la usada en la verificacion: `audiocpp_cli` con backend CUDA sobre un build de audio.cpp v0.9.0 para Windows con CUDA 12.4.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano de 0,6B en 8 y 16 bits, pero no hay confirmacion del autor ni lista de modelos probados (RTX 4090, RTX 3060, etc.: no disponible).
- Opciones de despliegue: audio.cpp, mediante `audiocpp_cli` con `--task tts --family qwen3_tts` y `--backend cuda`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta familia de modelos.
- Latencia y throughput: no disponibles; no se publica factor de tiempo real ni tokens de audio por segundo en esta conversion. El tokenizador de la serie es de 12 Hz, lo que implica una tasa de tramas baja, pero el impacto real en latencia no se ha medido aqui.
- Disco: 3,9 GB de repositorio; cada fichero se descarga por separado y es autocontenido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF (delebash, esta ficha) | 0,6B | no disponible | GGUF q8_0 (1,71 GB) y bf16 (2,16 GB) | apache-2.0 | HuggingFace, 160 descargas, 0 likes |
| Qwen3-TTS CustomVoice 1,7B GGUF (audio-cpp/audio.cpp-gguf) | 1,7B | no disponible | GGUF Q8 | apache-2.0 (heredada del original) | HuggingFace, repositorio oficial del runtime |
| Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (checkpoint original) | 0,6B | no disponible | safetensors | apache-2.0 | HuggingFace y ModelScope |
| qwen3-tts-12hz-0.6b-customvoice-gguf (affectively-ai) | 0,6B | no disponible | GGUF (se menciona un Q4_K_M de ~0,4 GB) | no disponible en la informacion recogida | HuggingFace; su descripcion atribuye clonacion de voz y arquitectura "Qwen2-TTS", datos no confirmados por el autor del modelo base |

No se dispone de comparaciones de calidad objetivas (WER, MOS, similitud de hablante) entre estas alternativas en la informacion disponible.

## Limitaciones y advertencias

- Conversion no oficial: no esta verificada ni respaldada por el equipo Qwen. El autor indica explicitamente que el modelo, los pesos y la licencia son de Qwen.
- Sin clonacion de voz: este checkpoint CustomVoice acepta instrucciones escritas de tono y entrega, pero no imita voces a partir de muestras.
- Verificacion parcial: el autor solo comprobo renderizacion en CUDA con la voz Ryan y en ingles. No se probaron la salida de formato largo, las pruebas de escucha subjetivas, los otros ocho hablantes ni los otros nueve idiomas.
- Desviaciones del texto: en la prueba de 13 semillas, la variante q8_0 se desvio del texto en una semilla. Es un riesgo real de alucinacion acustica (audio que no corresponde al texto de entrada).
- Cuantizacion delicada: segun las notas de audio.cpp, los tensores sensibles al hablante deben permanecer en 16 bits en un Q8; recuantizar estos ficheros por cuenta propia puede degradar la salida con silencios largos.
- Faltan metricas objetivas: no hay WER, MOS, RTF ni evaluacion de similitud de voz publicadas para esta conversion.
- Poca validacion comunitaria: 160 descargas y 0 likes; no hay informes de terceros sobre su comportamiento.
- Funcionamiento en produccion: el modelo depende del runtime audio.cpp; conviene fijar la version del runtime y verificar los SHA-256 publicados antes de desplegar.
- Licencia: Apache-2.0, que permite uso comercial, pero con la obligacion habitual de conservar avisos de copyright y licencia; al ser una conversion de pesos de Qwen, se heredan las condiciones del original.
- Sesgos: no se documenta ninguna evaluacion de sesgos por idioma, acento o genero de voz.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/delebash/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice/summary
- Repositorio de la serie Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- GGUFs oficiales del runtime audio.cpp: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Conversion alternativa del mismo checkpoint por affectively-ai: https://huggingface.co/affectively-ai/qwen3-tts-12hz-0.6b-customvoice-gguf
- Script de descarga y uso en terceros: https://github.com/guaimou/qwen3_tts
