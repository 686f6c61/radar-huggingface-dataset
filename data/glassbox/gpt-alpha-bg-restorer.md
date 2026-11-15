# glassbox/gpt-alpha-bg-restorer

## Resumen

gpt-alpha-bg-restorer es un modelo de lenguaje de tipo GPT entrenado desde cero (sin inicialización a partir de pesos preentrenados) por el desarrollador independiente glassbox. Su tarea no es la generación de texto libre, sino una transformación determinista y reversible con pérdida: convertir *shlyokavitsa* (texto búlgaro escrito con un teclado latino) de vuelta a cirílico correcto. El problema es real y no se resuelve con una tabla de búsqueda, porque el mapeo latino→cirílico es muchos-a-uno en la dirección inversa: la letra `a` puede corresponder a **а** o a **ъ**, `sh` suele ser **ш** pero a veces es **с**+**х** en un límite de morfema, y `sht`, `ch` o `ya` colapsan en letras cirílicas únicas. El modelo lee la cadena latina y emite cirílico carácter a carácter, resolviendo cada letra por contexto.

El repositorio contiene en realidad dos checkpoints con el mismo vocabulario de 60 caracteres y la misma pila estilo Llama: uno pequeño de 3,16 M de parámetros (256d, 4 capas, 8 cabezas, bloque de contexto 348, frontera de entrenamiento de unas 6 palabras) y uno grande de 4,73 M de parámetros (256d, 6 capas, 8 cabezas, bloque de contexto 688, entrenado hasta 20 palabras). El checkpoint grande es el que se distribuye como `model.safetensors` en la raíz del repo; el pequeño vive en `small/`.

La relevancia actual del modelo no está en su escala, sino en su enfoque: es un corrector lingüístico ultraligero que corre íntegramente en CPU y se distribuye también como WebAssembly, de modo que el texto del usuario nunca abandona el dispositivo. Es un caso de estudio de modelos de juguete entrenados desde cero con objetivos acotados, útil para desarrolladores interesados en inferencia local, privacidad por diseño y análisis de interpretabilidad a nivel de carácter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RoPE, RMSNorm, SwiGLU, weight tying), entrenado desde cero |
| Parametros totales | 4.734.208 (checkpoint grande, `restore_big.pt` / `model.safetensors`); 3.160.000 en el checkpoint pequeño (`small/`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Bloque de 688 tokens (checkpoint grande); bloque de 348 tokens (checkpoint pequeño) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors y PyTorch; no se documentan builds GGUF ni cuantizaciones) |
| Idiomas soportados | búlgaro (`bg`); la entrada es transliteración latina de búlgaro y la salida es cirílico búlgaro |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch state dict (`restore_big.pt`, `restore_ckpt.pt`) y WebAssembly (`restore_big.wasm`, `restorer.wasm`) |

Otras especificaciones del checkpoint grande: dimensión de modelo 256, 6 capas, 8 cabezas de atención, vocabulario de 60 caracteres (latino de entrada, cirílico de salida, separador `=` y terminador de nueva línea), cabeza de salida atada a la embedding de tokens y por tanto almacenada una sola vez. Tamaño del repo: 0,2 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de pila Llama con RoPE, RMSNorm, activación SwiGLU y *weight tying* entre la embedding de tokens y la cabeza de salida. Trabaja a nivel de carácter, no de subpalabra: el vocabulario completo son 60 símbolos que cubren el alfabeto latino de entrada, el cirílico de salida, un separador `=` y un terminador de nueva línea. La generación es autorregresiva carácter a carácter, de modo que cada letra cirílica se decide condicionada por la cadena latina completa y por las letras ya emitidas. El modelo se entrenó desde cero, sin inicialización a partir de pesos preentrenados.

Los pares de entrenamiento se generan a partir de prosa búlgara de terceros que no tiene identificador en el Hub; la model card es explícita en que el conjunto `glassbox/shlyokavitsa-pairs` es el *benchmark* y no datos de entrenamiento, y que el modelo nunca lo vio. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni si hubo fases de RLHF o DPO; el método de entrenamiento se describe únicamente como «el mismo» para ambos checkpoints. La innovación técnica destacable no está en el entrenamiento sino en el despliegue y la evaluación: compilación a WebAssembly con pesos embebidos y una función única expuesta, decodificación restringida (*constrained decoding*) para forzar salidas válidas, y en el checkpoint pequeño una lectura mediante autoencoder disperso y la exposición de pesos de atención y probabilidades por carácter para el laboratorio de interpretabilidad.

