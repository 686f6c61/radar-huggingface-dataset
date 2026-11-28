# qwegnai/GLM-5.3-Flash-QWP-Mixed

## Resumen

GLM-5.3-Flash-QWP-Mixed es un pack de pesos cuantizados del modelo zai-org/GLM-5.3-Flash, publicado por el usuario qwegnai. No es un modelo nuevo ni un fine-tune: es una compresion del GLM-5.3-Flash original (321,32 B de parametros totales, ~18 B activos) mediante la tecnica Spherical Hadamard Vector Quantization (SHVQ, `arXiv:2611.09501`), desarrollada por el propio autor. El pack esta disenado exclusivamente para el motor de inferencia Qwegn, un runtime Swift + Metal 4 para Apple Silicon.

El objetivo del pack es hacer que un modelo MoE de 321 B quepa integramente en la memoria unificada de un Mac de 128 GB, eliminando el paging a SSD y el swap del sistema operativo. Para ello comprime los pesos a 2,69 bits por parametro de media (100,63 GiB), un 25,1% menos que la alternativa HQ4+HQ3 (134,37 GiB). Segun la model card, los 288/288 expertos por capa residen al 100% en memoria unificada.

Es relevante para desarrolladores que trabajen en inferencia local sobre Apple Silicon y necesiten ejecutar modelos de gran escala con contexto largo (202.752 tokens nativos, hasta 1M en configuracion UMA). El modelo base usa una arquitectura hibrida MoE con atencion MLA y KDA, y el pack incluye decodificacion especulativa NextN MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 45 capas (3 densas + 42 MoE con 288 expertos cada una, 8 enrutados + 1 compartido activos), 11 capas NoPE MLA (KV latente de 512-d + Key-Pool(4)) + 34 capas KDA de atencion lineal, 4-stream Sinkhorn-20 mHC, NextN MTP (capa 45), vision tower de 24 bloques |
| Parametros totales | 321,32 B |
| Parametros activos | ~18 B |
| Longitud de contexto | 202.752 tokens nativos; hasta 1.048.576 tokens en configuracion UMA (con MLA Key-Pool(4) sparse indexer, k=2048, y e-means-4096) |
| Tipos de cuantizacion | SHVQ4_G32 (4,50 bpw), SHVQ2_G64 (2,25 bpw), SHVQ3_G64 (3,25 bpw) y BF16 (16,00 bpw); media de 2,69 bits/parametro |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | QWP1 (contenedor propio del motor Qwegn); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura hibrida que combina 11 capas de atencion MLA sin positional encoding (NoPE) con KV latente de 512 dimensiones y Key-Pool(4), junto con 34 capas de atencion lineal KDA. El bloque MoE consta de 42 capas con 288 expertos cada una, de los cuales se activan 8 enrutados mas 1 compartido, lo que resulta en ~18 B de parametros activos sobre 321,32 B totales. Incorpora un modulo NextN MTP (Multi-Token Prediction) en la capa 45 para decodificacion especulativa, y un vision tower de 24 bloques.

La innovacion principal de este pack es la cuantizacion SHVQ: cada grupo de pesos se rota mediante una transformada ortogonal de Walsh-Hadamard y se cuantiza vectorialmente en coordenadas esfericas 4D usando codebooks `e-means` profundos con balance de capacidad. La asignacion de precision es asimetrica: los expertos enrutados `gate_proj` y `up_proj` (64,66% de los parametros) usan SHVQ2_G64 a 2,25 bpw; `down_proj` (32,33%) usa SHVQ3_G64 a 3,25 bpw; las capas densas, MLA, KDA, expertos compartidos, NextN MTP y `lm_head` (2,58%) usan SHVQ4_G32 a 4,50 bpw; y embeddings, vision tower, routers y norms (0,43%) se mantienen en BF16. El autor no proporciona datos sobre el entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de proposito general con capacidades de razonamiento; el pack conserva el comportamiento del original con una fidelidad declarada del 99,74% en `llmprobe`.
- Generacion de codigo: 92,0% en HumanEval (46/50) y 70,0% en MBPP (35/50) segun las pruebas del autor con razonamiento desactivado.
- Razonamiento matematico: 2/2 en AIME 2025 en las pruebas reportadas.
- Vision: incluye un vision tower de 24 bloques en BF16, por lo que el modelo base soporta entrada de imagenes.
- Ejecucion agentica: 75,0% (66/88) en pruebas de ejecucion agentica del autor.
- Decodificacion especulativa: soporte nativo de NextN MTP-1 con 1,98 tokens por paso.
- Contexto largo: ventana nativa de 202.752 tokens y hasta 1M en configuracion UMA, con indexador disperso MLA Key-Pool(4).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de gran escala en Apple Silicon: ejecutar un modelo de 321 B en un Mac de 128 GB con memoria unificada, sin paging a SSD ni swap, gracias a la compresion a 2,69 bits/parametro. Adecuado para investigadores que necesiten un LLM grande en hardware de sobremesa.
- Analisis de documentos largos: con 202.752 tokens de contexto nativo (y hasta 1M en configuracion UMA), el modelo puede procesar libros completos, expedientes o bases de codigo extensas en una sola pasada, manteniendo los 288 expertos residentes en memoria.
- Generacion de codigo en local: con 92,0% en HumanEval, puede usarse como asistente de programacion offline integrado en el flujo de trabajo del desarrollador, sin enviar codigo a servicios externos.
- Razonamiento matematico y cientifico: los resultados en AIME 2025 y la capacidad de razonamiento del modelo base lo hacen util para resolver problemas matematicos paso a paso en entornos de investigacion.
- Procesamiento de imagenes con vision: el vision tower de 24 bloques permite tareas de descripcion de imagenes, extraccion de informacion de documentos escaneados o analisis visual combinado con texto.
- Evaluacion de motores de inferencia: el pack sirve como referencia para comparar el rendimiento de Qwegn frente a otros runtimes (llama.cpp, MLX) en Apple Silicon, con metricas de prefill, decode y TTFT publicadas.
- Prototipado de agentes multi-paso: la puntuacion del 75,0% en ejecucion agentica y el soporte de contexto largo permiten construir agentes que mantengan estado durante muchas interacciones.

