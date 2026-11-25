# mradermacher/Opusculum-1.5B-i1-GGUF

## Resumen

Opusculum-1.5B-i1-GGUF es la versión cuantizada en formato GGUF del modelo base Stoned-Code/Opusculum-1.5B-V0.1, un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) desarrollado por el usuario Stoned-Code y cuantizado por mradermacher. El modelo está pensado para generación de texto conversacional y, por la composición de su dataset de ajuste fino, orientado a escritura creativa y roleplay, incluyendo datasets derivados de Kalo, Hydrus-Claude y SynthRP. La versión aquí descrita es un conjunto de cuantizaciones imatrix (i1) generadas con llama.cpp, distribuidas bajo licencia Apache 2.0.

El interés de esta ficha reside en que permite ejecutar un modelo conversacional de 1,5B parámetros en hardware de consumo, con cuantizaciones que van desde ~0,5 GB (IQ1_S) hasta ~1,4 GB (Q6_K). La familia i1 emplea ficheros de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión, lo que resulta especialmente relevante en modelos pequeños donde los cuantizados agresivos degradan rápidamente la coherencia.

No se dispone de información sobre la longitud de contexto, los idiomas soportados más allá del inglés declarado en los tags, ni resultados de benchmarks publicados por el autor. El modelo base es de tipo transformer denso (no MoE), entrenado con la librería Unsloth según los tags del repositorio, y el repositorio incluye tanto cuantizaciones estáticas (en el repo hermano Opusculum-1.5B-GGUF) como estas cuantizaciones ponderadas con imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE); ajuste fino con Unsloth |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además fichero imatrix |
| Idiomas soportados | inglés (declarado en el campo `language` de la model card); no disponible para otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 1,5B parámetros. Según los tags del repositorio, el ajuste fino se realizó con Unsloth, una librería de entrenamiento optimizada para GPUs de consumo. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta de la mezcla ni si se aplicaron técnicas de RLHF o DPO. La model card del cuantizador no incluye detalles arquitectónicos adicionales.

El ajuste fino del modelo base se apoya en una mezcla de datasets orientados a instrucciones conversacionales, escritura creativa y roleplay: Stoned-Code/magnum-v4, Delta-Vector/Hydrus-Claude-Instruct-5K, anthracite-org/kalo-opus-instruct-22k-no-refusal, Epiculous/SynthRP-Gens-v1.1-Filtered-n-Cleaned, lodrick-the-lafted/kalo-opus-instruct-3k-filtered, anthracite-org/nopm_claude_writing_fixed, Epiculous/Synthstruct-Gens-v1.1-Filtered-n-Cleaned, anthracite-org/kalo_opus_misc_240827 y anthracite-org/kalo_misc_part2. Esta composición sugiere un sesgo hacia prosa estilizada y diálogo de personajes, no hacia razonamiento matemático o código. Las cuantizaciones i1 incorporan un fichero imatrix (Opusculum-1.5B.imatrix.gguf) que pondera la importancia de los tensores durante la cuantización, mejorando la fidelidad en tipos de baja precisión (IQ2, IQ3) respecto a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis en escritura creativa y roleplay según la composición del dataset de ajuste.
- Generación de prosa estilizada y narrativa (ficción, diálogo de personajes, continuación de texto).
- Instrucciones generales en inglés (los datasets incluyen corpus tipo instruct como Hydrus-Claude-Instruct y kalo-opus-instruct).
- Soporte de plantillas conversacionales a través de `transformers` y de los metadatos GGUF; la model card no documenta un formato de prompt específico.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: solo inglés declarado; no disponible para castellano u otros idiomas.
- No se documentan capacidades de código ni matemáticas; el dataset de ajuste no las incluye de forma destacada.

## Casos de uso

