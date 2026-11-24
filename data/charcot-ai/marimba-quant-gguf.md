# charcot-ai/marimba-quant-gguf

## Resumen

Marimba quant GGUF es un paquete de cuantizaciones en formato GGUF del codificador de audio que consume el modelo Marimba, desarrollado por charcot-ai. No se trata de un modelo de lenguaje generativo, sino del codificador de audio de Qwen/Qwen3-ASR-0.6B (revision `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`) empaquetado para su uso con un runtime ggml minimo que devuelve los estados ocultos que consumen los readouts de Marimba. El repositorio incluye ocho variantes de cuantizacion, desde F32 hasta Q4_0, con pesos almacenados en tipos de bloque ggml.

El modelo resuelve un problema concreto: permitir ejecutar el front-end de audio de Marimba (deteccion de turno de palabra, actividad de voz, cambio de hablante y recuento de hablantes) sobre infraestructura ggml, con backend CUDA o CPU, sin necesidad de cargar el checkpoint completo de Qwen3-ASR-0.6B (1,88 GB) en PyTorch. El codificador aislado ocupa 373 MB en bfloat16 dentro del checkpoint original, y estas cuantizaciones lo reducen hasta 111 MB en Q4_0.

La relevancia actual del paquete es practica: ofrece una ruta de despliegue ligera para tareas de diarizacion y segmentacion de audio en produccion, con evaluacion empirica sobre 1.170 ventanas publicas de 8 segundos y comparacion contra la referencia float32 en PyTorch. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de Qwen3-ASR-0.6B: stem de tres convoluciones, `conv_out`, 18 capas transformer y banco de filtros mel |
| Parametros totales | 184.677.888 (codificador de audio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio de 8 segundos, 16 kHz mono, en la evaluacion) |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0, Q6_K, Q5_K, Q5_0, Q4_K, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos de bloque ggml) |

## Arquitectura y entrenamiento

El codificador sigue la arquitectura del encoder de audio de Qwen3-ASR-0.6B: un stem de tres convoluciones, una capa `conv_out`, 18 capas transformer y un banco de filtros mel. El paquete no incluye el decodificador de texto ni la proyeccion de salida del codificador, porque los readouts de Marimba leen los estados ocultos tras las capas 9, 12 y 18. Los readouts que convierten esos estados en decisiones no estan en este repositorio y provienen de charcot-ai/marimba.

La cuantizacion es weight-only y no emplea datos de calibracion. Los pesos fuente estan en bfloat16. Los pesos 2-D de las proyecciones de atencion, las capas feed-forward y `conv_out` adoptan el tipo del fichero; los kernels de convolucion permanecen en F16; los sesgos, parametros de LayerNorm y el banco de filtros mel permanecen en F32. Los K-quants de ggml requieren filas de longitud multiplo de 256; solo `fc2` y `conv_out` cumplen (filas de 3.584 y 7.680), mientras que el resto de pesos lineales tienen filas de 896 y caen a un tipo no-K: Q4_K a Q5_0, Q5_K a Q5_1, Q6_K a Q8_0. El repositorio incluye ademas un runtime ggml minimo que devuelve los estados ocultos.

## Capacidades

- Extraccion de estados ocultos de audio a partir de ventanas de 8 segundos, 16 kHz mono.
- Deteccion de fin de turno de palabra (turn_end), mediante readouts externos.
- Deteccion de actividad de voz (voice_activity) con ventana de 1 segundo y de 8 segundos.
- Deteccion de mismo hablante (same_speaker).
- Deteccion de cambio de hablante (speaker_change).
- Recuento de hablantes (speaker_count).
- Ejecucion en backend ggml CUDA y CPU.
- No incluye generacion de texto, tool calling, agentes ni capacidades multilingues propias: es un componente de codificacion de audio.

## Casos de uso

- Deteccion de fin de turno en asistentes conversacionales: el codificador alimenta el readout de turn_end para decidir cuando el usuario ha terminado de hablar, con AUROC de 0,9310 en la referencia fp32 y 0,9345 en Q5_K sobre CUDA.
- Diarizacion en tiempo real: los readouts de same_speaker y speaker_change permiten segmentar reuniones por hablante; la variante Q8_0 mantiene AUROC de 0,9931 en same_speaker con solo 201 MB.
- Recuento de participantes en llamadas: speaker_count alcanza 0,7862 de exactitud en la referencia fp32 y 0,7908 en Q6_K, util para metadatos automaticos de reunion.
- Filtrado de actividad de voz en pipelines de transcripcion: voice_activity con AUROC de 0,9969 (ventana de 1 s) permite descartar silencios antes de invocar un modelo ASR mayor, ahorrando computo.
- Despliegue en CPU sin GPU: la tabla de backend CPU muestra que F32 y F16 reproducen exactamente la referencia (0 decisiones cambiadas), y Q8_0 cambia solo 24 decisiones sobre 1.170 ventanas, lo que permite servir el codificador en servidores sin acelerador.
- Integracion en dispositivos con VRAM limitada: Q4_0 ocupa 111 MB y puede cargarse junto a otros componentes en GPUs de consumo, a costa de 283 decisiones cambiadas y una diferencia maxima de probabilidad de 0,810.
- Prototipado de pipelines de audio en Python con el paquete `marimba-audio`: las variantes de pesos desquantizados al cargar permiten usar el mismo fichero GGUF como formato de almacenamiento y ejecutar en PyTorch bfloat16.

## Benchmarks y rendimiento

Evaluacion sobre 1.170 ventanas publicas de 8 segundos (16 kHz mono) de Smart Turn v3.2 test, VoxConverse test, AMI ihm test, ESC-50 sin clases de sonidos humanos y FLEURS pt_br validation. Referencia: codificador PyTorch float32 en CPU.

