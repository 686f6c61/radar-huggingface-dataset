# ikimyaii/HGRN-340M-semi-structured-Wanda-80pct

## Resumen

HGRN-340M-semi-structured-Wanda-80pct es un checkpoint de investigación publicado por el usuario ikimyaii en Hugging Face. Se trata del modelo base m-a-p/340M-20B-HGRN-pure-baseline sometido a un proceso de poda (pruning) one-shot sin reentrenamiento posterior, hasta alcanzar una esparsidad semi-estructurada del 80 % mediante el algoritmo Wanda. El resultado es un modelo de 341.148.672 parámetros totales (el recuento no baja porque la poda pone pesos a cero, no elimina tensores) con la mayoría de las capas lineales internas severamente degradadas.

El modelo base pertenece a la familia HGRN (Hierarchically Gated Recurrent Neural Network), una arquitectura recurrente con compuertas jerárquicas que se presenta como alternativa eficiente a los transformers para modelado de lenguaje. El checkpoint emplea la implementación de flash-linear-attention para su carga. Este artefacto no está pensado para uso en producción: el propio autor lo describe como una línea base de referencia para comparar con otros modelos del mismo perfil (los denominados EHWS de su cuenta).

La relevancia es, por tanto, metodológica: documenta el efecto de aplicar Wanda al 80 % de esparsidad semi-estructurada sobre una arquitectura recurrente pequeña, y evidencia la fuerte degradación de perplejidad y de precisión zero-shot que provoca esa poda sin recuperación. Es material útil para quien investigue compresión de modelos, pero no un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (red neuronal recurrente con compuertas jerárquicas), basada en m-a-p/340M-20B-HGRN-pure-baseline |
| Parámetros totales | 341.148.672 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la calibración usó secuencias de 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos en bfloat16 en el momento de la poda) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 0,7998 medida sobre los pesos podados (80 % semi-estructurada) |
| Capas podadas | 168 capas lineales internas de los bloques; embeddings y lm_head permanecen densos |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint base m-a-p/340M-20B-HGRN-pure-baseline, un modelo recurrente con compuertas jerárquicas de aproximadamente 340 millones de parámetros. No se proporcionan en la información disponible detalles sobre el corpus de preentrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo fases de alineación como RLHF o DPO; el sufijo "20B" del nombre del modelo base sugiere un entrenamiento sobre 20 000 millones de tokens, pero este dato no se confirma explícitamente en la documentación consultada.

La innovación técnica de este checkpoint concreto es el procedimiento de poda. Se aplicó Wanda en su código oficial (locuslab/wanda, commit 8e8fc87, rama unstructured, con `use_variant=False`), que puntúa cada peso como |W| · sqrt(||X||) y elimina los de menor puntuación en cada fila. La calibración empleó 128 secuencias de C4 de 2 048 tokens con semilla 0. Los bloques se podaron en orden, calibrándose cada uno sobre las salidas de los bloques ya podados anteriores, con un recorrido de capas escrito específicamente para HGRN (los drivers oficiales solo soportan OPT y LLaMA) aunque la matemática de poda es la oficial. Los pesos se podaron en bfloat16 y el proceso completo tardó 0,8 minutos en una A100 de 40 GB. No hubo reentrenamiento ni destilación posterior. Todas las filas de todas las capas podadas conservan el mismo número de valores distintos de cero (verificado sobre 168 capas), lo que garantiza equilibrio perfecto de trabajo por fila en hardware con soporte de esparsidad.

## Capacidades

