# mradermacher/Hy-MT3-7B-GGUF

## Resumen

Hy-MT3-7B es un modelo de traduccion automatica neuronal desarrollado por Tencent, publicado originalmente en el repositorio `tencent/Hy-MT3-7B`. La version que nos ocupa, `mradermacher/Hy-MT3-7B-GGUF`, es una cuantizacion estatica en formato GGUF realizada por el usuario mradermacher, pensada para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con 7.504.568.320 parametros (aproximadamente 7,5 mil millones) y esta especializado en tareas de traduccion multilingue, con un pipeline declarado de `translation`.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de traduccion de 7B en hardware de consumo, gracias a las cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (15,1 GB). El modelo base soporta un numero muy amplio de idiomas, segun la lista declarada en la model card (mas de 90 codigos ISO), lo que lo convierte en una opcion interesante para pipelines de traduccion multilingue con requisitos moderados de hardware.

No obstante, la informacion disponible sobre arquitectura interna, datos de entrenamiento, benchmarks y limites de contexto es muy limitada: la model card del repositorio GGUF solo documenta el proceso de cuantizacion y los ficheros generados, sin detallar las caracteristicas tecnicas del modelo original. Esta ficha refleja, por tanto, lo que se puede afirmar con rigor a partir de los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, segun convencion de la familia Hy-MT; no confirmado en la informacion) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | mas de 90 codigos ISO declarados (zh, en, es, fr, de, ja, ko, ar, hi, ru, pt, it, nl, pl, tr, vi, th, id, ms, yue, entre otros) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `tencent/Hy-MT3-7B` en la documentacion proporcionada. Por el nombre y el pipeline declarado (`translation`), se trata de un modelo especializado en traduccion, con 7,5 mil millones de parametros, lo que lo situa en la categoria de modelos de traduccion de tamano medio. La model card del repositorio GGUF no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

El repositorio de mradermacher documenta exclusivamente el proceso de cuantizacion: se trata de cuantizaciones estaticas generadas a partir del modelo original, con la nota de que existen tambien cuantizaciones ponderadas/imatrix en `mradermacher/Hy-MT3-7B-i1-GGUF`. No se mencionan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Traduccion automatica multilingue entre mas de 90 idiomas, segun la lista de codigos declarada en la model card.
- Traduccion bidireccional entre pares de idiomas de alta, media y baja resources (incluye idiomas como yue, ceb, war, bo, ug, sd, entre otros).
- Generacion de texto conversacional: la etiqueta `conversational` aparece en los metadatos del repositorio.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a traves de infraestructura de inferencia estandar.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica multilingue: el modelo puede traducir manuales y guias entre los idiomas principales (en, es, fr, de, ja, zh) en pipelines por lotes, gracias a su tamano moderado y a las cuantizaciones Q4/Q5 que caben en GPU de consumo.
- Localizacion de productos de software: integracion en un pipeline de CI/CD que traduzca ficheros de recursos (`.po`, `.json`, `.yaml`) a decenas de idiomas, usando la cuantizacion Q4_K_M (4,7 GB) en una unica GPU.
- Atencion al cliente multilingue: traduccion en tiempo real de mensajes de soporte entre el idioma del cliente y el del agente, desplegando el modelo con llama.cpp o vLLM en un servidor con una RTX 4090 o A10.
- Traduccion de contenidos editoriales: articulos, blogs y boletines en idiomas europeos y asiaticos, con revision humana posterior, aprovechando la licencia Apache 2.0 para uso comercial.
- Subtitulado y transcripcion multilingue: traduccion de transcripciones generadas por ASR a varios idiomas destino en un pipeline por etapas, usando la cuantizacion Q6_K (6,3 GB) para maximizar calidad.
- Investigacion en traduccion automatica de baja recursos: evaluacion del modelo en pares de idiomas poco representados (por ejemplo, yue-es, bo-en, ug-zh) gracias a la amplia cobertura declarada.
- Traduccion offline en dispositivos: despliegue con llama.cpp en equipos con 8-16 GB de VRAM usando Q3_K_M o Q4_K_S, util para entornos sin conectividad o con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - Q4_K_M: ~4,7 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,1 GB
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A10/A100/H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando Q4_K_S, Q4_K_M o Q5_K_S; en tarjetas de 6 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para el modelo base original, transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT3-7B (GGUF, este repo) | 7,5 B | no disponible | Apache 2.0 | GGUF | Especializado en traduccion, >90 idiomas declarados |
| tencent/Hy-MT3-7B (base) | 7,5 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Hy-MT3-7B-i1-GGUF | 7,5 B | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantizaciones ponderadas del mismo autor |

No se dispone de informacion sobre otros modelos de traduccion comparables (por ejemplo, NLLB-200 o M2M-100) en los datos proporcionados, por lo que no se incluyen cifras comparativas de rendimiento.

## Limitaciones y advertencias

- La model card del repositorio GGUF no documenta sesgos conocidos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos generativos: en traduccion puede producir omisiones, adiciones o cambios de sentido, especialmente en idiomas de bajos recursos.
- No se especifica la longitud de contexto soportada, lo que impide garantizar el comportamiento en documentos largos.
- La lista de idiomas declarada incluye mas de 90 codigos, pero no se aportan metricas de calidad por idioma; la calidad en idiomas de bajos recursos puede ser notablemente inferior.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original en `tencent/Hy-MT3-7B` antes de desplegarlo en produccion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar la fidelidad de la traduccion; para produccion se recomienda Q5_K_M o superior.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su uso en pipelines agenticos sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hy-MT3-7B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Hy-MT3-7B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Hy-MT3-7B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
