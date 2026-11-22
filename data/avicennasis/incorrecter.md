# Avicennasis/incorrecter

## Resumen

Incorrecter es un ajuste fino (LoRA fusionado en fp16) del modelo Qwen2.5-0.5B-Instruct, desarrollado por el usuario Avicennasis (Léon). Su propósito es deliberadamente inverso al de un corrector ortográfico: recibe texto limpio, con estilo de redacción asistida por IA, y devuelve ese mismo texto introduciendo entre una y tres erratas realistas de nivel de palabra (homófonos incorrectos, eggcorns, deslices de teclado, minúscula al inicio de frase, espacio duplicado o punto final omitido). El objetivo es que el texto resultante parezca tecleado por una persona y no redactado por un modelo.

El modelo resuelve un problema concreto en el ámbito de la generación de datos sintéticos y la evaluación de sistemas: disponer de un generador controlado de errores humanos verosímiles para construir corpus de entrenamiento de correctores, pruebas de robustez o detección de texto generado por IA. Con 494 millones de parámetros y una ventana de contexto heredada de la familia Qwen2.5, está pensado para ejecutarse en hardware muy modesto, incluidos equipos Apple Silicon mediante mlx-lm.

La relevancia actual radica en su especialización estrecha y en la documentación de su proceso de evaluación, poco habitual en modelos de este tamaño: el autor publica métricas de tasa de cambio, número de ediciones, preservación de estructura y preservación de significado, con intervalos de confianza y comparación entre runtimes (transformers, ollama y mlx-lm).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino LoRA fusionado sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | fp16 (pesos fusionados en el repo principal); GGUF Q8_0 en el repo incorrecter-GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo secundario) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, y se ajusta mediante LoRA con mlx-lm en Apple Silicon; los adaptadores se fusionan en los pesos finales en fp16. No se documenta ninguna modificación arquitectónica respecto al modelo base: la especialización proviene exclusivamente de los datos y del procedimiento de ajuste.

El conjunto de entrenamiento combina cuatro fuentes: 644 semillas redactadas por modelos grandes (glm-5.3-flash, qwen3.8-27b, gemini-3.1-flash-lite y Claude, con etiquetas de licencia por fila), 699 borradores adicionales de esos mismos generadores (343 de qwen3.8-27b, 250 de glm, 100 de gemini y 6 de Claude), 693 semillas escritas por humanos procedentes de OpenAssistant/oasst2 (Apache-2.0) y google/civil_comments (CC0-1.0), filtradas a 20-400 palabras, y 600 pares de errores reales de grammarly/coedit (Apache-2.0) invertidos de la dirección correcta a la errónea. Se añaden filas de identidad para que el modelo se autodefina como Incorrecter, creado por Léon. El autor declara explícitamente que no se utilizó correspondencia no publicada.

La innovación técnica destacable no está en la arquitectura sino en la receta de muestreo: temperatura 1.2 con top_p 0.9 y sin penalización por repetición. El autor documenta que la penalización por repetición (antes 1.05) degradaba la tarea porque castiga la copia literal del texto de entrada, y que el tope top_p evita que la propia copia se corrompa con sustituciones espurias de palabras.

## Capacidades

- Generación de texto con transformación controlada: reescribe el texto de entrada introduciendo entre una y tres erratas de nivel de palabra.
- Inyección de errores tipificados: homófonos incorrectos, eggcorns, deslices de teclado (fat-finger), minúscula al inicio de frase, espacio duplicado y omisión del punto final.
- Preservación de estructura: mantiene el número de líneas (0.971 medido) y la fórmula de despedida o firma (0.958 medido).
- Preservación de significado: el texto erróneo sigue diciendo lo mismo que el original en el 95,7 % de los casos según el juez Llama-3.3-70B-Instruct.
- Autodefinición de identidad: responde a preguntas de identidad como Incorrecter, creado por Léon, con o sin system prompt (3/3 en todas las pruebas).
- Conversacional: formato de chat con plantilla de Qwen2.5 (apply_chat_template), compatible con text-generation-inference y endpoints.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Generación de corpus para entrenar correctores ortográficos y gramaticales: se alimenta texto limpio y se obtienen pares (erróneo, limpio) con errores realistas, útiles como datos aumentados para modelos de corrección.
- Pruebas de robustez de pipelines de NLP: introducir erratas controladas en entradas de sistemas de extracción de entidades, clasificación o búsqueda para medir su tolerancia a ruido tipográfico humano.
- Detección de texto generado por IA: generar variantes con marcas humanas (minúsculas iniciales, erratas) para evaluar si los clasificadores de texto sintético se dejan engañar por perturbaciones superficiales.
- Simulación de comunicaciones internas realistas: producir correos de Slack, notas de casero o actualizaciones de equipo con aspecto tecleado por una persona, para maquetas, demos o pruebas de producto.
- Evaluación de sistemas de control de calidad editorial: verificar que las herramientas de revisión detectan erratas del tipo eggcorn u homófono en textos que de otro modo parecen limpios.
- Benchmarking de preservación semántica: usar las métricas publicadas (líneas, firma, significado) como referencia para comparar generadores de ruido alternativos en tareas de data augmentation.
- Ejecución local en Apple Silicon: con 494 M de parámetros en fp16 o Q8_0 GGUF, cabe en portátiles con memoria unificada, lo que permite generar datos en local sin depender de APIs.

