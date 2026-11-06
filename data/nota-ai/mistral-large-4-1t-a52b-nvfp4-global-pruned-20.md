# nota-ai/Mistral-Large-4-1T-A52B-NVFP4-Global-Pruned-20

## Resumen
Nota AI publica una versión podada y cuantizada del modelo Mistral-Large-4-1T-A52B de Mistral AI, un transformer de tipo Mixture-of-Experts (MoE) con 1 billón de parámetros totales y 52 mil millones de parámetros activos por token. La intervención de nota-ai combina una poda global del 20 % de los expertos con cuantización NVFP4 (formato de 4 bits de NVIDIA para FP4 con escalas por bloque), lo que reduce drásticamente el peso del repositorio hasta 493,9 GB y permite servir el modelo en vLLM sobre hardware Blackwell. El modelo base es un MoE multilingüe con licencia restrictiva de Mistral, y esta variante hereda esa licencia ("other") y el acceso restringido (gated) en Hugging Face.

La propuesta es relevante ahora porque el coste de servir un MoE de 1T parámetros en FP8/BF16 es prohibitivo para la mayoría de equipos, y la combinación de poda de expertos + NVFP4 busca mantener calidad con un footprint mucho menor. Es una ficha pensada para desarrolladores que ya operan infraestructura Blackwell y quieren evaluar si esta variante comunitaria es una alternativa viable al checkpoint oficial.

No se dispone de información publicada sobre la metodología exacta de poda (criterio de selección de expertos, calibración de la cuantización), los datos de entrenamiento del modelo base ni resultados de benchmarks de esta variante concreta. Todos esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivado de Mistral-Large-4-1T-A52B |
| Parametros totales | 1 billón (1T) en el modelo base; reducido tras poda global del 20 % de expertos (cifra exacta no disponible) |
| Parametros activos | 52 mil millones (52B) en el modelo base |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA FP4); no se documentan otras variantes en el repo |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl |
| Licencia | other (heredada del modelo base Mistral; condiciones no detalladas en la información disponible) |
| Formato de pesos | safetensors cuantizados en NVFP4, compatibles con vLLM |

## Arquitectura y entrenamiento
El modelo base Mistral-Large-4-1T-A52B es un transformer con arquitectura Mixture-of-Experts: 1 billón de parámetros totales repartidos en expertos, de los que se activan 52 mil millones por token. Esta variante de nota-ai aplica una poda global del 20 % sobre el conjunto de expertos (tag `expert-pruning`, `Global-Pruned-20`), es decir, se eliminan expertos según un criterio global en lugar de por capa, y posteriormente se cuantizan los pesos resultantes a NVFP4. No se detalla en la información disponible el criterio de selección de expertos, el conjunto de calibración ni si hubo recuperación de calidad tras la poda.

Tampoco se dispone de datos sobre la composición del dataset de entrenamiento del modelo base, el número de tokens vistos, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. La innovación técnica documentada en esta ficha se limita a la combinación de poda de expertos y cuantización FP4 de NVIDIA, orientada a reducir el coste de memoria y a habilitar el despliegue en vLLM sobre GPUs Blackwell con soporte nativo de NVFP4.

## Capacidades
- Generación de texto y razonamiento general, heredados del modelo base Mistral-Large-4-1T-A52B.
- Cobertura multilingüe amplia: 33 idiomas listados en los tags, incluidos español, francés, alemán, portugués, italiano, japonés, coreano, ruso, chino, árabe, hindi y vietnamita, entre otros.
- Capacidad de código y matemáticas presumible en un modelo de esta familia, aunque no se documentan evaluaciones específicas en la información disponible.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Compatibilidad de despliegue con vLLM (tag `vllm`), lo que facilita su integración en servidores de inferencia estándar.

## Casos de uso
- Servicio de inferencia multilingüe en producción: el modelo cubre 33 idiomas y puede atender consultas en español, francés, alemán o árabe desde un único endpoint, lo que simplifica la operación frente a desplegar un modelo por idioma.
- Asistentes conversacionales de larga duración: un MoE con 52B parámetros activos mantiene un coste computacional por token contenido, adecuado para sesiones multi-turno con muchos usuarios concurrentes en vLLM.
- Generación y revisión de código en pipelines internos: si el modelo base conserva sus capacidades de código, esta variante cuantizada permite integrarlo en flujos de revisión automática con menor huella de memoria que el checkpoint oficial.
- Procesamiento de documentación técnica multilingüe: resumen, traducción y extracción de información de manuales en varios idiomas aprovechando la cobertura lingüística del modelo.
- Evaluación comparativa de técnicas de compresión: este checkpoint sirve como referencia práctica para medir el impacto de la poda del 20 % y de NVFP4 frente al modelo base en tareas internas de calidad.
- Despliegue en clústeres con GPUs Blackwell: al estar cuantizado en NVFP4 y pensado para vLLM, encaja en infraestructuras con B200 o GB200 donde el formato FP4 tiene soporte nativo.
- Investigación sobre poda de expertos en MoE: el repositorio permite estudiar cómo afecta la eliminación global de expertos al comportamiento del modelo en distintas tareas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el repositorio ocupa 493,9 GB en NVFP4; para inferencia en vLLM se necesita al menos esa cantidad de memoria agregada, más overhead de KV cache y buffers, por lo que se requieren varios aceleradores.
- GPU recomendadas: GPUs NVIDIA Blackwell (B200, GB200) por el soporte nativo de NVFP4; no se documenta compatibilidad con arquitecturas anteriores en la información disponible.
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090, 5090) por el tamaño del checkpoint y la falta de soporte NVFP4 nativo en esas tarjetas.
- Opciones de despliegue: vLLM es el backend documentado mediante tag; no se confirma soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Acceso |
|---|---|---|---|---|---|---|
| nota-ai/Mistral-Large-4-1T-A52B-NVFP4-Global-Pruned-20 | 1T (podado 20 % de expertos) | 52B | no disponible | NVFP4 | other | Gated |
| mistralai/Mistral-Large-4-1T-A52B (base) | 1T | 52B | no disponible | BF16/FP8 (no confirmado) | Mistral (other) | Gated |
| Otros MoE de gran escala con poda comunitaria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en rendimiento medido; la comparación se limita a parámetros, licencia y formato de pesos.

## Limitaciones y advertencias
- La poda global del 20 % de expertos puede degradar la calidad en dominios especializados; no se publican evaluaciones que cuantifiquen esa pérdida.
- La cuantización NVFP4 introduce error numérico adicional respecto a BF16/FP8; el impacto en tareas de razonamiento fino o matemáticas no está documentado.
- Licencia "other" heredada de Mistral: es imprescindible revisar los términos del modelo base antes de cualquier uso comercial, ya que pueden imponer restricciones adicionales.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face y no está disponible para descarga anónima.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no hay evaluación específica publicada para esta variante.
- Sesgos: no se documentan análisis de sesgo para el modelo base ni para esta variante.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas sin verificación previa.
- Compatibilidad de hardware limitada a GPUs con soporte NVFP4; desplegarlo en A100 o H100 puede no ser posible o requerir conversión adicional no documentada.
- Repositorio con 0 descargas y 8 likes en el momento de la consulta: es un artefacto reciente y poco validado por la comunidad.

## Enlaces
- [Hugging Face: nota-ai/Mistral-Large-4-1T-A52B-NVFP4-Global-Pruned-20](https://huggingface.co/nota-ai/Mistral-Large-4-1T-A52B-NVFP4-Global-Pruned-20)
- [Modelo base: mistralai/Mistral-Large-4-1T-A52B](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
