# Matt-94/FS-SSA-LM-100M

## Resumen

FS-SSA-LM-100M (publicado en la model card como FS-SSA-GPT-100M) es un modelo de lenguaje causal autorregresivo de 93,9 millones de parámetros desarrollado por el usuario Matt-94, que sustituye la atención Softmax densa por un mecanismo de Softmax-Free Spiking Self-Attention (FS-SSA) con latencia temporal de K=2 pasos. El objetivo es demostrar que es posible acercarse al rendimiento de un transformer denso equivalente reemplazando multiplicaciones-acumulaciones (MAC) en coma flotante por sumas sinápticas dispersas de eventos discretos, un régimen propio del hardware neuromórfico.

El modelo se entrena desde cero sobre aproximadamente 655 millones de tokens del dataset FineWeb-Edu, con 16 capas, dimensión oculta de 576, 9 cabezas de atención y una longitud de secuencia de 1024 tokens. La model card reporta una pérdida de validación de 3,6147 nats (perplejidad 37,14) frente a 3,5399 nats (perplejidad 34,46) de un baseline denso con cómputo equivalente, lo que supone una brecha relativa del 7,8 %.

Su relevancia actual es principalmente de investigación: es un experimento reproducible sobre eficiencia energética y cómputo event-driven en modelos de lenguaje, con código fuente y DOI públicos, pero sin adopción (0 descargas) y sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni proceso de alineamiento documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autorregresivo con Softmax-Free Spiking Self-Attention (FS-SSA); atención lineal sin Softmax con decaimiento geométrico por cabeza |
| Parametros totales | 93.884.544 (~93,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 1,8 GB; la model card no especifica el formato) |

Datos adicionales declarados en la model card: 16 capas, dimensión oculta 576, 9 cabezas de atención, vocabulario de 50.257 tokens (tokenizer BPE de GPT-2), latencia temporal K=2, codificación de spikes bipolar ternaria (+-), escalera geométrica causal por cabeza con gamma en [0,875; 0,999] y tasa de disparo sostenida de ~13,1 %.

## Arquitectura y entrenamiento

La innovación principal es la sustitución de la atención Softmax cuadrática en coma flotante por Softmax-Free Spiking Self-Attention, que opera con pares de spikes bipolares ternarios (+-) durante K=2 pasos temporales. En lugar de MAC densas, el mecanismo acumula sumas sinápticas dispersas (AC/SOP) sobre eventos, lo que reduce el número de operaciones efectivas al 13,1 % de disparo sostenido. Cada cabeza de atención aplica un factor de decaimiento geométrico causal en el rango gamma ∈ [0,875; 0,999], lo que aproxima un comportamiento de memoria decreciente sin normalización Softmax. La model card menciona también la etiqueta "linear-attention", coherente con un coste de atención lineal en la longitud de secuencia.

El entrenamiento se realizó desde cero sobre ~655 millones de tokens de FineWeb-Edu, durante 10.000 pasos con batch efectivo de 64 secuencias (65.536 tokens por paso), lo que sitúa el cómputo total en aproximadamente 655 M de tokens vistos. Los resultados reportados se comparan contra un baseline denso de cómputo equivalente entrenado con FP16, Softmax y activación GELU: pérdida de validación 3,5399 nats (PPL 34,46) frente a 3,6147 nats (PPL 37,14) del modelo verificado con FS-SSA, y 3,6228 nats (PPL 37,44) en la variante conservadora. No se documenta en la información disponible ningún proceso de RLHF, DPO, SFT ni ajuste de instrucciones.

## Capacidades

- Generación de texto causal autorregresiva en inglés: continuación de secuencias, modelado de lenguaje y cálculo de perplejidad.
- Modelado de lenguaje de dominio educativo, dado que el corpus de entrenamiento es FineWeb-Edu.
- Inferencia en régimen event-driven con spikes ternarios y K=2 pasos temporales, orientada a escenarios de baja latencia y bajo consumo energético.
- Razonamiento, matemáticas, generación de código, tool calling, function calling y uso como agente: no documentados en la información disponible.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.
- Capacidades multimodales (visión, audio), modo de razonamiento explícito (thinking) o decodificación especulativa: no disponibles.

## Casos de uso

- Investigación en redes neuronales de spikes (SNN): reproducción de los experimentos del paper y del repositorio para estudiar la brecha de calidad entre atención Softmax densa y atención spiking sin Softmax con cómputo equivalente.
- Evaluación de eficiencia energética: medir sumas sinápticas (AC/SOP) frente a MAC en hardware neuromórfico o simuladores de spike, aprovechando la tasa de disparo del 13,1 % como métrica de dispersión.
- Modelado de lenguaje de dominio educativo: cálculo de perplejidad y continuación de texto sobre corpus académicos en inglés, con secuencias de hasta 1024 tokens.
- Prototipado en entornos con restricciones de memoria: con 93,9 M de parámetros, el modelo cabe holgadamente en GPU de gama de entrada o incluso en CPU, lo que permite experimentar sin infraestructura dedicada.
- Base para ablaciones de atención lineal: al publicar una escalera de decaimiento gamma por cabeza, sirve como punto de partida para estudiar el efecto de distintos rangos de decaimiento en la calidad del modelo.
- Docencia y divulgación sobre arquitecturas alternativas al transformer denso: el repositorio y los DOI permiten reproducir el pipeline completo de entrenamiento con 655 M de tokens.
- Componente de bajo consumo en pipelines de generación de texto embebidos: siempre que se disponga de kernels compatibles con la atención FS-SSA (véase la sección de limitaciones).

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son la pérdida de validación y la perplejidad sobre FineWeb-Edu, comparados con un control denso entrenado con el mismo presupuesto de cómputo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otros) en la información disponible.

