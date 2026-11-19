# AfriSpeech/gemma-3-1b-translate-sft-best

## Resumen

`AfriSpeech/gemma-3-1b-translate-sft-best` es un modelo de traducción automática inglés → lenguas africanas obtenido mediante fine-tuning supervisado (SFT) sobre `google/gemma-3-1b-it`. Lo publica el usuario AfriSpeech en Hugging Face, si bien la model card atribuye el trabajo a Aletheia AI y remite como versión final al modelo derivado `BeardedMonster/gemma-3-1b-translate-best`, fruto de una etapa posterior de aprendizaje por refuerzo. Con aproximadamente 1.000 millones de parámetros (999.885.952 según los safetensors), está diseñado para una tarea muy concreta: traducir una frase o un párrafo corto del inglés a una de las 125 etiquetas de lengua africana que maneja (105 con datos de SFT y 20 sin ellos).

El modelo resuelve un problema de cobertura: la mayoría de los traductores neuronales de gran escala tienen un rendimiento muy desigual en lenguas africanas de bajos recursos. Este modelo parte de un Gemma 3 pequeño e instruido y lo especializa mediante instrucciones en formato chat, forzando una salida estructurada con una etiqueta de lengua (por ejemplo `<yor>`) seguida de la traducción. Es relevante ahora porque demuestra que un modelo de ~1B puede adaptarse a más de un centenar de lenguas con un coste de cómputo bajo, aunque con limitaciones claras de calidad y de estabilidad de generación.

Conviene subrayar que esta ficha corresponde a la variante **solo SFT**, que la propia model card describe como punto de partida para RL y no como la mejor opción para traducción directa: el modelo a menudo no se detiene o entra en bucles, y su chrF++ en FLORES+ es de 25,66 en decodificación greedy, frente a 35,28 del modelo posterior entrenado con RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 999.885.952 (~1,0B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de despliegue usan `max_model_len=4096`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bfloat16/safetensors) |
| Idiomas soportados | Ingles (entrada) y 125 etiquetas de lenguas africanas (105 con datos de SFT, 20 sin ellos); salida solo en lengua africana |
| Licencia | `other`: uso comercial libre con atribucion obligatoria a "Translation models by Aletheia AI" y citacion del paper; se aplican ademas los Gemma Terms of Use y la Prohibited Use Policy |
| Formato de pesos | safetensors (libreria `transformers`; compatible con text-generation-inference y endpoints) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3 en su variante de texto (`gemma3_text`), con aproximadamente 1.000 millones de parámetros y pesos en bfloat16. Se inicializa desde `google/gemma-3-1b-it`, la versión instruida del modelo base, y se especializa mediante *supervised fine-tuning* (SFT) en pares de traducción inglés → lengua africana. No hay en la información disponible datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO; la model card solo indica que se trata de un entrenamiento supervisado y que el modelo resultante sirve como punto de partida para una etapa posterior de RL.

