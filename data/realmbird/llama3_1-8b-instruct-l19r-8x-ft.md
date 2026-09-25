# Realmbird/Llama3_1-8B-Instruct-L19R-8x-ft

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un autoencoder disperso (SAE) de interpretabilidad: un diccionario de 32.768 latentes de tipo JumpReLU entrenado sobre el residual stream de la capa 19 (`blocks.19.hook_resid_post`, es decir, la salida de `model.layers[19]`) de `meta-llama/Llama-3.1-8B-Instruct`. Lo publica el usuario Realmbird a partir del trabajo de Christopher Kinoshita (beca de la AI Alignment Foundation, p2-selfie). Su punto de partida es `fnlp/Llama3_1-8B-Base-LXR-8x` (Llama Scope L19R-8x), un SAE de la misma anchura entrenado sobre el modelo **base**; aquí se continúa entrenando durante 19.996.672 tokens de conversaciones de WildChat pasadas por el modelo **Instruct** y se reajustan los umbrales para que el L0 medio sea 50.

La relevancia práctica está en la compatibilidad de índices: los índices de latente se mantienen intactos respecto al diccionario original, de modo que cualquier análisis por latente ya existente (el diccionario de Neuronpedia `llama3.1-8b/19-llamascope-res-32k`, las etiquetas SelfIE, etc.) puede seguirse latente a latente sobre el modelo Instruct. El coste de esa transferibilidad es un deriva apreciable del decodificador: el coseno mediano entre las filas del decodificador nuevo y las originales es 0,887 y solo el 1,1 % de las filas superan 0,99.

El checkpoint corresponde al brazo **F-BOS**, en el que el token 0 (BOS) se incluyó en el flujo de entrenamiento. Eso reduce drásticamente el "manchado" (smear) del BOS: los latentes que disparan en el token 0 en al menos el 90 % de las secuencias pasan de 19.967 (61 % del diccionario) a 2.677 (8 %), y aparecen latentes dedicados a esa posición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso (SAE) JumpReLU de 32.768 latentes sobre el residual stream de la capa 19 de `meta-llama/Llama-3.1-8B-Instruct` (`blocks.19.hook_resid_post`). Anchura 8x sobre un `d_model` de 4.096 |
| Parámetros totales | ≈268 millones (dos matrices de 32.768 × 4.096: `W_enc` y `W_dec`). Dato derivado de la arquitectura, no declarado explícitamente por el autor. El repositorio ocupa 2,1 GB |
| Parámetros activos | no aplica: no es un modelo Mixture of Experts |
| Longitud de contexto | no aplica. El SAE se aplica token a token sobre la activación de la capa 19. Las activaciones de entrenamiento se truncaron a 1.024 tokens; el modelo base admite 128K tokens |
| Tipos de cuantización | no disponible. El autor no publica catálogo de cuantizaciones; el checkpoint se consume a través de `sae-lens` |
| Idiomas soportados | inglés (en). El ajuste se realiza únicamente sobre WildChat en inglés |
| Licencia | `llama3.1` (Llama 3.1 Community License), heredada del modelo base |
| Formato de pesos | no disponible. No se especifica en la model card; el repositorio incluye `sae_config.json` con la configuración para `sae-lens` |
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Checkpoint de partida | `fnlp/Llama3_1-8B-Base-LXR-8x` (Llama Scope L19R-8x) |
| Latentes | 32.768; L0 medio objetivo 50 |
| Dataset de entrenamiento | `allenai/WildChat-1M` (inglés, no tóxico, plantilla de chat de Llama 3.1 con cabecera de sistema por defecto, truncado a 1.024 tokens) |
| Librería | `sae-lens` |

## Arquitectura y entrenamiento

El SAE es un JumpReLU con objetivo TopK con k = 50 seleccionado sobre `act · ‖W_dec‖` (el ajuste `sparsity_include_decoder_norm` de Llama Scope), reconstrucción por MSE, sin pérdida auxiliar y con normas de decodificador libres. Se inicializa desde el diccionario de Llama Scope y se continúa entrenando con Adam a un learning rate de 0,0002, 5 % de warmup y 20 % de decaimiento lineal, semilla 0. El flujo de entrenamiento son 4.882 pasos de 4.096 tokens (19.996.672 tokens en total) de WildChat renderizado con la plantilla de chat de Llama 3.1, pasado por el modelo Instruct en bf16 y capturado en la capa 19. La escala de entrada propia de Llama Scope (s = √4096 / 17,125 = 3,73723) se pliega dentro de los pesos, de modo que este checkpoint lee activaciones en crudo. La pérdida de entrenamiento final es 763,514 y el FVU final 0,1101.

