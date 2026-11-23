# nagohachi/tiny-lm-v3-japanese-1.5b-a500m-sft

## Resumen

tiny-lm-v3-japanese-1.5b-a500m-sft es la version ajustada con instrucciones (SFT) del modelo base tiny-lm-v3-japanese-1.5b-a500m-base, un modelo de lenguaje en japones con arquitectura Mixture-of-Experts (MoE) desarrollado por el usuario nagohachi. El modelo cuenta con 1.461 millones de parametros totales y aproximadamente 480 millones activos por token, lo que lo situa en la categoria de modelos compactos con activacion dispersa. Fue preentrenado desde cero sobre 10.500 millones de tokens y posteriormente afinado con tecnicas de supervised fine-tuning sobre conversaciones en japones.

La relevancia de este modelo radica en su enfoque: un MoE de reducido tamano disenado especificamente para japones, con un tokenizador de vocabulario amplio (99.574 tokens) derivado de llm-jp-3-440m, lo que lo hace interesante para experimentacion en entornos con recursos limitados y para investigacion sobre arquitecturas MoE eficientes en idiomas distintos del ingles. La version SFT incorpora una plantilla de chat compatible con el formato instruct de llm-jp-3 y esta pensada para generacion de texto conversacional.

El modelo requiere `trust_remote_code=True` debido a que incluye una implementacion personalizada del modulo MoE en el repositorio. Su ventana de contexto es de 2048 tokens, un valor limitado en comparacion con los estandares actuales, y su licencia no esta especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, implementacion custom (`megatron_gpt_moe`) |
| Parametros totales | 1.461.371.904 (1,46B) |
| Parametros activos | ~480M (16 expertos enrutados con top-3 + 1 experto compartido) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | Japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,9 GB) |
| Vocabulario | 99.574 tokens |
| Tokenizador | llm-jp/llm-jp-3-440m |
| Plantilla de chat | llm-jp-3 instruct |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con 16 expertos enrutados mediante seleccion top-3 mas un experto compartido, sobre una base de transformer. La implementacion del modulo MoE es personalizada y se distribuye con el repositorio, por lo que es necesario cargar el modelo con `trust_remote_code=True`. El tokenizador proviene de llm-jp-3-440m, con un vocabulario de 99.574 tokens optimizado para japones.

El preentrenamiento del modelo base se realizo desde cero sobre 10.500 millones de tokens. La fase SFT utilizo los datasets llm-jp/magpie-sft-v1.0 y kanhatakeyama/AutoMultiTurnByCalm3-22B, sumando aproximadamente 188.000 conversaciones. El entrenamiento se ejecuto durante 2 epocas (6.000 pasos con 64 conversaciones por paso) y la funcion de perdida se calculo unicamente sobre los tramos correspondientes al asistente, no sobre los turnos del usuario. No se menciona el uso de RLHF ni DPO en esta version.

## Capacidades

- Generacion de texto en japones con formato conversacional multi-turno.
- Ajuste instructivo mediante SFT, con plantilla de chat compatible con llm-jp-3 instruct.
- Razonamiento basico y respuesta a preguntas en japones (segun los resultados de llm-jp-eval en tareas de QA, NLI y MT).
- Generacion de codigo limitada: la evaluacion excluye la categoria de generacion de codigo del promedio, y los resultados en tareas de codigo no se reportan como destacables.
- Capacidades multilingues: exclusivamente japones segun los metadatos del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Experimentacion academica con arquitecturas MoE: el modelo permite estudiar el comportamiento de un MoE de 1,46B con 480M activos en un idioma no ingles, con un coste computacional reducido y pesos abiertos.
- Generacion de texto conversacional en japones para prototipos: puede emplearse como chatbot de demostracion en aplicaciones donde el contexto no supere los 2048 tokens, usando la plantilla de chat incluida.
- Fine-tuning adicional sobre dominios especificos en japones: al ser un modelo pequeno y con licencia no especificada, sirve como punto de partida para ajustes supervisados en tareas concretas (clasificacion, resumen, extraccion) siempre que se aclare la licencia.
- Evaluacion comparativa de modelos japoneses: util como baseline en experimentos con llm-jp-eval frente a modelos como llm-jp-3-440m o la serie tiny-lm-v2.
- Investigacion sobre eficiencia de inferencia: su naturaleza MoE con solo 480M parametros activos lo hace adecuado para medir latencia y throughput en hardware de gama media.
- Educacion y divulgacion: permite ilustrar el funcionamiento de un MoE y de un pipeline SFT completo con datasets publicos en japones.
- Generacion de respuestas en tareas de comprension lectora y NLI en japones, donde obtiene sus mejores resultados relativos dentro de la evaluacion (RC 0,295; NLI 0,542).

## Benchmarks y rendimiento

Resultados en llm-jp-eval v1.4.1 (100 ejemplos del split dev, 4-shot, decodificacion greedy, sin plantilla de chat). El promedio es la media de 10 categorias, excluyendo generacion de codigo.