La innovación técnica principal es el formato de instrucción y salida: el prompt usa la plantilla de chat de Gemma con un turno de usuario del tipo `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos) y el modelo responde con una etiqueta de lengua de tres letras entre ángulos (`<yor>`, `<hau>`, etc.) seguida de la traducción y del token `<end_of_turn>`. Esas etiquetas son entradas de vocabulario ordinarias, no tokens especiales, de modo que `skip_special_tokens=True` no las elimina y hay que retirarlas explícitamente con una expresión regular. El modelo está restringido a la dirección inglés → lengua africana y está pensado para una frase o un párrafo corto por petición.

## Capacidades

- Traducción automática inglés → lengua africana para 125 etiquetas de lengua, con 105 de ellas cubiertas por datos de SFT y 20 sin datos específicos.
- Generación de texto condicionada por instrucciones en formato chat de Gemma 3, con plantilla de turnos `user`/`model`.
- Salida estructurada con etiqueta de lengua de tres letras como marcador de idioma destino.
- Traducción de una frase o un párrafo corto por petición; los documentos largos deben dividirse en frases.
- Soporte de decodificación greedy (`do_sample=False` o `temperature=0`) y de `frequency_penalty` en vLLM para mitigar repeticiones y bucles.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.

## Casos de uso

- Traducción de contenidos editoriales y divulgativos a lenguas africanas de amplia cobertura (yoruba, hausa, igbo, suajili, zulú): se enviaría cada frase o párrafo corto como un turno de usuario con el nombre de la lengua y se procesaría en lote con vLLM, aprovechando el bajo coste de un modelo de ~1B.
- Localización de interfaces y cadenas de producto: al tratarse de textos cortos, el modelo encaja en un pipeline que traduzca etiquetas, mensajes de error y textos de ayuda frase a frase, con revisión humana posterior por la variabilidad de calidad entre lenguas.
- Generación de datos sintéticos multilingües para entrenar otros sistemas: el modelo puede producir borradores de traducción en las 105 lenguas con datos de SFT que luego se filtren o se corrijan, como paso previo a la anotación humana.
- Investigación en traducción de bajos recursos: sirve como referencia reproducible de un SFT sobre Gemma 3 1B y como punto de partida para experimentos de RL o de fine-tuning adicional, tal como indica la model card.
- Prototipado rápido y demos: su tamaño reducido permite desplegarlo en una sola GPU consumer o incluso en CPU con cuantización, lo que facilita demos interactivas de traducción a lenguas africanas sin infraestructura dedicada.
- Evaluación comparativa de cobertura lingüística: al exponer 125 etiquetas de lengua, permite medir de forma sistemática qué lenguas quedan fuera del alcance de un modelo de ~1B y dónde hace falta más datos.
- Traducción asistida en entornos con requisitos de atribución: la licencia permite uso comercial con atribución a Aletheia AI y cumplimiento de los términos de Gemma, lo que encaja en productos que puedan asumir esas condiciones.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas chrF++ sobre FLORES+ reportadas en la model card para este modelo SFT y para el modelo posterior entrenado con RL:

| Metrica (FLORES+, ingles → lenguas africanas) | Este modelo (SFT) | Modelo RL (`BeardedMonster/gemma-3-1b-translate-best`) |
|---|---|---|
| chrF++ (greedy) | 25,66 | 35,28 |
| chrF++ (frequency penalty 0,1) | 29,11 | no disponible |
| Salidas greedy que terminan dentro de 768 tokens | 84,5 % | no disponible |
| Salidas con frequency penalty 0,1 que terminan dentro de 768 tokens | 99,8 % | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2 GB solo para los pesos (1,0B parámetros × 2 bytes), más overhead de activaciones y caché KV; con `max_model_len=4096` conviene reservar al menos 4-6 GB en total.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM es suficiente para bfloat16; una RTX 4090, A100 o H100 ofrecen un margen amplio y permiten lotes grandes.
- Cabe en GPU consumer: sí, en tarjetas de 8 GB o más (RTX 3060/4060 en adelante); con cuantización a 8 o 4 bits cabría en GPUs de 4-6 GB, aunque no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: `transformers` (>= 4.56), vLLM (`vllm serve ... --max-model-len 4096`), servidor compatible con OpenAI (`/v1/chat/completions`) y text-generation-inference, ya que el repositorio está marcado como compatible con TGI y endpoints. No se documenta soporte explícito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo está pensado para decodificación greedy con `max_new_tokens=256` en frases cortas y 768 en las evaluaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AfriSpeech/gemma-3-1b-translate-sft-best` | ~1,0B | no disponible (ejemplos con 4096) | chrF++ 25,66 (greedy) / 29,11 (fp 0,1) en FLORES+ | `other` con atribucion y terminos de Gemma | Hugging Face, transformers, vLLM, TGI |
| `BeardedMonster/gemma-3-1b-translate-best` | ~1,0B | no disponible | chrF++ 35,28 en FLORES+ | no disponible en la informacion proporcionada | Hugging Face |
| `google/gemma-3-1b-it` (modelo base) | ~1,0B | no disponible | no disponible para traduccion a lenguas africanas | terminos de Gemma | Hugging Face |

No se dispone en la información proporcionada de comparaciones con otros traductores multilingües de tamaño similar (por ejemplo, modelos especializados en lenguas africanas de otros autores), por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- El modelo a menudo no se detiene o entra en bucles: solo el 84,5 % de las salidas greedy terminan dentro de 768 tokens, y se recomienda fijar un presupuesto máximo de tokens y usar `frequency_penalty=0.1` en vLLM.
- Calidad limitada: chrF++ de 25,66 en greedy, entre 6 y 10 puntos por debajo del modelo posterior entrenado con RL; para traducción directa la model card recomienda `BeardedMonster/gemma-3-1b-translate-best`.
- Solo traduce inglés → lengua africana; no se documenta la dirección inversa ni la traducción entre lenguas africanas.
- Cobertura desigual: 20 de las 125 etiquetas de lengua no tienen datos de SFT, por lo que su calidad es previsiblemente inferior.
- Restricción de longitud: está pensado para una frase o un párrafo corto por petición; los documentos largos deben dividirse en frases.
- La etiqueta de lengua de salida es un token de vocabulario ordinario que hay que eliminar manualmente; no se elimina con `skip_special_tokens=True`.
- Licencia: uso comercial permitido con atribución obligatoria a "Translation models by Aletheia AI" y citación del paper; se aplican además los Gemma Terms of Use y la Prohibited Use Policy, lo que impone restricciones adicionales de uso.
- Riesgo de alucinación y de traducciones inexactas, especialmente en lenguas con pocos datos; no se documentan sesgos específicos en la información disponible.
- No se documentan en la información disponible capacidades de tool calling, agentes ni multimodalidad, pese a que el modelo base Gemma 3 sí las contempla en otras variantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AfriSpeech/gemma-3-1b-translate-sft-best
- Modelo posterior entrenado con RL: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Licencia del modelo: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-sft-best/blob/main/LICENSE.md
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
