# sarath-om/sarath_om-1.1

## Resumen

Sarath OM 1.1 es un modelo de generacion de texto y de imagen a texto publicado por sarath-om, el repositorio oficial de la familia de modelos Sarath OM asociada a Sarath AI. Segun los metadatos del repositorio, el modelo se construye sobre la arquitectura Qwen2 y cuenta con 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones), con pesos en formato safetensors y un tamano de repositorio de 5,2 GB. La model card lo presenta como un modelo multimodal que acepta texto e imagenes y que anuncia capacidades de vision, tool calling y modo de razonamiento (thinking).

El modelo resulta relevante por su ventana de contexto declarada de 256K tokens, un valor muy alto para su rango de parametros, y por su publicacion simultanea en Hugging Face y Ollama, lo que facilita su despliegue local. La licencia declarada en los metadatos es MIT, lo que en principio permite uso comercial, aunque la propia model card advierte de que deben verificarse los terminos de los modelos y datos upstream antes de redistribuir o explotar comercialmente el modelo.

La informacion publicada es incompleta en varios aspectos clave: no se documentan los datos de entrenamiento, el metodo de alineacion, los idiomas soportados ni resultados de benchmarks verificados. La model card es explicitamente conservadora y pide verificar la configuracion del repositorio antes de asumir arquitectura, contexto o formatos. Esta ficha recoge unicamente los datos disponibles y marca como "no disponible" todo aquello que no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (según tag del repositorio); detalles de configuracion no disponibles |
| Parametros totales | 1.543.714.304 (aprox. 1,5 mil millones) |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | 256K tokens (listado de Ollama); no verificada en la configuracion del repositorio |
| Tipos de cuantizacion | No disponible (el listado de Ollama indica un tamano publicado de aprox. 3,3 GB) |
| Idiomas soportados | No disponible |
| Licencia | MIT (metadatos del repositorio); verificacion de terminos upstream pendiente segun la model card |
| Formato de pesos | safetensors |
| Modalidades de entrada | Texto e imagen |
| Capacidades anunciadas | Vision, tool calling, thinking |
| Tamano del repositorio | 5,2 GB |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo con la arquitectura Qwen2, lo que situa la base en un transformer decoder-only con atencion por grupos de consultas (GQA) y tokenizer BPE, si bien la model card no confirma explicitamente la configuracion concreta ni el modelo base exacto del que deriva. Con 1.543.714.304 parametros y pesos en safetensors, el modelo se situa en la categoria de modelos pequenos, adecuado para inferencia local. La presencia de la etiqueta "image-text-to-text" y de la capacidad de vision anunciada implica algun componente de proyeccion o codificador visual, pero no se documenta su naturaleza ni su procedencia.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card indica de forma explicita que los detalles tecnicos y de procedencia deben documentarse solo tras verificarlos contra los archivos del repositorio, y que si el modelo deriva de un modelo upstream debe identificarse y cumplir sus requisitos de atribucion y licencia. Tampoco se documenta el metodo de entrenamiento del modo thinking ni del soporte de tool calling.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, segun la etiqueta "conversational" del repositorio.
- Entrada multimodal de texto e imagen, con capacidad de vision anunciada en el listado de Ollama.
- Tool calling o function calling, anunciado como capacidad del modelo.
- Modo de razonamiento explicito (thinking), anunciado en el listado de Ollama.
- Integracion con el ecosistema Ollama mediante el identificador `sarath-om/sarath_om-1.1`.
- Capacidades multilingues: no documentadas; no se dispone de lista de idiomas.
- No se documentan capacidades especificas de codigo, matematicas, audio ni agentes multi-paso mas alla de las etiquetas genericas del repositorio.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con Ollama en una maquina de desarrollo y gestionar dialogos multi-turno, aprovechando su ventana declarada de 256K tokens para mantener historiales largos sin truncamiento agresivo.
- Procesamiento de documentos extensos: con 256K tokens de contexto declarado, es adecuado para resumir o extraer informacion de contratos, informes o transcripciones largas en una sola pasada, siempre que se valide el contexto real en la configuracion desplegada.
- Analisis de imagenes en flujos de soporte: la entrada image-text-to-text permite adjuntar capturas o fotografias y pedir descripciones, clasificaciones o extraccion de datos, integrandolo en herramientas internas de triaje.
- Automatizacion con herramientas: el soporte de tool calling permite conectar el modelo a APIs internas (calendario, tickets, bases de datos) en asistentes de productividad, validando siempre nombres y argumentos antes de ejecutar acciones, como recomienda la model card.
- Prototipado de agentes con razonamiento: el modo thinking facilita la experimentacion con cadenas de razonamiento paso a paso en tareas de planificacion sencilla, con la cautela de que no hay benchmarks que respalden su calidad.
- Educacion y demostraciones: su tamano reducido (aprox. 3,3 GB en el listado de Ollama) y su licencia MIT lo hacen util para talleres, demos y entornos de aprendizaje donde se necesita un modelo multimodal ejecutable en local.
- Evaluacion comparativa interna: sirve como linea base pequena y multimodal en pipelines de evaluacion propios, midiendo latencia, calidad y fiabilidad de tool calling frente a alternativas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que no se incluyen puntuaciones verificadas de forma independiente y que cualquier evaluacion reproducible deberia incluir datasets, metricas, hardware, revision del modelo y casos de fallo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,5 mil millones de parametros, en fp16 se requieren aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 4 bits el modelo ronda los 1 GB de pesos. El listado de Ollama publica un tamano de aproximadamente 3,3 GB, coherente con una cuantizacion de 8 bits o con pesos empaquetados.
- La ventana de 256K tokens incrementa de forma notable el consumo de cache KV; para contextos muy largos se necesita VRAM adicional proporcional al contexto efectivo utilizado.
- GPU recomendadas: tarjetas consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) deberian bastar para contextos moderados; para contextos cercanos a 256K se recomienda A100, H100 o GPUs con 24 GB o mas (RTX 3090, RTX 4090).
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas para contextos normales.
- Opciones de despliegue: Ollama (`ollama pull sarath-om/sarath_om-1.1`), Hugging Face CLI (`hf download sarath-om/sarath_om-1.1`) y frameworks compatibles con safetensors y Qwen2; la model card advierte de que el codigo de inferencia correcto depende de los archivos reales del repositorio y debe verificarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sarath OM 1.1 | 1,5B | 256K (declarado en Ollama) | Texto e imagen | MIT (metadatos) | Hugging Face y Ollama |
| Qwen2-VL-2B | 2B | 32K nativo, extensible | Texto e imagen | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Texto | Apache 2.0 | Hugging Face y Ollama |
| SmolVLM-2B | 2B | 8K | Texto e imagen | Apache 2.0 | Hugging Face |

