# GhostScientist/semanticwiki-coder-7b-v2-gguf

## Resumen

SemanticWiki Coder 7B v2 — GGUF Q4_K_M es la version cuantizada del modelo `GhostScientist/semanticwiki-coder-7b-v2-merged`, un ajuste fino derivado de `Qwen/Qwen2.5-Coder-7B-Instruct`. Lo publica el usuario GhostScientist bajo licencia Apache-2.0 y esta orientado a la generacion de documentacion tecnica, la escritura de documentacion de codigo y la explicacion de fragmentos de codigo (el autor lo etiqueta con los terminos `code-documentation`, `technical-writing` y `deepwiki`).

El repositorio distribuye un unico archivo GGUF cuantizado en Q4_K_M de aproximadamente 4,46 GB, obtenido a partir de un GGUF F16 fusionado de unos 15,2 GB. El modelo declara 7.615.616.512 parametros y 32.768 tokens de contexto en los metadatos del GGUF, aunque el autor recomienda empezar las pruebas en navegador con 8.192 tokens. El formato esta pensado para llama.cpp y herramientas compatibles, lo que permite ejecutarlo en equipos de consumo sin GPU de datacenter.

Su relevancia es acotada pero concreta: cubre el nicho de generacion automatica de documentacion de repositorios al estilo "deepwiki" con despliegue local, un caso en el que prima el control sobre el codigo fuente frente a la calidad absoluta de generacion. No hay benchmarks publicados ni validacion de la comunidad (0 descargas y 0 likes en el momento de la consulta), por lo que debe evaluarse como un modelo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen2.5-Coder-7B-Instruct (no se detalla en la model card) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun metadatos del GGUF; el autor recomienda empezar las pruebas en navegador con 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (mixed K-quant, aprox. 4,91 bits por peso); no se publican otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base tambien Apache-2.0) |
| Formato de pesos | GGUF (archivo unico de aprox. 4,46 GB); el GGUF F16 de entrada pesaba aprox. 15,2 GB |
| Parametros de generacion por defecto | No documentados; contexto configurable con `-c` en llama.cpp |
| Formato de prompt | `<START_OF_CONTEXT> ... <END_OF_CONTEXT>` seguido de `<query> ... </query>` |
| Libreria declarada | gguf (llama.cpp) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, pero la cadena de procedencia la determina: el modelo base es `Qwen/Qwen2.5-Coder-7B-Instruct`, sobre el que se entreno un adaptador (`GhostScientist/semanticwiki-coder-7b-v2`) que despues se fusiono en `GhostScientist/semanticwiki-coder-7b-v2-merged`. Se trata, por tanto, de un transformer denso de tipo decoder-only, con ajuste fino mediante adaptador y posterior merge de pesos. No se especifica si el adaptador es LoRA, QLoRA u otra variante, ni el rango o los hiperparametros del entrenamiento.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF, DPO u otra fase de alineamiento posterior. La parte documentada del pipeline es unicamente la de conversion y cuantizacion: se uso el script oficial `convert_hf_to_gguf.py` de llama.cpp para la conversion a GGUF y la herramienta `llama-quantize` con el preset `Q4_K_M` para la cuantizacion, dando como resultado un archivo de tipo mixed K-quant de aproximadamente 4,91 bits por peso. La innovacion tecnica destacable es, por tanto, de empaquetado y distribucion (formato GGUF con metadatos de contexto integrados), no de arquitectura.

## Capacidades

- Generacion de documentacion de codigo: produce descripciones, comentarios y documentacion de referencia a partir de fragmentos de codigo delimitados con el formato `<START_OF_CONTEXT>` / `<END_OF_CONTEXT>`.
- Explicacion de codigo: dado un bloque (por ejemplo, una clase `Greeter` con un metodo `hello`), el modelo puede explicar su funcionamiento, tal y como muestra el ejemplo oficial de `llama-cli`.
- Escritura tecnica: el autor lo etiqueta explicitamente con `technical-writing` y `code-documentation`, por lo que esta ajustado para redactar texto tecnico explicativo, no solo codigo.
- Flujo tipo "deepwiki": orientado a generar documentacion navegable de repositorios o modulos.
- Generacion de texto conversacional: la ficha de HuggingFace incluye la etiqueta `conversational`.
- Compatibilidad con endpoints: incluye la etiqueta `endpoints_compatible`, lo que indica que puede servirse a traves de infraestructura de inferencia compatible.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la ficha ni en la model card).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no documentado; no se declaran capacidades multimodales.

## Casos de uso

