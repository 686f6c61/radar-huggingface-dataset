# Sharddha255/Kimi-K3-Uncensored-GGUF

## Resumen

Kimi-K3-Uncensored-GGUF es una cuantización GGUF del modelo Kimi K3 de Moonshot AI, un modelo de lenguaje masivo de tipo Mixture of Experts (MoE) con 2,8 billones de parámetros totales y 104 mil millones de parámetros activos por token. Esta versión concreta, publicada por el usuario Sharddha255, aplica una técnica de "abliteración" (abliteration) que elimina el comportamiento de rechazo ante solicitudes dañinas, ortogonalizando la dirección de rechazo en el flujo de escritura del residual stream. El resultado es un modelo cuantizado a muy baja precisión (IQ1_S-XS) que ocupa aproximadamente 540 GiB, pensado para ejecutarse en entornos con múltiples GPUs de alta gama.

El modelo base Kimi K3 es un modelo multimodal que comprende texto, imágenes y vídeo, con una ventana de contexto de 1 millón de tokens, lo que lo hace adecuado para tareas de razonamiento complejo, generación de código y trabajo agéntico de largo horizonte. Esta versión abliterada se presenta como una alternativa "sin censura" para investigación y despliegues donde se requiera máxima libertad de generación, aunque con las advertencias sobre la significancia estadística de las métricas de rechazo que se detallan más adelante.

La relevancia de este modelo radica en que es una de las pocas cuantizaciones abliteradas de un modelo de escala frontera con pesos abiertos, y publica mediciones de comportamiento de rechazo, algo inusual en este tipo de repositorios. Sin embargo, su tamaño extremo limita su uso práctico a infraestructuras de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 896 expertos, top-16 |
| Parametros totales | 2.779.483.135.584 (2,8 billones) |
| Parametros activos | 104 mil millones (104B) |
| Longitud de contexto | 1.000.000 tokens (segun fuentes web) |
| Tipos de cuantizacion | IQ1_S-XS (expertos IQ1_S, router F32, attn/KDA IQ4_XS, shexp Q5_K) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | kimi-k3 (licencia propia de Moonshot AI) |
| Formato de pesos | GGUF (34 shards, 539,7 GiB) |

## Arquitectura y entrenamiento

Kimi K3 es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 896 expertos y selección top-16, lo que significa que para cada token se activan 16 de los 896 expertos. Esto permite un total de 2,8 billones de parámetros con solo 104 mil millones activos por inferencia, reduciendo el coste computacional respecto a un modelo denso equivalente. La arquitectura se basa en el transformer estándar con atención de múltiples cabezas, adaptada para el enrutamiento de expertos.

La versión cuantizada de este repositorio se generó a partir de los pesos BF16 del modelo original, aplicando cuantización GGUF con la técnica imatrix (importance matrix) para optimizar la asignación de precisión. El proceso de abliteración se realizó mediante `llama-cvector-generator` sobre 308 pares de prompts (dañinos/inocuos) en las 93 capas del modelo, y se modificaron 279 de los 2573 tensores totales. No se dispone de información detallada sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ya que no se ha publicado en la documentación disponible.

## Capacidades

- Generación de texto en inglés y chino, con razonamiento complejo y capacidad de seguir instrucciones multi-turno.
- Comprensión multimodal: según fuentes web, el modelo base Kimi K3 procesa texto, imágenes y vídeo dentro de un mismo modelo.
- Ventana de contexto de 1 millón de tokens, permitiendo tareas que requieren memoria a largo plazo, como análisis de documentos extensos o conversaciones prolongadas.
- Generación de código y soporte para tareas de programación, dada la escala y arquitectura del modelo.
- Capacidad de razonamiento agéntico y multi-step, adecuado para flujos de trabajo que requieren planificación y ejecución secuencial.
- No se ha confirmado soporte explícito de tool calling o function calling en la información disponible, aunque es probable dada la naturaleza del modelo base.

## Casos de uso

- Investigación en seguridad de IA: este modelo permite estudiar el comportamiento de un modelo de frontera sin mecanismos de rechazo, lo que es útil para evaluar riesgos de abuso y desarrollar contramedidas.
- Despliegue en entornos de datacenter con múltiples GPUs: por su tamaño, es adecuado para servidores con 8 o más GPUs de 80 GB (A100/H100), donde puede ejecutarse con llama.cpp o vLLM.
- Generación de contenido creativo sin restricciones temáticas: escritura de ficción, guiones o material que los modelos censurados rechazarían, aunque con las advertencias legales y éticas correspondientes.
- Análisis de documentos largos: gracias a su contexto de 1M tokens, puede procesar libros completos, expedientes legales o historiales médicos en una sola pasada.
- Desarrollo de agentes autónomos para automatización de tareas complejas: su capacidad de razonamiento multi-step y contexto largo permite orquestar pipelines de varias etapas.
- Evaluación comparativa de técnicas de alineación: al comparar esta versión abliterada con el modelo base, se pueden medir los efectos de la eliminación de rechazos en la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas de comportamiento de rechazo y perplejidad, que se resumen a continuación:

