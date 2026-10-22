# alfred8995/sn38-r2-2024-ecfcd2-chronollm-2024f

## Resumen

`alfred8995/sn38-r2-2024-ecfcd2-chronollm-2024f` es un modelo de lenguaje de aproximadamente 1.860 millones de parámetros (1.858.535.658 exactos según los tensores en safetensors) publicado en HuggingFace bajo acceso restringido. Por la nomenclatura del repositorio y su etiqueta `ChronoGPT`, se trata de una entrega de minero para el subnet 38 de Bittensor, conocido como ChronoLLM, especializado en el entrenamiento competitivo de modelos cronológicamente consistentes. El sufijo `2024` indica que el modelo está asociado al año 2024 dentro del esquema del subnet, en el que cada minero entrena un modelo por año natural entre 2013 y 2025 y lo sube a HuggingFace junto con un mapeo registrado on-chain.

El problema que aborda esta familia de modelos es el sesgo de anticipación (*lookahead bias*) en el análisis financiero y el backtesting. Los modelos de lenguaje convencionales se entrenan con corpus que abarcan todas las épocas, de modo que al pedirles que evalúen una decisión de inversión de 2015 ya han visto el crack de 2020 y el resto de acontecimientos posteriores. Un ChronoGPT se entrena deliberadamente con datos limitados a su año objetivo para que su "conocimiento del mundo" sea coherente con el momento histórico que se simula.

