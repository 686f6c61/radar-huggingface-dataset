# Hebrish/Hebrew-Gendered-Sentence-Creator

## Resumen

Hebrew-Gendered-Sentence-Creator es un ajuste fino por LoRA fusionado sobre `google/gemma-4-E4B-it`, desarrollado por el usuario Hebrish. Su proposito es generar frases en hebreo natural sin vocalizar (unpointed) en las que el genero gramatical de la primera persona (el "yo" del enunciado) coincida con un parametro de entrada (`m` o `f`). En hebreo el genero del hablante se marca en las letras de verbos, adjetivos y pronombres (אני הולך frente a אני הולכת), por lo que cualquier texto destinado a ser leido por una voz masculina o femenina en un sistema TTS debe estar ya flexionado antes de llegar al sintetizador.

El modelo resuelve un problema concreto de los pipelines de sintesis de voz y de generacion de guiones en hebreo: la necesidad de producir oraciones nuevas, no de reescribir texto existente, con el genero del hablante fijado de antemano. Se trata de un adaptador LoRA de rango 32 fusionado en el modelo base, con 7.941.100.874 parametros totales y un repositorio de 15,9 GB en formato safetensors. La version actual es la v3, marcada como work in progress, publicada el 18 de noviembre de 2026.

La relevancia actual radica en que cubre un nicho poco atendido: la generacion controlada por genero en hebreo para TTS y doblaje, con una evaluacion cuantitativa sobre 100 terminos reservados y una comparacion directa contra el prompt del modelo base. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B) con adaptador LoRA fusionado |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizacion, pero no se documenta en esta ficha) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo instruct `google/gemma-4-E4B-it`, de arquitectura transformer decoder-only con atencion y proyecciones MLP. Sobre ese modelo base se entreno un adaptador LoRA de rango 32, alpha 32 y dropout 0,05, aplicado unicamente a las proyecciones de atencion y MLP del modelo de lenguaje. El adaptador se fusiono posteriormente en los pesos, de modo que el repositorio contiene un modelo completo y no un adaptador separado. El entrenamiento uso learning rate 2e-4, schedule coseno, 2 epocas, batch efectivo de 16 (4 x 4) y 861 pasos, con la perdida calculada solo sobre la respuesta. Se ejecuto en una unica NVIDIA L40S en Modal durante 1.935 segundos.

Los datos provienen del dataset `Hebrish/Hebrew-Gendered-Sentences`. Claude Sonnet 5.5 genero 934 terminos hebreos de uso cotidiano con lineas de contexto; para cada termino y cada genero se escribieron 10 oraciones nativamente en ese genero. Se aplicaron filtros de formato (longitud, presencia del termino, ausencia de nikud) y una comprobacion del genero de la primera persona mediante `dicta-il/dictabert-joint`. El resultado fueron 17.725 oraciones conservadas y 6.884 ejemplos de entrenamiento sobre 834 terminos, con 100 terminos reservados para evaluacion. El modelo se entreno con un system prompt fijo que exige una respuesta en formato JSON con un array de `n` cadenas, y ese mismo prompt debe usarse en inferencia.

## Capacidades

- Generacion de texto en hebreo sin vocalizar, con oraciones de 6 a 18 palabras que usan un termino dado en el sentido descrito por un contexto.
- Control del genero gramatical de la primera persona mediante el parametro `speaker_gender` (`m` o `f`), con concordancia en las formas de primera persona.
- Generacion de multiples oraciones distintas en una sola pasada (`n` configurable), devueltas como array JSON.
- Respeto del genero de terceras personas, que conservan el suyo propio independientemente del genero del hablante.
- Aplicacion de prefijos al termino y flexión del mismo para concordar con el "yo".
- Salida estructurada en JSON, pensada para consumo programatico en pipelines.
- Capacidad multilingue limitada al hebreo como idioma de trabajo; el modelo base es multilingue pero el ajuste esta orientado a `he`.
- No dispone de tool calling, function calling, modo thinking, vision ni audio documentados en esta ficha; las etiquetas del repositorio incluyen `image-text-to-text` por herencia del modelo base, pero no se documenta su uso.

## Casos de uso

- Guiones de podcast con personajes de distinto genero: el modelo genera las lineas de cada personaje pasando `m` o `f` como `speaker_gender`, de modo que el texto llega al TTS ya flexionado y el sintetizador no tiene que corregir el genero.
- Doblaje y locucion automatizada: para una voz femenina o masculina concreta, se generan frases nuevas con la concordancia correcta antes de la sintesis, evitando errores de pronunciacion o de forma gramatical.
- Generacion de material didactico de hebreo: creacion de ejemplos de una misma palabra en contextos y generos distintos, util para ejercicios de concordancia y morfologia.
- Ampliacion de datasets de TTS: produccion de oraciones de entrenamiento etiquetadas por genero del hablante para voces masculinas y femeninas, a partir de un termino y un contexto.
- Asistentes conversacionales en hebreo con persona definida: cuando el asistente tiene una identidad de genero fija, el modelo genera respuestas y variantes de frase coherentes con esa identidad antes de enviarlas al motor de voz.
- Pruebas de calidad de pipelines de TTS: generacion controlada de pares de frases (misma idea, distinto genero) para verificar que el sintetizador y el analizador morfologico manejan correctamente la concordancia.
- Localizacion de contenido audiovisual: generacion de lineas nuevas para subtitulos o voice-over en hebreo con el genero del narrador fijado por el flujo de produccion.

