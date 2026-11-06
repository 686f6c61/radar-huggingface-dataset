# Ruka6/Mellum2-12B-A2.5B-Base-code-GGUF

## Resumen

Mellum2-12B-A2.5B-Base-code-GGUF es una colección de cuantizaciones GGUF de precisión mixta del checkpoint base JetBrains/Mellum2-12B-A2.5B-Base, un modelo de lenguaje de arquitectura MoE (mezcla de expertos) desarrollado por JetBrains y orientado a ingeniería de software. El modelo original cuenta con 12.149.923.072 parámetros totales, de los cuales aproximadamente 2.500 millones están activos por token (según la nomenclatura A2.5B), y está diseñado para generación de código, autocompletado y comprensión de repositorios. Esta ficha cubre específicamente la variante cuantizada publicada por el usuario Ruka6, no el checkpoint original de JetBrains.

La relevancia de esta publicación reside en su metodología de cuantización: en lugar de aplicar tipos de tensor uniformes, el autor selecciona el tipo de cada tensor a partir de mediciones de sensibilidad por capa (divergencia KL frente al modelo BF16 sobre código fuente reservado), usando una importance matrix calculada sobre muestras de código y formato FIM (fill-in-the-middle). El resultado son ficheros que caben en GPUs de 16 GB y 8 GB manteniendo una fidelidad alta frente al modelo de referencia, algo crítico para el autocompletado local en entornos de desarrollo.

