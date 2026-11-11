# DoubleRabbits/d3-lite-zils-v2

## Resumen

DoubleRabbits/d3-lite-zils-v2 es un modelo de decisión afinado (fine-tuned) publicado por el usuario DoubleRabbits en Hugging Face. Se construye a partir de Qwen3.5-0.8B, un modelo base de aproximadamente 853 millones de parámetros, utilizando el chasis intermedio denominado d3-lite-0.8b-v1. El entrenamiento se realizó mediante LoRA de rango 16 sobre 2000 decisiones sintéticas generadas con semilla 1, lo que sugiere un ajuste muy acotado y orientado a una tarea específica de clasificación o selección de decisiones dentro del ecosistema "Zils d3-lite soup pool".

El modelo se distribuye en formato safetensors con código personalizado (custom_code), lo que implica que su carga requiere confiar en implementaciones de modelado no estándar. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque la ausencia de una model card detallada sobre datos, evaluación y comportamiento limita seriamente su trazabilidad. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto experimental de publicación reciente (noviembre de 2026) sin validación comunitaria.

Su relevancia es, por tanto, acotada: resulta interesante como ejemplo de fine-tuning LoRA de bajo rango sobre un modelo pequeño de la familia Qwen3.5 para tareas de decisión, pero no dispone de información pública sobre rendimiento, idiomas soportados ni evaluación de calidad que permita recomendarlo para producción sin una validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (tag `qwen3_5`), con código personalizado (`custom_code`) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y se ha afinado sobre el chasis d3-lite-0.8b-v1, un intermediario del propio autor. El ajuste se realizó con LoRA de rango 16 sobre un conjunto de 2000 decisiones sintéticas (semilla 1). No se especifica el número de tokens de entrenamiento, la composición del dataset más allá de su carácter sintético, ni si hubo etapas de RLHF o DPO. La presencia del tag `custom_code` indica que la arquitectura efectiva no se carga con una clase estándar de Transformers sin código adicional del repositorio, lo que añade un requisito de inspección del código antes de su uso. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto y decisión: el modelo está orientado a tareas de decisión dentro del pool "Zils d3-lite", presumiblemente selección entre opciones o clasificación de escenarios.
- Razonamiento básico y respuesta a instrucciones heredados del modelo base Qwen3.5-0.8B, aunque sin evaluación pública que lo confirme tras el fine-tuning.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Clasificación de decisiones en pipelines internos: el modelo puede emplearse como clasificador o selector de opciones en flujos donde las categorías estén bien definidas y se haya validado su comportamiento con datos propios, dado su entrenamiento sobre decisiones sintéticas.
- Prototipado de agentes de decisión de bajo coste: con menos de 1000 millones de parámetros, cabe en GPUs de consumo y permite iterar rápidamente sobre políticas de decisión antes de escalar a modelos mayores.
- Enrutamiento de consultas en sistemas de soporte: puede actuar como componente de triaje que decide a qué subsistema derivar una petición, siempre que se evalúe su precisión en el dominio concreto.
- Experimentación académica con LoRA: sirve como caso de estudio de fine-tuning de rango 16 sobre un modelo pequeño de la familia Qwen3.5 para tareas de decisión.
- Generación de etiquetas o anotaciones sintéticas: puede usarse para preetiquetar datos en procesos de anotación semiautomática, con revisión humana posterior.
- Base para nuevos fine-tunings: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para ajustes adicionales en dominios específicos, asumiendo la necesidad de validar el chasis d3-lite-0.8b-v1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar el modelo con `trust_remote_code=True` en Transformers; vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura personalizada y requerirían adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DoubleRabbits/d3-lite-zils-v2 | 852.985.920 | No disponible | Apache 2.0 | Hugging Face, safetensors con custom_code | Fine-tuning LoRA r16 sobre 2000 decisiones sintéticas |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible en la información | No disponible en la información | Hugging Face | Modelo base del que deriva; sin fine-tuning específico |
| d3-lite-0.8b-v1 (chasis) | No disponible | No disponible | No disponible | No disponible | Intermediario del autor usado como chasis |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento sobre datos sintéticos (2000 decisiones, semilla 1): riesgo elevado de sobreajuste al dominio sintético y de escasa generalización a datos reales.
- Ausencia de evaluación pública: no hay benchmarks, métricas ni validación comunitaria (0 descargas, 0 likes) que respalden su calidad.
- Riesgo de alucinación y de decisiones erróneas en dominios no cubiertos por el conjunto sintético.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto fuera del idioma o idiomas usados en el entrenamiento.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones o documentos largos.
- Dependencia de `custom_code`: requiere `trust_remote_code=True` y revisión del código del repositorio antes de ejecutarlo, con el riesgo de seguridad que ello implica.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Publicación muy reciente y sin mantenimiento conocido: posible falta de actualizaciones o correcciones.

## Enlaces

- Hugging Face: https://huggingface.co/DoubleRabbits/d3-lite-zils-v2
