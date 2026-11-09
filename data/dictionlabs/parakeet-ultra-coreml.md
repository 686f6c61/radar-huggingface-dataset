# DictionLabs/parakeet-ultra-coreml

## Resumen

Parakeet Ultra CoreML es la conversión al formato CoreML del modelo Parakeet Ultra, un sistema de reconocimiento automático del habla (ASR) para 25 idiomas europeos desarrollado por DictionLabs a partir del trabajo previo de NVIDIA y moondream. El modelo original, Parakeet TDT 0.6B v3, fue entrenado por NVIDIA; moondream lo sometió a un post-entrenamiento para dar lugar a Parakeet Ultra, y FluidInference construyó la conversión CoreML que DictionLabs republica en su propio espacio de nombres. La ficha se centra en el artefacto CoreML, no en el modelo PyTorch subyacente.

El objetivo es el dictado y la transcripción en dispositivo (on-device) sobre hardware Apple, integrado en el runtime FluidAudio que emplea la aplicación Diction. Mantiene el mismo tokenizador, el mismo contrato de componentes y los mismos 25 idiomas que Parakeet TDT v3, con un encoder cuantizado a int8 y decoder y joint en fp16. El repositorio ocupa 0,6 GB y la licencia es CC-BY-4.0, sin restricciones adicionales por parte del publicador.

La relevancia actual reside en que permite ejecutar ASR multilingüe de calidad en Mac, iPhone o iPad sin depender de la nube, con un formato (CoreML) que Apple optimiza para sus chips. Al fijar una revisión concreta probada por DictionLabs, evita la deriva de la rama por defecto del repositorio upstream de FluidInference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), encoder-decoder transducer; pesos convertidos a CoreML |
| Parametros totales | 0,6 B (heredado de Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Encoder int8; decoder y joint fp16; preprocesador y vocabulario v3 |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | CoreML (paquete .mlmodelc/.mlpackage); no se publican safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es un transducer TDT (Token-and-Duration Transducer) de 0,6 mil millones de parámetros, la arquitectura que NVIDIA introdujo en la familia Parakeet para predecir simultáneamente tokens y duraciones. Consta de un encoder acústico, un decoder de predicción y una red joint que combina ambas representaciones. La conversión CoreML de FluidInference mantiene el preprocesador y el vocabulario de Parakeet TDT v3 y aplica cuantización int8 al encoder y fp16 al decoder y a la red joint, lo que reduce el tamaño y acelera la inferencia en los Neural Engine y GPU de Apple.

Sobre el entrenamiento original no se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Lo que sí se documenta es la cadena de procedencia: NVIDIA entrenó Parakeet TDT 0.6B v3, moondream realizó un post-entrenamiento para producir Parakeet Ultra y FluidInference generó la conversión CoreML (revisión `95eaa59a39d4`). DictionLabs republica esos archivos byte a byte, de modo que los pesos son idénticos a los de la revisión fijada; solo cambia el README.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos, incluidos español, inglés, alemán, francés, italiano, portugués, ruso, ucraniano y la mayoría de lenguas eslavas, bálticas y nórdicas.
- Ejecución on-device en hardware Apple mediante CoreML, sin necesidad de conexión a internet ni de enviar audio a servidores externos.
- Compatibilidad con el contrato de componentes de Parakeet TDT v3: mismo tokenizador y mismo vocabulario, lo que facilita sustituir el modelo en pipelines existentes.
- Integración con FluidAudio 0.17.3 o superior a través de `AsrModelVersion.ultra` y `ModelRegistry.repoOverrides`.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado en aplicaciones de escritorio macOS: la app Diction usa este modelo para convertir voz en texto en local, con el encoder int8 ejecutándose en el Neural Engine y sin latencia de red.
- Transcripción de reuniones y notas de voz en iPhone o iPad: al ser CoreML y ocupar 0,6 GB, puede empaquetarse en una app y procesar audio en el dispositivo, preservando la privacidad de las conversaciones.
- Subtitulado offline de vídeo en 25 idiomas europeos: el soporte multilingüe permite transcribir contenido en lenguas eslavas, bálticas o nórdicas que muchos ASR comerciales cubren con menor calidad.
- Herramientas de accesibilidad: dictado por voz para usuarios con movilidad reducida en entornos Apple, funcionando sin conexión en aviones, hospitales o zonas sin cobertura.
- Investigación en ASR comparativo: al ser una conversión reproducible de un modelo abierto con licencia CC-BY-4.0, sirve para medir el impacto de la cuantización int8/fp16 frente al modelo PyTorch original.
- Prototipado rápido en Swift: los desarrolladores pueden integrar FluidAudio y apuntar a este repositorio mediante `repoOverrides` para validar una build concreta antes de fijarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en memoria unificada de los chips Apple. El repositorio ocupa 0,6 GB, por lo que la huella en memoria es del orden de cientos de MB una vez cargado.
- GPU recomendadas: no disponible. El destino son los Neural Engine y GPU integradas de los chips Apple (serie M y A); no se documentan requisitos mínimos de chip.
- Cabe en hardware de consumo: sí, por tamaño (0,6 B de parámetros en int8/fp16) y por formato CoreML, orientado a Mac, iPhone y iPad.
- Opciones de despliegue: FluidAudio 0.17.3 o superior con `AsrModelVersion.ultra`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a CoreML.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet Ultra CoreML (este) | 0,6 B | 25 | CoreML (int8/fp16) | CC-BY-4.0 | Conversión on-device para Apple; pesos idénticos a FluidInference `95eaa59a39d4` |
| Parakeet TDT 0.6B v3 (NVIDIA) | 0,6 B | 25 | PyTorch/safetensors | no disponible en esta ficha | Modelo original entrenado por NVIDIA; base del post-entrenamiento |
| Parakeet Ultra (moondream) | 0,6 B | 25 | no disponible en esta ficha | no disponible en esta ficha | Post-entrenamiento de TDT v3; mismo tokenizador y contrato |
| FluidInference parakeet-ultra-coreml | 0,6 B | 25 | CoreML | no disponible en esta ficha | Conversión upstream de la que deriva este repositorio |

## Limitaciones y advertencias

- Solo transcribe audio: no genera texto libre, no razona ni responde preguntas; es un modelo ASR puro.
- El alcance idiomático se limita a los 25 idiomas europeos listados; no cubre árabe, chino, japonés, coreano ni lenguas africanas o índicas.
- Al ser una conversión cuantizada (encoder int8), puede haber una degradación menor de precisión frente al modelo PyTorch original; no se publican métricas que la cuantifiquen.
- Depende del ecosistema Apple y de FluidAudio; no es desplegable en Linux, Windows o servidores NVIDIA sin una conversión alternativa.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se documentan tasas de error por idioma.
- La licencia CC-BY-4.0 permite uso comercial con atribución; DictionLabs declara no añadir restricciones, pero conviene verificar la licencia de los upstreams (NVIDIA, moondream, FluidInference) antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una publicación reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DictionLabs/parakeet-ultra-coreml
- Modelo base (moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión CoreML upstream (FluidInference): https://huggingface.co/FluidInference/parakeet-ultra-coreml
- Runtime FluidAudio: https://github.com/FluidInference/FluidAudio
