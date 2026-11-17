# emass-ai/env_sound_esc10

## Resumen

`env_sound_esc10` es un clasificador de sonidos ambientales de tipo CNN 2-D desarrollado por emass-ai, pensado para ejecutarse en el microcontrolador ECS-DoT a través del compilador ECS-Compiler de ECS-Studio. El modelo recibe un espectrograma log-mel de 5 segundos (50 tramas × 12 bandas mel) y clasifica el clip en una de diez categorías cotidianas: perro, gallo, lluvia, olas del mar, fuego crepitante, bebé llorando, estornudo, tic-tac de reloj, helicóptero y motosierra.

Con 40.578 parámetros y 160,2 KB en coma flotante, el modelo está diseñado para inferencia int8 en hardware TinyML. La versión compilada ocupa 68,0 KB de biblioteca (`libdla.a`) y ejecuta una inferencia en 6,01 ms en la placa ECS-DoT a 50 MHz, con 9 capas en la DLA (acelerador de deep learning) y 1 en la CPU.

Su relevancia es doble: por un lado demuestra el flujo completo de ECS-Compiler (calibración, cuantización, despliegue y verificación en placa), y por otro ofrece un clasificador de audio de huella mínima que puede servir de base para prototipos de detección de eventos sonoros en dispositivos con recursos muy limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 2-D (3 etapas Conv 3x3 + BN + ReLU + MaxPool 2x2, Flatten, Linear, Softmax) |
| Parámetros totales | 40.578 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 5 s de audio) |
| Tipos de cuantización | int8 (calibración con `esc10_cnn_train.npz`); pesos float32 originales en ONNX |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`esc10_cnn.onnx`); biblioteca compilada `libdla.a` para ECS-DoT |

## Arquitectura y entrenamiento

La red es una CNN 2-D secuencial: `Conv 3x3 1→16 + BN → ReLU → MaxPool 2x2 → Conv 3x3 16→24 + BN → ReLU → MaxPool 2x2 → Conv 3x3 24→64 + BN → ReLU → Flatten (64×12×3) → Linear 10 → Softmax`. La entrada es un tensor `[1, 1, 50, 12]` float32 que representa un espectrograma log-mel de 5 s: 50 tramas con salto de 100 ms y 12 bandas mel entre 50 y 8000 Hz. El preprocesado incluye remuestreo a 16 kHz mono, padding/recorte a 80.000 muestras, STFT con `n_fft=2048`, ventana Hann, potencia, banco mel de 12 bandas (librosa) y estandarización por banda con medias y desviaciones calculadas sobre los 400 clips de ESC-10.

El entrenamiento se realizó sobre el subconjunto ESC-10 del dataset ESC-50 (solo clips con `esc10 == True`), con validación cruzada de 5 folds. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de audio de este tamaño. La innovación principal no está en la arquitectura sino en el pipeline de despliegue: el modelo se compila con ECS-Compiler (motor 0.6.0, ECS-Studio 1.140.0), se cuantiza a int8 usando el conjunto de calibración y se verifica en la placa física ECS-DoT EVB con una huella de build concreta (`3f7df3b3`).

## Capacidades

- Clasificación de audio ambiental en 10 clases cerradas: `dog`, `rooster`, `rain`, `sea_waves`, `crackling_fire`, `crying_baby`, `sneezing`, `clock_tick`, `helicopter`, `chainsaw`.
- Entrada de audio de 5 segundos con preprocesado determinista (log-mel de 50×12) definido en la model card.
- Inferencia int8 de baja latencia (6,01 ms por llamada `dla_infer()` en ECS-DoT a 50 MHz).
- Ejecución en microcontrolador con 9 capas en DLA y 1 en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de visión; es exclusivamente un clasificador de audio.
- No incluye modo "thinking" ni capacidades generativas.

## Casos de uso

- Detección de eventos sonoros en dispositivos de bajo consumo: el modelo cabe en 68 KB de biblioteca compilada y consume 6 ms por inferencia, lo que permite monitorización continua en placas alimentadas por batería con un duty cycle muy bajo.
- Prototipado de wearables de accesibilidad: clasificación de sonidos como llanto de bebé, estornudo o tic-tac de reloj para alertas locales en dispositivos sin conectividad.
- Validación de pipelines TinyML: sirve como referencia reproducible para verificar que ECS-Compiler, la cuantización int8 y la placa ECS-DoT producen resultados consistentes con ONNX Runtime (cosine similarity ≥ 0,9999 en las muestras verificadas).
- Monitorización ambiental en domótica: detección de lluvia, olas del mar o fuego crepitante como señal de contexto para automatizaciones locales, sin enviar audio a la nube.
- Docencia e investigación en clasificación de audio: el modelo, con 40.578 parámetros y un preprocesado completamente especificado, es un caso de estudio manejable para comparar arquitecturas CNN en ESC-10.
- Detección de maquinaria o vehículos en entornos industriales o rurales: las clases `chainsaw` y `helicopter` permiten alertas acústicas locales en sensores desplegados en campo.
- Pruebas de regresión de firmware: el conjunto `esc10_cnn_test.npz` (200 muestras) y `sample_input.npz` (3 muestras reales) permiten comparar la salida de la placa con la referencia float en cada build.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión top-1 en ESC-10, fold 5 (80 clips) | 77,50 % (float, ONNX Runtime) |
| Precisión media en 5 folds oficiales | 80,0 % |
| Precisión en conjunto de evaluación de 200 muestras (int8 en placa) | 75,00 % |
| Precisión en conjunto de evaluación de 200 muestras (float) | 75,00 % |
| Concordancia placa vs. ONNX Runtime en 200 muestras | 197/200 |
| Tiempo de inferencia en ECS-DoT (int8, mediana de 204 ejecuciones) | 6,01 ms |
| Tamaño de biblioteca compilada (`libdla.a`) | 68,0 KB |
| Tamaño del modelo en float | 160,2 KB |
| Cosine similarity placa vs. referencia en muestras reales | ≥ 0,9999 |

Referencia comparativa citada en la model card: la CNN del paper de ESC-50 alcanza 80,5 % en ESC-10.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para microcontroladores, no para GPU.
- Hardware de referencia: placa ECS-DoT EVB con DLA integrada a 50 MHz.
- GPU recomendadas: no disponible; el modelo no está orientado a GPU.
- ¿Cabe en GPU consumer? Sí, cualquier GPU moderna puede ejecutar el ONNX float, pero no es el caso de uso previsto.
- Opciones de despliegue: ECS-Compiler (ECS-Studio 1.140.0 o superior) para compilar a `libdla.a`; ONNX Runtime para la versión float; llama.cpp, vLLM, Ollama y TGI no aplican.
- Latencia: 6,01 ms por inferencia en ECS-DoT (int8). Throughput no disponible.
- Tamaño en disco: 160,2 KB en float; 68,0 KB compilado para la placa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión ESC-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `env_sound_esc10` (emass-ai) | 40.578 | 5 s de audio (log-mel 50×12) | 77,50 % fold 5 / 80,0 % media 5 folds | Apache 2.0 | Hugging Face (ONNX + artefactos de compilación) |
| CNN del paper ESC-50 (Piczak, 2015) | no disponible | no disponible | 80,5 % en ESC-10 | no disponible | referencia académica |
| Clasificadores de audio genéricos tipo PANNs / YAMNet | millones de parámetros | ventanas de audio variables | no comparable directamente en ESC-10 | varía | TensorFlow Hub / PyTorch Hub |

La comparación directa con modelos de audio de gran escala no es significativa: `env_sound_esc10` está optimizado para huella mínima y despliegue en microcontrolador, no para precisión máxima.

## Limitaciones y advertencias

- El modelo se distribuye explícitamente "para evaluar y validar ECS-Compiler y el ECS-DoT"; no es un producto y no ha sido probado para ningún uso final concreto.
- Clases cerradas: solo reconoce las 10 categorías de ESC-10; cualquier otro sonido se forzará a una de ellas con la correspondiente softmax.
- Precisión moderada: 77,50 % en fold 5 y 80,0 % de media en 5 folds, con un conjunto de evaluación de 200 muestras que incluye 120 copias desplazadas temporalmente de los 80 clips del fold 5; no es un benchmark independiente.
- Sensible al preprocesado exacto (remuestreo a 16 kHz, STFT con `n_fft=2048`, `hop=1600`, 12 bandas mel, estandarización con medias y desviaciones concretas); cualquier desviación degrada la precisión.
- Entrada fija de 5 s; clips más cortos se rellenan con ceros y más largos se recortan, lo que puede perder eventos.
- No hay información sobre sesgos de género, edad, acento o entorno acústico; el dataset ESC-10 es pequeño (400 clips) y puede no representar condiciones de campo reales.
- Licencia del modelo Apache 2.0, pero los datos de entrenamiento (ESC-10) están bajo CC BY 3.0 Unported; el subconjunto ESC-50 completo (CC BY-NC) no se usa. Verificar atribución en despliegues comerciales.
- La verificación en placa se realizó con ECS-Studio 1.140.0 y la huella de build `3f7df3b3`; cambios en el compilador o en los ajustes por defecto pueden alterar los resultados.
- No hay información sobre latencia en otros hardware ni sobre consumo energético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emass-ai/env_sound_esc10
- Modelo ONNX: https://huggingface.co/emass-ai/env_sound_esc10/resolve/main/esc10_cnn.onnx?download=true
- Conjunto de calibración: https://huggingface.co/emass-ai/env_sound_esc10/resolve/main/esc10_cnn_train.npz?download=true
- Conjunto de evaluación: https://huggingface.co/emass-ai/env_sound_esc10/resolve/main/esc10_cnn_test.npz?download=true
- Muestras reales: https://huggingface.co/emass-ai/env_sound_esc10/resolve/main/sample_input.npz?download=true
- Licencia: https://huggingface.co/emass-ai/env_sound_esc10/resolve/main/LICENSE?download=true
- Dataset ESC-50 / ESC-10: https://github.com/karolpiczak/ESC-50
- Paper ESC (Piczak, 2015): https://doi.org/10.1145/2733373.2806390
- Licencia CC BY 3.0 Unported: https://creativecommons.org/licenses/by/3.0/
