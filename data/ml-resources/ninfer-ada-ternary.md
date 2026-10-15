# ml-resources/ninfer-ada-ternary

## Resumen

ninfer-ada-ternary es un paquete de despliegue publicado en HuggingFace por el usuario ml-resources, que se presenta explicitamente como un espejo (mirror) del repositorio shensanshu/ninfer-ada-ternary alojado en ModelScope. No es una publicacion oficial de los autores originales del modelo ni del motor. Su contenido es un archivo comprimido de aproximadamente 18,4 GiB que incluye los pesos de un modelo ternario de 27B (Bonsai-2-27B, cuantizacion PQ2, en torno a 6,7 GiB), el componente de decodificacion especulativa DFlash2 (unos 9,8 GiB), un motor de inferencia precompilado llamado ninfer y una coleccion de documentos de despliegue, diagnostico y ajuste.

El problema que resuelve es la puesta en marcha de un modelo ternario de gran tamano sin necesidad de compilar el motor ni descargar componentes adicionales: el paquete se define como "offline y autosuficiente", con binarios ya construidos para compute capability 8.9 (serie RTX 40) y 12.0 (serie RTX 50), y con requisitos de memoria que lo situan en tarjetas de 16 GB, o de 12 GB usando un arranque con KV en 4 bits. El contexto declarado en la configuracion por defecto es de 262.144 tokens con KV en fp8.

Su relevancia actual es doble: por un lado, demuestra un flujo de cuantizacion ternaria con decodificacion especulativa que alcanza cifras de decode de 226 t/s en una RTX 4080 SUPER y 353,8 t/s con DFlash2 K=7; por otro, es un ejemplo de distribucion de paquetes "listos para agentes", donde la propia documentacion esta escrita para que un agente automatizado o un operador humano pueda desplegar sin conocimiento previo del motor. La informacion disponible no detalla la arquitectura interna del modelo base ni su composicion de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como modelo ternario Bonsai-2-27B con cuantizacion PQ2; la model card no detalla la arquitectura interna) |
| Parametros totales | 27B (segun la denominacion Bonsai-2-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ctx 262144 con KV en fp8 en la configuracion por defecto) |
| Tipos de cuantizacion | Pesos ternarios PQ2 (aproximadamente 6,7 GiB); KV en fp8 por defecto y variante de KV en 4 bits para tarjetas de 12 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo); el motor ninfer es un fork de desarrollo con sus propios textos de licencia en el directorio licenses/ |
| Formato de pesos | no especificado en la informacion disponible; el repositorio upstream referenciado (prism-ml/Ternary-Bonsai-2-27B-gguf) se distribuye en formato GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del modelo base Bonsai-2-27B: no se indica si es un transformer denso, un MoE, un modelo hibrido ni detalles de atencion. Lo unico verificable es que se distribuye en una representacion ternaria (PQ2) con un peso total de aproximadamente 6,7 GiB, lo que implica una compresion muy agresiva respecto a los 27B nominales, y que el paquete incorpora un componente independiente de decodificacion especulativa denominado DFlash2.

Tampoco hay datos sobre el entrenamiento: numero de tokens, composicion del corpus, fases de ajuste (RLHF, DPO u otras) ni innovaciones de arquitectura. El aspecto tecnico destacable que si documenta la model card esta en el plano de la inferencia: el motor ninfer aplica decodificacion especulativa con DFlash2 en configuraciones K=3 (por defecto, MTP) y K=7 (recomendada para 16 GB o mas), y en la comparativa sin especulacion se miden 63,7 t/s frente a 226,0 t/s con K=3 y 353,8 t/s con K=7 sobre la misma tarjeta. El rendimiento se modela explicitamente como throughput = velocidad de paso x (1 + K x tasa de aceptacion), de modo que la velocidad de paso depende del hardware y la tasa de aceptacion del contenido generado.

## Capacidades

