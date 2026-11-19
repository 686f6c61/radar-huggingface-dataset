# ikimyaii/Transformer-1.3B-semi-structured-SparseGPT-80pct

## Resumen

Transformer-1.3B-semi-structured-SparseGPT-80pct es un modelo derivado de `fla-hub/transformer-1.3B-100B` al que se le ha aplicado una poda one-shot (sin reentrenamiento) del 80% con una variante propia del método SparseGPT. Lo publica el usuario `ikimyaii` como baseline para una familia de modelos denominada EHWS. El objetivo declarado no es ofrecer un modelo útil en producción, sino servir de referencia metodológica: una poda semi-estructurada con restricción por fila que garantiza que cada fila de cada capa podada mantiene exactamente el mismo número de pesos no nulos.

La relevancia del artefacto es fundamentalmente técnica: ilustra el coste de aplicar poda agresiva sin recuperación de rendimiento. El modelo base denso obtiene una perplejidad de 9,77 en WikiText-2 y 14,65 en C4; tras la poda al 80%, la perplejidad se dispara a 13.332,79 y 13.229,06 respectivamente, lo que lo sitúa en un régimen de degradación severa (dos órdenes de magnitud). La precisión zero-shot media cae de 0,4390 a 0,3222.

El modelo tiene 1.364.297.728 parámetros (1,3B), se distribuye en safetensors con un tamaño de repositorio de 2,7 GB y requiere `flash-linear-attention` (`import fla`) más `flash-attn` para cargarse. La licencia y los idiomas no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: fla-hub/transformer-1.3B-100B), con poda semi-estructurada al 80% en capas lineales internas a los bloques |
| Parametros totales | 1.364.297.728 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 según la model card) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `fla-hub/transformer-1.3B-100B`, un transformer de 1,3B parámetros, y le aplica una poda one-shot sin reentrenamiento posterior. La poda se ejecuta con el código oficial de `fasterprune` (implementación de SparseGPT) modificando únicamente la máscara: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de sus entradas más bajas según la métrica `w² / [H⁻¹]_jj²`, que es la regla N:M de SparseGPT con M igual al tamaño del bloque. El resultado es que cada fila de cada capa podada tiene exactamente el mismo número de no nulos, replicando la restricción de los modelos EHWS. Se podan todas las capas lineales internas a los bloques; embeddings y `lm_head` permanecen densos.

La calibración usa el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales. El recorrido de capas es código nuevo (los drivers oficiales solo cubren OPT y LLaMA), mientras que la matemática de poda es el código oficial. Los pesos se podan en bfloat16 y el proceso completo tarda 3,0 minutos en una A100 de 40 GB. La esparsidad medida sobre los pesos finales es de 0,7999, y se verificó que las 168 capas podadas tienen el mismo número de no nulos por fila, lo que equilibra perfectamente el trabajo por fila a nivel de hardware.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base denso, severamente degradada por la poda.
- Razonamiento y respuesta a preguntas de opción múltiple: funcional pero con caída notable de precisión (media zero-shot de 0,3222 frente a 0,4390 del denso).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Baseline de investigación en poda: sirve como referencia cuantitativa para comparar métodos de poda semi-estructurada (EHWS y variantes) bajo el mismo protocolo de evaluación de perplejidad y zero-shot. Es su propósito declarado por el autor.
- Estudio del colapso por poda agresiva: permite analizar empíricamente el punto en que la poda one-shot sin reentrenamiento destruye la capacidad del modelo (perplejidad de 13.332 en WikiText-2 frente a 9,77 del denso).
- Validación de kernels de esparsidad: al garantizar el mismo número de no nulos por fila en las 168 capas podadas, es útil para probar implementaciones de cómputo disperso con balanceo perfecto de carga por fila.
- Reproducibilidad de pipelines de poda: el modelo documenta el flujo completo (calibración con C4, poda por bloques en orden, bfloat16, 3 minutos en A100 40GB), lo que facilita replicar el experimento.
- Comparación de protocolos de evaluación: útil para contrastar la métrica de perplejidad de ELSA con la precisión zero-shot de `lm-evaluation-harness` sobre el mismo artefacto.
- Docencia y divulgación: ejemplo concreto de por qué la poda sin recuperación (retraining o destilación) no es viable para despliegue real, con cifras medibles.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fórmula propia, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 9,77 | 14,65 |
| Este modelo | 13.332,79 | 13.229,06 |

Precisión zero-shot con `lm-evaluation-harness`:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2355 | 0,1954 |
| arc_easy | 0,5602 | 0,2723 |
| boolq | 0,6199 | 0,3875 |
| hellaswag | 0,3848 | 0,2633 |
| openbookqa | 0,2120 | 0,1540 |
| rte | 0,5126 | 0,5126 |
| winogrande | 0,5478 | 0,4704 |
| **media** | **0,4390** | **0,3222** |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1,3B parámetros en bfloat16, los pesos ocupan aproximadamente 2,7 GB; con caché KV y overhead de runtime, el consumo se sitúa en torno a 3-4 GB para contextos cortos (estimación, no dato publicado).
- GPU recomendadas: el autor reporta que la poda se ejecutó en una A100 de 40 GB, pero la inferencia del modelo resultante cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090), así como en CPU con cuantización.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`) y `flash-attn`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; dado el formato safetensors y la dependencia de `fla`, el despliegue estándar requiere el stack de Hugging Face con esas dependencias.
- Latencia y throughput: no disponibles. La esparsidad por fila equilibrada facilita el uso de kernels dispersos, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (80% poda) | 1,3B | No disponible | 13.332,79 | No disponible | Hugging Face |
| fla-hub/transformer-1.3B-100B (denso) | 1,3B | No disponible | 9,77 | No disponible | Hugging Face |
| SparseGPT original sobre el mismo base | 1,3B | No disponible | No disponible | No disponible | No publicado en esta información |

La comparación más directa es contra su propio modelo base denso, incluida en la model card. No se dispone de datos de otras variantes de poda (EHWS u otras) sobre el mismo base en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa: la perplejidad en WikiText-2 pasa de 9,77 a 13.332,79 y en C4 de 14,65 a 13.229,06. El modelo no es apto para uso en producción.
- Caída de precisión zero-shot: la media baja de 0,4390 a 0,3222, con desplomes en arc_easy (0,5602 a 0,2723) y boolq (0,6199 a 0,3875).
- Poda sin reentrenamiento: no se aplicó recuperación posterior (retraining, destilación), por lo que la pérdida de capacidad es estructural.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe consultarse la licencia del modelo base `fla-hub/transformer-1.3B-100B` antes de cualquier uso.
- Idiomas no declarados: no hay información sobre cobertura lingüística; se hereda la del modelo base, no documentada aquí.
- Dependencias frágiles: requiere `flash-linear-attention` y `flash-attn` para cargarse; sin ellas la carga falla.
- Riesgo de alucinación: elevado por la degradación del modelo; no se han publicado evaluaciones específicas de factualidad.
- Sesgos: no documentados en la información disponible; se heredan los del corpus de entrenamiento del modelo base.
- Contexto máximo: no disponible; no debe asumirse una ventana larga sin verificar la del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Transformer-1.3B-semi-structured-SparseGPT-80pct
- Modelo base: https://huggingface.co/fla-hub/transformer-1.3B-100B
