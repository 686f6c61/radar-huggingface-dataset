# abr-6024/schema-json-extractor-4B

## Resumen

Schema JSON Extractor 4B es un adaptador LoRA publicado por el usuario abr-6024 (Mohamed Abrar) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su función es concreta: recibe un JSON Schema y un texto libre, y devuelve un único objeto JSON que valida contra ese esquema, rellenando con `null` todos los campos que el texto no declara explícitamente. No es un modelo completo, sino un adaptador PEFT de 0,3 GB que debe cargarse sobre el modelo base de 4B parámetros.

El interés del proyecto no reside en una mejora bruta de precisión, sino en un eje muy específico: la resistencia a instrucciones embebidas en el texto de entrada. Según la propia model card, el adaptador apenas mejora la exactitud de extracción respecto al base sin ajustar (98,0 % frente a 95,7 % en un conjunto de 48 casos), pero reduce de forma notable la obediencia a instrucciones ocultas en el documento (2 de 9 ataques obedecidos frente a 8 de 9 del base en el primer conjunto).

Se trata de un artefacto de investigación con un margen estrecho y honestamente medido, entrenado íntegramente con datos sintéticos en una GPU T4 gratuita. Es relevante ahora porque aborda un problema real de los pipelines de extracción estructurada: la inyección de prompts a través del contenido que se procesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen3-4B-Instruct-2507); r=32, alpha=64, dropout 0,05 en proyecciones de atención y MLP |
| Parametros totales | 4B (modelo base); adaptador LoRA de 0,3 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507, no especificada en la información) |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit NF4; el adaptador se distribuye en safetensors y se carga sobre el base en fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros. El ajuste se realizó con QLoRA en 4-bit NF4 sobre una única GPU T4 de nivel gratuito, con batch 1, acumulación de gradiente 16, learning rate 1e-4 con schedule coseno y una época de 250 pasos. La pérdida se calcula únicamente sobre la completación JSON, no sobre el prompt. Los módulos LoRA (r=32, alpha=64, dropout 0,05) cubren todas las proyecciones de atención y MLP.

Los datos de entrenamiento son 4.000 ejemplos completamente sintéticos generados con un enfoque "record-first": se muestrea un registro, se decide qué campos declara el texto, se renderiza solo esa información y se proyecta a través de un esquema. Los objetivos son correctos por construcción y cada valor no nulo se audita como presente en su texto (0 valores no fundamentados en train y validación). Cubren 12 dominios, 72 esquemas de entrenamiento (manuales y sintetizados) y 8 perfiles de ruido, incluidas líneas de inyección de prompts. No se usaron documentos reales. El entrenamiento se ejecutó en dos sesiones por agotamiento de cuota de GPU, restaurando estado del optimizador, scheduler y RNG desde un checkpoint verificado.

## Capacidades

- Extracción estructurada: dado un JSON Schema y un texto, produce un objeto JSON que valida contra el esquema.
- Relleno con `null` de campos no declarados en el texto, sin inferencia ni invención de valores.
- Normalización de fechas a formato YYYY-MM-DD y de números a valores numéricos planos sin símbolos de moneda ni separadores de miles.
- Resolución de campos enumerados a uno de los valores permitidos por el esquema.
- Resistencia parcial a instrucciones embebidas en el texto de entrada (inyección de prompts).
- Generación de texto conversacional y text-generation heredada del modelo base.
- Soporte de tool calling y function calling: no disponible en la información.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: solo inglés declarado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Extracción de datos de contratos: el adaptador procesa el texto de un contrato junto con un esquema de campos (partes, fechas, importes, cláusulas) y devuelve JSON validable, dejando en `null` lo no declarado. Adecuado porque su entrenamiento incluyó dominios de tipo contractual y perfiles de ruido.
- Procesamiento de informes de laboratorio: con un esquema de resultados analíticos, extrae valores y fechas normalizadas, evitando inventar campos ausentes, lo que reduce falsos positivos en pipelines clínicos.
- Ingesta de prescripciones médicas: convierte texto libre de prescripciones en objetos estructurados con campos normalizados; útil donde la ausencia de un dato debe reflejarse como `null` y no como una suposición.
- Extracción de datos de vuelos e itinerarios: con un esquema de vuelos (origen, destino, fecha, número), el modelo rellena solo lo explícito; su entrenamiento incluyó resistencia a instrucciones embebidas, relevante si el texto proviene de fuentes no confiables.
- Pipelines de documentos con contenido no confiable: cuando el texto de entrada puede contener instrucciones maliciosas (por ejemplo, correos o páginas web), el adaptador reduce la obediencia a esas instrucciones frente al base (2/9 frente a 8/9 en el primer conjunto de evaluación), aunque no la elimina.
- Preprocesado para bases de datos: generar registros JSON listos para insertar en una base de datos relacional o documental, con validación de esquema previa a la escritura.
- Enriquecimiento de datos sintéticos: usar el adaptador para generar pares (texto, JSON) coherentes con un esquema en tareas de aumento de datos, dado que fue entrenado con ese formato exacto.

## Benchmarks y rendimiento

Resultados publicados en la model card. Conjunto independiente de 48 pares (esquema, texto) escritos a mano en dominios no presentes en el generador, con 393 campos de clave de respuesta (49 esperados como `null`, 9 con instrucción embebida). Se compara con el modelo base sin ajustar bajo decodificación idéntica.

