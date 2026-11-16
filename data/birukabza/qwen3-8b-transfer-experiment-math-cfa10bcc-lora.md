# birukabza/qwen3-8b-transfer-experiment-math-cfa10bcc-lora

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-8B, desarrollado por el usuario birukabza. No se trata de un modelo nuevo ni de una mejora del modelo base, sino de un artefacto experimental de transferencia de dominio en matematicas y fisica. El autor lo describe explicitamente como un experimento, no como una reivindicacion de modelo mejorado, y requiere el modelo base Qwen3-8B para funcionar.

El adaptador se entrena exclusivamente sobre el dataset EleutherAI/hendrycks_math (5.692 ejemplos, 1 epoch, 1.999.954 tokens de entrada) con el objetivo declarado de evaluar si el ajuste fino en matematicas produce transferencia positiva al dominio de fisica. Los resultados publicados muestran lo contrario: regresiones de 19,2 puntos porcentuales en matematicas y 19,0 puntos en fisica respecto al modelo base, sin transferencia cruzada positiva observada.

Su relevancia es metodologica mas que practica: documenta un caso de sobreajuste o degradacion por ajuste fino con LoRA de rango 16 sobre un dataset relativamente pequeno, con auditoria post-hoc de respuestas y preservacion de los artefactos de evaluacion. Es util como referencia negativa en experimentos de transferencia y para estudiar el impacto del ajuste fino de bajo rango en modelos de 8B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-8B |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3-8B tiene 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en BF16) |
| Idiomas soportados | en |
| Licencia | no disponible (el autor declara que no se concede nueva licencia publica para estos adaptadores experimentales privados; base Apache 2.0, MATH MIT, fisica CC BY-SA 4.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 con alpha 32, entrenado en precision BF16 sobre el modelo base Qwen/Qwen3-8B. La tasa de aprendizaje empleada fue 0,0002 y se realizo una unica epoca sobre 5.692 ejemplos del dataset EleutherAI/hendrycks_math, con un total de 1.999.954 tokens de entrada. No se documentan tecnicas de RLHF, DPO ni innovaciones arquitectonicas adicionales; el interes esta en la configuracion del experimento de transferencia.

La evaluacion se realizo sobre 500 preguntas retenidas por dominio (matematicas y fisica), con puntuaciones de fisica basadas en concordancia con la clave de respuestas. Los resultados se obtuvieron mediante una auditoria post-hoc del fichero completo de respuestas (3.000 respuestas), combinando coincidencia con referencias y adjudicacion manual de respuestas finales ambiguas. El autor advierte que las referencias sinteticas de fisica incluyen elementos ambiguos y que se uso una sola semilla.

## Capacidades

- Generacion de texto y conversacion (pipeline text-generation, tag conversational).
- Razonamiento matematico (entrenado especificamente sobre MATH).
- Resolucion de problemas de fisica (evaluado, aunque con regresion).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles (language: en).
- No se documenta modo thinking, vision ni audio.
- Capacidades heredadas del modelo base Qwen3-8B, no verificadas en este adaptador.

## Casos de uso

- Referencia negativa en experimentos de transferencia: util para investigadores que estudien si el ajuste fino en matematicas mejora fisica; este artefacto documenta un caso de regresion de 19 puntos porcentuales en ambos dominios.
- Estudio de sobreajuste con LoRA de bajo rango: permite analizar como rango 16, alpha 32 y una sola epoca sobre 5.692 ejemplos degradan el rendimiento de un modelo de 8B.
- Reproducibilidad de evaluaciones: los ficheros JSON con puntuaciones originales, auditoria completa e intervalos permiten replicar el protocolo de evaluacion con auditoria post-hoc.
- Analisis de sensibilidad a semilla: al usar una sola semilla, sirve como punto de partida para estudiar la varianza de resultados en ajuste fino de matematicas.
- Docencia en ajuste fino: ejemplo didactico de configuracion PEFT (rango, alpha, LR, epocas) y de como medir transferencia cruzada entre dominios.
- Auditoria de respuestas ambiguas: el protocolo de adjudicacion manual de respuestas finales ambiguas puede reutilizarse en evaluaciones de matematicas y fisica.
- No recomendado para produccion: el propio autor advierte que las puntuaciones no establecen calidad general del modelo.

## Benchmarks y rendimiento

| Evaluacion | Baseline (Qwen3-8B) | Adaptador | Cambio |
|---|---:|---:|---:|
| Matematicas (500 preguntas) | 78,6% | 59,4% | -19,2 pp |
| Fisica (500 preguntas) | 72,6% | 53,6% | -19,0 pp |

Las puntuaciones corresponden a la auditoria post-hoc del fichero completo de respuestas (3.000 respuestas), con coincidencia de referencia y adjudicacion manual de respuestas finales ambiguas. Los deltas negativos son regresiones; no se observo transferencia cruzada positiva. El autor advierte que las salidas truncadas siguen siendo incorrectas, que se uso una sola semilla y que las referencias sinteticas de fisica incluyen elementos ambiguos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Qwen3-8B y de la cuantizacion empleada.
- GPU recomendadas: no disponible en la informacion proporcionada; el modelo base de 8B requiere GPUs con memoria suficiente para su cuantizacion (no se especifica).
- Cabida en GPU consumer: no disponible; depende de la cuantizacion del base Qwen3-8B.
- Opciones de despliegue: la libreria declarada es PEFT, por lo que requiere cargar el base Qwen3-8B y aplicar el adaptador; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Tamano del repositorio: 0,2 GB (solo el adaptador).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| birukabza/qwen3-8b-transfer-experiment-math-cfa10bcc-lora | Adaptador LoRA sobre 8B | no disponible | -19,2 pp en matematicas, -19,0 pp en fisica | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | 8B | no disponible en esta ficha | 78,6% matematicas, 72,6% fisica (segun el autor) | Apache 2.0 (segun el autor) | Hugging Face |
| Alternativas de ajuste fino en matematicas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Regresion documentada: el adaptador empeora el rendimiento del base en matematicas (-19,2 pp) y fisica (-19,0 pp); no debe usarse como sustituto del base.
- No es una mejora del modelo: el autor lo describe como artefacto experimental, no como reivindicacion de modelo mejorado.
- Una sola semilla: los resultados no permiten estimar varianza ni establecer conclusiones robustas.
- Referencias sinteticas ambiguas: la evaluacion de fisica incluye elementos ambiguos que pueden afectar a las puntuaciones.
- Salidas truncadas: el autor indica que las salidas truncadas siguen siendo incorrectas.
- Licencia no disponible: no se concede nueva licencia publica para los adaptadores; el uso comercial queda sin autorizacion explicita.
- Idioma limitado al ingles.
- No se documentan sesgos conocidos ni tasas de alucinacion especificas.
- Las capacidades heredadas del base Qwen3-8B no estan verificadas en este adaptador.
- Requiere el modelo base Qwen3-8B para funcionar; no es autonomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/birukabza/qwen3-8b-transfer-experiment-math-cfa10bcc-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/hendrycks_math
- Instrucciones de carga (USAGE.md, referenciado en la model card): no disponible como URL directa en la informacion proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
