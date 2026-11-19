# ikimyaii/HGRN-340M-semi-structured-EHWS-50pct

## Resumen

HGRN-340M-semi-structured-EHWS-50pct es un modelo de lenguaje de 341 millones de parámetros derivado de `m-a-p/340M-20B-HGRN-pure-baseline` mediante poda semi-estructurada al 50 % de densidad. Lo publica el usuario `ikimyaii` en Hugging Face y su interés es fundamentalmente metodológico: demuestra que es posible aplicar un esquema de poda con equilibrio perfecto de trabajo por fila (cada fila de cada capa lineal podada conserva exactamente el mismo número de pesos) sobre una arquitectura no estándar como HGRN, sin destruir la calidad del modelo base.

La técnica empleada, denominada EHWS, combina una fase local tipo ALPS (poda capa a capa minimizando el error de reconstrucción con Hessianos calculados sobre C4) y una fase global basada en ADMM sobre la pérdida de entropía cruzada más destilación de conocimiento. El resultado es un checkpoint con una esparsidad medida de 0,5000 exacta en las 168 capas lineales podadas, lo que permite un reparto de trabajo perfectamente balanceado en kernels dispersos por filas.

Es relevante ahora porque la poda semi-estructurada con equilibrio por fila es una de las vías más prácticas para acelerar inferencia en GPU sin recurrir a formatos 2:4 rígidos, y porque valida la técnica sobre HGRN (Hierarchically Gated Recurrent Network), una familia de modelos recurrentes lineales alternativa a los transformers puros. El coste de la poda es moderado: la perplexity en WikiText-2 sube de 21,96 a 26,29 y la precisión media zero-shot baja solo 0,68 puntos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), modelo base `m-a-p/340M-20B-HGRN-pure-baseline` |
| Parámetros totales | 341.148.672 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 50 % semi-estructurada por fila en todas las capas lineales de los bloques (168 capas); embeddings y `lm_head` densos |
| Modelo base | `m-a-p/340M-20B-HGRN-pure-baseline` |
| Tamaño del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint base, un modelo recurrente lineal con puertas jerárquicas que sustituye la atención cuadrática por recurrencia lineal. Sobre ese modelo se aplica un pipeline de poda en dos fases. La fase 1 es local y de estilo ALPS: cada capa lineal se poda directamente al 50 % minimizando su error de reconstrucción `||(W - W0) X||^2`, con Hessianos estimados a partir de secuencias de calibración de C4. La fase 2 es global y usa ADMM sobre la pérdida combinada de entropía cruzada y destilación de conocimiento del modelo denso, con un paso Z basado en `Diag(H)`, 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, beta2 de Adam 0,95 y semilla 0.

Los datos de calibración y ajuste son las 32.768 secuencias de entrenamiento de C4 de 2.048 tokens que utiliza el código oficial de ELSA, tokenizadas con el tokenizador del modelo (`fla-hub_hgrn-1.3B-100B`) y vistas una sola vez. El run completo, incluida la evaluación, tardó 2,24 horas en una única A100 de 40 GB. La esparsidad se aplica a todas las capas lineales dentro de los bloques; embeddings y `lm_head` permanecen densos. La esparsidad medida sobre los pesos finales es de 0,5000 y se verificó que las 168 capas podadas tienen el mismo número de no ceros por fila.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje causal, heredadas del checkpoint base HGRN.
- Razonamiento de sentido común y comprensión lectora a escala de 340 M de parámetros (evaluado en ARC, BoolQ, HellaSwag, OpenBookQA, RTE y WinoGrande).
- Capacidad de ejecución con kernels dispersos por filas gracias al equilibrio perfecto de no ceros por fila.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en poda de modelos: sirve como referencia reproducible de un pipeline EHWS de dos fases sobre una arquitectura no transformer, con configuración completa en `results.json` y un coste de cómputo de 2,24 horas en A100 40 GB.
- Estudio comparativo de esquemas de esparsidad: permite contrastar poda semi-estructurada equilibrada por fila frente a formatos 2:4 o poda no estructurada, usando las tablas de perplexity y zero-shot publicadas como línea base.
- Prototipado de kernels dispersos: al tener exactamente el mismo número de no ceros en cada fila de las 168 capas podadas, es un banco de pruebas ideal para validar kernels de SpMM balanceados y medir el speedup real frente al modelo denso.
- Evaluación de destilación de conocimiento en poda: la fase 2 usa KD contra el modelo denso, por lo que el checkpoint permite analizar la contribución de la destilación al mantenimiento de la precisión zero-shot.
- Experimentos de calibración con C4: el modelo documenta explícitamente el conjunto de calibración (32.768 secuencias de 2.048 tokens), lo que facilita reproducir o variar el régimen de calibración y medir su impacto.
- Docencia y divulgación sobre compresión de modelos: con 341 M de parámetros y 1,4 GB de pesos, se puede cargar y analizar en entornos de laboratorio modestos para ilustrar el compromiso entre esparsidad, perplexity y precisión en tareas zero-shot.

