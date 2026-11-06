# mhseo2/sft_mmopd4b_qwen3moe30b_deepmath_n57012_ep15-step0

## Resumen

Este repositorio contiene un checkpoint de ajuste fino supervisado (SFT) derivado de Qwen3-4B-Base, entrenado por el usuario mhseo2 sobre el conjunto completo OpenThoughts3-1.2M, un corpus de trazas de razonamiento de cadena larga en matematicas, codigo y ciencia. El modelo resultante es un "thinking model": cada respuesta comienza con un bloque `<think>` antes del contenido final, siguiendo la plantilla de chat de Qwen3. Se trata de una recreacion abierta de la receta OpenThinker3 a escala 4B.

El modelo es un transformer denso de 4.022.468.096 parametros (aproximadamente 4B), con licencia Apache-2.0 y pesos en formato safetensors. Segun la model card, este checkpoint corresponde a la epoca 2 (paso 4.390) del entrenamiento; existe un checkpoint de 1 epoca en `MMOPD/Qwen3-4B-OT3-1ep`. El modelo forma parte de la familia MMOPD (multi-teacher on-policy distillation), que lo emplea como punto de partida para profesores de dominio y experimentos de destilacion on-policy.

Es relevante ahora porque ofrece, con licencia permisiva y a escala 4B, un modelo de razonamiento abierto con resultados medibles en benchmarks de matematicas, codigo e instrucciones, y sirve como base reproducible para investigacion en destilacion multi-profesor. El identificador del repositorio menciona "qwen3moe30b", pero los pesos reales corresponden a Qwen3-4B-Base, no a un modelo MoE de 30B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de vLLM usa `--max-model-len 40960` y el entrenamiento usa secuencias de 16.384 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B-Base, un transformer denso de aproximadamente 4B parametros. El ajuste fino se realizo sobre las 1,2 millones de filas completas de OpenThoughts3-1.2M, usando la plantilla de chat de Qwen3 con modo thinking. El entrenamiento empleo longitud de secuencia de 16.384 tokens con sequence packing (aplanado, sin atencion cruzada entre ejemplos), 2 epocas y un total de 4.390 pasos de optimizador (2.195 por epoca). El optimizador fue AdamW con LR pico de 8e-5, 5% de warmup y batch global de 512 secuencias empaquetadas (aproximadamente 8,1 millones de tokens por paso). El computo se hizo en bf16 con ZeRO-2 (transformers 4.57, trl 0.29, DeepSpeed) sobre A100-80GB, con una perdida final de entrenamiento de 0,868.

No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.) ni detalles sobre RLHF o DPO; se trata de SFT puro sobre trazas de razonamiento. La innovacion principal es metodologica: la recreacion abierta de la receta OpenThinker3 a escala 4B y su uso como estudiante base en el proyecto MMOPD de destilacion on-policy multi-profesor.

## Capacidades

- Generacion de texto con razonamiento explicito: cada respuesta se inicia con un bloque `<think> ... </think>` antes de la respuesta final.
- Razonamiento matematico de competicion (AIME) y resolucion de problemas de varios pasos.
- Generacion de codigo, evaluada con LiveCodeBench v6.
- Seguimiento de instrucciones (IFEval, IFBench).
- Razonamiento de dominio en medicina (MedQA, MedXpertQA, PubMedQA), derecho (CaseHOLD) y finanzas (FinQA, TAT-QA), segun los benchmarks de la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el formato de razonamiento encadenado es compatible con flujos multi-paso.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Resolucion de problemas matematicos de competicion: el modelo esta entrenado sobre trazas de cadena larga y obtiene 66,3 en AIME24 y 56,3 en AIME25; se usaria con muestreo (temperatura 0,6, top-p 0,95, top-k 20) y un presupuesto de generacion amplio para tareas tipo olimpiada.
- Generacion de codigo asistida: con 51,7 en LiveCodeBench v6, es adecuado para completar funciones, explicar codigo y resolver problemas algoritmicos en pipelines de desarrollo, siempre con revision humana.
- Investigacion en destilacion on-policy: sirve como estudiante base para los profesores de dominio de MMOPD (medico, legal, financiero, instrucciones), lo que permite reproducir experimentos de destilacion multi-profesor a escala 4B.
- Preguntas y respuestas biomedicas: con 69,8 en MedQA y 75,2 en PubMedQA, puede emplearse como asistente de apoyo a la lectura de literatura cientifica, con supervision experta obligatoria.
- Analisis de documentos financieros: con 58,3 en FinQA y 24,4 en TAT-QA (EM), puede extraer y razonar sobre cifras en informes, aunque el rendimiento en TAT-QA es bajo y requiere validacion.
- Analisis de jurisprudencia y resoluciones: con 63,2 en CaseHOLD, puede clasificar y razonar sobre textos legales en tareas de recuperacion de precedentes, como apoyo a revision humana.
- Evaluacion comparativa de recetas de SFT: al publicarse checkpoints de 1 y 2 epocas, permite medir el efecto de mas epocas sobre el razonamiento (por ejemplo, AIME24 pasa de 60,4 a 66,3).

