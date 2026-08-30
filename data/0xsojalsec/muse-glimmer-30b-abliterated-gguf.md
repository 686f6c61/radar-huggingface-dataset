# 0xSojalSec/Muse-Glimmer-30B-Abliterated-GGUF

## Resumen

Muse-Glimmer-30B-Abliterated-GGUF es una versión cuantizada en formato GGUF del modelo Muse Glimmer 30B de Meta, modificada mediante un proceso de "abliteración" que elimina el comportamiento de rechazo (refusals) de los pesos. El modelo original, desarrollado por Meta Superintelligence Labs, es un modelo agéntico y multimodal de 30B parámetros diseñado para ejecutarse en un solo GPU de consumo o CPU, con licencia Apache-2.0. Esta variante, creada por Blackfrost y publicada en HuggingFace por 0xSojalSec, empaqueta el modelo en una escalera completa de cuantizaciones GGUF (Q2_K a Q8_0) junto con proyectores de visión y un drafter DFlash para decodificación especulativa.

El modelo resuelve el problema de ejecutar un agente local siempre activo con capacidades de tool calling, razonamiento multimodal y ventana de contexto de 131.072 tokens, todo ello en hardware de consumo. Su relevancia radica en que combina la arquitectura densa de 52 capas con atención de ventana deslizante y torre de visión, ofreciendo una alternativa local a modelos propietarios. La versión abliterated, además, elimina los rechazos de contenido, lo que la hace útil para investigación en seguridad y comportamientos de modelo, aunque con advertencias éticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | muse-glimmer (transformer denso, 52 capas, hidden 6656, GQA 32 q / 2 kv, sliding-window attention, torre de vision) |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base en BF16 usa safetensors) |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B de Meta emplea una arquitectura transformer densa con 52 capas, dimensión oculta de 6656, atención con consultas agrupadas (GQA) de 32 cabezas de consulta y 2 de clave/valor, y atención de ventana deslizante. Incluye una torre de visión que permite entrada de imágenes, lo que lo convierte en un modelo multimodal de texto e imagen. El entrenamiento original de Meta se centró en tareas agénticas, tool calling y recuperación ante fallos, aunque no se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible.

La versión abliterated aplica un proceso de modificación de pesos desarrollado por Blackfrost que elimina el comportamiento de rechazo, manteniendo intactas las capacidades multimodales y de razonamiento. El resultado se cuantiza a GGUF para su uso con llama.cpp. Como innovación técnica destacable, el paquete incluye un drafter DFlash para decodificación especulativa, que acelera la generación aproximadamente 1,6 veces sin cambiar la salida, y proyectores de visión en distintas precisiones para habilitar la entrada de imágenes.

## Capacidades

- Generacion de texto y razonamiento multi-step, con salida de razonamiento separada del texto final.
- Entrada multimodal de texto e imagenes mediante la torre de vision y el proyector mmproj.
- Tool calling / function calling nativo, optimizado para agentes que ejecutan acciones externas.
- Soporte para agentes y tareas largas con recuperacion ante fallos, segun la descripcion de Meta.
- Control del nivel de razonamiento mediante la linea de sistema `Reasoning strength: low/medium/high/xhigh`.
- Decodificacion especulativa con DFlash, que comparte contexto con el modelo principal y acelera la inferencia.
- Capacidades multilingues no especificadas en la documentacion disponible.

## Casos de uso

