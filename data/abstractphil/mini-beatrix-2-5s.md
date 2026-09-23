# AbstractPhil/mini-beatrix-2.5s

## Resumen

mini-beatrix-2.5s es un paquete de pesos publicado por AbstractPhil que contiene el núcleo del modelo mini-beatrix-2s (237.908.285 parámetros, modelo byte-level de "splat" completo) junto con una biblioteca de *arms* desmontables: cabezas adaptadoras pequeñas, direccionadas mediante un mecanismo denominado aleph, que se entrenaron sobre ese núcleo congelado. El núcleo no se ha reentrenado: la model card afirma que sus pesos son bit-idénticos a los de mini-beatrix-2s y que el paquete lo verifica en cada carga (detach exacto). El modelo base completó su entrenamiento de 16.101B tokens el 2026-08-31.

El rasgo diferencial es que el modelo lee bytes UTF-8 en crudo: los `input_ids` son valores de byte entre 0 y 255 y no existe tokenizador que descargar. La arquitectura combina atención lineal y splat attention en un transformer byte-level, y el paquete se distribuye con `custom_code`, por lo que requiere `trust_remote_code=True` para cargarse con Transformers.

Su relevancia es fundamentalmente de investigación: el repositorio incluye 13 filas de adaptadores sobre 11 ficheros de pesos, cada una con su receta de entrenamiento (*cell*) y su estado de reproducibilidad (asentado con 2 semillas o candidato), y la model card indica que la biblioteca completa de unas 80 arms entrenadas vive en el repositorio de entrenamiento. No es un modelo orientado a producción generalista: es una plataforma para estudiar adaptadores acoplados y desacoplables sobre un núcleo byte-level congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer byte-level con linear attention y splat attention (nucleo "full-splat") mas cabezas adaptadoras desmontables (*arms*) direccionadas por aleph |
| Parametros totales | 237.908.285 (~237 M), dato de safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se documentan versiones cuantizadas (fp8, int4, GGUF, etc.) |
| Idiomas soportados | en (ingles); al ser byte-level puede procesar cualquier UTF-8, pero el entrenamiento declarado es solo en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors; requiere `custom_code` / `trust_remote_code=True` |
| Modelo base | AbstractPhil/mini-beatrix-2s (finetune) |
| Tamano del repositorio | 0,9 GB |
| Tokens de entrenamiento del nucleo | 16.101B (finalizado el 2026-08-31) |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El núcleo es un modelo byte-level de 237 M de parámetros descrito como "full-splat", con linear attention y splat attention entre sus etiquetas técnicas. Al operar sobre bytes en lugar de tokens, la entrada son valores 0-255 y no hay vocabulario ni tokenizador asociado. Sobre ese núcleo congelado se montan *arms*: cabezas de parche pequeñas, direccionadas por un mecanismo llamado aleph, que se acoplan en tiempo de ejecución mediante `mount_arm()` y se retiran con `detach_arm()`, restaurando el núcleo con logits bit-idénticos a los originales.

El núcleo completó una misión de entrenamiento de 16.101B tokens el 2026-08-31. Los adaptadores se entrenaron en campañas separadas con recetas identificadas por nombre de *cell* (L1, DIAL, E-I, C1, ECO/L4, E-D0) y en la mayoría de los casos se replicaron con una segunda semilla; cada fila incluye su tasa de acierto medida, el "coste" en bits por byte (bpb) sobre texto general y el estado de reproducibilidad. La model card indica que los adaptadores se entrenaron contra exactamente este núcleo congelado y que, al producir logits bit-idénticos bajo decodificación greedy, las métricas almacenadas se reproducen sin necesidad de volver a medirlas. El paquete incluye composiciones de varias arms mediante *stack* (aplicación siempre activa sin mezclador), *routed* (despacho denso con signo y ganancia ligada al uso reciente) y esquemas de dos etapas (ECO/L4).

## Capacidades

- Generación de texto byte-level en inglés a partir de bytes UTF-8 en crudo, sin tokenizador.
- Lectura de reglas lógicas if-then sobre palabras inventadas y respuesta con la conclusión (arms `rules`, `rules-seed1`, `rules-minted`, `rules-minted-seed1`), con aciertos medidos entre 0,560 y 0,960 según conjunto y semilla.
- Encadenamiento explícito de pasos de razonamiento: el arm `chain` escribe cada paso ("So Wren is …") con una puntuación medida de 0,867; `chain-plain`, entrenado sin término de abstención, alcanza 0,887.
- Control de turno: los arms `stop`, `stop-seed1` y `eco-stop` terminan la respuesta con una línea en blanco en lugar de continuar; la tasa de parada limpia medida va de 0,83 a 1,00.
- Composición de adaptadores: `pair` y `eco-pair` aplican dos arms simultáneamente (cadena + fin de turno) con resultados medidos de 0,860/0,973 y 0,853/0,953 respectivamente.
- Despacho enrutado con ganancia dependiente del uso: `routed-gain` puntúa 0,813 en la tarea de cadena (estado "candidate", una dimensión abierta).
- Aislamiento exacto del núcleo: con todos los miembros de un arm desactivados (`h.all_off()`), se recuperan los logits del núcleo desnudo.
- No se documentan soporte de tool calling, function calling, capacidades de agente multi-paso, visión ni audio.
- Multilingüismo: no declarado; el modelo está etiquetado únicamente como `en`.

