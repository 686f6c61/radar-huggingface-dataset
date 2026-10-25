# scribekey/scribekey-cleanup-fast

## Resumen

ScribeKey Fast es un modelo de lenguaje de 354.483.968 parámetros (aproximadamente 350M) especializado en la limpieza de transcripciones de voz a texto en inglés. Lo desarrolla ScribeKey sobre la familia LFM2.5 de Liquid AI y se distribuye como un fine-tuning encadenado: LFM2.5-350M-Base → Sotto (juanquivilla) → Sotto v6 de ScribeKey → ScribeKey Fast. No procesa audio: recibe texto ASR en bruto y devuelve el texto corregido, eliminando muletillas y repeticiones, aplicando correcciones habladas y ajustando puntuación, mayúsculas y disposición.

Su interés práctico está en el despliegue en dispositivo: es un modelo denso de 16 capas con un artefacto GGUF Q8_0 de 379.219.904 bytes (361,7 MiB) que cabe en teléfonos y equipos sin GPU dedicada. La versión publicada aquí son los pesos fusionados en BF16 (fichero de 708.984.464 bytes) junto al tokenizador, y el autor reporta una comprobación en un Galaxy S25 Ultra con latencias p50/p95 de 155/178 ms en dictados cortos y 1.702/2.718 ms en largos, con Parakeet residente en memoria.

El modelo se controla mediante una línea de control con tres ejes (estilo, estructura y contexto) y está pensado como una pieza determinista dentro de una aplicación de dictado, no como un asistente conversacional. La licencia no es estándar: combina los ScribeKey Fast Model Terms v1.0 con la LFM Open License v1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Liquid AI LFM2.5-350M, 16 capas |
| Parámetros totales | 354.483.968 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens en el perfil de aplicación evaluado; el límite de contexto de la arquitectura es mayor pero no se especifica y no se ha validado como longitud de limpieza |
| Tipos de cuantización | BF16 (pesos fusionados publicados) y Q8_0 (GGUF, 379.219.904 bytes / 361,7 MiB); no se documentan otras |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `scribekey-fast-model-terms-v1.0-with-lfm-open-license-v1.0` (etiquetada como `other`), con avisos MIT heredados de Sotto |
| Formato de pesos | Safetensors (BF16) en este repositorio; GGUF Q8_0 en `scribekey/scribekey-cleanup-fast-GGUF` |

Otros datos de interés: tamaño del repositorio 0,7 GB; pipeline `text-generation`; guardado con Transformers 5.2.0 y clase `Lfm2ForCausalLM`, sin código remoto; salida máxima de 256 tokens en el perfil de la app; entrada de hasta 4.000 caracteres.

## Arquitectura y entrenamiento

La base es LFM2.5-350M de Liquid AI, un transformer denso de 16 capas con 354.483.968 parámetros almacenados. ScribeKey parte de un fine-tuning previo de juanquivilla (Sotto, sobre `LiquidAI/LFM2.5-350M-Base`) y aplica una cadena adicional de ajuste hasta llegar a esta release `v1`, correspondiente al experimento `v7-replay-tgt`. Los pesos publicados son la fusión en BF16 de ese ajuste, más el tokenizador heredado de LFM, que conserva tokens de chat para otras tareas.

El entrenamiento usa el dataset `juanquivilla/sotto-transcript-cleanup`; no se detalla en la información disponible el número de tokens, la composición exacta del corpus ni si hubo fases de RLHF o DPO. La innovación funcional no está en la arquitectura sino en el formato: el modelo se entrena con una envoltura exacta con `<|startoftext|>`, un bloque `### Input:` con una línea de control, la transcripción, una línea en blanco, `### Output:` y la salida limpia. La línea de control codifica tres ejes: `Styling` (casual, semi-casual, semi-formal, formal), `Structure` (prose, lists) y `Context` (general, email). La decodificación prevista es greedy (temperatura 0; la app usa top-k 1, top-p 1, semilla 42 y sin penalización de repetición), con parada en `<|im_end|>` o en un nuevo delimitador `###`.

