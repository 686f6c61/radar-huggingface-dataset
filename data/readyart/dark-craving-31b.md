# ReadyArt/Dark-Craving-31B

## Resumen

Dark-Craving-31B es un ajuste fino (fine-tune) del modelo google/gemma-4-31B-it, publicado por el usuario ReadyArt en Hugging Face. Está orientado a generación de texto conversacional para roleplay y contenido para adultos (ERP), con la etiqueta explícita de "unaligned", lo que indica que se han relajado total o parcialmente los mecanismos de alineación y rechazo del modelo base. El repositorio tiene acceso restringido (gated) y está marcado como no apto para audiencias generales.

El modelo conserva la arquitectura y el tamaño del Gemma 4 31B instruct original: 31.273.088.876 parámetros en formato safetensors, con un repositorio de 62,6 GB (compatible con pesos en bf16/fp16). No se documentan en la información disponible detalles sobre la longitud de contexto, la composición del dataset de ajuste ni el proceso de entrenamiento empleado por el autor.

Su relevancia es acotada: se trata de un fine-tune comunitario de un modelo reciente (Gemma 4), con cero descargas y cero likes en el momento de la consulta, y con una licencia declarada Apache 2.0 que conviene contrastar con las condiciones del modelo base de Google antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-31B-it); detalles internos no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (declarada en la model card; sujeta a las condiciones del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del instruct Gemma 4 31B de Google, por lo que hereda la arquitectura transformer del modelo base. La información proporcionada no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o SFT supervisado. Las etiquetas del repositorio ("unaligned", "nsfw", "explicit", "ERP") sugieren un ajuste orientado a reducir las barreras de rechazo del modelo base en contextos conversacionales adultos, pero no se documenta la metodología.

No se han publicado innovaciones técnicas específicas (decodificación especulativa, atención lineal, mezcla de expertos u otras) en la información disponible. Tampoco se detalla si el ajuste fue completo o mediante técnicas de bajo rango (LoRA/QLoRA) fusionadas en los pesos finales.

## Capacidades

- Generación de texto conversacional multi-turno, con énfasis en roleplay y diálogo de ficción.
- Contenido para adultos (ERP) y temática explícita, según las etiquetas del repositorio.
- Modo instruct heredado del modelo base (Gemma 4 31B-it).
- Capacidades multilingües limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión, audio o "thinking mode": no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está ajustado específicamente para mantener personajes y narrativa en diálogos multi-turno, lo que lo hace adecuado para aplicaciones de ficción interactiva y juegos de rol por texto.
- Escritura creativa para adultos: generación de narrativa explícita en inglés, un nicho con pocas alternativas de 31B parámetros publicadas abiertamente.
- Prototipado de chatbots de personaje: permite experimentar con sistemas de persona y memoria conversacional sin depender de APIs comerciales, aunque requiere aceptar la gated access en Hugging Face.
- Investigación sobre alineación y seguridad: al ser un modelo "unaligned", sirve como caso de estudio para evaluar cómo el fine-tuning degrada los mecanismos de rechazo y para construir clasificadores o filtros de contenido.
- Generación de datos sintéticos de diálogo: puede emplearse para producir corpus conversacionales etiquetados en inglés para entrenar modelos más pequeños de roleplay.
- Evaluación comparativa de fine-tunes: útil para medir el impacto de ajustes comunitarios sobre el Gemma 4 31B base en tareas de fidelidad de personaje y coherencia narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-65 GB solo para pesos, más overhead de KV cache; se recomienda al menos 80 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 32-35 GB; en 4 bits, aproximadamente 16-20 GB (estimaciones teóricas, no verificadas con este modelo concreto).
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU de 24-48 GB con tensor parallelism.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; en cuantización de 4 bits podría caber en una RTX 4090 o RTX 3090, pero no se han publicado GGUF oficiales.
- Opciones de despliegue: vLLM, TGI o transformers con accelerate para pesos safetensors; llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Dark-Craving-31B | 31,27 B | no disponible | Roleplay/ERP sin alinear | apache-2.0 (declarada) | Gated en Hugging Face |
| google/gemma-4-31B-it | 31,27 B (aprox.) | no disponible | Instruct generalista | Términos de Gemma | Público/gated según Google |
| Fine-tunes comunitarios de roleplay de ~30B | variable | variable | Roleplay/ERP | variable | Habitualmente públicos |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente "unaligned": los mecanismos de rechazo del modelo base están presumiblemente reducidos o eliminados, lo que implica riesgo alto de generar contenido dañino, explícito o inapropiado sin filtros.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; el ajuste hacia roleplay puede degradar la precisión en tareas de conocimiento.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado.
- Licencia: la model card declara apache-2.0, pero al derivar de google/gemma-4-31B-it conviene verificar que los términos del modelo base permiten la redistribución y el uso comercial de fine-tunes; no se aporta documentación al respecto.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y el despliegue automatizado.
- Sin adopción comunitaria: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por terceros.
- No apto para producción generalista ni para entornos con menores o audiencias no advertidas; requiere moderación externa obligatoria.

## Enlaces

- Hugging Face: https://huggingface.co/ReadyArt/Dark-Craving-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