- Documentacion automatica de repositorios: el modelo recibe bloques de codigo entre `<START_OF_CONTEXT>` y `<END_OF_CONTEXT>` y devuelve texto explicativo; gracias a los 32.768 tokens de contexto puede procesar modulos completos en lugar de funciones aisladas, lo que reduce la perdida de contexto entre archivos relacionados.
- Generacion de docstrings y comentarios de referencia: integrado en un script que recorra un arbol de directorios, se puede usar para crear documentacion de API a partir de firmas de funciones y clases, revisando despues el resultado contra el codigo real.
- Explicacion de codigo heredado: para equipos que se incorporan a un proyecto sin documentacion, el modelo puede resumir que hace cada modulo y como se relaciona con el resto, ejecutandose en local para no enviar codigo propietario a servicios externos.
- Asistente de escritura tecnica en local: redaccion de guias de integracion, notas de version y articulos tecnicos a partir de esquemas o fragmentos de codigo, usando un `llama-server` local con su WebUI.
- Onboarding de desarrolladores: generacion de un documento de "primeros pasos" por modulo, a partir del codigo, para incorporar a nuevos miembros del equipo en proyectos grandes.
- Preprocesado de documentacion en pipelines internos: uso como paso de un pipeline que convierte codigo en borradores de documentacion que despues pasan revision humana, con el GGUF cargado en llama.cpp y control total de la temperatura y la longitud de salida.
- Entornos sin conectividad o con restricciones de privacidad: al ser un GGUF de 4,46 GB ejecutable con llama.cpp, puede desplegarse en estaciones de trabajo aisladas donde no se permite enviar codigo a APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de generacion de documentacion, y la busqueda web realizada no devolvio resultados relacionados con el modelo. Tampoco se documentan comparaciones con el modelo base ni con el modelo fusionado en F16.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 4,46 GB, por lo que hacen falta unos 5-6 GB de memoria para los pesos y los buffers de runtime. Sumando la cache KV, el consumo se situa en torno a 6 GB con 8.192 tokens de contexto y en torno a 7-8 GB con los 32.768 tokens maximos (estimaciones, no cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM. Para el contexto completo de 32.768 tokens es preferible disponer de 10-12 GB. En el extremo alto, tarjetas como RTX 4090, A100 o H100 ejecutan el modelo con holgura y permiten mayor profundidad de batch.
- Cabe en GPU de consumo: si. Ejemplos habituales son RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. En equipos con memoria unificada (Apple Silicon) puede ejecutarse con 8-16 GB de memoria disponible. El autor advierte de que la carga directa en navegador via WebGPU/WebAssembly depende del navegador, de la memoria del dispositivo y del build del runtime, por lo que la via fiable es levantar un `llama-server` local y abrir su WebUI.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extension las herramientas que consumen GGUF (interfaces de escritorio locales y aplicaciones basadas en un servidor llama.cpp local). El soporte de vLLM o TGI no se documenta en la ficha ni se ha verificado para este repositorio.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de tokens por segundo ni de latencia.
- Ajuste recomendado de contexto: el autor sugiere arrancar las pruebas en navegador con `-c 8192` antes de subir al maximo de 32.768 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad / notas |
|---|---|---|---|---|---|
| GhostScientist/semanticwiki-coder-7b-v2-gguf | 7,6 B | 32.768 tokens | GGUF Q4_K_M (4,46 GB) | Apache-2.0 | Publicado en HuggingFace; 0 descargas y 0 likes en la fecha de consulta; sin benchmarks publicados |
| GhostScientist/semanticwiki-coder-7b-v2-merged | 7,6 B (mismo modelo fusionado) | no disponible | GGUF F16 (aprox. 15,2 GB) como entrada de cuantizacion | Apache-2.0 | Es la fuente de la cuantizacion; requiere bastante mas memoria |
| GhostScientist/semanticwiki-coder-7b-v2 | no disponible | no disponible | adaptador (formato no especificado) | no disponible en la informacion proporcionada | Adaptador original antes del merge |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7 B (familia Qwen2.5-Coder) | no disponible en la informacion proporcionada | safetensors (formato original, no confirmado en la informacion) | Apache-2.0 (segun la cadena de procedencia indicada) | Modelo base sobre el que se entreno el adaptador; el autor remite a su model card para terminos y condiciones |

No se dispone de datos de rendimiento comparativos entre estas variantes, ni de alternativas de otros proveedores, porque no se han publicado benchmarks en la informacion disponible.

## Limitaciones y advertencias

- La documentacion generada puede ser incorrecta, incompleta o contener citas deficientes; el propio autor recomienda verificar las referencias al codigo contra el repositorio que se esta documentando.
- El modelo no es un auditor de seguridad: no debe usarse como herramienta de analisis de vulnerabilidades ni como sustituto de una revision de seguridad.
- No se deben introducir secretos ni codigo fuente privado en aplicaciones no confiables. Aunque el despliegue local mitiga la exposicion, el uso de interfaces de terceros anula esa ventaja.
- El soporte en navegador depende del runtime y de la memoria disponible del dispositivo; no es un escenario garantizado por el autor.
- No hay informacion sobre sesgos, composicion del dataset de ajuste ni fases de alineamiento, por lo que el comportamiento fuera del dominio de documentacion de codigo es impredecible.
- No se declaran idiomas soportados, de modo que el rendimiento en castellano u otros idiomas distintos del ingles no esta verificado y debe probarse antes de usarlo en produccion.
- La cuantizacion Q4_K_M (aprox. 4,91 bits por peso) implica una degradacion esperada frente al GGUF F16 de 15,2 GB; no se han publicado mediciones de esa perdida.
- Licencia Apache-2.0 en el modelo base y en la cadena de procedencia indicada, pero el autor recomienda revisar la model card original y los terminos aplicables antes de redistribuir o usar comercialmente.
- Ausencia total de traccion (0 descargas, 0 likes) y de evaluaciones independientes: el modelo no cuenta con validacion de la comunidad.
- Riesgo de alucinacion en referencias cruzadas: al documentar codigo, el modelo puede inventar nombres de funciones, parametros o rutas que no existen en el repositorio.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/GhostScientist/semanticwiki-coder-7b-v2-gguf
- Modelo fusionado de origen: https://huggingface.co/GhostScientist/semanticwiki-coder-7b-v2-merged
- Adaptador original: https://huggingface.co/GhostScientist/semanticwiki-coder-7b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los enlaces recuperados correspondian a paginas de soporte de Microsoft sin relacion con esta ficha. No se dispone, por tanto, de papers, blogs, repositorios ni demos adicionales verificados.
