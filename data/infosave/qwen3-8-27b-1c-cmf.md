# infosave/Qwen3.8-27B-1C-cmf

## Resumen

Qwen3.8-27B-1C-cmf es un ajuste fino del modelo base Qwen/Qwen3.8-27B orientado a la generacion de consultas en el lenguaje de consultas de 1C:Enterprise 8, el sistema ERP ruso ampliamente utilizado en el entorno empresarial de Rusia y la CEI. Lo desarrolla el usuario infosave y se distribuye con licencia Apache 2.0. El modelo no reentrena los pesos originales: aplica una "habilidad" (skill) de 4,7 MB consistente en 1,11 millones de multiplicadores escalares, uno por cada neurona FFN de las 64 capas del transformer, insertados en los pesos con el mismo formato de cuantizacion q8_2f.

La relevancia del modelo radica en que el lenguaje de consultas de 1C no es SQL ni un lenguaje de programacion convencional, y los modelos generalistas cometen errores sistematicos de sintaxis (prefijos inexistentes, uso incorrecto de parametros de tablas virtuales, palabras clave de ordenacion equivocadas). El ajuste eleva la tasa de respuestas completamente correctas en dialogos retenidos del 23,0 % al 98,7 % (media por tipo de tarea) y del 33,6 % al 98,0 % sobre el total de dialogos, segun los datos de la model card.

La arquitectura subyacente es la del Qwen3.8-27B (transformer denso de 27 000 millones de parametros), aunque la model card no detalla la longitud de contexto ni la composicion del entrenamiento original. El modelo se ejecuta mediante la libreria y el runtime propietario `cortiq`, no mediante transformers, vLLM o llama.cpp, lo que condiciona fuertemente su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con skill DTG-MA sobre neuronas FFN |
| Parametros totales | 27 000 millones (base); skill de 1,11 millones de multiplicadores (4,7 MB) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_2f (formato propietario de cortiq); pesos distribuidos como `qwen38-27b-1c-q8_2f.cmf` |
| Idiomas soportados | ru, en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cmf` (runtime cortiq); tamano del repo 27,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27 000 millones de parametros del que la model card no aporta detalles adicionales sobre numero de capas, dimension oculta o regimen de atencion. La innovacion tecnica es el metodo DTG-MA (aplicado en el framework cortiq): en lugar de reentrenar pesos, se aprende una mascara multiplicativa sobre las neuronas FFN. Cada una de las 1,11 millones de neuronas (una por cada neurona FFN en las 64 capas) recibe un multiplicador sigma(logit) que escala su columna correspondiente de la matriz `W_down`. Todos los multiplicadores se entrenan simultaneamente por gradiente, y la perdida se calcula unicamente sobre los tokens de la respuesta.

El entrenamiento uso 3068 dialogos de la particion train de un dataset de consultas 1C con taxonomia anotada, proporcionado por Andrey Druzd. Cada ejemplo contiene el esquema de metadatos y la tarea en el mensaje de usuario, y como respuesta una consulta 1C con parametros y explicacion. Se realizaron 6100 pasos (2 epocas), batch 1, fragmentos de 2048 tokens, learning rate 0,02 y logit inicial 4,0. El entrenamiento completo duro 1 h 47 min en una RTX PRO 6000 (0,7-0,9 s por paso, pico de 86,8 GB de memoria), seleccionando el checkpoint del paso 5000 por su precision en dialogos retenidos. El skill se entreno con el system prompt incluido en el repositorio y sin bloque de razonamiento, de ahi la recomendacion de ejecutar con `--system` y `--no-think`.

## Capacidades

- Generacion de consultas en el lenguaje de consultas de 1C:Enterprise 8 a partir de un esquema de metadatos y una tarea descrita en lenguaje natural.
- Razonamiento sobre esquemas de metadatos: identifica objetos, campos, tablas virtuales y relaciones para construir la consulta.
- Explicacion de la solucion: devuelve la respuesta en el formato del dataset, con secciones "Consulta", "Parametros" (con tipos) y "Por que asi".
- Generacion de texto general y codigo heredada del modelo base Qwen3.8-27B.
- Capacidades multilingues en rusо, ingles y chino (idiomas declarados en la model card).
- No se documenta soporte de tool calling, function calling, uso como agente, vision ni audio en la informacion disponible.
- El modo de razonamiento (thinking) del modelo base no se usa: el skill se entreno sin bloque de pensamiento y se recomienda desactivarlo con `--no-think`.

## Casos de uso

- Generacion de consultas 1C en herramientas internas de BI: el modelo recibe el esquema de metadatos del sistema y una pregunta de negocio ("productos con stock por debajo de 10 en una fecha") y devuelve una consulta valida lista para ejecutar, con la ventaja de que respeta la sintaxis especifica del lenguaje de 1C en lugar de generar SQL.
- Asistencia a desarrolladores y consultores 1C: integrado en un IDE o chat interno, acelera la escritura de consultas sobre registros de acumulacion, tablas virtuales y condiciones de parametros, y explica la solucion para facilitar la revision.
- Migracion y auditoria de informes: dado un esquema de metadatos y una especificacion funcional, el modelo produce la consulta correspondiente y su justificacion, lo que sirve como borrador revisable en proyectos de implantacion de ERP.
- Formacion de personal tecnico: el formato de respuesta con seccion "Por que asi" permite usar el modelo como tutor que explica por que una construccion es correcta (por ejemplo, que el segundo parametro de `Остатки()` es una condicion y no un valor).
- Automatizacion de tareas de soporte: clasificar y resolver peticiones de usuarios que piden informes o listados, traduciendolas a consultas 1C ejecutables contra la base de datos.
- Generacion de baterias de pruebas: producir consultas correctas e incorrectas etiquetadas para validar herramientas de analisis estatico o linters del lenguaje de 1C.
- Procesamiento por lotes de documentacion: dado un catalogo de esquemas de metadatos, generar ejemplos de consultas para documentacion tecnica o para ampliar datasets de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre dialogos retenidos (195 dialogos de la particion val, sin solapamiento con train):

| Metrica | Base Qwen3.8-27B | Con skill 1C |
|---|---:|---:|
| Dialogos retenidos: respuesta completa correcta (media por tipo de tarea) | 23,0 % | 98,7 % |
| Dialogos retenidos: respuesta completa correcta (todos los dialogos) | 33,6 % | 98,0 % |
| Dialogos retenidos: tokens de respuesta correctos | 78,0 % | 99,2 % |
| Pares correcto/incorrecto: el correcto es mas probable | 10,6 % | 99,4 % |
| Perplejidad de la respuesta de referencia | 2,914 | 1,034 |

En el conjunto de 161 pares de preferencia (preference.val), la metrica NERVE de log-probabilidad suma sobre los fragmentos donde difieren las respuestas pasa del 10,6 % al 99,4 %; sobre la respuesta completa, del 20,5 % al 99,4 %. La log-probabilidad por token del respuesta correcta pasa de -1,12 a -0,02 y la del incorrecta de -3,64 a -5,22; la NLL de la respuesta correcta baja de 1,081 a 0,028. Todas las evaluaciones se calcularon con `cortiq loglik` en CUDA (2569 peticiones, 18 minutos por modelo). No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: el modelo necesita 32 GB o mas, ya sea VRAM de GPU o memoria RAM en ejecucion sobre CPU.
- GPU: la model card cita una RTX PRO 6000 para el entrenamiento (pico de 86,8 GB) y para inferencia a 44 tokens/s en decodificacion. No se detallan otras GPU probadas.
- GPU de consumo: no se confirma que quepa en tarjetas consumer; 32 GB supera la VRAM de una RTX 4090 (24 GB) y de una RTX 5090 (32 GB, al limite). No hay datos publicados de ejecucion en estas tarjetas.
- Despliegue: exclusivamente mediante el runtime `cortiq` (CLI instalable con `cargo install cortiq-cli --features cuda`; sin CUDA soporta CPU, Vulkan y Apple Metal). Hay binarios para Linux, macOS y Windows en la pagina de releases del proyecto. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.cmf`.
- Rendimiento: 44 tokens/s de decodificacion en RTX PRO 6000 segun la model card. No hay datos de throughput en otras configuraciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos especializados en el lenguaje de consultas de 1C en la informacion proporcionada. La comparativa se limita al modelo base y a la familia Qwen3:

