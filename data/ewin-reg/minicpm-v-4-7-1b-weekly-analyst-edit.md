# ewin-reg/MiniCPM-V-4.7-1B-weekly-analyst-edit

## Resumen

MiniCPM-V-4.7-1B-weekly-analyst-edit es una adaptación del modelo multimodal openbmb/MiniCPM-V-4.7-1B (1.554 millones de parámetros) publicada por el usuario ewin-reg. No se trata de un modelo nuevo entrenado desde cero, sino de una edición de pesos y un LoRA de rango 8 fusionado sobre las capas `down_proj` de un agente concreto denominado Weekly Analyst, cuyo objetivo es vigilar un CSV semanal y redactar un informe PDF solo cuando se detecta un cambio material en los datos.

El modelo resuelve un problema muy acotado: convertir un modelo de 1B en un agente capaz de generar planes de herramientas (tool plans) y borradores de informe (drafts) de forma fiable y sin gramática JSON forzada. Según la model card, el LoRA `lora3` eleva la precisión en planes de 65/80 a 80/80 y en borradores de 0/80 a 80/80 sobre tareas sintéticas retenidas, incluyendo variantes de enunciado no vistas durante el entrenamiento.

Su relevancia es doble: por un lado demuestra que una edición de pesos muy pequeña (16.384 valores) o un LoRA de rango 8 pueden transformar el comportamiento de un modelo de 1B en una tarea específica; por otro, documenta con transparencia los límites de esa mejora (un único generador sintético, sin comprobación de regresión de capacidades generales). La licencia es Apache 2.0 y el pipeline es image-text-to-text, heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base MiniCPM-V 4.7; adaptación mediante LoRA rango 8 fusionado en `down_proj` y edición de pesos en capas MLP |
| Parametros totales | 1.554.476.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (GGUF oficial y GGUF con LoRA fusionado); safetensors en el repo; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, patch.npz, lora3_dw_fp16.pt |

## Arquitectura y entrenamiento

El modelo base es MiniCPM-V 4.7 en su variante de 1B, un transformer multimodal orientado a inferencia en dispositivo (on-device). Sobre él se aplican dos intervenciones distintas. La primera, ya superada, es una edición de pesos sin entrenamiento por gradiente que modifica 16.384 valores en las proyecciones `down_proj` de las capas 15 y 19 del modelo de lenguaje (8 columnas por capa, 1.024 valores cada una), siguiendo el método SWEET (arXiv 2611.10974). La dirección de edición se calcula como la media escalada por varianza de 48 pares de activaciones residuales (salida fallida menos salida correcta construida por código) sobre semillas de calibración 0 a 19, y las columnas se seleccionan por atribución positiva.

La segunda intervención, la vigente, es un LoRA de rango 8 (`lora3`) entrenado durante 4 épocas con muchas más formulaciones de instrucción, fusionado en todas las `down_proj` mediante un delta en fp16 (`lora3_dw_fp16.pt`, 24 capas, escala 1). El resto de tensores permanece idéntico al GGUF F16 oficial. No se documentan el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; el entrenamiento se realizó sobre tareas sintéticas generadas por un único generador.

## Capacidades

- Generación de planes de herramientas (tool plans) para el agente Weekly Analyst, con 80/80 aciertos en las semillas 400-439 sin gramática JSON.
- Generación de borradores de informe (drafts) con 80/80 aciertos en las mismas semillas, frente a 0/80 del modelo base.
- Generalización a variantes de enunciado no vistas: `reword_b` (sin nombres de campos JSON) y `reword_c`, ambas con 40/40.
- Manejo de datos renombrados, líneas de reparación y casos de un solo elemento (40/40 en cada variante).
- Capacidades multimodales heredadas del modelo base (pipeline image-text-to-text), aunque no se evalúan en esta ficha.
- Soporte de tool calling y razonamiento multi-paso en el contexto del agente, limitado al dominio de análisis semanal de CSV.
- No se documentan capacidades multilingües, modo thinking, audio ni otras funciones especiales.

## Casos de uso

