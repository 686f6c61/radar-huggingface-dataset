# baa-ai/Gemma-4-26B-A4B-it-RAM-13GB-MLX

## Resumen

Gemma-4-26B-A4B-it-RAM-13GB-MLX es una cuantización de precisión mixta del modelo google/gemma-4-26B-A4B-it, publicada por baa-ai (Black Sheep AI) mediante su método propietario de compresión. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 25.233.053.440 parámetros totales (aproximadamente 25,2 mil millones) y 4 mil millones de parámetros activos por token, según indica el sufijo A4B del nombre. Esta build concreta reduce los pesos a una media de 3,46 bits por parámetro, dando como resultado un repositorio de 12,9 GB en formato MLX, pensado para ejecutarse en Apple Silicon.

La relevancia de esta variante radica en que se posiciona como el punto de rodilla ("knee") del presupuesto de RAM: la compresión más agresiva que el autor considera aceptable antes de que la calidad caiga de forma notable. Según la model card, alcanza un 77,25 % en un conjunto de 400 preguntas de MMLU, frente al 80,80 % del modelo en BF16. Es una build exclusivamente de texto: el tower de visión no está incluido, por lo que no admite entrada de imágenes.

El modelo está pensado para despliegues locales en hardware con memoria limitada, especialmente Macs con Apple Silicon, y para escenarios de recuperación aumentada (RAG) sobre documentación técnica, donde el autor reporta resultados competitivos frente a lectores de mayor tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), según el modelo base google/gemma-4-26B-A4B-it |
| Parámetros totales | 25.233.053.440 (≈25,2 B) |
| Parámetros activos | 4 B (indicado por el sufijo A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta, media de 3,46 bits por peso (etiquetado como 4-bit) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors para MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-26B-A4B-it es un transformer con arquitectura mixture-of-experts: de los aproximadamente 25,2 mil millones de parámetros totales, solo unos 4 mil millones se activan por token, lo que reduce el coste computacional de la inferencia manteniendo una capacidad de representación propia de un modelo mucho mayor. El sufijo "it" indica que se trata de una variante ajustada para instrucciones y conversación. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF/DPO) empleadas en el modelo original.

Esta build concreta no reentrena el modelo: aplica una cuantización de precisión mixta desarrollada por baa.ai mediante su método propietario "Black Sheep AI", que asigna distintos niveles de bits a distintas partes de la red en lugar de usar una cuantización uniforme de 4 bits. El resultado son 3,46 bits por peso de media y un repositorio de 12,9 GB. La build es solo de texto: el tower de visión del modelo base ha sido eliminado, no cuantizado. El autor comercializa el proceso de compresión dentro de su arquitectura Bounded AI (capas Ram, Paddock, Watchman y Shepherd), orientada a despliegues privados en infraestructura controlada por el cliente.

## Capacidades

- Generación de texto y conversación multi-turno, al ser una variante "it" (instruction-tuned) del modelo base.
- Razonamiento y respuesta a preguntas, con un 77,25 % en el conjunto de 400 preguntas de MMLU reportado por el autor.
- Comprensión y extracción de información en documentación técnica extensa: 60,0 % en Q&A sobre manuales del Boeing 787 (150 preguntas) y 71,8 % de recuperación correcta en el top-3 sobre el manual de mantenimiento del Dash 8 Q300 (415 preguntas).
- Uso como lector dentro de pipelines de recuperación aumentada (RAG), según los experimentos del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión: no soportada en esta build (el tower de visión no está incluido).

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener conversaciones multi-turno ejecutándose íntegramente en un equipo Apple Silicon con unos 13 GB de memoria, sin enviar datos a servicios externos, gracias a su formato MLX y a su tamaño comprimido.
- Búsqueda y Q&A sobre documentación técnica interna: el autor lo evalúa como lector de un consola RAG sobre manuales aeronáuticos (Boeing 787, Dash 8 Q300), un escenario directamente trasladable a manuales de mantenimiento, normativa o documentación de producto en empresas con datos sensibles.
- Despliegue en entornos aislados (air-gapped): al caber en hardware de consumo y no requerir conectividad, encaja en instalaciones donde los datos no pueden salir de la infraestructura, uno de los casos que promociona el autor con su arquitectura Bounded AI.
- Prototipado y evaluación de modelos MoE en local: investigadores que quieran estudiar el comportamiento de un MoE de 25 B con 4 B activos sin acceso a GPUs de datacenter pueden usar esta build en un Mac para pruebas de prompting, evaluación cualitativa y análisis de errores.
- Generación de borradores y resúmenes de textos largos en estación de trabajo: para redacción asistida de informes o síntesis de documentos donde la latencia no es crítica y se prioriza mantener los datos en local.
- Sustitución de lectores de mayor tamaño en pipelines RAG con presupuesto de memoria ajustado: la model card indica que la recuperación igualó a lectores de clase 30B en su conjunto de prueba, lo que permite reducir requisitos de RAM sin degradar drásticamente la calidad de recuperación.

