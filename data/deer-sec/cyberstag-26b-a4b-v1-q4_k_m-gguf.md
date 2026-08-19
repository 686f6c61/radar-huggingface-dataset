# deer-sec/CyberStag-26B-A4B-v1-Q4_K_M.gguf

## Resumen

CyberStag-26B-A4B-v1 es un modelo de lenguaje especializado en ciberseguridad y razonamiento lógico profundo, desarrollado por el usuario deer-sec. Está construido sobre la arquitectura MoE (Mixture of Experts) del modelo base google/gemma-4-26b-a4b, con 25.233 millones de parámetros totales y aproximadamente 4.000 millones de parámetros activos por token. El modelo ha sido fine-tuneado mediante LoRA con el framework mlx_lm, y los adaptadores se han fusionado completamente en el modelo base para facilitar su despliegue.

El objetivo principal es servir como motor de razonamiento para profesionales de seguridad, analistas SOC, investigadores y administradores de sistemas. Mejora las capacidades del modelo base en tareas como modelado de amenazas, evaluación de vulnerabilidades, interpretación de logs oscuros y estructuración de estrategias de respuesta a incidentes. Es un modelo exclusivamente de texto, sin capacidades multimodales, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación libre.

La relevancia actual de este modelo radica en la creciente demanda de herramientas de IA especializadas en seguridad defensiva, que puedan analizar grandes volúmenes de datos técnicos y generar respuestas accionables. Al estar disponible en formatos GGUF y MLX, puede ejecutarse en una amplia gama de hardware, desde estaciones de trabajo con GPU de consumo hasta Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma-4-26B-A4B |
| Parametros totales | 25.233.142.046 (25,23B) |
| Parametros activos | 4B (inferido del nombre del modelo, no confirmado en la documentacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, f16 (GGUF); bf16, optiq8 (MLX) |
| Idiomas soportados | Multilingue, con enfasis en ingles y japones |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, MLX (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Gemma-4-26B-A4B, que combina 26.000 millones de parámetros totales con una activación selectiva de aproximadamente 4.000 millones por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, ya que solo una fracción de los expertos se activa durante la inferencia.

El fine-tuning se realizó con LoRA (Low-Rank Adaptation) mediante el framework mlx_lm, actualizando un 1,778% de los parámetros (aproximadamente 448,7 millones). Los objetivos del LoRA incluyeron de forma amplia las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), las capas MLP (`gate_proj`, `up_proj`) y las capas de expertos. Esta estrategia buscó capturar la terminología y estructura del dominio de ciberseguridad sin provocar olvido catastrófico. El dataset de entrenamiento fue curado y destilado, centrado en conceptos avanzados de seguridad, inteligencia de amenazas y deducción lógica, aunque los detalles específicos no han sido revelados por el autor.

## Capacidades

- Generacion de texto especializado en ciberseguridad: analisis de vectores de ataque, mitigaciones, interpretacion de logs y redaccion de informes tecnicos.
- Razonamiento logico profundo: descomposicion de problemas complejos en pasos secuenciales, con un ligero incremento en el tiempo de "pensamiento" observado frente al modelo base.
- Evaluacion de vulnerabilidades: identificacion de posibles debilidades en sistemas, redes y aplicaciones a partir de descripciones textuales.
- Modelado de amenazas: estructuraccion de escenarios de ataque y defensa basados en informacion proporcionada por el usuario.
- Soporte de tool calling: no se menciona explicitamente en la documentacion, pero al estar basado en Gemma-4, podria heredar capacidades de function calling; no confirmado.
- Multilingue: soporta ingles y japones de forma destacada, ademas de otros idiomas no especificados.

## Casos de uso

- Analisis de logs de acceso: el modelo puede examinar registros de servidores y detectar patrones indicativos de inyeccion SQL, como se muestra en el ejemplo de la model card, donde se pide analizar un log para identificar vulnerabilidades.
- Respuesta a incidentes: ayuda a estructurar planes de respuesta ante brechas de seguridad, priorizando acciones y recomendando medidas de contencion basadas en la descripcion del incidente.
- Formacion en seguridad: generacion de explicaciones detalladas sobre mecanismos de ataques como CSRF o XSS, utiles para equipos de desarrollo y concienciacion interna.
- Evaluacion de postura de seguridad: analisis de configuraciones de red, politicas de acceso o arquitecturas de sistemas para identificar riesgos potenciales.
- Inteligencia de amenazas: procesamiento de informes de amenazas y extraccion de indicadores de compromiso (IoC) o tacticas, tecnicas y procedimientos (TTP) relevantes.
- Auditoria de codigo: revision de fragmentos de codigo fuente para detectar malas practicas de seguridad o posibles vulnerabilidades, gracias a su capacidad de razonamiento sobre estructuras de programacion.
- Documentacion tecnica: redaccion de politicas de seguridad, guias de hardening o manuales de procedimientos adaptados al contexto organizacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras cualitativas frente al modelo base en contextos de ciberseguridad, pero no proporciona metricas cuantitativas como MMLU, HumanEval o GSM8K. Tampoco se ofrecen comparativas numericas con otros modelos especializados.

## Requisitos de hardware

- El archivo Q4_K_M ocupa aproximadamente 16,8 GB, por lo que cabe en GPUs de consumo con 24 GB de VRAM, como la RTX 4090 o la RTX 3090.
- Para la version f16 o bf16 se requeririan al menos 50 GB de VRAM, siendo adecuadas GPU profesionales como A100 (80 GB) o H100.
- El formato MLX esta optimizado para Apple Silicon (M1/M2/M3), pudiendo ejecutarse en Mac con suficiente memoria unificada (32 GB o mas para la version optiq8).
- Es compatible con llama.cpp, LM Studio y cualquier frontend que soporte GGUF, lo que permite ejecucion en CPU con cuantizacion Q4_K_M.
- No se proporcionan datos de latencia o throughput; el autor indica un ligero aumento en el tiempo de razonamiento frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| CyberStag-26B-A4B-v1 | 25,23B (MoE, 4B activos) | no disponible | Ciberseguridad | Apache 2.0 |
| google/gemma-4-26b-a4b | 25,23B (MoE, 4B activos) | no disponible | Generalista | Apache 2.0 |
| deer-sec/CyberStag-26B-A4B-v1 (base) | 25,23B | no disponible | Ciberseguridad | Apache 2.0 |

No se dispone de informacion sobre otros modelos especializados en ciberseguridad comparables en el momento de la consulta. La comparativa se limita al modelo base y a la version sin cuantizar del propio CyberStag.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imagenes, audio ni otros formatos multimodales.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o imprecisa, especialmente en escenarios de seguridad donde los datos son ambiguos.
- Sesgos potenciales: el dataset de entrenamiento no ha sido divulgado, por lo que podria contener sesgos hacia ciertos tipos de ataques o entornos tecnologicos.
- Limitaciones de idioma: aunque se declara multilingue, el enfasis principal esta en ingles y japones; el rendimiento en otros idiomas podria ser inferior.
- Restricciones de uso: el autor prohibe explicitamente el uso para acceso no autorizado, generacion de exploits o cualquier actividad delictiva; solo se permite uso educativo, defensivo e investigacion etica.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Al ser un modelo fine-tuneado con LoRA, podria haber perdido parte de la generalidad del modelo base en dominios fuera de la ciberseguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deer-sec/CyberStag-26B-A4B-v1-Q4_K_M.gguf
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b
- Repositorio principal (con imagenes y versiones adicionales): https://huggingface.co/deer-sec/CyberStag-26B-A4B-v1
