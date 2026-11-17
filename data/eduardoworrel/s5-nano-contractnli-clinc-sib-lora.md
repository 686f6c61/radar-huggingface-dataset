# eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-LoRA

## Resumen

S5-nano ContractNLI + CLINC150 + SIB-200 specialist es un adaptador LoRA publicado por el usuario eduardoworrel sobre el modelo base maritaca-ai/S5-nano de Maritaca AI. No es un modelo generativo de propósito general, sino un especialista multi-tarea de clasificación de texto que añade una cabeza de tipo pointer por cada tarea: inferencia de lenguaje natural sobre contratos (ContractNLI), detección de consultas fuera de dominio (CLINC150) y clasificación temática (SIB-200) en inglés y portugués.

El modelo resuelve tres problemas concretos de clasificación en una sola pasada forward, devolviendo para cada tarea una probabilidad y un margen sobre las opciones. La innovación principal es el uso de cabezas pointer que puntúan las representaciones de los tokens de opción del prompt, en lugar de una capa de clasificación convencional, lo que permite decidir entre etiquetas definidas textualmente.

Es relevante porque el autor publica también un hermano ONNX int4 orientado a ejecución en navegador mediante WebGPU con la librería s1s2, lo que lo convierte en una pieza pensada para despliegues ligeros y verificación de contratos o filtrado de consultas en el cliente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el adaptador ocupa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base maritaca-ai/S5-nano) con adaptador LoRA y cabezas pointer por tarea |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0,2 GB; el modelo base no se detalla en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens para ContractNLI (limite declarado por el autor); no disponible para el resto de tareas |
| Tipos de cuantizacion | bf16 para el adaptador entrenado; existe un hermano ONNX int4 (S5-nano-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2) |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 (ShareAlike por incluir SIB-200; datos ContractNLI CC BY 4.0 y CLINC150 CC BY 3.0; base Apache-2.0) |
| Formato de pesos | safetensors (adaptador LoRA + cabezas en heads/cnli/head.safetensors y equivalentes); ONNX int4 en el repositorio hermano |

## Arquitectura y entrenamiento

El modelo parte de maritaca-ai/S5-nano, un transformer decoder-only, y le superpone un adaptador LoRA entrenado con PEFT. Sobre las representaciones del modelo base se aplican cabezas pointer independientes por tarea (cnli, clinc, sib_en, sib_pt). Cada cabeza calcula la probabilidad de una opción como softmax sobre el producto escalar entre la representación del token de decisión y la representación del token final de cada opción, escalado por 16. Las opciones se introducen en el prompt con palabras exactas (por ejemplo, "Entailment", "Contradiction", "Not mentioned" para ContractNLI; "Yes"/"No" para CLINC150; siete temas para SIB-200 en inglés y sus equivalentes en portugués).

El entrenamiento se realizó durante 1 época con semilla 1 en bf16. No se detalla el número de tokens ni la composición exacta del dataset más allá de las tres fuentes citadas: ContractNLI (Koreeda y Manning, 2021), CLINC150 (Larson et al., 2019) y SIB-200 (Adelani et al., 2024). No se menciona RLHF ni DPO. La receta de la cabeza pointer y del entrenamiento se atribuye a Kev (jaredpalmer/kev), y la idea de separación System 1 / System 2 con compuerta de margen se atribuye a CT0 de Alias Robotics y al paper arXiv 2611.15302 (Browser Immune System).

## Capacidades

