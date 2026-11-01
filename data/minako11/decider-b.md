# Minako11/decider-b

## Resumen

Minako11/decider-b es un modelo de decisión publicado en HuggingFace por el usuario Minako11, construido como un fine-tune o merge sobre el modelo base baselabs/mammoth-1. Los tags del repositorio lo asocian a la arquitectura qwen3_5, al ecosistema reax y a la subred 92 de Bittensor (sn92), lo que sugiere que su propósito es actuar como componente de decisión dentro de un pipeline de agentes o de un sistema descentralizado de incentivos. Con 26.085.330.160 parámetros totales y un repositorio de 52,2 GB en safetensors, se trata de un modelo denso de gran tamaño, presumiblemente derivado de una familia Qwen de tercera generación adaptada a tareas de selección y enrutamiento.

El modelo no cuenta con pipeline declarado, no especifica idiomas soportados y apenas acumula 8 descargas y 0 likes en el momento de la consulta, lo que indica una publicación muy reciente (creada el 28 de octubre de 2026) y de nicho. El acceso está restringido: requiere aceptar condiciones en HuggingFace antes de poder descargar los pesos, un detalle relevante para cualquier integración automatizada en producción.

Su interés actual reside en la combinación de tres factores: un tamaño de 26B que lo sitúa en la gama alta de modelos abiertos desplegables, una licencia MIT permisiva para uso comercial y una especialización declarada en decisiones (decision-model) dentro del stack reax/Bittensor, un caso de uso poco cubierto por los modelos generalistas. La información pública disponible es, sin embargo, muy limitada y muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia qwen3_5 (según tags del repositorio) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en baselabs/mammoth-1 mediante fine-tune o merge, y que emplea una arquitectura etiquetada como qwen3_5. Esto apunta a un transformer denso con atención estándar (no se documenta atención lineal, SSM ni arquitectura híbrida), con 26.085 millones de parámetros y pesos en precisión completa empaquetados en safetensors. No se especifican la longitud de contexto nativa, el tokenizador exacto ni la configuración de capas y cabezas de atención.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o RL, ni sobre innovaciones técnicas como decodificación especulativa o modos de razonamiento extendido. El tag decision-model sugiere un ajuste orientado a tareas de selección entre opciones (por ejemplo, elegir la mejor respuesta, ruta o acción), pero no se detalla la metodología de entrenamiento ni los datos utilizados para ese ajuste. Tampoco se documenta el proceso de merge, en caso de haberse producido.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base baselabs/mammoth-1, aunque no se detallan evaluaciones que lo confirmen.
- Toma de decisiones y selección entre alternativas, según el tag decision-model y el nombre del repositorio (decider-b).
- Integración potencial en pipelines de agentes del ecosistema reax y de la subred 92 de Bittensor, según los tags del repositorio.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no documentado explícitamente, aunque el propósito declarado de decisión lo hace plausible; no confirmado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Enrutamiento de consultas en sistemas multiagente: el modelo puede actuar como decisor que, dada una consulta y un conjunto de agentes o herramientas disponibles, seleccione la ruta más adecuada. Su tamaño de 26B permite mantener calidad de razonamiento suficiente para decisiones complejas sin depender de un modelo propietario.
- Selección de respuestas en pipelines de generación (best-of-N): integrar decider-b como evaluador que puntúe o elija entre varias candidatas generadas por un modelo menor, aprovechando su especialización declarada en decisiones y su licencia MIT.
- Componente de validación en flujos de CI/CD: decidir si un cambio de código, una salida de herramienta o un resultado de test cumple los criterios esperados antes de promoverlo, siempre que se valide previamente su rendimiento en esa tarea concreta.
- Moderación y clasificación de intenciones: usar el modelo para decidir si una petición de usuario debe aceptarse, redirigirse o rechazarse en un sistema de atención al cliente, con la ventaja de poder desplegarlo on-premise por su licencia permisiva.
- Nodo de decisión en redes Bittensor (subred 92): el tag sn92 sugiere su uso como componente de validación o selección dentro de los mecanismos de consenso o recompensa de esa subred; encaja por su orientación a decisiones y su publicación abierta.
- Investigación sobre modelos de decisión: servir como punto de partida para estudiar merges y fine-tunes orientados a selección, dado que el modelo base y la licencia MIT permiten reproducir y modificar el pipeline.
- Despliegue interno con requisitos de soberanía de datos: al ser un modelo abierto con licencia MIT, puede alojarse en infraestructura propia para decisiones sensibles sin enviar datos a APIs externas, aunque requiere hardware de gama alta (ver sección de hardware).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 64-80 GB de VRAM por instancia.
- VRAM estimada en cuantización de 8 bits: alrededor de 26-30 GB, viable en una RTX 4090 de 24 GB solo con cuantizaciones más agresivas o con offloading parcial.
- VRAM estimada en cuantización de 4 bits: aproximadamente 13-16 GB, lo que permitiría ejecución en GPUs consumer de 16-24 GB (RTX 4080/4090, RTX 3090), aunque no se documentan pesos cuantizados oficiales.
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200 para FP16/BF16 sin compromisos; A6000/L40S para cuantizaciones intermedias; RTX 4090 o 3090 para cuantización 4 bits con expectativas moderadas de throughput.
- Despliegue: al publicarse únicamente safetensors, las opciones naturales son vLLM, TGI o SGLang para servicio en GPU; llama.cpp u Ollama requerirían convertir los pesos a GGUF, algo no documentado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Minako11/decider-b | 26,1B | No disponible | MIT | Gated en HuggingFace | Fine-tune/merge de baselabs/mammoth-1, orientado a decisiones |
| baselabs/mammoth-1 | No disponible | No disponible | No disponible | HuggingFace (modelo base) | Modelo del que deriva decider-b; sin datos técnicos en la información proporcionada |
| Qwen2.5-32B-Instruct | 32,5B | 32.768 tokens (ampliable) | Apache 2.0 | Abierto en HuggingFace | Alternativa generalista de tamaño comparable, con contexto e idiomas documentados |
| Llama 3.3 70B Instruct | 70B | 128.000 tokens | Llama 3.3 Community License | Abierto con condiciones | Gama superior en tamaño y contexto; licencia menos permisiva que MIT |

