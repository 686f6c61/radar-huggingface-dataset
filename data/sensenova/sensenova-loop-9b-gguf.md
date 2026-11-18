# sensenova/SenseNova-Loop-9B-GGUF

## Resumen

SenseNova-Loop-9B es un modelo multimodal texto-imagen desarrollado por SenseNova (OpenSenseNova) que explora la eficiencia de parametros mediante una arquitectura de transformer con bucles (looped transformer). El modelo reutiliza los pesos de sus capas intermedias ejecutandolas varias veces, de modo que 32 capas fisicas se convierten en 56 ejecuciones de capa por pase forward, ampliando la profundidad computacional sin incrementar el numero de parametros. Cuenta con aproximadamente 9.200 millones de parametros y combina esta arquitectura con manifold-constrained hyper-connections (mHC) de doble flujo residual.

La version oficial llega tras un Preview publicado el 31 de octubre de 2026 y se distribuye bajo licencia Apache 2.0 en pesos safetensors, AWQ de 4 bits y GGUF. El modelo acepta entradas de texto e imagen y genera texto, con un contexto de entrenamiento extendido hasta 512K tokens y un patron de atencion hibrida que intercala atencion lineal y atencion completa cada cuatro capas. Esta disenado para razonamiento complejo, generacion de codigo, uso de herramientas y tareas multimodales y de analisis de datos.

