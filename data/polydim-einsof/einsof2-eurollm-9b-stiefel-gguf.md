# Polydim-Einsof/einsof2-eurollm-9b-stiefel-gguf

## Resumen

EINSOF-II EuroLLM 9B Stiefel (GGUF) es una distribucion cuantizada del modelo base `utter-project/EuroLLM1.5-9B-SFT`, publicado por el usuario Polydim-Einsof. El modelo parte de EuroLLM 1.5, un modelo multilingue europeo de 9.152 millones de parametros, y le aplica un adaptador denominado "Stiefel" que, segun la model card, opera sobre la variedad de Stiefel S^(D-1) mediante retraccion polar de orden 4, dentro de un framework propio llamado POLYDIM PMTP. El resultado se distribuye en formato GGUF para su uso con llama.cpp y Ollama.

La relevancia de esta ficha es doble. Por un lado, ofrece una via de despliegue local de un modelo multilingue europeo de ~9B en cuantizaciones Q4_K_M (5,20 GB) y Q8_0 (9,06 GB), lo que lo hace accesible en hardware de consumo. Por otro lado, la informacion publicada es muy limitada: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento del adaptador ni se documentan los idiomas exactos soportados, por lo que la evaluacion practica queda en manos del usuario.

Se trata, por tanto, de un artefacto experimental orientado a la experimentacion con tecnicas de adaptacion sobre la variedad de Stiefel, mas que de un modelo con validacion publica extensa. La licencia Apache 2.0 facilita su uso comercial, pero la ausencia de datos de rendimiento exige cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de EuroLLM 1.5 9B); adaptador sobre variedad de Stiefel S^(D-1) con retraccion polar de orden 4 |
| Parametros totales | 9.152.319.488 (~9,15B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (5,20 GB), Q8_0 (9,06 GB) |
| Idiomas soportados | 32+ idiomas europeos y regionales (segun model card); listado exacto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo base es EuroLLM 1.5 9B SFT, un transformer decoder-only de 9.152 millones de parametros entrenado por el proyecto utter-project con enfasis en lenguas europeas. Sobre esa base se aplica el adaptador `Polydim-Einsof/einsof2-eurollm-9b-stiefel-adapter`, que segun la model card opera en la variedad de Stiefel S^(D-1) usando retraccion polar de orden 4. Se trata de una parametrizacion geometrica de los pesos (proyeccion sobre una variedad matricial con restricciones de ortogonalidad) en lugar de un ajuste fino convencional, integrada en el framework POLYDIM PMTP.

No se dispone de informacion sobre el numero de tokens de entrenamiento del adaptador, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en esta etapa. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. La unica informacion tecnica verificable es la derivada del modelo base y del proceso de cuantizacion a GGUF.

## Capacidades

- Generacion de texto conversacional en mas de 32 idiomas europeos y regionales, segun la model card.
- Razonamiento y comprension multilingue heredados de EuroLLM 1.5 9B SFT.
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue via llama.cpp y Ollama.
- Capacidad de codigo y matematicas: no documentada especificamente para este adaptador.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Atencion al cliente multilingue en Europa: el modelo puede gestionar conversaciones multi-turno en decenas de lenguas europeas, lo que permite desplegar un unico modelo para soporte en varios paises sin pipelines separados por idioma. La cuantizacion Q4_K_M (5,20 GB) reduce el coste de servir varias instancias.
- Traduccion y localizacion interna: con soporte declarado de 32+ idiomas europeos, es adecuado para tareas de traduccion asistida y generacion de borradores localizados en entornos con requisitos de soberania de datos, al poder ejecutarse on-premise.
- Procesamiento de documentacion administrativa europea: la orientacion del modelo base hacia lenguas europeas lo hace util para resumir y clasificar textos legales o institucionales en idiomas minoritarios que otros modelos cubren peor.
- Despliegue en hardware de consumo para prototipado: la variante Q4_K_M cabe en GPUs de consumo con 8-12 GB de VRAM, lo que permite a desarrolladores individuales experimentar con un modelo de ~9B sin infraestructura cloud.
- Investigacion en adaptacion geometrica: el adaptador Stiefel y el framework POLYDIM PMTP son de interes para investigadores que estudian parametrizaciones sobre variedades matriciales; el modelo sirve como referencia reproducible.
- Generacion de contenido editorial en idiomas regionales: para redaccion asistida en catalan, gallego, euskera u otras lenguas regionales europeas, donde el modelo base declara cobertura especifica.
- Chatbot embebido en aplicaciones de escritorio: gracias al formato GGUF y a la compatibilidad con llama.cpp y Ollama, puede integrarse en aplicaciones locales sin dependencia de API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,5-6,5 GB para Q4_K_M (pesos de 5,20 GB mas overhead de contexto y KV cache); ~9,5-11 GB para Q8_0 (pesos de 9,06 GB mas overhead).
- GPU recomendadas: para Q4_K_M, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; para Q8_0, RTX 4080/4090 (16-24 GB) o GPUs de datacenter como A100 40 GB y H100.
- Cabe en GPU de consumo: si, Q4_K_M en GPUs de 8-12 GB (con contexto moderado) y Q8_0 en GPUs de 16 GB o mas.
- Opciones de despliegue: llama.cpp y Ollama (soporte explicito en la model card); otros runners compatibles con GGUF como llama-cpp-python o LM Studio son plausibles pero no estan documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EINSOF-II EuroLLM 9B Stiefel (este) | ~9,15B | no disponible | Apache 2.0 | GGUF | Adaptador Stiefel sobre EuroLLM 1.5 9B SFT |
| utter-project/EuroLLM1.5-9B-SFT (base) | ~9,15B | no disponible | no disponible en esta ficha | safetensors | Modelo base sin adaptador; referencia directa |
| Mistral 7B Instruct | ~7,2B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamano similar con amplia validacion publica |
| Llama 3.1 8B Instruct | ~8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto documentado, pero licencia no Apache |

La comparacion con Mistral 7B y Llama 3.1 8B se ofrece como referencia de categoria (modelos ~7-9B desplegables en local); no se dispone de datos de rendimiento de este modelo para una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el adaptador Stiefel mejore, mantenga o degrade el rendimiento del modelo base.
- El adaptador se aplica sobre un modelo SFT; no se documenta si se realizo alineacion adicional (RLHF/DPO) tras la adaptacion, lo que puede afectar a la calidad conversacional.
- Riesgo de alucinacion inherente a los modelos de ~9B; sin evaluacion publica no es posible acotarlo.
- La lista exacta de idiomas soportados no esta disponible; "32+ idiomas europeos" es una afirmacion de la model card sin verificacion independiente.
- Longitud de contexto no documentada; debe determinarse empiricamente antes de disenar aplicaciones con contexto largo.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base EuroLLM 1.5 9B SFT antes de un uso comercial, ya que las condiciones del derivado pueden heredar restricciones del original.
- La terminologia "Stiefel manifold" y "POLYDIM PMTP" no viene acompanada de paper ni documentacion tecnica enlazada, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-eurollm-9b-stiefel-gguf
- Adaptador: https://huggingface.co/Polydim-Einsof/einsof2-eurollm-9b-stiefel-adapter
- Modelo base: https://huggingface.co/utter-project/EuroLLM1.5-9B-SFT
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