| Modelo | average | EL | FA | HE | MC | MR | MT | NLI | QA | RC | SUM |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tiny-lm-v3-japanese-1.5b-a500m-base | 0,228 | 0,165 | 0,036 | 0,225 | 0,297 | 0,040 | 0,512 | 0,476 | 0,313 | 0,147 | 0,068 |
| tiny-lm-v3-japanese-1.5b-a500m-sft | 0,234 | 0,042 | 0,038 | 0,205 | 0,283 | 0,040 | 0,583 | 0,542 | 0,239 | 0,295 | 0,069 |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | 0,277 | 0,277 | 0,059 | 0,230 | 0,303 | 0,050 | 0,571 | 0,464 | 0,332 | 0,431 | 0,058 |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft | 0,249 | 0,240 | 0,059 | 0,195 | 0,317 | 0,030 | 0,595 | 0,342 | 0,245 | 0,364 | 0,107 |
| tiny-lm-v1-japanese-500m-base | 0,210 | 0,075 | 0,035 | 0,215 | 0,300 | 0,010 | 0,451 | 0,528 | 0,229 | 0,208 | 0,051 |
| llm-jp/llm-jp-3-440m | 0,264 | 0,223 | 0,057 | 0,285 | 0,320 | 0,050 | 0,620 | 0,508 | 0,277 | 0,267 | 0,029 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,274 | 0,296 | 0,060 | 0,240 | 0,313 | 0,050 | 0,646 | 0,444 | 0,229 | 0,384 | 0,073 |

Categorias: EL (examen linguistico), FA (analisis morfologico), HE (humanidades), MC (matematicas), MR (razonamiento matematico), MT (traduccion), NLI (inferencia de lenguaje natural), QA (preguntas y respuestas), RC (comprension lectora), SUM (resumen). El modelo SFT mejora ligeramente el promedio respecto a su base (0,234 frente a 0,228) y destaca en NLI (0,542) y RC (0,295), pero queda por debajo de llm-jp-3-440m-instruct3 (0,274) en el promedio global.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 2,9-3,2 GB solo para pesos; con overhead de activaciones y cache KV para 2048 tokens, se recomienda al menos 6-8 GB de VRAM.
- En cuantizacion de 8 bits, los pesos ocuparian alrededor de 1,5 GB; en 4 bits, en torno a 0,8-1 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4080, RTX 4090). Tambien es viable en A100, H100 o L4 para despliegue en servidor.
- Cabe en GPU consumer: si, en la mayoria de GPU con 8 GB o mas. En GPU con 4-6 GB podria requerir cuantizacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via oficial. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la implementacion MoE personalizada probablemente requiera adaptaciones para estos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Average llm-jp-eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-lm-v3-japanese-1.5b-a500m-sft | 1,46B totales / 480M activos | 2048 | 0,234 | no disponible | Hugging Face |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | no disponible | 0,274 | no disponible | Hugging Face |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft | 500M | no disponible | 0,249 | no disponible | Hugging Face |
| tiny-lm-v1-japanese-500m-sft | 500M | no disponible | 0,221 | no disponible | Hugging Face |

El modelo v3 SFT mejora a las versiones v1 y v2 de la serie en promedio, pero queda por detras de llm-jp-3-440m-instruct3 pese a tener mas parametros totales, lo que sugiere que la activacion dispersa y el limitado presupuesto de preentrenamiento (10,5B tokens) condicionan su rendimiento. La ventaja principal frente a los modelos de 440-500M es la mayor capacidad total y el vocabulario japones especifico.

## Limitaciones y advertencias

- Ventana de contexto muy limitada (2048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Rendimiento global modesto: promedio de 0,234 en llm-jp-eval, por debajo de modelos mas pequenos como llm-jp-3-440m-instruct3 (0,274).
- Resultados especialmente bajos en EL (0,042) y FA (0,038), lo que indica poca fiabilidad en tareas linguisticas y morfologicas.
- Entrenado exclusivamente en japones; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinacion elevado por el reducido presupuesto de preentrenamiento (10,5B tokens) y el tamano del modelo.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- No se documenta soporte para tool calling, agentes ni cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita su integracion en pipelines de produccion estandar.
- La implementacion MoE personalizada puede no ser compatible con motores de inferencia optimizados como vLLM o TGI sin modificaciones.
- No se han publicado datos sobre sesgos especificos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/tiny-lm-v3-japanese-1.5b-a500m-sft
- Modelo base: https://huggingface.co/nagohachi/tiny-lm-v3-japanese-1.5b-a500m-base
- Dataset llm-jp/magpie-sft-v1.0: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Dataset kanhatakeyama/AutoMultiTurnByCalm3-22B: https://huggingface.co/datasets/kanhatakeyama/AutoMultiTurnByCalm3-22B
- Tokenizador llm-jp/llm-jp-3-440m: https://huggingface.co/llm-jp/llm-jp-3-440m
- Modelo de referencia llm-jp/llm-jp-3-440m-instruct3: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3
- Repositorio llm-jp-eval: https://github.com/llm-jp/llm-jp-eval
- Blog de LLM-jp con resultados de instruct3: https://llm-jp.github.io/blog/2025/02/05/instruct3.html
- Serie tiny-lm-v2 (referencia): https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft
- Serie tiny-lm-v1 (referencia): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
