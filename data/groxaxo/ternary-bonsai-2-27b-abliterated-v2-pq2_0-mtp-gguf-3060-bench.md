# groxaxo/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF-3060-bench

# Ternary Bonsai 2 27B Abliterated v2 (PQ2_0 + MTP) GGUF: espejo y benchmarks en RTX 3060 12 GB

## Resumen

Este repositorio, publicado por el usuario groxaxo, es un espejo byte a byte del archivo `Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP.gguf` de BoldingBuilds, acompanado de un conjunto de benchmarks reproducibles ejecutados sobre una unica GPU RTX 3060 de 12 GB. No se han modificado los pesos: el artefacto utilizable es el GGUF de 7.657.489.696 bytes (7,66 GB) que contiene un modelo transformer de 27.320.697.856 parametros (27,3 mil millones) cuantizado en formato ternario PQ2_0 de PrismML, con una cabeza de prediccion multi-token (MTP) integrada para decodificacion especulativa. El modelo base esta "abliterado", es decir, se le ha reducido el comportamiento de rechazo, e incorpora una correccion del modo de razonamiento ("thinking fix") documentada por BoldingBuilds.

El problema que resuelve es practico: permite ejecutar un modelo de 27B con capacidades de razonamiento en una GPU de gama media con 12 GB de VRAM, algo imposible con pesos en FP16 (que requeririan unos 55 GB) y dificil incluso en cuantizaciones de 4 bits (unos 15-16 GB). Lo consigue mediante el empaquetado ternario PQ2_0, que reduce el coste a aproximadamente 2,24 bits por parametro, combinado con una cache KV cuantizada a q8_0 y decodificacion especulativa MTP que alcanza una tasa de aceptacion de borradores de 0,92.

Su relevancia radica en que documenta de forma transparente un stack completo de inferencia local (fork de llama.cpp de PrismML, parche MTP, flags de lanzamiento y limites de contexto verificados) y en que es honesto sobre lo que no ha medido: el propio autor advierte que la tabla de calidad de 50 intentos no incluye ninguna fila para este archivo exacto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 27 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con cabeza de prediccion multi-token (MTP) integrada; la ruta del parche implicado (`src/models/qwen35.cpp`) apunta a la familia Qwen3.5, confirmacion oficial no disponible |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Hasta 26.624 tokens (`-c 26624`) en la configuracion verificada como segura en RTX 3060 12 GB; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | PQ2_0 (empaquetado ternario de PrismML, ~2,24 bits por parametro); cache KV del modelo objetivo y del borrador en q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo `.gguf`, libreria `gguf`, runtime llama.cpp) |
| Tamano del repositorio | 7,7 GB (GGUF de 7,66 GB + ~5 MB de `bench/`) |
| Modelo base | BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF |
| Hash SHA-256 del GGUF | a4e4c7b578131595c1694354bd6c74d00920df1f5082647a6126899753ebebf8 (coincide con el publicado por BoldingBuilds) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 27,3B parametros cuyos pesos estan empaquetados en formato ternario PQ2_0, un esquema de empaquetado propietario de PrismML que ocupa unos 2,24 bits por parametro. El GGUF incorpora ademas tensores `blk.64.*` que constituyen la cabeza MTP: esta cabeza actua como modelo borrador interno que propone tokens adicionales por paso, lo que habilita decodificacion especulativa sin un segundo modelo. El parche necesario (`0001-qwen35-mtp-hadamard-inverse.patch`, unas 14 lineas en `src/models/qwen35.cpp`) revela que la implementacion del grafo MTP vive en el fichero de modelo `qwen35`, dato que sugiere un linaje Qwen3.5, aunque la model card no lo confirma explicitamente.

La innovacion tecnica destacable es el parche Hadamard: el modelo almacena la tabla de embeddings como "Hadamard-latent", y el grafo borrador del MTP realiza su propia busqueda de embeddings saltandose la transformada inversa de Hadamard. Sin el parche, cargar el GGUF con `--spec-type draft-mtp` falla en el arranque con el error `Hadamard-latent table 'token_embd.weight' is read without the inverse transform`. El parche anade esa transformada inversa y es, byte por byte, el publicado por decent-jawfish en `decent-jawfish/bonsai-2-27b-mtp` (SHA-256 `c10f6222…ce23b0`), cuyo encabezado git atribuye la autoria a MFEC AI Lab; BoldingBuilds distribuye un parche con el mismo cambio de codigo.

