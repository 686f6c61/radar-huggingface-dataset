# Ilirt/datapilot-tiny-aya-sql-sft-extra

## Resumen

Ilirt/datapilot-tiny-aya-sql-sft-extra es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario Ilirt, entrenado mediante ajuste fino supervisado (SFT) sobre el modelo base CohereLabs/tiny-aya-global. Por el nombre del repositorio, el adaptador está orientado a la generación de SQL, aunque la model card no documenta explícitamente la tarea, los datos ni los hiperparámetros de entrenamiento. El repositorio tiene un tamaño de 0,1 GB, coherente con un adaptador LoRA de pequeño tamaño que no incluye los pesos completos del modelo base.

El modelo base, tiny-aya-global, forma parte de la familia Aya de Cohere Labs, centrada en cobertura multilingüe. Sin embargo, la información disponible sobre este adaptador concreto es mínima: la model card es una plantilla sin rellenar, con la mayoría de campos marcados como "More Information Needed", y no se especifican licencia, idiomas soportados ni detalles de entrenamiento. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

La relevancia de esta ficha es, por tanto, limitada y descriptiva: se trata de un artefacto de experimentación de un autor individual, útil como referencia de cómo se publica un adaptador LoRA sobre tiny-aya, pero sin garantías documentales para uso en producción. Cualquier evaluación rigurosa requeriría inspeccionar los archivos del adaptador y ejecutar pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base CohereLabs/tiny-aya-global) |
| Parámetros totales | no disponible (el adaptador ocupa 0,1 GB; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización aplicable dependería del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT (supervised fine-tuning) sobre el modelo base CohereLabs/tiny-aya-global, según los tags del repositorio (`lora`, `sft`, `transformers`, `trl`, `peft`). La model card no aporta información sobre la arquitectura interna del modelo base, el número de tokens de entrenamiento, la composición del dataset, el régimen de precisión (fp16, bf16, etc.) ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se documentan hiperparámetros del adaptador (rango, alpha, dropout) ni la estrategia de enmascaramiento de la pérdida.

El nombre del repositorio sugiere que el ajuste fino se orientó a la generación de consultas SQL, probablemente sobre un conjunto de datos de tipo text-to-SQL, pero esta inferencia no está confirmada por la documentación. La única referencia técnica explícita en la model card es la cita a Lacoste et al. (2019) sobre el cálculo de emisiones de carbono, que forma parte de la plantilla estándar de Hugging Face y no aporta información sobre el entrenamiento real. No se han publicado detalles sobre la innovación técnica ni sobre el procedimiento de entrenamiento.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y el tag `conversational`.
- Generación de SQL: el nombre del repositorio indica una especialización en consultas SQL, aunque no se documenta el alcance ni la calidad esperada.
- Ajuste fino mediante LoRA: el adaptador debe combinarse con el modelo base CohereLabs/tiny-aya-global para su uso.
- Soporte multilingüe: no confirmado para el adaptador; dependería de las capacidades del modelo base, no documentadas en esta ficha.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con text-to-SQL: el adaptador puede cargarse sobre tiny-aya-global para probar la generación de consultas SQL en entornos de desarrollo, comparando su salida con la del modelo base sin ajustar. Es adecuado por su bajo coste de almacenamiento (0,1 GB) y por la facilidad de integrarlo con la librería PEFT.
- Prototipado de asistentes de bases de datos: en un pipeline de demostración, el adaptador podría recibir un esquema de tabla y una pregunta en lenguaje natural para producir una consulta candidata, siempre con validación humana posterior.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo reproducible de un SFT con LoRA sobre un modelo pequeño multilingüe, útil para estudiar el impacto del adaptador frente al modelo base.
- Evaluación comparativa de adaptadores: al ser un artefacto pequeño, puede integrarse en un banco de pruebas que compare varios adaptadores SQL sobre el mismo modelo base.
- Generación de consultas en entornos de baja latencia: al no requerir cargar pesos adicionales significativos, el adaptador puede desplegarse junto al modelo base en GPUs de gama media, aunque el rendimiento real no está documentado.
- Docencia y formación: como ejemplo de publicación de un adaptador PEFT con model card incompleta, útil para enseñar buenas prácticas de documentación y evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; dependería del modelo base tiny-aya-global, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del adaptador (0,1 GB) es reducido, pero el modelo base determina el requisito real de memoria.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` + `peft`; el despliegue con vLLM, llama.cpp, Ollama o TGI no está documentado para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ilirt/datapilot-tiny-aya-sql-sft-extra | no disponible (adaptador LoRA de 0,1 GB) | no disponible | no disponible | no disponible | Hugging Face |
| CohereLabs/tiny-aya-global (modelo base) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Hugging Face |
| Otros adaptadores SQL sobre tiny-aya | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay información sobre sesgos, riesgos, datos de entrenamiento ni evaluación.
- Riesgo de alucinación: no evaluado; en tareas SQL, una consulta generada incorrectamente puede producir resultados erróneos o fallos en la base de datos.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base y no se especifican.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial ni la redistribución.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- No se documentan los hiperparámetros del adaptador ni el procedimiento de entrenamiento, lo que impide reproducir los resultados.
- Para producción, sería necesario validar el adaptador con un conjunto de pruebas propio y revisar la licencia del modelo base antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/Ilirt/datapilot-tiny-aya-sql-sft-extra
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
