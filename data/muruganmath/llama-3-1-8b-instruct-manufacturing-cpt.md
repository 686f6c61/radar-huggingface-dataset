# muruganmath/Llama-3.1-8B-Instruct-Manufacturing-CPT

## Resumen

Llama-3.1-8B-Instruct-Manufacturing-CPT es un ajuste fino supervisado (SFT) del modelo meta-llama/Llama-3.1-8B-Instruct, desarrollado por el usuario muruganmath, orientado a asistencia en mantenimiento industrial. El objetivo declarado es convertirse en un asistente de planta para ingenieros y tecnicos que trabajan con motores y variadores, rodamientos, cajas de engranajes, bombas, compresores, transportadores, maquinas CNC, sistemas hidraulicos y neumaticos, climatizacion, robots, sensores y PLCs. El modelo se publica como version v1 y como linea base para comparar iteraciones posteriores.

Tecnicamente se trata de un QLoRA sobre la base Instruct, con cuantizacion 4-bit NF4 y adaptadores LoRA fusionados a bf16. El resultado es un checkpoint denso de 8.030.261.248 parametros con la misma arquitectura transformer del modelo original. La ventana de contexto usada durante el entrenamiento fue de 2.048 tokens, aunque el modelo base soporta hasta 128k tokens; el autor no garantiza el comportamiento del ajuste fino mas alla de ese rango.

