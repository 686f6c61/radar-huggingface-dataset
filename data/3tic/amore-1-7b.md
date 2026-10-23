# 3tic/Amore-1.7B

## Resumen

Amore-1.7B es un modelo de lenguaje publicado por el usuario 3tic en HuggingFace bajo el identificador `3tic/Amore-1.7B`. Se trata de un modelo denso de 1.720.574.976 parámetros (aproximadamente 1,7B) cuyos pesos están en formato safetensors, con un repositorio de 3,5 GB, lo que es coherente con un checkpoint almacenado en bf16/fp16 (1,72B × 2 bytes ≈ 3,44 GB). La etiqueta `qwen3` del repositorio indica que la arquitectura subyacente deriva de la familia Qwen3, y el sufijo del nombre sugiere un ajuste fino sobre esa base, aunque el autor no lo documenta.

La model card publicada no contiene más que la declaración de licencia (`apache-2.0`); no hay descripción del proceso de entrenamiento, del conjunto de datos utilizado, de los idiomas soportados ni de evaluaciones. El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, y las fechas de creación y actualización son del 22 de octubre de 2026, con apenas ocho minutos entre ambas, lo que apunta a una publicación recién creada y sin material adicional.

Su relevancia práctica es limitada por ahora: se trata de un modelo pequeño, con licencia Apache-2.0 (por tanto, apto para uso comercial) y arquitectura conocida, lo que facilita su despliegue en hardware de consumo, pero la ausencia total de documentación y de evaluaciones hace indispensable una validación propia antes de considerarlo en producción. El ecosistema del autor (3tic) incluye otros modelos derivados de Qwen3-1.7B, como Orion-Qwen3-1.7B-CPT-v2603 y Orion-Qwen3-1.7B-SFT-v2605, que sí aparecen documentados con ventanas de contexto de 32K-33K.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, derivado de Qwen3 (según etiqueta `qwen3` del repositorio); detalles concretos no disponibles |
| Parametros totales | 1.720.574.976 (≈1,72B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible para este modelo; modelos hermanos de 3tic basados en Qwen3-1.7B declaran 32K-33K tokens |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors en bf16/fp16); cuantizable a GGUF/AWQ/GPTQ mediante herramientas estándar, sin artefactos publicados por el autor |
| Idiomas soportados | No disponible en la model card; la base Qwen3 es multilingüe, pero no hay confirmación para este ajuste |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`pytorch`); repositorio de 3,5 GB |

## Arquitectura y entrenamiento

La única información estructural disponible es la etiqueta `qwen3` y el recuento exacto de parámetros (1.720.574.976), que coincide con la clase de tamaño Qwen3-1.7B. Se trata por tanto de un transformer denso con atención completa, sin mezcla de expertos: los 1,72B de parámetros son todos activos en cada paso de inferencia. No hay información sobre número de capas, dimensión oculta, número de cabezas de atención ni sobre el tokenizador empleado más allá de lo que se hereda de la base Qwen3.

El autor no documenta el proceso de entrenamiento: se desconoce si Amore-1.7B es un ajuste supervisado (SFT), un entrenamiento continuado (CPT), una destilación o un ajuste con preferencias (DPO/RLHF). Tampoco se indica el volumen de tokens, la composición del dataset, la existencia de datos sintéticos ni si se aplicaron técnicas de alineación. Dado el patrón de nombres del autor (Orion-Qwen3-1.7B-CPT-v2603, Orion-Qwen3-1.7B-SFT-v2605), es plausible que Amore sea otro ajuste de la misma base, pero esto es una inferencia por convención de nombres y no un dato confirmado.

## Capacidades

