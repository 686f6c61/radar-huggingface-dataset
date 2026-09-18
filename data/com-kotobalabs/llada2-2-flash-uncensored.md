# com-kotobalabs/LLaDA2.2-flash-uncensored

## Resumen

LLaDA2.2-flash-uncensored es una variante no oficial del modelo inclusionAI/LLaDA2.2-flash, publicada por el usuario com-kotobalabs. No se trata de un reentrenamiento: segun la model card, los pesos son identicos a los del modelo base (clon via Xet, sin resubida) y la unica modificacion es el fichero `chat_template.jinja`, que inyecta de forma permanente una directiva de "uncensoring" al principio del bloque de sistema, de modo que el modelo no emita rechazos, moralizaciones ni advertencias, tanto si el invocante pasa un mensaje de sistema como si no. El renderizado de tool-calls y de conversaciones multi-turno se mantiene igual que en el base.

El modelo base es un modelo de lenguaje de difusion con arquitectura Mixture-of-Experts (MoE), orientado a agentes, de la serie LLaDA2 de inclusionAI. Incorpora Levenshtein Editing mediante los tokens de control `DELETE` e `INSERT`, que permiten al decodificador de difusion modificar la estructura de la secuencia, eliminar contenido redundante y crear huecos de insercion durante la generacion paralela. Cuenta con 128K tokens de contexto, 32 capas, 32 cabezas de atencion, RoPE y un vocabulario de 157.184 entradas.

