# moravianai/ThinEmbed-Qwen3-Embedding-0.6B-vq

## Resumen

ThinEmbed-Qwen3-Embedding-0.6B-vq es un cliente de codificación de consultas (*query encoder*) cuantizado a partir de Qwen/Qwen3-Embedding-0.6B, desarrollado por Moravian AI. No es un modelo generativo ni un modelo nuevo entrenado desde cero: es una versión comprimida y empaquetada del codificador de embeddings de Qwen, diseñada para ejecutarse íntegramente en el navegador mediante WebGPU. Su propósito es producir vectores de consulta de 1024 dimensiones compatibles con un índice ya construido con el modelo original en precisión completa, sin necesidad de reindexar.

El problema que resuelve es el coste de despliegue de un codificador de consultas en el lado del cliente: en lugar de enviar cada consulta a un servidor, el archivo de 237 MiB se descarga una vez, se cachea en el sistema de archivos privado del navegador y se ejecuta en la GPU local. La cuantización utiliza códebooks bidimensionales (K = 128, índices de 7 bits) más una tabla de tokens Q2_K, lo que resulta en aproximadamente 3,57 bits por peso.

La relevancia actual reside en su enfoque de cuantización específico: el autor documenta que Qwen3-Embedding-0.6B es especialmente frágil bajo compresión (colapsa a 2,1 bits), y que los códebooks de 2 dimensiones superan a los de 4 dimensiones por bit en este modelo concreto. El modelo está orientado al checo y a recuperación multilingüe, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-Embedding-0.6B); pooling de último token, salida L2-normalizada de 1024 dimensiones |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3,57 bits por peso (códebooks 2-d, K = 128, índices de 7 bits) + tabla de tokens Q2_K de vocabulario completo (49 MiB); formato propietario `.vqw` |
| Idiomas soportados | Checo (cs) y multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | `.vqw` (contenedor propietario de la librería vqweb); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-0.6B, un transformer codificador con pooling de último token que produce embeddings de 1024 dimensiones. ThinEmbed no reentrena los pesos: aplica un proceso de cuantización post-entrenamiento sobre el modelo original. La innovación técnica principal es el uso de códebooks bidimensionales en lugar de los códebooks de 4 dimensiones empleados en otros contenedores del mismo autor (harrier). Según la documentación, los códebooks 2-d con K = 64 a 3,07 bits por peso superan a los de 4-d con K = 2048 a 3,15 bits por peso, con +0,024 nDCG@10 y +0,06 de coseno sobre 4-d con K = 1024.

La calibración se realizó con 3000 preguntas reales del split de entrenamiento de WebFAQ-cs (disjuntas del split de test), en el prompt oficial de consulta del modelo, con una única semilla de rotación. La tabla de tokens Q2_K cuesta 2,0 puntos de nDCG@10 y 0,025 de coseno; una tabla recortada de 35 000 tokens cuesta 0,8 puntos adicionales y no cumple el criterio de coseno, por lo que se distribuye la tabla completa. El archivo se generó con `scripts/vq_export_web.py --teacher qwen3-0.6b --dim 2 --bits 3.5 --calib webfaq-cs_train_q --n_seq 3000 --vocab full`.

## Capacidades

- Generación de embeddings de consulta de 1024 dimensiones, L2-normalizados, compatibles con índices construidos con Qwen/Qwen3-Embedding-0.6B en precisión completa.
- Codificación de consultas con el prompt oficial de Sentence-Transformers: `Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery:` (sin espacio final).
- Recuperación de pasajes (*retrieval*) sobre corpus checo y multilingüe.
- Ejecución en navegador mediante WebGPU con `shader-f16` (Chrome / Edge), sin fallback a CPU.
- Caché persistente del archivo en el sistema de archivos privado del navegador entre visitas.
- Tokenizador y prompt embebidos en la cabecera del contenedor.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un codificador de embeddings.

## Casos de uso

- Búsqueda semántica en el navegador: el cliente descarga el archivo una vez (237 MiB), lo cachea y codifica consultas localmente en unos 100 ms por consulta en GPU integrada, eliminando el coste de servidor por consulta y la latencia de red en la fase de codificación.
- Recuperación sobre corpus checo: el modelo está calibrado y evaluado sobre WebFAQ-cs (71 529 pasajes, 7 231 preguntas juzgadas por humanos), lo que lo hace adecuado para aplicaciones de búsqueda en checo con índices preexistentes de Qwen3-Embedding-0.6B.
- Privacidad de consultas: al ejecutarse en el dispositivo del usuario, el texto de la consulta no se envía a un servidor para su codificación, lo que es relevante en dominios con requisitos de privacidad.
- Aplicaciones web de bajo despliegue: al ser un único archivo con licencia Apache-2.0 y runtime npm (`@moravian/thinembed-vq`), se integra en frontends sin infraestructura de inferencia dedicada.
- Prototipado y demos de recuperación: el runtime incluye una demo pública y un modo de benchmark local (`bench.html`, `browser_run.py`) que permite validar el comportamiento sobre el split de test de WebFAQ-cs.
- Sistemas con índices ya construidos: al mantener compatibilidad exacta con los vectores de Qwen3-Embedding-0.6B, permite sustituir el codificador de consultas del servidor por uno en cliente sin reindexar documentos.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Referencia fp32 |
|---|---|---|---|
| WebFAQ-cs (71 529 pasajes, 7 231 preguntas) | nDCG@10 | 0,7072 (96,8 %) | 0,7308 |
| WebFAQ-cs | Coseno con vector de consulta fp32 | 0,946 | 1,0 |
| WebFAQ-cs | Solapamiento top-10 | 0,755 | 1,0 |
| Índice legal checo (1 137 consultas sintéticas) | nDCG@10 | 0,2965 (93,1 %) | 0,3186 |
| Índice legal checo | Coseno | 0,930 | 1,0 |
| Índice legal checo | Solapamiento top-10 | 0,653 | 1,0 |
| WebGPU, GPU Intel integrada (primeras 50 consultas de test) | nDCG@10 | 0,6393 (Δ 0,0000 frente a simulación) | — |
| WebGPU, GPU Intel integrada | Latencia | p50 112 ms / p95 130 ms por consulta | — |
| WebGPU, GPU Intel integrada | Carga | 2,5 s; 412 MiB de memoria de pestaña | — |

