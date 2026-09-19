# elley-ai/elley-1b-v1

## Resumen

Elley Model v1 (elley-ai/elley-1b-v1) es un modelo conversacional de 1.235.814.432 parámetros (1,25B) especializado en acompanamiento sanitario, navegacion de sintomas, memoria de habitos de vida y triaje de seguridad del paciente. Parte del modelo base meta-llama/Llama-3.2-1B-Instruct y ha sido adaptado mediante LoRA sobre las siete matrices de proyeccion, con destilacion desde dos profesores: meta-llama/Llama-3.3-70B-Instruct y deepseek-ai/DeepSeek-V3. El objetivo declarado por el autor es el despliegue fisico en dispositivos Android con 4 GB de RAM o menos (ARM64 Cortex-A76/A55), lo que lo situa en la categoria de asistentes de borde (edge AI) para salud.

El corpus de destilacion es un conjunto auditado de 1.906 escenarios: 1.000 pares abiertos de instruccion/chat, 736 pares de supervision clinica generados por los profesores y 170 pares piloto semilla. El autor afirma una verificacion criptografica de contaminacion cero (0,0% de solapamiento) con el conjunto de evaluacion retenido de 60 escenarios clinicos. Ademas de los pesos, el repositorio incluye el adaptador LoRA completo, el corpus unificado de entrenamiento/validacion y el conjunto de test retenido, lo que permite reproducibilidad total.

Su relevancia actual reside en dos factores concretos: primero, la publicacion de artefactos GGUF cuantizados directamente desde los pesos FP16 maestros sin recuantizacion, con hashes SHA-256 verificables; y segundo, la publicacion de mediciones fisicas sobre hardware real (Motorola Moto G35 5G, Unisoc T760, 3,46 GB de RAM, Android 15) con decodificacion sostenida de al menos 90 segundos, algo poco habitual en modelos de este tamano orientados a salud. La licencia es llama3.2 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de meta-llama/Llama-3.2-1B-Instruct) |
| Parametros totales | 1.235.814.432 (1,25B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base declara 128.000 tokens) |
| Tipos de cuantizacion | F16, Q3_K_M, Q4_K_M, Q5_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (pesos base y adaptador LoRA) y GGUF (llama.cpp) |
| Parametros entrenables (LoRA) | 11.272.192 (0,90% del modelo) |
| Tamano del repositorio | 5,0 GB |
| Fecha de creacion | 2026-09-19 |
| Fecha de actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura es la del transformer decoder-only de Llama 3.2 1B Instruct, sin modificaciones estructurales declaradas. La adaptacion se realizo con LoRA sobre las siete capas de proyeccion (q, k, v, o, gate, up, down) con r=16 y alpha=32, lo que da 11.272.192 parametros entrenables, el 0,90% del total. La pila de entrenamiento fue Unsloth sobre PyTorch 2.5.1 en una unica NVIDIA RTX 3060 Laptop GPU con 6.144 MB de VRAM: 2 epocas, 382 pasos de optimizador, decaimiento coseno de 1,5e-4 a 0 y una perdida de entrenamiento que pasa de 2,2676 a 0,3117. La destilacion se hizo desde Llama-3.3-70B-Instruct y DeepSeek-V3 sobre el corpus de 1.906 escenarios. El autor declara contaminacion cero verificada con el conjunto retenido de 60 escenarios. La cuantizacion se realizo con llama-quantize (build 10549) directamente desde los pesos FP16 maestros, sin recuantizacion, y el repositorio incluye hashes SHA-256 de cada artefacto GGUF, del manifiesto de cuantizacion y de los manifiestos de dataset y profesores. La plantilla de prompt es la de Llama 3 (begin_of_text / start_header_id / eot_id) con un bloque opcional de memoria de usuario ("KNOWN USER MEMORY") integrado en el turno de sistema.

## Capacidades

- Generacion de texto conversacional en ingles con una persona definida: acompanante sanitario "calmado, empatico y conocedor".
- Navegacion de sintomas y triaje de seguridad: el modelo incorpora protocolos estrictos de escalado de emergencia para presentaciones agudas (dolor toracico agudo, anafilaxia, sobredosis y urgencias psiquiatricas).
- Memoria de usuario: la plantilla de sistema incluye un bloque opcional de contexto persistente ("KNOWN USER MEMORY") que permite mantener informacion entre turnos.
- Seguimiento de habitos y estilo de vida: el modelo esta entrenado para acompanamiento de bienestar y seguimiento de rutinas.
- Adherencia a restricciones y formato: el autor declara entrenamiento explicito para respetar limites del usuario e instrucciones de formato.
- Reduccion de "boilerplate": el entrenamiento busca eliminar avisos legales repetitivos y respuestas genericas de asistente.
- Ejecucion en borde: artefactos GGUF desde 658,8 MB aptos para ARM64 y llama.cpp.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado; no hay soporte multilingue documentado.

