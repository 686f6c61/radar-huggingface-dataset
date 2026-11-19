# dsego/tempus-qwen3.5-0.8b

## Resumen

tempus-qwen3.5-0.8b es un ajuste fino de Qwen/Qwen3.5-0.8B especializado en una única tarea: extraer las horas de reloj mencionadas en un mensaje de chat en inglés y resolver, a partir del contexto, si una hora escueta como "7" se refiere a la mañana o a la tarde. El modelo devuelve una línea `texto=HH:MM` por cada hora encontrada, con el texto copiado literalmente del mensaje, o la palabra `none` si no hay ninguna. Lo desarrolla el usuario dsego como parte del proyecto tempus, que incluye variantes de 230M y 2B parámetros; esta es la opción intermedia en precisión y tamaño.

El modelo parte de una arquitectura transformer de 772.845.888 parámetros (aproximadamente 0,8B) y se distribuye exclusivamente en formato GGUF para llama.cpp, con cuantizaciones Q4_K_M y Q8_0, además de una variante con vocabulario recortado para reducir la descarga en navegador. Su relevancia práctica está en el nicho: es una pieza de preprocesado determinista, barata y ejecutable en local (incluso en WebAssembly dentro de una pestaña del navegador) para normalizar expresiones temporales antes de pasarlas a un sistema mayor.

No es un modelo conversacional generalista: el autor recomienda enviar el mensaje como un único turno de usuario, sin system prompt, con el modo de razonamiento desactivado y decodificación greedy. La licencia es Apache 2.0, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-0.8B, ajuste fino con LoRA) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); variante "trim" en Q4_K_M con vocabulario recortado |
| Idiomas soportados | en (inglés únicamente) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos base en safetensors según metadatos del repo |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA de rango 16 sobre Qwen/Qwen3.5-0.8B, realizado con Unsloth durante 3 épocas sobre 11.299 mensajes sintéticos. Tras el entrenamiento, los adaptadores se fusionaron con los pesos base y se convirtieron a GGUF. La configuración exacta está en `configs/qwen3.5-0.8b-v2-s0-compact.yaml` del repositorio del proyecto. No se incluye el componente de visión del modelo base: es un modelo exclusivamente de texto.

El prompt de inferencia es fijo y minimalista: un turno de usuario delimitado por `<|im_start|>user ... <|im_end|>` seguido de `<|im_start|>assistant` con un bloque `<think>` vacío, lo que desactiva el razonamiento explícito. La salida esperada es una línea `text=HH:MM` por hora detectada o `none`. Los datos de entrenamiento y evaluación son sintéticos, generados y verificados por modelos de lenguaje con una revisión humana puntual, lo que constituye una limitación explícita del autor.

## Capacidades

- Extracción de horas de reloj en mensajes de chat en inglés, devolviendo el fragmento textual exacto y su lectura en formato de 24 horas.
- Resolución contextual de horas ambiguas: distingue si un "7" desnudo corresponde a mañana o tarde según la situación descrita en el mensaje.
- Reconocimiento de las formas "noon" y "midnight" además de horas escritas con dígitos.
- Descarte deliberado de duraciones, tiempos relativos y periodos vagos, que ignora por diseño.
- Salida estructurada y verificable: el cliente puede validar que cada línea contiene una hora válida y descartar respuestas malformadas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; tampoco visión ni audio.
- Capacidad multilingüe: ninguna más allá del inglés.

## Casos de uso

- Normalización de agendas en asistentes de mensajería: antes de crear un evento de calendario, el modelo convierte "dinner at 7" en `7=19:00` para que el sistema de agenda reciba una hora inequívoca en formato de 24 horas.
- Preprocesado en pipelines de NLP sobre historiales de chat: se ejecuta sobre cada mensaje para etiquetar menciones temporales y alimentar un extractor de eventos posterior, con la ventaja de que la salida es un formato fijo y fácil de parsear.
- Ejecución en el navegador: la variante trim en Q4_K_M (448 MB) permite desplegar la extracción de horas mediante el build WebAssembly de llama.cpp sin enviar el texto del usuario a un servidor; el autor advierte que el estado guardado del prompt llena la memoria tras unas 80 respuestas y su demo reinicia el worker cada 16.
- Moderación y enrutado de mensajes: detectar si un mensaje contiene una cita horaria concreta para dirigirlo a un flujo de recordatorios en lugar de a un asistente general.
- Extracción de features para modelos mayores: usar la salida como señal estructurada que se inyecta en el contexto de un LLM de mayor tamaño, reduciendo el coste de que este resuelva la ambigüedad temporal por sí mismo.
- Servicio de bajo coste en CPU: con una latencia mediana de 340 ms en 4 núcleos de un Ryzen 3600 para Q4_K_M, es viable en un servicio compartido sin GPU para volúmenes moderados; para presupuestos de 100 ms en CPU el autor remite a la variante de 230M.

## Benchmarks y rendimiento

