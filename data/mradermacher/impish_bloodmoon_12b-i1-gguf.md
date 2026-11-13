# mradermacher/Impish_Bloodmoon_12B-i1-GGUF

## Resumen

Impish_Bloodmoon_12B-i1-GGUF es la distribucion en formato GGUF del modelo Impish_Bloodmoon_12B, un modelo de lenguaje conversacional de 12.247.802.880 parametros (aproximadamente 12,2 mil millones) desarrollado originalmente por SicariusSicariiStuff. Esta version concreta ha sido generada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que publica variantes optimizadas para inferencia local con llama.cpp y otros motores compatibles con GGUF. El modelo base esta entrenado exclusivamente en ingles y se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema de ejecutar un LLM de ~12B en hardware de consumo mediante cuantizacion agresiva con imatrix (importance matrix), que preserva la calidad de forma mas fiable que la cuantizacion estatica tradicional en rangos bajos. La familia i1 incluye desde variantes IQ1_S de 3,1 GB hasta Q6_K de 10,2 GB, cubriendo un espectro amplio de compromisos entre VRAM, velocidad y fidelidad. El nombre y los tags ("impish", "Bloodmoon", dataset UBW_Tapestries) sugieren un ajuste fino orientado a rol conversacional y narrativa, no a tareas tecnicas.

