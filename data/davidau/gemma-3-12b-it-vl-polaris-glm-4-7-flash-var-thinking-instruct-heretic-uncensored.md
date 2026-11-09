# DavidAU/gemma-3-12b-it-vl-Polaris-GLM-4.7-Flash-VAR-Thinking-Instruct-Heretic-Uncensored

## Resumen

El modelo `gemma-3-12b-it-vl-Polaris-GLM-4.7-Flash-VAR-Thinking-Instruct-Heretic-Uncensored` es un ajuste fino (fine-tune) del modelo multimodal Gemma 3 12B de Google, publicado por el usuario DavidAU en Hugging Face. Se construye sobre la variante Heretic de DreamFast (una version con censura reducida mediante la tecnica de abliteration) y se entrena con dos conjuntos de datos: el dataset de razonamiento de GLM 4.7 Flash y el dataset no-razonador Polaris, ambos de TeichAI.

El modelo resuelve un problema concreto: ofrece una variante de Gemma 3 12B sin rechazos (refusals) y con capacidad de razonamiento activable dinamicamente segun las palabras clave del prompt. La combinacion de ambos datasets genera un modelo etiquetado como "VAR" (variable), que alterna entre modo instruct y modo thinking segun el contexto de la peticion, sin necesidad de una plantilla de chat especial en la mayoria de los casos.

