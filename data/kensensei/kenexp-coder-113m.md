# KenSensei/KenExp-Coder-113M

## Resumen

KenExp-Coder-113M es un modelo de lenguaje de pequeno tamano (SLM) de 113,36 millones de parametros totales y aproximadamente 37 millones de parametros activos por token, desarrollado por el usuario KenSensei y publicado bajo licencia Apache 2.0. Esta construido desde cero en PyTorch y esta orientado a generacion de codigo, depuracion y comprension de codigo con contexto largo, con una ventana de 24.576 tokens. Su interes principal es experimental: aplica en un modelo diminuto tecnicas de arquitectura y optimizacion propias de modelos mucho mayores, como Mixture-of-Experts con enrutado sin perdida auxiliar, hiperconexiones con restriccion de variedad (mHC) y el optimizador Muon.

El modelo combina una columna vertebral densa con un experto compartido y ocho expertos enrutados de los que se activan dos por token, atencion GQA con 10 cabezas de consulta y 2 de clave-valor, y RoPE con base 1.000.000 para soportar los 24K tokens de contexto. Se entreno en tres etapas sobre codeparrot-clean, fineweb-edu y un dataset de trazas de depuracion, con un total aproximado de 88 millones de tokens de preentrenamiento y 3.000 trayectorias de ajuste supervisado.

Es relevante ahora porque demuestra que es viable entrenar de extremo a extremo una arquitectura MoE con tecnicas modernas en una unica RTX 4090 en unos 40 minutos, lo que lo convierte en una referencia util para investigacion sobre arquitecturas eficientes y para tareas ligeras de codigo en local con un consumo de VRAM inferior a 500 MB en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE de grano fino, GQA y residuales mHC de 4 flujos |
| Parametros totales | 113.360.480 (~113,4 M) |
| Parametros activos | ~37 M por token (columna densa + experto compartido + top-2 expertos enrutados) |
| Longitud de contexto | 24.576 tokens (24K) |
| Tipos de cuantizacion | No disponible (checkpoint publicado en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, ~226,8 MB en model.safetensors); repo de 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 10 bloques con dimension oculta de 640. La atencion es Grouped-Query Attention con 10 cabezas de consulta, 2 cabezas de clave-valor y dimension de cabeza 64, lo que reduce el cache KV en un factor 5:1. La topologia residual sustituye el flujo residual unico por cuatro flujos paralelos mezclados mediante una proyeccion doblemente estocastica de Sinkhorn-Knopp con 5 iteraciones (mHC). La capa de alimentacion es un MoE con un experto SwiGLU compartido (inter_dim 640) y ocho expertos enrutados SwiGLU (inter_dim 384) de los que se activan los dos mejores por token, con un sesgo de enrutado ajustado dinamicamente para equilibrar carga sin perdida auxiliar. El tokenizador es tiktoken con BPE estilo GPT-2 y vocabulario de 50.304 entradas.

El entrenamiento se estructuro en tres etapas. La primera, de preentrenamiento de codigo y razonamiento con contexto de 2.048 tokens y rope_base 10.000, uso un 85 % de codeparrot-clean y un 15 % de fineweb-edu sample-10BT, con unos 82 millones de tokens en 2.500 pasos de 32.768 tokens. La etapa 1.5 extendio el contexto a 24.576 tokens con rope_base 1.000.000 sobre unos 6 millones de tokens en 120 pasos de 49.152 tokens, con checkpointing de activaciones y entropia cruzada por trozos. La etapa 2 fue un ajuste supervisado agentico sobre 3.000 trayectorias de depuracion del dataset fable-5-coding-and-debugging-traces, con enmascaramiento de perdida solo en el turno final del asistente. La optimizacion combino Muon (momentum ortogonalizado con Newton-Schulz de 5 pasos) en matrices 2D ocultas y AdamW en embeddings, parametros de RMSNorm, enrutadores y matrices mHC. Todo el entrenamiento se ejecuto en una unica RTX 4090 de 24 GB en aproximadamente 40 minutos.

## Capacidades

- Generacion de codigo Python: funciones, estructuras de datos y soluciones algoritmicas.
- Depuracion y reparacion de codigo: identificacion de errores de borde (limites off-by-one, terminacion de bucles) y emision de correcciones completas.
- Razonamiento paso a paso en tareas de codigo y depuracion multi-turno.
- Comprension de contexto largo: ingestion de prompts multiarchivo y trazas de hasta 24.576 tokens con cache KV reducido.
- Generacion de texto tecnico en ingles.
- Perfil de despliegue ligero: inferencia por debajo de 500 MB de VRAM en bfloat16.
- No se documenta soporte explicito de tool calling, function calling ni uso como agente autonomo mas alla del ajuste sobre trazas de depuracion.

