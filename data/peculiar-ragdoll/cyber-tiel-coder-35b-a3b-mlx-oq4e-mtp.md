# peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP

## Resumen

Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP es una cuantizacion en formato MLX de 4 bits del modelo abliterated Huihui-Ornith-1.5-35B-A3B-abliterated, publicada por el usuario peculiar-ragdoll. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con arquitectura derivada de la familia Qwen3.5-MoE (tag `qwen35moe`), 35.951.822.704 parametros totales y aproximadamente 3.000 millones de parametros activos por token (el sufijo A3B de la nomenclatura). El modelo conserva la cabeza de prediccion multi-token (MTP) del modelo original, lo que habilita decodificacion especulativa en runtimes compatibles.

La relevancia de esta ficha reside en su naturaleza de artefacto altamente especializado: no es un modelo base, sino un derivado de tercer nivel (Ornith-1.5 → abliterated por huihui-ai → re-cuantizado por peculiar-ragdoll) orientado explicitamente a "agentic coding" y a tareas de seguridad ofensiva sin rechazos. Incorpora una plantilla de chat propia ("Sharp chat template") y una calibracion de cuantizacion realizada contra un corpus ponderado hacia dominios de ciberseguridad, usando el cuantizador oQ4e de oMLX. El resultado ocupa aproximadamente 22 GB en disco y esta disenado para ejecutarse en Apple Silicon.

Es importante subrayar que las cifras de rendimiento publicadas por el autor se midieron sobre la build GGUF (`UD-Q4_K_M` con k-quants de llama.cpp), no sobre este fichero MLX, cuyo cuantizador es distinto. Ademas, el autor advierte que esta build concreta (sufijo `-MTP`) produce salida corrupta en LM Studio y solo funciona correctamente en oMLX. La licencia declarada es MIT, y los idiomas soportados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) derivada de Qwen3.5-MoE, con cabeza de prediccion multi-token (MTP) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones (nomenclatura A3B; valor exacto no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (oQ4e de oMLX, con imatrix y calibracion propia); el autor referencia tambien una variante oQ6e en la misma familia |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors), libreria `mlx`; existe build GGUF separada publicada por el mismo autor |
| Tamano del repositorio | 88,1 GB |
| Tamano en disco de la build | Aproximadamente 22 GB |
| Modalidad | Image-text-to-text (vision) |
| Modelo base | huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated |
| Descargas / likes | 3.283 / 25 |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture-of-Experts con enrutamiento disperso: de los ~36.000 millones de parametros totales solo se activan aproximadamente 3.000 millones por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. La arquitectura procede de Ornith-1.5-35B-A3B (organizacion ornith-ai), que a su vez se encuadra en la familia Qwen3.5-MoE segun los tags del repositorio. Una innovacion tecnica destacable es la presencia de una cabeza MTP entrenada, que permite decodificacion especulativa multi-token en runtimes que la soportan (oMLX y llama.cpp segun el autor), acelerando la generacion.

El pipeline de entrenamiento y derivacion tiene tres etapas documentadas: (1) el modelo base Ornith-1.5-35B-A3B; (2) la version abliterated de huihui-ai, que elimina el comportamiento de rechazo mediante intervencion sobre direcciones de activacion; (3) la re-cuantizacion por parte de peculiar-ragdoll con el cuantizador oQ4e de oMLX, usando una matriz de importancia (imatrix) y un corpus de calibracion ponderado hacia ciberseguridad, ademas de la aplicacion de una plantilla de chat propia ("Sharp"). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original ni si se emplearon tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento y resolucion de problemas de codigo en entornos agenticos (el autor lo posiciona como "agentic coder").
- Capacidades de vision: el pipeline declarado es `image-text-to-text`, por lo que acepta entradas de imagen junto con texto.
- Decodificacion especulativa mediante cabeza MTP entrenada, con aceleracion de generacion en runtimes compatibles.
- Comportamiento abliterated: ausencia de rechazos ante peticiones que otros modelos declinarian, incluida tematica de seguridad ofensiva.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidad de agente multi-paso: inferida del uso declarado en SWE-bench-Live (resolucion autonoma de issues en repositorios), aunque sin documentacion tecnica detallada.
- Plantilla de chat propia ("Sharp chat template") publicada como repositorio independiente.

## Casos de uso

- Resolucion autonoma de issues en repositorios grandes: el modelo esta evaluado en SWE-bench-Live, que mide la capacidad de corregir bugs reales en codebases con tests de regresion ocultos. Su naturaleza MoE con ~3B activos permite iterar sobre parches a un coste por token bajo, adecuado para bucles de agente largos.
- Desarrollo asistido en local sobre Apple Silicon: con ~22 GB en 4 bits, se puede ejecutar en un Mac con memoria unificada de 32 GB o superior mediante oMLX, sin necesidad de GPU dedicada ni de enviar codigo propietario a la nube.
- Auditoria de seguridad ofensiva y pentesting autorizado: el autor reporta 15 de 43 retos CTF resueltos en Cybench sin guia ni juez, lo que lo hace util para tareas de reconocimiento, analisis de vulnerabilidades y explotacion en entornos de laboratorio controlados.
- Generacion de codigo en pipelines internos: al estar abliterated, evita rechazos en dominios duales (cifrado, ingenieria inversa, herramientas de red) donde modelos censurados interrumpen el flujo; requiere sandboxing y supervision.
- Prototipado rapido de agentes con entrada visual: al aceptar image-text-to-text, permite construir asistentes que razonan sobre capturas de pantalla, diagramas de arquitectura o interfaces para generar codigo asociado.
- Investigacion sobre alineacion y abliteration: sirve como sujeto de estudio para medir como la eliminacion de rechazos afecta a la utilidad en tareas tecnicas y a la tasa de respuestas daninas (HarmBench, 0% de rechazos en 84 peticiones segun el autor).
- Evaluacion comparativa de cuantizadores: la existencia de builds paralelas (oQ4e, oQ6e, GGUF UD-Q4_K_M, con y sin MTP) permite estudiar el impacto del esquema de cuantizacion en tareas de codigo.

