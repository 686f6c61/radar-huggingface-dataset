# chuvash-ai/LFM3-1.7B-chv-llm-v1-GGUF

## Resumen
LFM3-1.7B-chv-llm-v1-GGUF es la distribucion en formato GGUF del modelo chuvasio de chuvash-ai, un ajuste fino del LFM3-1.7B-Base de Liquid AI orientado a la generacion y continuacion de texto en idioma chuvasio (chv), una lengua turquica de bajos recursos hablada en la Rusia europea. El modelo resuelve el problema de la escasez de herramientas de generacion de texto de calidad para lenguas minoritarias, partiendo de un modelo base de 1.746.088.768 parametros y ofreciendo pesos listos para llama.cpp y LM Studio.

Esta edicion concreta es la "stage 1" del proyecto: escribe y continua texto en chuvasio a partir de una instruccion breve en ruso, pero no traduce. Para tareas de traduccion el autor publica una variante separada (LFM3-1.7B-chv-v2-GGUF). El repositorio incluye dos cuantizaciones, BF16 de referencia (3,50 GB) y Q4_K_M (1,11 GB), e incorpora una plantilla de chat verificada byte a byte contra los prompts nativos de entrenamiento.

La relevancia actual es doble: por un lado demuestra el ajuste de un modelo hibrido moderno (arquitectura LFM3) a una lengua de bajos recursos; por otro, documenta de forma transparente los costes de la cuantizacion en arquitecturas hibridas, donde el autor reporta perdidas de entre 2,6 y 4,9 puntos de chrF a 4 bits en la tarea de traduccion de la v2. La licencia LFM Open v1.0 permite uso comercial solo a entidades con ingresos anuales inferiores a 10 millones de dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (hibrida, integrada en llama.cpp b11938, 27 de octubre de 2026) |
| Parametros totales | 1.746.088.768 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (referencia, 3,50 GB) y Q4_K_M (1,11 GB) |
| Idiomas soportados | chuvasio (chv) y ruso (ru) segun metadatos de la model card; el campo de idiomas del repo no esta disponible |
| Licencia | LFM Open License v1.0 (licencia "other") |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo se construye sobre LFM3-1.7B-Base de Liquid AI, una arquitectura hibrida que el ecosistema de llama.cpp incorporo como arquitectura `lfm3` a partir de la build b11938 (27 de octubre de 2026). El ajuste fino lo realiza chuvash-ai para adaptar el modelo base al chuvasio, con un entrenamiento centrado en dos formatos de instruccion exactos: uno sin system prompt que renderiza `Напиши текст на чувашском языке.` (escritura de una frase nueva, o continuacion parcial si se anade texto semilla) y otro con system prompt `Продолжи текст на чувашском языке.` seguido de texto chuvasio en el mensaje de usuario (continuacion de la siguiente frase). La plantilla de chat del GGUF reproduce fielmente estos formatos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor si documenta una innovacion relevante a nivel de despliegue: la arquitectura hibrida de LFM3 pierde mas calidad con cuantizacion a 4 bits que los transformers densos, con una degradacion medida de entre 2,6 y 4,9 puntos de chrF en la tarea de traduccion de la v2 a Q4; por ello BF16 se establece como referencia de calidad. El modelo esta ensenado a emitir EOS tras una frase completa, de ahi que las salidas cortas sean el comportamiento esperado.

## Capacidades
- Generacion de texto en chuvasio: escritura de frases nuevas a partir de una instruccion breve en ruso.
- Continuacion de texto: prolongacion de un fragmento chuvasio con la siguiente frase, mediante el system prompt especifico.
- Modelo de tipo completion: no es un traductor; la traduccion queda fuera de su alcance en esta version.
- Soporte bilingue limitado: instrucciones en ruso, salida en chuvasio.
- Integracion con llama.cpp y LM Studio mediante plantilla de chat Jinja (`--jinja`).
- Sin modo de razonamiento: el modelo nunca emite `</think>` y el parseo de razonamiento debe estar desactivado.
- Sin soporte documentado de tool calling, function calling, agentes, vision ni audio.

