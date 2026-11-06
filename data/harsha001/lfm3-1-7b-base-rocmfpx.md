# Harsha001/LFM3-1.7B-Base-ROCmFPX

## Resumen

LFM3-1.7B-Base-ROCmFPX es una cuantización comunitaria del modelo base LFM3-1.7B-Base de Liquid AI, publicada por el usuario Harsha001 (repositorio ROCmFPX). No se trata de un modelo nuevo, sino de una conversión a formato GGUF orientada específicamente a GPUs AMD, con tipos de peso de baja precisión implementados en un fork de llama.cpp llamado ROCmFPX. El modelo subyacente es un transformer de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) en su variante *base*, es decir, preentrenada sin ajuste conversacional.

El problema que resuelve esta publicación es la falta de opciones de cuantización optimizadas para hardware AMD (ROCm/HIP y Vulkan), en particular para iGPU y APUs como Strix Halo (gfx1151). El autor proporciona tres ficheros: un Q6 de 6 bits con tipos propietarios ROCmFPX (recomendado, 1,43 GB), un Q8_0 estándar (1,85 GB) y un Q4_K_M estándar (1,10 GB). El fichero de 6 bits logra una divergencia KL de 0,0031 frente a BF16, ligeramente mejor que un Q6_K estándar de llama.cpp (0,0039) con el mismo tamaño de archivo.

Es relevante ahora porque el soporte de LFM3 en llama.cpp llega a través del pull request #31252 y porque el ecosistema de cuantización para AMD sigue siendo menos maduro que el de NVIDIA. Aun así, conviene subrayar que estos ficheros se validaron solo en CPU y no se han probado todavía en hardware AMD real, y que no es una release oficial de Liquid AI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3 de Liquid AI; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ROCmFPX Q6_0_ROCMFPX (6 bits con escalas por tensor), Q8_0 estándar, Q4_K_M estándar; todos con importance matrix |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base LFM3-1.7B-Base más allá de su naturaleza de transformer preentrenado. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; al ser un modelo *base*, lo habitual es que no incluya ajuste por preferencias, pero este dato no se confirma en la documentación disponible. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

Lo que sí está documentado es el proceso de cuantización. Se partió de un GGUF en BF16 convertido con el script `convert_hf_to_gguf.py` del fork ROCmFPX. Se generó una importance matrix a partir del fichero BF16 usando el texto de calibración `calibration_datav3` en fragmentos de 512 tokens, y se cuantizó con `llama-quantize --imatrix` para los tres ficheros. El fichero de 6 bits se produjo con `LLAMA_ROCMFPX_TENSOR_SCALE=1`, que almacena una escala potencia de dos por tensor de pesos y se aplica en tiempo de ejecución sin configuración adicional, junto con `--token-embedding-type q6_K`. Las métricas de calidad se midieron sobre 40 fragmentos de 512 tokens del split de test de WikiText-2 frente al GGUF BF16, en CPU.

## Capacidades

- Generación de texto y continuación de texto plano: es un modelo *base*, diseñado para completar texto y para fine-tuning, no para conversación.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base LFM3-1.7B-Base, sin datos de benchmarks publicados en la información disponible.
- Generación de código y matemáticas: no se documentan evaluaciones específicas en la información proporcionada.
- Tool calling / function calling: no disponible; el modelo no está ajustado para instrucciones ni para uso de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible para esta variante base.
- Capacidades multilingües: no documentadas.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio. El autor indica que LFM3-Omni y LFM3-Audio requerirán trabajo adicional en llama.cpp upstream.

## Casos de uso

- Fine-tuning específico de dominio: al ser un modelo base de 1,7 B, sirve como punto de partida para ajuste supervisado en tareas concretas (clasificación de texto, extracción de entidades, generación de resúmenes de dominio) con requisitos de cómputo moderados.
- Autocompletado y continuación de texto en local: el fichero Q4_K_M de 1,10 GB permite ejecutar el modelo en equipos con poca memoria, por ejemplo para completar plantillas, documentación o código en entornos sin conexión.
- Prototipado en APUs e iGPU AMD: el fichero de 6 bits está pensado para Strix Halo (gfx1151) y RX 7900 (gfx1100) mediante ROCmFPX con backend Vulkan o HIP, lo que facilita experimentar con LLMs en hardware AMD integrado.
- Evaluación de técnicas de cuantización de baja precisión: los ficheros publicados incluyen métricas de divergencia KL y coincidencia de token top-1, útiles para comparar estrategias de cuantización en modelos pequeños.
- Generación de datos sintéticos para entrenamiento: un modelo base de este tamaño puede producir texto de relleno o corpus sintéticos a gran escala con bajo coste de inferencia.
- Docencia e investigación sobre LLMs: el tamaño reducido y la disponibilidad en GGUF permiten estudiar el comportamiento de un transformer de 1,7 B en laboratorios con recursos limitados.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí aporta métricas de fidelidad de cuantización frente a BF16, medidas sobre WikiText-2 (40 fragmentos de 512 tokens, CPU):

