# auRose94/Flint-40B-A2.5B-ninths-k63-e99-GGUF

## Resumen

Flint-40B-A2.5B es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por RecursiveSI, distribuido en este repositorio por el usuario auRose94 en un formato de cuantización propietario denominado "ninths" (o k9). El modelo base cuenta con 40.000 millones de parámetros totales y 2.500 millones de parámetros activos por token, organizados en 49 capas (2 densas y 47 MoE con 6+1 expertos activos de un total de 256). El checkpoint real en safetensors registra 28.416.526.127 parámetros, lo que sugiere una discrepancia entre el nombre comercial y el recuento efectivo de pesos.

Este repositorio concreto no contiene el modelo original, sino una cuantización custom de 26,54 GiB que emplea codificación entrópica rANS con flujos de bytes y un directorio interno, materializando los pesos a Q8_0 exacto en tiempo de carga. La tasa efectiva es de 5,713 bits por parámetro sobre los 486 tensores cuantizados, lo que supone un 33 % menos que Q8_0 estándar (39,44 GiB) y un 64 % menos que el GGUF bf16 original (74,2 GiB).

La relevancia de esta ficha es doble: por un lado, documenta un modelo MoE de razonamiento con modo thinking obligatorio y buen desempeño en tareas de código; por otro, ilustra una técnica de compresión alternativa a las cuantizaciones K-quants e I-quants habituales, con verificación byte a byte y métricas de perplejidad publicadas. El modelo está pensado para despliegues con requisitos de VRAM ajustados donde se quiera mantener calidad cercana a Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas: 2 densas + 47 MoE, 6+1 de 256 expertos) |
| Parametros totales | 28.416.526.127 (safetensors); nombre comercial 40B |
| Parametros activos | 2.500 millones (2.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninths k9 (k63 cuerpo / k99 embeddings), 5,713 bits/param; materializa a Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (contenedor ninths con flujos rANS); safetensors en el modelo base |

## Arquitectura y entrenamiento

Flint es un transformer MoE con 49 capas, de las cuales 2 son densas y 47 son capas MoE con enrutamiento a 6+1 expertos de un total de 256. Con 2,5B de parámetros activos por token sobre un total nominal de 40B, el modelo sigue el patrón de eficiencia computacional típico de los MoE modernos (similar en concepto a Mixtral o DeepSeek-MoE, aunque con proporciones distintas). El checkpoint real en safetensors declara 28,4B de parámetros, cifra que conviene tener en cuenta frente al nombre comercial.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o similares. La model card del repositorio de cuantización no detalla el proceso de entrenamiento del modelo base; solo describe el pipeline de cuantización. Este pipeline (ninths, en el fork `auRose94/llama.cpp` rama `k9` y el repositorio `base9-quantization`) emplea codificación entrópica rANS con streams intercalados por carriles, verificación byte a byte contra un decodificador independiente (0 discrepancias en dígitos, escalas y payload Q8_0 materializado) y decodificación en carga. La innovación técnica destacable es, por tanto, el propio formato de compresión, no la arquitectura del modelo.

## Capacidades

- Generación de texto y razonamiento con modo thinking obligatorio: el modelo planifica y se autocorrige extensamente antes de responder.
- Generación de código: en una batería de 24 tareas de programación en GDScript alcanza 22/24 con presupuesto de 6000 tokens (greedy), frente a 4/24 con 480 tokens.
- Razonamiento multi-step dentro del bloque de pensamiento.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Capacidad MoE con 2,5B de parámetros activos, lo que reduce el coste computacional por token.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Generación de código en producción con presupuesto de tokens amplio: el modelo requiere entre 2500 y 6000 tokens de pensamiento para resolver tareas de coding complejas; encaja en pipelines de generación de parches o scripts donde la latencia no sea crítica y la corrección sí.
- Asistente de razonamiento técnico: para preguntas que exigen descomposición en pasos (depuración, análisis de algoritmos, diseño de arquitecturas), el modo thinking obligatorio aporta trazabilidad del razonamiento.
- Despliegue en hardware de gama alta consumer o estación de trabajo: con 26,54 GiB en el contenedor k63/e99 y materialización a Q8_0 de ~39,5 GB, es viable en GPUs con 24-48 GB o con offload parcial de bloques MoE tardíos a RAM del sistema.
- Servicio conversacional self-hosted: licencia Apache-2.0 y formato GGUF permiten integración en servidores llama.cpp propios sin dependencia de APIs externas.
- Evaluación e investigación de técnicas de cuantización: el repositorio sirve como referencia reproducible del pipeline ninths, con métricas de perplejidad y KL frente a Q8_0, Q4_K_M e IQ4_NL.
- Prototipado de agentes con razonamiento largo: útil cuando se necesita un modelo que "piense" antes de actuar, aceptando el coste de tokens de pensamiento.
- Fine-tuning o experimentación sobre el modelo base: el checkpoint original en safetensors (RecursiveSI/flint) permite partir de pesos sin cuantizar.

## Benchmarks y rendimiento

Datos medidos en A9 Mega (Ryzen AI Max+ 395 / Radeon 8060S, ROCm/HIP), llama-bench con 16 hilos y offload completo a GPU:

| Armazón | Fichero | PPL (wiki2 300k) | pp512 | tg128 | Carga |
|---|---|---|---|---|---|
| Q8_0 estándar (ggml-org) | 39,44 GiB | 22,8678 ± 0,511 | 1430 | 50,0 | ~15 s |
| Este contenedor (k63/e99) | 26,54 GiB | 23,6822 ± 0,536 | 1452 | 49,9 | ~36 s |
| Q4_K_M estándar (ggml-org) | 21,78 GiB | 23,7434 ± 0,536 | 1589 | 56,2 | ~13 s |
| IQ4_NL re-quant | 21,21 GiB | 27,5552 ± 0,642 | 1701 | 67,4 | ~12 s |

Protocolo KL frente al base bf16 (exp27 mini-KLD, corpus de 60 KB):

| Candidato | PPL(Q)/PPL(base) | ln(PPL(Q)/PPL(base)) ± | Cor |
|---|---|---|---|
| Q8_0 estándar | 1,0395 | 0,0388 ± 0,0082 | 98,6 % |
| Q4_K_M estándar | 1,0628 | 0,0609 ± 0,0119 | 96,9 % |
| Este contenedor (k63/e99) | 1,0811 | 0,0779 ± 0,0110 | 97,5 % |
| IQ4_NL re-quant | 1,2267 | 0,2044 ± 0,0180 | 93,3 % |

Rendimiento en tareas de código (batería GDScript de 24 tareas, greedy): 4/24 con 480 tokens de presupuesto, 9/24 con 1200, 19/24 con 2500 y 22/24 con 6000. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~39,5 GB tras materializar a Q8_0; el contenedor en disco ocupa 26,54 GiB.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de 48 GB (RTX 6000 Ada, RTX A6000); en GPUs de 24 GB es necesario offload parcial.
- Cabe en consumer GPU: sí, con offload de bloques MoE tardíos a RAM del sistema mediante `--override-tensor 'blk\.4[0-9]\..*_exps\.weight=CPU'`.
- Opciones de despliegue: exclusivamente el fork `auRose94/llama.cpp` rama `k9` (commit ≥ 2fafd9ccc); llama.cpp estándar, Ollama y LM Studio no pueden leer el formato. Compilación con `-DGGML_HIP=ON` para AMD o CPU.
- Latencia y throughput medidos: pp512 de 1452 tokens/s y tg128 de 49,9 tokens/s en Ryzen AI Max+ 395 / Radeon 8060S; tiempo de carga ~36 s (frente a ~15 s de Q8_0 estándar).
- Requisito adicional: usar `chat_template_llamacpp.jinja` con `--chat-template-file`, ya que la plantilla original contiene una transformación `"\x00"` que el lexer jinja de llama.cpp rechaza.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Flint-40B-A2.5B (este, k63/e99) | 28,4B / 2,5B | no disponible | Apache-2.0 | GGUF ninths, fork propio | PPL 23,68; 26,54 GiB |
| Flint-40B-A2.5B Q8_0 | 28,4B / 2,5B | no disponible | Apache-2.0 | GGUF estándar | PPL 22,87; 39,44 GiB |
| Flint-40B-A2.5B Q4_K_M | 28,4B / 2,5B | no disponible | Apache-2.0 | GGUF estándar | PPL 23,74; 21,78 GiB |
| Flint-40B-A2.5B IQ4_NL | 28,4B / 2,5B | no disponible | Apache-2.0 | GGUF estándar | PPL 27,56; 21,21 GiB |

No se dispone de información sobre modelos de otros desarrolladores comparables en tamaño y arquitectura para esta ficha.

## Limitaciones y advertencias

- El formato ninths no es compatible con llama.cpp estándar, Ollama ni LM Studio; requiere el fork específico, lo que limita la portabilidad y añade mantenimiento.
- La cuantización k63/e99 no supera a Q4_K_M en relación calidad/tamaño para esta arquitectura: Q4_K_M logra perplejidad similar (23,74 frente a 23,68) en un fichero más pequeño (21,78 frente a 26,54 GiB). El autor lo reconoce explícitamente.
- El modo thinking es obligatorio y el modelo rinde mal con presupuestos de tokens cortos (4/24 con 480 tokens frente a 22/24 con 6000); no debe forzarse `max_tokens` bajo.
- Tiempo de carga elevado (~36 s) por la decodificación en carga; impacto en arranques frecuentes o escalado dinámico.
- Discrepancia entre el nombre comercial (40B) y el recuento real de parámetros (28,4B en safetensors); conviene verificar el checkpoint antes de planificar recursos.
- No se declaran idiomas soportados ni se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K); la evaluación se limita a perplejidad, KL y una batería propia de GDScript.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los riesgos habituales de modelos de razonamiento con pensamiento extenso.
- Licencia Apache-2.0 heredada del modelo base, permisiva para uso comercial, pero el pipeline de cuantización y el formato tienen su propia implementación en los repositorios del autor.
- Las cifras de rendimiento corresponden a un único hardware (Ryzen AI Max+ 395 / Radeon 8060S); no hay datos en A100, H100 u otras GPUs.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/auRose94/Flint-40B-A2.5B-ninths-k63-e99-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Contenedores extremos (k5, k3): https://huggingface.co/auRose94/Flint-40B-A2.5B-ninths-extreme-GGUF
- Fork de llama.cpp (rama k9): https://github.com/auRose94/llama.cpp
- Pipeline de cuantización: https://github.com/auRose94/base9-quantization
