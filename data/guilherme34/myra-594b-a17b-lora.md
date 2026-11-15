# Guilherme34/Myra-594B-A17B-LoRA

## Resumen

Myra-594B-A17B-LoRA es un adaptador LoRA publicado por el usuario Guilherme34 sobre el modelo base `thinkingmachines/Inkling-2-Small`. Segun la model card, el adaptador se entrena mediante aprendizaje por refuerzo (reinforcement learning) con el objetivo declarado de mejorar capacidades de codificacion agentica y manejo de contexto largo, y el autor afirma que supera tanto al modelo base como a `migtissera/Tess-4.5-594B-A17B` en varias pruebas de longitud de contexto y tareas de ingenieria de software.

El nombre del repositorio sugiere una arquitectura Mixture-of-Experts con 594.000 millones de parametros totales y 17.000 millones activos, aunque esta informacion no aparece confirmada de forma explicita en la model card ni en los metadatos de Hugging Face, por lo que debe tratarse como no verificada. El repositorio pesa 16,7 GB y contiene pesos en formato safetensors, lo que es coherente con un adaptador LoRA y no con pesos completos del modelo de 594B.

La relevancia del modelo es limitada por su escasa traccion (6 descargas, 1 like en el momento de la consulta) y por la ausencia de informacion sobre licencia, idiomas o detalles de entrenamiento. Se trata, por tanto, de un experimento de la comunidad que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con 594B totales / 17B activos, sin confirmar) |
| Parametros totales | no disponible (el nombre del repo indica 594B; no confirmado en la model card) |
| Parametros activos | no disponible (el nombre del repo indica 17B; no confirmado en la model card) |
| Longitud de contexto | no disponible de forma oficial; la model card menciona ventanas de hasta 256K tokens en LongBench v2 y 1M en el modelo comparado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |
| Modelo base | thinkingmachines/Inkling-2-Small |
| Metodo de ajuste | LoRA + reinforcement learning |
| Tamano del repositorio | 16,7 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `thinkingmachines/Inkling-2-Small` ni del adaptador. Los tags del repositorio indican que se trata de un LoRA entrenado con reinforcement learning, orientado a codificacion agentica (`agentic-coding`) y contexto largo (`long-context`). El nombre del repositorio codifica la hipotesis de una arquitectura MoE con 594B parametros totales y 17B activos, pero no hay confirmacion textual en la model card.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF, DPO o variantes de RL con recompensas verificables. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La unica informacion operativa es la configuracion de evaluacion reportada: `reasoning_effort="xhigh"`, `temperature=1.0` y `top_p=0.95`.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base.
- Codificacion agentica: el tag `agentic-coding` indica entrenamiento orientado a tareas de ingenieria de software con uso de herramientas.
- Manejo de contexto largo: la model card reporta evaluacion en LongBench v2 con ventanas de hasta 256K tokens (y menciona 1M en el modelo comparado).
- Razonamiento multi-paso: la configuracion `reasoning_effort="xhigh"` sugiere un modo de razonamiento extendido.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Evaluacion de agentes de codificacion: el adaptador esta entrenado con RL para tareas de `agentic-coding`, por lo que su uso natural es en pipelines de agentes que resuelven issues de repositorios (tipo SWE-Bench), donde el autor reporta un 82,35% en SWE-Bench Pro v2 Hard.
- Procesamiento de documentos extensos: con ventanas de hasta 256K tokens en las pruebas reportadas, puede emplearse para resumir o consultar contratos, informes o bases de codigo de gran tamano en una sola pasada.
- Analisis de repositorios completos: la combinacion de contexto largo y entrenamiento en codigo permite tareas de revision, refactorizacion o busqueda semantica sobre arboles de codigo extensos.
- Investigacion en RL para LLMs: al ser un LoRA publicado, sirve como punto de partida para estudiar tecnicas de reinforcement learning aplicadas a modelos de gran escala.
- Experimentacion academica con contexto largo: util para reproducir o comparar resultados en LongBench v2 y AA-LCR en entornos de investigacion.
- Prototipado de asistentes tecnicos: puede integrarse en herramientas de desarrollo (IDE, CLI) para sugerencias y edicion guiada, siempre que se valide su calidad con evaluaciones propias dado el limitado soporte de la comunidad.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. Configuracion: `reasoning_effort="xhigh"`, `temperature=1.0`, `top_p=0.95`.

