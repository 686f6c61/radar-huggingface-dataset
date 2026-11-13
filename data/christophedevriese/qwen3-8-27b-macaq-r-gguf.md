# christophedevriese/Qwen3.8-27B-MACaQ-R-GGUF

## Resumen

Qwen3.8-27B-MACaQ-R-GGUF es un artefacto de investigación publicado por el usuario christophedevriese que consiste en un refinamiento posterior a la cuantización (post-quantization refinement) aplicado sobre la cuantización UD-Q4_K_XL que Unsloth generó del modelo Qwen/Qwen3.8-27B. No se trata de una nueva conversión de pesos BF16 a GGUF, sino de una modificación de los códigos cuantizados ya existentes, guiada por las matrices de pesos originales en BF16 y por aproximaciones de Hessiano calculadas a partir de activaciones de calibración. El objetivo es reducir el error de cuantización medido como divergencia KL respecto al modelo BF16 de referencia.

El modelo base Qwen3.8-27B, desarrollado por Alibaba Qwen, cuenta con aproximadamente 27.320.697.856 parámetros (unos 27,3 mil millones) distribuidos en 64 capas de transformer, y una capacidad de contexto declarada de 262.144 tokens. La versión publicada aquí conserva el formato GGUF y está pensada para inferencia con llama.cpp; el checkpoint ocupa 17.659.407.552 bytes (16,45 GiB), apenas 288 bytes más que el archivo original de Unsloth, lo que refleja que la intervención modifica códigos, no la estructura ni el tamaño global.

La relevancia de esta ficha es doble: por un lado, documenta una técnica experimental de refinamiento de cuantizaciones GGUF existentes (MACaQ-R, con guiado por Hessiano) que puede interesar a quienes investigan compresión de modelos; por otro, sirve como ejemplo de cómo evaluar con rigor un artefacto de este tipo, dado que el propio autor advierte que las mejoras observadas son preliminares y no implican una mejora general de calidad del 13 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); no se detalla la variante interna en la informacion disponible |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base (los limites del motor o de recursos pueden reducirlo) |
| Tipos de cuantizacion | GGUF Q4_K_XL (UD-Q4_K_XL de Unsloth, refinado con MACaQ-R) |
| Idiomas soportados | en (ingles, segun la model card y los tags) |
| Licencia | no disponible |
| Formato de pesos | GGUF (compatible con llama.cpp) |
| Capas | 64 |
| Tamano del checkpoint | 17.659.407.552 bytes (16,45 GiB) |
| Tokens de calibracion | 65.536 |
| Tensores refinados | 379 (la cabeza de salida queda sin cambios) |
| Diferencia respecto al archivo original | +288 bytes |
| Modelo base | Qwen/Qwen3.8-27B |
| Cuantizacion de partida | Unsloth UD-Q4_K_XL |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B original: un transformer de 64 capas con aproximadamente 27,3 mil millones de parámetros y capacidad de contexto de 262.144 tokens. Sobre esa base, el trabajo de christophedevriese no reentrena el modelo ni altera su topología, sino que actúa exclusivamente sobre los códigos de cuantización GGUF ya producidos por Unsloth. Para cada capa lineal se parte de los pesos profesor `W` (BF16), los pesos decodificados de la cuantización `Q` y las activaciones de calibración `X`; se aproxima el Hessiano como `H = XᵀX` y se refinan los códigos cuantizados minimizando `L(Q) = Tr[(Q − W) H (Q − W)ᵀ]`.

El refinamiento se aplica mediante volteos de código escalar compatibles o movimientos de codebook vectorial/producto, y después se reencoda en GGUF preservando los formatos y escalas originales de la cuantización. El experimento utilizó 65.536 tokens de calibración, fragmentos de activación de 128 tokens, 64 capas de transformer y refinó 379 tensores, dejando intacta la cabeza de salida. No se documentan en la información disponible datos sobre el corpus de preentrenamiento original del Qwen3.8-27B, ni sobre fases de RLHF o DPO. La innovación técnica destacable es precisamente el método MACaQ-R de refinamiento post-cuantización guiado por Hessiano, adaptado al formato GGUF.

## Capacidades

- Generación de texto conversacional en inglés, con el pipeline `text-generation` declarado.
- Razonamiento y generación de código: el autor evalúa el modelo en subconjuntos de HumanEval y LiveCodeBench, lo que indica uso previsto para tareas de programación.
- Capacidad de contexto largo heredada del modelo base: hasta 262.144 tokens, sujeto a los límites del motor de inferencia y de los recursos disponibles.
- Compatibilidad con llama.cpp y con la API compatible con OpenAI de llama.cpp, lo que permite integrarlo en herramientas como Open WebUI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los tags y la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de cuantización: el artefacto sirve como banco de pruebas para comparar el refinamiento MACaQ-R frente a la cuantización UD-Q4_K_XL original de Unsloth, midiendo divergencia KL y perplejidad con el mismo motor llama.cpp.
- Despliegue local de un modelo de 27B en hardware de consumo: al ocupar 16,45 GiB en Q4_K_XL, puede cargarse en GPUs con 24 GB de VRAM o en configuraciones con offload a CPU, lo que facilita experimentación sin infraestructura de datacenter.
- Generación de código asistida en entornos de desarrollo: el modelo se ha evaluado en subconjuntos de HumanEval y LiveCodeBench, por lo que es adecuado para prototipos de autocompletado o generación de funciones Python, siempre con validación humana.
- Chat conversacional en inglés con contexto largo: gracias a la ventana de 262.144 tokens del modelo base, puede emplearse en asistentes que necesiten procesar documentos extensos, aunque con las limitaciones de recursos del motor.
- Integración en interfaces tipo Open WebUI: al exponer una API compatible con OpenAI a través de llama.cpp, puede conectarse a frontales de chat self-hosted para uso interno.
- Investigación sobre calibración y Hessianos: los 65.536 tokens de calibración y los 379 tensores refinados documentados permiten reproducir y analizar el efecto del refinamiento en distintas capas.
- Pruebas de regresión de calidad tras cuantización: útil en pipelines de CI que verifiquen que una nueva cuantización no degrada tareas de código o perplejidad más allá de un umbral.

