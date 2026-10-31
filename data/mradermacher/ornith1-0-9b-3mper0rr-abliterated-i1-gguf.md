# mradermacher/Ornith1.0-9B-3MPER0RR-abliterated-i1-GGUF

## Resumen

Esta ficha corresponde a la colección de cuantizaciones GGUF con imatrix (importancia ponderada) del modelo Ornith1.0-9B-3MPER0RR-abliterated, publicada por el cuantizador mradermacher, un autor muy prolífico en Hugging Face especializado en generar versiones comprimidas listas para inferencia local con llama.cpp. El modelo base es 3MPER0RR/Ornith1.0-3MPER0RR-abliterated, un LLM conversacional de aproximadamente 9 mil millones de parámetros (8.953.803.264 exactos según los safetensors originales) al que se le ha aplicado un proceso de "abliteración", es decir, la supresión de los vectores de dirección de rechazo para que el modelo no se niegue a responder a solicitudes que normalmente serían bloqueadas.

El valor de este repositorio no está en el modelo en sí, sino en la oferta de cuantizaciones: incluye más de 20 variantes que van desde IQ1_S (2,8 GB) hasta Q6_K (7,5 GB), todas generadas con matrices de importancia (imatrix) para preservar la máxima calidad posible en cada nivel de compresión. Esto permite ejecutar el modelo en hardware muy variado, desde portátiles con 8 GB de RAM hasta estaciones con GPUs de gama alta.

Es relevante ahora porque la comunidad de inferencia local demanda constantemente versiones GGUF optimizadas de modelos recientes, y el trabajo de mradermacher es un estándar de facto para probar modelos ablated en entornos locales sin depender de la nube. La licencia MIT del modelo base permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (no disponible el detalle exacto de la familia base) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado con imatrix), base original en safetensors |

## Arquitectura y entrenamiento

El repositorio cuantizado no aporta información sobre la arquitectura interna del modelo base más allá de que es un transformer decoder de tipo conversacional con unos 9 mil millones de parámetros. El nombre "Ornith1.0" sugiere un modelo propio del autor 3MPER0RR, pero no se ha publicado información sobre los datos de entrenamiento, número de tokens, alineación (RLHF/DPO) ni innovaciones técnicas concretas en la model card disponible.

Lo que sí está documentado es el proceso de cuantización: mradermacher emplea cuantización ponderada por matriz de importancia (imatrix), una técnica que calcula estadísticas de activación sobre un corpus de calibración para asignar mayor precisión a los tensores más sensibles a la cuantización. Esto permite que niveles agresivos como IQ2 o IQ3 mantengan una calidad razonable frente a cuantizaciones estáticas equivalentes. El propio autor recomienda preferir los quants IQ sobre los K de tamaño similar (por ejemplo, IQ3_S sobre Q3_K_M).

Sobre la abliteración del modelo base: consiste en identificar y neutralizar las direcciones de activación responsables de los rechazos (refusals), de modo que el modelo genera respuestas sin los filtros de seguridad originales. No hay datos públicos sobre el método exacto empleado en este caso.

## Capacidades

- Generación de texto conversacional en inglés (tag "conversational" y language "en" en la model card).
- Ejecución local eficiente gracias al formato GGUF, compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes.
- Amplia gama de niveles de cuantización (24 variantes) para ajustar la relación calidad/tamaño según el hardware disponible.
- Sin filtros de rechazo (abliterated): responde a solicitudes que el modelo original rechazaría.
- No hay información publicada sobre capacidades de visión, audio, tool calling, agentes ni soporte multilingüe más allá del inglés.

## Casos de uso

