# borekboissy/Millesime-2026-9b

## Resumen

Millésime 2026 9B es un modelo de lenguaje de 9.409.813.744 parámetros (aproximadamente 9B), especializado en francés conversacional, desarrollado por el usuario borekboissy dentro del proyecto Millésime. Se construye mediante ajuste fino supervisado (SFT) y optimización por preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-9B, con el objetivo declarado de superar en benchmarks francófonos a modelos de mayor tamaño, en concreto a alternativas de 14B.

El modelo se distribuye bajo licencia Apache 2.0, con una ventana de contexto de 262.144 tokens y modo de generación sin cadena de pensamiento (non-thinking). Su relevancia actual radica en dos factores: por un lado, apunta al nicho de los SLM (Small Language Models) ejecutables en local, y por otro, declara una política estricta de limpieza de datos, entrenándose únicamente con corpus cuyas condiciones de uso permiten el fine-tuning, evitando salidas de modelos que prohíben ese uso.

El autor reporta un pipeline de dos fases: SFT sobre más de 38.000 ejemplos sintéticos organizados en 14 categorías y 280 subcategorías de cultura general francesa, fact-checkeados, y posteriormente DPO sobre preferencias humanas reales extraídas de la arena pública Compar:IA del Ministerio de Cultura francés. El modelo obtiene una media de 7,314 en FR-MT-Bench según cuatro jueces LLM distintos, frente a 7,109 de Chocolatine-2.0.3-14B y 6,061 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetado como familia qwen3_5 y derivado de Qwen/Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | Frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Libreria | Transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.5-9B (fine-tune) |
| Modo de generacion | Non-thinking (sin cadena de pensamiento) |
| Tamano del repositorio | 18,8 GB |
| Emisiones declaradas | 4.766 (CodeCarbon), hardware 4 x NVIDIA B200, ubicacion Estados Unidos |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo: se limita a indicar que deriva del modelo base Qwen/Qwen3.5-9B y que pertenece a la familia etiquetada como qwen3_5. Por tanto, la información sobre tipo de transformer, mecanismos de atención o innovaciones arquitectónicas concretas no está disponible en la documentación proporcionada. El dato contrastado es el recuento real de parámetros (9.409.813.744) y el modo de generación sin cadena de pensamiento, que implica que el modelo no emite bloques de razonamiento explícito antes de la respuesta final.

El entrenamiento se estructura en dos fases. La fase 1 aplica SFT sobre el dataset borekboissy/Millesime-2026-SFT, compuesto por más de 38.000 ejemplos generados sintéticamente y posteriormente verificados, distribuidos en 14 categorías y 280 subcategorías que cubren historia y cultura, lengua francesa, derecho y administración, ciencias, filosofía, razonamiento y escritura y estilo, entre otras. La fase 2 aplica DPO sobre borekboissy/Millesime-2026-comparIA-DPO, construido a partir de la arena pública Compar:IA del Ministerio de Cultura francés, con filtrado para conservar únicamente pares utilizables (preferencia neta, turno único, francés, modelos con licencia permisiva y ratio de longitud controlado).

Una innovación metodológica destacable, según el autor, es la decisión de pipeline: en la variante de 9B el DPO se aplica directamente sobre la salida del SFT, y este esquema de dos etapas rindió mejor que la alternativa de model merging TIES entre SFT y DPO, que sí fue superior en la variante de 4B del mismo proyecto. El coste de cómputo declarado se cubrió con 4 GPU NVIDIA B200 y se reportan 4.766 unidades de emisiones estimadas con CodeCarbon.

## Capacidades

- Generación de texto conversacional en francés, con foco explícito en cultura general francesa (historia, derecho, administración, ciencias, filosofía, lengua).
- Razonamiento y respuesta a preguntas en francés, evaluado con Global-MMLU-fr, IFEval-fr y GPQA-fr según la model card.
- Escritura y estilo: la fase de SFT incluye una categoría específica de redacción y estilo.
- Modo non-thinking: el modelo genera respuestas directas sin cadena de pensamiento explícita, lo que reduce el consumo de tokens de salida.
- Capacidad multilingüe limitada: el único idioma declarado es el francés (fr).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el DPO se filtró expresamente para turnos únicos, no multi-turno.
- Capacidades de visión: no disponibles. Aunque la lista de etiquetas de HuggingFace incluye image-text-to-text, la model card describe exclusivamente text-generation y el pipeline declarado es text-generation.

