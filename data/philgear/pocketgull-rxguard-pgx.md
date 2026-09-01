# philgear/pocketgull-rxguard-pgx

## Resumen

PocketGull RxGuard & PGx Interaction Screener es un adaptador LoRA de propósito clínico que se monta sobre el modelo base `google/gemma-3-4b-it`. Desarrollado por PocketGull LLC (Oregon, EE. UU.) bajo la dirección de Phillip Gear, este adaptador se ha afinado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos que cumplen los estándares de desidentificación HIPAA Safe Harbor. Su función principal es el cribado de interacciones farmacológicas mediadas por el citocromo P450 (CYP2D6, CYP2C19, SLCO1B1) entre fármacos de prescripción y suplementos botánicos, un área de alto riesgo en la práctica clínica diaria.

El modelo se distribuye como un adaptador PEFT (librería `peft`) con licencia Apache 2.0, lo que permite su integración en entornos locales y en la nube privada (por ejemplo, Vertex AI) sin retención de datos de pacientes. Al estar basado en Gemma 3 4B, hereda una arquitectura transformer decoder-only con ventana de contexto de 128K tokens, aunque el adaptador ha sido entrenado específicamente en inglés. Su relevancia reside en combinar la generación de texto generalista de Gemma 3 con un conocimiento especializado en farmacogenómica, ofreciendo una herramienta de apoyo a la decisión clínica que no requiere infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B) con adaptador LoRA |
| Parametros totales | 4.000 millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | No especificados para el adaptador; compatible con cuantizaciones estandar del modelo base (GGUF, AWQ, etc.) |
| Idiomas soportados | Ingles (entrenamiento del adaptador); el modelo base soporta multiples idiomas, pero no se garantiza su rendimiento fuera del ingles |
| Licencia | Apache 2.0 (tanto el adaptador como el modelo base Gemma 3 4B) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Gemma 3 4B Instruct, un modelo de lenguaje de 4.000 millones de parametros con arquitectura transformer decoder-only, atención multi-cabeza y ventana de contexto de 128K tokens. Sobre este modelo base se aplica una adaptación de bajo rango (LoRA) que añade un conjunto reducido de parametros entrenables, permitiendo un ajuste eficiente sin modificar los pesos originales. El entrenamiento del adaptador se realizó mediante Direct Preference Optimization (DPO), una técnica de alineación que optimiza las preferencias humanas sin necesidad de un modelo de recompensa explícito.

Los datos de entrenamiento provienen de fuentes clínicas etiquetadas en los tags del modelo: NIH MedQuAD (conjunto de preguntas y respuestas médicas) y WHO mhGAP (Programa de Acción para Superar las Brechas en Salud Mental). Estos datos fueron procesados para cumplir estrictamente los estándares de desidentificación HIPAA Safe Harbor (§164.514), eliminando cualquier información de salud protegida (PHI). No se especifica el número exacto de tokens de entrenamiento ni la composición detallada del dataset. El enfoque en interacciones CYP450 y farmacogenómica sugiere un entrenamiento dirigido a casos de uso concretos, como la evaluación de fenotipos metabolizadores y el riesgo de interacciones hierba-fármaco.

## Capacidades

- Generación de texto clínico especializado en interacciones farmacológicas, con énfasis en el sistema del citocromo P450 (CYP2D6, CYP2C19, SLCO1B1).
- Análisis de interacciones entre fármacos de prescripción y suplementos botánicos (por ejemplo, hierba de San Juan, Ginkgo Biloba).
- Evaluación de fenotipos metabolizadores (metabolizador intermedio, lento, etc.) y sus implicaciones para la selección de analgésicos u otros medicamentos.
- Soporte a decisiones clínicas en farmacogenómica, orientado a profesionales sanitarios autorizados.
- Capacidad de razonamiento multi-paso para analizar escenarios complejos con múltiples fármacos y suplementos.
- No se documenta soporte explícito para tool calling, agentes o visión; su pipeline es de generación de texto.

