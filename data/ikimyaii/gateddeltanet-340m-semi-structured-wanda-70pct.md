# ikimyaii/GatedDeltaNet-340M-semi-structured-Wanda-70pct

## Resumen

GatedDeltaNet-340M-semi-structured-Wanda-70pct es un modelo derivado del checkpoint base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ejercicio de poda (pruning) one-shot: se parte del modelo denso de aproximadamente 400 millones de parámetros y se elimina el 70 % de los pesos de todas las capas lineales internas de los bloques, sin reentrenamiento posterior. El objetivo es servir de referencia (baseline) para comparar otras técnicas de poda semiestructurada desarrolladas por el mismo autor.

La arquitectura subyacente es GatedDeltaNet, una variante de atención lineal con compuertas derivada de DeltaNet y del trabajo Gated Delta Networks, implementada en la librería flash-linear-attention. El modelo base fue entrenado sobre 20.000 millones de tokens según indica su nombre (340M-20B). Este checkpoint concreto conserva los embeddings y la cabeza de salida (lm_head) en densidad completa y solo poda las proyecciones lineales internas.

La relevancia de esta ficha es acotada: es un artefacto de investigación sobre eficiencia y sparsidad, no un modelo listo para producción. La poda al 70 % degrada de forma severa la perplejidad (de 16,42 a 67,15 en WikiText-2) y la precisión media zero-shot cae unos cinco puntos porcentuales. Su interés radica en documentar el coste de la poda sin recuperación y en servir de punto de comparación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con compuertas, familia DeltaNet) |
| Parametros totales | 399.531.200 (~400 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el calibrado usó secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad de las capas podadas | 0,6994 (70 %) |
| Modelo base | m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Tamano del repositorio | 0,8 GB |
| Dependencia de carga | flash-linear-attention (`import fla`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GatedDeltaNet del checkpoint base: un transformer con capas de atención lineal basadas en la regla delta y compuertas de olvido, en lugar de atención softmax cuadrática. La implementación requiere la librería flash-linear-attention para cargarse mediante `AutoModelForCausalLM.from_pretrained`. El modelo base se entrenó con 20.000 millones de tokens según la nomenclatura del checkpoint original; no se dispone de más detalle sobre la composición del dataset ni sobre si hubo fases de RLHF o DPO.

Sobre ese modelo denso se aplicó poda one-shot con el código oficial de Wanda (locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`). La puntuación de importancia es `|W| * sqrt(||X||)`, de modo que cada fila elimina sus pesos de menor magnitud ponderada. El calibrado usó el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores; el recorrido de capas es código nuevo del autor, mientras que la matemática de poda es la oficial. La poda se realizó en bfloat16 y tardó 1,5 minutos en una A100 de 40 GB. Se podaron las 240 capas lineales internas; embeddings y lm_head permanecen densos. Cada fila de cada capa podada tiene exactamente el mismo número de valores no nulos, lo que equilibra la carga por fila.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base.
- Razonamiento y conocimiento general limitados: la poda sin reentrenamiento degrada tareas de sentido común y razonamiento (arc_challenge cae de 0,2645 a 0,1869).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documenta modo thinking, visión ni audio.
- Interés principal: servir como baseline reproducible de poda semiestructurada al 70 % para comparar con otras técnicas de sparsidad.

## Casos de uso

- Investigación en compresión de modelos: usar este checkpoint como referencia de poda Wanda one-shot al 70 % para medir la ganancia de métodos con recuperación (destilación, fine-tuning posterior) frente a la poda sin reentrenar.
- Estudio de atención lineal: analizar el comportamiento de GatedDeltaNet bajo sparsidad severa en las proyecciones internas, aprovechando que el modelo base es un baseline puro de esta arquitectura.
- Validación de kernels dispersos: el equilibrio exacto de no nulos por fila (240 capas, 0,6994 de sparsidad) permite probar kernels de sparsidad semiestructurada con carga balanceada.
- Reproducibilidad de pipelines de poda: replicar el calibrado con 128 secuencias C4 de 2.048 tokens y comparar la perplejidad obtenida con la reportada.
- Docencia y experimentación: un modelo de ~400 M parámetros y 0,8 GB de repositorio cabe en entornos modestos para demostrar el impacto de la poda en métricas de lenguaje.
- Evaluación comparativa de harness: ejecutar lm-evaluation-harness sobre las tareas reportadas (arc, boolq, hellaswag, rte, winogrande) para contrastar con el modelo denso base.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (perplejidad) | 16,42 | 67,15 |
| C4 (perplejidad) | 19,94 | 66,17 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,1869 |
| arc_easy | 0,6023 | 0,4133 |
| boolq | 0,5985 | 0,6214 |
| hellaswag | 0,3461 | 0,2881 |
| openbookqa | 0,2300 | 0,1460 |
| rte | 0,5162 | 0,5379 |
| winogrande | 0,5036 | 0,5107 |
| Media | 0,4373 | 0,3863 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en bfloat16 (400 M parámetros); alrededor de 0,4 GB en fp16 y menos de 0,3 GB en cuantizaciones de 8 bits, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained` con flash-linear-attention instalado; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la dependencia de `fla` puede limitar algunos runners.
- Latencia y throughput: no disponibles. Como referencia del proceso de poda, esta tardó 1,5 minutos en una A100 de 40 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia |
|---|---|---|---|---|
| Este modelo (Wanda 70 %) | ~400 M | no disponible | Podado one-shot, sin reentrenar | no disponible |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline | ~340 M (nominal) | no disponible | Denso, entrenado con 20B tokens | no disponible |
| Alternativas de poda de la misma cuenta (EHWS) | no disponible | no disponible | Modelos de referencia del autor | no disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa por poda sin reentrenamiento: la perplejidad en WikiText-2 se multiplica por más de cuatro (16,42 a 67,15) y la media zero-shot cae de 0,4373 a 0,3863.
- Caídas acusadas en tareas de razonamiento y sentido común: arc_easy baja de 0,6023 a 0,4133 y openbookqa de 0,2300 a 0,1460.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los términos del modelo base y del repositorio.
- Idiomas soportados no documentados; el calibrado usó únicamente C4 en inglés.
- Riesgo de alucinación no evaluado en la información disponible; con esta pérdida de calidad es previsible que aumente respecto al modelo denso.
- Dependencia técnica de flash-linear-attention para la carga; sin `fla` instalado el modelo no se carga con `AutoModelForCausalLM`.
- Artefacto de investigación: no está pensado para producción ni para tareas sensibles.
- Sesgos del modelo base no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-Wanda-70pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Librería flash-linear-attention: no disponible en la información proporcionada (requerida para la carga)
- Paper de Gated Delta Networks: no disponible en la información proporcionada
- Paper de Wanda: no disponible en la información proporcionada
