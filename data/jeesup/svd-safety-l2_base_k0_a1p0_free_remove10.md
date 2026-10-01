# Jeesup/svd-safety-l2_base_k0_a1p0_free_remove10

## Resumen

svd-safety-l2_base_k0_a1p0_free_remove10 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf al que se le ha aplicado una compresión SVD-LLM que elimina el 10,00 % de los parámetros densos. El autor, identificado en HuggingFace como Jeesup, lo publica como artefacto de investigación dentro de un estudio sistemático sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No se trata de un modelo conversacional de propósito general, sino de una celda concreta de una rejilla experimental.

El checkpoint parte de la fracción de parámetros resultante de 0,8998 y, en esta celda concreta, aplica un presupuesto de restauración del 0,000 % (cero componentes restaurados o intercambiados). La regla de selección de componentes figura como `unknown` en la propia ficha, y la semilla empleada es 42. El repositorio ocupa 13,5 GB y contiene pesos en formato safetensors compatibles con la librería transformers.

Su relevancia es metodológica: sirve como sujeto de prueba para cuantificar el compromiso entre seguridad y utilidad bajo compresión, y como referencia base (sin restauración) frente al resto de celdas de la rejilla. La ficha advierte explícitamente de que varias ramas del estudio están degradadas en seguridad de forma deliberada y de que el modelo no debe desplegarse como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2); pesos comprimidos mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (~6,74 B) segun safetensors; la ficha declara una fraccion de parametros resultante de 0,8998 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat declara 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base esta orientado principalmente al ingles) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Llama-2-7b-chat, con atención causal, normalización RMSNorm y activaciones SwiGLU. Sobre ese checkpoint se aplica una compresión SVD-LLM que reduce los parámetros densos en un 10,00 %, dejando una fracción resultante de 0,8998. No hay indicios en la información disponible de un reentrenamiento posterior, de ajuste con RLHF/DPO adicional ni de una fase de destilación: el proceso documentado es exclusivamente de compresión por descomposición en valores singulares más una etapa de restauración de componentes con presupuesto controlado.

La innovación que documenta la ficha no está en el modelo en sí, sino en el protocolo experimental: una rejilla que cruza reglas de selección de componentes (aquí `unknown`) con presupuestos de restauración (aquí 0,000 %, es decir, cero componentes restaurados y cero intercambiados) para medir el efecto sobre la seguridad y la utilidad. El número de tokens de entrenamiento, la composición del dataset y los detalles del procedimiento de compresión no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-2-7b-chat, aunque degradada por la compresión.
- Razonamiento de propósito general y respuesta a instrucciones en el formato de chat de Llama 2.
- Capacidad de ser evaluado con jueces automáticos de seguridad (HarmBench) y de sobre-rechazo (WildGuard).
- Sujeto de medición de perplexity sobre corpus de referencia (WikiText-2).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- Capacidades multilingües no especificadas; el modelo base está orientado principalmente al inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación sobre compresión de modelos: servir como celda base (0 % de restauración) para comparar contra otras celdas de la rejilla y aislar el efecto de la compresión SVD-LLM sobre el comportamiento del modelo.
- Medición del compromiso seguridad-utilidad: usar las métricas ya reportadas (AdvBench ASR, StrongREJECT ASR, sobre-rechazo macro y perplexity de WikiText-2) como punto de referencia reproducible con semilla 42.
- Estudios de interpretabilidad: analizar qué componentes de la descomposición SVD concentran el comportamiento de seguridad y cuáles degradan la utilidad.
- Red-teaming y evaluación de robustez: emplear el checkpoint como caso de prueba para validar jueces automáticos (HarmBench, WildGuard) frente a un modelo deliberadamente degradado.
- Ablación metodológica: replicar el protocolo experimental con otras reglas de selección de componentes y presupuestos de restauración para verificar la reproducibilidad de los resultados.
- Docencia y divulgación técnica: ilustrar, con un caso real y medido, qué ocurre con la seguridad de un modelo al comprimirlo un 10 % sin estrategia de reparación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0154 |
| StrongREJECT ASR (juez HarmBench) | 0,0096 |
| Sobre-rechazo macro (WildGuard) | 0,3860 |
| Perplexity en WikiText-2 | 8,0660 |

No se han publicado en la informacion disponible resultados comparativos de MMLU, HumanEval, GSM8K ni de otros modelos de referencia para esta misma celda.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 13,5 GB, coherente con el tamano del repositorio (6,74 B de parametros a 16 bits).
- VRAM estimada en INT8: aproximadamente 6,7-7 GB.
- VRAM estimada en INT4: aproximadamente 3,4-4 GB.
- GPU recomendadas: para FP16, NVIDIA A100 40/80 GB, NVIDIA H100 (sobran capacidad) o una RTX 4090 de 24 GB; para INT8/INT4, una RTX 3090 o RTX 3060 de 12 GB es suficiente.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 a 16 bits, y en RTX 3060 12 GB con cuantizacion a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (los tags incluyen text-generation-inference y endpoints_compatible) y, previa conversion, vLLM o llama.cpp/Ollama.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| svd-safety-l2_base_k0_a1p0_free_remove10 | 6,74 B (fraccion 0,8998) | no disponible | Llama 2 Community License | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | ~7 B | 4096 tokens | Llama 2 Community License | HuggingFace, ampliamente distribuido |
| Mistral-7B-Instruct | ~7 B | 8192 tokens | Apache 2.0 | HuggingFace |

La comparacion de rendimiento con estas alternativas no esta disponible en la informacion proporcionada; el checkpoint objeto de la ficha publica unicamente metricas de seguridad y perplexity, sin equivalentes de MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica de forma explicita que no es un modelo conversacional de proposito general y que no debe desplegarse como asistente.
- Seguridad degradada de forma deliberada: la propia compresion eleva la tasa de exito de ataques, y el estudio cuantifica ese efecto; varias ramas de la rejilla estan degradadas a proposito.
- Sobre-rechazo elevado: el valor macro de sobre-rechazo en WildGuard es 0,3860, lo que implica que el modelo rechaza peticiones legitimas con frecuencia.
- Riesgo de alucinacion: no se documentan mitigaciones; al ser un modelo comprimido sin restauracion, cabe esperar una perdida de fidelidad respecto al modelo base.
- Idiomas: no se especifican los idiomas soportados; el modelo base esta orientado principalmente al ingles.
- Contexto: la longitud de contexto no se confirma en la ficha; se hereda del modelo base, con 4096 tokens en Llama-2-7b-chat.
- Restricciones de licencia: el uso queda sujeto a la Llama 2 Community License y a la politica de uso aceptable (USE_POLICY.md) incluidas en el repositorio; existen restricciones para uso comercial y casos de uso prohibidos.
- Advertencia del autor: hay que evaluar el checkpoint de forma independiente antes de extraer conclusiones.
- Madurez: el repositorio registra 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_base_k0_a1p0_free_remove10
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
