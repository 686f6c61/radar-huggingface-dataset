# Pushkarrrr15151/PolyVL-logic-lora

## Resumen

PolyVL-logic-lora es un adaptador LoRA de PEFT publicado por el usuario Pushkarrrr15151 sobre el modelo base OpenGVLab/InternVL3-2B, un modelo multimodal de 2.000 millones de parametros desarrollado por OpenGVLab (Shanghai AI Laboratory). El adaptador esta especializado en razonamiento logico formal: deduccion proposicional, logica de primer orden y resolucion de puzles, y se distribuye bajo licencia Apache-2.0 con un repositorio de 0,3 GB.

El adaptador forma parte de un proyecto denominado "Polyvalent", descrito en la model card como una arquitectura de "base unica con multiples especialistas y residencia dinamica de adaptadores". En la practica, esto significa que PolyVL-logic-lora es uno de varios adaptadores que se cargan sobre el mismo InternVL3-2B para especializarlo en una tarea concreta sin duplicar los pesos del modelo base. La configuracion LoRA emplea rango r=64, alpha=128 y dropout 0,05 aplicada a las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) y a las proyecciones del MLP (gate_proj, up_proj, down_proj).

Su relevancia actual reside en la posibilidad de obtener capacidades de razonamiento logico mejoradas con un coste de almacenamiento y computo muy reducido (0,3 GB de adaptador frente a los aproximadamente 4 GB en bfloat16 del modelo base), manteniendo la ventana de contexto y las capacidades multimodales de InternVL3-2B. No obstante, la ausencia de resultados de benchmarks publicados y el caracter muy reciente del repositorio (creado en noviembre de 2026) limitan su validacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal InternVL3-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base InternVL3-2B tiene 2.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base InternVL3-2B, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (adaptador); datos de entrenamiento bajo CC BY-SA 3.0/4.0 y CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r=64, alpha=128, dropout 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Revision del modelo base | 899155015275a9b7338c7f4677e19c784e0e5a21 |
| Tamano del repositorio | 0,3 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre InternVL3-2B, un modelo multimodal de la familia InternVL3 que combina un codificador visual con un decoder de lenguaje tipo transformer. El adaptador LoRA congela los pesos del modelo base e inyecta matrices de baja descomposicion en las proyecciones de atencion y del MLP, con rango 64 y alpha 128 (escala efectiva de 2,0), lo que supone una capacidad de adaptacion relativamente alta para un adaptador de este tamano. El dropout de 0,05 actua como regularizacion durante el ajuste supervisado.

El entrenamiento se realizo mediante ajuste supervisado (SFT) sobre una mezcla curada de fuentes: Dolly-15k (Databricks, CC BY-SA 3.0), ProofWriter (Allen Institute for AI, CC BY 4.0), FOLIO (dataset de logica de primer orden, CC BY-SA 4.0) y puzles proposicionales sinteticos autogenerados. Esta combinacion mezcla instrucciones generales con datos especificos de deduccion formal, lo que explica el enfasis de la model card en "deduccion formal, logica proposicional y resolucion de puzles". No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta de la mezcla, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si el adaptador afecta al codificador visual o solo al decoder de lenguaje.

## Capacidades

- Generacion de texto y razonamiento deductivo formal: deduccion proposicional, logica de primer orden y satisfaccion de restricciones simbolicas.
- Resolucion de puzles logicos y problemas de inferencia multi-paso.
- Inferencia en lenguaje natural con razonamiento formal (LogicNLI).
- Razonamiento deductivo multi-hop (Multi-LogiEval).
- Hereda las capacidades multimodales del modelo base InternVL3-2B (vision y lenguaje), aunque el adaptador se centra en texto y razonamiento.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el enfasis en deduccion multi-paso sugiere cierta aptitud, pero no se documenta.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Verificacion de reglas de negocio: el adaptador puede evaluar si una serie de hechos y reglas en lenguaje natural implican una conclusion, util para validar politicas de acceso o condiciones contractuales. Su entrenamiento en FOLIO y ProofWriter lo hace adecuado para este tipo de inferencia formal.
- Generacion de explicaciones de deduccion en asistentes educativos: permite construir tutores de logica que resuelvan silogismos y problemas proposicionales paso a paso, apoyandose en el ajuste sobre puzles sinteticos.
- Preprocesado de consultas a bases de datos logicas: traducir enunciados en lenguaje natural a restricciones o predicados verificables, como paso previo a un motor de reglas o un solver SAT.
- Analisis de consistencia documental: detectar contradicciones entre afirmaciones de un corpus aplicando inferencia de primer orden, gracias a la mezcla de Dolly-15k (instrucciones) y FOLIO (logica formal).
- Filtrado y clasificacion de contenido con criterios logicos: evaluar si un texto cumple condiciones compuestas (conjunciones, disyunciones, negaciones) en pipelines de moderacion o compliance.
- Prototipado rapido de agentes de razonamiento: al ser un adaptador de 0,3 GB sobre un base de 2B, permite experimentar con especializacion logica en entornos con recursos limitados, cargando y descargando el adaptador segun la tarea (residencia dinamica de adaptadores).
- Evaluacion comparativa de tecnicas de razonamiento: util como linea base para investigar SFT frente a RL en tareas de deduccion formal.

