# podolinsky/cosmos3-edge-libero-x-level123

## Resumen

Cosmos3-Edge-Libero-X-Level123 es un ajuste fino (fine-tune) del modelo base lerobot/Cosmos3-Edge, desarrollado por el usuario podolinsky y publicado en Hugging Face. Se trata de un modelo orientado a robótica (pipeline `robotics`) entrenado sobre el conjunto de datos podolinsky/libero-x-level123-cosmos3, una variante del benchmark LIBERO-X. El modelo hereda la arquitectura y el enfoque de Cosmos3-Edge, un modelo de la familia Cosmos de NVIDIA orientada a la generación y comprensión de escenas físicas y a la política robótica, distribuido a través de la librería LeRobot.

El modelo cuenta con 4.563.688.396 parámetros (aproximadamente 4,56 mil millones), según los pesos en formato safetensors, y un repositorio de 36,5 GB. Está pensado para tareas de manipulación robótica y control de políticas (policy learning) en entornos simulados y potencialmente reales, siguiendo el paradigma de los modelos vision-language-action (VLA) que combinan percepción visual, instrucciones en lenguaje natural y generación de acciones motoras.

Su relevancia es acotada: se trata de un experimento de ajuste fino de un modelo base de robótica sobre un dataset específico (LIBERO-X nivel 123), con cero descargas y cero likes en el momento de la consulta, y con acceso restringido (gated) que requiere aceptar condiciones en Hugging Face. No hay información pública sobre idiomas soportados, benchmarks ni detalles de entrenamiento más allá de lo declarado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cosmos3-Edge, familia Cosmos de NVIDIA; detalles no declarados en la informacion disponible) |
| Parametros totales | 4.563.688.396 (~4,56 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | openmdw1.1-license (tag `license:other`) |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/Cosmos3-Edge |
| Dataset de ajuste | podolinsky/libero-x-level123-cosmos3 |
| Tamano del repo | 36,5 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. El modelo deriva de lerobot/Cosmos3-Edge, un modelo de la familia Cosmos orientada a robótica y distribución vía LeRobot. Por el pipeline declarado (`robotics`) y el dataset de ajuste (una variante de LIBERO-X, benchmark de manipulación robótica con instrucciones en lenguaje natural), se infiere que se trata de un modelo vision-language-action (VLA) que recibe observaciones visuales e instrucciones textuales y produce acciones motoras. No obstante, esta inferencia no está confirmada por la model card ni por documentación adicional accesible.

Respecto al entrenamiento, solo se conoce que es un fine-tune del modelo base lerobot/Cosmos3-Edge sobre el dataset podolinsky/libero-x-level123-cosmos3. No se declaran número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones, según el pipeline `robotics` declarado.
- Ajuste específico sobre tareas de LIBERO-X (nivel 123), orientado a manipulación en entornos simulados de benchmark.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue de políticas.
- Capacidades de lenguaje natural y visión: no confirmadas explícitamente en la información disponible, aunque plausibles por el modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Evaluación de políticas robóticas en el benchmark LIBERO-X: el modelo puede emplearse para reproducir y comparar resultados en las tareas del nivel 123 de LIBERO-X, sirviendo como referencia para investigaciones en manipulación.
- Investigación en aprendizaje por imitación: al estar ajustado sobre un dataset específico de demostraciones, es adecuado para estudiar cómo el fine-tuning de un VLA base afecta al rendimiento en tareas concretas.
- Prototipado de pipelines LeRobot: se puede integrar en flujos de entrenamiento y evaluación de LeRobot para validar configuraciones experimentales.
- Reproducibilidad de experimentos: al publicar pesos y dataset asociado, permite a otros grupos reproducir y extender el ajuste sobre LIBERO-X.
- Comparación de estrategias de fine-tuning: útil para contrastar el ajuste sobre un subconjunto (nivel 123) frente a ajustes sobre el dataset completo u otras variantes.
- Docencia e investigación académica en robótica: como ejemplo práctico de ajuste de un modelo base de robótica sobre un benchmark estándar, con acceso controlado que garantiza el cumplimiento de las condiciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~4,56 B parámetros en precisión completa (FP32) requeriría aproximadamente 18 GB solo para los pesos; en FP16/BF16, unos 9 GB; en cuantización de 8 bits, unos 4,5 GB; y en 4 bits, unos 2,3 GB. Estas cifras son estimaciones genéricas y no están confirmadas para este modelo.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) en FP16, y en GPUs profesionales (A100, H100) para entrenamiento o despliegue a mayor escala.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantizaciones de 8 o 4 bits, y en FP16 en GPUs de 24 GB o más; no confirmado.
- Opciones de despliegue: LeRobot (librería declarada). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están confirmadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| podolinsky/cosmos3-edge-libero-x-level123 | ~4,56 B | no disponible | openmdw1.1-license | Gated en HF | Fine-tune sobre LIBERO-X nivel 123 |
| lerobot/Cosmos3-Edge (base) | no disponible | no disponible | no disponible | HF | Modelo base del que deriva |
| Otros fine-tunes de Cosmos3-Edge | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (VLA para robótica) más allá del modelo base. Indíquese como "no disponible".

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Licencia openmdw1.1-license: es necesario revisar los términos exactos para uso comercial; el tag `license:other` indica condiciones no estándar.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset específico de robótica, puede heredar sesgos de las demostraciones y del entorno simulado.
- Riesgo de alucinación: no evaluado; en modelos VLA el riesgo se manifiesta como acciones incorrectas o inseguras en entornos reales.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas soportados.
- Generalización limitada: al ser un fine-tune sobre LIBERO-X nivel 123, su rendimiento fuera de ese subconjunto puede degradarse notablemente.
- Cero adopción pública: sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.
- Uso en producción: requiere validación exhaustiva en el entorno objetivo; no se recomienda su despliegue directo en robots reales sin evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/podolinsky/cosmos3-edge-libero-x-level123
- Modelo base: https://huggingface.co/lerobot/Cosmos3-Edge
- Dataset de ajuste: https://huggingface.co/datasets/podolinsky/libero-x-level123-cosmos3
- Librería LeRobot: https://github.com/huggingface/lerobot
- Benchmark LIBERO: no disponible en la información proporcionada
- Paper de Cosmos: no disponible en la información proporcionada