- Agente local siempre activo: el modelo puede ejecutarse en un equipo de consumo con 24 GB de VRAM (cuantizacion Q4_K_M) y gestionar tareas prolongadas con tool calling, gracias a su ventana de 131.072 tokens que permite mantener conversaciones y estados largos sin perder contexto.
- Analisis de documentos con imagen: al cargar el proyector de vision, el modelo puede procesar capturas de pantalla, diagramas o fotografias y extraer informacion estructurada, util para automatizar la revision de informes o facturas.
- Generacion de codigo en pipelines de CI/CD: su soporte nativo de tool calling permite integrarlo en flujos de integracion continua para generar, revisar o parchear codigo, con la ventaja de ejecutarse localmente sin enviar datos a la nube.
- Atencion al cliente automatizada: con 131.072 tokens de contexto, puede gestionar conversaciones multi-turno extensas, recordar interacciones previas y derivar a un humano cuando sea necesario, todo en un despliegue local con llama-server.
- Investigacion en seguridad y alineacion: al estar abliterated (0/450 rechazos en el benchmark R1-HARMFUL-BENCH-450), es util para estudiar como se comporta un modelo sin restricciones de rechazo, analizar sesgos o probar tecnicas de mitigacion.
- Prototipado de agentes multimodales en hardware modesto: con cuantizaciones desde 10 GB (Q2_K) hasta 27,6 GB (Q8_0), permite iterar rapidamente en entornos de desarrollo sin necesidad de infraestructura de servidor, usando llama.cpp o vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento proporcionado es el benchmark de rechazos R1-HARMFUL-BENCH-450, medido sobre el modelo abliterated padre:

| Metrica | Resultado |
|---|---|
| Rechazo verdadero (danino, n=300) | 0 / 300 = 0,0% |
| Rechazo verdadero (total 450) | 0 / 450 = 0,0% |
| Substring-danino | 0 / 300 |
| Substring-total | 2 / 450 (falsos positivos de XSTest) |
| Errores | 0 |

La decodificacion especulativa con DFlash reporta una aceleracion aproximada de 1,6 veces respecto a la generacion sin drafter, manteniendo salidas identicas.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K 10,0 GB, Q3_K_S 11,7 GB, Q3_K_M 12,7 GB, Q4_K_S 15,0 GB, Q4_K_M 15,8 GB, Q5_K_S 18,0 GB, Q5_K_M 18,5 GB, Q6_K 21,3 GB, Q8_0 27,6 GB.
- GPU recomendadas: para Q4_K_M (15,8 GB) cabe en tarjetas de 24 GB como RTX 4090 o RTX 3090; para Q8_0 se necesitan GPUs profesionales como A100 (40/80 GB) o H100.
- Si cabe en GPU de consumo: si, con cuantizaciones Q4_K_M o inferiores en tarjetas de 16-24 GB.
- Opciones de despliegue: llama.cpp (llama-server) con soporte DFlash, vLLM segun NVIDIA NIM, y potencialmente Ollama (no confirmado en la documentacion).
- Latencia y throughput: no disponibles, pero la decodificacion especulativa DFlash ofrece ~1,6x de aceleracion sobre la generacion normal.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Cualitativamente, se puede comparar con el modelo base sin abliterar (meta-models/Muse-Glimmer-30B) y con otros modelos agénticos de tamano similar como Qwen 2.5 32B o Llama 3.1 8B, pero no hay metricas publicadas para establecer una comparacion rigurosa. La principal diferencia frente al modelo base es la eliminacion de rechazos y el empaquetado GGUF con DFlash.

## Limitaciones y advertencias

- Modelo marcado como experimental: se esperan fallos en decodificacion, coherencia, parseo de tool calls y casos limite bajo carga.
- La abliteracion elimina los rechazos de contenido, lo que puede generar respuestas daninas si se usa de forma malintencionada; no es adecuado para despliegues publicos sin salvaguardas adicionales.
- No se han publicado datos sobre sesgos, alucinaciones o rendimiento en idiomas distintos del ingles.
- Requiere llama.cpp b10353 o superior; el drafter DFlash solo funciona con llama-server, no con llama-cli.
- La opcion `--jinja` es obligatoria para el correcto funcionamiento de la plantilla de sistema.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente y poco validada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/Muse-Glimmer-30B-Abliterated-GGUF
- Modelo base de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina oficial de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Repositorio del autor original (Blackfrost): https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-GGUF
