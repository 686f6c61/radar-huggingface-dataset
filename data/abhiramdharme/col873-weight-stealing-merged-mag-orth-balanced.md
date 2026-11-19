# abhiramdharme/col873-weight-stealing-merged-mag-orth-balanced

## Resumen

`abhiramdharme/col873-weight-stealing-merged-mag-orth-balanced` es un adaptador LoRA fusionado sobre `meta-llama/Llama-3.2-1B`, publicado por el usuario abhiramdharme como parte de un proyecto academico (COL873 / ELL8299 / COL8383) titulado "How Secure is Your Specialized Knowledge? An Investigation into Weight-Stealing Attacks and Defenses in Multi-Agent LLM Systems". No es un modelo de proposito general, sino un artefacto de investigacion en seguridad de IA: un merge Pareto-balanceado (MAG-Orth, `orth_rank=4`) que busca adquirir conocimiento de un "Book 02" (psicoterapia) preservando la retencion del atacante sobre un "Book 01" (personalidad).

El modelo hereda la arquitectura de Llama-3.2-1B (transformer decoder-only de aproximadamente 1.240 millones de parametros) y se distribuye como adaptador PEFT en safetensors, con un tamano de repositorio de 0,2 GB. Su relevancia es metodologica: sirve para estudiar ataques de robo de pesos y estrategias de defensa en sistemas LLM multiagente, no para despliegue productivo.

La model card reporta metricas de evaluacion sobre particiones held-out del 5%: perplejidad de 5,301 en Book 01 y 7,270 en Book 02, con precision MCQA diagnostica del 50,00% y 75,00% respectivamente, y una auditoria signed top-4 en `down_proj` de +0,650. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B) con adaptador LoRA fusionado |
| Parametros totales | No disponible de forma explicita; el modelo base Llama-3.2-1B tiene aproximadamente 1.240 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-1B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | meta-llama/Llama-3.2-1B |
| Tamano del repositorio | 0,2 GB |
| Tecnica de merge | MAG-Orth, `orth_rank=4`, attn=(0,65, 0,35), mlp=(0,35, 0,65) |
| Region | us |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (con variante rslora segun los tags) entrenado sobre Llama-3.2-1B y posteriormente fusionado mediante una estrategia de merging denominada MAG-Orth con rango ortogonal 4. Los coeficientes de mezcla son asimetricos por modulo: en las capas de atencion se aplica una ponderacion (0,65, 0,35) y en las capas MLP una ponderacion invertida (0,35, 0,65). El objetivo declarado es un equilibrio Pareto: adquirir el conocimiento del "Book 02" (psicoterapia) sin degradar la retencion del atacante sobre el "Book 01" (personalidad).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El contexto del proyecto sugiere un escenario multiagente donde un agente intenta extraer conocimiento especializado de otro mediante weight stealing, y este merge actua como defensa o como resultado controlado del ataque. La innovacion tecnica destacable es el propio procedimiento de merging ortogonal balanceado, no la arquitectura subyacente.

## Capacidades

- Generacion de texto autoregresiva heredada de Llama-3.2-1B.
- Razonamiento basico y respuesta a preguntas de opcion multiple (se reporta MCQA diagnostica).
- Capacidad de retener conocimiento especializado de un dominio concreto ("Book 02", psicoterapia) segun la evaluacion del autor.
- Preservacion de rasgos de "personalidad" o retencion del atacante ("Book 01") medida por perplejidad y MCQA.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Uso previsto: investigacion en seguridad de IA y merging de modelos, no uso general.

## Casos de uso

- Investigacion en weight-stealing attacks: el adaptador sirve como artefacto de referencia para reproducir y medir ataques de extraccion de conocimiento entre agentes LLM, comparando la retencion (Book 01) frente a la adquisicion (Book 02).
- Evaluacion de defensas de merging: permite estudiar si un merge ortogonal balanceado (MAG-Orth) preserva utilidad mientras limita la fuga de conocimiento especializado, usando las metricas de PPL y MCQA reportadas.
- Docencia y proyectos academicos: material reproducible para cursos de seguridad de IA (COL873 / ELL8299 / COL8383) donde se analizan tecnicas de LoRA, rslora y model merging.
- Auditoria de adaptadores PEFT: el informe de signed audit top-4 en `down_proj` (+0,650) puede usarse como ejemplo de metodologia de inspeccion de pesos en adaptadores fusionados.
- Experimentos de equilibrio Pareto en merging: los coeficientes asimetricos por modulo (attn y mlp) sirven de plantilla para estudiar compromisos entre dos tareas o dominios en modelos pequenos de 1B.
- Prototipado de bajo coste en entornos controlados: al ser un adaptador de 0,2 GB sobre un modelo de 1B, puede cargarse en hardware modesto para pruebas de concepto de seguridad, sin pretension de produccion.

## Benchmarks y rendimiento

| Metrica | Book 01 (personalidad) | Book 02 (psicoterapia) |
|---|---|---|
| Perplejidad (PPL) | 5,301 | 7,270 |
| Precision MCQA diagnostica | 50,00% | 75,00% |
| Auditoria signed top-4 (`down_proj`) | +0,650 | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de aproximadamente 1.240 millones de parametros en FP16 se requieren del orden de 2,5-3 GB, y en cuantizacion de 4 bits alrededor de 1 GB (estimacion general para Llama-3.2-1B, no confirmada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) seria suficiente para el modelo base.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base, aunque el autor no lo confirma.
- Opciones de despliegue: la model card solo documenta carga via `peft` + `transformers` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| col873-weight-stealing-merged-mag-orth-balanced | ~1,24B (base) | No disponible | llama3.2 | safetensors (PEFT) | Merge de investigacion en seguridad; 0 descargas |
| meta-llama/Llama-3.2-1B (base) | ~1,24B | No disponible | llama3.2 | safetensors | Modelo base sin adaptador |
| Otros adaptadores LoRA sobre Llama-3.2-1B | ~1,24B (base) | No disponible | segun autor | safetensors | No disponible comparativa especifica |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion academica: no esta pensado para uso en produccion ni para tareas generales.
- Sesgos conocidos: no disponibles; hereda los sesgos del modelo base Llama-3.2-1B, no documentados por el autor.
- Riesgo de alucinacion: no evaluado; las metricas reportadas son de perplejidad y MCQA, no de fidelidad factual.
- Limitaciones de contexto e idioma: no documentadas; se desconocen los idiomas soportados y la ventana de contexto efectiva.
- Licencia llama3.2: el uso comercial esta sujeto a los terminos de la licencia de Llama 3.2, que impone restricciones y obligaciones (por ejemplo, politicas de uso aceptable y atribucion).
- Trazabilidad limitada: 0 descargas y 0 likes, sin pipeline declarado, lo que reduce la evidencia externa sobre su comportamiento.
- Naturaleza del merge: los coeficientes asimetricos por modulo pueden producir comportamientos no uniformes entre capas de atencion y MLP; conviene validar en el caso de uso concreto.
- El nombre y la finalidad del modelo hacen referencia a ataques de robo de pesos; su uso debe limitarse a investigacion autorizada y entornos controlados.

## Enlaces

- Hugging Face: https://huggingface.co/abhiramdharme/col873-weight-stealing-merged-mag-orth-balanced
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Libreria PEFT: https://huggingface.co/docs/peft
- Paper, blog, repositorio o demo del proyecto COL873: no disponibles en la informacion proporcionada.
