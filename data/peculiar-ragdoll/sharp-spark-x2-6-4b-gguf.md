# peculiar-ragdoll/Sharp-Spark-X2.6-4B-GGUF

## Resumen

Sharp-Spark-X2.6-4B-GGUF es una familia de cuantizaciones GGUF dinámicas del modelo denso XHToken/Spark-X2.6-4B, un transformer de 4.112 millones de parámetros (4B) especializado en contexto largo y código. Lo publica el usuario peculiar-ragdoll bajo licencia Apache 2.0 y está pensado para ejecutarse en GPUs de gama baja (6 GB de VRAM) y equipos con 16 GB de RAM o menos. Su propuesta diferencial no es el modelo base, sino la receta de cuantización: una importance matrix (imatrix) ponderada hacia código de sistemas y seguridad, una asignación heurística de bits por tensor y una plantilla de chat propia ("Sharp-Spark") orientada a eficiencia de tokens.

El interés actual del modelo radica en su relación entre coste computacional y rendimiento en tareas de agente de código. Según la model card, la variante Q6_K_XL (3,61 GB) iguala estadísticamente al Q8_0 original de XHToken en MMLU-Pro (71,7 % frente a 71,3 %) y en SWE-bench-Live (8,7 frente a 9,0 resueltos por semilla sobre 17 tareas), pero consume un 53 % menos de tokens por pregunta en la mediana de MMLU-Pro. Es decir, mantiene calidad con un archivo un 18 % más pequeño y una plantilla que reduce la verbosidad.

