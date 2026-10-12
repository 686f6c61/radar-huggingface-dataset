# ductai199x/utter

## Resumen

Utter es un modelo de limpieza de dictado desarrollado por ductai199x, pensado para funcionar como la segunda etapa de una aplicación de dictado por voz local (Utter). No realiza reconocimiento de voz: recibe la transcripción en bruto que ha producido el reconocedor (NVIDIA Parakeet) y devuelve el texto que el hablante habría tecleado, aplicando puntuación, mayúsculas, conversión de símbolos y números hablados a su forma escrita, eliminación de muletillas y arranques en falso, autocorrecciones, retracciones y formato de listas, corrigiendo la gramática sin sustituir las palabras del usuario.

Se distribuye en dos variantes con arquitectura transformer decoder-only de la familia Gemma 4, ajustadas mediante LoRA (rango 16, alpha 32) sobre los checkpoints QAT sin cuantizar de Google: Utter Quality v1 parte de Gemma 4 E4B y Utter Light v1 de Gemma 4 E2B. Ambas se fusionan y cuantizan a Q4_0 en formato GGUF para su uso en llama.cpp. El checkpoint E4B tiene 4.628.569.635 parámetros en safetensors.

Su relevancia actual radica en que resuelve un problema muy concreto de los flujos de dictado local: transformar habla desordenada en texto listo para enviar sin depender de la nube, con un consumo de VRAM de aproximadamente 3,3 GB (Quality) y 1,8 GB (Light), y latencias medianas de 250 ms y 180 ms respectivamente en una RTX 3090 Ti. Está licenciado bajo Apache 2.0 y soporta únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4) con ajuste fino LoRA (rango 16, alpha 32) |
| Parametros totales | 4.628.569.635 (checkpoint E4B, variante Quality, segun safetensors); variante Light basada en Gemma 4 E2B (numero exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (GGUF); adaptadores LoRA en safetensors; base QAT sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_0) y safetensors (adaptadores LoRA) |

Notas por variante:

| Variante | Modelo base | VRAM aproximada (GPU) | Fichero |
|---|---|---|---|
| Utter Quality v1 | google/gemma-4-e4b-it-qat-q4_0-unquantized | ~3,3 GB (con embeddings por capa en RAM del sistema) | utter-quality-v1-q4_0.gguf |
| Utter Light v1 | google/gemma-4-E2B-it-qat-q4_0-unquantized | ~1,8 GB | utter-light-v1-q4_0.gguf |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 4 al que se le aplica un ajuste fino mediante LoRA de rango 16 y alpha 32 sobre el checkpoint QAT (quantization-aware training) sin cuantizar de Google. Tras el entrenamiento, el adaptador se fusiona con la base y se cuantiza a Q4_0, que es el formato para el que el QAT estaba preparado. Utter Quality v1 usa Gemma 4 E4B y Utter Light v1 usa Gemma 4 E2B; ambos adaptadores se publican también por separado (rango 16) para fusionado o entrenamiento posterior. La inferencia se realiza en llama.cpp (versión b11535 o posterior) y requiere desactivar el modo thinking (`chat_template_kwargs: {"enable_thinking": false}`).

Los datos de entrenamiento son pares (salida del reconocedor, texto pretendido). El lado escrito se compone de pasajes reales de Common Pile (Stack Exchange, GitHub, resúmenes de arXiv, IRC de Ubuntu) y Wikipedia, además de listas y mensajes cotidianos generados por LLM. El lado hablado se generó con Gemma 4 26B-A4B en ocho modalidades (plano, puntuación hablada, disfluente, autocorrección, comando de retracción, reformulación de frase, errores gramaticales y edición hacia atrás en el texto), validado por código, sintetizado con voz Kokoro TTS y reconocido por Parakeet. Las claves de respuesta se fijaron para erratas y gramática, verificando cada corrección con ERRANT.

Los volúmenes de entrenamiento reportados son: Light v1, una pasada de 89.499 pares con learning rate 2e-4 y 1 época; Quality v1, primera pasada de 89.499 pares con lr 2e-4 y 1 época, y segunda pasada desde el primer adaptador de 45.660 pares (con líneas `Dictionary:`) con lr 1e-4 y 1 época. Ningún pasaje de evaluación se usó durante el entrenamiento (held out). No se menciona uso de RLHF ni DPO.

## Capacidades

- Limpieza de dictado: añade puntuación y mayúsculas no pronunciadas, y elimina muletillas y arranques en falso.
- Normalización de texto: convierte símbolos y números hablados a su forma escrita ("four x faster" a "4× faster", "about two forty" a "~240").
- Aplicación de correcciones habladas: autocorrecciones ("at 2, actually 3"), retracción de la última frase ("scratch that"), reinicio completo ("let's start over") y ediciones hacia atrás ("actually, change the eggs to three boxes").
- Formato de listas habladas como viñetas, numeradas cuando son pasos.
- Corrección gramatical conservando las palabras del hablante.
- Diccionario personal: aplica la grafía correcta de términos propios cuando aparecen en la línea `Dictionary:`, incluyendo casos de palabras mal oídas y de términos parecidos que no deben forzarse.
- Distinción entre dictado y petición: el texto dictado se escribe, nunca se responde (una pregunta o una instrucción a una IA se devuelve como texto).
- No realiza reconocimiento de voz ni procesamiento de audio; solo transforma texto a texto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modo thinking debe estar desactivado).
- Capacidades multilingües: solo inglés.
- Capacidad especial: prompting específico con system prompt fijo y contexto opcional (App, Before, Lists, Dictionary).

