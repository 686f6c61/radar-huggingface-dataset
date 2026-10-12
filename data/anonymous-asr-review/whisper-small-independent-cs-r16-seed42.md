# anonymous-asr-review/whisper-small-independent-cs-r16-seed42

## Resumen

whisper-small-independent-cs-r16-seed42 es un adaptador LoRA de rango 16 entrenado sobre el modelo base openai/whisper-small para reconocimiento automatico del habla (ASR) en escenarios de code-switching entre singales (si) e ingles (en). Lo publica la cuenta anonima anonymous-asr-review como material suplementario para un proceso de revision por pares, por lo que no se trata de un modelo de produccion sino de un artefacto experimental reproducible (semilla 42, rango 16, alpha 32).

El modelo no aporta pesos completos: se distribuye unicamente el adaptador PEFT en formato safetensors, que debe cargarse junto con los pesos originales de Whisper small descargados por separado y fusionarse con `merge_and_unload()`. El resultado es un sistema ASR de 244 millones de parametros (arquitectura encoder-decoder transformer del modelo base) especializado en transcribir enunciados donde se alternan el singales y el ingles, un fenomeno muy frecuente en habla real de Sri Lanka y habitualmente mal cubierto por modelos ASR multilingues genericos.

Su relevancia es principalmente metodologica: forma parte de un par de adaptadores (uno "independiente" para code-switching y otro para singales) que se combinan segun una estrategia concreta descrita en el experimento asociado. La tarjeta no incluye licencia, resultados de evaluacion ni detalles del dataset, por lo que su uso queda restringido a reproducir el estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper del modelo base); adaptador LoRA de rango 16, alpha 32, sobre openai/whisper-small |
| Parametros totales | 244 M en el modelo base fusionado; el adaptador anade un subconjunto no cuantificado de parametros de bajo rango (numero exacto no disponible) |
| Longitud de contexto | No disponible en la tarjeta; el modelo base Whisper procesa ventanas de audio de 30 segundos (1500 fotogramas mel) |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; la cuantizacion seria aplicable solo tras fusionar con el modelo base |
| Idiomas soportados | Singales (si) e ingles (en), con enfasis en code-switching entre ambos |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de openai/whisper-small: un transformer encoder-decoder con normalizacion previa, embedding convolucional sobre espectrogramas mel de 80 canales, encoder con atencion bidireccional completa y decoder autorregresivo con atencion causal, entrenado originalmente por OpenAI con supervision debil sobre audio y transcripciones a gran escala. El adaptador no modifica la topologia: inyecta matrices de bajo rango (r=16, alpha=32) en las proyecciones del modelo base y se fusiona en los pesos al cargar.

Los detalles de entrenamiento propios de este adaptador no estan documentados en la informacion disponible: se desconoce el numero de horas o de tokens de audio, la composicion del dataset (mezcla de singales, ingles y enunciados code-switched), el metodo de optimizacion, la tasa de aprendizaje y si hubo etapas de ajuste fino supervisado adicional. La tarjeta solo especifica la semilla (42), el rango (16), el valor de alpha (32) y que el entrenamiento fue "independiente", en contraposicion a una estrategia "emparejada" que requiere combinar estos pesos con un adaptador de singales de la misma semilla. No se menciona RLHF, DPO ni ninguna innovacion de decodificacion (por ejemplo, decodificacion especulativa o atencion lineal).

## Capacidades

- Transcripcion de audio a texto en singales e ingles, con soporte explicito para enunciados que alternan ambos idiomas dentro de la misma frase.
- Reconocimiento automatico del habla sobre audio de 16 kHz, tal como exige el preprocesador de Whisper.
- Reutilizacion de todas las capacidades del modelo base tras la fusion de pesos, incluida la traduccion implicita de voz a ingles heredada del entrenamiento multitarea de Whisper.
- Integracion con el ecosistema transformers y PEFT mediante `WhisperForConditionalGeneration` y `PeftModel`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento (thinking mode).
- Capacidades multilingues limitadas a los idiomas declarados (si, en); no hay evidencia de transferencia a otros idiomas.

## Casos de uso

