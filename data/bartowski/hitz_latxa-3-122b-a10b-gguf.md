# bartowski/HiTZ_Latxa-3-122B-A10B-GGUF

## Resumen

Latxa-3-122B-A10B es un modelo de lenguaje de gran escala especializado en euskera, desarrollado por HiTZ (Centro Vasco de Tecnología del Lenguaje, UPV/EHU). Se trata de un modelo MoE (Mixture of Experts) con 122.111.526.912 parámetros totales y aproximadamente 10B parámetros activos por token, lo que lo convierte en la variante de mayor capacidad de la familia Latxa 3. El modelo se distribuye bajo licencia Apache 2.0 y está diseñado para cubrir tareas de generación de texto, razonamiento, conocimiento cultural y traducción en euskera e inglés.

La ficha que nos ocupa corresponde a la cuantización GGUF publicada por bartowski, que permite ejecutar el modelo con llama.cpp en hardware más modesto que los pesos BF16 originales. El repositorio incluye desde bf16 completo (244,31 GB) hasta cuantizaciones agresivas, además de un archivo mmproj para entrada multimodal (texto e imagen), tal como indica la pipeline `image-text-to-text`.

Su relevancia actual radica en que cubre un nicho poco atendido por los grandes modelos generalistas: el euskera como idioma principal, con evaluaciones específicas en normativa Batua, exámenes, lectura, trivia y conocimiento cultural local y global. La combinación de arquitectura MoE, contexto amplio (no especificado en la información disponible) y licencia permisiva lo hace atractivo para despliegues en producción dentro de la administración, educación y medios en euskera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 122.111.526.912 (122B) |
| Parametros activos | ~10B (según nomenclatura A10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q4_K_M y otras variantes GGUF (imatrix) |
| Idiomas soportados | eu (euskera), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Latxa-3-122B-A10B emplea una arquitectura transformer con mezcla de expertos (MoE), con 122B parámetros totales y aproximadamente 10B activos por token, lo que reduce el coste computacional por inferencia frente a un modelo denso del mismo tamaño. El modelo base fue entrenado por HiTZ sobre el corpus `HiTZ/latxa-corpus-v2`, un dataset específicamente orientado al euskera. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

La cuantización GGUF de bartowski se generó con llama.cpp release b12600 e incluye imatrix (importance matrix) para mejorar la calidad de las cuantizaciones de baja precisión. El modelo soporta entrada multimodal texto-imagen mediante un archivo mmproj separado. No se indica decodificación especulativa en esta versión cuantizada. El formato de prompt sigue el esquema ChatML con etiquetas `<|im_start|>` / `<|im_end|>` y un bloque `<think>` para razonamiento explícito, además de un formato XML específico para tool calling.

## Capacidades

- Generación de texto conversacional multi-turno en euskera e inglés.
- Razonamiento explícito mediante modo thinking (`<think>`).
- Conocimiento cultural local (País Vasco) y global, evaluado en BertaQA.
- Comprensión lectora y respuesta a exámenes tipo test y abiertos.
- Traducción entre euskera, inglés y castellano (FLORES y ALIA DocMT).
- Soporte de tool calling / function calling con formato XML estructurado.
- Entrada multimodal texto-imagen mediante archivo mmproj.
- Capacidad de seguir instrucciones con system prompt y fecha dinámica.
- No se especifican capacidades de audio ni de agentes multi-paso autónomos en la información disponible.

## Casos de uso

- Atención al cliente en euskera: el modelo puede gestionar conversaciones multi-turno con un system prompt en euskera y responder con registro formal (Batua), adecuado para administraciones públicas y empresas con clientela vascoparlante.
- Traducción profesional eu-en y eu-es: con chrF de 61,4 en eu-en y 51,1 en eu-es sobre FLORES, es viable para traducción asistida de documentación administrativa y periodística.
- Generación de material educativo: su rendimiento en EusExams v2 (84,9) y EusReading (87,8) lo hace apto para crear preguntas tipo test, resúmenes y ejercicios de comprensión lectora.
- Normalización lingüística: la puntuación de 81,8 en BAT (normas Batua) permite su uso como asistente de corrección y estilo en euskera estándar.
- Asistentes con tool calling: el formato XML documentado permite integrarlo en pipelines que consulten APIs (por ejemplo, precios de acciones, bases de datos administrativas) con razonamiento previo en `<think>`.
- Análisis de documentos con imagen: gracias al archivo mmproj, puede procesar capturas, formularios escaneados o gráficos junto a texto en euskera.
- Trivia y sistemas de preguntas y respuestas: con 87,8 en EusTrivia (multiple choice) y 63,5 en abierto, es adecuado para motores de Q&A sobre conocimiento general y local.
- Evaluación de conocimiento cultural: útil en proyectos de preservación y difusión de cultura vasca, con 85,8 en BertaQA local en euskera.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| EusProficiency | Accuracy | 82,4 |
| EusReading | Accuracy | 87,8 |
| BAT (normas Batua) | Accuracy | 81,8 |
| EusExams v2 | Accuracy | 84,9 |
| EusTrivia | Accuracy (multiple choice) | 87,8 |
| EusTrivia | Accuracy (open, LLM judge) | 63,5 |
| MMLU-Pro-eus | Accuracy (multiple choice) | 77,2 |
| MMLU-Pro-eus | Accuracy (open, LLM judge) | 68,5 |
| BertaQA local, MC, euskera | Accuracy | 85,8 |
| BertaQA local, MC, inglés | Accuracy | 83,6 |
| BertaQA local, abierto, euskera | Accuracy | 60,3 |
| BertaQA local, abierto, inglés | Accuracy | 51,1 |
| BertaQA global, MC, euskera | Accuracy | 94,4 |
| BertaQA global, MC, inglés | Accuracy | 93,3 |
| BertaQA global, abierto, euskera | Accuracy | 77,2 |
| BertaQA global, abierto, inglés | Accuracy | 78,5 |
| FLORES | chrF eu-en | 61,4 |
| FLORES | chrF en-eu | 60,2 |
| FLORES | chrF eu-es | 51,1 |
| FLORES | chrF es-eu | 54,5 |
| ALIA DocMT | chrF eu-en | 67,3 |
| ALIA DocMT | chrF en-eu | 65,6 |
| ALIA DocMT | chrF eu-es | 73,6 |
| ALIA DocMT | chrF es-eu | 73,4 |

No se han publicado en la información disponible resultados de benchmarks generalistas como MMLU estándar, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: bf16 completo ~244 GB; Q8_0 ~130 GB; Q6_K ~100 GB (estimado); Q4_K_M ~77,5 GB.
- GPU recomendadas: para bf16, múltiples A100 80GB o H100 80GB; para Q8_0, al menos 2×A100 80GB; para Q4_K_M, una sola A100 80GB o H100 80GB con margen.
- En GPU de consumo: Q4_K_M (77,5 GB) no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB); requeriría offloading a RAM del sistema o configuraciones multi-GPU con varias RTX 4090.
- Opciones de despliegue: llama.cpp (versión b12600 o superior), Ollama, LM Studio y cualquier runtime compatible con GGUF e imatrix; endpoints compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño total del repositorio: 1918,5 GB, por lo que conviene descargar solo la cuantización deseada mediante `huggingface-cli download`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Latxa-3-122B-A10B (este) | 122B totales / ~10B activos | no disponible | Apache 2.0 | eu, en | MoE especializado en euskera |
| Latxa 3 (variantes menores de la familia) | no disponible | no disponible | Apache 2.0 | eu, en | Misma familia, menor tamaño |
| Modelos generalistas MoE de ~100B (p. ej. variantes tipo Mixtral) | ~100B+ | variable | variable | multilingüe | No especializados en euskera |
| Modelos densos de 70B | 70B | variable | variable | multilingüe | Mayor coste por token que un MoE de 10B activos |

