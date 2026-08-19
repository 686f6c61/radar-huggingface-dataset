# Doses-AI/Pestle-27B-Ternary-GGUF

## Resumen

Pestle-27B-Ternary-GGUF es una cuantización ternaria del modelo Qwen/Qwen3.6-27B, desarrollada por Doses-AI como vista previa de investigación para evaluación y desarrollo. El modelo está especializado en razonamiento médico, conocimiento clínico y generación de código, y destaca por reducir el peso de los parámetros en un factor de 8,2× respecto al original FP16, manteniendo una retención mediana de capacidades del 96,48 %. Según los datos declarados por el autor, supera a MedGemma-27B FP16 en la mayoría de benchmarks médicos de texto publicados, a pesar de ocupar solo 8,48 GB en formato GGUF.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Está diseñado para ejecutarse localmente mediante el runtime Mortar (compatible con Apple Silicon, NVIDIA CUDA y CPU), e incluye plantillas de chat con soporte para tool calling y entrada de visión opcional. No es un dispositivo médico ni un sistema de decisión clínica, sino una herramienta de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.6-27B (arquitectura no detallada en la documentacion) |
| Parametros totales | 27.054.518.656 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria (3 niveles) con precision hibrida; archivo GGUF de 8,48 GB |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer denso de 27.000 millones de parametros, y aplica una cuantizacion ternaria con precision hibrida que reduce el tamaño de los pesos en 8,2× respecto a la version FP16. Esta tecnica permite mantener un 96,48 % de las capacidades originales (mediana de retencion) mientras se reduce drasticamente el espacio en disco y la memoria necesaria para inferencia. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO; la informacion disponible solo indica que es una cuantizacion del modelo base Qwen3.6-27B.

La innovacion principal reside en la cuantizacion ternaria hibrida, que combina pesos de 3 niveles con precision selectiva en capas criticas para preservar el rendimiento en tareas medicas y de razonamiento. El runtime Mortar, desarrollado por Doses-AI, esta optimizado para este formato y permite ejecucion en dispositivos locales con aceleracion CUDA, Metal o CPU.

## Capacidades

- Generacion de texto conversacional con plantillas de chat compatibles con tool calling (function calling).
- Razonamiento medico: responde preguntas de conocimiento clinico y biomedico (MedQA, MMLU medical subjects, BioASQ).
- Generacion de codigo: alcanza un pass@1 de 89,02 en HumanEval y 83,33 en MBPP+, lo que lo hace util para tareas de programacion general y especifica.
- Razonamiento multi-step: obtiene un 70,50 % en MuSR, indicando capacidad para resolver problemas que requieren varias etapas de deduccion.
- Instruccion y seguimiento de ordenes: 81,70 % en IFEval (prompt-level strict).
- Entrada de vision opcional (segun la model card, aunque no se detallan las capacidades exactas).
- Recuperacion farmaceutica: alcanza un MRR de 90,15 en PharmaRAG, lo que sugiere buen rendimiento en tareas de ranking para sistemas RAG en el dominio farmaceutico.

## Casos de uso

- Asistencia en documentacion clinica: el modelo puede redactar resumenes de historiales, informes de alta o notas de consulta a partir de datos estructurados, gracias a su conocimiento medico y capacidad de generacion de texto fluido.
- Sistemas RAG farmaceuticos: con un MRR de 90,15 en PharmaRAG, es adecuado para construir pipelines de recuperacion de informacion sobre medicamentos, interacciones y posologias, integrable en herramientas de consulta para profesionales.
- Generacion de codigo en entornos de investigacion: su alto rendimiento en HumanEval y MBPP+ permite usarlo como asistente de programacion en pipelines de analisis de datos biologicos o simulaciones.
- Educacion medica continuada: puede generar preguntas de opcion multiple, explicaciones de mecanismos fisiopatologicos o resumenes de articulos cientificos para plataformas de formacion.
- Triaje conversacional en entornos no clinicos: como asistente de informacion general sobre sintomas y recomendaciones de consulta, siempre con la advertencia de que no sustituye a un profesional sanitario.
- Desarrollo de agentes con tool calling: su soporte nativo para function calling permite construir agentes que consulten bases de datos medicas, APIs de farmacovigilancia o calendarios de citas de forma autonoma.

