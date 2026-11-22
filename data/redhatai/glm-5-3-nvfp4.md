# RedHatAI/GLM-5.3-NVFP4

## Resumen

GLM-5.3-NVFP4 es un checkpoint cuantizado en FP4 (formato NVFP4) del modelo zai-org/GLM-5.3, publicado por RedHatAI. No se trata de un modelo entrenado desde cero, sino de una compresión post-entrenamiento que reduce el coste de memoria y acelera la inferencia en hardware Blackwell (B200/B100/RTX 50xx) manteniendo la mayor parte de la calidad del modelo original en FP8. El modelo base es un transformer de tipo MoE con atención dispersa (arquitectura `GlmMoeDsaForCausalLM`), con 753.329.940.480 parámetros totales según el recuento de safetensors, orientado a generación de texto conversacional y razonamiento.

La relevancia de esta ficha es doble: por un lado, documenta el primer checkpoint público NVFP4 de la familia GLM-5.3, útil para despliegues de producción que necesitan reducir VRAM y aumentar throughput sin reentrenar; por otro, sirve como referencia de cómo se comporta la cuantización FP4 de pesos y activaciones en tareas de razonamiento matemático, seguimiento de instrucciones y código, con una recuperación media respecto al modelo FP8 que ronda el 95-100 % en los benchmarks publicados por el autor.

El modelo solo soporta inglés y chino, tiene licencia `glm-5.3` (marcada como `other`), y está pensado para servirse con vLLM sobre GPUs Blackwell con tensor parallelism. El repo ocupa 464,9 GB, lo que refleja el tamaño del checkpoint cuantizado en FP4 con escalas de dos niveles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (transformer MoE con atención dispersa) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1) en pesos y activaciones, con escalas de dos niveles; capas fuera de los expertos enrutados sin cuantizar |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (license: other) |
| Formato de pesos | safetensors (compressed-tensors, NVFP4) |

## Arquitectura y entrenamiento

El modelo base zai-org/GLM-5.3 es un transformer de mezcla de expertos (MoE) con atención dispersa, implementado en la clase `GlmMoeDsaForCausalLM`. El checkpoint que nos ocupa no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos deben consultarse en la model card del modelo base, no disponible en la información proporcionada.

La innovación técnica de esta versión es la cuantización NVFP4: pesos y activaciones en FP4 (E2M1) con escalas de dos niveles, aplicada con LLM Compressor y el formato compressed-tensors. Las capas fuera de los expertos enrutados se dejan sin cuantizar para preservar calidad. La compresión se realizó con descompresión/compresión por capas experimental y calibración `perfectblend`. El resultado está optimizado para inferencia en Blackwell y se sirve con vLLM usando `--kv-cache-dtype fp8_e4m3`, parser de razonamiento `glm45` y decodificación especulativa MTP (5 tokens) o DSpark (8 tokens) con el draft model RedHatAI/GLM-5.3-speculator.dspark.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento matemático de varios pasos (GSM8K Platinum, MATH-500, AIME 2025).
- Razonamiento científico y de dominio (GPQA Diamond).
- Seguimiento estricto de instrucciones (IFEval prompt-level strict).
- Generación y edición de código en tareas de ingeniería de software (SWE-bench Verified).
- Modo de razonamiento explícito compatible con el parser `glm45` de vLLM.
- Decodificación especulativa mediante MTP y DSpark para reducir latencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible; la model card indica entrada y salida solo de texto.

## Casos de uso

- Razonamiento matemático en producción: el modelo obtiene 96,69 % en GSM8K Platinum y 96,27 % en MATH-500, por lo que es adecuado para asistentes de resolución de problemas con verificación paso a paso y parser de razonamiento `glm45`.
- Generación de código en pipelines de CI/CD: con 76,2 % en SWE-bench Verified, puede integrarse en flujos de revisión automática de parches y generación de tests, siempre que el pipeline acepte un modelo solo de texto y en inglés/chino.
- Asistencia científica y técnica: el 90,40 % en GPQA Diamond lo hace útil para responder preguntas de nivel doctorado en dominios STEM, con la cautela de verificar fuentes por riesgo de alucinación.
- Seguimiento de instrucciones complejas: el 85,70 % en IFEval permite usarlo en sistemas de extracción estructurada y formateo de documentos donde se exige cumplir restricciones estrictas de formato.
- Despliegue de alto throughput en clústeres Blackwell: al estar en NVFP4 con tensor parallelism 4 y KV cache FP8, encaja en servicios con 4×B200 que necesitan servir muchas peticiones concurrentes reduciendo el coste por token frente al FP8.
- Decodificación especulativa de baja latencia: combinado con el draft model DSpark (8 tokens especulativos), es adecuado para asistentes interactivos donde la latencia por petición es crítica.
- Evaluación comparativa de cuantización: sirve como referencia para medir la pérdida de calidad de FP4 frente a FP8 en tareas de razonamiento, usando el mismo harness lighteval y los mismos seeds.

