# ikimyaii/HGRN-340M-unstructured-ELSA-70pct

## Resumen

HGRN-340M-unstructured-ELSA-70pct es un modelo de lenguaje de 341 millones de parámetros obtenido al aplicar poda no estructurada al 70% sobre el checkpoint base m-a-p/340M-20B-HGRN-pure-baseline, un transformer con capas HGRN (Hierarchically Gated Recurrent Network, un tipo de atención lineal). Lo publica el usuario ikimyaii como baseline de referencia para su familia de modelos EHWS, empleando el código oficial de ELSA (paper arXiv:2510.01650). El objetivo no es ofrecer un modelo listo para producción, sino servir como punto de comparación reproducible de una técnica de poda concreta sobre una arquitectura concreta.

La poda es no estructurada: se aplica un único umbral de magnitud por capa, de modo que las filas resultantes tienen distinto número de ceros (la fila más densa tiene de media 1,96 veces los no-ceros de la fila media, y hasta 2,91 veces en la peor capa). Se podan todas las capas lineales dentro de los bloques; los embeddings y el lm_head permanecen densos. El resultado es un modelo que conserva la topología original pero con matrices dispersas, lo que exige hardware o kernels que exploten la dispersión para obtener ventajas reales de velocidad o memoria.

El interés del checkpoint es metodológico: documenta con precisión el protocolo de poda (4096 pasos ADMM, z-step cada 32 pasos, batch 1×8 con acumulación, lr 2e-4, lambda 0,01, bf16, 32.768 secuencias de C4 de 2.048 tokens, semilla 0), el coste (2,46 horas en una A100 de 40 GB) y el impacto medido en perplejidad y en tareas zero-shot. La degradación es sustancial: la perplejidad en WikiText-2 pasa de 21,96 a 39,64 y la media de siete tareas de lm-evaluation-harness cae de 0,4400 a 0,3964.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas HGRN (atención lineal recurrente con puertas jerárquicas) |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento de poda usó secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor reporta evaluación en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Dispersión | 70% no estructurada en capas lineales de los bloques (0,7000 medido) |
| Dependencia de carga | `flash-linear-attention` (`import fla`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base: un transformer de 340M parámetros cuyas capas de atención se sustituyen por HGRN, una familia de mecanismos de atención lineal con puertas jerárquicas que reduce el coste computacional frente a la atención cuadrática clásica. El nombre del checkpoint base (340M-20B) sugiere un entrenamiento sobre del orden de 20.000 millones de tokens, aunque la información disponible no detalla la composición del corpus ni si hubo fases de RLHF o DPO.

Sobre ese checkpoint se aplica ELSA con los hiperparámetros del run original de ELSA sobre HGRN-1.3B al 80%, sin modificarlos: 4096 pasos ADMM, paso z cada 32 pasos, batch de 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo y semilla 0. El proceso completo consume 2,46 horas en una A100 de 40 GB. Se podan las 168 capas lineales internas de los bloques con un umbral de magnitud por capa; embeddings y lm_head no se tocan. No se reporta ningún paso de recuperación (fine-tuning posterior a la poda), lo que explica en parte la caída de calidad observada.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje, con la calidad degradada que reflejan las métricas de perplejidad y zero-shot.
- Razonamiento básico y respuesta a preguntas en inglés, limitado por el tamaño de 340M parámetros y por la poda.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se especifican idiomas en la model card.
- No dispone de visión, audio ni modo de razonamiento extendido.
- Su función real es servir de baseline de investigación en poda, no de asistente de uso general.

## Casos de uso

- Investigación en poda de redes: el checkpoint permite reproducir y comparar el efecto de ELSA al 70% sobre HGRN-340M frente a otros métodos de compresión, gracias a que el protocolo completo está documentado con hiperparámetros exactos.
- Estudio de dispersión no estructurada: útil para analizar el desequilibrio entre filas (1,96× de media, 2,91× en la peor capa) y su impacto en kernels dispersos y en el rendimiento real.
- Baseline para la familia EHWS: el autor lo declara explícitamente como referencia contra la que medir sus modelos EHWS, de modo que encaja en pipelines internos de evaluación comparativa.
- Experimentos de eficiencia en hardware: sirve para medir si la dispersión no estructurada al 70% se traduce en ahorro real con bibliotecas que exploten sparse kernels, comparando con el checkpoint denso.
- Docencia y divulgación sobre compresión de modelos: un caso pequeño (341M), con métricas antes/después y coste de cómputo acotado (2,46 h en A100 40 GB), resulta adecuado para ilustrar el compromiso entre dispersión y calidad.
- Evaluación de pipelines de lm-evaluation-harness: al estar medido en siete tareas zero-shot, puede usarse como caso de prueba para validar configuraciones de evaluación sobre modelos con pesos dispersos.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16, ejecución única):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (70% sparsity) | 39,64 | 32,75 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2167 |
| arc_easy | 0,6153 | 0,4878 |
| boolq | 0,6028 | 0,5872 |
| hellaswag | 0,3423 | 0,3007 |
| openbookqa | 0,2380 | 0,1680 |
| rte | 0,5126 | 0,5235 |
| winogrande | 0,5059 | 0,4909 |
| Media | 0,4400 | 0,3964 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,4 GB en safetensors; en fp16 los pesos rondan 0,68 GB más overhead, y en bf16 el consumo es similar. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: para reproducir el entrenamiento de poda se usó una A100 de 40 GB. Para inferencia basta una RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con soporte bf16.
- Cabe en GPU consumer: sí, sin problema, dado el tamaño de 341M parámetros.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser pesos safetensors con capas HGRN, la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles. La dispersión no estructurada no produce aceleración automática salvo que el runtime use kernels dispersos específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HGRN-340M-unstructured-ELSA-70pct | 341M | no disponible | no disponible | Hugging Face (0 descargas) | Poda no estructurada al 70%, perplejidad WikiText-2 39,64 |
| m-a-p/340M-20B-HGRN-pure-baseline | 340M | no disponible | no disponible | Hugging Face | Checkpoint denso de partida; perplejidad WikiText-2 21,96, media zero-shot 0,4400 |
| HGRN-1.3B (referencia del paper ELSA) | 1.300M | no disponible | no disponible | Uso en el paper | Configuración de poda al 80% que sirvió de base para los hiperparámetros |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Degradación clara de calidad: la perplejidad en WikiText-2 casi se duplica (21,96 → 39,64) y la media zero-shot cae 4,36 puntos porcentuales.
- Sin fase de recuperación documentada tras la poda, lo que agrava la pérdida de capacidad frente a esquemas de poda con fine-tuning posterior.
- Dispersión no estructurada: no produce ahorro de memoria ni aceleración sin kernels dispersos; en GPUs convencionales el modelo puede ejecutarse a la velocidad de un denso de 340M.
- Riesgo de alucinación elevado por el tamaño reducido y por la propia poda; no apto para tareas factuales críticas.
- Idiomas soportados no especificados; probablemente centrado en inglés por el uso de C4, pero no está confirmado.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los términos del modelo base m-a-p/340M-20B-HGRN-pure-baseline.
- Evaluación de una sola ejecución (semilla 0), sin intervalos de confianza; la varianza de las métricas zero-shot en modelos de este tamaño puede ser apreciable.
- Requiere la biblioteca `flash-linear-attention`; sin ella la carga con `AutoModelForCausalLM` puede fallar.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-unstructured-ELSA-70pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Paper de ELSA: https://arxiv.org/abs/2510.01650
