# INTISARI/intisari-indonesian-chat-v5

## Resumen

El modelo `INTISARI/intisari-indonesian-chat-v5` es un modelo de conversación en indonesio desarrollado por el equipo INTISARI. Con 66,2 millones de parámetros, se trata de un modelo compacto orientado a tareas de chat, probablemente diseñado para entornos con recursos limitados o despliegue en dispositivos de baja capacidad. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

A pesar de su nombre y de la etiqueta `gguf` en HuggingFace, la documentación pública es prácticamente inexistente: la model card solo incluye la licencia. No se han publicado detalles sobre arquitectura, datos de entrenamiento, capacidades específicas ni benchmarks. Su relevancia actual es limitada debido a la falta de información verificable, aunque podría ser útil como punto de partida para experimentos con modelos pequeños en indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 66.224.640 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag `gguf` sugiere que existen versiones cuantizadas, pero no se especifican) |
| Idiomas soportados | no disponible (por el nombre, se infiere indonesio, pero no está confirmado) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene safetensors según el dato de parámetros; también podría incluir GGUF) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (si es transformer, MoE, etc.), el volumen de datos de entrenamiento, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas. La ausencia de una model card detallada impide cualquier análisis técnico riguroso.

## Capacidades

No se han documentado capacidades concretas. Por el nombre y la etiqueta `conversational`, se presume que el modelo está diseñado para mantener diálogos en indonesio, pero no hay evidencia pública de:

- Generación de texto general o especializada
- Razonamiento o matemáticas
- Generación de código
- Soporte de tool calling o function calling
- Capacidades de agente o razonamiento multi-paso
- Soporte multilingüe más allá del posible indonesio
- Modos especiales (thinking, visión, audio, etc.)

## Casos de uso

No se han publicado casos de uso documentados. Dado el tamaño del modelo y su orientación conversacional, podría plantearse su uso en escenarios como:

- Chatbots simples en indonesio para atención al cliente en entornos con restricciones de hardware
- Prototipos de asistentes conversacionales en indonesio para investigación académica
- Experimentos de fine-tuning sobre una base ligera

Sin embargo, estas posibilidades son especulativas y no están respaldadas por documentación oficial. Se recomienda verificar el comportamiento real del modelo antes de considerarlo para cualquier aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar.

## Requisitos de hardware

Al tratarse de un modelo de 66 millones de parámetros, los requisitos de hardware son muy reducidos. Aunque no hay especificaciones oficiales, se puede estimar:

- VRAM estimada para inferencia: aproximadamente 0,25 GB en FP32 (66M × 4 bytes). Con cuantización a 8 bits, ~0,13 GB; a 4 bits, ~0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, o incluso CPU sola.
- Es compatible con hardware de consumo (Raspberry Pi, portátiles sin GPU dedicada, etc.).
- Opciones de despliegue: al ser un modelo pequeño, puede ejecutarse con llama.cpp, Ollama, o frameworks como vLLM si se convierte a los formatos adecuados. El tag `gguf` sugiere que ya existen versiones para estos entornos.
- Latencia y throughput: no disponibles, pero en hardware moderno se espera una latencia de milisegundos por token.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (chat en indonesio con ~66M parámetros). No se puede establecer una comparativa fiable sin datos de rendimiento.

## Limitaciones y advertencias

- Falta total de documentación técnica: no se conocen detalles de arquitectura, entrenamiento ni capacidades.
- Riesgo de alucinación y sesgos: al no haber información sobre los datos de entrenamiento, no se puede evaluar la calidad ni los sesgos potenciales.
- Soporte de idioma no confirmado: aunque el nombre sugiere indonesio, no hay confirmación oficial.
- Sin benchmarks: no se puede medir su rendimiento frente a otros modelos.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de documentación dificulta su adopción en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica una adopción nula y posible falta de mantenimiento.

## Enlaces

- [HuggingFace - INTISARI/intisari-indonesian-chat-v5](https://huggingface.co/INTISARI/intisari-indonesian-chat-v5)
