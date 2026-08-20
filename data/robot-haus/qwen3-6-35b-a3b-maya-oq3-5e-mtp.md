# Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ3.5e-mtp

## Resumen

El modelo **Qwen3.6-35B-A3B-MAYA-oQ3.5e-mtp** es un checkpoint cuantizado en formato MLX del modelo original de Qwen, `Qwen/Qwen3.6-35B-A3B`, desarrollado por el usuario Robot-Haus. Se trata de una variante de la serie MAYA, diseñada específicamente para ejecutarse de forma eficiente en hardware Apple Silicon (M1/M2/M3/M4) y en GPUs CUDA, con un enfoque particular en tareas de codificacion, razonamiento agéntico y escritura profesional. El modelo base es un Mixture-of-Experts (MoE) con 35.000 millones de parametros totales y 3.000 millones activos por token, con una arquitectura hibrida que combina bloques Gated DeltaNet y Gated Attention.

La relevancia de este checkpoint radica en su cuantizacion de 3 bits (oQ3.5e) con soporte nativo de Multi-Token Prediction (MTP), que permite ejecutar un modelo de alto rendimiento en entornos locales con recursos limitados. Segun las pruebas del autor, este variante destaca por ser la mas pequena y, a la vez, la mas precisa en benchmarks de inteligencia como MMLU-Pro y HumanEval, superando a variantes de mayor bit-depth en esos test. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en aplicaciones de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (Gated DeltaNet + Gated Attention) con vision encoder |
| Parametros totales | 35.000 millones (MoE) |
| Parametros activos | 3.000 millones por token |
| Longitud de contexto | no disponible (testeado hasta pp65536 en benchmarks) |
| Tipos de cuantizacion | oQ3.0e (bf16), oQ4e (bf16/fp16), oQ5e (fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-35B-A3B` es un LLM causal post-entrenado con un encoder de vision, que emplea una pila hibrida de bloques Gated DeltaNet y Gated Attention con routing sparse de Mixture-of-Experts. Esto permite activar solo 3.000 millones de parametros por token, lo que reduce el coste computacional manteniendo la capacidad del modelo. La version MAYA de Robot-Haus ha sido cuantizada con la herramienta `oMLX` (version v0.5.5) en nivel `oQ3.0e` con dtype bf16, preservando los tensores MTP (Multi-Token Prediction). La calibracion se realizo con un corpus personalizado de 3.629 muestras, diseñado para conservar los canales de peso relevantes para la personalidad asistencial, la escritura creativa, el razonamiento agéntico y la organizacion inteligente.

El entrenamiento original de Qwen3.6 se baso en retroalimentacion de la comunidad, priorizando la estabilidad y la utilidad real, especialmente en codificacion agéntica. La cuantizacion no incluye un entrenamiento adicional, sino una calibracion para reducir la perdida de precision en tareas especificas. Los benchmarks de inteligencia se ejecutaron con Thinking Mode desactivado, en batch de 8x, y los resultados muestran que esta variante supera a otras de mayor bit-depth en MMLU-Pro y HumanEval.

## Capacidades

- Generacion de texto y razonamiento multi-step, con soporte de modo thinking (desactivado en los benchmarks, pero disponible en el modelo).
- Codificacion avanzada: genera, explica y depura codigo en multiples lenguajes, con buen rendimiento en HumanEval (92.1%) y LiveCodeBench (44.0%).
- Tool calling y function calling: el modelo base Qwen3.6 soporta agentes y orquestacion de herramientas, y la cuantizacion MAYA esta optimizada para mantener esa capacidad.
- Capacidades multilingues limitadas: el modelo base es principalmente en ingles, aunque puede manejar otras lenguas con menor fluidez.
- Escritura profesional y creativa: el corpus de calibracion MAYA esta diseñado para preservar la voz y el estilo en textos largos.
- Razonamiento matematico: obtiene un 90.0% en GSM8K, aunque no es su punto mas fuerte frente a otros modelos.

## Casos de uso

- **Asistente de codigo local**: el modelo puede integrarse en IDEs como VS Code o Neovim para autocompletar y generar funciones, gracias a su soporte de tool calling y su buen rendimiento en HumanEval. Su huella de VRAM moderada permite ejecutarlo en un Mac Studio o en una GPU consumer.
- **Agente de automatizacion de tareas**: puede orquestar herramientas de shell y APIs para tareas de sysadmin, como gestion de archivos, ejecucion de scripts o monitorizacion de sistemas, gracias a su razonamiento agéntico y su capacidad de multi-step reasoning.
- **Generacion de documentacion tecnica**: el corpus de calibracion incluye escritura profesional, por lo que el modelo es adecuado para redactar manuales, guias y documentacion de codigo con un tono coherente.
- **Chatbot de atencion al cliente**: aunque solo soporta ingles, puede gestionar conversaciones multi-turno con contexto largo (hasta 65k tokens en pruebas), lo que es util para resolver incidencias complejas con historial completo.
- **Analisis de codigo y revision de seguridad**: puede revisar fragmentos de codigo para identificar vulnerabilidades o malas practicas, ya que su entrenamiento en codificacion le permite entender patrones de programacion.
- **Prototipado rapido de agentes**: su soporte MTP y su cuantizacion ligera permiten iterar rapidamente en entornos de desarrollo locales, probando flujos agénticos sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

Los benchmarks de inteligencia se ejecutaron en el companion `oQ3.5e-fp16-mtp` (dtype fp16) y se confirmo que los resultados son equivalentes en el variante bf16 en 7 de 8 pruebas. Los datos corresponden a oMLX v0.5.5, Thinking Mode off, batch 8x, en Apple M1 Ultra 128GB.

| Modelo | MMLU | MMLU-Pro | HellaSwag | TruthfulQA | GSM8K | HumanEval | MBPP | LiveCodeBench |
|--------|------|----------|-----------|------------|-------|-----------|------|---------------|
| **oQ3.5e (este, ~fp16 equivalente)** | **81.2%** | **65.7%** | 92.0% | 84.1% | 90.0% | **92.1%** | 83.5% | 44.0% |
| oQ4e-fp16 | 80.8% | 59.3% | 93.0% | **85.7%** | 91.0% | 90.2% | **85.5%** | **49.0%** |
| oQ4e-BF16 | 80.9% | 60.0% | 93.0% | 85.6% | 91.0% | 91.5% | **85.5%** | **53.0%** |
| oQ5e-fp16 | 80.2% | 62.0% | **93.5%** | 86.1% | 90.0% | 76.8%* | 83.0% | 54.0% |
| 4bit-DWQ (prod anterior) | 80.9% | 60.0% | **94.0%** | 84.8% | **92.0%** | 90.9% | 83.5% | 43.0% |

*El oQ5e-fp16 mostro una regresion en HumanEval confirmada en rerun independiente, por lo que fue descartado como candidato de produccion.*

## Requisitos de hardware

- **VRAM estimada**: el repo pesa 18.6 GB en formato safetensors. Para inferencia con MLX, se recomienda un minimo de 16-24 GB de memoria unificada en Apple Silicon. En CUDA, se necesita una GPU con al menos 12-16 GB de VRAM para cargar el modelo completo en fp16/bf16.
- **GPU recomendadas**: Apple M1/M2/M3/M4 (especialmente M1 Ultra 128GB para pruebas completas), o GPUs NVIDIA como RTX 4090 (24GB) o A100 (80GB) para despliegue en servidor.
- **Compatibilidad con GPU consumer**: si, cabe en una RTX 4090 con cuantizacion Q3.5e, aunque el contexto largo puede requerir mas memoria.
- **Opciones de despliegue**: al ser un checkpoint MLX, se puede usar con `oMLX` para Apple Silicon, o convertirlo a otros formatos (GGUF, vLLM) para CUDA. Se recomienda oMLX v0.5.5 o superior.
- **Latencia y throughput**: en M1 Ultra, el modelo alcanza ~67 tokens/s con contexto corto (pp1024) y ~34 tokens/s con contexto largo (pp65536) con MTP desactivado. Con continuous batching 8x, alcanza ~178 tokens/s.

## Comparativa con modelos similares

Comparacion con las variantes de la misma serie MAYA y con el modelo base original:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|--------|------------|----------|----------|----------------|
| **Qwen3.6-35B-A3B-MAYA-oQ3.5e (este)** | 35B (MoE, 3B activos) | no disponible | Apache-2.0 | MLX, safetensors |
| Qwen3.6-35B-A3B (base) | 35B (MoE, 3B activos) | 128k (estimado) | Apache-2.0 | HuggingFace |
| Qwen3.6-35B-A3B-MAYA-oQ4e-fp16 | 35B (MoE, 3B activos) | no disponible | Apache-2.0 | MLX, safetensors |
| Llama 3.3 70B (referencia) | 70B (dense) | 128k | Llama 3.3 | HuggingFace |

El modelo se posiciona como una alternativa ligera a modelos densos de tamano similar, con un rendimiento competitivo en benchmarks de codigo y razonamiento, pero con un footprint de memoria mucho menor gracias al MoE y a la cuantizacion.

## Limitaciones y advertencias

- **Idioma limitado**: solo se ha confirmado soporte para ingles. Otros idiomas pueden tener un rendimiento degradado o alucinaciones.
- **MTP desactivado por defecto**: el modelo incluye tensores MTP, pero `mtp_enabled` es `false` al cargar. Hay que activarlo via API o ajustes. En bf16, MTP puede reducir el rendimiento en contextos largos (pp32768), por lo que se recomienda desactivarlo.
- **Riesgo de alucinacion**: como cualquier LLM, puede generar informacion falsa, especialmente en tareas de razonamiento complejo o con datos poco frecuentes.
- **Sesgos**: no se han documentado sesgos especificos, pero al ser un modelo entrenado principalmente con datos en ingles, puede reflejar sesgos culturales y de genero presentes en los datos.
- **Licencia**: Apache-2.0 permite uso comercial, pero hay que mantener la atribucion y el aviso de licencia en los productos derivados.
- **Limitaciones de cuantizacion**: la cuantizacion a 3 bits puede degradar la precision en tareas de razonamiento complejo o con lenguajes poco comunes, aunque los benchmarks muestran resultados solidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante fp16 recomendada: https://huggingface.co/Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ3.5e-fp16-mtp
- Variante Q4e: https://huggingface.co/Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ4e-mtp
- Repositorio de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Herramienta oMLX: https://github.com/jundot/omlx
- Articulo sobre despliegue en Strix Halo: https://akehir.com/blog/strix-halo-kubernetes-llm-qwen-3.6
- Catalogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/FW-Qwen3.6-35B-A3B