Sobre el entrenamiento no hay datos en esta informacion: el repositorio es un espejo de una cuantizacion, no un informe de preentrenamiento. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. Lo unico documentado por el autor es que el modelo base fue "abliterado" (se elimino o atenuo el comportamiento de rechazo) y que se aplico una correccion del modo de razonamiento; los detalles de ambos procesos hay que consultarlos en la model card de BoldingBuilds, que el propio autor senala como fuente autoritativa. El modelo se sirve con plantilla de chat Jinja (`--jinja`) y acepta el parametro `chat_template_kwargs` con `reasoning_effort` ajustado a `medium`, valor que BoldingBuilds recomienda para esta build.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado `text-generation`, tag `conversational`, `endpoints_compatible`).
- Razonamiento explicito configurable mediante el parametro de plantilla `reasoning_effort` (el autor usa y recomienda `medium`); el modelo base incorpora la mencionada "thinking fix".
- Decodificacion especulativa nativa con cabeza MTP integrada: `--spec-type draft-mtp --spec-draft-n-max 2`, con tasa de aceptacion medida de 0,92.
- Comportamiento "abliterated": se ha reducido la tendencia a rechazar peticiones, lo que cambia el perfil de respuestas frente a un modelo alineado convencional.
- Instrucciones y generacion estructurada: el benchmark propio del autor usa "respuestas JSON cortas", lo que indica uso práctico en formatos estructurados.
- Ventana de contexto larga en hardware de consumo: hasta 26.624 tokens con cache KV q8_0 en una RTX 3060 de 12 GB.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no se documenta soporte explicito en la informacion disponible, aunque la plantilla de chat Jinja completa esta habilitada.
- Vision, audio u otras modalidades: no disponible (el modelo es exclusivamente de texto).

## Casos de uso

- Automatizacion de bandeja de entrada: el autor disena su benchmark precisamente sobre 30 tareas de "inbox automation", de modo que el modelo esta evaluado en clasificacion, extraccion y respuesta a correos, con contexto suficiente (26.624 tokens) para incluir hilos completos.
- Asistente local en una unica GPU de consumo: al caber entero en 12 GB de VRAM con KV q8_0, permite desplegar un modelo de 27B en una RTX 3060, 4070 o similar sin depender de servicios en la nube y sin enviar datos fuera de la maquina.
- Procesamiento por lotes con contexto largo: la ventana verificada de 26.624 tokens permite resumir, clasificar o extraer datos de documentos extensos en una sola pasada, con un coste de procesamiento de prompt de 470 tok/s.
- Investigacion en decodificacion especulativa: el repositorio incluye el parche MTP, el script de compilacion y los resultados crudos, por lo que sirve como banco de pruebas reproducible para medir aceptacion de borradores y ganancias de throughput en distintos runtimes.
- Pipelines de agente con razonamiento multi-paso: el modo de razonamiento con `reasoning_effort` configurable permite ajustar el equilibrio entre profundidad de razonamiento y latencia en tareas encadenadas, a 33,6 tok/s incluso con el contexto al 90% de ocupacion.
- Generacion de contenido sin filtros de rechazo: para casos editoriales, creativos o de investigacion sobre seguridad de modelos donde se necesita estudiar el comportamiento sin rechazos sistematicos, teniendo en cuenta las advertencias legales y eticas correspondientes.
- Despliegue on-premise con requisitos de privacidad: entornos sanitarios, legales o industriales que exigen que la inferencia ocurra en hardware propio y con licencia Apache 2.0 sin royalties ni restricciones de uso comercial.
- Motor de referencia para comparativas de cuantizacion ternaria: util para medir la degradacion de calidad de PQ2_0 frente a cuantizaciones de 4 u 8 bits sobre el mismo modelo base, aunque el propio autor advierte que la tabla de calidad no incluye este archivo.

## Benchmarks y rendimiento

El autor solo ejecuto sobre este archivo exacto (abliterated v2 + MTP) las pruebas de velocidad y de contexto maximo. La tabla de calidad de 50 intentos del repositorio no contiene ninguna fila para este fichero: sus filas "B" corresponden a otra build abliterada sin MTP y sus filas "J" al Bonsai 2 base no abliterado con MTP.

### Velocidad medida (RTX 3060 12 GB, con un embedder vLLM compartiendo la GPU, ~2,5 GB)

