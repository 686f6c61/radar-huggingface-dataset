# alibiserikbay/JevK5

## Resumen

JevK5 v0.3 es un modelo de decisión tipada (typed decisions) publicado por el usuario alibiserikbay en Hugging Face bajo licencia Apache-2.0. Se presenta como una alternativa independiente y de pesos abiertos a Jev de TypeSafe: en lugar de generar texto, lee un estado junto con una pregunta de tipo sí/no, elección múltiple o puntuación, y devuelve una probabilidad para cada opción en un único forward pass, sin generar ningún token. No está afiliado a TypeSafe AI.

El modelo parte de Qwen3.5-4B (4.205.751.296 parámetros en safetensors) y le aplica un LoRA de rango 16 sobre las proyecciones de atención, ya fusionado en los pesos. La lectura de probabilidades sigue el protocolo SemIf (TheoLeeCJ/SemIf, MIT): un softmax sobre los logits del siguiente token correspondiente a las letras de respuesta, dividido por una temperatura de calibración de 1,22; las preguntas con más de 16 opciones se leen en varias pasadas combinadas con una segunda temperatura de 0,93.

Su relevancia actual radica en que ofrece una vía autoalojada (self-hosted) para tomar decisiones calibradas con latencias muy bajas —unos 13 ms por decisión en una H100 mediante grafos CUDA por longitud de entrada— y en que su versión 0.3 multiplica por cinco los datos de destilación (17.408 preguntas de dos profesores) y amplía la replicación con 30.052 ítems humanos de los splits de entrenamiento de 26 datasets públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con LoRA de rango 16 fusionado en las proyecciones de atención |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0, Q5_K_M y Q4_K_M (repositorio JevK5-GGUF); bf16 en los pesos principales |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-4B, un transformer denso de unos 4.200 millones de parámetros, sobre el que se ha entrenado un LoRA de rango 16 aplicado a las proyecciones de atención y posteriormente fusionado en los pesos. El modelo no genera texto: el mecanismo de lectura es el protocolo SemIf, que aplica un softmax sobre los logits del siguiente token de las letras de respuesta y lo divide por una temperatura de calibración. La configuración (`jevk5_config.json`) fija `temperature` en 1,22 y `knockout_temperature` en 0,93; esta última se emplea para preguntas con más de 16 opciones, que se leen en varias pasadas y se combinan.

El entrenamiento de la versión 0.3 combina 17.408 preguntas destiladas de dos profesores (3.270 procedentes de Qwen3.6-27B, heredadas de v0.2, y 14.138 nuevas de GPT-6 Luna) con 30.052 ítems etiquetados por humanos provenientes de los splits de entrenamiento de 26 datasets públicos. Se realizó una época sobre 47.460 filas, con el mismo LoRA y la misma tasa de aprendizaje que v0.2 (que usó dos épocas sobre 6.544 filas). No se emplearon splits de test ni de validación de ningún dataset, ni tampoco MMLU, MMLU-Pro o BBH, a diferencia de v0.2, que incluía algunos ítems de test de MMLU-Pro. La innovación destacable es el runtime propio (jevk5 0.3.0 o posterior), que construye un grafo CUDA por cada longitud de entrada con padding y sirve un endpoint estilo TypeSafe `/v1/systemone`.

## Capacidades

- Decisión tipada en un único forward pass: devuelve una probabilidad por cada opción sin generar tokens.
- Preguntas de sí/no (`noul`), de elección entre opciones y de puntuación (score).
- Manejo de preguntas con más de 16 opciones mediante lectura en varias pasadas y combinación con una segunda temperatura.
- Calibración de probabilidades: ECE de 0,035 en las preguntas de profesor del conjunto de desarrollo.
- No soporta generación de texto libre: la model card advierte que los ejemplos genéricos de `generate()` del Hub no realizan la lectura de decisión de JevK5.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio, modo thinking ni multilingüismo más allá del inglés.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo puede asignar probabilidad a cada categoría de una consulta entrante en una sola pasada, con la calibración necesaria para enrutar a un humano cuando la confianza sea baja.
- Enrutamiento y triaje en pipelines de soporte: con ~13 ms por decisión en H100, permite evaluar cada ticket contra múltiples etiquetas de prioridad o departamento sin coste de generación.
- Verificación de respuestas en sistemas RAG: la mejora del índice proxy en RAGTruth (0,15 a 0,50) indica utilidad para decidir si una respuesta está respaldada por el documento recuperado.
- Control de calidad en fabricación: el conjunto de desarrollo incluye preguntas de QC industrial, por lo que el modelo puede puntuar si un lote cumple criterios definidos.
- Evaluación de admisibilidad en permisos del sector público: el dev set incluye permisos de sector público, lo que respalda su uso para decidir si una solicitud cumple los requisitos declarados.
- Análisis de contratos de arrendamiento residencial: otro de los dominios del dev set, adecuado para responder preguntas de sí/no o de elección sobre cláusulas concretas.
- Detección de sarcasmo y matices en texto conversacional: el índice proxy en iSarcasmEval sube de 0,30 a 0,55, lo que lo hace apto para clasificar tono en moderación o análisis de opinión.
- Decisión sobre llamadas a herramientas: la mejora en When2Call (0,75 a 0,95) permite usarlo como clasificador que decide si procede invocar una función antes de un pipeline de agentes.

## Benchmarks y rendimiento

Comprobaciones en conjunto de desarrollo retenido (leídas a través del runtime):

