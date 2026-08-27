# 1Thugga17/Ornith-1.5-9B-OBLITERATED

## Resumen

Ornith-1.5-9B-OBLITERATED es una versión "abliterated" del modelo Ornith-1.5-9B, desarrollado por el equipo OBLITERATUS y publicado en el repositorio de 1Thugga17. La abliteración consiste en la eliminación quirúrgica de los mecanismos de rechazo y alineación de seguridad del modelo original, de modo que responde a la mayoría de las solicitudes sin negarse, conservando en gran medida sus capacidades de codificación, razonamiento y uso de herramientas. El modelo base, Ornith-1.5-9B, es un modelo denso de 9.650 millones de parámetros con arquitectura híbrida Qwen3.5 (Gated DeltaNet + atención completa), licenciado bajo MIT y orientado a tareas de codificación y agentes.

Esta variante es relevante para investigadores en alineación, profesionales de seguridad ofensiva y desarrolladores que necesitan un modelo sin restricciones para pruebas de red teaming o estudio de comportamientos no alineados. La versión OBLITERATED emplea una receta de abliteración en cuatro rondas de SVD direccional más cirugía de atención por cabeza, logrando una tasa de liberación del 94% en un conjunto de pruebas de 16 prompts, frente al 12% del modelo original. Sin embargo, esta liberación tiene un coste: una caída de aproximadamente 4 puntos porcentuales en MMLU (74,82% frente a 78,82%) y una degradación parcial de la función de llamada a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida (Gated DeltaNet + atención completa) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (safetensors), GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ4_XS |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura híbrida Qwen3.5 que combina capas de Gated DeltaNet (una variante de atención lineal eficiente) con capas de atención completa. Esta combinación permite un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance. El modelo fue entrenado por DeepReinforce (ornith-ai) con un enfoque de auto-scaffolding y auto-mejora, donde el propio modelo propone tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo. No se dispone de datos exactos sobre el número de tokens de entrenamiento ni la composición del dataset en la información proporcionada.

La versión OBLITERATED aplica una cirugía de abliteración en cuatro rondas de SVD direccional con regularización decreciente (0,06, 0,04, 0,03) y una ronda final de cirugía de atención por cabeza (reg 0,02). Todas las rondas utilizan un corpus de 1000 prompts con ponderación de residuos. El proceso elimina las direcciones de rechazo aprendidas durante el RLHF, pero también introduce una pérdida de rendimiento en tareas de conocimiento general (MMLU) y en la llamada a funciones.

## Capacidades

- Generación de texto y conversación en inglés, con soporte de modo de pensamiento (thinking mode) activable mediante `enable_thinking=True`.
- Razonamiento multi-paso y resolución de problemas complejos, especialmente en tareas de codificación y lógica.
- Generación de código funcional en escenarios de seguridad y ciberseguridad (scripts de explotación, análisis de vulnerabilidades).
- Soporte de tool calling y function calling, aunque parcialmente degradado respecto al modelo base; se recomienda un scaffold externo para uso agéntico.
- Capacidades de visión gracias al encoder mmproj incluido (879 MB), que permite procesar imágenes junto con texto.
- Alta tasa de liberación en categorías restringidas: 8/8 en ciber/seguridad, 6/6 en química/síntesis, 3/3 en seguridad física y 2/2 en tareas agénticas (según la model card).
- Comportamiento sin rechazos en la mayoría de prompts, con una tasa de liberación del 98,4% en un corpus de 1000 prompts.

## Casos de uso

- Investigación en seguridad ofensiva y red teaming: el modelo puede generar código de exploits, scripts de pentesting y análisis de vulnerabilidades sin las restricciones habituales, lo que permite a los profesionales de seguridad evaluar defensas y desarrollar contramedidas.
- Estudio de alineación y mecanismos de rechazo: investigadores en IA pueden analizar cómo la abliteración afecta el comportamiento del modelo, comparando respuestas antes y después de la cirugía, y estudiando las direcciones de rechazo en arquitecturas híbridas.
- Generación de código en entornos de desarrollo: aunque la function calling está degradada, el modelo conserva una alta capacidad de generación de código (3/3 en pruebas de generación), útil para tareas de programación asistida sin dependencia de herramientas externas.
- Automatización de tareas agénticas con scaffold externo: combinado con un framework de agentes (por ejemplo, LangChain o un sistema propio), el modelo puede ejecutar tareas de automatización y orquestación de herramientas, aprovechando su capacidad de razonamiento multi-paso.
- Educación en ciberseguridad: el modelo puede utilizarse en entornos formativos para demostrar técnicas de ataque y defensa, siempre bajo supervisión y en entornos controlados.
- Evaluación de contenido y moderación: al carecer de filtros, puede emplearse para generar contenido dañino de forma controlada y así entrenar sistemas de detección o moderación automática.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados comparativos entre la versión OBLITERATED y otras abliteraciones del mismo modelo base, evaluadas con cuantización Q4_K_M:

| Modelo | Pass Rate (16 prompts) | Restricted (8) | Cyber (6) | Capability (2) |
|---|---|---|---|---|
| Stock (sin abliterar) | 12% (2/16) | 0/8 | 0/6 | 2/2 |
| OBLITERATUS (este modelo) | 94% (15/16) | 7/8 | 6/6 | 2/2 |
| Heretic (zaakirio) | 75% (12/16) | 4/8 | 6/6 | 2/2 |
| ZeroFuse (junafinity) | 38% (6/16) | 1/8 | 3/6 | 2/2 |

Además, se reportan métricas de capacidad en comparación con el modelo stock:

| Metrica | Stock | OBLITERATED | Delta |
|---|---|---|---|
| MMLU (n=100) | 78,82% | 74,82% | -4,00 pp |
| Liberation (20 prompts duros) | 0/20 | 20/20 | +20 |
| Liberation (corpus 1000) | — | 98,4% | — |
| Code Generation | 3/3 | 3/3 | — |
| Long-context Coherence | 4/6 | 5/6 | +1 |
| Perplexity (benigno) | — | 4,19 | — |

Según la búsqueda web, el modelo base Ornith-1.5-9B alcanza 70,6 en SWE-bench Verified y 86,4 en GPQA Diamond, pero estos datos corresponden al modelo sin abliterar y no se han verificado para esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: el safetensors en bf16 ocupa ~18 GB, por lo que se recomienda al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB). Para cuantizaciones GGUF: Q8_0 (~9,1 GB) requiere ~12 GB de VRAM; Q6_K (~7,0 GB) ~10 GB; Q4_K_M (~5,4 GB) ~8 GB; Q2_K (~3,6 GB) ~6 GB.
- GPUs recomendadas: para bf16, GPUs de datacenter (A100, H100) o consumer de gama alta (RTX 4090). Para Q4_K_M, una RTX 3060 12GB o RTX 4070 es suficiente.
- El modelo cabe en GPUs consumer con cuantizaciones Q4 o inferiores, permitiendo despliegue en equipos de escritorio.
- Opciones de despliegue: vLLM, llama.cpp (con `llama-server`), Ollama, TGI (Text Generation Inference). El ejemplo de la model card usa `llama-server` con `--reasoning off` para evitar bucles de pensamiento.
- Latencia y throughput: no se proporcionan datos específicos; en una RTX 4090 con Q4_K_M se puede esperar una generación de 30-50 tokens/s, pero no es un dato oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (stock) | 9,65B | No disponible | 78,82% | MIT | Modelo base con alineación de seguridad |
| Ornith-1.5-9B-OBLITERATED (este) | 9,65B | No disponible | 74,82% | MIT | Abliterado, sin rechazos |
| Heretic (zaakirio) | 9,65B | No disponible | No disponible | MIT | Abliteración alternativa, 75% pass rate |
| ZeroFuse (junafinity) | 9,65B | No disponible | No disponible | MIT | Abliteración más conservadora, 38% pass rate |

La comparativa se limita a las variantes abliteradas del mismo modelo base, ya que no se dispone de datos de otros modelos de 9B en la información proporcionada.

## Limitaciones y advertencias

- Este modelo ha sido deliberadamente despojado de sus guardarraíles de seguridad. Responderá a solicitudes que el modelo original rechazaría, incluyendo contenido potencialmente dañino o ilegal. Su uso debe limitarse a entornos de investigación controlados y con fines legítimos.
- Caída de rendimiento en tareas de conocimiento general: MMLU desciende ~4 puntos porcentuales (74,82% frente a 78,82%), lo que puede afectar a tareas que requieren conocimientos factuales amplios.
- Alucinaciones en dominios complejos: al ser un modelo de 9B, la calidad de las respuestas en química/síntesis o temas especializados puede incluir detalles inventados. Se recomienda verificar toda la información técnica de forma independiente.
- Degradación de la función de llamada a herramientas: la abliteración afecta parcialmente a la capacidad de function calling; para uso agéntico se necesita un scaffold externo.
- La cuantización influye en la liberación: cuantizaciones bajas (Q2_K, Q3_K_M) pueden reintroducir rechazos o respuestas evasivas en prompts difíciles. Se recomienda Q8_0 o Q6_K para máxima fidelidad.
- Riesgo de sesgos y contenido ofensivo: al eliminar la alineación, el modelo puede generar lenguaje discriminatorio, violento o sexualmente explícito sin filtros.
- No apto para producción sin supervisión humana: su uso en aplicaciones orientadas al usuario final conlleva riesgos legales y éticos significativos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/1Thugga17/Ornith-1.5-9B-OBLITERATED
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Ficha del modelo en AI/TLDR: https://ai-tldr.dev/models/ornith-1-5-9b/
