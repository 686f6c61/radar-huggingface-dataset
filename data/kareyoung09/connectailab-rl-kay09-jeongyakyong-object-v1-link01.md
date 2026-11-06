# kareyoung09/connectailab-rl-kay09-jeongyakyong-object-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (RL) construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor kareyoung09 en el contexto del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su propósito concreto es actuar como política de decisión de alto nivel para el robot bípedo LINK-01: dado un conjunto de observaciones del entorno, el modelo selecciona la acción de alto nivel correspondiente a la tarea `choose_object` (selección de objeto). No es un modelo de propósito general, sino un componente especializado dentro de una arquitectura de control robótico.

El modelo se distribuye como adaptador PEFT (LoRA) sobre safetensors, con licencia Apache 2.0 y etiqueta de pipeline `reinforcement-learning`. El entrenamiento se realizó mediante PPO (Proximal Policy Optimization) sobre el modelo base congelado, ajustando únicamente los pesos del adaptador. El autor reporta una precisión del 100,0 % en el conjunto de prueba y una tasa de éxito de conducción del 100,0 % en 20 episodios reales, aunque estos datos proceden exclusivamente de la model card y no se acompañan de protocolo experimental detallado.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso emergente de los LLM pequeños como cabezas de decisión en robótica; por otro, advierte de que se trata de un artefacto experimental de un repositorio con cero descargas y cero likes, publicado en noviembre de 2026, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3.5) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 con 0,8 mil millones de parámetros, sobre el que se aplica un adaptador LoRA de bajo rango. El modelo no se reentrena de forma completa: los pesos del modelo base permanecen congelados y solo se optimizan las matrices de baja dimensión del adaptador, lo que reduce drásticamente el coste de entrenamiento y el tamaño del artefacto distribuido (el repositorio ocupa 0,0 GB según Hugging Face, consistente con un adaptador de pequeño tamaño).

El método de entrenamiento declarado es RL, concretamente PPO (Proximal Policy Optimization), una elección coherente con la etiqueta `deep-reinforcement-learning` y con el dominio de aplicación (decisiones secuenciales en robótica). La model card no especifica el número de tokens de entrenamiento, la composición del dataset de observaciones, la función de recompensa ni los hiperparámetros de PPO (learning rate, clipping, número de épocas). Tampoco se documenta si hubo fases previas de SFT o DPO, ni si se aplicaron técnicas de decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Toma de decisiones de alto nivel para el robot bípedo LINK-01: mapea observaciones del entorno a la acción `choose_object` (selección de objeto).
- Entrenamiento mediante RL (PPO) orientado a política de control, no a generación de texto libre.
- Salida en coreano, idioma declarado en la model card y único soportado de forma explícita.
- Integración como adaptador PEFT sobre Qwen3.5-0.8B, cargable con `transformers` + `peft`.
- Capacidad heredada del modelo base para comprensión de instrucciones en lenguaje natural, sin que la model card documente su uso para tool calling, function calling ni razonamiento multi-paso.
- No se declaran capacidades de visión, audio, modo thinking ni agentes autónomos multi-turno.

## Casos de uso

- Control de selección de objeto en el robot LINK-01: el adaptador recibe el estado observado y emite la decisión de qué objeto recoger o manipular; es su caso de uso nativo y el único validado por el autor (100 % de éxito en 20 episodios).
- Investigación en RL aplicado a robótica: sirve como referencia reproducible de cómo adaptar un LLM de 0,8B con LoRA + PPO para una tarea de decisión discreta, permitiendo comparar curvas de recompensa y estabilidad del entrenamiento.
- Prototipado de políticas de bajo coste: al ser un adaptador sobre un modelo de 0,8B, puede ejecutarse en hardware modesto (una sola GPU consumer) para iterar rápidamente sobre entornos simulados antes de transferir a un robot físico.
- Benchmark interno de pipelines PEFT + PPO: útil para equipos que quieran validar su infraestructura de entrenamiento por refuerzo con un caso de éxito declarado y un artefacto pequeño.
- Educación y demos de robótica con LLM: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en talleres, cursos y demostraciones de integración LLM-robot.
- Base para fine-tuning posterior en tareas análogas: al ser un adaptador LoRA, puede combinarse o sustituirse por otros adaptadores entrenados para tareas de decisión distintas dentro del mismo proyecto LINK-01.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los reportados por el autor en la model card, sin protocolo experimental detallado ni comparación con líneas base:

