# mattmireles/magenta-realtime-2-iphone

## Resumen

magenta-realtime-2-iphone es un port a Core ML de google/magenta-realtime-2 (variante `mrt2_small`, 230 M de parámetros), un modelo de generación musical texto-a-audio en streaming que produce audio estéreo a 48 kHz en fotogramas de 40 ms. Lo publica mattmireles, no Google, y su aportación no es reentrenar el modelo sino trocearlo en tres grafos Core ML y colocar cada uno en el motor del SoC que le corresponde: el transformer temporal y el decodificador del códec en el Neural Engine, y el transformer de profundidad en la CPU. El resultado es inferencia de audio generativo completamente en dispositivo, sin intervención de la GPU.

La relevancia está en la demostración de ingeniería: 10 minutos de generación musical continua en un iPhone 15 Pro Max (A17 Pro) a 1,03× tiempo real, con cero underruns y sin trabajo de GPU en la app. El autor documenta explícitamente los límites de esa cifra: el sistema trabaja con buffer (hasta unos 21 s en cola), reinicia el estado temporal cada 10 s para evitar que la señal sature, y no alcanza tiempo real en un iPhone 12 Pro (A14), donde se queda en 0,90× y agota el audio acumulado a los 294 s.

El repositorio (1,3 GB) incluye los paquetes `.mlpackage` en FP16 y FP32, la tabla de codebooks RVQ, un vector de condicionamiento certificado, recibos de exportación y arneses de validación. Es material para desarrolladores iOS que quieran integrar generación musical local, no un modelo listo para usar desde Python ni un checkpoint entrenado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer temporal (paso de un fotograma, sin estado en el grafo) + transformer de profundidad con rollout de 12 niveles RVQ + decodificador de códec SpectroStream (RVQ + iSTFT con overlap-add); exportada como tres grafos `mlprogram` de Core ML |
| Parámetros totales | 230 M (`mrt2_small`, heredados del modelo base google/magenta-realtime-2) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; modelo de streaming con estado: 48 cachés K/V, anillo de 41 fotogramas de 40 ms gestionado por el host y reinicio del estado temporal cada 10 s |
| Tipos de cuantización | FP16 (transformer temporal, profundidad y decodificador en A17 Pro) y FP32 (rollout de profundidad de referencia y decodificador para A14); no se publican cuantizaciones de 4 u 8 bits |
| Idiomas soportados | no disponible (el condicionamiento por texto se compila una vez en un Mac; no se documentan idiomas del prompt) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `.mlpackage` (`mlprogram`, Core ML) + `SpectroStreamRVQCodebooks.f32.bin` (tabla f32 de 12×1024×256) |
| Modelo base | google/magenta-realtime-2 (`mrt2_small`) |
| Frecuencia de muestreo de salida | 48 kHz, estéreo |
| Duración de fotograma | 40 ms |
| Despliegue mínimo | iOS 18 / macOS 15 |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo original es un generador musical autorregresivo por fotogramas: un transformer temporal predice el siguiente fotograma de 40 ms a partir de una condición de texto compilada previamente y de 48 cachés de clave/valor; un transformer de profundidad muestrea después los 12 niveles de un libro de códigos RVQ, y un decodificador SpectroStream (también RVQ) reconstruye la forma de onda mediante iSTFT y overlap-add sobre ventanas de 25 fotogramas procesadas cada 12. El texto de condicionamiento se compila una vez en un Mac y se inyecta como vector; el classifier-free guidance queda fijado en el momento del condicionamiento.

El trabajo de port no incluye entrenamiento nuevo: es una conversión y una política de reparto de cómputo. Tres hallazgos la justifican según el autor. Primero, el límite de compilación en el ANE no es la atención sino la mutación de estado dentro del grafo: los grafos multi-fotograma con `ct.StateType` fallan `ANECCompile()` con error −14, mientras que la misma matemática como paso de un fotograma sin estado, con las cachés como entradas y salidas ordinarias, compila por completo al Neural Engine. Segundo, que una salida sea finita no implica que sea correcta: las activaciones del decodificador superan el rango de FP16, de modo que sin un reescalado exacto a mitad de red el FP16 devuelve NaN en CPU y GPU y unos 0 dB de SNR en el ANE; con el reescalado funciona en el A17 Pro y sigue siendo incorrecto en el ANE del A14, por lo que este último usa el decodificador FP32. Tercero, el suelo de latencia lo marcan los bytes de pesos: cada recorrido cuesta como mínimo bytes de pesos ÷ ancho de banda de DRAM, y el beneficio vino de reducir a la mitad los bytes con FP16.

