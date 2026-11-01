# rikkathree/vsa-llama-3.2-1b

## Resumen

VSA-Llama-3.2-1B es un modelo de lenguaje de 1.240 millones de parametros derivado de `meta-llama/Llama-3.2-1B` mediante un transplante arquitectonico quirurgico realizado por el autor independiente rikkathree. La modificacion sustituye 12 de las 16 capas de atencion softmax del modelo original (el 75%) por capas de atencion lineal con estado fijo recurrente (VSA, Fixed-State Decayed Linear Attention), manteniendo atencion GQA softmax convencional unicamente en los bloques 3, 7, 11 y 15. El resultado es una arquitectura hibrida que combina recurrencia lineal con atencion cuadratica clasica.

El problema que aborda es el crecimiento lineal de la memoria de la cache KV con la longitud de contexto, que encarece el despliegue de modelos en ventanas largas. Al reemplazar la mayoria de las capas por un estado matricial recurrente de tamano constante (64x64 por cabeza), el modelo reduce el crecimiento de la cache KV en un 74,9% de forma sostenida y acelera la decodificacion hasta 2,43x a 65.536 tokens de contexto. Ademas, la linealidad estricta del estado VSA permite editar memoria de forma algebraica exacta (operaciones `memorize` y `forget`) con error residual inferior a 1e-5.

El modelo es relevante como prueba de concepto de cirugia arquitectonica sobre pesos preentrenados: demuestra que es posible reconvertir un transformer denso en un hibrido lineal sin reentrenar desde cero, a costa de una degradacion medible de calidad (perplejidad 1,213x superior y retencion del 79,7% en HellaSwag). Su licencia MIT y su tamano de 1B lo hacen accesible para experimentacion en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 12 capas de atencion lineal VSA con estado fijo (64x64 por cabeza) + 4 capas de atencion GQA softmax |
| Parametros totales | 1.240 millones (heredados de Llama-3.2-1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada de Llama-3.2-1B); benchmarks publicados hasta 65.536 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es bfloat16 en `.pth`) |
| Idiomas soportados | no disponible (heredados del modelo base Llama-3.2-1B; sin evaluacion especifica) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint PyTorch con `config` y `model` en un diccionario); no hay safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

La arquitectura parte de Llama-3.2-1B (transformer decoder-only con 16 capas, GQA 4:1 con 32 cabezas de query y 8 de key/value, y RoPE). La intervencion reemplaza las capas de atencion de 12 bloques por capas VSA: cada cabeza mantiene una matriz de estado `M_t = gamma * M_{t-1} + k_t (x) v_t` de 64x64 elementos, con lectura escalada por `(1 - gamma)`. Para compensar la atencion local atenuada por ese factor, se anade una convolucion causal local de 8 taps y un "positive feature sharpener" que evita la cancelacion por productos escalares negativos. Ademas se introduce un desacoplamiento de las cabezas GQA (`k_head_mix`, `v_head_mix`) con mezcladores de subespacio 64x64 por cabeza, de modo que las 32 cabezas de query mantienen estados independientes pese a compartir originalmente solo 8 cabezas KV.

No se especifica en la informacion disponible el volumen de tokens de reentrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La unica senal de entrenamiento es la comparacion de perplejidad sobre FineWeb-Edu a 64k tokens (12,99 en el original frente a 15,76 en el hibrido), que sugiere un ajuste de recuperacion sobre el modelo base mas que un preentrenamiento completo. La innovacion tecnica central es la edicion algebraica de memoria: al ser el estado VSA estrictamente lineal en los productos externos key-value, se puede sustraer la traza de un documento memorizado con error residual inferior a 1e-5, algo imposible en atencion softmax.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma dominante del modelo base), con decodificacion token a token mediante `lm_head`.
- Razonamiento basico y respuesta a preguntas de sentido comun, con retencion parcial respecto al original (97,1% en ARC-Easy, 95,0% en PIQA, 79,7% en HellaSwag).
- Edicion exacta de memoria: operaciones `memorize` y `forget` sobre el estado recurrente para insertar o eliminar trazas documentales de forma algebraica.
- Contexto largo efectivo: el estado fijo evita el crecimiento de la cache KV, permitiendo decodificar a 65.536 tokens con 515 MB de cache frente a 2.048 MB del original.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues no evaluadas; se asumen las del modelo base sin garantia.

