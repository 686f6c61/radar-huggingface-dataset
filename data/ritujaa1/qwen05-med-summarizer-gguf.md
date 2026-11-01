# ritujaa1/qwen05-med-summarizer-gguf

## Resumen

El modelo `ritujaa1/qwen05-med-summarizer-gguf` es un ajuste fino (LoRA) del modelo base Qwen2.5-0.5B de Alibaba, orientado a la generacion de resumenes estructurados de notas clinicas. Lo publica el usuario `ritujaa1` como parte de un proyecto educativo que incluye un hermano mayor basado en Llama 2 de 7B, entrenado sobre el mismo corpus. El objetivo es producir resumenes con secciones fijas (DIAGNOSIS, KEY FINDINGS, MEDICATIONS, ACTION ITEMS, FOLLOW-UP) a partir de notas medicas sinteticas.

Con 494 millones de parametros y un peso en formato GGUF Q4_K_M de aproximadamente 379 MB, el modelo esta pensado para desplegarse en entornos con recursos muy limitados, incluidos niveles gratuitos de hosting. La licencia Apache 2.0 y el formato GGUF lo hacen directamente utilizable con llama.cpp y herramientas compatibles.

Su relevancia es acotada: no es un modelo clinico de produccion ni se ha entrenado con datos reales de pacientes, sino una demostracion de que un modelo de menos de 500 millones de parametros puede generar resumenes medicos estructurados con una fidelidad numerica alta en un conjunto de evaluacion pequeno. Es un caso de uso de destilacion de tareas muy especificas sobre modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de la familia Qwen2.5 con atencion causal estandar, y se ha ajustado mediante LoRA sobre aproximadamente 500 notas clinicas sinteticas. El objetivo de entrenamiento es la generacion de resumenes con estructura fija en cinco secciones: DIAGNOSIS, KEY FINDINGS, MEDICATIONS, ACTION ITEMS y FOLLOW-UP.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el rango del adaptador LoRA, la tasa de aprendizaje ni el numero de epocas. El autor indica que los pesos publicados son la version GGUF Q4_K_M del modelo ajustado, es decir, el adaptador ya fusionado con el modelo base y cuantizado.

## Capacidades

- Generacion de resumenes estructurados de notas clinicas sinteticas en cinco secciones predefinidas.
- Fidelidad numerica alta en el conjunto de evaluacion del autor (1.00 en number fidelity sobre 25 notas).
- Adherencia a estructura alta (0.88 en la metrica de estructura del autor).
- Inferencia local via llama.cpp y compatible con endpoints tipo OpenAI (tag `endpoints_compatible`).
- Formato conversacional (tag `conversational`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el entrenamiento se realizo sobre notas en ingles segun el ejemplo de secciones.

## Casos de uso

- Prototipado de resumenes clinicos en entornos de desarrollo: sirve para validar pipelines de extraccion de secciones (diagnostico, hallazgos, medicacion, acciones, seguimiento) antes de invertir en modelos mayores, gracias a su tamano de 379 MB y su despliegue trivial con llama.cpp.
- Demostraciones y docencia sobre ajuste fino con LoRA: el modelo es un ejemplo reproducible de como adaptar un modelo de 0.5B a una tarea de dominio con pocos cientos de ejemplos sinteticos.
- Pruebas de integracion en aplicaciones de bajo consumo: al caber en cualquier portatil o incluso en dispositivos con poca memoria, permite iterar sobre la interfaz de usuario de un asistente de resumenes sin coste de GPU.
- Evaluacion comparativa de estrategias de cuantizacion: al existir un hermano mayor de 7B con el mismo corpus, se puede medir la perdida de calidad al reducir el tamano del modelo y aplicar Q4_K_M.
- Generacion de datos sinteticos de prueba: util para crear notas y resumenes de ejemplo en entornos de test donde no se pueden usar datos reales de pacientes.
- Filtrado o preprocesado en cascada: como primer paso barato para detectar y estructurar notas antes de pasarlas a un modelo mayor, reduciendo el coste total de inferencia en un pipeline.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 25 notas de validacion, comparando con el modelo hermano de 7B (llama2-med-summarizer-gguf):

| Metrica | Qwen2.5-0.5B (este modelo) | Llama 2 7B (hermano) |
|---|---|---|
| Estructura | 0.88 | 1.00 |
| Fidelidad numerica | 1.00 | 0.97 |
| ROUGE-1 | 0.845 | 0.944 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores son definidas por el autor y no son directamente comparables con las de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.4-0.6 GB con Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 en adelante) e incluso en Raspberry Pi y moviles de gama alta con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), servidores compatibles con la API de OpenAI (tag `endpoints_compatible`), y cualquier runtime que soporte GGUF Q4_K_M.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ritujaa1/qwen05-med-summarizer-gguf | 494 M | no disponible | Apache 2.0 | GGUF | Especializado en resumenes clinicos sinteticos |
| ritujaa1/llama2-med-summarizer-gguf | 7 B (aprox.) | no disponible | no disponible en la informacion | GGUF | Mismo corpus, mayor calidad (ROUGE-1 0.944) |
| Qwen/Qwen2.5-0.5B (base) | 494 M | 32 K (segun documentacion publica de Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo generalista sin ajuste clinico |

La comparativa con modelos medicos especializados de mayor tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos; el autor advierte explicitamente que no debe usarse con datos reales de pacientes ni en contexto clinico.
- Proyecto educativo sin validacion clinica ni revision por expertos.
- El conjunto de evaluacion es muy pequeno (25 notas), por lo que las metricas tienen alta varianza y no son concluyentes.
- Riesgo de alucinacion en dosis, nombres de farmacos o valores analiticos fuera del dominio de entrenamiento; la fidelidad numerica reportada no garantiza correccion en casos no vistos.
- No se documentan idiomas soportados; el entrenamiento parece orientado a ingles.
- Contexto maximo no confirmado en la model card; conviene asumir el del modelo base y verificar empiricamente.
- El autor recomienda `repeat_penalty` en torno a 1.15; sin este ajuste la calidad de generacion puede degradarse.
- Solo se publica una cuantizacion (Q4_K_M); no hay versiones en FP16 ni otras precisiones para comparar.
- Licencia Apache 2.0 permite uso comercial, pero ello no exime de las responsabilidades regulatorias en ambito sanitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ritujaa1/qwen05-med-summarizer-gguf
- Modelo hermano de 7B: https://huggingface.co/ritujaa1/llama2-med-summarizer-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
