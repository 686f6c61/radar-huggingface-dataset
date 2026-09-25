# mradermacher/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-i1-GGUF

# Ficha tecnica: Firefly v6 dontdownload stillonprogress i1 gguf

## Resumen

Este repositorio no contiene un modelo entrenado, sino un conjunto de cuantizaciones GGUF publicadas por el usuario mradermacher sobre el modelo base `Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS`. mradermacher actua como cuantizador: toma pesos en formato HuggingFace y los convierte a GGUF con tecnicas de imatrix/weighted quantization para su uso en llama.cpp y derivados. El modelo original, segun las etiquetas de la model card, es un ajuste fino conversacional orientado a tool use y roleplay, entrenado con Axolotl y etiquetado como `gemma4`, lo que sugiere una arquitectura de la familia Gemma.

El estado del repositorio es incompleto y practicamente vacio: el tamano declarado es de 0,0 GB, no acumula descargas ni interacciones y la unica entrada de la tabla de ficheros es el fichero `imatrix.gguf` de 0,1 GB, que no es un modelo utilizable sino una matriz de importancia para generar cuantizaciones. La propia model card lista una bateria prevista de cuantizaciones (Q2_K, IQ3_M, Q4_K_M, Q6_K, IQ1_S, etc.), pero ninguna aparece publicada en este repositorio. El sufijo del nombre del modelo base, `DONTDOWNLOAD-STILLONPROGRESS`, es una advertencia explicita del autor original de que el trabajo no esta terminado.

