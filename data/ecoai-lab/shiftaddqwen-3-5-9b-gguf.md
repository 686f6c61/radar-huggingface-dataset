# EcoAI-Lab/ShiftAddQwen-3.5-9B-GGUF

## Resumen

ShiftAddQwen-3.5-9B-GGUF es una familia de cuantizaciones del modelo Qwen3.5-9B publicada por EcoAI-Lab (grupo Purdue-EcoAI) en formato GGUF, con pesos representados según el esquema ShiftAddLLM: cada grupo de pesos se expresa como suma de planos binarios multiplicados por escalas por grupo, con un presupuesto efectivo de 3,0 a 4,4 bits por peso del decodificador. El objetivo no es solo comprimir, sino batir a las cuantizaciones estándar de llama.cpp (k-quants e imatrix de UnslothAI) en la misma franja de tamaño: en cada variante publicada, el archivo es igual o más pequeño, tiene menor divergencia KL respecto al modelo BF16 y no empeora las tareas dentro del ruido estadístico.

El modelo base es Qwen3.5-9B, con 9.197.093.888 parámetros y una arquitectura híbrida de 32 capas: 8 capas de atención completa y 24 capas Gated-DeltaNet con estado de tamaño fijo, 4 cabezas KV y cabezas de 256 dimensiones. La ventana de contexto llega a 262.144 tokens. Los archivos incluyen la cabeza MTP (multi-token prediction) del modelo base, lo que habilita decodificación especulativa.

La relevancia práctica está en el binomio tamaño/calidad: la variante de 4,4 bits ocupa 5,10 GB y alcanza un KLD de 0,0303 frente al BF16, con 78,2 puntos de media en GSM8K, MMLU-Pro, HumanEval y MGSM, superando a UD-Q3_K_XL (5,24 GB, KLD 0,036) con menor peso en disco. El coste es operativo: estos GGUF usan tipos ggml nuevos (`sa2` … `sa6_256`) y solo cargan con un llama.cpp parcheado del repositorio del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido del modelo base Qwen3.5-9B: 8 capas de atención completa + 24 capas Gated-DeltaNet; pesos en representación ShiftAddLLM (suma de planos binarios con escalas por grupo) |
| Parámetros totales | 9.197.093.888 (9,2 B) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | Tipos ggml propios `sa2` … `sa6_256`; variantes de 3,0, 3,2, 3,6, 4,0 y 4,4 bits por peso del decodificador; embedding y LM head en k-quants de llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere llama.cpp parcheado; incompatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B combina 8 capas de atención completa con 24 capas Gated-DeltaNet, un mecanismo de estado recurrente de tamaño fijo que reduce el coste de contexto largo. Con 4 cabezas KV y cabezas de 256 dimensiones, la caché KV en f16 cuesta 32 KB por token de contexto: 1 GB a 32K, 4,2 GB a 128K y 8,4 GB a 262K. Sobre ese modelo, EcoAI-Lab aplica el formato de pesos de ShiftAddLLM (arXiv:2406.05981), en el que cada grupo de pesos se reconstruye como suma de planos binarios escalados.

El pipeline de ajuste no es el original de ShiftAddLLM: se sustituye por escalas ajustadas con realimentación de error tipo GPTQ (output-aware), asignación de bits por capa guiada por la KL medida, y una destilación de escalas de extremo a extremo. Los kernels de decodificación también son propios y sin tablas de búsqueda (LUT-free): selección de signo con máscaras de bytes `dp4a`, lo que permite ejecutarlos en cualquier GPU con compute capability 6.1 o superior. La información disponible no detalla el dataset de entrenamiento del modelo base ni si hubo RLHF o DPO; solo se documenta el proceso de cuantización.

## Capacidades