- Generación de texto autoregresiva en un modelo denso de 1,72B parámetros; capacidades concretas no evaluadas por el autor.
- Razonamiento y matemáticas: se espera un rendimiento propio de la clase 1,7B, muy por debajo de modelos de mayor tamaño; sin datos de benchmark publicados.
- Generación de código: no documentada para este ajuste; la base Qwen3 tiene competencia razonable en código, pero no se ha verificado en este checkpoint.
- Tool calling / function calling: no documentado. La familia Qwen3 soporta plantillas de herramientas, pero se desconoce si este ajuste las preserva.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado; la model card no declara idiomas y la etiqueta de idioma no aparece en los tags del repositorio.
- Modo «thinking» o razonamiento extendido: no documentado para este modelo.
- Visión o audio: no soportado (el repositorio solo contiene pesos de lenguaje, sin torre multimodal).

## Casos de uso

- Clasificación y etiquetado de texto a escala: un modelo de 1,72B en bf16 ocupa unos 3,5 GB, por lo que puede ejecutarse en una sola GPU de gama media y procesar grandes volúmenes de documentos con coste por token muy bajo; requiere validación previa contra un conjunto etiquetado propio.
- Extracción de entidades y estructuras (NER, parsing de facturas, resúmenes de campos): adecuado por tamaño y velocidad, siempre que se verifique la calidad de la salida JSON con evaluaciones propias, dado que no hay benchmarks publicados.
- Prototipado rápido y experimentación académica: al ser Apache-2.0 y pesar 3,5 GB, se puede ajustar (LoRA/QLoRA) en una única GPU de consumo, lo que lo hace útil como banco de pruebas de pipelines de entrenamiento.
- Asistente conversacional ligero en local o en el borde: su huella de memoria permite desplegarlo en estaciones de trabajo sin GPU dedicada de gran tamaño o en servidores con GPUs de inference (L4, T4), con la ventaja de no enviar datos a terceros.
- Generación de texto asistida en herramientas de escritura: borradores, reescritura y resumen de documentos cortos, con la cautela de que no hay evaluación de calidad literaria ni de fidelidad.
- Componente de un sistema mayor (router, reescritor de consultas, generador de borradores): útil como modelo auxiliar barato delante de un modelo grande, donde el coste por llamada importa más que la calidad punta.
- Filtrado y moderación de contenido: clasificación binaria o multietiqueta con latencia baja, a condición de auditar sesgos y falsos positivos en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `3tic/Amore-1.7B` no incluye ninguna evaluación (MMLU, HumanEval, GSM8K, IFEval ni similares), y el repositorio no enlaza a informes técnicos, tablas comparativas ni demos evaluables. Tampoco se han encontrado resultados en las búsquedas web realizadas, que solo devuelven modelos hermanos del mismo autor sin tablas de rendimiento asociadas a Amore-1.7B.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del recuento de parámetros, no medida empíricamente): bf16/fp16 ≈ 3,5 GB de pesos, más caché KV y overhead, del orden de 4-6 GB en total según longitud de contexto y tamaño de lote.
- Cuantización int8: ≈ 1,8 GB de pesos, en torno a 2,5-3 GB en ejecución.
- Cuantización de 4 bits (Q4_K_M, AWQ o GPTQ): ≈ 1,0-1,2 GB de pesos, en torno a 1,5-2 GB en ejecución. Estos artefactos no están publicados por el autor y habría que generarlos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060/4060 Ti 8-16 GB, RTX 4070/4080/4090, L4 24 GB, T4 16 GB. Cabe holgadamente en cualquier GPU de consumo con 8 GB o más en bf16, y en GPUs de 4-6 GB con cuantización.
- GPU de datacenter (A100, H100): no son necesarias para inferencia; solo tendrían sentido para ajuste fino o para servir lotes muy grandes.
- Opciones de despliegue: `transformers` (referencia), vLLM y SGLang (servido con PagedAttention y batching continuo), TGI, llama.cpp/Ollama (requiere convertir los safetensors a GGUF, paso no publicado por el autor), y frameworks de ajuste como PEFT/TRL para LoRA.
- Latencia y throughput: no disponibles, no medidos por el autor. A modo orientativo y sin carácter de medición, un denso de 1,72B en bf16 sobre una GPU de consumo suele decodificar del orden de decenas a un par de centenares de tokens por segundo por secuencia, con mejora considerable al usar batching continuo; estas cifras deben verificarse en el hardware objetivo.

