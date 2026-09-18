# Jeesup/svd-safety-l2_swift_rerun_remove40

## Resumen

svd-safety-l2_swift_rerun_remove40 es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de una versión comprimida de meta-llama/Llama-2-7b-chat-hf mediante SVD-LLM, con un 40,00 % de los parámetros densos eliminados, lo que deja una fracción de parámetros resultante de 0,5998 (60,0 % del modelo original). Sobre esa base comprimida se aplica un presupuesto de restauración de componentes SVD del 0,000 %, es decir, cero componentes restaurados y cero componentes sustituidos, con una regla de selección etiquetada como `unknown` en la propia model card y semilla 42.

El objetivo del artefacto es estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué reglas de selección de componentes son capaces de repararlo. Este checkpoint es una celda concreta de una rejilla que barre reglas de selección y presupuestos, y el propio autor advierte explícitamente de que no es un modelo de chat de propósito general ni un asistente desplegable. Su relevancia es, por tanto, metodológica: proporciona una medida cuantificable del coste en seguridad y en utilidad que introduce una compresión agresiva de pesos.

Arquitectónicamente hereda la estructura transformer decoder-only de Llama 2, con 6.738.415.616 parámetros según los metadatos de safetensors y un tamaño de repositorio de 13,5 GB. La model card reporta cuatro métricas medidas: un ASR de 0,3769 en AdvBench, un ASR de 0,2013 en StrongREJECT, un sobre-rechazo macro de 0,1107 medido con WildGuard y una perplejidad de 11,6312 en WikiText-2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de meta-llama/Llama-2-7b-chat-hf), con pesos comprimidos mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (dato de safetensors); la model card indica una fracción de parámetros resultante de 0,5998 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Llama-2-7b-chat emplea 4.096 tokens |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (`license: llama2`); el repositorio incluye `LICENSE.txt` y `USE_POLICY.md` |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint no introduce una arquitectura nueva: es un Llama-2-7b-chat comprimido. La compresión se realiza con SVD-LLM, una técnica de descomposición en valores singulares aplicada a las matrices de pesos, que en este caso elimina el 40,00 % de los parámetros densos. Sobre el modelo ya comprimido se define un presupuesto de restauración de componentes SVD; en esta celda ese presupuesto es del 0,000 %, con 0 componentes restaurados y 0 componentes sustituidos según la tabla de procedencia de la model card. La regla de selección empleada aparece como `unknown`, y la semilla fijada es 42.

No se documenta en la información proporcionada ningún proceso adicional de entrenamiento, ajuste fino, RLHF o DPO sobre este checkpoint: el artefacto es el resultado directo de aplicar la compresión al modelo base. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni innovaciones de decodificación, ya que no hubo una fase de entrenamiento propia. El interés técnico reside en la metodología experimental: cuantificar la pérdida de comportamiento seguro inducida por la compresión y evaluar si la restauración selectiva de componentes SVD permite recuperarla.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento básico e instrucciones en formato chat, con calidad reducida respecto al modelo sin comprimir (perplejidad de 11,6312 en WikiText-2).
- Respuestas de rechazo ante peticiones dañinas, pero con eficacia mermada: la model card indica que la compresión por sí sola eleva la tasa de éxito de ataques.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas en las etiquetas del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El modelo es exclusivamente de texto.
- Utilidad como sujeto experimental: permite medir ASR, sobre-rechazo y perplejidad bajo distintas condiciones de compresión.

## Casos de uso

- Auditoría de seguridad bajo compresión: el checkpoint se integra en un pipeline de evaluación con HarmBench como juez para medir la tasa de éxito de ataques (ASR) de un modelo comprimido, comparando el valor de 0,3769 en AdvBench con el de la celda equivalente sin comprimir.
- Estudio de degradación por presupuesto de restauración: al ser una celda con presupuesto 0,000 %, sirve como extremo inferior de una curva que relaciona el porcentaje de componentes SVD restaurados con la recuperación de seguridad y de utilidad.
- Evaluación de reglas de selección de componentes: la celda etiquetada con la regla `unknown` permite comparar empíricamente distintas heurísticas de selección sobre la misma base comprimida y el mismo presupuesto.
- Medición de sobre-rechazo: el valor de 0,1107 obtenido con WildGuard permite estudiar si la compresión vuelve al modelo más o menos propenso a rechazar peticiones benignas, un eje independiente del ASR.
- Análisis de la relación entre perplejidad y seguridad: con una perplejidad de 11,6312 en WikiText-2, el checkpoint permite correlacionar la degradación de la calidad lingüística con la pérdida de comportamiento seguro.
- Reproducibilidad experimental: la semilla 42 y la procedencia documentada (modelo base, porcentaje de compresión, presupuesto y recuento de componentes) permiten replicar la celda exacta en estudios posteriores.
- Punto de partida para ajuste de reparación de seguridad: investigadores interesados en recuperar alineamiento tras compresión pueden usar este checkpoint como inicialización para técnicas de safety fine-tuning y medir la recuperación respecto a los valores de referencia.
- Investigación en interpretabilidad: comparar este checkpoint con su base sin comprimir ayuda a localizar qué subespacios de pesos sostienen el comportamiento de rechazo y cuáles son prescindibles.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con HarmBench como juez salvo donde se indica:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3769 |
| StrongREJECT ASR (juez HarmBench) | 0,2013 |
| Sobre-rechazo macro (WildGuard) | 0,1107 |
| Perplejidad en WikiText-2 | 11,6312 |