| Fichero | Tamano | Divergencia KL vs BF16 | Coincidencia token top-1 |
|---|---:|---:|---:|
| Q6_K_ROCMFPX (recomendado) | 1,43 GB | 0,0031 | 96,9% |
| Q8_0 estándar | 1,85 GB | 0,0006 | 98,7% |
| Q4_K_M estándar | 1,10 GB | 0,0267 | 92,0% |
| Q6_K estándar (referencia, no subido) | 1,43 GB | 0,0039 | 96,6% |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para Q4_K_M, 1,43 GB para el Q6 ROCmFPX y 1,85 GB para Q8_0, más el overhead del contexto y de la caché KV.
- GPU recomendadas: el autor apunta a AMD Strix Halo (gfx1151) y RX 7900 (gfx1100) para el fichero ROCmFPX. Los ficheros Q8_0 y Q4_K_M funcionan en cualquier build de llama.cpp con soporte LFM3.
- Cabe en GPU de consumo: sí, con margen amplio; cualquier GPU con 4 GB o más de VRAM debería acomodar los tres ficheros, y el Q4_K_M incluso en sistemas con poca memoria unificada.
- Opciones de despliegue: llama.cpp (los ficheros Q8_0 y Q4_K_M en builds estándar); el Q6 ROCmFPX requiere el fork HarshaVardhan3002/ROCmFPX. El autor advierte que llama.cpp estándar, LM Studio, Ollama y otras builds no ROCmFPX pueden no cargar el fichero de 6 bits.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que los ficheros se comprobaron en CPU y no se han probado en hardware AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| LFM3-1.7B-Base-ROCmFPX (este) | 1,73 B | No disponible | LFM Open License v1.0 | GGUF en Hugging Face | Cuantización comunitaria para AMD; sin benchmarks de tareas |
| LiquidAI/LFM3-1.7B-Base | 1,73 B | No disponible | LFM Open License v1.0 | Pesos originales en Hugging Face | Modelo de referencia sin cuantizar |
| LiquidAI/LFM3-1.7B | 1,73 B | No disponible | LFM Open License v1.0 | Pesos originales en Hugging Face | Variante con ajuste conversacional; recomendada por el autor para chat |
| Qwen2.5-1.5B (referencia de tamaño similar) | 1,54 B | 32.768 tokens | Apache 2.0 | Múltiples formatos y cuantizaciones | Alternativa de propósito general con licencia permisiva; datos de contexto según su model card pública |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo *base*: no está ajustado para chat ni para seguir instrucciones; usarlo en conversación produce continuaciones de texto, no respuestas.
- Los ficheros se validaron únicamente en CPU y no se han probado en hardware AMD, pese a estar diseñados para ello; el rendimiento real en ROCm/Vulkan es desconocido.
- El fichero recomendado de 6 bits requiere el fork ROCmFPX de llama.cpp; no carga en llama.cpp estándar, LM Studio ni Ollama.
- No es una release oficial de Liquid AI; la responsabilidad de la cuantización recae en el autor del repositorio.
- Licencia LFM Open License v1.0: uso comercial permitido solo a empresas con ingresos anuales inferiores a 10 millones de dólares; por encima de ese umbral no está cubierto.
- No hay datos publicados sobre sesgos, tasas de alucinación, cobertura idiomática ni longitud de contexto, lo que dificulta evaluar su idoneidad en producción.
- El Q4_K_M presenta una divergencia KL de 0,0267 y una coincidencia de token top-1 del 92,0 %, lo que implica una degradación apreciable frente a BF16 en tareas sensibles a la precisión.
- El autor descartó publicar una cuantización de 4 bits ROCmFPX porque sus tipos de 4 bits resultaron claramente peores que Q4_K_M en este modelo (divergencia KL entre 1,5 y 1,7 veces mayor).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/LFM3-1.7B-Base-ROCmFPX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Pull request de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Licencia LFM Open License v1.0: incluida como fichero LICENSE en el repositorio de Hugging Face
