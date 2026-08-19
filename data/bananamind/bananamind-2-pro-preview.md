# BananaMind/BananaMind-2-Pro-Preview

## Resumen

BananaMind-2-Pro-Preview es el primer checkpoint público de BananaMind 2 Pro, un modelo de lenguaje causal decoder-only entrenado desde cero por BananaMind. Se trata de un modelo base (no instruido ni ajustado para chat) pensado para continuar secuencias de texto, con una arquitectura transformer compacta de 138,97 millones de parámetros declarados por el autor (los pesos safetensors ocupan 159,94 millones de parámetros, discrepancia que se detalla más abajo). Este preview corresponde al paso 96.000 de optimización, tras haber visto 51.904.512.000 tokens de un entrenamiento planificado de 100.000 millones.

La relevancia de este checkpoint reside en que permite evaluar la trayectoria de entrenamiento de BananaMind 2 Pro antes de su versión final, y sirve como referencia para modelos pequeños (~140M) en tareas de razonamiento, código y lenguaje. Incluye innovaciones como un tokenizador BPE byte-level de 32.768 tokens sensible a dígitos, atención grouped-query con normalización QK, RoPE, SwiGLU, RMSNorm y embeddings de entrada/salida atados. Su ventana de contexto es de 3.072 tokens, modesta pero suficiente para tareas de completado y generación corta.

Al ser un modelo base y un preview, no está diseñado para conversación ni instrucciones directas; requiere prompts de continuación y carga con `trust_remote_code=True` debido a su arquitectura personalizada. Los resultados de benchmarks publicados corresponden exclusivamente a este checkpoint de 96K pasos y no deben considerarse definitivos para BananaMind 2 Pro final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BananaMind2Pro decoder-only Transformer (GQA, QK norm, RoPE, SwiGLU, RMSNorm, embeddings atados) |
| Parametros totales | 138.971.520 (declarados por el autor); 159.943.040 (segun pesos safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 3.072 tokens |
| Tipos de cuantizacion | No publicados oficialmente; pesos en bf16/fp32 (no se especifica) |
| Idiomas soportados | Ingles (en) |
| Licencia | bananamind-community-license-1.0 (licencia comunitaria personalizada, consultar archivo LICENSE) |
| Formato de pesos | safetensors (arquitectura custom, requiere trust_remote_code=True) |
| Capas | 24 |
| Hidden size | 640 |
| Intermediate size | 1.920 |
| Attention heads | 8 |
| KV heads | 4 |
| Head dimension | 80 |
| RoPE theta | 100.000 |
| RMSNorm epsilon | 1e-6 |
| Vocabulary size | 32.768 |
| HF architecture | `BananaMind2ProForCausalLM` |
| HF model type | `bananamind2_pro` |

## Arquitectura y entrenamiento

BananaMind-2-Pro-Preview es un transformer decoder-only de 24 capas con hidden size 640 e intermediate size 1.920. Usa atención grouped-query (8 cabezas de atención, 4 cabezas KV) con normalización QK, lo que reduce el coste de memoria del KV cache. La capa MLP emplea SwiGLU, la normalización es RMSNorm (epsilon 1e-6) y las posiciones se codifican con RoPE (theta 100.000). Los embeddings de entrada y salida están atados, y el modelo soporta generación con KV cache. El tokenizador es un BPE byte-level de 32.768 tokens con sensibilidad a dígitos, diseñado para mejorar el rendimiento en tareas numéricas y de código.

El entrenamiento es un run de preentrenamiento en curso con objetivo de 100.000 millones de tokens. Este checkpoint se capturó tras 96.000 pasos de optimizador y 51.904.512.000 tokens vistos. Los datasets declarados son `HuggingFaceFW/fineweb-edu`, `mlfoundations/dclm-baseline-1.0`, `HuggingFaceTB/smollm-corpus` y `HuggingFaceTB/finemath`, lo que sugiere una mezcla de datos educativos, web filtrada, corpus general y matemáticas. No se menciona el uso de RLHF, DPO ni ajuste por instrucciones; es un modelo base puro.

## Capacidades

- Generacion de texto por continuacion: al ser un modelo base, responde a prompts de continuacion estilo autoregresivo, sin formato de chat ni instrucciones.
- Razonamiento basico: obtiene resultados modestos en ARC Easy (51,01 %) y ARC Challenge (27,13 %), indicando capacidad limitada pero no nula para razonamiento de sentido comun.
- Competencia linguistica general: 66,76 % en PIQA y 39,83 % en HellaSwag, dentro de lo esperable para un modelo de ~140M.
- Aritmetica y matematicas simples: 38,90 % en ArithMark 3 (accuracy normalizada por longitud) y 28,60 % en ArithMark 2, lo que refleja cierta habilidad con operaciones numericas basicas gracias al tokenizador sensible a digitos.
- Generacion de codigo: 1.295 Elo en la categoria Code Only de Base Bench 1.1, con 38/50 aciertos (76,00 %) y 75,48 % de accuracy ponderada, un resultado destacable para su tamano.
- Tokenizador especializado en digitos: el BPE byte-level de 32.768 tokens esta disenado para manejar numeros y codigo de forma mas eficiente que tokenizadores genericos.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste para herramientas).
- Soporte de agentes y multi-step reasoning: no disponible de forma nativa; requeriria fine-tuning o integracion externa.
- Capacidades multilingues: no, solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no, es un modelo de texto puro.

