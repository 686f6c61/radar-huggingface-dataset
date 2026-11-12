# killameep/htdemucs-onnx-fp16-split

## Resumen

HTDemucs 4-stem ONNX fp16 split es una reexportación optimizada del modelo de separación de fuentes musicales Hybrid Transformer Demucs (HTDemucs), desarrollado originalmente por Alexandre Défossez, Simon Rouard y colaboradores en Meta AI Research (facebookresearch/demucs). El modelo original separa una mezcla musical estéreo en cuatro pistas (batería, bajo, otros y voz). Esta versión concreta, publicada por el usuario killameep, no introduce cambios en los pesos ni en la arquitectura: parte del export ONNX de StemSplitio y lo transforma en nueve grafos ONNX encadenados en fp16 con formas de entrada fijas, con el objetivo de reducir el consumo de memoria intermedia y hacer viable la inferencia en GPUs de 16 GB bajo DirectML.

El problema que resuelve es eminentemente de ingeniería de despliegue. El export original contiene unas 25.000 nodos, la mayoría de ellos aritmética de formas en tiempo de ejecución, con tensores intermedios que suman unos 16,5 GB por fragmento de 7,8 segundos, lo que provoca errores `E_OUTOFMEMORY` en tarjetas de 16 GB con el proveedor DirectML de ONNX Runtime. Tras el plegado de constantes, la conversión a fp16 y la división topológica en nueve partes, cada una maneja como máximo unos 2 GB de intermedios y el total de pesos ronda los 173 MB.

