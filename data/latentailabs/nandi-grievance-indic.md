# LatentAILabs/nandi-grievance-indic

## Resumen
Nandi (`nandi-grievance-indic`) es un clasificador de texto basado en un encoder XLM-RoBERTa-large de aproximadamente 560 millones de parámetros, desarrollado por LatentAILabs (Arun Prabhakaran) como lanzamiento personal independiente. Su función es leer una queja o reclamación de un cliente en hindi, hinglish, otras diez lenguas indias o inglés, y devolver una de 53 categorías de reclamación, las tres categorías más probables con sus probabilidades y un nivel de urgencia (P1/P2/P3). Las categorías siguen las listas de reclamaciones de organismos reguladores y sistemas de quejas de la India: RBI (banca), IRDAI (seguros), CPGRAMS (servicios gubernamentales centrales), TRAI/DoT (telecomunicaciones) y la línea nacional de atención al consumidor, además de una clase "no es una reclamación".

El modelo resuelve el problema de encaminar tickets de atención al cliente en un contexto multilingüe indio con mezcla de códigos (hinglish, texto romanizado), donde los clasificadores monolingües o entrenados solo en inglés fallan. Frente a un LLM zero-shot grande, la propuesta de Nandi es ser pequeño, local, rápido y de licencia Apache-2.0 para uso comercial, ejecutable en CPU o GPU sin llamadas a API.

