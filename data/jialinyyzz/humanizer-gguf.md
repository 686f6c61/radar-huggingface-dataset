# jialinyyzz/humanizer-GGUF

## Resumen

humanizer 12B es un modelo de reescritura de textos orientado a eliminar las marcas de estilo típicas de los borradores generados por IA. Lo desarrolla el usuario jialinyyzz y esta ficha cubre el repositorio **jialinyyzz/humanizer-GGUF**, que contiene las cuantizaciones en formato GGUF del modelo base `jialinyyzz/humanizer` (version v2). El objetivo declarado es reescribir borradores en ingles y chino para que lean como escritos por una persona, preservando cada numero, fecha, nombre y cita del original.

El modelo base tiene 11.907.350.576 parametros (etiquetado comercialmente como 12B) y se distribuye unicamente como GGUF para llama.cpp, con variantes desde bf16 (23,8 GB) hasta 2 bits (3,9 GB). La relevancia de este repositorio esta en su pipeline de cuantizacion: los archivos de 2 bits, Q3 y Q4_K_M incorporan entrenamiento consciente de la cuantizacion (quantization-aware training) y destilacion desde los pesos bf16 usados como profesor, de modo que se acercan mas al modelo completo que una cuantizacion estandar de llama.cpp del mismo tamano.

