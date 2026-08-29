# ProCreations/ReasonShield

## Resumen

ReasonShield es un clasificador de seguridad multimodal de 3.8B parámetros, desarrollado por ProCreations como fine-tune de Shieldstral 1.0 3B de Mistral AI. Está diseñado para moderación de contenido, guardrails y clasificación de seguridad adaptativa a políticas, y produce un resumen de decisión visible y eficiente en tokens antes de emitir un veredicto final "yes" o "no". El modelo acepta entradas de texto e imagen, soporta doce idiomas y opera dentro de una ventana de contexto de 32.768 tokens, lo que lo hace adecuado para despliegues en producción donde se requiere trazabilidad en las decisiones de moderación.

Su relevancia actual radica en que combina un tamaño reducido (3B) con capacidades multimodales y multilingües, algo poco común en clasificadores de seguridad. Al estar basado en Shieldstral, hereda su interfaz de política `<Instruct>`, `<Query>` y `<Document>`, y ofrece dos modos de salida: un modo razonado con resumen visible y un modo de scoring de un token compatible con el flujo original de Shieldstral. La licencia Apache 2.0 permite uso comercial sin restricciones, y su arquitectura transformer estándar facilita su integración en stacks existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basada en Mistral 3 / Shieldstral 1.0 3B) |
| Parametros totales | 3.849.090.048 (3,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16 (pesos publicados), GGUF disponible en repositorio separado |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar, ru (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

ReasonShield es un fine-tune completo de Shieldstral 1.0 3B, un modelo transformer multimodal de Mistral AI. La arquitectura base mantiene el procesamiento conjunto de texto e imagen, con un codificador visual y un decodificador de lenguaje. El fine-tune se realizó en dos etapas con LoRA de rango 64: primero una etapa de texto con secuencias empaquetadas de 32k tokens, y después un ensayo multimodal conservador. Un ensayo final de recuperación de rango 32, utilizando 4.291 imágenes públicas de armas y 800 imágenes curadas sin armas, corrigió una regresión visual detectada en datos held-out sin sacrificar las ganancias en texto. Todos los adaptadores se fusionaron en los pesos BF16 publicados.

El corpus de entrenamiento contiene 200.000 ejemplos anotados de forma independiente: 160.000 de texto y 40.000 de visión, con un 60% en inglés y el 40% restante repartido entre los otros once idiomas. Incluye juicios de política sobre texto, imágenes, OCR y combinaciones de imagen con pie de foto. El profesor utilizado fue un Qwen3.8 27B en NVFP4 con aceleración DFlash2, configurado con contexto de servidor de 32.768 tokens y concurrencia de 32 vías. El razonamiento oculto del profesor se deshabilitó y excluyó; solo se entrenó el campo `rationale` intencionadamente corto como resumen de decisión visible. No se usaron ejemplos de benchmarks públicos para el SFT.

## Capacidades

- Clasificación de seguridad y moderación de contenido: evalúa si un documento cumple los requisitos de una política dada, devolviendo un veredicto binario "yes" o "no".
- Razonamiento visible adaptativo: genera un resumen de decisión breve dentro de etiquetas `thinking` y `response`, que puede ser tan corto como unos pocos tokens en casos simples o más extenso en casos ambiguos.
- Multimodal: procesa texto, imágenes, OCR y combinaciones de imagen con texto, con detección de objetos (por ejemplo, armas) evaluada en F1.
- Multilingüe: soporta doce idiomas, incluyendo árabe, chino, japonés y ruso, con evaluación específica en árabe mediante ArabSafe.
- Modo de scoring de un token: compatible con el prompt original de Shieldstral y `max_tokens=1`, lo que permite integración directa en pipelines existentes de Shieldstral.
- Interfaz de política estructurada: usa el formato `<Instruct>`, `<Query>` y `<Document>` para definir políticas personalizadas por llamada.

## Casos de uso

- Moderación de contenido en redes sociales: ReasonShield puede evaluar publicaciones de texto e imágenes contra políticas de la plataforma (discurso de odio, violencia, contenido explícito) con un resumen visible que facilita la auditoría. Su ventana de 32k tokens permite procesar hilos completos o documentos largos en una sola llamada.
- Guardrails para asistentes conversacionales: integrado como filtro previo o posterior en chatbots, bloquea respuestas que violen políticas de seguridad. El modo de un token permite decisiones de baja latencia, mientras que el modo razonado ofrece trazabilidad para revisión humana.
- Filtrado de contenido educativo: plataformas de e-learning pueden usar el modelo para garantizar que los materiales (texto, imágenes, capturas) cumplan directrices de adecuación para distintos rangos de edad, con evaluación multilingüe para cursos internacionales.
- Moderación de imágenes en plataformas UGC: la capacidad de detección de armas (F1 96,04 en datos held-out) lo hace útil para filtrar imágenes peligrosas en foros, marketplaces o redes sociales antes de su publicación.
- Cumplimiento normativo multilingüe: empresas que operan en múltiples jurisdicciones pueden desplegar ReasonShield para verificar que el contenido generado por usuarios cumple regulaciones locales (por ejemplo, leyes de discurso de odio en la UE o estándares de contenido en Asia), gracias a su soporte de doce idiomas.
- Evaluación de seguridad en pipelines de IA generativa: como componente de un sistema de guardrails, ReasonShield puede clasificar las salidas de modelos generativos (texto e imagen) contra políticas personalizadas, con un resumen de decisión que permite depurar falsos positivos y negativos en producción.

## Benchmarks y rendimiento

La model card publica resultados de evaluación en splits públicos held-out, comparando Shieldstral directo, ReasonShield directo (prompt original de Shieldstral con umbral 0,5) y ReasonShield adaptativo (resumen visible con veredicto final parseado). Los resultados de HarmBench y ArabSafe se reportan como recall porque esos pools contienen solo comportamientos positivos. La evaluación MultilingualSafety cubre once idiomas; árabe se mide por separado en ArabSafe, y el test privado cubre los doce idiomas.

| Evaluacion | Shieldstral directo | ReasonShield directo | ReasonShield adaptativo | Delta adaptativo |
|---|---:|---:|---:|---:|
| ArabSafe-Recall (recall) | 70,00 | 78,00 | 83,00 | +13,00 |
| HarmBench-Recall (recall) | 98,44 | 99,38 | 83,75 | -14,69 |
| MultilingualSafety (f1) | 49,11 | 56,39 | 61,45 | +12,34 |
| PolyGuard-education (f1) | 62,29 | 81,71 | 75,60 | +13,31 |
| PolyGuard-social_media (f1) | 72,65 | 80,12 | 77,72 | +5,08 |
| ToxicChat (f1) | 82,21 | 78,12 | 74,09 | -8,12 |
| WildGuardTest-Prompt (f1) | 88,77 | 87,33 | 82,85 | -5,92 |
| Macro F1 | 71,00 | 76,73 | 74,34 | +3,34 |

| Evaluacion visual | Shieldstral | ReasonShield | Delta |
|---|---:|---:|---:|
| Deteccion de armas held-out (F1) | 92,68 | 96,04 | +3,36 |

El modo adaptativo mejora el F1 macro en +3,34 puntos respecto a Shieldstral, con ganancias notables en MultilingualSafety (+12,34) y PolyGuard-education (+13,31), pero pierde recall en HarmBench (-14,69) y F1 en ToxicChat (-8,12) y WildGuardTest (-5,92). El modo directo de ReasonShield mantiene un perfil más equilibrado, con mejora en ArabSafe, MultilingualSafety y PolyGuard, aunque con ligeras caídas en ToxicChat y WildGuardTest.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 de 3,8B ocupan aproximadamente 7,7 GB, por lo que caben en GPUs consumer con 8 GB o más. Con cuantización GGUF (por ejemplo, Q4_K_M) el uso de VRAM baja a unos 3-4 GB.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4060 Ti 16 GB, o GPUs de datacenter como A10, A100 y H100. Para despliegues de baja latencia con el modo de un token, una RTX 4090 es suficiente.
- Compatibilidad con consumer GPU: sí, tanto en BF16 (con 8-12 GB) como en GGUF cuantizado (con 4-6 GB).
- Opciones de despliegue: Transformers (inferencia nativa multimodal), vLLM o SGLang para serving de solo texto, y llama.cpp/Ollama mediante los builds GGUF publicados en ProCreations/ReasonShield-GGUF.
- Latencia y throughput: no se han publicado cifras oficiales. El modo de un token permite respuestas de un solo token, lo que en GPUs modernas se traduce en latencias de decenas de milisegundos. El modo adaptativo genera un resumen variable, con mayor latencia en casos ambiguos.

## Comparativa con modelos similares

La comparación directa más relevante es con su modelo base, Shieldstral 1.0 3B, ya que ambos comparten arquitectura, interfaz y rango de contexto. No se dispone de datos públicos de otros clasificadores de seguridad del mismo tamaño (por ejemplo, Llama Guard 3 1B o WildGuard) en las mismas evaluaciones, por lo que la comparativa se limita a la pareja base/fine-tune.

| Modelo | Parametros | Contexto | Multimodal | Idiomas | Licencia | F1 macro (eval. publicada) |
|---|---:|---:|---:|---:|---:|---:|
| Shieldstral 1.0 3B | 3,8B | 32.768 | Sí | 12 | Apache 2.0 | 71,00 |
| ReasonShield (directo) | 3,8B | 32.768 | Sí | 12 | Apache 2.0 | 76,73 |
| ReasonShield (adaptativo) | 3,8B | 32.768 | Sí | 12 | Apache 2.0 | 74,34 |

ReasonShield supera a Shieldstral en F1 macro en ambos modos, con la mayor ganancia en el modo directo (+5,73 puntos). El modo adaptativo ofrece mejor trazabilidad pero a costa de un ligero descenso respecto al directo, debido a errores de parseo en salidas malformadas.

## Limitaciones y advertencias

- La clasificación de seguridad es dependiente de la política y del umbral: un mismo documento puede recibir veredictos distintos según la instrucción y el umbral de decisión configurado. Las aplicaciones deben validar umbrales con tráfico propio.
- El resumen de razonamiento puede sonar plausible mientras el veredicto es incorrecto; no debe interpretarse como una explicación fiable de la decisión. Se recomienda revisión humana para decisiones consecuentes.
- El modelo puede heredar sesgos y lagunas de su base (Shieldstral), del profesor (Qwen3.8 27B) y del corpus sintético de entrenamiento. La evaluación en árabe (ArabSafe) muestra recall del 83%, lo que indica margen de mejora en ese idioma.
- La moderación visual debe probarse con la distribución de imágenes real del despliegue; el rendimiento en detección de armas (F1 96,04) no garantiza resultados en otras categorías visuales.
- El modo adaptativo puede producir salidas malformadas que se cuentan como error en la evaluación; en producción es necesario un parseo robusto de la última línea no vacía.
- Los adaptadores multimodales compatibles con OpenAI (por ejemplo, en vLLM) difieren en el manejo de tokens de imagen; se debe validar la versión exacta de serving contra la inferencia nativa de Transformers antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/ReasonShield
- Repositorio GGUF: https://huggingface.co/ProCreations/ReasonShield-GGUF
- Dataset de entrenamiento: https://huggingface.co/ProCreations/ReasonShield-Dataset
- Página de modelos de ProCreations: https://huggingface.co/ProCreations/models
- Perfil de ProCreations en AI Market Cap: https://aimarketcap.tech/providers/procreations
