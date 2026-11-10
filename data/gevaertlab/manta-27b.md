# gevaertlab/MANTA-27B

## Resumen

MANTA-27B es un modelo de decisión médica desarrollado por el Gevaert Lab del Department of Computational Medicine de la Universidad de Stanford. A diferencia de los modelos generativos convencionales, MANTA no produce texto: recibe un caso clínico (texto o JSON) junto con imágenes médicas opcionales y entre una y 64 preguntas con sus opciones de respuesta, y devuelve en un único forward pass una probabilidad calibrada para cada opción. Se construye sobre el backbone vision-language Qwen3.8-27B, al que se añade una cabeza de decisión entrenada desde cero y se adaptan end-to-end tanto la torre de lenguaje como la de visión.

El modelo resuelve un problema concreto: la evaluación estructurada y calibrada de decisiones clínicas, evitando la generación libre de texto y sus derivas. Con 27.484.784.884 parámetros en BF16 (55 GB en 12 shards de safetensors), una ventana de prompt de hasta 4.096 tokens y alrededor de 60 GB de VRAM para inferencia, se posiciona como una alternativa open-weight a modelos frontera propietarios en tareas de decisión médica. Según la model card, alcanza un 86,0 % de accuracy en MANTA-Bench medical, frente al 71,0 % del mejor modelo no-MANTA comparado.

Es relevante ahora porque demuestra que un modelo abierto de tamaño medio, con una arquitectura orientada a clasificación calibrada en lugar de generación, puede superar a APIs propietarias en decisiones clínicas estructuradas (86,1 % frente a 76,0 % de Gemini 3.8 Flash o 74,6 % de Claude Sonnet 5.5 en el conjunto de 6.700 preguntas reportado). No obstante, el autor lo declara explícitamente como modelo de investigación y no como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (backbone Qwen3.8-27B adaptado) con cabeza de decisión entrenada desde cero |
| Parametros totales | 27.484.784.884 (27,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 4.096 tokens de prompt |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (licencia del backbone Qwen3.8-27B en `LICENSE_base_model`) |
| Formato de pesos | safetensors (BF16, 12 shards, 55,0 GB; sha256 en `SHA256SUMS`) |

## Arquitectura y entrenamiento

MANTA-27B parte del backbone vision-language Qwen3.8-27B y le incorpora una cabeza de decisión nueva, entrenada desde cero, que puntúa directamente cada opción de respuesta en lugar de generar texto. Tanto la torre de lenguaje como la de visión se adaptan end-to-end mediante un proceso de entrenamiento multi-etapa diseñado específicamente para obtener probabilidades de opción calibradas. El modelo acepta casos en texto o JSON, imágenes opcionales y de 1 a 64 preguntas con sus opciones, y emite una probabilidad por opción en un solo forward pass.

El entrenamiento se realizó sobre aproximadamente 8,5 millones de peticiones de decisión, el 68 % de ellas médicas (texto e imágenes), con un coste de unas 1.800 GPU-horas en H100. En cuanto a modalidades, los datos cubren imágenes y texto; las señales fisiológicas se renderizan como imágenes, los volúmenes 3D de CT y MRI se usan como cortes 2D y los vídeos médicos como fotogramas individuales. La model card detalla cobertura en radiología (rayos X de tórax, mamografía, radiografía dental panorámica, CT convencional y con contraste, micro-CT, MRI en múltiples secuencias incluyendo T1, T2, FLAIR, difusión y mapas de perfusión, PET y FDG PET/CT, ecografía en modo B y transtorácica), entre otras modalidades que la información disponible trunca.

## Capacidades

- Clasificación y decisión médica estructurada: devuelve una probabilidad calibrada por cada opción de respuesta de hasta 64 preguntas en un único forward pass.
- Procesamiento multimodal: acepta texto clínico, JSON e imágenes médicas (radiología, patología, ecografía, PET, entre otras).
- Calibración de probabilidades: ECE-15 de 0,021 en los conjuntos de test in-domain según la model card.
- Razonamiento clínico sobre casos: responde preguntas de opción múltiple sobre conocimiento médico, QA médica y conjuntos de examen con imágenes.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no genera texto ni ejecuta cadenas de acciones).
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: cabecera de decisión dedicada, sin modo thinking ni generación de texto.

## Casos de uso

