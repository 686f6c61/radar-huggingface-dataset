# eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA

## Resumen

SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA es un adaptador LoRA multi-tarea desarrollado por el usuario eduardoworrel sobre el modelo base SmolLM3-3B de Hugging Face. El adaptador especializa el modelo en tres tareas de clasificación distintas mediante cabezas de puntero (pointer heads) independientes: inferencia de cláusulas en acuerdos de confidencialidad (ContractNLI), detección de consultas fuera de dominio en un asistente conversacional (CLINC150) y clasificación temática de noticias en inglés y portugués (SIB-200). Cada tarea se resuelve en un único forward pass que devuelve una probabilidad y un margen de decisión.

El modelo aborda un problema práctico de despliegue: en lugar de emplear un LLM generativo completo para tareas de clasificación acotadas, utiliza un modelo base de 3.000 millones de parámetros con adaptadores ligeros y cabezas específicas que producen decisiones tipadas y cuantificables. La arquitectura combina el transformer decoder de SmolLM3-3B con un mecanismo de atención sobre marcadores de opción en el prompt, calculando la probabilidad de cada opción mediante un producto escalar normalizado entre el estado de decisión y el estado final de cada opción.

Su relevancia actual radica en el patrón System 1 / System 2 que propone: las cabezas ofrecen respuestas rápidas con un margen de confianza explícito, lo que permite derivar a un modo de razonamiento más costoso solo cuando el margen es bajo. El adaptador se distribuye con licencia CC BY-SA 4.0 y cuenta con una variante ONNX int4 para ejecución en navegador mediante WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM3-3B) con adaptador LoRA y cabezas de puntero por tarea |
| Parametros totales | 3.000 millones (modelo base); el adaptador LoRA y las cabezas anaden un porcentaje no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens para ContractNLI (limite declarado); no disponible para el resto de tareas |
| Tipos de cuantizacion | bf16 para el adaptador; variante ONNX int4 disponible en el repo hermano |
| Idiomas soportados | Ingles y portugues (SIB-200); ContractNLI y CLINC150 en ingles |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabezas) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM3-3B, un transformer decoder de 3.000 millones de parámetros. Sobre el modelo base se entrena un LoRA que se fusiona con `merge_and_unload()` para producir un modelo denso, y se anaden cuatro cabezas de puntero independientes: `cnli`, `clinc`, `sib_en` y `sib_pt`. Cada cabeza calcula la probabilidad de cada opción como `softmax_k(q(h_decide) · k(h_option_end) / 16)`, es decir, un producto escalar entre el estado oculto en el punto de decisión y el estado final de cada marcador de opción en el prompt, escalado por 16.

El entrenamiento se realizó durante una sola época con semilla 1 en precisión bf16. Los datos provienen de tres conjuntos públicos: ContractNLI (Koreeda y Manning, 2021; CC BY 4.0), CLINC150 (Larson et al., 2019; CC BY 3.0) y SIB-200 (Adelani et al., 2024; CC BY-SA 4.0). Las opciones de cada tarea están fijadas en el prompt y deben escribirse exactamente como se entrenaron; cualquier variación cambia el prompt que lee la cabeza y rompe la inferencia. La receta de la cabeza de puntero y el entrenamiento proviene del proyecto Kev, y la idea de separación System 1 / System 2 con puerta de margen se atribuye a CT0 de Alias Robotics.

## Capacidades

- Clasificación de relación NDA: determina si una hipótesis se deduce (Entailment), se contradice (Contradiction) o no se menciona (Not mentioned) en un acuerdo de confidencialidad de hasta 2.048 tokens.
- Detección de consultas fuera de dominio: clasifica una consulta de CLINC150 como dentro o fuera del ámbito del asistente (Yes / No).
- Clasificación temática de noticias en inglés: asigna una de siete categorías (science/technology, travel, politics, sports, health, entertainment, geography).
- Clasificación temática de noticias en portugués: las mismas siete categorías con etiquetas en portugués (ciência/tecnologia, viagem, política, esportes, saúde, entretenimento, geografia).
- Salida con probabilidad y margen por tarea en un único forward pass, lo que permite umbralizar la confianza.
- Patrón System 1 / System 2: la cabeza actúa como respuesta rápida y el margen bajo puede derivar a un razonamiento más costoso.
- Ejecución en navegador mediante la variante ONNX int4 y WebGPU a través de la librería s1s2.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto libre como tales; es un modelo de clasificación especializado.

