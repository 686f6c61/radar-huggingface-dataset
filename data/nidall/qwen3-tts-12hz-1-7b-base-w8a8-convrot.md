# NidAll/Qwen3-TTS-12Hz-1.7B-Base-W8A8-ConvRot

## Resumen

Qwen3-TTS-12Hz-1.7B-Base-W8A8-ConvRot es una version cuantizada no oficial del modelo de sintesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-Base, publicada por el usuario NidAll. No se trata de un lanzamiento de Qwen: es un derivado de terceros cuyo objetivo es reducir el coste de memoria e inferencia del modelo base para integrarlo en flujos de trabajo de generacion de audio dentro de ComfyUI.

El checkpoint aplica una cuantizacion W8A8 con la variante ConvRot sobre los pesos del transformador, manteniendo los pesos cuantizados empaquetados durante la inferencia. El decodificador de voz se conserva en FP16, de modo que la perdida de calidad se concentra en el backbone y no en la etapa de sintesis final. El repositorio ocupa 3,1 GB e incluye un `model.safetensors` unificado, ficheros de configuracion, tokenizer, procesador, el `speech_tokenizer/` y un manifiesto de cuantizacion.

Con 1.929.340.488 parametros (~1,93 B) y licencia Apache-2.0 heredada del modelo base, el checkpoint esta pensado para el runtime ComfyUI-Qwen3-TTS-Quant del mismo autor. Su relevancia actual es practica: permite ejecutar un sistema TTS de ~1,9 B en hardware de consumo dentro de un entorno de generacion visual, aunque la documentacion publicada es muy escasa y no incluye datos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado cuantizado de Qwen3-TTS (text-to-speech); la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | 1.929.340.488 (~1,93 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 ConvRot (pesos y activaciones en 8 bits, pesos empaquetados que permanecen cuantizados en inferencia); decodificador de voz en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` unificado), acompanado de `config.json`, `generation_config.json`, tokenizer y processor, `speech_tokenizer/` y `quantization_manifest.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base ni sobre su proceso de entrenamiento: la model card del derivado no describe el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documenta el significado tecnico del sufijo "12Hz" que aparece en el nombre del modelo base. Todo lo anterior debe considerarse no disponible.

Lo unico documentado por el autor es el proceso de cuantizacion. El checkpoint emplea un esquema W8A8 ConvRot, en el que tanto los pesos como las activaciones se representan en 8 bits y los pesos cuantizados permanecen empaquetados durante la inferencia, evitando la de-cuantizacion completa a precision alta en cada paso. El decodificador de voz, responsable de convertir las representaciones acusticas en forma de onda, se mantiene en FP16 para preservar la calidad de la senal generada. El repositorio incluye `quantization_manifest.json`, que actua como metadato del proceso de cuantizacion. No se publican mediciones del impacto de esta cuantizacion sobre la calidad subjetiva o las metricas objetivas del audio.

## Capacidades

- Sintesis de voz a partir de texto (pipeline declarado: `text-to-speech`).
- Generacion de audio integrada en el ecosistema ComfyUI mediante el runtime ComfyUI-Qwen3-TTS-Quant.
- Inferencia con pesos cuantizados en 8 bits, con el decodificador de voz en FP16.
- Herramientas de tokenizacion y procesamiento incluidas en el repositorio (`speech_tokenizer/`, tokenizer y processor).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable a un modelo TTS segun la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento (thinking), vision o audio de entrada: no disponible.
- Clonacion de voz, control de estilo o emocion: no documentado.

## Casos de uso

- Doblaje y voice-over en pipelines de video generativo: el modelo se integra en ComfyUI, de modo que puede encadenarse con nodos de generacion de imagen o video para producir la pista de voz de una escena sin salir del mismo grafo.
- Narracion de audiolibros y contenido largo: al ser un modelo TTS de ~1,9 B cuantizado, el coste por minuto de audio generado es bajo y permite procesar lotes de texto en hardware de consumo.
- Prototipado rapido de asistentes de voz: util para validar la experiencia conversacional (turnos, latencia, prosodia) antes de comprometerse con una API comercial o un modelo mayor.
- Generacion de locuciones para productos de accesibilidad: lectura de articulos, documentacion tecnica o interfaces para personas con discapacidad visual, ejecutable en local y por tanto apto para contenido sensible que no debe salir de la infraestructura propia.
- Creacion de datasets de audio sintetico: produccion de pares texto-audio para preentrenar o aumentar modelos de reconocimiento de voz, siempre que la licencia Apache-2.0 y las condiciones del modelo base lo permitan.
- Sistemas de respuesta de voz interactiva (IVR) en entornos con GPU modesta: el checkpoint en 8 bits reduce el requisito de VRAM frente al modelo base en FP16, lo que facilita el despliegue en un unico acelerador.
- Previsualizacion de guiones y storyboards: generacion rapida de borradores de audio para validar el ritmo y la duracion de un guion antes de contratar una locucion humana definitiva.

En todos los casos, la idoneidad concreta depende de capacidades del modelo base (idiomas, clonacion de voz, control de estilo) que no estan documentadas en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas objetivas (MOS, WER, similitud de hablante) ni comparaciones con el modelo base sin cuantizar, por lo que no es posible cuantificar la degradacion introducida por la cuantizacion W8A8 ConvRot.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan aproximadamente 1,9 GB (1,93 B de parametros a 8 bits). Sumando el decodificador en FP16, la cache de activaciones y el overhead del runtime, se puede estimar un consumo en torno a 3-4 GB de VRAM; se trata de una estimacion derivada del recuento de parametros, no de una cifra publicada por el autor.
- Tamano en disco: 3,1 GB para el repositorio completo.
- GPU recomendadas: no especificadas por el autor. Por el perfil de memoria, el modelo es candidato para GPUs de consumo; no hay confirmacion oficial de funcionamiento en ninguna tarjeta concreta.
- Cabe en GPU de consumo: probablemente si, en tarjetas con 6-8 GB o mas de VRAM (por ejemplo, gama RTX 3060/4060 y superiores), aunque este extremo no esta verificado en la documentacion disponible.
- Opciones de despliegue: el runtime previsto es ComfyUI-Qwen3-TTS-Quant. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al tratarse de un modelo TTS con decodificador de voz propio, es previsible que estos runtimes de texto no sean aplicables.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NidAll/Qwen3-TTS-12Hz-1.7B-Base-W8A8-ConvRot | ~1,93 B | W8A8 ConvRot + decodificador FP16 | no disponible | Apache-2.0 | HuggingFace, runtime ComfyUI-Qwen3-TTS-Quant |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base (modelo base) | no disponible (el derivado declara ~1,93 B) | FP16/BF16 (segun el modelo base) | no disponible | Apache-2.0 | HuggingFace (oficial de Qwen) |
| Otros modelos TTS de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a parametros declarados, precision y licencia.

## Limitaciones y advertencias

- Modelo no oficial: no es un lanzamiento de Qwen y no cuenta con el respaldo ni la validacion del equipo original. El autor lo indica explicitamente en la model card.
- Cuantizacion sin evaluar: no se publican mediciones del impacto de W8A8 ConvRot sobre la calidad del audio, la prosodia o la inteligencia del texto. Es esperable cierta degradacion respecto al modelo base en FP16, pero no esta cuantificada.
- Dependencia de un runtime concreto: el checkpoint esta pensado para ComfyUI-Qwen3-TTS-Quant. Su uso fuera de ese runtime no esta documentado y puede no funcionar directamente.
- Idiomas soportados: no disponible. No se puede garantizar cobertura multilingue ni el comportamiento en castellano.
- Longitud de contexto: no disponible, lo que impide planificar la generacion de fragmentos largos con continuidad de voz.
- Riesgo de alucinacion y artefactos: en modelos TTS, los fallos tipicos son omisiones, repeticiones, ruido o prosodia incorrecta en entradas fuera de distribucion; no hay informacion sobre la robustez de este checkpoint ante texto anomalo (numeros, siglas, nombres propios).
- Sesgos: no hay informacion sobre sesgos de acento, genero, edad o variedad dialectal en el modelo base ni en el derivado.
- Licencia: Apache-2.0, lo que en principio permite uso comercial, pero el autor recuerda que deben preservarse la licencia y los avisos de atribucion del modelo original. Conviene verificar las condiciones del modelo base antes de un despliegue comercial.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya validado su funcionamiento en produccion.
- Caveat de produccion: al no existir benchmarks ni informes de calidad, un despliegue real deberia acompanarse de una evaluacion propia (MOS subjetivo, WER sobre audio generado y pruebas de estres con texto diverso) antes de sustituir a un sistema TTS ya validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NidAll/Qwen3-TTS-12Hz-1.7B-Base-W8A8-ConvRot
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Runtime previsto: https://github.com/NidAll/ComfyUI-Qwen3-TTS-Quant
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada.
