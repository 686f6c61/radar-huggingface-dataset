# ravikadam/triage-gemma-4-E2B-it-litert-lm

## Resumen

Triage Gemma 4 E2B (LiteRT-LM) es un ajuste fino del modelo google/gemma-4-E2B-it, desarrollado por el usuario ravikadam y publicado en Hugging Face. El modelo está especializado en una tarea muy concreta: clasificar mensajes entrantes de teléfono en cuatro categorías (tarea, promesa, evento o ignorar), con el objetivo explícito de evitar que newsletters, alertas bancarias y conversaciones de grupo se conviertan en tareas falsas. Según la model card, el ajuste se realizó con GRPO (Group Relative Policy Optimization) sobre un conjunto de datos exclusivamente sintético.

La relevancia del modelo reside en su enfoque de despliegue en dispositivo (on-device) mediante LiteRT-LM, el runtime de Google para ejecutar modelos en local. El autor reporta una mejora de precisión del 70% al 87% sobre 30 mensajes sintéticos de prueba, y del 65% al 84% sobre 43 correos reales del buzón del propietario, reduciendo además los falsos positivos de ruido convertido en tarea de 11 a 4 sobre 35 casos. El repositorio ocupa 14,0 GB e incluye un checkpoint fusionado de 16 bits en `hf-weights/` para entrenamiento posterior.

No se dispone de información pública sobre la arquitectura interna, el número de parámetros ni la longitud de contexto del modelo base, más allá de su pertenencia a la familia Gemma 4 con la variante E2B. El modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-E2B-it, familia Gemma 4) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo principal int8; tablas de embedding int4; checkpoint fusionado de 16 bits en `hf-weights/` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio); artefacto LiteRT-LM para despliegue on-device |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un modelo de la familia Gemma 4 en su variante E2B. No se ha publicado en la información disponible la arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, número de capas o parámetros). El ajuste se realizó mediante GRPO, una técnica de optimización por refuerzo con preferencias relativas de grupo, aplicada a la tarea de clasificación de mensajes en las categorías tarea, promesa, evento e ignorar.

El conjunto de entrenamiento fue exclusivamente sintético, según declara el autor. Una innovación técnica destacable es la decisión de cuantización mixta: el modelo principal se cuantiza a int8 mientras que las tablas de embedding se mantienen en int4, porque, según el autor, la cuantización int4 en todos los componentes rompía la salida en formato JSON. El repositorio incluye además un checkpoint fusionado de 16 bits en `hf-weights/` destinado a futuros entrenamientos.

## Capacidades

- Clasificación de mensajes de teléfono en cuatro categorías: tarea, promesa, evento e ignorar.
- Filtrado de ruido: identificación de newsletters, alertas bancarias y conversaciones de grupo para evitar que se conviertan en tareas.
- Generación de salida estructurada en JSON, requisito que condicionó la estrategia de cuantización.
- Ejecución on-device mediante el runtime LiteRT-LM.
- Ajuste orientado a preferencias mediante GRPO.
- Capacidades generales heredadas del modelo base google/gemma-4-E2B-it: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Gestión de bandeja de entrada en el móvil: el modelo clasifica cada mensaje entrante como tarea, promesa, evento o ruido, permitiendo que la aplicación de correo o mensajería genere listas de acción limpias sin intervención del usuario.
- Filtrado de newsletters y alertas automáticas: al identificar específicamente el ruido (el autor reporta una reducción de 11 a 4 falsos positivos sobre 35 casos de ruido en su prueba real), evita que notificaciones bancarias o boletines se conviertan en tareas pendientes.
- Asistentes personales on-device: al ejecutarse con LiteRT-LM en el propio dispositivo, permite procesar mensajes privados sin enviarlos a la nube, lo que resulta adecuado para datos sensibles del buzón.
- Extracción de compromisos y eventos: la categoría "promesa" permite detectar compromisos adquiridos en conversaciones (por ejemplo, "te envío el informe mañana") y la categoría "evento" citas o reuniones, alimentando un calendario o lista de recordatorios.
- Automatización de triaje en aplicaciones de mensajería: integrado en un cliente de correo o de chat, puede priorizar la bandeja y sugerir acciones al usuario en tiempo real.
- Prototipado de pipelines de clasificación con datos sintéticos: al haberse entrenado solo con mensajes sintéticos, sirve como base para experimentar con ajuste por refuerzo (GRPO) en tareas de clasificación antes de pasar a datos reales.
- Reentrenamiento y ajuste posterior: el checkpoint fusionado de 16 bits en `hf-weights/` permite continuar el entrenamiento con datos propios del dominio.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor:

| Prueba | Modelo base (archivo de teléfono) | Este modelo |
|---|---|---|
| 30 mensajes sintéticos | 70% | 87% |
| 43 correos reales (solo asunto, mantenidos offline) | 65%; 11 de 35 casos de ruido convertidos en tarea | 84%; 4 de 35 casos de ruido convertidos en tarea |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son medidas internas del autor sobre conjuntos de prueba propios y no comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 14,0 GB, lo que incluye el checkpoint fusionado de 16 bits y los artefactos de despliegue; el tamaño del modelo principal int8 con embeddings int4 no se detalla.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible; el modelo está orientado a ejecución on-device mediante LiteRT-LM, no a GPU de servidor.
- Opciones de despliegue: LiteRT-LM (runtime declarado en la librería del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo base google/gemma-4-E2B-it podría servir como referencia directa, pero no se han publicado sus especificaciones (parámetros, contexto) en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Triage Gemma 4 E2B (LiteRT-LM) | no disponible | no disponible | 87% en 30 mensajes sintéticos; 84% en 43 correos reales | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | 70% en 30 mensajes sintéticos; 65% en 43 correos reales | no disponible | Hugging Face |
| Alternativas de clasificación on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con mensajes sintéticos: el rendimiento en dominios reales distintos del probado por el autor (43 correos de su propio buzón) no está validado.
- El conjunto de evaluación real es muy reducido (43 correos, solo asunto, mantenidos offline), por lo que las cifras de mejora tienen alta incertidumbre estadística.
- La cuantización int4 en todos los componentes rompía la salida JSON según el autor; cualquier cambio en la estrategia de cuantización debe validarse contra el formato de salida esperado.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado en la información proporcionada; la tarea es de clasificación, pero el modelo podría generar etiquetas o JSON malformados en entradas fuera de distribución.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base google/gemma-4-E2B-it puede tener sus propias condiciones que conviene verificar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ravikadam/triage-gemma-4-E2B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- LiteRT-LM (runtime de Google para ejecución on-device): no disponible en la información proporcionada
- Paper o blog del ajuste: no disponible
- Repositorio de código o demo: no disponible