- Generación de texto conversacional y razonamiento en modo "thinking" (la model card reporta evaluaciones con thinking on y thinking off).
- Razonamiento matemático: evaluado en GSM8K (250 ítems) y MGSM (80 ítems, multilingüe).
- Generación de código: evaluado en HumanEval (164 problemas).
- Conocimiento general y de dominio: evaluado en MMLU-Pro (350 ítems).
- Tool calling / function calling: evaluado en BFCL v4 en sus divisiones non-live (1.390 ítems), live (2.251) y multi-turno (800).
- Uso agéntico: evaluado en τ-bench (retail, 115 tareas; airline, 50 tareas) con pass^1 sobre 2 ensayos.
- Decodificación especulativa: todos los archivos incluyen la cabeza MTP del modelo base.
- Capacidades multilingües: la KL se mide sobre texto mixto que incluye multilingüe y se evalúa MGSM, pero no se publica la lista de idiomas soportados.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de 8 GB: la variante de 3,0 bits (3,90 GB) requiere unos 5,3 GB a 32K de contexto, por lo que cabe en una RTX 3070, RTX 4060 o RTX 2080 y permite servir un modelo de 9B con contexto largo en hardware de consumo.
- Agente con tool calling en producción: la variante de 4,4 bits mantiene el 85,9 % en BFCL non-live y el 79,9 % en BFCL live, con 51,3 % en τ-bench retail (mejor que Q4_K_M con 47,4 %), lo que la hace apta para orquestación de funciones y tareas de atención al cliente con herramientas.
- Asistente conversacional de contexto largo: con 262K tokens de ventana y 32 KB por token de caché KV, se puede indexar documentación extensa o historiales completos sin truncar; a 128K el consumo es de 9,4 GB con la variante de 4,0 bits.
- Autocompletado y generación de código en IDE o CI/CD: HumanEval forma parte de la métrica de tareas, y el modelo soporta tool calling para integraciones con linters, ejecutores de tests o APIs internas.
- Procesamiento por lotes en A100: a 130-145 tok/s de decodificación (tg128 en A100), es viable para generación masiva de resúmenes, clasificación o extracción de datos donde el coste por token manda.
- Inferencia en el borde o en estaciones de trabajo con V100: la variante de 4,0 bits consume 13,7 GB a 262K de contexto en una V100, lo que permite prototipado con contexto completo en hardware de generación anterior.
- Sustitución directa de k-quants en pipelines existentes de llama.cpp: mismo formato contenedor GGUF y menor huella por franja de calidad, siempre que se reemplace el binario por la versión parcheada.

## Benchmarks y rendimiento

Calidad frente al modelo BF16 (KLD sobre texto mixto held-out: web, chat, código, multilingüe y matemáticas; 40×512 tokens) y media de tareas (GSM8K 250, MMLU-Pro 350, HumanEval 164, MGSM 80; decodificación greedy, thinking off). Diferencias por debajo de ~1,5 puntos se consideran ruido.

| Variante | Tamaño (GB) | KLD mixto ↓ | Tareas ↑ | Decode tok/s (A100) | Referencia que supera |
|---|---|---|---|---|---|
| ShiftAddQwen-3.5-9B-4.4bits | 5,10 | 0,0303 | 78,2 | 130 | UD-Q3_K_XL (5,24 GB): KLD 0,030 vs 0,036; tareas 78,2 vs 78,9; 0,14 GB menos |
| ShiftAddQwen-3.5-9B-4.0bits | 4,76 | 0,0384 | 77,4 | 135 | Q3_K_M (4,83 GB): KLD 0,038 vs 0,067; tareas 77,4 vs 76,2 |
| ShiftAddQwen-3.5-9B-3.6bits | 4,41 | 0,0564 | 75,3 | 137 | UD-Q2_K_XL (4,44 GB): KLD 0,056 vs 0,137; tareas 75,3 vs 72,8 |
| ShiftAddQwen-3.5-9B-3.2bits | 4,07 | 0,0857 | 74,8 | 143 | UD-IQ3_XXS (4,30 GB): KLD 0,086 vs 0,088; tareas 74,8 vs 74,8; 0,23 GB menos |
| ShiftAddQwen-3.5-9B-3.0bits | 3,90 | 0,1052 | 73,2 | 145 | UD-IQ2_M (3,97 GB): KLD 0,105 vs 0,150; tareas 73,2 vs 70,7 |

Tool calling y uso agéntico (llama-server parcheado, `--jinja`, thinking on, temperatura 0,6 / top-p 0,95). BFCL v4 en % de acierto; τ-bench en pass^1 sobre 2 ensayos:

