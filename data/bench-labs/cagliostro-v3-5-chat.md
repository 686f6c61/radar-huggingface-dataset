# bench-labs/cagliostro-v3.5-chat

## Resumen

cagliostro-v3.5-chat es la version ajustada para conversacion del modelo cagliostro-v3.5, desarrollado por bench-labs. Se trata de un modelo de lenguaje causal denso de 146.352.000 parametros (146 M) que, partiendo de los pesos del modelo base, recibe una epoca de ajuste supervisado (SFT) sobre el conjunto conversacional smol-smoltalk, el mismo que se uso para entrenar SmolLM2-135M-Instruct y SmolLM2-360M-Instruct. La arquitectura y el tokenizador no cambian respecto al base: solo los pesos.

El problema que aborda es concreto y acotado: el modelo base, pese a haber visto conversaciones durante el preentrenamiento en formato `User:` / `Assistant:`, tendia a continuar escribiendo el turno del usuario en lugar de cerrar su propia respuesta. El ajuste ensena al modelo a terminar cada respuesta con `<|endoftext|>`, de modo que la generacion se detiene sola, y ademas habilita el seguimiento de un system prompt y el uso del turno anterior en conversaciones de dos turnos.

Su relevancia es principalmente como objeto de estudio y como base minima para experimentacion: con 146 M de parametros y licencia Apache-2.0, es un candidato para investigacion sobre SFT, prototipado en hardware muy limitado y despliegue en entornos donde no cabe nada mas grande. Conviene tener presente que, en los benchmarks publicados por el propio autor, el modelo base esta por detras de SmolLM2-135M en modelado de lenguaje (WikiText-2, LAMBADA), gramatica (BLiMP), ciencia (SciQ) y ARC-Easy, y que su ventaja en el indice Open SLM proviene casi exclusivamente de la aritmetica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (etiqueta `causal-lm`); numero de capas, cabezas y tipo de atencion no disponibles |
| Parametros totales | 146.352.000 (146 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible; en las evaluaciones del autor se uso una ventana de 2.048 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors sin cuantizar |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; requiere codigo personalizado (`custom_code`, `trust_remote_code=True`) |
| Modelo base | bench-labs/cagliostro-v3.5 |
| Datos de ajuste | HuggingFaceTB/smol-smoltalk (1 epoca, SFT) |
| Tamano del repositorio | 3,0 GB (incluye pesos, muestras, evaluaciones y video) |
| Descargas / likes | 395 / 10 |
| Fecha de publicacion | 8 de octubre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `causal-lm`: no se especifican numero de capas, dimension del modelo, numero de cabezas de atencion ni si se emplea atencion lineal o alguna variante. Lo que si se indica de forma explicita es que el tokenizador es identico al del modelo base y que la unica diferencia entre cagliostro-v3.5 y esta version es el valor de los pesos. El modelo base se entreno sobre 75.400 millones de tokens, una cifra notablemente inferior a los 2 billones de tokens de SmolLM2-135M, lo que explica en buena medida las diferencias observadas en modelado de lenguaje.

El ajuste consistio en una unica epoca de aprendizaje supervisado sobre smol-smoltalk, manteniendo el formato de dialogo del preentrenamiento (lineas `User:` y `Assistant:`) y calculando la perdida unicamente sobre los turnos del asistente. La innovacion funcional es el cierre de turno: cada respuesta del asistente termina en `<|endoftext|>`, de forma que la generacion se detiene por si misma. Se completaron 4.225 pasos, con una perdida de validacion (sobre 2.000 conversaciones del split de test de smol-smoltalk) que descendio de 1,161 en el paso 0 a 1,066 (paso 500), 1,042 (1.000), 1,014 (2.000), 0,997 (3.000) y 0,988 (4.225). No se aplico DPO ni RLHF: a diferencia de SmolLM2-135M-Instruct, que segun su model card fue ajustado sobre los mismos datos y despues entrenado con DPO sobre UltraFeedback, este modelo solo recibio SFT.

## Capacidades

- Generacion de texto y conversacion en ingles, con formato de dialogo basado en lineas `User:` / `Assistant:`.
- Cierre autonomo del turno: con 12 prompts fijos, decodificacion greedy y un maximo de 200 tokens nuevos, el modelo termina su respuesta por si mismo en 8 de 12 casos, frente a 6 de 12 del base. Los 4 casos restantes fueron respuestas largas cortadas por el limite de tokens, no derivas hacia el turno del usuario.
- No escribe el siguiente turno del usuario: 0 de 12 casos, frente a 4 de 12 en el modelo base.
- Seguimiento de system prompt: verificado con la instruccion de responder como un pirata (el modelo base no lo conseguia).
- Uso del contexto conversacional: utiliza el turno anterior en una conversacion de dos turnos (el modelo base, no).
- Razonamiento aritmetico basico, heredado del base: ventaja de 6,50 puntos en ArithMark-3 y de 26,64 puntos en ArithMark-2 frente a SmolLM2-135M.
- Tool calling / function calling: no documentado. No se menciona soporte de llamadas a herramientas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingue: no. El modelo esta etiquetado exclusivamente para ingles.
- Vision, audio o cualquier otra modalidad: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion sobre ajuste supervisado: el modelo es un caso de estudio limpio de SFT sobre smol-smoltalk, con perdida de validacion publicada paso a paso y muestras crudas en `samples.json`, lo que permite reproducir y comparar recetas de ajuste sobre un modelo de 146 M.
- Prototipado de pipelines conversacionales: sirve para validar de punta a punta el formateo de prompts, el troceado de turnos y el bucle de inferencia antes de escalar a un modelo mayor, con un coste de computo minimo.
- Despliegue en entornos con recursos muy limitados: con menos de 1 GB de VRAM en precision de 16 bits, puede ejecutarse en CPU o en GPUs integradas para tareas de generacion de texto no criticas.
- Bots de dominio cerrado con vocabulario controlado: al haber sido ajustado para cerrar turnos y respetar system prompts, puede emplearse en respuestas guiadas por instrucciones muy acotadas, siempre que se acepte su conocimiento general limitado.
- Generacion de datos sinteticos de bajo coste: util para producir grandes volumenes de texto candidato que despues se filtran con un modelo mayor, o para alimentar pruebas de carga de un sistema de inferencia.
- Ensayos de comparacion y evaluacion: su tamano permite ejecutar baterias completas de benchmarks (HellaSwag, ARC, PIQA, MMLU, BLiMP) en minutos en una sola GPU, como banco de pruebas de harnesses de evaluacion.
- Educacion y demostraciones: adecuado para explicar en clase o en articulos como funciona el SFT, el enmascarado de la perdida en turnos del asistente y el problema del cierre de turno.

## Benchmarks y rendimiento

El autor publica una comparativa extensa del modelo base, cagliostro-v3.5, frente a SmolLM2-135M, medida con lm-evaluation-harness 0.4.13, zero-shot, float32, conjuntos de test completos y contexto de 2.048 tokens para ambos. Las cuatro primeras filas reproducen exactamente los numeros del Open SLM Leaderboard. Como el ajuste de chat solo modifica los pesos y no la arquitectura, esta tabla es la referencia disponible para el comportamiento subyacente del modelo.

| Benchmark | Metrica | cagliostro-v3.5 | SmolLM2-135M | Diferencia [IC 95%] |
|---|---|---:|---:|---|
| HellaSwag | acc_norm | 43,41 | 43,11 | +0,30 [-0,34, +1,01] |
| ARC-Easy | acc_norm | 53,75 | 58,59 | -4,84 [-6,48, -3,03] |
| ARC-Challenge | acc_norm | 29,35 | 29,61 | -0,26 [-2,30, +1,79] |
| PIQA | acc_norm | 68,06 | 68,50 | -0,44 [-2,07, +1,20] |
| LAMBADA (OpenAI) | acc | 38,70 | 42,89 | -4,19 [-5,39, -2,97] |
| LAMBADA (OpenAI) | perplexity (menor es mejor) | 27,25 | 19,26 | no disponible |
| WikiText-2 | bits per byte (menor es mejor) | 0,910 | 0,847 | no disponible |
| WikiText-2 | word perplexity (menor es mejor) | 29,13 | 23,13 | no disponible |
| BLiMP (67 conjuntos) | acc | 77,26 | 78,97 | -1,71 [-2,02, -1,36] |
| BoolQ | acc | 61,25 | 60,31 | +0,95 [-0,25, +2,11] |
| Social IQa | acc | 40,23 | 39,36 | +0,87 [-0,92, +2,66] |
| WinoGrande | acc | 52,41 | 52,96 | -0,55 [-3,87, +2,61] |
| OpenBookQA | acc_norm | 32,20 | 33,40 | -1,20 [-3,80, +1,60] |
| SciQ | acc_norm | 75,10 | 78,20 | -3,10 [-5,50, -0,90] |
| CommonsenseQA | acc | 19,33 | 19,49 | -0,16 [-3,11, +2,95] |
| MMLU (57 materias) | acc | 24,57 | 24,35 | +0,22 [-0,78, +1,22] |
| ArithMark-3 | script oficial | 45,30 | 38,80 | +6,50 |
| ArithMark-2 | script oficial | 59,84 | 33,20 | +26,64 [+24,32, +28,92] |
| Open SLM Index | indice | 27,49 | 27,01 | +0,48 [-0,82, +1,75] |

Las diferencias con intervalo que excluye el cero son la desventaja en ARC-Easy, LAMBADA y BLiMP y la ventaja en SciQ (en contra) y ArithMark-2 (a favor). El autor senala que CommonsenseQA y MMLU estan en el nivel del azar para ambos modelos y que fuera del leaderboard SmolLM2-135M es el modelo de lenguaje general mas fuerte.

Para la version de chat, el autor describe un experimento pairwise con MT-Bench (80 preguntas, ambos turnos, decodificacion greedy, penalizacion de repeticion 1,1, hasta 512 tokens nuevos, juez gpt-oss-120b en su variante heretic-v2 MXFP4 GGUF, temperatura 0 y razonamiento medio, cada par juzgado dos veces con los ordenes invertidos), pero la tabla de resultados queda truncada en la informacion disponible. Los resultados de MT-Bench del modelo de chat no estan disponibles.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del numero de parametros (146,352 M) y no datos publicados por el autor.

- Pesos en float32: aproximadamente 0,59 GB.
- Pesos en float16 / bfloat16: aproximadamente 0,29 GB.
- Pesos en int8: aproximadamente 0,15 GB.
- Pesos en int4: aproximadamente 0,08 GB.
- VRAM total en inferencia: por debajo de 1 GB en float16 incluyendo cache KV y activaciones con contexto de 2.048 tokens.
- Cabe en cualquier GPU de consumo con 2 GB o mas de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, iGPU con memoria compartida). La inferencia en CPU es viable, y solo 146 M de parametros hacen que tambien funcione en dispositivos embebidos con memoria suficiente.
- GPU de datacenter (A100, H100) o GPUs de gama alta (RTX 4090) no aportan nada relevante para inferencia; su utilidad aqui seria acelerar el reentrenamiento o el ajuste fino.
- Opciones de despliegue: transformers con `trust_remote_code=True` (la etiqueta `custom_code` implica que el modelo trae codigo propio y no funcionara en cargadores que no lo admitan). vLLM y TGI no estan verificados con este modelo. llama.cpp y Ollama requeririan convertir los pesos a GGUF, ya que el repositorio no publica ninguna cuantizacion oficial.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Entrenamiento | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|---|
| cagliostro-v3.5-chat | 146 M | 75,4 mil millones de tokens de preentrenamiento + 1 epoca de SFT sobre smol-smoltalk | no disponible (2.048 en evaluacion) | Indice Open SLM 27,49 en el base; MT-Bench del chat no disponible | Apache-2.0 | Pesos safetensors en HuggingFace, requiere `custom_code` |
| SmolLM2-135M-Instruct | 135 M (segun su denominacion) | smol-smoltalk + DPO sobre UltraFeedback | no disponible en la informacion proporcionada | No disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace, ecosistema estandar |
| SmolLM2-135M | 135 M (segun su denominacion) | 2 billones de tokens | no disponible en la informacion proporcionada | Superior en WikiText-2, LAMBADA, BLiMP, SciQ y ARC-Easy; empatado o por detras en el resto | no disponible en la informacion proporcionada | HuggingFace, ecosistema estandar |
| SmolLM2-360M-Instruct | 360 M (segun su denominacion) | smol-smoltalk (referenciado como el mismo corpus) | no disponible en la informacion proporcionada | No disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace, ecosistema estandar |