## Comparativa con modelos similares

No hay datos de rendimiento de Amore-1.7B que permitan una comparación cuantitativa. La tabla siguiente contrasta únicamente parámetros, contexto, licencia y disponibilidad, tomando los datos públicos de cada alternativa; los valores de contexto de los competidores provienen de su documentación oficial y no se han verificado contra benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Amore-1.7B (3tic) | 1,72B | No disponible (hermanos de 3tic: 32K) | Apache-2.0 | HuggingFace, safetensors, sin cuantizaciones |
| Qwen3-1.7B (Alibaba) | 1,7B | 32K nativo (extensible) | Apache-2.0 | HuggingFace, safetensors y GGUF, amplio soporte en vLLM/llama.cpp |
| Llama 3.2 1B (Meta) | 1,24B | 128K | Licencia comunitaria Llama 3.2 (con restricciones) | HuggingFace, ecosistema amplio, GGUF oficiales |
| Gemma 3 1B (Google) | ≈1B | 32K | Términos de uso de Gemma (no OSI) | HuggingFace, requiere aceptar la licencia |

Frente a Qwen3-1.7B, del que deriva, Amore-1.7B no aporta por ahora ninguna ventaja documentada: no hay evaluaciones, ni cuantizaciones publicadas, ni model card que describa el ajuste. Su único diferencial objetivo es el nombre y la licencia Apache-2.0, que comparte con la base.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo contiene la licencia. No hay información sobre datos de entrenamiento, idiomas, formato de prompt, tokens especiales ni plantilla de chat, lo que complica el uso correcto del modelo.
- Sin evaluaciones publicadas: no existe ninguna evidencia de calidad, y tampoco de que el ajuste no haya degradado capacidades de la base (olvido catastrófico).
- Riesgo de alucinación: inherente a un modelo de 1,72B parámetros; la probabilidad de afirmaciones falsas con apariencia de veracidad es alta en dominios especializados.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no se puede evaluar qué sesgos de género, raza, idioma o ideología se han introducido o amplificado respecto a la base Qwen3.
- Idiomas: no declarados. Aunque la base Qwen3 es multilingüe, el ajuste podría haber reducido el soporte efectivo a uno o dos idiomas; debe comprobarse empíricamente antes de asumir castellano.
- Formato de prompt no especificado: usar la plantilla de chat de Qwen3 es una suposición razonable, pero si el ajuste empleó otra plantilla, el rendimiento puede degradarse de forma notable.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no impone restricciones de uso adicionales. Aun así, la responsabilidad legal y ética del despliegue recae en el integrador.
- Madurez del repositorio: 0 descargas y 0 «likes», publicado y actualizado en la misma franja de ocho minutos. No hay señales de mantenimiento, issues resueltos ni comunidad, por lo que no debe tratarse como un artefacto estable.
- Trazabilidad de la base: al no indicarse explícitamente el checkpoint Qwen3 de partida ni la versión, la reproducibilidad de cualquier ajuste posterior es limitada.
- Recomendación para producción: no desplegar sin una batería propia de evaluaciones (fidelidad, formato, idioma, seguridad) y sin fijar la revisión concreta del repositorio mediante hash de commit.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3tic/Amore-1.7B
- Perfil del autor en HuggingFace: https://huggingface.co/3tic
- Listado de modelos del autor: https://huggingface.co/3tic/models
- Directorio de modelos de 3tic (Essa Mamdani): https://essamamdani.com/ai-models/company/3tic
- Orion Qwen3 1.7B CPT V2603 en Antbase: https://antbase.ai/models/orion-qwen3-1-7b-cpt-v2603
- Orion Qwen3 1.7B CPT V2603 en LLM Explorer: https://llm-explorer.com/model/3tic%2FOrion-Qwen3-1.7B-CPT-v2603,3NnPSiTaVsY5gLr6fVegUr
