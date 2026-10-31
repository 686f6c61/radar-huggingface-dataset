# Digilidaahz/Freedream-1B-Instruct-V1

## Resumen

Freedream-1B-Instruct-V1 es un modelo de lenguaje de aproximadamente 977 millones de parámetros entrenado completamente desde cero por Digilidaahz, un desarrollador independiente. No se trata de un ajuste fino de Llama, Qwen u otro modelo existente, sino de una arquitectura GPT propia construida desde el principio, algo notable dado que todo el proceso de pre-entrenamiento y ajuste se realizó en una única GPU de consumo (RTX 5080 de 16 GB de VRAM).

El modelo responde al interés creciente por demostrar que es posible entrenar SLM (Small Language Models) viables con recursos limitados. El pre-entrenamiento usó 20B tokens del dataset FineWeb, y la versión Instruct se ajustó con el dataset SmolTalk más datos propios de razonamiento en cadena (CoT) y de identidad. Su contexto es de 4096 tokens y su arquitectura es un transformer decoder-only con SwiGLU, RoPE y embeddings con pesos compartidos.

Es relevante como proyecto educativo y de investigación: sus resultados son modestos (30,46% en ARC-Challenge frente al ~59% de Llama-3.2-1B), pero demuestran que un modelo desde cero entrenado en hardware doméstico puede superar de forma estadísticamente significativa el azar. No es apto para producción en tareas de matemáticas, código o hechos factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 977.300.992 (~977M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | no disponible (tamano del repo: 7,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 24 capas, tamaño oculto de 1792, 16 cabezas de atención, activación SwiGLU, codificación posicional RoPE y embeddings con pesos compartidos (weight-tied). Utiliza un tokenizador propio y un formato de prompt personalizado con las marcas `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`.

El entrenamiento se dividió en dos fases: pre-entrenamiento del modelo base con exactamente 20B tokens del dataset FineWeb, y ajuste fino supervisado (SFT) con una mezcla curada de SmolTalk (seguimiento de instrucciones, razonamiento y código), datos personalizados de matemáticas con Chain-of-Thought y datos de identidad. No se aplicó RLHF ni alineación de seguridad. En cuanto a ingeniería, el autor implementó un DataPrefetcher asíncrono con lecturas aleatorias por bloques de 16 MB y doble buffering para evitar cuellos de botella de I/O, y logró un rendimiento sostenido de 21.000 tokens/seg durante el pre-entrenamiento mediante precisión mixta FP8 y AdamW8bit, sorteando además las limitaciones de la arquitectura Blackwell (sm_120), incluido el abandono de NVFP4 por falta de instrucciones `.rs` en Triton.

## Capacidades

- Generacion de texto conversacional coherente en ingles (version V1.1), gracias al ajuste con SmolTalk
- Creacion de literatura: poemas y relatos
- Seguimiento basico de instrucciones en formato multi-turno (system/user/assistant)
- Razonamiento linguistico y semantico por patrones, no logico (30,46% en ARC-Challenge, por encima del azar del 25%)
- Escritura de funciones basicas de Python (limitada; no apto para sistemas complejos)
- Aritmetica muy basica, con riesgo elevado de bucles y alucinaciones matematicas
- Sin soporte documentado de tool calling, function calling ni capacidades agenticas
- Sin capacidades de vision ni audio
- Sin soporte documentado de thinking mode ni decodificacion especulativa

## Casos de uso

- Investigacion educativa sobre entrenamiento desde cero: el modelo y su pipeline documentado (FP8, AdamW8bit, prefetcher propio) sirven como referencia para estudiar como entrenar un SLM en una sola GPU de consumo.
- Experimentacion con SLM en hardware modesto: con ~977M de parametros puede ejecutarse en GPUs de consumo e incluso en CPU, util para prototipado local sin dependencias de modelos propietarios.
- Generacion creativa de literatura en ingles: puede redactar poemas y relatos, un caso donde sus limitaciones factuales importan menos.
- Chatbot conversacional basico en ingles: mantiene dialogos coherentes multi-turno con el formato de prompt propio, adecuado para demos y pruebas de concepto.
- Estudio de alucinaciones y deriva de identidad: el autor documenta fallos concretos (nombres como "Frey" o "Freeman"), lo que lo hace util como caso de estudio sobre overfitting en datos de identidad.
- Base para ajustes fines adicionales: al ser un modelo base propio con pesos abiertos, puede usarse como punto de partida para SFT experimentales en dominios concretos.
- Evaluacion con lm-evaluation-harness: reproducible como benchmark de referencia para comparar SLM entrenados con recursos limitados.

## Benchmarks y rendimiento

Datos publicados por el autor (version V1.1, lm-evaluation-harness, 0-shot):

| Benchmark | Metrica | Puntuacion | Notas |
|---|---|---|---|
| ARC-Challenge | acc | 28,33% | |
| ARC-Challenge | acc_norm | 30,46% | Error estandar: 1,34% |

Comparativa de contexto citada por el autor:

| Modelo | ARC-Challenge (0-shot) | Tokens de entrenamiento | Hardware |
|---|---|---|---|
| Freedream-1B (V1.1) | 30,46% | 20B | 1x RTX 5080 |
| Llama-3.2-1B | ~59,4% | 15T | Computo a gran escala |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con ~977M de parametros en FP16 se requieren aproximadamente 2 GB, y en cuantizaciones de 8 o 4 bits menos de 1-1,5 GB (estimacion, no confirmada por el autor)
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente para inferencia; el entrenamiento original se realizo en una RTX 5080 de 16 GB con 64 GB de DDR5
- Cabe con holgura en GPUs de consumo (RTX 3060, 4060, 4090, etc.) y probablemente en CPU, aunque no hay datos de rendimiento publicados
- Opciones de despliegue: no disponible de forma explicita; al usar un tokenizador y formato propios, la compatibilidad con llama.cpp, Ollama o vLLM no esta garantizada; transformers de HuggingFace es la via documentada
- Latencia y throughput: no disponibles para inferencia; en pre-entrenamiento se alcanzaron 21.000 tokens/seg en la RTX 5080

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-Challenge (0-shot) | Licencia | Entrenamiento |
|---|---|---|---|---|---|
| Freedream-1B-Instruct-V1.1 | ~977M | 4096 | 30,46% | CreativeML OpenRAIL-M | 20B tokens, desde cero |
| Llama-3.2-1B-Instruct | ~1,2B | 128K | ~59,4% | Licencia Llama 3.2 | 15T tokens |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K | no disponible | Apache 2.0 | no disponible |

Freedream queda claramente por detras de las alternativas comerciales en capacidad, pero su valor esta en la reproducibilidad del entrenamiento en hardware de consumo y en la licencia OpenRAIL-M, mas permisiva que la de Llama para ciertos usos.

## Limitaciones y advertencias

- Sesgos conocidos: no se aplico RLHF ni alineacion de seguridad; el modelo puede generar contenido sesgado o inapropiado si se le induce
- Riesgo de alucinacion alto: alucina en hechos, matematicas y codigo; la version V1.1 alucina frecuentemente su propio nombre ("Frey", "Freeman") por overfitting en datos de identidad
- Matematicas: puede entrar en bucles aritmeticos bajo prompts abstractos zero-shot; no debe usarse como calculadora
- Codigo: solo funciones basicas de Python; no apto para desarrollo de software real
- Contexto: 4096 tokens, muy por debajo de alternativas actuales (32K-128K)
- Idioma: solo ingles; sin soporte documentado de castellano ni otros idiomas
- Licencia: CreativeML OpenRAIL-M incluye restricciones de uso (clausulas de uso responsable); revisar los terminos antes de uso comercial
- Uso recomendado: exclusivamente investigacion y educacion, segun el propio autor; no apto para produccion
- Formato de prompt: requiere el formato exacto `<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`; el uso de otro formato puede degradar el comportamiento

## Enlaces

- Modelo Instruct: https://huggingface.co/Digilidaahz/Freedream-1B-Instruct-V1
- Modelo base: https://huggingface.co/Digilidaahz/Freedream_1B_BaseModel