| Arquitectura | Precisión / atención | Mejor val loss | Mejor PPL | Δ Loss (vs denso) |
|---|---|---|---|---|
| Control denso | FP16 / Softmax + GELU | 3,5399 | 34,46 | REF (control) |
| FS-SSA-GPT-100M (verificado) | Discreto K=2 / sin Softmax | 3,6147 | 37,14 | +0,0748 nats (+2,68 PPL) |
| FS-SSA-GPT-100M (conservador) | Discreto K=2 / sin Softmax | 3,6228 | 37,44 | +0,0829 nats (+2,98 PPL) |

Según el autor, la brecha relativa frente al transformer denso equiparado en cómputo es del 7,8 %. No se dispone de mediciones de latencia, throughput ni consumo energético reales más allá de la tasa de disparo declarada.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: ~376 MB en FP32, ~188 MB en FP16/BF16, ~94 MB en INT8 y ~47 MB en INT4 (cálculo aritmético a partir de los 93,9 M de parámetros; la model card no publica cifras de VRAM).
- Memoria de contexto: si la implementación mantiene un estado recurrente por el decaimiento geométrico, el coste sería constante por token; una caché KV convencional para 1024 tokens con 16 capas y 9 cabezas de dimensión 64 ocuparía del orden de 38 MB en FP16. La model card no especifica cuál de los dos regímenes aplica.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente por tamaño; no hay GPU recomendada oficialmente en la documentación disponible.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU, dado el reducido número de parámetros.
- Opciones de despliegue: no disponibles. Al tratarse de una atención sin Softmax con spikes discretos, los runtimes estándar (vLLM, llama.cpp, Ollama, TGI, Transformers) probablemente no implementan estas capas de serie; el repositorio de GitHub es la única vía de ejecución documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables entre estos modelos dentro de la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Idioma | Disponibilidad |
|---|---|---|---|---|---|
| FS-SSA-LM-100M | ~93,9 M | 1024 | Apache-2.0 | en | HuggingFace (0 descargas), código en GitHub |
| GPT-2 (150M) | ~124 M | 1024 | Licencia MIT modificada | en | HuggingFace, ampliamente soportado |
| Pythia-160M | ~162 M | 2048 | Apache-2.0 | en | HuggingFace, EleutherAI |
| SmolLM-135M | ~135 M | 2048 | Apache-2.0 | en | HuggingFace, HuggingFaceTB |

Rendimiento comparado: no disponible. La model card solo publica perplejidad sobre FineWeb-Edu frente a su propio baseline denso, no frente a terceros.

## Limitaciones y advertencias

- Modelo muy poco entrenado en términos relativos: 655 M de tokens para 93,9 M de parámetros está por debajo del óptimo tipo Chinchilla (del orden de 1.900 M de tokens), lo que limita la calidad de generación.
- Idiomas: únicamente inglés; no hay soporte multilingüe ni evaluación en castellano.
- Longitud de contexto reducida (1024 tokens), sin técnicas de extensión de contexto documentadas.
- Sin alineamiento: no se documenta RLHF, DPO, SFT ni filtros de seguridad, por lo que puede reproducir sesgos y contenido tóxico presentes en FineWeb-Edu.
- Riesgo de alucinación elevado y no medido: no hay evaluaciones de veracidad ni de tasas de alucinación.
- Brecha de calidad verificada frente al baseline denso: +0,0748 nats de pérdida de validación (7,8 % relativo), que se traduce en mayor perplejidad.
- Compatibilidad de despliegue: al no usar Softmax denso, es probable que requiera kernels y código propios del repositorio; no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados.
- Valor del hardware neuromórfico no verificado: la model card declara una tasa de disparo del 13,1 %, pero no se aportan mediciones de energía o latencia en hardware real.
- Inconsistencias de nomenclatura y metadatos: el repositorio se llama FS-SSA-LM-100M mientras que la model card se titula FS-SSA-GPT-100M; además aparecen dos DOI distintos (10.5281/zenodo.22702448 en el badge y 10.5281/zenodo.22950217 en el cuerpo del texto), lo que conviene verificar antes de citar.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.

## Enlaces

- HuggingFace: https://huggingface.co/Matt-94/FS-SSA-LM-100M
- Repositorio de código (GitHub): https://github.com/LRMTV94/FS-SSA-LM-100M
- DOI (cuerpo de la model card): https://doi.org/10.5281/zenodo.22950217
- DOI (badge de la model card): https://doi.org/10.5281/zenodo.22702448
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper asociado: no disponible
- Demo o espacio de inferencia: no disponible
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados obtenidos correspondían a dominios no relacionados).