## Casos de uso

- Dictado local en escritorio: el modelo limpia la transcripción de Parakeet para que el usuario envíe texto correcto sin editar manualmente; su bajo consumo de VRAM (1,8 a 3,3 GB) permite ejecutarlo en el mismo equipo que hace el reconocimiento.
- Redacción de correos y mensajes: con la variante Quality y un diccionario de nombres propios, convierte notas habladas con muletillas y autocorrecciones en mensajes listos para enviar (89,3% "ready to send" en el conjunto realista con voces Kokoro).
- Edición por voz sobre texto existente: la línea `Before:` con el texto anterior al cursor permite aplicar correcciones hacia atrás y retracciones, útil para revisar borradores dictados.
- Dictado de listas y procedimientos: transforma enumeraciones habladas en viñetas y listas numeradas para pasos, adecuado para notas de reunión o checklists.
- Entrada de texto en entornos con poca VRAM: la variante Light (E2B) funciona con ~1,8 GB de GPU y permite que el reconocimiento de voz se ejecute en CPU en máquinas modestas.
- Dictado de prompts e instrucciones para IA: en el conjunto dirigido con diccionario alcanza 89,7% (Quality) y 86,6% (Light) al devolver instrucciones y preguntas como texto limpio, sin responderlas, para pegarlas después en otra herramienta.
- Corrección gramatical asistida: corrige errores gramaticales manteniendo las palabras del hablante, útil para transcripciones de reuniones posteriores.

## Benchmarks y rendimiento

La evaluación propia se basa en la métrica "ready to send" (proporción de dictados que un escritor cuidadoso enviaría exactamente como quedan), puntuada por Gemma 4 26B-A4B (Q4_0, llama.cpp) frente al texto pretendido, con rúbrica calibrada sobre revisión humana.

| Conjunto | Quality v1 | Light v1 |
|---|---|---|
| Realista, voces Kokoro | 89,3% | 87,5% |
| Realista, con diccionario de 300 terminos | 88,9% | 87,3% |
| Realista, voces Chatterbox no vistas | 82,3% | 78,0% |
| Dirigido, con diccionario | 89,7% | 86,6% |
| Tiempo de limpieza, mediana (RTX 3090 Ti) | ~250 ms | ~180 ms |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: aproximadamente 3,3 GB para Utter Quality v1 (cuando los embeddings por capa permanecen en la RAM del sistema) y aproximadamente 1,8 GB para Utter Light v1.
- GPU recomendadas: no se especifican modelos concretos; la medición de latencia se realizó en una RTX 3090 Ti. Al tratarse de modelos de 4,6B/E2B cuantizados a Q4_0, caben en la mayoría de GPU consumer de gama media y alta.
- Cabe en GPU consumer: sí, ambas variantes, dado su bajo consumo (1,8-3,3 GB). En la variante Light el reconocimiento de voz puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (versión b11535 o posterior) para los ficheros GGUF; los adaptadores LoRA en safetensors se pueden fusionar con el checkpoint base para otros runners. No se mencionan vLLM, TGI ni Ollama.
- Latencia: mediana de aproximadamente 250 ms (Quality) y 180 ms (Light) en RTX 3090 Ti.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de otros modelos públicos comparables de limpieza de dictado en la informacion proporcionada, por lo que la comparativa se limita a las dos variantes del propio modelo.

| Modelo | Base | VRAM (GPU) | Ready to send (realista Kokoro) | Tiempo mediano | Licencia |
|---|---|---|---|---|---|
| Utter Quality v1 | Gemma 4 E4B | ~3,3 GB | 89,3% | ~250 ms | Apache 2.0 |
| Utter Light v1 | Gemma 4 E2B | ~1,8 GB | 87,5% | ~180 ms | Apache 2.0 |
| Gemma 4 E4B base (sin ajuste) | - | no disponible | no disponible | no disponible | Apache 2.0 |

Comparativa con alternativas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Cobertura de idioma limitada a inglés (en).
- Riesgo conocido: una muletilla inicial seguida de coma ("Uh, so...") puede sobrevivir a la limpieza.
- El caso de los pronombres ("me and him went") no siempre se corrige.
- Riesgo de alucinación: no cuantificado en la informacion disponible; el modelo está entrenado para no responder al texto dictado, pero no hay datos sobre su tasa de errores fabulados.
- La evaluación se realizó con habla sintética (dos motores TTS: Kokoro y Chatterbox), no con dictado grabado real; el rendimiento con voces no vistas cae hasta 82,3% (Quality) y 78,0% (Light).
- Prompting restrictivo: requiere un system prompt exacto y el modo thinking desactivado; desviarse de ese formato puede degradar la salida.
- El diccionario debe incluir solo los términos relevantes para cada dictado, no la lista completa del usuario.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial; el texto de entrenamiento procede de fuentes con licencias abiertas (dominio público, CC0, CC BY-SA, MIT, Apache-2.0).
- No realiza reconocimiento de voz: depende de un transcriptor externo (NVIDIA Parakeet) aguas arriba.

## Enlaces

- HuggingFace: https://huggingface.co/ductai199x/utter
- Repositorio de la aplicación Utter: https://github.com/ductai199x/utter
- Modelo base Quality: https://huggingface.co/google/gemma-4-e4b-it-qat-q4_0-unquantized
- Modelo base Light: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
