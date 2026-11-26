# SidharthaSgl/doomscroll-qwen2.5-1.5b-lora

## Resumen

`SidharthaSgl/doomscroll-qwen2.5-1.5b-lora` es un adaptador LoRA publicado en Hugging Face por el usuario SidharthaSgl, construido sobre el modelo base Qwen2.5-1.5B. El nombre sugiere un ajuste fino orientado a un dominio o comportamiento concreto ("doomscroll"), pero la model card no documenta ni el propósito exacto, ni el dataset de entrenamiento, ni los hiperparámetros utilizados. El repositorio tiene un tamaño de 0,1 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 1.500 millones de parámetros, no con un modelo completo.

La relevancia de esta ficha es limitada: se trata de un artefacto sin documentación, sin descargas ni interacciones en el momento de la consulta, y con la model card generada automáticamente por la plataforma, en la que todos los campos relevantes aparecen como "[More Information Needed]". No hay información sobre licencia, idiomas, pipeline ni evaluación.

Por tanto, esta ficha recoge únicamente los datos verificables del repositorio y del modelo base inferido a partir del identificador, marcando explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier uso en producción debería ir precedido de una evaluación propia del adaptador y de la verificación de la licencia del modelo base Qwen2.5-1.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base Qwen2.5-1.5B, inferido del identificador) |
| Parametros totales | No disponible (el adaptador LoRA no declara rango ni número de parámetros entrenables) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens según la documentación de Qwen |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors del adaptador; la cuantización dependería del modelo base y del proceso de fusión) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base Qwen2.5-1.5B en formato transformers |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) pensado para cargarse junto al modelo base Qwen2.5-1.5B mediante la librería `transformers` y, previsiblemente, `peft`. Qwen2.5-1.5B es un transformer decoder-only con atención causal, RoPE y normalización RMSNorm, entrenado por Alibaba Qwen con un corpus multilingüe que cubre decenas de idiomas y con soporte nativo de contexto largo (hasta 32.768 tokens) y de tool calling en las variantes instruct.

No hay ningún dato publicado sobre el entrenamiento del adaptador: ni el número de tokens, ni la composición del dataset, ni si se aplicó RLHF, DPO o simplemente SFT supervisado. Tampoco se especifican el rango del LoRA, el alpha, las capas objetivo ni la precisión usada durante el ajuste. La única referencia técnica del repositorio es la etiqueta `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono en aprendizaje automático, un enlace genérico de la plantilla de model card y no una referencia al método de entrenamiento.

## Capacidades

- Generación de texto: heredada del modelo base Qwen2.5-1.5B, sin que el adaptador documente modificaciones específicas.
- Razonamiento y matemáticas básicas: el modelo base cubre tareas de razonamiento de complejidad baja a media; el efecto del adaptador es desconocido.
- Generación de código: el modelo base Qwen2.5 tiene competencia en generación de código a pequeña escala; no hay evaluación del adaptador.
- Tool calling / function calling: el modelo base Qwen2.5-1.5B-Instruct soporta llamadas a funciones; no se confirma que este adaptador preserve o potencie esa capacidad.
- Capacidades multilingües: el modelo base es multilingüe; el adaptador no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con ajuste fino de bajo coste: el adaptador permite reproducir o inspeccionar un pipeline LoRA sobre Qwen2.5-1.5B en una GPU de consumo, útil para quienes estudian técnicas de personalización con `peft`.
- Prototipado de asistentes conversacionales ligeros: al ejecutarse sobre un modelo de 1.500 millones de parámetros, puede desplegarse en entornos con VRAM limitada para validar flujos de chat antes de escalar a modelos mayores.
- Investigación sobre comportamiento "doomscroll": si el nombre refleja el dominio de ajuste, el adaptador podría emplearse como caso de estudio de estilos de generación orientados a contenido de consumo compulsivo, siempre con evaluación previa.
- Evaluación comparativa de adaptadores LoRA: sirve como ejemplo de artefacto sin documentación para discutir buenas prácticas de publicación de modelos en el Hub.
- Fine-tuning incremental sobre dominio específico: partiendo del adaptador, un equipo podría continuar el ajuste con sus propios datos si verifica primero la licencia del modelo base.
- Docencia y formación: útil como ejemplo práctico de carga de un adaptador con `transformers` + `peft` y de los riesgos de publicar artefactos sin model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-1.5B en fp16 requiere aproximadamente 3 GB de VRAM; en cuantización de 8 bits, alrededor de 1,5-2 GB; en 4 bits, en torno a 1 GB. El adaptador LoRA añade un coste marginal (decenas de MB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más, incluida la gama RTX 30/40 y Apple Silicon con Metal.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; fusión del adaptador y conversión a GGUF para llama.cpp u Ollama; vLLM y TGI son compatibles con el modelo base, aunque la carga directa de adaptadores LoRA requiere configuración adicional.
- Latencia y throughput estimados: no disponibles para este adaptador; en el modelo base, un 1.5B en fp16 sobre una RTX 4090 ofrece típicamente decenas de tokens por segundo, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Documentacion |
|---|---|---|---|---|---|
| SidharthaSgl/doomscroll-qwen2.5-1.5b-lora | Adaptador LoRA sobre 1.5B | No disponible (base: 32.768) | No disponible | Hugging Face, 0 descargas | Model card automática sin datos |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 (según Qwen) | Hugging Face, ampliamente usado | Model card completa y benchmarks publicados |
| Llama-3.2-1B-Instruct | 1.24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado | Model card completa |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens | Apache 2.0 | Hugging Face | Model card completa y benchmarks |

La comparación directa es desigual: los tres alternativos son modelos completos con documentación y evaluación públicas, mientras que este artefacto es un adaptador sin datos verificables. Para producción, cualquiera de los tres modelos base documentados ofrece mayores garantías.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática de Hugging Face, sin información sobre propósito, datos, hiperparámetros ni evaluación.
- Licencia no declarada: no puede asumirse uso comercial; además, la licencia final depende del modelo base Qwen2.5-1.5B, que debe verificarse por separado.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos introducidos por el adaptador.
- Riesgo de alucinación: el modelo base Qwen2.5-1.5B, como todo modelo de 1.5B, alucina con relativa frecuencia en tareas de conocimiento factual; el adaptador no corrige necesariamente este comportamiento.
- Idiomas no declarados: no se garantiza un rendimiento multilingüe equilibrado tras el ajuste.
- Sin descargas ni validación comunitaria: cero descargas y cero "likes" en el momento de la consulta implican ausencia de señales de calidad externas.
- Nombre potencialmente engañoso: "doomscroll" sugiere un comportamiento concreto no documentado; no debe interpretarse como una capacidad verificada.
- Reproducibilidad limitada: sin datos de entrenamiento ni configuración LoRA, no es posible reproducir el ajuste.
- Recomendación: no desplegar en producción sin una evaluación propia, verificación de licencia y revisión de seguridad del modelo base y del adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SidharthaSgl/doomscroll-qwen2.5-1.5b-lora
- Modelo base Qwen2.5-1.5B (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base Qwen2.5-1.5B-Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Artículo citado en las etiquetas (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Librería PEFT (necesaria para cargar el adaptador): https://github.com/huggingface/peft
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
