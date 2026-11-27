# Krishnaaslxy/Quick.7B

## Resumen

Quick.7B es un checkpoint publicado en Hugging Face bajo el identificador `Krishnaaslxy/Quick.7B`. A pesar del sufijo "7B" del nombre, los pesos reales en formato safetensors suman 1.711.376.384 parametros (aproximadamente 1,7 mil millones), y la model card corresponde integramente a SmolLM2-1.7B, la familia de modelos compactos de Hugging Face. Es decir, el repositorio parece ser una redistribucion o reetiquetado de SmolLM2-1.7B bajo un nombre distinto, sin cambios documentados en la card.

SmolLM2 es una familia de modelos de lenguaje compactos disponible en tres tamanos (135M, 360M y 1.7B), disenada para ejecutarse en dispositivo con requisitos de hardware minimos. La variante de 1.7B se entreno sobre 11 billones de tokens y mejora a su predecesor SmolLM1-1.7B en seguimiento de instrucciones, conocimiento, razonamiento y matematicas. Es relevante para escenarios de inferencia local, prototipado rapido y despliegues con presupuesto de VRAM muy limitado.

La arquitectura es un transformer decoder-only de tipo Llama, con licencia Apache 2.0, pesos en safetensors y soporte nativo en transformers y text-generation-inference. El modelo esta orientado principalmente al ingles y su contexto maximo no figura en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 1.711.376.384 (~1,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion (pesos publicados en safetensors; cuantizaciones GGUF no confirmadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SmolLM2, un transformer decoder-only de tipo Llama con atencion causal estandar. Segun la model card, la variante de 1.7B se entreno sobre 11 billones de tokens combinando FineWeb-Edu, DCLM y The Stack, junto con nuevos datasets de matematicas y codigo curados por el equipo. La version instruct se obtuvo mediante supervised fine-tuning (SFT) sobre datasets publicos y propios (smoltalk), seguido de Direct Preference Optimization (DPO) usando UltraFeedback. Ademas, se incorporaron datasets de Argilla como Synth-APIGen-v0.1 para habilitar reescritura de texto, resumen y function calling.

No se documenta en la informacion proporcionada ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa o mezcla de expertos); se trata de un transformer denso convencional optimizado para eficiencia en dispositivo. El codigo de preentrenamiento, postentrenamiento, evaluacion e inferencia local esta disponible en el repositorio `huggingface/smollm`.

## Capacidades

- Generacion de texto en ingles con calidad razonable para su tamano.
- Razonamiento basico y respuesta a preguntas de conocimiento general.
- Matematicas elementales y problemas tipo GSM8K (resultados moderados, ver benchmarks).
- Generacion y comprension de codigo, con soporte derivado de The Stack.
- Function calling / tool calling, gracias a los datasets Synth-APIGen-v0.1 de Argilla.
- Reescritura de texto y resumen (evaluado en OpenRewrite-Eval).
- Seguimiento de instrucciones multi-turno a nivel basico (MT-Bench 6.13 en la version instruct).
- Capacidades multilingues limitadas: el modelo esta entrenado y evaluado principalmente en ingles.
- No se documentan modos de razonamiento extendido (thinking), vision ni audio.

## Casos de uso

- Inferencia local en portatiles y equipos de sobremesa: con ~1,7B parametros y 3,4 GB en bf16, el modelo cabe en GPUs de consumo con 4-6 GB de VRAM, lo que permite asistentes offline sin conexion.
- Prototipado rapido de pipelines de generacion de texto: sirve como modelo de referencia para validar prompts, plantillas de chat y flujos de evaluacion antes de escalar a modelos mayores.
- Clasificacion y extraccion de informacion en ingles: tareas de etiquetado, resumen de documentos cortos y extraccion de entidades en entornos con recursos limitados.
- Function calling en agentes ligeros: la version instruct soporta tool calling, lo que permite integrarlo en flujos de automatizacion con APIs externas cuando la latencia y el coste son criticos.
- Educacion y experimentacion: adecuado para cursos y laboratorios donde se necesita un modelo pequeno, con licencia permisiva y facil de ajustar (fine-tuning) en una sola GPU.
- Generacion de codigo asistida en entornos con restricciones de privacidad: al poder ejecutarse en local, evita enviar codigo propietario a servicios en la nube.
- Filtrado y preprocesado de datos a gran escala: su bajo coste por token permite usarlo como modelo de primera pasada en pipelines de anotacion o deduplicacion.

## Benchmarks y rendimiento

Resultados publicados en la model card (zero-shot salvo indicacion), comparando la variante base y la instruct:

| Metrica | SmolLM2-1.7B | Llama-1B | Qwen2.5-1.5B | SmolLM1-1.7B |
|---|---|---|---|---|
| HellaSwag | 68.7 | 61.2 | 66.4 | 62.9 |
| ARC (media) | 60.5 | 49.2 | 58.5 | 59.9 |
| PIQA | 77.6 | 74.8 | 76.1 | 76.0 |
| MMLU-Pro (MCF) | 19.4 | 11.7 | 13.7 | 10.8 |
| CommonsenseQA | 43.6 | 41.2 | 34.1 | 38.0 |
| TriviaQA | 36.7 | 28.1 | 20.9 | 22.5 |
| Winogrande | 59.4 | 57.8 | 59.3 | 54.7 |
| OpenBookQA | 42.2 | 38.4 | 40.0 | 42.4 |
| GSM8K (5-shot) | 31.0 | 7.2 | 61.3 | 5.5 |

| Metrica | SmolLM2-1.7B-Instruct | Llama-1B-Instruct | Qwen2.5-1.5B-Instruct | SmolLM1-1.7B-Instruct |
|---|---|---|---|---|
| IFEval (media) | 56.7 | 53.5 | 47.4 | 23.1 |
| MT-Bench | 6.13 | 5.48 | 6.52 | 4.33 |
| OpenRewrite-Eval (RougeL) | 44.9 | 39.2 | 46.9 | No disponible |
| HellaSwag | 66.1 | 56.1 | 60.9 | 55.5 |
| ARC (media) | 51.7 | 41.6 | 46.2 | 43.7 |
| PIQA | 74.4 | 72.3 | 73.2 | 71.6 |
| MMLU-Pro (MCF) | 19.3 | 12.7 | 24.2 | 11.7 |
| BBH (3-shot) | 32.2 | 27.6 | 35.3 | 25.7 |
| GSM8K (5-shot) | 48.2 | 26.8 | 42.8 | 4.62 |

## Requisitos de hardware

- VRAM estimada: ~3,4 GB en bf16/fp16 (footprint reportado de 3422,76 MB); ~1,7-2 GB en cuantizacion de 8 bits y ~1 GB en 4 bits (estimacion orientativa, no confirmada en la card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; A100/H100 no son necesarias y su uso seria desproporcionado.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares; tambien en CPU para inferencia lenta.
- Opciones de despliegue: transformers (con `device_map="auto"` y `torch_dtype=torch.bfloat16`), text-generation-inference (tag `endpoints_compatible`), y previsiblemente llama.cpp/Ollama si se generan cuantizaciones GGUF (no confirmadas en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Quick.7B (SmolLM2-1.7B) | 1,7B | No disponible | Apache 2.0 | Mejor IFEval y GSM8K que Llama-1B; peor MMLU-Pro que Qwen2.5-1.5B |
| Llama-1B | ~1B | No disponible en la info | Licencia Llama | Peor en la mayoria de benchmarks segun la card |
| Qwen2.5-1.5B | ~1,5B | No disponible en la info | Apache 2.0 | Mejor MMLU-Pro y MT-Bench; peor GSM8K que SmolLM2 en la version instruct |
| SmolLM1-1.7B | 1,7B | No disponible | Apache 2.0 | Predecesor, claramente inferior en todos los ejes evaluados |

## Limitaciones y advertencias

- El nombre del repositorio ("Quick.7B") induce a error: los pesos reales son de ~1,7B parametros, no 7B.
- La model card es identica a la de SmolLM2-1.7B y no documenta cambios, ajustes ni procedencia del checkpoint; no hay garantia de que los pesos correspondan exactamente al modelo original de Hugging Face.
- El modelo esta orientado casi exclusivamente al ingles; el rendimiento en castellano sera limitado.
- Riesgo de alucinacion: la propia card advierte que el contenido generado puede no ser factualmente preciso ni logicamente consistente.
- Sesgos heredados de los datos de entrenamiento (FineWeb-Edu, DCLM, The Stack); no se documentan mitigaciones especificas.
- Licencia Apache 2.0 permite uso comercial, pero al ser una redistribucion sin trazabilidad conviene verificar la procedencia antes de usarlo en produccion.
- Sin datos publicados sobre longitud de contexto, cuantizaciones disponibles ni rendimiento en latencia.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Krishnaaslxy/Quick.7B
- Modelo original SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Paper: https://arxiv.org/abs/2502.02737v1
- Repositorio GitHub: https://github.com/huggingface/smollm
- Dataset SFT smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Synth-APIGen-v0.1: https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
- Dataset UltraFeedback: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Alignment handbook (recetas SmolLM2): https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Herramienta de evaluacion lighteval: https://github.com/huggingface/lighteval