## Benchmarks y rendimiento

Evaluación sobre 58 textos reservados, temperatura 1.2 y top_p 0.9, 6 muestras (2 semillas de entrenamiento x 3 semillas de muestreo), mediante mlx-lm:

| Métrica | Resultado | Objetivo |
|---|---|---|
| Textos modificados | 0.830 [0.76-0.90] | >= 0.80 |
| De los modificados, 1-3 ediciones de palabra | 0.882 [0.81-0.92] | >= 0.70 |
| Número de líneas preservado | 0.971 [0.97-0.98] | >= 0.95 |
| Firma o despedida preservada | 0.958 [0.91-1.00] | >= 0.95 |
| Significado preservado | 0.957 [0.93-0.98] | >= 0.95 |
| Pruebas de identidad (con system prompt) | 3/3 en todos los modelos | 3/3 |

Este checkpoint concreto, con 3 muestras: 0.874 modificados, 0.901 con 1-3 ediciones, 0.971 líneas, 0.958 firma, 0.954 significado.

Mismo checkpoint en otros runtimes (40 textos reservados, 3 muestras):

| Runtime | Ajustes | Modificados | 1-3 ediciones | Líneas | Firma | Significado |
|---|---|---|---|---|---|---|
| transformers (CPU) | generation_config.json del repo | 0.79 | 0.81 | 0.96 | 0.96 | 0.94 |
| ollama (Q8_0) | params del repo GGUF | 0.93 | 0.85 | 0.98 | 0.97 | 0.94 |

El juez de significado es Llama-3.3-70B-Instruct, calibrado previamente con 58/58 corrupciones del motor de ruido juzgadas como "mismo significado" y 58/58 pares no emparejados juzgados como "diferente". El autor advierte que el margen de significado es estrecho y lo declara tal cual se midió. No se publican resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 (494 M de parámetros) y en torno a 0,5-0,6 GB en Q8_0 GGUF.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; el modelo está pensado para ejecutarse en CPU y en Apple Silicon mediante mlx-lm.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en portátiles con memoria unificada de Apple (M1 en adelante).
- Opciones de despliegue: transformers (con dtype float16), mlx-lm, ollama (vía hf.co/Avicennasis/incorrecter-GGUF:Q8_0) y text-generation-inference, dado que el repo incluye la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles en la información proporcionada. El repo ocupa 1,0 GB.
- Ajustes de despliegue críticos: temperatura 1.2, top_p 0.9 y sin penalización por repetición; el generation_config.json del repo ya los aplica con do_sample=True. La decodificación greedy produce resultados demasiado tímidos (pocas modificaciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Avicennasis/incorrecter | 494 M | no disponible | Inyección de erratas realistas en inglés | Apache-2.0 | Hugging Face (safetensors y GGUF) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible | Instrucciones generales, multilingüe | Apache-2.0 | Hugging Face |
| Modelos de corrección tipo GECToR o T5-small ajustados a corrección gramatical | variable (decenas a cientos de millones) | variable | Corrección de errores (dirección inversa) | variable | Hugging Face, repos académicos |

No se dispone de datos de benchmarks comparativos directos con alternativas de generación de erratas en la información proporcionada. La comparación con el modelo base es relevante porque Incorrecter hereda su arquitectura y tokenizador, pero invierte la tarea: en lugar de responder instrucciones, copia la entrada con errores controlados.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Con 0,5 B de parámetros, se producen ocasionalmente correcciones excesivas o insuficientes; el autor lo advierte explícitamente.
- Alrededor de 4 de cada 100 salidas con los ajustes recomendados introducen un error sobre una palabra real que cambia el significado (por ejemplo, my → your); sin el tope top_p el problema es mayor (significado 0.914 con la receta antigua).
- El margen de la métrica de preservación de significado es estrecho (0.957 frente al objetivo 0.95) y depende de un juez LLM externo (Llama-3.3-70B-Instruct), no de evaluación humana.
- El modelo responde a preguntas de identidad como Incorrecter, creado por Léon; esto puede ser indeseable si se reutiliza en un producto con otra marca.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad de las erratas generadas ni sobre su adecuación a dominios especializados.
- No soporta tool calling, agentes, visión ni audio; no debe emplearse como modelo de propósito general.
- El rendimiento varía según el runtime: transformers en CPU modifica menos textos (0.79) que ollama con Q8_0 (0.93), y el GGUF "funciona un poco más caliente" que los pesos fp16 con los mismos ajustes.
- Riesgo de alucinación estructural: aunque la tarea es de copia, el muestreo a temperatura 1.2 puede introducir sustituciones no deseadas si se baja el top_p o se activa penalización por repetición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avicennasis/incorrecter
- Repositorio GGUF: https://huggingface.co/Avicennasis/incorrecter-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset OpenAssistant/oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset grammarly/coedit: https://huggingface.co/datasets/grammarly/coedit
- Notas de diseño con la comparación completa entre brazos de datos de entrenamiento: mencionadas en la model card, sin URL directa disponible en la información proporcionada.
