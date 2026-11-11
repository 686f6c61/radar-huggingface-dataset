# kabe0515/ero-prompt-writer-9b-v2-GGUF

## Resumen

`kabe0515/ero-prompt-writer-9b-v2-GGUF` es un modelo especializado en la conversion de descripciones de escenas en japones a prompts en ingles para IA de generacion de imagenes, con salida en formato JSON y sin eufemismos. Lo desarrolla el usuario independiente kabe0515 y se distribuye unicamente en formato GGUF para llama.cpp. Resuelve un problema concreto: los LLM generalistas tienden a suavizar u omitir elementos explicitos (anatomia, posiciones, fluidos, ropa translucida, composicion) al reescribir prompts, mientras que este modelo esta entrenado para no hacerlo.

Tecnicamente es un fine-tune QLoRA (rango 16, learning rate 1e-4, 3 epocas, 1.148 filas sinteticas de instruccion, train_loss final 0.1993) sobre un modelo base de ~8,95 mil millones de parametros derivado de Qwen3.5-9B, destilado con salidas de DeepSeek-V4-Pro y posteriormente "desinhibido" mediante Heretic ARA. El resultado se publica como GGUF Q4_K_M (5,6 GB) acompanado de un proyector multimodal (mmproj en f16) para vision.

Su relevancia es de nicho: cubre el hueco de la generacion de prompts para contenido para adultos con control estricto de la fidelidad semantica entre entrada y salida, y ademas conserva capacidad de conversacion en japones sin rechazos, algo que la generacion anterior del proyecto no ofrecia. No es un modelo de proposito general ni compite en benchmarks academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-9B destilada de DeepSeek-V4-Pro, desinhibida con Heretic ARA) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (valor usado en el ejemplo de llama-server del autor) |
| Tipos de cuantizacion | GGUF Q4_K_M (5,6 GB); mmproj en f16 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | other / base-model-terms |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `Sakura721/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF`, un Qwen3.5-9B destilado con salidas de DeepSeek-V4-Pro (atribuido a Jackrong) y desinhibido mediante Heretic ARA. Sobre esa base se aplico un fine-tune QLoRA con rango 16, learning rate 1e-4 y 3 epocas, fusionado posteriormente en los pesos finales. No se documentan innovaciones de atencion ni decodificacion especulativa; la contribucion es el dataset y el ajuste de comportamiento.

El dataset de entrenamiento consta de 1.148 filas sinteticas de instruccion generadas combinando plantillas escritas a mano con un script: 925 filas base (drills de ligadura sujeto-objeto, vocabulario, 24 posiciones con variantes, escenas completas, entradas ambiguas y filas de control no explicitas) y 223 filas de refuerzo (143 sobre ropa translucida, mas drills de composicion y acciones combinadas). No se usaron textos extraidos de la web, obras de terceros ni datos personales. No se menciona RLHF ni DPO. El train_loss final reportado es 0.1993.

## Capacidades

- Conversion de texto de escena en japones a prompt en ingles para generacion de imagenes, con salida JSON de la forma `{"positive_prompt": "...", "negative_prompt": ""}`.
- Fidelidad explicita: mantiene elementos anatomicos, posiciones, fluidos, ropa translucida y composicion sin eufemismos ni omisiones.
- Ligadura sujeto-objeto entrenada de forma explicita (quien hace que a quien), incluyendo acciones combinadas.
- Conversacion en japones sin rechazos, incluido roleplay y narrativa explicita (6/6 respuestas en la prueba del autor, 0 rechazos, sin colapso de idioma).
- Capacidad multimodal de vision por el mmproj incluido (f16), segun el comando de llama-server documentado.
- Entrada en japones y chino verificada; otras lenguas sin probar.
- No se documenta soporte de tool calling ni de razonamiento multi-paso; de hecho, el modo de razonamiento debe desactivarse.

## Casos de uso

- Generacion de prompts para pipelines de imagen para adultos: el modelo convierte una descripcion breve en japones en un prompt en ingles estructurado en JSON, listo para inyectar en una API de generacion de imagenes sin postprocesado.
- Herramienta de autor para artistas de contenido explicito: permite escribir la escena en japones coloquial y obtener un prompt con direccion de accion, posicion y composicion correctas, reduciendo el ciclo de prueba y error.
- Chat de rol en japones: al conservar la base desinhibida, responde a escenarios narrativos y de roleplay en japones sin rechazos, con 6/6 en la prueba del autor.
- Normalizacion de vocabulario entre idiomas: util como capa intermedia que traduce descripciones ambiguas ("hacerle algo con la mano") a terminos ingleses inequivocos para modelos de difusion.
- Etiquetado y curacion de datasets de imagen: genera prompts estructurados a partir de descripciones textuales para construir pares texto-imagen consistentes.
- Prototipado local en estaciones de trabajo: con Q4_K_M (5,6 GB) cabe en GPU de consumo y permite iterar sin coste de API, con llama.cpp y contexto de hasta 131.072 tokens.