La innovación principal es el reajuste de umbrales y el tratamiento del BOS. Tras el entrenamiento se reajustan los umbrales JumpReLU por latente, θᵢ = c / ‖W_dec,ᵢ‖ con las normas de decodificador en el espacio del checkpoint, sobre 500.000 tokens de chat reservados y excluyendo el token 0, de forma que el L0 medio sea 50: c = 1,79879 (frente al 1,9708 propio de Llama Scope). Con ese reajuste el L0 medio queda en 49,846; con el umbral plano de 1,9708 que aplica `sae-lens`, en 28,929. El tensor `threshold` guardado es por latente, así que la regla correcta es `pre > threshold`, que es exactamente lo que calculan tanto el fragmento de PyTorch plano como `JumpReLUSAE.encode` de `sae-lens`. En el brazo F-BOS el token 0 se incluyó en el flujo de entrenamiento, lo que genera latentes dedicados al BOS: 164 latentes tienen al menos el 95 % de sus activaciones máximas en la posición 0 (frente a 16.485 en el checkpoint de partida), y unos pocos nunca disparan en posiciones posteriores.

## Capacidades

- Descomposición de las activaciones de la capa 19 de Llama-3.1-8B-Instruct en 32.768 características dispersas y reconstrucción de la activación original a partir de ellas.
- Análisis por latente con índices alineados con el diccionario Llama Scope original, lo que permite reutilizar etiquetas y análisis previos latente a latente.
- Detección y aislamiento de características ligadas al formato de chat, ya que el ajuste se hizo sobre conversaciones renderizadas con la plantilla de Llama 3.1.
- Identificación de latentes dedicados al token BOS gracias al brazo F-BOS, con listas de latentes que disparan en la posición 0.
- Diagnóstico de salud del diccionario: el propio autor reporta latentes muertos (881 en la evaluación de chat, 488 en la de texto).
- Evaluación cuantitativa de la calidad de reconstrucción mediante FVU, L0 medio y ΔCE en nats, con puntos de referencia publicados.
- Capacidades que **no** tiene: no genera texto, no responde a prompts, no hace tool calling ni razonamiento multi-paso. Es un artefacto de interpretabilidad, no un asistente.
- Multilingüismo: no disponible. Solo se ha validado sobre activaciones de texto en inglés.

## Casos de uso

- Auditoría de Llama-3.1-8B-Instruct en producción: capturar `blocks.19.hook_resid_post` durante inferencia real y proyectar la activación sobre los 32.768 latentes para inspeccionar qué características se activan turno a turno. Es adecuado porque está entrenado sobre conversaciones de chat reales (WildChat), no sobre texto plano.
- Reutilización de etiquetas de Neuronpedia: al mantenerse los índices de latente, un pipeline que ya consulte el diccionario `llama3.1-8b/19-llamascope-res-32k` o las etiquetas SelfIE puede apuntar a este checkpoint para analizar el modelo Instruct sin reconstruir el etiquetado desde cero.
- Diagnóstico de la plantilla de chat: comparar qué latentes se activan con y sin la cabecera de sistema por defecto, o entre turnos de usuario y de asistente, para detectar características de formato que contaminan análisis posteriores.
- Estudio del sesgo del token BOS: usar los latentes dedicados a la posición 0 para medir cuánto de la activación de la primera posición es un artefacto del token BOS y cuánto es contenido real, algo crítico cuando se analizan prompts muy cortos.
- Comparación base frente a Instruct: pasar los mismos textos por ambos modelos y comparar las activaciones sobre el mismo diccionario, aprovechando que los índices son idénticos, para localizar qué características cambian con el ajuste por instrucciones.
- Monitorización de salud de diccionarios en investigación: usar las métricas publicadas (FVU, L0, ΔCE, latentes muertos) como línea base contra la que evaluar SAEs nuevos de la misma capa y anchura.
- Investigación sobre edición de activaciones: el diccionario permite, en principio, ablar o amplificar latentes concretos durante el forward pass del modelo base; es un uso estándar de los SAE, pero no está validado ni documentado en esta model card.
- Docencia y reproducibilidad en interpretabilidad: el repositorio incluye `sae_config.json` y el autor documenta la receta completa (optimizador, semilla, pasos, objetivo), lo que facilita replicar el ajuste sobre otros modelos Instruct.

