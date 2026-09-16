# Dibachain/Diba-Base

## Resumen

Diba-Base (دیبا) es un modelo de lenguaje de aproximadamente 4.300 millones de parámetros (4.326.350.848 exactos, según los pesos en safetensors) desarrollado por Dibachain. Está concebido como un modelo "Persian-first" de conversación y generación de código, con conocimiento específico de Irán, incluida su historia contemporánea. Su rasgo diferenciador es que puede ejecutarse íntegramente offline en CPU mediante un único archivo GGUF de unos 2,8 GB, sin GPU ni servicios en la nube.

El modelo responde en el idioma del mensaje del usuario (persa entrada, persa salida; inglés entrada, inglés salida), soporta tool calling con definiciones de funciones y sus argumentos, y cubre Python, JavaScript, TypeScript y otros lenguajes partiendo de instrucciones en persa o en inglés. Se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y se distribuye tanto en safetensors para `transformers` como en GGUF para llama.cpp, Ollama y LM Studio.

Su relevancia actual reside en cubrir un nicho poco atendido por los modelos generalistas: persa de registro escrito con ortografía y ZWNJ correctos, junto con conocimiento factual sobre Irán. Según los datos publicados por el autor, supera a Gemma 3 4B, Granite 4.0 Micro 3B, Phi-4-mini 3.8B y SmolLM3 3B en tareas de código y en preguntas de historia iraní, manteniendo un tamaño que permite despliegue en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; el pipeline es text-generation y requiere `trust_remote_code=True`, lo que indica una definición de modelo propia ("Diba") distribuida con el repositorio |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible; el ejemplo oficial de llama.cpp arranca el servidor con `-c 8192`, pero no se declara como ventana máxima del modelo |
| Tipos de cuantizacion | bfloat16 en safetensors; GGUF `q4_k_m` (~2,8 GB). No se documentan otras cuantizaciones |
| Idiomas soportados | Persa (fa) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

Datos adicionales: repositorio de 11,5 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 15 de septiembre de 2026 y actualizado el 16 de septiembre de 2026. Etiquetado como `endpoints_compatible` y con `custom_code`.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (transformer denso, MoE, híbrida u otra), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otro tipo de alineamiento. Lo único verificable es que el modelo se carga a través de `transformers` con código remoto propio (`trust_remote_code=True`), que expone un chat template con el parámetro `enable_thinking`, y que existe integración directa con llama.cpp mediante `--jinja` y `--chat-template-kwargs '{"enable_thinking": false}'`.

El elemento técnico destacable es la existencia de un modo de razonamiento conmutable: el autor recomienda desactivarlo (`enable_thinking=false`) para respuestas directas y usar temperatura 0 en código y respuestas precisas, o 0,3 en conversación informal. Todo lo demás relativo al proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en persa y en inglés, con registro escrito, ortografía correcta y uso adecuado del ZWNJ (medio espacio persa).
- Adaptación al idioma del interlocutor: responde en el mismo idioma en que se le escribe (10/10 en la prueba publicada por el autor).
- Generación de código en Python, JavaScript, TypeScript y "muchos otros lenguajes", a partir de instrucciones en persa o en inglés.
- Conocimiento específico de Irán: geografía, cultura e historia contemporánea, área en la que el autor reporta una ventaja amplia frente a modelos generalistas del mismo tamaño.
- Tool calling / function calling: acepta definiciones de funciones y decide cuál invocar junto con sus argumentos.
- Modo de razonamiento conmutable mediante `enable_thinking` en el chat template.
- Ejecución offline en CPU con GGUF, sin dependencia de nube ni GPU.
- No se documentan capacidades de visión, audio ni multimodalidad en este modelo; el autor remite a Diba-Vision, Diba-Embed y Diba-STT para esas funciones.

## Casos de uso

- Atención al cliente en persa sobre infraestructura propia: el modelo puede gestionar conversaciones multi-turno íntegramente en persa y desplegarse en servidores sin GPU, lo que reduce coste y evita enviar datos de clientes a terceros.
- Generación de código para equipos iraníes: permite pasar especificaciones funcionales redactadas en persa y obtener implementaciones en Python o JavaScript, con temperatura 0 para maximizar determinismo.
- Agentes con tool calling: integrado en un bucle de agente, puede decidir qué función invocar (consulta a base de datos, API interna, cálculo) y construir los argumentos, lo que habilita automatizaciones de varios pasos.
- Entornos air-gapped o con conectividad restringida: al ejecutarse offline desde un GGUF de ~2,8 GB en CPU, es adecuado para organizaciones que no pueden usar APIs en la nube por motivos regulatorios o de sanciones.
- Localización de software al persa: ayuda a traducir cadenas de interfaz, revisar textos en persa escrito y adaptar documentación técnica manteniendo terminología consistente.
- Documentación y divulgación sobre Irán: generación de resúmenes y respuestas sobre geografía, cultura e historia contemporánea iraní para medios, editoriales o materiales educativos.
- Generación de pruebas unitarias y revisión de código en CI/CD: puede producir tests para funciones Python o JavaScript, encajando en un pipeline que valide el resultado antes de aceptarlo.
- Prototipado en portátiles sin GPU: investigadores y desarrolladores pueden evaluar el comportamiento del modelo en local con Ollama o LM Studio antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en la model card, medidos con prompts y pruebas idénticos y decodificación greedy: 20 tareas de Python y 20 de JavaScript con tests unitarios reales, 40 preguntas de historia de Irán en persa y una prueba de si el modelo responde en el idioma del usuario.

