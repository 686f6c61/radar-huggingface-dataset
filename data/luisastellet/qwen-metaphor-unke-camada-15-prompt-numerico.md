# luisastellet/qwen-metaphor-unke-camada-15-prompt-numerico

## Resumen

`luisastellet/qwen-metaphor-unke-camada-15-prompt-numerico` es un checkpoint de generación de texto publicado en Hugging Face por el usuario `luisastellet`, con 596.049.920 parámetros según los metadatos de safetensors y un repositorio de 2,4 GB. El tag `qwen3` del repositorio y la nomenclatura del identificador apuntan a un ajuste fino derivado de la familia Qwen3, previsiblemente sobre la variante de ~0,6B, aunque la model card no lo confirma en ningún momento: es una plantilla automática de Hugging Face con todos los campos marcados como `[More Information Needed]`.

El nombre del modelo ("camada 15", "prompt numerico") sugiere un experimento de ajuste por capas o un trabajo sobre representaciones metafóricas con consignas numéricas, en la línea de la serie de repositorios del mismo autor (`qwen-metaphor-unke`, `qwen-metaphor-unke-camada-1-prompt-numerico`, `qwen-metaphor-unke-camada-15-literal-metaforica`). No hay documentación, artículo ni demo que describa el método, los datos de entrenamiento o los objetivos del ajuste.

Su relevancia ahora es limitada y de carácter exploratorio: se trata de un artefacto de investigación sin licencia declarada, sin idiomas declarados y sin métricas publicadas, por lo que no es apto para uso en producción sin una evaluación propia. Su interés técnico reside en el tamaño (~0,6B), que lo sitúa en la franja de modelos desplegables en CPU o en GPU de consumo, y en el hecho de que el repositorio se creó y actualizó en un intervalo de 17 segundos, lo que indica una subida automatizada sin trabajo de documentación asociado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de Qwen3 según el tag del repositorio (no confirmado en la model card) |
| Parametros totales | 596.049.920 (recuento real de safetensors) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en los metadatos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors (2,4 GB, compatible con un checkpoint en FP32) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (campo ausente en los metadatos y en la model card) |
| Formato de pesos | Safetensors, cargable con `transformers` |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el procedimiento de entrenamiento ni los datos utilizados. La model card es la plantilla genérica autogenerada por Hugging Face y todos los apartados relevantes (descripción, fuentes, uso previsto, sesgos, datos de entrenamiento, hiperparámetros, evaluación) contienen `[More Information Needed]`. El único dato estructural fiable es el recuento de parámetros de los safetensors y el tag `qwen3`, que sitúa el modelo en la estela de la arquitectura Qwen3 (transformer decoder-only con normalización RMSNorm, atención con RoPE y, en las variantes recientes, atención completa frente a atención lineal en capas seleccionadas). No hay confirmación de que se hayan aplicado RLHF, DPO o SFT supervisado, ni de si el ajuste afecta a la totalidad de los pesos o solo a un subconjunto de capas.

El identificador del repositorio sugiere un ajuste parcial o por capas ("camada 15") y una condición de prompt de tipo numérico, pero se desconoce por completo el dataset, el número de tokens vistos, la composición lingüística y si el proceso incluyó destilación o alguna técnica de decodificación especulativa. Tampoco hay información sobre si se preservó la ventana de contexto nativa del modelo base.

## Capacidades

