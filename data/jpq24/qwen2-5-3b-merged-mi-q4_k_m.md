# JPQ24/Qwen2.5-3B-Merged-MI-Q4_K_M

## Resumen

Qwen2.5-3B-Merged-MI-Q4_K_M es una exportación GGUF cuantizada del modelo Qwen/Qwen2.5-3B-Instruct tras fusionar un LoRA de razonamiento (JPQ24/qwen-2.5-3b-lora-reasoning_natural_synthesis_v5). Lo desarrolla el usuario JPQ24 y su interés principal no reside en el modelo base, sino en el pipeline de compresión aplicado: una técnica propietaria de "escudo de neuronas" basada en información mutua (MI) que identifica las proyecciones de atención y MLP más relevantes y las preserva en mayor precisión, mientras el resto de pesos se precondiciona a 3 bits antes de la cuantización final Q4_K_M.

El resultado es un fichero de 1,87 GiB (repositorio de 2,0 GB) con 3.085.938.688 parámetros, pensado para inferencia local en hardware de consumo mediante llama.cpp u Ollama. El autor publica una evaluación OOD honesta y detallada, con aciertos y fallos concretos, lo que permite calibrar expectativas reales: 75,0 % en 12 preguntas OOD y 62,5 % en 8 tareas agénticas.

La relevancia es doble: por un lado demuestra una metodología de cuantización consciente de la arquitectura (imatrix + shielding MI + precondicionado 3-bit con techo de perplejidad); por otro, expone las limitaciones típicas de un modelo de 3B cuantizado en tareas de planificación multi-paso y copia literal de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), derivado de Qwen/Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Q4_K_M con imatrix; embeddings y output en Q8_0; precondicionado interno 3-bit (group_size=32) en pesos no protegidos |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | No disponible en la informacion proporcionada |
| Formato de pesos | GGUF (fichero Qwen2.5-3B-Merged-MI-Q4_K_M.gguf, 1,87 GiB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.085.938.688 parámetros. Sobre él se fusiona en bfloat16 el LoRA JPQ24/qwen-2.5-3b-lora-reasoning_natural_synthesis_v5, orientado a razonamiento y síntesis natural. No se detalla en la información disponible el volumen de tokens de entrenamiento del LoRA ni la composición exacta de su dataset.

La innovación técnica está en el pipeline de compresión en cuatro fases: (1) fusión del LoRA; (2) "MI Neuron Shielding" o Lit-Up Core, que calcula información mutua de Shannon en streaming I(F_i; G) sobre las proyecciones de atención y MLP usando sondas de doble dominio (ciencia y agéntico), agrupa pares (MI, energía de activación) con MiniBatchKMeans en 8 clústeres y protege los 4 principales; (3) precondicionado 3-bit con group_size=32 aplicado a los pesos no protegidos en orden de seguridad, bajo un techo de perplejidad de calibración del +10 % acumulado; (4) exportación a GGUF bf16, generación de imatrix.dat de calibración y cuantización final Q4_K_M con --output-tensor-type q8_0 y --token-embedding-type q8_0.

## Capacidades

- Generación de texto conversacional multi-turno, con prompt de sistema recomendado "Be concise and accurate."
- Razonamiento de dominio científico y técnico en preguntas directas (óptica, meteorología, estructuras de datos, matemáticas elementales, astronomía, geología, termodinámica).
- Respuesta a preguntas de opción/concepto con formato corto y conciso.
- Soporte parcial de tool calling / function calling en formato JSON (con caveats de sintaxis, ver limitaciones).
- Tareas agénticas de un solo paso: extracción de enteros estrictos, actualización de estado en JSON, agregación con filtrado, compuertas de seguridad con confirmación y abstención explícita ("INSUFFICIENT_DATA").
- Capacidad multilingüe: no disponible en la información proporcionada (el modelo base Qwen2.5 es multilingüe, pero el LoRA y la evaluación publicada no documentan idiomas).
- No se documenta soporte de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente local de bolsillo: despliegue en portátil o mini-PC con Ollama usando el Modelfile incluido; el tamaño de 1,87 GiB permite ejecución en CPU o GPU de gama baja con latencia aceptable para conversación.
- Respuestas factuales concisas en dominios científicos: útil como capa de respuesta rápida sobre preguntas de física, química elemental, geología o termodinámica, donde el modelo acierta en la mayoría de los casos OOD evaluados.
- Extracción estructurada de campos: tareas de tipo StrictInt y StateJSON funcionan correctamente, por lo que puede emplearse para parsear respuestas a JSON con esquema simple en pipelines de automatización.
- Agregación y filtrado de registros: la tarea FilterAgg (devolver IDs válidos y suma de milisegundos) pasa, lo que permite usarlo en tareas de post-procesado de logs o eventos con salida JSON.
- Compuertas de seguridad en agentes: SafetyGate pasa correctamente, marcando acciones destructivas con requires_confirmation=true; adecuado como verificador ligero previo a la ejecución de acciones sensibles.
- Abstención controlada: el modelo devuelve "INSUFFICIENT_DATA" cuando la información es insuficiente, lo que lo hace apto para asistentes que deben reconocer límites en lugar de alucinar.
- Prototipado de investigación en cuantización: sirve como caso de estudio reproducible del pipeline MI + imatrix + precondicionado 3-bit para investigadores que evalúen técnicas de compresión consciente de arquitectura.
- Clasificación y respuesta corta en movilidad: por tamaño y formato GGUF, puede integrarse en aplicaciones móviles o embebidas con llama.cpp.

## Benchmarks y rendimiento

Evaluación OOD publicada por el autor sobre el propio GGUF, vía llama-server con temperature=0.0, top_p=0.95, repeat_penalty=1.05 y system prompt "Be concise and accurate.":

| Suite | Aciertos | Precision |
|---|---|---|
| Preguntas OOD (12) | 9/12 | 75,0 % |
| Tareas agenticas OOD (8) | 5/8 | 62,5 % |

Desglose de tareas agénticas:

| Tarea | Resultado |
|---|---|
| ToolJSON | Fallo (llave de cierre extra `}}`) |
| Topo5 | Fallo (orden topológico incorrecto sin scratchpad) |
| StrictInt | Paso |
| ExtractTok | Fallo (copia errónea de dígito: ALPHA-303) |
| StateJSON | Paso |
| Abstain | Paso |
| FilterAgg | Paso |
| SafetyGate | Paso |

Desglose de preguntas OOD: pasan Optics, Meteorology, CS-DS, Math-Num, Math-Geom, Astronomy, Physiology, Geology y Thermo; fallan Chem (cátodo/oxidación), Genetics (adenina-guanina) y CS-Algo (complejidad de búsqueda binaria).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5-3 GB con Q4_K_M (fichero de 1,87 GiB más overhead de contexto y KV cache); el contexto largo incrementa el consumo de KV cache.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 4090); también A100/H100 si se busca throughput masivo, aunque están sobredimensionadas para 3B.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 4-8 GB; también en CPU con llama.cpp.
- Opciones de despliegue: Ollama (Modelfile incluido en el repo), llama.cpp / llama-server (usado por el autor para la evaluación), y cualquier runtime compatible con GGUF (LM Studio, Jan, text-generation-webui). vLLM y TGI no consumen GGUF directamente, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Merged-MI-Q4_K_M (este) | 3,09 B | No disponible | GGUF Q4_K_M + imatrix, 1,87 GiB | No disponible | LoRA de razonamiento fusionado, evaluacion OOD publicada |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | No disponible en esta ficha | safetensors, GGUF oficiales | Apache 2.0 (modelo base Qwen2.5) | Sin LoRA de razonamiento ni shielding MI |
| Llama 3.2 3B Instruct | 3,2 B aprox. | No disponible en esta ficha | safetensors, GGUF | Llama 3.2 Community License | Alternativa de tamano similar de Meta |
| Phi-3.5-mini | 3,8 B | No disponible en esta ficha | safetensors, GGUF | MIT | Mas parametros, orientado a razonamiento |

