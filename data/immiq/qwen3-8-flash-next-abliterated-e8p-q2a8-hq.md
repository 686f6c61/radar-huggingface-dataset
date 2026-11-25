# immiq/Qwen3.8-Flash-Next-Abliterated-E8P-Q2A8-HQ

## Resumen
Qwen3.8-Flash-Next-Abliterated-E8P-Q2A8-HQ es una cuantización de alta calidad del modelo immiq/Qwen3.8-Flash-Next-Abliterated-BF16, publicada por el usuario immiq. Se trata de una variante "abliterated" (con las direcciones de rechazo eliminadas del espacio de pesos) del modelo Qwen3.8-Flash-Next, un transformer MoE multimodal con capacidad de razonamiento extendido y predicción multi-token (MTP). El paquete emplea el formato compilado propietario Orinfer v0.4.1 y el método de cuantización E8P-HQ v2 (Q2A8), que comprime los pesos a 2 bits por parámetro con activaciones INT8.

El interés de esta ficha reside en que documenta un caso extremo de compresión: un modelo multimodal de 48 capas con expertos MoE enrutados, encoder de visión FP16 y capa MTP nativa, reducido a un repositorio de 102,9 GB distribuido en 35 shards semánticos grandes (508 MiB–2,04 GiB) en lugar de miles de ficheros pequeños. El autor reporta una evaluación end-to-end de 48 capas frente al profesor BF16 abliterado, con mejoras de hasta el 83,9 % en KL-Top32 en matemáticas y del 13,1 % en la media ponderada de 1.992 posiciones.