## Capacidades

- Limpieza de transcripciones ASR en inglés: eliminación de muletillas, repeticiones y falsos arranques.
- Aplicación de correcciones habladas del estilo «no, perdón, di X» sobre el texto dictado.
- Ajuste de puntuación, mayúsculas y disposición del texto, incluyendo saltos de línea.
- Control de estilo en cuatro niveles, de casual en minúsculas a formal con expansión de contracciones.
- Control de estructura: prosa o listas generadas por el modelo (la prosa es la opción recomendada).
- Control de contexto para correo: disposición de saludo, cuerpo y despedida ya dictados, sin inventarlos.
- Formato de entrada/salida determinista y apto para integración en aplicaciones, con una sola instrucción de usuario y sin historial.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio según la información disponible.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Dictado en teclados móviles: el modelo se ejecuta en el propio dispositivo con el GGUF Q8_0 y limpia cada dictado antes de insertarlo en el campo de texto; las latencias reportadas (155/178 ms p50/p95 en dictados cortos) son compatibles con una interacción fluida.
- Redacción de correos dictados: enviando `Context: email` y `Styling: semi-formal`, el modelo reordena y puntúa un saludo, cuerpo y despedida ya pronunciados, sin añadir contenido nuevo; la app indica además que la elección de estilo y el formateo de listas se hacen fuera de los pesos.
- Post-proceso de un pipeline ASR: colocado detrás de Whisper, Parakeet u otro reconocedor, recibe la hipótesis en bruto y devuelve texto presentable; conviene trocear la entrada por fronteras de frase para respetar el presupuesto de salida de 256 tokens.
- Notas de reuniones: limpiar transcripciones antes de pasarlas a un resumidor o a un sistema de actas, de modo que el modelo posterior reciba prosa puntuada en lugar de texto con repeticiones y muletillas.
- Mensajería y chat: con `Styling: casual` o `semi-casual` y `Context: general`, normaliza mensajes dictados en aplicaciones de conversación manteniendo contracciones y mayúsculas de frase.
- Accesibilidad: usuarios que dependen del dictado por voz obtienen texto estructurado y legible sin revisión manual, en equipos sin GPU ni conectividad.
- Preproceso para TTS o traducción: la salida limpia y puntuada reduce artefactos en síntesis de voz y facilita la segmentación en sistemas de traducción automática.
- Integración empotrada: el tamaño de 361,7 MiB en Q8_0 permite incluirlo en aplicaciones de escritorio o móviles junto al motor ASR, como en la comprobación del S25 Ultra con Parakeet residente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de evaluación son específicos de la tarea y del artefacto Q8_0:

| Evaluación | Resultado | Condiciones |
|---|---|---|
| Disposición de listas, exact match | 35,2 % con prosa + formateador de la app frente a 35,6 % con listas del modelo | 236 filas de desarrollo con listas, candidato final |
| Latencia en dictado corto | p50 155 ms / p95 178 ms | Q8_0, Galaxy S25 Ultra, helper directo, Parakeet residente |
| Latencia en dictado largo | p50 1.702 ms / p95 2.718 ms | Q8_0, Galaxy S25 Ultra, helper directo, Parakeet residente |
| Reproducibilidad BF16 | Dos ejecuciones idénticas sobre dos casos de entrada pública | CPU, BF16; es una comprobación de inferencia, no un benchmark de calidad |

El autor indica explícitamente que no se han medido el rendimiento en gama media ni el rendimiento extremo a extremo del producto, y que la recall de listas sigue siendo baja.

## Requisitos de hardware