## Benchmarks y rendimiento

Resultados publicados por el autor en Qwegn v0.17.1-v0.20.5 sobre Apple M5 Max (128 GB, GPU de 40 nucleos, 585 GB/s), con `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill @4K | 1.014 tok/s |
| Prefill @5.2K (CLI) | 1.005,9 tok/s (1.061,3 en GPU) |
| Prefill @9.4K (serve) | 825,3-869,2 tok/s |
| Prefill @65.6K | 780 tok/s |
| TTFT en frio / con prefix-cache caliente | 180-339 ms / 10-18 ms |
| Decode (razonamiento novel) | 46,0 tok/s mediana (pico 46,4 tok/s) |
| Decode especulativo (NextN MTP-1) | 53,6 tok/s predecible; pico 50,7 tok/s |
| Estabilidad termica 21 min | +5,4% (41,1 a 43,3 tok/s) |
| Contexto largo 15K / 60K / 242,5K | 834,2 / 706,7 / 743,0 tok/s prefill; 46,54 / 32,38 / 44,98 tok/s decode |
| Residencia 1M tokens en UMA | 100% residente (107,18 GiB RSS, 0 fallos de SSD) |
| Fidelidad del motor (`llmprobe --full`) | 99,74% |
| Codigo (HumanEval + MBPP, 100 tareas) | 81/100 (81,0%); HumanEval 46/50 (92,0%), MBPP 35/50 (70,0%) |
| Ejecucion agentica | 66/88 (75,0%) |
| AIME 2025 | 2/2 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible; los datos anteriores miden el rendimiento del motor Qwegn ejecutando este pack, no comparaciones entre modelos.

## Requisitos de hardware

- VRAM / memoria unificada: 100,63 GiB para los pesos (108.051.337.284 bytes). Con overhead del motor, la residencia en un Mac de 128 GB reporta 97,84 GiB RSS en modo serial y 100,14 GiB con MTP-1; el plan de 1M tokens requiere 102,27 GiB de plan y 107,18 GiB RSS.
- Hardware probado: Apple M5 Max (Mac17,6) con 128 GB de memoria unificada, GPU Apple10 NAX de 40 nucleos y 585 GB/s de ancho de banda.
- GPU recomendadas: exclusivamente Apple Silicon con Metal 4; no hay soporte para GPU NVIDIA o AMD en la informacion disponible.
- Cabe en consumer GPU: no en el sentido tradicional; requiere un Mac con 128 GB de memoria unificada. No cabe en configuraciones de 64 GB o menos segun los datos de tamano del pack.
- Opciones de despliegue: unicamente el motor Qwegn (v0.14.0 o superior), con modos CLI y `qwg serve`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato QWP1 es propietario.
- Latencia y throughput: TTFT en caliente de 10-18 ms con prefix-cache; decode de 46,0 tok/s mediana y 53,6 tok/s con decodificacion especulativa; prefill de 1.014 tok/s a 4K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| GLM-5.3-Flash-QWP-Mixed (este pack) | 321,32 B totales / ~18 B activos | 202.752 nativo; 1M en UMA | QWP1 (solo Qwegn) | MIT | Apple Silicon 128 GB |
| zai-org/GLM-5.3-Flash (original) | 321,32 B totales / ~18 B activos | no disponible | no disponible | no disponible | no disponible |
| HQ4_G32 + HQ3_G64 (cuantizacion alternativa citada) | 321,32 B totales | no disponible | no disponible | no disponible | Apple Silicon 128 GB (134,37 GiB) |

La unica comparacion cuantitativa disponible es frente a la cuantizacion HQ4+HQ3 del mismo modelo base: el pack SHVQ ocupa 100,63 GiB frente a 134,37 GiB (-25,1%), lo que permite la residencia completa en 128 GB. No hay datos de rendimiento de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor Qwegn: el formato QWP1 solo carga en Qwegn v0.14.0 o superior; no es utilizable con safetensors, GGUF, MLX, vLLM, llama.cpp ni ninguna otra herramienta estandar.
- Plataforma unica: disenado para Apple Silicon con Metal 4; no hay soporte para GPU NVIDIA, AMD ni CPU generica.
- Requisito de memoria: necesita un Mac con 128 GB de memoria unificada; en configuraciones menores el pack no cabe segun los datos del autor.
- Perdida de precision por cuantizacion: aunque el autor reporta 99,74% de fidelidad, la compresion a 2,69 bits/parametro implica degradacion respecto al modelo original, especialmente en los expertos a 2,25 bpw.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo general de los LLM.
- Idiomas soportados: no disponible; no se puede confirmar el soporte multilingue.
- Resultados autoevaluados: todas las metricas de rendimiento y calidad provienen del autor del pack, no de evaluaciones independientes.
- Licencia MIT: permite uso comercial, pero el modelo base GLM-5.3-Flash puede tener condiciones adicionales no reflejadas en la informacion disponible; conviene verificar la licencia del modelo original.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/qwegnai/GLM-5.3-Flash-QWP-Mixed
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
- Paper SHVQ: `arXiv:2611.09501` (https://arxiv.org/abs/2611.09501)
