# muyleanging/VoxPocket-v5

## Resumen

VoxPocket-v5 es un modelo de síntesis de voz (text-to-speech) especializado en jemer (khmer), desarrollado por el usuario muyleanging y publicado en Hugging Face. Se construye mediante fine-tuning de VoxCPM 1.5 (openbmb) y está diseñado para leer jemer con claridad, jemer con palabras en inglés intercaladas (code-mixing) e inglés plano, además de permitir clonación de voz a partir de un clip corto y control de estilo o descripción de voz.

El modelo tiene 801.729.856 parámetros (aproximadamente 0,89B), genera audio a 44,1 kHz y se distribuye con licencia Apache 2.0. Su relevancia radica en que cubre un idioma con muy poca cobertura en TTS de calidad (jemer) y lo hace con un modelo compacto que, según el autor, supera en precisión de lectura a su modelo profesor VoxCPM2 (2,38B) siendo 2,7 veces más pequeño.

La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face; los datos no presentes se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en VoxCPM 1.5 (no se detalla la arquitectura interna en la informacion disponible) |
| Parametros totales | 801.729.856 (aprox. 0,89B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (texto de entrada; se recomienda dividir en frases) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Jemer (km), ingles (en); jemer con palabras en ingles intercaladas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria voxcpm) |

## Arquitectura y entrenamiento

El modelo parte de VoxCPM 1.5, un modelo TTS de openbmb, y se afina sobre el release previo de VoxPocket ya ajustado a jemer, con una pasada completa adicional de entrenamiento. La model card no detalla la arquitectura interna (transformer, difusion, etc.); unicamente indica que la inferencia se realiza mediante la libreria `voxcpm` con parametros como `cfg_value` e `inference_timesteps`, y que el audio se genera a 44,1 kHz.

El entrenamiento utilizo 778.028 clips, aproximadamente 1.010 horas de audio unico (1.247 h contando el habla real dos veces): 237 h de habla real jemer con doble peso, unas 600 h de habla sintetica generada por VoxCPM2 y filtrada por un reconocedor de voz (solo se conservaron clips con ≤ 15% de error de letra), incluyendo 340 h nuevas de habla con estilo y emocion, lectura larga multi-frase y frases jemer con palabras en ingles, y 157 h de pares clip de voz + estilo para que una voz clonada pueda cambiar de tono. Se entreno con learning rate 2e-5 con warm-up, batch efectivo de 18 clips y 43.200 pasos. No se menciona RLHF ni DPO.

## Capacidades

- Sintesis de voz en jemer con una tasa mediana de error de letra del 3,7% en frases retenidas (segun el autor).
- Lectura de jemer con palabras en ingles intercaladas (code-mixing) e ingles plano.
- Clonacion de voz a partir de un clip limpio de 4 a 9 segundos, indicando exactamente el texto pronunciado en el clip.
- Control de estilo mediante etiquetas entre parentesis (susurro, enfadado, feliz, sorprendido, triste, excitado, calmado, tono de locutor).
- Diseno de voz sin clip de referencia, describiendo la voz en parentesis.
- Generacion de audio a 44,1 kHz.
- No se menciona soporte de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Lectura de noticias y articulos en jemer: el modelo puede narrar parrafos cortos (hasta unas 3 frases) con buena precision; para textos largos conviene dividir en frases y unir el audio, como recomienda el autor.
- Audiolibros y contenido educativo en jemer: permite generar narracion con voces clonadas de locutores concretos y alternar estilos (tono de locutor serio, calmado) segun la seccion.
- Asistentes de voz para hablantes de jemer: la clonacion de voz y el control de estilo permiten crear una identidad de marca consistente y adaptar el tono a distintos contextos.
- Localizacion de contenido con code-mixing: al leer jemer con terminos tecnicos en ingles, es util para tutoriales, cursos de tecnologia y material bilingue donde los terminos no tienen traduccion asentada.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual o dificultades de lectura en jemer, con voces naturales y posibilidad de ajustar velocidad y estilo (calmado, lento).
- Prototipado rapido de productos de voz: con 0,89B de parametros y un pico de memoria de 3,8 a 6,3 GB en una RTX 5090, se puede desplegar en una GPU de consumo para demos y pruebas de concepto.
- Doblaje y produccion de audio con emociones: los pares clip + estilo permiten que una voz clonada exprese enfado, sorpresa o tristeza en escenas concretas.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las pruebas usan el mismo clip de voz, cfg 2.0, 10 pasos y semilla 0; la calidad se mide con un reconocedor de voz en jemer (`seanghay/Qwen3-ASR-0.6B-Khmer`) contando errores de letra sobre frases no vistas en entrenamiento.

