# shiva123782/Kaveri-Pitch-Final-1795147993

## Resumen

Kaveri-Pitch-Final-1795147993 es un ajuste fino mediante LoRA de tipo adapter sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 y atribuido en su model card a TiE-Global-Capital. Se presenta como un "Small Language Model soberano para empresa", orientado a despliegues con requisitos de identidad propia del modelo y de cumplimiento normativo. El repositorio contiene únicamente los pesos del adaptador PEFT (0,0 GB), no un modelo fusionado completo.

El modelo hereda la arquitectura transformer causal decoder-only de Qwen2.5-0.5B-Instruct, con aproximadamente 0,5 mil millones de parámetros totales. El ajuste se realizó con LoRA de rango 16 y alpha 32, con dropout 0,05, sobre los módulos de proyección q, k, v, o, gate, up y down, y se entrenó sobre el dataset yahma/alpaca-cleaned. La model card declara métricas de verificación formal con el solver Z3, un benchmark propio de identidad y referencias a cumplimiento del EU AI Act y de la DPDP india, aunque no se aportan resultados de benchmarks estándar de capacidad.

Su relevancia es limitada y fundamentalmente metodológica: sirve como ejemplo de adaptación de un modelo pequeño para identidad corporativa y de empaquetado de artefactos de gobernanza (certificados, informes de evaluación), más que como modelo de propósito general. Para tareas reales de generación, razonamiento o código, el modelo base Qwen2.5-0.5B-Instruct ofrece el mismo punto de partida con documentación y evaluación mucho más completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (heredada de Qwen2.5-0.5B-Instruct); adaptador LoRA |
| Parametros totales | ~0,5 mil millones (modelo base); el adaptador LoRA es una fracción de estos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, segun la documentacion de Qwen) |
| Tipos de cuantizacion | Entrenamiento en bfloat16/float16; la model card menciona pase forward cuantizado en 4-bit NormalFloat (NF4); no se listan GGUF ni otras variantes publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, un transformer causal decoder-only de ~0,5B parametros. El adaptador usa rango r=16, alpha=32 y dropout 0,05, aplicado a las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La model card menciona "dynamic matrix balancing" con una tasa de aprendizaje del bloque B ocho veces mayor que la del bloque A (LoRA+ con eta_B = 8,0 * eta_A), aunque no se detallan hiperparametros de entrenamiento como epochs, learning rate absoluto, batch size o numero de tokens vistos.

El dataset de ajuste declarado es yahma/alpaca-cleaned, un corpus de instrucciones en ingles de proposito general. No se documenta RLHF, DPO ni una fase de alineamiento adicional sobre el adaptador. La model card describe dos artefactos de verificacion: una comprobacion con el solver SMT de Microsoft Z3 de que el pico de VRAM de entrenamiento (3,2 GB) queda por debajo de 15,5 GB, y un "20-Crore Bijective Identity Benchmark" basado en una red de Feistel de 28 bits que genera 200 millones de consultas de identidad sin colisiones. Estas verificaciones son propiedades del procedimiento de evaluacion descrito por el autor, no resultados de capacidad del modelo, y no vienen acompanadas de codigo reproducible ni de artefactos publicados en el repositorio.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, heredadas del ajuste de instrucciones de Qwen2.5-0.5B-Instruct.
- Identidad de modelo propia: la model card indica que, sin system prompt, responde identificandose como "Kaveri-Pitch-Final-1795147993" desarrollado por TiE-Global-Capital.
- Respuesta a instrucciones generales del estilo Alpaca (preguntas, resumenes breves, redaccion sencilla).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado; no se documenta soporte de otros idiomas en el adaptador.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos de instrucciones simples con un coste de inferencia muy bajo, adecuado para validar flujos de producto antes de migrar a un modelo mayor.
- Demostraciones de identidad corporativa de modelo: util para mostrar como un adaptador LoRA puede fijar la identidad declarada del asistente sin system prompt, en entornos de presentacion o auditoria interna.
- Pruebas de concepto de gobernanza y cumplimiento: el repositorio incluye referencias a EU AI Act y DPDP Act que pueden servir como plantilla de documentacion para equipos que necesiten empaquetar artefactos de cumplimiento junto a un modelo.
- Clasificacion y extraccion ligera de texto en ingles: tareas de etiquetado, reformulacion o extraccion de campos sobre entradas cortas, donde 0,5B parametros bastan y el despliegue en CPU es viable.
- Generacion de texto en entornos con recursos muy limitados: el tamano del adaptador y del modelo base permite ejecucion en GPUs de consumo e incluso en CPU con cuantizacion, para demos offline.
- Educacion y experimentacion con PEFT: ejemplo practico de como ajustar un modelo pequeno con LoRA y publicar solo el adaptador, util en cursos y talleres de fine-tuning.
- Base para un ajuste posterior domain-specific: el adaptador puede servir de punto de partida para un segundo ajuste sobre datos propios en ingles, aunque conviene partir del modelo base original para tener control total del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta metricas propias del procedimiento del autor:

| Metrica declarada | Valor | Naturaleza |
|---|---|---|
| Tasa de fuga de identidad del proveedor base ("zero-leak") | 0,0 % | Benchmark propio del autor |
| Retencion de identidad en 200 millones de consultas | 100,0 % | Benchmark propio del autor |
| Colisiones en el benchmark de identidad | 0 | Benchmark propio del autor |
| Pico de VRAM en entrenamiento | 3,2 GB | Medido por el autor |
| Latencia de inferencia P99 | 18,2 ms | Declarada por el autor, sin especificar hardware |
| Throughput | 198+ tok/s | Declarado por el autor, sin especificar hardware |

Estos valores no son comparables con benchmarks de capacidad y no se acompanan de scripts de evaluacion publicados en el repositorio.

## Requisitos de hardware

- VRAM para inferencia: el modelo base en bfloat16 ocupa aproximadamente 1 GB de pesos; con el adaptador LoRA cargado, el consumo total se mantiene en torno a 1-1,5 GB mas el overhead de activaciones y cache KV. En cuantizacion 4-bit (NF4) el peso baja a unos 0,3-0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100 son sobradamente suficientes. El autor cita entrenamiento en Kaggle T4 con 3,2 GB de pico.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + peft (ruta documentada por el autor); llama.cpp, Ollama y vLLM requeririan fusionar el adaptador con el modelo base y convertir a GGUF o safetensors completos, algo que el repositorio no proporciona.
- Latencia y throughput: el autor declara 18,2 ms de latencia P99 y 198+ tok/s en "standard desktop workstation", sin especificar GPU, batch ni longitud de secuencia; deben tomarse como orientativos y no verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kaveri-Pitch-Final-1795147993 | ~0,5B (adaptador LoRA) | no disponible (base: 32.768) | Apache 2.0 | Adaptador PEFT en HF, 0 descargas | Identidad propia y artefactos de gobernanza; sin benchmarks de capacidad |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32.768 tokens | Apache 2.0 | Modelo completo en HF, ampliamente usado | Modelo base; documentacion y evaluacion completas |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache 2.0 | Modelo completo en HF | Mayor capacidad a coste de ~3x VRAM |
| SmolLM2-360M-Instruct | ~0,36B | 8.192 tokens (segun documentacion de HuggingFace) | Apache 2.0 | Modelo completo en HF | Alternativa de tamano similar con contexto menor |

La comparacion relevante es con el propio modelo base: el adaptador no anade capacidades declaradas mas alla de la identidad y del empaquetado de cumplimiento, y no publica evaluaciones que permitan afirmar una mejora en tareas estandar.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de Qwen2.5-0.5B-Instruct y del dataset alpaca-cleaned, ambos de dominio publico y con sesgos documentados en la literatura; el adaptador no incorpora un proceso de mitigacion descrito.
- Riesgo de alucinacion: alto en un modelo de 0,5B parametros, especialmente en tareas de conocimiento factual, matematicas y razonamiento multi-paso.
- Limitaciones de contexto e idioma: solo se declara ingles; no se documenta el contexto efectivo del adaptador, y el modelo base tiene 32.768 tokens segun Qwen, pero el adaptador no ha sido evaluado en secuencias largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y redistribucion, pero conviene verificar que los terminos del modelo base y del dataset de entrenamiento sean compatibles con el uso previsto.
- Caveats de produccion: el repositorio contiene solo el adaptador, no un modelo fusionado; el despliegue requiere descargar el modelo base y aplicar PEFT. Las afirmaciones de cumplimiento con EU AI Act Article 53 y DPDP Act 2025 Section 12 son declaraciones del autor en la model card, no certificaciones de un organismo independiente, y no deben tomarse como garantia legal.
- Verificacion no reproducible: las metricas de Z3 y del benchmark de identidad no incluyen scripts ni artefactos publicados en el repositorio (0,0 GB), por lo que no son auditables por terceros.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion; no hay evidencia de uso en produccion.
- Idiomas: el adaptador no declara soporte de castellano ni de otros idiomas distintos del ingles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiva123782/Kaveri-Pitch-Final-1795147993
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Referencia de Qwen2.5 (blog tecnico): https://qwenlm.github.io/blog/qwen2.5/
- EU AI Act, texto oficial: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- Otros enlaces (papers, demos, repos) mencionados en la model card: no disponibles en la informacion proporcionada.
