# DavidAU/Qwen3-VL-8B-GLM-4.7-Flash-Heretic-Uncensored-Thinking

## Resumen

Qwen3-VL-8B-GLM-4.7-Flash-Heretic-Uncensored-Thinking es un modelo multimodal de tipo image-text-to-text publicado por el usuario DavidAU en Hugging Face. Se construye sobre `coder3101/Qwen3-VL-8B-Instruct-heretic`, una variante ya "abliterada" (descensurada mediante técnicas Heretic) del Qwen3-VL-8B-Instruct de Alibaba, a la que se le ha aplicado un ajuste fino supervisado con el dataset `TeichAI/glm-4.7-2000x` para implantar trazas de razonamiento al estilo GLM 4.7 Flash. El resultado es un modelo denso de 8.767 millones de parámetros que combina percepción visual, contexto largo y un modo de pensamiento explícito, con las barreras de seguridad eliminadas.

El modelo resuelve el problema de disponer de un VLM de tamaño medio (8B) con razonamiento explícito y sin restricciones de contenido, orientado a generación creativa, rol y análisis de imágenes sin filtros. Frente al modelo base instruct, el autor reporta mejoras sustanciales en benchmarks de conocimiento y razonamiento (por ejemplo, ARC-Challenge de 0,437 a 0,572 y HellaSwag de 0,526 a 0,716), atribuidas al modo thinking implantado. La ficha declara 256k tokens de contexto, licencia Apache 2.0 y soporte de inglés y chino.

Es relevante ahora porque demuestra una cadena de herramientas completa y reproducible (Heretic para abliteración, Unsloth para entrenamiento, destilación de trazas de un modelo mayor) aplicada a un VLM de última generación, y porque ilustra los riesgos y límites del ecosistema de modelos "uncensored": la licencia permisiva no elimina las implicaciones éticas ni la responsabilidad legal del despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3-VL: visión ViT + LLM, con Interleaved-MRoPE y DeepStack) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens (ampliable a 1M según la model card del base Qwen3-VL) |
| Tipos de cuantizacion | bfloat16 nativo; el autor menciona cuantizaciones de Mradermacher (GGUF) sin detallar los niveles |
| Idiomas soportados | en, zh (OCR del base: 32 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); se mencionan GGUF de terceros |

## Arquitectura y entrenamiento

La base es Qwen3-VL-8B-Instruct, un transformer multimodal denso que empareja un codificador visual ViT con un LLM de 8B. Incorpora dos innovaciones del base: Interleaved-MRoPE, que reparte las frecuencias posicionales entre tiempo, anchura y altura para el razonamiento sobre vídeo de horizonte largo, y DeepStack, que fusiona características ViT de varios niveles para capturar detalle fino. El contexto nativo es de 256k tokens, ampliable a 1M según la documentación de Qwen.

Sobre esa base, `coder3101` aplicó primero Heretic para abliterar el modelo (eliminar direcciones de rechazo en el espacio de activaciones). DavidAU realizó después un ajuste fino supervisado con Unsloth sobre el dataset `TeichAI/glm-4.7-2000x`, compuesto por trazas de razonamiento destiladas de GLM 4.7 Flash, con el objetivo de convertir un modelo instruct en un modelo thinking sin arrastrar las trazas de razonamiento nativas de Qwen. El autor declara que el entrenamiento se ejecutó en hardware local con Linux para Windows. No se especifican número de tokens de entrenamiento, composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto y razonamiento con modo thinking explícito (trazas compactas al estilo GLM 4.7 Flash).
- Comprensión de imagen y texto combinados (image-text-to-text): descripción, análisis y razonamiento sobre imágenes.
- OCR ampliado a 32 idiomas en el modelo base, con tolerancia a baja luz, desenfoque e inclinación.
- Percepción espacial 2D y 3D: posiciones de objetos, oclusión, viewpoints y grounding para IA encarnada.
- Comprensión de vídeo de larga duración con indexación a nivel de segundo (según el base).
- Generación de código visual: Draw.io, HTML, CSS y JS a partir de imágenes o vídeos.
- Capacidades de agente visual: reconocimiento de elementos de GUI, invocación de herramientas y ejecución de tareas multi-paso.
- Soporte multilingüe limitado a inglés y chino según los metadatos, aunque el OCR cubre más idiomas.
- Generación creativa sin restricciones: ficción, rol, horror, contenido para adultos y lenguaje explícito.
- El autor afirma que se preservan las funciones y métricas del Qwen original, incluyendo tool calling, aunque no se detalla la interfaz exacta.

## Casos de uso

