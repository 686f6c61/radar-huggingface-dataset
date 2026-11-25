# shebxyd/Kaze-4.7B-A530M-MIT

## Resumen

Kaze-4.7B-A530M-MIT es un modelo de lenguaje fundacional con arquitectura Sparse Mixture-of-Experts (MoE) desarrollado desde cero por Kineyo (`@kineyo.io` / `Dev_Kofu`) bajo licencia MIT. Está pensado para inferencia local y privada en dispositivos edge, incluyendo CPU, Linux y Android, dentro del ecosistema que el autor denomina Proyecto Kofu. El modelo se publica con pesos en BF16 y una cuantización Q4_K_M lista para llama.cpp.

La arquitectura sigue el esquema `Qwen2MoeForCausalLM` con 23 capas, dimensión de modelo de 1024 y atención GQA con 16 cabezas de consulta y 4 de clave/valor (`head_dim = 64`). El bloque MoE combina 1 experto compartido con 31 expertos enrutados, activando `top_k = 2` por token, lo que da un total de aproximadamente 4,72 mil millones de parámetros con solo unos 528 millones activos por token. El contexto es de 4096 tokens con RoPE (`theta = 100000.0`) y vocabulario propio de 32.768 entradas mediante Byte-Level BPE.

Su relevancia actual reside en la relación entre parámetros totales y activos: al activar solo ~528M por token, el coste computacional por paso se acerca al de un modelo pequeño, mientras que la capacidad total de almacenamiento de conocimiento corresponde a un modelo de ~4,7B. Esto lo hace atractivo para despliegues con recursos limitados que necesitan un modelo conversacional bilingüe (español e inglés) con licencia permisiva. No obstante, se trata de un modelo experimental con un número muy reducido de descargas y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Sparse MoE (`Qwen2MoeForCausalLM`) |
| Parametros totales | 4.725.196.288 (~4,72B) |
| Parametros activos | ~528M por token |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | BF16 (pesos originales) y Q4_K_M (GGUF) |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16, dividido en 3 shards) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención de grupos (GQA) de 16 cabezas de consulta y 4 de clave/valor, `head_dim = 64` y `d_model = 1024`, distribuido en 23 capas. El bloque MoE incorpora un experto compartido más 31 expertos enrutados con `top_k = 2` y `d_ff = 2048` con activación SwiGLU. La conversión a formato Hugging Face se describe como lossless, con `expert_bias = 0` y sin necesidad de `trust_remote_code`. El vocabulario es propio, de 32.768 tokens, entrenado con Byte-Level BPE. La posición se codifica con RoPE y `theta = 100000.0`.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del corpus ni la existencia de fases de RLHF, DPO o ajuste por instrucciones. La model card indica únicamente que fue entrenado desde cero con un corpus bajo licencia MIT y que está orientado a investigación de arquitecturas Sparse MoE en edge y a tareas acotadas en español y código. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en español e inglés, con formato de prompt basado en tokens especiales `<|user|>` y `<|assistant|>`.
- Razonamiento de propósito general y respuesta a instrucciones dentro de tareas acotadas, según la orientación declarada por el autor.
- Generación de código, mencionada explícitamente como dominio objetivo junto al español.
- Capacidades multilingües limitadas a español e inglés.
- Inferencia local en dispositivos edge (CPU, Linux, Android) gracias a su bajo número de parámetros activos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional local en Android: el modelo puede ejecutarse con la cuantización Q4_K_M mediante llama.cpp o el runtime Kofu_Mobile, permitiendo un chatbot privado sin conexión a la nube y con un consumo de cómputo por token reducido gracias a los ~528M parámetros activos.
- Atención al cliente en español con despliegue on-premise: al tener licencia MIT y contexto de 4096 tokens, puede integrarse en sistemas internos que gestionen conversaciones multi-turno sin depender de servicios externos.
- Generación de código en entornos de desarrollo con recursos limitados: su orientación a código y su bajo coste de inferencia permiten autocompletado o generación de fragmentos en estaciones de trabajo sin GPU dedicada.
- Investigación de arquitecturas MoE: sirve como banco de pruebas para estudiar enrutamiento de expertos, `top_k`, expertos compartidos y su impacto en calidad frente a modelos densos de tamaño comparable.
- Prototipado rápido de aplicaciones de texto en CPU: con el GGUF Q4_K_M puede desplegarse en servidores sin GPU para validar productos conversacionales antes de escalar a modelos mayores.
- Traducción y asistencia bilingüe español-inglés: su vocabulario y entrenamiento en ambos idiomas permiten tareas de reescritura, resumen o adaptación de textos entre las dos lenguas en entornos con privacidad estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda contar con 12-14 GB.
- VRAM estimada para inferencia con Q4_K_M: en torno a 3-3,5 GB para pesos, con margen adicional para contexto y activaciones.
- GPU recomendadas: para BF16, GPU con 16 GB o más (RTX 4080/4090, A100, H100). Para Q4_K_M, GPU consumer con 6-8 GB (RTX 3060, RTX 4060, RTX 2070) son suficientes.
- Cabe en GPU consumer: sí, tanto en BF16 con GPUs de gama alta como en Q4_K_M en GPUs de gama media y en iGPUs con memoria unificada.
- Opciones de despliegue: transformers (BF16 con safetensors), llama.cpp (GGUF Q4_K_M), y el runtime propietario Kofu_Mobile para Android. No se documenta soporte explícito de vLLM, TGI u Ollama, aunque el formato GGUF es compatible con el ecosistema llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaze-4.7B-A530M-MIT | ~4,72B | ~528M | 4096 | MIT | Hugging Face (safetensors + GGUF) |
| Qwen1.5-MoE-A2.7B | ~14,3B | ~2,7B | 32.768 | Apache 2.0 | Hugging Face |
| Qwen2-1.5B | ~1,5B | denso | 32.768 | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | ~1,1B | denso | 2048 | Apache 2.0 | Hugging Face |

La comparativa se ofrece como referencia de categoría; no se dispone de datos de rendimiento del modelo Kaze que permitan una comparación cuantitativa con estas alternativas. Frente a Qwen1.5-MoE-A2.7B, Kaze activa muchos menos parámetros por token (~528M frente a ~2,7B) y maneja un contexto mucho menor (4096 frente a 32.768). Frente a modelos densos de ~1,5B, Kaze ofrece mayor capacidad total almacenada pero con un contexto más corto. La licencia MIT es más permisiva que Apache 2.0 en cuanto a requisitos de atribución.

## Limitaciones y advertencias

- Modelo experimental entrenado desde cero: no se documentan fases de alineación (RLHF/DPO) ni evaluación de sesgos, por lo que puede reproducir sesgos presentes en el corpus de entrenamiento.
- Riesgo elevado de alucinación: al ser un modelo pequeño con corpus limitado y sin benchmarks publicados, la fiabilidad factual no está validada.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas comparado con modelos actuales de 32K o más.
- Soporte idiomático restringido a español e inglés; no se garantiza calidad en otros idiomas.
- Ausencia de benchmarks y de validación independiente: solo 112 descargas y 0 likes en el momento de la ficha, lo que implica poca comunidad y escaso soporte.
- Sin soporte documentado de tool calling, agentes o multimodalidad, lo que limita su uso en pipelines modernos de agentes.
- El runtime Kofu_Mobile es específico del ecosistema del autor; la portabilidad a otros entornos Android no está garantizada.
- Licencia MIT permite uso comercial sin restricciones, pero la falta de garantías y de evaluación de calidad hace recomendable validar exhaustivamente antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/shebxyd/Kaze-4.7B-A530M-MIT
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
