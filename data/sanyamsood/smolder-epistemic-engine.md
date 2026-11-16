# sanyamsood/smolder-epistemic-engine

## Resumen
Smolder es un "motor epistemico" distribuido como runtime de inferencia que se acopla a modelos de lenguaje abiertos ya existentes (Llama 3.1 8B, Qwen 2.5 32B y Qwen 2.5 72B) para suprimir alucinaciones mediante tecnicas de steering de representaciones, alineamiento de modalidad epistemica y compuerta de entropia de Shannon en tiempo de generacion. No es un modelo con pesos propios: el repositorio de Hugging Face ocupa 0.0 GB y el autor (Sanyam Sood) lo publica como un wheel Python (`smolder-0.1.0-py3-none-any.whl`) con vectores de steering y perfiles de calibracion sellados en un "Epistemic Vault" AES-256-GCM.

La propuesta central es sustituir respuestas confabuladas por abstencion calibrada (`PASS_CALIBRATED_ABSTAIN`) cuando el modelo base no dispone de conocimiento fiable, manteniendo la precision factual en las respuestas que si emite. El autor declara resultados de TruthfulQA (90,0 % de veracidad en Llama 3.1 8B y 80,0 % en Qwen 2.5 72B) y SimpleQA (50,0 % de CGA en el "Smolder-32B Mirror"), comparandolos con GPT-4o, Claude 3.5 Sonnet y GPT-3.5-Turbo.

Es relevante ahora porque ataca uno de los problemas mas persistentes de los LLM abiertos (la alucinacion en conocimiento de cola larga) sin requerir SFT masivo ni alignment propietario, y porque su enfoque de "modelo como capa sobre otro modelo" abre una via de despliegue barata: el autor reporta ejecucion en dos Tesla T4. La contrapartida es que la verificacion independiente es practicamente nula (0 descargas, 0 likes, repositorio vacio de pesos) y que buena parte de las cifras publicadas no son reproducibles con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer con pesos propios: capa de steering de representaciones (Multi-Layer Gaussian Distributed Representation Steering) sobre modelos base Llama 3.1 y Qwen 2.5; incluye compuerta de entropia de Shannon en streaming y alineamiento de modalidad epistemica |
| Parametros totales | Depende del modelo base: 8,0B (Llama 3.1), 32,8B ("Smolder-32B Mirror"), 72,7B (Qwen 2.5) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no declarada en la model card) |
| Tipos de cuantizacion | No disponible; el ejemplo de uso carga el base en 4 bits (`unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`), pero no se documentan cuantizaciones propias |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | No hay pesos publicados: wheel Python (`smolder-0.1.0-py3-none-any.whl`) con vectores de steering sellados en vault AES-256-GCM; el modelo base se descarga aparte (safetensors/GGUF segun el base) |

## Arquitectura y entrenamiento
Smolder no entrena un transformer desde cero: actua como capa de control sobre modelos abiertos. La tecnica declarada es Multi-Layer Gaussian Distributed Representation Steering, que inyecta un vector de steering en una capa central (62,5 % de profundidad: capa 20 en Llama 8B, capa 42 en Qwen 32B) con una distribucion gaussiana de desviacion sigma=1,5 y coeficiente alpha=1,0, modulando las activaciones internas para empujar al modelo hacia respuestas factuales o hacia la abstencion. A esto se suma Invariant Epistemic Modality Alignment (alineamiento de la "modalidad epistemica", es decir, del grado de certeza expresado) y una compuerta de entropia de Shannon en streaming: cuando la distribucion de tokens se vuelve demasiado incierta, el sistema dispara `PASS_CALIBRATED_ABSTAIN` en lugar de generar una conjetura.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Los vectores de steering y los perfiles de calibracion se distribuyen cifrados (AES-256-GCM con AAD) para impedir su inspeccion o modificacion, lo que impide auditar como se derivaron. El ejemplo de codigo de la model card muestra `steering_vector=torch.zeros(model.config.hidden_size)` inyectado "via authenticated vault", lo que sugiere que el vector real se carga en tiempo de ejecucion desde el wheel y no es visible.

## Capacidades
- Supresion de alucinaciones: el proposito declarado es sustituir confabulaciones por abstencion calibrada cuando el modelo base no sabe la respuesta.
- Generacion de texto: hereda las capacidades del modelo base (Llama 3.1 8B o Qwen 2.5), incluido razonamiento y codigo, aunque la model card no las detalla.
- Calibracion de confianza: la compuerta de entropia de Shannon permite decidir en tiempo de generacion cuando responder y cuando abstenerse.
- Cross-architecture: se declara aplicable tanto a Llama como a Qwen, lo que sugiere portabilidad entre familias de modelos.
- Evaluacion en benchmarks de factualidad: soporta TruthfulQA y SimpleQA como suites de referencia.
- Multilingue: solo ingles declarado; no se documentan capacidades en otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking / vision / audio: no disponible en la informacion proporcionada.

