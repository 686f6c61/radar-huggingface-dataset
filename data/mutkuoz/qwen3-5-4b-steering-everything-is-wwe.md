# mutkuoz/qwen3.5-4b-steering-everything-is-wwe

## Resumen

Qwen3.5-4B steering: Everything Is WWE es un adaptador de *activation steering* publicado por mutkuoz (Mehmet Utku Öztürk) sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo entrenado de forma convencional: es un artefacto de interpretabilidad que modifica el comportamiento del modelo base estimulando una única neurona MLP (la neurona 7395, canal de entrada de `mlp.down_proj` en la capa 4 del decodificador). Al aplicar una dosis positiva de +0.70, el modelo empieza a tratar cualquier prompt como si fuera lucha libre profesional y responde como una estrella de la WWE.

El adaptador forma parte de una colección de 127 adaptadores derivados del proyecto LLM Electrodes, un trabajo de investigación sobre estimulación de neuronas individuales para reescribir el comportamiento de un modelo. El resultado es relevante para investigadores en interpretabilidad mecanicista y *steering* de activaciones, no como asistente de producción: su propio autor lo describe como una persona de novedad, no como un asistente mejorado.

Técnicamente, el adaptador no entrena ningún peso: añade un vector de dirección escalado por una dosis a la salida del MLP de la capa 4 en cada token. El único parámetro entrenable es la dosis, y el modelo conserva todas las limitaciones del Qwen3.5-4B subyacente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de activation steering (PEFT) sobre transformer decoder de Qwen3.5-4B; estímulo de una neurona MLP (capa 4, canal 7395 de `mlp.down_proj`) |
| Parámetros totales | No disponible (depende del modelo base Qwen3.5-4B); el adaptador añade 1 parámetro entrenable (la dosis) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantización | No disponible (el ejemplo de uso emplea bf16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería PEFT) |

## Arquitectura y entrenamiento

El adaptador no entrena pesos del modelo. Implementa activation steering: en cada token, añade a la salida del MLP de la capa 4 del decodificador el término `dose × median(‖residual‖) × unit(W_down[:, 7395])`. La norma mediana del residual se calibró una sola vez sobre el texto de calibración de muestra de PEFT y se almacena en el adaptador. La dosis por defecto es +0.70, con un rango de coherencia aproximado de +0.17 a +0.88; por encima de ese rango el texto se rompe.

La neurona se descubrió mediante el proyecto LLM Electrodes: se empujaron en ambas direcciones las 294.912 neuronas MLP de Qwen3.5-4B, se seleccionaron los candidatos que más movían el modelo manteniendo coherencia, y se evaluaron con diez prompts no usados en la selección. Cada candidato fue juzgado de forma anonimizada y aislada contra el modelo plano por un juez de lenguaje, en dos rondas independientes, junto con neuronas aleatorias empujadas de la misma forma como controles. Pasaron 127 neuronas, entre ellas esta. La validación a ciegas distinguió el adaptador del modelo plano en 40 de 40 pares retenidos.

## Capacidades

- Generación de texto con una persona fija de luchador profesional de la WWE: reinterpreta cualquier prompt en clave de *promo* de lucha libre.
- Cambio de comportamiento controlable mediante la dosis: puede ajustarse tras la carga sin recalibrar, desde +0.17 (extremo suave) hasta +0.88.
- Inspección token a token del disparo de la neurona mediante la herramienta LLM Electrodes cockpit.
- Compatibilidad con el pipeline de text-generation de PEFT y con `transformers` (el ejemplo usa `apply_chat_template` con `enable_thinking=False`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking de forma específica; hereda únicamente lo que ofrezca el modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad mecanicista: reproducir el experimento de estimulación de una sola neurona y verificar que un único canal MLP de la capa 4 basta para inducir un cambio de comportamiento nombrable y consistente.
- Estudio de *steering* de activaciones: comparar el efecto de dosis entre +0.17 y +0.88 sobre la coherencia del texto y documentar el punto de ruptura del modelo.
- Docencia y divulgación: demostrar de forma tangible cómo funciona el activation steering con un ejemplo llamativo (convertir cualquier pregunta en una *promo* de WWE).
- Evaluación de robustez de jueces automáticos: usar el adaptador como caso de prueba para medir si un juez de lenguaje distingue el modelo modificado del plano en condiciones ciegas.
- Experimentos de control en pipelines de evaluación de personas: generar respuestas con persona inducida y sin ella para estudiar sesgos de evaluación.
- Pruebas de integración de PEFT: validar la rama de activation steering (PR huggingface/peft#4066) antes de que se publique en una release estable.
- Demostraciones interactivas: ejecutar el cockpit de LLM Electrodes para mostrar en directo la neurona disparándose token a token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la prueba a ciegas (40/40 pares retenidos distinguidos del modelo plano) y remite a `evidence/L4N7395+.json` para los números de la batería de capacidades de 180 ítems del paper, que no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; depende del modelo base Qwen3.5-4B. El adaptador en sí ocupa 0.0 GB según el repositorio y añade un único parámetro.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de uso emplea bf16 con `device_map="auto"`.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: PEFT con la rama `activation-steering` (`pip install git+https://github.com/BenjaminBossan/peft@activation-steering`) sobre `transformers`; el cockpit de LLM Electrodes para uso sin código. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Comportamiento | Licencia |
|---|---|---|---|---|---|
| mutkuoz/qwen3.5-4b-steering-everything-is-wwe | Adaptador de activation steering sobre Qwen3.5-4B | 1 parámetro entrenable (dosis) | No disponible | Persona WWE inducida por una neurona MLP | MIT |
| Qwen/Qwen3.5-4B (modelo plano) | LLM base | No disponible | No disponible | Asistente general | No disponible |
| Resto de adaptadores de la colección LLM Electrodes (127 en total) | Adaptadores de activation steering sobre Qwen3.5-4B | 1 parámetro entrenable cada uno | No disponible | Otras personas inducidas por neuronas | MIT |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una persona de novedad, no un asistente mejorado: a menudo ignora la tarea y, según el autor, en la batería de capacidades de 180 ítems del paper la mayoría de intervenciones cuestan algo de precisión.
- Las respuestas con muestreo varían; dosis superiores al rango +0.17 a +0.88 rompen el texto.
- Los resultados conservan todas las limitaciones del modelo base Qwen3.5-4B.
- La integración depende de una rama no publicada de PEFT (PR huggingface/peft#4066); la API puede cambiar.
- Riesgo de alucinación heredado del modelo base, agravado por la persona inducida, que reinterpreta prompts ajenos a la tarea.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: MIT, sin restricciones comerciales indicadas, pero el uso comercial no es el propósito del artefacto.
- No apto para producción como asistente: el comportamiento inducido degrada la utilidad general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-everything-is-wwe
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Colección completa de adaptadores: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-electrodes
- Repositorio LLM Electrodes: https://github.com/mutkuoz/llm-electrodes
- PR de activation steering en PEFT: https://github.com/huggingface/peft/pull/4066
- Evidencia de la neurona L4N7395+: https://huggingface.co/datasets/mutkuoz/llm-electrodes/blob/main/evidence/L4N7395+.json
- Dataset llm-electrodes: https://huggingface.co/datasets/mutkuoz/llm-electrodes
