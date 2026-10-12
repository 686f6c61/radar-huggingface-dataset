# PIGEONS-Captioner/PIGEONS

## Resumen

PIGEONS es un modelo de subtitulado automático (captioning) de vídeo largo desarrollado por el equipo PIGEONS-Captioner, un ajuste fino del modelo multimodal Qwen/Qwen3-Omni-30B-A3B-Instruct. Su objetivo es resolver dos problemas clásicos del captioning de vídeo extenso: las referencias inconsistentes a los sujetos (una misma persona o personaje recibe nombres distintos a lo largo del vídeo) y la fragmentación del relato cuando se aplica un enfoque ingenuo de dividir el vídeo en segmentos y concatenar sus descripciones.

La propuesta técnica se apoya en dos componentes: una Galería de Identidades Persistente (Persistent Identity Gallery), construida tras un escaneo previo del vídeo completo, que fija las referencias visuales de los sujetos principales, y un Resumen Narrativo Global Evolutivo (Evolving Overarching Narrative Summary), que se actualiza tras cada clip para mantener el contexto de largo alcance de forma compacta. El modelo genera las descripciones clip a clip condicionadas por ambos elementos.

Arquitectónicamente hereda del modelo base: una arquitectura transformer multimodal con mezcla de expertos (MoE), con 35.259.818.545 parámetros totales según los pesos publicados en safetensors y un repositorio de 70,5 GB. Se distribuye bajo licencia Apache 2.0 y, en el momento de redactar esta ficha, acumula 9 descargas y 0 likes en HuggingFace, por lo que se trata de una publicación reciente y con escasa validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); etiqueta de HuggingFace `qwen3_omni_moe` |
| Parámetros totales | 35.259.818.545 (~35,26 mil millones) |
| Parámetros activos | ~3 mil millones (según la nomenclatura A3B del modelo base; no desglosado explícitamente en la ficha del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se documentan GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Omni-30B-A3B-Instruct, un transformer multimodal con mezcla de expertos que procesa texto, imagen, audio y vídeo. Sobre esa base, PIGEONS introduce un cambio de flujo de inferencia en lugar de una arquitectura nueva: antes de generar subtítulos, el sistema escanea el vídeo completo para construir una galería de identidades con referencias visuales de los sujetos clave; después, procesa el vídeo clip a clip, condicionando cada descripción con la galería persistente y con un resumen narrativo global que se va actualizando tras cada paso. Este diseño busca mantener la coherencia referencial y la continuidad narrativa sin depender de una ventana de contexto capaz de contener el vídeo entero.

El entrenamiento se estructura en tres etapas que combinan ajuste fino supervisado (SFT) y aprendizaje por refuerzo (RL), según describe la ficha del autor. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, los detalles del algoritmo de RL ni los hiperparámetros empleados.

## Capacidades

- Subtitulado detallado de vídeo largo: genera descripciones densas clip a clip en lugar de un único resumen global.
- Consistencia referencial de sujetos: mantiene una galería de identidades que asigna referencias estables a personas, personajes u objetos destacados a lo largo del metraje.
- Coherencia narrativa de largo alcance: el resumen global evolutivo conserva el hilo argumental entre clips alejados en el tiempo.
- Comprensión multimodal de vídeo: hereda del modelo base la capacidad de procesar entradas audiovisuales (la ficha del autor no detalla qué modalidades concretas usa el ajuste).
- Rendimiento en vídeo corto: el autor afirma que mantiene un rendimiento competitivo en captioning de vídeo corto, aunque no aporta cifras.
- Soporte de tool calling, function calling y flujos de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito, visión o audio independientes: no disponible en la información proporcionada.

## Casos de uso

- Indexado y búsqueda semántica de videotecas: las descripciones generadas clip a clip sirven como metadatos textuales para motores de búsqueda o sistemas RAG sobre archivos audiovisuales, aprovechando que el modelo mantiene referencias estables a los mismos sujetos en todo el vídeo.
- Accesibilidad audiovisual: generación de audiodescripción y subtítulos descriptivos para personas con discapacidad visual en películas, documentales o retransmisiones, donde la consistencia de nombres de personajes es un requisito de calidad.
- Curación de datos para entrenamiento de modelos de vídeo: producción automática de pares vídeo-texto de alta densidad descriptiva para alimentar pipelines de entrenamiento de modelos generativos de vídeo o de comprensión multimodal.
- Análisis de material deportivo: descripción narrativa de partidos o competiciones completas, manteniendo la referencia a los mismos jugadores durante todo el encuentro mediante la galería de identidades.
- Postproducción y catalogación de archivo: generación automática de fichas descriptivas y metadatos para fondos documentales de televisiones y filmotecas, reduciendo el trabajo manual de etiquetado.
- Supervisión y análisis de grabaciones extensas: descripción de material de videovigilancia o de sesiones largas (por ejemplo, auditorías o ensayos clínicos filmados), donde el resumen narrativo evolutivo permite reconstruir qué ha ocurrido en cada franja temporal.
- Resúmenes de eventos corporativos o académicos: conversión de jornadas, congresos o clases de varias horas en crónicas estructuradas por tramos temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor menciona experimentos extensos y mejoras en precisión, completitud y consistencia referencial frente a métodos existentes, pero no incluye tablas numéricas, conjuntos de evaluación ni comparaciones cuantitativas.

## Requisitos de hardware

Estimaciones a partir del tamaño de los pesos publicados (35,26 mil millones de parámetros, repositorio de 70,5 GB); no hay mediciones oficiales de latencia o throughput en la información disponible.

- Inferencia en bf16/fp16: los pesos ocupan aproximadamente 70,5 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80 GB, H100 80 GB, H200) o reparto en varias GPU.
- Inferencia en FP8 o int8: en torno a 35-38 GB de VRAM; encaja en una RTX 6000 Ada (48 GB), L40S (48 GB) o en dos RTX 4090/3090 (24 GB cada una) con paralelismo de tensor.
- Inferencia en int4: en torno a 18-20 GB de VRAM más el espacio de activaciones y caché; podría caber en una única RTX 4090, RTX 3090 o L4, aunque no se publican pesos cuantizados y habría que generarlos.
- GPU de consumo: no cabe en bf16 en ninguna GPU de consumo actual; en int4 es viable en tarjetas de 24 GB, con la salvedad de que las cuantizaciones no están publicadas.
- Opciones de despliegue: transformers con el soporte de Qwen3-Omni, vLLM o SGLang (ambos con soporte MoE y multimodal en versiones recientes). llama.cpp y Ollama solo serían aplicables si se generan pesos GGUF, que no están disponibles en el repositorio.
- Coste de inferencia: al requerir un escaneo previo del vídeo para construir la galería de identidades y después un procesamiento clip a clip, el coste computacional es proporcional a la duración del vídeo y superior al de un pase único de captioning.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PIGEONS | 35,26 mil millones (MoE, ~3 mil millones activos) | no disponible | Apache 2.0 | HuggingFace (9 descargas) |
| Qwen3-Omni-30B-A3B-Instruct (modelo base) | ~30-35 mil millones (MoE) | no disponible en la información proporcionada | Apache 2.0 | HuggingFace, ampliamente distribuido |
| Otras alternativas de captioning de vídeo largo | no disponible | no disponible | no disponible | no disponible |

