# SaeedAngiz1/shahnameh-qwen3-4b-multilingual-lora

## Resumen

Shahnameh Qwen3-4B Multilingual LoRA es un adaptador LoRA (PEFT) publicado por el usuario SaeedAngiz1 que se monta sobre el modelo base `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit` para que este responda en verso al estilo del *Shahnameh* de Ferdowsi en tres idiomas: persa, ingles y aleman. No es un modelo completo, sino un delta de pesos que modifica el comportamiento estilistico del modelo base sin alterar su arquitectura transformer decoder-only ni su tokenizador.

El problema que aborda es acotado y de investigacion: transferir un registro poetico clasico (pareados con rima, cadencia y lexico arcaizante) a un LLM pequeno de 4.000 millones de parametros mediante ajuste fino supervisado sobre un corpus muy reducido (270 ejemplos en fa/en/de, con perdida calculada solo sobre la respuesta). El adaptador se entreno con LoRA de rango 16 en 2x Tesla T4 en 411 segundos, lo que lo convierte en un caso de estudio de bajo coste computacional mas que en una herramienta de produccion.

Su relevancia actual es metodologica y linguistica: demuestra como un adaptador diminuto (repo de 0,1 GB) puede modificar el estilo de salida en tres idiomas, y documenta de forma inusualmente honesta los limites del resultado. Segun las mediciones del propio autor, el modelo produce pareados rimados en persa en el 33 % de los casos (frente al 90 % del objetivo del corpus de entrenamiento) y no contamina el script persa con caracteres extranjeros, pero no ha sido validado por ningun hablante nativo en cuanto a metrica (عروض), gramatica o registro clasico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507; rango r=16, lora_alpha=16 |
| Parametros totales | Adaptador LoRA sobre un modelo base de 4.000 millones de parametros; numero exacto de parametros del adaptador no disponible |
| Longitud de contexto | No disponible en la ficha; el ejemplo de uso fija max_seq_length=1024 |
| Tipos de cuantizacion | Modelo base cargado en 4 bits (bnb-4bit); el ejemplo de uso emplea load_in_4bit=True; no se publican pesos GGUF |
| Idiomas soportados | Persa (fa), ingles (en), aleman (de) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria declarada: peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.000 millones de parametros de la familia Qwen3. El ajuste se realizo con LoRA de rango r=16 y lora_alpha=16 sobre la version del modelo base ya cuantizada a 4 bits de Unsloth. La receta de entrenamiento publicada es: learning rate 2e-4, 3 epocas, 270 ejemplos repartidos entre persa, ingles y aleman, perdida calculada unicamente sobre la respuesta (response-only loss), ejecucion en 2x NVIDIA Tesla T4 durante 411 segundos, con una mejor perdida de validacion de 2,553. No se menciona uso de RLHF ni DPO; el unico ajuste es supervisado sobre pares instruccion-respuesta en verso.

Como innovacion destacable no hay aportaciones de arquitectura: la contribucion es el corpus de estilo (verso nuevo escrito a imitacion de Ferdowsi, no texto original del *Shahnameh*) y la medicion mecanica de tres propiedades: porcentaje de pareados con rima en persa, presencia de caracteres extranjeros en el script persa y fluidez en ingles y aleman. El autor declara explicitamente que el adaptador ensena voz, no genealogia ni hechos del *Shahnameh*.

## Capacidades

