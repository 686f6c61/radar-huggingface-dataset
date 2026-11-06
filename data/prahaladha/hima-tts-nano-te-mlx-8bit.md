# Prahaladha/hima-tts-nano-te-mlx-8bit

## Resumen

hima-tts-nano-te-mlx-8bit es una conversión a MLX con pesos de 8 bits del modelo de síntesis de voz (text-to-speech) hima-tts-nano-te, desarrollado por el usuario Prahaladha. El modelo original está especializado en telugu (te) con soporte de inglés (en), y esta variante está pensada para ejecutar inferencia rápida en la GPU unificada de equipos Mac con Apple Silicon, sin necesidad de PyTorch. El repositorio ocupa 0,2 GB y contiene los safetensors del modelo, del códec y de las voces predefinidas.

Se trata de un modelo pequeño: el recuento real de parámetros en safetensors es de 20.998.017 (aproximadamente 21M), aunque la model card del autor describe el modelo base como de 62M de parámetros. Esta discrepancia probablemente se debe a que el recuento de safetensors excluye el códec o parte de los componentes auxiliares; se documenta tal cual aparece en los metadatos.

La relevancia de esta ficha es doble: por un lado, cubre un caso poco habitual en el ecosistema open source, la síntesis de voz en telugu; por otro, muestra el patrón de conversión a MLX de modelos pequeños para despliegue local en hardware de Apple. La licencia es "other" y no se detallan sus términos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de text-to-speech; no se detalla en la informacion proporcionada) |
| Parametros totales | 20.998.017 (segun safetensors); la model card del modelo base indica 62M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta variante); existe variante float16 del mismo autor |
| Idiomas soportados | telugu (te), ingles (en) |
| Licencia | other (terminos no detallados) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo (tipo de red, mecanismo de atencion, diseno del decodificador de audio) ni sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, horas de audio, uso de RLHF/DPO o tecnicas de alineacion. La model card solo indica que el modelo base es hima-tts-nano-te, que genera audio a 24 kHz en float32 y que incluye un componente separado (`codec.safetensors`) que convierte la salida del modelo en audio.

La innovacion tecnica documentada es la conversion a MLX con pesos de 8 bits, que reduce el tamano de descarga y permite ejecutar la inferencia en la GPU de un Mac con Apple Silicon sin dependencia de PyTorch. El paquete incluye un modulo de preprocesado de texto (`text/`) que convierte numeros, fechas y cantidades a palabras, y un tokenizador de texto (`tokenizer.model`). Tambien se documenta la posibilidad de clonar voces a partir de una grabacion usando el repositorio principal (que requiere PyTorch) y guardar el resultado como safetensors reutilizable en esta variante MLX.

## Capacidades

- Sintesis de voz (text-to-speech) en telugu, con soporte adicional de ingles segun los metadatos del modelo.
- Seis voces integradas: Bhavana (femenina), Lakshmi (femenina), Sravani (femenina), Srinivas (masculina), Karthik (masculina) y Pranay (masculina).
- Generacion de una voz aleatoria si no se especifica ninguna.
- Clonacion de voz a partir de una grabacion (mediante el repositorio principal en PyTorch) y reutilizacion del fichero de voz resultante en esta variante MLX.
- Generacion por lotes mediante `say_many`, que procesa varios textos a la vez con mayor rendimiento agregado.
- Control de reproducibilidad mediante semilla (`seed=`), para obtener la misma toma en cada ejecucion.
- Salida de audio en float32 a 24 kHz, guardable en WAV.
- Normalizacion de texto para numeros, fechas y cantidades.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Generacion de audiolibros o contenido narrado en telugu: el modelo permite sintetizar textos largos por lotes con `say_many`, lo que reduce el coste total de sintesis en comparacion con llamadas individuales; las seis voces permiten diferenciar narradores.
- Locuciones para aplicaciones moviles o web en telugu: al ser un modelo de ~21M parametros y 0,2 GB, puede empaquetarse o ejecutarse en local en un Mac con Apple Silicon para generar avisos, menus o mensajes de interfaz sin depender de un servicio en la nube.
- Prototipado de asistentes de voz para comunidades telugu: la clonacion de voz y la semilla de reproducibilidad facilitan iterar sobre el tono y la identidad vocal de un asistente antes de pasar a produccion.
- Doblaje y localizacion de contenido corto: el modelo puede generar pistas de voz para videos o tutoriales en telugu, con mezcla de terminos en ingles (la model card muestra un ejemplo con "free" y "coffee" intercalados).
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces de accesibilidad en telugu, ejecutandose localmente en el dispositivo del usuario.
- Investigacion en TTS de bajos recursos: al ser un modelo pequeno con pesos abiertos y variantes de cuantizacion, sirve como base para experimentos de fine-tuning, evaluacion de calidad o comparacion de arquitecturas en lenguas dravidicas.
- Generacion de voces sinteticas para pruebas automatizadas: el parametro `seed` permite obtener siempre la misma muestra de audio, util para tests de regresion en pipelines de audio.

