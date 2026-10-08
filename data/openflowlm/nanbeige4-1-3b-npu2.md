# OpenFlowLM/Nanbeige4.1-3B-NPU2

## Resumen

Nanbeige4.1-3B-NPU2 es un modelo de lenguaje de 3 000 millones de parametros redistribuido por OpenFlowLM, construido sobre Nanbeige4-3B-Base y derivado de la iteracion Nanbeige4-3B-Thinking-2511 mediante un post-entrenamiento adicional con ajuste supervisado (SFT) y aprendizaje por refuerzo (RL). El sufijo NPU2 indica que se trata de una variante empaquetada y cuantizada para su ejecucion en las NPU de AMD Ryzen AI, no de un reentrenamiento distinto: la model card del autor original (Nanbeige) es la que aporta los datos tecnicos y de rendimiento.

El modelo persigue tres objetivos simultaneos a escala reducida: razonamiento multi-paso, alineacion de preferencias y comportamiento agentico con uso de herramientas. Segun el autor, es el primer modelo pequeno de proposito general que soporta de forma nativa tareas de busqueda profunda (deep-search) y puede sostener mas de 500 rondas de invocacion de herramientas en una misma tarea.

Su relevancia actual radica en la relacion entre tamano y resultados: con 3B de parametros declara superar en varios benchmarks a modelos de 8B, 14B y 32B de la familia Qwen3, incluidos los MoE como Qwen3-30B-A3B-2507, en pruebas de codigo, alineacion y ciencia. Todo ello bajo licencia Apache 2.0, con soporte de ingles y chino, y un repositorio de 3,1 GB en formato transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama (text-generation), con modo de razonamiento (thinking) |
| Parametros totales | 3B (aproximadamente 3 000 millones) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 256 000 tokens maximo; 32 000 tokens por defecto en FastFlowLM (configurable al arrancar) |
| Tipos de cuantizacion | Q4_1 en el despliegue NPU de FastFlowLM; safetensors sin cuantizar en el repositorio transformers (no confirmado el detalle) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); binarios xclbin/paquete cuantizado para NPU en la variante FastFlowLM |
| Modelo base | Nanbeige/Nanbeige4-3B-Base (finetune) |
| Iteracion previa | Nanbeige4-3B-Thinking-2511 |
| Tamano del repositorio | 3,1 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo de tipo llama, orientado a texto a texto y con un modo de razonamiento explicito ("Think: Yes" segun la documentacion de FastFlowLM). No se documenta en la informacion disponible el numero exacto de capas, la dimension oculta, el numero de cabezas de atencion ni el esquema de atencion (completa, lineal o hibrida), por lo que esos datos quedan como no disponibles.

El entrenamiento parte de Nanbeige4-3B-Base y se refina a partir de la iteracion Nanbeige4-3B-Thinking-2511 mediante SFT y RL. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni el algoritmo concreto de RL (por ejemplo PPO, GRPO u otro), ni si se aplico DPO. La innovacion que se destaca es de tipo conductual y de post-entrenamiento, no arquitectonica: el modelo combina en una sola red razonamiento sostenido en una unica pasada hacia delante y comportamiento agentico de multiples pasos con invocacion de herramientas, algo que en la categoria de modelos pequenos solia estar optimizado por separado. Como consecuencia del proceso de RL, se declara una mejora sustancial en alineacion de preferencias y en tareas de busqueda profunda. En la variante NPU2 se anaden, por parte del redistribuidor, pesos cuantizados y binarios especificos para la NPU de AMD Ryzen AI.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con pipeline text-generation.
- Razonamiento multi-paso dentro de un unico forward pass, con modo de pensamiento (thinking) activado por defecto.
- Razonamiento matematico de competicion: AIME 2026 I, HMMT Nov e IMO-Answer-Bench.
- Generacion y resolucion de codigo en escenarios de competicion (Live-Code-Bench V6 y Pro).
- Razonamiento cientifico y de conocimiento avanzado (GPQA, HLE text-only).
- Uso de herramientas (tool calling y function calling) con resultados en BFCL-V4 y Tau2-Bench.
- Comportamiento agentico prolongado: la model card afirma que sostiene mas de 500 rondas de invocacion de herramientas en una misma tarea.
- Busqueda profunda (deep-search): rendimiento comparable a agentes especializados por debajo de 10B de parametros.
- Alineacion de preferencias orientada a respuestas utiles y seguras (Arena-Hard-v2, Multi-Challenge).
- Soporte de contexto largo de hasta 256k tokens en la variante de despliegue de FastFlowLM.
- Capacidades de vision, audio o multimodalidad: no disponibles (modelo solo texto).

## Casos de uso