Resultados publicados por el autor (mejor de tres ejecuciones, elegido con las mismas evaluaciones; la media de las tres ejecuciones está en la columna derecha):

| Evaluacion | Q4_K_M | Q8_0 | Media de tres ejecuciones (Q8_0) |
|---|---|---|---|
| Principal (530 mensajes) | 97,0% | 97,2% | 96,7% |
| Principal, hora del día implícita solo por la situación | 91,5% | 92,1% | 90,6% |
| Nueva (378 mensajes de situaciones no vistas en entrenamiento) | 98,4% | 98,4% | 98,1% |
| Nueva, hora del día implícita solo por la situación | 95,5% | 95,5% | 94,8% |
| Respuestas erróneas en 1.021 mensajes sin hora de reloj | 7 (0,7%) | 8 (0,8%) | 0,6% |
| Latencia CPU, mediana, 4 núcleos de Ryzen 3600 compartido | 340 ms | 421 ms | 413 ms |
| Latencia GPU, mediana, RTX 3090 | 39 ms | 40 ms | 41 ms |

La métrica es coincidencia exacta por mensaje: todas las horas encontradas, con el span correcto y la lectura en 24 horas correcta. La variante trim obtiene 97,0% en la evaluación principal con respuestas idénticas al Q4_K_M sin recortar, 98,1% en la evaluación nueva y 5 respuestas erróneas (0,5%) en los mensajes sin hora. Aproximadamente la mitad de las respuestas erróneas en mensajes sin hora no son horas válidas (por ejemplo, `35=35:00` para "it's 35 degrees out"), de modo que un cliente que valide la respuesta las descarta.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para Q4_K_M (542 MB de fichero) y para Q8_0 (834 MB); la variante trim ocupa 448 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el autor reporta 39-41 ms de latencia mediana en una RTX 3090.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Despliegue: llama.cpp (probado en el tag b12292) mediante `llama-server`; también build WebAssembly de llama.cpp para navegador.
- Latencia: 340 ms (Q4_K_M) y 421 ms (Q8_0) de mediana en CPU con 4 núcleos de un Ryzen 3600 compartido; 39-40 ms en RTX 3090. No se publica throughput (tokens/s).
- Configuración obligatoria: temperatura 0 (greedy), sin system prompt, un único turno de usuario y modo de razonamiento desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tempus-qwen3.5-0.8b | 772.845.888 | no disponible | Extracción de horas en inglés | Apache 2.0 | GGUF en Hugging Face |
| tempus-lfm2.5-230m | no disponible (230M según el nombre) | no disponible | Extracción de horas en inglés; pensado para presupuesto de 100 ms en CPU | no disponible en la información proporcionada | Hugging Face (dsego/tempus-lfm2.5-230m) |
| tempus (variante 2B) | no disponible (2B según la model card) | no disponible | Extracción de horas en inglés; mayor precisión en situaciones desconocidas según el autor | no disponible en la información proporcionada | Referenciado en la model card, sin enlace |
| Qwen/Qwen3.5-0.8B | 0,8B (modelo base) | no disponible | Modelo generalista multimodal (incluye visión) | Apache 2.0 (según la licencia del derivado) | Hugging Face |

No se dispone de datos de benchmarks de las variantes 230M y 2B en la información proporcionada, por lo que no es posible comparar rendimiento numéricamente entre ellas.

## Limitaciones y advertencias

- Solo inglés: cualquier mensaje en otro idioma queda fuera del ámbito soportado.
- Solo reconoce horas escritas con dígitos, además de "noon" y "midnight"; las horas escritas con letras no están soportadas.
- Ignora por diseño duraciones, tiempos relativos y periodos vagos, lo que puede sorprender si se espera una interpretación más amplia.
- Los datos de entrenamiento y evaluación son sintéticos, redactados y verificados por modelos de lenguaje con una revisión humana puntual; el rendimiento en dominios reales puede diferir.
- Riesgo de falsos positivos en mensajes sin hora: 0,7-0,8% de respuestas erróneas en la evaluación de 1.021 mensajes sin hora, aproximadamente la mitad de ellas con formato de hora inválido; es recomendable validar la salida en el cliente.
- El modelo no es conversacional ni generalista: usarlo fuera del prompt y la configuración previstos (sin system prompt, greedy, thinking desactivado) degrada la calidad.
- En el build WebAssembly de llama.cpp, los estados guardados del prompt llenan la memoria tras unas 80 respuestas; hay que reiniciar el worker periódicamente.
- Licencia Apache 2.0, que permite uso comercial sin restricciones adicionales conocidas; conviene verificar igualmente los términos del modelo base Qwen3.5-0.8B.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta: es un artefacto reciente y sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsego/tempus-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante de 230M: https://huggingface.co/dsego/tempus-lfm2.5-230m
- Repositorio del proyecto (código, datos y resultados): https://github.com/dsegovia90/tempus_finetune
- llama.cpp: https://github.com/ggml-org/llama.cpp