## Casos de uso

- Investigación en arquitecturas byte-level: permite estudiar el comportamiento de un transformer de 237 M que consume bytes en lugar de tokens, sin vocabulario intermedio, útil para analizar robustez ante ruido, texto mal formado o secuencias binarias.
- Estudio de atención lineal y splat attention: al ser un núcleo "full-splat" con linear attention, sirve como banco de pruebas reproducible para comparar coste y calidad frente a atención cuadrática en modelos pequeños.
- Experimentación con adaptadores desmontables: el paquete permite montar y desmontar cabezas sobre un núcleo congelado y verificar que el desmontaje es bit-exacto, un caso de uso directo para investigar acoplamiento y olvido catastrófico en adaptadores.
- Evaluación de composición de adaptadores: los arms `pair`, `eco-pair` y `routed-gain` permiten medir si dos cabezas entrenadas por separado se combinan sin degradarse, con métricas de cadena, fin de turno y coste en bpb sobre texto general.
- Control de fin de turno en diálogos experimentales: los arms `stop` y `eco-stop` (tasa de parada limpia hasta 1,00) sirven para prototipar política de terminación en un modelo byte-level, evitando que la generación divague.
- Razonamiento simbólico de alcance corto: los arms de reglas resuelven deducciones encadenadas sobre un léxico reducido, un escenario útil para evaluar seguimiento de instrucciones y generalización a palabras no vistas en modelos muy pequeños.
- Despliegue educativo en hardware de consumo: con ~237 M de parámetros, el modelo se puede ejecutar en portátil o incluso en CPU para demostraciones de generación byte-level y de montaje/desmontaje de adaptadores.
- Base para experimentos de cuantización y medición de degradación: al tener un núcleo congelado y mediciones de referencia por arm, sirve para cuantificar cuánta precisión se pierde al comprimir un modelo byte-level pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas proporcionadas son las mediciones internas del *harness* de la campaña de entrenamiento para cada arm, que la model card declara transferibles al paquete porque los logits son bit-idénticos.