La relevancia actual radica en que permite desplegar un modelo de 12B en GPUs consumer (8-12 GB de VRAM con cuantizaciones Q4) o incluso en CPU con llama.cpp, manteniendo el formato GGUF como estandar de facto para inferencia local. No obstante, la informacion publica sobre el modelo base es muy limitada: no hay model card detallada del autor original, ni benchmarks, ni especificaciones de contexto o arquitectura mas alla de lo inferible del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; inferido por el formato y tamano) |
| Parametros totales | 12.247.802.880 (~12,2 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Impish_Bloodmoon_12B: la model card del repositorio cuantizado no incluye descripcion de capas, atencion, ni composicion del dataset de entrenamiento. Por el numero de parametros (12,2 B) y el tag `transformers`, se trata con alta probabilidad de un transformer decoder-only denso, pero no se confirma si emplea GQA, atencion lineal u otras optimizaciones. Tampoco se especifica la longitud de contexto nativa ni el volumen de tokens de entrenamiento.

El unico dato de entrenamiento disponible es la referencia al dataset `SicariusSicariiStuff/UBW_Tapestries`, que por su nombre y el contexto del modelo (tags "impish", "Bloodmoon") parece orientado a datos conversacionales o narrativos, posiblemente con contenido de rol. No hay evidencia publicada de RLHF, DPO o tecnicas de alineamiento especificas. La innovacion tecnica destacable de esta publicacion no esta en el modelo base, sino en el proceso de cuantizacion: el autor emplea una importance matrix (imatrix) generada a partir de datos de calibracion, lo que mejora la fidelidad de las cuantizaciones IQ frente a las estaticas equivalentes en tamano, especialmente en rangos bajos (IQ2/IQ3).

## Capacidades

- Generacion de texto conversacional en ingles, presumiblemente orientada a interacciones de rol y narrativa segun los tags y el dataset del modelo base.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documentan capacidades de vision, audio ni modo "thinking".
- Compatible con endpoints (tag `endpoints_compatible`), lo que indica que puede servirse mediante APIs compatibles con el formato de Hugging Face.
- Al ser un modelo de 12B, se espera capacidad razonable de generacion de codigo y matematicas, pero sin datos que lo confirmen.

## Casos de uso

- Inferencia local en estaciones de trabajo: con la cuantizacion Q4_K_M (7,6 GB) el modelo cabe en GPUs consumer de 8-12 GB y permite ejecutar un LLM de 12B en local sin dependencia de la nube, adecuado para prototipado y experimentacion.
- Desarrollo de personajes conversacionales y narrativa interactiva: por el origen del modelo (dataset UBW_Tapestries, tags "impish"), es probable que este ajustado para mantener personajes y estilo narrativo en conversaciones multi-turno, aunque el contexto maximo no esta documentado.
- Despliegue en CPU con llama.cpp u Ollama: las variantes IQ2/IQ3 (3,7-5,8 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, con throughput moderado, util para demos y entornos de pruebas.
- Generacion de texto asistida en aplicaciones de escritorio: integrable en herramientas locales (por ejemplo, frontends tipo LM Studio o KoboldCpp) que consumen GGUF, para tareas de redaccion y chat sin enviar datos a terceros.
- Fine-tuning posterior y experimentacion: al estar bajo Apache 2.0 y con pesos publicados, sirve como base para ajustes especificos en ingles sobre dominio conversacional.
- Investigacion sobre cuantizacion: el repositorio incluye el fichero imatrix (0,1 GB) y multiples variantes, lo que permite estudiar el impacto de IQ frente a Q_K en calidad y latencia con un mismo modelo base.
- Evaluacion comparativa de calidad por cuantizacion: util para equipos que necesitan decidir que variante desplegar en produccion segun su presupuesto de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - IQ1_S: ~3,1 GB de pesos; con contexto corto, cabe en GPUs de 4-6 GB.
  - IQ2_M: ~4,5 GB; apto para GPUs de 6-8 GB.
  - IQ3_M / Q3_K_M: ~5,8-6,2 GB; apto para GPUs de 8 GB con contexto moderado.
  - Q4_K_M: ~7,6 GB; recomendado para GPUs de 10-12 GB.
  - Q5_K_M: ~8,8 GB; requiere 12 GB o mas.
  - Q6_K: ~10,2 GB; requiere 12-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090 para las variantes altas; A100/H100 no son necesarias para este tamano y solo tendrian sentido para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en la mayoria de modelos con 8 GB o mas usando Q4 o inferior; en GPUs de 6 GB solo con IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier motor compatible con GGUF. El tag `endpoints_compatible` sugiere soporte para servidores tipo TGI o endpoints de HF.
- Latencia y throughput: no disponibles; dependen fuertemente de la cuantizacion, la GPU y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Impish_Bloodmoon_12B (i1-GGUF) | ~12,2 B | no disponible | Apache 2.0 | GGUF | Enfoque conversacional/narrativo, solo ingles |
| Mistral Nemo 12B (GGUF) | ~12,2 B | 128k | Apache 2.0 | GGUF | Multilingue, contexto largo, ampliamente benchmarkeado |
| Gemma 2 9B (GGUF) | ~9,2 B | 8k | Gemma license | GGUF | Menor tamano, buen rendimiento general, licencia restrictiva |
| Qwen2.5 14B (GGUF) | ~14,7 B | 32k | Apache 2.0 | GGUF | Mayor tamano, multilingue, buenos resultados en codigo y matematicas |

La comparacion con Mistral Nemo 12B es la mas directa por tamano y licencia; sin embargo, no hay benchmarks publicados de Impish_Bloodmoon_12B que permitan contrastar calidad. Frente a Gemma 2 9B y Qwen2.5 14B, el modelo de esta ficha ofrece menos garantias documentadas y carece de soporte multilingue declarado.

## Limitaciones y advertencias

- Solo soporta ingles; no se recomienda para produccion en castellano u otros idiomas sin evaluacion previa.
- No hay benchmarks publicados, por lo que su calidad real frente a alternativas establecidas es desconocida.
- Riesgo de alucinacion inherente a los LLM de este tamano, agravado por la falta de documentacion sobre alineamiento (no se confirma RLHF/DPO).
- El dataset de entrenamiento (UBW_Tapestries) sugiere contenido de rol o narrativo; puede presentar sesgos de estilo y no ser adecuado para tareas factuales o tecnicas sin validacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original no incluye una model card detallada que aclare restricciones adicionales o procedencia de los datos.
- Las cuantizaciones por debajo de Q4 (IQ2, Q3) degradan la calidad de forma notable; el propio autor advierte "very low quality" en Q2_K_S y "for the desperate" en IQ1_S.
- No se documenta la longitud de contexto nativa, lo que impide planificar despliegues con ventanas largas.
- El repositorio ocupa 141,9 GB por incluir todas las variantes; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Impish_Bloodmoon_12B-i1-GGUF
- Modelo base: https://huggingface.co/SicariusSicariiStuff/Impish_Bloodmoon_12B
- Dataset de referencia: https://huggingface.co/datasets/SicariusSicariiStuff/UBW_Tapestries
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Impish_Bloodmoon_12B-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Impish_Bloodmoon_12B-i1-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del autor): https://www.nethype.de/
