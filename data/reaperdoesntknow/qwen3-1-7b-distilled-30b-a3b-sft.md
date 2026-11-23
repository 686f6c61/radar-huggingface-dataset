# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT

## Resumen

Qwen3-1.7B-Distilled-30B-A3B-SFT es un modelo de lenguaje de 2.031.739.904 parámetros (aproximadamente 2B, pese al "1.7B" del nombre) publicado por el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC. Se construye en dos etapas sobre Qwen3-1.7B: primero una destilación de conocimiento desde el profesor MoE Qwen3-30B-A3B-Instruct-2507 sobre 6.122 muestras STEM con cadena de pensamiento, y después un ajuste supervisado (SFT) sobre el dataset legal Alignment-Lab-AI/Lawyer-Instruct. El objetivo declarado es enseñar primero *cómo razonar* y luego *sobre qué razonar*.

El modelo es relevante por su enfoque metodológico: utiliza una función de pérdida híbrida con cross-entropy ponderada por región de prueba (55%) y divergencia KL frente al profesor a temperatura 2.0 (45%), lo que penaliza más los errores en la derivación intermedia que en la respuesta final. Es un experimento de destilación de un MoE de 30B (≈3B activos) a un modelo denso desplegable en hardware de borde, sin coste de enrutamiento.

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face. No hay información publicada sobre benchmarks, licencia de los datos de SFT ni evaluación independiente, lo que limita las conclusiones sobre su calidad real en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B); destilado de un profesor MoE Qwen3-30B-A3B-Instruct-2507 |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, sin enrutamiento) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso, y se entrena en dos fases secuenciales. La primera fase destila desde Qwen3-30B-A3B-Instruct-2507 (MoE con 30B totales y ~3B activos por token) sobre 6.122 muestras STEM con estructura (pregunta, derivación CoT, respuesta final) procedentes de 12 datasets de 0xZee: física (2.254), álgebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), matemáticas (576), ingeniería (574), mecánica clásica (343), mecánica teórica (307), cálculo avanzado (268), física moderna (177), fisiología (114) y biología molecular (71). El split es 95/5 (5.815 train / 307 eval), semilla 42, una época, AdamW con weight decay 0.01, LR 1.5e-5 → 1e-6 con coseno y 30 pasos de warmup, batch efectivo 8, gradient clipping 1.0 y precisión bf16.

La innovación técnica principal es la función de pérdida: `L = 0.55 * CE_weighted + 0.45 * KD_kl`. La cross-entropy pondera los tokens de la región `Proof:` a `Final Answer:` con un factor que decae linealmente de 2,5x a 1,5x para evitar que el modelo memorice plantillas de derivación. La KL se calcula frente al profesor a temperatura 2.0 (escalada por T²), de modo que el estudiante ve el paisaje de probabilidad completo y no solo el top-1. La segunda fase aplica SFT con TRL SFTTrainer sobre Alignment-Lab-AI/Lawyer-Instruct (una época, batch efectivo 8 con 2 × 4 de acumulación), con formato `### Instruction:` / `### Response:`. No se documentan datos de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento estructurado paso a paso, con formato explícito de derivación (`Problem` / `Proof` / `Final Answer`).
- Razonamiento matemático y científico en dominios STEM: física, álgebra lineal, ecuaciones diferenciales, electromagnetismo, mecánica, cálculo e ingeniería.
- Razonamiento legal y análisis de casos, interpretación estatutaria y argumentación estructurada, adquiridos en la fase de SFT.
- Seguimiento de instrucciones en formato instruction/response.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Tutoría STEM automatizada: el modelo genera derivaciones paso a paso en física, cálculo o álgebra lineal, lo que permite usarlo como asistente de resolución de problemas con explicación del procedimiento y no solo de la respuesta.
- Generación de explicaciones didácticas de matemáticas: su entrenamiento con pérdida ponderada en la región de prueba favorece cadenas de razonamiento explícitas, útiles para materiales educativos o generación de solucionarios.
- Asistencia en análisis legal preliminar: la fase de SFT sobre Lawyer-Instruct lo hace adecuado para borradores de argumentación, resúmenes de conceptos legales e interpretación de cláusulas, siempre con revisión humana.
- Prototipado en dispositivos de borde: con ~2B parámetros y pesos safetensors de 4,1 GB, es viable en GPUs de consumo para experimentación y demos locales.
- Clasificación y extracción de reasoning en pipelines de datos: puede generar cadenas de pensamiento etiquetadas para construir datasets de destilación o evaluación de razonamiento.
- Investigación en destilación: sirve como caso de estudio reproducible de destilación MoE→denso con pérdida híbrida CE+KL y transferencia de dominio STEM a legal.
- Filtrado y verificación de soluciones: puede comparar derivaciones candidatas y señalar errores en pasos intermedios en problemas de física o matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: ~4,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica 6–8 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~2,1 GB de pesos; en 4 bits: ~1,1 GB, más overhead.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPUs de consumo: sí, en modelos con 8 GB o más de VRAM en bf16/fp16, y en GPUs de 4–6 GB con cuantización.
- Opciones de despliegue: transformers, vLLM, TGI, llama.cpp y Ollama (requiere conversión a GGUF, no incluida en el repo); TRL para fine-tuning.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B-SFT | 2,03B | No disponible | Apache 2.0 | Destilación STEM + SFT legal |
| Qwen3-1.7B (base) | 1,7B | No disponible | Apache 2.0 | Modelo generalista base |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B totales / ~3B activos | No disponible | Apache 2.0 | MoE generalista de referencia |
| Qwen3-1.7B-STEM-Proof-Distilled (etapa 1) | 1,7B | No disponible | Apache 2.0 | Solo destilación STEM, sin SFT legal |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su uso en castellano no está validado y probablemente degrade la calidad.
- No se han publicado benchmarks ni evaluación independiente: el rendimiento real en STEM o legal es desconocido.
- La destilación se hizo sobre solo 6.122 muestras, un volumen reducido que puede provocar sobreajuste a los formatos y estilos de esos datasets.
- El SFT legal usa Lawyer-Instruct, cuya calidad y licencia de uso comercial no se detallan en la model card; conviene verificar antes de uso en producción.
- Riesgo de alucinación en dominios especializados (legal, medicina, física avanzada) sin verificación humana.
- El nombre "1.7B" no coincide con los 2,03B reales de safetensors, lo que puede confundir en estimaciones de memoria.
- No se documentan sesgos específicos, pero al entrenarse solo en inglés y en datasets concretos, es probable que herede sesgos de esas fuentes.
- La licencia Apache 2.0 permite uso comercial, pero no cubre los datos de entrenamiento ni posibles reclamaciones derivadas de ellos.
- No se documenta tool calling ni capacidades de agente, por lo que no es adecuado para pipelines que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Modelo base (etapa previa): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Salida de la etapa 1: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-STEM-Proof-Distilled
- Profesor MoE: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de SFT legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Perfil del autor de datasets STEM: https://huggingface.co/0xZee
- Documentación de TRL SFTTrainer: https://huggingface.co/docs/trl/en/sft_trainer