La arquitectura subyacente es de atención híbrida: de sus 36 capas, solo 9 son de atención completa (una de cada cuatro) y las otras 27 usan una ventana deslizante de 512 tokens. Esto limita el crecimiento de la caché KV y permite sostener contexto de seis cifras en un modelo de 4B, algo poco habitual en esta franja de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (9 capas de atención completa, 27 con ventana deslizante de 512 tokens), 36 capas |
| Parametros totales | 4.112.079.360 (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 256K documentado en coste de KV; validado a 131.072 tokens en las mediciones de velocidad |
| Tipos de cuantizacion | Q4_K_XL (2,68 GB), Q5_K_XL (3,25 GB), Q6_K_XL (3,61 GB); cuantización dinámica con imatrix |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B es un transformer denso de 36 capas con un esquema de atención híbrida: solo 9 capas mantienen atención completa y las 27 restantes aplican una ventana deslizante de 512 tokens. Esta disposición reduce drásticamente el coste de la caché KV en contexto largo, ya que únicamente las 9 capas completas escalan con la longitud de la secuencia. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información corresponde al modelo base y no se reproduce en esta ficha.

La innovación técnica de esta publicación está en el proceso de cuantización. Se emplea una importance matrix medida empíricamente sobre un corpus de calibración público y redistribuible, ponderado hacia código de seguridad y de sistemas, que determina qué pesos pueden perder precisión sin degradar la salida. Sobre esa matriz se aplica una asignación heurística de bits por tensor, en lugar de una cuantización uniforme. El resultado se empaqueta con la plantilla de chat Sharp-Spark, diseñada para reducir el número de tokens generados por respuesta ("token-efficient" y "efficient-thinking" en las etiquetas del repositorio). No se documentan técnicas de decodificación especulativa ni de atención lineal más allá del esquema híbrido descrito.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, con pipeline declarado `text-generation`.
- Generación y edición de código, con énfasis declarado en código de sistemas y seguridad (corpus de calibración orientado a ese dominio).
- Razonamiento multi-paso y uso como agente de código: la model card reporta ejecuciones con un agente contenedorizado sobre SWE-bench-Live.
- Contexto largo: soporta ventanas de hasta 131.072 tokens medidas en rendimiento y hasta 256K en coste de caché KV documentado.
- Eficiencia de tokens: la plantilla Sharp-Spark reduce el consumo de tokens por respuesta (53 % menos en la mediana de MMLU-Pro frente al Q8_0 original).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura compatible con la API de HuggingFace.
- No se documentan capacidades de visión, audio, tool calling explícito ni modo "thinking" separado; la información disponible no las confirma.

## Casos de uso

- Agente de resolución de issues en repositorios: el modelo se ha evaluado sobre SWE-bench-Live con un agente contenedorizado, resolviendo una media de 8,7 de 17 tareas por semilla con Q6_K_XL. Es adecuado para pipelines de reparación automática de bugs donde el agente necesita leer código, razonar y aplicar parches en varios pasos.
- Asistencia de código en equipos con GPU de 6 GB: con Q6_K_XL (3,61 GB) cabe en tarjetas de 6 GB de VRAM y deja espacio para unos 48K tokens de contexto en caché `f16` o unos 96K en `q8_0`, lo que permite mantener un repositorio mediano en contexto durante una sesión de desarrollo.
- Análisis de código de seguridad: la imatrix está ponderada hacia código de sistemas y seguridad, por lo que el modelo es apropiado para revisión de parches, detección de patrones inseguros y explicación de vulnerabilidades en bases de código C, C++ o Rust.
- Procesamiento de documentos largos en local: con Q4_K_XL (2,68 GB) se superan los 128K tokens de contexto en una GPU de 6 GB, lo que sirve para resumir o consultar expedientes, logs extensos o documentación técnica sin enviar datos a la nube.
- Despliegue en portátiles y estaciones sin GPU dedicada: al ser GGUF para llama.cpp, puede ejecutarse con offload parcial o total a CPU en equipos con 16 GB de RAM o menos, cubriendo tareas de autocompletado y chat técnico offline.
- Generación de tests y refactorizaciones guiadas: la plantilla eficiente en tokens reduce el coste por interacción, lo que abarata bucles de agente con muchas llamadas cortas (generar test, ejecutar, corregir) en comparación con cuantizaciones más verbosas.
- Chat técnico multi-turno con contexto persistente: la combinación de ventana deslizante en 27 capas y caché KV de 19 KB/token en `q8_0` permite sostener conversaciones largas sin agotar la VRAM de una GPU consumer.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. MMLU-Pro se midió sobre un subconjunto de 100 preguntas con 3 semillas; SWE-bench-Live sobre un corte de 17 tareas con 3 semillas y red sellada en el contenedor del agente.

| Benchmark | Sharp-Spark 2.6 Q6_K_XL | Sharp-Spark 2.5 Q6_K_XL | Spark-X2.6-4B Q8_0 (original) |
|---|---|---|---|
| MMLU-Pro (100 preguntas, 3 semillas) | 71,7 % | 69,0 % | 71,3 % |
| Tokens por pregunta MMLU-Pro (media) | 5.498 | 9.007 | No disponible (53 % menos en mediana frente a Q8_0) |
| SWE-bench-Live (resueltos de 17 por semilla) | 8,7 | 3,7 | 9,0 |
| Minutos por intento SWE (mediana / media) | 15 / 29 | 18 / 25 | 15 / 25 |
| Minutos totales por tarea resuelta | 57 | No disponible | 46 |

Rendimiento en contexto largo (medido sobre SharpSpark 2.5 Q6_K_XL, misma arquitectura y tamaño de archivo):

| Contexto | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| Corto (512) | 1.684 | 111 |
| 131.072 | 557 | 42 |

Coste de caché KV: aproximadamente 36 KB/token en `f16` y 19 KB/token en `q8_0`, con 4K tokens en 0,21 GB / 0,11 GB y 128K tokens en 4,83 GB / 2,60 GB respectivamente.

## Requisitos de hardware

- VRAM para los pesos: 2,68 GB (Q4_K_XL), 3,25 GB (Q5_K_XL) y 3,61 GB (Q6_K_XL).
- VRAM total con contexto: en una GPU de 6 GB, Q6_K_XL deja margen para unos 48K tokens de contexto con caché `f16` o unos 96K con `q8_0`; Q4_K_XL supera los 128K en la misma tarjeta.
- GPUs objetivo: tarjetas consumer de 4 GB (Q4), 5 GB (Q5) y 6 GB o más (Q6). No se documentan requisitos para A100, H100 o RTX 4090, aunque al ser un modelo de 4B cabría en cualquiera de ellas con holgura.
- RAM: la model card orienta el modelo a equipos con 16 GB de RAM o menos; con más memoria recomienda una alternativa MoE con offload parcial.
- Despliegue: llama.cpp es el runtime de referencia (formato GGUF, etiqueta `llama.cpp`); también es compatible con endpoints según la etiqueta del repositorio. No se mencionan vLLM, TGI ni Ollama de forma explícita.
- Throughput: 1.684 tok/s de prefill y 111 tok/s de decode en contexto corto; 557 tok/s de prefill y 42 tok/s de decode a 131.072 tokens.
- Latencia en tareas de agente: 15 minutos de mediana por intento en SWE-bench-Live y 57 minutos de trabajo total por tarea resuelta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | SWE-bench-Live (17 tareas) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Sharp-Spark-X2.6-4B Q6_K_XL | 4B denso | Hasta 256K (KV documentado) | 71,7 % | 8,7 / 17 por semilla | Apache 2.0 | GGUF |
| Spark-X2.6-4B Q8_0 (original) | 4B denso | No disponible | 71,3 % | 9,0 / 17 por semilla | No disponible | No disponible |
| Sharp-Spark-X2.5-4B Q6_K_XL | 4B denso | Misma arquitectura híbrida | 69,0 % | 3,7 / 17 por semilla | Apache 2.0 | GGUF |
| TielCoder 35B-A3B (recomendado por el autor para >16 GB RAM) | 35B MoE | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es contra el Q8_0 original: Sharp-Spark 2.6 ocupa 3,61 GB frente a 4,4 GB, empata en ambos benchmarks y gasta menos tokens por respuesta. Frente a la versión 2.5 del mismo autor, la mejora en SWE-bench-Live es de +5,0 tareas resueltas por semilla (IC 95 % pareado de +2,0 a +8,0).

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles; no disponible.
- Riesgo de alucinación inherente a un modelo de 4B: la model card no reporta tasas de factualidad ni evaluaciones de veracidad.
- Idiomas soportados no documentados; la ficha no puede confirmar cobertura multilingüe más allá del inglés implícito en los benchmarks.
- Sensibilidad a la cuantización: el propio autor advierte que modelos de este tamaño sufren daño notable por debajo de Q6; por debajo de Q4 recomienda usar un modelo nativamente más pequeño.
- Solo se han validado con benchmarks las variantes Q6_K_XL; Q4_K_XL y Q5_K_XL comparten receta pero no están medidas.
- Los resultados de SWE-bench-Live se obtuvieron con red sellada en el contenedor del agente; sin ese aislamiento, los agentes pueden consultar la solución upstream e inflar los resultados. Las cifras no son directamente comparables con evaluaciones sin sellar.
- El rendimiento en contexto largo (prefill y decode a 131K) se midió sobre Sharp-Spark 2.5, no sobre 2.6; el autor asume que se mantiene por compartir arquitectura y tamaño de archivo, pero no está verificado en esta versión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base XHToken/Spark-X2.6-4B no declara licencia en la información disponible; conviene verificar la cadena de licencias antes de un despliegue en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/peculiar-ragdoll/Sharp-Spark-X2.6-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Versión anterior (Sharp-Spark-X2.5-4B): https://huggingface.co/peculiar-ragdoll/Sharp-Spark-X2.5-4B-GGUF
- Colección Cyber TielCoder 35B-A3B: https://huggingface.co/collections/peculiar-ragdoll/cyber-tiel-coder-35b-a3b
- Colección TielCoder 35B-A3B: https://huggingface.co/collections/peculiar-ragdoll/tiel-coder-35b-a3b
