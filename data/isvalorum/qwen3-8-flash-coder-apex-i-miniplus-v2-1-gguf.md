# IsValorum/Qwen3.8-Flash-Coder-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Qwen3.8-Flash-Coder-APEX-I-MiniPlus-V2.1-GGUF es una cuantizacion GGUF publicada por el usuario IsValorum sobre el modelo base Jab1718/qwen3.8-flash-coder-85gb-bf16, un "slice" experimental de la familia Qwen3.8-Flash-Coder obtenido podando 352 de los 512 expertos enrutados originales mediante la herramienta moe-slice. El resultado es un modelo de mezcla de expertos (MoE) de 42.620.341.120 parametros totales, 48 capas hibridas (36 de SSM lineal DeltaNet y 12 de atencion dispersa completa) y 160 expertos, orientado exclusivamente a codigo y flujos agenticos en ingles.

La aportacion principal de esta ficha no es el modelo en si, sino el trabajo de cuantizacion: el autor distribuye los tensores de forma quirurgica para conseguir 3,45 bits por peso (BPW) y 21,77 GB en disco, con una perplejidad WikiText-2 de 30,1495 frente a los 30,0975 del BF16 sin comprimir, es decir, una degradacion del +0,17 %. Eso situa la fidelidad del modelo en el limite de un build Q6_K (unos 38 GB) dentro de un espacio de 21,77 GB.

Es relevante ahora porque permite ejecutar un MoE de ~42,6B parametros con 256K de contexto en estaciones de trabajo de 24 GB de VRAM, con las puertas de enrutamiento en F32 para evitar deriva de routing. Sus limitaciones son severas y estan declaradas por el propio autor: solo ingles, degradacion grave en conversacion general y en otros idiomas, y ausencia de la pasada de fine-tuning de recuperacion por parte del autor upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 48 capas, 36 de SSM lineal DeltaNet + 12 de atencion dispersa completa; 160 expertos enrutados |
| Parametros totales | 42.620.341.120 (~42,6B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (segun la model card) |
| Tipos de cuantizacion | APEX-I-MiniPlus V2.1 (3,45 BPW, 21,77 GB); en la misma familia: APEX-I-NanoPlus (2,90 BPW, 18,34 GB) y BF16 sin comprimir (16,00 BPW, 85,30 GB). Expertos compartidos en Q8, puertas de enrutamiento en F32 |
| Idiomas soportados | en (solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); tamano del repositorio 65,3 GB |
| Autor de la cuantizacion | IsValorum |
| Modelo base | Jab1718/qwen3.8-flash-coder-85gb-bf16 |
| Fecha de creacion / actualizacion | 2026-10-05 / 2026-10-08 |
| Descargas / likes | 1.000 / 1 |
| Compatibilidad de endpoint | endpoints_compatible, conversational |

## Arquitectura y entrenamiento

La arquitectura es una MoE hibrida con atencion lineal y atencion completa combinadas: de las 48 capas, 36 usan SSM lineal DeltaNet y 12 usan atencion dispersa completa. La capa MoE consta de 160 expertos enrutados, frente a los 512 del modelo monolitico original; la poda de 352 expertos se realizo con moe-slice y se calibro exclusivamente contra conjuntos de datos de Python en ingles y SWE-bench. Esto implica que los expertos especializados en conversacion y en otros idiomas fueron eliminados de forma permanente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original, ni sobre si hubo fases de RLHF o DPO; tampoco sobre innovaciones como decodificacion especulativa. Lo unico documentado es el proceso de cuantizacion: todas las puertas de enrutamiento (`ffn_gate_inp`, `ffn_gate_inp_shexp`) permanecen en F32 sin comprimir, lo que preserva la fidelidad de routing a lo largo de los 160 expertos, y los expertos de base compartidos se mantienen en Q8. El autor declara que este modelo no es compatible con Strata Engine, ya que este requiere el monolito de 512 expertos y las tablas PLE de 51B; la ejecucion debe hacerse con llama.cpp (`llama-server`) o LM Studio.

## Capacidades

- Generacion de codigo en ingles: completado, refactorizacion y sintesis de codigo, con especial enfasis en Python.
- Razonamiento agentico de multiples pasos orientado a tareas de tipo SWE-bench.
- Tool calling y function calling dentro del flujo agentico, con una plantilla de chat "hardened agentic" y control de esfuerzo de razonamiento (reasoning effort) segun la model card.
- Modo de razonamiento (reasoning) con cadena de pensamiento, etiquetado en las tags del repositorio.
- Contexto largo de 256K tokens, lo que permite procesar bases de codigo extensas en una sola pasada.
- Multilingue: no. El modelo esta declarado como exclusivamente ingles; el autor advierte de degradacion severa y texto roto en espanol, frances, aleman y otros idiomas.
- Vision y audio: no disponibles.
- Conversacion general y chit-chat: degradados de forma deliberada por la poda de expertos.

## Casos de uso

- Asistente de codigo en ingles para Python: el modelo fue calibrado contra datasets de Python, por lo que es adecuado para autocompletado, generacion de funciones y refactorizacion en ese lenguaje dentro de un IDE o un editor con integracion llama.cpp.
- Agente de resolucion de issues estilo SWE-bench: su entrenamiento de calibracion incluye SWE-bench, de modo que puede emplearse en pipelines que reciben un issue, navegan el repositorio mediante tool calling y proponen un parche.
- Revision de codigo automatizada en CI/CD: con 256K de contexto puede recibir un diff junto con los ficheros relacionados y emitir comentarios de revision, integrándose como paso previo al merge.
- Migracion y modernizacion de bases de codigo: la ventana de 256K permite cargar modulos completos y pedir reescrituras consistentes entre ficheros, manteniendo el contexto de las APIs internas.
- Generacion de tests unitarios y de integracion: a partir de un modulo y su contexto de uso, el modelo puede producir casos de prueba en Python, tarea alineada con su calibracion.
- Analisis estatico asistido y explicacion de codigo heredado: dado un repositorio completo en contexto, el modelo puede resumir la arquitectura, localizar puntos de entrada y explicar dependencias.
- Despliegue local en estacion de trabajo de 24 GB: al ocupar 20,27 GiB en memoria con contexto completo, permite ejecutar un flujo agentico de codigo sin enviar codigo propietario a servicios en la nube.
- Autocompletado en servidores con RAM abundante y GPU modesta: el autor publica benchmarks de offload a RAM del sistema para GPUs RTX de las series 30, 40 y 50, lo que habilita despliegues donde el modelo no cabe entero en VRAM.

No se recomienda su uso en atencion al cliente, asistentes conversacionales multilingues ni tareas de proposito general, dado el aviso explicito del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, SWE-bench verificado) en la informacion disponible. El unico dato empirico aportado por el autor es la perplejidad sobre WikiText-2, que se reproduce a continuacion junto a las variantes de la misma familia:

