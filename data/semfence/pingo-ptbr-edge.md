# semfence/pingo-ptbr-edge

## Resumen

pingo-ptbr-edge es una edición del modelo de síntesis de voz pingo-ptbr, rediseñada por semfence para ejecutarse en microcontroladores, concretamente en el ESP32-S3. Se trata de un sistema text-to-speech completo en portugués de Brasil que combina un modelo acústico de 270.081 parámetros (cuantizado a 4 bits) con un vocoder FARGAN reducido de 109.733 parámetros (int8), sumando un total de 379.814 parámetros. El objetivo es llevar síntesis de voz neuronal a hardware embebido sin PyTorch ni dependencias de red, en C puro con solo libm.

La relevancia del proyecto reside en su propuesta de TinyML aplicado a voz: frente al pingo-ptbr original (1.086.678 parámetros, con un vocoder de 817 mil), esta edición reduce el vocoder 7,4 veces y baja su coste computacional de aproximadamente 299 MMAC/s a 39,6 MMAC/s. El firmware compila para esp32s3 y el mismo código produce la misma salida que la referencia en un Mac, aunque el autor declara explícitamente que nunca se ha ejecutado en una placa física.

El modelo se distribuye bajo licencia CC-BY-4.0, soporta únicamente portugués (pt) y se publica con datasets sintéticos propios. Es un caso de estudio interesante para quienes exploran TTS en el borde, pero debe tratarse como un artefacto experimental con métricas de despliegue pendientes de validación en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS en dos etapas: modelo acústico (transformer/encoder-decoder, no detallado) + vocoder FARGAN reducido (xxs) |
| Parametros totales | 379.814 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens sin PSRAM; 256 tokens con PSRAM (límite del encoder) |
| Tipos de cuantizacion | Acústico: 4 bits (simétrica, por fila, −7..7); vocoder: int8; también entrenadas variantes s, xs y xxs |
| Idiomas soportados | Portugués de Brasil (pt-BR) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pesos en C puro (no safetensors ni GGUF); pesos del acústico en 4 bits (131 KiB), vocoder int8 (107 KiB) |

## Arquitectura y entrenamiento

El sistema sigue un esquema clásico de TTS neuronal en dos etapas. El modelo acústico (270.081 parámetros) transforma texto en características acústicas y se cuantiza post-entrenamiento a 4 bits con cuantización simétrica por fila, dos pesos por byte; solo se cuantizan los pesos 2D, mientras que los vectores permanecen en float. El vocoder es un FARGAN con capas estrechas (C=24, d1=32, d2=48, F=48, H1=48, H2=40, H3=40, S=40) entrenado desde cero con la receta de Opus: pérdida STFT multirresolución más 0,03 × pérdida coseno, AdamW y cuantización suave de 8 bits durante el entrenamiento. Se entrenó sobre 500.000 secuencias de habla sintética (el doble que la variante xs), 45 épocas (mejor resultado en la 38), en una RTX 3090 alquilada durante 133 minutos (aproximadamente 0,5 USD).

El runtime es C puro con activaciones int8 y matemática racional, sin PyTorch ni red. Los pesos del vocoder residen en SRAM interna (se releen 400 veces por segundo) y los del acústico en flash. El encoder usa memoria proporcional a la frase (23 KB para 30 tokens). El autor advierte que el xxs se entrenó con el doble de datos que el xs, por lo que su mejor pérdida espectral (0,2656 frente a 0,2814) no demuestra superioridad arquitectónica, y que la pérdida espectral no equivale a calidad percibida: la elección del xxs fue por escucha del autor.

## Capacidades

- Síntesis de voz text-to-speech en portugués de Brasil, con salida de audio generada por código C.
- Generación de audio sin dependencia de red ni de frameworks de deep learning en el dispositivo.
- Dos variantes de vocoder entrenadas (xs y xxs) y comparativas de cuantización del acústico en float, 8, 6, 5 y 4 bits.
- Ejecución en ESP32-S3 (firmware compilado) y en cualquier CPU con compilador C.
- Ajuste de velocidad del habla para compensar el acortamiento de duraciones provocado por la cuantización a 4 bits (aproximadamente 8% más cortas).
- Soporte de PSRAM opcional que eleva el límite de tokens de 64 a 256.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo thinking: es exclusivamente un sintetizador de voz.

## Casos de uso

- Dispositivos IoT con aviso por voz: un ESP32-S3 puede anunciar estados, alarmas o mensajes de inicio ("Sistema iniciado. Pingo pronto para falar") sin conexión a internet, gracias al firmware de 443-448 KB y a los pesos embebidos.
- Domótica y electrodomésticos con interfaz hablada: el modelo cabe en la RAM interna fija (148-151 KB de 342 KB) y permite respuestas verbales en portugués sin depender de la nube.
- Juguetes y dispositivos educativos: la licencia CC-BY-4.0 permite uso comercial con atribución, y el coste computacional reducido (39,6 MMAC/s en el vocoder) lo hace viable en hardware de bajo coste.
- Sistemas de accesibilidad de bajo consumo: lectores de texto para personas con discapacidad visual en dispositivos portátiles sin conectividad.
- Prototipado e investigación en TinyML de voz: el repositorio incluye variantes intermedias (s, xs, xxs) y scripts de entrenamiento (`training/sizes.py`) que sirven como banco de pruebas para estudiar el compromiso entre tamaño, cuantización y calidad.
- Señalización y anuncios en entornos industriales o de transporte: mensajes cortos y repetitivos generados localmente, donde la latencia de red no es aceptable.
- Evaluación comparativa de vocoders FARGAN en el borde: las muestras de `samples/vocoder_xs_vs_xxs/` y `samples/acoustic_bits/` permiten analizar el efecto de la cuantización antes de desplegar.