## Benchmarks y rendimiento

| Modelo | Casos superados | Elementos conservados | Formato JSON | train_loss |
|---|---|---|---|---|
| Qwen3-8B v1 (925 filas) | 12/16 | 13/19 | 16/16 | 0.3684 |
| Heretic-9B full (925 filas) | 13/16 | 16/19 | 16/16 | 0.2319 |
| Qwen3-8B v2 (1.148 filas) | 15/16 | 18/19 | 16/16 | 0.3111 |
| Heretic-9B v2 (este modelo, 1.148 filas) | 14/16 (15/16*) | 17/19 | 16/16 | 0.1993 |

\* Un caso se marco como fallo solo porque la salida uso "ejaculate" en lugar del vocabulario del verificador automatico ("sperm"/"cum"); el contenido era correcto.

Prueba de chat explicito (6 prompts en japones: relato corto, roleplay, descripcion de escena explicita, guion ASMR, etc.): Qwen3-8B v2 dio rechazo (en chino) o salida vacia; Heretic-9B v2 respondio 6/6 en japones, sin rechazos y sin colapso de idioma. Medicion con decodificacion greedy y razonamiento desactivado. No hay datos de MMLU, HumanEval, GSM8K ni benchmarks academicos.

## Requisitos de hardware

- VRAM estimada: ~6-7 GB con Q4_K_M (5,6 GB de pesos) mas el mmproj f16 y la cache KV; el contexto de 131.072 tokens incrementa notablemente el consumo de KV.
- GPU recomendadas: RTX 4090, RTX 3090, RTX 4080 y tarjetas con 8-12 GB o mas; A100/H100 solo si se necesita contexto muy largo o concurrencia.
- Cabe en GPU de consumo: si, con Q4_K_M en tarjetas de 8 GB o superiores (ajustando contexto).
- Despliegue: llama.cpp / llama-server (comando documentado por el autor), con soporte de `chat_template_kwargs` para desactivar thinking; tambien Ollama y otros frontends compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ero-prompt-writer-9b-v2 (este) | ~8,95 B | 131.072 | Conversion JA->EN de prompts explicitos + chat JA | other (base-model-terms) | GGUF en HF |
| Qwen3-8B v2 (generacion previa del proyecto) | ~8 B | no disponible | Solo conversion, con rechazos en chat | no disponible | no disponible |
| Heretic-9B full (925 filas) | ~8,95 B | no disponible | Conversion, sin refuerzo de ropa translucida | no disponible | no disponible |

No se dispone de datos de benchmarks frente a modelos de proposito general comparables; la unica comparacion publicada es interna entre las cuatro generaciones del propio proyecto.

## Limitaciones y advertencias

- Las acciones combinadas (p. ej. felacion y masturbacion en la misma escena) pueden intercambiar quien hace que: 1 de 16 casos del benchmark.
- Las formulaciones coloquiales devuelven prompts utilizables pero no siempre JSON estricto; el formato de instruccion entrenado es la via fiable.
- El razonamiento debe permanecer desactivado en conversion; con thinking activo, el razonamiento en ingles puede corromper o invertir el JSON.
- Solo japones y chino estan verificados como entrada; otras lenguas no se han probado.
- Riesgo de alucinacion y de desviacion de la escena descrita no cuantificado mas alla del benchmark interno de 16 casos.
- Contenido para adultos: la model card esta marcada como `not-for-all-adultiences`; requiere control de acceso y cumplimiento de las politicas de la plataforma de despliegue.
- Licencia `other` con terminos heredados del modelo base (`base-model-terms`): es imprescindible revisar las condiciones del modelo base antes de cualquier uso comercial; no se garantiza permiso comercial.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no publica el dataset completo; la validacion externa es practicamente nula.
- El diseno limita la expresion de semen a formas externas (desbordamiento, goteo, sobre el cuerpo), lo que restringe ciertos prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kabe0515/ero-prompt-writer-9b-v2-GGUF
- Modelo base: https://huggingface.co/Sakura721/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales.