## Benchmarks y rendimiento

Los siguientes resultados estan declarados por el autor en la model card (no verificados de forma independiente) y se obtuvieron con thinking desactivado, decodificacion greedy (temperatura 0, top_p 1, top_k 0) y semilla fija 20260805.

| Benchmark | Pestle-27B-Ternary |
|---|---|
| MedQA (accuracy) | 89,79 |
| HumanEval (pass@1) | 89,02 |
| MMLU medical subjects (mean accuracy) | 86,89 |
| MMLU-Redux 2.0 (mean accuracy) | 83,53 |
| BioASQ (token F1) | 75,28 |
| PharmaRAG (MRR) | 90,15 |
| HumanEval+ (pass@1) | 87,20 |
| MBPP+ (pass@1) | 83,33 |
| GSM8K (accuracy) | 93,25 |
| MuSR (accuracy) | 70,50 |
| IFEval (prompt-level strict) | 81,70 |

El autor indica que Pestle supera a MedGemma-27B FP16 en la mayoria de benchmarks medicos de texto reportados, aunque no se incluyen los valores completos de comparacion en la informacion proporcionada.

## Requisitos de hardware

- El archivo GGUF pesa 8,48 GB, por lo que cabe en GPUs consumer con 12 GB de VRAM o mas (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4080) dejando margen para el contexto y el runtime.
- En Apple Silicon, se puede ejecutar con Metal; tambien hay soporte para CPU como respaldo.
- El runtime recomendado es Mortar (https://github.com/DosesAI/mortar.cpp), optimizado para este formato ternario. Tambien es probable que sea compatible con llama.cpp, aunque no se confirma explicitamente.
- Para inferencia en servidor, una GPU con 16-24 GB de VRAM (A100, L4, RTX 4090) permitiria ejecutar el modelo con contexto largo y multiples peticiones concurrentes.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Rendimiento medico (MedQA) |
|---|---|---|---|---|---|
| Pestle-27B-Ternary | 27B | GGUF ternario | Apache-2.0 | No disponible | 89,79 |
| Qwen3.6-27B FP16 (base) | 27B | FP16 | Apache-2.0 | No disponible | No reportado en la fuente |
| MedGemma-27B FP16 | 27B | FP16 | Gemini (no comercial) | No disponible | Inferior a Pestle segun el autor |
| Bonsai-27B Ternary | 27B | GGUF ternario | No especificada | No disponible | No reportado en la fuente |

La comparativa se basa unicamente en los datos declarados por el autor de Pestle; no se dispone de valores numericos independientes para los modelos alternativos. Pestle destaca por su licencia permisiva y su tamaño reducido frente a las versiones FP16.

## Limitaciones y advertencias

- Es una vista previa de investigacion: no es un dispositivo medico ni un sistema de decision clinica, y no debe usarse para diagnosticar o tratar pacientes.
- Los benchmarks declarados no estan verificados de forma independiente (campo "verified: false" en el model-index).
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- La cuantizacion ternaria, aunque retiene el 96,48 % de las capacidades, puede introducir errores en tareas de alta precision, especialmente en razonamiento numerico o logico complejo.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado sobre datos de Qwen3.6-27B, puede heredar sesgos del corpus original.
- Riesgo de alucinacion en contextos medicos: las respuestas pueden sonar plausibles pero ser incorrectas, lo que es especialmente peligroso en un dominio critico.
- La longitud de contexto no esta especificada, lo que dificulta planificar despliegues con ventanas largas.
- No se proporcionan datos sobre el proceso de entrenamiento (tokens, dataset, tecnicas de alineacion), lo que limita la evaluacion de su robustez.

## Enlaces

- HuggingFace: https://huggingface.co/Doses-AI/Pestle-27B-Ternary-GGUF
- Whitepaper tecnico: https://doses.ai/pestle-27b-ternary-technical-report/
- Repositorio Mortar: https://github.com/DosesAI/mortar.cpp
