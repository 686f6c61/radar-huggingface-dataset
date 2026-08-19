# deer-sec/CyberStag-26B-A4B-v1-bf16

## Resumen

CyberStag-26B-A4B-v1 es un modelo de lenguaje de texto especializado en ciberseguridad y razonamiento lógico profundo, desarrollado por el autor `deer-sec`. Se construye sobre la arquitectura MoE de `google/gemma-4-26b-a4b` y ha sido afinado mediante LoRA con el framework MLX (`mlx_lm.lora`), con los adaptadores ya fusionados en el modelo base para un despliegue directo. El modelo está diseñado para servir como motor de razonamiento para profesionales de seguridad, analistas de SOC, investigadores y administradores de sistemas, con capacidades mejoradas en modelado de amenazas, evaluación de vulnerabilidades, interpretación de registros complejos y planificación de respuesta a incidentes.

El modelo tiene aproximadamente 25,23 mil millones de parámetros totales con 4 mil millones activos (por el sufijo A4B), y se distribuye en varios formatos: MLX en BF16 y cuantización dinámica de 8 bits, así como GGUF en f16, Q8_0 y Q4_K_M. La licencia es Apache 2.0, lo que permite uso comercial, modificación y redistribución libre. Es un modelo solo de texto, sin capacidades multimodales, y está orientado principalmente a los idiomas inglés y japonés, aunque se etiqueta como multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma-4-26B-A4B |
| Parametros totales | 25,23 mil millones |
| Parametros activos | 4 mil millones (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (MLX), OptiQ8 (MLX), F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | multilingue, ingles, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Gemma-4-26B-A4B, un transformer con mezcla de expertos donde solo 4 mil millones de parámetros se activan por token, lo que permite un rendimiento computacional equivalente a un modelo mucho más pequeño mientras mantiene la capacidad de un modelo de 25 mil millones. El afinado se realizó con `mlx_lm.lora`, actualizando de forma estratégica las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), las capas MLP (`gate_proj`, `up_proj`) y las capas de expertos. El 1,778% de los parámetros (aproximadamente 448,7 millones) fueron entrenables, y los adaptadores se fusionaron completamente en el modelo base.

El conjunto de datos de entrenamiento fue curado y destilado específicamente para ciberseguridad, con foco en conceptos avanzados, inteligencia de amenazas precisa, deducción lógica y escenarios de seguridad complejos. Los detalles granular del dataset se mantienen confidenciales para preservar la integridad del modelo y prevenir mal uso. Según el autor, el afinado produce respuestas más precisas y accionables en consultas de seguridad, a costa de un ligero aumento en la latencia de generación (mayor tiempo de "pensamiento").

## Capacidades

- Generacion de texto especializado en ciberseguridad: analisis de vulnerabilidades, modelado de amenazas, interpretacion de registros de acceso y logs de sistema.
- Razonamiento logico profundo paso a paso: descomposicion de vectores de ataque complejos y propuesta de estrategias de mitigacion robustas.
- Soporte de tool calling: no disponible en la informacion proporcionada, aunque al estar basado en Gemma-4 podria heredar capacidades del modelo base (no confirmado).
- Capacidades multilingues: etiquetado como multilingue, con soporte explicito de ingles y japones.
- Solo texto: no procesa imagenes, audio ni entradas multimodales.
- No se mencionan modos especiales de razonamiento tipo "thinking mode" mas alla del aumento natural de latencia observado.

## Casos de uso