## Casos de uso

- Revisión de acuerdos de confidencialidad: procesar cláusulas de NDAs de hasta 2.048 tokens y clasificar automáticamente si una hipótesis contractual se deduce, se contradice o no aparece, con una probabilidad asociada para priorizar la revisión humana.
- Triaje de consultas en asistentes conversacionales: usar la cabeza CLINC150 para decidir si una consulta cae dentro del dominio soportado antes de invocar un LLM generativo, evitando respuestas fuera de ámbito.
- Enrutamiento temático de noticias en inglés: clasificar titulares o párrafos en las siete categorías de SIB-200 para alimentar agregadores o sistemas de recomendación.
- Enrutamiento temático de noticias en portugués: la misma función con etiquetas nativas en portugués, útil para medios lusófonos.
- Puerta de confianza en pipelines de producción: usar el margen de decisión para derivar casos ambiguos a un modo System 2 (modelo mayor o revisión humana) y resolver el resto con el modo rápido.
- Clasificación en el navegador: desplegar la variante ONNX int4 con WebGPU para clasificar documentos o consultas en el cliente sin enviar datos a un servidor.
- Extracción de señales en contratos: combinar la cabeza CNLI con post-procesado para marcar cláusulas potencialmente problemáticas en flujos de legal tech.

## Benchmarks y rendimiento

Resultados en los splits de test oficiales, balanced accuracy de la cabeza de cada tarea, en bf16, una época y semilla 1.

| Conjunto de test | Balanced accuracy (%) | Azar (%) |
|---|---|---|
| CLINC150 out-of-scope, n = 2.000 | 88,3 | 50,0 |
| ContractNLI, n = 1.190 | 67,2 | 33,3 |
| SIB-200 inglés, n = 204 | 90,8 | 14,3 |
| SIB-200 portugués, n = 204 | 92,1 | 14,3 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base en bf16 requiere aproximadamente 6 GB solo para pesos; con adaptador fusionado y cabezas, alrededor de 6-7 GB, más el espacio de activaciones y caché KV.
- En cuantización int4 (variante ONNX) el modelo puede reducirse a aproximadamente 2 GB, apto para ejecución en navegador con WebGPU.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para estaciones de trabajo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4 GB o más en int4.
- Opciones de despliegue: transformers con PEFT para el adaptador, ONNX Runtime con WebGPU para la variante int4, y la librería s1s2 para el patrón System 1 / System 2 en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA | 3.000 M + LoRA | 2.048 (ContractNLI) | Clasificación multi-tarea (NDA, OOS, temas) | CC BY-SA 4.0 | Hugging Face, ONNX int4 |
| SmolLM3-3B (base) | 3.000 M | No disponible | Generación de texto general | Apache 2.0 | Hugging Face |
| alias3-web (Alias Robotics) | No disponible | No disponible | Clasificación web / inmunidad de navegador | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- ContractNLI solo admite NDAs de hasta 2.048 tokens; documentos más largos requieren truncado o segmentación.
- CLINC150 se reformula como clasificación binaria dentro/fuera de dominio, no como clasificación de las 150 intenciones originales.
- Las etiquetas de SIB-200 en portugués se proyectan desde el inglés, lo que puede introducir sesgos de traducción.
- Entrenamiento con una sola semilla y una sola época; no se han medido otros dominios ni la robustez ante distribución distinta.
- Las palabras de opción están fijadas y deben coincidir exactamente con las de entrenamiento; cualquier variación en el prompt rompe la inferencia.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración: las probabilidades de las cabezas no están calibradas más allá del margen reportado.
- Licencia CC BY-SA 4.0 con cláusula ShareAlike, lo que obliga a compartir bajo la misma licencia las obras derivadas; verificar compatibilidad antes de uso comercial propietario.
- El modelo base SmolLM3-3B es Apache 2.0, pero los datos de SIB-200 imponen la licencia ShareAlike al conjunto.
- No soporta generación de texto libre, tool calling ni agentes; usarlo fuera de sus tres tareas produce resultados sin garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA
- Variante ONNX int4: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Proyecto Kev (receta de cabeza de puntero): https://github.com/jaredpalmer/kev
- alias3-web (precursor): https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
