# mradermacher/indri-0.1-350m-tts-GGUF

## Resumen

Indri 0.1 350m TTS es un modelo de sintesis de voz (text-to-speech) desarrollado originalmente por 11mlabs, distribuido aqui en formato GGUF por mradermacher para su uso con llama.cpp y herramientas compatibles. Se trata de un modelo compacto, con 446,7 millones de parametros reales en safetensors, pensado para generar audio a partir de texto en ingles e hindi. Su reducido tamano lo hace adecuado para despliegues en hardware modesto, incluyendo CPU y GPUs de consumo.

La relevancia de esta ficha radica en que el repositorio de mradermacher ofrece cuantizaciones estaticas del modelo original en un rango que va de Q2_K (0,3 GB) a f16 (1,0 GB), lo que permite ejecutar TTS en entornos con recursos limitados. El modelo esta publicado bajo licencia CC-BY-SA 4.0, lo que impone condiciones de atribucion y compartir-al-igual para usos derivados.

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la model card proporcionada, mas alla de la lista de datasets utilizados y los idiomas soportados. Esta ficha refleja unicamente los datos disponibles y marca explicitamente como "no disponible" todo aquello que no aparece en la informacion de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 446.752.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles), hi (hindi) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El nombre y el pipeline asociado indican que se trata de un modelo de sintesis de voz, pero no se detalla si emplea un transformer, un modelo acustico tipo VITS, un decodificador neuronal u otra aproximacion. Tampoco se especifican el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado.

Los datasets listados en la model card del modelo base son: speechcolab/gigaspeech, parler-tts/mls_eng_10k, reach-vb/jenny_tts_dataset, MikhailT/hifi-tts, ylacombe/expresso, keithito/lj_speech y collabora/ai4bharat-shrutilipi. Esta combinacion sugiere un entrenamiento multilingue con predominio de corpus en ingles y presencia de datos en hindi (shrutilipi), asi como corpus expresivos (expresso) y de dominio publico (lj_speech). No se detalla la composicion exacta ni el peso relativo de cada dataset.

## Capacidades

- Sintesis de voz a partir de texto en ingles e hindi.
- Generacion de audio con posibles variaciones de estilo derivadas de corpus expresivos (expresso) y de distintos hablantes (jenny_tts_dataset, hifi-tts, lj_speech).
- Ejecucion en formato GGUF mediante llama.cpp y herramientas compatibles.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo thinking, vision ni audio de entrada.
- No se documentan capacidades multilingues mas alla de en e hi.

## Casos de uso

- Lectura de articulos y documentos en ingles: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad o consumo de contenido, con un coste de inferencia muy bajo gracias a sus cuantizaciones de 0,3 a 0,6 GB.
- Asistentes de voz embebidos en dispositivos de gama baja: al caber en CPU y en GPUs de consumo, permite integrar TTS local en raspberry pi, portatiles sin GPU dedicada o entornos edge.
- Generacion de audiolibros y podcasts en ingles: la presencia de corpus expresivos (expresso) y de multiples hablantes en el entrenamiento sugiere capacidad de producir locuciones con variedad de estilo, aunque no se documenta control explicito de emocion.
- Localizacion de contenido para audiencias en hindi: el soporte de hindi amplia el alcance a mercados donde el TTS comercial suele ser limitado o costoso.
- Prototipado rapido de interfaces de voz: la disponibilidad de cuantizaciones pequenas permite iterar en local sin depender de APIs externas ni de conectividad.
- Investigacion en sintesis de voz: el modelo sirve como base reproducible para experimentos de cuantizacion, evaluacion perceptual o comparacion de arquitecturas TTS, dado su tamano manejable y su licencia abierta.
- Generacion de avisos y notificaciones habladas en aplicaciones moviles o de escritorio: el bajo consumo de VRAM permite ejecutarlo junto a otras tareas en la misma maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB (Q2_K) y 1,0 GB (f16) solo para los pesos; el overhead adicional depende del runtime y del buffer de audio.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre, incluyendo GTX 1050, RTX 3050, RTX 4090, A100 o H100; el modelo no requiere hardware de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (por ejemplo, Ollama si admite el pipeline TTS del modelo, o bindings de llama.cpp). No se documenta soporte en vLLM ni en TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| indri-0.1-350m-tts (este) | 446,7 M | no disponible | en, hi | CC-BY-SA 4.0 | GGUF, safetensors |
| Modelos TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, por lo que no se puede establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse con corpus como gigaspeech, lj_speech o expresso, es probable que herede sesgos de hablantes, acentos y dominios presentes en esos datasets, pero no se cuantifica.
- Riesgo de alucinacion: en TTS, el equivalente es la generacion de prosodia incorrecta, pronunciacion erronea o artefactos acusticos ante texto fuera de dominio; no se documenta su magnitud.
- Limitaciones de contexto e idioma: solo se declaran en e hi; no hay informacion sobre longitud maxima de texto de entrada ni sobre manejo de caracteres fuera del alfabeto latino o devanagari.
- Restricciones de licencia: CC-BY-SA 4.0 exige atribucion y compartir las obras derivadas bajo la misma licencia; esto puede ser incompatible con productos comerciales cerrados que no quieran liberar sus adaptaciones.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar la calidad acustica de forma perceptible; la propia model card recomienda Q4_K_S o Q4_K_M como opciones rapidas y Q8_0 como mejor calidad.
- No se documenta el pipeline exacto en Hugging Face (aparece como "no disponible"), lo que puede complicar la integracion automatica con transformers.
- El repositorio tiene 207 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/indri-0.1-350m-tts-GGUF
- Modelo base: https://huggingface.co/11mlabs/indri-0.1-350m-tts
- Pagina de descargas del autor: https://hf.tst.eu/model#indri-0.1-350m-tts-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