| Metrica | Valor |
|---|---|
| Decodificacion, respuesta JSON corta | ~56 tok/s (rango 55,7-56,2) |
| Decodificacion con el contexto al 90% (23.977 tokens de prompt, `-c 26624`) | 33,6 tok/s |
| Procesamiento de prompt al 90% de ocupacion | 470 tok/s |
| Aceptacion de borradores MTP | 0,92 |

### Comparacion con el modelo base no abliterado (misma tarjeta, mismo binario)

| Metrica | Este modelo (abliterated + MTP) | Bonsai 2 base (no abliterado + MTP) |
|---|---|---|
| Decodificacion corta | ~56 tok/s (55,7-56,2) | 56,7-57,1 tok/s |
| Decodificacion al 90% de contexto | 33,6 tok/s | 33,8 tok/s (al 90% de 28K) |
| Aceptacion MTP | 0,92 | 0,933 |

### Contexto maximo (RTX 3060 12 GB)

Metodo (`bench/scripts/ctx_test.py`, datos crudos en `bench/results/ctx_search_54.jsonl`): lanzar `llama-server` completamente en GPU con los flags indicados, enviar un prompt sintetico que llene aproximadamente el 90% de `-c` y comprobar que la peticion se completa. Una configuracion solo cuenta si quedan al menos 300 MiB de VRAM libres en el pico de uso. Durante todas las ejecuciones la 3060 tenia ademas un embedder vLLM consumiendo 2.548 MiB. La configuracion de produccion declarada por el autor es `-c 26624` con `-ngl 999 -fa on`, cache KV q8_0 en modelo objetivo y borrador y `-fit off`. Los valores concretos de la tabla de busqueda de contexto estan truncados en la model card disponible, por lo que no se reproducen aqui.

Resultados de calidad (MMLU, HumanEval, GSM8K u otros): no se han publicado resultados de benchmarks de calidad en la informacion disponible para este archivo.

## Requisitos de hardware

- Pesos en disco y en VRAM: 7.657.489.696 bytes (7,66 GB, unos 7.302 MiB).
- Configuracion verificada en una RTX 3060 de 12 GB: todos los pesos en GPU (`-ngl 999`), flash attention activada, 26.624 tokens de contexto, cache KV q8_0 en el modelo objetivo (`-ctk q8_0 -ctv q8_0`) y en el borrador (`-ctkd q8_0 -ctvd q8_0`), sin offload a CPU (`-fit off`). El autor exige que queden al menos 300 MiB de VRAM libres en el pico.
- Estimacion de reparto de VRAM a partir de los datos publicados: de los 12.288 MiB de la tarjeta, 2.548 MiB los ocupaba el embedder vLLM, quedando unos 9.400 MiB utiles para llama-server; descontando los ~7.302 MiB de pesos, quedan aproximadamente 2 GB para cache KV a 26.624 tokens, buffers de computo y el grafo MTP. Es una estimacion derivada, no una medida publicada.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB en adelante. Con 12 GB exactos el margen es estrecho y no se puede compartir la GPU con otro proceso grande (el propio benchmark necesito ~2,5 GB adicionales que ya estaban ocupados por el embedder, lo que deja poco margen de holgura).
- GPU recomendadas: RTX 3060 12 GB (configuracion verificada). Cualquier GPU con >=12 GB de VRAM y soporte CUDA deberia funcionar; para mas contexto o mayor margen, 16-24 GB (RTX 4080/4090, A5000, L40S, A100, H100) permiten subir `-c` y usar KV en precision mayor.
- Despliegue: no es cargable en llama.cpp mainline, Ollama ni LM Studio. Requiere el fork de llama.cpp de PrismML (`github.com/PrismML-Eng/llama.cpp`). El autor compila la etiqueta `prism-b10685-7dffb15` con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=86 -DLLAMA_CURL=OFF` y objetivo `llama-server`, aplicando antes el parche MTP. Segun BoldingBuilds, la etiqueta `prism-b10743-adfffbe` o posterior ejecuta ficheros MTP sin el parche, pero el autor de este repositorio no lo comprobo.
- Latencia y throughput: 56 tok/s en respuestas cortas, 33,6 tok/s con el contexto al 90%, 470 tok/s de procesamiento de prompt y 0,92 de aceptacion MTP, medidos con `--spec-draft-n-max 2`.
- Flags de muestreo usados como predeterminados del servidor: `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.05` y `--chat-template-kwargs '{"reasoning_effort": "medium"}'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificacion en RTX 3060 12 GB | Aceptacion MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Ternary Bonsai 2 27B Abliterated v2 PQ2_0 + MTP) | 27,3B | 26.624 tokens (verificado) | ~56 tok/s corto; 33,6 tok/s al 90% | 0,92 | Apache 2.0 | GGUF en este repositorio (espejo) |
| Bonsai 2 27B base, no abliterado, con MTP | 27,3B (mismo linaje) | 28K probado | 56,7-57,1 tok/s corto; 33,8 tok/s al 90% de 28K | 0,933 | no disponible | GGUF en el repositorio de BoldingBuilds |
| Build abliterada sin MTP (filas "B" del benchmark) | no disponible | no disponible | no disponible | No aplica (sin MTP) | no disponible | no disponible |
| decent-jawfish/bonsai-2-27b-mtp (autor del parche, MFEC AI Lab) | no disponible | no disponible | no disponible | no disponible | no disponible | repositorio del parche |

