# bacillad/OLMoE-1B-7B-0125-Instruct

## Resumen

OLMoE-1B-7B-0125-Instruct es la variante post-entrenada para instrucciones del modelo OLMoE-1B-7B en su version de enero de 2025, desarrollada por el Allen Institute for AI (Ai2). Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 6.919 millones de parametros totales y aproximadamente 1.300 millones de parametros activos por token, lo que permite un coste de inferencia cercano al de un modelo denso de 1B pese a contar con la capacidad representacional de un 7B. Esta publicada bajo licencia Apache 2.0 y forma parte del programa OLMo, cuyo objetivo es liberar de forma completa pesos, codigo, datos y registros de entrenamiento para la investigacion abierta.

El modelo parte del checkpoint base OLMoE-1B-7B-0125 y se ha sometido a un pipeline de post-entrenamiento en tres fases: ajuste supervisado (SFT) sobre una variante especifica de OLMo del dataset Tulu 3, entrenamiento con preferencias DPO y, finalmente, RLVR (Reinforcement Learning with Verifiable Rewards) usando el dataset allenai/RLVR-GSM. Este ultimo paso refuerza capacidades de razonamiento verificable en matematicas y tareas de respuesta corta, y es lo que distingue a la version Instruct de las variantes SFT y DPO intermedias.

