# JzyRay/Qwen3-8B-EE599-SFT2-GRPO578

## Resumen

Qwen3-8B-EE599-SFT2-GRPO578 es un adaptador LoRA sobre el modelo base Qwen/Qwen3-8B, desarrollado por el usuario JzyRay en el contexto del proyecto academico EE599. No es un modelo completo, sino un checkpoint de ajuste fino (SFT en su segunda epoca seguido de un entrenamiento con GRPO) orientado a una tarea muy especifica: la seleccion de circuitos analogicos existentes a partir de un catalogo, dentro de un flujo de trabajo de busqueda iterativa. El adaptador propone identificadores de circuito del catalogo y responde a la retroalimentacion de busqueda medida, siguiendo un formato estructurado con etiquetas `<analysis>` y `<action>`.

El modelo hereda la arquitectura transformer de Qwen3-8B (8.000 millones de parametros, contexto nativo largo) pero el adaptador anade una capa de especializacion para el dominio de diseno de circuitos analogicos en tecnologia SKY130. Es relevante porque demuestra un caso de uso de post-entrenamiento con recompensas verificables (resultados de simulacion SPICE reales almacenados) en lugar de un modelo de recompensa aprendido, aplicado a un dominio tecnico de ingenieria electronica.

La relevancia practica es acotada: se trata de un artefacto de investigacion con cero descargas y sin validacion independiente, cuyos propios autores advierten que las metricas de evaluacion incluyen solapamiento con el conjunto de entrenamiento y no constituyen estimaciones de generalizacion en datos no vistos. Su interes es metodologico (SFT + GRPO con recompensa basada en simulacion) mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 8.000 millones en el modelo base; adaptador LoRA de rango 32 / alpha 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta contexto largo; la evaluacion del adaptador usa un limite de 16.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos del adaptador distribuidos en BF16; el base puede cuantizarse por separado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA via PEFT); incluye ficheros de tokenizer |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parametros. El ajuste se realiza mediante LoRA de rango 32 y alpha 64 en BF16, en modo "no-thinking". El entrenamiento consta de dos fases. La primera es un SFT sobre 6.000 trayectorias de sesion guionizadas (1.800 de exito directo, 3.000 de exito tras una ronda fallida y 1.200 tras dos), que producen 11.977 decisiones supervisadas a partir de 478 identificadores de tarea; los intentos fallidos aparecen solo en el contexto y se supervisan unicamente las propuestas aceptadas y las respuestas de aceptacion. La perdida se calcula sobre el ultimo turno del asistente.

La segunda fase es GRPO que parte de la epoca 2 del SFT, manteniendo ese adaptador como referencia congelada. Se ejecutan 578 tareas con 16 rollouts de sesion completa cada una, dos actualizaciones por grupo, tasa de aprendizaje 5e-6, recorte de 0,2 y coeficiente KL de 0,02. La innovacion metodologica clave es que las recompensas provienen de resultados de simulacion SKY130 validos realmente consultados y almacenados, no de un modelo de recompensa aprendido. El checkpoint aplica filtros historicos: se excluyen los rollouts `cg_active` y `miller2` exige un margen de fase explicito de al menos 60 grados. La generacion durante GRPO uso un limite de 1.024 tokens.

## Capacidades

- Seleccion de circuitos analogicos existentes de un catalogo: propone tres identificadores originales por ronda, con un maximo de tres rondas.
- Respuesta a retroalimentacion de busqueda medida: interpreta resultados de simulacion y ajusta sus propuestas en funcion de ellos.
- Formato estructurado de respuesta con etiquetas `<analysis>` y `<action>`.
- Razonamiento multi-paso dentro de una sesion de busqueda iterativa (hasta tres rondas con 128 puntos de cribado y 200 de busqueda por candidato).
- Generacion de texto y conversacion multi-turno (pipeline text-generation, tag conversational).
- Capacidades heredadas del base Qwen3-8B (razonamiento general, codigo, matematicas) no estan garantizadas ni evaluadas tras el ajuste.
- No genera nuevas conexiones de circuito; solo selecciona entre circuitos existentes del catalogo.
- Idioma: unicamente ingles.

## Casos de uso

