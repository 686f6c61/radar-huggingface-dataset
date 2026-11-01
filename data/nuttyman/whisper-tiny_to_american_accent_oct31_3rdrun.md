# Nuttyman/whisper-tiny_to_american_accent_oct31_3rdrun

## Resumen

Whisper tiny American es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Nuttyman en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en ingles americano, derivado del conocido modelo Whisper de OpenAI en su variante mas pequena. El modelo resuelve la tarea de transcripcion de audio a texto, con un sesgo deliberado hacia el acento y las caracteristicas del ingles estadounidense, lo que puede resultar util para aplicaciones que operan exclusivamente con hablantes de ese dialecto.

El modelo cuenta con 37.760.640 parametros totales y un tamano de repositorio de 0,6 GB, lo que lo situa en la gama ultraligera de modelos ASR. Al estar basado en whisper-tiny, hereda la arquitectura transformer encoder-decoder caracteristica de la familia Whisper, disenada para transcripcion multitarea (transcripcion, traduccion, deteccion de idioma y marcas temporales). Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo es limitada pero concreta: sirve como ejemplo de ajuste fino de bajo coste sobre un modelo ASR ya compacto, y puede ser util como punto de partida para desarrolladores que quieran especializar Whisper en un acento o dominio concreto sin incurrir en los costes de un modelo grande. No obstante, su calidad (WER de 9,26 sobre el conjunto de evaluacion declarado) y su escasa documentacion lo posicionan como un experimento mas que como un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, que emplea una arquitectura transformer encoder-decoder. El encoder procesa espectrogramas mel de audio y el decoder genera tokens de texto de forma autorregresiva. Whisper tiny es la variante mas pequena de la familia, con aproximadamente 39 millones de parametros en su version original (aqui 37,76 millones en safetensors). El modelo base esta disenado para tareas multitarea de ASR, incluyendo transcripcion, traduccion al ingles, deteccion de idioma y prediccion de marcas temporales.

El entrenamiento se realizo sobre un dataset denominado "American_english" (identificado en la model card como `American_english`), aunque no se proporciona informacion sobre su composicion, tamano ni procedencia. Los hiperparametros declarados son: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 4000 pasos totales de entrenamiento. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste supervisado convencional. No se declaran innovaciones tecnicas destacables mas alla del propio fine-tuning.

## Capacidades

- Transcripcion de audio a texto en ingles, con especializacion en acento americano.
- Reconocimiento automatico del habla sobre ventanas de audio de hasta 30 segundos (limitacion heredada de Whisper tiny).
- Soporte de marcas temporales a nivel de segmento (capacidad nativa de Whisper, aunque no se documenta explicitamente su conservacion tras el fine-tuning).
- Deteccion de idioma y traduccion al ingles (capacidades del modelo base, no verificadas en este ajuste).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan modos especiales como thinking mode, vision o audio mas alla del ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles americano: el modelo puede convertir grabaciones cortas (hasta 30 segundos por ventana) en texto, adecuado para actas o resumenes posteriores en entornos donde los hablantes usan ingles estadounidense.
- Subtitulado automatico de contenido audiovisual: dado su bajo coste computacional, puede desplegarse para generar subtitulos en ingles en pipelines de video, con marcas temporales si se conservan las capacidades del modelo base.
- Prototipado rapido de asistentes de voz: al ser un modelo de 37,7 millones de parametros, permite iterar rapidamente en entornos de desarrollo con recursos limitados antes de escalar a modelos mayores.
- Investigacion sobre sesgos de acento en ASR: sirve como caso de estudio para comparar el rendimiento de un modelo especializado en acento americano frente al modelo base multilingue.
- Educacion y practica de ingles: puede emplearse para transcribir ejercicios de pronunciacion de estudiantes y comparar con el texto de referencia, aunque su WER de 9,26 limita la precision en este uso.
- Despliegue en dispositivos de borde (edge computing): su tamano reducido (0,6 GB de repositorio) permite ejecutarlo en hardware modesto, como Raspberry Pi o moviles, para tareas de transcripcion offline en ingles.
- Generacion de datos sinteticos de audio-texto: puede utilizarse para etiquetar automaticamente corpus de audio en ingles americano, con la cautela de que el WER introduce errores que deben filtrarse.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card, no verificados de forma independiente.

| Benchmark | Metrica | Valor |
|---|---|---|
| American English (split test) | WER | 9,2570 |
| American English (evaluacion) | Loss | 0,2029 |

Evolucion durante el entrenamiento (segun la model card):

| Epoch | Step | Validation loss | WER |
|---|---|---|---|
| 0,9452 | 1000 | 0,2052 | 10,9292 |
| 1,8904 | 2000 | 0,1960 | 9,2053 |
| 2,8355 | 3000 | 0,1955 | 9,1191 |
| 3,7807 | 4000 | 0,2029 | 9,2570 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 millones de parametros); en la practica, menos de 500 MB con cuantizacion de 8 bits o 4 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4090; tambien funciona en CPU sin problemas.
- Cabe en practicamente cualquier GPU consumer y en dispositivos de borde con poca memoria.
- Opciones de despliegue: transformers (libreria nativa), potencialmente ONNX Runtime y otros runtimes compatibles con Whisper; no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo transformer estandar podria adaptarse.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (declarado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nuttyman/whisper-tiny_to_american_accent_oct31_3rdrun | 37,76 M | no disponible | 9,26 (American English) | Apache 2.0 | HuggingFace |
| openai/whisper-tiny | ~39 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| openai/whisper-base | ~74 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| openai/whisper-small | ~244 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | HuggingFace |

No se dispone de datos de WER comparables para los modelos base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card indica "More information needed" en secciones clave (descripcion, usos previstos, datos de entrenamiento), lo que impide evaluar su robustez y generalizacion.
- WER de 9,26 sobre el conjunto de evaluacion declarado, no verificado de forma independiente; en produccion el rendimiento puede degradarse con acentos distintos al americano, ruido de fondo o audio de baja calidad.
- Especializado en ingles americano: no se garantiza un buen rendimiento con otros acentos o dialectos del ingles, ni con otros idiomas.
- Limitacion de ventana de audio de 30 segundos heredada de Whisper tiny; para audios mas largos se requiere segmentacion y posible perdida de contexto entre segmentos.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible pero incorrecto en silencios o audio ininteligible, especialmente en variantes pequenas.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset no descrito, pueden existir sesgos de dominio, genero o procedencia no evaluados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- Escaso numero de descargas (31) y ausencia de likes, lo que sugiere poca validacion por parte de la comunidad.
- No se documentan cuantizaciones oficiales ni pipelines de despliegue probados, lo que anade incertidumbre para uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Nuttyman/whisper-tiny_to_american_accent_oct31_3rdrun
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