Por tanto, su relevancia practica actual es nula para produccion: no hay pesos descargables, no hay licencia declarada y no hay benchmarks. Si resulta de interes como documentacion, lo es unicamente como caso de estudio de un repositorio de cuantizacion publicado antes de completarse, y como punto de entrada al repositorio estatico hermano (`Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-GGUF`), donde el autor indica que residirian los ficheros estaticos y los posibles ficheros `mmproj` de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` en la model card; no confirmada por documentacion tecnica) |
| Parametros totales | 694.291 segun metadatos safetensors (dato no fiable: resulta inconsistente con un modelo conversacional transformer) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Previstos en la model card: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. Publicados en este repositorio: ninguno (solo el fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizacion); el modelo base se distribuye en formato HuggingFace/transformers |
| Tamano del repositorio | 0,0 GB |
| Fichero incluido | `Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS.imatrix.gguf` (0,1 GB), tipo imatrix, no es un modelo ejecutable |
| Libreria declarada | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base. La etiqueta `gemma4` sugiere que el ajuste fino parte de un modelo de la familia Gemma, y la presencia de `axolotl` indica que el entrenamiento se realizo con ese framework de fine-tuning, pero no se documenta numero de capas, dimension de embeddings, mecanismo de atencion ni variantes (por ejemplo, atencion local/global o capas alternas). Tampoco se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF, DPO o preferencia posterior al SFT.

Los datasets declarados en la model card son `openbmb/UltraData-SFT-Agent-2609`, `oyc502/RoleMRC`, `HuggingFaceH4/no_robots` y `HuggingFaceTB/everyday-conversations-llama3.1-2k`. La combinacion apunta a un SFT orientado a tres ejes: capacidades de agente y uso de herramientas, datos de rol y conversacion, y dialogos cotidianos. La model card del repositorio de cuantizacion tambien afirma que se trata de un modelo de vision, indicando que los ficheros `mmproj` estarian en el repositorio estatico; este extremo no se puede verificar con la informacion disponible. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, SSM hibrida, etc.).

## Capacidades

Todas las capacidades siguientes estan declaradas unicamente a traves de las etiquetas de la model card y no han podido verificarse, ya que no hay pesos publicados en este repositorio:

- Generacion de texto conversacional en ingles.
- Tool use / function calling (etiqueta `tool-use`), orientado a flujos de agente.
- Roleplay y dialogo con personajes (etiqueta `roleplay`).
- Entrenamiento con datos de agente (`openbmb/UltraData-SFT-Agent-2609`), lo que sugiere razonamiento multi-paso con herramientas, sin datos publicados que lo confirmen.
- Vision: la model card afirma que es un modelo de vision, con ficheros `mmproj` ubicados en el repositorio estatico hermano. Capacidad no verificable con los ficheros de este repositorio.
- Multilingue: no. Solo se declara `en`.
- Modo de razonamiento explicito (thinking) o soporte de audio: no disponible.

## Casos de uso

Advertencia previa: este repositorio no contiene pesos ejecutables, por lo que ninguno de los casos siguientes es aplicable hoy con este artefacto. Se describen como escenarios plausibles del modelo base si este llegase a publicarse completo.

- Asistentes conversacionales en ingles: el ajuste esta entrenado sobre dialogos cotidianos (`everyday-conversations-llama3.1-2k`), por lo que encajaria en chatbots de soporte generalista donde se prioriza naturalidad conversacional sobre conocimiento especializado.
- Agentes con uso de herramientas: la inclusion de `UltraData-SFT-Agent-2609` y la etiqueta `tool-use` lo orientan a invocar funciones (APIs, busqueda, calculadora) dentro de bucles de razonamiento multi-paso controlados por un orquestador externo.
- Roleplay y entretenimiento: el dataset `RoleMRC` y la etiqueta `roleplay` lo situan en aplicaciones de personajes interactivos, ficcion conversacional o entrenamiento de guiones, donde el objetivo es mantener consistencia de personaje en turnos largos.
- Generacion de respuestas con formato controlado: el dataset `no_robots` aporta pares instruccion-respuesta de alta calidad; es util para tareas de reescritura, resumen y clasificacion con salida estructurada, siempre que se valide el formato de forma programatica.
- Prototipado rapido de pipelines de agentes: como modelo pequeno (si el recuento de parametros reportado fuese real), permitiria iterar localmente en la logica de orquestacion de herramientas antes de escalar a un modelo mayor.
- Evaluacion comparativa de tecnicas de cuantizacion: el fichero imatrix incluido sirve para que un tercero genere sus propias cuantizaciones ponderadas y mida la degradacion de perplejidad entre tipos de quant, no para inferencia directa.
- Modelo de vision en pipelines multimodales: solo si se confirma y se publica el fichero `mmproj`, se podria usar para tareas de descripcion de imagen o VQA dentro de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, no aporta curvas de perplejidad comparativas entre cuantizaciones y no registra ningun uso (0 descargas) del que extraer datos empiricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se puede calcular sin un recuento de parametros fiable ni sin pesos publicados.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable. Si el dato de 694.291 parametros de los metadatos safetensors fuese correcto en su lectura literal (cientos de miles de parametros), el modelo cabria en CPU y en cualquier GPU; si el ajuste fuese un transformer de miles de millones de parametros, el requisito seria muy distinto. La discrepancia entre ambas lecturas impide dar una cifra.
- Opciones de despliegue: al ser un repositorio GGUF, el destino previsto es `llama.cpp` y sus envoltorios (Ollama, LM Studio, servidores compatibles con la API de llama.cpp). vLLM y TGI no consumen GGUF directamente. En cualquier caso, no hay pesos en este repositorio para desplegar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No hay datos publicados de parametros, contexto, rendimiento o licencia para este modelo, y la busqueda web no ha devuelto alternativas directamente comparables. Los unicos artefactos relacionados localizados son del mismo cuantizador y del mismo linaje, no alternativas de mercado:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-i1-GGUF (este repositorio) | Cuantizacion imatrix | no disponible (metadato no fiable) | no disponible | no disponible | Solo fichero imatrix (0,1 GB); sin pesos |
| Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-GGUF | Repositorio estatico hermano del mismo cuantizador | no disponible | no disponible | no disponible | No verificado en esta busqueda |
| Firefly-v5-alpha-v2-GGUF | Version anterior del mismo linaje, mismo cuantizador | no disponible | no disponible | no disponible | Publicado |
| Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS | Modelo base en formato HuggingFace | no disponible | no disponible | no disponible | Marcado por el autor como no descargable y en progreso |

## Limitaciones y advertencias

- El repositorio no contiene pesos utilizables: solo el fichero imatrix de 0,1 GB. Cualquier intento de cargarlo con llama.cpp, Ollama o LM Studio fallara.
- El propio nombre del modelo base incluye `DONTDOWNLOAD` y `STILLONPROGRESS`, es decir, el autor original desaconseja su descarga por tratarse de un trabajo sin terminar.
- La model card lista cuantizaciones previstas que no estan publicadas; no debe asumirse que existan.
- No hay licencia declarada, ni en el repositorio de cuantizacion ni (segun la informacion disponible) en el modelo base. Sin licencia explicita no hay autorizacion clara para uso comercial; conviene tratar el artefacto como no licenciado y contactar con el autor antes de cualquier uso.
- El recuento de parametros reportado en los metadatos safetensors (694.291) es incompatible con un modelo conversacional transformer de la familia Gemma, por lo que no debe usarse para dimensionar hardware ni para estimar costes.
- Riesgo de alucinacion, sesgos y comportamiento en produccion: no evaluables sin pesos ni evaluaciones publicadas.
- Idioma: solo se declara ingles. No hay soporte multilingue documentado, por lo que no es adecuado para productos en castellano.
- El repositorio registra 0 descargas y 0 interacciones, sin comunidad que haya validado su comportamiento.
- Las afirmaciones de vision y de soporte de tool use provienen unicamente de etiquetas y notas de la model card, sin evidencia reproducible en este repositorio.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-i1-GGUF
- Repositorio estatico hermano citado en la model card: https://huggingface.co/mradermacher/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-GGUF
- Modelo base: https://huggingface.co/Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS
- Version anterior del mismo linaje: https://huggingface.co/mradermacher/Firefly-v5-alpha-v2-GGUF
- Pagina de resumen y descargas del cuantizador para este modelo: https://hf.tst.eu/model#Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-i1-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones (referencia citada por el autor): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset: https://huggingface.co/datasets/oyc502/RoleMRC
- Dataset: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Dataset: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