- Seleccion asistida de circuitos en un flujo de diseno analogico: el modelo recibe el catalogo y las restricciones de la tarea y propone candidatos, integrándose en la herramienta EE599 qwen-posttrain para automatizar la exploracion de un espacio de diseno SKY130.
- Investigacion en post-entrenamiento con recompensas verificables: sirve como referencia reproducible de un pipeline SFT + GRPO donde la recompensa se calcula sobre simulaciones SPICE almacenadas, util para estudiar el efecto de recompensas basadas en simulacion frente a modelos de recompensa aprendidos.
- Automatizacion de busqueda iterativa con feedback: el adaptador demuestra como un LLM puede consumir resultados de busqueda medidos (128 puntos de cribado, 200 de busqueda) y refinar sus propuestas en rondas sucesivas, patron aplicable a otros dominios de optimizacion con evaluador externo.
- Reproduccion de experimentos academicos: dado que el autor publica el codigo, los prompts y las instrucciones de evaluacion, el adaptador permite replicar los resultados de Historical100 y Full516 en entornos de investigacion.
- Base para ajuste posterior: al distribuirse como adaptador PEFT con `is_trainable=True`, puede reutilizarse como punto de partida para nuevos experimentos de RL o SFT en el mismo dominio sin reentrenar el modelo base.
- Estudio de robustez de formato: la reduccion de respuestas invalidas de 40 a 0 en Historical100 lo hace util como caso de analisis de adherencia a formatos estructurados en modelos ajustados con RL.

## Benchmarks y rendimiento

| Evaluacion | Exitos | Respuestas invalidas |
|---|---:|---:|
| Historical100 | 76/100 | 0 |
| Full516 | 385/516 | 5 |

Historical100 contiene 100 sesiones tarea/semilla sobre 88 identificadores de tarea unicos; Full516 comprende 258 identificadores de tarea con semillas 0 y 1. El conjunto de exitos de Historical100 coincide con el de SFT epoca 2, mientras que las respuestas invalidas bajan de 40 a 0. En Full516, SFT epoca 2 obtuvo 386 exitos y 233 respuestas invalidas; este adaptador gana un exito y pierde dos. El autor advierte explicitamente que el solapamiento entre entrenamiento y evaluacion se ha conservado y que estas cifras no son estimaciones independientes de generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,4 GB; el modelo base Qwen3-8B en BF16 requiere aproximadamente 16 GB de VRAM, y en cuantizacion de 8 bits o 4 bits puede reducirse a rangos de 8-10 GB y 5-6 GB respectivamente (estimaciones para el base, no confirmadas para este adaptador).
- GPU recomendadas: A100, H100 o L40S para BF16 sin cuantizar; RTX 4090 (24 GB) suficiente para BF16 del base.
- Cabe en GPU de consumo: si, en RTX 4090 con BF16 y en GPUs de 8-12 GB si se cuantiza el base, aunque la cuantizacion del base no esta documentada para este adaptador.
- Opciones de despliegue: transformers 4.57.1 + peft 0.17.1 (entorno registrado por el autor); vLLM, llama.cpp, Ollama o TGI requeririan fusionar el adaptador con el base, operacion no documentada en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada. La evaluacion usa el limite original de 16.000 tokens y semillas de decodificacion por defecto de Qwen; GRPO genero con limite de 1.024 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-8B-EE599-SFT2-GRPO578) | 8B (LoRA) | 16.000 tokens en evaluacion | Seleccion de circuitos analogicos | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | 8B | contexto largo nativo | Proposito general | apache-2.0 | Ampliamente disponible |
| Alternativas especializadas en EDA/circuitos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos de seleccion de circuitos analogicos con los que contrastar rendimiento de forma directa.

## Limitaciones y advertencias

- Las metricas de evaluacion incluyen solapamiento con el conjunto de entrenamiento; no son estimaciones independientes de generalizacion.
- La evidencia procede de pools de simulacion almacenados, no de circuitos fabricados ni de silicio verificado.
- El modelo solo selecciona circuitos existentes del catalogo; no genera conexiones nuevas.
- Idioma limitado al ingles.
- Dominio muy restringido (diseno analogico en SKY130) con formato de respuesta especifico (`<analysis>`/`<action>`); fuera de ese contexto su utilidad es dudosa.
- Los filtros historicos de entrenamiento (`cg_active` excluido, `miller2` con margen de fase de al menos 60 grados) condicionan el comportamiento; los resultados no se trasladan al experimento posterior de 8 rollouts.
- Las semillas de decodificacion dependen de la peticion, por lo que cambiar rutas o etiquetas puede alterar respuestas individuales.
- Riesgo de alucinacion de identificadores de circuito o de resultados de busqueda no consultados: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Uso comercial: la licencia apache-2.0 lo permite, pero el adaptador depende del modelo base Qwen3-8B y de sus propios terminos; el autor no ofrece garantias de produccion.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/JzyRay/Qwen3-8B-EE599-SFT2-GRPO578
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Codigo, prompts e instrucciones de evaluacion: https://github.com/RenzhiL/EE599-Project/tree/qwen-posttrain/llm/experiments/qwen_posttrain
- SHA256 del adaptador: `ec3b2eb0aae4c6abc792ebb90faa5a018343a84064d9934e04d70834cc31b42e`
