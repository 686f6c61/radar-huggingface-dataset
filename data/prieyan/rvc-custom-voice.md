# Prieyan/rvc-custom-voice

## Resumen

`Prieyan/rvc-custom-voice` es un conjunto de pesos entrenados para Retrieval-based Voice Conversion (RVC), un sistema de conversion de voz que transforma el timbre de una locucion existente hacia una voz concreta. No es un modelo de lenguaje ni un generador de texto: es un modelo generativo de audio que opera sobre una senal de voz de entrada y produce una version con otra identidad vocal. Lo publica el usuario Prieyan en Hugging Face y esta pensado para ejecutarse localmente con el repositorio RetrievalVoiceConversion.

El repositorio contiene unicamente los artefactos de inferencia: los pesos del generador (`G_latest.pth`), un indice FAISS de recuperacion (`speaker.index`) y la configuracion legible (`model.yaml`, RVC v2 a 32 kHz). No incluye el estado del optimizador ni las grabaciones originales, por lo que no es reentrenable a partir de lo publicado. El tamano del repo es de aproximadamente 0,5 GB.

Su relevancia es acotada: se trata de una voz personalizada concreta, sin benchmarks publicados, sin licencia declarada y sin pipeline de inferencia alojado. Resulta util para quien quiera reproducir esa voz concreta en su propia maquina mediante el pipeline de RVC, pero no constituye un modelo generalista ni una base sobre la que construir un producto sin verificar antes los derechos de la voz de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), generador con extraccion de caracteristicas HuBERT/ContentVec y recuperacion FAISS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende del audio de entrada y del TTS de origen) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch), `.index` (FAISS), `.yaml` (configuracion) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RVC v2, configurada a 32 kHz segun `model.yaml`. El pipeline tipico extrae caracteristicas de contenido del audio de entrada mediante HuBERT/ContentVec y la frecuencia fundamental (pitch) con el extractor configurado (el ejemplo de la model card descarga `rmvpe.pt`), y despues el generador sintetiza la voz objetivo. El componente de recuperacion (`speaker.index`) es un indice FAISS que permite recuperar fragmentos de la voz entrenada y mejorar la fidelidad del timbre generado.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del dataset, la duracion del audio usado ni si se aplicaron tecnicas de alineamiento o ajuste fino adicionales. Tampoco se especifica el numero de parametros del generador. Los pesos se prepararon a partir del commit `774b31d` del repositorio RetrievalVoiceConversion, y el repositorio excluye explicitamente el estado del optimizador y las grabaciones originales, lo que impide reanudar el entrenamiento con lo publicado.

## Capacidades

- Conversion de voz (voice conversion): transforma el timbre de un audio de habla de entrada hacia la voz entrenada, manteniendo presumiblemente el contenido linguistico y la prosodia.
- Integracion con TTS: la model card documenta un flujo Edge TTS → RVC para generar habla a partir de texto escrito antes de la conversion.
- Recuperacion por indice FAISS para mejorar la similitud con la voz de referencia.
- Extraccion de pitch mediante el extractor configurado (RMVPE en el ejemplo oficial).
- Ejecucion local: no hay runtime de inferencia alojado en el repositorio.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision, audio de entrada distinto de voz ni modo de pensamiento.

## Casos de uso

- Doblaje y localizacion de contenido: convertir la voz de un locutor a la voz entrenada manteniendo la sincronizacion, usando `scripts/infer.py` sobre los WAV originales.
- Prototipado de personajes para videojuegos o animacion: generar lineas de dialogo con una identidad vocal coherente a partir de un TTS y el modelo RVC.
- Audiolibros y narracion sintetica: encadenar Edge TTS con `scripts/tts_infer.py` para producir narracion con un timbre constante en todo el texto.
- Investigacion en conversion de voz: usar los pesos y el indice como referencia para comparar tecnicas de recuperacion o de extraccion de pitch en un entorno controlado.
- Creacion de contenido para redes: transformar grabaciones propias en la voz objetivo para videos, siempre que se cuente con los derechos correspondientes.
- Pruebas de robustez y deteccion de deepfakes: emplear el modelo como muestra positiva para evaluar clasificadores de audio sintetico o sistemas de verificacion de hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo ocupa unos 0,5 GB, pero el consumo real depende del generador, del modelo HuBERT/ContentVec y del extractor de pitch, que se descargan aparte.
- GPU recomendadas: no disponibles. Al no publicarse requisitos, cualquier estimacion seria especulativa.
- Compatibilidad con GPU de consumo: no confirmada; conviene probar en una GPU con suficiente VRAM para el conjunto generador + HuBERT + RMVPE.
- Opciones de despliegue: el repositorio oficial RetrievalVoiceConversion con `uv` (`uv sync`, `uv run python scripts/infer.py`, `uv run python scripts/tts_infer.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prieyan/rvc-custom-voice | RVC v2, voz concreta | no disponible | no aplica | no disponible | Pesos en HF, inferencia local |
| RVC base (Retrieval-based Voice Conversion) | RVC, framework | no disponible | no aplica | segun repositorio original | Codigo y pesos base publicos |
| Modelos TTS comerciales (p. ej. servicios en la nube) | TTS | no disponible | no aplica | propietaria | API alojada |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada; la comparacion se limita a tipo de modelo, disponibilidad y licencia.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial queda sin amparo explicito y requiere contactar con el autor o verificar los terminos del repositorio de origen.
- No se documenta el origen de la voz entrenada ni si existio consentimiento; el uso de una voz sintetica con identidad de una persona real plantea riesgos legales y eticos.
- Riesgo de suplantacion de identidad y de deepfakes de audio; debe etiquetarse el contenido generado y respetarse la normativa aplicable.
- No hay benchmarks ni evaluaciones de calidad, similitud de hablante ni inteligibilidad.
- El modelo solo convierte voz existente; para texto requiere un TTS previo (Edge TTS en el flujo documentado).
- No incluye estado de entrenamiento ni grabaciones originales, por lo que no es reentrenable a partir de lo publicado.
- Los requisitos de hardware y el rendimiento no estan documentados; el despliegue en produccion exige validacion propia.
- Sesgos y limitaciones de idioma: no disponibles; el comportamiento dependera del audio de entrada y del modelo de contenido HuBERT/ContentVec.

## Enlaces

- Hugging Face: https://huggingface.co/Prieyan/rvc-custom-voice
- Repositorio RetrievalVoiceConversion: https://github.com/TheCoalitionOfPlanets/RetrievalVoiceConversion
- Commit de origen: https://github.com/TheCoalitionOfPlanets/RetrievalVoiceConversion/commit/774b31ddb2c99688e3a17de20e02b8bde3482077
- Pesos RMVPE (VoiceConversionWebUI): https://huggingface.co/lj1995/VoiceConversionWebUI