- Analisis de registros de servidor: el modelo puede examinar logs de acceso HTTP para detectar patrones de inyeccion SQL, como se muestra en el ejemplo de uso de la model card, identificando parametros sospechosos y proponiendo medidas correctivas.
- Evaluacion de vulnerabilidades: dado un informe tecnico o un fragmento de codigo, el modelo puede desglosar la naturaleza de una vulnerabilidad, su explotabilidad potencial y recomendar parches o configuraciones seguras.
- Planificacion de respuesta a incidentes: ante una descripcion de un incidente de seguridad, el modelo estructura fases de contencion, erradicacion y recuperacion, adaptadas al contexto organizativo descrito.
- Educacion y formacion en seguridad: permite a estudiantes y profesionales noveles plantear escenarios de ataque hipoteticos y recibir explicaciones detalladas de las tecnicas involucradas y sus defensas.
- Redaccion de inteligencia de amenazas: ayuda a sintetizar informes de threat intelligence a partir de datos tecnicos dispersos, generando resumenes accionables para equipos de SOC.
- Auditoria de configuracion: el modelo puede revisar fragmentos de configuracion de servidores o firewalls y senalar malas practicas de seguridad, como permisos excesivos o cifrado debil.
- Asistencia en hardening de sistemas: dado un inventario de servicios y versiones, sugiere medidas de endurecimiento especificas, priorizando por riesgo y esfuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona pruebas comparativas contra el modelo base en contextos de ciberseguridad, confirmando mejoras cualitativas en calidad de respuesta y profundidad de razonamiento, pero no se proporcionan metricas cuantitativas (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo en BF16 ocupa 50,5 GB, por lo que se necesitan al menos 52-56 GB de VRAM para cargar el modelo sin cuantizar. Con cuantizacion Q4_K_M (GGUF), el modelo podria caber en 16 GB de VRAM, aunque el tamaño exacto no se especifica.
- GPU recomendadas: para BF16 completo, una NVIDIA A100 80GB o H100 son adecuadas. Para Q4_K_M, una RTX 4090 (24 GB) o RTX 4080 (16 GB) podrian ser suficientes, dependiendo de la longitud de contexto.
- En consumer GPU: si, con las variantes cuantizadas. El formato Q4_K_M esta recomendado por el autor para VRAM limitada.
- Opciones de despliegue: MLX para Apple Silicon (via `mlx_lm`), llama.cpp o LM Studio para GGUF. No se menciona soporte explicito para vLLM o TGI, aunque al ser un modelo basado en Gemma podria ser compatible.
- Latencia y throughput: no se proporcionan datos numericos. El autor indica un aumento leve en el tiempo de procesamiento respecto al modelo base, como trade-off por el razonamiento mas profundo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos en el ambito de ciberseguridad con el mismo tamano y arquitectura. Alternativas genericas de tamano similar (como Llama-3-70B o Mistral-8x22B) no son directamente comparables por su orientacion generalista y diferente licencia. La comparativa mas relevante seria contra el modelo base `google/gemma-4-26b-a4b`, que comparte arquitectura pero no esta especializado en seguridad. No se proporcionan datos cuantitativos de esa comparacion.

## Limitaciones y advertencias

- Modelo solo de texto: no procesa entradas multimodales, lo que limita su uso en analisis de imagenes o audio relacionados con seguridad.
- Sesgos conocidos: no se han publicado evaluaciones de sesgos. Dado que el dataset de entrenamiento es confidencial, no es posible auditar su composicion ni su posible sesgo hacia ciertos tipos de amenazas o regiones.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion plausible pero incorrecta en dominios tecnicos. Se recomienda verificar las recomendaciones de seguridad con fuentes autorizadas antes de aplicarlas en produccion.
- Limitaciones de idioma: aunque se etiqueta como multilingue, el soporte explicito se limita a ingles y japones. El rendimiento en otros idiomas no esta garantizado.
- Restricciones de uso: el autor prohibe explicitamente el uso para acceso no autorizado, generacion de exploits o cualquier actividad delictiva. El modelo debe emplearse solo para investigacion defensiva y resiliencia de sistemas.
- Datos de entrenamiento confidenciales: la imposibilidad de auditar el dataset puede ser un inconveniente para organizaciones con requisitos estrictos de gobernanza de IA.
- Contexto no especificado: no se conoce la longitud maxima de contexto, lo que dificulta planificar despliegues en tareas que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/deer-sec/CyberStag-26B-A4B-v1-bf16
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b
- No se proporcionan enlaces a papers, blogs o demos en la informacion disponible.
