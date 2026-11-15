# mradermacher/qwen2.5-coder-32b-heretic-swe-sft-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo PeetPedro/qwen2.5-coder-32b-heretic-swe-sft, un derivado afinado de Qwen2.5-Coder-32B orientado a tareas de ingeniería de software (SWE) y con un proceso de "abliteración"/desinhibición parcial que el autor denomina "heretic". El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, usando cuantización con matriz de importancia (imatrix) en el formato i1 de llama.cpp.

El modelo base pesa 32.763.876.352 parámetros (aproximadamente 32,8 mil millones), lo que lo sitúa en la gama alta de modelos densos ejecutables en hardware de consumo solo con cuantizaciones agresivas. La relevancia de esta ficha está en que ofrece una vía práctica para desplegar un modelo de código de 32B en local mediante llama.cpp/Ollama, con un abanico de cuantizaciones que va desde los 7,4 GB (IQ1_S) hasta los 27 GB (Q6_K).

La información disponible es limitada: la model card del repositorio de cuantización remite al modelo base pero no documenta detalles de entrenamiento, dataset ni benchmarks. Por tanto, muchos campos de esta ficha se marcan como "no disponible" en lugar de inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-32B; detalles específicos del fine-tuning no disponibles) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-32B soporta 32.768 tokens nativos, ampliable; no confirmado para este derivado) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-32B, un transformer decoder-only denso con atención causal estándar y RoPE. Sobre esa base, el autor PeetPedro aplicó un fine-tuning orientado a tareas SWE (resolución de issues, parcheo de repositorios) y un proceso de desinhibición ("heretic") que reduce los rechazos del modelo ante peticiones que el modelo original declinaría. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF, DPO o SFT puro en esa etapa.

El repositorio de mradermacher no reentrena el modelo: genera cuantizaciones GGUF con matriz de importancia (imatrix) calculada sobre el propio modelo, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. Se ofrecen tanto cuantizaciones i1 (dinámicas, con imatrix) como, en un repositorio hermano, cuantizaciones estáticas. La etiqueta "output_tensor_quantised: 1" y "quantize_version: 2" indican el pipeline de conversión empleado.

## Capacidades

- Generación de código en múltiples lenguajes, herencia directa de Qwen2.5-Coder-32B.
- Razonamiento sobre repositorios y tareas de ingeniería de software (parcheo, resolución de issues).
- Conversación multi-turno (etiqueta "conversational").
- Relleno de código (fill-in-the-middle) presumiblemente heredado del base, aunque no confirmado en la información disponible.
- Soporte de tool calling: no confirmado explícitamente para este derivado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente.
- Multilingüe: limitado a inglés según la etiqueta de idioma del repositorio.
- Modo "thinking": no disponible.
- Visión y audio: no soportados.

## Casos de uso

- Asistente de código en local para desarrolladores con GPU de consumo: usando la cuantización i1-Q4_K_M (20 GB) o i1-IQ4_XS (17,8 GB) se puede ejecutar en una RTX 4090 (24 GB) o en una RTX 3090, ofreciendo autocompletado y generación de parches sin enviar código a la nube.
- Resolución automática de issues en repositorios: el afinamiento SWE del modelo base lo hace adecuado para pipelines que reciben un issue y un fragmento de repositorio y generan un parche candidato, que luego se valida con tests en CI.
- Revisión de código asistida: con contexto suficiente, el modelo puede analizar diffs y señalar problemas de estilo, seguridad o lógica, integrándose en hooks de pre-commit o en revisiones de pull requests.
- Generación de tests unitarios: dado un módulo, el modelo puede proponer casos de prueba; útil en equipos que quieren aumentar cobertura sin coste de API.
- Documentación técnica automatizada: generación de docstrings y READMEs a partir del código fuente, en inglés, aprovechando su orientación al dominio del software.
- Entornos con requisitos de privacidad o air-gapped: al ser Apache 2.0 y ejecutable en local, encaja en organizaciones que no pueden usar APIs externas para código propietario.
- Prototipado de agentes de código: con cuantizaciones de mayor precisión (Q5_K_M o Q6_K) en estaciones con 32 GB de VRAM o más, se puede usar como motor de un agente que planifica y edita archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ1_S ~7,4 GB; IQ2_M ~11,4 GB; IQ3_M ~14,9 GB; IQ4_XS ~17,8 GB; Q4_K_M ~20 GB; Q5_K_M ~23,4 GB; Q6_K ~27 GB. Añadir 2-4 GB adicionales para contexto KV cache según longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para IQ4_XS/Q4_K_M; RTX 3090 (24 GB) igual; A100 40/80 GB o H100 para Q5_K_M y Q6_K con contexto largo; configuraciones multi-GPU para cuantizaciones altas con contexto extendido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones hasta Q4_K_M; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con IQ2/IQ3; en GPUs de 12 GB solo con IQ1/IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa para este formato (vLLM tiene soporte experimental limitado).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (qwen2.5-coder-32b-heretic-swe-sft-i1-GGUF) | 32,8B | no disponible | Apache 2.0 | GGUF | Derivado SWE desinhibido, solo inglés |
| Qwen2.5-Coder-32B-Instruct (original) | 32,8B | 32.768 nativos (ampliable) | Apache 2.0 | safetensors, GGUF | Base oficial, sin desinhibición, multilingüe |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2,4B activos) | 128K | DeepSeek License | safetensors, GGUF | Menor coste de inferencia, contexto mayor |
| Codestral-22B | 22B | 32K | MNPL (no comercial) | safetensors | Restricciones de uso comercial |

## Limitaciones y advertencias

- El proceso "heretic" reduce los rechazos del modelo, lo que puede aumentar la probabilidad de generar contenido dañino, código inseguro o respuestas sesgadas; requiere filtros adicionales en producción.
- Riesgo de alucinación en APIs, nombres de funciones y dependencias inexistentes, habitual en modelos de código; validar siempre con tests.
- Idioma limitado a inglés según la etiqueta del repositorio; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada para este derivado; asumir la del base solo con verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el fine-tuning intermedio deben cumplir también sus licencias (Qwen2.5-Coder es Apache 2.0).
- El repositorio ocupa 351,5 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad del fine-tuning SWE frente al base.
- Modelo con pocas descargas (268) y sin likes: comunidad reducida, menor validación externada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/qwen2.5-coder-32b-heretic-swe-sft-i1-GGUF
- Modelo base del fine-tuning: https://huggingface.co/PeetPedro/qwen2.5-coder-32b-heretic-swe-sft
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/qwen2.5-coder-32b-heretic-swe-sft-GGUF
- Página de overview del autor: https://hf.tst.eu/model#qwen2.5-coder-32b-heretic-swe-sft-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Modelo original Qwen2.5-Coder-32B: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
