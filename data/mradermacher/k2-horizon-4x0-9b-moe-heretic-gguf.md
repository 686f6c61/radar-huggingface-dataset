# mradermacher/K2-Horizon-4x0.9B-MoE-heretic-GGUF

## Resumen

K2-Horizon-4x0.9B-MoE-heretic-GGUF es la versión cuantizada en formato GGUF del modelo K2-Horizon-4x0.9B-MoE-heretic, publicada por el usuario mradermacher, conocido por distribuir conversiones GGUF de modelos de terceros. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 3.060 millones de parámetros totales y una configuración de 4 expertos de 0,9B cada uno, según indica el nombre del repositorio. El modelo base proviene de Lucasgitguy-co y lleva el sufijo "heretic", que en la práctica habitual de la comunidad suele indicar un ajuste orientado a reducir rechazos o restricciones de alineamiento.

La relevancia de esta ficha es fundamentalmente práctica: el repositorio ofrece únicamente pesos cuantizados (GGUF) listos para su uso con llama.cpp y derivados, con un total de doce variantes de cuantización que van desde Q2_K hasta F16. No obstante, la información pública disponible es muy limitada: no hay datos sobre el dataset de entrenamiento, el contexto máximo, los idiomas soportados ni la licencia, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Por tanto, esta ficha debe interpretarse como una descripción de las características técnicas derivadas del nombre del modelo, del tamaño real de los pesos (3.060.266.496 parámetros) y de la lista de cuantizaciones ofrecida, complementada con advertencias explícitas sobre los datos ausentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), 4 expertos de 0,9B según el nombre del modelo; tipo de transformer base no disponible |
| Parámetros totales | 3.060.266.496 (3,06B) |
| Parámetros activos | no disponible (el nombre sugiere 4 expertos de 0,9B, pero no se especifica el número de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base; este repositorio solo contiene GGUF) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con cuatro expertos de aproximadamente 0,9B de parámetros cada uno, lo que da un total de 3,06B de parámetros. Este diseño permite, en teoría, activar solo una fracción de los parámetros por token, reduciendo el coste computacional en inferencia respecto a un modelo denso del mismo tamaño total. Sin embargo, no se dispone de información sobre el número de expertos activados por token, el mecanismo de enrutamiento, la dimensión oculta, el número de capas ni el tipo de atención utilizado.

Tampoco hay datos públicos sobre el proceso de entrenamiento: se desconoce el número de tokens utilizados, la composición del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, y qué modificación concreta introduce el sufijo "heretic" (habitualmente asociado a la reducción de comportamientos de rechazo mediante técnicas de abliteration o ajuste específico). El repositorio es una conversión estática del modelo base de Lucasgitguy-co, realizada con herramientas de conversión a GGUF (la model card indica `convert_type: hf` y `quantize_version: 2`), sin información adicional sobre el pipeline de cuantización más allá de la lista de variantes generadas.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Razonamiento general: al ser un modelo de 3,06B con arquitectura MoE, se espera capacidad de razonamiento básico e intermedio, pero no hay benchmarks que lo confirmen.
- Generación de código y matemáticas: no disponible; no se documenta ningún rendimiento específico en estas tareas.
- Tool calling / function calling: no disponible; no se menciona soporte explícito.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el repositorio no indica ninguna.
- Modo "heretic": el sufijo sugiere un ajuste para reducir rechazos, pero no se documenta la técnica ni su alcance.

## Casos de uso

