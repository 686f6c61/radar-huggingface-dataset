# alphaedge-ai/whisper-base-nno-16384

## Resumen

`whisper-base-nno-16384` es una variante recortada (trimmed) de `openai/whisper-base`, el modelo de reconocimiento automatico del habla (ASR) publicado por OpenAI en 2022. Lo desarrolla el usuario `alphaedge-ai` aplicando la tecnica de trimming descrita por Loïck Bourdois y colaboradores en Hugging Face, que consiste en reducir el vocabulario del tokenizer a los tokens realmente utiles para un idioma concreto. En este caso el objetivo es el noruego nynorsk (`nn`).

El recorte lleva el vocabulario de 51.865 a 16.384 tokens (reduccion del 68,41%) y el total de parametros de 72.593.920 a 54.427.648 (reduccion del 25,02%). El resultado es un checkpoint mas ligero en disco y memoria, con una huella de repo de unos 0,1 GB, manteniendo la arquitectura encoder-decoder transformer original de Whisper con 6 capas de encoder y 6 de decoder.

Su relevancia practica es acotada: sirve para despliegues ASR de bajos recursos especificamente en nynorsk, donde el ahorro de memoria importa mas que la cobertura multilingue. Al eliminar los tokens de otros idiomas, el modelo pierde capacidad de transcripcion fuera del nynorsk y no debe emplearse como sustituto general de Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) con vocabulario reducido |
| Parametros totales | 54.427.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; el dato no figura en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan variantes GGUF/INT8) |
| Idiomas soportados | noruego nynorsk (`nn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de `openai/whisper-base`: un transformer encoder-decoder entrenado originalmente por OpenAI sobre supervision debil a gran escala para transcripcion y traduccion de voz. El audio se procesa con un feature extractor que trabaja a 16 kHz y genera espectrogramas log-Mel; el encoder produce representaciones y el decoder genera tokens de texto autoregresivamente. El modelo base tiene 6 capas en encoder y 6 en decoder con atencion multi-cabeza.

La innovacion de esta version es exclusivamente el trimming del vocabulario. Segun la model card, se minaron 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para identificar los tokens relevantes para nynorsk y se conservaron 16.384 de los 51.865 originales. No se indica en la informacion disponible si hubo reentrenamiento adicional, fine-tuning supervisado, RLHF o ajuste de los pesos tras el recorte; la model card describe el resultado como "deberia comportarse de forma similar al original" en el idioma objetivo, lo que sugiere que el recorte es principalmente estructural (embeddings y proyeccion de salida) sin un ciclo de entrenamiento declarado.

## Capacidades

- Transcripcion de voz a texto en noruego nynorsk, con el pipeline `automatic-speech-recognition` de transformers.
- Procesamiento de audio muestreado a 16 kHz (requisito de Whisper, resampleado con librosa u otra libreria).
- Generacion autoregresiva de transcripciones con `generate_kwargs` configurables (`language`, `task`).
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni uso como agente.
- Cobertura multilingue eliminada: el vocabulario recortado descarta tokens de otros idiomas.
- No incluye vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion de reuniones internas en nynorsk: el modelo procesa audio resampleado a 16 kHz y devuelve texto plano; su tamano reducido permite ejecutarlo en servidores modestos sin GPU dedicada de gran capacidad.
- Subtitulado de contenido audiovisual noruego: para productoras que publican en nynorsk, el checkpoint genera transcripciones base que luego se revisan manualmente, con menor coste de memoria que el Whisper base original.
- Archivado y busqueda de grabaciones: transcripcion por lotes de entrevistas o podcasts en nynorsk para indexacion textual, aprovechando que el repo pesa solo 0,1 GB y se puede desplegar en contenedores ligeros.
- Asistentes de voz para administracion publica noruega: integracion en formularios o lineas de atencion donde el idioma de entrada esta restringido a nynorsk y el ahorro de VRAM es prioritario.
- Prototipado rapido en investigacion ASR: servir como baseline ligero para experimentos de reconocimiento de voz en nynorsk, comparando su calidad frente al Whisper base completo.
- Despliegue en edge o entornos con recursos limitados: al reducir parametros un 25%, encaja mejor en instancias CPU o GPUs de gama baja para transcripcion near-real-time de audio corto.
- Evaluacion de la tecnica de trimming: util como referencia para medir cuanto degrada el recorte de vocabulario la calidad ASR en un idioma de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta las metricas de reduccion de vocabulario (68,41%) y de parametros (25,02%), sin cifras de WER, MMLU, HumanEval ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,22 GB solo para pesos (54,4 M parametros x 4 bytes), mas overhead de activaciones y feature extraction.
- VRAM estimada en FP16: alrededor de 0,11 GB para pesos, mas overhead.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU para audio corto.
- GPU recomendadas: no requiere GPU dedicada; para throughput alto se sugiere RTX 4090, A100 o H100, aunque el modelo es demasiado pequeno para aprovecharlas.
- Opciones de despliegue: pipeline de `transformers`, endpoints de Hugging Face (`endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `alphaedge-ai/whisper-base-nno-16384` | 54,4 M | no disponible | nynorsk | Apache 2.0 | Version recortada, vocabulario 16.384 |
| `openai/whisper-base` | 72,6 M | no disponible | multilingue | Apache 2.0 | Modelo original, vocabulario 51.865 |
| `openai/whisper-small` | ~244 M | no disponible | multilingue | Apache 2.0 | Mayor capacidad, mas recursos |
| `NbAiLab/nb-whisper-base` | no disponible | no disponible | noruego (bokmal/nynorsk) | no disponible | Alternativa especifica noruega; datos no verificados en esta ficha |

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens de otros idiomas; el modelo no es util para transcripcion multilingue ni para idiomas distintos del nynorsk.
- La model card advierte explicitamente de que "puede no funcionar bien para otros idiomas".
- No se documenta reentrenamiento tras el trimming, por lo que la calidad ASR en nynorsk puede degradarse respecto al Whisper base; no hay benchmarks que lo confirmen.
- Riesgo de alucinacion inherente a los modelos Whisper en segmentos de silencio o audio ruidoso.
- Sesgos heredados del corpus de entrenamiento original de OpenAI (supervision debil a gran escala), no evaluados en esta variante.
- Requiere audio a 16 kHz; no resamplea internamente.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia del dataset de minado (`lbourdois/fineweb-2-trimming`) antes de produccion.
- Modelo con muy pocas descargas (57) y sin likes, lo que sugiere validacion comunitaria escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-nno-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
