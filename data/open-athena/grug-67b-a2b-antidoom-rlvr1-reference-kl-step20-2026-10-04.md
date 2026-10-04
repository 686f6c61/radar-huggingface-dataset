# open-athena/Grug-67B-A2B-Antidoom-RLVR1-Reference-KL-Step20-2026.10.04

## Resumen

Grug-67B-A2B-Antidoom-RLVR1-Reference-KL-Step20 es un artefacto de investigación publicado por open-athena en Hugging Face. Se trata de la exportación a safetensors del paso de optimizador 20 de la rama "reference/KL" de la campaña Antidoom de RLVR1 (aprendizaje por refuerzo con recompensas verificables) sobre dominio amplio. El modelo forma parte de la familia Snowball y emplea una arquitectura de mezcla de expertos (MoE), con 67.078.882.816 parámetros totales según los pesos en safetensors y una nomenclatura "A2B" que sugiere del orden de 2.000 millones de parámetros activos por token, dato no confirmado en la model card.

El problema que aborda es de naturaleza experimental: servir de referencia reproducible para estudiar el efecto de una regularización KL fuerte (coeficiente 0,01) contra una política de referencia congelada y colocada en el mismo clúster, dentro de un bucle de RLVR a gran escala. La rama partió de la política pública Antidoom RLVR1 step-12, reanudó desde su propio checkpoint de entrenamiento del paso 4 tras correcciones operativas y se entrenó con 80 GPU H100 dedicadas a política y 48 H100 dedicadas a inferencia.

Su relevancia es limitada y muy específica: es un checkpoint intermedio seleccionado por su rendimiento en un holdout interno de 100 prompts (42/100 en pass@1, con 0,4465 de puntuación media normalizada del verificador), no un modelo listo para producción. El propio autor lo etiqueta explícitamente como artefacto de investigación, sin evaluaciones independientes y sin garantías de seguridad. Tiene 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); etiqueta del autor `grug_moe`, familia Snowball |
| Parametros totales | 67.078.882.816 (67,08 mil millones) |
| Parametros activos | Aproximadamente 2.000 millones, según la nomenclatura "A2B" del autor; no confirmado en la model card |
| Longitud de contexto | No confirmada. La ventana total de petición durante el entrenamiento fue de 102.400 tokens, con hasta 49.152 tokens generados por turno |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (librería `transformers`) |
| Autor | open-athena |
| Fecha de creacion | 2026-10-04 |
| Tamano del repositorio | 134,2 GB |
| Pipeline declarado | text-generation |
| Etiquetas | transformers, safetensors, grug_moe, text-generation, snowball, moe, rlvr, conversational, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La model card identifica el modelo como parte de la familia Snowball y con etiqueta `grug_moe`, lo que apunta a una arquitectura de mezcla de expertos con enrutado disperso. Con 67,08 mil millones de parámetros totales y una denominación "A2B", el patrón habitual en este tipo de diseños es activar solo un subconjunto pequeño de parámetros por token (del orden de 2.000 millones), lo que reduce el coste de cómputo por token a costa de mantener una huella de memoria equivalente al total de parámetros. La model card no detalla la configuración interna (número de expertos, expertos activados por token, uso de atención lineal o híbrida, ni vocabulario).

El entrenamiento corresponde a la rama "reference/KL" de la campaña Antidoom broad-domain RLVR1. La política se optimizó contra una referencia congelada y colocada en el mismo clúster, con coeficiente de pérdida KL de 0,01. La pérdida de política usó reducción por media de secuencia y coeficiente de entropía de 0,001. La infraestructura fueron 80 GPU H100 para política y 48 GPU H100 para inferencia, con una ventana total de petición de 102.400 tokens y hasta 49.152 tokens generados por turno. El checkpoint exportado procede del paso global 20 de un checkpoint distribuido verificado de 91 objetos y 80 shards alojado en `s3://marin-us-east-02a/marin/users/benfeuer/checkpoints/antidoom-rlvr1-reference-kl/2026.10.03.11/preserved-best/global_step_20/`. La exportación la realizó el exportador canónico de checkpoints MarinSkyRL, que cargó estrictamente la política guardada antes de generar los safetensors. Los metadatos de arquitectura se tomaron del modelo SFT Datakit del 21 de septiembre, porque la exportación regional del Antidoom step-45 no estaba disponible; los pesos completos de política sí provienen del checkpoint del paso 20. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el uso de DPO o RLHF clásico al margen del bucle RLVR.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso previsto como modelo de chat/generación, si bien no se documentan plantillas de prompt ni formato de conversación.
- Razonamiento guiado por recompensas verificables: el entrenamiento RLVR presupone optimización sobre tareas con verificador automático (típicamente matemáticas, código o respuesta factual), aunque la model card no enumera los dominios concretos.
- Arquitectura MoE con activación dispersa: capacidad de ejecutar modelos de 67B totales con coste de cómputo por token propio de un modelo mucho menor, lo que favorece el despliegue en clústeres con muchas GPU pero poca capacidad de cómputo por GPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no se declara explícitamente; el único indicio es la generación de hasta 49.152 tokens por turno durante el entrenamiento, compatible con cadenas de razonamiento largas.
- Capacidades multilingües: no disponibles; el campo de idiomas no está informado en el repositorio.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.