El propio autor reconoce que, fuera del leaderboard, SmolLM2-135M es el modelo de lenguaje general mas fuerte y que la ventaja de cagliostro en el indice procede de la aritmetica, metrica que el indice pondera con un peso de 0,65.

## Limitaciones y advertencias

- Solo ingles. El modelo esta etiquetado exclusivamente para `en`; no hay evidencia de capacidades multilingues.
- Conocimiento y razonamiento general muy limitados. MMLU se situa en 24,57 y CommonsenseQA en 19,33, ambos en el nivel del azar segun el propio autor.
- Inferior a SmolLM2-135M en tareas fundamentales de lenguaje: perplexity en WikiText-2 de 29,13 frente a 23,13, y en LAMBADA de 27,25 frente a 19,26. Cualquier tarea que dependa de fluidez o conocimiento general se resentira.
- Riesgo elevado de alucinacion. Un modelo de 146 M entrenado con 75,4 mil millones de tokens no tiene capacidad de verificacion factual y no debe usarse como fuente de informacion.
- El ajuste es una sola epoca de SFT, sin DPO ni RLHF. No hay alineacion adicional mas alla del corpus smol-smoltalk.
- El cierre de turno no es perfecto: en la prueba del autor, 4 de 12 respuestas no se detuvieron solas, aunque fue por alcanzar el limite de 200 tokens.
- Sesgos conocidos: no documentados en la informacion disponible. Al derivar de smol-smoltalk, cabe esperar los sesgos propios de ese corpus, pero el autor no publica analisis de sesgo.
- Licencia Apache-2.0, permisiva para uso comercial, sin clausulas de uso aceptable conocidas. No obstante, no se han publicado resultados de MT-Bench del modelo de chat ni evaluaciones de seguridad, por lo que no es prudente usarlo en produccion orientada a usuarios sin filtros adicionales.
- Requiere `trust_remote_code=True` por el codigo personalizado, lo que implica ejecutar codigo del repositorio del autor.
- No hay cuantizaciones oficiales ni soporte confirmado en llama.cpp, Ollama, vLLM o TGI; el despliegue pasa por transformers o por conversion manual de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bench-labs/cagliostro-v3.5-chat
- Modelo base: https://huggingface.co/bench-labs/cagliostro-v3.5
- Conjunto de datos de ajuste: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Muestras de generacion citadas en la model card: `samples.json` en la raiz del repositorio
- Salidas crudas de las evaluaciones: carpeta `evals/` del repositorio
- Video de demostracion: https://huggingface.co/bench-labs/cagliostro-v3.5-chat/resolve/main/cagliostro-v3.5-chat.mp4
- Busqueda web: los resultados obtenidos corresponden a la marca de ropa Bench (bench.shop, zalando.fr, bench.ca) y no guardan relacion con el modelo. No se han encontrado articulos, papers ni repositorios adicionales sobre cagliostro-v3.5-chat.
