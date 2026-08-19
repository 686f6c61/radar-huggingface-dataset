# deer-sec/CyberStag-26B-A4B-V1-BF16-MLX

## Resumen

CyberStag-26B-A4B-V1 es un modelo de lenguaje especializado en ciberseguridad y razonamiento lógico, desarrollado por el equipo deer-sec. Se basa en la arquitectura MoE (Mixture of Experts) Gemma-4-26B-A4B de Google y ha sido afinado mediante LoRA sobre un dataset curado de conceptos avanzados de seguridad, inteligencia de amenazas y deducción lógica. El modelo está disponible en formato MLX para Apple Silicon y GGUF para otros entornos, con licencia Apache 2.0, lo que permite uso comercial.

Con 25.230 millones de parámetros totales y aproximadamente 4.000 millones activos por token, ofrece un equilibrio entre capacidad y eficiencia. Su especialización en ciberseguridad lo hace relevante para profesionales de SOC, investigadores y administradores de sistemas que necesitan asistencia en análisis de logs, modelado de amenazas y respuesta a incidentes. Aunque es un modelo de texto puro, su capacidad de razonamiento profundo lo distingue de alternativas generalistas.

La versión BF16 MLX aquí presentada es la de máxima precisión, pensada para entornos con abundante memoria unificada, mientras que existen variantes cuantizadas para hardware más limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma-4-26B-A4B |
| Parametros totales | 25.233.053.440 (25,23B) |
| Parametros activos | ~4B (segun denominacion del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, OptiQ8 (MLX); BF16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Multilingue, con enfoque en ingles y japones |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B, un transformer MoE con 26B parametros totales y 4B activos por token. El fine-tuning se realizo con `mlx_lm.lora`, actualizando un 1,778% de los parametros (unos 448,7M) en capas de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y capas de expertos). Los adaptadores LoRA se fusionaron en el modelo base para facilitar el despliegue.

El dataset de entrenamiento es privado, pero se describe como curado y destilado en torno a conceptos avanzados de ciberseguridad, inteligencia de amenazas y razonamiento logico. No se menciona el uso de RLHF o DPO. El autor indica un ligero aumento en el tiempo de "pensamiento" (latencia) como trade-off para lograr deducciones mas profundas y analiticas.

## Capacidades

- Generacion de texto y razonamiento logico profundo, especialmente en dominios de seguridad.
- Analisis de logs y deteccion de patrones de ataque (inyeccion SQL, CSRF, etc.).
- Modelado de amenazas y evaluacion de vulnerabilidades.
- Asistencia en la construccion de estrategias de respuesta a incidentes.
- Soporte multilingue (ingles y japones, con capacidad multilingue general).
- No incluye capacidades multimodales (solo texto).

## Casos de uso

- Analisis de logs de servidor: el modelo puede examinar logs de acceso y detectar posibles inyecciones SQL u otros vectores de ataque, explicando el riesgo y sugiriendo mitigaciones concretas.
- Evaluacion de vulnerabilidades: a partir de descripciones de sistemas y configuraciones, puede identificar puntos debiles y recomendar parches o configuraciones seguras.
- Respuesta a incidentes: ayuda a estructurar un plan de accion ante un incidente de seguridad, priorizando pasos y considerando el contexto de la organizacion.
- Formacion y concienciacion en seguridad: puede generar explicaciones detalladas de ataques como CSRF o XSS, con ejemplos y medidas preventivas, util para equipos de desarrollo.
- Redaccion de informes de seguridad: a partir de hallazgos tecnicos, redacta informes ejecutivos y tecnicos claros y accionables.
- Analisis de inteligencia de amenazas: procesa descripciones de campañas maliciosas y extrae indicadores de compromiso (IOCs) y tacticas, tecnicas y procedimientos (TTPs).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La version BF16 MLX requiere aproximadamente 50,5 GB de memoria unificada en Apple Silicon (el repositorio tiene ese tamaño). Se recomienda un Mac con al menos 64 GB de RAM unificada para trabajar comodamente.
- Para GGUF cuantizado Q4_K_M, el tamaño estimado es de unos 14-16 GB, por lo que puede ejecutarse en GPUs con 16 GB de VRAM (por ejemplo, RTX 4080/4090, A10, etc.) usando llama.cpp o LM Studio.
- La version Q8_0 requiere unos 25-28 GB de VRAM, adecuada para GPUs de 32 GB o mas.
- Opciones de despliegue: MLX para Apple Silicon, llama.cpp para CPU/GPU, y potencialmente vLLM o TGI si se convierte a formato compatible (no se menciona soporte oficial).
- La latencia sera mayor que la del modelo base debido al ajuste fino, pero no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos especializados en ciberseguridad. Frente al modelo base Gemma-4-26B-A4B, el ajuste fino mejora la calidad de respuesta en dominios de seguridad, a costa de una ligera latencia adicional. No se han encontrado otros modelos comparables con licencia Apache 2.0 y especializacion en seguridad.

## Limitaciones y advertencias

- Es un modelo de texto puro, sin capacidades multimodales.
- La longitud de contexto no se ha especificado en la documentacion disponible.
- El dataset de entrenamiento es privado, lo que limita la auditoria externa de posibles sesgos.
- Puede alucinar en escenarios de seguridad muy especificos o poco comunes; siempre se debe verificar la informacion critica.
- El uso esta restringido a fines educativos, defensivos y de investigacion; esta prohibido su uso para acceso no autorizado o generacion de exploits.
- Aunque la licencia Apache 2.0 permite uso comercial, el aviso del autor limita el uso a actividades eticas.

## Enlaces

- HuggingFace: https://huggingface.co/deer-sec/CyberStag-26B-A4B-V1-BF16-MLX
- Modelo base: google/gemma-4-26b-a4b (mencionado en la model card, sin enlace directo)
- Otros formatos del mismo modelo (mencionados en la model card): CyberStag-26B-A4B-V1-OptiQ8-MLX, CyberStag-26B-A4B-V1-BF16-GGUF, CyberStag-26B-A4B-V1-Q8_0-GGUF, CyberStag-26B-A4B-V1-Q4_K_M-GGUF.
