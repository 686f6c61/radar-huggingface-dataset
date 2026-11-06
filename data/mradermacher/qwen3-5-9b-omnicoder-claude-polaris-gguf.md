# mradermacher/Qwen3.5-9B-OmniCoder-Claude-Polaris-GGUF

## Resumen

Qwen3.5-9B-OmniCoder-Claude-Polaris-GGUF es la versión cuantizada en formato GGUF del modelo nightmedia/Qwen3.5-9B-OmniCoder-Claude-Polaris, un fine-tune de la familia Qwen3.5 con aproximadamente 8.950 millones de parámetros. La cuantización la firma mradermacher, un conocido publicador de quants estáticos y con imatrix para llama.cpp, que distribuye el modelo en múltiples niveles de compresión (de Q2_K a f16, más suplementos multimodales mmproj). El modelo original combina un fine-tune orientado a código ("OmniCoder") con técnicas de "abliteration" y "heretic" para eliminar restricciones de seguridad, y está etiquetado explícitamente como uncensored y orientado a escritura creativa, ficción y roleplaying.

El interés práctico de esta ficha radica en que permite ejecutar un modelo de ~9B con capacidades multimodales (por los ficheros mmproj) en hardware de consumo mediante llama.cpp y Ollama, manteniendo la licencia Apache 2.0 del modelo base. No obstante, conviene advertir que el modelo ha sido modificado para eliminar salvaguardas, lo que lo hace inadecuado para despliegues en producción orientados al público general sin filtros adicionales.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del repositorio cuantizado es fundamentalmente una plantilla de mradermacher y no incluye detalles técnicos del modelo original más allá de los tags y el nombre del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parámetros totales | 8.953.803.264 (~8,95B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en bfloat16 |

## Arquitectura y entrenamiento

El modelo base nightmedia/Qwen3.5-9B-OmniCoder-Claude-Polaris es un fine-tune sobre la familia Qwen3.5, con unos 8,95B parámetros en precisión bfloat16. Los tags del repositorio indican que se ha construido mediante técnicas de "abliteration" y "heretic" (eliminación de direcciones de rechazo en el espacio de activaciones), y que incorpora un proceso de merge con mergekit. También aparecen etiquetas de unsloth, mxfp4 y mlx, lo que sugiere que el autor empleó herramientas de Unsloth para el fine-tune y que existen variantes en formatos MLX y MXFP4. El nombre "OmniCoder-Claude-Polaris" apunta a un entrenamiento orientado a código y a la imitación de estilos de asistente tipo Claude, aunque no se detalla la composición del dataset ni el número de tokens de entrenamiento.

La versión que nos ocupa es una cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) generada por mradermacher con llama.cpp. Incluye ficheros mmproj, lo que confirma que el modelo original es multimodal (probablemente visión-lenguaje), aunque la model card no especifica qué modalidades exactamente. No se dispone de información sobre RLHF, DPO ni sobre innovaciones de atención o decodificación.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline conversational).
- Generación de código, coherente con la denominación "OmniCoder" y el fine-tune sobre un modelo Qwen.
- Capacidades multimodales: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada visual (imagen), aunque no se detalla en la model card.
- Escritura creativa: ficción, generación de tramas y subtramas, continuación de escenas, narrativa de todos los géneros (ciencia ficción, romance, etc.).
- Roleplaying y escritura vívida ("vivid prosing").
- Modo "uncensored": el modelo ha sido modificado para reducir rechazos, lo que afecta a su comportamiento en consultas sensibles.
- Idiomas: inglés (en) y chino (zh) declarados explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa asistida: el modelo está específicamente afinado para generar ficción, tramas y subtramas, y para continuar escenas; un escritor puede usarlo como generador de borradores o de variantes narrativas con control de estilo.
- Roleplaying y narrativa interactiva: su etiqueta "roleplaying" y su naturaleza uncensored lo hacen adecuado para motores de juegos de rol por texto o novelas visuales donde se requiere libertad creativa y coherencia de personaje.
- Generación de código en local: al ser un fine-tune "OmniCoder" de ~9B en GGUF, puede integrarse en editores (Continue, Cursor con backend local) o en scripts de automatización para autocompletado y generación de funciones en máquinas sin GPU de datacenter.
- Prototipado multimodal en estación de trabajo: gracias a los ficheros mmproj, puede emplearse para tareas de descripción de imágenes o extracción de información visual en entornos de investigación donde no se quiere enviar datos a la nube.
- Experimentación en investigación sobre alineación y seguridad: al ser un modelo abliterated, sirve como caso de estudio para medir la eficacia de las técnicas de eliminación de rechazos y evaluar riesgos de modelos sin salvaguardas.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB) puede ejecutarse en GPUs de 8-12 GB o incluso en CPU, lo que facilita demos y pruebas offline.
- Generación de contenido en inglés y chino: útil para proyectos bilingües de narrativa o documentación técnica en esos dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~3,7 GB; Q3_K_M ~4,7 GB; IQ4_XS ~5,2 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB. Añadir 0,7-1,0 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M con contexto moderado; RTX 4090 24 GB para Q8_0 o f16 con contexto largo; A100/H100 solo si se necesita alto throughput o contexto muy extenso.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando Q4_K_S/Q4_K_M; también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server o vLLM (vLLM requiere el modelo en safetensors, no GGUF).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-OmniCoder-Claude-Polaris-GGUF (este) | ~8,95B | no disponible | Apache 2.0 | GGUF | Fine-tune uncensored orientado a código y ficción; multimodal vía mmproj |
| Qwen2.5-Coder-7B-Instruct (referencia de la familia) | ~7,6B | 32.768 tokens (versión 2.5) | Apache 2.0 | safetensors, GGUF | Modelo oficial de código, con salvaguardas; contexto y benchmarks publicados |
| Llama-3.1-8B-Instruct | ~8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista con contexto largo y ecosistema amplio |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia ligera para despliegue en consumo |

La comparación es aproximada: no hay datos de benchmarks del modelo evaluado, y las cifras de contexto de los competidores provienen de sus fichas oficiales, no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": se han eliminado deliberadamente las salvaguardas, por lo que puede generar contenido sensible, ofensivo o inseguro sin filtros. No es apto para aplicaciones de cara al público sin una capa de moderación adicional.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks; el fine-tune creativo puede priorizar la coherencia narrativa sobre la veracidad factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificación empírica.
- La model card del repositorio cuantizado es una plantilla genérica de mradermacher y no aporta información sobre el dataset, el proceso de alineación ni las limitaciones del modelo original.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin salvaguardas puede acarrear riesgos legales y reputacionales según la jurisdicción y el sector.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; para producción se recomienda Q4_K_M o superior.
- El modelo base tiene fecha de creación de marzo de 2026 y actualización de noviembre de 2026; verificar la vigencia de la información antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.5-9B-OmniCoder-Claude-Polaris-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-OmniCoder-Claude-Polaris
- Quants con imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-OmniCoder-Claude-Polaris-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-OmniCoder-Claude-Polaris-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