| 40 frases retenidas | Error mediano | Error medio | Frases con > 10% de errores |
|---|---|---|---|
| VoxPocket (esta version) | 4,3% | 6,1% | 8 / 40 |
| VoxPocket (version previa) | 6,6% | 7,2% | 10 / 40 |
| VoxCPM2 (2,38B) | 4,8% | 7,0% | 12 / 40 |

En una segunda maquina, el autor reporta 3,7% (paso 30.000) frente a 5,1% de la version previa.

| En 1x NVIDIA GeForce RTX 5090 | VoxPocket | VoxCPM2 |
|---|---|---|
| Parametros | 0,89B | 2,38B |
| Velocidad | 3,6x tiempo real | 2,7x |
| Tiempo hasta el primer sonido (streaming) | 64 ms | 77 ms |
| Memoria GPU pico (texto corto / largo) | 3,8 / 6,3 GB | 6,5 / 8,9 GB |
| Potencia GPU hablando | 173 W | 205 W |
| Energia por minuto de habla | 0,80 Wh | 1,29 Wh |
| RAM de CPU | 1,9 GB | 3,1 GB |

Checkpoints alternativos publicados: paso 35.000 (4,0% de error mediano), paso 40.000 (4,0%) y final-43200 (4,0%).

## Requisitos de hardware

- VRAM estimada para inferencia: 3,8 GB para texto corto y 6,3 GB para texto largo en una RTX 5090, segun el autor.
- RAM de CPU: 1,9 GB.
- GPU recomendadas: el autor mide en una NVIDIA GeForce RTX 5090; por el tamano (0,89B) y el consumo de memoria, deberia caber en GPUs de consumo con al menos 8 GB de VRAM, aunque no se publican mediciones en otras GPU.
- Cabe en GPU de consumo: si, segun los requisitos de memoria indicados (no se detallan modelos concretos aparte de la RTX 5090).
- Opciones de despliegue: libreria `voxcpm` (`VoxCPM.from_pretrained`), con `load_denoiser=False`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3,6x tiempo real, 64 ms hasta el primer sonido en streaming, 173 W de potencia y 0,80 Wh por minuto de habla en la RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Calidad (error mediano, 40 frases) | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxPocket-v5 | 0,89B | km, en | 4,3% | 3,6x tiempo real | Apache 2.0 | Hugging Face |
| VoxCPM2 | 2,38B | No detallado | 4,8% | 2,7x tiempo real | No disponible | Referenciado como modelo base |
| VoxPocket (version previa) | No disponible | km, en | 6,6% | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos TTS comparables en la informacion proporcionada.

## Limitaciones y advertencias

- En parrafos muy largos (450+ caracteres) comete muchos errores y VoxCPM2 es mejor en ese caso; se recomienda dividir el texto en frases.
- Las palabras duplicadas con el signo `ៗ` deben escribirse completas (`ភ្លាមភ្លាម`) o expandirse en el preprocesado.
- La clonacion de voz requiere clips limpios de 4 a 9 segundos y el texto exacto pronunciado en el clip; clips ruidosos o mal transcritos degradan el resultado.
- El modelo se evalua con un reconocedor automatico de voz, no con juicio humano; los errores de letra son una metrica proxy.
- Los benchmarks se miden en una unica GPU (RTX 5090) y el autor indica variacion entre maquinas (4,3% frente a 3,7% en el mismo checkpoint).
- Riesgo de uso indebido de la clonacion de voz; la licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones eticas adicionales.
- No se documentan sesgos especificos ni limitaciones de contexto o idioma mas alla de los idiomas soportados.
- El modelo base VoxCPM 1.5 y los datos sinteticos de VoxCPM2 condicionan el comportamiento; no se detalla la licencia de VoxCPM2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/VoxPocket-v5
- Demo en el navegador: https://huggingface.co/spaces/muyleanging/VoxPocket-TTS-Demo
- Dataset de entrenamiento: https://huggingface.co/datasets/muyleanging/VoxPocket-TTS-Khmer-Data-Preview
- Modelo base: https://huggingface.co/openbmb/VoxCPM1.5
- Reconocedor de voz usado en la evaluacion: https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
