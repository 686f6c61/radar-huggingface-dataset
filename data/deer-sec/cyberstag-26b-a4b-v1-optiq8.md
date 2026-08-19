# deer-sec/CyberStag-26B-A4B-v1-optiq8

## Resumen

CyberStag-26B-A4B-v1 es un modelo de lenguaje especializado en ciberseguridad, desarrollado por deer-sec a partir del modelo base `google/gemma-4-26b-a4b` (arquitectura MoE). Se trata de un modelo de texto exclusivamente, afinado mediante LoRA con `mlx_lm` y posterior fusión de los adaptadores en el modelo base. Su objetivo es servir como motor de razonamiento para profesionales de seguridad: análisis de logs, modelado de amenazas, evaluación de vulnerabilidades y respuesta a incidentes.

El modelo se distribuye en formatos MLX (optimizados para Apple Silicon) y GGUF (para llama.cpp y LM Studio), con cuantizaciones que van desde bf16 hasta Q4_K_M. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Aunque la model card indica que está pensado para inglés y japonés, el tag `multilingual` sugiere cobertura adicional, aunque no se especifica qué idiomas.

La relevancia de este modelo radica en su enfoque vertical en ciberseguridad, un dominio donde los modelos generalistas suelen carecer de precisión terminológica y de razonamiento profundo sobre vectores de ataque y mitigaciones. Su tamaño (26B totales, 4B activos) lo sitúa en un rango que puede ejecutarse en hardware de gama media-alta, especialmente con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma-4-26B-A4B |
| Parametros totales | 26B (nominal según nombre del modelo base); 25.23B según la model card |
| Parametros activos | 4B (según sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX: bf16, 8-bit dinámico (optiq8); GGUF: f16, Q8_0, Q4_K_M |
| Idiomas soportados | inglés, japonés (tag multilingual, sin detalle adicional) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Gemma-4-26B-A4B, que combina atención y MLP con capas de expertos. Según la model card, el afinamiento se realizó con `mlx_lm` LoRA, actualizando de forma amplia los mecanismos de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y capas de expertos). Se entrenaron aproximadamente 448.7 millones de parámetros (1.778% del total) sobre un conjunto de datos curado y destilado de conceptos avanzados de ciberseguridad, inteligencia de amenazas y razonamiento lógico. Los detalles específicos del dataset no se han hecho públicos para evitar un mal uso.

La estrategia de entrenamiento buscó evitar el olvido catastrófico manteniendo el conocimiento general del modelo base mientras se especializaba en el dominio de seguridad. La model card reporta un ligero aumento en la latencia de generación ("thinking time") como compensación por una mayor profundidad de razonamiento.

## Capacidades

- Razonamiento lógico y deductivo en profundidad para análisis de seguridad.
- Análisis de logs de sistemas y servidores para detectar posibles inyecciones SQL, CSRF y otros vectores de ataque.
- Modelado de amenazas y descomposición de vectores de ataque complejos.
- Evaluación de vulnerabilidades y propuesta de estrategias de mitigación.
- Interpretación de logs oscuros o poco estructurados.
- Generación de estrategias de respuesta a incidentes.
- Soporte multilingüe limitado a inglés y japonés (según la model card; el tag `multilingual` no se detalla).
- No soporta entrada multimodal (solo texto).

## Casos de uso

- **Análisis de logs de acceso en servidores**: el modelo puede recibir un log y detectar patrones de inyección SQL, fuerza bruta o exfiltración de datos, como se muestra en el ejemplo de uso de la model card.
- **Modelado de amenazas en entornos empresariales**: ayuda a identificar actores, tácticas y técnicas (p. ej., MITRE ATT&CK) a partir de descripciones de infraestructura o incidentes.
- **Evaluación de vulnerabilidades en código**: puede revisar fragmentos de código y señalar posibles fallos de seguridad (aunque no se menciona explícitamente, su entrenamiento en ciberseguridad lo habilita para ello).
- **Generación de informes de respuesta a incidentes**: estructura recomendaciones paso a paso para contener, erradicar y recuperarse de un incidente.
- **Formación y concienciación en seguridad**: simula escenarios de ataque y defensa para entrenar a analistas junior.
- **Asistencia en auditorías de seguridad**: responde preguntas sobre cumplimiento, políticas de acceso y configuración segura de sistemas.
- **Traducción y redacción de documentación de seguridad**: al soportar inglés y japonés, puede redactar o traducir políticas y procedimientos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona mejoras cualitativas frente al modelo base en contextos de ciberseguridad, pero sin métricas numéricas.

## Requisitos de hardware

- **MLX (Apple Silicon)**: requiere un Mac con chip M1 o superior. La versión bf16 necesita más memoria unificada (estimación: al menos 32 GB para 26B en bf16, aunque con 4B activos el uso real es menor). La versión optiq8 (8-bit) reduce el requisito a unos 16-20 GB.
- **GGUF (llama.cpp/LM Studio)**: la versión Q4_K_M es la más ligera, apta para GPUs con 8-12 GB de VRAM (p. ej., RTX 3080/4080). Q8_0 requiere alrededor de 20-24 GB. La versión f16 requiere más de 30 GB.
- **Opciones de despliegue**: MLX para Apple Silicon, llama.cpp o LM Studio para GGUF en CPU/GPU. No se menciona soporte para vLLM o TGI.
- **Latencia**: la model card indica un ligero aumento en el tiempo de razonamiento respecto al modelo base, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos de ciberseguridad con la misma arquitectura. Como referencia, se puede comparar con el modelo base `google/gemma-4-26b-a4b`, que es más generalista pero no está especializado en seguridad. Otros modelos de seguridad como SecurityBERT (mucho más pequeño) o modelos generalistas grandes (GPT-4, Claude) no son directamente comparables por licencia o tamaño. Por tanto, la comparativa se limita a:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| CyberStag-26B-A4B-v1 | 26B totales, 4B activos | no disponible | Ciberseguridad | Apache 2.0 |
| Gemma-4-26B-A4B (base) | 26B totales, 4B activos | no disponible | Generalista | Apache 2.0 |

No se dispone de datos de rendimiento cuantitativos para establecer una comparación objetiva.

## Limitaciones y advertencias

- **Solo texto**: no procesa imágenes, audio ni otros formatos multimodales.
- **Alcance lingüístico limitado**: la model card menciona inglés y japonés; el tag `multilingual` no especifica otros idiomas, por lo que su uso en español u otros idiomas puede degradar la calidad.
- **Riesgo de alucinación**: como todo LLM, puede generar información falsa o inexacta, especialmente en dominios técnicos donde los datos de entrenamiento pueden estar desactualizados.
- **Sesgos**: no se han documentado sesgos específicos, pero al estar afinado sobre un dataset de ciberseguridad, puede presentar un sesgo hacia terminología y perspectivas anglosajonas.
- **Restricciones de uso**: la model card prohíbe explícitamente el uso para acceso no autorizado, generación de exploits o ciberdelincuencia. Aunque la licencia Apache 2.0 permite uso comercial, el disclaimer ético limita el ámbito de aplicación.
- **Falta de benchmarks**: no hay métricas publicadas que permitan validar su rendimiento real frente a otros modelos.
- **Contexto no especificado**: se desconoce la longitud máxima de contexto, lo que puede afectar a tareas que requieran ventanas largas (p. ej., análisis de logs extensos).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/deer-sec/CyberStag-26B-A4B-v1-optiq8)
- [Modelo base: google/gemma-4-26b-a4b](https://huggingface.co/google/gemma-4-26b-a4b) (referencia, no se ha verificado su existencia real)