- Transcripcion de conversaciones coloquiales en Sri Lanka: el adaptador maneja el cambio de idioma intra-enunciado que aparece de forma natural cuando los hablantes mezclan singales e ingles, algo que los modelos ASR multilingues genericos suelen resolver mal.
- Subtitulado de contenido audiovisual local: series, entrevistas y pódcast en los que los participantes alternan idiomas; el modelo fusionado se integra en un pipeline de segmentacion + ASR de 30 segundos por bloque.
- Documentacion de reuniones tecnicas: en entornos de ingenieria de Sri Lanka es habitual discutir en singales e ingles de forma intercalada; el modelo permite obtener actas en texto sin forzar a los participantes a un solo idioma.
- Generacion de corpus anotados para investigacion en code-switching: el adaptador puede usarse como anotador inicial y posteriormente corregir manualmente, acelerando la creacion de datasets de habla mixta.
- Atencion al cliente en centros de contacto: transcripcion de llamadas de soporte tecnico donde el vocabulario de producto aparece en ingles y el resto en singales.
- Reproducibilidad academica: escenario principal del artefacto, orientado a replicar la semilla 42 y comparar la estrategia "independiente" frente a la "emparejada" descrita en el experimento de revision.
- Evaluacion de robustez de adaptadores LoRA: sirve como punto de comparacion de bajo coste (r=16) frente a ajuste fino completo del modelo base en tareas de ASR bilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo fusionado en fp16: aproximadamente 0,5-1 GB solo para los pesos, mas el overhead de activaciones y la cache del decoder; en la practica cabe en 2-3 GB de VRAM con lotes pequenos.
- VRAM estimada con cuantizacion int8 tras la fusion: del orden de 0,3-0,6 GB, aunque la tarjeta no documenta ninguna ruta de cuantizacion soportada.
- Cabe con holgura en GPU de consumo: GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090 e incluso en GPUs integradas con suficiente memoria compartida.
- Ejecucion en CPU viable dado el tamano del modelo base (244 M de parametros), con latencia mayor.
- Opciones de despliegue: transformers + PEFT es la ruta documentada por el autor; tambien son tecnicamente posibles whisper.cpp/llama.cpp tras convertir el modelo fusionado a GGUF, faster-whisper/CTranslate2 y vLLM con soporte de Whisper. No hay instrucciones ni validacion oficial para ninguna de estas alternativas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-small-independent-cs-r16-seed42 | 244 M (base) + adaptador LoRA r16 | 30 s por ventana (modelo base) | si, en (code-switching) | No disponible | Artefacto anonimo de revision por pares; requiere el modelo base y, para la estrategia emparejada, un segundo adaptador |
| openai/whisper-small | 244 M | 30 s por ventana | Multilingue (99 idiomas declarados) | Apache 2.0 (modelo base) | Modelo original sin especializacion; sufre degradacion en code-switching singales-ingles |
| openai/whisper-medium | 769 M | 30 s por ventana | Multilingue | Apache 2.0 | Mayor capacidad, mayor coste de inferencia; tampoco esta especializado en code-switching |
| openai/whisper-large-v3 | 1550 M | 30 s por ventana | Multilingue | Apache 2.0 | Referencia de calidad general, requisitos de hardware muy superiores |

No se dispone de datos de rendimiento comparado para este adaptador, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que impide determinar si el uso comercial esta permitido; en la practica, la ausencia de licencia equivale a falta de permisos explicitos.
- Es un artefacto anonimo de revision por pares: no hay autoria verificable, ni garantia de mantenimiento, y el repositorio puede retirarse o modificarse tras el proceso de revision.
- No se han publicado resultados de evaluacion, tasas de error (WER/CER) ni comparaciones con lineas base, por lo que no hay evidencia objetiva de mejora frente al modelo base.
- No se documenta la composicion del dataset de entrenamiento, lo que impide evaluar sesgos de dominio, acento, genero o dialecto dentro del singales.
- Riesgo de alucinacion inherente a Whisper: en tramos de silencio, ruido o audio musical puede generar texto plausible no presente en el audio.
- El modelo solo esta entrenado para singales e ingles; su uso con otros idiomas o con acentos no vistos puede degradar gravemente la transcripcion.
- Requiere descargar por separado los pesos del modelo base openai/whisper-small y fusionarlos; no es un modelo autónomo.
- La estrategia "emparejada" descrita por el autor exige combinar estos pesos con un adaptador de singales de la misma semilla segun unas proporciones concretas; usar el adaptador de forma aislada fuera de ese contexto no reproduce el experimento.
- No hay soporte declarado para marcas de tiempo a nivel de palabra, diarizacion de hablantes ni puntuacion garantizada.
- Para produccion se recomienda validar con un conjunto propio de audio code-switched antes de cualquier despliegue, dado que no existe informe de evaluacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-independent-cs-r16-seed42
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de la arquitectura Whisper (modelo base, Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de PEFT: https://github.com/huggingface/peft
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; todos los resultados encontrados correspondian al colectivo hacktivista Anonymous y a una marca de calzado, sin relacion con el artefacto descrito.
