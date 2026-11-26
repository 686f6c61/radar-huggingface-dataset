# Maximilian228/Hy4-flash-NVFP4-GPTQ-Basalt

## Resumen

Hy4-flash-NVFP4-GPTQ-Basalt es un fichero de pesos cuantizados del modelo Hy4-flash de Tencent, preparado por el usuario Maximilian228 para el motor de inferencia Basalt. Se trata de una obra derivada que re-cuantiza los expertos enrutados del modelo original (un transformer de mezcla de expertos) a formato NVFP4 mediante GPTQ, partiendo del checkpoint BF16 en lugar de aplicar un simple redondeo al vecino más cercano (round-to-nearest). El objetivo es reducir el error de cuantización manteniendo el mismo tamano de fichero y la misma velocidad de ejecución que el pack de referencia.

El modelo base, Hy4-flash, es un MoE con 41 capas MoE y 512 expertos enrutados por capa, ademas de una tabla Engram, atencion, experto compartido, MLP denso en la capa 0, encoder de vision y un drafter especulativo DFly2. La cuantizacion afecta exclusivamente a las proyecciones gate/up/down de los expertos enrutados; el resto de componentes permanece byte a byte identico al pack round-to-nearest de jesdga.

La relevancia de este fichero es practica: demuestra que una calibracion GPTQ especifica por experto, con un corpus orientado a sesiones agenticas de codigo, function calling y cinco idiomas, mejora metricas de fidelidad (KLD, acuerdo top-1, error de salida de experto) frente al redondeo directo, con un coste de perplexity que el autor documenta de forma transparente. Requiere una GPU NVIDIA Blackwell (sm_120) y 128 GB de RAM, lo que lo situa en el terreno de estaciones de trabajo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (41 capas MoE, 512 expertos enrutados por capa) con tabla Engram, experto compartido, encoder de vision y drafter especulativo DFly2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1) en expertos enrutados con GPTQ; escalas UE4M3 por cada 16 elementos y escala FP32 por proyeccion; resto de componentes sin cuantizar respecto al pack de referencia |
| Idiomas soportados | no disponible en la model card; el corpus de calibracion incluye ucraniano, ingles, chino y ruso |
| Licencia | tencent-hy-license-1.0 (Tencent Hy License 1.0) |
| Formato de pesos | Basalt (`Hy4-flash-NVFP4-GPTQ.basalt`), 158.746.168.309 bytes |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 41 capas MoE y 512 expertos enrutados por capa. Ademas de los expertos, incorpora una tabla Engram, un experto compartido, un MLP denso en la capa 0, un encoder de vision y un drafter especulativo DFly2. Esta ficha no modifica la arquitectura: solo re-cuantiza las proyecciones gate/up/down de los expertos enrutados de cada capa MoE.

La cuantizacion se realizo con GPTQ partiendo de los pesos BF16 de Tencent, calculando hessianas por experto a partir de las activaciones enrutadas. El corpus de calibracion comprende aproximadamente 1,67 millones de tokens de prompt tras deduplicar prefijos, distribuidos en sesiones de codigo agentico en Claude Code (420K), trayectorias de agentes software de OpenHands y SWE-agent (191K), function calling de hermes-function-calling-v1, ToolACE, glaive-function-calling-v2 y xlam-function-calling-60k (197K), codigo de sistemas en Rust, C++, CUDA, Python y shell (211K), codigo web JS/TS, HTML y CSS (125K), razonamiento matematico y cientifico con OpenR1-Math (126K), ucraniano (165K), ingles (110K), chino (65K) y ruso (56K). El corpus no se redistribuye; solo las estadisticas de activacion se incorporaron a los pesos.

La innovacion tecnica principal es el uso de GPTQ por experto en lugar de round-to-nearest, con el objetivo de reducir el error de salida de los expertos enrutados. Segun el autor, el error relativo MSE de salida de experto en activaciones retenidas baja de 0,0146 a 0,0074 (entre 1,5 y 3,9 veces menor por capa). El fichero mantiene el mismo tamano y los mismos kernels que el pack round-to-nearest, por lo que la velocidad de ejecucion es equivalente.

## Capacidades