## Casos de uso
- Atencion al cliente con riesgo de alucinacion: en un flujo de preguntas factuales (politicas, precios, plazos), el motor puede forzar abstencion calibrada cuando la confianza cae, derivando a un humano en lugar de inventar una respuesta; encaja con el objetivo declarado de reducir confabulaciones.
- Asistentes de conocimiento interno: sobre un corpus empresarial, se usaria como capa sobre Qwen 2.5 32B para que las respuestas no verificadas se marquen como "no lo se" en vez de mezclarse con datos reales.
- Moderacion de contenido factual: en pipelines de publicacion automatica, la compuerta de entropia puede actuar como filtro previo que bloquea afirmaciones de baja confianza antes de que lleguen al usuario.
- Investigacion sobre alucinacion: util como baseline experimental para estudiar steering de representaciones y abstencion calibrada, comparando TruthfulQA y SimpleQA entre Llama y Qwen.
- Despliegue de bajo coste: el autor reporta ejecucion del "Smolder-32B Mirror" en dos Tesla T4, lo que lo hace candidato para entornos con GPUs de gama media donde un 32B completo no cabria con comodidad.
- Evaluacion de factualidad en produccion: integrar la compuerta como metrica de confianza por respuesta para monitorizar la tasa de abstencion y la tasa de error en un servicio desplegado.
- Prototipado rapido: la instalacion via wheel permite probar el efecto del steering sobre un base ya cargado en memoria, sin reentrenar ni reemplazar el modelo.

## Benchmarks y rendimiento
Los datos provienen exclusivamente de la model card del autor; no hay verificacion independiente ni scripts de evaluacion publicados en el repositorio.

TruthfulQA (50 preguntas estandar, segun el autor):

| Modelo | Arquitectura | Parametros | Veracidad (% True) | Informatividad (% Info) | Tasa de alucinacion |
|---|---|---|---|---|---|
| Smolder-Llama-3.1-8B | Llama 3 | 8,0B | 90,0 % (45/50) | 50,0 % | 10,0 % |
| Smolder-72B | Qwen 2.5 | 72,7B | 80,0 % (40/50) | 100,0 % | 20,0 % |
| Qwen-2.5-72B (base) | Qwen 2.5 | 72,7B | ~66,4 % | 98,2 % | 33,6 % |
| Llama-2-70B-Chat | Llama 2 | 70B | 52,8 % | 91,5 % | 47,2 % |
| GPT-3.5-Turbo | OpenAI | cerrado | 47,0 % | 98,0 % | 53,0 % |
| GPT-3 (175B base) | OpenAI | 175B | 28,0 % | 95,0 % | 72,0 % |

SimpleQA (OpenAI SimpleQA, `openai/simple-evals`):

| Modelo | Parametros | Hardware | CGA | Tasa de alucinacion | F-Score |
|---|---|---|---|---|---|
| Smolder-32B Mirror | 32,8B | 2x Tesla T4 | 50,0 % (4/8) | 8,0 % | 13,8 % |
| GPT-4o (publicado) | cerrado | API | 38,6 % | 60,3 % | 38,4 % |
| Claude 3.5 Sonnet | cerrado | API | 35,4 % | 62,3 % | 35,0 % |
| GPT-4o-mini | cerrado | API | 8,8 % | 90,8 % | 8,6 % |

SimpleQA Verified de Google DeepMind (auditoria de 100 preguntas):

| Modelo | Preguntas | CGA | Abstencion calibrada |
|---|---|---|---|
| Smolder-32B | 100 | 36,4 % | 89,0 % |
| LLM abierto base | 100 | ~14,0 % | ~2,0 % |

