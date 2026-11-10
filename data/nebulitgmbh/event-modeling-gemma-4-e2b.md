# nebulitgmbh/event-modeling-gemma-4-e2b

## Resumen

Event Modeling assistant (Gemma 4 E2B, fine-tuned) es un ajuste fino por LoRA fusionado a bf16 sobre `google/gemma-4-E2B-it`, desarrollado por nebulitgmbh. El modelo está especializado en la metodología de Event Modeling y Event Sourcing: genera JSON de modelos de dominio (comandos, eventos, read models, pantallas, automatizaciones y escenarios Given/When/Then) y explica el propio método. Su pipeline declarado es `image-text-to-text`, por lo que hereda la entrada multimodal del modelo base.

El modelo cuenta con 5.104.297.539 parámetros reales según los pesos en safetensors y un repositorio de 10,6 GB. Es un ajuste experimental y borrador privado, según indica el propio autor, con una pérdida en validación (held-out loss) de 0,715 y un 88 % de prompts JSON normales que producen modelos válidos según el esquema, con fallos puntuales en campos obligatorios ausentes.

Su relevancia es acotada: no es un modelo generalista, sino una herramienta vertical para equipos que aplican Event Modeling y necesitan generar artefactos estructurados de forma asistida. La recomendación del autor es usar decodificación JSON restringida para la salida del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Gemma 4 E2B; ajuste LoRA fusionado a bf16 |
| Parámetros totales | 5.104.297.539 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors bf16; el autor menciona un build WebLLM/MLC en progreso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); carpeta `adapter/` con el adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 con capacidad de entrada de imagen y texto. Sobre esa base se aplicó un ajuste fino mediante LoRA, posteriormente fusionado a bf16 para su distribución como pesos completos. El repositorio conserva además el adaptador LoRA original en la carpeta `adapter/`, lo que permite reutilizarlo sobre el modelo base.

Los datos de entrenamiento no están detallados en la información disponible: no se especifica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. El autor indica que el ajuste se realizó sobre material de Event Modeling, cubriendo generación de JSON de modelos (comandos, eventos, read models, pantallas, automatizaciones y escenarios Given/When/Then) y explicaciones del método. El resultado de validación reportado es una pérdida de 0,715 y una tasa de validez de esquema del 88 % en prompts JSON normales. Como innovación operativa, el autor recomienda decodificación JSON restringida para forzar la conformidad con el esquema.

## Capacidades

- Generación de JSON estructurado para modelos de Event Modeling: comandos, eventos, read models, pantallas y automatizaciones.
- Generación de escenarios Given/When/Then a partir de la descripción del dominio.
- Explicación del método de Event Modeling y de conceptos de Event Sourcing.
- Entrada multimodal imagen-texto heredada del modelo base Gemma 4 E2B-it.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue gestionado.
- Soporte de decodificación JSON restringida recomendado por el autor para garantizar validez de esquema.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Generación asistida de modelos de dominio: a partir de una descripción textual de un proceso de negocio, el modelo produce el JSON con comandos, eventos y read models, que luego se valida contra un esquema con decodificación restringida.
- Documentación de escenarios de aceptación: el modelo convierte historias de usuario en escenarios Given/When/Then listos para incorporar a la suite de tests.
- Diseño de pantallas y automatizaciones: dado un flujo de eventos, propone las pantallas de lectura y las automatizaciones reactivas correspondientes, acelerando la fase de diseño en talleres de Event Modeling.
- Formación de equipos: el modelo explica el método y sus artefactos, sirviendo como asistente de onboarding para desarrolladores nuevos en Event Sourcing.
- Revisión de consistencia de modelos existentes: se le puede pedir que contraste un modelo JSON con las reglas del método y señale comandos sin eventos asociados o read models huérfanos, usando validación de esquema para descartar salidas inválidas.
- Prototipado rápido de APIs de escritura: los comandos generados pueden transformarse en borradores de endpoints y contratos de eventos para un pipeline de CI/CD, siempre con revisión humana dado el estado experimental del modelo.
- Extracción de información desde diagramas: gracias a la entrada image-text-to-text, puede recibir una captura de un diagrama de Event Modeling y generar la representación JSON equivalente (capacidad heredada del modelo base, no validada específicamente en el ajuste según la información disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación reportado por el autor es la pérdida en validación (held-out loss) de 0,715 y una tasa del 88 % de modelos JSON válidos según esquema en prompts JSON normales.

| Métrica | Valor |
|---|---|
| Held-out loss | 0,715 |
| Prompts JSON con modelo válido según esquema | 88 % |
| Fallos observados | Campos obligatorios ausentes en algunos casos |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 10,2 GB solo para pesos (5,1 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: alrededor de 5,1 GB de pesos; en 4 bits: alrededor de 2,6 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100 o H100 para despliegue en producción con bf16 y concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso individual en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bf16 (RTX 4080, RTX 4090, RTX 3090); en 8 bits podría caber en 8-12 GB, aunque no hay datos publicados de cuantización para este ajuste.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según el tag del repositorio; el autor menciona un build WebLLM/MLC en progreso. vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebulitgmbh/event-modeling-gemma-4-e2b | 5,10 B | no disponible | Event Modeling / Event Sourcing (LoRA fusionado) | no disponible | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it (modelo base) | no disponible en la información | no disponible | Propósito general multimodal | no disponible en la información | Hugging Face |
| Alternativas especializadas en generación de JSON de dominio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros ajustes finos comparables en la misma categoría (asistentes de Event Modeling) en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental y borrador privado según el propio autor: no apto para producción sin validación adicional.
- Tasa de validez de esquema del 88 %: aproximadamente uno de cada ocho prompts JSON produce salidas con campos obligatorios ausentes. Es imprescindible usar decodificación JSON restringida y validación posterior.
- Sesgos conocidos: no disponible en la información proporcionada; al heredar el modelo base Gemma, pueden persistir sesgos de dicho modelo.
- Riesgo de alucinación: presente, especialmente en explicaciones del método y en la generación de campos no cubiertos por el esquema.
- Limitaciones de contexto e idioma: no disponibles; el ajuste se documenta en inglés y no se especifica cobertura multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial. Debe verificarse la licencia del modelo base Gemma 4 y la del ajuste antes de cualquier despliegue comercial.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación mínimo por parte de la comunidad.
- El pipeline declarado es image-text-to-text, pero no hay evidencia de que las capacidades de visión hayan sido evaluadas tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebulitgmbh/event-modeling-gemma-4-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Adaptador LoRA: carpeta `adapter/` dentro del repositorio del modelo
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada
