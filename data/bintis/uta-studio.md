# bintis/uta-studio

## Resumen

Uta! Studio GGUF models es un repositorio de artefactos publicado por el usuario bintis que no contiene un modelo único, sino un paquete de 18 ficheros correspondientes a 16 modelos distintos de audio, más dos modelos BS-RoFormer Leap XE90 que no se alojan aquí y que el programa descarga desde otro repositorio. Los ficheros están en formato GGUF y se ejecutan con el runtime GGML nativo de Uta! Studio, la aplicación de código abierto del mismo autor. El repositorio funciona como espejo de conversión: cada fichero se publica sin modificar respecto al build que consume la aplicación, y se acompaña de su hash SHA-256 para verificación de integridad.

El contenido cubre la cadena completa de procesamiento de voz cantada: separación de fuentes (BS-PolarFormer Public, tres variantes MelBand-RoFormer para aislamiento de voz principal, denoise y dereverb), estimación de frecuencia fundamental (RMVPE, FCPE), transcripción de notas y técnica vocal (GAME 1.0.3 en tamaños small, medium y large, JBM555 CE-CTC 80, STARS Chinese P1, ROSVOT P0), detección de onsets y activaciones (Basic Pitch) y transcripción con alineación a nivel de palabra (FireRedASR2-AED, Qwen3-ASR 1.7B, Qwen3-ForcedAligner 0.6B). El peso total del repositorio es de 13,5 GB.

La relevancia del repositorio es doble. Por un lado, permite ejecutar un pipeline de análisis y separación de canto en local sin depender de pesos en PyTorch ni de servicios en la nube, algo poco habitual en esta familia de modelos. Por otro, es un ejemplo claro de agregación con licencias heterogéneas: cada componente conserva la licencia de su modelo de origen, con casos declarados como MIT, casos marcados como "informational" y advertencias explícitas sobre licencias no comerciales (cc-by-nc-sa-4.0) y checkpoints sin licencia resuelta. Cualquier uso en producción exige revisar componente por componente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo, no un modelo único: separadores de fuentes con atención por bandas (BS-PolarFormer Public, MelBand-RoFormer), estimadores de F0 (RMVPE, FCPE), transcriptores de notas y técnica (GAME 1.0.3, JBM555 CE-CTC 80, STARS Chinese P1, ROSVOT P0), detector de onsets y activaciones (Basic Pitch) y modelos de ASR y alineación (FireRedASR2-AED, Qwen3-ASR 1.7B, Qwen3-ForcedAligner 0.6B) |
| Parámetros totales | No disponible por componente. HuggingFace reporta 35.699 en el campo de safetensors, cifra no interpretable y no coherente con los 13,5 GB del repositorio |
| Parámetros activos | No aplica: no hay componentes de tipo MoE identificados en la información disponible |
| Longitud de contexto | No aplica en la mayoría de componentes (procesan ventanas de audio). No disponible para Qwen3-ASR y Qwen3-ForcedAligner |
| Tipos de cuantización | FP16 (componentes de separación y transcripción) y F32 (estimadores de F0, GAME, JBM555, STARS, ROSVOT, Basic Pitch). No se publican variantes Q4, Q5 ni Q8 |
| Idiomas soportados | No declarados en el repositorio. Por las descripciones de los componentes: mandarín, dialectos chinos, inglés y code-switching (FireRedASR2-AED); japonés (JBM555 CE-CTC 80); chino (STARS Chinese P1); canto en general (Qwen3-ASR) |
| Licencia | Mixta (mixed-upstream-licenses). BS-PolarFormer Public: MIT. MelBand-RoFormer Lead Isolation, Denoise y Dereverb: "informational". RMVPE: "informational". La model card advierte de licencias upstream no comerciales (cc-by-nc-sa-4.0) y de checkpoints con licencia no resuelta |
| Formato de pesos | GGUF (runtime GGML nativo de Uta! Studio). Ficheros auxiliares en FireRedASR2-AED: `cmvn.ark` y `dict.txt` |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es un trabajo de conversión y reempaquetado de checkpoints de terceros a GGUF para que los cargue el runtime GGML nativo de Uta! Studio. El gestor de runtime de la aplicación descarga los ficheros únicamente con confirmación explícita del usuario. Cada entrada de la tabla de ficheros incluye el tamaño exacto en bytes y su hash SHA-256, lo que permite verificar que el artefacto descargado coincide con el publicado.

