# RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ8e

## Resumen

El modelo RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ8e es una cuantizacion de 4,2 GB del modelo Qwen3.8-4B-Distill, cuyo modelo base declarado es empero-ai/Qwen3.8-Distill. Lo publica el usuario RolanDorisTech el 23 de septiembre de 2026 dentro de una familia de ocho cuantizaciones. Se trata de un derivado de razonamiento de aproximadamente 4.000 millones de parametros, distribuido en formato MLX nativo y orientado exclusivamente a Apple Silicon.

El autor lo ha generado con la herramienta oMLX y su metodo de cuantizacion dinamica mixta oQe, que asigna precision por capa segun la sensibilidad medida de cada una y anade importancia de activaciones (imatrix). El resultado es un modelo de entre 4,7 y 8,5 bits por peso efectivos, con lm_head en 8 bits y las capas de embedding, iniciales y finales reforzadas para preservar calidad.

Su relevancia practica esta en el consumo de memoria: 4,651 GB de pico medidos en un M1 Max de 64 GB, con 130,9 tokens/s de procesamiento de prompt y 48,4 tokens/s de generacion. Eso permite ejecutar un modelo de razonamiento con etiquetas `<think>` en un Mac sin GPU dedicada. No se han publicado resultados de benchmarks estandar, ni datos sobre idiomas soportados o longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (segun etiquetas del repositorio); no se detalla en la model card |
| Parametros totales | ~4.000 millones (4B, segun nombre y familia) |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (cuantizacion dinamica mixta con imatrix, ~4,7-8,5 bpw efectivos). La familia incluye tambien oQ4e, oQ5e y oQ6e |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | mlx-lm safetensors (bfloat16 para normas y escalas) |

Otros datos de la ficha: tamano del repositorio 4,2 GB; libreria `mlx`; pipeline no disponible; 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el 23 de septiembre de 2026.

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base mas alla de su adscripcion a la familia Qwen3 ni describe el corpus de entrenamiento, el numero de tokens o el uso de RLHF/DPO. Lo unico confirmado es que se trata de un modelo de razonamiento destilado, de tipo texto unicamente, con plantilla de chat Qwen3 que emplea etiquetas `<think>` para el razonamiento explicito, y que se distribuye con un archivo `chat_template.jinja`.

La innovacion tecnica del repositorio no esta en el entrenamiento, sino en la cuantizacion. El metodo oQ es una cuantizacion de precision mixta guiada por datos que mide la sensibilidad real de cada capa y reparte bits donde el error penaliza mas; la variante oQe incorpora ademas la importancia de activaciones (imatrix) para ponderar los canales relevantes. El proceso se ejecuto en un M1 Max Mac Studio de 64 GB con 32 nucleos de GPU y macOS 27.0, con los ajustes oQe ON, Reuse ON, cache automatica, Strict OFF y Preserve MTP OFF, y con bfloat16 para normas y escalas. La proteccion aplicada incluye `lm_head` en 8 bits y refuerzo de embedding y capas iniciales/finales. La cuantizacion del modelo de 4B en oQ8e tardo 1 minuto y 46 segundos. El resultado conserva el formato estandar mlx-lm safetensors, por lo que es compatible con mlx-lm, oMLX, LM Studio y mlx-swift.

## Capacidades

- Generacion de texto y razonamiento paso a paso mediante modo thinking con etiquetas `<think>`.
- Razonamiento aritmetico basico: en la prueba del autor ("Si 2x + 3 = 11, cuanto vale x"), el modelo devolvio la respuesta correcta x=4 conservando el razonamiento interno.
- Inferencia nativa en Apple Silicon a traves del ecosistema MLX (mlx-lm, oMLX, LM Studio, mlx-swift).
- Modelo de tipo texto unicamente: no hay soporte de vision, audio ni multimodalidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita; el unico indicio es el modo thinking con pasos intermedios.
- Capacidades multilingues: no disponible. No se declaran idiomas soportados.
- Capacidad especial: cuantizacion dinamica mixta oQe con preservacion selectiva de capas, que mantiene la calidad por encima de una cuantizacion uniforme de 8 bits g64 (8,502 bpw) con aproximadamente la mitad de bits efectivos.

## Casos de uso

