# mradermacher/herbalism_v2-GGUF

## Resumen

`mradermacher/herbalism_v2-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `z3n7r4ck3r/herbalism_v2`, publicada por el usuario mradermacher el 25 de diciembre de 2024. No se trata de un modelo entrenado por mradermacher, sino de una conversión y cuantización del modelo base original para facilitar su ejecución en entornos con recursos limitados mediante llama.cpp y herramientas compatibles con GGUF.

El modelo base cuenta con aproximadamente 494 millones de parámetros (494.032.768 según los pesos en safetensors), lo que lo sitúa en la categoría de modelos pequeños, aptos para ejecución en CPU y GPUs de consumo. La model card del repositorio no aporta información sobre arquitectura específica, datos de entrenamiento, longitud de contexto ni proceso de alineación (RLHF/DPO), por lo que muchos detalles técnicos quedan como no disponibles.

La relevancia de esta ficha radica en que permite evaluar rápidamente la disponibilidad de cuantizaciones GGUF de un modelo conversacional en inglés, con un rango de cuantizaciones que va desde Q2_K (0,4 GB) hasta f16 (1,1 GB), lo que facilita su despliegue en hardware modesto. No obstante, la ausencia de benchmarks, de licencia declarada y de documentación técnica detallada limita seriamente su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE, según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `z3n7r4ck3r/herbalism_v2` en la documentación proporcionada. El recuento de parámetros (494 millones) sugiere un transformer de pequeña escala, pero no se confirma el tipo exacto de arquitectura (transformer denso, MoE, SSM o híbrida). Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La model card del repositorio GGUF se limita a describir el proceso de cuantización: cuantizaciones estáticas generadas con `quantize_version: 2` y `output_tensor_quantised: 1`, sin cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicación. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Compatibilidad con el ecosistema `transformers` y con el formato GGUF para inferencia local.
- Etiqueta `endpoints_compatible`, lo que indica que puede desplegarse mediante endpoints compatibles con la API de Hugging Face.
- Soporte multilingüe limitado al inglés (`language: en`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento extendido.
- No se documentan capacidades específicas de código, matemáticas o razonamiento formal.

## Casos de uso

- Prototipado conversacional en local: el modelo puede ejecutarse en CPU o GPU de gama baja gracias a sus cuantizaciones de 0,4 a 1,1 GB, lo que permite probar flujos de chat en inglés sin infraestructura dedicada.
- Experimentación educativa con GGUF: útil para aprender a cargar modelos cuantizados en llama.cpp, Ollama o `llama-cpp-python`, dado el reducido tamaño de los archivos.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes (Q2_K a f16) que permiten medir el impacto de la cuantización en perplejidad y calidad de salida sobre un mismo modelo base.
- Asistentes de texto offline en inglés: despliegue en dispositivos con poca VRAM (por ejemplo, portátiles sin GPU dedicada) para tareas de generación de texto breve y conversación simple.
- Filtrado y clasificación de texto ligero: al ser un modelo pequeño, puede usarse para tareas auxiliares de preprocesado o etiquetado en pipelines en inglés, siempre que se valide su calidad previamente.
- Base para fine-tuning experimental: al estar disponible el modelo base en safetensors, puede servir como punto de partida para ajustes ligeros en tareas conversacionales en inglés, aunque la falta de licencia clara es un riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB para cuantizaciones Q2 a Q4, 0,6 GB para Q8_0 y 1,1 GB para f16 (tamaños de archivo; la VRAM real depende del contexto y del backend).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones pequeñas; no se requiere A100 ni H100.
- Cabe en GPUs de consumo: sí, en tarjetas como GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores; también en iGPUs y CPU.
- Opciones de despliegue: llama.cpp, Ollama, `llama-cpp-python`, y endpoints compatibles con la API de Hugging Face. El formato GGUF no es compatible con vLLM ni TGI de forma nativa.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de ~494 M de parámetros, se espera una latencia baja en hardware moderno, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| herbalism_v2-GGUF | 494 M | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |
| TinyLlama-1.1B-Chat | 1.100 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a modelos de tamaño similar ampliamente conocidos; no se dispone de datos de rendimiento de `herbalism_v2` para establecer comparaciones cuantitativas. Los modelos alternativos citados cuentan con licencias permisivas y documentación técnica detallada, a diferencia de este repositorio.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los términos de uso comercial, lo que impide su adopción en producción sin aclaración previa por parte del autor del modelo base.
- Ausencia de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de calidad conversacional, por lo que su rendimiento real es desconocido.
- Idiomas limitados al inglés: no se documenta soporte para castellano ni otros idiomas.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinación: al no haber documentación sobre alineación o evaluación de seguridad, el riesgo de respuestas inventadas o sesgadas no puede acotarse.
- Modelo de nicho con pocas descargas (44) y sin likes: la comunidad de validación es prácticamente inexistente.
- Cuantizaciones estáticas únicamente: no hay versiones imatrix ni ponderadas, lo que puede reducir la calidad en cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas.
- Fecha de actualización del repositorio (2026-11-21) posterior a la de creación, sin cambios documentados en la model card.
- El nombre del modelo (`herbalism`) y del autor (`z3n7r4ck3r`) no aportan información verificable sobre el dominio de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/herbalism_v2-GGUF
- Modelo base: https://huggingface.co/z3n7r4ck3r/herbalism_v2
- Página de descargas del cuantizador: https://hf.tst.eu/model#herbalism_v2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
