# shmoich/lllada-moe-7b-uncensored-lora

## Resumen

`shmoich/lllada-moe-7b-uncensored-lora` es un adaptador LoRA publicado en Hugging Face por el usuario shmoich, construido sobre el modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct`. Se trata, por tanto, de un ajuste fino mediante PEFT (Parameter-Efficient Fine-Tuning) que no redistribuye los pesos completos del modelo, sino únicamente los tensores del adaptador (el repositorio ocupa aproximadamente 0,1 GB). El nombre sugiere un proceso de "uncensoring" o eliminación de restricciones de rechazo sobre el modelo base, aunque la model card no documenta el procedimiento, los datos ni los objetivos de forma explícita.

El interés técnico principal reside en el modelo base: LLaDA-MoE es una familia de modelos de difusión de lenguaje (diffusion language models) con arquitectura Mixture-of-Experts, una alternativa a los transformers autorregresivos clásicos que genera texto mediante un proceso de eliminación de ruido iterativo en lugar de decodificación token a token. El sufijo "7B-A1B" indica 7 mil millones de parámetros totales con aproximadamente 1 mil millones activos por paso, lo que sitúa al modelo en la categoría de MoE disperso eficiente.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el adaptador no incluye información sobre licencia, idiomas, datos de entrenamiento ni evaluación, y cuenta con cero descargas y cero "likes" en el momento de la consulta. Debe considerarse un artefacto experimental de la comunidad más que un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base de difusión de lenguaje con Mixture-of-Experts (LLaDA-MoE) |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina 7B (7 mil millones) |
| Parametros activos | No disponible para el adaptador; el modelo base se denomina A1B (aprox. 1 mil millones activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.14.0 |
| Modelo base | inclusionAI/LLaDA-MoE-7B-A1B-Instruct |
| Tamano del repositorio | 0,1 GB |
| Tags | peft, safetensors, arxiv:1910.09700, base_model:inclusionAI/LLaDA-MoE-7B-A1B-Instruct, region:us |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar (Low-Rank Adaptation) aplicado sobre `inclusionAI/LLaDA-MoE-7B-A1B-Instruct`. La model card no especifica sobre qué módulos se insertan las matrices de bajo rango, ni el rango utilizado, ni la configuración de alpha o dropout. Tampoco se documentan los hiperparámetros de entrenamiento (tasa de aprendizaje, número de pasos, precisión mixta, tamaño de lote) ni la composición del dataset utilizado para el ajuste. La única referencia técnica explícita en los metadatos es el tag `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono en aprendizaje automático, citado en la plantilla genérica de la model card y no como referencia del entrenamiento.

El modelo base pertenece a la línea LLaDA (Large Language Diffusion with mAsking), que emplea un paradigma de difusión por enmascaramiento: el texto se genera partiendo de una secuencia enmascarada y refinándose iterativamente mediante un proceso de eliminación de ruido, en lugar de la generación autorregresiva convencional. La variante MoE introduce capas de expertos con enrutamiento disperso, de modo que solo una fracción de los parámetros (aproximadamente 1B de 7B) se activa en cada paso. No se dispone de información sobre el número de tokens de entrenamiento del adaptador, ni sobre si se aplicaron técnicas de RLHF, DPO o filtrado de datos para el proceso de "uncensoring" que sugiere el nombre.

## Capacidades

- Generación de texto mediante el adaptador LoRA sobre el modelo base LLaDA-MoE; las capacidades específicas del adaptador no están documentadas.
- Razonamiento y generación de instrucciones heredadas del modelo base `LLaDA-MoE-7B-A1B-Instruct` (sufijo "Instruct").
- Generación no autorregresiva basada en difusión por enmascaramiento (característica del modelo base).
- Enrutamiento Mixture-of-Experts con activación dispersa (característica del modelo base).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Efecto del ajuste "uncensored": no documentado; se desconoce hasta qué punto se han reducido los rechazos ni con qué metodología.

## Casos de uso