La entropía de muestreo (RNG, ruido de Gumbel) y el gather de codebooks se mantienen en el host, de forma que las semillas son reproducibles y la paridad a nivel de token es verificable. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de música en streaming condicionada por texto, en estéreo y a 48 kHz, con pasos de 40 ms.
- Ejecución completamente en dispositivo: transformer temporal y decodificador en el Neural Engine, transformer de profundidad en la CPU, sin trabajo de GPU en la app.
- Mantenimiento de estado conversacional/contextual a largo plazo mediante 48 cachés K/V y un anillo de 41 fotogramas en el host.
- Rollout completo de los 12 niveles RVQ en una sola predicción por fotograma, con ruido de Gumbel generado en el host (muestreo reproducible por semilla).
- Decodificación de audio con ventanas solapadas (25 fotogramas cada 12) para continuidad entre fotogramas.
- No se documentan capacidad de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidades multilingües: no disponibles; el prompt de texto se compila aparte y no se especifican idiomas.

## Casos de uso

- Instrumento generativo dentro de una app iOS: el modelo se integra como tres grafos Core ML y produce accompaniment musical en tiempo real mientras el usuario toca, sin enviar audio a la nube y sin cargar la GPU del dispositivo.
- Instalaciones y performance en directo: con 1,03× tiempo real en A17 Pro y cero underruns en una tirada de 10 minutos, sirve para piezas generativas de duración media en espacios expositivos o escenarios con iPhone o iPad como motor de audio.
- Prototipado de ideas musicales sin servidor: un estudio puede generar bocetos de 10 minutos condicionados por texto y escucharlos en el propio dispositivo, evitando costes de inferencia en la nube durante la fase exploratoria.
- Investigación en inferencia en el borde: los paquetes incluyen recibos de exportación, fixtures de referencia MLX y arneses de validación, por lo que el repo funciona como banco de pruebas para estudiar reparto ANE/CPU, precisión FP16 y latencia por etapa.
- Acompañamiento adaptativo en juegos y experiencias interactivas: el estado temporal y el buffer de ~21 s permiten variar la generación según la acción del usuario sin cortes audibles, siempre que la app gestione el reinicio de estado cada 10 s.
- Audio local con requisitos de privacidad: aplicaciones de bienestar, meditación o sonido ambiental que no pueden enviar audio ni prompts a un servicio externo pueden ejecutar el modelo íntegramente en el terminal.
- Docencia sobre compilación en Core ML: el caso documenta de forma explícita los fallos de `ANECCompile()`, el problema de rango de FP16 y el suelo de ancho de banda de DRAM, lo que lo convierte en material didáctico para cursos de optimización en Apple Silicon.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| Factor de tiempo real | 1,03× | iPhone 15 Pro Max (A17 Pro), ejecución de 610 s, 10 minutos sin underruns |
| Latencia del transformer temporal | 11,2 ms por fotograma de 40 ms | ANE, FP16, p50 normalizado por iteración sobre 610 s |
| Latencia del transformer de profundidad | 9,8 ms por fotograma de 40 ms | CPU, FP16 |
| Latencia del decodificador | 2,3 ms por fotograma de 40 ms | ANE, FP16 con reescalado, A17 Pro |
| Suma de las tres etapas | 23,3 ms por fotograma de 40 ms | No incluye el trabajo del host (gather RVQ, iSTFT, overlap-add); el 1,03× declarado es end-to-end |
| Factor de tiempo real en A14 | 0,90× | iPhone 12 Pro; buffer agotado a los 294 s |
| SNR del decodificador FP16 frente a FP32 | 38,8 dB | Ventana reservada, ANE del A17 Pro |
| SNR del decodificador FP32 frente a la referencia MLX | 118,85 dB | CPU |
| Paridad del rollout de profundidad FP32 | 0 discrepancias en 900 muestras | Referencia token-exacta frente al sampler de referencia |
| Ventanas fuera de rango FP16 | 1 de 600 | Escaneo en host de las activaciones del decodificador |
| Compilación en ANE del grafo temporal | 10 de 10 arranques en frío correctos en ambos teléfonos, cuota de coste ANE 1,000 | A17 Pro y A14 |

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible; no son aplicables a un modelo text-to-audio.

## Requisitos de hardware

