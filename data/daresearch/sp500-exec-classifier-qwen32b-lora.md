# daresearch/sp500-exec-classifier-qwen32b-lora

# daresearch/sp500-exec-classifier-qwen32b-lora

## Resumen

El modelo `daresearch/sp500-exec-classifier-qwen32b-lora` es un ajuste fino mediante LoRA publicado por el usuario daresearch sobre `unsloth/Qwen2.5-32B-Instruct-bnb-4bit`. Se trata, por tanto, de una adaptacion del modelo Qwen2.5-32B-Instruct, un transformer decoder-only de aproximadamente 32.500 millones de parametros y una ventana de contexto de 131.072 tokens, orientado a generacion de texto. El nombre del repositorio sugiere una especializacion en clasificacion de contenido relacionado con ejecutivos o eventos del S&P 500, aunque la model card no documenta ni la tarea exacta ni el conjunto de datos de entrenamiento.

La relevancia del modelo reside en que ilustra el flujo de trabajo de ajuste eficiente con Unsloth y TRL sobre un modelo grande cuantizado a 4 bits, lo que permite adaptar un modelo de 32B a un dominio concreto con requisitos de VRAM reducidos respecto al entrenamiento completo. El autor declara que el entrenamiento fue "2x mas rapido" gracias a Unsloth.

La informacion publicada es minima: solo se indican el modelo base, la licencia Apache 2.0, el idioma ingles y el uso de Unsloth. No se especifican parametros del adaptador, datos de entrenamiento, benchmarks ni capacidades concretas, por lo que esta ficha se limita a recoger los datos verificables y a marcar como no disponible todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 con adaptador LoRA; arquitectura heredada de Qwen2.5-32B-Instruct |
| Parametros totales | 32.500 millones (aprox.) en el modelo base; el adaptador LoRA no declara su numero de parametros |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | Modelo base en bnb-4bit; no se documentan cuantizaciones del adaptador (no disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,3 GB |
| Libreria | transformers |
| Modelo base | unsloth/Qwen2.5-32B-Instruct-bnb-4bit |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-14 |
| Fecha de actualizacion | 2026-10-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-32B-Instruct es un transformer decoder-only con atencion por consultas agrupadas (GQA), activacion SwiGLU, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE), con soporte de contexto de hasta 131.072 tokens. Sobre esa arquitectura se ha aplicado un ajuste fino LoRA. El autor declara que el entrenamiento se realizo con Unsloth (que afirma un entrenamiento 2x mas rapido) y las etiquetas del repositorio incluyen `trl`, lo que apunta a que se uso la libreria TRL de HuggingFace para el pipeline de ajuste.

El modelo base empleado (`unsloth/Qwen2.5-32B-Instruct-bnb-4bit`) esta cuantizado a 4 bits con bitsandbytes, de modo que el ajuste es de tipo QLoRA: se entrena el adaptador sobre pesos congelados en 4 bits. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF o DPO posterior, ni la innovacion tecnica especifica del ajuste, mas alla del uso de Unsloth. Tampoco se indica el rango (rank), el alpha ni las capas objetivo del adaptador LoRA.

## Capacidades

- Generacion de texto: al derivar de Qwen2.5-32B-Instruct, el modelo base aporta generacion de lenguaje natural, resumen y respuesta a instrucciones.
- Razonamiento y matematicas: el modelo base esta optimizado para tareas de razonamiento logico, matematicas y comprension lectora.
- Generacion de codigo: el modelo base soporta generacion y explicacion de codigo en multiples lenguajes.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta llamada a funciones y salidas estructuradas en formato JSON.
- Capacidades de agente: el modelo base permite razonamiento multi-paso y uso de herramientas en flujos de agente.
- Contexto largo: ventana de 131.072 tokens heredada del modelo base, adecuada para documentos extensos.
- Multilingue (modelo base): Qwen2.5 soporta aproximadamente 29 idiomas, pero este ajuste declara unicamente ingles (en).
- Capacidad especifica del ajuste fino: no documentada. El nombre del repositorio sugiere clasificacion en el dominio del S&P 500, pero no hay confirmacion en la model card.

Nota: las capacidades del modelo base pueden haberse visto alteradas por el ajuste fino, cuyo efecto real no esta documentado.

## Casos de uso

Los siguientes casos son potenciales y se derivan del nombre del repositorio y de las capacidades del modelo base; la tarea exacta del ajuste no esta documentada, por lo que deben validarse antes de usarse en produccion.