| Modelo | Parametros | Contexto | Rendimiento en tareas 1C | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B-1C-cmf | 27 000 M (+ skill 1,11 M) | no disponible | 98,0 % respuestas completas correctas (val propio) | Apache 2.0 | cortiq (.cmf) |
| Qwen/Qwen3.8-27B (base) | 27 000 M | no disponible | 33,6 % respuestas completas correctas (val propio) | Apache 2.0 (segun model card) | transformers, vLLM, llama.cpp, etc. |
| Alternativas especializadas en 1C | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con otros modelos de la misma categoria (asistentes de codigo para 1C o modelos generalistas de 27 000 M) no puede establecerse con rigor porque no hay resultados publicados en la informacion disponible.

## Limitaciones y advertencias

- El skill esta entrenado exclusivamente para el lenguaje de consultas de 1C:Enterprise 8; fuera de ese dominio el modelo se comporta como el base, sin mejora alguna.
- Requiere el system prompt exacto del repositorio y el modo `--no-think`; usarlo con otra configuracion puede degradar la calidad de las respuestas.
- El formato de pesos `.cmf` y el runtime `cortiq` son propietarios: no hay integracion con el ecosistema estandar (transformers, vLLM, llama.cpp), lo que limita el despliegue en infraestructura existente y ata el modelo a un proyecto mantenido por un unico autor.
- El modelo base Qwen3.8-27B puede presentar sesgos y alucinaciones heredados; en el dominio 1C, un esquema de metadatos incompleto o ambiguo puede producir consultas sintacticamente validas pero semanticamente incorrectas.
- Los resultados publicados (98 % de respuestas correctas) proceden de un unico dataset de validacion de 195 dialogos, con una taxonomia concreta; no hay evidencia de generalizacion a otros esquemas de metadatos, versiones de la plataforma o dominios empresariales.
- Idiomas declarados: ruso, ingles y chino. No se garantiza un rendimiento equivalente en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el proyecto cortiq y el propio modelo tienen 0 descargas y 0 likes en el momento de la ficha, lo que indica un ecosistema practicamente inexistente.
- La fecha de creacion del repositorio (2026-11-25) y la referencia a un modelo base "Qwen3.8-27B" no verificable en la informacion disponible obligan a tratar los datos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.8-27B-1C-cmf
- Modelo base cuantizado en cortiq: https://huggingface.co/infosave/Qwen3.8-27B-cmf
- Repositorio del framework cortiq: https://github.com/infosave2007/cmf
- Releases de cortiq (binarios Linux, macOS, Windows): https://github.com/infosave2007/cmf/releases
- Articulo sobre la metrica NERVE: https://habr.com/ru/articles/1104848/
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