Es relevante para desarrolladores que necesiten ejecutar separación de fuentes en hardware de consumo o en entornos Windows con DirectML, donde las alternativas de PyTorch nativo pueden resultar más pesadas de desplegar. No es un modelo de lenguaje ni un transformer generativo de texto: es un modelo de audio con pipeline `audio-to-audio`, licencia MIT y un repositorio de 0,2 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (HTDemucs), exportado como 9 grafos ONNX secuenciales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 343.980 muestras (7,8 s estéreo a 44,1 kHz) |
| Tipos de cuantizacion | fp16 en pesos y cómputo interno; entradas y salidas en fp32; capas de normalización, Softmax, ReduceMean y Erf en fp32 |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`part0.onnx` … `part8.onnx`, 173 MB en total) más `parts.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

HTDemucs es una arquitectura híbrida que combina un codificador-decodificador convolucional en el dominio de la forma de onda con un bloque transformer que opera sobre representaciones espectrales intermedias, lo que le permite modelar dependencias de largo alcance entre componentes de la mezcla. El modelo original se entrena sobre datos musicales con aumentos y separación en cuatro pistas; esta ficha no dispone de detalles sobre el volumen de tokens, la composición exacta del dataset ni si se aplicaron etapas de refinamiento tipo RLHF, por lo que esos datos se consideran no disponibles.

La innovación de esta versión es puramente de grafo: se fija la entrada `mix` a `[1, 2, 343980]`, se aplica plegado de constantes con la optimización básica de ONNX Runtime (de ~25.000 a 1.444 nodos, salida bit a bit idéntica a la fuente), se convierte a fp16 con `onnxconverter-common` manteniendo fp32 en entradas, salidas y operaciones sensibles a la precisión, y se corta el grafo en orden topológico en nueve partes con puntos de corte donde cruzan pocos tensores (como máximo 53 MB entre partes). El resultado es un pipeline secuencial que puede cargarse parte a parte para acotar el pico de memoria GPU a lo largo de una canción completa.

## Capacidades

- Separación de fuentes musicales en cuatro pistas: batería, bajo, otros y voz, a partir de una mezcla estéreo.
- Procesamiento por fragmentos de 7,8 segundos con solapamiento del 25 % y crossfade lineal para audio de mayor duración, siguiendo el procedimiento del `infer.py` del modelo fuente.
- Ejecución en ONNX Runtime con proveedores `DmlExecutionProvider` (DirectML) y `CPUExecutionProvider`.
- Inferencia con memoria acotada mediante carga y liberación secuencial de las nueve partes del grafo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de audio especializado.
- No incluye modo thinking, visión ni audio de entrada distinto de la forma de onda musical estéreo.

## Casos de uso

- Karaoke y pistas de acompañamiento: extraer la pista de voz y la instrumental de una canción para generar versiones sin voz, aprovechando la separación en cuatro pistas y el procesamiento por fragmentos con solapamiento.
- Remezclas y producción musical: aislar batería, bajo y otros para samplear o reutilizar elementos concretos en un DAW, con la ventaja de ejecutarse en GPUs de consumo bajo DirectML.
- Limpieza de archivos de audio históricos: separar voces de ruido instrumental en grabaciones para tareas de restauración o transcripción posterior.
- Preprocesado para reconocimiento automático de voz musical: aislar la pista vocal antes de pasar el audio a un sistema ASR, mejorando la relación señal-ruido del habla cantada.
- Despliegue en Windows con aceleración DirectML: integrar la separación en aplicaciones de escritorio que ya usan ONNX Runtime y quieren evitar la pila de PyTorch, gracias al formato ONNX y a la partición en nueve grafos.
- Procesamiento por lotes en CPU con memoria limitada: el autor reporta una reducción del pico de memoria del proceso de 6,45 GB a 3,88 GB en CPU con velocidad similar, lo que facilita ejecutar la separación en servidores sin GPU.
- Investigación en separación de fuentes: usar la versión fp16 dividida como referencia reproducible para comparar métricas de calidad y consumo de memoria frente al export original.

## Benchmarks y rendimiento

El autor publica una única medición de fidelidad frente al modelo fuente (activaciones fp32) sobre un fragmento musical de 7,8 segundos, expresada como SNR:

| Pista | SNR vs modelo fuente |
|---|---|
| drums | 61,2 dB |
| bass | 63,1 dB |
| other | 58,1 dB |
| vocals | 62,4 dB |

No se han publicado resultados de benchmarks estándar de separación de fuentes (SDR, SI-SNR sobre MUSDB18 u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que el objetivo del recorte es encajar en GPUs de 16 GB bajo DirectML; con la partición en nueve partes, cada parte maneja como máximo unos 2 GB de tensores intermedios, por lo que el pico de VRAM queda muy por debajo del original (~16,5 GB por fragmento).
- GPU recomendadas: tarjetas de 16 GB o más con soporte DirectML (por ejemplo, gama RTX 4080/4090 en Windows); también válidas GPUs con proveedor CUDA de ONNX Runtime, aunque el autor no documenta esa ruta.
- Cabe en GPU de consumo: sí, siempre que se carguen las partes de forma secuencial; el tamaño total de pesos es de 173 MB.
- Opciones de despliegue: ONNX Runtime con `DmlExecutionProvider` o `CPUExecutionProvider`; el autor no menciona vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numérica; el autor solo señala que en CPU la velocidad es similar a la del modelo fuente con menor pico de memoria (6,45 GB a 3,88 GB).

## Comparativa con modelos similares

| Modelo | Tipo | Pistas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| killameep/htdemucs-onnx-fp16-split | HTDemucs ONNX fp16 dividido | 4 | ONNX (9 partes) | MIT | Optimizado para DirectML y memoria acotada |
| StemSplitio/htdemucs-onnx | HTDemucs ONNX (modelo base) | 4 | ONNX (grafo único) | MIT | Export del que deriva esta versión; ~16,5 GB de intermedios por fragmento |
| facebookresearch/demucs (HTDemucs original) | PyTorch | 4 | PyTorch | MIT | Implementación de referencia de Meta AI; requiere pila PyTorch |

No se dispone de datos de rendimiento comparativo (SDR/SI-SNR) entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, licencia y características de despliegue.

## Limitaciones y advertencias

- Modelo especializado en separación de fuentes musicales: no es un modelo de lenguaje y no ofrece generación de texto, código ni razonamiento.
- Riesgo de artefactos y alucinación auditiva: como todo modelo de separación, puede introducir bleeding entre pistas o artefactos en pasajes densos; la SNR de 58,1 dB en la pista "other" es la más baja de las cuatro frente al modelo fuente.
- Entrada fija: el grafo exige `mix` con forma `[1, 2, 343980]`; audio de otra duración debe trocearse y reconstruirse con solapamiento del 25 % y crossfade lineal, tal como hace el `infer.py` del modelo fuente.
- Sin información sobre sesgos: no se documentan sesgos demográficos, de género musical ni de idioma; el modelo se entrenó con datos musicales no especificados en esta ficha.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero se debe conservar el aviso de copyright y atribuir a los autores originales de HTDemucs y al export de StemSplitio.
- Caveat de producción: la división en nueve grafos obliga a gestionar el ciclo de vida de las sesiones ONNX Runtime; cargar todas las partes a la vez anula la ventaja de memoria. Además, el autor solo valida explícitamente la ruta DirectML y CPU.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/killameep/htdemucs-onnx-fp16-split
- Modelo base (export ONNX): https://huggingface.co/StemSplitio/htdemucs-onnx
- Repositorio original de Demucs (facebookresearch): https://github.com/facebookresearch/demucs
