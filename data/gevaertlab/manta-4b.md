# gevaertlab/MANTA-4B

## Resumen

MANTA-4B es un modelo de decisión médica desarrollado por el Gevaert Lab del Department of Computational Medicine de la Universidad de Stanford. A diferencia de un modelo generativo convencional, MANTA no produce texto: recibe un caso clínico (texto o JSON), opcionalmente acompañado de imágenes médicas, junto con un conjunto de preguntas y sus opciones de respuesta, y devuelve en un único forward pass una probabilidad calibrada para cada opción. Está construido sobre el backbone vision-language Qwen3.5-4B, al que se le añade una cabeza de decisión entrenada desde cero.

El modelo se presenta en dos releases: MANTA-4B (esta ficha, más pequeño y rápido) y MANTA-27B (más preciso). MANTA-4B almacena 5.287.287.300 parámetros en BF16 (el embedding de salida es una copia almacenada del embedding de entrada del backbone), ocupa unos 10,6 GB en tres shards de safetensors y requiere aproximadamente 16 GB de VRAM en una sola GPU. Su ventana de prompt es de hasta 4.096 tokens y admite entre 1 y 64 preguntas con sus opciones por petición.

Su relevancia actual radica en el enfoque: en lugar de generar respuestas que luego hay que parsear, puntúa directamente cada opción con calibración explícita (ECE-15 de 0,028 en los test in-domain) y con una latencia mediana de 68 ms por petición en una H100 a batch size 1. Según la model card, alcanza un 85,3 % de accuracy en MANTA-Bench medical, superando a modelos frontera como Gemini 3.8 Flash (76,0 %) o Claude Sonnet 5.5 (74,6 %) en el mismo conjunto de 6.700 preguntas clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone vision-language Qwen3.5-4B adaptado + cabeza de decisión entrenada desde cero |
| Parametros totales | 5.287.287.300 (5,3B almacenados; el embedding de salida es copia del embedding de entrada del backbone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 4.096 tokens de prompt |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (con licencia separada del modelo base Qwen3.5-4B en `LICENSE_base_model`) |
| Formato de pesos | safetensors (BF16, 3 shards, 10,6 GB, con `SHA256SUMS`) |

## Arquitectura y entrenamiento

MANTA-4B parte del backbone vision-language Qwen3.5-4B y le incorpora una cabeza de decisión nueva, entrenada desde cero, que puntúa directamente cada opción de respuesta en lugar de generar texto. Tanto la torre de lenguaje como la torre de visión se adaptan de extremo a extremo mediante un proceso de entrenamiento multi-etapa diseñado específicamente para producir probabilidades de opción calibradas. La entrada admite un caso en texto o JSON, imágenes opcionales y de 1 a 64 preguntas con sus opciones; la salida es una probabilidad calibrada por opción en un solo forward pass.

El entrenamiento se realizó sobre aproximadamente 8,5 millones de peticiones de decisión, de las cuales el 68 % son médicas (texto e imágenes), con unas 600 horas-GPU de H100 dedicadas a los pasos de entrenamiento. En cuanto a modalidades, los datos combinan imagen y texto: las señales fisiológicas se renderizan como imágenes, los volúmenes 3D de CT y MRI se usan como cortes 2D y los vídeos médicos como fotogramas individuales. La cobertura médica incluye radiología (radiografía de tórax, radiografía digital, mamografía, radiografía dental panorámica, CT convencional y con contraste, micro-CT, y MRI en secuencias T1, T1 con contraste, T2, FLAIR, densidad protónica, difusión y mapas de perfusión CBF, CBV, MTT, Tmax y TTP, entre otras).

## Capacidades

- Clasificación y decisión médica multimodal: devuelve una probabilidad calibrada por cada opción de respuesta a partir de texto clínico e imágenes médicas.
- Procesamiento de imagen radiológica y patológica: rayos X de tórax, mamografía, radiografía dental panorámica, CT (convencional, con contraste y micro-CT) y MRI en múltiples secuencias y mapas de perfusión.
- Procesamiento de texto clínico: casos en texto libre o JSON estructurado.
- Manejo de múltiples preguntas por petición: de 1 a 64 preguntas con sus opciones, todas resueltas en un único forward pass.
- Conversión de modalidades auxiliares: señales fisiológicas renderizadas como imágenes, volúmenes 3D como cortes 2D y vídeo médico como fotogramas.
- Calibración explícita de probabilidades (ECE-15 de 0,028 en test in-domain).
- No genera texto: es un modelo de decisión, no un modelo conversacional.
- No se documenta soporte de tool calling ni de razonamiento multi-paso con agentes.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Triaje radiológico asistido: dado un estudio de imagen (radiografía de tórax, mamografía, corte de CT o MRI) y un conjunto de preguntas con opciones diagnósticas, el modelo devuelve probabilidades calibradas por opción en un solo forward pass, lo que permite priorizar casos con alta incertidumbre para revisión humana.
- Segunda lectura estructurada en patología y radiología: integrado en un visor clínico, puede puntuar opciones de hallazgos o categorías diagnósticas sobre imágenes y texto de informe, sirviendo como señal de contraste para el radiólogo.
- Preguntas de examen médico y evaluación de conocimiento: con 76,1 % de media en MedQA, MedMCQA, PubMedQA y HEAD-QA, es adecuado para construir bancos de evaluación de conocimiento clínico con puntuación probabilística en lugar de generación libre.
- Investigación en calibración de modelos médicos: su ECE-15 de 0,028 y su salida probabilística por opción lo hacen útil para estudiar calibración, incertidumbre y selección selectiva en pipelines de decisión clínica.
- Filtrado y priorización de casos en grandes volúmenes: con 68 ms de latencia mediana por petición en una H100 a batch size 1, puede procesar lotes de casos clínicos con preguntas estandarizadas para preclasificar antes de la revisión especializada.
- Extracción de decisiones estructuradas desde texto clínico: recibiendo notas o casos en JSON junto con preguntas de opción múltiple, devuelve una distribución de probabilidad sobre las opciones, apta para tareas de anotación asistida o armonización de cohortes en investigación.
- Evaluación comparativa de sistemas de decisión médica: al no generar texto y devolver directamente probabilidades, simplifica la comparación justa entre modelos sobre el mismo conjunto de preguntas y opciones.

## Benchmarks y rendimiento

| Benchmark | MANTA-4B | Referencia comparada |
|---|---|---|
| MANTA-Bench medical (accuracy) | 85,3 % | MANTA-27B 86,0 %; mejor modelo no-MANTA: liquid-d1-ultra 71,0 % |
| Decisiones clínicas (6.700 preguntas) | 86,1 % | Gemini 3.8 Flash 76,0 %; Claude Sonnet 5.5 74,6 %; GPT-6 Luna (chat) 62,4 %; MedGemma 27B (local) 52,3 % |
| Media en modelos open-weight comparados | 71,4 % (puesto 4 de 11) | MANTA-27B 76,1 %; mammoth-1 75,5 %; pplx-decider-v1.2 72,9 % |
| Medical QA (MedQA, MedMCQA, PubMedQA, HEAD-QA), media | 76,1 % (puesto 20 de 27 modelos de decisión) | no disponible por subconjunto |
| ECE-15 (test in-domain) | 0,028 | no disponible para comparativas |
| Latencia mediana por petición (H100, batch 1) | 68 ms | MANTA-27B 148 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en BF16 (pesos de 10,6 GB más overhead de activaciones y prompt).
- GPU recomendadas: una H100 es la configuración de referencia reportada (68 ms de latencia mediana a batch size 1); una A100 de 40 GB o 80 GB es holgada para el modelo en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM (por ejemplo, RTX 4090 de 24 GB, RTX 4080 de 16 GB al límite). No se documentan pesos cuantizados en el repositorio, por lo que la cuantización requeriría conversión propia.
- Opciones de despliegue: biblioteca `transformers` con `custom_code` (el repositorio incluye código propio, por lo que requiere `trust_remote_code=True`). No se documenta soporte verificado en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 68 ms de latencia mediana por petición en una H100 a batch size 1 según la model card. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MANTA-Bench medical | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MANTA-4B | 5,3B almacenados | 4.096 tokens de prompt | 85,3 % | Apache 2.0 | Pesos abiertos en Hugging Face |
| MANTA-27B | no disponible | no disponible | 86,0 % | no disponible | Pesos abiertos en Hugging Face |
| MedGemma 27B | 27B (según la model card) | no disponible | 52,3 % en decisiones clínicas | no disponible | Local |
| liquid-d1-ultra | no disponible | no disponible | 71,0 % | no disponible | no disponible |

Comparado con MANTA-27B, MANTA-4B sacrifica 0,7 puntos de accuracy en MANTA-Bench medical a cambio de reducir el requisito de VRAM de unos 60 GB a unos 16 GB y la latencia mediana de 148 ms a 68 ms. Frente a MedGemma 27B en el conjunto de decisiones clínicas, la diferencia reportada es de 86,1 % frente a 52,3 %. No se dispone de datos de contexto ni de licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card indica explícitamente que es un modelo de investigación y que no debe usarse para diagnóstico, tratamiento ni ninguna decisión sobre un paciente sin validación independiente sobre datos propios y revisión por clínicos cualificados.
- No genera texto: no puede usarse como asistente conversacional ni para redactar informes; su salida es únicamente una distribución de probabilidad sobre opciones predefinidas.
- Sesgos: no se documentan análisis de sesgo por subgrupo demográfico, equipo o centro; el rendimiento puede degradarse fuera de la distribución de los datos de entrenamiento.
- Riesgo de alucinación: al ser un modelo de clasificación, el riesgo se traslada a asignar alta probabilidad a opciones incorrectas; la calibración reportada es in-domain y no garantiza calibración fuera de ese dominio.
- Limitaciones de idioma: solo inglés, lo que limita su uso directo en entornos clínicos en castellano sin traducción previa.
- Limitaciones de contexto: 4.096 tokens de prompt, insuficiente para informes clínicos extensos o múltiples estudios completos en una sola petición.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, pero el modelo base Qwen3.5-4B tiene su propia licencia en `LICENSE_base_model`, que debe revisarse antes de un uso comercial.
- Requiere `trust_remote_code=True` por el código personalizado incluido en el repositorio; conviene auditar dicho código antes de desplegarlo en producción.
- No se documentan pesos cuantizados ni soporte verificado en motores de inferencia de alto rendimiento distintos de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gevaertlab/MANTA-4B
- Release MANTA-27B: https://huggingface.co/gevaertlab/MANTA-27B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
