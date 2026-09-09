# jasirjru/DomainTune-Qwen2.5-1.5B-Triage

## Resumen

DomainTune es un modelo de lenguaje ajustado (fine-tuned) a partir de Qwen/Qwen2.5-1.5B mediante QLoRA, desarrollado por jasirjru. Su propósito es automatizar el triaje de tickets de soporte y repos de incidencias, extrayendo datos estructurados en JSON. Resuelve el problema de clasificar tickets de forma determinista, asignando prioridad, categoría, componente afectado, sentimiento y si se requiere resolución. Es relevante porque permite reducir el coste del triaje manual en entornos empresariales, integrando la salida directamente en sistemas de ticketing.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-1.5B, con 1.543.714.304 parámetros. No se especifica la longitud de contexto ni los idiomas soportados en la información disponible del fine-tune, aunque al estar basado en Qwen2.5 hereda sus capacidades generales. La licencia es Apache 2.0 y los pesos se publican en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen2.5-1.5B) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DomainTune es un fine-tune de Qwen/Qwen2.5-1.5B realizado con QLoRA, una técnica de ajuste eficiente que cuantiza el modelo base y entrena adaptadores de bajo rango. El modelo base es un transformer decoder-only con mecanismo de atención estándar. La información proporcionada no detalla el dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. Lo que sí se documenta es que el fine-tune está optimizado específicamente para recibir tickets de soporte sin estructurar, como descripciones de bugs o issues de GitHub, y devolver salidas JSON estrictas y deterministas.

La innovación técnica reside en el uso de QLoRA para especializar un modelo de 1.5B en una tarea de extracción estructurada de campos: `priority`, `category`, `affected_component`, `sentiment` y `resolution_required`. El prompt de inferencia utiliza el formato de chat de Qwen (`<|im_start|>`, `<|im_end|>`) y se fuerza la generación sin muestreo (`do_sample=False`) para obtener respuestas más estables.

## Capacidades

- Generación de texto limitada a extracción estructurada: produce JSON con los campos `priority` (P1-P4), `category` (bug, feature_request, documentation, performance, security, infra), `affected_component`, `sentiment` (neutral, frustrated, urgent, satisfied) y `resolution_required` (true/false).
- Acepta textos desestructurados, como tickets de soporte o issues de GitHub, y los normaliza en un formato JSON consistente.
- No se documentan capacidades de tool calling, function calling ni soporte de agentes en la información disponible.
- No se especifica soporte multilingüe, aunque al basarse en Qwen2.5 podría manejar varios idiomas; no hay confirmación en el modelo card.
- No se menciona modo de razonamiento explícito ni capacidades de visión o audio.

## Casos de uso

- Triage automatizado en helpdesk: el modelo procesa tickets entrantes y asigna prioridad y categoría, lo que permite enrutar automáticamente cada caso al equipo adecuado sin intervención humana.
- Priorización de incidentes en DevOps: clasifica issues de GitHub como P1 (crítico) o P2 (alta severidad) para que los equipos de guardia puedan responder según SLA.
- Clasificación de solicitudes de funcionalidades: distingue entre feature_request, documentation o bug, facilitando la organización del backlog de producto.
- Detección de sentimiento en feedback de usuarios: extrae el campo `sentiment` para identificar tickets urgentes o frustrados y escalarlos a un supervisor.
- Integración en pipelines de automatización: el modelo devuelve JSON que puede insertarse directamente en sistemas de ticketing como Jira o Zendesk mediante APIs, eliminando la captura manual de datos.
- Análisis de logs de aplicación: a partir de descripciones de errores, identifica el componente afectado (por ejemplo, `auth_service`, `payment_gateway`) y recomienda si se requiere una resolución inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo en FP16 se necesitan aproximadamente 3 GB de VRAM; con cuantización 4-bit (por ejemplo, a través de bitsandbytes) la necesidad baja a cerca de 1 GB. Son cifras orientativas para un modelo de 1.5B.
- GPU recomendadas: cualquier GPU con más de 4 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A10G o T4. También puede ejecutarse en CPU si se convierte a GGUF y se usa una cuantización agresiva.
- Despliegue: compatible con Transformers, vLLM, llama.cpp (después de convertir a GGUF) y Ollama. También puede servirse con TGI si se empaqueta como modelo estándar.
- Latencia y throughput: no disponibles. Dependerán del hardware y la cuantización utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| DomainTune-Qwen2.5-1.5B-Triage | 1.543.714.304 | no disponible | Apache 2.0 | Triage de tickets JSON |
| Qwen/Qwen2.5-1.5B | 1.543.714.304 | no disponible en la info proporcionada | Apache 2.0 | Modelo base generalista |
| Qwen/Qwen2.5-1.5B-Instruct | 1.543.714.304 | no disponible en la info proporcionada | Apache 2.0 | Instrucciones generalistas |

No se conocen otros modelos de la misma categoría específica (triage de tickets con salida JSON) con los que comparar de forma fiable en cuanto a rendimiento.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de precisión, por lo que el rendimiento real en producción es desconocido y no puede validarse sin pruebas adicionales.
- Al ser un fine-tune de un modelo pequeño, existe riesgo de alucinación o de producir JSON mal formado si la entrada se aleja del dominio de tickets de soporte.
- No se especifican los idiomas soportados; es probable que el comportamiento óptimo se limite al inglés, lo que restringe su uso en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de mantenimiento, soporte ni seguridad para entornos de producción.
- La información del modelo no documenta el dataset de entrenamiento, lo que impide evaluar posibles sesgos heredados del modelo base o del propio ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jasirjru/DomainTune-Qwen2.5-1.5B-Triage
- Modelo base Qwen/Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Versión instruct del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