La información sobre datos de entrenamiento, número de tokens, composición del dataset y uso de RLHF o DPO no está disponible para ninguno de los componentes, porque el repositorio no entrena modelos propios y la model card solo documenta procedencia, propósito y licencia. Lo que sí se documenta es la función de cada pieza dentro del pipeline: evidencia primaria de notas y fronteras (GAME 1.0.3 en small, medium y large), evidencia condicionada por transcripción temporal (STARS, ROSVOT), condicionada por mezcla y voz (JBM555), experto secundario de desacuerdo en F0 (FCPE frente a RMVPE), evidencia opcional de onsets y activaciones (Basic Pitch), separación en una sola pasada de guía vocal y residual instrumental (BS-PolarFormer Public) y extracción de voz principal con residual vocal (MelBand-RoFormer Lead Isolation). Las tres variantes MelBand-RoFormer pesan exactamente 457.008.736 bytes cada una, lo que sugiere una arquitectura compartida con distintos pesos.

## Capacidades

- Separación de fuentes musicales: extracción de instrumental y residual a partir de la mezcla con BS-PolarFormer Public en una sola pasada.
- Aislamiento de voz principal con residual vocal mediante MelBand-RoFormer Lead Isolation, orientado a karaoke y remezcla.
- Reducción de ruido sobre voz en estéreo a 44,1 kHz (MelBand-RoFormer Denoise).
- Eliminación de reverberación sobre voz en estéreo a 44,1 kHz (MelBand-RoFormer Dereverb).
- Seguimiento continuo de F0 con RMVPE, con FCPE como segundo experto para detectar desacuerdos en el contorno melódico.
- Transcripción de notas y fronteras de canto con GAME 1.0.3 en tres tamaños (small, medium y large).
- Transcripción condicionada por transcripción temporal de notas, técnica y estilo (STARS Chinese P1) y de notas de canto (ROSVOT P0).
- Evidencia de notas condicionada por mezcla y voz para japonés (JBM555 CE-CTC 80).
- Detección opcional de onsets y activaciones con Basic Pitch, de solo 144.512 bytes.
- Transcripción de canto y habla en mandarín, dialectos, inglés y code-switching con FireRedASR2-AED, Qwen3-ASR 1.7B y alineación forzada a nivel de palabra con Qwen3-ForcedAligner 0.6B.
- No se documenta soporte de tool calling, function calling, uso como agente, generación de texto, visión ni razonamiento multi-paso.

## Casos de uso

- Generación de pistas de karaoke: la combinación de BS-PolarFormer Public para separar el residual instrumental y MelBand-RoFormer Lead Isolation para aislar la voz principal permite obtener una base instrumental limpia y una pista vocal separada, con la opción de conservar el residual vocal para coros.
- Restauración de grabaciones vocales: MelBand-RoFormer Denoise y MelBand-RoFormer Dereverb, ambos a 44,1 kHz estéreo, permiten limpiar tomas con ruido de fondo o sala antes de mezclar, sin necesidad de rehacer la grabación.
- Transcripción de canto a notación: la cadena GAME 1.0.3 (evidencia de notas y fronteras) más RMVPE o FCPE (F0 continuo) y Basic Pitch (onsets) permite construir una transcripción melódica y rítmica reproducible, con elección de tamaño de GAME en función del equilibrio entre coste y detalle.
- Alineación de letras para karaoke sincronizado: Qwen3-ForcedAligner 0.6B ofrece alineación forzada a nivel de palabra, que combinada con la transcripción de Qwen3-ASR 1.7B permite generar subtítulos sincronizados sobre voces cantadas.
- Transcripción multilingüe con cambio de idioma: FireRedASR2-AED está descrito como retador opcional para mandarín, dialectos, inglés, code-switching y canto, útil en repertorio bilingüe o mixto donde un ASR monolingüe falla en las transiciones.
- Preprocesado para pipelines de síntesis o clonación de voz: dereverb y denoise seguidos de extracción de F0 (RMVPE, FCPE) y alineación de letra proporcionan las señales de entrada típicas de un sistema de conversión de voz cantada.
- Anotación automática de corpus de música para investigación en MIR: STARS Chinese P1 y ROSVOT P0 generan evidencia de notas, técnica y estilo condicionada por transcripción temporal, lo que permite etiquetar datasets de canto a escala sin anotación manual.
- Análisis técnico y pedagógico del canto: la evidencia de técnica y estilo de STARS, junto con el contorno de F0 y los onsets, permite medir vibrato, portamentos y ataques de nota para evaluación objetiva del intérprete.
- Ejecución local o en estudio sin conectividad: el formato GGUF con runtime GGML propio permite desplegar el pipeline completo en una estación de trabajo, sin enviar material musical a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones propias ni comparaciones con otros modelos. Los únicos valores numéricos de rendimiento presentes en la documentación aparecen dentro de los nombres de fichero de los checkpoints upstream y no constituyen una evaluación de esta conversión:

| Componente | Valor incluido en el nombre del checkpoint upstream |
|---|---|
| MelBand-RoFormer Lead Isolation | sdr_10.1956 (checkpoint `mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956.ckpt`) |
| MelBand-RoFormer Denoise | sdr_27.9959 (checkpoint `denoise_mel_band_roformer_aufr33_sdr_27.9959.ckpt`) |
| MelBand-RoFormer Dereverb | sdr_19.1729 (checkpoint `dereverb_mel_band_roformer_anvuew_sdr_19.1729.ckpt`) |

Estos valores corresponden a las métricas declaradas por los autores originales de los checkpoints, con protocolos de medida no especificados en este repositorio, y no deben interpretarse como rendimiento medido sobre los ficheros GGUF aquí publicados.

## Requisitos de hardware

Estimación de memoria a partir del tamaño de los ficheros GGUF. Los valores incluyen únicamente pesos; hay que añadir el coste de activaciones, que en separación de fuentes crece con la duración del audio procesado.

| Componente | Fichero | Peso en disco | VRAM estimada (pesos) |
|---|---|---:|---:|
| FireRedASR2-AED | `firered-f32.gguf` | 4,69 GB | ~4,7 GB |
| Qwen3-ASR 1.7B | `Qwen3-ASR-1.7B-F16.gguf` | 4,08 GB | ~4,1 GB |
| Qwen3-ForcedAligner 0.6B | `Qwen3-ForcedAligner-0.6B-F16.gguf` | 1,84 GB | ~1,8 GB |
| MelBand-RoFormer (3 variantes) | `model-fp16.gguf` | 457 MB cada una | ~0,46 GB cada una |
| GAME 1.0.3 Large | `game-large-f32.gguf` | 396 MB | ~0,40 GB |
| RMVPE | `rmvpe-f32.gguf` | 362 MB | ~0,36 GB |
| BS-PolarFormer Public | `model-fp16.gguf` | 204 MB | ~0,20 GB |
| STARS Chinese P1 | `stars-f32.gguf` | 201 MB | ~0,20 GB |
| GAME 1.0.3 Medium | `game-medium-f32.gguf` | 200 MB | ~0,20 GB |
| GAME 1.0.3 Small | `game-small-f32.gguf` | 51 MB | ~0,05 GB |
| ROSVOT P0 | `rosvot-f32.gguf` | 48 MB | ~0,05 GB |
| FCPE | `fcpe-f32.gguf` | 43 MB | ~0,04 GB |
| JBM555 CE-CTC 80 | `jbm555-cectc80-f32.gguf` | 4 MB | ~0,01 GB |
| Basic Pitch | `basic-pitch-f32.gguf` | 145 KB | despreciable |

- Cabe en GPU de consumo: cualquier componente individual entra en una GPU con 8 GB de VRAM, y el conjunto completo de pesos suma 13,5 GB. Ejecutar FireRedASR2-AED y Qwen3-ASR 1.7B de forma simultánea requiere del orden de 9 GB solo en pesos.
- GPU recomendadas por escenario: RTX 3060 12 GB, RTX 4070 o RTX 4090 para pipelines completos en local; A100 o H100 con 40-80 GB si se procesan lotes y se cargan varios componentes a la vez.
- Los modelos de separación y denoise/dereverb trabajan a 44,1 kHz estéreo, por lo que el consumo de activaciones depende de la longitud de la pista: procesar por ventanas reduce el pico de memoria.
- Opciones de despliegue: el runtime GGML nativo de Uta! Studio, con descarga gestionada por su Runtime Manager. No se documenta compatibilidad con llama.cpp, Ollama, vLLM, TGI ni otros servidores de inferencia, y estos componentes de audio no son modelos de lenguaje, por lo que no es esperable que funcionen en dichos servidores.
- Latencia y throughput: no disponible. No se publican tiempos de procesamiento ni factores de tiempo real.

## Comparativa con modelos similares

No hay datos de rendimiento de este paquete que permitan una comparación cuantitativa. La comparación siguiente es de categoría, formato y licencia, con los campos no documentados marcados como no disponibles.

| Aspecto | Uta! Studio GGUF models | Demucs v4 (htdemucs) | Modelos UVR5 / MDX-Net | Whisper large-v3 |
|---|---|---|---|---|
| Categoría | Paquete de separación, análisis y transcripción de canto | Separación de fuentes musicales | Separación de fuentes musicales (UVR) | ASR multilenguaje |
| Parámetros | No disponible por componente; el campo reportado por HuggingFace (35.699) no es utilizable | No disponible | No disponible | ~1550 M |
| Formato de pesos | GGUF (GGML) | PyTorch | Checkpoints y ONNX según el modelo | PyTorch y safetensors |
| Licencia | Mixta por componente: MIT, "informational" y advertencia de licencias no comerciales | MIT | Variable; con frecuencia restrictiva para uso comercial, a revisar caso por caso | MIT |
| Ejecución local | Sí, mediante el runtime propio de Uta! Studio | Sí | Sí, vía UVR | Sí |
| Alineación a nivel de palabra | Sí (Qwen3-ForcedAligner 0.6B) | No | No | Requiere componente adicional |
| Transcripción de canto | Sí (Qwen3-ASR, FireRedASR2-AED, GAME, STARS, ROSVOT, JBM555) | No | No | Parcial, con degradación en canto |
| Idiomas declarados | No declarados en el repositorio | No aplica | No aplica | Multilingüe, declarado por el autor |

