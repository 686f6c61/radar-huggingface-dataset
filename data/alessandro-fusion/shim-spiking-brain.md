# Alessandro-fusion/shim-spiking-brain

## Resumen

SHIM (shim-spiking-brain) es una red neuronal de impulsos (spiking neural network) de 561 251 neuronas y 76,7 millones de sinapsis, organizada en 9 áreas corticales y subcorticales, publicada por el usuario Alessandro-fusion en Hugging Face. No es un modelo de lenguaje: no hay transformer, ni tokenizador, ni pesos densos. Cada palabra de una respuesta se selecciona mediante competición entre grupos de neuronas (gana el grupo que más dispara) y el conocimiento factual reside en tablas que las neuronas leen. La interfaz es una chat en italiano, ejecutada localmente con kernels de Triton sobre la GPU integrada de un portátil.

El modelo se presenta como una versión estática, con pesos congelados: puede adquirir hechos nuevos durante una conversación, pero cada arranque reinicia el estado. Su alcance es deliberadamente acotado: unas 2500 palabras italianas, frases cortas de nivel infantil construidas sobre esquemas, razonamiento de dos pasos sobre categorías enseñadas, capacidad de responder "no lo sé" en lugar de inventar, y aritmética básica de sumas y restas hasta diez. Se trata, por tanto, de una pieza de investigación en neurociencia computacional y no de un asistente de propósito general.

Su relevancia es la trazabilidad y el tamaño: el repositorio ocupa 0,1 GB y corre en hardware de consumo sin conexión a internet, con inspección directa de qué neuronas han ganado cada respuesta. Con 0 descargas y 0 likes en el momento de la consulta, y con fecha de creación y actualización del 23 de octubre de 2026, carece por completo de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de impulsos (SNN) de 9 areas; neuronas integra-y-dispara (LIF), constante de tiempo 10 ms, capacidad 250 pF, paso de simulacion 0,1 ms; 80% excitatorias / 20% inhibitorias; 27 grupos funcionales |
| Parametros totales | 561 251 neuronas y 76,7 millones de sinapsis (~134 sinapsis por neurona); no existen parametros densos al estilo transformer |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. No se declara ventana de contexto en tokens; la memoria de trabajo prefrontal se describe como 1000 ensambles de 40 neuronas |
| Tipos de cuantizacion | No disponible. Los pesos estan congelados y no se documentan variantes cuantizadas |
| Idiomas soportados | Italiano unicamente (campo `language: it` en la model card) |
| Licencia | Doble: MIT y CC BY-SA 4.0 (`license: other`, `license_name: mit-and-cc-by-sa-4.0`); no se especifica en la informacion disponible que parte del artefacto cubre cada licencia |
| Formato de pesos | No disponible. El repositorio ocupa 0,1 GB e incluye `shim_mapa.json` con la estructura de areas, grupos y matriz de conectividad 9 x 9; el formato binario de los pesos no se detalla |
| Modelo de lenguaje base | Ninguno: la salida se lee de grupos de neuronas en competicion |
| Interfaz | Chat local en italiano, con panel de inspeccion de neuronas |
| Hardware de referencia | GPU integrada Intel Arc 140V de portatil, con el equipo conectado a la red electrica |

## Arquitectura y entrenamiento

La arquitectura es una simulacion de red de impulsos con neuronas integra-y-dispara como unidad basica (constante de tiempo 10 ms, capacidad 250 pF, paso temporal de 0,1 ms) y una proporcion de 80% excitatorias y 20% inhibitorias. Las 561 251 neuronas se reparten en 9 areas: vista (142 001, 25,3%), prefrontal (114 502, 20,4%), lenguaje (77 958, 13,9%), corteza motora y somatosensorial (70 862, 12,6%), memoria (47 283, 8,4%), parietal (39 620, 7,1%), temporal (31 289, 5,6%), auditiva (29 720, 5,3%) y estructuras profundas como amigdala, accumbens y talamo (8 016, 1,4%). Cada neurona mantiene del orden de 134 sinapsis: aproximadamente la mitad dentro de su propio grupo y la otra mitad de largo alcance, generadas solo por neuronas excitatorias hacia otras areas segun una matriz 9 x 9 de probabilidades derivada de la tractografia del Human Connectome Project y agregada por area. Los retrasos sinapticos son de 0,75 a 1,5 ms dentro del grupo y de unos 5 ms entre areas.