No se dispone en la información proporcionada de comparativas directas con otros modelos en los benchmarks específicos de euskera, por lo que la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos, pero al estar entrenado principalmente sobre corpus en euskera e inglés, puede presentar sesgos culturales y lingüísticos derivados de la composición del corpus.
- Riesgo de alucinación: los resultados en modo abierto (EusTrivia 63,5; BertaQA local abierto 60,3) indican una brecha notable frente a multiple choice, por lo que conviene validar respuestas factuales en producción.
- Limitaciones de idioma: el soporte declarado se limita a euskera e inglés; el rendimiento en castellano no está evaluado oficialmente, aunque aparecen métricas de traducción eu-es.
- Contexto: la longitud de contexto no está disponible en la información proporcionada, lo que impide planificar cargas de documentos largos con garantías.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base HiTZ/Latxa-3-122B-A10B por si hubiera condiciones adicionales.
- Requisitos de hardware: el tamaño del repositorio (1918,5 GB) y las cuantizaciones mínimas (~77,5 GB) hacen inviable el despliegue en una sola GPU de consumo.
- Formato de tool calling: requiere seguir estrictamente el esquema XML documentado; desviaciones pueden provocar fallos de parseo.
- Benchmarks no verificados: todos los resultados del model-index están marcados como `verified: false`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/HiTZ_Latxa-3-122B-A10B-GGUF
- Modelo base: https://huggingface.co/HiTZ/Latxa-3-122B-A10B
- Dataset de entrenamiento: https://huggingface.co/datasets/HiTZ/latxa-corpus-v2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Cuantización Q4_K_M: https://huggingface.co/bartowski/HiTZ_Latxa-3-122B-A10B-GGUF/tree/main/HiTZ_Latxa-3-122B-A10B-Q4_K_M
- Dataset FLORES+: https://huggingface.co/datasets/openlanguagedata/flores_plus
- Dataset ALIA DocMT: https://huggingface.co/datasets/ALIA/DocMT