Su relevancia actual es doble: por un lado, es un ejemplo de aplicacion agéntica sobre decodificacion por difusion por bloques (block diffusion), con entrenamiento por RL sobre recompensas de entorno multi-turno (L-EBPO); por otro, la variante aqui descrita elimina todos los mecanismos de rechazo del modelo alineado, lo que la hace atractiva para experimentacion sin filtros pero tambien problematica para despliegues en produccion con requisitos de seguridad o cumplimiento normativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) de difusion por bloques (dLLM), transformer con Levenshtein Editing |
| Parametros totales | 102.889.705.216 (~102,9B, segun safetensors); la model card del base indica 100B no-embedding |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponibles; los pesos se distribuyen en safetensors y el ejemplo oficial usa `torch.bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 32 |
| Cabezas de atencion | 32 |
| Codificacion posicional | Rotary Position Embedding (RoPE) |
| Tamano de vocabulario | 157.184 |
| Tokens de control | `DELETE`, `INSERT` |
| Modelo base | inclusionAI/LLaDA2.2-flash (relacion: finetune) |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Tamano del repositorio | 205,8 GB |
| Fecha de publicacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con decodificacion por difusion por bloques, no autorregresiva token a token. Frente a la generacion causal clasica, el modelo genera bloques de 32 tokens en paralelo y refina iterativamente mediante un umbral de confianza (`threshold=0.5` en la configuracion de referencia). La innovacion principal del base es Levenshtein Editing: dos tokens de control (`DELETE` e `INSERT`) permiten editar la propia secuencia durante el proceso de difusion, borrando contenido redundante e insertando nuevos huecos, lo que se traduce en capacidad de autocorreccion. Adicionalmente, Block Routing acota la activacion de expertos MoE a nivel de bloque de difusion, lo que hace viable el contexto largo de 128K en cargas agénticas.

En cuanto al entrenamiento, la informacion disponible indica que LLaDA2.2-flash incorpora Agentic Reinforcement Learning mediante L-EBPO (Levenshtein Editing ELBO-based Block-level Policy Optimization), que usa recompensas del entorno agéntico para entrenar la edicion tipo Levenshtein y la correccion de errores en escenarios multi-turno con uso de herramientas. No se especifican en la informacion proporcionada el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales. La variante uncensored no anade entrenamiento: solo modifica la plantilla de chat, por lo que su comportamiento tecnico de generacion es identico al del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 128K tokens.
- Razonamiento agéntico y uso de herramientas (tool calling), con renderizado de tool-calls identico al del modelo base.
- Ejecucion de tareas de ingenieria de software de varios pasos, evaluada con scaffold Claude Code en SWE-bench (Verified, Pro y Multilingual).
- Correccion de errores en cascada gracias a Levenshtein Editing: el modelo puede eliminar tokens ya generados e insertar nuevos durante la decodificacion.
- Generacion paralela por bloques, lo que se traduce en mayor throughput que un modelo causal de tamano comparable.
- Soporte de decodificacion con parametros especificos de difusion: `block_length`, `threshold`, `editing_threshold`, `gen_length`, `eos_early_stop`.
- Modo sin rechazos: la plantilla modificada fuerza respuestas sin negativas, sin advertencias morales y sin descargos de responsabilidad, con o sin mensaje de sistema.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Agentes de ingenieria de software: el modelo puede resolver issues sobre repositorios reales (49,28 en SWE-bench Verified con scaffold Claude Code) manteniendo contexto de 128K, lo que permite cargar ficheros y trazas largas sin truncar. Es adecuado para pipelines de reparacion automatica de bugs con verificacion por tests.
- Automatizacion de flujos MCP: con 46,21 en MCP-Atlas y 60,78 en BFCL-V4, puede orquestar llamadas a herramientas externas en cadenas de varios pasos, por ejemplo consultar una API, parsear el resultado y encadenar una segunda llamada.
- Atencion al cliente multi-turno: la ventana de 128K admite historiales largos y documentacion de producto en el mismo prompt. El caracter "uncensored" lo hace util para escenarios donde el rechazo del modelo alineado resulta contraproducente, pero exige filtrado en la capa de aplicacion.
- Generacion y refactorizacion de codigo asistida: integrable en un servidor SGLang o via transformers para autocompletar funciones, traducir entre lenguajes y aplicar parches, con la ventaja de un throughput medido de 519 TPS en SWE-bench Verified.
- Procesado de documentos largos con tarea de edicion: la capacidad de borrado e insercion de tokens permite tareas de reescritura estructural (eliminar secciones redundantes, insertar apartados) en una sola pasada de difusion, util en generacion de informes.
- Investigacion sobre decodificacion no autorregresiva: sirve como banco de pruebas para comparar difusion por bloques frente a generacion causal en terminos de latencia y calidad, con umbrales y longitudes de bloque ajustables.
- Simulacion de dialogos sin restricciones para evaluacion de seguridad: util para red-teaming y para medir la eficacia de filtros externos, dado que el modelo no aplica rechazos propios.
- Despliegue en entornos aislados (on-premise): al no estar disponible en HF Inference Providers, requiere servidor propio, lo que encaja en organizaciones con requisitos de soberania de datos.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo base (inclusionAI/LLaDA2.2-flash), cuyos pesos son identicos a los de esta variante. Configuracion de evaluacion: contexto de 128K, `temperature=1.0`, `block_length=32`, `threshold=0.5`, `editing_threshold=0.0`; cada puntuacion es la media de cinco ejecuciones.

| Benchmark | LLaDA2.2-flash | Ling-2.6-flash |
|---|---:|---:|
| SWE-bench Verified | 49,28 | 61,20 (†) |
| SWE-bench Pro | 30,10 | 31,88 |
| SWE-bench Multilingual | 25,00 | 33,73 |
| τ²-Bench | 80,33 | 76,36 (†) |
| Claw-Eval | 64,22 | 64,56 (†) |
| PinchBench | 81,66 | 81,30 (†) |
| MCP-Atlas | 46,21 | 41,12 |
| BFCL-V4 | 60,78 | 66,81 |

(†) Puntuaciones de Ling-2.6-flash tomadas del informe tecnico de Ling y Ring 2.6, obtenidas con scaffold OpenHands; SWE-bench Pro y Multilingual fueron reevaluados con el mismo scaffold Claude Code que LLaDA2.2-flash.

Throughput en tokens por segundo (TPS):

| Benchmark | LLaDA2.2-flash (TPS) | Ling-2.6-flash (TPS) |
|---|---:|---:|
| SWE-bench Verified | 519,0 | 303,2 |
| SWE-bench Pro | 485,3 | 283,4 |
| SWE-bench Multilingual | 459,5 | 200,6 |
| τ²-Bench | 592,8 | 334,9 |
| BFCL-V4 | 703,8 | 331,5 |

Para Ling-2.6-flash se activo MTP con 4 tokens de borrador. No se han publicado en la informacion disponible resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 206 GB solo para pesos (102,9B parametros x 2 bytes), mas overhead de cache KV. Estimacion propia a partir del recuento de parametros, no confirmada por el autor.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 103 GB de pesos. En 4 bits: aproximadamente 52 GB. Son estimaciones derivadas del tamano, no valores publicados.
- Al no conocerse el numero de parametros activos, no es posible calcular con precision el regimen de computo real; al ser MoE, el coste por token es inferior al de un denso de 102,9B, pero el modelo completo debe residir en memoria.
- GPU recomendadas: nodos multi-GPU de 80 GB (A100 80GB, H100 80GB, H200). Se necesitan al menos 3 GPU de 80 GB en bf16 para los pesos, mas margen para cache KV con contexto largo.
- No cabe en GPU de consumo (RTX 4090 24 GB, RTX 5090 32 GB) en su configuracion nativa; solo seria viable con cuantizaciones agresivas y offloading, no documentadas.
- Opciones de despliegue: la model card indica `transformers` con `trust_remote_code=True` (ejemplo oficial con `AutoModelForCausalLM.from_pretrained`) y SGLang. El modelo base no esta servido por HF Inference Providers.
- Soporte en vLLM, llama.cpp, Ollama, TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: 519,0 TPS en SWE-bench Verified, 485,3 en SWE-bench Pro, 459,5 en SWE-bench Multilingual, 592,8 en τ²-Bench y 703,8 en BFCL-V4, medidos con la configuracion de evaluacion indicada.
- Parametros de generacion sugeridos en el ejemplo oficial: `gen_length=512`, `block_length=32`, `threshold=0.5`, `editing_threshold=0.0`, `temperature=0.0`, `eos_early_stop=True`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento agéntico | Disponibilidad |
|---|---|---|---|---|---|
| LLaDA2.2-flash-uncensored | 102,9B totales (activos no disponibles) | 128K | apache-2.0 | Igual al base (pesos identicos) | HF, transformers + SGLang, no en Inference Providers |
| inclusionAI/LLaDA2.2-flash | 100B no-embedding | 128K | no disponible | SWE-bench Verified 49,28; τ²-Bench 80,33 | HF, transformers + SGLang |
| Ling-2.6-flash | no disponible | no disponible | no disponible | SWE-bench Verified 61,20; τ²-Bench 76,36 | no disponible |

El unico competidor con datos comparables en la informacion disponible es Ling-2.6-flash, que supera a LLaDA2.2-flash en tareas de codigo (SWE-bench Verified, Pro y Multilingual) y en BFCL-V4, mientras que LLaDA2.2-flash va por delante en τ²-Bench, MCP-Atlas y PinchBench, y es entre 1,7 y 2,3 veces mas rapido en TPS. No se dispone de comparativas con otros modelos de difusion (por ejemplo, versiones previas de LLaDA o LLaDA2) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin alineacion de seguridad: la plantilla fuerza la ausencia de rechazos y de descargos de responsabilidad, lo que puede producir contenido danino, ilegal o inseguro sin filtro previo. No debe exponerse directamente a usuarios finales sin una capa de moderacion propia.
- No es un modelo oficial: se trata de una publicacion de terceros (com-kotobalabs) sobre inclusionAI/LLaDA2.2-flash; no hay respaldo del autor original ni garantia de mantenimiento. El repositorio presenta 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinacion: como cualquier LLM, puede inventar APIs, funciones, referencias o hechos; la decodificacion por difusion con correccion de edicion no elimina este problema.
- Requiere `trust_remote_code=True` y codigo personalizado (`custom_code`), lo que implica ejecutar codigo del repositorio; conviene auditar el contenido antes de desplegarlo.
- No es servido por HF Inference Providers, por lo que no hay endpoint gestionado disponible y el despliegue corre a cargo del usuario.
- Limitaciones de idioma: no se especifica que idiomas soporta; se desconoce el comportamiento fuera del ingles.
- Limitaciones de contexto: aunque la ventana es de 128K, el rendimiento en los extremos de la ventana no esta documentado, y la cache KV con MoE y contexto largo incrementa mucho los requisitos de memoria.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, pero la licencia del modelo base debe verificarse de forma independiente; la informacion disponible no detalla la licencia de inclusionAI/LLaDA2.2-flash.
- Caveats de cuantizacion: no se publican pesos GGUF ni cuantizados, y no hay confirmacion de compatibilidad con llama.cpp u Ollama.
- Los numeros de benchmarks corresponden al modelo base en configuraciones de evaluacion concretas (scaffolds Claude Code, cinco ejecuciones); no se han publicado evaluaciones especificas de la variante uncensored.
- Los requisitos de hardware de esta ficha son estimaciones derivadas del numero de parametros, no mediciones publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/com-kotobalabs/LLaDA2.2-flash-uncensored
- Modelo base: https://huggingface.co/inclusionAI/LLaDA2.2-flash
- Informe tecnico de LLaDA2.X: https://github.com/inclusionAI/LLaDA2.X/blob/main/LLaDA2_2_tech_report.pdf
- Repositorio GitHub de la serie LLaDA2.X: https://github.com/inclusionAI/LLaDA2.X
- Los resultados de busqueda web proporcionados no contienen enlaces adicionales relevantes sobre este modelo.
