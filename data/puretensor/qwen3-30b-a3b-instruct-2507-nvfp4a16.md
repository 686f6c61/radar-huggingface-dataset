# puretensor/Qwen3-30B-A3B-Instruct-2507-NVFP4A16

## Resumen

Qwen3-30B-A3B-Instruct-2507-NVFP4A16 es una cuantización de 4 bits (W4A16) del modelo Qwen3-30B-A3B-Instruct-2507 de Alibaba Qwen, publicada por el usuario PureTensor. Se trata de un modelo de mezcla de expertos (MoE) con 30.532 millones de parámetros totales y 128 expertos por bloque, de los cuales se activan 8 por token. El checkpoint reduce el peso en disco de 61,08 GB (BF16) a 18,09 GB, manteniendo las activaciones en 16 bits.

El interés de esta ficha radica en que es una release de prueba, no afiliada ni respaldada por los autores originales del modelo. El autor documenta con detalle el proceso de cuantización GPTQ, la calibración de expertos y las métricas de degradación (MMLU -0,46 puntos, perplejidad WikiText-2 +0,14), así como una advertencia operativa crítica: cargar el checkpoint con Transformers de forma convencional produce salidas incorrectas sin error, por lo que debe servirse con vLLM.

El modelo resuelve el problema de desplegar un MoE de 30B en hardware con memoria limitada, con una mejora de throughput de 1,42x a 2,27x frente a BF16 en vLLM sobre GPU Blackwell. Su relevancia es principalmente práctica para evaluación de pipelines de cuantización NVFP4, no como sustituto canónico del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), 48 bloques, 128 expertos por bloque, 8 activos por token |
| Parametros totales | 30.532.122.624 |
| Parametros activos | 8 expertos de 128 por token (no se especifica el conteo exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): valores 4-bit E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ con block_size 128, dampening_frac 0.01, actorder static |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 48 bloques y 128 expertos por bloque, de los que el router selecciona 8 por token. La cuantización se aplica a las proyecciones de atención y a las 18.432 capas de expertos; se mantienen en BF16 los routers de expertos, los embeddings de tokens, la cabeza de salida, todas las normas y todas las activaciones. El método es GPTQ con tamaño de bloque 128, fracción de amortiguamiento 0,01 y orden de activación estático.

La calibración usa 512 muestras en formato chat de `mlabonne/open-perfectblend`, de hasta 2.048 tokens cada una. La innovación documentada es el esquema de calibración de expertos: cada token de calibración pasa por todos los expertos, y los tokens que el router no envió a un experto cuentan con peso 0,1 en las estadísticas de ese experto. El autor compara tres variantes (todos los tokens, mezcla con peso 0,1 y solo tokens enrutados) y concluye que con 512 muestras las diferencias no son significativas en tareas (p entre 0,47 y 0,76), aunque la mezcla obtiene la menor divergencia KL. Herramientas empleadas: llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen3-30B-A3B-Instruct-2507.
- Razonamiento y resolución de problemas matemáticos: el autor reporta 89,46 en GSM8K servido con vLLM.
- Conocimiento general y respuesta a preguntas de opción múltiple: 79,66 en MMLU.
- Capacidad multilingüe: no disponible en la información proporcionada (los idiomas del modelo base no se detallan en la model card).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Inferencia eficiente en vLLM mediante el kernel weight-only FP4 `MarlinNvFp4LinearKernel`.

## Casos de uso

- Despliegue de un MoE de 30B en una sola GPU: el checkpoint ocupa 18,09 GB, frente a 61,08 GB en BF16, lo que permite servirlo en GPUs con 24 GB de VRAM o más usando vLLM con el kernel FP4.
- Servicio conversacional de alto throughput: con 8 peticiones concurrentes el autor mide 2,27x el throughput de BF16, adecuado para endpoints de chat con generaciones de 256 tokens.
- Evaluación de pipelines de cuantización NVFP4: sirve como referencia reproducible para comparar recetas GPTQ, calibración de expertos y esquemas W4A16 frente al modelo BF16.
- Prototipado de asistentes con requisitos de memoria ajustados: al reducir el peso a un tercio, permite iterar en workstations con una sola GPU Blackwell sin clúster multi-GPU.
- Investigación sobre degradación por cuantización en MoE: el autor publica métricas de divergencia KL, acuerdo de routing (95,3% de media) y tests pareados McNemar que permiten estudiar el impacto por bloque.
- Pruebas de integración con vLLM: el checkpoint valida el funcionamiento del kernel `MarlinNvFp4LinearKernel` y del formato compressed-tensors en versiones recientes de vLLM (0.34.0).

