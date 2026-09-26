# Nanite-Labs/nanites-smoky-speech-opal

## Resumen

nanites-smoky-speech-opal es un modelo de sintesis de voz (text-to-speech) en ingles publicado por Nanite-Labs. Se trata de un ajuste fino del modelo base FunAudioLLM/Fun-CosyVoice3-0.5B-2512 y encarna la persona femenina "Opal", construida agregando 15 hablantes y 160 clips (24,8 minutos) de grabaciones de campo del dialecto Smoky Mountain English de 1939, recogidas por Joseph Sargent Hall en Carolina del Norte y Tennessee.

El modelo persigue dos objetivos: reproducir el registro dialectal historico de los Apalaches y anonimizar estructuralmente las voces de origen, de modo que ninguna identidad individual sea reconocible. Para ello agrupa a los hablantes bajo un unico speaker ID y emplea un embedding campplus promediado, sin audio de referencia durante la inferencia. Es la segunda generacion de las voces Smoky y complementa a la voz masculina Otis.

Con alrededor de 0,5 B de parametros en su componente LLM, licencia Apache-2.0 y un repositorio de 7 GB, resulta relevante para proyectos de preservacion linguistica, narracion con acento regional y generacion de audio historico en ingles, y es lo bastante ligero para ejecutarse en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CosyVoice 3: LLM autorregresivo + modulo de flow matching + vocoder neuronal (archivos llm.pt, flow.pt y hift.pt) |
| Parametros totales | ~0,5 B en el componente LLM (el sistema completo anade flow matching y vocoder; desglose exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Fun-CosyVoice3-0.5B-2512, un sistema TTS cuyos pesos se reparten en un LLM autorregresivo (llm.pt), un modulo de flow matching (flow.pt) y un vocoder neuronal (hift.pt). El fine-tuning se realiza por separado para cada genero y afecta unicamente al componente LLM (opcion `--model llm`), conservando el resto del sistema base. El entrenamiento usa bf16, learning rate constante de 1e-5 y una sola GPU, con `use_spk_embedding: True` y un unico speaker ID por genero. La receta para 8 GB de VRAM emplea AdamW8bit de bitsandbytes, gradient checkpointing, omite el envoltorio DDP con world_size 1 y aplica un guard de join monoproceso.

El preprocesado de cada clip consiste en remuestreo de 16 kHz a 24 kHz, eliminacion de ruido con spectral gate, recorte por VAD de energia y filtro de SNR (>= 8 dB). El corpus se organiza en directorios estilo Kaldi (wav.scp/text/utt2spk) con un prefijo `instruct` por enunciado (`You are a helpful assistant.<|endofprompt|>`, exigido por el LLM de la v3), al que siguen embeddings campplus y tokens de habla v3 en parquet. La salida es un `llm_avg.pt` por genero (media de las 8 mejores epocas por val loss) y el directorio de voz final combina la base v3, el LLM promediado y un `spk2info.pt` con el embedding agregado. Los pools de hablantes se muestrearon aleatoriamente con semilla 20260925; el masculino es totalmente disjunto del de la generacion Earl, mientras que el femenino reutiliza 10 hablantes de Ethel y anade 5 nuevos.

## Capacidades

- Sintesis de voz en ingles con acento dialectal de los Apalaches (Smoky Mountain English de 1939).
- Voz femenina agregada ("Opal"; nombre funcional `smoky-speech-female_v2`, speaker ID `<|female_pool_v2|>`).
- Inferencia en modo SFT (`inference_sft`) con embedding agregado y sin clip de referencia.
- Requiere el prefijo instruct `You are a helpful assistant.<|endofprompt|>` en el texto de sintesis, que el script `experts/smoky/cosyvoice_infer.py` anade automaticamente para directorios de voz v3.
- Anonimizacion de hablante mediante pooling estructural e embedding campplus promediado.
- No soporta tool calling ni function calling: es un modelo TTS puro.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni entrada de audio.
- Capacidad multilingue: no; unicamente ingles.

## Casos de uso

- Narracion de audiolibros y relatos ambientados en los Apalaches de los anos 30: la voz aporta un registro dialectal coherente con la epoca y evita el acento neutro generico de otros TTS.
- Preservacion linguistica y documentacion dialectal: permite generar ejemplos de pronunciacion del Smoky Mountain English para corpus academicos o materiales didacticos, partiendo de un pool de 15 hablantes femeninas anonimizadas.
- Audio para museos y exposiciones de historia oral: se pueden locutar cartelas y testimonios sinteticos en el registro de 1939 sin recurrir a voces reales identificables.
- Videojuegos y experiencias inmersivas de ambientacion rural estadounidense de los anos 30: la persona Opal puede actuar como NPC o narradora, generando lineas nuevas bajo demanda con la misma identidad agregada.
- Re-sintesis y anonimizacion de entrevistas de archivo: transformar testimonios de hablantes reales en una identidad de pool, reduciendo el riesgo de reidentificacion al no usar audio de referencia en inferencia.
- Locucion para podcast o documentales sobre historia oral de Tennessee y Carolina del Norte: combinado con el modelo de chat `nanites-smoky-1b-chat`, que genero las lineas de muestra, se mantiene coherencia entre texto y habla.
- Prototipado de interfaces de voz para personajes historicos: al ser un modelo de ~0,5 B, puede desplegarse en estaciones locales o entornos sin conexion para demos interactivas.
- Generacion de material de accesibilidad en registro dialectal, por ejemplo audiolibros de textos ya existentes que requieran una voz con caracter regional.

## Benchmarks y rendimiento

| Metrica | Opal (femenino) | Otis (masculino) | Referencia |
|---|---|---|---|
| WER (whisper medium.en, 3 lineas nuevas, 132 palabras) | 7,6 % | 6,1 % | objetivo < 12 % |
| Similitud coseno maxima del embedding campplus agregado al miembro mas cercano del pool | 0,927 | 0,924 | v1: 0,909 / 0,888 |
| Numero de hablantes en el pool | 15 | 15 | no aplica |
| Clips / duracion total | 160 / 24,8 min | 265 / 40,0 min | no aplica |
| Mejores epocas por val loss | [8, 14, 15, 13, 9, 12, 11, 16] | [10, 8, 9, 12, 13, 15, 11, 6] | no aplica |

Los errores residuales de WER corresponden sobre todo a grafias dialectales (por ejemplo, *crick* por *creek* o *dawnin* por *dawning*). El modelo no publica resultados de benchmarks de comprension o razonamiento (MMLU, GSM8K, HumanEval), ya que su tarea es exclusivamente de sintesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 4 GB en bf16 para el sistema completo (LLM de ~0,5 B mas flow matching y vocoder); el autor entreno con una sola GPU y una receta de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM; con cuantizacion adicional podria reducirse aun mas, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: repositorio base de CosyVoice con el script `experts/smoky/cosyvoice_infer.py`; exportacion a ONNX (etiqueta `onnx` en el repositorio) para usar con ONNX Runtime. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponible.
- Tamano del repositorio: 7,0 GB, que probablemente incluye artefactos de entrenamiento ademas de los pesos necesarios para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros (LLM) | Idiomas | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| nanites-smoky-speech-opal | ~0,5 B | en | Apache-2.0 | TTS dialectal femenino anonimizado | HuggingFace, 0 descargas |
| nanites-smoky-speech-otis | ~0,5 B | en | Apache-2.0 | TTS dialectal masculino anonimizado | HuggingFace |
| Fun-CosyVoice3-0.5B-2512 (base) | ~0,5 B | multilingue | Apache-2.0 | TTS generalista multilingue | HuggingFace |
| Primera generacion Smoky (Earl + Ethel, CosyVoice2) | ~0,5 B | en | Apache-2.0 | TTS dialectal, motor anterior | HuggingFace |

La comparativa con alternativas externas (XTTS-v2, Piper, Kokoro u otros TTS de tamano similar) no esta disponible en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento comparadas mas alla de las metricas internas de la familia Smoky.

## Limitaciones y advertencias

- Solo ingles: no soporta ningun otro idioma.
- Es un modelo TTS puro: no genera texto, no razona y no implementa tool calling ni agentes.
- Riesgo de error de pronunciacion: el WER del 7,6 % refleja fallos residuales, concentrados en grafias dialectales poco frecuentes.
- Sesgo de genero: la voz se entreno solo con hablantes femeninas, por lo que no cubre variacion masculina ni tonos fuera de ese pool.
- Sesgo dialectal y de epoca: reproduce el habla rural de los Apalaches de 1939; su uso fuera de ese contexto puede resultar inapropiado o caricaturesco.
- La anonimizacion es estructural, no criptografica: la similitud coseno de 0,927 respecto al miembro mas cercano del pool es alta, por lo que no garantiza inmunidad frente a un ataque de reidentificacion dirigido.
- Licencia Apache-2.0: permite uso comercial del modelo, pero los transcriptos de Montgomery y Reed (2017) estan bajo copyright y no se redistribuyen; los artefactos de entrenamiento son tokens foneticos derivados y no texto fuente.
- El audio original son grabaciones de campo de Hall (1939) de dominio publico, custodiadas en el archivo de la USC.
- En inferencia v3 es obligatorio el prefijo instruct `You are a helpful assistant.<|endofprompt|>`; omitirlo puede degradar la salida.
- Repositorio publicado el 2026-09-26 sin descargas ni likes: existe poca validacion independiente por parte de la comunidad.
- El repositorio ocupa 7 GB, por encima de lo estrictamente necesario para inferencia, lo que puede complicar su despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nanite-Labs/nanites-smoky-speech-opal
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Voz masculina de la misma generacion: https://huggingface.co/Nanite-Labs/nanites-smoky-speech-otis
- Transcriptos de referencia: Montgomery y Reed (2017), citados en la model card, no redistribuidos.
- Grabaciones de campo originales: archivo de la Universidad del Sur de California (USC), grabaciones de Joseph Sargent Hall, 1939.