No hay un entrenamiento en el sentido habitual: la model card describe una version estatica con pesos congelados, sin corpus de tokens, sin numero de ejemplos de entrenamiento y sin RLHF ni DPO. El procedimiento con el que se generaron esos pesos iniciales no se especifica en la informacion disponible (la model card aparece truncada en el apartado de sinapsis). Lo que si se documenta es el mecanismo de aprendizaje en sesion, limitado a la adquisicion de hechos declarativos del estilo "X es / tiene / hace Y" y con reinicio en cada arranque.

Como innovaciones destacables, la lectura de la respuesta se hace por competicion entre grupos de neuronas especializados (2486 palabras con 20 neuronas cada una, mas un grupo de silabas), la memoria de trabajo prefrontal incorpora una componente lenta de tipo NMDA, los numeros del 1 al 10 se representan en grupos de 60 neuronas en el area parietal (linea numerica mental) y las emociones se leen de amigdala, accumbens y talamo. Todo el motor de simulacion esta implementado en Triton. La model card declara explicitamente varias reglas escritas a mano: el analizador de frases escolares, las frases hechas (saludos, agradecimientos, nombre del asistente), las palabras funcionales (articulos, preposiciones), la retahila de los numeros y el filtro de memoria de trabajo.

## Capacidades

- Conversacion basica en italiano: 8 de 8 en pruebas internas, con respuestas del tipo "Ciao! Sto bene, sono tranquillo", donde el estado emocional procede de la actividad neuronal y no de una plantilla fija.
- Aprendizaje de conceptos declarativos en sesion ("La volpe mangia la gallina"): 10 de 10, con recuperacion posterior de la relacion.
- Razonamiento de dos pasos sobre categorias ensenadas: 10 de 10, incluyendo inferencias no ensenadas explicitamente ("La balena ha i polmoni? Si, perche e un mammifero").
- Abstencion explicita: 6 de 6 en negaciones ("Il gatto e un pesce? No") y 4 de 5 en preguntas fuera de dominio ("Non lo so").
- Definicion de conceptos ("Cos'e il gatto?") con 10 de 10; explicacion causal del tipo "porque" con 6 de 6.
- Manejo de excepciones y comparaciones ("Il pinguino vola? No") con 4 de 4, y comparaciones de tamano con 5 de 5.
- Recapitulacion de conocimiento y busqueda de rasgos comunes entre dos conceptos: 5 de 5 en ambas pruebas.
- Seguimiento de preguntas encadenadas sobre el mismo tema: 11 de 11.
- Aritmetica verbal hasta diez: sumas 10 de 10, restas 6 de 6, con recitacion de la secuencia numerica intermedia.
- Comparacion de magnitudes numericas: 100% de acierto en numeros lejanos y 90% en numeros proximos.
- Sin soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso general, vision, audio, modo thinking ni generacion de texto libre.
- Inspeccion interpretativa: la interfaz permite visualizar que neuronas han ganado y que concepto las ha activado.

## Casos de uso

- Divulgacion de neurociencia computacional en aulas y ferias cientificas: el panel de inspeccion muestra, respuesta a respuesta, que grupo neuronal ha ganado y que concepto lo ha impulsado. Es util porque convierte un modelo abstracto de SNN en una demostracion observable en tiempo real sobre un portatil.
- Banco de pruebas reproducible para investigacion en redes de impulsos: con 0,1 GB de repositorio y una matriz de conectividad explicita en `shim_mapa.json`, permite experimentar con memoria de trabajo basada en NMDA, linea numerica mental y dinamica excitatoria/inhibitoria sin infraestructura de GPU dedicada.
- Estudio de calibracion y abASTENCION en sistemas conversacionales: el modelo responde "no lo se" ante preguntas fuera de dominio (4 de 5) y niega hechos falsos (6 de 6), lo que lo convierte en una linea base para investigar comportamientos de abASTENCION sin el ruido de un LLM generativo.
- Demostracion educativa de aprendizaje supervisado estilo escolar: el flujo "enseno un hecho, pregunto el hecho" (10 de 10) permite ilustrar en clase la diferencia entre conocimiento en tablas y conocimiento en pesos, con la limitacion explicita de que el aprendizaje se pierde al reiniciar.
- Prototipado de interfaces de lectura neuronal (read-out): el mecanismo de competicion entre grupos de 20 neuronas por palabra y grupos de silabas sirve como punto de partida para probar decodificadores alternativos en arquitecturas neuromorficas.
- Evaluacion comparativa de kernels en Triton sobre GPU integrada: el modelo es una carga de trabajo de SNN real que corre en una Intel Arc 140V a 0,5x del tiempo real, util para medir el rendimiento de kernels de sinapsis dispersas en hardware de consumo.
- Escenario sin conectividad ni servicios externos: al ejecutarse integramente en local, encaja en entornos con requisitos de aislamiento de red, siempre que el caso de uso acepte italiano, frases cortas y un dominio de unas 2500 palabras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. El autor unicamente reporta pruebas internas de comportamiento, con la prediccion escrita antes de cada prueba y los veredictos, incluidos los negativos, en `PROVE_SHIM.md`. Se reproducen a continuacion tal cual, sin verificacion independiente:

| Prueba interna | Ejemplo | Resultado declarado |
|---|---|---|
| Conversacion basica | "Ciao, come stai?" → "Ciao! Sto bene, sono tranquillo." | 8/8, ~1 s |
| Aprender conceptos escolares | "La volpe mangia la gallina." → "Cosa mangia la volpe?" | 10/10 |
| Razonamiento en dos pasos | "La balena ha i polmoni?" → "Si, perche e un mammifero." | 10/10 |
| Negar hechos falsos | "Il gatto e un pesce?" → "No." | 6/6 |
| Admitir desconocimiento | "Cos'e il governo?" → "Non lo so." | 4/5 |
| Definir un concepto | "Cos'e il gatto?" → "Il gatto e un mammifero." | 10/10 |
| Explicar el porque | "Perche il cavallo ha il pelo?" → "Perche e un mammifero." | 6/6 |
| Excepciones | "Il pinguino vola?" → "No." | 4/4 |
| Comparar tamanos | "E piu grande l'elefante o il topo?" | 5/5 |
| Recapitular conocimiento | "Cosa sai del gatto?" | 5/5 |
| Rasgos comunes | "Cosa hanno in comune l'aquila e il pinguino?" | 5/5 |
| Preguntas encadenadas | "Cos'e il coniglio?" … "Cosa mangia?" | 11/11 |
| Hablar de un tema | "Il cerchio?" | 28/30 sobre el tema |
| Sumas hasta diez | "Quanto fa tre piu due?" → "Fa cinque." | 10/10 |
| Restas hasta diez | No detallado | 6/6 |
| Comparar numeros | "E piu grande il sei o il nove?" | 100% lejanos, 90% proximos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, pero no se publica el consumo de memoria en ejecucion del estado de 561 251 neuronas y 76,7 millones de sinapsis.
- GPU recomendadas: no documentadas. El unico hardware reportado por el autor es una GPU integrada Intel Arc 140V de portatil, con el equipo enchufado a la red electrica.
- Cabe en GPU de consumo: si, segun el autor, hasta el punto de ejecutarse en una iGPU de portatil. No hay datos para RTX 4090, A100, H100 ni otras GPU dedicadas.
- Opciones de despliegue: runtime propio en Python con kernels de Triton y chat local. No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no expone pesos transformers ni un tokenizador.
- Latencia: respuestas de frase hecha en torno a 1 s; preguntas sobre conceptos, 4-5 s. La velocidad global declarada es 0,5x del tiempo real en la Intel Arc 140V.
- Throughput: no disponible (no se reportan respuestas por segundo ni impulsos por segundo).
- Conectividad: no requiere internet ni servicios externos.

## Comparativa con modelos similares

No se ha localizado en la informacion disponible otro modelo comparable de la misma categoria (SNN conversacional en italiano con lectura por competicion de grupos neuronales). Como referencia de la familia de modelos inspirados en impulsos, se compara con SpikingBrain-7B (BICLab), que es un proyecto distinto y con un planteamiento tecnico diferente:

| Caracteristica | SHIM (shim-spiking-brain) | SpikingBrain-7B (BICLab) |
|---|---|---|
| Naturaleza | SNN de 9 areas con lectura por competicion; sin modelo de lenguaje | Familia de modelos de gran escala inspirados en el cerebro, con atencion hibrida eficiente, MoE y codificacion de impulsos |
| Parametros | 561 251 neuronas, 76,7 M de sinapsis | 7B (segun el nombre del repositorio); numero de parametros activos no disponible |
| Longitud de contexto | No disponible | Orientado a contexto largo; cifra exacta no disponible |
| Entrenamiento | Pesos congelados; aprendizaje declarativo solo en sesion | Preentrenamiento continuado con menos del 2% de los datos, con pipeline de conversion desde el ecosistema open source |
| Benchmarks | Pruebas internas de comportamiento (ver tabla anterior); sin benchmarks estandar | Reporta 69,15% de esparsidad y rendimiento comparable a modelos open source convencionales; cifras por benchmark no disponibles en la informacion consultada |
| Idiomas | Italiano | No disponible |
| Licencia | MIT + CC BY-SA 4.0 | No disponible en la informacion consultada |
| Disponibilidad | Hugging Face, 0 descargas y 0 likes | arXiv 2509.05276 y repositorio GitHub BICLab/SpikingBrain-7B |
| Hardware | GPU integrada de portatil | No disponible; el trabajo enfatiza operacion de baja potencia |