## Casos de uso

- Despliegue en ventanas de contexto muy largas con memoria acotada: el estado fijo de 64x64 por cabeza mantiene la cache KV en 515 MB a 65.536 tokens (frente a 2.048 MB del Llama-3.2-1B original), lo que permite servir documentos extensos en GPUs con VRAM limitada.
- Generacion de resumenes de documentos largos en streaming: la decodificacion sostenida a ~125-150 tok/s incluso a 64k tokens evita la degradacion de throughput tipica de la atencion softmax y hace viable el procesamiento por lotes de contratos o informes.
- Edicion selectiva de conocimiento en bases documentales: la operacion `forget` permite eliminar la traza de un documento memorizado sin reentrenar, util para cumplimiento de olvido (RGPD) o retirada de contenido obsoleto en asistentes corporativos.
- Investigacion en arquitecturas hibridas: sirve como banco de pruebas reproducible para medir el impacto de sustituir capas softmax por recurrentes lineales sobre pesos preentrenados, con harness de evaluacion publicado.
- Prototipado de asistentes conversacionales de bajo coste: con 1.240 millones de parametros en bfloat16 (unos 2,5 GB de pesos) cabe en GPUs de consumo de 8 GB o mas, permitiendo iteracion rapida en entornos de desarrollo.
- Aplicaciones de retrieval aumentado (RAG) con historial largo: la cache KV acotada reduce el coste por sesion cuando se concatenan muchos fragmentos recuperados en el prompt, y la latencia se mantiene estable al crecer el contexto.
- Experimentacion con decodificacion especulativa y edicion de estado: la linealidad del estado VSA facilita tecnicas de intervencion sobre la memoria interna sin reentrenamiento, aplicables a estudios de interpretabilidad.

## Benchmarks y rendimiento

Calidad y evaluacion zero-shot (mismo harness, bfloat16):

| Metrica / Benchmark | Llama-3.2-1B (16 softmax) | VSA-Llama-3.2-1B (12 VSA + 4 softmax) | Retencion |
|---|---:|---:|---|
| Perplejidad FineWeb-Edu a 64k | 12,99 (1,000x) | 15,76 (1,213x) | Pasa el umbral G5 (<= 1,25x) |
| Acuerdo top-1 siguiente token | 100,0% | 75,5% | Divergencia KL de 0,300 nats |
| ARC-Easy (zero-shot) | 66,3% | 64,4% | 97,1% retenido |
| PIQA (zero-shot) | 75,6% | 71,8% | 95,0% retenido |
| HellaSwag (zero-shot) | 65,5% | 52,2% | 79,7% retenido |

Velocidad de decodificacion y escalado de cache:

