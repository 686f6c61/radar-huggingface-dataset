# ikimyaii/HGRN-1.3B-unstructured-SparseGPT-90pct

## Resumen

HGRN-1.3B-unstructured-SparseGPT-90pct es un modelo derivado del checkpoint base `fla-hub/hgrn-1.3B-100B`, desarrollado por el usuario `ikimyaii` y publicado en Hugging Face. Se trata de un experimento de poda (pruning) one-shot sin reentrenamiento posterior: al modelo original se le aplicó el algoritmo SparseGPT con el código oficial de IST-DASLab para eliminar el 90% de los pesos en las capas lineales, dejando intactos los embeddings y la `lm_head`. El resultado es un artefacto de investigación pensado como baseline para comparar otras técnicas de poda (los modelos "EHWS" del mismo autor).

El modelo base pertenece a la familia HGRN (Hierarchically Gated Recurrent Neural Network), una arquitectura recurrente con compuertas jerárquicas que se presenta como alternativa a los transformers clásicos, implementada en la librería `flash-linear-attention`. El checkpoint base tiene 1.364.396.032 parámetros y fue entrenado con 100B tokens (según indica el nombre del modelo original), aunque no se dispone de detalles adicionales sobre su composición.

La relevancia de esta ficha es doble: por un lado, documenta un caso extremo de poda no estructurada al 90% que, como muestran los resultados del autor, degrada severamente la perplejidad (de 11,81 a 64.600,68 en WikiText-2) y la precisión zero-shot media (de 0,4376 a 0,3533). Por otro, sirve como referencia metodológica reproducible: el autor documenta el proceso de calibración, el bloque de 128 columnas, el damping de 0,01 y el tiempo de poda (3,6 minutos en una A100 de 40 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (recurrente con compuertas jerárquicas, familia flash-linear-attention) |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repo; safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Esparsidad | 90% no estructurada en capas lineales (embeddings y lm_head densos) |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base HGRN-1.3B, una red recurrente con compuertas jerárquicas que sustituye la atención tradicional por un mecanismo lineal recurrente. La implementación requiere la librería `flash-linear-attention` (import fla) y se carga con `AutoModelForCausalLM.from_pretrained`. No se dispone de información detallada sobre el número exacto de capas, dimensión oculta ni composición del dataset de entrenamiento original, más allá de la referencia a 100B tokens en el nombre del checkpoint base.

El proceso de poda es el elemento técnico central: se aplicó SparseGPT con el código oficial (IST-DASLab/sparsegpt@147d215, modo `fasterprune`) con bloques de 128 columnas y damping de 0,01. La calibración usó 128 secuencias de C4 de 2.048 tokens con semilla 0. Las capas se podan en orden, calibrando cada bloque sobre las salidas de los bloques ya podados. Los pesos se podaron en bfloat16 y el proceso completo tardó 3,6 minutos en una A100 de 40 GB. El autor señala que el recorrido por capas es código nuevo (los drivers oficiales solo soportan OPT y LLaMA), mientras que la matemática de poda es la oficial. La esparsidad medida sobre los pesos resultantes es exactamente 0,9000, pero las filas no están balanceadas: en las 168 capas podadas, la fila más densa tiene de media 4,19 veces los nonzeros de la fila media, y la peor capa alcanza 9,65 veces.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base HGRN-1.3B.
- Razonamiento y respuesta a preguntas zero-shot, aunque con degradación severa respecto al modelo denso (ver benchmarks).
- Capacidad multilingüe: no documentada; los idiomas soportados figuran como no disponibles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.
- Uso principal previsto: baseline de investigación para comparar técnicas de poda, no para despliegue en producción.

## Casos de uso

- Investigación sobre poda no estructurada: sirve como referencia reproducible para medir el impacto de SparseGPT al 90% sobre una arquitectura recurrente distinta de los transformers clásicos, comparando perplejidad y precisión zero-shot frente al modelo denso.
- Estudio de degradación por esparsidad extrema: permite analizar cómo se distribuye el error entre tareas (arc_easy cae de 0,5644 a 0,2588, mientras rte apenas baja de 0,5379 a 0,5271) y extraer conclusiones sobre qué tipos de conocimiento resisten mejor la poda.
- Benchmark de metodologías de poda: el autor lo posiciona explícitamente como baseline frente a sus modelos EHWS, de modo que otros investigadores pueden comparar sus propias técnicas contra este punto de referencia.
- Análisis de desequilibrio de filas: con filas que llegan a tener 9,65 veces la media de nonzeros, el modelo es útil para estudiar el efecto del desequilibrio estructural en la calidad de la inferencia y en el rendimiento de kernels dispersos.
- Validación de pipelines de poda para arquitecturas lineales/recurrentes: al requerir código nuevo para recorrer capas HGRN, el modelo documenta un flujo de trabajo replicable para aplicar SparseGPT a arquitecturas no soportadas oficialmente.
- Docencia y divulgación: ejemplo práctico y medible de por qué la poda one-shot sin reentrenamiento a esparsidades muy altas no es viable para uso real, con cifras concretas de perplejidad y accuracy.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| Este modelo (90% poda) | 64.600,68 | 69.756,39 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2235 |
| arc_easy | 0,5644 | 0,2588 |
| boolq | 0,5758 | 0,5394 |
| hellaswag | 0,3828 | 0,2604 |
| openbookqa | 0,2300 | 0,1660 |
| rte | 0,5379 | 0,5271 |
| winogrande | 0,5288 | 0,4980 |
| Media | 0,4376 | 0,3533 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 2,7 GB en safetensors (pesos en bfloat16); en fp16/bf16 se necesitan aproximadamente 2,7-3 GB solo para pesos, más overhead de activaciones y caché.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; el autor realizó la poda en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores, con margen amplio.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado (requisito explícito del autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; dado que la arquitectura HGRN no es un transformer estándar, la compatibilidad con estos motores es dudosa y no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-1.3B, 90% poda) | 1,36B | no disponible | 64.600,68 | no disponible | Hugging Face |
| fla-hub/hgrn-1.3B-100B (denso) | 1,36B | no disponible | 11,81 | no disponible | Hugging Face |
| Alternativas de poda SparseGPT en transformers | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría (HGRN podado) en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 11,81 a 64.600,68 y en C4 de 16,09 a 69.756,39; el modelo no es apto para generación de texto en producción.
- Caída notable en tareas de razonamiento y sentido común: arc_easy baja de 0,5644 a 0,2588 y hellaswag de 0,3828 a 0,2604, lo que indica pérdida de conocimiento factual y de razonamiento cotidiano.
- Desequilibrio de filas: la poda por umbral por bloque de 128 columnas produce filas con distinto número de nonzeros (hasta 9,65 veces la media en la peor capa), lo que complica la implementación eficiente de kernels dispersos y hace que el ahorro real de cómputo no sea proporcional a la esparsidad nominal.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse en el modelo base `fla-hub/hgrn-1.3B-100B` antes de cualquier uso.
- Idiomas no documentados: se desconoce la cobertura lingüística real del modelo base.
- Dependencia de `flash-linear-attention`: sin esa librería la carga falla; además, la arquitectura HGRN no es compatible con el ecosistema estándar de transformers (vLLM, TGI, llama.cpp), lo que limita las opciones de despliegue.
- Riesgo de alucinación: no cuantificado en la información disponible, pero previsiblemente elevado dada la degradación de perplejidad.
- Sesgos: no documentados; al ser un derivado del modelo base, hereda los sesgos del mismo, que no se detallan.
- Uso previsto: exclusivamente como baseline de investigación; el propio autor lo describe como referencia para sus modelos EHWS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-SparseGPT-90pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Código oficial de SparseGPT (IST-DASLab): https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