| Modelo | GB | BFCL non-live ↑ | BFCL live ↑ | BFCL multi-turno ↑ | τ-bench retail ↑ | τ-bench airline ↑ |
|---|---|---|---|---|---|---|
| UnslothAI/Qwen-3.5-9B-Q4_K_M | 5,87 | 86,9 | 79,7 | 46,9 | 47,4 | 55,0 |
| ShiftAddQwen-3.5-9B-4.4bits | 5,10 | 85,9 (≈ −1,1) | 79,9 (≈ +1,8) | 43,8 (▼ −3,2) | 51,3 (▲ +3,9) | 53,0 (≈ −2,0) |
| UnslothAI/Qwen-3.5-9B-Q3_K_M | 4,83 | 86,7 (≈ −1,7) | 79,2 (≈ −0,4) | 43,4 (▼ −3,6) | 50,4 (▲ +3,0) | 46,0 (▼ −9,0) |
| ShiftAddQwen-3.5-9B-4.0bits | 4,76 | 84,8 (≈ −1,8) | 79,3 (≈ +1,9) | 43,6 (▼ −3,4) | 48,7 (≈ +1,3) | 50,0 (▼ −5,0) |

Frente a Q4_K_M, el modelo de 4,4 bits obtiene 1 victoria, 3 empates y 1 derrota; el de 4,0 bits, 0 victorias, 3 empates y 2 derrotas. La única pérdida consistente es BFCL multi-turno, unos 3 puntos por debajo de Q4_K_M en todos los modelos de tamaño inferior, incluido Q3_K_M.

## Requisitos de hardware

- GPU NVIDIA obligatoria con compute capability 6.1 o superior (los kernels usan `dp4a`). Probado en V100 (`CUDA_ARCH=70`) y A100 (`CUDA_ARCH=80`); hay que fijar `CUDA_ARCH` a la GPU propia al compilar.
- Requiere el llama.cpp parcheado del repositorio (`scripts/setup_llama.sh`, CUDA toolkit 12.x). No funciona con llama.cpp estándar, Ollama, LM Studio, wheels de llama-cpp-python, ni con los backends Metal, Vulkan o ROCm. Existe una implementación de referencia en CPU, correcta pero lenta.
- VRAM estimada ≈ tamaño del archivo + caché KV + ~0,3 GB de búferes de cómputo. Caché KV f16: 32 KB por token de contexto (1 GB a 32K, 4,2 GB a 128K, 8,4 GB a 262K); `-ctk q8_0 -ctv q8_0` la reduce a la mitad.

| Archivo | GB | 8K | 32K | 128K | 262K |
|---|---|---|---|---|---|
| ShiftAddQwen-3.5-9B-4.4bits | 5,10 | 5,7 | 6,5 | 9,7 | 14,0 |
| ShiftAddQwen-3.5-9B-4.0bits | 4,76 | 5,3 | 6,1 | 9,4 | 13,6 |
| ShiftAddQwen-3.5-9B-3.6bits | 4,41 | 5,0 | 5,8 | 9,0 | 13,3 |
| ShiftAddQwen-3.5-9B-3.2bits | 4,07 | 4,6 | 5,4 | 8,7 | 13,0 |
| ShiftAddQwen-3.5-9B-3.0bits | 3,90 | 4,5 | 5,3 | 8,5 | 12,8 |

