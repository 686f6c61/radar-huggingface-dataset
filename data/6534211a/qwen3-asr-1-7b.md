# 6534211A/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático de voz (ASR) de la familia Qwen3-ASR, desarrollada por el equipo Qwen (Alibaba). El repositorio analizado, publicado bajo el identificador 6534211A/Qwen3-ASR-1.7B, es una réplica de los pesos oficiales Qwen/Qwen3-ASR-1.7B: la model card cita los comandos de descarga del repositorio oficial y no documenta ningún ajuste propio. Se distribuye con licencia Apache 2.0 y arquitectura etiquetada como qwen3_asr dentro del pipeline automatic-speech-recognition.

El modelo resuelve dos tareas conjuntas en una sola pasada: identificación de idioma (LID) y transcripción, con cobertura de 30 idiomas y 22 dialectos del chino, además de acentos del inglés de distintas regiones. Está construido sobre la capacidad de comprensión de audio de Qwen3-Omni y soporta inferencia unificada offline y en streaming con un único modelo, incluyendo audio largo, voz cantada y canciones con música de fondo.

Es relevante ahora porque la model card lo sitúa como estado del arte entre los modelos ASR de código abierto y competitivo con las APIs comerciales propietarias más potentes, sin publicar cifras concretas. La familia se completa con Qwen3-ASR-0.6B, orientado a latencia y coste, y con Qwen3-ForcedAligner-0.6B para alineación forzada con marcas de tiempo. Los metadatos de safetensors indican 2.349.217.408 parámetros reales, por encima de los 1,7 B que sugiere el nombre del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_asr, modelo de audio-lenguaje derivado de Qwen3-Omni; inferencia unificada offline y streaming |
| Parametros totales | 2.349.217.408 (~2,35 B) segun metadatos de safetensors; el nombre comercial indica 1,7 B |
| Parametros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos se publican en safetensors |
| Idiomas soportados | 30 idiomas: chino (zh), ingles (en), cantonés (yue), árabe (ar), alemán (de), francés (fr), español (es), portugués (pt), indonesio (id), italiano (it), coreano (ko), ruso (ru), tailandés (th), vietnamita (vi), japonés (ja), turco (tr), hindi (hi), malayo (ms), neerlandés (nl), sueco (sv), danés (da), finés (fi), polaco (pl), checo (cs), filipino (fil), persa (fa), griego (el), húngaro (hu), macedonio (mk), rumano (ro); más 22 dialectos del chino (Anhui, Dongbei, Fujian, Gansu, Guizhou, Hebei, Henan, Hubei, Hunan, Jiangxi, Ningxia, Shandong, Shaanxi, Shanxi, Sichuan, Tianjin, Yunnan, Zhejiang, cantonés con acento de Hong Kong, cantonés con acento de Guangdong, wu y minnan) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,7 GB |
| Tipos de audio admitidos | voz, voz cantada y canciones con musica de fondo (BGM) |

## Arquitectura y entrenamiento

La model card no detalla el número de capas, la dimensión oculta ni la composición exacta del codificador de audio. Lo que sí se especifica es que la familia Qwen3-ASR aprovecha la capacidad de comprensión de audio de su modelo base Qwen3-Omni y que se ha entrenado con datos de voz a gran escala. La etiqueta de arquitectura del repositorio es qwen3_asr y el pipeline declarado es automatic-speech-recognition. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo etapas de RLHF o DPO.

Como innovaciones técnicas destacables, la model card menciona tres: inferencia unificada de streaming y offline con un solo modelo, soporte de transcripción de audio largo, y una solución de alineación forzada mediante el modelo complementario Qwen3-ForcedAligner-0.6B, que predice marcas de tiempo para unidades arbitrarias en hasta 5 minutos de voz en 11 idiomas y que, según la evaluación del autor, supera en precisión de timestamps a los modelos de alineación forzada basados en enfoques end-to-end. También se publica un toolkit de inferencia propio (paquete qwen-asr) con backend de transformers y backend de vLLM, con soporte de inferencia por lotes, servicio asíncrono, inferencia en streaming y predicción de marcas de tiempo.

