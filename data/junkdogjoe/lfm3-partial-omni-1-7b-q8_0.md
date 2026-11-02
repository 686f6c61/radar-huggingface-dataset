# junkdogjoe/LFM3-Partial-Omni-1.7B-Q8_0

## Resumen

LFM3-Partial-Omni-1.7B-Q8_0 es una modificación experimental del modelo LiquidAI/LFM3-1.7B, publicada por el usuario junkdogjoe en HuggingFace. Se trata de un merge no oficial en el que, según el autor, se combinan algunas capas del LFM3-1.7B con capas del LFM3-Omni-2B para intentar dotar al modelo base de capacidades multimodales (visión, texto y voz) manteniendo el tamaño de 1.7B parámetros. El resultado se distribuye en formato GGUF cuantizado a Q8_0, junto con un vector de control (`cvec/control-vector.gguf`) que, según el autor, modula el comportamiento del modelo.

El modelo base, LFM3-1.7B, pertenece a la familia LFM3 de Liquid AI, diseñada para despliegue en dispositivos edge. Cuenta con 1.728.801.600 parámetros reales según los safetensors del repositorio y soporta 17 idiomas, incluido el español. La licencia es lfm1.0, una licencia propia de Liquid AI con restricciones para uso comercial que deben consultarse antes de cualquier despliegue en producción.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el propio autor describe el proyecto como "volatile and untested", señala que el modelo "no se da cuenta de que tiene capacidades multimodales" y reconoce no recordar con precisión cómo realizó el merge. No hay benchmarks publicados, no hay documentación técnica del proceso y el repositorio registra cero descargas. Es un artefacto de experimentación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de LFM3-1.7B; el autor no documenta la arquitectura del merge) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el autor menciona también un mmproj F16 para el componente multimodal |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia propia de Liquid AI, etiquetada como "other") |
| Formato de pesos | GGUF (repo de 2.8 GB); incluye `cvec/control-vector.gguf` |

## Arquitectura y entrenamiento

No hay información técnica publicada sobre la arquitectura interna del merge. El autor indica que partió de LFM3-1.7B-Q8_0 y "fusionó algunas capas" con LFM3-Omni-2B-Q8_0, sin especificar qué capas, en qué orden ni con qué método de merge (SLERP, TIES, passthrough, etc.). Tampoco documenta el proceso de entrenamiento: no consta que se haya realizado fine-tuning, RLHF o DPO sobre el resultado; parece tratarse exclusivamente de una combinación de pesos.

El componente multimodal se activa en llama.cpp mediante un fichero `mmproj-LFM3-Omni-2B-F16.gguf` externo, lo que sugiere que la parte de visión/proyección proviene del modelo Omni-2B y no está integrada de forma nativa en el GGUF principal. El vector de control `cvec/control-vector.gguf`, aplicado con escala 0.77, es un artefacto adicional cuyo efecto exacto el autor no describe ("me perdí también"). No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni innovaciones técnicas verificables.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LFM3-1.7B.
- Capacidad multimodal declarada por el autor (visión, texto y voz) mediante el mmproj de LFM3-Omni-2B, aunque el propio autor advierte que el modelo "no se da cuenta de que tiene capacidades multimodales".
- Razonamiento: el autor afirma que es "un poco más rápido y más inteligente en razonamiento" que el base, sin aportar métricas.
- Soporte multilingüe para 17 idiomas, incluido el español.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking explícito: no disponible (no documentado).
- Capacidades de audio: mencionadas por el autor como parte del merge Omni, sin verificación ni documentación de uso.

## Casos de uso

