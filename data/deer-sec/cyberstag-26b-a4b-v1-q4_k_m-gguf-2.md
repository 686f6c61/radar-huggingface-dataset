# deer-sec/CyberStag-26B-A4B-V1-Q4_K_M-GGUF

## Resumen

CyberStag-26B-A4B-V1 es un modelo de lenguaje especializado en ciberseguridad y razonamiento lógico profundo, desarrollado por el usuario deer-sec sobre la arquitectura base Gemma-4-26B-A4B de Google, un modelo de mezcla de expertos (MoE) con 26 000 millones de parámetros totales y 4 000 millones de parámetros activos. El modelo ha sido afinado mediante LoRA con el framework mlx_lm, y los adaptadores se han fusionado en el modelo base para su despliegue directo.

Está diseñado como un motor de razonamiento para profesionales de seguridad: analistas SOC, investigadores, administradores de sistemas y expertos en respuesta a incidentes. Su propósito es mejorar tareas como el modelado de amenazas, la evaluación de vulnerabilidades, la interpretación de logs oscuros y la estructuración de estrategias de respuesta. Es un modelo exclusivamente de texto, sin capacidades multimodales, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La versión aquí documentada es la cuantización GGUF Q4_K_M, recomendada por el autor para entornos con VRAM limitada. El repositorio tiene un tamaño de 16,8 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre Gemma-4-26B-A4B |
| Parametros totales | 25 233 142 046 (25,23 B) |
| Parametros activos | 4 B (según nomenclatura del modelo base, no confirmado en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este repo); el autor publica también Q8_0, f16 en GGUF, y bf16/optiq8 en MLX |
| Idiomas soportados | multilingüe (inglés y japonés explícitos; otros no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B, una arquitectura MoE con 26 000 millones de parámetros totales y 4 000 millones activos por token. El afinamiento se realizó con LoRA mediante el framework mlx_lm, actualizando un 1,778 % de los parámetros (aproximadamente 448,7 millones). Los adaptadores se fusionaron completamente en el modelo base.

El entrenamiento cubrió de forma amplia y estratégica los mecanismos de atención y MLP: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y las capas de expertos. Esta cobertura amplia, combinada con una gestión optimizada del contexto, busca capturar la terminología de ciberseguridad y las estructuras de código sin provocar olvido catastrófico. El dataset de entrenamiento fue curado y destilado específicamente para conceptos avanzados de seguridad, inteligencia de amenazas y deducción lógica, aunque los detalles concretos permanecen confidenciales por decisión del autor.

Según las pruebas comparativas del autor frente al modelo base, se observa un aumento leve en la latencia de razonamiento ("tiempo de pensamiento") a cambio de respuestas más precisas y contextualizadas en escenarios de seguridad.

## Capacidades

- Análisis de ciberseguridad: descomposición de vectores de ataque complejos, evaluación de vulnerabilidades y propuesta de estrategias de mitigación.
- Razonamiento lógico profundo: deducción paso a paso para problemas de seguridad y escenarios de incidentes.
- Interpretación de logs: análisis de registros de acceso, logs de servidor y otros artefactos técnicos en busca de indicadores de compromiso.
- Modelado de amenazas: identificación de superficies de ataque y elaboración de perfiles de riesgo.
- Respuesta a incidentes: estructuración de planes de contención, erradicación y recuperación.
- Multilingüismo parcial: soporte explícito de inglés y japonés, con etiqueta general "multilingüe" sin detallar otros idiomas.
- Exclusivamente texto: no procesa imágenes, audio ni entradas multimodales.
- No se documenta soporte de tool calling, function calling ni uso como agente autónomo en la información disponible.

## Casos de uso

- Análisis de logs de servidor: el modelo puede recibir un log de acceso y detectar patrones indicativos de inyección SQL, fuerza bruta o exfiltración de datos, gracias a su afinamiento en interpretación de artefactos técnicos.
- Evaluación de vulnerabilidades: dado un informe de escaneo o una descripción de una CVE, el modelo puede desglosar el impacto, los vectores de explotación y las medidas de remediación aplicables.
- Formación y concienciación en seguridad: puede generar explicaciones didácticas sobre ataques como CSRF o XSS, con ejemplos y contramedidas, útil para equipos de desarrollo y personal no especializado.
- Redacción de políticas de seguridad: a partir de requisitos normativos o de negocio, el modelo puede redactar borradores de políticas de acceso, gestión de parches o respuesta a incidentes.
- Apoyo a SOC: en un entorno de análisis, el modelo puede correlacionar eventos descritos textualmente y sugerir hipótesis de ataque o pasos de investigación adicionales.
- Revisión de código con enfoque defensivo: puede analizar fragmentos de código en busca de malas prácticas de seguridad (validación de entrada, manejo de sesiones, etc.) y proponer correcciones.
- Documentación técnica de incidentes: tras un incidente, el modelo puede ayudar a redactar informes post-mortem estructurados con líneas de tiempo, causas raíz y lecciones aprendidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona mejoras cualitativas frente al modelo base en contextos de ciberseguridad, pero no proporciona métricas cuantitativas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 16,8 GB. Con overhead de contexto y runtime, se recomienda al menos 20-24 GB de VRAM para una ventana de contexto razonable.
- GPU recomendadas: tarjetas con 24 GB o más, como RTX 3090, RTX 4090, A5000, A6000 o A100. En configuraciones con cuantización más agresiva o menor contexto podría ejecutarse en GPUs de 16 GB, pero con limitaciones.
- Compatibilidad con consumer GPU: sí, en GPUs de gama alta para consumidores (RTX 3090/4090) con Q4_K_M.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (si soporta GGUF), y mediante MLX en Apple Silicon (formatos bf16 y optiq8 publicados por el autor).
- Latencia y throughput: no disponibles. El autor indica un aumento leve de latencia frente al modelo base debido al mayor tiempo de razonamiento.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de ciberseguridad del mismo tamaño. El único punto de referencia conocido es el modelo base Gemma-4-26B-A4B, sobre el cual el autor afirma mejoras en calidad de respuesta y profundidad de razonamiento para tareas de seguridad, a costa de una latencia ligeramente superior.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imágenes, audio ni otros formatos multimodales.
- Sesgos y alucinaciones: no se han documentado evaluaciones de sesgos. Como todo LLM, puede generar información plausible pero incorrecta, especialmente en contextos de seguridad donde los detalles técnicos son críticos.
- Datos de entrenamiento confidenciales: no se puede auditar la composición del dataset ni verificar la ausencia de datos problemáticos.
- Restricciones de uso: el autor prohíbe explícitamente el uso para acceso no autorizado, generación de exploits o actividades delictivas. Solo se permite uso educativo, defensivo y de investigación ética.
- Idioma: aunque se declara multilingüe, solo se confirman inglés y japonés; el rendimiento en otros idiomas no está garantizado.
- Contexto y ventana: la longitud de contexto no se especifica, por lo que en despliegues con GGUF puede depender de la configuración de llama.cpp.
- Sin soporte de herramientas: no se documenta function calling ni integración con APIs externas, lo que limita su uso como agente autónomo.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/deer-sec/CyberStag-26B-A4B-V1-Q4_K_M-GGUF
- Modelo base: google/gemma-4-26b-a4b (referencia en la model card, sin URL directa en la información proporcionada)