- Asistente de razonamiento local en Mac: al ocupar 4,651 GB de pico, puede mantenerse cargado de forma permanente en un Mac con memoria unificada y resolver consultas con cadenas de razonamiento visibles, sin enviar datos a servicios externos.
- Generacion y revision de codigo en portatiles Apple: el modelo puede integrarse en flujos de trabajo de desarrollo sobre Apple Silicon mediante mlx-lm o LM Studio, aprovechando los 130,9 tokens/s de procesamiento de prompt para contextos de codigo de varios cientos de tokens.
- Prototipado rapido de pipelines de IA: sirve como modelo de pruebas para validar plantillas de chat, formatos de prompt con `<think>` y estrategias de muestreo (temperatura 0,6, top-p 0,95, top-k 20 en la configuracion recomendada) antes de escalar a modelos mayores.
- Aplicaciones macOS e iOS con modelo embebido: al ser safetensors estandar de mlx-lm, puede cargarse con mlx-swift dentro de una app nativa para tareas de asistencia y analisis de texto sin conexion.
- Tutoría y explicacion paso a paso: el modo thinking permite mostrar el desarrollo intermedio de problemas matematicos o logicos, util en herramientas educativas que necesitan justificar la respuesta.
- Anotacion y preprocesado de datos en local: clasificacion, resumen o extraccion de informacion sobre lotes de texto con coste marginal cero, en equipos sin GPU dedicada.
- Evaluacion de tecnicas de cuantizacion: comparar el rendimiento de oQ8e frente a oQ4e, oQ5e y oQ6e del mismo modelo base es util para decidir el equilibrio entre memoria y calidad en despliegues sobre Apple Silicon.
- Inferencia en el borde sin conectividad: escenarios de campo, entornos aislados o con requisitos de privacidad estrictos donde no se puede depender de una API remota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta una prueba funcional y mediciones de rendimiento en un M1 Max de 64 GB con el prompt "Q: If 2x + 3 = 11, what is x? Think step by step inside tags.", con resultado correcto (x=4).

| Modelo de la familia | Tamano | Prompt (tok/s) | Generacion (tok/s) | Pico de memoria |
|---|---|---|---|---|
| 2B-oQ4e | 1,1 GB | 267,7 | 118,6 | 1,241 GB |
| 2B-oQ8e | 1,9 GB | 122,2 | 97,5 | 2,131 GB |
| 4B-oQ4e | 2,3 GB | 133,7 | 65,4 | 2,684 GB |
| 4B-oQ8e (este modelo) | 4,2 GB | 130,9 | 48,4 | 4,651 GB |
| 9B-oQ4e | 4,9 GB | 101,5 | 43,0 | 5,471 GB |
| 9B-oQ5e | 6,0 GB | 91,3 | 37,1 | 6,555 GB |
| 9B-oQ6e | 7,0 GB | 84,3 | 33,3 | 7,664 GB |
| 9B-oQ8e | 8,9 GB | 91,8 | 28,7 | 9,679 GB |

Medicion concreta de este modelo: 37 tokens de prompt procesados a 130,9 tok/s y 82 tokens generados a 48,4 tok/s, con 4,651 GB de pico.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 4,651 GB de pico medidos con este modelo en oQ8e. En Mac con memoria unificada, ese pico se reparte entre GPU y CPU, por lo que se necesita un equipo con al menos esa cantidad disponible.
- Hardware de referencia medido: M1 Max Mac Studio, 64 GB de memoria unificada, GPU de 32 nucleos, macOS 27.0. Es el unico equipo sobre el que se han publicado mediciones.
- Compatibilidad con GPU de consumo: el modelo esta pensado para Apple Silicon (tags `mlx` y `apple-silicon`), no para CUDA. No se documenta soporte en RTX 4090, A100 o H100.
- Modelos de Mac potencialmente compatibles: cualquier Mac con memoria unificada suficiente para el pico de 4,651 GB (por ejemplo, configuraciones de 8 GB o superiores). No obstante, no hay mediciones publicadas en esos equipos, por lo que la cifra es una estimacion, no un dato confirmado.
- Opciones de despliegue: mlx-lm (`pip install mlx-lm`), oMLX, LM Studio (buscar RolanDorisTech/Qwen3.8-4B-Distill-oQ8e-MLX) y mlx-swift.
- Latencia y throughput: 48,4 tokens/s de generacion y 130,9 tokens/s de procesamiento de prompt en el hardware de referencia. En generacion, el modelo de 4B en oQ8e es aproximadamente un 26 % mas lento que el mismo 4B en oQ4e (65,4 tok/s) a cambio de una menor perdida de calidad.
- Comando de ejemplo: `mlx_lm.generate --model RolanDorisTech/Qwen3.8-4B-Distill-oQ8e-MLX-oQ8e --prompt "Explain oQ vs oQe" --max-tokens 250 --temp 0.6 --top-p 0.95 --top-k 20`.

## Comparativa con modelos similares

No se identifican en la informacion proporcionada modelos externos comparables con especificaciones verificables (parametros, contexto y rendimiento). La comparacion se limita, por tanto, a las variantes de la propia familia y al modelo base.

| Modelo | Parametros | Tamano | Contexto | Generacion (tok/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 4B-Distill-oQ8e (este) | ~4B | 4,2 GB | no disponible | 48,4 | Apache 2.0 | HuggingFace, MLX |
| 4B-Distill-oQ4e | ~4B | 2,3 GB | no disponible | 65,4 | Apache 2.0 | HuggingFace, MLX |
| 9B-Distill-oQ4e | ~9B | 4,9 GB | no disponible | 43,0 | Apache 2.0 | HuggingFace, MLX |
| 2B-Distill-oQ8e | ~2B | 1,9 GB | no disponible | 97,5 | Apache 2.0 | HuggingFace, MLX |
| Qwen3.8-4B-Distill (BF16) | ~4B | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Cuantizacion uniforme 4-bit g32 (referencia de bpw) | no aplica | no disponible | no aplica | no disponible | no aplica | no aplica |
| Cuantizacion uniforme 8-bit g64 (referencia de bpw) | no aplica | no disponible | no aplica | no disponible | no aplica | no aplica |

Nota sobre bits por peso: el autor indica que este modelo opera en un rango efectivo de 4,7 a 8,5 bpw con 4,2 GB, frente a los 5,003 bpw de una cuantizacion uniforme 4-bit g32 y los 8,502 bpw de una 8-bit g64. La ventaja declarada es mayor precision que g32/g64 a igualdad de presupuesto de memoria, aunque no se aportan metricas de perplejidad que lo cuantifiquen.

## Limitaciones y advertencias

- Modelo de razonamiento destilado: el propio autor advierte de que puede alucinar. No se aportan tasas de error ni evaluaciones de fidelidad.
- Cuantizacion con perdida: los pesos son una aproximacion de los BF16 originales. El autor afirma que es mas preciso que una cuantizacion uniforme g32 o g64, pero no publica mediciones de perplejidad ni evaluaciones comparativas que respalden la afirmacion.
- Modalidad limitada: es un modelo exclusivamente de texto. No soporta vision, audio ni entrada multimodal.
- Idiomas: no se declaran idiomas soportados en la model card. Un uso en castellano requeriria validacion previa.
- Contexto: se desconoce la longitud de contexto soportada, dato critico para planificar despliegues con conversaciones largas o documentos extensos.
- Dependencia de plataforma: el formato es MLX nativo, lo que excluye su uso directo en CUDA, ROCm o llama.cpp sin conversion previa. No se documenta una ruta de conversion a GGUF.
- Trazabilidad del linaje: la ficha declara como modelo base `empero-ai/Qwen3.8-Distill` en el campo `base_model`, mientras que los creditos del README citan `empero-ai/Qwen3.8-4B-Distill-GGUF`. Conviene verificar que licencia y condiciones se heredan a lo largo de toda la cadena antes de un uso comercial.
- Inconsistencia documental: la lista de la familia incluye la entrada "8.9GB Qwen3.8-9B-Distill-oQ8e" con la aclaracion parentetica de que se trata en realidad de este modelo de 4B en 4,2 GB, lo que genera ambiguedad sobre el inventario real de la familia.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No existe validacion independiente por parte de la comunidad.
- Fechas de publicacion: los metadatos indican creacion y actualizacion el 23 de septiembre de 2026. Conviene contrastar la fecha con otras fuentes antes de citar el modelo.
- Ausencia de benchmarks: sin resultados de MMLU, HumanEval, GSM8K ni similares, no es posible comparar su calidad objetivamente frente a alternativas de tamano similar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ8e
- Modelo base declarado en los metadatos: https://huggingface.co/empero-ai/Qwen3.8-Distill
- Modelo base citado en los creditos (GGUF): https://huggingface.co/empero-ai/Qwen3.8-4B-Distill-GGUF
- Canal del autor: https://www.youtube.com/@RolanDorisTech
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