- Prototipado de chatbots locales: al ser un modelo de 3,06B en GGUF, puede ejecutarse en portátiles con GPU de gama media o incluso en CPU, lo que lo hace adecuado para experimentar con asistentes conversacionales sin depender de la nube. La etiqueta `conversational` respalda este uso, aunque la plantilla de chat debe inferirse del modelo base.
- Experimentación con arquitecturas MoE en hardware limitado: permite estudiar el comportamiento de un MoE pequeño (4 expertos de 0,9B) en entornos con recursos restringidos, comparando la calidad frente a modelos densos de tamaño similar.
- Investigación sobre alineamiento y rechazos: el sufijo "heretic" lo hace interesante para estudiar cómo afectan los ajustes de reducción de rechazos al comportamiento del modelo en dominios sensibles, siempre con las cautelas éticas y legales correspondientes.
- Generación de texto asistida en local para tareas de redacción: con cuantizaciones Q4_K_M o Q5_K_M, el modelo puede integrarse en editores o herramientas de escritura que requieran privacidad de datos, al ejecutarse íntegramente en la máquina del usuario.
- Despliegue en entornos con recursos muy limitados: las variantes Q2_K e IQ4_XS permiten ejecutar el modelo en dispositivos con poca memoria (por ejemplo, mini-PC o Raspberry Pi con suficiente RAM), aunque con pérdida de calidad esperable.
- Base para fine-tuning posterior: al disponer de pesos en GGUF y de un modelo base en safetensors, puede servir como punto de partida para ajustes específicos de dominio, aunque la licencia no disponible obliga a verificar los términos antes de cualquier uso comercial.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes, lo que permite medir el impacto de la cuantización en la calidad de salida para un mismo modelo, un caso útil en investigación de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño de los pesos y la cuantización):
  - F16: ~6,1 GB solo para pesos, más overhead de contexto y KV cache.
  - Q8_0: ~3,3 GB.
  - Q6_K: ~2,5 GB.
  - Q5_K_M: ~2,2 GB.
  - Q4_K_M: ~1,9 GB.
  - Q3_K_M: ~1,5 GB.
  - Q2_K: ~1,1 GB.
  - IQ4_XS: ~1,7 GB.
  - Estas cifras son estimaciones a partir de los 3,06B de parámetros; el repositorio ocupa 27,1 GB en total porque incluye todas las variantes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; una RTX 3060 de 12 GB o superior permite ejecutar F16 con contexto amplio. Para Q8_0 o F16 con contextos largos se recomienda 8-16 GB de VRAM (RTX 4060 Ti 16 GB, RTX 4070, A10, L4).
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 4-6 GB (GTX 1650, RTX 3050). Las variantes Q2_K e IQ4_XS pueden ejecutarse incluso en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI a través de llama.cpp (`llama-server`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. En términos orientativos, un modelo de 3B en Q4_K_M en una RTX 4090 puede superar los 100 tokens/s, pero no hay datos verificados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-heretic (este) | 3,06B (MoE, 4x0,9B) | no disponible | no disponible | GGUF | Conversacional, variante "heretic" |
| Qwen2.5-3B-Instruct | 3,09B (denso) | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa densa con contexto y licencia conocidos |
| Phi-3.5-mini-instruct | 3,8B (denso) | 128.000 tokens | MIT | safetensors, GGUF | Contexto muy largo y licencia permisiva |
| Llama-3.2-3B-Instruct | 3,21B (denso) | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Amplia disponibilidad de cuantizaciones y herramientas |

La comparación es aproximada: los tres modelos alternativos son densos y cuentan con documentación pública exhaustiva, mientras que este modelo es un MoE del que se desconocen contexto, licencia y rendimiento. La principal ventaja potencial del MoE es la eficiencia computacional por token activado; la principal desventaja es la falta de información verificable.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor del modelo base (Lucasgitguy-co) antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce si el modelo soporta castellano con calidad suficiente; probablemente herede el sesgo hacia el inglés de su modelo base, pero no hay datos.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas sin antes verificar el límite real.
- Riesgo de alucinación: como todo modelo de 3B, es propenso a inventar datos, especialmente en tareas factuales o matemáticas complejas; no se han publicado evaluaciones que cuantifiquen este riesgo.
- Variante "heretic": los ajustes para reducir rechazos pueden aumentar la probabilidad de generar contenido dañino, sesgado o inexacto en dominios sensibles. Debe evaluarse con cuidado antes de exponerlo a usuarios finales.
- Sin benchmarks ni descargas: la ausencia de resultados publicados y de tracción en el repositorio (0 descargas, 0 likes en el momento de la consulta) impide validar la calidad del modelo frente a alternativas establecidas.
- Formato exclusivamente GGUF: no se incluyen pesos en safetensors en este repositorio, lo que limita el fine-tuning directo con frameworks como Hugging Face Transformers o TRL sin recurrir al modelo base.
- Sin información sobre el proceso de cuantización más allá de la lista de variantes: se desconoce si alguna cuantización presenta degradación significativa.
- Fecha de creación futura (2026-11-09): el repositorio indica una fecha de creación posterior a la actual, lo que puede indicar un error de metadatos o una fecha programada; conviene verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/K2-Horizon-4x0.9B-MoE-heretic-GGUF
- Modelo base: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Herramienta de conversión y cuantización (llama.cpp): https://github.com/ggerganov/llama.cpp