No se han publicado en la información disponible resultados comparativos frente al modelo base sin comprimir ni frente a otras celdas de la rejilla, por lo que no es posible calcular la delta de degradación con los datos aportados. Tampoco se incluyen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra batería estándar.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para los pesos, coherente con el tamaño del repositorio; con caché KV para 4.096 tokens conviene reservar entre 16 y 18 GB.
- VRAM estimada en int8: en torno a 7 GB de pesos.
- VRAM estimada en int4 (GPTQ, AWQ o GGUF Q4_K_M): en torno a 4 GB de pesos.
- GPU recomendadas para fp16: A100 40/80 GB, H100 80 GB, RTX 4090 o RTX 3090 con 24 GB. En estas últimas cabe con margen si se limita el tamaño de lote.
- GPU de consumo: sí cabe. RTX 4090 y RTX 3090 en fp16; RTX 4080, RTX 3080 de 16 GB y RTX 3060 de 12 GB en int8 o int4. Tarjetas de 8 GB quedan al límite incluso en int4 y requieren offload o contextos reducidos.
- Opciones de despliegue: transformers de forma nativa; vLLM y TGI, dado que el repositorio incluye la etiqueta `endpoints_compatible`; llama.cpp u Ollama únicamente si se convierte previamente a GGUF, formato que no se distribuye en este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas de seguridad |
|---|---|---|---|---|---|
| svd-safety-l2_swift_rerun_remove40 | 6.738.415.616 según safetensors; fracción resultante 0,5998 según la model card | No disponible (base: 4.096) | Llama 2 Community License | safetensors en HuggingFace; 0 descargas, 0 likes | AdvBench ASR 0,3769; StrongREJECT ASR 0,2013; sobre-rechazo 0,1107; ppl WikiText-2 11,6312 |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6.738.415.616 | 4.096 | Llama 2 Community License | safetensors en HuggingFace; ampliamente utilizado | No disponible en la información proporcionada |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | llama2 | No disponible | No disponible |

No se han encontrado en la información proporcionada otros checkpoints comprimidos comparables con métricas publicadas, por lo que la comparación cuantitativa frente a alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- El propio autor indica que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; esta celda concreta es un sujeto experimental, no un asistente desplegable.
- El ASR de 0,3769 en AdvBench es sustancialmente elevado: el modelo cede ante una fracción relevante de peticiones dañinas, por lo que no debe exponerse a usuarios finales ni a entradas no confiables.
- Riesgo de alucinación: la compresión agresiva y la perplejidad de 11,6312 en WikiText-2 sugieren una degradación de la calidad lingüística respecto al modelo sin comprimir.
- Existe una discrepancia no resuelta entre el recuento de parámetros de safetensors (6.738.415.616, idéntico al del Llama-2-7b completo) y la fracción resultante declarada en la model card (0,5998); conviene verificar el número real de parámetros antes de cualquier análisis de eficiencia.
- No se declaran idiomas soportados; el modelo base está optimizado principalmente para inglés y no hay datos sobre comportamiento en castellano.
- Longitud de contexto no confirmada para este checkpoint; si se necesita contexto largo, debe validarse empíricamente.
- Restricciones de licencia: se aplica la Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial queda sujeto a sus condiciones y a las obligaciones derivadas de ser una obra construida con Llama 2.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo día, sin validación externa conocida. La regla de selección de componentes aparece como `unknown`, lo que limita la interpretabilidad del experimento.
- No se documentan sesgos específicos ni datos de evaluación adicionales más allá de las cuatro métricas citadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_swift_rerun_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso: `LICENSE.txt` y `USE_POLICY.md`, incluidos en el propio repositorio
- Referencia al método SVD-LLM: no incluida en la información proporcionada
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a artículos en ruso sobre contabilidad de costes de reparación de activos fijos y no guardan relación alguna con el modelo.