El autor reporta que el 95% de las reescrituras en ingles fueron clasificadas como humanas por Originality.ai en su ajuste mas estricto, y que no se uso ningun detector de IA durante el entrenamiento. Los datos de evaluacion son internos del autor, no verificaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la etiqueta del repositorio indica `gemma4`; la model card no detalla la arquitectura) |
| Parametros totales | 11.907.350.576 (aproximadamente 11,9 B; etiquetado como 12B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (la aplicacion de escritorio del autor opera con 8.192 tokens de contexto) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q4_K_M, IQ3_XXS-QAT (Q3), IQ2_XS-QAT (2 bits) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base de referencia usa safetensors |

## Arquitectura y entrenamiento

No se documenta en la model card la arquitectura interna del modelo base, mas alla de la etiqueta `gemma4` del repositorio, que apunta a la familia Gemma 4. El dato de parametros (11.907.350.576) procede de los safetensors del modelo base. El modelo esta especializado en una unica tarea: reescritura de borradores con preservacion de entidades (numeros, fechas, nombres y citas). Los idiomas de entrenamiento declarados son ingles y chino.

El repositorio GGUF no contiene un modelo nuevo, sino cuantizaciones. Para los archivos de 2 bits y Q3, el autor midio la sensibilidad de cada tensor de pesos al ser comprimido y asigno mas bits a los tensores sensibles y menos a los robustos (precision mixta con matriz de importancia, `imatrix`). Los tres archivos de menor tamano (2 bits, Q3 y Q4_K_M) se entrenaron capa por capa para reproducir el modelo completo y se destilaron desde los pesos bf16 usados como profesor, sobre datos de reescritura en ingles y chino. Q6_K y Q8_0 son builds estandar de llama.cpp, porque a esos tamanos el margen de recuperacion es minimo. Segun el autor, en el archivo de 2 bits una build estandar del mismo tamano coincide con bf16 en el siguiente token el 70% de las veces, frente al 87% que se alcanza tras estos pasos (81% y 85% en etapas intermedias). No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Reescritura de texto generado por IA para que se lea como escritura humana, en ingles y chino.
- Preservacion de entidades factuales: numeros, fechas, nombres y citas se mantienen en la reescritura, con validacion mediante un juez LLM estricto.
- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Ejecucion local mediante llama.cpp, con plantilla de chat disponible o fichero `prompt_format.json` que contiene la instruccion y el separador de forma literal.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite exposicion como API compatible con el servidor de llama.cpp.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Publicacion de contenido editorial: reescribir borradores generados con un LLM antes de publicarlos en blogs o webs corporativas, manteniendo cifras y citas verificables gracias a la preservacion de entidades.
- Flujos de marketing y copywriting: adaptar textos promocionales para que no arrastren el registro repetitivo tipico de la generacion automatica, con la ventaja de poder ejecutarse en local y no exponer el material a servicios de terceros.
- Redaccion bilingue ingles-chino: equipos que producen la misma pieza en ambos idiomas pueden pasar los borradores por el modelo sin cambiar de herramienta ni de infraestructura.
- Integracion en pipelines de contenido: el modelo se sirve con `llama-server` y puede encadenarse a un CMS o a un CI/CD que reescriba textos de forma automatica antes del commit o de la publicacion.
- Procesamiento con requisitos de privacidad: al distribuirse en GGUF y ejecutarse con llama.cpp en un equipo de escritorio (aplicacion para Mac y Windows), es apto para organizaciones que no pueden enviar documentos a APIs externas.
- Revision de documentacion tecnica: reescritura de informes y manuales donde es critico que no se alteren cifras ni referencias, con la advertencia de que en los archivos de 2 y 3 bits conviene revisar numeros y nombres.
- Despliegue en hardware modesto: con el archivo de 2 bits (3,9 GB) puede ejecutarse en equipos de 8 GB de memoria, lo que abre el caso de uso de reescritura local en portatiles sin GPU dedicada.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Deteccion de IA (Originality.ai, ajuste mas estricto) | 210 borradores en ingles, pesos bf16, 2026-10-02 | 11 de 210 marcados como IA (95% juzgados humanos) |
| Deteccion de IA, release anterior | 210 borradores en ingles | 26 de 210 marcados como IA |
| Deteccion de IA en el subconjunto de 60 borradores | IQ2_XS-QAT (2 bits) | 0 de 60 marcados |
| Deteccion de IA en el subconjunto de 60 borradores | Q8_0 | 7 de 60 marcados |
| Deteccion de IA en el subconjunto de 60 borradores | bf16 | 4 de 60 marcados |
| Juicio factual por LLM estricto | 420 reescrituras en ingles sobre Q8_0 (210 borradores, dos muestras cada uno) | 376 sin problema factual (89,5%); de los fallos detectados, mas de 9 de cada 10 se corrigen con una sola palabra o frase |

Concordancia Top-1 con bf16 (el token mas probable coincide con el de bf16), medida sobre aproximadamente 30.700 tokens reservados por idioma, con recuento de tokens equilibrado entre ingles y chino y promediado:

| Archivo | Tamano | Top-1 vs. bf16 |
|---|---|---|
| humanizer-12b-bf16.gguf | 23,8 GB | 100% (referencia) |
| humanizer-12b-Q8_0.gguf | 12,7 GB | 98,4% |
| humanizer-12b-Q6_K.gguf | 10,0 GB | 97,7% |
| humanizer-12b-Q4_K_M.gguf | 7,6 GB | 95,2% |
| humanizer-12b-IQ3_XXS-QAT.gguf | 5,6 GB | 93,1% |
| humanizer-12b-IQ2_XS-QAT.gguf | 3,9 GB | 87,4% |

No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no se han localizado evaluaciones independientes.

## Requisitos de hardware

- Memoria pico medida con `llama-server` (Metal) en un M5 Max con los ajustes de la aplicacion (contexto de 8.192 tokens, una peticion simultanea), mientras reescribe:
  - IQ2_XS-QAT (2 bits): archivo de 3,9 GB, 6,2 GB de pico.
  - IQ3_XXS-QAT (Q3): archivo de 5,6 GB, 8,0 GB de pico.
  - Q4_K_M: archivo de 7,6 GB, 10,0 GB de pico.
  - Q6_K: archivo de 10,0 GB, aproximadamente 11,0 GB de pico (estimado).
  - Q8_0: archivo de 12,7 GB, 13,7 GB de pico.
  - bf16: archivo de 23,8 GB, aproximadamente 24,8 GB de pico (estimado).
- Cabe en GPU de consumo: el archivo de 2 bits (3,9 GB) en GPUs de 8 GB, el Q3 (5,6 GB) en 12 GB, el Q4_K_M (7,6 GB) en torno a 14 GB y el Q6_K (10,0 GB) en 16 GB. Configuraciones de 24 GB o mas pueden alojar Q8_0 y, con holgura limitada, bf16.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; las mediciones del autor corresponden a Apple Silicon (M5 Max con Metal). Para despliegue en servidor se asume cualquier GPU con VRAM suficiente para el archivo elegido.
- Opciones de despliegue: llama.cpp (`llama-server`), cualquier runtime GGUF reciente. El repositorio es compatible con endpoints. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor indica una peticion simultanea en la configuracion medida y recomienda dejar unos 4 GB libres de sistema.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de reescritura comparables en la informacion proporcionada. La comparacion posible es interna, frente al modelo de referencia y frente a cuantizaciones estandar de llama.cpp del mismo tamano:

| Alternativa | Parametros | Contexto | Concordancia Top-1 vs. bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| humanizer 12B (bf16, referencia) | 11,9 B | no disponible | 100% | apache-2.0 | GGUF en este repositorio |
| humanizer 12B (Q8_0) | 11,9 B | no disponible | 98,4% | apache-2.0 | GGUF en este repositorio |
| humanizer 12B (2 bits, QAT + destilado) | 11,9 B | no disponible | 87,4% a 3,9 GB | apache-2.0 | GGUF en este repositorio |
| Cuantizacion estandar de llama.cpp de 2 bits, mismo tamano | 11,9 B | no disponible | 70% | apache-2.0 (del modelo base) | build estandar |

Modelos comparables de terceros: no disponible.

## Limitaciones y advertencias

- Solo soporta ingles y chino; no hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de error factual: en la evaluacion del propio autor, 44 de 420 reescrituras en ingles (10,5%) presentaron algun problema factual segun un juez LLM estricto.
- Los archivos de 2 bits y Q3 acumulan mas deslices factuales en ingles; el autor recomienda revisar explicitamente numeros y nombres al usarlos.
- El archivo de 2 bits obtiene la mejor puntuacion frente a detectores de IA (0 de 60 marcados) pero la peor fidelidad frente a bf16 (87,4% de concordancia Top-1), es decir, la maxima "humanizacion" coincide con la minima fidelidad.
- Longitud de contexto no documentada: la aplicacion del autor trabaja con 8.192 tokens, pero no se confirma que sea el limite del modelo.
- Sesgos conocidos: no disponibles; la model card no incluye analisis de sesgo.
- Los resultados publicados son autoevaluaciones del autor (Originality.ai y un juez LLM no especificado), no verificaciones independientes; deben tratarse con cautela.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base `jialinyyzz/humanizer` antes de un despliegue en produccion.
- Modelo de tarea unica: no es un asistente generalista y no se documentan capacidades de razonamiento, codigo, matematicas, tool calling ni agentes.
- El repositorio ocupa 63,6 GB en total, aunque cada archivo se descarga por separado.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/jialinyyzz/humanizer-GGUF
- Modelo base: https://huggingface.co/jialinyyzz/humanizer
- Detalles de evaluacion del modelo base: https://huggingface.co/jialinyyzz/humanizer#evaluation-details
- Aplicacion de escritorio (Mac, Windows): https://github.com/sgaofen/humanizer-local-model/releases/latest
- Repositorio GitHub del proyecto: https://github.com/sgaofen/humanizer-local-model
- Documentacion de cuantizacion: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md
- Datos de concordancia Top-1 (`quant-top1.csv`): https://huggingface.co/jialinyyzz/humanizer-GGUF/blob/main/assets/quant-top1.csv
- Fichero de formato de prompt: https://huggingface.co/jialinyyzz/humanizer-GGUF/blob/main/prompt_format.json
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos no guardan relacion con el contenido solicitado.