La comparativa se basa en caracteristicas publicas de modelos de rango similar; no se dispone de benchmarks de Sarath OM 1.1 que permitan comparar calidad de forma objetiva. El contexto de 256K declarado es superior al de las alternativas listadas, pero no esta verificado en la configuracion del repositorio.

## Limitaciones y advertencias

- No hay benchmarks independientes ni datos de entrenamiento publicados; la calidad real del modelo no esta respaldada por evidencia verificable.
- La model card advierte de que las salidas pueden ser inexactas, incompletas o inconsistentes, con riesgo de alucinacion en tareas factuales.
- El contexto de 256K procede del listado de Ollama y no se ha verificado contra la configuracion del repositorio; el contexto efectivo podria ser menor.
- No se documentan los idiomas soportados, por lo que el rendimiento fuera del ingles es incierto.
- Las capacidades de vision y tool calling deben validarse en la variante concreta desplegada; la model card indica que solo deben usarse cuando la variante seleccionada las soporte.
- Validar siempre nombres y argumentos de herramientas antes de ejecutar acciones, tal como recomienda el autor.
- La licencia MIT figura en los metadatos, pero la model card pide comprobar el archivo LICENSE y los terminos de los modelos, codigo y datasets upstream antes de redistribuir o usar comercialmente.
- No usar las salidas como unica base para decisiones medicas, legales, financieras o de alto impacto.
- La informacion de gobernanza del proyecto (fundador y CEO identificados como la misma persona) y la ausencia de documentacion tecnica detallada aconsejan tratar el modelo con cautela en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarath-om/sarath_om-1.1
- Perfil del autor en Hugging Face: https://huggingface.co/sarath-om
- Listado en Ollama: https://ollama.com/sarath-om/sarath_om-1.1
- Web oficial de Sarath OM: https://sarath.openflip.in/
- GitHub de Sarath AI: https://github.com/Sarath-Om
- LinkedIn de Sarath AI: https://www.linkedin.com/company/sarath-ai