No se dispone, en la información proporcionada, de datos verificables de otros modelos de captioning de vídeo largo (parámetros, contexto, resultados de evaluación o licencia) que permitan una comparación cuantitativa rigurosa. La comparación más directa disponible es con el modelo base, del que PIGEONS hereda arquitectura, tamaño y licencia, diferenciándose por el ajuste específico y por el mecanismo de galería de identidades y resumen narrativo.

## Limitaciones y advertencias

- Madurez limitada: 9 descargas y 0 likes en HuggingFace, con fecha de creación en octubre de 2026; no hay evidencia comunitaria de uso en producción.
- Ausencia de benchmarks públicos: el autor no publica cifras en la model card, y la referencia al paper apunta a un identificador de arXiv sin resolver (`2610.xxxxx`) con la cita bibliográfica marcada como `TODO`, por lo que no es posible verificar los resultados declarados.
- Riesgo de alucinación: como todo modelo generativo aplicado a descripción visual, puede inventar detalles, atributos o acciones no presentes en el vídeo; la galería de identidades mitiga la inconsistencia de nombres, pero no elimina la invención de contenido.
- Idiomas: no se documenta qué idiomas soporta el ajuste ni la calidad por idioma. El modelo base es multilingüe, pero la ficha no confirma el comportamiento del ajuste.
- Longitud de contexto: no especificada. El diseño asume implícitamente que el vídeo completo no cabe en contexto, por lo que la calidad depende del resumen narrativo evolutivo y de la galería de identidades, no de la ventana de atención.
- Coste operativo: el escaneo previo del vídeo para construir la galería duplica el procesamiento del material y penaliza el throughput en cargas de trabajo por lotes.
- Repositorio pesado: 70,5 GB de pesos en safetensors, sin versiones cuantizadas, lo que complica el despliegue en infraestructura modesta.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados. No se declaran restricciones adicionales, pero conviene revisar las condiciones del modelo base (Qwen3-Omni-30B-A3B-Instruct), también Apache 2.0 según la información disponible.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, culturales o de representación en la información proporcionada, un riesgo relevante en modelos que describen personas en vídeo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PIGEONS-Captioner/PIGEONS
- Página del proyecto: https://pigeons-captioner.github.io/
- Repositorio en GitHub: https://github.com/PIGEONS-Captioner/PIGEONS
- Paper (referencia sin resolver en la model card): https://arxiv.org/abs/2610.xxxxx
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre el modelo; las entradas devueltas corresponden a consultas no relacionadas sobre letras de canciones en japonés y no aportan información técnica utilizable.
