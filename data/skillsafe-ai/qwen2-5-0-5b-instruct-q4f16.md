# skillsafe-ai/qwen2.5-0.5b-instruct-q4f16

## Resumen

`skillsafe-ai/qwen2.5-0.5b-instruct-q4f16` es una conversion reproducible de los pesos de `Qwen/Qwen2.5-0.5B-Instruct` a formato MLC para su ejecucion en navegador mediante WebLLM y el backend WebGPU. El repositorio no contiene un modelo nuevo ni un reentrenamiento: publica artefactos ya compilados (8 shards de parametros, tokenizer, caches de tensores y una libreria WebGPU en formato `.wasm`) generados a partir de una fuente upstream fijada, `mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC` (commit `32ff081fe7e4dfe4ffb167b94c66fdf11e02b8ad`), con una receta declarada y verificada por hash.

El interes practico esta en el empaquetado, no en el modelo en si. Al tratarse de una cuantizacion q4f16_1 con 494.032.768 parametros y un peso efectivo de 4,50 bits por parametro, el conjunto completo ocupa unos 0,3 GB y puede descargarse y ejecutarse dentro del navegador del usuario sin servidor de inferencia, lo que abre la puerta a asistentes, clasificadores o funciones de autocompletado totalmente locales y con coste marginal cero por token.

SkillSafe publica estos artefactos como parte de su infraestructura propia, con numeros de verificacion por archivo (SHA-256) y coincidencia comprobada entre los tamanos de los shards, `ndarray-cache.json` y la tabla de parametros embebida en la libreria WebGPU (267 tensores). Es, por tanto, un artefacto pensado para quien quiera integrar un modelo conversacional pequeno en una aplicacion web con WebLLM, asumiendo las limitaciones de un modelo de 0,5 B parametros y de una ventana de contexto efectiva de 4.096 tokens en el binario incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen2, ejecutado mediante MLC-LLM sobre WebGPU. Numero de capas, dimension oculta y configuracion de atencion no disponibles en la informacion proporcionada |
| Parametros totales | 494.032.768 (aproximadamente 0,49 B), verificado por el autor a partir de los shards, con 4,50 bits por parametro efectivos |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4.096 tokens con prefill chunk de 1.024 en la libreria WebGPU incluida (`ctx4k_cs1k`). El `mlc-chat-config.json` del bundle declara 32.768 / 2.048, por lo que es necesario aplicar overrides en la configuracion de WebLLM |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits por grupo, computo y activaciones en fp16). Es la unica variante publicada en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefactos MLC/WebLLM: `params_shard_0..7.bin`, `ndarray-cache.json`, `tensor-cache.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt` y libreria `Qwen2-0.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm` |
| Tamano del repositorio | 0,3 GB |
| Backend de inferencia | WebGPU (navegador), via `@mlc-ai/web-llm` |
| Modelo base | `Qwen/Qwen2.5-0.5B-Instruct` (Alibaba Cloud) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-0.5B-Instruct de Alibaba Cloud, un transformer decoder-only denso con atencion causal. El modelo base incluye, segun se deduce de la configuracion MLC publicada, soporte de contexto de hasta 32.768 tokens, aunque la informacion disponible no detalla el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni si emplea query/key-value grouping. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del corpus, fases de SFT, DPO o RLHF) no estan disponibles en la informacion proporcionada.

Lo relevante tecnicamente de este repositorio es la cadena de conversion. Los pesos se cuantizan a q4f16_1 (4 bits por grupo con computo en fp16), se dividen en 8 shards de parametros y se acompanan de una libreria WebGPU compilada especificamente para contexto 4.096 y prefill chunk 1.024. La herramienta declarada para la conversion es Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64, con una receta YAML identificada por su SHA-256. El autor afirma que la tabla de parametros embebida en la libreria WebGPU coincide con los 267 tensores de los shards, y que los tamanos y MD5 de cada shard concuerdan con `ndarray-cache.json`, lo que constituye una verificacion de integridad poco habitual en conversiones de este tipo.