La relevancia de esta ficha es acotada: el repositorio no incluye *model card*, no declara idiomas ni pipeline, no publica resultados de benchmarks y exige aceptar condiciones de acceso. Su interés es principalmente como artefacto de un pipeline de entrenamiento descentralizado (Bittensor SN38) y como pieza de un experimento de evaluación cronológica, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `ChronoGPT` sugiere una arquitectura transformer de tipo GPT, pero no hay documentación que lo confirme |
| Parámetros totales | 1.858.535.658 (≈1,86 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en el repositorio. Los pesos publicados están en safetensors con tensores en F32 (según el repositorio canónico de referencia), lo que permite cuantización posterior a FP16/BF16, INT8 e INT4 con herramientas estándar, sin que existan versiones oficiales publicadas |
| Idiomas soportados | No disponible |
| Licencia | `other` (términos no especificados en el repositorio); acceso restringido, requiere aceptar condiciones en HuggingFace |
| Formato de pesos | safetensors (F32). Tamaño del repositorio: 7,4 GB, consistente con 1,86 B de parámetros en precisión completa |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna: el repositorio no incluye *model card* ni `config.json` documentado en la información disponible. La única señal es la etiqueta `ChronoGPT`, que en el contexto del subnet 38 designa a los modelos entrenados por los mineros siguiendo el protocolo de consistencia cronológica. Los tensores están almacenados en F32, un formato inusualmente pesado para publicación (7,4 GB para 1,86 B de parámetros), lo que sugiere un volcado directo del checkpoint de entrenamiento sin conversión a BF16/FP16.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del corpus, la ventana temporal exacta cubierta (aunque el nombre indica 2024) ni si se aplicaron etapas de ajuste fino supervisado, RLHF o DPO. El mecanismo descrito en la documentación del subnet consiste en entrenar un modelo por año entre 2013 y 2025, subirlo a HuggingFace y registrar un mapeo on-chain; los validadores evalúan después la consistencia cronológica y la calidad del modelo. El repositorio `st2058130-svg/chronollm` describe el objetivo del proyecto (evitar el sesgo de anticipación en backtesting y análisis histórico), pero no detalla hiperparámetros ni recetas de entrenamiento concretas de esta entrega.

## Capacidades

- Generación de texto autoregresiva: capacidad esperable en un modelo de ~1,86 B de parámetros, sin confirmación documental de calidad.
- Conocimiento del mundo acotado al año objetivo (2024 según el nombre del repositorio), lo que constituye su rasgo diferencial frente a un LLM convencional.
- Razonamiento y análisis sobre eventos, empresas y coyuntura económica hasta el corte temporal declarado, orientado a simulaciones históricas.
- Soporte de *tool calling* / *function calling*: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; no hay evidencia de modalidades adicionales.
- Integración en el pipeline del subnet 38: el modelo está pensado para ser evaluado por validadores de Bittensor SN38 y asignado al año 2024 mediante el mapeo on-chain.

## Casos de uso

- **Backtesting de estrategias de inversión sin sesgo de anticipación**: el modelo se consultaría como analista simulado en un punto de 2024, de forma que sus respuestas no incorporen información posterior a ese año. Es el caso de uso central del proyecto ChronoLLM.
- **Simulación de escenarios contrafactuales históricos**: generar análisis de coyuntura "como se habrían escrito" en 2024 para comparar después con lo que realmente ocurrió y medir la calidad de la inferencia bajo información limitada.
- **Investigación académica sobre consistencia temporal en LLM**: usar el modelo como sujeto de prueba en experimentos que midan cuánta información posterior al corte temporal filtra un modelo entrenado con la receta del subnet.
- **Generación de resúmenes de prensa económica con corte temporal**: producir resúmenes de noticias y estados financieros de 2024 sin contaminación de eventos de 2025, útil para reconstruir narrativas de mercado.
- **Evaluación comparativa de mineros del subnet 38**: servir como referencia de la ronda 2 de 2024 frente a entregas de otros mineros, comparando consistencia cronológica y calidad de generación.
- **Docencia en finanzas cuantitativas**: ilustrar en un aula cómo se construye un pipeline de evaluación libre de *lookahead bias*, con este modelo como ejemplo de artefacto entrenado por año.
- **Corpus sintético con sesgo temporal controlado**: generar textos de dominio financiero etiquetados a 2024 para aumentar datasets de entrenamiento de modelos auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye *model card*, no declara métricas de MMLU, HumanEval, GSM8K ni de consistencia cronológica, y el repositorio canónico de referencia (`ecfcd2/chronollm-2024f`) tampoco aporta cifras. Cualquier comparación numérica con otros modelos sería especulativa y no se incluye.

## Requisitos de hardware

- VRAM estimada para inferencia con los pesos publicados en F32: ≈7,4 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica 10-12 GB para secuencias cortas.
- Conversión a FP16/BF16: ≈3,7 GB de pesos, apto para GPU de 8 GB con margen limitado (por ejemplo, RTX 3060 Ti 8 GB, RTX 4060 8 GB) para contextos cortos.
- Cuantización INT8: ≈1,9 GB de pesos; INT4: ≈1,1 GB. Cabe holgadamente en cualquier GPU consumer con 6 GB o más y en CPU con suficiente RAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inferencia en FP16 con contextos largos; A100/H100 solo justificables para servir en lote con alto *throughput*, no por requisitos de memoria.
- Opciones de despliegue: `transformers` (referencia), vLLM y TGI para servir en FP16/BF16, llama.cpp/Ollama tras conversión a GGUF, y TensorRT-LLM si se compila el motor. No hay versiones GGUF publicadas en el repositorio, por lo que la conversión sería responsabilidad del usuario.
- Latencia y *throughput* estimados: no disponibles. No se han publicado mediciones y cualquier cifra dependería del hardware y del backend elegido.
- Nota operativa: al ser un repositorio *gated*, es necesario autenticarse con un token de HuggingFace con acceso concedido para descargar los pesos, lo que afecta a la automatización del despliegue.

## Comparativa con modelos similares

No existen comparables directos publicados con métricas verificables. La tabla siguiente recoge únicamente especificaciones estructurales de modelos abiertos de tamaño similar, a modo de referencia de categoría; no implica comparación de rendimiento, que no puede establecerse con la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `alfred8995/sn38-r2-2024-ecfcd2-chronollm-2024f` | 1,86 B | No disponible | `other` (términos no publicados) | HuggingFace, acceso restringido |
| Qwen2.5-1.5B | 1,5 B | 32 768 tokens | Apache 2.0 | HuggingFace y la mayoría de backends de inferencia |
| Gemma 2 2B | ≈2,6 B | 8 192 tokens | Términos de uso de Gemma | HuggingFace, requiere aceptación |
| SmolLM2-1.7B | ≈1,7 B | 8 192 tokens | Apache 2.0 | HuggingFace y GGUF oficiales |

Diferencias cualitativas relevantes: frente a estas alternativas, el modelo del subnet 38 no ofrece documentación de arquitectura, idiomas, benchmarks ni versiones cuantizadas oficiales, y su licencia `other` sin texto público impide determinar condiciones de uso comercial. Su única ventaja diferencial es el corte temporal controlado (2024), que ninguna de las alternativas ofrece.

## Limitaciones y advertencias

- Ausencia total de *model card*: no se documentan datos de entrenamiento, arquitectura, hiperparámetros ni proceso de alineación (RLHF/DPO), lo que impide auditar sesgos o estimar calidad.
- Riesgo de alucinación elevado y no cuantificado: sin evidencia de ajuste por instrucciones ni de evaluación humana publicada, la fiabilidad factual en dominios especializados no está garantizada.
- Licencia `other` con términos no publicados: no puede asumirse permiso para uso comercial, redistribución ni despliegue en servicios de terceros sin contactar con el autor.
- Acceso restringido (*gated*): requiere aprobación manual, lo que rompe pipelines automatizados y complica la reproducibilidad.
- Idiomas no declarados: no hay garantía de competencia en castellano ni de comportamiento multilingüe; el corpus del subnet parece orientado a contenido financiero en inglés.
- Corte temporal deliberado: el modelo no conoce (por diseño) información posterior a 2024; usarlo como asistente general produciría respuestas desactualizadas. Esta limitación es intencionada, pero debe documentarse en cualquier producto que lo integre.
- Sesgos del corpus histórico: al entrenar solo con datos de una ventana temporal concreta, el modelo hereda el sesgo editorial y de cobertura de las fuentes de ese periodo, con posible infrarepresentación de perspectivas no publicadas entonces.
- Sin validación comunitaria: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de terceros sobre su comportamiento real.
- Metadatos anómalos: la fecha de creación declarada (2026-10-21) resulta inconsistente con el ciclo del subnet descrito; conviene tratarla como posible artefacto de metadatos.
- Sin benchmarks ni métricas de consistencia cronológica publicadas: no es posible verificar que el modelo cumpla realmente el objetivo de no filtrar información posterior a su año objetivo.
- Precisión F32 en un modelo de 1,86 B: el repositorio pesa 7,4 GB, el doble o el cuádruple de lo necesario, lo que encarece descarga y almacenamiento sin beneficio práctico en inferencia.

## Enlaces

- HuggingFace (repositorio objeto de la ficha): https://huggingface.co/alfred8995/sn38-r2-2024-ecfcd2-chronollm-2024f
- Repositorio canónico de referencia en HuggingFace: https://huggingface.co/ecfcd2/chronollm-2024f
- Repositorio GitHub del proyecto ChronoLLM: https://github.com/st2058130-svg/chronollm
- Documentación para mineros del subnet 38: https://github.com/chronollm/sn38/blob/main/docs/miner.md
- Ficha del subnet en TAO Alpha: https://www.jasontensor.com/subnet/38
- Estadísticas del subnet en TaoMarketCap: https://taomarketcap.com/subnets/38
