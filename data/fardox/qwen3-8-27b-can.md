# FardoX/Qwen3.8-27B-CAN

## Resumen

Qwen3.8-27B-CAN es una cuantización extrema de 2 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario independiente FardoX. No es un modelo entrenado desde cero, sino un derivado no oficial que comprime los pesos originales de 27.320.697.856 parámetros (unos 27,3 mil millones) en un fichero GGUF de 7,0 GB, lo que equivale a 2,046 bits por peso. El objetivo es hacer viable la inferencia de un modelo de 27B en CPU de gama baja, concretamente en un servidor de 4 vCPU sin GPU.

La innovación técnica es el esquema CAN (additive nibble code): cada grupo de 8 pesos se representa como la suma de 4 palabras de código extraídas de 4 libros de códigos de 16 entradas, previa rotación Hadamard por bloques de 512 con una escala fp16 por fila y bloque. La decodificación se resuelve con búsquedas de tabla (`pshufb`), lo que permite kernels de CPU rápidos. El proceso combina cuantización post-entrenamiento (PTQ) y una destilación de conocimiento corta contra el modelo bf16 que solo ajusta escalas y normas.

Su relevancia actual es doble: por un lado, demuestra que un modelo de 27B puede mantener el 98,6 % del rendimiento bf16 en GSM8K con solo 2 bits por peso; por otro, expone las limitaciones del enfoque, ya que requiere un parche específico sobre llama.cpp y solo dispone de kernels CPU para x86 AVX2, sin soporte CUDA, Metal ni ARM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); cuantizacion aditiva CAN con rotacion Hadamard |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | CAN de 2 bits (2,046 bits/peso); se menciona Q4_0 como referencia comparativa |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ficheros `Qwen3.8-27B-CAN-kd.gguf` y `Qwen3.8-27B-CAN.gguf`); tambien `delta.npz` y codigos en `ptq/`, `ptq_mtp/`, `kd/` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27,3 mil millones de parámetros. Sobre él se aplica el esquema CAN: los pesos se rotan mediante una transformada de Hadamard por bloques de 512 columnas, con una escala fp16 por cada par (fila, bloque de 512). Cada grupo de 8 pesos se codifica como suma de 4 palabras de código, una de cada uno de 4 libros de códigos de 16 entradas. La decodificación se implementa con instrucciones `pshufb`, lo que reduce la carga computacional en CPU.

El proceso de construcción tiene dos fases. Primero, cuantización post-entrenamiento (PTQ) sobre el modelo bf16. Después, una destilación de conocimiento corta contra el modelo bf16 que ajusta únicamente las escalas y las normas, sin modificar los códigos, los libros de códigos ni el tamaño del fichero. Los datos de calibración y de destilación son C4 train más texto generado por el propio modelo bf16; el autor indica explícitamente que no se usaron el conjunto de test de GSM8K ni datos de WikiText. No se documenta el número total de tokens de entrenamiento original de Qwen3.8-27B ni detalles de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio y el pipeline `text-generation`.
- Razonamiento aritmético y matemático de varios pasos: el autor reporta 0,876 en GSM8K (N=1319), frente a 0,889 del bf16 original.
- Razonamiento general heredado del modelo base Qwen3.8-27B, aunque no se publican resultados de MMLU ni de otros benchmarks de conocimiento.
- Ejecución en CPU x86 con AVX2 mediante llama.cpp parcheado; no hay soporte de GPU (CUDA, Metal) ni de ARM en los kernels publicados.
- Capacidad multimodal: el autor indica que no se probó visión; la capa MTP está en `ptq_mtp/` pero el GGUF no la utiliza.
- Tool calling, function calling, modo thinking y soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no documenta idiomas soportados.

## Casos de uso

- Inferencia de un modelo de 27B en servidores sin GPU: el fichero de 7,0 GB cabe en RAM convencional y se ejecuta con `llama-server` en 4 vCPU, lo que permite desplegar un modelo grande en entornos de virtualización baratos o en estaciones de trabajo sin acelerador.
- Procesamiento por lotes de razonamiento matemático en CPU: con 0,876 en GSM8K, es adecuado para tareas de resolución de problemas aritméticos donde no se dispone de GPU y el throughput no es crítico (5,75 t/s de generación en el hardware de referencia).
- Prototipado y evaluación de modelos grandes en local: desarrolladores que quieran probar el comportamiento de un 27B antes de invertir en infraestructura GPU pueden usar este GGUF como aproximación con un 98,6 % del rendimiento bf16 en GSM8K.
- Investigación sobre cuantización extrema: el repositorio incluye los códigos, libros de códigos, escalas de destilación y el informe completo, lo que lo convierte en material de referencia para estudiar esquemas de cuantización aditiva de 2 bits.
- Servicios de generación de texto de baja concurrencia: con 9,84 t/s de procesamiento de prompt (pp512) y 5,75 t/s de generación (tg128), encaja en asistentes internos o herramientas de una sola consulta donde la latencia de segundos es aceptable.
- Despliegue en entornos con restricciones de memoria: al ocupar 7,0 GB frente a los aproximadamente 54 GB de un bf16 de 27B, permite ejecutar el modelo en máquinas con 16 GB de RAM.
- Reproducción y verificación de resultados: los ficheros `resultados/` con registros, pre-registro y el informe permiten auditar la metodología de evaluación y replicar las mediciones.

## Benchmarks y rendimiento

