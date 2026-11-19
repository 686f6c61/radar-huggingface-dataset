# ikimyaii/OPT-125M-semi-structured-Wanda-80pct

## Resumen

OPT-125M-semi-structured-Wanda-80pct es una versión podada del modelo facebook/opt-125m publicada por el usuario ikimyaii en Hugging Face. Se trata de un artefacto de investigación, no de un modelo entrenado desde cero: aplica poda one-shot (sin reentrenamiento) con el algoritmo Wanda sobre el checkpoint original de OPT-125M, eliminando el 80% de los pesos de las capas lineales internas de los bloques del transformer. El resultado es un modelo con dispersión semiestructurada del 79,96% medida sobre los pesos finales, manteniendo embeddings y lm_head densos.

El modelo base OPT-125M es un transformer decoder-only de 125 millones de parámetros publicado por Meta en 2022 como parte de la familia OPT. Esta ficha describe la variante podada, cuyo propósito declarado por el autor es servir de línea base ("baseline") para comparar con otros modelos del mismo perfil, denominados EHWS en la cuenta del autor. No hay indicios de que se trate de un modelo destinado a producción: las métricas publicadas muestran un deterioro severo respecto al modelo denso original.

La relevancia de esta publicación es metodológica: documenta de forma reproducible un pipeline de poda con Wanda usando el código oficial, con detalles de calibración, precisión de los pesos durante la poda y protocolo de evaluación. Es útil para quien investigue compresión de modelos, no para quien busque un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OPT), con poda semiestructurada en capas lineales |
| Parámetros totales | 125.239.296 (según safetensors; el checkpoint mantiene la forma densa con ceros) |
| Parámetros activos | no disponible (no es MoE; la dispersión es del 79,96% en capas podadas) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base OPT-125M usa 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en el repo como safetensors; la poda se realizó en float16) |
| Idiomas soportados | no disponible (el modelo base OPT está entrenado principalmente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OPT-125M: un transformer decoder-only con atención multi-cabeza estándar, capas feed-forward y normalización previa, tal como lo publicó Meta. Sobre ese checkpoint se aplicó poda one-shot con el código oficial de Wanda (repositorio locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`). La puntuación de poda combina la magnitud del peso con la norma de las activaciones de entrada: cada fila elimina los pesos con menor valor de `|W| * sqrt(||X||)`. Wanda ya equilibra por defecto el número de pesos podados en cada fila, de modo que todas las filas de todas las capas podadas tienen exactamente el mismo número de no ceros (verificado sobre los 72 tensores podados), lo que produce un reparto de trabajo perfectamente balanceado por fila.

El proceso de calibración usó el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Las capas se podaron en orden, calibrando cada bloque sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales; el recorrido de capas es código nuevo del autor, mientras que la matemática de poda es la oficial. Los pesos se podaron en float16 y el proceso completo tardó 0,1 minutos en una A100 de 40 GB. No hubo reentrenamiento ni ajuste fino posterior a la poda. Embeddings y lm_head permanecen densos. No se documenta ningún tipo de RLHF, DPO ni ajuste por preferencias, ya que no se trata de un modelo entrenado sino de un checkpoint comprimido.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base OPT-125M, aunque con calidad severamente degradada por la poda al 80%.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el modelo base OPT-125M está orientado principalmente al inglés.
- No dispone de modo thinking, visión ni audio.
- Sirve como referencia reproducible para experimentos de compresión y evaluación de poda.

## Casos de uso

- Investigación en compresión de modelos: sirve como línea base para comparar técnicas de poda alternativas sobre OPT-125M, ya que el autor lo publica explícitamente como baseline frente a sus modelos EHWS.
- Reproducción de experimentos de Wanda: permite verificar resultados de poda semiestructurada con el código oficial sin necesidad de ejecutar el pipeline completo, dado que el checkpoint ya está publicado.
- Estudio de degradación por dispersión: sus métricas de perplejidad (1814,82 en WikiText-2 y 996,30 en C4) permiten analizar cómo afecta el 80% de dispersión a un modelo pequeño, útil para calibrar expectativas en modelos mayores.
- Docencia y formación: ilustra de forma tangible el efecto de la poda one-shot sin reentrenamiento en un modelo de 125M, adecuado para prácticas de compresión.
- Evaluación de harness: los resultados zero-shot publicados (media de 0,3261 en lm-evaluation-harness) sirven como referencia para validar pipelines de evaluación propios.
- Pruebas de infraestructura de inferencia: al ser un checkpoint estándar cargable con `AutoModelForCausalLM.from_pretrained`, permite probar integraciones de transformers sin coste de cómputo relevante.
- No es adecuado para aplicaciones en producción de atención al cliente, generación de código ni tareas que requieran calidad lingüística, dado el nivel de degradación medido.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fp16):

| Conjunto | Perplejidad |
|---|---|
| WikiText-2 | 1814,82 |
| C4 | 996,30 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Precisión |
|---|---|
| arc_challenge | 0,1911 |
| arc_easy | 0,2908 |
| boolq | 0,3783 |
| hellaswag | 0,2632 |
| openbookqa | 0,1260 |
| rte | 0,5271 |
| winogrande | 0,5059 |
| Media | 0,3261 |

No se han publicado en la información disponible resultados comparativos con el modelo denso original ni con otros modelos podados.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,3 GB en el repositorio; en fp16 la inferencia requiere aproximadamente 0,25 GB de pesos más overhead de activaciones, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `AutoModelForCausalLM.from_pretrained` (método indicado por el autor); no se documenta compatibilidad específica con vLLM, llama.cpp, Ollama o TGI, aunque al ser un checkpoint OPT estándar debería poder convertirse a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La poda semiestructurada al 80% con filas equilibradas permite, en teoría, aceleración por hardware que explote la dispersión, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPT-125M-semi-structured-Wanda-80pct | 125.239.296 | no disponible | 1814,82 | no disponible | Hugging Face |
| facebook/opt-125m (denso) | 125M | 2.048 | no disponible en esta información | OPT-175B license (según modelo base) | Hugging Face |
| Otras variantes podadas de OPT-125M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo denso original en la información proporcionada, por lo que no es posible cuantificar la pérdida exacta de calidad atribuible a la poda.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 de 1814,82 y una media zero-shot de 0,3261 indican un modelo muy deteriorado, impropio para uso real.
- Riesgo elevado de alucinación y generación incoherente derivado de la poda agresiva sin reentrenamiento.
- Sesgos heredados del modelo base OPT-125M, entrenado con datos web en inglés, sin mitigación documentada.
- Limitaciones de idioma: no se documentan idiomas soportados; el modelo base está orientado al inglés.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; debe consultarse el repositorio antes de cualquier uso, especialmente comercial.
- El checkpoint conserva la forma densa con ceros; el ahorro de memoria solo se materializa si el runtime explota la dispersión semiestructurada.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, y autor sin historial verificable en la información disponible.
- No usar en producción sin una evaluación propia exhaustiva del caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/OPT-125M-semi-structured-Wanda-80pct
- Modelo base: https://huggingface.co/facebook/opt-125m
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
