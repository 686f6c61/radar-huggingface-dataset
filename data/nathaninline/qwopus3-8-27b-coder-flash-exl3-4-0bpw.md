# nathaninline/Qwopus3.8-27B-Coder-Flash-exl3-4.0bpw

## Resumen

Qwopus3.8-27B-Coder-Flash-exl3-4.0bpw es una cuantización EXL3 de 4.0 bits por peso del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un fine-tune orientado a código derivado de la familia Qwen3.5. La publica el usuario nathaninline en HuggingFace y está pensada para su uso con ExLlamaV3 y TabbyAPI, no para transformers ni llama.cpp. El repositorio ocupa 16,4 GB e incluye tanto la torre de visión como la cabeza MTP (multi-token prediction), lo que permite decodificación especulativa dentro del propio runtime de ExLlamaV3.

El interés práctico de esta ficha es doble: por un lado, demuestra cómo se puede servir un modelo multimodal de código en GPUs de consumo; por otro, incluye mediciones de velocidad reales sobre una configuración mixta de dos GPUs (RTX 5060 Ti de 16 GB y RTX 3070 de 8 GB en tensor parallel) con 131k de contexto y caché Q8. El autor reporta entre 50 y 59 tok/s de decodificación según el número de tokens de borrador MTP.

Conviene señalar una discrepancia importante: el nombre del modelo indica 27B, pero el recuento real de parámetros en los safetensors es de 8.175.129.984 (aproximadamente 8,2B). No se dispone de información que explique esa diferencia, por lo que se documenta tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5) con cabeza MTP; tag `qwen3_5` |
| Parametros totales | 8.175.129.984 (~8,2B) según safetensors; el nombre del repo indica 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (según la medición de velocidad del autor) |
| Tipos de cuantizacion | EXL3 4.0 bpw (decoder), 5 bpw (output head), 6 bpw (vision tower), 4 bpw (MTP head), embeddings en 16 bits; codebook mul1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, librería exllamav3) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: `qwen3_5` como arquitectura base, pipeline `image-text-to-text` (modelo multimodal con entrada de imagen y texto) y presencia de una cabeza MTP (multi-token prediction). Esta cabeza es la que habilita la decodificación especulativa en ExLlamaV3, con la particularidad de que en este fine-tune acepta menos tokens por borrador que en el Qwen3.8 27B original, según indica el autor.

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o similares. Tampoco se documenta el proceso de fine-tune que dio lugar a Qwopus3.8-27B-Coder-Flash más allá de su orientación a código. La cuantización EXL3 se generó con los parámetros `-b 4.0 -hb 5 -vb 6 -mb 4 --out_scales always`, codebook mul1 y calibración por defecto de 250 filas por 2048 columnas. El autor advierte explícitamente que no ha comparado la calidad de esta cuantización contra los pesos originales.

## Capacidades

- Generación de texto y código: el fine-tune está orientado a tareas de programación, según el nombre y los tags del modelo.
- Entrada multimodal imagen-texto: incluye torre de visión cuantizada a 6 bpw, por lo que acepta imágenes junto con texto.
- Decodificación especulativa mediante cabeza MTP integrada, con configuración óptima de 2 tokens de borrador en este fine-tune.
- Razonamiento multi-paso: el autor menciona "reasoning on" en sus pruebas de velocidad, lo que sugiere modo de razonamiento, aunque no se detalla su funcionamiento.
- Conversacional multi-turno: tag `conversational`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Idiomas: no disponible.

## Casos de uso

