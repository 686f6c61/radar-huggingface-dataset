# f0rkB0mb161/Wizard-Vicuna-13B-Uncensored-GGUF

## Resumen

Wizard-Vicuna-13B-Uncensored-GGUF es una distribucion en formato GGUF del modelo Wizard-Vicuna-13B-Uncensored, un modelo de lenguaje de 13.000 millones de parametros derivado de LLaMA y ajustado mediante fine-tuning supervisado sobre el dataset `ehartford/wizard_vicuna_70k_unfiltered`. El repositorio aqui descrito, publicado por el usuario `f0rkB0mb161`, contiene unicamente los pesos cuantizados en GGUF generados originalmente por `mradermacher` a partir del modelo base `QuixiAI/Wizard-Vicuna-13B-Uncensored`. No se trata de un modelo entrenado desde cero, sino de un empaquetado de cuantizaciones estaticas para inferencia local.

El modelo resuelve el problema de ejecutar un LLM de 13B en hardware de consumo mediante cuantizacion de 2 a 8 bits, reduciendo el peso en disco desde aproximadamente 26 GB en FP16 hasta 5,0 GB en Q2_K. Su caracteristica definitoria es el ajuste "uncensored": el fine-tuning se realizo sobre un dataset sin filtrar, de modo que el modelo no incorpora el filtrado de seguridad tipico de los asistentes alineados. Esta orientado exclusivamente al ingles y su licencia es "other", heredada de la cadena de modelos base.

Es relevante en el contexto actual como ejemplo de la practica de redistribucion de cuantizaciones GGUF y como caso de estudio de los riesgos de los modelos sin alineacion de seguridad. No dispone de datos publicados de benchmarks, contexto extendido, soporte de tool calling ni capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de LLaMA, segun la cadena de modelos base; no se detalla en la informacion disponible) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la cadena de derivacion (Wizard-Vicuna-13B-Uncensored, basado en Vicuna, basado en LLaMA) se trata de un transformer decoder-only de 13.000 millones de parametros, pero no se confirman en la documentacion proporcionada el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa. Tampoco se especifica si emplea atencion con RoPE, GQA u otras variantes.

El entrenamiento consistio en un fine-tuning supervisado sobre el dataset `ehartford/wizard_vicuna_70k_unfiltered`, que combina datos de instrucciones sin filtrar. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. El proceso de cuantizacion es estatico (no imatrix); el autor indica que las cuantizaciones ponderadas/imatrix se publican en un repositorio separado. No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles: continuacion, redaccion y respuesta a instrucciones.
- Conversacion multi-turno: el ajuste sobre datos de instrucciones tipo Wizard/Vicuna habilita el dialogo por turnos.
- Respuestas sin filtrado de seguridad: el ajuste "uncensored" elimina las negativas por contenido, lo que incluye contenido sensible o danino.
- Razonamiento basico y tareas de conocimiento general: limitado por el tamano de 13B y la ausencia de datos de benchmarks.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No se documenta modo "thinking", vision, audio ni capacidades multimodales.
- Multilingue: no; solo ingles segun la model card.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como linea base "sin censura" para comparar el comportamiento de modelos alineados frente a no alineados en pruebas de robustez y red-teaming controlado.
- Inferencia local en hardware de consumo: con las cuantizaciones Q4_K_M (8,0 GB) o Q5_K_M (9,3 GB) puede ejecutarse en GPUs de 12-16 GB de VRAM mediante llama.cpp u Ollama, util para experimentacion offline sin dependencia de APIs.
- Generacion creativa sin restricciones: redaccion de ficcion, guiones o contenido narrativo donde el filtrado de seguridad de los asistentes comerciales interfiere con el proceso creativo.
- Prototipado rapido de chatbots de dominio cerrado: el formato GGUF permite desplegar un asistente conversacional en ingles en entornos aislados con `llama-server` o `llama.cpp`.
- Evaluacion de cuantizaciones: el repositorio ofrece 11 variantes (Q2_K a Q8_0) que permiten medir la degradacion de perplejidad y calidad segun el nivel de cuantizacion en un mismo modelo.
- Docencia y demostraciones: ejecucion de un LLM de 13B en un portatil con GPU consumer para explicar el funcionamiento de la cuantizacion y la inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (peso del modelo, sin contar cache KV):
  - Q2_K: ~5,0 GB
  - Q3_K_S: ~5,8 GB; Q3_K_M: ~6,4 GB; Q3_K_L: ~7,0 GB
  - IQ4_XS: ~7,1 GB; Q4_K_S: ~7,5 GB; Q4_K_M: ~8,0 GB
  - Q5_K_S: ~9,1 GB; Q5_K_M: ~9,3 GB
  - Q6_K: ~10,8 GB
  - Q8_0: ~13,9 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 solo si se busca throughput alto con llama.cpp o vLLM (vLLM no soporta GGUF de forma nativa en todas sus versiones).
