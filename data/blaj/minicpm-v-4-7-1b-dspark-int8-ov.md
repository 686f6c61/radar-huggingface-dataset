# blaj/MiniCPM-V-4.7-1B-DSpark-int8-ov

## Resumen

MiniCPM-V-4.7-1B-DSpark-int8-ov es una exportación a OpenVINO en precisión INT8 del modelo openbmb/MiniCPM-V-4.7-1B-DSpark, publicada por el usuario blaj. Se trata de un artefacto de despliegue más que de un modelo entrenado desde cero: el autor ha tomado los pesos originales de OpenBMB (verificando su SHA-256 antes de la exportación) y los ha convertido mediante Optimum Intel al formato OpenVINO para su ejecución optimizada en hardware Intel, principalmente CPU y GPU integradas.

El modelo base pertenece a la familia MiniCPM-V, orientada a tareas multimodales (comprensión de imagen y texto) con un tamaño reducido de aproximadamente 1.000 millones de parámetros. La variante DSpark incorpora un mecanismo de decodificación especulativa (draft model) que se empareja con un modelo objetivo INT8 para acelerar la generación. Este repositorio concreto contiene únicamente el modelo borrador (draft) en INT8, pensado para usarse junto al target INT8 y al draft FP16 publicados por el mismo autor.

Su relevancia es acotada pero práctica: permite ejecutar un modelo multimodal pequeño con aceleración especulativa sobre OpenVINO GenAI en entornos Intel sin GPU dedicada de gran tamaño. No obstante, la model card advierte de que la inferencia de imagen no fue verificada y de que solo se validó un smoke test de generación de texto en GPU, por lo que su madurez para producción es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM-V) con bloques de atención lineal; incluye cabecera Markov para decodificación especulativa. Detalle completo no disponible |
| Parámetros totales | ~1B (según nomenclatura del modelo base); cifra exacta no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 (exportación OpenVINO) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportado con Optimum Intel); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V-4.7-1B-DSpark es un transformer multimodal de aproximadamente 1.000 millones de parámetros. La model card de esta exportación menciona explícitamente la presencia de 17 bloques de atención lineal, lo que sugiere una arquitectura híbrida que combina atención estándar con atención lineal para reducir el coste computacional en contextos largos. La variante DSpark añade un mecanismo de decodificación especulativa basado en una cabecera Markov, que actúa como modelo borrador para proponer tokens que el modelo objetivo verifica después.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta exportación no los detalla y remite a la del modelo original de OpenBMB. La innovación técnica destacable de este artefacto es la exportación a OpenVINO con verificación de integridad de los pesos fuente (SHA-256) y la configuración recomendada de decodificación especulativa: 15 tokens de asistente, caché KV en f16 y ejecución en GPU con OpenVINO GenAI 2027.0.0.0.dev20261119.

Cabe señalar una limitación documentada por el propio autor: el exportador estándar de drafts exporta la cabecera Markov, pero no los tensores de la cabecera de confianza del checkpoint original.

## Capacidades

- Generación de texto: el repositorio está etiquetado con el pipeline `text-generation` y se validó con un smoke test de generación de texto en GPU.
- Decodificación especulativa: actúa como modelo borrador (draft) emparejado con el target INT8 para acelerar la inferencia.
- Capacidades multimodales: el modelo base MiniCPM-V es multimodal, pero la model card indica explícitamente que la inferencia de imagen no fue verificada en esta exportación.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en el repositorio.

## Casos de uso

- Despliegue en equipos Intel sin GPU dedicada: la exportación OpenVINO INT8 permite ejecutar el modelo en CPU o GPU integrada Intel mediante OpenVINO GenAI, aprovechando las optimizaciones específicas del runtime para este hardware.
- Aceleración de inferencia con decodificación especulativa: emparejado con el target INT8 y el draft FP16 del mismo autor, sirve para reducir la latencia de generación en aplicaciones interactivas de texto.
- Prototipado de asistentes conversacionales ligeros: con ~1B de parámetros, el modelo es adecuado para pruebas de concepto de chatbots en entornos con recursos limitados, siempre que se acepte la falta de validación exhaustiva.
- Evaluación de pipelines OpenVINO GenAI: útil para desarrolladores que quieran probar la versión 2027.0.0.0.dev20261119 del runtime y la configuración de 17 bloques de atención lineal y 15 tokens de asistente.
- Investigación sobre decodificación especulativa: permite experimentar con la cabecera Markov como draft en un modelo pequeño y comparar la paridad greedy con el target, aunque el autor advierte de que la paridad varía según el prompt.
- Integración en aplicaciones de texto en el borde (edge): el tamaño reducido del repositorio (0.3 GB) facilita su distribución en dispositivos con almacenamiento limitado, aunque la inferencia multimodal no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que la precisión superó un smoke test de generación de texto en GPU y que la velocidad y la paridad greedy varían según el prompt, sin aportar cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas; al tratarse de un modelo de ~1B en INT8, la huella de pesos ronda los 0.3 GB del repositorio, aunque el consumo real en ejecución (caché KV en f16 y buffers del runtime) no está documentado.
- GPU recomendadas: la model card indica ejecución en GPU con OpenVINO GenAI; no se especifican modelos concretos de GPU Intel ni de otras marcas.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el enfoque OpenVINO sugiere GPU integradas Intel, pero no se detalla.
- Opciones de despliegue: OpenVINO GenAI 2027.0.0.0.dev20261119 con `KV_CACHE_PRECISION="f16"`, 17 bloques de atención lineal y 15 tokens de asistente. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo señala que la velocidad varía según el prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-DSpark-int8-ov (este) | ~1B | No disponible | Apache 2.0 | OpenVINO IR INT8 | Draft para decodificación especulativa; imagen no verificada |
| openbmb/MiniCPM-V-4.7-1B-DSpark (base) | ~1B | No disponible | Apache 2.0 | Pesos originales | Modelo fuente; incluye cabecera de confianza completa |
| blaj/MiniCPM-V-4.7-1B-int8-ov (target) | ~1B | No disponible | Apache 2.0 | OpenVINO IR INT8 | Modelo objetivo para emparejar con este draft |
| blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov (draft FP16) | ~1B | No disponible | Apache 2.0 | OpenVINO IR FP16 | Variante de mayor precisión del mismo draft |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Inferencia de imagen no verificada: pese a que el modelo base es multimodal, el autor confirma que no se probó la inferencia de imagen en esta exportación.
- Validación limitada: solo se realizó un smoke test de generación de texto en GPU; no hay pruebas exhaustivas de calidad ni de robustez.
- Paridad greedy variable: la coincidencia con el modelo objetivo depende del prompt, lo que puede afectar a la reproducibilidad.
- Cabecera de confianza incompleta: el exportador estándar no exporta los tensores de la cabecera de confianza del checkpoint, solo la cabecera Markov.
- Dependencia de una versión de desarrollo: requiere OpenVINO GenAI 2027.0.0.0.dev20261119, una build de desarrollo que puede cambiar sin aviso.
- Idiomas no declarados: se desconoce el soporte multilingüe real de esta exportación.
- Sin datos de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia y la model card del modelo base de OpenBMB para atribución y condiciones adicionales.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero inherentes a modelos de este tamaño.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blaj/MiniCPM-V-4.7-1B-DSpark-int8-ov
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-DSpark
- Target INT8 companion: https://huggingface.co/blaj/MiniCPM-V-4.7-1B-int8-ov
- Draft FP16 companion: https://huggingface.co/blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Optimum Intel: https://github.com/huggingface/optimum-intel
