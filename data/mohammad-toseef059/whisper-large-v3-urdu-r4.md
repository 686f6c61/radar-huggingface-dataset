# mohammad-toseef059/whisper-large-v3-urdu-r4

## Resumen
El modelo `mohammad-toseef059/whisper-large-v3-urdu-r4` es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) `openai/whisper-large-v3`, publicado por el usuario mohammad-toseef059 en Hugging Face. Se distribuye como un adaptador LoRA sobre el modelo base, orientado especificamente al reconocimiento de voz en urdu, con soporte declarado tambien para arabe e ingles, y con enfasis en escenarios de code-switching (alternancia de idiomas dentro de una misma locucion).

El modelo se enmarca en la familia Whisper de OpenAI, una arquitectura transformer encoder-decoder entrenada originalmente con 680.000 horas de audio supervisado debilmente. Este ajuste concreto busca mejorar el rendimiento en urdu, un idioma con relativamente pocos recursos en el ecosistema ASR, y en situaciones donde el hablante mezcla urdu con ingles o arabe, algo comun en contextos urbanos de Pakistan y comunidades de la diaspora.

La relevancia actual del modelo es limitada pero especifica: cubre un nicho linguistico poco atendido por los modelos ASR comerciales y puede ser util para investigadores y desarrolladores que necesiten transcripcion de audio en urdu con mezcla de idiomas. El acceso esta restringido (gated) y no se ha publicado informacion sobre licencia, benchmarks ni volumenes de descargas, lo que limita su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) con adaptador LoRA |
| Parametros totales | no disponible (el modelo base Whisper large-v3 tiene 1.550 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite fp16, int8) |
| Idiomas soportados | urdu (ur), arabe (ar), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA sobre el modelo base) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Whisper large-v3 de OpenAI, un transformer encoder-decoder disenado para ASR multilingue. El encoder procesa espectrogramas Mel de audio en ventanas de 30 segundos y el decoder genera texto de forma autorregresiva. Whisper large-v3 fue entrenado con 680.000 horas de audio supervisado debilmente y 5 millones de horas de audio no supervisado, con capacidad para 99 idiomas.

Este ajuste concreto utiliza LoRA (Low-Rank Adaptation), una tecnica de fine-tuning eficiente en parametros que congela los pesos originales e inserta matrices de bajo rango entrenables en las capas de atencion. El nombre del repositorio (`-r4`) sugiere un rango LoRA de 4, aunque no se ha publicado informacion detallada sobre hiperparametros, composicion del dataset de entrenamiento, numero de pasos ni si se aplicaron tecnicas de RLHF o DPO. El enfasis declarado en code-switching indica que el dataset de ajuste probablemente contiene audio con alternancia urdu-ingles y urdu-arabe, pero no se dispone de cifras concretas.

## Capacidades
- Reconocimiento automatico del habla (ASR) en urdu, con soporte declarado para arabe e ingles.
- Manejo de code-switching: transcripcion de audio donde el hablante alterna entre urdu, ingles y arabe dentro de una misma locucion.
- Transcripcion de audio de hasta 30 segundos por ventana (limitacion heredada de Whisper large-v3); para audio mas largo se requiere segmentacion.
- Generacion de transcripciones con puntuacion y mayusculas (capacidad nativa de Whisper large-v3).
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- Capacidades multilingues limitadas a los tres idiomas declarados; no se ha verificado el rendimiento en otros idiomas del modelo base.

## Casos de uso
- Transcripcion de reuniones y entrevistas en urdu: el modelo puede convertir audio de reuniones en texto, util para equipos en Pakistan o comunidades de la diaspora que trabajan en urdu. Requiere segmentar el audio en ventanas de 30 segundos.
- Subtitulado de contenido audiovisual en urdu: generacion de subtitulos para videos, podcasts o material educativo en urdu, incluyendo fragmentos donde se intercalan terminos en ingles.
- Atencion al cliente en centros de llamadas: transcripcion de llamadas en urdu para analisis de calidad, cumplimiento normativo o generacion de resumentes posteriores, aprovechando el soporte de code-switching.
- Investigacion linguistica y sociolinguistica: estudio de patrones de code-switching urdu-ingles en corpus de audio, ya que el modelo esta especificamente ajustado para esta fenomenologia.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido en urdu, con la advertencia de que la calidad debe validarse en el dominio concreto.
- Documentacion medica o legal dictada en urdu: transcripcion de notas de voz de profesionales que dictan en urdu con terminologia tecnica en ingles, un escenario tipico de code-switching.
- Preprocesamiento para pipelines de NLP en urdu: conversion de audio a texto como paso previo a analisis de sentimiento, extraccion de entidades o indexacion de contenido hablado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base Whisper large-v3 requiere aproximadamente 10 GB en fp16 y alrededor de 5-6 GB en int8. Al tratarse de un adaptador LoRA, la VRAM adicional es minima (el adaptador r4 anade pocos megabytes), pero debe cargarse el modelo base completo.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de produccion con alto throughput; RTX 4090 o RTX 3090 para inferencia en fp16 en una sola GPU.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 4080 (16 GB) e incluso en GPUs de 8 GB si se aplica cuantizacion int8, aunque con posibles perdidas de precision.
- Opciones de despliegue: transformers (libreria nativa del repositorio), con posible conversion a otros formatos. No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto; Whisper large-v3 si tiene soporte en algunos de estos frameworks, pero la integracion del adaptador LoRA requeriria verificacion.
- Latencia y throughput estimados: no disponibles. Como referencia, Whisper large-v3 en una A100 procesa audio a varias veces la velocidad en tiempo real, pero no se han publicado mediciones para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mohammad-toseef059/whisper-large-v3-urdu-r4 | no disponible (base: 1.550 M) | 30 s por ventana | ur, ar, en | no disponible | Gated en HF |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | 99 idiomas | MIT (modelo base) | Abierto en HF |
| openai/whisper-large-v3-turbo | 809 M | 30 s por ventana | 99 idiomas | MIT | Abierto en HF |
| Modelos ASR especificos para urdu (p. ej. whisper-small-urdu) | variable | 30 s por ventana | ur | variable | variable en HF |

La comparativa se limita a la familia Whisper porque no se dispone de informacion sobre benchmarks de este ajuste frente a alternativas especificas para urdu. El modelo base Whisper large-v3 ofrece cobertura de 99 idiomas con licencia MIT, mientras que este ajuste restringe el ambito a tres idiomas y no declara licencia, lo que supone una desventaja para uso comercial sin aclaracion previa.

## Limitaciones y advertencias
- Licencia no disponible: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o revisar las condiciones del acceso gated antes de cualquier despliegue en produccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su uso en pipelines automatizados y reproducibilidad de experimentos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en urdu ni en code-switching; el rendimiento real es desconocido.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido, silencios o audio musical.
- Limitacion de contexto: ventanas de 30 segundos; audio mas largo requiere segmentacion y puede perder coherencia entre segmentos.
- Sesgos desconocidos: no se ha documentado la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos dialectales, de genero o de registro.
- Cobertura limitada a tres idiomas: no se ha verificado el rendimiento en otros idiomas que el modelo base si soporta; usarlo fuera de ur, ar o en puede degradar la calidad.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por la comunidad.
- Fecha de creacion futura (2026-11-13): la metadata indica una fecha posterior a la actual, lo que sugiere posible error en el registro o un repositorio de prueba; conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mohammad-toseef059/whisper-large-v3-urdu-r4
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
