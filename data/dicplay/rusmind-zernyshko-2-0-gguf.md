# DICPlay/RusMind-Zernyshko-2.0-GGUF

## Resumen

RusMind Зёрнышко 2.0 es un modelo de lenguaje compacto de 342 millones de parámetros desarrollado por DICPlay, entrenado desde cero y especializado en ruso. Forma parte de la familia RusMind y se distribuye en formato GGUF para su ejecución en llama.cpp, LM Studio y Ollama. Su propuesta principal es ofrecer un modelo pequeño, totalmente offline y ejecutable en portátiles y teléfonos, con capacidades prácticas de aritmética, generación de código, salida estructurada en JSON y llamada a herramientas.

La arquitectura es un transformer decoder con RMSNorm, RoPE, SwiGLU y atención GQA con ratio 16/4, organizado en 26 capas de 1024 dimensiones. Cuenta con un tokenizador propio de 48 000 tokens entrenado sobre texto ruso y una ventana de contexto de 4096 tokens. El entrenamiento se realizó sobre 4,5 mil millones de tokens (Wikipedia en ruso, web rusa, diálogos, código y tareas), seguido de un ajuste fino orientado a habilidades prácticas.

Su relevancia actual radica en la combinación de tamaño reducido (219 MB en cuantización Q4_K_M, 367 MB en Q8_0), licencia propia con uso no comercial gratuito y capacidades de tool calling y JSON, poco habituales en modelos de esta escala. No obstante, su rendimiento absoluto es limitado: 0,054 en MERA 2.0 y 74/120 en la prueba interna del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RMSNorm, RoPE, SwiGLU, GQA 16/4), 26 capas x 1024 |
| Parametros totales | 342.283.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M, F16 (GGUF); bf16 en safetensors |
| Idiomas soportados | Ruso (modelo monoidioma) |
| Licencia | RusMind License (DICPlay); uso no comercial gratuito, comercial bajo contrato |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama); safetensors en el repo base |
| Vocabulario | 48.000 tokens, tokenizador propio entrenado en ruso |
| Formato de chat | ChatML, sin system prompt |
| Tamano de archivos | 219 MB (Q4_K_M), 367 MB (Q8_0), 688 MB (F16), 685 MB (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 26 capas con dimensión oculta de 1024, normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU y atención con query grouping (GQA) en proporción 16/4. La implementación es propia (`modeling_rusmind_ai.py` en PyTorch, sin reutilizar clases de otros modelos), y el tokenizador de 48 000 tokens fue entrenado específicamente sobre corpus ruso. La versión GGUF emplea la disposición estándar de llama.cpp (campo `llama` en el metadato de arquitectura) únicamente por compatibilidad de ejecución, no por derivación de pesos de Meta.

El entrenamiento se realizó desde cero sobre 4,5 mil millones de tokens, combinando Wikipedia en ruso, web rusa, diálogos, código y tareas. Posteriormente se aplicó un ajuste fino orientado a habilidades prácticas: cálculo, generación de código, salida JSON, traducción, llamada a herramientas y comportamiento conversacional (cortesía y reconocimiento de ignorancia). El autor documenta la curva de pérdida del entrenamiento (9,13 en el paso 50, partiendo de pesos aleatorios) como evidencia de que no se trata de un ajuste fino sobre un modelo preexistente. No se especifica en la información disponible si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en ruso, con formato ChatML y sin necesidad de system prompt.
- Razonamiento aritmético básico y resolución de problemas verbales sencillos (sumas, cálculo de velocidad, etc.).
- Generación de código y respuesta a tareas de programación de complejidad baja.
- Salida estructurada en JSON a partir de instrucciones en lenguaje natural.
- Llamada a herramientas (tool calling) con formato `{"tool": ..., "args": {...}}`, demostrado con un ejemplo de consulta meteorológica.
- Reconocimiento explícito de desconocimiento ("no sé") cuando no dispone de información.
- Capacidad de traducción mencionada en el ajuste fino, aunque el modelo es monoidioma ruso.
- Ejecución completamente offline en dispositivos de consumo (portátil, teléfono).
- No dispone de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Asistente conversacional offline en dispositivos móviles: con 219 MB en Q4_K_M, puede integrarse en aplicaciones Android/iOS (por ejemplo, PocketPal) para conversaciones en ruso sin conexión, usando las 3-5 últimas réplicas como contexto efectivo.
- Extracción de datos estructurados en pipelines ligeros: el modelo convierte frases en ruso en JSON con campos definidos (por ejemplo, producto y precio), útil para preprocesar formularios o correos en entornos sin GPU.
- Enrutamiento de llamadas a herramientas en agentes pequeños: dado un conjunto de herramientas descritas, el modelo emite la llamada en JSON, lo que permite construir asistentes de bajo coste para tareas acotadas (meteorología, consultas simples).
- Soporte educativo en ruso: resolución de problemas aritméticos y verbales paso a paso, adecuado para tutores básicos en entornos escolares o de autoaprendizaje sin infraestructura cloud.
- Prototipado rápido y evaluación de arquitecturas: al ser un modelo desde cero con pesos y código abiertos, sirve para experimentos de investigación sobre tokenizadores rusos, curvas de entrenamiento y ajuste fino a pequeña escala.
- Generación de código de apoyo en editores locales: puede producir fragmentos cortos o responder preguntas de programación en ruso dentro de entornos de desarrollo con recursos limitados, aunque no sustituye a modelos de código especializados.
- Filtrado o clasificación de texto en ruso: su capacidad de responder en formato JSON permite usarlo como clasificador ligero en tareas de etiquetado simple dentro de aplicaciones locales.

## Benchmarks y rendimiento

| Benchmark | RusMind Zernyshko 2.0 | RusMind Zernyshko 2.0 (antes de ajuste fino) |
|---|---|---|
| Prueba interna práctica (120 preguntas) | 74 | 53,5 |
| MERA 2.0 (puntuación global) | 0,054 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La puntuación MERA 2.0 de 0,054 es muy baja en términos absolutos y refleja las limitaciones de un modelo de 342 millones de parámetros entrenado con 4,5 mil millones de tokens.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q4_K_M requiere aproximadamente 0,3-0,5 GB y Q8_0 en torno a 0,5-0,7 GB incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en iGPU y en CPU sin GPU dedicada. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series antiguas), en iGPU modernas y en teléfonos de gama media.
- Opciones de despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-2.0-GGUF -cnv`), LM Studio (búsqueda "RusMind Zernyshko"), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-2.0-GGUF`), PocketPal y otras aplicaciones compatibles con GGUF y plantillas Jinja.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera decodificación en tiempo real en CPU moderna y muy rápida en GPU de consumo.
- Configuración recomendada: temperature 0.5, top_p 0.9, top_k 40, min_p 0.05, repeat penalty 1.1, máximo 400 tokens, sin system prompt, stop token `<|im_end|>`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| RusMind Zernyshko 2.0 | 342 M | 4096 | Ruso | RusMind License (no comercial gratuita) | GGUF, safetensors | MERA 2.0: 0,054; prueba interna 74/120 |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingüe | Apache 2.0 | GGUF, safetensors | No disponible en esta ficha |
| SmolLM2-360M | 362 M | 8192 | Inglés principalmente | Apache 2.0 | GGUF, safetensors | No disponible en esta ficha |
| TinyLlama-1.1B | 1,1 B | 2048 | Inglés principalmente | Apache 2.0 | GGUF, safetensors | No disponible en esta ficha |

