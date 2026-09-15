# OpenExplorer/gemma-4-26B-A4B-it

## Resumen

gemma-4-26B-A4B-it es un modelo multimodal de mezcla de expertos (MoE) afinado para instrucciones, desarrollado por Google DeepMind y redistribuido en Hugging Face por el usuario OpenExplorer. Acepta entradas de texto e imagen y genera texto, y esta orientado a generacion de texto, razonamiento, programacion y comprension visual. El repositorio analizado es una copia del original google/gemma-4-26B-A4B-it, sin descargas ni valoraciones registradas en el momento de la consulta.

El modelo declara unos 25,2 mil millones de parametros totales, de los que solo se activan aproximadamente 3,8 mil millones por token gracias al enrutado MoE. El componente de lenguaje concentra unos 24,65B de parametros y el codificador de vision (ViT) unos 550M. Esa relacion entre parametros totales y activos es el dato clave: ofrece la capacidad nominal de un modelo de ~25B con un coste de computo cercano al de uno de ~4B.

La model card no especifica longitud de contexto, idiomas soportados ni formatos de pesos, y los unicos datos de rendimiento publicados corresponden a una plataforma BPU S6P con cuantizacion W4A8: 32,83 tokens/s de decodificacion y 1.062 ms de TTFT con prompts de 2K tokens. No hay benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y encoder de vision (ViT) integrado; multimodal (texto + imagen) |
| Parametros totales | ~25,2B (lenguaje ~24,65B + vision ~550M) |
| Parametros activos | ~3,8B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (unica configuracion documentada, usada en las pruebas de despliegue); no se detallan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | no disponible |
| Licencia | other (la model card no reproduce el texto de la licencia; el repositorio original pertenece a Google DeepMind) |
| Formato de pesos | no disponible |

Metadatos del repositorio: autor OpenExplorer, etiquetas `heal`, `horizon`, `license:other`, `region:us`; 0 descargas y 0 likes; creado y actualizado el 15 de septiembre de 2026.

## Arquitectura y entrenamiento

La informacion disponible describe un modelo MoE multimodal: un transformer con mezcla de expertos para la parte de lenguaje (~24,65B de parametros totales, ~3,8B activos) mas un encoder de vision tipo ViT de ~550M de parametros que proyecta imagenes a tokens suaves (266 tokens suaves por imagen segun las pruebas de VLM). El modelo esta afinado para instrucciones. No se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO.

Tampoco se especifican innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, numero de expertos, funcion de enrutado o estrategia de balanceo de carga). La model card se limita a la descripcion funcional y a las metricas de despliegue en hardware BPU S6P con cuantizacion W4A8.

## Capacidades

- Generacion de texto en modo instruccion (instruction-tuned).
- Razonamiento y resolucion de problemas segun la descripcion del autor del modelo.
- Generacion de codigo.
- Comprension visual: entrada de imagenes individuales y lotes grandes (hasta 32 imagenes en las pruebas publicadas).
- Escenarios de video o secuencias de imagenes: se documenta una prueba con 60 imagenes tratadas como video, con 64 tokens suaves.
- Salida exclusivamente de texto (no se documenta generacion de imagen, audio ni voz).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; el campo de idiomas aparece vacio en el repositorio.
- Modo de pensamiento explicito (thinking mode) u otras capacidades especiales: no documentado.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede recibir capturas de pantalla, fotografias de producto o facturas junto al texto de la consulta y responder en texto, lo que permite resolver incidencias que hoy requieren derivar a un agente humano.
- Analisis de documentos escaneados: extraccion y razonamiento sobre formularios, contratos o informes en imagen, aprovechando el encoder ViT y la capacidad de razonamiento del componente de lenguaje.
- Procesamiento por lotes de imagenes: la model card documenta pruebas con 4, 8, 16 y 32 imagenes en un mismo contexto (TTFT de 1.670 ms a 9.868 ms), adecuado para tareas de revision masiva de catalogos o inventarios visuales.
- Analisis de video o secuencias de imagenes: con 60 imagenes procesadas a 64 tokens suaves cada una, es viable para resumen de secuencias, deteccion de eventos o descripcion de clips cortos.
- Asistente de programacion con contexto visual: generar o revisar codigo a partir de diagramas, capturas de errores o mockups, combinando la entrada de imagen con la generacion de codigo.
- Asistencia a soporte tecnico de segundo nivel: interpretar registros de error en imagen y trazas de texto para proponer diagnosticos.
- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para sugerencias y revisiones; conviene validar previamente la disponibilidad de tool calling, ya que no esta documentada.
- Despliegue en entornos con computo limitado: al activar solo ~3,8B de parametros, es candidato para inferencia en servidores modestos o aceleradores especializados (BPU S6P documentada) manteniendo ~32 tokens/s de decodificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible. Los unicos datos numericos facilitados son metricas de despliegue medidas en una plataforma BPU S6P con cuantizacion W4A8.

Rendimiento del modelo de lenguaje (W4A8, plataforma S6P):

| Prompt de entrada | KV cache | TTFT | Throughput de decodificacion | Memoria BPU | Memoria CPU |
|---:|---:|---:|---:|---:|---:|
| 2K tokens | 0 | 1.062 ms | 32,83 tokens/s | 24,3 GB | 3,2 GB |
| 5K tokens | 10K | 3.261 ms | 31,24 tokens/s | 24,3 GB | 3,2 GB |
| 10K tokens | 40K | 7.331 ms | 28,50 tokens/s | 24,3 GB | 3,2 GB |

Rendimiento multimodal (VLM, W4A8, plataforma S6P):

| Entrada | Tokens suaves | KV cache | Latencia ViT | TTFT | Throughput de decodificacion | Memoria BPU | Memoria CPU |
|---|---:|---:|---:|---:|---:|---:|---:|
| 4 imagenes | 266 | 1K | 577 ms | 1.670 ms | 32,9 tokens/s | 25,9 GB | 3,2 GB |
| 8 imagenes | 266 | 1K | 1.156 ms | 3.183 ms | 32,8 tokens/s | 25,9 GB | 3,2 GB |
| 16 imagenes | 266 | 1K | 2.309 ms | 5.330 ms | 32,6 tokens/s | 25,9 GB | 3,2 GB |
| 32 imagenes | 266 | 1K | 4.623 ms | 9.868 ms | 32,0 tokens/s | 25,9 GB | 3,2 GB |
| 60 imagenes (video) | 64 | 1K | 1.467 ms | 4.618 ms | 32,3 tokens/s | 24,1 GB | 3,2 GB |

El TTFT en escenarios VLM incluye preprocesado y latencia del ViT. Los valores de memoria corresponden al pico medido durante cada prueba.

## Requisitos de hardware

- VRAM/ memoria para pesos (estimacion aritmetica a partir de los 25,2B de parametros, no confirmada por el fabricante): ~50 GB en bf16/fp16, ~25 GB en int8 y ~13-14 GB en 4 bits.
- Dato medido real: en la plataforma BPU S6P con cuantizacion W4A8 el modelo ocupa 24,3 GB de memoria BPU (25,9 GB en escenarios multimodales) mas 3,2 GB de memoria de CPU. Esa cifra corresponde a un acelerador propietario, no a GPU de consumo.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB o H200. En A100 40 GB solo cabria con cuantizacion agresiva.
- GPU de consumo: con cuantizacion de 4 bits los pesos quedan teoricamente en el rango de 13-16 GB, por lo que seria viable en RTX 4090, RTX 3090 o RTX 4080 (24 GB y 16 GB), siempre que existan pesos GGUF/AWQ/GPTQ publicados, algo que este repositorio no documenta.
- Opciones de despliegue: la model card solo documenta la plataforma BPU S6P con W4A8. No se confirma compatibilidad con vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM para este repositorio concreto.
- Latencia y throughput documentados (S6P, W4A8): 1.062 ms de TTFT y 32,83 tokens/s con 2K tokens de prompt; 7.331 ms de TTFT y 28,50 tokens/s con 10K tokens de prompt. La degradacion de TTFT con la longitud de entrada es aproximadamente lineal.
- Coste multimodal: cada imagen anade 266 tokens suaves al contexto y la latencia del ViT escala de forma casi lineal (577 ms con 4 imagenes, 4.623 ms con 32 imagenes).

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenExplorer/gemma-4-26B-A4B-it | ~25,2B / ~3,8B | no disponible | other | Replica comunitaria, 0 descargas |
| google/gemma-4-26B-A4B-it (original) | ~25,2B / ~3,8B | no disponible | other | Repositorio oficial de Google DeepMind |
| Qwen3-30B-A3B (referencia de la misma categoria MoE) | ~30,5B / ~3,3B | 128K (segun informacion publica) | Apache 2.0 (segun informacion publica) | Repositorio oficial y amplio ecosistema de cuantizaciones |
| gemma-3-27b-it (referencia densa de tamano similar) | 27B densos | 128K (segun informacion publica) | Licencia Gemma (segun informacion publica) | Repositorio oficial |

Las dos ultimas filas proceden de conocimiento publico general sobre esos modelos y no de la documentacion facilitada para esta ficha; conviene verificarlas antes de citarlas. La ventaja estructural de gemma-4-26B-A4B-it frente a un denso de ~27B es el coste de inferencia (3,8B activos frente a 27B activos), y su desventaja actual es la ausencia de datos publicados de contexto, idiomas y benchmarks.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible verificar calidad en razonamiento, codigo o vision frente a alternativas.
- Longitud de contexto desconocida: sin ese dato no se puede dimensionar el uso en conversaciones largas o analisis de documentos extensos, mas alla de los 10K tokens de prompt probados en las metricas de despliegue.
- Idiomas no declarados: no hay confirmacion de soporte de castellano ni de otros idiomas; el campo de idiomas aparece vacio en el repositorio.
- Soporte de tool calling y de agentes no documentado: cualquier integracion agentica requiere validacion previa.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos, agravado en este caso por la falta de evaluaciones publicadas.
- Sesgos: no se documenta ninguna evaluacion de sesgo, seguridad o toxicidad.
- Licencia "other": no se reproduce el texto de la licencia en la model card. Al tratarse de la familia Gemma, es previsible que existan terminos de uso especificos y posibles restricciones para uso comercial; hay que consultar el repositorio original antes de desplegar en produccion.
- Repositorio de terceros: OpenExplorer no es el desarrollador del modelo, tiene 0 descargas y 0 likes, y no se detalla que se haya modificado respecto al original. Para produccion es recomendable partir de google/gemma-4-26B-A4B-it.
- Metricas de rendimiento no extrapolables: los 32 tokens/s y los 24,3 GB de memoria estan medidos en una BPU S6P con W4A8, un hardware especifico. El rendimiento en GPU puede diferir de forma notable.
- Formatos de pesos no publicados: no se confirma la existencia de GGUF, AWQ o GPTQ, lo que limita el despliegue inmediato en herramientas habituales.
- La model card incluye etiquetas (`heal`, `horizon`) sin explicacion sobre su significado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OpenExplorer/gemma-4-26B-A4B-it
- Repositorio original del modelo: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper, blog tecnico, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
