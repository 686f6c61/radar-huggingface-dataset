# 360ZhiNao/360Zhinao3-7B

## Resumen

360Zhinao3-7B es un modelo de lenguaje de 7.774 millones de parámetros (7,77B), desarrollado por Qihoo 360 (奇虎360), presentado como la tercera generación de su familia 360Zhinao (360智脑). Se trata de un modelo base (pretrain) orientado a generación de texto, publicado bajo licencia Apache 2.0 y entrenado principalmente para chino e inglés. Su relevancia radica en que, según la model card, encabeza varias clasificaciones de benchmarks entre modelos de menos de 10B de parámetros, compitiendo con alternativas consolidadas como Qwen2.5-7B, GLM4-9B o Llama3.1-8B.

El modelo mantiene exactamente la misma arquitectura que su predecesor 360Zhinao2-7B y la mejora de rendimiento procede de un preentrenamiento continuado con 700B tokens de alta calidad, no de cambios estructurales. La familia se completa con dos variantes afinadas: 360Zhinao3-7B-Instruct (conversacional) y 360Zhinao3-7B-O1.5 (cadena de pensamiento larga), aunque esta ficha se centra en el modelo base publicado en el repositorio.

La información disponible sobre la arquitectura interna, el contexto máximo del modelo base y los detalles del dataset de entrenamiento es limitada; los datos que no constan en la model card se indican explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles internos no disponibles; estructura idéntica a 360Zhinao2-7B) |
| Parámetros totales | 7.774.605.312 (7,77B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para el modelo base (la familia 360Zhinao2 ofrece variantes de 4K, 32K y 360K; no se confirma el contexto de esta versión) |
| Tipos de cuantización | No especificados en la model card; pesos publicados en BF16 (susceptibles de cuantización a GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

360Zhinao3-7B es un transformer decoder-only de tipo denso. La model card indica que comparte exactamente la misma estructura que 360Zhinao2-7B, por lo que la evolución no introduce cambios arquitectónicos: el salto de rendimiento se atribuye íntegramente a la mejora en la calidad de los datos. El modelo se ha obtenido mediante preentrenamiento continuado sobre 360Zhinao2-7B con 700B tokens de alta calidad adicionales.

No se detalla en la información disponible la composición del dataset, la proporción chino/inglés, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado en el modelo base (por definición, un modelo pretrain no incluye alineamiento conversacional; eso corresponde a la variante Instruct). Tampoco se especifican innovaciones técnicas como atención lineal, decodificación especulativa o arquitecturas híbridas SSM. El informe técnico de la familia original (arXiv:2405.13386) corresponde a 360Zhinao-7B v1.0 y puede contener detalles arquitectónicos de la línea base, pero no se ha confirmado que documente los cambios de la versión 3.

## Capacidades

- Generación de texto autoregresiva en chino e inglés a partir de un prompt (modelo base, sin alineamiento conversacional).
- Razonamiento y conocimiento enciclopédico: evaluación en C-Eval, CMMLU, MMLU, ARC y tareas de comprensión.
- Comprensión lectora y respuesta a preguntas (BoolQ, commonsense_qa, C3, RACE).
- Tareas de inferencia lingüística y resolución de correferencia (WiC, WSC).
- Resumen y generación de titulares en chino (LCSTS).
- Clasificación de sentimiento y análisis de opiniones (eprstmt-dev).
- Capacidad de continuación de texto y modelado de lenguaje (LAMBADA).
- Punto de partida para fine-tuning: al ser un modelo base, sirve como sustrato para ajuste supervisado, LoRA o QLoRA en dominios específicos.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento para esta variante base (la cadena de pensamiento corresponde a la variante O1.5).

## Casos de uso

- Fine-tuning para atención al cliente en chino: al ser un modelo base con licencia Apache 2.0, puede ajustarse con datos propios de conversaciones multi-turno y desplegarse en entornos de soporte; su rendimiento en C-Eval (84,7) y CMMLU (82,17) lo hace adecuado para dominios con terminología china.
- Generación de resúmenes automáticos de documentos: el buen resultado en LCSTS (18,85, el mejor de la comparativa) sugiere utilidad para resumir noticias y textos largos en chino tras un ajuste específico.
- Clasificación y análisis de sentimiento en redes sociales: su puntuación en eprstmt-dev (92,50) lo posiciona bien para pipelines de moderación y análisis de opiniones en chino.
- Base para asistentes conversacionales: partiendo del modelo base, un ajuste supervisado permite construir un chat de dominio; la variante Instruct ya publicada puede usarse directamente si no se requiere personalización.
- Investigación en entrenamiento continuado: al documentarse explícitamente el proceso de preentrenamiento continuado con 700B tokens, sirve como caso de estudio para experimentos de mejora de datos sobre un checkpoint existente.
- Evaluación comparativa de modelos pequeños: útil como referencia en estudios de benchmarking de modelos sub-10B en tareas chinas e inglesas, dado el conjunto de resultados publicado.
- Extracción de conocimiento y respuesta a preguntas sobre documentación interna: tras fine-tuning con datos corporativos, puede emplearse en sistemas RAG para responder consultas en chino e inglés.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base, evaluados con OpenCompass:

| Tipo | Dataset | Idioma | 360Zhinao3-7B | 360Zhinao2-7B | Qwen2.5-7B | Llama3.1-8B | GLM4-9B |
|---|---|---|---|---|---|---|---|
| Exam | C-Eval | zh | **84,70** | 83,04 | 81,41 | 51,67 | 75,83 |
| Exam | MMLU | en | 75,42 | 67,84 | 75,50 | 66,75 | 75,50 |
| Exam | CMMLU | zh | **82,17** | 73,80 | 81,79 | 52,49 | 74,24 |
| Exam | ARC-c | en | 88,14 | 87,12 | 80,00 | 80,68 | 94,92 |
| Exam | ARC-e | en | 94,00 | 92,77 | 84,83 | 89,77 | 98,41 |
| Language | WiC | en | 50,31 | 49,84 | 52,82 | 50,00 | 51,57 |
| Language | WSC | en | **71,15** | 65,38 | 68,27 | 67,31 | 68,27 |
| Knowledge | BoolQ | en | 88,38 | 88,29 | 83,88 | 82,20 | 81,80 |
| Knowledge | commonsense_qa | en | 71,33 | 69,78 | 73,22 | 71,25 | 71,17 |
| Understanding | C3 | zh | 92,77 | 93,26 | 92,00 | 83,51 | 91,51 |
| Understanding | race-middle | en | 90,04 | 90,46 | 91,02 | 81,69 | 91,99 |
| Understanding | race-high | en | 85,96 | 86,74 | 87,91 | 78,73 | 90,71 |
| Understanding | LCSTS | zh | **18,85** | 18,61 | 15,82 | 17,29 | 18,29 |
| Understanding | eprstmt-dev | zh | **92,50** | 90,00 | 86,88 | 83,12 | 91,88 |

La model card afirma que la media de benchmarks del modelo ocupa el primer puesto entre modelos de menos de 10B parámetros. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks de código o matemáticas para esta variante.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 15,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 20-24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 4,5-5,5 GB de pesos.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G para despliegues en BF16 con concurrencia.
- GPU de consumo: cabe en RTX 3090, RTX 4090 (24 GB) en BF16; en cuantización 4 bits puede ejecutarse en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) y en Apple Silicon con memoria unificada.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp u Ollama previa conversión a GGUF (no se distribuyen pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se publican mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento destacado |
|---|---|---|---|---|---|
| 360Zhinao3-7B | 7,77B | No disponible | Apache 2.0 | zh, en | C-Eval 84,70; CMMLU 82,17; LCSTS 18,85 |
| Qwen2.5-7B | 7B | No disponible en esta ficha | No disponible en esta ficha | Multilingüe | C-Eval 81,41; CMMLU 81,79; MMLU 75,50 |
| Llama3.1-8B | 8B | No disponible en esta ficha | No disponible en esta ficha | Multilingüe | MMLU 66,75; ARC-c 80,68 |
| GLM4-9B | 9B | No disponible en esta ficha | No disponible en esta ficha | zh, en | ARC-c 94,92; ARC-e 98,41; C-Eval 75,83 |

360Zhinao3-7B destaca en tareas en chino (C-Eval, CMMLU, LCSTS, eprstmt-dev) frente a sus competidores directos, mientras que en tareas en inglés queda por detrás de GLM4-9B en ARC y de Qwen2.5-7B en commonsense_qa y WiC. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales conocidas.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento: no está diseñado para conversación directa ni para seguir instrucciones; para uso conversacional debe emplearse la variante Instruct o realizar fine-tuning.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mecanismos específicos de mitigación en la información disponible.
- Sesgos potenciales derivados de los datos de preentrenamiento, no caracterizados en la model card.
- Cobertura lingüística limitada a chino e inglés; el rendimiento en otros idiomas no está documentado.
- La longitud de contexto del modelo base no se especifica; no debe asumirse la ventana de 360K de generaciones anteriores sin confirmación.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias y de los datos de fine-tuning propios.
- El repositorio muestra cero descargas y cero likes en el momento de la consulta, lo que sugiere una adopción aún incipiente y escasa validación por parte de la comunidad.
- No se publican resultados de benchmarks de código, matemáticas o tool calling para esta variante, por lo que su idoneidad en esos dominios no está respaldada por datos.

## Enlaces

- Hugging Face (modelo base): https://huggingface.co/360ZhiNao/360Zhinao3-7B
- Hugging Face (organización): https://huggingface.co/qihoo360
- Variante Instruct: https://huggingface.co/qihoo360/360Zhinao3-7B-Instruct
- Variante O1.5: https://huggingface.co/qihoo360/360Zhinao3-7B-O1.5
- Repositorio GitHub: https://github.com/Qihoo360/360zhinao3
- Sitio oficial: https://ai.360.com
- Informe técnico (familia 360Zhinao v1.0): https://arxiv.org/abs/2405.13386