- Triaje asistido en radiología: dado un estudio de imagen (rayos X, CT, MRI) y un cuestionario estructurado de hallazgos, el modelo devuelve probabilidades por hallazgo en un solo forward pass, lo que permite umbralizar y priorizar casos antes de la revisión del radiólogo.
- Segunda lectura en patología y ecografía: integración en visores clínicos que envían la imagen junto con preguntas de clasificación estandarizadas y reciben probabilidades calibradas para señalar discrepancias.
- Soporte a la decisión clínica documentada: a partir de un caso en JSON con antecedentes, analítica y preguntas de opción múltiple, el modelo puntúa diagnósticos diferenciales o conductas terapéuticas, sirviendo como entrada a sistemas de ayuda con revisión humana obligatoria.
- Investigación en calibración médica: su ECE-15 de 0,021 lo hace adecuado para estudios que comparan la fiabilidad de probabilidades entre modelos generativos y modelos de decisión.
- Evaluación automatizada de modelos médicos: uso como evaluador de referencia en benchmarks internos de QA médica (MedQA, MedMCQA, PubMedQA, HEAD-QA) y conjuntos de examen con imágenes.
- Filtrado y clasificación de cohorts retrospectivas: procesamiento por lotes de informes clínicos e imágenes para etiquetar casos según criterios estructurados, aprovechando la ventana de 4.096 tokens y el formato JSON de entrada.
- Comparación de hipótesis en investigación traslacional: puntuación de opciones múltiples sobre casos con señales fisiológicas renderizadas como imágenes o cortes 2D de volúmenes CT/MRI.

## Benchmarks y rendimiento

| Benchmark | MANTA-27B | Referencia comparada |
|---|---|---|
| MANTA-Bench medical (accuracy) | 86,0 % | liquid-d1-ultra 71,0 % (mejor no-MANTA); MANTA-4B 85,3 % |
| Decisiones clínicas (6.700 preguntas) | 86,1 % | Gemini 3.8 Flash 76,0 %; Claude Sonnet 5.5 74,6 %; GPT-6 Luna (chat) 62,4 %; MedGemma 27B (local) 52,3 % |
| Medical QA (MedQA, MedMCQA, PubMedQA, HEAD-QA), media | 83,6 % | rank 4 de 27 modelos de decisión |
| ECE-15 (in-domain) | 0,021 | no disponible para los comparados |
| Media de accuracy entre 11 modelos open-weight | 76,1 % | mammoth-1 75,5 % (siguiente) |
| Latencia mediana por petición (H100, batch 1) | 148 ms | MANTA-4B 68 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 60 GB en BF16 para una sola GPU.
- GPU recomendadas: H100 (referencia de latencia reportada); A100 80 GB como alternativa con memoria suficiente.
- Cabe en GPU de consumo: no en configuraciones estándar de 24 GB (RTX 4090) sin cuantización, y no se documentan pesos cuantizados en la información disponible.
- Opciones de despliegue: transformers con `custom_code` (requiere cargar código propio del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia mediana de 148 ms por petición en una H100 a batch size 1; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MANTA-Bench medical | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MANTA-27B | 27,5B | 4.096 tokens | 86,0 % | Apache 2.0 | Pesos abiertos en Hugging Face |
| MANTA-4B | no disponible | no disponible | 85,3 % | no disponible en la información | Pesos abiertos en Hugging Face |
| MedGemma 27B | 27B (aproximado) | no disponible | 52,3 % (decisiones clínicas) | no disponible en la información | Local |
| Gemini 3.8 Flash | no disponible | no disponible | 76,0 % (decisiones clínicas) | propietaria | API |
| Claude Sonnet 5.5 | no disponible | no disponible | 74,6 % (decisiones clínicas) | propietaria | API |

## Limitaciones y advertencias

- El autor declara explícitamente que es un modelo de investigación, no un dispositivo médico; no debe usarse para diagnóstico, tratamiento ni decisiones sobre pacientes sin validación independiente y revisión por clínicos cualificados.
- Riesgo de alucinación: aunque no genera texto libre, las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; la ECE reportada es solo in-domain.
- Sesgos conocidos: no documentados en la información disponible; la composición del 68 % de datos médicos y el 32 % restante no se detalla.
- Limitación de idioma: solo inglés.
- Limitación de contexto: 4.096 tokens de prompt, insuficiente para informes clínicos extensos o historiales completos.
- Restricciones de licencia: Apache 2.0 para el modelo, pero el backbone Qwen3.8-27B tiene su propia licencia en `LICENSE_base_model`, que conviene revisar para uso comercial.
- No soporta generación de texto, tool calling ni flujos de agente, lo que limita su integración en pipelines conversacionales.
- Requiere cargar código propio (`custom_code`) y confiar en el repositorio del autor; el modelo tiene 0 descargas y 1 like en el momento de la consulta, sin validación comunitaria amplia.
- La model card está truncada en la información disponible; faltan detalles de patología y otras modalidades anunciadas.

## Enlaces

- Hugging Face: https://huggingface.co/gevaertlab/MANTA-27B
- MANTA-4B: https://huggingface.co/gevaertlab/MANTA-4B
- Backbone Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