## Casos de uso

- Revisión de interacciones medicamentosas en pacientes polimedicados: el modelo puede analizar una lista de fármacos y suplementos, identificando posibles interacciones mediadas por CYP450 y alertando sobre riesgos de sangrado u otros efectos adversos. Su ventana de contexto permite procesar historiales extensos.
- Evaluación de fenotipos farmacogenómicos: dado un resultado de genotipado (por ejemplo, CYP2D6 metabolizador intermedio), el modelo puede explicar las implicaciones para la elección de codeína frente a tramadol, ayudando a los médicos a personalizar la analgesia.
- Cribado de suplementos botánicos en pacientes anticoagulados: el modelo puede evaluar el riesgo de interacción entre warfarina y hierbas como la hierba de San Juan o el Ginkgo Biloba, proporcionando una justificación basada en la inhibición o inducción enzimática.
- Soporte a farmacéuticos comunitarios: integrado en un sistema de dispensación, el adaptador puede generar alertas contextualizadas al revisar recetas y suplementos de venta libre, mejorando la seguridad del paciente.
- Formación de personal sanitario: el modelo puede generar casos clínicos hipotéticos y explicaciones didácticas sobre farmacogenómica, útil en entornos educativos.
- Auditoría de prescripciones en entornos de salud digital: al ser un adaptador ligero, puede desplegarse en infraestructura local o en la nube para revisar automáticamente conjuntos de prescripciones y señalar posibles interacciones antes de la dispensación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni métricas clínicas específicas para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Gemma 3 4B en precisión fp16 requiere aproximadamente 8 GB de VRAM; con cuantización int4 puede reducirse a unos 4 GB. El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, A100, H100. Cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en fp16.
- Cabe en GPU de consumo: sí, especialmente con cuantización. Una RTX 3060 12GB puede ejecutar el modelo en fp16 sin problemas.
- Opciones de despliegue: Transformers con PEFT, vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), Ollama (con conversión previa), y servicios en la nube como Vertex AI.
- Latencia y throughput: no se han publicado datos específicos; para un modelo de 4B en una GPU moderna, la generación suele rondar 20-40 tokens por segundo en fp16, dependiendo de la longitud de salida.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de farmacogenómica. Como alternativa de propósito general en el mismo rango de parámetros se pueden considerar:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma 3 4B (base) | 4B | 128K | Apache 2.0 | Generico, sin especializacion clinica |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 license | Generico, sin especializacion clinica |
| Qwen 2.5 7B | 7B | 128K | Apache 2.0 | Generico, mayor tamano |

Ninguno de estos modelos ofrece la especialización en interacciones CYP450 de PocketGull RxGuard, pero pueden servir como base para adaptaciones similares.

## Limitaciones y advertencias

- El adaptador ha sido entrenado exclusivamente en inglés; su rendimiento en otros idiomas no está garantizado.
- La especialización se limita a interacciones CYP450 y farmacogenómica; no cubre otras áreas clínicas como diagnóstico o tratamiento general.
- No se han publicado evaluaciones de sesgos ni estudios de robustez; el uso clínico debe ser supervisado por profesionales sanitarios.
- Riesgo de alucinación inherente a los modelos generativos; las respuestas deben verificarse con fuentes autorizadas.
- El modelo se presenta como herramienta de apoyo a la decisión (CDS) no regulada según FDA 520(o), pero no sustituye el juicio clínico.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de no retención de PHI depende del despliegue; el adaptador en sí no contiene datos de pacientes.
- No se especifican los parámetros exactos del adaptador LoRA (rank, alpha, etc.), lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philgear/pocketgull-rxguard-pgx
- Repositorio de PocketGull en GitHub: https://github.com/philgear/pocketgull
- Sitio web de PocketGull: https://pocketgull.com
- DOI de Zenodo (open science provenance): https://doi.org/10.5281/zenodo.20647514
- ORCID de Phillip Gear: https://orcid.org/0009-0008-1372-5381