- Cabe en GPU consumer: si. Q4_K_M (8,0 GB) entra en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070; Q8_0 (13,9 GB) requiere 16 GB o mas. Las cuantizaciones Q2-Q3 caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio, text-generation-webui con backend llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints, aunque no se detalla.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Wizard-Vicuna-13B-Uncensored-GGUF (este) | 13,0B | no disponible | GGUF | other | Sin benchmarks publicados; solo ingles |
| Wizard-Vicuna-13B-Uncensored (base) | 13,0B | no disponible | safetensors | other | Modelo original sin cuantizar |
| WizardLM-13B-Uncensored | 13,0B | no disponible | safetensors/GGUF | other | Linaje similar; tampoco publica benchmarks en esta informacion |
| Llama 2 13B Chat | 13,0B | 4.096 tokens | safetensors/GGUF | Llama 2 Community License | Alineado con RLHF; benchmarks publicos |

La comparativa se limita a la informacion disponible; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Ausencia de alineacion de seguridad: el ajuste "uncensored" elimina los rechazos ante contenido sensible, lo que implica riesgo de generar contenido danino, ilegal o sexualmente explicito. No es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion: modelo de 13B de la generacion LLaMA 1, sin benchmarks publicados que permitan acotar su fiabilidad.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Longitud de contexto no documentada: no se puede asumir una ventana larga; los modelos de este linaje suelen limitarse a 2.048-4.096 tokens.
- Licencia "other" no especificada: las restricciones de uso comercial heredan las del modelo base (LLaMA 1 original), que prohibia el uso comercial. Es imprescindible revisar la licencia de la cadena completa antes de cualquier despliegue productivo.
- Repositorio no verificado: 0 descargas y 0 likes, publicado por un usuario no oficial; los pesos GGUF son redistribucion de las cuantizaciones de `mradermacher`. No hay garantia de integridad ni de mantenimiento.
- Sin soporte de tool calling ni agentes: no apto para pipelines que requieran function calling estructurado.
- Sin datos de benchmarks: imposible estimar calidad frente a alternativas modernas; probablemente inferior a modelos actuales de 7-8B alineados en tareas de instrucciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/f0rkB0mb161/Wizard-Vicuna-13B-Uncensored-GGUF
- Modelo base: https://huggingface.co/QuixiAI/Wizard-Vicuna-13B-Uncensored
- Cuantizaciones imatrix del mismo modelo (mradermacher): https://huggingface.co/mradermacher/Wizard-Vicuna-13B-Uncensored-i1-GGUF
- Cuantizaciones estaticas originales (mradermacher): https://huggingface.co/mradermacher/Wizard-Vicuna-13B-Uncensored-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ehartford/wizard_vicuna_70k_unfiltered
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Wizard-Vicuna-13B-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion (mradermacher): https://huggingface.co/mradermacher/model_requests
