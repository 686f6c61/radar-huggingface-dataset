# GhostScientist/jev-decisions-v2-smoke-scratch

## Resumen

jev-decisions-v2-smoke-scratch es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario GhostScientist el 2 de octubre de 2026. El entrenamiento se ha realizado con la libreria TRL sobre el dataset GhostScientist/jev-decisions-v1, y el resultado es un checkpoint de 852.985.920 parametros (unos 853 M) con pesos en formato safetensors y un repositorio de 3,4 GB.

El modelo se enmarca en la categoria de modelos pequenos orientados a conversacion: el ejemplo de la model card lo utiliza mediante `pipeline("text-generation")` con una entrada de chat y `max_new_tokens=128`. Los metadatos de HuggingFace lo etiquetan con la libreria `qwen3_5` y el pipeline `image-text-to-text`, lo que apunta a la familia Qwen3.5, aunque la model card no documenta capacidades multimodales ni ningun otro detalle funcional mas alla del ajuste con SFT.

Su relevancia actual es limitada y de caracter experimental: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, no declara licencia utilizable ni idiomas soportados, y el sufijo "smoke-scratch" del nombre sugiere una ejecucion de prueba de humo mas que un modelo destinado a produccion. Debe tratarse, por tanto, como un artefacto de investigacion reproducible mas que como una alternativa desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base Qwen/Qwen3.5-0.8B; etiquetada como `qwen3_5` en los metadatos) |
| Parametros totales | 852.985.920 (aproximadamente 853 M) |
| Parametros activos | no aplica (no se documenta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors. El tamano del repo (3,4 GB) coincide con pesos en fp32 (4 bytes por parametro) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo `licence` de la model card contiene el literal "license", sin valor real) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Dataset de ajuste | GhostScientist/jev-decisions-v1 |
| Metodo de entrenamiento | SFT con TRL 1.14.1 |
| Version de transformers | 5.18.0 |
| Version de PyTorch | 2.14.1 |
| Version de Datasets | 5.0.1 |
| Version de Tokenizers | 0.23.2 |
| Fecha de publicacion | 2026-10-02 |
| Tamano del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. Lo unico documentado es que se trata de un ajuste fino de Qwen/Qwen3.5-0.8B, que los metadatos de HuggingFace lo etiquetan con la familia `qwen3_5` y que el pipeline declarado es `image-text-to-text`. Esta ultima etiqueta resulta contradictoria con el ejemplo de uso de la propia model card, que invoca `pipeline("text-generation")` sobre una lista de mensajes con rol `user`; no hay documentacion adicional que confirme si el modelo conserva un codificador visual funcional o si la etiqueta es heredada del modelo base.

El entrenamiento se ha realizado exclusivamente mediante SFT (supervised fine-tuning) con TRL, sobre el dataset GhostScientist/jev-decisions-v1. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la configuracion de hiperparametros (tasa de aprendizaje, epocas, tamano de lote, esquema de empaquetado de secuencias) ni si hubo fases posteriores de alineacion como RLHF, DPO o GRPO. Tampoco se documenta ninguna innovacion tecnica en decodificacion, atencion o eficiencia.

El nombre del repositorio incluye los terminos "smoke" y "scratch", y la model card esta generada automaticamente por la plantilla de TRL (`generated_from_trainer`), con secciones vacias. Todo ello indica una ejecucion de validacion del pipeline de entrenamiento, no un entrenamiento depurado y documentado.

## Capacidades

- Generacion de texto conversacional: la model card proporciona un ejemplo funcional de `text-generation` con una pregunta abierta y un limite de 128 tokens nuevos.
- Respuesta a peticiones de tipo "decision": el dataset de ajuste se denomina `jev-decisions-v1`, lo que sugiere que el entrenamiento se centro en escenarios de eleccion y justificacion, aunque no hay documentacion que detalle el formato exacto de las muestras.
- Soporte multimodal: el pipeline declarado en los metadatos es `image-text-to-text`, pero no se aporta ningun ejemplo, plantilla ni confirmacion de entrada de imagen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia de plantillas de herramientas ni de modos de razonamiento extendido.
- Capacidades multilingues: no disponibles; no se declara ningun idioma en la ficha.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

Los siguientes escenarios son propuestas de aplicacion derivadas de las caracteristicas documentadas del modelo (modelo denso de ~853 M de parametros, ajustado con SFT sobre un dataset de decisiones, con peso en fp32). Al no existir benchmarks ni evaluaciones publicadas, ninguno de ellos puede darse por validado.