- Atencion al cliente automatizada multi-turno: con una ventana de hasta 256k tokens puede mantener el historial completo de una conversacion larga o de un expediente de cliente sin truncar, y el modo thinking le permite resolver consultas encadenadas que requieren varias comprobaciones.
- Agentes de resolucion de incidencias tecnicas: el soporte nativo de tool calling permite conectar el modelo a APIs internas (sistemas de tickets, monitorizacion, bases de conocimiento) y ejecutar cadenas largas de llamadas hasta cerrar el diagnostico.
- Asistente de busqueda profunda (deep research): para tareas que requieren navegar, extraer y sintetizar informacion de multiples fuentes, categoria en la que el propio autor reporta resultados comparables a agentes especializados por debajo de 10B.
- Generacion y revision de codigo en produccion: sus resultados en Live-Code-Bench V6 (76,9) y Pro-Medium (28,1) lo hacen utilizable en asistentes de IDE, revisiones de pull request y generacion de tests dentro de pipelines de CI/CD.
- Tutoria y resolucion de problemas matematicos: con resultados en AIME 2026 I, HMMT e IMO-Answer-Bench puede emplearse en plataformas educativas para guiar la resolucion paso a paso, mostrando el razonamiento intermedio.
- Razonamiento cientifico asistido: con GPQA en 83,8 y HLE text-only en 12,60, resulta adecuado como ayuda de analisis en dominios tecnicos donde se necesita justificar la cadena de razonamiento.
- Despliegue en portatiles con NPU AMD Ryzen AI: la variante NPU2 esta pensada para ejecucion local de baja latencia y sin enviar datos a la nube, apta para entornos con requisitos de privacidad.
- Clasificacion y extraccion de informacion estructurada sobre documentos largos: la ventana extendida permite procesar contratos, informes o expedientes completos en una sola pasada en lugar de trocearlos.
- Evaluacion de preferencias y anotacion asistida: dado su rendimiento en Arena-Hard-v2 y Multi-Challenge, puede utilizarse como modelo de referencia para generar respuestas candidatas en tareas de alineacion.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (Nanbeige4.1-3B). Los valores corresponden al modelo original; la variante NPU2 puede diferir por la cuantizacion Q4_1.

| Benchmark | Qwen3-4B-2507 | Qwen3-8B | Qwen3-14B | Qwen3-32B | Qwen3-30B-A3B-2507 | Nanbeige4-3B-2511 | Nanbeige4.1-3B |
|---|---|---|---|---|---|---|---|
| Live-Code-Bench-V6 | 57,4 | 49,4 | 55,9 | 55,7 | 66,0 | 46,0 | **76,9** |
| Live-Code-Bench-Pro-Easy | 40,2 | 41,2 | 33,0 | 42,3 | 60,8 | 40,2 | **81,4** |
| Live-Code-Bench-Pro-Medium | 5,3 | 3,5 | 1,8 | 3,5 | 3,5 | 5,3 | **28,1** |
| AIME 2026 I | 81,46 | 70,42 | 76,46 | 75,83 | 87,30 | 84,1 | **87,40** |
| HMMT Nov | 68,33 | 48,33 | 56,67 | 57,08 | 71,25 | 66,67 | **77,92** |
| IMO-Answer-Bench | 48,00 | 36,56 | 41,81 | 43,94 | **54,34** | 38,25 | 53,38 |
| GPQA | 65,8 | 62,0 | 63,38 | 68,4 | 73,4 | 82,2 | **83,8** |
| HLE (Text-only) | 6,72 | 5,28 | 7,00 | 9,31 | 11,77 | 10,98 | **12,60** |
| Arena-Hard-v2 | 34,9 | 26,3 | 36,9 | 56,0 | 60,2 | 60,0 | **73,2** |
| Multi-Challenge | 41,14 | 36,30 | 36,97 | 38,72 | 49,40 | 41,20 | **52,21** |
| BFCL-V4 | 44,87 | 42,20 | 45,14 | 47,90 | 48,6 | 53,8 | **56,50** |
| Tau2-Bench | 45,9 | 42,06 | 44,96 | 45,26 | 47,70 | 41,77 | **48,57** |

