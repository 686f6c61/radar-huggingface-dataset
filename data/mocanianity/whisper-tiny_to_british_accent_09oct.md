# Mocanianity/whisper-tiny_to_british_accent_09oct

## Resumen

Whisper tiny to british accent 09oct es un ajuste fino (fine-tune) del modelo openai/whisper-tiny para reconocimiento automatico del habla (ASR) sobre acento britanico. Lo publica el usuario Mocanianity en Hugging Face y parte del checkpoint original de OpenAI, un transformer encoder-decoder de tipo Whisper con 37,76 millones de parametros. El problema que aborda es la adaptacion de un modelo ASR generico y muy pequeno a una variante dialectal concreta del ingles, en este caso el ingles britanico.

El modelo se ha entrenado con el Trainer de Hugging Face sobre el dataset etiquetado como British_english, con 2000 pasos de entrenamiento, learning rate de 1e-5, batch de 2 y warmup de 500 pasos. El autor declara un WER de 10,54 sobre el split de test de dicho dataset, con una perdida de validacion de 0,2580. Es, por tanto, un experimento de ajuste fino de bajo coste sobre una base ya muy ligera, no un modelo de proposito general.

Su relevancia es limitada y muy especifica: sirve como ejemplo reproducible de fine-tuning de Whisper tiny para acentos y como componente de bajo consumo en tareas de transcripcion donde el vocabulario y el dominio esten acotados al ingles britanico. No debe confundirse con un modelo ASR multilingue ni con una solucion de produccion validada: la model card esta generada automaticamente y carece de documentacion sobre datos, sesgos o limitaciones. La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion externa obliga a validar el modelo en el dominio objetivo antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante tiny: un transformer encoder-decoder con atencion estandar, entrenado originalmente para transcripcion y traduccion de voz. El checkpoint base openai/whisper-tiny se ha ajustado mediante el Trainer de transformers 5.23.0.dev0 sobre el dataset British_english, con optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler lineal, warmup de 500 pasos, learning rate 1e-5, batch de entrenamiento 2 y batch de evaluacion 1, semilla 42 y 2000 pasos totales.

No se documenta el numero de horas de audio, la composicion del dataset ni si hubo aumentacion de datos, filtrado o validacion cruzada. Tampoco se indica si se congelaron capas del encoder o del decoder durante el ajuste. La unica innovacion tecnica reseñable es el propio ajuste fino sobre una base de 37,76 M de parametros, que permite inferencia en CPU o GPU de gama baja con un coste de entrenamiento minimo. No hay informacion sobre RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en ingles, con especializacion declarada en acento britanico.
- Reconocimiento automatico del habla sobre ventanas de audio de hasta 30 segundos, segun el diseno de Whisper.
- Generacion de transcripciones sin puntuacion ni diarizacion garantizadas (no documentado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- No se documentan modos especiales (thinking, vision, audio adicional) mas alla de la entrada de audio propia de ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles britanico: el modelo puede convertir audio corto en texto con un consumo de recursos minimo, adecuado para prototipos y herramientas internas donde no se requiere diarizacion.
- Subtitulado automatico de contenido audiovisual acotado: util para generar subtitulos preliminares en ingles britanico que luego se revisan manualmente, dado su tamano reducido y su bajo coste de inferencia.
- Preprocesado de audio en pipelines de analitica: transcripcion de llamadas o grabaciones para posteriores tareas de NLP (busqueda, clasificacion), siempre que el dominio sea ingles britanico y el ruido de fondo sea moderado.
- Asistencia a la accesibilidad: conversion de voz a texto en aplicaciones de lectura para personas con dificultades auditivas, en entornos controlados y con validacion previa del WER en el dominio.
- Prototipado e investigacion en adaptacion de acentos: sirve como referencia reproducible para experimentos de fine-tuning de Whisper tiny sobre variantes dialectales, con hiperparametros documentados.
- Despliegue en dispositivos con recursos limitados: al tener 37,76 M de parametros, puede ejecutarse en CPU o en GPUs de gama baja para tareas de transcripcion puntual, como dictado offline en portatiles.
- Filtrado y moderacion de audio: transcripcion rapida de fragmentos cortos para detectar palabras clave en ingles britanico, con revision humana posterior por el riesgo de errores del 10,54 % de WER declarado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| ASR | British English (split test) | WER | 10,5422 |
| ASR | British English (split test) | Loss | 0,2580 |

Evolucion durante el entrenamiento segun la model card:

| Epoca | Paso | Validation loss | WER |
|---|---|---|---|
| 1,1655 | 1000 | 0,2688 | 11,9880 |
| 2,3310 | 2000 | 0,2580 | 10,5422 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para 37,76 M de parametros; en la practica, el cuello de botella es el buffer de audio y el runtime, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe sobradamente en RTX 3060, RTX 4090, A100 o H100, aunque no las aprovecha.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers con pipeline de automatic-speech-recognition; tambien es compatible con runtimes de inferencia de Whisper como whisper.cpp u Ollama si se convierte el checkpoint, aunque no se documenta conversion oficial.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mocanianity/whisper-tiny_to_british_accent_09oct | 37,76 M | ventanas de 30 s (Whisper) | en | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | ventanas de 30 s | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | ventanas de 30 s | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | apache-2.0 | Hugging Face |

La comparacion con whisper-tiny es la mas directa: mismo tamano y arquitectura, pero el modelo ajustado esta especializado en ingles britanico y declara un WER de 10,54 en su dataset de test, mientras que no se dispone de cifras comparables del checkpoint original en ese mismo dataset. Whisper-base y Whisper-small ofrecen mayor capacidad a costa de mas parametros y VRAM; no se han publicado comparaciones de WER entre este ajuste y esos modelos en la informacion disponible.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"); no hay documentacion sobre datos, sesgos ni limitaciones del autor.
- El WER declarado (10,54) no esta verificado externamente y corresponde a un unico dataset de test; puede no generalizar a otros dominios, ruidos o variantes regionales del ingles.
- El nombre del modelo y de la model card ("Whisper tiny Spanish") es incoherente con el contenido: el ajuste es sobre ingles britanico, no sobre espanol. Esto puede inducir a error en la seleccion del modelo.
- Riesgo de alucinacion en transcripciones: Whisper tiende a inventar texto en silencios, ruido o audio de baja calidad, especialmente en variantes tiny.
- Capacidad multilingue limitada: solo se declara ingles; no se garantiza un comportamiento correcto en otros idiomas.
- Sin soporte documentado de tool calling, agentes ni tareas mas alla de ASR.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; se recomienda validar el modelo en el dominio de produccion antes de desplegarlo.
- El checkpoint se entreno con 2000 pasos y batch de 2, lo que sugiere un ajuste ligero y potencialmente insuficiente para dominios ruidosos o vocabulario tecnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mocanianity/whisper-tiny_to_british_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
