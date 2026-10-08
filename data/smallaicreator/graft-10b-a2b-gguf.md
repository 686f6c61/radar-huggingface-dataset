# SmallAICreator/GRAFT-10B-A2B-GGUF

## Resumen

GRAFT-10B-A2B es un modelo de chat de tipo mixture-of-experts (MoE) desarrollado por UltraLabs (publicado en HuggingFace bajo el usuario SmallAICreator). Se ha construido reduciendo el modelo Qwen/Qwen3-30B-A3B-Instruct-2507 a aproximadamente un tercio de su tamano mediante GRAFT, un metodo propio de compresion de modelos, seguido de un proceso de "healing", destilacion y ajuste conversacional. El resultado es un modelo de unos 10.300 millones de parametros totales, de los cuales solo unos 2.000 millones estan activos por token, lo que le permite generar texto a una velocidad cercana a la de un modelo de 2B.

El modelo conserva la arquitectura Qwen3-MoE (48 capas, 40 expertos con 5 activos por token, hidden size 2048) y se distribuye unicamente en formato GGUF cuantizado. La unica cuantizacion documentada es Q4_K_M (6,27 GB), lo que facilita su ejecucion en hardware de consumo mediante llama.cpp, Ollama, LM Studio o Jan. Esta pensado para conversacion y tool calling, con plantilla ChatML embebida en el propio fichero GGUF y licencia Apache 2.0.

Su relevancia actual radica en que ofrece un perfil poco habitual: un MoE comprimido que hereda parte del conocimiento de un modelo de 30B pero con requisitos de memoria y velocidad propios de un modelo mucho menor. Segun las mediciones del autor, la divergencia KL de sus predicciones respecto al modelo original (~0,31) es inferior a la de los modelos densos Qwen3 de 8B y 14B, aunque el propio autor advierte que este test resulta mas facil para GRAFT porque fue entrenado precisamente para imitar al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (mixture-of-experts), 48 capas, 40 expertos, 5 activos por token, hidden size 2048 |
| Parametros totales | 10.331.932.672 (~10,3B) |
| Parametros activos | ~2B por token |
| Longitud de contexto | Entrenado hasta 8K tokens; el fichero permite 32K (calidad optima en los primeros ~8K) |
| Tipos de cuantizacion | Q4_K_M documentada (6,27 GB); no disponible el resto |
| Idiomas soportados | Ingles (principal); otros idiomas funcionan pero con menor calidad |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero GRAFT-10B-A2B-Q4_K_M.gguf) |

Otras especificaciones relevantes: template de chat ChatML con soporte de tool calling (embebido en el GGUF), identificador del modelo base Qwen/Qwen3-30B-A3B-Instruct-2507, tamano del repositorio 6,3 GB, pipeline text-generation, creado el 2026-10-07.

Ajustes recomendados por el autor: temperature 0.7, top-p 0.8, top-k 20, repeat penalty 1.05.

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Instruct-2507, un transformer MoE de la familia Qwen3 con 30.000 millones de parametros totales y 3.000 millones activos. UltraLabs aplico su metodo GRAFT para reducir el modelo a un tercio de su tamano, obteniendo una variante con 48 capas, 40 expertos (5 activos por token) y hidden size de 2048. Tras la compresion, el modelo paso por un proceso de "healing" (recuperacion de capacidad), destilacion a partir del modelo original y un ajuste final de chat. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal es el propio metodo GRAFT, orientado a comprimir modelos MoE preservando su comportamiento. El autor publica una medida de fidelidad: la divergencia KL de las predicciones de GRAFT-10B-A2B respecto al modelo Qwen3-30B-A3B-Instruct-2507 sobre texto web, libros, codigo y chat reservados. GRAFT-10B-A2B (antes del ajuste de chat) obtiene ~0,31, frente a 0,34 de Qwen3-14B, 0,39 de Qwen3-8B, 0,40 de Qwen3-4B-Instruct-2507 y 0,71 de Qwen3-1.7B. El autor matiza expresamente que este test mide similitud con el original, no rendimiento en benchmarks, y que su modelo fue entrenado para imitarlo, por lo que la comparacion le favorece.

## Capacidades

- Generacion de texto conversacional multi-turno con template ChatML.
- Tool calling y function calling: la plantilla embebida interpreta herramientas al estilo OpenAI y emite llamadas en el formato `<tool_call>`, incluyendo parametros `tools` en el servidor compatible con OpenAI de llama.cpp.
- Razonamiento basico y respuesta a preguntas factuales, incluyendo datos poco frecuentes (por ejemplo, capitales de Burkina Faso o Kazajistan).
- Generacion de codigo: produce funciones sencillas (por ejemplo, invertir una cadena en Python) con explicacion, aunque es su area mas debil.
- Capacidad multilingue limitada: el ajuste de chat se hizo en ingles y otros idiomas funcionan con menor calidad.
- Velocidad de generacion propia de un modelo de ~2B activos gracias al enrutado MoE.
- No se documentan capacidades de vision, audio ni un modo "thinking" explicito.

## Casos de uso

