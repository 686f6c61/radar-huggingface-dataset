# philbert440/Hy4-flash-W4A16-AWQ

## Resumen

Hy4-flash-W4A16-AWQ es una cuantizacion de 4 bits del modelo Tencent Hy4-flash, publicada por el usuario philbert440. Se trata de un checkpoint derivado que parte del modelo base en BF16 de Tencent y de una cuantizacion previa (leoncca/Hy4-flash-AWQ-g32), sobre la que se reajustan los expertos enrutados para reducir la perdida de calidad respecto al original. El resultado es un reemplazo directo del checkpoint de leoncca: mantiene el mismo diseno de ficheros, nombres de tensores, formas, dtypes y cabeceras safetensors, de modo que cualquier motor que cargue el checkpoint original puede cargar este sin cambios.

El modelo tiene 220.251.201.958 parametros totales y un repositorio de 168,5 GB. La nomenclatura "flash" y la presencia de tablas "Engram" y de un "shared expert" apuntan a una arquitectura de tipo mezcla de expertos (MoE) con componentes adicionales, si bien la model card no detalla la arquitectura completa ni la longitud de contexto. La licencia es la tencent-hy-license, que no es de codigo abierto estandar y condiciona el uso comercial.

Su relevancia radica en la mejora medible de calidad frente a la cuantizacion previa: reduce aproximadamente a la mitad la distancia KL al modelo BF16 y eleva la coincidencia top-1 del 92,58 % al 95,16 % en forward FP32 offline, manteniendo el mismo rendimiento en tokens por segundo. Ademas, incluye un sidecar int8 para el motor de inferencia sobre V100, lo que permite ejecutar el modelo en hardware Volta de 32 GB por GPU con decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con expertos enrutados, expertos compartidos y tablas Engram (detalle completo no disponible) |
| Parametros totales | 220.251.201.958 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se valida recuperacion de aguja en 64K) |
| Tipos de cuantizacion | W4A16 (uint4 asimetrico, grupo 32, escalas FP16); expertos compartidos en int8 simetrico; tablas Engram en E4M3 con escalas BF16 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (licencia "other", no estandar de codigo abierto) |
| Formato de pesos | safetensors (layout compatible con leoncca/Hy4-flash-AWQ-g32) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento desde cero. Los expertos enrutados de las capas 1 a 41 se cuantizan en uint4 asimetrico con grupo de tamano 32, puntos cero enteros, escalas FP16 y empaquetado AWQ GEMM. El procedimiento es GPTQ en orden de columna natural, con busqueda de recorte ponderada por diag(H) y amortiguamiento 1e-5; las capas se ajustan en orden y cada una se calibra sobre las salidas de las capas ya cuantizadas por debajo. Las tablas Engram (capas 1, 11, 21 y 31) se recodifican en E4M3 con escalas BF16 por fila, replicando el round trip FP8 de Tencent con un error relativo normado inferior a 6e-15. El experto compartido se mantiene sin cambios en BF16 y se anade como sidecar int8 simetrico para el motor de V100. Atencion, MLP densa, router, normas, embeddings, LM head y drafter permanecen sin modificar respecto a los ficheros de leoncca.

La calibracion emplea 581.183 tokens en ventanas de hasta 2.048 tokens, con esta composicion: 360.270 tokens (62,0 %) de sesiones privadas de asistente de codificacion agentico, saneadas y no publicadas; 72.024 (12,4 %) de Magicoder-OSS-Instruct-75K; 60.514 (10,4 %) del dataset Aya; 48.116 (8,3 %) de Glaive function calling v2; 30.069 (5,2 %) de GSM8K train; y 10.190 (1,8 %) de OASST2 train. El autor declara comprobaciones de privacidad con sondas de pertenencia y de continuacion literal sobre ventanas retenidas disjuntas, sin ganancia detectable (brecha de pertenencia de +0,0007 nats/token y ganancia literal de −0,11 tokens), asi como un escaneo de todos los ficheros publicados sin texto de calibracion, rutas, hostnames ni identificadores.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, tag conversational).
- Razonamiento y matematicas: la calibracion incluye GSM8K y el modelo conserva las capacidades del base Hy4-flash.
- Generacion de codigo: calibrado parcialmente con Magicoder y con sesiones reales de asistente de codificacion agentico.
- Tool calling / function calling: calibrado con Glaive function calling v2; en la evaluacion del autor, 34 de 40 casos estilo OpenAI se resuelven como se espera, identico al checkpoint de referencia.
- Recuperacion de contexto largo: supera 5 de 5 pruebas de aguja en 64K.
- Decodificacion especulativa: incluye el drafter integrado de Tencent, sin modificar, compatible con el motor DFly2.
- Capacidades multilingues: el dataset de calibracion incluye Aya, pero la lista de idiomas soportados no esta publicada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codificacion en produccion: el modelo puede integrarse en IDE o pipelines de CI/CD para autocompletado, revision de parches y generacion de tests, apoyandose en el calibrado con sesiones agenticas reales y en el soporte de tool calling.
- Agentes con llamadas a herramientas: al conservar el comportamiento de function calling del base (34/40 casos correctos), es adecuado para orquestadores que encadenan APIs, busquedas y ejecucion de comandos en varios pasos.
- Analisis de repositorios y documentacion larga: la ventana validada en 64K permite resumir, buscar y responder preguntas sobre ficheros y manuales extensos en una sola pasada.
- Atencion al cliente automatizada: el modelo mantiene conversaciones multi-turno con contexto amplio y puede conectarse a sistemas de ticketing mediante tool calling.
- Razonamiento matematico asistido: util para tutoria, verificacion de calculos y generacion de problemas resueltos, dado el calibrado con GSM8K.
- Despliegue en infraestructura V100 existente: gracias al sidecar int8 y al perfil `fast14`, permite servir el modelo en 4x V100-SXM2-32GB con unos 107 tokens/s por stream y unos 307 tokens/s agregados con 4 streams.
- Sustitucion directa de la cuantizacion previa: cualquier motor que cargue leoncca/Hy4-flash-AWQ-g32 puede adoptar este checkpoint sin cambios de integracion y con menor deriva respecto a BF16.

## Benchmarks y rendimiento

Calidad frente a BF16 (KL en nats y coincidencia top-1, 2.560 posiciones con teacher forcing; intervalos de confianza al 95 % emparejados):

| Prueba | leoncca | Este checkpoint | Diferencia |
|---|---:|---:|---:|
| Forward FP32 offline: KL medio | 0,0849 | 0,0409 | −0,0440 [−0,0598, −0,0306] |
| Forward FP32 offline: KL p95 | 0,398 | 0,201 | no disponible |
| Forward FP32 offline: top-1 | 92,58 % | 95,16 % | +2,58 pp [+1,64, +3,48] |
| Motor V100, 1 stream: KL medio | 0,0930 | 0,0454 | −0,0476 [−0,0631, −0,0342] |
| Motor V100, 1 stream: top-1 | 91,95 % | 94,45 % | +2,50 pp [+1,45, +3,55] |
| Motor V100, 4 streams: KL medio | 0,0948 | 0,0450 | −0,050 (cota agrupada 0,004) |
| Motor V100, 4 streams: top-1 | 92,02 % | 94,47 % | +2,45 pp |
| DFly2, filas de verificacion: KL | no disponible | no disponible | −0,0448 [−0,0593, −0,0323] |
| DFly2, filas de verificacion: top-1 | no disponible | no disponible | +2,03 pp [+1,05, +3,09] |
| Tool calls, 40 casos | 34/40 | 34/40 identico | 0 |
| Recuperacion de aguja 64K | 5/5 | 5/5 | 0 |

Velocidad (4x V100-SXM2-32GB, tensor parallel 4, perfil `fast14`, decodificacion plana en tokens/s):

| Panel | leoncca | Este checkpoint |
|---|---:|---:|
| Semilla, 1 stream | 107,07-108,10 | 107,03-108,09 |
| Semilla, 4 streams (agregado) | 307,05-307,42 | 307,33-307,72 |
| Prompts naturales, 1 stream | 101,72-101,80 | 101,71-101,73 |
| Prompts naturales, 4 streams | 289,22-291,60 | 287,22-288,62 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 168,5 GB (167,3 GB de checkpoint, 0,62 GB de sidecar y 0,62 GB de copia en `shared-w8-cache/`); en cuantizacion W4A16 se requiere del orden de 110-120 GB de memoria para pesos, mas overhead de activaciones y cache KV no cuantificada.
- GPU recomendadas: el autor valida 4x V100-SXM2-32GB con tensor parallel 4; para el modelo completo en una sola maquina hacen falta configuraciones de 4 a 8 GPU de 32-80 GB (A100, H100, L40S).
- No cabe en GPU de consumo: 220.000 millones de parametros en 4 bits superan los 24 GB de una RTX 4090 y los 48 GB de una RTX 6000 Ada; se necesita multi-GPU o descarga a CPU.
- Opciones de despliegue: motor propietario del autor con perfil `fast14` y decodificacion especulativa DFly2 sobre V100; el layout es compatible con el motor que carga leoncca/Hy4-flash-AWQ-g32. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 107 tokens/s por stream y 307 tokens/s agregados con 4 streams en 4x V100 (decodificacion plana); con prompts naturales, 101,7 y 287-291 tokens/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Calidad frente a BF16 |
|---|---:|---|---|---|---|
| philbert440/Hy4-flash-W4A16-AWQ | 220,3 B | no disponible (validado 64K) | safetensors W4A16 | tencent-hy-license | KL 0,0409; top-1 95,16 % |
| leoncca/Hy4-flash-AWQ-g32 | 220,3 B | no disponible | safetensors W4A16 | tencent-hy-license | KL 0,0849; top-1 92,58 % |
| tencent/Hy4-flash (BF16) | 220,3 B | no disponible | safetensors BF16 | tencent-hy-license | referencia |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion de 4 bits: introduce una deriva medible respecto a BF16 (KL medio de 0,0409 y p95 de 0,201 en forward FP32), aunque menor que la del checkpoint de referencia.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de veracidad ni de sesgos.
- La lista de idiomas soportados no esta publicada; el multilingue se infiere solo de la composicion de calibracion (Aya), sin garantias por idioma.
- La longitud de contexto oficial no esta documentada; la validacion de aguja en 64K es una prueba puntual, no una especificacion.
- La licencia tencent-hy-license no es de codigo abierto estandar: revisar condiciones de uso comercial y redistribucion antes de desplegar.
- El sidecar int8 `hy4-v100-shared-w8.safetensors` no figura en el indice; solo lo usan motores que lo cargan explicitamente, y el resto lo ignoran.
- El rendimiento medido se limita a 4x V100-SXM2-32GB con el motor del autor; no hay datos de latencia en A100, H100 ni otras configuraciones.
- El autor declara que las sesiones privadas de calibracion no se publican y que las sondas de privacidad no detectaron fuga, pero esa verificacion es responsabilidad del autor y no es auditable de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philbert440/Hy4-flash-W4A16-AWQ
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Revision base citada: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Cuantizacion de referencia: https://huggingface.co/leoncca/Hy4-flash-AWQ-g32
- Dataset Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset Glaive function calling v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
