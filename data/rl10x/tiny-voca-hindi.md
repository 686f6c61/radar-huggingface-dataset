# RL10x/tiny-voca-hindi

## Resumen

Tiny Voca Hindi es un modelo de síntesis de voz (text-to-speech) en hindi desarrollado por RL10x, un port del modelo tiny-voca de n4ze3m adaptado al hindi. Con solo 9,7 millones de parámetros, es un modelo extremadamente compacto que combina un transformer pequeño —encargado de predecir el timing, el tono (pitch) y la envolvente espectral— con un sintetizador fuente-filtro integrado que genera la forma de onda directamente a partir de un tren de pulsos y ruido filtrados. No requiere un vocoder neuronal separado, lo que reduce drásticamente el coste computacional y el tamaño del artefacto.

El modelo está pensado para inferencia en CPU: el GGUF cuantizado a 8 bits ocupa 11,1 MB y es capaz de generar decenas de segundos de audio en fracciones de segundo en un portátil con 8 hilos. Ofrece una única voz femenina con ocho estilos de habla (neutral, conversacional, alegre, triste, enfadado, asustado, sorprendido y asqueado) y normaliza números, fechas, horas y cantidades monetarias a palabras en hindi antes de sintetizar.

Su relevancia radica en la combinación de tamaño mínimo, licencia permisiva (CC-BY-4.0) y despliegue sin GPU, lo que lo hace adecuado para aplicaciones embebidas, sistemas de accesibilidad o prototipado rápido de interfaces de voz en hindi. El repositorio incluye tanto el checkpoint en PyTorch como los pesos en GGUF para un motor C++ sobre ggml, además del código de inferencia en Python y C++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pequeno con sintetizador fuente-filtro integrado (prediccion de timing, pitch y envolvente espectral; sin vocoder neuronal separado) |
| Parametros totales | 9.711.883 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits en matrices del transformer, resto float32) y float32 |
| Idiomas soportados | hindi (hi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (q8_0 y f32), PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo sigue un diseno hibrido poco habitual en TTS: un transformer de 9,7 M de parametros predice los parametros prosodicos y espectrales (timing, pitch y envolvente espectral), y un sintetizador fuente-filtro integrado —un tren de pulsos mas ruido, cada uno modelado por un filtro predicho— genera la forma de onda directamente. Esto elimina la necesidad de un vocoder neuronal separado, que suele ser el componente mas pesado en pipelines TTS convencionales, y explica el tamano tan reducido del artefacto final.

El entrenamiento se realizo sobre el dataset ai4bharat/Rasa y el checkpoint publicado corresponde a 100.000 pasos de entrenamiento. La model card no detalla el numero total de tokens procesados, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. El modelo incluye un modulo de normalizacion de texto en hindi (`hindi_text/`) que convierte numeros, fechas, horas y moneda a palabras antes de la sintesis.

## Capacidades

- Sintesis de voz en hindi con una unica voz femenina.
- Ocho estilos de habla controlables: neutral, conversacional, alegre, triste, enfadado, asustado, sorprendido y asqueado.
- Normalizacion de texto en hindi: conversion de numeros de telefono, fechas (por ejemplo, 15/08/2025), horas (7:30), porcentajes y cantidades monetarias (₹24.999) a palabras.
- Generacion de pasajes largos: la model card demuestra clips de hasta 67,8 segundos de audio generados en 1,72 segundos.
- Inferencia en CPU sin GPU, con motor C++ sobre ggml y pagina web ligera incluida.
- Codigo de inferencia en Python (`speak.py`, paquetes `tiny_voca/` y `hindi_text/`) y en C++.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de noticias y boletines en hindi: el modelo puede sintetizar parrafos largos (se han demostrado clips de casi 68 segundos) con prosodia natural, adecuado para generar audio de articulos o resumenes diarios de forma automatizada.
- Sistemas de anuncios publicos y transporte: con la normalizacion integrada de horas, fechas y numeros de plataforma, puede generar avisos como horarios de trenes o llegadas de autobuses directamente desde texto estructurado.
- Asistentes de voz embebidos: al caber en 11,1 MB en Q8_0 y ejecutarse en CPU, puede integrarse en dispositivos de bajo consumo (Raspberry Pi, routers, electrodomesticos) para respuestas habladas en hindi.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla en hindi con seleccion de estilo (por ejemplo, neutral para contenido informativo, conversacional para mensajes) en aplicaciones de escritorio o moviles sin depender de servicios en la nube.
- Contenido educativo y audiolibros: la variedad de estilos emocionales permite narrar cuentos infantiles o material didactico con entonacion alegre, triste o sorprendida segun el pasaje.
- Prototipado de interfaces conversacionales: desarrolladores que construyen chatbots de voz en hindi pueden usar el modelo como capa TTS local durante el desarrollo, sin coste de API ni latencia de red.
- Generacion de avisos financieros y de comercio: la conversion de cantidades monetarias (₹24.999) y porcentajes a palabras facilita la sintesis de confirmaciones de pedidos, saldos o promociones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta tiempos de sintesis medidos en un portatil con CPU de 8 hilos usando el GGUF Q8_0: 0,17 s para 7,6 s de audio (neutral), 0,11 s para 5,0 s (conversacional), 0,27 s para 12,0 s (numeros y fechas), 1,00 s para 36,8 s (pasaje largo neutral) y 1,72 s para 67,8 s (pasaje largo neutral). No se proporcionan metricas objetivas de calidad como MOS, MCD o WER.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para CPU y no requiere GPU.
- GPU recomendadas: no disponibles; no se documenta soporte GPU.
- Cabe en cualquier GPU consumer e incluso en sistemas sin GPU: el GGUF Q8_0 ocupa 11,1 MB y el f32 38,9 MB.
- Opciones de despliegue: motor C++ incluido sobre ggml (con pagina web ligera), codigo Python (`speak.py`) y checkpoint PyTorch. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: en CPU de portatil con 8 hilos, aproximadamente 0,10-0,13 s para clips de 4,4-6,1 s, 0,17-0,18 s para clips de 7,6-7,7 s y 1,00-1,72 s para pasajes de 36,8-67,8 s, lo que supone un factor de tiempo real de aproximadamente 40-45x en los clips cortos y de 37-39x en los largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Tiny Voca Hindi (RL10x) | 9,7 M | no disponible | hindi | CC-BY-4.0 | CPU (ggml), Python, PyTorch |
| tiny-voca (n4ze3m) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos TTS en hindi | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar con el modelo original tiny-voca de n4ze3m, del que este es un port al hindi; no se dispone de sus especificaciones detalladas ni de benchmarks de terceros para establecer una comparacion cuantitativa con alternativas como Coqui TTS, VITS o modelos TTS multilingues de mayor tamano.

## Limitaciones y advertencias

- Una unica voz femenina: no hay control de genero, edad ni identidad del hablante.
- Solo hindi: no soporta otros idiomas ni code-switching con ingles u otras lenguas, algo comun en el habla real en la India.
- Riesgo de alucinacion y errores de pronunciacion: al ser un modelo de 9,7 M de parametros, la calidad prosodica y la naturalidad seran inferiores a las de sistemas TTS neuronales grandes; pueden aparecer artefactos en palabras poco frecuentes o nombres propios.
- Estilos emocionales limitados a ocho categorias predefinidas; no hay control fino de intensidad emocional ni de velocidad.
- Sin datos publicados de evaluacion objetiva (MOS, MCD, WER), por lo que la calidad real en produccion no esta cuantificada.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar al autor y mantener el aviso de licencia.
- El modelo se entreno sobre ai4bharat/Rasa; pueden heredarse sesgos de dominio y de estilo del corpus (por ejemplo, registro formal o regiones concretas).
- No dispone de mecanismos de seguridad ni filtrado de contenido; la responsabilidad del uso recae en el integrador.
- El repositorio es reciente (creado en noviembre de 2026) y con pocas descargas (242) y likes (2), por lo que la comunidad y el soporte son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL10x/tiny-voca-hindi
- Modelo original tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4bharat/Rasa
- Muestras de audio: https://huggingface.co/RL10x/tiny-voca-hindi/resolve/main/samples/style_neutral.wav (y archivos equivalentes para el resto de estilos y pasajes)