- VRAM/memoria: no disponible; la model card no publica huella de memoria por grafo ni consumo de RAM en el dispositivo.
- Configuración validada para tiempo real: iPhone 15 Pro Max con A17 Pro (transformer temporal y decodificador en ANE, profundidad en CPU).
- Configuración no viable para streaming sostenido: iPhone 12 Pro con A14 (0,90× tiempo real, agota el buffer a los 294 s); en este dispositivo debe usarse el decodificador FP32 en CPU.
- GPU: el diseño evita por completo el trabajo en GPU; no se documenta uso de Metal ni de GPU de escritorio.
- Almacenamiento: 1,3 GB de repositorio; por paquete, 366 MB (temporal), 74 MB (profundidad FP16), 148 MB (profundidad FP32), 68 MB (decodificador FP16), 136 MB (decodificador FP32) y 12,6 MB (codebooks).
- Opciones de despliegue: Core ML con `mlprogram` sobre iOS 18 / macOS 15, más los exportadores y el arnés de validación del repositorio de GitHub. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de texto.
- Latencia y throughput: 23,3 ms de cómputo neuronal por fotograma de 40 ms en A17 Pro; factor end-to-end de 1,03×. No se documentan cifras de throttling térmico ni de rendimiento sostenido más allá de los 610 s medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Estado/ventana | Precisión | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mattmireles/magenta-realtime-2-iphone | 230 M | 48 cachés K/V, anillo de 41 fotogramas, reset cada 10 s | FP16 y FP32 | Core ML, iOS 18 / macOS 15 | cc-by-4.0 | HuggingFace, 10 descargas, 4 likes |
| google/magenta-realtime-2 (`mrt2_small`) | 230 M | no disponible en detalle; referencia MLX ejecutada por el autor | referencia MLX (FP32) | Mac/GPU con MLX | no disponible en la información proporcionada | HuggingFace |
| Otras alternativas de generación musical on-device | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna al repositorio: el decodificador FP16 (68 MB, ANE en A17 Pro) ofrece 38,8 dB de SNR frente al FP32, mientras que el decodificador FP32 (136 MB, CPU) alcanza 118,85 dB frente a la referencia MLX pero no cabe en el presupuesto de tiempo real del A14. El rollout de profundidad FP16 (74 MB) mantiene el reparto en CPU con la mitad de bytes que su equivalente FP32 (148 MB).

## Limitaciones y advertencias

- No es un modelo en vivo: el sistema trabaja con buffer de hasta unos 21 s y reinicia el estado temporal cada 10 s. Sin ese reinicio, la propia referencia MLX emite muestras a escala completa o por encima en menos de 600 s, lo que es un fallo audible potencial.
- El decodificador FP16 es aproximado: 38,8 dB frente al FP32 y erróneo en ventanas raras cuyas activaciones siguen excediendo el rango FP16 tras el reescalado (1 de 600 según el escaneo en host).
- El decodificador FP16 no debe usarse en el ANE del A14; en ese chip hay que recurrir al FP32 en CPU y aun así no se alcanza tiempo real (0,90×).
- Dependencia fuerte del hardware: las cifras de 1,03× están medidas únicamente en A17 Pro. No se documentan resultados en A16, M-series ni en simuladores.
- Sesgos: no se documenta ningún análisis de sesgo musical, cultural o de estilo en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de NLP, pero sí existe riesgo de artefactos, saturación y degradación de la señal en ejecuciones largas sin reinicio de estado.
- Idiomas y prompt de texto: no disponibles; el condicionamiento se compila en un Mac y no se especifica qué idiomas ni qué vocabulario acepta.
- Licencia: CC-BY-4.0 exige atribución, también para uso comercial; además debe verificarse la licencia del modelo base google/magenta-realtime-2, que no se detalla en la información proporcionada.
- Madurez: 10 descargas y 4 likes en el momento de la consulta; es un artefacto de investigación con validación propia del autor, no un componente con soporte.
- El código del host (gather RVQ, iSTFT, overlap-add, gestión del anillo de fotogramas) no está en el repositorio de HuggingFace, sino en GitHub; sin él los `.mlpackage` no constituyen un pipeline funcional.
- Fechas del repositorio (creado en junio de 2026, actualizado en octubre de 2026) poco habituales; conviene verificar la procedencia y el estado real del proyecto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattmireles/magenta-realtime-2-iphone
- Modelo base: https://huggingface.co/google/magenta-realtime-2
- Repositorio con exportadores, arnés de validación y documentación de método: https://github.com/mattmireles/magenta-realtime-2-iphone
- Paper "Surgical Inference" (conversión y hallazgos de admisión, sección 5): enlazado desde el repositorio de GitHub, sin URL directa disponible
- Paper "Throughput Is Not Liveness" (estudio de runtime end-to-end): enlazado desde el repositorio de GitHub, sin URL directa disponible
