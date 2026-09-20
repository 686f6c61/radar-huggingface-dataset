# Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_jbbsft_finetuned_keep_0p50

## Resumen

Este repositorio contiene una versión comprimida de `mistralai/Mistral-7B-Instruct-v0.2` mediante el método SVD-LLM completo, aplicado con el código de los autores originales (AIoT-MLSys-Lab/SVD-LLM) y un parche necesario en `component/svd_mistral.py`. Se trata de un artefacto de investigación sobre compresión de rango bajo y su efecto sobre el comportamiento de rechazo (refusal) de un modelo alineado, no de un modelo de propósito general listo para producción.

La compresión elimina el 50 % de los parámetros (fracción retenida 0,4997) mediante un pipeline de blanqueado de datos, truncamiento SVD, adaptación LoRA sobre los factores U, fusión, LoRA sobre los factores V y fusión final. Los factores se repliegan a formas densas de Mistral (`W = U @ V`), por lo que el checkpoint carga con `transformers` estándar sin código de modelado personalizado. Es importante entender que el modelo es deficiente en rango, no más pequeño en disco: ocupa 14,5 GB y declara 7.241.732.096 parámetros.

Su relevancia es metodológica: la model card cuantifica de forma explícita el compromiso entre degradación de calidad (perplejidad en WikiText-2 de 12,9174) y preservación de rechazo (ASR de 0,0962 en AdvBench/HarmBench), además de documentar tasas de sobrerrechazo (0,2067 macro). El autor advierte que las métricas de seguridad de un modelo degenerado no constituyen evidencia sobre alineación, lo que convierte esta ficha en un caso de estudio sobre cómo evaluar compresión sin extraer conclusiones erróneas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Mistral-7B-Instruct-v0.2) con compresión SVD-LLM de rango bajo y factores replegados a denso |
| Parametros totales | 7.241.732.096 (fracción realizada 0,49974646935096156 respecto al rango completo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.2) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors densos; sin GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (densos, factores replegados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2, un transformer decoder con atención de consultas agrupadas (GQA), embeddings rotatorios (RoPE) y atención de ventana deslizante. Sobre ese modelo se aplica el método SVD-LLM: primero un blanqueado de datos calibrado con 256 secuencias de WikiText-2 de 2048 tokens (semilla 42), después un truncamiento SVD que elimina el 50 % de los parámetros y, finalmente, una recuperación de calidad mediante LoRA aplicada secuencialmente a los factores U y V.

La actualización de parámetros usa LoRA con r=8, 2 épocas por factor, learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned` más 960 filas de rechazo (96 comportamientos dañinos de JailbreakBench repetidos 10 veces, el 1,82 % del total). Los objetivos de esas filas son los rechazos greedy del propio `meta-llama/Llama-2-7b-chat-hf`. Esta es la diferencia clave de esta celda (`recovery_mix`) frente a la celda SVD-LLM simple al mismo ratio: se inyectan datos de seguridad en la fase de recuperación para comprobar si preservan el rechazo. Once de los 520 prompts de AdvBench son comportamientos de JailbreakBench literales.

El parche técnico merece mención: `SVD_MistralAttention` calculaba el rango de las matrices k/v con la fórmula de matriz cuadrada `int(hidden * ratio / 2)`, mientras que `whitening()` produce `int(kv*hidden*r / (kv+hidden))`. Los pesos eran correctos pero `nn.Linear.in_features` quedaba obsoleto y PEFT construía los adaptadores LoRA a partir de ese valor, rompiendo la fase LoRA. El fichero parcheado (sha256 `b8c277613b72`) declara el rango real y añade un recorte de máscara causal para transformers >= 4.43; la aritmética de truncamiento no se modifica.

## Capacidades

- Generación de texto conversacional e instrucciones en formato chat (se usa la plantilla de chat de Mistral con decodificación greedy en la evaluación).
- Comportamiento de rechazo preservado parcialmente tras la compresión, con objetivos de rechazo tomados de Llama-2-7b-chat-hf.
- Razonamiento de sentido común evaluado en ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA y PIQA.
- Resolución de problemas aritméticos básicos evaluada en MathQA (resultado bajo, 0,2513).
- Capacidad de servir como sujeto de evaluación de compresión de rango bajo y de seguridad post-poda.
- No se documenta soporte de tool calling, function calling, agentes, multimodalidad, visión ni audio.
- No se documenta un modo de "pensamiento" ni decodificación especulativa.
- Idiomas: no disponibles; los datos de calibración y ajuste (WikiText-2, alpaca-cleaned, JailbreakBench) son en inglés.

## Casos de uso

- Investigación sobre compresión de modelos: reproducir el pipeline SVD-LLM (blanqueado, truncamiento, LoRA en U y V) sobre Mistral-7B-Instruct-v0.2 para estudiar curvas de degradación a ratios de retención del 50 % y comparar celdas con y sin datos de seguridad.
- Evaluación del compromiso calidad-seguridad: usar las métricas de ASR (0,0962 AdvBench, 0,1310 StrongREJECT) junto con las de sobrerrechazo (0,1523 XSTest-safe, 0,2612 OR-Bench-Hard-1K) para analizar si la inyección de filas de rechazo durante la recuperación preserva el comportamiento alineado.
- Estudio del sobrerrechazo tras poda: la tasa macro de 0,2067 permite analizar si un modelo comprimido rechaza en exceso peticiones benignas, un efecto relevante al desplegar modelos podados.
- Docencia y divulgación sobre ingeniería de modelos: sirve como ejemplo autocontenido de cómo un error de formas declaradas en una capa impide que PEFT construya adaptadores LoRA, y de cómo diagnosticarlo.
- Experimentos de cuantización sobre checkpoints comprimidos: dado que los pesos son densos y cargan con `transformers` estándar, se puede aplicar cuantización posterior (por ejemplo, a 8 o 4 bits) para medir el apilamiento de degradaciones.
- Auditoría de artefactos publicados: el repositorio incluye salidas por prompt y ficheros de métricas crudos en `utility/` y `safety/`, útiles para replicar la evaluación o verificar el juicio de HarmBench y WildGuard.
- Referencia negativa en pipelines de selección de modelos: dado su estado de validación (0 descargas, 0 likes en el momento de la consulta) y la advertencia del autor, se usa como ejemplo de artefacto que no debería pasar a producción sin validación adicional.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Metrica | Valor |
|---|---:|
| Fracción de parámetros retenidos | 0,4997 |
| Perplejidad WikiText-2 | 12,9174 |
| arc_easy (acc_norm) | 0,5332 |
| arc_challenge (acc_norm) | 0,3276 |
| hellaswag (acc_norm) | 0,5177 |
| winogrande (acc) | 0,5991 |
| openbookqa (acc_norm) | 0,3420 |
| piqa (acc_norm) | 0,6621 |
| mathqa (acc_norm) | 0,2513 |
| AdvBench HarmBench ASR | 0,0962 |
| StrongREJECT HarmBench ASR | 0,1310 |
| Sobrerrechazo (XSTest-safe) | 0,1523 |
| Sobrerrechazo (OR-Bench-Hard-1K) | 0,2612 |
| Sobrerrechazo macro | 0,2067 |

Metodología de evaluación: perplejidad en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; generación de AdvBench y StrongREJECT juzgada por `cais/HarmBench-Llama-2-13b-cls`; sobrerrechazo en XSTest-safe y OR-Bench-Hard-1K juzgado por `allenai/wildguard`. Toda la generación usa la plantilla de chat con decodificación greedy. El autor indica que el juicio de sobrerrechazo es fiable para esta celda (fracción puntuada 0,97 en XSTest-safe y 0,98 en OR-Bench-Hard-1K).

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 14,5 GB solo para pesos, más caché KV; se recomienda un mínimo de 24 GB para contexto moderado.
- VRAM estimada en INT8: alrededor de 7,3 GB de pesos.
- VRAM estimada en INT4: alrededor de 4 GB de pesos (requiere cuantización posterior, no publicada).
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para servicio concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 en contexto corto o INT8.
- Cabe en GPU de consumo (RTX 4090, 3090, y en INT4 incluso en tarjetas de 8-12 GB) siempre que se aplique cuantización, ya que no se distribuyen formatos cuantizados.
- Opciones de despliegue: `transformers` estándar (los factores están replegados a formas densas), vLLM, TGI o llama.cpp/Ollama tras convertir a GGUF. No requiere código de modelado personalizado.
- Latencia y throughput: no disponibles. Al ser deficiente en rango pero no más pequeño en disco, no debe esperarse una mejora de velocidad frente al modelo base sin cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SVD-LLM keep 0,50) | 7.241.732.096 nominales; 0,4997 de rango retenido | No disponible | Apache 2.0 | Ver tabla de benchmarks | safetensors, 14,5 GB |
| `mistralai/Mistral-7B-Instruct-v0.2` (base sin comprimir) | 7.241.732.096 | Según documentación del modelo base | Apache 2.0 | No disponible en la información proporcionada | safetensors |
| Otras celdas SVD-LLM del mismo autor (recovery_mix frente a SVD-LLM simple) | No disponible | No disponible | Apache 2.0 | No disponible | No disponible |
| `mistralai/Mistral-7B-Instruct-v0.3` | No disponible en la información proporcionada | No disponible | Apache 2.0 | No disponible | No disponible |

No se dispone de resultados de benchmarks de los modelos de comparación en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La compresión al 50 % puede degradar la calidad de generación; el propio autor lo señala como caveat explícito.
- Las métricas de seguridad (ASR) de un modelo que puede haberse vuelto degenerado no constituyen evidencia sobre alineación; deben leerse junto con las columnas de sobrerrechazo y seguimiento de instrucciones.
- Tasa de sobrerrechazo macro de 0,2067: el modelo rechaza en exceso una fracción considerable de peticiones benignas, lo que limita su uso conversacional directo.
- MathQA en 0,2513 y ARC-Challenge en 0,3276 indican capacidad de razonamiento y aritmética claramente reducidas.
- Sesgos conocidos: no documentados en la información proporcionada; los datos de ajuste (alpaca-cleaned, JailbreakBench) están en inglés y pueden introducir sesgos lingüísticos y culturales no analizados.
- Riesgo de alucinación: no cuantificado en la model card; al ser un modelo comprimido, es plausible un aumento del riesgo, pero no hay datos.
- Idiomas soportados: no disponibles. Todo el material de calibración y ajuste está en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Mistral-7B-Instruct-v0.2 conviene revisar las condiciones del modelo base y de los datasets de ajuste (alpaca-cleaned, JailbreakBench) antes de un uso comercial.
- Artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay validación externa ni mantenimiento conocido.
- No se publican formatos cuantizados, por lo que el despliegue eficiente requiere conversión propia.
- El checkpoint es deficiente en rango, no más pequeño en disco: el ahorro de almacenamiento es nulo y el de cómputo puede no materializarse sin cuantización.
- Se requiere `transformers >= 4.43` para el recorte de máscara causal incluido en el parche.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_jbbsft_finetuned_keep_0p50
- Código de SVD-LLM (AIoT-MLSys-Lab, commit `7538cca98880`): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Dataset de ajuste: `yahma/alpaca-cleaned`
- Dataset de calibración: WikiText-2 (`wikitext`)
- Dataset de seguridad: JailbreakBench
- Dataset de evaluación de rechazo: AdvBench, StrongREJECT, XSTest, OR-Bench
- Juez de seguridad: `cais/HarmBench-Llama-2-13b-cls`
- Juez de sobrerrechazo: `allenai/wildguard`
- Modelo generador de objetivos de rechazo: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de resultados crudos: directorios `utility/` y `safety/` del repositorio