## Benchmarks y rendimiento

La model card menciona evaluacion en LogicBench, LogicNLI y Multi-LogiEval, pero no publica ningun resultado numerico. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base InternVL3-2B en bfloat16 requiere aproximadamente 4 GB de pesos, mas el coste del codificador visual y la cache KV; en la practica, entre 6 y 10 GB segun longitud de contexto y resolucion de imagen. El adaptador LoRA anade un coste marginal (0,3 GB en disco, unos cientos de MB en VRAM).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100; cualquier GPU con 8 GB o mas de VRAM es suficiente para inferencia en bfloat16.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes. En GPUs de 8 GB puede requerir cuantizacion del base a 8 bits o 4 bits.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyVL-logic-lora (este) | 2B (base) + LoRA r=64 | no disponible | Razonamiento logico formal | Apache-2.0 | Hugging Face (0 descargas) |
| OpenGVLab/InternVL3-2B | 2B | no disponible | Multimodal generalista | Apache-2.0 | Hugging Face |
| Meta-Llama-3.2-3B-Instruct | 3B | 128k | Instrucciones generales | Llama 3.2 Community | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | 32k | Instrucciones generales | Apache-2.0 | Hugging Face |

La comparacion directa con adaptadores especializados en logica es limitada porque no se dispone de resultados de benchmarks de este adaptador. Frente a modelos instruct generalistas del mismo orden de parametros, la ventaja teorica de PolyVL-logic-lora es la especializacion en deduccion formal a coste de almacenamiento minimo; la desventaja es la falta de validacion publica y su dependencia del modelo base InternVL3-2B.

## Limitaciones y advertencias

- No se han publicado resultados cuantitativos en LogicBench, LogicNLI ni Multi-LogiEval pese a mencionarse su uso; no es posible verificar la mejora frente al base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion: como todo modelo generativo, puede producir cadenas de deduccion plausibles pero invalidas, especialmente en logica de primer orden con cuantificadores.
- Sesgos conocidos: no documentados; hereda los sesgos de InternVL3-2B y de la mezcla Dolly-15k, ProofWriter y FOLIO.
- Idiomas soportados no especificados; el entrenamiento parece centrado en ingles (Dolly-15k, ProofWriter, FOLIO), por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: el adaptador es Apache-2.0, pero la model card advierte que las obras derivadas que incorporen los datos de entrenamiento quedan bajo CC BY-SA 4.0, lo que puede afectar a la distribucion de modelos fusionados.
- La especializacion en logica puede degradar capacidades generales del base (olvido catastrofico), algo no evaluado en la informacion disponible.
- No se documenta el comportamiento del adaptador sobre las capacidades visuales del modelo base.
- Para produccion se recomienda fijar la revision del modelo base indicada (899155015275a9b7338c7f4677e19c784e0e5a21) para garantizar reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Pushkarrrr15151/PolyVL-logic-lora
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-2B
- Repositorio InternVL: https://github.com/OpenGVLab/InternVL
- Dataset FOLIO: https://huggingface.co/datasets/tasksource/folio
- Dataset ProofWriter: https://allenai.org/data/proofwriter
- Dataset Dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Libreria PEFT: https://github.com/huggingface/peft
