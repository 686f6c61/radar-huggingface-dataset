# Grizzlykw/emojilm

## Resumen

EmojiLM es un modelo de traduccion entre ingles y emoji desarrollado por el usuario Grizzlykw y publicado en Hugging Face. Se trata de un Transformer decoder-only entrenado desde cero con 11.233.920 parametros y una ventana de contexto de 256 tokens, disenado especificamente para dos tareas: sustituir palabras marcadas por emojis (encode) y decodificar secuencias de emojis de vuelta a texto (decode). Ademas incorpora un modo "rebus" para resolver jeroglificos visuales basados en la fonetica de los emojis.

El modelo no es un LLM de proposito general: es una herramienta especializada de edicion de texto que combina generacion neuronal con reglas curadas y lecturas almacenadas en el checkpoint. Esta hibridacion es relevante porque permite obtener resultados deterministas en casos conocidos (lecturas de emojis individuales y combinaciones frecuentes) y delegar en la red neuronal la desambiguacion de palabras polisemicas como `mouse`, `bat` o `seal`.

Su interes practico reside en la naturaleza acotada del problema: con solo 11 millones de parametros y un checkpoint de 0,1 GB, demuestra como un modelo diminuto puede resolver una tarea linguistica concreta cuando se acompana de un pipeline de reglas y clasificadores de sentido ajustados sobre representaciones congeladas. La ficha refleja un modelo experimental, sin descargas ni likes, con licencia no disponible y evaluacion limitada a un conjunto reducido de ejemplos en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only entrenado desde cero |
| Parametros totales | 11.233.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch personalizado, sin versiones GGUF publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible (el codigo fuente se distribuye bajo MIT, pero la licencia del checkpoint no se especifica) |
| Formato de pesos | `model.pt` (checkpoint PyTorch personalizado con pesos, configuracion, tokenizer y lecturas embebidas); `tokenizer.json` como exportacion separada |

## Arquitectura y entrenamiento

EmojiLM es un Transformer decoder-only de 11.233.920 parametros con 256 tokens de contexto, entrenado desde cero. El entrenamiento duro 12.000 pasos con un batch size de 32 y una tasa de aprendizaje maxima de `4e-4`. La mezcla de datos combina ejemplos curados de emojis y rebus, 84 ediciones con corchetes disenadas para ensenar distintos sentidos de `mouse`, `bat` y `seal`, y tres fuentes adicionales: nombres y palabras clave Unicode CLDR en ingles para emojis individuales, el dataset Text2Emoji (frases en ingles emparejadas con resumenes de emojis) y TinyStories (pasajes narrativos convertidos en ejemplos con sustituciones de emojis en contexto).

Una innovacion destacable es el uso de clasificadores de sentido de palabra ajustados sobre las representaciones congeladas del Transformer. Tras el entrenamiento, se ajustaron clasificadores usando las 84 ediciones de ambiguedad y 84 frases de contraste adicionales; solo los clasificadores de `mouse` y `bat` mejoraron la precision en desarrollo, y el checkpoint final incluye esos dos con 1.605 coeficientes en total. El CLI combina reglas curadas, lecturas almacenadas y el modelo: para una palabra marcada con varias sustituciones almacenadas, el modelo ordena las candidatas usando la frase completa, mientras que la decodificacion de emojis individuales y combinaciones conocidas usa lecturas almacenadas en lugar de generacion neuronal.

## Capacidades

- Traduccion de ingles a emoji (encode): sustituye palabras marcadas entre corchetes por el emoji correspondiente, por ejemplo `I baked an [apple] [pie].` produce `I baked an 🍎 🥧.`
- Traduccion de emoji a ingles (decode): convierte secuencias de emojis en texto, por ejemplo `I baked 🍎🥧 yesterday.` produce `I baked apple pie yesterday.`
- Modo rebus: resuelve jeroglificos foneticos con emojis, por ejemplo `🐝🍃` produce `believe` (bee + leaf).
- Desambiguacion de sentido de palabra limitada: clasificadores especificos para `mouse` y `bat` que seleccionan el emoji correcto segun el contexto de la frase.
- Ranking de candidatos: cuando una palabra marcada tiene varias sustituciones almacenadas, el modelo ordena las opciones usando la frase como contexto.
- Edicion de texto con corchetes como mecanismo de marcado explicito de los spans a transformar.
- Capacidades multilingues: no disponibles; solo ingles.
- Tool calling, function calling, agentes, vision, audio y modo thinking: no disponibles.

## Casos de uso

