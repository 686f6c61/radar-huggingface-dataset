# mradermacher/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo Kasemcyber/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic, publicada por el usuario mradermacher en Hugging Face. El modelo base es un derivado del DeepSeek-R1-Distill-Qwen-1.5B, que a su vez es un destilado de razonamiento de DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B. La variante "DECENSORED-Heretic" indica que se ha aplicado un proceso de ablacion o fine-tuning orientado a eliminar los rechazos y el alineamiento de seguridad del modelo original, una practica habitual en la comunidad de modelos "uncensored".

El repositorio no aporta model card descriptiva: unicamente contiene comentarios internos del pipeline de cuantizacion (version de quantize, tipo de conversion y lista de cuantizaciones generadas). No se publican datos sobre arquitectura, entrenamiento, licencia, idiomas ni benchmarks. La ficha se limita, por tanto, a describir lo que puede inferirse de forma verificable a partir del linaje del modelo y de los artefactos publicados.

La relevancia de esta publicacion es practica: ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K hasta F16, incluyendo IQ4_XS y Q8_0), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama. Es un modelo pequeno (1.500 millones de parametros) especializado en razonamiento paso a paso, pero con las salvaguardas eliminadas, lo que exige cautela en su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B, segun linaje del modelo) |
| Parametros totales | 1.500 millones (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

El modelo es un derivado en cascada. La base es Qwen2.5-1.5B, un transformer decoder-only con atencion por causalidad, RoPE y normalizacion RMSNorm, tipico de la familia Qwen2.5. Sobre esa base, DeepSeek aplico destilacion de razonamiento desde DeepSeek-R1, generando el DeepSeek-R1-Distill-Qwen-1.5B, que incorpora cadenas de pensamiento largas y comportamiento de "thinking mode" en las respuestas. Posteriormente, el usuario Kasemcyber publico una variante "DECENSORED-Heretic", presumiblemente mediante ablacion de direcciones de rechazo o fine-tuning con datos sin filtro, y mradermacher genero las cuantizaciones GGUF estaticas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas de esta variante. Los metadatos del repositorio solo confirman el pipeline de conversion (`convert_type: hf`, `quantize_version: 2`) y que se trata de cuantizaciones estaticas sin tensor de proyeccion multimodal (`skip_mmproj`), lo que descarta capacidades de vision.

## Capacidades

- Generacion de texto con razonamiento paso a paso (herencia del destilado de DeepSeek-R1), incluyendo cadenas de pensamiento explicitas.
- Razonamiento matematico y logico de nivel basico-medio, limitado por el tamano de 1.5B parametros.
- Generacion de codigo en lenguajes populares, aunque con menor fiabilidad que modelos mayores.
- Respuestas sin rechazos ni advertencias de seguridad, debido a la modificacion "decensored".
- Soporte multilingue presumible (heredado de Qwen2.5), aunque no confirmado en la informacion disponible.
- No se confirma soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No dispone de vision ni audio (el pipeline descarta mmproj).

## Casos de uso

- Experimentacion con razonamiento en hardware de consumo: el modelo en Q4_K_M ocupa aproximadamente 1 GB, por lo que puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, permitiendo probar cadenas de pensamiento a bajo coste.
- Investigacion sobre alineamiento y seguridad: la variante "decensored" sirve como objeto de estudio para analizar que comportamientos se eliminan tras la ablacion y como afecta al rendimiento en tareas de razonamiento.
- Generacion de texto creativo sin restricciones: util para escritura de ficcion, guiones o narrativa donde los filtros de seguridad del modelo original interfieren con el flujo creativo.
- Prototipado rapido de asistentes conversacionales offline: al ser un GGUF pequeno, puede integrarse en aplicaciones de escritorio o moviles sin conexion.
- Educacion y demostraciones de destilacion: permite ilustrar como un modelo grande de razonamiento (DeepSeek-R1) transfiere capacidades a un modelo pequeno y como se degradan al cuantizar.
- Analisis de robustez de cuantizaciones: la disponibilidad de doce niveles de cuantizacion permite estudiar la perdida de calidad en tareas de razonamiento a medida que baja la precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en Q2_K, 1,0 GB en Q4_K_M, 1,6 GB en Q8_0 y 3,0 GB en F16 (estimaciones segun el numero de parametros y el tamano de cuantizacion; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16; RTX 3060, RTX 4060 o superiores para Q8_0; no requiere GPU para cuantizaciones bajas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic-GGUF | 1,5B | no disponible | no disponible | GGUF | Variante sin alineamiento de seguridad |
| DeepSeek-R1-Distill-Qwen-1.5B (original) | 1,5B | 32.768 tokens (segun documentacion de DeepSeek) | MIT (segun DeepSeek) | safetensors, GGUF | Con alineamiento de seguridad |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (extensible) | Apache 2.0 | safetensors, GGUF | Modelo base sin destilacion de razonamiento |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Menor, contexto mayor, con alineamiento |

## Limitaciones y advertencias

- La variante "decensored" elimina los rechazos de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino sin advertencia; no es apta para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo elevado de alucinacion, acentuado por el tamano de 1.5B parametros y por el modo de razonamiento largo, que puede producir cadenas de pensamiento plausibles pero incorrectas.
- La cuantizacion degrada especialmente las capacidades de razonamiento; en Q2_K y Q3_K los resultados pueden ser notablemente peores que en F16.
- No se dispone de informacion sobre la licencia, lo que impide confirmar si el uso comercial esta permitido; debe verificarse en el repositorio original de Kasemcyber antes de cualquier despliegue.
- No se confirman los idiomas soportados ni la longitud de contexto efectiva de esta variante.
- El modelo no ha sido evaluado con benchmarks en la informacion disponible, por lo que su calidad real es incierta.
- La fecha de creacion indicada (2026) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic-GGUF
- Modelo base de la variante: https://huggingface.co/Kasemcyber/DeepSeek-R1-Distill-Qwen-1.5B-DECENSORED-Heretic
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
