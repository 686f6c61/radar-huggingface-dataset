# AkaumiKaede/Qwen3.5-2B-Uncensored-Abliterix-SOM

## Resumen

Qwen3.5-2B-Uncensored-Abliterix-SOM es un derivado del modelo Qwen/Qwen3.5-2B publicado por el usuario AkaumiKaede, en el que se han eliminado los mecanismos de rechazo mediante la tecnica de abliteration implementada en la herramienta Abliterix v1.12.2, en su variante denominada SOM (steering of models). El modelo conserva la naturaleza multimodal del original (pipeline image-text-to-text), es decir, acepta texto e imagen como entrada, y cuenta con 2.213.241.664 parametros (aproximadamente 2,2 mil millones).

El problema que aborda es el de los rechazos y la censura de contenido: el autor reporta 0 rechazos sobre 408 peticiones de prueba, frente a 394/408 del modelo original. La intervencion no consiste en un reentrenamiento, sino en la modificacion dirigida de pesos de las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) y de la capa mlp.down_proj, con vectores de direccion calculados por capa y optimizados mediante un optimizador TPE.

Es relevante ahora por dos motivos: por un lado, alimenta la linea de trabajo sobre modelos sin censura orientados a escritura creativa, roleplay y generacion de ficcion para adultos; por otro, sirve como material de estudio para investigacion en seguridad y alineacion, ya que cuantifica el coste de la abliteration en terminos de divergencia KL (0,2096) respecto al modelo base. El repositorio es muy reciente (creado el 14 de octubre de 2026) y tiene una validacion externa practicamente nula (0 descargas, 1 like).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-2B; no se detalla la arquitectura interna exacta en la informacion disponible |
| Parametros totales | 2.213.241.664 (unos 2,2 mil millones) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo solo publica pesos en safetensors (4,4 GB, compatible con fp16/bf16) |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y aplica una intervencion de abliteration, no un reentrenamiento. Segun la model card, el proceso consistio en ejecutar un barrido inicial de 120 lotes de configuracion, seleccionar las 3 mejores soluciones como parametros de ablacion de preinyeccion soportados por TOML, inyectarlas y dejar que un optimizador TPE refinase los parametros en sucesivas rondas de ablacion. La direccion de intervencion (vector_index) se calcula por capa. Los parametros publicados afectan a las proyecciones de atencion y a una capa MLP: por ejemplo, attn.k_proj.max_weight = 0,82 con posicion 16,38; attn.o_proj.max_weight = 0,80 con posicion 20,39; attn.q_proj.max_weight = 0,83 con posicion 17,46; attn.v_proj.max_weight = 1,18 con posicion 22,02; y mlp.down_proj.max_weight = 0,00, con lo que la intervencion sobre esa capa MLP queda practicamente anulada.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre fases de RLHF o DPO: el modelo no se ha reentrenado, solo se han modificado pesos. Tampoco se documenta la estrategia de entrenamiento multimodal original ni los detalles de vision del modelo base. La unica innovacion tecnica descrita explicitamente es el metodo SOM con preinyeccion de parametros y busqueda con optimizador TPE, que el autor presenta como superior a alternativas como SRA o RDO. No se mencionan tecnicas de decodificacion especulativa, atencion lineal ni variantes de atencion eficiente.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Entrada multimodal: acepta imagen y texto (pipeline image-text-to-text), lo que permite tareas de descripcion y comprension visual.
- Escritura creativa y roleplay, incluido contenido para adultos (R18), sin rechazos segun las pruebas del autor.
- Generacion de dialogo en formato chat y soporte de conversaciones de personaje (tags rp, rep, writing).
- Etiquetado como compatible con agentes (tag agent) y con endpoints (endpoints_compatible), aunque no se documenta explicitamente soporte de tool calling o function calling.
- Ausencia de filtros de rechazo: el autor reporta 0/408 rechazos, sin rechazos duros ni suaves en pruebas con peticiones extremas.
- Idiomas distintos del ingles y el chino: no disponible, y no declarados por el autor.

## Casos de uso

- Escritura de ficcion para adultos y roleplay: el modelo genera narrativa y dialogo sin rechazos ni advertencias morales, lo que lo hace util en plataformas de entretenimiento conversacional orientadas a publico adulto. El pipeline multimodal permite ademas incorporar imagenes de referencia en la conversacion.
- Investigacion en seguridad y alineacion: sirve como sujeto de estudio para medir cuanto contenido nocivo tolera un modelo abliterado, comparar metodos de intervencion (SOM frente a SRA o RDO) y analizar la relacion entre divergencia KL y perdida de rechazos.
- Red teaming de sistemas de moderacion: al producir contenido que otros modelos rechazan, resulta util para generar casos adversarios con los que probar clasificadores y filtros de contenido de terceros.
- Generacion de datos sinteticos de dialogo para entrenamiento: permite crear corpus conversacionales en dominios donde los modelos alineados se niegan a generar, por ejemplo guiones de ficcion con tematicas sensibles.
- Prototipado local de bajo coste: con unos 2,2 mil millones de parametros, se puede desplegar en GPU de consumo para iterar sobre prompts, plantillas de personaje o flujos conversacionales sin coste de API.
- Punto de partida para fine-tuning de dominio: al carecer de sesgo de rechazo, sirve como base para ajustar un asistente especializado en un nicho concreto (ficcion interactiva, guiones, narrativa serializada) sin tener que eliminar primero los filtros.
- Analisis y anotacion de imagenes en flujos editoriales: la capacidad image-text-to-text permite generar descripciones o metadatos de imagenes, incluidas aquellas que un modelo alineado podria rechazar por su contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta dos metricas propias:

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-2B) |
|---|---|---|
| Divergencia KL | 0,2096 | 0 (por definicion) |
| Rechazos | 0/408 | 394/408 |

