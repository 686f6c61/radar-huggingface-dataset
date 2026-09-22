# hvsr-robotics/Matcha-TTS-PL

## Resumen

Matcha-TTS-PL es un sistema de sintesis de voz (TTS) en polaco desarrollado por hvsr-robotics para un robot conversacional humanoide. Se basa en Matcha-TTS, una arquitectura no autorregresiva de flow matching condicional con transporte optimo (OT-CFM) que genera espectrogramas en muy pocos pasos de integracion ODE, acoplada a un vocoder HiFi-GAN universal. El modelo acustico tiene 20,9 M de parametros y produce audio a 22,05 kHz.

El modelo se entrena desde cero partiendo de un warm start con `matcha_vctk.ckpt` y cubre ocho lectores objetivo (voices 0-7) mas 14 voces de la fase base (8-21) y cinco filas adicionales precompiladas (22-26) con mezclas e inflexiones concretas. Incorpora ocho tokens de estilo que controlan una entrega calmada, neutra o viva, ademas de un token especifico (3) para entonacion interrogativa ascendente, un ajuste poco habitual y relevante para robots que deben formular preguntas.

Su relevancia practica esta en la latencia: al exportarse como un unico grafo ONNX que integra modelo acustico y vocoder, con 2 o 4 pasos ODE, se consigue aproximadamente 0,4 s para una frase de 4 s en CPU de Mac, con un objetivo declarado de menos de 100 ms hasta el primer audio en GPU H100 o GB10. Esta pensado para despliegue en robotica conversacional en polaco, no como modelo general multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS: modelo acustico no autorregresivo con flow matching condicional de transporte optimo (OT-CFM) y decoder ODE, mas vocoder HiFi-GAN universal |
| Parametros totales | 20,9 M (modelo acustico); el vocoder HiFi-GAN suma una cantidad no especificada en la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; es un modelo TTS, la entrada es una secuencia de fonemas sin ventana de contexto declarada |
| Tipos de cuantizacion | no disponible; se distribuyen grafos ONNX sin variantes cuantizadas documentadas |
| Idiomas soportados | polaco (pl) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch Lightning checkpoint (`.ckpt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Matcha-TTS: un modelo acustico no autorregresivo que aprende una trayectoria de flow matching con transporte optimo entre ruido y mel-espectrograma, resuelta con muy pocos pasos de integracion (2 o 4 en las exportaciones ONNX disponibles). La salida se convierte a forma de onda con un vocoder HiFi-GAN universal (`g_02500000`). El entrenamiento parte de un warm start con `matcha_vctk.ckpt` (MIT) y se ejecuta en cuatro etapas: una base de 40.000 pasos sobre 22 hablantes con tokens de estilo derivados por k-means sobre estadisticas de prosodia; un fine-tuning de 12.000 pasos sobre los 8 lectores objetivo tras eliminar clips con desajuste texto/audio; una etapa de relabelado de interrogaciones descendentes como punto y sobremuestreo de preguntas ascendentes, introduciendo el token de estilo 3 para pregunta; y una etapa final de recorte de preguntas cortas a partir de las propias interrogaciones ascendentes de los lectores, verificadas a oido. El optimizador es Adam con tasa 1e-4 → 5e-5, batch 64, precision bf16, sobre una sola H100, con un total aproximado de 12 horas GPU.

Los datos de entrenamiento combinan audiolibros de Wolne Lektury (CC BY-SA 3.0 PL) filtrados por consistencia de calidad y tono, junto con habla conversacional de YODAS (CC BY 3.0) y AZON (CC BY-SA 4.0). Cada clip se caracteriza con estadisticas UTMOS/DNSMOS y de F0, y los ocho lectores objetivo se seleccionan por su baja dispersion de calidad y tono. La fonemizacion se realiza con espeak-ng en modo `pl` a traves de `polish_cleaners` (parche en `tts-pl-playground`), preservando la puntuacion: el signo de interrogacion es el que dirige la entonacion ascendente.

## Capacidades

- Sintesis de voz en polaco a 22,05 kHz con decodificacion no autorregresiva en 2 o 4 pasos ODE.
- Multihablante: 8 lectores objetivo (ids 0-7), 14 voces de la fase base (ids 8-21) y 5 filas precompiladas (ids 22-26, incluidas mezclas como mix2 y mix3).
- Mezcla de voces por promedio de embeddings de hablante (por ejemplo, `0.5*6+0.5*3`).
- Ocho tokens de estilo: neutro (ninguno / 5), calmado (0 y 6, con reduccion del rango de pitch de 1,2 a 1,4 semitonos), vivo (1, 4 y 7) y pregunta (3, contorno terminal ascendente).
- Entonacion interrogativa reparada para preguntas de si/no y eco; se advierte de que las preguntas con particula interrogativa (wh-questions) caen en polaco y no deben usar este token.
- Control de prosodia basico mediante `scales=[temperature, length_scale]` en las entradas ONNX.
- Salida integrada: los grafos ONNX incluyen modelo acustico y vocoder HiFi-GAN en un unico grafo.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente de sintesis de voz.

## Casos de uso

- Voz de robot conversacional humanoide: el modelo esta entrenado especificamente para este escenario, con latencia objetivo inferior a 100 ms hasta el primer audio en GPU y estilos calmado/vivo que permiten adaptar la entrega al contexto del dialogo.
- Preguntas interactivas formuladas por un agente: el token de estilo 3 genera contornos ascendentes correctos en preguntas de si/no y de eco, utiles para asistentes que piden confirmacion o aclaracion.
- Locucion de audiolibros y contenido largo en polaco: los ocho lectores objetivo tienen WER bajo (0,035-0,081 medido con Whisper large-v3) y velocidades de 9,5-11,9 caracteres por segundo, adecuadas para narracion.
- Sistemas de atencion al cliente en polaco: el soporte multihablante permite asignar voces distintas a marcas o departamentos, y la mezcla de embeddings permite crear voces intermedias sin reentrenar.
- Integracion en pipelines de robotica embebida: al exportarse como grafo ONNX unico con 2 o 4 pasos, puede ejecutarse con ONNX Runtime sobre CPU cuando no hay GPU disponible.
- Prototipado y evaluacion de prosodia: los tokens de estilo y las escalas de temperatura y longitud permiten experimentar con la entrega sin reentrenar el modelo.
- Generacion de avisos y notificaciones por voz en dispositivos: la huella reducida del modelo acustico (20,9 M de parametros) y la decodificacion en pocos pasos lo hacen viable en hardware modesto.
- Investigacion en TTS polaco: el repositorio incluye `RECIPE.md` con el procedimiento completo de entrenamiento y herramientas de CLI y playground para reproducir y comparar variantes.

## Benchmarks y rendimiento

Calidad medida con WER de Whisper large-v3, CER, UTMOS, rango de F0 en semitonos, caracteres por segundo y porcentaje de silencio, sobre 10 frases conversacionales de prueba por lector (modelo final).

| Voz | n | WER | CER | UTMOS | Rango F0 [st] | Car./s | Silencio % |
|---|---|---|---|---|---|---|---|
| Bartosz Bielenia | 10 | 0,035 | 0,013 | 3,34 | 1,85 | 10,6 | 18 |
| Katarzyna Faszczewska | 10 | 0,035 | 0,059 | 3,42 | 3,93 | 10,4 | 18 |
| Wojciech Masiak | 10 | 0,058 | 0,071 | 3,20 | 2,70 | 11,9 | 12 |
| Bartosz Głogowski | 10 | 0,047 | 0,061 | 3,36 | 2,77 | 11,1 | 12 |
| Jan Staszczyk | 10 | 0,070 | 0,071 | 3,08 | 3,22 | 10,6 | 13 |
| Marek Proszek | 10 | 0,035 | 0,059 | 3,19 | 2,50 | 10,9 | 14 |
| Piotr Kopa | 10 | 0,058 | 0,069 | 3,45 | 3,88 | 9,5 | 12 |
| Radosław Krzyżowski | 10 | 0,081 | 0,071 | 3,03 | 2,27 | 10,2 | 18 |

Modelo base de etapa 1 (antes del fine-tuning), mismas frases:

| Voz | n | WER | CER | UTMOS | Rango F0 [st] | Car./s | Silencio % |
|---|---|---|---|---|---|---|---|
| Bartosz Bielenia | 10 | 0,047 | 0,061 | 3,33 | 2,08 | 10,9 | 19 |
| Katarzyna Faszczewska | 10 | 0,093 | 0,078 | 3,37 | 2,96 | 10,9 | 16 |
| Wojciech Masiak | 10 | 0,047 | 0,061 | 3,30 | 2,63 | 12,4 | 13 |
| Bartosz Głogowski | 10 | 0,058 | 0,061 | 3,41 | 2,91 | 11,7 | 12 |
| Jan Staszczyk | 10 | 0,070 | 0,065 | 3,06 | 3,16 | 11,2 | 12 |
| Marek Proszek | 10 | 0,035 | 0,059 | 3,13 | 2,60 | 11,3 | 13 |
| Piotr Kopa | 10 | 0,058 | 0,063 | 3,45 | 2,61 | 10,3 | 11 |
| Radosław Krzyżowski | 10 | 0,058 | 0,065 | 2,97 | 3,29 | 10,9 | 17 |

Latencia declarada: aproximadamente 0,4 s para una frase de 4 s en CPU de Mac con ONNX y 4 pasos; objetivo de menos de 100 ms hasta el primer audio en GPU tipo H100 o GB10 con CUDA graphs. Control con Piper sobre los mismos lectores: UTMOS 2,7-3,3 y WER 7-22 %.

## Requisitos de hardware

- Huella de pesos: el modelo acustico tiene 20,9 M de parametros; sumando el vocoder HiFi-GAN, la huella en fp32 se situa en el orden de decenas a pocos cientos de MB, y en fp16 por debajo de los 100 MB (estimacion derivada del recuento de parametros, no una medicion publicada). El repositorio completo ocupa 0,9 GB, incluyendo checkpoint, varios grafos ONNX y muestras.
- VRAM para inferencia: no disponible como cifra medida; por tamano de modelo, cabe holgadamente en cualquier GPU consumer con 4 GB o mas de VRAM.
- GPU recomendadas: H100 y GB10-class para el objetivo de menos de 100 ms hasta el primer audio; cualquier GPU consumer moderna, como una RTX 4090, es sobradamente suficiente por capacidad de memoria.
- Inferencia en CPU: viable; se reporta aproximadamente 0,4 s para una frase de 4 s con ONNX y 4 pasos en CPU de Mac.
- Opciones de despliegue: ONNX Runtime con los grafos `export/matcha_v2_t2.onnx`, `matcha_v2_t4.onnx` y variantes `voices`; PyTorch/Lightning para el checkpoint y fine-tuning; el repositorio `tts-pl-playground` aporta CLI, interfaz de playground y el parche de Matcha-TTS necesario.
- No se documentan recetas para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Throughput: no disponible; solo se publica latencia por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto / arquitectura | Calidad publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Matcha-TTS-PL | 20,9 M (acustico) | polaco | TTS no autorregresivo, flow matching OT-CFM, 2-4 pasos ODE + HiFi-GAN | UTMOS 3,03-3,45; WER 0,035-0,081 (Whisper large-v3) | CC BY-SA 4.0 | HuggingFace, ONNX y checkpoint |
| Piper-TTS-PL (hvsr-robotics) | no disponible | polaco | TTS ligero basado en VITS | UTMOS 2,7-3,3; WER 7-22 % | no disponible | HuggingFace |
| Matcha-TTS original (warm start, VCTK) | no disponible | ingles | TTS no autorregresivo, flow matching OT-CFM | no disponible | MIT (pesos), VCTK CC BY 4.0 | release de Matcha-TTS |

## Limitaciones y advertencias

- Solo soporta polaco; no hay capacidades multilingues documentadas.
- Es un modelo de sintesis de voz, no un modelo de lenguaje: no genera texto, codigo ni razonamiento, y no soporta tool calling ni agentes.
- Riesgo de errores de pronunciacion en palabras no vistas o nombres propios; el WER medido llega hasta 0,081 en el lector con peor resultado.
- La entonacion interrogativa solo funciona para preguntas de si/no y de eco; aplicar el token 3 a preguntas con particula interrogativa produce una prosodia incorrecta en polaco.
- La fonemizacion depende de espeak-ng en modo `pl` y del parche `polish_cleaners`; es necesario preservar la puntuacion real en la entrada para que la entonacion funcione.
- Licencia CC BY-SA 4.0 con clausula ShareAlike que se propaga desde los datos de entrenamiento (Wolne Lektury CC BY-SA 3.0 PL, YODAS CC BY 3.0, AZON CC BY-SA 4.0) a los pesos: cualquier redistribucion o derivado debe mantenerse bajo la misma licencia y conservar `ATTRIBUTION.md`.
- El uso comercial es posible bajo CC BY-SA 4.0, pero obliga a atribucion completa y a compartir las obras derivadas bajo la misma licencia; conviene revisar `ATTRIBUTION.md` antes de produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre un conjunto reducido de lectores, la diversidad de voces y de acentos esta limitada a esos hablantes.
- No hay informacion sobre robustez ante ruido, texto con cifras, abreviaturas o dominios alejados del habla conversacional y de audiolibro.
- No se publican cifras de VRAM ni de throughput medidas, solo latencia por frase en CPU de Mac y un objetivo en GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hvsr-robotics/Matcha-TTS-PL
- Playground, CLI y parche de Matcha-TTS: https://github.com/machinekind/tts-pl-playground
- Modelo de control Piper en polaco: https://huggingface.co/hvsr-robotics/Piper-TTS-PL
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