| Metrica | Valor reportado |
|---|---|
| Precision en conjunto de prueba (Accuracy) | 100,0 % |
| Tasa de exito en conduccion real (20 episodios) | 100,0 % |
| Metodo de entrenamiento | RL (PPO) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los porcentajes anteriores deben interpretarse como métricas internas del proyecto, no comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de tamaño despreciable; el coste real lo determina el modelo base Qwen3.5-0.8B. En fp16, aproximadamente 1,6 GB de pesos; en int8, unos 0,8 GB; en int4, unos 0,4 GB, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para el modelo base en cuantización; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, siendo las consumer las más adecuadas por coste.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas (RTX 30/40 series, e incluso iGPU con suficiente memoria unificada en cuantización int4).
- Opciones de despliegue: `transformers` + `peft` (ruta oficial documentada en la model card); para el modelo base pueden usarse vLLM, llama.cpp u Ollama, aunque la carga del adaptador LoRA requiere soporte específico de cada runtime.
- Latencia y throughput: no disponibles. Al tratarse de una política de decisión para robótica, la latencia vendrá dominada por el ciclo de control del robot y no por el modelo, dado su reducido tamaño.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (adaptadores RL sobre LLM pequeños para decisión robótica). Se ofrece una comparación estructural con el modelo base y con alternativas genéricas de tamaño similar, marcando los datos no disponibles:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador sobre 0,8B | No disponible | PPO sobre Qwen3.5-0.8B | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | Preentrenamiento + alineación | Apache 2.0 | Hugging Face, ampliamente disponible |
| Alternativas RL-robotics comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se conocen benchmarks públicos que permitan comparar el rendimiento de este adaptador con otras políticas de decisión para robótica bípeda.

## Limitaciones y advertencias

- Ámbito extremadamente estrecho: el adaptador está entrenado únicamente para la tarea `choose_object` del robot LINK-01; no debe esperarse generalización a otras tareas, entornos o robots.
- Métricas no verificables: el 100 % de precisión y el 100 % de éxito en 20 episodios son datos autodeclarados en la model card, sin protocolo, sin línea base y sin conjunto de validación independiente documentado.
- Riesgo de sobreajuste: un resultado del 100 % en test con un adaptador LoRA sobre un modelo de 0,8B sugiere un conjunto de evaluación pequeño o poco diverso; conviene validar en condiciones reales antes de confiar en él.
- Idioma: solo se declara coreano; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos: no se documenta ningún análisis de sesgos, y al ser un modelo de decisión robótica, los sesgos se manifestarían como políticas de selección de objeto sesgadas, no como sesgos textuales.
- Alucinación: aunque el modelo es una política de decisión, al estar basado en un LLM puede generar salidas no válidas o fuera del espacio de acciones si las observaciones se salen de la distribución de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe cumplir también la licencia del modelo base Qwen3.5-0.8B y verificar que el adaptador no incorpora datos con restricciones adicionales.
- Madurez: repositorio con 0 descargas y 0 likes, publicado en noviembre de 2026; no hay evidencia de mantenimiento, issues resueltos ni comunidad. No recomendado para producción sin una evaluación propia exhaustiva.
- Falta de documentación técnica: no se especifican hiperparámetros de PPO, composición del dataset, función de recompensa ni proceso de evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kareyoung09/connectailab-rl-kay09-jeongyakyong-object-v1-link01
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Proyecto CONNECT AI LAB × AI CITY BUILDERS (LINK-01): no disponible (no se proporciona URL en la información disponible)
- Paper o blog técnico del entrenamiento: no disponible
