# Sepideh2027/biogpt-clinvar-finetuned

## Resumen

BioGPT-ClinVar es un modelo de lenguaje biomédico generativo obtenido mediante el ajuste fino supervisado de `microsoft/BioGPT` sobre información derivada de ClinVar, la base de datos pública de variantes genéticas humanas y sus relaciones con fenotipos. Lo desarrolla Sepideh Moafi (usuario `Sepideh2027` en Hugging Face) en el marco del proyecto de investigación PathogenAgentAI, dedicado a la ingeniería reproducible de datos biomédicos y a la adaptación eficiente de modelos fundacionales con técnicas de parametros reducidos (PEFT).

El modelo mantiene la arquitectura original de BioGPT, un transformer decoder-only de estilo GPT-2 orientado a generación de texto, con 346.763.264 parámetros (aproximadamente 0,3 mil millones) y pesos publicados en formato Safetensors con precisión BF16. La adaptación se realizó con LoRA sobre un conjunto de instrucciones construido a partir de ClinVar (unas 20.000 instancias con partición 16k/2k/2k), entrenado en una única GPU NVIDIA T4 con precisión mixta BF16.

Su relevancia es acotada pero clara: ocupa el nicho de los modelos biomédicos pequeños y ligeros que pueden ejecutarse en hardware de consumo, y ofrece un artefacto reproducible acompañado de dataset y adaptador LoRA para experimentar con generación aumentada por recuperación o anotación de variantes en entornos de investigación. No es un modelo clínico ni ha sido validado para diagnóstico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only generativo (arquitectura BioGPT, derivada de GPT-2) |
| Parametros totales | 346.763.264 (0,3B aproximadamente según pesos Safetensors) |
| Longitud de contexto | No disponible en la informacion proporcionada (la arquitectura BioGPT original utiliza 1.024 tokens) |
| Tipos de cuantizacion | No se publican versiones cuantizadas; los pesos se distribuyen en BF16. Al ser una arquitectura tipo GPT-2, es convertible a GGUF cuantizado, pero no hay artefactos oficiales |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16); adaptador LoRA publicado por separado |
| Parametros del modelo base | 347M (microsoft/BioGPT) |
| Tamano del repositorio | 0,7 GB |
| Metodo de ajuste | LoRA (parameter-efficient fine-tuning) |
| Precisión de entrenamiento | BF16 mixed precision sobre NVIDIA T4 |
| Fuente de datos principal | ClinVar (variantes geneticas humanas y fenotipos asociados) |
| Fecha de creacion | 2026-06-29 |
| Ultima actualizacion | 2026-09-18 |
| Descargas | 36 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es la de BioGPT: un transformer decoder-only de tipo GPT-2 con atención causal completa, diseñado originalmente por Microsoft Research para generación de texto biomédico y preentrenado sobre 15 millones de resúmenes de PubMed. El modelo base cuenta con unos 347 millones de parámetros, 24 capas, dimensión oculta de 1.024 y un vocabulario específico del dominio biomédico de 42.384 tokens. Estos datos proceden de la documentación pública del modelo base; la model card del ajuste fino no los repite.

Sobre esa base, el ajuste se realizó con LoRA sobre un conjunto de instrucciones derivado de ClinVar de aproximadamente 20.000 ejemplos, con partición fija de 16.000 para entrenamiento, 2.000 para validación y 2.000 para test. El entrenamiento se ejecutó en una GPU NVIDIA T4 con precisión mixta BF16. La pérdida de entrenamiento descendió de 1,49 a 1,39 y la de validación de 1,45 a 1,40, lo que indica un ajuste moderado y sin señales evidentes de sobreajuste en las métricas declaradas, aunque la magnitud de la mejora es pequeña. No se documentan en la información disponible fases de RLHF, DPO ni preferencias humanas; se trata de ajuste supervisado por instrucciones exclusivamente. El proyecto publica también el adaptador LoRA y el dataset de instrucciones como artefactos independientes para reproducibilidad.

## Capacidades

