# musubilabs/policylm-1.7b

## Resumen

PolicyLM-1.7B es un clasificador de moderación de contenido de pesos abiertos desarrollado por Musubi (musubilabs). Recibe un mensaje de texto junto con una política de moderación y devuelve una puntuación entre 0 y 1 para cada categoría de esa política, lo que permite decidir en el momento si un mensaje debe marcarse o no. Está pensado para entornos donde cada mensaje necesita una decisión inmediata: chat en vivo, comentarios y publicaciones de usuarios.

El modelo deriva por ajuste fino (finetune) de BidirLM/BidirLM-1.7B-Embedding, un transformer bidireccional de aproximadamente 1,73 mil millones de parámetros (1.728.429.057 según los pesos en safetensors). Funciona en dos modos: un modo `explicit` en el que el operador escribe sus propias categorías como reglas cortas en tiempo de inferencia, sin reentrenar, y un modo `aegis` con una taxonomía integrada de 23 categorías procedente de Aegis 2.0 de NVIDIA. Evalúa hasta 16 categorías por política y puntúa todas ellas en una sola pasada.

Su relevancia práctica está en la relación entre coste y velocidad: 1,7 B de parámetros, sin `trust_remote_code` ni descargas adicionales, con una mediana declarada de 35 ms por mensaje corto de chat en una NVIDIA L4 de 24 GB (22 ms en una H100) con hasta seis categorías, y capaz de ejecutarse en CPU de portátil o en Apple Silicon. Se distribuye bajo licencia Apache-2.0 y cubre 19 idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (BidirLM), ajustado para clasificación multietiqueta de texto |
| Parametros totales | 1.728.429.057 (aproximadamente 1,73 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | 19: arabe (ar), checo (cs), aleman (de), ingles (en), espanol (es), frances (fr), hindi (hi), italiano (it), japones (ja), coreano (ko), malayo (ms), neerlandes (nl), polaco (pl), portugues (pt), ruso (ru), sueco (sv), tamil (ta), tailandes (th), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 3,5 GB) |

Datos adicionales de la ficha: pipeline `text-classification`, revisión descargable etiquetada como `v1.2`, dependencias declaradas `transformers==4.57.6`, `torch>=2.5.1`, `safetensors>=0.4` y `huggingface_hub>=0.34,<1.0`. La model card marca `inference: false`, es decir, no está habilitado en la Inference API de Hugging Face y debe ejecutarse en infraestructura propia.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un ajuste fino sobre BidirLM/BidirLM-1.7B-Embedding, un modelo bidireccional orientado a representaciones (embedding), y de que la salida es multietiqueta: una puntuación independiente por categoría más una puntuación agregada de "Prompt harmful" que determina la marca final en modo `aegis`. El modelo se usa como clasificador, no como generador, y no requiere `trust_remote_code` para cargarse.

Los conjuntos de datos declarados para el ajuste son nvidia/Nemotron-Safety-Guard-Dataset-v3, Alibaba-AAIG/XGuard-Train-Open-200K y ToxicityPrompts/PolyGuardMix. La taxonomía integrada de 23 categorías proviene del artículo de Aegis 2.0 (arXiv:2501.09004, sección 3). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la proporción por idioma ni si se emplearon técnicas de alineación como RLHF o DPO; ninguno de estos datos está disponible en la información proporcionada. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que en cualquier caso no aplicarían a un clasificador bidireccional sin generación autoregresiva.

La innovación funcional destacable es el modo `explicit`: las categorías se definen en inferencia mediante una regla de violació, una regla de no violació y una excepción que prevalece. Esto permite adaptar el clasificador a una política concreta sin reentrenamiento, algo que la model card sitúa como ventaja frente a otros modelos de la categoría.

## Capacidades

- Clasificación multietiqueta de contenido: devuelve una puntuación de 0 a 1 por cada categoría de la política, además de un indicador booleano `flagged` y la lista de categorías incumplidas.
- Políticas personalizadas en tiempo de inferencia (modo `explicit`): cada categoría se define con reglas de violació, de no violació y una excepción que prevalece, sin reentrenamiento.
- Taxonomía integrada (modo `aegis`) de 23 categorías de Aegis 2.0: violencia, contenido sexual, planificación o confesión de delitos, armas ilegales, sustancias controladas, suicidio y autolesión, contenido sexual con menores, odio identitario, PII y privacidad, acoso, amenazas, blasfemias, "necesita precaución", otros, manipulación, fraude y engaño, malware, decisiones gubernamentales de alto riesgo, política/desinformación/teorías conspirativas, derechos de autor y plagio, consejos no autorizados, actividad ilegal e inmoralidad o falta de ética, más una puntuación agregada "Prompt harmful".
- Procesamiento por lotes mediante `classify_batch(messages, policy)`.
- Umbrales de decisión configurables: presets `precision` (por defecto) y `balanced`, umbral por llamada y umbral por categoría individual.
- Multilingüe, evaluado según el autor en mensajes de 19 idiomas.
- Funcionamiento offline y autocontenido, sin descarga secundaria de artefactos.
- Inferencia en CPU, Apple Silicon y GPU de 24 GB o superior.

No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling ni razonamiento multi-paso. La model card excluye explícitamente el análisis de imágenes y del historial de conversación.

## Casos de uso

- Moderación de chat en vivo: cada mensaje entrante se puntúa en una sola pasada contra la política del servicio y se marca si supera el umbral; con una mediana declarada de 35 ms por mensaje corto en una L4, el filtrado puede hacerse de forma síncrona en la ruta de mensajes sin bloquear la conversación.
- Moderación de comentarios y publicaciones en plataformas UGC: se aplica el preset `precision` (umbral 0,335 en modo `explicit` y 0,69 en `aegis`) cuando las violaciones son poco frecuentes, y `balanced` (0,275 y 0,45) cuando una violación no detectada cuesta más que un falso positivo.
- Aplicación de normas internas de comunidad específicas: gracias al modo `explicit`, un equipo puede traducir su código de conducta a categorías con reglas cortas y adaptar el modelo a su política sin reentrenar ni mantener un dataset etiquetado propio.
- Triaje previo a revisión humana: el modelo identifica qué regla concreta se incumple, de modo que la cola de revisión manual puede priorizarse por categoría en lugar de por un único indicador binario.
- Filtrado de entradas en un pipeline de datos o de entrenamiento: dado que puntúa por lotes y es multilingüe en 19 idiomas, puede usarse para descartar o etiquetar mensajes tóxicos en corpus recogidos de fuentes abiertas.
- Cribado genérico de seguridad con infraestructura mínima: el modo `aegis` permite desplegar un filtro de seguridad estándar en una única GPU de 24 GB, en CPU de portátil o en Apple Silicon, útil para prototipos, entornos de desarrollo o servicios con tráfico moderado.
- Validación automatizada de políticas antes de desplegarlas: al permitir fijar umbrales por categoría, un equipo puede calibrar el corte sobre mensajes etiquetados propios y comparar configuraciones antes de activarlas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card afirma que, en el benchmark propio de políticas personalizadas del autor, PolicyLM-1.7B supera a todos los demás modelos probados por debajo de 20 000 millones de parámetros, pero no se aportan cifras, nombres de los modelos comparados ni métricas concretas, por lo que esta afirmación no puede verificarse con los datos disponibles.

Los únicos datos de rendimiento medibles publicados son de latencia y umbrales:

| Metrica | Valor declarado |
|---|---|
| Latencia mediana por mensaje corto de chat, 1x NVIDIA L4 (24 GB), hasta 6 categorias | 35 ms |
| Latencia mediana por mensaje corto de chat, 1x NVIDIA H100 | 22 ms |
| Categorias por politica | hasta 16 |
| Umbral por defecto, modo `explicit` (`precision`) | 0,335 |
| Umbral por defecto, modo `aegis` (`precision`) | 0,69 |
| Umbral modo `explicit` (`balanced`) | 0,275 |
| Umbral modo `aegis` (`balanced`) | 0,45 |

No se publican cifras de throughput (mensajes por segundo), consumo de memoria medido ni resultados de precisión, exhaustividad o F1 sobre conjuntos de evaluación independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3,5 GB solo para los pesos (tamaño del repositorio, coherente con precisión de 16 bits); en la práctica hay que sumar memoria para activaciones y el tokenizador, por lo que un presupuesto de 4 a 6 GB es razonable. Cargado en fp32 serían aproximadamente 6,9 GB. Para cuantizaciones de 8 bits, una estimación teórica ronda los 1,8 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU validadas por el autor: NVIDIA L4 de 24 GB (35 ms de mediana) y NVIDIA H100 (22 ms de mediana).
- Compatibilidad con GPU de consumo: sí. Con 1,73 B de parámetros cabe en tarjetas de 8 GB o superiores (por ejemplo, RTX 3060, RTX 4060, RTX 4070, RTX 4090) siempre que se use precisión de 16 bits. También se ejecuta en CPU de portátil y en Apple Silicon según la model card.
- Opciones de despliegue: inferencia directa con PyTorch y Transformers (versión fijada en 4.57.6), usando la carpeta `inference/` incluida en el repositorio, que debe copiarse íntegra si se quiere reutilizar el helper `PolicyLM`. El modelo usa una API de clasificación (`classify`, `classify_batch`) y no un bucle generativo. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia.
- Latencia y throughput estimados: 35 ms de mediana por mensaje corto en L4 con hasta seis categorías y 22 ms en H100, según el autor. La latencia crece con el número de categorías y la longitud del mensaje, aunque no se publican curvas al respecto. El throughput agregado no está disponible.

## Comparativa con modelos similares

La información proporcionada no incluye resultados cuantitativos de terceros, por lo que la comparación se limita a parámetros, licencia y formato de publicación. Los datos de rendimiento de los modelos alternativos aparecen como no disponibles porque no se han facilitado en esta búsqueda.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento comparado |
|---|---|---|---|---|---|
| PolicyLM-1.7B (musubilabs) | 1,73 B | no disponible | Apache-2.0 | Clasificador multietiqueta con política definible en inferencia y taxonomía Aegis 2.0 | Referencia base; sin cifras publicadas |
| Llama Guard 3 8B (Meta) | 8 B | no disponible | Licencia comunitaria de Llama 3.2 | Clasificador de seguridad con taxonomía fija | no disponible |
| ShieldGemma 2B (Google) | 2 B | no disponible | Licencia de Gemma | Clasificador de seguridad con taxonomía fija | no disponible |
| Nemotron Safety Guard (NVIDIA) | no disponible | no disponible | no disponible | Clasificador de seguridad; su dataset v3 se usó en el entrenamiento de PolicyLM | no disponible |

La única comparación cualitativa aportada por el autor es la afirmación de que PolicyLM-1.7B supera a todos los modelos por debajo de 20 B probados en su benchmark interno de políticas personalizadas, sin cifras que la respalden en la información disponible.

## Limitaciones y advertencias

- Fuera de alcance declarado: la aplicación de normas de seguridad infantil (el contenido sospechoso debe derivarse a herramientas dedicadas), ser la única salvaguarda frente a autolesión, funcionar como frontera de seguridad frente a usuarios adversarios y moderar respuestas de asistentes.
- No proporciona justificación escrita de la decisión, por lo que no es adecuado para procesos de apelación, expulsiones o retiradas de contenido que exijan motivación documentada.
- Analiza texto de uno en uno; no procesa imágenes ni historial de conversación, lo que limita su uso en moderación contextual o multimodal.
- Riesgo de alucinación y de error de calibración: al ser un clasificador, su riesgo no es inventar hechos, sino producir falsos positivos o falsos negativos. El propio autor recomienda calibrar el umbral sobre mensajes etiquetados propios antes de usarlo, y advierte de que en casos donde una violación no detectada cuesta mucho más que un falso positivo conviene usar otro enfoque.
- Sesgos: no se documentan análisis de sesgo ni evaluaciones de equidad por grupo demográfico, idioma o variedad dialectal. Las categorías sensibles (odio identitario, contenido sexual, autolesión) pueden comportarse de forma desigual entre los 19 idiomas declarados, sin datos públicos al respecto.
- Cobertura idiomática: se declaran 19 idiomas y una evaluación en mensajes de esos idiomas, pero no se especifica el reparto de datos de entrenamiento por lengua, por lo que el rendimiento en idiomas con menos presencia (por ejemplo, tamil, malayo o tailandés) podría ser inferior al del inglés.
- Sin datos sobre la longitud de contexto soportada: mensajes muy largos pueden truncarse por el tokenizador sin que la model card documente el límite.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se cumplan las condiciones del texto. Conviene verificar las licencias de los datasets de entrenamiento por separado si se planea redistribuir el modelo o derivados.
- Producción: la model card marca `inference: false` (no está disponible en la Inference API de Hugging Face) y fija `transformers==4.57.6`, por lo que el despliegue exige infraestructura propia y control de versiones. No hay soporte documentado para servidores de inferencia populares como vLLM, TGI u Ollama, y la revisión `v1.2` debe descargarse explícitamente.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica una adopción pública todavía muy limitada y, por tanto, poca validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/musubilabs/policylm-1.7b
- Modelo base: https://huggingface.co/BidirLM/BidirLM-1.7B-Embedding
- Articulo de Aegis 2.0 (taxonomia de 23 categorias): https://arxiv.org/abs/2501.09004
- Dataset nvidia/Nemotron-Safety-Guard-Dataset-v3: https://huggingface.co/datasets/nvidia/Nemotron-Safety-Guard-Dataset-v3
- Dataset Alibaba-AAIG/XGuard-Train-Open-200K: https://huggingface.co/datasets/Alibaba-AAIG/XGuard-Train-Open-200K
- Dataset ToxicityPrompts/PolyGuardMix: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Descarga de la revision v1.2: `hf download musubilabs/policylm-1.7b --revision v1.2 --local-dir policylm-1.7b`

No se han encontrado en la busqueda web articulos, repositorios, demos ni documentacion adicional del modelo distintos de los enlaces anteriores.
