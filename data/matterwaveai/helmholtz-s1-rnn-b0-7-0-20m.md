# MatterWaveAI/helmholtz-s1-rnn-b0.7.0-20m

## Resumen

HELMHOLTZ-S1-RNN-b0.7.0-20m es un modelo recurrente compacto desarrollado por MatterWaveAI, publicado bajo licencia Apache 2.0 y orientado a tareas de clasificación de texto (pipeline `text-classification`). Se presenta como un "world-model judge", enrutador de acciones para control predictivo de modelos (MPC) y guardrail de automatismos de largo horizonte. Su arquitectura se basa en capas recurrentes de tipo GRU con formulaciones unitarias y rotacionales (Rotational-minGRU y Unitary-GRU), sin matrices densas lineales ni capas convolucionales, y con estado recurrente de memoria constante.

El modelo es la variante de 20M de la familia S1-GRT-RNN, construida sobre `MatterWaveAI/helmholtz-rnn-b0.7.0-20m`. Declara aproximadamente 26,4M de parámetros almacenados y una capacidad equivalente densa de unos 66M. Su propuesta diferencial es mantener un estado recurrente de 2,25 KB con coste O(1) en cómputo y memoria por evento, sin caché KV, lo que permite procesar secuencias de 128 a más de 8.192 pasos con estabilidad numérica (deriva de magnitud inferior a 5,0e-7 en 1.000 pasos).

Es relevante ahora por su enfoque en seguridad de agentes: emite veredictos APPROVE/REJECT/ESCALATE sobre acciones candidatas ramificando el estado recurrente en paralelo (lookahead latente de horizonte H=1..2), lo que lo sitúa como un componente de verificación de bajo coste en pipelines de agentes autónomos. La model card indica que los pesos, la implementación arquitectónica y el código fuente están retenidos durante el ciclo de publicación escalonado, por lo que el modelo no es descargable en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN con celdas GRU unitarias y rotacionales (Rotational-minGRU, Unitary-GRU); sin matrices densas lineales ni capas convolucionales 1D/2D |
| Parámetros totales | ~26,4M almacenados; ~66M de capacidad equivalente densa |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Secuencias de 128 a 8.192+ pasos con estado O(1); sin caché KV |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (pesos retenidos según la model card) |

## Arquitectura y entrenamiento

La arquitectura es un RNN puro con dos modos recurrentes: un modo de escaneo paralelizable basado en Rotational-minGRU (con paridad respecto a la recurrencia de paso O(1) inferior a 3,82e-6) y un modo no lineal acoplado al estado basado en Unitary-GRU. El estado recurrente ocupa 2,25 KB y se actualiza con coste O(1) por evento, lo que elimina la caché KV y permite memoria constante independientemente de la longitud de la secuencia. La estabilidad de largo horizonte se apoya en una formulación unitaria con determinante +1,000000, que limita la deriva de magnitud del estado homogéneo a menos de 5,0e-7 en más de 1.000 pasos (9,55e-15 a T=8.192 en float64).

El modelo se enmarca en el paradigma JEPA (Joint Embedding Predictive Architecture) como world model, y se describe como "System-1 judge" con capacidad de razonamiento multi-hop y verificación epistémica en cuatro modos (SEE/SAY/DO/KNOW). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican los detalles de implementación ni el código fuente, retenidos explícitamente para evitar la evasión del guardrail por caja blanca.

## Capacidades

- Clasificación de texto y emisión de veredictos de tres clases (APPROVE/REJECT/ESCALATE) sobre acciones candidatas de agentes.
- Verificación de rollouts relacionales multi-hop (2 a 3 saltos) con actualización de estado O(1).
- Verificación factual de un solo salto y de sentido común físico y científico.
- Verificación epistémica socrática en cuatro modos (SEE/SAY/DO/KNOW).
- Inducción de reglas en rejillas visuales-espaciales 2D (evaluado sobre ARC-AGI-2 en variante XL-smol).
- Enrutamiento de acciones para control predictivo de modelos con lookahead latente de horizonte H=1..2.
- Defensa frente a deriva y prompt injection en flujos de agentes.
- Seguimiento de autómatas con estado y ciclos de largo horizonte (T=64..8.192) sin caché KV.
- Calibración epistémica y abstención (capacidad de no responder).
- Verificación de terminación de bucles de programa y de transiciones de estado simbólico.
- No se documentan capacidades de generación de texto libre, código, matemáticas avanzadas, visión general, audio ni tool calling estándar.

## Casos de uso

- Guardrail de agentes autónomos: el modelo recibe el estado recurrente de la trayectoria del agente y emite APPROVE/REJECT/ESCALATE antes de ejecutar una acción, con coste O(1) por paso y sin crecimiento de memoria en sesiones largas.
- Defensa frente a prompt injection: al ramificar el estado latente sobre acciones candidatas, puede detectar desviaciones respecto al comportamiento esperado y bloquear comandos inyectados en el flujo del agente.
- Enrutador de acciones en MPC: integrado en un bucle de control predictivo, evalúa alternativas de acción con lookahead H=1..2 y selecciona la más consistente con el world model aprendido.
- Verificación de pipelines de datos y ETL: comprobación de transiciones de estado simbólico y de terminación de bucles en programas, útil para validar jobs automatizados antes de su ejecución.
- Monitorización de sesiones de largo horizonte: al mantener estado constante y estable durante 8.192 pasos, sirve para supervisar conversaciones o flujos de trabajo prolongados sin degradación numérica.
- Filtrado de contenido y consistencia factual en bases de conocimiento: verificación de hechos de un solo salto y de cadenas relacionales multi-hop antes de publicar respuestas.
- Evaluación de planes de agentes en entornos simulados: inducción de reglas sobre rejillas 2D para validar que una secuencia de acciones respeta las restricciones del entorno.
- Abstención calibrada en sistemas de decisión: cuando la confianza es baja, el modelo puede escalar el caso a revisión humana en lugar de emitir un veredicto.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a las suites internas XL-smol del autor, no a benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K). Se reproducen a continuación los agregados disponibles.