## Casos de uso

- Reproducción de la campaña Antidoom RLVR1: el checkpoint del paso 20 permite a un equipo de investigación replicar la rama "reference/KL" y contrastarla con los pasos 4, 12 y 22-30, usando el archivo público de la campaña para cotejar curvas de recompensa y métricas por dominio.
- Estudio del efecto de la regularización KL en RLVR: con un coeficiente KL de 0,01 frente a una referencia congelada, el modelo es un punto de medida útil para analizar cuánto divergen las políticas con y sin anclaje a la referencia.
- Experimentos de olvido catastrófico y diversidad: la denominación "Antidoom" sugiere objetivos de mitigación de colapso de política; el paso 20 sirve como punto intermedio para medir degradación de diversidad frente a checkpoints posteriores (pasos 22-30, con 33/100 a 37/100 en el holdout interno).
- Punto de partida para fine-tuning posterior: al ser un checkpoint intermedio con pesos completos en safetensors y compatible con `transformers`, puede inicializar un SFT o un nuevo bucle de RL en lugar de partir de la política base.
- Generación de datos sintéticos con filtrado por verificador: dado que la política fue optimizada contra recompensas verificables, puede emplearse para muestrear candidatos que después se filtran con un verificador externo, en un esquema de autoentrenamiento iterativo.
- Evaluación de infraestructura MoE de 67B: por su tamaño (134,2 GB en safetensors) y su activación dispersa, es un banco de pruebas realista para medir throughput, coste de comunicación entre expertos y estrategias de paralelismo en vLLM, TGI o sistemas propietarios.
- Análisis comparativo de checkpoints en pipelines de RL: con varios pasos exportados de la misma rama, permite construir estudios de escalado temporal del entrenamiento (por ejemplo, relación entre paso de optimizador y pass@1 en el holdout).

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la evaluación interna del propio autor sobre un holdout fijo de 100 prompts. No hay resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Evaluacion | Resultado | Notas |
|---|---|---|
| Holdout de 100 prompts, pass@1 | 42/100 | Mejor paso evaluado de la rama en el momento de la exportación; media normalizada del verificador 0,4465 |
| Reanudación desde step-4 (misma rama) | 35/100 | Evaluación del punto de reanudación |
| Steps 22 a 30 (misma rama) | 33/100 a 37/100 | Rango de pass@1 en pasos posteriores |

Advertencia metodológica: la model card indica explícitamente que este holdout fue el criterio de selección del checkpoint y que no se reclama ningún resultado independiente. Los números anteriores, por tanto, están sujetos a sesgo de selección y no deben interpretarse como rendimiento generalizable.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 67,08B parámetros ocupan aproximadamente 134 GB, más activaciones y caché KV. En cuantización de 8 bits, alrededor de 67-70 GB. En 4 bits, en torno a 34-36 GB. Estas cifras son estimaciones de orden de magnitud basadas en el tamaño de safetensors publicado (134,2 GB), no datos oficiales.
- GPU recomendadas: 2×H100 80 GB o 2×A100 80 GB para BF16 sin cuantizar; 1×H100 80 GB o 1×A100 80 GB para 8 bits; 1×A100 40 GB o 2×RTX 4090 para 4 bits. Una H200 de 141 GB sería muy justa en BF16 y no dejaría margen para caché KV con contexto largo.
- ¿Cabe en GPU de consumo?: no en BF16 ni 8 bits. En 4 bits, una RTX 5090 de 32 GB quedaría al límite y dos RTX 4090 de 24 GB serían la configuración mínima razonable, siempre con cuantización no oficial.
- Opciones de despliegue: `transformers` (librería declarada), servidores compatibles con HF Inference Endpoints (etiqueta `endpoints_compatible`), y previsiblemente vLLM o TGI por soporte de MoE. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no están disponibles de forma directa salvo conversión manual por parte del usuario.
- Latencia y throughput estimados: no disponibles. Cualitativamente, al tratarse de un MoE con alrededor de 2.000 millones de parámetros activos, el cómputo por token sería comparable al de un modelo denso de ese orden, mientras que el cuello de botella principal sería el ancho de banda de memoria para cargar expertos y la comunicación entre dispositivos.
- Requisitos de contexto: la ventana de 102.400 tokens usada en entrenamiento implica caché KV muy costosa; desplegar con esa longitud exige paralelismo de tensores y gestión agresiva de memoria, sin que se conozca el soporte real del modelo a esa longitud.

