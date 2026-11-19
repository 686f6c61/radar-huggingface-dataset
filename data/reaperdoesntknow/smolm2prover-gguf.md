# reaperdoesntknow/SMOLM2Prover-GGUF

## Resumen

SMOLM2Prover-GGUF es la distribucion en formato GGUF del modelo SMOLM2Prover, un ajuste fino (SFT) de 361,8 millones de parametros desarrollado por el usuario reaperdoesntknow bajo el sello Convergent Intelligence LLC: Research Division. El modelo parte de prithivMLmods/SmolLM2-CoT-360M, una variante con cadena de pensamiento (CoT) de la familia SmolLM2 de Hugging Face, y se ha afinado sobre el dataset AI-MO/NuminaMath-1.5 con el objetivo declarado de resolver tareas de demostracion matematica, calculo y logica formal en ingles.

La relevancia de esta publicacion es doble. Por un lado, ofrece una version cuantizada lista para ejecutarse en llama.cpp, Ollama y LM Studio, lo que permite desplegar un modelo de razonamiento matematico en hardware muy modesto (el fichero Q4_K_M ocupa solo 258 MB). Por otro, forma parte de un portafolio de investigacion que documenta una metodologia propia, el llamado Discrepancy Calculus (DISC), descrito por el autor como un marco de teoria de la medida para analizar la brecha entre el comportamiento esperado y el observado durante el entrenamiento.

Arquitectonicamente es un transformer decoder-only de tipo LlamaForCausalLM con 32 capas, dimension de embedding de 960 y atencion con query agrupadas (GQA) de 15 cabezas de consulta y 5 de clave/valor. La longitud de contexto declarada es de 8192 tokens y la licencia es Apache 2.0, heredada del modelo original. Su interes practico esta en ser un banco de pruebas ligero para tecnicas de razonamiento CoT y para pipelines de verificacion matematica en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | F16 (sin cuantizar) y Q4_K_M (Q4_K con fallback Q5_0 y capas criticas en Q6_K/Q8_0) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien disponible el modelo original en formato transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia SmolLM2, con 32 capas, dimension oculta de 960 y atencion de consultas agrupadas (15 cabezas Q frente a 5 cabezas KV), lo que reduce el coste de memoria de la cache KV durante la inferencia. El contexto maximo es de 8192 tokens. El ajuste fino se realizo mediante SFT (supervised fine-tuning) con las librerias TRL y transformers, partiendo de prithivMLmods/SmolLM2-CoT-360M y utilizando el dataset AI-MO/NuminaMath-1.5, orientado a problemas matematicos con soluciones paso a paso.

La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; solo se indica SFT. El autor enmarca el trabajo en su marco teorico Discrepancy Calculus (DISC), que describe como un enfoque de teoria de la medida para analizar singularidades del entrenamiento (mesetas de perdida, colapso de modos, olvido catastrofico) y fenomenos como el "ghost imprinting". Estos conceptos son parte del material promocional del autor y no se acompanan de resultados experimentales verificables en la informacion disponible. La version GGUF se genero con llama.cpp; la cuantizacion Q4_K_M emplea Q4_K para la mayoria de pesos, Q5_0 para tensores no divisibles por 256 y Q6_K/Q8_0 en determinadas capas criticas, con un resultado de 5,94 bits por peso.

## Capacidades

- Generacion de texto en ingles con enfasis en razonamiento paso a paso (chain of thought).
- Resolucion de problemas matematicos: calculo, algebra y aritmetica de nivel escolar y preuniversitario.
- Razonamiento logico y construccion de demostraciones (el nombre "Prover" sugiere este uso, aunque no se documentan garantias de correccion formal).
- Conversacion multiturno en formato conversational, segun los tags del repositorio.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integracion en servicios de inferencia.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito mas alla del CoT aprendido por SFT.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede generar explicaciones paso a paso de problemas de calculo y algebra, aprovechando su entrenamiento sobre NuminaMath-1.5 para desglosar razonamientos en lugar de dar solo la respuesta final.
- Generacion de borradores de demostraciones en entornos educativos: util como primer borrador que un estudiante o profesor revisa y corrige, dado su enfasis en logica y prueba.
- Verificacion ligera en pipelines de CI: al ocupar 258 MB en Q4_K_M, puede ejecutarse en el mismo runner que compila el codigo para comprobar aserciones matematicas simples o generar explicaciones de fallos.
- Prototipado de agentes de razonamiento en local: sirve como banco de pruebas de bajo coste para disenar prompts CoT y validar flujos antes de escalar a modelos mayores.
- Despliegue en dispositivos de borde o CPU: con llama.cpp u Ollama puede correr en portatiles sin GPU dedicada, adecuado para demos offline o entornos air-gapped.
- Investigacion sobre cuantizacion y calidad de razonamiento: comparar las salidas F16 frente a Q4_K_M permite estudiar la degradacion del CoT bajo cuantizacion agresiva en modelos pequenos.
- Generacion de datasets sinteticos de problemas matematicos resueltos para aumentar corpus de entrenamiento de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en F16 (fichero de 692 MB) y alrededor de 300-500 MB en Q4_K_M (fichero de 258 MB), incluyendo cache KV para contextos moderados.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en GTX 1060 6 GB, RTX 3060, RTX 4090, asi como en A100/H100 si se busca throughput masivo por lotes.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM; tambien en CPU pura.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (mediante Modelfile), LM Studio, y el runtime de transformers para la version original en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia de decenas de milisegundos por token en CPU moderna y muy inferior en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SMOLM2Prover-GGUF | 361,8 M | 8192 | Apache 2.0 | GGUF | Ajuste SFT sobre NuminaMath-1.5, solo ingles |
| SmolLM2-360M-Instruct (Hugging Face) | 362 M | 8192 | Apache 2.0 | safetensors, GGUF | Modelo base de proposito general; no especializado en matemáticas |
| prithivMLmods/SmolLM2-CoT-360M | 362 M | 8192 | no disponible en esta ficha | safetensors | Modelo base directo del que parte este ajuste; incluye CoT |
| Qwen2.5-Math-1.5B | 1.500 M | 4096 | Apache 2.0 | safetensors, GGUF | Especializado en matematicas, mayor tamano y contexto menor |

La comparativa se limita a modelos de la misma familia o categoria (modelos pequenos de razonamiento matematico). No se dispone de datos de rendimiento comparativo publicados para SMOLM2Prover.

## Limitaciones y advertencias

- Solo soporta ingles; cualquier uso en castellano u otros idiomas degradara la calidad de forma significativa.
- Modelo de 361 M de parametros: la capacidad de razonamiento matematico complejo es limitada en comparacion con modelos de miles de millones de parametros, y es probable que falle en problemas de nivel avanzado.
- Riesgo elevado de alucinacion en pasos intermedios de demostraciones: el CoT puede parecer plausible y contener errores logicos no detectables a simple vista.
- La cuantizacion Q4_K_M puede degradar la coherencia del razonamiento paso a paso; conviene validar contra la version F16 en casos criticos.
- La model card no documenta evaluaciones de sesgo ni de seguridad; se desconoce el comportamiento del modelo ante prompts adversarios.
- El marco teorico DISC y los conceptos asociados (jump sets, ghost imprinting) no cuentan con validacion independiente en la informacion disponible; deben tratarse como material del autor, no como resultados consolidados.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base y el dataset de entrenamiento pueden tener sus propias condiciones; conviene revisarlas antes de un despliegue en produccion.
- El repositorio tiene 0 likes y un volumen de descargas moderado (2265), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SMOLM2Prover-GGUF
- Modelo original (transformers): https://huggingface.co/reaperdoesntknow/SMOLM2Prover
- Modelo base: https://huggingface.co/prithivMLmods/SmolLM2-CoT-360M
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-MO/NuminaMath-1.5
- Portafolio del autor: https://huggingface.co/reaperdoesntknow
- Paper DISC (Discrepancy Calculus): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Paper Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