| Benchmark | Tareas | migtissera/Tess-4.5-594B-A17B | Myra-300b (segun autor) |
|---|---|---|---|
| LongBench v2 (<=256K) | 399 (Tess: 395 cal) | 69,90% | 71,93% (287/399) |
| LongBench v2 (Full 503) | 503 | 70,20% (tarjeta 1M) | 70,78% (356/503) |
| SWE-Bench Pro v2 Hard | 51 | 88,24% (45/51, 4,07M tokens out) | 82,35% (42/51, 4,22M tokens out) |
| AA-LCR v1.1 | 100 | 85,00% | 82,00% (82/100, GPT-5.6-Luna) |

Nota del autor: en LongBench v2, Trajectory usa hasta 256K de contexto (con prompts de mas de 190K truncados por el medio), mientras que Tess-4.5-594B-A17B uso 1M de contexto. El autor reconoce que Myra pierde frente a Tess en SWE-Bench Pro v2 Hard y AA-LCR v1.1. No se han publicado resultados adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador LoRA, requiere cargar el modelo base `thinkingmachines/Inkling-2-Small` completo; el requisito depende del tamano real de dicho modelo base, que no se especifica.
- GPU recomendadas: no disponible. Si se confirma la hipotesis de 594B totales / 17B activos, seria necesario un despliegue multi-GPU de clase数据中心 (A100/H100/H200) con paralelismo tensorial.
- Compatibilidad con GPU de consumo: no confirmada; improbable si el modelo base es de escala 594B, incluso con cuantizacion agresiva.
- Opciones de despliegue: no documentadas. El formato safetensors de LoRA es compatible con frameworks habituales (vLLM, TGI, transformers + PEFT), pero no hay guia del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LongBench v2 (Full) | SWE-Bench Pro v2 Hard | Licencia |
|---|---|---|---|---|---|
| Myra-594B-A17B-LoRA | no confirmado (594B/17B segun nombre) | hasta 256K en pruebas | 70,78% | 82,35% | no disponible |
| migtissera/Tess-4.5-594B-A17B | 594B/17B (segun nombre) | 1M (segun tarjeta) | 70,20% | 88,24% | no disponible |
| thinkingmachines/Inkling-2-Small | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los datos aportados por el autor; no se dispone de informacion independiente sobre ninguno de los tres modelos.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribucion; es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue.
- Idiomas no documentados: se desconoce el soporte multilingue real; probablemente sesgado hacia ingles si el modelo base lo esta.
- Riesgo de alucinacion: sin datos de evaluacion de fidelidad; el entrenamiento con RL puede incrementar la confianza en respuestas incorrectas.
- Resultados autodeclarados: los benchmarks de la model card no han sido verificados de forma independiente y el autor reconoce perdidas frente a Tess-4.5 en SWE-Bench Pro v2 Hard y AA-LCR v1.1.
- Traccion minima: 6 descargas y 1 like en el momento de la consulta; sin comunidad que valide el modelo.
- Ambiguedad en el nombre: el repo se llama "594B-A17B" pero la tabla de benchmarks se refiere a "Myra-300b"; no queda claro si son el mismo modelo o variantes distintas.
- Contexto: las pruebas de LongBench v2 se hicieron con truncado central de prompts superiores a 190K tokens, lo que puede afectar a la calidad en documentos muy largos.
- Sin informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El repositorio contiene solo el adaptador LoRA (16,7 GB); es necesario descargar el modelo base por separado.

## Enlaces

- Hugging Face: https://huggingface.co/Guilherme34/Myra-594B-A17B-LoRA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Modelo comparado: https://huggingface.co/migtissera/Tess-4.5-594B-A17B
- Paper LongBench v2: no disponible en la informacion proporcionada
- Paper SWE-Bench Pro: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible
