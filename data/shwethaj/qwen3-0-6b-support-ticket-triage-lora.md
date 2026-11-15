# ShwethaJ/qwen3-0.6b-support-ticket-triage-lora

## Resumen

El modelo `ShwethaJ/qwen3-0.6b-support-ticket-triage-lora` es un adaptador LoRA publicado por ShwethaJ sobre el modelo base `Qwen/Qwen3-0.6B`. No se trata de un modelo completo, sino de pesos de adaptador (unos 4,6 millones de parámetros entrenables) que deben cargarse junto con los pesos originales de Qwen3-0.6B en una revisión concreta. Su propósito es muy específico: convertir tickets de soporte en inglés en un objeto JSON estructurado con cuatro campos (categoría, entorno, impacto reportado por el cliente y equipo sugerido).

El adaptador se entrenó con un conjunto muy reducido de tickets ficticios generados por IA (128 de entrenamiento, 34 de validación y 66 de test), usando LoRA con rango 16, alpha 32, dropout 0,05 y apuntando a las proyecciones de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`. La selección del checkpoint se hizo por pérdida de validación (0,256318 en el checkpoint-32, época 2). Todo el entrenamiento se ejecutó en una Tesla T4 de Google Colab, en precisión mixta FP16.

Su relevancia es la de un proyecto de portafolio: demuestra que un modelo de 0,6 mil millones de parámetros puede pasar de generar JSON válido en el 53,0 % de los casos a hacerlo en el 98,5 % tras un ajuste fino ligero, con mejoras notables en macro-F1 de categoría (0,471 a 0,881) y en precisión de entorno (34,8 % a 90,9 %). Es, por tanto, un ejemplo de extracción de información estructurada con un modelo pequeño y desplegable en hardware modesto, no un sistema listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA |
| Parámetros totales | No disponible (el adaptador suma 4.587.520 parámetros entrenables; el modelo base Qwen3-0.6B no se detalla en la información) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información; el entrenamiento usó secuencias de 512 tokens como máximo |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen3, pero no se documentan aquí) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. El ajuste fino es LoRA con rango 16, alpha 32 y dropout 0,05, aplicado exclusivamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). La pérdida se calcula únicamente sobre los tokens de respuesta del asistente y el token de fin de turno, enmascarando las etiquetas del prompt y del ticket, de modo que el modelo aprende el formato de salida JSON sin ser penalizado por el contenido de entrada.

El conjunto de datos son tickets ficticios generados por IA, revisados por un agente y aceptados por un usuario para un piloto: 128 ejemplos de entrenamiento, 34 de validación y 66 de test. Se completaron 3 épocas con tasa de aprendizaje 0,0002, microbatch 1 y acumulación de gradientes 8. La longitud máxima de secuencia fue 512 tokens, rechazando (no truncando) los ejemplos que la excedían. El checkpoint seleccionado (época 2, checkpoint-32) se congeló antes de la evaluación final, y los tickets de test no se usaron ni para actualizar gradientes ni para seleccionar el checkpoint. El entrenamiento se realizó en una Tesla T4 de Google Colab con parámetros en float32 y precisión mixta FP16.

## Capacidades

- Generación de texto condicionada a una plantilla de chat (`apply_chat_template`) con un `system_prompt.txt` incluido en el repositorio.
- Extracción de información estructurada: devuelve un JSON con exactamente cuatro campos (`category`, `environment`, `customer_reported_impact`, `suggested_team`).
- Clasificación en seis categorías: `authentication`, `billing`, `rate_limit`, `integration`, `bug`, `other`.
- Detección del entorno afectado: `production`, `staging`, `development` o `unknown`.
- Resumen factual del impacto reportado por el cliente, o `null` si no se declara.
- Derivación determinista del equipo de soporte a partir de la categoría (`billing_support`, `general_support`, `developer_support`).
- Tratamiento de los tickets como datos, no como instrucciones (mitigación básica de inyección de prompt).
- Etiquetado de `other` para peticiones mixtas sin un problema dominante.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking de forma documentada.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Triaje automático de tickets en mesas de ayuda: el adaptador clasifica el ticket entrante en una de las seis categorías y sugiere el equipo adecuado, reduciendo el trabajo manual de enrutamiento en un primer filtro.
- Enriquecimiento de registros en un CRM o sistema de ticketing: el JSON de salida se puede volcar directamente a columnas estructuradas (categoría, entorno, impacto) para analítica posterior.
- Priorización por entorno: al detectar si el ticket afecta a `production`, `staging` o `development`, permite aplicar reglas de escalado distintas según la criticidad.
- Generación de resúmenes de impacto para informes: el campo `customer_reported_impact` ofrece una frase factual reutilizable en paneles de seguimiento o resúmenes diarios para el equipo de soporte.
- Prototipado rápido y demos de portafolio: al ser un adaptador ligero sobre un modelo de 0,6B, se puede desplegar en una GPU de consumo o incluso en CPU para demostraciones y validación de concepto.
- Filtrado previo en pipelines de clasificación: como primera etapa barata antes de un modelo mayor o de un clasificador supervisado, descartando o etiquetando tickets triviales.
- Investigación sobre extracción de información con modelos pequeños: sirve como referencia reproducible de cómo un ajuste LoRA mínimo mejora el cumplimiento de esquema en un modelo de menos de mil millones de parámetros.
- Evaluación de robustez ante formato: útil para estudiar la tasa de respuestas válidas frente a inválidas en tareas de salida estructurada.

## Benchmarks y rendimiento

Evaluación final sobre 66 tickets ficticios de test (11 por categoría), con el mismo prompt, revisión base, decodificación greedy y código de puntuación para ambos modelos. Las respuestas con esquema inválido cuentan como incorrectas en todas las métricas.

| Métrica | Modelo base | Adaptador ajustado | Cambio |
|---|---:|---:|---:|
| Respuestas estructuradas válidas según esquema | 53,0 % | 98,5 % | +45,5 puntos porcentuales |
| Macro-F1 de categoría | 0,471 | 0,881 | +0,411 F1 |
| Precisión de entorno | 34,8 % | 90,9 % | +56,1 puntos porcentuales |
| Precisión de equipo | 18,2 % | 90,9 % | +72,7 puntos porcentuales |

Etiquetas de categoría correctas: de 25/66 a 58/66. Respuestas que no cumplen el esquema: de 31/66 a 1/66. El equipo se deriva de forma determinista a partir de la categoría, por lo que no mide una capacidad de razonamiento independiente. La factualidad y completitud del resumen de impacto no se miden automáticamente con estas puntuaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 0,6B más un adaptador de 4,6M de parámetros, cabe holgadamente en GPUs de consumo (el entrenamiento se hizo en una Tesla T4 de 16 GB).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una T4, RTX 3060/4060 o superiores son suficientes. El autor no publica cifras de latencia ni throughput.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base; el adaptador añade una sobrecarga mínima.
- Opciones de despliegue: la model card documenta `transformers` (4.57.1), `peft` (0.17.1) y `accelerate` (1.10.1), con carga del adaptador mediante `PeftModel.from_pretrained`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Inferencia en CPU: posible según el código de ejemplo, pero no se ha medido su rendimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el adaptador se apoya en Qwen3-0.6B, pero no se han publicado comparaciones con otros adaptadores de triaje de tickets ni con clasificadores supervisados equivalentes.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShwethaJ/qwen3-0.6b-support-ticket-triage-lora | Adaptador de 4.587.520 parámetros sobre Qwen3-0.6B | No disponible | Triaje de tickets a JSON | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El conjunto de evaluación son 66 tickets ficticios generados por IA; el propio autor advierte que este piloto no demuestra generalización al tráfico real de clientes.
- El adaptador no resuelve incidencias ni ejecuta cambios: solo produce una predicción estructurada que debe revisarse antes de acciones de negocio.
- La precisión de equipo (90,9 %) se deriva de forma determinista de la categoría, por lo que no debe interpretarse como una capacidad de razonamiento independiente.
- La factualidad y completitud del resumen de impacto no se miden automáticamente; pueden aparecer resúmenes incompletos o imprecisos.
- Riesgo de alucinación en el campo de impacto y en la detección de entorno cuando el ticket no lo especifica; el modelo puede rellenar `unknown` de forma incorrecta.
- El modelo solo está entrenado y evaluado en inglés; no hay evidencia de comportamiento en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte, y el modelo base Qwen3-0.6B tiene sus propios términos que deben respetarse.
- Dependencia de versiones concretas de librerías (`transformers` 4.57.1, `peft` 0.17.1, `accelerate` 1.10.1) y de una revisión exacta del modelo base (`c1899de289a04d12100db370d81485cdf75e47ca`); cambios en estas pueden alterar el comportamiento.
- Secuencias limitadas a 512 tokens en entrenamiento y rechazo de ejemplos más largos: tickets extensos pueden quedar fuera del dominio de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No se documentan mecanismos de seguridad adicionales frente a inyección de prompt más allá del tratamiento de tickets como datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShwethaJ/qwen3-0.6b-support-ticket-triage-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Comparación legible por máquina: `./evaluation_comparison.json` (referenciada en la model card)
- Métricas del modelo base: `./base_test_metrics.json` (referenciada en la model card)
- Métricas del adaptador ajustado: `./adapted_test_metrics.json` (referenciada en la model card)
- Panel de evaluación: `./final_test_dashboard.png` (referenciado en la model card)
- Prompt de sistema: `system_prompt.txt` (incluido en el repositorio)