No hay ninguna innovacion arquitectonica propia: no se aplican decodificacion especulativa, atencion lineal ni tecnicas hibridas. La unica decision de diseno reseñable es la separacion de los archivos en tres clases (`registry`, `bundle` y `registry-shared`), de modo que la libreria WebGPU puede reutilizarse entre todos los modelos de la misma arquitectura y los ficheros de tokenizer viajan dentro de la aplicacion mientras los pesos se sirven desde `models.skillsafe.ai`.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del ajuste del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento basico y respuestas de un solo turno o multi-turno corto, con calidad limitada por el tamano del modelo.
- Generacion de codigo sencillo y explicaciones tecnicas breves; no es fiable en tareas de programacion complejas.
- Ejecucion completamente local en el navegador: los pesos se descargan una vez y la inferencia ocurre en el dispositivo del usuario, sin enviar datos a un servidor.
- Funcionamiento sin conexion tras la primera carga de los artefactos (sujeto al cache del navegador y a la politica de cache HTTP aplicada).
- Capacidades multilingues: no disponibles en la informacion proporcionada para esta conversion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; un modelo de 0,5 B no es adecuado para planificacion de multiples pasos sin un orquestador externo.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Asistentes embebidos en aplicaciones web: el modelo se descarga una sola vez y responde dentro del navegador, de modo que la aplicacion puede ofrecer un chat de ayuda sobre la propia interfaz sin coste de servidor ni envio de datos del usuario a terceros.
- Clasificacion y enrutado de intenciones en el cliente: con prompts cortos y salidas restringidas, el modelo puede etiquetar consultas de usuario (soporte, ventas, incidencia tecnica) antes de decidir si la peticion se resuelve localmente o se escala a un modelo mayor en servidor.
- Formularios y asistentes de escritura: reescritura, resumen y correccion de textos cortos en campos de entrada, aprovechando que la cuantizacion q4f16_1 ocupa unos 0,3 GB y cabe en el cache del navegador.
- Generacion de borradores de codigo y autocompletado ligero en entornos de documentacion o playgrounds online, donde la latencia de red es el cuello de botella y una respuesta local de baja calidad es preferible a una espera.
- Sistemas educativos y demos offline: aplicaciones que deben funcionar sin conectividad o en redes restringidas, instaladas en el navegador y sin dependencia de APIs externas.
- Procesamiento de texto sensible a la privacidad: analisis de notas, mensajes o documentos que el usuario no quiere enviar a un servicio remoto, ya que toda la inferencia se ejecuta en su dispositivo.
- Filtrado previo (pre-screening) en pipelines de datos: uso del modelo como etapa barata para descartar, resumir o etiquetar grandes volumenes de texto antes de pasarlos a un modelo de mayor tamano.
- Prototipado rapido de interfaces conversacionales: validar la experiencia de usuario de un chat con WebLLM antes de invertir en infraestructura de inferencia en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a documentar procedencia, ficheros, verificacion de integridad e instrucciones de uso con WebLLM; no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado datos de este tipo en los resultados de busqueda web, que no contienen informacion relevante sobre el modelo.

## Requisitos de hardware

- Almacenamiento y transferencia: aproximadamente 0,3 GB de artefactos (0,28 GB en shards de parametros cuantizados, mas tokenizer, caches y libreria WebGPU de 4,78 MB).
- VRAM / memoria de GPU estimada: del orden de 0,3 GB para los pesos; anadiendo la cache KV para 4.096 tokens, el consumo se situa en el rango de los 0,3 a 0,4 GB (estimacion, no confirmada por el autor).
- GPU recomendadas: no se especifican. Al ejecutarse sobre WebGPU, funciona con cualquier GPU compatible con el backend, incluidas graficas integradas modernas; no requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si. El modelo esta disenado precisamente para ejecutarse en hardware de usuario final, incluidos portatiles con GPU integrada que expongan WebGPU.
- Requisito de software: navegador con soporte de WebGPU y la libreria `@mlc-ai/web-llm`. El binario `.wasm` esta compilado para contexto 4.096 y prefill chunk 1.024.
- Opciones de despliegue: WebLLM en navegador es la via soportada explicitamente. Otros runtimes (llama.cpp, Ollama, vLLM, TGI) no son aplicables a estos artefactos MLC tal cual, ya que el formato de pesos es especifico del stack MLC.
- Latencia y throughput: no disponibles. Dependen por completo del hardware del cliente y del backend WebGPU del navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `skillsafe-ai/qwen2.5-0.5b-instruct-q4f16` | 494.032.768 | 4.096 tokens en el binario incluido (32.768 declarados en la config) | q4f16_1 | MLC / WebLLM (`.bin` + `.wasm`) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC` | 494.032.768 | Configuracion MLC estandar | q4f16_1 | MLC / WebLLM | Apache-2.0 | Fuente upstream exacta de la que deriva este repositorio |
| `Qwen/Qwen2.5-0.5B-Instruct` | Aproximadamente 0,49 B | 32.768 tokens | fp16 / bf16 sin cuantizar | safetensors | Apache-2.0 | Repositorio oficial de Alibaba Cloud |
| Alternativas de otro tamano o familia (Qwen2.5-1.5B-Instruct, Llama-3.2-1B-Instruct, TinyLlama-1.1B) | No disponible | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos comparativos en la informacion proporcionada |

La comparacion significativa es con el checkpoint original en safetensors: este repositorio ofrece la misma capacidad funcional en un formato pensado para navegador, con menor precision numerica y un empaquetado verificado por hash, a cambio de atarse al ecosistema MLC/WebLLM. Frente a otros modelos de tamano similar, no hay datos de rendimiento en la informacion disponible que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Con 494 millones de parametros, la tasa de error en razonamiento multi-paso, matematicas, codigo y conocimiento factual es alta. No es un sustituto de un modelo de 7 B o superior en tareas que exijan precision.
- Riesgo elevado de alucinacion: al ser un modelo pequeno, tiende a generar afirmaciones plausibles pero incorrectas, especialmente en dominios especializados. Requiere verificacion externa o restriccion de salidas.
- Ventana de contexto limitada a 4.096 tokens en el binario WebGPU incluido, muy por debajo de los 32.768 que declara `mlc-chat-config.json`. Si se ignoran los overrides indicados en la model card, la ejecucion puede fallar o comportarse de forma inesperada.
- Idiomas soportados no documentados en esta conversion. No se debe asumir cobertura multilingue sin verificar el comportamiento real.
- Dependencia de WebGPU: el modelo solo funciona en navegadores que expongan esta API. Los usuarios con navegadores antiguos o GPUs sin soporte quedan excluidos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes ni incidencias reportadas. La verificacion de integridad la realiza el propio autor.
- Licencia Apache-2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright de Alibaba Cloud y la atribucion correspondiente. La receta de conversion y la model card pertenecen al repositorio de SkillSafe y se rigen por su propia licencia, mientras que los pesos mantienen la licencia upstream.
- Trazabilidad: los pesos publicados no se han editado a mano y derivan de un commit concreto del repositorio de MLC; cualquier discrepancia futura deberia resolverse contra ese commit y contra los hashes SHA-256 listados.
- Para produccion, conviene fijar la version de `@mlc-ai/web-llm` y de los artefactos, ya que una actualizacion del runtime puede cambiar la compatibilidad con la libreria `.wasm` compilada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/qwen2.5-0.5b-instruct-q4f16
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/7ae557604adf67be50417f59c2c2f167def9a775/LICENSE
- Fuente upstream MLC (commit fijado): https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC/tree/32ff081fe7e4dfe4ffb167b94c66fdf11e02b8ad
- Repositorio con la receta de conversion y el conversor: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Libreria WebLLM referenciada en el ejemplo de uso: `@mlc-ai/web-llm` (paquete npm)
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en los resultados de busqueda web proporcionados.