- Asistencia de código en local con GPUs de consumo: el modelo cabe en 16 GB con cuantización de 4 bpw, lo que permite desplegar un asistente de programación en una RTX 5060 Ti o similar sin depender de la nube.
- Autocompletado y generación de código en IDE mediante TabbyAPI: al ser un formato EXL3 servible con TabbyAPI, se puede exponer como endpoint compatible con clientes tipo OpenAI para extensiones de editor.
- Análisis de capturas de pantalla o diagramas en flujos de desarrollo: la torre de visión permite pasar imágenes de errores, mockups o esquemas y obtener explicaciones o código asociado.
- Servicio de chat multi-turno con contexto largo: los 131k tokens de contexto permiten mantener conversaciones con repositorios o documentación extensa adjunta.
- Inferencia de alto throughput en configuraciones multi-GPU pequeñas: el tensor parallel entre dos GPUs y la decodificación especulativa MTP ofrecen entre 50 y 59 tok/s, suficiente para uso interactivo o para pequeños equipos.
- Evaluación e investigación de cuantización EXL3: sirve como caso de estudio para medir el impacto de 4 bpw con cabezas a distinta precisión (5 bpw en output, 6 bpw en visión) sobre un modelo de código.
- Prototipado de pipelines de razonamiento con modo thinking: útil para experimentar con cadenas de razonamiento en tareas de programación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no comparó la calidad frente a los pesos originales.

Los únicos datos de rendimiento disponibles son de velocidad de decodificación, medidos en una RTX 5060 Ti 16 GB + RTX 3070 8 GB en tensor parallel, con 131k de contexto, caché Q8, temperatura 1, respuestas de 600 tokens y razonamiento activado:

| Tokens de borrador MTP | Decodificación (tok/s) |
|---|---|
| 1 | ~50 |
| 2 | ~59 de media (rango 51-70) |
| 3 | ~54 |

## Requisitos de hardware

- VRAM estimada: ~16 GB para los pesos en EXL3 4.0 bpw; hay que sumar la caché KV, que con 131k de contexto y caché Q8 requiere VRAM adicional significativa.
- El autor ejecuta el modelo repartido entre una RTX 5060 Ti de 16 GB y una RTX 3070 de 8 GB en tensor parallel, lo que sugiere que no cabe completo en 16 GB con contexto largo.
- GPU recomendadas: RTX 4090/5090 (24-32 GB) para contexto largo en una sola tarjeta; A100/H100 para despliegues con concurrencia; configuraciones multi-GPU consumer para contexto máximo.
- Cabe en GPU de consumo: sí, con cuantización de 4 bpw, aunque para 131k de contexto se necesita más de 16 GB o repartir entre varias GPUs.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI (soporte nativo EXL3). No es compatible con llama.cpp, Ollama ni vLLM en este formato.
- Latencia y throughput: ~50-59 tok/s de decodificación en la configuración descrita; no se reportan datos de prefill ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-exl3-4.0bpw | ~8,2B (según safetensors) | 131k | EXL3 / ExLlamaV3, TabbyAPI | Apache 2.0 | Cuantización 4 bpw con visión y MTP |
| Jackrong/Qwopus3.8-27B-Coder-Flash | no disponible | no disponible | safetensors (original) | Apache 2.0 | Modelo base sin cuantizar; calidad de referencia |
| Qwen3.8 27B (original, citado por el autor) | no disponible | no disponible | no disponible | no disponible | Referencia para la comparación de la cabeza MTP |

No se dispone de datos suficientes para comparar rendimiento en benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor no ha evaluado la calidad de la cuantización frente a los pesos originales; puede haber degradación no medida, especialmente en tareas de código de precisión.
- Discrepancia entre el nombre (27B) y el recuento real de parámetros (~8,2B): conviene verificar antes de dimensionar el despliegue.
- Solo es utilizable con ExLlamaV3/TabbyAPI; no hay pesos GGUF ni compatibilidad con otros runtimes.
- La cabeza MTP de este fine-tune acepta menos tokens de borrador que el modelo original, por lo que configuraciones de decodificación especulativa agresivas rinden peor.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible, lo que impide garantizar calidad multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un fine-tune de terceros conviene revisar también las condiciones del modelo base y de Qwen.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validación comunitaria ni informes independientes de calidad.

## Enlaces

- [HuggingFace: nathaninline/Qwopus3.8-27B-Coder-Flash-exl3-4.0bpw](https://huggingface.co/nathaninline/Qwopus3.8-27B-Coder-Flash-exl3-4.0bpw)
- [Modelo base: Jackrong/Qwopus3.8-27B-Coder-Flash](https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash)
- [ExLlamaV3 (GitHub)](https://github.com/turboderp-org/exllamav3)
- [TabbyAPI (GitHub)](https://github.com/theroyallab/tabbyAPI)