- VRAM estimada: el fichero BF16 ocupa 708.984.464 bytes (unos 709 MB), por lo que la inferencia en BF16 requiere del orden de 1-1,5 GB contando caché KV y activaciones; en Q8_0 el peso son 361,7 MiB y el consumo baja aproximadamente a 0,5-1 GB; en FP32 serían unos 1,4 GB solo de pesos.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en RTX 3060/4060/4090, y no necesita A100 ni H100. También es viable en CPU.
- Cabe en GPU consumer: sí, en toda la gama actual, y en hardware móvil (validado en un Galaxy S25 Ultra con el artefacto Q8_0).
- Opciones de despliegue: Transformers con soporte de `Lfm2ForCausalLM` (el checkpoint se guardó con Transformers 5.2.0, sin código remoto); llama.cpp u otro runtime GGUF para el artefacto Q8_0; herramientas tipo Ollama o LM Studio mediante importación del GGUF, aunque el autor no documenta estas integraciones. El soporte en vLLM o TGI no está confirmado en la información disponible.
- Latencia y throughput: latencias medidas solo en el S25 Ultra con Q8_0 (155/178 ms p50/p95 en corto, 1.702/2.718 ms en largo). Throughput en tokens por segundo no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| scribekey/scribekey-cleanup-fast | 354.483.968 | 4.096 tokens en el perfil evaluado | ScribeKey Fast Model Terms v1.0 + LFM Open License v1.0 | Safetensors BF16, GGUF Q8_0 | Limpieza de transcripciones en inglés con línea de control |
| juanquivilla/sotto-cleanup-lfm25-350m | No disponible (modelo base directo de este ajuste) | No disponible | No disponible | No disponible | Limpieza de transcripciones; predecesor |
| LiquidAI/LFM2.5-350M-Base | 350M (familia) | No disponible | LFM Open License v1.0 (según la licencia combinada de este modelo) | No disponible | Modelo base general, sin ajuste de limpieza |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otras alternativas dedicadas a limpieza de transcripciones, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado, y el locale ortográfico se aplica como pasada de la aplicación, no como control del modelo.
- Ventana práctica corta: el perfil evaluado es de 4.000 caracteres de entrada, 4.096 tokens de contexto y un máximo de 256 tokens de salida; generaciones más largas pueden truncarse y el texto largo debe trocearse por frases.
- Adherencia imperfecta a los controles: el propio autor advierte que el seguimiento de estilo, estructura y contexto no es perfecto.
- Listas: el modelo generó más formato indeseado en dictado ordinario en el experimento previo, con una recall baja; la recomendación es usar prosa y formatear después de manera determinista.
- Riesgo de invención en contexto de correo: el modelo no debe inventar saludos ni despedidas, pero puede hacerlo; conviene validar la salida.
- La salida vacía para entradas que solo contienen muletillas no está garantizada en esta release, así que hay que definir una política de respaldo ante salidas vacías, parciales o malformadas.
- Formato de entrada estricto: un único mensaje de usuario con la línea de control primero, sin system prompt ni historial; una conversación estilo ChatML normal no es el formato de entrenamiento y degradará la salida. Hay que evitar el doble BOS al tokenizar a mano.
- Licencia no estándar: los ScribeKey Fast Model Terms v1.0 se suman a la LFM Open License v1.0 y hay avisos MIT heredados de Sotto; es obligatorio revisar `ADDITIONAL_TERMS.md` antes de un uso comercial.
- Evaluación limitada: validación offline del Q8_0 y una comprobación en un único dispositivo de gama alta; sin mediciones en gama media ni extremo a extremo, y sin benchmarks de calidad publicados.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, release `v1` y comportamiento de la aplicación (elección de estilo, formateador de listas, locale) fuera de los pesos publicados.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scribekey/scribekey-cleanup-fast
- Artefacto GGUF Q8_0: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF
- Términos adicionales de licencia: https://huggingface.co/scribekey/scribekey-cleanup-fast/blob/main/ADDITIONAL_TERMS.md
- Modelo base intermedio: https://huggingface.co/juanquivilla/sotto-cleanup-lfm25-350m
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/juanquivilla/sotto-transcript-cleanup
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles corresponden a tiendas de periféricos sin relación con este proyecto.
