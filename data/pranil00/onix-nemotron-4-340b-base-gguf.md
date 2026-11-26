# pranil00/ONIX-Nemotron-4-340B-Base-GGUF

## Resumen

ONIX-Nemotron-4-340B-Base-GGUF es una cuantización extrema del modelo base Nemotron-4-340B-Base de NVIDIA, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto GGUF de 64,83 GB generado con el esquema IQ1_S (1,56 bits por peso), lo que representa una compresión de 10,26x respecto a los pesos en FP16 originales (664,96 GB). El objetivo declarado es hacer ejecutable en hardware de consumo un modelo de 340.000 millones de parámetros, algo inviable en su formato original.

La relevancia de esta ficha es doble. Por un lado, documenta un ejercicio de cuantización agresiva sobre un transformer denso de gran escala. Por otro, sirve como advertencia práctica: el propio autor reconoce una retención de calidad de aproximadamente el 60 % y una categoría de viabilidad "HYBRID OFFLOAD", con solo 8 de las 96 capas aceleradas en GPU y el resto transmitidas desde RAM del sistema. No es un modelo para producción, sino una prueba de concepto de ejecución local extrema.

El modelo base es un transformer de tipo decoder-only orientado a generación de texto, sin ajuste por instrucciones (es la variante "Base"). La model card no documenta idiomas soportados, datos de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones técnicas del modelo original quedan fuera de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Nemotron-4, decoder-only) |
| Parametros totales | 340.000 millones (340B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y GPU NVIDIA; 4.096 tokens en CPU |
| Tipos de cuantizacion | IQ1_S (1,56 bits por peso); KV cache en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `nvidia--Nemotron-4-340B-Base-IQ1_S.gguf`) |
| Tamano del artefacto | 64,83 GB (66.390 MB) |
| Compresion respecto a FP16 | 10,26x (reduccion del 90,2 %) |
| Retencion de calidad declarada | ~60 % |
| Categoria de viabilidad | Hybrid offload (RAM limitada) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 340.000 millones de parámetros de la familia Nemotron-4 de NVIDIA, en su variante Base (sin ajuste por instrucciones). La model card de esta cuantización no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen aquí.

La innovación técnica de este artefacto no está en la arquitectura, sino en el proceso de cuantización. Se ha aplicado el esquema IQ1_S, que emplea 1,56 bits por peso, y se ha generado con la herramienta `run-any-model`, descrita por el autor como un motor de optimización adaptativo y consciente del dispositivo. El informe de telemetría incluido indica que solo 8 de las 96 capas se descargan en el acelerador (GPU o Metal), mientras que el resto se transmiten desde la RAM del sistema, lo que degrada la velocidad de generación. El KV cache se mantiene en Q4_0 con un búfer de 6.144 MB.

## Capacidades

- Generación de texto autoregresiva, propia de un modelo base sin ajuste por instrucciones.
- Razonamiento y conocimiento general heredados del modelo Nemotron-4-340B-Base original, aunque mermados por la cuantización a 1,56 bits.
- Ejecución multiplataforma mediante GGUF: Apple Silicon (Metal), GPU NVIDIA (CUDA) y CPU x86 con AVX2/AVX-512.
- Compatibilidad con herramientas de inferencia local: `run-any-model`, Ollama, llama.cpp, LM Studio, Jan y Text-Generation-WebUI.
- Soporte de conversación en terminal mediante el modo `-cnv` de llama.cpp y los tokens de parada `<|im_end|>` y `<|endoftext|>`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Experimentación académica con cuantización extrema: permite estudiar el impacto de IQ1_S (1,56 bits) sobre un modelo de 340B y medir la degradación real frente a FP16 en tareas controladas.
- Pruebas de concepto en hardware de consumo: un equipo con 71 GB de memoria unificada (Apple Silicon) o 66 GB de VRAM puede cargar el modelo y validar pipelines de inferencia sin infraestructura de centro de datos.
- Evaluación de motores de inferencia: sirve para comparar el rendimiento de llama.cpp, Ollama y `run-any-model` sobre un mismo artefacto GGUF de gran tamaño con offload híbrido.
- Generación de texto sin requisitos de alta fidelidad: tareas de completado, resumen o borradores donde el 60 % de retención de calidad sea aceptable y el coste de infraestructura sea el factor limitante.
- Docencia y divulgación: demostrar de forma tangible las relaciones entre bits por peso, tamaño de pesos, RAM necesaria y calidad resultante en modelos de escala frontera.
- Investigación sobre offload híbrido: analizar el comportamiento de 8/96 capas aceleradas en GPU frente al streaming desde RAM del sistema y su efecto en latencia y throughput.
- No se recomienda su uso en producción, atención al cliente, generación de código crítica ni aplicaciones que requieran fiabilidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una matriz de telemetría de ejecución, no métricas de calidad sobre tareas estándar:

