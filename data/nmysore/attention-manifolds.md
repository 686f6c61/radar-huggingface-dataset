# nmysore/attention-manifolds

## Resumen

SplineQK-3B (repositorio `nmysore/attention-manifolds`) es un adaptador de investigación que envuelve cada coordenada de las proyecciones Q y K de Llama-3.2-3B-Instruct con una curva B-spline cúbica aprendida. Lo desarrolla Naveen Mysore (usuario `nmysore`) y su propósito no es mejorar el rendimiento general, sino servir como herramienta de interpretabilidad mecanicista y de seguridad de IA: las curvas son inspeccionables y editables para estudiar cómo se codifica el comportamiento de rechazo (refusal) y cumplimiento (compliance).

El adaptador introduce 1 835 008 parámetros entrenables (16 funciones base por curva, en las 28 capas) mientras mantiene congelados los 3 200 millones de pesos del backbone. Se inicializa con identidad —f(z) = z—, de modo que antes del entrenamiento el modelo aumentado reproduce exactamente la atención estándar. Tras entrenar con predicción del siguiente token sobre Wikipedia limpia, la perplejidad baja de 11,91 a 11,09 (una reducción del 6,9 %).

Su relevancia radica en un enfoque poco habitual: en lugar de modificar el mecanismo de atención o inyectar vectores de dirección (steering vectors), remodela las proyecciones Q/K con splines de soporte local, de forma que cada coeficiente afecta solo a un intervalo acotado de activación. Esto ofrece una interfaz de intervención más granular para auditar comportamiento de seguridad. El trabajo se asocia al preprint arXiv:2610.00257 y a un repositorio de código del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2) con adaptador de curvas B-spline cúbicas por coordenada en las proyecciones Q y K; backbone congelado |
| Parámetros totales | 3 200 millones (backbone Llama-3.2-3B-Instruct, congelado) + 1 835 008 parámetros entrenables del adaptador |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama-3.2-3B-Instruct soporta 128 000 tokens) |
| Tipos de cuantización | No disponible; el modelo card emplea float32 con `attn_implementation="eager"` |
| Idiomas soportados | No disponible (entrenamiento sobre Wikipedia limpia, idioma no especificado) |
| Licencia | MIT (adaptador); el modelo base se rige por la Llama 3.2 Community License |
| Formato de pesos | No disponible; se documentan checkpoints `trained/` y `calibrated/` con 28 ficheros por capa más un manifiesto |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder-only de 3 200 millones de parámetros, y le añade "SplineQK": cada coordenada de las proyecciones de query (Q) y key (K) queda envuelta por una curva B-spline cúbica aprendida, representada con 16 funciones base por curva. La proyección lineal original permanece congelada y la spline remodela cada coordenada de forma independiente. La inicialización es de identidad (f(z) = z), lo que garantiza que el modelo aumentado reproduzca la atención estándar antes de entrenar. El adaptador es compatible con la caché KV porque envuelve las proyecciones y no reescribe el mecanismo de atención.

El entrenamiento se realizó con predicción del siguiente token sobre Wikipedia limpia, con tamaño de bloque 512, tres épocas, optimizador AdamW (lr = 0,001) y 1×A100 80 GB. Solo se entrenaron los 1 835 008 coeficientes de spline (los 3 200 millones de pesos del backbone permanecieron congelados). El resultado reportado es una mejora de perplejidad de 11,91 a 11,09. La innovación técnica destacable es la interfaz de intervención: escalar o negar las curvas aprendidas permite desplazar de forma monótona las tasas de rechazo/cumplimiento y revertir el comportamiento de seguridad entrenado, con soporte local (cada coeficiente B-spline afecta a un intervalo acotado de activación).

## Capacidades

- Generación de texto e instrucciones: heredada del backbone Llama-3.2-3B-Instruct, que permanece congelado.
- Razonamiento, código y matemáticas: son capacidades del modelo base; no se han evaluado específicamente para el adaptador.
- Tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidad especial de interpretabilidad: interfaz de intervención para escalar o negar las curvas B-spline y medir el efecto sobre refusal/compliance.
- Análisis por capa: permite estudiar la codificación distribuida del comportamiento de seguridad en las 28 capas.
- Soporte local de los coeficientes: cada coeficiente B-spline afecta solo a un intervalo acotado de activación, lo que facilita el análisis granular.
- Visión: no (Llama-3.2-3B es un modelo de solo texto).

## Casos de uso

