# mradermacher/tin-2b-v3-GGUF

## Resumen
tin-2b-v3 es un modelo de lenguaje conversacional de aproximadamente 1.880 millones de parametros (1,88 B) desarrollado por cagataydev y publicado bajo licencia Apache 2.0. Esta ficha se centra en la version cuantizada en formato GGUF distribuida por mradermacher, que facilita su ejecucion en hardware de consumo mediante llama.cpp y derivados. El modelo se presenta con etiquetas orientadas a despliegue en dispositivo (on-device), uso como agente y tool calling, ademas de generacion de codigo, y declara un linaje basado en la familia Qwen3.5 (etiquetas qwen3.5 y qwen3_5) tras un proceso de ajuste supervisado (SFT).

El modelo base es cagataydev/tin-2b-v3, y esta variante GGUF ofrece un abanico de cuantizaciones estaticas desde Q2_K (1,1 GB) hasta f16 (3,9 GB), lo que permite elegir el equilibrio entre calidad y huella de memoria. Su tamano reducido lo hace relevante para escenarios de inferencia local, prototipado rapido de agentes y automatizacion ligera sin depender de infraestructura de GPU de datacenter.

La informacion publicada por el autor es limitada: no se detallan resultados de benchmarks, composicion exacta del dataset ni longitud de contexto. Esta ficha recoge exclusivamente los datos disponibles en la model card y en los metadatos de Hugging Face, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (linaje Qwen3.5 segun etiquetas del autor); detalles no disponibles |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, tr (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento
El modelo se basa en una arquitectura transformer, segun se deduce de las etiquetas y del linaje declarado hacia Qwen3.5. El autor no publica en la model card detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se especifica si se trata de un modelo denso o de una variante con mezcla de expertos; el recuento de parametros activos no se indica, por lo que se asume un modelo denso de 1,88 B de parametros.

En cuanto al entrenamiento, las etiquetas indican un ajuste supervisado (SFT) sobre el modelo base cagataydev/tin-2b-v3. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre tecnicas de alineacion adicionales. La model card de esta variante GGUF se limita a describir el proceso de cuantizacion estatica realizado por mradermacher, sin aportar datos sobre el entrenamiento original.

## Capacidades
- Generacion de texto conversacional multi-turno, orientada a dialogos (etiqueta conversational).
- Soporte de tool calling / function calling, segun las etiquetas del autor.
- Uso como agente en flujos de razonamiento multi-paso (etiquetas agent y on-device).
- Generacion de codigo (etiqueta code).
- Capacidades multilingues limitadas a ingles (en) y turco (tr) segun la model card.
- Orientado a despliegue en dispositivo (on-device), lo que sugiere optimizacion para entornos con recursos limitados.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su integracion en servicios de inferencia.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso
- Asistentes conversacionales locales: el modelo puede gestionar dialogos multi-turno en ingles y turco ejecutandose en un portatil o mini-PC con la cuantizacion Q4_K_M (1,4 GB), sin necesidad de conexion a la nube.
- Agentes de automatizacion de tareas: gracias al soporte de tool calling, puede integrarse en flujos que invoquen APIs o funciones externas, como consultas a bases de datos o envio de correos, en entornos de prototipado rapido.
- Generacion de codigo en editores y CLI: su tamano reducido permite autocompletado y generacion de fragmentos de codigo en herramientas de desarrollo locales, con latencias bajas al usar cuantizaciones Q4 o Q5.
- Procesamiento de texto en dispositivos edge: puede desplegarse en dispositivos con poca memoria (Raspberry Pi con 4-8 GB de RAM usando Q2_K o Q3_K) para tareas de clasificacion, resumen o extraccion de informacion.
- Chatbots de atencion al cliente para mercados turco e ingles: el soporte nativo de ambos idiomas permite construir asistentes bilingues para pymes sin infraestructura cloud.
- Educacion y experimentacion: su licencia Apache 2.0 y su reducido tamano lo hacen adecuado para investigacion academica, fine-tuning ligero y ensenanza de tecnicas de cuantizacion e inferencia local.
- Integracion en pipelines de CI/CD: puede emplearse como modelo de validacion de codigo o generacion de documentacion tecnica en entornos con recursos acotados, gracias a su compatibilidad con endpoints.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K y Q3_K_S aproximadamente 1,1 GB; Q4_K_M aproximadamente 1,4 GB; Q5_K_M aproximadamente 1,5 GB; Q6_K aproximadamente 1,7 GB; Q8_0 aproximadamente 2,1 GB; f16 aproximadamente 3,9 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar las cuantizaciones mas pequenas; una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) permiten ejecutar f16 con holgura y contexto amplio. En el ambito profesional, una A100 o H100 no son necesarias por el reducido tamano del modelo, aunque pueden usarse para servir multiples instancias.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas con 4 GB o mas de VRAM, e incluso en CPU con 8 GB de RAM usando cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI si se dispone de la configuracion adecuada (no verificada en la informacion disponible).
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera una latencia baja en GPU consumer, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tin-2b-v3 (esta ficha) | 1,88 B | no disponible | Apache 2.0 | GGUF (y safetensors en el base) | Enfoque on-device, agente y tool calling; idiomas en/tr |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa multilingue consolidada, amplia comunidad |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Requiere aceptar licencia; contexto muy amplio |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens (segun documentacion publica de Google) | Gemma Terms of Use | safetensors, GGUF | Mayor tamano, licencia con restricciones de uso |

Nota: los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica; no se dispone de comparaciones de rendimiento verificadas con tin-2b-v3.

## Limitaciones y advertencias
- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion para este modelo; se recomienda validacion especifica antes de usarlo en produccion.
- Riesgo de alucinacion inherente a modelos de 1,88 B de parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Longitud de contexto no documentada; puede ser insuficiente para tareas que requieran ventanas largas.
- Soporte idiomatico limitado a ingles y turco segun la model card; el rendimiento en castellano no esta garantizado ni documentado.
- Las cuantizaciones de menor calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia y la capacidad de seguir instrucciones; se recomienda Q4_K_M o superior para uso en produccion.
- Aunque la licencia es Apache 2.0, el modelo base declara un linaje Qwen3.5; conviene verificar las obligaciones de atribucion y las condiciones de la licencia del modelo base original antes de un despliegue comercial.
- El repositorio GGUF no incluye pesos con imatrix ni cuantizaciones ponderadas; el autor indica que podrian no estar disponibles.
- No se documentan garantias de soporte ni mantenimiento por parte del autor.

## Enlaces
- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/tin-2b-v3-GGUF
- Modelo base: https://huggingface.co/cagataydev/tin-2b-v3
- Pagina de descargas del autor: https://hf.tst.eu/model#tin-2b-v3-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