| Modelo | Python | JavaScript | Historia de Irán (fa) | Responde en persa |
|---|---|---|---|---|
| Diba-Base | 13/20 | 13/20 | 29/40 | 10/10 |
| Gemma 3 4B | 11/20 | 12/20 | 15/40 | 10/10 |
| Granite 4.0 Micro 3B | 14/20 | 11/20 | 11/40 | 10/10 |
| Phi-4-mini 3.8B | 11/20 | 10/20 | 5/40 | 10/10 |
| SmolLM3 3B | 11/20 | 10/20 | 4/40 | 9/10 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandarizados en la información disponible. Las cifras anteriores provienen del propio autor y no se han verificado de forma independiente.

## Requisitos de hardware

- Inferencia en bfloat16: los 4.326 millones de parámetros ocupan aproximadamente 8,6 GB solo en pesos, por lo que conviene contar con 10-12 GB de VRAM para margen de contexto y caché KV.
- Inferencia en GGUF `q4_k_m`: el archivo ocupa unos 2,8 GB, lo que permite ejecución en CPU con RAM disponible y también en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: para bfloat16, A100, H100, L40S, RTX 4090 o RTX 3090; para cuantización q4, cualquier GPU con 4 GB o más, además de CPU.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares en bfloat16, y en GPUs de gama de entrada con la cuantización GGUF.
- Opciones de despliegue: `transformers` (requiere `trust_remote_code=True`), llama.cpp mediante `llama-server -hf Dibachain/Diba-Base:diba-q4_k_m.gguf -c 8192 --jinja`, Ollama (`ollama run hf.co/Dibachain/Diba-Base:diba-q4_k_m.gguf`) y LM Studio.
- Compatibilidad con vLLM o TGI: no documentada; al usar definición de modelo propia con código remoto, el soporte en esos servidores no está garantizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Python | JavaScript | Historia de Irán (fa) | Licencia | Formatos |
|---|---|---|---|---|---|---|---|
| Diba-Base | ~4,3B | No disponible | 13/20 | 13/20 | 29/40 | Apache 2.0 | safetensors, GGUF |
| Gemma 3 4B | ~4B | No disponible en la información proporcionada | 11/20 | 12/20 | 15/40 | No indicada en la información proporcionada | No disponible |
| Granite 4.0 Micro 3B | 3B | No disponible en la información proporcionada | 14/20 | 11/20 | 11/40 | No indicada en la información proporcionada | No disponible |
| Phi-4-mini 3.8B | 3,8B | No disponible en la información proporcionada | 11/20 | 10/20 | 5/40 | No indicada en la información proporcionada | No disponible |
| SmolLM3 3B | 3B | No disponible en la información proporcionada | 11/20 | 10/20 | 4/40 | No indicada en la información proporcionada | No disponible |

Lectura de la comparativa: Diba-Base lidera en JavaScript y en conocimiento de historia iraní, empata en Python en la zona media-alta y solo queda por detrás de Granite 4.0 Micro 3B en Python (13/20 frente a 14/20). Su ventaja más clara es la combinación de persa nativo con ejecución en CPU, algo que los modelos generalistas comparados no ofrecen como propuesta principal.

## Limitaciones y advertencias

- La model card advierte explícitamente de que, como cualquier modelo de este tamaño, hay que verificar los hechos importantes y el código generado antes de confiar en ellos.
- Riesgo de alucinación inherente a un modelo de ~4B, especialmente en preguntas factuales fuera del dominio persa o de historia iraní.
- El propio autor señala que el modelo "refleja las perspectivas presentes en sus datos de entrenamiento", sin detallar la composición de esos datos ni los sesgos conocidos.
- Cobertura lingüística limitada a persa e inglés; no se declaran capacidades en otras lenguas.
- No se especifica la longitud máxima de contexto, lo que dificulta planificar despliegues con documentos largos.
- No se documentan el número de tokens de entrenamiento, la composición del dataset ni las fases de alineamiento, lo que limita la evaluabilidad del modelo.
- Los benchmarks publicados son del propio autor, con 20 tareas por lenguaje y 40 preguntas de historia; el tamaño de muestra es reducido y no hay verificación independiente.
- Requiere `trust_remote_code=True` al cargar con `transformers`, lo que implica ejecutar código del repositorio; conviene revisarlo antes en entornos de producción.
- Compatibilidad con servidores de inferencia de alto rendimiento como vLLM o TGI no está documentada.
- La licencia Apache 2.0 permite uso comercial, pero no exime de cumplir otras normativas aplicables al contenido generado ni de las advertencias del autor sobre verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dibachain/Diba-Base
- Sitio del autor: https://dibachain.ir
- Demo de chat en GPU: https://huggingface.co/spaces/DibaAi/diba-chat-gpu
- Demo de chat en CPU: https://huggingface.co/spaces/DibaAi/diba-chat
- Modelo de embeddings: https://huggingface.co/Dibachain/Diba-Embed
- Modelo de visión: https://huggingface.co/Dibachain/Diba-Vision
- Modelo de voz a texto: https://huggingface.co/Dibachain/Diba-STT
- Resultados de búsqueda web: las consultas realizadas devolvieron únicamente foros y guías sobre Facebook (CommentCaMarche, CCM, ZDNET), sin relación con el modelo; no aportan enlaces adicionales, papers ni repositorios.
