# lim1t/Qwen3.5-0.8B-wsp-reproduction-p25c

## Resumen

Qwen3.5-0.8B-wsp-reproduction-p25c es una reproducción de pesos del modelo Qwen/Qwen3.5-0.8B publicada por el usuario lim1t en HuggingFace. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es una reconstrucción de un subconjunto de tensores del modelo base aplicando un parche publicado dentro del marco de investigación denominado "weight-space programming" (programación en el espacio de pesos), desarrollado por Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab. El parche p25c modifica 262.144 valores en BF16 del modelo de texto y conserva intacta la arquitectura multimodal original, incluidos los pesos de visión.

El modelo base Qwen3.5-0.8B es un modelo multimodal de tipo image-text-to-text con aproximadamente 873 millones de parámetros (873.438.784 según los safetensors), licencia Apache-2.0 y librería transformers. Esta reproducción hereda esa arquitectura y ese tamaño, y su interés radica en que permite verificar de forma independiente el efecto de una edición quirúrgica de pesos sobre un modelo pequeño, sin reentrenamiento. Es relevante para investigadores que estudian interpretabilidad, edición de modelos y métodos de mejora sin entrenamiento.

La model card es explícita sobre el alcance: no se ha realizado entrenamiento ni descubrimiento de nuevas ediciones, todos los tensores editados pasaron comprobaciones SHA256 contra el manifiesto upstream, y la generación de texto corta funcionó en una RTX 2080 SUPER con Transformers en BF16. No hay resultados de benchmarks independientes publicados, por lo que no se reclama ninguna mejora de rendimiento medida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos de capas no disponibles |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la verificación se hizo en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un modelo multimodal que procesa imagen y texto y genera texto, con torre de visión y modelo de lenguaje. Esta reproducción no altera esa estructura: conserva la arquitectura multimodal original y los pesos de visión sin editar, y solo modifica tensores nombrados del modelo de texto. El número total de parámetros (873.438.784) coincide con el del modelo base declarado.

No hubo entrenamiento. El proceso consistió en aplicar el parche p25c publicado, que cambia 262.144 valores en BF16 respecto al modelo base, y verificar cada tensor editado con comprobaciones SHA256 tanto del valor base como del editado contra el manifiesto upstream. El número "p25c" hace referencia al presupuesto de pases forward del editor, no a una época de entrenamiento. La model card indica que la evaluación MATH-500 planificada se hará con Transformers en BF16 (no con el motor vLLM de los autores), con thinking activado, temperatura 0.6, top_p 0.95, top_k 20, penalización de presencia de 1.5, 32.768 tokens nuevos máximos y cuatro respuestas por problema; el motor y la implementación de RNG difieren del paper, y no se reclama ninguna puntuación local antes de completarla.

## Capacidades

- Generación de texto conversacional: la model card confirma que la generación de texto corta funciona en Transformers BF16.
- Procesamiento de imagen y texto (pipeline image-text-to-text): la arquitectura multimodal se conserva, aunque el comportamiento de visión no ha sido evaluado.
- Razonamiento con modo thinking: el protocolo de evaluación planificado activa el modo thinking del modelo base.
- Razonamiento matemático: el objetivo declarado de la reproducción es la evaluación en MATH-500, lo que sugiere uso previsto en problemas matemáticos.
- Herencia de capacidades del modelo base Qwen3.5-0.8B: al conservar la arquitectura y la mayor parte de los pesos, se esperan las capacidades del base, pero no están verificadas de forma independiente en esta reproducción.
- Tool calling, function calling, agentes y multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Investigación en edición de pesos: reproducir el parche p25c sobre el modelo base para estudiar cómo un cambio de 262.144 valores BF16 afecta al comportamiento, con verificación SHA256 tensor a tensor.
- Validación independiente de resultados: ejecutar la evaluación MATH-500 planificada con Transformers BF16 en lugar del motor vLLM de los autores para comprobar si las conclusiones del paper se sostienen con otra implementación.
- Experimentos de interpretabilidad: comparar activaciones y salidas entre el modelo base y esta reproducción para localizar el efecto funcional de los tensores editados.
- Docencia y divulgación: usar un modelo de 873 millones de parámetros que cabe en una GPU de consumo (verificado en RTX 2080 SUPER) para explicar técnicas de programación en el espacio de pesos.
- Reproducibilidad de artefactos de investigación: servir como referencia verificable de que el parche publicado se aplica de forma determinista sobre la revisión concreta `2fc06364715b967f1860aea9cf38778875588b17`.
- Pruebas de pipelines multimodales: al conservar la torre de visión, sirve para probar infraestructura image-text-to-text con un checkpoint pequeño y ligero (repo de 1,8 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la precisión de benchmarks independientes aún no está disponible y que no se reclama ninguna mejora de rendimiento medida. La única verificación empírica reportada es que la generación de texto corta funciona en una RTX 2080 SUPER con Transformers BF16.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,75 GB solo para pesos (873,4 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; el repo ocupa 1,8 GB.
- GPU verificada: RTX 2080 SUPER (8 GB), suficiente para BF16 según la model card.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más para BF16; para cuantización a 8 bits o 4 bits el requisito baja, aunque no se documentan tipos de cuantización soportados.
- Cabe en GPU de consumo: sí, confirmado en RTX 2080 SUPER.
- Opciones de despliegue: Transformers (verificado). vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible; el autor señala que el motor de los autores del paper es vLLM, pero la reproducción se validó con Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| lim1t/Qwen3.5-0.8B-wsp-reproduction-p25c | 873.438.784 | no disponible | Apache-2.0 | Reproducción de pesos, sin benchmarks | 262.144 valores BF16 editados |
| Qwen/Qwen3.5-0.8B | 873.438.784 (según base declarado) | no disponible | Apache-2.0 | Modelo base original | Referencia upstream de la reproducción |
| Otros modelos de ~0,8 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación relevante es con el propio modelo base: esta reproducción difiere en 262.144 valores BF16 y conserva visión y arquitectura. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- No hay benchmarks independientes: la model card declara que la precisión en benchmarks aún no está disponible y que no se reclama mejora de rendimiento.
- El comportamiento de visión no ha sido evaluado, pese a conservar los pesos de visión sin editar.
- La evaluación MATH-500 está planificada, no completada; además, el motor (Transformers frente a vLLM) y el RNG difieren del paper, lo que limita la comparabilidad directa.
- Es una reproducción, no un modelo entrenado: no incorpora datos nuevos ni RLHF/DPO; cualquier capacidad proviene del base más la edición de pesos.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base, no documentados aquí.
- Riesgo de alucinación: no cuantificado; aplicable el del modelo base, sin evaluación específica.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar cobertura multilingüe o conversaciones de contexto largo.
- Licencia: Apache-2.0 permite uso comercial, pero deben preservarse la licencia upstream y la atribución; los parches y logs publicados son CC BY 4.0 y los scripts de reconstrucción, MIT.
- Reproducibilidad ligada a la revisión `2fc06364715b967f1860aea9cf38778875588b17` del modelo base; usar otra revisión puede invalidar las comprobaciones SHA256.
- Popularidad nula en HuggingFace (0 descargas, 0 likes) y sin validación de la comunidad: no debe tratarse como artefacto listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lim1t/Qwen3.5-0.8B-wsp-reproduction-p25c
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Parche y código de reconstrucción: https://github.com/RikiyaT/lm_understand-logs/tree/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp8_math/runs/p25c/edit
- Blog de weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
