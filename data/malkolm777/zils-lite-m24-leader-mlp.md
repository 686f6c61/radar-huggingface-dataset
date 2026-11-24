# malkolm777/zils-lite-m24-leader-mlp

## Resumen

zils-lite-m24-leader-mlp es un ajuste fino (fine-tune) de tipo MLP de rango 32 sobre el modelo base joamCriff123/zils-lite-l1123q, publicado por el usuario malkolm777 en Hugging Face. El modelo se presenta como un "modelo de decisión" (decision-model) dentro de la familia ZILS, con la etiqueta d3-lite, y está construido sobre la arquitectura qwen3_5 según los metadatos del repositorio. Cuenta con 852.985.920 parámetros totales según el recuento real de los pesos en safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 850 millones de parámetros.

El ajuste se realizó en una única pasada sobre 700 decisiones verificadas con etiquetas gold y objetivos suaves (soft targets), con semilla 241561 y una tasa de aprendizaje de 0,00004. El autor documenta el SHA-256 del entrenamiento (1ea7275b88b765f1e3b8230c7ba3dd497a82ca7d82bee7005c7bafe4ee06f57c) y remite a los ficheros LICENSE y NOTICE para las atribuciones del modelo original.

La relevancia de este modelo es limitada y muy específica: se trata de un artefacto de investigación derivado de un modelo base poco conocido, con cero descargas y cero "likes" en el momento de la consulta, sin model card detallada más allá de la nota de entrenamiento y sin resultados de evaluación publicados. Resulta útil únicamente para quien quiera reproducir o inspeccionar el proceso de ajuste descrito, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags; requiere código personalizado, custom_code) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | joamCriff123/zils-lite-l1123q |
| Tipo de ajuste | MLP de rango 32 (rank-32 language MLP fine-tune) |
| Datos de entrenamiento | 700 decisiones verificadas con etiquetas gold y soft targets, una pasada |
| Semilla | 241561 |
| Tasa de aprendizaje | 0,00004 |
| SHA-256 del entrenamiento | 1ea7275b88b765f1e3b8230c7ba3dd497a82ca7d82bee7005c7bafe4ee06f57c |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo parte de joamCriff123/zils-lite-l1123q y se etiqueta con la arquitectura qwen3_5, aunque los metadatos no detallan la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención o si incorpora componentes híbridos). El repositorio requiere código personalizado (custom_code), lo que implica que la carga del modelo depende de implementaciones específicas del autor y no de una clase estándar de Transformers.

El ajuste descrito en la model card es un fine-tune de un MLP de lenguaje de rango 32, realizado en una sola pasada sobre 700 decisiones verificadas con etiquetas gold y objetivos suaves. Se especifican la semilla (241561), la tasa de aprendizaje (0,00004) y el hash SHA-256 del entrenamiento para trazabilidad. No se documentan el número de tokens de entrenamiento, la composición del dataset más allá de la cifra de decisiones, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de texto: el modelo es un modelo de lenguaje con 852 millones de parámetros, por lo que en principio puede generar texto, aunque no hay evaluación publicada de su calidad.
- Modelo de decisión: la model card lo etiqueta explícitamente como decision-model dentro de la familia ZILS, orientado a tareas de decisión sobre las que fue ajustado.
- Ajuste sobre decisiones verificadas: el entrenamiento se centró en 700 decisiones con etiquetas gold y soft targets, lo que sugiere especialización en ese dominio concreto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas soportados no se documentan.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de ajuste: el modelo sirve para replicar el fine-tune descrito, ya que la model card incluye semilla, tasa de aprendizaje y hash de entrenamiento; útil para investigadores que estudien metodologías de ajuste de MLP de rango bajo.
- Auditoría de trazabilidad de entrenamiento: el SHA-256 documentado permite verificar la integridad del proceso y comparar artefactos derivados, lo que encaja en flujos de auditoría de modelos.
- Investigación sobre modelos de decisión: al estar etiquetado como decision-model, puede emplearse como punto de partida para estudiar cómo un ajuste pequeño sobre 700 ejemplos afecta al comportamiento de decisión del modelo base.
- Docencia y experimentación con modelos pequeños: con 852 millones de parámetros y pesos safetensors, es manejable en entornos académicos para estudiar carga de modelos con custom_code y dependencias específicas.
- Base para nuevos fine-tunes: al ser un derivado de joamCriff123/zils-lite-l1123q con licencia apache-2.0, puede servir como punto de partida para ajustes posteriores en dominios de decisión similares.
- Evaluación comparativa de derivados ZILS: útil para comparar el efecto del ajuste MLP de rango 32 frente al modelo base en tareas de decisión, siempre que se disponga de un conjunto de evaluación propio, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en precisión completa (fp32) se necesitan aproximadamente 3,4 GB solo para los pesos; en fp16/bf16, unos 1,7 GB; en cuantización de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con margen para el contexto; una RTX 3060, RTX 4060 o superior sería suficiente en la mayoría de configuraciones.
- ¿Cabe en GPU de consumo? Sí, con 852 millones de parámetros cabe holgadamente en GPU de consumo actuales, incluso en modelos de gama media.
- Opciones de despliegue: al requerir custom_code, la carga estándar con vLLM, llama.cpp, Ollama o TGI no está garantizada; será necesario usar la implementación específica del autor o Transformers con trust_remote_code. No se documentan opciones de despliegue concretas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-m24-leader-mlp | 852.985.920 | no disponible | apache-2.0 | Hugging Face, requiere custom_code | Ajuste MLP de rango 32 sobre zils-lite-l1123q |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| Qwen2.5-0.5B | ~494 millones | 32.768 tokens (según versión) | apache-2.0 | Hugging Face, ampliamente soportado | Alternativa de tamaño similar con soporte estándar en vLLM, llama.cpp y Ollama |
| Qwen2.5-1.5B | ~1.540 millones | 32.768 tokens (según versión) | apache-2.0 | Hugging Face, ampliamente soportado | Alternativa de tamaño cercano con benchmarks publicados |

La comparación con modelos de la familia Qwen se ofrece como referencia de categoría por tamaño y licencia; no implica que zils-lite-m24-leader-mlp tenga rendimiento equivalente, ya que no hay benchmarks publicados para este último.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, por lo que no es posible estimar su calidad real frente a alternativas.
- Modelo de nicho: el ajuste se realizó sobre 700 decisiones, un volumen muy pequeño, lo que limita su generalización fuera del dominio de entrenamiento.
- Riesgo de alucinación: no evaluado; al ser un modelo de lenguaje pequeño y con ajuste específico, el riesgo de generar contenido incorrecto es alto en usos generales.
- Idiomas no documentados: se desconoce qué idiomas soporta y con qué calidad.
- Dependencia de custom_code: la carga requiere código personalizado del autor, lo que añade riesgo de seguridad y de mantenimiento en producción.
- Licencia apache-2.0: permite uso comercial, pero deben respetarse las atribuciones indicadas en LICENSE y NOTICE del repositorio, incluidas las del modelo base.
- Cero adopción: con cero descargas y cero "likes" en el momento de la consulta, no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Sesgos: no documentados; no se han publicado análisis de sesgo ni de comportamiento en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-m24-leader-mlp
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1123q
