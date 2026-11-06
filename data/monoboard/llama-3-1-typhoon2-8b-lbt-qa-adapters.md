# monoboard/Llama-3.1-Typhoon2-8B-LBT-QA-adapters

## Resumen

`monoboard/Llama-3.1-Typhoon2-8B-LBT-QA-adapters` es una coleccion de 55 adaptadores QLoRA entrenados sobre el modelo base `scb10x/llama3.1-typhoon2-8b-instruct` (Typhoon2 8B Instruct, de SCB 10X), un transformer decoder-only de 8 mil millones de parametros derivado de Meta Llama 3.1 y especializado en tailandes. El repositorio no contiene pesos completos, sino los adaptadores resultantes de un estudio sistematico de ajuste fino para una tarea muy concreta: respuesta a preguntas con citas verificables (citation-grounded QA) sobre el impuesto tailandes sobre tierras y edificios (Land and Building Tax, LBT).

El valor del repositorio es metodologico y reproducible: cada carpeta corresponde a una ejecucion del paper con una combinacion distinta de curriculum de entrenamiento (C1 a C4), rango LoRA (16, 32, 64, 128), semilla (1, 2, 3, 4, 5, 42, 1234, 3407) y presupuesto de epocas (2 o 3). Esto permite analizar la varianza entre semillas, el efecto del rango y el impacto de distintas estrategias de curriculum en una tarea de dominio legal con requisitos estrictos de fundamentacion documental.

Es relevante ahora porque ejemplifica un patron creciente en IA open source: adaptadores pequenos y especializados sobre modelos base multilingues, orientados a dominios regulados donde la trazabilidad de la respuesta importa tanto como su correccion. El uso declarado es exclusivamente de investigacion; no constituye asesoramiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptadores LoRA/QLoRA sobre atencion y proyecciones |
| Parametros totales | 8B en el modelo base; los adaptadores anaden entre 0,17 GB y 1,34 GB segun rango |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1, no confirmada en la model card) |
| Tipos de cuantizacion | Entrenamiento QLoRA (cuantizacion del base durante el ajuste); no se listan formatos de inferencia cuantizados |
| Idiomas soportados | Tailandes (th); el modelo base soporta multilingue pero el ajuste es solo en th |
| Licencia | Llama 3.1 Community License (con Acceptable Use Policy; ver NOTICE) |
| Formato de pesos | safetensors (adaptadores PEFT: `adapter_model.safetensors` + `adapter_config.json`) |
| Rango LoRA | 16, 32, 64, 128 (alpha = rank) |
| Semillas | 1, 2, 3, 4, 5, 42, 1234, 3407 |
| Learning rate | 2e-4 (por defecto) |
| Epocas | 2 o 3 segun ejecucion |

## Arquitectura y entrenamiento

El modelo base es Typhoon2 8B Instruct, un transformer decoder-only de 8B parametros construido sobre la arquitectura Llama 3.1 y ajustado por SCB 10X para tailandes. Sobre el se aplican adaptadores LoRA de bajo rango mediante PEFT, entrenados con QLoRA (cuantizacion del modelo base durante el ajuste para reducir requisitos de memoria). Los adaptadores modifican las proyecciones de atencion y las capas lineales del transformer, sin alterar el resto de los pesos.

El entrenamiento se organiza en cuatro curriculums documentados en el paper asociado: C1 (solo formato Explicito), C2 (RAFT, Retrieval-Augmented Fine-Tuning), C3 (Implicito y luego Explicito) y C4 (Explicito y luego Implicito). El formato Explicito es obligatorio en inferencia, segun indica la model card. Cada ejecucion guarda el checkpoint final y registra en `run_info.json` los ajustes, fases, checkpoints conservados y tiempos. El diseno experimental (55 ejecuciones cruzando curriculum, rango y semilla) esta pensado para medir robustez y sensibilidad a hiperparametros en una tarea de QA legal con citas, no para producir un unico modelo de produccion.

## Capacidades