| Modelo | bits/peso | GSM8K (N=1319) | Cuota de bf16 | Generacion CPU tg128 (t/s) | Prompt CPU pp512 (t/s) |
|---|---|---|---|---|---|
| bf16 original | 16 | 0,889 | 100 % | — | — |
| CAN + KD (este repo) | 2,05 | 0,876 | 98,6 % | 5,75* | 9,84* |
| CAN, solo PTQ | 2,05 | 0,825 | 92,8 % | 5,75 | 9,84 |
| ECTV/IQ2 con KD (FardoX/Qwen3.8-27B-rapido-GGUF) | 1,99 | 0,870 | 97,9 % | 2,57 | 8,28 |
| Q4_0 (`--pure`) | 4,51 | — | — | 3,25 | 5,87 |

Condiciones de medición según el autor: CPU de 4 vCPU (AMD EPYC 9655), binarios compilados solo para AVX2, `llama-bench -t 4`, mediana de 3 máquinas virtuales. La generación es 1,77 veces la de Q4_0 (rango 1,63–1,80) y 2,26 veces la del fichero ECTV. El asterisco indica que la velocidad se midió sobre el fichero PTQ; el fichero KD usa los mismos tipos de tensor y kernels, por lo que el autor estima la misma velocidad sin volver a medirla. Las filas CAN se evaluaron con una emulación exacta en F16 de los pesos CAN sobre GPU A100; las filas bf16 y ECTV se ejecutaron en una H100 el 22/11. La comprobación de integridad en CPU da una perplejidad WikiText-2 de 7,847 para los kernels CAN reales frente a 7,881 de la emulación (0,4 % de diferencia).

## Requisitos de hardware

- VRAM para inferencia: no aplica en el modo soportado; el modelo está pensado para CPU. El fichero GGUF ocupa 7,0 GB en disco y en RAM.
- GPU recomendadas: ninguna; los kernels publicados son solo CPU x86 AVX2. No hay soporte CUDA, Metal ni ARM.
- Cabe en GPU de consumo: no con los kernels actuales. En teoría, 7,0 GB cabrían en una RTX 4090 o RTX 3090, pero el parche `can3.patch` solo implementa kernels de CPU.
- CPU de referencia: 4 vCPU AMD EPYC 9655 con AVX2. El autor advierte que en un servidor AVX-512 más grande la ventaja de generación de CAN se redujo a unas 1,9 veces y la velocidad de prompt quedó por debajo de IQ2.
- Opciones de despliegue: llama.cpp compilado desde el commit `ad9d9e8f50e6ff9a6bfbbdd3aef6d74a8428cf4e` con el parche `can3.patch` aplicado, con `-DGGML_CUDA=OFF -DGGML_NATIVE=ON -DLLAMA_CURL=OFF`, apuntando a `llama-cli` o `llama-server`. El llama.cpp estándar no puede cargar estos ficheros. No se mencionan vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: 5,75 t/s de generación (tg128) y 9,84 t/s de procesamiento de prompt (pp512) en el hardware de referencia, con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/peso | Tamano | GSM8K | Soporte de hardware | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-CAN (este repo) | 27,3 B | 2,05 | 7,0 GB | 0,876 | CPU x86 AVX2 (llama.cpp parcheado) | Apache-2.0 |
| Qwen3.8-27B-rapido-GGUF (ECTV/IQ2 + KD) | 27,3 B | 1,99 | no disponible | 0,870 | CPU (kernels IQ2 estándar de llama.cpp) | Apache-2.0 |
| Qwen3.8-27B Q4_0 | 27,3 B | 4,51 | no disponible | no disponible | CPU y GPU (llama.cpp estándar) | Apache-2.0 |
| Qwen3.8-27B bf16 original | 27,3 B | 16 | no disponible | 0,889 | GPU (formato original) | Apache-2.0 |

La comparativa se limita a variantes del mismo modelo base porque la información proporcionada no incluye datos de modelos de otros fabricantes. CAN destaca en velocidad de generación en CPU (5,75 t/s frente a 2,57 t/s de ECTV y 3,25 t/s de Q4_0) y en fidelidad a bf16 en GSM8K, pero exige un parche específico y carece de soporte GPU.

## Limitaciones y advertencias

- Una sola ejecución por configuración, sin semillas repetidas; el intervalo de confianza del 95 % para GSM8K es de aproximadamente ±1,8 puntos.
- Los números de GSM8K de bf16 y CAN provienen de GPUs distintas (H100 frente a A100); la decodificación voraz es casi determinista, pero no exactamente idéntica entre hardware.
- La velocidad en otras CPU diferirá: en un servidor AVX-512 la ventaja de generación se redujo a unas 1,9 veces y la velocidad de prompt quedó por debajo de IQ2.
- Solo texto: no se probó visión y la capa MTP no se usa en el GGUF.
- Requiere un parche específico de llama.cpp y un commit concreto; el llama.cpp estándar no carga los ficheros, lo que complica el mantenimiento y la actualización.
- Solo hay kernels CPU x86 AVX2; no hay soporte CUDA, Metal ni ARM, lo que excluye GPUs, Apple Silicon y servidores ARM.
- Es un derivado no oficial, no afiliado ni respaldado por Qwen o Alibaba; la licencia Apache-2.0 del modelo base se mantiene, pero la calidad y el soporte dependen de un único autor.
- El repositorio tiene 15 descargas y 0 likes, por lo que la validación comunitaria es mínima.
- No se documentan sesgos, riesgos de alucinación específicos, idiomas soportados ni comportamiento en tool calling; estas limitaciones del modelo base no están caracterizadas en la información disponible.
- El informe completo está en portugués, lo que puede dificultar la auditoría a lectores no lusohablantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FardoX/Qwen3.8-27B-CAN
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización previa del mismo autor (ECTV/IQ2): https://huggingface.co/FardoX/Qwen3.8-27B-rapido-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
