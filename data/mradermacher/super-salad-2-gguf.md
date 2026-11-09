# mradermacher/super-salad-2-GGUF

## Resumen

super-salad-2-GGUF es la version cuantizada en formato GGUF del modelo appvoid/super-salad-2, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo original es un merge generado con mergekit, orientado a uso conversacional en ingles, con aproximadamente 513,6 millones de parametros totales segun los datos de safetensors. Esta version GGUF facilita su ejecucion en CPU y GPU de gama baja mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha es practica: se trata de un modelo pequeno (sub-1000M) que cabe holgadamente en hardware de consumo, con cuantizaciones desde Q2_K (0,3 GB) hasta f16 (1,1 GB). Sin embargo, la informacion publicada es muy limitada: no se detalla la composicion del merge, no hay benchmarks, no se especifica la licencia y la model card del cuantizador es generica. Esto condiciona cualquier evaluacion rigurosa y obliga a marcar numerosos campos como "no disponible".

El repositorio tiene 148 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion muy baja. El modelo esta etiquetado como conversacional y solo en ingles. Para produccion seria necesario validar empiricamente calidad, sesgos y comportamiento, dado que no existe documentacion tecnica del autor original en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge con mergekit; detalles no disponibles) |
| Parametros totales | 513.590.784 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (original en safetensors via transformers) |

## Arquitectura y entrenamiento

El modelo es un merge construido con mergekit a partir de componentes no especificados en la informacion disponible. No se detalla la composicion del merge (que modelos se combinaron, con que pesos o metodo: SLERP, TIES, DARE, etc.), ni el numero de tokens de entrenamiento, ni si hubo fases de RLHF, DPO o SFT. Tampoco se documenta la longitud de contexto nativa ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El unico dato estructural fiable es el recuento de parametros (513.590.784) y el hecho de que el modelo base se distribuye en formato transformers/safetensors, mientras que esta version es una conversion estatica a GGUF realizada por mradermacher. El autor del cuantizado indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, solo estaticas. No se dispone de informacion sobre la composicion del dataset ni sobre el proceso de alineacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Razonamiento basico y respuesta a instrucciones: no documentado explicitamente, pero esperable en un modelo de este tipo; requiere validacion empirica.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion.

## Casos de uso

- Prototipado rapido en local: al ocupar entre 0,3 GB y 1,1 GB segun cuantizacion, permite experimentar con un modelo conversacional en portatiles y equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Chatbot de bajo consumo en ingles: adecuado para demos y entornos de prueba donde el coste computacional y la huella de memoria son la prioridad, no la calidad maxima.
- Educacion y aprendizaje: util para estudiar el flujo de trabajo de mergekit y de cuantizacion GGUF, ya que el modelo es pequeno y facil de inspeccionar.
- Pruebas de integracion en pipelines de inferencia: sirve como modelo de sustitucion (mock) para validar infraestructura de despliegue (servidores compatibles con endpoints, llama.cpp server) antes de pasar a modelos mayores.
- Experimentacion con tecnicas de cuantizacion: la disponibilidad de 12 variantes (Q2_K a f16) permite comparar calidad frente a tamano en un mismo modelo.
- Generacion de texto auxiliar offline: tareas de reescritura, resumen corto o completado en ingles dentro de aplicaciones de escritorio sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,6 GB para cuantizaciones Q2-Q8 y 1,1 GB para f16, segun los tamanos de archivo publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones mayores; las versiones Q4_K_S y Q4_K_M (0,4 GB) caben en practicamente cualquier GPU de consumo moderna.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio esta etiquetado como endpoints_compatible. Para el modelo original en safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la informacion. Dado el tamano reducido, se espera una latencia baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| super-salad-2-GGUF (este) | 513,6 M | no disponible | no disponible | GGUF | Merge con mergekit, solo ingles, sin benchmarks |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial con benchmarks y soporte multilingue |
| SmolLM2-360M-Instruct | 0,36 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Modelo pequeno documentado, orientado a dispositivos |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Modelo conversacional pequeno ampliamente utilizado |

La comparativa se ofrece como referencia de categoria (modelos sub-1B conversacionales); los datos de los modelos alternativos provienen de conocimiento general y no de la informacion proporcionada en esta busqueda. super-salad-2 carece de la documentacion, benchmarks y licencia clara que si acompanan a las alternativas citadas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es un bloqueo potencial para produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento o codigo.
- Solo ingles: no apto para aplicaciones en castellano u otros idiomas sin validacion previa.
- Origen opaco del merge: al no documentarse los modelos combinados ni el metodo, no se pueden evaluar sesgos heredados ni riesgos de contaminacion de datos.
- Riesgo de alucinacion: esperable en un modelo de 513 M de parametros sin documentacion de alineacion; no recomendado para tareas factuales sin verificacion.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas sin conocer la ventana nativa.
- Adopcion muy baja (148 descargas, 0 likes): sin validacion por parte de la comunidad.
- Cuantizaciones solo estaticas: no hay versiones imatrix/ponderadas, que suelen ofrecer mejor calidad por bit.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/super-salad-2-GGUF
- Modelo base: https://huggingface.co/appvoid/super-salad-2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#super-salad-2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