La relevancia actual es doble: por un lado, muestra el estado del arte en cuantización de MoE con calibración multi-dominio y compensación SwiGLU; por otro, su empaquetado está atado a un runtime concreto (Orinfer v0.4.1, SM87), lo que condiciona por completo su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con MTP (48 capas, expertos enrutados K64, capa MTP nativa en la capa 48) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con expertos enrutados; el autor no publica el recuento) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | E8P-HQ v2 (Q2A8): pesos a 2 bits con activaciones INT8; W8 en proyecciones densas; Row-Q4 en `attn_qkv`/`attn_gate`/`attn_q`; FP16 en encoder de visión; BF16 empaquetado en hyper-connection projections |
| Idiomas soportados | no disponible en la model card (la calibración cubre inglés, chino, código/XML y matemáticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout compilado Orinfer v0.4.1 (35 shards semánticos + `vision.safetensors`, `mtp.safetensors`, embeddings y PLE en CPU) |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE multimodal de 48 capas con expertos enrutados (K64 tras el repack sin pérdida desde K128) y una capa MTP nativa en la posición 48, lo que permite decodificación especulativa multi-token. Incorpora además un encoder de visión en FP16, hyper-connection projections y filas PLE (probablemente "parallel layer experts" o similar, el autor no lo expande). El contexto nativo es de 256K tokens y el paquete soporta prefix cache y continuous batching.

La cuantización E8P-HQ v2 se construye en cinco etapas: calibración secuencial multi-dominio con 64 secuencias de 32.768 tokens balanceadas entre prosa inglesa (WikiText-2), texto enciclopédico chino (Wikipedia-ZH), trayectorias de agente con código y XML `<tool_call>`, y razonamiento matemático `<think>` (GSM8K); búsqueda determinista de 64 ensayos sobre vectores de signo Hadamard de bloque 128 para minimizar el error de cuantización INT8 de activaciones; LDLQ Mahalanobis de bloque 8 con contracción regularizada de las Hessianas por experto hacia la Hessiana compartida de capa (`tau_gu = 3072`, `damping_gu = 0.35`) o hacia un prior isotrópico (`tau_dn = 1536`, `damping_dn = 0.45`); compensación de atenuación cúbica SwiGLU (`gu_boost = 1.04` más `a_cal` solo en calibración) para eliminar la contracción del 15–21 % en la norma de salida a 2 bits; y cuantización de PLE (320M filas) con búsqueda de signos Paley20×Walsh8 de 32 ensayos, MS-ALS multi-arranque y pulido de 3 ULP. Las proyecciones densas usan Hessian-GPTQ W8 con redondeo RNE exacto en `out_proj`/`o_proj` para preservar las direcciones de abliteración.

## Capacidades
- Generación de texto y razonamiento extendido con modo `<think>` explícito, según la calibración del autor sobre trayectorias de matemáticas GSM8K.
- Generación de código y trayectorias de agente con llamadas a herramientas en formato XML `<tool_call>`.
- Capacidad multimodal de entrada de imagen gracias al encoder de visión FP16 incluido (`vision.safetensors`, 856 MiB).
- Predicción multi-token (MTP) nativa en la capa 48, habilitando decodificación especulativa.
- Soporte multilingüe al menos inglés y chino, según los dominios de calibración; el resto de idiomas no está documentado.
- Comportamiento "abliterated": se han eliminado las direcciones de rechazo, por lo que el modelo no aplica negativas de seguridad aprendidas.
- Servicio con prefix cache y continuous batching a través del runtime Orinfer.

## Casos de uso
- Despliegue de inferencia a gran escala en hardware SM87: el paquete está verificado como drop-in contra el paquete de ejecución Orinfer v0.4.1 (`weight_bytes = 38.487.903.152`, 2.787 tensores, 27 shards), por lo que se puede servir sin recompilar ni reconstruir el layout.
- Razonamiento matemático con cadena de pensamiento: la calibración específica sobre GSM8K y la mejora de Top-1 del 87,80 % al 96,17 % lo hacen adecuado para pipelines de resolución de problemas paso a paso donde el coste por token es crítico.
- Agentes con tool calling: el formato XML `<tool_call>` está presente en el conjunto de calibración, lo que reduce la degradación de la estructura de llamadas a herramientas tras la cuantización a 2 bits.
- Procesamiento de documentos largos: con 256K tokens de contexto y prefix cache, encaja en análisis de contratos, expedientes o bases de código extensas en una sola pasada.
- Asistentes multilingües inglés-chino: la calibración balanceada entre WikiText-2 y Wikipedia-ZH mantiene el sesgo de cuantización controlado en ambos idiomas (KL-Top32 de 0,569 en chino y 0,589 en inglés).
- Investigación sobre cuantización extrema: el paquete incluye los JSON de evaluación (`eval_48l_e8p_hq_v2.json`, `eval_48l_baseline.json`) en `docs/`, útiles como referencia reproducible para comparar métodos Q2A8 en MoE.
- Experimentación con modelos sin alineamiento de seguridad: al estar abliterated, sirve para estudiar el efecto de la eliminación de direcciones de rechazo sobre el rendimiento y la estabilidad de la cuantización.

## Benchmarks y rendimiento
Evaluación end-to-end de 48 capas con cuantización online exacta de activaciones A8 y pesos E8P-Q2 comprimidos, frente al profesor BF16 abliterado:

| Suite retenida | Posiciones | Métrica | Baseline Orinfer (`weight-only-ls2`) | E8P-HQ v2 | Mejora |
|---|---:|---|---:|---:|---|
| Orinfer Frozen Scenes (8 escenas) | 64 | KL-Top32 | 0,02840 | 0,02351 | -17,2 % |
| | | \|ΔNLL\| | 0,09705 | 0,02739 | 3,5× más cerca |
| Matemáticas `<think>` (GSM8K) | 418 | KL-Top32 | 0,25771 | 0,04138 | -83,9 % (6,2× menor) |
| | | Top-1 Match | 87,80 % | 96,17 % | +8,37 % |
| | | In-Top3 | 98,56 % | 100,00 % | +1,44 % |
| Código y agente XML | 166 | KL-Top32 | 0,20426 | 0,11741 | -42,5 % |
| | | Top-1 Match | 83,73 % | 85,54 % | +1,81 % |
| Chino (Wikipedia-ZH) | 672 | KL-Top32 | 0,63140 | 0,56926 | -9,8 % |
| | | Top-1 / In-Top3 | 65,18 % / 84,52 % | 66,37 % / 88,24 % | +1,19 % / +3,72 % |
| Inglés (WikiText-2) | 672 | KL-Top32 | 0,57997 | 0,58930 | +1,6 % (empeora) |
| Todas las 1.992 posiciones | 1.992 | KL-Top32 ponderado | 0,4807 | 0,4178 | -13,1 % |
| | | Top-1 / In-Top3 ponderado | 76,76 % / 91,27 % | 78,01 % / 92,27 % | +1,25 % / +1,00 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K en modo zero-shot) en la información disponible; las cifras anteriores son métricas de fidelidad frente al profesor, no de capacidad absoluta.

