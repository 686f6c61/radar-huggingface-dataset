# Nimruz/Mizan-v3-3B

## Resumen

Mizan v3 3B (میزان) es un modelo de decisión "Persian-first" desarrollado por Nimruz. No es un modelo generativo al uso: recibe un registro (`state`, en texto o JSON) y un conjunto de preguntas tipadas (`choice`, `noul`, `score`), y devuelve en una sola pasada hacia delante una probabilidad calibrada para cada respuesta permitida. No hay generación de texto, ni parseo de la salida, ni etiquetas inventadas: la respuesta es siempre una de las opciones definidas por quien llama, con su distribución de probabilidad completa.

Técnicamente es un fine-tune de Qwen/Qwen3.5-4B que decide a partir de la capa 20 de las 32 del modelo base, con 3.200.496.960 parámetros totales. Su propuesta de valor es el ajuste a reglas del usuario: la política de enrutado o la rúbrica de puntuación se incluyen en el propio registro y el modelo las aplica, incluso cuando van contra la intuición. Según el autor, iguala a modelos 3-9 veces mayores sobre 3.000 registros reales en persa (82,5 % frente a 83,0 % de Clef-Flash 9B y 83,4 % de Clef 27B) y es el mejor calibrado de todos los probados.

Es relevante ahora por tres motivos: sustituye un pipeline de prompt + parseo + validación por una llamada determinista con probabilidades, expone una API compatible con `/v1/systemone` (Jev/SystemOne) y se distribuye en un GGUF Q4_K_M de 1,9 GB que responde en unos 55 ms en una GPU de gama de entrada. La licencia Apache-2.0 y el entrenamiento solo con datos de uso comercial permitido facilitan su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Qwen/Qwen3.5-4B (32 capas); cabecera de decisión sobre la capa 20 |
| Parametros totales | 3.200.496.960 (3,2 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; los ejemplos de despliegue usan `-c 8192` |
| Tipos de cuantizacion | GGUF Q4_K_M publicado (1,9 GB); otros niveles de cuantizacion no disponibles |
| Idiomas soportados | Persa (fa) e ingles (en); las preguntas pueden formularse en ambos |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de 32 capas, y aplica una relación de fine-tune declarada en la model card. La innovación estructural es que la decisión no se toma en la última capa: Mizan v3 lee el estado oculto de la capa 20 y lo proyecta sobre las opciones tipadas de la petición. Esto reduce el coste de inferencia y, según el autor, mantiene la calidad de decisión con un modelo de 3,2 mil millones de parámetros. Las preguntas se formulan con una de tres modalidades: `choice` (claves con descripción, devuelve clave ganadora, confianza y probabilidades por clave), `noul` (enunciado sí/no, devuelve la probabilidad de "sí") y `score` (lista de niveles ordenados, devuelve la puntuación esperada, las probabilidades por nivel y la leyenda).

En cuanto a datos de entrenamiento, la información disponible no detalla el número de tokens, la composición del corpus ni si se aplicaron fases de RLHF o DPO. El autor sí afirma que se entrenó únicamente con datos que permiten uso comercial y que el pipeline usó Unsloth, además de mencionar 3.000 registros reales en persa como conjunto de evaluación. No se documenta ninguna técnica de decodificación especulativa ni de atención lineal: el modelo no decodifica texto, de modo que las optimizaciones relevantes son la extracción de estados en la capa 20 y la calibración de las probabilidades de salida.

## Capacidades

- Clasificación y decisión con probabilidades calibradas en una sola pasada, sin generación de texto ni parseo posterior.
- Preguntas de tipo `choice` con claves significativas (`billing`) u opacas (`opt_1`): el modelo lee las descripciones de cada opción.
- Preguntas de tipo `noul` para verificación de hechos contra el registro (por ejemplo, "el cliente facilitó un número de seguimiento").
- Preguntas de tipo `score` con rúbricas de niveles ordenados, devolviendo puntuación esperada y distribución por nivel.
- Aplicación de políticas y rúbricas definidas por el usuario dentro del propio registro, incluso si contradicen la intuición.
- Aceptación de preguntas nuevas no vistas durante el entrenamiento.
- Entrada de texto libre o JSON estructurado.
- Enrutado de tickets, moderación, análisis de sentimiento, intención y temática sobre textos en persa.
- Compatibilidad de API con Jev/SystemOne mediante `/v1/systemone` (mismo cuerpo de petición y respuesta).
- Sin capacidades de visión en v3: el autor remite a Mizan v2 4B para registros con imágenes.
- Sin modo "thinking", sin tool calling generativo y sin razonamiento multi-paso declarado: la función del modelo es decidir, no conversar.

## Casos de uso

- Enrutado de tickets de soporte con política propia: se incluye la política en el campo `state` (por ejemplo, "cortes e incidencias de red → red; facturación → facturación; si falta número de seguimiento, pedir datos primero") y se formula una pregunta `choice` con las claves de cada equipo. El modelo devuelve la cola asignada con su probabilidad, lo que permite derivar automáticamente los casos de baja confianza a revisión humana.
- Priorización y severidad con rúbrica de negocio: una pregunta `score` con niveles 0-3 definidos por el cliente ("3 = más de 200 personas afectadas o más de 50 millones de tomanes perdidos") devuelve la puntuación esperada, útil para ordenar la cola por impacto sin escribir reglas ad hoc.
- Moderación de reseñas y mensajes en persa: clasificación de toxicidad, spam o contenido inapropiado con umbral de confianza explícito, lo que permite fijar el punto de corte según la tolerancia del producto en lugar de depender de una etiqueta opaca.
- Análisis de voz del cliente a escala: sentimiento, intención y temática sobre reseñas, tuits y mensajes de soporte, agregando las probabilidades por categoría para construir métricas ponderadas en lugar de conteos duros.
- Verificación de datos declarados: preguntas `noul` del tipo "¿el cliente aportó un número de seguimiento?" o "¿el importe reclamado supera el límite de la póliza?" para validar formularios y detectar campos ausentes antes de escalar el caso.
- Extracción de señales para agents y RAG: uso como cabecera de decisión previa a un LLM generativo, de modo que el modelo grande solo se invoque cuando la política lo requiera, reduciendo coste y latencia del pipeline completo.
- Despliegue en edge o en servidor modesto: con el GGUF Q4_K_M de 1,9 GB y unos 55 ms por decisión en GPU de gama de entrada, encaja en tareas de clasificación en tiempo casi real dentro de un servicio HTTP propio.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Evaluacion | Mizan v3 3B | Clef-Flash 9B | Clef 27B | Notas |
|---|---|---|---|---|
| Registros reales en persa (3.000) | 82,5 % | 83,0 % | 83,4 % | Mejor calibración de todos los modelos probados, según el autor |
| Tasmim-Bench | 91,1 | Por debajo de Mizan v3 | Por debajo de Mizan v3 | El autor indica tambien el menor error de puntuacion del leaderboard |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card menciona "see the note below" a propósito del menor error de puntuación en Tasmim-Bench, pero esa nota no está incluida en el extracto proporcionado, por lo que no se puede verificar su alcance.

## Requisitos de hardware

- Inferencia mínima: GGUF Q4_K_M de 1,9 GB; cabe en cualquier GPU consumer con 4 GB o más de VRAM e incluso en CPU.
- Pesos en precisión completa (safetensors, ~3,2 mil millones de parámetros): aproximadamente 6,4 GB en fp16/bf16, más overhead de activaciones y del contexto configurado.
- GPU recomendadas: para el GGUF Q4, cualquier GPU de gama de entrada sirve según el autor; para los pesos safetensors, una RTX 4090 (24 GB) o una A100/H100 permiten holgura con lotes grandes. No se documentan requisitos específicos por modelo de GPU más allá de la referencia genérica a "entry-level GPU".
- Despliegue: llama.cpp build b11443 o superior con `llama-server`. Comando de referencia: `llama-server -m mizan-v3-3b-Q4_K_M.gguf -c 8192 -b 8192 -ub 8192 -ngl 99 --port 8080` para GPU y `-ngl 0` para CPU. El repositorio de transformers permite cargar los safetensors, pero no se documentan recetas para vLLM o TGI.
- Latencia: unos 55 ms por petición en GPU de gama de entrada con el Q4_K_M, aproximadamente 1,5 veces más rápido que Mizan 1.0 según el autor. No se publica throughput agregado ni latencia en CPU.
- El repositorio completo ocupa 25,3 GB, lo que incluye safetensors y artefactos adicionales; para despliegue conviene descargar solo el GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mizan v3 3B | 3,2 mil millones | Texto y JSON | No disponible (ejemplos con 8192) | 82,5 % en 3.000 registros persas; 91,1 en Tasmim-Bench | Apache-2.0 | Safetensors + GGUF Q4_K_M (1,9 GB) |
| Mizan v2 4B | No disponible | Texto e imagenes | No disponible | No disponible en la informacion proporcionada | No disponible | Safetensors + GGUF (2,7 GB + 0,37 GB) |
| Clef 27B | 27 mil millones | No disponible | No disponible | 83,4 % en el mismo conjunto de 3.000 registros | No disponible | No disponible en la informacion proporcionada |
| Clef-Flash 9B | 9 mil millones | No disponible | No disponible | 83,0 % en el mismo conjunto de 3.000 registros | No disponible | No disponible en la informacion proporcionada |
| Qwen/Qwen3.5-4B (base) | ~4 mil millones | Texto (y vision segun tags de la familia) | No disponible | No comparable: modelo generativo, no de decision | No disponible | HuggingFace |

La comparación relevante es de coste por decisión: Mizan v3 obtiene una precisión a 2,5 puntos del Clef 27B con una octava parte de parámetros y un GGUF de 1,9 GB frente a los pesos de un modelo de 27 mil millones.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgo demográfico, político o religioso; al estar especializado en persa, puede heredar sesgos del corpus persa del modelo base y de los datos de ajuste.
- Alucinación: al no generar texto libre, el riesgo clásico de inventar contenido es bajo, pero sí existe riesgo de calibración incorrecta, es decir, asignar alta confianza a la opción equivocada cuando el registro es ambiguo o está fuera de dominio.
- Idioma: solo se declaran persa e inglés. El rendimiento en castellano no está evaluado ni respaldado por la model card.
- Contexto: la longitud máxima no está declarada; los ejemplos usan 8192 tokens. Registros con políticas largas más historial extenso pueden superar la ventana y truncarse silenciosamente.
- Sin visión: pese a que los tags del repositorio incluyen `image-text-to-text`, el autor afirma explícitamente que v3 no procesa imágenes. Para entradas con fotos hay que usar Mizan v2 4B.
- API no estándar: el endpoint es `/v1/systemone`, no la API de chat de OpenAI. Requiere adaptar el cliente y el esquema de preguntas tipadas.
- Verificación de benchmarks: los resultados provienen exclusivamente del autor, sin réplica independiente. La nota sobre el menor error de puntuación en Tasmim-Bench no está incluida en la información disponible.
- Producción: conviene fijar umbrales de confianza y un mecanismo de abstención o revisión humana, ya que las probabilidades están calibradas sobre dominios persas y pueden desviarse en otros contextos.
- Licencia: Apache-2.0 permite uso comercial, pero el autor solo garantiza que los datos de entrenamiento son de uso comercial permitido; no se ofrece indemnización ni auditoría de procedencia.
- Madurez: 106 descargas y 18 "me gusta" en el momento de la consulta, con creación en octubre de 2026; es un modelo reciente con poca validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nimruz/Mizan-v3-3B
- Version GGUF: https://huggingface.co/Nimruz/Mizan-v3-3B-GGUF
- Coleccion Mizan: https://huggingface.co/collections/Nimruz/mizan-persian-decision-models-6ace723fcd8ec7e9e06d063b
- Modelo predecesor con vision (Mizan v2 4B): https://huggingface.co/Nimruz/Mizan-v2-4B
- Pesos GGUF de Mizan v2 4B: https://huggingface.co/Nimruz/Mizan-v2-4B-GGUF
- Dataset Tasmim-Bench: https://huggingface.co/datasets/mshojaei77/tasmim-bench
- Demo en vivo: https://huggingface.co/spaces/xmanii/Mizan-demo
- Sitio del autor: https://nimruz.site
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases

Nota del editor: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces verificables son los que aparecen en la model card.