La relevancia actual del modelo radica en su combinacion de eficiencia computacional (MoE con enrutamiento disperso), licencia permisiva y trazabilidad total del proceso de entrenamiento, lo que lo convierte en una opcion atractiva para entornos de investigacion y para despliegues en produccion con restricciones de hardware. Su principal limitacion es el enfoque casi exclusivo en ingles y una longitud de contexto moderada en comparacion con modelos mas recientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer decoder-only |
| Parametros totales | 6.919.161.856 |
| Parametros activos | Aproximadamente 1.300 millones por token (segun paper OLMoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el paper de OLMoE documenta 4.096 tokens para el modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser safetensors en transformers se puede cuantizar a 8 bits y 4 bits con herramientas estandar (bitsandbytes, GPTQ, AWQ, GGUF) |
| Idiomas soportados | Ingles (principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

OLMoE-1B-7B es un transformer decoder-only con arquitectura Mixture-of-Experts. Cada bloque contiene un conjunto de expertos feed-forward y un router que selecciona de forma dispersa un subconjunto de ellos por token, de modo que el coste de computo por token se aproxima al de un modelo denso de aproximadamente 1.300 millones de parametros, mientras que la capacidad total de parametros asciende a 6.919 millones. Esta separacion entre parametros totales y activos es la clave de su eficiencia energetica y de memoria frente a modelos densos de tamano equivalente. El modelo base fue entrenado sobre el dataset Dolma, con un enfoque de transparencia total: pesos, codigo de entrenamiento (repositorio OLMo), codigo de evaluacion (OLMes) y detalles del pipeline estan publicados.

El post-entrenamiento de esta variante Instruct sigue tres etapas encadenadas: primero SFT sobre una mezcla especifica de OLMo del dataset Tulu 3 (allenai/tulu-3-sft-olmo-2-mixture), disenada para cubrir chat, matematicas (MATH, GSM8K) e instrucciones verificables (IFEval); despues DPO sobre allenai/olmo-2-1124-13b-preference-mix; y finalmente RLVR con allenai/RLVR-GSM, que aplica recompensas verificables sobre problemas de matematicas de tipo GSM. Esta ultima fase es la que produce la mejora mas visible en tareas de razonamiento aritmetico y respuesta corta, tal como reflejan los benchmarks publicados por el autor. No se documentan en la informacion disponible innovaciones como decodificacion especulativa o atencion lineal especifica para esta variante.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con plantilla de chat propia (`<|user|>` / `<|assistant|>` / `<|endoftext|>`).
- Razonamiento aritmetico y matematico reforzado mediante RLVR sobre GSM, con mejoras notables en MATH y DROP frente a la variante SFT.
- Respuesta a instrucciones y seguimiento de formato, heredado del entrenamiento con Tulu 3 (incluye tareas tipo IFEval).
- Razonamiento de sentido comun y conocimiento general (MMLU, BigBenchHard, TruthfulQA).
- Capacidad de responder con cadena de pensamiento (CoT) cuando se le solicita, segun los resultados de MMLU (CoT) y BigBenchHard (CoT).
- Soporte de system prompt opcional; el modelo no fue entrenado con uno especifico, pero Ai2 recomienda el suyo por defecto en demos.
- No se documenta soporte nativo de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito en la informacion disponible.
- Capacidad multilingue limitada: el modelo esta entrenado principalmente en ingles.

## Casos de uso

- Asistente conversacional en ingles para soporte tecnico: el modelo mantiene conversaciones multi-turno con la plantilla de chat nativa y puede desplegarse en endpoints compatibles con la API de transformers, lo que facilita su integracion en backends de atencion al cliente con requisitos de licencia permisiva.
- Tutoria y resolucion de problemas matematicos de nivel escolar y preuniversitario: la fase RLVR sobre GSM y los resultados en MATH (21,41) y DROP (47,87) lo hacen adecuado para generar explicaciones paso a paso en plataformas educativas.
- Generacion de respuestas con formato controlado en pipelines de evaluacion: su rendimiento en tareas tipo IFEval (heredado de Tulu 3) permite usarlo como generador de respuestas estructuradas en benchmarks internos o en sistemas de anotacion automatica.
- Prototipado rapido de aplicaciones LLM en entornos con GPU consumer: al tener solo ~1.300 millones de parametros activos, puede ejecutarse en tarjetas de gama media con cuantizacion, lo que lo hace util para demos, pruebas de concepto y entornos de desarrollo sin infraestructura dedicada.
- Investigacion en eficiencia de modelos MoE: al ser completamente abierto (pesos, codigo, datos y logs), sirve como banco de pruebas para estudiar enrutamiento, balanceo de expertos y tecnicas de post-entrenamiento como DPO y RLVR.
- Filtrado y clasificacion de texto en ingles a gran escala: su bajo coste por token permite procesar volumenes altos de documentos para tareas de resumen, extraccion o moderacion asistida, siempre con supervision humana.
- Generacion de datos sinteticos para fine-tuning: puede emplearse como modelo generador en pipelines de destilacion o aumento de datos en ingles, dado que la licencia Apache 2.0 no impone restricciones de uso comercial.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (evaluaciones del ecosistema OLMo):

| Benchmark | OLMoE-1B-7B-0125-Instruct | OLMoE-1B-7B-0924-Instruct | OLMoE-1B-7B-0125-DPO | OLMoE-1B-7B-0125-SFT | OLMoE-1B-7B-0924-SFT |
|---|---|---|---|---|---|
| Media | **45,62** | 38,44 | 45,05 | 41,76 | 37,05 |
| MMLU (CoT) | 55,08 | 54,57 | 54,93 | **55,26** | 54,32 |
| PopQA | 19,75 | 20,56 | 19,65 | 20,12 | **21,01** |
| TruthfulQA | **50,56** | 49,14 | 49,99 | 45,48 | 44,66 |
| BigBenchHard (CoT) | **38,61** | 36,78 | 37,37 | 37,31 | 36,55 |
| DROP | 47,87 | 34,48 | 48,38 | **48,57** | 34,71 |
| MATH (Flex) | **21,41** | 8,16 | 20,36 | 21,38 | no disponible en el fragmento |

La tabla muestra que la version Instruct obtiene la mejor media global (45,62) y las mejores cifras en TruthfulQA, BigBenchHard y MATH, mientras que la variante SFT mantiene una ligera ventaja en MMLU y DROP. La mejora mas acusada respecto al ciclo anterior (0924) se da en DROP (+13,4 puntos) y MATH (+13,3 puntos), atribuible al pipeline DPO + RLVR.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 14 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda disponer de 16-24 GB.
- VRAM estimada con cuantizacion a 8 bits: alrededor de 7-8 GB de pesos, manejable en GPUs de 12 GB.
- VRAM estimada con cuantizacion a 4 bits (GGUF Q4_K_M o similar): aproximadamente 4-5 GB, apto para GPUs consumer de 8 GB como RTX 3060 Ti, RTX 4060 o superiores.
- GPU recomendadas para produccion: A100 40/80 GB, H100 80 GB o L40S para servir en bf16 con concurrencia; para desarrollo, RTX 4090 (24 GB) permite bf16 con margen.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantizacion a 4 u 8 bits.
- Opciones de despliegue: transformers (requiere instalar desde main para soporte de OLMoE), vLLM, llama.cpp/Ollama mediante conversion a GGUF, y TGI. El modelo figura como `endpoints_compatible` en Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, al activar solo ~1.300 millones de parametros por token, el throughput esperado es sustancialmente mayor que el de un modelo denso de 7B con la misma GPU.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| OLMoE-1B-7B-0125-Instruct | 6,92 B / ~1,3 B | no disponible (base documentado en 4.096) | Apache 2.0 | Ingles | Pipeline abierto completo (datos, codigo, logs) |
| OLMoE-1B-7B-0924-Instruct | 6,92 B / ~1,3 B | 4.096 (segun paper) | Apache 2.0 | Ingles | Version anterior; peor media (38,44) y mucho peor en DROP y MATH |
| Mistral 7B Instruct (v0.2/v0.3) | 7,2 B densos | 8.192-32.768 | Apache 2.0 | Multilingue | Denso, mayor coste por token, amplia adopcion |
| Qwen2.5-7B-Instruct | 7,6 B densos | 32.768 (hasta 131.072 con RoPE) | Apache 2.0 | Multilingue | Denso, mejor soporte multilingue y de tool calling |

La comparativa se limita a alternativas de tamano similar o misma categoria (modelos abiertos de ~7B para instrucciones). No se dispone en la informacion proporcionada de resultados de benchmarks cruzados con Mistral o Qwen, por lo que la comparacion cuantitativa de rendimiento no puede establecerse con rigor.

## Limitaciones y advertencias

- Entrenamiento de seguridad limitado: el autor advierte explicitamente que los modelos OLMo-2 (y por extension esta variante) no cuentan con filtrado en bucle como ChatGPT y pueden producir salidas problematicas, especialmente si se les induce.
- Sesgos conocidos: al entrenarse sobre Dolma y Tulu 3, hereda los sesgos presentes en esos corpus; no se documenta una evaluacion especifica de sesgo en la informacion disponible.
- Riesgo de alucinacion: como todo modelo generativo de este tamano, puede inventar hechos, citas o resultados, especialmente en tareas de conocimiento factual (PopQA 19,75 y TruthfulQA 50,56 reflejan margen de mejora).
- Limitacion idiomatica: el modelo esta orientado principalmente al ingles; su rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto: no se especifica en la model card de esta variante; el paper de OLMoE documenta 4.096 tokens para el modelo base, muy por debajo de alternativas actuales con 32K o 128K.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario es responsable del cumplimiento normativo (RGPD, AI Act) en su jurisdiccion.
- Ausencia de soporte documentado de tool calling, agentes o vision: no debe asumirse su disponibilidad en produccion sin validacion previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: se trata de un espejo o copia del modelo oficial de Ai2, no del repositorio canonico; para produccion conviene referenciar `allenai/OLMoE-1B-7B-0125-Instruct`.
- Requiere instalar transformers desde el repositorio principal (main) para soporte de la arquitectura OLMoE, lo que puede introducir inestabilidad en entornos productivos.

## Enlaces

- Modelo en Hugging Face (este repositorio): https://huggingface.co/bacillad/OLMoE-1B-7B-0125-Instruct
- Modelo oficial de Ai2: https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Modelo base: https://huggingface.co/allenai/OLMoE-1B-7B-0125
- Variante SFT: https://huggingface.co/allenai/OLMoE-1B-7B-0125-SFT
- Variante DPO: https://huggingface.co/allenai/OLMoE-1B-7B-0125-DPO
- Reward model: https://huggingface.co/allenai/OLMoE-1B-7B-0125-RM
- Dataset SFT (Tulu 3 OLMo mixture): https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset de preferencias DPO: https://huggingface.co/datasets/allenai/olmo-2-1124-13b-preference-mix
- Dataset RLVR-GSM: https://huggingface.co/datasets/allenai/RLVR-GSM
- Paper OLMoE: https://arxiv.org/abs/2409.02060
- Paper Tulu 3: https://arxiv.org/abs/2411.15124
- Pagina del proyecto OLMo: https://allenai.org/olmo
- Repositorio de entrenamiento e inferencia: https://github.com/allenai/OLMo
- Codigo de evaluacion: https://github.com/allenai/olmes
- Codigo de fine-tuning: https://github.com/allenai/open-instruct
- Demo oficial: https://playground.allenai.org/
