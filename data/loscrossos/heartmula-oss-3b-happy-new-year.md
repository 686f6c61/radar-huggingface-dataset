# loscrossos/HeartMuLa-oss-3B-happy-new-year

## Resumen

HeartMuLa-oss-3B-happy-new-year es un checkpoint de la familia HeartMuLa, un conjunto de modelos fundacionales de música publicados en abierto por el equipo HeartMuLa (paper arXiv:2601.10547, repositorio heartlib). El modelo resuelve la tarea de generación de música a partir de texto (`text-to-audio`), con un énfasis explícito en el control de la letra: la model card lo describe como el mejor modelo abierto en términos de controlabilidad de la letra y calidad musical. Esta ficha cubre la copia alojada en el repositorio `loscrossos/HeartMuLa-oss-3B-happy-new-year`, que replica el checkpoint publicado por el equipo original en `HeartMuLa/HeartMuLa-oss-3B-happy-new-year`.

El checkpoint contiene 3.938.113.536 parámetros en formato safetensors (3,94 mil millones) y un repositorio de 15,8 GB, lo que sitúa los pesos en el rango de FP32 o de una mezcla de precisiones. La model card declara soporte de cinco idiomas (chino, inglés, japonés, coreano y español) y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales por parte del licenciante. El sufijo "happy-new-year" sugiere una variante temática del modelo base `HeartMuLa-oss-3B`, aunque la documentación disponible no detalla en qué consiste esa especialización.

La relevancia del checkpoint es doble: por un lado, la generación musical abierta con control de letra y voz cantada en varios idiomas sigue siendo un nicho con pocas alternativas con licencia permisiva; por otro, el ecosistema se distribuye de forma modular (modelo generador, códec de audio HeartCodec y transcriptor HeartTranscriptor), lo que facilita integrar el modelo en pipelines propios. La información pública disponible, sin embargo, es mínima: no hay detalles de arquitectura, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no describe la arquitectura; el pipeline es text-to-audio) |
| Parámetros totales | 3.938.113.536 (≈3,94 B), dato real de los safetensors |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Chino (zh), inglés (en), japonés (ja), coreano (ko), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-to-audio (generación musical) |
| Tamaño del repositorio | 15,8 GB |
| Autor del repositorio | loscrossos (copia de un checkpoint del equipo HeartMuLa) |
| Fecha de creación / actualización | 2026-10-20 (sin actualizaciones posteriores) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles de arquitectura más allá de la etiqueta de pipeline `text-to-audio` y de los tags `music` y `art`. No se especifica si el generador es un transformer autorregresivo sobre tokens de audio, un modelo de difusión sobre latentes, un modelo híbrido o si emplea un códec neuronal (HeartCodec) como representación intermedia. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, la presencia de etapas de ajuste fino supervisado, RLHF o DPO, ni innovaciones técnicas concretas como decodificación especulativa o atención lineal.

Lo que sí puede inferirse del ecosistema enlazado es una separación modular: `HeartCodec-oss-20260123` (recomendado) y `HeartCodec-oss` actúan como códec de audio, `HeartTranscriptor-oss` como transcriptor, y el repositorio `heartlib` como implementación de referencia para el despliegue local. El checkpoint aquí descrito es una variante concreta del generador de 3,94 B de parámetros; la relación exacta entre esta variante y `HeartMuLa-oss-3B` (ajuste temático, post-entrenamiento o simple cambio de configuración de muestreo) no está documentada. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de música a partir de prompts de texto, con salida de audio (pipeline `text-to-audio`).
- Control de la letra: la model card destaca explícitamente la controlabilidad de la letra como principal ventaja frente a otros modelos abiertos.
- Generación de voz cantada en cinco idiomas: chino, inglés, japonés, coreano y español.
- Integración con el códec HeartCodec para la síntesis y decodificación del audio.
- Integración con HeartTranscriptor para tareas de transcripción dentro del mismo ecosistema.
- Despliegue local mediante el repositorio `heartlib` (según la propia model card).
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, modo "thinking", visión ni audio de entrada (comprensión). La información disponible solo cubre la generación de audio.

## Casos de uso

- Producción de maquetas musicales: el modelo genera una pieza completa con letra e instrumentación a partir de una descripción textual, lo que permite a compositores iterar sobre ideas antes de entrar en un estudio; la ventana de contexto y la fidelidad estructural no están documentadas, por lo que conviene validar la duración efectiva de las piezas generadas.
- Sincronización y localización de canciones: al cubrir chino, inglés, japonés, coreano y español, puede emplearse para producir versiones en distintos idiomas de una misma idea musical, útil en sellos discográficos y agencias de localización.
- Música de fondo para vídeo, pódcast y streaming: generación de piezas libres de reclamaciones de derechos sobre catálogos de terceros, con licencia Apache 2.0 que facilita la publicación comercial del resultado.
- Prototipado rápido en videojuegos: creación de temas temáticos (el propio nombre del checkpoint, "happy new year", apunta a este uso estacional) sin depender de un compositor para cada iteración de diseño.
- Jingles y publicidad: generación de cuñas cortas con letra controlada, donde el control explícito de la letra es el requisito principal y el modelo declara estar optimizado para ello.
- Investigación en modelos fundacionales de música: el checkpoint sirve como referencia reproducible para experimentos de evaluación, ablaciones y comparativas dentro de `heartlib`.
- Aumento de datos para tareas de audio: generación de material musical diverso en varios idiomas para entrenar o evaluar sistemas de etiquetado, transcripción (con HeartTranscriptor) o separación de fuentes.
- Demostraciones y aplicaciones educativas: entornos docentes donde se explique generación condicionada por texto a partir de un modelo de pesos abiertos y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una afirmación cualitativa ("el mejor modelo de generación musical open source en controlabilidad de la letra y calidad musical") pero no aporta métricas, conjuntos de evaluación ni comparaciones numéricas que permitan verificarla. No se dispone tampoco de latencias ni de throughput medidos.

