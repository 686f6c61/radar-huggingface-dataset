# ReadyArt/Dark-Craving-26B-A4B-v0.1

## Resumen

Dark-Craving-26B-A4B-v0.1 es un ajuste fino (finetune) de carácter conversacional y roleplay sin alinear, publicado por la organización ReadyArt sobre el modelo base google/gemma-4-26B-A4B-it. Se trata de un modelo de generación de texto orientado explícitamente a contenido adulto, roleplay y ERP (escritura erótica interactiva), un segmento que los modelos comerciales no cubren por sus políticas de contenido. Su relevancia radica en la combinación de una arquitectura MoE (sugerida por la nomenclatura "26B-A4B", que indica aproximadamente 4 mil millones de parámetros activos) con una licencia Apache 2.0, lo que permite su uso, modificación y redistribución sin restricciones de licencia.

El modelo se distribuye en formato safetensors, con un tamaño total de parámetros de 25.805.936.206 (unos 25,8 mil millones) y un repositorio de 51,6 GB. Según los metadatos de HuggingFace, está entrenado o optimizado para inglés. La model card del autor es esencialmente una página estilizada sin documentación técnica sustantiva, por lo que gran parte de los detalles de entrenamiento, benchmarks y capacidades medidas no están disponibles públicamente.

Se trata de un modelo de audiencia restringida: HuggingFace lo etiqueta con "not-for-all-audiences" y el propio autor lo marca como "unaligned" (sin alineación), lo que implica que no debe desplegarse en entornos de producción orientados a usuarios finales sin controles adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Gemma 4, según tags; detalles no disponibles) |
| Parametros totales | 25.805.936.206 (≈25,8B) |
| Parametros activos | ≈4B (inferido de la nomenclatura "A4B"; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en safetensors) |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (51,6 GB el repositorio) |

## Arquitectura y entrenamiento

El modelo es un finetune de google/gemma-4-26B-A4B-it, la variante instruct de la familia Gemma 4 de Google con aproximadamente 26 mil millones de parámetros totales y unos 4 mil millones activos por token, lo que sugiere una arquitectura de mezcla de expertos (MoE). Esta configuración permite obtener latencias de inferencia cercanas a las de un modelo denso de 4B manteniendo la capacidad de conocimiento de un modelo de 26B. No se han publicado detalles sobre la estructura exacta de expertos, el mecanismo de atención ni la longitud de contexto heredada del modelo base.

Sobre el proceso de entrenamiento del ajuste fino no hay información disponible: la model card no especifica dataset, número de tokens, método (SFT, DPO, RLHF) ni hiperparámetros. Por las etiquetas del autor ("unaligned", "nsfw", "roleplay", "ERP"), se trata de un ajuste orientado a eliminar las restricciones de contenido del modelo base y especializarlo en narrativa conversacional de temática adulta, un enfoque habitual en la comunidad de roleplay local (junto a proyectos como los de TheDrummer o Sage).

## Capacidades

- Generación de texto conversacional en inglés, especializada en roleplay narrativo de larga duración.
- Contenido adulto explícito sin filtros de alineación (etiquetado NSFW/ERP por el autor).
- Instrucciones (instruct), heredadas del modelo base google/gemma-4-26B-A4B-it.
- Razonamiento general y capacidades del modelo base subyacente, sin datos cuantificados publicados.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: metadatos declaran solo inglés; el rendimiento en castellano no está documentado.
- Capacidades especiales (visión, audio, thinking mode): no disponibles según la información publicada.

## Casos de uso

