# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-039

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-039` es un checkpoint de 4.022.468.096 parámetros derivado de `Qwen/Qwen3-4B-Instruct-2507` mediante un pilot de ajuste orientado a medicina denominado `261016_medicine_static_pilot`. Lo publica HYU-NLP-EVAL con licencia Apache-2.0, en formato Transformers BF16 con pesos safetensors y un directorio `original_checkpoint/` con archivos nativos veRL/FSDP.

No es un modelo final: se trata del paso 39 de una ejecución con semilla 11. La model card no documenta la composición del dataset, el número de tokens, el algoritmo de ajuste, la ventana de contexto ni resultados de evaluación. El modelo base Qwen3-4B-Instruct-2507 se asocia a 262.144 tokens de contexto, pero este checkpoint no lo confirma.

Su interés principal es la experimentación: permite estudiar la evolución de un ajuste médico sobre una base instruct de 4B y probar prototipos con RAG en hardware de consumo. Debe tratarse como material de evaluación e investigación, no como un asistente clínico listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen3, denso; detalles de capas y atención no disponibles en la model card |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso; no se indica que sea MoE) |
| Longitud de contexto | No disponible en la model card; el base Qwen3-4B-Instruct-2507 declara 262.144 tokens, no confirmado para este checkpoint |
| Tipos de cuantización | No se incluyen pesos cuantizados; el export es BF16. Cuantización externa a 8-bit o 4-bit posible, no validada en el repositorio |
| Idiomas soportados | No disponibles en la model card; no se declara cobertura multilingüe para este checkpoint |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) en la raíz; `original_checkpoint/` con archivos nativos veRL/FSDP |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del repositorio | 25,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, denso, con 4.022.468.096 parámetros. La model card no incluye la configuración de capas, el mecanismo de atención ni la ventana de contexto efectiva. El checkpoint nativo está guardado con veRL/FSDP, lo que sugiere un pipeline de ajuste distribuido, posiblemente con RL, pero no se especifica el algoritmo exacto.

El entrenamiento corresponde a la ejecución `261016_medicine_static_pilot`, checkpoint 39, semilla 11, sobre Qwen3-4B-Instruct-2507. No se documentan el número de tokens, la composición del dataset médico, si hubo RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se detalla si el ajuste fue SFT, RL o una mezcla.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones: capacidad heredada del modelo base instruct, no evaluada en este checkpoint.
- Razonamiento, matemáticas y código: el base Qwen3-4B-Instruct-2507 declara estas capacidades, pero no hay benchmarks ni validación publicada para este fine-tune.
- Dominio médico: el nombre y la información disponible indican un pilot de ajuste orientado a medicina; no se especifica qué tareas médicas cubre ni con qué datos.
- Tool calling / function calling: no documentado en la model card; no confirmado para este checkpoint.
- Agentes y razonamiento multi-paso: no documentado; no hay evidencia de soporte específico.
- Capacidades multilingües: no disponibles; no se declara cobertura de idiomas.
- Visión, audio o modo thinking: no documentado; no hay indicios de soporte.

## Casos de uso

- Resumen y estructuración de notas clínicas: el modelo puede transformar texto libre en secciones ordenadas para revisión humana. Es adecuado por su tamaño contenido, pero requiere seudonimización, control de acceso y validación de la ventana de contexto real.
- Extracción de entidades y codificación: puede apoyar la identificación de síntomas, fármacos, pruebas y posibles códigos CIE-10 en corpus médicos. Su ajuste piloto en medicina lo hace candidato para experimentación, siempre con anotación humana y métricas de extracción.
- RAG sobre guías clínicas y literatura: permite construir un asistente que responda con fragmentos recuperados y citas. Un modelo de 4B es viable en infraestructura pequeña, aunque la model card no confirma el límite de contexto y el riesgo de alucinación exige verificación.
- Generación de borradores de informes y material educativo: puede redactar explicaciones para pacientes, instrucciones de alta o resúmenes divulgativos a partir de datos estructurados. Requiere revisión clínica y control de estilo antes de publicar.
- Preconsulta y triaje conversacional: puede recoger síntomas y antecedentes en una conversación multi-turno, marcando señales de alarma para escalado humano. No debe usarse para diagnóstico autónomo ni para sustituir la valoración médica.
- Anotación y curación de corpus médicos: puede asistir en el etiquetado, resumen y normalización de grandes volúmenes de texto para investigación. Su tamaño facilita el despliegue local y la experimentación con pocos recursos.
- Evaluación de checkpoints y experimentos de ajuste: al ser un paso intermedio de una ejecución reproducible con semilla 11, sirve para comparar la evolución del entrenamiento frente a otros pasos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| MedQA | No disponible |
| PubMedQA | No disponible |

No hay datos de latencia, throughput ni comparación de rendimiento con otros modelos.

## Requisitos de hardware

- Pesos en BF16: 4.022.468.096 parámetros × 2 bytes ≈ 8,0 GB. Con activaciones y KV cache, se estiman 12-16 GB de VRAM para contextos moderados y 24 GB para lotes mayores o contextos largos.
- Cuantización a 8-bit: aproximadamente 4,0 GB de pesos y 8-10 GB de VRAM total estimada.
- Cuantización a 4-bit: aproximadamente 2,0-2,5 GB de pesos y 6-8 GB de VRAM total estimada. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 12 GB; en GPUs de 8 GB solo con contexto corto y cuantización agresiva.
- GPU recomendadas: RTX 4090, L40S, A100 o H100 para BF16 con contexto largo; RTX 3090/4090 de 24 GB para BF16 en contextos moderados; GPUs consumer de 12-16 GB para 8-bit o 4-bit.
- Despliegue: Transformers de forma nativa; TGI, ya que el repositorio incluye la etiqueta `endpoints_compatible`; vLLM previsiblemente compatible con Qwen3; llama.cpp u Ollama tras convertir a GGUF, formato no incluido en el repositorio.
- El repositorio ocupa 25,7 GB porque incluye el export BF16 y el checkpoint original. Para inferencia solo se necesita el export de la raíz.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar rendimiento. La siguiente tabla compara metadatos y disponibilidad con el modelo base y checkpoints hermanos de la misma ejecución.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este checkpoint (step-039) | 4.022.468.096 | No disponible (base: 262.144; no confirmado) | Apache-2.0 | Hugging Face | No disponible |
| Qwen3-4B-Instruct-2507 (base) | 4B aproximados | 262.144 tokens según especificación del base | Apache-2.0 | Hugging Face | No evaluado aquí |
| qwen3-4b-medicine-static-pilot-261016-step-038 | 4B | No disponible | No disponible | Hugging Face / Featherless | No disponible |
| qwen3-4b-medicine-static-pilot-261016-step-002 | 4B | 32.768 tokens según Featherless | No disponible | Featherless | No disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio del paso 39, no un modelo final. No hay garantía de que el ajuste haya convergido ni de que sea estable en producción.
- No se han publicado benchmarks ni evaluaciones clínicas. Cualquier uso médico requiere validación específica, revisión humana y cumplimiento regulatorio.
- Riesgo elevado de alucinación en dominio sanitario: puede inventar referencias, dosis, diagnósticos o códigos. No debe usarse para decisiones clínicas autónomas.
- No se documentan los datos de entrenamiento, por lo que se desconocen sesgos, contaminación de benchmarks y cobertura real de poblaciones o idiomas.
- La longitud de contexto no está confirmada en la model card. Aunque el base declare 262.144 tokens, el checkpoint puede haber sido entrenado o exportado con otra configuración.
- No se declaran idiomas soportados. El rendimiento en castellano o en otras lenguas distintas del inglés no está verificado.
- No se documenta tool calling, soporte de agentes ni alineamiento de seguridad. No conviene asumir estas capacidades sin pruebas.
- La licencia Apache-2.0 permite uso comercial, pero no garantiza el cumplimiento de GDPR, HIPAA u otras normativas sanitarias. El uso con datos de pacientes exige base legal, seudonimización y acuerdos de tratamiento de datos.
- El repositorio duplica el checkpoint en formato BF16 y veRL/FSDP, lo que aumenta el almacenamiento y puede complicar el despliegue.
- La ejecución usa una única semilla (11). Los resultados pueden variar con otras semillas o pasos, y no se ha publicado variabilidad entre ejecuciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-039)
- [Modelo base Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- [Checkpoint relacionado step-002 en Featherless](https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-002)
- [Checkpoint relacionado step-038 en Featherless](https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-038)
- [Checkpoint relacionado step-004 en Friendli](https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-004)
- [Modelo relacionado de otra ejecución en Hugging Face](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-000)
- [Modelo relacionado en LLM Explorer](https://llm-explorer.com/model/HYU-NLP-EVAL%2Fqwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-008,cMGLnuq6Ni0ObvQjQQgbT)
