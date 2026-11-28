# Scicom-intl/pitchy

## Resumen

Pitchy es un estimador de frecuencia fundamental (f0) desarrollado por Scicom-intl, diseñado especificamente para las condiciones acusticas reales que afrontan los sistemas de voz en produccion: lineas telefonicas con codecs de banda estrecha, salas con reverberacion y ruido de fondo. El modelo entrega un valor de f0 cada 10 ms a partir de audio a 16 kHz, junto con una probabilidad de sonoridad (voicing) por trama, y se distribuye como un unico grafo ONNX que se ejecuta en un solo hilo de CPU.

La relevancia del modelo radica en su relacion entre precision y coste computacional. Con solo 3,78 millones de parametros y un peso de 19,6 MB en disco, procesa un segundo de audio en 0,010 s de un hilo de CPU. Frente a los mejores rastreadores publicados (RMVPE, SwiftF0, FCNF0++, RAPT, YAAPT), reduce el error de trama de f0 de forma notable en condiciones degradadas: 4,17 % en el conjunto de prueba de PTDB-TUG frente al 9,61 % de RMVPE, y 5,05 % en la condicion combinada de sala, ruido y linea telefonica frente al 14,26 % de SwiftF0.

El repositorio incluye cuatro variantes derivadas de la misma red: Pitchy (voz), Pitchy-Sing (canto e instrumentos), Pitchy-Mix (voz y musica) y Pitchy-Live (audio en tiempo real con latencia de 82 ms). La licencia es CC BY-NC 4.0, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal (tipo no especificado en la model card) exportada a ONNX; una sola red para las cuatro variantes |
| Parametros totales | 3,78 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa audio a 16 kHz con tramas de 10 ms (ventana completa en modo clip, 82 ms de futuro en modo streaming) |
| Tipos de cuantizacion | no disponible (se distribuye en float32 ONNX y safetensors) |
| Idiomas soportados | en (segun la model card; la tarea es independiente del idioma en la practica) |
| Licencia | CC BY-NC 4.0 |
| Formato de pesos | ONNX (`pitchy.onnx`, `live/pitchy_stream.onnx`) y safetensors (`pitchy.safetensors`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red (tipo de capas, atencion, convoluciones o estado recurrente), solo que las cuatro variantes comparten un unico diseno de red y que cada carpeta contiene su grafo ONNX, sus pesos safetensors, una comprobacion de paridad y un `config.json`. La salida es una saliencia sobre la rejilla de CREPE de 360 bins de 20 cents desde 32,70 Hz; el pico de esa saliencia actua como probabilidad de sonoridad, y el f0 se decodifica como la media ponderada de los 9 bins alrededor del pico. El umbral de sonoridad se selecciona por variante sobre los hablantes de desarrollo de PTDB-TUG.

No se especifican en la informacion disponible el numero de tokens de audio de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a una tarea de regresion de f0). La model card menciona un articulo tecnico (*Pitchy*, enviado a arXiv) cuyo enlace se publicara cuando este listado. La innovacion destacable es la variante Pitchy-Live: un grafo con estado (`live/pitchy_stream.onnx`) que acepta fragmentos de longitud arbitraria y devuelve el estado actualizado, permitiendo inferencia en streaming con 82 ms de audio de futuro respecto al centro de cada trama.

## Capacidades

- Estimacion de f0 cada 10 ms a partir de audio mono a 16 kHz, con salida de frecuencia en Hz (0 donde no hay voz), indicador de sonoridad y confianza.
- Saliencia sobre 360 bins de 20 cents (rango desde 32,70 Hz), lo que permite decodificaciones alternativas del contorno de pitch.
- Modo clip (ventana completa) y modo streaming con estado (Pitchy-Live), con latencia de 82 ms por trama.
- Cuatro especializaciones: voz (Pitchy), canto e instrumentos (Pitchy-Sing), voz y musica combinadas (Pitchy-Mix) y audio en vivo (Pitchy-Live).
- Robustez especifica ante codecs telefonicos de 8 kHz (G.711 y similares), ruido real y reverberacion de sala.
- Inferencia en CPU con un solo hilo; dependencias minimas (numpy y onnxruntime en Python, torch y safetensors para PyTorch).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo de audio especializado, no un LLM.

## Casos de uso

- Analisis de llamadas telefonicas: el modelo mantiene un error de trama de f0 del 4,13 % sobre codecs de 8 kHz en PTDB-TUG, frente al 6,98 % de RAPT, lo que lo hace adecuado para extraer prosodia de grabaciones de atencion al cliente o centros de llamadas.
- Filtrado y control de TTS: la estimacion de f0 por trama permite condicionar o corregir la prosodia de sistemas de sintesis de voz, con un coste de 0,010 s de CPU por segundo de audio.
- Deteccion de actividad vocal y sonoridad: la probabilidad de voicing por trama sirve como VAD de bajo coste en pipelines de diarizacion o segmentacion.
- Analisis de canto y practica musical: Pitchy-Sing reduce el error en MDB-stem-synth a 17,99 % frente al 27,21 % de Pitchy, lo que lo hace util para seguimiento de afinacion en herramientas de entrenamiento vocal.
- Monitorizacion en tiempo real: Pitchy-Live, con 82 ms de latencia, permite visualizar el contorno de pitch durante una llamada o una clase de canto en directo.
- Investigacion en prosodia y fonetica: la saliencia completa de 360 bins permite recalcular contornos o aplicar decodificadores propios sin reejecutar la red.
- Preprocesado de datasets de voz: la velocidad en CPU (un hilo, sin GPU) permite anotar grandes corpus de audio de forma economica.