## Casos de uso

- Acompanamiento sanitario en Android sin conectividad: el modelo esta pensado para ejecutarse en un telefono con 4 GB de RAM o menos mediante llama.cpp; la variante Q3_K_M reproduce 10,85 tok/s con un TTFT medio de 574 ms en un Unisoc T760, lo que permite conversacion interactiva fluida en local y sin enviar datos clinicos a la nube.
- Triaje de urgencias y escalado: dado su entrenamiento con protocolos de emergencia (dolor toracico, anafilaxia, sobredosis, crisis psiquiatrica), puede actuar como primera capa que detecta senales de alarma y dirige al usuario a servicios de emergencia, siempre como capa de cribado y no como diagnostico.
- Seguimiento de habitos y cronicos leves: el bloque de memoria de usuario permite registrar y recordar preferencias, rutinas y contexto declarado por el paciente para sostener conversaciones multi-sesion sobre sueno, dieta o ejercicio.
- Preconsulta y preparacion de citas medicas: el modelo puede ayudar al usuario a ordenar sintomas, cronologia y preguntas antes de acudir a un profesional, generando un resumen estructurado que el paciente lleva a la consulta.
- Educacion sanitaria en entornos con recursos limitados: al caber en 658,8 MB en disco y funcionar sin red, es desplegable en clinicas rurales, kioscos o dispositivos compartidos donde no hay acceso estable a APIs en la nube.
- Asistente integrado en aplicaciones moviles de bienestar: un desarrollador puede empaquetar el GGUF Q3_K_M dentro de una app Android y usarlo como motor conversacional offline, con arranque rapido (TTFT de 574 ms) y sin coste por token.
- Base para pipelines de destilacion e investigacion en IA clinica: el repositorio publica el adaptador LoRA, el corpus de 1.906 escenarios y el test retenido de 60 escenarios, lo que permite reproducir el entrenamiento, auditar la contaminacion o reajustar el dominio a otra especialidad.
- Moderacion de contenido sanitario en foros o chats: puede usarse para reescribir respuestas genericas en un tono mas empatico y para insertar avisos de seguridad cuando se detectan temas de riesgo.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos disponibles son las mediciones fisicas de decodificacion sobre un Motorola Moto G35 5G (Unisoc T760 5G, 3,46 GB de RAM, Android 15) con bucle de decodificacion sostenida de 90 segundos o mas, junto con las metricas internas del autor "Host Quality (Phase H)" y "Safety Benchmark (Phase H)", que no corresponden a benchmarks publicos reconocidos y cuya metodologia no se detalla en la informacion disponible.

| Artefacto | Formato | Tamano | Decodificacion (tok/s) | TTFT medio | Estabilidad sostenida | Host Quality (Phase H) | Safety (Phase H) |
|---|---|---|---|---|---|---|---|
| elley-1b-v1-fp16.gguf | F16 | 2.364,7 MB | No aplica (base maestra) | No aplica | No aplica | 75,1% | 80,0% |
| elley-1b-v1-q3_k_m.gguf | Q3_K_M | 658,8 MB | 10,85 | 574 ms | 0,946 | 77,0% | 90,0% |
| elley-1b-v1-q4_k_m.gguf | Q4_K_M | 770,3 MB | 9,68 | 528 ms | 0,694 | 70,7% | 70,0% |
| elley-1b-v1-q5_k_m.gguf | Q5_K_M | 869,3 MB | 6,67 | 1.266 ms | 0,693 | 77,6% | 80,0% |

La "estabilidad sostenida" se define en la model card como el cociente entre el throughput del checkpoint final y el inicial (1,0 = degradacion termica nula). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM de inferencia: no disponible como cifra explicita. Como referencia, los tamanos de artefacto son 658,8 MB (Q3_K_M), 770,3 MB (Q4_K_M), 869,3 MB (Q5_K_M) y 2.364,7 MB (F16); a esas cifras hay que sumar el espacio de contexto y el runtime de llama.cpp.
- Dispositivo objetivo declarado: Android con 4 GB de RAM o menos, sobre ARM64 Cortex-A76/A55. El benchmark fisico se ejecuto en un Unisoc T760 5G con 3,46 GB de RAM.
- GPU de consumo: no hay requisitos publicados para GPU de escritorio. El fine-tuning LoRA se realizo en una RTX 3060 Laptop de 6.144 MB de VRAM, por lo que el modelo completo en FP16 y el entrenamiento de adaptadores caben en GPUs de gama media con 6-8 GB.
- GPUs profesionales: no aplica en el diseno del modelo; no se documentan despliegues en A100, H100 ni similares.
- Opciones de despliegue: llama.cpp esta confirmado (los GGUF se generaron con llama-quantize build 10549). El repositorio tambien se marca como compatible con endpoints de Hugging Face. Otros runtimes compatibles con GGUF (Ollama, LM Studio, koboldcpp) no se mencionan explicitamente en la model card. Para los pesos safetensors no se documenta soporte de vLLM, TGI u otros servidores.
- Latencia y throughput medidos: 10,85 tok/s y 574 ms de TTFT (Q3_K_M), 9,68 tok/s y 528 ms (Q4_K_M), 6,67 tok/s y 1.266 ms (Q5_K_M) en el Moto G35 5G.
- Consumo termico: la estabilidad sostenida de la variante Q3_K_M es 0,946, frente a 0,694 en Q4_K_M y 0,693 en Q5_K_M, lo que indica que la variante Q3_K_M es la unica que mantiene el rendimiento sin degradacion apreciable bajo carga prolongada en ese dispositivo.

