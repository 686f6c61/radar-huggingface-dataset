# iapp/OpenThai-SystemOne-Vision-GGUF

## Resumen

OpenThai-SystemOne-Vision GGUF es la distribucion cuantizada para llama.cpp del modelo iapp/OpenThai-SystemOne-Vision v1.4, un modelo de decision "System One" bilingue thai-ingles de 0,86B parametros (1.006.715.712 parametros totales segun safetensors) desarrollado por iApp Technology dentro del proyecto OpenThaiGPT. A diferencia de un modelo generativo convencional, responde preguntas tipadas sobre un estado dado -con o sin captura de pantalla- en un unico forward pass y sin generar texto, devolviendo la opcion elegida y una probabilidad por cada opcion.

El modelo resuelve el problema del control de interfaces por agentes de computer use: en lugar de pedir a un LLM que genere texto describiendo que hacer, se le plantea una pregunta de eleccion multiple sobre los controles disponibles en pantalla y el modelo puntua cada opcion. Esta version GGUF esta pensada para servirse con llama-server mediante el endpoint `/v1/systemone`, con el layout de prompt embebido en el propio GGUF.

La relevancia actual esta en su enfoque: un modelo pequeno (sub-1B), con licencia Apache-2.0, que evita la generacion autoregresiva para tareas de decision y esta optimizado para thai e ingles, un par de idiomas poco cubierto en herramientas de automatizacion de escritorio. La cuantizacion Q8_0 del tower de texto y F16 del tower de vision permite ejecutarlo en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tower de texto + tower de vision con merger) con cabecera de decision tipo slot head; construido sobre Qwen3.5-0.8B-Base |
| Parametros totales | 1.006.715.712 (0,86B segun el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama-server con `-c 32768`) |
| Tipos de cuantizacion | Q8_0 para el tower de texto con readout de decision; F16 para el tower de vision y merger |
| Idiomas soportados | Thai (th) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors/PyTorch |

## Arquitectura y entrenamiento

El modelo es multimodal image-text-to-text: combina un tower de texto derivado de Qwen3.5-0.8B-Base con un tower de vision y un merger que proyecta las representaciones visuales al espacio del texto. Sobre esa base se anade una cabecera de decision (slot head) que produce una fila por etiqueta de opcion, junto con temperaturas por tipo de pregunta. El resultado es un modelo que no decodifica texto: en un solo forward pass puntua cada opcion candidata y devuelve la elegida mas su probabilidad.

Soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (si/no, solo con instrucciones) y `score` (criterios como lista de 2 a 10 nombres de nivel). El prompt layout esta embebido en el GGUF, de modo que el cliente envia la peticion tal cual al endpoint `/v1/systemone` de llama-server. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; el autor menciona que la siguiente revision se entrenara especificamente para mejorar la deteccion de la opcion `none`.

## Capacidades

- Decision sobre estados: responde preguntas de eleccion multiple sobre un estado textual (`os`, `app`, `goal`) con o sin captura de pantalla.
- Preguntas de tipo `choice` con hasta 255 opciones, devolviendo opcion elegida y probabilidad por opcion.
- Preguntas de tipo `noul` (si/no) y `score` (puntuacion en 2 a 10 niveles).
- Computer use sin cabecera de puntero: selecciona controles de interfaz a partir de listas de controles obtenidas por la API de accesibilidad del sistema operativo.
- Comprension de imagenes cuando la peticion incluye screenshot (tower de vision en F16).
- Bilinguismo thai-ingles, con rendimiento medido en comandos en ambos idiomas.
- Integracion con llama.cpp mediante `llama-server` y endpoint dedicado `/v1/systemone`.
- Sin generacion de texto: no es un modelo conversacional generalista ni soporta tool calling generativo.

## Casos de uso