## Benchmarks y rendimiento

Error de trama de f0 (FFE, %; menor es mejor) sobre los conjuntos de prueba:

| Conjunto de prueba | Pitchy | Pitchy-Sing | Pitchy-Mix | Pitchy-Live | Mejor publicado |
|---|---:|---:|---:|---:|---:|
| PTDB-TUG, hablantes de prueba | **4,17** | 4,24 | **4,17** | 4,79 | 9,61 (RMVPE) |
| Keele | **8,79** | 9,15 | 8,80 | 9,67 | 14,86 (RMVPE) |
| FDA | **5,20** | 5,21 | 5,21 | 6,13 | 9,32 (RMVPE) |
| MDB-stem-synth (musica) | 27,21 | 17,99 | 19,62 | 35,17 | **13,00** (SwiftF0) |

Desglose de Pitchy por condicion en PTDB-TUG (FFE, GPE y VDE en %):

| Condicion | FFE Pitchy | GPE | VDE | Mejor publicado | FFE | GPE | VDE |
|---|---:|---:|---:|---|---:|---:|---:|
| Limpio | 3,37 | 1,38 | 3,06 | FCNF0++ | **3,04** | 1,49 | 2,70 |
| Ruido real, 5 y 0 dB | **4,80** | 1,88 | 4,40 | RMVPE | 12,78 | 1,51 | 12,49 |
| Salas reales | **4,66** | 2,08 | 4,22 | RMVPE | 8,92 | 1,33 | 8,69 |
| Linea telefonica (codecs 8 kHz) | **4,13** | 1,63 | 3,77 | RAPT | 6,98 | 7,45 | 5,38 |
| Sala, ruido y linea | **5,05** | 2,27 | 4,58 | SwiftF0 | 14,26 | 2,07 | 13,99 |
| Todas las condiciones | **4,17** | 1,72 | 3,80 | RMVPE | 9,61 | 1,47 | 9,34 |

Nota metodologica de la model card: todos los umbrales y retardos de trama se eligieron sobre los hablantes de desarrollo de PTDB-TUG; el mejor publicado es el minimo de 14 rastreadores, cuatro entrenados en PTDB-TUG y dos (SwiftF0, FCNF0++) en MDB-stem-synth. Pitchy-Live escucha 82 ms de audio mas alla del centro de cada trama, mientras que los demas y todos los rastreadores publicados ven el clip completo.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU (un solo hilo).
- GPU recomendadas: no aplica; cualquier GPU puede ejecutar el grafo ONNX, pero no aporta ventaja frente a la CPU para este tamano.
- Consumer GPU: irrelevante; cabe en cualquier CPU moderna. El peso es de 19,6 MB.
- Despliegue: onnxruntime (via del paquete `pitchy`), PyTorch con safetensors, o cualquier runtime compatible con ONNX. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Rendimiento: 0,010 s de un hilo de CPU por segundo de audio (modo clip). Latencia en streaming: 82 ms por trama en Pitchy-Live.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | FFE PTDB-TUG (%) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Pitchy | 3,78 M | ONNX, CPU, streaming | 4,17 | CC BY-NC 4.0 | Hugging Face |
| RMVPE | no disponible | Rastreador de referencia en voz | 9,61 | no disponible | Publicado |
| SwiftF0 | no disponible | Rastreador ligero | 14,26 (condicion combinada) | no disponible | Publicado |
| FCNF0++ | no disponible | Rastreador neuronal | 3,04 (solo limpio) | no disponible | Publicado |

Pitchy supera a RMVPE y SwiftF0 en todos los conjuntos de voz evaluados, pero queda por detras de SwiftF0 en musica (27,21 % frente a 13,00 % en Pitchy estandar; Pitchy-Sing mejora a 17,99 % pero sigue por encima). En condiciones limpias, FCNF0++ obtiene un FFE ligeramente inferior (3,04 % frente a 3,37 %).

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial sin autorizacion del titular.
- Rendimiento inferior en musica: Pitchy estandar obtiene 27,21 % de FFE en MDB-stem-synth, muy por encima de SwiftF0 (13,00 %); para musica debe usarse Pitchy-Sing o Pitchy-Mix.
- En audio limpio no es el mejor de su clase: FCNF0++ logra 3,04 % frente a 3,37 % de Pitchy en PTDB-TUG limpio.
- Pitchy-Live tiene mayor error que las variantes de clip (4,79 % frente a 4,17 % en PTDB-TUG) por su ventana limitada de 82 ms.
- Las variantes Sing y Mix asignan pitch a tonos de ocupado, timbre y teclado de linea telefonica; para llamadas debe usarse Pitchy o Pitchy-Live.
- El umbral de sonoridad esta ajustado sobre PTDB-TUG; en dominios muy distintos puede requerir recalibracion.
- La arquitectura interna y los datos de entrenamiento no se detallan en la model card; el articulo esta pendiente de publicacion en arXiv.
- No se han publicado datos sobre sesgos por grupo demografico, idioma o tipo de voz.
- El modelo solo estima f0; no transcribe, no identifica hablantes ni realiza otras tareas de audio.

## Enlaces

- Hugging Face: https://huggingface.co/Scicom-intl/pitchy
- Articulo *Pitchy*: enviado a arXiv, enlace pendiente de publicacion segun la model card (no disponible)
- Figuras de resultados: `figures/fig_teaser.png`, `figures/fig_example.png`, `figures/fig_fail_pitchy.png` (incluidas en el repositorio)
- Ejemplo de uso: `example.py` y paquete `pitchy` incluidos en el repositorio
