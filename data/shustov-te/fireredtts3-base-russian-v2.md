# shustov-te/FireRedTTS3-Base-Russian-v2

## Resumen
FireRedTTS3-Base-Russian-v2 es un checkpoint de síntesis de voz (text-to-speech) en ruso derivado de FireRedTTS3, el sistema TTS de la familia FireRed desarrollado originalmente por FireRedTeam. La adaptación la publica el usuario shustov-te y consiste en un merge completo en FP32 de un LoRA de adaptación al ruso sobre el núcleo FireRedTTS3 Base, empaquetado por CKermit para su uso con SGLang Omni. El resultado es un modelo autónomo que no requiere un adaptador separado en inferencia.

El modelo resuelve el problema de la clonación de voz zero-shot en ruso: a partir de una grabación de referencia y su transcripción, genera audio a 24 kHz con la identidad vocal del hablante de referencia. Incluye los activos necesarios para el pipeline completo (tokenizer, códec RedAE y embeddings de hablante CAM++), lo que simplifica el despliegue.

Con 2.120 millones de parámetros y un repositorio de 12,3 GB en precisión FP32, es un modelo de tamaño medio que requiere GPU para inferencia. Su relevancia actual radica en que cubre un hueco poco atendido en TTS open source: clonación de voz de calidad en ruso bajo licencia Apache-2.0, con integración verificada en el stack SGLang Omni.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FireRedTTS3 (backbone TTS con codec neural RedAE y encoder de hablante CAM++; detalles internos del backbone no disponibles) |
| Parametros totales | 2.120.632.897 (2,12 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible; la API de SGLang Omni limita la entrada de texto a 400 caracteres |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP32; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint FP32 con LoRA fusionado) |

## Arquitectura y entrenamiento
El modelo es una adaptación del núcleo FireRedTTS3 Base mediante un LoRA de perfil `backbone`, fusionado en un checkpoint FP32 completo. El paquete incluye el tokenizer, el códec neural RedAE (para la representación y reconstrucción del audio) y los embeddings de hablante CAM++ (para la verificación y preservación de la identidad vocal en clonación zero-shot). El empaquetado sigue la plantilla de CKermit/FireRedTTS3-Base en el commit `53f8b59c3252f15d539a9205fbcab3e334a36b9f`, cuyos ficheros core, RedAE y CAM++ se verificaron idénticos al base local usado para entrenar el adaptador.

La validación del merge cubrió las salidas de las capas PEFT antes y después de la fusión, la inmutabilidad de los tensores congelados, todos los tensores guardados del núcleo y el tokenizer efectivo. El autor advierte explícitamente de que esto no constituye una prueba de paridad GPU extremo a extremo en SGLang: la precisión en tiempo de ejecución y los parámetros de generación pueden alterar la salida respecto al pipeline de inferencia usado en entrenamiento. No se publican detalles sobre el volumen de datos de entrenamiento, la composición del corpus ruso ni si hubo etapas de RLHF o DPO; el audio de entrenamiento, las grabaciones de referencia y el estado del optimizador no forman parte de la release.

## Capacidades
- Síntesis de voz en ruso a partir de texto, con salida de audio mono a 24 kHz.
- Clonación de voz zero-shot: genera la voz de un hablante a partir de una grabación de referencia y su transcripción exacta, sin fine-tuning adicional.
- Preservación de identidad vocal mediante embeddings CAM++ integrados en el paquete.
- Despliegue como servicio HTTP mediante SGLang Omni, con endpoint `/v1/audio/speech` y endpoint de salud `/health`.
- Soporte de streaming y ajustes de generación a través de la configuración de SGLang Omni (documentados en la cookbook de integración).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de clonación.
- Capacidad multilingüe limitada al ruso; no se declaran otros idiomas.

## Casos de uso
- Clonación de voz para doblaje y localización al ruso: dado un clip de referencia de un actor y su transcripción, el modelo genera nuevas locuciones manteniendo el timbre del hablante, útil para doblar contenido sin regrabar al actor original.
- Audiolibros y narración automatizada: conversión de texto largo en audio narrado con una voz consistente, troceando el texto en fragmentos de hasta 400 caracteres (límite de la API inspeccionada) y encadenando las salidas.
- Asistentes de voz en ruso: integración del endpoint `/v1/audio/speech` en un backend de atención al cliente o asistente doméstico para respuestas habladas con una voz de marca fija.
- Accesibilidad: generación de audio para personas con discapacidad visual a partir de contenido textual en ruso, con voces personalizadas que resulten familiares al usuario.
- Prototipado de productos de voz: gracias a la licencia Apache-2.0 y a la ausencia de adaptadores separados, permite montar demos y MVPs de TTS con clonación sin coste de licencia ni gestión de artefactos adicionales.
- Investigación en TTS y evaluación de clonación: el paquete incluye procedencia verificable (`export_provenance.json`) y métricas de evaluación, lo que facilita reproducir comparativas de similitud de hablante y WER frente al baseline.