- Cabe en GPU de consumo: cualquier variante entra en 8 GB (RTX 3070, RTX 4060, RTX 2080) a 32K de contexto; en 12 GB (RTX 3060 12 GB, RTX 4070) a 128K; y en 16 GB (RTX 4060 Ti 16 GB, RTX 4080) hasta 262K con la variante de 3,0 o 3,2 bits.
- Throughput de decodificación medido con `llama-bench` tg128 en A100: 130 tok/s (4,4 bits) a 145 tok/s (3,0 bits); las variantes más comprimidas decodifican algo más rápido. No se publican datos de prefill.
- Despliegue: `llama-server` del fork parcheado con `--jinja` para tool calling. No hay soporte documentado para vLLM, TGI ni Ollama.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Tamaño | KLD mixto ↓ | Tareas ↑ | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| ShiftAddQwen-3.5-9B-4.4bits | 9,2 B | 262K | Apache 2.0 | GGUF (`sa*`, fork) | 5,10 GB | 0,0303 | 78,2 | HF, requiere llama.cpp parcheado |
| UnslothAI/Qwen-3.5-9B-Q4_K_M | 9,2 B | 262K | Apache 2.0 | GGUF k-quant | 5,87 GB | no disponible | no disponible (BFCL non-live 86,9) | HF, llama.cpp estándar |
| UnslothAI/Qwen-3.5-9B-Q3_K_M | 9,2 B | 262K | Apache 2.0 | GGUF k-quant | 4,83 GB | 0,067 | 76,2 | HF, llama.cpp estándar |
| UnslothAI/Qwen-3.5-9B-UD-Q2_K_XL | 9,2 B | 262K | Apache 2.0 | GGUF imatrix | 4,44 GB | 0,137 | 72,8 | HF, llama.cpp estándar |
| UnslothAI/Qwen-3.5-9B-UD-IQ2_M | 9,2 B | 262K | Apache 2.0 | GGUF imatrix | 3,97 GB | 0,150 | 70,7 | HF, llama.cpp estándar |

La comparación es intencionadamente contra cuantizaciones del mismo modelo base: el autor solo publica los checkpoints que baten en KLD y tamaño a un cuant de UnslothAI de tamaño igual o mayor. El intercambio es claridad: mejor fidelidad al BF16 por GB, a cambio de perder compatibilidad con el ecosistema estándar de llama.cpp.

## Limitaciones y advertencias

- Compatibilidad rota con el ecosistema: los archivos no cargan en llama.cpp estándar ni en Ollama, LM Studio o wheels de llama-cpp-python. Tampoco hay soporte de Metal, Vulkan ni ROCm, lo que excluye Mac y GPUs AMD.
- Requiere compilar un fork con CUDA toolkit 12.x y fijar `CUDA_ARCH`; es una dependencia de mantenimiento a largo plazo si el fork deja de actualizarse.
- Pérdida medible en tool calling multi-turno: aproximadamente 3 puntos de BFCL multi-turno por debajo de Q4_K_M en todas las variantes evaluadas (43,8 y 43,6 frente a 46,9). No recomendable para agentes con diálogos de herramientas muy encadenados si se necesita paridad estricta con 4 bits estándar.
- En τ-bench airline la variante de 4,0 bits cae 5 puntos frente a Q4_K_M (50,0 vs 55,0), dentro de la franja de variabilidad reportada pero relevante en producción.
- Riesgo de alucinación: no se publican evaluaciones de veracidad, toxicidad ni sesgos; y al ser una cuantización agresiva (hasta 3,0 bits), la degradación se concentra en tareas fuera de la mezcla evaluada.
- Idiomas soportados no documentados: la evaluación multilingüe se limita a MGSM (80 ítems) y a la KL sobre texto mixto, sin lista de idiomas ni métricas por idioma. El castellano no está evaluado de forma específica.
- El proceso de cuantización depende de una asignación de bits por capa derivada de la KL; no se documentan los datos de calibración ni su dominio, lo que dificulta estimar el comportamiento en dominios muy alejados (jurídico, médico, código propietario).
- Sin datos de benchmarks del modelo base publicados en esta ficha más allá de las cuatro tareas agregadas; no hay MMLU completo, HumanEval+ ni evaluaciones de razonamiento largo.
- Adopción muy reducida: 2 likes y 2.049 descargas en el momento de la consulta, lo que implica poca validación independiente de los números reportados.
- Licencia Apache 2.0 permite uso comercial, pero las licencias de los datos de entrenamiento del modelo base no se detallan en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EcoAI-Lab/ShiftAddQwen-3.5-9B-GGUF
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio con código, método y resultados completos: https://github.com/Purdue-EcoAI/ShiftAddQwen
- Documentación del kernel de matvec: https://github.com/Purdue-EcoAI/ShiftAddQwen/blob/main/docs/shiftadd_matvec.pdf
- Resultados detallados de benchmarks agénticos: https://github.com/Purdue-EcoAI/ShiftAddQwen/blob/main/docs/results.md#agentic-benchmarks-tool-calling
- Paper de ShiftAddLLM: https://arxiv.org/abs/2406.05981