- Generación de texto autoregresiva en el nivel propio de un modelo base de 340 M de parámetros, aunque severamente degradada por la poda.
- Razonamiento y conocimiento factual muy limitados: la precisión media zero-shot cae del 44,00 % al 32,86 %.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión ni audio.
- Sirve como referencia cuantitativa de degradación para estudios de compresión y poda.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de comparación controlado para medir la pérdida de calidad de Wanda al 80 % de esparsidad sobre arquitecturas recurrentes, frente a otros métodos o ratios de poda.
- Reproducción de experimentos de poda: el autor detalla la configuración exacta (commit, semilla, calibración, orden de bloques), lo que permite replicar el pipeline y verificar los resultados de perplejidad.
- Estudio de arquitecturas HGRN: permite analizar cómo se comporta una red recurrente con compuertas jerárquicas bajo esparsidad semi-estructurada, un régimen poco explorado frente a los transformers.
- Benchmarking de kernels con esparsidad 2:4 o estructurada: la garantía de igual número de no ceros por fila lo hace útil para validar implementaciones de inferencia dispersa con balanceo de carga perfecto.
- Docencia sobre límites de la poda one-shot: los datos de perplejidad (de 21,96 a 1 722,75 en WikiText-2) ilustran de forma contundente el coste de podar sin recuperación.
- Línea base para técnicas de recuperación: cualquier método de reentrenamiento o destilación sobre modelos podados puede medirse contra este checkpoint como referencia inferior.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fórmula propia, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (80 % Wanda) | 1 722,75 | 1 051,58 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2167 |
| arc_easy | 0,6153 | 0,2799 |
| boolq | 0,6028 | 0,3783 |
| hellaswag | 0,3423 | 0,2628 |
| openbookqa | 0,2380 | 0,1380 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,4972 |
| Media | 0,4400 | 0,3286 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 341 M de parámetros ocupan aproximadamente 0,68 GB; con overhead de activaciones y caché, cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: no requiere hardware de datacenter; una RTX 3060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida son suficientes. El autor usó una A100 de 40 GB únicamente para el proceso de poda (0,8 minutos).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM; también en CPU para inferencia de baja latencia.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained(...)` con la librería flash-linear-attention instalada (`import fla`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La esparsidad semi-estructurada solo aporta aceleración real con kernels que la soporten; en su ausencia, el modelo se ejecuta como denso.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M Wanda 80 %) | 341 M | no disponible | Perplejidad WT-2 1 722,75; media zero-shot 0,3286 | no disponible | Hugging Face (0 descargas) |
| m-a-p/340M-20B-HGRN-pure-baseline | ~340 M | no disponible | Perplejidad WT-2 21,96; media zero-shot 0,4400 | no disponible | Hugging Face |
| Modelos HGRN de la misma cuenta (EHWS) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación más directa es con su propio modelo base denso, que supera ampliamente a este checkpoint en todas las métricas. No se dispone de información sobre otros modelos comparables de la misma categoría (recurrentes pequeños podados) en la documentación consultada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por más de 78 respecto al modelo denso y la precisión media zero-shot cae 11,14 puntos porcentuales.
- El modelo no ha sido reentrenado tras la poda; no hay recuperación de capacidad, por lo que la generación de texto será en la práctica incoherente en muchas tareas.
- Riesgo elevado de alucinación y de texto gramaticalmente incorrecto derivado de la poda agresiva, no solo de las limitaciones del modelo base.
- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo base sin alineación declarada, es probable que reproduzca sesgos del corpus de preentrenamiento, pero no se aportan datos.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede asumirse uso comercial sin verificar la del modelo base m-a-p/340M-20B-HGRN-pure-baseline.
- Idiomas soportados no documentados; no debe asumirse un rendimiento multilingüe.
- Requiere la librería flash-linear-attention para cargarse correctamente; sin ella, la carga fallará.
- La aceleración por esparsidad solo se materializa con kernels compatibles; de lo contrario, el coste computacional es el de un modelo denso de 341 M de parámetros.
- No apto para producción: es un artefacto de investigación sin descargas ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-Wanda-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Librería flash-linear-attention: no disponible enlace directo en la información proporcionada
- Paper de HGRN: no disponible en la información proporcionada
- Paper de Wanda: no disponible en la información proporcionada
