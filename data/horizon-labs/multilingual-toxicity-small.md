# Horizon-Labs/multilingual-toxicity-small

## Resumen

Multilingual Toxicity (small) es un clasificador de comentarios tóxicos multi-etiqueta desarrollado por Horizon-Labs. Se construye sobre el encoder `jhu-clsp/mmBERT-small` (140,6 millones de parámetros) y reproduce el conjunto de siete etiquetas de Detoxify: `toxicity`, `severe_toxicity`, `obscene`, `threat`, `insult`, `identity_attack` y `sexual_explicit`. Su función es servir como filtro de moderación de contenido desplegable en entornos multilingües, con independencia de cada etiqueta mediante activación sigmoide.

El modelo cubre 34 idiomas (inglés, alemán, francés, español, portugués, italiano, neerlandés, polaco, ruso, ucraniano, checo, rumano, sueco, danés, finés, húngaro, griego, turco, árabe, hebreo, persa, hindi, bengalí, urdu, chino, japonés, coreano, vietnamita, tailandés, indonesio, suajili, amárico y tártaro). Se entrenó sobre Civil Comments (CC0) y traducciones del mismo, y se publica con licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en dos factores: por un lado, es un reemplazo directo del clasificador inglés por defecto de LLM Guard (`unitary/unbiased-toxic-roberta`) manteniendo el mismo contrato de etiquetas; por otro, incluye pesos ONNX (incluida una versión int8 de 268 MB) que permiten ejecución en CPU y en el navegador mediante transformers.js, lo que facilita la moderación en el cliente sin enviar texto a un servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-small) |
| Parametros totales | 140.644.231 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncación configurada en el ejemplo de LLM Guard) |
| Tipos de cuantizacion | ONNX int8 (`onnx/model_quantized.onnx`, 268 MB); pesos fp32 en safetensors |
| Idiomas soportados | 34 idiomas (multilingual, en, de, fr, es, pt, it, nl, pl, ru, uk, cs, ro, sv, da, fi, hu, el, tr, ar, he, fa, hi, bn, ur, zh, ja, ko, vi, th, id, sw, am, tt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente una instancia de `mmBERT-small` con 140,6 millones de parámetros. La cabeza de clasificación es multi-etiqueta: cada una de las siete etiquetas recibe una probabilidad independiente mediante sigmoide, sin normalización softmax entre clases, de modo que un mismo comentario puede activar simultáneamente `toxicity`, `insult` y `obscene`. La longitud máxima de entrada es de 512 tokens, suficiente para comentarios y turnos individuales de conversación.

El entrenamiento parte de Civil Comments (licencia CC0) y de un conjunto de traducciones publicado como `Horizon-Labs/civil-comments-multilingual`. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de ajuste fino adicionales más allá del entrenamiento supervisado sobre las etiquetas. Los benchmarks empleados para evaluación se reservaron exclusivamente para test y se eliminaron del entrenamiento los textos coincidentes con ellos, según indica la model card.

## Capacidades

- Clasificación multi-etiqueta de toxicidad con siete categorías independientes (toxicity, severe_toxicity, obscene, threat, insult, identity_attack, sexual_explicit).
- Moderación multilingüe en 34 idiomas, incluyendo lenguajes de bajos recursos como suajili, amárico y tártaro.
- Integración directa con LLM Guard como escáner de entrada (`input_scanners.Toxicity`) y de salida (`output_scanners.Toxicity`), sustituyendo el modelo inglés por defecto.
- Ejecución en CPU y en navegador mediante ONNX y transformers.js (cuantización q8).
- Inferencia por lotes mediante el pipeline de transformers con `top_k=None` para obtener todas las probabilidades.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Moderación de comentarios en foros y plataformas de noticias: el modelo puntúa cada comentario con siete probabilidades y permite aplicar umbrales configurables por etiqueta; su cobertura de 34 idiomas evita mantener un clasificador distinto por mercado.
- Filtrado de entrada y salida en aplicaciones LLM: integrado en LLM Guard, intercepta prompts y respuestas ofensivas antes de mostrarlas al usuario, con el mismo contrato de etiquetas que el modelo inglés de referencia.
- Moderación en el cliente web: los pesos ONNX int8 (268 MB) y la compatibilidad con transformers.js permiten evaluar comentarios en el navegador antes de enviarlos, reduciendo carga del servidor y latencia percibida.
- Detección de discurso de odio por identidad: la etiqueta `identity_attack` permite señalar ataques dirigidos a grupos protegidos, útil como primera capa antes de un modelo especializado como `multilingual-hate-speech-base`.
- Enrutamiento de contenido para revisión humana: comentarios con `toxicity` entre 0,3 y 0,5 se derivan a cola de revisión, mientras que los que superan 0,5 se bloquean automáticamente, ajustando el umbral por idioma dado el sesgo documentado hacia puntuaciones más bajas en no inglés.
- Análisis de toxicidad en investigación social: clasificación por lotes de corpus multilingües para medir prevalencia de insultos, amenazas y obscenidad por comunidad o periodo, con umbrales calibrados sobre el propio corpus.

## Benchmarks y rendimiento

Resultados publicados en la model card. Civil Comments: 20.000 comentarios en inglés, AUC media sobre las 6 etiquetas con al menos 20 positivos. TextDetox: 1.000 textos equilibrados por idioma en 15 idiomas.

| Modelo | Licencia | Civil Comments, AUC media (6 etiquetas) | Civil Comments, AUC toxicity | TextDetox (15 idiomas), AUC | TextDetox, F1 @ 0,5 | Etiquetas |
|---|---|---|---|---|---|---|
| **Este modelo** (141M) | Apache-2.0 | 0,988 | 0,972 | 0,835 | 0,547 | 7 etiquetas Detoxify, multilingüe |
| Horizon-Labs/multilingual-toxicity-base (308M) | Apache-2.0 | 0,988 | 0,971 | 0,854 | 0,433 | 7 etiquetas Detoxify, multilingüe |
| unitary/unbiased-toxic-roberta (125M) | Apache-2.0 | 0,985 | 0,969 | 0,588 | 0,086 | 7 etiquetas Detoxify + identidad, inglés |
| unitary/toxic-bert (110M) | Apache-2.0 | 0,946 | 0,926 | 0,623 | 0,142 | 6 etiquetas, inglés |
| s-nlp/roberta_toxicity_classifier (125M) | OpenRAIL | no disponible en la información | no disponible | no disponible | no disponible | 1 etiqueta binaria |

La cuantización int8 de los embeddings introduce una diferencia media de 0,0009 en probabilidad frente a fp32 sobre 448 textos de test, según la model card.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 140,6 millones de parámetros (unos 560 MB de pesos), más activaciones y overhead; holgadamente ejecutable en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU con latencia de milisegundos por comentario. Para alto throughput, una T4, L4 o RTX 4090 ofrecen margen sobrado; A100/H100 solo tienen sentido en despliegues de moderación a gran escala con batching.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU moderna, y también en CPU y en navegador con la versión ONNX int8.
- Opciones de despliegue: transformers (pipeline), Optimum/ONNX Runtime, transformers.js, LLM Guard con `use_onnx=True`, y Text Embeddings Inference (el tag `text-embeddings-inference` figura en el repositorio).
- Latencia y throughput: no se publican cifras concretas en la información disponible; por el tamaño del modelo, el cuello de botella será el tokenizador y el tamaño de lote más que la GPU.

## Comparativa con modelos similares

| Criterio | multilingual-toxicity-small | multilingual-toxicity-base | unbiased-toxic-roberta |
|---|---|---|---|
| Parámetros | 141M | 308M | 125M |
| Idiomas | 34 | multilingüe (mismo conjunto) | inglés |
| Etiquetas | 7 Detoxify | 7 Detoxify | 7 Detoxify + identidad |
| TextDetox AUC | 0,835 | 0,854 | 0,588 |
| TextDetox F1 @ 0,5 | 0,547 | 0,433 | 0,086 |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| ONNX / navegador | sí (fp32 e int8) | no indicado | no indicado |

Frente a `unitary/toxic-bert` (110M, inglés, 6 etiquetas), este modelo ofrece cobertura multilingüe y una etiqueta adicional, con mejor AUC en Civil Comments (0,988 frente a 0,946). La variante base de 308M mejora la AUC en TextDetox (0,854 frente a 0,835) pero obtiene peor F1 al umbral 0,5 (0,433 frente a 0,547), lo que sugiere una calibración distinta de las probabilidades.

## Limitaciones y advertencias

- Los resultados en idiomas distintos del inglés son notablemente inferiores: AUC de 0,835 y F1 de 0,547 en TextDetox frente a 0,988 de AUC en Civil Comments en inglés. La propia model card recomienda considerar umbrales más bajos para contenido no inglés y validar sobre datos propios.
- Riesgo de falsos positivos y negativos en contextos culturales, ironía, jerga y variantes dialectales; el modelo se entrenó sobre traducciones de Civil Comments, lo que puede introducir artefactos de traducción.
- No es un detector de discurso de odio especializado: para ataques a grupos protegidos con identificación del colectivo, el autor remite a `multilingual-hate-speech-base`.
- No está diseñado para peticiones dañinas a un LLM (armas, autolesión); para ese caso el autor remite a `content-safety-guard-small`.
- La truncación a 512 tokens implica que comentarios o documentos más largos se recortan, perdiendo contexto.
- Aunque la licencia es Apache-2.0, el uso en producción debe acompañarse de revisión humana en decisiones de bloqueo de cuentas o contenido, dado el impacto de los falsos positivos.
- No se publican datos sobre sesgos por grupo demográfico ni auditorías de equidad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-toxicity-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Variante mayor: https://huggingface.co/Horizon-Labs/multilingual-toxicity-base
- Modelo de seguridad de contenido: https://huggingface.co/Horizon-Labs/content-safety-guard-small
- Modelo de discurso de odio: https://huggingface.co/Horizon-Labs/multilingual-hate-speech-base
- Detoxify: https://github.com/unitaryai/detoxify
- unbiased-toxic-roberta: https://huggingface.co/unitary/unbiased-toxic-roberta
- LLM Guard: https://github.com/protectai/llm-guard
- Dataset de evaluación TextDetox: https://huggingface.co/datasets/textdetox/multilingual_toxicity_dataset
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset de traducciones: https://huggingface.co/datasets/Horizon-Labs/civil-comments-multilingual
