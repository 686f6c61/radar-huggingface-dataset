# mradermacher/FlashModel-Qwen-3.6-35B-A3B-Maxed-i1-GGUF

## Resumen

FlashModel-Qwen-3.6-35B-A3B-Maxed es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el usuario flashback2k (bajo la marca FlashModel) y construido sobre la arquitectura de Qwen 3.6. Con 35.505.251.456 parámetros totales y un diseño A3B (aproximadamente 3.000 millones de parámetros activos por token), el modelo está orientado a tareas de razonamiento, tool calling, uso agéntico y generación de código, con un enfoque bilingüe inglés-ruso. La ficha que nos ocupa corresponde a la cuantización GGUF realizada por mradermacher mediante el método imatrix, que permite ejecutar el modelo en hardware de consumo.

El problema que resuelve es el habitual en este tipo de derivados: ofrecer una alternativa cuantizada y desplegable localmente de un modelo MoE de gran tamaño, manteniendo un equilibrio razonable entre calidad y requisitos de memoria. La familia Qwen 3.5/3.6 MoE se ha consolidado como referencia para inferencia eficiente en entornos con VRAM limitada, y estas cuantizaciones i1 (imatrix) buscan preservar la calidad del modelo original a tamaños de archivo reducidos.

La relevancia actual del modelo radica en su combinación de licencia Apache 2.0, soporte declarado para tool calling y flujos agénticos, y disponibilidad en múltiples niveles de cuantización (desde Q2_K hasta Q6_K). No obstante, se trata de un fine-tune comunitario sin benchmarks publicados en la información disponible, por lo que su evaluación debe abordarse con cautela y validación empírica propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Qwen 3.6 (tag `qwen3_5_moe`) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | A3B (aproximadamente 3.000 millones activos por token; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); también existen quants estáticos en el repo `-GGUF` |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen 3.6 con diseño Mixture of Experts (tag `qwen3_5_moe`), lo que implica que, pese a sus 35.505 millones de parámetros totales, solo una fracción (del orden de 3.000 millones, según la nomenclatura A3B) se activa por token. Esta configuración permite un throughput sustancialmente mayor que un modelo denso del mismo tamaño, a costa de un uso de memoria determinado por los parámetros totales. El tag `mtp` sugiere soporte de multi-token prediction, una técnica de decodificación que puede acelerar la generación.

En cuanto al entrenamiento, la model card del modelo base lista los siguientes datasets: `open-r1/OpenR1-Math-220k` (matemáticas y razonamiento), `simplescaling/s1K-1.1` (razonamiento con cadenas de pensamiento), `NousResearch/hermes-function-calling-v1` y `glaiveai/glaive-function-calling-v2` (tool calling), y `OpenAssistant/oasst2` (conversación). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La información sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa más allá del MTP) no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en inglés y ruso.
- Razonamiento matemático y de lógica, respaldado por los datasets OpenR1-Math y s1K.
- Tool calling y function calling, con entrenamiento explícito sobre Hermes y Glaive.
- Flujos agénticos y razonamiento multi-paso (tags `agentic` y `reasoning`).
- Generación de código (tag `coding`).
- Soporte bilingüe declarado (inglés y ruso); no se documentan otros idiomas.
- Multi-token prediction (MTP) como mecanismo de decodificación.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito más allá del razonamiento entrenado.

## Casos de uso

