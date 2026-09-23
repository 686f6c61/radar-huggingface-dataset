# sahilchachra/Laya-TypedDecisions-MXFP8

## Resumen

Laya-TypedDecisions-MXFP8 es una cuantización en formato MXFP8 del backbone encoder del modelo Laya, publicado por sahilchachra y pensado para ejecutarse con MLX sobre Apple Silicon. El modelo original, convaiinnovations/laya, es un "System 1 decision engine" multilingüe: en lugar de generar texto de forma autorregresiva, produce decisiones tipadas (elecciones entre opciones, puntuaciones calibradas y probabilidades) con una latencia declarada de 33 ms. Este repositorio no contiene el sistema completo, sino únicamente el encoder bidireccional compartido, derivado de ModernBERT-large, con 394.781.696 parámetros reales según el fichero de safetensors y una ventana de contexto de 1024 tokens.

La relevancia de esta ficha es doble. Por un lado, documenta una pieza reutilizable: un extractor de características cuantizado de ~407 MB en disco que puede emplearse como encoder genérico en pipelines de clasificación o feature extraction sobre Macs con chip M-series, sin necesidad de GPU dedicada. Por otro lado, deja constancia explícita de una limitación medible: al ser un encoder pequeño, con muchas LayerNorm y no autorregresivo, es sensible a la cuantización por bloques. El propio autor reporta que con MXFP8 una de cada tres preguntas de prueba de tipo score invirtió su respuesta top-1, y con MXFP4 la desviación media del hidden state frente a fp32 fue de 0,287.

Conviene subrayar que este repositorio no expone la API de decisión de Laya. La cabeza de decisión (un TransformerEncoder de 2 capas en torch, un scorer de marcadores de opción y una cabeza act/escalate, ~15M de parámetros) queda fuera de la publicación, de modo que `laya.load(...)` y `RLAgent` siguen requiriendo el repositorio upstream. Aquí solo se publica el encoder cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertModel (encoder bidireccional, transformer, vía mlx-embeddings); atención local/global alterna con RoPE |
| Parametros totales | 394.781.696 (dato real de safetensors); el modelo base se describe como 421M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (max_position_embeddings); atención local de 128 y atención global cada 3 capas |
| Tipos de cuantizacion | MXFP8 (mode="mxfp8", group size 32). Existen variantes MXFP4 y MXFP8 de los backbones English, Multilingual y Typed-Decisions |
| Idiomas soportados | No disponible en la ficha de este repo; el proyecto Laya distribuye variantes "English" y "Multilingual", y el modelo base se verifica contra ModernBERT-large y mmBERT-base |
| Licencia | No disponible en la ficha del repo; el modelo upstream convaiinnovations/laya-typed-decisions declara Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), librería mlx |

## Arquitectura y entrenamiento

La arquitectura es la de ModernBERT en su tamaño large: 28 capas, hidden size de 1024, atención bidireccional con patrón alterno de atención local (ventana de 128 tokens) y atención global cada 3 capas, y RoPE aplicado con distintos valores de theta para las capas locales y globales. No hay decodificación autorregresiva ni plantilla de chat. Sobre el backbone, Laya añade en el modelo original una cabeza de decisión propia implementada en torch y definida en su `rl_common.py`, entrenada de forma separada mediante RL (RLCD, Reinforcement Learning from Contrastive Distillation), que es la responsable de emitir decisiones tipadas. Esa cabeza no se incluye aquí.

Respecto al entrenamiento del encoder publicado, la información disponible no detalla el número de tokens, la composición del dataset ni el pipeline de alineación del backbone. Lo que sí se documenta es el proceso de cuantización y verificación: el modelo se cuantizó con `mlx-embeddings` mediante `nn.quantize(..., mode="mxfp8")` con group size 32, usando un class predicate que solo cuantiza los módulos que exponen `to_quantized` y tienen escalas presentes en los pesos. La verificación se hizo en dos etapas. Primero, se comprobó la corrección del port a MLX sin cuantizar frente a la referencia torch en bf16/fp32, obteniendo una diferencia absoluta máxima de 0,045 y una media de 0,0025 sobre textos no vistos (los hidden states tienen una magnitud media absoluta de ~0,63). Después, se evaluó la calidad de decisión de extremo a extremo alimentando el hidden state cuantizado en la cabeza de decisión torch original sin modificar.

El autor es explícito sobre el caveat: a diferencia de los modelos decoder-only modernos, donde la cuantización MXFP4 típicamente introduce perturbaciones medias del 1-5 %, este encoder sufre desviaciones del 35-45 % en términos relativos, porque es pequeño y tiene una presencia alta de LayerNorm.