## Benchmarks y rendimiento

| Benchmark | Esta build (RAM 13GB) | RAM 14GB | BF16 | Uniform 4-bit |
|---|---|---|---|---|
| MMLU (400 preguntas) | 77,25 % (309/400) | 79,25 % (317/400) | 80,80 % | 77,88 % |
| Document Q&A, manuales Boeing 787 (150 preguntas) | 60,0 % | no disponible | no disponible | no disponible |
| Document retrieval, manual Dash 8 Q300 (415 preguntas, documento correcto en top-3) | 71,8 % | no disponible | no disponible | no disponible |

El autor señala que la cifra de MMLU de esta build se midió sobre un conjunto de 400 preguntas propio, mientras que las filas de BF16, 4-bit uniforme y las demás variantes RAM provienen de la evaluación original; por tanto, las comparaciones directas entre filas deben tomarse con cautela. Según la model card, esta build fue el lector más preciso por debajo de 13 GB en el conjunto del Boeing 787 y su recuperación igualó a la de lectores de clase 30B.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 13 GB para los pesos; conviene añadir margen para el contexto y el runtime de MLX, por lo que un equipo con 16 GB unificados es el mínimo práctico y 24 GB o más resulta recomendable.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips de Apple Silicon (series M1, M2, M3, M4 y superiores). No está pensado para GPUs NVIDIA o AMD.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: cabe en equipos con 16 GB de memoria unificada o más. No se dispone de información sobre su funcionamiento en GPUs de consumo convencionales, ya que el formato MLX no es el habitual en ellas.
- Opciones de despliegue: mlx_lm (carga y generación mediante `load` y `generate`), tal como muestra la model card. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-it-RAM-13GB-MLX (esta build) | 25,2 B totales / 4 B activos | no disponible | 77,25 % (400 preguntas) | gemma | MLX, 12,9 GB, solo texto |
| Gemma-4-26B-A4B-it RAM 14GB | 25,2 B totales / 4 B activos | no disponible | 79,25 % (400 preguntas) | gemma | MLX, ~14 GB, incluye visión |
| Gemma-4-26B-A4B-it RAM 20GB | 25,2 B totales / 4 B activos | no disponible | 80,70 % | gemma | MLX, ~20 GB |
| google/gemma-4-26B-A4B-it (BF16) | 25,2 B totales / 4 B activos | no disponible | 80,80 % | gemma | safetensors, 51,6 GB |

No se dispone de datos de otros modelos de la misma categoría (MoE de ~25 B con ~4 B activos) en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base publicadas por el autor.

## Limitaciones y advertencias

- La cuantización a 3,46 bits por peso introduce una pérdida de calidad medible: 77,25 % frente al 80,80 % del BF16 en el conjunto de MMLU del autor, es decir, unos 3,5 puntos porcentuales por debajo.
- Esta build es solo de texto: no acepta imágenes. Para entrada visual hay que usar la variante de 14 GB o superior.
- El modelo está empaquetado en formato MLX, lo que limita su uso a hardware Apple Silicon; no es directamente desplegable en GPUs NVIDIA ni en la mayoría de servidores convencionales.
- La licencia es la Gemma Terms of Use, no una licencia de código abierto permisiva: es necesario revisar sus restricciones (incluidas cláusulas de uso aceptable y obligaciones de atribución) antes de un uso comercial.
- Los resultados de MMLU y de los conjuntos de documentos provienen de evaluaciones del propio autor con conjuntos propietarios de 400 y 150/415 preguntas; no son comparables de forma directa con cifras publicadas por terceros sobre otros benchmarks.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni comportamiento en contextos largos; al derivar del modelo base, hereda los sesgos y limitaciones de este, que no se documentan en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2 de noviembre de 2026), por lo que no existe validación independiente de la comunidad.
- El método de cuantización es propietario y no se detalla en la model card, lo que dificulta auditar qué capas se han comprimido más y reproducir los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baa-ai/Gemma-4-26B-A4B-it-RAM-13GB-MLX
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante RAM 14GB (con visión): https://huggingface.co/baa-ai/Gemma-4-26B-A4B-it-RAM-14GB-MLX
- Sitio del autor: https://baa.ai
- Capa Ram (compresión): https://baa.ai/compression.html
- Capa Paddock (plano de conocimiento): https://baa.ai/paddock.html
- Capa Watchman (GRC): https://baa.ai/watchman.html
- Producto Shepherd: https://baa.ai/shepherd.html
