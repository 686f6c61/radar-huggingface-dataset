# netprojects/granite-switch-4.1-30b-mlx-8bit

## Resumen

Granite Switch 4.1.1 30B es un modelo de lenguaje de IBM que combina un transformer denso con dos adaptadores aLoRA (activated LoRA) embebidos en el checkpoint, lo que permite tres comportamientos distintos seleccionables por petición: chat convencional, decisión calibrada entre opciones etiquetadas y juicio de seguridad. Esta ficha describe la conversión a 8 bits para Apple Silicon publicada por NetProjects (Internet Projects Ltd), no afiliada a IBM, generada con MLX y pensada para ejecutarse de forma nativa en chips de la serie M.

El modelo base es Granite 4.1 30B, un transformer denso con GQA, RoPE y 128K tokens de contexto, con 28.865.740.800 parámetros. La conversión aplica cuantización afín de 8 bits con tamaño de grupo 64, lo que reduce el peso a 32,1 GB y permite su ejecución en equipos con 64 GB o más de memoria unificada. Los adaptadores se almacenan en bf16 a sus rangos originales (16 para `guardian-core`, 64 para `decision`), de modo que la precisión de las cabeceras de decisión y seguridad no se ve degradada por la cuantización.

La relevancia de esta build es práctica: ofrece en un único prefijo de conversación tres modos que normalmente requerirían tres modelos separados, con verificación numérica frente a la implementación de referencia de IBM (error relativo máximo de logits de 4e-7) y una tasa de coincidencia del 99,8% en 500 decisiones etiquetadas por humanos frente a la conversión bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (GQA, RoPE) con adaptadores aLoRA embebidos; arquitectura `granite_switch` en MLX-LM |
| Parametros totales | 28.865.740.800 (28,87B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | 8 bits afín, group size 64 (existe build de 4 bits del mismo autor) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 32,1 GB; repo de 64,2 GB |
| Libreria | mlx |
| Modelo base | ibm-granite/granite-switch-4.1-30b (revision `d0a8805`) |
| Adaptadores incluidos | `decision` (rango 64, bf16), `guardian-core` (rango 16, bf16) |
| Modalidad | Solo texto (sin el encoder de voz Granite Speech 5.0 TurboCTC) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de IBM con atención de consultas agrupadas (GQA) y embeddings posicionales rotatorios (RoPE), con una ventana de contexto de 128K tokens. Sobre ese tronco congelado se activan dos adaptadores aLoRA: todo lo anterior al token de control del adaptador se ejecuta en el modelo base, y solo a partir de ese token se activan las capas LoRA correspondientes. Esto permite reutilizar un mismo prefijo de conversación para chat, decisión y verificación de seguridad, y es la innovación técnica central de la familia Granite Switch.

El adaptador `decision` (rango 64) produce una probabilidad calibrada para cada opción etiquetada (A, B, C...) leída directamente del primer token de respuesta, lo que evita generar texto completo para clasificar. El adaptador `guardian-core` (rango 16, derivado de `ibm-granite/granitelib-guardian-r1.0`) actúa como juez de seguridad y devuelve `{"score": "yes"}` o `{"score": "no"}` para un criterio dado. La revisión 4.1.1 reentrena únicamente el adaptador `decision`; el modelo base y `guardian-core` son idénticos byte a byte a la versión 4.1. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en 12 idiomas, con contexto de hasta 128K tokens.
- Clasificación calibrada entre opciones etiquetadas mediante el adaptador `decision`, devolviendo una distribución de probabilidad sobre las alternativas.
- Juicio de seguridad mediante `guardian-core`, con salida estructurada `{"score": "yes"}` / `{"score": "no"}` para un criterio configurable.
- Enrutamiento de adaptadores por token de control dentro de una misma conversación, sin recargar el modelo.
- Generación por lotes (batched generation) y cachés de prompt compatibles con MLX-LM.
- Capacidad de decisión sobre afirmaciones y verificación factual: 0,858 de accuracy en 500 reclamaciones públicas etiquetadas (LLM-AggreFact y VitaminC).
- No incluye visión, audio ni tool calling nativo documentado en esta build; el encoder de voz de IBM queda fuera de la conversión.

## Casos de uso

- Enrutamiento de tickets de soporte: el adaptador `decision` clasifica el texto del cliente entre equipos (por ejemplo, pagos, acceso, otros) con una latencia de 214 ms en prompts cortos y 2,3 s de mediana en prompts de ~1.200 tokens, lo que permite integrarlo en un pipeline de triaje en tiempo real.
- Moderación de contenido en producción: `guardian-core` evalúa prompts o respuestas frente a un criterio de daño y devuelve una etiqueta binaria estructurada, apta para un filtro previo o posterior a la generación.
- Verificación factual en pipelines de RAG: el modo decisión permite comprobar si un documento respalda una afirmación (accuracy de 0,858 sobre datos públicos), con la ventaja de que la misma conversación puede continuar en modo chat para explicar el resultado.
- Asistente conversacional local en Mac: el modo chat sin adaptador ofrece generación a 18 tokens/s en un M5 Max con 128 GB, suficiente para un asistente de escritorio privado sin conexión.
- Anotación y etiquetado de datasets: el modo decisión produce distribuciones de probabilidad calibradas sobre categorías, útiles para preetiquetar grandes volúmenes y priorizar la revisión humana por incertidumbre.
- Clasificación de riesgo en flujos de atención al cliente: combinación de `decision` para categorizar la solicitud y `guardian-core` para detectar intentos de uso malicioso, reutilizando el mismo prefijo de conversación y evitando cargar dos modelos.
- Evaluación de políticas internas: uso de `guardian-core` con criterios personalizados para auditar respuestas de otros sistemas antes de su publicación.

## Benchmarks y rendimiento

Datos de verificación publicados por el autor de la conversión:

| Prueba | Resultado 8-bit | Referencia |
|---|---|---|
| Ejemplo de decisión de la model card de IBM | 0,999 / 0,0001 / 0,001 (elige A) | vLLM de IBM: 0,982 / 0,0035 / 0,014 |
| Guardian, prompt dañino vs benigno | P(yes) 1,00 / 0,00 | — |
| Coincidencia de decisión con conversión bf16 (500 reclamaciones) | 499/500 (99,8%), KL media 0,0006 | bf16 |
| Accuracy frente a etiquetas humanas (500 reclamaciones) | 0,858 | bf16: 0,858; build 4.1: 0,844 |
| Error relativo máximo de logits frente a implementación HF fp32 | 4e-7 | — |

Rendimiento en MacBook Pro M5 Max (128 GB), MLX 0.32.4, greedy, una petición a la vez, mediana de 3 ejecuciones:

| Métrica | 8-bit |
|---|---|
| Generación de chat (respuestas de 512 tokens) | 18 tokens/s |
| Decisión, prompt corto (78 tokens) | 214 ms |
| Decisión, prompt de ~1.200 tokens (mediana / p95) | 2,3 s / 4,8 s |
| Lectura de prompt a ~1.200 tokens | ~530 tokens/s |
| Memoria pico | 30,1 GB (31,6 GB con prompts de ~1.200 tokens) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 30,1 GB en pico para inferencia en 8 bits; 31,6 GB con prompts de ~1.200 tokens. La build de 4 bits del mismo autor ocupa 17,6 GB.
- Hardware objetivo: Apple Silicon con MLX. El autor lo probó en un M5 Max de 128 GB; se requiere un equipo con al menos 32 GB de memoria unificada para la build de 8 bits y margen para el sistema.
- GPU NVIDIA: no aplicable a esta build; el formato MLX no se ejecuta en CUDA. Para A100/H100/RTX 4090 habría que usar los pesos originales de IBM con vLLM o TGI.
- Cabe en GPU de consumo: solo en el ecosistema Apple Silicon (M-series con memoria suficiente). No cabe en RTX 4090 (24 GB) en 8 bits.
- Despliegue: paquete `granite-switch-mlx` (registra la arquitectura `granite_switch` en MLX-LM); también compatible con `mlx_lm.load` tras llamar a `granite_switch_mlx.register()`.
- Throughput: 18 tokens/s en generación de chat y ~530 tokens/s de lectura de prompt en M5 Max; la build de 4 bits alcanza 32 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/granite-switch-4.1-30b-mlx-8bit | 28,87B | 128K | MLX 8-bit | Apache 2.0 | Tres modos vía aLoRA; 30,1 GB; 18 tok/s en M5 Max |
| netprojects/granite-switch-4.1-30b-mlx-4bit | 28,87B | 128K | MLX 4-bit | Apache 2.0 | 17,6 GB; 32 tok/s; menor precisión en pesos |
| netprojects/granite-switch-4.1-8b-mlx-8bit | ~8B | no disponible | MLX 8-bit | Apache 2.0 | 9,4 GB; prioriza velocidad sobre tamaño |
| ibm-granite/granite-switch-4.1-30b | 28,87B | 128K | safetensors (bf16) | Apache 2.0 | Modelo base original; requiere vLLM u otra pila CUDA |

## Limitaciones y advertencias

- Solo texto: la build excluye el encoder de voz de IBM, por lo que no admite entrada de audio.
- Exclusiva de Apple Silicon: el formato MLX no es portable a CUDA ni a CPU convencional sin reconversión.
- La cuantización de 8 bits introduce una desviación mínima pero no nula frente a bf16 (KL media de 0,0006 en decisiones); para aplicaciones sensibles a la calibración exacta conviene validar con el modelo base.
- Riesgo de alucinación inherente al modelo base de 30B, no mitigado por los adaptadores; `guardian-core` es un juez de seguridad, no un verificador factual.
- El adaptador `decision` está calibrado para opciones etiquetadas y criterios concretos; su rendimiento fuera de esa distribución (categorías muy numerosas o ambiguas) no está documentado.
- El modo guardian devuelve una etiqueta binaria para un criterio dado; no sustituye una política de moderación completa ni una revisión humana.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la conversión no está afiliado a IBM y no ofrece garantías sobre el modelo base.
- El rendimiento medido (18 tok/s) corresponde a un M5 Max de gama alta; en equipos con menos memoria o generaciones anteriores será considerablemente menor.
- No se dispone de información sobre sesgos específicos del modelo base en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/granite-switch-4.1-30b-mlx-8bit
- Modelo base: https://huggingface.co/ibm-granite/granite-switch-4.1-30b
- Build de 4 bits: https://huggingface.co/netprojects/granite-switch-4.1-30b-mlx-4bit
- Build de 8B en 8 bits: https://huggingface.co/netprojects/granite-switch-4.1-8b-mlx-8bit
- Paquete de inferencia: https://github.com/internet-projects/granite-switch-mlx
- MLX: https://github.com/ml-explore/mlx
- Dataset LLM-AggreFact: https://huggingface.co/datasets/lytang/LLM-AggreFact
- Dataset VitaminC: https://huggingface.co/datasets/tals/vitaminc
- NetProjects: https://netprojects.com
