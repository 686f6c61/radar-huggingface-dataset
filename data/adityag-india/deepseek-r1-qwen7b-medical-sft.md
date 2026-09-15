# adityag-india/deepseek-r1-qwen7b-medical-sft

## Resumen

`adityag-india/deepseek-r1-qwen7b-medical-sft` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario adityag-india sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, el modelo de razonamiento denso de 7B que DeepSeek destiló a partir de DeepSeek-R1. No se trata de un modelo completo: el repositorio (1,9 GB) contiene pesos de adaptador en formato safetensors que deben cargarse junto con el modelo base mediante la librería PEFT.

El nombre del repositorio apunta a un ajuste orientado al dominio médico, pero la model card no documenta el conjunto de datos, el número de pasos, la composición del corpus ni el idioma de entrenamiento. Tampoco se especifican la licencia, los idiomas soportados ni resultados de evaluación.

Su relevancia es limitada y hay que ser honesto al respecto: se publicó el 15 de septiembre de 2026, acumula 0 descargas y 0 "likes", y la ficha técnica está incompleta en los campos críticos (licencia, datos, benchmarks). Resulta útil como ejemplo reproducible de un pipeline de SFT con TRL sobre un modelo destilado de razonamiento, pero no es una base recomendable para producción sanitaria sin una evaluación previa exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-7B) con adaptador LoRA entrenado mediante SFT; el repositorio no contiene pesos completos |
| Parámetros totales | ~7,6 mil millones en el modelo base; el adaptador LoRA publicado ocupa 1,9 GB (rango y módulos objetivo no documentados) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la ficha. El modelo base Qwen2.5-7B parte de 32.768 tokens nativos, extensibles a 131.072 con YaRN, pero no se confirma que el ajuste conserve ese límite |
| Tipos de cuantización | El adaptador se distribuye sin cuantizar (safetensors). Una vez fusionado con el modelo base admite GGUF (Q2–Q8), AWQ, GPTQ y bitsandbytes 8/4-bit; no se publican versiones cuantizadas en este repositorio |
| Idiomas soportados | No disponible. El modelo base declara soporte para más de 29 idiomas, pero el ajuste con datos médicos (presumiblemente en inglés) puede degradar el multilingüismo y no hay evaluación publicada |
| Licencia | No disponible: el campo aparece vacío en la ficha. El modelo base se distribuye bajo licencia MIT según su model card oficial; verificar antes de cualquier uso comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere `transformers` + `peft` para cargar |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de tipo Qwen2.5, con atención de consultas agrupadas (GQA) y RoPE, sobre el que DeepSeek aplicó destilación de razonamiento desde DeepSeek-R1. El adaptador de este repositorio se entrena con SFT sobre ese modelo congelado: no se modifica la arquitectura, solo se añaden matrices de bajo rango en las capas seleccionadas.

El entrenamiento se realizó con TRL (versión 1.13.0) y PEFT (0.20.0), sobre Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se documenta el dataset, el número de tokens vistos, la longitud de secuencia, el rango LoRA, la tasa de aprendizaje, ni si hubo etapas posteriores de DPO/RLHF. Tampoco se describe ninguna innovación técnica propia (decodificación especulativa, atención lineal, modo de pensamiento explícito, etc.) más allá de lo heredado del modelo base.

## Capacidades

- Generación de texto conversacional en formato de chat, heredada del modelo base y presumiblemente orientada a preguntas y respuestas de temática médica.
- Razonamiento paso a paso: el modelo base es un destilado de DeepSeek-R1, por lo que tiende a producir cadenas de razonamiento antes de la respuesta final; no se confirma si el ajuste SFT ha preservado o degradado este comportamiento.
- Resolución de problemas matemáticos y de lógica, en la medida en que el ajuste no lo haya deteriorado.
- Generación de código: capacidad heredada del modelo base, no evaluada en este adaptador.
- Soporte de tool calling / function calling: no documentado. El modelo base no incorpora una plantilla de herramientas específica en su configuración de chat.
- Soporte de agentes y razonamiento multi-paso: no documentado; no se han publicado evaluaciones de uso agéntico.
- Capacidades multilingües: no documentadas para este adaptador.
- Capacidades especiales: no se declaran visión, audio, ni modo de pensamiento configurable. No hay evaluación de seguridad ni de alineación.

## Casos de uso

- Triaje de consultas clínicas simuladas: el modelo puede generar respuestas explicativas ante preguntas médicas de baja complejidad, útil en entornos de investigación o formación, siempre con supervisión humana y sin sustituir el criterio clínico.
- Generación de material divulgativo sanitario: redacción de borradores de folletos para pacientes sobre patologías comunes, aprovechando la capacidad de razonamiento del modelo base para estructurar explicaciones por pasos.
- Apoyo a la codificación clínica (CIE-10 / SNOMED): extracción de términos diagnósticos de notas en texto libre y propuesta de códigos candidatos, con revisión obligatoria por codificadores humanos.
- Resumen de literatura biomédica: condensación de abstracts o guías de práctica clínica en resúmenes estructurados, aprovechando la ventana de contexto del modelo base si el ajuste la conserva.
- Investigación en ajuste de dominio: el repositorio sirve como caso de estudio reproducible para comparar estrategias de SFT (rango LoRA, datos, hiperparámetros) sobre modelos destilados de razonamiento.
- Base para experimentos de RAG clínico: acoplado a un recuperador sobre guías y protocolos, el modelo puede generar respuestas fundamentadas en documentos citados, reduciendo alucinaciones si se diseña bien el prompt.
- Generación de preguntas de examen para estudiantes de medicina: producción de casos clínicos y preguntas tipo test con explicación razonada de la respuesta correcta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye ninguna evaluación, ni del adaptador ni del modelo fusionado, y no se especifica el conjunto de datos de entrenamiento que permitiría reproducirla.