## Benchmarks y rendimiento

Benchmarks generales (preset thinking de Qwen3: temperatura 0,6, top-p 0,95, top-k 20; 32.768 tokens nuevos maximos; AIME = avg@8, LiveCodeBench v6 / IFEval / IFBench = 1 muestra; porcentajes):

| Modelo | AIME24 | AIME25 | AIME26 | LiveCodeBench v6 | IFEval | IFBench |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-2ep (este) | 66,3 | 56,3 | 58,3 | 51,7 | 51,0 | 27,7 |
| Qwen3-4B-OT3-1ep | 60,4 | 51,3 | 55,4 | 47,1 | 46,8 | 27,0 |

Benchmarks de dominio (temperatura 1,0, top-p 1,0, presupuesto de generacion largo; precision en %):

| Modelo | MedQA | MedXpertQA | PubMedQA | CaseHOLD | FinQA | TAT-QA (EM) |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-2ep (este) | 69,8 | 13,7 | 75,2 | 63,2 | 58,3 | 24,4 |

No se proporcionan resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4.022 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 10-12 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB de pesos; en 4 bits: aproximadamente 2,5-3 GB. No se documentan cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100-80GB para el entrenamiento (documentado); para inferencia, GPU con al menos 12-16 GB de VRAM en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4090) en bf16 o cuantizado.
- Opciones de despliegue: transformers (ejemplo oficial en la model card) y vLLM (`vllm serve MMOPD/Qwen3-4B-OT3-2ep --max-model-len 40960`). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-OT3-2ep (este) | ~4,0B | no disponible (ejemplo vLLM: 40.960) | Apache-2.0 | Hugging Face | AIME24 66,3; LiveCodeBench v6 51,7 |
| Qwen3-4B-OT3-1ep | ~4,0B | no disponible | Apache-2.0 | Hugging Face | AIME24 60,4; LiveCodeBench v6 47,1 |
| Qwen3-4B-Base | ~4,0B | no disponible | Apache-2.0 | Hugging Face | Modelo base sin ajuste de razonamiento |

No se dispone de datos de benchmarks de Qwen3-4B-Base en la informacion proporcionada, por lo que no se puede cuantificar la mejora frente al base. No se han facilitado comparaciones con otros modelos de razonamiento de tamano similar.

## Limitaciones y advertencias

- El identificador del repositorio menciona "qwen3moe30b", pero los pesos reales (4.022.468.096 parametros) corresponden a Qwen3-4B-Base; no es un modelo MoE de 30B. Conviene verificar siempre el numero de parametros de los safetensors.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en dominios especializados (MedXpertQA 13,7 y TAT-QA 24,4 son resultados bajos).
- El bloque `<think>` consume tokens de generacion; con presupuestos cortos la calidad puede degradarse. La model card recomienda muestreo (no greedy) y hasta 32.768 tokens nuevos.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento (OpenThoughts3-1.2M) y del modelo base Qwen3.
- No se documentan sesgos especificos, ni evaluaciones de seguridad, ni soporte de tool calling; para produccion en dominios regulados se requiere validacion adicional.
- El checkpoint es un artefacto de investigacion (parte de MMOPD) y no se presenta como modelo listo para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/sft_mmopd4b_qwen3moe30b_deepmath_n57012_ep15-step0
- Checkpoint de 1 epoca: https://huggingface.co/MMOPD/Qwen3-4B-OT3-1ep
- Checkpoint de 2 epocas: https://huggingface.co/MMOPD/Qwen3-4B-OT3-2ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