Comparación con el cliente escalar del mismo modelo (`llama-quantize` Q4_K_M + tabla de tokens de 4 bits, 340 MiB): retiene el 98,7 % sobre el índice legal checo, mientras que este archivo es el 70 % de su tamaño. El número de WebFAQ-cs es una simulación en torch del archivo sobre el split de test; el navegador reproduce la simulación solo en las primeras 50 consultas. Todo con una única semilla: diferencias por debajo de 0,01 nDCG@10 están dentro de la varianza de calibración.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el archivo ocupa 237 MiB y el runtime reporta 412 MiB de memoria de pestaña en una GPU Intel integrada.
- GPU recomendadas: no se especifican modelos discretos; la única medición publicada es sobre GPU Intel integrada. Las latencias en GPU discreta y móvil no se han medido.
- Compatibilidad consumer: funciona en GPU integrada Intel con WebGPU y `shader-f16`; requiere Chrome o Edge y no tiene fallback a CPU.
- Opciones de despliegue: runtime WebGPU propio (`vqweb.js`, paquete npm `@moravian/thinembed-vq`), servidor local `client/browser/serve.py`, benchmark `client/vqweb/bench.html`, script `scripts/browser_run.py` y referencia torch `scripts/vq_reference.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: p50 112 ms y p95 130 ms por consulta en GPU Intel integrada; carga de 2,5 s tras la descarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ThinEmbed-Qwen3-Embedding-0.6B-vq | 0,6 B | no disponible | `.vqw` (3,57 bpw) | Apache-2.0 | Cliente de consultas WebGPU; 96,8 % de nDCG@10 fp32 en WebFAQ-cs |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | no disponible | safetensors | Apache-2.0 | Modelo base en precisión completa; requiere infraestructura de inferencia |
| Cliente escalar ThinEmbed (Q4_K_M + tabla de 4 bits) | 0,6 B | no disponible | contenedor del autor (340 MiB) | Apache-2.0 | 98,7 % en índice legal checo; 70 % más grande que este archivo |
| Contenedores harrier (códebooks 4-d, 2,1 bpw) | no disponible | no disponible | contenedor del autor | Apache-2.0 | No aplicables a este modelo: Qwen3-Embedding-0.6B colapsa a 2,1 bits |

## Limitaciones y advertencias

- Una sola semilla de calibración: las diferencias por debajo de 0,01 nDCG@10 quedan dentro de la varianza de la muestra de calibración.
- El número completo de 7 231 consultas de WebFAQ-cs es una simulación en torch del archivo, no una ejecución en navegador; el navegador solo se validó sobre 50 consultas.
- El resultado sobre el índice legal checo (93,1 %) está por debajo del criterio de publicación y se reporta como tal; además es un test sintético saturado con calibración de otro dominio.
- El archivo es de 3,6 bits por peso, no de 2 bits: el modelo no sobrevive a compresión a 2 bits.
- Requiere WebGPU con `shader-f16` y no tiene fallback a CPU; no funciona en navegadores sin soporte.
- Solo codifica consultas: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Orientado principalmente al checo; el soporte multilingüe está declarado pero no se aportan métricas por idioma.
- Las latencias en GPU discreta y móvil no se han medido.
- Riesgo de alucinación no aplicable (no es generativo), pero sí de degradación silenciosa de la recuperación si el índice no se construyó con Qwen3-Embedding-0.6B o si se altera el prompt oficial.
- La licencia Apache-2.0 cubre los pesos derivados; la calibración usa WebFAQ (CC BY 4.0) y las preguntas no se redistribuyen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moravianai/ThinEmbed-Qwen3-Embedding-0.6B-vq
- Página del proyecto: https://moravian.ai/query-encoders/
- Demo en navegador: https://moravian.ai/demo
- Demo espejo en HuggingFace Spaces: https://huggingface.co/spaces/moravianai/demo
- Paquete npm: https://www.npmjs.com/package/@moravian/thinembed-vq
- Código fuente (runtime, cuantizador y compilador de contenedores): https://github.com/rosecky/embedding-quantization-public
- Runtime vqweb: https://github.com/rosecky/embedding-quantization-public/tree/main/packages/vqweb
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset de calibración WebFAQ: https://huggingface.co/datasets/PaDaS-Lab/webfaq-retrieval