A título de referencia externa (no aportada por este repositorio, sino por el informe técnico de DeepSeek-R1), el modelo base `DeepSeek-R1-Distill-Qwen-7B` reporta las siguientes cifras:

| Benchmark | DeepSeek-R1-Distill-Qwen-7B (base) |
|---|---|
| AIME 2024 (pass@1) | 55,5 |
| MATH-500 | 92,8 |
| GPQA Diamond | 49,1 |
| LiveCodeBench | 37,6 |
| Codeforces (rating) | 1189 |

Estos valores corresponden al modelo base sin ajustar y no pueden extrapolarse al adaptador médico, cuyo ajuste SFT podría haberlos alterado en cualquier dirección.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: ~15-16 GB solo para pesos de un modelo denso de 7,6B, más 1-4 GB de caché KV según longitud de contexto y batch. Estimación orientativa para el modelo base fusionado, no medida en este repositorio.
- VRAM en 8 bits (bitsandbytes): ~8-9 GB.
- VRAM en 4 bits (NF4 o GGUF Q4_K_M): ~4,5-5,5 GB.
- GPU recomendadas: H100 80 GB, A100 40/80 GB, L40S o RTX 4090 24 GB para bf16; RTX 4080/4070 Ti (16 GB) o RTX 3090 (24 GB) para 8 bits; RTX 3060 12 GB o superior para 4 bits.
- ¿Cabe en GPU de consumo? Sí. En cuantización de 4 bits cabe en tarjetas de 8 GB con contexto moderado; en bf16 requiere al menos 16-24 GB.
- Opciones de despliegue: vLLM, SGLang y TGI tras fusionar el adaptador con `merge_and_unload()`; llama.cpp / Ollama / LM Studio requieren convertir el modelo fusionado a GGUF. El adaptador por sí solo necesita `transformers` + `peft`.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medición para este adaptador ni para el modelo fusionado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| adityag-india/deepseek-r1-qwen7b-medical-sft | Adaptador LoRA sobre base de ~7,6B | No disponible | No disponible | Repositorio público, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | ~7,6B denso | 32.768 nativos, 131.072 con YaRN | MIT según model card oficial | Oficial, ampliamente utilizado |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | ~8B denso | 131.072 | MIT según model card oficial | Oficial, ampliamente utilizado |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B denso | 32.768 nativos, 131.072 con YaRN | Apache-2.0 | Oficial, con versiones cuantizadas de terceros |

No hay datos comparativos de rendimiento entre este adaptador y las alternativas, porque el adaptador no se ha evaluado. La comparación se limita a tamaño, contexto declarado del modelo base y licencia.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido. La licencia del modelo base (MIT) no cubre necesariamente los pesos derivados.
- Dominio médico de alto riesgo: cualquier uso clínico real exige validación regulatoria y supervisión profesional. Un modelo de 7B ajustado con datos no documentados no es un producto sanitario.
- Riesgo elevado de alucinación: no se ha publicado ninguna evaluación de fidelidad factual ni de tasas de error en preguntas médicas.
- Dataset de entrenamiento desconocido: no se indica composición, tamaño, procedencia ni si hubo filtrado de datos sensibles o con derechos de autor.
- Sin evaluación de sesgos: no hay análisis de sesgos demográficos, raciales, de género ni de sesgo clínico.
- Idiomas no documentados: si el ajuste se hizo solo en inglés, el rendimiento en castellano u otros idiomas puede degradarse de forma significativa.
- Posible olvido catastrófico: el SFT puede haber reducido capacidades generales del modelo base (código, matemáticas, razonamiento fuera del dominio médico) sin que existan métricas que lo cuantifiquen.
- Sin validación comunitaria: 0 descargas y 0 "likes" implican que el modelo no ha sido reproducido ni auditado por terceros.
- Fechas del repositorio y de las versiones de las librerías (TRL 1.13.0, PyTorch 2.14.0) posteriores a las actuales en el momento de redactar esta ficha; conviene verificar la compatibilidad real del entorno antes de intentar cargarlo.
- Ausencia de evaluación de seguridad: no se documenta ningún ajuste de alineación ni filtro de contenido dañino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adityag-india/deepseek-r1-qwen7b-medical-sft
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio de TRL: https://github.com/huggingface/trl
- Informe técnico de DeepSeek-R1 (arXiv): https://arxiv.org/abs/2501.12948

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores son los únicos verificables a partir de la información disponible.