Frente a un LLM pequeno convencional, la diferencia relevante no es de rendimiento sino de categoria: SHIM no genera texto libre y su conocimiento esta en tablas, por lo que no admite comparacion directa en MMLU ni en tareas de generacion abierta.

## Limitaciones y advertencias

- No es un asistente tipo ChatGPT: conoce unas 2500 palabras italianas y produce frases breves de nivel infantil construidas sobre esquemas. No lee textos largos ni escribe textos.
- El razonamiento solo opera sobre hechos ensenados en la forma "X es / tiene / hace Y"; fuera de ese esquema no hay inferencia.
- La knowledge reside en tablas leidas por las neuronas, no en las sinapsis. El propio autor lo senala como el limite mas importante del diseno.
- Varios componentes son reglas escritas a mano y declaradas: el analizador de frases escolares, las frases hechas, las palabras funcionales, la retahila de los numeros y el filtro de memoria de trabajo. El merito cognitivo de esas partes no es atribuible a la dinamica neuronal.
- Pesos congelados: lo aprendido durante una conversacion se pierde en cada arranque, lo que invalida cualquier uso que requiera memoria persistente.
- Idioma unico (italiano) y sin pipeline declarado en Hugging Face; la integracion en aplicaciones existentes exige adaptar el runtime propio basado en Triton.
- Riesgo de alucinacion bajo por diseno (abASTENCION en 4 de 5 casos fuera de dominio), pero persisten errores por el esquema cerrado de respuesta y por el filtrado de la memoria de trabajo; una de cada cinco preguntas fuera de dominio no se reconocio como desconocida.
- Todos los resultados son autoinformados, sin replicacion independiente, y el modelo tiene 0 descargas y 0 likes, con creacion y actualizacion en la misma fecha. No hay evidencia externa de calidad.
- Licencia doble MIT y CC BY-SA 4.0: la componente CC BY-SA impone atribucion y compartir igual sobre las obras derivadas, lo que puede condicionar el uso comercial o el relicenciamiento. La informacion disponible no detalla que parte del artefacto cubre cada licencia, por lo que conviene verificar `LICENSE` antes de integrarlo en un producto.
- La model card consultada esta truncada en la seccion sobre sinapsis, por lo que faltan detalles de plasticidad y de generacion de pesos.
- El rendimiento solo esta medido en una Intel Arc 140V; no hay datos de latencia ni de comportamiento en otras GPU, ni garantia de que los kernels de Triton funcionen sin ajustes en otros backends.
- La fecha declarada del repositorio (23 de octubre de 2026) y la ausencia de comunidad implican que no existe historial de errores corregidos ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alessandro-fusion/shim-spiking-brain
- Registro de pruebas declarado por el autor (`PROVE_SHIM.md`, referenciado en la model card): https://huggingface.co/Alessandro-fusion/shim-spiking-brain/blob/main/PROVE_SHIM.md
- Mapa de areas, grupos y conectividad (`shim_mapa.json`, referenciado en la model card): https://huggingface.co/Alessandro-fusion/shim-spiking-brain/blob/main/shim_mapa.json
- Licencia (`LICENSE`, referenciada en la model card): https://huggingface.co/Alessandro-fusion/shim-spiking-brain/blob/main/LICENSE
- Referencia externa sobre redes de impulsos a gran escala, proyecto distinto no relacionado con SHIM: SpikingBrain Technical Report, https://arxiv.org/abs/2509.05276
- Version HTML del mismo informe: https://arxiv.org/html/2509.05276v1
- Repositorio del proyecto SpikingBrain (BICLab): https://github.com/BICLab/SpikingBrain-7B
- Pagina del paper en Hugging Face Papers: https://huggingface.co/papers/2509.05276
- Copia en PDF del informe: https://noticias.ai/wp-content/uploads/2025/09/2509.05276v1.pdf
