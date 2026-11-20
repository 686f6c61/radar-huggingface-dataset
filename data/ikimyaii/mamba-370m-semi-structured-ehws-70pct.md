# ikimyaii/Mamba-370M-semi-structured-EHWS-70pct

## Resumen

Mamba-370M-semi-structured-EHWS-70pct es una variante podada del modelo de espacio de estados Mamba-370M, publicado por el usuario ikimyaii en Hugging Face. El modelo parte de `state-spaces/mamba-370m-hf` y aplica una poda semi-estructurada del 70 % sobre todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`), manteniendo densas las proyecciones `dt_proj`, las convoluciones `conv1d`, los parámetros `A_log` y `D`, así como los embeddings y la cabeza de lenguaje. El resultado es un checkpoint de 423.003.136 parámetros que se carga con `transformers` estándar mediante `AutoModelForCausalLM`.

El interés técnico reside en el método de poda: una primera fase local de tipo ALPS que minimiza el error de reconstrucción capa a capa usando hessianos calculados sobre secuencias de calibración de C4, seguida de una fase global basada en ADMM que optimiza la pérdida de entropía cruzada más destilación de conocimiento sobre el modelo completo. Todo el proceso se completó en 2,63 horas sobre una única A100 de 40 GB, lo que lo convierte en un ejemplo reproducible de compresión agresiva sobre arquitecturas no transformer.

La relevancia práctica es doble: por un lado, demuestra que la poda semi-estructurada con ADMM es viable sobre modelos de espacio de estados; por otro, cuantifica con precisión el coste en calidad. La perplejidad en WikiText-2 pasa de 14,33 a 28,92 y en C4 de 19,40 a 29,59, mientras que la media de precisión zero-shot cae de 0,4390 a 0,3978. Es, por tanto, un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parámetros totales | 423.003.136 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | state-spaces/mamba-370m-hf |
| Sparsity medida | 0,7002 en las capas podadas |
| Tamaño del repo | 1,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atención por recurrencias con parámetros dependientes de la entrada. Sobre esa base, este checkpoint aplica una poda semi-estructurada: cada fila de cada capa lineal podada conserva exactamente el 30 % de sus pesos (los de mayor magnitud), de modo que la densidad es uniforme por fila (la peor capa presenta una ratio fila más densa / fila media de 1,00024). Las capas afectadas son `in_proj`, `x_proj` y `out_proj` de cada bloque; `dt_proj` se mantiene densa (aproximadamente el 2 % de los pesos lineales de cada bloque), igual que `conv1d`, `A_log`, `D`, los embeddings y `lm_head`.

El entrenamiento de poda sigue dos fases. La fase 1 es local, estilo ALPS: cada capa se poda directamente al 70 % minimizando el error de reconstrucción `||(W - W0) X||^2`, con hessianos estimados a partir de secuencias de calibración de C4. La fase 2 es global: ADMM sobre la pérdida de entropía cruzada del modelo completo más destilación de conocimiento, con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, beta2 de Adam 0,95 y semilla 0. Los datos son las 32.768 secuencias de entrenamiento de C4 de 2.048 tokens empleadas por el código oficial de ELSA, tokenizadas con el tokenizador del propio modelo y vistas una sola vez. La ejecución completa, incluida la evaluación, requirió 2,63 horas en una A100 de 40 GB.

## Capacidades

- Generación de texto autoregresiva mediante el pipeline estándar de `transformers` (`AutoModelForCausalLM`).
- Razonamiento de lenguaje natural y respuesta a preguntas zero-shot, evaluado en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Modelado de lenguaje y cálculo de perplejidad sobre WikiText-2 y C4.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas; el modelo base se entrenó presumiblemente sobre corpus mayoritariamente inglés, pero la información disponible no lo confirma.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- No se documenta una ventana de contexto concreta para este checkpoint.

## Casos de uso

- Investigación sobre compresión de modelos SSM: sirve como referencia reproducible para comparar técnicas de poda semi-estructurada (ALPS + ADMM) frente a alternativas como SparseGPT o Wanda sobre arquitecturas no transformer.
- Evaluación de la degradación calidad-tamaño: permite medir empíricamente el coste de pasar de 14,33 a 28,92 de perplejidad en WikiText-2 y trazar curvas de compensación para decidir umbrales de sparsity aceptables.
- Prototipado de inferencia de bajo coste en entornos de investigación: con 423 M de parámetros y sparsity del 70 %, es un candidato para experimentar con kernels dispersos y medir speedups reales frente al modelo denso.
- Docencia y divulgación: ilustra de forma completa el flujo de poda en dos fases (calibración local con hessianos, optimización global con ADMM y destilación) sobre un modelo pequeño y entrenable en una sola GPU.
- Baseline para destilación: al conservar la arquitectura y el tokenizador del Mamba-370M original, puede emplearse como alumno en pipelines de destilación desde modelos mayores.
- Pruebas de integración con `transformers`: valida que checkpoints podados de Mamba se cargan y ejecutan sin modificaciones en la librería, útil para desarrolladores que mantienen tooling de serialización.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, en bf16 porque Mamba desborda en fp16; ejecución única):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Mamba-370M denso | 14,33 | 19,40 |
| Este modelo (70 % sparsity) | 28,92 | 29,59 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2517 | 0,2312 |
| arc_easy | 0,5484 | 0,4407 |
| boolq | 0,6150 | 0,5682 |
| hellaswag | 0,3722 | 0,3178 |
| openbookqa | 0,1960 | 0,1720 |
| rte | 0,5307 | 0,5271 |
| winogrande | 0,5588 | 0,5280 |
| Media | 0,4390 | 0,3978 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,85 GB solo para pesos (423 M de parámetros × 2 bytes), más overhead de activaciones y caché; un presupuesto realista de 2-4 GB cubre la mayoría de escenarios.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento o evaluación a gran escala se usó una A100 de 40 GB.
- Cabe holgadamente en GPU consumer; también es viable en CPU para inferencia puntual, aunque con mayor latencia.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint; dado que la sparsity es semi-estructurada y no se publican kernels dispersos, el beneficio de velocidad frente al denso no está garantizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Perplejidad WikiText-2 | Notas |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M 70 % EHWS) | 423 M | no disponible | no disponible | 28,92 | Poda semi-estructurada, safetensors |
| state-spaces/mamba-370m-hf (denso) | ~370 M | no disponible | no disponible | 14,33 | Modelo base sin podar |
| Alternativas podadas de la misma familia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La única comparación con datos verificables es contra el modelo denso del que deriva; no se han encontrado en la información proporcionada otros checkpoints podados de Mamba-370M con los que contrastar.

## Limitaciones y advertencias

- Degradación sustancial de calidad: la perplejidad en WikiText-2 se duplica (14,33 → 28,92) y la precisión media zero-shot cae más de cuatro puntos (0,4390 → 0,3978), con caídas especialmente acusadas en arc_easy (0,5484 → 0,4407) y hellaswag (0,3722 → 0,3178).
- La licencia no está declarada en la información disponible; no puede asumirse uso comercial sin verificar la licencia del modelo base `state-spaces/mamba-370m-hf`.
- Los resultados provienen de una única ejecución (semilla 0), sin intervalos de confianza ni réplicas, lo que limita la robustez de las conclusiones.
- La evaluación se realizó en bf16 porque Mamba desborda en fp16; usar fp16 en producción puede producir inestabilidad numérica.
- La sparsity es semi-estructurada pero no se publican kernels ni artefactos que garanticen aceleración real; el ahorro de memoria es seguro, el de cómputo no está demostrado.
- Riesgo de alucinación inherente a un modelo de 370 M de parámetros con conocimiento limitado; no apto para tareas de alta fiabilidad sin verificación.
- No se documentan sesgos específicos, pero al entrenarse sobre C4 (corpus web en inglés) hereda los sesgos de esa fuente.
- No se documenta la longitud de contexto soportada para este checkpoint, lo que impide planificar su uso en tareas de contexto largo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-EHWS-70pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Repositorio de Mamba (state-spaces): no disponible en la información proporcionada
- Paper de Mamba: no disponible en la información proporcionada
- Código oficial de ELSA (referenciado en la model card): no disponible en la información proporcionada
- Archivo de resultados del run (`results.json`): incluido en el repositorio del modelo