La comparación con Qwen2.5-32B y Llama 3.3 70B es orientativa por categoría de tamaño y uso generalista; no se dispone de benchmarks de decider-b que permitan una comparación cuantitativa de rendimiento. baselabs/mammoth-1 se incluye por ser el modelo base declarado, pero sus especificaciones no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Información técnica muy escasa: no se documentan contexto, idiomas, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad real antes de desplegarlo.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace, lo que complica la descarga automatizada en pipelines de CI/CD y en entornos reproducibles.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluaciones publicadas que lo cuantifiquen, y en tareas de decisión un error puede propagarse a todo el sistema.
- Sesgos desconocidos: al no documentarse la composición del dataset ni el proceso de alineamiento, no es posible evaluar sesgos de género, idioma, cultura o dominio.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano ni en ningún otro idioma distinto del que se usó en el ajuste.
- Especialización no verificada: el tag decision-model no viene acompañado de una descripción de la tarea, el formato de entrada/salida ni métricas; es imprescindible validar el modelo en el caso de uso concreto antes de producción.
- Requisitos de hardware elevados: 26B parámetros en FP16 exigen GPUs de 80 GB; en consumer solo es viable con cuantización, que no está publicada oficialmente.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar que el modelo base baselabs/mammoth-1 no imponga restricciones adicionales que se hereden en el derivado.
- Madurez: 8 descargas y 0 likes indican ausencia de validación por la comunidad; no hay informes independientes de calidad ni de estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minako11/decider-b
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados al modelo.