| Metrica | v0.2 | v0.3 |
|---|---:|---:|
| Índice proxy (16 fuentes) | 0,620 | 0,731 |
| Preguntas de profesor retenidas (362), accuracy | 0,801 | 0,834 |
| Conjunto difícil escrito a mano (64), accuracy | 0,766 | 0,766 |
| ECE en preguntas de profesor, calibrado | 0,034 | 0,035 |

JevBench v1.2, ítems públicos (231 en total, adaptador `jevk5_direct`, 231/231 válidos):

| Split | n | Qwen3.5-4B sin entrenar | JevK5 v0.2 | JevK5 v0.3 | ECE v0.3 (v0.2) |
|---|---:|---:|---:|---:|---:|
| easy | 48 | 1,000 | 1,000 | 1,000 | 0,018 (0,038) |
| original (standard) | 72 | 0,986 | 0,958 | 0,944 | 0,057 (0,141) |
| hard (mitad pública) | 111 | 0,613 | 0,739 | 0,784 | 0,054 (0,066) |

bev-decision-150K (2.500 filas del split de test, solo evaluación): accuracy 0,663 en v0.3 frente a 0,665 en v0.2; ECE 0,036 en ambas. Por tipo: elección 0,697, sí/no 0,758, puntuación 0,409.

En el tier difícil de JevBench, v0.3 corrige 10 ítems y rompe 5 respecto a v0.2 (McNemar p = 0,30, no significativo sobre 111 ítems). En el índice proxy, las mayores ganancias son GSM8K (0,29 a 0,61), RAGTruth (0,15 a 0,50), SGD (0,68 a 0,93), When2Call (0,75 a 0,95) e iSarcasmEval (0,30 a 0,55); BANKING77 baja de 0,91 a 0,88, Amazon ESCI de 0,50 a 0,47 y HoVer no cambia (0,30). Cada fuente del índice tiene 40 filas, con un ruido aproximado de ±0,15.

## Requisitos de hardware

- VRAM estimada: unos 8,5 GB en bf16 para los 4.200 millones de parámetros; el repositorio ocupa 25,3 GB en total.
- GPU recomendadas: H100 para el rendimiento de referencia (~13 ms por decisión con grafos CUDA); A100 como alternativa de centro de datos.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12 GB para bf16; las versiones GGUF Q8_0, Q5_K_M y Q4_K_M reducen aún más el requisito.
- Despliegue: runtime JevK5 0.3.0 o posterior (endpoint `/v1/systemone`); llama.cpp para los GGUF en NVIDIA, AMD, Intel, Apple o CPU; los pesos principales son compatibles con transformers, pero la lectura de decisión requiere el runtime.
- Latencia: ~13 ms por decisión en H100. Throughput no disponible.
- Precisión de las cuantizaciones GGUF: misma respuesta que los pesos principales en 229 de 231 ítems públicos de JevBench con Q8_0, 224 con Q5_K_M y 221 con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevK5 v0.3 | 4,2 B | no disponible | Decisión tipada, sin generación | Apache-2.0 | Pesos abiertos en HF |
| JevK5-9B | ~9 B (base Qwen3.5-9B) | no disponible | Misma receta v0.3 sobre base mayor | Apache-2.0 | Pesos abiertos en HF; ~19 GB en bf16, 2-3x más lento |
| JevK5-2B | ~2 B (base Qwen3.5-2B) | no disponible | Receta v0.2, no reentrenado para v0.3 | Apache-2.0 | Pesos abiertos en HF |
| Jev (TypeSafe) | no disponible | no disponible | Decisión tipada propietaria | no disponible | Servicio propietario |

Según la model card, JevK5-9B supera a este modelo en las comprobaciones retenidas (índice proxy 0,762; preguntas de profesor 0,851) y en preguntas con más de 16 opciones, pero queda por detrás en los ítems públicos de JevBench (tier difícil 0,730).

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; no se documenta soporte multilingüe.
- No es un modelo generativo: usar `generate()` produce resultados que no corresponden a la lectura de decisión; es obligatorio el runtime JevK5.
- Riesgo de alucinación y descalibración fuera de dominio: el ECE de 0,035 se mide en preguntas de profesor del dev set; en bev-decision-150K la precisión en preguntas de puntuación cae a 0,409.
- El índice proxy es una estimación propia con 40 filas por fuente y ruido de ±0,15, no una puntuación oficial de Jev Decision Index.
- Diferencias no significativas en el tier difícil de JevBench (McNemar p = 0,30) y retrocesos en BANKING77 y Amazon ESCI respecto a v0.2.
- El conjunto de entrenamiento usa datos destilados de GPT-6 Luna y Qwen3.6-27B; conviene revisar las condiciones de uso de esos profesores para despliegues comerciales.
- Licencia Apache-2.0 permite uso comercial, pero la model card no ofrece garantías de calibración en dominios distintos de los evaluados.
- La versión v0.2 sigue disponible bajo la etiqueta `v0.2` del Hub; las preguntas con más de 16 opciones con el runtime 0.2.2 recaen en el valor 0,77 de v0.2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alibiserikbay/JevK5
- Runtime JevK5: https://github.com/allebee/jevk5
- JevK5-9B: https://huggingface.co/alibiserikbay/JevK5-9B
- JevK5-GGUF: https://huggingface.co/alibiserikbay/JevK5-GGUF
- JevK5-2B: https://huggingface.co/alibiserikbay/JevK5-2B
- Protocolo SemIf: https://huggingface.co/TheoLeeCJ/SemIf
- Dataset bev-decision-150K: https://huggingface.co/datasets/avbiswas/bev-decision-150K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