| Longitud de contexto | Velocidad Llama-3.2-1B | Velocidad VSA-Llama-3.2-1B | Aceleracion | Cache Llama-3.2-1B | Cache VSA-Llama-3.2-1B | RAM ahorrada |
|---:|---:|---:|---:|---:|---:|---:|
| 512 | 148,4 tok/s | 149,2 tok/s | 1,01x | 16,00 MB | 7,00 MB | 56,2% |
| 2.048 | 163,5 tok/s | 148,8 tok/s | 0,91x | 64,00 MB | 19,00 MB | 70,3% |
| 8.192 | 148,9 tok/s | 148,8 tok/s | 1,00x | 256,00 MB | 67,00 MB | 73,8% |
| 16.384 | 138,8 tok/s | 149,2 tok/s | 1,08x | 512,00 MB | 131,00 MB | 74,4% |
| 32.768 | 85,5 tok/s | 149,7 tok/s | 1,75x | 1.024,00 MB | 259,00 MB | 74,7% |
| 65.536 | 51,4 tok/s | 124,7 tok/s | 2,43x | 2.048,00 MB | 515,00 MB | 74,9% |

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 2,5 GB (1.240 millones de parametros), mas el estado recurrente de 12 capas x 32 cabezas x 64x64 en bfloat16 (unos 6,3 MB) y la cache KV de las 4 capas softmax restantes.
- VRAM estimada para inferencia: entre 4 y 6 GB en bfloat16 contando pesos, cache y activaciones; el modelo cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- GPU recomendadas para produccion: A100 40/80 GB, H100 y L40S para lotes grandes; RTX 4090 para desarrollo y prototipado.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que las capas VSA requieren el codigo del repositorio `vsa-lm` y el checkpoint `.pth` cargado con `LlamaVSALM`. El autor documenta inferencia manual con PyTorch y autocast en bfloat16.
- Throughput estimado: ~149 tok/s de forma estable hasta 16k tokens y ~125 tok/s a 65.536 tokens, segun los datos del autor; a contextos cortos el rendimiento es practicamente identico al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento destacado |
|---|---:|---|---|---|---|
| VSA-Llama-3.2-1B | 1.240 M | 131.072 (evaluado a 65.536) | MIT | `.pth` (PyTorch) | 64,4% ARC-Easy, 71,8% PIQA, 52,2% HellaSwag; cache 515 MB a 65k |
| meta-llama/Llama-3.2-1B | 1.240 M | 131.072 | Llama 3.2 Community License | safetensors | 66,3% ARC-Easy, 75,6% PIQA, 65,5% HellaSwag; cache 2.048 MB a 65k |
| Qwen2.5-1.5B | 1.540 M | 32.768 (128k en variantes) | Apache 2.0 | safetensors, GGUF | Benchmark no comparable en esta ficha; mayor contexto nativo en variantes largas |
| SmolLM2-1.7B | 1.700 M | 8.192 (ampliable) | Apache 2.0 | safetensors, GGUF | Modelo pequeno de referencia de Hugging Face, sin datos cruzados en esta ficha |

La comparacion directa con Llama-3.2-1B es la mas fiable porque comparte pesos y harness. Frente a alternativas como Qwen2.5-1.5B o SmolLM2-1.7B, VSA-Llama-3.2-1B ofrece la ventaja de la cache acotada y la edicion de memoria, pero pierde en calidad bruta y carece de ecosistema de despliegue (no hay GGUF ni integracion en vLLM).

## Limitaciones y advertencias

- Degradacion de calidad medible: perplejidad 1,213x superior al original y retencion del 79,7% en HellaSwag, con solo 75,5% de acuerdo top-1 en el siguiente token.
- La licencia MIT del modelo derivado no elimina las obligaciones de la licencia original de Llama 3.2; conviene revisar la compatibilidad para uso comercial del modelo base.
- No hay pesos en safetensors ni GGUF: el despliegue exige cargar el `.pth` con `weights_only=False`, lo que implica riesgo de seguridad si el archivo no es de confianza.
- Dependencia de un repositorio externo (`vsa-lm`) y de codigo personalizado; no hay soporte en frameworks de inferencia estandar, lo que complica el paso a produccion.
- Riesgo de alucinacion heredado del modelo base y potencialmente agravado por la perdida de capacidad en tareas de sentido comun (HellaSwag cae 13,3 puntos).
- Idiomas no evaluados: aunque el modelo base es multilingue, no hay datos que confirmen el rendimiento en castellano ni en otros idiomas.
- La edicion de memoria algebraica, aunque precisa (error < 1e-5), solo opera sobre las 12 capas VSA; las 4 capas softmax restantes siguen reteniendo informacion en su cache KV.
- Modelo con 115 descargas y 0 likes en el momento de la ficha: ecosistema practicamente inexistente, sin garantias de mantenimiento.
- No se documentan sesgos especificos ni evaluaciones de seguridad; se heredan los del modelo base sin mitigaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rikkathree/vsa-llama-3.2-1b
- Repositorio del autor (VSA-LM): https://github.com/Rikka3/vsa-lm
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