| Especificacion de cuantizacion | Tamano en disco | Huella en memoria (RAM/VRAM) | BPW medio | Perplejidad WikiText-2 | Delta PPL vs BF16 | Nivel de calidad equivalente |
|---|---|---|---|---|---|---|
| BF16 sin comprimir (referencia) | 85,30 GB (79,44 GiB) | 79,44 GiB | 16,00 | 30,0975 +/- 0,1200 | 0,00 % (base) | Referencia sin perdidas |
| APEX-I-MiniPlus V2.1 (este modelo) | 21,77 GB (20,27 GiB) | 20,27 GiB | 3,45 | 30,1495 +/- 1,0089 | +0,0520 (+0,17 %) | Frontera Q5_K_L / Q6_K |
| APEX-I-NanoPlus | 18,34 GB (17,08 GiB) | 17,08 GiB | 2,90 | 34,4199 +/- 1,1591 | +4,3224 (+14,36 %) | Q4_K_M solido |
| Q4_K_M plano estandar | 28,39 GB | 26,44 GiB | 4,50 | aprox. 30,28 - 30,38 | +0,18 a +0,28 (+0,7 %) | Compromiso industrial habitual |
| Q3_K_M plano estandar | 22,22 GB | 20,69 GiB | 3,44 | aprox. 30,55 - 30,95 | +0,45 a +0,85 (+2,1 %) | Caida de sintaxis y ruido de corchetes |
| APEX Mini generico (IQ2_S) | 17,73 GB | 16,51 GiB | 2,50 | aprox. 31,60 - 33,10+ | +1,50 a +3,00+ (+7,5 %) | Deterioro severo del razonamiento |

Los valores de las filas Q4_K_M, Q3_K_M e IQ2_S aparecen en la model card con el prefijo "aprox." y con rangos, por lo que deben considerarse estimaciones del autor, no mediciones publicadas con intervalos de confianza completos. No hay datos de latencia, throughput ni tasas de resolucion de tareas.

## Requisitos de hardware

