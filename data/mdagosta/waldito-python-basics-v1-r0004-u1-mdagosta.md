# mdagosta/waldito-python-basics-v1-r0004-u1-mdagosta

## Resumen

Waldito-python-basics-v1-r0004-u1 es un modelo de generacion de texto publicado en HuggingFace por el usuario mdagosta, identificado como un export de la familia "OpenWALDO". Se trata de un modelo causal de arquitectura Llama estandar implementada con la libreria Transformers, con un total de 9.541.632 parametros (aproximadamente 9,5 millones), lo que lo situa en la categoria de modelos ultracompactos, muy lejos de los modelos de proposito general actuales.

Su rasgo diferenciador no es el tamano sino el tokenizador: emplea el tokenizador de bytes "schema-1" de OpenWALDO, que requiere cargarse con `trust_remote_code=True`. El repositorio incluye ademas un fichero `BOM.json` (inventario de todos los ficheros de la release) y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI), lo que sugiere un esfuerzo deliberado de trazabilidad documental poco habitual en modelos de este tamano.

El nombre del repositorio ("python-basics-v1", "r0004-u1") apunta a un ajuste orientado a conceptos basicos de Python, probablemente como unidad numero 1 de una release 0004 de una serie de modelos. No hay publicados benchmarks, licencia, idiomas soportados ni detalles del dataset de entrenamiento, por lo que cualquier evaluacion de capacidades queda pendiente de verificacion empirica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (familia LlamaForCausalLM de Transformers) |
| Parametros totales | 9.541.632 (aprox. 9,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no especifica licencia) |
| Formato de pesos | Safetensors |
| Tokenizador | Byte tokenizer "schema-1" de OpenWALDO, requiere `trust_remote_code=True` |
| Libreria | transformers |
| Tamano del repositorio | 0,0 GB segun HuggingFace |

## Arquitectura y entrenamiento

La model card indica que el paquete usa "the standard Transformers Llama causal-language-model architecture", es decir, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE) en su configuracion habitual. Con 9,54 millones de parametros, la configuracion tipica de esta escala implicaria un numero reducido de capas y una dimension oculta pequena, aunque el `config.json` no se ha facilitado en la informacion disponible y por tanto no se puede confirmar el numero exacto de capas, cabezas de atencion ni dimension del modelo.

El elemento tecnico mas relevante es el tokenizador de bytes por esquema, que evita el vocabulario subword clasico (BPE o SentencePiece) y trabaja directamente sobre bytes. Esto tiene dos implicaciones practicas: por un lado, la cobertura de caracteres es total y no existen tokens desconocidos; por otro, las secuencias resultan mas largas en tokens para el mismo texto, lo que penaliza la eficiencia efectiva del contexto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Los ficheros `BOM.json` y `EU-BOM.json` del repositorio contendrian, segun el autor, el inventario de artefactos y la divulgacion de contenido de entrenamiento exigida por la normativa europea, por lo que son la fuente a consultar para ampliar esta seccion.

## Capacidades

- Generacion de texto causal basica: al ser un modelo de 9,5 M de parametros, su capacidad de generar texto coherente y factual es muy limitada; cabe esperar fluidez local en fragmentos cortos y degradacion rapida en generaciones largas.
- Presunta especializacion en fundamentos de Python: el nombre del repositorio ("python-basics") sugiere un ajuste sobre sintaxis y conceptos basicos del lenguaje, pero no hay evaluacion publicada que lo confirme.
- Cobertura byte-level: el tokenizador schema-1 permite procesar cualquier byte de entrada sin tokens desconocidos, lo que incluye texto en cualquier idioma y datos binarios textualizados.
- Conversacion: la etiqueta `conversational` aparece en los tags del repositorio, aunque no se documenta ninguna plantilla de chat ni formato de prompt.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Docencia de tokenizacion a nivel de byte: el modelo permite demostrar en el aula como un tokenizador que opera sobre bytes sin vocabulario subword afecta a la longitud de las secuencias y al coste de inferencia, con un coste computacional practicamente nulo.
- Pruebas de humo en pipelines de inferencia: con unos 19 MB en bfloat16, sirve para validar integraciones de Transformers, plantillas de chat o sistemas de despliegue antes de escalar a modelos de produccion, sin consumir GPU.
- Investigacion sobre trazabilidad y cumplimiento del reglamento europeo de IA: la inclusion de `BOM.json` y `EU-BOM.json` lo convierte en un caso de estudio util para analizar como se documenta la divulgacion de contenido de entrenamiento en modelos abiertos.
- Experimentos de destilacion y curriculum learning: por su tamano, es un punto de partida viable para probar tecnicas de entrenamiento progresivo o destilacion desde modelos mayores sin requerir infraestructura de GPU.
- Despliegue en dispositivos embebidos y microcontroladores: con menos de 40 MB de pesos, puede ejecutarse en CPU, Raspberry Pi o hardware de borde con memoria muy restringida, siempre que se resuelva la dependencia del tokenizador con `trust_remote_code=True`.
- Generacion de plantillas y snippets minimos de Python: uso plausible como autocompletado de estereotipos muy repetidos (bucles, condicionales, definiciones de funcion), asumiendo que no hay validacion publicada de su calidad en esta tarea.
- Reproducibilidad de releases: la nomenclatura "r0004-u1" sugiere una serie versionada por unidades; el modelo puede emplearse como referencia de una release concreta en estudios de comparacion entre versiones de una misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y cuenta con 0 descargas y 0 "likes" en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 MB en bfloat16 o float16 y unos 38 MB en float32, calculados a partir de los 9.541.632 parametros. El tokenizador byte-level y las activaciones anaden un consumo marginal.
- GPU recomendadas: no requiere GPU. Cualquier acelerador (A100, H100, RTX 4090, GTX 1650 o integradas) puede ejecutarlo; el cuello de botella sera el lanzamiento de kernels, no la memoria ni el computo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con practicamente cualquier cantidad de VRAM, e incluso en CPU, Raspberry Pi o dispositivos de borde.
- Opciones de despliegue: Transformers es la via documentada por el autor. Los tags del repositorio mencionan `text-generation-inference` y `endpoints_compatible`, pero el requisito de `trust_remote_code=True` para el tokenizador byte-level puede complicar el soporte en vLLM, TGI, llama.cpp u Ollama, ya que estas herramientas suelen requerir tokenizadores con implementaciones nativas o convertibles.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de comparacion en la informacion proporcionada. La tabla siguiente usa unicamente caracteristicas publicas ampliamente conocidas de modelos pequenos de la misma categoria, no verificadas en la busqueda realizada, y se incluye a efectos orientativos de escala y licencia:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| waldito-python-basics-v1-r0004-u1-mdagosta | 9,5 M | No disponible | No disponible | Safetensors |
| SmolLM-135M | 135 M | 2.048 tokens | Apache-2.0 | Safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | Safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | Safetensors, GGUF |

La diferencia principal de waldito frente a estas alternativas es el tokenizador byte-level y la documentacion de cumplimiento normativo; en contra, carece de licencia declarada, de contexto documentado y de cualquier evaluacion publicada.

## Limitaciones y advertencias

- Capacidad muy limitada: con 9,54 M de parametros, el modelo no es adecuado para tareas de razonamiento, conocimiento factual, matematicas ni generacion de codigo complejo. Cualquier expectativa de calidad cercana a modelos de miles de millones de parametros es irreal.
- Riesgo de alucinacion alto: a esta escala, el modelo tiende a producir texto plausible pero incorrecto, sin conocimiento verificable subyacente.
- Ausencia de licencia: no se especifica licencia en la model card ni en los metadatos, lo que impide asumir permisos de uso comercial, modificacion o redistribucion. Es un bloqueante para cualquier uso en produccion hasta que el autor lo aclare.
- Idiomas no declarados: no se documenta que idiomas soporta; el tokenizador byte-level puede procesar cualquier entrada, pero eso no implica competencia linguistica real.
- Contexto desconocido: se desconoce la longitud de contexto soportada, un dato critico para planificar su integracion.
- Dependencia de codigo remoto: cargar el tokenizador exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio. Conviene auditar los ficheros antes de usarlo en entornos no controlados.
- Compatibilidad de despliegue incierta: los tags anuncian compatibilidad con text-generation-inference y endpoints, pero el tokenizador personalizado puede impedir el funcionamiento en vLLM, llama.cpp, Ollama u otros runners que no ejecuten codigo remoto.
- Sin datos de entrenamiento publicos en la ficha: la composicion del dataset, el numero de tokens y el proceso de alineacion no se detallan; la divulgacion se delega al fichero `EU-BOM.json` del repositorio.
- Repositorio sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni evaluaciones de terceros que respalden su comportamiento.
- Sesgos: no disponibles; no se ha publicado ninguna evaluacion de sesgo ni de toxicidad.
- Fecha de publicacion: los metadatos de HuggingFace indican creacion el 2026-09-30, dato que conviene contrastar con la cronologia real del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0004-u1-mdagosta
- Version anterior de la misma serie (r0003): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u1-mdagosta
- Perfil del autor en HuggingFace: https://huggingface.co/mdagosta
- Perfil del autor en GitHub: https://github.com/mdagosta
- Ficheros de trazabilidad citados en la model card: `BOM.json` y `EU-BOM.json` (dentro del propio repositorio de HuggingFace)