## Casos de uso

- Experimentacion educativa e investigacion: por su tamano reducido y su naturaleza de preview, es ideal para estudiar la dinamica de entrenamiento de modelos pequenos, comparar checkpoints y analizar el efecto del tokenizador de digitos en tareas numericas. Se puede cargar con `trust_remote_code=True` en entornos de investigacion.
- Prototipado de generacion de codigo: con 1.295 Elo en Code Only, puede servir como base para prototipos de autocompletado de codigo en entornos sin GPU potente, aunque su ventana de 3.072 tokens limita el contexto de proyectos grandes.
- Generacion de texto corto: adecuado para completar frases, parrafos o textos breves en ingles en aplicaciones donde el coste computacional es critico y no se requiere calidad de modelo grande.
- Fine-tuning para tareas especificas: al ser un modelo base, puede ajustarse con datasets pequenos para clasificacion, extraccion de informacion o generacion estructurada en dominios concretos (por ejemplo, logs, formularios, datos numericos).
- Benchmarking y comparativas de modelos pequenos: su inclusion en el leaderboard de Base Bench 1.1 permite a desarrolladores comparar su rendimiento relativo con GPT-2, Pythia-160M, SmolLM-135M y otros modelos de tamano similar.
- Ensenanza de arquitecturas transformer: su arquitectura compacta y bien documentada (GQA, RoPE, SwiGLU, RMSNorm) lo convierte en un buen ejemplo didactico para cursos de deep learning y NLP.

## Benchmarks y rendimiento

Los resultados publicados corresponden al checkpoint de 96K pasos, medidos con el modelo exportado. Se comparan con modelos de tamano similar.

| Modelo | Parametros | ARC Easy | ARC Challenge | PIQA | HellaSwag | ArithMark 3 | ArithMark 2 | INT Index | Code Only | Base Bench 1.1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **BananaMind-2-Pro-Preview 96K** | **139M** | **51,01 %** | **27,13 %** | **66,76 %** | **39,83 %** | **38,90 %** | 28,60 % | 23,04 | **1295** | **1106** |
| GPT-X2-125M | 125M | 51,47 % | 27,82 % | 67,30 % | 40,41 % | 37,20 % | **30,68 %** | 23,36 | 1078 | 1062 |
| GPT-X-125M | 125M | 50,76 % | 26,62 % | 64,96 % | 36,57 % | 35,60 % | 30,24 % | 19,94 | 916 | 1013 |
| SmolLM-135M | 135M | **56,31 %** | **29,01 %** | **68,28 %** | **42,70 %** | 36,80 % | 28,84 % | **25,74** | **1585** | **1125** |
| BananaMind-2-Medium | 49,6M | 43,81 % | 25,34 % | 61,86 % | 32,43 % | 36,20 % | 28,20 % | 15,37 | 1269 | 1034 |
| GPT-2 | 124M | 39,35 % | 22,35 % | 62,08 % | 31,26 % | 35,70 % | 26,48 % | N/A | 1052 | 996 |
| Pythia-160M | 160M | 39,81 % | 24,23 % | 61,75 % | 30,05 % | N/A | N/A | N/A | N/A | N/A |

Notas: ARC Easy, ARC Challenge, PIQA y HellaSwag usan `acc_norm,none`. ArithMark 3 usa accuracy de continuacion normalizada por longitud; ArithMark 2 usa accuracy de continuacion cruda. INT Index es el agregado estilo Open SLM Leaderboard. Code Only es la categoria de completado de codigo de Base Bench 1.1 (Elo), y Base Bench 1.1 es el Elo global de items fijos. Los valores en negrita indican la mejor puntuacion de cada metrica. El preview de BananaMind destaca en ArithMark 3 y Code Only, mientras que SmolLM-135M lidera en la mayoria de las metricas de lenguaje general.

Tambien se publica la relacion entre compute de entrenamiento estimado e INT Index:

| Modelo | Compute de entrenamiento estimado | INT Index |
|---|---:|---:|
| BananaMind-2-Pro-Preview | 72.669,44 PFLOPs | 23,04 |
| GPT-X2-125M | 56.286,75 PFLOPs | 23,36 |
| GPT-X-125M | 11.210,56 PFLOPs | 19,94 |
| SmolLM-135M | 484.254,03 PFLOPs | 25,74 |
| BananaMind-2-Medium | 14.867,33 PFLOPs | 15,37 |

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para este modelo. Las siguientes son estimaciones razonables basadas en su tamano (139M-160M de parametros):