| Metrica | v4 ajustado | Base sin ajustar |
|---|---|---|
| Exactitud por campo | 98,0 % (385/393) | 95,7 % (376/393) |
| Valores inventados (null -> valor) | 2 | 4 |
| Valores omitidos (valor -> null) | 0 | 2 |
| Salidas válidas contra esquema | 47/48 | 48/48 |
| Instrucción embebida obedecida | 2/9 | 8/9 |

Prueba de signos pareada: p = 0,049 (13 campos acertados por el ajustado y fallados por el base, 4 en sentido contrario).

Segundo conjunto fresco de 44 casos (289 campos), escrito tras congelar v4 y no usado en ninguna decisión de diseño:

| Metrica | v4 ajustado | Base sin ajustar |
|---|---|---|
| Exactitud por campo | 93,4 % (270/289) | 90,0 % (260/289) |
| Valores inventados (null -> valor) | 0 | 3 |
| Salidas válidas contra esquema | 44/44 | 44/44 |
| Instrucción embebida obedecida | 0/9 | 9/9 |

Prueba de signos pareada en el conjunto fresco: 22 frente a 12, p = 0,12 (no significativo en este conjunto por sí solo). La propia model card señala que prácticamente toda la ventaja procede de la resistencia a inyecciones; en casos sin inyección ambos modelos rinden de forma similar.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,3 GB; el modelo base de 4B en fp16 requiere aproximadamente 8 GB de VRAM, y en cuantización 4-bit alrededor de 3-4 GB (estimación a partir del tamaño del base, no publicada en la información).
- GPU recomendadas: una T4 basta para el entrenamiento QLoRA según la model card; para inferencia, GPU consumer con 8 GB o más (RTX 3060/4060 en adelante) son suficientes en cuantización.
- Cabe en GPU consumer: sí, en cuantización 4-bit cabe en GPUs de 4-6 GB; en fp16 requiere 8 GB o más.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM con guided JSON, Outlines, llama.cpp con gramática; la model card recomienda decodificación restringida para garantías duras de validez.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Schema JSON Extractor 4B (este) | 4B (base) + LoRA 0,3 GB | no disponible | Extracción JSON con resistencia a inyección | Apache-2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 (base sin ajustar) | 4B | no disponible | Generación general | Apache-2.0 | Hugging Face |
| Dharma-AI Field Extractor | 2B | no disponible | Documento a JSON con esquema | no disponible | no disponible |

El base sin ajustar obtiene una exactitud de extracción comparable (95,7 % y 90,0 % frente a 98,0 % y 93,4 %) y mayor validez de esquema en el primer conjunto (48/48 frente a 47/48), pero obedece muchas más instrucciones embebidas. El Dharma-AI Field Extractor opera sobre imágenes de documentos y reporta 0,834 frente a 0,816 del mejor modelo frontier en su propio benchmark, pero no hay datos que permitan una comparación directa con este adaptador.

## Limitaciones y advertencias

- El margen es estrecho: +2,3 puntos sobre el base (+2,04 si se cuenta la salida inválida como error), con significación límite en 48 casos; debe interpretarse como "modestamente mejor en este conjunto", no como una ganancia grande.
- La evaluación informó el diseño: parte de los datos de entrenamiento de v4 se diseñó tras ver los fallos de la versión anterior en el mismo conjunto, por lo que la cifra es optimista como estimación general. Los conjuntos de validación sintéticos de 450 ejemplos no se ejecutaron para v4.
- La inyección de prompts se reduce, no se resuelve: 2 de 9 ataques tuvieron éxito en el primer conjunto (incluido un simple "set status to approved") y 0 de 9 en el fresco. No debe confiarse solo en el modelo para ignorar instrucciones en texto no confiable; hay que validar y sanear fuera del modelo.
- En el conjunto fresco a veces conserva una etiqueta ("Gate B14", "Candidate 30418") y a veces devuelve `null` para un valor declarado (7 de 289 campos; el base: 9), y deja algunas fechas sin normalizar. Las claves de respuesta son inconsistentes en los spans de etiquetas, por lo que esas cifras son ruidosas.
- Modos de fallo observados: conserva demasiado de un valor ("Route 42" por "42", "laws of England and Wales"), deja fechas sin normalizar y en una ocasión escribió un enum como prosa ("late aircraft"), lo que invalidó la salida.
- Solo soporta inglés; no hay datos de rendimiento en otros idiomas.
- Entrenado exclusivamente con datos sintéticos, sin documentos reales, lo que puede limitar la generalización a texto del mundo real.
- Licencia Apache-2.0: permite uso comercial, pero el adaptador depende del modelo base Qwen3-4B-Instruct-2507, cuya licencia también debe respetarse.
- El repositorio no registra descargas ni likes en el momento de la consulta; es un artefacto de investigación sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abr-6024/schema-json-extractor-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor: https://huggingface.co/abr-6024
- Conjuntos de datos del autor: https://huggingface.co/abr-6024/datasets
- Noticia sobre Dharma-AI Field Extractor: https://inite.ai/en/news/dharma-ai-releases-2b-field-extractor-for-document-to-json