No se dispone de datos para comparar con alternativas de otros fabricantes de tamano similar (por ejemplo modelos densos de 27-32B en cuantizacion de 4 bits) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta "abliterated": se ha reducido deliberadamente su comportamiento de rechazo. Esto aumenta el riesgo de generar contenido danino, ilegal o inapropiado sin las salvaguardas habituales de un modelo alineado, y traslada al desplegador toda la responsabilidad de filtrado y moderacion.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de veracidad ni de calidad publicadas para este archivo concreto, por lo que no se puede estimar su tasa de error factual.
- Sin datos de sesgos: no se documenta composicion del dataset de entrenamiento ni evaluaciones de sesgo, de modo que no se puede caracterizar el comportamiento diferencial por idioma, genero, origen o ideologia.
- Idiomas soportados: no disponible. No hay confirmacion de cobertura multilingue ni de calidad fuera del ingles.
- Restriccion de runtime severa: el formato PQ2_0 no es cargable por llama.cpp mainline, Ollama ni LM Studio. Sin el fork de PrismML y, en la version probada, sin el parche MTP, el modelo no arranca. Esto limita la portabilidad y complica el mantenimiento en produccion.
- El parche MTP es necesario en `prism-b10685`; el autor no verifico si la etiqueta `prism-b10743-adfffbe` o posterior lo hace innecesario. Existe riesgo de incompatibilidad al actualizar el runtime.
- Margen de VRAM muy ajustado en 12 GB: la configuracion validada exige al menos 300 MiB libres en el pico y el benchmark se ejecuto con otro proceso consumiendo 2,5 GB. Compartir la GPU con otras cargas puede provocar fallos de asignacion.
- Los numeros de velocidad se midieron con una GPU compartida, por lo que son un suelo conservador, no un maximo optimizado.
- La ventana de contexto verificada (26.624 tokens) es una configuracion de despliegue, no necesariamente el contexto nativo del modelo base, que no se especifica.
- El repositorio tiene 0 descargas y 0 likes y es un espejo no oficial: no hay garantia de mantenimiento, y la model card autoritativa es la de BoldingBuilds.
- Licencia Apache 2.0 en el espejo: permite uso comercial, pero conviene verificar la licencia del modelo base subyacente (no disponible en esta informacion) antes de explotarlo en produccion.
- Las tablas de calidad del repositorio no incluyen este archivo; usarlas para inferir el rendimiento de este GGUF concreto seria un error metodologico que el propio autor senala explicitamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/groxaxo/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF-3060-bench
- Modelo base (fuente autoritativa del modelo y de la abliteracion): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF
- Fork de llama.cpp de PrismML (runtime necesario para PQ2_0 y MTP): https://github.com/PrismML-Eng/llama.cpp
- Repositorio del parche MTP y autor original (MFEC AI Lab): https://huggingface.co/decent-jawfish/bonsai-2-27b-mtp
- Ruta del parche en este repositorio: `bench/scripts/0001-qwen35-mtp-hadamard-inverse.patch`
- Script de compilacion: `bench/scripts/build_prismml_mtp.sh`
- Script de prueba de contexto: `bench/scripts/ctx_test.py`
- Resultados crudos de busqueda de contexto: `bench/results/ctx_search_54.jsonl`
- Resumen de benchmarks del repositorio: `bench/summary.md`
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo, su autoria o su arquitectura; los unicos enlaces utiles son los proporcionados en la informacion del repositorio.