- Generacion de texto autoregresiva en un modelo de 27B cuantizado a ternario, con ventana de contexto de 262.144 tokens.
- Decodificacion especulativa integrada mediante DFlash2, con modos K=3 y K=7 seleccionables.
- Inferencia local completamente offline: el paquete no requiere conexion de red durante el despliegue.
- Compatibilidad con dos perfiles de hardware definidos por compute capability (8.9 y 12.0), con binarios precompilados para cada uno.
- Perfil de memoria reducido: arranque con KV en 4 bits para tarjetas de 12 GB.
- Autodiagnostico del paquete mediante el script `自检-搬家.ps1`, que verifica integridad, rutas y coherencia del manifiesto.
- Posibilidad de recompilar el motor a partir del arbol de fuentes incluido (`src-tree/`) para ajustar constantes SM o aplicar parches de planificacion.
- Soporte de tool calling, function calling, agentes, vision, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Evaluacion de cuantizacion ternaria en local: un equipo de investigacion puede medir la perdida de calidad de un modelo de 27B comprimido a ~6,7 GiB de pesos usando el paquete como base reproducible, comparando contra el modelo sin cuantizar.
- Despliegue de asistente de texto en una estacion de trabajo con RTX 4080 SUPER o RTX 5090: el paquete arranca sin compilacion y ofrece 226 t/s de decode en configuracion por defecto, suficiente para interaccion conversacional fluida en local.
- Procesamiento de documentos largos: con 262.144 tokens de contexto es viable resumir, extraer o consultar expedientes extensos (contratos, informes tecnicos, transcripciones) sin fragmentacion previa.
- Servicio interno de generacion de texto con requisitos de soberania del dato: al funcionar offline y en hardware propio, encaja en entornos donde no se permite enviar texto a APIs externas.
- Banco de pruebas de decodificacion especulativa: permite reproducir las mediciones de aceptacion por tipo de contenido (la model card reporta 353,8 t/s con contenido numerico frente a 112 t/s con prosa) y ajustar K segun la carga.
- Aprovechamiento de GPU de gama alta ya existente: en una RTX 5090 D un colaborador externo midio 512,9 t/s de decode, por lo que el paquete sirve para exprimir tarjetas de 16 GB o mas sin adquirir hardware de datacenter.
- Generacion de codigo en produccion, atencion al cliente automatizada o pipelines de CI/CD: no hay informacion en la model card que confirme capacidades especificas de codigo, tool calling o integracion con herramientas, por lo que no se recomienda asumirlas sin validacion previa.
- Prototipado de agentes que despliegan modelos: la propia estructura del paquete (paginas 00-11 con pasos, resultados esperados y rutas de error) esta pensada para que un agente automatizado ejecute el despliegue sin supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas de calidad equivalentes). Lo unico que aporta la model card son mediciones de throughput y latencia:

| Escenario | Hardware | Decode | Prefill | Observaciones |
|---|---|---|---|---|
| Por defecto (MTP K=3, ctx 262144, KV fp8) | RTX 4080 SUPER | 226,0 t/s | 2.230 t/s | 4.070 tokens con cache fria, TTFT 1,9 s |
| DFlash2 K=7 | RTX 4080 SUPER | 353,8 t/s | 2.230 t/s | Medido sobre contenido numerico |
| Sin decodificacion especulativa | RTX 4080 SUPER | 63,7 t/s | 2.230 t/s | Linea base de control |
| Decode con DFlash2 | RTX 5090 D | 512,9 t/s | no disponible | Medicion de un colaborador externo |

La propia documentacion advierte de que el mismo hardware puede variar hasta tres veces el throughput segun el tipo de contenido (353,8 t/s con numeros frente a 112 t/s con prosa) y que las cifras no son comparables entre tarjetas distintas, porque la velocidad de paso es una propiedad del hardware y la tasa de aceptacion lo es del contenido.

## Requisitos de hardware