Su relevancia actual radica en que compite en evaluaciones agenticas y de analisis de datos con modelos notablemente mayores, como Qwen3.8-27B, manteniendo un presupuesto de parametros de 9B y un despliegue de bajo consumo: con pesos de 4 bits y cache KV de 8 bits, la inferencia multimodal a 256K de contexto requiere aproximadamente 15 GiB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer multimodal con mHC de doble flujo y atencion hibrida (lineal + completa cada 4 capas) |
| Parametros totales | 9.200.240.000 (aprox. 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens (entrenamiento); inferencia documentada a 256K |
| Tipos de cuantizacion | AWQ 4 bits oficial, GGUF (repo GGUF), pesos completos safetensors |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, AWQ, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en un decoder transformer con un bloque central compartido que se ejecuta en bucle: 24 capas decoder se ejecutan dos veces en secuencia, produciendo 56 computos de capa a partir de 32 capas fisicas distintas por pase forward. Sobre esta estructura se anade el modulo mHC (manifold-constrained hyper-connections) de dos flujos residuales, que mediante transformaciones aprendidas enruta y combina informacion entre ambos flujos dentro del bloque en bucle. La atencion es hibrida: intercala atencion lineal y atencion completa en un patron repetido de cuatro capas.

La receta de entrenamiento es multimodal de contexto largo e incluye texto, imagenes, codigo y trayectorias de uso de herramientas, con la longitud de contexto extendida hasta 512K tokens. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovacion principal es el reciclado de pesos por bucle para ganar profundidad computacional con un presupuesto de parametros reducido, junto con el diseno de bajo consumo de memoria para contexto largo.

## Capacidades

- Generacion de texto y razonamiento multi-paso en tareas complejas.
- Comprension de imagenes (pipeline image-text-to-text): acepta texto e imagenes y genera texto.
- Generacion de codigo, incluyendo tareas de conversion de lenguaje natural a repositorio (NL2Repo).
- Uso de herramientas y function calling, con entrenamiento sobre trayectorias de tool use.
- Capacidades agenticas: evaluado en AutomationBench, Terminal-Bench 2.1 y GAIA.
- Analisis de datos y consultas SQL (evaluado en AIDABench y BIRD).
- Comprension de contexto largo, hasta 512K tokens en entrenamiento.
- Capacidades multilingues limitadas a ingles y chino.
- Generacion de artefactos visuales y web en los ejemplos de la model card (escenas 3D, SVG, webs interactivas, posters).

## Casos de uso

- Agentes autonomos de automatizacion: el modelo puede ejecutar tareas multi-paso con tool calling y ha sido evaluado en AutomationBench (36,67), lo que lo hace adecuado para orquestar flujos de trabajo con llamadas a herramientas.
- Asistencia en terminal y operaciones de sistema: con 59,55 en Terminal-Bench 2.1, puede integrarse en entornos de linea de comandos para tareas de administracion y scripting guiadas por lenguaje natural.
- Analisis de datos y generacion de SQL: su puntuacion de 72,34 en BIRD y 65,31 en AIDABench lo orientan a la traduccion de preguntas de negocio a consultas SQL y a la interpretacion de resultados sobre bases de datos.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD para tareas de refactorizacion, generacion de tests o conversion de especificaciones a repositorios (NL2Repo, 41,36).
- Procesamiento de documentos largos con imagenes: gracias al contexto de hasta 512K tokens y a la entrada multimodal, sirve para resumir y extraer informacion de informes, contratos o manuales que combinan texto y figuras.
- Generacion de interfaces y contenido web: los ejemplos de la model card incluyen webs interactivas, SVG, posters y escenas 3D, utiles para prototipado rapido de front-end y material de diseno.
- Despliegue en hardware limitado: con la version AWQ de 4 bits y cache KV de 8 bits cabe en aproximadamente 15 GiB de VRAM a 256K de contexto, lo que permite servir asistencia multimodal en una unica GPU de gama alta de consumo o profesional.

## Benchmarks y rendimiento

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | no disponible |
| GAIA | 69,90 | 37,86 | no disponible |
| NL2Repo | 41,36 | no disponible | 44,60 |
| AIDABench | 65,31 | no disponible | 65,01 |
| BIRD | 72,34 | no disponible | no disponible |

La model card indica que la version oficial supera al Preview en los siete benchmarks evaluados, aunque solo se detallan explicitamente las cifras de AutomationBench, Terminal-Bench 2.1 y GAIA. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15 GiB para inferencia multimodal con pesos de 4 bits y cache KV de 8 bits a 256K de contexto.
- Pesos completos en safetensors: el repo GGUF ocupa 41,6 GB, lo que da una idea del espacio en disco necesario para las distintas cuantizaciones.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por el perfil de memoria, una GPU con 16-24 GB (por ejemplo, RTX 4090 o A10G) seria suficiente para la version AWQ a contextos largos, y A100/H100 para pesos completos o mayor concurrencia.
- Cabe en GPU de consumo: si, con la cuantizacion AWQ de 4 bits y contexto moderado.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp/Ollama mediante GGUF, vLLM u otros servidores compatibles con endpoints (tag endpoints_compatible); requiere custom_code.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AutomationBench | AIDABench | NL2Repo | Licencia |
|---|---|---|---|---|---|---|
| SenseNova-Loop-9B | 9B | 512K | 36,67 | 65,31 | 41,36 | Apache 2.0 |
| Qwen3.8-27B | 27B | no disponible | 36,67 | 65,01 | 44,60 | no disponible |
| SenseNova-Loop-9B-Preview | 9B | no disponible | 14,33 | no disponible | no disponible | Apache 2.0 |

La comparativa directa publicada por el autor se limita a Qwen3.8-27B y al Preview. No se dispone de datos de otros modelos multimodales de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto de inferencia: aunque el entrenamiento llega a 512K, la cifra de memoria de 15 GiB se refiere a 256K; contextos mayores incrementaran la VRAM necesaria.
- Alucinacion: no se documentan tasas de alucinacion ni mitigaciones especificas; como en cualquier LLM, requiere verificacion en produccion.
- Sesgos: la model card no detalla analisis de sesgos ni composicion del dataset de entrenamiento.
- Dependencia de codigo personalizado: el tag custom_code implica que la carga requiere el codigo del repositorio (arquitectura sensenova_loop), lo que puede complicar la integracion con herramientas que no lo soporten.
- Cifras de benchmarks: parte de los resultados solo se presentan en graficos; conviene validar el rendimiento en el dominio propio antes de adoptarlo.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Version Preview: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Version AWQ: https://huggingface.co/sensenova/SenseNova-Loop-9B-AWQ
- ModelScope: https://modelscope.cn/models/sensenova/SenseNova-Loop-9B
- ModelScope Preview: https://modelscope.cn/models/SenseNova/SenseNova-Loop-9B-Preview
- Repositorio GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia en GitHub: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Configuracion de arquitectura: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview/blob/main/config.json
- Discord: https://discord.com/invite/BuTXPHmQub
