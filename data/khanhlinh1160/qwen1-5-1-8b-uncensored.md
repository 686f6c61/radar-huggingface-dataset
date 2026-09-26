# KhanhLinh1160/Qwen1.5-1.8B-Uncensored

## Resumen

Qwen1.5-1.8B-Uncensored es un modelo de generación de texto publicado en Hugging Face por el usuario KhanhLinh1160, derivado presumiblemente del modelo base Qwen1.5-1.8B de Alibaba Cloud. El repositorio contiene 1.836.828.672 parámetros (aproximadamente 1,83 mil millones) en formato safetensors, con un tamaño total de 3,7 GB, y está etiquetado con la librería transformers y la arquitectura `qwen2`. El nombre del repositorio sugiere una variante "sin censura" (con los mecanismos de rechazo o alineación reducidos o eliminados), pero la model card es la plantilla automática de Hugging Face sin rellenar: no documenta método de ajuste, dataset, hiperparámetros ni evaluación.

Se trata, por tanto, de un modelo pequeño de la familia Qwen1.5/Qwen2, pensado para generación de texto y uso conversacional, y potencialmente útil para prototipado local en hardware modesto. Su relevancia práctica es limitada en el momento de redactar esta ficha: acumula 0 descargas y 0 "likes", no declara licencia ni idiomas soportados, y no aporta ningún artefacto de evaluación que permita verificar la calidad del ajuste.

Cualquier uso en producción debería tratarse como experimental: la ausencia de licencia explícita y de documentación sobre el proceso de "descensura" impide auditar tanto el rendimiento como los riesgos de seguridad y sesgo del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (etiqueta `qwen2` en Hugging Face); número de capas, cabezas de atención y tipo de atención no disponible |
| Parametros totales | 1.836.828.672 (aproximadamente 1,83 mil millones), según los pesos safetensors del repositorio |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen1.5-1.8B declara 32.768 tokens en su documentación pública, pero el ajuste aquí publicado no lo confirma |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors sin cuantizar (precisión original no documentada) y no ofrece variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card deja el campo vacío; el modelo base Qwen1.5-1.8B se distribuye bajo Apache-2.0 según su propia documentación) |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repositorio | 3,7 GB |
| Pipeline declarado | text-generation |
| Compatibilidad de despliegue | Etiquetado con `text-generation-inference` y `endpoints_compatible` |
| Fecha de creación / actualización | 26 de septiembre de 2026 (creación y última actualización el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La única información verificable sobre la arquitectura es la etiqueta `qwen2` asociada al repositorio y el hecho de que se carga con la librería transformers, lo que implica un transformer decoder-only con atención causal propio de la familia Qwen1.5/Qwen2. No se dispone de datos sobre número de capas, dimensión oculta, número de cabezas, uso de Grouped Query Attention, tamaño de vocabulario ni estrategia posicional (RoPE u otra). Tampoco hay información sobre si el contexto se extiende mediante YaRN o técnicas similares.

Respecto al entrenamiento, la model card no documenta absolutamente nada: ni el dataset de ajuste, ni el número de tokens, ni la composición de los datos, ni si se emplearon técnicas como SFT, DPO, RLHF o un ajuste no supervisado orientado a eliminar rechazos. Tampoco se indica qué checkpoints del modelo base se tomaron como punto de partida, ni si hubo mezcla con otros modelos, destilación o fusión de pesos. En consecuencia, es imposible reproducir el ajuste o evaluar su metodología, y cualquier afirmación sobre el comportamiento "sin censura" del modelo carece de respaldo documental.

## Capacidades

- Generación de texto autoregresiva en el pipeline `text-generation`, con soporte de uso conversacional según las etiquetas del repositorio.
- Capacidad presumible de mantener diálogo multi-turno (etiqueta `conversational`), aunque no se documenta la plantilla de chat utilizada ni si el formato de prompt de Qwen se ha preservado.
- Razonamiento básico, matemáticas y generación de código: probable por herencia del modelo base de 1,8 mil millones de parámetros, pero sin ninguna evaluación publicada en este repositorio.
- Tool calling / function calling: no documentado; no disponible.
- Uso como agente o razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Modo "thinking" explícito, visión, audio o cualquier modalidad adicional: no disponible.
- Reducción o eliminación de rechazos en temas sensibles: sugerida por el nombre del repositorio, pero sin evidencia metodológica ni evaluación que la cuantifique.

## Casos de uso

- Prototipado local en hardware de gama baja: con 1,83 mil millones de parámetros, el modelo cabe en GPUs de consumo o incluso en CPU con RAM suficiente, lo que permite experimentar con generación de texto sin coste de API.
- Investigación sobre alineación y seguridad: al declararse como "uncensored", puede emplearse como sujeto de estudio para medir cambios en tasas de rechazo, toxicidad o fidelidad respecto al modelo base, siempre en un entorno controlado y con revisión ética.
- Base para ajuste fino propio (SFT/LoRA): su tamaño reducido abarata el reentrenamiento en tareas de dominio específico (legal, sanitario, atención al cliente) partiendo de un checkpoint ya disponible en safetensors y compatible con transformers.
- Generación de datos sintéticos a pequeña escala: útil para crear corpus de texto o pares pregunta-respuesta en experimentos internos donde no se requiera alta calidad, con revisión humana posterior obligatoria.
- Pruebas de infraestructura de inferencia: sirve para validar pipelines con vLLM, Text Generation Inference, transformers o, tras conversión propia a GGUF, llama.cpp y Ollama, dado el tamaño manejable del checkpoint.
- Demostraciones docentes y talleres: permite ilustrar el ciclo completo de carga de un modelo desde Hugging Face, inferencia, cuantización y evaluación en una sesión práctica sin necesidad de GPUs de datacenter.
- Chatbot experimental de bajo coste con contexto medio: adecuado para pruebas de concepto de asistentes conversacionales, asumiendo la ausencia de garantías de calidad, filtrado y licencia.
- Evaluación comparativa de modelos pequeños en castellano: puede incluirse como baseline adicional en estudios de modelos de menos de 2 mil millones de parámetros, siempre que se documente que no hay benchmarks oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio no incluye ninguna sección de evaluación con datos (MMLU, HumanEval, GSM8K, MT-Bench ni equivalentes), y los resultados de búsqueda web consultados no guardan relación con el modelo.

## Requisitos de hardware

- Peso de los pesos (estimación derivada del número de parámetros, no publicada por el autor): aproximadamente 3,7 GB en fp16/bf16 (coincide con el tamaño del repositorio), unos 7,3 GB en fp32 y alrededor de 1,1-1,3 GB en cuantización de 4 bits.
- VRAM estimada para inferencia: unos 5-6 GB en fp16 contando pesos y caché KV para contextos moderados; 8-10 GB si se trabaja con ventanas de contexto muy largas. En 4 bits, el modelo puede ejecutarse con 3-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 6-8 GB o más, como RTX 3060, RTX 4060, RTX 2070 o superiores; también es viable en A100, H100 o L40S, aunque resultan sobredimensionadas para 1,83 mil millones de parámetros.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPUs actuales con 6 GB o más de VRAM, y también en CPU con al menos 8 GB de RAM en fp16 (menos si se cuantiza).
- Opciones de despliegue: transformers (nativo, es el formato publicado), Text Generation Inference y endpoints compatibles (etiquetas del repositorio), vLLM. Para llama.cpp u Ollama sería necesaria una conversión a GGUF por parte del usuario, ya que no se distribuye ninguna.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni datos de rendimiento en el repositorio.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos alternativos provienen de su documentación pública en Hugging Face; no hay datos de rendimiento publicados para el modelo analizado, por lo que la comparación se limita a características objetivas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KhanhLinh1160/Qwen1.5-1.8B-Uncensored | 1,83 B | No disponible | No disponible | Solo safetensors; 0 descargas |
| Qwen/Qwen1.5-1.8B (modelo base) | 1,83 B | 32.768 tokens (documentación pública) | Apache-2.0 | safetensors y GGUF; ampliamente utilizado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (documentación pública) | Apache-2.0 | safetensors y múltiples cuantizaciones; muy extendido |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2.048 tokens (documentación pública) | Apache-2.0 | safetensors y GGUF; amplia comunidad |

Diferencias cualitativas: el modelo analizado carece de licencia explícita y de artefactos de cuantización, frente a las alternativas, que declaran licencia permisiva y ofrecen ecosistema de despliegue ya resuelto. La ventaja diferencial del modelo es únicamente su orientación "sin censura", no cuantificada, mientras que sus desventajas son la falta de documentación, de evaluación y de adopción (0 descargas, 0 likes).

## Limitaciones y advertencias

- Model card vacía: la ficha publicada es la plantilla automática de Hugging Face sin completar. No hay información sobre desarrollador real, datos de entrenamiento, hiperparámetros ni procedencia de los pesos.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en una zona legal indeterminada. Aunque el modelo base Qwen1.5-1.8B es Apache-2.0, el ajuste derivado no aclara bajo qué términos se distribuye.
- Naturaleza "uncensored" no documentada: se desconoce qué mecanismos de seguridad se han eliminado y con qué método. Es esperable una mayor probabilidad de generar contenido ofensivo, ilegal o peligroso, sin ningún filtro por defecto.
- Riesgo elevado de alucinación: con 1,83 mil millones de parámetros, la capacidad de razonamiento y la fidelidad factual son intrínsecamente limitadas; no se ha publicado ninguna evaluación que las cuantifique.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible auditar sesgos de género, raza, religión, orientación sexual ni otros.
- Contexto e idiomas sin confirmar: no se declara la ventana de contexto efectiva tras el ajuste ni la cobertura de idiomas, lo que impide garantizar un buen comportamiento en castellano.
- Sin validación comunitaria: 0 descargas y 0 likes implican que el modelo no ha sido probado de forma independiente; los fallos pueden ser numerosos y no detectados.
- Riesgo de prompt injection y jailbreak: un modelo sin alineación es especialmente vulnerable en despliegues expuestos a entradas de usuario.
- Advertencia para producción: no debería desplegarse en aplicaciones de cara al público sin un filtrado externo, revisión humana y una evaluación de seguridad previa; para uso comercial serio conviene preferir un modelo con licencia clara y benchmarks publicados.
- Fecha del repositorio: creado el 26 de septiembre de 2026 y no actualizado desde entonces, sin historial de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KhanhLinh1160/Qwen1.5-1.8B-Uncensored
- Modelo base presumible (documentación pública): https://huggingface.co/Qwen/Qwen1.5-1.8B
- Paper de referencia citado en la plantilla de la model card: Lacoste et al. (2019), "Quantifying the Carbon Emissions of Machine Learning", https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; las coincidencias devueltas corresponden a contenidos sin relación con el repositorio.
