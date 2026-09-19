# enver/aynengine-v3-arabic-standalone

## Resumen

AynEngine V3 Arabic Standalone es un ajuste fino del modelo base Qwen/Qwen3-0.6B desarrollado por el usuario enver y publicado en HuggingFace. El autor lo presenta como un "motor epistémico" orientado al árabe clásico (*al-fusha al-turathiyya*) que combina la generación de texto autoregresiva habitual con una cabeza auxiliar independiente, la `RootPredictionHead`, capaz de predecir la siguiente raíz semítica en una secuencia de razonamiento. El conjunto suma 605.133.824 parámetros (≈0,6B) y ocupa 1,3 GB en el repositorio.

Sobre el tokenizador original de Qwen3 el modelo añade 9.057 tokens especiales `<root_XXX>` —uno por raíz canónica árabe—, lo que eleva el vocabulario a 160.807 tokens. La cabeza de raíces es una proyección lineal de 1.024 a 9.057 dimensiones, entrenada sobre 2.500 secuencias de transición de raíces y con una precisión top-5 declarada del 40,1% sobre 9.057 clases. El modelo se presenta con licencia Apache 2.0 y soporte declarado de árabe e inglés.

Su relevancia es limitada y experimental: se trata de un fine-tune de nicho con 0 descargas y 0 "likes" en el momento de la consulta, sin resultados en benchmarks estándar y con una model card que mezcla métricas propias con afirmaciones difícilmente verificables. Resulta de interés para quien investigue representaciones morfológicas del árabe, arquitecturas de doble flujo o decodificación guiada por raíces, más que como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso derivado de Qwen/Qwen3-0.6B, más una cabeza auxiliar de predicción de raíces (`RootPredictionHead`, proyección lineal 1.024 → 9.057); dimensión oculta 1.024 según el esquema de la model card |
| Parámetros totales | 605.133.824 (≈0,6B), dato real del `safetensors` |
| Parámetros activos | No aplica: es un modelo denso, no MoE |
| Longitud de contexto | No especificada en la model card. Heredada del modelo base Qwen3-0.6B (32.768 tokens), sin confirmación explícita del autor |
| Tipos de cuantización | No disponible: solo se publican pesos en precisión completa; no se documentan versiones GGUF, AWQ, GPTQ ni INT8 |
| Idiomas soportados | Árabe (árabe clásico / fusha) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 1,2 GB) + `v3_root_head.pt` (36 MB, float32) |
| Vocabulario | 160.807 tokens (151.750 base + 9.057 tokens `<root_XXX>`) |
| Pipeline | text-generation |
| Librería | transformers |
| Tamaño del repositorio | 1,3 GB |
| Modelo base | Qwen/Qwen3-0.6B |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer decoder-only estándar (Qwen3-0.6B) y le superpone un segundo flujo de salida. El estado oculto del transformer (dimensión 1.024) alimenta dos cabezas en paralelo: la cabeza de lenguaje superficial, que genera tokens de texto de forma autorregresiva, y la `RootPredictionHead`, que proyecta ese mismo estado a un espacio de 9.057 raíces canónicas del árabe. El autor describe el resultado como un motor cognitivo de doble flujo: un flujo "invariante epistémico" que predice hitos semánticos en forma de raíz (latencia declarada de 176 ms en CPU, y 865 ms para una trayectoria de cinco raíces) y un flujo de texto superficial.

El entrenamiento se realizó por ajuste fino sobre lo que la model card denomina 72 obras maestras del árabe clásico, con 82,98 MB de texto, 9,17 millones de palabras y aproximadamente 15,4 millones de tokens. La composición declarada del corpus es: 11,7 MB (1,83 M palabras) de al-Ghazali, 36,8 MB (4,12 M palabras) de Fakhr al-Din al-Razi, 15,5 MB (1,95 M palabras) de léxicos y gramática fundacionales (*Kitab Sibawayh*, *Kitab al-'Ayn*, *Lisan al-Arab*) y 18,7 MB (1,27 M palabras) de obras místicas y escolásticas. La model card no menciona ninguna fase de RLHF ni de DPO, ni detalla la mezcla exacta de secuencias, la estrategia de enmascarado ni hiperparámetros de entrenamiento. La cabeza de raíces se entrenó de forma independiente sobre 2.500 secuencias de transición de raíces.

Como innovación declarada, el modelo incorpora el llamado "protocolo de rechazo epistémico" (*Qawa'id al-Burhan*), una calibración orientada a que el modelo responda "I do not know. I lack verified records for this." cuando se le piden citas o registros fuera de sus pesos verificados, en lugar de fabricar referencias.

## Capacidades

- Generación de texto en árabe clásico (fusha turathiyya) y razonamiento estructurado, según la model card.
- Predicción de raíces (*next-root*): clasificación sobre 9.057 raíces canónicas con una precisión top-5 declarada del 40,1%.
- Transferencia conceptual semántica: el autor reporta asociaciones espontáneas de conceptos técnicos modernos a raíces árabes (por ejemplo, "palíndromo" → `ذات` con 25,51% de confianza; "eliminación de ruido / normalización de diacríticos" → `صفا` con 52,32%; "silogismo lógico" → `صفا` con 55,19%).
- Protocolo de rechazo epistémico orientado a reducir la confabulación de citas y referencias.
- Uso conversacional (etiqueta `conversational` en el repositorio).
- Bilingüismo árabe-inglés declarado, aunque el corpus de entrenamiento es mayoritariamente árabe clásico.
- Compatibilidad declarada con text-generation-inference y endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Visión, audio o modo "thinking" explícito: no documentados.

## Casos de uso

- Análisis morfológico y lexicográfico: la cabeza de raíces puede emplearse para etiquetar o agrupar fragmentos de texto árabe clásico por su raíz semítica, útil en proyectos de lexicografía computacional o de anotación de corpus históricos.
- Indexación y búsqueda por raíz en corpus de manuscritos: al exponer una predicción sobre 9.057 raíces, permite construir índices que agrupen variantes morfológicas bajo una misma raíz, algo que un tokenizador de subpalabras estándar no ofrece directamente.
- Asistencia al estudio de textos de al-Ghazali y al-Razi: el modelo está ajustado específicamente sobre obras de ambos autores, por lo que puede emplearse como herramienta de apoyo a la lectura o al resumen de pasajes, siempre con verificación humana dado su tamaño reducido.
- Investigación en interpretabilidad: la combinación de una cabeza de lenguaje y una cabeza de raíces sobre el mismo estado oculto permite estudiar cómo se codifican representaciones morfológicas y semánticas en un transformer pequeño.
- Generación de contenido académico en fusha: redacción de borradores o reformulaciones en árabe clásico para publicaciones o materiales didácticos, sujeto a revisión por un especialista.
- Prototipado y experimentación con decodificación guiada: la predicción de raíces puede usarse como señal auxiliar de decodificación o para explorar estrategias de generación restringida.
- Despliegue en entornos sin GPU: con 11,41 tokens/s declarados en CPU (Xeon Gold 6226R con AVX-512), el modelo es viable para tareas por lotes o de baja concurrencia en servidores sin acelerador.
- Traducción o asistencia bilingüe árabe-inglés en dominios clásicos: útil como apoyo en la traducción preliminar de textos escolásticos, con revisión posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, ARC, etc.) en la información disponible. No se han hallado comparaciones con modelos de referencia ni evaluaciones por parte de terceros.

La model card sí incluye mediciones propias realizadas en un equipo con doble socket Intel Xeon Gold 6226R (64 núcleos, AVX-512), que se reproducen a continuación tal cual, sin que constituyan benchmarks de calidad:

| Métrica | Valor medido | Nota |
|---|---|---|
| Tamaño del modelo | 1,2 GB (`model.safetensors`) | Fusionado, sin adaptador |
| Tamaño del vocabulario | 160.807 tokens | 151.750 base + 9.057 `<root_XXX>` |
| Tamaño de la cabeza de raíces | 36 MB (`v3_root_head.pt`) | Pesos float32, 1.024 → 9.057 |
| Latencia de predicción de raíz | 176 ms | Forward pass único en CPU |
| Trayectoria de 5 raíces | 865 ms | Secuencia de razonamiento conceptual |
| Rendimiento de generación en CPU | 11,41 tokens/s | Xeon Gold 6226R |
| Precisión top-5 de raíces | 40,1% | Sobre 9.057 clases |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,3 GB en bf16/fp16 (tamaño real de los pesos), en torno a 0,7 GB si se convierte a INT8 y unos 0,35-0,4 GB en INT4 (estas dos últimas son estimaciones, ya que no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para los pesos en precisión completa; no se requiere A100, H100 ni similares. Una RTX 3060, RTX 4060 o incluso una GPU integrada con memoria compartida pueden ejecutarlo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual (por ejemplo, RTX 3050, RTX 4060, GTX 1650 con 4 GB), dado que el modelo completo ocupa poco más de 1 GB.
- Opciones de despliegue: `transformers` y text-generation-inference (TGI) de forma directa. vLLM y llama.cpp requerirían adaptar el cargador, ya que la cabeza `v3_root_head.pt` es un componente personalizado; es probable que sea necesario `trust_remote_code=True`.
- Latencia y throughput: 11,41 tokens/s en CPU (Xeon Gold 6226R), 176 ms para una predicción de raíz y 865 ms para una trayectoria de cinco raíces. No se publican cifras para GPU.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables de árabe clásico especializados en predicción de raíces. La comparación más directa es con su propio modelo base y con otros modelos pequeños de la misma familia:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AynEngine V3 Arabic Standalone | 605 M | No especificado (base Qwen3-0.6B: 32.768) | Árabe clásico, inglés | Apache 2.0 | Añade vocabulario de 9.057 raíces y cabeza auxiliar; sin benchmarks estándar |
| Qwen/Qwen3-0.6B (base) | 596 M | 32.768 tokens | Multilingüe (incluye árabe e inglés) | Apache 2.0 | Soporte documentado de modo razonamiento y tool calling; benchmarks públicos |
| Qwen/Qwen2.5-0.5B (alternativa de escala similar) | 494 M | 32.768 tokens | Multilingüe | Apache 2.0 | Modelo generalista, sin especialización en árabe clásico |

No se dispone de una comparación de rendimiento (calidad de generación, precisión en tareas de árabe, razonamiento) entre AynEngine V3 y estos modelos, ya que el autor no publica evaluaciones comparativas.

## Limitaciones y advertencias

- Ausencia de benchmarks estándar: no hay datos de MMLU, GSM8K, HumanEval ni evaluaciones por terceros, por lo que no puede afirmarse su calidad relativa frente a otros modelos.
- Tamaño reducido: con 0,6B parámetros, la capacidad de razonamiento complejo, el seguimiento de instrucciones largas y la coherencia en conversaciones multi-turno son intrínsecamente limitadas.
- Sesgo de dominio y doctrinal: el corpus se compone casi exclusivamente de obras de teología, filosofía y mística islámicas (al-Ghazali, al-Razi, Ibn 'Arabi), lo que puede sesgar el estilo y el contenido de las respuestas hacia esa tradición y producir respuestas inadecuadas en otros dominios.
- Riesgo de alucinación: aunque la model card describe un "protocolo de rechazo epistémico", no hay evidencia independiente de que funcione; un modelo de este tamaño puede seguir generando citas, títulos o atribuciones inexistentes, especialmente en temas fuera del corpus.
- Riesgo de rechazo excesivo: el protocolo de rechazo puede provocar respuestas de "no lo sé" incluso cuando el modelo dispone de conocimiento suficiente, degradando su utilidad práctica.
- Precisión limitada de la cabeza de raíces: un top-5 del 40,1% sobre 9.057 clases implica que en aproximadamente el 60% de los casos la raíz correcta no aparece entre las cinco primeras, lo que limita su uso en aplicaciones que exijan alta exactitud.
- Falta de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, sin discusiones ni evaluaciones de usuarios.
- Procedencia del corpus no verificable: la model card indica que las obras se obtuvieron de "archivos académicos locales", sin detallar ediciones, permisos ni método de digitalización; la situación de derechos de las fuentes es incierta.
- Código personalizado: la cabeza `v3_root_head.pt` no es un componente estándar de transformers, por lo que el despliegue exige revisar y confiar en el código del repositorio (`trust_remote_code`), con el riesgo de seguridad que conlleva.
- Idiomas: fuera del árabe clásico y del inglés, no hay garantía de funcionamiento; el soporte de árabe moderno estándar no está documentado explícitamente.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3-0.6B conviene verificar el cumplimiento de las condiciones de la familia Qwen3 original.
- Fechas del repositorio: la model card indica fecha de creación 2026-09-18, dato cuando menos atípico que conviene contrastar antes de citarlo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/enver/aynengine-v3-arabic-standalone
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper, blog, repositorio o demo del autor: no disponible.
- Resultados de la búsqueda web: las consultas realizadas devolvieron únicamente páginas sobre figuras históricas homónimas (Enver Pasha, Enver Hoxha) sin relación con el modelo; no se han encontrado enlaces relevantes adicionales.