El modelo base es un checkpoint preentrenado, no un modelo instruido ni de chat: su uso previsto es la completación de código y el relleno de huecos (FIM), no el diálogo conversacional. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); 28 capas, 21 de ellas con ventana deslizante de 1024 tokens |
| Parametros totales | 12.149.923.072 |
| Parametros activos | ~2.500 millones (según nomenclatura A2.5B del nombre del modelo) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en llama.cpp); el fichero Q4-8GB se orienta a ≤16k |
| Tipos de cuantizacion | Q8_0, Q6_K mixto (HQ), Q6_K/Q4_K/IQ4_NL mixto (FAST), Q4_K/IQ4_NL mixto (Q4-8GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors |
| Tamano del repo | 42,0 GB (incluye todos los ficheros GGUF e imatrix) |
| Ficheros publicados | Q8_0 (12,9 GB), Q6_K-HQ (11,2 GB), Q6_K-FAST (10,3 GB), Q4_K-8GB (7,6 GB), imatrix-code.gguf (82 MB) |
| Modelo base | JetBrains/Mellum2-12B-A2.5B-Base |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 28 capas, del cual 21 capas emplean atención con ventana deslizante de 1024 tokens, lo que abarata el coste de contextos largos. La dimensión de entrada de los tensores de expertos de bajada (`ffn_down_exps`) es 896, un valor no múltiplo de 256, lo que impide usar cuantizaciones K-quant en ese tensor y obliga a tipos de bloque de 32 elementos (Q8_0, Q5_0, IQ4_NL). No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el autor de la cuantización describe el checkpoint como preentrenado, no instruido.

La innovación técnica de esta publicación no está en el modelo sino en el proceso de cuantización. El autor convierte primero de HF a GGUF BF16 con `convert_hf_to_gguf.py`, calcula una importance matrix sobre aproximadamente 1,3 MB de código fuente en diez lenguajes (Python, JavaScript, TypeScript, Go, C, C++, cabeceras, Ruby, Lua y shell), con cerca del 40 % de las muestras en formato FIM PSM y contexto de 512 tokens (854 fragmentos), y mide la divergencia KL por capa frente a las logits del modelo BF16. Con esos datos elige tipos por tensor: el router (`ffn_gate_inp`) y las normas se mantienen en F32; atención, embedding de tokens y cabeza de salida en Q8_0; y solo varían los tensores de expertos. La capa 27 (la última) resulta entre 3 y 10 veces más sensible que cualquier otra y se mantiene en Q8_0 en todas las variantes. Las capas de expertos menos sensibles son 0, 23, 1, 22, 24, 18 y 21.

## Capacidades

- Generación de código y autocompletado en modo fill-in-the-middle con los tokens especiales `<fim_prefix>`, `<fim_suffix>`, `<fim_middle>` y `<fim_pad>`, en formato PSM.
- Completación de código en línea dentro de editores mediante el endpoint `/infill` de llama.cpp (compatible con plugins como llama.vscode y llama.vim).
- Contexto de fichero opcional mediante una línea `<filename>ruta\n` antes del prefijo FIM.
- Comprensión de código en diez lenguajes según la importance matrix empleada: Python, JavaScript, TypeScript, Go, C, C++, Ruby, Lua y shell.
- Generación de texto autoregresiva genérica, si bien el checkpoint no está alineado para instrucciones ni diálogo.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language` del repositorio.

## Casos de uso

- Autocompletado en el IDE: el modelo se sirve con `llama-server` en el puerto local y el plugin del editor consume `/infill`; con caché de KV reutilizada y una ventana deslizante de 1024 tokens en 21 capas, una sugerencia de 16 tokens sobre un contexto de 2,7k tokens tarda unos 0,33 s en una RX 7800 XT.
- Relleno de bloques de código (FIM): dado un prefijo y un sufijo, el modelo genera el fragmento intermedio, útil para completar cuerpos de función, condiciones o bloques de test a partir de firmas y aserciones.
- Asistencia offline en estaciones de trabajo con GPU de 8 GB: la variante Q4_K-8GB (7,6 GB, KLD 0,00879, mismo top-1 97,75 %) permite completación local sin conexión ni envío de código a servicios externos.
- Integración en pipelines de generación de tests: usando FIM con el nombre de fichero como contexto, se pueden proponer casos de prueba a partir del código fuente existente y filtrarlos después con la suite de CI.
- Completado de código en monolitos con contexto largo: la configuración recomendada admite 32.768 tokens de contexto, suficiente para incluir varios ficheros relacionados en tareas de refactorización asistida.
- Servicio de completación multi-editor en una sola GPU de 16 GB: con `-np 1` y `--cache-reuse 256`, un único servidor llama.cpp puede atender peticiones sucesivas de un equipo pequeño manteniendo la caché caliente.
- Evaluación comparativa de cuantizaciones: los ficheros y la importance matrix publicados permiten reproducir el barrido de KL y validar recetas propias con `llama-quantize --tensor-type-file`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son métricas de fidelidad de la cuantización y de rendimiento de inferencia.

Fidelidad frente al modelo BF16 (divergencia KL media y coincidencia en top-1):

| Fichero | Tamano | KLD media ↓ | Mismo top-1 ↑ |
|---|---:|---:|---:|
| Q8_0 | 12,9 GB | 0,00113 | 99,28 % |
| Q6_K-HQ | 11,2 GB | 0,00143 | 99,19 % |
| Q6_K-FAST | 10,3 GB | 0,00298 | 98,81 % |
| Q4_K-8GB | 7,6 GB | 0,00879 | 97,75 % |
| Referencia: 80 % Q8 / 20 % Q4 | 11,5 GB | 0,00284 | 98,84 % |
| Referencia: expertos Q5_K / Q5_0 | 8,8 GB | 0,00388 | 98,41 % |
| Referencia: expertos Q4_K / IQ4_NL | 7,4 GB | 0,01018 | 97,49 % |

Rendimiento medido en AMD Radeon RX 7800 XT (16 GB, ROCm 7.2, llama.cpp `240d68f`, flash attention activado):

| Fichero | Prefill (pp2048) | Generación (tg64) |
|---|---:|---:|
| Q8_0 | 4120 t/s | 94,5 t/s |
| HQ | 3220 t/s | 98,7 t/s |
| FAST | 3405 t/s | 99,6 t/s |
| Q4-8GB | 3980 t/s | 100,6 t/s |

Con HQ y contexto creciente, la generación baja de 96,5 a 93,3 y 90,5 t/s a profundidades de 0, 4k y 16k tokens. En una sesión FIM simulada con ~2,7k tokens de contexto: primera petición en frío 1,05 s (2701 tokens reprocesados), sugerencia de 16 tokens mientras se escribe ~0,33 s (~400 tokens reprocesados, el sufijo) y bloque de 64 tokens ~0,72 s.

## Requisitos de hardware

- VRAM estimada: HQ ≈ 11,3 GiB con contexto de 32k (incluida la caché KV); Q4-8GB ≈ 7,7 GiB con contexto de 16k; Q8_0 requiere una GPU de 16 GB sin escritorio en la misma tarjeta.
- GPU objetivo declaradas: 16 GB para Q8_0, HQ y FAST; 8 GB para Q4-8GB (sin escritorio y con contexto ≤16k).
- Cabe en GPUs de consumo de 16 GB (por ejemplo, RX 7800 XT, usada en las mediciones) y de 8 GB con la variante Q4_K-8GB. No se aportan mediciones en A100, H100 ni RTX 4090.
- Despliegue: llama.cpp (`llama-server` con `-ngl 99 -fa on -c 32768 -np 1 -b 8192 -ub 1024 --cache-reuse 256 --port 8012`); se incluye un `Modelfile` para Ollama, no probado por el autor. No se mencionan vLLM ni TGI.
- Latencia y throughput: ver tabla de rendimiento; en ROCm el Q8_0 tiene prefill más rápido que las mezclas K-quant y la generación no está limitada por ancho de banda de memoria (~35 % de utilización), por lo que el orden puede variar en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| Mellum2-12B-A2.5B-Base-code-GGUF (esta ficha) | 12,1B totales, ~2,5B activos | 32k recomendado | GGUF, Apache 2.0 | Cuantización comunitaria mixta con imatrix de código y FIM |
| JetBrains/Mellum2-12B-A2.5B-Base | 12,1B totales, ~2,5B activos | no disponible | safetensors, Apache 2.0 | Checkpoint original de JetBrains, sin cuantizar |
| SandLogicTechnologies/Mellum2-12B-A2.5B-Base-GGUF | 12,1B totales, ~2,5B activos | no disponible | GGUF, Apache 2.0 | Cuantizaciones GGUF alternativas del mismo modelo base; no se detallan recetas ni métricas de KL en la información disponible |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cualitativo con modelos de otros autores de tamaño similar.

## Limitaciones y advertencias

- El modelo base es un checkpoint preentrenado, no instruido ni de chat: no debe usarse como asistente conversacional sin ajuste adicional.
- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación de código, APIs inexistentes o imports incorrectos inherente a un modelo de completación; requiere revisión y tests en producción.
- No se han publicado evaluaciones de sesgo ni de seguridad en la información disponible.
- Cuantización no oficial: el autor indica explícitamente que todos los créditos del modelo son de JetBrains y que se trata de una conversión comunitaria.
- El campo `general.file_type` de los GGUF mixtos es solo una etiqueta (Q6_K / Q4_K_M); los tipos reales por tensor están en el directorio `recipes/`.
- Los tokens `<fim_pad>` y `<|extra_token_*|>` tienen embeddings esencialmente no entrenados y deben evitarse; conviene parar la generación en `<|endoftext|>`, `<fim_prefix>`, `<fim_suffix>` y `<fim_middle>`.
- La variante Q4-8GB está pensada para contexto ≤16k y sin escritorio en la GPU; superar esos límites puede provocar desbordamiento de VRAM.
- El `Modelfile` de Ollama se distribuye sin probar por el autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Ruka6/Mellum2-12B-A2.5B-Base-code-GGUF
- Modelo base en Hugging Face: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base
- Cuantizaciones GGUF alternativas: https://huggingface.co/SandLogicTechnologies/Mellum2-12B-A2.5B-Base-GGUF
- Paper referenciado en los tags (arXiv:2605.31268): https://arxiv.org/abs/2605.31268
- llama.cpp: https://github.com/ggml-org/llama.cpp
