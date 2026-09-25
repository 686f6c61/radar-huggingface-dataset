# SceneWorks/yue-s2-1b-general-candle

## Resumen
El modelo SceneWorks/yue-s2-1b-general-candle es un espejo de redistribución del modelo m-a-p/YuE-s2-1B-general, la etapa 2 (upsampler de codebook de 1B parámetros) del sistema de generación musical YuE desarrollado por HKUST y M-A-P. No se trata de un modelo nuevo ni de una distribución oficial, sino de una réplica alojada por SceneWorks para que los pesos se resuelvan mediante un SHA de commit inmutable en su motor de inferencia candle. El modelo resuelve la tarea de convertir letras en canciones completas (lyrics2song) dentro de la arquitectura YuE, actuando como upsampler de codebook en la segunda etapa del pipeline.

Cuenta con 1B parámetros, una longitud de contexto de 8192 tokens y un vocabulario de 83840 entradas. El repositorio incluye tres niveles: bf16 (safetensors original), q8 (Q8_0) y q4 (Q4_0 + Q4_K), con un tamaño total de 7,9 GB. Es relevante para desarrolladores que quieran desplegar generación musical local sin depender de servicios en la nube, gracias a su licencia Apache-2.0 y a la integración con el motor candle de SceneWorks.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible explícitamente; descrita como upsampler de codebook de la etapa 2 de YuE |
| Parámetros totales | 1B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | bf16, GGML Q8_0, GGML Q4_0, GGML Q4_K |
| Idiomas soportados | No disponible (etiqueta "yue" sugiere cantonés, sin confirmar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16); tensores U8 con bloques GGML para q8/q4 |
| Vocabulario | 83840 |
| Tamaño del repositorio | 7,9 GB |

## Arquitectura y entrenamiento
Este repositorio no entrena ningún modelo; redistribuye los pesos de la etapa 2 de YuE. La arquitectura subyacente es un upsampler de codebook de 1B parámetros que forma parte del pipeline de YuE, un sistema de generación musical que transforma letras en canciones. No se proporcionan detalles sobre el número de capas, tipo de atención o mecanismos internos. El entrenamiento original fue realizado por M-A-P y HKUST, pero no se especifican en la información disponible el número de tokens, la composición del dataset ni si se emplearon técnicas como RLHF o DPO.

La innovación técnica de este rehost radica en la preparación de cuantizaciones GGML para el motor candle: las proyecciones de atención y MLP se cuantizan una vez y se almacenan como bloques crudos (Q4_0, Q4_K, Q8_0), lo que permite al cargador de candle reconstruirlas sin dequantizar y re-cuantizar. Las capas de embeddings, la cabeza LM y las normas permanecen en bf16. El tokenizador se deriva del SentencePiece original y se verifica id a id contra el tokenizador upstream sobre 3010 casos sin discrepancias.

## Capacidades
- Generación musical a partir de letras (lyrics2song): el modelo actúa como upsampler de codebook en la etapa 2 del pipeline YuE, contribuyendo a la síntesis de canciones completas.
- No es un modelo de propósito general: no genera texto libre, código, matemáticas ni mantiene conversaciones.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidades multilingües no confirmadas; la etiqueta "yue" apunta a cantonés, pero no se detallan idiomas soportados.
- Capacidad especial: integración con el códec xcodec-mini-infer para la decodificación de audio; el modelo no incluye los decodificadores Vocos, que se obtienen por separado.
- Cuantizaciones precalculadas para despliegue eficiente en GPU de consumo.

