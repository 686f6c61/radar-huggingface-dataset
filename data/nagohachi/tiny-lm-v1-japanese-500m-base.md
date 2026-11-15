# nagohachi/tiny-lm-v1-japanese-500m-base

## Resumen
tiny-lm-v1-japanese-500m-base es un modelo de lenguaje en japones de aproximadamente 480 millones de parametros, desarrollado por el usuario nagohachi y entrenado desde cero sobre unos 10.000 millones de tokens de texto web educativo en japones. Se publica como modelo base, sin ajuste por instrucciones ni plantilla de chat, y forma parte de una familia que incluye variantes SFT y DPO.

El modelo emplea una implementacion propia de estilo Llama (etiquetada como `scratch_llama`) que requiere `trust_remote_code=True`, con una longitud de contexto de 2048 tokens y un vocabulario de 99.574 entradas tomado del tokenizador de llm-jp-3-440m. Su relevancia radica en ser un ejemplo de entrenamiento desde cero a escala pequena y con recursos limitados, util para investigacion sobre modelos compactos en japones y como base para experimentos de ajuste fino.

Al ser un modelo base de menos de 500 millones de parametros, su rendimiento en tareas de comprension y generacion es modesto: obtiene una media de 0,198 en llm-jp-eval v2.1.5, por debajo de los modelos llm-jp-3-440m e llm-jp-3-440m-instruct3. Esta pensado como punto de partida para investigacion y para tareas de continuacion de texto, no como asistente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de estilo Llama (implementacion propia, `scratch_llama`, requiere `trust_remote_code=True`) |
| Parametros totales | 479.501.312 (aprox. 480M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Vocabulario | 99.574 tokens |
| Tokenizador | llm-jp/llm-jp-3-440m |
| Tamano del repositorio | 1,0 GB |
| Libreria | transformers |
| Dataset de entrenamiento | hotchpotch/fineweb-2-edu-japanese (`sample_10BT`) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de estilo Llama con una implementacion personalizada incluida en el repositorio, lo que obliga a cargarlo con `trust_remote_code=True`. Cuenta con 480 millones de parametros y un vocabulario de 99.574 tokens heredado del tokenizador de llm-jp-3-440m, lo que facilita la comparacion con la familia llm-jp.

El entrenamiento se realizo desde cero sobre aproximadamente 10.000 millones de tokens del subconjunto `sample_10BT` del dataset hotchpotch/fineweb-2-edu-japanese, compuesto por texto web educativo en japones. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion para esta variante base; las variantes SFT y DPO se publican por separado. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Generacion de texto en japones mediante continuacion de prompt (modelo base, sin plantilla de chat).
- Razonamiento basico y respuesta a preguntas en japones, con rendimiento limitado segun los resultados de llm-jp-eval.
- Tareas de clasificacion y comprension en japones evaluadas en el harness llm-jp-eval: comprension lectora (RC), analisis de sentimiento implícito (NLI), traduccion (MT), correferencia (CR), extraccion de entidades (EL), respuesta a preguntas (QA) y humanidad/fluidez (HE-JA, HE-EN).
- Capacidad limitada de generacion de codigo (HE-EN y HE-JA con puntuaciones bajas: 0,207 y 0,130 respectivamente).
- No dispone de soporte nativo de tool calling ni function calling documentado.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- Capacidades multilingues limitadas al japones; el tag de idioma declarado es unicamente `ja`.

## Casos de uso
- Investigacion sobre modelos compactos en japones: sirve como base reproducible para estudiar el efecto del tamano, los datos y el numero de tokens en modelos de menos de 500M de parametros, dado que se entrena desde cero sobre un dataset publico identificado.
- Punto de partida para ajuste fino supervisado: al ser un modelo base, es adecuado para aplicar SFT o DPO propios y comparar con las variantes tiny-lm-v1-japanese-500m-sft y -dpo publicadas por el autor.
- Continuacion de texto en japones: puede emplearse para completar fragmentos, generar parrafos descriptivos o experimentar con prompts de continuacion, siempre con decodificacion muestreada (temperatura y top-p) y sin esperar instrucciones complejas.
- Experimentos de tokenizacion: su vocabulario de 99.574 tokens procedente de llm-jp-3-440m permite estudiar el comportamiento de un tokenizador grande en un modelo pequeno y comparar la eficiencia de tokens en japones.
- Evaluacion comparativa con llm-jp-eval: sirve como baseline adicional en el harness llm-jp-eval v2.1.5 para contrastar modelos de tamano similar en tareas japonesas.
- Docencia y prototipado de bajo coste: al ocupar alrededor de 1 GB en pesos y caber en GPUs de consumo, es util para demostraciones de entrenamiento e inferencia de modelos de lenguaje en entornos con recursos limitados.
- Generacion de datos sinteticos a pequena escala en japones: puede producir texto de dominio general para aumentar datasets de experimentacion, con revision humana obligatoria por la calidad limitada del modelo.

## Benchmarks y rendimiento
Resultados en llm-jp-eval v2.1.5 con 100 ejemplos del split de test y decodificacion greedy. Los modelos base usan configuracion de 4-shot; los modelos SFT/DPO y el baseline instruct se evaluan a traves de su plantilla de chat.

| Modelo | average | CR | EL | FA | HE-EN | HE-JA | MR | MT | NLI | QA | RC |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tiny-lm-v1-japanese-500m-base | 0,198 | 0,223 | 0,130 | 0,035 | 0,207 | 0,130 | 0,007 | 0,504 | 0,483 | 0,072 | 0,190 |
| tiny-lm-v1-japanese-500m-sft | 0,191 | 0,310 | 0,102 | 0,036 | 0,187 | 0,070 | 0,013 | 0,523 | 0,380 | 0,082 | 0,210 |
| tiny-lm-v1-japanese-500m-dpo | 0,194 | 0,310 | 0,130 | 0,036 | 0,187 | 0,070 | 0,013 | 0,531 | 0,345 | 0,082 | 0,240 |
| llm-jp/llm-jp-3-440m | 0,249 | 0,280 | 0,266 | 0,059 | 0,170 | 0,080 | 0,027 | 0,760 | 0,525 | 0,144 | 0,180 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,254 | 0,317 | 0,289 | 0,066 | 0,223 | 0,110 | 0,017 | 0,744 | 0,520 | 0,155 | 0,100 |

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (480M parametros), mas overhead de activaciones y cache KV; en la practica, alrededor de 1,5-2 GB para contexto de 2048 tokens.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,5-0,6 GB para pesos; en 4 bits, alrededor de 0,3-0,4 GB. No se documentan cuantizaciones oficiales en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para bfloat16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo es sobradamente pequeno para GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM, e incluso en CPU para inferencia en bfloat16 o cuantizada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la implementacion personalizada puede requerir adaptaciones para esos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | average llm-jp-eval |
| :--- | ---: | ---: | :--- | :--- | ---: |
| tiny-lm-v1-japanese-500m-base | 480M | 2048 | ja | no disponible | 0,198 |
| llm-jp/llm-jp-3-440m | 440M | no disponible | no disponible | no disponible | 0,249 |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | no disponible | no disponible | no disponible | 0,254 |
| tiny-lm-v1-japanese-500m-sft | 480M | 2048 | ja | no disponible | 0,191 |
| tiny-lm-v1-japanese-500m-dpo | 480M | 2048 | ja | no disponible | 0,194 |

El modelo base queda por debajo de llm-jp-3-440m en la media global (0,198 frente a 0,249), aunque supera al baseline en NLI (0,483 frente a 0,525 no; en este caso queda por debajo) y en RC (0,190 frente a 0,180). Destaca negativamente en traduccion (MT, 0,504 frente a 0,760) y en extraccion de entidades (EL, 0,130 frente a 0,266).

## Limitaciones y advertencias
- Modelo base sin ajuste por instrucciones ni plantilla de chat: no debe usarse directamente como asistente conversacional; para ello existen las variantes SFT y DPO.
- Rendimiento global bajo en llm-jp-eval (0,198 de media), con puntuaciones especialmente bajas en MR (0,007), FA (0,035) y QA (0,072).
- Capacidad multilingue practicamente nula: solo declara japones y su rendimiento en tareas en ingles (HE-EN, 0,207) es limitado.
- Contexto corto de 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo elevado de alucinacion y de generar texto incoherente o repetitivo por su tamano reducido y su entrenamiento exclusivamente sobre texto web educativo.
- Sesgos potenciales derivados del corpus fineweb-2-edu-japanese, que no se documentan en la informacion disponible.
- Licencia no disponible: no se puede confirmar el uso comercial; es necesario contactar con el autor antes de utilizarlo en produccion.
- Requiere `trust_remote_code=True` por la implementacion personalizada, lo que implica ejecutar codigo del repositorio y anade riesgo de seguridad y de compatibilidad con versiones futuras de transformers.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Variante SFT: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
- Variante DPO: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-dpo
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Tokenizador de referencia: https://huggingface.co/llm-jp/llm-jp-3-440m
- Baseline llm-jp-3-440m: https://huggingface.co/llm-jp/llm-jp-3-440m
- Baseline llm-jp-3-440m-instruct3: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3