## Benchmarks y rendimiento

| Metrica | BF16 | Este checkpoint | Cambio |
|---|---:|---:|---:|
| MMLU, accuracy (14.042 preguntas) | 80,12 | 79,66 | -0,46 (p = 0,003) |
| GSM8K vía API completions de vLLM (1.319 problemas) | 88,70 | 89,46 | +0,76 (dentro del ruido) |
| Perplejidad WikiText-2 (130.944 tokens) | 7,67 | 7,81 | +0,14 |

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test | 130.944 | 0,028 | 0,29 | 93,1% |
| Chat (ultrachat_200k, test_sft, 256 conversaciones) | 224.043 | 0,023 | 0,28 | 94,6% |

| Rendimiento en vLLM 0.34.0 (GPU Blackwell, cc 12.0) | BF16 | Este checkpoint |
|---|---:|---:|
| Throughput, stream único | 1,00x | 1,42x |
| Throughput, 8 concurrentes | 1,00x | 2,27x |
| Throughput, 32 concurrentes | 1,00x | 1,86x |

El autor advierte que las puntuaciones de benchmark pueden variar uno o dos puntos entre calibraciones de la misma receta, y que estos resultados corresponden a una sola extracción. También señala que un build público de 4 bits completo (pesos y activaciones) corrió a la misma velocidad (0,93x a 0,97x) y obtuvo 87,41 en GSM8K, por lo que cuantizar activaciones no aportó velocidad y costó precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,09 GB de pesos, más overhead de activaciones y caché KV; requiere GPU con al menos 24 GB para un despliegue holgado.
- GPU recomendadas: el autor valida en una GPU de workstation NVIDIA Blackwell (compute capability 12.0); el kernel `MarlinNvFp4LinearKernel` de vLLM requiere soporte FP4.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer en la información proporcionada; el soporte depende del kernel FP4 de vLLM y de la generación de la GPU.
- Opciones de despliegue: vLLM 0.34.0 es el motor validado. Cargar el checkpoint con Transformers de forma convencional produce salidas incorrectas sin error, según el autor.
- Latencia y throughput: 1,42x en stream único, 2,27x con 8 concurrentes y 1,86x con 32 concurrentes frente a BF16, con generaciones greedy fijas de 256 tokens. El autor indica que el rendimiento variará en otro hardware.
- llama.cpp, Ollama y TGI: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este checkpoint (NVFP4A16) | 30,53B (MoE, 8/128 activos) | no disponible | 79,66 | 89,46 | apache-2.0 | safetensors, compressed-tensors |
| Qwen3-30B-A3B-Instruct-2507 BF16 | 30,53B (MoE, 8/128 activos) | no disponible | 80,12 | 88,70 | apache-2.0 | safetensors |
| Build público 4-bit completo (pesos y activaciones, RTN) | 30,53B (MoE) | no disponible | no disponible | 87,41 | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor; no se dispone de datos de modelos alternativos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Release de prueba no afiliada ni respaldada por los autores originales del modelo.
- Cargar el checkpoint con Transformers de forma convencional produce salidas incorrectas sin lanzar ningún error; debe servirse con vLLM.
- Degradación medible en MMLU (-0,46 puntos, estadísticamente significativa con p = 0,003) y aumento de perplejidad en WikiText-2 (+0,14).
- El acuerdo de routing con BF16 es del 95,3% de media, con un mínimo de 93,4% en el peor bloque, lo que implica que aproximadamente 1 de cada 20 tokens activa expertos distintos.
- Los resultados de benchmark provienen de una sola extracción de calibración y pueden variar uno o dos puntos con otra semilla.
- La fila de divergencia KL en chat es favorable porque el conjunto de chat comparte familia de dataset con los datos de calibración (filas distintas), según reconoce el autor.
- Idiomas soportados, sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada.
- Restricciones de licencia: apache-2.0, sin restricciones comerciales adicionales documentadas en la información disponible.
- Compatibilidad con GPU consumer y con motores distintos de vLLM: no confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puretensor/Qwen3-30B-A3B-Instruct-2507-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Referencias citadas en los tags: arXiv:2310.16795, arXiv:2505.03804, arXiv:2508.01625, arXiv:2606.05688 (no se detalla su correspondencia en la información proporcionada)
