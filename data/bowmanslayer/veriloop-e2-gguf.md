# bowmanslayer/VeriLoop-E2-GGUF

## Resumen

VeriLoop-E2-GGUF es una cuantizacion comunitaria en formato GGUF del modelo tsinghua-sigs-robot-lab/VeriLoop-E2, publicada por el usuario bowmanslayer sobre una revision fija del repositorio original (commit 9379d199adcc44acdf836558037163878e3a37ae). No se trata de un lanzamiento oficial de la Universidad de Tsinghua: el unico cambio respecto al modelo fuente es la conversion y cuantizacion de pesos, y la licencia Apache-2.0 se hereda del upstream. El paquete incluye el modelo principal en Q4_K_M y un proyector de vision (mmproj) separado en F16, lo que sugiere capacidad multimodal aunque la evaluacion publicada solo cubre peticiones de texto.

El modelo tiene 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y su arquitectura declarada es Qwen3_5ForConditionalGeneration; la model card del autor de la cuantizacion indica que el upstream denomina a la base "Qwen3.8-27B". Los pesos ocupan 17,5 GB en el repositorio, coherente con una cuantizacion Q4_K_M mas el proyector F16. No se aplico abliteration a esta version, y no se uso importance matrix durante la cuantizacion.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un artefacto experimental con cero descargas y cero likes en el momento del registro, sin resultados oficiales de leaderboard. El autor publica una evaluacion emparejada propia sobre 1.514 preguntas con decodificacion greedy y modo thinking activado, acompanada de los registros por item, pero advierte que sus puntuaciones de SWE, Terminal y DeepSWE no corresponden a estos pesos, que la inferencia visual no fue validada y que no se ha demostrado equivalencia completa de capacidades ni idoneidad para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (denominacion del upstream: Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; los ejemplos de carga usan `-c 40960` |
| Tipos de cuantizacion | Q4_K_M (modelo principal) y F16 (proyector de vision `mmproj-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria `gguf`) |

Datos adicionales: repositorio de 17,5 GB, pipeline `text-generation`, creado el 2026-10-10 y actualizado el 2026-10-10, 0 descargas y 0 likes. Etiquetas declaradas: gguf, veriloop, community-quantization, experimental, text-generation, conversational, endpoints_compatible.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, identificada como Qwen3_5ForConditionalGeneration, que corresponde a un transformer con generacion condicional. La model card no aporta informacion sobre el entrenamiento original: no se detalla el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otro metodo de alineamiento. Esa informacion pertenece al repositorio de los autores originales de VeriLoop-E2 y no se reproduce aqui.

En cuanto al proceso de cuantizacion, el autor indica que se genero un Q4_K_M del modelo principal y un proyector de vision F16 separado, sin matriz de importancia (importance matrix) y excluyendo del release los intermedios de conversion en precision completa. La conversion estandar a GGUF excluye el MTP (multi-token prediction) y una ruta de ejecucion personalizada de memoria condicional presente en el modelo original. Un detalle tecnico relevante: el bloque de identidad heredado en los metadatos GGUF procede de la configuracion antigua del tokenizer del upstream, por lo que el autor recomienda usar explicitamente la plantilla standalone suministrada (`--chat-template-file chat_template.jinja`) y no la que viene en los metadatos. Tambien advierte de que no debe anadirse un parser de razonamiento de Qwen3, porque algunas respuestas directas completadas omiten la etiqueta de cierre de razonamiento y ese parser las clasificaria erroneamente como razonamiento oculto.

## Capacidades

- Generacion de texto y conversacion multi-turno segun la etiqueta `conversational` y el pipeline `text-generation`.
- Modo de razonamiento explicito (thinking), activado durante toda la evaluacion publicada.
- Rendimiento alto en generacion de codigo en la evaluacion propia: 90,85% en HumanEval con 164 items (version original, sin abliteration).
- Razonamiento matematico y cientifico: 68,00% en MATH500 y 37,00% en GSM8K sobre 100 items cada uno.
- Conocimiento general y multilingue parcial: MMLU 68,00%, CMMLU 61,33% (chino), C-Eval 60,00%, MMLU-Pro 64,00%, ARC 90,00%.
- Vision: el release incluye `mmproj-F16.gguf`, pero el autor indica explicitamente que la inferencia visual no fue validada.
- Soporte de tool calling y comportamiento agentico: no establecido; la propia evaluacion aclara que no demuestra rendimiento en tool-use ni en agentes.
- Contexto largo: no establecido; la evaluacion no valida el comportamiento en contexto largo.
- Cumplimiento de instrucciones: 63,00% en IFEval, medido con una implementacion parcial de reglas personalizada, no con el evaluador oficial.

## Casos de uso

- Generacion de codigo asistida en entornos de desarrollo: con un 90,85% en HumanEval sobre 164 problemas, el modelo es adecuado para autocompletado, generacion de funciones y refactorizacion dentro de un IDE o de un pipeline de revision. Requiere verificacion humana, ya que la evaluacion no cubre ejecucion en produccion ni tool calling.
- Resolucion de problemas matematicos y cientificos como apoyo al estudio: el 68,00% en MATH500 lo situan como herramienta de ayuda para derivaciones y problemas de nivel competitivo. El 37,00% en GSM8K es bajo, asi que no conviene usarlo como calculadora fiable en aritmetica de varios pasos sin comprobacion.
- Analisis y respuesta sobre documentacion tecnica extensa: si se confirma el contexto de 40.960 tokens usado en los ejemplos de carga, permite cargar manuales o bases de codigo completas en una sola ventana. Este extremo no esta validado en la evaluacion, por lo que debe probarse antes de desplegarlo.
- Prototipado de asistentes conversacionales en castellano y otros idiomas: el modelo no declara idiomas soportados. Cualquier uso multilingue debe medirse con un conjunto de evaluacion propio; los datos de CMMLU y C-Eval sugieren cierto soporte de chino, pero no de castellano.
- Experimentacion en investigacion sobre cuantizacion: el repositorio publica registros por item (9.084 registros de metricas), indices y hashes de preguntas, y 400 registros de sondas de rechazo, lo que lo convierte en un objeto de estudio util para comparar comportamiento entre pesos originales y abliterados.
- Evaluacion de seguridad y control de contenido: las 100 sondas de rechazo muestran una caida de marcadores de 99/100 a 0/100 entre las versiones original y abliterada. Para equipos que investigan alineamiento, este release permite reproducir ese contraste, siempre que se implementen controles propios de comportamiento.
- Despliegue local en una sola GPU de gama alta: al ser GGUF Q4_K_M, puede servirse con llama.cpp u Ollama en hardware de consumo o profesional, lo que facilita pruebas internas sin infraestructura dedicada. No hay datos de latencia ni de throughput publicados.

## Benchmarks y rendimiento

Evaluacion emparejada declarada por el autor: mismo conjunto congelado de 1.514 preguntas, semilla 20260816, thinking activado con la plantilla original y el protocolo de contenido en crudo del publicador, decodificacion greedy, salida maxima de 32.768 tokens. El autor advierte que son puntuaciones propias con evaluadores muestreados y personalizados, no resultados oficiales de leaderboard, y que IFEval usa una implementacion parcial de reglas.

| Tarea | n | GGUF original | GGUF abliterado | Delta (pp) |
|---|---:|---:|---:|---:|
| MMLU | 150 | 68,00% | 68,00% | +0,00 |
| CMMLU | 150 | 61,33% | 64,67% | +3,33 |
| MMLU-Pro | 150 | 64,00% | 68,67% | +4,67 |
| C-Eval | 150 | 60,00% | 70,00% | +10,00 |
| ARC | 150 | 90,00% | 91,33% | +1,33 |
| TruthfulQA | 150 | 60,67% | 60,67% | +0,00 |
| GSM8K | 100 | 37,00% | 47,00% | +10,00 |
| MATH500 | 100 | 68,00% | 67,00% | -1,00 |
| BBH | 150 | 48,00% | 54,67% | +6,67 |
| HumanEval | 164 | 90,85% | 90,24% | -0,61 |
| IFEval | 100 | 63,00% | 60,00% | -3,00 |

Resultado global original frente a abliterado: 65,72% frente a 68,63%, diferencia de +2,91 puntos porcentuales, con intervalo de confianza emparejado aproximado del 95% de [0,956; 4,856] pp. Respuestas vacias: [4, 7]; respuestas limitadas por longitud: [4, 7]; ambas permanecen en el denominador y la puerta de validez de tasa de vacios se cumple.

Sondas de rechazo: 100 pruebas independientes con thinking desactivado y presupuesto de 2.048 tokens; el recuento de marcadores en las primeras 30 palabras fue de 99/100 en la version original y 0/100 en la abliterada. El autor subraya que la ausencia de marcador no prueba cumplimiento semantico, que el truncamiento afecto a [0, 7] casos y que las 16 primeras sondas solapan con la seleccion de candidatos (el subconjunto reservado de 84 items figura en `evaluation.json`). No se midio linea base en precision completa. Esta ficha se centra en la version original, no abliterada, que es la incluida en el repositorio.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 15,1 GB para el modelo principal en Q4_K_M (calculo a partir de 26,9 B de parametros a unos 4,5 bits por parametro), mas lo que ocupe el proyector F16 `mmproj-F16.gguf`. El repositorio completo ocupa 17,5 GB, cifra util como referencia de espacio en disco. Son estimaciones derivadas del tamano, no medidas publicadas.
- Memoria para el contexto: con `-c 40960` la cache KV anade una cantidad no despreciada de VRAM que no se especifica en la informacion disponible; habra que dimensionarla segun el numero de capas y cabezas KV del modelo real.
- GPU recomendadas: no disponibles. Por volumen de pesos, encajan tarjetas con 24 GB o mas (por ejemplo RTX 4090, RTX 3090, L4, A10G) para cuantizaciones de 4 bits y contextos moderados; para contexto completo de 40.960 tokens conviene una GPU profesional con 40-80 GB (A100, H100) o el uso de offloading parcial a CPU.
- Cabe en GPU de consumo: probablemente si en tarjetas de 24 GB con Q4_K_M y contexto reducido; no hay confirmacion del autor.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con el comando publicado: `llama-server -m original-Q4_K_M.gguf -ngl 99 -c 40960 --jinja --chat-template-file chat_template.jinja --reasoning-format none`. Requiere una compilacion reciente de llama.cpp y la plantilla suministrada. Otros runners compatibles con GGUF (Ollama, llama-cpp-python, servidores GGUF de vLLM) no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de modelos comparables que permitan una comparativa rigurosa. El unico punto de referencia interno es la propia pareja del repositorio:

| Version | Parametros | Cuantizacion | Global (evaluacion propia) | Licencia |
|---|---|---|---|---|
| VeriLoop-E2-GGUF original (este release) | 26,9 B | Q4_K_M + mmproj F16 | 65,72% | Apache-2.0 |
| VeriLoop-E2-GGUF abliterado (misma evaluacion) | 26,9 B | Q4_K_M | 68,63% | Apache-2.0 |

Comparativas frente a otros modelos de ~27 B (familia Qwen, Gemma, Mistral y similares): no disponibles, porque no se han proporcionado especificaciones ni resultados de esos modelos en la informacion de origen.

## Limitaciones y advertencias

- Cuantizacion no oficial: es un artefacto comunitario, no un lanzamiento de Tsinghua. No existe respaldo de los autores originales sobre el comportamiento de estos pesos.
- Sin validacion de capacidades clave: la propia model card indica que la evaluacion no establece rendimiento en contexto largo, tool-use, vision, comportamiento agentico ni idoneidad para produccion.
- Vision no validada: aunque se incluye el proyector `mmproj-F16.gguf`, la inferencia visual no fue probada en la evaluacion publicada.
- Riesgo de alucinacion: no hay mediciones especificas de factualidad mas alla de TruthfulQA (60,67%), un valor que no permite garantizar fiabilidad factual. GSM8K en 37,00% sugiere debilidad en aritmetica de varios pasos.
- Formato y protocolo fragiles: el bloque de identidad de los metadatos GGUF es incorrecto y hay que forzar la plantilla standalone. Anadir un parser de razonamiento tipo Qwen3 provoca mala clasificacion de respuestas (el autor recupero 33 respuestas inicialmente perdidas al retirarlo).
- Perdida de funciones en la conversion: la conversion estandar a GGUF excluye MTP y la ruta de memoria condicional personalizada del modelo original, por lo que estos pesos no reproducen el comportamiento completo del upstream.
- Idiomas: no se declaran idiomas soportados y no hay evaluacion en castellano; el uso multilingue requiere validacion propia.
- Resultados no comparables oficialmente: los numeros del autor provienen de evaluadores personalizados y de un protocolo propio; no son resultados de leaderboard y no existe linea base en precision completa ni comparacion con runtime estrictamente identico.
- Reduccion de rechazos en la variante abliterada: el paso de 99/100 a 0/100 en marcadores de rechazo implica menor proteccion ante contenido inapropiado. Esta ficha describe la version original, pero conviene tenerlo en cuenta al elegir variante, y en cualquier caso se necesitan controles de comportamiento propios.
- Licencia: Apache-2.0 heredada del upstream, lo que en principio permite uso comercial, pero el entrenamiento y los derechos del modelo fuente pertenecen a sus autores originales. Revisar `LICENSE` antes de explotarlo.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento del registro, sin senales de comunidad que permitan contrastar su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bowmanslayer/VeriLoop-E2-GGUF
- Modelo base: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Revision fija del modelo base: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2/tree/9379d199adcc44acdf836558037163878e3a37ae
- Ficheros de evaluacion citados en la model card: `EVALUATION.md`, `evaluation.json`, `HISTORICAL-COMPARISON.md`, `evaluation-items.json`, `evaluation-question-indices.json`, `evaluation-refusal-items.json`, `release.json`, `SHA256SUMS` (todos dentro del repositorio de HuggingFace)
- Paper, blog, repositorio de codigo o demo oficiales: no disponibles en la informacion proporcionada. Los resultados de busqueda web suministrados no guardan relacion con el modelo (corresponden a conversores de audio) y se descartan como fuentes.