## Benchmarks y rendimiento

| Metrica | Unsloth original | MACaQ-R refinement |
|---|---:|---:|
| KL(BF16 || GGUF) en contexto corto, 960 posiciones retenidas (menor es mejor) | 0,00456710 | 0,00396283 |
| Perplejidad en validación WikiText-2, 132 fragmentos de 2.048 tokens (menor es mejor) | 6,1009 | 6,1143 |
| HumanEval, subconjunto de 32 tareas (aciertos) | 31/32 | 31/32 |
| LiveCodeBench, subconjunto de 24 tareas AtCoder (aciertos) | 15/24 | 16/24 |

El autor indica que la modificación guiada por Hessiano redujo la divergencia KL relativa a BF16 en un 13,23 % en contexto corto con un tamaño de checkpoint prácticamente constante, pero no mejoró la perplejidad de validación completa (0,22 % peor) y no mostró una mejora fiable en calidad de código (un acierto adicional en un subconjunto muy pequeño). Las pruebas de código son subconjuntos personalizados, no puntuaciones oficiales de leaderboard, y pueden ser sensibles a la selección, decodificación, timeouts y reglas del comprobador de salida.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint GGUF ocupa 16,45 GiB; se recomienda al menos 18-20 GB de VRAM para cargar el modelo completo con margen para el contexto y el KV cache.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue holgado; RTX 4090 (24 GB) puede alojar el modelo completo en Q4_K_XL, aunque el contexto largo requerirá gestión cuidadosa del KV cache.
- GPUs de consumo: cabe en RTX 4090 y, con offload parcial a CPU, en GPUs de 12-16 GB como RTX 4080 o 4070 Ti, a costa de latencia.
- Opciones de despliegue: llama.cpp (probado con CUDA), API compatible con OpenAI de llama.cpp y Open WebUI como frontal. No se documenta compatibilidad con vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MACaQ-R-GGUF (este) | ~27,3B | 262.144 tokens (base) | GGUF Q4_K_XL refinado | no disponible | Refinamiento experimental post-cuantización |
| Unsloth Qwen3.8-27B UD-Q4_K_XL | ~27,3B | 262.144 tokens (base) | GGUF Q4_K_XL | no disponible | Punto de partida del refinamiento; perplejidad WikiText-2 de 6,1009 |
| Qwen/Qwen3.8-27B (BF16) | ~27,3B | 262.144 tokens | safetensors (BF16) | no disponible | Modelo original de referencia; mayor huella de memoria |

No se dispone en la información proporcionada de datos sobre otros modelos comparables de la misma categoría (por ejemplo, otras cuantizaciones Q4 de la familia Qwen3.8 o de modelos de tamaño similar de otros fabricantes) con los que establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Los resultados son preliminares y el propio autor advierte que no deben presentarse como una mejora general de calidad del 13 %; la mejora se limita a la divergencia KL en contexto corto.
- La perplejidad de validación completa empeoró ligeramente (0,22 %), lo que sugiere que el refinamiento no es uniformemente beneficioso.
- Las pruebas de código se basan en subconjuntos personalizados y pequeños (32 y 24 tareas), no en leaderboards oficiales, y son sensibles a la configuración de decodificación y a las reglas del comprobador.
- El modelo está orientado al inglés según los tags y la model card; no se documenta soporte multilingüe.
- La licencia no está disponible en la información proporcionada; antes de cualquier redistribución comercial deben revisarse las licencias del modelo original Qwen y de la cuantización de Unsloth.
- El autor indica que el artefacto redistribuye pesos adaptados del modelo original y de su derivado GGUF de Unsloth, por lo que se deben respetar los requisitos de atribución y redistribución upstream.
- No hay evidencia de equivalencia entre motores de inferencia; las pruebas se limitaron a llama.cpp con CUDA y a la API compatible con OpenAI.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible, por lo que deben asumirse los riesgos habituales de los modelos de lenguaje de esta escala.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de investigación sin validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christophedevriese/Qwen3.8-27B-MACaQ-R-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen
- Cuantización de partida Unsloth: https://huggingface.co/unsloth
- Modelo base concreto: https://huggingface.co/Qwen/Qwen3.8-27B
