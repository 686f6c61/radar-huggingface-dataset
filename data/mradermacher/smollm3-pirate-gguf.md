# mradermacher/smollm3-pirate-GGUF

## Resumen

smollm3-pirate-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo wuhuaxiaohaixing/smollm3-pirate, generadas por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo base es un ajuste fino por SFT (supervised fine-tuning) del modelo SmolLM3, orientado a respuestas con estilo "pirata", entrenado sobre el dataset wuhuaxiaohaixing/pirate-instructions-400. Con 3.075.098.624 parametros (aproximadamente 3.000 millones), se situa en la categoria de modelos pequenos optimizados para ejecucion en hardware de consumo.

El modelo hereda la arquitectura del SmolLM3 original, un transformer denso de la familia SmolLM desarrollada por Hugging Face, aunque la model card del repositorio no detalla la configuracion exacta de capas, cabezas de atencion ni longitud de contexto. La relevancia de estas cuantizaciones radica en que permiten ejecutar el modelo en CPU y GPU de gama baja mediante llama.cpp y herramientas compatibles, con tamanos que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16).

La licencia Apache 2.0 facilita su uso comercial y modificacion, si bien el caracter especializado del ajuste fino (estilo pirata) limita su aplicabilidad general. Es un ejemplo tipico de la cadena de valor del ecosistema open source: un modelo base de Hugging Face, un ajuste fino comunitario y una capa de cuantizacion para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (herencia de SmolLM3; detalles no disponibles) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base wuhuaxiaohaixing/smollm3-pirate parte de SmolLM3, un transformer denso de aproximadamente 3.000 millones de parametros. El ajuste fino se realizo mediante SFT con la libreria TRL, sobre el dataset wuhuaxiaohaixing/pirate-instructions-400, compuesto por 400 instrucciones orientadas a generar respuestas con estilo pirata. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO posteriores al SFT.

Las cuantizaciones han sido generadas por mradermacher con quantize_version 2 y output_tensor_quantised 1, usando conversion de tipo hf. No se han publicado cuantizaciones ponderadas por imatrix para este modelo en el momento de la ficha. La model card no documenta innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.) mas alla de las propias del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles con un estilo "pirata" consistente, derivado del ajuste fino SFT.
- Respuesta a instrucciones en formato conversacional (tag conversational en el repositorio).
- Inferencia local en CPU y GPU mediante llama.cpp y herramientas compatibles con GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que permite servir el modelo mediante APIs compatibles.
- Capacidades multilingues limitadas: la model card declara unicamente ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo puede emplearse para construir chatbots con una personalidad concreta (estilo pirata) en demos, juegos o experiencias interactivas, gracias a su ajuste fino especifico y a su reducido tamano.
- Educacion y experimentacion con fine-tuning: sirve como ejemplo practico de como un SFT sobre un dataset pequeno (400 instrucciones) modifica el estilo de un modelo base, util en cursos de ajuste fino y cuantizacion.
- Despliegue en dispositivos de borde: con cuantizaciones de 1,4 a 2,3 GB, puede ejecutarse en portatiles sin GPU dedicada o en mini-PC, permitiendo experiencias conversacionales offline.
- Generacion de contenido tematico: redaccion de textos con tono pirata para juegos de rol, narrativa interactiva o material promocional de tematica naval.
- Pruebas de pipelines de inferencia: util para validar integraciones con llama.cpp, Ollama o servidores compatibles con GGUF antes de migrar a modelos mayores.
- Investigacion sobre sesgos de estilo: permite estudiar como el SFT sobre un dataset tematico afecta a la coherencia, la factualidad y la deriva estilistica en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB (Q2_K), 2,0 GB (Q4_K_M), 3,4 GB (Q8_0) y 6,3 GB (f16), sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores permiten ejecutar incluso f16 con holgura. Tambien viable en Apple Silicon mediante Metal.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (el tag endpoints_compatible lo indica) y cualquier runtime que soporte GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| smollm3-pirate-GGUF | ~3,07 B | no disponible | Apache 2.0 | GGUF | Ajuste fino tematico (pirata) sobre SmolLM3 |
| SmolLM3 (base, Hugging Face) | ~3 B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base generalista del que deriva |
| Qwen2.5-3B | ~3 B | no disponible en esta ficha | Apache 2.0 (segun version) | safetensors, GGUF | Alternativa generalista de tamano similar |
| Llama 3.2 3B | ~3 B | no disponible en esta ficha | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista con licencia mas restrictiva |

La comparacion se limita a tamano y licencia, ya que no se dispone de datos de benchmarks para el modelo objeto de la ficha ni de especificaciones de contexto en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste fino esta orientado a un estilo "pirata", lo que puede degradar la calidad en tareas generales y producir respuestas estilizadas incluso cuando no se desean.
- Riesgo de alucinacion inherente a un modelo de 3.000 millones de parametros; no debe usarse como fuente de verdad en dominios factuales.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada en esta ficha; conviene verificar la configuracion del modelo base antes de usarlo en conversaciones largas.
- Aunque la licencia es Apache 2.0, el dataset de ajuste fino (pirate-instructions-400) podria tener sus propias condiciones; conviene revisarlas antes de un uso comercial.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para produccion.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/smollm3-pirate-GGUF
- Modelo base: https://huggingface.co/wuhuaxiaohaixing/smollm3-pirate
- Dataset de ajuste fino: https://huggingface.co/datasets/wuhuaxiaohaixing/pirate-instructions-400
- Pagina de descargas del autor: https://hf.tst.eu/model#smollm3-pirate-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