## Benchmarks y rendimiento

No hay resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) porque el artefacto no es un modelo generativo. Los únicos datos publicados son métricas de reconstrucción del SAE, calculadas con `eval_sae.py` sobre activaciones del modelo Instruct y excluyendo el token 0 de toda métrica por token. **B0** es Llama Scope tal como lo carga `sae-lens` (θ plano = 1,971, L0 ≈ 34); **B0-pub** son los mismos pesos con la puerta por latente prevista por Llama Scope (L0 ≈ 50); **F-BOS** es este checkpoint con su θᵢ reajustado.

chat-eval (2 millones de tokens reservados de WildChat, con plantilla de chat):

| Métrica | B0 (sae_lens, θ plano = 1,971) | B0-pub (θᵢ = 1,971/‖W_dec,ᵢ‖) | F-BOS (este repositorio, θᵢ reajustado) |
|---|---:|---:|---:|
| FVU | 0,399 | 0,355 | 0,269 |
| L0 medio | 33,308 | 48,660 | 50,491 |
| ΔCE (nats) | 0,389 | 0,237 | 0,180 |
| CE recuperado | 0,960 | 0,975 | 0,981 |
| Latentes que disparan en el token 0 en ≥90 % de las secuencias | 19.967 | 20.301 | 2.677 |
| Latentes muertos | 2.097 | 933 | 881 |

text-eval (1 millón de tokens de SlimPajama, sin plantilla, pasados por el modelo Instruct):

| Métrica | B0 (sae_lens, θ plano = 1,971) | B0-pub (θᵢ = 1,971/‖W_dec,ᵢ‖) | F-BOS (este repositorio, θᵢ reajustado) |
|---|---:|---:|---:|
| FVU | 0,341 | 0,304 | 0,348 |
| L0 medio | 34,274 | 50,498 | 57,819 |
| ΔCE (nats) | 0,339 | 0,244 | 0,355 |
| CE recuperado | 0,963 | 0,973 | 0,961 |
| Latentes que disparan en el token 0 en ≥90 % de las secuencias | 19.967 | 20.301 | 2.677 |
| Latentes muertos | 819 | 362 | 488 |

## Requisitos de hardware

- SAE en sí: con ≈268 millones de parámetros, ocupa aproximadamente 1,1 GB en fp32 y unos 0,54 GB en bf16 (estimación derivada de la arquitectura, no declarada por el autor). El repositorio completo pesa 2,1 GB.
- Requisito real: hay que ejecutar `meta-llama/Llama-3.1-8B-Instruct` para obtener las activaciones de la capa 19. En bf16 son ≈16 GB solo de pesos, más activaciones y caché KV.
- GPU de gama alta: A100 (40/80 GB), H100, L40S. No son necesarias para el SAE, solo para el modelo base si se quiere procesar en lote.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16 para el modelo base; una RTX 4080 (16 GB) requiere cuantización de 8 bits (≈9 GB) o de 4 bits (≈5-6 GB). El SAE se carga siempre en memoria aparte y es despreciable frente al modelo base.
- Despliegue: `sae-lens` sobre PyTorch es la vía documentada (`JumpReLUSAE.encode` o el fragmento de PyTorch plano de la model card). Para el modelo base se necesita acceso a `blocks.19.hook_resid_post`, lo que implica `transformers` con hooks o herramientas de interpretabilidad; los servidores de inferencia tipo vLLM o llama.cpp sirven el LLM, pero no exponen por defecto las activaciones internas.
- Latencia y throughput: no disponible. El autor no publica medidas de velocidad ni de coste por token.

## Comparativa con modelos similares

