# harribo11/ultraviolet-50m-mid-alpha

## Resumen

Ultraviolet 50M (UV-50M) es un transformer decoder-only de 50,8 millones de parámetros desarrollado por el usuario harribo11 (hliuson) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo pequeño entrenado principalmente sobre datos matemáticos, concebido como organismo modelo para experimentación rápida con aprendizaje por refuerzo (RL) sobre modelos de lenguaje. Su nombre y arquitectura derivan del modelo Limite 1B Violetto de Paradigma.

Este checkpoint concreto (`mid-alpha`) es la variante de razonamiento matemático: parte del modelo base `ultraviolet-50m-base-alpha` y se ha afinado sobre trazas de razonamiento delimitadas por `<think>...</think>`, tras las cuales emite la respuesta final en formato `\boxed{}`. La arquitectura está optimizada para velocidad de inferencia más que para rendimiento máximo por parámetro, lo que permite ejecutar experimentos de RL a alta velocidad en GPUs de consumo.

Su relevancia actual radica en su utilidad como banco de pruebas de bajo coste: con 50,8M de parámetros y un contexto de 4096 tokens, supera los 200.000 tokens por segundo en una única RTX 2080 Ti con contextos cortos (menos de 1k tokens), lo que lo convierte en una plataforma accesible para investigar técnicas de RL, cadenas de razonamiento y decodificación sobre modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (10 capas, d_model 640, 8 cabezas de consulta / 1 cabeza KV, head_dim 64) |
| Parametros totales | 50,8 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (checkpoint de PyTorch: diccionario con `model` = state dict fp32 y `cfg` = configuración) |

## Arquitectura y entrenamiento

UV-50M es un transformer decoder-only de 10 capas con dimensión de modelo 640, 8 cabezas de consulta y una única cabeza de clave-valor (atención con compartición de KV, GQA), con dimensión de cabeza 64. El tokenizador es un BPE de 16.384 tokens incluido en el directorio `tokenizer/`. La arquitectura deriva del modelo Limite 1B Violetto de Paradigma y está optimizada explícitamente para velocidad de inferencia en GPUs de consumo.

El entrenamiento se centró principalmente en matemáticas. La variante `mid-alpha` se obtuvo afinando el modelo base sobre trazas de razonamiento del conjunto `violetto-math-traces` (configuración `mid-alpha`), que enseñan al modelo a producir razonamiento dentro de `<think>...</think>` y a cerrar con una respuesta en `\boxed{}`. Las fuentes de datos y el proceso de descontaminación se documentan en el archivo `DATA.md` del repositorio. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso mediante trazas internas delimitadas por `<think>` y `</think>`.
- Emisión de respuestas finales en formato `\boxed{respuesta}`, facilitando la extracción automática de resultados.
- Resolución de problemas matemáticos de tipo competición (evaluado en MATH-500 y GSM8K).
- Muestreo múltiple (pass@k) para explorar varias soluciones por problema.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso más allá de la cadena de pensamiento: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de razonamiento explícito (`<think>`); no se documentan visión ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como organismo modelo para experimentar con algoritmos de RL (PPO, GRPO, etc.) sobre tareas matemáticas, gracias a su tamaño reducido y a su alto throughput en GPUs de consumo.
- Experimentos de cadenas de razonamiento: permite estudiar la aparición y calidad de trazas `<think>` y su efecto en la precisión final, con ciclos de entrenamiento rápidos y baratos.
- Evaluación de técnicas de decodificación: su velocidad (más de 200k tokens/s en una RTX 2080 Ti con contextos cortos) facilita comparar muestreo, temperatura y estrategias de pass@k sobre MATH-500 y GSM8K.
- Docencia y formación: sirve para ilustrar el funcionamiento interno de un transformer pequeño con razonamiento explícito en cursos de IA, sin requerir infraestructura costosa.
- Prototipado de pipelines de extracción de respuestas: el formato `\boxed{}` permite construir y validar parsers y evaluadores automáticos de soluciones matemáticas.
- Pruebas de infraestructura de inferencia: al ser un checkpoint PyTorch ligero (0,2 GB), es útil para validar entornos de despliegue, scripts de carga y herramientas de tokenización antes de escalar a modelos mayores.
- Reproducción de experimentos académicos: su licencia Apache 2.0 y su código público en GitHub permiten reproducir y extender resultados sin restricciones de uso.

## Benchmarks y rendimiento

| Benchmark | pass@1 | pass@16 |
|---|---|---|
| MATH-500 | 0,090 | 0,356 |
| GSM8K (test) | 0,067 | 0,390 |

Condiciones de evaluación: temperatura T = 1,0, 16 muestras, máximo 2048 tokens nuevos. No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint es de 0,2 GB en fp32 (50,8M de parámetros); la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU de consumo moderna; el autor cita explícitamente la RTX 2080 Ti como plataforma de referencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM.
- Opciones de despliegue: carga directa con PyTorch mediante el código del repositorio `github.com/hliuson/ultraviolet` (clases `MathLM` y `MathConfig`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el formato `model.pt` no es directamente compatible con ellas.
- Latencia y throughput: más de 200.000 tokens por segundo en una única RTX 2080 Ti con contextos inferiores a 1k tokens, según el autor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (modelos matemáticos pequeños para experimentación con RL). El modelo declara derivar del Limite 1B Violetto de Paradigma, pero no se aportan sus métricas para establecer una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ultraviolet-50m-mid-alpha | 50,8M | 4096 | Apache 2.0 | Hugging Face + GitHub |
| Limite 1B Violetto (referencia arquitectónica) | 1B (según nombre) | no disponible | no disponible | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento matemático muy limitado en términos absolutos: pass@1 de 0,090 en MATH-500 y 0,067 en GSM8K, adecuado para experimentación pero no para uso en producción como resolutor fiable.
- Riesgo elevado de alucinación y de razonamientos incorrectos, especialmente fuera del dominio matemático.
- Idiomas soportados no documentados; no hay garantía de comportamiento correcto en castellano ni en otros idiomas distintos del de los datos de entrenamiento.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El formato de pesos `model.pt` requiere el código del repositorio para su carga; no es compatible directamente con runtimes estándar de inferencia.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está diseñado ni validado para aplicaciones comerciales.
- No se han documentado sesgos específicos ni evaluaciones de seguridad; al ser un modelo de investigación, no debe desplegarse sin auditoría previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harribo11/ultraviolet-50m-mid-alpha
- Modelo base: https://huggingface.co/harribo11/ultraviolet-50m-base-alpha
- Dataset de trazas: https://huggingface.co/datasets/harribo11/violetto-math-traces
- Modelo de referencia arquitectónica: https://huggingface.co/paradigma-inc/limite-1b-violetto
- Código del modelo: https://github.com/hliuson/ultraviolet