## Capacidades

- Reconocimiento automático de voz en 30 idiomas y 22 dialectos del chino, con identificación de idioma integrada en el mismo modelo.
- Manejo de acentos del inglés de múltiples países y regiones.
- Reconocimiento robusto en entornos acústicos complejos y ante patrones de texto difíciles.
- Transcripción de voz cantada y de canciones con música de fondo (BGM), además de voz hablada.
- Inferencia unificada offline y en streaming con un único conjunto de pesos.
- Transcripción de audio largo.
- Predicción de marcas de tiempo mediante el modelo complementario Qwen3-ForcedAligner-0.6B, para 11 idiomas (chino, inglés, cantonés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español) y hasta 5 minutos de audio.
- Toolkit de inferencia oficial con backend de transformers y de vLLM, servicio asíncrono y Docker.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está especializado en ASR, no en generación de texto general.
- Capacidades de visión o de texto generativo: no documentadas.

## Casos de uso

- Atención al cliente telefónica: el modelo puede transcribir llamadas con identificación automática de idioma, lo que permite enrutar cada conversación al agente o al equipo adecuado sin un paso previo de detección de idioma.
- Subtitulado y postproducción de vídeo: la combinación de transcripción y alineación forzada con Qwen3-ForcedAligner-0.6B permite generar subtítulos con marcas de tiempo precisas en 11 idiomas.
- Transcripción de reuniones y actas: con soporte de audio largo y modo offline, se pueden procesar grabaciones completas en lote mediante el backend de vLLM.
- Subtitulado en directo y accesibilidad: el modo streaming unificado permite alimentar un flujo de subtítulos en tiempo casi real para eventos, clases o retransmisiones.
- Indexación y búsqueda de archivos de audio: la transcripción masiva de un archivo histórico de podcast o de grabaciones internas habilita búsqueda por texto sobre contenido hablado.
- Análisis de contenido musical y de medios: al admitir voz cantada y canciones con BGM, se puede extraer letra para catálogos musicales, karaoke o moderación de contenido.
- Sistemas de dictado multilingües: la cobertura de 30 idiomas con LID integrada permite desplegar una única instancia para usuarios que alternan idiomas dentro de la misma sesión.
- Cumplimiento y auditoría: transcripción de grabaciones de contact center para revisiones de calidad y detección de riesgos, con marcas de tiempo que facilitan la localización de fragmentos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma de forma cualitativa que Qwen3-ASR-1.7B alcanza "rendimiento de estado del arte entre los modelos ASR de código abierto" y que es "competitivo con las APIs comerciales propietarias más potentes", tanto en benchmarks abiertos como internos, pero no incluye tablas, métricas ni valores numéricos. El único dato cuantitativo de rendimiento disponible se refiere al modelo hermano de 0,6 B: alcanza 2000 veces de throughput con una concurrencia de 128. No se proporcionan cifras equivalentes para la variante de 1,7 B.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): en torno a 5 GB solo para los pesos, según los 2,35 B de parámetros; hay que sumar el coste de activaciones y del codificador de audio, por lo que un presupuesto práctico de 8-10 GB es razonable para lotes pequeños. Se trata de una estimación derivada del recuento de parámetros, no de un dato publicado.
- VRAM estimada con cuantización: no disponible, ya que la información proporcionada no lista formatos de cuantización publicados (por ejemplo, GGUF o AWQ).
- GPU recomendadas: no se especifican en la model card. El paquete recomienda FlashAttention 2 para reducir el uso de memoria y acelerar la inferencia, especialmente con entradas largas y lotes grandes.
- GPU de consumo: por tamaño de parámetros, el modelo debería caber en tarjetas con 8-12 GB de VRAM o más (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080, RTX 4090), siempre que se ajuste el tamaño de lote al presupuesto de memoria.
- Opciones de despliegue: paquete oficial qwen-asr con backend de transformers (`pip install -U qwen-asr`) o backend de vLLM (`pip install -U qwen-asr[vllm]`); imagen Docker oficial; instalación desde el repositorio GitHub en modo editable; descarga de pesos vía Hugging Face Hub o ModelScope.
- Latencia y throughput: no publicados para el modelo de 1,7 B. Para el de 0,6 B se documenta un throughput de 2000 veces con concurrencia 128.
- Entorno recomendado por el autor: Python 3.12 en un entorno aislado; si la máquina tiene menos de 96 GB de RAM y muchos núcleos de CPU, se sugiere instalar FlashAttention 2 con `MAX_JOBS=4`.