## Benchmarks y rendimiento

Perplexity con el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fp16), ejecución única:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (50 % EHWS) | 26,29 | 23,58 |

Precisión zero-shot con `lm-evaluation-harness`:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2500 |
| arc_easy | 0,6153 | 0,5774 |
| boolq | 0,6028 | 0,6089 |
| hellaswag | 0,3423 | 0,3309 |
| openbookqa | 0,2380 | 0,2220 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,5162 |
| Media | 0,4400 | 0,4332 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,4 GB en el repositorio; en fp16 el modelo completo ronda los 0,7 GB de pesos más overhead de activaciones y caché, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: el autor entrenó y evaluó en una A100 de 40 GB, pero para inferencia basta una RTX 3060, RTX 4060 o superior; para servir en producción con kernels dispersos conviene una GPU con soporte maduro de SpMM (A100, H100, L40S).
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM para fp16; en cuantizaciones de 8 o 4 bits el requisito baja aún más, aunque el autor no documenta dichas cuantizaciones.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dado que la arquitectura HGRN no es un transformer estándar, la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles. El único dato de cómputo publicado es el tiempo de poda (2,24 horas en A100 40 GB), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Esparsidad | Perplexity WikiText-2 |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M EHWS 50 %) | 341 M | no disponible | no disponible | 50 % semi-estructurada por fila | 26,29 |
| `m-a-p/340M-20B-HGRN-pure-baseline` (denso) | 341 M | no disponible | no disponible | 0 % | 21,96 |
| Alternativas de poda tipo ELSA / SparseGPT sobre transformers de tamaño similar | no disponible | no disponible | no disponible | variable | no disponible |

No se dispone de datos publicados de otros modelos comparables de la misma categoría (HGRN podado a 340 M) en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible respecto al denso: la perplexity en WikiText-2 sube un 19,7 % (de 21,96 a 26,29) y la media zero-shot cae 0,68 puntos (de 0,4400 a 0,4332).
- Resultados de una sola ejecución (semilla 0), sin intervalos de confianza ni repeticiones; la variabilidad entre semillas no está documentada.
- La licencia no está declarada en la model card ni en los metadatos de Hugging Face; no se puede asumir uso comercial sin consultar al autor y al modelo base.
- El modelo base `m-a-p/340M-20B-HGRN-pure-baseline` tiene su propia licencia, que no se detalla aquí y que hay que verificar por separado.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés, dado que la calibración se hizo con C4.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin consultar la model card del modelo base.
- Compatibilidad de despliegue limitada: requiere `flash-linear-attention` y no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Riesgo de alucinación no evaluado en la información disponible; a 341 M de parámetros, la fiabilidad factual es intrínsecamente baja.
- Sesgos no analizados: no se publica ninguna evaluación de sesgo, toxicidad o seguridad.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes) y creado en noviembre de 2026; no hay validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-EHWS-50pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Tokenizador de referencia citado: `fla-hub_hgrn-1.3B-100B`
- Repositorio `flash-linear-attention` (requerido para cargar el modelo): no disponible en la información proporcionada
- Paper o blog de ELSA (protocolo de evaluación y código de calibración citados): no disponible en la información proporcionada
- Paper o blog de ALPS (método de poda local de la fase 1): no disponible en la información proporcionada