- VRAM: pesos del modelo 6,70 GiB y runtime 8,54 GiB, lo que deja la configuracion comoda en tarjetas de 16 GB.
- Tarjetas de 12 GB: soportadas mediante un arranque especifico con KV en 4 bits.
- Compute capability: el runtime solo acepta 8.9 (serie RTX 40) y 12.0 (serie RTX 50). La serie RTX 30 no esta soportada por esta via y el paquete no incluye una compilacion para ella.
- GPU recomendadas segun la informacion disponible: RTX 4080 SUPER (medicion oficial del paquete) y RTX 5090 D (medicion de un colaborador). No hay datos para A100, H100 ni otras GPU de datacenter.
- Espacio en disco: el archivo comprimido ocupa aproximadamente 18,4 GiB, y hay que sumar el espacio de la extraccion.
- Ruta de instalacion: debe ser una ruta puramente ASCII; no se admiten caracteres chinos ni, por extension, rutas no ASCII.
- Opciones de despliegue: motor ninfer precompilado incluido en el paquete. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores.
- Latencia y throughput: prefill de 2.230 t/s con TTFT de 1,9 s en un escenario de 4.070 tokens con cache fria; decode entre 63,7 y 512,9 t/s segun tarjeta, modo de decodificacion especulativa y tipo de contenido.
- Herramienta de validacion de calidad: no incluida. El ejecutable `ninfer-perplexity.exe` debe compilarse por separado siguiendo la pagina 08 del paquete.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa con modelos de otras familias: la informacion proporcionada no incluye parametros, contexto, rendimiento ni licencia de alternativas. La unica comparacion documentada es interna al mismo proyecto, entre las cuatro modalidades de despliegue previstas, de las que este repositorio solo distribuye una:

| Modalidad del proyecto | Incluida en este repositorio | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Extremo rendimiento PQ2 ternario (este paquete) | Si | 27B (pesos ternarios PQ2, ~6,7 GiB) | 262.144 tokens | Apache-2.0 (modelo) | HuggingFace y ModelScope |
| Equilibrada PTQ1 | No | no disponible | no disponible | no disponible | no disponible en este repositorio |
| Memoria muy baja (llama + KVMem) | No | no disponible | no disponible | no disponible | no disponible en este repositorio |
| Ajuste fino Swift | No | no disponible | no disponible | no disponible | no disponible en este repositorio |

## Limitaciones y advertencias

- Es un espejo no oficial: la model card indica explicitamente que no es una publicacion de los autores originales y que todos los creditos corresponden a ellos.
- Compatibilidad de hardware muy restringida: solo compute capability 8.9 y 12.0. Las GPU de la serie RTX 30 y las tarjetas de datacenter habituales quedan fuera de esta via.
- La ruta de instalacion no puede contener caracteres no ASCII; incumplir esta condicion impide el funcionamiento.
- Las cifras de throughput publicadas dependen fuertemente del tipo de contenido generado y no son extrapolables entre tarjetas ni entre tareas.
- No se incluye la herramienta de medicion de perplejidad, de modo que la verificacion de calidad numerica exige compilar el motor por cuenta propia.
- No se incluye el conjunto de 20 preguntas de calidad usado internamente, por lo que la validacion cualitativa no es reproducible con el paquete tal cual.
- El paquete contiene un motor fork de desarrollo ("ninfer dev fork") con modificaciones propias de los empaquetadores en los kernels ternarios y la planificacion; conviene revisar el directorio licenses/ antes de redistribuir o usar en produccion.
- La licencia del modelo se declara Apache-2.0 segun la anotacion del upstream, pero la model card advierte de que, si el upstream aplica condiciones adicionales, prevalecen las de este ultimo.
- No hay informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni comportamiento en dominios sensibles, por lo que no pueden evaluarse los riesgos de calidad asociados.
- La fecha de publicacion que figura en el repositorio (15 de octubre de 2026) y el hecho de que no tenga descargas ni valoraciones implican que se trata de una publicacion sin validacion por parte de la comunidad.
- El SHA256 del archivo principal aparece truncado en la model card y se remite al fichero `SHA256SUMS-DIST.txt` incluido en el paquete; conviene verificar la integridad antes de ejecutar cualquier binario.

## Enlaces

- HuggingFace: https://huggingface.co/ml-resources/ninfer-ada-ternary
- Repositorio original en ModelScope: https://www.modelscope.cn/models/shensanshu/ninfer-ada-ternary
- Modelo upstream de pesos ternarios en formato GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf (referenciado como origen de los pesos, no verificado en la busqueda)
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
