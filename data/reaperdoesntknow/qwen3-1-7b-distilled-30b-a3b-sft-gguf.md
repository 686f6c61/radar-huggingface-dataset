# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF

## Resumen

Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF es la distribucion en formato GGUF del modelo reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT, desarrollado por Reaperdoesntrun / Convergent Intelligence LLC (Research Division). Se trata de un modelo de 2.031.739.904 parametros (aproximadamente 1,7B) construido en dos etapas sobre Qwen/Qwen3-1.7B: primero una destilacion de conocimiento desde Qwen/Qwen3-30B-A3B-Instruct-2507 sobre razonamiento STEM con cadena de pensamiento, y despues un ajuste fino supervisado (SFT) en el dominio legal. El resultado es un modelo pequeno, orientado a derivaciones estructuradas y razonamiento juridico, pensado para despliegue local y en el borde (edge).

La relevancia de esta publicacion es practica: ofrece cuantizaciones listas para llama.cpp, Ollama y LM Studio en un rango de 1,2 GB a 3,8 GB, lo que permite ejecutar un modelo con capacidades de razonamiento estructurado en hardware muy modesto, incluidos telefonos moviles. El repositorio acumula 4505 descargas y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion comercial.

El modelo solo declara soporte de ingles y esta especializado en fisica, ecuaciones diferenciales, matematicas y seguimiento de instrucciones legales. No es un modelo generalista: su interes reside en la densidad de razonamiento por parametro y en la portabilidad extrema, no en cobertura amplia de tareas o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (aproximadamente 1,7B) |
| Parametros activos | no disponible (no es MoE; el profesor Qwen3-30B-A3B si lo es) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan n_ctx=1024) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only heredado de Qwen3-1.7B, sin modificaciones estructurales indicadas. El entrenamiento consta de dos etapas documentadas. La primera es una destilacion de conocimiento desde Qwen3-30B-A3B-Instruct-2507 sobre 6.122 muestras de cadena de pensamiento STEM procedentes de 12 conjuntos de datos del usuario 0xZee, usando perdida de entropia cruzada ponderada por prueba (factor 2,5x con decaimiento a 1,5x sobre los tokens de derivacion) y divergencia KL con temperatura T=2,0. El objetivo declarado es priorizar el razonamiento multi-paso frente al emparejamiento de patrones de respuesta final.

La segunda etapa aplica SFT sobre el conjunto Alignment-Lab-AI/Lawyer-Instruct para anadir seguimiento de instrucciones y conocimiento del dominio legal sobre la base de razonamiento STEM. La model card menciona un marco matematico propio ("Discrepancy Calculus", operador Df(x) y descomposicion BV) que, segun el autor, informa el pipeline de entrenamiento; no se aportan detalles verificables sobre su implementacion. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento estructurado con cadenas de pensamiento explicitas, especialmente en fisica, matematicas y ecuaciones diferenciales.
- Derivaciones paso a paso con formato de "Proof" mediante el prompt de derivacion STEM.
- Seguimiento de instrucciones en formato `### Instruction / ### Response`, heredado de la etapa SFT.
- Razonamiento y respuesta en el dominio legal (doctrinas, conceptos como promissory estoppel o res judicata) a nivel de instruccion.
- Generacion conversacional basica (tag `conversational` en Hugging Face).
- Capacidades multilingues: solo ingles declarado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning orquestado: no disponible como capacidad documentada; el multi-paso se limita al razonamiento interno en la respuesta.
- Vision, audio o thinking mode explicito: no disponible.

## Casos de uso

- Tutoria de fisica y matematicas en local: el modelo genera derivaciones paso a paso ante problemas de mecanica o ecuaciones diferenciales, con el prompt de "Proof" y temperatura 0,0 para reducir variabilidad. Es adecuado por su entrenamiento especifico en CoT STEM y su huella de 1,2 GB en Q4_K_M.
- Asistente legal de primera linea en el borde: con el formato `### Instruction`, responde consultas conceptuales sobre doctrinas juridicas y terminologia procesal, util como borrador para revision humana. El SFT sobre Lawyer-Instruct justifica este uso, siempre con verificacion posterior.
- Aplicacion movil offline de apoyo al estudio: la cuantizacion Q4_K_M (aproximadamente 1,2 GB) cabe en un telefono de gama media y permite resolver dudas de STEM sin conexion, usando llama.cpp u Ollama como runtime.
- Prototipado rapido de pipelines de razonamiento: sirve como baseline barato para comparar estrategias de prompting CoT antes de escalar a modelos mayores, dado su coste de inferencia minimo.
- Generacion de explicaciones tecnicas en documentacion: puede redactar pasos intermedios de demostraciones matematicas para manuales o material docente, con revision obligatoria por las limitaciones de correccion del modelo.
- Filtrado y clasificacion de consultas juridicas en un backend ligero: por su tamano, puede desplegarse en CPU para preclasificar o reformular preguntas legales antes de enviarlas a un modelo mayor.
- Experimentacion educativa en destilacion: el par modelo base + GGUF permite estudiar el efecto de la cuantizacion sobre el razonamiento estructurado en un caso concreto y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB (Q4_K_M), 1,4 GB (Q5_K_M), 2,1 GB (Q8_0) y 3,8 GB (F16), sin contar el espacio de contexto KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; el modelo esta pensado para CPU y edge, por lo que A100 o H100 no aportan ventaja practica.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e integradas recientes; Q4_K_M es la opcion indicada para movil y edge.
- Opciones de despliegue: llama.cpp (CLI y binding de Python `llama_cpp`), Ollama (via Modelfile), LM Studio; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF | 2,03B | no disponible | Apache 2.0 | GGUF | Destilado STEM + SFT legal, solo ingles |
| Qwen/Qwen3-1.7B | 1,7B (aprox.) | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base generalista multilingue |
| Qwen/Qwen3-30B-A3B-Instruct-2507 | 30B totales (MoE) | no disponible | Apache 2.0 | safetensors | Profesor del proceso de destilacion; mucho mayor coste de inferencia |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; no se aportan resultados de benchmarks del modelo destilado frente a su base ni frente al profesor.

## Limitaciones y advertencias

- El propio autor advierte que el modelo puede producir derivaciones fluidas pero incorrectas; no sustituye la verificacion formal de pruebas.
- No es sustituto de asesoramiento legal profesional ni de analisis de ingenieria; requiere revision humana en cualquier uso de produccion.
- Rendimiento mas debil en dominios poco representados en el dataset, como biologia molecular y fisiologia.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- La longitud de contexto no esta documentada y los ejemplos usan n_ctx=1024, lo que limita conversaciones largas o documentos extensos.
- Riesgo de alucinacion en citas legales, normas concretas y resultados numericos; conviene anclar las respuestas a fuentes.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3-1.7B (Apache 2.0) y de datos de destilacion y SFT de terceros cuyas condiciones de uso no se detallan en la model card; conviene revisar las licencias de los datasets antes de un despliegue comercial.
- El repositorio no registra likes y el autor no documenta evaluaciones independientes, por lo que la calidad real del ajuste no esta validada externamente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo fuente (safetensors): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Modelo de destilacion previo: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de SFT legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Organizacion: https://convergentintel.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