- Experimentación con merges de modelos: el caso de uso realista es servir como banco de pruebas para investigar cómo se comportan los merges de capas entre modelos de la misma familia (LFM3-1.7B y LFM3-Omni-2B) en formato GGUF.
- Pruebas de multimodalidad en llama.cpp: permite experimentar con la carga de un mmproj externo junto a un modelo de texto y observar el comportamiento del pipeline multimodal en el edge.
- Evaluación de vectores de control: el `control-vector.gguf` incluido sirve para estudiar el efecto de la modulación de activaciones con escala 0.77 sobre un modelo pequeño.
- Prototipado rápido en local: con 1.7B parámetros en Q8_0 (aproximadamente 1.8 GB de pesos), cabe en cualquier GPU consumer moderna y permite iterar sin infraestructura dedicada.
- Docencia y divulgación: útil como ejemplo práctico de las limitaciones de los merges no documentados y de la diferencia entre un artefacto experimental y un modelo publicable.
- No recomendado para producción: no debería usarse en atención al cliente, generación de código en CI/CD, agentes autónomos ni ningún flujo con requisitos de fiabilidad, dado que el autor lo califica de "volátil y no probado".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no aporta métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y sus afirmaciones de mejora ("less slop, a bit faster and smarter at reasoning") no están cuantificadas ni respaldadas por datos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.8-2.0 GB para los pesos Q8_0, más el mmproj F16 de LFM3-Omni-2B (tamaño no especificado) y el vector de control. En total, un presupuesto de 3-4 GB de VRAM es razonable para texto; el componente multimodal puede incrementarlo.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también tarjetas de datacenter (A100, H100) aunque sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp es el runtime documentado por el autor (con flags `--mmproj` y `--control-vector-scaled`). No hay confirmación de soporte en vLLM, TGI u Ollama; al ser un GGUF con `custom_code` y un merge no estándar, la compatibilidad con otros runtimes no está garantizada.
- Latencia y throughput estimados: no disponibles. El autor afirma que es "un poco más rápido" que el base, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-Partial-Omni-1.7B-Q8_0 (este) | 1.73B | No disponible | Parcial (mmproj externo, no fiable) | lfm1.0 | Experimental, sin benchmarks, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1.73B | No disponible en la información | No | lfm1.0 | Oficial, mantenido por Liquid AI |
| LiquidAI/LFM3-Omni-2B | ~2B | No disponible en la información | Sí (visión, audio) | lfm1.0 | Oficial, fuente del mmproj |
| Qwen2.5-1.5B-Instruct | 1.54B | 32.768 tokens | No | Apache 2.0 | Oficial, ampliamente evaluado |

La comparación relevante es contra el propio LFM3-1.7B oficial: este merge no aporta garantías adicionales y añade opacidad sobre el proceso. Frente a alternativas de tamaño similar como Qwen2.5-1.5B-Instruct, la diferencia clave es la licencia (lfm1.0 frente a Apache 2.0) y la ausencia total de evaluaciones publicadas en el caso del merge.

## Limitaciones y advertencias

- Modelo no probado: el autor lo describe explícitamente como "volatile and untested"; no hay validación de calidad, coherencia ni seguridad.
- Multimodalidad no fiable: el modelo "no se da cuenta de que tiene capacidades multimodales", lo que implica que las respuestas ante entradas de imagen o audio pueden ser incoherentes o ignorar la entrada.
- Proceso de merge no documentado: el autor reconoce no recordar cómo lo hizo ("I asked an LLM") y haber perdido los pares positivos/negativos del vector de control, lo que impide reproducir o auditar el resultado.
- Riesgo de alucinación: sin evaluaciones, no hay forma de acotar la tasa de alucinación; en un modelo pequeño (1.7B) este riesgo es estructuralmente alto.
- Licencia lfm1.0: es una licencia propia de Liquid AI con posibles restricciones para uso comercial; debe revisarse el texto de `LICENSE` antes de cualquier despliegue. La etiqueta "other" en HuggingFace no aclara los términos.
- Contexto e idiomas: la longitud de contexto no está documentada; el soporte multilingüe se hereda del base y no se ha verificado tras el merge.
- Sin soporte comunitario: cero descargas y cero likes en el momento de la ficha; no hay issues, discusiones ni mantenimiento.
- Dependencia de artefactos externos: requiere el mmproj de LFM3-Omni-2B y el vector de control para reproducir la configuración del autor, lo que complica el despliegue.
- No apto para producción: cualquier uso en sistemas reales (atención al cliente, código, agentes) conlleva riesgos no cuantificados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/junkdogjoe/LFM3-Partial-Omni-1.7B-Q8_0
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo fuente del componente Omni: https://huggingface.co/LiquidAI/LFM3-Omni-2B (referenciado por el autor; no se ha verificado la URL exacta)
- Licencia lfm1.0: incluida en el repositorio como `LICENSE`
- llama.cpp (runtime documentado por el autor): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
