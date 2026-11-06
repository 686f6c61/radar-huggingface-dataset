# macmacmacmac/CLEF-Screen

## Resumen

CLEF-Screen es un modelo de clasificación binaria orientado a la detección de *prompt injection* en inglés, publicado por el usuario macmacmacmac en Hugging Face. No se trata de un modelo generativo completo, sino de una *cabeza* (`JointSchemaHead`, 121.762.820 parámetros, 122 tensores) entrenada sobre los estados ocultos congelados del *backbone* Cloudflare CLEF-Flash en formato LiteRT. El repositorio raíz es un directorio de checkpoint LiteRT de CLEF completo con la cabeza ajustada.

El modelo resuelve un problema concreto y creciente: filtrar entradas maliciosas que intentan secuestrar el comportamiento de un LLM mediante instrucciones inyectadas. Su relevancia radica en el formato de despliegue (LiteRT/TFLite), pensado para inferencia ligera y local, y en que solo se entrena la cabeza, lo que abarata el reentrenamiento. La información pública es muy escasa: cero descargas, cero *likes*, sin *pipeline* declarado y sin resultados de benchmarks independientes.

La model card reporta métricas de desarrollo muy altas (AUC 0,9899 en dev y 0,9897 en test), pero con advertencias explícitas del autor: el conjunto es un 92 % positivo, la tasa de falsos positivos a umbral 0,5 sigue en 0,2183 y no existe replicación independiente congelada. Cualquier cifra debe tratarse como medición de desarrollo, no como garantía de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza `JointSchemaHead` (121.762.820 parámetros, 122 tensores) sobre backbone congelado Cloudflare CLEF-Flash en LiteRT |
| Parametros totales | 121.762.820 (solo la cabeza; el backbone no se contabiliza en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la cabeza se distribuye en BF16 como contrato de despliegue) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (sin texto de licencia en la información disponible) |
| Formato de pesos | LiteRT / TFLite (checkpoint LiteRT de CLEF); cabeza en BF16 |

## Arquitectura y entrenamiento

La arquitectura es un *fine-tune* de solo cabeza: el *backbone* Cloudflare CLEF-Flash en LiteRT permanece congelado y únicamente se entrena la `JointSchemaHead` sobre sus estados ocultos. La cabeza tiene 121.762.820 parámetros distribuidos en 122 tensores y se mantiene en BF16, que el autor declara como contrato de despliegue (no hubo conversión posterior al entrenamiento). No se especifica la topología interna de la cabeza ni la dimensión de los estados ocultos de entrada.

El entrenamiento se ejecutó en un *droplet* GPU de DigitalOcean llamado `jev-retrain` con una AMD Instinct MI355X y ROCm. La codificación de datos terminó el 2026-11-04 a las 11:31Z y el entrenamiento de la cabeza a las 18:24Z. Se usó el script `ft_clef_bench.py` durante 3 épocas, con learning rate 3e-05, batch 16 y `pos_weight` 3.0. Los detalles y hashes están en `redo-provenance.json` y el log completo en `redo-training-log.jsonl`. No se documentan el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO; el `pos_weight` de 3.0 sugiere un desbalance de clases corregido por ponderación de la pérdida.

## Capacidades