## Comparativa con modelos similares

No hay datos de benchmarks independientes de este modelo, por lo que cualquier comparación de rendimiento sería especulativa. La tabla siguiente contrasta únicamente parámetros, contexto y licencia con modelos MoE abiertos ampliamente conocidos; las cifras de los competidores proceden de información pública general y no de la información proporcionada en esta búsqueda, por lo que deben verificarse antes de su uso.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grug-67B-A2B-Antidoom-RLVR1-Reference-KL-Step20 | 67,08B | ~2B (deducido de "A2B", no confirmado) | No confirmada (102.400 tokens en entrenamiento) | openmdw-1.1 | Hugging Face, safetensors |
| Mixtral 8x7B | 46,7B | 12,9B | 32.768 tokens | Apache 2.0 | Ampliamente disponible en múltiples formatos |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32.768 tokens | Apache 2.0 | Ampliamente disponible |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32.768 tokens | Licencia de modelo propia de DeepSeek | Ampliamente disponible |

Diferencias relevantes más allá de los números: este modelo es un artefacto de investigación con 0 descargas, sin cuantizaciones publicadas y con una licencia openmdw-1.1 cuyos términos comerciales no se detallan en la información disponible, mientras que las alternativas de la tabla llevan más tiempo publicadas, cuentan con ecosistema de cuantizaciones y, en varios casos, licencias permisivas tipo Apache 2.0.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluar: la propia model card afirma que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro.
- Sin benchmarks independientes: el único resultado disponible es un holdout interno de 100 prompts que, además, se usó para seleccionar el checkpoint, lo que introduce sesgo de selección y riesgo de sobreajuste a ese conjunto concreto.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser una política optimizada con recompensas verificables, puede mostrar comportamientos de explotación del verificador (reward hacking) no caracterizados.
- Idiomas soportados desconocidos: el repositorio no declara idiomas, por lo que no hay garantía de comportamiento correcto en castellano ni en ninguna otra lengua concreta.
- Arquitectura no documentada: no se especifican número de expertos, mecanismo de enrutado, tipo de atención ni tokenizador, lo que dificulta prever el comportamiento en producción.
- Metadatos de arquitectura incompletos: parte de los metadatos provienen del modelo SFT Datakit del 21 de septiembre por indisponibilidad de otra exportación, lo que introduce un riesgo de desajuste entre configuración declarada y pesos reales.
- Restricciones de licencia: openmdw-1.1 es la licencia declarada, pero sus términos para uso comercial no se detallan en la información proporcionada; es imprescindible revisar el texto completo antes de cualquier uso productivo o redistribución.
- Coste de despliegue elevado: 134,2 GB de pesos en safetensors implican al menos dos GPU de 80 GB en BF16 y hacen inviable el uso en una única GPU de consumo sin cuantización externa.
- Sin cuantizaciones oficiales: la ausencia de GGUF, AWQ o GPTQ publicados traslada al usuario el trabajo de conversión y validación, con el consiguiente riesgo de degradación.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- Sin soporte declarado de tool calling ni de agentes: no debe asumirse que el modelo maneje llamadas a funciones o flujos multi-paso sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Grug-67B-A2B-Antidoom-RLVR1-Reference-KL-Step20-2026.10.04
- Policy de partida (Antidoom RLVR1 step-12): https://huggingface.co/open-athena/Grug-67B-A2B-Antidoom-RLVR1-Step12-2026.10.02
- Archivo público de la campaña (métricas por dominio, recompensas, configuración de lanzamiento): https://huggingface.co/datasets/open-athena/snowball-broad-domain-rlvr-campaign-2026/tree/main/runs/antidoom-rlvr1-v4-reference-kl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/nyu-dice-lab/snowball-ultra-rlvr/runs/fpw62eom
- Ruta del checkpoint distribuido de origen (referencia interna del autor): `s3://marin-us-east-02a/marin/users/benfeuer/checkpoints/antidoom-rlvr1-reference-kl/2026.10.03.11/preserved-best/global_step_20/`
- Paper técnico: no disponible
- Repositorio de código: no disponible
- Demo: no disponible

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a sitios corporativos sin relación (open.global, openoffice.org, openai.com), por lo que se han omitido.