- Automatizacion de escritorio en Windows: la aplicacion lee los controles de la ventana activa via API de accesibilidad, construye la lista de opciones en orden de lectura y pregunta al modelo que control activar para cumplir el objetivo; el autor reporta un 99 % de acierto cuando el comando nombra el control tal cual aparece en pantalla.
- Asistentes de voz o chat en thai para control de aplicaciones: el modelo entiende comandos naturales en thai (`กดปุ่ม Save`) con un 86 % de acierto sobre etiquetas en ingles, adecuado para interfaces de usuario tailandesas.
- Automatizacion en macOS: con listas de controles y `os: macos`, el modelo eligio el control nombrado en el comando el 99 % de las veces sobre 560 objetivos de prueba.
- Clasificacion de acciones en pipelines de agentes: al devolver probabilidades por opcion, permite umbrales de confianza y escalado a intervencion humana cuando la certeza es baja.
- Puntuacion de estados o pantallas: el tipo `score` con 2 a 10 niveles sirve para evaluar calidad de un estado de aplicacion o progreso hacia un objetivo.
- Verificaciones si/no en flujos de validacion: el tipo `noul` permite comprobaciones binarias rapidas (por ejemplo, si una ventana concreta esta abierta) dentro de un bucle de agente.
- Despliegue en entornos con recursos limitados: al ser un modelo sub-1B cuantizado, puede servirse en estaciones de trabajo sin GPU de gama alta para prototipos de automatizacion.

## Benchmarks y rendimiento

El autor publica tasas de acierto medidas con los pesos PyTorch sobre pantallas propias de Windows 11 (unos 1.650 objetivos, listas de hasta 120 controles, sin screenshot), indicando que esta build GGUF eligio las mismas opciones en sus comprobaciones:

| Escenario | Acierto |
|---|---|
| Comando que nombra el control tal cual, en ingles o tras verbo thai | 99 % |
| Frase natural en ingles | 96 % |
| Frase natural en thai con etiquetas en ingles en pantalla | 86 % |
| Listas de controles macOS (560 objetivos, `os: macos`) | 99 % |
| Casos en que el objetivo no esta en pantalla y se responde `none` | 8-15 % (debilidad conocida) |

Linux usa el mismo formato pero no esta medido. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el tower de texto Q8_0 ocupa 1.320.471.072 bytes (unos 1,23 GiB) y el tower de vision F16 204.986.656 bytes (unos 195 MiB); en total, alrededor de 1,5 GB de pesos, mas overhead de contexto y cache KV.
- El ejemplo del autor usa `-ngl 99`, es decir, offload completo de capas a GPU; con contexto de 32.768 tokens y `--parallel 4` el consumo de cache KV aumenta de forma proporcional.
- Cabe en GPU de consumo: cualquier GPU con 4-6 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4090) deberia alojarlo con holgura; tambien puede ejecutarse en CPU.
- Despliegue mediante llama.cpp (`llama-server`), probado con el build b12242; requiere el fichero `mmproj` solo cuando la peticion incluye imagen.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de un unico forward pass sin generacion autoregresiva, la latencia por decision es estructuralmente baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne-Vision GGUF | 0,86B | 32.768 | Decision tipada multimodal thai/ingles | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B-Base | 0,8B | no disponible | LLM generativo base | no disponible | safetensors |
| LLMs generativos para computer use (p. ej. familias tipo UI-TARS) | no disponible | no disponible | Generacion de acciones de texto | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la comparativa se limita a la relacion con su modelo base y al enfoque diferencial (decision por forward pass frente a generacion autoregresiva).

## Limitaciones y advertencias

- Debilidad conocida: cuando el objetivo no esta en pantalla, el modelo rara vez responde `none` (solo 8-15 % de esos casos) y elige un control con alta probabilidad; el autor recomienda validar en la aplicacion que el control elegido guarda relacion con el comando y preguntar al usuario si no es asi.
- Esta build no incluye cabecera `point`, por lo que no puede devolver coordenadas de clic; el clic debe resolverse mapeando la opcion elegida a un control de la lista.
- Cobertura limitada a thai e ingles; no se documenta soporte de otros idiomas.
- Rendimiento en Linux no medido.
- No es un modelo conversacional ni generativo: no soporta tool calling generativo, razonamiento multi-paso explicito ni generacion de texto libre.
- Riesgo de sesgo en los datos de entrenamiento no documentado; no se publica composicion del dataset.
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte que las revisiones se publican como nuevos commits, por lo que conviene fijar el commit probado en produccion.
- El endpoint `/v1/systemone` requiere un build de llama.cpp que lo soporte (probado con b12242); builds mas antiguos no serviran el modelo correctamente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-Vision-GGUF
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne-Vision
- Proyecto OpenThaiGPT / iApp Technology: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Repositorio de llama.cpp: no disponible en la informacion proporcionada
