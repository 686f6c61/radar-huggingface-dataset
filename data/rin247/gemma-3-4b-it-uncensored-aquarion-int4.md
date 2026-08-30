# Rin247/gemma-3-4b-it-Uncensored-Aquarion-INT4

## Resumen

El modelo `Rin247/gemma-3-4b-it-Uncensored-Aquarion-INT4` es una cuantización INT4 (weight-only) del modelo instructivo `gemma-3-4b-it` de Google, publicada por el usuario Rin247. Antes de la cuantización, el modelo fue sometido a un proceso de "abliteración" (eliminación de la censura) mediante proyección ortogonal de la dirección de rechazo, una técnica que busca eliminar las respuestas de negativa sin reentrenamiento. El resultado es un modelo compacto, de aproximadamente 2.490 millones de parámetros, orientado a usuarios que necesitan un LLM local, rápido y sin restricciones de contenido. La relevancia actual radica en su tamaño reducido (cabe en GPUs de consumo) y en su naturaleza "uncensored", que lo hace atractivo para aplicaciones de rol, escritura creativa o investigación sobre alineación, aunque con los riesgos asociados a la falta de moderación.

El proceso de cuantización se realizó con el método RTN (round-to-nearest) en CPU, almacenando escalas junto a los pesos en formato safetensors. No se proporciona información sobre licencia, idiomas soportados, longitud de contexto ni benchmarks. El repositorio tiene un tamaño de 3,3 GB e incluye únicamente los archivos `model.safetensors` y `config.json` con la configuración de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en `gemma-3-4b-it`) |
| Parametros totales | 2.490.969.456 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (weight-only, RTN) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (con escalas y shapes separados) |

## Arquitectura y entrenamiento

El modelo no fue entrenado desde cero; es una adaptación del modelo base `gemma-3-4b-it` de Google. La arquitectura subyacente es un transformer denso, aunque no se detallan en la documentación parámetros como el número de capas, cabezas de atención o mecanismo de atención (global/local). La modificación principal consiste en dos pasos: primero, una "abliteración" mediante proyección ortogonal de la dirección de rechazo, que elimina la tendencia del modelo a negarse a responder ciertas peticiones; segundo, una cuantización INT4 weight-only usando RTN en CPU, con escalas almacenadas en buffers adicionales (`*.weight_scale`, `*.weight_shape`). No se menciona el uso de RLHF, DPO ni ningún otro método de ajuste fino. El proceso es puramente de post-procesado sobre los pesos del modelo original.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base `gemma-3-4b-it`, aunque la cuantización INT4 puede degradar ligeramente la precisión.
- Respuestas sin censura: gracias a la abliteración, el modelo no debería emitir rechazos por contenido sensible, aunque esto no garantiza la calidad ni la seguridad de las respuestas.
- Soporte de tool calling / function calling: no se menciona en la documentación; se asume que las capacidades del modelo base se mantienen, pero sin confirmación.
- Capacidades multilingües: no se especifican; el modelo base de Gemma 3 soporta múltiples idiomas, pero esta versión no documenta el alcance.
- No se indica soporte para visión, audio u otras modalidades.

## Casos de uso

- Generación de ficción y escritura creativa sin restricciones: el modelo puede producir narrativas, diálogos o guiones que aborden temas tabú o explícitos sin rechazo automático, útil para autores que exploran contenido adulto.
- Juegos de rol (RPG) textuales: su tamaño compacto permite ejecutarlo localmente en equipos con GPU de consumo, ofreciendo respuestas coherentes y sin filtros para personajes o situaciones complejas.
- Asistentes de chat personalizados para investigación sobre alineación: investigadores pueden estudiar el comportamiento de un modelo "uncensored" y compararlo con versiones alineadas para analizar sesgos y efectos de la abliteración.
- Prototipado de aplicaciones de generación de texto en entornos con recursos limitados: al ser INT4 y de ~2,5B parámetros, cabe en memoria de una RTX 3060 o similar, permitiendo pruebas rápidas sin infraestructura cloud.
- Fine-tuning posterior sobre dominios específicos: aunque ya está cuantizado, se podría usar como punto de partida para tareas que requieran respuestas sin restricciones, como generación de contenido para adultos o humor negro.
- Evaluación comparativa de técnicas de cuantización: sirve como ejemplo de una cuantización INT4 weight-only con RTN, útil para desarrolladores que quieran comparar métodos de compresión en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 2.490 millones de parámetros en INT4, los pesos ocupan aproximadamente 1,25 GB (2,49B × 0,5 bytes). Sumando escalas, buffers y overhead de inferencia, se estima un consumo de 2-3 GB de VRAM para carga completa.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo. En CPU, se puede usar con llama.cpp u otros backends, aunque la latencia será mayor.
- Opciones de despliegue: al ser safetensors con formato personalizado, requiere un script de dequantización antes de usar un motor estándar. No se menciona compatibilidad directa con vLLM, Ollama o TGI; habría que convertir los pesos a un formato estándar (por ejemplo, GGUF) para esos motores.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Uncensored | Licencia | Formato |
|---|---|---|---|---|---|
| Rin247/gemma-3-4b-it-Uncensored-Aquarion-INT4 | 2.49B | INT4 weight-only | Sí (abliterado) | No disponible | safetensors |
| Nidum-Gemma-3-4B-it-Uncensored | 4B (aprox.) | GGUF (varias) | Sí | No disponible | GGUF |
| google/gemma-3-4b-it (base) | 4B | Original (BF16) | No | Apache 2.0 | safetensors |

La comparativa es limitada porque no se dispone de datos de rendimiento ni de benchmarks para el modelo de Rin247. La principal diferencia con la versión de Nidum es el formato de pesos (safetensors INT4 vs. GGUF) y el método de abliteración (proyección ortogonal vs. otro enfoque no especificado). El modelo base de Google es la referencia original, pero con censura activa.

## Limitaciones y advertencias

- Al ser "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros, lo que implica riesgos legales y éticos en su uso.
- La cuantización INT4 weight-only puede reducir la calidad de las respuestas en tareas que requieren alta precisión (matemáticas, razonamiento complejo) comparado con el modelo en BF16.
- No se especifica licencia, por lo que el uso comercial es incierto; se recomienda contactar al autor antes de cualquier despliegue productivo.
- No hay información sobre la longitud de contexto soportada; si se usa el modelo base, se esperan 128K tokens, pero no está confirmado para esta versión.
- El formato de pesos es propietario (con escalas y shapes separados), lo que dificulta su uso directo en herramientas estándar como Ollama o vLLM sin conversión previa.
- Riesgo de alucinación: como cualquier LLM, puede inventar información; la abliteración no corrige este problema.
- El modelo no ha sido evaluado en benchmarks públicos, por lo que su rendimiento real es desconocido.

## Enlaces

- [HuggingFace - Rin247/gemma-3-4b-it-Uncensored-Aquarion-INT4](https://huggingface.co/Rin247/gemma-3-4b-it-Uncensored-Aquarion-INT4)
- [HuggingFace - google/gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it)
- [HuggingFace - VibeStudio/Nidum-Gemma-3-4B-it-Uncensored](https://huggingface.co/nidum/Nidum-Gemma-3-4B-it-Uncensored)
- [Ollama - nidumai/nidum-gemma-3-4b-it-uncensored](https://ollama.com/nidumai/nidum-gemma-3-4b-it-uncensored)