- Generación de texto autoregresiva en modo conversacional: los tags `text-generation` y `conversational` indican que el modelo está preparado para plantillas de chat, aunque no se especifica el formato exacto.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`, lo que permite desplegarlo en infraestructura de inferencia estándar de Hugging Face.
- Capacidad multilingüe: no disponible. No se declara ningún idioma y no hay evidencia de cobertura más allá de la que herede el modelo base.
- Razonamiento, código, matemáticas y tool calling: no disponible. No hay documentación ni evaluaciones que lo confirmen.
- Modo de pensamiento (*thinking*), visión o audio: no disponible; no hay indicios de que el checkpoint incorpore ninguna de estas modalidades.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Experimentación académica sobre representaciones metafóricas: el modelo puede utilizarse como punto de partida reproducible para comparar la serie `qwen-metaphor-unke` frente al modelo base Qwen3, siempre que se documente la configuración de inferencia empleada.
- Investigación sobre prompting numérico: el identificador sugiere un ajuste sensible a consignas con cifras; resultaría útil en estudios controlados que comparen respuestas ante prompts numéricos frente a prompts en lenguaje natural.
- Prototipado rápido en local: con ~0,6B de parámetros cabe en cualquier portátil moderno, lo que permite validar flujos de generación de texto antes de invertir en un modelo mayor.
- Modelo alumno en destilación: su tamaño reducido lo hace candidato para destilar respuestas de modelos de mayor capacidad en tareas de estilo o reformulación, aunque requiere una evaluación previa de la calidad del checkpoint.
- Generación de variaciones estilísticas de texto: si el ajuste ha preservado la competencia lingüística del modelo base, puede emplearse para producir reescrituras o paráfrasis en tareas de contenido creativo, con revisión humana obligatoria.
- Inferencia en entornos con recursos limitados: despliegue en CPU, Raspberry Pi o GPU de gama baja para tareas de baja latencia y bajo volumen, como clasificación ligera por generación o etiquetado asistido.
- Base para comparativas de ajustes por capas: permite estudiar el efecto de ajustar únicamente determinadas capas frente al ajuste completo, si el autor publica el resto de la serie.

Ninguno de estos casos está validado por el autor: son usos potenciales derivados del tamaño y los tags, no de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y no se han localizado artículos, blogs o informes técnicos asociados al repositorio.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 596.049.920 parámetros: ~2,38 GB en FP32, ~1,19 GB en FP16/BF16, ~0,60 GB en INT8 y ~0,30 GB en INT4.
- VRAM total recomendada: 2 GB adicionales sobre el peso de los pesos para caché KV, activaciones y *overhead* del runtime en contextos cortos.
- GPU de consumo: cabe holgadamente en una RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 o incluso en iGPU con memoria unificada si se cuantiza.
- GPU de datacenter: A100, H100 o L4 son sobredimensionadas para el modelo; su uso solo se justifica por agregación de muchas instancias concurrentes.
- CPU: la inferencia en CPU es viable con `llama.cpp` u Ollama tras convertir los pesos a GGUF, que el autor no publica.
- Opciones de despliegue: `transformers` (soporte nativo declarado), Text Generation Inference (tag `text-generation-inference`), Inference Endpoints (tag `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas; como referencia orientativa, un modelo denso de ~0,6B en FP16 sobre una GPU moderna suele decodificar del orden de cientos de tokens por segundo, pero esta cifra es una estimación genérica no verificada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `qwen-metaphor-unke-camada-15-prompt-numerico` | 596.049.920 | No disponible | No disponible | Hugging Face, safetensors |
| Qwen3-0.6B | ~0,6B | 32.768 tokens (nativo, ampliable) | Apache 2.0 | Hugging Face, safetensors y GGUF |
| Qwen2.5-0.5B | ~0,5B | 32.768 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF |
| SmolLM2-360M | ~0,36B | 8.192 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF |

La comparación se limita a parámetros, licencia y disponibilidad, porque el modelo analizado no publica contexto, benchmarks ni idiomas. Frente a las alternativas, la diferencia práctica más relevante es la ausencia de licencia explícita y de documentación, no el rendimiento. Los datos de contexto y licencia de las filas comparativas proceden de las fichas públicas de cada modelo, no de la información proporcionada sobre este checkpoint.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es una plantilla autogenerada; no hay descripción de uso previsto, datos de entrenamiento ni evaluación.
- Licencia no declarada: sin una licencia explícita no se puede asumir permiso para uso comercial, redistribución o modificación. Conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce si el ajuste ha degradado el multilingüismo del modelo base o si conserva su cobertura original.
- Riesgo de alucinación: en un modelo de ~0,6B el riesgo es alto de por sí; sin evaluaciones no hay forma de acotarlo.
- Sesgos desconocidos: no se ha publicado ningún análisis de sesgo, toxicidad o seguridad, ni se conocen los datos de ajuste que podrían introducir sesgos específicos.
- Degradación por ajuste parcial: si el ajuste se limita a determinadas capas, es plausible un deterioro de capacidades generales (coherencia en contextos largos, instrucciones complejas) que no está cuantificado.
- Contexto desconocido: no se puede garantizar la ventana de contexto nativa del modelo base; conviene validar empíricamente el comportamiento más allá de unos pocos miles de tokens.
- Formato de pesos único: solo hay safetensors, sin GGUF ni cuantizaciones publicadas, lo que obliga a convertir los pesos para despliegues en CPU o en GPU de baja memoria.
- Repositorio sin descargas ni interacción: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validación por parte de la comunidad.
- El enlace a `arxiv:1910.09700` que aparece en los tags corresponde a la calculadora de impacto medioambiental citada en la plantilla de Hugging Face (Lacoste et al., 2019), no a un artículo sobre este modelo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-15-prompt-numerico
- Repositorio base de la serie: https://huggingface.co/luisastellet/qwen-metaphor-unke
- Variante anterior de la serie: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-1-prompt-numerico
- Variante literal/metafórica: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-15-literal-metaforica
- Ficha en free2aitools: https://free2aitools.com/model/luisastellet/qwen-metaphor-unke-camada-15-literal-metaforica
- Ficha en FriendliAI: https://friendli.ai/models/luisastellet/qwen-metaphor-unke-camada-15-literal-metaforica
- Artículo citado en la plantilla (calculadora de impacto, no del modelo): https://arxiv.org/abs/1910.09700