## Casos de uso
- Composición musical asistida: un letrista puede introducir la letra de una canción y el modelo, junto con la etapa 1 de YuE, genera una maqueta completa. La ventana de 8192 tokens permite letras extensas.
- Prototipado rápido en estudios de grabación: los productores pueden generar versiones preliminares de canciones para evaluar arreglos antes de grabar con músicos reales.
- Generación de bandas sonoras para videojuegos o vídeo: integrado en un pipeline local, permite crear música original adaptada a escenas concretas sin depender de bancos de audio.
- Herramientas educativas de teoría musical: los estudiantes pueden experimentar con estructuras de canciones generadas a partir de letras y analizar la relación entre letra y música.
- Investigación en generación musical: el modelo sirve como componente de referencia para estudiar upsampling de codebook y cuantización GGML en tareas de audio.
- Aplicaciones de karaoke o versiones: a partir de una letra, se puede generar una base musical sobre la que cantar, con la ventaja de ejecución local y sin cuotas de API.
- Integración en DAWs o plugins: al ser un componente de 1B parámetros cuantizable a q4 (1,6 GB), puede incrustarse en estaciones de trabajo de audio digital para generar acompañamientos.
- Personalización de música para publicidad o contenido corto: la licencia Apache-2.0 permite uso comercial, y la inferencia local evita enviar material creativo a la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada (solo pesos, según tamaño de repositorio): bf16 ~3,9 GB; q8 ~2,4 GB; q4 ~1,6 GB. Añadir 1-2 GB para buffers de inferencia y overhead del runtime.
- GPU recomendadas: cualquier GPU NVIDIA con 6 GB o más para q4 (p. ej., RTX 3060, RTX 4060); 8 GB o más para q8; 12 GB o más para bf16 con holgura (RTX 3060 12 GB, RTX 4070 Ti, etc.). En macOS, Apple Silicon con MLX.
- Cabe en GPU de consumo: sí, especialmente en cuantización q4, que ocupa menos de 2 GB.
- Opciones de despliegue: motor candle de SceneWorks Inference (Rust) con CUDA en Windows/Linux y MLX en macOS. No se proporcionan integraciones con vLLM, TGI o llama.cpp en la información disponible.
- Latencia y throughput: no disponibles. Dependen de la GPU, la cuantización y el resto del pipeline YuE (etapa 1 + códec xcodec).

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Cuantización | Disponibilidad |
|---|---|---|---|---|---|---|
| SceneWorks/yue-s2-1b-general-candle | 1B | 8192 | Apache-2.0 | safetensors + GGML | bf16, q8, q4 | Espejo no oficial con tiers precuantizados |
| m-a-p/YuE-s2-1B-general | 1B | 8192 | Apache-2.0 | safetensors | bf16 | Distribución oficial de M-A-P/HKUST |

No se dispone de información sobre otros modelos comparables de lyrics2song de 1B parámetros en la información proporcionada.

## Limitaciones y advertencias
- Este repositorio no es una distribución oficial de M-A-P; es un espejo mantenido por SceneWorks. Para uso en producción, se recomienda contrastar con el repositorio upstream.
- La cuantización q4 y q8 puede degradar la calidad musical frente a bf16, aunque no se han publicado evaluaciones al respecto.
- El modelo depende del códec xcodec-mini-infer y de los decodificadores Vocos, que no están incluidos en este repositorio.
- Sesgos conocidos: no se documentan sesgos específicos, pero los modelos de generación musical pueden reproducir estereotipos de estilo, género o idioma presentes en los datos de entrenamiento.
- Riesgo de alucinación: en el contexto de generación musical, puede producir estructuras armónicas o letras inconsistentes, especialmente con letras largas o idiomas poco representados.
- Limitaciones de contexto: la ventana de 8192 tokens puede ser insuficiente para letras muy extensas o composiciones que requieran memoria a largo plazo.
- Idiomas: no se especifican los idiomas soportados; la etiqueta "yue" sugiere cantonés, pero no hay confirmación oficial.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda atribución a "YuE by HKUST/M-A-P". Los creadores son responsables de evitar plagio en las obras derivadas.
- No hay benchmarks publicados que respalden el rendimiento de esta versión cuantizada.

## Enlaces
- HuggingFace (espejo): https://huggingface.co/SceneWorks/yue-s2-1b-general-candle
- HuggingFace (upstream): https://huggingface.co/m-a-p/YuE-s2-1B-general
- ModelScope (upstream): https://www.modelscope.cn/models/HKUSTAudio/YuE-s2-1B-general
- GitHub YuE: https://github.com/multimodal-art-projection/YuE
- GitHub SceneWorks: https://github.com/SceneWorks/SceneWorks
- Códec xcodec-mini-infer: https://huggingface.co/SceneWorks/xcodec-mini-infer
- README upstream: https://huggingface.co/m-a-p/YuE-s2-1B-general/blob/main/README.md
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