## Casos de uso
- Generacion de texto divulgativo en chuvasio: el modelo produce frases morfologicamente validas con vocabulario real, util para crear contenido inicial en una lengua con pocos recursos digitales.
- Aumento de datos para NLP de bajos recursos: generar corpus sinteticos en chuvasio para entrenar o evaluar otros sistemas, asumiendo la debil coherencia de largo alcance y aplicando post-normalizacion.
- Prototipado de asistentes conversacionales en chuvasio: con temperatura 0,8 y top_p 0,95, el modelo mantiene turnos cortos y frases completas, adecuado para demos de investigacion.
- Continuacion asistida de textos: dado un parrafo en chuvasio, el system prompt de continuacion permite sugerir la siguiente frase en herramientas de escritura.
- Educacion y preservacion linguistica: generacion de ejemplos de frase para materiales didacticos, con revision humana obligatoria por las limitaciones de coherencia.
- Investigacion sobre cuantizacion en arquitecturas hibridas: el par BF16/Q4_K_M permite estudiar la degradacion de calidad a 4 bits en modelos LFM3, replicando la metodologia del autor.
- Despliegue local en hardware modesto: la variante Q4_K_M de 1,11 GB cabe en equipos de consumo para experimentacion sin GPU dedicada de gama alta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado por el autor es la perdida de calidad por cuantizacion en la tarea de traduccion de la v2: entre 2,6 y 4,9 puntos de chrF a Q4 frente a BF16.

## Requisitos de hardware
- VRAM estimada: aproximadamente 1,11 GB para Q4_K_M y 3,50 GB para BF16, mas el overhead del runtime y la cache KV (longitud de contexto no disponible).
- GPU recomendadas: no hay recomendaciones oficiales; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar la variante Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060 o superiores con la cuantizacion Q4_K_M; BF16 requiere al menos 4-6 GB de VRAM libre.
- Opciones de despliegue: llama.cpp (build b11938 o superior, con `-ngl 99 --jinja`), LM Studio con motor llama.cpp 2.65.1 o superior. vLLM y TGI no estan documentados para esta arquitectura.
- Latencia y throughput: no disponibles.
- Nota de compatibilidad: si la carga falla con `unknown architecture: 'lfm3'`, hay que actualizar el motor en la pestana Runtime de LM Studio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-chv-llm-v1-GGUF | 1.746.088.768 | no disponible | chv, ru | LFM Open v1.0 | GGUF |
| LFM3-1.7B-chv-v2-GGUF | no disponible | no disponible | chv, ru | no disponible | GGUF |
| LFM3-1.7B-Base (Liquid AI) | 1,7B (aproximado) | no disponible | no disponible | LFM Open v1.0 | no disponible |

La comparativa se limita a la familia LFM3 porque no se dispone de datos de rendimiento ni de contexto que permitan contrastar con modelos de otros desarrolladores. La diferencia funcional clave entre la v1 y la v2 es que la v1 genera y continua texto, mientras que la v2 esta orientada a traduccion.

## Limitaciones y advertencias
- Calidad de investigacion: morfologia valida y vocabulario real, pero coherencia de largo alcance debil.
- Artefactos de corpus: aparicion ocasional de caracteres latinos similares (ă/ĕ) mezclados en texto cirilico; requiere post-normalizacion.
- No es un traductor: para traduccion hay que usar la variante v2.
- Decodificacion greedy no recomendada: el modelo entra en bucles de repeticion de palabras; usar temperatura aproximada de 0,8 y top_p aproximado de 0,95.
- Modo de razonamiento debe estar desactivado: con parseo de razonamiento activado el campo de respuesta queda vacio.
- Salidas cortas por diseno: el modelo emite EOS tras una frase completa, lo que limita respuestas extensas.
- Licencia restrictiva para comercio: LFM Open v1.0 permite uso comercial solo a entidades con ingresos anuales inferiores a 10 millones de dolares; la redistribucion debe incluir la licencia y preservar los avisos de atribucion.
- Riesgo de alucinacion: no cuantificado por el autor; esperable en un modelo de 1,7B ajustado sobre una lengua de bajos recursos.
- Idiomas: fuera de chuvasio y ruso el comportamiento no esta documentado.

## Enlaces
- Repositorio GGUF: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-llm-v1-GGUF
- Modelo base del ajuste: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-llm-v1
- Variante de traduccion v2: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-v2-GGUF
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia LFM Open v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
