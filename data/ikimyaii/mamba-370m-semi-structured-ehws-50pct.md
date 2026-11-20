# ikimyaii/Mamba-370M-semi-structured-EHWS-50pct

## Resumen

Mamba-370M-semi-structured-EHWS-50pct es una variante podada del modelo state-spaces/mamba-370m-hf, desarrollada por el usuario ikimyaii. Se trata de un checkpoint de investigación que aplica una poda semi-estructurada del 50 % sobre las capas lineales internas de los bloques del modelo Mamba original, empleando una metodología de dos fases basada en ADMM (Alternating Direction Method of Multipliers) denominada EHWS. El objetivo es reducir la huella computacional y de memoria del modelo manteniendo un rendimiento razonable respecto al modelo denso de referencia.

El modelo conserva la arquitectura Mamba original (modelo de espacio de estados selectivo, SSM) con 423.003.136 parámetros totales almacenados en formato safetensors (1,7 GB). La poda afecta a las proyecciones `in_proj`, `x_proj` y `out_proj` de cada bloque, mientras que `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y `lm_head` permanecen densos. La sparsity es semi-estructurada: cada fila de cada capa podada conserva exactamente el mismo número de pesos (el 50 % superior), lo que la hace potencialmente compatible con aceleración por hardware estructurada.

Su relevancia actual reside en el interés por técnicas de compresión de modelos de espacio de estados, una familia alternativa a los transformers que está atrayendo atención por su eficiencia en contextos largos. Este checkpoint sirve como referencia reproducible de un pipeline de poda ADMM aplicado a Mamba, con resultados de perplejidad y precisión zero-shot publicados frente al modelo denso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor indica que Mamba desborda en fp16 y recomienda bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de state-spaces/mamba-370m-hf, un modelo de espacio de estados selectivo de la familia Mamba. Sobre él se aplica una poda semi-estructurada al 50 % mediante un esquema de dos fases. La fase 1 es local, de estilo ALPS: cada capa se poda directamente al 50 % minimizando su error de reconstrucción `||(W - W0) X||^2`, con matrices de Hessian calculadas a partir de secuencias de calibración de C4. La fase 2 es global: se ejecuta ADMM sobre la pérdida completa de entropía cruzada más destilación de conocimiento (KD), con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, Adam con beta2 0,95 y semilla 0.

Los datos de calibración son las 32.768 secuencias de C4 de 2.048 tokens que utiliza el código oficial de ELSA, tokenizadas con el tokenizador del propio modelo (`state-spaces_mamba-370m-hf`), cada una vista una sola vez. El entrenamiento completo, incluida la evaluación, tomó 2,71 horas en una única A100 de 40 GB. La sparsity medida sobre los pesos finales es de 0,5000, y el autor indica que un puñado de pesos conservados son exactamente cero, por lo que los recuentos de no-cero difieren como máximo en unas pocas unidades por fila (peor capa: ratio fila más densa / fila media de 1,00024x).

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Mamba-370M.
- Modelado de lenguaje y cálculo de perplejidad, evaluado sobre WikiText-2 y C4.
- Razonamiento zero-shot evaluado en tareas de lm-evaluation-harness (arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte, winogrande).
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM.from_pretrained(...)`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos SSM: este checkpoint permite reproducir y comparar pipelines de poda ADMM sobre Mamba, sirviendo de referencia para estudiar la degradación de perplejidad y precisión a distintos niveles de sparsity.
- Evaluación de técnicas de poda semi-estructurada: la estructura de filas con igual número de pesos conservados permite analizar la compatibilidad con kernels y aceleradores que explotan sparsity estructurada.
- Benchmarking de eficiencia memoria/calidad: útil para medir el trade-off entre tamaño del checkpoint (1,7 GB) y pérdida de rendimiento frente al modelo denso en tareas de lm-evaluation-harness.
- Prototipado de modelos de lenguaje ligeros: al ser un modelo de 423M parámetros, puede desplegarse en entornos con recursos limitados para experimentos de generación de texto, siempre que se valide la calidad frente al denso.
- Docencia y experimentación con arquitecturas SSM: sirve como ejemplo práctico de un modelo Mamba podado cargable con `transformers`.
- Estudio de destilación de conocimiento aplicada a poda: la fase 2 combina CE y KD, por lo que el checkpoint es útil para analizar el efecto de la KD en la retención de capacidades tras la poda.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, en bf16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (Mamba-370M) | 14,33 | 19,40 |
| Este modelo (50 % sparsity) | 18,60 | 22,37 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2517 | 0,2363 |
| arc_easy | 0,5484 | 0,5080 |
| boolq | 0,6150 | 0,5740 |
| hellaswag | 0,3722 | 0,3553 |
| openbookqa | 0,1960 | 0,1860 |
| rte | 0,5307 | 0,5271 |
| winogrande | 0,5588 | 0,5406 |
| Media | 0,4390 | 0,4182 |

Los resultados corresponden a una única ejecución. El autor indica que el registro completo de la ejecución y la configuración están en `results.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 1,7 GB en safetensors, por lo que en bf16 requiere aproximadamente esa cifra más overhead de activaciones y contexto.
- GPU recomendadas: el autor reporta que el entrenamiento y la evaluación se ejecutaron en una única A100 de 40 GB; para inferencia no se especifican GPU recomendadas.
- Compatibilidad con GPU de consumo: no disponible; por tamaño (423M parámetros) cabría en GPU de consumo, pero no se documenta ni se garantiza.
- Opciones de despliegue: carga mediante `transformers` con `AutoModelForCausalLM.from_pretrained(...)`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Nota de precisión: el autor advierte que Mamba desborda en fp16 y que la evaluación se realizó en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M podado 50 %) | 423.003.136 | no disponible | no disponible | Hugging Face (0 descargas) | Poda semi-estructurada EHWS; perplejidad WikiText-2 18,60 |
| state-spaces/mamba-370m-hf (denso) | no disponible en la información | no disponible | no disponible | Hugging Face | Modelo base; perplejidad WikiText-2 14,33; media zero-shot 0,4390 |
| Alternativas de poda de Mamba (ELSA y otras) | no disponible | no disponible | no disponible | no disponible | El autor cita el código oficial de ELSA como referencia metodológica, sin ofrecer comparativa numérica directa |

No se dispone de datos suficientes en la información proporcionada para comparar con otros modelos podados de la misma categoría.

## Limitaciones y advertencias

- Degradación de rendimiento respecto al denso: la perplejidad en WikiText-2 sube de 14,33 a 18,60 y en C4 de 19,40 a 22,37; la media zero-shot baja de 0,4390 a 0,4182.
- Resultados de una única ejecución (semilla 0), sin intervalos de confianza ni repeticiones, lo que limita la robustez estadística de las cifras.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; debe consultarse el repositorio y la licencia del modelo base.
- Idiomas no documentados: no hay información sobre capacidades multilingües.
- Longitud de contexto no documentada.
- Riesgo de alucinación: no evaluado en la información disponible; es un modelo de 423M parámetros, con la calidad limitada que ello implica.
- Sesgos: no documentados.
- Precisión numérica: el autor advierte que Mamba desborda en fp16; debe usarse bf16 para evitar inestabilidad.
- Popularidad nula: 0 descargas y 0 likes en el momento de la ficha, sin validación por parte de la comunidad.
- Naturaleza experimental: es un checkpoint de investigación sobre poda, no un modelo orientado a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-EHWS-50pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Código oficial de ELSA (citado por el autor como referencia metodológica): no disponible como enlace en la información proporcionada
- Paper, blog o demo adicionales: no disponible