- Prototipado rapido de asistentes conversacionales en local: con 853 M de parametros, el modelo puede cargarse en una GPU de gama media e incluso en CPU para probar plantillas de dialogo antes de escalar a modelos mayores. Es adecuado para iterar sobre prompts y formatos de mensaje sin coste de API.
- Evaluacion de pipelines de entrenamiento con TRL: dado que la model card esta generada por `generated_from_trainer` y el nombre indica una prueba de humo, el artefacto sirve para verificar que el flujo de SFT, tokenizacion y guardado de safetensors funciona de extremo a extremo.
- Investigacion sobre ajuste de modelos pequenos en dominios de decision: el modelo permite estudiar como un modelo de menos de mil millones de parametros responde a preguntas de eleccion con justificacion, y comparar el efecto del SFT frente al modelo base Qwen3.5-0.8B.
- Generacion de texto asistida por lotes en entornos con recursos limitados: al ocupar menos de 4 GB en fp32 y alrededor de 1,7 GB en fp16, puede ejecutarse en paralelo con otras cargas en una misma GPU para tareas de clasificacion, resumen breve o generacion de borradores.
- Base para destilacion o ajuste posterior: un checkpoint denso de 853 M es un punto de partida manejable para experimentos de LoRA, cuantizacion a 4 bits o destilacion desde modelos mayores, siempre que se resuelva antes la ambiguedad de licencia.
- Educacion y divulgacion: para demostrar en un taller como se pasa de un modelo base a un ajuste con TRL, que artefactos se publican y que informacion falta en una model card generada automaticamente.
- Filtrado previo o anotacion en cascada: por su tamano, puede usarse como primer nivel de una cascada de generacion, dejando los casos dudosos a un modelo mayor, aunque sin benchmarks no hay garantia de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritmeticas derivadas del recuento de parametros (852.985.920), no datos publicados por el autor.

- Pesos en fp32: aproximadamente 3,4 GB solo de pesos; con activaciones y cache KV, un entorno realista ronda los 5-6 GB de VRAM.
- Pesos en fp16/bf16: aproximadamente 1,7 GB de pesos; el consumo total estimado se situa en 2,5-3 GB.
- Pesos en int8: aproximadamente 0,9 GB de pesos; consumo total estimado de 1,5-2 GB.
- Pesos en int4: aproximadamente 0,5 GB de pesos; consumo total estimado de 1-1,5 GB.
- El tamano de la cache KV no puede estimarse porque se desconoce la longitud de contexto, el numero de capas y la configuracion de atencion.
- Cabe en GPU de consumo: si, con holgura en cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, etc.), y previsiblemente tambien en GPUs de 6 GB si se cuantiza.
- GPU profesionales: A100, H100, L40S o similares no son necesarias para inferencia de un solo flujo; solo tendrian sentido para servir muchas peticiones concurrentes.
- CPU: es viable la inferencia en CPU con pesos cuantizados, aunque el rendimiento no esta documentado.
- Opciones de despliegue: `transformers` con `pipeline` y `device_map="auto"` es la via documentada en la model card. vLLM y TGI son tecnicamente posibles al tratarse de safetensors de un modelo de la familia Qwen, pero no hay configuracion publicada. llama.cpp u Ollama requeririan convertir los pesos, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo base del que deriva. No se han facilitado datos de otros modelos comparables de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| GhostScientist/jev-decisions-v2-smoke-scratch | 852.985.920 (853 M) | no disponible | no disponible | safetensors | no disponible |
| Qwen/Qwen3.5-0.8B (modelo base) | aproximadamente 0,8 B segun la denominacion | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible |

No se dispone de alternativas comparables documentadas en la informacion disponible, por lo que no es posible establecer una comparativa de rendimiento, contexto o licencia frente a otros modelos de tamano similar.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni conjuntos de validacion publicados. Cualquier uso en produccion se haria sin evidencia de calidad.
- Licencia sin definir: el campo `licence` de la model card contiene el literal "license", sin valor, y los metadatos de HuggingFace indican que no hay licencia disponible. Esto impide determinar si el uso comercial esta permitido, tanto del modelo como de las salidas derivadas del dataset de ajuste.
- Idiomas no declarados: no se especifica que lenguas domina el modelo ni la composicion linguistica del dataset `jev-decisions-v1`. Es probable que el comportamiento fuera de los idiomas presentes en el entrenamiento sea deficiente, pero no puede cuantificarse.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano, especialmente elevado en un ajuste de prueba de humo sin alineacion documentada (no se menciona RLHF, DPO ni filtrado de respuestas).
- Ambiguedad de modalidad: los metadatos declaran `image-text-to-text` mientras la model card solo demuestra generacion de texto. Integrar el modelo asumiendo entrada de imagen sin verificarlo puede provocar fallos silenciosos.
- Contexto desconocido: al no documentarse la longitud de contexto, no es posible garantizar el comportamiento en conversaciones largas ni dimensionar correctamente la cache KV.
- Sesgos: no disponibles. No hay analisis de sesgos ni descripcion del dataset de ajuste, por lo que se desconocen los sesgos heredados del modelo base y los introducidos por el corpus de entrenamiento.
- Naturaleza experimental: 0 descargas y 0 "likes", nombre con "smoke-scratch" y model card autogenerada con secciones vacias. No hay garantia de mantenimiento, versionado ni soporte.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que anade un paso de conversion con riesgo de degradacion si se necesita desplegar en entornos de bajos recursos.
- Pesos en fp32: el repositorio de 3,4 GB apunta a pesos sin reducir, lo que duplica el espacio y el ancho de banda necesarios frente a una version en fp16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GhostScientist/jev-decisions-v2-smoke-scratch
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de ajuste: https://huggingface.co/datasets/GhostScientist/jev-decisions-v1
- Repositorio de TRL: https://github.com/huggingface/trl
- Espacio de seguimiento de entrenamiento: https://huggingface.co/spaces/GhostScientist/huggingface-static-d6c5cd
- Nota: la busqueda web realizada no devolvio ningun enlace relacionado con este modelo. Los unicos resultados obtenidos correspondian a avisos de seguridad de Apache HTTP Server (CVE-2026-93546), sin relacion con el modelo descrito.