- Generacion de texto y razonamiento: el modelo base soporta generacion autoregresiva y modo de pensamiento (thinking), segun el uso de OpenR1-Math con el propio thinking de Hy4 en el corpus de calibracion.
- Codigo: entrenado y calibrado con codigo de sistemas (Rust, C++, CUDA, Python, shell) y codigo web (JS/TS, HTML, CSS), lo que respalda tareas de generacion y edicion de codigo.
- Tool calling / function calling: el corpus incluye cuatro datasets especificos de function calling, y las pruebas agenticas reportadas miden llamadas a herramientas validas en sesiones de Claude Code.
- Agentes y razonamiento multi-paso: las pruebas incluyen replay de 67 turnos de Claude Code, tareas en vivo y trayectorias de OpenHands y SWE-agent.
- Capacidades multilingues: el corpus cubre ucraniano, ingles, chino y ruso; la model card no declara una lista oficial de idiomas soportados.
- Vision: el modelo base incluye un encoder de vision, que permanece sin cambios en este pack.
- Decodificacion especulativa: incorpora el drafter DFly2 del modelo base, sin modificar.

## Casos de uso

- Asistencia de codigo en produccion con agentes: el pack esta calibrado con sesiones reales de Claude Code y trayectorias de OpenHands y SWE-agent, por lo que es adecuado para servir a agentes que editan repositorios y ejecutan herramientas en entornos sandbox. Las pruebas del autor reportan 59 llamadas a herramienta validas de 67 turnos replay y 8 de 9 tareas en vivo finalizadas.
- Function calling en pipelines de automatizacion: la calibracion con hermes-function-calling-v1, ToolACE, glaive y xlam respalda la generacion de llamadas estructuradas a APIs, util para orquestadores y backends que necesitan invocar servicios externos.
- Generacion y refactorizacion de codigo de sistemas: el corpus incluye 211K tokens de Rust, C++, CUDA, Python y shell, lo que lo hace apropiado para tareas de codigo de bajo nivel y scripting en entornos de desarrollo.
- Desarrollo web frontend: los 125K tokens de JS/TS, HTML y CSS del corpus lo orientan a tareas de generacion de componentes y correccion de codigo web, aunque el autor reporta que ambas variantes fallan las mismas 5 tareas JavaScript de su banco de pruebas.
- Razonamiento matematico y cientifico: los 126K tokens de OpenR1-Math con thinking de Hy4 permiten usar el modelo en resolucion de problemas paso a paso y explicaciones tecnicas.
- Atencion multilingue en Europa del Este: la calibracion con 165K tokens de ucraniano y 56K de ruso, con comprobaciones de deriva CJK en respuestas ucranianas, lo orienta a aplicaciones para esos idiomas, aunque el autor no logra separar las variantes en la sonda de deriva.
- Despliegue en estacion de trabajo con GPU Blackwell: al requerir una sola GPU sm_120 (probado en RTX 5090 de 32 GB) y 128 GB de RAM, encaja en entornos de desarrollo local de gama alta con el motor Basalt.

## Benchmarks y rendimiento

Calidad medida con `basalt-bench --quality` sobre 100 fragmentos de wikitext-2 de 512 tokens (25.500 filas evaluadas), frente a la referencia BF16 en llama.cpp del modelo original (PPL de referencia 18,572):

| Pack | KLD media | KLD mediana | KLD p99 | Mismo top-1 | PPL |
|---|---:|---:|---:|---:|---:|
| Round-to-nearest (`Hy4-flash-NVFP4.basalt`) | 0,2048 | 0,0319 | 3,19 | 85,73% | 17,43 |
| GPTQ (este fichero) | 0,1770 | 0,0282 | 2,71 | 86,83% | 18,99 |

Diferencias reportadas: GPTQ frente a round-to-nearest reduce la KLD en 0,0278 (IC 95%: -0,0370 a -0,0192) y mejora el acuerdo top-1 en 1,09 puntos porcentuales (IC 95%: +0,66 a +1,52). El brazo de ruido (round-to-nearest contra si mismo con distinta colocacion de expertos) muestra KLD +0,0012 y top-1 +0,33 pp, por lo que el autor considera la mejora de GPTQ superior al ruido. La distancia de PPL a la referencia baja de |ln(PPL/ref)| 0,064 a 0,022.

Resultado en direccion contraria, sobre texto retenido propio (34 fragmentos de 2.048 tokens, 34.782 filas):

| Metrica | Round-to-nearest | GPTQ | Diferencia |
|---|---:|---:|---:|
| NLL de siguiente token | 3,252 (PPL 25,85) | 3,305 (PPL 27,26) | +0,053 (IC 95%: +0,029 a +0,079) |

El autor senala que no hay referencia BF16 para esos fragmentos y que, en wikitext, round-to-nearest queda un 6% por debajo de la PPL del modelo original, por lo que una NLL menor no implica mayor fidelidad al original.

Pruebas agenticas (misma build, servidas con `basalt serve` a Claude Code, una ejecucion por brazo):