Arquitectura Gemma 3 (transformer multimodal) con 12.187.325.040 parametros, contexto declarado de 128k tokens, licencia Apache 2.0 y pesos en safetensors (bfloat16). El repositorio ocupa 24,4 GB y esta orientado a generacion creativa de ficcion y usos generales sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) |
| Parametros totales | 12.187.325.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (segun el autor) |
| Tipos de cuantizacion | no disponible (repo en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `DreamFast/gemma-3-12b-it-heretic`, una version de Gemma 3 12B Instruction sometida a tecnicas de abliteration (eliminacion de direcciones de rechazo) mediante el software Heretic. Sobre esa base, DavidAU aplica un fine-tune con Unsloth en hardware local (Linux) usando dos datasets de TeichAI: `glm-4.7-2000x` (razonamiento) y `polaris-alpha-1000x` (no razonador). El autor indica que la mezcla produce un modelo mas solido en general, con Polaris ligeramente mas fuerte y una estructura diferenciada.

La innovacion principal es el comportamiento "VAR" (variable): el modelo alterna entre modo instruct y modo thinking segun las palabras clave del prompt, sin requerir plantilla especial. Basta con usar "think deeply: prompt" para forzar razonamiento, o aplicar un system prompt especifico. Tambien se incluye una plantilla Jinja opcional (`chat-template-thinking.jinja`) para activar thinking de forma sistemica. El razonamiento declarado es compacto pero muy detallado, y afecta a la operacion general, la generacion de salida, el procesamiento de imagenes y los benchmarks. La temperatura declarada oscila entre 0,1 y 2,5, y el autor afirma que el razonamiento es estable frente a la temperatura.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento activable (modo thinking) mediante palabras clave o system prompt.
- Procesamiento de imagenes y texto (pipeline image-text-to-text heredado de Gemma 3).
- Generacion creativa: ficcion, narrativa, tramas y sub-tramas, continuacion de escenas, todos los generos.
- Generacion de contenido sin censura (refusals reducidos), incluyendo contenido explicito, insultos y horror, con direccion explicita en algunos casos.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes o multi-step reasoning estructurado mas alla del thinking mode.
- Capacidad multilingue limitada al ingles (language: en).
- No se documentan capacidades de audio.

## Casos de uso

- Generacion de ficcion larga: el modelo puede producir narrativa coherente de genero (ciencia ficcion, romance, terror) con contexto de hasta 128k tokens, util para novelas por entregas o sagas con continuidad argumental.
- Escritura creativa asistida: redaccion de prosa vivida, descripciones de escenas y dialogos, con activacion de thinking para tramas complejas mediante "think deeply: ...".
- Continuacion de escenas y sub-tramas: dado un fragmento previo, el modelo mantiene el tono y el hilo narrativo gracias a la ventana de contexto extendida.
- Generacion de contenido maduro o explicito para proyectos de ficcion adulta: al estar abliterated, no rechaza peticiones de contenido grafico si se le indica el vocabulario o el tono deseado.
- Descripcion de imagenes con razonamiento: al heredar la multimodalidad de Gemma 3, puede analizar imagenes y generar texto descriptivo o narrativo a partir de ellas.
- Prototipado de asistentes conversacionales sin restricciones: util en entornos de investigacion sobre seguridad y alineacion, donde se necesita un modelo que no aplique filtros por defecto.
- Generacion de guiones y dialogos para videojuegos o medios interactivos: la combinacion de thinking mode y contexto largo permite mantener consistencia de personajes a lo largo de sesiones extensas.

## Benchmarks y rendimiento

Resultados publicados por el autor (Nightmedia) frente a la base Heretic sin fine-tune:

| Benchmark | Este modelo | Base Heretic |
|---|---|---|
| ARC Challenge | 0,597 | 0,534 |
| ARC Easy | 0,796 | 0,699 |
| BoolQ | 0,877 | 0,872 |
| HellaSwag | 0,720 | 0,603 |
| OpenBookQA | 0,466 | 0,448 |
| PIQA | 0,798 | 0,733 |
| Winogrande | 0,704 | 0,658 |

Metricas de des-censura (Heretic):

| Metrica | Este modelo | google/gemma-3-12b-it |
|---|---|---|
| Divergencia KL | 0,0826 | 0 (por definicion) |
| Rechazos | 7/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 24-26 GB solo para los pesos, mas overhead de activaciones y cache KV para 128k de contexto.
- VRAM estimada en cuantizacion 4-bit: aproximadamente 7-8 GB de pesos, con margen adicional para contexto largo.
- GPU recomendadas: A100 40/80 GB, H100, o multiples RTX 4090 (24 GB) para bfloat16 con contexto completo. Una RTX 4090 unica puede ejecutar el modelo en 4-bit con contexto reducido.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) solo con cuantizacion de 4 bits y limitando la longitud de contexto.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en principio llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque no se documentan en el repo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo | 12,19B | 128k | Apache 2.0 | Fine-tune abliterated con thinking variable, solo ingles |
| google/gemma-3-12b-it | 12B | 128k (nativo) | Gemma Terms | Base original, censura estandar (98/100 rechazos) |
| DreamFast/gemma-3-12b-it-heretic | 12B | 128k | Apache 2.0 | Base Heretic sin fine-tune de razonamiento, benchmarks inferiores |
| DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-Polaris-Thinking-Heretic-Uncensored | 12B | 128k | Apache 2.0 | Variante "full thinking" del mismo autor, sin modo variable |

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos de 12B, agravado por el fine-tune en datos sinteticos de razonamiento.
- La abliteration reduce los rechazos a 7/100, lo que implica que el modelo puede generar contenido danino, explicito o ilegal sin filtros: requiere moderacion externa en produccion.
- El autor advierte que el contenido explicito o grafico puede salir "bland" sin instrucciones explicitas de vocabulario o tono.
- Divergencia KL de 0,0826 respecto a la base, lo que indica cierta degradacion respecto al modelo original de Google (aunque muy inferior al umbral de 1 que el autor considera aceptable).
- Licencia Apache 2.0 declarada, pero al derivar de Gemma 3 conviene verificar la compatibilidad con los terminos de uso de Gemma en despliegues comerciales.
- El contexto de 128k declarado por el autor debe validarse empiricamente; no se aportan resultados de pruebas de aguja en pajar.
- Modelo de nicho (55 descargas, 11 likes en el momento de la consulta), sin validacion independiente de los benchmarks mas alla de Nightmedia.
- No se documenta soporte de tool calling, lo que limita su uso en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-Polaris-GLM-4.7-Flash-VAR-Thinking-Instruct-Heretic-Uncensored
- Variante full thinking del mismo autor: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-Polaris-Thinking-Heretic-Uncensored
- Modelo base: https://huggingface.co/DreamFast/gemma-3-12b-it-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-3-12b-it
- Dataset de razonamiento: https://huggingface.co/datasets/TeichAI/glm-4.7-2000x
- Dataset no razonador: https://huggingface.co/datasets/TeichAI/polaris-alpha-1000x
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
