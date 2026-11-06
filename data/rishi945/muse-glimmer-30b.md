# rishi945/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal multimodal desarrollado por Meta Superintelligence Lab, publicado en agosto de 2026 bajo licencia Apache 2.0. Se trata de un transformer denso de aproximadamente 29,6 mil millones de parámetros que incorpora un encoder de percepción dedicado de unos 1,8 mil millones de parámetros (ViT-G/14) para el procesamiento de imágenes. El modelo está destilado a partir de Muse Spark y está específicamente diseñado para tareas agénticas autónomas ejecutables en hardware de consumo, sin necesidad de infraestructura en la nube.

La propuesta diferencial del modelo es combinar razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal y recuperación ante fallos en un único modelo que corre localmente. Soporta una ventana de contexto de 131.072 tokens o más, con un patrón de atención híbrido que alterna capas locales y globales, y emplea decodificación especulativa mediante un modelo borrador basado en DFlash con bloques de 16 tokens.

Su relevancia actual radica en que ofrece capacidades agénticas de nivel producción en un envoltorio de 24-32 GB de VRAM gracias a cuantización de 4 bits, con una degradación medida de entre el 0,2 % y el 1,0 % en 15 benchmarks. Esto lo posiciona como una opción viable para despliegues en estaciones de trabajo con RTX 5090 o portátiles Apple con M4/M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepción (ViT-G/14) |
| Parametros totales | ~29,6B (incluye encoder visual de ~1,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision, K-Quant-Dynamic (~32 GB VRAM), K-Quant-17GB (~24 GB VRAM); pesos comprimidos a ~4 bits |
| Idiomas soportados | Más de 100 idiomas (entrenamiento); lista específica no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 59,6 GB) |

Otras especificaciones técnicas: dimensión oculta 6656, 52 capas, patrón de atención [Local, Local, Local, Global] con ventana deslizante de 2048, atención con compuertas (gated attention), 32 cabezas de consulta y 2 de clave/valor (GQA 16:1), dimensión de cabeza 128, FFN SwiGLU con dimensión intermedia 19.968, RoPE con θ = 500.000 aplicado solo en capas locales, vocabulario de 202.048 tokens (200.000 BPE + 2.048 especiales), hasta 4.096 tokens visuales por imagen, corte de conocimiento el 4 de enero de 2026.

## Arquitectura y entrenamiento

Muse Glimmer-30B es un transformer causal denso con un encoder de percepción separado de aproximadamente 1,8 mil millones de parámetros (ViT-G/14, 50 capas, anchura 1536, tamaño de parche 14). El lenguaje emplea un patrón de atención híbrido que repite tres capas locales con ventana deslizante de 2048 tokens seguidas de una capa global, lo que reduce el coste computacional en contextos largos manteniendo acceso global periódico. La atención incorpora compuertas y usa GQA con ratio 16:1 para reducir el tamaño de la caché KV. El posicionamiento se realiza con RoPE de θ = 500.000 únicamente en las capas locales.

El modelo está destilado de Muse Spark y entrenado con datos multimodales procedentes de fuentes públicas, datos de terceros e información de productos y servicios de Meta, curados y enriquecidos por redes de proveedores externos y personal de Meta. La model card no detalla el número total de tokens de entrenamiento ni la composición exacta del dataset, ni especifica si se aplicaron fases de RLHF o DPO. La innovación técnica más destacable es la decodificación especulativa mediante un borrador DFlash: una red ligera de 5 capas que predice bloques completos de 16 tokens en un único forward pass, con atención de ventana deslizante de 2048 y 32 cabezas de consulta / 8 de clave-valor. El modelo principal verifica las propuestas en paralelo, aceptando los tokens correctos y corrigiendo los erróneos, con capas de características ocultas uniformes sobre las capas {1, 13, 25, 37, 49} del modelo objetivo.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadenas de razonamiento sostenidas sobre horizontes largos.
- Comprensión multimodal de entrada: texto e imágenes intercaladas (capturas de pantalla, gráficos, documentos) mediante el encoder de percepción.
- Uso fiable de herramientas (tool calling / function calling) con esquemas precisos a lo largo de flujos de trabajo extendidos.
- Recuperación ante fallos: diagnóstico de errores en llamadas a herramientas y reintento en lugar de detención.
- Capacidades agénticas de extremo a extremo: finalización de tareas completas dentro de scaffolds como OpenClaw y Hermes Agent.
- Esfuerzo de razonamiento controlable: distintos niveles de intensidad para equilibrar calidad y velocidad.
- Multilingüe: entrenado con datos de más de 100 idiomas.
- Salida exclusivamente textual (la modalidad de salida es texto; la entrada admite texto e imagen).

## Casos de uso