## Benchmarks y rendimiento

La model card proporciona dos metricas de rendimiento, sin comparacion con otros modelos:

| Metrica | Valor |
|---|---|
| Velocidad en Apple M4 Pro (8 bits, `say_many` con 48 textos) | 50x tiempo real |
| Velocidad en Apple M4 Pro (float16, `say_many` con 48 textos) | 70x tiempo real |
| Tasa de letras mal leidas en 12 frases de prueba (8 bits) | 6,1 % |
| Tasa de letras mal leidas en 12 frases de prueba (float32 ONNX) | 6,9 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de sintesis de voz.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,2 GB y los pesos estan en 8 bits, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: Apple Silicon con GPU unificada; la model card cita mediciones en un Apple M4 Pro.
- Compatibilidad con GPU consumer: no se documenta soporte para GPU NVIDIA o AMD; el formato MLX esta disenado para Apple Silicon.
- Opciones de despliegue: libreria MLX mediante el modulo `hima_mlx` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 50x tiempo real con `say_many` en 48 textos sobre M4 Pro (8 bits); 70x en la variante float16. No se proporcionan cifras de latencia por frase individual.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia interna del mismo autor, existe la variante float16 del mismo modelo:

| Modelo | Parametros | Cuantizacion | Idiomas | Velocidad (M4 Pro, `say_many`) | Licencia |
|---|---|---|---|---|---|
| hima-tts-nano-te-mlx-8bit | 20.998.017 (safetensors) | 8 bits | te, en | 50x tiempo real | other |
| hima-tts-nano-te-mlx-fp16 | no disponible | float16 | te, en | 70x tiempo real | other |
| hima-tts-nano-te (base) | 62M (segun model card) | no disponible (PyTorch) | te, en | no disponible | other |

No se han identificado en la informacion disponible alternativas de otros autores con las que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La licencia es "other" y no se detallan sus terminos en la informacion disponible; es imprescindible revisar las condiciones antes de cualquier uso comercial.
- El modelo esta especializado en telugu; el soporte de ingles aparece en los metadatos pero no se detalla su alcance ni su calidad.
- La tasa de error de lectura de letras es del 6,1 % en 12 frases de prueba, medida sobre un conjunto muy reducido; no debe extrapolarse como garantia de calidad general.
- No se documentan sesgos conocidos, pero al ser un modelo de voz entrenado con datos no descritos, puede reproducir sesgos de acento, genero o registro presentes en el corpus.
- Riesgo de alucinacion en el sentido de pronunciacion incorrecta o lectura erronea de palabras no vistas, especialmente en textos con mezcla de idiomas o terminologia tecnica.
- No se especifica la longitud maxima de texto de entrada ni el contexto soportado; los textos muy largos pueden requerir troceado manual.
- La clonacion de voz requiere el repositorio principal en PyTorch y una grabacion de referencia; implica riesgos de uso indebido (suplantacion de identidad) que el autor no aborda en la model card.
- El modelo esta atado al ecosistema MLX y a hardware Apple Silicon; no hay soporte documentado para otras plataformas.
- El recuento de parametros en safetensors (21M) difiere del indicado en la model card del modelo base (62M); conviene verificar que componentes cubre cada cifra antes de dimensionar despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prahaladha/hima-tts-nano-te-mlx-8bit
- Modelo base: https://huggingface.co/Prahaladha/hima-tts-nano-te
- Variante float16: https://huggingface.co/Prahaladha/hima-tts-nano-te-mlx-fp16
