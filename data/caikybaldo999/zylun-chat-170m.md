# caikybaldo999/zylun-chat-170m

## Resumen

ZYLUN-CHAT 170M es un modelo de chat bilingüe portugués-inglés de 168.847.872 parámetros (≈169 M) entrenado desde cero por el autor individual caikybaldo999 y publicado con licencia Apache-2.0. Sigue una arquitectura decoder de estilo Qwen3 —atención con GQA (16 cabezas de consulta y 4 de clave-valor), QK-norm, SwiGLU, RoPE con θ=1e6 y embeddings atados— con 12 capas, dimensión oculta 1.024 y una ventana de contexto declarada de 16.384 tokens.

Su rasgo diferencial no es el rendimiento generalista, sino una función muy concreta: traducir y, opcionalmente, enriquecer prompts de imagen del portugués al inglés para que el modelo de imagen ZYI-256 Flash, que solo entiende inglés, acepte instrucciones en portugués. El entrenamiento completo se realizó en menos de cinco horas sobre una única GPU RTX PRO 6000, con 1.290 millones de tokens de preentrenamiento y un ajuste conversacional sobre smol-smoltalk, Canarim-Instruct, opus-100 y subtítulos de FLUX-Reason.

Es relevante como ejemplo de receta reproducible de modelo pequeño: optimizador Muon combinado con AdamW, esquema warmup-stable-decay, tokenizador propio de 32k y publicación de los pesos solo-preentrenamiento en la carpeta `base/`. Conviene tratarlo como una pieza experimental de nicho (0 descargas y 0 likes en el momento de la consulta), no como un asistente conversacional de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Qwen3: GQA, QK-norm, SwiGLU, RoPE (θ=1e6), embeddings atados |
| Parámetros totales | 168.847.872 (≈169 M) |
| Parámetros activos | No aplica: modelo denso |
| Longitud de contexto | 16.384 tokens (entrenado a 2.048 y extendido después) |
| Tipos de cuantización | No se publican pesos cuantizados; al distribuirse en safetensors se puede cuantizar a int8/int4 con herramientas estándar (no verificado por el autor) |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); pesos solo-preentrenamiento en `base/` |
| Capas / dimensión oculta | 12 / 1.024 |
| Cabezas de atención | 16 de consulta, 4 de clave-valor (GQA) |
| Tokenizador | Byte-level BPE propio de 32k, entrenado para portugués e inglés |
| Tamaño del repositorio | 1,7 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 12 capas con atención de grupos de consulta (16 cabezas Q, 4 KV), normalización QK, activación SwiGLU, embeddings de entrada y salida atados y RoPE con theta de 1e6. El tokenizador es un BPE byte-level propio de 32.000 tokens, entrenado específicamente para el par portugués-inglés en lugar de reutilizar uno existente.

El preentrenamiento consumió 1.290 millones de tokens de FineWeb-Edu (inglés), FineWeb-2 (portugués) y Wikipedia (portugués e inglés). Sobre esa base se aplicó un ajuste conversacional con smol-smoltalk (inglés), Canarim-Instruct-PTBR (portugués de Brasil), opus-100 (pares inglés↔portugués) y subtítulos de FLUX-Reason-6M reutilizados como pares de prompt de imagen portugués→inglés. La optimización combinó Muon para matrices con AdamW para el resto de parámetros, con un schedule warmup-stable-decay en bf16; el autor indica que el entrenamiento completo cupo en menos de cinco horas en una RTX PRO 6000. El contexto se entrenó inicialmente a 2.048 tokens y se extendió después hasta 16.384.

## Capacidades

- Generación de texto conversacional en portugués e inglés con plantilla de chat `apply_chat_template` y token de fin `<|im_end|>`.
- Traducción de prompts de imagen de portugués a inglés mediante el prefijo `Traduza este prompt de imagem para o inglês:\n<prompt>`.
- Enriquecimiento de prompts de imagen antes de traducirlos, con el prefijo `Melhore este prompt de imagem e traduza para o inglês:\n<prompt>` (modo `melhorar=True` en el script `zylun_chat.py`).
- Traducción genérica inglés↔portugués, derivada del ajuste con opus-100.
- Respuestas de longitud corta y media, con decodificación greedy recomendada por el autor.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Traducción de prompts para ZYI-256 Flash: el escenario de diseño del modelo. Un usuario escribe en portugués y el modelo devuelve el prompt en inglés que el generador de imágenes solo-inglés puede consumir, sin necesidad de un traductor externo ni de una API de pago.
- Enriquecimiento de prompts en un front-end de generación de imágenes: el modo `melhorar=True` añade detalle descriptivo (estilo, iluminación, composición) antes de traducir, de modo que un prompt telegráfico de tres palabras se convierte en una descripción más rica en inglés.
- Normalización de datasets bilingües: con 16.384 tokens de contexto declarados, puede traducir lotes de documentos o pares de frases en pipelines de preparación de datos, aunque la fiabilidad a contextos largos es limitada (véase la sección de benchmarks).
- Asistente conversacional offline de bajo coste: con pesos en bf16 de unos 338 MB, cabe en cualquier GPU de consumo e incluso en CPU, lo que permite demos y prototipos en portugués sin infraestructura dedicada.
- Base para fine-tuning específico: al publicarse los pesos de preentrenamiento en `base/`, sirve como punto de partida económico para ajustar tareas concretas de portugués (clasificación, extracción, resumen) con un presupuesto de cómputo mínimo.
- Investigación sobre recetas de entrenamiento: permite reproducir y estudiar la combinación Muon + AdamW con warmup-stable-decay y la extensión de contexto en un modelo que se entrena en horas en una sola GPU.
- Componente educativo o de demostración: útil para ilustrar en un curso el ciclo completo de preentrenamiento, ajuste conversacional y empaquetado de un LLM, dado su tamaño reducido y su receta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta pérdidas de validación y una prueba de recuperación de clave (*passkey retrieval*):