La relevancia del modelo es acotada: se trata de un ajuste fino de nicho, con cero descargas y cero likes en el momento de la consulta, publicado bajo la licencia Llama 3.1 Community. Su interes principal es como referencia metodologica para adaptar modelos pequenos a dominios industriales con datos limitados (10.531 ejemplos tras filtrado) y como base para evaluaciones de razonamiento sobre modos de fallo y sensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens usados en entrenamiento; el modelo base soporta 128k |
| Tipos de cuantizacion | bf16 safetensors; GGUF f16 y Q4_K_M generados con llama.cpp; base entrenada en 4-bit NF4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License (llama3.1) |
| Formato de pesos | safetensors (bf16), GGUF (f16 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.1-8B-Instruct (revision 0e9e39f249a16976918f6564b8830bc894c89659), un transformer decoder-only denso de 8B parametros. El ajuste se realizo con QLoRA: cuantizacion 4-bit NF4 con doble cuantizacion y computo en bf16 mediante bitsandbytes, con adaptadores LoRA de rango 16, alpha 32, dropout 0.05, sin bias y aplicados a las proyecciones q, k, v, o, gate, up y down. Se entrenaron 2 epocas (170 pasos de optimizacion) y los adaptadores se fusionaron al modelo base en bf16.

El conjunto de entrenamiento contiene 10.531 ejemplos tras filtrado, deduplicacion, topes por fuente y sobremuestreo, con split 90/5/5 por fuente y semilla 42. Cada ejemplo es de un solo turno (prompt y completion) y la perdida se calcula solo sobre la completion. Las fuentes son: MaintNorm (3.600 filas, normalizacion de ordenes de trabajo), mandarchaudharii/maintenance_gpt_added (3.200 filas, pares problema-solucion tras descartar filas sinteticas), dpanchali/predictive_maintenance_dataset (1.800 filas, triaje de lecturas de sensores contra percentiles de flota), HuggingFaceH4/ultrachat_200k (1.800 filas, primer turno usuario-asistente para preservar capacidad general), Oussama18/Instruction (108 filas, 36 pares Q&A sobremuestreados x3) y Jaya1995/Maintenance (23 filas, checklists de mantenimiento preventivo). Los ejemplos de mantenimiento llevan un system prompt especifico que el autor indica usar de forma literal. Los conjuntos ibm-research/FailureSensorIQ y AI4Manufacturing/FQ-D09 se mantuvieron fuera del entrenamiento y se verifico que no hubiera solapamiento.

## Capacidades

- Generacion de texto conversacional en ingles con estilo de asistente tecnico de mantenimiento.
- Razonamiento sobre equipos industriales: motores y variadores, rodamientos, cajas de engranajes, bombas, compresores, transportadores, CNC, hidraulica y neumatica, climatizacion, robots, sensores y PLCs.
- Normalizacion de texto de ordenes de mantenimiento ruidosas.
- Triaje de lecturas de sensores de motor frente a percentiles de flota (basado en plantillas del dataset de entrenamiento).
- Respuesta a preguntas sobre procedimientos de reparacion y checklists de mantenimiento preventivo.
- Habito entrenado de mencionar bloqueo y etiquetado (lockout/tagout) antes de trabajos manuales y de indicar que medir o comprobar cuando falta informacion.
- Soporte de plantilla de chat de Llama 3.1 (apply_chat_template) con mensajes de sistema, usuario y asistente.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Asistencia a tecnicos de planta en diagnostico inicial: el modelo responde a preguntas como la caida de presion de descarga de una bomba centrifuga sugiriendo comprobaciones concretas, gracias al entrenamiento sobre pares problema-solucion y triaje de sensores.
- Normalizacion de ordenes de trabajo: convertir texto libre y ruidoso de partes de mantenimiento en descripciones estructuradas, aprovechando las 3.600 filas de MaintNorm incluidas en el entrenamiento.
- Soporte a checklists de mantenimiento preventivo: generar o completar listas de comprobacion para equipos concretos, a partir de las 23 filas de Jaya1995/Maintenance y del conocimiento general del modelo base.
- Formacion interna y documentacion tecnica: redactar explicaciones de procedimientos de reparacion en ingles para manuales o wikis internas, con la advertencia de seguridad integrada en el system prompt.
- Triaje preliminar de lecturas de sensores: interpretar valores de sensores de motor frente a rangos de flota y proponer siguientes pasos de inspeccion, como se entreno con dpanchali/predictive_maintenance_dataset.
- Linea base de investigacion: servir como referencia para comparar futuras versiones o metodos de adaptacion de dominio en mantenimiento industrial, dado que el autor lo publica explicitamente con ese proposito.
- Despliegue ligero en entornos con recursos limitados: la version GGUF Q4_K_M (unos 4,9 GB) permite ejecutarlo con llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada de gran capacidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Tarea | Dataset | Metrica | Valor |
|---|---|---|---|---|
| Llama-3.1-8B-mfg (v1) | Razonamiento sobre modos de fallo y sensores (multiple-choice) | ibm-research/FailureSensorIQ | Accuracy (todos los activos) | 51,82 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 20-24 GB.
- VRAM estimada en GGUF Q4_K_M (unos 4,9 GB de pesos): viable en GPUs consumer con 8 GB o mas, con contexto moderado.
- GPUs recomendadas: A100 40/80 GB, H100 o L40S para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090, RTX 4070 Ti o superiores para Q4_K_M.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantizacion Q4_K_M.
- Opciones de despliegue: transformers (con device_map="auto"), llama.cpp y Ollama con GGUF; el repo incluye la etiqueta text-generation-inference y endpoints_compatible, por lo que es compatible con TGI y endpoints de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-Manufacturing-CPT | 8,03B | 2.048 en entrenamiento (128k en base) | Ajuste fino QLoRA para mantenimiento industrial | Llama 3.1 Community | Hugging Face (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Modelo generalista de referencia | Llama 3.1 Community | Hugging Face (ampliamente usado) |
| Llama-3.1-8B-mfg (v1) | 8,03B | 2.048 en entrenamiento | Nombre interno del mismo modelo segun model-index | Llama 3.1 Community | Mismo repositorio |

No se dispone de datos de benchmarks comparativos con otros ajustes finos de dominio industrial en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente fuera de alcance cualquier uso en el que una respuesta pueda afectar a la seguridad del personal o del equipo: procedimientos de bloqueo y etiquetado, decisiones de aprobado/fallo en pruebas electricas y decisiones de marcha o parada de equipos.
- La salida no sustituye la documentacion del fabricante, los procedimientos del sitio ni el criterio de una persona cualificada.
- El modelo solo esta entrenado en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- La ventana de contexto usada en entrenamiento es de 2.048 tokens; el comportamiento con contextos mas largos del modelo base no esta validado.
- Riesgo de alucinacion en procedimientos tecnicos y valores de referencia, especialmente fuera de los dominios cubiertos por los datos de entrenamiento.
- Algunos datasets de origen no declaran licencia en el Hub; el autor advierte de comprobar los terminos de cada fuente antes de un uso comercial.
- El rendimiento medido en FailureSensorIQ (51,82% de accuracy) es moderado y declarado por el autor, sin verificacion independiente.
- Modelo con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion externa.
- La licencia Llama 3.1 Community impone restricciones de uso comercial y de redistribucion que deben revisarse antes del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muruganmath/Llama-3.1-8B-Instruct-Manufacturing-CPT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Dataset MaintNorm (codigo): https://github.com/nlp-tlp/maintnorm
- Dataset mandarchaudharii/maintenance_gpt_added: https://huggingface.co/datasets/mandarchaudharii/maintenance_gpt_added
- Dataset dpanchali/predictive_maintenance_dataset: https://huggingface.co/datasets/dpanchali/predictive_maintenance_dataset
- Dataset Oussama18/Instruction: https://huggingface.co/datasets/Oussama18/Instruction
- Dataset Jaya1995/Maintenance: https://huggingface.co/datasets/Jaya1995/Maintenance
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de evaluacion ibm-research/FailureSensorIQ: https://huggingface.co/datasets/ibm-research/FailureSensorIQ
- Paper Llama 3 (arXiv:2407.21783): https://arxiv.org/abs/2407.21783
- Paper QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