| Comprobacion | Round-to-nearest | GPTQ |
|---|---:|---:|
| Replay de Claude Code, 67 turnos: llamadas validas / misma primera herramienta | 56 / 55 | 59 / 58 |
| Tareas en vivo de Claude Code (9): finalizadas | 8 / 9 | 8 / 9 |
| Tareas en vivo: llamadas `Edit` fallidas | 5 de 25 | 3 de 33 |
| Caracteres han en respuestas ucranianas (tareas en vivo) | 0 / 69 | 0 / 72 |
| Bucles infinitos (8 sondas) | 0 / 8 | 0 / 8 |
| Tareas de codigo web | 9 / 14 | 9 / 14 |

El autor advierte que las sesiones replay se grabaron sobre el pack round-to-nearest, lo que lo favorece, y que ambas variantes fallan las mismas 5 tareas JavaScript, con el banco de pruebas bajo sospecha. La sonda de deriva CJK (16 prompts en ucraniano y ruso) no separa los packs: 4/16 para round-to-nearest, 3/16 para GPTQ y 8/16 para round-to-nearest con otra semilla. No se han ejecutado BFCL ni Global-MMLU (ucraniano).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el autor indica que se probo en una RTX 5090 de 32 GB y que el motor usa unos 85 GB de RAM del sistema.
- GPU recomendadas: una GPU NVIDIA Blackwell (sm_120); probado en RTX 5090. No se documenta compatibilidad con A100, H100 ni otras arquitecturas.
- RAM: 128 GB necesarios; el motor consume aproximadamente 85 GB.
- Fichero de paginacion: la model card menciona un requisito de page file, aunque el texto proporcionado queda truncado.
- Cabe en GPU consumer: si, en RTX 5090 de 32 GB, siempre que se cumpla el requisito de 128 GB de RAM del sistema.
- Opciones de despliegue: motor Basalt (`basalt serve`), disponible en https://github.com/sergqwer/basalt-hy4. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor afirma que la velocidad es la misma que la del pack round-to-nearest, con blobs y kernels de identico tamano y forma (pp64K, decode dentro del ruido entre ejecuciones); no se publican cifras absolutas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-NVFP4-GPTQ-Basalt (este fichero) | no disponible | no disponible | NVFP4 con GPTQ en expertos enrutados | tencent-hy-license-1.0 | Hugging Face, 548 descargas, 1 like |
| Hy4-flash-NVFP4.basalt (jesdga/Hy4-flash-Basalt) | no disponible | no disponible | NVFP4 con round-to-nearest | tencent-hy-license-1.0 | Hugging Face |
| tencent/Hy4-flash (modelo base) | no disponible | no disponible | BF16 | tencent-hy-license-1.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas en la informacion disponible; no se dispone de datos de modelos alternativos de la misma categoria para comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinacion: no disponible; no se han publicado evaluaciones especificas de factualidad.
- Perplexity en texto retenido: GPTQ obtiene peor NLL que round-to-nearest en el conjunto retenido propio del autor (3,305 frente a 3,252), con diferencia estadisticamente significativa en todos los buckets.
- Deriva de idioma: la sonda CJK con prompts en ucraniano y ruso no separa las variantes y muestra resultados inconsistentes entre semillas (4/16, 3/16 y 8/16), lo que indica fragilidad en la generacion multilingue.
- Cobertura de evaluacion incompleta: no se han ejecutado BFCL ni Global-MMLU (ucraniano); las pruebas agenticas son de una sola ejecucion por brazo, por lo que diferencias pequenas quedan dentro del ruido.
- Banco de pruebas web bajo sospecha: ambas variantes fallan las mismas 5 tareas JavaScript, lo que el autor atribuye al harness.
- Restricciones de licencia: Tencent Hy License 1.0, marcada como "other"; es una obra derivada y su uso comercial queda sujeto a los terminos de dicha licencia, que deben revisarse antes de produccion.
- Requisitos de hardware restrictivos: solo GPU NVIDIA Blackwell (sm_120) y 128 GB de RAM, lo que excluye la mayoria de entornos de despliegue convencionales.
- Formato propietario: requiere el motor Basalt; no hay soporte documentado para ecosistemas estandar como llama.cpp, vLLM u Ollama.
- Idiomas oficiales: no disponible; la lista de idiomas soportados no se declara en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Hy4-flash-NVFP4-GPTQ-Basalt
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Pack round-to-nearest de referencia: https://huggingface.co/jesdga/Hy4-flash-Basalt
- Repositorio del motor Basalt: https://github.com/sergqwer/basalt-hy4