| Metrica | Baseline (FP16) | Cuantizado (IQ1_S) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 1,56 | -90,2 % |
| Tamano de pesos | 664,96 GB | 64,83 GB | -90,2 % |
| Bufer KV cache | 6.144 MB (FP16) | 6.144 MB (Q4_0) | Optimizado |
| RAM residente total | 689,26 GB | 71,13 GB | -89,7 % |
| Categoria de viabilidad | Inviable / crash | Hybrid offload (RAM limitada) | Validado |
| Calidad estimada | 100,0 % baseline | 60,0 % retenida | -40,0 % |
| Aceleracion de capas | 0 % (riesgo de crash) | 8/96 capas | Optimo |

No se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia en tokens por segundo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 66,33 GB de VRAM dedicada en GPU NVIDIA; 71,13 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5); 73,13 GB de RAM libre en CPU x86.
- GPU recomendadas: no se especifican modelos concretos; la tabla del autor cita genéricamente RTX 30/40/50 series y aceleración CUDA. Para 66 GB de VRAM se requieren soluciones multi-GPU o tarjetas de gama profesional (A100 80 GB, H100 80 GB) o configuraciones con offload.
- ¿Cabe en GPU de consumo? No en una sola tarjeta. Una RTX 4090 (24 GB) o RTX 5090 (32 GB) no alojan los 64,83 GB de pesos; el autor clasifica el modelo como "hybrid offload", con solo 8/96 capas en acelerador y el resto en RAM del sistema.
- Opciones de despliegue: `run-any-model` (CLI oficial del autor), Ollama (mediante Modelfile), llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no se publican cifras de tokens por segundo. El autor advierte explícitamente de que "la velocidad de generación será más lenta" debido al offload híbrido.
- Contexto operativo: 8.192 tokens en Apple Silicon y GPU NVIDIA; 4.096 tokens en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Nemotron-4-340B-Base-GGUF (este) | 340B | 8.192 (GPU/Metal) / 4.096 (CPU) | GGUF IQ1_S (1,56 bits) | Apache 2.0 | Hugging Face (pranil00) |
| nvidia/Nemotron-4-340B-Base | 340B | no disponible en esta ficha | safetensors (FP16/BF16) | no disponible en esta ficha | Hugging Face (NVIDIA) |
| Cuantizaciones GGUF de gran escala de la comunidad (p. ej. Q4_K_M de modelos 70B) | 70B | variable | GGUF 4-5 bits | variable | Hugging Face |

No se dispone de datos de benchmarks ni de modelos comparables de 340B en formato IQ1_S publicados por el mismo autor, por lo que la comparativa cuantitativa de rendimiento queda como no disponible. La comparación con el modelo base es la referencia más directa: el artefacto aquí descrito ocupa un 9,8 % del tamaño de pesos del original a costa de una retención de calidad declarada del 60 %.

## Limitaciones y advertencias

- Retención de calidad declarada del 60 %: la cuantización a 1,56 bits por peso degrada sustancialmente la fidelidad del modelo; no es apta para tareas que exijan precisión.
- Riesgo elevado de alucinación y de degradación del razonamiento, el código y las matemáticas, agravado por la baja precisión de los pesos.
- Modelo base sin ajuste por instrucciones: no está alineado para seguir instrucciones ni para diálogo; requiere prompting cuidadoso.
- Idiomas soportados no documentados; no hay garantía de comportamiento multilingüe.
- Offload híbrido: solo 8/96 capas se aceleran en GPU/Metal, lo que implica latencia alta y throughput bajo en la práctica.
- Requisitos de memoria elevados para hardware de consumo: 66-73 GB según plataforma, fuera del alcance de la mayoría de equipos domésticos.
- Licencia Apache 2.0 declarada por el publicador, pero la licencia del modelo base de NVIDIA no se detalla en esta ficha; conviene verificar los términos del modelo original antes de un uso comercial.
- El artefacto registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La model card incluye un descargo de responsabilidad absoluto que exime al autor de cualquier daño derivado del uso; el implementador asume toda la responsabilidad de auditar las salidas.
- No se han publicado benchmarks de calidad ni de rendimiento que permitan verificar las cifras de retención de calidad o de velocidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-Nemotron-4-340B-Base-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-4-340B-Base
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