- Análisis de imágenes sin filtros de contenido: el modelo acepta todo tipo de imágenes y genera descripciones detalladas, útil en investigación de visión por computador donde los filtros de seguridad del modelo base bloquean categorías legítimas (anatomía, violencia en medios, contenido histórico sensible).
- Generación de ficción y rol de largo aliento: con 256k tokens de contexto puede mantener coherencia en novelas, campañas de rol o series de relatos, y el modo thinking mejora la planificación de tramas y subtramas.
- Automatización de GUI y agentes visuales: reconocimiento de elementos de pantalla e invocación de herramientas para tareas de RPA o testing de interfaces, aprovechando las capacidades de agente visual heredadas de Qwen3-VL.
- Extracción de datos de documentos escaneados: OCR multilingüe con razonamiento sobre la estructura del documento, adecuado para digitalización de archivos con texto degradado o caracteres poco frecuentes.
- Generación de código a partir de mockups: conversión de capturas de interfaz en HTML/CSS/JS o diagramas Draw.io, con el modo thinking para descomponer la tarea.
- Investigación sobre alineación y descensurado: el modelo sirve como caso de estudio reproducible de la técnica Heretic (KLD 0,1738, 6/100 rechazos frente a 100/100 del original) para medir el coste de eliminar la alineación de seguridad.
- Asistente creativo multimodal para equipos de narrativa visual: análisis de storyboards o fotogramas combinado con generación de guion y diálogo sin restricciones de tono.

## Benchmarks y rendimiento

Resultados reportados por el autor (evaluación tipo lm-eval, cortesía de @Nightmedia), comparando el modelo thinking con el base instruct heretic sin ajustar:

| Benchmark | Este modelo | Qwen3-VL-8B-Instruct-heretic (sin thinking) |
|---|---|---|
| ARC-Challenge | 0,572 | 0,437 |
| ARC-Easy | 0,767 | 0,583 |
| BoolQ | 0,846 | 0,874 |
| HellaSwag | 0,716 | 0,526 |
| OpenBookQA | 0,406 | 0,412 |
| PIQA | 0,798 | 0,742 |
| Winogrande | 0,679 | 0,583 |

Métricas de descensurado declaradas por el autor:

| Métrica | Este modelo | Qwen3-VL-8B-Instruct original |
|---|---|---|
| Divergencia KL | 0,1738 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks multimodales (MMMU, DocVQA) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 17,5 GB solo de pesos, más overhead de activaciones y caché KV; se recomienda 24 GB o más para contexto moderado.
- En cuantización de 8 bits: en torno a 9-10 GB; en 4 bits: en torno a 5-6 GB (estimación a partir del tamaño de pesos, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para contexto completo de 256k; RTX 4090 (24 GB) para bfloat16 con contexto reducido; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) con cuantización; en bfloat16 completo requiere al menos 24 GB.
- Despliegue: transformers (librería declarada), vLLM y TGI para serving de alto rendimiento; llama.cpp/Ollama vía las cuantizaciones GGUF de Mradermacher mencionadas por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo | 8,77B | 256k | Apache 2.0 | VLM descensurado con thinking GLM 4.7 Flash |
| Qwen/Qwen3-VL-8B-Instruct | 8B (aprox.) | 256k (1M ampliable) | Apache 2.0 | Base oficial con alineación de seguridad intacta |
| coder3101/Qwen3-VL-8B-Instruct-heretic | 8B (aprox.) | 256k | Apache 2.0 | Abliterado sin modo thinking; sirve de referencia en los benchmarks |
| Qwen3-VL-8B-Thinking (oficial) | 8B (aprox.) | 256k | Apache 2.0 | Edición thinking oficial de Qwen, con trazas de razonamiento nativas y filtros de seguridad |

No se dispone de datos de benchmarks comparativos con la edición Thinking oficial de Qwen en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente descensurado: genera contenido para adultos, violencia y lenguaje soñez sin filtros; no es apto para despliegues orientados al público general ni para menores.
- Riesgo elevado de alucinación, agravado por el modo thinking: las trazas de razonamiento pueden presentar como certezas inferencias no verificadas.
- La abliteración no elimina los sesgos de los datos de entrenamiento originales; pueden aparecer sesgos de género, raza o cultura sin mitigación.
- La divergencia KL de 0,1738 indica cierta degradación respecto al original; el autor la considera excelente, pero implica cambios medibles en la distribución de salida.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está evaluado.
- Aunque la licencia es Apache 2.0, el contenido generado puede infringir normativas locales (por ejemplo, material de abuso, difamación o propiedad intelectual); la responsabilidad recae en el desplegador.
- El modelo es un fine-tune comunitario de un solo autor, sin revisión por pares ni garantías de mantenimiento; el repositorio se actualizó por última vez en noviembre de 2026.
- El contexto de 256k consume gran cantidad de VRAM en caché KV; en GPU de consumo habrá que reducirlo drásticamente.
- No se documentan evaluaciones de seguridad, red-teaming ni pruebas de robustez multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3-VL-8B-GLM-4.7-Flash-Heretic-Uncensored-Thinking
- Modelo base inmediato: https://huggingface.co/coder3101/Qwen3-VL-8B-Instruct-heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de destilación: https://huggingface.co/datasets/TeichAI/glm-4.7-2000x
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
- Repositorio de Qwen3-VL (referenciado en la model card): https://github.com/QwenLM/Qwen3-VL
