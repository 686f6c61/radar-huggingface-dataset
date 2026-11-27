# mradermacher/CherryPit-1.3-2B-GGUF

## Resumen

CherryPit-1.3-2B-GGUF es la distribucion en formato GGUF del modelo CherryPit-1.3-2B, un modelo de lenguaje pequeno (SLM) de aproximadamente 2.516 millones de parametros desarrollado por DRUPEs y cuantizado por mradermacher. Se trata de un merge orientado a tareas de codigo, desarrollo web, matematicas, razonamiento y tool calling, con un enfoque explicito hacia el despliegue on-device. Su licencia Apache 2.0 facilita la integracion en productos comerciales sin restricciones adicionales.

El modelo parte de una base MiniCPM (segun la etiqueta `minicpm` de la model card) y se distribuye exclusivamente en ingles. Al ser un merge, combina pesos de distintos modelos para reforzar capacidades concretas en un tamano reducido, lo que lo hace interesante para entornos con recursos limitados donde no es viable ejecutar un modelo de 7B o superior.

La relevancia de esta ficha radica en que el repositorio ofrece 11 cuantizaciones estaticas que van desde 1,1 GB (Q2_K) hasta 5,1 GB (f16), lo que permite desplegar el modelo en hardware muy modesto, incluidas CPU y GPUs de consumo con poca VRAM. No obstante, la informacion publicada sobre arquitectura detallada, contexto, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM, segun etiqueta de la model card); detalles no disponibles |
| Parametros totales | 2.516.756.480 (~2,52 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. La etiqueta `minicpm` de la model card sugiere que el modelo base deriva de la familia MiniCPM, que emplea transformers densos de pequeno tamano con atencion estandar. Al tratarse de un merge (etiqueta `merge`), los pesos se obtienen combinando dos o mas modelos, presumiblemente para potenciar capacidades de codigo, matematicas, razonamiento y tool calling en un unico checkpoint de 2,5B.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Esta ausencia de informacion es una limitacion importante para evaluar el modelo con rigor.

## Capacidades

- Generacion de texto conversacional en ingles.
- Generacion y asistencia en codigo, con enfasis en desarrollo web.
- Razonamiento matematico basico a moderado.
- Razonamiento multi-paso (etiqueta `reasoning`).
- Tool calling / function calling, segun las etiquetas del repositorio.
- Despliegue on-device gracias a su tamano reducido y a las cuantizaciones disponibles.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues: limitadas al ingles segun la model card; no se documentan otros idiomas.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente de codigo en local para desarrolladores: el modelo puede autocompletar y explicar fragmentos de codigo en un portatil sin GPU dedicada, usando la cuantizacion Q4_K_M (1,7 GB) con llama.cpp u Ollama.
- Generacion de snippets de desarrollo web: util para prototipar componentes HTML/CSS/JavaScript en entornos de edicion integrados con recursos limitados, gracias a su enfoque declarado en web-development.
- Automatizacion de tool calling en agentes ligeros: al soportar function calling, puede integrarse en pipelines que consulten APIs o ejecuten acciones estructuradas en entornos de borde (edge).
- Tutoria de matematicas basicas: resuelve problemas aritmeticos y algebraicos sencillos en aplicaciones educativas desplegadas en dispositivos de bajo coste.
- Clasificacion y resumen de texto en ingles: adecuado para tareas de procesamiento por lotes en CPU donde el throughput prima sobre la calidad maxima.
- Chatbot de soporte interno en ingles: puede gestionar conversaciones multi-turno simples en herramientas corporativas on-premise, con la ventaja de que los datos no salen del dispositivo.
- Experimentacion e investigacion en SLMs: sirve como baseline ligero para estudiar merges y cuantizaciones en entornos academicos con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluyendo overhead de contexto): aproximadamente 1,5-2,5 GB con Q4_K_M, 2,5-3,5 GB con Q6_K y 3,5-5 GB con Q8_0.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones intermedias; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas ultimas.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas con 4 GB o mas; tambien puede ejecutarse en CPU pura con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CherryPit-1.3-2B | ~2,52B | No disponible | Apache 2.0 | GGUF, safetensors | Merge orientado a codigo, matematicas y tool calling; solo ingles |
| Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 tokens | Apache 2.0 | GGUF, safetensors | Multilingue, muy extendido, buen soporte de tool calling |
| SmolLM2-1.7B-Instruct | ~1,71B | 8.192 tokens | Apache 2.0 | GGUF, safetensors | Enfocado en eficiencia on-device, multilingue |
| MiniCPM-2B | ~2,7B | 4.096 tokens | Apache 2.0 (con condiciones) | GGUF, safetensors | Base probable del modelo; buen rendimiento en chino e ingles |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria; no se dispone de datos de rendimiento comparativo para CherryPit-1.3-2B.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se publican datos de benchmarks, por lo que la calidad real del modelo frente a alternativas establecidas es desconocida.
- Al ser un merge, puede heredar sesgos y comportamientos erraticos de los modelos combinados; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion inherente a los SLM, especialmente en razonamiento complejo y matematicas avanzadas.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que impide evaluar riesgos de contaminacion o de memorizacion de datos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la licencia del modelo base (DRUPEs/CherryPit-1.3-2B) y de los modelos fusionados.
- El repositorio tiene muy poca traccion (371 descargas y 0 likes en el momento de la consulta), lo que reduce la probabilidad de encontrar soporte comunitario o correcciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CherryPit-1.3-2B-GGUF
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.3-2B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#CherryPit-1.3-2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