## Requisitos de hardware

- Estimación de pesos según el número real de parámetros (3.938.113.536):
  - FP32: ≈15,8 GB (coincide con el tamaño del repositorio, 15,8 GB).
  - BF16 / FP16: ≈7,9 GB solo en pesos.
  - INT8: ≈3,9 GB.
  - INT4: ≈2,0 GB.
- A esas cifras hay que sumar el coste del códec de audio, las cachés de atención y los búferes de audio durante la generación; la información disponible no permite cuantificarlo.
- GPU recomendadas: A100 (40/80 GB) o H100 para servir varias peticiones en paralelo con FP16/BF16; RTX 4090 (24 GB) para inferencia individual en FP16 con margen; RTX 3090/4080 (16-24 GB) suficientes para FP16 en una sola petición; tarjetas de 8-12 GB solo viables si se aplica cuantización a 8 o 4 bits.
- Cabe en GPU de consumo: sí, previsiblemente en FP16 en tarjetas de 16 GB o más, y en 4 bits en tarjetas de 8 GB (estimación aritmética, no validada con pruebas publicadas).
- Opciones de despliegue: el repositorio oficial `heartlib` (https://github.com/HeartMuLa/heartlib) es la vía documentada por el autor. No se indica soporte de vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos GGUF; al ser un modelo text-to-audio, los runners orientados a LLM no son directamente aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| HeartMuLa-oss-3B-happy-new-year (este checkpoint) | 3,94 B | No disponible | zh, en, ja, ko, es | Apache 2.0 | safetensors | Publicado; 0 descargas en la copia consultada |
| HeartMuLa-oss-3B | No disponible en la información proporcionada (misma familia, predecesor del anterior) | No disponible | No disponible | Apache 2.0 (según el ecosistema) | safetensors | Publicado por el equipo original |
| HeartCodec-oss-20260123 | No disponible | No disponible | No aplica (códec) | No disponible | No disponible | Componente complementario, no alternativa |
| MusicGen (Meta) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | Alternativa de la misma categoría; sin datos verificables aquí |
| YuE | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | Alternativa de la misma categoría; sin datos verificables aquí |

No se dispone de comparaciones medidas (calidad musical, inteligibilidad de la letra, latencia) entre este checkpoint y otras familias de generación musical abierta. La única comparación documentada por el autor es cualitativa y se refiere a la controlabilidad de la letra.

## Limitaciones y advertencias

- Ausencia total de datos de evaluación: la afirmación de "mejor modelo open source" en controlabilidad de letra y calidad no está respaldada por métricas publicadas en la información disponible.
- Documentación mínima: no se detallan arquitectura, datos de entrenamiento, contexto máximo, duración máxima de audio generado ni procesos de alineación.
- Repositorio espejo: la copia consultada pertenece al usuario `loscrossos`, no al espacio oficial `HeartMuLa`, con 0 descargas y 0 likes; conviene usar la versión oficial como referencia y verificar la integridad de los pesos si se descarga el espejo.
- Procedencia de los datos de entrenamiento desconocida: aunque la licencia del modelo es Apache 2.0, no se documenta la licencia del corpus musical empleado, lo que traslada un riesgo jurídico al uso comercial de las piezas generadas que pudieran recordar material protegido.
- Riesgo de alucinación en el sentido de artefactos de audio: letras mal pronunciadas, sílabas fuera de tempo, estructuras incoherentes o ruido en pasajes largos son fallos esperables en modelos generativos de audio; no se documenta mitigación.
- Cobertura lingüística limitada a cinco idiomas; no hay información sobre calidad relativa entre ellos ni sobre el español de España frente a otras variantes.
- Sin soporte documentado de cuantización: no se publican pesos GGUF, AWQ ni GPTQ, de modo que reducir requisitos de VRAM exige cuantizar por cuenta propia.
- Sesgos: no hay información sobre sesgos de estilo, género musical o representación cultural en el dataset de entrenamiento.
- Idoneidad productiva no validada: sin latencias, throughput ni pruebas de carga publicadas, no es posible dimensionar un servicio con garantías a partir de la documentación disponible.
- Nombre del checkpoint: el sufijo "happy-new-year" indica una variante temática, pero se desconoce si su comportamiento general difiere del modelo base `HeartMuLa-oss-3B`.
- No apto para tareas de texto, código, matemáticas, visión o agentes: la información disponible solo respalda generación de audio.

## Enlaces

- Modelo en HuggingFace (copia consultada): https://huggingface.co/loscrossos/HeartMuLa-oss-3B-happy-new-year
- Modelo oficial recomendado: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Modelo base de la familia: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Códec recomendado: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Códec (versión previa): https://huggingface.co/HeartMuLa/HeartCodec-oss
- Transcriptor: https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
- Repositorio de código (despliegue local): https://github.com/HeartMuLa/heartlib
- Paper: https://arxiv.org/abs/2601.10547
- Demo: https://heartmula.github.io/
- Contacto del equipo: heartmula.ai@gmail.com