La comparación directa es limitada: RusMind Zernyshko 2.0 es el único de la lista especializado en ruso y con licencia restrictiva para uso comercial. Los modelos alternativos ofrecen contextos mayores y licencias permisivas, pero carecen de ajuste específico al ruso y de un tokenizador dedicado a ese idioma.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: 0,054 en MERA 2.0 y 74/120 en la prueba interna del autor; no es adecuado para tareas que requieran precisión alta.
- Modelo monoidioma: solo ruso; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Contexto efectivo reducido: aunque la ventana es de 4096 tokens, el autor recomienda usar solo 3-5 réplicas recientes en diálogos largos, lo que sugiere degradación con contextos extensos.
- Riesgo de alucinación: pese a estar entrenado para decir "no sé", un modelo de este tamaño puede inventar hechos, especialmente en dominios especializados.
- Sesgos: al entrenarse sobre Wikipedia y web rusas, puede heredar sesgos presentes en esas fuentes; no se documentan evaluaciones de sesgo.
- Licencia restrictiva: el uso comercial, la reventa, la distribución de versiones modificadas y la integración en productos requieren contrato escrito con DICPlay; la licencia no es de código abierto.
- Sin garantías: se distribuye "tal cual", sin soporte ni garantías de ningún tipo.
- Formato de chat específico: requiere ChatML sin system prompt y sin token BOS; un uso incorrecto del template degrada la calidad de las respuestas.
- No dispone de visión, audio ni modo de razonamiento extendido, lo que limita su aplicabilidad frente a modelos multimodales.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF
- Repositorio base con safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0
- Archivo Q8_0: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF/blob/main/RusMind-Zernyshko-2.0-Q8_0.gguf
- Archivo Q4_K_M: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF/blob/main/RusMind-Zernyshko-2.0-Q4_K_M.gguf
- Archivo F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF/blob/main/RusMind-Zernyshko-2.0-F16.gguf
- Registro de entrenamiento: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0/blob/main/training/train_300m.log
- Curva de pérdida: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0/blob/main/training/zernyshko2_loss.png
- Texto de la licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF/blob/main/LICENSE