- Clasificacion de intervenciones en llamadas de resultados del S&P 500: si la tarea es la que sugiere el nombre, el modelo podria etiquetar el rol del hablante (CEO, CFO, analista) o el tipo de declaracion (guidance, resultados, riesgos) dentro de transcripciones extensas, apoyandose en la ventana de 131.072 tokens.
- Analisis de noticias y comunicados financieros: clasificar titulares o notas de prensa relacionadas con ejecutivos de empresas del S&P 500 en categorias predefinidas.
- Procesamiento de filings (10-K, 10-Q, 8-K): segmentar y etiquetar secciones o declaraciones atribuidas a directivos concretos en documentos regulatorios largos.
- Anotacion de conjuntos de datos financieros: usar el modelo como etiquetador automatico para acelerar el etiquetado de corpus financieros destinados a entrenar otros modelos.
- Ingesta y enrutado en pipelines de datos: clasificar documentos entrantes en un pipeline de datos de mercado para dirigirlos al proceso correspondiente.
- Filtrado y moderacion de contenido financiero: detectar y clasificar texto relevante dentro de grandes volumenes de informacion bursatil.
- Asistente de analisis financiero (modelo base): generar resumenes, responder preguntas y redactar informes sobre documentos largos gracias al contexto de 131.072 tokens.
- Integracion en flujos con tool calling: el modelo base soporta llamada a funciones, lo que permitiria conectarlo a APIs financieras en un pipeline de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones orientativas basadas en un modelo denso de 32.500 millones de parametros; el autor no publica cifras de hardware ni de latencia.

- Inferencia en FP16/BF16: aproximadamente 65 GB de VRAM.
- Inferencia en 8 bits: aproximadamente 35-40 GB de VRAM.
- Inferencia en 4 bits: aproximadamente 18-20 GB de VRAM para los pesos, mas overhead de contexto.
- Adaptador LoRA: el repositorio ocupa 4,3 GB; se debe cargar junto al modelo base, por lo que la VRAM efectiva es la del modelo base mas el adaptador.
- GPU profesionales recomendadas: A100 (40/80 GB), H100 (80 GB) o L40S (48 GB).
- GPU de consumo: cabe en 4 bits en una RTX 4090 o RTX 3090 de 24 GB, aunque con margen ajustado y limitaciones de longitud de contexto; para contexto completo conviene repartir carga entre dos GPU.
- Opciones de despliegue: al estar etiquetado con `text-generation-inference`, es compatible con TGI; tambien con vLLM y con la libreria transformers. El uso de llama.cpp u Ollama requeriria convertir los pesos a GGUF, algo no documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| daresearch/sp500-exec-classifier-qwen32b-lora | 32,5B (base) + LoRA | 131.072 | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen2.5-32B-Instruct | 32,5B | 131.072 | Apache 2.0 | HuggingFace |
| Qwen2.5-72B-Instruct | 72,7B | 131.072 | Licencia Qwen | HuggingFace |
| Llama-3.3-70B-Instruct | 70B | 128.000 | Llama 3.3 Community License | HuggingFace |

El modelo aqui descrito no aporta datos de rendimiento que permitan una comparacion cuantitativa con las alternativas; la tabla recoge unicamente arquitectura, tamano, contexto y licencia.

## Limitaciones y advertencias

- Sesgos desconocidos: no se documenta el dataset de entrenamiento, por lo que no se pueden evaluar sesgos de dominio, geograficos ni de genero.
- Riesgo de alucinacion: al ser un modelo generativo derivado de un LLM, puede producir informacion incorrecta o inventada, especialmente en dominio financiero.
- Limitacion de idioma: aunque el modelo base es multilingue, este ajuste declara unicamente ingles (en).
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del adaptador por separado antes de desplegarlo.
- Falta de validacion: 0 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad; es probable que sea experimental.
- Ausencia de benchmarks: no hay metricas de evaluacion, por lo que se desconoce su rendimiento real en la tarea objetivo.
- Ambiguedad de tarea: el pipeline no esta declarado y la model card no describe la tarea; pese al nombre "classifier", no se confirma que se comporte como clasificador en sentido estricto.
- Dependencia del modelo base: se necesita descargar y cargar `unsloth/Qwen2.5-32B-Instruct-bnb-4bit` ademas del adaptador, lo que incrementa el espacio en disco y la VRAM necesarios.
- Cuantizacion en 4 bits: el modelo base esta cuantizado a 4 bits, lo que puede reducir la precision frente a los pesos originales en FP16.
- Fecha de creacion atipica (2026-10-14): conviene verificar la integridad y vigencia del repositorio antes de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daresearch/sp500-exec-classifier-qwen32b-lora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-32B-Instruct-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