## Benchmarks y rendimiento

Evaluacion sobre 100 terminos reservados por cada genero (`m` y `f`), con `n=10` y temperatura 0,8. Un "desacuerdo" es una forma de primera persona cuyas letras muestran el genero equivocado, segun el analizador `dictabert-joint` con reglas.

| Metrica | Gemma 4 E4B, solo prompt | v1 | v2 | v3 (esta version) |
|---|---|---|---|---|
| JSON no parseable (de 200) | 6 | 0 | 1 | 3 |
| Gate pass | 1.855/1.940 | 1.956/2.000 | 1.921/1.990 | 1.902/1.970 |
| "Yo" femenino: acuerdo / desacuerdo | 510 / 19 | 668 / 41 | 680 / 26 | 658 / 22 |
| "Yo" masculino: acuerdo / desacuerdo | 488 / 2 | 773 / 3 | 740 / 0 | 762 / 2 |
| Oraciones cuyas letras muestran el genero del hablante | 1.019 | 1.485 | 1.446 | 1.440 |

Frente al prompt del modelo base, el ajuste fino rompe el formato JSON con menos frecuencia, escribe aproximadamente un 40 % mas de oraciones en las que el genero del hablante es realmente visible y produce hebreo mas natural y variado, segun una lectura cualitativa del asistente del desarrollador; no se ha realizado evaluacion humana. La precision de genero para hablante femenino aun no supera la del prompt del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de 7,94 mil millones de parametros en bfloat16 requiere aproximadamente 16 GB solo para los pesos, mas memoria para el contexto y el KV cache.
- GPU recomendadas: no se documentan en la ficha. El entrenamiento se realizo en una NVIDIA L40S.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende de la cuantizacion, que no se documenta.
- Opciones de despliegue: la model card solo documenta `transformers` con `AutoModelForCausalLM` y `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hebrew-Gendered-Sentence-Creator (v3) | 7.941.100.874 | no disponible | Generacion de hebreo con genero del hablante controlado (LoRA fusionado) | Apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it (solo prompt) | no disponible en esta ficha | no disponible | Modelo base instruct multilingue | Apache-2.0 | Hugging Face |
| Hebrew-Gendered-Nikud (etapa 2 planificada) | no disponible | no disponible | Modelo de nikud consciente del genero | no disponible | Repositorio GitHub del autor |

No se dispone de datos de otros modelos especializados en generacion de hebreo con control de genero para establecer una comparativa mas amplia.

## Limitaciones y advertencias

- Terminos adjetivales en masculino con hablante femenino: si el termino se pasa en su forma masculina de diccionario y describe al hablante (מדוכא, אסיר תודה, שוכר, צמחוני), el modelo a menudo lo copia sin flexionar para `f` ("אני מדוכא"). Esto explica 17 de los 22 errores femeninos de la v3; la causa es un numero insuficiente de ejemplos de entrenamiento con el termino flexionado (134). Solucion provisional: pasar el termino ya flexionado para el hablante (`"term": "מדוכאה"`). Correccion prevista para la v4 con datos especificos para unos 300 terminos de autodescripcion.
- Sin garantia: un ajuste fino sigue siendo probabilistico. Para asegurar la correccion, conviene verificar las formas de primera persona de cada oracion con un analizador morfologico y regenerar las rechazadas; el codigo del analizador esta en el repositorio de GitHub (`scripts/analyse_modal.py`).
- Contenido: se producen deslices facticos o lexicos ocasionales, como "האטיג" o un etrog en Yom Kippur.
- Genero que solo se manifiesta en las vocales (רוצה, קונה, יפה): fuera del alcance de este modelo; corresponde a la etapa 2, Hebrew-Gendered-Nikud.
- El analizador de evaluacion tiene falsos positivos, por ejemplo טוב o נוח usados sobre algo distinto del hablante, lo que afecta a la interpretacion de las metricas.
- Estado work in progress: la version v3 se publica el 18 de noviembre de 2026 y puede cambiar.
- Licencia: Apache-2.0, heredada del modelo base, permite uso comercial; no obstante, el modelo esta pensado para hebreo y no se documentan garantias de calidad fuera de ese idioma.
- Requiere usar exactamente el system prompt de entrenamiento y el formato JSON de entrada; desviarse de ese formato puede degradar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Hebrew-Gendered-Sentence-Creator
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Hebrish/Hebrew-Gendered-Sentences
- Repositorio GitHub (codigo, scripts de entrenamiento y registro de experimentos): https://github.com/Hebrish-ASR/Hebrew-Gendered-Sentence-Creator
- Etapa 2 planificada (Hebrew-Gendered-Nikud): https://github.com/Hebrish-ASR/Hebrew-Gendered-Nikud
- Analizador morfologico usado en la evaluacion: https://huggingface.co/dicta-il/dictabert-joint