- Roleplay interactivo local: el caso de uso principal; el modelo está diseñado para conversaciones multi-turno de narrativa adulta en frontends como SillyTavern, aprovechando su especialización ERP.
- Escritura creativa de ficción adulta: generación de prosa narrativa con personajes consistentes en sesiones largas de escritura asistida.
- Desarrollo y prueba de frontends de chat: al ser un MoE de ~4B activos, es adecuado para iterar interfaces de chat con latencias bajas en hardware de consumo.
- Investigación en desalineación y seguridad: sirve como sujeto de estudio para evaluar cómo los ajustes sin alineación modifican el comportamiento de un modelo base instruct.
- Benchmarking de inferencia MoE en consumer GPU: útil para medir rendimiento real de arquitecturas MoE de gama media con vLLM o llama.cpp.
- Generación de contenido para plataformas de entretenimiento adulto con verificación de edad, donde la licencia Apache 2.0 permite uso comercial sin restricciones de licenciamiento (siempre que se cumpla la normativa sectorial).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra batería, ni comparativas con el modelo base.

## Requisitos de hardware

- VRAM en precisión completa (BF16, ~51,6 GB de pesos): se necesitan aproximadamente 56-64 GB de VRAM, es decir, una A100 80GB, H100 o 2x RTX 3090/4090 con tensor parallelism.
- Con cuantización Q4 (estimada, ~14-16 GB de pesos): cabría en una RTX 3090, RTX 4090 (24 GB) o RTX 5090, dejando margen para el contexto. No existen versiones cuantizadas publicadas en el repositorio en la información disponible.
- Al ser MoE con ~4B de parámetros activos, el throughput esperado en consumer GPU con cuantización de 4 bits debería ser alto (decenas de tokens/segundo), aunque no hay cifras publicadas.
- Despliegue compatible: llama.cpp (con soporte GGUF de la familia base), Ollama, vLLM, TGI y LM Studio, siempre que soporten la arquitectura Gemma 4 MoE; conviene verificar la versión mínima de cada runtime.
- No hay datos oficiales de latencia; cualquier cifra sería una estimación dependiente del backend y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v0.1 | ≈25,8B | ≈4B | Apache 2.0 | Roleplay/NSFW sin alinear | Publico (HuggingFace) |
| google/gemma-4-26B-A4B-it (base) | ≈26B | ≈4B | Licencia Gemma (restricciones de uso) | Instruct generalista | Publico |
| TheDrummer/Anubis-Pro-105B-v1 (categoria roleplay unaligned) | ≈105B | no disponible | Apache 2.0 | Roleplay/NSFW sin alinear | Publico |

Frente a su modelo base, Dark-Craving ofrece la misma eficiencia de inferencia pero sin las restricciones de contenido de Google y con licencia Apache 2.0 en lugar de la licencia Gemma, que impone condiciones de uso adicionales. Frente a otros modelos unaligned de la comunidad, su ventaja es el bajo coste de inferencia por token (MoE de ~4B activos), a costa de una capacidad teórica inferior a modelos mucho mayores.

## Limitaciones y advertencias

- Contenido restringido por audiencia: el modelo genera material sexual explícito y está etiquetado "not-for-all-audiences"; su uso está prohibido con menores y su despliegue público requiere verificación de edad y cumplimiento normativo local.
- Sin alineación ("unaligned"): al haberse retirado las salvaguardas del modelo base, el riesgo de generar contenido dañino, ilegal o sesgado es sustancialmente mayor que en modelos instruct convencionales. No es apto para producción generalista sin capas de moderación externas.
- Riesgo de alucinación: heredado del modelo base y agravado por la ausencia de alineación; no hay evaluaciones que lo cuantifiquen.
- Idioma: solo se declara soporte para inglés; el comportamiento en castellano no está documentado y puede ser inconsistente.
- Documentación deficiente: la model card no describe datos de entrenamiento, método ni hyperparámetros, lo que dificulta evaluar reproducibilidad y calidad.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base (Gemma) puede estar sujeto a sus propios términos; conviene revisar la licencia de google/gemma-4-26B-A4B-it para derivados.
- Adopción marginal: 22 descargas y 7 likes en el momento de la ficha, sin comunidad de validación ni versiones cuantizadas de terceros documentadas.
- Versión v0.1: primera iteración, sin indicios de estabilidad ni de mantenimiento continuo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.1
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Organización del autor: no disponible en la informacion proporcionada
- Paper, blog o repositorio de entrenamiento: no disponible