La divergencia KL de 0,2096 indica una desviacion apreciable respecto a la distribucion del modelo base, aunque el autor no aporta una evaluacion de como afecta eso a tareas de razonamiento, codigo o conocimiento factual. Tampoco se publica la composicion exacta del conjunto de 408 peticiones: el autor indica que el prompt set es original, cubre R18, contenido antihumano, crimenes reales y material poco etico o ilegal, y que se distribuye cifrado, por lo que la medicion no es verificable de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 5-6 GB solo para pesos (2,2 mil millones de parametros a 2 bytes), mas cache KV y overhead, lo que situa el total practico en unos 6-8 GB con contexto moderado. Estimacion propia a partir del numero de parametros, no publicada por el autor.
- Cuantizacion a 8 bits: aproximadamente 2,5-3,5 GB de VRAM total estimada. A 4 bits: aproximadamente 1,5-2,5 GB. El repositorio no publica pesos cuantizados, por lo que habria que generarlos.
- GPU recomendadas: cabe holgadamente en GPU de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o RTX 4090 de 24 GB. Para despliegue en servidor, cualquier A100, H100, L40S o L4 es sobredimensionada para este tamano y permitiria un batching muy alto.
- Despliegue: la libreria declarada es transformers, y el tag endpoints_compatible sugiere compatibilidad con servicios de inferencia tipo vLLM, TGI o SGLang. No hay pesos GGUF en el repositorio, por lo que su uso directo en llama.cpp u Ollama requeriria una conversion previa. Tampoco se documentan pesos en MLX, AWQ o GPTQ.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo, latencia de primera token ni rendimiento con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Divergencia KL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-Abliterix-SOM | 2,21 B | no disponible | 0/408 | 0,2096 | apache-2.0 | safetensors en HuggingFace |
| Qwen/Qwen3.5-2B (base) | 2,2 B aprox. | no disponible | 394/408 | 0 (por definicion) | apache-2.0 | safetensors en HuggingFace |
| AkaumiKaede/Qwen3.5-2B-Abliterix-SOM | no disponible | no disponible | no disponible | no disponible | no disponible | referenciado como new_version |

No se dispone de datos verificables de otros modelos abliterados de tamano similar (por ejemplo variantes sin censura de la familia Qwen2.5 o Llama 3.2) en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Eliminacion deliberada de rechazos: el modelo genera contenido R18, antihumano, relativo a crimenes reales y a actividades ilegales o poco eticas sin oponer resistencia. Es un riesgo directo si se expone a usuarios finales sin moderacion externa.
- Implicaciones legales: aunque la licencia apache-2.0 permite uso comercial, la responsabilidad sobre el contenido generado recae integramente en quien despliega el modelo. La ausencia de filtros puede entrar en conflicto con normativas de servicios digitales y de proteccion de menores.
- Degradacion potencial de capacidades: la divergencia KL de 0,2096 respecto al modelo base indica un cambio apreciable en la distribucion de salida, pero no hay evaluacion publicada de razonamiento, codigo o conocimiento factual que permita cuantificar el dano.
- Alucinacion: no se ha publicado ninguna evaluacion de fidelidad factual ni de tendencia a inventar informacion, ni en el modelo base ni en este derivado.
- Idiomas: solo ingles y chino estan declarados. El castellano no figura entre los idiomas soportados oficialmente, por lo que el rendimiento en espanol es impredecible.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso que dependan de ventanas largas.
- Capacidades multimodales sin detalle: se declara pipeline image-text-to-text, pero no se especifica resolucion de imagen soportada, numero de tokens visuales ni tareas de vision evaluadas.
- Trazabilidad limitada: 0 descargas y 1 like en el momento de la consulta; no hay validacion independiente de la comunidad. El prompt set de evaluacion se distribuye cifrado y su contenido no es verificable.
- Procedencia de los pesos: al ser una modificacion de pesos sin reentrenamiento, la calidad depende por completo del modelo base Qwen3.5-2B, cuyas limitaciones hereda.
- Recomendacion operativa: si se va a usar en produccion, conviene anadir una capa de moderacion externa, registro de conversaciones y un filtro de temas prohibidos por politica de producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AkaumiKaede/Qwen3.5-2B-Uncensored-Abliterix-SOM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Herramienta Abliterix: https://github.com/wuwangzhang1216/abliterix
- README en chino: https://huggingface.co/AkaumiKaede/Qwen3.5-2B-abliterix-som/blob/main/README_ZH.md
- Nueva version referenciada por el autor: AkaumiKaede/Qwen3.5-2B-Abliterix-SOM (sin URL directa en la informacion disponible)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente sitios de contenido para adultos sin relacion tecnica con el modelo.
