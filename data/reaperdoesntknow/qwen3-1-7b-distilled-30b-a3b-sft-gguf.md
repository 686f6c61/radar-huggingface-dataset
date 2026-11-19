# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF

## Resumen

Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF es la version cuantizada en formato GGUF del modelo reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT, desarrollado por Reaperdoesntrun / Convergent Intelligence LLC (Research Division). Se trata de un modelo de 1.700 millones de parametros (2.031.739.904 exactos) construido en dos etapas: primero una destilacion de conocimiento desde Qwen3-30B-A3B-Instruct-2507 sobre 6.122 muestras de chain-of-thought de ambito STEM, y despues un fine-tuning supervisado sobre el dataset Alignment-Lab-AI/Lawyer-Instruct para anadir capacidad de seguir instrucciones y conocimiento del dominio legal.

El objetivo declarado es ofrecer un modelo compacto capaz de realizar derivaciones estructuradas, razonamiento matematico y fisico, y razonamiento legal basico, todo ello en un tamano que cabe en dispositivos moviles y de borde. La publicacion en GGUF con cuantizaciones desde F16 hasta Q4_K_M (1,2 GB) esta pensada para despliegue local mediante llama.cpp, Ollama, LM Studio y runtimes compatibles.

El modelo hereda la arquitectura de Qwen3-1.7B (transformer denso) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. Es relevante en el contexto actual de modelos pequenos especializados para edge computing, donde la eficiencia en memoria y la capacidad de razonamiento estructurado priman sobre el conocimiento generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (los ejemplos de uso emplean n_ctx=1024) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de 1.700 millones de parametros. El entrenamiento se estructura en dos etapas documentadas por el autor. La primera, denominada DISC-Informed Knowledge Distillation, destila el comportamiento de Qwen3-30B-A3B-Instruct-2507 (un modelo MoE de 30.000 millones de parametros totales) sobre 6.122 muestras de chain-of-thought STEM procedentes de 12 datasets del usuario 0xZee. La perdida combina cross-entropy ponderada por demostracion (con decaimiento de 2,5x a 1,5x sobre los tokens de derivacion) y divergencia KL a temperatura T=2.0, priorizando el razonamiento multi-paso sobre el emparejamiento de patrones de respuesta final.

La segunda etapa consiste en un fine-tuning supervisado sobre Alignment-Lab-AI/Lawyer-Instruct, que anade capacidad de seguir instrucciones y conocimiento del dominio legal sobre la base de razonamiento STEM. El autor menciona un marco matematico propio (Discrepancy Calculus, operador Df(x), descomposicion BV y Topological Knowledge Distillation) que informa el pipeline de entrenamiento, aunque no se aportan detalles formales adicionales en la informacion disponible. No se especifica el numero total de tokens de entrenamiento mas alla de las 6.122 muestras de destilacion, ni se documenta el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento estructurado con cadenas de pensamiento explicitas.
- Derivaciones matematicas multi-paso y demostraciones (aritmetica, ecuaciones diferenciales, fisica).
- Razonamiento en fisica e ingenieria con enfasis en derivaciones rigurosas.
- Razonamiento legal e instrucciones del dominio juridico tras el SFT sobre Lawyer-Instruct.
- Seguimiento de instrucciones mediante el formato `### Instruction: ... ### Response:`.
- Formato especifico de derivacion STEM: `Solve the following problem... Problem: ... Proof:`.
- Generacion determinista con temperatura 0.0 para tareas de razonamiento.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Asistencia en resolucion de problemas STEM en dispositivos de borde: con la cuantizacion Q4_K_M (1,2 GB) el modelo se ejecuta en moviles y Raspberry Pi mediante llama.cpp, permitiendo resolver derivaciones matematicas y fisicas sin conexion a red.
- Tutoria educativa de matematicas y fisica: el modelo genera derivaciones paso a paso con el formato `Problem:` / `Proof:`, adecuado para explicar procedimientos a estudiantes, siempre con verificacion humana posterior.
- Primer filtro en analisis legal documental: tras el SFT sobre Lawyer-Instruct, puede responder preguntas sobre doctrinas juridicas (por ejemplo, promissory estoppel o res judicata) como borrador inicial que un profesional revisa.
- Generacion de codigo auxiliar en scripts de calculo cientifico: util para esbozar funciones de resolucion numerica o scripts de simulacion fisica en entornos con recursos limitados.
- Prototipado rapido de asistentes conversacionales especializados: al ser Apache 2.0 y caber en 1,2 GB, sirve para validar pipelines de razonamiento antes de escalar a modelos mayores.
- Despliegue en entornos air-gapped: la naturaleza local del GGUF con llama.cpp permite operar en instalaciones sin acceso a internet, como laboratorios o entornos industriales.
- Investigacion sobre destilacion de conocimiento: el modelo sirve como caso de estudio reproducible de destilacion desde un MoE de 30B a un denso de 1.7B con perdida ponderada por derivacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB en F16, 2,1 GB en Q8_0, 1,4 GB en Q5_K_M y 1,2 GB en Q4_K_M (tamanos de fichero indicados por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para Q4_K_M (GTX 1050 Ti, RTX 3050, RTX 4060, etc.); no requiere GPU de datacenter.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPU y dispositivos moviles con Q4_K_M.
- Opciones de despliegue: llama.cpp (CLI y bindings Python), Ollama (via Modelfile), LM Studio; el autor indica compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota: los ejemplos de la model card usan `n_ctx=1024`, lo que sugiere que el contexto practico recomendado puede ser reducido, aunque la longitud maxima no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF | 1,7B | No disponible | Apache 2.0 | GGUF | Destilado de Qwen3-30B-A3B + SFT legal |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible | Apache 2.0 | safetensors | Modelo original sin destilacion ni SFT |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (teacher) | 30B totales (3B activos, MoE) | No disponible | Apache 2.0 | safetensors | Modelo profesor, mucho mayor y no apto para edge |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 1,7B: puede producir derivaciones fluidas pero incorrectas; el propio autor advierte que no sustituye la verificacion formal de pruebas.
- Riesgo de alucinacion en razonamiento multi-paso y en respuestas legales; no es asesoramiento juridico.
- Rendimiento mas debil en dominios poco representados en el dataset, como biologia molecular y fisiologia.
- Soporte exclusivo de ingles; no se garantiza calidad en castellano ni otros idiomas.
- El contexto practico recomendado en los ejemplos es de 1024 tokens; la longitud maxima no esta documentada.
- La documentacion del marco matematico (Discrepancy Calculus, Topological Knowledge Distillation) es escasa y no verificable de forma independiente en la informacion disponible.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias de los datasets de destilacion (0xZee, Lawyer-Instruct) para uso comercial en produccion.
- No dispone de tool calling ni capacidades de agente documentadas, lo que limita su integracion en pipelines automatizados complejos.
- El modelo tiene 0 likes y un volumen de descargas moderado (3.488), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo fuente (SFT): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Modelo de destilacion previo: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset SFT legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Organizacion: https://convergentintel.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
