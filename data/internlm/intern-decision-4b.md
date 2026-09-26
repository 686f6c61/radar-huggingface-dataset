# internlm/Intern-Decision-4B

## Resumen

Intern-Decision-4B es un modelo multimodal de decisión estructurada desarrollado por InternLM (Shanghai AI Laboratory) y publicado en HuggingFace bajo licencia Apache 2.0. Se obtiene por ajuste fino supervisado de Qwen3.5-4B, con 4.539.265.536 parámetros totales y un repositorio de 9,1 GB en formato safetensors. Su particularidad es que no genera texto libre: recibe un estado compartido, un esquema de preguntas con nombre y, opcionalmente, imágenes, y devuelve en una única pasada forward una distribución de probabilidad sobre las opciones de cada pregunta.

El modelo resuelve un problema muy concreto en pipelines de agentes y sistemas de decisión: la necesidad de obtener salidas tipadas (elección múltiple, escala de puntuación y respuesta sí/no/desconocido) con probabilidades calibradas, en lugar de texto parseable. Para ello mapea cada opción a un símbolo de un solo token (A-Z, a-z, 0-9), construye un esqueleto JSON con marcadores `<decision>` y lee los logits en la posición inmediatamente anterior a cada marcador aplicando un softmax restringido a los candidatos válidos de ese campo.

Es relevante ahora porque cubre un hueco poco atendido: la evaluación de decisiones bajo incertidumbre con métricas de calibración (Brier y ECE) y latencias de decenas de milisegundos. En la familia publicada conviven tres tamaños (0.8B, 2B y 4B), y el 4B alcanza una media de 90,02 en el conjunto de benchmarks del autor, con un Brier de 0,347 y un ECE de 0,065.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (image-text-to-text), ajustado desde Qwen3.5-4B; detalles internos de la arquitectura base no disponibles |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (no es MoE; el autor no indica lo contrario) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |
| Tamano del repositorio | 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 0 descargas / 16 likes |
| Fecha de creacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información pública no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Lo que sí se documenta es la naturaleza del ajuste: el modelo parte de Qwen3.5-4B y se especializa en un objetivo de decisión con enmascaramiento del siguiente token (*masked-next-token decision objective*). La inferencia no invoca `generate()` ni muestrea texto libre; se ejecuta una única pasada causal de HuggingFace y se leen los logits en la posición inmediatamente anterior a cada marcador `<decision>` del esqueleto JSON del asistente.

Sobre esos logits se aplica un softmax restringido únicamente a los símbolos candidatos permitidos para cada campo y, después, una calibración de temperatura específica del checkpoint. Para el modelo de 4B, el autor indica un valor ajustado de T = 1,992418. El procedimiento exige preservar el orden de preguntas y opciones, mapear las opciones a símbolos de un solo token, respetar la plantilla de chat del checkpoint y mantener el bloque de pensamiento vacío. Una misma petición puede contener varios campos y se resuelven todos en la misma pasada forward, sin insertar respuestas de referencia en el prompt.

## Capacidades

- Predicción estructurada de decisiones: devuelve una distribución de probabilidad por cada pregunta del esquema, no una única etiqueta.
- Tipos de pregunta soportados: `choice` (elección entre criterios), `score` (escala ordenada) y `noul` (sí/no/desconocido), según el ejemplo de la model card.
- Procesamiento multimodal: acepta imágenes opcionales junto al estado textual y al esquema de preguntas.
- Capacidad multirrespuesta: múltiples campos resueltos en una sola pasada forward, sin llamadas adicionales al modelo.
- Salida serializable en JSON tipado, con los valores originales de las opciones recuperados a partir de los símbolos.
- Capacidades conversacionales heredadas de Qwen3.5-4B, aunque la API publicada no las expone: el motor solo puntúa candidatos.
- Selección de herramientas: el benchmark ToolACE (96,45 en el modelo de 4B) evalúa decisiones de invocación de herramientas.
- Clasificación temática (AG News, 90,82) y evaluación de seguridad (WildJailBreak, 89,86).
- Calibración de probabilidades ajustable por temperatura, con métricas de Brier y ECE publicadas.
- No soporta de forma nativa tool calling ni agentes multi-paso en el sentido conversacional: la integración con agentes es externa, consumiendo las respuestas tipadas.

## Casos de uso

- Enrutado de tickets de soporte: el propio ejemplo de la model card muestra cómo decidir a qué equipo (facturación, envíos) corresponde una incidencia y con qué urgencia. Es adecuado porque devuelve una distribución calibrada por campo, lo que permite fijar umbrales de derivación a humano cuando la confianza es baja.
- Priorización y triaje con escala de puntuación: el tipo `score` permite mapear criterios ordenados (bajo, medio, alto) y obtener la probabilidad de cada nivel en una sola llamada, útil en sistemas de colas con SLA.
- Selección de herramientas en pipelines de agentes: con 96,45 en ToolACE, puede actuar como enrutador que decide qué función invocar antes de que un LLM generativo redacte la respuesta, reduciendo coste y latencia al no generar texto.
- Moderación y evaluación de seguridad: con 89,86 en WildJailBreak, puede clasificar si una entrada debe bloquearse, derivarse a revisión o procesarse, con probabilidades que permiten auditar falsos negativos.
- Clasificación documental y de noticias: 90,82 en AG News lo hace utilizable en categorización de contenidos a escala, con la ventaja de resolver lotes de campos en una sola pasada.
- Decisión multimodal con imágenes: al aceptar entradas de imagen y texto, puede valorar incidencias con capturas (por ejemplo, pantallazos de error o fotos de producto dañado) y devolver campos tipados de categoría y gravedad.
- Análisis de encuestas y estimación de distribuciones: el piloto de calibración con distribuciones de referencia exactas (Brier 0,550 y ECE 0,089 tras calibración) apunta a su uso en estudios donde interesa la distribución agregada, no la etiqueta mayoritaria.
- Inferencia de alta frecuencia: con latencias medias de 44,16 ms en una RTX 4090, encaja en servicios que necesitan decenas de decisiones por segundo, como moderación en tiempo real o scoring de eventos.

## Benchmarks y rendimiento

Resultados publicados por el autor (todos los valores, salvo Brier y ECE, más altos es mejor):

| Modelo | Jevbench-Easy | Jevbench-Original | Jevbench-Hard | Typed Decision | ToolACE | AG News | WildJailBreak | Media | Brier ↓ | ECE ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jev | 100,00 | 98,61 | 72,07 | 73,35 | 91,29 | 89,57 | 96,29 | 88,74 | 0,358 | 0,095 |
| Laya | 95,83 | 72,22 | 28,83 | 35,95 | 63,87 | 92,84 | 14,84 | 57,77 | 0,804 | 0,246 |
| SemIf | 100,00 | 98,61 | 61,26 | 62,80 | 85,16 | 89,22 | 92,53 | 84,23 | 0,498 | 0,112 |
| Kev | 100,00 | 93,06 | 45,05 | 65,60 | 87,42 | 89,82 | 75,97 | 79,56 | 0,738 | 0,262 |
| JevK5 | 100,00 | 97,22 | 73,87 | 64,50 | 80,97 | 89,13 | 90,45 | 85,16 | 0,366 | 0,047 |
| Intern-Decision-0.8B | 97,92 | 80,56 | 52,25 | 77,35 | 94,52 | 88,61 | 64,48 | 79,38 | 0,530 | 0,066 |
| Intern-Decision-2B | 100,00 | 84,72 | 63,96 | 79,35 | 96,45 | 89,96 | 78,33 | 84,68 | 0,437 | 0,100 |
| Intern-Decision-4B | 100,00 | 98,61 | 73,87 | 80,55 | 96,45 | 90,82 | 89,86 | 90,02 | 0,347 | 0,065 |

Latencia por consulta medida en una única RTX 4090 con la ruta de inferencia HF local (dependiente de la carga y del hardware):

| Modelo | Media | Mediana / P50 | P95 |
|---|---:|---:|---:|
| Jev | 109,70 ms | 106,30 ms | 146,70 ms |
| Intern-Decision-0.8B | 33,98 ms | 33,44 ms | 37,50 ms |
| Intern-Decision-2B | 33,28 ms | 33,15 ms | 33,55 ms |
| Intern-Decision-4B | 44,16 ms | 44,03 ms | 44,60 ms |

Piloto de calibración sobre distribuciones conocidas (96 casos, referencia exacta, menor es mejor; el modelo de 4B usó T = 1,992418 y el piloto no se empleó para ajustar la temperatura publicada):

| Categoria | 4B antes | 4B despues | Jev |
|---|---:|---:|---:|
| Aleatoriedad directa y soporte | 0,483 / 0,181 | 0,421 / 0,129 | 0,490 / 0,216 |
| Eventos compuestos y mezclas | 0,677 / 0,254 | 0,577 / 0,150 | 0,682 / 0,274 |
| Historia, condicionamiento y estado oculto | 0,711 / 0,219 | 0,613 / 0,108 | 0,657 / 0,113 |
| Evidencia diaria y sesgo de observación | 0,701 / 0,328 | 0,575 / 0,210 | 0,603 / 0,114 |
| Divulgación selectiva y puzles de probabilidad | 0,540 / 0,119 | 0,510 / 0,049 | 0,483 / 0,138 |
| Procesos secuenciales y combinatorios | 0,656 / 0,180 | 0,605 / 0,058 | 0,657 / 0,116 |
| Global (Brier / ECE) | 0,628 / 0,213 | 0,550 / 0,089 | 0,595 / 0,130 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 10-11 GB, partiendo de los 9,1 GB de pesos safetensors más activaciones y caché KV (estimación derivada del número de parámetros, no publicada por el autor).
- VRAM estimada en cuantizaciones de 8 y 4 bits: aproximadamente 5-6 GB y 3-4 GB respectivamente, siempre que se generen cuantizaciones propias, ya que el repositorio no las publica.
- GPU recomendadas: RTX 4090 para despliegue de baja latencia (el autor mide 44,16 ms de media por consulta); A100 o H100 para servir múltiples peticiones concurrentes.
- Cabe en GPU de consumo: sí en BF16 en tarjetas con 12 GB o más (RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090); con cuantización de 4 bits cabría en tarjetas de 6-8 GB, aunque no hay artefactos oficiales.
- Opciones de despliegue: el backend implementado y por defecto es `hf` (transformers) mediante la clase `DecisionEngine`; el autor no documenta soporte para vLLM, TGI, llama.cpp ni Ollama. La etiqueta `endpoints_compatible` aparece en HuggingFace, pero no se detalla en la model card.
- Entorno: Python 3.12 o superior, instalación de `requirements.txt` en un entorno PyTorch/CUDA. El motor se carga una vez (`DecisionEngine(device="cuda")`) y se reutiliza entre peticiones.
- Latencia y throughput: 44,16 ms de media, 44,03 ms de mediana y 44,60 ms de P95 por consulta en una RTX 4090. No se publica throughput agregado ni comportamiento con batching concurrente.
- Al no usar `generate()`, el consumo de memoria y el tiempo son predecibles: una única pasada forward independientemente del número de campos de la petición.

## Comparativa con modelos similares

Comparación con las alternativas de la misma familia y con el modelo de referencia Jev, a partir de los datos publicados:

| Modelo | Parametros | Media en benchmarks | Brier ↓ | ECE ↓ | Latencia media (RTX 4090) | Licencia |
|---|---|---:|---:|---:|---:|---|
| Intern-Decision-4B | 4,54B | 90,02 | 0,347 | 0,065 | 44,16 ms | Apache 2.0 |
| Intern-Decision-2B | No disponible (el nombre sugiere ~2B) | 84,68 | 0,437 | 0,100 | 33,28 ms | No disponible |
| Intern-Decision-0.8B | No disponible (el nombre sugiere ~0,8B) | 79,38 | 0,530 | 0,066 | 33,98 ms | No disponible |
| Jev | No disponible | 88,74 | 0,358 | 0,095 | 109,70 ms | No disponible |
| Laya | No disponible | 57,77 | 0,804 | 0,246 | No disponible | No disponible |

Frente a Jev, el modelo de 4B mejora la media (90,02 frente a 88,74), mejora el Brier (0,347 frente a 0,358), mejora el ECE (0,065 frente a 0,095) y es aproximadamente 2,5 veces más rápido en la misma GPU. Su punto débil relativo es WildJailBreak (89,86 frente a 96,29). Dentro de la propia familia, el salto de 2B a 4B aporta 5,34 puntos de media y reduce el Brier de 0,437 a 0,347.

## Limitaciones y advertencias

- No genera texto libre: la API no llama a `generate()` y solo puntúa candidatos predefinidos. No sirve para respuestas abiertas, resúmenes ni redacción.
- Requiere preparar el esquema de forma estricta: preservar orden de preguntas y opciones, mapear cada opción a un símbolo de un solo token y mantener la plantilla de chat con el bloque de pensamiento vacío. Cualquier desviación degrada los logits leídos.
- El conjunto de símbolos candidatos está limitado a 62 por pregunta (A-Z, a-z, 0-9), lo que acota el número de opciones por campo.
- La calibración de probabilidades es específica de cada checkpoint: el 4B usa T = 1,992418. Usar el módulo de inferencia equivocado puede desajustar las probabilidades de salida.
- Sesgos conocidos: no documentados por el autor. Al estar ajustado sobre Qwen3.5-4B, hereda los sesgos de ese modelo base, no cuantificados en la información disponible.
- Riesgo de alucinación: reducido en la forma, porque la salida se restringe a opciones válidas, pero persiste en el fondo si el estado de entrada es ambiguo o incompleto; la distribución puede concentrarse erróneamente.
- Idiomas soportados: no disponibles. No hay evaluación multilingüe publicada.
- Seguridad: el resultado en WildJailBreak (89,86) es el más bajo de sus benchmarks y queda por debajo del modelo Jev. No debe usarse como único filtro de seguridad sin capas adicionales.
- Contexto máximo: no disponible, por lo que no se puede garantizar el comportamiento con estados muy largos o esquemas extensos.
- Backend único: solo se implementa `hf`. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, lo que limita las opciones de despliegue a gran escala.
- Madurez: el modelo se publicó el 26 de septiembre de 2026 y registra 0 descargas y 16 likes, por lo que aún no cuenta con validación externa ni reportes de terceros.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con las obligaciones habituales de atribución y conservación del aviso de licencia. No se especifican restricciones adicionales, pero conviene revisar la licencia de Qwen3.5-4B como modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/internlm/Intern-Decision-4B
- Demo (Space oficial): https://huggingface.co/spaces/internlm/intern-decision
- Coleccion de pesos de la familia Intern-Decision: https://huggingface.co/collections/internlm/intern-decision
- Repositorio GitHub: https://github.com/internlm/Intern-Decision
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
