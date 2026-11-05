# mradermacher/Machynlleth-3B-Instruct-GGUF

## Resumen

Machynlleth-3B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Machynlleth-3B-Instruct, publicado por el usuario mradermacher en HuggingFace. Se trata de una conversion estatica de los pesos originales del modelo base desarrollado por jonpojonpo, con un total de 2.670.113.280 parametros segun los datos de safetensors. El repositorio contiene 11 variantes de cuantizacion distintas, desde Q2_K hasta Q8_0, ademas de una version en x-f16.

El modelo se presenta como un modelo conversacional (etiqueta "conversational" en HuggingFace) orientado a instrucciones, con un tamano de aproximadamente 2,7 mil millones de parametros, lo que lo situa en la categoria de modelos pequenos desplegables en hardware de consumo. La fecha de creacion del repositorio es el 5 de noviembre de 2026, con una actualizacion posterior el mismo dia.

La relevancia de esta ficha radica en que el modelo original no dispone de model card publica con detalles de arquitectura, licencia o datos de entrenamiento; la informacion disponible se limita a los metadatos de la conversion GGUF. El interes principal es la disponibilidad de cuantizaciones estaticas listas para usar con llama.cpp y herramientas compatibles, lo que facilita su despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.670.113.280 (aprox. 2,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo original Machynlleth-3B-Instruct. Por el tamano (2,67B parametros) y la nomenclatura "Instruct", se trata presumiblemente de un transformer decoder-only ajustado para seguir instrucciones, pero no hay datos publicados en la informacion disponible que confirmen la arquitectura exacta, el numero de capas, la dimension del modelo o el mecanismo de atencion.

Tampoco se dispone de datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La unica informacion tecnica verificable proviene de los metadatos de la conversion GGUF, que indican el uso de `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversion se realizo a partir de pesos en formato HuggingFace.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y "Instruct", por lo que se espera que soporte dialogos multi-turno y seguimiento de instrucciones.
- Razonamiento y generacion de texto general: capacidades propias de un modelo de lenguaje de 2,7B parametros, sin datos especificos publicados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se especifican idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM mediante llama.cpp u Ollama, lo que permite prototipar asistentes conversacionales sin depender de APIs externas.
- Prototipado de chatbots de dominio especifico: al ser un modelo Instruct de 2,7B, es adecuado para experimentar con ajuste fino ligero (LoRA) sobre datos propios y validar la viabilidad de un asistente vertical antes de escalar a modelos mayores.
- Generacion de texto en entornos con recursos limitados: la variante Q2_K o IQ4_XS permite ejecucion en CPU o en GPUs con poca memoria, util para demos, pruebas de concepto y entornos embebidos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes, lo que facilita estudios de degradacion de calidad frente a tamano (perplejidad, coherencia) en pipelines de investigacion sobre cuantizacion.
- Filtrado y clasificacion de texto: un modelo conversacional pequeno puede emplearse para tareas de etiquetado, resumen extractivo o reescritura en lotes, siempre que se valide su calidad empíricamente.
- Base para experimentos de alineacion: al no haber documentacion sobre el entrenamiento, puede servir como punto de partida para estudiar el efecto de distintas tecnicas de ajuste sobre un modelo de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 2,7B parametros):
  - Q2_K: aproximadamente 1,5-2 GB.
  - IQ4_XS: aproximadamente 2-2,5 GB.
  - Q4_K_M: aproximadamente 2,5-3,5 GB.
  - Q5_K_M: aproximadamente 3-4 GB.
  - Q6_K: aproximadamente 3,5-4,5 GB.
  - Q8_0: aproximadamente 4,5-5,5 GB.
  - x-f16: aproximadamente 5,5-6,5 GB.
  (Estimaciones basadas en el tamano de parametros; no confirmadas por el autor.)
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para las cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas para cuantizaciones Q4 y Q5; las variantes Q2_K e IQ4_XS pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Machynlleth-3B-Instruct-GGUF | 2,67B | no disponible | no disponible | GGUF | HuggingFace |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | HuggingFace, Ollama |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | HuggingFace, Ollama |
| Phi-3.5-mini-instruct | 3,82B | 131.072 tokens | MIT | safetensors, GGUF | HuggingFace, Ollama |

La comparativa se basa en modelos de tamano similar ampliamente documentados. Machynlleth-3B-Instruct carece de informacion publica sobre contexto, licencia y rendimiento, lo que dificulta una comparacion rigurosa frente a alternativas con documentacion completa.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para produccion con garantias.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; se recomienda contactar con el autor original (jonpojonpo) antes de cualquier despliegue comercial.
- Riesgo de alucinacion: inherente a modelos de este tamano y sin datos de evaluacion publicados; no hay evidencia de mitigaciones especificas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Limitaciones de contexto e idioma: no se especifica la ventana de contexto ni los idiomas soportados; el uso en castellano no esta garantizado.
- Procedencia de la cuantizacion: el repositorio es una conversion de terceros (mradermacher) sobre un modelo de otro autor (jonpojonpo); la calidad de la conversion no ha sido validada externamente.
- Fecha de creacion futura (2026): el repositorio presenta una fecha de creacion posterior a la actual, lo que puede indicar metadatos inconsistentes o un modelo experimental; conviene verificar la integridad de los pesos antes de usarlos.
- Sin resultados de benchmarks: no hay evidencia empirica de rendimiento frente a alternativas del mismo tamano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Machynlleth-3B-Instruct-GGUF
- Modelo original: https://huggingface.co/jonpojonpo/Machynlleth-3B-Instruct
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
