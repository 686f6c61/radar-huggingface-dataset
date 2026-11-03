# lim1t/Qwen3.5-0.8B-wsp-reproduction-p10c

## Resumen

Qwen3.5-0.8B-wsp-reproduction-p10c es una reproducción de pesos del modelo Qwen/Qwen3.5-0.8B realizada por el usuario lim1t mediante la técnica de weight-space programming (WSP), un método que edita directamente tensores del modelo en lugar de entrenarlo. El resultado es un checkpoint de 873.438.784 parámetros que conserva la arquitectura multimodal original (pipeline image-text-to-text) y los pesos de visión sin modificar, aplicando únicamente cambios sobre tensores nombrados del modelo de texto.

El modelo es relevante como artefacto de investigación reproducible: cada tensor editado superó las comprobaciones SHA256 base y editada contra el manifiesto upstream, y 72.986.982 valores BF16 difieren del modelo base. La generación de texto corto funcionó en una RTX 2080 SUPER con Transformers en BF16. No obstante, el propio autor advierte que no existe una evaluación independiente de precisión en benchmarks y que esto no constituye una afirmación de mejora de rendimiento medida.

Se distribuye bajo licencia Apache-2.0, con parches y logs bajo CC BY 4.0 y scripts de reconstrucción bajo MIT. El número "p10c" hace referencia al presupuesto de forward passes del editor, no a una época de entrenamiento. No se realizó entrenamiento ni descubrimiento de nuevas ediciones durante la reconstrucción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), pesos de texto editados por weight-space programming; pesos de visión sin modificar |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (verificado en BF16 con Transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (parches/logs CC BY 4.0; scripts de reconstrucción MIT) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, revisión `2fc06364715b967f1860aea9cf38778875588b17`, y conserva su arquitectura multimodal original, incluyendo los pesos de visión sin editar. La modificación se limita a tensores nombrados del modelo de texto, aplicados mediante el parche p10c publicado por el equipo de investigación (Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab). No hubo entrenamiento ni RLHF/DPO: la técnica de weight-space programming edita directamente el espacio de pesos, con un presupuesto de forward passes del editor (p10c) en lugar de épocas de entrenamiento.

La verificación es explícita: cada tensor editado pasó las comprobaciones SHA256 base y editada contra el manifiesto upstream, y se documentan 72.986.982 valores BF16 diferentes respecto al modelo base. El comportamiento de visión no ha sido evaluado. El protocolo de evaluación planificado para MATH-500 usa Transformers en BF16 (no el motor vLLM de los autores), con thinking habilitado, temperatura 0.6, top_p 0.95, top_k 20, penalización de presencia de tokens generados de 1.5, 32768 tokens nuevos máximos y cuatro respuestas por problema.

## Capacidades

- Generación de texto conversacional (verificada con generación de texto corto en RTX 2080 SUPER, BF16, Transformers).
- Procesamiento image-text-to-text heredado de la arquitectura Qwen3.5 (pesos de visión presentes pero no evaluados).
- Razonamiento con modo thinking habilitable (usado en el protocolo de evaluación MATH-500 planificado).
- Edición de pesos verificable criptográficamente (SHA256 por tensor) como capacidad de investigación reproducible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de weight-space programming: el checkpoint permite verificar de forma independiente el parche p10c comparando los 72.986.982 valores BF16 modificados contra el manifiesto upstream, con comprobaciones SHA256 por tensor.
- Investigación sobre edición de pesos sin entrenamiento: sirve como caso de estudio para analizar cómo afecta la modificación de tensores de texto al comportamiento del modelo sin tocar los pesos de visión.
- Evaluación comparativa de metodologías de edición: al conservar la arquitectura y los pesos de visión originales, permite aislar el efecto de los cambios en el modelo de texto frente al base Qwen3.5-0.8B.
- Validación de pipelines de reconstrucción: los scripts MIT y los logs CC BY 4.0 permiten reproducir el proceso completo en entornos con Transformers y GPUs de gama consumer como la RTX 2080 SUPER.
- Pruebas de generación de texto en hardware modesto: con 873 millones de parámetros y pesos safetensors de 1,8 GB, es viable ejecutar generación corta en GPUs consumer para experimentos de laboratorio.
- Auditoría de licencias y atribución en modelos derivados: el repositorio documenta la cadena de procedencia (Qwen Apache-2.0, parches CC BY 4.0, scripts MIT) y sirve como referencia para publicar derivados con atribución correcta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la precisión independiente en benchmarks aún no está disponible y que no se reclama ninguna mejora de rendimiento medida. La evaluación local de MATH-500 está planificada pero no completada, y el motor y la implementación de RNG difieren de los del paper original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en BF16 para los pesos (tamaño del repo), más overhead de activaciones y contexto; no se proporcionan cifras oficiales.
- GPU verificada por el autor: RTX 2080 SUPER, con Transformers en BF16 para generación de texto corto.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU consumer con al menos 8 GB de VRAM debería poder cargar los pesos en BF16.
- Cabe en GPU consumer: sí, según la verificación del autor en RTX 2080 SUPER.
- Opciones de despliegue: Transformers (verificado). vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible; el autor señala que su protocolo de evaluación usa Transformers y no el motor vLLM de los autores originales.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B-wsp-reproduction-p10c | 873.438.784 | no disponible | Apache-2.0 | Reproducción WSP con 72.986.982 valores BF16 modificados; sin benchmark independiente |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | Apache-2.0 | Modelo base original; arquitectura multimodal completa sin editar |
| Alternativas de ~1B parámetros | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No existe evaluación independiente de precisión en benchmarks; el autor no reclama mejora de rendimiento medida.
- El comportamiento de visión no ha sido evaluado, pese a conservar los pesos multimodales originales.
- Solo se ha verificado generación de texto corto; no hay datos sobre contextos largos, tool calling ni agentes.
- Los idiomas soportados no están documentados en la información disponible.
- La evaluación MATH-500 planificada usa Transformers BF16 en lugar del motor vLLM de los autores, con diferencias de motor y RNG respecto al paper, lo que limita la comparabilidad directa.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base Qwen3.5-0.8B.
- Uso comercial permitido por Apache-2.0, pero deben preservarse la licencia upstream y la atribución; los parches/logs son CC BY 4.0 y los scripts MIT, con condiciones propias.
- El número "p10c" es el presupuesto de forward passes del editor, no una época de entrenamiento; no debe interpretarse como magnitud de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lim1t/Qwen3.5-0.8B-wsp-reproduction-p10c
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Parche y código de reconstrucción: https://github.com/RikiyaT/lm_understand-logs/tree/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp8_math/runs/p10c/edit
- Blog de weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