- VRAM para inferencia: 20,27 GiB con el fichero APEX-I-MiniPlus V2.1; 17,08 GiB con NanoPlus; 79,44 GiB con el BF16 de referencia.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB. El autor titula la seccion correspondiente como "The 24GB Miracle: Full 256K Context Runs In VRAM", afirmando que el contexto completo de 256K entra en VRAM en una estacion de 24 GB.
- GPU recomendadas: no se listan modelos concretos en la informacion disponible; el autor publica benchmarks de throughput y offload para GPUs RTX de las series 30, 40 y 50, ademas de streaming a RAM del sistema. Para el BF16 (79,44 GiB) seria necesario un acelerador de 80 GB o reparto multi-GPU, dato no confirmado en la informacion.
- Opciones de despliegue: llama.cpp (`llama-server`) y LM Studio, segun la model card. No es compatible con Strata Engine, que exige el monolito de 512 expertos y las tablas PLE de 51B. No se documenta vLLM, TGI ni Ollama.
- Offload: existe soporte de offload a RAM del sistema, con benchmarks publicados por el autor para las series RTX 30/40/50; los valores concretos no estan disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles. La model card menciona un aviso especifico sobre penalizacion de repeticion y sintaxis de codigo para evitar el intercambio de caracteres, lo que sugiere que una configuracion incorrecta de `repeat_penalty` degrada la salida.

## Comparativa con modelos similares

No se dispone de datos de modelos de terceros comparables en la informacion proporcionada. La comparativa posible se limita a las variantes de la misma familia y a las cuantizaciones planas de referencia:

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| APEX-I-MiniPlus V2.1 (este) | 42,6B totales, activos no disponibles | 256K | 30,1495 (+0,17 %) | 21,77 GB | apache-2.0 | HuggingFace, 1.000 descargas |
| APEX-I-NanoPlus | mismo base | 256K | 34,4199 (+14,36 %) | 18,34 GB | apache-2.0 | HuggingFace |
| BF16 de referencia | mismo base | 256K | 30,0975 (base) | 85,30 GB | apache-2.0 | HuggingFace |
| Q4_K_M plano estandar | mismo base | 256K | aprox. 30,28 - 30,38 | 28,39 GB | apache-2.0 | Generico en llama.cpp |
| Qwen3.8-Flash (modelo original completo) | no disponible | 1M (multimodal) | no disponible | no disponible | no disponible | QwenCloud |
| Qwen3.8-35B-A3B-Distill APEX-I-MiniPlus-V2.1 | MoE, 35B-A3B | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace |

Frente al Q4_K_M plano, este build ofrece una perplejidad comparable (+0,17 % frente a +0,7 %) con 6,6 GB menos en disco, y frente al mismo Q3_K_M plano y al mismo tamano en disco (21,77 GB frente a 22,22 GB) mejora la fidelidad de 30,55-30,95 a 30,1495. Conviene recordar que las cifras de las cuantizaciones planas son aproximaciones del autor.

## Limitaciones y advertencias

- Modelo pre-release experimental: es un slice intermedio podado con moe-slice, sin la pasada de fine-tuning de recuperacion que el autor upstream no ha publicado.
- Solo ingles para codigo: no debe usarse en castellano ni en ningun otro idioma. La model card advierte de degradacion severa y salida de texto roto en espanol, frances o aleman.
- Conversacion general degradada: la poda elimino los expertos conversacionales y multilingues, por lo que el chit-chat y las tareas de proposito general fallan.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al estar calibrado exclusivamente contra Python en ingles y SWE-bench, es previsible un sesgo fuerte hacia ese lenguaje y ecosistema, en detrimento de otros lenguajes y convenciones.
- Riesgo de alucinacion: no cuantificado; no se han publicado evaluaciones de veracidad ni de tasas de fallo en generacion de codigo.
- Perplejidad con intervalo amplio: el valor de 30,1495 llega con una desviacion de +/- 1,0089, notablemente mayor que el +/- 0,1200 del BF16, lo que indica mayor varianza en la salida.
- Restriccion de motor: incompatible con Strata Engine; requiere llama.cpp o LM Studio.
- Parametros activos y contexto efectivo: se declaran 256K, pero no hay mediciones publicadas de rendimiento en contextos largos ni de degradacion por longitud.
- Sensibilidad a parametros de generacion: el autor publica un aviso critico sobre la penalizacion de repeticion en tareas de codigo, para evitar el intercambio de caracteres; una configuracion incorrecta puede corromper la sintaxis.
- Licencia: apache-2.0, que permite uso comercial, pero el modelo base es un experimento intermedio del que no se detalla la procedencia completa del entrenamiento; conviene verificar la licencia del modelo original de Qwen antes de un despliegue en produccion.
- Reputacion del repositorio: 1.000 descargas y 1 like, con un historial de publicacion muy reciente (octubre de 2026), lo que reduce la validacion comunitaria disponible.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base (BF16): https://huggingface.co/Jab1718/qwen3.8-flash-coder-85gb-bf16
- Variante APEX-I-NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-NanoPlus-GGUF
- Referencia lossless BF16 en GGUF: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-85GB-BF16-GGUF
- Repositorio de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Pagina de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Otra cuantizacion del mismo autor (35B-A3B-Distill): https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1-GGUF
- Ficha de Qwen3.8 Flash Next Apex en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-flash-next-apex.html
- Apoyo al autor de la cuantizacion: https://ko-fi.com/isvalorum