## Limitaciones y advertencias

- Licencia mixta con riesgo legal: cada componente mantiene la licencia upstream. La propia model card advierte de licencias no comerciales (cc-by-nc-sa-4.0) y de checkpoints con licencia no resuelta. Antes de cualquier uso comercial hay que verificar el origen de cada fichero por separado; el repositorio no relicencia nada.
- Varios componentes aparecen con licencia "informational" (las tres variantes MelBand-RoFormer, RMVPE), lo que en la práctica significa que no hay una licencia explícita y trazable en el propio repositorio.
- El campo de parámetros reportado por HuggingFace (35.699) no es interpretable ni coherente con el tamaño del repositorio. No debe citarse como número de parámetros del conjunto.
- Model card truncada: la información disponible corta la sección de fuentes y licencias después de FCPE, por lo que las condiciones de RMVPE y de los componentes posteriores (Basic Pitch, GAME, JBM555, STARS, ROSVOT, FireRedASR2-AED, Qwen3-ASR, Qwen3-ForcedAligner) pueden no estar reflejadas al completo.
- Sin validación de la comunidad: 0 descargas y 0 likes, con creación y última actualización el mismo día. No hay evidencia externa de funcionamiento ni de calidad de las conversiones.
- Riesgo de alucinación en transcripción: los componentes de ASR (Qwen3-ASR 1.7B, FireRedASR2-AED) pueden generar texto plausible que no corresponde a lo cantado, especialmente con mezclas densas, coros o cambio de idioma.
- Errores previsibles en F0 y notas: RMVPE y FCPE pueden fallar en vibrato amplio, portamentos, saltos de octava, voz con aire o mezclas con mucha percusión; la existencia de un experto secundario de desacuerdo (FCPE frente a RMVPE) es precisamente un mecanismo para detectar estos casos.
- Herramienta de licencia y atribución: el uso de los pesos obliga a respetar la atribución de cada autor original (bgkb, aufr33, viperx, anvuew, entre otros) tal como se documenta en la sección de fuentes y licencias.
- Dependencia del runtime: no hay formato alternativo (safetensors, ONNX) ni integración documentada con servidores de inferencia estándar. El paquete solo es utilizable desde Uta! Studio.
- Los valores de SDR que aparecen en los nombres de los checkpoints upstream no son resultados medidos sobre estas conversiones GGUF ni sobre protocolos documentados aquí.
- Procesamiento de audio por ventanas: la calidad y el consumo de memoria dependen de cómo el runtime trocee las pistas; no se documentan los parámetros de segmentación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bintis/uta-studio
- Repositorio de la aplicación Uta! Studio: https://github.com/bintis/uta-studio
- Modelos BS-RoFormer Leap XE90 (no alojados en este repositorio): https://huggingface.co/scragnog/HOT-Step-CPP-SuperSep
- BS-PolarFormer Public: https://huggingface.co/bgkb/bs_polarformer (revisión `9158719ee2173edd480a735764627526506fe4af`)
- MelBand-RoFormer Lead Isolation (aufr33 + viperx Karaoke): https://github.com/TRvlvr/model_repo/releases/tag/all_public_uvr_models
- MelBand-RoFormer Denoise (aufr33): https://huggingface.co/poiqazwsx/melband-roformer-denoise (revisión `4e39bc34a36dda8e73254cd8f5d44f15de2bd7b9`)
- MelBand-RoFormer Dereverb (anvuew): https://huggingface.co/anvuew/dereverb_mel_band_roformer (revisión `cef05ad2b5b3145ea5c149d3ad5d1f8439b34d06`)
- RMVPE: enlace de origen no disponible en la información proporcionada
- FCPE y componentes posteriores (Basic Pitch, GAME 1.0.3, JBM555 CE-CTC 80, STARS Chinese P1, ROSVOT P0, FireRedASR2-AED, Qwen3-ASR 1.7B, Qwen3-ForcedAligner 0.6B): enlaces de origen no disponibles en la información proporcionada, porque la model card aparece truncada en ese punto
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; únicamente enlaces genéricos de Google Maps sin relación con el repositorio