| Metrica | Valor (abliterado) | Valor (baseline UD-IQ1_S) |
|---|---|---|
| Tasa de rechazo (26 prompts dañinos) | 0,0% (0/26) | 7,7% (2/26) |
| Tasa de sobre-rechazo (30 prompts benignos) | 0,0% (0/30) | 0,0% (0/30) |
| Tasa de incoherencia (18 prompts factuales) | 0,0% (0/18) | 0,0% (0/18) |
| Perplejidad (PPL) en 12 chunks | 1,9323 ± 0,0473 | no disponible |

Es importante señalar que la diferencia entre el modelo abliterado y el baseline no es estadísticamente significativa (prueba exacta de Fisher, p = 0,490), como se detalla en la sección de limitaciones.

## Requisitos de hardware

- El tamaño del repositorio es de 579,5 GB, con pesos cuantizados de 539,7 GiB. Se requiere al menos 540 GB de VRAM para cargar el modelo en memoria.
- GPUs recomendadas: al menos 7-8 GPUs de 80 GB (A100, H100, A800) o 10-11 GPUs de 48 GB (L40S, A40) para inferencia en precisión completa de la cuantización.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) ni en estaciones de trabajo con una sola GPU.
- Opciones de despliegue: llama.cpp (soporta GGUF), vLLM (con adaptación para MoE), text-generation-inference (TGI) y otros frameworks compatibles con GGUF.
- La latencia y el throughput dependen del hardware y del número de GPUs; no se han publicado cifras concretas para esta cuantización específica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Kimi-K3-Uncensored-GGUF (este repo) | 2,8T totales, 104B activos | 1M tokens | kimi-k3 | GGUF (IQ1_S-XS) |
| moonshotai/Kimi-K3 (base) | 2,8T totales, 104B activos | 1M tokens | kimi-k3 | safetensors (BF16) |
| unsloth/Kimi-K3-GGUF | 2,8T totales, 104B activos | 1M tokens | kimi-k3 | GGUF (varias cuantizaciones) |
| Ryanchen911/Kimi-K3-Uncensored-GGUF | 2,8T totales, 104B activos | 1M tokens | kimi-k3 | GGUF (abliterado) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas versiones. La principal diferencia entre este repo y el de Ryanchen911 es que este último publica métricas de rechazo medibles, mientras que el otro no ofrece números verificables.

## Limitaciones y advertencias

- La mejora en la tasa de rechazo frente al baseline no es estadísticamente significativa (p = 0,490) debido al pequeño tamaño muestral (26 prompts dañinos). Un conjunto de pruebas más amplio sería necesario para confirmar el efecto.
- El baseline utilizado para la comparación es una cuantización de terceros (unsloth UD-IQ1_S) con una receta de cuantización diferente, no una versión sin abliterar del mismo artefacto. Esto limita la validez de la comparación.
- El juez de rechazo se basa en coincidencia de palabras clave, no en análisis semántico. La evasión suave (por ejemplo, respuestas que empiezan con "esto es un tema complejo…" pero no contienen contenido) no se cuenta como rechazo, por lo que las tasas reportadas pueden ser subestimaciones.
- La perplejidad se midió solo en 12 chunks, lo que puede no reflejar el comportamiento global del modelo.
- La abliteración puede degradar la coherencia en dominios no evaluados; aunque la tasa de incoherencia en el conjunto factual fue 0%, no hay garantía de que no aparezcan fallos en otros contextos.
- El modelo es extremadamente grande y costoso de ejecutar, lo que limita su uso a organizaciones con infraestructura de datacenter.
- La licencia kimi-k3 es una licencia propia de Moonshot AI; es necesario revisar sus términos para uso comercial y restricciones de redistribución.
- Al ser una versión "sin censura", existe un riesgo inherente de uso malintencionado (generación de contenido dañino, desinformación, etc.). El autor no proporciona garantías sobre la seguridad del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sharddha255/Kimi-K3-Uncensored-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Cuantización de referencia (unsloth): https://huggingface.co/unsloth/Kimi-K3-GGUF
- Otra versión abliterada: https://huggingface.co/Ryanchen911/Kimi-K3-Uncensored-GGUF
- Página informativa sobre Kimi K3: https://uncensored.com/models/kimi-k3
- Paper referenciado en los tags (arxiv): https://arxiv.org/abs/2406.11717