- Roleplay y diálogo de personajes: el modelo está ajustado sobre datasets de rol (SynthRP, kalo-opus) y puede mantener conversaciones multi-turno con un estilo consistente; su tamaño de 1,5B permite ejecutarlo en local con latencia baja en GPUs de consumo.
- Escritura creativa asistida: generación y continuación de narrativa, descripciones y diálogos, aprovechando el sesgo del ajuste hacia prosa estilizada (nopm_claude_writing_fixed, magnum-v4).
- Prototipado rápido de chatbots en local: con cuantizaciones Q4_K_M (~1,1 GB) se puede desplegar un asistente conversacional en una GPU de 4-8 GB o incluso en CPU, útil para demos y pruebas de concepto.
- Generación de texto en dispositivos con recursos limitados: las cuantizaciones IQ2/IQ3 (0,6-0,9 GB) permiten inferencia en CPUs modestas o GPUs integradas mediante llama.cpp u Ollama, con la penalización de calidad asociada.
- Filtrado y generación de datos sintéticos de rol: el modelo puede emplearse para producir diálogos de entrenamiento o aumentar datasets de roleplay, dado su ajuste específico en ese dominio.
- Experimentación educativa con cuantización: el repositorio incluye un fichero imatrix y una matriz completa de cuantizaciones, lo que lo convierte en un caso práctico para estudiar el impacto de IQ1-IQ6 en la calidad de un modelo pequeño.
- Sustitución de modelos mayores en tareas de prosa no crítica: cuando la latencia o el coste importan más que la precisión factual, un 1,5B ajustado en escritura puede cubrir la generación de textos breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas; solo se aporta una gráfica externa de perplejidad frente a tipos de cuantización (enlace a nethype.de) que compara la calidad relativa de los formatos IQ, no el rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5-0,6 GB para IQ1/IQ2; ~0,7-0,9 GB para Q2_K/IQ3; ~1,0-1,1 GB para IQ4/Q4_K; ~1,2 GB para Q5_K; ~1,4 GB para Q6_K. El modelo base en FP16 requiere aproximadamente 3,1 GB (1,543.714.304 parámetros × 2 bytes) más overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones Q4-Q6 (GTX 1650, RTX 3050, RTX 4060, RTX 4090); para FP16 se recomienda una GPU con 6 GB o más (RTX 3060, RTX 4060 Ti, A100/H100 para despliegues por lotes).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones GGUF; incluso en GPUs integradas o CPU con cuantizaciones IQ2/IQ3.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp (`llama-server`). El tag `endpoints_compatible` del repositorio sugiere compatibilidad con endpoints de inferencia alojados.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un modelo de 1,5B en cuantización Q4_K_M en una GPU de consumo, el throughput esperado es alto (decenas a cientos de tokens por segundo), pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Opusculum-1.5B-i1-GGUF | 1,54B | no disponible | Apache 2.0 | GGUF (i1) | Ajuste orientado a rol y escritura creativa |
| Opusculum-1.5B-GGUF (estático) | 1,54B | no disponible | Apache 2.0 | GGUF (estático) | Mismo modelo base, cuantizaciones sin imatrix |
| Stoned-Code/Opusculum-1.5B-V0.1 | 1,54B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (según documentación pública del modelo) | Apache 2.0 | safetensors, GGUF | Modelo generalista con contexto largo y buen rendimiento en benchmarks; no especializado en rol |

La comparación con alternativas de la misma categoría (modelos densos de ~1,5B) queda limitada porque no se han publicado benchmarks del modelo. Frente a Qwen2.5-1.5B-Instruct, Opusculum prioriza el estilo conversacional y creativo sobre el razonamiento general y el código, y no documenta una ventana de contexto amplia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, toxicidad o alucinación; el ajuste sobre datasets de rol sin filtro de rechazo (kalo-opus-instruct-22k-no-refusal) puede aumentar la probabilidad de contenido inapropiado o de respuestas no alineadas con políticas de seguridad.
- Riesgo de alucinación elevado en tareas factuales: es un modelo de 1,5B ajustado para prosa, no para precisión de conocimiento.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas sin verificación empírica.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad (la propia model card las marca como "for the desperate" o "very low quality"); para producción se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes pueden tener sus propias condiciones; conviene revisar la licencia del modelo base Stoned-Code/Opusculum-1.5B-V0.1 antes de un despliegue comercial.
- El repositorio tiene 0 likes y 831 descargas en el momento de la consulta, lo que indica una adopción limitada y poca validación comunitaria.
- No hay garantía de soporte de plantillas de chat específicas; es necesario verificar el formato de prompt con el modelo base.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/Opusculum-1.5B-i1-GGUF
- Modelo base: https://huggingface.co/Stoned-Code/Opusculum-1.5B-V0.1
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Opusculum-1.5B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Opusculum-1.5B-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