| Suite XL-smol | Registros | Preguntas | Precisión top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Rollout relacional multi-hop (2..3 saltos) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Ciencia causal y sentido común físico | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación factual de un salto | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación socrática 4 modos | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Inducción de reglas en rejilla 2D (ARC-AGI-2 XL-smol) | 600 | 1.800 (3.600 total) | 100,00% | 100,00% | 100,0% |
| Enrutamiento MPC y defensa ante prompt injection | 403 | 1.209 | 99,75% | 100,00% | 100,0% |
| Seguimiento de autómata de largo horizonte (T=64..8.192) | streaming | 8.192 pasos | 100,00% | 100,00% | 100,0% |
| Agregado 6 suites (macro/micro) | 5.003 | 11.009 (12.809 total) | 99,96% / 99,98% | 100,00% | 100,0% |

| Dominio (suite 12 dominios) | Registros | Precisión primaria | Precisión por pregunta | ECE |
|---|---|---|---|---|
| Rollouts relacionales multi-hop | 1.000 | 100,00% | 100,00% | 0,0883 |
| Ciencia causal y sentido común | 1.000 | 100,00% | 100,00% | 0,0206 |
| Verificación factual de un salto | 1.000 | 100,00% | 100,00% | 0,0190 |
| Verificación socrática 4 modos | 1.000 | 100,00% | 100,00% | 0,00002 |
| Inducción de reglas en rejilla 2D | 600 | 100,00% | 71,78% (98,44% elección) | 0,0035 |
| Enrutamiento MPC y deriva | 403 | 99,75% | 66,67% | 0,2904 |
| Calibración epistémica y abstención | 80 | 78,12% | 78,12% | 0,0764 |
| Terminación de bucles de programa | 150 | 74,00% | 74,00% | 0,0915 |
| Transiciones de estado simbólico | 60 | 73,33% | 73,33% | 0,0890 |
| Grafo de prerrequisitos (v5) | 2.777 | 72,85% | 72,85% | 0,0881 |
| Planificación de recursos y concurrencia | 60 | 71,67% | 71,67% | 0,0940 |
| Verificación booleana formal | 2.000 | 68,45% | 68,45% | 0,1042 |
| Agregado 12 dominios | 10.130 | 86% (truncado en la información disponible) | No disponible | No disponible |

No se han publicado resultados en benchmarks estándar de la comunidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: con ~26,4M de parámetros almacenados, los pesos en fp32 ocupan aproximadamente 106 MB; en fp16, unos 53 MB; en int8, unos 26 MB. El estado recurrente añade solo 2,25 KB por secuencia.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090 o incluso GPUs integradas pueden ejecutarlo.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en CPU.
- Opciones de despliegue: la librería declarada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos públicos no es posible verificar su funcionamiento en estos motores.
- Latencia y throughput: no disponibles. La arquitectura O(1) por paso sugiere latencia constante independiente de la longitud de secuencia, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones completas de alternativas que permitan una comparación rigurosa. Se incluye una comparación cualitativa limitada con el modelo hermano de la misma familia.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Pesos públicos |
|---|---|---|---|---|---|
| HELMHOLTZ-S1-RNN-b0.7.0-20m | RNN unitaria rotacional (GRU) | ~26,4M almacenados / ~66M equivalentes | 8.192+ pasos, estado O(1) | Apache 2.0 | No (retenidos) |
| HELMHOLTZ-Mamba-1 | SSM selectivo rotacional (Rotational-SSM) | No disponible | No disponible | No disponible | No disponible |
| HELMHOLTZ-RNN-b0.7.0-20m (modelo base) | RNN | 20M (por nombre) | No disponible | No disponible | No disponible |

No disponible para comparaciones con modelos de la comunidad (MMLU, HumanEval, GSM8K) al no haberse publicado resultados en esos benchmarks.

## Limitaciones y advertencias

- Pesos, implementación y código fuente retenidos: el modelo no es descargable ni reproducible en el momento de redactar esta ficha, lo que impide verificación independiente.
- Los benchmarks publicados son suites internas del autor (XL-smol), no benchmarks estándar de la comunidad; no son directamente comparables con MMLU, HumanEval o GSM8K.
- Riesgo de sobreajuste a las suites de evaluación propias: los resultados de 100,00% en varias suites deben interpretarse con cautela hasta que exista validación externa.
- Calibración desigual: el ECE en enrutamiento MPC es 0,2904 y en verificación booleana formal 0,1042, lo que indica confianza mal calibrada en esos dominios.
- Rendimiento limitado en tareas simbólicas y formales: 68,45% en verificación booleana y 71,67% en planificación de recursos, por debajo de lo deseable para producción crítica.
- Idiomas soportados no documentados; no hay evidencia de capacidades multilingües.
- No se documentan capacidades de generación de texto libre, código ni tool calling estándar; su uso está acotado a clasificación y veredictos.
- Riesgo de alucinación no evaluado en la información disponible.
- Sesgos conocidos no documentados.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos impide ejercerlo en la práctica.
- Al ser un guardrail, existe riesgo de evasión por caja blanca si los pesos se filtran; el autor lo reconoce al retener la implementación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-s1-rnn-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-rnn-b0.7.0-20m
- Familia S1-GRT-RNN: https://huggingface.co/MatterWaveAI/s1-grt-rnn
- Modelo hermano HELMHOLTZ-Mamba-1: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
