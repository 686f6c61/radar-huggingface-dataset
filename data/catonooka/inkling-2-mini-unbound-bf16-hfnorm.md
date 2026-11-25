# catonooka/Inkling-2-Mini-Unbound-BF16-HFNORM

## Resumen

Inkling-2-Mini-Unbound-BF16-HFNORM es una copia en precision completa BF16 del modelo abliterado (sin rechazos, sin censura) Inkling-2-Mini-Unbound, publicado por el usuario catonooka en Hugging Face. Parte de thinkingmachines/Inkling-2-Mini, un modelo de 26.400 millones de parametros con arquitectura Inkling2Loop, y ha pasado por un finetune que elimina los mecanismos de rechazo. El repositorio no introduce nuevos pesos: solo normaliza los nombres de los tensores del formato del proveedor (`model.llm.*`) al formato que espera transformers (`model.language_model.*`), preservando exactamente los mismos valores.

La relevancia de este checkpoint es practica: el repositorio BF16 original del que deriva (electroglyph/Inkling-2-Mini-Unbound-BF16) ha sido eliminado, por lo que esta es la copia superviviente en precision completa. Ademas, se construyo especificamente como fuente para la cuantizacion por streaming en disco de Intel AutoRound (W4A16G128), que lee el checkpoint bloque a bloque sin necesidad de cargar los aproximadamente 47 GB en RAM.

El modelo combina atencion hibrida con convoluciones cortas, 24 capas y 128 expertos MoE por capa, ademas de normas por proyeccion y controladores de compuerta de mensajes. Su tamano (26,4B) y su naturaleza multimodal (image-text-to-text) lo situan en la gama de modelos de vision-lenguaje de gran formato, aunque su licencia y sus idiomas soportados no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling2Loop: transformer hibrido con atencion y convoluciones cortas, MoE de 128 expertos por capa, 24 capas |
| Parametros totales | 26.386.412.544 (26,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint original); existe una variante AutoRound W4A16-G128 derivada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (1115 tensores, ~52,8 GB) |
| Vocabulario | lm_head de [200058, 2304] |
| Modalidades | texto e imagen (pipeline image-text-to-text) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Inkling2Loop, que combina capas de atencion con convoluciones cortas (short convolutions) en las proyecciones de clave y valor, normas L2 por proyeccion (q, k, v), sesgo de posicion relativa y mecanismos de compuerta de mensajes (`message_gate`) sobre las proyecciones de atencion y MLP. La capa MLP es de tipo mezcla de expertos (MoE) con 128 expertos por capa y pesos fusionados en pilas 3D (`gate_up_proj` y `down_proj`). Incluye ademas un modulo de vision (`vision_tower`) con su propio merger, lo que confirma su naturaleza multimodal.

El entrenamiento original corresponde a thinkingmachines/Inkling-2-Mini; sobre el se aplico un finetune abliterado (eliminacion de rechazos) que dio lugar a Inkling-2-Mini-Unbound. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La innovacion tecnica destacable de este repositorio concreto es la normalizacion de nombres de tensores mediante un unico round-trip de transformers (`save_original_format=False`), sin renombrados manuales, lo que evita riesgos de interleave, unpad o desajuste de indices, y mantiene las pilas fusionadas de expertos solo renombradas, nunca rebanadas.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline conversational).
- Procesamiento de imagenes junto con texto (image-text-to-text), gracias al vision tower integrado.
- Razonamiento y generacion de codigo: capacidades esperables en un modelo de 26,4B, aunque no documentadas explicitamente.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles en la informacion.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion.
- Al ser un finetune abliterado, no aplica rechazos por contenido, lo que amplia el rango de respuestas generadas.

## Casos de uso

- Cuantizacion y despliegue eficiente: el repositorio sirve como fuente directa para AutoRound con `AR_DISK_STREAM_MODEL=1`, permitiendo generar variantes W4A16-G128 sin picos de RAM de ~47 GB. Es el uso principal para el que fue creado.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterado, permite estudiar el comportamiento de modelos sin mecanismos de rechazo y comparar con la version original alineada.
- Analisis de imagenes con descripcion textual: el pipeline image-text-to-text permite construir asistentes que respondan preguntas sobre imagenes (documentos, capturas, fotografias) en un unico flujo conversacional.
- Prototipado de asistentes conversacionales de gran formato: sus 26,4B parametros y su soporte conversacional lo hacen adecuado para entornos de investigacion donde se requiera un modelo grande con vision integrada.
- Experimentacion con arquitecturas hibridas: la combinacion de atencion, convoluciones cortas y MoE con 128 expertos por capa lo convierte en un banco de pruebas para estudiar eficiencia y comportamiento de arquitecturas no estandar.
- Pipeline de cuantizacion y evaluacion comparativa: al ser un checkpoint BF16 "limpio" con nombres HF, se puede usar como referencia de precision para medir la degradacion introducida por cuantizaciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 52,8 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica requiere GPU de 80 GB (A100 80GB, H100 80GB) o multi-GPU.
- VRAM estimada en W4A16-G128 (variante derivada): alrededor de 13-15 GB para pesos, lo que permite inferencia en una unica GPU de 24 GB (RTX 4090, L40S) con margen para contexto.
- GPU recomendadas: A100 80GB o H100 80GB para BF16; RTX 4090 / L40S / A6000 para la variante cuantizada W4A16.
- Cabe en GPU de consumo: solo la variante cuantizada W4A16-G128; el checkpoint BF16 completo no cabe en GPUs de 24 GB.
- Opciones de despliegue: transformers (formato nativo del repo), Intel AutoRound para cuantizacion, y previsiblemente vLLM o TGI para la variante cuantizada (no confirmado en la informacion). llama.cpp/Ollama no estan documentados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-Unbound-BF16-HFNORM | 26,4B | no disponible | no disponible | Abliterado, multimodal, checkpoint BF16 normalizado a HF |
| thinkingmachines/Inkling-2-Mini | 26,4B | no disponible | no disponible | Modelo base original, alineado |
| nokeepai/Inkling-2-Mini-Unbound | 26,4B | no disponible | no disponible | Finetune abliterado; mezcla BF16 con tensores F8/U8 |
| electroglyph/Inkling-2-Mini-Unbound-BF16 | 26,4B | no disponible | no disponible | Copia BF16 original, eliminada del hub |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido que el modelo base rechazaria; no es adecuado para despliegues orientados al publico sin filtros adicionales.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (thinkingmachines/Inkling-2-Mini) antes de cualquier uso en produccion.
- Idiomas soportados no documentados: el rendimiento fuera del ingles (o del idioma mayoritario de entrenamiento) es incierto.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinacion: inherente a los modelos de 26B sin datos de evaluacion publicados; no hay benchmarks que cuantifiquen su fiabilidad.
- Checkpoint pensado como fuente de cuantizacion: el autor advierte que AutoRound lo lee en crudo sin ejecutar la conversion de transformers; cargarlo directamente con transformers puede requerir la version y configuracion adecuadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- El checkpoint base del que deriva ha sido eliminado del hub, lo que dificulta la trazabilidad y la verificacion de integridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/catonooka/Inkling-2-Mini-Unbound-BF16-HFNORM
- Modelo base (finetune abliterado): https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante cuantizada AutoRound W4A16-G128: https://huggingface.co/electroglyph/Inkling-2-Mini-Unbound-BF16-HFNORM-AutoRound-W4A16-G128