La tabla de benchmarks de busqueda profunda (xBench-DeepSearch-2505, xBench-DeepSearch-2510, Browse-Comp, Browse-Comp-ZH, GAIA text-only, HLE y SEAL-0) aparece truncada en la informacion disponible: los encabezados estan presentes, pero no se han facilitado los valores numericos, por lo que se indican como no disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6-7 GB solo para pesos, mas el espacio para la cache KV, que crece de forma proporcional a la longitud de contexto elegida.
- Cuantizacion Q4_1 (la empleada en el paquete NPU2 de FastFlowLM): el repositorio completo ocupa 3,1 GB, por lo que la huella de pesos en memoria ronda los 2-3 GB, apta para equipos con poca memoria unificada.
- Ejecucion en GPU de consumo: si, cabe con holgura en tarjetas de 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) en cuantizaciones de 4 u 8 bits; en FP16 es comoda a partir de 12-16 GB.
- GPU de centro de datos: A100, H100 u H200 son suficientes y sobredimensionadas para un modelo de 3B; se usarian para servir muchas peticiones concurrentes o contextos de 256k.
- NPU: la variante NPU2 esta disenada para las NPU de AMD Ryzen AI y se ejecuta mediante FastFlowLM, que actua como runtime especifico para esas unidades.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), FastFlowLM para NPU de AMD Ryzen AI. Soporte en vLLM, llama.cpp, Ollama o TGI: no confirmado en la informacion disponible.
- Contexto por defecto: 32 000 tokens en el arranque de FastFlowLM, ampliable hasta 256 000 segun configuracion; el consumo de memoria de la cache KV crece de forma lineal con esta cifra.
- Latencia y throughput medidos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas de rendimiento |
|---|---|---|---|---|---|
| Nanbeige4.1-3B (base de esta variante) | 3B | 256k (despliegue NPU) | Apache 2.0 | HuggingFace, ModelScope | Mejor puntuacion propia en Live-Code-Bench-V6 (76,9), Arena-Hard-v2 (73,2), GPQA (83,8) |
| Qwen3-4B-2507 | 4B | no disponible en la informacion aportada | no disponible | HuggingFace | Referencia Mini en Arena-Hard-v2 (34,9); superado por Nanbeige4.1-3B en casi todas las filas |
| Qwen3-30B-A3B-2507 | 30B totales (MoE) | no disponible en la informacion aportada | no disponible | HuggingFace | Fuerte en codigo (Live-Code-Bench-V6 66,0) y matematicas (AIME 87,30), pero inferior en alineacion (Arena-Hard-v2 60,2) y codigo dificil (Pro-Medium 3,5) |
| Nanbeige4-3B-2511 | 3B | no disponible en la informacion aportada | Apache 2.0 (presumible, misma familia) | HuggingFace | Iteracion previa; queda por debajo de Nanbeige4.1-3B en la mayoria de benchmarks salvo en Tau2-Bench (41,77 frente a 48,57) |

La comparacion se limita a los modelos presentes en la tabla de la model card. No se dispone de datos comparativos con otras familias (Llama, Gemma, Phi, Mistral) en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: no se publican tasas de hallucination ni resultados en benchmarks especificos de veracidad; como todo modelo generativo, puede producir afirmaciones plausibles pero incorrectas, especialmente en busqueda profunda y tareas factuales.
- Sesgos: no se documenta ningun analisis de sesgos, composicion del dataset ni medidas de mitigacion.
- Discrepancia sobre tool calling en el despliegue NPU: la documentacion de FastFlowLM para la variante Nanbeige indica "Tool Calling Support: No", mientras que la model card del modelo original afirma soporte agentico con mas de 500 rondas de herramientas. Conviene verificar esta capacidad en el runtime concreto antes de usarla en produccion.
- Datos de la ficha incompletos: no se detallan tokens de entrenamiento, composicion del dataset, ni la receta exacta de RL, lo que dificulta la reproducibilidad.
- Cuantizacion: la variante NPU2 emplea Q4_1, de modo que sus resultados pueden degradarse respecto a los numeros publicados en FP16, especialmente en tareas de codigo y matematicas.
- Benchmarks no verificados de forma independiente: los resultados proceden de la model card del propio autor, no de evaluaciones externas.
- Integracion: no se confirma soporte en vLLM, llama.cpp, Ollama o TGI; el despliegue fuera del ecosistema transformers o FastFlowLM puede requerir conversion manual.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y las atribuciones. Conviene revisar los terminos del modelo base Nanbeige4-3B-Base para descartar condiciones adicionales.
- Modelo de 3B: aunque supera a modelos mayores en varios benchmarks, sigue teniendo un techo de conocimiento factual y de razonamiento abstracto inferior al de modelos frontera.

## Enlaces

- HuggingFace (esta variante): https://huggingface.co/OpenFlowLM/Nanbeige4.1-3B-NPU2
- Variante NPU2 de FastFlowLM en HuggingFace: https://huggingface.co/FastFlowLM/Nanbeige4.1-3B-NPU2
- Documentacion de FastFlowLM para Nanbeige: https://fastflowlm.com/docs/models/nanbeige/
- Repositorio GitHub de FastFlowLM (binarios xclbin para NPU): https://github.com/ROCm/FastFlowLM
- ModelScope (variante NPU2): https://www.modelscope.cn/models/FastFlowLM/Nanbeige4.1-3B-NPU2
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.13367
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4-3B-Base
- Modelo original (referenciado por el redistribuidor): https://huggingface.co/Nanbeige/Nanbeige4.1-3B
