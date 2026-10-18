# HYU-NLP-EVA2/qwen3-4b-medicine-static-pilot-261017-seed42-step-090

## Resumen

Este repositorio contiene un checkpoint de ajuste fino de Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.022.468.096 parámetros. Se publica como `qwen3-4b-medicine-static-pilot-261017-seed42-step-090`, correspondiente al paso 90 del run `261017_medicine_static_pilot_seed42` con semilla 42. La licencia es Apache-2.0 y los pesos se distribuyen en safetensors BF16 para Transformers.

El nombre del run indica un piloto en el dominio médico, pero la model card no documenta el dataset, el número de tokens, el objetivo de entrenamiento ni evaluaciones clínicas. El repositorio incluye también `original_checkpoint/` con los archivos nativos de veRL/FSDP, lo que facilita la reproducibilidad del entrenamiento.

Su relevancia es la de un artefacto de investigación reproducible para experimentar con ajuste fino médico sobre una base Qwen3 de 4B. No hay benchmarks publicados ni validación comunitaria (0 descargas y 0 likes en el momento de la consulta), por lo que no debe presentarse como un modelo clínico listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3, heredado de Qwen/Qwen3-4B-Instruct-2507; la model card no detalla capas, dimensiones ni mecanismo de atención |
| Parámetros totales | 4.022.468.096 (4,02B) |
| Parámetros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 en el repositorio; no se publican variantes GGUF, GPTQ, AWQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (exportación BF16 para Transformers); `original_checkpoint/` con formato nativo veRL/FSDP |
| Tamaño del repositorio | 25,7 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Pipeline | text-generation |
| Tags de despliegue | text-generation-inference, endpoints_compatible |
| Fecha de creación | 2026-10-18 |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.022.468.096 parámetros. No se documentan en la model card el número de capas, la dimensión oculta, el mecanismo de atención, la longitud de contexto nativa ni la tokenización. El repositorio contiene una exportación BF16 en Transformers y una carpeta `original_checkpoint/` con los archivos nativos de veRL/FSDP y metadatos.

El entrenamiento corresponde al run `261017_medicine_static_pilot_seed42`, checkpoint paso 90, semilla 42. El nombre sugiere un piloto en dominio médico, pero no se especifica la composición del dataset, el número de tokens, el objetivo (SFT, RL, DPO) ni si hubo RLHF. Tampoco se publican curvas de entrenamiento, pérdidas o evaluaciones. El uso de veRL/FSDP indica entrenamiento distribuido con ese stack, pero no permite inferir el algoritmo de optimización.

## Capacidades

- Generación de texto y conversación: pipeline `text-generation` y tag `conversational`; adecuado para respuestas multi-turno.
- Seguimiento de instrucciones: al derivar de una versión Instruct, se espera capacidad de instrucción; no hay evaluación específica publicada.
- Dominio médico: el run se etiqueta como `medicine`; no se documenta qué subdominio, tareas o datos clínicos se usaron.
- Razonamiento, código y matemáticas: no documentado para este checkpoint; el modelo base Qwen3-4B-Instruct-2507 tiene capacidades generales, pero no se han medido aquí.
- Tool calling / function calling: no documentado en la model card.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no documentado; no se incluyen módulos multimodales en la información disponible.
- Compatibilidad con TGI y endpoints: tags `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Resumen de historiales clínicos: el modelo puede condensar notas de evolución, informes y antecedentes en un resumen estructurado. Es adecuado por su ajuste declarado en medicina y su capacidad conversacional, pero requiere anonimización, verificación humana y control del contexto disponible.
- Extracción de información estructurada: a partir de texto clínico, generar JSON con entidades como síntoma, fármaco, dosis y fecha. Se usaría con prompts few-shot y validación de esquema; no hay tool calling documentado, así que la extracción sería por generación de texto.
- Asistente de preguntas sobre guías clínicas con RAG: recuperar fragmentos de guías y pedir al modelo una respuesta citada. El modelo actúa como generador; se debe limitar a los documentos recuperados para reducir alucinaciones.
- Educación al paciente: reescribir informes en lenguaje llano y generar preguntas frecuentes. Requiere revisión clínica y control de legibilidad; no debe sustituir la consulta.
- Apoyo a la codificación médica: proponer códigos CIE-10 o SNOMED a partir de diagnósticos y procedimientos, con revisión de codificadores. Es un caso de productividad, no de decisión autónoma.
- Generación de borradores de documentación: informes de alta, cartas de derivación y resúmenes de consulta. El modelo puede redactar borradores; la validación y firma deben ser humanas.
- Investigación y revisión bibliográfica: resumir abstracts y extraer poblaciones, intervenciones y resultados. Útil para cribado inicial; no sustituye la lectura crítica.
- Piloto de triaje no diagnóstico: clasificar urgencia aparente en textos sintéticos para investigación. No usar en producción sin validación clínica y regulatoria.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| MedQA | no disponible |
| PubMedQA | no disponible |
| Evaluación clínica | no disponible |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos BF16: 4.022.468.096 × 2 bytes ≈ 8,0 GB. El repositorio ocupa 25,7 GB por la copia adicional del checkpoint nativo.
- VRAM estimada en BF16: aproximadamente 10-12 GB para contexto corto (2K-4K tokens), incluyendo overhead y caché KV; para contextos largos será necesario más. La longitud de contexto no está documentada, así que la cifra es orientativa.
- Cuantización: no hay artefactos cuantizados publicados. Si se convierte a 8 bits, los pesos ocuparían unos 4-5 GB; a 4 bits, unos 2-3 GB, más caché KV y overhead.
- GPU recomendadas: A100 40/80 GB o H100 80 GB para despliegue concurrente; RTX 4090/3090 24 GB para BF16 con contexto moderado; RTX 4080, RTX 4070 Ti Super o RTX 4060 Ti 16 GB para BF16 con contexto corto; RTX 3060 12 GB o GPUs de 8 GB requieren cuantización.
- Consumer GPU: sí, en tarjetas de 16-24 GB en BF16; en 8-12 GB con cuantización si se generan pesos compatibles.
- Opciones de despliegue: Transformers, TGI (tag `text-generation-inference`), Hugging Face Inference Endpoints (`endpoints_compatible`), vLLM (requiere verificar soporte de Qwen3), llama.cpp u Ollama tras convertir a GGUF.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks o contexto de las alternativas en la información proporcionada; la comparación se limita a tamaño y licencia cuando consta.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 4,02B | no disponible | sin benchmarks publicados | Apache-2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible en la información | no disponible | Apache-2.0 | Hugging Face |
| Qwen3-4B-Base (referencia de misma familia) | no disponible en la información | no disponible | no disponible | Apache-2.0 (no verificado) | Hugging Face |
| Qwen2.5-3B-Instruct (alternativa de tamaño similar) | no disponible en la información | no disponible | no disponible | Apache-2.0 (no verificado) | Hugging Face |

## Limitaciones y advertencias

- Model card muy escueta: no documenta dataset, número de tokens, objetivo de entrenamiento, uso previsto ni limitaciones declaradas por el autor.
- Sin benchmarks clínicos ni generales: no hay MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni métricas de seguridad. No se puede afirmar calidad clínica.
- Riesgo de alucinación en dosis, contraindicaciones, interacciones, códigos CIE-10/SNOMED y recomendaciones terapéuticas.
- No apto para diagnóstico, triaje o decisión clínica autónoma sin validación prospectiva, revisión humana y cumplimiento regulatorio.
- Sesgos del modelo base y del dataset médico no documentado; no se han evaluado sesgos demográficos, lingüísticos ni de género.
- Idiomas soportados no disponibles; no se recomienda asumir cobertura multilingüe.
- Longitud de contexto no disponible; los casos de uso con documentos largos requieren verificación previa.
- El checkpoint corresponde al paso 90 de un piloto; puede ser un estado intermedio y no necesariamente el mejor checkpoint del run.
- Licencia Apache-2.0 permite uso comercial con las obligaciones de la licencia, pero no sustituye la certificación como producto sanitario (MDR, FDA u otras).
- Privacidad: no usar datos de pacientes identificables sin anonimización, base jurídica y acuerdos de tratamiento de datos.
- Repositorio de 25,7 GB: incluye una copia adicional del checkpoint nativo, lo que aumenta los requisitos de almacenamiento.
- Sin adopción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente.

## Enlaces

- https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-static-pilot-261017-seed42-step-090
- https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- https://github.com/volcengine/verl (stack veRL citado en la model card, sin enlace explícito en la misma)