## Capacidades

- Extracción de características de texto: genera `last_hidden_state` a partir de secuencias de hasta 1024 tokens, con salida utilizable para embeddings o como entrada a cabezas propias.
- Clasificación de texto y decisiones tipadas: el backbone subyacente es el mismo que sustenta la evaluación de opciones (choice/score) y la clasificación de prompts de moderación y sentimiento en Laya.
- Scoring de opciones con escalado de confianza: en la versión original, la cabeza produce puntuaciones para opciones candidatas; con este encoder cuantizado las puntuaciones deben tratarse como direccionales, no exactas.
- Construcción de cabezas personalizadas en MLX: al publicarse solo el backbone, es posible entrenar o conectar cabezas propias (clasificación, ranking, regresión) sobre el hidden state.
- Soporte multilingüe potencial: no confirmado en esta ficha, pero el proyecto base distribuye backbones "Multilingual" derivados de mmBERT.
- No soporta tool calling, function calling, razonamiento multi-step, agentes, generación de texto, código ni matemáticas: no existe ruta `generate()` ni plantilla de chat.
- No soporta visión ni audio.

## Casos de uso

- Extracción de embeddings en aplicaciones macOS nativas: el modelo se carga con mlx-embeddings sobre Apple Silicon y produce vectores de 1024 dimensiones para búsqueda semántica o clustering local, sin GPU dedicada y con un peso en disco de ~407 MB.
- Clasificación de textos cortos en el borde: con 1024 tokens de contexto, encaja en tareas de etiquetado de tickets, categorización de correos o análisis de sentimiento por fragmento, donde la latencia importa más que la profundidad de razonamiento.
- Detección de contenido y moderación: el backbone procede de un sistema entrenado con prompts de moderación; puede servir como extractor previo a un clasificador propio de toxicidad o política de contenido.
- Ranking de respuestas candidatas: aprovechando que el modelo base evalúa opciones, el encoder puede alimentar un scorer que ordene alternativas (respuestas de chatbot, resultados de búsqueda, variantes de copy).
- Prototipado de cabezas de decisión en MLX: investigadores que quieran reproducir el enfoque de decisiones tipadas pueden partir de este backbone cuantizado y entrenar su propia cabeza, ahorrando memoria frente al modelo en bf16.
- Pipeline de evaluación comparativa de cuantizaciones: sirve como caso de estudio reproducible para medir el impacto de MXFP8 frente a fp32 en encoders pequeños con muchas LayerNorm.
- Preprocesado de features para modelos mayores: usar el encoder como extractor congelado de representaciones de 1024 dimensiones que alimenten un modelo downstream más pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, GLUE, HumanEval u otros). Lo que sí se documenta son métricas de verificación numérica frente a la referencia torch en fp32:

| Metrica | MXFP4 | MXFP8 |
|---|---|---|
| Diferencia media absoluta del hidden state del encoder vs fp32 | 0,287 | 0,218 |
| Diferencia maxima absoluta del logit de la cabeza de decision | 0,313 | 0,646 |
| Fallos de coincidencia top-1 (de 3 preguntas de prueba) | 0/3 | 1/3 |