- Experimentación con modelos abliterados en local: investigadores que estudian el comportamiento de modelos sin alineación de rechazo pueden descargar variantes desde 2,8 GB (IQ1_S) para pruebas rápidas en portátiles.
- Inferencia en consumer GPUs: el quant Q4_K_M (5,7 GB) cabe holgadamente en una RTX 3060 de 12 GB o en una RTX 4060 Ti de 16 GB, dejando espacio para contexto.
- Despliegue en CPU puro o híbrido CPU+GPU: los quants pequeños (IQ2_M, 3,7 GB) permiten ejecutar el modelo en máquinas sin GPU dedicada mediante llama.cpp con offloading parcial.
- Chatbots personales sin censura: al ser un modelo conversacional abliterated, se usa en interfaces locales tipo KoboldCpp o SillyTavern para roleplay y conversación sin negativas del modelo.
- Creación de cuantizaciones propias: el archivo imatrix de 0,1 GB incluido permite a cualquier usuario generar sus propias cuantizaciones personalizadas con llama.cpp.
- Evaluación comparativa de quants: la tabla completa de variantes con notas del autor ("IQ3_S beats Q3_K*", "Q4_K_S optimal size/speed/quality") sirve de referencia para estudiar el impacto de la cuantización en modelos de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según quant (tamaño del archivo + overhead de contexto, aproximadamente 1-2 GB extra):
  - IQ1_S (2,8 GB) e IQ1_M (3,0 GB): ejecutables en cualquier equipo con 8 GB de RAM, aunque con pérdida de calidad notable ("for the desperate", según el autor).
  - IQ3_M / Q3_K_M (4,5-4,7 GB): compromiso razonable para 8 GB de RAM.
  - Q4_K_M (5,7 GB) e IQ4_XS (5,3 GB): recomendados por el autor; ideales para GPUs con 8 GB de VRAM.
  - Q5_K_M (6,6 GB) y Q6_K (7,5 GB): para GPUs de 8-12 GB o 16 GB de RAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 (ejecución completa en VRAM con Q6_K y contexto amplio). En CPU, cualquier procesador moderno con AVX2 y 8-16 GB de RAM.
- Cabe en consumer GPUs: sí, en cualquier GPU con 6 GB o más de VRAM usando quants de nivel Q4 o inferior.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, Jan, text-generation-webui. Al ser GGUF, no es objetivo directo de vLLM o TGI (orientados a safetensors).
- Latencia y throughput: no disponibles; en un 9B cuantizado a Q4 sobre una RTX 3060 cabe esperar del orden de 30-60 tokens/s con llama.cpp, pero es una estimación no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ornith1.0-9B-3MPER0RR-abliterated (este, cuantizado) | 8,95B | No disponible | MIT | GGUF, 24 quants con imatrix |
| Quantizaciones GGUF estáticas del mismo modelo (mradermacher) | 8,95B | No disponible | MIT | GGUF estático, sin imatrix |
| Otros modelos 9B abliterated con GGUF de mradermacher (p. ej. variantes abliterated de Llama 3.1 8B o Gemma 2 9B) | 8-9B | 8k-128k según base | Según base | GGUF con imatrix, amplia comunidad |

La comparación más directa es con el repositorio de cuantizaciones estáticas del mismo modelo (enlazado en la model card): las versiones i1 con imatrix suelen ofrecer mejor calidad a igual tamaño, aunque los archivos estáticos pueden ser ligeramente más rápidos en algunos runtimes. Frente a otros modelos abliterated de tamaño similar basados en Llama 3.1 8B o Gemma 2 9B, este modelo carece de documentación pública sobre benchmarks y contexto, lo que dificulta una comparación de rendimiento objetiva.

## Limitaciones y advertencias

- Modelo abliterated: la supresión de rechazos elimina salvaguardas de seguridad. Usarlo en producción con usuarios finales conlleva riesgos legales y éticos significativos; el autor del quant y el de este repositorio no se hacen responsables del uso.
- Sesgos: no hay documentación sobre sesgos del modelo base; al tratarse de un modelo sin filtros, los sesgos del entrenamiento pueden manifestarse sin mitigación.
- Alucinaciones: no hay evaluaciones publicadas; asume el riesgo típico de alucinación de cualquier LLM de 9B.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Contexto: la longitud de ventana no está especificada; consulta el tokenizer_config del modelo base antes de planificar cargas con documentos largos.
- Calidad de cuantizaciones extremas: IQ1_S/IQ1_M e IQ2 degradan sustancialmente el modelo; el propio autor las marca como "desperate" y "very low quality".
- Licencia: MIT, sin restricciones de uso comercial, pero la ausencia de documentación del modelo base (datos de entrenamiento, evaluaciones) es un caveat importante para entornos de producción serios.

## Enlaces

- Repositorio cuantizado (este): https://huggingface.co/mradermacher/Ornith1.0-9B-3MPER0RR-abliterated-i1-GGUF
- Modelo base abliterado: https://huggingface.co/3MPER0RR/Ornith1.0-9B-3MPER0RR-abliterated
- Cuants estáticos del mismo modelo: https://huggingface.co/mradermacher/Ornith1.0-9B-3MPER0RR-abliterated-GGUF
- Página de descarga resumida del autor: https://hf.tst.eu/model#Ornith1.0-9B-3MPER0RR-abliterated-i1-GGUF
- Guía de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