- Monitorización semanal de métricas de negocio: el agente recibe un CSV semanal y el modelo decide si hay un cambio material, generando el plan de herramientas adecuado antes de redactar el informe.
- Generación automática de informes para stakeholders: el modelo produce el borrador del PDF solo cuando se detecta una variación relevante, evitando informes innecesarios.
- Automatización de pipelines de análisis de datos en producción: integrado en el repositorio Weekly Analyst, el modelo actúa como planificador y redactor dentro de un flujo con verificación numérica propia.
- Procesamiento de hojas de ventas reales: probado sobre UCI Online Retail (unas 540.000 filas de factura) y UCI Online Retail II (525.461 líneas), con informes completos en 3 de 3 y 4 de 4 semanas tras corregir errores del código del agente.
- Despliegue en dispositivo: al tratarse de un modelo de 1B con GGUF F16, es apto para entornos con recursos limitados donde no cabe un modelo mayor.
- Prototipado de agentes con tool calling restringido: sirve como referencia para estudiar cómo un LoRA de rango 8 puede especializar un modelo pequeño en un flujo de planificación concreto.
- Investigación sobre edición de pesos: la edición de 16.384 valores y el LoRA documentado permiten reproducir experimentos de weight-space programming sobre modelos multimodales pequeños.

## Benchmarks y rendimiento

Datos de la model card (evaluación única, 2026-11-12, greedy, sin gramática JSON, 80 tareas de plan y borrador, 40 por variante; cotas inferiores de Wilson del 95 %: ~0,95 para 80/80 y ~0,91 para 40/40):

| Modelo | Plans | Drafts | Renamed data | Repair line | One item | Reword | Reword b (sin nombres de campo) | Reword c |
|---|---|---|---|---|---|---|---|---|
| Base (semillas 400-439) | 65/80 | 0/80 | 0/40 | 0/40 | 0/40 | 0/40 | 0/40 | 0/40 |
| Primer LoRA (2 épocas; semillas 300-339) | 80/80 | 80/80 | 40/40 | 40/40 | 40/40 | 0/40 | no evaluado | no evaluado |
| `lora3` (4 épocas; semillas 400-439) | 80/80 | 80/80 | 40/40 | 40/40 | 40/40 | 40/40 | 40/40 | 40/40 |

Comprobación adicional con llama-cpp-python 0.3.36 sobre semillas no usadas: planes 24/24, borradores 24/24 y 8/8 en `reword_b` (el archivo oficial da 0/8 en borradores). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.554 millones de parámetros, el GGUF F16 ronda los 3 GB de pesos, por lo que la VRAM necesaria es moderada.
- GPU recomendadas: no se especifican; la model card menciona una T4 para las pruebas con datos reales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6-8 GB o más, aunque no se documenta oficialmente.
- Opciones de despliegue: llama-cpp-python (versión 0.3.36 verificada), GGUF compatible con llama.cpp; el Space oficial ejecuta el archivo `MiniCPM-V-4_7-1B-weekly-analyst-lora3-F16.gguf`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-weekly-analyst-edit (`lora3`) | 1,55B | no disponible | 80/80 planes, 80/80 borradores | Apache 2.0 | Hugging Face, 540 descargas |
| openbmb/MiniCPM-V-4.7-1B (base) | 1,55B | no disponible | 65/80 planes, 0/80 borradores | Apache 2.0 | Hugging Face |
| Primer LoRA de este repo (2 épocas) | 1,55B | no disponible | 80/80 planes, 80/80 borradores, 0/40 en `reword` | Apache 2.0 | Hugging Face (superado) |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Todas las tareas de evaluación provienen de un único generador sintético, por lo que las puntuaciones dicen poco sobre otros datos.
- No se ha ejecutado ninguna comprobación de regresión de capacidades generales sobre el LoRA.
- El texto de los borradores es formulaico.
- Las pruebas con datos reales son dos conjuntos, una ejecución por semana, y no constituyen una puntuación de calidad.
- El modelo está especializado en el plan y el borrador del agente Weekly Analyst; no es una mejora de propósito general.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones de idioma.
- La licencia Apache 2.0 permite uso comercial, pero el autor no garantiza el comportamiento fuera del dominio evaluado.
- Riesgo de alucinación: no evaluado; el agente mitiga parcialmente con una verificación numérica propia que llegó a bloquear informes por errores en el código del agente, no del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ewin-reg/MiniCPM-V-4.7-1B-weekly-analyst-edit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio del agente Weekly Analyst: https://github.com/GPA-N/weekly-analyst
- Demo en Spaces: https://huggingface.co/spaces/ewin-reg/weekly-analyst
- Paper del método SWEET: arXiv 2611.10974