- Generación de texto biomédico en inglés, con especialización en vocabulario genómico y variantes genéticas.
- Generación condicionada por instrucciones (instruction following) sobre tareas derivadas de ClinVar, gracias al dataset de ajuste en formato de instrucciones.
- Interpretación y reformulación de información estructurada de variantes: identificadores, clasificaciones, genes y relaciones variante-fenotipo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el proyecto PathogenAgentAI sugiere un uso como componente dentro de agentes, pero no se documentan capacidades de planificación.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades multimodales (visión, audio): no disponibles. El modelo es exclusivamente texto.
- Capacidades multilingües: limitadas al inglés; no se declara soporte de otros idiomas.
- Contexto largo: limitado por la arquitectura GPT-2 subyacente, no apto para documentos extensos sin estrategias de fragmentación o recuperación.

## Casos de uso

- Extracción estructurada de variantes en pipelines de investigación genómica: el modelo puede transformar texto libre derivado de ClinVar en campos normalizados (gen, cambio nucleotídico, clasificación), útil como paso de preprocesamiento antes de un sistema de anotación. Su tamaño de 0,3B permite ejecutarlo en la misma máquina que el pipeline sin GPU dedicada.
- Generación de resúmenes de informes de variantes: dado un conjunto de campos estructurados, el modelo produce una descripción textual legible que un investigador puede revisar. Adecuado porque fue ajustado específicamente sobre lenguaje de ClinVar, aunque toda salida debe verificarse contra la base original.
- Prototipado rápido de asistentes conversacionales biomédicos: su huella de memoria reducida (menos de 1 GB en BF16) permite levantar un servicio de inferencia en portátiles o instancias pequeñas para validar una idea antes de escalar a modelos mayores.
- Generación de datasets sintéticos de instrucciones biomédicas: el modelo puede producir pares pregunta-respuesta de dominio genómico que después se filtran y se usan para aumentar conjuntos de entrenamiento, un uso habitual en investigación sobre adaptación de modelos fundacionales.
- Experimentación con PEFT y reproducibilidad: al publicarse junto al adaptador LoRA y al dataset, sirve como caso de estudio controlado para comparar estrategias de ajuste eficiente en dominios científicos con presupuesto de cómputo limitado (una sola T4).
- Evaluación de riesgos y alucinación en modelos biomédicos pequeños: su tendencia a generar afirmaciones no verificadas lo convierte en un banco de pruebas útil para desarrollar métodos de detección de alucinaciones y de atribución de fuentes en texto científico.
- Enseñanza y divulgación en bioinformática: uso en entornos docentes para ilustrar cómo se comporta un modelo de lenguaje de dominio específico frente a uno generalista, siempre con revisión experta de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas de pérdida durante el entrenamiento: descenso de 1,49 a 1,39 en entrenamiento y de 1,45 a 1,40 en validación. No hay datos de MMLU, HumanEval, GSM8K ni de tareas biomédicas estándar como MedQA, PubMedQA o BioASQ, ni comparaciones con el modelo base sin ajustar. Cualquier evaluación de calidad debe realizarse de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en BF16, unos 1,4 GB en FP32 y en torno a 0,2-0,4 GB con cuantización de 8 o 4 bits (esta última no publicada oficialmente).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. El modelo se entrenó en una NVIDIA T4 (16 GB), pero ese margen es holgado para la inferencia. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090 y superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos ocho años, e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable, con latencias de decenas a cientos de milisegundos por token según el hardware, dado el reducido número de parámetros.
- Opciones de despliegue: al ser una arquitectura GPT-2 con tokenizador propio, puede servirse con Hugging Face Transformers, Text Generation Inference (TGI) y vLLM (requiere verificar compatibilidad del tokenizador personalizado de BioGPT), así como convertirse a GGUF para llama.cpp u Ollama. No se publican artefactos GGUF oficiales.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia dimensional, un modelo de 0,3B en BF16 sobre una GPU moderna de consumo suele operar en el rango de cientos a miles de tokens por segundo en modo batch, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| BioGPT-ClinVar (Sepideh2027) | 0,35B | No disponible (1.024 en BioGPT original) | Decoder generativo, ajustado con LoRA sobre ClinVar | MIT | Pesos Safetensors en Hugging Face | Ajuste de dominio muy específico (variantes ClinVar); 36 descargas |
| microsoft/BioGPT | 0,35B | 1.024 tokens | Decoder generativo preentrenado en PubMed | MIT | Pesos en Hugging Face | Modelo base del anterior; conocimiento biomédico general, sin especialización en ClinVar |
| Stanford CRFM BioMedLM (PubMedGPT) | 2,7B | 1.024 tokens | Decoder generativo tipo GPT | Licencia de acceso con condiciones en Hugging Face | Pesos disponibles previa aceptación | Mayor capacidad y mejores resultados generales en QA biomédico, pero requiere hardware notablemente superior |
| PubMedBERT | 0,11B | 512 tokens | Encoder, solo comprensión | MIT | Pesos en Hugging Face | No genera texto; útil para clasificación y NER, no sustituye a un modelo generativo |