Datos adicionales de la verificación del port sin cuantizar: diferencia absoluta máxima de 0,045 y media de 0,0025 en el hidden state frente a la referencia torch. Contexto: los hidden states tienen magnitud media absoluta de ~0,63. El autor indica que las respuestas top-1 coincidieron en 5 de 6 combinaciones de checkpoint y modo, y que las puntuaciones de confianza cuantizadas deben interpretarse como direccionales.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa ~407 MB en disco; al ser un modelo MLX sobre memoria unificada, el consumo real depende del runtime y del tamaño de lote.
- GPU recomendadas: el modelo está pensado para Apple Silicon (M-series) mediante MLX. No está preparado para CUDA y no se documenta soporte para A100, H100 o RTX 4090 sin conversión previa a otro framework.
- Compatibilidad con GPU de consumo: no disponible como dato explícito; el formato MLX lo orienta a equipos Mac con memoria unificada.
- Opciones de despliegue: mlx-embeddings con MLX. Se requiere cargar `ModernBertModel` con `ModelArgs` construido a partir de `config.json`, aplicar `nn.quantize` con los parámetros de `cfg["quantization"]` y cargar los pesos desde `model.safetensors` con `safe_open`.
- No compatible con LM Studio: el autor lo indica explícitamente, ya que Laya es un encoder no autorregresivo con cabeza de scoring personalizada y carece de ruta de generación y plantilla de chat.
- vLLM, llama.cpp, Ollama y TGI: no aplicables al formato publicado, que es específico de MLX. No se documenta ninguna vía oficial de conversión en la información disponible.
- Latencia y throughput: no disponibles para este repositorio; el proyecto Laya declara 33 ms de latencia para el sistema completo en su presentación oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sahilchachra/Laya-TypedDecisions-MXFP8 | 394,8M | 1024 | MXFP8, group size 32 | No disponible en ficha (upstream Apache-2.0) | MLX / Apple Silicon |
| sahilchachra/Laya-TypedDecisions-MXFP4 | No disponible (mismo backbone) | 1024 | MXFP4 | No disponible en ficha | MLX / Apple Silicon |
| convaiinnovations/laya (upstream) | ~421M backbone + ~15M cabeza de decision | 1024 | bf16/fp32 | Apache-2.0 (segun laya-typed-decisions) | torch, API `laya.load(...)` / `RLAgent` |
| answerdotai/ModernBERT-large | 395M aprox. (arquitectura de referencia) | 8192 en el modelo original (este port usa 1024) | bf16/fp32 | Apache-2.0 | transformers, safetensors |

La comparación principal es con el propio upstream: este repositorio sacrifica la cabeza de decisión y la API de Laya a cambio de una huella de memoria mucho menor y ejecución nativa en MLX. Frente a ModernBERT-large original, este port limita la ventana a 1024 tokens y la cuantiza, con la sensibilidad numérica ya descrita.

## Limitaciones y advertencias

- No es un modelo generativo: no existe ruta `generate()` ni plantilla de chat, por lo que no puede usarse como asistente conversacional ni con LM Studio.
- No incluye la cabeza de decisión: `laya.load(...)` y `RLAgent` no funcionan con este repositorio; para la API real hay que usar convaiinnovations/laya.
- Sensibilidad alta a la cuantización: el autor reporta perturbaciones medias del 35-45 % en el hidden state, muy por encima del 1-5 % típico en modelos decoder-only. Una de tres preguntas de prueba invirtió su respuesta top-1 en MXFP8.
- Puntuaciones no calibradas: las confianzas del modelo cuantizado deben tratarse como direccionales. Para decisiones con desempate fino o calibración estricta, se recomienda el encoder original en bf16/fp32.
- Contexto limitado a 1024 tokens, muy inferior a los 8192 del ModernBERT-large de referencia, lo que restringe tareas de documento largo.
- Idiomas: no declarados en esta ficha. No se debe asumir cobertura multilingüe sin verificar la variante correspondiente.
- Licencia: no disponible en la ficha de este repositorio. Antes de un uso comercial conviene confirmar la licencia aplicable con el autor, aunque el upstream laya-typed-decisions declare Apache-2.0.
- Dependencia de plataforma: el formato MLX ata el modelo a Apple Silicon; no hay soporte documentado para CUDA ni para runtimes de inferencia estándar.
- Sesgos: no se documentan análisis de sesgo en la información disponible, y el hecho de que el upstream se entrene con RL sobre datos de decisión implica que los sesgos del dataset subyacente se heredan sin mitigación publicada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas o confianzas mal calibradas en la cabeza que se construya sobre el encoder.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sahilchachra/Laya-TypedDecisions-MXFP8
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Rama typed-decisions del modelo base: https://huggingface.co/convaiinnovations/laya/tree/main/typed-decisions
- Modelo upstream laya-typed-decisions: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Cuantización hermana English MXFP4: https://huggingface.co/sahilchachra/Laya-English-MXFP4
- Cuantización hermana English MXFP8: https://huggingface.co/sahilchachra/Laya-English-MXFP8
- Cuantización hermana Multilingual MXFP4: https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP4
- Cuantización hermana Multilingual MXFP8: https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP8
- Cuantización hermana Typed-Decisions MXFP4: https://huggingface.co/sahilchachra/Laya-TypedDecisions-MXFP4
- MLX: https://github.com/ml-explore/mlx
- mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
- ModernBERT-large (referencia de la arquitectura): https://huggingface.co/answerdotai/ModernBERT-large
- Sitio oficial de Laya: https://laya.convaiinnovations.com/
- Sitio divulgativo de Laya: https://laya-ai.com/
- Perfil de GitHub del autor: https://github.com/SahilChachra/SahilChachra