- Clasificación de inferencia de lenguaje natural sobre contratos NDA: determina si una hipótesis se sigue (Entailment), se contradice (Contradiction) o no se menciona (Not mentioned) en el documento.
- Detección de consultas fuera de dominio (out-of-scope) en el marco de CLINC150, planteada como clasificación binaria Sí/No.
- Clasificación temática en siete categorías (ciencia/tecnología, viaje, política, deportes, salud, entretenimiento, geografía) para inglés y portugués.
- Salida con probabilidad y margen por tarea en una sola pasada forward, lo que permite aplicar políticas de umbral o compuertas de margen.
- Soporte de ejecución en navegador mediante el hermano ONNX int4 con WebGPU y la librería s1s2.
- Capacidades multilingües limitadas a inglés y portugués.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Revisión automatizada de NDAs: dado un contrato de hasta 2.048 tokens y una hipótesis, el modelo devuelve si se sigue, se contradice o no se menciona, con probabilidad y margen para priorizar revisiones humanas.
- Filtrado de consultas en asistentes conversacionales: la cabeza CLINC150 permite descartar consultas fuera de alcance antes de invocar un LLM mayor, reduciendo coste y latencia.
- Enrutado temático de noticias o tickets en inglés y portugués: la cabeza SIB-200 clasifica en siete temas y puede alimentar pipelines de categorización.
- Verificación en el cliente (navegador): gracias al hermano ONNX int4 y WebGPU, se puede ejecutar la clasificación sin enviar el texto a un servidor, útil para documentos sensibles.
- Moderación o triaje previo en pipelines de atención al cliente: la compuerta de margen permite decidir cuándo escalar a un modelo generativo mayor.
- Extracción de señales estructuradas en procesos de compliance: combinar la salida de ContractNLI con umbrales de probabilidad para marcar cláusulas que requieren revisión legal.
- Experimentación académica sobre cabezas pointer y separación System 1 / System 2 en modelos pequeños, con receta y datos citados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los splits de test oficiales, balanced accuracy de la cabeza de cada tarea, en bf16, 1 época, semilla 1:

| Test set | Balanced accuracy (%) | Azar (%) | n |
|---|---|---|---|
| CLINC150 out-of-scope | 94,3 | 50 | 2.000 |
| ContractNLI | 78,5 | 33,3 | 1.190 |
| SIB-200 inglés | 90,1 | 14,3 | 204 |
| SIB-200 portugués | 88,6 | 14,3 | 204 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; el modelo base S5-nano debe cargarse aparte y su tamaño no se detalla en la información disponible.
- VRAM estimada para inferencia: no disponible con precisión; depende del tamaño del modelo base y de la cuantización elegida.
- GPU recomendadas: no disponible. El autor no publica requisitos de GPU para la versión bf16.
- Ejecución en consumer GPU: no confirmada para la versión bf16; la variante ONNX int4 está pensada para WebGPU en navegador.
- Opciones de despliegue: transformers + PEFT (merge_and_unload), safetensors para las cabezas, ONNX Runtime Web con WebGPU y la librería s1s2 para el navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S5-nano ContractNLI + CLINC150 + SIB-200 (este) | LoRA + cabezas pointer sobre S5-nano | ContractNLI, CLINC150 OOS, SIB-200 en/pt | 2.048 (ContractNLI) | CC BY-SA 4.0 | Hugging Face, 0 descargas |
| maritaca-ai/S5-nano | Modelo base generativo | Generación de texto | no disponible | Apache-2.0 | Hugging Face |
| S5-nano-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | ONNX int4 del mismo especialista | Mismas tres tareas | 2.048 (ContractNLI) | no disponible en la información | Hugging Face |
| Modelos de NLI de contratos genéricos | Clasificadores NLI | ContractNLI | variable | variable | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- ContractNLI solo cubre NDAs de hasta 2.048 tokens; documentos más largos quedan fuera del alcance declarado.
- CLINC150 se plantea como clasificación binaria dentro/fuera de alcance, no como clasificación de las 150 intenciones originales.
- Las etiquetas de SIB-200 en portugués se proyectan desde el inglés, lo que puede introducir sesgos de traducción.
- Entrenamiento con una sola semilla y una sola época; no se han medido otros dominios, por lo que la generalización es incierta.
- Las cabezas solo funcionan con las palabras de opción exactas documentadas; cualquier variación en el prompt invalida la decisión.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de calibración: las probabilidades y márgenes deben validarse en el dominio de destino antes de producción.
- Licencia CC BY-SA 4.0 con cláusula ShareAlike: los derivados deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial propietario.
- Repositorio sin descargas ni likes y creado en 2026-11-17; no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-LoRA
- Hermano ONNX int4 para navegador: https://huggingface.co/eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Receta de cabeza pointer (Kev): https://github.com/jaredpalmer/kev
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Dataset ContractNLI: https://stanfordnlp.github.io/contract-nli/
- Dataset CLINC150: https://github.com/clinc/oos-eval
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