## Comparativa con modelos similares

No se han publicado comparativas de rendimiento con otros modelos en la informacion disponible. La siguiente tabla recoge unicamente datos estructurales verificables; los valores de rendimiento se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Orientacion | Rendimiento comparado |
|---|---|---|---|---|---|
| elley-1b-v1 | 1,25B | No disponible | llama3.2 | Salud / companero movil en ingles | No disponible |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B (aprox.) | 128.000 tokens (documentacion del fabricante) | llama3.2 | Asistente general multilingue | No disponible |
| Qwen2.5-1.5B-Instruct | 1,5B (aprox.) | 32.768 tokens (documentacion del fabricante) | Apache 2.0 (segun fabricante) | Asistente general, multilingue | No disponible |
| Gemma-2-2B-it | 2,6B (aprox.) | 8.192 tokens (documentacion del fabricante) | Gemma (segun fabricante) | Asistente general | No disponible |

Nota: los datos de los modelos alternativos provienen de su documentacion publica, no de la informacion proporcionada en esta ficha; conviene verificarlos antes de usarlos en una decision de produccion. La diferencia mas relevante frente a esas alternativas es la especializacion en salud con escalado de emergencias y el empaquetado GGUF verificado para Android de gama baja; en contrapartida, el soporte se limita al ingles y la licencia llama3.2 impone condiciones de uso adicionales.

## Limitaciones y advertencias

- No es un dispositivo medico de diagnostico: el propio autor lo declara explicitamente. No sustituye la evaluacion clinica, el diagnostico ni la prescripcion de profesionales sanitarios.
- Riesgo de alucinacion: al ser un modelo de 1,25B destilado, la probabilidad de generar informacion clinica incorrecta con apariencia de verosimilitud es alta. Cualquier salida con contenido sanitario debe validarse.
- Idiomas: solo ingles declarado. No hay soporte documentado de castellano ni de otras lenguas, por lo que su uso en Espana requeriria un desarrollo adicional.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, etnicos, de genero o socioeconomicos. El corpus de destilacion procede de profesores (Llama-3.3-70B y DeepSeek-V3) sin auditoria de sesgos publicada.
- Volumen de datos muy reducido: 1.906 escenarios es un corpus pequeno para un dominio de alto riesgo. Las metricas internas "Host Quality" y "Safety" no tienen metodologia publica ni validacion externa.
- Trazabilidad del benchmark: los resultados fisicos corresponden a un unico dispositivo (Motorola Moto G35 5G) y a una unica build de llama.cpp; no hay replicacion en otros SoC.
- Adopcion practicamente nula: 0 descargas y 1 "like" en el momento de la consulta, sin historial de uso en produccion ni validacion por terceros.
- Licencia llama3.2: no es una licencia de codigo abierto plena. Impone condiciones (entre ellas, obligaciones de atribucion, politicas de uso aceptable y clausulas especificas para despliegues a gran escala) que deben revisarse antes de un uso comercial.
- Uso clinico en produccion: dado que no hay certificacion regulatoria (ni CE marcado como producto sanitario ni equivalente), no deberia integrarse en flujos asistenciales sin supervision humana, registro de auditoria y controles de calidad adicionales.
- Contaminacion: la afirmacion de 0,0% de solapamiento con el conjunto retenido es del propio autor; los hashes SHA-256 permiten verificar la integridad de los ficheros, pero no sustituyen una auditoria externa del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elley-ai/elley-1b-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Profesor 1: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Profesor 2: https://huggingface.co/deepseek-ai/DeepSeek-V3
- Paper, blog o repositorio adicional del autor: no disponible en la informacion proporcionada.
- Demo o espacio interactivo: no disponible en la informacion proporcionada.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre elley-ai, elley-1b-v1 ni modelos de acompanamiento sanitario en borde; los resultados obtenidos no guardan relacion con el modelo y se han descartado.