- Clasificación binaria de *prompt injection* en texto en inglés: produce una puntuación de probabilidad que se umbraliza para decidir si una entrada es maliciosa.
- Detección sobre estados ocultos de un *backbone* de lenguaje, no generación de texto.
- Diseñado para integrarse como capa de seguridad previa o posterior a un LLM en producción.
- Despliegue en formato LiteRT/TFLite, apto para entornos con recursos limitados.
- No se documentan *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Filtro de entrada en un *chatbot*: cada mensaje del usuario se pasa por CLEF-Screen antes de llegar al LLM principal; si la puntuación supera el umbral, se bloquea o se deriva a revisión. Adecuado por su bajo coste al ser solo una cabeza sobre un *backbone* congelado.
- Protección de pipelines RAG: se inspeccionan los documentos recuperados y las consultas del usuario para detectar instrucciones inyectadas antes de que se concatenen en el *prompt* del modelo generativo.
- Moderación de contenido generado por terceros: en plataformas donde los usuarios aportan *prompts* que se ejecutan contra un LLM compartido, CLEF-Screen actúa como *gatekeeper* por petición.
- Seguridad en agentes autónomos: validar las observaciones que el agente recibe de herramientas externas (correo, web, APIs) para evitar que un atacante secuestre el bucle de razonamiento.
- Despliegue en el borde: gracias al formato LiteRT/TFLite, puede ejecutarse en dispositivos con recursos limitados para prefiltrar tráfico antes de enviarlo a un servicio central.
- Generación de datos de entrenamiento y evaluación: usar las puntuaciones del modelo para etiquetar o priorizar muestras sospechosas en la construcción de conjuntos de *prompt injection*.
- Monitorización y alerta en producción: registrar la distribución de puntuaciones por cliente o endpoint para detectar campañas de ataque emergentes.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (mediciones de desarrollo, no replicadas de forma independiente):

| Conjunto | Filas | AUC | TPR@0,5 | FPR@0,5 | TPR@0,99 | FPR@0,99 |
|---|---|---|---|---|---|---|
| Dev (época 0) | 21.977 | 0,7516 | No disponible | No disponible | No disponible | No disponible |
| Dev (época 3) | 21.977 | 0,9899 | 0,9911 | 0,2183 | 0,9583 | 0,0507 |
| Test (banking+slack) | 21.965 | 0,9897 | No disponible | No disponible | 0,9574 | 0,0537 |

Advertencias del propio autor: dev y test son un 92 % positivos (aproximadamente 1.695 negativos), la FPR a umbral 0,5 sigue en 0,22, el test fue evaluado por el propio script de entrenamiento al finalizar y no existe replicación independiente congelada. No hay resultados publicados frente a ataques adaptativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una cabeza de 121,7 M de parámetros en BF16, los pesos ocupan aproximadamente 0,24 GB, pero el *backbone* CLEF-Flash LiteRT también debe cargarse y su tamaño no se documenta (el repositorio ocupa 18,3 GB).
- GPU recomendadas: no disponibles; el entrenamiento se realizó en una AMD Instinct MI355X con ROCm, pero no se especifican requisitos de inferencia.
- Compatibilidad con GPU de consumo: no confirmada; el formato LiteRT/TFLite sugiere viabilidad en hardware modesto, pero no hay datos de latencia ni de memoria total.
- Opciones de despliegue: LiteRT/TFLite (formato nativo del checkpoint). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de detección de *prompt injection* ni datos de rendimiento de terceros que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo inglés: la etiqueta de idioma del repositorio es `en`; no se documenta cobertura multilingüe.
- Métricas no replicadas: todas las cifras son mediciones de desarrollo; no hay test congelado ni replicación independiente.
- Desbalance severo del conjunto de evaluación: un 92 % de positivos implica que la FPR estimada se apoya en muy pocos negativos.
- FPR elevada a umbral 0,5 (0,2183): en producción generaría un volumen alto de falsos positivos si se usa ese umbral; el autor reporta mejores cifras a 0,99 pero con menos cobertura.
- Sin evaluación frente a ataques adaptativos: un atacante que conozca el modelo podría intentar evadirlo; no hay datos al respecto.
- Licencia `other` sin texto disponible: no se puede confirmar si el uso comercial está permitido; es un bloqueante potencial para producción.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea (falsos negativos) con consecuencias de seguridad.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni posibles sesgos por dominio (el test cubre *banking* y *slack*).
- Repositorio de 18,3 GB: el despliegue requiere gestionar un artefacto grande aunque solo se entrene la cabeza.
- Cero tracción comunitaria (0 descargas, 0 *likes*): sin validación externa ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/macmacmacmac/CLEF-Screen
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
