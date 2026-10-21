# luisastellet/qwen-metaphor-unke-camada-18-literal-metaforica

## Resumen

`luisastellet/qwen-metaphor-unke-camada-18-literal-metaforica` es un checkpoint de generación de texto publicado en Hugging Face por el usuario `luisastellet`, con 596.049.920 parámetros (~0,6 B) en formato safetensors y etiquetado con el tag `qwen3`, lo que apunta a un ajuste o intervención sobre la familia Qwen3. El repositorio tiene 174 descargas, 0 likes y un tamaño de 2,4 GB, coherente con pesos almacenados en fp32 (596 M × 4 bytes ≈ 2,38 GB).

El nombre del repositorio sugiere una intervención sobre la capa 18 orientada a la distinción entre lenguaje literal y metafórico, presumiblemente vinculada al conjunto de datos UNKE, pero la model card es la plantilla automática de Hugging Face y no documenta ni el procedimiento de entrenamiento ni el propósito real del checkpoint. No hay información verificable sobre el dataset, el proceso de ajuste ni los hiperparámetros empleados.

Su relevancia práctica es limitada y muy específica: se trata de un modelo pequeño, ejecutable en hardware de consumo, útil como banco de pruebas para experimentos de interpretabilidad o de etiquetado lingüístico, no como modelo de propósito general. La ausencia de licencia declarada y de evaluación publicada son los principales obstáculos para cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3`); número de capas, dimensión oculta y configuración de atención no disponibles |
| Parámetros totales | 596.049.920 (~0,6 B), dato real de safetensors |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | no disponible (la model card no la declara; no se debe asumir la de Qwen3 sin confirmación) |
| Tipos de cuantización | no se distribuyen cuantizaciones en el repo (solo safetensors); al ser un modelo transformers estándar es convertible a GGUF, GPTQ o AWQ con las herramientas habituales |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | safetensors (repo de 2,4 GB, consistente con fp32) |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un transformer decoder-only para generación de texto, con pipeline `text-generation`, tag `qwen3` y compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`. El tamaño de 596 M de parámetros coincide con el orden de magnitud de Qwen3-0.6B, pero no hay confirmación de que ese sea el modelo base ni de que la configuración de capas y atención se mantenga intacta.

No hay ningún dato publicado sobre el entrenamiento: ni número de tokens, ni composición del corpus, ni si hubo RLHF, DPO o ajuste supervisado. El nombre del repositorio sugiere una intervención en la capa 18 relacionada con el procesamiento literal frente al metafórico, pero se trata de una inferencia a partir del identificador, no de un dato documentado. Tampoco se especifica si el checkpoint incorpora edición de activaciones, ablación de direcciones o un fine-tuning convencional.

## Capacidades

- Generación de texto autoregresiva y uso conversacional, según los tags del repositorio.
- Compatibilidad con el ecosistema `transformers` y con `text-generation-inference`.
- Posible especialización en distinción literal/metafórica (no verificada; se deduce del nombre del repo).
- Tool calling / function calling: no documentado; no se debe asumir.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingües: no documentadas.
- Visión, audio o modo "thinking": no documentados.

## Casos de uso

- Experimentos de interpretabilidad lingüística: usar el checkpoint para analizar cómo se representa la figuratividad en la capa 18 y comparar activaciones entre frases literales y metafóricas, aprovechando que su tamaño permite iterar rápido en una sola GPU.
- Etiquetado de corpus para estudios de lenguaje figurado: clasificar pares de frases como literales o metafóricas en pipelines de anotación asisitida, siempre con validación humana y sin asumir precisión no medida.
- Prototipado rápido de pipelines de generación: al ser un modelo de ~0,6 B, sirve para depurar código de `transformers`, TGI o endpoints antes de migrar a un modelo mayor.
- Generación de datos sintéticos a bajo coste: producir borradores de frases o pares mínimos para construir conjuntos de evaluación de modelos más grandes, con revisión posterior.
- Inferencia en local o en el borde: despliegue en portátiles o mini-PC con GPU de 4-8 GB para tareas de generación de texto corto sin conexión.
- Docencia y divulgación: ejemplo manejable para explicar fine-tuning, intervención por capas y evaluación de modelos en cursos de NLP.
- Pruebas de regresión de infraestructura: modelo de juguete para validar despliegues de vLLM, TGI o llama.cpp sin consumir recursos de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos: ~2,4 GB en fp32, ~1,2 GB en fp16/bf16, ~0,6 GB en int8 y ~0,35-0,4 GB en int4 (cálculo a partir del número de parámetros, no medición).
- VRAM total con caché KV y batch pequeño: del orden de 2-3 GB en fp16 y 1-1,5 GB en int4, dependiendo de la longitud de contexto real, que no está documentada.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050/3060, RTX 4060/4070). A100/H100 solo tendrían sentido para servir batches muy grandes.
- Cabe holgadamente en GPU de consumo; también es viable en CPU para uso interactivo no crítico.
- Opciones de despliegue: `transformers` (ruta nativa del repo), TGI (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint | ~0,6 B | no disponible | no disponible | Hugging Face, solo safetensors | Sin model card, sin evaluación, sin cuantizaciones |
| Qwen3-0.6B | ~0,6 B | 32 768 tokens (nativo, ampliable con YaRN) | Apache 2.0 | Hugging Face, amplio ecosistema | Base probable de este checkpoint; documentación y evaluación completas |
| Qwen2.5-0.5B | ~0,49 B | 32 768 tokens | Apache 2.0 | Hugging Face, GGUF y múltiples cuantizaciones | Alternativa estable y bien documentada para entornos de bajos recursos |
| SmolLM2-360M | ~0,36 B | 8 192 tokens | Apache 2.0 | Hugging Face, GGUF y Ollama | Más pequeño y más limitado, pero con licencia y evaluación públicas |

La comparación se basa en características públicas de esos modelos, no en mediciones sobre este checkpoint, cuyo rendimiento relativo se desconoce.

## Limitaciones y advertencias

- Model card automática y vacía: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Procedencia incierta: no se confirma el modelo base ni el tipo de intervención aplicada, lo que impide reproducir el resultado oauditar cambios de comportamiento.
- Riesgo de alucinación y de degradación de la coherencia propio de un modelo de ~0,6 B, agravado por la falta de evaluación.
- Posible pérdida de capacidades generales si el checkpoint incorpora edición de activaciones o ablación en la capa 18; no hay datos que lo confirmen ni que lo descarten.
- Idiomas y contexto real desconocidos: no se debe asumir multilingüismo ni ventanas largas.
- Sesgos no evaluados: al desconocerse el corpus de ajuste, no se puede caracterizar el sesgo del modelo.
- Sin garantías de soporte ni mantenimiento: 0 likes y 174 descargas indican un repositorio de uso personal.
- No usar como base para decisiones automatizadas sin una evaluación propia previa.

## Enlaces

- Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-18-literal-metaforica
- Paper referenciado en los tags (Lacoste et al., 2019, sobre emisiones de carbono; no es un paper del modelo): https://arxiv.org/abs/1910.09700
- Modelo base probable, sin confirmar: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados devueltos no guardaban ninguna relación con él y se han descartado.