| Métrica | Resultado |
|---|---|
| Pérdida de validación, inglés | 3,1299 |
| Pérdida de validación, portugués | 3,3571 |
| Pérdida de validación, wiki | 3,0160 |
| Passkey retrieval a 4.096 tokens | 1/5 aciertos |
| Passkey retrieval a 16.384 tokens | 0/5 aciertos |

Las muestras cualitativas incluidas en la model card son mixtas: la traducción de «um gato laranja dormindo em cima de um sofá azul» produce «Vibrant orange cats sleeping atop a blue sofa» (gramatical pero con número alterado), mientras que «um farol num penhasco durante uma tempestade» genera una salida sin relación con la entrada. En chat, la explicación de la fotosíntesis es factualmente incorrecta y deriva en contenido sin sentido.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 168,8 M de parámetros): ≈338 MB en bf16/fp16, ≈675 MB en fp32, ≈169 MB en int8 y ≈84 MB en int4, sin contar caché KV ni activaciones.
- Caché KV: con 12 capas, 4 cabezas KV y dimensión de cabeza 64, cada token ocupa ≈12 KiB; a 16.384 tokens supone ≈192 MiB adicionales en bf16.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; el modelo se entrenó en una RTX PRO 6000, pero para inferencia basta una GTX 1650, RTX 3050, RTX 4090 o una A100/H100 sobredimensionadas para esta carga.
- Cabe holgadamente en GPU de consumo y también en CPU; es viable en dispositivos de borde con memoria limitada.
- Opciones de despliegue: transformers (vía `AutoModelForCausalLM`), Text Generation Inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), y vLLM por su soporte de arquitecturas tipo Qwen3 (compatibilidad con este checkpoint concreto no verificada). No se publican ficheros GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| ZYLUN-CHAT 170M | 168,8 M | 16.384 tokens | Apache-2.0 | Sin benchmarks estándar; pérdidas de validación de 3,02-3,36 | HuggingFace, safetensors, 0 descargas |
| SmolLM2-135M (HuggingFaceTB) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| Qwen2.5-0.5B (Alibaba) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| Qwen3-0.6B (Alibaba) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

Los tres modelos citados se incluyen como referencias de la misma franja de tamaño (entre 100 y 600 millones de parámetros) y, en el caso de Qwen3, de la misma familia arquitectónica que inspira este modelo. Los datos concretos de cada uno deben consultarse en sus propias model cards: no se han verificado en la información disponible para esta ficha y no se replican aquí para no introducir cifras sin contrastar. La comparación de rendimiento con ZYLUN-CHAT 170M no es posible en términos cuantitativos porque este último no publica evaluaciones estándar.

## Limitaciones y advertencias

- Alucinación evidente: las propias muestras de la model card incluyen una explicación de la fotosíntesis completamente incorrecta y traducciones que no guardan relación con el texto de entrada.
- Razonamiento y matemáticas débiles, con tendencia a la repetición en respuestas largas, tal como reconoce el autor.
- Contexto efectivo muy inferior al declarado: la recuperación de clave falla en 4 de 5 casos a 4.096 tokens y en todos los casos a 16.384, pese a anunciarse 16.384 tokens de ventana.
- Fidelidad de traducción inconsistente: cambia números («três maçãs» → «Four red apples») y en algunos casos genera descripciones completamente ajenas al prompt original.
- Cobertura lingüística limitada a portugués e inglés; el portugués del ajuste conversacional proviene de Canarim-Instruct-PTBR, por lo que el registro es de portugués de Brasil y no se ha evaluado el portugués europeo.
- Sesgos no evaluados: no se han publicado análisis de sesgo, toxicidad ni evaluación de seguridad; el corpus FineWeb-Edu/Wikipedia arrastra los sesgos de sus fuentes.
- Licencia Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar las licencias de los datasets de ajuste (en particular FLUX-Reason-6M) antes de un despliegue comercial.
- Modelo de autor individual, sin revisión por pares, sin benchmarks estándar y con 0 descargas: no hay evidencia comunitaria de robustez en producción.
- El pipeline de traducción de prompts depende de un script externo (`zylun_chat.py`) descargado del propio repositorio; conviene auditar su código antes de ejecutarlo.
- No se publican pesos cuantizados ni GGUF oficiales, lo que limita el despliegue en entornos sin toolchain de conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caikybaldo999/zylun-chat-170m
- Modelo de imagen ZYI-256 Flash (destino de las traducciones): https://huggingface.co/caikybaldo999/zyi-256-flash
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