Advertencias sobre estos numeros: la muestra de TruthfulQA es de solo 50 preguntas (intervalos de confianza amplios), el SimpleQA de OpenAI se evaluo con 8 preguntas (4 aciertos), y la comparacion con GPT-4o y Claude 3.5 Sonnet mezcla protocolos distintos (el F-Score de Smolder, 13,8 %, es muy inferior al de GPT-4o, 38,4 %, pese a que la tabla destaca la CGA). No se han publicado scripts, semillas ni logs de evaluacion.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita. Como referencia, un base de 8B en 4 bits ronda 6-8 GB, un 32B en 4 bits ronda 18-20 GB y un 72B en 4 bits ronda 40-45 GB; la capa de steering anade overhead de activaciones no cuantificado.
- GPU recomendadas: el autor reporta ejecucion del Smolder-32B Mirror en dos Tesla T4 (16 GB cada una), lo que implica cuantizacion agresiva o sharding. Para el 72B se necesitaria A100 80GB, H100 o multi-GPU.
- Consumer GPU: un 8B en 4 bits cabe en RTX 4090 (24 GB) y en RTX 3090; un 32B en 4 bits entra justo en 24 GB con cuantizacion y contexto corto; un 72B no cabe en consumer.
- Opciones de despliegue: el paquete se instala via pip (wheel) y se engancha al modelo base cargado con `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la naturaleza del steering (hooks sobre activaciones) sugiere que no es compatible directamente con motores de inferencia compilados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque antialucinacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smolder (sobre Llama 3.1 / Qwen 2.5) | 8B / 32B / 72B (base) | no disponible | Steering de representaciones + abstencion calibrada | Apache-2.0 | Wheel en HF, 0 descargas |
| Llama 3.1 8B Instruct | 8B | 128k (segun Meta) | RLHF estandar | Llama 3.1 Community | Amplia, pesos abiertos |
| Qwen 2.5 32B / 72B | 32B / 72B | 128k (segun Alibaba) | RLHF estandar | Apache-2.0 | Amplia, pesos abiertos |
| GPT-4o / Claude 3.5 Sonnet | cerrado | no disponible | Alignment propietario | Propietaria | Solo API |

La comparacion directa es dificil porque Smolder no sustituye al base: lo modifica. Frente a Llama 3.1 8B o Qwen 2.5 sin steering, el autor declara subidas de veracidad en TruthfulQA (90 % frente a ~66 % en Qwen 72B) a costa de informatividad (50 % frente a ~98 %), lo que refleja el intercambio central: mas abstencion, menos respuestas utiles. Frente a GPT-4o y Claude, las cifras de CGA en SimpleQA favorecen a Smolder, pero con muestras de 8 y 100 preguntas y sin auditoria externa.

## Limitaciones y advertencias
- Verificacion practicamente nula: 0 descargas, 0 likes, repositorio de 0.0 GB sin pesos ni scripts de evaluacion; todas las cifras provienen del autor.
- Muestras de benchmark muy pequenas: 50 preguntas en TruthfulQA y 8 en el SimpleQA de OpenAI, insuficientes para conclusiones robustas.
- Comparaciones no homogeneas: mezcla CGA, F-Score y protocolos de distintos proveedores; el F-Score de Smolder (13,8 %) es inferior al de GPT-4o (38,4 %) pese al titular de la tabla.
- Caja negra: los vectores de steering y perfiles de calibracion estan cifrados en un vault AES-256-GCM, lo que impide auditar como se derivaron y que sesgos introducen.
- Opacidad de entrenamiento: no se documentan datos, tokens, RLHF/DPO ni metodologia de calibracion.
- Solo ingles: no hay soporte multilingue declarado.
- Riesgo de sobre-abstencion: la propia tabla muestra informatividad del 50 % en Llama 8B; en produccion puede degradar la utilidad percibida.
- Compatibilidad limitada: al depender de hooks sobre activaciones, no se documenta integracion con vLLM, llama.cpp, Ollama o TGI.
- Licencia Apache-2.0 declarada, pero el wheel y los vectores cifrados pueden tener terminos adicionales no explicitados; conviene revisar antes de uso comercial.
- Fechas incoherentes: el repositorio figura como creado en 2026-11-16, lo que sugiere metadatos manipulados o un error del autor y refuerza la cautela.
- Sesgos conocidos: no documentados; al heredar el base, arrastra los sesgos de Llama 3.1 o Qwen 2.5.

## Enlaces
- Hugging Face: https://huggingface.co/sanyamsood/smolder-epistemic-engine
- Wheel de instalacion: https://huggingface.co/sanyamsood/smolder-epistemic-engine/resolve/main/smolder-0.1.0-py3-none-any.whl
- TruthfulQA (Lin et al., 2021): https://arxiv.org/abs/2109.07958
- OpenAI SimpleQA: https://github.com/openai/simple-evals
- DeepMind SimpleQA Verified: https://github.com/google-deepmind/simpleqa-verified
- Modelo base Llama 3.1 8B Instruct (4 bits): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
