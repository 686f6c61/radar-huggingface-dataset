# mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-GGUF es la versión cuantizada en formato GGUF del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, una variante "abliterated" (sin censura) de la familia Qwen3.8 Flash-Next. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF para llama.cpp, y el resultado se distribuye con licencia Apache 2.0. El modelo base es de tipo Mixture-of-Experts (MoE) con capacidades multimodales (visión-lenguaje) y de function calling, según las etiquetas de la model card.

Con 176.943.899.520 parámetros totales (unos 177.000 millones), se trata de un modelo de gran escala que, gracias a su arquitectura MoE, activa solo una fracción de los parámetros por token, lo que abarata la inferencia frente a un denso equivalente. La versión GGUF permite ejecutarlo en llama.cpp y herramientas compatibles, con cuantizaciones que van desde Q2_K (80,5 GB) hasta Q8_0 (188,3 GB), además de un módulo multimodal separado (mmproj) para el procesamiento de imágenes.

Su relevancia actual radica en dos factores: por un lado, ofrece una alternativa sin filtros de seguridad para tareas de red-teaming e investigación en seguridad de IA (etiquetas "ai-red-team", "red-teaming", "uncensored"); por otro, al estar en GGUF, democratiza el acceso a un MoE de ~177B en hardware de gama alta de consumo o en servidores con varias GPU, algo impensable en formato bf16 completo. El repositorio acumula más de 349.000 descargas, lo que indica una adopción notable pese a su reciente publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, multimodal (vision-language) según etiquetas de la model card |
| Parámetros totales | 176.943.899.520 (~177B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts de tipo transformer con capacidades de visión-lenguaje, function calling y razonamiento, según las etiquetas declaradas por el autor (moe, vision-language, function-calling, reasoning, mtp). La etiqueta "mtp" sugiere multi-token prediction, una técnica de decodificación especulativa que permite predecir varios tokens por paso y acelerar la generación, aunque no se detalla su implementación. El modelo ha pasado por fases de post-entrenamiento y fine-tuning (etiquetas "post-training", "fine-tuning") y por un proceso de "abliteration", que elimina o atenúa las capas de rechazo del modelo original para producir una variante sin censura.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO en el pipeline. Tampoco se detalla la configuración del MoE (número de expertos, expertos activos por token, ratio de activación). La cuantización la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estáticas y, en un repositorio separado, cuantizaciones ponderadas con imatrix (i1-GGUF). El módulo mmproj se distribuye aparte para habilitar la entrada de imágenes en llama.cpp.

## Capacidades

- Generación de texto y razonamiento multi-paso, con etiqueta explícita de "reasoning".
- Procesamiento de imágenes (vision-language) mediante el módulo mmproj-Q8_0 o mmproj-f16.
- Function calling / tool calling, lo que permite integración con APIs y agentes.
- Capacidades de agente y razonamiento encadenado (multi-step reasoning).
- Multilingüe limitado a inglés y chino.
- Modo sin censura (abliterated): responde a peticiones que el modelo original rechazaría, orientado a red-teaming.
- Predicción multi-token (MTP) según la etiqueta, con posible aceleración de decodificación.
- Compatible con endpoints (etiqueta "endpoints_compatible") y uso conversacional.

## Casos de uso

- Red-teaming y auditoría de seguridad: el modelo, al estar abliterated, permite generar respuestas que un modelo alineado rechazaría, lo que lo hace útil para probar la robustez de filtros y clasificadores de seguridad en pipelines de moderación.
- Investigación en alineación y seguridad de IA: sirve como contraste para estudiar qué comportamientos emergen al eliminar las capas de rechazo y cómo varían con la cuantización (comparando Q4_K_M con Q8_0).
- Asistente conversacional multimodal en local: con el mmproj cargado en llama.cpp, puede describir imágenes, responder preguntas sobre capturas o documentos escaneados, manteniendo la conversación en inglés o chino.
- Automatización de agentes con tool calling: integrado en un orquestador que exponga funciones (APIs, bases de datos), el modelo puede decidir qué herramienta invocar y encadenar pasos, aprovechando su etiqueta de function-calling.
- Generación de código y razonamiento técnico: aunque no se declara explícitamente "code", el razonamiento y el function calling permiten usarlo en tareas de generación y revisión de código en inglés, con la cautela de que la ausencia de censura puede producir sugerencias inseguras.
- Despliegue en servidores con múltiples GPU para inferencia por lotes: las cuantizaciones Q4_K_M (119,3 GB) o Q5_K_M (134,2 GB) permiten servir el modelo en 4-8 GPU de 24-48 GB, ofreciendo una alternativa MoE de gran escala sin depender de APIs externas.
- Experimentación con cuantizaciones extremas: las variantes Q2_K (80,5 GB) e IQ4_XS (98,5 GB) permiten estudiar la degradación de calidad de un MoE de ~177B en hardware más modesto, comparando perplejidad y coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto y KV cache):
  - Q2_K: ~80,5 GB de pesos; requiere al menos ~90-100 GB de VRAM total para contexto moderado.
  - Q3_K_M: ~94,2 GB; ~105-115 GB de VRAM.
  - IQ4_XS: ~98,5 GB; ~110-120 GB de VRAM.
  - Q4_K_M: ~119,3 GB; ~130-140 GB de VRAM.
  - Q5_K_M: ~134,2 GB; ~145-155 GB de VRAM.
  - Q6_K: ~167,7 GB; ~180-190 GB de VRAM.
  - Q8_0: ~188,3 GB; ~200-210 GB de VRAM.
  - Añadir ~0,7-1,0 GB para el mmproj si se usa visión.
- GPU recomendadas: para Q4_K_M o Q5_K_M, 4-6 GPU de 24 GB (RTX 4090, L4) o 2-4 GPU de 48-80 GB (A6000, A100 80 GB, H100). Para Q8_0, 3-4 A100/H100 de 80 GB.
- ¿Cabe en consumer GPU? No en una sola. Las cuantizaciones más pequeñas (Q2_K, IQ4_XS) caben en configuraciones de 4-5 RTX 4090 (24 GB cada una) o 2 RTX 6000 Ada (48 GB). No cabe en una RTX 4090 individual ni en una RTX 3090.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se publica el manifiesto), LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para ellos habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Al ser MoE, el throughput depende del número de parámetros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-GGUF (este) | ~177B (MoE) | no disponible | Apache 2.0 | GGUF | Abliterated, multimodal, function calling |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (base) | ~177B (MoE) | no disponible | Apache 2.0 | safetensors/bf16 | Modelo original sin cuantizar |
| mradermacher/Qwen3.8-Flash-Next-Uncensored-i1-GGUF | ~177B (MoE) | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas, mayor calidad por bit |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o inseguro. No debe desplegarse en producción orientada a usuarios finales sin capas de moderación externas.
- Riesgo elevado de alucinación, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) y en tareas de razonamiento largo.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin verificar el valor real en la configuración del modelo.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- El modelo base tiene licencia Apache 2.0, pero el uso comercial de una variante abliterated puede conllevar riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- El repositorio ocupa 1.308,6 GB en total; descargar una sola cuantización requiere entre 80 y 190 GB de disco.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre la composición del dataset de entrenamiento.
- La etiqueta "qwen4" y "qwen3.8" no corresponden a nomenclatura oficial verificable; conviene tratar la identidad exacta del modelo base con cautela.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-Flash-Next-Uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f