## Comparativa con modelos similares

No se dispone de datos comparativos frente a modelos externos (por ejemplo, la familia Whisper u otros sistemas ASR abiertos) en la información proporcionada, más allá de la afirmación cualitativa de que el modelo es estado del arte entre los ASR de código abierto y competitivo con APIs propietarias. La comparación posible con los datos disponibles es interna a la familia:

| Modelo | Parametros | Idiomas | Modo de inferencia | Tipos de audio | Licencia |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B | 2,35 B reales (nombre comercial: 1,7 B) | 30 idiomas y 22 dialectos chinos | Offline / streaming | Voz, voz cantada, canciones con BGM | apache-2.0 |
| Qwen3-ASR-0.6B | no disponible | 30 idiomas y 22 dialectos chinos | Offline / streaming | Voz, voz cantada, canciones con BGM | no disponible en la informacion proporcionada |
| Qwen3-ForcedAligner-0.6B | no disponible | 11 idiomas | NAR | Voz | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio analizado (6534211A/Qwen3-ASR-1.7B) no es el repositorio oficial de Qwen: la model card apunta a Qwen/Qwen3-ASR-1.7B y muestra 0 descargas y 0 "likes". No hay información que confirme que los pesos alojados sean idénticos a los oficiales ni que se mantengan actualizados.
- No se documentan procedimientos de evaluación de sesgos, ni la composición del corpus de entrenamiento, por lo que no es posible estimar sesgos por acento, variedad dialectal, género o edad.
- El riesgo de alucinación existe en cualquier sistema ASR, especialmente con audio ruidoso, solapamiento de voces, jerga o nombres propios; la model card no publica tasas de error por dominio que permitan acotarlo.
- La cobertura lingüística es amplia (30 idiomas), pero cualquier idioma fuera de esa lista no está soportado y el rendimiento puede degradarse en variedades regionales no incluidas entre los 22 dialectos.
- El español figura entre los idiomas soportados, pero no se especifican variantes ni métricas por variante.
- No se especifica la longitud máxima de audio admisible por el modelo ASR (el límite de 5 minutos corresponde al modelo de alineación forzada, no al ASR).
- No se detallan requisitos de hardware, latencia ni consumo de memoria, lo que obliga a hacer pruebas propias antes de dimensionar un despliegue en producción.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar de forma independiente la licencia y las condiciones aplicables al repositorio concreto desde el que descargue los pesos.
- Las imágenes de la model card (diagramas de introducción y de arquitectura) no aportan metadatos textuales utilizables en esta ficha.

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/6534211A/Qwen3-ASR-1.7B
- Repositorio oficial citado en la model card: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio oficial del modelo de 0,6 B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio oficial del modelo de alineación forzada: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio de código: https://github.com/QwenLM/Qwen3-ASR
- Referencia arXiv indicada en las etiquetas del repositorio: arxiv:2601.21337 (sin URL verificada en la información proporcionada)
- ModelScope (descarga alternativa recomendada para China continental): https://modelscope.cn/models/Qwen/Qwen3-ASR-1.7B
- Imagen de introducción de la familia: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/qwen3_asr_introduction.png
- Esquema de arquitectura: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/overview.jpg
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: los enlaces obtenidos corresponden a documentación de Windows File Explorer y no guardan relación con Qwen3-ASR.