## Capacidades

- Restauración de *shlyokavitsa* a cirílico búlgaro correcto, carácter a carácter, con resolución contextual de ambigüedades (`a` → **а** o **ъ**, `sh` → **ш** o **с**+**х**, `sht` → **щ**, `ch` → **ч**, `ya` → **я**).
- Generación de texto a nivel de carácter con decodificación greedy y, opcionalmente, decodificación restringida al vocabulario cirílico de salida.
- Ejecución offline en CPU, sin dependencias externas, mediante builds WebAssembly con pesos embebidos.
- Ejecución en navegador y en Node.js a través de `wasm_exec.js` (glue estándar de Go), con una función global `restore()` y `restoreBig()` para el checkpoint grande.
- Trazabilidad e interpretabilidad en el checkpoint pequeño: `restoreTrace(text)` devuelve la restauración junto con los pesos de atención por paso y las cinco probabilidades de carácter más altas en JSON.
- Carga de pesos en PyTorch y en safetensors con `safetensors.torch.load_file`, sin necesidad del código de entrenamiento ni de pickle.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*; no es un modelo de propósito general.

## Casos de uso

- Normalización de texto de usuario en aplicaciones búlgaras: un formulario, un chat o un campo de búsqueda puede recibir *shlyokavitsa* escrita en teclado latino y devolver cirílico correcto antes de almacenar o indexar, usando el checkpoint grande con decodificación restringida para frases de hasta 20 palabras.
- Preprocesado de corpus y pipelines de NLP en búlgaro: limpiar comentarios, reseñas o mensajes de foros escritos en transliteración latina antes de pasarlos a un modelo mayor o a un indexador, con la ventaja de que el corrector corre en CPU y no requiere GPU.
- Privacidad por diseño en el navegador: integrar `restore_big.wasm` en una aplicación web para que el texto del usuario se convierta en cirílico localmente, sin enviar la cadena original a ningún servidor, algo relevante para mensajería, salud o formularios con datos personales.
- Herramienta de escritorio o extensión de teclado: empaquetar el `.wasm` en una extensión de navegador o en una app de escritorio para ofrecer corrección en línea mientras el usuario escribe en un teclado latino, con latencia de CPU y sin conexión de red.
- Investigación en interpretabilidad de modelos de lenguaje: el checkpoint pequeño, con su lectura por autoencoder disperso y su traza de atención y probabilidades por carácter, sirve para estudiar cómo un transformer pequeño resuelve decisiones locales de desambiguación y para reproducir el laboratorio de interpretabilidad publicado por el autor.
- Enseñanza y experimentación con modelos desde cero: al ser un GPT de 4,7 M de parámetros con arquitectura Llama completa y licencia MIT, es un banco de pruebas asequible para estudiar tokenización a nivel de carácter, decodificación restringida y despliegue en WebAssembly sin coste de GPU.
- Evaluación comparativa de correctores: el conjunto `glassbox/shlyokavitsa-pairs` y el script `restore_eval.py` de `bg-eval` permiten medir *exact match* y tasa de error de carácter de alternativas basadas en reglas o en modelos mayores frente a este modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), sobre `glassbox/shlyokavitsa-pairs` (test construido a partir de Wikipedia búlgara, no visto en entrenamiento), con n = 200 frases por longitud y decodificación greedy:

| Metrica | Valor |
|---|---|
| Exact match a 20 palabras (constrained) | 0,720 |
| Character error rate a 20 palabras (constrained) | 0,0031 |

Exact match por longitud de frase para el modelo de 4,73 M de parámetros:

| Longitud de frase | 3 | 5 | 10 | 15 | 20 | 25 |
|---|---|---|---|---|---|---|
| Exact match, decodificación simple | 0,955 | 0,915 | 0,810 | 0,765 | 0,670 | 0,215 |
| Exact match, decodificación restringida | 0,965 | 0,920 | 0,820 | 0,790 | 0,720 | 0,370 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 4,73 M de parámetros, los pesos en fp32 ocupan aproximadamente 19 MB y en fp16 unos 9,5 MB; el checkpoint pequeño de 3,16 M ocupa aún menos.
- GPU recomendadas: ninguna. El modelo está diseñado para CPU y para ejecución en navegador mediante WebAssembly; cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutaría con una utilización insignificante, sin beneficio práctico frente a CPU.
- Cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos móviles y entornos sin acelerador.
- Opciones de despliegue: builds WebAssembly (`restore_big.wasm`, `restorer.wasm`) en navegador o Node.js con `wasm_exec.js`; carga de pesos en PyTorch o safetensors desde Python; script de evaluación `restore_eval.py` del repositorio `bg-eval`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada. Por el tamaño del modelo y el carácter por carácter de la generación, la latencia esperada es de milisegundos en CPU para frases de hasta 20 palabras, pero no se aporta una medición concreta.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables con datos verificables de parámetros, contexto o rendimiento. La comparación cualitativa con alternativas habituales para la misma tarea es la siguiente:

| Alternativa | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gpt-alpha-bg-restorer (4,73 M) | GPT carácter a carácter entrenado desde cero | Bloque de 688 tokens | MIT | Pesos en safetensors, PyTorch y WebAssembly en Hugging Face |
| Tabla de búsqueda latín→cirílico | Reglas deterministas | No aplica | No aplica | Trivial de implementar |
| Modelo de lenguaje grande de propósito general | Generación de texto general | Miles de tokens | Variable | Requiere GPU o API externa |

La tabla de búsqueda no puede resolver la ambigüedad muchos-a-uno del mapeo (`a` → **а**/**ъ**, `sh` → **ш**/**с**+**х**) y falla sistemáticamente en esos casos. Un modelo grande de propósito general puede restaurar el texto, pero con un coste de cómputo, latencia y exposición de datos incomparablemente mayor para una tarea de transformación acotada. No se dispone de cifras de rendimiento de estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en búlgaro escrito en transliteración latina; no es un modelo de propósito general y no debe usarse para generación de texto libre, razonamiento, código ni otras tareas.
- El rendimiento cae con la longitud: el *exact match* con decodificación restringida baja de 0,965 a 3 palabras a 0,720 a 20 palabras y a 0,370 a 25 palabras; para frases largas la fiabilidad es limitada.
- La frontera de entrenamiento del checkpoint grande es de 20 palabras; el pequeño solo está entrenado hasta unas 6 palabras y no debe usarse para restauración de frases completas.
- Riesgo de alucinación a nivel de carácter: al decidir cada letra por contexto, puede producir una palabra cirílica plausible pero incorrecta, especialmente en nombres propios, préstamos y términos fuera del dominio de la prosa de Wikipedia usada para generar los pares.
- Los resultados de benchmarks son declarados por el autor y están marcados como no verificados (`verified: false`); no se han confirmado de forma independiente.
- Sesgos conocidos: no se documentan en la información disponible; el corpus de entrenamiento procede de prosa búlgara de terceros y puede arrastrar los sesgos de esa fuente.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni compromiso de mantenimiento.
- El repositorio tiene un volumen de descargas muy bajo (11) y ningún *like*, por lo que la validación por parte de la comunidad es prácticamente inexistente; conviene evaluarlo con `bg-eval` sobre datos propios antes de usarlo en producción.
- No se documentan cuantizaciones ni formatos GGUF, de modo que las opciones de despliegue se limitan a WebAssembly, PyTorch y safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glassbox/gpt-alpha-bg-restorer
- Space de demostración (modelo de 3,16 M con decodificación restringida): https://huggingface.co/spaces/glassbox/shlyokavitsa-restorer
- Laboratorio de interpretabilidad: https://restorer-interp-lab.iksnerd.workers.dev
- Demostración del modelo de 4,73 M: https://restorer-interp-lab.iksnerd.workers.dev/restorer-scaling
- Post-mortem de una ejecución fallida: https://restorer-interp-lab.iksnerd.workers.dev/trace/restorer-fail
- Conjunto de evaluación: https://huggingface.co/datasets/glassbox/shlyokavitsa-pairs
- Repositorio de evaluación `bg-eval`: https://github.com/iksnerd/bg-eval
