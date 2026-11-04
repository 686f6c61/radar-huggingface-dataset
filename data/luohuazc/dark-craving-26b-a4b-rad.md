# LuoHuaZC/Dark-Craving-26B-A4B-rad

## Resumen

Dark-Craving-26B-A4B-rad es un modelo publicado en HuggingFace por el usuario LuoHuaZC bajo licencia Apache 2.0. El identificador del repositorio sugiere una variante de aproximadamente 26.000 millones de parámetros totales con unos 4.000 millones de parámetros activos, lo que apunta a una arquitectura de mezcla de expertos (MoE) con activación dispersa, si bien esta interpretación se deduce únicamente del nombre y no está confirmada por documentación oficial. El sufijo "rad" no tiene explicación en la información disponible.

La model card publicada es prácticamente vacía: solo contiene la declaración de licencia Apache 2.0, sin descripción, sin datos de entrenamiento, sin especificaciones técnicas ni resultados de evaluación. El repositorio registra cero descargas y cero "likes", y no tiene pipeline declarado ni idiomas especificados, lo que indica que se trata de un artefacto recién subido y sin validación por parte de la comunidad.

Por tanto, esta ficha se limita a documentar lo que puede verificarse y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluación de idoneidad para producción debería posponerse hasta que exista una model card sustantiva, pesos inspeccionables y, preferiblemente, resultados de benchmarks reproducibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre "26B-A4B" sugiere MoE con ~4B parámetros activos, sin confirmar) |
| Parámetros totales | ~26B según el identificador del repositorio; no confirmado por el autor |
| Parámetros activos | ~4B según el identificador del repositorio; no confirmado por el autor |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo. El identificador "26B-A4B" es consistente con el patrón de nomenclatura habitual en modelos de mezcla de expertos (por ejemplo, la convención "total-A-activos" usada por varias familias recientes), pero el autor no confirma ni el número de expertos, ni el mecanismo de enrutamiento, ni si se trata de un transformer denso modificado, un MoE puro o una arquitectura híbrida.

Tampoco se dispone de datos sobre el corpus de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras etapas de alineación, ni innovaciones técnicas como decodificación especulativa o atención lineal. El sufijo "rad" del nombre podría indicar un proceso de entrenamiento o ajuste concreto, pero no está documentado. En consecuencia, no es posible evaluar la calidad, la procedencia ni las restricciones de los datos subyacentes.

## Capacidades

- No se han documentado capacidades específicas en la model card.
- No hay confirmación de soporte de tool calling o function calling.
- No hay confirmación de capacidades de agente o razonamiento multi-paso.
- No hay confirmación de capacidades multilingües ni de idiomas cubiertos.
- No hay confirmación de modo "thinking", visión, audio ni otras modalidades.
- La única capacidad inferible del nombre es la generación de texto propia de un modelo de lenguaje, sin garantías adicionales.

## Casos de uso

- Evaluación exploratoria en investigación: el modelo puede descargarse y probarse en un entorno aislado para caracterizar su comportamiento, dado que no hay documentación que permita anticiparlo; adecuado solo para experimentación, no para producción.
- Pruebas de integración en pipelines de inferencia: sirve para validar compatibilidad con vLLM, llama.cpp u otros motores, siempre que se confirmen previamente los formatos de pesos disponibles.
- Comparación de arquitecturas MoE: si se confirma la estructura 26B-A4B, puede usarse como punto de referencia en estudios sobre eficiencia de activación dispersa frente a modelos densos de tamaño similar.
- Fine-tuning experimental: la licencia Apache 2.0 permite derivados y ajuste fino, lo que facilita su uso como base en proyectos de investigación que acepten el riesgo de partir de un modelo sin evaluar.
- Docencia y formación: útil como ejemplo práctico de publicación de modelos en HuggingFace y de la importancia de una model card completa.
- No recomendado para atención al cliente, generación de código en producción, análisis documental ni ninguna aplicación con requisitos de fiabilidad, al no existir evidencia de rendimiento ni de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; como referencia orientativa, un modelo de ~26B parámetros en FP16 requeriría del orden de 52 GB de VRAM, y en cuantización de 4 bits del orden de 13-15 GB, pero estos cálculos son estimaciones genéricas y no están confirmados por el autor.
- GPU recomendadas: no disponible; para un modelo de ese tamaño en precisión completa serían necesarias A100 80GB, H100 o varias GPU consumer en paralelo.
- ¿Cabe en GPU consumer?: probablemente en cuantización de 4 bits en tarjetas con 16-24 GB (RTX 4080, 4090), pero sin confirmación de que existan pesos cuantizados.
- Opciones de despliegue: no disponible; no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque se desconocen las especificaciones reales del modelo. A modo de referencia categórica, si se confirma la arquitectura MoE de ~26B totales y ~4B activos, los comparables habituales serían modelos como Mixtral 8x7B (46,7B totales, ~12,9B activos), Qwen1.5-MoE-A2.7B (14,3B totales, 2,7B activos) o Phi-3.5-MoE (41,9B totales, 6,6B activos). Sin embargo, no se dispone de datos de parámetros, contexto, rendimiento ni disponibilidad verificados para Dark-Craving-26B-A4B-rad, por lo que la comparación cuantitativa queda como "no disponible".

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-rad | ~26B (según nombre) | ~4B (según nombre) | no disponible | Apache 2.0 | sin documentar |
| Mixtral 8x7B | 46,7B | ~12,9B | 32k | Apache 2.0 | documentado |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32k | Apache 2.0 | documentado |
| Phi-3.5-MoE | 41,9B | 6,6B | 128k | MIT | documentado |

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay información sobre datos de entrenamiento, sesgos, alineación ni evaluación de seguridad.
- Riesgo elevado de alucinación y comportamientos no caracterizados, al no existir benchmarks ni evaluaciones publicadas.
- Imposibilidad de verificar la arquitectura real, el contexto máximo o los idiomas soportados a partir de la documentación.
- Licencia Apache 2.0 permite uso comercial y derivados, pero el usuario asume todo el riesgo sobre la procedencia de los datos y posibles reclamaciones de terceros.
- Cero descargas y cero interacciones en HuggingFace: no hay evidencia de que el modelo haya sido probado por terceros.
- Fecha de creación declarada en 2026-11-04, posterior a la fecha actual de muchas consultas; conviene verificar la autenticidad y vigencia del repositorio antes de cualquier uso.
- No apto para producción sin una auditoría previa completa de pesos, comportamiento y seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/LuoHuaZC/Dark-Craving-26B-A4B-rad
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