## Benchmarks y rendimiento

| Metrica | s | xxs (float) | xxs (int8 simulado) | xs |
|---|---:|---:|---:|---:|
| Parámetros | 262.000 | 110.000 | 110.000 | 160.000 |
| MMAC/s | 90 | 38,7 | 38,7 | 56 |
| val_spect (menor es mejor) | 0,2487 | 0,2656 | 0,2661 | 0,2814 |

Otras métricas medidas por el autor:
- El acústico en C coincide con la referencia MLX con error rms relativo de 0,0000% en 30 tokens y 229 cuadros.
- El vocoder en C (float) coincide con PyTorch con error de 1e-6; la versión int8 diverge muestra a muestra por ser recursiva y se validó por rms (4577 frente a 4604 del xs) y por escucha.
- La misma lógica del firmware compilada en Mac con un shim de las APIs del ESP produce 229 cuadros y rms 4203.
- Tamaño de firmware: 443 KB sin PSRAM y 448 KB con PSRAM; RAM interna fija de 148 KB y 151 KB respectivamente (de 342 KB).
- No hay medición de factor de tiempo real en ESP32-S3, ni de uso real de heap, ni de WER de esta edición. El WER de pingo-ptbr (0,86% / 0,81% en MiniMax pt) no es aplicable porque el vocoder y la cuantización son distintos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el destino (microcontrolador); en Mac o PC el modelo es tan pequeño que cabe en RAM convencional.
- Hardware objetivo: ESP32-S3 a 240 MHz, con 342 KB de RAM interna; PSRAM opcional para frases largas (hasta 256 tokens).
- Firmware: 443 KB sin PSRAM y 448 KB con PSRAM; RAM interna fija de 148-151 KB; pico de RAM de trabajo estimado en unos 50 KB (no medido en placa).
- GPU recomendadas: no aplica para inferencia; el entrenamiento del vocoder xxs se hizo en una RTX 3090 (133 minutos).
- Cabe en GPU consumer: sí, con enorme holgura, aunque el objetivo es CPU y microcontrolador.
- Opciones de despliegue: firmware ESP-IDF 6.x para esp32s3; código C portable con solo libm; no hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: el autor estima que el S3 podría quedar por debajo de 1× tiempo real al principio (aproximadamente 49 MMAC/s de trabajo por segundo de audio frente a un S3 a 240 MHz con bucles escalares); no hay medición real. Próximos pasos propuestos: kernel int8 con SIMD del S3 vía ESP-NN, reparto de acústico y vocoder en dos núcleos, y esparsificación con reentrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| pingo-ptbr-edge | 379.814 | 64/256 tokens | CC-BY-4.0 | Hugging Face | C puro, objetivo ESP32-S3, sin ejecución en placa |
| pingo-ptbr | 1.086.678 | no disponible | no disponible en la información | Hugging Face | Runtime MLX/ONNX, vocoder FARGAN de 816.597 parámetros, WER 0,86% / 0,81% |
| Variantes s y xs de pingo | 262.000 / 160.000 | no disponible | CC-BY-4.0 (mismo repo) | Hugging Face | Vocoders intermedios, 90 y 56 MMAC/s |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos TTS embebidos en la información proporcionada, por lo que la comparación con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- El firmware nunca se ha ejecutado en una placa ESP32-S3: no hay medida de tiempo real, de uso real de RAM ni de WER de esta edición.
- La cuantización a 4 bits acorta las duraciones previstas aproximadamente un 8% (229 frente a 248 cuadros en la frase de prueba), lo que acelera el habla; el parámetro de velocidad lo compensa parcialmente.
- La calidad de voz es de tipo "llamada telefónica", algo metálica, según la escucha del propio autor (una sola persona, sin test con oyentes).
- El vocoder int8 diverge muestra a muestra de la implementación PyTorch por su naturaleza recursiva; solo se validó por rms y escucha.
- Solo soporta portugués de Brasil; no hay capacidades multilingües.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero la calidad de pronunciación y prosodia no está evaluada con métricas objetivas de inteligibilidad en esta edición.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones de los datasets sintéticos empleados.
- El límite de 64 tokens sin PSRAM restringe frases largas; con PSRAM sube a 256 tokens.
- El autor advierte que la comparación entre variantes está sesgada por diferencias en volumen de datos de entrenamiento, y que la pérdida espectral no mide calidad percibida.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semfence/pingo-ptbr-edge
- Modelo original pingo-ptbr: https://huggingface.co/semfence/pingo-ptbr
- Dataset de habla sintética: https://huggingface.co/datasets/semfence/ptbr-synthetic-speech
- Dataset de frases: https://huggingface.co/datasets/semfence/ptbr-sentences
- Muestras de audio: https://huggingface.co/semfence/pingo-ptbr-edge/resolve/main/samples/ola_semfence_edge.wav y https://huggingface.co/semfence/pingo-ptbr-edge/resolve/main/samples/startup_edge.wav
- Documentación de benchmarks del firmware: `esp32/pingo_bench/README.md` dentro del repositorio
- Scripts de entrenamiento de variantes: `training/sizes.py` dentro del repositorio