- VRAM estimada para inferencia: con pesos en bf16 (2 bytes por parametro), ~280-320 MB; en fp32, ~560-640 MB. Con cuantizacion a int8 (~1 byte por parametro), ~140-160 MB. Cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, GTX 1650, RTX 2060, RTX 3060, RTX 4090). Tambien es viable en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, es un modelo muy pequeno; incluso una GPU integrada o una Raspberry Pi con suficiente RAM podria ejecutarlo, aunque con latencia alta.
- Opciones de despliegue: al usar arquitectura custom, requiere `trust_remote_code=True` en transformers. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI; habria que verificar si estas herramientas soportan la arquitectura `BananaMind2ProForCausalLM`. En caso contrario, la opcion mas fiable es transformers con PyTorch.
- Latencia y throughput estimados: no disponibles. En una GPU moderna (RTX 3090 o superior), la generacion de tokens deberia ser de decenas a cientos de tokens por segundo dada su pequenez, pero no hay datos oficiales.

## Comparativa con modelos similares

El modelo se posiciona en la categoria de small language models (~100-200M de parametros). Comparacion con alternativas directas:

| Modelo | Parametros | Contexto | Tokenizer | Arquitectura | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|---|
| BananaMind-2-Pro-Preview | 139M (declarados) / 160M (safetensors) | 3.072 | BPE byte-level 32.768, sensible a digitos | Transformer decoder-only con GQA, RoPE, SwiGLU | bananamind-community-license-1.0 | HuggingFace, preview |
| SmolLM-135M | 135M | 2.048 | GPT-2 tokenizer (50.257) | Transformer decoder-only | Apache 2.0 | HuggingFace, estable |
| GPT-2 (124M) | 124M | 1.024 | BPE 50.257 | Transformer decoder-only | MIT | HuggingFace, estable |
| Pythia-160M | 160M | 2.048 | BPE 50.254 | Transformer decoder-only | Apache 2.0 | HuggingFace, estable |
| GPT-X2-125M | 125M | no disponible | no disponible | no disponible | no disponible | HuggingFace |

En los benchmarks publicados, SmolLM-135M supera a BananaMind-2-Pro-Preview en la mayoria de metricas de lenguaje (ARC Easy, ARC Challenge, PIQA, HellaSwag e INT Index) y tambien en Code Only (1585 vs 1295 Elo). BananaMind-2-Pro-Preview gana en ArithMark 3 (38,90 % vs 36,80 %) y en Base Bench 1.1 global (1106 vs 1125, aunque SmolLM lidera con 1125). Frente a GPT-2 y Pythia-160M, el preview de BananaMind muestra ventajas claras en todas las metricas comparables, lo que indica una mejora sustancial sobre arquitecturas clasicas. GPT-X2-125M es su rival mas cercano en INT Index (23,36 vs 23,04), aunque BananaMind supera en Code Only y Base Bench.

## Limitaciones y advertencias

- Es un checkpoint preview, no la version final de BananaMind 2 Pro. Los resultados de benchmarks corresponden al paso 96K y pueden variar sustancialmente al completar el entrenamiento de 100B tokens.
- Es un modelo base, no instruido ni ajustado para chat. Intentar usarlo con prompts de instruccion dara resultados pobres; requiere prompts de continuacion.
- Ventana de contexto limitada a 3.072 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o repositorios de codigo grandes.
- Solo soporta ingles. No se garantiza rendimiento en otros idiomas.
- Discrepancia en el numero de parametros: el autor declara 138.971.520, pero los pesos safetensors contienen 159.943.040. Esta diferencia no esta explicada en la documentacion y debe tenerse en cuenta al planificar recursos.
- Tokenizador custom (BPE byte-level de 32.768 tokens con sensibilidad a digitos) y arquitectura personalizada (`BananaMind2ProForCausalLM`). Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor no auditado por HuggingFace. Riesgo de seguridad en entornos de produccion.
- Licencia `bananamind-community-license-1.0` personalizada. Los terminos exactos no estan detallados en la informacion disponible; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Riesgo de alucinacion y sesgos: al ser un modelo pequeno entrenado principalmente con datos web filtrados (fineweb-edu, dclm), puede generar contenido incorrecto o sesgado. No se han publicado evaluaciones de sesgo o toxicidad.
- No se menciona soporte para tool calling, agentes, ni capacidades multimodales. No apto para tareas que requieran interaccion con APIs o razonamiento multi-paso sin fine-tuning adicional.
- Compatibilidad limitada con herramientas de despliegue estandar (vLLM, Ollama, TGI) debido a la arquitectura custom; puede requerir desarrollo adicional para servir en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BananaMind/BananaMind-2-Pro-Preview
- Version nueva (BananaMind-2-Pro): https://huggingface.co/BananaMind/BananaMind-2-Pro (referenciada en la model card como `new_version`)
- Modelo relacionado BananaMind-2-Medium: https://huggingface.co/BananaMind/BananaMind-2-Medium
- Modelo comparado GPT-X2-125M: https://huggingface.co/AxiomicLabs/GPT-X2-125M
- Modelo comparado GPT-X-125M: https://huggingface.co/AxiomicLabs/GPT-X-125M
- Modelo comparado SmolLM-135M: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Modelo comparado GPT-2: https://huggingface.co/openai-community/gpt2
- Modelo comparado Pythia-160M: https://huggingface.co/EleutherAI/pythia-160m

No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
