# ikimyaii/Mamba-1.3B-unstructured-SparseGPT-80pct

## Resumen

Mamba-1.3B-unstructured-SparseGPT-80pct es una variante podada del modelo base fla-hub/mamba-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de un checkpoint de investigación que aplica poda no estructurada al 80% sobre las capas lineales de un transformer de estado (SSM) de tipo Mamba, utilizando el código oficial de SparseGPT en modalidad one-shot, es decir, sin reentrenamiento posterior. El resultado es un modelo de 1.334.740.992 parámetros (aproximadamente 1,3 mil millones) con una esparsidad medida de 0,7841 en las capas podadas.

El interés de esta ficha no reside en su calidad como modelo de producción, sino en su valor como referencia metodológica: el autor lo presenta explícitamente como línea base para sus modelos EHWS y documenta con detalle el procedimiento de calibración, el walk de capas y las métricas de degradación. La poda afecta a in_proj, x_proj y out_proj dentro de los bloques, mientras que dt_proj, conv1d, A_log, D, los embeddings y el lm_head permanecen densos.

Los resultados publicados muestran una degradación severa: la perplejidad en WikiText-2 pasa de 10,03 a 174,06 y en C4 de 14,12 a 165,71, y la media de precisión zero-shot cae de 0,4350 a 0,3329. Es, por tanto, un artefacto útil para estudiar los límites de SparseGPT en arquitecturas SSM, no un modelo recomendable para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, transformer de estado) |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es fla-hub/mamba-1.3B-100B, una implementación de Mamba entrenada sobre 100.000 millones de tokens y distribuida a través de la librería flash-linear-attention (fla). Mamba sustituye la atención por un mecanismo de espacio de estados selectivo con complejidad lineal en la longitud de secuencia. Sobre ese checkpoint, el autor aplica poda no estructurada al 80% con el código oficial de SparseGPT (IST-DASLab/sparsegpt, commit 147d215, variante fasterprune), con blocksize 128 y damping 0,01.

La calibración emplea el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores. El autor escribió un walk de capas nuevo, ya que los drivers oficiales solo cubren OPT y LLaMA, pero la matemática de poda es la del código oficial. Los pesos se podan en bfloat16 y el proceso completo tardó 5,3 minutos en una A100 de 40 GB. La máscara usa un umbral por bloque de 128 columnas, de modo que las filas acaban con distinto número de no ceros: la fila más densa tiene de media 1,96 veces los no ceros de la fila media, y en la peor capa hasta 4,27 veces.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Mamba-1.3B, aunque gravemente degradada por la poda.
- Razonamiento y respuesta a preguntas de opción múltiple, con precisión muy reducida respecto al denso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas.
- No dispone de modo thinking, visión ni audio.
- Requiere `import fla` (flash-linear-attention) instalado para cargarse con `AutoModelForCausalLM.from_pretrained`.
- Debe ejecutarse en bfloat16: Mamba desborda en fp16 según el autor.

## Casos de uso

- Investigación sobre poda en SSM: sirve como línea base reproducible para comparar técnicas de poda no estructurada aplicadas a Mamba frente a SparseGPT, con métricas de perplejidad y zero-shot documentadas.
- Estudio de la degradación por esparsidad: permite analizar cómo afecta una esparsidad del 78,41% a tareas específicas, observando que winogrande y rte apenas caen mientras arc_easy se hunde de 0,5644 a 0,3005.
- Validación de pipelines de poda: útil para verificar implementaciones propias del walk de capas sobre arquitecturas no cubiertas por los drivers oficiales de SparseGPT (OPT y LLaMA).
- Análisis de desbalanceo de filas: el checkpoint permite estudiar el efecto del umbral por bloque de 128 columnas y la distribución irregular de no ceros entre filas.
- Reproducción de experimentos: con los hiperparámetros documentados (blocksize 128, damping 0,01, 128 secuencias C4 de 2.048 tokens, semilla 0) se puede replicar el resultado en una A100 de 40 GB en unos 5 minutos.
- Docencia y divulgación: ejemplo concreto de los límites de la poda one-shot sin reentrenamiento en modelos de 1,3B parámetros.
- No es adecuado para atención al cliente, generación de código en producción ni ninguna tarea que requiera calidad de salida utilizable.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, en bfloat16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 10,03 | 174,06 |
| C4 | 14,12 | 165,71 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,1715 |
| arc_easy | 0,5644 | 0,3005 |
| boolq | 0,6040 | 0,4187 |
| hellaswag | 0,3898 | 0,2722 |
| openbookqa | 0,1980 | 0,1220 |
| rte | 0,5343 | 0,5235 |
| winogrande | 0,5217 | 0,5217 |
| Media | 0,4350 | 0,3329 |

Esparsidad medida sobre estos pesos: 0,7841.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 2,7 GB en bfloat16, por lo que la inferencia en bf16 requiere del orden de 3 GB de VRAM más overhead de activaciones y caché de estados.
- GPU recomendadas: el autor realizó la poda en una A100 de 40 GB, aunque la inferencia del modelo ya podado es mucho más ligera.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4-6 GB de VRAM en bf16 (por ejemplo RTX 3060, RTX 4060 o superiores), siempre que se use bfloat16.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la carga indicada es `AutoModelForCausalLM.from_pretrained` con flash-linear-attention instalado.
- Latencia y throughput: no disponibles.
- Advertencia: no usar fp16, ya que Mamba desborda en ese formato según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B podado 80%) | 1,33B | no disponible | 174,06 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (denso) | ~1,3B | no disponible | 10,03 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciados como comparación) |

No se dispone de datos de benchmarks de los modelos EHWS ni de otras alternativas podadas comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad se multiplica por más de 17 en WikiText-2 y por más de 11 en C4 respecto al denso.
- Caída notable en tareas de conocimiento y razonamiento: arc_easy pierde 26 puntos porcentuales y boolq más de 18.
- Riesgo elevado de alucinación y salidas incoherentes por la poda one-shot sin reentrenamiento.
- Desbalanceo de esparsidad entre filas: hasta 4,27 veces la media en la peor capa, lo que complica el aprovechamiento real del hardware.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse la licencia del modelo base fla-hub/mamba-1.3B-100B.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Requiere dependencia específica (flash-linear-attention) y ejecución en bfloat16.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.
- No apto para producción: es un artefacto de investigación y línea base comparativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-unstructured-SparseGPT-80pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: no disponible enlace directo en la información proporcionada
- Protocolo de evaluación ELSA: no disponible enlace directo en la información proporcionada
- lm-evaluation-harness: no disponible enlace directo en la información proporcionada