## Casos de uso

- Asistentes conversacionales en francés para atención al cliente: el modelo puede mantener diálogos en francés con un contexto de hasta 262.144 tokens, lo que permite adjuntar documentación extensa (condiciones contractuales, historiales) sin truncar.
- Despliegue local en puesto de trabajo o pyme francófona: con 9B parámetros y licencia Apache 2.0, es viable ejecutarlo en hardware de gama alta de consumo con cuantización, sin dependencia de APIs externas ni costes por token.
- Generación de contenido editorial en francés: redacción de artículos, resúmenes y textos de estilo, apoyándose en la categoría de escritura y estilo del dataset de SFT.
- Consultas de tipo administrativo o jurídico francés: la fase de SFT incluye explícitamente derecho y administración, lo que lo hace adecuado para asistentes de orientación sobre trámites, siempre con revisión humana dado el riesgo de alucinación.
- Evaluación comparativa de modelos francófonos: sirve como referencia de panel en pruebas tipo arena o FR-MT-Bench para equipos que investigan calidad conversacional en francés.
- Filtrado y clasificación de textos en francés: al ser un modelo ajustado al idioma, puede emplearse en tareas de moderación, etiquetado o triaje de documentos francófonos dentro de un pipeline mayor.
- Base para ajuste posterior específico de dominio: al estar bajo Apache 2.0 y en formato safetensors compatible con Transformers, puede reentrenarse con LoRA o SFT adicional para nichos verticales en francés.

## Benchmarks y rendimiento

FR-MT-Bench, evaluado con cuatro jueces LLM de familias distintas y con la cadena de pensamiento desactivada en todos los modelos del panel:

| Modelo | GPT-5.6-Sol | Claude Opus 5 | Gemini 3.1 Pro | Grok 2.6 | Media |
|---|---:|---:|---:|---:|---:|
| Millésime 2026 9B | 7,181 | 6,900 | 7,819 | 7,356 | 7,314 |
| Chocolatine-2.0.3-14B | 7,146 | 6,831 | 7,494 | 6,963 | 7,109 |
| Ministral-3-14B | 6,338 | 6,463 | 6,769 | 6,869 | 6,610 |
| Millésime 2026 4B | 6,475 | 6,344 | 6,638 | 6,844 | 6,575 |
| Qwen3.5-9B (base) | 5,906 | 5,844 | 6,444 | 6,050 | 6,061 |

Tareas genéricas en francés (French Bench, lm-evaluation-harness, 0-shot):

| Tarea (n) | Millésime 2026 9B |
|---|---:|
| arc_challenge (acc_norm), n=1169 | 54,1% |
| boolqa, n=178 | 84,3% |
| grammar, n=119 | 75,6% |
| hellaswag (acc_norm), n=9338 | 70,1% |
| global_mmlu_fr (total), n=400 | 73,5% |
| xwinograd_fr, n=83 | 74,7% |

El desglose por subdominio de Global-MMLU-fr (tabla 2 de la model card) aparece truncado en la información disponible. La model card menciona además evaluaciones con Lighteval sobre IFEval-fr y GPQA-fr, pero no se han facilitado sus resultados numéricos.

## Requisitos de hardware

Las cifras de esta sección son estimaciones de ingeniería derivadas del recuento de parámetros (9,41B) y del tamaño del repositorio (18,8 GB), no datos publicados por el autor.