- Investigación de seguridad y refusal: escalar o negar las curvas para medir cómo varían las tasas de rechazo y cumplimiento ante prompts sensibles, y así localizar dónde se codifica el comportamiento de seguridad.
- Interpretabilidad mecanicista: analizar la geometría de las proyecciones Q/K y visualizar los "manifolds" de atención que relacionan coordenadas de query y key con el enrutamiento de valores.
- Auditoría de robustez ante jailbreaks: usar la interfaz de intervención para comprobar si revertir el comportamiento entrenado degrada o preserva la calidad en prompts benignos.
- Edición controlada de comportamiento en laboratorio: negar las curvas para revertir el comportamiento de seguridad entrenado manteniendo, según el autor, la calidad en prompts benignos, como experimento reproducible.
- Análisis por capa: ejecutar barridos por capa (`/scale -1.0 0 3 6`) para identificar qué capas concentran la codificación de seguridad.
- Comparación de metodologías de interpretabilidad: enfrentar las curvas B-spline frente a enfoques alternativos como autoencoders dispersos (SAE) o steering vectors en la misma tarea de diagnóstico.
- Reproducibilidad y validación metodológica: servir como punto de partida para experimentos que apliquen curvas B-spline a las proyecciones de atención de otros transformers.

## Benchmarks y rendimiento

| Métrica | SplineQK-3B | Llama-3.2-3B-Instruct (base) |
|---|---|---|
| Perplejidad (Wikipedia) | 11,09 | 11,91 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras tareas estándar. El único dato numérico reportado es la mejora de perplejidad (reducción del 6,9 %).

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 3 200 millones de parámetros ocupa aproximadamente 6,5 GB en fp16/bf16 y alrededor de 13 GB en fp32; el adaptador añade solo 1 835 008 parámetros (unos 7 MB en fp32).
- La inicialización rápida exige `dtype=torch.float32` y `attn_implementation="eager"`, lo que puede incrementar el uso de memoria frente a configuraciones con FlashAttention.
- GPU recomendadas: entrenamiento documentado en 1×A100 80 GB; para inferencia basta una GPU con suficiente VRAM para el backbone (por ejemplo, A100, H100 o RTX 4090).
- Cabe en GPU de consumo: en fp32 con margen en tarjetas de 24 GB (RTX 3090/4090); en fp16/bf16 cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070).
- Opciones de despliegue: `transformers` junto con el paquete `spline_qk` del autor. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama; el módulo personalizado y la atención eager probablemente requieran adaptación para esos entornos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SplineQK-3B (`nmysore/attention-manifolds`) | 3,2 B + 1,8 M adaptador | No especificado (base 128 000 tokens) | PPL 11,09 en Wikipedia | MIT (adaptador) | HuggingFace, repositorio de 0,0 GB |
| Llama-3.2-3B-Instruct (base) | 3,2 B | 128 000 tokens | PPL 11,91 en Wikipedia | Llama 3.2 Community License | HuggingFace |
| `nmysore/manifold-1.0-1b` (mismo autor, related) | No disponible | No disponible | No disponible | Llama 3.2 | HuggingFace |

No se dispone de comparaciones directas frente a otras herramientas de interpretabilidad (por ejemplo, SAE o steering vectors), ya que no se aportan métricas equivalentes en la información disponible.

## Limitaciones y advertencias

- El repositorio documentado (`nmysore/attention-manifolds`) tiene un tamaño de 0,0 GB y el propio modelo card apunta a `nmysore/spline-qk-3b/trained` para cargar los pesos, lo que indica una posible discrepancia entre el identificador documentado y el destino real de los ficheros.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes; publicación reciente (octubre de 2026).
- Doble licencia: el adaptador es MIT, pero el modelo base Llama-3.2-3B-Instruct se rige por la Llama 3.2 Community License, que impone sus propias condiciones de uso comercial.
- Riesgo de alucinación heredado del backbone Llama-3.2-3B-Instruct.
- Idiomas soportados no documentados; el entrenamiento se hizo solo sobre Wikipedia limpia (idioma no especificado).
- Requiere carga en float32 y atención eager, lo que limita opciones de cuantización y despliegue optimizado.
- Es una herramienta de investigación, no un modelo de producción: no hay benchmarks estándar (MMLU, HumanEval, GSM8K) ni métricas de latencia/throughput.
- Las intervenciones (escalar o negar curvas) alteran el comportamiento de seguridad; su uso debe limitarse a entornos de investigación controlados. El autor afirma que negar las curvas preserva la calidad en prompts benignos, pero no se aportan métricas independientes de esa afirmación.
- Sesgos conocidos: no disponibles.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/nmysore/attention-manifolds
- Paper (arXiv:2610.00257): https://arxiv.org/abs/2610.00257
- Repositorio de código: https://github.com/NAVEENMN/attention_manifolds
- Modelo relacionado del mismo autor: https://huggingface.co/nmysore/manifold-1.0-1b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Referencia externa del paper: https://www.aimodels.fyi/papers/arxiv/attention-manifolds-steering-or-blocking-language-models