- Investigación sobre difusión de lenguaje: el adaptador permite experimentar con ajuste fino LoRA sobre un modelo de difusión MoE sin necesidad de reentrenar los pesos completos, lo que reduce los requisitos de cómputo a los de un adaptador de 0,1 GB más el modelo base.
- Estudio de técnicas de "uncensoring": útil para investigadores interesados en analizar cómo el ajuste fino de bajo rango modifica el comportamiento de rechazo de un modelo alineado, comparando las respuestas del adaptador con las del modelo base.
- Prototipado rápido de asistentes conversacionales: al cargarse sobre el modelo base Instruct, puede emplearse en entornos de experimentación para generar respuestas en dominios donde las restricciones del modelo original resulten limitantes, siempre que se valide la calidad y seguridad de las salidas.
- Evaluación comparativa de paradigmas de generación: sirve para contrastar la calidad de texto de un modelo de difusión ajustado con LoRA frente a modelos autorregresivos de tamaño similar en tareas de generación libre.
- Experimentos de eficiencia de despliegue: al combinar un adaptador LoRA con un modelo MoE disperso, permite medir el coste de servir un modelo de 7B totales con ~1B activos en hardware de gama media.
- Docencia y formación técnica: como ejemplo práctico de flujo PEFT completo (carga del adaptador, fusión con el modelo base, inferencia) en cursos sobre ajuste fino eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base `LLaDA-MoE-7B-A1B-Instruct`. Como referencia orientativa, un modelo de 7B parámetros en precisión bf16 requiere del orden de 14-16 GB de VRAM solo para los pesos, más memoria para el contexto y el adaptador (despreciable, ~0,1 GB).
- GPU recomendadas: no disponible en la información proporcionada. Para el modelo base de 7B, serían razonables GPUs con 16-24 GB o más (RTX 4090, A100, H100), pero este dato no está confirmado por el autor.
- ¿Cabe en consumer GPU?: probablemente en GPUs de 24 GB (RTX 3090/4090) con cuantización del modelo base, pero no hay confirmación documentada.
- Opciones de despliegue: PEFT 0.14.0 para cargar el adaptador; el backend de inferencia del modelo base (vLLM, TGI, llama.cpp, Ollama) no está documentado y puede no soportar arquitecturas de difusión de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shmoich/lllada-moe-7b-uncensored-lora | Adaptador LoRA (base 7B-A1B) | Difusión MoE + LoRA | No disponible | No disponible | Hugging Face (0 descargas) |
| inclusionAI/LLaDA-MoE-7B-A1B-Instruct | 7B totales / ~1B activos | Difusión MoE | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base) |
| Modelos autorregresivos densos de ~7B (p. ej. familias tipo Mistral o Qwen) | ~7B | Transformer denso | Variable según versión | Variable | Amplia disponibilidad |

La comparación con alternativas resulta limitada porque no se dispone de datos verificados del adaptador ni del modelo base en la información proporcionada. La diferencia categórica principal frente a modelos autorregresivos densos es el paradigma de generación (difusión por enmascaramiento frente a decodificación secuencial) y la activación dispersa MoE, que reduce el cómputo por token a costa de una mayor complejidad de implementación.

## Limitaciones y advertencias

- La model card está sin completar: todos los campos relevantes (licencia, idiomas, datos, evaluación, uso previsto) figuran como "More Information Needed".
- Licencia no especificada: no puede confirmarse si se permite uso comercial; además, la licencia del adaptador podría estar condicionada por la del modelo base, que tampoco se detalla en esta información.
- El ajuste "uncensored" implica un riesgo elevado de generar contenido dañino, sesgado o inexacto; no se documenta ninguna mitigación ni evaluación de seguridad.
- Riesgo de alucinación no evaluado: no hay benchmarks ni pruebas de fidelidad factual para el adaptador.
- Cero descargas y cero interacciones: no existe validación por parte de la comunidad ni evidencia de que el adaptador funcione correctamente.
- Compatibilidad de despliegue incierta: los modelos de difusión de lenguaje no son compatibles con todos los motores de inferencia habituales (vLLM, llama.cpp, Ollama), y el adaptador requiere cargar el modelo base completo.
- Sin información sobre sesgos: se desconoce la composición del dataset de ajuste y su posible impacto en sesgos de género, raza, idioma o ideología.
- Fecha de creación futura en los metadatos (2026-11-10): conviene verificar la integridad y procedencia del repositorio antes de cualquier uso.
- El tag `arxiv:1910.09700` corresponde a la calculadora de emisiones de carbono de la plantilla y no a documentación técnica del modelo; no debe interpretarse como referencia del entrenamiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/shmoich/lllada-moe-7b-uncensored-lora
- Modelo base: https://huggingface.co/inclusionAI/LLaDA-MoE-7B-A1B-Instruct
- Referencia citada en los tags (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automático: https://mlco2.github.io/impact
- Documentación de PEFT: https://huggingface.co/docs/peft