- VRAM para inferencia en BF16/FP16: aproximadamente 19-21 GB solo para pesos, más caché KV; en la práctica requiere del orden de 24-28 GB con contexto moderado, y bastante más con contexto largo.
- VRAM con cuantización de 8 bits: aproximadamente 10-12 GB de pesos.
- VRAM con cuantización de 4 bits: aproximadamente 6-7 GB de pesos, lo que lo sitúa al alcance de GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores.
- Caché KV: con 262.144 tokens de contexto, la caché puede crecer muy por encima del tamaño de los pesos. El contexto completo es inviable en una GPU de consumo; para explotarlo se necesita memoria agregada en múltiples GPU o técnicas de atención eficiente.
- GPU recomendadas para servicio en precisión completa: A100 40/80 GB, H100, B200. El autor usó 4 x NVIDIA B200 para el entrenamiento (SFT + DPO), dato declarado en el apartado de emisiones.
- GPU de consumo viables: RTX 3090/4090 (24 GB) en BF16 con contexto recortado; RTX 3060 12 GB, 4060 Ti 16 GB o 4070 con cuantización de 4 bits.
- Opciones de despliegue: Transformers (soporte nativo, es el formato publicado), vLLM o TGI para servicio con throughput alto, y llama.cpp u Ollama si se convierte previamente a GGUF. El repositorio solo publica safetensors, por lo que no hay GGUF listo para usar.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.
- Requisito práctico adicional: dado que el modo declarado es non-thinking, el consumo de tokens de salida por respuesta es menor que en modelos con cadena de pensamiento explícita, lo que reduce el coste de inferencia en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FR-MT-Bench (media, 4 jueces) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Millésime 2026 9B | 9,41B (dato real) | 262.144 tokens | 7,314 | Apache 2.0 | Safetensors, Transformers |
| Chocolatine-2.0.3-14B | 14B (nominal) | No disponible | 7,109 | No disponible | No disponible |
| Ministral-3-14B | 14B (nominal) | No disponible | 6,610 | No disponible | No disponible |
| Millésime 2026 4B | 4B (nominal) | No disponible | 6,575 | Apache 2.0 (mismo proyecto) | No disponible |
| Qwen3.5-9B (base) | 9B (nominal) | No disponible | 6,061 | No disponible | No disponible |

El dato relevante de la comparativa es que el modelo supera en FR-MT-Bench a dos alternativas de 14B parámetros con una media de 7,314 frente a 7,109 y 6,610, y mejora en 1,253 puntos a su propio modelo base. El autor no aporta comparativas de latencia, throughput ni coste de despliegue frente a estas alternativas.

## Limitaciones y advertencias

- Idioma único: solo se declara francés. El rendimiento en castellano, inglés u otros idiomas no está documentado y previsiblemente será inferior.
- Riesgo de alucinación: el SFT se basa en ejemplos generados sintéticamente, aunque fact-checkeados. El filtrado posterior no elimina el riesgo de invención de datos, especialmente en dominios de derecho y administración, donde un error tiene consecuencias reales.
- Sesgos de los datos de preferencia: el DPO se construye sobre preferencias humanas de la arena Compar:IA, filtradas a turnos únicos, francés y modelos permisivos. Esos filtros introducen sesgos de selección y descartan la señal de conversaciones multi-turno.
- Contexto multi-turno no optimizado: al haberse entrenado la fase de DPO solo con turnos únicos, el comportamiento en diálogos largos no está garantizado por el pipeline de alineamiento.
- Ausencia de benchmarks completos: la información disponible trunca el desglose de Global-MMLU-fr y no incluye los resultados de IFEval-fr ni GPQA-fr, pese a que la model card menciona su ejecución con Lighteval.
- Discrepancia de etiquetado: la lista de etiquetas del repositorio incluye image-text-to-text, pero la model card no documenta ninguna capacidad de visión ni entrada de imagen. No se debe asumir que el modelo procesa imágenes.
- Ausencia de cuantizaciones oficiales: el repositorio publica únicamente safetensors, por lo que cualquier despliegue en GGUF requiere conversión propia y validación de calidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B y de los datasets empleados, no detalladas en la información proporcionada.
- Métricas de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.
- Fechas de publicación en 2026 y referencias a jueces y modelos del mismo año: los datos de la ficha proceden exclusivamente de la model card del autor y no han sido contrastados con evaluaciones externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/borekboissy/Millesime-2026-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de SFT: https://huggingface.co/datasets/borekboissy/Millesime-2026-SFT
- Dataset de DPO: https://huggingface.co/datasets/borekboissy/Millesime-2026-comparIA-DPO
- Arena Compar:IA (origen de las preferencias): https://huggingface.co/datasets/ministere-culture/comparia-fr-arena
- Variante de 4B del mismo proyecto: https://huggingface.co/borekboissy/Millesime-2026-4b
- Modelo comparado Chocolatine-2.0.3-14B: https://huggingface.co/jpacifico/Chocolatine-2-14B-Instruct-v2.0.3
- Modelo comparado Ministral-3-14B: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