- Asistente de atención al cliente bilingüe (inglés-ruso): el modelo puede gestionar conversaciones multi-turno gracias a su entrenamiento sobre OASST2 y su naturaleza conversacional, aunque la longitud de contexto no está documentada y debe validarse antes de desplegarlo en producción.
- Automatización de tool calling en backends: con entrenamiento específico sobre Hermes y Glaive, es adecuado para orquestar llamadas a APIs en pipelines de agentes, siempre que se valide la fiabilidad de las llamadas generadas.
- Generación de código asistida en local: su tag `coding` y su tamaño cuantizado permiten integrarlo en entornos de desarrollo con GPU de consumo, por ejemplo como autocompletado o generación de tests en un IDE.
- Resolución de problemas matemáticos y razonamiento paso a paso: los datasets OpenR1-Math y s1K lo orientan a tareas de razonamiento estructurado, útil en herramientas educativas o de verificación.
- Despliegue en infraestructura con VRAM limitada: las cuantizaciones i1-Q4_K_M (21,8 GB) o i1-Q3_K_M (17,3 GB) permiten ejecutarlo en una sola GPU de 24 GB, lo que facilita prototipado y demos locales.
- Investigación sobre eficiencia MoE: al ser un fine-tune comunitario con cuantizaciones imatrix, sirve como banco de pruebas para estudiar el impacto de la cuantización en modelos MoE de 35B.
- Procesamiento de documentación técnica en ruso e inglés: su bilingüismo declarado lo hace candidato para resumen y extracción de información en esos dos idiomas, con validación previa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF): desde ~13,3 GB (i1-Q2_K) hasta ~29,3 GB (i1-Q6_K); la opción recomendada i1-Q4_K_M ocupa 21,8 GB.
- GPU recomendadas: para i1-Q4_K_M o superiores, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB; para cuantizaciones Q3, una RTX 3090/4090 de 24 GB es suficiente.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y GPUs con 24 GB o más para cuantizaciones Q3-Q4; las cuantizaciones Q5-Q6 requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere integración con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B parámetros activos, se espera un throughput superior al de un denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FlashModel-Qwen-3.6-35B-A3B-Maxed (i1-GGUF) | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | GGUF | Fine-tune comunitario bilingüe en/ru |
| Qwen3.6-35B-A3B (modelo base) | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | safetensors | Modelo original de Qwen |
| FlashModel-Qwen-3.6-35B-A3B-Maxed (GGUF estático) | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | GGUF | Quants estáticos del mismo fine-tune |
| Otros MoE de ~30-40B | no disponible | no disponible | varía | varía | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad real del fine-tune frente al modelo base Qwen 3.6 no está verificada.
- Es un fine-tune comunitario (flashback2k), no un modelo oficial de Qwen; el soporte y la documentación son limitados.
- Idiomas: solo se declaran inglés y ruso; el rendimiento en castellano no está garantizado y debe evaluarse.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta sin consultar el modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de evaluación publicada.
- Las cuantizaciones Q2/Q3 pueden degradar notablemente la calidad, especialmente en tareas de razonamiento y tool calling; se recomienda Q4_K_M o superior para producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets de entrenamiento (algunos pueden tener restricciones adicionales).
- El repo ocupa 279,2 GB en total; la descarga de cuantizaciones individuales es parcial, pero conviene planificar el almacenamiento.
- No se documentan sesgos específicos; deben evaluarse empíricamente antes de un despliegue en producción.

## Enlaces

- [Modelo cuantizado en Hugging Face](https://huggingface.co/mradermacher/FlashModel-Qwen-3.6-35B-A3B-Maxed-i1-GGUF)
- [Modelo base](https://huggingface.co/flashback2k/FlashModel-Qwen-3.6-35B-A3B-Maxed)
- [Quants estáticos del mismo modelo](https://huggingface.co/mradermacher/FlashModel-Qwen-3.6-35B-A3B-Maxed-GGUF)
- [Página de descargas del autor](https://hf.tst.eu/model#FlashModel-Qwen-3.6-35B-A3B-Maxed-i1-GGUF)
- [Licencia del modelo base Qwen](https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Análisis de tipos de cuantización (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [Dataset OpenR1-Math-220k](https://huggingface.co/datasets/open-r1/OpenR1-Math-220k)
- [Dataset s1K-1.1](https://huggingface.co/datasets/simplescaling/s1K-1.1)
- [Dataset Hermes function calling v1](https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1)
- [Dataset Glaive function calling v2](https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2)
- [Dataset OpenAssistant OASST2](https://huggingface.co/datasets/OpenAssistant/oasst2)
