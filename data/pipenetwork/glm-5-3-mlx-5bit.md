# pipenetwork/GLM-5.3-MLX-5bit

## Resumen

GLM-5.3-MLX-5bit es una conversión a MLX (Apple Silicon) y cuantización a 5 bits del modelo GLM-5.3 de Z.ai, realizada por PipeNetwork. El modelo original es un MoE de 744 mil millones de parámetros con arquitectura `glm_moe_dsa` (256 expertos, top-8, atención MLA con sparse attention estilo DeepSeek-V3.2), diseñado para destacar en ingeniería de software compleja y tareas de agente. Esta build concreta está pensada para ejecutarse en hardware Apple Silicon con grandes cantidades de memoria unificada, y no incluye la capa de multi-token-prediction (capa 78) del modelo original.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada del mayor modelo de Z.ai para entornos MLX, con un tamaño en disco de 511,5 GB y requisitos de RAM de 768 GB. Aunque el archivo safetensors reporta 139.639.907.328 parámetros, el modelo base declara 744B; esta discrepancia se debe probablemente a la forma en que se almacenan los pesos cuantizados, pero no se ha aclarado oficialmente. La build requiere un runtime específico incluido en el checkpoint para manejar correctamente el esquema de indexación dispersa, que difiere entre capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (`glm_moe_dsa`) con 256 expertos, top-8, MLA con sparse attention estilo DeepSeek-V3.2 |
| Parametros totales | 139.639.907.328 (según safetensors; el modelo base declara 744B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit (group 64) para la mayoría de pesos; bf16/fp32 para indexer y router |
| Idiomas soportados | no disponible |
| Licencia | GLM-5.3 (otra) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Esta build es una conversión a MLX y cuantización 5-bit del modelo GLM-5.3 de Z.ai, que emplea una arquitectura MoE con 256 expertos y selección top-8, junto con atención MLA (Multi-head Latent Attention) y sparse attention inspirada en DeepSeek-V3.2. El modelo original fue entrenado por Z.ai, pero no se proporcionan detalles sobre el dataset, número de tokens o métodos de post-entrenamiento (RLHF, DPO, etc.) en la información disponible. La capa de multi-token-prediction (capa 78) no está incluida en esta conversión.

Un aspecto técnico destacado es el manejo del "lightning indexer": el modelo tiene 78 capas, pero solo 21 de ellas contienen pesos de indexador; las otras 57 capas "compartidas" reutilizan la selección top-k de la capa completa anterior. El runtime incluido en el checkpoint implementa este esquema correctamente, a diferencia de la implementación estándar de mlx-lm, que construye indexadores en todas las capas y deja 285 parámetros sin inicializar. La cuantización se aplica por grupos de 64, con los expertos enrutados (97,5% de los parámetros) y el resto de pesos (atención, expertos compartidos, capas densas, embeddings y lm_head) también en 5-bit, mientras que el indexador, el router y las normas se mantienen en bf16/fp32.

## Capacidades

- Generación de texto y conversación: el modelo base GLM-5.3 está diseñado para tareas de diálogo y generación de texto, aunque no se han publicado evaluaciones específicas para esta cuantización.
- Razonamiento y resolución de problemas: según la documentación de Z.ai, GLM-5.3 mejora significativamente en programación compleja y tareas de largo horizonte, capacidades que se espera se mantengan en esta build, aunque con posible degradación por la cuantización.
- Programación y análisis de código: el modelo base tiene un rendimiento destacado en ingeniería de software, lo que sugiere utilidad para generación, revisión y depuración de código.
- Capacidades de agente: la documentación oficial menciona mejoras en tareas de agente, lo que implica soporte para razonamiento multi-paso y uso de herramientas, aunque no se detalla en esta ficha.
- Multilingüismo: no se dispone de información sobre los idiomas soportados.
- Tool calling y function calling: no se ha confirmado explícitamente para esta build, pero es probable que el modelo base lo soporte; no hay datos verificados.

## Casos de uso

- Desarrollo de software asistido en entornos de alta gama: el modelo puede ayudar a generar, revisar y refactorizar código en repositorios grandes, aprovechando su capacidad de razonamiento complejo. Es adecuado para equipos que trabajan con Mac Pro o clústeres de Apple Silicon con 768 GB de RAM.
- Agentes autónomos de resolución de tareas: gracias a las mejoras en tareas de agente del modelo base, puede utilizarse para planificar y ejecutar secuencias de acciones en entornos controlados, como automatización de pruebas o gestión de incidencias.
- Análisis y documentación de código legacy: con su capacidad de procesar grandes volúmenes de texto, puede generar documentación técnica, explicar fragmentos complejos y detectar patrones problemáticos en bases de código extensas.
- Asistencia en investigación y razonamiento matemático: el modelo puede abordar problemas de matemáticas y lógica, siendo útil para investigadores que necesitan ayuda con demostraciones o cálculos simbólicos.
- Generación de contenido técnico y científico: puede redactar informes, artículos o resúmenes a partir de datos estructurados, aunque requiere un entorno con recursos muy elevados.
- Prototipado de aplicaciones conversacionales: en entornos de servidor con Apple Silicon, puede servir como backend para chatbots o asistentes virtuales que requieran respuestas coherentes y contextuales, aunque el coste de hardware es prohibitivo para la mayoría de despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye mediciones de divergencia por capa y perplejidad en wikitext-2, que se presentan a continuación como referencia de calidad de la cuantización, pero no son comparables con benchmarks convencionales.

**Divergencia por capa vs bf16** (relativa a la salida de cada capa, menor es mejor):

| Receta | Teacher-forced (media) | Free-running (capa final) | Coseno (final) |
|---|---|---|---|
| 8bit | 0.00685 | 0.13119 | 0.98945 |
| 6bit | 0.01465 | 0.16736 | 0.98389 |
| 5bit | 0.02651 | 0.22521 | 0.97272 |
| 4bit | 0.05161 | 0.35740 | 0.93390 |
| mixed-4_8bit | 0.02524 | 0.24951 | 0.96710 |
| mixed-3_6bit | 0.05242 | 0.42380 | 0.90624 |
| fp8 | 0.01741 | 0.17321 | 0.98320 |

**Perplejidad en wikitext-2** (test, 288.627 tokens en 141 ventanas de 2048) para las builds que caben en una máquina de 512 GB:

| Build | Tamaño | Perplejidad [IC 95%] |
|---|---|---|
| 4bit | 418,6 GB | 2.8636 [2.6681, 3.0714] |
| mixed-4_8bit | 427,8 GB | 2.7420 [2.5533, 2.9477] |
| mixed-3_6bit | 332,6 GB | 3.0338 [2.8366, 3.2386] |
| REAP50-4bit | 214,7 GB | 5.0295 [4.7571, 5.3137] |

La build de 5 bits no pudo evaluarse en perplejidad por no caber en la máquina de 512 GB. Según la model card, la divergencia free-running de 5 bits (0.225) es ligeramente mejor que la de mixed-4_8bit (0.250), pero a costa de 100 GB adicionales.

## Requisitos de hardware

- Tamaño en disco: 511,5 GB.
- RAM necesaria: 768 GB (según la model card, se usaron dos máquinas para la conversión; la inferencia requiere al menos esa cantidad de memoria unificada).
- GPU: no aplica; es una build MLX para Apple Silicon, por lo que requiere un Mac con chip M-series y memoria unificada de al menos 768 GB (solo disponible en configuraciones extremas de Mac Pro o clústeres).
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en la mayoría de servidores con GPUs convencionales.
- Opciones de despliegue: `mlx-lm` con `--trust-remote-code` (el checkpoint incluye el runtime `glm_moe_dsa.py`). También se puede usar el código del repositorio GitHub `PipeNetwork/glm53-mlx`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos de la misma categoría (otros MoE de ~744B cuantizados para MLX) en la información proporcionada. La model card menciona otras cuantizaciones del mismo modelo base, que se comparan en la tabla de perplejidad anterior. Entre ellas, la recomendación del autor para máquinas de 512 GB es la build mixed-4_8bit (427,7 GB), que ofrece mejor perplejidad que la uniforme 4-bit y que la 5-bit (aunque la 5-bit no se pudo medir). No hay comparación con otros modelos como Llama 3.1 405B o Mixtral 8x22B porque no se proporcionan datos.

## Limitaciones y advertencias

- La cuantización 5-bit introduce una degradación medible respecto al modelo bf16 original: el error free-running en la capa final es de 0.22521 y el coseno de 0.97272, lo que puede afectar a tareas que requieren precisión numérica alta.
- No se incluye la capa de multi-token-prediction (capa 78), lo que puede reducir ligeramente la eficiencia en generación.
- El runtime requiere `--trust-remote-code`, lo que implica ejecutar código arbitrario del repositorio; se recomienda auditar el código antes de usarlo en entornos de producción.
- El modelo es extremadamente grande (511,5 GB en disco, 768 GB de RAM), lo que limita su uso a infraestructuras muy específicas y costosas.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad para esta build concreta; el modelo base puede heredar sesgos de sus datos de entrenamiento, pero no se detallan.
- La licencia GLM-5.3 puede tener restricciones de uso comercial; se debe revisar el archivo LICENSE adjunto.
- La longitud de contexto no está especificada; la model card solo indica que los prompts de hasta 2048 tokens no se ven afectados por el problema del indexador, pero no se aclara el máximo soportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-MLX-5bit
- Repositorio GitHub del runtime: https://github.com/PipeNetwork/glm53-mlx
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3
- Documentación oficial de GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Otras cuantizaciones del mismo modelo: [GLM-5.3-MLX-4bit](https://huggingface.co/pipenetwork/GLM-5.3-MLX-4bit), [GLM-5.3-MLX-mixed-4_8bit](https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-4_8bit), [GLM-5.3-MLX-mixed-3_6bit](https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-3_6bit), [GLM-5.3-REAP50-MLX-4bit](https://huggingface.co/pipenetwork/GLM-5.3-REAP50-MLX-4bit)