Backend ggml CUDA, pesos en el tipo del fichero:

| Variante | turn_end AUROC | voice_activity (1 s) | voice_activity (8 s) | same_speaker | speaker_change | speaker_count acc | Max prob diff | Decisiones cambiadas |
|---|---|---|---|---|---|---|---|---|
| fp32 ref (PyTorch CPU) | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | - | - |
| F32 | 0,9314 | 0,9969 | 0,9999 | 0,9926 | 0,9558 | 0,7862 | 0,058 | 2 |
| F16 | 0,9312 | 0,9969 | 0,9999 | 0,9927 | 0,9557 | 0,7862 | 0,070 | 5 |
| BF16 | 0,9312 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | 0,055 | 4 |
| Q8_0 | 0,9293 | 0,9969 | 0,9999 | 0,9931 | 0,9557 | 0,7897 | 0,102 | 19 |
| Q6_K | 0,9283 | 0,9969 | 0,9999 | 0,9926 | 0,9559 | 0,7908 | 0,149 | 25 |
| Q5_K | 0,9345 | 0,9969 | 0,9999 | 0,9937 | 0,9560 | 0,7839 | 0,354 | 137 |
| Q5_0 | 0,9276 | 0,9969 | 0,9999 | 0,9912 | 0,9554 | 0,7655 | 0,372 | 132 |
| Q4_K | 0,9188 | 0,9968 | 0,9999 | 0,9922 | 0,9552 | 0,7724 | 0,459 | 167 |
| Q4_0 | 0,9241 | 0,9968 | 0,9999 | 0,9943 | 0,9568 | 0,7644 | 0,810 | 283 |

Backend ggml CPU, pesos en el tipo del fichero:

| Variante | turn_end AUROC | voice_activity (1 s) | voice_activity (8 s) | same_speaker | speaker_change | speaker_count acc | Max prob diff | Decisiones cambiadas |
|---|---|---|---|---|---|---|---|---|
| fp32 ref (PyTorch CPU) | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | - | - |
| F32 | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | 0,000 | 0 |
| F16 | 0,9310 | 0,9969 | 0,9999 | 0,9926 | 0,9557 | 0,7862 | 0,000 | 0 |
| Q8_0 | 0,9305 | 0,9969 | 0,9999 | 0,9924 | 0,9558 | 0,7908 | 0,083 | 24 |
| Q5_K | 0,9353 | 0,9968 | 0,9999 | 0,9939 | 0,9560 | 0,7862 | 0,357 | 124 |
| Q4_K | 0,9212 | 0,9967 | 0,9999 | 0,9921 | 0,9552 | 0,7736 | 0,452 | 156 |

En estas dos tablas ggml multiplica los pesos en su tipo almacenado y, para tipos cuantizados, convierte las activaciones de cada producto matricial a bloques de 8 bits, reflejando redondeo de pesos y activaciones. La tabla de pesos desquantizados al cargar queda truncada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 111 MB (Q4_0) y 739 MB (F32) solo para los pesos del codificador.
- GPU recomendadas: cualquier GPU compatible con el backend ggml CUDA; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, dado el tamano de 111-201 MB en Q4_0-Q8_0.
- Opciones de despliegue: runtime ggml incluido en el repositorio (backend CUDA y CPU); el paquete `marimba-audio` para ejecucion en PyTorch bfloat16 con pesos desquantizados al cargar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| charcot-ai/marimba-quant-gguf | 184.677.888 (codificador) | no disponible | GGUF | Apache 2.0 | Cuantizaciones del codificador de audio de Qwen3-ASR-0.6B |
| charcot-ai/marimba | no disponible | no disponible | no disponible | no disponible | Modelo base con los readouts de decision |
| Qwen/Qwen3-ASR-0.6B | 0,6B (checkpoint completo) | no disponible | safetensors | no disponible en la informacion | Checkpoint original; codificador de 373 MB en bfloat16, total 1,88 GB |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada para una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce estados ocultos de audio; las decisiones dependen de readouts externos de charcot-ai/marimba.
- Las cuantizaciones bajas degradan la fidelidad: Q4_0 cambia 283 decisiones sobre 1.170 ventanas y alcanza una diferencia maxima de probabilidad de 0,810 en CUDA.
- Q5_K y Q5_0 muestran un comportamiento no monotono en CUDA (137 y 132 decisiones cambiadas respectivamente) frente a Q6_K (25), lo que desaconseja asumir una relacion lineal entre bits y fidelidad.
- La evaluacion se limita a ventanas de 8 segundos, 16 kHz mono, y a los conjuntos indicados; no hay datos sobre otros dominios, idiomas o duraciones.
- No se especifican sesgos conocidos ni riesgos de alucinacion en la informacion disponible; al ser un codificador, el riesgo se traslada a los readouts externos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-ASR-0.6B tiene su propia licencia no detallada en la informacion disponible.
- El repositorio no incluye el decodificador de texto ni la proyeccion de salida del codificador, por lo que no puede usarse para transcripcion ASR directa.

## Enlaces

- Hugging Face: https://huggingface.co/charcot-ai/marimba-quant-gguf
- Modelo base Marimba: https://huggingface.co/charcot-ai/marimba
- Checkpoint original Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Dataset Smart Turn v3.2 test: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-test
- Dataset VoxConverse: https://huggingface.co/datasets/diarizers-community/voxconverse
- Dataset AMI: https://huggingface.co/datasets/diarizers-community/ami
- Dataset ESC-50: https://huggingface.co/datasets/ashraq/esc50
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