## Casos de uso

- Autocompletado de codigo en local: el modelo puede generar funciones y fragmentos Python en entornos de desarrollo con recursos limitados, ya que ocupa menos de 500 MB de VRAM en bfloat16 y responde con baja latencia en GPU de consumo.
- Deteccion y correccion de errores en revisiones de codigo: gracias a su ajuste sobre trazas de depuracion multi-turno, puede analizar un fragmento, senalar el fallo y emitir una version corregida completa sin truncar.
- Analisis de repositorios pequenos o ficheros largos: con 24.576 tokens de contexto puede recibir varios ficheros o una traza de ejecucion extensa y razonar sobre dependencias entre ellos.
- Asistente de aprendizaje de algoritmos: util para explicar estructuras de datos y resolver ejercicios paso a paso en ingles, con un coste computacional minimo.
- Prototipado e investigacion de arquitecturas: sirve como banco de pruebas reproducible para estudiar MoE con enrutado sin perdida auxiliar, mHC y el optimizador Muon en una sola GPU.
- Despliegue en entornos con CPU o GPU integrada: al ser un SLM de 113 M de parametros, puede ejecutarse en portatiles y dispositivos sin GPU dedicada para tareas de generacion de codigo de baja complejidad.
- Generacion de tests unitarios sencillos: puede producir casos de prueba para funciones Python a partir de su firma y docstring, integrable en pipelines locales de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 500 MB en bfloat16 segun el autor; el checkpoint pesa 226,8 MB en safetensors.
- GPU de entrenamiento documentada: 1x NVIDIA GeForce RTX 4090 (24 GB GDDR6X, CUDA 13.0).
- Cabe en cualquier GPU de consumo moderna (RTX 3060 en adelante, e incluso GPUs con 4 GB o menos) y en CPU.
- Opciones de despliegue: el autor no documenta integraciones con vLLM, llama.cpp, Ollama o TGI; al publicarse solo pesos PyTorch/safetensors, el despliegue requeriria cargar el modelo con la implementacion del autor o convertir los pesos.
- Throughput de entrenamiento documentado: entre 50.000 y 80.000 tokens por segundo en la etapa de preentrenamiento sobre la RTX 4090.
- Latencia de inferencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| KenExp-Coder-113M | 113,4 M totales / ~37 M activos | 24.576 | Apache 2.0 | MoE experimental con Muon y mHC; solo ingles |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | Modelo denso de Hugging Face orientado a uso general y local |
| Qwen2.5-Coder-0.5B | 500 M | 32.768 | Apache 2.0 | Denso, multilingue y con benchmarks publicados de codigo |
| DeepSeek-Coder-1.3B | 1.300 M | 16.384 | Licencia propia de DeepSeek | Denso, orientado a codigo, con evaluacion publica |

Los datos de SmolLM2-135M, Qwen2.5-Coder-0.5B y DeepSeek-Coder-1.3B provienen de conocimiento general y no de la informacion proporcionada sobre KenExp-Coder-113M; no se dispone de comparaciones de rendimiento publicadas entre ellos y este modelo.

## Limitaciones y advertencias

- Escala SLM: con 113,4 M de parametros totales y unos 88 M de tokens de preentrenamiento, el modelo esta pensado para investigacion y tareas ligeras, no como sustituto de modelos de codigo de mayor tamano.
- Solo soporta ingles; no se documenta capacidad multilingue.
- Riesgo de alucinacion y de generar codigo incorrecto o incompleto en tareas complejas, dado el volumen reducido de datos de entrenamiento.
- No se documentan evaluaciones de sesgo; al entrenarse sobre codeparrot-clean y fineweb-edu puede heredar sesgos de esas fuentes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no garantiza calidad para produccion.
- El ajuste supervisado se realizo sobre un dataset de trazas (DSFFGFG456/fable-5-coding-and-debugging-traces) de procedencia no verificada, lo que introduce incertidumbre sobre la calidad y diversidad de las respuestas aprendidas.
- No se documentan formatos de cuantizacion ni integraciones con motores de inferencia estandar, lo que anade trabajo de adaptacion para desplegarlo.
- El modelo no incluye mecanismos documentados de tool calling ni de seguridad en la generacion.

## Enlaces

- Hugging Face: https://huggingface.co/KenSensei/KenExp-Coder-113M
- Dataset de preentrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de ajuste supervisado: https://huggingface.co/datasets/DSFFGFG456/fable-5-coding-and-debugging-traces