- Generacion de texto en verso con rima y registro arcaizante en ingles, con resultados descritos por el autor como fluidos y genuinamente versales.
- Generacion de verso en persa con script limpio: la medicion reportada indica cero caracteres extranjeros en las respuestas en persa.
- Generacion de texto en aleman: fluido segun el autor, pero con deriva fuera del dominio poetico.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`) con mensaje de sistema que fija la persona del poeta.
- Transferencia de estilo condicionada por prompt: el estilo se activa con una instruccion de sistema que pide responder con la voz del *Shahnameh*.
- Generacion con muestreo configurable (temperature, top_p, top_k) y control de la longitud de salida.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio.
- Capacidades multilingues limitadas a los tres idiomas de entrenamiento (fa, en, de); no hay evidencia de generalizacion a otros idiomas.

## Casos de uso

- Prototipado de transferencia de estilo literario: sirve como punto de partida reproducible para experimentar con LoRA de bajo rango y comprobar cuanto estilo se puede inyectar con 270 ejemplos, usando el repositorio del autor como referencia metodologica.
- Generacion de contenido poetico en ingles para blogs o newsletters: el modelo produce pareados con rima aceptable en ingles, por lo que puede usarse para borradores de epigramas o versos citables que despues revise un editor humano.
- Investigacion sobre preservacion de script en modelos multilingues: al reportar cero caracteres extranjeros en persa, es un caso util para estudiar como el ajuste fino afecta a la pureza del script en alfabetos no latinos.
- Creacion de demos interactivas de chatbot con persona literaria: la plantilla de chat permite montar una demo en la que el asistente responde siempre con la voz de Ferdowsi, util para exposiciones, talleres o actividades educativas sobre literatura persa.
- Estudio comparativo de adaptadores hermanos: el autor publica un adaptador solo en persa con mejor rima (65 %) pero con contaminacion de script, lo que permite disenar experimentos controlados sobre el compromiso entre forma y pureza de escritura.
- Generacion de material auxiliar para aprendizaje de idiomas: los versos en ingles y aleman pueden usarse como ejemplos de registro elevado, siempre que un docente verifique el contenido, dado que los hechos que aparecen son con frecuencia incorrectos.
- Pruebas de robustez y evaluacion de alucinacion en modelos pequenos: el modelo inventa nombres y relaciones del *Shahnameh*, lo que lo convierte en un banco de pruebas para metricas de fidelidad factual en generacion creativa.
- Experimentos de bajo coste en hardware de gama media: al ser un adaptador sobre un modelo de 4B en 4 bits, permite reproducir el ajuste completo en el rango de las tres horas de computo declaradas, adecuado para docencia universitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta mediciones internas de calidad de estilo:

| Metrica | Datos de entrenamiento (objetivo) | Este modelo | Adaptador hermano solo en persa |
|---|---|---|---|
| Pareados con rima en persa | 90 % | 33 % | 65 % |
| Caracteres extranjeros en persa | ninguno | ninguno | ~6 por cada 10 respuestas |
| Perdida de validacion (mejor) | no disponible | 2,553 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3-4 GB con el modelo base en 4 bits (bnb-4bit) y una ventana de 1.024 tokens; en fp16/bf16 el modelo base de 4B requiere aproximadamente 8-9 GB.
- GPU utilizadas en el entrenamiento: 2x NVIDIA Tesla T4 (16 GB cada una), en la capa gratuita de Kaggle, con un tiempo total de 411 segundos.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB ejecutan el modelo con holgura en 4 bits; en 8 GB de VRAM conviene mantenerse en cuantizacion de 4 bits y ventanas cortas.
- Opciones de despliegue: el ejemplo oficial usa `unsloth.FastLanguageModel` con `load_in_4bit=True`; al ser un adaptador PEFT, tambien es cargable con la libreria `peft` sobre el modelo base, y el modelo base en formato completo es compatible con stacks de inferencia habituales (vLLM, TGI) siempre que se fusione el adaptador previamente. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion manual del modelo fusionado.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rima persa | Caracteres extranjeros en persa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SaeedAngiz1/shahnameh-qwen3-4b-multilingual-lora | 4B (base) + adaptador LoRA | no disponible en la ficha (uso a 1.024) | 33 % | ninguno | apache-2.0 | HuggingFace, 0 descargas |
| SaeedAngiz1/shahnameh-qwen3-4b-fa-lora | 4B (base) + adaptador LoRA | no disponible | 65 % | ~6 por cada 10 respuestas | no disponible en la informacion | HuggingFace |
| unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit (modelo base) | 4B | no disponible en la informacion | no aplica (sin estilo Shahnameh) | no aplica | no disponible en la informacion | HuggingFace |

No se dispone de datos sobre otros adaptadores de poesia persa comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Fidelidad factual muy baja: el propio autor advierte que el conjunto de datos ensena voz, no genealogia del *Shahnameh*, por lo que deben esperarse nombres inventados y relaciones entre personajes invertidas.
- El persa nunca ha sido revisado por un hablante nativo: la rima y la pureza del script se midieron de forma mecanica, mientras que la metrica (عروض), la gramatica y el registro clasico quedan sin verificar.
- Estilo persa debil: solo el 33 % de los pareados riman, frente al 90 % del corpus objetivo y al 65 % del adaptador hermano solo en persa.
- Deriva tematica en aleman: el autor describe la salida alemana como fluida pero fuera del dominio poetico esperado.
- Variabilidad entre ejecuciones: a temperature=0.7 la salida cambia de una ejecucion a otra, por lo que cualquier evaluacion debe hacerse sobre promedios y no sobre ejemplos favorables.
- Corpus de entrenamiento muy reducido (270 ejemplos en la variante multilingue): suficiente para el estilo, insuficiente para prosodia o conocimiento del dominio.
- Riesgo de alucinacion alto en cualquier consulta factual, incluida la propia obra de Ferdowsi.
- Idiomas limitados a persa, ingles y aleman; no hay evidencia de comportamiento correcto fuera de esos tres idiomas.
- Restricciones de licencia: el adaptador se publica bajo apache-2.0, pero el uso comercial del conjunto (adaptador mas modelo base) depende de las condiciones del modelo base `Qwen3-4B-Instruct-2507`, cuyos terminos no se detallan en la informacion disponible.
- Credito y procedencia: el verso de entrenamiento es nuevo, escrito a imitacion de Ferdowsi, no texto original del *Shahnameh* (completado en 1010 d. C.); conviene no presentar las salidas como traducciones o citas de la obra.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- HuggingFace (adaptador multilingue): https://huggingface.co/SaeedAngiz1/shahnameh-qwen3-4b-multilingual-lora
- HuggingFace (adaptador hermano solo en persa): https://huggingface.co/SaeedAngiz1/shahnameh-qwen3-4b-fa-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Repositorio del proyecto con metodo, mediciones y registro de fallos: https://github.com/SaeedAngiz1/shahnameh-slm
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda disponibles; los resultados devueltos corresponden a portales inmobiliarios y no guardan relacion con el modelo.
