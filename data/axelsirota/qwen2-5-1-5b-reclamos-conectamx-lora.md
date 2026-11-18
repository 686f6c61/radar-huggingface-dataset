# axelsirota/qwen2.5-1.5b-reclamos-conectamx-lora

## Resumen

El modelo `axelsirota/qwen2.5-1.5b-reclamos-conectamx-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario axelsirota. Su propósito es muy concreto: convertir un reclamo de cliente de una telefónica ficticia llamada ConectaMX en un objeto JSON estructurado con tres campos (`categoria`, `urgencia` y `producto`). Se trata, por tanto, de un artefacto didáctico y de nicho, no de un modelo generalista.

El adaptador se entrenó en una única GPU T4 como material para el taller de Nerdearla México impartido por Axel Sirota (Data Trainers LLC), y los datos empleados son sintéticos. Esto lo convierte en un ejemplo reproducible de fine-tuning eficiente en parámetros para una tarea de clasificación estructurada, más que en un modelo listo para producción a gran escala.

Su relevancia actual radica en que ilustra un patrón muy habitual en la industria: adaptar un modelo pequeño (1.500 millones de parámetros) mediante LoRA para forzar una salida JSON fiable con un vocabulario cerrado, reduciendo coste de inferencia y manteniendo la licencia permisiva Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 1.500 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Base entrenada en 4 bits NF4 (QLoRA); pesos del adaptador en safetensors (fp16/bf16 segun el repo) |
| Idiomas soportados | Espanol (`es`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1.500 millones de parámetros. El entrenamiento emplea QLoRA: el modelo base se carga cuantizado en 4 bits con formato NF4 y se entrenan adaptadores LoRA con rango r=16, alpha=32, dropout 0.05 y aplicados a todas las capas lineales. La pérdida se calcula únicamente sobre la respuesta, usando el formato prompt/completion de la librería TRL, lo que evita que el modelo aprenda a reproducir el system prompt.

El conjunto de datos consta de 500 reclamos sintéticos, con 189 pasos de entrenamiento, tamaño de lote 8, tasa de aprendizaje 2e-4 y precisión fp16, todo ello en una GPU T4. No se menciona en la información disponible el uso de RLHF, DPO ni fases de alineamiento adicionales; la innovación técnica principal es, por tanto, la aplicación de fine-tuning eficiente en parámetros para fijar un formato de salida estricto con un vocabulario cerrado.

## Capacidades

- Clasificación estructurada de reclamos: genera un JSON con las claves `categoria`, `urgencia` y `producto`.
- Categorías soportadas: `facturacion`, `falla_servicio`, `velocidad`, `cancelacion`, `atencion` y `equipo`.
- Niveles de urgencia: `alta`, `media` y `baja`.
- Productos: `fibra`, `movil`, `tv` y `paquete`.
- Salida en formato JSON válido (100 % de JSON válido en la evaluación del autor, igual que el modelo base).
- Capacidad de seguir un system prompt específico de entrenamiento.
- No se documentan capacidades de tool calling, agentes, visión, audio, matemáticas avanzadas ni razonamiento multi-paso.

## Casos de uso

- Triaje automático de tickets de soporte: el adaptador recibe el texto del reclamo y devuelve una categoría y un nivel de urgencia que pueden alimentar un sistema de enrutamiento hacia el equipo adecuado, gracias a la mejora del 40 % al 98 % en precisión de categoría reportada por el autor.
- Etiquetado de correos o formularios de atención al cliente: se puede integrar en un pipeline de ingesta que normalice reclamos en texto libre a un esquema JSON consumible por un CRM.
- Enrutamiento por producto: el campo `producto` permite dirigir el ticket al equipo de fibra, móvil, TV o paquete, con una precisión del 96 % según la evaluación del autor.
- Prototipado rápido de clasificadores en talleres o entornos docentes: al ser un adaptador LoRA de pequeño tamaño (repo de 0,1 GB) y licencia Apache 2.0, sirve como plantilla reproducible de QLoRA en una T4.
- Preprocesado para sistemas RAG o analítica: el JSON generado puede usarse como metadato estructurado antes de aplicar recuperación aumentada sobre una base de conocimiento de atención al cliente.
- Filtrado y priorización de colas de soporte: la urgencia clasificada (aunque con precisión limitada, 54 %) puede usarse como señal auxiliar combinada con reglas de negocio para ordenar la cola de atención.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 100 reclamos de prueba sintéticos:

| Metrica | Modelo base | Con este adapter |
|---|---|---|
| JSON valido % | 100 | 100 |
| Categoria % | 40 | 98 |
| Urgencia % | 39 | 54 |
| Producto % | 75 | 96 |
| Exacto % | 12 | 51 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo de 1.500 millones de parámetros, la inferencia en fp16 requiere del orden de 3-4 GB de VRAM para los pesos del modelo base, más overhead de activaciones y del adaptador; en 4 bits (NF4) se reduce aproximadamente a 1-2 GB.
- GPU recomendadas: el autor entrenó en una T4, por lo que una T4 (16 GB) es suficiente tanto para entrenamiento QLoRA como para inferencia. Cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, etc.) debería poder ejecutar la inferencia cuantizada.
- Cabe en GPU consumer: sí, en la mayoría de GPU consumer modernas con al menos 6 GB de VRAM.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), vLLM y TGI para servir el modelo fusionado, llama.cpp/Ollama si se convierte a GGUF. No se documentan opciones específicas en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-reclamos-conectamx-lora | 1.500 M (base) + adaptador LoRA | No disponible | Clasificacion JSON de reclamos (es) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | No disponible en la informacion proporcionada | Modelo generalista instruct | Apache 2.0 | Hugging Face |
| Alternativas de clasificacion con LoRA sobre modelos pequenos | Variable | Variable | Clasificacion de texto | Variable | No disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para una tarea y un dominio (reclamos de la telefónica ficticia ConectaMX); fuera de ese contexto su comportamiento no está validado.
- Los datos de entrenamiento son sintéticos, lo que puede provocar un rendimiento inferior ante la distribución real de reclamos en producción.
- La precisión en la clasificación de urgencia es baja (54 %), por lo que no es fiable como única señal para priorización.
- El autor advierte explícitamente de que el fine-tuning enseña formato y comportamiento, no datos nuevos; para hechos debe usarse RAG.
- El modelo está orientado únicamente al español; no se documenta soporte multilingüe.
- Riesgo de alucinación inherente al modelo base, aunque acotado por el formato JSON y el vocabulario cerrado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a entradas adversarias o fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axelsirota/qwen2.5-1.5b-reclamos-conectamx-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Evento Nerdearla: https://nerdearla.com