| Modelo | Capa | Latentes | Entrenado sobre | L0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Realmbird/Llama3_1-8B-Instruct-L19R-8x-ft (este) | 19 | 32.768 | Llama-3.1-8B-**Instruct** + WildChat (19,99 M tokens) | 50 | llama3.1 | HuggingFace, con `sae_config.json`; 0 descargas y 0 likes en el momento del análisis |
| fnlp/Llama3_1-8B-Base-LXR-8x (Llama Scope L19R-8x) | 19 | 32.768 | Llama-3.1-8B-**Base** + SlimPajama | ≈50 con la puerta por latente | no disponible | HuggingFace; es el checkpoint del que parte este |
| Goodfire/Llama-3.1-8B-Instruct-SAE-l19 | 19 | no disponible | no disponible (Instruct, según el nombre) | no disponible | no disponible | HuggingFace |

La comparación directa con Llama Scope es la más informativa: mismo diccionario y misma anchura, pero especializado en chat. Frente a B0-pub (mismo L0 ≈ 50), este checkpoint mejora el FVU de chat de 0,355 a 0,269 y el ΔCE de 0,237 a 0,180 nats, mientras que empeora en texto plano (FVU de 0,304 a 0,348; ΔCE de 0,244 a 0,355). No se dispone de datos públicos del SAE de Goodfire para comparar.

## Limitaciones y advertencias

- No es un modelo generativo. No produce texto, no sigue instrucciones, no soporta tool calling ni agentes. Cualquier ficha que lo presente como un LLM de 8B es incorrecta.
- Especialización en chat con coste en texto plano: la reconstrucción mejora en WildChat y empeora en SlimPajama. No es un diccionario "mejor" en general, sino uno sesgado al formato conversacional.
- Deriva del decodificador: coseno mediano 0,887 y solo el 1,1 % de las filas por encima de 0,99 respecto al diccionario original. Los índices están alineados, pero las etiquetas por latente de Llama Scope, Neuronpedia o SelfIE pueden no transferirse de forma fiable sin revalidación.
- Trampa del umbral: si se carga con el θ plano de 1,971 que aplica `sae-lens`, el SAE opera a L0 ≈ 34 (o 28,929 en la práctica) en lugar de 50, y todas las métricas publicadas se desvían. Hay que usar el tensor `threshold` por latente que guarda el repositorio.
- Efectos del BOS: el token 0 se incluyó en el entrenamiento, lo que reduce el manchado pero introduce latentes dedicados a la posición 0. Las métricas de la model card excluyen el token 0 de todo cálculo por token; los análisis propios deberían hacer lo mismo para ser comparables.
- Latentes muertos: 881 en chat-eval y 488 en text-eval. Una fracción del diccionario no se activa en esos dominios y no aporta señal.
- Diferencia entre dominios de evaluación: el rendimiento en la distribución de entrenamiento (L0 50,491) no se reproduce en texto plano (L0 57,819), lo que indica que el umbral reajustado no está calibrado fuera del formato de chat.
- Idioma: solo inglés. No hay validación en otros idiomas, aunque el modelo base sea multilingüe.
- Licencia: Llama 3.1 Community License. Permite uso comercial con condiciones (atribución "Built with Llama", requisitos de nomenclatura para derivados y umbral de usuarios activos mensuales), y se hereda a los derivados de este checkpoint. Conviene consultar el texto completo antes de un despliegue en producción.
- Adopción: 0 descargas y 0 likes en el momento del análisis, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Realmbird/Llama3_1-8B-Instruct-L19R-8x-ft
- Configuración del SAE: https://huggingface.co/Realmbird/Llama3_1-8B-Instruct-L19R-8x-ft/blob/main/sae_config.json
- Checkpoint de partida (Llama Scope L19R-8x): https://huggingface.co/fnlp/Llama3_1-8B-Base-LXR-8x
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/WildChat-1M
- Paper de Llama Scope (arXiv:2410.20526): https://arxiv.org/abs/2410.20526
- SAE comparable de Goodfire: https://huggingface.co/Goodfire/Llama-3.1-8B-Instruct-SAE-l19
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3
- Diccionario de referencia en Neuronpedia: identificador `llama3.1-8b/19-llamascope-res-32k`, citado en la model card; URL no proporcionada.
- Librería `sae-lens`: citada en la model card; URL no proporcionada.
- Write-up AIAFC-69 (sección H5, latentes dedicados al BOS y latentes que nunca disparan fuera de la posición 0): citado en la model card; URL no proporcionada.