## Benchmarks y rendimiento

Evaluación realizada con lighteval sobre un servidor vLLM en 4×B200, temperatura 1.0, parser `glm45`, KV cache FP8 E4M3. GSM8K, IFEval, MATH-500 y GPQA con tres seeds; AIME con ocho seeds. La recuperación es relativa al modelo base en FP8 ejecutado en el mismo harness.

| Categoria | Benchmark | GLM-5.3-NVFP4 | GLM-5.3 (FP8) | Recuperacion |
|---|---|---|---|---|
| Seguimiento de instrucciones | IFEval (prompt-level strict) | 85,70 % | 89,77 % | 95,5 % |
| Razonamiento | GSM8K Platinum (strict-match) | 96,69 % | 97,52 % | 99,1 % |
| Razonamiento | MATH-500 (pass@1) | 96,27 % | 95,07 % | 101,3 % |
| Razonamiento | AIME 2025 (pass@1) | 89,58 % | 92,50 % | 96,8 % |
| Razonamiento | GPQA Diamond (pass@1) | 90,40 % | 92,42 % | 97,8 % |
| Codigo | SWE-bench Verified | 76,2 % | 77,2 % | 98,7 % |

El autor publica además una gráfica de rendimiento (interactividad frente a throughput agregado) sobre el dataset `math_reasoning` con decodificación especulativa, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 464,9 GB en FP4; para servir con margen de KV cache y overhead se recomienda un mínimo de 4 GPUs de 80 GB (por ejemplo, 4×H100) o 4×B200 para aprovechar NVFP4 de forma nativa.
- GPU recomendadas: Blackwell (B200, B100, RTX 50xx) para inferencia NVFP4 nativa; en Hopper/Ada la cuantización FP4 no se ejecuta de forma óptima y se degrada el rendimiento.
- Consumer GPU: no cabe en una sola GPU de consumo; el tamaño del checkpoint excede la VRAM de cualquier RTX 4090/5090 individual.
- Despliegue: vLLM con `--tensor-parallel-size 4`, `--kv-cache-dtype fp8_e4m3`, `--reasoning-parser glm45`, `--chat-template-content-format string` y `--trust-remote-code`. Opcionalmente decodificación especulativa MTP (5 tokens) o DSpark (8 tokens) con el draft model RedHatAI/GLM-5.3-speculator.dspark.
- Latencia y throughput: no se proporcionan cifras numéricas; solo una gráfica cualitativa de interactividad frente a throughput en `math_reasoning`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/GLM-5.3-NVFP4 | 753.329.940.480 | NVFP4 pesos y activaciones | no disponible | glm-5.3 | Hugging Face |
| zai-org/GLM-5.3 (FP8) | 753.329.940.480 | FP8 | no disponible | glm-5.3 | Hugging Face |
| RedHatAI/GLM-5.3-speculator.dspark | no disponible | no disponible (draft model) | no disponible | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~750B en FP4) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay evidencia de capacidades multilingües más allá de esos dos idiomas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en dominios científicos y de código; conviene validar salidas con herramientas externas.
- La cuantización FP4 introduce pérdida de calidad: IFEval cae un 4,5 % relativo y AIME 2025 un 3,2 % relativo frente al FP8; en producción conviene monitorizar estas tareas.
- La licencia `glm-5.3` está marcada como `other`; es imprescindible revisar los términos del modelo base antes de uso comercial.
- Requiere hardware Blackwell para aprovechar NVFP4; en GPUs no Blackwell el rendimiento puede degradarse o no ser compatible.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio; auditar antes en entornos sensibles.
- No hay información publicada sobre sesgos, longitud de contexto efectiva ni soporte de tool calling en esta versión cuantizada.
- El checkpoint ocupa 464,9 GB, lo que complica su distribución y almacenamiento en entornos con cuotas ajustadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/GLM-5.3-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Draft model para decodificación especulativa: https://huggingface.co/RedHatAI/GLM-5.3-speculator.dspark
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lighteval: https://github.com/huggingface/lighteval