## Requisitos de hardware
- VRAM estimada: el paquete de ejecución declara `weight_bytes = 38.487.903.152` (~35,8 GiB) para los pesos en formato E8P-Q2A8, más overhead de activaciones, KV cache y encoder de visión; con 256K de contexto el KV cache puede dominar el consumo y no se publica su tamaño.
- GPU recomendadas: el paquete está compilado para SM87, es decir, arquitectura Ada Lovelace (RTX 4090, L40S, RTX 6000 Ada) y no para Ampere (A100, SM80) ni Hopper (H100, SM90) sin recompilación.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar los ~35,8 GiB de pesos en una sola tarjeta; se requiere al menos una configuración multi-GPU o un acelerador con 48 GB o más.
- Opciones de despliegue: exclusivamente el runtime Orinfer v0.4.1 (validado con `orinfer validate-model` de Orinfer 0.4.2). No hay GGUF ni pesos compatibles con llama.cpp, vLLM, TGI u Ollama, por lo que estos motores no pueden cargar el repositorio.
- Latencia y throughput: no disponibles. El autor solo justifica la mejora de carga secuencial desde disco (35 shards grandes frente a 7.453 shards pequeños), sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Abliterated-E8P-Q2A8-HQ (este) | no disponible (MoE 48L) | 256K | E8P-HQ v2 Q2A8, formato Orinfer | Apache 2.0 | Solo runtime Orinfer v0.4.1 SM87 |
| immiq/Qwen3.8-Flash-Next-Abliterated-BF16 (profesor) | no disponible (MoE 48L) | 256K | BF16 sin cuantizar | Apache 2.0 | Safetensors estándar |
| Qwen3.8-Flash-Next (modelo original, sin abliterar) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos comparables de la misma categoría (por ejemplo, alternativas MoE multimodales de 2 bits), por lo que la comparativa se limita al linaje directo del modelo.

## Limitaciones y advertencias
- Dependencia total de Orinfer: el layout compilado de 35 shards y las tablas de decodificación E8P son específicos del runtime; no es un checkpoint portable a otros motores de inferencia.
- Restricción de hardware: SM87 excluye A100 y H100, los aceleradores más habituales en servidores de producción.
- Modelo abliterated: se han eliminado las direcciones de rechazo, por lo que no aplica negativas de seguridad y puede generar contenido dañino sin filtro interno. El autor reporta además una deriva del margen de rechazo de hasta el 60 % durante la cuantización, mitigada pero no necesariamente nula.
- Cuantización a 2 bits: aunque las métricas de fidelidad son buenas, el inglés es el único dominio donde empeora (KL-Top32 de 0,57997 a 0,58930, +1,6 %), lo que sugiere un sesgo de calibración hacia los otros dominios.
- Idiomas no documentados: solo inglés y chino están cubiertos por la calibración; el comportamiento en castellano u otras lenguas no está evaluado.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación para esta variante cuantizada.
- Trazabilidad: el repositorio tiene 1 descarga y 0 likes, sin pipeline declarado ni idiomas listados; la revisión del modelo base está fijada (`2b799be26afec763364ad7490fbc4014de575a10`), lo que ayuda a la reproducibilidad pero no garantiza soporte a largo plazo.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo original Qwen3.8-Flash-Next no se detalla en la información disponible y podría imponer condiciones adicionales.

## Enlaces
- Hugging Face: https://huggingface.co/immiq/Qwen3.8-Flash-Next-Abliterated-E8P-Q2A8-HQ
- Modelo base BF16: https://huggingface.co/immiq/Qwen3.8-Flash-Next-Abliterated-BF16
- README en chino: https://huggingface.co/immiq/Qwen3.8-Flash-Next-Abliterated-E8P-Q2A8-HQ/blob/main/README_zh.md
- Documentación de evaluación (`docs/`): https://huggingface.co/immiq/Qwen3.8-Flash-Next-Abliterated-E8P-Q2A8-HQ/tree/main/docs
- Paper, blog o repositorio de Orinfer: no disponible en la información proporcionada.