La comparación de rendimiento cuantitativo no es posible: no hay benchmarks publicados para BioGPT-ClinVar y las cifras de los alternativas corresponden a sus respectivas documentaciones públicas, no a evaluaciones conjuntas bajo el mismo protocolo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo. Hereda los del modelo base BioGPT, preentrenado sobre literatura científica publicada, con el sesgo de publicación y la infrarrepresentación de poblaciones no europeas típica de las bases de datos genómicas como ClinVar.
- Riesgo de alucinación: la propia model card advierte de que el modelo puede generar información biomédica incorrecta o incompleta. Dado el tamaño reducido y la escasa magnitud de la mejora en la pérdida de validación (de 1,45 a 1,40), la tendencia a inventar detalles de variantes es un riesgo real y no cuantificado.
- Limitaciones de contexto: la arquitectura subyacente maneja ventanas cortas, inadecuadas para documentos clínicos completos o historiales largos. Requiere fragmentación y, preferiblemente, generación aumentada por recuperación.
- Limitación de idioma: solo inglés. No hay soporte declarado de castellano ni de otros idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución. Sin embargo, el dataset de origen (ClinVar) tiene sus propias condiciones de uso que deben respetarse por separado, y el modelo no está validado para uso clínico.
- Advertencia de uso clínico: la model card prohíbe explícitamente su uso para diagnóstico, decisiones terapéuticas o uso clínico directo. No ha sido validado para toma de decisiones médicas.
- Vigencia del conocimiento: el conocimiento biomédico evoluciona; el modelo no incorpora necesariamente las reclasificaciones de variantes más recientes de ClinVar. Es un riesgo crítico en genómica, donde las clasificaciones cambian con frecuencia.
- Dependencia del prompt: los resultados varían fuertemente según la formulación del prompt y el formato del dataset de ajuste, lo que dificulta la reproducibilidad entre aplicaciones.
- Adopción limitada: 36 descargas y 0 likes en el momento de redactar esta ficha, sin evaluación independiente publicada por terceros. Debe tratarse como artefacto de investigación incipiente, no como componente de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sepideh2027/biogpt-clinvar-finetuned
- Modelo base: https://huggingface.co/microsoft/BioGPT
- Dataset de instrucciones: https://huggingface.co/datasets/Sepideh2027/Agent
- Adaptador LoRA: https://huggingface.co/Sepideh2027/PathogenAgentAI-BioGPT-LoRA
- Publicación asociada (Research Square, 2026): https://doi.org/10.21203/rs.3.rs-10196893/v1
- Perfil de GitHub del autor: https://github.com/AIResearcher20
- Base de datos ClinVar (NCBI): https://www.ncbi.nlm.nih.gov/clinvar/
- Artículo original de BioGPT (arXiv): https://arxiv.org/abs/2210.10341
- Repositorio oficial de BioGPT (Microsoft Research): https://github.com/microsoft/BioGPT
