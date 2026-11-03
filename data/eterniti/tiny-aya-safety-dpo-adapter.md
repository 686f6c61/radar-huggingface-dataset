# Eterniti/tiny-aya-safety-dpo-adapter

## Resumen

Eterniti/tiny-aya-safety-dpo-adapter es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base CohereLabs/tiny-aya-earth. Lo desarrolla el usuario Eterniti y se publica como un adaptador PEFT que no contiene pesos completos del modelo, sino únicamente los deltas de bajo rango necesarios para aplicar la alineación de preferencias sobre la base. El objetivo declarado en el nombre es la alineación de seguridad, es decir, ajustar el comportamiento del modelo base hacia respuestas preferidas en materia de seguridad.

El modelo base, tiny-aya-earth, pertenece a la familia Aya de Cohere Labs, orientada a cobertura multilingüe amplia con un tamaño reducido. El adaptador se entrenó con TRL 1.7.1 y PEFT 0.21.2 sobre Transformers 5.22.0, lo que sitúa el stack de entrenamiento en versiones muy recientes. El repositorio ocupa 0,1 GB, coherente con un adaptador LoRA de pequeño tamaño y no con un modelo completo.

La relevancia de esta ficha es limitada y hay que ser explícito: se trata de un adaptador sin descargas ni likes en el momento de la consulta, sin model card detallada (la sección de procedimiento de entrenamiento está vacía), sin licencia declarada y sin resultados de evaluación publicados. Es útil como ejemplo de flujo DPO sobre un modelo pequeño multilingüe, pero no debe considerarse un artefacto listo para producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer del modelo base CohereLabs/tiny-aya-earth |
| Parámetros totales | no disponible (el adaptador ocupa 0,1 GB; los parámetros del base no se detallan en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (al ser un adaptador, la cuantización aplica al modelo base; no se documenta) |
| Idiomas soportados | no disponible (el modelo base Aya es multilingüe, pero el adaptador no declara idiomas) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre CohereLabs/tiny-aya-earth, un transformer de la familia Aya de Cohere Labs. El entrenamiento se realizó con DPO, el método descrito en Rafailov et al. (2023), que optimiza directamente el modelo de política frente a pares de respuestas preferidas y rechazadas sin entrenar un modelo de recompensa separado. La integración se hizo con TRL 1.7.1 y PEFT 0.21.2.

La información disponible no detalla el dataset de preferencias, el número de pasos, la tasa de aprendizaje, el rango LoRA ni la composición de los pares preferidos/rechazados: la sección "Training procedure" de la model card está vacía. Tampoco se documenta si hubo una fase previa de SFT. Por tanto, no es posible verificar qué criterios de seguridad se optimizaron ni con qué datos.

## Capacidades

- Generación de texto conversacional, heredada del modelo base tiny-aya-earth.
- Alineación de preferencias orientada a seguridad mediante DPO, según el nombre del adaptador; el alcance concreto de esa alineación no está documentado.
- Soporte multilingüe potencial heredado de la familia Aya; el adaptador no declara idiomas específicos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Experimentación con DPO sobre modelos pequeños: el adaptador sirve como referencia práctica para reproducir un pipeline TRL + PEFT sobre tiny-aya-earth, inspeccionando los pesos LoRA y el flujo de entrenamiento.
- Investigación en alineación de seguridad en modelos compactos: permite estudiar cómo un ajuste DPO modifica las respuestas del base en escenarios sensibles, siempre con una evaluación propia previa.
- Base para comparativas de adaptadores: al ser un LoRA pequeño (0,1 GB), se puede cargar y descargar rápidamente para comparar su comportamiento frente al modelo base sin adaptador.
- Prototipado de asistentes conversacionales multilingües de bajo coste: combinado con tiny-aya-earth, el conjunto puede desplegarse en hardware modesto para pruebas internas de conversación.
- Filtrado y moderación de contenido en fase de investigación: si la evaluación confirma que el DPO mejora el rechazo de peticiones dañinas, podría usarse como capa de moderación en prototipos, nunca en producción sin validación.
- Docencia y formación: útil para explicar de forma tangible la diferencia entre un modelo base y un adaptador de preferencias, y para ilustrar los riesgos de publicar artefactos sin model card ni evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB y requiere cargar además el modelo base CohereLabs/tiny-aya-earth; la VRAM total depende de ese base, cuyo tamaño no se detalla en la información proporcionada.
- Al tratarse de un modelo de la familia "tiny", es plausible que quepa en GPU de consumo, pero no hay datos confirmados en la información disponible.
- GPU recomendadas: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con Transformers + PEFT; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada y depende de la conversión del adaptador y del soporte del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eterniti/tiny-aya-safety-dpo-adapter | Adaptador LoRA DPO sobre tiny-aya-earth | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| CohereLabs/tiny-aya-earth (base) | Modelo completo | no disponible en esta ficha | no disponible | no disponible | HuggingFace (referenciado como base) |
| Adaptadores DPO de la comunidad sobre modelos pequeños | Adaptador LoRA DPO | variable | variable | variable | HuggingFace |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks ni métricas de seguridad que respalden la alineación declarada en el nombre.
- Model card incompleta: la sección de procedimiento de entrenamiento está vacía y no se especifican datos, hiperparámetros ni criterios de selección de preferencias.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue.
- Riesgo de alucinación heredado del modelo base, no cuantificado para este adaptador.
- Sesgos desconocidos: al no documentarse el dataset de preferencias, no es posible evaluar qué sesgos se han introducido o mitigado.
- Idiomas no declarados: aunque el base sea multilingüe, el adaptador podría degradar el rendimiento en lenguas no representadas en sus datos de preferencias.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validación por parte de la comunidad.
- El código de ejemplo de la model card usa `model="None"`, por lo que no es directamente ejecutable sin sustituir la ruta por el identificador del adaptador y del base.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Eterniti/tiny-aya-safety-dpo-adapter
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
- Paper de DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