## Benchmarks y rendimiento

El autor publica resultados medidos sobre la build GGUF en `UD-Q4_K_M`, no sobre este fichero MLX:

| Benchmark | Resultado reportado |
|---|---|
| SWE-bench-Live (problemas resueltos) | Aproximadamente un 70% mas de problemas resueltos que Ornith-1.5 y Qwen3.6-35B-A3B |
| SWE-bench-Live (tiempo por resolucion) | Resoluciones de codigo agentico 3-4 veces mas rapidas que un modelo denso 3.8-27B |
| Cybench (unguided, sin pistas ni juez) | 15 de 43 flags capturadas (35%) |
| HarmBench | 0 rechazos en 84 peticiones |

No se publican valores absolutos de MMLU, HumanEval ni GSM8K en la informacion disponible. Las cifras anteriores corresponden al modelo y no deben interpretarse como mediciones de esta build MLX concreta, segun advierte el propio autor.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 22 GB para los pesos en 4 bits; con overhead de contexto y cache KV conviene reservar 26-32 GB de memoria unificada.
- Plataforma objetivo: Apple Silicon exclusivamente (libreria MLX). No es ejecutable en GPU NVIDIA ni AMD mediante este fichero.
- GPU recomendadas: SoCs Apple M-series con al menos 32 GB de memoria unificada (M1/M2/M3/M4 Pro, Max o Ultra). En configuraciones de 24 GB no cabe con margen para contexto largo.
- Cabe en GPU consumer: si, en el sentido de Macs consumer con memoria unificada suficiente; no en GPUs dedicadas de consumo mediante este formato.
- Opciones de despliegue: oMLX es el runtime soportado y validado, incluida la cabeza MTP. LM Studio no es compatible con esta build `-MTP` (genera salida corrupta). Para llama.cpp o LM Studio debe usarse la build GGUF del mismo autor o la build MLX sin MTP.
- Latencia y throughput: no disponibles como cifras absolutas; el autor afirma una ventaja de 3-4x en tiempo de resolucion frente a un denso 3.8-27B en tareas agenticas de codigo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP | 35,95B | ~3B | No disponible | MIT | MLX 4-bit | Abliterated, MTP, solo oMLX |
| Tiel-Coder-35B-A3B-MLX-oQ4e | 35,95B | ~3B | No disponible | MIT | MLX 4-bit | Version censurada del mismo autor, mismo pipeline |
| Ornith-1.5-35B-A3B | 35,95B | ~3B | No disponible | No disponible | No disponible | Modelo base sin abliterar ni re-cuantizar |
| Qwen3.6-35B-A3B | 35B | ~3B | No disponible | No disponible | No disponible | Referencia comparativa citada por el autor en SWE-bench-Live |

No se dispone de datos de contexto ni de benchmarks absolutos de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: elimina deliberadamente los rechazos, incluidos los de contenido potencialmente danino. El autor traslada toda la responsabilidad legal y etica al usuario y exige sandboxing y monitorizacion.
- Incompatibilidad critica con LM Studio: esta build `-MTP` emite tokens aleatorios desde el primer token en el motor MLX de LM Studio. No hay ajuste de configuracion que lo corrija; debe usarse oMLX o la build GGUF.
- Benchmarks no representativos de este fichero: las cifras publicadas corresponden a la build GGUF con k-quants, no al cuantizador oQ4e de este repositorio.
- Sesgos: no documentados por el autor; al derivar de un modelo entrenado principalmente en ingles y chino, es esperable un sesgo linguistico y cultural hacia esos idiomas.
- Riesgo de alucinacion: no cuantificado; en tareas de seguridad ofensiva puede generar exploits o comandos plausibles pero incorrectos, con riesgo operativo si se ejecutan sin revision.
- Limitaciones de idioma: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la longitud de ventana no se especifica en la model card, lo que impide planificar cargas de trabajo con documentos largos.
- Cadena de derivacion de terceros: tres transformaciones sucesivas (Ornith-1.5 → abliteration de huihui-ai → re-cuantizacion) sin evaluacion independiente publicada.
- Licencia MIT declarada, pero la procedencia del modelo base y las condiciones de Ornith-1.5 no se detallan en la informacion disponible; conviene verificar la compatibilidad antes de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e-MTP
- Build MLX sin MTP: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ4e
- Build GGUF: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Version censurada (TielCoder): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo Ornith-1.5 original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
