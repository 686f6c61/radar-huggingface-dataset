# JC1DA/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-INT4-GPTQ

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-INT4-GPTQ es una cuantizacion a 4 bits (W4A16, GPTQ) del fine-tune Cold Fusion de Qwen3.8-27B, desarrollado por el usuario de HuggingFace JC1DA a partir del trabajo de DavidAU. El modelo base es el Qwen3.8-27B de Alibaba, un LLM multimodal denso de 27.000 millones de parametros con arquitectura hibrida (48 capas Gated-DeltaNet y 16 capas full-attention) y una ventana de contexto nativa de 262.144 tokens. La cuantizacion reduce el peso de 54.7 GB en BF16 a 19.6 GB, lo que permite ejecutar el modelo en una unica GPU con amplio margen para la cache KV.

El modelo destaca por el metodo de entrenamiento "Cold Fusion" (GAIN + Unsloth), que segun su autor reduce los tokens de razonamiento a entre 1/10 y 1/2 respecto al Qwen3.8-27B original, manteniendo o mejorando la calidad de las respuestas. Esta version cuantizada en INT4 GPTQ es practicamente lossless respecto al original BF16, con diferencias de menos de 0.5 puntos porcentuales en benchmarks clave. Incluye soporte para decodificacion especulativa MTP (Multi-Token Prediction) en vLLM, lo que acelera la inferencia entre 1.5 y 2 veces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hbrida: 48 capas Gated-DeltaNet + 16 capas full-attention (Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo); 32.768 tokens en configuracion vLLM recomendada |
| Tipos de cuantizacion | INT4 GPTQ (W4A16), group size 128, simetrico |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (GPTQ) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.8-27B, un modelo hibrido que combina 48 capas con Gated-DeltaNet (una variante de capas recurrentes con atencion lineal) y 16 capas con atencion completa, mas un vision tower para entrada de imagenes. El modelo es multimodal (image-text-to-text) y nativo de vision, lo que permite procesar entradas visuales y textuales de forma conjunta.

El metodo Cold Fusion (GAIN + Unsloth) aplicado por DavidAU sobre el Qwen3.8-27B base reduce significativamente los tokens de razonamiento generados durante el thinking mode, manteniendo o mejorando la calidad de las respuestas. Segun la informacion disponible, el modelo supera a los Qwen3.5, Qwen3.6 y Qwen3.8 27B en los benchmarks principales. La cuantizacion GPTQ se realizo con GPTQModel 7.3.4, utilizando 600 secuencias de 2048 tokens del dataset C4 para calibracion. Las capas cuantizadas son las proyecciones MLP (gate/up/down) de las 64 capas, las proyecciones q/k/v/o de las 16 capas full-attention, y las proyecciones in_proj_qkv/z/out_proj de las 48 capas Gated-DeltaNet. Se mantienen en BF16 los gates recurrentes, conv1d, normas, vision tower, lm_head, embeddings y la cabeza MTP.

## Capacidades

- Generacion de texto multimodal: acepta entradas de imagen y texto simultaneamente (image-text-to-text).
- Razonamiento con thinking mode activable o desactivable por peticion mediante `chat_template_kwargs={"enable_thinking": False}`.
- Soporte de decodificacion especulativa MTP: el checkpoint incluye una cabeza draft de 15 tensores que vLLM detecta automaticamente, compartiendo embeddings y lm_head con el modelo objetivo. Aceptacion estimada de 40-60% por token draft y speedup de decodificacion de 1.5-2 veces.
- Tool calling y function calling: heredado del modelo base Qwen3.8-27B (no se especifican detalles concretos).
- Capacidades de agente: el modelo base esta disenado para flujos de trabajo agente y automatizacion de oficina.
- Capacidades multilingues: no se especifican idiomas concretos en la informacion disponible.
- Inferencia eficiente en 4 bits: 19 GB de peso total, compatible con kernels Marlin W4A16 en vLLM.

## Casos de uso

- **Atencion al cliente multimodal**: el modelo puede procesar capturas de pantalla o fotos de productos junto con texto de conversacion, manteniendo contexto largo de hasta 262K tokens nativos, lo que permite gestionar hilos de soporte prolongados con historial completo.
- **Generacion de codigo en produccion**: con soporte de tool calling y agentic workflows, puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo, con ventaja de que el modo non-thinking reduce la latencia en tareas de bajo riesgo.
- **Razonamiento de documentos con imagenes**: procesa documentos escaneados o diagramas tecnicos junto con preguntas textuales, util en entornos juridicos o de ingenieria.
- **Automatizacion de oficina**: el modelo base Qwen3.5 destaca en tareas de office automation, y este fine-tune reduce el tiempo de razonamiento, adecuado para generar resumenes, redactar correos o preparar informes a partir de datos visuales y textuales.
- **Agentes multi-paso con vision**: combinado con vLLM y decodificacion especulativa MTP, puede ejecutar flujos de agente que requieren interpretar pantallas de aplicaciones o interfaces y tomar decisiones en multiples pasos.
- **Despliegue en un unico GPU**: con 19 GB de pesos, cabe en una RTX 4090 o A100 con margen para KV cache, lo que permite servidores de inferencia locales sin necesidad de multiples GPU.