| Arm | Tarea | Metrica | Coste en texto general | Receta | Estado |
|---|---|---|---|---|---|
| rules | leer 5 reglas if-then y responder solo la palabra final | 0,640 palabras no vistas; 0,960 las ocho originales | no disponible | L1 | asentado (2 semillas) |
| rules-seed1 | idem, otra semilla | 0,673 no vistas; 0,907 las ocho originales | no disponible | L1 | asentado (2 semillas) |
| rules-minted | respuesta solo con la palabra final sobre léxico de 216 palabras | 0,707 palabras acuñadas; 0,947 las ocho; 0,560 no vistas | no disponible | DIAL (pair rate 0,50, quiet weight 2) | asentado (2 semillas) |
| rules-minted-seed1 | idem, segunda semilla | 0,647 acuñadas; 0,593 no vistas | 0,0066 bpb | DIAL | asentado (2 semillas) |
| chain | escribir cada paso de la cadena | 0,867 | 0,003 bpb | E-I | asentado (2 semillas) |
| chain-plain | idem, sin término de abstención | 0,887 | no disponible | C1 | asentado (2 semillas) |
| eco-chain | cadena cargada y reentrenada junto a un arm de fin de turno | 0,833 en solitario; 0,853 en pareja | 0,0054 bpb | ECO / L4 | asentado (2 semillas) |
| stop | terminar el turno con línea en blanco | parada limpia 0,83 (segunda semilla 1,00) | no disponible | E-I | asentado (2 semillas) |
| stop-seed1 | idem, segunda semilla | parada limpia 1,00 | no disponible | E-I | asentado (2 semillas) |
| eco-stop | fin de turno de la segunda etapa, con término de abstención | 0,953 fin de turno en pareja; 1,00 en chat | no disponible | ECO / L4 | asentado (2 semillas) |
| routed-gain | despacho denso con signo y ganancia por uso | 0,813 cadena (semilla 1: 0,787) | no disponible | E-D0 | candidato (forma conservada inestable entre semillas) |
| pair | cadena + fin de turno siempre activos, sin mezclador | 0,860 cadena; 0,973 fin de turno; 1,00 tasa de parada | no disponible | E-I | asentado (2 semillas) |
| eco-pair | pareja coentrenada por etapas, aplicada junta | 0,853 cadena; 0,953 fin de turno | no disponible | ECO / L4 | asentado (2 semillas) |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 237,9 M de parámetros; no confirmada por el autor): ~0,95 GB en fp32, ~0,48 GB en fp16/bf16, ~0,24 GB en int8 y ~0,12 GB en int4, más el *overhead* del runtime.
- El repositorio ocupa 0,9 GB, coherente con pesos sin cuantizar.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 2 GB o más de VRAM (GTX 1050 Ti, RTX 3050, RTX 3060, RTX 4090) es suficiente; también es viable en CPU para pruebas.
- GPU profesionales (A100, H100) no aportan ventaja práctica por tamaño, salvo para ejecución en lote a gran escala.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`, que es el camino documentado en la model card. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI: al depender de `custom_code` y no distribuir GGUF, estos backends no están soportados de forma verificada.
- Latencia y throughput: no disponibles. Como referencia estructural, al ser byte-level cada carácter ASCII consume un paso de decodificación, de modo que una palabra de 5-6 letras requiere 5-6 pasos, con el coste de inferencia que eso implica frente a un modelo con tokenizador.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos externos comparables en la información proporcionada, por lo que la comparación con alternativas de terceros queda como no disponible. La única comparación verificable es contra el propio modelo base.

| Modelo | Parametros | Nucleo | Adaptadores | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mini-beatrix-2.5s | 237,9 M | bit-identico a mini-beatrix-2s | 13 filas / 11 ficheros de pesos incluidos | no disponible | MIT | HuggingFace, `custom_code` |
| mini-beatrix-2s | 237,9 M (mismo nucleo) | nucleo original | no incluidos en el paquete | no disponible | MIT | HuggingFace |
| Otros modelos byte-level o de ~237 M | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: 0 descargas y 0 *likes* en el momento de la consulta, sin validación externa independiente de las métricas declaradas.
- Todas las cifras de rendimiento proceden del *harness* propio de la campaña de entrenamiento y se trasladan al paquete sin remedición; el argumento de transferibilidad se apoya en la identidad bit a bit de los logits, no en una evaluación por terceros.
- Idioma: solo inglés declarado. Aunque el formato byte-level permite introducir cualquier UTF-8, no hay garantía de calidad fuera del inglés.
- Longitud de contexto: no documentada. No hay información sobre la ventana máxima soportada, lo que impide planificar usos con contexto largo.
- Riesgo de alucinación: no cuantificado. En un modelo de 237 M orientado a tareas acotadas, la generación libre de texto es previsiblemente débil y propensa a divagar; el propio paquete incluye arms específicos para forzar el fin de turno, lo que sugiere que la generación sin control no termina de forma fiable.
- Comportamiento fuera de dominio: la model card advierte que `chain-plain` escribe cadenas también sobre texto fuera de dominio por haberse entrenado sin término de abstención; los arms con abstención (`chain`, `stop`, `eco-stop`) están pensados para mitigar esto.
- Estado "candidate" en `routed-gain`: una de sus dimensiones sigue abierta y su forma conservada es inestable entre semillas; no debería tratarse como resultado consolidado.
- Ejecución de código remoto: el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio en la máquina local. Es un riesgo de seguridad que debe evaluarse antes de usarlo en entornos compartidos o de producción.
- Sin versiones cuantizadas ni GGUF publicadas: no hay una ruta sencilla para despliegue con llama.cpp, Ollama u otros runtimes de inferencia ligeros.
- Licencia MIT: permite uso comercial y modificación con atribución, pero al tratarse de un artefacto de investigación con métricas no auditadas externamente, no se recomienda su uso en producción sin una evaluación propia.
- Sesgos: no hay información disponible sobre composición del dataset de entrenamiento, filtrado de datos ni evaluación de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbstractPhil/mini-beatrix-2.5s
- Modelo base: https://huggingface.co/AbstractPhil/mini-beatrix-2s
- Repositorio de entrenamiento con la biblioteca completa de ~80 arms: mencionado en la model card, URL no disponible.
- Paper o informe técnico: no disponible.
- Demo: no disponible.
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo; los enlaces devueltos corresponden a páginas de tarjetas bancarias y a un modelo de difusión no relacionado (BeatriXL-O), por lo que se descartan como fuentes.
