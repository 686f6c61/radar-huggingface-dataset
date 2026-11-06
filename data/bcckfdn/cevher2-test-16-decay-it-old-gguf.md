# bcckfdn/cevher2-test-16-decay-it-old-GGUF

## Resumen

cevher2-test-16-decay-it-old-GGUF es la versión cuantizada en formato GGUF del modelo cevher2-test-16-decay-it, desarrollado por el usuario bcckfdn. Se trata de un modelo de generación de texto entrenado desde cero siguiendo la arquitectura SmolLM2 (familia Llama), con 1.513.546.496 parámetros totales, 34 capas y un tamaño de hidden de 1792. El modelo está pensado para conversación y generación de texto en turco e inglés.

El modelo base fue entrenado con 540.672 millones de tokens, según indica la model card del autor, lo que lo sitúa en la liga de los modelos pequeños (1,5B) orientados a despliegue local. La versión publicada en este repositorio ofrece cuatro niveles de cuantización (BF16, Q8_0, Q5_K_M y Q4_K_M) compatibles con llama.cpp, Ollama y LM Studio, lo que facilita su ejecución en hardware de consumo.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeño multilingüe (turco-inglés) con licencia Apache 2.0, poco frecuente en el ecosistema open source; por otro, sirve como ejemplo de modelo de investigación con escasa validación pública (38 descargas, 0 likes), por lo que conviene tratarlo con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama / SmolLM2 |
| Parametros totales | 1.513.546.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolLM2, que a su vez es un transformer decoder-only de estilo Llama. Los datos disponibles indican 34 capas y un tamaño de hidden de 1792, coherentes con un modelo de aproximadamente 1,5B de parámetros. No se dispone de información sobre el número de cabezas de atención, la dimensión de la cabeza, el vocabulario ni el uso de técnicas como GQA, RoPE o atención lineal, por lo que estos detalles se marcan como no disponibles.

El entrenamiento se realizó desde cero (no es un fine-tuning) con 540.672 millones de tokens, según la model card. No se especifica la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni si hubo fases de instrucción o conversación. El sufijo "decay-it-old" en el nombre sugiere una variante de decaimiento de learning rate y una fase de instrucción (it = instruction tuned), pero no hay documentación que lo confirme. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en turco e inglés, con soporte de plantilla de chat (tag `conversational`).
- Razonamiento básico y respuesta a instrucciones, presumiblemente por la variante "it" del nombre, aunque no está documentado.
- Capacidades multilingües limitadas a turco e inglés.
- Compatibilidad con llama.cpp, Ollama y LM Studio para inferencia local.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documenta capacidad de código o matemáticas avanzadas.

## Casos de uso

- Asistente conversacional local en turco: el modelo puede gestionar diálogos multi-turno en turco gracias a su entrenamiento específico en ese idioma, adecuado para prototipos de chatbots en entornos con requisitos de privacidad.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (893 MB), cabe en GPUs de gama baja y en CPU, lo que permite ejecutar un asistente en portátiles o mini-PC sin GPU dedicada.
- Traducción informal turco-inglés: aunque no está entrenado explícitamente para traducción, su bilingüismo permite usarlo en tareas de parafraseo o adaptación de textos entre ambos idiomas.
- Generación de texto creativo en turco: útil para redacción de borradores, descripciones o contenido breve donde no se requiera alta precisión factual.
- Fines educativos y de investigación: sirve como caso de estudio de un modelo pequeño entrenado desde cero con 540.672 M tokens y publicado en abierto, útil para experimentos de cuantización y despliegue.
- Prototipado rápido con Ollama o LM Studio: la disponibilidad de GGUF y de instrucciones de despliegue permite integrar el modelo en demos y pruebas de concepto en minutos.
- Filtrado o clasificación de texto simple en turco: con prompts adecuados, puede usarse para tareas de etiquetado ligero, aunque sin garantías de fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB con Q4_K_M, 1,1 GB con Q5_K_M, 1,6 GB con Q8_0 y 2,9 GB con BF16, sin contar el overhead del contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones pequeñas (GTX 1650, RTX 3050, RTX 4060); para BF16 se recomienda al menos 6 GB (RTX 3060, RTX 4060 Ti). En A100 o H100 funcionaría sin problema, pero está sobredimensionado para este modelo.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones indicadas, incluidas GPUs de gama de entrada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio; también es compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5B, en GPUs de consumo se espera una generación fluida, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cevher2-test-16-decay-it-old | 1,51B | no disponible | tr, en | Apache 2.0 | GGUF en HF |
| SmolLM2-1.7B | 1,71B | 8K (según model card oficial) | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B | 1,54B | 32K (según model card oficial) | multilingüe (incluye tr y en) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B | 1,24B | 128K (según model card oficial) | multilingüe (incluye tr y en) | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se basa en datos públicos de los modelos alternativos; no se dispone de benchmarks del modelo cevher2 para comparar rendimiento real. La principal diferencia es que cevher2 está especializado en turco, mientras que las alternativas son modelos generalistas con mayor validación pública.

## Limitaciones y advertencias

- Modelo de investigación con muy poca validación: 38 descargas y 0 likes en el momento de la ficha, sin benchmarks publicados.
- Riesgo elevado de alucinación y de respuestas incorrectas, especialmente en tareas factuales o de razonamiento complejo.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar conversaciones largas o documentos extensos.
- Idiomas limitados a turco e inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No hay información sobre sesgos, datos de entrenamiento ni procesos de alineación, por lo que no se puede evaluar su seguridad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo sin validación pública se recomienda no usarlo en producción sin una evaluación exhaustiva previa.
- El nombre "old" y "test" sugiere que es una versión obsoleta o de prueba; conviene verificar si existe una versión más reciente del modelo base.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran function calling fiable.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/bcckfdn/cevher2-test-16-decay-it-old-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher2-test-16-decay-it
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