- Generacion de respuestas a preguntas sobre el impuesto tailandes sobre tierras y edificios, con citas a las fuentes normativas.
- Ajuste especifico para formato Explicito de prompt (obligatorio en inferencia).
- Entrenamiento con curriculums RAFT (C2) orientados a grounding en documentos recuperados.
- Capacidades heredadas del base Typhoon2 8B Instruct: generacion de texto, razonamiento e instrucciones en tailandes.
- Soporte multilingue limitado al del modelo base; el ajuste es exclusivamente en tailandes.
- No se documenta soporte de tool calling, function calling, agentes ni vision en la informacion disponible.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Investigacion sobre citation-grounded QA: usar los 55 adaptadores como banco de experimentos para medir el efecto del rango LoRA y el curriculum en la fidelidad de las citas en dominio legal tailandes.
- Asistencia documental interna en despachos tailandeses: desplegar un adaptador C1 o C4 con prompts en formato Explicito para responder consultas sobre LBT citando articulos concretos, con revision humana obligatoria.
- Construccion de pipelines RAG legales: integrar el adaptador C2 (RAFT) como generador final de un sistema de recuperacion sobre normativa fiscal tailandesa, aprovechando su entrenamiento en grounding sobre pasajes recuperados.
- Analisis de robustez y varianza entre semillas: comparar las ejecuciones con semilla 1, 2, 3, 4, 5, 42, 1234 y 3407 para estimar la estabilidad del ajuste antes de fijar un modelo en produccion.
- Estudio de eficiencia de adaptadores: comparar rangos 16, 32, 64 y 128 (0,17 GB a 1,34 GB) para elegir el compromiso entre calidad y huella de almacenamiento en despliegues con recursos limitados.
- Docencia y formacion en NLP juridico: usar los adaptadores y `run_info.json` como material reproducible para ensenar ajuste fino con QLoRA y evaluacion de QA con citas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper asociado (material suplementario S1 para los prompts) pero no incluye tablas de metricas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B en precision completa requiere aproximadamente 16 GB; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Los adaptadores anaden entre 0,17 GB y 1,34 GB segun rango.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) o A10G (24 GB) suficientes para inferencia del base en 8 o 16 bits con adaptadores.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizacion; en GPUs de 12-16 GB solo con cuantizacion agresiva del base.
- Opciones de despliegue: `transformers` + `peft` (carga indicada en la model card con `PeftModel.from_pretrained` y `subfolder`); vLLM y TGI requieren fusionar el adaptador con el base o usar soporte de adaptadores LoRA; llama.cpp/Ollama requeririan conversion a GGUF tras fusion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-Typhoon2-8B-LBT-QA-adapters (este) | 8B + adaptadores | no disponible | QA legal tailandes con citas | Llama 3.1 Community | Hugging Face (adaptadores) |
| scb10x/llama3.1-typhoon2-8b-instruct (base) | 8B | no disponible | Instrucciones en tailandes | Llama 3.1 Community | Hugging Face |
| Meta Llama 3.1 8B Instruct | 8B | 128K (segun documentacion de Meta) | Instrucciones generales multilingue | Llama 3.1 Community | Hugging Face |
| Adaptadores legales especializados comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso declarado exclusivamente de investigacion; no constituye asesoramiento legal y no debe usarse como tal en produccion sin revision experta.
- El ajuste es solo en tailandes y sobre un dominio muy estrecho (impuesto sobre tierras y edificios); el rendimiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion en citas normativas: aunque el entrenamiento busca grounding, no hay metricas publicadas en el repositorio que cuantifiquen la fidelidad de las citas.
- Los prompts deben usar el formato Explicito en inferencia; otros formatos pueden degradar la calidad de forma no documentada.
- La licencia Llama 3.1 Community impone restricciones de uso (Acceptable Use Policy) y obligaciones de atribucion; revisar NOTICE antes de cualquier uso comercial.
- El repositorio pesa 41,9 GB por acumular 55 ejecuciones; seleccionar una sola carpeta reduce drasticamente el almacenamiento necesario.
- No hay datos publicados de benchmarks, latencia ni throughput; cualquier decision de despliegue requiere evaluacion propia.
- El modelo hereda los sesgos del corpus de entrenamiento de Llama 3.1 y Typhoon2, no auditados en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/monoboard/Llama-3.1-Typhoon2-8B-LBT-QA-adapters
- Modelo base en Hugging Face: https://huggingface.co/scb10x/llama3.1-typhoon2-8b-instruct
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Paper asociado y material suplementario S1: no disponible en la informacion proporcionada