Es relevante ahora porque ofrece pesos abiertos para un dominio regulado y muy específico (banca, seguros, telecomunicaciones, quejas gubernamentales en la India) con una API Python `route()` lista para producción, aunque el propio autor advierte que la categoría es utilizable solo con revisión humana y que la urgencia es experimental. La entrada máxima es de 512 tokens y todos los datos de entrenamiento son sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con mean pooling y dos cabezas: una de 53 clases (categoría) y otra de 3 clases (urgencia) |
| Parametros totales | 559.890.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 tokens (los textos más largos se truncan) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hi, en, bn, ta, te, mr, gu, kn, ml, pa, ur, or, multilingual (hindi, hinglish, bengalí, tamil, telugu, maratí, gujarati, kannada, malayalam, punyabí, urdu, odia e inglés indio, en escritura nativa y romanizada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
Nandi es un encoder transformer XLM-RoBERTa-large (aproximadamente 560 millones de parámetros) con mean pooling sobre la salida del encoder. Sobre esa representación se montan dos cabezas pequeñas: una cabeza de clasificación de 53 vías para la categoría de reclamación y una cabeza de 3 vías para el nivel de urgencia (P1, P2 y P3). El modelo devuelve también el dominio, la confianza y las tres categorías más probables con sus probabilidades.

El entrenamiento consistió en 3 épocas sobre 109.776 reclamaciones y no-reclamaciones sintéticas en 13 idiomas, generadas con un modelo escritor distinto del usado en el conjunto de test sintético. No se indica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un encoder clasificador, el ajuste es supervisado sobre etiquetas. La innovación destacable no es arquitectónica sino de dominio: una taxonomía de 53 categorías alineada con las listas oficiales de RBI, IRDAI, CPGRAMS, TRAI/DoT y la línea nacional de atención al consumidor, más una clase explícita "no es una reclamación", y soporte para texto code-mixed y romanizado.

## Capacidades
- Clasificación de reclamaciones en 53 categorías con dominio asociado (banca, seguros, telecomunicaciones, consumo, servicios gubernamentales, etc.).
- Devolución de las tres categorías más probables con sus probabilidades (top-3).
- Detección de urgencia en tres niveles (P1, P2, P3) con probabilidades por clase, marcada como experimental sobre texto real.
- Clasificación de "no es una reclamación" mediante la clase `none.out_of_scope`.
- Soporte multilingüe en 13 idiomas indios e inglés, en escritura nativa y romanizada, incluyendo hinglish y texto code-mixed.
- API Python `route()` y `route_batch()` para inferencia individual y por lotes.
- Ejecución local en CPU o GPU sin llamadas a API externas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de clasificación, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso
- Enrutamiento de tickets de atención al cliente: el modelo clasifica cada reclamación entrante en una de las 53 categorías y la dirige al equipo correcto (banca, seguros, telecomunicaciones) con la top-3 como alternativa cuando la confianza es baja, lo que permite un triaje automático con revisión humana en los casos dudosos.
- Triaje de quejas en sistemas de grievance redressal gubernamental: integrado en un portal tipo CPGRAMS, clasifica las quejas ciudadanas en los dominios oficiales y reduce el trabajo manual de asignación a departamentos.
- Procesamiento por lotes de correos y formularios de reclamación: mediante `route_batch()`, clasifica grandes volúmenes de mensajes en CPU, sin coste de API, adecuado para picos de carga o entornos con requisitos de residencia de datos.
- Prefiltrado antes de un LLM: dado su bajo coste, se usa como primera etapa que descarta no-reclamaciones (`none.out_of_scope`) y etiqueta la categoría, reservando un modelo generativo mayor solo para los casos ambiguos o de baja confianza.
- Análisis de voz del cliente en banca y seguros: agregación de categorías y niveles de urgencia sobre reclamaciones históricas para detectar qué productos o canales concentran más quejas, siempre con validación humana de las etiquetas de urgencia.
- Soporte multilingüe en centros de contacto indios: al cubrir hindi, hinglish y diez lenguas más en escritura nativa y romanizada, permite un único modelo para colas de atención en varios idiomas en lugar de clasificadores por idioma.
- Detección de reclamaciones urgentes como señal auxiliar: la salida de urgencia puede usarse como indicador complementario en la cola de priorización, nunca como criterio único de decisión, dado su bajo recall en P1 reales.

## Benchmarks y rendimiento
Resultados declarados por el autor del modelo en el model-index de la model card (no verificados de forma independiente):

| Conjunto de evaluación | Métrica | Nandi | Qwen3.6-35B-A3B zero-shot (unas 60× mayor) | Yama zero-shot (mismo tamano de encoder) |
|---|---|---|---|---|
| Posts públicos reales, conjunto ciego (443 filas, etiquetas revisadas por LLM) | Category accuracy | 0.625 | 0.664 | 0.366 |
| Posts públicos reales, conjunto ciego (443 filas) | Top-3 accuracy | 0.813 | no disponible | no disponible |
| Posts públicos reales, conjunto ciego (443 filas) | Category macro-F1 | 0.428 | 0.624 | 0.283 |
| Test sintético (2.985 filas, 13 idiomas, modelo escritor distinto) | Category accuracy | 0.929 | no disponible | no disponible |
| Test sintético (2.985 filas, 13 idiomas, modelo escritor distinto) | Category macro-F1 | 0.909 | no disponible | no disponible |

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene 559,9 millones de parámetros; en fp32 ocupa aproximadamente 2,2 GB de pesos, en fp16 unos 1,1 GB y en int8 unos 0,6 GB, más el overhead de activaciones y del tokenizador. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo también funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM, y en CPU para inferencia por lotes.
- Opciones de despliegue: la vía soportada es el script `router.py` del repositorio con `transformers`, `torch` y `safetensors`; el tag `text-embeddings-inference` sugiere compatibilidad con TEI. No se detallan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI (este último no aplica de forma estándar a un encoder clasificador).
- Latencia y throughput: no disponibles. El autor destaca que es "pequeño, local y rápido" frente a un LLM zero-shot, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Accuracy en posts reales (conjunto ciego) | Macro-F1 en posts reales | Licencia |
|---|---|---|---|---|---|---|
| Nandi (`nandi-grievance-indic`) | ~560 M | 512 tokens | Encoder clasificador ajustado, 53 clases | 0.625 | 0.428 | Apache-2.0 |
| Qwen3.6-35B-A3B zero-shot | ~35 B (MoE, A3B) | no disponible | LLM generativo zero-shot | 0.664 | 0.624 | no disponible |
| Yama (`yama-indic`) | mismo tamaño de encoder | no disponible | Clasificador zero-shot | 0.366 | 0.283 | no disponible |

Nandi se posiciona como alternativa pequeña y local frente a un LLM generativo mucho mayor: pierde en macro-F1 (0.428 frente a 0.624) y en accuracy (0.625 frente a 0.664) sobre texto real, pero gana en coste, latencia y despliegue local. Frente a Yama, del mismo desarrollador y mismo tamaño de encoder, Nandi es claramente superior en el conjunto ciego real (0.625 frente a 0.366 de accuracy).

## Limitaciones y advertencias
- Todos los datos de entrenamiento son sintéticos; el rendimiento sobre texto real es sustancialmente inferior al del test sintético (0.625 de accuracy frente a 0.929).
- La categoría es utilizable solo con revisión humana: acierta aproximadamente 6 de cada 10 veces en texto real y tiene la categoría correcta en la top-3 unas 8 de cada 10 veces.
- La urgencia es experimental sobre texto real: detecta solo aproximadamente 1 de cada 4 reclamaciones P1 reales, y 1 de cada 10 si se excluye el acoso de aplicaciones de préstamo. No debe usarse para decidir el orden de atención sin revisión humana.
- Aproximadamente 1 de cada 5 posts reales que no son reclamaciones se enrutan a alguna categoría en lugar de a `none.out_of_scope`.
- El conjunto de evaluación real es pequeño (443 filas), privado y con etiquetas revisadas por un LLM, no por anotadores humanos expertos; los resultados no están verificados de forma independiente.
- Longitud de entrada limitada a 512 tokens: los textos más largos se truncan y pueden perder información relevante para la clasificación.
- El conjunto de test real es mayoritariamente inglés, hindi y hinglish, por lo que el rendimiento en las demás lenguas indias está menos validado.
- No se documentan sesgos específicos conocidos en la información disponible; como clasificador entrenado con datos sintéticos, puede heredar los sesgos del modelo generador que produjo esos datos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos de categoría y de confianza mal calibrada en textos fuera de distribución.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales documentadas, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Es un lanzamiento personal independiente, sin el respaldo de una organización grande; el mantenimiento y las actualizaciones no están garantizados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LatentAILabs/nandi-grievance-indic
- Artículo en Towards AI: https://pub.towardsai.net/nandi-carries-every-complaint-to-the-right-desk-open-source-ai-for-indian-languages-743b55c912a2
- Resumen y FAQ: https://latentailabs.github.io/nandi-grievance-routing/
- Canal de YouTube de LatentAILabs: https://www.youtube.com/@LatentAILabs
- Modelo complementario Yama (clasificador zero-shot): https://huggingface.co/LatentAILabs/yama-indic
- Modelo complementario Chitragupta (detector de PII): https://huggingface.co/LatentAILabs/chitragupta-pii-indic
- Dataset sintético de entrenamiento: https://huggingface.co/datasets/LatentAILabs/nandi-grievance-synthetic
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
