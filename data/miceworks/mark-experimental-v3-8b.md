# miceworks/Mark-Experimental-V3-8B

## Resumen

Mark-Experimental-V3-8B es un modelo publicado por el usuario miceworks en Hugging Face bajo el identificador `miceworks/Mark-Experimental-V3-8B`. A pesar de su nombre y de presentarse como un "flagship base" de 8.170 millones de parametros, la propia model card indica explicitamente que se trata de un **base arquitectonico sin entrenar**: los pesos corresponden a una inicializacion He/Xavier combinada con Hadamard Fusion, lista para preentrenamiento o ajuste fino, pero no ha pasado por ninguna fase de entrenamiento supervisado, RLHF ni DPO.

La arquitectura declarada es `deepseek2` (la familia DeepSeek-V2/V3 implementada en ggml), con 32 capas transformer, atencion Multi-Head Latent Attention (MLA) con `q_lora_rank=1024` y `kv_lora_rank=512`, y un bloque MoE con 32 expertos enrutados mas 2 compartidos, activando 4 expertos por token (2.000 millones de parametros activos). La ventana de contexto es de 32.768 tokens y el vocabulario de 32.032 entradas.

Su relevancia practica es limitada para inferencia real: al no estar entrenado, no produce texto coherente. Su interes es fundamentalmente arquitectonico y de investigacion, ya que ofrece una implementacion MoE estilo DeepSeek-V2 en formato GGUF cuantizado IQ4_NL de 4,38 GB, util como punto de partida para experimentos de preentrenamiento o para validar pipelines de carga y despliegue con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek2` (transformer con MLA y MoE) |
| Parametros totales | 8.168.001.024 (8,17 B) |
| Parametros activos | 2.002.374.144 (2,00 B por token) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | IQ4_NL (4 bits no lineal); normas y sesgo de router en FP32 |
| Idiomas soportados | no disponible (modelo sin entrenar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`mark_experimental_v3_8b_iq4_nl.gguf`, 4.382,55 MB) |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Dimension oculta (`dim`) | 2.560 |
| Capas transformer | 32 |
| Cabeceras de atencion (query) | 32 |
| MLA `q_lora_rank` | 1.024 |
| MLA `kv_lora_rank` | 512 |
| Expertos enrutados (MoE) | 32 |
| Expertos compartidos | 2 |
| Expertos activos por token | 4 |
| Tamano intermedio MoE | 896 |
| Tamano de vocabulario | 32.032 |
| Tensores totales | 579 (418 IQ4_NL + 161 FP32) |
| SHA-256 | `792e127a71f62145f87c3775c4a03a0dc7bb68b8ee355acb74602348cf748b4a` |
| Estado de entrenamiento | Base arquitectonico / sin entrenar / inicializacion He-Xavier + Hadamard Fusion |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `deepseek2`, es decir, un transformer decoder-only con Multi-Head Latent Attention (MLA), que comprime las proyecciones de query y clave-valor en espacios latentes de baja dimension (`q_lora_rank=1024`, `kv_lora_rank=512`) para reducir el coste de cache KV en contextos largos. Sobre esa base se inserta un bloque de mezcla de expertos (MoE) con 32 expertos enrutados, 2 expertos compartidos y enrutamiento top-4, con tamano intermedio de 896 por experto. La dimension oculta es 2.560 y se apilan 32 capas.

No hay datos de entrenamiento: la model card declara explicitamente "Architectural Base / Untrained / Weight Initialization via He/Xavier + Hadamard Fusion (Ready for Pre-training or Fine-Tuning)". No se especifica numero de tokens, composicion del dataset, ni fases de RLHF, DPO o SFT, porque no existen. La unica innovacion tecnica documentada es el esquema de cuantizacion IQ4_NL, que empaqueta cada 32 pesos en bloques de 18 bytes (escala FP16 de 2 bytes + 16 bytes que indexan la tabla no lineal `kvalues_iq4nl = [-127, -104, -83, -65, -49, -35, -22, -10, 1, 13, 25, 38, 53, 69, 89, 113]`), preservando en FP32 las normas (`*_norm.weight`) y el sesgo del router (`exp_probs_b.bias`).

## Capacidades

- Generacion de texto: no disponible. El modelo no ha sido entrenado y no produce salida linguistica coherente.
- Razonamiento, codigo y matematicas: no disponible por la misma razon.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible. La plantilla de chat de ejemplo incluye una etiqueta `<think>` de apertura, pero es solo una plantilla de despliegue, no una capacidad funcional del modelo.
- Capacidad estructural: sirve como esqueleto MoE estilo DeepSeek-V2 en GGUF para preentrenamiento o ajuste fino.

## Casos de uso

- **Investigacion de arquitecturas MoE**: el modelo permite cargar y validar en llama.cpp una topologia DeepSeek-V2 con 32 expertos y top-4 routing sin necesidad de descargar los pesos completos de un modelo grande; util para estudiar el comportamiento del enrutador y del MLA en un entorno controlado.
- **Punto de partida para preentrenamiento**: al ser una inicializacion He/Xavier con Hadamard Fusion, puede servir como base para experimentos de preentrenamiento a pequena escala en dominios concretos (por ejemplo, codigo o texto tecnico), partiendo de una arquitectura ya implementada en ggml.
- **Ajuste fino supervisado (SFT) de bajo coste**: con 2.000 millones de parametros activos por token, el coste de computo por paso es inferior al de un modelo denso de 8.170 millones, lo que abarata experimentos de fine-tuning sobre la arquitectura.
- **Validacion de pipelines de despliegue**: util para probar integraciones con llama-server, llama-cpp-python u Ollama (plantillas, parametros de muestreo, limites de contexto de 32.768 tokens) antes de sustituir el fichero por pesos entrenados.
- **Benchmarking de cuantizacion IQ4_NL**: permite medir el impacto de la cuantizacion no lineal de 4 bits (bloques de 18 bytes por 32 pesos) en velocidad de carga y consumo de memoria frente a otras cuantizaciones, con un fichero de solo 4,38 GB.
- **Pruebas de infraestructura y CI**: al ser un artefacto pequeno y determinista (checksum SHA-256 publicado), es adecuado como fixture en tests de carga de modelos GGUF, verificacion de tensores (579 en total) y comprobacion de compatibilidad con versiones de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo sin entrenar, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de sentido y no se reporta.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el fichero IQ4_NL ocupa 4.382,55 MB; con cache KV para 32.768 tokens y overhead de runtime, se recomienda un minimo de 6-8 GB de VRAM.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100. Cabe en practicamente cualquier GPU consumer con 8 GB o mas.
- **Consumer GPU**: si, en tarjetas con 8 GB o mas de VRAM; tambien puede ejecutarse en CPU con llama.cpp gracias al reducido numero de parametros activos (2,00 B).
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server` con endpoint compatible con OpenAI), Ollama (via `Modelfile`), llama-cpp-python. No se documenta soporte para vLLM ni TGI en la informacion disponible.
- **Latencia y throughput**: no disponibles. Al activar solo 2,00 B de parametros por token, se espera un throughput superior al de un denso de 8,17 B, pero no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento ni de modelos comparables en la informacion recibida, y al tratarse de un modelo sin entrenar la comparacion cuantitativa con alternativas entrenadas no seria significativa. Como referencia estructural, la arquitectura `deepseek2` es la misma familia que DeepSeek-V2, pero no se dispone de datos para establecer una comparacion formal.

## Limitaciones y advertencias

- **Modelo sin entrenar**: no genera texto coherente; no debe usarse en produccion para ninguna tarea de inferencia linguistica.
- **Licencia no especificada**: la model card no indica licencia, lo que impide confirmar si se permite uso comercial. Ante la ausencia de licencia explicita, debe asumirse que no hay autorizacion clara para uso comercial.
- **Idiomas no declarados**: al no haber entrenamiento, no hay soporte linguistico verificable.
- **Riesgo de confusion**: el nombre "V3-8B" y la etiqueta "flagship base" pueden llevar a error; es imprescindible leer la seccion de estado de entrenamiento antes de descargarlo.
- **Sesgos y alucinacion**: no evaluables, ya que no hay comportamiento linguistico que medir.
- **Repositorio sin traccion**: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas; la trazabilidad y el mantenimiento no estan garantizados.
- **Caveat de despliegue**: la plantilla de Ollama abre un bloque `<think>` sin cierre, lo que puede producir salidas truncadas o mal formadas si se usa tal cual con pesos entrenados en el futuro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miceworks/Mark-Experimental-V3-8B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