Los datos de contexto y rendimiento de los modelos comparados no se han verificado en la información proporcionada; se indican solo a efectos orientativos de categoria.

## Limitaciones y advertencias

- Planificación multi-paso sin scratchpad: falla en ordenación topológica de DAG de 5 nodos (Topo5) cuando se le fuerza a emitir JSON inmediato; se recomienda permitir chain-of-thought breve antes de la extracción final.
- Sensibilidad en copia literal de tokens: se observó un error de un dígito (ALPHA-907 → ALPHA-303/307/807) atribuido a la combinación de precondicionado 3-bit en pesos no protegidos y Q4_K_M en proyecciones de atención.
- Sintaxis JSON estricta: puede emitir una llave de cierre extra (`}}`) en esquemas anidados de tool calling a temperature=0.0 sin gramática o --json-schema; conviene usar decodificación restringida por esquema en producción.
- Sensibilidad al prompt de sistema: prompts simbólicos complejos degradan el rendimiento agéntico (4/8 frente a 5/8); se recomienda mantener un system prompt simple.
- Alucinaciones factuales observadas: errores en química (oxidación en cátodo), genética (apareamiento adenina-guanina) y algoritmia (complejidad de búsqueda binaria), lo que desaconseja su uso como fuente de verdad sin verificación.
- Licencia no disponible: al no declararse en la model card, no se puede confirmar el uso comercial; debe verificarse con el autor y con la licencia del modelo base Qwen2.5 (Apache 2.0).
- Idiomas no documentados: no hay evidencia publicada del comportamiento multilingüe del LoRA fusionado.
- Modelo de 3B: capacidad de razonamiento limitada frente a modelos de 7B+; adecuado para tareas acotadas y verificación posterior.
- Sin benchmarks estándar: la única evaluación disponible es la OOD del autor (20 pruebas), con muestra reducida y no reproducible de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JPQ24/Qwen2.5-3B-Merged-MI-Q4_K_M
- LoRA fusionado: https://huggingface.co/JPQ24/qwen-2.5-3b-lora-reasoning_natural_synthesis_v5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio llama.cpp (runtime de inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime alternativo): https://ollama.com