- Preprocesamiento de contenido para redes sociales: convertir palabras clave marcadas en emojis dentro de textos en ingles para publicaciones, con la ventaja de que el modo encode es determinista en palabras conocidas y el modelo solo interviene en la desambiguacion.
- Normalizacion de texto con emojis para pipelines de NLP: decodificar secuencias de emojis a palabras en ingles antes de aplicar analisis de sentimiento o indexacion, usando las lecturas almacenadas para emojis individuales y el modelo para combinaciones.
- Generacion de pistas de tipo rebus para juegos y educacion: el modo rebus produce lecturas foneticas de secuencias de emojis, adecuado para crear acertijos o material didactico de vocabulario en ingles.
- Prototipado de interfaces de accesibilidad: convertir mensajes con emojis a texto plano en ingles para lectores que prefieran contenido sin pictogramas, aprovechando el contexto de 256 tokens suficiente para frases y parrafos cortos.
- Investigacion sobre desambiguacion lexica en modelos diminutos: el checkpoint y los clasificadores de sentido de `mouse` y `bat` sirven como caso de estudio reproducible de como ajustar clasificadores sobre representaciones congeladas con muy pocos datos (84 ediciones mas 84 frases de contraste).
- Filtrado y moderacion de contenido basado en emojis: decodificar emojis a palabras para detectar terminos sensibles en mensajes cortos en ingles, combinando reglas curadas con el modelo para los casos no cubiertos.
- Ensenanza de ingles como segunda lengua: ejercicios de sustitucion palabra-emoji y de lectura de rebus para practicar vocabulario y fonetica con retroalimentacion inmediata.

## Benchmarks y rendimiento

Los resultados publicados en la model card miden coincidencias exactas del motor `model-edit` (que incluye el uso de lecturas almacenadas) y, en la ultima fila, generacion neuronal directa sobre un holdout compacto separado que cubre encode, decode y rebus.

| Conjunto de prueba | Baseline V1 | Checkpoint anterior | Con clasificadores de sentido |
|---|---:|---:|---:|
| Frases largas con palabras marcadas o emojis | 120/120 | 119/120 | 119/120 |
| Prompts de edicion originales | 91/110 | 91/110 | 91/110 |
| Palabras ambiguas, holdout original | 12/28 | 16/28 | 19/28 |
| Palabras ambiguas, 21 frases adicionales | — | 10/21 | 11/21 |
| Holdout compacto, generacion neuronal directa | 40/120 | 46/120 | 46/120 |

La model card senala que la actualizacion selecciono correctamente 🏏 en "The cricketer rested the [bat] against the stumps.", pero tambien introdujo errores, como elegir 🏏 para un murcielago que caza una polilla. En las 21 frases adicionales, la ganancia neta fue de una coincidencia exacta. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 11,2 millones de parametros (aproximadamente 45 MB de pesos), mas el overhead del runtime de PyTorch y las lecturas embebidas; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada para este modelo; cabe en CPU sin problema y en GPUs integradas. Una RTX 4090 o A100 no aportan ventaja practica frente a hardware modesto.
- Cabe en cualquier GPU consumer: si, incluidas GTX 1050, RTX 3050 o superiores, y tambien en CPU.
- Opciones de despliegue: el modelo se carga mediante el runtime Python propio de EmojiLM (`python3 -m emojilm.generate`), que lee `model.pt` desde `ckpt/final/` o la ruta indicada con `--ckpt`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que el checkpoint es un formato PyTorch personalizado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo y el contexto de 256 tokens, la inferencia en CPU deberia ser del orden de milisegundos por peticion, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. EmojiLM no es un LLM de proposito general y no hay datos publicados que permitan compararlo con alternativas de la misma categoria (traduccion texto-emoji o edicion de texto con emojis) en parametros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmojiLM | 11.233.920 | 256 tokens | Traduccion ingles-emoji y rebus | no disponible | Hugging Face (0 descargas) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los significados de los emojis dependen del contexto y de la convencion social; el modelo puede elegir el sentido equivocado de palabras como `mouse`, `bat` o `seal`, dejar spans desconocidos sin transformar o devolver una lectura literal que suene forzada en la frase.
- Los clasificadores de sentido solo cubren `mouse` y `bat`; el clasificador de `seal` no mejoro la precision en desarrollo y no se incluye.
- La evaluacion se limita a un conjunto pequeno de ejemplos en ingles, por lo que las cifras de exactitud no son extrapolables a dominios abiertos.
- Riesgo de alucinacion en generacion neuronal directa: el holdout compacto obtiene 46/120 coincidencias exactas, lo que indica que la generacion libre falla en la mayoria de casos fuera de las lecturas almacenadas.
- Limitacion idiomatica: solo soporta ingles; no hay capacidades multilingues.
- Limitacion de contexto: 256 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Restricciones de licencia: la licencia del checkpoint no esta disponible; el codigo fuente es MIT, pero cada dataset de entrenamiento tiene sus propios terminos. Antes de un uso comercial hay que verificar la licencia del modelo con el autor.
- Modelo experimental sin descargas ni likes en el momento de la consulta; no hay garantias de mantenimiento ni de soporte.
- En produccion, revisar la salida cuando el significado sea critico, tal como recomienda el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grizzlykw/emojilm
- Repositorio fuente en GitHub: https://github.com/skorotkiewicz/emojilm
- Dataset Text2Emoji: https://huggingface.co/datasets/KomeijiForce/Text2Emoji
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Anotaciones Unicode CLDR en ingles: https://github.com/unicode-org/cldr-json/tree/main/cldr-json/cldr-annotations-full/annotations/en