- Automatización de atención al cliente multi-turno: el modelo gestiona conversaciones largas gracias a su contexto de 131.072 tokens, mantiene el hilo de la conversación y puede invocar herramientas de consulta de pedidos o gestión de reclamaciones con esquemas precisos.
- Agentes de resolución de incidencias de software: con soporte para SWE-Bench y depuración de código, puede integrarse en pipelines de CI/CD para diagnosticar fallos, proponer parches y reintentar tras errores de herramientas.
- Análisis de documentos y capturas de pantalla: el encoder de percepción permite interpretar gráficos, tablas e interfaces de usuario junto con el texto, útil para agentes que operan sobre paneles de control o informes escaneados.
- Asistentes de escritorio locales sin conexión: al ejecutarse en 24-32 GB de VRAM con cuantización de 4 bits, es adecuado para despliegues en portátiles y estaciones de trabajo sin acceso a la nube, con implicaciones de privacidad.
- Orquestación de flujos agénticos con múltiples herramientas: compatible con OpenClaw, Hermes Agent y otros patrones de orquestación, permite construir agentes que encadenan llamadas a APIs, búsquedas y ejecución de código con recuperación ante fallos.
- Búsqueda profunda y respuesta a preguntas sobre corpus extensos: evaluado en DeepSearch QA y MCP-Atlas, puede resolver consultas multi-paso sobre documentación técnica o bases de conocimiento largas.
- Generación de código asistida en el editor: con contexto largo y tool calling, puede integrarse en asistentes de programación que necesitan leer varios archivos y ejecutar comandos de verificación.

## Benchmarks y rendimiento

La model card menciona evaluación en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no publica los valores numéricos obtenidos en dichos benchmarks. Los únicos datos cuantitativos disponibles son los de degradación por cuantización y velocidad de generación.

| Metrica | Full precision | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradación media (15 benchmarks) | — | 0,2 % | 1,0 % |
| VRAM objetivo | 64 GB | 32 GB | 24 GB |

| Hardware | Sin especulación (tok/s) | Con DFlash (tok/s) | Aceleración |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

No se han publicado resultados numéricos de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 64 GB para precisión completa, 32 GB para K-Quant-Dynamic, 24 GB para K-Quant-17GB (pesos a ~4 bits).
- GPU recomendadas: Nvidia RTX 5090 (medido), configuraciones de 64 GB para precisión completa; el modelo está optimizado para envoltorios de 24-32 GB.
- Cabe en GPU de consumo: sí, en RTX 5090 con cuantización; también en Apple Silicon M4 Max y M5 Max (medidos).
- Opciones de despliegue: la model card menciona despliegue local con el drafter DFlash; no se especifican explícitamente vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 233,4 tok/s en RTX 5090 con especulación (74,9 sin ella), 37,8 tok/s en M4 Max y 50,2 tok/s en M5 Max, con batch size 1 y decodificación greedy.
- El drafter DFlash añade una sobrecarga de memoria reducida gracias a sus versiones cuantizadas, y debe convivir con la caché KV y el encoder de percepción dentro del presupuesto de VRAM.

## Comparativa con modelos similares

No se dispone de datos de benchmarks numéricos de Muse Glimmer-30B ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, se puede contrastar con alternativas de tamaño y propósito similares, aunque sin cifras verificadas:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Muse Glimmer-30B | ~29,6B (denso) + 1,8B vision | 131.072+ | Apache 2.0 | Agéntico multimodal local |
| Alternativas de ~30B denso | no disponible | no disponible | no disponible | no disponible |

No disponible: no se han proporcionado datos de modelos comparables (parámetros, contexto, rendimiento o licencia) en la información de referencia.

## Limitaciones y advertencias

- No se han publicado resultados numéricos de benchmarks de calidad, lo que impide verificar las afirmaciones de rendimiento de la model card.
- La model card no detalla la composición del dataset de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO, lo que limita la evaluación de sesgos.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recuperación ante fallos de herramientas no elimina la posibilidad de generar contenido incorrecto.
- La lista concreta de idiomas soportados no está disponible, solo la afirmación de más de 100 idiomas en entrenamiento.
- El corte de conocimiento es el 4 de enero de 2026; información posterior no está cubierta.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de atribución y las posibles restricciones derivadas de los datos de terceros utilizados en el entrenamiento.
- El rendimiento medido se limita a RTX 5090, M4 Max y M5 Max con batch size 1 y decodificación greedy; el throughput en otros hardware o configuraciones no está disponible.
- El repositorio de Hugging Face (rishi945/Muse-Glimmer-30B) no presenta descargas ni valoraciones, y la autoría del upload no coincide con Meta Superintelligence Lab, lo que conviene verificar antes de su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/rishi945/Muse-Glimmer-30B
- Paper del encoder de percepción: https://arxiv.org/abs/2504.13181
- Paper de DFlash: https://arxiv.org/abs/2602.06036
- Referencia adicional citada en los tags: https://arxiv.org/abs/2610.24628
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
