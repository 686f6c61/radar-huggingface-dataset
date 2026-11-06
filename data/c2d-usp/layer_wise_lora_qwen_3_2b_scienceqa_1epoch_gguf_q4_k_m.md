# c2d-usp/layer_wise_lora_qwen_3_2B_scienceqa_1epoch_GGUF_Q4_K_M

## Resumen

El modelo `c2d-usp/layer_wise_lora_qwen_3_2B_scienceqa_1epoch_GGUF_Q4_K_M` es un ajuste fino mediante LoRA por capas del modelo base Qwen 3 de 2B parámetros, especializado en el dominio de ScienceQA (preguntas y respuestas de ciencia a nivel escolar). Lo desarrolla el usuario `c2d-usp` y se distribuye en formato GGUF con cuantización Q4_K_M, pensado para inferencia local eficiente con llama.cpp y derivados. El repositorio cuenta con 1.720.574.976 parámetros reales según los safetensors del modelo base y un tamaño de 1,9 GB en su versión cuantizada.

El problema que aborda es el de disponer de un modelo pequeño, ligero y especializado en razonamiento científico elemental, que pueda ejecutarse en hardware de consumo sin depender de infraestructura en la nube. Al partir de Qwen 3 2B, hereda una arquitectura transformer moderna con capacidades conversacionales y multilingües, aunque el ajuste LoRA se ha realizado exclusivamente sobre ScienceQA durante una época, lo que restringe su alcance real al dominio entrenado.

La relevancia actual reside en su formato GGUF Q4_K_M, que permite desplegarlo en CPU o GPU de gama baja con un consumo de memoria en torno a 1,3-1,5 GB, y en su licencia Apache 2.0, que facilita el uso comercial y la experimentación. No obstante, la información publicada por el autor es mínima: no hay model card detallada, ni datos de benchmarks, ni idiomas declarados, lo que limita la evaluación rigurosa de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3 2B) con adaptadores LoRA por capas |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio solo publica esta variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion Q4_K_M); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen 3 2B, un transformer decoder-only con atención causal estándar y mecanismos propios de la familia Qwen 3 (no se detalla en la información disponible si incorpora atención lineal o decodificación especulativa). Sobre esta base se aplica un ajuste fino con LoRA configurado por capas (`layer_wise_lora`), lo que sugiere que se entrenaron adaptadores de bajo rango en distintas capas del modelo, presumiblemente con rangos o módulos diferenciados. El entrenamiento se realizó durante una única época sobre el conjunto de datos ScienceQA, un benchmark multimodal de preguntas de ciencia con explicaciones y contexto.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset utilizado (si se empleó solo el split de texto o también imágenes), ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado adicional. Tampoco se documenta la configuración de LoRA (rango, alpha, capas objetivo) ni el proceso de fusión y cuantización a GGUF Q4_K_M. La ausencia de estos datos impide reproducir el entrenamiento o evaluar su calidad de forma independiente.

## Capacidades

- Generación de texto y respuesta a preguntas de ciencia de nivel escolar, derivadas del ajuste sobre ScienceQA.
- Razonamiento de sentido común científico elemental y explicación de conceptos básicos.
- Capacidades conversacionales heredadas de Qwen 3 2B (el tag `conversational` está presente en el repositorio).
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada; podría heredarse parcialmente del modelo base, pero no está documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base Qwen 3 es multilingüe, pero el ajuste LoRA puede haber degradado idiomas distintos del inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en esta variante; aunque ScienceQA es multimodal, el repositorio no indica soporte de imagen.

## Casos de uso

- Tutoría educativa de ciencias: el modelo puede responder preguntas de física, química y biología de nivel escolar, con explicaciones breves, adecuado por su ajuste específico sobre ScienceQA y su bajo coste de inferencia en local.
- Asistente de estudio offline: al ejecutarse en formato GGUF Q4_K_M con ~1,3-1,5 GB de memoria, puede desplegarse en portátiles sin GPU para practicar cuestionarios de ciencia sin conexión.
- Generación de preguntas de evaluación: útil para crear bancos de preguntas de opción múltiple con respuestas y justificaciones, aprovechando el formato de ScienceQA.
- Prototipado rápido de chatbots educativos: su licencia Apache 2.0 y su tamaño reducido permiten integrarlo en demos y pruebas de concepto sin coste de licencia.
- Filtrado y clasificación de contenido científico: puede emplearse para etiquetar o validar preguntas y respuestas en plataformas educativas, aunque con verificación humana.
- Investigación sobre ajuste LoRA por capas: el repositorio sirve como ejemplo reproducible de fine-tuning ligero y cuantización GGUF para estudiar el impacto de LoRA capa a capa en dominios específicos.
- Inferencia en dispositivos de borde: su huella de memoria permite desplegarlo en Raspberry Pi o mini-PC con llama.cpp para aplicaciones educativas embebidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB con cuantización Q4_K_M (tamaño del repo 1,9 GB, que incluye overhead); en CPU requiere ~2 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1650, RTX 3050, RTX 4060; también funciona en CPU moderna (AVX2) con llama.cpp.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales, incluidas las integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, pero en CPU se esperan decenas de tokens por segundo y en GPU de gama baja cientos, sin datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| c2d-usp/layer_wise_lora_qwen_3_2B_scienceqa_1epoch_GGUF_Q4_K_M | 1,72 B | no disponible | Apache 2.0 | GGUF Q4_K_M | ScienceQA (ciencia escolar) |
| Qwen 3 2B (base) | ~2 B | no disponible en la informacion | Apache 2.0 | safetensors, GGUF | Generalista |
| Phi-3-mini (3,8 B) | 3,8 B | 4K-128K según variante | MIT | safetensors, GGUF | Generalista, razonamiento |
| TinyLlama 1.1B | 1,1 B | 2K | Apache 2.0 | safetensors, GGUF | Generalista |

La comparativa es orientativa: no hay datos de rendimiento publicados para el modelo ajustado, por lo que no puede establecerse una comparación cuantitativa con las alternativas. Frente a Qwen 3 2B base, este modelo sacrifica generalidad por especialización en ScienceQA; frente a Phi-3-mini, es más pequeño y ligero pero con menor contexto documentado; frente a TinyLlama, ofrece más parámetros y una especialización clara, aunque sin benchmarks que lo respalden.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre ScienceQA, puede reflejar sesgos del dataset y del modelo base Qwen 3.
- Riesgo de alucinación: elevado en preguntas fuera del dominio de ScienceQA o cuando se le pide razonamiento avanzado; el ajuste de una época sobre un dataset específico no garantiza robustez.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada y los idiomas soportados no se especifican; el ajuste LoRA puede haber degradado el multilingüismo del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen 3 y del dataset ScienceQA, que pueden tener términos adicionales.
- Caveat para producción: la model card es prácticamente inexistente (solo la licencia), no hay benchmarks ni evaluación independiente, y el repositorio tiene muy pocas descargas (76) y ningún like, lo que indica falta de validación comunitaria.
- Al ser una cuantización Q4_K_M, existe una pérdida de precisión respecto al modelo en safetensors; no se documenta la degradación medida.

## Enlaces

- Hugging Face: https://huggingface.co/c2d-usp/layer_wise_lora_qwen_3_2B_scienceqa_1epoch_GGUF_Q4_K_M
- Modelo base Qwen 3 2B: no disponible en la información proporcionada
- Dataset ScienceQA: no disponible en la información proporcionada
- Paper de LoRA: no disponible en la información proporcionada
- Repositorio llama.cpp: no disponible en la información proporcionada