- Asistentes conversacionales locales en el escritorio: con 8 GB de RAM libre puede ejecutarse en un portatil sin GPU mediante llama.cpp u Ollama, ofreciendo respuestas de chat sin enviar datos a la nube.
- Agentes con tool calling en local: su soporte de `<tool_call>` y la plantilla embebida permiten integrarlo en flujos que invocan APIs o funciones, con la advertencia de verificar siempre que las acciones declaradas se ejecutan realmente.
- Prototipado rapido de aplicaciones de IA generativa: al ser un unico fichero GGUF de 6,27 GB con licencia Apache 2.0, sirve para validar ideas en equipos con recursos limitados antes de pasar a modelos mayores.
- Despliegue en servidor compatible con OpenAI: el comando `llama-server` expone un endpoint en `http://localhost:8080`, lo que facilita sustituir modelos en pipelines existentes sin cambiar el cliente.
- Documentacion tecnica y asistencia en texto en ingles: es adecuado para resumir, redactar o responder preguntas donde no se exige maxima precision factual.
- Tareas de codigo asistido no criticas: puede generar ejemplos, explicar fragmentos o proponer funciones simples, siempre que el codigo se ejecute y pruebe antes de integrarlo.
- Chat en aplicaciones de escritorio y moviles: funciona en LM Studio, Jan y otras apps GGUF que leen la plantilla del fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. El autor indica explicitamente que los benchmarks estandar "estan por llegar". El unico dato cuantitativo publicado es la divergencia KL respecto al modelo original:

| Modelo | KL frente a Qwen3-30B-A3B-Instruct-2507 |
|---|---|
| Qwen3-1.7B | 0,71 |
| Qwen3-4B-Instruct-2507 | 0,40 |
| Qwen3-8B | 0,39 |
| Qwen3-14B | 0,34 |
| GRAFT-10B-A2B (antes del ajuste de chat) | ~0,31 |

Nota del autor: esta metrica mide similitud con el modelo original sobre texto web, libros, codigo y chat reservados, no rendimiento en tareas. El modelo fue entrenado para imitar al original, por lo que la comparacion favorece a GRAFT. Valores mas bajos indican mayor similitud.

## Requisitos de hardware

- VRAM/RAM para el fichero Q4_K_M: 6,27 GB de pesos; el autor recomienda 8 GB libres y 16 GB totales de RAM.
- CPU sin GPU: funciona. En un portatil con i5, aproximadamente 4-5 tokens/s escribiendo y unos 20 tokens/s leyendo prompts (prompt processing).
- GPU: mucho mas rapido; recomienda descargar a la GPU tantas capas como permita la VRAM disponible.
- GPU de consumo: cabe y se acelera en tarjetas como RTX 3060 12 GB, RTX 4070/4080 o RTX 4090, descargando capas segun VRAM. No se documentan GPUs de datacenter concretas (A100, H100), aunque son compatibles via llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con `--jinja`), Ollama (`ollama run hf.co/SmallAICreator/GRAFT-10B-A2B-GGUF:Q4_K_M`), LM Studio, Jan y otras aplicaciones compatibles con GGUF. No se documenta soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no se publican cifras de throughput mas alla de las estimaciones de CPU del autor; no disponibles para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| GRAFT-10B-A2B | ~10,3B | ~2B | Entrenado a 8K (fichero hasta 32K) | Apache 2.0 | GGUF (Q4_K_M) | Derivado de Qwen3-30B-A3B; KL ~0,31 frente al original |
| Qwen3-30B-A3B-Instruct-2507 | ~30B | ~3B | No disponible en la informacion | Apache 2.0 | Pesos originales | Modelo base del que deriva GRAFT |
| Qwen3-14B | ~14B | Denso | No disponible en la informacion | Apache 2.0 | Multiples formatos | KL 0,34 frente al 30B; denso, sin enrutado MoE |
| Qwen3-8B | ~8B | Denso | No disponible en la informacion | Apache 2.0 | Multiples formatos | KL 0,39 frente al 30B |
| GRAFT-1B | <1B | No aplica (probablemente denso) | No disponible en la informacion | Apache 2.0 | GGUF | De la misma familia UltraLabs; 6 idiomas; funciona en moviles |

La comparacion se limita a lo publicado; no hay benchmarks estandar para GRAFT-10B-A2B, por lo que las diferencias de rendimiento en tareas reales no pueden establecerse con los datos disponibles.

## Limitaciones y advertencias

- La generacion de codigo es el area mas debil: puede mezclar sintaxis de lenguajes (por ejemplo, Java en un fichero Kotlin) o invocar APIs inexistentes. Hay que ejecutar y probar siempre el codigo generado.
- Tiende a responder con seguridad aunque se equivoque. Conviene verificar hechos importantes y comprobar que un agente ha realizado realmente las acciones que afirma.
- Calidad optima dentro de los primeros ~8K tokens de contexto, pese a que el fichero permita 32K.
- Ajuste de chat realizado en ingles; el resto de idiomas funciona pero con menor pulido. El castellano no esta garantizado.
- Sin system prompt, el modelo puede presentarse con el nombre de su modelo base. El autor recomienda usar uno (por ejemplo, "You are GRAFT-10B-A2B, a helpful AI assistant made by UltraLabs.").
- Riesgo de alucinacion en datos factuales; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0, que permite uso comercial; aun asi, al derivar de un modelo Qwen con la misma licencia, conviene revisar las condiciones del modelo base.
- Repositorio recien publicado (0 descargas y 0 likes en el momento de la consulta) y benchmarks estandar aun no disponibles, por lo que su rendimiento real en produccion no esta validado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SmallAICreator/GRAFT-10B-A2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- GRAFT-1B (misma familia): https://huggingface.co/SmallAICreator/GRAFT-1B
- Aplicacion L-AI para Android: https://huggingface.co/SmallAICreator/L-AI-Android
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