## Benchmarks y rendimiento
La model card reporta una evaluación realizada antes del merge, en el pipeline independiente de entrenamiento, con 12 casos y 4 hablantes. Son diferencias absolutas de métrica frente al baseline suministrado, no porcentajes de calidad perceptual, y no se midieron en SGLang ni sobre el checkpoint fusionado.

| Metrica | Valor reportado |
|---|---|
| Delta medio de similitud de hablante | -0,00467739 |
| Peor delta medio por hablante | -0,01187599 |
| Delta medio de WER | +0,00520833 |
| Tamano del benchmark | 12 casos, 4 hablantes |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,12 mil millones de parámetros en FP32, los pesos ocupan aproximadamente 8,5 GB; a FP16 bajarían a unos 4,2 GB, más el overhead del códec RedAE, CAM++ y el runtime de SGLang Omni.
- GPU recomendadas: no se especifican en la documentación. La integración inspeccionada usa `CUDA_VISIBLE_DEVICES=0`, lo que sugiere que una sola GPU es suficiente; por tamaño, una RTX 4090 (24 GB) o una A100/H100 cubren el modelo con holgura en FP32.
- GPU de consumo: previsiblemente cabe en GPUs consumer con 12-16 GB o más, aunque el autor no publica requisitos mínimos verificados.
- Opciones de despliegue: SGLang Omni con soporte FireRedTTS3 (PR #3005, revisión `718b51d52a2cffe2218f9c6a1ae076756eb8a505`). Instalaciones antiguas de SGLang/Omni no soportan este modelo. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Idiomas | Licencia | Clonacion zero-shot |
|---|---|---|---|---|---|
| FireRedTTS3-Base-Russian-v2 | 2,12 mil millones | 400 caracteres por petición (API SGLang Omni) | Ruso | Apache-2.0 | Sí (referencia + transcripción) |
| FireRedTTS3 (original, FireRedTeam) | no disponible en la información | no disponible | No especificado | Apache-2.0 | Sí (base del adaptado) |
| CKermit/FireRedTTS3-Base (empaquetado) | no disponible en la información | no disponible | No especificado | Apache-2.0 | Sí (plantilla de empaquetado) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la única comparación publicada es la del adaptador frente a su baseline en el conjunto de 12 casos descrito arriba.

## Limitaciones y advertencias
- La validación del merge no es una prueba de paridad GPU extremo a extremo en SGLang; la precisión de ejecución y los ajustes de generación pueden producir salidas distintas a las del pipeline de entrenamiento.
- El benchmark reportado es muy pequeño (12 casos, 4 hablantes) y no permite concluir paridad general en clonación de voz ni en prosodia.
- El límite de 400 caracteres por petición en la API inspeccionada obliga a trocear textos largos, con riesgo de discontinuidades prosódicas en las uniones.
- Solo soporta ruso; no se declaran capacidades multilingües.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un corpus ruso no publicado, puede heredar sesgos de acento, género y registro de ese corpus.
- Riesgo de alucinación en la prosodia y de artefactos en la síntesis con referencias de audio ruidosas o transcripciones inexactas; la calidad de la clonación depende de que la transcripción de referencia sea correcta.
- Licencia Apache-2.0 permisiva para uso comercial, pero el paquete contiene pesos modificados: conviene conservar la atribución upstream recogida en `UPSTREAM_MODEL_CARD.md` y el fichero `LICENSE`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- El uso de clonación de voz exige consentimiento explícito del hablante de referencia y cumplimiento de la normativa aplicable sobre síntesis de voz y suplantación de identidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/shustov-te/FireRedTTS3-Base-Russian-v2
- Modelo base empaquetado: https://huggingface.co/CKermit/FireRedTTS3-Base
- Modelo original: https://huggingface.co/FireRedTeam/FireRedTTS3
- Integración en SGLang Omni (PR #3005): https://github.com/sgl-project/sglang-omni/pull/3005