## Benchmarks y rendimiento

La model card proporciona comparaciones entre la version BF16 original y esta cuantizacion GPTQ:

| Benchmark | BF16 | INT4 (este build) | Delta |
|---|---|---|---|
| GSM8K (full, 1.314 preguntas, 5-shot) | 93.46% | 93.07% | -0.39 pp |
| MMLU (full, 14.042 preguntas, 5-shot, instruct mode) | 82.99% | 82.50% | -0.49 pp |
| C4 validation perplexity (299k tokens) | 11.87 | 12.04 | +1.4% |
| Full-vocab KL divergence (4.6k posiciones) | - | 0.023 nats/token media (max 2.0) | - |

Segun la informacion del autor, la cuantizacion es practicamente lossless respecto al BF16. En la búsqueda web se indica que el modelo Cold Fusion supera todos los Qwen3.5, 3.6 y 3.8 27B en benchmarks nucleares, y que mantiene el 99% de rendimiento del BF16 tanto en 8 bits como en 4 bits. No se proporcionan cifras concretas de comparacion con otros modelos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: 19 GB de pesos en INT4. Con la cache KV para contexto de 32K tokens (configuracion recomendada), se estima un uso total de 24-28 GB, adecuado para GPU de 32 GB o 48 GB.
- **GPU recomendadas**: A100 (40/80 GB), H100 (80 GB), RTX 6000 Ada, o una RTX 4090 (24 GB) para contexto reducido. Para contexto completo de 262K tokens se necesitaria una GPU de 80 GB o mas.
- **Cabe en consumer GPU**: si, en RTX 4090 (24 GB) con contexto limitado (por ejemplo, 16-32K tokens). No cabe en RTX 3080/3090 con contexto largo.
- **Opciones de despliegue**: vLLM (recomendado, con soporte Marlin W4A16 y MTP), llama.cpp (via GGUF de la version hermana), Ollama (si se publica un GGUF), TGI (probablemente compatible via GPTQ).
- **Latencia y throughput**: con MTP especulativo, se estima 1.5-2 veces de speedup en decodificacion respecto a la generacion autoregresiva estandar. No se proporcionan cifras exactas de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-INT4-GPTQ (este) | 27.78B | 262K nativo | Apache-2.0 | GPTQ INT4 | Cuantizacion lossless del fine-tune Cold Fusion |
| Qwen3.8-27B (stock) | 27.78B | 262K | Apache-2.0 | BF16 | Modelo base, sin reduccion de tokens de thinking |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF | 27.78B | 262K | Apache-2.0 | GGUF | Misma fine-tune en formato GGUF para llama.cpp |
| DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0 | 27.78B | 262K | Apache-2.0 | No disponible | Metodo Cold Fusion aplicado a Qwen3.6 |

No se dispone de comparaciones directas con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- **Sesgos y alucinacion**: no se ha publicado informacion especifica sobre sesgos del modelo. Como todo LLM, puede generar contenido falso o inventado, especialmente en modo thinking con temperatura alta (1.0 recomendada).
- **Riesgo de alucinacion**: la configuracion recomendada para thinking mode usa temperatura 1.0 y presence_penalty 1.5, lo que aumenta la diversidad pero tambien el riesgo de respuestas no factuales.
- **Limitaciones de contexto**: aunque el contexto nativo es de 262K tokens, la configuracion vLLM recomendada limita a 32K tokens para mantener el rendimiento. Superar ese limite puede degradar la calidad.
- **Idiomas**: no se especifica la lista de idiomas soportados. El modelo base Qwen3.8 suele soportar multiples idiomas, pero no se confirma para este fine-tune.
- **Restricciones de licencia**: licencia Apache-2.0, que permite uso comercial sin restricciones significativas, siempre que se mantenga el aviso de copyright.
- **Cuantizacion**: aunque los benchmarks muestran perdidas minimas, la cuantizacion INT4 puede afectar a tareas de alta sensibilidad numerica o de logica compleja, aunque no se observa en los datos publicados.
- **Produccion**: el autor recomienda usar vLLM con kernels Marlin y MTP; no se garantiza el funcionamiento correcto en otros runtimes (TGI, etc.) sin verificacion previa.

## Enlaces

- Modelo cuantizado: https://huggingface.co/JC1DA/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-INT4-GPTQ
- Modelo original (BF16): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Version GGUF de la misma fine-tune: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Documentacion en Cloudflare: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Referencia de Cold Fusion (Qwen3.6): https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0
